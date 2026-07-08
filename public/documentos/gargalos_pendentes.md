# ⚡ 2 Gargalos Restantes — Ação Manual Necessária

---

## 🔴 Gargalo 1 — `DATABASE_URL` ausente na Vercel

**Impacto:** Leads **não estão sendo salvos** no banco de dados Neon Postgres.

**Log de prova:**
```
[Neon] DATABASE_URL não configurada — pulando Neon.
```

**Como resolver:**

1. Acesse **[neon.tech](https://neon.tech)** → seu projeto → **Connection Details**
2. Copie a connection string no formato:
   ```
   postgresql://usuario:senha@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Acesse **[vercel.com](https://vercel.com)** → projeto `intitucionalnovo` → **Settings → Environment Variables**
4. Adicione:
   - **Name:** `DATABASE_URL`
   - **Value:** *(cole a connection string)*
   - **Environment:** Production + Preview
5. Clique **Save** → Vercel faz **Redeploy automático**

> [!IMPORTANT]
> Após adicionar, a tabela `leads` será criada automaticamente no primeiro formulário enviado. Sem ação adicional no banco.

---

## 🔴 Gargalo 2 — Kommo: 402 Payment Required

**Impacto:** Leads **não estão entrando no CRM** Kommo.

**Log de prova:**
```
[Kommo] Erro ao criar lead: 402 {"title":"Payment Required","status":402}
```

**O erro 402 significa uma dessas causas:**

| Causa | Como verificar |
|---|---|
| Plano Free (sem acesso à API) | Kommo → Configurações → Assinatura |
| Limite de usuários/leads do plano | Kommo → Configurações → Plano atual |
| Token com permissões insuficientes | Kommo → Integrações → Token gerado |

**Como resolver:**

**Opção A — Atualizar o plano do Kommo** *(recomendado)*
> Kommo exige plano **Professional** ou superior para acesso à API REST.
> Acessar: `titaniumconsultoriaofc.kommo.com` → Configurações → Assinatura → Upgrade

**Opção B — Usar n8n como intermediário** *(sem custo extra de plano)*
> Se o token do n8n já tem acesso (workflow v3 importado), remova o `KOMMO_ACCESS_TOKEN` da Vercel.
> O sistema cai automaticamente para o fallback via `N8N_KOMMO_WEBHOOK_URL`.
> Ação: Vercel → apagar `KOMMO_ACCESS_TOKEN` → Redeploy.

---

## ✅ Status atual do ecossistema

| Integração | Status |
|---|---|
| Meta CAPI | ✅ Funcionando (evento recebido com sucesso) |
| Google Sheets | ✅ Configurado |
| Canonical / SEO LPs | ✅ Corrigido (14 LPs) |
| Kommo CRM | 🔴 402 — aguardando plano ou fallback n8n |
| Neon DB | 🔴 DATABASE_URL ausente na Vercel |
