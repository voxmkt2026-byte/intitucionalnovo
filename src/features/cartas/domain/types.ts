import type { SegmentoCarta } from "./segmento";

export interface CartaDTO {
  id: number;
  segmento: SegmentoCarta;
  segmento_original: string;
  administradora: string;
  valor_credito: number;
  entrada: number | null;
  parcelas: number;
  valor_parcela: number;
  proximo_vencimento: string | null;
  taxa_transferencia: string | null;
  vencimento_parcela: string | null;
  observacoes: string | null;
  disponivel: boolean;
}
