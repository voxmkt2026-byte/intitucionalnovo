-- Aplicar somente as duas tabelas novas e seu índice.
CREATE TABLE IF NOT EXISTS prospects (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        empresa TEXT NOT NULL,
        contato_nome TEXT,
        segmento TEXT NOT NULL CHECK (segmento IN ('imovel','veiculo')),
        credito NUMERIC NOT NULL,
        prazo_meses INTEGER NOT NULL,
        plano TEXT NOT NULL DEFAULT 'titanium' CHECK (plano IN ('titanium','conforto')),
        whatsapp_consultor TEXT NOT NULL,
        consultor_nome TEXT NOT NULL DEFAULT 'Eduardo',
        expira_em TIMESTAMPTZ,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

CREATE TABLE IF NOT EXISTS prospect_events (
        id SERIAL PRIMARY KEY,
        prospect_id INTEGER NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
        tipo TEXT NOT NULL,
        payload JSONB,
        ip TEXT,
        user_agent TEXT,
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

CREATE INDEX IF NOT EXISTS prospect_events_prospect_idx ON prospect_events (prospect_id, criado_em DESC);
