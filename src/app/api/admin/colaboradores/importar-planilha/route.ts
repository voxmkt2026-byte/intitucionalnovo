import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAdminRequest } from "@/lib/admin-auth";

const DATABASE_URL = process.env.DATABASE_URL || "";

function getDb() {
  if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");
  return neon(DATABASE_URL);
}

interface SpreadsheetRow {
  cliente_nome: string;
  valor_credito: number | string;
  comissao_valor: number | string;
  codigo_ref_ou_doc: string;
  data_fechamento?: string;
}

export async function POST(request: Request) {
  try {
    const isAuth = await verifyAdminRequest(request);
    if (!isAuth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { filename, rows } = body as { filename: string; rows: SpreadsheetRow[] };

    if (!filename || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: "Dados inválidos. filename e rows são obrigatórios." },
        { status: 400 }
      );
    }

    const sql = getDb();

    // 1. Registrar a planilha importada
    const sheetResult = await sql`
      INSERT INTO afiliados_planilhas (filename, status, linhas_processadas)
      VALUES (${filename}, 'processando', ${rows.length})
      RETURNING id
    `;
    const planilhaId = sheetResult[0].id;

    let matchedCount = 0;
    let unmatchedCount = 0;
    const unmatchedRows: any[] = [];

    // 2. Loop de Processamento (Match Engine)
    for (const row of rows) {
      const clientName = row.cliente_nome ? String(row.cliente_nome).trim() : "Cliente Desconhecido";
      const rawCredit = parseFloat(String(row.valor_credito).replace(/[^\d.]/g, "")) || 0;
      const rawCommission = parseFloat(String(row.comissao_valor).replace(/[^\d.]/g, "")) || 0;
      
      const rawRefOrDoc = row.codigo_ref_ou_doc ? String(row.codigo_ref_ou_doc).trim() : "";
      const cleanDoc = rawRefOrDoc.replace(/[^\d]/g, ""); // apenas números

      // Buscar colaborador por código de referência ou por documento cadastrado
      let partner = null;
      
      if (rawRefOrDoc) {
        const queryResult = await sql`
          SELECT id, nome FROM afiliados 
          WHERE codigo_ref = ${rawRefOrDoc.toLowerCase()} 
             OR REPLACE(REPLACE(documento_cpf_cnpj, '.', ''), '-', '') = ${cleanDoc}
          LIMIT 1
        `;
        if (queryResult.length > 0) {
          partner = queryResult[0];
        }
      }

      if (partner) {
        // Encontrou o colaborador -> Inserir comissão vinculada
        const dateClose = row.data_fechamento ? new Date(row.data_fechamento) : new Date();
        
        await sql`
          INSERT INTO afiliados_comissoes (
            afiliado_id, planilha_id, cliente_nome, valor_credito, comissao_valor,
            status_pagamento, data_fechamento
          ) VALUES (
            ${partner.id},
            ${planilhaId},
            ${clientName},
            ${rawCredit},
            ${rawCommission},
            'a_pagar',
            ${dateClose}
          )
        `;
        matchedCount++;
      } else {
        // Não encontrou o colaborador -> logar linha para retorno
        unmatchedRows.push(row);
        unmatchedCount++;
      }
    }

    // 3. Atualizar status da planilha no banco
    const finalStatus = unmatchedCount === 0 ? "concluido" : "erro"; // 'erro' se houver linhas não associadas
    const errorMsg = unmatchedCount > 0 ? `${unmatchedCount} linhas não puderam ser associadas automaticamente.` : null;

    await sql`
      UPDATE afiliados_planilhas
      SET status = ${finalStatus},
          erro_mensagem = ${errorMsg},
          linhas_processadas = ${matchedCount}
      WHERE id = ${planilhaId}
    `;

    return NextResponse.json({
      success: true,
      message: `Processamento da planilha concluído.`,
      planilhaId,
      totalRows: rows.length,
      matchedCount,
      unmatchedCount,
      unmatchedRows,
    });
  } catch (err: any) {
    console.error("[api/admin/colaboradores/importar-planilha] Erro ao importar planilha:", err);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
