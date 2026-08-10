import { neon } from "@neondatabase/serverless";

import fs from "fs";
import path from "path";
import crypto from "crypto";

let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const match = envContent.match(/DATABASE_URL=["']?([^"'\s]+)["']?/);
      if (match) {
        DATABASE_URL = match[1];
      }
    }
  } catch (e) {
    console.error("Erro ao carregar .env.local:", e);
  }
}

if (!DATABASE_URL) {
  console.warn("Aviso: DATABASE_URL não configurada. Pulando migrações do banco.");
  process.exit(0);
}

const sql = neon(DATABASE_URL);

// --- Encryption helpers (must mirror src/lib/crypto.ts) ---
const ENC_ALGORITHM = "aes-256-gcm";
const ENC_VERSION_PREFIX = "v1:";

function getEncryptionKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptFieldValue(plaintext, key) {
  if (!plaintext) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENC_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${ENC_VERSION_PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

async function runMigration() {
  console.log("Iniciando migração do banco de dados Neon...");

  try {
    // 1. Criar Tabela leads
    console.log("Criando tabela 'leads'...");
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        segment TEXT,
        credit TEXT,
        months INTEGER,
        plan TEXT,
        origin TEXT,
        ref TEXT,
        fbc TEXT,
        fbp TEXT,
        gclid TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        utm_content TEXT,
        utm_term TEXT,
        lp TEXT,
        source_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        status TEXT DEFAULT 'Novo',
        notes TEXT DEFAULT '',
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        revenue NUMERIC
      )
    `;

    // 2. Adicionar colunas caso a tabela leads já existisse sem elas (idempotência)
    console.log("Garantindo colunas na tabela 'leads'...");
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Novo'`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT ''`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS revenue NUMERIC`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_term TEXT`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS client_ip TEXT`;

    // 3. Criar Tabela lead_clicks
    console.log("Criando tabela 'lead_clicks'...");
    await sql`
      CREATE TABLE IF NOT EXISTS lead_clicks (
        id SERIAL PRIMARY KEY,
        ref TEXT,
        fbc TEXT,
        fbp TEXT,
        gclid TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        utm_content TEXT,
        utm_term TEXT,
        lp TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`ALTER TABLE lead_clicks ADD COLUMN IF NOT EXISTS utm_term TEXT`;

    // 4. Criar Tabela lead_events
    console.log("Criando tabela 'lead_events'...");
    await sql`
      CREATE TABLE IF NOT EXISTS lead_events (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER,
        tipo TEXT,
        valor TEXT,
        criado_em TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // 5. Criar Tabela admin_users
    console.log("Criando tabela 'admin_users'...");
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        nome TEXT,
        criado_em TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // 6. Criar Tabela cartas_contempladas
    console.log("Criando tabela 'cartas_contempladas'...");
    await sql`
      CREATE TABLE IF NOT EXISTS cartas_contempladas (
        id SERIAL PRIMARY KEY,
        segmento TEXT NOT NULL,
        valor_credito NUMERIC NOT NULL,
        entrada NUMERIC NOT NULL,
        parcelas INTEGER NOT NULL,
        valor_parcela NUMERIC NOT NULL,
        administradora TEXT NOT NULL,
        proximo_vencimento DATE,
        disponivel BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMPTZ DEFAULT NOW(),
        atualizado_em TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    console.log("Garantindo colunas na tabela 'cartas_contempladas'...");
    await sql`ALTER TABLE cartas_contempladas ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT NOW()`;



    console.log("Garantindo constraints na tabela 'cartas_contempladas'...");
    try { await sql`ALTER TABLE cartas_contempladas DROP CONSTRAINT IF EXISTS chk_entrada_credito`; } catch(e) {}
    try { await sql`ALTER TABLE cartas_contempladas ADD CONSTRAINT chk_entrada_credito CHECK (entrada < valor_credito)`; } catch(e) {}
    try { await sql`ALTER TABLE cartas_contempladas DROP CONSTRAINT IF EXISTS chk_valor_credito_positive`; } catch(e) {}
    try { await sql`ALTER TABLE cartas_contempladas ADD CONSTRAINT chk_valor_credito_positive CHECK (valor_credito > 0)`; } catch(e) {}
    try { await sql`ALTER TABLE cartas_contempladas DROP CONSTRAINT IF EXISTS chk_valor_parcela_positive`; } catch(e) {}
    try { await sql`ALTER TABLE cartas_contempladas ADD CONSTRAINT chk_valor_parcela_positive CHECK (valor_parcela > 0)`; } catch(e) {}
    try { await sql`ALTER TABLE cartas_contempladas DROP CONSTRAINT IF EXISTS chk_parcelas_positive`; } catch(e) {}
    try { await sql`ALTER TABLE cartas_contempladas ADD CONSTRAINT chk_parcelas_positive CHECK (parcelas > 0)`; } catch(e) {}
    console.log("Limpando registros inválidos da tabela 'cartas_contempladas'...");
    await sql`
      DELETE FROM cartas_contempladas 
      WHERE valor_credito < 1000 
         OR (proximo_vencimento IS NOT NULL AND proximo_vencimento > '2100-01-01')
    `;

    // 7. Criar índices de performance
    console.log("Criando índices de performance...");
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_utm_campaign ON leads(utm_campaign)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`;

    // 8. Criar Tabela afiliados
    console.log("Criando tabela 'afiliados'...");
    await sql`
      CREATE TABLE IF NOT EXISTS afiliados (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        documento_cpf_cnpj TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefone TEXT,
        cidade TEXT,
        redes_sociais TEXT,
        cpf TEXT,
        cnpj TEXT,
        data_nascimento TEXT,
        rg TEXT,
        endereco_completo TEXT,
        banco TEXT,
        tipo_conta TEXT,
        agencia TEXT,
        conta TEXT,
        operacao TEXT,
        titular_nome TEXT,
        principal_produto TEXT,
        trabalha_carta_contemplada TEXT,
        principal_publico TEXT,
        quantidade_indicacoes TEXT,
        quer_atuar_como TEXT,
        aceita_receber_contatos BOOLEAN DEFAULT FALSE,
        status_onboarding TEXT DEFAULT 'Pendente',
        codigo_ref TEXT UNIQUE NOT NULL,
        vende_consorcio BOOLEAN DEFAULT FALSE,
        experiencia_administradoras TEXT,
        experiencia_volume TEXT,
        experiencia_segmentos TEXT,
        base_tamanho TEXT,
        base_canais TEXT,
        base_ticket_medio TEXT,
        aceite_playbook BOOLEAN DEFAULT FALSE,
        ip_assinatura TEXT,
        assinado_em TIMESTAMPTZ,
        criado_em TIMESTAMPTZ DEFAULT NOW(),
        atualizado_em TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    console.log("Garantindo colunas oficiais de cadastro na tabela 'afiliados'...");
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS cpf TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS cnpj TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS data_nascimento TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS rg TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS endereco_completo TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS banco TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS tipo_conta TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS agencia TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS conta TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS operacao TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS titular_nome TEXT`;

    console.log("Garantindo colunas de informações comerciais adicionais na tabela 'afiliados'...");
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS principal_produto TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS trabalha_carta_contemplada TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS principal_publico TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS quantidade_indicacoes TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS quer_atuar_como TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS aceita_receber_contatos BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS quantidade_colaboradores TEXT`;
    await sql`ALTER TABLE afiliados ADD COLUMN IF NOT EXISTS senha_hash TEXT`;

    // 9. Criar Tabela afiliados_planilhas
    console.log("Criando tabela 'afiliados_planilhas'...");
    await sql`
      CREATE TABLE IF NOT EXISTS afiliados_planilhas (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        linhas_processadas INTEGER DEFAULT 0,
        status TEXT DEFAULT 'processando',
        erro_mensagem TEXT,
        uploaded_by TEXT,
        criado_em TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // 10. Criar Tabela afiliados_comissoes
    console.log("Criando tabela 'afiliados_comissoes'...");
    await sql`
      CREATE TABLE IF NOT EXISTS afiliados_comissoes (
        id SERIAL PRIMARY KEY,
        afiliado_id INTEGER REFERENCES afiliados(id) ON DELETE CASCADE,
        planilha_id INTEGER REFERENCES afiliados_planilhas(id) ON DELETE SET NULL,
        cliente_nome TEXT NOT NULL,
        valor_credito NUMERIC NOT NULL,
        comissao_valor NUMERIC NOT NULL,
        status_pagamento TEXT DEFAULT 'a_pagar',
        data_fechamento TIMESTAMPTZ,
        criado_em TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Criar índices para afiliados e comissões
    console.log("Criando índices de performance para afiliados...");
    await sql`CREATE INDEX IF NOT EXISTS idx_afiliados_codigo_ref ON afiliados(codigo_ref)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_afiliados_comissoes_afiliado_id ON afiliados_comissoes(afiliado_id)`;

    // 11. Criar Tabela rate_limits (rate limiting de rotas públicas, ex: cadastro de afiliados)
    console.log("Criando tabela 'rate_limits'...");
    await sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        rate_key TEXT NOT NULL,
        criado_em TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_rate_limits_key_criado_em ON rate_limits(rate_key, criado_em)`;

    // Limpar entradas antigas (janela máxima usada no app é de algumas horas)
    await sql`DELETE FROM rate_limits WHERE criado_em < NOW() - INTERVAL '1 day'`;

    // 12. Criptografar em repouso os campos sensíveis de 'afiliados' já existentes (idempotente)
    const encryptionKey = getEncryptionKey();
    if (!encryptionKey) {
      console.warn("Aviso: JWT_SECRET não configurada. Pulando criptografia de dados sensíveis de afiliados.");
    } else {
      console.log("Verificando criptografia de campos sensíveis em 'afiliados'...");
      const sensitiveColumns = ["cpf", "cnpj", "rg", "agencia", "conta", "chave_pix"];
      const pendingRows = await sql`
        SELECT id, cpf, cnpj, rg, agencia, conta, chave_pix FROM afiliados
      `;

      let encryptedCount = 0;
      for (const row of pendingRows) {
        const updates = {};
        for (const col of sensitiveColumns) {
          const value = row[col];
          if (value && !String(value).startsWith(ENC_VERSION_PREFIX)) {
            updates[col] = encryptFieldValue(String(value), encryptionKey);
          }
        }
        if (Object.keys(updates).length > 0) {
          await sql`
            UPDATE afiliados SET
              cpf = ${updates.cpf ?? row.cpf},
              cnpj = ${updates.cnpj ?? row.cnpj},
              rg = ${updates.rg ?? row.rg},
              agencia = ${updates.agencia ?? row.agencia},
              conta = ${updates.conta ?? row.conta},
              chave_pix = ${updates.chave_pix ?? row.chave_pix}
            WHERE id = ${row.id}
          `;
          encryptedCount++;
        }
      }
      if (encryptedCount > 0) {
        console.log(`Criptografados ${encryptedCount} registro(s) de afiliados com dados sensíveis em texto claro.`);
      } else {
        console.log("Nenhum registro pendente de criptografia em 'afiliados'.");
      }
    }

    console.log("Migração concluída com sucesso!");
  } catch (err) {
    console.error("Erro durante a migração:", err);
    process.exit(1);
  }
}

runMigration();
