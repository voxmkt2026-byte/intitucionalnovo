"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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

export default function ValueProps() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % propositions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

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

      <div className="mx-auto max-w-[1140px] px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Esquerda: Intro */}
          <div className="lg:col-span-5 space-y-6 lg:pr-8">
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
                className="btn-primary inline-flex"
              >
                Solicitar análise gratuita
              </a>
            </div>
          </div>

          {/* Direita: Carousel (Desktop & Mobile) */}
          <div className="lg:col-span-7 w-full flex flex-col items-center">
            <div
              className="relative w-full overflow-hidden rounded-2xl min-h-[360px] sm:min-h-[400px] flex shadow-md"
              style={{
                backgroundColor: "var(--bg-white)",
                border: "1px solid var(--bg-3)",
              }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {propositions.map((prop, idx) => (
                <div
                  key={prop.num}
                  className={cn(
                    "absolute inset-0 w-full h-full p-8 sm:p-12 transition-all duration-700 ease-in-out flex flex-col justify-between select-none",
                    idx === active
                      ? "opacity-100 translate-x-0 scale-100 pointer-events-auto z-10"
                      : idx < active
                      ? "opacity-0 -translate-x-full scale-95 pointer-events-none z-0"
                      : "opacity-0 translate-x-full scale-95 pointer-events-none z-0"
                  )}
                >
                  {/* Gradiente de fundo sutil */}
                  <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(160deg, rgba(10,123,62,0.03) 0%, rgba(21,184,92,0.01) 50%, transparent 100%)",
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-32 z-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(232,245,238,0.25), transparent)",
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <span
                        style={{
                          fontFamily: "var(--font-jakarta)",
                          fontWeight: 800,
                          fontSize: "0.75rem",
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
                          fontSize: "0.68rem",
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
                        fontSize: "clamp(1.4rem, 2.3vw, 2.1rem)",
                        color: "var(--ink)",
                        lineHeight: 1.25,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {prop.headline}
                    </h3>
                  </div>
                  <p
                    className="relative z-10 mt-6 sm:mt-auto"
                    style={{
                      fontFamily: "var(--font-jakarta)",
                      fontSize: "clamp(0.92rem, 1.2vw, 1.05rem)",
                      color: "var(--ink-soft)",
                      lineHeight: 1.7,
                    }}
                  >
                    {prop.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2.5 mt-6 z-20">
              {propositions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActive(idx)}
                  className="h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: idx === active ? "2rem" : "0.625rem",
                    backgroundColor:
                      idx === active ? "var(--green)" : "rgba(10,123,62,0.25)",
                  }}
                  aria-label={`Ir para slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
