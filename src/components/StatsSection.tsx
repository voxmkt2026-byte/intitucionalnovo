"use client";

import { useRef, useState, useCallback } from "react";

/* ── Stats data ── */
const statsData = [
  {
    number: "2",
    suffix: "mi",
    subtitle: "de consorciados ativos",
    description: (
      <>
        <strong className="text-white font-semibold">2 milhões de consorciados ativos</strong> estão
        agora em um grupo de consórcio para realizar seus sonhos
      </>
    ),
  },
  {
    number: "307",
    prefix: "R$",
    suffix: "bi+",
    subtitle: "em crédito",
    description: (
      <>
        <strong className="text-white font-semibold">+ de R$ 307 bi em créditos</strong>
        <br />
        já foram comercializados pelo sistema de consórcio nos últimos 12 meses
      </>
    ),
  },
  {
    number: "20",
    suffix: "%",
    subtitle: "de contemplação",
    description: (
      <>
        <strong className="text-white font-semibold">Taxa de 20% de contemplação.</strong> Com a carta
        contemplada, você elimina a espera e tem crédito liberado sem esperar sorteio.
      </>
    ),
  },
];

/* ── Single stat card (shared between desktop & mobile) ── */
function StatCard({
  stat,
  align = "left",
}: {
  stat: (typeof statsData)[0];
  align?: "left" | "right";
}) {
  const isRight = align === "right";
  return (
    <div className="flex flex-col gap-4 max-w-[400px] mx-auto">
      <h3
        className={`font-[family-name:var(--font-montserrat)] ${
          isRight ? "text-right" : ""
        }`}
      >
        <span className="font-black text-6xl md:text-7xl lg:text-8xl leading-[0.9] block" style={{ color: "var(--green-vivid)" }}>
          {stat.prefix && (
            <span className="text-[0.35em] text-white/50 align-top mr-1">
              {stat.prefix}
            </span>
          )}
          {stat.number}
          <span className="text-[0.45em] text-white">{stat.suffix}</span>
        </span>
        <span className="font-bold text-lg md:text-xl text-white/80 block mt-2">
          {stat.subtitle}
        </span>
      </h3>
      <p
        className={`font-[family-name:var(--font-montserrat)] text-base md:text-lg text-white/60 leading-relaxed font-normal ${
          isRight ? "text-right" : ""
        }`}
      >
        {stat.description}
      </p>
    </div>
  );
}

