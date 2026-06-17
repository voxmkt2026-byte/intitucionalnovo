import { NextResponse } from "next/server";

const SHEETS_WEBHOOK =
  "https://script.google.com/macros/s/AKfycby_VBHU7fH0xlZuGZ-RiE5_jUXxJ0gE7TmgY0D5MSjTvF19a_Jjn_JkEaJi0m7RJFh7VQ/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Google Apps Script GET approach:
    // POST to GAS triggers a 302 redirect that loses the body.
    // Instead, we call doGet with the payload as a query parameter.
    // doGet processes e.parameter.payload and writes to the sheet.
    const url = `${SHEETS_WEBHOOK}?payload=${encodeURIComponent(JSON.stringify(body))}`;

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    const text = await response.text();

    return NextResponse.json(
      { status: response.ok ? "ok" : "error", sheetsResponse: text },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sheets webhook error:", error);
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
