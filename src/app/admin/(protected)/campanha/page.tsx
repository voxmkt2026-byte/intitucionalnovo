import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import CampaignTable from "@/components/admin/CampaignTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campanha | Titanium Admin",
  robots: { index: false, follow: false },
};

export default async function CampanhaPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) redirect("/admin/login");

  const hasMetaToken = !!(
    process.env.META_MARKETING_ACCESS_TOKEN &&
    process.env.META_MARKETING_ACCESS_TOKEN.length > 10
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-text)" }}>
            Performance de Campanha
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--admin-text-mute)" }}>
            Meta Ads · dados ao vivo · cruzado com leads internos
          </p>
        </div>
        {/* Meta status pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: hasMetaToken ? "var(--admin-brand-tint)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${hasMetaToken ? "var(--admin-brand-tint2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: hasMetaToken ? "var(--admin-brand)" : "#ef4444",
              boxShadow: hasMetaToken ? "0 0 5px rgba(10,123,62,0.6)" : "0 0 5px rgba(239,68,68,0.5)",
            }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: hasMetaToken ? "var(--admin-brand)" : "#ef4444" }}
          >
            {hasMetaToken ? "Meta API conectada" : "META_MARKETING_ACCESS_TOKEN ausente"}
          </span>
        </div>
      </div>

      {!hasMetaToken ? (
        /* Setup guide when token missing */
        <div style={{
          padding: "40px",
          borderRadius: "16px",
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          textAlign: "center",
          boxShadow: "var(--admin-card-shadow)",
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
               stroke="var(--admin-text-mute)" strokeWidth="1.2" strokeLinecap="round"
               style={{ margin: "0 auto 16px" }}>
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            <path d="M15 9a3 3 0 1 1-4.927 2.298C10.027 11.77 11 13 11 14v1"/>
            <circle cx="12" cy="18" r=".5" fill="currentColor"/>
          </svg>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--admin-text)", marginBottom: "8px" }}>
            META_MARKETING_ACCESS_TOKEN não configurado
          </h2>
          <p style={{ fontSize: "13px", color: "var(--admin-text-mute)", maxWidth: "420px", margin: "0 auto 20px" }}>
            Para ver os dados de campanha, adicione o token de acesso da Meta no painel do Vercel.
          </p>
          <div style={{
            padding: "16px 20px", borderRadius: "10px",
            background: "var(--admin-bg2)", border: "1px solid var(--admin-border)",
            textAlign: "left", maxWidth: "420px", margin: "0 auto",
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--admin-text-mute)",
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
              Como configurar
            </div>
            <ol style={{ fontSize: "12px", color: "var(--admin-text-soft)", lineHeight: "1.8", paddingLeft: "16px", margin: 0 }}>
              <li>Acesse vercel.com → seu projeto</li>
              <li>Settings → Environment Variables</li>
              <li>Adicione <code style={{ background: "var(--admin-border)", padding: "1px 5px", borderRadius: "3px" }}>META_MARKETING_ACCESS_TOKEN</code></li>
              <li>Redeploy o projeto</li>
            </ol>
          </div>
        </div>
      ) : (
        <CampaignTable />
      )}
    </main>
  );
}
