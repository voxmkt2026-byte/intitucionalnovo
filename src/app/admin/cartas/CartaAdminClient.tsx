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

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  const disponiveis   = cartas.filter((c) => c.disponivel).length;
  const indisponiveis = cartas.length - disponiveis;

  const thStyle = {
    padding: "14px 20px",
    textAlign: "left" as const,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#8A8A8A",
    backgroundColor: "#F8F7F4",
    borderBottom: "1px solid #E5E2DC",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F7F4", fontFamily: "var(--font-jakarta), sans-serif" }}>

      {/* Navbar */}
      <header style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E5E2DC" }} className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0A7B3E" }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "#1A1A1A" }}>Painel de Cartas</p>
            <p className="text-xs" style={{ color: "#8A8A8A" }}>Titanium Consultoria</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <a href="/cartas-contempladas" target="_blank"
            className="text-xs font-medium transition-colors cursor-pointer hover:underline"
            style={{ color: "#0A7B3E" }}>
            Ver vitrine →
          </a>
          <button onClick={handleLogout}
            className="text-xs cursor-pointer transition-colors hover:underline"
            style={{ color: "#8A8A8A" }}>
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total cadastrado",  value: cartas.length,  border: "#E5E2DC", bg: "#FFFFFF",   text: "#1A1A1A", sub: "#8A8A8A" },
            { label: "Visíveis no site",  value: disponiveis,    border: "#D1ECDD", bg: "#E8F5EE",   text: "#0A7B3E", sub: "#0D9E50" },
            { label: "Ocultas",           value: indisponiveis,  border: "#E5E2DC", bg: "#F8F7F4",   text: "#4A4A4A", sub: "#8A8A8A" },
          ].map(({ label, value, border, bg, text, sub }) => (
            <div key={label} className="rounded-2xl p-5" style={{ backgroundColor: bg, border: `1px solid ${border}`, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
              <p className="text-3xl font-bold" style={{ color: text }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: sub }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Header + CTA */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#8A8A8A" }}>Gestão</p>
            <h1 className="text-lg font-bold" style={{ color: "#1A1A1A" }}>Cartas Contempladas</h1>
          </div>
          <button
            onClick={() => { setEditCarta(null); setShowForm(true); }}
            className="flex items-center gap-2 font-semibold px-5 py-2.5 rounded-full cursor-pointer text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#0A7B3E", color: "#FFFFFF" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Carta
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 6px 24px rgba(0,0,0,.06)",
        }}>
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["Segmento", "Administradora", "Crédito", "Entrada", "Parcelas", "Parcela/mês", "Visível", ""].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #EFEDE8" }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} style={{ padding: "14px 20px" }}>
                        <div className="h-4 rounded-lg animate-pulse" style={{ backgroundColor: "#EFEDE8", width: "70%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : cartas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <p className="text-3xl mb-3">📋</p>
                    <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>Nenhuma carta cadastrada</p>
                    <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>Clique em &quot;Nova Carta&quot; para começar</p>
                  </td>
                </tr>
              ) : (
                cartas.map((carta) => (
                  <tr key={carta.id}
                    style={{ borderBottom: "1px solid #EFEDE8" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FAFAF8"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <td style={{ padding: "14px 20px" }}>
                      <div className="flex items-center gap-2">
                        <span>{carta.segmento === "veiculos" ? "🚗" : "🏠"}</span>
                        <span className="capitalize font-medium text-sm" style={{ color: "#1A1A1A" }}>
                          {carta.segmento === "veiculos" ? "Veículos" : "Imóveis"}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", color: "#4A4A4A", fontSize: "13px" }}>{carta.administradora}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span className="font-semibold" style={{ color: "#0A7B3E" }}>{formatBRL(carta.valor_credito)}</span>
                    </td>
                    <td style={{ padding: "14px 20px", color: "#4A4A4A", fontSize: "13px" }}>{formatBRL(carta.entrada)}</td>
                    <td style={{ padding: "14px 20px", color: "#4A4A4A", fontSize: "13px" }}>{carta.parcelas}x</td>
                    <td style={{ padding: "14px 20px", color: "#4A4A4A", fontSize: "13px" }}>{formatBRL(carta.valor_parcela)}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <button
                        onClick={() => handleToggle(carta)}
                        disabled={toggling === carta.id}
                        className="relative cursor-pointer transition-all"
                        style={{
                          width: "40px", height: "22px",
                          borderRadius: "999px",
                          backgroundColor: carta.disponivel ? "#0A7B3E" : "#E5E2DC",
                          opacity: toggling === carta.id ? 0.5 : 1,
                          border: "none",
                          flexShrink: 0,
                          display: "block",
                        }}
                      >
                        <span style={{
                          position: "absolute",
                          top: "3px",
                          left: carta.disponivel ? "21px" : "3px",
                          width: "16px", height: "16px",
                          borderRadius: "50%",
                          backgroundColor: "#FFFFFF",
                          transition: "left 0.2s ease",
                          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                        }} />
                      </button>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { setEditCarta(carta); setShowForm(true); }}
                          className="p-2 rounded-lg cursor-pointer transition-colors hover:opacity-70"
                          style={{ color: "#8A8A8A" }} title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(carta.id)}
                          disabled={deleting === carta.id}
                          className="p-2 rounded-lg cursor-pointer transition-colors hover:opacity-70 disabled:opacity-30"
                          style={{ color: "#C44040" }} title="Remover">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-center mt-6" style={{ color: "#8A8A8A" }}>
          Titanium Consultoria Financeira · CNPJ 46.640.755/0001-51
        </p>
      </main>

      {showForm && (
        <AdminCartaForm
          carta={editCarta}
          onClose={() => setShowForm(false)}
          onSave={fetchCartas}
        />
      )}
    </div>
  );
}
