import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { neon } from "@neondatabase/serverless";

const leadSchema = z.object({
  name: z.string().max(100).default(""),
  email: z.string().email().or(z.literal("")).default(""),
  phone: z.string().max(20).default(""),
  segment: z.string().max(50).default(""),
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
  lp: z.string().max(100).default(""),
  source_url: z.string().max(500).default(""),
  timestamp: z.string().max(50).default(""),
});

type LeadData = z.infer<typeof leadSchema>;

const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;
const META_PIXEL_ID = process.env.META_PIXEL_ID || "";
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "";
const DATABASE_URL = process.env.DATABASE_URL || "";
const N8N_KOMMO_WEBHOOK_URL = process.env.N8N_KOMMO_WEBHOOK_URL || "";
const KOMMO_ACCESS_TOKEN = process.env.KOMMO_ACCESS_TOKEN || "";
const KOMMO_DOMAIN = "titaniumconsultoriaofc.kommo.com";
const KOMMO_PIPELINE_ID = 13995439;

// --- Helpers ---

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

// --- Neon Postgres (PRIMARY STORAGE) ---

async function sendToNeon(body: LeadData): Promise<boolean> {
  if (!DATABASE_URL) {
    console.warn("[Neon] DATABASE_URL não configurada — pulando Neon.");
    return false;
  }

  try {
    const sql = neon(DATABASE_URL);

    // Cria tabela se não existir
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        segment TEXT,
        credit TEXT,
        months INTEGER,
        plan TEXT,
        origin TEXT,
        ref TEXT,
        fbc TEXT,
        fbp TEXT,
        gclid TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        utm_content TEXT,
        lp TEXT,
        source_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO leads (
        name, email, phone, segment, credit, months, plan,
        origin, ref, fbc, fbp, gclid,
        utm_source, utm_medium, utm_campaign, utm_content,
        lp, source_url
      ) VALUES (
        ${body.name}, ${body.email}, ${body.phone},
        ${body.segment}, ${String(body.credit)}, ${body.months},
        ${body.plan}, ${body.origin}, ${body.ref},
        ${body.fbc}, ${body.fbp}, ${body.gclid},
        ${body.utm_source}, ${body.utm_medium}, ${body.utm_campaign},
        ${body.utm_content}, ${body.lp}, ${body.source_url}
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
      timestamp: body.timestamp || new Date().toISOString(),
    };

    const res = await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadPayload),
      redirect: "follow",
    });

    return res.ok;
  } catch (err) {
    console.warn("[Sheets] Falhou (não crítico):", err);
    return false;
  }
}

async function sendClickAttribution(body: LeadData): Promise<void> {
  if (!SHEETS_WEBHOOK_URL || !body.ref) return;

  try {
    await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sheet: "Cliques",
        ref: body.ref,
        fbc: body.fbc,
        fbp: body.fbp,
        gclid: body.gclid,
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        utm_content: body.utm_content,
        lp: body.lp || body.origin,
        timestamp: new Date().toISOString(),
      }),
      redirect: "follow",
    });
  } catch {
    // silencioso — não crítico
  }
}

// --- Meta CAPI ---

async function sendMetaCAPI(
  body: LeadData,
  clientIp: string,
  userAgent: string
): Promise<void> {
  if (!META_ACCESS_TOKEN || !META_PIXEL_ID) return;

  const eventId = body.ref || crypto.randomUUID();
  const cleanedPhone = cleanPhone(body.phone);
  const firstName = body.name.split(" ")[0] || "";
  const creditValue =
    typeof body.credit === "number"
      ? body.credit
      : parseFloat(String(body.credit).replace(/\D/g, "")) || 0;

  // Fix #2: usar IP e User Agent reais da request
  // Fix #3: não enviar hash de campos vazios
  const userData: Record<string, unknown> = {
    ...(body.email && { em: [sha256(body.email)] }),
    ...(cleanedPhone && { ph: [sha256("55" + cleanedPhone)] }),
    ...(firstName && { fn: [sha256(firstName)] }),
    ...(body.fbc && { fbc: body.fbc }),
    ...(body.fbp && { fbp: body.fbp }),
    ...(clientIp && { client_ip_address: clientIp }),
    client_user_agent: userAgent || "Mozilla/5.0",
  };

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: body.source_url || "https://titaniumconsultoria.com.br",
        action_source: "website",
        user_data: userData,
        custom_data: {
          currency: "BRL",
          value: creditValue,
          content_name: body.segment,
          content_category: "carta_contemplada",
        },
      },
    ],
    access_token: META_ACCESS_TOKEN,
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v23.0/${META_PIXEL_ID}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const result = await res.json();
    console.log("[CAPI] Response:", JSON.stringify(result));
  } catch (err) {
    console.error("[CAPI] Error:", err);
  }
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
    });

    if (!leadRes.ok) {
      const err = await leadRes.text();
      console.error("[Kommo] Erro ao criar lead:", leadRes.status, err);
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
    // Fix #2: extrair IP e User Agent reais para o CAPI
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "";
    const userAgent = request.headers.get("user-agent") || "";

    const body = leadSchema.parse(await request.json());

    // Dispara tudo em paralelo — Kommo direto
    const [neonResult, , , , kommoResult] = await Promise.allSettled([
      sendToNeon(body),
      sendToSheets(body).catch(() => {}),
      sendClickAttribution(body).catch(() => {}),
      sendMetaCAPI(body, clientIp, userAgent).catch(() => {}),
      sendToKommo(body),
    ]);

    // Sucesso se Neon salvou (Sheets é opcional)
    const saved = neonResult.status === "fulfilled" && neonResult.value === true;
    const kommoOk = kommoResult.status === "fulfilled" && kommoResult.value === true;
    const kommoError = kommoResult.status === "rejected" ? String((kommoResult as PromiseRejectedResult).reason) : null;

    return NextResponse.json(
      { status: saved ? "ok" : "partial", event_id: body.ref, kommo: kommoOk ? "✅ ok" : (kommoError ?? "❌ failed") },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { status: "error", message: "Invalid input data" },
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

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    neon: DATABASE_URL ? "configured ✅" : "missing ⚠️",
    sheets: SHEETS_WEBHOOK_URL ? "configured ✅" : "not configured",
    pixel: META_PIXEL_ID ? "configured ✅" : "missing ⚠️",
    capi: META_ACCESS_TOKEN && META_ACCESS_TOKEN.length > 10 ? "configured ✅" : "missing ⚠️",
    kommo: KOMMO_ACCESS_TOKEN && KOMMO_ACCESS_TOKEN.length > 10 ? "configured ✅" : "missing ⚠️",
    kommo_n8n: N8N_KOMMO_WEBHOOK_URL ? "configured ✅" : "(fallback não configurado)",
  });
}

