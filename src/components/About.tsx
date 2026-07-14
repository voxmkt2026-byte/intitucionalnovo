"use client";

import { useEffect, useRef, useState } from "react";
import StatsSection from "./StatsSection";

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

const MAX_BAR_VALUE = 50;

const stats = [
  {
    value: 3000,
    suffix: "+",
    prefix: "",
    label: "clientes atendidos",
    description:
      "Mais de 3.000 clientes já conquistaram imóveis, veículos e equipamentos com a Titanium. Produtores rurais, empresários e profissionais liberais.",
  },
  {
    value: 50,
    suffix: "M+",
    prefix: "R$ ",
    label: "em créditos negociados",
    description:
      "R$ 50 milhões em créditos negociados nos últimos 4 anos. Cada carta passa por auditoria jurídica antes de chegar até você.",
  },
  {
    value: 4,
    suffix: " anos",
    prefix: "",
    label: "de mercado",
    description:
      "4 anos de mercado, em total conformidade com as diretrizes do Banco Central. Zero litígios. NPS de 87 pontos (pesquisa interna, 2025).",
  },
] as const;

function StatChart({ stat, index }: { stat: typeof stats[number]; index: number }) {
  const target = stat.value;
  const { count, ref } = useCountUp(target, 2200 + index * 400);
  const countProgress = target > 0 ? count / target : 0;

  const barHeight = 200;
  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className="mb-6">
        <span style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: "3.5rem", color: "white", lineHeight: 1 }}>
          {stat.prefix}{count}
        </span>
        <span style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: "1.5rem", color: "var(--green-vivid)", marginLeft: "0.25rem" }}>
          {stat.suffix}
        </span>
      </div>
      <div
        className="w-20 md:w-24 rounded-xl overflow-hidden mb-6 flex items-end"
        style={{ height: barHeight, backgroundColor: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="w-full rounded-xl"
          style={{
            height: `${countProgress * Math.max(20, (target / MAX_BAR_VALUE) * 100)}%`,
            backgroundColor: "var(--green-vivid)",
            transition: "height 0.06s linear",
          }}
        />
      </div>
      <span style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem", display: "block" }}>
        {stat.label}
      </span>
      <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.875rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.6, maxWidth: "260px" }}>
        {stat.description}
      </p>
    </div>
  );
}

function StatsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      setActiveSlide(Math.round(el.scrollLeft / el.offsetWidth));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const goToSlide = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.offsetWidth, behavior: "smooth" });
  };

  return (
    <div className="md:hidden">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex-none w-full snap-center px-4">
            <StatChart stat={stat} index={i} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-8">
        {stats.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: activeSlide === i ? "1.5rem" : "0.5rem",
              backgroundColor: activeSlide === i ? "var(--green-vivid)" : "rgba(255,255,255,0.2)",
            }}
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
      {/* ── Seção Sobre — nova narrativa ── */}
      <section id="sobre" className="relative py-16 md:py-24" style={{ backgroundColor: "var(--bg)" }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start">

            {/* Esquerda */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-block w-6 h-px" style={{ backgroundColor: "var(--green)" }} />
                <span className="kicker">Sobre a Titanium</span>
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                  fontSize: "clamp(1.8rem, 3.8vw, 2.8rem)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                }}
              >
                Consultoria para quem está{" "}
                <span className="text-gradient">planejando uma aquisição</span>
              </h2>
            </div>

            {/* Direita */}
            <div className="lg:col-span-7 space-y-6 pt-0 lg:pt-10">
              <h3 className="font-sans font-bold text-[clamp(1.1rem,1.8vw,1.35rem)] text-ink leading-normal">
                Por que análise consultiva antes de comprar
              </h3>

              <p className="font-sans text-base text-ink-soft leading-relaxed">
                Antes de financiar ou comprar uma carta no impulso, vale entender as alternativas. Consórcio, carta contemplada e financiamento têm custos, prazos e riscos diferentes — e <strong className="text-ink font-semibold">a melhor opção depende do seu perfil e objetivo</strong>. Nossa consultoria avalia seu momento financeiro e apresenta um comparativo real. <span className="text-xs opacity-40 font-sans block mt-2">*Taxas médias de financiamento variam de 12% a 24% a.a. (fonte: Banco Central). Valores reais dependem de perfil e instituição.</span>
              </p>

              <p className="font-sans text-base text-ink-soft leading-relaxed">
                Quando a carta contemplada faz sentido, apresentamos opções disponíveis — sempre com verificação documental e jurídica pela nossa equipe. Quando não faz, dizemos isso também. Nosso papel é consultoria, não pressão de venda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsSection />
    </>
  );
}
