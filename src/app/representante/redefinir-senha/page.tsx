import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata = {
  title: "Redefinir senha | Titanium Representante",
  description: "Defina uma nova senha para o Portal do Representante Titanium.",
  robots: { index: false, follow: false },
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? (params.token[0] ?? "") : (params.token ?? "");

  return (
    <>
      <Navbar />
      <main className="relative flex min-h-screen flex-1 items-center justify-center bg-slate-50 px-4 py-28 text-slate-900 selection:bg-emerald-500 selection:text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_60%)]" />
        <ResetPasswordForm token={token} />
      </main>
      <Footer />
    </>
  );
}
