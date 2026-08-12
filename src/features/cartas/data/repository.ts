import "server-only";

import { neon } from "@neondatabase/serverless";
import { normalizarSegmento } from "../domain/segmento";
import type { CartaDTO } from "../domain/types";

const DATABASE_URL = process.env.DATABASE_URL || "";

function numberOrZero(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function nullableText(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function toCartaDTO(row: Record<string, unknown>): CartaDTO {
  const rawSegmento = String(row.segmento ?? "");
  return {
    id: numberOrZero(row.id),
    segmento: normalizarSegmento(rawSegmento),
    segmento_original: rawSegmento,
    administradora: String(row.administradora ?? ""),
    valor_credito: numberOrZero(row.valor_credito),
    entrada: row.entrada === null || row.entrada === undefined ? null : numberOrZero(row.entrada),
    parcelas: numberOrZero(row.parcelas),
    valor_parcela: numberOrZero(row.valor_parcela),
    proximo_vencimento: nullableText(row.proximo_vencimento),
    taxa_transferencia: nullableText(row.taxa_transferencia),
    vencimento_parcela: nullableText(row.vencimento_parcela),
    observacoes: nullableText(row.observacoes),
    status_cota: nullableText(row.status_cota),
    disponivel: Boolean(row.disponivel),
  };
}

export async function listarCartasDisponiveis(): Promise<CartaDTO[]> {
  if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");
  const sql = neon(DATABASE_URL);
  const rows = await sql`
    SELECT id, segmento, administradora, valor_credito, entrada, parcelas,
           valor_parcela, proximo_vencimento, taxa_transferencia,
           vencimento_parcela, observacoes, status_cota, disponivel
    FROM cartas_contempladas
    ORDER BY valor_credito DESC, id ASC
  `;
  return rows.map((row) => toCartaDTO(row as Record<string, unknown>));
}
