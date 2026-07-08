import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAdminRequest } from "@/lib/admin-auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MetaInsight {
  campaign_name: string;
  campaign_id:   string;
  spend:         string;
  impressions:   string;
  clicks:        string;
  ctr:           string;
  cpc:           string;
  reach:         string;
  date_start:    string;
  date_stop:     string;
}

interface AdAccount {
  id:            string;
  name:          string;
  currency:      string;
  account_status: number;
}

interface MetaAdAccountsResponse {
  data: AdAccount[];
}

interface MetaInsightsResponse {
  data: MetaInsight[];
  error?: { message: string; code: number };
}

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
// GET /api/admin/meta-insights?period=7d|30d|today
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const META_TOKEN = process.env.META_ACCESS_TOKEN;
  if (!META_TOKEN) {
    return NextResponse.json({ error: "META_ACCESS_TOKEN not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "30d";
  const { since, until } = periodToDates(period);

  // ── Helper: Neon-only campaign data (leads grouped by utm_campaign) ──────────
  async function getNeonOnlyCampaigns() {
    if (!process.env.DATABASE_URL) return [];
    try {
      const sql = neon(process.env.DATABASE_URL);
      const rows = await sql`
        SELECT utm_campaign AS campaign_name, COUNT(*) AS leads
        FROM leads
        WHERE created_at >= ${since}::date
          AND created_at <  ${until}::date + INTERVAL '1 day'
          AND utm_campaign IS NOT NULL AND utm_campaign != ''
        GROUP BY utm_campaign
        ORDER BY leads DESC
        LIMIT 50
      ` as Array<{ campaign_name: string; leads: string; total_revenue: string | null }>;
      return rows.map(r => ({
        id: r.campaign_name,
        name: r.campaign_name,
        spend: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, reach: 0,
        leads: parseInt(r.leads, 10),
        revenue: parseFloat(r.total_revenue || "0"),
        cpl: null,
        roas: null,
        roi: null,
      }));
    } catch { return []; }
  }

  try {
    // ── Step 1: Obter ad accounts do token ──────────────────────────────────────
    const accountsRes = await fetch(
      `https://graph.facebook.com/v23.0/me/adaccounts?fields=id,name,currency,account_status&access_token=${META_TOKEN}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!accountsRes.ok) {
      const errText = await accountsRes.text();
      let errJson: { error?: { code?: number; message?: string } } = {};
      try { errJson = JSON.parse(errText); } catch { /* ignore */ }

      const isMissingPerms = errJson?.error?.code === 200;

      console.error("[MetaInsights] Erro ao buscar ad accounts:", errText);

      // Se for erro de permissão — retornar dados do Neon com flag de aviso
      if (isMissingPerms) {
        const neonCampaigns = await getNeonOnlyCampaigns();
        return NextResponse.json({
          campaigns: neonCampaigns,
          total: {
            spend: 0, impressions: 0, clicks: 0,
            leads: neonCampaigns.reduce((s, c) => s + c.leads, 0),
            revenue: neonCampaigns.reduce((s, c) => s + c.revenue, 0),
            ctr: 0, cpl: null, roas: null, roi: null
          },
          period, since, until,
          accounts_found: 0,
          accounts: [],
          meta_available: false,
          meta_error: "missing_permissions",
          meta_error_message: "O token configurado não tem permissão ads_read. Configure um token de Marketing API para ver spend, CPL e CTR.",
        });
      }

      return NextResponse.json({ error: "Falha ao conectar com Meta API", detail: errText }, { status: 502 });
    }

    const accountsData = await accountsRes.json() as MetaAdAccountsResponse;
    const accounts = accountsData.data?.filter(a => a.account_status === 1) ?? [];

    if (!accounts.length) {
      const neonCampaigns = await getNeonOnlyCampaigns();
      return NextResponse.json({
        campaigns: neonCampaigns,
        total: { 
          spend: 0, impressions: 0, clicks: 0, 
          leads: neonCampaigns.reduce((s, c) => s + c.leads, 0), 
          revenue: neonCampaigns.reduce((s, c) => s + c.revenue, 0),
          ctr: 0, cpl: null, roas: null, roi: null 
        },
        period, since, until, accounts_found: 0, accounts: [], meta_available: true,
      });
    }

    // ── Step 2: Buscar insights de todas as contas ativadas em paralelo ──
    const allInsights = await Promise.allSettled(
      accounts.map(async (account) => {
        const fields = [
          "campaign_name", "campaign_id", "spend", "impressions",
          "clicks", "ctr", "cpc", "reach",
        ].join(",");

        const insightsUrl = new URL(`https://graph.facebook.com/v23.0/${account.id}/insights`);
        insightsUrl.searchParams.set("fields", fields);
        insightsUrl.searchParams.set("level", "campaign");
        insightsUrl.searchParams.set("time_range", JSON.stringify({ since, until }));
        insightsUrl.searchParams.set("access_token", META_TOKEN);
        insightsUrl.searchParams.set("limit", "50");

        const res = await fetch(insightsUrl.toString(), { signal: AbortSignal.timeout(10000) });
        if (!res.ok) throw new Error(`Account ${account.id}: ${res.status}`);

        const json = await res.json() as MetaInsightsResponse;
        if (json.error) throw new Error(json.error.message);
        return json.data ?? [];
      })
    );

    const insights: MetaInsight[] = allInsights
      .filter(r => r.status === "fulfilled")
      .flatMap(r => (r as PromiseFulfilledResult<MetaInsight[]>).value);

    // ── Step 3: Cruzar com leads do Neon por utm_campaign ──
    const leadsByCampaign: Record<string, { leads: number; revenue: number }> = {};
    if (process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        const rows = await sql`
          SELECT utm_campaign, COUNT(*) as count, SUM(revenue) as total_revenue
          FROM leads
          WHERE created_at >= ${since}::date
            AND created_at <  ${until}::date + INTERVAL '1 day'
            AND utm_campaign IS NOT NULL AND utm_campaign != ''
          GROUP BY utm_campaign
        ` as Array<{ utm_campaign: string; count: string; total_revenue: string | null }>;
        
        rows.forEach(r => {
          leadsByCampaign[r.utm_campaign] = {
            leads: parseInt(r.count, 10),
            revenue: parseFloat(r.total_revenue || "0")
          };
        });
      } catch (e) {
        console.warn("[MetaInsights] Falha ao cruzar com Neon:", e);
      }
    }

    // ── Step 4: Montar resposta ──
    const campaigns = insights.map(c => {
      const spend       = parseFloat(c.spend ?? "0");
      const impressions = parseInt(c.impressions ?? "0", 10);
      const clicks      = parseInt(c.clicks ?? "0", 10);
      const ctr         = parseFloat(c.ctr ?? "0");
      const cpc         = parseFloat(c.cpc ?? "0");
      const reach       = parseInt(c.reach ?? "0", 10);
      const leadsInfo   = leadsByCampaign[c.campaign_name] ?? { leads: 0, revenue: 0 };
      const leads       = leadsInfo.leads;
      const revenue     = leadsInfo.revenue;
      const cpl         = leads > 0 ? spend / leads : null;
      const roas        = spend > 0 ? revenue / spend : null;
      const roi         = spend > 0 ? ((revenue - spend) / spend) * 100 : null;

      return {
        id:           c.campaign_id,
        name:         c.campaign_name,
        spend,
        impressions,
        clicks,
        ctr:          Math.round(ctr * 100) / 100,
        cpc:          Math.round(cpc * 100) / 100,
        reach,
        leads,
        cpl:          cpl !== null ? Math.round(cpl * 100) / 100 : null,
        revenue,
        roas:         roas !== null ? Math.round(roas * 100) / 100 : null,
        roi:          roi !== null ? Math.round(roi * 100) / 100 : null,
      };
    }).sort((a, b) => b.spend - a.spend); // maior gasto primeiro

    // Totais
    const total: {
      spend: number; impressions: number; clicks: number;
      leads: number; ctr: number; cpl: number | null;
      revenue: number; roas: number | null; roi: number | null;
    } = {
      spend:       campaigns.reduce((s, c) => s + c.spend, 0),
      impressions: campaigns.reduce((s, c) => s + c.impressions, 0),
      clicks:      campaigns.reduce((s, c) => s + c.clicks, 0),
      leads:       campaigns.reduce((s, c) => s + c.leads, 0),
      revenue:     campaigns.reduce((s, c) => s + (c.revenue || 0), 0),
      ctr:         campaigns.length
        ? campaigns.reduce((s, c) => s + c.ctr, 0) / campaigns.length
        : 0,
      cpl: null,
      roas: null,
      roi: null,
    };
    total.cpl = total.leads > 0 ? Math.round((total.spend / total.leads) * 100) / 100 : null;
    total.roas = total.spend > 0 ? Math.round((total.revenue / total.spend) * 100) / 100 : null;
    total.roi = total.spend > 0 ? Math.round((((total.revenue - total.spend) / total.spend) * 100) * 100) / 100 : null;


    return NextResponse.json({
      campaigns,
      total,
      period,
      since,
      until,
      accounts_found: accounts.length,
      accounts: accounts.map(a => ({ id: a.id, name: a.name })),
    });

  } catch (err) {
    console.error("[MetaInsights] Erro:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
