"use client";

import type { SimulationValues } from "@/features/prospects/domain/types";
import { sendProspectEvent } from "./events";

interface Props {
  token: string;
  empresa: string;
  whatsappNumber: string;
  consultorNome: string;
  values: SimulationValues;
  fixed?: boolean;
}

export default function WhatsAppProspectButton({ token, empresa, whatsappNumber, consultorNome, values, fixed = false }: Props) {
  const credit = values.credit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const message = `Oi ${consultorNome}, vi a simulação da ${empresa} para carta de ${values.segment === "imovel" ? "Imóvel" : "Veículo"} de ${credit} em ${values.months}x (${values.plan === "titanium" ? "Titanium" : "Conforto"}). Código: ${token.slice(0, 8).toUpperCase()}`;
  const link = (
    <a
      href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => sendProspectEvent(token, "whatsapp_click", values)}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0A7B3E] px-5 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-[#0A7B3E]/20 transition-colors hover:bg-[#086332] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A7B3E]"
    >
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
      </svg>
      Falar com {consultorNome} no WhatsApp
    </a>
  );
  if (!fixed) return link;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      {link}
    </div>
  );
}
