import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAdminRequest } from "@/lib/admin-auth";

const DATABASE_URL = process.env.DATABASE_URL || "";

function getDb() {
  if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");
  return neon(DATABASE_URL);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await verifyAdminRequest(request);
    if (!isAuth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status_onboarding } = body;

    if (!status_onboarding || !["Pendente", "Ativo", "Bloqueado"].includes(status_onboarding)) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 }
      );
    }

    const sql = getDb();
    const partnerId = parseInt(id, 10);

    // Se o status for "Bloqueado", excluímos o parceiro do banco (conforme pedido pelo usuário)
    if (status_onboarding === "Bloqueado") {
      await sql`
        DELETE FROM afiliados
        WHERE id = ${partnerId}
      `;
      return NextResponse.json({
        success: true,
        deleted: true,
        message: "Cadastro rejeitado e excluído com sucesso do banco de dados.",
      });
    }

    // Caso contrário (como "Ativo"), atualizamos o status
    const result = await sql`
      UPDATE afiliados
      SET status_onboarding = ${status_onboarding},
          atualizado_em = NOW()
      WHERE id = ${partnerId}
      RETURNING id, nome, status_onboarding, codigo_ref
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Colaborador não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Status do colaborador atualizado para ${status_onboarding}.`,
      parceiro: result[0],
    });
  } catch (err: any) {
    console.error("[api/admin/colaboradores/id] Erro ao atualizar/deletar status:", err);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await verifyAdminRequest(request);
    if (!isAuth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const sql = getDb();
    
    await sql`
      DELETE FROM afiliados
      WHERE id = ${parseInt(id, 10)}
    `;

    return NextResponse.json({
      success: true,
      message: "Cadastro excluído com sucesso do banco de dados.",
    });
  } catch (err: any) {
    console.error("[api/admin/colaboradores/id] Erro ao deletar colaborador:", err);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
