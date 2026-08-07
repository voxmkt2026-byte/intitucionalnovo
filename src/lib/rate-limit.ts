import { NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Postgres-backed fixed-window rate limiter.
 *
 * Serverless functions have no shared in-memory state between invocations,
 * so limits are enforced against the Neon database (already the single
 * shared resource this app has, avoiding the need for a separate Redis).
 */
export async function checkRateLimit(
  sql: NeonQueryFunction<false, false>,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
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
}

export function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
