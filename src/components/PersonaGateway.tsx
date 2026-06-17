"use client";

import { useRef, useEffect } from "react";

// ─── PERSONAS ─────────────────────────────────────────────────────────────────
// Cada persona tem: hook de identidade, dor, CTA e link para a LP
const personas = [
  {
    id: "uber",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 26 C10 26 12 20 20 20 C28 20 30 26 30 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="20" cy="14" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 32 L16 28 L20 30 L24 28 L26 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
      <svg viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-7">
        <rect x="1" y="5" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M25 10 L36 10 L39 18 L39 23 L25 23 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="7" cy="26" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="19" cy="26" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="33" cy="26" r="3" stroke="currentColor" strokeWidth="1.5"/>
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
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <path d="M5 38 L5 18 L20 6 L35 18 L35 38 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="14" y="26" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="22" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="24" y="22" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
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
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <path d="M20 36 C20 36 6 28 6 16 C6 9 12 4 20 4 C28 4 34 9 34 16 C34 28 20 36 20 36Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M20 12 L20 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 20 C20 20 14 18 12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 26 C20 26 26 22 28 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 15 L36 15" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="20" cy="27" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M17.5 27 L19 28.5 L22.5 25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    question: "Precisa de crédito agora?",
    pain: "Aprovação imediata — sem esperar sorteio.",
    cta: "Ver carta disponível",
    href: "/carta-contemplada",
    badge: "Imediato",
  },
  {
    id: "luxo",
    icon: (
      <svg viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-7">
        <path d="M3 18 C3 18 8 8 22 8 C36 8 41 18 41 18 L41 22 C41 24 39 25 37 25 L7 25 C5 25 3 24 3 22 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 8 L12 3 L32 3 L36 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="10" cy="25" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="34" cy="25" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 25 L30 25" stroke="currentColor" strokeWidth="1"/>
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
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <rect x="8" y="16" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 16 L14 12 C14 9 16 8 20 8 C24 8 26 9 26 12 L26 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 24 L32 24" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="17" y="22" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
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
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <circle cx="20" cy="14" r="8" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 38 C7 30 13 26 20 26 C27 26 33 30 33 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17 11 L17 17 M14 14 L20 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <circle cx="20" cy="20" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M20 4 L20 8 M20 32 L20 36 M4 20 L8 20 M32 20 L36 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8.7 8.7 L11.5 11.5 M28.5 28.5 L31.3 31.3 M31.3 8.7 L28.5 11.5 M11.5 28.5 L8.7 31.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
      <svg viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-9">
        <path d="M4 22 L20 16 L36 10 L34 22 L20 26 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M20 26 L22 36 L16 32 L20 16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M34 16 L40 20 L36 22" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
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
      ".pg-card"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {personas.map((p) => (
            <a
              key={p.id}
              href={p.href}
              className="pg-card group relative flex flex-col gap-4 rounded-2xl border p-7 transition-all duration-300 no-underline"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.03)",
                opacity: 0,
                transform: "translateY(28px)",
                transition:
                  "opacity 0.5s ease, transform 0.5s ease, border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--green-vivid)";
                el.style.backgroundColor = "rgba(21, 184, 92, 0.05)";
                el.style.boxShadow =
                  "0 0 0 1px var(--green-vivid), 0 20px 40px rgba(0,0,0,0.4)";
                el.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "rgba(255,255,255,0.08)";
                el.style.backgroundColor = "rgba(255,255,255,0.03)";
                el.style.boxShadow = "none";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Badge (se tiver) */}
              {p.badge && (
                <span
                  className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full font-[family-name:var(--font-montserrat)]"
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
                className="flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-300"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.5)",
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
                className="flex items-center gap-2 text-sm font-bold font-[family-name:var(--font-montserrat)] uppercase tracking-wider mt-auto transition-colors duration-300 group-hover:gap-3"
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
          ))}
        </div>

        {/* ── Footer da seção ── */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/[0.06]">
          <p className="text-white/30 text-sm font-sans text-center sm:text-left">
            Não encontrou seu perfil?{" "}
            <a
              href="https://wa.me/5511951014269?text=Olá, quero entender qual opção faz sentido para meu perfil"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-white transition-colors"
              style={{ color: "rgba(21, 184, 92, 0.7)" }}
            >
              Fale com um especialista
            </a>
          </p>

          <a
            href="https://wa.me/5511951014269?text=Olá, quero entender qual opção faz sentido para meu perfil"
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
