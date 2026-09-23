export type ProspectSegment = "imovel" | "veiculo";
export type ProspectPlan = "titanium" | "conforto";
export type ProspectEventType = "abertura" | "recalculo" | "whatsapp_click" | "contato_form";

/** Somente dados públicos; o id do banco permanece no servidor. */
export interface ProspectDTO {
  token: string;
  empresa: string;
  contato_nome: string | null;
  segmento: ProspectSegment;
  credito: number;
  prazo_meses: number;
  plano: ProspectPlan;
  whatsapp_consultor: string;
  consultor_nome: string;
}

export interface SimulationValues {
  segment: ProspectSegment;
  credit: number;
  months: number;
  plan: ProspectPlan;
  installment: number;
}

export function simulationPayload(values: SimulationValues) {
  return { segmento: values.segment, credito: values.credit, prazo: values.months, plano: values.plan };
}
