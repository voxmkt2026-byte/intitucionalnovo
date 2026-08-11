"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import AdminCartaForm from "@/components/AdminCartaForm";
import { parseSpreadsheetToCartas, exportCartasToCSV, formatVencimentoDate, ParsedCartaRow } from "@/lib/excel-parser";
import AdministradoraLogo from "@/components/AdministradoraLogo";
import Dialog from "@/design-system/primitives/Dialog";

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

  // Filtros Centrais e Modal
  const [selectedSegment, setSelectedSegment] = useState<string>("todas");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAdmin, setSelectedAdmin] = useState<string>("");
  const [valorMin, setValorMin] = useState<string>("");
  const [valorMax, setValorMax] = useState<string>("");
  const [entradaMin, setEntradaMin] = useState<string>("");
  const [entradaMax, setEntradaMax] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [sortOption, setSortOption] = useState<string>("credito_desc");

  // Estado do Modal de Filtros
  const [showFilterModal, setShowFilterModal] = useState(false);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- admin data is loaded after session validation
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

  // Contagem por Administradora e Segmento
  const { adminCounts, imoveisCount, veiculosCount } = useMemo(() => {
    const counts: Record<string, number> = {};
    let imoveis = 0;
    let veiculos = 0;

    cartas.forEach((c) => {
      const adm = (c.administradora || "Outra").trim();
      counts[adm] = (counts[adm] || 0) + 1;

      const seg = (c.segmento || "").toLowerCase();
      if (seg.includes("imove") || seg.includes("imóv")) {
        imoveis++;
      } else if (seg.includes("veic") || seg.includes("veíc") || seg.includes("auto")) {
        veiculos++;
      }
    });

    return { adminCounts: counts, imoveisCount: imoveis, veiculosCount: veiculos };
  }, [cartas]);

  // Filtragem e Ordenação das Cartas
  const cartasFiltradas = useMemo(() => {
    return cartas
      .filter((c) => {
        // Filtro de Segmento Central
        if (selectedSegment !== "todas") {
          const seg = (c.segmento || "").toLowerCase();
          if (selectedSegment === "imoveis" && !seg.includes("imove") && !seg.includes("imóv")) {
            return false;
          }
          if (selectedSegment === "veiculos" && !seg.includes("veic") && !seg.includes("veíc") && !seg.includes("auto")) {
            return false;
          }
        }

        // Filtro de Busca Textual
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchAdmin = (c.administradora || "").toLowerCase().includes(q);
          const matchObs = (c.observacoes || "").toLowerCase().includes(q);
          const matchId = String(c.id).includes(q);
          const matchCredito = String(c.valor_credito).includes(q);
          if (!matchAdmin && !matchObs && !matchId && !matchCredito) {
            return false;
          }
        }

        // Filtro de Administradora (Modal)
        if (selectedAdmin && c.administradora.toLowerCase() !== selectedAdmin.toLowerCase()) {
          return false;
        }

        // Filtro de Valor de Crédito
        if (valorMin && c.valor_credito < Number(valorMin)) return false;
        if (valorMax && c.valor_credito > Number(valorMax)) return false;

        // Filtro de Entrada
        if (entradaMin && (c.entrada || 0) < Number(entradaMin)) return false;
        if (entradaMax && (c.entrada || 0) > Number(entradaMax)) return false;

        // Filtro de Status
        if (statusFilter === "disponiveis" && !c.disponivel) return false;
        if (statusFilter === "reservadas" && c.disponivel) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "credito_desc") return b.valor_credito - a.valor_credito;
        if (sortOption === "credito_asc") return a.valor_credito - b.valor_credito;
        if (sortOption === "entrada_asc") return (a.entrada || 0) - (b.entrada || 0);
        if (sortOption === "parcela_asc") return a.valor_parcela - b.valor_parcela;
        if (sortOption === "recentes") return b.id - a.id;
        return 0;
      });
  }, [
    cartas,
    selectedSegment,
    searchQuery,
    selectedAdmin,
    valorMin,
    valorMax,
    entradaMin,
    entradaMax,
    statusFilter,
    sortOption,
  ]);

  // Contagem de filtros ativos do modal
  let activeModalFilters = 0;
  if (selectedAdmin) activeModalFilters++;
  if (valorMin || valorMax) activeModalFilters++;
  if (entradaMin || entradaMax) activeModalFilters++;
  if (statusFilter !== "todas") activeModalFilters++;
  if (sortOption !== "credito_desc") activeModalFilters++;

  const handleClearFilters = () => {
    setSelectedAdmin("");
    setValorMin("");
    setValorMax("");
    setEntradaMin("");
    setEntradaMax("");
    setStatusFilter("todas");
    setSortOption("credito_desc");
    setSearchQuery("");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-jakarta">
      {/* Top Header & Botões de Ação */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Gestão de Cartas Contempladas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
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
            className="flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-all text-white bg-[#0A7B3E] hover:bg-[#086332] shadow-sm border-none"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
            className="flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer border border-emerald-200 text-[#0A7B3E] bg-white hover:bg-emerald-50 transition-all disabled:opacity-40"
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
            className="flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-40"
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
            className="flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-all shadow-2xs"
          >
            + Nova Carta Manual
          </button>
        </div>
      </div>

      {/* ── BARRA DE CONTROLE LIMPA: Segmentos Centrais + Busca + Botão Filtros ── */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Botões Centrais de Segmento (Todos, Imóveis, Veículos) */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedSegment("todas")}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedSegment === "todas"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>Todas</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSegment === "todas" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
              {cartas.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedSegment("imoveis")}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedSegment === "imoveis"
                ? "bg-[#0A7B3E] text-white border-[#0A7B3E] shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span>Imóveis</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSegment === "imoveis" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
              {imoveisCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedSegment("veiculos")}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedSegment === "veiculos"
                ? "bg-[#0A7B3E] text-white border-[#0A7B3E] shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V9.75M3.822 9.75h16.356M3.822 9.75c-.322 0-.615-.17-.774-.45l-1.48-2.584A1.125 1.125 0 012.538 5h18.924c.427 0 .812.241.996.627l1.48 2.584a1.127 1.127 0 01-.774.45M3.822 9.75L2.25 14.25m17.928-4.5l1.572 4.5m-19.5 0h19.5m-19.5 0v3.375c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125V14.25" />
            </svg>
            <span>Veículos</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSegment === "veiculos" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
              {veiculosCount}
            </span>
          </button>
        </div>

        {/* Busca e Botão de Filtros Avançados */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Buscar por administradora, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilterModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              activeModalFilters > 0
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            <span>Filtros</span>
            {activeModalFilters > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold">
                {activeModalFilters}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Chips de Filtros Ativos */}
      {(selectedAdmin || valorMin || valorMax || entradaMin || entradaMax || statusFilter !== "todas" || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-slate-400">Filtros ativos:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
              Busca: &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery("")} className="hover:text-slate-900 font-bold ml-1 cursor-pointer">✕</button>
            </span>
          )}

          {selectedAdmin && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              Adm: {selectedAdmin}
              <button onClick={() => setSelectedAdmin("")} className="hover:text-emerald-950 font-bold ml-1 cursor-pointer">✕</button>
            </span>
          )}

          {(valorMin || valorMax) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              Crédito: {valorMin ? `R$ ${Number(valorMin).toLocaleString("pt-BR")}` : "0"} até {valorMax ? `R$ ${Number(valorMax).toLocaleString("pt-BR")}` : "Max"}
              <button onClick={() => { setValorMin(""); setValorMax(""); }} className="hover:text-emerald-950 font-bold ml-1 cursor-pointer">✕</button>
            </span>
          )}

          {(entradaMin || entradaMax) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              Entrada: {entradaMin ? `R$ ${Number(entradaMin).toLocaleString("pt-BR")}` : "0"} até {entradaMax ? `R$ ${Number(entradaMax).toLocaleString("pt-BR")}` : "Max"}
              <button onClick={() => { setEntradaMin(""); setEntradaMax(""); }} className="hover:text-emerald-950 font-bold ml-1 cursor-pointer">✕</button>
            </span>
          )}

          {statusFilter !== "todas" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              Status: {statusFilter === "disponiveis" ? "Apenas Disponíveis" : "Apenas Reservadas"}
              <button onClick={() => setStatusFilter("todas")} className="hover:text-emerald-950 font-bold ml-1 cursor-pointer">✕</button>
            </span>
          )}

          <button
            onClick={handleClearFilters}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-900 underline ml-2 cursor-pointer"
          >
            Limpar todos
          </button>
        </div>
      )}

      {/* Table Container — Formato de Tabela Limpo */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Carregando cartas contempladas...
          </div>
        ) : cartasFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-slate-800">Nenhuma carta encontrada</p>
            <p className="text-xs text-slate-400 mt-1">Suba uma planilha (.xlsx / .csv) ou ajuste os filtros selecionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-900 text-white font-bold uppercase tracking-wider">
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
              <tbody className="divide-y divide-slate-100">
                {cartasFiltradas.map((c) => {
                  const obs = c.observacoes || (c.disponivel ? "Disponível" : "Reservada");
                  const isReservada = obs.toLowerCase().includes("reservad") || !c.disponivel;
                  const vencimentoFormatted = formatVencimentoDate(c.vencimento_parcela || c.proximo_vencimento);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Crédito */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm whitespace-nowrap">
                        {formatBRL(c.valor_credito)}
                        <span className="block text-[10px] font-normal text-slate-400 uppercase tracking-wide">
                          {c.segmento || "imoveis"}
                        </span>
                      </td>

                      {/* Entrada */}
                      <td className="py-3.5 px-4 font-semibold text-emerald-700 whitespace-nowrap">
                        {formatBRL(c.entrada)}
                      </td>

                      {/* Parcelas */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{c.parcelas}x</span> de{" "}
                        <span className="font-semibold text-emerald-600">{formatBRL(c.valor_parcela)}</span>
                      </td>

                      {/* Taxa de Transferência */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium">
                        {(!c.taxa_transferencia || 
                          c.taxa_transferencia.trim() === "R$ 0,00" || 
                          c.taxa_transferencia.trim() === "0" || 
                          c.taxa_transferencia.trim() === "0,00" || 
                          c.taxa_transferencia.trim() === "R$ 0" || 
                          c.taxa_transferencia.trim() === "R$0,00"
                        ) ? (
                          <span className="text-slate-400 italic">Sob Consulta</span>
                        ) : (
                          c.taxa_transferencia
                        )}
                      </td>

                      {/* Administradora */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-700 text-xs">
                        <AdministradoraLogo name={c.administradora} />
                      </td>

                      {/* Vencimento da Parcela (Data Completa DD/MM/AAAA) */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium">
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
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 cursor-pointer"
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

      {/* ── POP-UP EXCLUSIVO DE FILTROS DO ADMIN (MODAL) ── */}
      <Dialog
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filtros avançados"
        description="Refine a listagem por administradora, valores e status."
        panelClassName="bg-white border border-slate-200 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-left"
      >
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Filtros Avançados (Gestão)</h3>
                  <p className="text-xs text-slate-500 font-light">Refine a listagem por administradora, valores e status.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer border-none font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              
              {/* 1. Administradora */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Administradora de Consórcio
                </label>
                <div className="relative">
                  <select
                    value={selectedAdmin}
                    onChange={(e) => setSelectedAdmin(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Todas as Administradoras ({cartas.length})</option>
                    {Object.entries(adminCounts).map(([admName, count]) => (
                      <option key={admName} value={admName}>
                        {admName} ({count})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 2. Faixa de Crédito */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Valor do Crédito (R$)
                  </label>
                  {(valorMin || valorMax) && (
                    <button
                      type="button"
                      onClick={() => { setValorMin(""); setValorMax(""); }}
                      className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={valorMin}
                    onChange={(e) => setValorMin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={valorMax}
                    onChange={(e) => setValorMax(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Faixa de Entrada */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Valor da Entrada (R$)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Entrada Mínima"
                    value={entradaMin}
                    onChange={(e) => setEntradaMin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Entrada Máxima"
                    value={entradaMax}
                    onChange={(e) => setEntradaMax(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Status de Disponibilidade */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Status da Carta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "todas", label: "Todas" },
                    { key: "disponiveis", label: "Disponíveis" },
                    { key: "reservadas", label: "Reservadas" },
                  ].map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setStatusFilter(st.key)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        statusFilter === st.key
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Ordenação */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Ordenar Listagem
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="credito_desc">Maior Crédito</option>
                  <option value="credito_asc">Menor Crédito</option>
                  <option value="entrada_asc">Menor Entrada</option>
                  <option value="parcela_asc">Menor Parcela</option>
                  <option value="recentes">Mais Recentes (ID)</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wide cursor-pointer transition-all"
              >
                Limpar Tudo
              </button>

              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="px-6 py-3 rounded-xl bg-[#0A7B3E] hover:bg-[#086332] text-white font-bold text-xs uppercase tracking-wide cursor-pointer transition-all shadow-md flex items-center gap-2 border-none"
              >
                Aplicar Filtros ({cartasFiltradas.length})
              </button>
            </div>
      </Dialog>

      {/* Modal Formulário Individual */}
      {showForm && (
        <AdminCartaForm
          carta={editCarta}
          onClose={() => setShowForm(false)}
          onSave={fetchCartas}
        />
      )}

      {/* Modal de Prévia de Upload de Planilha */}
      <Dialog
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Confirmar importação de planilha"
        panelClassName="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4"
      >
            <h2 className="text-lg font-bold text-slate-900">Confirmar Importação de Planilha</h2>
            <p className="text-xs text-slate-500">
              Encontramos <strong>{parsedRows.length} cartas</strong> na planilha.
            </p>

            {/* Opções de Upload */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Modo de Importação:</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="radio"
                    name="uploadMode"
                    value="replace"
                    checked={uploadMode === "replace"}
                    onChange={() => setUploadMode("replace")}
                    className="accent-emerald-600"
                  />
                  <span>Substituir TODAS as cartas atuais</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="radio"
                    name="uploadMode"
                    value="append"
                    checked={uploadMode === "append"}
                    onChange={() => setUploadMode("append")}
                    className="accent-emerald-600"
                  />
                  <span>Adicionar às existentes</span>
                </label>
              </div>
            </div>

            {/* Prévia das primeiras 5 linhas */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 font-bold text-slate-600">
                  <tr>
                    <th className="p-2.5">Crédito</th>
                    <th className="p-2.5">Entrada</th>
                    <th className="p-2.5">Parcelas</th>
                    <th className="p-2.5">Admin</th>
                    <th className="p-2.5">Vencimento</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 5).map((r, idx) => {
                    return (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold">{formatBRL(r.credito)}</td>
                        <td className="p-2.5 text-emerald-700">{formatBRL(r.entrada)}</td>
                        <td className="p-2.5">{r.parcelas}x {formatBRL(r.valor_parcela)}</td>
                        <td className="p-2.5 font-bold text-slate-700">
                          {r.administradora}
                        </td>
                        <td className="p-2.5">{r.vencimento_parcela}</td>
                        <td className="p-2.5">{r.observacoes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {parsedRows.length > 5 && (
                <div className="p-2.5 text-center text-[10px] text-slate-400 bg-slate-50 border-t border-slate-200">
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
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBulkUpload}
                disabled={uploading}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-xs hover:bg-emerald-700 disabled:opacity-50 shadow-md cursor-pointer border-none"
              >
                {uploading ? "Importando..." : "Confirmar e Publicar Planilha"}
              </button>
            </div>
      </Dialog>

      {/* Modal de Confirmação para Excluir Todas as Cartas */}
      <Dialog
        open={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        title="Excluir todas as cartas"
        description="Confirmação de exclusão permanente do estoque."
        panelClassName="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4"
      >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-900">Excluir TODAS as cartas?</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Esta ação removerá permanentemente as <strong>{cartas.length} cartas</strong> cadastradas na vitrine. Esta ação não poderá ser desfeita.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={uploading}
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl text-xs hover:bg-red-700 disabled:opacity-50 cursor-pointer border-none"
              >
                {uploading ? "Excluindo..." : "Sim, Excluir Todas"}
              </button>
            </div>
      </Dialog>
    </main>
  );
}
