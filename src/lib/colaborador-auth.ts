import { cookies } from "next/headers";
import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import type { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

interface ColaboradorSession extends JWTPayload {
  id: string;
  email: string;
  nome: string;
  codigo_ref: string;
  sessao_versao: number;
}

const getSecret = () => {
  const secret = process.env.JWT_SECRET || "titanium-consultoria-secret-key-2026";
  return new TextEncoder().encode(secret);
};

const JWT_OPTIONS = {
  algorithms: ["HS256"],
  issuer: "titanium",
  audience: "titanium-colaborador",
};

/** Gera o token JWT para sessões de colaboradores e representantes */
export async function signColaboradorToken(payload: ColaboradorSession): Promise<string> {
  const secret = getSecret();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("titanium")
    .setAudience("titanium-colaborador")
    .setExpirationTime("24h")
    .sign(secret);
}

/** Para Server Components e Server Actions */
async function validateSessionVersion(payload: ColaboradorSession): Promise<ColaboradorSession | null> {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl || !payload.id) return null;
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT email, nome, codigo_ref, status_onboarding
      FROM afiliados WHERE id = ${Number(payload.id)} LIMIT 1
    `;
    const affiliate = rows[0];
    if (!affiliate || ["Pendente", "Bloqueado"].includes(String(affiliate.status_onboarding))) return null;
    return {
      id: payload.id,
      email: String(affiliate.email),
      nome: String(affiliate.nome),
      codigo_ref: String(affiliate.codigo_ref),
      sessao_versao: Number(payload.sessao_versao ?? 1),
    };
  } catch {
    return null;
  }
}

export async function verifyColaboradorSession(): Promise<ColaboradorSession | null> {
  try {
    const store = await cookies();
    const token = store.get("representante_token")?.value || store.get("colaborador_token")?.value || store.get("afiliado_token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret(), JWT_OPTIONS).catch(() => {
      return jwtVerify(token, getSecret(), { ...JWT_OPTIONS, audience: "titanium-afiliado" });
    });
    return validateSessionVersion(payload as unknown as ColaboradorSession);
  } catch {
    return null;
  }
}

/** Para API Route Handlers e Proxy (lê do request) */
export async function verifyColaboradorRequest(req: NextRequest | Request): Promise<ColaboradorSession | null> {
  try {
    const cookie = (req as NextRequest).cookies?.get?.("representante_token")?.value
      ?? (req as NextRequest).cookies?.get?.("colaborador_token")?.value
      ?? (req as NextRequest).cookies?.get?.("afiliado_token")?.value
      ?? req.headers.get("cookie")?.match(/representante_token=([^;]+)/)?.[1]
      ?? req.headers.get("cookie")?.match(/colaborador_token=([^;]+)/)?.[1]
      ?? req.headers.get("cookie")?.match(/afiliado_token=([^;]+)/)?.[1];
    if (!cookie) return null;
    const { payload } = await jwtVerify(cookie, getSecret(), JWT_OPTIONS).catch(() => {
      return jwtVerify(cookie, getSecret(), { ...JWT_OPTIONS, audience: "titanium-afiliado" });
    });
    return validateSessionVersion(payload as unknown as ColaboradorSession);
  } catch {
    return null;
  }
}