/* ── Main StatsSection component ── */
export default function StatsSection() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < statsData.length) setCurrent(index);
    },
    []
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold) goTo(current + 1);
    else if (diff < -threshold) goTo(current - 1);
  };

  return (
    <section
      className="relative py-16 md:py-28 overflow-hidden"
      style={{ backgroundColor: "var(--bg-dark)" }}
    >
      {/* Background — lightweight CSS gradient (replaces heavy WebGL LiquidEther) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 30% 40%, rgba(10,123,62,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 70% 60%, rgba(6,83,42,0.18) 0%, transparent 55%), radial-gradient(ellipse 40% 30% at 50% 50%, rgba(21,184,92,0.10) 0%, transparent 50%)",
        }}
      />

      {/* Subtle radial gradients for depth */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 15% 50%, rgba(10,123,62,0.14) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 85% 50%, rgba(6,83,42,0.10) 0%, transparent 60%)",
        }}
      />

      {/* Grid de pontos sutil */}
      <svg className="absolute inset-0 w-full h-full z-[1]" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.04 }}>
        <defs>
          <pattern id="stats-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#ffffff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stats-dots)" />
      </svg>

      <div className="relative z-10 max-w-[960px] mx-auto px-8 md:px-16 pt-8 pb-16 text-center">
        <span className="inline-block text-green-vivid text-xs font-sans font-bold uppercase tracking-[0.2em] mb-3">
          Indicadores do Setor
        </span>
        <h2 className="font-[family-name:var(--font-jakarta)] text-white text-3xl md:text-4xl font-extrabold tracking-tight">
          O Mercado de Consórcios no Brasil
        </h2>
        <p className="text-white/60 text-sm mt-2 max-w-lg mx-auto leading-relaxed">
          Para contextualizar seu planejamento: veja os dados oficiais consolidados do sistema nacional de consórcios (Fonte: ABAC).
        </p>
      </div>

      {/* ════ DESKTOP: Grid rows — number + text side by side ════ */}
      <div className="relative z-10 hidden md:block max-w-[960px] mx-auto px-8 md:px-16 space-y-36">
        {/* Row 1 — number LEFT, text RIGHT */}
        <div className="grid grid-cols-12 gap-12 items-center">
          <div className="col-span-5">
            <h3 className="font-[family-name:var(--font-montserrat)]">
              <span className="font-black text-6xl md:text-7xl lg:text-8xl leading-[0.9] block" style={{ color: "var(--green-vivid)" }}>
                2<span className="text-[0.45em] text-white">mi</span>
              </span>
              <span className="font-bold text-lg md:text-xl text-white/80 block mt-2">
                de consorciados ativos
              </span>
            </h3>
          </div>
          <div className="col-span-7">
            <p className="font-[family-name:var(--font-montserrat)] text-lg md:text-xl lg:text-2xl text-white/60 leading-relaxed font-normal">
              <strong className="text-white font-semibold">2 milhões de consorciados ativos</strong> estão agora em um grupo de consórcio para realizar seus sonhos
            </p>
          </div>
        </div>

        {/* Row 2 — text LEFT, number RIGHT */}
        <div className="grid grid-cols-12 gap-12 items-center">
          <div className="col-span-7">
            <p className="font-[family-name:var(--font-montserrat)] text-lg md:text-xl lg:text-2xl text-white/60 leading-relaxed font-normal text-right">
              <strong className="text-white font-semibold">+ de R$ 307 bi em créditos</strong><br />
              já foram comercializados pelo sistema de consórcio nos últimos 12 meses
            </p>
          </div>
          <div className="col-span-5">
            <h3 className="font-[family-name:var(--font-montserrat)] text-right">
              <span className="font-black text-6xl md:text-7xl lg:text-8xl leading-[0.9] block" style={{ color: "var(--green-vivid)" }}>
                <span className="text-[0.35em] text-white/50 align-top mr-1">R$</span>307<span className="text-[0.45em] text-white">bi+</span>
              </span>
              <span className="font-bold text-lg md:text-xl text-white/80 block mt-2">
                em crédito
              </span>
            </h3>
          </div>
        </div>

        {/* Row 3 — number LEFT, text RIGHT */}
        <div className="grid grid-cols-12 gap-12 items-center">
          <div className="col-span-5">
            <h3 className="font-[family-name:var(--font-montserrat)]">
              <span className="font-black text-6xl md:text-7xl lg:text-8xl leading-[0.9] block" style={{ color: "var(--green-vivid)" }}>
                20<span className="text-[0.45em] text-white">%</span>
              </span>
              <span className="font-bold text-lg md:text-xl text-white/80 block mt-2">
                de contemplação
              </span>
            </h3>
          </div>
          <div className="col-span-7">
            <p className="font-[family-name:var(--font-montserrat)] text-lg md:text-xl lg:text-2xl text-white/60 leading-relaxed font-normal">
              <strong className="text-white font-semibold">Taxa de 20% de contemplação.</strong> Com a carta contemplada, você elimina a espera e tem crédito liberado sem esperar sorteio.
            </p>
          </div>
        </div>

        <p className="text-xs text-white/20 font-sans italic leading-relaxed pt-8 text-center">
          *Fonte: Anuário ABAC 2024. Dados referentes ao exercício de 2024.
        </p>
      </div>

      {/* ════ MOBILE: Swipe Carousel ════ */}
      <div className="relative z-10 md:hidden max-w-[480px] mx-auto px-6">
        <div
          ref={containerRef}
          className="overflow-hidden touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {statsData.map((stat, i) => (
              <div
                key={i}
                className="w-full flex-shrink-0 py-8 flex flex-col justify-center min-h-[40vh]"
              >
                <StatCard stat={stat} />
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-3 mt-4">
          {statsData.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === current ? "scale-125" : "bg-white/25 hover:bg-white/40"
              }`}
              style={i === current ? { backgroundColor: "var(--green-vivid)" } : {}}
              aria-label={`Stat ${i + 1}`}
            />
          ))}
        </div>

        <p className="text-xs text-white/20 font-sans italic text-center mt-6">
          *Fonte: Anuário ABAC 2024. Dados referentes ao exercício de 2024.
        </p>
      </div>
    </section>
  );
}
