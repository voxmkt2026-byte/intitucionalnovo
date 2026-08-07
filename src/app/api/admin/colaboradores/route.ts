import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { decryptField } from "@/lib/crypto";

const DATABASE_URL = process.env.DATABASE_URL || "";

function getDb() {
  if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");
  return neon(DATABASE_URL);
}

export async function GET(request: Request) {
  try {
    const isAuth = await verifyAdminRequest(request);
    if (!isAuth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const sql = getDb();
    
    // Fetch all affiliates ordered by creation date
    const partners = await sql`
      SELECT id, nome, documento_cpf_cnpj, email, telefone, cidade, redes_sociais, chave_pix,
             status_onboarding, codigo_ref, vende_consorcio, experiencia_administradoras,
             experiencia_volume, experiencia_segmentos, base_tamanho, base_canais,
             base_ticket_medio, aceite_playbook, ip_assinatura, assinado_em, criado_em
      FROM afiliados
      ORDER BY criado_em DESC
    `;

    const decryptedPartners = partners.map((p: any) => ({
      ...p,
      chave_pix: decryptField(p.chave_pix),
    }));

    return NextResponse.json(decryptedPartners);
  } catch (err: any) {
    console.error("[api/admin/colaboradores] Erro ao carregar colaboradores:", err);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
