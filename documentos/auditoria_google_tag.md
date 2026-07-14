# 🔍 Auditoria Google Tag — Ecossistema Titanium

> Executada em: 2026-06-24 | Escopo: Site institucional + 14 LPs + API /leads

---

## Resumo Executivo

| # | Severidade | Problema | Impacto |
|---|---|---|---|
| 1 | 🔴 CRÍTICO | GA4 ausente em todas as 14 LPs | Google Analytics não recebe nenhuma sessão das LPs |
| 2 | 🔴 CRÍTICO | SHEETS_WEBHOOK_URL pode estar quebrada | Leads do formulário institucional não estão sendo salvos |
| 3 | 🟡 ALTO | Script gtag carregado com ID errado no institucional | GA4 pode perder sessões em condições de race condition |
| 4 | 🟡 ALTO | LPs não rastreiam eventos GA4 (só Google Ads) | Sem audiências GA4, sem atribuição GA4, sem remarketing |

---

## Falha #1 — GA4 AUSENTE EM TODAS AS LPs 🔴

**Arquivo:** Todas as 14 LPs em `/titanium-lps-v6/*/index.html`

**O que foi encontrado:**
```
aeronaves: GA4 AUSENTE
caminhao: GA4 AUSENTE
carro-luxo: GA4 AUSENTE
carta-comum: GA4 AUSENTE
carta-contemplada: GA4 AUSENTE
corretor: GA4 AUSENTE
embarcacao: GA4 AUSENTE
empresario: GA4 AUSENTE
maquinas-agricolas: GA4 AUSENTE
medico: GA4 AUSENTE
placas-solares: GA4 AUSENTE
terrenos-agricolas: GA4 AUSENTE
terrenos-construcao: GA4 AUSENTE
uber: GA4 AUSENTE
```

**O que existe nas LPs:** Apenas Google Ads `AW-18248652606` (para rastrear cliques no WhatsApp).

**O que está faltando:** GA4 `G-1KE95X84T0`

**Impacto real para a gestora:**
- Google Analytics 4 mostra **zero sessões vindas das LPs**
- Impossível criar audiências de remarketing baseadas em comportamento
- Sem dados de qualidade de tráfego por LP
- Atribuição de conversões fica incorreta (Google Ads não consegue otimizar)

**Correção:** Adicionar o snippet GA4 em todas as 14 LPs:
```html
<!-- Adicionar no <head> de todas as LPs -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1KE95X84T0"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-1KE95X84T0');
  gtag('config', 'AW-18248652606');
</script>
```

---

## Falha #2 — SHEETS_WEBHOOK_URL POSSIVELMENTE QUEBRADA 🔴

**Arquivo:** [`route.ts`](file:///C:/Users/callo/.gemini/antigravity/scratch/intitucionalnovo/src/app/api/leads/route.ts) — linha 33

**Código problemático:**
```typescript
if (!SHEETS_WEBHOOK_URL) {
  throw new Error("SHEETS_WEBHOOK_URL environment variable is required");
}
```

**Problema:** Se o Google Apps Script que recebia os leads estava na **conta Google bloqueada**, a URL do webhook está morta. Isso significa que **toda chamada para `/api/leads` falha em runtime**, e os leads do formulário institucional **não estão sendo salvos nem enviados para Meta CAPI**.

**Como verificar agora:**
```bash
# No terminal do projeto:
curl -X GET https://titaniumconsultoria.com.br/api/leads
# Resposta esperada: { "status": "ok", "sheets": "configured", ... }
# Se retornar 500 → SHEETS_WEBHOOK_URL está quebrada
```

**Correção:** Migrar para Neon Postgres como storage primário e remover dependência do Google Sheets.

---

## Falha #3 — SCRIPT GTAG COM ID ERRADO NO INSTITUCIONAL 🟡

**Arquivo:** [`layout.tsx`](file:///C:/Users/callo/.gemini/antigravity/scratch/intitucionalnovo/src/app/layout.tsx) — linha 146

**Código atual:**
```html
<Script src="https://www.googletagmanager.com/gtag/js?id=AW-18248652606" />
```

**Problema:** O script é carregado com o ID do Google Ads (`AW-`). O GA4 (`G-`) deve ser o ID principal no parâmetro `?id=`. Embora o Google carregue ambos via `gtag('config')`, o `?id=` define qual propriedade inicializa primeiro e pode afetar a coleta de dados em conexões lentas.

**Correção:**
```html
<Script src="https://www.googletagmanager.com/gtag/js?id=G-1KE95X84T0" />
```

---

## Falha #4 — SEM RASTREAMENTO DE EVENTOS GA4 NAS LPs 🟡

**Problema:** Os CTAs das LPs disparam `gtag('event', 'conversion', ...)` apenas para o Google Ads. Nenhum evento GA4 é enviado quando o usuário clica no WhatsApp.

**Código atual nos CTAs:**
```javascript
onclick="try{
  gtag('event','conversion',{'send_to':'AW-18248652606/kTjGCO35_r0cELK2ivND'});
  fbq('track','Contact');
}catch(e){}"
```

**O que falta:**
```javascript
onclick="try{
  gtag('event','conversion',{'send_to':'AW-18248652606/kTjGCO35_r0cELK2ivND'});
  gtag('event','generate_lead',{'event_category':'whatsapp','event_label': 'lp_nome'});
  fbq('track','Contact');
}catch(e){}"
```

---

## Plano de Correção por Prioridade

### 🔴 Imediato (hoje)

1. **Verificar se `/api/leads` está funcionando** via curl ou browser
2. **Se quebrado:** atualizar `SHEETS_WEBHOOK_URL` na Vercel com nova URL (ou migrar para Neon)
3. **Adicionar GA4 em todas as 14 LPs** via script no `<head>`

### 🟡 Esta semana

4. Corrigir o `?id=` do script gtag no institucional para `G-1KE95X84T0`
5. Adicionar evento `generate_lead` nos CTAs das LPs para GA4

### 🟢 Próxima semana

6. Implementar Google Tag Manager (GTM) para gerenciar todas as tags de um único lugar
7. Criar audiências de remarketing no GA4 baseadas em comportamento nas LPs

---

## IDs identificados no ecossistema

| Tag | ID | Onde está |
|---|---|---|
| Google Ads | `AW-18248652606` | Todas as LPs + Institucional ✅ |
| Google Ads Conversão | `AW-18248652606/kTjGCO35_r0cELK2ivND` | Todas as LPs ✅ |
| GA4 | `G-1KE95X84T0` | **Só no institucional** ❌ |
| Meta Pixel | `1667309107949808` | Só no institucional ❌ |

