import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signColaboradorToken } from "@/lib/colaborador-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const DATABASE_URL = process.env.DATABASE_URL || "";
const credentialsSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  senha: z.string().min(1).max(100),
});

function getDb() {
  if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");
  return neon(DATABASE_URL);
}

export async function POST(request: Request) {
  try {
    const parsed = credentialsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Informe seu e-mail e senha cadastrados para acessar." },
        { status: 400 }
      );
    }

    const sql = getDb();
    const { email, senha } = parsed.data;
    const rateLimit = await checkRateLimit(
      sql,
      `colaboradores-login:${getClientIp(request)}:${email}`,
      8,
      15 * 60
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
        { status: 429 }
      );
    }

    const affiliates = await sql`
      SELECT id, nome, email, status_onboarding, codigo_ref, senha_hash, sessao_versao
      FROM afiliados
      WHERE LOWER(email) = ${email}
      LIMIT 1
    `;
    const affiliate = affiliates[0];

    if (!affiliate?.senha_hash || !(await bcrypt.compare(senha, affiliate.senha_hash))) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
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
          status: "Pendente",
        },
        { status: 403 }
      );
    }

    const token = await signColaboradorToken({
      id: String(affiliate.id),
      email: affiliate.email,
      nome: affiliate.nome,
      codigo_ref: affiliate.codigo_ref,
      sessao_versao: Number(affiliate.sessao_versao ?? 0),
    });
    const response = NextResponse.json(
      { ok: true, nome: affiliate.nome, codigo_ref: affiliate.codigo_ref },
      { status: 200 }
    );

    response.cookies.set("representante_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });
    response.cookies.set("colaborador_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("[representante/login] falha na autenticação:", err);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("representante_token", "", { maxAge: 0, path: "/" });
  response.cookies.set("colaborador_token", "", { maxAge: 0, path: "/" });
  return response;
}
