"use client";

import { useRef, useEffect } from "react";
import BorderGlow from "./BorderGlow";

// ─── PERSONAS ─────────────────────────────────────────────────────────────────
// Cada persona tem: hook de identidade, dor, CTA e link para a LP
const personas = [
  {
    id: "uber",
    icon: (
      /* Iconsax Bold: Driving / Steering */
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2Zm5.93 7.45-1.7 4.68c-.17.46-.6.77-1.1.77h-6.26c-.49 0-.93-.3-1.1-.77l-1.7-4.68A.747.747 0 0 1 6.78 11h10.44c.55 0 .92.57.71 1.08v.37Z" opacity=".4"/>
        <path d="M16.5 17.23h-9c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h9c.41 0 .75.34.75.75s-.34.75-.75.75ZM12 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2Z"/>
      </svg>
    ),
    question: "Você é motorista de app?",
    pain: "Seu carro gera renda — mas o banco não reconhece.",
    cta: "Financiar sem holerite",
    href: "/uber",
    badge: null,
  },
  {
    id: "caminhao",
    icon: (
      /* Iconsax Bold: Truck Fast */
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M15 2H9C5.5 2 4 3.5 4 7v7.25h12.5V7c0-3.5-1.5-5-5-5Z" opacity=".4"/>
        <path d="M21.5 15.5v1.25c0 .41-.34.75-.75.76h-.26c-.01-1.25-1.04-2.26-2.3-2.26-1.25 0-2.27.99-2.3 2.24H9.81c-.01-1.25-1.04-2.24-2.3-2.24-1.27 0-2.3 1.01-2.3 2.26H4.5a.749.749 0 0 1-.75-.76V15.5c0-.69.56-1.25 1.25-1.25h15.25c.69 0 1.25.56 1.25 1.25Z"/>
        <path d="M7.5 20c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2ZM18.19 20c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2ZM22 12.53l-1.71-2.57a.75.75 0 0 0-.62-.33H16.5v4.62h4.89c.43 0 .71-.46.5-.83l-.89-1.33v.44Z"/>
        <path d="M4 12.25H2c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h2c.41 0 .75.34.75.75s-.34.75-.75.75ZM4 9.25H3c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1c.41 0 .75.34.75.75s-.34.75-.75.75ZM4 15.25H1c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h3c.41 0 .75.34.75.75s-.34.75-.75.75Z"/>
      </svg>
    ),
    question: "Você tem frota ou quer ter?",
    pain: "Cada caminhão parado é dinheiro que não entra.",
    cta: "Estruturar minha frota",
    href: "/caminhao",
    badge: null,
  },
  {
    id: "imovel",
    icon: (
      /* Iconsax Bold: Building 4 */
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M10.75 2.45c-.69-.55-1.81-.55-2.51 0L3.49 6.44C2.87 6.95 2.5 7.93 2.5 8.74v8.65c0 1.64 1.36 3 3 3h13c1.64 0 3-1.36 3-3V8.83c0-.87-.39-1.79-.97-2.3l-5.5-4.76" opacity=".4"/>
        <path d="M12 18.75c-.41 0-.75-.34-.75-.75v-3c0-.41.34-.75.75-.75s.75.34.75.75v3c0 .41-.34.75-.75.75Z"/>
        <path d="M10.75 2.45c-.69-.56-1.81-.56-2.51 0L3.49 6.44C2.87 6.95 2.5 7.93 2.5 8.74v8.65c0 1.64 1.36 3 3 3H12V2.91c-.44-.27-.93-.42-1.25-.46Z"/>
      </svg>
    ),
    question: "Você quer construir ou investir?",
    pain: "Juros bancários estão consumindo o seu patrimônio.",
    cta: "Crédito sem juros compostos",
    href: "/terrenos-construcao",
    badge: null,
  },
  {
    id: "agro",
    icon: (
      /* Iconsax Bold: Tree / Crop */
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M18.89 6.46c-.04-.34-.07-.66-.07-1C18.82 3 16.92 2 14.75 2h-5.5C7.08 2 5.18 3 5.18 5.46c0 .34-.03.66-.07 1C4.42 12.63 8.14 16 12 16s7.58-3.37 6.89-9.54Z" opacity=".4"/>
        <path d="M12.75 16v5c0 .41-.34.75-.75.75s-.75-.34-.75-.75v-5h1.5Z"/>
        <path d="M18.5 22H5.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h13c.41 0 .75.34.75.75s-.34.75-.75.75Z"/>
        <path d="M17.47 8.83H6.53c-.35 0-.59-.36-.46-.69.4-.99.72-2.11.93-3.39.04-.22.23-.39.46-.39h9.08c.23 0 .43.16.46.39.21 1.28.53 2.4.93 3.39.14.33-.1.69-.46.69Z"/>
      </svg>
    ),
    question: "Você está no agronegócio?",
    pain: "Máquina parada é safra perdida.",
    cta: "Renovar equipamentos",
    href: "/maquinas-agricolas",
    badge: null,
  },
  {
    id: "contemplada",
    icon: (
      /* Iconsax Bold: Card Tick */
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M22 7.55v.95H2v-.95C2 4.99 3.56 3.5 6 3.5h12c2.44 0 4 1.49 4 4.05Z"/>
        <path d="M2 8.5v7.95C2 19.01 3.56 20.5 6 20.5h12c2.44 0 4-1.49 4-4.05V8.5H2Zm6.56 8.83H5.78c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h2.78c.41 0 .75.34.75.75s-.33.75-.75.75Zm7.44 0h-4.11c-.41 0-.75-.34-.75-.75s.34-.75.75-.75H16c.41 0 .75.34.75.75s-.34.75-.75.75Z" opacity=".4"/>
        <path d="M14.15 12.63c-.19 0-.38-.07-.53-.22l-1.15-1.15a.754.754 0 0 1 0-1.06c.29-.29.77-.29 1.06 0l.62.62 1.66-1.66c.29-.29.77-.29 1.06 0 .29.29.29.77 0 1.06l-2.19 2.19c-.15.15-.34.22-.53.22Z"/>
      </svg>
    ),
    question: "Precisa de crédito agora?",
    pain: "Crédito já contemplado — sem esperar sorteio.",
    cta: "Ver carta disponível",
    href: "/carta-contemplada",
    badge: "Disponível",
  },
  {
    id: "luxo",
    icon: (
      /* Iconsax Bold: Car */
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M19.32 7.04c-.31-.93-.83-1.69-1.68-2.27-.43-.3-.91-.47-1.43-.57L14.73 2.6a1.48 1.48 0 0 0-1.09-.47h-3.28c-.42 0-.81.17-1.09.47L7.79 4.2c-.52.1-1 .27-1.43.57-.85.58-1.37 1.34-1.68 2.27-.37 1.11-.62 2.66-.66 4.83 0 .28.11.55.31.74.2.19.47.3.75.28h13.84c.28.02.55-.09.75-.28.2-.19.31-.46.31-.74-.04-2.17-.29-3.72-.66-4.83Z" opacity=".4"/>
        <path d="M5.08 12.89v1.14c0 1.57.02 2.52.08 3.19.06.62.16.85.27.98.11.13.3.28.91.44.65.17 1.58.26 3.11.29h5.1c1.53-.03 2.46-.12 3.11-.29.61-.16.8-.31.91-.44.11-.13.21-.36.27-.98.06-.67.08-1.62.08-3.19v-1.14H5.08Z"/>
        <path d="M8.5 17c.83 0 1.5-.67 1.5-1.5S9.33 14 8.5 14 7 14.67 7 15.5 7.67 17 8.5 17ZM15.5 17c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5Z"/>
        <path d="M19.94 18.77c-.02.27-.17.5-.4.62-.3.15-.87.37-1.95.55v.56c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V20H9.41v.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-.56c-1.08-.18-1.65-.4-1.95-.55a.76.76 0 0 1-.4-.62"/>
      </svg>
    ),
    question: "Você busca um veículo premium?",
    pain: "Financiamento bancário não é o único caminho.",
    cta: "Calcular meu crédito",
    href: "/carro-luxo",
    badge: null,
  },
  {
    id: "empresario",
    icon: (
      /* Iconsax Bold: Briefcase */
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M16.17 4.65v-.72c0-1.59-.62-2.93-2.93-2.93h-2.48c-2.31 0-2.93 1.34-2.93 2.93v.73c-3.02.24-4.38 1.69-4.73 4.43-.04.32.22.59.54.59h16.72c.32 0 .58-.28.54-.59-.35-2.75-1.71-4.19-4.73-4.44Zm-6.84-.72c0-1.49.53-1.43 1.43-1.43h2.48c.9 0 1.43 0 1.43 1.43V4.7h-5.34v-.77Z"/>
        <path d="M20.5 10.15c.34 0 .6.3.56.64-.37 3.3-1.56 6.03-5.16 6.7-.16.03-.3.13-.38.27-.56.98-1.57 1.74-3.52 1.74-1.94 0-2.96-.77-3.52-1.75a.526.526 0 0 0-.38-.27C4.5 16.81 3.31 14.09 2.94 10.79a.55.55 0 0 1 .56-.64h17Z" opacity=".4"/>
        <path d="M14.5 13.63c0 .25-.07.49-.18.7-.28.55-.85.92-1.51.92h-.12c-.01 0-.02 0-.04.01a1.732 1.732 0 0 1-1.47-.93c-.11-.21-.18-.45-.18-.7v-1.26c0-.55.45-1 1-1h.5c.55 0 1 .45 1 1v1.26Z"/>
      </svg>
    ),
    question: "Você é PJ ou sócio de empresa?",
    pain: "Renda variável não é impedimento. É contexto.",
    cta: "Estruturar crédito PJ",
    href: "/empresario",
    badge: null,
  },
  {
    id: "medico",
    icon: (
      /* Iconsax Bold: Health / Stethoscope */
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M17 2H7C4.24 2 2 4.24 2 7v6c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5Z" opacity=".4"/>
        <path d="M15.08 8.79h-2.37V6.42c0-.41-.34-.75-.75-.75s-.75.34-.75.75v2.37H8.84c-.41 0-.75.34-.75.75s.34.75.75.75h2.37v2.37c0 .41.34.75.75.75s.75-.34.75-.75V10.29h2.37c.41 0 .75-.34.75-.75s-.34-.75-.75-.75ZM19.08 18H4.92c-.41 0-.75.34-.75.75v.5c0 1.52 1.23 2.75 2.75 2.75h10.16c1.52 0 2.75-1.23 2.75-2.75v-.5c0-.41-.34-.75-.75-.75Z"/>
      </svg>
    ),
    question: "Você é profissional autônomo?",
    pain: "Holerite não define o seu crédito.",
    cta: "Ver meu perfil",
    href: "/medico",
    badge: null,
  },
  {
    id: "solar",
    icon: (
      /* Iconsax Bold: Sun / Flash */
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M12 18.5c-3.58 0-6.5-2.92-6.5-6.5s2.92-6.5 6.5-6.5 6.5 2.92 6.5 6.5-2.92 6.5-6.5 6.5Z" opacity=".4"/>
        <path d="M12 2c-.41 0-.75.34-.75.75v1.5c0 .41.34.75.75.75s.75-.34.75-.75v-1.5c0-.41-.34-.75-.75-.75ZM12 19c-.41 0-.75.34-.75.75v1.5c0 .41.34.75.75.75s.75-.34.75-.75v-1.5c0-.41-.34-.75-.75-.75ZM22 11.25h-1.5c-.41 0-.75.34-.75.75s.34.75.75.75H22c.41 0 .75-.34.75-.75s-.34-.75-.75-.75ZM4.25 12c0-.41-.34-.75-.75-.75H2c-.41 0-.75.34-.75.75s.34.75.75.75h1.5c.41 0 .75-.34.75-.75ZM18.89 5.81l-1.06 1.06a.754.754 0 0 0 0 1.06c.15.15.34.22.53.22s.38-.07.53-.22l1.06-1.06c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0ZM6.17 17.12l-1.06 1.06c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l1.06-1.06c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0ZM18.89 18.18c-.29-.29-.77-.29-1.06 0s-.29.77 0 1.06l1.06 1.06c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.06-1.06ZM6.17 6.88c.19 0 .38-.07.53-.22.29-.29.29-.77 0-1.06L5.64 4.54c-.29-.29-.77-.29-1.06 0s-.29.77 0 1.06L5.64 6.66c.15.15.34.22.53.22Z"/>
      </svg>
    ),
    question: "Você quer cortar custos fixos?",
    pain: "Cada mês de energia cara é dinheiro que não investe.",
    cta: "Simular placas solares",
    href: "/placas-solares",
    badge: null,
  },
  {
    id: "aeronave",
    icon: (
      /* Iconsax Bold: Airplane */
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M20.11 3.89C18.6 2.38 16.85 1.87 15.51 2.2c-1.57.39-2.67 1.81-3.32 3.18L11.5 6.84 6.9 5.36c-.56-.18-1.2-.03-1.63.39l-.78.78c-.63.63-.49 1.7.29 2.14l3.59 2.04-1.99 1.99-.97.97-1.56-.49c-.44-.14-.93-.03-1.26.3l-.3.3c-.5.5-.38 1.32.24 1.66l2.34 1.27 1.27 2.34c.34.62 1.17.74 1.66.24l.3-.3c.33-.33.44-.82.3-1.26l-.49-1.56 2.96-2.96 2.04 3.59c.44.78 1.51.92 2.14.29l.78-.78c.42-.42.57-1.06.39-1.63l-1.48-4.6 1.46-.69c1.37-.65 2.79-1.75 3.18-3.32.33-1.34-.18-3.09-1.69-4.6Z" opacity=".4"/>
        <path d="m9.6 13.17-1.99 1.99-.97.97-1.56-.49c-.44-.14-.93-.03-1.26.3l-.3.3c-.5.5-.38 1.32.24 1.66l2.34 1.27 1.27 2.34c.34.62 1.17.74 1.66.24l.3-.3c.33-.33.44-.82.3-1.26l-.49-1.56 2.96-2.96"/>
      </svg>
    ),
    question: "Você usa aviação executiva?",
    pain: "Carta contemplada viabiliza o que o banco recusa.",
    cta: "Explorar opções",
    href: "/aeronaves",
    badge: null,
  },
];

