---
name: titanium-engine
description: >
  Engenharia de decisão senior para o ecossistema Titanium Consultoria.
  Use SEMPRE antes de criar, editar ou auditar qualquer asset (LP, componente, copy, criativo).
  Economiza tokens prevenindo retrabalho através de quality gates e self-audit loop.
---

# Titanium Engine — Engenharia de Decisão Senior

## Quando Usar

Use esta skill **SEMPRE** que for:
- Criar uma LP nova
- Criar ou editar componentes React
- Escrever ou reescrever copy
- Criar criativos (imagens, vídeos, carrosséis)
- Fazer deploy de qualquer mudança
- Auditar qualquer parte do ecossistema

## 1. DECISION FRAMEWORK — Antes de Criar Qualquer Coisa

### Gate 1: Context Load (obrigatório)
Antes de tocar em código, leia:
1. Este arquivo SKILL.md (já está lendo)
2. `references/ecosystem-context.md` — memória institucional com todos os aprendizados
3. `.agents/AGENTS.md` — regras permanentes do projeto

### Gate 2: Pre-Flight Checklist (obrigatório)
Escolha o checklist correto baseado no tipo de asset:

#### Checklist: Landing Page (HTML)
```
□ Hero headline é ÚNICO para esta persona (não genérico)
□ Hero CTA é benefit-oriented ("Simular meu X" não "Fale com consultor")
□ Equation section mostra comparação justa (banco vs consórcio)
□ FAQ é PERSONALIZADO para esta persona (mínimo 5 perguntas únicas)
□ Testimonials: mínimo 2, SEM estrelas ★, nomes ABREVIADOS, COM disclaimer
□ Sticky CTA é benefit-oriented com parcela/benefício
□ Stats: 2000+ clientes, R$50M+, 4 anos (CONSISTENTES)
□ "sem juros" SEMPRE qualificado ("bancários", "compostos", ou "de financiamento")
□ Meta tags: title + description persona-specific
□ Footer: CNPJ, LGPD, "não é instituição financeira", disclaimer anti-golpe
□ Tracking: GA4 + Google Ads + Meta Pixel
□ Form: dream-form.js com persona ID correto
□ Nav CTA personalizado (não genérico "Fale com consultor")
□ og:url presente
□ Fonte: Fraunces + Inter (consistente com ecossistema)
```

#### Checklist: Componente React (TSX)
```
□ Copy usa "você" (não "nós" ou terceira pessoa)
□ Claims têm asterisco + disclaimer inline ou ao final da seção
□ Nenhum claim sem fonte (stats, %, valores monetários)
□ "sem juros" qualificado em TODA ocorrência
□ CTA benefit-oriented (o que o usuário GANHA, não o que ele FAZ)
□ Mobile responsive (breakpoints sm/md/lg/xl)
□ Semantic HTML (section, article, blockquote para citações)
□ aria-labels em elementos interativos
□ next/image em vez de <img> raw
□ Consistência de stats: 2000+/R$50M+/4 anos
□ CNPJ quando mostrar credenciais: 46.640.755/0001-51
```

#### Checklist: Copy (texto)
```
□ Headline outcome-focused (resultado, não processo)
□ Sem buzzwords: "revolucionário", "inovador", "disruptivo", "premium"
□ Sem superlativos sem prova: "o melhor", "o maior", "líder"
□ Prova social com números específicos (R$2.700 → R$990, não "economize muito")
□ Pain point ANTES de solução (problema → ponte → transformação)
□ Compliance: Google Ads não permite estrelas fake, reviews fabricados
□ Compliance: Meta não permite claims de renda/resultado garantido
□ "sem juros" = "sem juros bancários" ou "sem juros compostos"
□ Case studies usam nomes abreviados (Wellington S., não Wellington Silva)
□ Disclaimer em TODA prova social: "Resultados individuais podem variar"
```

#### Checklist: Criativo (imagem/vídeo)
```
□ Sem texto que viole compliance Google Ads (claims de renda, garantias)
□ Sem logos falsos de bancos/instituições
□ CTA legível em mobile (fonte ≥ 16px)
□ Identidade visual: dourado #C9A84C, preto #0A0A0A, branco
□ Foto: profissional, diversa, sem stock genérico
□ Se usar depoimento: nome abreviado + disclaimer
```

### Gate 3: Quality Score (mínimo 8.5/10)
Após criar, auto-avaliar usando estas dimensões:

| Dimensão | Peso | Critério |
|----------|------|----------|
| Headlines | 15% | Outcome-focused, pain-driven, sem buzzwords |
| Body copy | 15% | Conciso, "você" language, sem jargão |
| CTAs | 15% | Benefit-oriented, específico, urgente |
| Claims/compliance | 20% | Todo claim com disclaimer, "sem juros" qualificado |
| Social proof | 15% | Presente, compliance-safe, com disclaimer |
| Consistência | 10% | Stats, cores, fontes, tom de voz uniformes |
| Técnico | 10% | Mobile, a11y, tracking, SEO |

