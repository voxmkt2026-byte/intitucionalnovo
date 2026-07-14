import { neon } from "@neondatabase/serverless";

export interface AdminStats {
  hoje: number;
  semana: number;
  mes: number;
  total: number;
  taxa_conversao: number;
  ticket_medio_vendido: number;
  por_status: Record<string, number>;
  por_source: Record<string, number>;
  por_lp: Record<string, number>;
  por_segmento: Record<string, number>;
  recentes: {
    id: number;
    name: string | null;
    phone: string | null;
    segment: string | null;
    credit: string | null;
    utm_source: string | null;
    lp: string | null;
    status: string | null;
    created_at: string;
  }[];
}

const ZERO_STATS: AdminStats = {
  hoje: 0, semana: 0, mes: 0, total: 0,
  taxa_conversao: 0, ticket_medio_vendido: 0,
  por_status: {}, por_source: {}, por_lp: {}, por_segmento: {}, recentes: [],
};

/** Shared query helper — used by both the API route and Server Components */
export async function fetchAdminStats(): Promise<AdminStats> {
  if (!process.env.DATABASE_URL) return ZERO_STATS;

  const sql = neon(process.env.DATABASE_URL);

  try {


    const [
      hojeRows, semanaRows, mesRows, totalRows,
      porStatusRows, porSourceRows, porLpRows, porSegRows,
      recentesRows, ticketRows,
    ] = await Promise.all([
      sql`SELECT COUNT(*)::text AS count FROM leads WHERE created_at >= CURRENT_DATE`,
      sql`SELECT COUNT(*)::text AS count FROM leads WHERE created_at >= NOW() - INTERVAL '7 days'`,
      sql`SELECT COUNT(*)::text AS count FROM leads WHERE created_at >= NOW() - INTERVAL '30 days'`,
      sql`SELECT COUNT(*)::text AS count FROM leads`,
      sql`SELECT COALESCE(status,'Novo') AS status, COUNT(*)::text AS count FROM leads GROUP BY status`,
      sql`SELECT COALESCE(NULLIF(utm_source,''),'organico') AS src, COUNT(*)::text AS count FROM leads GROUP BY utm_source ORDER BY count DESC LIMIT 8`,
      sql`SELECT COALESCE(NULLIF(lp,''),'direto') AS lp, COUNT(*)::text AS count FROM leads GROUP BY lp ORDER BY count DESC LIMIT 8`,
      sql`SELECT COALESCE(NULLIF(segment,''),'outros') AS seg, COUNT(*)::text AS count FROM leads GROUP BY segment ORDER BY count DESC LIMIT 6`,
      sql`SELECT id, name, phone, segment, credit, utm_source, lp, COALESCE(status,'Novo') AS status, created_at FROM leads ORDER BY created_at DESC LIMIT 10`,
      sql`SELECT AVG(CAST(NULLIF(REGEXP_REPLACE(COALESCE(credit,'0'),'[^0-9]','','g'),'') AS NUMERIC))::text AS avg FROM leads WHERE COALESCE(status,'') = 'Vendido'`,
    ]);

    const total   = parseInt(String((totalRows[0]   as {count:string}).count ?? "0"), 10);
    const hoje    = parseInt(String((hojeRows[0]    as {count:string}).count ?? "0"), 10);
    const semana  = parseInt(String((semanaRows[0]  as {count:string}).count ?? "0"), 10);
    const mes     = parseInt(String((mesRows[0]     as {count:string}).count ?? "0"), 10);
    const vendidos = parseInt(String((porStatusRows as {status:string;count:string}[]).find(r=>r.status==="Vendido")?.count ?? "0"), 10);
    const taxaConversao     = total > 0 ? Math.round((vendidos / total) * 1000) / 10 : 0;
    const ticketMedioVendido = Math.round(parseFloat(String((ticketRows[0] as {avg:string|null})?.avg ?? "0")) || 0);

    return {
      hoje, semana, mes, total,
      taxa_conversao:       taxaConversao,
      ticket_medio_vendido: ticketMedioVendido,
      por_status:   Object.fromEntries((porStatusRows as {status:string;count:string}[]).map(r=>[r.status, parseInt(r.count,10)])),
      por_source:   Object.fromEntries((porSourceRows as {src:string;count:string}[]).map(r=>[r.src, parseInt(r.count,10)])),
      por_lp:       Object.fromEntries((porLpRows as {lp:string;count:string}[]).map(r=>[r.lp, parseInt(r.count,10)])),
      por_segmento: Object.fromEntries((porSegRows as {seg:string;count:string}[]).map(r=>[r.seg, parseInt(r.count,10)])),
      recentes:     recentesRows as AdminStats["recentes"],
    };
  } catch (err) {
    console.error("[admin-stats] query error:", err);
    throw err;
  }
}
