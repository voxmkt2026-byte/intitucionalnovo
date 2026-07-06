import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const DATABASE_URL = process.env.DATABASE_URL || "";
const JWT_SECRET   = new TextEncoder().encode(
  process.env.JWT_SECRET || "titanium-admin-secret-2024-change-in-prod"
);

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) throw new Error("Unauthorized");
  await jwtVerify(token, JWT_SECRET);
}

async function getDb() {
  if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");
  return neon(DATABASE_URL);
}

// PUT — atualiza carta
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin();
    const { id } = await params;
    const body = await request.json();
    const {
      segmento, administradora, valor_credito, entrada,
      parcelas, valor_parcela, proximo_vencimento, disponivel,
    } = body;

    const sql = await getDb();
    const result = await sql`
      UPDATE cartas_contempladas SET
        segmento           = COALESCE(${segmento},           segmento),
        administradora     = COALESCE(${administradora},     administradora),
        valor_credito      = COALESCE(${valor_credito ? parseFloat(valor_credito) : null}, valor_credito),
        entrada            = COALESCE(${entrada != null ? parseFloat(entrada) : null}, entrada),
        parcelas           = COALESCE(${parcelas ? parseInt(parcelas) : null},     parcelas),
        valor_parcela      = COALESCE(${valor_parcela ? parseFloat(valor_parcela) : null}, valor_parcela),
        proximo_vencimento = COALESCE(${proximo_vencimento ?? null}, proximo_vencimento),
        disponivel         = COALESCE(${disponivel != null ? disponivel : null},   disponivel),
        atualizado_em      = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (!result[0]) {
      return NextResponse.json({ error: "Carta não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ data: result[0] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    if (msg === "Unauthorized") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    console.error("[admin/cartas PUT]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE — soft delete (disponivel = false)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin();
    const { id } = await params;
    const sql = await getDb();
    await sql`
      UPDATE cartas_contempladas
      SET disponivel = false, atualizado_em = NOW()
      WHERE id = ${parseInt(id)}
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    if (msg === "Unauthorized") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
