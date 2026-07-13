import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Institucional | Titanium Consultoria",
  description:
    "Conheça a Titanium Consultoria: história, missão, valores, processo de análise consultiva para aquisição patrimonial via consórcio e cartas contempladas.",
};

const steps = [
  { num: "01", title: "Diagnóstico de Perfil", desc: "Você nos conta seu objetivo. Imóvel? Veículo? Equipamento? Nosso consultor avalia as alternativas compatíveis com seu perfil e momento." },
  { num: "02", title: "Comparativo de Alternativas", desc: "Analisamos consórcio novo, carta contemplada, financiamento ou aguardar melhor momento. Você entende os prós e contras de cada caminho." },
  { num: "03", title: "Curadoria de Cartas", desc: "Se houver carta contemplada compatível, verificamos documentação, histórico e condições junto à administradora antes de apresentá-la." },
  { num: "04", title: "Formalização", desc: "Com tudo validado, formalizamos a transferência junto à administradora. Você acompanha cada etapa com total transparência." },
  { num: "05", title: "Orientação Completa", desc: "Carta em seu nome, crédito disponível conforme regras da administradora. Sem juros bancários compostos — apenas taxa administrativa transparente*." },
];

const faqs = [
  {
    q: "O que é uma carta contemplada?",
    a: "É uma cota de consórcio que já foi sorteada ou contemplada por lance. Ao adquiri-la, o crédito pode estar disponível de forma mais rápida do que em um consórcio novo. A disponibilidade depende de análise e aprovação da administradora.",
  },
  {
    q: "É seguro comprar uma carta contemplada?",
    a: "A segurança depende da intermediação. Na Titanium, toda operação passa por verificação de documentação e histórico da carta. Recomendamos sempre consultar uma empresa com CNPJ ativo e experiência comprovada no mercado.",
  },
  {
    q: "Consórcio tem juros?",
    a: "Consórcio não cobra juros bancários compostos como um financiamento tradicional. Existe uma taxa de administração, que varia conforme a administradora e o plano escolhido. Na prática, o custo total tende a ser menor, mas depende de cada caso*.",
  },
  {
    q: "Posso usar a carta para qualquer imóvel ou veículo?",
    a: "A carta de crédito pode ser utilizada conforme as regras da administradora. Em geral, atende imóveis residenciais, comerciais, terrenos, veículos novos e seminovos. Recomendamos verificar as condições específicas durante a análise consultiva.",
  },
  {
    q: "Quanto tempo leva o processo?",
    a: "Após a escolha da carta, a formalização leva em média 7 a 15 dias úteis, dependendo da administradora e da documentação. Cada caso pode variar conforme complexidade e aprovação.",
  },
  {
    q: "Quais administradoras vocês trabalham?",
    a: "Trabalhamos com administradoras de primeira linha, incluindo Porto Seguro, Embracon, Rodobens e outras. A escolha depende do perfil e objetivo do cliente.",
  },
];

const partners = [
  "Porto Seguro",
  "Embracon",
  "Rodobens",
  "Ademilar",
  "Magalu Consórcios",
  "Itaú Consórcios",
];

