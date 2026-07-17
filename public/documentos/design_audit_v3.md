# 🔬 Titanium LP v3 — Auditoria Completa de Design System

> **Skills ativadas:** `frontend-design` (DFII), `gpt-taste` (AIDA), `design-spells` (micro-interactions), `senior-frontend` (perf)

---

## DFII Score Atual

| Dimensão | Score | Notas |
|----------|-------|-------|
| Aesthetic Impact | 3/5 | Paleta verde+preto é boa, mas execução repetitiva — mesmo card style em tudo |
| Context Fit | 4/5 | Fala com motorista de app, imagem correta |
| Implementation Feasibility | 5/5 | HTML+CSS puro, sem deps |
| Performance Safety | 5/5 | Leve, sem JS pesado |
| Consistency Risk | 2/5 | Muito consistente — tudo é o mesmo retângulo glass |

**DFII = (3+4+5+5) − 2 = 15** → Score alto porém o 3 em Aesthetic Impact é o gargalo.

> [!WARNING]
> **O problema NÃO é o código — é a direção de arte.** Os tokens de cor estão corretos, mas a **composição visual** é genérica. Cada seção é um retângulo com borda glass em grid simétrico. Falta drama, contraste e hierarquia visual.

---

## Análise AIDA (framework gpt-taste)

### 🟡 ATTENTION — Hero

**Problemas encontrados:**

| # | Severidade | Issue |
|---|-----------|-------|
| 1 | 🔴 Crítico | **H1 ocupa 4+ linhas** — "PARE DE ENRIQUECER A LOCADORA DE CARRO" escala para 4 linhas no desktop. A regra gpt-taste é max 2-3 linhas. Precisa de container mais largo ou font menor. |
| 2 | 🔴 Crítico | **Proof bar sem diferenciação visual** — mesma cor, mesmo peso que os chips. Deveria ter destaque radical (números gigantes, glow agressivo). Agora parece "mais um card glass". |
| 3 | 🟡 Médio | **CTA button texto escuro sobre fundo verde** — contraste ok, mas o ícone do WhatsApp fica pequeno demais (20px) para o tamanho do botão (btn-lg). |
| 4 | 🟡 Médio | **Orbit ring é decoração sem propósito** — círculo girando não comunica nada ao motorista. Poderia ser um elemento interativo ou ser removido. |
| 5 | 🟢 Menor | **Kicker pill com dot animado** — bom, mas o dot é 7px e invisível em muitas telas. |

### 🔴 INTEREST — Equation Section

| # | Severidade | Issue |
|---|-----------|-------|
| 6 | 🔴 Crítico | **Comparação (pan bad vs pan good) é simétrica** — Ambos os cards têm mesmo tamanho, mesma estrutura. O card "bom" deveria ser MAIOR, mais brilhante, com escala visual que grita "ESTE É MELHOR". Falta hierarquia persuasiva. |
| 7 | 🔴 Crítico | **VS circle é minúsculo** — 64px num gap de 2rem, quase invisível entre os cards. Deveria ser o ponto focal da composição. |
| 8 | 🟡 Médio | **Value equation strip é flat e monótono** — 4 células idênticas, sem hierarquia. O "Carro próprio" (resultado) deveria ser visualmente diferente das outras 3 (processo). Todas parecem iguais. |
| 9 | 🟡 Médio | **Operadores ×÷÷ são quase invisíveis** — 34px width em verde neon sobre bg escuro. No mobile desaparecem completamente (display:none). |
| 10 | 🟢 Menor | **Sem animação nos números** — R$ 2.500 e R$ 550 deveriam ter counter animation ou pelo menos glow pulsante para chamar atenção. |

### 🟡 DESIRE — Pillars Section

| # | Severidade | Issue |
|---|-----------|-------|
| 11 | 🔴 Crítico | **3 boxes idênticos** — Mesmo tamanho, mesmo padding, mesmo glow. Diferença só no ícone. Falta variação visual (um box maior, um com imagem, um com stat). Parece "feature list de SaaS genérico". |
| 12 | 🟡 Médio | **Números 01/02/03 são decorativos** — outline stroke quase invisível, não comunicam progressão. |
| 13 | 🟡 Médio | **Seção inteira é VAZIA de imagery** — Nenhuma foto, nenhum visual. Apenas ícones SVG line dentro de caixas. Perde a conexão emocional com o motorista. |
| 14 | 🟢 Menor | **Glow blobs (::after) são indistinguíveis** — Todos os 3 boxes têm blob verde em opacidades muito similares (.40, .32, .28). |

### 🟡 ACTION — Finale + CTA

