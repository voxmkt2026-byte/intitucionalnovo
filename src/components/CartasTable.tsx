"use client";

import { useState, useEffect, useCallback } from "react";
import CartaFilters from "@/components/CartaFilters";
import { formatVencimentoDate } from "@/lib/excel-parser";
import AdministradoraLogo from "@/components/AdministradoraLogo";

export interface Carta {
  id: number;
  segmento: string;
  administradora: string;
  valor_credito: number;
  entrada: number | null;
  parcelas: number;
  valor_parcela: number;
  proximo_vencimento: string | null;
  taxa_transferencia?: string | null;
  vencimento_parcela?: string | null;
  observacoes?: string | null;
  disponivel: boolean;
}

interface Meta {
  total: number;
  page: number;
  pages: number;
  limit: number;
}
interface Filters {
  segmentos: string[];
  administradoras: string[];
}

const WHATSAPP_NUMBER = "5511930048940";

function formatBRL(v: number | null | undefined) {
  if (v == null || isNaN(v)) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function buildWhatsAppMessage(carta: Carta): string {
  const adminName = carta.administradora || "Consórcio";
  const creditoStr = formatBRL(carta.valor_credito);
  const entradaStr = formatBRL(carta.entrada);
  const parcelaStr = formatBRL(carta.valor_parcela);
  const vencStr = formatVencimentoDate(carta.vencimento_parcela || carta.proximo_vencimento);

  return `Olá! Vi no site da Titanium e tenho interesse na seguinte carta contemplada:\n\n` +
    `• Crédito: ${creditoStr}\n` +
    `• Entrada: ${entradaStr}\n` +
    `• Parcelas: ${carta.parcelas}x de ${parcelaStr}\n` +
    `• Administradora: ${adminName}\n` +
    `• Vencimento: ${vencStr}\n\n` +
    `Gostaria de verificar a disponibilidade para transferência imediata.`;
}

function triggerWhatsAppClick(carta: Carta) {
  const msg = buildWhatsAppMessage(carta);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return "";
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? match[2] : "";
    };

    fetch("/api/leads/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Interesse WhatsApp Vitrine",
        phone: "WhatsApp Direct",
        email: "",
        segment: carta.segmento,
        credit: String(Math.round(carta.valor_credito)),
        months: carta.parcelas,
        plan: "whatsapp",
        lp: "cartas-contempladas",
        ref: `wpp-carta-${carta.id}-${Math.round(carta.valor_credito / 1000)}k`,
        source_url: window.location.href,
        utm_source: urlParams.get("utm_source") || "organico",
        utm_medium: urlParams.get("utm_medium") || "cartas-page",
        utm_campaign: urlParams.get("utm_campaign") || "cartas-contempladas",
        utm_content: urlParams.get("utm_content") || carta.administradora,
        utm_term: urlParams.get("utm_term") || "",
        gclid: urlParams.get("gclid") || "",
        fbc: getCookie("_fbc"),
        fbp: getCookie("_fbp"),
        carta_id: String(carta.id),
        carta_administradora: carta.administradora,
        carta_valor: String(carta.valor_credito),
        carta_entrada: String(carta.entrada ?? ""),
        carta_parcelas: String(carta.parcelas),
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  } catch (e) {
    console.error("Erro ao registrar clique wpp", e);
  }

  window.open(url, "_blank");
}

type SortKey = "valor_credito" | "entrada" | "parcelas" | "valor_parcela" | "administradora";

