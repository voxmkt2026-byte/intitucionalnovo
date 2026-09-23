import "server-only";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { buscarProspectIdPorToken, registrarEvento } from "./repository";

const contactSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  telefone: z.string().transform((value) => value.replace(/\D/g, "")).pipe(z.string().regex(/^\d{10,11}$/)),
  horario: z.enum(["Manhã", "Tarde", "Qualquer horário"]),
});
const eventSchema = z.object({
  tipo: z.enum(["recalculo", "whatsapp_click"]),
  payload: z.record(z.string(), z.unknown()),
});

class BodyError extends Error {
  constructor(public status: number) { super("invalid_body"); }
}

async function readBody(request: Request): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > 2048) throw new BodyError(413);
  const reader = request.body?.getReader();
  if (!reader) throw new BodyError(400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2048) {
        await reader.cancel();
        throw new BodyError(413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new BodyError(400); }
}

export async function handleProspectPost(
  request: Request, context: { params: Promise<{ token: string }> }, kind: "contato" | "evento",
): Promise<Response> {
  try {
    const body = await readBody(request);
    const parsed = kind === "contato" ? contactSchema.safeParse(body) : eventSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: "invalid_data" }, { status: 400 });
    if ("payload" in parsed.data && new TextEncoder().encode(JSON.stringify(parsed.data.payload)).byteLength > 1024) {
      return Response.json({ error: "payload_too_large" }, { status: 413 });
    }
    const { token } = await context.params;
    const prospectId = await buscarProspectIdPorToken(token);
    if (prospectId === null) return Response.json({ error: "not_found" }, { status: 404 });
    const ip = getClientIp(request);
    const sql = neon(process.env.DATABASE_URL!);
    const limit = await checkRateLimit(sql, `prospect_${kind}:${ip}`, kind === "contato" ? 5 : 30, 60);
    if (!limit.allowed) return Response.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "60" } });
    if ("tipo" in parsed.data) {
      await registrarEvento(prospectId, parsed.data.tipo, parsed.data.payload, ip, request.headers.get("user-agent"));
    } else {
      await registrarEvento(prospectId, "contato_form", parsed.data, ip, request.headers.get("user-agent"));
    }
    return Response.json({ status: "ok" });
  } catch (error) {
    if (error instanceof BodyError) return Response.json({ error: error.status === 413 ? "payload_too_large" : "invalid_json" }, { status: error.status });
    console.warn("[prospects] Não foi possível processar a solicitação.");
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
