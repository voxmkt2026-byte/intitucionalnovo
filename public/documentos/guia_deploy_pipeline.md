# Guia de Deploy: Apps Script + n8n + .env.local

## Pré-requisito
Você precisa do acesso à conta Google que possui a planilha `1meDMu6aVxC6o08eBYu1vu0kLO7Es1BzOzHTbuzdkqkQ`.

---

## Passo 1: Deploy do Google Apps Script

### 1.1 Abrir a Planilha
1. Acesse: `https://docs.google.com/spreadsheets/d/1meDMu6aVxC6o08eBYu1vu0kLO7Es1BzOzHTbuzdkqkQ/edit`
2. Se não existir, crie uma nova planilha e copie o ID da URL

### 1.2 Abrir o Editor de Scripts
1. No menu: **Extensões → Apps Script**
2. Delete qualquer código existente no editor

### 1.3 Colar o Código
1. Cole **todo** o conteúdo do arquivo `google_apps_script.js` (já criado no brain folder)
2. O código tem 3 funções: `doPost`, `doGet`, `processData`, `writeLeads`, `writeCliques`

### 1.4 Testar Localmente
1. No editor, selecione a função `testeLeads` no dropdown
2. Clique **▶ Executar**
3. Na primeira vez, vai pedir autorização — aceite
4. Verifique na planilha se uma nova aba "Leads" foi criada com uma linha de teste

### 1.5 Publicar como Web App
1. Clique **Implantar → Nova implantação**
2. Em "Tipo", selecione **App da Web**
3. Configure:
   - **Executar como**: Eu (sua conta)
   - **Quem pode acessar**: Qualquer pessoa
4. Clique **Implantar**
5. **COPIE A URL** que aparece (formato: `https://script.google.com/macros/s/XXXXX/exec`)

### 1.6 Testar o Deploy
```bash
curl -L -X POST "SUA_URL_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"sheet":"Leads","name":"Teste Deploy","email":"teste@test.com","phone":"(11)99999-0000","segment":"imovel","credit":"100000","plan":"titanium","origin":"teste","ref":"test123"}'
```
Deve retornar `{"status":"ok"}` e criar uma nova linha na aba "Leads".

---

## Passo 2: Configurar o .env.local

Após o deploy do Apps Script, edite o arquivo:

```
C:\Users\callo\Desktop\TITANIUM NOVA-20260616T163821Z-3-001\TITANIUM NOVA\.env.local
```

Substitua os placeholders:

```env
# Meta Conversions API
META_PIXEL_ID=1667309107949808
META_ACCESS_TOKEN=EAANm3Xx... ← COLE O TOKEN REAL AQUI

# Google Ads
GOOGLE_ADS_ID=AW-18248652606
GOOGLE_ADS_CUSTOMER_ID=8875758127

# Google Apps Script Web App URL
APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXX/exec ← COLE A URL REAL AQUI

# Google Sheets
GOOGLE_SHEETS_ID=1meDMu6aVxC6o08eBYu1vu0kLO7Es1BzOzHTbuzdkqkQ
```

### Onde encontrar o Meta Access Token:
1. Acesse: `https://business.facebook.com/events_manager`
2. Selecione o Pixel `1667309107949808`
3. Configurações → API de Conversões → Gerar Token de Acesso
4. Copie o token (começa com `EAA...`)

---

## Passo 3: Importar o Workflow n8n

### 3.1 Acessar o n8n
1. Abra seu n8n Cloud ou self-hosted
2. Vá em **Workflows → Import from File**

### 3.2 Importar o JSON
1. Importe o arquivo `n8n_workflow_titanium.json` do brain folder
2. O workflow "Ciclo Infinito de Dados" será criado

### 3.3 Configurar Credenciais
1. **Google Sheets**: Configure a credencial OAuth do Google que tem acesso à planilha
2. **Meta CAPI**: O token já está embutido no nó HTTP — verifique se é o mesmo do `.env.local`
3. **Google Ads API**: Configure a credencial de OAuth do Google Ads

### 3.4 Ativar
1. Clique **Active** (toggle no canto superior direito)
2. O workflow começa a pollar a aba "Leads" a cada 5 minutos
3. Quando um status mudar para "Qualificado" ou "Vendido", ele dispara automaticamente

---

## Passo 4: Verificação End-to-End

### Teste 1: API Route Local
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste E2E","email":"teste@test.com","phone":"(11)99999-0000","segment":"imovel","credit":100000,"plan":"titanium","origin":"teste_e2e"}'
```

Verificar:
- [ ] Retorna `{"status":"ok","event_id":"..."}`
- [ ] Nova linha na aba "Leads" do Google Sheets
- [ ] Nova linha na aba "Cliques" do Google Sheets

### Teste 2: Meta Events Manager
1. Acesse: `https://business.facebook.com/events_manager`
2. Selecione o Pixel `1667309107949808`
3. Vá em **Testar eventos**
4. Verifique que o evento "Lead" aparece com:
   - Match quality > 6.0
   - Fonte: "Server" (não "Browser")
   - user_data com em, ph, fn hashados

### Teste 3: Navegação Completa
1. Abra `http://localhost:3000`
2. Preencha o simulador
3. Clique "Falar com especialista no WhatsApp"
4. Verifique:
   - [ ] WhatsApp abre normalmente
   - [ ] Lead aparece no Google Sheets
   - [ ] Evento aparece no Meta Events Manager

### Teste 4: n8n Offline Conversions
1. Na Sheets, altere o status de um lead para "Qualificado"
2. Aguarde 5 minutos (intervalo de polling)
3. Verifique:
   - [ ] Linha aparece na aba "Log CAPI"
   - [ ] Evento de conversão offline aparece no Meta Events Manager

---

## Troubleshooting

| Problema | Solução |
|---|---|
| Apps Script retorna erro 403 | Re-publique com "Qualquer pessoa" |
| CAPI retorna "Invalid OAuth token" | Regenere o token no Events Manager |
| Sheets não recebe dados | Verifique se a URL do Apps Script está correta no `.env.local` |
| n8n não dispara | Verifique se o workflow está ativo e se as credenciais Google estão válidas |
| Evento CAPI com match quality < 5 | Certifique-se que `fbc` e `fbp` estão sendo capturados (verifique cookies) |
