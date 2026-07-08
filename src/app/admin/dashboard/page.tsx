import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { fetchAdminStats } from "@/lib/admin-stats";
import AdminNavbar from "@/components/admin/AdminNavbar";
import KpiCard from "@/components/admin/KpiCard";
import BarChart from "@/components/admin/BarChart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Titanium Admin",
  robots: { index: false, follow: false },
};

function formatBRL(v: number) {
  if (!v) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)    return "agora";
  if (diff < 3600)  return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const STATUS_COLOR: Record<string, string> = {
  Novo: "#3b82f6", Qualificado: "#eab308", Vendido: "#10b981", Perdido: "#ef4444",
};

export default async function DashboardPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) redirect("/admin/login");

  const stats = await fetchAdminStats();

  const funil = [
    { label: "Novo",        count: stats.por_status?.Novo        ?? 0, color: "#3b82f6" },
    { label: "Qualificado", count: stats.por_status?.Qualificado ?? 0, color: "#eab308" },
    { label: "Vendido",     count: stats.por_status?.Vendido     ?? 0, color: "#10b981" },
    { label: "Perdido",     count: stats.por_status?.Perdido     ?? 0, color: "#ef4444" },
  ];
  const funilMax = Math.max(...funil.map(f => f.count), 1);

  return (
    <>
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Todos os leads do Neon · dados ao vivo
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <KpiCard icon="📥" label="Hoje"        value={stats.hoje}       />
          <KpiCard icon="📅" label="7 dias"       value={stats.semana}     />
          <KpiCard icon="📆" label="30 dias"      value={stats.mes}        />
          <KpiCard icon="📊" label="Total"        value={stats.total}      />
          <KpiCard icon="🏆" label="Conversão"    value={`${stats.taxa_conversao}%`} color="#10b981" />
          <KpiCard icon="💰" label="Ticket médio" value={formatBRL(stats.ticket_medio_vendido)} color="#10b981" />
        </div>

        {/* Funil + Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Funil */}
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: "#0b0f17", borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
              Funil de Leads
            </p>
            <div className="space-y-4">
              {funil.map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-24 text-sm font-medium text-right" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {label}
                  </span>
                  <div className="flex-1 h-6 rounded-md overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                    <div
                      className="h-full rounded-md"
                      style={{
                        width: `${Math.max((count / funilMax) * 100, count > 0 ? 4 : 0)}%`,
                        backgroundColor: color, opacity: 0.85,
                      }}
                    />
                  </div>
                  <span className="w-8 text-sm font-bold text-white text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feed recente */}
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#0b0f17", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                Leads Recentes
              </p>
              <a href="/admin/leads" className="text-xs font-medium" style={{ color: "#10b981" }}>
                Ver todos →
              </a>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {stats.recentes.slice(0, 6).map((lead) => (
                <div key={lead.id} className="px-6 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{lead.name || "Sem nome"}</span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0"
                        style={{
                          backgroundColor: `${STATUS_COLOR[lead.status ?? "Novo"]}22`,
                          color: STATUS_COLOR[lead.status ?? "Novo"],
                        }}
                      >
                        {lead.status ?? "Novo"}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {lead.segment === "veiculos" ? "🚗" : "🏠"}{" "}
                      {lead.credit ? `R$ ${lead.credit}` : ""} · {lead.utm_source || "orgânico"}
                    </p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {timeAgo(lead.created_at)}
                  </span>
                </div>
              ))}
              {stats.recentes.length === 0 && (
                <div className="px-6 py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Nenhum lead ainda
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bar charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BarChart title="Por Fonte (UTM)"  data={stats.por_source}   color="#10b981" />
          <BarChart title="Por Landing Page" data={stats.por_lp}       color="#3b82f6" />
          <BarChart title="Por Segmento"     data={stats.por_segmento} color="#eab308" />
        </div>

      </main>
    </>
  );
}
