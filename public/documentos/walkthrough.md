# Walkthrough: Pipeline de Dados Titanium

## Resumo

Implementação completa do pipeline de tracking e captura de leads para o ecossistema Titanium Consultoria. Antes desta sessão, **zero dados de leads eram capturados** — tudo ia apenas para WhatsApp. Agora o pipeline completo está em código, faltando apenas 4 ações manuais para ativar.

---

## O que foi feito

### Sprint 1 — Tracking Pixels em Todas as Propriedades

#### Site Next.js (`layout.tsx`)
- ✅ **Google Ads** `AW-18248652606` — gtag.js carregado assincronamente
- ✅ **Meta Pixel** `1667309107949808` — inicialização + PageView + noscript fallback
- ✅ **UTM/Click ID Capture** — captura `fbclid`, `gclid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` em cookies para matching server-side

#### 11 LPs Estáticas
- ✅ Pixel placeholder `XXXXXXXXXX` substituído por `1667309107949808` em **todas** as 11 LPs
- ✅ `noscript` tag corrigido
- ✅ Script de captura UTM/Click ID adicionado (mesma lógica do Next.js)
- **LPs**: uber, caminhao, carro-luxo, carta-comum, carta-contemplada, embarcacao, maquinas-agricolas, placas-solares, terrenos-agricolas, terrenos-construcao, aeronaves

### Sprint 2 — API Route `/api/leads`

Criado `src/app/api/leads/route.ts` com:
- **POST** — Recebe lead, dispara em paralelo:
  1. Grava na Google Sheets (aba "Leads") via Apps Script
  2. Grava atribuição de clique (aba "Cliques") via Apps Script
  3. Dispara **Meta CAPI server-side** com dados hasheados (SHA-256)
- **GET** — Health check que reporta status de configuração
- Validação de campos obrigatórios (nome + telefone)
- Degradação graceful quando credenciais são placeholder
- `Promise.allSettled` para resiliência

Criado `.env.local` com placeholders para:
- `META_PIXEL_ID`, `META_ACCESS_TOKEN`
- `GOOGLE_ADS_ID`, `GOOGLE_ADS_CUSTOMER_ID`
- `APPS_SCRIPT_URL`
- `GOOGLE_SHEETS_ID`

### Sprint 3 — ParcelSimulator Conectado

O CTA "Falar com especialista no WhatsApp" agora:
1. **Gera um `event_id`** único (para dedup entre browser e server)
2. **Lê cookies** de atribuição (`_fbc`, `_fbp`, `gclid`, UTMs)
3. **Envia para `/api/leads`** via `fetch` com `keepalive: true` (funciona mesmo navegando)
4. **Dispara `fbq('track','Lead')`** no browser com o mesmo `event_id` (dedup)
5. **Dispara `gtag('event','conversion')`** no browser
6. **Abre WhatsApp** normalmente (comportamento inalterado para o usuário)

### Sprint 5 — Guia de Deploy

Criado `guia_deploy_pipeline.md` com passo-a-passo para:
- Deploy do Google Apps Script como Web App
- Configuração do `.env.local` com credenciais reais
- Import do workflow n8n
- Verificação end-to-end com curl

---

## Verificação

| Teste | Resultado |
|---|---|
| `npx next build` | ✅ Compilado com sucesso |
| Ocorrências de `XXXXXXXXXX` | ✅ **0** (antes: 22) |
| Ocorrências de `1667309107949808` | ✅ **24** (22 LPs + 2 Next.js) |
| Google Ads `AW-18248652606` no Next.js | ✅ **3** referências |
| API Route `/api/leads` | ✅ Aparece como `ƒ (Dynamic)` |
| `.env.local` | ✅ Criado |
| TypeScript | ✅ Zero erros |

---

## Próximos Passos (Manuais)

| Ação | Onde | Tempo |
|---|---|---|
| Deploy Google Apps Script | Google Sheets → Apps Script | ~5 min |
| Colar URL do Apps Script no `.env.local` | Arquivo local | ~1 min |
| Gerar + colar Meta Access Token | Meta Events Manager | ~5 min |
| Importar workflow n8n | n8n Cloud/self-hosted | ~3 min |
| Git commit + push | Terminal | ~2 min |

---

## Arquitetura Implementada

```
Usuário clica CTA
    │
    ├──▶ Browser: fbq('track','Lead') + gtag('conversion')
    │         ↓ (pode ser bloqueado por adblocker ~30%)
    │    Meta Pixel / Google Ads
    │
    └──▶ fetch('/api/leads', keepalive)
              ↓ (server-side, 100% reliability)
         Next.js API Route
              │
              ├──▶ Google Sheets (Apps Script)  → Aba "Leads" + "Cliques"
              │
              └──▶ Meta CAPI (server-to-server) → Evento "Lead" com dedup
                        │
                        └──▶ Dedup por event_id com pixel browser
    
    [Depois, assíncrono via n8n]
    Equipe comercial marca "Qualificado" ou "Vendido" no Sheets
         ↓
    n8n poll (5min) → Meta CAPI "Lead"/"Purchase" + Google Offline Conversions
```

## Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| [layout.tsx](file:///C:/Users/callo/Desktop/TITANIUM%20NOVA-20260616T163821Z-3-001/TITANIUM%20NOVA/src/app/layout.tsx) | + Google Ads, Meta Pixel, UTM capture |
| [ParcelSimulator.tsx](file:///C:/Users/callo/Desktop/TITANIUM%20NOVA-20260616T163821Z-3-001/TITANIUM%20NOVA/src/components/ParcelSimulator.tsx) | + onClick → /api/leads + fbq + gtag |
| [route.ts](file:///C:/Users/callo/Desktop/TITANIUM%20NOVA-20260616T163821Z-3-001/TITANIUM%20NOVA/src/app/api/leads/route.ts) | **NOVO** — API Route com CAPI + Sheets |
| [.env.local](file:///C:/Users/callo/Desktop/TITANIUM%20NOVA-20260616T163821Z-3-001/TITANIUM%20NOVA/.env.local) | **NOVO** — Credenciais (placeholders) |
| 11× `index.html` | Pixel ID real + UTM script |
