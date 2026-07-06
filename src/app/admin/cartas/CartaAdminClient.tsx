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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Admin */}
      <header className="bg-[#1a1a2e] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C41E3A] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm">Titanium Consultoria</p>
            <p className="text-gray-400 text-xs">Painel de Cartas</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/cartas-contempladas" target="_blank" className="text-gray-400 hover:text-white text-xs transition-colors cursor-pointer">
            Ver site →
          </a>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-xs transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total de cartas", value: cartas.length, color: "bg-[#1a1a2e]" },
            { label: "Disponíveis",     value: disponiveis,   color: "bg-green-600" },
            { label: "Ocultas",         value: indisponiveis, color: "bg-gray-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} text-white rounded-2xl p-5`}>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm opacity-70 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Header + CTA */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">Cartas Contempladas</h1>
          <button
            onClick={() => { setEditCarta(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-[#C41E3A] hover:bg-[#a01830] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors duration-200 cursor-pointer text-sm shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Carta
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Segmento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Administradora</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Crédito</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Entrada</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Parcelas</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Parcela/mês</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Disponível</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : cartas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-400">
                    Nenhuma carta cadastrada. Clique em &quot;Nova Carta&quot; para começar.
                  </td>
                </tr>
              ) : (
                cartas.map((carta) => (
                  <tr key={carta.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="capitalize font-medium text-gray-700">{carta.segmento}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{carta.administradora}</td>
                    <td className="px-4 py-3 font-semibold text-[#C41E3A]">{formatBRL(carta.valor_credito)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatBRL(carta.entrada)}</td>
                    <td className="px-4 py-3 text-gray-600">{carta.parcelas}x</td>
                    <td className="px-4 py-3 text-gray-600">{formatBRL(carta.valor_parcela)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(carta)}
                        disabled={toggling === carta.id}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer
                          ${carta.disponivel ? "bg-green-500" : "bg-gray-300"}
                          ${toggling === carta.id ? "opacity-50" : ""}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                          ${carta.disponivel ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => { setEditCarta(carta); setShowForm(true); }}
                          className="text-gray-400 hover:text-[#1a1a2e] transition-colors cursor-pointer p-1"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(carta.id)}
                          disabled={deleting === carta.id}
                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1 disabled:opacity-40"
                          title="Remover"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
      </main>

      {/* Modal Form */}
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
