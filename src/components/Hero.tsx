"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const slides = [
  {
    id: 1,
    image: "/img/hero-escritorio.webp",
    kicker: "Consultoria financeira para quem está construindo",
    title: ["Você constrói.", "O banco lucra", "em cima disso."],
    subtitle:
      "Do agro ao imóvel. Da frota à clínica. Existe um caminho para expandir patrimônio sem pagar 30% ao banco.",
    cta1: { label: "Ver como funciona", href: "#segmentos" },
    cta2: { label: "Simular crédito", href: "#simulador" },
  },
  {
    id: 2,
    image: "/img/hero-agro.webp",
    kicker: "Agro, frota, clínica, imóvel — R$15k a R$2M",
    title: ["Crédito aprovado.", "Sem banco.", "Sem juros compostos."],
    subtitle:
      "Quem financia R$ 500 mil paga R$ 1,2 milhão. Esse é o negócio do banco — não o seu. Cartas contempladas mudam esse cálculo.",
    cta1: { label: "Quero meu crédito", href: "#segmentos" },
    cta2: { label: "Calcular diferença", href: "#simulador" },
  },
  {
    id: 3,
    image: "/img/hero-juridico.webp",
    kicker: "4 anos · CNPJ ativo · Regulamentado pelo Banco Central",
    title: ["Segurança jurídica", "em cada carta.", "Sem surpresas."],
    subtitle:
      "Cada carta é auditada pela nossa equipe jurídica antes de chegar até você. Aqui não tem promessa — tem processo.",
    cta1: { label: "Conhecer a Titanium", href: "#sobre" },
    cta2: { label: "Falar com consultor", href: "https://wa.me/5511930048940" },
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [swipeDir, setSwipeDir] = useState<1 | -1>(1);

  const goTo = useCallback(
    (idx: number) => {
      setSwipeDir(idx > current ? 1 : -1);
      setCurrent(idx);
    },
    [current]
  );

  const next = useCallback(() => {
    setSwipeDir(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setSwipeDir(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        dx < 0 ? next() : prev();
      }
    },
    [next, prev]
  );

  useEffect(() => {
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section
      className="relative min-h-[90dvh] flex flex-col justify-between overflow-hidden"
      style={{ backgroundColor: "var(--bg-dark)" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Background: textura geométrica sofisticada ── */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {/* Photo background */}
        <Image
          src={slide.image}
          alt=""
          fill
          priority
          className="object-cover opacity-20 transition-opacity duration-700"
          sizes="100vw"
        />
        {/* Gradiente base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(10,123,62,0.18) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(6,83,42,0.12) 0%, transparent 60%)",
          }}
        />
        {/* Grid de pontos finos — sofisticado */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.07 }}
        >
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#ffffff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        {/* Linha diagonal sutil */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, transparent 0%, transparent 49.5%, rgba(10,123,62,0.08) 49.5%, rgba(10,123,62,0.08) 50.5%, transparent 50.5%, transparent 100%)",
            backgroundSize: "120px 120px",
          }}
        />
        {/* Borda inferior suave */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: "linear-gradient(to top, rgba(248,247,244,0.06), transparent)",
          }}
        />
      </div>

      {/* ── Conteúdo ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-20 pt-28 pb-12">
        <div className="max-w-[860px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Kicker */}
              <div className="mb-6 flex items-center gap-3">
                <span
                  className="inline-block w-6 h-px"
                  style={{ backgroundColor: "var(--green-vivid)" }}
                />
                <span
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "var(--green-vivid)" }}
                >
                  {slide.kicker}
                </span>
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                  fontSize: "clamp(2.4rem, 6.5vw, 5.2rem)",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: "-0.025em",
                  color: "var(--ink-white)",
                }}
              >
                {slide.title.map((line, i) => (
                  <span key={i} className="block">
                    {i === 1 ? (
                      <span style={{ color: "var(--green-vivid)" }}>{line}</span>
                    ) : (
                      line
                    )}
                  </span>
                ))}
              </h1>

              {/* Subtitle */}
              <p
                className="mt-6 max-w-xl"
                style={{
                  fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                  fontSize: "clamp(1rem, 1.6vw, 1.2rem)",
                  fontWeight: 400,
                  lineHeight: 1.75,
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                {slide.subtitle}
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap gap-4">
                <a href={slide.cta1.href} className="btn-primary">
                  {slide.cta1.label}
                </a>
                <a href={slide.cta2.href} className="btn-outline-white">
                  {slide.cta2.label}
                </a>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Indicadores */}
          <div className="flex gap-3 mt-12">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === current ? "2.5rem" : "0.75rem",
                  backgroundColor:
                    i === current
                      ? "var(--green-vivid)"
                      : "rgba(255,255,255,0.2)",
                }}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Rodapé do hero: credenciais ── */}
      <div
        className="relative z-10 px-6 sm:px-10 md:px-16 lg:px-20 pb-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-[860px] mx-auto flex flex-wrap items-center gap-6 pt-6">
          {[
            { value: "4 anos", label: "de mercado" },
            { value: "R$15k–2M", label: "em cartas aprovadas" },
            { value: "CNPJ ativo", label: "Banco Central regulado" },
          ].map((item) => (
            <div key={item.value} className="flex items-center gap-3">
              <span
                style={{
                  fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--green-vivid)",
                }}
              >
                {item.value}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.35)",
                  fontWeight: 400,
                }}
              >
                {item.label}
              </span>
              <span
                className="w-px h-4 hidden sm:block"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
