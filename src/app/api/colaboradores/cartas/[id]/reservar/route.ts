import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyColaboradorRequest } from "@/lib/colaborador-auth";

const DATABASE_URL = process.env.DATABASE_URL || "";

const reservaSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(100),
  phone: z.string().trim().min(8, "Telefone inválido").max(20),
  email: z.union([z.string().email().trim().toLowerCase(), z.literal("")]).default(""),
  city: z.string().trim().max(100).default(""),
  obs: z.string().trim().max(1000).default(""),
}).passthrough();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifyColaboradorRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Sessão expirada. Faça login novamente para prosseguir." }, { status: 401 });
    }

    const [{ id }, body] = await Promise.all([
      context.params,
      request.json().catch(() => ({})),
    ]);

    const parsed = await reservaSchema.safeParseAsync(body);
    const cartaId = Number(id);
    const afiliadoId = Number(session.id);

    if (!Number.isInteger(cartaId) || cartaId <= 0) {
      return NextResponse.json({ error: "Cota inválida." }, { status: 400 });
    }
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados do cliente inválidos." }, { status: 400 });
    }

    if (!DATABASE_URL) {
      console.error("[cartas/reservar] DATABASE_URL não configurada");
      return NextResponse.json({ error: "Erro de configuração de banco de dados no servidor." }, { status: 500 });
    }

    const sql = neon(DATABASE_URL);
    const { name, phone, email, city, obs } = parsed.data;

    // 1. Atualiza o status da cota na vitrine para indisponível
    const cartaUpdate = await sql`
      UPDATE cartas_contempladas
      SET disponivel = FALSE
      WHERE id = ${cartaId} AND disponivel = TRUE
      RETURNING id, segmento, administradora, valor_credito, entrada
    `;

    if (cartaUpdate.length === 0) {
      return NextResponse.json(
        { error: "Esta cota já foi reservada ou não está mais disponível na vitrine." },
        { status: 409 }
      );
    }

    const carta = cartaUpdate[0];
    const valorCreditoText = Number(carta.valor_credito).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const valorEntradaText = carta.entrada ? Number(carta.entrada).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "A definir";
    const refCode = String(session.codigo_ref || "");

    // 2. Registra o lead blindado no pipeline central do banco Postgres
    const leadInsert = await sql`
      INSERT INTO leads (
        name, email, phone, segment, credit, plan, origin, ref, lp, source_url, status, created_at
      ) VALUES (
        ${name},
        ${email || ""},
        ${phone},
        ${carta.segmento || "Imóveis"},
        ${valorCreditoText},
        ${(carta.administradora || "Consórcio") + " (Entrada: " + valorEntradaText + ")"},
        'Portal do Colaborador - Reserva Confirmada',
        ${refCode},
        'portal',
        '/representante/portal',
        'Reserva Confirmada',
        NOW()
      )
      RETURNING id
    `;

    const leadId = leadInsert[0]?.id;

    // 3. Tenta registrar na tabela cartas_reservas (resiliente)
    try {
      if (Number.isInteger(afiliadoId)) {
        await sql`
          INSERT INTO cartas_reservas (
            carta_id, afiliado_id, lead_id, cliente_nome, cliente_telefone,
            cliente_email, cliente_cidade, observacoes
          ) VALUES (
            ${cartaId}, ${afiliadoId}, ${leadId || null}, ${name}, ${phone},
            ${email || null}, ${city || null}, ${obs || null}
          )
        `;
      }
    } catch (errReserva) {
      console.warn("[cartas/reservar] Tabela cartas_reservas indisponível ou em migração (reserva gravada no lead):", errReserva);
    }

    return NextResponse.json(
      {
        ok: true,
        reserva: {
          id: leadId,
          carta_id: cartaId,
          lead_id: leadId,
          cliente_nome: name,
          ref: refCode,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[colaboradores/cartas/reservar] falha interna:", errorMsg);
    return NextResponse.json({ error: `Não foi possível concluir a reserva: ${errorMsg}` }, { status: 500 });
  }
}
