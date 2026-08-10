"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ── Data ─────────────────────────────────────────────── */

interface ColabTestimonial {
  image: string;
  name: string;
  role: string;
  quote: string;
  badge: string;
}

const testimonials: ColabTestimonial[] = [
  {
    image: "/img/colab-fernanda.jpg",
    name: "Fernanda M.",
    role: "Corretora de Seguros · São Paulo",
    quote:
      "Em 3 meses indiquei 8 clientes e já recebi R$ 12.400 em comissões diretas no PIX. O suporte da Titanium é impecável.",
    badge: "R$ 12.400 em 90 dias",
  },
  {
    image: "/img/colab-carlos.jpg",
    name: "Carlos R.",
    role: "Consultor Financeiro · Rio de Janeiro",
    quote:
      "Trabalho com crédito há 15 anos e nunca vi uma operação tão transparente. O rastreamento de leads no CRM me dá segurança total.",
    badge: "15+ indicações ativas",
  },
  {
    image: "/img/colab-ana.jpg",
    name: "Ana P.",
    role: "Empreendedora Digital · Belo Horizonte",
    quote:
      "Comecei indicando amigos próximos e hoje minha rede gera uma renda extra consistente. O cadastro levou 5 minutos.",
    badge: "Renda extra recorrente",
  },
  {
    image: "/img/colab-marcos.jpg",
    name: "Marcos L.",
    role: "Agente Autônomo · Curitiba",
    quote:
      "A blindagem de leads é real. Cada cliente que indico fica vinculado ao meu ID para sempre. Zero conflito com outros parceiros.",
    badge: "Leads blindados 100%",
  },
];

/* ── Component ────────────────────────────────────────── */

export default function ColabTestimonials() {
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
      className="py-20 bg-white border-t border-slate-100"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-3 mb-14">
          <span className="text-[10px] font-bold text-[#0A7B3E] uppercase tracking-widest bg-[#E8F5EE] px-3 py-1.5 rounded-full">
            Relatos Reais
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Quem já está <span className="text-[#0A7B3E]">comissionando</span>
          </h2>
          <p className="text-slate-500 font-light text-sm max-w-lg mx-auto">
            Colaboradores de diferentes segmentos compartilham suas experiências reais com o programa de parcerias.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="relative bg-slate-50 border border-slate-200/60 rounded-2xl p-6 sm:p-7 space-y-4 hover:border-[#0A7B3E]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-sm"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `all 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 120}ms`,
              }}
            >
              {/* Quote Icon */}
              <svg
                className="absolute top-5 right-6 w-8 h-8 text-slate-200/80"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              {/* Avatar + Name */}
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#D1ECDD] shrink-0 shadow-sm">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs font-light">{t.role}</div>
                </div>
              </div>

              {/* Quote */}
              <p className="text-slate-600 text-sm font-light leading-relaxed relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#E8F5EE] border border-[#D1ECDD] rounded-full px-3.5 py-1.5">
                <svg
                  className="w-3.5 h-3.5 text-[#0A7B3E]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-[#0A7B3E] text-xs font-bold">{t.badge}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-slate-400 text-[10px] font-light text-center mt-8 max-w-lg mx-auto leading-relaxed">
          *Depoimentos baseados em operações reais. Nomes abreviados para privacidade. Resultados individuais podem variar conforme perfil, volume de indicações e condições de mercado.
        </p>
      </div>
    </section>
  );
}
