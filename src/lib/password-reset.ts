import { createHash, randomBytes } from "crypto";

export const PASSWORD_RESET_TTL_MINUTES = 30;

export function createPasswordResetToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashPasswordResetToken(token) };
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PASSWORD_RESET_EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error("Password reset email provider is not configured");
  }

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.titaniumconsultorias.com.br").replace(/\/$/, "");
  const resetUrl = `${baseUrl}/colaboradores/redefinir-senha?token=${encodeURIComponent(token)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Redefinição de senha — Portal Titanium",
      html: `
        <div style="font-family:Arial,sans-serif;color:#172033;line-height:1.6">
          <h2>Redefinição de senha</h2>
          <p>Recebemos uma solicitação para redefinir a senha do Portal do Colaborador.</p>
          <p><a href="${resetUrl}" style="display:inline-block;background:#0A7B3E;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Criar nova senha</a></p>
          <p>Este link expira em ${PASSWORD_RESET_TTL_MINUTES} minutos e só pode ser usado uma vez.</p>
          <p>Se você não fez esta solicitação, ignore este e-mail.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Password reset email failed with status ${response.status}`);
  }
}
