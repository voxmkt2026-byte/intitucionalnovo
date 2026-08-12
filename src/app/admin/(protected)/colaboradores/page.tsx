import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { neon } from "@neondatabase/serverless";
import AdminColaboradoresClient from "@/components/admin/AdminColaboradoresClient";
import type { ClienteColaborador, Comissao, Partner, Planilha } from "@/components/admin/AdminColaboradoresClient";

export const metadata = {
  title: "Gestão de Colaboradores | Titanium Admin",
  robots: { index: false, follow: false },
};

const DATABASE_URL = process.env.DATABASE_URL || "";

async function getAdminColaboradoresData() {
  if (!DATABASE_URL) return { partners: [], planilhas: [], comissoes: [], clientes: [] };
  
  const sql = neon(DATABASE_URL);
  
  try {
    // 1. Fetch all affiliates
    const partners = await sql`
      SELECT id, nome, documento_cpf_cnpj, email, telefone, cidade, redes_sociais, chave_pix,
             status_onboarding, codigo_ref, vende_consorcio, experiencia_administradoras,
             experiencia_volume, experiencia_segmentos, base_tamanho, base_canais,
             base_ticket_medio, aceite_playbook, ip_assinatura, assinado_em, criado_em
      FROM afiliados
      ORDER BY criado_em DESC
    `;

    // 2. Fetch spreadsheet upload history
    const planilhas = await sql`
      SELECT id, filename, linhas_processadas, status, erro_mensagem, uploaded_by, criado_em
      FROM afiliados_planilhas
      ORDER BY criado_em DESC
      LIMIT 10
    `;

    // 3. Fetch recent commissions
    const comissoes = await sql`
      SELECT c.id, c.cliente_nome, c.valor_credito, c.comissao_valor, c.status_pagamento, c.criado_em,
             a.nome as parceiro_nome, a.codigo_ref
      FROM afiliados_comissoes c
      JOIN afiliados a ON c.afiliado_id = a.id
      ORDER BY c.criado_em DESC
      LIMIT 20
    `;

    // 4. Fetch clients registered by collaborators
    const clientes = await sql`
      SELECT 
        l.id as lead_id,
        l.name as cliente_nome,
        l.phone as cliente_telefone,
        l.email as cliente_email,
        l.segment as segmento,
        l.credit as valor_credito,
        l.plan as detalhes_plano,
        l.ref as codigo_ref,
        l.status as status_reserva,
        l.created_at as data_cadastro,
        a.id as afiliado_id,
        a.nome as afiliado_nome,
        a.email as afiliado_email,
        a.telefone as afiliado_telefone,
        r.observacoes as observacoes_reserva
      FROM leads l
      LEFT JOIN afiliados a ON l.ref = a.codigo_ref
      LEFT JOIN cartas_reservas r ON r.lead_id = l.id
      WHERE (l.ref IS NOT NULL AND l.ref != '')
         OR l.origin LIKE 'Portal do Colaborador%'
      ORDER BY l.created_at DESC
    `;

    // Serialize date fields
    const serializedPartners = partners.map(p => ({
      ...p,
      assinado_em: p.assinado_em ? new Date(p.assinado_em).toISOString() : null,
      criado_em: p.criado_em ? new Date(p.criado_em).toISOString() : new Date().toISOString()
    }));

    const serializedPlanilhas = planilhas.map(pl => ({
      ...pl,
      criado_em: pl.criado_em ? new Date(pl.criado_em).toISOString() : new Date().toISOString()
    }));

    const serializedComissoes = comissoes.map(c => ({
      ...c,
      criado_em: c.criado_em ? new Date(c.criado_em).toISOString() : new Date().toISOString()
    }));

    const serializedClientes = clientes.map(cl => ({
      ...cl,
      data_cadastro: cl.data_cadastro ? new Date(cl.data_cadastro).toISOString() : new Date().toISOString()
    }));

    return {
      partners: serializedPartners,
      planilhas: serializedPlanilhas,
      comissoes: serializedComissoes,
      clientes: serializedClientes,
    };
  } catch (err) {
    console.error("Erro ao carregar dados do admin de colaboradores:", err);
    return { partners: [], planilhas: [], comissoes: [], clientes: [] };
  }
}

export default async function AdminColaboradoresPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) redirect("/admin/login");

  const data = await getAdminColaboradoresData();

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", fontFamily: "var(--font-jakarta)" }}>
      {/* Back to dashboard */}
      <div style={{ marginBottom: "20px" }}>
        <a href="/admin/dashboard" style={{ fontSize: "12px", color: "var(--admin-text-soft)", textDecoration: "none" }}>
          ← Voltar para o Dashboard
        </a>
      </div>

      <AdminColaboradoresClient
        initialPartners={data.partners as unknown as Partner[]}
        initialPlanilhas={data.planilhas as unknown as Planilha[]}
        initialComissoes={data.comissoes as unknown as Comissao[]}
        initialClientes={data.clientes as unknown as ClienteColaborador[]}
      />
    </div>
  );
}

