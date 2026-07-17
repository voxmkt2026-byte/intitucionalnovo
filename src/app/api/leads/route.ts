import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { neon } from "@neondatabase/serverless";
import { sendMetaCAPIEvent } from "@/lib/meta-capi";

import { after } from "next/server";

const leadSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório").max(100),
  email: z.string().email().or(z.literal("")).default(""),
  phone: z.string().min(8, "Telefone inválido").max(20),
  segment: z.string().min(2, "Segmento é obrigatório").max(50),
  credit: z.union([z.string(), z.number()]).default(""),
  months: z.number().default(0),
  plan: z.string().max(50).default(""),
  origin: z.string().max(500).default(""),
  ref: z.string().max(100).default(""),
  fbc: z.string().max(200).default(""),
  fbp: z.string().max(200).default(""),
  gclid: z.string().max(200).default(""),
  utm_source: z.string().max(100).default(""),
  utm_medium: z.string().max(100).default(""),
  utm_campaign: z.string().max(200).default(""),
  utm_content: z.string().max(200).default(""),
  utm_term: z.string().max(200).default(""),
  lp: z.string().max(100).default(""),
  source_url: z.string().max(500).default(""),
  timestamp: z.string().max(50).default(""),
}).strict();

type LeadData = z.infer<typeof leadSchema>;

const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;
const META_PIXEL_ID = process.env.META_PIXEL_ID || "";
const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
const DATABASE_URL = process.env.DATABASE_URL || "";
const N8N_KOMMO_WEBHOOK_URL = process.env.N8N_KOMMO_WEBHOOK_URL || "";
const KOMMO_ACCESS_TOKEN = process.env.KOMMO_ACCESS_TOKEN || "";
const KOMMO_DOMAIN = process.env.KOMMO_DOMAIN || "titaniumconsultoriaofc.kommo.com";
const KOMMO_PIPELINE_ID = process.env.KOMMO_PIPELINE_ID ? parseInt(process.env.KOMMO_PIPELINE_ID, 10) : 13995439;



// --- Helpers ---

// --- Neon Postgres (PRIMARY STORAGE) ---

let leadStorageReady: Promise<void> | null = null;

