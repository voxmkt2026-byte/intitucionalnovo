"use client";

import { useState } from "react";
import Link from "next/link";

interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  segment: string;
  credit: string;
  status: string;
  created_at: string;
}

interface Comissao {
  id: number;
  cliente_nome: string;
  valor_credito: number;
  comissao_valor: number;
  status_pagamento: string;
  criado_em: string;
}

interface Carta {
  id: number;
  segmento: string;
  administradora: string;
  valor_credito: number | string;
  entrada: number | string;
  parcelas: number;
  valor_parcela: number | string;
  proximo_vencimento: string | null;
  disponivel: boolean;
}

interface PortalDashboardProps {
  partnerName: string;
  partnerRef: string;
  initialLeads: Lead[];
  initialComissoes: Comissao[];
  initialCartas: Carta[];
}

export default function PortalDashboard({
  partnerName,
  partnerRef,
  initialLeads,
  initialComissoes,
  initialCartas,
}: PortalDashboardProps) {
  const [clients, setClients] = useState<Lead[]>(initialLeads);
  const [comissoes] = useState<Comissao[]>(initialComissoes);
  const [cartas] = useState<Carta[]>(initialCartas);
  
  // Client-side search and filters for Available Letters
  const [cartasSearch, setCartasSearch] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("Todos");

  // Modals States
  const [isScriptsOpen, setIsScriptsOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Form State for new client
  const [clientForm, setClientForm] = useState({
    name: "",
    phone: "",
    email: "",
    credit: "",
    segment: "Imóveis",
  });
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState("");
  const [clientSuccess, setClientSuccess] = useState("");

  const handleLogout = async () => {
    await fetch("/api/colaboradores/login", { method: "DELETE" });
    window.location.reload();
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError("");
    setClientSuccess("");
    setClientLoading(true);

    if (!clientForm.name.trim() || !clientForm.phone.trim()) {
      setClientError("Nome e WhatsApp/Celular são obrigatórios.");
      setClientLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientForm.name,
          phone: clientForm.phone,
          email: clientForm.email,
          segment: clientForm.segment,
          credit: clientForm.credit || "0",
          ref: partnerRef,
          origin: "Portal do Colaborador",
          lp: "portal",
          source_url: window.location.href,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao cadastrar cliente.");
      }

      // Add new client to local list
      const newClientObj: Lead = {
        id: result.id || Math.random(),
        name: clientForm.name,
        phone: clientForm.phone,
        email: clientForm.email,
        segment: clientForm.segment,
        credit: clientForm.credit || "—",
        status: "Novo",
        created_at: new Date().toISOString(),
      };

      setClients((prev) => [newClientObj, ...prev]);
      setClientSuccess("Cliente cadastrado com sucesso e integrado ao sistema!");
      setClientForm({
        name: "",
        phone: "",
        email: "",
        credit: "",
        segment: "Imóveis",
      });
      
      // Close modal after success delay
      setTimeout(() => {
        setIsNewClientOpen(false);
        setClientSuccess("");
      }, 1500);
    } catch (err: any) {
      setClientError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setClientLoading(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReserveLetter = (carta: Carta) => {
    const formattedCredit = Number(carta.valor_credito).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const formattedEntrada = Number(carta.entrada).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const textMessage = `Olá! Sou o colaborador ${partnerName} (REF: ${partnerRef}) e gostaria de solicitar a reserva da seguinte carta de consórcio contemplada:
    
• Administradora: ${carta.administradora}
• Segmento: ${carta.segmento}
• Valor do Crédito: ${formattedCredit}
• Valor da Entrada: ${formattedEntrada}
• Parcelas: ${carta.parcelas}x de R$ ${Number(carta.valor_parcela).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}

Por favor, me confirme a disponibilidade para prosseguirmos com a reserva.`;

    const wppLink = `https://wa.me/5511958340753?text=${encodeURIComponent(textMessage)}`;
    window.open(wppLink, "_blank");
  };

  const salesScripts = [
    {
      title: "Abordagem Inicial (WhatsApp)",
      description: "Ideal para iniciar conversa com produtores rurais, investidores e empresários da sua lista de contatos.",
      text: `Olá, tudo bem? Tenho acompanhado o mercado de crédito e notei que muitos empresários e produtores estão usando cartas contempladas de consórcio para adquirir imóveis, frotas e máquinas sem pagar os juros abusivos do financiamento tradicional.

Conseguimos opções com entrada reduzida e parcelas mensais bem atrativas já liberadas para faturamento imediato. Vamos fazer uma simulação rápida para o seu perfil?`
    },
    {
      title: "Contornando Objeções (Financiamento vs Consórcio)",
      description: "Use quando o cliente afirma que prefere fazer um financiamento bancário comum.",
      text: `Entendo perfeitamente sua dúvida, mas a grande diferença é que na carta contemplada da Titanium não existe cobrança de juros compostos, apenas uma taxa de administração diluída.

Enquanto no financiamento comum você paga até 2 ou 3 vezes o valor do bem, na carta contemplada o custo total do crédito fica em torno de 15% a 20% sobre o montante, gerando uma economia de até 60% no custo final do seu patrimônio. É crédito inteligente.`
    },
    {
      title: "Apresentação de Oportunidades / Fechamento",
      description: "Use para apresentar cartas específicas e chamar para o fechamento com nosso diretor.",
      text: `Consegui mapear em nosso estoque de cartas contempladas três opções que se alinham exatamente com o valor de investimento que você precisa para faturamento imediato do bem.

Temos, por exemplo, uma carta com crédito líquido de R$ 500.000,00 com parcelas de R$ 3.800,00. Efetuando a transferência, o recurso fica disponível para compra em até 10 dias úteis. Qual o melhor horário hoje para alinharmos os detalhes com o nosso diretor financeiro?`
    }
  ];

  // Filters calculation
  const filteredCartas = cartas.filter((c) => {
    const matchesSearch = c.administradora.toLowerCase().includes(cartasSearch.toLowerCase()) || 
                          c.segmento.toLowerCase().includes(cartasSearch.toLowerCase());
    const matchesSegment = selectedSegment === "Todos" || c.segmento.toLowerCase() === selectedSegment.toLowerCase();
    return matchesSearch && matchesSegment;
  });

  // Calculate stats
  const totalClients = clients.length;
  const activeCommissions = comissoes
    .filter((c) => c.status_pagamento !== "pago")
    .reduce((sum, c) => sum + Number(c.comissao_valor), 0);
  const paidCommissions = comissoes
    .filter((c) => c.status_pagamento === "pago")
    .reduce((sum, c) => sum + Number(c.comissao_valor), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8 font-jakarta text-slate-800 selection:bg-emerald-500 selection:text-white">
      
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block font-sans">Colaborador Ativo</span>
          <h2 className="text-xl font-bold text-slate-900">{partnerName}</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1.5 rounded-lg font-mono font-semibold">
            REF: {partnerRef}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Sair do Painel
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Meus Clientes Cadastrados</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">{totalClients}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Comissão A Receber</span>
          <span className="text-xl sm:text-2xl font-bold text-amber-600">
            R$ {activeCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Comissão Recebida</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600">
            R$ {paidCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Support & Kit Grid (Side-by-Side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Support Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Apoio ao Colaborador</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Acesse a pasta de criativos oficiais para divulgação ou entre em contato diretamente com a nossa equipe de suporte comercial.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="https://drive.google.com/drive/folders/1L7KTF0dkMQAFVR_BtFxX4VaroLjHcNoh?hl=pt-br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 00.375-7.485 4.5 4.5 0 00-9-3.484 3.75 3.75 0 00-6.75 3.585A4.478 4.478 0 002.25 15z" />
              </svg>
              Drive de Criativos
            </a>
            <a
              href="https://wa.me/5511958340753?text=Ol%C3%A1%2C+preciso+de+suporte+da+Titanium+sobre+meus+clientes."
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-[#0A7B3E] hover:bg-[#086332] text-white text-xs font-bold uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.089.534 4.055 1.475 5.77L0 24l6.407-1.453A11.957 11.957 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.497-5.22-1.367l-.375-.222-3.887.882.913-3.781-.244-.39A9.941 9.941 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Suporte WhatsApp
            </a>
          </div>
        </div>

        {/* Kit Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Kit de Ferramentas</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Baixe materiais informativos, acesse as taxas comerciais ou utilize os roteiros e scripts prontos criados para acelerar suas prospecções.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 pt-2">
            <a
              href="/cartas/apresentacao-institucional.pdf"
              download
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-500/30 hover:bg-slate-100/50 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-700"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Apresentação</span>
            </a>
            <Link
              href="/cartas-contempladas"
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-500/30 hover:bg-slate-100/50 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-700"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 18.375v-5.25zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-9.75zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Tabela Comercial</span>
            </Link>
            <button
              onClick={() => setIsScriptsOpen(true)}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-500/30 hover:bg-slate-100/50 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-700 font-sans"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Scripts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Available Letters Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Estoque de Cartas Disponíveis</h3>
            <p className="text-xs text-slate-400 font-light mt-0.5">Confira o estoque ativo de consórcios contemplados e reserve para seus clientes.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar administradora..."
              value={cartasSearch}
              onChange={(e) => setCartasSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors w-full sm:w-48 text-slate-800"
            />
          </div>
        </div>

        {/* Segment Filters Pills */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-4">
          {["Todos", "Imóveis", "Veículos", "Agro", "Pesados", "Placas Solares"].map((seg) => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                selectedSegment === seg
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {seg}
            </button>
          ))}
        </div>

        {/* Letters List */}
        {filteredCartas.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center font-light">Nenhuma carta disponível correspondente aos filtros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Segmento</th>
                  <th className="pb-3">Administradora</th>
                  <th className="pb-3">Crédito</th>
                  <th className="pb-3">Entrada</th>
                  <th className="pb-3">Parcelas</th>
                  <th className="pb-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCartas.map((carta) => (
                  <tr key={carta.id} className="text-slate-600 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-medium text-slate-900">{carta.segmento}</td>
                    <td className="py-3.5 font-light">{carta.administradora}</td>
                    <td className="py-3.5 font-bold text-slate-900">
                      {Number(carta.valor_credito).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="py-3.5 font-light">
                      {Number(carta.entrada).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="py-3.5 font-light">
                      {carta.parcelas}x de R$ {Number(carta.valor_parcela).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleReserveLetter(carta)}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm transition-all border-none cursor-pointer"
                      >
                        Reservar (Wpp)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clientes & Financeiro Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gestão de Clientes (Takes 2 Columns) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 overflow-x-auto lg:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Gestão de Clientes</h3>
              <p className="text-[11px] text-slate-400 font-light mt-0.5">Organize seus contatos ativos de clientes interessados em consórcios.</p>
            </div>
            <button
              onClick={() => setIsNewClientOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border-none"
            >
              ＋ Cadastrar Cliente
            </button>
          </div>

          {clients.length === 0 ? (
            <p className="text-xs text-slate-400 py-10 text-center font-light">Nenhum cliente cadastrado ainda. Use o botão acima para adicionar.</p>
          ) : (
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Data</th>
                  <th className="pb-3">Nome do Cliente</th>
                  <th className="pb-3">Segmento</th>
                  <th className="pb-3">Crédito Pretendido</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <tr key={client.id} className="text-slate-600 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-light">
                      {new Date(client.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-900">{client.name}</div>
                      <div className="text-[10px] text-slate-400 font-light font-mono">{client.phone}</div>
                    </td>
                    <td className="py-3.5 font-light">{client.segment}</td>
                    <td className="py-3.5 font-light">
                      {client.credit && !isNaN(Number(client.credit.replace(/[^\d.]/g, "")))
                        ? Number(client.credit.replace(/[^\d.]/g, "")).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
                        : `R$ ${client.credit}`}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        client.status === "Vendido" || client.status === "Ganho" || client.status === "Contemplado"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : client.status === "Perdido"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Extrato de Comissões (Takes 1 Column) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 overflow-x-auto lg:col-span-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Comissões</h3>
            <p className="text-[11px] text-slate-400 font-light mt-0.5">Últimos lançamentos financeiros associados.</p>
          </div>
          {comissoes.length === 0 ? (
            <p className="text-xs text-slate-400 py-10 text-center font-light">Nenhum lançamento registrado.</p>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {comissoes.map((c) => (
                <div key={c.id} className="border-b border-slate-100 pb-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">{c.cliente_nome}</span>
                    <span className="text-[10px] text-slate-400 font-light">
                      {new Date(c.criado_em).toLocaleDateString("pt-BR")} • Crédito R$ {Number(c.valor_credito).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 block">
                      + R$ {Number(c.comissao_valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      c.status_pagamento === "pago"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {c.status_pagamento === "pago" ? "Pago" : "Pendente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Scripts Modal */}
      {isScriptsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-[#0A7B3E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Scripts de Abordagem & Vendas</h3>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Utilize os modelos abaixo para prospectar clientes e fechar negócios.</p>
                </div>
              </div>
              <button
                onClick={() => setIsScriptsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer border-none font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {salesScripts.map((script, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 relative group">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{script.title}</h4>
                      <p className="text-[11px] text-slate-400 font-light mt-0.5">{script.description}</p>
                    </div>
                    <button
                      onClick={() => handleCopyText(script.text, idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                        copiedIndex === idx
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-50 hover:bg-emerald-100 text-[#0A7B3E]"
                      }`}
                    >
                      {copiedIndex === idx ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Copiado!
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-3a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.375h.008v.008H6.75V7.375zm0 3h.008v.008H6.75v-.008zm0 3h.008v.008H6.75v-.008z" />
                          </svg>
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs text-slate-600 font-light whitespace-pre-wrap leading-relaxed font-sans bg-white border border-slate-150 p-4 rounded-xl max-h-40 overflow-y-auto">
                    {script.text}
                  </pre>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setIsScriptsOpen(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer border-none"
              >
                Fechar Roteiros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Client Modal Form */}
      {isNewClientOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-[#0A7B3E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                <div>
                  <h3 className="text-md font-bold text-slate-900">Cadastrar Novo Cliente</h3>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Insira os dados do lead para registro e remarketing no sistema.</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewClientOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer border-none font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-6 space-y-4">
              {clientError && (
                <div className="p-3 bg-rose-50 border border-rose-150 text-rose-700 text-xs rounded-xl">
                  {clientError}
                </div>
              )}
              {clientSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs rounded-xl">
                  {clientSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">WhatsApp / Celular</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: (11) 99999-9999"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">E-mail (opcional)</label>
                <input
                  type="email"
                  placeholder="Ex: cliente@email.com"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Segmento de Interesse</label>
                  <select
                    value={clientForm.segment}
                    onChange={(e) => setClientForm({ ...clientForm, segment: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                  >
                    <option value="Imóveis">Imóveis</option>
                    <option value="Veículos">Veículos</option>
                    <option value="Agro">Agro</option>
                    <option value="Pesados">Pesados</option>
                    <option value="Placas Solares">Placas Solares</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Crédito Pretendido</label>
                  <input
                    type="text"
                    placeholder="Ex: 500.000"
                    value={clientForm.credit}
                    onChange={(e) => setClientForm({ ...clientForm, credit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewClientOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase rounded-xl transition-all border-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={clientLoading}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md border-none cursor-pointer"
                >
                  {clientLoading ? "Gravando..." : "Gravar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