**Se score < 8.5**: Corrigir automaticamente antes de entregar.
**Se score ≥ 8.5**: Entregar com o score documentado.

---

## 2. SELF-AUDIT LOOP — Criar → Revisar → Corrigir → Entregar

```
Passo 1: CRIAR com todos os checklists aplicados
Passo 2: REVISAR internamente (score por dimensão)
Passo 3: Se score < 8.5 → CORRIGIR issues encontrados
Passo 4: Re-score → Se ≥ 8.5 → ENTREGAR
Passo 5: Documentar score e issues corrigidos na resposta
```

### Template de Entrega
Ao entregar qualquer criação, incluir:
```
## Quality Score: X.X/10
- Headlines: X/10
- Body: X/10
- CTAs: X/10
- Claims: X/10
- Proof: X/10
- Consistência: X/10
- Técnico: X/10

### Issues auto-corrigidos: N
### Checklist: [tipo] — XX/XX items ✅
```

---

## 3. ANTI-PATTERNS — Nunca Repetir

Estes erros foram encontrados em auditorias anteriores. **NUNCA** cometa:

### 🔴 Compliance (Google Ads / Meta)
- ❌ Estrelas ★★★★★ em testimonials (Google monitora)
- ❌ Fotos geradas de "clientes" (Meta monitora)
- ❌ "Sem juros" nu (sempre qualificar)
- ❌ Stats da ABAC/mercado como se fossem da empresa
- ❌ Nomes completos de clientes (privacidade)
- ❌ "Trabalho escravo" ou linguagem agressiva

### 🟡 Copy
- ❌ "Revolucionário", "inovador", "disruptivo"
- ❌ "2 milhões de clientes" (dado real: 2000+)
- ❌ "R$307 bilhões" (dado ABAC, não da Titanium)
- ❌ "Investimento que só valoriza" (real estate pode desvalorizar)
- ❌ "Crédito aprovado sem entrada" sem disclaimer
- ❌ CTAs genéricos: "Fale com consultor", "Saiba mais"

### 🟢 Técnico
- ❌ `<img>` raw em vez de `next/image`
- ❌ Rate limiter em memória (não funciona serverless)
- ❌ Middleware como módulo separado (deve ser `middleware.ts` na raiz)
- ❌ 3 libs de animação no mesmo projeto
- ❌ Fontes inconsistentes entre LPs

---

## 4. DADOS DA EMPRESA — Fonte Única de Verdade

| Dado | Valor | Observação |
|------|-------|-----------|
| Nome | Titanium Consultoria | Nunca "Titanium Bank" ou "Titanium Financeira" |
| CNPJ | 46.640.755/0001-51 | Empresa ativa |
| Tempo | 4 anos | Fundada ~2022 |
| Clientes | 2000+ | Dado interno |
| Crédito total | R$50M+ | Acumulado desde fundação |
| NPS | 87 | Necessita disclaimer "pesquisa interna [data]" |
| Faixa de crédito | R$15k a R$2M | Por carta |
| Taxa administrativa | 0,5% a 1,5% ao mês | 12% a 22% total |
| WhatsApp | 11 91234-5678 | Consultor |
| Natureza | Consultoria de consórcio | NÃO é banco, financeira, ou administradora |
| Regulamentação | Banco Central do Brasil | Consórcios são regulamentados |
| Cores | Dourado #C9A84C, Preto #0A0A0A, Branco #FFFFFF | Design system |
| Fontes | Fraunces (display) + Inter (body) | Padrão do ecossistema |
| Tracking | GA4: G-1KE95X84T0, Ads: AW-18248652606, Meta: 1667309107949808 | Nunca duplicar |

---

## 5. ECONOMIA DE TOKENS — Decisões Pré-Tomadas

Para NÃO gastar tokens discutindo o óbvio:

| Situação | Decisão Senior |
|----------|----------------|
| Testimonials em LP | 2 mínimo, sem estrelas, nomes abreviados, disclaimer |
| "sem juros" em qualquer copy | Sempre "sem juros bancários" ou "sem juros compostos" |
| Stats da empresa | 2000+/R$50M+/4 anos — NUNCA inventar |
| CTA principal | Benefit-oriented com verbo de ação |
| Footer de LP | CNPJ + LGPD + anti-golpe + "não é instituição financeira" |
| Hero image | next/image com priority + sizes="100vw" |
| Form | dream-form.js com persona ID correto |
| Tracking | GA4 + Ads + Meta — NUNCA duplicar scripts |
| Mobile | Grid responsivo sm/md/lg/xl — NUNCA desktop-only |
| FAQ | PERSONALIZADO por persona — NUNCA genérico |
