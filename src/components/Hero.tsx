"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    eyebrow: "Enquanto você paga juros, outros já usaram o crédito.",
    titleLines: ["Sua carta", "já foi contemplada"],
    subtitle: "Crédito liberado na hora para imóveis e veículos. Sem financiamento, sem juros bancários, sem espera.",
  },
  {
    id: 2,
    eyebrow: "Quem financia paga até 2.5x o valor do bem.",
    titleLines: ["Chega de", "pagar juros"],
    subtitle: "Com carta contemplada você paga o valor real — sem juros compostos corroendo seu bolso todo mês.",
  },
  {
    id: 3,
    eyebrow: "Cartas contempladas são limitadas. A sua pode não esperar.",
    titleLines: ["Crédito aprovado,", "na mão"],
    subtitle: "Imóveis e veículos com crédito pronto para usar. Cada carta é auditada e garantida pela Titanium.",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [swipeDir, setSwipeDir] = useState<1 | -1>(1);

  const goTo = useCallback((idx: number) => {
    setSwipeDir(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  const next = useCallback(() => {
    setSwipeDir(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setSwipeDir(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? next() : prev();
    }
  }, [next, prev]);

  // Autoplay
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section
      className="relative min-h-[85dvh] flex flex-col justify-between overflow-hidden bg-[#f6f6f6]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-20 pt-24 pb-8">
        <div className="max-w-[900px] mx-auto w-full">

          {/* Left: Animated Text */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-4 inline-flex items-center gap-2">
                  <span className="text-label text-green-dark/80">
                    {slide.eyebrow}
                  </span>

                </div>

                <h1 className="font-[family-name:var(--font-montserrat)] text-[clamp(1.8rem,7vw,6rem)] font-black leading-[1.05] tracking-tight uppercase text-green-dark">
                  {slide.titleLines.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < slide.titleLines.length - 1 && <br />}
                    </span>
                  ))}
                </h1>

                <p className="mt-5 md:mt-6 max-w-lg text-base sm:text-lg md:text-xl leading-relaxed font-[family-name:var(--font-inter)] font-medium text-green-dark/70">
                  {slide.subtitle}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a href="#segmentos" className="btn-evoy">
                    Ver cartas disponíveis
                  </a>
                  <a href="#simulador" className="btn-evoy-outline">
                    Simular parcelas
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Indicators */}
            <div className="flex gap-3 mt-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-10 h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-green-dark"
                      : "bg-green-dark/20 hover:bg-green-dark/40"
                  }`}
                  aria-label={`Ir para slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
