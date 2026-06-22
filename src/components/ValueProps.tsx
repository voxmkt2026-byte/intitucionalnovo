"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import CardSwap, { Card } from "./CardSwap";

const propositions = [
  {
    num: "01",
    tagline: "Diagnóstico de perfil",
    headline: "Avaliação do seu objetivo, prazo, entrada disponível e capacidade de parcela.",
    description:
      "Antes de qualquer recomendação, entendemos seu momento financeiro. Mapeamos metas, prazos e limites para que a orientação seja personalizada — não genérica.",
  },
  {
    num: "02",
    tagline: "Comparativo de alternativas",
    headline: "Consórcio novo, carta contemplada, financiamento ou aguardar melhor momento.",
    description:
      "Nem sempre carta contemplada é a melhor opção. Comparamos custos, prazos e riscos de cada alternativa para que você decida com clareza.",
  },
  {
    num: "03",
    tagline: "Curadoria de cartas disponíveis",
    headline: "Somente quando houver disponibilidade real e com validação.",
    description:
      "Se fizer sentido, apresentamos cartas contempladas disponíveis no mercado — cada uma verificada pela nossa equipe antes de chegar até você.",
  },
  {
    num: "04",
    tagline: "Orientação sobre riscos",
    headline: "Transferência, aprovação, garantias, saldo devedor, taxas e documentação.",
    description:
      "Explicamos cada etapa, risco e custo envolvido. Transferência de titularidade, aprovação da administradora, taxas, documentação e o que pode dar errado.",
  },
] as const;

/* ── Mobile Card Carousel ── */
function MobileCardCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      setActiveSlide(idx);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const goTo = (idx: number) => {
    scrollRef.current?.scrollTo({
      left: idx * (scrollRef.current?.offsetWidth || 0),
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {propositions.map((prop) => (
          <div key={prop.num} className="flex-none w-full snap-center px-6">
            <div
              className="relative p-7 rounded-2xl overflow-hidden min-h-[420px] flex flex-col justify-between"
              style={{
                backgroundColor: "var(--bg-white)",
                border: "1px solid var(--bg-3)",
                boxShadow: "var(--card-shadow-lg)",
              }}
            >
              {/* Gradiente de fundo sutil */}
              <div
                className="absolute inset-0 z-0"
                style={{
                  background: "linear-gradient(160deg, rgba(10,123,62,0.04) 0%, rgba(21,184,92,0.03) 50%, rgba(10,123,62,0.02) 100%)",
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <span
                    style={{
                      fontFamily: "var(--font-jakarta)",
                      fontWeight: 800,
                      fontSize: "0.7rem",
                      color: "var(--green-vivid)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    #{prop.num}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-jakarta)",
                      fontWeight: 600,
                      fontSize: "0.65rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--ink-mute)",
                    }}
                  >
                    {prop.tagline}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-jakarta)",
                    fontWeight: 700,
                    fontSize: "1.35rem",
                    color: "var(--ink)",
                    lineHeight: 1.3,
                    marginBottom: "1.25rem",
                  }}
                >
                  {prop.headline}
                </h3>
              </div>
              <p
                className="relative z-10 mt-auto"
                style={{
                  fontFamily: "var(--font-jakarta)",
                  fontSize: "0.875rem",
                  color: "var(--ink-soft)",
                  lineHeight: 1.7,
                }}
              >
                {prop.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {propositions.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="h-2.5 rounded-full transition-all duration-300"
            style={{
              width: activeSlide === i ? "1.75rem" : "0.625rem",
              backgroundColor: activeSlide === i ? "var(--green)" : "rgba(10,123,62,0.2)",
            }}
            aria-label={`Card ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ValueProps() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section
      id="diferenciais"
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Divisor de topo */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, var(--bg-3), transparent)" }}
      />

      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-center">
          {/* Esquerda: Intro */}
          <div className="lg:col-span-5 space-y-6 lg:pr-8 xl:pr-12">
            <div className="flex items-center gap-3">
              <span className="inline-block w-6 h-px" style={{ backgroundColor: "var(--green)" }} />
              <span className="kicker">Análise consultiva</span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)",
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
              }}
            >
              O que você recebe
              <br />
              <span className="text-gradient">na análise consultiva</span>
            </h2>
            <p
              style={{
                fontFamily: "var(--font-jakarta)",
                fontSize: "clamp(1rem, 1.4vw, 1.1rem)",
                color: "var(--ink-soft)",
                lineHeight: 1.75,
              }}
            >
              Antes de qualquer recomendação, fazemos um diagnóstico completo do seu perfil, objetivo e possibilidades. Você recebe orientação — não pressão de venda.
            </p>
            <div className="pt-2">
              <a
                href="#simulador"
                className="btn-primary"
                style={{ display: "inline-flex" }}
              >
                Solicitar análise gratuita
              </a>
            </div>
          </div>

          {/* Direita: Card Swap Stack (Desktop) */}
          <div className="hidden sm:flex lg:col-span-7 justify-center lg:justify-end w-full">
            <div
              className="relative w-full max-w-[820px] xl:max-w-[900px] overflow-visible mx-auto lg:mr-0"
              style={{ height: "clamp(480px, 60vw, 680px)" }}
            >
              <CardSwap
                width="100%"
                height="100%"
                cardDistance={40}
                verticalDistance={20}
                delay={5000}
                pauseOnHover
              >
                {propositions.map((prop) => (
                  <Card
                    key={prop.num}
                    className={cn(
                      "relative p-10 md:p-14 rounded-2xl",
                      "flex flex-col justify-between select-none overflow-hidden"
                    )}
                    style={{
                      backgroundColor: "var(--bg-white)",
                      border: "1px solid var(--bg-3)",
                      boxShadow: "var(--card-shadow-lg)",
                    }}
                  >
                    {/* Gradiente sutil — sem imagens pesadas */}
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        background:
                          "linear-gradient(160deg, rgba(10,123,62,0.04) 0%, rgba(21,184,92,0.02) 50%, transparent 100%)",
                      }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 h-32 z-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(232,245,238,0.5), transparent)",
                      }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-10">
                        <span
                          style={{
                            fontFamily: "var(--font-jakarta)",
                            fontWeight: 800,
                            fontSize: "0.7rem",
                            color: "var(--green-vivid)",
                            letterSpacing: "0.1em",
                          }}
                        >
                          #{prop.num}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-jakarta)",
                            fontWeight: 600,
                            fontSize: "0.65rem",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "var(--ink-mute)",
                          }}
                        >
                          {prop.tagline}
                        </span>
                      </div>
                      <h3
                        style={{
                          fontFamily: "var(--font-jakarta)",
                          fontWeight: 800,
                          fontSize: "clamp(1.6rem, 2.8vw, 2.6rem)",
                          color: "var(--ink)",
                          lineHeight: 1.2,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {prop.headline}
                      </h3>
                    </div>
                    <p
                      className="relative z-10 mt-auto"
                      style={{
                        fontFamily: "var(--font-jakarta)",
                        fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)",
                        color: "var(--ink-soft)",
                        lineHeight: 1.75,
                      }}
                    >
                      {prop.description}
                    </p>
                  </Card>
                ))}
              </CardSwap>
            </div>
          </div>

          {/* Mobile Carousel */}
          <div className="sm:hidden lg:col-span-7 w-full">
            <MobileCardCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
