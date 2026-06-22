"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

const BANK_RATE_ANNUAL = 0.189; // 18.9% ao ano (média Banco Central 2024)

export default function ParcelSimulator() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [segment, setSegment] = useState<"imovel" | "veiculo">("imovel");
  const [credit, setCredit] = useState<string>("500000");
  const [months, setMonths] = useState<string>("180");
  const [selectedPlan, setSelectedPlan] = useState<"titanium" | "conforto">("titanium");
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);

  const minCredit = segment === "imovel" ? 100000 : 30000;
  const maxCredit = segment === "imovel" ? 2000000 : 300000;
  const minMonths = segment === "imovel" ? 60 : 36;
  const maxMonths = segment === "imovel" ? 240 : 100;

  const handleCreditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredit(e.target.value.replace(/\D/g, ""));
    setHasCalculated(false);
    setError(null);
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonths(e.target.value.replace(/[^-0-9]/g, "").replace(/(?!^)-/g, ""));
    setHasCalculated(false);
    setError(null);
  };

  const handleSegmentChange = (val: "imovel" | "veiculo") => {
    setSegment(val);
    setHasCalculated(false);
    setError(null);
    const c = Number(credit) || 0;
    const m = Number(months) || 0;
    if (val === "veiculo") {
      if (c > 300000) setCredit("300000");
      if (m > 100) setMonths("100");
    } else {
      if (c > 500000) setCredit("500000");
      if (m > 220) setMonths("220");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 10) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    else if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    setPhone(v);
    setContactError(null);
  };

  // ── Google Sheets via server-side proxy (avoids CORS) ──
  const sendToGoogleSheets = (plan: string) => {
    // Capture tracking identifiers for the data cycle
    let ids: Record<string, string> = { ref: '' };
    try {
      const getCk = (n: string) => { const m = document.cookie.match(new RegExp('(^| )' + n + '=([^;]+)')); return m ? decodeURIComponent(m[2]) : ''; };
      const params = new URLSearchParams(window.location.search);
      const fbclid = params.get('fbclid') || '';

      // Always re-read Facebook cookies (pixel loads async)
      const freshFbc = getCk('_fbc') || (fbclid ? 'fb.1.' + Date.now() + '.' + fbclid : '');
      const freshFbp = getCk('_fbp') || '';

      const stored = sessionStorage.getItem('tf_ids');
      if (stored) {
        ids = JSON.parse(stored);
        if (freshFbc) ids.fbc = freshFbc;
        if (freshFbp) ids.fbp = freshFbp;
        sessionStorage.setItem('tf_ids', JSON.stringify(ids));
      } else {
        ids = {
          ref: 'tf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          fbc: freshFbc,
          fbp: freshFbp,
          gclid: params.get('gclid') || '',
          utm_source: params.get('utm_source') || '',
          utm_medium: params.get('utm_medium') || '',
          utm_campaign: params.get('utm_campaign') || '',
          utm_content: params.get('utm_content') || '',
          lp: window.location.pathname.replace(/\//g, '') || 'home',
        };
        sessionStorage.setItem('tf_ids', JSON.stringify(ids));
      }
    } catch { /* silent */ }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone,
      segment: segment === "imovel" ? "Imóvel" : "Veículo",
      credit: Number(credit),
      months: Number(months),
      plan,
      origin: typeof window !== "undefined" ? window.location.href : "simulador",
      ref: ids.ref || '',
      fbc: ids.fbc || '',
      fbp: ids.fbp || '',
      gclid: ids.gclid || '',
      utm_source: ids.utm_source || '',
      utm_medium: ids.utm_medium || '',
      utm_campaign: ids.utm_campaign || '',
      utm_content: ids.utm_content || '',
      lp: ids.lp || '',
    };
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {/* silently ignore */});
  };

  // ── Phase 1: Calculate — only validates credit inputs ──
  const calculateScenarios = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const creditNum = Number(credit);
    const monthsNum = Number(months);
    if (!credit || isNaN(creditNum) || creditNum <= 0) { setError("Valor de crédito inválido."); return; }
    if (!months || isNaN(monthsNum) || monthsNum <= 0) { setError("Prazo inválido."); return; }
    setHasCalculated(true);
  };

  // ── Phase 2: WhatsApp CTA — validates personal data ──
  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setContactError(null);
    if (!name.trim()) { e.preventDefault(); setContactError("Por favor, preencha o seu nome completo."); return; }
    if (!email.trim() || !email.includes("@")) { e.preventDefault(); setContactError("Por favor, insira um e-mail válido."); return; }
    if (phone.length < 14) { e.preventDefault(); setContactError("Por favor, insira um telefone de contato válido."); return; }
    if (!consent) { e.preventDefault(); setContactError("Você precisa aceitar o aviso de privacidade para continuar."); return; }

    // ── Enhanced Conversions for Leads (Google Ads) ──
    try {
      const w = window as unknown as Record<string, unknown>;
      if (typeof w.gtag === "function") {
        const gtag = w.gtag as (...args: unknown[]) => void;
        gtag("set", "user_data", {
          email: email.trim().toLowerCase(),
          phone_number: "+55" + phone.replace(/\D/g, ""),
        });
        gtag("event", "conversion", {
          send_to: "AW-18248652606/lead_simulador",
          value: Number(credit) || 0,
          currency: "BRL",
        });
      }
      // Meta Pixel Lead event
      if (typeof w.fbq === "function") {
        const fbq = w.fbq as (...args: unknown[]) => void;
        fbq("track", "Lead", {
          value: Number(credit) || 0,
          currency: "BRL",
          content_name: `Simulador - ${segment === "imovel" ? "Imóvel" : "Veículo"} - ${selectedPlan}`,
        });
      }
    } catch { /* silent */ }

    // All good — send lead to Google Sheets
    sendToGoogleSheets(selectedPlan === "titanium" ? "Titanium" : "Conforto");
  };

  const creditNum = Number(credit) || 0;
  const monthsNum = Number(months) || 0;

  // ── Consortium rates ──
  let titaniumRate = 0, confortoRate = 0, confortoMonths = 0;
  if (segment === "imovel") {
    titaniumRate = monthsNum <= 120 ? 0.12 : monthsNum <= 180 ? 0.15 : 0.18;
    confortoMonths = Math.min(240, Math.round(monthsNum * 1.5));
    if (confortoMonths <= monthsNum) confortoMonths = 240;
    confortoRate = confortoMonths <= 120 ? 0.12 : confortoMonths <= 180 ? 0.15 : 0.18;
  } else {
    titaniumRate = monthsNum <= 60 ? 0.15 : monthsNum <= 84 ? 0.18 : 0.22;
    confortoMonths = Math.min(100, Math.round(monthsNum * 1.5));
    if (confortoMonths <= monthsNum) confortoMonths = 100;
    confortoRate = confortoMonths <= 60 ? 0.15 : confortoMonths <= 84 ? 0.18 : 0.22;
  }

  const titaniumInstallment = monthsNum > 0 ? (creditNum * (1 + titaniumRate)) / monthsNum : 0;
  const confortoInstallment = confortoMonths > 0 ? (creditNum * (1 + confortoRate)) / confortoMonths : 0;

  // ── Bank comparison (Price + interest) ──
  const monthlyBankRate = Math.pow(1 + BANK_RATE_ANNUAL, 1 / 12) - 1;
  const bankInstallment =
    monthsNum > 0 && monthlyBankRate > 0
      ? (creditNum * monthlyBankRate * Math.pow(1 + monthlyBankRate, monthsNum)) /
        (Math.pow(1 + monthlyBankRate, monthsNum) - 1)
      : 0;
  const bankTotal = bankInstallment * monthsNum;
  const titaniumTotal = creditNum * (1 + titaniumRate);
  const savings = bankTotal - titaniumTotal;

  const getWhatsAppUrl = () => {
    const inst = selectedPlan === "titanium" ? titaniumInstallment : confortoInstallment;
    const plan = selectedPlan === "titanium" ? "Titanium" : "Conforto";
    const seg = segment === "imovel" ? "Imóvel" : "Veículo";
    const fmtC = creditNum.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const fmtI = inst.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    // Get ref from session for traceability
    let ref = '';
    try { const s = sessionStorage.getItem('tf_ids'); if (s) ref = JSON.parse(s).ref || ''; } catch {}
    const refSuffix = ref ? `\n\nRef: ${ref}` : '';
    const msg = `Olá, meu nome é ${name}. Simulei uma carta de ${fmtC} com parcelas de ${fmtI} (${seg} · Plano ${plan}). Quero saber mais.${refSuffix}`;
    return `https://wa.me/5511930048940?text=${encodeURIComponent(msg)}`;
  };

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const fmtDec = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const isDisabled = credit === "" || months === "";

  return (
    <section id="simulador" className="relative py-16 md:py-24" style={{ backgroundColor: "var(--bg-2)" }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* ── Esquerda: copy ── */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32">
            <div className="flex items-center gap-3">
              <span className="inline-block w-6 h-px" style={{ backgroundColor: "var(--green)" }} />
              <span className="kicker">Simulador</span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)",
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
              }}
            >
              Quanto você economiza
              <br />
              <span className="text-gradient">com análise consultiva?</span>
            </h2>
            <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "1rem", color: "var(--ink-soft)", lineHeight: 1.75 }}>
              Compare o custo de um financiamento tradicional com a estruturação inteligente de uma carta de consórcio.
            </p>

            {/* Trust badge */}
            <div
              className="p-5 rounded-xl space-y-3 mt-4"
              style={{ backgroundColor: "var(--green-tint)", border: "1px solid var(--green-tint-2)" }}
            >
              {[
                { icon: "🔒", text: "Regulamentado pelo Banco Central do Brasil" },
                { icon: "✅", text: "CNPJ 46.640.755/0001-51 — empresa ativa" },
                { icon: "📋", text: "Nunca cobramos taxa de análise antecipada" },
              ].map((item) => (
                <div key={item.icon} className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.8rem", color: "var(--green-deep)", fontWeight: 500 }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Direita: widget ── */}
          <div
            className="lg:col-span-7 rounded-2xl p-8 md:p-10 space-y-8"
            style={{ backgroundColor: "var(--bg-dark)" }}
          >
            {/* ══ PHASE 1: Credit inputs (no personal data required) ══ */}
            <form onSubmit={calculateScenarios} className="space-y-6">

              {/* Segment toggle + sliders */}
              <div>
                <label style={{ fontFamily: "var(--font-jakarta)", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "6px" }}>
                  Tipo de carta
                </label>
                <div className="flex gap-2">
                  {(["imovel", "veiculo"] as const).map((seg) => (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => handleSegmentChange(seg)}
                      className="flex-1 py-3 text-xs uppercase tracking-wider font-bold rounded-xl transition-all duration-200"
                      style={{
                        fontFamily: "var(--font-jakarta)",
                        backgroundColor: segment === seg ? "var(--green)" : "rgba(255,255,255,0.08)",
                        color: segment === seg ? "white" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {seg === "imovel" ? "Imóvel" : "Veículo"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="pt-4 space-y-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                {/* Credit */}
                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <span style={{ fontFamily: "var(--font-jakarta)", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                      Valor do Crédito
                    </span>
                    <span style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: "1.2rem", color: "var(--green-vivid)" }}>
                      {fmt(creditNum)}
                    </span>
                  </div>
                  <div className="relative w-full h-6 flex items-center">
                    <div className="absolute left-0 right-0 h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                    <div
                      className="absolute left-0 h-1.5 rounded-full"
                      style={{
                        width: `${((Math.min(Math.max(creditNum, minCredit), maxCredit) - minCredit) / (maxCredit - minCredit)) * 100}%`,
                        backgroundColor: "var(--green-vivid)",
                      }}
                    />
                    <input
                      type="range"
                      min={minCredit}
                      max={maxCredit}
                      step={segment === "imovel" ? 50000 : 10000}
                      value={Math.min(Math.max(creditNum, minCredit), maxCredit)}
                      onChange={(e) => { setCredit(e.target.value); setHasCalculated(false); setError(null); }}
                      className="simulator-range absolute w-full h-6 appearance-none bg-transparent cursor-pointer z-10"
                    />
                  </div>
                </div>

                {/* Months */}
                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <span style={{ fontFamily: "var(--font-jakarta)", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                      Prazo
                    </span>
                    <span style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: "1.2rem", color: "var(--green-vivid)" }}>
                      {months || "0"} <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>meses</span>
                    </span>
                  </div>
                  <div className="relative w-full h-6 flex items-center">
                    <div className="absolute left-0 right-0 h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                    <div
                      className="absolute left-0 h-1.5 rounded-full"
                      style={{
                        width: `${((Math.min(Math.max(Number(months) || 0, minMonths), maxMonths) - minMonths) / (maxMonths - minMonths)) * 100}%`,
                        backgroundColor: "var(--green-vivid)",
                      }}
                    />
                    <input
                      type="range"
                      min={minMonths}
                      max={maxMonths}
                      step={6}
                      value={Math.min(Math.max(Number(months) || 0, minMonths), maxMonths)}
                      onChange={(e) => { setMonths(e.target.value); setHasCalculated(false); setError(null); }}
                      className="simulator-range absolute w-full h-6 appearance-none bg-transparent cursor-pointer z-10"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isDisabled}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300",
                  isDisabled ? "opacity-40 cursor-not-allowed" : "hover:brightness-110 hover:shadow-lg"
                )}
                style={{
                  fontFamily: "var(--font-jakarta)",
                  backgroundColor: "var(--green)",
                  color: "white",
                }}
              >
                Simular e comparar com o banco →
              </button>

              {error && (
                <div className="text-xs font-sans border p-3.5 rounded-xl" style={{ color: "var(--bad)", borderColor: "rgba(196,64,64,0.2)", backgroundColor: "rgba(196,64,64,0.08)" }}>
                  {error}
                </div>
              )}
            </form>

            {/* ══ PHASE 2: Results + personal data + WhatsApp CTA ══ */}
            {hasCalculated && (
              <div className="pt-8 space-y-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>

                {/* Comparação banco vs contemplada */}
                {bankInstallment > 0 && (
                  <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(196,64,64,0.08)", border: "1px solid rgba(196,64,64,0.15)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                          Financiamento bancário ~18,9% a.a.
                        </div>
                        <div style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: "1.4rem", color: "rgba(255,100,100,0.9)" }}>
                          {fmtDec(bankInstallment)}<span style={{ fontSize: "0.75rem", fontWeight: 400, color: "rgba(255,255,255,0.35)", marginLeft: "4px" }}>/mês</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginBottom: "2px" }}>Total pago</div>
                        <div style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700, fontSize: "0.9rem", color: "rgba(255,100,100,0.8)" }}>{fmt(bankTotal)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Planos contemplada */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "titanium" as const, label: "Plano Titanium", badge: "Menor custo", installment: titaniumInstallment, total: titaniumTotal, rate: titaniumRate, months: monthsNum },
                    { id: "conforto" as const, label: "Plano Conforto", badge: "Maior prazo", installment: confortoInstallment, total: creditNum * (1 + confortoRate), rate: confortoRate, months: confortoMonths },
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className="text-left p-5 rounded-xl transition-all duration-300"
                      style={{
                        backgroundColor: selectedPlan === plan.id ? "var(--bg-white)" : "rgba(255,255,255,0.05)",
                        border: selectedPlan === plan.id ? "2px solid var(--green)" : "2px solid transparent",
                      }}
                    >
                      <div style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: selectedPlan === plan.id ? "var(--ink-mute)" : "rgba(255,255,255,0.4)", marginBottom: "2px" }}>
                        {plan.label}
                      </div>
                      <div style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--green-vivid)", marginBottom: "10px" }}>
                        {plan.badge}
                      </div>
                      <div style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: "1.5rem", color: selectedPlan === plan.id ? "var(--ink)" : "white", marginBottom: "8px" }}>
                        {fmtDec(plan.installment)}<span style={{ fontSize: "0.7rem", fontWeight: 400, color: selectedPlan === plan.id ? "var(--ink-mute)" : "rgba(255,255,255,0.4)", marginLeft: "3px" }}>/mês</span>
                      </div>
                      <div className="space-y-1" style={{ fontSize: "0.72rem", fontFamily: "var(--font-jakarta)" }}>
                        <div className="flex justify-between" style={{ color: selectedPlan === plan.id ? "var(--ink-soft)" : "rgba(255,255,255,0.4)" }}>
                          <span>Prazo</span>
                          <span style={{ fontWeight: 600, color: selectedPlan === plan.id ? "var(--ink)" : "white" }}>{plan.months} meses</span>
                        </div>
                        <div className="flex justify-between" style={{ color: selectedPlan === plan.id ? "var(--ink-soft)" : "rgba(255,255,255,0.4)" }}>
                          <span>Taxa adm.</span>
                          <span style={{ fontWeight: 600, color: selectedPlan === plan.id ? "var(--ink)" : "white" }}>{(plan.rate * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Economia vs banco */}
                {savings > 0 && (
                  <div
                    className="p-4 rounded-xl flex items-center justify-between"
                    style={{ backgroundColor: "var(--green-tint)", border: "1px solid var(--green-tint-2)" }}
                  >
                    <div>
                      <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.7rem", fontWeight: 600, color: "var(--green)", marginBottom: "2px" }}>
                        Você economiza em relação ao banco:
                      </div>
                      <div style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: "1.4rem", color: "var(--green-deep)" }}>
                        {fmt(savings)}
                      </div>
                    </div>
                    <div style={{ fontSize: "2rem" }}>💰</div>
                  </div>
                )}

                {/* ── Simulation disclaimer ── */}
                <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", lineHeight: 1.6, fontStyle: "italic" }}>
                  *Simulação ilustrativa. Valores reais podem variar conforme administradora, grupo e condições de mercado. Taxa administrativa de 12% a 22% conforme prazo e segmento.
                </p>

                {/* ── Personal data collection (after results) ── */}
                <div className="pt-6 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
                    Gostou do resultado? Preencha seus dados para receber orientação personalizada:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Seu nome completo", value: name, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setName(e.target.value); setContactError(null); }, placeholder: "Ex: João da Silva", type: "text" },
                      { label: "Seu melhor e-mail", value: email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); setContactError(null); }, placeholder: "Ex: joao@email.com", type: "email" },
                    ].map((field) => (
                      <div key={field.label}>
                        <label
                          style={{ fontFamily: "var(--font-jakarta)", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "6px" }}
                        >
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={field.placeholder}
                          style={{ fontFamily: "var(--font-jakarta)" }}
                          className="w-full bg-white/8 border border-white/10 px-4 py-3.5 text-white placeholder:text-white/25 text-sm rounded-xl focus:outline-none focus:border-green-500/50 transition-all"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label style={{ fontFamily: "var(--font-jakarta)", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "6px" }}>
                      WhatsApp / Celular
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="(11) 99999-9999"
                      style={{ fontFamily: "var(--font-jakarta)" }}
                      className="w-full bg-white/8 border border-white/10 px-4 py-3.5 text-white placeholder:text-white/25 text-sm rounded-xl focus:outline-none focus:border-green-500/50 transition-all"
                    />
                  </div>

                  {/* Consent */}
                  <div className="flex items-start gap-3 pt-1">
                    <input
                      type="checkbox"
                      id="privacy-consent"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded"
                      style={{ accentColor: "var(--green-vivid)" }}
                    />
                    <label htmlFor="privacy-consent" style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.6, cursor: "pointer" }}>
                      Concordo em fornecer os dados para simulação e atendimento. Seus dados estão protegidos pela LGPD.
                    </label>
                  </div>

                  {contactError && (
                    <div className="text-xs font-sans border p-3.5 rounded-xl" style={{ color: "var(--bad)", borderColor: "rgba(196,64,64,0.2)", backgroundColor: "rgba(196,64,64,0.08)" }}>
                      {contactError}
                    </div>
                  )}

                  {/* CTA WhatsApp */}
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsAppClick}
                    className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      fontFamily: "var(--font-jakarta)",
                      backgroundColor: "var(--whatsapp)",
                      color: "white",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Solicitar orientação gratuita
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
