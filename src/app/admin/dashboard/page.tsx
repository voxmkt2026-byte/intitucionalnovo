import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { fetchAdminStats } from "@/lib/admin-stats";
import KpiCard from "@/components/admin/KpiCard";
import BarChart from "@/components/admin/BarChart";
import PieChart from "@/components/admin/PieChart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Titanium Admin",
  robots: { index: false, follow: false },
};

// ── Integration status helper ────────────────────────────────────────────────
function IntegrationStatus() {
  const integrations = [
    { key: "neon",   label: "Neon DB",    ok: !!process.env.DATABASE_URL },
    { key: "capi",   label: "Meta CAPI",  ok: !!(process.env.META_ACCESS_TOKEN && process.env.META_PIXEL_ID) },
    { key: "kommo",  label: "Kommo CRM",  ok: !!process.env.KOMMO_ACCESS_TOKEN },
    { key: "sheets", label: "Sheets",     ok: !!process.env.SHEETS_WEBHOOK_URL },
    { key: "n8n",    label: "N8n",        ok: !!process.env.N8N_KOMMO_WEBHOOK_URL },
  ];
  return (
    <div style={{
      padding: '12px 18px',
      borderRadius: '12px', marginBottom: '28px',
      border: '1px solid var(--admin-border)',
      backgroundColor: 'var(--admin-surface)',
      boxShadow: 'var(--admin-card-shadow)',
      display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: '6px 20px',
    }}>
      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
        color: 'var(--admin-text-mute)', textTransform: 'uppercase' as const, marginRight: 4 }}>
        Integrações
      </span>
      {integrations.map(({ key, label, ok }) => (
        <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
          fontWeight: 500, color: ok ? 'var(--admin-text-soft)' : '#ef4444' }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
            backgroundColor: ok ? '#0A7B3E' : '#ef4444',
            boxShadow: ok ? '0 0 5px rgba(10,123,62,0.55)' : '0 0 5px rgba(239,68,68,0.55)',
          }} />
          {label}
        </span>
      ))}
    </div>
  );
}

function formatBRL(v: number) {
  if (!v) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", maximumFractionDigits: 0,
  }).format(v);
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)    return "agora";
  if (diff < 3600)  return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const STATUS_COLOR: Record<string, string> = {
  Novo: "#3b82f6", Qualificado: "#eab308", Vendido: "#0A7B3E", Perdido: "#ef4444",
};

const FUNIL_COLORS: Record<string, string> = {
  Novo: "#3b82f6", Qualificado: "#eab308", Vendido: "#0A7B3E", Perdido: "#ef4444",
};

function IconVehicle() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/>
      <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  );
}