async function ensureLeadStorage(): Promise<void> {
  if (!DATABASE_URL) return;

  if (!leadStorageReady) {
    leadStorageReady = (async () => {
      const sql = neon(DATABASE_URL);
      await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS client_ip TEXT`;
      await sql`CREATE INDEX IF NOT EXISTS leads_client_ip_created_at_idx ON leads (client_ip, created_at DESC)`;
    })().catch((error) => {
      leadStorageReady = null;
      throw error;
    });
  }

  await leadStorageReady;
}

async function sendToNeon(body: LeadData, clientIp: string): Promise<boolean> {
  if (!DATABASE_URL) {
    console.warn("[Neon] DATABASE_URL não configurada — pulando Neon.");
    return false;
  }

  try {
    await ensureLeadStorage();
    const sql = neon(DATABASE_URL);

    await sql`
      INSERT INTO leads (
        name, email, phone, segment, credit, months, plan,
        origin, ref, fbc, fbp, gclid,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        lp, source_url, client_ip
      ) VALUES (
        ${body.name}, ${body.email}, ${body.phone},
        ${body.segment}, ${String(body.credit)}, ${body.months},
        ${body.plan}, ${body.origin}, ${body.ref},
        ${body.fbc}, ${body.fbp}, ${body.gclid},
        ${body.utm_source}, ${body.utm_medium}, ${body.utm_campaign},
        ${body.utm_content}, ${body.utm_term || null}, ${body.lp}, ${body.source_url},
        ${clientIp}
      )
    `;

    console.log("[Neon] Lead salvo com sucesso.");
    return true;
  } catch (err) {
    console.error("[Neon] Erro ao salvar lead:", err);
    return false;
  }
}

// --- Google Sheets (OPCIONAL — fallback) ---
async function sendToAppsScript(url: string, payload: object, timeoutMs = 10000): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  });
}

async function sendToSheets(body: LeadData): Promise<boolean> {
  if (!SHEETS_WEBHOOK_URL) {
    console.warn("[Sheets] SHEETS_WEBHOOK_URL não configurada — pulando Sheets.");
    return false;
  }

  try {
    const leadPayload = {
      sheet: "Leads",
      name: body.name,
      email: body.email,
      phone: body.phone,
      segment: body.segment,
      credit: body.credit,
      months: body.months,
      plan: body.plan,
      origin: body.origin,
      ref: body.ref,
      fbc: body.fbc,
      fbp: body.fbp,
      gclid: body.gclid,
      utm_source: body.utm_source,
      utm_medium: body.utm_medium,
      utm_campaign: body.utm_campaign,
      utm_content: body.utm_content,
      utm_term: body.utm_term,
      lp: body.lp,
      source_url: body.source_url,
      timestamp: body.timestamp || new Date().toISOString(),
    };

    const res = await sendToAppsScript(SHEETS_WEBHOOK_URL, leadPayload);
    console.log("[Sheets] Status:", res.status, res.ok ? "✅" : "❌");
    return res.ok;
  } catch (err) {
    console.warn("[Sheets] Falhou (não crítico):", err);
    return false;
  }
}

async function sendClickAttribution(body: LeadData): Promise<void> {
  // Salva no Neon (primário) e Sheets (secundário) em paralelo
  await Promise.allSettled([
    // Neon — atribuição permanente sem depender do Sheets
    (async () => {
      if (!DATABASE_URL || !body.ref) return;
      try {
        const sql = neon(DATABASE_URL);
        await sql`
          INSERT INTO lead_clicks (ref, fbc, fbp, gclid, utm_source, utm_medium, utm_campaign, utm_content, utm_term, lp)
          VALUES (
            ${body.ref}, ${body.fbc || null}, ${body.fbp || null}, ${body.gclid || null},
            ${body.utm_source || null}, ${body.utm_medium || null},
            ${body.utm_campaign || null}, ${body.utm_content || null}, ${body.utm_term || null},
            ${body.lp || body.origin || null}
          )
        `;
      } catch { /* não crítico */ }
    })(),
    // Sheets — fallback secundário
    (async () => {
      if (!SHEETS_WEBHOOK_URL || !body.ref) return;
      try {
        await sendToAppsScript(SHEETS_WEBHOOK_URL, {
          sheet: "Cliques",
          ref: body.ref,
          fbc: body.fbc,
          fbp: body.fbp,
          gclid: body.gclid,
          utm_source: body.utm_source,
          utm_medium: body.utm_medium,
          utm_campaign: body.utm_campaign,
          utm_content: body.utm_content,
          utm_term: body.utm_term,
          lp: body.lp || body.origin,
          timestamp: new Date().toISOString(),
        });
      } catch { /* silencioso */ }
    })(),
  ]);
}



// --- Kommo API Direta ---

async function sendToKommo(body: LeadData): Promise<boolean> {
  if (!KOMMO_ACCESS_TOKEN) {
    console.warn("[Kommo] KOMMO_ACCESS_TOKEN não configurado — pulando.");
    // Fallback: tenta via n8n se configurado
    if (N8N_KOMMO_WEBHOOK_URL) {
      try {
        await fetch(N8N_KOMMO_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: body.name, phone: body.phone, email: body.email, segment: body.segment, credit: String(body.credit), months: body.months, plan: body.plan, lp: body.lp || body.origin, utm_source: body.utm_source, utm_medium: body.utm_medium, utm_campaign: body.utm_campaign, ref: body.ref, timestamp: new Date().toISOString() }),
        });
      } catch { /* não crítico */ }
    }
    return false;
  }

  const phone = body.phone.replace(/\D/g, "");
  const formattedPhone = phone.startsWith("55") ? `+${phone}` : `+55${phone}`;
  const creditValue = parseInt(String(body.credit).replace(/\D/g, "")) || 0;
  const leadName = `Lead - ${body.segment || "Geral"} | ${body.lp || body.utm_source || "site"}`;

  const tags: { name: string }[] = [];
  if (body.lp) tags.push({ name: body.lp });
  if (body.utm_source) tags.push({ name: body.utm_source });
  if (body.utm_campaign) tags.push({ name: body.utm_campaign });

  const nota = [
    "📋 Lead do formulário",
    `Nome: ${body.name || "-"}`,
    `Email: ${body.email || "-"}`,
    `Telefone: ${formattedPhone}`,
    `Segmento: ${body.segment || "-"}`,
    `Crédito: R$ ${creditValue.toLocaleString("pt-BR")}`,
    `Prazo: ${body.months || "-"} meses`,
    `Plano: ${body.plan || "-"}`,
    `LP: ${body.lp || "-"}`,
    `UTM Source: ${body.utm_source || "-"}`,
    `UTM Campaign: ${body.utm_campaign || "-"}`,
    `Ref: ${body.ref || "-"}`,
    `Data: ${new Date().toISOString()}`,
  ].join("\n");

  try {
    const headers = {
      "Authorization": `Bearer ${KOMMO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };

    // 1. Cria o lead
    const leadRes = await fetch(`https://${KOMMO_DOMAIN}/api/v4/leads`, {
      method: "POST",
      headers,
      body: JSON.stringify([{
        name: leadName,
        price: creditValue,
        pipeline_id: KOMMO_PIPELINE_ID,
        _embedded: {
          contacts: [{
            name: body.name || "Lead sem nome",
            custom_fields_values: [
              { field_code: "PHONE", values: [{ value: formattedPhone, enum_code: "WORK" }] },
              { field_code: "EMAIL", values: [{ value: body.email || "", enum_code: "WORK" }] },
            ],
          }],
          tags,
        },
      }]),
      signal: AbortSignal.timeout(10000),
    });

    if (!leadRes.ok) {
      const errText = await leadRes.text();
      console.error("[Kommo] Erro ao criar lead:", leadRes.status, errText);

      // 402 Payment Required: plano Kommo sem API — tenta fallback via n8n
      if (leadRes.status === 402 && N8N_KOMMO_WEBHOOK_URL) {
        console.warn("[Kommo] 402 detectado — ativando fallback n8n...");
        try {
          const n8nRes = await fetch(N8N_KOMMO_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: body.name,
              phone: body.phone,
              email: body.email,
              segment: body.segment,
              credit: String(body.credit),
              months: body.months,
              plan: body.plan,
              lp: body.lp || body.origin,
              utm_source: body.utm_source,
              utm_medium: body.utm_medium,
              utm_campaign: body.utm_campaign,
              ref: body.ref,
              timestamp: new Date().toISOString(),
            }),
            signal: AbortSignal.timeout(8000),
          });
          console.log("[Kommo] Fallback n8n:", n8nRes.ok ? "✅ ok" : `❌ ${n8nRes.status}`);
          return n8nRes.ok;
        } catch (n8nErr) {
          console.error("[Kommo] Fallback n8n falhou:", n8nErr);
        }
      }
      return false;
    }

    const leadData = await leadRes.json() as { _embedded?: { leads?: { id: number }[] } };
    const leadId = leadData?._embedded?.leads?.[0]?.id;
    if (!leadId) { console.error("[Kommo] Lead criado sem ID."); return false; }
    console.log("[Kommo] Lead criado:", leadId);

    // 2. Adiciona nota com dados completos
    await fetch(`https://${KOMMO_DOMAIN}/api/v4/leads/notes`, {
      method: "POST",
      headers,
      body: JSON.stringify([{ entity_id: leadId, note_type: "common", params: { text: nota } }]),
      signal: AbortSignal.timeout(6000),
    });

    console.log("[Kommo] Nota adicionada ao lead", leadId);
    return true;
  } catch (err) {
    console.error("[Kommo] Erro:", err);
    return false;
  }
}

