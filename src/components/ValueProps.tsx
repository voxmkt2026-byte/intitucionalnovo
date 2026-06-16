"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import CardSwap, { Card } from "./CardSwap";

const propositions = [
  {
    num: "#01",
    tagline: "Crédito imediato",
    headline: "Cada dia sem carta é um dia a mais pagando juros.",
    description:
      "No consórcio tradicional você espera anos por sorteio. No financiamento, paga juros todo mês. Com carta contemplada o crédito já está liberado — a espera acabou.",
    bgImage: "/card-bg-1.jpg",
  },
  {
    num: "#02",
    tagline: "Sem juros bancários",
    headline: "Quem financia R$ 300 mil acaba pagando R$ 750 mil.",
    description:
      "Juros de 10-14% ao ano transformam seu sonho em dívida. Carta contemplada não cobra juros — apenas taxa administrativa. A diferença fica no seu bolso.",
    bgImage: "/card-bg-2.jpg",
  },
  {
    num: "#03",
    tagline: "Segurança jurídica",
    headline: "No mercado cheio de promessas, nós entregamos auditoria.",
    description:
      "Cada carta passa por verificação documental e jurídica completa. CNPJ ativo, regulamentação do Banco Central, e suporte do início ao fim. Aqui não tem surpresa.",
    bgImage: "/card-bg-3.jpg",
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
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const goTo = (idx: number) => {
    scrollRef.current?.scrollTo({ left: idx * (scrollRef.current?.offsetWidth || 0), behavior: 'smooth' });
  };

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {propositions.map((prop) => (
          <div key={prop.num} className="flex-none w-full snap-center px-6">
            <div className="relative bg-white p-7 rounded-2xl border border-[#00382e]/10 shadow-xl overflow-hidden min-h-[420px] flex flex-col justify-between">
              {/* Duotone bg */}
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: `url('${prop.bgImage}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.12,
                  filter: "grayscale(100%) sepia(40%) hue-rotate(90deg) saturate(200%) brightness(1.1)",
                }}
              />
              <div
                className="absolute inset-0 z-0"
                style={{
                  background: "linear-gradient(160deg, rgba(0,56,46,0.08) 0%, rgba(200,255,0,0.05) 50%, rgba(0,56,46,0.03) 100%)",
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5 font-[family-name:var(--font-montserrat)]">
                  <span className="font-extrabold text-sm text-green-bright font-mono">{prop.num}</span>
                  <span className="font-bold text-xs uppercase tracking-widest text-green-dark/50">{prop.tagline}</span>
                </div>
                <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-2xl text-green-dark mb-5 leading-tight">
                  {prop.headline}
                </h3>
              </div>
              <p className="relative z-10 font-sans text-sm text-gray-text leading-relaxed mt-auto">
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
            className={`h-2.5 rounded-full transition-all duration-300 ${
              activeSlide === i
                ? 'w-7 bg-[#00382e]'
                : 'w-2.5 bg-[#00382e]/20'
            }`}
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
    <section id="diferenciais" className="relative py-14 md:py-20 overflow-hidden bg-white">
      <div className="mx-auto max-w-[1550px] px-6 md:px-12 lg:px-20">
        
        {/* ── Two-column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-center">
          
          {/* Left: Sticky Intro */}
          <div className="lg:col-span-5 space-y-6 lg:pr-8 xl:pr-12">

            <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-[3.2rem] font-[family-name:var(--font-montserrat)] font-extrabold text-[#00382e] leading-tight">
              Crédito aprovado,<br className="hidden md:inline" /> sem surpresas
            </h2>
            <p className="font-sans text-lg text-[#00382e]/55 leading-relaxed">
              Cartas contempladas com crédito liberado para imóveis e veículos. Sem sorteio, sem espera, sem juros bancários.
            </p>
            <div className="pt-4">
              <a href="#simulador" className="inline-block px-8 py-3.5 rounded-xl font-[family-name:var(--font-montserrat)] font-bold text-sm uppercase tracking-wider bg-[#00382e] text-white hover:bg-[#004d3d] transition-all duration-300">
                Quero minha carta
              </a>
            </div>
          </div>

          {/* Right: Card Swap Stack (Desktop) */}
          <div className="hidden sm:flex lg:col-span-7 justify-center lg:justify-end w-full">
            <div className="relative h-[540px] md:h-[600px] lg:h-[660px] xl:h-[720px] w-full max-w-[820px] xl:max-w-[900px] overflow-visible mx-auto lg:mr-0">
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
                      "relative bg-white p-10 md:p-16 rounded-3xl",
                      "border border-[#00382e]/10 shadow-2xl flex flex-col justify-between select-none overflow-hidden"
                    )}
                  >
                    {/* Background image — green/white duotone */}
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        backgroundImage: `url('${prop.bgImage}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.12,
                        filter: "grayscale(100%) sepia(40%) hue-rotate(90deg) saturate(200%) brightness(1.1)",
                      }}
                    />
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        background: "linear-gradient(160deg, rgba(0,56,46,0.08) 0%, rgba(200,255,0,0.05) 50%, rgba(0,56,46,0.03) 100%)",
                      }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-10 font-[family-name:var(--font-montserrat)]">
                        <span className="font-extrabold text-sm text-green-bright font-mono">
                          {prop.num}
                        </span>
                        <span className="font-bold text-xs uppercase tracking-widest text-green-dark/50">
                          {prop.tagline}
                        </span>
                      </div>
                      <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-3xl md:text-4xl xl:text-[2.85rem] text-green-dark mb-10 leading-tight">
                        {prop.headline}
                      </h3>
                    </div>
                    <p className="relative z-10 font-sans text-base md:text-lg xl:text-xl text-gray-text leading-relaxed mt-auto">
                      {prop.description}
                    </p>
                  </Card>
                ))}
              </CardSwap>
            </div>
          </div>

          {/* Mobile: Touch Carousel */}
          <div className="sm:hidden lg:col-span-7 w-full">
            <MobileCardCarousel />
          </div>

        </div>
      </div>
    </section>
  );
}


