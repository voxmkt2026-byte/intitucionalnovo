import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CadastroForm from "@/components/CadastroForm";
import BeamsWrapper from "@/components/BeamsWrapper";
import ColabTestimonials from "@/components/ColabTestimonials";

export const metadata = {
  title: "Titanium Colaboradores | Programa de Parcerias Comerciais",
  description: "Monetize sua rede de contatos com crédito inteligente e cartas contempladas. Mesa técnica dedicada, blindagem de leads no CRM e comissão direta no PIX.",
};

export default function ColaboradoresPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white text-slate-800 font-jakarta selection:bg-[#0A7B3E] selection:text-white overflow-hidden">
        
        {/* ═══════════════════════════════════════════════════════
            SEÇÃO 1 — HERO COM FORMULÁRIO EM 1º LUGAR (Dark, 2 colunas)
            HORMOZI COPY: $100M Offers aplicada à captação de parceiros
            REGRA: Formulário no topo da página acima da dobra
        ═══════════════════════════════════════════════════════ */}
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden min-h-[92vh] flex items-center bg-[#0b0f19]">
          {/* Beams Background Overlay */}
          <div className="absolute inset-0 z-0 opacity-80">
            <BeamsWrapper />
          </div>
          
          {/* Dark overlay to ensure text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-[#0b0f19]/70 z-[1] pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Copywriting Hormozi & Value Stack */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#15B85C]/10 border border-[#15B85C]/20 text-[#15B85C] text-[10px] font-bold tracking-wider uppercase">
                Programa de Parcerias Titanium
              </span>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.15]">
                Monetize sua rede de contatos com{" "}
                <span className="bg-gradient-to-r from-[#15B85C] to-[#0D9E50] bg-clip-text text-transparent">
                  crédito inteligente
                </span>
              </h1>
              
              <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed max-w-xl">
                Você conecta clientes que precisam de liquidez para imóveis, frotas ou agronegócio. Nossa mesa técnica conduz a análise consultiva, estrutura a operação e a <strong className="text-white font-semibold">comissão é creditada direto no seu PIX</strong>.
              </p>
              
              {/* Hormozi Value Stack: Redução de Esforço + Maximização de Certeza */}
              <div className="space-y-3.5 pt-4 border-t border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#15B85C]/10 flex items-center justify-center text-[#15B85C] shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Mesa Técnica Dedicada</h4>
                    <p className="text-[11px] text-slate-400 font-light leading-relaxed">Você não precisa ser especialista em consórcios. Nossos consultores sêniores conduzem o diagnóstico e o fechamento.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#15B85C]/10 flex items-center justify-center text-[#15B85C] shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Blindagem Vitalícia de Leads</h4>
                    <p className="text-[11px] text-slate-400 font-light leading-relaxed">Seu cliente é vinculado ao seu ID exclusivo no CRM. Sem disputas comerciais internas.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#15B85C]/10 flex items-center justify-center text-[#15B85C] shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Dashboard & Catálogo em Tempo Real</h4>
                    <p className="text-[11px] text-slate-400 font-light leading-relaxed">Acompanhe o andamento das propostas, comissões apuradas e estoque de cartas contempladas ativas.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/colaboradores/portal/"
                  className="px-6 py-3 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/40 text-white font-bold rounded-xl transition-all text-xs tracking-wider uppercase cursor-pointer"
                >
                  Acessar meu Portal
                </Link>
                <span className="text-[11px] text-slate-400 font-light">
                  Sem taxa de adesão • Contrato digital com validade jurídica
                </span>
              </div>
            </div>

            {/* Right Column: Multi-Step Registration Form Card (Hero First) */}
            <div className="lg:col-span-6 w-full" id="cadastro">
              <CadastroForm />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SEÇÃO 2 — COMO FUNCIONA (Esteira Hormozi de 3 Passos)
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center space-y-3 mb-16">
              <span className="text-[10px] font-bold text-[#0A7B3E] uppercase tracking-widest bg-[#E8F5EE] px-3 py-1.5 rounded-full">
                Esteira Comercial
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Como Funciona a Parceria</h2>
              <p className="text-slate-500 font-light text-sm max-w-lg mx-auto">
                Um modelo desenhado para você rentabilizar relacionamentos sem assumir o desgaste operacional.
              </p>
            </div>

            {/* Progress connector line (desktop only) */}
            <div className="hidden md:block relative mb-8">
              <div className="absolute top-5 left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-[#D1ECDD] via-[#0A7B3E]/20 to-[#D1ECDD] rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Card 1 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-4 hover:border-[#0A7B3E]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group shadow-sm text-left">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E] font-extrabold text-sm group-hover:scale-105 transition-transform shadow-sm">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900">Indique em Segundos</h3>
                <p className="text-slate-500 text-xs font-light leading-relaxed">
                  Cadastre o cliente de interesse diretamente pelo seu painel ou compartilhe seu link exclusivo de parceiro. O lead fica imediatamente blindado sob o seu ID.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-4 hover:border-[#0A7B3E]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group shadow-sm text-left">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E] font-extrabold text-sm group-hover:scale-105 transition-transform shadow-sm">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900">Mesa Técnica Conduz</h3>
                <p className="text-slate-500 text-xs font-light leading-relaxed">
                  Nossa equipe de consultores sêniores faz o diagnóstico do cliente, apresenta as melhores oportunidades de cartas ou consórcio e cuida da aprovação documental.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-4 hover:border-[#0A7B3E]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group shadow-sm text-left">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E] font-extrabold text-sm group-hover:scale-105 transition-transform shadow-sm">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900">Comissão no seu PIX</h3>
                <p className="text-slate-500 text-xs font-light leading-relaxed">
                  Após a liquidação da cota e formalização com a administradora, sua comissão pactuada em contrato é transferida diretamente para sua conta bancária/PIX.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SEÇÃO 3 — PROVA SOCIAL (Testimonials de Colaboradores)
        ═══════════════════════════════════════════════════════ */}
        <ColabTestimonials />

        {/* ═══════════════════════════════════════════════════════
            SEÇÃO 4 — DIFERENCIAIS, COMPARAÇÃO & COMPLIANCE
        ═══════════════════════════════════════════════════════ */}
        <section className="bg-slate-50 py-20 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Benefícios Estruturais */}
            <div className="space-y-6 text-left">
              <span className="text-[10px] font-bold text-[#0A7B3E] uppercase tracking-widest bg-[#E8F5EE] px-3 py-1.5 rounded-full">
                Por que a Titanium?
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                Um ecossistema desenhado para <span className="text-[#0A7B3E]">proteger e valorizar</span> o parceiro
              </h2>
              <p className="text-slate-500 font-light text-sm leading-relaxed">
                Operar no mercado financeiro e de cartas contempladas de forma autônoma exige lidar com burocracia pesada, risco de fraudes e esteiras bancárias lentas. Na Titanium, você conta com estrutura institucional completa.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0A7B3E] shrink-0 mt-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Origem & Histórico Permanente</h4>
                    <p className="text-slate-500 text-[11px] font-light leading-relaxed">Seu ID é gravado nos CRMs corporativos da Titanium, garantindo comissionamento mesmo em compras futuras do mesmo cliente.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0A7B3E] shrink-0 mt-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Transparência Total de Negociação</h4>
                    <p className="text-slate-500 text-[11px] font-light leading-relaxed">Acompanhe pelo painel cada etapa da negociação, histórico de contato e previsão de liquidação em tempo real.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0A7B3E] shrink-0 mt-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Kit Comercial & Scripts Validados</h4>
                    <p className="text-slate-500 text-[11px] font-light leading-relaxed">Acesso a argumentos de abordagem comercial, comparativos com financiamentos bancários e tabelas atualizadas.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Compliance Box */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-lg space-y-6 text-left">
              <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-lg bg-[#0A7B3E] text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                Conformidade BACEN
              </div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Compliance Comercial & Segurança Jurídica</h3>
              <p className="text-slate-500 text-xs font-light leading-relaxed">
                Todas as operações de consórcio e assessoria em cartas contempladas intermediadas pela Titanium Consultoria seguem estritamente as diretrizes da Lei nº 11.795/2008 e as normas do Banco Central do Brasil.
              </p>
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-600 font-bold block uppercase tracking-wide">Aviso Regulatório Obrigatório</span>
                <p className="text-[11px] text-slate-500 leading-normal font-light">
                  A disponibilidade de cartas, valores, parcelas, prazos e transferência da titularidade estão sujeitas à análise cadastral, documentação exigida e aprovação expressa da respectiva administradora de consórcios autorizada.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SEÇÃO 5 — CTA FINAL
        ═══════════════════════════════════════════════════════ */}
        <section className="py-16 bg-[#0b0f19] text-center border-t border-slate-800">
          <div className="max-w-3xl mx-auto px-4 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Pronto para transformar seus contatos em comissões?
            </h3>
            <p className="text-slate-400 text-sm font-light leading-relaxed">
              Junte-se a corretores, consultores e empresários que já utilizam a infraestrutura da Titanium em todo o Brasil.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#cadastro"
                className="px-8 py-3.5 bg-[#0A7B3E] hover:bg-[#086332] text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-[#0A7B3E]/20 hover:shadow-xl hover:shadow-[#0A7B3E]/30 cursor-pointer"
              >
                Preencher Cadastro no Topo ↑
              </a>
              <Link
                href="/colaboradores/portal/"
                className="px-6 py-3.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/40 text-white font-bold rounded-xl transition-all text-xs tracking-wider uppercase cursor-pointer"
              >
                Já sou parceiro (Login)
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
