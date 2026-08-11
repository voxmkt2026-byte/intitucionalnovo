import { neon } from "@neondatabase/serverless";
import { verifyColaboradorSession } from "@/lib/colaborador-auth";
import PortalLogin from "@/components/PortalLogin";
import PortalDashboard, {
  type PortalComissao,
  type PortalLead,
} from "@/components/PortalDashboard";
import { listarCartasDisponiveis } from "@/features/cartas/data/repository";
import type { CartaDTO } from "@/features/cartas/domain/types";

export const metadata = {
  title: "Titanium Colaboradores | Portal do Colaborador",
  description: "Acompanhe seus clientes, comissões e confira o estoque de cartas contempladas.",
};

const DATABASE_URL = process.env.DATABASE_URL || "";

async function getPortalData(codigoRef: string, colaboradorId: number) {
  if (!DATABASE_URL) return { leads: [], comissoes: [], cartas: [] };
  
  const sql = neon(DATABASE_URL);
  
  let leads: PortalLead[] = [];
  try {
    // 1. Fetch clients (stored as leads in DB mapped by referral code)
    const res = await sql`
      SELECT id, name, email, phone, segment, credit, status, created_at
      FROM leads
      WHERE ref = ${codigoRef}
      ORDER BY created_at DESC
    `;
    leads = res.map((lead) => ({
      id: Number(lead.id),
      name: String(lead.name ?? ""),
      email: String(lead.email ?? ""),
      phone: String(lead.phone ?? ""),
      segment: String(lead.segment ?? ""),
      credit: String(lead.credit ?? ""),
      status: String(lead.status ?? ""),
      created_at: lead.created_at ? new Date(String(lead.created_at)).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Erro ao buscar leads/clientes no portal:", err);
  }

  let comissoes: PortalComissao[] = [];
  try {
    // 2. Fetch commissions mapped by affiliate ID
    const res = await sql`
      SELECT id, cliente_nome, valor_credito, comissao_valor, status_pagamento, criado_em
      FROM afiliados_comissoes
      WHERE afiliado_id = ${colaboradorId}
      ORDER BY criado_em DESC
    `;
    comissoes = res.map((comissao) => ({
      id: Number(comissao.id),
      cliente_nome: String(comissao.cliente_nome ?? ""),
      valor_credito: Number(comissao.valor_credito ?? 0),
      comissao_valor: Number(comissao.comissao_valor ?? 0),
      status_pagamento: String(comissao.status_pagamento ?? ""),
      criado_em: comissao.criado_em ? new Date(String(comissao.criado_em)).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Erro ao buscar comissoes no portal:", err);
  }

  let cartas: CartaDTO[] = [];
  try {
    // A vitrine pública e o portal consomem a mesma origem e o mesmo DTO.
    cartas = await listarCartasDisponiveis();
  } catch (err) {
    console.error("Erro ao buscar cartas contempladas no portal:", err);
  }

  return { leads, comissoes, cartas };
}

export default async function ColaboradoresPortalPage() {
  const session = await verifyColaboradorSession();

  if (!session) {
    return (
      <main className="flex-1 bg-slate-50 text-slate-900 font-jakarta selection:bg-emerald-500 selection:text-white px-4 min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_60%)] pointer-events-none" />
          <PortalLogin />
      </main>
    );
  }

  // Fetch live dashboard data
  const { leads, comissoes, cartas } = await getPortalData(session.codigo_ref, parseInt(session.id, 10));

  return (
    <>
      <main className="flex-1 bg-slate-50 text-slate-900 font-jakarta selection:bg-emerald-500 selection:text-white min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04)_0%,transparent_60%)] pointer-events-none" />
        <PortalDashboard
          partnerName={session.nome}
          partnerRef={session.codigo_ref}
          initialLeads={leads}
          initialComissoes={comissoes}
          initialCartas={cartas}
        />
      </main>
    </>
  );
}
