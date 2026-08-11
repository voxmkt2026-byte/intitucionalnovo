"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export interface Partner {
  id: number;
  nome: string;
  documento_cpf_cnpj: string;
  email: string;
  telefone: string;
  cidade: string;
  redes_sociais: string;
  chave_pix: string;
  status_onboarding: string;
  codigo_ref: string;
  vende_consorcio: boolean;
  experiencia_administradoras: string;
  experiencia_volume: string;
  experiencia_segmentos: string;
  base_tamanho: string;
  base_canais: string;
  base_ticket_medio: string;
  aceite_playbook: boolean;
  ip_assinatura: string;
  assinado_em: string | null;
  criado_em: string;
}

export interface Planilha {
  id: number;
  filename: string;
  linhas_processadas: number;
  status: string;
  erro_mensagem: string | null;
  criado_em: string;
}

export interface Comissao {
  id: number;
  cliente_nome: string;
  valor_credito: number;
  comissao_valor: number;
  status_pagamento: string;
  criado_em: string;
  parceiro_nome: string;
  codigo_ref: string;
}

interface AdminColaboradoresClientProps {
  initialPartners: Partner[];
  initialPlanilhas: Planilha[];
  initialComissoes: Comissao[];
}

type ParsedRow = {
  cliente_nome: string | number;
  valor_credito: string | number;
  comissao_valor: string | number;
  codigo_ref_ou_doc: string | number;
  data_fechamento: string | number;
};

function firstCell(
  row: Record<string, unknown>,
  keys: string[],
  fallback: string | number
): string | number {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" || typeof value === "number") return value;
  }
  return fallback;
}

