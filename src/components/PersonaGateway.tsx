"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── PERSONAS (image-first, minimal text) ─────────────────────────────────────
const personas = [
  {
    id: "imovel",
    headline: "Imóveis",
    subtitle: "Casa ou apartamento sem juros bancários",
    image: "/img/ref-imovel.png",
    href: "/carta-comum/",
    badge: null,
  },
  {
    id: "agro",
    headline: "Máquinas Agrícolas",
    subtitle: "Trator, colheitadeira e implementos",
    image: "/img/ref-agro.png",
    href: "/maquinas-agricolas/",
    badge: null,
  },
  {
    id: "caminhao",
    headline: "Caminhões e Frotas",
    subtitle: "Expanda sua frota com parcelas inteligentes",
    image: "/img/ref-caminhao.png",
    href: "/caminhao/",
    badge: null,
  },
  {
    id: "servicos",
    headline: "Serviços",
    subtitle: "Consultório, clínica ou serviços especializados",
    image: "/img/ref-servicos.jpg",
    href: "/servicos/",
    badge: null,
  },
  {
    id: "motos",
    headline: "Motos",
    subtitle: "Trabalho ou lazer — sem juros de financiamento",
    image: "/img/ref-moto.png",
    href: "/carta-comum/",
    badge: null,
  },
  {
    id: "veiculos",
    headline: "Veículos",
    subtitle: "Compare taxas antes de financiar",
    image: "/img/ref-carro.png",
    href: "/carro-luxo/",
    badge: null,
  },
];

// ─── COMPONENT ─────────────────────────────────────────────────────────────────
export default function PersonaGateway() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection observer — anima cards na entrada
  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll<HTMLElement>(".pg-card");
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    cards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 50}ms`;
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="para-voce"
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-dark)" }}
    >
      <div className="relative mx-auto max-w-[1140px] px-6 md:px-10 lg:px-12 py-24 md:py-32">
        {/* ── Header ── */}
        <div className="mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-5">
            <span
              className="inline-block w-8 h-[2px]"
              style={{ backgroundColor: "var(--green-vivid)" }}
            />
            <span
              className="font-[family-name:var(--font-montserrat)] text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--green-vivid)" }}
            >
              Categorias de crédito
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-12">
            <h2 className="font-[family-name:var(--font-montserrat)] font-black text-4xl md:text-5xl lg:text-6xl leading-[1.02] text-white max-w-xl">
              O que você pode
              <br />
              <span style={{ color: "var(--green-vivid)" }}>
                adquirir
              </span>
            </h2>
            <p className="text-white/45 text-base md:text-lg leading-relaxed max-w-sm font-sans">
              Selecione sua categoria e receba uma análise consultiva
              personalizada.
            </p>
          </div>
        </div>

        {/* ── Grid de cards visuais (3 colunas para 6 cards) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 max-w-[1140px] mx-auto">
          {personas.map((p) => (
            <a
              key={p.id}
              href={p.href}
              className="pg-card group relative rounded-2xl overflow-hidden no-underline block"
              style={{
                opacity: 0,
                transform: "translateY(28px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
                aspectRatio: "3 / 4",
              }}
            >
              {/* Image de fundo */}
              <Image
                src={p.image}
                alt={p.headline}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />

              {/* Gradient overlay — escurece de baixo pra cima */}
              <div
                className="absolute inset-0 z-[1]"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)",
                }}
              />

              {/* Green glow on hover */}
              <div
                className="absolute inset-0 z-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,123,62,0.35) 0%, transparent 60%)",
                }}
              />

              {/* Badge */}
              {p.badge && (
                <span
                  className="absolute top-3 right-3 z-10 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full font-[family-name:var(--font-montserrat)]"
                  style={{
                    backgroundColor: "rgba(21, 184, 92, 0.2)",
                    color: "var(--green-vivid)",
                    border: "1px solid rgba(21, 184, 92, 0.4)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {p.badge}
                </span>
              )}

              {/* Texto sobre a imagem */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-5 md:p-6">
                <h3
                  className="font-[family-name:var(--font-montserrat)] font-black text-lg md:text-xl leading-tight text-white mb-1.5"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                >
                  {p.headline}
                </h3>
                <p
                  className="text-xs md:text-sm text-white/70 font-sans leading-snug"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
                >
                  {p.subtitle}
                </p>

                {/* Arrow CTA */}
                <div
                  className="flex items-center gap-1.5 mt-3 text-xs font-bold font-[family-name:var(--font-montserrat)] uppercase tracking-wider transition-all duration-300 group-hover:gap-3"
                  style={{ color: "var(--green-vivid)" }}
                >
                  Ver opções
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path
                      d="M3 8 L13 8 M9 4 L13 8 L9 12"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
