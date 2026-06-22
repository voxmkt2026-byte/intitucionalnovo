"use client";

import { useEffect, useRef, useState } from "react";

/* ── Timeline Stage Data ──────────────────────────────── */

interface Stage {
  step: string;
  title: string;
  body: string;
  accent: string;
}

const stages: Stage[] = [
  {
    step: "01",
    title: "O Problema",
    body: "Wellington rodava 10-12h por dia como motorista de app. Ganhava entre R$ 5.000 e R$ 7.000/mês bruto, mas R$ 2.700 iam direto para a locadora. Em 2 anos pagando aluguel, já havia transferido mais de R$ 60 mil — dinheiro que não construiu patrimônio nenhum.",
    accent: "var(--bad)",
  },
  {
    step: "02",
    title: "A Barreira",
    body: "Tentou financiamento bancário: banco pediu holerite (que ele não tem como autônomo), exigiu entrada de R$ 15 mil e ofereceu juros de 1,8% ao mês.",
    accent: "var(--ink-mute)",
  },
  {
    step: "03",
    title: "A Solução",
    body: "Wellington procurou a Titanium e descobriu a carta contemplada. Simulação online em 5 minutos, análise de perfil sem holerite (comprovação por extratos), aprovação em 8 dias úteis.",
    accent: "var(--green-vivid)",
  },
  {
    step: "04",
    title: "O Resultado",
    body: "Veículo adquirido: Chevrolet Onix 2023 — crédito de R$ 75.000. Parcela de R$ 990/mês vs R$ 2.700 de aluguel. O carro é DELE — constrói patrimônio.",
    accent: "var(--green-vivid)",
  },
];

/* ── Stats Strip Data ─────────────────────────────────── */

interface Stat {
  value: string;
  label: string;
}

const resultStats: Stat[] = [
  { value: "R$ 990/mês", label: "Parcela mensal" },
  { value: "R$ 41 mil", label: "Economizados em 2 anos" },
  { value: "12 dias", label: "Do contato à chave" },
  { value: "15%", label: "Taxa administrativa total" },
];

/* ── Main Component ───────────────────────────────────── */

export default function CaseStudy() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="case"
      style={{
        backgroundColor: "var(--bg-dark)",
        padding: "clamp(3.5rem, 10vw, 7rem) 0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "var(--wrap)",
          margin: "0 auto",
          padding: "0 var(--pad)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            marginBottom: "3rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s var(--ease)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "var(--green-vivid)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--green-vivid)",
              }}
            >
              Case de Sucesso
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-jakarta), system-ui, sans-serif",
              fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "var(--ink-white)",
              maxWidth: "720px",
            }}
          >
            Como o Wellington saiu de R$&nbsp;2.700/mês de aluguel para carro
            próprio com parcela de R$&nbsp;990
          </h2>
        </div>

        {/* ── Content Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2rem",
          }}
          className="lg:!grid-cols-[320px_1fr]"
        >
          {/* ── Profile Card (Left) ── */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "var(--r-lg)",
              padding: "2rem",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-30px)",
              transition: "all 0.7s var(--ease) 200ms",
              alignSelf: "start",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--green), var(--green-vivid))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.75rem",
                  color: "white",
                  lineHeight: 1,
                }}
              >
                W
              </span>
            </div>

            <h3
              style={{
                fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "1.15rem",
                color: "var(--ink-white)",
                marginBottom: "0.25rem",
              }}
            >
              Wellington S.
            </h3>
            <p
              style={{
                fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "1.5rem",
              }}
            >
              Motorista de aplicativo (Uber/99)
              <br />
              São Paulo, SP
            </p>

            {/* Profile Facts */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: "1.25rem",
              }}
            >
              {[
                { label: "Situação anterior", value: "Aluguel R$ 2.700/mês" },
                { label: "Renda bruta", value: "R$ 5.000 – R$ 7.000/mês" },
                { label: "Crédito aprovado", value: "R$ 75.000" },
                { label: "Veículo", value: "Chevrolet Onix 2023" },
              ].map((fact) => (
                <div key={fact.label}>
                  <div
                    style={{
                      fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "rgba(255,255,255,0.35)",
                      marginBottom: "2px",
                    }}
                  >
                    {fact.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "var(--ink-white)",
                    }}
                  >
                    {fact.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Timeline (Right) ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {stages.map((stage, i) => (
              <TimelineStage
                key={stage.step}
                stage={stage}
                index={i}
                visible={visible}
              />
            ))}
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
            gap: "1px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "var(--r-lg)",
            overflow: "hidden",
            marginTop: "3rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s var(--ease) 800ms",
          }}
        >
          {resultStats.map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                padding: "1.5rem 1.25rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                  color: "var(--green-vivid)",
                  marginBottom: "0.25rem",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Disclaimer ── */}
        <p
          style={{
            fontFamily: "var(--font-jakarta), system-ui, sans-serif",
            fontSize: "0.65rem",
            color: "rgba(255,255,255,0.25)",
            marginTop: "2rem",
            lineHeight: 1.6,
            maxWidth: "680px",
          }}
        >
          *Case baseado em operação real. Nome abreviado para privacidade do
          cliente. Valores e prazos podem variar conforme perfil, administradora
          e condições de mercado.
        </p>
      </div>
    </section>
  );
}

/* ── Timeline Stage Sub-component ─────────────────────── */

function TimelineStage({
  stage,
  index,
  visible,
}: {
  stage: Stage;
  index: number;
  visible: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "1.25rem",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "var(--r)",
        padding: "1.5rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `all 0.5s var(--ease) ${300 + index * 150}ms`,
      }}
    >
      {/* Step Number */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--r)",
          backgroundColor: stage.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          opacity: 0.9,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jakarta), system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "0.8rem",
            color: "white",
          }}
        >
          {stage.step}
        </span>
      </div>

      {/* Content */}
      <div>
        <h4
          style={{
            fontFamily: "var(--font-jakarta), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--ink-white)",
            marginBottom: "0.375rem",
          }}
        >
          {stage.title}
        </h4>
        <p
          style={{
            fontFamily: "var(--font-jakarta), system-ui, sans-serif",
            fontSize: "0.875rem",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.7,
          }}
        >
          {stage.body}
        </p>
      </div>
    </div>
  );
}