export default function AdminColaboradoresClient({
  initialPartners,
  initialComissoes,
}: AdminColaboradoresClientProps) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const comissoes = initialComissoes;

  const [activeTab, setActiveTab] = useState<"candidatos" | "ativos" | "importar" | "extrato">("candidatos");
  
  // Sheet parsing states
  const [filename, setFilename] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importStatus, setImportStatus] = useState({ type: "", text: "" });
  const [importLoading, setImportLoading] = useState(false);

  // Onboarding action: Quick Approve or Block
  const handleUpdateStatus = async (id: number, newStatus: "Ativo" | "Bloqueado") => {
    try {
      const res = await fetch(`/api/admin/colaboradores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_onboarding: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar status");

      setPartners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status_onboarding: newStatus } : p))
      );
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Falha ao atualizar o colaborador.");
    }
  };

  // Parsing Excel/CSV file using SheetJS (xlsx)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    setImportStatus({ type: "", text: "" });

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

        if (data.length === 0) {
          setImportStatus({ type: "error", text: "A planilha está vazia." });
          return;
        }

        const mapped = data.map((row) => {
          const cliente_nome = firstCell(row, ["nome", "cliente", "Cliente", "Nome"], "");
          const valor_credito = firstCell(row, ["credito", "valor", "valor_credito", "Valor"], 0);
          const comissao_valor = firstCell(row, ["comissão", "comissao", "comissao_valor", "Comissao"], 0);
          const codigo_ref_ou_doc = firstCell(row, ["codigo", "ref", "indicador", "cpf", "cnpj", "Parceiro"], "");
          const data_fechamento = firstCell(row, ["data", "data_fechamento", "Data"], "");

          return { cliente_nome, valor_credito, comissao_valor, codigo_ref_ou_doc, data_fechamento };
        });

        setParsedRows(mapped);
        setImportStatus({
          type: "info",
          text: `Planilha lida com sucesso! Encontradas ${mapped.length} comissões prontas para importação.`,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "arquivo inválido";
        setImportStatus({ type: "error", text: `Falha ao ler o arquivo: ${message}` });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;

    setImportLoading(true);
    setImportStatus({ type: "", text: "" });

    try {
      const res = await fetch("/api/admin/colaboradores/importar-planilha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, rows: parsedRows }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao importar comissões");

      setImportStatus({
        type: "success",
        text: `Importação concluída! ${data.matchedCount} linhas associadas com sucesso.`,
      });

      if (data.success) {
        window.location.reload();
      }
    } catch (error: unknown) {
      setImportStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Falha ao importar a planilha.",
      });
    } finally {
      setImportLoading(false);
    }
  };

  const pendingPartners = partners.filter((p) => p.status_onboarding === "Pendente" || p.status_onboarding === "Em Análise");
  const activePartners = partners.filter((p) => p.status_onboarding === "Ativo" || p.status_onboarding === "Verificado");
  const blockedPartners = partners.filter((p) => p.status_onboarding === "Bloqueado");

  // Calculations for Pie/Donut charts
  const totalPartnersCount = partners.length || 1;
  const activePct = Math.round((activePartners.length / totalPartnersCount) * 100);
  const pendingPct = Math.round((pendingPartners.length / totalPartnersCount) * 100);
  const blockedPct = Math.max(0, 100 - activePct - pendingPct);

  const totalComissoesValor = comissoes.reduce((acc, c) => acc + Number(c.comissao_valor || 0), 0);

  return (
    <div className="w-full space-y-6 font-jakarta text-slate-800 text-left">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gestão Executiva de Colaboradores</h1>
            <span className="crm-tag-mint text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              Mesa de Afiliados
            </span>
          </div>
          <p className="text-xs text-slate-500 font-light mt-0.5">
            Inbox de candidatos, aprovação de contratos digitais, inteligência de rede e conciliação bancária.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Download de arquivo: âncora é intencional; não é navegação de página. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/admin/colaboradores/importar-planilha"
            className="crm-pill bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer shadow-2xs"
          >
            Exportar Relatório CSV
          </a>
          <button
            onClick={() => setActiveTab("importar")}
            className="crm-pill bg-[#0A7B3E] hover:bg-[#086332] text-white cursor-pointer shadow-sm border-none"
          >
            + Importar Comissões
          </button>
        </div>
      </div>

      {/* ══ ROW 1: TOP 4 BENTO KPI TILES ════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tile 1: Total Afiliados (Hero Dark Accent) */}
        <div className="crm-card-dark p-5 flex flex-col justify-between text-left">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">
              Total de Colaboradores
            </span>
            <div className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
              {partners.length} <span className="text-xs font-normal text-slate-400">cadastrados</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1">
              ↗ 100% blindados no CRM
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-6 mt-4">
            <div className="w-1.5 bg-emerald-500/40 rounded-t h-2" />
            <div className="w-1.5 bg-emerald-500/60 rounded-t h-4" />
            <div className="w-1.5 bg-emerald-400 rounded-t h-6" />
          </div>
        </div>

        {/* Tile 2: Onboarding Pendente (Sage Green Tile) */}
        <div className="crm-card-sage p-5 flex flex-col justify-between text-left">
          <div>
            <span className="text-[10px] font-bold text-[#0A7B3E] uppercase tracking-wider block mb-1">
              Candidatos Onboarding
            </span>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
              {pendingPartners.length} <span className="text-xs font-normal text-slate-500">pendentes</span>
            </div>
            <div className="text-[11px] text-amber-700 font-bold mt-1">
              Aguardando aprovação de contrato
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[10px] text-slate-500 font-semibold">Análise cadastral expressa</span>
          </div>
        </div>

        {/* Tile 3: Colaboradores Ativos (Light Glass) */}
        <div className="crm-card p-5 flex flex-col justify-between text-left">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Afiliados Ativos
            </span>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
              {activePartners.length} <span className="text-xs font-normal text-slate-400">operando</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              Produzindo indicações ativas
            </div>
          </div>
          <div className="flex items-end gap-1 h-5 mt-4">
            <div className="w-1.5 bg-slate-200 rounded-t h-2" />
            <div className="w-1.5 bg-slate-300 rounded-t h-3.5" />
            <div className="w-1.5 bg-emerald-500 rounded-t h-5" />
          </div>
        </div>

        {/* Tile 4: Total Comissões PIX (Light Glass) */}
        <div className="crm-card p-5 flex flex-col justify-between text-left">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Comissões Liquidadas PIX
            </span>
            <div className="text-2xl font-extrabold text-[#0A7B3E] tabular-nums tracking-tight">
              R$ {totalComissoesValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Conciliadas com faturamento
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mt-4">
            <span>Repasse imediato</span>
            <span className="text-emerald-600">100% OK</span>
          </div>
        </div>
      </div>

      {/* ══ ROW 2: GRÁFICOS PIZZA / DONUT DE AFILIADOS ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Donut Chart 1: Status dos Afiliados (Col 6) */}
        <div className="lg:col-span-6 crm-card p-6 flex flex-col justify-between text-left space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Distribuição por Status de Onboarding</h3>
              <p className="text-[11px] text-slate-400 font-light">Proporção da base de parceiros cadastrados no sistema</p>
            </div>
            <span className="crm-tag-mint text-[10px]">Visão Executiva</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Circle */}
                <path
                  className="text-slate-100"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Ativos Segment */}
                <path
                  className="text-[#10B981] transition-all duration-700"
                  strokeDasharray={`${activePct}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Onboarding Segment */}
                <path
                  className="text-amber-400 transition-all duration-700"
                  strokeDasharray={`${pendingPct}, 100`}
                  strokeDashoffset={`-${activePct}`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-slate-900 leading-none">{partners.length}</span>
                <span className="text-[9px] text-slate-400 uppercase font-semibold mt-0.5">Afiliados</span>
              </div>
            </div>

            {/* Legenda Lateral */}
            <div className="space-y-3 flex-1 w-full text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="font-semibold text-slate-800">Ativos Verificados</span>
                </div>
                <span className="font-extrabold text-slate-900">{activePartners.length} ({activePct}%)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="font-semibold text-slate-800">Pendente Onboarding</span>
                </div>
                <span className="font-extrabold text-slate-900">{pendingPartners.length} ({pendingPct}%)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="font-semibold text-slate-800">Bloqueados / Inativos</span>
                </div>
                <span className="font-extrabold text-slate-900">{blockedPartners.length} ({blockedPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Donut Chart 2: Mix de Atuação Comercial dos Afiliados (Col 6) */}
        <div className="lg:col-span-6 crm-card p-6 flex flex-col justify-between text-left space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Perfil & Segmentos de Atuação</h3>
              <p className="text-[11px] text-slate-400 font-light">Segmento principal de prospecção dos colaboradores</p>
            </div>
            <span className="crm-pill bg-slate-100 text-slate-600 text-[10px]">Segmentação</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-600" strokeDasharray="55, 100" strokeWidth="3.8" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-blue-500" strokeDasharray="30, 100" strokeDashoffset="-55" strokeWidth="3.8" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-500" strokeDasharray="15, 100" strokeDashoffset="-85" strokeWidth="3.8" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-extrabold text-slate-900 leading-none">100%</span>
                <span className="text-[9px] text-slate-400 uppercase font-semibold mt-0.5">Demanda</span>
              </div>
            </div>

            {/* Legenda Lateral */}
            <div className="space-y-3 flex-1 w-full text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span className="font-semibold text-slate-800">Imóveis & Lotes</span>
                </div>
                <span className="font-extrabold text-slate-900">55%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="font-semibold text-slate-800">Veículos & Frotas</span>
                </div>
                <span className="font-extrabold text-slate-900">30%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="font-semibold text-slate-800">Agro & Máquinas</span>
                </div>
                <span className="font-extrabold text-slate-900">15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ ROW 3: TABBED MANAGEMENT DATA TABLE ═════════════════ */}
      <div className="crm-card p-6 space-y-6 text-left">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {[
            { id: "candidatos" as const, label: `Candidatos Onboarding (${pendingPartners.length})` },
            { id: "ativos" as const, label: `Colaboradores Ativos (${activePartners.length})` },
            { id: "importar" as const, label: "Importar Planilha de Comissões" },
            { id: "extrato" as const, label: "Histórico & Lançamentos" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: CANDIDATOS ONBOARDING */}
        {activeTab === "candidatos" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-900">Candidatos Pendentes de Ativação</h3>
              <span className="text-xs text-slate-400 font-light">Valide os dados e aceite de contrato para liberar o portal</span>
            </div>

            {pendingPartners.length === 0 ? (
              <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-700">Nenhum candidato pendente no momento</p>
                <p className="text-[11px] text-slate-400 font-light mt-1">Todos os cadastros foram processados com sucesso.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Candidato</th>
                      <th className="py-3 px-3">Documento</th>
                      <th className="py-3 px-3">Cidade / Contato</th>
                      <th className="py-3 px-3">Contrato Digital</th>
                      <th className="py-3 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingPartners.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900">{p.nome}</div>
                          <div className="text-[10px] text-slate-400 font-mono">REF: #{p.codigo_ref}</div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-600">{p.documento_cpf_cnpj || "—"}</td>
                        <td className="py-3.5 px-3">
                          <div className="text-slate-800 font-medium">{p.cidade || "—"}</div>
                          <div className="text-[10px] text-slate-400">{p.telefone}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`crm-pill text-[9px] ${p.aceite_playbook ? "crm-tag-mint" : "crm-tag-peach"}`}>
                            {p.aceite_playbook ? "Aceite Registrado IP" : "Pendente Assinatura"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(p.id, "Ativo")}
                            className="px-3 py-1.5 bg-[#0A7B3E] hover:bg-[#086332] text-white text-[10px] font-bold rounded-lg transition-all border-none cursor-pointer"
                          >
                            Aprovar Afiliado
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(p.id, "Bloqueado")}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg transition-all border border-rose-200 cursor-pointer"
                          >
                            Bloquear
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COLABORADORES ATIVOS */}
        {activeTab === "ativos" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-900">Colaboradores Ativos no Ecossistema</h3>
              <span className="text-xs text-slate-400 font-light">Parceiros com portal liberado e comissão habilitada</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Parceiro</th>
                    <th className="py-3 px-3">Ref ID</th>
                    <th className="py-3 px-3">Chave PIX</th>
                    <th className="py-3 px-3">Contrato Assinado</th>
                    <th className="py-3 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activePartners.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{p.nome}</div>
                        <div className="text-[10px] text-slate-400">{p.email}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-700">#{p.codigo_ref}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">{p.chave_pix || "Cadastrando..."}</td>
                      <td className="py-3.5 px-3">
                        <a
                          href={`/api/admin/colaboradores/${p.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#0A7B3E] font-bold text-[10px] hover:underline"
                        >
                          📄 Baixar PDF Contrato
                        </a>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleUpdateStatus(p.id, "Bloqueado")}
                          className="px-3 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-[10px] font-bold rounded-lg transition-all border border-slate-200 cursor-pointer"
                        >
                          Suspender
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: IMPORTAR PLANILHA DE COMISSÕES */}
        {activeTab === "importar" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Importação & Conciliação de Comissões</h3>
              <p className="text-xs text-slate-400 font-light">Suba arquivos Excel (.xlsx, .csv) fornecidos pelas administradoras para conciliar os repasses no PIX dos afiliados.</p>
            </div>

            <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/60 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0A7B3E] flex items-center justify-center mx-auto text-xl font-bold">
                📊
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Selecione o arquivo Excel de repasse de comissões</p>
                <p className="text-[11px] text-slate-400 font-light mt-0.5">Suporta colunas: Cliente, Valor Crédito, Comissão, Ref Parceiro.</p>
              </div>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
              />
              <label
                htmlFor="file-upload-input"
                className="crm-pill bg-[#0A7B3E] hover:bg-[#086332] text-white cursor-pointer inline-block"
              >
                Escolher Arquivo no Computador
              </label>
              {filename && <p className="text-xs font-mono font-bold text-emerald-700 mt-2">Arquivo: {filename}</p>}
            </div>

            {importStatus.text && (
              <div className={`p-4 rounded-2xl text-xs font-semibold border ${
                importStatus.type === "error"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : importStatus.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
              }`}>
                {importStatus.text}
              </div>
            )}

            {parsedRows.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-900">Pré-visualização dos Registros ({parsedRows.length})</h4>
                  <button
                    onClick={handleConfirmImport}
                    disabled={importLoading}
                    className="crm-pill bg-slate-900 hover:bg-slate-800 text-white cursor-pointer border-none"
                  >
                    {importLoading ? "Processando..." : "Confirmar & Processar Lançamentos"}
                  </button>
                </div>

                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2 px-3">Cliente</th>
                        <th className="py-2 px-3">Crédito</th>
                        <th className="py-2 px-3">Comissão</th>
                        <th className="py-2 px-3">Parceiro / Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-800">{r.cliente_nome || "—"}</td>
                          <td className="py-2 px-3 font-mono">R$ {r.valor_credito}</td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-600">R$ {r.comissao_valor}</td>
                          <td className="py-2 px-3 font-mono">{r.codigo_ref_ou_doc || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: HISTÓRICO DE LANÇAMENTOS */}
        {activeTab === "extrato" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-900">Histórico de Comissões Liquidadas</h3>
              <span className="text-xs text-slate-400 font-light">Registros de repasses via PIX efetuados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Data</th>
                    <th className="py-3 px-3">Parceiro</th>
                    <th className="py-3 px-3">Cliente</th>
                    <th className="py-3 px-3">Valor Crédito</th>
                    <th className="py-3 px-3">Comissão PIX</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comissoes.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-slate-500">{new Date(c.criado_em).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{c.parceiro_nome || "—"} (#{c.codigo_ref})</td>
                      <td className="py-3 px-3 text-slate-700">{c.cliente_nome}</td>
                      <td className="py-3 px-3 font-mono">R$ {Number(c.valor_credito).toLocaleString("pt-BR")}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600">R$ {Number(c.comissao_valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="crm-tag-mint text-[9px] px-2.5 py-0.5 rounded-full">
                          {c.status_pagamento === "pago" ? "PIX Liquidado" : "Em Processamento"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
