"use client";

import { useState, useEffect, useRef } from "react";
import AdminCartaForm from "@/components/AdminCartaForm";
import { getAdminBadgeConfig } from "@/lib/administradoras-logos";
import { parseSpreadsheetToCartas, exportCartasToCSV, ParsedCartaRow } from "@/lib/excel-parser";

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
  criado_em: string;
}

function formatBRL(v: number | null | undefined) {
  if (v == null || isNaN(v)) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function CartaAdminClient() {
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCarta, setEditCarta] = useState<Carta | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedAdminFilter, setSelectedAdminFilter] = useState<string>("todas");

  // Modais de Upload e Confirmação de Exclusão Total
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedCartaRow[]>([]);
  const [uploadMode, setUploadMode] = useState<"replace" | "append">("replace");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchCartas() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cartas");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const json = await res.json();
      setCartas(json.data || []);
    } catch {
      setCartas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCartas();
  }, []);

  async function handleToggle(carta: Carta) {
    await fetch(`/api/admin/cartas/${carta.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponivel: !carta.disponivel }),
    });
    await fetchCartas();
  }

  async function handleDeleteSingle(id: number) {
    if (!confirm("Remover esta carta do sistema?")) return;
    setDeleting(id);
    await fetch(`/api/admin/cartas/${id}`, { method: "DELETE" });
    await fetchCartas();
    setDeleting(null);
  }

  async function handleDeleteAll() {
    setUploading(true);
    try {
      const res = await fetch("/api/admin/cartas?all=true", { method: "DELETE" });
      if (res.ok) {
        await fetchCartas();
        setShowDeleteAllModal(false);
      } else {
        alert("Erro ao excluir todas as cartas.");
      }
    } catch {
      alert("Erro de conexão ao excluir.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        const rows = parseSpreadsheetToCartas(buffer);
        if (rows.length === 0) {
          alert("Nenhuma carta válida encontrada na planilha. Verifique a estrutura do arquivo.");
        } else {
          setParsedRows(rows);
          setShowUploadModal(true);
        }
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }

  async function handleConfirmBulkUpload() {
    if (parsedRows.length === 0) return;
    setUploading(true);
    try {
      const res = await fetch("/api/admin/cartas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulk: true,
          replace: uploadMode === "replace",
          cartas: parsedRows.map((r) => ({
            segmento: r.segmento,
            administradora: r.administradora,
            valor_credito: r.credito,
            entrada: r.entrada,
            parcelas: r.parcelas,
            valor_parcela: r.valor_parcela,
            taxa_transferencia: r.taxa_transferencia,
            vencimento_parcela: r.vencimento_parcela,
            observacoes: r.observacoes,
            disponivel: r.disponivel,
          })),
        }),
      });

      if (res.ok) {
        const resJson = await res.json();
        await fetchCartas();
        setShowUploadModal(false);
        setParsedRows([]);
        alert(`Planilha importada com sucesso! ${resJson.count || 0} cartas publicadas na vitrine.`);
      } else {
        const errJson = await res.json();
        alert(`Erro ao importar planilha: ${errJson.error || "Erro no servidor"}`);
      }
    } catch {
      alert("Erro de conexão ao enviar planilha.");
    } finally {
      setUploading(false);
    }
  }

  // Filtro por Administradora
  const administradorasUnicas = Array.from(new Set(cartas.map((c) => c.administradora))).filter(Boolean);
  const cartasFiltradas = selectedAdminFilter === "todas"
    ? cartas
    : cartas.filter((c) => c.administradora.toLowerCase().includes(selectedAdminFilter.toLowerCase()));

  const disponiveisCount = cartas.filter((c) => c.disponivel).length;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Dynamic Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".xlsx,.xls,.csv,.txt"
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--admin-text-mute)" }}>
            Gestão de Vitrine
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-text)" }}>
            Cartas Contempladas
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--admin-text-mute)" }}>
            Gerencie, importe planilhas (.xlsx / .csv) e edite as cartas com os logos oficiais
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Upload Planilha */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 font-semibold px-4 py-2.5 rounded-full text-sm cursor-pointer border transition-all shadow-2xs"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#1A1A1A",
              borderColor: "var(--admin-border)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Subir Planilha (.xlsx / .csv)
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
            className="flex items-center gap-2 font-semibold px-4 py-2.5 rounded-full text-sm cursor-pointer border transition-all disabled:opacity-50"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              color: "#DC2626",
              borderColor: "rgba(239, 68, 68, 0.2)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Excluir Todas
          </button>

          {/* Nova Carta Individual */}
          <button
            onClick={() => {
              setEditCarta(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 font-semibold px-5 py-2.5 rounded-full text-sm cursor-pointer shadow-sm text-white"
            style={{ backgroundColor: "var(--admin-brand, #0A7B3E)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Nova Carta
          </button>
        </div>
      </div>

      {/* KPI Cards & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl border" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--admin-text-mute)" }}>Total Cadastradas</span>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-text)" }}>{cartas.length}</p>
        </div>
        <div className="p-4 rounded-2xl border" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--admin-text-mute)" }}>Disponíveis na Vitrine</span>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-brand)" }}>{disponiveisCount}</p>
        </div>
        <div className="p-4 rounded-2xl border" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--admin-text-mute)" }}>Reservadas / Indisponíveis</span>
          <p className="text-2xl font-bold mt-1 text-amber-600">{cartas.length - disponiveisCount}</p>
        </div>
      </div>

      {/* Abas de Administradoras */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          onClick={() => setSelectedAdminFilter("todas")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            selectedAdminFilter === "todas"
              ? "bg-[#0A7B3E] text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Todas as Administradoras ({cartas.length})
        </button>
        {administradorasUnicas.map((adminName) => {
          const cfg = getAdminBadgeConfig(adminName);
          const count = cartas.filter((c) => c.administradora === adminName).length;
          const isSelected = selectedAdminFilter === adminName;

          return (
            <button
              key={adminName}
              onClick={() => setSelectedAdminFilter(adminName)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border"
              style={{
                backgroundColor: isSelected ? cfg.color : "#FFFFFF",
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

      {/* Table Container — 7 Columns Spreadsheet Style */}
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
                  <th className="py-3.5 px-4">1. Crédito</th>
                  <th className="py-3.5 px-4">2. Entrada</th>
                  <th className="py-3.5 px-4">3. Parcelas</th>
                  <th className="py-3.5 px-4">4. Taxa Transferência</th>
                  <th className="py-3.5 px-4">5. Administradora</th>
                  <th className="py-3.5 px-4">6. Vencimento</th>
                  <th className="py-3.5 px-4">7. Observações / Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cartasFiltradas.map((c) => {
                  const cfg = getAdminBadgeConfig(c.administradora);
                  const obs = c.observacoes || (c.disponivel ? "Disponível" : "Reservada");
                  const isReservada = obs.toLowerCase().includes("reservad") || !c.disponivel;

                  return (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* 1. Crédito */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 text-sm whitespace-nowrap">
                        {formatBRL(c.valor_credito)}
                        <span className="block text-[10px] font-normal text-gray-400 uppercase tracking-wide">
                          {c.segmento || "imoveis"}
                        </span>
                      </td>

                      {/* 2. Entrada */}
                      <td className="py-3.5 px-4 font-semibold text-emerald-700 whitespace-nowrap">
                        {formatBRL(c.entrada)}
                      </td>

                      {/* 3. Parcelas */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{c.parcelas}x</span> de{" "}
                        <span className="font-medium text-gray-700">{formatBRL(c.valor_parcela)}</span>
                      </td>

                      {/* 4. Taxa de Transferência */}
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                        {c.taxa_transferencia || "R$ 0,00"}
                      </td>

                      {/* 5. Administradora (Logo Direto) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {cfg.logoImg ? (
                          <img
                            src={cfg.logoImg}
                            alt={cfg.shortName}
                            className="h-8 max-w-[100px] object-contain rounded-md shadow-2xs"
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

                      {/* 6. Vencimento da Parcela */}
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                        {c.vencimento_parcela || c.proximo_vencimento || "Dia 10"}
                      </td>

                      {/* 7. Observações / Status */}
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
                          {/* Toggle Disponível */}
                          <button
                            onClick={() => handleToggle(c)}
                            title={c.disponivel ? "Ocultar da vitrine" : "Mostrar na vitrine"}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {c.disponivel ? (
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                              ) : (
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                              )}
                            </svg>
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => {
                              setEditCarta(c);
                              setShowForm(true);
                            }}
                            title="Editar carta"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Excluir */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Confirmar Importação de Planilha</h2>
            <p className="text-xs text-gray-500 mb-4">
              Encontramos <strong>{parsedRows.length} cartas</strong> na planilha.
            </p>

            {/* Opções de Upload */}
            <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200">
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
            <div className="border rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-gray-100 font-bold text-gray-600">
                  <tr>
                    <th className="p-2">1. Crédito</th>
                    <th className="p-2">2. Entrada</th>
                    <th className="p-2">3. Parcelas</th>
                    <th className="p-2">5. Admin</th>
                    <th className="p-2">7. Status</th>
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
                        <td className="p-2">{r.observacoes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {parsedRows.length > 5 && (
                <div className="p-2 text-center text-[10px] text-gray-400 bg-gray-50 border-t">
                  + {parsedRows.length - 5} outras cartas na planilha...
                </div>
              )}
            </div>

            <div className="flex gap-3">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Excluir TODAS as cartas?</h2>
            <p className="text-xs text-gray-500 mb-6">
              Esta ação removerá permanentemente as <strong>{cartas.length} cartas</strong> cadastradas na vitrine. Esta ação não poderá ser desfeita.
            </p>

            <div className="flex gap-3">
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
