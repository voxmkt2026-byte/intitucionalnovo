"use client";

import { useEffect, useRef } from "react";
import ShapeGrid from "@/components/ShapeGrid";

const milestones = [
  {
    year: "2005",
    title: "O Início",
    text: "Fundada por Rafael Mendes e André Luís Costa em São Paulo, a Titanium nasceu de uma convicção: o mercado de consórcios no Brasil precisava de transparência. Enquanto outros operavam na informalidade, os dois sócios apostaram em processos documentados, contratos auditados e atendimento presencial. O primeiro escritório funcionava em uma sala de 20m² na Avenida Paulista.",
    accent: true,
  },
  {
    year: "2007",
    title: "Primeira Equipe",
    text: "Com o crescimento orgânico impulsionado por indicações, a Titanium contratou seus três primeiros consultores dedicados. A operação saiu do improviso e ganhou estrutura: CRM próprio, script de atendimento padronizado e processo de due diligence jurídica para cada carta negociada.",
  },
  {
    year: "2008",
    title: "Expansão para Veículos",
    text: "Até então focada em imóveis, a Titanium identificou uma demanda crescente no segmento automotivo. Foram fechadas as primeiras 47 cartas contempladas de veículos naquele ano — todas com transferência em cartório e laudos de vistoria inclusos no processo.",
  },
  {
    year: "2010",
    title: "Primeiro Milhão Intermediado",
    text: "A marca de R$ 1 milhão em créditos intermediados foi ultrapassada em março de 2010. O número representou mais do que receita: consolidou a reputação da Titanium como operação séria num mercado historicamente desconfiado. O NPS da empresa naquele ano atingiu 87 pontos.",
    accent: true,
  },
  {
    year: "2012",
    title: "Presença Nacional",
    text: "A decisão de atender clientes fora de São Paulo exigiu uma reestruturação logística completa. Parcerias com despachantes em 14 estados, convênio com cartórios digitais e um núcleo jurídico que operava remotamente permitiram que a Titanium levasse cartas contempladas para todas as regiões do Brasil.",
  },
  {
    year: "2013",
    title: "Departamento Jurídico Próprio",
    text: "Com a Dra. Camila Ferreira à frente, a Titanium internalizou seu departamento jurídico. Cada carta passou a ser auditada em cinco camadas: verificação de contemplação, análise de débitos, conferência de documentos, simulação tributária e parecer final de viabilidade. O índice de litígios caiu para zero.",
  },
  {
    year: "2014",
    title: "Certificação e Compliance",
    text: "Implantação do programa de compliance inspirado nas melhores práticas do mercado financeiro. A Titanium tornou-se uma das primeiras intermediárias de consórcios a operar com políticas formais de prevenção à lavagem de dinheiro, conheça seu cliente (KYC) e auditoria periódica de processos.",
    accent: true,
  },
  {
    year: "2016",
    title: "500 Famílias Atendidas",
    text: "Meio milhar de famílias e empresas já haviam conquistado imóveis, veículos e máquinas através da Titanium. Para celebrar, os fundadores lançaram o programa Titanium Indica — uma bonificação para clientes que trouxessem novos compradores. Em 12 meses, o programa respondeu por 35% das novas vendas.",
  },
  {
    year: "2017",
    title: "Novo Escritório",
    text: "Inauguração da nova sede no bairro de Pinheiros, São Paulo, com 180m², sala de reuniões para atendimento presencial e infraestrutura completa para a equipe de 12 colaboradores. O espaço foi projetado para transmitir a mesma seriedade e transparência que a marca representa.",
  },
  {
    year: "2018",
    title: "Transformação Digital",
    text: "Lançamento da plataforma online com simulador de parcelas, consulta de cartas disponíveis em tempo real e assinatura eletrônica de contratos. O tempo médio de fechamento caiu de 15 para 4 dias úteis. A operação digital representou uma mudança cultural na empresa — o atendimento consultivo ganhou escala sem perder personalização.",
    accent: true,
  },
  {
    year: "2019",
    title: "R$ 10 Milhões em Créditos",
    text: "Dez milhões de reais intermediados acumulados. O crescimento acelerado foi sustentado por três pilares: taxa zero de inadimplência jurídica, atendimento pós-venda dedicado e um portfólio diversificado que atendia desde jovens comprando o primeiro carro até construtoras adquirindo terrenos.",
  },
  {
    year: "2020",
    title: "Resiliência na Pandemia",
    text: "Enquanto concorrentes fecharam portas, a Titanium adaptou 100% da operação para o modelo remoto em menos de duas semanas. Videoconferências substituíram reuniões presenciais, e o núcleo jurídico passou a operar com certificação digital. O resultado: nenhum dia de operação parado e crescimento de 22% em relação ao ano anterior.",
    accent: true,
  },
  {
    year: "2021",
    title: "Programa de Educação Financeira",
    text: "Lançamento do canal de conteúdo gratuito sobre consórcios, crédito contemplado e planejamento financeiro. Lives semanais no Instagram com especialistas, série de vídeos explicativos no YouTube e newsletter mensal com análise de mercado. Em seis meses, a comunidade ultrapassou 15 mil seguidores.",
  },
  {
    year: "2022",
    title: "Novos Segmentos",
    text: "Expansão do portfólio para caminhões, motos, máquinas pesadas, equipamentos agrícolas e serviços. A Titanium passou a atender tanto pessoa física quanto jurídica, com linhas específicas para frotas empresariais, agronegócio e construção civil. O ticket médio subiu 40%.",
  },
  {
    year: "2023",
    title: "Parceria com Administradoras",
    text: "Formalização de parcerias estratégicas com as cinco maiores administradoras de consórcios do Brasil. O acordo garantiu acesso prioritário a cartas contempladas de alto valor e condições exclusivas de transferência — vantagens repassadas integralmente aos clientes da Titanium.",
    accent: true,
  },
  {
    year: "2024",
    title: "R$ 30 Milhões Intermediados",
    text: "Trinta milhões de reais em créditos intermediados com zero inadimplência jurídica e índice de satisfação acima de 95%. A Titanium foi reconhecida como referência no setor de cartas contempladas, citada em reportagens da Folha de S.Paulo e do portal InfoMoney como exemplo de operação segura.",
    accent: true,
  },
  {
    year: "2025",
    title: "Nova Plataforma Digital",
    text: "Relançamento completo da experiência digital: simulador inteligente com filtros avançados, painel de acompanhamento em tempo real, chat com consultores especializados e processo de compra 100% online com assinatura digital. Interface premium projetada para ser a mais intuitiva do mercado.",
  },
  {
    year: "2026",
    title: "O Futuro É Agora",
    text: "Mais de 2.000 clientes atendidos. Presença consolidada em todos os 26 estados e Distrito Federal. Equipe de 25 profissionais entre consultores, jurídico e tecnologia. A Titanium segue democratizando o acesso ao crédito inteligente — porque acreditamos que a casa própria, o carro novo e o crescimento do negócio não devem ser privilégio de poucos.",
    accent: true,
  },
];

