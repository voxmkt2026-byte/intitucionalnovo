import { NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().max(100).default(""),
  email: z.string().email().or(z.literal("")).default(""),
  phone: z.string().max(20).default(""),
  segment: z.string().max(50).default(""),
  credit: z.string().max(20).default(""),
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
});

const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;

if (!SHEETS_WEBHOOK_URL) {
  throw new Error("SHEETS_WEBHOOK_URL environment variable is required");
}

const SHEETS_WEBHOOK: string = SHEETS_WEBHOOK_URL;

export async function POST(request: Request) {
  try {
    const body = leadSchema.parse(await request.json());

    // Send lead data to Leads sheet
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
      timestamp: new Date().toISOString(),
    };

    const leadResponse = await fetch(SHEETS_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadPayload),
      redirect: "follow",
    });

    // Send click/tracking data to Cliques sheet (non-blocking)
    if (body.ref) {
      const clickPayload = {
        sheet: "Cliques",
        ref: body.ref,
        fbc: body.fbc,
        fbp: body.fbp,
        gclid: body.gclid,
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        utm_content: body.utm_content,
        lp: body.lp,
        timestamp: new Date().toISOString(),
      };

      fetch(SHEETS_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clickPayload),
        redirect: "follow",
      }).catch(() => {
        /* silent - click tracking is non-critical */
      });
    }

    return NextResponse.json(
      { status: leadResponse.ok ? "ok" : "error" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { status: "error", message: "Invalid input data" },
        { status: 400 }
      );
    }
    console.error("Sheets webhook error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
