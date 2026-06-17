import { NextResponse } from "next/server";

const SHEETS_WEBHOOK =
  "https://script.google.com/macros/s/AKfycby_VBHU7fH0xlZuGZ-RiE5_jUXxJ0gE7TmgY0D5MSjTvF19a_Jjn_JkEaJi0m7RJFh7VQ/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward to Google Sheets Apps Script
    const response = await fetch(SHEETS_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "follow",
    });

    // Apps Script returns a redirect (302) then a JSON response
    const text = await response.text();
    return NextResponse.json({ status: "ok", response: text }, { status: 200 });
  } catch (error) {
    console.error("Sheets webhook error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
