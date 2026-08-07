import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured in environment variables.");
  }
  return new TextEncoder().encode(secret);
};

const JWT_OPTIONS = {
  algorithms: ["HS256"],
  issuer: "titanium",
  audience: "titanium-colaborador",
};

/** Gera o token JWT para sessões de colaboradores */
export async function signColaboradorToken(payload: { id: string; email: string; nome: string; codigo_ref: string }): Promise<string> {
  const secret = getSecret();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("titanium")
    .setAudience("titanium-colaborador")
    .setExpirationTime("24h") // Colaboradores stay logged in for 24h
    .sign(secret);
}

/** Para Server Components e Server Actions */
export async function verifyColaboradorSession(): Promise<{ id: string; email: string; nome: string; codigo_ref: string } | null> {
  try {
    const store = await cookies();
    // Suporta ambos os cookies para não deslogar usuários antigos imediatamente
    const token = store.get("colaborador_token")?.value || store.get("afiliado_token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret(), JWT_OPTIONS).catch(() => {
      // Fallback para audience antiga de afiliados
      return jwtVerify(token, getSecret(), { ...JWT_OPTIONS, audience: "titanium-afiliado" });
    });
    return payload as { id: string; email: string; nome: string; codigo_ref: string };
  } catch {
    return null;
  }
}

/** Para API Route Handlers e Proxy (lê do request) */
export async function verifyColaboradorRequest(req: NextRequest | Request): Promise<{ id: string; email: string; nome: string; codigo_ref: string } | null> {
  try {
    const cookie = (req as NextRequest).cookies?.get?.("colaborador_token")?.value
      ?? (req as NextRequest).cookies?.get?.("afiliado_token")?.value
      ?? req.headers.get("cookie")?.match(/colaborador_token=([^;]+)/)?.[1]
      ?? req.headers.get("cookie")?.match(/afiliado_token=([^;]+)/)?.[1];
    if (!cookie) return null;
    const { payload } = await jwtVerify(cookie, getSecret(), JWT_OPTIONS).catch(() => {
      // Fallback para audience antiga de afiliados
      return jwtVerify(cookie, getSecret(), { ...JWT_OPTIONS, audience: "titanium-afiliado" });
    });
    return payload as { id: string; email: string; nome: string; codigo_ref: string };
  } catch {
    return null;
  }
}
