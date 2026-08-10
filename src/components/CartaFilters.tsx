"use client";

import { useState } from "react";

export interface FilterState {
  segmento: string;
  administradora: string;
  valorMin: string;
  valorMax: string;
  entradaMin?: string;
  entradaMax?: string;
  status?: string;
  ordenacao?: string;
}

interface Props {
  segmentos: string[];
  administradoras: string[];
  totalCartas?: number;
  filteredCount?: number;
  onFilter: (filters: FilterState) => void;
}

export default function CartaFilters({
  administradoras,
  filteredCount,
  onFilter,
}: Props) {
  const [segmento, setSegmento] = useState<string>("");
  const [administradora, setAdministradora] = useState<string>("");
  const [valorMin, setValorMin] = useState<string>("");
  const [valorMax, setValorMax] = useState<string>("");
  const [entradaMin, setEntradaMin] = useState<string>("");
  const [entradaMax, setEntradaMax] = useState<string>("");
  const [status, setStatus] = useState<string>("todas");
  const [ordenacao, setOrdenacao] = useState<string>("credito_desc");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick Segment Click Handler
  const handleQuickSegment = (seg: string) => {
    const nextSeg = segmento === seg ? "" : seg;
    setSegmento(nextSeg);
    onFilter({
      segmento: nextSeg,
      administradora,
      valorMin,
      valorMax,
      entradaMin,
      entradaMax,
      status,
      ordenacao,
    });
  };

  const handleApplyModal = () => {
    onFilter({
      segmento,
      administradora,
      valorMin,
      valorMax,
      entradaMin,
      entradaMax,
      status,
      ordenacao,
    });
    setIsModalOpen(false);
  };

  const handleClearAll = () => {
    setSegmento("");
    setAdministradora("");
    setValorMin("");
    setValorMax("");
    setEntradaMin("");
    setEntradaMax("");
    setStatus("todas");
    setOrdenacao("credito_desc");
    onFilter({
      segmento: "",
      administradora: "",
      valorMin: "",
      valorMax,
      entradaMin: "",
      entradaMax: "",
      status: "todas",
      ordenacao: "credito_desc",
    });
    setIsModalOpen(false);
  };

  const setCreditPreset = (min: string, max: string) => {
    setValorMin(min);
    setValorMax(max);
  };

  // Contagem de filtros ativos além do segmento padrão
  let activeFiltersCount = 0;
  if (administradora) activeFiltersCount++;
  if (valorMin || valorMax) activeFiltersCount++;
  if (entradaMin || entradaMax) activeFiltersCount++;
  if (status && status !== "todas") activeFiltersCount++;
  if (ordenacao && ordenacao !== "credito_desc") activeFiltersCount++;

  return (
    <div className="w-full flex flex-col items-center mb-8 font-jakarta">
      {/* ── BARRA CENTRAL LIMPA: Segmentos Centrais + Botão de Filtro ── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-2xl bg-slate-50/80 p-2 rounded-2xl border border-slate-200/80 shadow-xs backdrop-blur-xs">
        
        {/* Botão Todos */}
        <button
          type="button"
          onClick={() => handleQuickSegment("")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
            segmento === ""
              ? "bg-[#0A7B3E] text-white border-[#0A7B3E] shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100/80"
          }`}
        >
          Todas
        </button>

        {/* Botão Imóveis */}
        <button
          type="button"
          onClick={() => handleQuickSegment("imoveis")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
            segmento === "imoveis"
              ? "bg-[#0A7B3E] text-white border-[#0A7B3E] shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100/80"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Imóveis
        </button>

        {/* Botão Veículos */}
        <button
          type="button"
          onClick={() => handleQuickSegment("veiculos")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
            segmento === "veiculos"
              ? "bg-[#0A7B3E] text-white border-[#0A7B3E] shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100/80"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V9.75M3.822 9.75h16.356M3.822 9.75c-.322 0-.615-.17-.774-.45l-1.48-2.584A1.125 1.125 0 012.538 5h18.924c.427 0 .812.241.996.627l1.48 2.584a1.127 1.127 0 01-.774.45M3.822 9.75L2.25 14.25m17.928-4.5l1.572 4.5m-19.5 0h19.5m-19.5 0v3.375c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125V14.25" />
          </svg>
          Veículos
        </button>

        {/* Divisor vertical */}
        <div className="hidden sm:block w-[1px] h-6 bg-slate-200 mx-1" />

        {/* Botão de Filtros Avançados (Abre Pop-up) */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
            activeFiltersCount > 0
              ? "bg-slate-900 text-white border-slate-900 shadow-md"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100/80"
          }`}
        >
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Filtros
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Indicadores de Filtros Ativos (Chips removíveis) */}
      {(administradora || valorMin || valorMax || entradaMin || entradaMax || (status && status !== "todas")) && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs">
          <span className="text-[11px] font-semibold text-slate-400">Filtros aplicados:</span>
          
          {administradora && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              Adm: {administradora}
              <button
                type="button"
                onClick={() => { setAdministradora(""); onFilter({ segmento, administradora: "", valorMin, valorMax, entradaMin, entradaMax, status, ordenacao }); }}
                className="hover:text-emerald-950 font-bold ml-1 cursor-pointer"
              >
                ✕
              </button>
            </span>
          )}

          {(valorMin || valorMax) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              Crédito: {valorMin ? `R$ ${Number(valorMin).toLocaleString("pt-BR")}` : "0"} até {valorMax ? `R$ ${Number(valorMax).toLocaleString("pt-BR")}` : "Max"}
              <button
                type="button"
                onClick={() => { setValorMin(""); setValorMax(""); onFilter({ segmento, administradora, valorMin: "", valorMax: "", entradaMin, entradaMax, status, ordenacao }); }}
                className="hover:text-emerald-950 font-bold ml-1 cursor-pointer"
              >
                ✕
              </button>
            </span>
          )}

          {(entradaMin || entradaMax) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              Entrada: {entradaMin ? `R$ ${Number(entradaMin).toLocaleString("pt-BR")}` : "0"} até {entradaMax ? `R$ ${Number(entradaMax).toLocaleString("pt-BR")}` : "Max"}
              <button
                type="button"
                onClick={() => { setEntradaMin(""); setEntradaMax(""); onFilter({ segmento, administradora, valorMin, valorMax, entradaMin: "", entradaMax: "", status, ordenacao }); }}
                className="hover:text-emerald-950 font-bold ml-1 cursor-pointer"
              >
                ✕
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-900 underline ml-2 cursor-pointer"
          >
            Limpar tudo
          </button>
        </div>
      )}

      {/* ── POP-UP EXCLUSIVO DE FILTROS (MODAL) ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col my-auto text-left">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Filtros de Cartas Contempladas</h3>
                  <p className="text-xs text-slate-500 font-light">Refine por valor, administradora e prazos.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer border-none font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              
              {/* 1. Segmento */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Segmento do Bem
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "", label: "Todos" },
                    { key: "imoveis", label: "Imóveis" },
                    { key: "veiculos", label: "Veículos" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSegmento(s.key)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        segmento === s.key
                          ? "bg-[#0A7B3E] text-white border-[#0A7B3E] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Administradora */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Administradora de Consórcio
                </label>
                <div className="relative">
                  <select
                    value={administradora}
                    onChange={(e) => setAdministradora(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Todas as Administradoras</option>
                    {administradoras.map((adm) => (
                      <option key={adm} value={adm}>
                        {adm}
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

              {/* 3. Faixa de Valor de Crédito */}
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
                      Limpar valores
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Mínimo (ex: 150000)"
                    value={valorMin}
                    onChange={(e) => setValorMin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Máximo (ex: 1000000)"
                    value={valorMax}
                    onChange={(e) => setValorMax(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Presets rápidos de crédito */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCreditPreset("", "200000")}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                  >
                    Até R$ 200k
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditPreset("200000", "500000")}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                  >
                    R$ 200k a 500k
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditPreset("500000", "1000000")}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                  >
                    R$ 500k a 1M
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditPreset("1000000", "")}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                  >
                    Acima de 1M
                  </button>
                </div>
              </div>

              {/* 4. Faixa de Entrada */}
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

              {/* 5. Ordenação */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Ordenar Resultados
                </label>
                <select
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="credito_desc">Maior Crédito</option>
                  <option value="credito_asc">Menor Crédito</option>
                  <option value="entrada_asc">Menor Entrada</option>
                  <option value="parcela_asc">Menor Parcela</option>
                </select>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClearAll}
                className="px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wide cursor-pointer transition-all"
              >
                Limpar Tudo
              </button>

              <button
                type="button"
                onClick={handleApplyModal}
                className="px-6 py-3 rounded-xl bg-[#0A7B3E] hover:bg-[#086332] text-white font-bold text-xs uppercase tracking-wide cursor-pointer transition-all shadow-md flex items-center gap-2 border-none"
              >
                Aplicar Filtros
                {filteredCount !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold">
                    {filteredCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
