# Titanium Consultoria — Regras do Projeto

## Framework HLM (Hormozi Lead Monetization)

### Posicionamento Obrigatório
A Titanium é uma **consultoria para aquisição patrimonial com análise de consórcio e cartas contempladas**.
- NÃO é banco, financeira, ou administradora de consórcios.
- NÃO vende carta. Oferece **diagnóstico e orientação**.
- CNPJ: 46.640.755/0001-51 — empresa ativa.
- Regulamentada pelo Banco Central do Brasil.
- 4 anos de mercado, 2000+ clientes, R$50M+ em crédito negociado.

### Oferta Principal
"Diagnóstico gratuito de aquisição patrimonial — avaliamos seu objetivo, perfil e possibilidades disponíveis."

### Garantia
De PROCESSO, nunca de RESULTADO.
- ✅ "Você só avança se entender com clareza valores, regras, riscos e próximos passos."
- ❌ "Aprovação garantida" / "Contemplação garantida"

---

## Compliance (OBRIGATÓRIO)

### Google Ads
- NUNCA estrelas ★★★★★ em testimonials/reviews
- NUNCA fotos geradas/fake de clientes
- NUNCA "Sem juros" sem qualificador
- NUNCA claims de renda/resultado garantido
- NUNCA "Aprovação 100%", "Carta garantida", "Dinheiro na hora"
- SEMPRE abreviar nomes de clientes
- SEMPRE incluir disclaimer em prova social

### Meta Ads
- NUNCA atribuir condição financeira ao lead ("Você está endividado?")
- NUNCA prometer resultados financeiros garantidos
- NUNCA coletar renda/score/patrimônio sem base legal
- SEMPRE usar linguagem consultiva ("Conheça alternativas")

### LGPD
- Footer com referência à Lei nº 13.709/2018
- "Nunca solicitamos depósitos antecipados" (anti-golpe)
- Formulário: capturar o MÍNIMO (nome, telefone, objetivo, faixa)

---

## Copy Standards HLM

### Hooks Aprovados
- "Antes de financiar, compare."
- "A parcela não conta a história toda."
- "Comprar bem começa antes da assinatura."
- "Carta contemplada não é promessa. É análise, regra e oportunidade."
- "Não escolha carta no impulso."

### CTAs Aprovados (consultivos)
- ✅ "Solicitar análise gratuita"
- ✅ "Comparar alternativas"
- ✅ "Verificar opções disponíveis"
- ✅ "Fazer diagnóstico gratuito"
- ❌ "Fale com consultor" (genérico)
- ❌ "Saiba mais" / "Clique aqui"
- ❌ "Compre agora" / "Garanta já"

### "sem juros"
Toda ocorrência DEVE ser qualificada:
- ✅ "sem juros bancários"
- ✅ "sem juros compostos"
- ❌ "sem juros" (nu)

### Claims
- Todo claim com número DEVE ter asterisco + disclaimer
- Stats da empresa: 2000+, R$50M+, 4 anos — NUNCA inventar
- Dados ABAC/mercado DEVEM ser atribuídos à fonte
- NPS 87 SEMPRE com "(pesquisa interna, [ano])"

### Linguagem
- SEMPRE "você" (segunda pessoa)
- NUNCA buzzwords: "revolucionário", "inovador", "disruptivo"
- Copy deve ser consultiva, educativa, transparente

### Testimonials
- Mínimo 2 por LP
- Nomes ABREVIADOS (Wellington S., não Wellington Silva)
- SEM estrelas, SEM fotos de clientes
- COM números específicos (economia real)
- COM disclaimer: "Resultados individuais podem variar"

### Disclaimer Obrigatório (toda LP e componente com claim)
"A disponibilidade de cartas, valores, parcelas, transferência e utilização do crédito estão sujeitas à análise, regras contratuais, aprovação da administradora e documentação necessária."

---

## Design System

### Cores
- Primária: `#C9A84C` (dourado)
- Background: `#0A0A0A` (preto profundo)
- Texto: `#FFFFFF`, `rgba(255,255,255,0.7)`
- Accent: `#10B981` (verde savings)

### Tipografia
- Display: Fraunces (serif, headlines)
- Body: Inter (sans-serif, texto)

### Imagens
- SEMPRE `next/image` com `priority` para above-the-fold
- Formatos: AVIF > WebP > JPEG

---

## Tracking

- GA4: `G-1KE95X84T0`
- Google Ads: `AW-18248652606`
- Meta Pixel: `1667309107949808`
- NUNCA duplicar scripts

---

## Arquitetura

### Institucional (Next.js)
- Componentes em `src/components/`
- Pages em `src/app/`
- Tailwind v4

### Landing Pages (HTML estático)
- Cada LP em `public/[persona]/index.html`
- Forms via `public/dream-form.js`

### 14 Personas
uber, caminhao, carro-luxo, carta-comum, carta-contemplada, corretor, embarcacao, empresario, maquinas-agricolas, medico, placas-solares, terrenos-agricolas, terrenos-construcao, aeronaves

---

## Quality Gate: 8.5/10 mínimo para deploy
