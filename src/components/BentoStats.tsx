"use client";

const stats = [
  { value: "R$ 50M+",  label: "Em créditos movimentados" },
  { value: "+3.000",   label: "Operações estruturadas" },
  { value: "11",       label: "Administradoras parceiras" },
  { value: "4 anos",   label: "De atuação no mercado" },
];

export function BentoStats() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map(({ value, label }) => (
        <div
          key={value}
          className="group p-5 rounded-2xl border cursor-default transition-all duration-300"
          style={{ backgroundColor: "#0b0f17", borderColor: "rgba(255,255,255,0.07)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(16,185,129,0.35)";
            (e.currentTarget as HTMLDivElement).style.backgroundColor = "#0d1a14";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
            (e.currentTarget as HTMLDivElement).style.backgroundColor = "#0b0f17";
          }}
        >
          <p
            className="text-2xl md:text-3xl font-extrabold"
            style={{ color: "#FFFFFF" }}
          >
            {value}
          </p>
          <p
            className="text-xs font-medium mt-1.5 leading-snug"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