| # | Severidade | Issue |
|---|-----------|-------|
| 15 | 🔴 Crítico | **Testimonial está PRESO no mesmo card glass** — depoimento do Wellington merecia destaque brutal: aspas gigantes, foto real, moldura diferenciada. Está num card glass idêntico aos outros. |
| 16 | 🟡 Médio | **CTA "Quero meu carro próprio agora" compete com o testimonial** — ambos têm mesmo peso visual. O CTA deveria ser o elemento mais dominante da página. |
| 17 | 🟡 Médio | **Sem urgência visual** — Não tem badge "últimas vagas", countdown, ou qualquer gatilho de escassez. |

### 🟢 GLOBAL

| # | Severidade | Issue |
|---|-----------|-------|
| 18 | 🔴 Crítico | **ZERO transições entre seções** — Hero termina abruptamente, Equation começa sem transição. Pilares terminam e Finale aparece colado. Falta gradient dividers, shapes, ou breathing space. |
| 19 | 🔴 Crítico | **Monotonia de componentes** — Tudo é "retângulo glass com borda". Hero proof? Glass. Pan cards? Glass. Value eq? Glass. Boxes? Glass. Finale? Glass. Footer? Glass. Sem variação. |
| 20 | 🟡 Médio | **Tipografia sem hierarquia secondary** — Display (Archivo) + Body (Sora) funciona, mas falta um terceiro registro: mono para dados financeiros, ou condensed para stats. |
| 21 | 🟡 Médio | **Footer é VAZIO demais** — Apenas brand + copyright. Falta links, social, legal text. Para LP de conversão, precisa ao menos selo Banco Central e contato. |
| 22 | 🟡 Médio | **Sticky CTA removido** — A v2 tinha sticky bottom bar. Agora não tem. Para mobile é essencial. |
| 23 | 🟢 Menor | **Sem favicons/OG tags** — Meta tags ausentes para share social. |

---

## Design Spells — O que FALTA

| Spell | Status | Onde aplicar |
|-------|--------|-------------|
| Noise texture | ✅ Existe | body::after |
| Glass highlight (top line) | ✅ Existe | .glass::before |
| Pulse ring (CTA) | ✅ Existe | .pulse |
| Hover lift | ❌ Ausente | boxes, cards, testimonial |
| Press physics (scale 0.96) | ❌ Ausente | todos os botões |
| Gradient dividers | ❌ Ausente | entre TODAS as seções |
| Counter animation | ❌ Ausente | proof bar, R$ values |
| Magnetic cursor | ❌ Ausente | CTA buttons |
| Marquee (trust logos) | ❌ Ausente | brands como Santander/Bradesco |
| Staggered reveal | ❌ Ausente | boxes, list items |
| Parallax depth | ❌ Ausente | hero image |
| Scroll progress | ❌ Ausente | nav bar |
| Entrance sequences | 🟡 Parcial | data-rise existe mas sem stagger delays |

---

## Plano de Ação Priorizado

### 🔴 Prioridade 1 — Impacto Visual (Design Direction)

1. **Hero: Reduzir H1 para 2 linhas** — max-width: 100%, font-size menor em clamp
2. **Comparação assimétrica** — Pan good deve ser 1.15x maior com borda glow forte
3. **VS circle gigante** — 96px com glow radial agressivo
4. **Boxes diferenciados** — Box 1 com stat highlight, Box 2 com ícone grande, Box 3 com selo/badge
5. **Gradient dividers entre seções** — Linhas horizontais com gradient fade
6. **Testimonial em formato de quote wall** — Aspas tipográficas 200px, texto serif italic

### 🟡 Prioridade 2 — Interatividade (Design Spells)

7. **Counter animation** no proof bar (requestAnimationFrame)
8. **Hover lift + press physics** em todos os cards
9. **Staggered reveal** com data-d delays incrementais
10. **Marquee de logos** (Santander, Bradesco, Safra, Sicredi)
11. **Sticky CTA** mobile com blur backdrop
12. **Nav scroll progress bar** (verde na borda top)

### 🟢 Prioridade 3 — Polish

13. Tipografia mono para valores financeiros (R$)
14. Footer com links e selo Banco Central
15. OG tags / favicon
16. Prefers-reduced-motion com fallbacks

---

## Pergunta ao Usuário

> [!IMPORTANT]
> Qual direção você prefere para o upgrade?
> 
> **A) Full redesign** — Reescrevo CSS+HTML inteiro com tudo acima (2-3h de trabalho)
> 
> **B) Iterativo** — Aplico as 6 correções de Prioridade 1 agora e você avalia antes de continuar
> 
> **C) Referência visual** — Me manda 1-2 screenshots de LPs que você acha bonitas e eu extraio o design system delas para aplicar aqui

