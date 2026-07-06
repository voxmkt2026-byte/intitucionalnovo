import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import CartaAdminClient from "./CartaAdminClient";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "titanium-admin-secret-2024-change-in-prod"
);

export default async function AdminCartasPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) redirect("/admin/login");

  try {
    await jwtVerify(token, JWT_SECRET);
  } catch {
    redirect("/admin/login");
  }

  return <CartaAdminClient />;
}