/* ── Lead Capture / Detalhamento Modal ──────────────────────────────── */
function LeadModal({ carta, onClose }: { carta: Carta; onClose: () => void }) {
  const totalRestante = (carta.parcelas || 0) * (carta.valor_parcela || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col my-8 transition-transform transform scale-100"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {/* Top Header Card */}
        <div className="px-6 py-5 relative flex items-center justify-between border-b border-slate-100 bg-slate-900">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
              Ficha de Crédito Contemplado
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-white">
                {formatBRL(carta.valor_credito)}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${carta.segmento === "veiculos" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                {carta.segmento === "veiculos" ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V9.75M3.822 9.75h16.356M3.822 9.75c-.322 0-.615-.17-.774-.45l-1.48-2.584A1.125 1.125 0 012.538 5h18.924c.427 0 .812.241.996.627l1.48 2.584a1.127 1.127 0 01-.774.45M3.822 9.75L2.25 14.25m17.928-4.5l1.572 4.5m-19.5 0h19.5m-19.5 0v3.375c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125V14.25" />
                    </svg>
                    Veículos
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    Imóveis
                  </>
                )}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/95 px-3 py-1.5 rounded-lg shrink-0 mr-6">
              <AdministradoraLogo name={carta.administradora} className="h-5 max-w-[100px] object-contain" />
            </div>
            
            <button
              onClick={onClose}
              className="absolute top-5 right-5 cursor-pointer transition-opacity hover:opacity-75 text-gray-400 hover:text-white border-none bg-transparent"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Technical Details & Direct WhatsApp CTA */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ficha Técnica do Consórcio
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Crédito Contemplado</span>
                <span className="text-base font-bold text-slate-900">{formatBRL(carta.valor_credito)}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Valor de Entrada</span>
                <span className="text-base font-bold text-emerald-600">{formatBRL(carta.entrada)}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Parcelas Restantes</span>
                <span className="text-sm font-semibold text-slate-900">{carta.parcelas}x de {formatBRL(carta.valor_parcela)}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Saldo Devedor Total</span>
                <span className="text-sm font-bold text-slate-900">{formatBRL(totalRestante)}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Taxa de Transferência</span>
                <span className="text-xs font-semibold text-slate-700">
                  {(!carta.taxa_transferencia || 
                    carta.taxa_transferencia.trim() === "R$ 0,00" || 
                    carta.taxa_transferencia.trim() === "0" || 
                    carta.taxa_transferencia.trim() === "0,00" || 
                    carta.taxa_transferencia.trim() === "R$ 0" || 
                    carta.taxa_transferencia.trim() === "R$0,00"
                  ) ? "Sob Consulta" : carta.taxa_transferencia}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Vencimento da Parcela</span>
                <span className="text-xs font-semibold text-slate-700">
                  {formatVencimentoDate(carta.vencimento_parcela || carta.proximo_vencimento)}
                </span>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Status de Disponibilidade</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                {carta.observacoes || "Disponível"}
              </span>
            </div>
          </div>

          {/* WhatsApp Direct Action Banner */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center space-y-4 shadow-sm">
            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              Fale agora com nosso especialista no WhatsApp para simular, tirar dúvidas ou solicitar a transferência imediata desta carta.
            </p>
            <button
              type="button"
              onClick={() => triggerWhatsAppClick(carta)}
              className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl cursor-pointer text-xs uppercase tracking-wider text-white bg-[#0A7B3E] hover:bg-[#086332] shadow-md hover:shadow-emerald-900/10 transition-all border-none"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.089.534 4.055 1.475 5.77L0 24l6.407-1.453A11.957 11.957 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.497-5.22-1.367l-.375-.222-3.887.882.913-3.781-.244-.39A9.941 9.941 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Tenho Interesse no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Carta Row (Desktop - Spreadsheet Columns without numbers) ───────── */
function CartaRow({ carta, onCTA }: { carta: Carta; onCTA: () => void }) {
  const obs = carta.observacoes || (carta.disponivel ? "Disponível" : "Reservada");
  const isReservada = obs.toLowerCase().includes("reservad") || !carta.disponivel;
  const vencimentoFormatted = formatVencimentoDate(carta.vencimento_parcela || carta.proximo_vencimento);

  return (
    <tr
      onClick={onCTA}
      className="group border-b border-gray-100 hover:bg-gray-50/80 transition-colors text-xs cursor-pointer"
    >
      {/* Crédito */}
      <td className="px-4 py-4 font-extrabold text-sm text-gray-900 whitespace-nowrap">
        {formatBRL(carta.valor_credito)}
      </td>

      {/* Entrada */}
      <td className="px-4 py-4 font-semibold text-emerald-700 whitespace-nowrap">
        {formatBRL(carta.entrada)}
      </td>

      {/* Parcelas */}
      <td className="px-4 py-4 whitespace-nowrap text-gray-800">
        <span className="font-bold">{carta.parcelas}x</span> de{" "}
        <span className="font-semibold text-emerald-600">{formatBRL(carta.valor_parcela)}</span>
      </td>

      {/* Taxa de Transferência */}
      <td className="px-4 py-4 text-gray-600 whitespace-nowrap font-medium">
        {(!carta.taxa_transferencia || 
          carta.taxa_transferencia.trim() === "R$ 0,00" || 
          carta.taxa_transferencia.trim() === "0" || 
          carta.taxa_transferencia.trim() === "0,00" || 
          carta.taxa_transferencia.trim() === "R$ 0" || 
          carta.taxa_transferencia.trim() === "R$0,00"
        ) ? (
          <span className="text-gray-400 italic">Sob Consulta</span>
        ) : (
          carta.taxa_transferencia
        )}
      </td>

      {/* Administradora */}
      <td className="px-4 py-4 whitespace-nowrap font-bold text-gray-700 text-xs">
        <AdministradoraLogo name={carta.administradora} />
      </td>

      {/* Vencimento da Parcela (Data Completa DD/MM/AAAA) */}
      <td className="px-4 py-4 text-gray-600 whitespace-nowrap font-medium">
        {vencimentoFormatted}
      </td>

      {/* Observações / Status */}
      <td className="px-4 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
            isReservada
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {obs}
        </span>
      </td>

      {/* Botões de Ação Direct */}
      <td className="px-4 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onCTA}
          className="text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all bg-[#0A7B3E] hover:bg-[#086332] text-white shadow-sm flex items-center gap-1.5 ml-auto"
        >
          Ver Detalhes
        </button>
      </td>
    </tr>
  );
}

/* ── Carta Mobile Card ─────────────────────────────────────────────── */
function CartaMobileCard({ carta, onCTA }: { carta: Carta; onCTA: () => void }) {
  const obs = carta.observacoes || (carta.disponivel ? "Disponível" : "Reservada");
  const vencimentoFormatted = formatVencimentoDate(carta.vencimento_parcela || carta.proximo_vencimento);

  return (
    <div 
      onClick={onCTA}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3 cursor-pointer hover:border-slate-300 transition-colors"
    >
      {/* Topo: Nome Admin & Status */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-800 text-sm">
          <AdministradoraLogo name={carta.administradora} />
        </span>

        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {obs}
        </span>
      </div>

      {/* Crédito Total */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Crédito Contemplado</p>
        <p className="text-2xl font-extrabold text-emerald-600">{formatBRL(carta.valor_credito)}</p>
      </div>

      {/* Entrada, Parcelas, Taxa */}
      <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-xl text-center">
        <div>
          <p className="text-[10px] text-gray-400 font-semibold">Entrada</p>
          <p className="text-xs font-bold text-gray-900">{formatBRL(carta.entrada)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-semibold">Parcelas</p>
          <p className="text-xs font-bold text-gray-900">{carta.parcelas}x</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-semibold">Por mês</p>
          <p className="text-xs font-bold text-emerald-700">{formatBRL(carta.valor_parcela)}</p>
        </div>
      </div>

      {/* Vencimento & Taxa */}
      <div className="flex justify-between text-xs text-gray-500 pt-1">
        <span>Vencimento: <strong>{vencimentoFormatted}</strong></span>
        <span>Taxa Transf: <strong>
          {(!carta.taxa_transferencia || 
            carta.taxa_transferencia.trim() === "R$ 0,00" || 
            carta.taxa_transferencia.trim() === "0" || 
            carta.taxa_transferencia.trim() === "0,00" || 
            carta.taxa_transferencia.trim() === "R$ 0" || 
            carta.taxa_transferencia.trim() === "R$0,00"
          ) ? "Sob Consulta" : carta.taxa_transferencia}
        </strong></span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onCTA();
        }}
        className="w-full font-bold py-2.5 rounded-full text-xs text-white bg-[#0A7B3E] hover:bg-[#086332] transition-all shadow-sm flex items-center justify-center gap-2"
      >
        Ver Detalhes da Carta
      </button>
    </div>
  );
}

/* ── Main CartasTable ──────────────────────────────────────────────── */
export default function CartasTable() {
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pages: 1, limit: 20 });
  const [filters, setFilters] = useState<Filters>({ segmentos: [], administradoras: [] });
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("valor_credito");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Carta | null>(null);
  const [active, setActive] = useState<{
    segmento: string;
    administradora: string;
    valorMin: string;
    valorMax: string;
    entradaMin?: string;
    entradaMax?: string;
    status?: string;
    ordenacao?: string;
  }>({ segmento: "", administradora: "", valorMin: "", valorMax: "" });

  const fetchCartas = useCallback(
    async (f = active, s = sort, d = dir, p = page) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (f.segmento) params.set("segmento", f.segmento);
      if (f.administradora) params.set("administradora", f.administradora);
      if (f.valorMin) params.set("valor_min", f.valorMin);
      if (f.valorMax) params.set("valor_max", f.valorMax);
      if (f.entradaMin) params.set("entrada_min", f.entradaMin);
      if (f.entradaMax) params.set("entrada_max", f.entradaMax);
      
      // Parse ordenacao from modal if present
      let finalSort = s;
      let finalDir = d;
      if (f.ordenacao) {
        if (f.ordenacao === "credito_desc") { finalSort = "valor_credito"; finalDir = "desc"; }
        else if (f.ordenacao === "credito_asc") { finalSort = "valor_credito"; finalDir = "asc"; }
        else if (f.ordenacao === "entrada_asc") { finalSort = "entrada"; finalDir = "asc"; }
        else if (f.ordenacao === "parcela_asc") { finalSort = "valor_parcela"; finalDir = "asc"; }
      }

      params.set("sort", finalSort);
      params.set("dir", finalDir);
      params.set("page", String(p));
      try {
        const res = await fetch(`/api/cartas?${params}`);
        const json = await res.json();
        setCartas(json.data || []);
        setMeta(json.meta || { total: 0, page: 1, pages: 1, limit: 20 });
        if (json.filters) setFilters(json.filters);
      } catch {
        setCartas([]);
      } finally {
        setLoading(false);
      }
    },
    [active, sort, dir, page]
  );

  useEffect(() => {
    fetchCartas();
  }, []);

  function handleFilter(f: typeof active) {
    setActive(f);
    setPage(1);
    fetchCartas(f, sort, dir, 1);
  }

  function handlePage(p: number) {
    setPage(p);
    fetchCartas(active, sort, dir, p);
    window.scrollTo({ top: 300, behavior: "smooth" });
  }

  return (
    <>
      <CartaFilters
        segmentos={filters.segmentos}
        administradoras={filters.administradoras}
        filteredCount={meta.total}
        onFilter={handleFilter}
      />

      {!loading && (
        <p className="text-xs font-semibold mb-4 text-gray-500">
          {meta.total === 0
            ? "Nenhuma carta nos filtros selecionados"
            : `${meta.total} carta${meta.total !== 1 ? "s" : ""} contemplada${meta.total !== 1 ? "s" : ""} disponível${
                meta.total !== 1 ? "veis" : ""
              }`}
        </p>
      )}

      {/* Desktop Table (Spreadsheet Format without numbers in headers) */}
      <div className="hidden md:block">
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900 text-white text-xs uppercase tracking-wider font-bold">
                <th className="px-4 py-3.5">Crédito</th>
                <th className="px-4 py-3.5">Entrada</th>
                <th className="px-4 py-3.5">Parcelas</th>
                <th className="px-4 py-3.5">Taxa Transf.</th>
                <th className="px-4 py-3.5">Administradora</th>
                <th className="px-4 py-3.5">Vencimento</th>
                <th className="px-4 py-3.5">Observações</th>
                <th className="px-4 py-3.5 text-right">Contato Direto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-gray-400">
                    Carregando cartas da vitrine...
                  </td>
                </tr>
              ) : cartas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-xs text-gray-500">
                    Nenhuma carta encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                cartas.map((c) => <CartaRow key={c.id} carta={c} onCTA={() => setSelected(c)} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Carregando cartas...</div>
        ) : cartas.length === 0 ? (
          <p className="text-center py-12 text-xs text-gray-500">Nenhuma carta disponível no momento.</p>
        ) : (
          cartas.map((c) => <CartaMobileCard key={c.id} carta={c} onCTA={() => setSelected(c)} />)
        )}
      </div>

      {selected && <LeadModal carta={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
