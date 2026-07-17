"use client";

import { useEffect, useRef, useState } from "react";

/* ── Data ─────────────────────────────────────────────── */

interface Testimonial {
  initial: string;
  image?: string;
  name: string;
  role: string;
  quote: string;
  badge: string;
}

const testimonials: Testimonial[] = [
  {
    initial: "W",
    image: "/img/wellington.jpg",
    name: "Wellington S.",
    role: "Motorista de app · São Paulo",
    quote:
      "Pagava R$ 2.700 de aluguel. Hoje a parcela do meu carro é R$ 990. Foram 12 dias do primeiro contato até pegar a chave.",
    badge: "Economia de R$ 1.710/mês*",
  },
  {
    initial: "R",
    image: "/img/rodrigo.jpg",
    name: "Dr. Rodrigo A.",
    role: "Cirurgião-Dentista · Campinas",
    quote:
      "O banco queria 24% ao ano para financiar meu tomógrafo de R$ 220 mil. Pela Titanium, equipei a clínica em 8 meses e economizei R$ 90 mil.",
    badge: "R$ 90 mil economizados*",
  },
  {
    initial: "P",
    image: "/img/patricia.jpg",
    name: "Patrícia S.",
    role: "Investidora · Belo Horizonte",
    quote:
      "Precisava de R$ 280 mil para um imóvel e não queria esperar sorteio. A carta contemplada foi aprovada em 3 dias. Negócio fechado em uma semana.",
    badge: "Crédito liberado em 3 dias*",
  },
];

/* ── Component ────────────────────────────────────────── */

export default function Testimonials() {
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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="clientes"
      style={{
        backgroundColor: "var(--bg-2)",
        padding: "clamp(3rem, 8vw, 6rem) 0",
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
        <div style={{ marginBottom: "3rem" }}>
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
                backgroundColor: "var(--green)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--green)",
              }}
            >
              Clientes Titanium
            </span>
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
            Quem já conquistou
          </h2>
        </div>

        {/* ── Cards Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "1.5rem",
          }}
        >
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={t.name}
              testimonial={t}
              delay={i * 120}
              visible={visible}
            />
          ))}
        </div>

        {/* ── Disclaimer ── */}
        <p
          style={{
            fontFamily: "var(--font-jakarta), system-ui, sans-serif",
            fontSize: "0.7rem",
            color: "var(--ink-mute)",
            marginTop: "2.5rem",
            lineHeight: 1.6,
            maxWidth: "680px",
          }}
        >
          *Depoimentos baseados em operações reais. Nomes abreviados para
          privacidade. Resultados individuais podem variar conforme perfil,
          valor e condições de mercado.
        </p>

        {/* ── CTA após depoimentos ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "3rem",
          }}
        >
          <a
            href="https://wa.me/5511930048940?text=Olá, gostaria de solicitar uma análise consultiva gratuita"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 2rem",
              borderRadius: "var(--r-pill)",
              backgroundColor: "var(--green)",
              color: "white",
              fontFamily: "var(--font-jakarta), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 16px rgba(10,123,62,0.3)",
            }}
          >
            Solicitar minha análise gratuita →
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Card Sub-component ───────────────────────────────── */

function TestimonialCard({
  testimonial,
  delay,
  visible,
}: {
  testimonial: Testimonial;
  delay: number;
  visible: boolean;
}) {
  const { initial, image, name, role, quote, badge } = testimonial;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "var(--bg-white)",
        borderRadius: "var(--r-lg)",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        boxShadow: hovered ? "var(--card-hover)" : "var(--card-shadow)",
        transform: visible
          ? hovered
            ? "translateY(-4px)"
            : "translateY(0)"
          : "translateY(24px)",
        opacity: visible ? 1 : 0,
        transition: `all 0.5s var(--ease) ${delay}ms`,
        cursor: "default",
        border: "1px solid var(--bg-3)",
      }}
    >
      {/* Avatar + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
        {image ? (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              border: "2px solid var(--green)",
            }}
          >
            <img
              src={image}
              alt={name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--green), var(--green-vivid))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "1.2rem",
                color: "white",
                lineHeight: 1,
              }}
            >
              {initial}
            </span>
          </div>
        )}
        <div>
          <div
            style={{
              fontFamily: "var(--font-jakarta), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "var(--ink)",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-jakarta), system-ui, sans-serif",
              fontSize: "0.8rem",
              color: "var(--ink-mute)",
              marginTop: "2px",
            }}
          >
            {role}
          </div>
        </div>
      </div>

      {/* Quote */}
      <p
        style={{
          fontFamily: "var(--font-jakarta), system-ui, sans-serif",
          fontSize: "0.95rem",
          color: "var(--ink-soft)",
          lineHeight: 1.7,
          flex: 1,
        }}
      >
        &ldquo;{quote}&rdquo;
      </p>

      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          alignItems: "center",
          gap: "0.5rem",
          backgroundColor: "var(--green-tint)",
          border: "1px solid var(--green-tint-2)",
          borderRadius: "var(--r-pill)",
          padding: "0.375rem 0.875rem",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--green)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-jakarta), system-ui, sans-serif",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--green)",
          }}
        >
          {badge}
        </span>
      </div>
    </div>
  );
}
