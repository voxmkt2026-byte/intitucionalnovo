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
  status_cota?: string | null;
  observacoes?: string | null;
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
  const statusRaw = (carta.status_cota || (carta.disponivel === false ? ((carta.observacoes || "").toLowerCase().includes("vendid") ? "vendido" : "reservado") : "disponivel")).toLowerCase();
  const isVendido = statusRaw.includes("vendid");
  const isReservado = !isVendido && (statusRaw.includes("reservad") || !carta.disponivel);

  const label = isVendido ? "Vendido" : isReservado ? "Reservado" : "Disponível";
  const badgeCls = isVendido
    ? "bg-gray-100 text-gray-700 border-gray-300"
    : isReservado
    ? "bg-red-50 text-red-700 border-red-200"
    : "bg-green-50 text-green-700 border-green-200";

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
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${badgeCls}`}>
          {label}
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
