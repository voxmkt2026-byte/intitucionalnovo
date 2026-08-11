import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyColaboradorRequest } from "@/lib/colaborador-auth";

const DATABASE_URL = process.env.DATABASE_URL || "";

const reservaSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(8).max(20),
  email: z.union([z.email().trim().toLowerCase(), z.literal("")]).default(""),
  city: z.string().trim().max(100).default(""),
  obs: z.string().trim().max(1000).default(""),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifyColaboradorRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
    }

    const [{ id }, parsed] = await Promise.all([
      context.params,
      reservaSchema.safeParseAsync(await request.json()),
    ]);
    const cartaId = Number(id);
    const afiliadoId = Number(session.id);
    if (!Number.isInteger(cartaId) || cartaId <= 0 || !Number.isInteger(afiliadoId)) {
      return NextResponse.json({ error: "Cota inválida." }, { status: 400 });
    }
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
    }
    if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");

    const sql = neon(DATABASE_URL);
    const { name, phone, email, city, obs } = parsed.data;
    const rows = await sql`
      WITH carta_reservada AS (
        UPDATE cartas_contempladas
        SET disponivel = FALSE, atualizado_em = NOW()
        WHERE id = ${cartaId} AND disponivel = TRUE
        RETURNING id, segmento, administradora, valor_credito, entrada
      ), lead_criado AS (
        INSERT INTO leads (name, email, phone, segment, credit, plan, origin, ref, lp, source_url, status)
        SELECT
          ${name}, ${email}, ${phone}, segmento, valor_credito::text,
          administradora || ' (Entrada: R$ ' || entrada::text || ')',
          'Portal do Colaborador - Reserva Confirmada', ${session.codigo_ref}, 'portal',
          '/colaboradores/portal', 'Reserva Confirmada'
        FROM carta_reservada
        RETURNING id
      )
      INSERT INTO cartas_reservas (
        carta_id, afiliado_id, lead_id, cliente_nome, cliente_telefone,
        cliente_email, cliente_cidade, observacoes
      )
      SELECT carta_reservada.id, ${afiliadoId}, lead_criado.id, ${name}, ${phone},
             ${email || null}, ${city || null}, ${obs || null}
      FROM carta_reservada CROSS JOIN lead_criado
      RETURNING id, carta_id, lead_id, criado_em
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Esta cota já foi reservada por outro colaborador. Atualize o estoque." },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true, reserva: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("[colaboradores/cartas/reservar] falha:", error);
    return NextResponse.json({ error: "Não foi possível concluir a reserva." }, { status: 500 });
  }
}
