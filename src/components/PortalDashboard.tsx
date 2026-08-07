"use client";

import { useState } from "react";
import Link from "next/link";

interface Lead {
  id: number;
  name: string;
  phone: string;
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

interface PortalDashboardProps {
  partnerName: string;
  partnerRef: string;
  initialLeads: Lead[];
  initialComissoes: Comissao[];
}

export default function PortalDashboard({
  partnerName,
  partnerRef,
  initialLeads,
  initialComissoes,
}: PortalDashboardProps) {
  const [leads] = useState<Lead[]>(initialLeads);
  const [comissoes] = useState<Comissao[]>(initialComissoes);
  
  // Scripts Modal State
  const [isScriptsOpen, setIsScriptsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleLogout = async () => {
    await fetch("/api/colaboradores/login", { method: "DELETE" });
    window.location.reload();
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

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Calculate stats
  const totalLeads = leads.length;
  const vendasGanhas = leads.filter((l) => l.status === "Vendido" || l.status === "Ganho" || l.status === "Contemplado").length;
  
  const comissaoPendente = comissoes
    .filter((c) => c.status_pagamento !== "pago")
    .reduce((sum, c) => sum + Number(c.comissao_valor), 0);

  const comissaoPaga = comissoes
    .filter((c) => c.status_pagamento === "pago")
    .reduce((sum, c) => sum + Number(c.comissao_valor), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8 font-jakarta text-slate-800 selection:bg-emerald-500 selection:text-white">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Colaborador Ativo</span>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Indicações</span>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalLeads}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Vendas Fechadas</span>
          <span className="text-2xl sm:text-3xl font-bold text-emerald-600">{vendasGanhas}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">A Receber</span>
          <span className="text-2xl sm:text-3xl font-bold text-amber-600">
            R$ {comissaoPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Recebido</span>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">
            R$ {comissaoPaga.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
              🎨 Drive das Artes (Criativos)
            </a>
            <a
              href="https://wa.me/5511958340753?text=Ol%C3%A1%2C+preciso+de+suporte+da+Titanium+sobre+indica%C3%A7%C3%B5es."
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              💬 Suporte WhatsApp
            </a>
          </div>
        </div>

        {/* Kit Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Kit do Colaborador</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Baixe materiais informativos, acesse as taxas comerciais ou utilize os roteiros e scripts prontos criados para acelerar suas indicações.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 pt-2">
            <a
              href="/cartas/apresentacao-institucional.pdf"
              download
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-500/30 hover:bg-slate-100/50 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-700"
            >
              <span className="text-lg">📄</span>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Apresentação</span>
            </a>
            <Link
              href="/cartas-contempladas"
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-500/30 hover:bg-slate-100/50 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-700"
            >
              <span className="text-lg">📈</span>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Tabela Comercial</span>
            </Link>
            <button
              onClick={() => setIsScriptsOpen(true)}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-500/30 hover:bg-slate-100/50 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-700 font-sans"
            >
              <span className="text-lg">💬</span>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Scripts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 overflow-x-auto">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Histórico de Indicações</h3>
          {leads.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center font-light">Nenhuma indicação cadastrada ainda.</p>
          ) : (
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Data</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Segmento</th>
                  <th className="pb-3">Crédito</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="text-slate-600 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-light">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-900">{lead.name}</td>
                    <td className="py-3.5 font-light">{lead.segment}</td>
                    <td className="py-3.5 font-light">R$ {lead.credit || "-"}</td>
                    <td className="py-3.5 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        lead.status === "Vendido" || lead.status === "Ganho" || lead.status === "Contemplado"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : lead.status === "Perdido"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Commissions Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 overflow-x-auto">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Extrato de Comissões</h3>
          {comissoes.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center font-light">Nenhum lançamento financeiro registrado.</p>
          ) : (
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Data</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Crédito</th>
                  <th className="pb-3">Comissão</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comissoes.map((c) => (
                  <tr key={c.id} className="text-slate-600 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-light">
                      {new Date(c.criado_em).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-900">{c.cliente_nome}</td>
                    <td className="py-3.5 font-light">
                      R$ {Number(c.valor_credito).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 font-bold text-emerald-600">
                      R$ {Number(c.comissao_valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        c.status_pagamento === "pago"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}>
                        {c.status_pagamento === "pago" ? "Pago" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Interactive Scripts Modal */}
      {isScriptsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">💬 Scripts de Abordagem & Vendas</h3>
                <p className="text-xs text-slate-400 font-light mt-0.5">Utilize os modelos abaixo para prospectar leads e indicar clientes.</p>
              </div>
              <button
                onClick={() => setIsScriptsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer border-none font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
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
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {copiedIndex === idx ? "✓ Copiado!" : "📋 Copiar"}
                    </button>
                  </div>
                  <pre className="text-xs text-slate-600 font-light whitespace-pre-wrap leading-relaxed font-sans bg-white border border-slate-150 p-4 rounded-xl max-h-40 overflow-y-auto">
                    {script.text}
                  </pre>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
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
    </div>
  );
}
