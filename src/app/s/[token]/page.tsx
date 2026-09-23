import type { Metadata } from "next";
import { headers } from "next/headers";
import { after } from "next/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParcelSimulator from "@/components/ParcelSimulator";
import { buscarProspectIdPorToken, buscarProspectPorToken, registrarEvento } from "@/features/prospects/data/repository";
import ProspectSimulatorClient from "./ProspectSimulatorClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sua simulação | Titanium Consultoria",
  robots: { index: false, follow: false },
};

export default async function ProspectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const prospect = await buscarProspectPorToken(token);
  if (prospect) {
    const requestHeaders = await headers();
    const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = requestHeaders.get("user-agent");
    after(async () => {
      try {
        const id = await buscarProspectIdPorToken(token);
        if (id !== null) await registrarEvento(id, "abertura", {
          segmento: prospect.segmento, credito: prospect.credito, prazo_meses: prospect.prazo_meses,
        }, ip, userAgent);
      } catch { console.warn("[prospects] Não foi possível registrar a abertura."); }
    });
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-28 font-jakarta">
        {prospect ? <>
          <header className="mx-auto max-w-[1160px] px-6 pt-8 md:px-10 lg:px-12">
            {prospect.contato_nome && <p className="mb-3 text-base font-medium text-[#0A7B3E]">Olá, {prospect.contato_nome}</p>}
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Simulação preparada para <span className="text-[#0A7B3E]">{prospect.empresa}</span>
            </h1>
          </header>
          <ProspectSimulatorClient prospect={prospect} />
        </> : <ParcelSimulator />}
      </main>
      <Footer />
      {prospect && <div aria-hidden="true" className="h-24 md:hidden" />}
    </>
  );
}
