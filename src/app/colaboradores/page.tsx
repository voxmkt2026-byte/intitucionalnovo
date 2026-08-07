import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Titanium Colaboradores | Programa de Parcerias",
  description: "Monetize sua rede de contatos indicando cartas contempladas para produtores rurais, empresários e profissionais liberais.",
};

export default function ColaboradoresPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#0b0f19] text-[#f8f7f4] font-jakarta selection:bg-emerald-500 selection:text-white overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 flex flex-col items-center justify-center text-center px-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
              Programa de Parcerias Titanium
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Monetize sua rede de contatos com <span className="text-emerald-400">cartas contempladas</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-light leading-relaxed">
              Indique produtores rurais, empresários e investidores que precisam de crédito inteligente para expandir patrimônio sem pagar juros bancários.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="/colaboradores/cadastro/"
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] text-sm tracking-wide uppercase"
              >
                Quero me Cadastrar
              </Link>
              <Link
                href="/colaboradores/portal/"
                className="px-8 py-4 border border-gray-700 hover:border-gray-500 hover:bg-gray-800/30 text-white font-semibold rounded-xl transition-all text-sm tracking-wide"
              >
                Acessar meu Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Bento Grid: Como Funciona */}
        <section className="max-w-6xl mx-auto px-4 py-16 border-t border-gray-800">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-bold text-white">Como Funciona a Parceria</h2>
            <p className="text-gray-400 font-light">Uma esteira simples, transparente e sem burocracia para você comissionar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-gray-900/40 border border-gray-800/80 backdrop-blur-md space-y-4 hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-semibold text-white">Cadastro Exclusivo</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Preencha o formulário operacional contendo seu perfil e valide o termo digitalmente em minutos.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-gray-900/40 border border-gray-800/80 backdrop-blur-md space-y-4 hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-semibold text-white">Indique Clientes</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Utilize seu link exclusivo de indicação ou cadastre as oportunidades diretamente do seu painel do colaborador.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-gray-900/40 border border-gray-800/80 backdrop-blur-md space-y-4 hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-semibold text-white">Receba sua Comissão</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Acompanhe o fechamento das propostas. A comissão é calculada e creditada diretamente na sua conta PIX.
              </p>
            </div>
          </div>
        </section>

        {/* Seção de Diferenciais */}
        <section className="bg-gray-950/45 py-20 border-t border-gray-900">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Um ecossistema desenhado para <span className="text-emerald-400">proteger</span> o colaborador
              </h2>
              <p className="text-gray-400 font-light leading-relaxed">
                Nós sabemos que a maior dor do consultor colaborador é a segurança de que o cliente indicado permanecerá em sua carteira. Criamos uma esteira que blinda seu cliente contra disputas comerciais.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Integração de Origem Permanente</h4>
                    <p className="text-gray-400 text-xs font-light">Seu ID é inserido permanentemente nos CRMs de vendas (Kommo e Agendor).</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Transparência via Dashboard</h4>
                    <p className="text-gray-400 text-xs font-light">Visualize em tempo real em qual etapa comercial sua indicação se encontra.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Kit de Vendas Atualizado</h4>
                    <p className="text-gray-400 text-xs font-light">Tabelas comerciais de crédito atualizadas e roteiros para contornar objeções.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative rounded-2xl border border-gray-800 bg-gray-900/60 p-8 shadow-2xl space-y-6">
              <div className="absolute -top-3 -right-3 px-3 py-1 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                Exclusivo
              </div>
              <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-4">Assine e Comece Hoje</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Toda a operação comercial da Titanium segue as regras do Banco Central e as diretrizes do nosso playbook de compliance. Ao se cadastrar, você assina o Termo de Parceria e garante conformidade jurídica.
              </p>
              <div className="pt-4">
                <Link
                  href="/colaboradores/cadastro/"
                  className="w-full inline-flex justify-center items-center px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-all text-xs tracking-wider uppercase"
                >
                  Cadastre-se Agora
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
