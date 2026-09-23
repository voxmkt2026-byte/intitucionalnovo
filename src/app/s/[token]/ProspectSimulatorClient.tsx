"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ParcelSimulator from "@/components/ParcelSimulator";
import CartasSugeridas from "@/components/prospect/CartasSugeridas";
import ContatoProspectForm from "@/components/prospect/ContatoProspectForm";
import WhatsAppProspectButton from "@/components/prospect/WhatsAppProspectButton";
import { sendProspectEvent } from "@/components/prospect/events";
import type { ProspectDTO, SimulationValues } from "@/features/prospects/domain/types";

export default function ProspectSimulatorClient({ prospect }: { prospect: ProspectDTO }) {
  const [values, setValues] = useState<SimulationValues | null>(null);
  const previous = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onValuesChange = useCallback((next: SimulationValues) => {
    setValues(next);
    const serialized = JSON.stringify(next);
    const changed = previous.current !== null && previous.current !== serialized;
    previous.current = serialized;
    if (!changed) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => sendProspectEvent(prospect.token, "recalculo", next), 1500);
  }, [prospect.token]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const whatsappProps = values ? {
    token: prospect.token, empresa: prospect.empresa,
    whatsappNumber: prospect.whatsapp_consultor, consultorNome: prospect.consultor_nome, values,
  } : null;

  return (
    <>
      <ParcelSimulator
        initialSegment={prospect.segmento} initialCredit={prospect.credito}
        initialMonths={prospect.prazo_meses} initialPlan={prospect.plano}
        initialName={prospect.contato_nome || ""} prospectToken={prospect.token}
        whatsappNumber={prospect.whatsapp_consultor} hideContactFields onValuesChange={onValuesChange}
      />
      <div className="mx-auto max-w-[1160px] space-y-12 px-6 pb-16 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 lg:col-start-6">
            {whatsappProps && <WhatsAppProspectButton {...whatsappProps} />}
          </div>
        </div>
        <CartasSugeridas segmento={prospect.segmento} credito={prospect.credito} />
        <div className="mx-auto max-w-xl">
          <ContatoProspectForm token={prospect.token} contatoNome={prospect.contato_nome} consultorNome={prospect.consultor_nome}
            whatsappAction={whatsappProps && <WhatsAppProspectButton {...whatsappProps} />} />
        </div>
      </div>
      {whatsappProps && <WhatsAppProspectButton {...whatsappProps} fixed />}
    </>
  );
}
