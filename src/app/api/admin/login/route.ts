import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { signAdminToken } from "@/lib/admin-auth";

const DATABASE_URL = process.env.DATABASE_URL || "";

function getDb() {
  if (!DATABASE_URL) throw new Error("DATABASE_URL not configured");
  return neon(DATABASE_URL);
}

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const sql = getDb();
    const users = await sql`
      SELECT id, email, nome, senha_hash
      FROM admin_users
      WHERE email = ${email.toLowerCase().trim()}
      LIMIT 1
    `;

    const user = users[0];
    if (!user) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(senha, user.senha_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    // Generate JWT via unified helper
    const token = await signAdminToken({
      id: String(user.id),
      email: user.email,
      nome: user.nome || "Admin",
    });

    const response = NextResponse.json(
      { ok: true, nome: user.nome || "Admin" },
      { status: 200 }
    );

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict", // CSRF protection: strict
      maxAge:   8 * 60 * 60, // 8h
      path:     "/",
    });

    return response;
  } catch (err) {
    console.error("[admin/login] falha na autenticação"); // sem stack trace
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("admin_token");
  return response;
}
