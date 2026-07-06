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
  const sql = neon(DATABASE_URL);
  await sql`
    CREATE TABLE IF NOT EXISTS cartas_contempladas (
      id                 SERIAL PRIMARY KEY,
      segmento           TEXT NOT NULL,
      administradora     TEXT NOT NULL,
      valor_credito      DECIMAL(12,2) NOT NULL,
      entrada            DECIMAL(12,2),
      parcelas           INTEGER NOT NULL,
      valor_parcela      DECIMAL(10,2) NOT NULL,
      proximo_vencimento DATE,
      disponivel         BOOLEAN DEFAULT true,
      criado_em          TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em      TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  return sql;
}

// GET — lista todas (admin vê disponíveis e indisponíveis)
export async function GET() {
  try {
    await verifyAdmin();
    const sql = await getDb();
    const rows = await sql`
      SELECT * FROM cartas_contempladas ORDER BY criado_em DESC
    `;
    return NextResponse.json({ data: rows });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}

// POST — cria nova carta
export async function POST(request: Request) {
  try {
    await verifyAdmin();
    const body = await request.json();
    const {
      segmento, administradora, valor_credito, entrada,
      parcelas, valor_parcela, proximo_vencimento, disponivel = true,
    } = body;

    if (!segmento || !administradora || !valor_credito || !parcelas || !valor_parcela) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const sql = await getDb();
    const result = await sql`
      INSERT INTO cartas_contempladas
        (segmento, administradora, valor_credito, entrada, parcelas, valor_parcela, proximo_vencimento, disponivel)
      VALUES
        (${segmento}, ${administradora}, ${parseFloat(valor_credito)},
         ${entrada ? parseFloat(entrada) : null}, ${parseInt(parcelas)},
         ${parseFloat(valor_parcela)}, ${proximo_vencimento || null}, ${disponivel})
      RETURNING *
    `;
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    if (msg === "Unauthorized") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    console.error("[admin/cartas POST]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
