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
  
  // Saudação Dinâmica
  const [greeting, setGreeting] = useState("Olá");
  const [referralCopied, setReferralCopied] = useState(false);

  // Client-side search and filters for Available Letters
  const [cartasSearch, setCartasSearch] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("Todos");

  // Modals & Chat States
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
        text: `Olá, ${firstName}! Sou o Copiloto Titanium AI. Estou aqui para te ajudar com regras de consórcio, dúvidas sobre comissão no PIX, quebra de objeções com seus clientes e suporte em tempo real com nossa mesa de operações. Como posso te apoiar hoje?`,
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
      setClientSuccess("Cliente cadastrado com sucesso e blindado no seu CRM!");
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

  // Motor Inteligente do Chat Titanium AI (Processamento Consultivo)
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

    // Simulação de raciocínio de IA com respostas consultivas precisas
    setTimeout(() => {
      let replyText = "";
      let actionWppText = "";
      const lower = message.toLowerCase();

      if (lower.includes("comiss") || lower.includes("pagamento") || lower.includes("pix") || lower.includes("quanto ganho")) {
        replyText = `Sua comissão é apurada e garantida em contrato. Ela varia de acordo com a negociação (geralmente entre 1% a 2% do valor total do crédito faturado). O valor é transferido diretamente via PIX para a sua chave cadastrada logo após a liquidação do contrato e aprovação documental pela administradora. Você pode acompanhar todo o extrato na aba 'Comissões' do seu painel.`;
        actionWppText = `Olá, gostaria de tirar dúvidas sobre o faturamento de comissão do meu parceiro (REF: ${partnerRef}).`;
      } else if (lower.includes("prazo") || lower.includes("demora") || lower.includes("quanto tempo") || lower.includes("libera")) {
        replyText = `O prazo para transferência de titularidade de uma carta contemplada varia entre 7 e 15 dias úteis, dependendo da administradora (Itaú, Santander, Porto Seguro, HS, etc.) e da velocidade no envio dos documentos do seu cliente. Assim que aprovado o cadastro, o crédito fica disponível para a compra imediata do bem.`;
        actionWppText = `Olá, preciso checar o prazo médio de aprovação para uma carta contemplada com a mesa técnica.`;
      } else if (lower.includes("document") || lower.includes("doc") || lower.includes("exig")) {
        replyText = `Para aprovação na administradora, o cliente precisa apresentar:\n• Pessoa Física: RG, CPF, Comprovante de Residência recente e Comprovante de Renda (Holerites ou Declaração de IRPF).\n• Pessoa Jurídica: Contrato Social, Cartão CNPJ, Balanço/DRE ou extrato bancário dos últimos 3 meses.\nNossa mesa cuida de toda a conferência para você não ter retrabalho.`;
        actionWppText = `Olá! Quero enviar a documentação de um cliente indicado para validação da mesa.`;
      } else if (lower.includes("objeç") || lower.includes("financiamento") || lower.includes("juro") || lower.includes("argumento")) {
        replyText = `O melhor argumento comparativo é o custo efetivo: no financiamento bancário comum, o cliente chega a pagar de 2 a 3 vezes o valor do bem por conta dos juros compostos. Na carta contemplada, não há juros — apenas uma taxa de administração diluída —, o que gera uma economia de até 60% no montante final. Use o roteiro pronto na seção 'Scripts' do portal!`;
        actionWppText = `Olá! Gostaria de uma simulação comparativa (Financiamento vs Consórcio) para apresentar a um cliente.`;
      } else if (lower.includes("número") || lower.includes("telefone") || lower.includes("contato") || lower.includes("whatsapp")) {
        replyText = `A Titanium possui dois canais oficiais dedicados:\n1. 📲 WhatsApp de Suporte a Afiliados & Mesa de Negócios: (11) 95834-0753 (atendimento direto para você).\n2. 🏢 WhatsApp Geral & Atendimento a Clientes: (11) 93004-8940.`;
        actionWppText = `Olá, equipe Titanium! Sou o parceiro ${partnerName} e preciso de atendimento da mesa de afiliados.`;
      } else {
        replyText = `Excelente pergunta! Nossa mesa técnica especializada está online para te apoiar em qualquer negociação complexa ou simulação sob medida. Você pode cadastrar o cliente pelo botão '+ Cadastrar Cliente' para blindá-lo no seu CRM ou chamar nossa equipe diretamente no WhatsApp de Afiliados.`;
        actionWppText = `Olá mesa técnica! Sou o parceiro ${partnerName} (REF: ${partnerRef}) e gostaria de apoio para o seguinte caso: "${message}"`;
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
    }, 600);
  };

  const quickPrompts = [
    "Como funciona a comissão e pagamento no PIX?",
    "Qual o prazo de liberação da carta contemplada?",
    "Quais documentos o cliente precisa enviar?",
    "Como convencer cliente que prefere financiamento?",
  ];

  const salesScripts = [
    {
      title: "Abordagem Inicial (WhatsApp)",
      description: "Ideal para iniciar conversa com produtores rurais, investidores e empresários da sua lista de contatos.",
      text: `Olá, tudo bem? Tenho acompanhado o mercado de crédito e notei que muitos empresários e investidores estão usando cartas contempladas da Titanium para adquirir imóveis, veículos e frotas sem pagar juros abusivos de banco.

Conseguimos cotas com entrada facilitada e parcelas enxutas já liberadas para faturamento imediato. Posso rodar uma simulação rápida sem compromisso para o seu perfil?`
    },
    {
      title: "Contornando Objeções (Financiamento vs Consórcio)",
      description: "Use quando o cliente afirma que prefere fazer um financiamento bancário comum.",
      text: `Entendo perfeitamente sua dúvida, mas a grande diferença é que na carta contemplada da Titanium não existe incidência de juros compostos, apenas taxa de administração diluída.

Enquanto no banco você paga até 2 ou 3 vezes o valor do bem, na cota contemplada a economia no custo total chega a 60%. É dinheiro que fica no seu caixa.`
    },
    {
      title: "Apresentação de Oportunidades / Fechamento",
      description: "Use para apresentar cartas específicas e chamar para o fechamento com nosso diretor.",
      text: `Mapeei no nosso estoque de cartas contempladas três opções que se alinham exatamente com o valor de investimento que você precisa para faturamento imediato.

Temos, por exemplo, uma cota com crédito de R$ 500.000,00 com parcelas bem enxutas. Efetuando a transferência, o recurso fica liberado para compra em poucos dias úteis. Qual o melhor horário hoje para alinharmos os detalhes com o diretor da mesa?`
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
    <div className="max-w-6xl mx-auto px-4 space-y-8 font-jakarta text-slate-800 selection:bg-[#0A7B3E] selection:text-white pb-16">
      
      {/* ═══════════════════════════════════════════════════════
          CARD DE BOAS-VINDAS PERSONALIZADO & ACOLHEDOR
      ═══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#0A7B3E]/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Parceiro Oficial Verificado
              </span>
              <span className="text-xs text-slate-400 font-mono">
                REF: <strong className="text-white">{partnerRef}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {greeting}, <span className="text-emerald-400">{firstName}</span>!
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-light max-w-xl leading-relaxed">
              Seu <strong className="text-white font-medium">Copiloto Titanium de Vendas</strong> está ativo. Indique clientes com 1 clique, acompanhe negociações em tempo real e consulte nosso estoque de cartas comissionadas.
            </p>
          </div>

          {/* Ações Rápidas no Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Botão Copiar Link */}
            <button
              onClick={handleCopyReferralLink}
              className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                referralCopied
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700"
              }`}
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              {referralCopied ? "Link Copiado!" : "Copiar meu Link"}
            </button>

            {/* Botão Novo Cliente */}
            <button
              onClick={() => setIsNewClientOpen(true)}
              className="px-5 py-3 bg-[#0A7B3E] hover:bg-[#086332] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#0A7B3E]/25 flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              + Indicar Cliente
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-3 py-3 bg-slate-900/50 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              title="Sair do painel"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          CARDS DE MÉTRICAS (KPIs DO PARCEIRO)
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Clientes Sob Minha Carteira</span>
            <div className="w-7 h-7 rounded-lg bg-[#E8F5EE] flex items-center justify-center text-[#0A7B3E]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalClients}</span>
          <p className="text-[11px] text-slate-400 font-light mt-1">Leads blindados permanentemente sob seu ID.</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Comissão em Negociação</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            R$ {activeCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[11px] text-slate-400 font-light mt-1">Em esteira de análise na administradora.</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Recebido no PIX</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            R$ {paidCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[11px] text-slate-400 font-light mt-1">Comissões liquidadas e creditadas.</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SEÇÃO DO COPILOTO TITANIUM AI (Chat de IA Interativo)
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5EE] border border-[#D1ECDD] flex items-center justify-center text-[#0A7B3E] shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Copiloto Titanium AI</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Online</span>
              </div>
              <p className="text-xs text-slate-500 font-light mt-0.5">
                Tire dúvidas técnicas sobre consórcios, regras de comissão e estratégias de venda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`https://wa.me/${WPP_AFILIADOS}?text=${encodeURIComponent(`Olá equipe Titanium! Sou o parceiro ${partnerName} (REF: ${partnerRef}) e preciso de suporte da mesa de afiliados.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#0A7B3E] border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.089.534 4.055 1.475 5.77L0 24l6.407-1.453A11.957 11.957 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.497-5.22-1.367l-.375-.222-3.887.882.913-3.781-.244-.39A9.941 9.941 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              WhatsApp de Afiliados
            </a>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 h-[340px] overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                  m.sender === "user"
                    ? "bg-[#0A7B3E] text-white rounded-br-none"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                
                {m.actionWpp && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold">Deseja falar com a mesa?</span>
                    <a
                      href={`https://wa.me/${WPP_AFILIADOS}?text=${encodeURIComponent(m.actionWpp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-[#0A7B3E] hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                    >
                      Acionar Mesa no WhatsApp →
                    </a>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl w-fit text-slate-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-medium text-slate-500 ml-1">Copiloto Titanium está formulando resposta...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompts (Sugestões de Dúvidas) */}
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            Sugestões Rápidas:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-[#0A7B3E] hover:border-emerald-200 border border-slate-200 text-slate-600 text-[11px] font-semibold transition-all cursor-pointer text-left"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-1"
        >
          <input
            type="text"
            placeholder="Digite sua dúvida sobre consórcios, comissão ou abordagem comercial..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors text-slate-800"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="px-6 py-3 bg-[#0A7B3E] hover:bg-[#086332] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer border-none"
          >
            <span>Enviar</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>

      {/* ═══════════════════════════════════════════════════════
          ESTOQUE DE CARTAS CONTEMPLADAS (COM FILTROS LIMPOS)
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Estoque de Cartas Contempladas</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0A7B3E] text-[10px] font-extrabold border border-emerald-200">
                {filteredCartas.length} ativas
              </span>
            </div>
            <p className="text-xs text-slate-500 font-light mt-0.5">
              Consulte as cotas verificadas disponíveis para pronta-entrega e reserve com a mesa.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar por administradora..."
              value={cartasSearch}
              onChange={(e) => setCartasSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors w-full sm:w-56 text-slate-800"
            />
          </div>
        </div>

        {/* Segment Filters Centrais */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
          {["Todos", "Imóveis", "Veículos", "Agro", "Pesados"].map((seg) => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedSegment === seg
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {seg}
            </button>
          ))}
        </div>

        {/* Letters List */}
        {filteredCartas.length === 0 ? (
          <p className="text-xs text-slate-400 py-10 text-center font-light">
            Nenhuma carta disponível correspondente aos filtros selecionados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Segmento</th>
                  <th className="py-3 px-3">Administradora</th>
                  <th className="py-3 px-3">Crédito Líquido</th>
                  <th className="py-3 px-3">Entrada</th>
                  <th className="py-3 px-3">Parcelas</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCartas.map((carta) => (
                  <tr key={carta.id} className="text-slate-600 hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900 capitalize">{carta.segmento}</td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      <AdministradoraLogo name={carta.administradora} />
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-slate-900 text-sm">
                      {Number(carta.valor_credito).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-emerald-700">
                      {Number(carta.entrada).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-800">
                      {carta.parcelas}x de R$ {Number(carta.valor_parcela).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleReserveLetter(carta)}
                        className="px-3.5 py-1.5 bg-[#0A7B3E] hover:bg-[#086332] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all border-none cursor-pointer"
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

      {/* ═══════════════════════════════════════════════════════
          CLIENTES E FINANCEIRO
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gestão de Clientes (2 Columns) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 overflow-x-auto lg:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Carteira de Clientes Indicados</h3>
              <p className="text-[11px] text-slate-500 font-light mt-0.5">
                Contatos blindados sob seu ID. Nossa mesa conduz a venda e você acompanha o status.
              </p>
            </div>
            <button
              onClick={() => setIsNewClientOpen(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border-none"
            >
              ＋ Cadastrar Cliente
            </button>
          </div>

          {clients.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-700">Nenhum cliente cadastrado ainda</p>
              <p className="text-[11px] text-slate-400 font-light max-w-xs mx-auto">
                Cadastre o primeiro cliente ou envie seu link de parceiro para começar a acumular comissões.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Segmento</th>
                  <th className="py-2.5 px-3">Crédito</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <tr key={client.id} className="text-slate-600 hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-light">
                      {new Date(client.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{client.name}</div>
                      <div className="text-[10px] text-slate-400 font-light font-mono">{client.phone}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{client.segment}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
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
          )}
        </div>

        {/* Extrato de Comissões (1 Column) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 overflow-x-auto lg:col-span-1">
          <div>
            <h3 className="text-base font-bold text-slate-900">Extrato Financeiro</h3>
            <p className="text-[11px] text-slate-500 font-light mt-0.5">Histórico de comissões creditadas.</p>
          </div>
          {comissoes.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-700">Sem lançamentos ainda</p>
              <p className="text-[11px] text-slate-400 font-light max-w-xs mx-auto">
                Assim que sua primeira indicação for faturada, sua comissão aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {comissoes.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">{c.cliente_nome}</span>
                    <span className="text-[10px] text-slate-400 font-light">
                      {new Date(c.criado_em).toLocaleDateString("pt-BR")} • Crédito R$ {Number(c.valor_credito).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 block text-sm">
                      + R$ {Number(c.comissao_valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      c.status_pagamento === "pago"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                    }`}>
                      {c.status_pagamento === "pago" ? "PIX Pago" : "Aguardando"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          KIT DE MATERIAIS & CANAIS DE APOIO
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Suporte Dedicado */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Canais Oficiais de Suporte</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Nossa mesa de diretores e consultores comerciais atende parceiros em linha direta para tirar dúvidas, alinhar comissões e negociar propostas especiais.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={`https://wa.me/${WPP_AFILIADOS}?text=${encodeURIComponent(`Olá! Sou o parceiro ${partnerName} e preciso de atendimento da mesa de afiliados.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-[#0A7B3E] hover:bg-[#086332] text-white text-xs font-bold uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.089.534 4.055 1.475 5.77L0 24l6.407-1.453A11.957 11.957 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.497-5.22-1.367l-.375-.222-3.887.882.913-3.781-.244-.39A9.941 9.941 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Mesa Afiliados (11 95834-0753)
            </a>
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
          </div>
        </div>

        {/* Kit de Ferramentas */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Kit Comercial do Parceiro</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Baixe materiais de apoio, acerte suas abordagens ou utilize os roteiros comerciais testados para acelerar fechamentos.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 pt-2">
            <a
              href="/cartas/apresentacao-institucional.pdf"
              download
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-emerald-500/40 hover:bg-emerald-50/40 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-700"
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Apresentação</span>
            </a>
            
            <Link
              href="/cartas-contempladas"
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-emerald-500/40 hover:bg-emerald-50/40 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-700"
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 18.375v-5.25zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-9.75zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Vitrine</span>
            </Link>

            <button
              onClick={() => setIsScriptsOpen(true)}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-emerald-500/40 hover:bg-emerald-50/40 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-700 font-sans"
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Scripts</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MODAL DE SCRIPTS DE VENDAS
      ═══════════════════════════════════════════════════════ */}
      {isScriptsOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-[#0A7B3E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Scripts de Abordagem Validada</h3>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Copie e envie para empresários, produtores e contatos.</p>
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
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                        copiedIndex === idx
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-50 hover:bg-emerald-100 text-[#0A7B3E]"
                      }`}
                    >
                      {copiedIndex === idx ? "Copiado!" : "Copiar"}
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
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
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
