"use client";

import { useState } from "react";
import type { Carta } from "@/app/admin/cartas/CartaAdminClient";

const SEGMENTOS = ["imoveis", "veiculos", "agronegocio", "servicos"];
const ADMINISTRADORAS = [
  "Caixa Consórcios",
  "Bradesco Consórcios",
  "Itaú Consórcios",
  "Banco do Brasil",
  "Porto Seguro Consórcio",
  "Sicredi",
  "Santander Consórcios",
  "Ademicon",
  "Rodobens",
  "HS Consórcios",
  "Embracon",
  "Outra"
];

interface Props {
  carta?: Carta | null;
  onClose: () => void;
  onSave: () => void;
}

export default function AdminCartaForm({ carta, onClose, onSave }: Props) {
  const isEdit = Boolean(carta?.id);
  const [form, setForm] = useState({
    segmento: carta?.segmento || "imoveis",
    administradora: carta?.administradora || "Caixa Consórcios",
    valor_credito: carta?.valor_credito != null ? String(carta.valor_credito) : "",
    entrada: carta?.entrada != null ? String(carta.entrada) : "",
    parcelas: carta?.parcelas != null ? String(carta.parcelas) : "",
    valor_parcela: carta?.valor_parcela != null ? String(carta.valor_parcela) : "",
    taxa_transferencia: carta?.taxa_transferencia || "R$ 0,00",
    vencimento_parcela: carta?.vencimento_parcela || carta?.proximo_vencimento || "Dia 10",
    observacoes: carta?.observacoes || "Disponível",
    disponivel: carta?.disponivel ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = isEdit ? `/api/admin/cartas/${carta!.id}` : "/api/admin/cartas";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        onSave();
        onClose();
      } else {
        const json = await res.json();
        setError(json.error || "Erro ao salvar carta");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors border border-gray-200 focus:border-[#0A7B3E]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(26,26,26,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,.05), 0 16px 48px rgba(0,0,0,.12)",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ padding: "20px 24px", borderBottom: "1px solid #E5E2DC" }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8A8A8A" }}>
              Curadoria de Cartas
            </p>
            <h2 className="text-base font-bold" style={{ color: "#1A1A1A" }}>
              {isEdit ? "Editar Carta Contemplada" : "Nova Carta Contemplada"}
            </h2>
          </div>
          <button onClick={onClose} className="cursor-pointer transition-opacity hover:opacity-60" style={{ color: "#8A8A8A" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 1. Crédito & 2. Entrada */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                1. Crédito (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.valor_credito}
                onChange={(e) => update("valor_credito", e.target.value)}
                className={inputCls}
                placeholder="Ex: 200000"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                2. Entrada (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.entrada}
                onChange={(e) => update("entrada", e.target.value)}
                className={inputCls}
                placeholder="Ex: 45000"
              />
            </div>
          </div>

          {/* 3. Parcelas & Valor Parcela */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                3a. Qtd. Parcelas *
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.parcelas}
                onChange={(e) => update("parcelas", e.target.value)}
                className={inputCls}
                placeholder="Ex: 120"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                3b. Valor da Parcela (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.valor_parcela}
                onChange={(e) => update("valor_parcela", e.target.value)}
                className={inputCls}
                placeholder="Ex: 1850"
              />
            </div>
          </div>

          {/* 4. Taxa de Transferência & 5. Administradora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                4. Taxa de Transferência
              </label>
              <input
                type="text"
                value={form.taxa_transferencia}
                onChange={(e) => update("taxa_transferencia", e.target.value)}
                className={inputCls}
                placeholder="Ex: R$ 0,00 ou R$ 1.500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                5. Administradora *
              </label>
              <select
                value={form.administradora}
                onChange={(e) => update("administradora", e.target.value)}
                className={inputCls}
                required
              >
                {ADMINISTRADORAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6. Vencimento da Parcela & Segmento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                6. Vencimento da Parcela
              </label>
              <input
                type="text"
                value={form.vencimento_parcela}
                onChange={(e) => update("vencimento_parcela", e.target.value)}
                className={inputCls}
                placeholder="Ex: Dia 10 ou 15/08/2026"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Segmento *
              </label>
              <select
                value={form.segmento}
                onChange={(e) => update("segmento", e.target.value)}
                className={inputCls}
                required
              >
                {SEGMENTOS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 7. Observações */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              7. Observações / Status
            </label>
            <input
              type="text"
              value={form.observacoes}
              onChange={(e) => update("observacoes", e.target.value)}
              className={inputCls}
              placeholder="Ex: Reservada, Disponível para pronta transferência, etc."
            />
          </div>

          <div className="flex items-center gap-3 py-1">
            <button
              type="button"
              onClick={() => update("disponivel", !form.disponivel)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                form.disponivel ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  form.disponivel ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {form.disponivel ? "Visível na vitrine pública" : "Oculta na vitrine"}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-white font-semibold py-3 rounded-xl transition-colors duration-200 cursor-pointer text-sm shadow-md"
              style={{ backgroundColor: "var(--admin-brand, #0A7B3E)" }}
            >
              {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Adicionar carta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
