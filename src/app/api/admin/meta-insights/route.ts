import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAdminRequest } from "@/lib/admin-auth";

interface MetaInsight {
  campaign_name: string;
  campaign_id: string;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
  reach: string;
}

interface AdAccount {
  id: string;
  name: string;
  account_status: number;
}

interface AccountWithToken extends AdAccount {
  token: string;
  source: string;
}

function periodToDates(period: string) {
  const now = new Date();
  const fmt = (date: Date) => date.toISOString().slice(0, 10);
  if (period === "today") return { since: fmt(now), until: fmt(now) };
  const days = period === "7d" ? 6 : 29;
  return { since: fmt(new Date(Date.now() - days * 86400000)), until: fmt(now) };
}

function totals(campaigns: Array<Record<string, number | string | null>>) {
  const total = {
    spend: campaigns.reduce((sum, item) => sum + Number(item.spend), 0),
    impressions: campaigns.reduce((sum, item) => sum + Number(item.impressions), 0),
    clicks: campaigns.reduce((sum, item) => sum + Number(item.clicks), 0),
    leads: campaigns.reduce((sum, item) => sum + Number(item.leads), 0),
    revenue: campaigns.reduce((sum, item) => sum + Number(item.revenue), 0),
    ctr: 0,
    cpl: null as number | null,
    roas: null as number | null,
    roi: null as number | null,
  };
  total.ctr = total.impressions ? Math.round((total.clicks / total.impressions) * 10000) / 100 : 0;
  total.cpl = total.leads ? Math.round((total.spend / total.leads) * 100) / 100 : null;
  total.roas = total.spend ? Math.round((total.revenue / total.spend) * 100) / 100 : null;
  total.roi = total.spend ? Math.round(((total.revenue - total.spend) / total.spend) * 10000) / 100 : null;
  return total;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "30d";
  const { since, until } = periodToDates(period);

  const getNeonCampaigns = async () => {
    if (!process.env.DATABASE_URL) return [];
    try {
      const sql = neon(process.env.DATABASE_URL);
      const rows = await sql`
        SELECT utm_campaign AS campaign_name, COUNT(*) AS leads,
               COALESCE(SUM(revenue), 0) AS total_revenue
        FROM leads
        WHERE created_at >= ${since}::date
          AND created_at < ${until}::date + INTERVAL '1 day'
          AND utm_campaign IS NOT NULL AND utm_campaign != ''
        GROUP BY utm_campaign
        ORDER BY leads DESC
        LIMIT 50
      ` as Array<{ campaign_name: string; leads: string; total_revenue: string }>;
      return rows.map((row) => ({
        id: row.campaign_name,
        name: row.campaign_name,
        spend: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
        reach: 0,
        leads: Number(row.leads),
        revenue: Number(row.total_revenue),
        cpl: null,
        roas: null,
        roi: null,
      }));
    } catch {
      return [];
    }
  };

  const tokenConfigs = [
    { token: process.env.META_MARKETING_ACCESS_TOKEN, source: "primary" },
    { token: process.env.META_MARKETING_ACCESS_TOKEN_2, source: "secondary" },
  ].filter((config): config is { token: string; source: string } => Boolean(config.token));

  if (!tokenConfigs.length) {
    return NextResponse.json({
      campaigns: await getNeonCampaigns(),
      total: totals([]),
      period,
      since,
      until,
      accounts_found: 0,
      accounts: [],
      meta_available: false,
      meta_error: "META_MARKETING_ACCESS_TOKEN_NOT_CONFIGURED",
      warnings: ["META_MARKETING_ACCESS_TOKEN não configurado"],
    });
  }

  const accountResults = await Promise.allSettled(
    tokenConfigs.map(async ({ token, source }) => {
      const url = "https://graph.facebook.com/v23.0/me/adaccounts?fields=id,name,account_status&limit=100";
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`${source}: ${response.status}`);
      const json = await response.json() as { data?: AdAccount[] };
      return (json.data ?? [])
        .filter((account) => account.account_status === 1)
        .map((account): AccountWithToken => ({ ...account, token, source }));
    })
  );

  const warnings = accountResults
    .filter((result) => result.status === "rejected")
    .map((result) => String((result as PromiseRejectedResult).reason));
  const accountMap = new Map<string, AccountWithToken>();
  accountResults.forEach((result) => {
    if (result.status === "fulfilled") {
      result.value.forEach((account) => {
        if (!accountMap.has(account.id)) accountMap.set(account.id, account);
      });
    }
  });
  const accounts = [...accountMap.values()];

  if (!accounts.length) {
    const campaigns = await getNeonCampaigns();
    return NextResponse.json({
      campaigns,
      total: totals(campaigns),
      period,
      since,
      until,
      accounts_found: 0,
      accounts: [],
      meta_available: false,
      meta_error: "no_accessible_accounts",
      warnings,
    });
  }

  const fields = "campaign_name,campaign_id,spend,impressions,clicks,ctr,cpc,reach";
  const insightResults = await Promise.allSettled(
    accounts.map(async (account) => {
      const url = new URL(`https://graph.facebook.com/v23.0/${account.id}/insights`);
      url.searchParams.set("fields", fields);
      url.searchParams.set("level", "campaign");
      url.searchParams.set("time_range", JSON.stringify({ since, until }));
      url.searchParams.set("limit", "100");
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${account.token}` },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`${account.source}/${account.id}: ${response.status}`);
      const json = await response.json() as { data?: MetaInsight[]; error?: { message: string } };
      if (json.error) throw new Error(json.error.message);
      return (json.data ?? []).map((insight) => ({
        ...insight,
        account_id: account.id,
        account_name: account.name,
        business_source: account.source,
      }));
    })
  );

  insightResults.forEach((result) => {
    if (result.status === "rejected") warnings.push(String(result.reason));
  });
  const insights = insightResults.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  const neonCampaigns = await getNeonCampaigns();
  const leadsByCampaign = new Map(neonCampaigns.map((campaign) => [campaign.name, campaign]));
  const campaigns = insights.map((insight) => {
    const spend = Number(insight.spend || 0);
    const leadData = leadsByCampaign.get(insight.campaign_name);
    const leads = Number(leadData?.leads || 0);
    const revenue = Number(leadData?.revenue || 0);
    return {
      id: insight.campaign_id,
      name: insight.campaign_name,
      account_id: insight.account_id,
      account_name: insight.account_name,
      business_source: insight.business_source,
      spend,
      impressions: Number(insight.impressions || 0),
      clicks: Number(insight.clicks || 0),
      ctr: Math.round(Number(insight.ctr || 0) * 100) / 100,
      cpc: Math.round(Number(insight.cpc || 0) * 100) / 100,
      reach: Number(insight.reach || 0),
      leads,
      revenue,
      cpl: leads ? Math.round((spend / leads) * 100) / 100 : null,
      roas: spend ? Math.round((revenue / spend) * 100) / 100 : null,
      roi: spend ? Math.round(((revenue - spend) / spend) * 10000) / 100 : null,
    };
  }).sort((a, b) => b.spend - a.spend);

  return NextResponse.json({
    campaigns,
    total: totals(campaigns),
    period,
    since,
    until,
    accounts_found: accounts.length,
    accounts: accounts.map(({ id, name, source }) => ({ id, name, source })),
    meta_available: true,
    warnings,
  });
}
