import { NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Postgres-backed fixed-window rate limiter com fallback gracioso.
 */
export async function checkRateLimit(
  sql: NeonQueryFunction<false, false>,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const windowStart = new Date(Date.now() - windowSeconds * 1000);

    const rows = await sql`
      SELECT COUNT(*)::int AS count
      FROM rate_limits
      WHERE rate_key = ${key} AND criado_em > ${windowStart.toISOString()}
    `;
    const currentCount = (rows[0]?.count as number) ?? 0;

    if (currentCount >= limit) {
      return { allowed: false, remaining: 0 };
    }

    await sql`
      INSERT INTO rate_limits (rate_key, criado_em) VALUES (${key}, NOW())
    `;

    return { allowed: true, remaining: limit - currentCount - 1 };
  } catch (err) {
    console.warn("[RateLimit] Falha ao verificar/inserir tabela de rate_limits (permitindo acesso):", err);
    return { allowed: true, remaining: limit };
  }
}

export function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
