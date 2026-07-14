import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL || "";

async function getDb() {
  if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");
  return neon(DATABASE_URL);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const segmento       = searchParams.get("segmento")       || "";
    const administradora = searchParams.get("administradora") || "";
    const valorMin       = parseFloat(searchParams.get("valor_min") || "0")  || 0;
    const valorMax       = parseFloat(searchParams.get("valor_max") || "0")  || 0;
    const sortParam      = searchParams.get("sort") || "valor_credito";
    const dirParam       = searchParams.get("dir")  === "desc" ? "DESC" : "ASC";
    const page           = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit          = 20;
    const offset         = (page - 1) * limit;

    const allowedSort = ["valor_credito","entrada","parcelas","valor_parcela","administradora","criado_em"];
    const safeSort = allowedSort.includes(sortParam) ? sortParam : "valor_credito";

    const sql = await getDb();

    // 1. Construir query dinâmica com parâmetros posicionais seguros
    const params: any[] = [];
    let queryFilters = "WHERE disponivel = true";

    if (segmento) {
      params.push(segmento);
      queryFilters += ` AND segmento = $${params.length}`;
    }

    if (administradora) {
      params.push(administradora);
      queryFilters += ` AND administradora = $${params.length}`;
    }

    if (valorMin > 0) {
      params.push(valorMin);
      queryFilters += ` AND valor_credito >= $${params.length}`;
    }

    if (valorMax > 0) {
      params.push(valorMax);
      queryFilters += ` AND valor_credito <= $${params.length}`;
    }

    // 2. Query de contagem
    const countQuery = `SELECT COUNT(*)::int as total FROM cartas_contempladas ${queryFilters}`;
    const countRows = await runQuery(sql, countQuery, params);
    const total = Number(countRows[0]?.total ?? 0);

    // 3. Adicionar ordenação whitelisted (100% segura contra SQLi)
    // E paginação (adicionando limit/offset como parâmetros)
    params.push(limit);
    const limitPlaceholder = `$${params.length}`;
    params.push(offset);
    const offsetPlaceholder = `$${params.length}`;

    const selectQuery = `
      SELECT id, segmento, administradora, valor_credito, entrada, parcelas, valor_parcela, proximo_vencimento, disponivel
      FROM cartas_contempladas
      ${queryFilters}
      ORDER BY ${safeSort} ${dirParam}
      LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}
    `;

    const rows = await runQuery(sql, selectQuery, params);

    // Opções de filtro disponíveis
    const segmentos = await sql`SELECT DISTINCT segmento FROM cartas_contempladas WHERE disponivel = true ORDER BY segmento`;
    const admins    = await sql`SELECT DISTINCT administradora FROM cartas_contempladas WHERE disponivel = true ORDER BY administradora`;

    return NextResponse.json({
      data: rows,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      filters: {
        segmentos:       segmentos.map((r) => r.segmento),
        administradoras: admins.map((r) => r.administradora),
      },
    });
  } catch (err) {
    console.error("[/api/cartas] erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Auxiliar para executar queries dinâmicas de forma segura com template literals do Neon
async function runQuery(sql: any, queryText: string, params: any[]) {
  if (params.length === 0) {
    const arr = [queryText] as any;
    arr.raw = [queryText];
    return await sql(arr as TemplateStringsArray);
  }
  const parts = queryText.split(/\$\d+/);
  const arr = parts as any;
  arr.raw = parts;
  return await sql(arr as TemplateStringsArray, ...params);
}