export default async function DashboardPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) redirect("/admin/login");

  let stats;
  let dbError: string | null = null;
  try {
    stats = await fetchAdminStats();
  } catch (err: any) {
    dbError = err.message || "Falha ao carregar dados do Neon Postgres.";
    stats = {
      hoje: 0,
      semana: 0,
      mes: 0,
      total: 0,
      taxa_conversao: 0,
      ticket_medio_vendido: 0,
      por_status: {},
      por_source: {},
      por_lp: {},
      por_segmento: {},
      recentes: [],
    };
  }

  const statusPieData = Object.fromEntries(
    Object.entries(stats.por_status ?? {}).filter(([, v]) => v > 0)
  );
  const funilPieColors = (Object.keys(statusPieData) as string[]).map(
    (k) => FUNIL_COLORS[k] ?? "#8b5cf6"
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {dbError && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-xl flex flex-col gap-1 text-sm">
          <p className="font-semibold flex items-center gap-2 text-red-400">
            ⚠️ Alerta de Degradação de Serviço
          </p>
          <p>
            O painel está operando em modo degradado devido a uma falha na conexão com o banco de dados. Os números mostrados abaixo podem estar desatualizados ou zerados.
          </p>
          <p className="text-xs text-red-400/70 font-mono mt-1">Erro: {dbError}</p>
        </div>
      )}

      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-text)" }}>Visão Geral</h1>
          <p className="text-sm mt-1" style={{ color: "var(--admin-text-mute)" }}>
            Titanium CRM · dados ao vivo · Neon Postgres
          </p>
        </div>
        {/* Live pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
          backgroundColor: "var(--admin-brand-tint)",
          border: "1px solid var(--admin-brand-tint2)",
        }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--admin-brand)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--admin-brand)" }}>Ao vivo</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard iconKey="today"      label="Hoje"         value={stats.hoje}    />
        <KpiCard iconKey="week"       label="7 dias"       value={stats.semana}  />
        <KpiCard iconKey="month"      label="30 dias"      value={stats.mes}     />
        <KpiCard iconKey="total"      label="Total"        value={stats.total}   />
        <KpiCard iconKey="conversion" label="Conversão"    value={`${stats.taxa_conversao}%`} />
        <KpiCard iconKey="ticket"     label="Ticket médio" value={formatBRL(stats.ticket_medio_vendido)} />
      </div>

      {/* Integration Status */}
      <IntegrationStatus />

      {/* Funil Pizza + Feed recente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Funil */}
        <PieChart
          title="Funil de Leads por Status"
          data={statusPieData}
          colors={funilPieColors}
        />

        {/* Feed */}
        <div className="rounded-2xl border overflow-hidden" style={{
          backgroundColor: "var(--admin-surface)",
          borderColor: "var(--admin-border)",
          boxShadow: "var(--admin-card-shadow)",
        }}>
          {/* CSS hover for feed rows (server component can't use event handlers) */}
          <style dangerouslySetInnerHTML={{ __html: `.dash-feed-row { background-color: var(--admin-surface); transition: background-color 0.1s ease; } .dash-feed-row:hover { background-color: var(--admin-hover) !important; }` }} />

          <div className="px-6 py-4 border-b flex items-center justify-between"
               style={{ borderColor: "var(--admin-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest"
               style={{ color: "var(--admin-text-mute)" }}>
              Leads Recentes
            </p>
            <a href="/admin/leads"
               className="text-xs font-medium flex items-center gap-1"
               style={{ color: "var(--admin-brand)", textDecoration: "none" }}>
              Ver todos
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </a>
          </div>

          <div className="divide-y" style={{ borderColor: "var(--admin-border-2, var(--admin-border))" }}>
            {stats.recentes.slice(0, 7).map((lead) => (
              <div key={lead.id} className="dash-feed-row px-6 py-3 flex items-center gap-3">
                {/* Segment icon */}
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg"
                      style={{
                        backgroundColor: lead.segment === "veiculos" ? "rgba(59,130,246,0.1)" : "var(--admin-brand-tint)",
                        color: lead.segment === "veiculos" ? "#3b82f6" : "var(--admin-brand)",
                      }}>
                  {lead.segment === "veiculos" ? <IconVehicle /> : <IconBuilding />}
                </span>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: "var(--admin-text)" }}>
                      {lead.name || "Sem nome"}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0"
                          style={{
                            backgroundColor: `${STATUS_COLOR[lead.status ?? "Novo"]}18`,
                            color: STATUS_COLOR[lead.status ?? "Novo"],
                          }}>
                      {lead.status ?? "Novo"}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-mute)" }}>
                    {lead.credit ? `R$ ${lead.credit}` : "—"} · {lead.utm_source || "orgânico"}
                  </p>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 shrink-0" style={{ color: "var(--admin-text-mute)" }}>
                  <IconClock />
                  <span className="text-xs">{timeAgo(lead.created_at)}</span>
                </div>
              </div>
            ))}

            {stats.recentes.length === 0 && (
              <div className="px-6 py-10 text-center" style={{ color: "var(--admin-text-mute)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2" style={{ opacity: 0.4 }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p className="text-sm">Nenhum lead ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pie charts — 3 dimensões */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PieChart
          title="Por Fonte de Tráfego"
          data={stats.por_source ?? {}}
          colors={["#0A7B3E","#15B85C","#3b82f6","#8b5cf6","#f97316","#06b6d4","#eab308","#ef4444"]}
        />
        <PieChart
          title="Por Landing Page"
          data={stats.por_lp ?? {}}
          colors={["#3b82f6","#60a5fa","#0A7B3E","#15B85C","#8b5cf6","#a78bfa","#f97316","#06b6d4"]}
        />
        <PieChart
          title="Por Segmento"
          data={stats.por_segmento ?? {}}
          colors={["#0A7B3E","#3b82f6","#eab308","#8b5cf6","#f97316"]}
        />
      </div>

      {/* Bar charts — ranking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <BarChart title="Ranking — UTM Source"   data={stats.por_source   ?? {}} color="#0A7B3E" />
        <BarChart title="Ranking — Landing Page" data={stats.por_lp       ?? {}} color="#3b82f6" />
        <BarChart title="Ranking — Segmento"     data={stats.por_segmento ?? {}} color="#eab308" />
      </div>

    </main>
  );
}
