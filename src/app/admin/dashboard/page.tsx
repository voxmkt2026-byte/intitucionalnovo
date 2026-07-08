import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { fetchAdminStats } from "@/lib/admin-stats";
import AdminNavbar from "@/components/admin/AdminNavbar";
import KpiCard from "@/components/admin/KpiCard";
import BarChart from "@/components/admin/BarChart";
import PieChart from "@/components/admin/PieChart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Titanium Admin",
  robots: { index: false, follow: false },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// Status badge colors
const STATUS_COLOR: Record<string, string> = {
  Novo: "#3b82f6", Qualificado: "#eab308", Vendido: "#0A7B3E", Perdido: "#ef4444",
};

// Segment SVG icons
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

// ─── Funil colors — same as PieChart default order ───────────────────────────
const FUNIL_COLORS = {
  Novo:        "#3b82f6",
  Qualificado: "#eab308",
  Vendido:     "#0A7B3E",
  Perdido:     "#ef4444",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) redirect("/admin/login");

  const stats = await fetchAdminStats();

  // Build status data for pie chart
  const statusPieData = Object.fromEntries(
    Object.entries(stats.por_status ?? {}).filter(([, v]) => v > 0)
  );

  // Funil colors array aligned with PieChart default palette
  const funilPieColors = (Object.keys(statusPieData) as string[]).map(
    (k) => FUNIL_COLORS[k as keyof typeof FUNIL_COLORS] ?? "#8b5cf6"
  );

  return (
    <>
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Page header ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.38)" }}>
              Titanium CRM · dados ao vivo · Neon Postgres
            </p>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: "rgba(10,123,62,0.12)", border: "1px solid rgba(10,123,62,0.25)" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#0A7B3E" }} />
            <span className="text-xs font-medium" style={{ color: "#15B85C" }}>Ao vivo</span>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <KpiCard iconKey="today"      label="Hoje"        value={stats.hoje}    color="#0A7B3E" />
          <KpiCard iconKey="week"       label="7 dias"      value={stats.semana}  color="#0D9E50" />
          <KpiCard iconKey="month"      label="30 dias"     value={stats.mes}     color="#15B85C" />
          <KpiCard iconKey="total"      label="Total"       value={stats.total}   color="#3b82f6" />
          <KpiCard iconKey="conversion" label="Conversão"   value={`${stats.taxa_conversao}%`} color="#0A7B3E" />
          <KpiCard iconKey="ticket"     label="Ticket médio" value={formatBRL(stats.ticket_medio_vendido)} color="#0A7B3E" />
        </div>

        {/* ── Funil Pizza + Feed recente ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Funil de status — Pie Chart */}
          <PieChart
            title="Funil de Leads por Status"
            data={statusPieData}
            colors={funilPieColors}
          />

          {/* Feed recente */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "#0b0f17", borderColor: "rgba(255,255,255,0.07)" }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                Leads Recentes
              </p>
              <a href="/admin/leads" className="text-xs font-medium flex items-center gap-1" style={{ color: "#15B85C" }}>
                Ver todos
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </a>
            </div>

            {/* Rows */}
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {stats.recentes.slice(0, 7).map((lead) => (
                <div key={lead.id} className="px-6 py-3 flex items-center gap-3">
                  {/* Segment icon */}
                  <span
                    className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg"
                    style={{
                      backgroundColor: lead.segment === "veiculos"
                        ? "rgba(59,130,246,0.12)"
                        : "rgba(10,123,62,0.12)",
                      color: lead.segment === "veiculos" ? "#60a5fa" : "#15B85C",
                    }}
                  >
                    {lead.segment === "veiculos" ? <IconVehicle /> : <IconBuilding />}
                  </span>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">
                        {lead.name || "Sem nome"}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0"
                        style={{
                          backgroundColor: `${STATUS_COLOR[lead.status ?? "Novo"]}20`,
                          color: STATUS_COLOR[lead.status ?? "Novo"],
                        }}
                      >
                        {lead.status ?? "Novo"}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>
                      {lead.credit ? `R$ ${lead.credit}` : "—"} · {lead.utm_source || "orgânico"}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1 shrink-0" style={{ color: "rgba(255,255,255,0.22)" }}>
                    <IconClock />
                    <span className="text-xs">{timeAgo(lead.created_at)}</span>
                  </div>
                </div>
              ))}

              {stats.recentes.length === 0 && (
                <div className="px-6 py-10 text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
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

        {/* ── Gráficos de pizza — 3 dimensões ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PieChart
            title="Por Fonte de Tráfego"
            data={stats.por_source ?? {}}
            colors={["#0A7B3E", "#15B85C", "#3b82f6", "#8b5cf6", "#f97316", "#06b6d4", "#eab308", "#ef4444"]}
          />
          <PieChart
            title="Por Landing Page"
            data={stats.por_lp ?? {}}
            colors={["#3b82f6", "#60a5fa", "#0A7B3E", "#15B85C", "#8b5cf6", "#a78bfa", "#f97316", "#06b6d4"]}
          />
          <PieChart
            title="Por Segmento"
            data={stats.por_segmento ?? {}}
            colors={["#0A7B3E", "#3b82f6", "#eab308", "#8b5cf6", "#f97316"]}
          />
        </div>

        {/* ── Bar charts — ranking detalhado ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <BarChart title="Ranking — UTM Source"  data={stats.por_source   ?? {}} color="#0A7B3E" />
          <BarChart title="Ranking — Landing Page" data={stats.por_lp      ?? {}} color="#3b82f6" />
          <BarChart title="Ranking — Segmento"     data={stats.por_segmento ?? {}} color="#eab308" />
        </div>

      </main>
    </>
  );
}
