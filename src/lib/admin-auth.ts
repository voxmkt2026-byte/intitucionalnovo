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
  audience: "titanium-admin",
};

/** Gera o token JWT para sessões administrativas */
export async function signAdminToken(payload: { id: string; email: string; nome: string }): Promise<string> {
  const secret = getSecret();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("titanium")
    .setAudience("titanium-admin")
    .setExpirationTime("8h")
    .sign(secret);
}

/** Para Server Components e Server Actions */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get("admin_token")?.value;
    if (!token) return false;
    await jwtVerify(token, getSecret(), JWT_OPTIONS);
    return true;
  } catch {
    return false;
  }
}

/** Para API Route Handlers e Proxy (lê do request) */
export async function verifyAdminRequest(req: NextRequest | Request): Promise<boolean> {
  try {
    const cookie = (req as NextRequest).cookies?.get?.("admin_token")?.value
      ?? req.headers.get("cookie")?.match(/admin_token=([^;]+)/)?.[1];
    if (!cookie) return false;
    await jwtVerify(cookie, getSecret(), JWT_OPTIONS);
    return true;
  } catch {
    return false;
  }
}
