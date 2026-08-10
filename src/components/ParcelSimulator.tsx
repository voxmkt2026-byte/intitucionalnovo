"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

const BANK_RATE_ANNUAL = 0.189; // 18.9% ao ano (média Banco Central)

export default function ParcelSimulator() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [segment, setSegment] = useState<"imovel" | "veiculo">("imovel");
  const [credit, setCredit] = useState<string>("500000");
  const [months, setMonths] = useState<string>("180");
  const [selectedPlan, setSelectedPlan] = useState<"titanium" | "conforto">("titanium");
  const [consent, setConsent] = useState(false);
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

  const sendToGoogleSheets = (plan: string) => {
    let ids: Record<string, string> = { ref: "" };
    try {
      const getCk = (n: string) => {
        const m = document.cookie.match(new RegExp("(^| )" + n + "=([^;]+)"));
        return m ? decodeURIComponent(m[2]) : "";
      };
      const params = new URLSearchParams(window.location.search);
      const fbclid = params.get("fbclid") || "";

      const freshFbc = getCk("_fbc") || (fbclid ? "fb.1." + Date.now() + "." + fbclid : "");
      const freshFbp = getCk("_fbp") || "";

      const stored = sessionStorage.getItem("tf_ids");
      if (stored) {
        ids = JSON.parse(stored);
        if (freshFbc) ids.fbc = freshFbc;
        if (freshFbp) ids.fbp = freshFbp;
        sessionStorage.setItem("tf_ids", JSON.stringify(ids));
      } else {
        ids = {
          ref: "tf_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
          fbc: freshFbc,
          fbp: freshFbp,
          gclid: params.get("gclid") || "",
          utm_source: params.get("utm_source") || "",
          utm_medium: params.get("utm_medium") || "",
          utm_campaign: params.get("utm_campaign") || "",
          utm_content: params.get("utm_content") || "",
          lp: window.location.pathname.replace(/\//g, "") || "home",
        };
        sessionStorage.setItem("tf_ids", JSON.stringify(ids));
      }
    } catch {
      /* silent */
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      segment,
      credit: String(Number(credit) || 0),
      months: String(Number(months) || 0),
      plan,
      lp: "home-simulador",
      ref: ids.ref || "",
      source_url: typeof window !== "undefined" ? window.location.href : "",
    };

    fetch("/api/leads/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  };

  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!name.trim() || !phone.trim() || phone.replace(/\D/g, "").length < 10) {
      e.preventDefault();
      setContactError("Por favor, preencha seu nome e telefone WhatsApp completo com DDD.");
      return;
    }
    if (!consent) {
      e.preventDefault();
      setContactError("É necessário aceitar os termos para prosseguir.");
      return;
    }

    sendToGoogleSheets(selectedPlan === "titanium" ? "Titanium" : "Conforto");
  };

  const calculateScenarios = (e: React.FormEvent) => {
    e.preventDefault();
    const c = Number(credit) || 0;
    const m = Number(months) || 0;

    if (c < minCredit || c > maxCredit) {
      setError(`Valor de crédito para ${segment === "imovel" ? "Imóvel" : "Veículo"} deve ser entre R$ ${minCredit.toLocaleString("pt-BR")} e R$ ${maxCredit.toLocaleString("pt-BR")}.`);
      return;
    }
    if (m < minMonths || m > maxMonths) {
      setError(`Prazo deve ser entre ${minMonths} e ${maxMonths} meses.`);
      return;
    }

    setError(null);
    setHasCalculated(true);
  };

  const creditNum = Number(credit) || 0;
  const monthsNum = Number(months) || 0;

  // Planos Consórcio
  const titaniumRate = segment === "imovel" ? 0.16 : 0.14;
  const titaniumInstallment = monthsNum > 0 ? (creditNum * (1 + titaniumRate)) / monthsNum : 0;

  const confortoRate = segment === "imovel" ? 0.20 : 0.18;
  const confortoMonths = segment === "imovel" ? Math.min(monthsNum + 24, 240) : Math.min(monthsNum + 12, 100);
  const confortoInstallment = confortoMonths > 0 ? (creditNum * (1 + confortoRate)) / confortoMonths : 0;

  // Financiamento Bancário
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
    
    let ref = "";
    try {
      const s = sessionStorage.getItem("tf_ids");
      if (s) ref = JSON.parse(s).ref || "";
    } catch {}
    const refSuffix = ref ? `\n\nRef: ${ref}` : "";
    const msg = `Olá, meu nome é ${name}. Fiz a simulação de crédito inteligente no valor de ${fmtC} com parcelas estimadas de ${fmtI} (${seg} · Plano ${plan}). Gostaria de receber a orientação consultiva da Titanium.${refSuffix}`;
    return `https://wa.me/5511930048940?text=${encodeURIComponent(msg)}`;
  };

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const fmtDec = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const isDisabled = credit === "" || months === "";

  return (
    <section id="simulador" className="relative py-20 md:py-28 font-jakarta">
      {/* Background Glows */}
      <div className="absolute inset-0 tech-grid-pattern opacity-50 pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-[1160px] mx-auto px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Esquerda: Copywriting */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5EE] border border-[#D1ECDD] text-[#0A7B3E] text-[10px] font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A7B3E] animate-pulse" />
              Simulador Financeiro Inteligente
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Compare o custo real <br />
              <span className="text-gradient">com o modelo tradicional</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-light leading-relaxed">
              Enquanto o financiamento bancário cobra juros sobre juros, a estruturação de cotas contempladas da Titanium permite economizar até 60% do custo final do seu patrimônio.
            </p>

            {/* Badges de Confiança */}
            <div className="liquid-glass p-5 rounded-2xl space-y-3.5 border border-white/90 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0A7B3E] shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-700">Regulamentado pelo Banco Central do Brasil</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0A7B3E] shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-700">Blindagem jurídica e contratual completa</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#0A7B3E] shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-700">Sem taxas ocultas ou cobranças antecipadas</span>
              </div>
            </div>
          </div>

          {/* Direita: Simulador Liquid Glass Light */}
          <div className="lg:col-span-7 rounded-3xl p-6 sm:p-10 space-y-8 liquid-glass border border-white/90 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08),inset_0_1px_2px_rgba(255,255,255,1)] text-left">
            
            <form onSubmit={calculateScenarios} className="space-y-6">
              
              {/* Segment Toggle */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Segmento de Aquisição
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/80">
                  {(["imovel", "veiculo"] as const).map((seg) => (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => handleSegmentChange(seg)}
                      className={`py-2.5 text-xs uppercase tracking-wider font-bold rounded-xl transition-all duration-200 cursor-pointer border ${
                        segment === seg
                          ? "bg-[#0A7B3E] text-white border-[#0A7B3E] shadow-sm"
                          : "bg-transparent text-slate-600 border-transparent hover:text-slate-900"
                      }`}
                    >
                      {seg === "imovel" ? "Imóvel" : "Veículo / Frota"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-6 pt-2">
                {/* Credit */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Valor do Crédito
                    </span>
                    <span className="text-lg sm:text-xl font-extrabold text-[#0A7B3E]">
                      {fmt(creditNum)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={minCredit}
                    max={maxCredit}
                    step={segment === "imovel" ? 50000 : 10000}
                    value={Math.min(Math.max(creditNum, minCredit), maxCredit)}
                    onChange={(e) => { setCredit(e.target.value); setHasCalculated(false); setError(null); }}
                    className="w-full"
                  />
                </div>

                {/* Months */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Prazo Desejado
                    </span>
                    <span className="text-lg sm:text-xl font-extrabold text-[#0A7B3E]">
                      {months || "0"} <span className="text-xs font-normal text-slate-400">meses</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={minMonths}
                    max={maxMonths}
                    step={6}
                    value={Math.min(Math.max(Number(months) || 0, minMonths), maxMonths)}
                    onChange={(e) => { setMonths(e.target.value); setHasCalculated(false); setError(null); }}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isDisabled}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all duration-300 cursor-pointer border-none bg-gradient-to-r from-[#0D9E50] to-[#0A7B3E] hover:from-[#15B85C] hover:to-[#0D9E50] shadow-md shadow-[#0A7B3E]/20",
                  isDisabled && "opacity-40 cursor-not-allowed"
                )}
              >
                Atualizar Comparativo →
              </button>

              {error && (
                <div className="text-xs p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-semibold">
                  {error}
                </div>
              )}
            </form>

            {/* Comparativo de Resultados */}
            {hasCalculated && (
              <div className="space-y-6 pt-6 border-t border-slate-200/80">
                
                {/* Financiamento Tradicional */}
                {bankInstallment > 0 && (
                  <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                        Financiamento Bancário (~18,9% a.a.)
                      </span>
                      <span className="text-xs text-rose-600 font-semibold">
                        Total: {fmt(bankTotal)}
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold text-rose-700">
                      {fmtDec(bankInstallment)} <span className="text-xs font-normal text-rose-500">/mês</span>
                    </div>
                  </div>
                )}

                {/* Planos Titanium */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "titanium" as const, label: "Plano Titanium", badge: "Menor Custo Total", installment: titaniumInstallment, rate: titaniumRate, months: monthsNum },
                    { id: "conforto" as const, label: "Plano Conforto", badge: "Parcela Reduzida", installment: confortoInstallment, rate: confortoRate, months: confortoMonths },
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`text-left p-5 rounded-2xl transition-all cursor-pointer border ${
                        selectedPlan === plan.id
                          ? "bg-white border-[#0A7B3E] shadow-md shadow-[#0A7B3E]/10"
                          : "bg-slate-50/80 border-slate-200/80 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">{plan.label}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {plan.badge}
                        </span>
                      </div>
                      <div className="text-xl font-extrabold text-emerald-700 mb-2">
                        {fmtDec(plan.installment)} <span className="text-[11px] font-normal text-slate-400">/mês</span>
                      </div>
                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <div>Prazo: <strong className="text-slate-800">{plan.months} meses</strong></div>
                        <div>Taxa adm: <strong className="text-slate-800">{(plan.rate * 100).toFixed(1)}% diluída</strong></div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Card de Economia Estimada */}
                {savings > 0 && (
                  <div className="p-5 rounded-2xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#0A7B3E] block">Sua Economia Estimada vs. Banco:</span>
                      <span className="text-2xl font-extrabold text-emerald-900">{fmt(savings)}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E] font-bold">
                      ✓
                    </div>
                  </div>
                )}

                {/* Formulário para Envio WhatsApp */}
                <div className="space-y-4 pt-4 border-t border-slate-200/80">
                  <p className="text-xs font-bold text-slate-700">
                    Solicite o diagnóstico completo e a disponibilidade de cotas:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setContactError(null); }}
                      placeholder="Seu Nome Completo"
                      className="liquid-glass-input px-4 py-2.5 rounded-xl text-xs text-slate-800"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setContactError(null); }}
                      placeholder="Seu E-mail (opcional)"
                      className="liquid-glass-input px-4 py-2.5 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="WhatsApp / Celular com DDD"
                    className="w-full liquid-glass-input px-4 py-2.5 rounded-xl text-xs text-slate-800"
                  />

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="privacy-consent-sim"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#0A7B3E]"
                    />
                    <label htmlFor="privacy-consent-sim" className="text-[11px] text-slate-500 cursor-pointer leading-tight">
                      Concordo em receber a análise e diagnóstico patrimonial. Seus dados estão 100% seguros sob a LGPD.
                    </label>
                  </div>

                  {contactError && (
                    <div className="text-xs p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 font-semibold">
                      {contactError}
                    </div>
                  )}

                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsAppClick}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#0A7B3E] hover:bg-[#086332] shadow-md shadow-[#0A7B3E]/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-decoration-none"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.089.534 4.055 1.475 5.77L0 24l6.407-1.453A11.957 11.957 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.497-5.22-1.367l-.375-.222-3.887.882.913-3.781-.244-.39A9.941 9.941 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    Receber Orientação no WhatsApp
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
