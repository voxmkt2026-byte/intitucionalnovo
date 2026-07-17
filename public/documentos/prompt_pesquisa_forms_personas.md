# 🎣 Prompt de Pesquisa — NotebookLM
## Formulários de Captura Segmentados por Persona (Titanium Consultorias)

> Cole este prompt inteiro no NotebookLM como instrução de pesquisa.

---

```
Você é um estrategista sênior de UX + CRO (Conversion Rate Optimization) especializado em mercado financeiro brasileiro, consórcios e crédito. Preciso que você me ajude a projetar formulários de captura de leads altamente segmentados para 14 landing pages de uma consultoria de consórcio (Titanium Consultorias).

## CONTEXTO DO NEGÓCIO

A Titanium Consultorias vende consórcios como alternativa ao financiamento bancário. Cada landing page atende uma PERSONA diferente, com poder aquisitivo, urgência, nível de sofisticação e "sonho" completamente distintos.

O formulário NÃO é apenas captura de dados — é um "anzol emocional" que mexe com o SONHO do lead antes de pedir informações. A experiência deve fazer o lead se VISUALIZAR já tendo o bem.

## AS 14 PERSONAS (com poder aquisitivo estimado)

### TIER 1 — MASSA (Renda R$2k-6k, ticket médio R$50k-150k)
1. **Motorista de App (Uber/99)** — Quer trocar o carro alugado por um próprio. Sonho: independência. Prático, direto, desconfia de pegadinhas.
2. **Caminhoneiro** — Quer o caminhão próprio pra parar de pagar frete. Sonho: ser dono da própria frota. Linguagem simples, sem frescura.
3. **Carta Comum** — Lead genérico buscando consórcio barato. Sensível a preço. Quer comparar com financiamento.
4. **Corretor Parceiro** — Profissional que quer revender consórcios. Não é consumidor final. Quer comissões, tabelas, ferramentas.

### TIER 2 — CLASSE MÉDIA (Renda R$6k-15k, ticket R$150k-500k)
5. **Terrenos Construção** — Quer comprar terreno + construir casa. Sonho: sair do aluguel, casa própria. Planejador, pensa no longo prazo.
6. **Terrenos Agrícolas** — Produtor rural, quer expandir área. Sonho: crescer a produção. Prático, entende de investimento em terra.
7. **Máquinas Agrícolas** — Produtor que precisa de trator/colheitadeira. Sonho: mecanizar e aumentar produtividade. ROI-driven.
8. **Carta Contemplada** — Já conhece consórcio, quer carta contemplada pra usar rápido. Urgente. Decisivo. Quer saber valor e prazo.
9. **Placas Solares** — Quer reduzir conta de luz. Sonho: economia mensal. Analítico, faz conta de payback.

### TIER 3 — HIGH TICKET (Renda R$15k-50k+, ticket R$500k-2M+)
10. **Carro de Luxo** — Quer BMW, Mercedes, Porsche sem juros. Sonho: status. Exigente, quer experiência premium e privacidade.
11. **Empresário** — Quer imóvel comercial, frota, ou patrimônio. Sonho: crescimento do negócio. Objetivo, quer números e ROI.
12. **Médico/Saúde** — Alta renda, quer clínica, consultório ou imóvel de alto padrão. Sonho: consultório próprio. Agenda apertada, quer praticidade.
13. **Aeronaves** — Quer avião ou helicóptero. Ultra-high-ticket. Sonho: mobilidade total. Decisor rápido, zero tolerância a processos longos.
14. **Embarcações** — Quer lancha ou iate. Sonho: lifestyle. Quer exclusividade e atendimento white-glove.

## O QUE PRECISO QUE VOCÊ PESQUISE E ME ENTREGUE

Para CADA uma das 14 personas, preciso de:

### A) PSICOLOGIA DO LEAD
- Qual é o SONHO central dessa persona?
- Qual é a DOR principal que impede ele de realizar?
- Qual é a OBJEÇÃO #1 que ele vai ter ao ver o formulário?
- Qual é o GATILHO EMOCIONAL que faz ele preencher?
- Qual nível de CONFIANÇA ele precisa antes de dar os dados?

### B) ARQUITETURA DO FORMULÁRIO
- Quantas ETAPAS o form deve ter? (single-step, 2-step, 3-step, ou wizard)
- Quais CAMPOS são obrigatórios vs opcionais?
- Qual deve ser a PRIMEIRA PERGUNTA (o "hook" emocional)?
- Qual é o CTA ideal (texto do botão)?
- O form deve ter CALCULADORA/SIMULADOR embutido?
- Deve ter seletor VISUAL (fotos de carros, casas, etc)?

### C) COPY & MICROCOPY
- Headline do box do form (ex: "Qual carro você quer dirigir?")
- Subheadline que valida o sonho
- Labels dos campos (tom de voz adequado à persona)
- Texto do botão CTA
- Mensagem de confirmação pós-envio

### D) EXPERIÊNCIA VISUAL
- O form deve ser ESCURO (premium) ou CLARO (acessível)?
- Deve ter IMAGENS/ÍCONES dos bens dentro do form?
- Deve ter PROVA SOCIAL (ex: "2.847 motoristas já conquistaram")?
- Deve ter URGÊNCIA (ex: "Vagas limitadas este mês")?
- Deve ter BADGE DE SEGURANÇA (ex: "Dados protegidos", "Sem consulta ao SPC")?

### E) CAMPOS ESPECÍFICOS POR PERSONA
Para cada persona, defina os campos do form com:
- Nome do campo
- Tipo (text, select, range slider, radio visual, etc)
- Placeholder ou opções
- Se é obrigatório

## REGRAS DE NEGÓCIO
- TIER 1: Formulário pode ter 3-4 etapas com seletores visuais. O lead precisa SONHAR antes de dar o CPF.
- TIER 2: Formulário de 2 etapas. Objetivo mas ainda com elemento de sonho.
- TIER 3: Formulário de 1 etapa MÁXIMO. Essas pessoas são OBJETIVAS. Nome, WhatsApp, valor desejado. Acabou. Atendimento humano faz o resto.
- Em TODOS os tiers: WhatsApp é obrigatório (é o canal de venda). Email é opcional.
- NENHUM form pede CPF na primeira etapa — CPF vem depois do sonho.

## FORMATO DE SAÍDA

Entregue uma MATRIZ completa, persona por persona, com todas as seções (A, B, C, D, E) preenchidas. Use tabelas quando possível. Seja específico — me dê os textos prontos, não diretrizes genéricas.

Para cada persona, feche com um WIREFRAME TEXTUAL mostrando como o form aparece na tela, etapa por etapa.

Exemplo de wireframe textual:
```
[UBER - ETAPA 1]
┌─────────────────────────────────────┐
│  🚗 Qual carro você quer dirigir?   │
│  "Sem entrada. Sem juros. Sem banco."│
│                                     │
│  [📷 Onix] [📷 HB20] [📷 Spin]     │
│  [📷 Outro →]                       │
│                                     │
│  💰 Quanto quer investir por mês?   │
│  [R$ ▓▓▓▓▓░░░░░ R$800]            │
│                                     │
│  [QUERO MEU CARRO →]               │
└─────────────────────────────────────┘

[UBER - ETAPA 2]
┌─────────────────────────────────────┐
│  Falta pouco pra você ter o seu!    │
│                                     │
│  Nome: [________________]           │
│  WhatsApp: [________________]       │
│                                     │
│  [RECEBER MINHA PROPOSTA →]         │
│  🔒 Seus dados estão protegidos     │
└─────────────────────────────────────┘
```

Faça isso para TODAS as 14 personas.
```

---

> [!TIP]
> **Como usar:** Cole este prompt inteiro no NotebookLM. Adicione como fontes qualquer material sobre consórcio, psicologia de vendas, ou CRO que você tiver. O NotebookLM vai cruzar as fontes com a estrutura do prompt e gerar a matriz completa.
