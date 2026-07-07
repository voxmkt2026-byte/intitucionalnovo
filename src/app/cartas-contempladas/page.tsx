import type { Metadata } from "next";
import CartasTable from "@/components/CartasTable";
import { HexagonPattern } from "@/components/HexagonPattern";

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

      {/* Hero ── dark premium com hexagon grid */}
      <section className="relative overflow-hidden py-20 px-4" style={{ backgroundColor: "#0B1610", minHeight: "360px" }}>

        {/* Hexagon grid background */}
        <HexagonPattern
          radius={38}
          gap={6}
          direction="horizontal"
          hexagons={[
            [1, 1], [2, 2], [3, 1], [4, 2], [5, 1],
            [6, 0], [7, 1], [8, 2], [9, 1], [10, 2],
            [2, 0], [4, 0], [6, 2], [8, 0],
            [0, 2], [1, 3], [3, 3], [5, 3], [7, 3],
          ]}
          className="opacity-[0.18]"
          style={{
            stroke: "#0A7B3E",
            fill: "#0A7B3E",
          }}
        />

        {/* Radial glow — centro-esquerda */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 20% 50%, rgba(10,123,62,0.18) 0%, transparent 65%), radial-gradient(ellipse 40% 60% at 75% 80%, rgba(21,184,92,0.08) 0%, transparent 60%)",
          }}
        />

        {/* Fade-out para baixo (transição para o conteúdo claro) */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
          style={{
            background: "linear-gradient(to bottom, transparent, #0B1610)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="max-w-2xl">

            {/* Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest border"
                style={{ backgroundColor: "rgba(10,123,62,0.2)", color: "#4ADE80", borderColor: "rgba(10,123,62,0.4)" }}
              >
                <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
                  <circle cx="3" cy="3" r="3" />
                </svg>
                Curadoria de Cartas
              </span>
            </div>

            {/* H1 */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6"
              style={{ color: "#F0EDEA", letterSpacing: "-0.02em" }}
            >
              Cartas Contempladas{" "}
              <span
                style={{
                  backgroundImage: "linear-gradient(110deg, #4ADE80 0%, #15B85C 45%, #0A7B3E 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                verificadas
              </span>{" "}
              pela Titanium.
            </h1>

            {/* Descrição */}
            <p className="text-base md:text-lg leading-relaxed mb-3" style={{ color: "rgba(240,237,234,0.7)" }}>
              Somente quando houver disponibilidade real e com validação jurídica.
              Cada carta passa pela análise da nossa equipe antes de chegar até você.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(240,237,234,0.4)" }}>
              Selecione a carta ideal abaixo e solicite uma análise consultiva gratuita.
              Um especialista Titanium entra em contato para estruturar a operação.
            </p>

            {/* Stats */}
            <div
              className="flex flex-wrap gap-8 mt-10 pt-8"
              style={{ borderTop: "1px solid rgba(10,123,62,0.25)" }}
            >
              {[
                { label: "R$ 50M+",  sub: "em crédito intermediado" },
                { label: "+3.000",   sub: "operações estruturadas" },
                { label: "11",       sub: "administradoras parceiras" },
                { label: "4 anos",   sub: "de atuação no mercado" },
              ].map(({ label, sub }) => (
                <div key={label}>
                  <p className="text-2xl md:text-3xl font-bold" style={{ color: "#4ADE80" }}>
                    {label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(240,237,234,0.45)" }}>
                    {sub}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Separador de transição dark → light */}
      <div
        className="h-8"
        style={{
          background: "linear-gradient(to bottom, #0B1610, #F8F7F4)",
        }}
      />

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
