"use client";

import { useState, useEffect, useCallback } from "react";
import CartaFilters from "@/components/CartaFilters";
import { getAdminBadgeConfig } from "@/lib/administradoras-logos";
import { formatVencimentoDate } from "@/lib/excel-parser";

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

/* ── Lead Capture Modal ────────────────────────────────────────────── */
function LeadModal({ carta, onClose }: { carta: Carta; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const adminCfg = getAdminBadgeConfig(carta.administradora);

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
        setError("Erro ao enviar. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
      style={{ backgroundColor: "rgba(26,26,26,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {/* Card top: carta info */}
        <div className="px-6 py-5 relative" style={{ backgroundColor: "#1A1F1C" }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 cursor-pointer transition-opacity hover:opacity-70 text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-2 mb-1">
            {adminCfg.logoImg ? (
              <img src={adminCfg.logoImg} alt={adminCfg.shortName} width={80} height={80} className="w-8 h-8 object-contain rounded-md bg-white p-0.5" />
            ) : (
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: adminCfg.bgTint, color: adminCfg.color }}
              >
                {adminCfg.shortName}
              </span>
            )}
          </div>
          <p className="text-3xl font-bold" style={{ color: "#34d399" }}>
            {formatBRL(carta.valor_credito)}
          </p>
          <p className="text-xs mt-1 text-gray-400">
            Entrada: {formatBRL(carta.entrada)} · {carta.parcelas}x de {formatBRL(carta.valor_parcela)}
          </p>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "rgba(16,185,129,0.08)" }}
            >
              <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">Solicitação recebida</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              Um especialista Titanium entrará em contato para orientar a transferência.
            </p>
            <button
              onClick={() => triggerWhatsAppClick(carta)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md cursor-pointer transition-all mb-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              Falar Direto no WhatsApp
            </button>
            <button onClick={onClose} className="text-xs font-semibold text-gray-400 hover:underline cursor-pointer">
              Fechar janela
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* WhatsApp Direct Option */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-emerald-900 mb-1">
                Atendimento Instantâneo via WhatsApp
              </p>
              <p className="text-[11px] text-emerald-700 mb-3">
                Clique para enviar a proposta desta carta diretamente ao especialista no WhatsApp.
              </p>
              <button
                type="button"
                onClick={() => triggerWhatsAppClick(carta)}
                className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-full cursor-pointer text-xs uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                Conversar no WhatsApp (11 93004-8940)
              </button>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] uppercase font-bold text-gray-400">ou preencha os dados</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  Nome completo *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Seu nome"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  style={inputStyle}
                />
              </div>

              {error && <p className="text-xs p-3 rounded-xl bg-red-50 text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full font-bold py-3 rounded-full cursor-pointer text-xs uppercase tracking-wider text-gray-800 border border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-60"
              >
                {loading ? "Solicitando..." : "Solicitar Contato Especializado"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Carta Row (Desktop - Spreadsheet Columns without numbers) ───────── */
function CartaRow({ carta, onCTA }: { carta: Carta; onCTA: () => void }) {
  const adminCfg = getAdminBadgeConfig(carta.administradora);
  const obs = carta.observacoes || (carta.disponivel ? "Disponível" : "Reservada");
  const isReservada = obs.toLowerCase().includes("reservad") || !carta.disponivel;
  const vencimentoFormatted = formatVencimentoDate(carta.vencimento_parcela || carta.proximo_vencimento);

  return (
    <tr
      className="group border-b border-gray-100 hover:bg-gray-50/80 transition-colors text-xs"
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
      <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
        {carta.taxa_transferencia || "R$ 0,00"}
      </td>

      {/* Administradora (Logo Direto 80x80) */}
      <td className="px-4 py-4 whitespace-nowrap">
        {adminCfg.logoImg ? (
          <img
            src={adminCfg.logoImg}
            alt={adminCfg.shortName}
            width={80}
            height={80}
            className="w-10 h-10 object-contain rounded-lg shadow-2xs inline-block"
          />
        ) : (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px]"
            style={{
              backgroundColor: adminCfg.bgTint,
              color: adminCfg.color,
              border: `1px solid ${adminCfg.borderColor}`,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: adminCfg.color }} />
            {adminCfg.shortName}
          </span>
        )}
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

      {/* Botões de Ação Direct WhatsApp */}
      <td className="px-4 py-4 text-right whitespace-nowrap">
        <button
          onClick={() => triggerWhatsAppClick(carta)}
          className="text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all bg-[#0A7B3E] hover:bg-[#086332] text-white shadow-sm flex items-center gap-1.5 ml-auto"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          Tenho Interesse
        </button>
      </td>
    </tr>
  );
}

/* ── Carta Mobile Card ─────────────────────────────────────────────── */
function CartaMobileCard({ carta, onCTA }: { carta: Carta; onCTA: () => void }) {
  const adminCfg = getAdminBadgeConfig(carta.administradora);
  const obs = carta.observacoes || (carta.disponivel ? "Disponível" : "Reservada");
  const vencimentoFormatted = formatVencimentoDate(carta.vencimento_parcela || carta.proximo_vencimento);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      {/* Topo: Logo Admin & Status */}
      <div className="flex items-center justify-between">
        {adminCfg.logoImg ? (
          <img src={adminCfg.logoImg} alt={adminCfg.shortName} width={80} height={80} className="w-9 h-9 object-contain rounded-md" />
        ) : (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs"
            style={{
              backgroundColor: adminCfg.bgTint,
              color: adminCfg.color,
              border: `1px solid ${adminCfg.borderColor}`,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: adminCfg.color }} />
            {adminCfg.shortName}
          </span>
        )}

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
        <span>Taxa Transf: <strong>{carta.taxa_transferencia || "R$ 0,00"}</strong></span>
      </div>

      <button
        onClick={() => triggerWhatsAppClick(carta)}
        className="w-full font-bold py-2.5 rounded-full text-xs text-white bg-[#0A7B3E] hover:bg-[#086332] transition-all shadow-sm flex items-center justify-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
        Tenho Interesse no WhatsApp
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
