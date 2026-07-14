/**
 * Seed script: cria o usuário admin inicial no Neon.
 * Uso: npx tsx scripts/seed-admin.ts
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL não configurado no .env.local");
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_SENHA = process.env.ADMIN_SENHA;
const ADMIN_NOME  = process.env.ADMIN_NOME  || "Consultor Titanium";

if (!ADMIN_EMAIL || !ADMIN_SENHA) {
  console.error("❌  ADMIN_EMAIL e ADMIN_SENHA são obrigatórios e devem estar configurados no .env.local!");
  process.exit(1);
}

async function seed() {
  const sql = neon(DATABASE_URL!);

  // Cria tabela se necessário
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id         SERIAL PRIMARY KEY,
      email      TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      nome       TEXT,
      criado_em  TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Checa se admin já existe
  const existing = await sql`SELECT id FROM admin_users WHERE email = ${ADMIN_EMAIL}`;
  if (existing.length > 0) {
    console.log(`ℹ️  Admin já existe: ${ADMIN_EMAIL}`);
    process.exit(0);
  }

  const senhaHash = await bcrypt.hash(ADMIN_SENHA, 10);
  await sql`
    INSERT INTO admin_users (email, senha_hash, nome)
    VALUES (${ADMIN_EMAIL}, ${senhaHash}, ${ADMIN_NOME})
  `;

  console.log("✅  Admin criado com sucesso!");
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log("   Senha: [CONFIGURADA NO AMBIENTE]");
  console.log("\n⚠️  Altere a senha após o primeiro acesso!");
}

seed().catch((e) => { console.error("❌ Erro:", e); process.exit(1); });
