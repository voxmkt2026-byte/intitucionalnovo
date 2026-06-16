"use client";

import { useEffect, useRef, useState } from "react";

const profiles = [
  {
    icon: "🌱",
    role: "Produtor Rural",
    region: "Sul e Norte do Brasil",
    pain: "Trator de R$280k no banco: R$520k no final. Com carta contemplada: R$310k.",
    tag: "agro",
    color: "var(--green-tint)",
    border: "var(--green-tint-2)",
  },
  {
    icon: "🚛",
    role: "Dono de Frota",
    region: "Caminhoneiros e transportadoras",
    pain: "Parcela até 45% menor que financiamento bancário para ampliar frota.",
    tag: "frota",
    color: "var(--bg-2)",
    border: "var(--bg-3)",
  },
  {
    icon: "🏥",
    role: "Profissional Liberal",
    region: "Médicos, dentistas, advogados",
    pain: "Equipamento de R$150k sem banco. Caixa da clínica intacto.",
    tag: "liberal",
    color: "var(--green-tint)",
    border: "var(--green-tint-2)",
  },
  {
    icon: "🏪",
    role: "Empresário",
    region: "Franqueados e pequeno comércio",
    pain: "Expansão, reforma e segunda unidade sem crédito PJ a 2,5% ao mês.",
    tag: "empresario",
    color: "var(--bg-2)",
    border: "var(--bg-3)",
  },
];

export default function PainProfiles() {
  const [active, setActive] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll(".profile-card");
    if (!cards) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24"
      style={{ backgroundColor: "var(--bg-2)" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Header */}
        <div className="max-w-2xl mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block w-6 h-px" style={{ backgroundColor: "var(--green)" }} />
            <span className="kicker">Quem escolhe a Titanium</span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-jakarta), system-ui, sans-serif",
              fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
            }}
          >
            Perfis diferentes.{" "}
            <span className="text-gradient">Mesma dor com o banco.</span>
          </h2>
          <p
            className="mt-4"
            style={{
              fontFamily: "var(--font-jakarta)",
              fontSize: "clamp(1rem, 1.4vw, 1.1rem)",
              color: "var(--ink-soft)",
              lineHeight: 1.7,
            }}
          >
            Seja qual for o seu setor, o banco cobra caro para você crescer. Nossas cartas mudam esse cálculo.
          </p>
        </div>

        {/* Grid de perfis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {profiles.map((profile, i) => (
            <button
              key={profile.tag}
              className="profile-card text-left rounded-2xl p-6 transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: active === i ? "var(--bg-white)" : "var(--bg-white)",
                border: active === i ? `2px solid var(--green)` : `2px solid transparent`,
                boxShadow: active === i ? "var(--card-shadow-lg)" : "var(--card-shadow)",
                opacity: 0,
                transform: "translateY(24px)",
                transition: `opacity 0.6s var(--ease) ${i * 80}ms, transform 0.6s var(--ease) ${i * 80}ms, border-color 0.2s ease, box-shadow 0.2s ease`,
              }}
              onClick={() => setActive(active === i ? null : i)}
              aria-expanded={active === i}
            >
              {/* Ícone */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ backgroundColor: profile.color, border: `1px solid ${profile.border}` }}
              >
                {profile.icon}
              </div>

              {/* Conteúdo */}
              <div
                style={{
                  fontFamily: "var(--font-jakarta)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--ink)",
                  marginBottom: "4px",
                }}
              >
                {profile.role}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--ink-mute)",
                  marginBottom: "16px",
                }}
              >
                {profile.region}
              </div>

              {/* Dor — expande ao clicar */}
              <div
                style={{
                  overflow: "hidden",
                  maxHeight: active === i ? "200px" : "0",
                  opacity: active === i ? 1 : 0,
                  transition: "max-height 0.35s var(--ease), opacity 0.25s ease",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-jakarta)",
                    fontSize: "0.9rem",
                    color: "var(--ink-soft)",
                    lineHeight: 1.65,
                    paddingTop: "4px",
                  }}
                >
                  {profile.pain}
                </p>
                <a
                  href="#simulador"
                  className="inline-flex items-center gap-2 mt-4"
                  style={{
                    fontFamily: "var(--font-jakarta)",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "var(--green)",
                    textDecoration: "none",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Simular meu crédito
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Indicador de clique */}
              {active !== i && (
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--green)",
                    fontWeight: 600,
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Ver quanto economiza
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* CTA bottom */}
        <div className="mt-10 text-center">
          <p style={{ fontSize: "0.875rem", color: "var(--ink-mute)", marginBottom: "16px", fontFamily: "var(--font-jakarta)" }}>
            Não encontrou seu perfil? Atendemos de R$15 mil a R$2 milhões.
          </p>
          <a
            href="https://wa.me/5511951014269"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ display: "inline-flex" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Falar com consultor
          </a>
        </div>
      </div>
    </section>
  );
}
