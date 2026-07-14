import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn("Aviso: DATABASE_URL não configurada. Pulando migrações do banco.");
  process.exit(0);
}

const sql = neon(DATABASE_URL);

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
    await sql`
      ALTER TABLE cartas_contempladas DROP CONSTRAINT IF EXISTS chk_entrada_credito;
      ALTER TABLE cartas_contempladas ADD CONSTRAINT chk_entrada_credito CHECK (entrada < valor_credito);
      
      ALTER TABLE cartas_contempladas DROP CONSTRAINT IF EXISTS chk_valor_credito_positive;
      ALTER TABLE cartas_contempladas ADD CONSTRAINT chk_valor_credito_positive CHECK (valor_credito > 0);
      
      ALTER TABLE cartas_contempladas DROP CONSTRAINT IF EXISTS chk_valor_parcela_positive;
      ALTER TABLE cartas_contempladas ADD CONSTRAINT chk_valor_parcela_positive CHECK (valor_parcela > 0);
      
      ALTER TABLE cartas_contempladas DROP CONSTRAINT IF EXISTS chk_parcelas_positive;
      ALTER TABLE cartas_contempladas ADD CONSTRAINT chk_parcelas_positive CHECK (parcelas > 0);
    `;

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

    console.log("Migração concluída com sucesso!");
  } catch (err) {
    console.error("Erro durante a migração:", err);
    process.exit(1);
  }
}

runMigration();
