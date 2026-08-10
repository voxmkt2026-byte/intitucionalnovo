"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const propositions = [
  {
    num: "01",
    tagline: "Diagnóstico de perfil",
    headline: "Avaliação do seu objetivo, prazo, entrada disponível e capacidade de parcela.",
    description:
      "Antes de qualquer recomendação, entendemos seu momento financeiro. Mapeamos metas, prazos e limites para que a orientação seja personalizada — sem pressão comercial.",
  },
  {
    num: "02",
    tagline: "Comparativo de alternativas",
    headline: "Consórcio novo, carta contemplada, financiamento ou aguardar melhor momento.",
    description:
      "Nem sempre carta contemplada é a melhor opção. Comparamos custos, prazos e riscos de cada alternativa para que você decida com clareza matemática.",
  },
  {
    num: "03",
    tagline: "Curadoria de cartas disponíveis",
    headline: "Somente quando houver disponibilidade real e com validação prévia.",
    description:
      "Se fizer sentido para o seu caso, apresentamos cotas contempladas disponíveis no mercado secundário — cada uma auditada pela nossa mesa jurídica antes de chegar até você.",
  },
  {
    num: "04",
    tagline: "Orientação sobre riscos",
    headline: "Transferência, aprovação, garantias, saldo devedor, taxas e documentação.",
    description:
      "Explicamos cada etapa, risco e custo envolvido: transferência de titularidade, aprovação da administradora, taxas, documentação e garantias exigidas pelo BACEN.",
  },
] as const;

export default function ValueProps() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % propositions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section
      id="diferenciais"
      className="relative py-20 md:py-28 overflow-hidden font-jakarta"
    >
      {/* Glow e Grid de Fundo */}
      <div className="absolute inset-0 tech-grid-pattern opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1160px] px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Esquerda: Intro */}
          <div className="lg:col-span-5 space-y-6 lg:pr-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5EE] border border-[#D1ECDD] text-[#0A7B3E] text-[10px] font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A7B3E] animate-pulse" />
              Análise Consultiva Titanium
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              O que você recebe <br />
              <span className="text-gradient">na nossa esteira</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-light leading-relaxed">
              Antes de qualquer recomendação, fazemos um diagnóstico completo do seu perfil, objetivo e possibilidades. Você recebe dados concretos e inteligência patrimonial.
            </p>

            <div className="pt-2">
              <a
                href="#simulador"
                className="btn-primary inline-flex items-center gap-2"
              >
                <span>Solicitar Análise Gratuita</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Direita: Liquid Glass Interactive Card */}
          <div className="lg:col-span-7 w-full flex flex-col items-center">
            <div
              className="relative w-full overflow-hidden rounded-3xl min-h-[380px] sm:min-h-[420px] flex liquid-glass border border-white/80 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.07),inset_0_1px_1px_rgba(255,255,255,1)] group"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {propositions.map((prop, idx) => (
                <div
                  key={prop.num}
                  className={cn(
                    "absolute inset-0 w-full h-full p-8 sm:p-12 transition-all duration-700 ease-in-out flex flex-col justify-between select-none text-left",
                    idx === active
                      ? "opacity-100 translate-x-0 scale-100 pointer-events-auto z-10"
                      : idx < active
                      ? "opacity-0 -translate-x-full scale-95 pointer-events-none z-0"
                      : "opacity-0 translate-x-full scale-95 pointer-events-none z-0"
                  )}
                >
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E] font-extrabold text-xs shadow-xs">
                        {prop.num}
                      </span>
                      <span className="text-xs font-bold text-[#0A7B3E] uppercase tracking-widest">
                        {prop.tagline}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
                      {prop.headline}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
                      {prop.description}
                    </p>
                  </div>

                  {/* Barra de Progresso Liquid */}
                  <div className="relative z-10 pt-6">
                    <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#0A7B3E] to-[#15B85C] h-full rounded-full transition-all duration-300"
                        style={{ width: `${((active + 1) / propositions.length) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-3 text-[11px] font-semibold text-slate-400">
                      <span>Etapa {active + 1} de {propositions.length}</span>
                      <div className="flex gap-1.5">
                        {propositions.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActive(i)}
                            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                              i === active ? "bg-[#0A7B3E] scale-125" : "bg-slate-300 hover:bg-slate-400"
                            }`}
                            aria-label={`Ir para etapa ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
