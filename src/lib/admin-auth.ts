import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured in environment variables.");
  }
  return new TextEncoder().encode(secret);
};

/** Para Server Components e Server Actions */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get("admin_token")?.value;
    if (!token) return false;
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

/** Para API Route Handlers (lê do request) */
export async function verifyAdminRequest(req: NextRequest | Request): Promise<boolean> {
  try {
    const cookie = (req as NextRequest).cookies?.get?.("admin_token")?.value
      ?? req.headers.get("cookie")?.match(/admin_token=([^;]+)/)?.[1];
    if (!cookie) return false;
    await jwtVerify(cookie, getSecret());
    return true;
  } catch {
    return false;
  }
}
