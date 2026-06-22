# Titanium Consultoria — Regras do Projeto

## Identidade

- A Titanium é uma **consultoria de consórcio contemplado**, NÃO é banco, financeira, ou administradora.
- CNPJ: 46.640.755/0001-51 — empresa ativa.
- Regulamentada pelo Banco Central do Brasil.
- 4 anos de mercado, 2000+ clientes, R$50M+ em crédito negociado.

## Compliance (OBRIGATÓRIO)

### Google Ads
- NUNCA usar estrelas ★★★★★ em testimonials ou reviews.
- NUNCA usar fotos geradas/fake de clientes.
- NUNCA usar "Sem juros" sem qualificador ("bancários", "compostos").
- NUNCA fazer claims de renda ou resultado garantido.
- SEMPRE abreviar nomes de clientes (Wellington S., não Wellington Silva).
- SEMPRE incluir disclaimer em prova social: "Resultados individuais podem variar."

### Meta Ads
- NUNCA prometer resultados financeiros específicos como garantidos.
- NUNCA usar linguagem que implique renda fácil ou enriquecimento rápido.
- SEMPRE incluir disclaimer em claims comparativos.

### LGPD
- SEMPRE incluir referência à LGPD (Lei nº 13.709/2018) no footer.
- SEMPRE incluir "Nunca solicitamos depósitos antecipados" como anti-golpe.

## Copy Standards

### "sem juros"
- Em TODA ocorrência, deve ser qualificado:
  - ✅ "sem juros bancários"
  - ✅ "sem juros compostos"
  - ✅ "sem juros de financiamento"
  - ❌ "sem juros" (nu, sem qualificador)

### Claims e Stats
- Todo claim com número (%, R$, quantidade) DEVE ter asterisco + disclaimer.
- Stats da empresa: 2000+ clientes, R$50M+, 4 anos — NUNCA inventar outros.
- Dados do mercado (ABAC, Banco Central) DEVEM ser atribuídos à fonte, NUNCA apresentados como dados da Titanium.
- NPS de 87 pontos — SEMPRE com "(pesquisa interna, [ano])".

### Linguagem
- SEMPRE usar "você" (segunda pessoa), nunca "nós fazemos" como sujeito principal.
- NUNCA usar buzzwords: "revolucionário", "inovador", "disruptivo", "game-changer".
- CTAs SEMPRE benefit-oriented: dizer o que o usuário GANHA, não o que ele FAZ.
  - ✅ "Simular meu crédito"
  - ✅ "Calcular economia"
  - ❌ "Fale com consultor"
  - ❌ "Saiba mais"
  - ❌ "Clique aqui"

### Testimonials
- Mínimo 2 por LP.
- Nomes ABREVIADOS (iniciais do sobrenome).
- SEM estrelas de review (★★★★★).
- SEM fotos de clientes (usar iniciais estilizadas ou badges).
- COM disclaimer ao final da seção.
- Devem conter números específicos (R$ economizados, parcela antes/depois).

## Design System

### Cores
- Primária: `#C9A84C` (dourado)
- Background: `#0A0A0A` (preto profundo)
- Texto: `#FFFFFF` (branco), `rgba(255,255,255,0.7)` (secundário)
- Accent: `#10B981` (verde para savings/positivo)

### Tipografia
- Display: Fraunces (serif, para headlines)
- Body: Inter (sans-serif, para texto)
- NUNCA usar Plus Jakarta Sans (inconsistente com o ecossistema)

### Imagens
- SEMPRE usar `next/image` com `priority` para above-the-fold.
- NUNCA usar `<img>` raw para imagens que devem ser otimizadas.
- Formatos: AVIF > WebP > JPEG.

## Tracking

- Google Analytics: `G-1KE95X84T0`
- Google Ads: `AW-18248652606`
- Meta Pixel: `1667309107949808`
- NUNCA duplicar scripts de tracking.
- SEMPRE usar `next/script` com `strategy="afterInteractive"`.

## Arquitetura

### Institucional (Next.js)
- Componentes em `src/components/`.
- Pages em `src/app/`.
- API routes em `src/app/api/`.
- Tailwind v4 com CSS custom properties.

### Landing Pages (HTML estático)
- Cada LP em `public/[persona]/index.html`.
- Forms via `public/dream-form.js` com `data-dream-form="[persona-id]"`.
- CSS/JS inline ou em `assets/` dentro da pasta da persona.

### Dados de Personas
As 14 personas do ecossistema:
uber, caminhao, carro-luxo, carta-comum, carta-contemplada, corretor, embarcacao, empresario, maquinas-agricolas, medico, placas-solares, terrenos-agricolas, terrenos-construcao, aeronaves.

## Quality Gate

**Score mínimo para deploy: 8.5/10**

Dimensões avaliadas:
1. Headlines (15%) — outcome-focused, pain-driven
2. Body (15%) — conciso, "você" language
3. CTAs (15%) — benefit-oriented
4. Claims/compliance (20%) — disclaimers, qualificadores
5. Social proof (15%) — compliance-safe
6. Consistência (10%) — stats, design, tom
7. Técnico (10%) — mobile, a11y, tracking
