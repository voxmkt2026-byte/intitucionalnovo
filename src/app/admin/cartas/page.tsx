import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import CartaAdminClient from "./CartaAdminClient";

export default async function AdminCartasPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    redirect("/admin/login");
  }

  return <CartaAdminClient />;
}
