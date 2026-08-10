import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CadastroForm from "@/components/CadastroForm";
import BeamsWrapper from "@/components/BeamsWrapper";

export const metadata = {
  title: "Titanium Colaboradores | Programa de Parcerias",
  description: "Monetize sua rede de contatos indicando cartas contempladas para produtores rurais, empresários e profissionais liberais.",
};

export default function ColaboradoresPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white text-slate-800 font-jakarta selection:bg-[#0A7B3E] selection:text-white overflow-hidden">
        
        {/* Hero Section with 3D Beams Background */}
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden min-h-[90vh] flex items-center bg-[#0b0f19]">
          {/* Beams Background Overlay */}
          <div className="absolute inset-0 z-0 opacity-80">
            <BeamsWrapper />
          </div>
          
          {/* Dark overlay to ensure text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-[#0b0f19]/70 z-1 pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copywriting & Value Prop */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#15B85C]/10 border border-[#15B85C]/20 text-[#15B85C] text-[10px] font-bold tracking-wider uppercase">
                Programa de Parcerias Titanium
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Monetize sua rede de contatos com <span className="text-[#15B85C] bg-gradient-to-r from-[#15B85C] to-[#0D9E50] bg-clip-text text-transparent">crédito inteligente</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed max-w-xl">
                Indique produtores rurais, empresários e investidores que necessitam de liquidez imediata para expandir patrimônio ou frotas, livre de juros bancários.
              </p>
              
              <div className="space-y-3.5 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#15B85C]/10 flex items-center justify-center text-[#15B85C] shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-slate-200 text-xs font-semibold">Comissão direta creditada na sua conta PIX</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#15B85C]/10 flex items-center justify-center text-[#15B85C] shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-slate-200 text-xs font-semibold">Blindagem de leads permanente vinculada ao seu ID</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#15B85C]/10 flex items-center justify-center text-[#15B85C] shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-slate-200 text-xs font-semibold">Kit de suporte comercial ativo e tabelas atualizadas</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/colaboradores/portal/"
                  className="px-6 py-3 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/30 text-white font-bold rounded-xl transition-all text-xs tracking-wider uppercase cursor-pointer"
                >
                  Acessar meu Portal
                </Link>
              </div>
            </div>

            {/* Right Column: Multi-Step Registration Form Card */}
            <div className="lg:col-span-6 w-full">
              <CadastroForm />
            </div>
          </div>
        </section>

        {/* Bento Grid: Como Funciona (Light Mode) */}
        <section className="max-w-6xl mx-auto px-4 py-20 bg-white">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[10px] font-bold text-[#0A7B3E] uppercase tracking-widest bg-[#E8F5EE] px-3 py-1.5 rounded-full">
              Etapas
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Como Funciona a Parceria</h2>
            <p className="text-slate-500 font-light text-sm max-w-md mx-auto">Uma esteira simples, transparente e sem burocracia para você comissionar com segurança.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-4 hover:border-[#0A7B3E]/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E] font-bold text-sm group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cadastro Exclusivo</h3>
              <p className="text-slate-500 text-xs font-light leading-relaxed">
                Preencha o formulário operacional contendo seu perfil e dados bancários e assine digitalmente em minutos.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-4 hover:border-[#0A7B3E]/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E] font-bold text-sm group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Indique Clientes</h3>
              <p className="text-slate-500 text-xs font-light leading-relaxed">
                Insira as informações do cliente de interesse nas cartas disponíveis diretamente no seu painel para validação.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-4 hover:border-[#0A7B3E]/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E] font-bold text-sm group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Receba sua Comissão</h3>
              <p className="text-slate-500 text-xs font-light leading-relaxed">
                Acompanhe o fechamento das propostas. A comissão é apurada e creditada na sua conta PIX cadastrada.
              </p>
            </div>
          </div>
        </section>

        {/* Seção de Diferenciais (Light Mode) */}
        <section className="bg-slate-50/50 py-20 border-t border-slate-100">
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
      </main>
      <Footer />
    </>
  );
}
