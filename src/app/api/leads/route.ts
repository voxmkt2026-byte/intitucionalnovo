import { NextResponse } from "next/server";

const SHEETS_WEBHOOK =
  "https://script.google.com/macros/s/AKfycby_VBHU7fH0xlZuGZ-RiE5_jUXxJ0gE7TmgY0D5MSjTvF19a_Jjn_JkEaJi0m7RJFh7VQ/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Google Apps Script redirects 302 on POST.
    // With redirect:"follow", the browser/runtime converts to GET and loses the body.
    // Solution: use redirect:"manual", get the redirect Location, then POST again to that URL.
    const initialResponse = await fetch(SHEETS_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "manual",
    });

    // If redirect, follow it manually keeping POST method
    if (initialResponse.status === 302 || initialResponse.status === 301) {
      const redirectUrl = initialResponse.headers.get("Location");
      if (redirectUrl) {
        const finalResponse = await fetch(redirectUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          redirect: "follow",
        });
        const text = await finalResponse.text();
        return NextResponse.json({ status: "ok", response: text }, { status: 200 });
      }
    }

    // If no redirect, read directly
    const text = await initialResponse.text();
    return NextResponse.json(
      { status: initialResponse.ok ? "ok" : "error", response: text },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sheets webhook error:", error);
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
