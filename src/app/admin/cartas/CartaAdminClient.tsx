"use client";

import { useState, useRef } from "react";
import AdminCartaForm from "@/components/AdminCartaForm";
import { parseSpreadsheetToCartas, exportCartasToCSV, formatVencimentoDate, ParsedCartaRow } from "@/lib/excel-parser";
import { getAdminBadgeConfig } from "@/lib/administradoras-logos";

interface Carta {
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

interface CartaAdminClientProps {
  initialCartas?: Carta[];
}

function formatBRL(v: number | null | undefined) {
  if (v == null || isNaN(v)) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function CartaAdminClient({ initialCartas = [] }: CartaAdminClientProps) {
  const [cartas, setCartas] = useState<Carta[]>(initialCartas);
  const [editingCarta, setEditingCarta] = useState<Carta | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAdminFilter, setSelectedAdminFilter] = useState<string>("todas");
  const [selectedSegFilter, setSelectedSegFilter] = useState<string>("todos");

  // Modal de Upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedCartaRow[]>([]);
  const [uploadMode, setUploadMode] = useState<"replace" | "append">("replace");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal de Excluir Todas
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Recarregar cartas da API
  async function reloadCartas() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cartas");
      const data = await res.json();
      if (Array.isArray(data)) setCartas(data);
    } catch (err) {
      console.error("[reloadCartas]", err);
    } finally {
      setLoading(false);
    }
  }

  // Deletar uma carta específica
  async function handleDeleteCarta(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta carta contemplada?")) return;
    try {
      const res = await fetch(`/api/admin/cartas/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCartas((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Erro ao excluir carta.");
      }
    } catch {
      alert("Erro de conexão ao excluir.");
    }
  }

  // Deletar todas as cartas
  async function handleDeleteAllCartas() {
    setIsUploading(true);
    try {
      const res = await fetch("/api/admin/cartas?all=true", { method: "DELETE" });
      if (res.ok) {
        setCartas([]);
        setShowDeleteAllModal(false);
        alert("Todas as cartas foram removidas com sucesso!");
      } else {
        alert("Erro ao remover cartas.");
      }
    } catch {
      alert("Erro ao remover cartas.");
    } finally {
      setIsUploading(false);
    }
  }

  // Lidar com seleção de arquivo .xlsx/.csv
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadMessage("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (bstr) {
        const rows = parseSpreadsheetToCartas(bstr as ArrayBuffer);
        if (rows.length === 0) {
          setUploadMessage("Nenhuma carta válida foi encontrada na planilha. Verifique a formatação das colunas.");
        } else {
          setParsedRows(rows);
          setShowUploadModal(true);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // Confirmar Importação em Lote
  async function handleConfirmImport() {
    if (parsedRows.length === 0) return;
    setIsUploading(true);
    setUploadMessage("");

    try {
      const res = await fetch("/api/admin/cartas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: uploadMode,
          cartas: parsedRows,
        }),
      });

      if (res.ok) {
        setShowUploadModal(false);
        setParsedRows([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await reloadCartas();
        alert(`${parsedRows.length} cartas importadas com sucesso!`);
      } else {
        const errJson = await res.json();
        setUploadMessage(`Erro ao importar: ${errJson.error || "Falha no servidor"}`);
      }
    } catch {
      setUploadMessage("Erro de conexão ao importar planilha.");
    } finally {
      setIsUploading(false);
    }
  }

  // Filtragem de Administradoras e Segmentos
  const adminCounts: Record<string, number> = {};
  cartas.forEach((c) => {
    const adm = (c.administradora || "Outra").trim();
    adminCounts[adm] = (adminCounts[adm] || 0) + 1;
  });

  const cartasFiltradas = cartas.filter((c) => {
    if (selectedAdminFilter !== "todas" && c.administradora.toLowerCase() !== selectedAdminFilter.toLowerCase()) {
      return false;
    }
    if (selectedSegFilter !== "todos" && c.segmento !== selectedSegFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Controles de Planilha */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--admin-text)" }}>
            Gestão de Cartas Contempladas
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--admin-text-mute)" }}>
            Suba planilhas em lote, exporte dados ou gerencie cartas individualmente na vitrine.
          </p>
        </div>

        {/* Botões de Ação da Planilha */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Input invisível para upload de planilha */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          {/* Subir Planilha */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 font-bold px-4 py-2.5 rounded-full text-sm cursor-pointer transition-all text-white shadow-sm hover:opacity-90"
            style={{ backgroundColor: "#0A7B3E" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Subir Planilha (.xlsx)
          </button>

          {/* Exportar Planilha */}
          <button
            onClick={() => exportCartasToCSV(cartas)}
            disabled={cartas.length === 0}
            className="flex items-center gap-2 font-semibold px-4 py-2.5 rounded-full text-sm cursor-pointer border transition-all disabled:opacity-50"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#0A7B3E",
              borderColor: "var(--admin-brand-tint2)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar
          </button>

          {/* Excluir Todas */}
          <button
            onClick={() => setShowDeleteAllModal(true)}
            disabled={cartas.length === 0}
            className="flex items-center gap-2 font-semibold px-4 py-2.5 rounded-full text-sm cursor-pointer border transition-all text-red-600 bg-red-50 hover:bg-red-100 border-red-200 disabled:opacity-50"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Excluir Todas
          </button>

          {/* Adicionar Carta Manual */}
          <button
            onClick={() => {
              setEditingCarta(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 font-semibold px-4 py-2.5 rounded-full text-sm cursor-pointer transition-all border border-gray-300 hover:bg-gray-50"
            style={{ backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
          >
            + Nova Carta Manual
          </button>
        </div>
      </div>

      {/* Tabs / Badges de Administradoras */}
      <div className="flex items-center gap-2 flex-wrap pt-2 border-b pb-4" style={{ borderColor: "var(--admin-border)" }}>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">Filtrar Administradora:</span>
        <button
          onClick={() => setSelectedAdminFilter("todas")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
            selectedAdminFilter === "todas"
              ? "bg-gray-900 text-white border-gray-900 shadow-xs"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Todas ({cartas.length})
        </button>

        {Object.entries(adminCounts).map(([admName, count]) => {
          const cfg = getAdminBadgeConfig(admName);
          const isSelected = selectedAdminFilter.toLowerCase() === admName.toLowerCase();
          return (
            <button
              key={admName}
              onClick={() => setSelectedAdminFilter(admName)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 shadow-2xs"
              style={{
                backgroundColor: isSelected ? cfg.color : cfg.bgTint,
                color: isSelected ? "#FFFFFF" : cfg.color,
                borderColor: cfg.borderColor,
              }}
            >
              {cfg.logoImg ? (
                <img src={cfg.logoImg} alt={cfg.shortName} className="h-5 max-w-[60px] object-contain rounded-sm" />
              ) : (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? "#FFFFFF" : cfg.color }} />
              )}
              <span>{cfg.shortName}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Container — Spreadsheet Style without Numbers */}
      <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
        {loading ? (
          <div className="p-12 text-center text-sm" style={{ color: "var(--admin-text-mute)" }}>
            Carregando cartas contempladas...
          </div>
        ) : cartasFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-semibold" style={{ color: "var(--admin-text)" }}>
              Nenhuma carta encontrada
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--admin-text-mute)" }}>
              Suba uma planilha (.xlsx / .csv) ou adicione uma nova carta manualmente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b bg-gray-50/80 font-bold uppercase tracking-wider text-gray-500" style={{ borderColor: "var(--admin-border)" }}>
                  <th className="py-3.5 px-4">Crédito</th>
                  <th className="py-3.5 px-4">Entrada</th>
                  <th className="py-3.5 px-4">Parcelas</th>
                  <th className="py-3.5 px-4">Taxa Transferência</th>
                  <th className="py-3.5 px-4">Administradora</th>
                  <th className="py-3.5 px-4">Vencimento</th>
                  <th className="py-3.5 px-4">Observações / Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cartasFiltradas.map((c) => {
                  const cfg = getAdminBadgeConfig(c.administradora);
                  const obs = c.observacoes || (c.disponivel ? "Disponível" : "Reservada");
                  const isReservada = obs.toLowerCase().includes("reservad") || !c.disponivel;
                  const vencimentoFormatted = formatVencimentoDate(c.vencimento_parcela || c.proximo_vencimento);

                  return (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Crédito */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 text-sm whitespace-nowrap">
                        {formatBRL(c.valor_credito)}
                        <span className="block text-[10px] font-normal text-gray-400 uppercase tracking-wide">
                          {c.segmento || "imoveis"}
                        </span>
                      </td>

                      {/* Entrada */}
                      <td className="py-3.5 px-4 font-semibold text-emerald-700 whitespace-nowrap">
                        {formatBRL(c.entrada)}
                      </td>

                      {/* Parcelas */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{c.parcelas}x</span> de{" "}
                        <span className="font-medium text-gray-700">{formatBRL(c.valor_parcela)}</span>
                      </td>

                      {/* Taxa de Transferência */}
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                        {c.taxa_transferencia || "R$ 0,00"}
                      </td>

                      {/* Administradora (Logo Direto 80x80) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {cfg.logoImg ? (
                          <img
                            src={cfg.logoImg}
                            alt={cfg.shortName}
                            width={80}
                            height={80}
                            className="w-10 h-10 object-contain rounded-lg shadow-2xs inline-block"
                          />
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px]"
                            style={{
                              backgroundColor: cfg.bgTint,
                              color: cfg.color,
                              border: `1px solid ${cfg.borderColor}`,
                            }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                            {cfg.shortName}
                          </span>
                        )}
                      </td>

                      {/* Vencimento da Parcela (Data Completa DD/MM/AAAA) */}
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap font-medium">
                        {vencimentoFormatted}
                      </td>

                      {/* Observações / Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
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

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingCarta(c);
                              setShowForm(true);
                            }}
                            className="px-2.5 py-1 rounded-md border text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteCarta(c.id)}
                            className="px-2.5 py-1 rounded-md border text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Formulário Manual */}
      {showForm && (
        <AdminCartaForm
          carta={editingCarta}
          onClose={() => {
            setShowForm(false);
            setEditingCarta(null);
          }}
          onSave={async () => {
            setShowForm(false);
            setEditingCarta(null);
            await reloadCartas();
          }}
        />
      )}

      {/* Modal de Prévia do Upload de Planilha */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                Confirmar Importação de Planilha ({parsedRows.length} Cartas)
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Opções de Upload */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Modo de Importação:</p>
              <div className="flex items-center gap-4 text-xs font-medium">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="uploadMode"
                    value="replace"
                    checked={uploadMode === "replace"}
                    onChange={() => setUploadMode("replace")}
                    className="accent-emerald-600"
                  />
                  <span className="font-bold text-red-600">Substituir TODAS as cartas da vitrine</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="uploadMode"
                    value="append"
                    checked={uploadMode === "append"}
                    onChange={() => setUploadMode("append")}
                    className="accent-emerald-600"
                  />
                  <span>Adicionar às cartas existentes</span>
                </label>
              </div>
            </div>

            {/* Prévia das primeiras 5 linhas */}
            <div className="border rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-gray-100 font-bold text-gray-600">
                  <tr>
                    <th className="p-2">Crédito</th>
                    <th className="p-2">Entrada</th>
                    <th className="p-2">Parcelas</th>
                    <th className="p-2">Admin</th>
                    <th className="p-2">Vencimento</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parsedRows.slice(0, 5).map((r, idx) => {
                    const cfg = getAdminBadgeConfig(r.administradora);
                    return (
                      <tr key={idx}>
                        <td className="p-2 font-bold">{formatBRL(r.credito)}</td>
                        <td className="p-2 text-emerald-700">{formatBRL(r.entrada)}</td>
                        <td className="p-2">{r.parcelas}x {formatBRL(r.valor_parcela)}</td>
                        <td className="p-2 font-bold">
                          {cfg.logoImg ? (
                            <img src={cfg.logoImg} alt={cfg.shortName} className="h-6 max-w-[80px] object-contain rounded-md" />
                          ) : (
                            <span style={{ color: cfg.color }}>{cfg.shortName}</span>
                          )}
                        </td>
                        <td className="p-2">{r.vencimento_parcela}</td>
                        <td className="p-2">{r.observacoes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {parsedRows.length > 5 && (
                <p className="p-2 text-center text-[10px] text-gray-400 bg-gray-50 border-t">
                  + {parsedRows.length - 5} outras cartas nesta planilha...
                </p>
              )}
            </div>

            {uploadMessage && (
              <p className="text-xs p-3 rounded-xl bg-red-50 text-red-600 font-medium">{uploadMessage}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-gray-600 border hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isUploading}
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {isUploading ? "Importando..." : `Confirmar Importação (${parsedRows.length} Cartas)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Excluir Todas */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Excluir TODAS as cartas?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Esta ação apagar totalmente as {cartas.length} cartas da vitrine. Essa operação não pode ser desfeita.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 border hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAllCartas}
                disabled={isUploading}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {isUploading ? "Excluindo..." : "Sim, Excluir Todas"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
