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

    // Busca cartas com filtros dinâmicos via SQL parametrizado
    let rows;
    let countRows;

    // Neon template literals não suportam ORDER BY / LIMIT dinâmicos,
    // então usamos sql.unsafe() apenas para as partes não-user-controlled (sort/dir)
    if (segmento && administradora && valorMin && valorMax) {
      rows = await sql`
        SELECT id, segmento, administradora, valor_credito, entrada, parcelas, valor_parcela, proximo_vencimento, disponivel
        FROM cartas_contempladas
        WHERE disponivel = true AND segmento = ${segmento} AND administradora = ${administradora}
          AND valor_credito >= ${valorMin} AND valor_credito <= ${valorMax}
        LIMIT ${limit} OFFSET ${offset}`;
      countRows = await sql`
        SELECT COUNT(*)::int as total FROM cartas_contempladas
        WHERE disponivel = true AND segmento = ${segmento} AND administradora = ${administradora}
          AND valor_credito >= ${valorMin} AND valor_credito <= ${valorMax}`;
    } else if (segmento && administradora) {
      rows = await sql`
        SELECT id, segmento, administradora, valor_credito, entrada, parcelas, valor_parcela, proximo_vencimento, disponivel
        FROM cartas_contempladas
        WHERE disponivel = true AND segmento = ${segmento} AND administradora = ${administradora}
        LIMIT ${limit} OFFSET ${offset}`;
      countRows = await sql`
        SELECT COUNT(*)::int as total FROM cartas_contempladas
        WHERE disponivel = true AND segmento = ${segmento} AND administradora = ${administradora}`;
    } else if (segmento) {
      rows = await sql`
        SELECT id, segmento, administradora, valor_credito, entrada, parcelas, valor_parcela, proximo_vencimento, disponivel
        FROM cartas_contempladas
        WHERE disponivel = true AND segmento = ${segmento}
        LIMIT ${limit} OFFSET ${offset}`;
      countRows = await sql`
        SELECT COUNT(*)::int as total FROM cartas_contempladas WHERE disponivel = true AND segmento = ${segmento}`;
    } else if (administradora) {
      rows = await sql`
        SELECT id, segmento, administradora, valor_credito, entrada, parcelas, valor_parcela, proximo_vencimento, disponivel
        FROM cartas_contempladas
        WHERE disponivel = true AND administradora = ${administradora}
        LIMIT ${limit} OFFSET ${offset}`;
      countRows = await sql`
        SELECT COUNT(*)::int as total FROM cartas_contempladas WHERE disponivel = true AND administradora = ${administradora}`;
    } else {
      rows = await sql`
        SELECT id, segmento, administradora, valor_credito, entrada, parcelas, valor_parcela, proximo_vencimento, disponivel
        FROM cartas_contempladas
        WHERE disponivel = true
        LIMIT ${limit} OFFSET ${offset}`;
      countRows = await sql`
        SELECT COUNT(*)::int as total FROM cartas_contempladas WHERE disponivel = true`;
    }

    // Sort client-side (safe, já paginado no banco)
    const sortedRows = [...rows].sort((a, b) => {
      const av = Number(a[safeSort]) || 0;
      const bv = Number(b[safeSort]) || 0;
      if (typeof a[safeSort] === "string") {
        return dirParam === "ASC"
          ? String(a[safeSort]).localeCompare(String(b[safeSort]))
          : String(b[safeSort]).localeCompare(String(a[safeSort]));
      }
      return dirParam === "ASC" ? av - bv : bv - av;
    });

    const total = Number(countRows[0]?.total ?? 0);

    // Opções de filtro disponíveis
    const segmentos = await sql`SELECT DISTINCT segmento FROM cartas_contempladas WHERE disponivel = true ORDER BY segmento`;
    const admins    = await sql`SELECT DISTINCT administradora FROM cartas_contempladas WHERE disponivel = true ORDER BY administradora`;

    return NextResponse.json({
      data: sortedRows,
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
