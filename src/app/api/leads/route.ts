import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

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

if (!SHEETS_WEBHOOK_URL) {
  throw new Error("SHEETS_WEBHOOK_URL environment variable is required");
}

const SHEETS_WEBHOOK: string = SHEETS_WEBHOOK_URL;

// --- Helpers ---

function sha256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

// --- Sheets ---

async function sendToSheets(body: LeadData): Promise<boolean> {
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

  const res = await fetch(SHEETS_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(leadPayload),
    redirect: "follow",
  });

  return res.ok;
}

async function sendClickAttribution(body: LeadData): Promise<void> {
  if (!body.ref) return;

  await fetch(SHEETS_WEBHOOK, {
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
}

// --- Meta CAPI ---

async function sendMetaCAPI(body: LeadData): Promise<void> {
  if (!META_ACCESS_TOKEN || !META_PIXEL_ID) return;

  const eventId = body.ref || crypto.randomUUID();
  const cleanedPhone = cleanPhone(body.phone);
  const firstName = body.name.split(" ")[0] || "";
  const creditValue =
    typeof body.credit === "number"
      ? body.credit
      : parseFloat(String(body.credit).replace(/\D/g, "")) || 0;

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url:
          body.source_url || "https://titaniumconsultoria.com.br",
        action_source: "website",
        user_data: {
          em: [sha256(body.email)],
          ph: [sha256("55" + cleanedPhone)],
          fn: [sha256(firstName)],
          ...(body.fbc && { fbc: body.fbc }),
          ...(body.fbp && { fbp: body.fbp }),
          client_user_agent: "Mozilla/5.0 (server-side)",
        },
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

// --- Route Handler ---

export async function POST(request: Request) {
  try {
    const body = leadSchema.parse(await request.json());

    // Fire all three in parallel
    const [sheetsResult] = await Promise.allSettled([
      sendToSheets(body),
      sendClickAttribution(body).catch(() => {}),
      sendMetaCAPI(body).catch(() => {}),
    ]);

    const sheetsOk =
      sheetsResult.status === "fulfilled" && sheetsResult.value === true;

    return NextResponse.json(
      { status: sheetsOk ? "ok" : "error", event_id: body.ref },
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
    sheets: SHEETS_WEBHOOK_URL ? "configured" : "missing",
    pixel: META_PIXEL_ID ? "configured" : "missing",
    capi:
      META_ACCESS_TOKEN && META_ACCESS_TOKEN.length > 10
        ? "configured"
        : "pending",
  });
}
