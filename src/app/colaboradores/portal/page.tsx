import { neon } from "@neondatabase/serverless";
import { verifyColaboradorSession } from "@/lib/colaborador-auth";
import PortalLogin from "@/components/PortalLogin";
import PortalDashboard from "@/components/PortalDashboard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Titanium Colaboradores | Portal do Colaborador",
  description: "Acompanhe suas indicações, comissões a pagar e baixe tabelas comerciais.",
};

const DATABASE_URL = process.env.DATABASE_URL || "";

async function getPortalData(codigoRef: string, colaboradorId: number) {
  if (!DATABASE_URL) return { leads: [], comissoes: [] };
  
  const sql = neon(DATABASE_URL);
  
  try {
    // 1. Fetch leads mapped by referral code
    const leads = await sql`
      SELECT id, name, phone, segment, credit, status, created_at
      FROM leads
      WHERE ref = ${codigoRef}
      ORDER BY created_at DESC
    `;

    // 2. Fetch commissions mapped by affiliate ID
    const comissoes = await sql`
      SELECT id, cliente_nome, valor_credito, comissao_valor, status_pagamento, criado_em
      FROM afiliados_comissoes
      WHERE afiliado_id = ${colaboradorId}
      ORDER BY criado_em DESC
    `;

    // Transform date fields to strings for serialization
    const serializedLeads = leads.map(l => ({
      ...l,
      created_at: l.created_at ? new Date(l.created_at).toISOString() : new Date().toISOString()
    }));

    const serializedComissoes = comissoes.map(c => ({
      ...c,
      criado_em: c.criado_em ? new Date(c.criado_em).toISOString() : new Date().toISOString()
    }));

    return { leads: serializedLeads, comissoes: serializedComissoes };
  } catch (err) {
    console.error("Erro ao carregar dados do portal do colaborador:", err);
    return { leads: [], comissoes: [] };
  }
}

export default async function ColaboradoresPortalPage() {
  const session = await verifyColaboradorSession();

  if (!session) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-slate-50 text-slate-900 font-jakarta selection:bg-emerald-500 selection:text-white py-28 px-4 min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_60%)] pointer-events-none" />
          <PortalLogin />
        </main>
        <Footer />
      </>
    );
  }

  // Fetch live dashboard data
  const { leads, comissoes } = await getPortalData(session.codigo_ref, parseInt(session.id, 10));

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50 text-slate-900 font-jakarta selection:bg-emerald-500 selection:text-white py-28 min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04)_0%,transparent_60%)] pointer-events-none" />
        <PortalDashboard
          partnerName={session.nome}
          partnerRef={session.codigo_ref}
          initialLeads={leads as any}
          initialComissoes={comissoes as any}
        />
      </main>
      <Footer />
    </>
  );
}