// ─── COMPONENT ─────────────────────────────────────────────────────────────────
export default function PersonaGateway() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection observer — anima cards na entrada
  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll<HTMLElement>(
      ".pg-card .border-glow-inner > a"
    );
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform =
              "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    cards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 60}ms`;
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
      {/* BG subtle grid using vivid green instead of lime */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--green-vivid) 1px, transparent 1px), linear-gradient(90deg, var(--green-vivid) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16 py-24 md:py-32">
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
              Encontre seu caminho
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-12">
            <h2 className="font-[family-name:var(--font-montserrat)] font-black text-4xl md:text-5xl lg:text-6xl leading-[1.02] text-white max-w-xl">
              Qual é o seu
              <br />
              <span style={{ color: "var(--green-vivid)" }}>
                próximo passo?
              </span>
            </h2>
            <p className="text-white/45 text-base md:text-lg leading-relaxed max-w-sm font-sans">
              Cada perfil tem uma estratégia de crédito diferente. Selecione o
              que mais se parece com você.
            </p>
          </div>
        </div>

        {/* ── Grid de cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-7">
          {personas.map((p) => (
            <BorderGlow
              key={p.id}
              className="pg-card"
              backgroundColor="rgba(10, 14, 10, 0.95)"
              borderRadius={20}
              glowRadius={30}
              glowIntensity={1.2}
              coneSpread={20}
              edgeSensitivity={25}
              glowColor="145 72 55"
              fillOpacity={0.35}
              colors={['#0A7B3E', '#15B85C', '#1EE67C']}
            >
              <a
                href={p.href}
                className="group relative flex flex-col gap-4 p-7 no-underline h-full"
                style={{
                  opacity: 0,
                  transform: "translateY(28px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                }}
              >
                {/* Badge (se tiver) */}
                {p.badge && (
                  <span
                    className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full font-[family-name:var(--font-montserrat)]"
                    style={{
                      backgroundColor: "rgba(21, 184, 92, 0.15)",
                      color: "var(--green-vivid)",
                      border: "1px solid rgba(21, 184, 92, 0.3)",
                    }}
                  >
                    {p.badge}
                  </span>
                )}

                {/* Ícone */}
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: "rgba(21, 184, 92, 0.08)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  {p.icon}
                </div>

                {/* Texto */}
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-lg leading-tight text-white">
                    {p.question}
                  </h3>
                  <p
                    className="text-sm leading-relaxed font-sans"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {p.pain}
                  </p>
                </div>

                {/* CTA */}
                <div
                  className="flex items-center gap-2 text-sm font-bold font-[family-name:var(--font-montserrat)] uppercase tracking-wider mt-auto transition-all duration-300 group-hover:gap-3"
                  style={{ color: "var(--green-vivid)" }}
                >
                  {p.cta}
                  <svg
                    width="16"
                    height="16"
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
              </a>
            </BorderGlow>
          ))}
        </div>

        {/* ── Footer da seção ── */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/[0.06]">
          <p className="text-white/30 text-sm font-sans text-center sm:text-left">
            Não encontrou seu perfil?{" "}
            <a
              href="https://wa.me/5511930048940?text=Olá, quero entender qual opção faz sentido para meu perfil"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-white transition-colors"
              style={{ color: "rgba(21, 184, 92, 0.7)" }}
            >
              Fale com um especialista
            </a>
          </p>

          <a
            href="https://wa.me/5511930048940?text=Olá, quero entender qual opção faz sentido para meu perfil"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 rounded-full font-[family-name:var(--font-montserrat)] font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] hover:shadow-xl"
            style={{
              backgroundColor: "var(--green-vivid)",
              color: "#ffffff",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Quero orientação personalizada
          </a>
        </div>
      </div>
    </section>
  );
}
