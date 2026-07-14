# 🔍 Re-Auditoria — Ecossistema Titanium Consultoria

> Auditoria pós-correções · 22/06/2026 · Comparação com diagnóstico de 19/06

---

## 📊 Evolução Geral

```
┌──────────────────────────────────────────────┐
│         ANTES (19/06)  →  DEPOIS (22/06)     │
├──────────────────────────────────────────────┤
│ Nota geral:   6.5/10  →  8.5/10  ▲ +2.0     │
│ Segurança:    4.0/10  →  8.5/10  ▲ +4.5     │
│ Performance:  5.0/10  →  7.0/10  ▲ +2.0     │
│ SEO:          8.0/10  →  8.5/10  ▲ +0.5     │
│ Tracking:     9.0/10  →  9.5/10  ▲ +0.5     │
│ Código:       6.0/10  →  7.5/10  ▲ +1.5     │
└──────────────────────────────────────────────┘
```

---

## ✅ Problemas Resolvidos (14/18)

### Segurança (Sprint 1)
| # | Problema | Status |
|---|----------|--------|
| 1 | Webhook URL hardcoded no código | ✅ **RESOLVIDO** — Movido para `.env.local` |
| 2 | Sem validação de dados na API | ✅ **RESOLVIDO** — Zod com 17 campos + max-length |
| 3 | PII enviado via GET (query string) | ✅ **RESOLVIDO** — Trocado para POST com JSON body |
| 4 | Erros internos expostos ao client | ✅ **RESOLVIDO** — Mensagens genéricas |
| 5 | `NEXT_PUBLIC_SHEETS_WEBHOOK` exposta | ✅ **RESOLVIDO** — Variável removida |
| 6 | Rate limiting no `/api/leads` | ✅ **RESOLVIDO** — `proxy.ts` com 10 req/min/IP |
| 7 | Apps Script só aceitava GET | ✅ **RESOLVIDO** — `doPost` adicionado |

### Bugs de Conteúdo (Sprint 2)
| # | Problema | Status |
|---|----------|--------|
| 8 | og:image errado no corretor | ✅ **RESOLVIDO** |
| 9 | og:image errado no médico | ✅ **RESOLVIDO** |
| 10 | Dependência morta `animejs` | ✅ **RESOLVIDO** — Removida |
| 11 | 5 SVGs órfãos do Next.js | ✅ **RESOLVIDO** — Deletados |

### Performance (Sprint 3)
| # | Problema | Status |
|---|----------|--------|
| 12 | Analytics com `dangerouslySetInnerHTML` | ✅ **RESOLVIDO** — Migrado para `next/script afterInteractive` |
| 13 | Sem Error Boundaries nos WebGL | ✅ **RESOLVIDO** — `WebGLErrorBoundary` em 3 componentes |
| 14 | Sem página 404 | ✅ **RESOLVIDO** — `not-found.tsx` criado |

---

## ⚠️ Itens Pendentes (Sprint 4 — Manutenibilidade)

| # | Item | Impacto | Esforço |
|---|------|---------|---------|
| 1 | **CSS duplicado em 14 LPs** — Cada LP tem cópia local de `style.css` (14 × 29KB = 406KB redundante) | 🟡 Médio | 30 min |
| 2 | **Fontes inconsistentes** — 9 LPs usam Fraunces+Inter, 5 usam Plus Jakarta Sans | 🟡 Médio | 20 min |
| 3 | **Lógica duplicada** `tracking.js` ↔ `dream-form.js` — Ambos têm `captureIdentifiers()` | 🟡 Médio | 1h |
| 4 | **Arquivos órfãos restantes** — `shared/icons/`, `shared/steps/` (vazias), `shared/logo-tc.svg` | 🟢 Baixo | 5 min |

---

## ℹ️ Observações Técnicas (Aceitáveis)

| Item | Status | Nota |
|------|--------|------|
| 3 bibliotecas WebGL (three.js + ogl + gl-matrix) | ℹ️ Aceitável | Cada uma usada por um componente diferente. Todas com `dynamic import` + `ssr: false`. Não são dead code. |
| `@ts-nocheck` no CircularGallery | ℹ️ Baixo risco | WebGL raw com shaders GLSL. TypeScript não tem tipos para esse código. |
| `cn()` sem `tailwind-merge` | ℹ️ Baixo risco | Funciona para o projeto atual. Relevante só se houver conflitos de classes. |
| `MissaoVisaoValores.tsx` (824 linhas) | ℹ️ Tech debt | Funcional mas grande. Ideal splittar em subcomponentes futuramente. |
| `dangerouslySetInnerHTML` para JSON-LD | ✅ Correto | Padrão Next.js para structured data. |
| Rate limiter in-memory no Vercel | ℹ️ Limitação | Map in-memory reseta a cada cold start no serverless. Para proteção robusta, considerar Upstash Redis. Funciona como barreira básica. |

---

## 🎯 Conclusão

```
┌─────────────────────────────────────────────┐
│  14 de 18 problemas originais RESOLVIDOS    │
│  4 itens pendentes (manutenibilidade)       │
│  0 problemas críticos restantes             │
│  Segurança: 4/10 → 8.5/10                  │
│  Ecossistema pronto para produção ✅        │
└─────────────────────────────────────────────┘
```

Os 4 itens pendentes são de **manutenibilidade** (Sprint 4) e **não afetam funcionalidade, segurança ou experiência do usuário**. Podem ser resolvidos quando conveniente.
