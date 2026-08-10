"use client";

const stats = [
  { 
    value: "R$ 50M+", 
    label: "Em créditos estruturados",
    change: "↗ +24% ano a ano",
    type: "hero",
    bars: [30, 45, 60, 95]
  },
  { 
    value: "+3.000", 
    label: "Operações com parecer positivo",
    change: "99.4% aprovação",
    type: "sage",
    bars: [40, 70, 85, 100]
  },
  { 
    value: "11", 
    label: "Administradoras homologadas",
    change: "Regulação BACEN",
    type: "light",
    bars: [20, 50, 75, 90]
  },
  { 
    value: "4 anos", 
    label: "De governança e solidez",
    change: "Mesa executiva",
    type: "light",
    bars: [35, 55, 80, 100]
  },
];

export function BentoStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta text-left">
      {stats.map(({ value, label, change, type, bars }) => (
        <div
          key={value}
          className={`p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between ${
            type === "hero"
              ? "crm-card-dark"
              : type === "sage"
              ? "crm-card-sage"
              : "crm-card"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                type === "hero" ? "text-emerald-400" : "text-slate-400"
              }`}>
                {change}
              </span>
              <div className="flex items-end gap-1 h-5">
                {bars.map((h, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 rounded-t ${
                      type === "hero"
                        ? "bg-emerald-400"
                        : "bg-emerald-500"
                    }`}
                    style={{ height: `${h}%`, opacity: 0.3 + idx * 0.23 }}
                  />
                ))}
              </div>
            </div>

            <p className={`text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums ${
              type === "hero" ? "text-white" : "text-slate-900"
            }`}>
              {value}
            </p>
          </div>

          <p className={`text-xs font-medium mt-3 leading-snug ${
            type === "hero" ? "text-slate-300" : "text-slate-500"
          }`}>
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