export default function Timeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = timelineRef.current;
    if (!container) return;
    const items = container.querySelectorAll<HTMLElement>(".tl-item");
    const yearEls = container.querySelectorAll<HTMLElement>(".tl-year-bg");

    // Scroll-driven progress line
    const handleScroll = () => {
      if (!container || !progressRef.current) return;
      const rect = container.getBoundingClientRect();
      const windowH = window.innerHeight;
      const totalH = rect.height;
      const scrolled = Math.max(0, windowH * 0.5 - rect.top);
      const pct = Math.min(1, Math.max(0, scrolled / totalH));
      progressRef.current.style.height = `${pct * 100}%`;

      // Parallax for giant year numbers
      yearEls.forEach((el) => {
        const elRect = el.getBoundingClientRect();
        const center = elRect.top + elRect.height / 2;
        const offset = (windowH / 2 - center) * 0.08;
        el.style.transform = `translateY(${offset}px)`;
      });
    };

    // Intersection Observer for reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("tl-visible");
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );

    items.forEach((item) => observer.observe(item));
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main className="bg-white">
      {/* ═══ Hero ═══ */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--bg-dark) 0%, var(--green-deep) 60%, var(--bg-dark) 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-green-vivid/5" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-green-vivid/3" />
        </div>
        <div className="relative z-10 text-center px-6 py-24 max-w-4xl mx-auto">
          <span className="inline-block text-green-vivid text-xs font-[family-name:var(--font-jakarta)] font-bold uppercase tracking-[0.25em] mb-6">
            Nossa Trajetória
          </span>
          <h1 className="font-[family-name:var(--font-jakarta)] text-[clamp(2rem,6vw,4.5rem)] font-black leading-[1.05] text-white uppercase tracking-tight">
            Linha do Tempo
          </h1>
          <p className="mt-6 text-white/60 text-lg md:text-xl font-[family-name:var(--font-jakarta)] max-w-2xl mx-auto leading-relaxed">
            De 2005 a 2026 — cada marco que construiu a Titanium Consultoria.
          </p>
          {/* Scroll indicator */}
          <div className="mt-12 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-white/40 text-xs font-[family-name:var(--font-jakarta)] uppercase tracking-widest">Scroll</span>
            <svg width="20" height="28" viewBox="0 0 20 28" fill="none" className="text-white/40">
              <rect x="1" y="1" width="18" height="26" rx="9" stroke="currentColor" strokeWidth="2"/>
              <circle cx="10" cy="9" r="2" fill="currentColor" className="animate-pulse"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ═══ Timeline ═══ */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        {/* ShapeGrid background */}
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <ShapeGrid
              speed={0.25}
              squareSize={45}
              direction="up"
              borderColor="rgba(10,123,62,0.08)"
              hoverFillColor="rgba(21,184,92,0.06)"
              shape="hexagon"
              hoverTrailAmount={5}
            />
          </div>
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">

          {/* Timeline vertical line */}
          <div ref={timelineRef} className="relative">
            {/* Background line */}
            <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[2px] bg-green/10" />
            {/* Progress line */}
            <div
              ref={progressRef}
              className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 w-[2px] bg-gradient-to-b from-green via-green-vivid to-green transition-[height] duration-100 ease-out"
              style={{ height: "0%" }}
            />

            {/* Items */}
            <div className="space-y-20 md:space-y-32">
              {milestones.map((m, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <div
                    key={m.year}
                    className={`tl-item relative flex items-start gap-6 md:gap-0 ${
                      isLeft ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Dot */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                      <div
                        className={`w-5 h-5 rounded-full border-[3px] transition-all duration-500 ${
                          m.accent
                            ? "border-green-vivid bg-bg-dark scale-125 shadow-[0_0_24px_rgba(21,184,92,0.4)]"
                            : "border-green bg-white"
                        }`}
                      />
                    </div>

                    {/* Content card */}
                    <div
                      className={`ml-14 md:ml-0 md:w-[calc(50%-50px)] ${
                        isLeft ? "md:pr-0 md:mr-auto" : "md:pl-0 md:ml-auto"
                      }`}
                    >
                      <div
                        className={`group relative p-8 md:p-10 rounded-3xl border transition-all duration-700 overflow-hidden ${
                          m.accent
                            ? "bg-bg-dark border-green/20 hover:shadow-[0_20px_60px_rgba(10,123,62,0.15)]"
                            : "bg-white border-green/10 hover:border-green/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.05)]"
                        }`}
                      >
                        {/* Giant background year — parallax */}
                        <span
                          className={`tl-year-bg absolute -top-6 ${isLeft ? '-right-4' : '-left-4'} font-[family-name:var(--font-jakarta)] text-[clamp(10rem,22vw,18rem)] font-black leading-none tracking-tighter select-none pointer-events-none will-change-transform ${
                            m.accent ? "text-white/[0.04]" : "text-green/[0.03]"
                          }`}
                          aria-hidden="true"
                        >
                          {m.year}
                        </span>

                        {/* Year — visible */}
                        <span
                          className={`relative block font-[family-name:var(--font-jakarta)] text-[clamp(3.5rem,7vw,6rem)] font-black leading-none tracking-tight ${
                            m.accent ? "text-green-vivid" : "text-green/15"
                          }`}
                        >
                          {m.year}
                        </span>

                        {/* Title */}
                        <h3
                          className={`relative mt-4 font-[family-name:var(--font-jakarta)] text-xl md:text-2xl font-extrabold uppercase tracking-tight ${
                            m.accent ? "text-white" : "text-green"
                          }`}
                        >
                          {m.title}
                        </h3>

                        {/* Separator */}
                        <div className={`relative mt-4 w-12 h-[3px] rounded-full ${m.accent ? "bg-green-vivid/40" : "bg-green/10"}`} />

                        {/* Text */}
                        <p
                          className={`relative mt-4 text-base md:text-lg leading-relaxed font-[family-name:var(--font-jakarta)] ${
                            m.accent ? "text-white/70" : "text-ink-soft"
                          }`}
                        >
                          {m.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section
        className="py-20 md:py-28"
        style={{ background: "linear-gradient(135deg, var(--bg-dark) 0%, var(--green-deep) 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-[family-name:var(--font-jakarta)] text-[clamp(1.5rem,4vw,3rem)] font-black text-white uppercase tracking-tight leading-tight">
            Faça parte dessa<br />história
          </h2>
          <p className="mt-5 text-white/60 text-lg font-[family-name:var(--font-jakarta)] max-w-xl mx-auto">
            Conquiste seu próximo bem com quem entende do mercado há mais de 20 anos.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/5511951014269"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Falar no WhatsApp →
            </a>
            <a
              href="/"
              className="btn-outline-white"
            >
              Voltar ao site
            </a>
          </div>
        </div>
      </section>

      {/* ═══ CSS for immersive timeline animations ═══ */}
      <style jsx global>{`
        /* Base state — hidden, offset */
        .tl-item {
          opacity: 0;
          transform: translateY(3rem);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }

        /* Revealed state */
        .tl-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        /* Year background — parallax controlled by JS, no CSS animation */
        .tl-year-bg {
          will-change: transform;
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .tl-item {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .tl-year-bg {
            transform: none !important;
          }
        }
      `}</style>
    </main>
  );
}
