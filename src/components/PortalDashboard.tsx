"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AdministradoraLogo from "@/components/AdministradoraLogo";

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

interface ChatMessage {
  id: string;
  sender: "assistant" | "user";
  text: string;
  timestamp: string;
  actionWpp?: string;
}

// Números Oficiais da Titanium
const WPP_AFILIADOS = "5511958340753"; // Suporte Exclusivo a Afiliados / Mesa de Parcerias
const WPP_OFICIAL = "5511930048940";   // Atendimento Geral / Clientes

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
  
  // Navigation tab & scroll state
  const [activeNav, setActiveNav] = useState<"dashboard" | "cartas" | "clientes" | "extrato" | "scripts">("dashboard");
  
  // Section Refs for smooth scrolling
  const dashboardRef = useRef<HTMLDivElement>(null);
  const cartasRef = useRef<HTMLDivElement>(null);
  const clientesRef = useRef<HTMLDivElement>(null);
  const extratoRef = useRef<HTMLDivElement>(null);

  // Saudação Dinâmica
  const [greeting, setGreeting] = useState("Olá");
  const [referralCopied, setReferralCopied] = useState(false);

  // Client-side search and filters for Available Letters
  const [cartasSearch, setCartasSearch] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("Todos");

  // Modals & Lateral Chat States
  const [isScriptsOpen, setIsScriptsOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // AI Copilot State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

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

  // Handler para Navegação do Menu Lateral
  const handleNavClick = (navId: "dashboard" | "cartas" | "clientes" | "extrato" | "scripts") => {
    setActiveNav(navId);

    if (navId === "dashboard") {
      dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (navId === "cartas") {
      cartasRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (navId === "clientes") {
      clientesRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (navId === "extrato") {
      extratoRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (navId === "scripts") {
      setIsScriptsOpen(true);
    }
  };

  // Calcular saudação baseada na hora do dia
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Bom dia");
    else if (hour >= 12 && hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  // Inicializar primeira mensagem do Chat de IA
  useEffect(() => {
    const firstName = partnerName ? partnerName.split(" ")[0] : "Parceiro";
    setMessages([
      {
        id: "welcome-1",
        sender: "assistant",
        text: `Olá, ${firstName}! Sou seu Copiloto Titanium AI. Estou aqui para tirar dúvidas técnicas sobre consórcios, prazos de faturamento, comissões no PIX e estratégias para seus clientes. Como posso te apoiar?`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [partnerName]);

  useEffect(() => {
    if (isAIChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAIChatOpen]);

  const handleLogout = async () => {
    await fetch("/api/colaboradores/login", { method: "DELETE" });
    window.location.reload();
  };

  const handleCopyReferralLink = () => {
    const url = `${window.location.origin}/?ref=${partnerRef}`;
    navigator.clipboard.writeText(url);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2500);
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
      setClientSuccess("Cliente cadastrado com sucesso e blindado no seu CRM!");
      setClientForm({
        name: "",
        phone: "",
        email: "",
        credit: "",
        segment: "Imóveis",
      });
      
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
    const textMessage = `Olá! Sou o parceiro ${partnerName} (REF: ${partnerRef}) e gostaria de solicitar a reserva da seguinte carta contemplada para o meu cliente:
    
• Administradora: ${carta.administradora}
• Segmento: ${carta.segmento}
• Crédito: ${formattedCredit}
• Entrada: ${formattedEntrada}
• Parcelas: ${carta.parcelas}x de R$ ${Number(carta.valor_parcela).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}

Poderiam verificar a documentação e me orientar no fechamento?`;

    const wppLink = `https://wa.me/${WPP_AFILIADOS}?text=${encodeURIComponent(textMessage)}`;
    window.open(wppLink, "_blank");
  };

  // Motor Inteligente do Chat Titanium AI
  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputMessage;
    if (!message.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: message,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "";
      let actionWppText = "";
      const lower = message.toLowerCase();

      if (lower.includes("comiss") || lower.includes("pagamento") || lower.includes("pix") || lower.includes("quanto ganho")) {
        replyText = `Sua comissão varia entre 1% a 2% do valor do crédito faturado. O pagamento é realizado diretamente via PIX para sua conta assim que a cota for formalizada e liquidada pela administradora.`;
        actionWppText = `Olá, gostaria de tirar dúvidas sobre o faturamento de comissão do meu parceiro (REF: ${partnerRef}).`;
      } else if (lower.includes("prazo") || lower.includes("demora") || lower.includes("quanto tempo") || lower.includes("libera")) {
        replyText = `O prazo médio para transferência de titularidade de carta contemplada é de 7 a 15 dias úteis após o envio dos documentos do cliente. Assim que aprovado pelo BACEN/administradora, o crédito fica disponível para a compra imediata.`;
        actionWppText = `Olá, preciso checar o prazo médio de aprovação para uma carta contemplada com a mesa técnica.`;
      } else if (lower.includes("document") || lower.includes("doc") || lower.includes("exig")) {
        replyText = `Documentos necessários:\n• PF: RG, CPF, Comprovante de Residência recente e Comprovante de Renda (IRPF ou holerites).\n• PJ: Contrato Social, Cartão CNPJ, Balanço/DRE ou extratos dos últimos 3 meses.`;
        actionWppText = `Olá! Quero enviar a documentação de um cliente indicado para validação da mesa.`;
      } else if (lower.includes("objeç") || lower.includes("financiamento") || lower.includes("juro") || lower.includes("argumento")) {
        replyText = `Argumento de impacto: no financiamento bancário comum, o cliente paga de 2 a 3 vezes o valor do bem por conta dos juros compostos. Na carta contemplada, o custo total é até 60% menor pois não há juros compostos, apenas taxa administrativa diluída.`;
        actionWppText = `Olá! Gostaria de uma simulação comparativa (Financiamento vs Consórcio) para apresentar a um cliente.`;
      } else if (lower.includes("número") || lower.includes("telefone") || lower.includes("contato") || lower.includes("whatsapp")) {
        replyText = `Canais Oficiais da Titanium:\n1. 📲 WhatsApp de Afiliados: (11) 95834-0753 (mesa direta para você).\n2. 🏢 WhatsApp Geral & Clientes: (11) 93004-8940.`;
        actionWppText = `Olá, equipe Titanium! Sou o parceiro ${partnerName} e preciso de atendimento da mesa de afiliados.`;
      } else {
        replyText = `Excelente pergunta! Nossa mesa técnica comercial está disponível em linha direta para te apoiar em qualquer negociação ou simulação sob medida.`;
        actionWppText = `Olá mesa técnica! Sou o parceiro ${partnerName} (REF: ${partnerRef}) e gostaria de apoio para: "${message}"`;
      }

      const assistantMsg: ChatMessage = {
        id: `assist-${Date.now()}`,
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        actionWpp: actionWppText,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 500);
  };

  const quickPrompts = [
    "Como funciona a comissão no PIX?",
    "Qual o prazo de liberação da cota?",
    "Quais documentos o cliente precisa enviar?",
    "Qual a economia vs. financiamento?",
  ];

  {/* ═══════════════════════════════════════════════════════
      HORMOZI $100M OFFERS & DIRECT RESPONSE SALES SCRIPTS
      Framework: Hook + Value Stack + Anti-Risco + Matrix de Objeção + CTA
  ═══════════════════════════════════════════════════════ */}
  const salesScripts = [
    {
      title: "1. Abordagem Consultiva de Alto Valor (Imóveis & Lotes — R$ 300k a R$ 2.5M)",
      description: "Ideal para iniciar conversa no WhatsApp com produtores rurais, investidores imobiliários e empresários.",
      text: `Olá [Nome], tudo bem? Acompanhando a movimentação do mercado de crédito, notei que você busca expandir seu patrimônio imobiliário.

Antes de solicitar um financiamento bancário comum e assumir juros compostos que custam até 3x o valor do imóvel, gostaria de te apresentar uma análise consultiva com as cartas contempladas que movimentamos na Titanium.

Temos cotas verificadas de R$ 500.000,00 a R$ 2.500.000,00 com parcelas enxutas e faturamento disponível sem juros de banco. Posso rodar uma simulação sob medida para o seu objetivo?`
    },
    {
      title: "2. Aceleração de Frota & Logística (Veículos & Pesados — R$ 100k a R$ 600k)",
      description: "Para empresários de transporte, agronegócio e logística que precisam renovar frotas sem descapitalizar o caixa.",
      text: `Olá [Nome], tudo bem? Sei que descapitalizar o caixa para comprar veículos ou maquinário pesado compromete a saúde financeira do negócio.

Na Titanium, estruturamos aquisições através de cartas de crédito onde você obtém a cota liberada com entrada facilitada e custo total até 60% inferior ao leasing ou financiamento bancário.

Temos cotas prontas de R$ 150.000,00 e R$ 400.000,00 liberadas nesta semana. Qual o melhor horário hoje para alinharmos os números com a nossa mesa técnica?`
    },
    {
      title: "3. Quebra de Objeção Irresistível (Financiamento Bancário vs. Carta Contemplada)",
      description: "Use quando o cliente afirma que prefere pegar um financiamento tradicional no banco dele.",
      text: `Entendo perfeitamente sua busca pela segurança do banco [Nome]. Mas deixe-me te mostrar os números reais:

No financiamento bancário comum, você paga juros sobre juros. Em 360 meses, um imóvel de R$ 500.000 custa mais de R$ 1.300.000 no final.

Na carta contemplada Titanium, não existe incidência de juros compostos — apenas a taxa de administração diluída. É uma economia real de mais de R$ 400.000 no custo final da operação. É dinheiro que fica na sua empresa. Vamos avaliar a viabilidade para o seu perfil?`
    },
    {
      title: "4. Garantia Anti-Risco & Compliance (Combate à desconfiança de golpe no mercado)",
      description: "Use quando o cliente tem receio sobre a legalidade ou regras de transferência de carta contemplada.",
      text: `Entendo perfeitamente o seu cuidado, [Nome]. O mercado financeiro exige máxima segurança.

Todas as cartas contempladas intermediadas pela Titanium Consultoria operam sob a regulação da Lei nº 11.795/2008 do Banco Central do Brasil e administradoras autorizadas (como Porto Seguro, Bradesco e Rodobens).

Você não paga a transferência sem a devida aprovação cadastral e análise contratual auditada. É transparência total do início à liquidação. Posso te enviar a ficha técnica de uma cota compatível?`
    },
    {
      title: "5. Script de Fechamento por Urgência de Estoque Verificado",
      description: "Para apresentar uma cota específica disponível no estoque com faturamento em 7-15 dias úteis.",
      text: `[Nome], mapeei exatamente no nosso estoque ativo a oportunidade ideal para o seu projeto:

• Crédito Líquido: R$ 500.000,00
• Entrada: R$ 125.000,00
• Parcelas: 120x de R$ 3.850,00
• Status: Contemplada / Liberada para transferência rápida.

Efetuando a reserva com a mesa hoje, iniciamos a validação da documentação para faturamento no seu nome. Consigo segurar essa cota até às 17h. Podemos avançar?`
    },
    {
      title: "6. Direct Response para Investidores (Alocação Patrimonial & TIR)",
      description: "Para investidores focados em retorno sobre patrimônio e alavancagem com baixo custo de capital.",
      text: `Olá [Nome], você já calculou o impacto do custo de capital na sua alocação imobiliária deste ano?

Utilizar cartas contempladas como instrumento de alavancagem permite adquirir imóveis para locação ou incorporação pagando uma fração da entrada e mantendo uma Taxa Interna de Retorno (TIR) significativamente superior ao capital próprio.

Estruturamos operações sob medida para investidores de alto volume. Gostaria de receber nosso estudo de viabilidade patrimonial?`
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

  const firstName = partnerName ? partnerName.split(" ")[0] : "Parceiro";

  return (
    <div ref={dashboardRef} className="w-full max-w-[1360px] mx-auto px-3 sm:px-6 py-6 font-jakarta text-slate-800 selection:bg-[#0A7B3E] selection:text-white">
      
      {/* ═══════════════════════════════════════════════════════
          CRM SAAS SHELL (SIDEBAR DOCK + MAIN BENTO CANVAS)
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-white/95 rounded-[32px] p-3 sm:p-5 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] border border-slate-200/80 flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* ── 1. SIDEBAR DOCK (ESTILO AEUXGLOBAL DE ALTÍSSIMA FIDELIDADE) ──── */}
        <aside className="w-full lg:w-[260px] shrink-0 bg-[#0C130F] rounded-[26px] p-5 text-white flex flex-col justify-between shadow-lg">
          
          <div className="space-y-6">
            {/* Logo Titanium CRM */}
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0A7B3E] to-[#15B85C] flex items-center justify-center text-white font-extrabold shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h4v16H4zm6 0h4v16h-4zm6 0h4v16h-4z" />
                </svg>
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">Titanium CRM</span>
            </div>

            {/* Workspace Selector Pill */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-200">Mesa de Afiliados</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">v2.4</span>
            </div>

            {/* Search Bar com Shortcut */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar no CRM..."
                value={cartasSearch}
                onChange={(e) => setCartasSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="absolute right-2.5 top-2 text-[10px] text-slate-500 font-mono">⌘+F</span>
            </div>

            {/* Navigation Menu (CLIQUE ATIVO FUNCIONAL!) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 block mb-2">
                Navegação
              </span>

              {[
                { id: "dashboard" as const, label: "Dashboard", badge: null },
                { id: "cartas" as const, label: "Estoque de Cotas", badge: `${filteredCartas.length}` },
                { id: "clientes" as const, label: "Meus Clientes", badge: `${totalClients}` },
                { id: "extrato" as const, label: "Extrato PIX", badge: null },
                { id: "scripts" as const, label: "Scripts de Venda", badge: "Novo" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    activeNav === item.id
                      ? "bg-white/10 text-white border-white/20 shadow-xs"
                      : "bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeNav === item.id ? "bg-emerald-400" : "bg-transparent"}`} />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      item.badge === "Novo" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-white/10 text-slate-300"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* User Account Card at Bottom */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-700 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-white">
                {firstName.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white truncate max-w-[120px]">{partnerName}</div>
                <div className="text-[10px] text-slate-400 font-mono">REF: #{partnerRef}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 transition-colors p-1 cursor-pointer"
              title="Sair"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </aside>

        {/* ── 2. MAIN WORKSPACE BENTO CANVAS (TEMA CLARO) ──── */}
        <main className="flex-1 space-y-6 overflow-hidden">
          
          {/* Top Bar Navigation & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
                <span className="crm-tag-mint text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {greeting}, {firstName}!
                </span>
              </div>
              <p className="text-xs text-slate-500 font-light mt-0.5">
                Visão consolidada da sua esteira comercial, cotas ativas e comissões.
              </p>
            </div>

            {/* Action Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsAIChatOpen(true)}
                className="crm-pill bg-emerald-50 hover:bg-emerald-100 text-[#0A7B3E] border border-emerald-200 cursor-pointer shadow-2xs"
              >
                <span>Copiloto IA</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0A7B3E] animate-pulse" />
              </button>

              <button
                onClick={handleCopyReferralLink}
                className="crm-pill bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                <span>{referralCopied ? "Copiado!" : "Copiar Link"}</span>
              </button>

              <button
                onClick={() => setIsNewClientOpen(true)}
                className="crm-pill bg-[#0A7B3E] hover:bg-[#086332] text-white cursor-pointer shadow-sm border-none"
              >
                <span>+ Indicar Cliente</span>
              </button>
            </div>
          </div>

          {/* ══ ROW 1: TOP 3 BENTO KPI TILES ════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1 (Dark Emerald Hero Accent - como o card 1 do Aeux) */}
            <div className="crm-card-dark p-5 flex flex-col justify-between text-left">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                  Total Recebido no PIX
                </span>
                <div className="text-2xl font-extrabold text-white tabular-nums tracking-tight">
                  R$ {paidCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-1">
                  <span>↗ 100% liquidação direta</span>
                </div>
              </div>

              {/* Mini Bar Chart Indicator */}
              <div className="flex items-end gap-1.5 h-7 mt-4 pt-1">
                <div className="w-2 bg-emerald-500/30 rounded-t h-3" />
                <div className="w-2 bg-emerald-500/50 rounded-t h-4" />
                <div className="w-2 bg-emerald-500/70 rounded-t h-5" />
                <div className="w-2 bg-emerald-400 rounded-t h-7" />
              </div>
            </div>

            {/* Card 2 (Light Glass Card) */}
            <div className="crm-card p-5 flex flex-col justify-between text-left">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Comissão em Negociação
                </span>
                <div className="text-2xl font-extrabold text-amber-600 tabular-nums tracking-tight">
                  R$ {activeCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1">
                  <span>Em esteira de análise na mesa</span>
                </div>
              </div>

              {/* Mini Trend Line Sparkline */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-slate-400 font-semibold">Previsão 15 dias</span>
                <div className="flex items-end gap-1 h-5">
                  <div className="w-1.5 bg-amber-200 rounded-t h-2" />
                  <div className="w-1.5 bg-amber-300 rounded-t h-3.5" />
                  <div className="w-1.5 bg-amber-400 rounded-t h-5" />
                </div>
              </div>
            </div>

            {/* Card 3 (Light Glass Card) */}
            <div className="crm-card p-5 flex flex-col justify-between text-left">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Clientes na Carteira
                </span>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                  {totalClients} <span className="text-xs font-normal text-slate-400">leads</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium mt-1">
                  <span>Blindados permanentemente</span>
                </div>
              </div>

              {/* Mini Sparkline Bars */}
              <div className="flex items-end gap-1.5 h-6 mt-4">
                <div className="w-2 bg-slate-200 rounded-t h-2.5" />
                <div className="w-2 bg-slate-200 rounded-t h-3.5" />
                <div className="w-2 bg-emerald-500 rounded-t h-6" />
                <div className="w-2 bg-emerald-300 rounded-t h-4" />
              </div>
            </div>
          </div>

          {/* ══ ROW 2: MIDDLE BENTO GRID (ESTEIRA + HERO SAGE CARD) ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Large Card (Esteira & Projeção) - Col 8 */}
            <div className="lg:col-span-8 crm-card p-6 flex flex-col justify-between text-left space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Esteira de Crédito & Projeção</h3>
                  <p className="text-[11px] text-slate-400 font-light">Evolução de volume indicado vs. cotas faturadas</p>
                </div>
                <span className="crm-pill bg-slate-100 text-slate-600 text-[10px]">
                  Últimos 6 meses ▾
                </span>
              </div>

              {/* Dual-color Bar Chart */}
              <div className="space-y-2 pt-2">
                <div className="h-36 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-dashed border-slate-200 pb-1">
                  {[
                    { month: "Jan", val: 35, active: false },
                    { month: "Fev", val: 50, active: false },
                    { month: "Mar", val: 40, active: false },
                    { month: "Abr", val: 65, active: false },
                    { month: "Mai", val: 80, active: true },
                    { month: "Jun", val: 95, active: true },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.val * 10}k
                      </span>
                      <div
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                          bar.active
                            ? "bg-gradient-to-t from-[#0A7B3E] to-[#15B85C] shadow-sm shadow-[#0A7B3E]/20"
                            : "bg-slate-200/80 group-hover:bg-slate-300"
                        }`}
                        style={{ height: `${bar.val}%` }}
                      />
                      <span className="text-[10px] font-semibold text-slate-500">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Volume em Negociação Ativa
                </span>
                <span className="font-bold text-slate-800">Meta Trimestre: R$ 2.500.000,00</span>
              </div>
            </div>

            {/* Right Tall Card (Soft Sage Green) - Col 4 */}
            <div className="lg:col-span-4 crm-card-sage p-6 flex flex-col justify-between text-left space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#0A7B3E] uppercase tracking-widest block mb-1">
                  Estoque Ativo de Cotas
                </span>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  +3.000 <span className="text-sm font-semibold text-slate-500">OPERAÇÕES</span>
                </div>
                <div className="text-xs text-emerald-700 font-bold mt-1">
                  ↗ Economia de até 60% vs. banco
                </div>
              </div>

              {/* Segment Breakdown com Ícones Circulares */}
              <div className="space-y-2.5 pt-2">
                <div className="bg-white/80 p-3 rounded-2xl border border-emerald-900/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#0A7B3E] flex items-center justify-center text-xs font-bold">
                      🏠
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Imóveis & Lotes</div>
                      <div className="text-[10px] text-slate-400">R$ 200k a R$ 2.5M</div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">1.697 cotas</span>
                </div>

                <div className="bg-white/80 p-3 rounded-2xl border border-emerald-900/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      🚗
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Veículos & Frotas</div>
                      <div className="text-[10px] text-slate-400">R$ 50k a R$ 350k</div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">913 cotas</span>
                </div>
              </div>
            </div>
          </div>

          {/* ══ ROW 3: ESTOQUE DE CARTAS (ANCHOR REF) ═════════════ */}
          <div ref={cartasRef} className="crm-card p-6 space-y-4 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Oportunidades em Destaque (Estoque de Cotas)</h3>
                <p className="text-[11px] text-slate-400 font-light">Cotas verificadas prontas para transferência e comissão garantida no PIX</p>
              </div>

              {/* Segment Filter Pills */}
              <div className="flex gap-1.5 flex-wrap">
                {["Todos", "Imóveis", "Veículos", "Agro"].map((seg) => (
                  <button
                    key={seg}
                    onClick={() => setSelectedSegment(seg)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                      selectedSegment === seg
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                    }`}
                  >
                    {seg}
                  </button>
                ))}
              </div>
            </div>

            {/* Table with Sparklines & Soft Pastel Tags */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Administradora</th>
                    <th className="py-2.5 px-3">Crédito</th>
                    <th className="py-2.5 px-3">Entrada</th>
                    <th className="py-2.5 px-3">Dinâmica</th>
                    <th className="py-2.5 px-3">Segmento</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCartas.map((carta, i) => (
                    <tr key={carta.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <AdministradoraLogo name={carta.administradora} />
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900 tabular-nums">
                        {Number(carta.valor_credito).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-3 px-3 font-semibold text-emerald-700 tabular-nums">
                        {Number(carta.entrada).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                      </td>
                      
                      {/* Wave Sparkline SVG */}
                      <td className="py-3 px-3">
                        <svg className="w-16 h-5" viewBox="0 0 64 20" fill="none">
                          <path
                            d={i % 2 === 0 ? "M2 14 C16 4, 32 16, 62 4" : "M2 6 C16 16, 32 4, 62 12"}
                            stroke={i % 2 === 0 ? "#10B981" : "#F59E0B"}
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </td>

                      {/* Soft Tag */}
                      <td className="py-3 px-3">
                        <span className={`crm-pill text-[10px] py-0.5 px-2 ${
                          carta.segmento.toLowerCase().includes("veic")
                            ? "crm-tag-sky"
                            : carta.segmento.toLowerCase().includes("agro")
                            ? "crm-tag-peach"
                            : "crm-tag-mint"
                        }`}>
                          {carta.segmento}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleReserveLetter(carta)}
                          className="px-3 py-1 bg-[#0A7B3E] hover:bg-[#086332] text-white text-[10px] font-bold rounded-lg transition-all border-none cursor-pointer"
                        >
                          Reservar (Wpp)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ══ ROW 4: CLIENTES E EXTRATO (ANCHOR REFS) ════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Carteira de Clientes - Col 8 */}
            <div ref={clientesRef} className="lg:col-span-8 crm-card p-6 space-y-4 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Meus Clientes Indicados</h3>
                  <p className="text-[11px] text-slate-400 font-light">Leads blindados sob seu ID. Mesa conduz o fechamento.</p>
                </div>
                <button
                  onClick={() => setIsNewClientOpen(true)}
                  className="crm-pill bg-slate-900 hover:bg-slate-800 text-white text-[10px] cursor-pointer"
                >
                  + Indicar Cliente
                </button>
              </div>

              {clients.length === 0 ? (
                <div className="py-10 text-center space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-700">Nenhum cliente cadastrado ainda</p>
                  <p className="text-[11px] text-slate-400 font-light max-w-xs mx-auto">
                    Cadastre o primeiro cliente para iniciar a blindagem no CRM da Titanium.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Data</th>
                        <th className="py-2.5 px-3">Cliente</th>
                        <th className="py-2.5 px-3">Segmento</th>
                        <th className="py-2.5 px-3">Crédito</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clients.map((client) => (
                        <tr key={client.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 font-light text-slate-500">
                            {new Date(client.created_at).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">{client.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{client.phone}</div>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700">{client.segment}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900 tabular-nums">
                            {client.credit && !isNaN(Number(client.credit.replace(/[^\d.]/g, "")))
                              ? Number(client.credit.replace(/[^\d.]/g, "")).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
                              : `R$ ${client.credit}`}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
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
                </div>
              )}
            </div>

            {/* Extrato PIX - Col 4 */}
            <div ref={extratoRef} className="lg:col-span-4 crm-card p-6 space-y-4 text-left">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Extrato de Comissões PIX</h3>
                <p className="text-[11px] text-slate-400 font-light">Histórico de comissões liquidadas</p>
              </div>

              {comissoes.length === 0 ? (
                <div className="py-10 text-center space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-700">Sem lançamentos ainda</p>
                  <p className="text-[11px] text-slate-400 font-light max-w-xs mx-auto">
                    Assim que a primeira indicação for liquidada, o comprovante PIX ficará disponível aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {comissoes.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 block">{c.cliente_nome}</span>
                        <span className="text-[10px] text-slate-400 font-light">
                          {new Date(c.criado_em).toLocaleDateString("pt-BR")} • R$ {Number(c.valor_credito).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 block text-sm tabular-nums">
                          + R$ {Number(c.comissao_valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="crm-tag-mint text-[9px] px-2 py-0.5 rounded-full">
                          {c.status_pagamento === "pago" ? "PIX Pago" : "Em análise"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════
          WIDGET FLUTUANTE DO COPILOTO IA (LATERAL POP-UP)
      ═══════════════════════════════════════════════════════ */}
      {!isAIChatOpen && (
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-[#0A7B3E] hover:bg-[#086332] text-white font-bold text-xs rounded-full shadow-xl shadow-[#0A7B3E]/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 border border-white/30 cursor-pointer"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span>Copiloto IA</span>
        </button>
      )}

      {/* Pop-up Lateral / Floating Drawer */}
      {isAIChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[400px] max-h-[560px] h-[80vh] rounded-3xl liquid-glass-modal shadow-2xl flex flex-col border border-white/95 overflow-hidden animate-popUp text-left">
          
          {/* Header do Pop-up Lateral */}
          <div className="p-4 bg-[#0C130F] text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white">Copiloto Titanium AI</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400 font-light">Assistente consultivo de vendas</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${WPP_AFILIADOS}?text=${encodeURIComponent(`Olá equipe Titanium! Sou o parceiro ${partnerName} (REF: ${partnerRef}) e preciso de suporte da mesa de afiliados.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-400 hover:text-white transition-colors"
                title="Abrir WhatsApp de Afiliados"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.089.534 4.055 1.475 5.77L0 24l6.407-1.453A11.957 11.957 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.497-5.22-1.367l-.375-.222-3.887.882.913-3.781-.244-.39A9.941 9.941 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </a>
              <button
                onClick={() => setIsAIChatOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border-none font-bold text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Feed de Mensagens */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/60 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl leading-relaxed shadow-2xs ${
                    m.sender === "user"
                      ? "bg-[#0A7B3E] text-white rounded-br-none"
                      : "bg-white border border-slate-200/80 text-slate-800 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line text-[11px] sm:text-xs">{m.text}</p>
                  
                  {m.actionWpp && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={`https://wa.me/${WPP_AFILIADOS}?text=${encodeURIComponent(m.actionWpp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#0A7B3E] font-bold text-[10px] hover:underline"
                      >
                        Acionar Mesa no WhatsApp →
                      </a>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 bg-white border border-slate-200 rounded-xl w-fit text-slate-400 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-500 font-medium ml-1">Digitando...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Sugestões Rápidas (Chips) */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-emerald-50 hover:text-[#0A7B3E] border border-slate-200/60 text-slate-600 text-[10px] font-medium transition-all cursor-pointer text-left line-clamp-1"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Pergunte ao Copiloto..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors text-slate-800"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-2 bg-[#0A7B3E] hover:bg-[#086332] disabled:opacity-40 text-white rounded-xl transition-all shadow-xs border-none cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL DE SCRIPTS DE VENDAS HORMOZI $100M OFFERS
      ═══════════════════════════════════════════════════════ */}
      {isScriptsOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col text-left">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Scripts de Venda Hormozi $100M Offers</h3>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Framework de copy consultiva de alta conversão para WhatsApp.</p>
                </div>
              </div>
              <button
                onClick={() => setIsScriptsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer border-none font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40">
              {salesScripts.map((script, idx) => (
                <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 relative group shadow-2xs hover:border-emerald-500/40 transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{script.title}</h4>
                      <p className="text-[11px] text-slate-400 font-light mt-0.5">{script.description}</p>
                    </div>
                    <button
                      onClick={() => handleCopyText(script.text, idx)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                        copiedIndex === idx
                          ? "bg-emerald-600 text-white"
                          : "bg-[#E8F5EE] hover:bg-[#D1ECDD] text-[#0A7B3E]"
                      }`}
                    >
                      {copiedIndex === idx ? "Copiado!" : "Copiar Script"}
                    </button>
                  </div>
                  <pre className="text-xs text-slate-700 font-light whitespace-pre-wrap leading-relaxed font-sans bg-slate-50 border border-slate-200/60 p-4 rounded-xl max-h-48 overflow-y-auto">
                    {script.text}
                  </pre>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-slate-100 bg-white flex justify-between items-center">
              <span className="text-[11px] text-slate-400">Desenvolvido com diretrizes de compliance BACEN e Hormozi Framework</span>
              <button
                onClick={() => setIsScriptsOpen(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer border-none"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL DE CADASTRO DE NOVO CLIENTE
      ═══════════════════════════════════════════════════════ */}
      {isNewClientOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-left">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E8F5EE] flex items-center justify-center text-[#0A7B3E]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Indicar Novo Cliente</h3>
                  <p className="text-[11px] text-slate-400 font-light">Seu ID será blindado no CRM da Titanium.</p>
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
                <div className="p-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl border border-rose-200">
                  {clientError}
                </div>
              )}
              {clientSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200">
                  {clientSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nome Completo do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Silveira"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">WhatsApp / Celular com DDD</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: (11) 99999-9999"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">E-mail (opcional)</label>
                <input
                  type="email"
                  placeholder="Ex: roberto@empresa.com.br"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Segmento</label>
                  <select
                    value={clientForm.segment}
                    onChange={(e) => setClientForm({ ...clientForm, segment: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                  >
                    <option value="Imóveis">Imóveis</option>
                    <option value="Veículos">Veículos</option>
                    <option value="Agro">Agro</option>
                    <option value="Pesados">Pesados</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Crédito Pretendido (R$)</label>
                  <input
                    type="text"
                    placeholder="Ex: 500.000"
                    value={clientForm.credit}
                    onChange={(e) => setClientForm({ ...clientForm, credit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
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
                  className="flex-1 py-3 bg-[#0A7B3E] hover:bg-[#086332] disabled:bg-slate-200 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md border-none cursor-pointer"
                >
                  {clientLoading ? "Gravando..." : "Gravar Indicação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
