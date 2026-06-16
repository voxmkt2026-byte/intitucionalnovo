"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ── Stats data ── */
const statsData = [
  {
    number: "2",
    suffix: "mi",
    subtitle: "de consorciados ativos",
    description: (
      <>
        <strong className="text-white">2 milhões de consorciados ativos</strong> estão
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
        <strong className="text-white">+ de R$ 307 bi em créditos</strong>
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
        <strong className="text-white">Taxa de 20% de contemplação.</strong> Com a carta
        contemplada, você elimina a espera e tem crédito liberado na hora.
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
    <div className="flex flex-col gap-6">
      <h3
        className={`font-[family-name:var(--font-montserrat)] ${
          isRight ? "md:text-right" : ""
        }`}
      >
        <span className="font-black text-[clamp(5rem,18vw,12rem)] leading-[0.85] text-[#c8ff00] block">
          {stat.prefix && (
            <span className="text-[0.35em] text-white/50 align-top mr-1">
              {stat.prefix}
            </span>
          )}
          {stat.number}
          <span className="text-[0.45em] text-white">{stat.suffix}</span>
        </span>
        <span className="font-bold text-2xl md:text-3xl text-white/80 block -mt-1">
          {stat.subtitle}
        </span>
      </h3>
      <p
        className={`font-[family-name:var(--font-montserrat)] text-xl md:text-3xl lg:text-4xl text-white/70 leading-snug font-medium ${
          isRight ? "md:text-right" : ""
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
      className="relative py-20 md:py-44 overflow-hidden"
      style={{ backgroundColor: "#00382e" }}
    >
      {/* Background — Desktop */}
      <div
        className="absolute inset-0 z-0 hidden md:block"
        style={{
          backgroundImage: "url('/stats-bg-desktop.png')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          opacity: 0.35,
        }}
      />
      {/* Background — Mobile */}
      <div
        className="absolute inset-0 z-0 block md:hidden"
        style={{
          backgroundImage: "url('/stats-bg-mobile.png')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          opacity: 0.35,
        }}
      />

      {/* ════ DESKTOP: Grid rows — number + text side by side ════ */}
      <div className="relative z-10 hidden md:block max-w-[1400px] mx-auto px-12 lg:px-16 space-y-64">
        {/* Row 1 — number LEFT, text RIGHT */}
        <div className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-6">
            <h3 className="font-[family-name:var(--font-montserrat)]">
              <span className="font-black text-[clamp(5rem,12vw,12rem)] leading-[0.85] text-[#c8ff00] block">
                2<span className="text-[0.45em] text-white">mi</span>
              </span>
              <span className="font-bold text-2xl md:text-3xl text-white/80 block -mt-1">
                de consorciados ativos
              </span>
            </h3>
          </div>
          <div className="col-span-6 pb-4">
            <p className="font-[family-name:var(--font-montserrat)] text-2xl lg:text-4xl text-white/70 leading-snug font-medium">
              <strong className="text-white">2 milhões de consorciados ativos</strong> estão agora em um grupo de consórcio para realizar seus sonhos
            </p>
          </div>
        </div>

        {/* Row 2 — text LEFT, number RIGHT */}
        <div className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-6 pb-4">
            <p className="font-[family-name:var(--font-montserrat)] text-2xl lg:text-4xl text-white/70 leading-snug font-medium text-right">
              <strong className="text-white">+ de R$ 307 bi em créditos</strong><br />
              já foram comercializados pelo sistema de consórcio nos últimos 12 meses
            </p>
          </div>
          <div className="col-span-6">
            <h3 className="font-[family-name:var(--font-montserrat)] text-right">
              <span className="font-black text-[clamp(4rem,11vw,11rem)] leading-[0.85] text-[#c8ff00] block">
                <span className="text-[0.35em] text-white/50 align-top mr-1">R$</span>307<span className="text-[0.45em] text-white">bi+</span>
              </span>
              <span className="font-bold text-2xl md:text-3xl text-white/80 block -mt-1">
                em crédito
              </span>
            </h3>
          </div>
        </div>

        {/* Row 3 — number LEFT, text RIGHT */}
        <div className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-6">
            <h3 className="font-[family-name:var(--font-montserrat)]">
              <span className="font-black text-[clamp(5rem,12vw,12rem)] leading-[0.85] text-[#c8ff00] block">
                20<span className="text-[0.45em] text-white">%</span>
              </span>
              <span className="font-bold text-2xl md:text-3xl text-white/80 block -mt-1">
                de contemplação
              </span>
            </h3>
          </div>
          <div className="col-span-6 pb-4">
            <p className="font-[family-name:var(--font-montserrat)] text-2xl lg:text-4xl text-white/70 leading-snug font-medium">
              <strong className="text-white">Taxa de 20% de contemplação.</strong> Com a carta contemplada, você elimina a espera e tem crédito liberado na hora.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-white/20 font-sans italic leading-relaxed pt-8">
          *Fonte: Anuário ABAC 2024. Dados referentes ao exercício de 2024.
        </p>
      </div>

      {/* ════ MOBILE: Swipe Carousel ════ */}
      <div className="relative z-10 md:hidden">
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
                className="w-full flex-shrink-0 px-6 py-8 flex flex-col justify-center min-h-[60vh]"
              >
                <StatCard stat={stat} />
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-3 mt-6">
          {statsData.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-[#c8ff00] scale-125"
                  : "bg-white/25 hover:bg-white/40"
              }`}
              aria-label={`Stat ${i + 1}`}
            />
          ))}
        </div>

        <p className="text-[10px] text-white/20 font-sans italic px-6 mt-6">
          *Fonte: Anuário ABAC 2024. Dados referentes ao exercício de 2024.
        </p>
      </div>
    </section>
  );
}
