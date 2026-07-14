import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { fetchAdminStats } from "@/lib/admin-stats";

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const stats = await fetchAdminStats();
    return NextResponse.json(stats);
  } catch (err: any) {
    console.error("[admin/stats] error:", err);
    return NextResponse.json({ error: "Database error: " + err.message }, { status: 500 });
  }
}
