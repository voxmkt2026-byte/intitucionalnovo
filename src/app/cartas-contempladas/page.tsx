import type { Metadata } from "next";
import CartasTable from "@/components/CartasTable";

export const metadata: Metadata = {
  title: "Cartas Contempladas Disponíveis | Titanium Consultoria",
  description:
    "Confira as cartas contempladas disponíveis agora. Veículos, imóveis e mais — com crédito imediato, entrada acessível e parcelas que cabem no seu bolso.",
  openGraph: {
    title: "Cartas Contempladas Disponíveis | Titanium Consultoria",
    description:
      "Compre uma carta contemplada e acesse crédito imediato. Veja as opções disponíveis agora.",
    url: "https://titaniumconsultorias.com.br/cartas-contempladas",
  },
};

export default function CartasContempladasPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-[#1a1a2e] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-[#C41E3A]/20 text-[#ff6b7a] text-xs font-bold px-3 py-1.5 rounded-full mb-5 border border-[#C41E3A]/30 uppercase tracking-wider">
              ⚡ Estoque atualizado — sem sorteio, sem espera
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Crédito de{" "}
              <span className="text-[#C41E3A]">R$ 15 mil a R$ 2 milhões</span>
              <span className="block">disponível agora.</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              Enquanto a maioria espera ser sorteada — você pode ter o crédito <strong className="text-white">na sua mão esta semana.</strong>{" "}
              Uma carta contemplada te dá acesso imediato ao bem que você quer: carro, casa, máquina, investimento.
            </p>
            <p className="text-gray-400 text-sm">
              Escolha a carta ideal abaixo → clique em <strong className="text-[#C41E3A]">QUERO ESSE CRÉDITO</strong> → um consultor entra em contato nas próximas horas.
            </p>

            <div className="flex flex-wrap gap-8 mt-8 pt-8 border-t border-white/10">
              {[
                { label: "R$ 50M+", sub: "em crédito já acessado" },
                { label: "+3.000",  sub: "clientes contemplados" },
                { label: "11",     sub: "administradoras parceiras" },
                { label: "4 anos", sub: "de operação no mercado" },
              ].map(({ label, sub }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-[#C41E3A]">{label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Table section */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <CartasTable />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#1a1a2e] text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Não encontrou o que procura?</h2>
          <p className="text-gray-400 mb-6">
            Nosso estoque é atualizado constantemente. Entre em contato e descubra
            outras opções disponíveis.
          </p>
          <a
            href="https://wa.me/5511930048940?text=Olá! Não encontrei a carta que procuro no site. Podem me ajudar?"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#C41E3A] hover:bg-[#a01830] text-white font-semibold px-8 py-4 rounded-2xl transition-colors duration-200 cursor-pointer"
          >
            Falar com um consultor
          </a>
        </div>
      </section>
    </main>
  );
}
