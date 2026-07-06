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

  const chipActive   = { backgroundColor: "#0A7B3E", color: "#FFFFFF" };
  const chipInactive = { backgroundColor: "#EFEDE8", color: "#4A4A4A", border: "1px solid #E5E2DC" };
  const inputStyle   = {
    border: "1px solid #E5E2DC",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "13px",
    width: "140px",
    backgroundColor: "#F8F7F4",
    color: "#1A1A1A",
    outline: "none",
  };

  return (
    <div className="rounded-2xl p-5 mb-6" style={{
      backgroundColor: "#FFFFFF",
      boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 6px 24px rgba(0,0,0,.06)",
    }}>
      {/* Segmento */}
      {segmentos.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#8A8A8A" }}>Segmento</p>
          <div className="flex flex-wrap gap-2">
            {segmentos.map((s) => (
              <button
                key={s}
                onClick={() => handleSegmento(s)}
                className="px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-150"
                style={segmento === s ? chipActive : chipInactive}
              >
                {SEGMENTO_LABELS[s] || s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Administradora */}
      {administradoras.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#8A8A8A" }}>Administradora</p>
          <div className="flex flex-wrap gap-2">
            {administradoras.map((a) => (
              <button
                key={a}
                onClick={() => handleAdmin(a)}
                className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-150"
                style={administradora === a
                  ? { backgroundColor: "#1A1F1C", color: "#FFFFFF" }
                  : chipInactive}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Range */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#8A8A8A" }}>Crédito mínimo</p>
          <input type="number" placeholder="Ex: 50.000" value={valorMin}
            onChange={(e) => setValorMin(e.target.value)}
            onBlur={() => apply()}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "#0A7B3E"}
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#8A8A8A" }}>Crédito máximo</p>
          <input type="number" placeholder="Ex: 500.000" value={valorMax}
            onChange={(e) => setValorMax(e.target.value)}
            onBlur={() => apply()}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "#0A7B3E"}
          />
        </div>
        {hasFilters && (
          <button onClick={clearAll}
            className="text-sm cursor-pointer transition-colors hover:underline"
            style={{ color: "#8A8A8A" }}>
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