export default function InstitucionalPage() {
  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        {/* ── Hero ── */}
        <section className="bg-bg pt-36 pb-20 border-b border-green/5 relative overflow-hidden">
          <Image
            src="/img/inst-fachada.webp"
            alt=""
            fill
            className="object-cover opacity-[0.07]"
            sizes="100vw"
          />
          <div className="max-w-[900px] mx-auto px-6 relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-label text-green/60">Institucional</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-vivid" />
            </div>
            <h1 className="text-massive font-[family-name:var(--font-jakarta)] text-green mb-8 leading-tight">
              Consultoria para quem está<br />planejando uma aquisição
            </h1>
            <p className="text-lg md:text-xl text-ink-soft font-[family-name:var(--font-jakarta)] leading-relaxed max-w-2xl">
              A Titanium nasceu da convicção de que adquirir imóvel, veículo ou equipamento
              merece análise profissional. Avaliamos seu objetivo, perfil e alternativas antes
              de qualquer decisão.
            </p>
          </div>
        </section>

        {/* ── Missão, Visão, Valores ── */}
        <section className="py-20 bg-bg-white border-b border-green/5">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  label: "Missão",
                  text: "Oferecer análise consultiva para aquisição patrimonial via consórcio e cartas contempladas, com transparência e segurança.",
                },
                {
                  label: "Visão",
                  text: "Ser referência nacional em consultoria de consórcios, reconhecida pela excelência no atendimento e pela confiabilidade.",
                },
                {
                  label: "Valores",
                  text: "Ética. Transparência. Sigilo. Compromisso com a orientação correta acima de qualquer comissão.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-8 bg-bg border border-green/5 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-md"
                >
                  <span className="text-label text-green/60 block mb-4 font-bold">{item.label}</span>
                  <p className="font-[family-name:var(--font-jakarta)] font-bold text-lg text-green leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Como Funciona (Processo) ── */}
        <section className="py-20 bg-bg border-b border-green/5">
          <div className="max-w-[900px] mx-auto px-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-label text-green/60">Processo</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-vivid" />
            </div>
            <h2 className="text-display font-[family-name:var(--font-jakarta)] text-green mb-16">
              Como funciona a<br />análise consultiva
            </h2>

            <div className="flex flex-col gap-6">
               {steps.map((step) => (
                <div key={step.num} className="bg-bg-white border border-green/5 p-8 rounded-3xl shadow-sm">
                  <div className="flex gap-6 items-start">
                    <span className="font-[family-name:var(--font-jakarta)] text-3xl text-green-vivid font-black shrink-0 w-12">
                      {step.num}
                    </span>
                    <div>
                      <h3 className="text-xl font-[family-name:var(--font-jakarta)] text-green font-bold mb-2">
                        {step.title}
                      </h3>
                      <p className="text-base text-ink-soft font-[family-name:var(--font-jakarta)] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Parceiros ── */}
        <section className="bg-bg-white py-20 border-b border-green/5">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-label text-green/60">Parceiros</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-vivid" />
            </div>
            <h2 className="text-display font-[family-name:var(--font-jakarta)] text-green mb-16">
              Administradoras<br />de confiança
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {partners.map((partner) => (
                <div
                  key={partner}
                  className="p-6 flex items-center justify-center bg-bg border border-green/5 rounded-2xl shadow-sm"
                >
                  <span className="text-xs font-[family-name:var(--font-jakarta)] text-green font-bold text-center uppercase tracking-wider">
                    {partner}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 bg-bg border-b border-green/5">
          <div className="max-w-[900px] mx-auto px-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-label text-green/60">FAQ</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-vivid" />
            </div>
            <h2 className="text-display font-[family-name:var(--font-jakarta)] text-green mb-16">
              Perguntas frequentes
            </h2>

            <div className="flex flex-col gap-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-bg-white border border-green/5 p-6 rounded-3xl shadow-sm"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-lg font-[family-name:var(--font-jakarta)] text-green pr-8 font-bold">
                      {faq.q}
                    </span>
                    <span className="text-green/50 group-open:rotate-45 transition-transform duration-200 text-2xl shrink-0 font-bold">
                      +
                    </span>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-green/5">
                    <p className="text-base text-ink-soft font-[family-name:var(--font-jakarta)] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>

            <p className="mt-8 text-xs text-green/30 font-[family-name:var(--font-jakarta)] leading-relaxed">
              *A disponibilidade de cartas, valores, parcelas, transferência e utilização do crédito estão sujeitas à análise, regras contratuais, aprovação da administradora e documentação necessária. Taxas variam conforme administradora e plano.
            </p>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="bg-bg-white py-24 text-center">
          <div className="max-w-[900px] mx-auto px-6">
            <h2 className="text-display font-[family-name:var(--font-jakarta)] text-green mb-6">
              Antes de decidir, compare.
            </h2>
            <p className="text-lg text-ink-soft font-[family-name:var(--font-jakarta)] mb-10 max-w-xl mx-auto">
              Solicite uma análise consultiva gratuita e entenda qual alternativa
              — consórcio, carta contemplada ou outra — faz mais sentido para seu objetivo.
            </p>
            <a
              href="https://wa.me/5511930048940"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Solicitar análise gratuita
            </a>
            <p className="mt-8 text-xs text-green/50 font-[family-name:var(--font-jakarta)] font-semibold">
              Consultoria especializada em aquisição patrimonial
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
