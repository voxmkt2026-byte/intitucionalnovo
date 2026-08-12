import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAdminRequest } from "@/lib/admin-auth";

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

    // Busca clientes cadastrados por colaboradores/afiliados nas reservas de cartas ou leads com código de indicação
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

    return NextResponse.json({ success: true, clientes });
  } catch (err) {
    console.error("[api/admin/colaboradores/clientes] Erro ao carregar clientes dos colaboradores:", err);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
