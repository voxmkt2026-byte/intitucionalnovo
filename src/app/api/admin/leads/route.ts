import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAdminRequest } from "@/lib/admin-auth";



// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeadFullRow {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  segment: string | null;
  credit: string | null;
  months: string | null;
  lp: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  fbc: string | null;
  fbp: string | null;
  gclid: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

interface CountRow {
  count: string;
}

// ---------------------------------------------------------------------------
// Safe sort-column whitelist
// ---------------------------------------------------------------------------

const SAFE_SORT_COLUMNS = new Set([
  "created_at",
  "name",
  "segment",
  "credit",
  "status",
  "utm_source",
]);

// ---------------------------------------------------------------------------
// GET /api/admin/leads
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }
  const sql = neon(process.env.DATABASE_URL);

  const { searchParams } = new URL(request.url);


  // Query params
  const status = searchParams.get("status") ?? null;
  const segmento = searchParams.get("segmento") ?? null;
  const utm_source = searchParams.get("utm_source") ?? null;
  const q = searchParams.get("q") ?? null;
  const data_inicio = searchParams.get("data_inicio") ?? null;
  const data_fim = searchParams.get("data_fim") ?? null;

  const rawSort = searchParams.get("sort") ?? "created_at";
  const sortCol = SAFE_SORT_COLUMNS.has(rawSort) ? rawSort : "created_at";

  const rawDir = (searchParams.get("dir") ?? "desc").toLowerCase();
  const sortDir = rawDir === "asc" ? "ASC" : "DESC";

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10))
  );
  const offset = (page - 1) * limit;

  try {
    // Build WHERE conditions as individual parameterised fragments,
    // then combine them. Neon tagged-template literals are safe from SQLi.

    // We build conditions as an array of sql fragments using neon's
    // tagged template literal. Each condition is its own fragment to
    // avoid dynamic string interpolation.

    // Collect all data rows and total count in parallel once we have
    // the full WHERE clause.  Because neon doesn't expose a
    // fragment-composition API natively, we use conditional expressions
    // inside a single query using SQL CASE / IS NULL tricks to keep
    // everything parameterised.

    const [dataRows, countRows] = await Promise.all([
      sql`
        SELECT
          id, name, phone, email, segment, credit, months, lp,
          utm_source, utm_medium, utm_campaign, fbc, fbp, gclid,
          status, notes, created_at, updated_at
        FROM leads
        WHERE
          (${status} IS NULL OR COALESCE(status, 'Novo') = ${status})
          AND (${segmento} IS NULL OR segment = ${segmento})
          AND (${utm_source} IS NULL OR utm_source = ${utm_source})
          AND (
            ${q} IS NULL
            OR name ILIKE ${'%' + (q ?? '') + '%'}
            OR phone ILIKE ${'%' + (q ?? '') + '%'}
          )
          AND (${data_inicio} IS NULL OR created_at >= ${data_inicio}::timestamptz)
          AND (${data_fim}   IS NULL OR created_at <= ${data_fim}::timestamptz)
        ORDER BY
          CASE WHEN ${sortCol} = 'created_at'  AND ${sortDir} = 'DESC' THEN created_at  END DESC NULLS LAST,
          CASE WHEN ${sortCol} = 'created_at'  AND ${sortDir} = 'ASC'  THEN created_at  END ASC  NULLS LAST,
          CASE WHEN ${sortCol} = 'name'        AND ${sortDir} = 'DESC' THEN name        END DESC NULLS LAST,
          CASE WHEN ${sortCol} = 'name'        AND ${sortDir} = 'ASC'  THEN name        END ASC  NULLS LAST,
          CASE WHEN ${sortCol} = 'segment'     AND ${sortDir} = 'DESC' THEN segment     END DESC NULLS LAST,
          CASE WHEN ${sortCol} = 'segment'     AND ${sortDir} = 'ASC'  THEN segment     END ASC  NULLS LAST,
          CASE WHEN ${sortCol} = 'status'      AND ${sortDir} = 'DESC' THEN status      END DESC NULLS LAST,
          CASE WHEN ${sortCol} = 'status'      AND ${sortDir} = 'ASC'  THEN status      END ASC  NULLS LAST,
          CASE WHEN ${sortCol} = 'utm_source'  AND ${sortDir} = 'DESC' THEN utm_source  END DESC NULLS LAST,
          CASE WHEN ${sortCol} = 'utm_source'  AND ${sortDir} = 'ASC'  THEN utm_source  END ASC  NULLS LAST,
          created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as unknown as Promise<LeadFullRow[]>,

      sql`
        SELECT COUNT(*)::text AS count
        FROM leads
        WHERE
          (${status} IS NULL OR COALESCE(status, 'Novo') = ${status})
          AND (${segmento} IS NULL OR segment = ${segmento})
          AND (${utm_source} IS NULL OR utm_source = ${utm_source})
          AND (
            ${q} IS NULL
            OR name ILIKE ${'%' + (q ?? '') + '%'}
            OR phone ILIKE ${'%' + (q ?? '') + '%'}
          )
          AND (${data_inicio} IS NULL OR created_at >= ${data_inicio}::timestamptz)
          AND (${data_fim}   IS NULL OR created_at <= ${data_fim}::timestamptz)
      ` as unknown as Promise<CountRow[]>,
    ]);

    const total = parseInt(countRows[0]?.count ?? "0", 10);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      data: dataRows,
      meta: { total, page, pages, limit },
    });
  } catch (err) {
    console.error("[admin/leads] GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
