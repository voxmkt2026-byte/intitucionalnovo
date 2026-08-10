"use client";

import { useState } from "react";

interface Props {
  segmentos: string[];
  administradoras: string[];
  onFilter: (filters: {
    segmento: string;
    administradora: string;
    valorMin: string;
    valorMax: string;
  }) => void;
}

export default function CartaFilters({ segmentos, administradoras, onFilter }: Props) {
  const [segmento, setSegmento] = useState("");
  const [administradora, setAdministradora] = useState("");
  const [valorMin, setValorMin] = useState("");
  const [valorMax, setValorMax] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  function apply(overrides?: Partial<{ segmento: string; administradora: string; valorMin: string; valorMax: string }>) {
    const updates = { segmento, administradora, valorMin, valorMax, ...overrides };
    onFilter(updates);
  }

  function handleSegmento(val: string) {
    const next = segmento === val ? "" : val;
    setSegmento(next);
    apply({ segmento: next });
  }

  function handleAdminChange(val: string) {
    setAdministradora(val);
    apply({ administradora: val });
  }

  function clearAll() {
    setSegmento("");
    setAdministradora("");
    setValorMin("");
    setValorMax("");
    onFilter({ segmento: "", administradora: "", valorMin: "", valorMax: "" });
  }

  const hasActiveFilters = segmento || administradora || valorMin || valorMax;

  return (
    <div className="w-full flex flex-col items-center mb-8 space-y-6">
      {/* Centered Segment Selector Buttons */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Filtrar por Segmento
        </span>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleSegmento("imoveis")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer border ${
              segmento === "imoveis"
                ? "bg-slate-900 border-slate-900 text-white shadow-md"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Imóveis
          </button>

          <button
            type="button"
            onClick={() => handleSegmento("veiculos")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer border ${
              segmento === "veiculos"
                ? "bg-slate-900 border-slate-900 text-white shadow-md"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V9.75M3.822 9.75h16.356M3.822 9.75c-.322 0-.615-.17-.774-.45l-1.48-2.584A1.125 1.125 0 012.538 5h18.924c.427 0 .812.241.996.627l1.48 2.584a1.127 1.127 0 01-.774.45M3.822 9.75L2.25 14.25m17.928-4.5l1.572 4.5m-19.5 0h19.5m-19.5 0v3.375c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125V14.25" />
            </svg>
            Veículos
          </button>
        </div>
      </div>

      {/* Main Collapse Trigger Button */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
            isOpen || hasActiveFilters
              ? "bg-slate-100 border-slate-300 text-slate-800"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A50.065 50.065 0 0112 3z" />
          </svg>
          {isOpen ? "Ocultar Filtros" : "Filtros"}
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Collapsible Panel */}
      {isOpen && (
        <div
          className="w-full max-w-xl p-6 rounded-2xl border border-slate-200 bg-white shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-6 transition-all animate-fadeIn"
        >
          {/* Column 1: Administradora */}
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Administradora
            </label>
            <div className="relative">
              <select
                value={administradora}
                onChange={(e) => handleAdminChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:border-emerald-500 focus:bg-white outline-none appearance-none cursor-pointer"
              >
                <option value="">Todas as Administradoras</option>
                {administradoras.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Column 2: Faixa de Crédito */}
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Valor do Crédito
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mínimo"
                value={valorMin}
                onChange={(e) => setValorMin(e.target.value)}
                onBlur={() => apply()}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:border-emerald-500 focus:bg-white outline-none"
              />
              <span className="text-slate-400 text-xs font-bold">até</span>
              <input
                type="number"
                placeholder="Máximo"
                value={valorMax}
                onChange={(e) => setValorMax(e.target.value)}
                onBlur={() => apply()}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:border-emerald-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold italic">
              * Filtros aplicam-se automaticamente
            </span>
            
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 underline transition-colors cursor-pointer"
              >
                Limpar Todos os Filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
