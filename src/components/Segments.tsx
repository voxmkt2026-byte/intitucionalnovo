"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import WebGLErrorBoundary from "./WebGLErrorBoundary";

const InfiniteMenu = dynamic(() => import("./InfiniteMenu"), { ssr: false });

const WHATSAPP_BASE =
  "https://wa.me/5511930048940?text=Olá,%20tenho%20interesse%20em%20carta%20contemplada%20de%20";

const segments = [
  {
    title: "Casa Moderna",
    description:
      "Apartamento ou casa própria com crédito aprovado. Sem financiamento bancário, sem espera. Parcelas até 60% menores que o banco*.",
    price: "R$ 912",
    tag: "imóvel residencial",
    image: "/img/seg-casa-moderna.webp",
    featured: true,
    ticket: "R$100k–R$1M",
  },
  {
    title: "Mansões & Alto Padrão",
    description:
      "Imóveis de alto padrão, coberturas e condomínios exclusivos. Patrimônio sólido sem juros compostos.",
    price: "R$ 2.400",
    tag: "imóvel alto padrão",
    image: "/img/seg-imoveis.webp",
    featured: true,
    ticket: "R$500k–R$2M",
  },
  {
    title: "Veículo Premium",
    description:
      "BMW, Mercedes, Porsche. O carro que comunica resultado — parcela menor que financiamento.",
    price: "R$ 1.503",
    tag: "carro de luxo",
    image: "/img/seg-carros.webp",
    featured: true,
    ticket: "R$100k–R$500k",
  },
  {
    title: "Carro Popular",
    description:
      "Seu primeiro carro ou troca inteligente. Alternativas que podem não exigir entrada tradicional*.",
    price: "R$ 503",
    tag: "carro popular",
    image: "/img/seg-carro-popular.webp",
    featured: true,
    ticket: "R$30k–R$100k",
  },
  {
    title: "Motorista de App",
    description:
      "Carro para Uber, 99 e iFood. Comece a trabalhar com carro próprio — sem pagar aluguel.",
    price: "R$ 389",
    tag: "carro para Uber",
    image: "/img/seg-motorista-app.webp",
    featured: true,
    ticket: "R$25k–R$80k",
  },
  {
    title: "Caminhão & Frota",
    description:
      "Renove ou expanda a frota sem comprometer o caixa. Crédito para quem move o Brasil.",
    price: "R$ 915",
    tag: "caminhão",
    image: "/img/seg-caminhao.webp",
    featured: true,
    ticket: "R$80k–R$500k",
  },
  {
    title: "Moto",
    description:
      "Moto nova para trabalho ou lazer. Carta contemplada com crédito liberado, sem sorteio.",
    price: "R$ 189",
    tag: "moto",
    image: "/img/seg-moto.webp",
    featured: true,
    ticket: "R$10k–R$50k",
  },
  {
    title: "Tratores & Agro",
    description:
      "Colheitadeira, trator, implemento. Renove o maquinário da safra sem depender de banco.",
    price: "R$ 1.200",
    tag: "máquinas agrícolas",
    image: "/img/seg-trator.webp",
    featured: true,
    ticket: "R$150k–R$1.5M",
  },
  {
    title: "Terreno Agrícola",
    description:
      "Fazenda, sítio ou chácara. Amplie sua propriedade rural com crédito inteligente.",
    price: "R$ 800",
    tag: "terreno agrícola",
    image: "/img/seg-fazenda.webp",
    featured: true,
    ticket: "R$50k–R$1M",
  },
  {
    title: "Terreno Urbano",
    description:
      "Lote em condomínio fechado ou bairro planejado. Investimento com potencial de valorização*.",
    price: "R$ 450",
    tag: "terreno urbano",
    image: "/img/seg-terreno-urbano.webp",
    featured: true,
    ticket: "R$50k–R$500k",
  },
  {
    title: "Construção",
    description:
      "Crédito para construir do zero ou reformar. Realize o projeto sem financiamento bancário.",
    price: "R$ 660",
    tag: "construção",
    image: "/img/seg-construcao.webp",
    featured: true,
    ticket: "R$50k–R$500k",
  },
  {
    title: "Aeronaves",
    description:
      "Jatos executivos, turboélices e helicópteros. Carta contemplada viabiliza o que banco recusa.",
    price: "Sob consulta",
    tag: "aeronaves",
    image: "/img/seg-aeronaves.webp",
    featured: true,
    ticket: "R$500k–R$5M",
  },
  {
    title: "Embarcações",
    description:
      "Lanchas, iates e embarcações. Crédito para quem navega com inteligência financeira.",
    price: "Sob consulta",
    tag: "embarcações",
    image: "/img/seg-embarcacao.webp",
    featured: true,
    ticket: "R$200k–R$3M",
  },
  {
    title: "Placas Solares",
    description:
      "Energia solar para residência ou empresa. Invista em energia solar e economize na conta de luz*.",
    price: "R$ 320",
    tag: "placas solares",
    image: "/img/seg-placas-solares.webp",
    featured: true,
    ticket: "R$15k–R$200k",
  },
] as const;

