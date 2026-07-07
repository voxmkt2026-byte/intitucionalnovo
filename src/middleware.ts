import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ── Rate-limiter in-memory (Edge Runtime) ── */
const rateMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;  // 20 requests per minute per IP

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_REQUESTS;
}

/* ── Cleanup stale entries every 5 minutes ── */
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  for (const [ip, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(ip);
  }
}

/* ── Security headers ── */
const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

export function middleware(req: NextRequest) {
  cleanup();

  const { pathname } = req.nextUrl;

  /* ── Rate-limit API routes only ── */
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(req);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em 1 minuto." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            ...securityHeaders,
          },
        }
      );
    }
  }

  /* ── Proteção de rotas /admin/* ── */
  // Edge Runtime não suporta jose/Node APIs completos.
  // Verificamos presença do cookie aqui (barreira leve) +
  // verificação criptográfica completa nos Server Components e API routes.
  if (
    pathname.startsWith("/admin/") &&
    !pathname.startsWith("/admin/login")
  ) {
    const adminToken = req.cookies.get("admin_token")?.value;
    if (!adminToken) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  /* ── Apply security headers to all responses ── */
  const response = NextResponse.next();

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Static assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
