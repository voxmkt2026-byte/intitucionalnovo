"use client";

import { useState } from "react";
import Link from "next/link";

export default function CadastroForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmar_senha: "",
    documento_cpf_cnpj: "",
    cpf: "",
    cnpj: "",
    data_nascimento: "",
    rg: "",
    endereco_completo: "",
    cidade: "",
    redes_sociais: "",
    banco: "",
    tipo_conta: "Corrente",
    agencia: "",
    conta: "",
    operacao: "",
    chave_pix: "",
    titular_nome: "",
    vende_consorcio: false,
    experiencia_administradoras: "",
    experiencia_volume: "",
    experiencia_segmentos: "",
    base_tamanho: "",
    base_canais: "",
    base_ticket_medio: "",
    principal_produto: "",
    trabalha_carta_contemplada: "Não",
    principal_publico: "",
    quantidade_indicacoes: "",
    quer_atuar_como: "",
    aceita_receber_contatos: false,
    quantidade_colaboradores: "",
    aceite_playbook: false,
    website_honeypot: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parceiroCriado, setParceiroCriado] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (parceiroCriado?.codigo_ref) {
      navigator.clipboard.writeText(parceiroCriado.codigo_ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const validateStep1 = () => {
    if (!formData.nome.trim()) return "Preencha seu nome completo.";
    if (!formData.telefone.trim()) return "Preencha seu WhatsApp/Telefone para contato.";
    if (!formData.email.trim() || !formData.email.includes("@")) return "Preencha um e-mail válido para acessar o portal.";
    if (!formData.senha || formData.senha.length < 6) return "A senha deve conter no mínimo 6 caracteres.";
    if (formData.senha !== formData.confirmar_senha) return "As senhas digitadas não coincidem.";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.cpf.trim() && !formData.cnpj.trim()) return "Preencha seu CPF ou CNPJ.";
    if (!formData.data_nascimento.trim()) return "Informe sua data de nascimento.";
    if (!formData.rg.trim()) return "Informe seu RG.";
    if (!formData.cidade.trim()) return "Informe sua cidade e estado.";
    if (!formData.endereco_completo.trim()) return "Informe seu endereço completo.";
    return null;
  };

  const nextStep = () => {
    setError("");
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.aceite_playbook) {
      setError("Você deve ler e aceitar o termo de compliance comercial.");
      return;
    }

    const step1Err = validateStep1();
    if (step1Err) { setError(step1Err); setStep(1); return; }

    const step2Err = validateStep2();
    if (step2Err) { setError(step2Err); setStep(2); return; }

    if (!formData.chave_pix.trim()) {
      setError("Informe sua chave PIX para comissionamento.");
      return;
    }

    setLoading(true);
    setError("");

    // Vincula o documento_cpf_cnpj ao CPF ou CNPJ
    const documento = formData.cnpj.trim() ? formData.cnpj.trim() : formData.cpf.trim();
    const payload = {
      ...formData,
      documento_cpf_cnpj: documento,
    };

    try {
      const response = await fetch("/api/colaboradores/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocorreu um erro ao realizar o cadastro.");
      }

      setParceiroCriado(data.parceiro);
      setStep(4); // Passo de sucesso
    } catch (err: any) {
      setError(err.message || "Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 sm:p-8 relative text-slate-800 font-jakarta">
      {/* Step Indicators */}
      {step < 4 && (
        <div className="border-b border-slate-200 pb-5 mb-6 select-none">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                step > 1 ? "bg-emerald-100 text-[#0A7B3E] border border-emerald-200" : step === 1 ? "bg-[#0A7B3E] text-white shadow-md shadow-[#0A7B3E]/30" : "bg-slate-100 text-slate-400"
              }`}>
                {step > 1 ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : "1"}
              </div>
              <div className="hidden xs:block text-left">
                <span className="block text-[9px] uppercase font-bold text-slate-400">Etapa 1</span>
                <span className={`text-[11px] font-bold transition-colors ${step >= 1 ? "text-slate-900" : "text-slate-400"}`}>Contato & Acesso</span>
              </div>
            </div>

            <div className="flex-1 h-[2px] bg-slate-100 mx-3 rounded-full overflow-hidden">
              <div className={`h-full bg-[#0A7B3E] transition-all duration-300 ${step === 1 ? "w-0" : step === 2 ? "w-1/2" : "w-full"}`} />
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                step > 2 ? "bg-emerald-100 text-[#0A7B3E] border border-emerald-200" : step === 2 ? "bg-[#0A7B3E] text-white shadow-md shadow-[#0A7B3E]/30" : "bg-slate-100 text-slate-400"
              }`}>
                {step > 2 ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : "2"}
              </div>
              <div className="hidden xs:block text-left">
                <span className="block text-[9px] uppercase font-bold text-slate-400">Etapa 2</span>
                <span className={`text-[11px] font-bold transition-colors ${step >= 2 ? "text-slate-900" : "text-slate-400"}`}>Documentação</span>
              </div>
            </div>

            <div className="flex-1 h-[2px] bg-slate-100 mx-3 rounded-full overflow-hidden">
              <div className={`h-full bg-[#0A7B3E] transition-all duration-300 ${step === 3 ? "w-full" : "w-0"}`} />
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                step === 3 ? "bg-[#0A7B3E] text-white shadow-md shadow-[#0A7B3E]/30" : "bg-slate-100 text-slate-400"
              }`}>
                3
              </div>
              <div className="hidden xs:block text-left">
                <span className="block text-[9px] uppercase font-bold text-slate-400">Etapa 3</span>
                <span className={`text-[11px] font-bold transition-colors ${step >= 3 ? "text-slate-900" : "text-slate-400"}`}>Comercial & PIX</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-5 leading-relaxed flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Honeypot field for bot protection */}
        <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
          <input
            type="text"
            name="website_honeypot"
            value={formData.website_honeypot}
            onChange={handleInputChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* ═══════════════════════════════════════════════════════
            STEP 1: Contato Inicial & Criação de Senha
            Progressive Disclosure: Fricção mínima
        ═══════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-[#E8F5EE]/60 border border-[#D1ECDD] rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0A7B3E] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                i
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-900">Inicie seu credenciamento</h4>
                <p className="text-[11px] text-slate-600 font-light leading-relaxed">
                  Crie sua credencial de acesso. Você usará este e-mail e senha para acompanhar seus clientes e comissões no painel.
                </p>
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Nome Completo / Razão Social *</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                placeholder="Ex: João da Silva ou Silva Consultoria"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-xs focus:border-[#0A7B3E] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">WhatsApp / Telefone *</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-xs focus:border-[#0A7B3E] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">E-mail para Login *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="seuemail@empresa.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-xs focus:border-[#0A7B3E] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Criação de Senha para Acesso ao Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Criar Senha de Acesso *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    required
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 pr-10 text-xs focus:border-[#0A7B3E] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer focus:outline-none"
                    title={showPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Confirmar Senha *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmar_senha"
                  value={formData.confirmar_senha}
                  onChange={handleInputChange}
                  required
                  placeholder="Repita sua senha"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-xs focus:border-[#0A7B3E] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <span className="text-[11px] text-slate-400 font-light">
                Já tem cadastro?{" "}
                <Link href="/colaboradores/portal/" className="text-[#0A7B3E] font-bold hover:underline">
                  Fazer Login
                </Link>
              </span>

              <button
                type="button"
                onClick={nextStep}
                className="px-7 py-3.5 rounded-xl bg-[#0A7B3E] hover:bg-[#086332] text-white font-bold transition-all text-xs uppercase tracking-wider cursor-pointer border-none shadow-md shadow-[#0A7B3E]/20 hover:shadow-lg flex items-center gap-2"
              >
                Continuar
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            STEP 2: Documentação & Endereço
        ═══════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-left mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Dados Pessoais e Fiscais</h3>
              <p className="text-[11px] text-slate-500 font-light">Necessários para validação de compliance e formalização do contrato de parceria.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">CPF *</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  required
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:border-[#0A7B3E] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">CNPJ (se PJ ou Corretora)</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0001-00"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:border-[#0A7B3E] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">RG *</label>
                <input
                  type="text"
                  name="rg"
                  value={formData.rg}
                  onChange={handleInputChange}
                  required
                  placeholder="Número do seu RG"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:border-[#0A7B3E] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Data de Nascimento *</label>
                <input
                  type="text"
                  name="data_nascimento"
                  value={formData.data_nascimento}
                  onChange={handleInputChange}
                  required
                  placeholder="DD/MM/AAAA"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:border-[#0A7B3E] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Cidade / Estado *</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: São Paulo - SP"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:border-[#0A7B3E] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">LinkedIn / Redes Sociais</label>
                <input
                  type="text"
                  name="redes_sociais"
                  value={formData.redes_sociais}
                  onChange={handleInputChange}
                  placeholder="linkedin.com/in/seu-perfil"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:border-[#0A7B3E] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Endereço Completo (Rua, nº, bairro, CEP) *</label>
              <input
                type="text"
                name="endereco_completo"
                value={formData.endereco_completo}
                onChange={handleInputChange}
                required
                placeholder="Ex: Av. Paulista, 1000, Apto 52, Bela Vista, CEP 01310-100"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:border-[#0A7B3E] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="pt-4 flex justify-between gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold transition-all text-xs uppercase tracking-wide cursor-pointer bg-white"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 rounded-xl bg-[#0A7B3E] hover:bg-[#086332] text-white font-bold transition-all text-xs uppercase tracking-wide cursor-pointer border-none shadow-md shadow-[#0A7B3E]/20 hover:shadow-lg flex items-center gap-2"
              >
                Continuar
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            STEP 3: Perfil Comercial, Dados Bancários & Termo
        ═══════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-4 text-left">
            
            {/* Informações Comerciais */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
              <h3 className="text-[10px] font-extrabold text-[#0A7B3E] uppercase tracking-wider">1. Perfil Comercial</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Trabalha com consórcio?</label>
                  <select
                    name="vende_consorcio"
                    value={formData.vende_consorcio ? "Sim" : "Não"}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, vende_consorcio: e.target.value === "Sim" }));
                    }}
                    required
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs focus:border-[#0A7B3E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all cursor-pointer font-semibold"
                  >
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Principal produto atual</label>
                  <select
                    name="principal_produto"
                    value={formData.principal_produto}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs focus:border-[#0A7B3E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all cursor-pointer font-semibold"
                  >
                    <option value="">Selecione...</option>
                    <option value="Consórcio Imobiliário">Consórcio Imobiliário</option>
                    <option value="Consórcio de Automóveis">Consórcio de Automóveis</option>
                    <option value="Consórcio de Caminhões/Máquinas">Consórcio de Caminhões/Máquinas</option>
                    <option value="Financiamento">Financiamento</option>
                    <option value="Empréstimos/Crédito">Empréstimos/Crédito</option>
                    <option value="Seguros">Seguros</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Já trabalha com carta contemplada?</label>
                  <select
                    name="trabalha_carta_contemplada"
                    value={formData.trabalha_carta_contemplada}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs focus:border-[#0A7B3E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all cursor-pointer font-semibold"
                  >
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Quer atuar como</label>
                  <select
                    name="quer_atuar_como"
                    value={formData.quer_atuar_como}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs focus:border-[#0A7B3E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all cursor-pointer font-semibold"
                  >
                    <option value="">Selecione...</option>
                    <option value="Indicador de Negócios">Indicador de Negócios</option>
                    <option value="Corretor de Consórcio">Corretor de Consórcio</option>
                    <option value="Colaborador Titanium">Colaborador Titanium</option>
                    <option value="Consultor Financeiro">Consultor Financeiro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Indicações estimadas / mês</label>
                  <select
                    name="quantidade_indicacoes"
                    value={formData.quantidade_indicacoes}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs focus:border-[#0A7B3E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all cursor-pointer font-semibold"
                  >
                    <option value="">Selecione...</option>
                    <option value="Até 5 indicações">Até 5 indicações</option>
                    <option value="6 a 15 indicações">6 a 15 indicações</option>
                    <option value="16 a 30 indicações">16 a 30 indicações</option>
                    <option value="Mais de 30 indicações">Mais de 30 indicações</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Principal público</label>
                  <select
                    name="principal_publico"
                    value={formData.principal_publico}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs focus:border-[#0A7B3E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all cursor-pointer font-semibold"
                  >
                    <option value="">Selecione...</option>
                    <option value="Pessoa Física (PF)">Pessoa Física (PF)</option>
                    <option value="Pessoa Jurídica (PJ)">Pessoa Jurídica (PJ)</option>
                    <option value="Produtor Rural / Agro">Produtor Rural / Agro</option>
                    <option value="Investidores">Investidores</option>
                    <option value="Todos os públicos">Todos os públicos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dados Bancários & PIX */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
              <h3 className="text-[10px] font-extrabold text-[#0A7B3E] uppercase tracking-wider">2. Dados para Recebimento de Comissões</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Chave PIX (Comissão direta) *</label>
                  <input
                    type="text"
                    name="chave_pix"
                    value={formData.chave_pix}
                    onChange={handleInputChange}
                    required
                    placeholder="CPF, CNPJ, E-mail ou Aleatória"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs focus:border-[#0A7B3E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Banco *</label>
                  <input
                    type="text"
                    name="banco"
                    value={formData.banco}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Itaú, Bradesco, Nubank, Inter"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs focus:border-[#0A7B3E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">Tipo</label>
                  <select
                    name="tipo_conta"
                    value={formData.tipo_conta}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-2 py-2 text-xs focus:border-[#0A7B3E] focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="Corrente">Corrente</option>
                    <option value="Poupança">Poupança</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">Agência *</label>
                  <input
                    type="text"
                    name="agencia"
                    value={formData.agencia}
                    onChange={handleInputChange}
                    required
                    placeholder="0001"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-2.5 py-2 text-xs focus:border-[#0A7B3E] focus:outline-none placeholder:text-slate-400 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">Conta *</label>
                  <input
                    type="text"
                    name="conta"
                    value={formData.conta}
                    onChange={handleInputChange}
                    required
                    placeholder="12345-6"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-2.5 py-2 text-xs focus:border-[#0A7B3E] focus:outline-none placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Termos & Aceite */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Termo de Parceria e Compliance Comercial</label>
              <div className="h-32 overflow-y-auto bg-slate-50 p-3.5 border border-slate-200 rounded-xl text-[10px] text-slate-600 space-y-2 font-light leading-relaxed scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                <p className="font-bold text-slate-800">TITANIUM CONSULTORIA FINANCEIRA - TERMO DE PARCERIA COMERCIAL</p>
                <p>
                  <strong>1. OBJETO:</strong> O presente termo define as regras para a indicação de potenciais clientes para assessoria de consórcio e cartas contempladas.
                </p>
                <p>
                  <strong>2. COMISSIONAMENTO:</strong> O colaborador fará jus à comissão pactuada por carta fechada e paga pelo cliente, creditada diretamente na conta/PIX cadastrada.
                </p>
                <p>
                  <strong>3. SEGURANÇA E BLINDAGEM:</strong> Todos os leads indicados são vinculados permanentemente ao código exclusivo do colaborador, eliminando conflitos de atribuição.
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-3 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  name="aceite_playbook"
                  id="aceite_playbook"
                  checked={formData.aceite_playbook}
                  onChange={handleInputChange}
                  className="w-4 h-4 mt-0.5 accent-[#0A7B3E] cursor-pointer shrink-0"
                />
                <label htmlFor="aceite_playbook" className="text-[10px] text-slate-700 cursor-pointer font-semibold leading-normal select-none">
                  Eu li, compreendi e aceito integralmente os termos de parceria, o playbook de compliance e autorizo o envio de comunicados operacionais.
                </label>
              </div>
            </div>

            <div className="pt-3 flex justify-between gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={prevStep}
                className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-all text-xs uppercase tracking-wide cursor-pointer bg-white"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.aceite_playbook || !formData.chave_pix || !formData.banco}
                className="px-7 py-3 rounded-xl bg-[#0A7B3E] hover:bg-[#086332] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold transition-all shadow-md text-xs uppercase tracking-wide cursor-pointer border-none flex items-center gap-2"
              >
                {loading ? "Registrando..." : "Concluir Cadastro"}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            STEP 4: Tela de Sucesso com Acesso Direto ao Dashboard
        ═══════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-[#0A7B3E] mx-auto shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#0A7B3E] text-[10px] font-bold uppercase tracking-wider">
                Credenciamento Realizado
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Parabéns, {parceiroCriado?.nome || formData.nome}!</h2>
              <p className="text-slate-500 text-xs font-light max-w-sm mx-auto leading-relaxed">
                Seu cadastro de parceiro e sua senha de acesso foram configurados com sucesso.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-sm mx-auto text-left space-y-3 shadow-sm">
              <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Seu código exclusivo de indicação</span>
                  <span className="font-mono text-base text-[#0A7B3E] font-extrabold">{parceiroCriado?.codigo_ref || "---"}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 bg-[#E8F5EE] text-[#0A7B3E] border border-[#D1ECDD] hover:bg-[#D1ECDD] cursor-pointer"
                >
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>

              <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Credencial de Login</span>
                <p className="text-xs text-slate-700 font-semibold truncate">
                  E-mail: <span className="font-normal text-slate-600">{formData.email}</span>
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/colaboradores/portal/"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0A7B3E] hover:bg-[#086332] text-white font-bold transition-all shadow-lg hover:shadow-[#0A7B3E]/30 text-xs uppercase tracking-wider cursor-pointer text-center"
              >
                Acessar Dashboard de Vendas →
              </Link>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
