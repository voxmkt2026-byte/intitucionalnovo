import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import AdminNavbar from "@/components/admin/AdminNavbar";
import LeadsTable from "@/components/admin/LeadsTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leads | Titanium Admin",
  robots: { index: false, follow: false },
};

export default async function LeadsPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) redirect("/admin/login");

  return (
    <>
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Gestão de Leads</h1>
          <p style={{ color: "rgba(255,255,255,0.4)" }} className="text-sm mt-1">
            CRM interno · substitui o Google Sheets
          </p>
        </div>
        <LeadsTable />
      </main>
    </>
  );
}
