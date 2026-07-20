"use client";

import { useState } from "react";

interface Carta {
  id?: number;
  segmento: string;
  administradora: string;
  valor_credito: number;
  entrada: number | null;
  parcelas: number;
  valor_parcela: number;
  proximo_vencimento?: string | null;
  taxa_transferencia?: string | null;
  vencimento_parcela?: string | null;
  observacoes?: string | null;
  disponivel: boolean;
}

interface AdminCartaFormProps {
  carta?: Carta | null; // se fornecido, modo edição
  onClose: () => void;
  onSave: () => void;
}

const SEGMENTOS = [
  "imoveis",
  "veiculos",
  "caminhoes",
  "servicos",
];

const ADMINISTRADORAS = [
  "Caixa Consórcios",
  "CNP Consórcio",
  "Bradesco Consórcios",
  "Banco do Brasil",
  "Itaú Consórcios",
  "Porto Seguro Consórcio",
  "Santander Consórcios",
  "Sicredi Consórcios",
  "Ademicon",
  "Rodobens Consórcios",
  "HS Consórcios",
  "Embracon",
  "Outra",
];

export default function AdminCartaForm({ carta, onClose, onSave }: AdminCartaFormProps) {
  const isEdit = Boolean(carta?.id);

  const [form, setForm] = useState({
    segmento: carta?.segmento || "imoveis",
    administradora: carta?.administradora || "Caixa Consórcios",
    valor_credito: carta?.valor_credito ? String(carta.valor_credito) : "",
    entrada: carta?.entrada != null ? String(carta.entrada) : "",
    parcelas: carta?.parcelas ? String(carta.parcelas) : "60",
    valor_parcela: carta?.valor_parcela ? String(carta.valor_parcela) : "",
    taxa_transferencia: carta?.taxa_transferencia || "R$ 0,00",
    vencimento_parcela: carta?.vencimento_parcela || carta?.proximo_vencimento || "15/08/2026",
    observacoes: carta?.observacoes || "Disponível",
    disponivel: carta?.disponivel ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, val: any) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      segmento: form.segmento,
      administradora: form.administradora,
      valor_credito: parseFloat(form.valor_credito) || 0,
      entrada: parseFloat(form.entrada) || 0,
      parcelas: parseInt(form.parcelas, 10) || 60,
      valor_parcela: parseFloat(form.valor_parcela) || 0,
      taxa_transferencia: form.taxa_transferencia,
      vencimento_parcela: form.vencimento_parcela,
      observacoes: form.observacoes,
      disponivel: form.disponivel,
    };

    try {
      const url = isEdit ? `/api/admin/cartas/${carta!.id}` : "/api/admin/cartas";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao salvar carta.");
      }
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
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
          {/* Crédito & Entrada */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Crédito (R$) *
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
                Entrada (R$) *
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

          {/* Parcelas & Valor Parcela */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Qtd. Parcelas *
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
                Valor da Parcela (R$) *
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

          {/* Taxa de Transferência & Administradora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Taxa de Transferência
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
                Administradora *
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

          {/* Vencimento da Parcela & Segmento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Vencimento da Parcela (Data Completa)
              </label>
              <input
                type="text"
                value={form.vencimento_parcela}
                onChange={(e) => update("vencimento_parcela", e.target.value)}
                className={inputCls}
                placeholder="Ex: 15/08/2026"
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
                    {s === "imoveis"
                      ? "Imóveis"
                      : s === "veiculos"
                      ? "Veículos"
                      : s === "caminhoes"
                      ? "Caminhões"
                      : "Serviços"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observações / Status & Disponibilidade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Observações / Status
              </label>
              <input
                type="text"
                value={form.observacoes}
                onChange={(e) => update("observacoes", e.target.value)}
                className={inputCls}
                placeholder="Ex: Disponível, Reservada..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Disponibilidade na Vitrine
              </label>
              <select
                value={form.disponivel ? "true" : "false"}
                onChange={(e) => update("disponivel", e.target.value === "true")}
                className={inputCls}
              >
                <option value="true">Disponível (Ativa)</option>
                <option value="false">Reservada / Indisponível</option>
              </select>
            </div>
          </div>

          {error && <p className="text-xs p-3 rounded-xl bg-red-50 text-red-600 font-medium">{error}</p>}

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-bold text-gray-600 border hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? "Salva..." : isEdit ? "Salvar Alterações" : "Criar Carta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
