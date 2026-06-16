"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

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
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);

  const minCredit = segment === "imovel" ? 100000 : 30000;
  const maxCredit = segment === "imovel" ? 2000000 : 300000;
  const minMonths = segment === "imovel" ? 60 : 36;
  const maxMonths = segment === "imovel" ? 240 : 100;

  const handleCreditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/\D/g, "");
    setCredit(sanitized);
    setHasCalculated(false);
    setError(null);
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^-0-9]/g, "").replace(/(?!^)-/g, "");
    setMonths(sanitized);
    setHasCalculated(false);
    setError(null);
  };

  const handleSegmentChange = (val: "imovel" | "veiculo") => {
    setSegment(val);
    setHasCalculated(false);
    setError(null);
    const currentCredit = Number(credit) || 0;
    const currentMonths = Number(months) || 0;
    if (val === "veiculo") {
      if (currentCredit > 300000) setCredit("300000");
      if (currentMonths > 100) setMonths("100");
    } else {
      if (currentCredit > 500000) setCredit("500000");
      if (currentMonths > 220) setMonths("220");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 10) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhone(value);
    setError(null);
  };

  const calculateScenarios = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Por favor, preencha o seu nome completo.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }
    if (phone.length < 14) {
      setError("Por favor, insira um telefone de contato válido.");
      return;
    }
    if (!consent) {
      setError("Você precisa aceitar o aviso de privacidade para continuar.");
      return;
    }

    const creditNum = Number(credit);
    const monthsNum = Number(months);
    if (credit === "" || isNaN(creditNum) || creditNum <= 0) {
      setError("Valor de crédito inválido. O valor mínimo deve ser maior que zero.");
      return;
    }
    if (months === "" || isNaN(monthsNum) || monthsNum <= 0) {
      setError("Prazo inválido. O número de meses deve ser maior que zero.");
      return;
    }

    setHasCalculated(true);
  };

  const creditNum = Number(credit) || 0;
  const monthsNum = Number(months) || 0;

  let titaniumRate = 0;
  let confortoRate = 0;
  let confortoMonths = 0;

  if (segment === "imovel") {
    if (monthsNum <= 120) titaniumRate = 0.12;
    else if (monthsNum <= 180) titaniumRate = 0.15;
    else titaniumRate = 0.18;
    confortoMonths = Math.min(240, Math.round(monthsNum * 1.5));
    if (confortoMonths <= monthsNum) confortoMonths = 240;
    if (confortoMonths <= 120) confortoRate = 0.12;
    else if (confortoMonths <= 180) confortoRate = 0.15;
    else confortoRate = 0.18;
  } else {
    if (monthsNum <= 60) titaniumRate = 0.15;
    else if (monthsNum <= 84) titaniumRate = 0.18;
    else titaniumRate = 0.22;
    confortoMonths = Math.min(100, Math.round(monthsNum * 1.5));
    if (confortoMonths <= monthsNum) confortoMonths = 100;
    if (confortoMonths <= 60) confortoRate = 0.15;
    else if (confortoMonths <= 84) confortoRate = 0.18;
    else confortoRate = 0.22;
  }

  const titaniumInstallment = monthsNum > 0 ? (creditNum * (1 + titaniumRate)) / monthsNum : 0;
  const confortoInstallment = confortoMonths > 0 ? (creditNum * (1 + confortoRate)) / confortoMonths : 0;

  const getRecommendation = (): string => {
    if (segment === "imovel") {
      if (creditNum >= 1000000) {
        return "Para imóveis de alto padrão, a carta contemplada Titanium oferece a melhor relação custo-benefício do mercado.";
      }
      return "Carta contemplada imobiliária: crédito liberado sem burocracia bancária e sem os juros abusivos do financiamento.";
    } else {
      if (monthsNum <= 60) {
        return "Carta contemplada ideal para quem quer o veículo na mão com rapidez e custo reduzido.";
      }
      return "Parcelas que cabem no bolso com crédito já contemplado e pronto para usar.";
    }
  };

  const getWhatsAppUrl = (): string => {
    const currentInstallment = selectedPlan === "titanium" ? titaniumInstallment : confortoInstallment;
    const planName = selectedPlan === "titanium" ? "Titanium" : "Conforto";
    const segmentText = segment === "imovel" ? "Imobiliário" : "Veicular";
    const formattedCredit = creditNum.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const formattedInstallment = currentInstallment.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const message = `Olá, meu nome é ${name}. Simulei uma carta de ${formattedCredit} com parcelas de ${formattedInstallment} no segmento ${segmentText} (${planName}). Gostaria de mais informações.`;
    return `https://wa.me/5511951014269?text=${encodeURIComponent(message)}`;
  };

  const isCalculateDisabled = credit === "" || months === "";
  const fmt = (n: number): string => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <section id="simulador" className="bg-white-bg py-14 md:py-20 relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left: Copy & Regulated Info */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32">
            <div className="flex items-center gap-2">
              <span className="text-label text-green-dark/60">Simulador</span>

            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-[family-name:var(--font-montserrat)] font-bold text-green-dark leading-tight">
              Simule sua
              <br />
              carta contemplada
            </h2>
            <p className="font-sans text-base text-gray-text leading-relaxed">
              Descubra quanto você economiza em relação ao financiamento. Cartas contempladas são limitadas — a que cabe no seu bolso pode não estar disponível amanhã.
            </p>
            
            <div className="pt-8 border-t border-green-dark/5 space-y-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://evoyconsorcios.com.br/images/logo-banco-central.png"
                  alt="Regulado Banco Central"
                  className="h-10 w-auto opacity-80"
                />
                <p className="text-xs text-gray-text font-sans leading-relaxed">
                  Somos regulados pelo Banco Central do Brasil. Seus dados estão seguros conosco o tempo todo.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Simulator Widget Card */}
          <div className="lg:col-span-7 rounded-3xl p-8 md:p-10 space-y-8" style={{ backgroundColor: '#00382e' }}>
            <form onSubmit={calculateScenarios} className="space-y-6">
              
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-[family-name:var(--font-montserrat)] font-bold text-white/50 uppercase tracking-wider block mb-1">
                    Seu nome completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(null); }}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-white/10 border border-white/10 px-4 py-3.5 text-white placeholder:text-white/30 text-sm font-[family-name:var(--font-inter)] rounded-xl focus:outline-none focus:border-[#c8ff00]/50 focus:ring-1 focus:ring-[#c8ff00]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-[family-name:var(--font-montserrat)] font-bold text-white/50 uppercase tracking-wider block mb-1">
                    Seu melhor e-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    placeholder="Ex: joao@email.com"
                    className="w-full bg-white/10 border border-white/10 px-4 py-3.5 text-white placeholder:text-white/30 text-sm font-[family-name:var(--font-inter)] rounded-xl focus:outline-none focus:border-[#c8ff00]/50 focus:ring-1 focus:ring-[#c8ff00]/30 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-[family-name:var(--font-montserrat)] font-bold text-white/50 uppercase tracking-wider block mb-1">
                    WhatsApp / Celular
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="Ex: (11) 99999-9999"
                    className="w-full bg-white/10 border border-white/10 px-4 py-3.5 text-white placeholder:text-white/30 text-sm font-[family-name:var(--font-inter)] rounded-xl focus:outline-none focus:border-[#c8ff00]/50 focus:ring-1 focus:ring-[#c8ff00]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-[family-name:var(--font-montserrat)] font-bold text-white/50 uppercase tracking-wider block mb-1">
                    Tipo de carta
                  </label>
                  <div className="flex gap-2">
                    {(["imovel", "veiculo"] as const).map((seg) => (
                      <button
                        key={seg}
                        type="button"
                        onClick={() => handleSegmentChange(seg)}
                        className={cn(
                          "flex-1 py-3 text-xs uppercase tracking-wider font-bold rounded-xl transition-all duration-200",
                          segment === seg
                            ? "bg-[#c8ff00] text-[#00382e]"
                            : "bg-white/10 text-white/60 hover:bg-white/15"
                        )}
                      >
                        {seg === "imovel" ? "Imóvel" : "Veículo"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sliders Container */}
              <div className="pt-6 border-t border-white/10 space-y-6">
                
                {/* Credit Range */}
                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-xs font-[family-name:var(--font-montserrat)] font-bold text-white/50 uppercase tracking-wider">
                      Valor do Crédito
                    </span>
                    <span className="font-[family-name:var(--font-montserrat)] font-extrabold text-xl text-[#c8ff00]">
                      {fmt(creditNum)}
                    </span>
                  </div>
                  <div className="relative w-full h-6 flex items-center">
                    <div className="absolute left-0 right-0 h-2 rounded-full bg-white/10" />
                    <div
                      className="absolute left-0 h-2 rounded-full bg-[#c8ff00]"
                      style={{ width: `${((Math.min(Math.max(creditNum, minCredit), maxCredit) - minCredit) / (maxCredit - minCredit)) * 100}%` }}
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

                {/* Months Range */}
                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-xs font-[family-name:var(--font-montserrat)] font-bold text-white/50 uppercase tracking-wider">
                      Prazo
                    </span>
                    <span className="font-[family-name:var(--font-montserrat)] font-extrabold text-xl text-[#c8ff00]">
                      {months || "0"} <span className="text-sm font-medium text-white/50">meses</span>
                    </span>
                  </div>
                  <div className="relative w-full h-6 flex items-center">
                    <div className="absolute left-0 right-0 h-2 rounded-full bg-white/10" />
                    <div
                      className="absolute left-0 h-2 rounded-full bg-[#c8ff00]"
                      style={{ width: `${((Math.min(Math.max(Number(months) || 0, minMonths), maxMonths) - minMonths) / (maxMonths - minMonths)) * 100}%` }}
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

              {/* Consent Checklist */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="privacy-consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/20 accent-[#c8ff00]"
                />
                <label htmlFor="privacy-consent" className="text-xs text-white/40 leading-relaxed font-sans cursor-pointer select-none">
                  Concordo em fornecer as informações contidas neste formulário, necessárias para simulação e atendimento. Seus dados estão protegidos.
                </label>
              </div>

              <button
                type="submit"
                disabled={isCalculateDisabled}
                className={cn(
                  "w-full py-4 rounded-xl font-[family-name:var(--font-montserrat)] font-bold text-sm uppercase tracking-wider transition-all duration-300 bg-[#c8ff00] text-[#00382e] hover:brightness-110 hover:shadow-lg hover:shadow-[#c8ff00]/20",
                  isCalculateDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                Simular e Ver Planos →
              </button>

              {error && (
                <div className="text-xs text-red-500 font-sans border border-red-500/20 bg-red-50 p-3.5 rounded-xl">
                  {error}
                </div>
              )}
            </form>

            {/* Calculations results */}
            {hasCalculated && name && phone.length >= 14 && (
              <div className="pt-8 border-t border-green-dark/5 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Titanium Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("titanium")}
                    className={cn(
                      "text-left p-6 border rounded-2xl transition-all duration-300",
                      selectedPlan === "titanium"
                        ? "border-green-dark bg-green-light/20 shadow-sm"
                        : "border-green-dark/10 bg-white-pure hover:border-green-dark/25"
                    )}
                  >
                    <span className="font-[family-name:var(--font-montserrat)] font-bold text-xs uppercase tracking-wide text-green-dark/60 block mb-1">
                      Plano Titanium
                    </span>
                    <span className="text-[10px] font-[family-name:var(--font-montserrat)] uppercase tracking-wider text-green-bright font-extrabold block mb-4">
                      Menor Custo
                    </span>
                    <div className="font-[family-name:var(--font-montserrat)] text-2xl font-black text-green-dark mb-4">
                      {titaniumInstallment.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </div>
                    <div className="space-y-1 text-xs text-gray-text font-sans">
                      <div className="flex justify-between">
                        <span>Prazo</span>
                        <span className="text-green-dark font-semibold">{monthsNum} meses</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa Adm</span>
                        <span className="text-green-dark font-semibold">{(titaniumRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </button>

                  {/* Conforto Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("conforto")}
                    className={cn(
                      "text-left p-6 border rounded-2xl transition-all duration-300",
                      selectedPlan === "conforto"
                        ? "border-green-dark bg-green-light/20 shadow-sm"
                        : "border-green-dark/10 bg-white-pure hover:border-green-dark/25"
                    )}
                  >
                    <span className="font-[family-name:var(--font-montserrat)] font-bold text-xs uppercase tracking-wide text-green-dark/60 block mb-1">
                      Plano Conforto
                    </span>
                    <span className="text-[10px] font-[family-name:var(--font-montserrat)] uppercase tracking-wider text-green-dark/40 font-extrabold block mb-4">
                      Maior Prazo
                    </span>
                    <div className="font-[family-name:var(--font-montserrat)] text-2xl font-black text-green-dark mb-4">
                      {confortoInstallment.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </div>
                    <div className="space-y-1 text-xs text-gray-text font-sans">
                      <div className="flex justify-between">
                        <span>Prazo</span>
                        <span className="text-green-dark font-semibold">{confortoMonths} meses</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa Adm</span>
                        <span className="text-green-dark font-semibold">{(confortoRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="p-4 bg-white-bg rounded-2xl space-y-4">
                  <p className="text-sm text-gray-text leading-relaxed font-sans">
                    {getRecommendation()}
                  </p>
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center btn-evoy-accent"
                  >
                    Falar com especialista no WhatsApp
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

