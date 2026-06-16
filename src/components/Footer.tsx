"use client";

const LOGO_URL = "https://titaniumconsultoria.com.br/cartas/titanium-logo.png";

const navLinks = [
  { label: "Segmentos", href: "/#segmentos" },
  { label: "Simulador", href: "/#simulador" },
  { label: "Sobre Nós", href: "/#sobre" },
  { label: "Trajetória", href: "/trajetoria" },
  { label: "Missão & Valores", href: "/missao-visao-valores" },
];

const serviceLinks = [
  { label: "Cartas de Imóveis", href: "https://titaniumconsultoria.com.br/cartas/cartas.php?segmento=imovel" },
  { label: "Cartas de Veículos", href: "https://titaniumconsultoria.com.br/cartas/cartas.php?segmento=veiculo" },
  { label: "Caminhões e Frotas", href: "/#segmentos" },
  { label: "Máquinas Agrícolas", href: "/#segmentos" },
  { label: "Simular crédito", href: "/#simulador" },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--bg-dark)", color: "var(--ink-white)" }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 pt-16 pb-8">

        {/* ── Topo: Logo + Descrição ── */}
        <div className="pb-12 mb-12" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Logo + brand copy */}
            <div className="lg:col-span-5 space-y-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_URL}
                alt="Titanium Consultoria"
                className="h-10 w-auto"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.9rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: "380px" }}>
                Consultoria financeira especializada em cartas contempladas. Crédito aprovado sem juros bancários para produtores rurais, empresários e profissionais liberais.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "CNPJ 46.640.755/0001-51" },
                  { label: "Banco Central" },
                  { label: "4 anos de mercado" },
                ].map((badge) => (
                  <span
                    key={badge.label}
                    style={{
                      fontFamily: "var(--font-jakarta)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--green-vivid)",
                      backgroundColor: "rgba(21,184,92,0.1)",
                      border: "1px solid rgba(21,184,92,0.2)",
                      borderRadius: "999px",
                      padding: "4px 10px",
                    }}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Links: Empresa */}
            <div className="lg:col-span-3 space-y-4">
              <span style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", display: "block" }}>
                Empresa
              </span>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--green-vivid)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links: Serviços */}
            <div className="lg:col-span-4 space-y-4">
              <span style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", display: "block" }}>
                Serviços
              </span>
              <ul className="space-y-2.5 mb-6">
                {serviceLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--green-vivid)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/5511951014269"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:brightness-110"
                style={{
                  fontFamily: "var(--font-jakarta)",
                  backgroundColor: "var(--whatsapp)",
                  color: "white",
                  textDecoration: "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Falar com consultor
              </a>
            </div>
          </div>
        </div>

        {/* ── Disclaimer Legal ── */}
        <div className="mb-10 space-y-3">
          {[
            "A Titanium Consultoria atua como empresa de intermediação e assessoria comercial especializada em cartas contempladas para imóveis, veículos, caminhões, máquinas e serviços — prestando atendimento consultivo, transparente e personalizado em todo o território nacional.",
            "A Titanium não é instituição financeira, administradora de consórcios ou concedente de crédito. Nosso papel consiste na prospecção, apresentação e intermediação de cartas contempladas, sempre em conformidade com a legislação brasileira e as normas de proteção ao consumidor.",
            "Nunca solicitamos depósitos antecipados, pagamentos de taxas de liberação ou qualquer transferência sem formalização contratual prévia. Em caso de contato suspeito em nome da Titanium, interrompa imediatamente e acione nossos canais oficiais.",
            "Informações e privacidade: todas as condições são apresentadas antes de qualquer negociação. Dados tratados conforme LGPD (Lei nº 13.709/2018).",
          ].map((text, i) => (
            <p key={i} style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", lineHeight: 1.7 }}>
              {text}
            </p>
          ))}
        </div>

        {/* ── Bottom bar: logo + copyright ── */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          {/* Logo pequeno */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_URL}
            alt="Titanium Consultoria"
            className="h-7 w-auto"
            style={{ filter: "brightness(0) invert(1)", opacity: 0.5 }}
          />

          {/* Copyright */}
          <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()} Titanium Consultoria. Todos os direitos reservados.
          </span>

          {/* CNPJ */}
          <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>
            CNPJ: 46.640.755/0001-51
          </span>
        </div>

      </div>
    </footer>
  );
}
