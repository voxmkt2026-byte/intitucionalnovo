"use client";

export interface Carta {
  id: number;
  segmento: string;
  administradora: string;
  valor_credito: number;
  entrada: number | null;
  parcelas: number;
  valor_parcela: number;
  proximo_vencimento: string | null;
  disponivel: boolean;
}

function formatBRL(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR");
}

function whatsappLink(carta: Carta) {
  const msg = encodeURIComponent(
    `Olá! Tenho interesse na carta contemplada:\n` +
    `• Segmento: ${carta.segmento}\n` +
    `• Administradora: ${carta.administradora}\n` +
    `• Crédito: ${formatBRL(carta.valor_credito)}\n` +
    `• Entrada: ${formatBRL(carta.entrada)}\n` +
    `• ${carta.parcelas}x de ${formatBRL(carta.valor_parcela)}\n` +
    `Poderia me dar mais informações?`
  );
  return `https://wa.me/5511930048940?text=${msg}`;
}

interface Props {
  carta: Carta;
}

export default function CartaCard({ carta }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{carta.segmento === "veiculos" ? "🚗" : carta.segmento === "imoveis" ? "🏠" : "📋"}</span>
          <div>
            <p className="font-semibold text-gray-800 capitalize">{carta.segmento}</p>
            <p className="text-xs text-gray-500">{carta.administradora}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Disponível
        </span>
      </div>

      {/* Values grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Crédito</p>
          <p className="font-bold text-[#C41E3A] text-lg">{formatBRL(carta.valor_credito)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Entrada</p>
          <p className="font-semibold text-gray-800">{formatBRL(carta.entrada)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Parcelas</p>
          <p className="font-semibold text-gray-800">{carta.parcelas}x</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Parcela/mês</p>
          <p className="font-semibold text-gray-800">{formatBRL(carta.valor_parcela)}</p>
        </div>
      </div>

      {carta.proximo_vencimento && (
        <p className="text-xs text-gray-400 mb-4">
          Próximo vencimento: {formatDate(carta.proximo_vencimento)}
        </p>
      )}

      <a
        href={whatsappLink(carta)}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-[#C41E3A] hover:bg-[#a01830] text-white font-semibold py-3 rounded-xl transition-colors duration-200 cursor-pointer text-sm"
      >
        Quero Saber Mais
      </a>
    </div>
  );
}
