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
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const urlParams = new URLSearchParams(window.location.search);
    const cartaRef = `carta-${carta.id}-${carta.segmento}-${Math.round(carta.valor_credito / 1000)}k`;

    const getCookie = (name: string) => {
      if (typeof document === "undefined") return "";
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? match[2] : "";
    };

    try {
      const res = await fetch("/api/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          segment: carta.segmento,
          credit: String(Math.round(carta.valor_credito)),
          months: carta.parcelas,
          plan: "standard",
          lp: "cartas-contempladas",
          ref: cartaRef,
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
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError("Erro ao enviar proposta. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    border: "1px solid #E2E8F0",
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };

  const totalRestante = (carta.parcelas || 0) * (carta.valor_parcela || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col my-8"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {/* Top Header Card */}
        <div className="px-6 py-5 relative flex items-center justify-between border-b border-slate-100" style={{ backgroundColor: "#111827" }}>
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
              Ficha de Crédito Contemplado
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl font-bold text-white">
                {formatBRL(carta.valor_credito)}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${carta.segmento === "veiculos" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                {carta.segmento === "veiculos" ? "🚗 Veículos" : "🏠 Imóveis"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/95 px-3 py-1.5 rounded-lg shrink-0 mr-6">
              <AdministradoraLogo name={carta.administradora} className="h-5 max-w-[100px] object-contain" />
            </div>
            
            <button
              onClick={onClose}
              className="absolute top-5 right-5 cursor-pointer transition-opacity hover:opacity-75 text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {sent ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto bg-emerald-50 border border-emerald-100">
              <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Solicitação de Reserva Registrada!</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Nossa equipe já recebeu os dados desta carta e entrará em contato para formalizar a transferência.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => triggerWhatsAppClick(carta)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white bg-[#0A7B3E] hover:bg-[#086332] shadow-md transition-all cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                Chamar no WhatsApp Agora
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-full text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Voltar à Tabela
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Left Column: Detalhamento Técnico Financeiro */}
            <div className="p-6 space-y-4 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ficha Técnica do Consórcio
              </h4>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Crédito Contemplado</span>
                  <span className="text-sm font-bold text-slate-900">{formatBRL(carta.valor_credito)}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Valor de Entrada</span>
                  <span className="text-sm font-bold text-emerald-600">{formatBRL(carta.entrada)}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Parcelas Restantes</span>
                  <span className="text-xs text-slate-900 font-semibold">{carta.parcelas}x de {formatBRL(carta.valor_parcela)}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Saldo Devedor Total</span>
                  <span className="text-sm font-bold text-slate-900">{formatBRL(totalRestante)}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Taxa de Transferência</span>
                  <span className="text-xs font-medium text-slate-700">
                    {(!carta.taxa_transferencia || 
                      carta.taxa_transferencia.trim() === "R$ 0,00" || 
                      carta.taxa_transferencia.trim() === "0" || 
                      carta.taxa_transferencia.trim() === "0,00" || 
                      carta.taxa_transferencia.trim() === "R$ 0" || 
                      carta.taxa_transferencia.trim() === "R$0,00"
                    ) ? "Sob Consulta" : carta.taxa_transferencia}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Próximo Vencimento</span>
                  <span className="text-xs font-medium text-slate-700">
                    {formatVencimentoDate(carta.vencimento_parcela || carta.proximo_vencimento)}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {carta.observacoes || "Disponível"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Reserva WhatsApp & Captura */}
            <div className="p-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Reservar ou Tirar Dúvidas
              </h4>

              {/* Botão WhatsApp */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center space-y-3">
                <p className="text-xs text-emerald-900 leading-snug">
                  Fale agora com nosso especialista no WhatsApp para simular ou reservar esta carta.
                </p>
                <button
                  type="button"
                  onClick={() => triggerWhatsAppClick(carta)}
                  className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-full cursor-pointer text-xs uppercase tracking-wider text-white bg-[#0A7B3E] hover:bg-[#086332] shadow-md hover:shadow-emerald-900/10 transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  Tenho Interesse no WhatsApp
                </button>
              </div>

              {/* Formulário Tradicional */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Ou solicite contato da equipe
                </span>
                <div>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="Seu WhatsApp (Ex: 11 99999-9999)"
                    style={inputStyle}
                  />
                </div>

                {error && <p className="text-xs p-2.5 rounded-lg bg-red-50 text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold py-2.5 rounded-xl cursor-pointer text-xs uppercase tracking-wider text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-60"
                >
                  {loading ? "Registrando..." : "Solicitar Contato por Ligação"}
                </button>
              </form>
            </div>
          </div>
        )}
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
  const [active, setActive] = useState({ segmento: "", administradora: "", valorMin: "", valorMax: "" });

  const fetchCartas = useCallback(
    async (f = active, s = sort, d = dir, p = page) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (f.segmento) params.set("segmento", f.segmento);
      if (f.administradora) params.set("administradora", f.administradora);
      if (f.valorMin) params.set("valor_min", f.valorMin);
      if (f.valorMax) params.set("valor_max", f.valorMax);
      params.set("sort", s);
      params.set("dir", d);
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
      <CartaFilters segmentos={filters.segmentos} administradoras={filters.administradoras} onFilter={handleFilter} />

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
