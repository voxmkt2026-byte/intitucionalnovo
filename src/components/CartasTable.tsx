"use client";

import { useState, useEffect, useCallback } from "react";
import CartaFilters from "@/components/CartaFilters";

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
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

type SortKey = "valor_credito" | "entrada" | "parcelas" | "valor_parcela" | "administradora";

/* ── Lead Capture Modal ────────────────────────────────────────────── */
function LeadModal({ carta, onClose }: { carta: Carta; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);

    const urlParams  = new URLSearchParams(window.location.search);
    const cartaRef   = `carta-${carta.id}-${carta.segmento}-${Math.round(carta.valor_credito / 1000)}k`;

    try {
      const res = await fetch("/api/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          segment:              carta.segmento,
          credit:               String(Math.round(carta.valor_credito)),
          months:               carta.parcelas,
          plan:                 "standard",
          lp:                   "cartas-contempladas",
          ref:                  cartaRef,
          source_url:           window.location.href,
          utm_source:           urlParams.get("utm_source")   || "organico",
          utm_medium:           urlParams.get("utm_medium")   || "cartas-page",
          utm_campaign:         urlParams.get("utm_campaign") || "cartas-contempladas",
          utm_content:          urlParams.get("utm_content")  || carta.administradora,
          carta_id:             String(carta.id),
          carta_administradora: carta.administradora,
          carta_valor:          String(carta.valor_credito),
          carta_entrada:        String(carta.entrada ?? ""),
          carta_parcelas:       String(carta.parcelas),
          timestamp:            new Date().toISOString(),
        }),
      });
      if (res.ok) { setSent(true); } else { setError("Erro ao enviar. Tente novamente."); }
    } catch { setError("Erro de conexão. Tente novamente."); }
    finally  { setLoading(false); }
  }

  const inputStyle = {
    border: "1px solid #E5E2DC",
    backgroundColor: "#F8F7F4",
    color: "#1A1A1A",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(26,26,26,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 12px rgba(0,0,0,.05), 0 16px 48px rgba(0,0,0,.08)" }}>
        {/* Card top: carta info */}
        <div className="px-6 py-5 relative" style={{ backgroundColor: "#1A1F1C" }}>
          <button onClick={onClose} className="absolute top-4 right-4 cursor-pointer transition-opacity hover:opacity-70" style={{ color: "#8A8A8A" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#8A8A8A" }}>Carta selecionada</p>
          <p className="text-3xl font-bold" style={{ color: "#34d399" }}>{formatBRL(carta.valor_credito)}</p>
          <p className="text-sm mt-1" style={{ color: "#8A8A8A" }}>{carta.administradora} · {carta.parcelas}x de {formatBRL(carta.valor_parcela)}</p>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(16,185,129,0.08)" }}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#10b981" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#1A1A1A" }}>Solicitação recebida</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>
              Um especialista Titanium entrará em contato para verificar a disponibilidade e estruturar a operação.
            </p>
            <button onClick={onClose} className="mt-5 text-sm cursor-pointer hover:underline" style={{ color: "#10b981" }}>Fechar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>Seus dados para análise consultiva:</p>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#8A8A8A" }}>Nome completo *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Seu nome" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#10b981"}
                onBlur={(e) => e.target.style.borderColor = "#E5E2DC"} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#8A8A8A" }}>WhatsApp *</label>
              <input type="tel" required value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#10b981"}
                onBlur={(e) => e.target.style.borderColor = "#E5E2DC"} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#8A8A8A" }}>E-mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="seu@email.com" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#10b981"}
                onBlur={(e) => e.target.style.borderColor = "#E5E2DC"} />
            </div>

            {error && <p className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "#FEF2F2", color: "#C44040" }}>{error}</p>}

            <button type="submit" disabled={loading} className="w-full font-semibold py-3.5 rounded-full cursor-pointer transition-opacity duration-200 text-sm" style={{ backgroundColor: "#10b981", color: "#FFFFFF", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Enviando..." : "Solicitar análise consultiva"}
            </button>
            <p className="text-center text-xs" style={{ color: "#8A8A8A" }}>Sem compromisso. Orientação estratégica.</p>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Carta Row (Desktop) ───────────────────────────────────────────── */
function CartaRow({ carta, onCTA }: { carta: Carta; onCTA: () => void }) {
  const days = daysUntil(carta.proximo_vencimento);
  const isUrgent = days !== null && days <= 15;

  return (
    <tr className="group transition-colors duration-150" style={{ borderBottom: "1px solid #EFEDE8" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FAFAF8")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">{carta.segmento === "veiculos" ? "🚗" : "🏠"}</span>
          <div>
            <p className="font-semibold text-sm capitalize" style={{ color: "#1A1A1A" }}>
              {carta.segmento === "veiculos" ? "Veículos" : "Imóveis"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#8A8A8A" }}>{carta.administradora}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-lg font-bold" style={{ color: "#10b981" }}>{formatBRL(carta.valor_credito)}</p>
        <p className="text-xs mt-0.5" style={{ color: "#8A8A8A" }}>crédito contemplado</p>
      </td>
      <td className="px-5 py-4">
        <p className="font-medium text-sm" style={{ color: "#4A4A4A" }}>{formatBRL(carta.entrada)}</p>
        <p className="text-xs" style={{ color: "#8A8A8A" }}>entrada</p>
      </td>
      <td className="px-5 py-4">
        <p className="font-medium text-sm" style={{ color: "#4A4A4A" }}>{carta.parcelas}x</p>
        <p className="text-xs font-medium" style={{ color: "#059669" }}>{formatBRL(carta.valor_parcela)}/mês</p>
      </td>
      <td className="px-5 py-4">
        {days !== null ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
            style={isUrgent
              ? { backgroundColor: "#FEF2F2", color: "#C44040", border: "1px solid #FECACA" }
              : { backgroundColor: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
            {isUrgent ? `Vence em ${days}d` : "Disponível"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
            Disponível
          </span>
        )}
      </td>
      <td className="px-5 py-4">
        <button onClick={onCTA}
          className="text-xs font-semibold px-5 py-2.5 rounded-full cursor-pointer transition-opacity duration-150 whitespace-nowrap"
          style={{ backgroundColor: "#10b981", color: "#FFFFFF" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#059669")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#10b981")}>
          Verificar disponibilidade
        </button>
      </td>
    </tr>
  );
}

/* ── Carta Mobile Card ─────────────────────────────────────────────── */
function CartaMobileCard({ carta, onCTA }: { carta: Carta; onCTA: () => void }) {
  const days = daysUntil(carta.proximo_vencimento);
  const isUrgent = days !== null && days <= 15;

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      backgroundColor: "#FFFFFF",
      boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 6px 24px rgba(0,0,0,.06)",
    }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "#1A1F1C" }}>
        <div className="flex items-center gap-2">
          <span>{carta.segmento === "veiculos" ? "🚗" : "🏠"}</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
              {carta.segmento === "veiculos" ? "Veículos" : "Imóveis"}
            </p>
            <p className="text-xs" style={{ color: "#8A8A8A" }}>{carta.administradora}</p>
          </div>
        </div>
        {days !== null && (
          <span className="text-xs font-medium px-2 py-1 rounded-full"
            style={isUrgent
              ? { backgroundColor: "#C44040", color: "#FFFFFF" }
              : { backgroundColor: "#10b981", color: "#FFFFFF" }}>
            {isUrgent ? `${days}d` : "OK"}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="text-center mb-4">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8A8A8A" }}>Crédito contemplado</p>
          <p className="text-3xl font-bold" style={{ color: "#10b981" }}>{formatBRL(carta.valor_credito)}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Entrada",  val: formatBRL(carta.entrada) },
            { label: "Parcelas", val: `${carta.parcelas}x` },
            { label: "Por mês",  val: formatBRL(carta.valor_parcela) },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#F8F7F4" }}>
              <p className="text-xs mb-0.5" style={{ color: "#8A8A8A" }}>{label}</p>
              <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{val}</p>
            </div>
          ))}
        </div>

        <button onClick={onCTA}
          className="w-full font-semibold py-3 rounded-full cursor-pointer text-sm transition-opacity"
          style={{ backgroundColor: "#10b981", color: "#FFFFFF" }}>
          Verificar disponibilidade
        </button>
      </div>
    </div>
  );
}

/* ── Main CartasTable ──────────────────────────────────────────────── */
export default function CartasTable() {
  const [cartas,   setCartas]   = useState<Carta[]>([]);
  const [meta,     setMeta]     = useState<Meta>({ total: 0, page: 1, pages: 1, limit: 20 });
  const [filters,  setFilters]  = useState<Filters>({ segmentos: [], administradoras: [] });
  const [loading,  setLoading]  = useState(true);
  const [sort,     setSort]     = useState<SortKey>("valor_credito");
  const [dir,      setDir]      = useState<"asc" | "desc">("asc");
  const [page,     setPage]     = useState(1);
  const [selected, setSelected] = useState<Carta | null>(null);
  const [active,   setActive]   = useState({ segmento: "", administradora: "", valorMin: "", valorMax: "" });

  const fetchCartas = useCallback(async (
    f = active, s = sort, d = dir, p = page,
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
  }, [active, sort, dir, page]); // eslint-disable-line

  useEffect(() => { fetchCartas(); }, []); // eslint-disable-line

  function handleSort(key: SortKey) {
    const nd = sort === key && dir === "asc" ? "desc" : "asc";
    setSort(key); setDir(nd); setPage(1);
    fetchCartas(active, key, nd, 1);
  }

  function handleFilter(f: typeof active) {
    setActive(f); setPage(1);
    fetchCartas(f, sort, dir, 1);
  }

  function handlePage(p: number) {
    setPage(p);
    fetchCartas(active, sort, dir, p);
    window.scrollTo({ top: 300, behavior: "smooth" });
  }

  const headers: { key: SortKey; label: string }[] = [
    { key: "administradora", label: "Segmento" },
    { key: "valor_credito",  label: "Crédito" },
    { key: "entrada",        label: "Entrada" },
    { key: "parcelas",       label: "Parcelas" },
  ];

  const Skeleton = () => (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} style={{ borderBottom: "1px solid #EFEDE8" }}>
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-5 py-4">
              <div className="h-4 rounded-lg animate-pulse w-3/4" style={{ backgroundColor: "#EFEDE8" }} />
              <div className="h-3 rounded-lg animate-pulse w-1/2 mt-1.5" style={{ backgroundColor: "#E5E2DC" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  const PageBtn = ({ p }: { p: number }) => (
    <button onClick={() => handlePage(p)}
      className="w-9 h-9 rounded-full text-sm font-medium cursor-pointer transition-all"
      style={page === p
        ? { backgroundColor: "#10b981", color: "#FFFFFF" }
        : { backgroundColor: "#FFFFFF", color: "#4A4A4A", border: "1px solid #E5E2DC" }}>
      {p}
    </button>
  );

  return (
    <>
      <CartaFilters segmentos={filters.segmentos} administradoras={filters.administradoras} onFilter={handleFilter} />

      {!loading && (
        <p className="text-sm mb-4" style={{ color: "#8A8A8A" }}>
          {meta.total === 0
            ? "Nenhuma carta nos filtros selecionados"
            : `${meta.total} carta${meta.total !== 1 ? "s" : ""} verificada${meta.total !== 1 ? "s" : ""} disponível${meta.total !== 1 ? "veis" : ""}`}
        </p>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="rounded-2xl overflow-hidden" style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 6px 24px rgba(0,0,0,.06)",
        }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#1A1F1C" }}>
                {headers.map(({ key, label }) => (
                  <th key={key} onClick={() => handleSort(key)}
                    className="px-5 py-4 text-left text-xs font-semibold cursor-pointer select-none uppercase tracking-wide transition-colors"
                    style={{ color: "#8A8A8A" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8A8A")}>
                    {label}
                    <span className="ml-1 opacity-40">{sort === key ? (dir === "asc" ? "↑" : "↓") : "↕"}</span>
                  </th>
                ))}
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#8A8A8A" }}>Status</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? <Skeleton /> : cartas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <p className="text-3xl mb-3">🔍</p>
                    <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>Nenhuma carta disponível</p>
                    <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>Tente outros filtros ou entre em contato</p>
                  </td>
                </tr>
              ) : cartas.map((c) => <CartaRow key={c.id} carta={c} onCTA={() => setSelected(c)} />)}
            </tbody>
          </table>
        </div>
        {meta.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: meta.pages }, (_, i) => <PageBtn key={i} p={i + 1} />)}
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="h-14" style={{ backgroundColor: "#EFEDE8" }} />
              <div className="p-4 space-y-3">
                <div className="h-10 rounded-xl" style={{ backgroundColor: "#EFEDE8" }} />
                <div className="grid grid-cols-3 gap-2">
                  {[0,1,2].map(j => <div key={j} className="h-14 rounded-xl" style={{ backgroundColor: "#EFEDE8" }} />)}
                </div>
                <div className="h-11 rounded-full" style={{ backgroundColor: "#EFEDE8" }} />
              </div>
            </div>
          ))
        ) : cartas.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: "#8A8A8A" }}>Nenhuma carta disponível</p>
        ) : cartas.map((c) => <CartaMobileCard key={c.id} carta={c} onCTA={() => setSelected(c)} />)}
        {!loading && meta.pages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            {Array.from({ length: meta.pages }, (_, i) => <PageBtn key={i} p={i + 1} />)}
          </div>
        )}
      </div>

      {selected && <LeadModal carta={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
