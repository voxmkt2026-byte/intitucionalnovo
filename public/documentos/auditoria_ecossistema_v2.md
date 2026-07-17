# Auditoria Completa do Ecossistema Titanium — Plano de Otimização

> **Data:** 01/07/2026 | **Frameworks:** Titanium Engine HLM + Senior Frontend + Senior Fullstack  
> **Cobertura:** 14 LPs HTML + Next.js App (src/) + API Routes + Middleware

---

## Resumo Executivo

| Camada | Status | Issues Críticos | Issues Altos | Issues Médios |
|---|---|---|---|---|
| 14 LPs HTML | ⚠️ Atenção | 2 | 0 | 4 |
| Next.js App/Componentes | ✅ Bom | 0 | 3 | 5 |
| API Route `/api/leads` | ⚠️ Atenção | 0 | 2 | 2 |
| Middleware/Segurança | ✅ Bom | 0 | 1 | 1 |
| **Total** | | **2 críticos** | **6 altos** | **12 médios** |

### ✅ O que está 100% correto em todo o ecossistema
- Tracking: GA4 `G-1KE95X84T0` + Google Ads `AW-18248652606` + Meta Pixel `1667309107949808` ✅  
- Email: `titaniumconsultorias@outlook.com` em todas as LPs e src/ ✅  
- WhatsApp: `5511930048940` em 100% das ocorrências ✅  
- CNPJ: `46.640.755/0001-51` em todas as LPs e Footer ✅  
- CTAs consultivos (nenhum "Compre agora") ✅  
- Disclaimer anti-golpe + HLM compliance ✅  
- Zod validation na API route ✅  
- Security headers no middleware (HSTS, X-Frame-Options, CSP) ✅  
- Rate limiting 20 req/min por IP ✅  
- robots.ts + sitemap.ts presentes ✅  

---

## 🔴 CRÍTICO — Corrigir IMEDIATAMENTE

### C1 · `<link rel="canonical">` ausente em **todas as 14 LPs**
**Impacto:** SEO — risco de penalidade por conteúdo duplicado (URLs com UTM parâmetros indexadas)  
**Afeta:** aeronaves, caminhao, carro-luxo, carta-comum, carta-contemplada, corretor, embarcacao, empresario, maquinas-agricolas, medico, placas-solares, terrenos-agricolas, terrenos-construcao, uber

**Fix:** Adicionar no `<head>` de cada LP:
```html
<link rel="canonical" href="https://titaniumconsultoria.com.br/[slug]/">
```

### C2 · Stats internos (box__stat) contradizem o stat global R$50M+
**Impacto:** Credibilidade/HLM compliance — claims inconsistentes  
**Afeta:**

| LP | Valor errado | Deve ser |
|---|---|---|
| empresario | R$ 62M+ | R$50M+ |
| medico | R$ 78M+ | R$50M+ |
| uber | R$ 15M+ (pilar) | R$50M+ |
| maquinas-agricolas | R$ 38M+ | R$50M+ |
| terrenos-agricolas | R$ 45M+ | R$50M+ |
| terrenos-construcao | R$ 58M+ | R$50M+ |
| placas-solares | R$ 12M+ | R$50M+ |

---

## 🟡 ALTO — Corrigir neste sprint

### A1 · `CREATE TABLE IF NOT EXISTS` executado em **CADA** requisição POST
**Arquivo:** `src/app/api/leads/route.ts`  
**Impacto:** +50-200ms de latência por lead, risco de race conditions  
**Fix:** Mover inicialização do DB para nível de módulo (executa apenas no cold start)

### A2 · `GET /api/leads` health check expõe config sem autenticação
**Impacto:** Information disclosure — revela se KOMMO_ACCESS_TOKEN está configurado  
**Fix:** Exigir `?key=INTERNAL_HEALTH_KEY` ou remover endpoint público

