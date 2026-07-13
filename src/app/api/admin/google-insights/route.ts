import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAdminRequest } from "@/lib/admin-auth";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function periodToDates(period: string): { since: string; until: string } {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  switch (period) {
    case "today":
      return { since: fmt(now), until: fmt(now) };
    case "7d":
      return { since: fmt(new Date(Date.now() - 6 * 86400000)), until: fmt(now) };
    case "30d":
    default:
      return { since: fmt(new Date(Date.now() - 29 * 86400000)), until: fmt(now) };
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/google-insights?period=7d|30d|today
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
  const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, "");

  if (!DEVELOPER_TOKEN || !CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !CUSTOMER_ID) {
    return NextResponse.json({
      meta_available: false,
      meta_error_message: "Chaves do Google Ads não configuradas no Vercel (Developer Token, Client ID, Secret, Refresh Token ou Customer ID).",
      campaigns: [],
      total: { spend: 0, impressions: 0, clicks: 0, leads: 0, ctr: 0, cpl: null },
    });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "30d";
  const { since, until } = periodToDates(period);

  try {
    // ── Step 1: Trocar Refresh Token por Access Token ──
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("[GoogleAds] Falha ao renovar token:", err);
      return NextResponse.json({ error: "Falha na autenticação Google", detail: err }, { status: 502 });
    }

    const { access_token } = await tokenRes.json();

    // ── Step 2: Buscar campanhas na API do Google Ads ──
    const gaql = `
      SELECT 
        campaign.id, 
        campaign.name, 
        metrics.cost_micros, 
        metrics.impressions, 
        metrics.clicks 
      FROM campaign 
      WHERE segments.date >= '${since}' AND segments.date <= '${until}'
        AND metrics.cost_micros > 0
    `;

    const adsRes = await fetch(`https://googleads.googleapis.com/v17/customers/${CUSTOMER_ID}/googleAds:search`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "developer-token": DEVELOPER_TOKEN,
        "login-customer-id": CUSTOMER_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: gaql }),
    });

    if (!adsRes.ok) {
      const err = await adsRes.text();
      console.error("[GoogleAds] Falha na API Search:", err);
      return NextResponse.json({ error: "Falha na busca GAQL", detail: err }, { status: 502 });
    }

    const adsData = await adsRes.json();
    const rows = adsData.results || [];

    // ── Step 3: Cruzar com leads do Neon por utm_campaign (Google) ──
    const leadsByCampaign: Record<string, { leads: number; revenue: number }> = {};
    if (process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        const neonRows = await sql`
          SELECT utm_campaign, COUNT(*) as count, SUM(revenue) as total_revenue
          FROM leads
          WHERE created_at >= ${since}::date
            AND created_at <  ${until}::date + INTERVAL '1 day'
            AND utm_source = 'google'
            AND utm_campaign IS NOT NULL AND utm_campaign != ''
          GROUP BY utm_campaign
        ` as Array<{ utm_campaign: string; count: string; total_revenue: string | null }>;
        
        neonRows.forEach(r => {
          leadsByCampaign[r.utm_campaign] = {
            leads: parseInt(r.count, 10),
            revenue: parseFloat(r.total_revenue || "0")
          };
        });
      } catch (e) {
        console.warn("[GoogleAds] Falha ao cruzar com Neon:", e);
      }
    }

    // ── Step 4: Montar resposta ──
    const campaigns = rows.map((row: any) => {
      const c = row.campaign;
      const m = row.metrics;
      
      const spend = (parseInt(m.costMicros || "0", 10) / 1000000);
      const impressions = parseInt(m.impressions || "0", 10);
      const clicks = parseInt(m.clicks || "0", 10);
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpc = clicks > 0 ? spend / clicks : 0;
      const leadsInfo = leadsByCampaign[c.name] ?? { leads: 0, revenue: 0 };
      const leads = leadsInfo.leads;
      const revenue = leadsInfo.revenue;
      const cpl = leads > 0 ? spend / leads : null;
      const roas = spend > 0 ? revenue / spend : null;
      const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : null;

      return {
        id: c.id,
        name: c.name,
        platform: "google",
        spend,
        impressions,
        clicks,
        ctr: Math.round(ctr * 100) / 100,
        cpc: Math.round(cpc * 100) / 100,
        reach: impressions, // Google search doesn't usually expose unique reach nicely
        leads,
        cpl: cpl !== null ? Math.round(cpl * 100) / 100 : null,
        revenue,
        roas: roas !== null ? Math.round(roas * 100) / 100 : null,
        roi: roi !== null ? Math.round(roi * 100) / 100 : null,
      };
    }).sort((a: any, b: any) => b.spend - a.spend);

    const total = {
      spend: campaigns.reduce((s: any, c: any) => s + c.spend, 0),
      impressions: campaigns.reduce((s: any, c: any) => s + c.impressions, 0),
      clicks: campaigns.reduce((s: any, c: any) => s + c.clicks, 0),
      leads: campaigns.reduce((s: any, c: any) => s + c.leads, 0),
      revenue: campaigns.reduce((s: any, c: any) => s + (c.revenue || 0), 0),
      ctr: 0,
      cpl: null as number | null,
      roas: null as number | null,
      roi: null as number | null,
    };
    total.ctr = total.impressions > 0 ? Math.round((total.clicks / total.impressions) * 100 * 100) / 100 : 0;
    total.cpl = total.leads > 0 ? Math.round((total.spend / total.leads) * 100) / 100 : null;
    total.roas = total.spend > 0 ? Math.round((total.revenue / total.spend) * 100) / 100 : null;
    total.roi = total.spend > 0 ? Math.round((((total.revenue - total.spend) / total.spend) * 100) * 100) / 100 : null;

    return NextResponse.json({
      campaigns,
      total,
      period,
      since,
      until,
      meta_available: true,
    });

  } catch (err) {
    console.error("[GoogleAds] Erro interno:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