// --- Route Handler ---

export async function POST(request: Request) {
  try {
    // 1. Limitar tamanho do body para 5KB
    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > 5120) {
      return NextResponse.json(
        { status: "error", message: "Payload too large" },
        { status: 413 }
      );
    }

    // Fix #2: extrair IP e User Agent reais para o CAPI
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "";
    const userAgent = request.headers.get("user-agent") || "";

    const jsonBody = await request.json();
    const body = leadSchema.parse(jsonBody);

    const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

    // 2. Verificação de idempotência por ref no banco
    if (sql && body.ref) {
      const existing = await sql`SELECT id FROM leads WHERE ref = ${body.ref} LIMIT 1`;
      if (existing.length > 0) {
        return NextResponse.json({
          status: "ok",
          event_id: body.ref,
          message: "Duplicate lead, ignored"
        });
      }
    }

    // 3. Rate limiting distribuído no Neon DB (limite de 5 leads por minuto por IP)
    if (sql && clientIp) {
      const recentLeads = await sql`
        SELECT COUNT(*)::int as count FROM leads
        WHERE client_ip = ${clientIp} AND created_at > NOW() - INTERVAL '1 minute'
      `;
      if (recentLeads[0] && recentLeads[0].count >= 5) {
        return NextResponse.json(
          { status: "error", message: "Muitas submissões de leads. Tente novamente mais tarde." },
          { status: 429 }
        );
      }
    }

    // 4. Salvar no Neon (Síncrono)
    const neonOk = await sendToNeon(body, clientIp);
    if (!neonOk) {
      return NextResponse.json(
        { status: "error", message: "Falha ao salvar lead" },
        { status: 500 }
      );
    }

    // 5. Integrações em background (Assíncrono via after)
    after(async () => {
      try {
        await Promise.allSettled([
          sendToSheets(body),
          sendClickAttribution(body).catch(() => {}),
          sendMetaCAPIEvent({ eventName: "Lead", lead: body, clientIp, userAgent }).catch(() => {}),
          sendToKommo(body),
        ]);
      } catch (err) {
        console.error("[leads/after] Background integrations failure:", err);
      }
    });

    return NextResponse.json({
      status: "ok",
      event_id: body.ref,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { status: "error", message: "Invalid input data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("API /leads error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check — protegido por header x-admin-key
export async function GET(request: Request) {
  const adminKey = request.headers.get("x-admin-key");
  const validKey = process.env.ADMIN_SECRET;

  // Sem chave válida: retorna apenas status genérico (sem information disclosure)
  if (!validKey || adminKey !== validKey) {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  return NextResponse.json({
    status: "ok",
    neon: DATABASE_URL ? "configured ✅" : "missing ⚠️",
    sheets: SHEETS_WEBHOOK_URL ? "configured ✅" : "not configured",
    pixel: META_PIXEL_ID ? "configured ✅" : "missing ⚠️",
    capi: META_CAPI_ACCESS_TOKEN && META_CAPI_ACCESS_TOKEN.length > 10 ? "configured ✅" : "missing ⚠️",
    kommo: KOMMO_ACCESS_TOKEN && KOMMO_ACCESS_TOKEN.length > 10 ? "configured ✅" : "missing ⚠️",
    kommo_n8n: N8N_KOMMO_WEBHOOK_URL ? "configured ✅" : "(fallback não configurado)",
  });
}

