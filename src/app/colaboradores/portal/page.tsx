import { neon } from "@neondatabase/serverless";
import { verifyColaboradorSession } from "@/lib/colaborador-auth";
import PortalLogin from "@/components/PortalLogin";
import PortalDashboard from "@/components/PortalDashboard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Titanium Colaboradores | Portal do Colaborador",
  description: "Acompanhe seus clientes, comissões e confira o estoque de cartas contempladas.",
};

const DATABASE_URL = process.env.DATABASE_URL || "";

async function getPortalData(codigoRef: string, colaboradorId: number) {
  if (!DATABASE_URL) return { leads: [], comissoes: [], cartas: [] };
  
  const sql = neon(DATABASE_URL);
  
  let leads: any[] = [];
  try {
    // 1. Fetch clients (stored as leads in DB mapped by referral code)
    const res = await sql`
      SELECT id, name, email, phone, segment, credit, status, created_at
      FROM leads
      WHERE ref = ${codigoRef}
      ORDER BY created_at DESC
    `;
    leads = res.map(l => ({
      ...l,
      created_at: l.created_at ? new Date(l.created_at).toISOString() : new Date().toISOString()
    }));
  } catch (err) {
    console.error("Erro ao buscar leads/clientes no portal:", err);
  }

  let comissoes: any[] = [];
  try {
    // 2. Fetch commissions mapped by affiliate ID
    const res = await sql`
      SELECT id, cliente_nome, valor_credito, comissao_valor, status_pagamento, criado_em
      FROM afiliados_comissoes
      WHERE afiliado_id = ${colaboradorId}
      ORDER BY criado_em DESC
    `;
    comissoes = res.map(c => ({
      ...c,
      criado_em: c.criado_em ? new Date(c.criado_em).toISOString() : new Date().toISOString()
    }));
  } catch (err) {
    console.error("Erro ao buscar comissoes no portal:", err);
  }

  let cartas: any[] = [];
  try {
    // 3. Fetch active available letters
    const res = await sql`
      SELECT id, segmento, administradora, valor_credito, entrada, parcelas, valor_parcela, 
             proximo_vencimento, disponivel, taxa_transferencia, vencimento_parcela, observacoes
      FROM cartas_contempladas
      WHERE disponivel = true
      ORDER BY valor_credito DESC
    `;
    // Pass raw rows. Since proximo_vencimento is a text column in migrations,
    // we keep it as a string to avoid date parsing errors on text fields.
    cartas = res;
  } catch (err) {
    console.error("Erro ao buscar cartas contempladas no portal:", err);
  }

  return { leads, comissoes, cartas };
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
  const { leads, comissoes, cartas } = await getPortalData(session.codigo_ref, parseInt(session.id, 10));

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
          initialCartas={cartas as any}
        />
      </main>
      <Footer />
    </>
  );
}