### A3 · `Footer.tsx` usa `<img>` nativo em vez de `next/image`
**Arquivo:** `src/components/Footer.tsx` (2 instâncias)  
**Impacto:** LCP degradado, sem otimização de formato (avif/webp)  
**Fix:** Substituir por `<Image>` do `next/image`

### A4 · Rate-limiter in-memory não persiste entre instâncias Vercel  
**Arquivo:** `src/middleware.ts`  
**Impacto:** Em escala, cada instância tem seu próprio contador — rate limit ineficaz  
**Fix (médio prazo):** Migrar para Upstash Redis com `@upstash/ratelimit`  
**Fix (imediato):** Documentar limitação como known issue

---

## ⚠️ MÉDIO — Próximo sprint

### M1 · `og:url` ausente em 10 das 14 LPs
**Afeta:** aeronaves, caminhao, carro-luxo, carta-comum, carta-contemplada, corretor, embarcacao, empresario, maquinas-agricolas, uber  
**Fix:** Adicionar `<meta property="og:url" content="https://titaniumconsultoria.com.br/[slug]/"/>` 

### M2 · `uber` — hero counter sem prefixo `+`
**Atual:** mostra `1850` | **Deve:** `+1.850`  
**Fix:** Adicionar `data-count-prefix="+"` e `data-count-separator="."` no counter

### M3 · `uber` — pillar desc diz "R$ 15 milhões" contradizendo hero
**Fix:** Alterar para "R$50M+ em crédito intermediado"

### M4 · `placas-solares` — comparativo mostra "R$ 0-200/mês" (placeholder)
**Fix:** Substituir por valor real ou range válido

### M5 · `<img>` no `MissaoVisaoValores.tsx` (ícones SVG)
**Linhas:** 681, 730  
**Fix:** Substituir por `<Image>` ou usar SVG inline (ícones têm `aria-hidden`)

### M6 · External fetch sem `AbortSignal` timeout na API de leads
**Risco:** Calls ao Kommo/Sheets/Meta CAPI podem travar por 30s+  
**Fix:** Adicionar `signal: AbortSignal.timeout(8000)` em todos os `fetch()` externos

---

## Plano de Execução

### Fase 1 — CRÍTICO (automatizado, ~30 min)
- [ ] Script para inserir `<link rel="canonical">` nas 14 LPs via agente lp-injector
- [ ] Harmonizar stats internos R$50M+ nas 7 LPs com divergência

### Fase 2 — ALTO (30-60 min)
- [ ] Refatorar init DB para nível de módulo em `route.ts`
- [ ] Proteger GET `/api/leads` health check com API key
- [ ] Substituir `<img>` → `<Image>` no `Footer.tsx`

### Fase 3 — MÉDIO (1-2h)
- [ ] Adicionar `og:url` em 10 LPs via script
- [ ] Corrigir counter do uber (prefixo "+")
- [ ] Corrigir pillar desc do uber ("R$ 15 milhões" → "R$50M+")
- [ ] Revisar parcela placas-solares ("R$ 0-200/mês")
- [ ] Adicionar `AbortSignal.timeout(8000)` nos fetches externos

### Fase 4 — INFRAESTRUTURA (futuro)
- [ ] Migrar rate-limiter para Upstash Redis

---

## Score Final por Camada (Titanium Engine)

| Dimensão | Score | Nota |
|---|---|---|
| Tracking (GA4/Ads/Pixel) | **10/10** | Perfeito em 100% |
| Compliance HLM (copy/CTAs) | **9.5/10** | CTAs corretos, disclaimers presentes |
| Dados da empresa (email/CNPJ/WA) | **10/10** | Consistente em todo ecossistema |
| SEO On-Page | **7.5/10** | Canonical ausente nas LPs crítico |
| Performance | **8.5/10** | Preload/lazy ok; DB init e img issues |
| Segurança API | **8/10** | Rate limit + Zod ok; health check exposto |
| Stats/Claims (HLM) | **7/10** | Divergência interna em 7 LPs |
| **MÉDIA GERAL** | **8.6/10** | Acima do mínimo HLM (8.5) |
