import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  createPasswordResetToken,
  PASSWORD_RESET_TTL_MINUTES,
  sendPasswordResetEmail,
} from "@/lib/password-reset";

const DATABASE_URL = process.env.DATABASE_URL || "";
const requestSchema = z.object({ email: z.email().trim().toLowerCase() });
const GENERIC_MESSAGE = "Se o e-mail estiver cadastrado, você receberá as instruções em alguns minutos.";

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }
    if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");

    const sql = neon(DATABASE_URL);
    const { email } = parsed.data;
    const limit = await checkRateLimit(
      sql,
      `colaboradores-senha:${getClientIp(request)}:${email}`,
      3,
      60 * 60
    );
    if (!limit.allowed) {
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
    }

    const rows = await sql`
      SELECT id, email FROM afiliados
      WHERE LOWER(email) = ${email}
      LIMIT 1
    `;
    const affiliate = rows[0];
    if (!affiliate) {
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
    }

    const { token, tokenHash } = createPasswordResetToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
    await sql`
      UPDATE afiliados_senha_redefinicoes
      SET usado_em = NOW()
      WHERE afiliado_id = ${affiliate.id} AND usado_em IS NULL
    `;
    await sql`
      INSERT INTO afiliados_senha_redefinicoes (afiliado_id, token_hash, expira_em)
      VALUES (${affiliate.id}, ${tokenHash}, ${expiresAt.toISOString()})
    `;

    try {
      await sendPasswordResetEmail(affiliate.email, token);
    } catch (error) {
      await sql`DELETE FROM afiliados_senha_redefinicoes WHERE token_hash = ${tokenHash}`;
      throw error;
    }

    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  } catch (error) {
    console.error("[colaboradores/senha/solicitar] falha:", error);
    return NextResponse.json(
      { error: "A recuperação por e-mail está temporariamente indisponível." },
      { status: 503 }
    );
  }
}
