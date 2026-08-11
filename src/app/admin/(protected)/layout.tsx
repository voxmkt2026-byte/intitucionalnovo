import AdminNavbar from "@/components/admin/AdminNavbar";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
}
