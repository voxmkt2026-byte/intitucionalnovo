"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CadastroColaboradorPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: "",
    documento_cpf_cnpj: "",
    cpf: "",
    cnpj: "",
    data_nascimento: "",
    rg: "",
    endereco_completo: "",
    email: "",
    telefone: "",
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [parceiroCriado, setParceiroCriado] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.aceite_playbook) {
      setError("Você deve ler e aceitar o playbook de compliance comercial.");
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

      setSuccess(data.message);
      setParceiroCriado(data.parceiro);
      setStep(4); // Passo de sucesso
    } catch (err: any) {
      setError(err.message || "Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50 text-slate-900 font-jakarta selection:bg-emerald-500 selection:text-white py-28 px-4 min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="max-w-2xl w-full relative z-10">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Torne-se um Colaborador Titanium
            </h1>
            <p className="text-slate-500 font-light text-sm sm:text-base">
              Preencha o cadastro operacional e assine o contrato digital.
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-8 relative">
            {/* Step Indicators */}
            {step < 4 && (
              <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                    1
                  </div>
                  <span className={`hidden sm:inline text-xs font-semibold ${step >= 1 ? "text-slate-900" : "text-slate-400"}`}>Identificação</span>
                </div>
                <div className="flex-1 h-[1px] bg-slate-200 mx-4" />
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                    2
                  </div>
                  <span className={`hidden sm:inline text-xs font-semibold ${step >= 2 ? "text-slate-900" : "text-slate-400"}`}>Perfil & Base</span>
                </div>
                <div className="flex-1 h-[1px] bg-slate-200 mx-4" />
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                    3
                  </div>
                  <span className={`hidden sm:inline text-xs font-semibold ${step >= 3 ? "text-slate-900" : "text-slate-400"}`}>Termos & Aceite</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
                {error}
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

              {/* STEP 1: Identificação */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome Completo / Razão Social</label>
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        required
                        placeholder="Insira seu nome ou razão social"
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">CPF</label>
                      <input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        required
                        placeholder="Apenas números"
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">CNPJ (se aplicável)</label>
                      <input
                        type="text"
                        name="cnpj"
                        value={formData.cnpj}
                        onChange={handleInputChange}
                        placeholder="Apenas números"
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Data de Nascimento</label>
                      <input
                        type="text"
                        name="data_nascimento"
                        value={formData.data_nascimento}
                        onChange={handleInputChange}
                        required
                        placeholder="DD/MM/AAAA"
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">RG</label>
                      <input
                        type="text"
                        name="rg"
                        value={formData.rg}
                        onChange={handleInputChange}
                        required
                        placeholder="Insira seu RG"
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cidade / Estado</label>
                      <input
                        type="text"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: São Paulo - SP"
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Endereço completo (Rua, nº, bairro, cidade, UF, CEP)</label>
                    <input
                      type="text"
                      name="endereco_completo"
                      value={formData.endereco_completo}
                      onChange={handleInputChange}
                      required
                      placeholder="Ex: Av. Paulista, 1000 - Bela Vista - São Paulo - SP - CEP 01310-100"
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">WhatsApp / Telefone</label>
                      <input
                        type="tel"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: (11) 99999-9999"
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">E-mail</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: colaborador@empresa.com"
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Link Redes Sociais</label>
                    <input
                      type="text"
                      name="redes_sociais"
                      value={formData.redes_sociais}
                      onChange={handleInputChange}
                      placeholder="Ex: linkedin.com/in/seu-perfil"
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!formData.nome || !formData.cpf || !formData.data_nascimento || !formData.rg || !formData.endereco_completo || !formData.email || !formData.telefone || !formData.cidade}
                      className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold transition-colors text-sm uppercase tracking-wide cursor-pointer"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Perfil Comercial & Dados Bancários */}
              {step === 2 && (
                <div className="space-y-6">
                  
                  {/* 1. Informações Comerciais */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wide">1. Informações Comerciais Complementares</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Você trabalha com consórcio?</label>
                        <select
                           name="vende_consorcio"
                           value={formData.vende_consorcio ? "Sim" : "Não"}
                           onChange={(e) => {
                             setFormData((prev) => ({ ...prev, vende_consorcio: e.target.value === "Sim" }));
                           }}
                           required
                           className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                        >
                          <option value="Não">Não</option>
                          <option value="Sim">Sim</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Principal produto atual</label>
                        <select
                          name="principal_produto"
                          value={formData.principal_produto}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Já trabalha com carta contemplada?</label>
                        <select
                          name="trabalha_carta_contemplada"
                          value={formData.trabalha_carta_contemplada}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                        >
                          <option value="Não">Não</option>
                          <option value="Sim">Sim</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Principal público</label>
                        <select
                          name="principal_publico"
                          value={formData.principal_publico}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Quantidade média de indicações / mês</label>
                        <select
                          name="quantidade_indicacoes"
                          value={formData.quantidade_indicacoes}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                        >
                          <option value="">Selecione...</option>
                          <option value="Atá 5 indicações">Até 5 indicações</option>
                          <option value="6 a 15 indicações">6 a 15 indicações</option>
                          <option value="16 a 30 indicações">16 a 30 indicações</option>
                          <option value="Mais de 30 indicações">Mais de 30 indicações</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Quer atuar como</label>
                        <select
                          name="quer_atuar_como"
                          value={formData.quer_atuar_como}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                        >
                          <option value="">Selecione...</option>
                          <option value="Indicador de Negócios">Indicador de Negócios</option>
                          <option value="Corretor de Consórcio">Corretor de Consórcio</option>
                          <option value="Colaborador Titanium">Colaborador Titanium</option>
                          <option value="Consultor Financeiro">Consultor Financeiro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Colaboradores na operação</label>
                        <select
                          name="quantidade_colaboradores"
                          value={formData.quantidade_colaboradores}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                        >
                          <option value="">Selecione...</option>
                          <option value="Apenas eu">Apenas eu</option>
                          <option value="1 a 4 colaboradores">1 a 4 colaboradores</option>
                          <option value="5 a 10 colaboradores">5 a 10 colaboradores</option>
                          <option value="11 a 50 colaboradores">11 a 50 colaboradores</option>
                          <option value="Mais de 50 colaboradores">Mais de 50 colaboradores</option>
                        </select>
                      </div>
                      
                      <div className="flex flex-col justify-end pb-1.5">
                        <div className="flex items-center gap-3 bg-white border border-slate-300 p-2.5 rounded-xl">
                          <input
                            type="checkbox"
                            name="aceita_receber_contatos"
                            id="aceita_receber_contatos"
                            checked={formData.aceita_receber_contatos}
                            onChange={(e) => {
                              setFormData((prev) => ({ ...prev, aceita_receber_contatos: e.target.checked }));
                            }}
                            className="w-4 h-4 accent-emerald-500 cursor-pointer"
                          />
                          <label htmlFor="aceita_receber_contatos" className="text-xs text-slate-700 cursor-pointer font-light select-none">
                            Aceito receber contatos e materiais da Titanium.
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Dados Bancários */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wide">2. Dados Bancários (Para Pagamento de Comissão)</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Banco</label>
                        <input
                          type="text"
                          name="banco"
                          value={formData.banco}
                          onChange={handleInputChange}
                          required
                          placeholder="Ex: Itaú, Bradesco, Nubank"
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tipo de conta</label>
                        <select
                          name="tipo_conta"
                          value={formData.tipo_conta}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                        >
                          <option value="Corrente">Conta Corrente</option>
                          <option value="Poupança">Conta Poupança</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Agência</label>
                        <input
                          type="text"
                          name="agencia"
                          value={formData.agencia}
                          onChange={handleInputChange}
                          required
                          placeholder="0001"
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Conta</label>
                        <input
                          type="text"
                          name="conta"
                          value={formData.conta}
                          onChange={handleInputChange}
                          required
                          placeholder="12345-6"
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Operação</label>
                        <input
                          type="text"
                          name="operacao"
                          value={formData.operacao}
                          onChange={handleInputChange}
                          placeholder="Se houver"
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Chave PIX</label>
                        <input
                          type="text"
                          name="chave_pix"
                          value={formData.chave_pix}
                          onChange={handleInputChange}
                          required
                          placeholder="CPF, CNPJ, Email ou Pix Aleatório"
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Titular da Conta (Se diferente)</label>
                        <input
                          type="text"
                          name="titular_nome"
                          value={formData.titular_nome}
                          onChange={handleInputChange}
                          placeholder="Nome completo do titular"
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors text-sm cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={
                        !formData.banco ||
                        !formData.agencia ||
                        !formData.conta ||
                        !formData.chave_pix ||
                        !formData.principal_produto ||
                        !formData.principal_publico ||
                        !formData.quantidade_indicacoes ||
                        !formData.quer_atuar_como ||
                        !formData.quantidade_colaboradores
                      }
                      className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold transition-colors text-sm uppercase tracking-wide cursor-pointer"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Termo & Aceite */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Termo de Parceria e Compliance Comercial</label>
                    <div className="h-60 overflow-y-auto bg-slate-50 p-4 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-4 font-light leading-relaxed">
                      <p className="font-semibold text-slate-800 text-center">TITANIUM CONSULTORIA FINANCEIRA - TERMO DE PARCERIA COMERCIAL</p>
                      <p>
                        <strong>1. OBJETO:</strong> O presente termo define as regras para a indicação de potenciais clientes para assessoria de consórcio e compra de cartas contempladas da Titanium Consultoria.
                      </p>
                      <p>
                        <strong>2. COMISSIONAMENTO:</strong> O colaborador fará jus à comissão pactuada por carta fechada e paga pelo cliente. A apuração ocorre com base nas planilhas consolidadas do financeiro da Titanium.
                      </p>
                      <p>
                        <strong>3. COMPLIANCE COMERCIAL (Regras de Ouro):</strong>
                        <br />
                        a) Compromisso absoluto de não alterar promessas comerciais contidas no playbook.
                        <br />
                        b) É expressamente proibido receber qualquer valor direto dos clientes indicados. Todos os pagamentos devem ser direcionados às contas oficiais das administradoras ou da Titanium.
                        <br />
                        c) Proibido utilizar ou reproduzir a marca da Titanium Consultoria em mídias sociais ou anúncios próprios sem prévia autorização por escrito.
                      </p>
                      <p>
                        <strong>4. SEGURANÇA DE LEADS:</strong> Todos os leads indicados através do link exclusivo ou cadastrados diretamente no portal serão inseridos nos CRMs corporativos (Kommo/Agendor) sob o ID de atribuição do colaborador, impedindo disputas comerciais internas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 p-4 border border-slate-200 rounded-xl mt-4">
                    <input
                      type="checkbox"
                      name="aceite_playbook"
                      id="aceite_playbook"
                      checked={formData.aceite_playbook}
                      onChange={handleInputChange}
                      className="w-4 h-4 mt-0.5 accent-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="aceite_playbook" className="text-xs text-slate-700 cursor-pointer font-light leading-relaxed">
                      Eu li, compreendi e concordo integralmente com os termos de parceria, o playbook de integridade comercial e a política de privacidade da Titanium Consultoria. Entendo que este aceite digital possui validade jurídica.
                    </label>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={prevStep}
                      className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors text-sm cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.aceite_playbook}
                      className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold transition-all shadow-lg hover:shadow-emerald-500/10 text-sm uppercase tracking-wide cursor-pointer"
                    >
                      {loading ? "Processando..." : "Assinar e Finalizar"}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Sucesso */}
              {step === 4 && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 mx-auto">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Cadastro Enviado!</h2>
                    <p className="text-slate-500 text-sm font-light max-w-sm mx-auto leading-relaxed">
                      Obrigado, <strong>{parceiroCriado?.nome}</strong>. Seus dados e contrato digital foram registrados com sucesso.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto text-left space-y-2.5">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Seu código de indicação:</span>
                      <span className="font-mono text-sm text-emerald-600 font-bold">{parceiroCriado?.codigo_ref}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Status atual:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        {parceiroCriado?.status_onboarding}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs font-light max-w-sm mx-auto">
                    Nossa equipe comercial fará a validação de compliance de sua base e ativará seu portal dentro do prazo de 24 horas úteis.
                  </p>

                  <div className="pt-4 flex justify-center gap-4">
                    <Link
                      href="/colaboradores/"
                      className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors text-sm cursor-pointer"
                    >
                      Voltar para Início
                    </Link>
                    <Link
                      href="/colaboradores/portal/"
                      className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors text-sm uppercase tracking-wide cursor-pointer"
                    >
                      Acessar Portal
                    </Link>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
