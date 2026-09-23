import "server-only";
import { neon } from "@neondatabase/serverless";
import type { ProspectDTO, ProspectEventType } from "../domain/types";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada");
  return neon(url);
}

function validToken(token: string) {
  return /^[A-Za-z0-9_-]{22,256}$/.test(token);
}

export async function buscarProspectPorToken(token: string): Promise<ProspectDTO | null> {
  if (!validToken(token)) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT token, empresa, contato_nome, segmento, credito, prazo_meses, plano,
           whatsapp_consultor, consultor_nome
    FROM prospects
    WHERE token = ${token} AND ativo = TRUE
      AND (expira_em IS NULL OR expira_em >= NOW())
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    token: String(row.token), empresa: String(row.empresa),
    contato_nome: row.contato_nome == null ? null : String(row.contato_nome),
    segmento: row.segmento as ProspectDTO["segmento"], credito: Number(row.credito),
    prazo_meses: Number(row.prazo_meses), plano: row.plano as ProspectDTO["plano"],
    whatsapp_consultor: String(row.whatsapp_consultor), consultor_nome: String(row.consultor_nome),
  };
}

/** Consulta exclusiva do servidor; revalida links expirados desde a abertura. */
export async function buscarProspectIdPorToken(token: string): Promise<number | null> {
  if (!validToken(token)) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT id FROM prospects
    WHERE token = ${token} AND ativo = TRUE
      AND (expira_em IS NULL OR expira_em >= NOW())
    LIMIT 1
  `;
  return rows[0] ? Number(rows[0].id) : null;
}

export async function registrarEvento(
  prospectId: number, tipo: ProspectEventType, payload: Record<string, unknown>,
  ip: string | null, userAgent: string | null,
): Promise<void> {
  try {
    const sql = getDb();
    await sql`
      INSERT INTO prospect_events (prospect_id, tipo, payload, ip, user_agent)
      VALUES (${prospectId}, ${tipo}, ${JSON.stringify(payload)}::jsonb, ${ip}, ${userAgent})
    `;
  } catch {
    console.warn("[prospects] Não foi possível registrar o evento.");
  }
}
