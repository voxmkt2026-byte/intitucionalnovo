"use client";

import { useState, useEffect } from "react";
import AdminCartaForm from "@/components/AdminCartaForm";

export interface Carta {
  id: number;
  segmento: string;
  administradora: string;
  valor_credito: number;
  entrada: number | null;
  parcelas: number;
  valor_parcela: number;
  proximo_vencimento: string | null;
  disponivel: boolean;
  criado_em: string;
}

function formatBRL(v: number | null) {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function IconCar() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/>
      <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"/>
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 4v16m8-8H4"/>
    </svg>
  );
}

export default function CartaAdminClient() {
  const [cartas,    setCartas]    = useState<Carta[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editCarta, setEditCarta] = useState<Carta | null>(null);
  const [deleting,  setDeleting]  = useState<number | null>(null);
  const [toggling,  setToggling]  = useState<number | null>(null);

  async function fetchCartas() {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/cartas");
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const json = await res.json();
      setCartas(json.data || []);
    } catch {
      setCartas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCartas(); }, []);

  async function handleToggle(carta: Carta) {
    setToggling(carta.id);
    await fetch(`/api/admin/cartas/${carta.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponivel: !carta.disponivel }),
    });
    await fetchCartas();
    setToggling(null);
  }

  async function handleDelete(id: number) {
    if (!confirm("Remover esta carta do site?")) return;
    setDeleting(id);
    await fetch(`/api/admin/cartas/${id}`, { method: "DELETE" });
    await fetchCartas();
    setDeleting(null);
  }

  const disponiveis   = cartas.filter((c) => c.disponivel).length;
  const indisponiveis = cartas.length - disponiveis;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5"
             style={{ color: "var(--admin-text-mute)" }}>
            Gestão
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-text)" }}>
            Cartas Contempladas
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--admin-text-mute)" }}>
            Edite e publique cartas visíveis na vitrine
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View storefront */}
          <a href="/cartas-contempladas" target="_blank"
             className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
             style={{
               color: "var(--admin-brand)", textDecoration: "none",
               backgroundColor: "var(--admin-brand-tint)",
               border: "1px solid var(--admin-brand-tint2)",
             }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Ver vitrine
          </a>
          {/* Add new */}
          <button
            onClick={() => { setEditCarta(null); setShowForm(true); }}
            className="flex items-center gap-2 font-semibold px-5 py-2.5 rounded-full text-sm cursor-pointer"
            style={{ backgroundColor: "var(--admin-brand)", color: "#FFFFFF", border: "none" }}
          >
            <IconPlus />
            Nova Carta
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total cadastrado", value: cartas.length,  accent: false },
          { label: "Visíveis no site", value: disponiveis,    accent: true  },
          { label: "Ocultas",          value: indisponiveis,  accent: false },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-2xl p-5"
               style={{
                 backgroundColor: accent ? "var(--admin-brand-tint)" : "var(--admin-surface)",
                 border: `1px solid ${accent ? "var(--admin-brand-tint2)" : "var(--admin-border)"}`,
                 boxShadow: "var(--admin-card-shadow)",
               }}>
            <p className="text-3xl font-bold"
               style={{ color: accent ? "var(--admin-brand)" : "var(--admin-text)" }}>
              {value}
            </p>
            <p className="text-xs mt-1" style={{ color: accent ? "var(--admin-brand-mid)" : "var(--admin-text-mute)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
           style={{
             backgroundColor: "var(--admin-surface)",
             boxShadow: "var(--admin-card-shadow)",
             border: "1px solid var(--admin-border)",
           }}>
        <table className="w-full text-sm">
          <thead>
            <tr>
              {["Segmento", "Administradora", "Crédito", "Entrada", "Parcelas", "Parcela/mês", "Visível", ""].map((h) => (
                <th key={h} style={{
                  padding: "14px 20px", textAlign: "left" as const,
                  fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em",
                  textTransform: "uppercase" as const,
                  color: "var(--admin-text-mute)",
                  backgroundColor: "var(--admin-bg)",
                  borderBottom: "1px solid var(--admin-border)",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--admin-border)" }}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} style={{ padding: "14px 20px" }}>
                      <div className="h-4 rounded-lg animate-pulse"
                           style={{ backgroundColor: "var(--admin-skeleton)", width: "70%" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : cartas.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                       className="mx-auto mb-3" style={{ color: "var(--admin-text-mute)", opacity: 0.5 }}>
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
                  </svg>
                  <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>
                    Nenhuma carta cadastrada
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--admin-text-mute)" }}>
                    Clique em &quot;Nova Carta&quot; para começar
                  </p>
                </td>
              </tr>
            ) : (
              cartas.map((carta) => (
                <tr key={carta.id}
                    style={{ borderBottom: "1px solid var(--admin-border)" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = "var(--admin-hover)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}>
                  {/* Segmento */}
                  <td style={{ padding: "14px 20px" }}>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-md"
                            style={{
                              backgroundColor: carta.segmento === "veiculos" ? "rgba(59,130,246,0.1)" : "var(--admin-brand-tint)",
                              color: carta.segmento === "veiculos" ? "#3b82f6" : "var(--admin-brand)",
                            }}>
                        {carta.segmento === "veiculos" ? <IconCar /> : <IconBuilding />}
                      </span>
                      <span className="capitalize font-medium text-sm" style={{ color: "var(--admin-text)" }}>
                        {carta.segmento === "veiculos" ? "Veículos" : "Imóveis"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--admin-text-soft)", fontSize: "13px" }}>
                    {carta.administradora}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span className="font-semibold" style={{ color: "var(--admin-brand)" }}>
                      {formatBRL(carta.valor_credito)}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--admin-text-soft)", fontSize: "13px" }}>
                    {formatBRL(carta.entrada)}
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--admin-text-soft)", fontSize: "13px" }}>
                    {carta.parcelas}x
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--admin-text-soft)", fontSize: "13px" }}>
                    {formatBRL(carta.valor_parcela)}
                  </td>
                  {/* Toggle */}
                  <td style={{ padding: "14px 20px" }}>
                    <button
                      onClick={() => handleToggle(carta)}
                      disabled={toggling === carta.id}
                      className="relative cursor-pointer"
                      style={{
                        width: "40px", height: "22px", borderRadius: "999px", display: "block",
                        backgroundColor: carta.disponivel ? "var(--admin-brand)" : "var(--admin-toggle-off)",
                        opacity: toggling === carta.id ? 0.5 : 1,
                        border: "none", transition: "background-color 0.2s",
                      }}
                    >
                      <span style={{
                        position: "absolute", top: "3px",
                        left: carta.disponivel ? "21px" : "3px",
                        width: "16px", height: "16px",
                        borderRadius: "50%", backgroundColor: "#FFFFFF",
                        transition: "left 0.2s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                      }} />
                    </button>
                  </td>
                  {/* Actions */}
                  <td style={{ padding: "14px 20px" }}>
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => { setEditCarta(carta); setShowForm(true); }}
                        className="p-2 rounded-lg cursor-pointer"
                        style={{ color: "var(--admin-text-mute)", background: "none", border: "none" }}
                        title="Editar"
                      >
                        <IconEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(carta.id)}
                        disabled={deleting === carta.id}
                        className="p-2 rounded-lg cursor-pointer disabled:opacity-30"
                        style={{ color: "#C44040", background: "none", border: "none" }}
                        title="Remover"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-center mt-6" style={{ color: "var(--admin-text-mute)" }}>
        Titanium Consultoria Financeira
      </p>

      {showForm && (
        <AdminCartaForm
          carta={editCarta}
          onClose={() => setShowForm(false)}
          onSave={fetchCartas}
        />
      )}
    </main>
  );
}
