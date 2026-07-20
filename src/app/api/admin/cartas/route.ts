import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAdminSession } from "@/lib/admin-auth";
import { parseBRLNumber } from "@/lib/excel-parser";

const DATABASE_URL = process.env.DATABASE_URL || "";

async function verifyAdmin() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) throw new Error("Unauthorized");
}

async function getDb() {
  if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");
  const sql = neon(DATABASE_URL);
  
  try {
    // Migration: garantir colunas das 7 colunas da planilha
    await sql`ALTER TABLE cartas_contempladas ADD COLUMN IF NOT EXISTS taxa_transferencia TEXT`;
    await sql`ALTER TABLE cartas_contempladas ADD COLUMN IF NOT EXISTS vencimento_parcela TEXT`;
    await sql`ALTER TABLE cartas_contempladas ADD COLUMN IF NOT EXISTS observacoes TEXT`;
    await sql`ALTER TABLE cartas_contempladas ALTER COLUMN proximo_vencimento TYPE TEXT USING proximo_vencimento::text`;
  } catch (mErr) {
    console.warn("[admin/cartas getDb migration warning]", mErr);
  }

  return sql;
}

// GET — lista todas as cartas com as 7 colunas completas
export async function GET() {
  try {
    await verifyAdmin();
    const sql = await getDb();
    const rows = await sql`
      SELECT 
        id, segmento, administradora, valor_credito, entrada,
        parcelas, valor_parcela, proximo_vencimento, disponivel,
        taxa_transferencia, vencimento_parcela, observacoes, criado_em
      FROM cartas_contempladas
      ORDER BY id DESC
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    if (msg === "Unauthorized") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    console.error("[admin/cartas GET]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST — cria nova carta ou faz inserção em lote (bulk)
export async function POST(request: Request) {
  try {
    await verifyAdmin();
    const sql = await getDb();
    const body = await request.json();

    // Inserção em lote (Spreadsheet upload)
    if (body.bulk && Array.isArray(body.cartas)) {
      const cartas = body.cartas;
      
      // Se replace = true, limpa o banco antes de inserir
      if (body.replace === true) {
        await sql`DELETE FROM cartas_contempladas`;
      }

      let insertedCount = 0;
      for (const item of cartas) {
        try {
          const segmento = item.segmento || "imoveis";
          const administradora = item.administradora || "Outra";
          const valor_credito = parseBRLNumber(item.valor_credito ?? item.credito);
          const entrada = parseBRLNumber(item.entrada);
          const parcelas = parseInt(String(item.parcelas || 0).replace(/\D/g, ""), 10) || 60;
          const valor_parcela = parseBRLNumber(item.valor_parcela ?? item.parcela);
          const taxa_transferencia = String(item.taxa_transferencia || "R$ 0,00");
          const vencimento_parcela = String(item.vencimento_parcela || item.proximo_vencimento || "Dia 10");
          const observacoes = String(item.observacoes || (item.disponivel === false ? "Reservada" : "Disponível"));
          const disponivel = item.disponivel !== false && !observacoes.toLowerCase().includes("reservad");

          if (valor_credito > 0) {
            await sql`
              INSERT INTO cartas_contempladas (
                segmento, administradora, valor_credito, entrada,
                parcelas, valor_parcela, proximo_vencimento, disponivel,
                taxa_transferencia, vencimento_parcela, observacoes
              ) VALUES (
                ${segmento}, ${administradora}, ${valor_credito}, ${entrada},
                ${parcelas}, ${valor_parcela}, ${vencimento_parcela}, ${disponivel},
                ${taxa_transferencia}, ${vencimento_parcela}, ${observacoes}
              )
            `;
            insertedCount++;
          }
        } catch (itemErr) {
          console.error("[admin/cartas POST item error]", itemErr, item);
        }
      }

      return NextResponse.json({ success: true, count: insertedCount });
    }

    // Inserção individual
    const {
      segmento = "imoveis", administradora, valor_credito, entrada,
      parcelas, valor_parcela, proximo_vencimento, disponivel = true,
      taxa_transferencia = "R$ 0,00", vencimento_parcela = "Dia 10", observacoes = "Disponível"
    } = body;

    if (!administradora || !valor_credito || !parcelas || !valor_parcela) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const parsedCredito = parseBRLNumber(valor_credito);
    const parsedEntrada = parseBRLNumber(entrada);
    const parsedParcela = parseBRLNumber(valor_parcela);
    const parsedCount = parseInt(String(parcelas), 10) || 60;
    const vencStr = String(vencimento_parcela || proximo_vencimento || "Dia 10");

    const result = await sql`
      INSERT INTO cartas_contempladas (
        segmento, administradora, valor_credito, entrada,
        parcelas, valor_parcela, proximo_vencimento, disponivel,
        taxa_transferencia, vencimento_parcela, observacoes
      ) VALUES (
        ${segmento}, ${administradora}, ${parsedCredito}, ${parsedEntrada},
        ${parsedCount}, ${parsedParcela}, ${vencStr}, ${disponivel},
        ${taxa_transferencia}, ${vencStr}, ${observacoes}
      )
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

// DELETE — apagar todas as cartas de uma vez se deleteAll=true
export async function DELETE(request: Request) {
  try {
    await verifyAdmin();
    const { searchParams } = new URL(request.url);
    const deleteAll = searchParams.get("all") === "true";

    if (!deleteAll) {
      return NextResponse.json({ error: "Parâmetro 'all=true' é necessário para exclusão total" }, { status: 400 });
    }

    const sql = await getDb();
    await sql`DELETE FROM cartas_contempladas`;

    return NextResponse.json({ success: true, message: "Todas as cartas foram removidas." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    if (msg === "Unauthorized") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    console.error("[admin/cartas DELETE ALL]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
