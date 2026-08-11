import Footer from "@/components/Footer";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Recuperar senha | Titanium Representante",
  description: "Recupere com segurança o acesso ao Portal do Representante Titanium.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="relative flex min-h-screen flex-1 items-center justify-center bg-slate-50 px-4 py-28 text-slate-900 selection:bg-emerald-500 selection:text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_60%)]" />
        <ForgotPasswordForm />
      </main>
      <Footer />
    </>
  );
}
