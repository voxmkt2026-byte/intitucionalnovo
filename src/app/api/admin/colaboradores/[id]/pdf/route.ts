import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { decryptField } from "@/lib/crypto";
import { generateContractHtml } from "@/lib/pdf-template";

export const runtime = "nodejs";
export const maxDuration = 60;

const DATABASE_URL = process.env.DATABASE_URL || "";

function getDb() {
  if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");
  return neon(DATABASE_URL);
}

async function getPartner(id: number) {
  const sql = getDb();
  const result = await sql`
    SELECT id, nome, documento_cpf_cnpj, email, telefone, cidade, redes_sociais, chave_pix,
           status_onboarding, codigo_ref, vende_consorcio, aceite_playbook, ip_assinatura,
           assinado_em, criado_em, cpf, cnpj, data_nascimento, rg, endereco_completo,
           banco, tipo_conta, agencia, conta, operacao, titular_nome,
           principal_produto, trabalha_carta_contemplada, principal_publico,
           quantidade_indicacoes, quer_atuar_como, aceita_receber_contatos, quantidade_colaboradores
    FROM afiliados
    WHERE id = ${id}
    LIMIT 1
  `;
  const partner: any = result[0];
  if (!partner) return null;

  return {
    ...partner,
    cpf: decryptField(partner.cpf),
    cnpj: decryptField(partner.cnpj),
    rg: decryptField(partner.rg),
    agencia: decryptField(partner.agencia),
    conta: decryptField(partner.conta),
    chave_pix: decryptField(partner.chave_pix),
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await verifyAdminRequest(request);
    if (!isAuth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const partner = await getPartner(parseInt(id, 10));
    if (!partner) {
      return NextResponse.json({ error: "Colaborador não encontrado" }, { status: 404 });
    }

    const html = generateContractHtml(partner);

    // Lazy-load puppeteer/chromium: keeps this heavy dependency out of the
    // bundle for every other route and avoids cold-start cost elsewhere.
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0", bottom: "0", left: "0", right: "0" },
      });

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="ficha-cadastro-${partner.codigo_ref}.pdf"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (err: any) {
    console.error("[api/admin/colaboradores/id/pdf] Erro ao gerar PDF:", err);
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
  }
}
