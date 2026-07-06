import type { Metadata } from "next";
import CartasTable from "@/components/CartasTable";

export const metadata: Metadata = {
  title: "Cartas Contempladas Disponíveis | Titanium Consultoria",
  description:
    "Curadoria de cartas contempladas verificadas pela Titanium. Crédito já aprovado para veículos e imóveis — com validação jurídica, sem sorteio.",
  openGraph: {
    title: "Cartas Contempladas Disponíveis | Titanium Consultoria",
    description:
      "Curadoria de cartas contempladas verificadas. Liquidez imediata para quem precisa de crédito agora.",
    url: "https://titaniumconsultorias.com.br/cartas-contempladas",
  },
};

export default function CartasContempladasPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F8F7F4", fontFamily: "var(--font-jakarta), sans-serif" }}>

      {/* Hero — Light, clean, professional */}
      <section style={{ backgroundColor: "#F8F7F4", borderBottom: "1px solid #E5E2DC" }} className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            {/* Kicker */}
            <div className="flex items-center gap-2 mb-5">
              <span style={{ backgroundColor: "#E8F5EE", color: "#0A7B3E", borderColor: "#D1ECDD" }}
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full border uppercase tracking-widest">
                Curadoria de Cartas
              </span>
            </div>

            <h1 style={{ color: "#1A1A1A" }} className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              Cartas Contempladas{" "}
              <span style={{ backgroundImage: "linear-gradient(100deg, #0A7B3E, #15B85C 55%, #06532A)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                verificadas
              </span>
              {" "}pela Titanium.
            </h1>

            <p style={{ color: "#4A4A4A" }} className="text-lg leading-relaxed mb-6">
              Somente quando houver disponibilidade real e com validação jurídica.
              Cada carta passa pela análise da nossa equipe antes de chegar até você.
            </p>

            <p style={{ color: "#8A8A8A" }} className="text-sm leading-relaxed">
              Selecione a carta ideal abaixo e solicite uma análise consultiva gratuita.
              Um especialista Titanium entra em contato para estruturar a operação.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-10 pt-8" style={{ borderTop: "1px solid #E5E2DC" }}>
              {[
                { label: "R$ 50M+",  sub: "em crédito intermediado" },
                { label: "+3.000",   sub: "operações estruturadas" },
                { label: "11",       sub: "administradoras parceiras" },
                { label: "4 anos",   sub: "de atuação no mercado" },
              ].map(({ label, sub }) => (
                <div key={label}>
                  <p style={{ color: "#0A7B3E" }} className="text-2xl font-bold">{label}</p>
                  <p style={{ color: "#8A8A8A" }} className="text-xs mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Table section */}
      <section className="py-10 px-4" style={{ backgroundColor: "#F8F7F4" }}>
        <div className="max-w-6xl mx-auto">
          <CartasTable />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 px-4" style={{ backgroundColor: "#EFEDE8", borderTop: "1px solid #E5E2DC" }}>
        <div className="max-w-xl mx-auto text-center">
          <span style={{ color: "#0A7B3E", backgroundColor: "#E8F5EE", borderColor: "#D1ECDD" }}
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full border uppercase tracking-widest mb-4">
            Análise Consultiva
          </span>
          <h2 style={{ color: "#1A1A1A" }} className="text-2xl font-bold mb-3">
            Não encontrou a carta ideal?
          </h2>
          <p style={{ color: "#4A4A4A" }} className="text-sm leading-relaxed mb-6">
            Nosso estoque é atualizado com frequência. Entre em contato e apresentamos
            outras opções disponíveis — sem compromisso.
          </p>
          <a
            href="https://wa.me/5511930048940?text=Olá! Gostaria de verificar opções de cartas contempladas disponíveis."
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: "#0A7B3E", color: "#FFFFFF" }}
            className="inline-block font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity duration-200 cursor-pointer text-sm"
          >
            Solicitar análise consultiva
          </a>
          <p style={{ color: "#8A8A8A" }} className="text-xs mt-4">
            Sem pressão de venda. Orientação estratégica.
          </p>
        </div>
      </section>

    </main>
  );
}
