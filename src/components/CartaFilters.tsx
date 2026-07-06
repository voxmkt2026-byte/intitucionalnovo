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

const SEGMENTO_LABELS: Record<string, string> = {
  veiculos: "🚗 Veículos",
  imoveis:  "🏠 Imóveis",
};

export default function CartaFilters({ segmentos, administradoras, onFilter }: Props) {
  const [segmento,       setSegmento]       = useState("");
  const [administradora, setAdministradora] = useState("");
  const [valorMin,       setValorMin]       = useState("");
  const [valorMax,       setValorMax]       = useState("");

  function apply(overrides?: Partial<{ segmento: string; administradora: string; valorMin: string; valorMax: string }>) {
    const updates = { segmento, administradora, valorMin, valorMax, ...overrides };
    onFilter(updates);
  }

  function handleSegmento(val: string) {
    const next = segmento === val ? "" : val;
    setSegmento(next);
    apply({ segmento: next });
  }

  function handleAdmin(val: string) {
    const next = administradora === val ? "" : val;
    setAdministradora(next);
    apply({ administradora: next });
  }

  function clearAll() {
    setSegmento(""); setAdministradora(""); setValorMin(""); setValorMax("");
    onFilter({ segmento: "", administradora: "", valorMin: "", valorMax: "" });
  }

  const hasFilters = segmento || administradora || valorMin || valorMax;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
      {/* Segmento */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Segmento</p>
        <div className="flex flex-wrap gap-2">
          {segmentos.map((s) => (
            <button
              key={s}
              onClick={() => handleSegmento(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
                ${segmento === s
                  ? "bg-[#C41E3A] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {SEGMENTO_LABELS[s] || s}
            </button>
          ))}
        </div>
      </div>

      {/* Administradora */}
      {administradoras.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Administradora</p>
          <div className="flex flex-wrap gap-2">
            {administradoras.map((a) => (
              <button
                key={a}
                onClick={() => handleAdmin(a)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
                  ${administradora === a
                    ? "bg-[#1a1a2e] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Range de valor */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Crédito mínimo</p>
          <input
            type="number"
            placeholder="Ex: 50000"
            value={valorMin}
            onChange={(e) => setValorMin(e.target.value)}
            onBlur={() => apply()}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/30"
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Crédito máximo</p>
          <input
            type="number"
            placeholder="Ex: 500000"
            value={valorMax}
            onChange={(e) => setValorMax(e.target.value)}
            onBlur={() => apply()}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/30"
          />
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-sm text-gray-400 hover:text-[#C41E3A] transition-colors cursor-pointer underline"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
