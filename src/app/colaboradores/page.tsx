import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CadastroForm from "@/components/CadastroForm";
import BeamsWrapper from "@/components/BeamsWrapper";
import ColabTestimonials from "@/components/ColabTestimonials";

export const metadata = {
  title: "Titanium Colaboradores | Programa de Parcerias",
  description: "Monetize sua rede de contatos indicando cartas contempladas para produtores rurais, empresários e profissionais liberais.",
};

export default function ColaboradoresPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white text-slate-800 font-jakarta selection:bg-[#0A7B3E] selection:text-white overflow-hidden">
        
        {/* ═══════════════════════════════════════════════════════
            SEÇÃO 1 — HERO (Dark, full-width, sem formulário)
            Foco: capturar atenção e gerar interesse
        ═══════════════════════════════════════════════════════ */}
        <section className="relative pt-28 pb-24 md:pt-36 md:pb-32 overflow-hidden min-h-[85vh] flex items-center bg-[#0b0f19]">
          {/* Beams Background */}
          <div className="absolute inset-0 z-0 opacity-80">
            <BeamsWrapper />
          </div>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-[#0b0f19]/70 z-[1] pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 w-full relative z-10 text-center space-y-8">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#15B85C]/10 border border-[#15B85C]/20 text-[#15B85C] text-[10px] font-bold tracking-wider uppercase">
              Programa de Parcerias Titanium
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Monetize sua rede de contatos com{" "}
              <span className="bg-gradient-to-r from-[#15B85C] to-[#0D9E50] bg-clip-text text-transparent">
                crédito inteligente
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
              Indique produtores rurais, empresários e investidores que necessitam de liquidez imediata para expandir patrimônio ou frotas, livre de juros bancários.
            </p>
            
            {/* Value Props — horizontal pills */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <div className="w-4 h-4 rounded-full bg-[#15B85C]/20 flex items-center justify-center text-[#15B85C] shrink-0">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-slate-200 text-xs font-medium">Comissão direta no PIX</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <div className="w-4 h-4 rounded-full bg-[#15B85C]/20 flex items-center justify-center text-[#15B85C] shrink-0">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-slate-200 text-xs font-medium">Blindagem de leads</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <div className="w-4 h-4 rounded-full bg-[#15B85C]/20 flex items-center justify-center text-[#15B85C] shrink-0">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-slate-200 text-xs font-medium">Kit comercial completo</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="#cadastro"
                className="px-8 py-3.5 bg-[#0A7B3E] hover:bg-[#086332] text-white font-bold rounded-xl transition-all text-sm tracking-wider uppercase cursor-pointer shadow-lg shadow-[#0A7B3E]/20 hover:shadow-xl hover:shadow-[#0A7B3E]/30"
              >
                Quero ser Parceiro
              </a>
              <Link
                href="/colaboradores/portal/"
                className="px-6 py-3 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/30 text-white font-bold rounded-xl transition-all text-xs tracking-wider uppercase cursor-pointer"
              >
                Acessar meu Portal
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SEÇÃO 2 — COMO FUNCIONA (Light, 3 cards Bento)
            Foco: explicar o processo em 3 etapas
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-gradient-to-b from-white to-slate-50/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center space-y-3 mb-16">
              <span className="text-[10px] font-bold text-[#0A7B3E] uppercase tracking-widest bg-[#E8F5EE] px-3 py-1.5 rounded-full">
                Etapas
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Como Funciona a Parceria</h2>
              <p className="text-slate-500 font-light text-sm max-w-md mx-auto">Uma esteira simples, transparente e sem burocracia para você comissionar com segurança.</p>
            </div>

            {/* Progress connector line (desktop only) */}
            <div className="hidden md:block relative mb-8">
              <div className="absolute top-5 left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-[#D1ECDD] via-[#0A7B3E]/20 to-[#D1ECDD] rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Card 1 */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200/60 space-y-4 hover:border-[#0A7B3E]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E] font-extrabold text-sm group-hover:scale-105 transition-transform shadow-sm">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900">Cadastro Exclusivo</h3>
                <p className="text-slate-500 text-xs font-light leading-relaxed">
                  Preencha o formulário operacional contendo seu perfil e dados bancários e assine digitalmente em minutos.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200/60 space-y-4 hover:border-[#0A7B3E]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E] font-extrabold text-sm group-hover:scale-105 transition-transform shadow-sm">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900">Indique Clientes</h3>
                <p className="text-slate-500 text-xs font-light leading-relaxed">
                  Insira as informações do cliente de interesse nas cartas disponíveis diretamente no seu painel para validação.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200/60 space-y-4 hover:border-[#0A7B3E]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E] font-extrabold text-sm group-hover:scale-105 transition-transform shadow-sm">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900">Receba sua Comissão</h3>
                <p className="text-slate-500 text-xs font-light leading-relaxed">
                  Acompanhe o fechamento das propostas. A comissão é apurada e creditada na sua conta PIX cadastrada.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SEÇÃO 3 — PROVA SOCIAL (Testimonials de Colaboradores)
            Foco: construir confiança com relatos reais
        ═══════════════════════════════════════════════════════ */}
        <ColabTestimonials />

        {/* ═══════════════════════════════════════════════════════
            SEÇÃO 4 — DIFERENCIAIS + COMPLIANCE (Slate)
            Foco: reforçar segurança e profissionalismo
        ═══════════════════════════════════════════════════════ */}
        <section className="bg-slate-50 py-20 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Benefícios */}
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                Um ecossistema desenhado para <span className="text-[#0A7B3E]">proteger</span> o colaborador
              </h2>
              <p className="text-slate-500 font-light text-sm leading-relaxed">
                Nós blindamos sua indicação. Uma vez integrada, a Titanium garante que o lead permanecerá sob sua carteira, eliminando conflitos de concorrência ou disputas de atribuição.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0A7B3E] shrink-0 mt-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Origem Permanente</h4>
                    <p className="text-slate-500 text-[11px] font-light leading-relaxed">Seu ID é gravado permanentemente nos CRMs de vendas corporativos (Kommo/Agendor).</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0A7B3E] shrink-0 mt-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Transparência Total</h4>
                    <p className="text-slate-500 text-[11px] font-light leading-relaxed">Acompanhe pelo painel cada etapa da negociação e o status da sua comissão em tempo real.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0A7B3E] shrink-0 mt-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Kit Comercial Completo</h4>
                    <p className="text-slate-500 text-[11px] font-light leading-relaxed">Acesso às propostas atualizadas, tabelas comerciais e scripts de abordagem prontos.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Compliance Box */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-lg space-y-6">
              <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-lg bg-[#0A7B3E] text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                Conformidade
              </div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Termo Jurídico & Playbook</h3>
              <p className="text-slate-500 text-xs font-light leading-relaxed">
                Todas as operações comerciais da Titanium Consultoria são reguladas conforme a legislação do Banco Central e as normas vigentes. Nosso compromisso é de integridade absoluta, sem taxas ocultas ou falsas promessas de contemplação acelerada.
              </p>
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide mb-1">Dúvidas Frequentes?</span>
                <p className="text-[11px] text-slate-500 leading-normal font-light">
                  Nossos termos de parceria garantem a exclusividade e pagamento em contrato. Para suporte direto, fale com o suporte pelo WhatsApp no portal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SEÇÃO 5 — FORMULÁRIO DE CADASTRO (Dark, dedicado)
            Foco: converter — o visitante chega aqui convencido
        ═══════════════════════════════════════════════════════ */}
        <section id="cadastro" className="relative py-20 md:py-28 bg-[#0b0f19] overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0A7B3E]/10 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-6xl mx-auto px-4 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Headline + Trust signals */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#15B85C]/10 border border-[#15B85C]/20 text-[#15B85C] text-[10px] font-bold tracking-wider uppercase">
                Cadastro Gratuito
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                Pronto para{" "}
                <span className="bg-gradient-to-r from-[#15B85C] to-[#0D9E50] bg-clip-text text-transparent">
                  comissionar?
                </span>
              </h2>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                Preencha o formulário rápido ao lado, crie sua senha de acesso e entre para a rede de parceiros da Titanium com dashboard exclusivo para acompanhar suas indicações e comissões.
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#15B85C]/10 flex items-center justify-center text-[#15B85C] shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-slate-300 text-xs font-medium">Cadastro rápido em 3 etapas simples</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#15B85C]/10 flex items-center justify-center text-[#15B85C] shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-slate-300 text-xs font-medium">Acesso imediato com e-mail e senha</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#15B85C]/10 flex items-center justify-center text-[#15B85C] shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-slate-300 text-xs font-medium">Dashboard exclusivo com rastreamento de vendas</span>
                </div>
              </div>

              {/* Compliance badge */}
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-4">
                <svg className="w-5 h-5 text-[#15B85C] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span className="text-slate-400 text-[11px] font-light leading-relaxed">
                  Operação regulada pelo Banco Central. Compliance comercial auditável.
                </span>
              </div>
            </div>

            {/* Right Column: Registration Form */}
            <div className="lg:col-span-7 w-full">
              <CadastroForm />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
