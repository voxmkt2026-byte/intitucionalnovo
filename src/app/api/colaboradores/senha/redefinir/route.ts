import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hashPasswordResetToken } from "@/lib/password-reset";

const DATABASE_URL = process.env.DATABASE_URL || "";
const resetSchema = z.object({
  token: z.string().min(20).max(200),
  senha: z.string()
    .min(8, "A senha deve ter ao menos 8 caracteres.")
    .max(100)
    .regex(/[A-Za-z]/, "Inclua ao menos uma letra.")
    .regex(/[0-9]/, "Inclua ao menos um número.")
    .regex(/[^A-Za-z0-9]/, "Inclua ao menos um caractere especial."),
});

export async function POST(request: Request) {
  try {
    const parsed = resetSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }
    if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");

    const sql = neon(DATABASE_URL);
    const limit = await checkRateLimit(
      sql,
      `colaboradores-redefinir:${getClientIp(request)}`,
      8,
      15 * 60
    );
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
        { status: 429 }
      );
    }

    const tokenHash = hashPasswordResetToken(parsed.data.token);
    const passwordHash = await bcrypt.hash(parsed.data.senha, 12);
    const updated = await sql`
      WITH token_consumido AS (
        UPDATE afiliados_senha_redefinicoes
        SET usado_em = NOW()
        WHERE token_hash = ${tokenHash}
          AND usado_em IS NULL
          AND expira_em > NOW()
        RETURNING afiliado_id
      )
      UPDATE afiliados
      SET senha_hash = ${passwordHash}, sessao_versao = sessao_versao + 1, atualizado_em = NOW()
      WHERE id = (SELECT afiliado_id FROM token_consumido)
      RETURNING id
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Este link é inválido, expirou ou já foi utilizado." },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Senha redefinida com sucesso." }, { status: 200 });
  } catch (error) {
    console.error("[colaboradores/senha/redefinir] falha:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
