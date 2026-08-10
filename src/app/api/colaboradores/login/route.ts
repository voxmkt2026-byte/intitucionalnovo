import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { signColaboradorToken } from "@/lib/colaborador-auth";

const DATABASE_URL = process.env.DATABASE_URL || "";

function getDb() {
  if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");
  return neon(DATABASE_URL);
}

export async function POST(request: Request) {
  try {
    const { email, senha, documento } = await request.json();

    if (!email || (!senha && !documento)) {
      return NextResponse.json(
        { error: "Informe seu e-mail e senha cadastrados para acessar." },
        { status: 400 }
      );
    }

    const sql = getDb();
    
    // Clean inputs
    const cleanEmail = email.toLowerCase().trim();

    const affiliates = await sql`
      SELECT id, nome, email, documento_cpf_cnpj, status_onboarding, codigo_ref, senha_hash
      FROM afiliados
      WHERE email = ${cleanEmail}
      LIMIT 1
    `;

    const affiliate = affiliates[0];
    if (!affiliate) {
      return NextResponse.json(
        { error: "Colaborador não encontrado com este e-mail." },
        { status: 401 }
      );
    }

    // Validar por senha se fornecida e usuário possui senha_hash
    if (senha) {
      if (affiliate.senha_hash) {
        const isValid = await bcrypt.compare(senha, affiliate.senha_hash);
        if (!isValid) {
          return NextResponse.json(
            { error: "E-mail ou senha incorretos." },
            { status: 401 }
          );
        }
      } else if (documento) {
        // Fallback para conta legada sem senha_hash
        const cleanDoc = documento.replace(/[^\d]/g, "").trim();
        const dbDoc = affiliate.documento_cpf_cnpj.replace(/[^\d]/g, "").trim();
        if (cleanDoc !== dbDoc) {
          return NextResponse.json(
            { error: "Documento (CPF/CNPJ) incorreto." },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Senha inválida para esta conta." },
          { status: 401 }
        );
      }
    } else if (documento) {
      // Login direto por documento
      const cleanDoc = documento.replace(/[^\d]/g, "").trim();
      const dbDoc = affiliate.documento_cpf_cnpj.replace(/[^\d]/g, "").trim();
      if (cleanDoc !== dbDoc) {
        return NextResponse.json(
          { error: "Documento (CPF/CNPJ) incorreto." },
          { status: 401 }
        );
      }
    }

    if (affiliate.status_onboarding === "Bloqueado") {
      return NextResponse.json(
        { error: "Acesso bloqueado. Entre em contato com o suporte." },
        { status: 403 }
      );
    }

    if (affiliate.status_onboarding === "Pendente") {
      return NextResponse.json(
        { 
          error: "Seu cadastro está em análise comercial. Enviaremos uma notificação no WhatsApp assim que for ativado.",
          status: "Pendente" 
        },
        { status: 403 }
      );
    }

    // Generate JWT via unified helper
    const token = await signColaboradorToken({
      id: String(affiliate.id),
      email: affiliate.email,
      nome: affiliate.nome,
      codigo_ref: affiliate.codigo_ref,
    });

    const response = NextResponse.json(
      { 
        ok: true, 
        nome: affiliate.nome, 
        codigo_ref: affiliate.codigo_ref 
      },
      { status: 200 }
    );

    response.cookies.set("colaborador_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24h
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[colaboradores/login] falha na autenticação:", err);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

// Logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("colaborador_token");
  response.cookies.delete("afiliado_token");
  return response;
}
