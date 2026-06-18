import { NextResponse } from "next/server";

const SHEETS_WEBHOOK =
  process.env.SHEETS_WEBHOOK_URL ||
  "https://script.google.com/macros/s/AKfycby_VBHU7fH0xlZuGZ-RiE5_jUXxJ0gE7TmgY0D5MSjTvF19a_Jjn_JkEaJi0m7RJFh7VQ/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Send lead data to Leads sheet
    const leadPayload = {
      sheet: "Leads",
      name: body.name || "",
      email: body.email || "",
      phone: body.phone || "",
      segment: body.segment || "",
      credit: body.credit || "",
      months: body.months || 0,
      plan: body.plan || "",
      origin: body.origin || "",
      ref: body.ref || "",
      timestamp: new Date().toISOString(),
    };

    const leadUrl = `${SHEETS_WEBHOOK}?payload=${encodeURIComponent(JSON.stringify(leadPayload))}`;
    const leadResponse = await fetch(leadUrl, {
      method: "GET",
      redirect: "follow",
    });

    // Send click/tracking data to Cliques sheet (non-blocking)
    if (body.ref) {
      const clickPayload = {
        sheet: "Cliques",
        ref: body.ref,
        fbc: body.fbc || "",
        fbp: body.fbp || "",
        gclid: body.gclid || "",
        utm_source: body.utm_source || "",
        utm_medium: body.utm_medium || "",
        utm_campaign: body.utm_campaign || "",
        utm_content: body.utm_content || "",
        lp: body.lp || "",
        timestamp: new Date().toISOString(),
      };

      const clickUrl = `${SHEETS_WEBHOOK}?payload=${encodeURIComponent(JSON.stringify(clickPayload))}`;
      fetch(clickUrl, { method: "GET", redirect: "follow" }).catch(() => {
        /* silent - click tracking is non-critical */
      });
    }

    return NextResponse.json(
      { status: leadResponse.ok ? "ok" : "error" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sheets webhook error:", error);
    return NextResponse.json(
      { status: "error", message: String(error) },
      { status: 500 }
    );
  }
}

