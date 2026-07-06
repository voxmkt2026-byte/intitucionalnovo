"use client";

import { useState, useEffect, useCallback } from "react";
import CartaFilters from "./CartaFilters";

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
}

interface Meta { total: number; page: number; pages: number; limit: number; }
interface Filters { segmentos: string[]; administradoras: string[]; }

function formatBRL(v: number | null) {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

type SortKey = "valor_credito" | "entrada" | "parcelas" | "valor_parcela" | "administradora";

interface LeadFormModal {
  carta: Carta;
  onClose: () => void;
}

function LeadFormModal({ carta, onClose }: LeadFormModal) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);

    // Capturar UTMs da URL atual
    const urlParams = new URLSearchParams(window.location.search);
    const cartaRef = `carta-${carta.id}-${carta.segmento}-${Math.round(carta.valor_credito / 1000)}k`;

    const payload = {
      ...form,
      segment:      carta.segmento,
      credit:       String(Math.round(carta.valor_credito)),
      months:       carta.parcelas,
      plan:         "standard",
      lp:           "cartas-contempladas",
      ref:          cartaRef,
      source_url:   window.location.href,
      utm_source:   urlParams.get("utm_source")   || "organico",
      utm_medium:   urlParams.get("utm_medium")   || "cartas-page",
      utm_campaign: urlParams.get("utm_campaign") || "cartas-contempladas",
      utm_content:  urlParams.get("utm_content")  || carta.administradora,
      // Dados extras da carta para cruzamento no Sheets
      carta_id:            String(carta.id),
      carta_administradora: carta.administradora,
      carta_valor:         String(carta.valor_credito),
      carta_entrada:       String(carta.entrada ?? ""),
      carta_parcelas:      String(carta.parcelas),
      timestamp:           new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSent(true);
      } else {
        setError("Erro ao enviar. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#1a1a2e] px-6 py-5 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Você está pegando</p>
          <p className="text-[#C41E3A] text-3xl font-bold">{formatBRL(carta.valor_credito)}</p>
          <p className="text-white/70 text-sm mt-1">{carta.administradora} · {carta.parcelas}x de {formatBRL(carta.valor_parcela)}</p>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Recebemos sua solicitação!</h3>
            <p className="text-gray-500 text-sm">Um consultor Titanium vai entrar em contato em breve com os detalhes desta carta.</p>
            <button onClick={onClose} className="mt-6 text-sm text-[#C41E3A] hover:underline cursor-pointer">Fechar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <p className="text-gray-800 font-semibold text-sm mb-4">Seus dados para reservar esta carta:</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nome completo *</label>
              <input
                type="text" required value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Seu nome"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/30 focus:border-[#C41E3A] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">WhatsApp *</label>
              <input
                type="tel" required value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/30 focus:border-[#C41E3A] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">E-mail</label>
              <input
                type="email" value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="seu@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/30 focus:border-[#C41E3A] transition-colors"
              />
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#C41E3A] hover:bg-[#a01830] disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors duration-200 cursor-pointer text-sm uppercase tracking-wide"
            >
              {loading ? "Enviando..." : "QUERO ESSE CRÉDITO →"}
            </button>
            <p className="text-center text-xs text-gray-400">
              Suas informações são 100% seguras e confidenciais.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function CartaRow({ carta, onCTA }: { carta: Carta; onCTA: () => void }) {
  const days = daysUntil(carta.proximo_vencimento);
  const isUrgent = days !== null && days <= 15;

  return (
    <tr className="border-b border-gray-100 hover:bg-[#C41E3A]/3 transition-colors duration-150 group">
      {/* Segmento */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{carta.segmento === "veiculos" ? "🚗" : "🏠"}</span>
          <div>
            <p className="font-semibold text-gray-800 capitalize text-sm">{carta.segmento === "veiculos" ? "Veículos" : "Imóveis"}</p>
            <p className="text-xs text-gray-400">{carta.administradora}</p>
          </div>
        </div>
      </td>

      {/* Crédito — destaque principal */}
      <td className="px-4 py-4">
        <p className="text-xl font-bold text-[#C41E3A]">{formatBRL(carta.valor_credito)}</p>
        <p className="text-xs text-gray-400 mt-0.5">crédito disponível</p>
      </td>

      {/* Entrada */}
      <td className="px-4 py-4">
        <p className="font-semibold text-gray-700 text-sm">{formatBRL(carta.entrada)}</p>
        <p className="text-xs text-gray-400">entrada</p>
      </td>

      {/* Parcelas */}
      <td className="px-4 py-4">
        <p className="font-semibold text-gray-700 text-sm">{carta.parcelas}x</p>
        <p className="text-xs text-[#C41E3A] font-medium">{formatBRL(carta.valor_parcela)}/mês</p>
      </td>

      {/* Urgência */}
      <td className="px-4 py-4">
        {days !== null ? (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
            ${isUrgent
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
            }`}>
            {isUrgent ? "⚡" : "✓"} {isUrgent ? `Vence em ${days}d` : "Disponível"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
            ✓ Disponível
          </span>
        )}
      </td>

      {/* CTA */}
      <td className="px-4 py-4">
        <button
          onClick={onCTA}
          className="bg-[#C41E3A] hover:bg-[#a01830] text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap shadow-sm hover:shadow-md group-hover:scale-[1.02] active:scale-95"
        >
          QUERO ESSE CRÉDITO
        </button>
      </td>
    </tr>
  );
}

function CartaMobileCard({ carta, onCTA }: { carta: Carta; onCTA: () => void }) {
  const days = daysUntil(carta.proximo_vencimento);
  const isUrgent = days !== null && days <= 15;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Top bar */}
      <div className="bg-[#1a1a2e] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{carta.segmento === "veiculos" ? "🚗" : "🏠"}</span>
          <div>
            <p className="text-white text-xs font-semibold">{carta.segmento === "veiculos" ? "Veículos" : "Imóveis"}</p>
            <p className="text-white/50 text-xs">{carta.administradora}</p>
          </div>
        </div>
        {days !== null && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${isUrgent ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
            {isUrgent ? `⚡ ${days}d` : "✓ Ok"}
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Credit value — big */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Crédito disponível</p>
          <p className="text-4xl font-black text-[#C41E3A]">{formatBRL(carta.valor_credito)}</p>
        </div>

        {/* Grid valores */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Entrada", val: formatBRL(carta.entrada) },
            { label: "Parcelas", val: `${carta.parcelas}x` },
            { label: "Por mês", val: formatBRL(carta.valor_parcela) },
          ].map(({ label, val }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm font-bold text-gray-700">{val}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onCTA}
          className="w-full bg-[#C41E3A] hover:bg-[#a01830] text-white font-black py-3.5 rounded-xl transition-colors duration-200 cursor-pointer text-sm tracking-wide active:scale-95"
        >
          QUERO ESSE CRÉDITO →
        </button>
      </div>
    </div>
  );
}

export default function CartasTable() {
  const [cartas,      setCartas]      = useState<Carta[]>([]);
  const [meta,        setMeta]        = useState<Meta>({ total: 0, page: 1, pages: 1, limit: 20 });
  const [filters,     setFilters]     = useState<Filters>({ segmentos: [], administradoras: [] });
  const [loading,     setLoading]     = useState(true);
  const [sort,        setSort]        = useState<SortKey>("valor_credito");
  const [dir,         setDir]         = useState<"asc" | "desc">("asc");
  const [page,        setPage]        = useState(1);
  const [selectedCarta, setSelected] = useState<Carta | null>(null);
  const [activeFilters, setActiveFilters] = useState({
    segmento: "", administradora: "", valorMin: "", valorMax: "",
  });

  const fetchCartas = useCallback(async (
    f = activeFilters, s = sort, d = dir, p = page,
  ) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.segmento)       params.set("segmento", f.segmento);
    if (f.administradora) params.set("administradora", f.administradora);
    if (f.valorMin)       params.set("valor_min", f.valorMin);
    if (f.valorMax)       params.set("valor_max", f.valorMax);
    params.set("sort", s); params.set("dir", d); params.set("page", String(p));

    try {
      const res  = await fetch(`/api/cartas?${params}`);
      const json = await res.json();
      setCartas(json.data || []);
      setMeta(json.meta || { total: 0, page: 1, pages: 1, limit: 20 });
      if (json.filters) setFilters(json.filters);
    } catch { setCartas([]); }
    finally  { setLoading(false); }
  }, [activeFilters, sort, dir, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchCartas(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSort(key: SortKey) {
    const newDir = sort === key && dir === "asc" ? "desc" : "asc";
    setSort(key); setDir(newDir); setPage(1);
    fetchCartas(activeFilters, key, newDir, 1);
  }

  function handleFilter(f: typeof activeFilters) {
    setActiveFilters(f); setPage(1);
    fetchCartas(f, sort, dir, 1);
  }

  function handlePage(p: number) {
    setPage(p);
    fetchCartas(activeFilters, sort, dir, p);
    window.scrollTo({ top: 300, behavior: "smooth" });
  }

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 opacity-50">{sort === col ? (dir === "asc" ? "↑" : "↓") : "↕"}</span>
  );

  const headers: { key: SortKey; label: string }[] = [
    { key: "administradora", label: "Tipo" },
    { key: "valor_credito",  label: "Crédito" },
    { key: "entrada",        label: "Entrada" },
    { key: "parcelas",       label: "Parcelas" },
  ];

  const urgentCount = cartas.filter((c) => {
    const d = daysUntil(c.proximo_vencimento);
    return d !== null && d <= 15;
  }).length;

  return (
    <>
      <CartaFilters
        segmentos={filters.segmentos}
        administradoras={filters.administradoras}
        onFilter={handleFilter}
      />

      {/* Urgency banner */}
      {!loading && urgentCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-lg">⚡</span>
          <p className="text-red-700 text-sm font-semibold">
            {urgentCount} carta{urgentCount > 1 ? "s" : ""} vencem em menos de 15 dias — quem pega primeiro leva.
          </p>
        </div>
      )}

      {/* Count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-4">
          {meta.total === 0
            ? "Nenhuma carta nos filtros selecionados"
            : `${meta.total} carta${meta.total !== 1 ? "s" : ""} com crédito disponível agora`}
        </p>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a1a2e] text-white">
                {headers.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-4 text-left font-semibold cursor-pointer hover:bg-white/10 transition-colors select-none text-sm"
                  >
                    {label}<SortIcon col={key} />
                  </th>
                ))}
                <th className="px-4 py-4 text-left font-semibold text-sm">Status</th>
                <th className="px-4 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-gray-50 rounded animate-pulse w-1/2 mt-1.5" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : cartas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="font-semibold">Nenhuma carta nos filtros selecionados</p>
                    <p className="text-sm mt-1">Tente ampliar os filtros ou entre em contato pelo WhatsApp</p>
                  </td>
                </tr>
              ) : (
                cartas.map((carta) => (
                  <CartaRow key={carta.id} carta={carta} onCTA={() => setSelected(carta)} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => handlePage(p)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-all cursor-pointer
                  ${page === p ? "bg-[#C41E3A] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-[#C41E3A]"}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="bg-gray-200 h-14" />
              <div className="p-4 space-y-3">
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, j) => <div key={j} className="h-14 bg-gray-100 rounded-xl" />)}
                </div>
                <div className="h-12 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))
        ) : cartas.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Nenhuma carta disponível</p>
        ) : (
          cartas.map((carta) => (
            <CartaMobileCard key={carta.id} carta={carta} onCTA={() => setSelected(carta)} />
          ))
        )}
        {!loading && meta.pages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => handlePage(p)}
                className={`w-9 h-9 rounded-full text-sm font-medium cursor-pointer
                  ${page === p ? "bg-[#C41E3A] text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lead capture modal */}
      {selectedCarta && (
        <LeadFormModal carta={selectedCarta} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
