"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";

const InfiniteMenu = dynamic(() => import("./InfiniteMenu"), { ssr: false });

const WHATSAPP_BASE =
  "https://wa.me/5511951014269?text=Olá,%20tenho%20interesse%20em%20carta%20contemplada%20de%20";

const segments = [
  {
    title: "Carros",
    description:
      "Carta contemplada pronta para você sair dirigindo. Crédito liberado para o carro que você escolher, sem financiamento.",
    price: "R$ 503,61",
    tag: "carros",
    image: "/seg-carros.png",
    featured: true,
  },
  {
    title: "Imóveis",
    description:
      "Crédito aprovado para seu imóvel, seja para morar ou investir. Carta contemplada com as melhores condições do mercado.",
    price: "R$ 912,34",
    tag: "imóveis",
    image: "/seg-imoveis.png",
    featured: true,
  },
  {
    title: "Motos",
    description:
      "Carta contemplada para a moto que você precisa. Crédito na mão, sem burocracia e sem juros de financiamento.",
    price: "Sob consulta",
    tag: "motos",
    image: "/seg-motos.png",
    featured: false,
  },
  {
    title: "Pesados",
    description:
      "Caminhões, carretas e máquinas. Carta contemplada com crédito liberado para renovar ou ampliar sua frota.",
    price: "R$ 915,22",
    tag: "pesados",
    image: "/seg-pesados.png",
    featured: false,
  },
  {
    title: "Serviços",
    description:
      "Carta contemplada para reformas, viagens, cursos e eventos. Crédito pronto para tirar seus planos do papel.",
    price: "R$ 66,39",
    tag: "serviços",
    image: "/seg-servicos.png",
    featured: false,
  },
  {
    title: "Eletroeletrônicos",
    description:
      "Crédito contemplado para equipar sua casa ou renovar seus eletrônicos. Sem juros, sem espera.",
    price: "R$ 88,44",
    tag: "eletroeletrônicos",
    image: "/seg-eletro.png",
    featured: true,
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
      style={{ backgroundColor: "#00382e" }}
    >
      {/* ── Header (absolute over globe) ── */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 md:px-12 lg:px-16 pt-14 md:pt-20 pointer-events-none">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-[family-name:var(--font-montserrat)] font-bold text-xs uppercase tracking-wider text-white/50">
              Cartas disponíveis
            </span>

          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-[family-name:var(--font-montserrat)] font-black text-white leading-tight">
            Escolha sua
            <br />
            carta contemplada
          </h2>
        </div>
      </div>

      {/* ── Full-bleed Globe ── */}
      <div
        className="relative w-full"
        style={{
          height: "100vh",
          minHeight: "600px",
          maxHeight: "900px",
        }}
      >
        <div
          className={`absolute inset-0 ${popupIndex === null ? 'cursor-grab active:cursor-grabbing' : ''}`}
          style={{ pointerEvents: popupIndex !== null ? "none" : "auto" }}
          onPointerDown={(e) => { if (popupIndex !== null) return; pointerStart.current = { x: e.clientX, y: e.clientY, t: Date.now() }; }}
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
          <InfiniteMenu
            items={menuItems}
            scale={1.0}
            onActiveIndexChange={handleActiveIndex}
          />
        </div>

        {/* Mobile: explicit CTA button */}
        <button
          onClick={() => setPopupIndex(activeIndex)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 md:hidden flex items-center gap-2 px-6 py-3 rounded-full font-[family-name:var(--font-montserrat)] font-bold text-sm uppercase tracking-wider transition-all duration-300 active:scale-95"
          style={{ backgroundColor: "#c8ff00", color: "#00382e" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Ver detalhes
        </button>
      </div>

      {/* ── Pop-up Overlay ── */}
      {activeSeg && popupIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closePopup}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
          />

          {/* Modal */}
          <div
            className="relative z-10 w-full max-w-md bg-[#00382e] border border-white/15 rounded-3xl overflow-hidden shadow-2xl animate-popUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Fechar"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            {/* Image header */}
            <div className="relative h-48 md:h-56 overflow-hidden">
              <img
                src={segments[popupIndex].image}
                alt={activeSeg.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00382e] via-[#00382e]/40 to-transparent" />

              {/* Badge */}
              {activeSeg.featured && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c8ff00]/20 text-[#c8ff00] backdrop-blur-sm border border-[#c8ff00]/30 font-[family-name:var(--font-montserrat)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  Crédito imediato
                </div>
              )}

              {/* Title over image */}
              <h3 className="absolute bottom-4 left-6 font-[family-name:var(--font-montserrat)] font-black text-3xl md:text-4xl text-white">
                {activeSeg.title}
              </h3>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 pt-4 space-y-5">
              <p className="font-sans text-sm text-white/60 leading-relaxed">
                {activeSeg.description}
              </p>

              {/* Price */}
              <div className="flex items-center justify-between py-4 border-t border-b border-white/10">
                <span className="font-sans text-xs text-white/40">
                  Parcelas a partir de:
                </span>
                <span className="font-[family-name:var(--font-montserrat)] font-extrabold text-xl text-[#c8ff00]">
                  {activeSeg.price}
                </span>
              </div>

              {/* CTA */}
              <a
                href={`${WHATSAPP_BASE}${activeSeg.tag}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-full font-[family-name:var(--font-montserrat)] font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                style={{ backgroundColor: "#c8ff00", color: "#00382e" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Quero minha carta
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
