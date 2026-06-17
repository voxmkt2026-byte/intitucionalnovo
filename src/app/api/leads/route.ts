import { NextResponse } from "next/server";

const SHEETS_WEBHOOK =
  "https://script.google.com/macros/s/AKfycby_VBHU7fH0xlZuGZ-RiE5_jUXxJ0gE7TmgY0D5MSjTvF19a_Jjn_JkEaJi0m7RJFh7VQ/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jsonPayload = JSON.stringify(body);

    // Google Apps Script POST flow:
    // 1. POST to /macros/s/.../exec → 302 redirect to script.googleusercontent.com
    // 2. Node.js fetch with redirect:"follow" converts POST→GET on 302 (RFC 7231)
    // 3. So the body is lost on redirect
    //
    // Fix: Use redirect:"manual" to capture the redirect URL,
    // then send the payload as a query parameter to the redirect URL
    const initialRes = await fetch(SHEETS_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: jsonPayload,
      redirect: "manual",
    });

    if (initialRes.status >= 300 && initialRes.status < 400) {
      const redirectUrl = initialRes.headers.get("Location");
      if (redirectUrl) {
        // Re-POST to the actual execution URL (after redirect)
        const finalRes = await fetch(redirectUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: jsonPayload,
        });
        const text = await finalRes.text();
        return NextResponse.json({ status: "ok", sheetsResponse: text }, { status: 200 });
      }
    }

    const text = await initialRes.text();
    return NextResponse.json({ status: "ok", sheetsResponse: text }, { status: 200 });
  } catch (error) {
    console.error("Sheets webhook error:", error);
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
