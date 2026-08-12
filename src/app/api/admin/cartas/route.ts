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
  
  const migrations = [
    sql`ALTER TABLE cartas_contempladas ADD COLUMN IF NOT EXISTS taxa_transferencia TEXT`,
    sql`ALTER TABLE cartas_contempladas ADD COLUMN IF NOT EXISTS vencimento_parcela TEXT`,
    sql`ALTER TABLE cartas_contempladas ADD COLUMN IF NOT EXISTS observacoes TEXT`,
    sql`ALTER TABLE cartas_contempladas ADD COLUMN IF NOT EXISTS status_cota TEXT`,
  ];

  for (const m of migrations) {
    try {
      await m;
    } catch {}
  }

  return sql;
}

// GET — lista todas as cartas com as 7 colunas completas + status_cota
export async function GET() {
  try {
    await verifyAdmin();
    const sql = await getDb();
    
    let rows: any[];
    try {
      rows = await sql`
        SELECT 
          id, segmento, administradora, valor_credito, entrada,
          parcelas, valor_parcela, proximo_vencimento, disponivel,
          taxa_transferencia, vencimento_parcela, observacoes, status_cota, criado_em
        FROM cartas_contempladas
        ORDER BY id DESC
      `;
    } catch {
      rows = await sql`
        SELECT 
          id, segmento, administradora, valor_credito, entrada,
          parcelas, valor_parcela, proximo_vencimento, disponivel,
          taxa_transferencia, vencimento_parcela, observacoes, criado_em
        FROM cartas_contempladas
        ORDER BY id DESC
      `;
    }

    const data = rows.map((r: any) => ({
      ...r,
      id: Number(r.id),
      valor_credito: typeof r.valor_credito === "number" ? r.valor_credito : parseFloat(String(r.valor_credito || 0)),
      entrada: r.entrada != null ? (typeof r.entrada === "number" ? r.entrada : parseFloat(String(r.entrada))) : null,
      parcelas: typeof r.parcelas === "number" ? r.parcelas : parseInt(String(r.parcelas || 0), 10),
      valor_parcela: typeof r.valor_parcela === "number" ? r.valor_parcela : parseFloat(String(r.valor_parcela || 0)),
      disponivel: r.disponivel != null ? Boolean(r.disponivel) : true,
      status_cota: r.status_cota || (r.disponivel === false ? "reservado" : "disponivel"),
    }));

    return NextResponse.json({ data });
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
          const status_cota = item.status_cota || (item.disponivel === false ? "reservado" : "disponivel");
          const observacoes = String(item.observacoes || "");
          const disponivel = status_cota === "disponivel";

          if (valor_credito > 0) {
            await sql`
              INSERT INTO cartas_contempladas (
                segmento, administradora, valor_credito, entrada,
                parcelas, valor_parcela, proximo_vencimento, disponivel,
                taxa_transferencia, vencimento_parcela, observacoes, status_cota
              ) VALUES (
                ${segmento}, ${administradora}, ${valor_credito}, ${entrada},
                ${parcelas}, ${valor_parcela}, ${vencimento_parcela}, ${disponivel},
                ${taxa_transferencia}, ${vencimento_parcela}, ${observacoes}, ${status_cota}
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
      parcelas, valor_parcela, proximo_vencimento,
      taxa_transferencia = "R$ 0,00", vencimento_parcela = "Dia 10", observacoes = "",
      status_cota = "disponivel", disponivel = true
    } = body;

    if (!administradora || !valor_credito || !parcelas || !valor_parcela) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const parsedCredito = parseBRLNumber(valor_credito);
    const parsedEntrada = parseBRLNumber(entrada);
    const parsedParcela = parseBRLNumber(valor_parcela);
    const parsedCount = parseInt(String(parcelas), 10) || 60;
    const vencStr = String(vencimento_parcela || proximo_vencimento || "Dia 10");
    const isDisponivel = status_cota === "disponivel";

    const result = await sql`
      INSERT INTO cartas_contempladas (
        segmento, administradora, valor_credito, entrada,
        parcelas, valor_parcela, proximo_vencimento, disponivel,
        taxa_transferencia, vencimento_parcela, observacoes, status_cota
      ) VALUES (
        ${segmento}, ${administradora}, ${parsedCredito}, ${parsedEntrada},
        ${parsedCount}, ${parsedParcela}, ${vencStr}, ${isDisponivel},
        ${taxa_transferencia}, ${vencStr}, ${observacoes}, ${status_cota}
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
