import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { sendGoogleOfflineConversion } from "@/lib/google-ads";
import { sendMetaCAPIEvent } from "@/lib/meta-capi";



// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeadRow {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  segment: string | null;
  credit: string | null;
  months: string | null;
  lp: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  fbc: string | null;
  fbp: string | null;
  gclid: string | null;
  status: string | null;
  notes: string | null;
  revenue: number | null;
  created_at: string;
  updated_at: string | null;
}

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const VALID_STATUSES = ["Novo", "Qualificado", "Vendido", "Perdido"] as const;
type LeadStatus = (typeof VALID_STATUSES)[number];

const PatchBodySchema = z
  .object({
    status: z.enum(VALID_STATUSES).optional(),
    notes: z.string().max(5000).optional(),
    revenue: z.number().min(0).optional(),
  })
  .refine((data) => data.status !== undefined || data.notes !== undefined || data.revenue !== undefined, {
    message: "At least one of 'status', 'notes', or 'revenue' must be provided",
  });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// PATCH /api/admin/leads/[id]
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }
  const sql = neon(process.env.DATABASE_URL);


  // Resolve dynamic route param (Next.js 15 async params)
  const { id: rawId } = await params;
  const leadId = parseInt(rawId, 10);

  if (isNaN(leadId) || leadId <= 0) {
    return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });
  }

  // Parse & validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PatchBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { status, notes, revenue } = parsed.data;
  try {
    // Check lead exists
    const existing = (await sql`
      SELECT id FROM leads WHERE id = ${leadId}
    `) as Array<{ id: number }>;

    if (existing.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    let updatedLead: LeadRow[];

    updatedLead = (await sql`
      UPDATE leads
      SET
        status     = COALESCE(${status !== undefined ? status : null}, status),
        notes      = COALESCE(${notes !== undefined ? notes : null}, notes),
        revenue    = COALESCE(${revenue !== undefined ? revenue : null}, revenue),
        updated_at = NOW()
      WHERE id = ${leadId}
      RETURNING
        id, name, phone, email, segment, credit, months, lp,
        utm_source, utm_medium, utm_campaign, fbc, fbp, gclid,
        status, notes, revenue, created_at, updated_at
    `) as LeadRow[];

    // Write event if status changed
    if (status !== undefined) {
      const statusValue: LeadStatus = status;
      await sql`
        INSERT INTO lead_events (lead_id, tipo, valor)
        VALUES (${leadId}, 'status_change', ${statusValue})
      `;

      // Trigger Google Offline conversion & Meta CAPI Purchase if status is Qualificado or Vendido
      if (statusValue === "Qualificado" || statusValue === "Vendido") {
        const leadRow = updatedLead[0];
        if (leadRow) {
          const revVal = revenue !== undefined ? revenue : (leadRow.revenue ? parseFloat(String(leadRow.revenue)) : 0);
          
          if (leadRow.gclid) {
            sendGoogleOfflineConversion({
              gclid: leadRow.gclid,
              status: statusValue,
              revenue: revVal,
              updatedAt: new Date()
            }).catch(err => console.error("[GoogleOffline] Background trigger error:", err));
          }

          if (statusValue === "Vendido") {
            sendMetaCAPIEvent({
              eventName: "Purchase",
              lead: {
                name: leadRow.name,
                phone: leadRow.phone,
                email: leadRow.email,
                segment: leadRow.segment,
                ref: leadRow.fbc ? `purchase-${leadRow.id}-${Date.now()}` : leadRow.id.toString(),
                fbc: leadRow.fbc,
                fbp: leadRow.fbp,
                revenue: revVal,
              },
              clientIp: request.headers.get("x-forwarded-for") || "",
              userAgent: request.headers.get("user-agent") || "",
            }).catch(err => console.error("[MetaCAPI] Background Purchase error:", err));
          }
        }
      }
    }

    if (notes !== undefined) {
      await sql`
        INSERT INTO lead_events (lead_id, tipo, valor)
        VALUES (${leadId}, 'notes_update', ${notes})
      `;
    }

    return NextResponse.json(updatedLead[0]);
  } catch (err) {
    console.error(`[admin/leads/${leadId}] PATCH error:`, err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