const menuItems = segments.map((seg) => ({
  image: seg.image,
  link: `${WHATSAPP_BASE}${seg.tag}`,
  title: seg.title,
  description: "",
}));

export default function Segments() {
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStart = useRef<{ x: number; y: number; t: number } | null>(null);

  const handleActiveIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const closePopup = useCallback(() => {
    setPopupIndex(null);
  }, []);

  const activeSeg = popupIndex !== null ? segments[popupIndex] : null;

  return (
    <section
      id="segmentos"
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-dark)" }}
    >
      {/* ── Header ── */}
      <div className="absolute top-0 left-0 right-0 z-10 px-8 md:px-16 lg:px-24 pt-14 md:pt-20 pointer-events-none">
        <div className="mx-auto max-w-[960px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block w-6 h-px" style={{ backgroundColor: "var(--green-vivid)" }} />
            <span
              style={{
                fontFamily: "var(--font-jakarta)",
                fontWeight: 600,
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--green-vivid)",
              }}
            >
              14 categorias de crédito
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-jakarta), system-ui, sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "white",
            }}
          >
            O que você pode adquirir
            <br />
            <span style={{ color: "var(--green-vivid)" }}>sem banco</span>
          </h2>
        </div>
      </div>

      {/* ── Globe ── */}
      <div
        className="relative w-full"
        style={{ height: "100vh", minHeight: "600px", maxHeight: "900px" }}
      >
        <div
          className={`absolute inset-0 ${popupIndex === null ? "cursor-grab active:cursor-grabbing" : ""}`}
          style={{ pointerEvents: popupIndex !== null ? "none" : "auto" }}
          onPointerDown={(e) => {
            if (popupIndex !== null) return;
            pointerStart.current = { x: e.clientX, y: e.clientY, t: Date.now() };
          }}
          onPointerUp={(e) => {
            if (popupIndex !== null || !pointerStart.current) return;
            const dx = e.clientX - pointerStart.current.x;
            const dy = e.clientY - pointerStart.current.y;
            const dt = Date.now() - pointerStart.current.t;
            const dist = Math.sqrt(dx * dx + dy * dy);
            pointerStart.current = null;
            if (dist < 15 && dt < 400) setPopupIndex(activeIndex);
          }}
        >
          <WebGLErrorBoundary>
          <InfiniteMenu
            items={menuItems}
            scale={1.0}
            onActiveIndexChange={handleActiveIndex}
          />
          </WebGLErrorBoundary>
        </div>

        {/* Mobile CTA */}
        <button
          onClick={() => setPopupIndex(activeIndex)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 md:hidden flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 active:scale-95"
          style={{
            fontFamily: "var(--font-jakarta)",
            backgroundColor: "var(--green)",
            color: "white",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Ver detalhes
        </button>
      </div>

      {/* ── Modal ── */}
      {activeSeg && popupIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closePopup}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" />
          <div
            className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-popUp"
            style={{
              backgroundColor: "var(--bg-dark)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              aria-label="Fechar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="relative h-48 md:h-52 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={segments[popupIndex].image}
                alt={activeSeg.title}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, var(--bg-dark) 0%, rgba(26,31,28,0.4) 60%, transparent 100%)" }}
              />
              {/* Badge ticket */}
              <div
                className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-jakarta)",
                  backgroundColor: "rgba(10,123,62,0.25)",
                  color: "var(--green-vivid)",
                  border: "1px solid rgba(21,184,92,0.3)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {activeSeg.ticket}
              </div>
              <h3
                className="absolute bottom-4 left-6"
                style={{
                  fontFamily: "var(--font-jakarta)",
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  color: "white",
                }}
              >
                {activeSeg.title}
              </h3>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 pt-4 space-y-5" style={{ maxWidth: "400px", margin: "0 auto" }}>
              <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                {activeSeg.description}
              </p>

              {/* Price */}
              <div
                className="flex items-center justify-between py-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>
                  Parcelas a partir de*:
                </span>
                <span style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: "1.25rem", color: "var(--green-vivid)" }}>
                  {activeSeg.price}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", lineHeight: 1.5, marginTop: "0.5rem" }}>
                *Valores ilustrativos. Parcelas reais dependem de crédito, prazo e administradora.
              </p>

              {/* CTA */}
              <a
                href={`${WHATSAPP_BASE}${activeSeg.tag}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  fontFamily: "var(--font-jakarta)",
                  backgroundColor: "var(--whatsapp)",
                  color: "white",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Quero minha carta agora
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
