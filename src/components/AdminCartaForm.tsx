"use client";

import { useState } from "react";
import type { Carta } from "@/app/admin/cartas/CartaAdminClient";

const SEGMENTOS       = ["veiculos", "imoveis"];
const ADMINISTRADORAS = ["Itaú", "Bradesco", "Santander", "Porto Seguro", "Embracon", "Safra", "Sicredi", "Rodobens", "SimpleBank", "PagPlus", "Mycon"];

interface Props {
  carta?: Carta | null;
  onClose: () => void;
  onSave:  () => void;
}

export default function AdminCartaForm({ carta, onClose, onSave }: Props) {
  const isEdit = Boolean(carta?.id);
  const [form, setForm] = useState({
    segmento:           carta?.segmento           || "veiculos",
    administradora:     carta?.administradora     || "Itaú",
    valor_credito:      carta?.valor_credito      != null ? String(carta.valor_credito)  : "",
    entrada:            carta?.entrada            != null ? String(carta.entrada)        : "",
    parcelas:           carta?.parcelas           != null ? String(carta.parcelas)       : "",
    valor_parcela:      carta?.valor_parcela      != null ? String(carta.valor_parcela)  : "",
    proximo_vencimento: carta?.proximo_vencimento
      ? new Date(carta.proximo_vencimento).toISOString().split("T")[0]
      : "",
    disponivel:         carta?.disponivel ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);

    const url    = isEdit ? `/api/admin/cartas/${carta!.id}` : "/api/admin/cartas";
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

  const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors" + " focus:ring-0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(26,26,26,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", boxShadow: "0 4px 12px rgba(0,0,0,.05), 0 16px 48px rgba(0,0,0,.08)" }}>
        <div className="flex items-center justify-between" style={{ padding: "20px 24px", borderBottom: "1px solid #E5E2DC" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8A8A8A" }}>Curadoria</p>
            <h2 className="text-base font-bold" style={{ color: "#1A1A1A" }}>
              {isEdit ? "Editar Carta" : "Nova Carta Contemplada"}
            </h2>
          </div>
          <button onClick={onClose} className="cursor-pointer transition-opacity hover:opacity-60" style={{ color: "#8A8A8A" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Segmento *</label>
              <select value={form.segmento} onChange={(e) => update("segmento", e.target.value)} className={inputCls} required>
                {SEGMENTOS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Administradora *</label>
              <select value={form.administradora} onChange={(e) => update("administradora", e.target.value)} className={inputCls} required>
                {ADMINISTRADORAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Valor do Crédito (R$) *</label>
              <input type="number" step="0.01" min="0" required value={form.valor_credito} onChange={(e) => update("valor_credito", e.target.value)} className={inputCls} placeholder="Ex: 150000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Entrada (R$)</label>
              <input type="number" step="0.01" min="0" value={form.entrada} onChange={(e) => update("entrada", e.target.value)} className={inputCls} placeholder="Ex: 30000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nº de Parcelas *</label>
              <input type="number" min="1" required value={form.parcelas} onChange={(e) => update("parcelas", e.target.value)} className={inputCls} placeholder="Ex: 60" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Valor da Parcela (R$) *</label>
              <input type="number" step="0.01" min="0" required value={form.valor_parcela} onChange={(e) => update("valor_parcela", e.target.value)} className={inputCls} placeholder="Ex: 1200" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Próximo Vencimento</label>
            <input type="date" value={form.proximo_vencimento} onChange={(e) => update("proximo_vencimento", e.target.value)} className={inputCls} />
          </div>

          <div className="flex items-center gap-3 py-1">
            <button
              type="button"
              onClick={() => update("disponivel", !form.disponivel)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer
                ${form.disponivel ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                ${form.disponivel ? "translate-x-6" : "translate-x-0"}`} />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {form.disponivel ? "Disponível para clientes" : "Oculta do site"}
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
              className="flex-1 bg-[#C41E3A] hover:bg-[#a01830] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors duration-200 cursor-pointer text-sm"
            >
              {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Adicionar carta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
