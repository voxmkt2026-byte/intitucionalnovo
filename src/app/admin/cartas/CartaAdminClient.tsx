"use client";

import { useState, useEffect, useRef } from "react";
import AdminCartaForm from "@/components/AdminCartaForm";
import { parseSpreadsheetToCartas, exportCartasToCSV, formatVencimentoDate, ParsedCartaRow } from "@/lib/excel-parser";
import { getAdminBadgeConfig } from "@/lib/administradoras-logos";

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
  criado_em?: string;
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
  const [loading, setLoading] = useState(initialCartas.length === 0);
  const [showForm, setShowForm] = useState(false);
  const [editCarta, setEditCarta] = useState<Carta | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedAdminFilter, setSelectedAdminFilter] = useState<string>("todas");

  // Modais de Upload e Exclusão
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedCartaRow[]>([]);
  const [uploadMode, setUploadMode] = useState<"replace" | "append">("replace");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar cartas da API
  async function fetchCartas() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cartas");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const json = await res.json();
      const list = json.data || (Array.isArray(json) ? json : []);
      setCartas(list);
    } catch (err) {
      console.error("[fetchCartas admin]", err);
      setCartas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCartas();
  }, []);

  // Excluir carta individual
  async function handleDeleteSingle(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta carta contemplada?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/cartas/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCartas((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Erro ao excluir carta.");
      }
    } catch {
      alert("Erro de conexão ao excluir.");
    } finally {
      setDeleting(null);
    }
  }

  // Excluir todas as cartas
  async function handleDeleteAll() {
    setUploading(true);
    try {
      const res = await fetch("/api/admin/cartas?all=true", { method: "DELETE" });
      if (res.ok) {
        setCartas([]);
        setShowDeleteAllModal(false);
        alert("Todas as cartas foram removidas da vitrine!");
      } else {
        alert("Erro ao remover cartas.");
      }
    } catch {
      alert("Erro de conexão ao remover cartas.");
    } finally {
      setUploading(false);
    }
  }

  // Seleção de arquivo de planilha (.xlsx/.csv)
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (bstr) {
        const rows = parseSpreadsheetToCartas(bstr as ArrayBuffer);
        if (rows.length === 0) {
          alert("Nenhuma carta válida foi encontrada na planilha. Verifique as colunas.");
        } else {
          setParsedRows(rows);
          setShowUploadModal(true);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // Confirmar Importação em Lote
  async function handleConfirmBulkUpload() {
    if (parsedRows.length === 0) return;
    setUploading(true);
    setUploadError("");

    try {
      const res = await fetch("/api/admin/cartas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulk: true,
          mode: uploadMode,
          cartas: parsedRows,
        }),
      });

      if (res.ok) {
        setShowUploadModal(false);
        setParsedRows([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchCartas();
        alert(`${parsedRows.length} cartas importadas e publicadas com sucesso!`);
      } else {
        const json = await res.json();
        setUploadError(json.error || "Erro ao importar planilha.");
      }
    } catch {
      setUploadError("Erro de conexão ao enviar planilha.");
    } finally {
      setUploading(false);
    }
  }

  // Estatísticas e Filtros de Administradoras
  const adminCounts: Record<string, number> = {};
  cartas.forEach((c) => {
    const adm = (c.administradora || "Outra").trim();
    adminCounts[adm] = (adminCounts[adm] || 0) + 1;
  });

  const cartasFiltradas = cartas.filter((c) => {
    if (selectedAdminFilter !== "todas" && c.administradora.toLowerCase() !== selectedAdminFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Botões de Ação */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Gestão de Cartas Contempladas
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Suba planilhas em lote, exporte dados ou gerencie cartas individualmente na vitrine.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          {/* Subir Planilha */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 font-bold px-4 py-2.5 rounded-full text-xs cursor-pointer transition-all text-white bg-[#0A7B3E] hover:bg-[#086332] shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
            className="flex items-center gap-2 font-semibold px-4 py-2.5 rounded-full text-xs cursor-pointer border border-emerald-200 text-[#0A7B3E] bg-white hover:bg-emerald-50 transition-all disabled:opacity-40"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            className="flex items-center gap-2 font-semibold px-4 py-2.5 rounded-full text-xs cursor-pointer border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-40"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Excluir Todas
          </button>

          {/* Nova Carta Manual */}
          <button
            onClick={() => {
              setEditCarta(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 font-semibold px-4 py-2.5 rounded-full text-xs cursor-pointer border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition-all shadow-2xs"
          >
            + Nova Carta Manual
          </button>
        </div>
      </div>

      {/* Tabs / Badges de Administradoras */}
      <div className="flex items-center gap-2 flex-wrap pt-2 border-b border-gray-200 pb-4">
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
                <img src={cfg.logoImg} alt={cfg.shortName} width={80} height={80} className="w-5 h-5 object-contain rounded-sm" />
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

      {/* Table Container — Formato de Tabela Limpo */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">
            Carregando cartas contempladas...
          </div>
        ) : cartasFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-gray-800">Nenhuma carta encontrada</p>
            <p className="text-xs text-gray-400 mt-1">Suba uma planilha (.xlsx / .csv) ou adicione uma nova carta manualmente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-900 text-white font-bold uppercase tracking-wider">
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
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Crédito */}
                      <td className="py-3.5 px-4 font-extrabold text-gray-900 text-sm whitespace-nowrap">
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
                        <span className="font-bold text-gray-900">{c.parcelas}x</span> de{" "}
                        <span className="font-semibold text-emerald-600">{formatBRL(c.valor_parcela)}</span>
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
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px]"
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
                              setEditCarta(c);
                              setShowForm(true);
                            }}
                            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Editar carta"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDeleteSingle(c.id)}
                            disabled={deleting === c.id}
                            title="Excluir carta"
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
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

      {/* Modal Formulário Individual */}
      {showForm && (
        <AdminCartaForm
          carta={editCarta}
          onClose={() => setShowForm(false)}
          onSave={fetchCartas}
        />
      )}

      {/* Modal de Prévia de Upload de Planilha */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Confirmar Importação de Planilha</h2>
            <p className="text-xs text-gray-500">
              Encontramos <strong>{parsedRows.length} cartas</strong> na planilha.
            </p>

            {/* Opções de Upload */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Modo de Importação:</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="radio"
                    name="uploadMode"
                    value="replace"
                    checked={uploadMode === "replace"}
                    onChange={() => setUploadMode("replace")}
                    className="accent-emerald-600"
                  />
                  <span>Substituir TODAS as cartas atuais por esta planilha</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
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
            <div className="border border-gray-200 rounded-xl overflow-hidden">
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
                            <img src={cfg.logoImg} alt={cfg.shortName} width={80} height={80} className="w-6 h-6 object-contain rounded-md" />
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
                <div className="p-2 text-center text-[10px] text-gray-400 bg-gray-50 border-t border-gray-200">
                  + {parsedRows.length - 5} outras cartas na planilha...
                </div>
              )}
            </div>

            {uploadError && (
              <p className="text-xs p-3 rounded-xl bg-red-50 text-red-600 font-medium">{uploadError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-xs hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBulkUpload}
                disabled={uploading}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-xs hover:bg-emerald-700 disabled:opacity-50 shadow-md"
              >
                {uploading ? "Importando..." : "Confirmar e Publicar Planilha"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Excluir Todas as Cartas */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900">Excluir TODAS as cartas?</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Esta ação removerá permanentemente as <strong>{cartas.length} cartas</strong> cadastradas na vitrine. Esta ação não poderá ser desfeita.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-xs hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={uploading}
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl text-xs hover:bg-red-700 disabled:opacity-50"
              >
                {uploading ? "Excluindo..." : "Sim, Excluir Todas"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
