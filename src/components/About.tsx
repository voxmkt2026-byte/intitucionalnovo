"use client";

import { useEffect, useRef, useState } from "react";
import StatsSection from "./StatsSection";

/* ── Animated Counter Hook ── */
function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!startOnView || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const startTime = performance.now();
            const animate = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // easeOutExpo
              const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              setCount(Math.floor(eased * end));
              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  return { count, ref };
}

/* ── Stats Data (ABAC 2024) ── */
const MAX_BAR_VALUE = 307; // Largest bar value — all bars normalize to this

const stats = [
  {
    value: 2,
    suffix: " mi",
    prefix: "",
    multiplier: 1,
    label: "consorciados ativos",
    description:
      "Mais de 2 milhões de consorciados ativos no mercado. Com a carta contemplada, você acessa o crédito na hora.",
  },
  {
    value: 307,
    suffix: " mi",
    prefix: "R$ ",
    multiplier: 1,
    label: "em créditos comercializados",
    description:
      "R$ 307 milhões em créditos já comercializados. Um mercado sólido, regulamentado e em crescimento constante.",
  },
  {
    value: 20,
    suffix: "%",
    prefix: "",
    multiplier: 1,
    label: "de contemplação",
    description:
      "Taxa de 20% de contemplação. Com a carta contemplada, você elimina a espera e tem crédito liberado na hora.",
  },
] as const;

/* ── Stat Chart — No card, raw chart ── */
function StatChart({ stat, index }: { stat: typeof stats[number]; index: number }) {
  const target = stat.value;
  const { count, ref } = useCountUp(target, 2200 + index * 400);
  const countProgress = target > 0 ? count / target : 0; // 0→1 animation progress

  if (stat.suffix === "%") {
    // ── Donut Ring ──
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - countProgress * circumference;

    return (
      <div ref={ref} className="flex flex-col items-center text-center">
        <div className="relative w-48 h-48 md:w-52 md:h-52 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Track */}
            <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
            {/* Progress */}
            <circle
              cx="80" cy="80" r={radius} fill="none"
              stroke="#c8ff00" strokeWidth="14" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.06s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-[family-name:var(--font-montserrat)] font-black text-5xl md:text-6xl text-white">
              {count}<span className="text-3xl text-[#c8ff00]">%</span>
            </span>
          </div>
        </div>
        <span className="font-[family-name:var(--font-montserrat)] font-bold text-sm uppercase tracking-wider text-white/70 mb-2">
          {stat.label}
        </span>
        <p className="font-sans text-sm text-white/40 leading-relaxed max-w-[260px]">
          {stat.description}
        </p>
      </div>
    );
  }

  // ── Vertical Bar ──
  const barHeight = 200;

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      {/* Value */}
      <div className="mb-6">
        <span className="font-[family-name:var(--font-montserrat)] font-black text-5xl md:text-6xl text-white leading-none">
          {stat.prefix}{count}
        </span>
        <span className="font-[family-name:var(--font-montserrat)] font-black text-2xl md:text-3xl text-[#c8ff00] ml-1">
          {stat.suffix}
        </span>
      </div>

      {/* Vertical Bar */}
      <div
        className="w-20 md:w-24 rounded-xl overflow-hidden mb-6 flex items-end"
        style={{ height: barHeight, backgroundColor: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="w-full rounded-xl"
          style={{
            height: `${countProgress * Math.max(20, (target / MAX_BAR_VALUE) * 100)}%`,
            backgroundColor: '#c8ff00',
            transition: 'height 0.06s linear',
          }}
        />
      </div>

      <span className="font-[family-name:var(--font-montserrat)] font-bold text-sm uppercase tracking-wider text-white/70 mb-2">
        {stat.label}
      </span>
      <p className="font-sans text-sm text-white/40 leading-relaxed max-w-[260px]">
        {stat.description}
      </p>
    </div>
  );
}

/* ── Mobile Stats Carousel ── */
function StatsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const slideWidth = el.offsetWidth;
      const idx = Math.round(scrollLeft / slideWidth);
      setActiveSlide(idx);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const goToSlide = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.offsetWidth, behavior: 'smooth' });
  };

  return (
    <div className="md:hidden">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="flex-none w-full snap-center px-4"
          >
            <StatChart stat={stat} index={i} />
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-8">
        {stats.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeSlide === i
                ? 'w-6 bg-[#c8ff00]'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Ir para gráfico ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function About() {
  return (
    <>
    <section id="sobre" className="relative bg-white-pure py-14 md:py-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 space-y-16">
        
        {/* ── Section 1: Statement copy ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-label text-green-dark/60">Sobre Nós</span>

            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-[family-name:var(--font-montserrat)] font-bold text-green-dark leading-tight">
              Seu crédito
              <br />
              contemplado
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-6 pt-2 lg:pt-8">
            <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-xl md:text-2xl text-green-dark">
              O custo de não ter uma carta contemplada
            </h3>
            <p className="font-sans text-base text-gray-text leading-relaxed">
              Enquanto você espera pelo consórcio tradicional ou paga juros de financiamento, outros já estão usando o crédito. Trabalhamos exclusivamente com cartas já contempladas — crédito liberado, sem sorteio, sem espera.
            </p>
            <p className="font-sans text-base text-gray-text leading-relaxed">
              Cada carta é auditada pela nossa equipe jurídica. CNPJ ativo, regulamentação do Banco Central, e um time que entende que neste mercado, confiança não se promete — se comprova.
            </p>
            
            {/* CNPJ */}
            <div className="pt-4 flex items-center gap-2 text-xs font-semibold text-green-dark/50 font-sans">
              <span>CNPJ 46.640.755/0001-51</span>
            </div>
          </div>
        </div>
      </div>
    </section>


    {/* ── Section 3: Stats — Desktop grid / Mobile swipe carousel ── */}
    <StatsSection />
    </>
  );
}
