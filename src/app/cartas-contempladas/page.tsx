import type { Metadata } from "next";
import CartasTable from "@/components/CartasTable";
import { HexagonPattern } from "@/components/HexagonPattern";
import { BentoStats } from "@/components/BentoStats";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

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
    <>
      <Navbar />
      <main
        className="min-h-screen relative overflow-x-hidden"
        style={{ backgroundColor: "#FFFFFF", fontFamily: "var(--font-jakarta), sans-serif" }}
      >

      {/* ═══════════════════════════════════════════════
          SEÇÃO 1 — PAINEL DE CONSULTA (ACIMA DA DOBRA)
          fundo branco, tabela + filtros no topo
      ═══════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-16 px-4">

        {/* Glow verde suave no topo */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.07) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">

          {/* Header contextual da seção */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border uppercase tracking-widest"
                style={{
                  backgroundColor: "rgba(16,185,129,0.08)",
                  color: "#10b981",
                  borderColor: "rgba(16,185,129,0.25)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse inline-block" />
                Painel de Consulta
              </span>
              <span
                className="hidden sm:inline text-xs font-medium"
                style={{ color: "#9ca3af" }}
              >
                Cartas verificadas pela equipe Titanium
              </span>
            </div>

            <a
              href="https://wa.me/5511930048940?text=Olá! Gostaria de verificar opções de cartas contempladas disponíveis."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#10b981", color: "#FFFFFF" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.089.534 4.055 1.475 5.77L0 24l6.407-1.453A11.957 11.957 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.497-5.22-1.367l-.375-.222-3.887.882.913-3.781-.244-.39A9.941 9.941 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Falar com consultor
            </a>
          </div>

          {/* CartasTable — inclui filtros internamente */}
          <CartasTable />

        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SEÇÃO 2 — COPY INSTITUCIONAL + BENTO STATS
          fundo preto #05070a com hexagon grid
      ═══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-24 px-4"
        style={{ backgroundColor: "#05070a" }}
      >
        {/* Hexagon grid */}
        <HexagonPattern
          radius={36}
          gap={8}
          direction="horizontal"
          hexagons={[
            [1, 1], [3, 1], [5, 0], [7, 1], [9, 2],
            [2, 2], [4, 2], [6, 2], [8, 1], [10, 0],
            [0, 0], [1, 3], [3, 3], [5, 2], [7, 3],
          ]}
          className="opacity-[0.15]"
          style={{ stroke: "#10b981", fill: "#10b981" }}
        />

        {/* Glow esquerdo */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 15% 50%, rgba(16,185,129,0.10) 0%, transparent 65%)",
          }}
        />
        {/* Glow direito inferior */}
        <div
          className="pointer-events-none absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{
            background: "rgba(5,40,25,0.6)",
            filter: "blur(120px)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* ── Esquerda: copy institucional ── */}
          <div className="lg:col-span-7 space-y-6">

            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide border"
              style={{
                backgroundColor: "rgba(16,185,129,0.08)",
                borderColor: "rgba(16,185,129,0.25)",
                color: "#10b981",
              }}
            >
              🔒 CURADORIA DE CARTAS
            </div>

            <h1
              className="text-3xl md:text-5xl font-black tracking-tight leading-[1.15]"
              style={{ color: "#FFFFFF", letterSpacing: "-0.02em" }}
            >
              Cartas Contempladas{" "}
              <br className="hidden md:block" />
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(110deg, #6ee7b7 0%, #10b981 45%, #059669 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                verificadas
              </span>{" "}
              pela Titanium.
            </h1>

            <div className="space-y-3 max-w-xl">
              <p
                className="text-base md:text-lg leading-relaxed font-medium"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Somente quando houver disponibilidade real e com validação jurídica.
                Cada carta passa pela análise da nossa equipe antes de chegar até você.
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Selecione a carta ideal acima e solicite uma análise consultiva
                gratuita. Um especialista Titanium entra em contato para estruturar
                a operação.
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                "✓ Validação jurídica",
                "✓ Sem burocracia",
                "✓ Transferência rápida",
              ].map((t) => (
                <span
                  key={t}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    borderColor: "rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Direita: bento stats ── */}
          <div className="lg:col-span-5">
            <BentoStats />
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SEÇÃO 3 — CTA FINAL
          fundo branco, clean
      ═══════════════════════════════════════════════ */}
      <section
        className="py-16 px-4"
        style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #f0f0f0" }}
      >
        <div className="max-w-xl mx-auto text-center">
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full border uppercase tracking-widest mb-5"
            style={{
              color: "#10b981",
              backgroundColor: "rgba(16,185,129,0.07)",
              borderColor: "rgba(16,185,129,0.2)",
            }}
          >
            Análise Consultiva
          </span>
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: "#111827", letterSpacing: "-0.01em" }}
          >
            Não encontrou a carta ideal?
          </h2>
          <p
            className="text-sm leading-relaxed mb-7"
            style={{ color: "#6b7280" }}
          >
            Nosso estoque é atualizado com frequência. Entre em contato e
            apresentamos outras opções disponíveis — sem compromisso.
          </p>
          <a
            href="https://wa.me/5511930048940?text=Olá! Gostaria de verificar opções de cartas contempladas disponíveis."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-semibold px-8 py-3.5 rounded-full transition-opacity hover:opacity-85 text-sm"
            style={{ backgroundColor: "#10b981", color: "#FFFFFF" }}
          >
            Solicitar análise consultiva
          </a>
          <p
            className="text-xs mt-4"
            style={{ color: "#9ca3af" }}
          >
            Sem pressão de venda. Orientação estratégica.
          </p>
        </div>
      </section>

      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
