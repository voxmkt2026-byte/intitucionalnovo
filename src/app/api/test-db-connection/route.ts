import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const DATABASE_URL = process.env.DATABASE_URL || "";
  if (!DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" });
  }

  const sql = neon(DATABASE_URL);

  try {
    const tableCounts = {
      leads: 0,
      afiliados: 0,
      afiliados_comissoes: 0,
      cartas_contempladas: 0,
      cartas_disponiveis: 0,
    };

    try {
      const res = await sql`SELECT COUNT(*)::int as count FROM leads`;
      tableCounts.leads = res[0]?.count ?? 0;
    } catch (e: any) {
      (tableCounts as any).leads_error = e.message;
    }

    try {
      const res = await sql`SELECT COUNT(*)::int as count FROM afiliados`;
      tableCounts.afiliados = res[0]?.count ?? 0;
    } catch (e: any) {
      (tableCounts as any).afiliados_error = e.message;
    }

    try {
      const res = await sql`SELECT COUNT(*)::int as count FROM afiliados_comissoes`;
      tableCounts.afiliados_comissoes = res[0]?.count ?? 0;
    } catch (e: any) {
      (tableCounts as any).afiliados_comissoes_error = e.message;
    }

    try {
      const res = await sql`SELECT COUNT(*)::int as count FROM cartas_contempladas`;
      tableCounts.cartas_contempladas = res[0]?.count ?? 0;
    } catch (e: any) {
      (tableCounts as any).cartas_contempladas_error = e.message;
    }

    try {
      const res = await sql`SELECT COUNT(*)::int as count FROM cartas_contempladas WHERE disponivel = true`;
      tableCounts.cartas_disponiveis = res[0]?.count ?? 0;
    } catch (e: any) {
      (tableCounts as any).cartas_disponiveis_error = e.message;
    }

    return NextResponse.json({ success: true, tableCounts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
