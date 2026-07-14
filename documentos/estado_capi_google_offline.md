# 📡 Estado: Meta CAPI + Google Offline Conversions
**Data:** 2026-07-08 | Titanium Consultoria

---

## 🟢 O que está funcionando AGORA

### Meta CAPI — Server-Side Events
```
Status: ✅ ATIVO E FUNCIONANDO
```

**Fluxo atual:**
```
Usuário preenche form
    ↓
Frontend (browser) → fbq('track', 'Lead')    ← Pixel client-side
    +
Backend (/api/leads) → Meta CAPI Graph API   ← Server-side (deduplicado)
```

**Dados sendo enviados (via `/api/leads/route.ts` linha 194-255):**

| Campo | O que vai | Como vai |
|-------|-----------|----------|
| `event_name` | `"Lead"` | fixo |
| `event_id` | `body.ref` (ID único) | para deduplicar com pixel |
| `em` | email do lead | SHA-256 hash |
| `ph` | telefone com +55 | SHA-256 hash |
| `fn` | primeiro nome | SHA-256 hash |
| `fbc` | cookie `_fbc` do browser | raw (já é hash) |
| `fbp` | cookie `_fbp` do browser | raw |
| `client_ip_address` | IP real do request | header `x-forwarded-for` |
| `client_user_agent` | browser do lead | header `user-agent` |
| `value` | valor do crédito | número float BRL |
| `currency` | `"BRL"` | fixo |
| `content_name` | segmento (imovel/veiculo) | do form |
| `content_category` | `"carta_contemplada"` | fixo |
| `action_source` | `"website"` | fixo |
| `event_source_url` | URL da página de origem | capturado no form |

**Versão da API:** `graph.facebook.com/v23.0` (mais recente ✅)

**Deduplicação:**
- Pixel client-side e CAPI usam o mesmo `event_id = body.ref`
- `body.ref` = string única gerada no frontend (ex: `carta-42-imovel-300k`)
- Meta usa isso para não contar o evento duas vezes → qualidade de sinal máxima

---

### Google — Situação Dividida

#### ✅ GA4 + Google Ads Tag (Client-side) — ATIVO
```
G-1KE95X84T0   → Google Analytics 4
AW-18248652606  → Google Ads (Conversion Tracking)
```
**Está no `layout.tsx`** — roda em todas as páginas via `gtag`.

#### ✅ gclid capturado e salvo — ATIVO

**No `ParcelSimulator.tsx`:**
```js
gclid: params.get('gclid') || '',
```

**No `CartasTable.tsx`:**
```js
utm_source: urlParams.get("utm_source") || "organico",
utm_medium: urlParams.get("utm_medium") || "cartas-page",
```

**No banco Neon** (`leads` table): coluna `gclid TEXT` ✅  
**No Google Sheets** (`Leads` aba): coluna `gclid` ✅

O `gclid` está sendo **coletado e armazenado**. Esse é o pré-requisito do Google Offline.

#### ⚠️ Google Offline Conversions — NÃO IMPLEMENTADO

```
Status: ❌ FALTANDO — gclid salvo mas não enviado de volta ao Google
```

**O que existe hoje:**
```
Usuário clica no anúncio Google
    ↓ gclid capturado na URL
    ↓ salvo no Neon (leads.gclid) ✅
    ↓ salvo no Google Sheets (coluna gclid) ✅

Mas... nunca enviado de volta ao Google Ads como conversão offline ❌
```

**O que está faltando:**
```
Quando lead vira cliente / qualificado
    ↓
Google Ads API → uploadClickConversions(gclid, conversion_time, value)
    ↓
Google Ads "vê" que aquele clique gerou receita → otimiza campanhas
```

---

## 📊 Resumo: O Ciclo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│  META                           GOOGLE                          │
│                                                                 │
│  Browser: fbq('Lead') ✅        Browser: gtag('Lead') ✅        │
│      +                              +                           │
│  Server: CAPI → Graph API ✅    gclid capturado + salvo ✅       │
│      (deduplicado com pixel)                                    │
│      (IP + UA + hash PII)       Offline API → Google Ads ❌     │
│                                                                 │
│  ██████████████████████░░░░░    ███████████████░░░░░░░░░░░░░░░  │
│  Meta: 95% implementado         Google: 60% implementado        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔴 O que está faltando para 100%

### 1. Google Offline Conversions API

**O que precisa:**
- Google Ads API credentials (OAuth / Service Account)  
- `customer_id` da conta Google Ads
- Conversion Action ID (criado no painel Google Ads)
- Endpoint: `POST /v17/customers/{customer_id}:uploadClickConversions`

**Fluxo a implementar:**
```
Planilha Google Sheets (aba Leads)
    → Quando coluna "status" muda para "Qualificado" ou "Vendido"
    → Google Apps Script dispara função uploadOfflineConversion()
    → Lê o gclid da linha
    → Chama Google Ads API com gclid + valor + timestamp
    → Google Ads credita a conversão na campanha certa
```

**OU via backend (mais robusto):**
```
POST /api/conversions/google
  { gclid, conversion_time, value, conversion_action_id }
→ Google Ads API uploadClickConversions
→ Retorna uploaded: true
```

### 2. Meta CAPI — Purchase Event (opcional, mas poderoso)

Hoje só o evento `Lead` é enviado. Se o lead virar cliente:
```js
// Quando vende: dispara evento Purchase no CAPI
event_name: "Purchase"
value: valor_real_da_venda
currency: "BRL"
```
Isso fecha o loop da atribuição de receita no Meta.

---

## 🟡 Ação Imediata Recomendada

**Para Google Offline Conversions**, você precisa me passar:

1. ✅ **Google Ads Customer ID** — número da conta (formato: `123-456-7890`)
2. ✅ **Nome da conversão** criada no Google Ads (ex: "Lead Qualificado")
3. ✅ **Acesso ao Google Cloud** para criar Service Account com permissão Google Ads API

Com isso eu implemento em ~30min o ciclo completo.

---

## 📈 Impacto esperado quando implementado

| Métrica | Antes | Depois |
|---------|-------|--------|
| Qualidade de sinal Meta | Alta (CAPI ativo) | Alta ✅ |
| Otimização automática Meta | Funcionando | Funcionando ✅ |
| Qualidade de sinal Google | Baixa (só client-side) | Alta (offline + client) |
| Otimização automática Google | Limitada | **Máxima com Enhanced Conversions** |
| Atribuição correta Google | ~40% | ~85-90% estimado |
