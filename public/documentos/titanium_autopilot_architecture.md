# 🏭 TITANIUM AUTOPILOT — Arquitetura de Automação Completa
### Senior Architect Audit · Titanium Engine HLM · Julho 2026

> **Objetivo:** Estrutura previsível e lucrativa, rodando automática — você apenas administra e faz ajustes.  
> **Filosofia:** Low cortisol. O trem anda. Você olha o painel.

---

## ESTADO ATUAL DO ECOSSISTEMA

```
Captura    ██████████ 70% — LPs + formulários funcionando, DB desconectado
CRM        ██░░░░░░░░ 20% — Kommo 402, leads não entram no pipeline
Nurturing  █░░░░░░░░░ 10% — WhatsApp manual, sem sequências automáticas
Criativos  ██░░░░░░░░ 20% — Criação manual, sem testes A/B automáticos
Budget     ░░░░░░░░░░  0% — Controle manual de orçamento Meta/Google
Relatório  ██░░░░░░░░ 20% — Sheets funcionando, sem dashboard unificado
Cartas     ████████░░ 80% — Vitrine + admin prontos (hoje!)
```

### 2 Bloqueadores Críticos ANTES de qualquer automação
| # | Bloqueador | Impacto | Ação Imediata |
|---|---|---|---|
| 🔴 | `DATABASE_URL` ausente na Vercel | Leads não salvos no DB | Adicionar env var na Vercel |
| 🔴 | Kommo 402 Payment Required | Leads não entram no CRM | Upgrade plano OU fallback n8n |

> [!CAUTION]
> Sem resolver esses 2, todo o resto não funciona. São a fundação do pipeline.

---

## ARQUITETURA ALVO — O AUTOPILOT MACHINE

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TITANIUM AUTOPILOT                           │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────┤
│   CAPTURE    │   ROUTING    │  NURTURING   │  CRIATIVOS   │ REPORT  │
│              │              │              │              │         │
│  14 LPs HTML │  n8n Hub     │  Z-API WA    │  n8n + AI    │ Looker  │
│  Cartas Page │  Kommo CRM   │  Cadências   │  Meta API    │ Studio  │
│  /api/leads  │  Tags/Stage  │  Sequências  │  A/B Auto    │ Weekly  │
│              │              │              │              │  WA msg │
│  Neon DB ────┤              │              │              │         │
│  Sheets ─────┤              │              │              │         │
│  Meta CAPI ──┘              │              │              │         │
└──────────────────────────────────────────────────────────────────────┘
         Você: só olha o painel e toma decisões estratégicas
```

---

## LAYER 1 — CAPTURE (70% pronto → 100%)

### O que já funciona
- ✅ 14 LPs capturam leads com UTMs
- ✅ Meta CAPI enviando eventos
- ✅ Cartas Contempladas com formulário de captura
- ✅ Google Sheets recebendo leads

### O que falta (2 horas de trabalho seu)
```
AÇÃO 1: Vercel → Settings → Environment Variables
  DATABASE_URL = postgresql://neondb_owner:npg_y3f6lIxeAPLa@...

AÇÃO 2: Kommo plano OU remover KOMMO_ACCESS_TOKEN da Vercel
  (fallback automático para n8n webhook)
```

### Resultado após fix
```
Lead preenche formulário
  → Neon DB (persistência) ✅
  → Google Sheets (planilha) ✅  
  → Meta CAPI (otimização de anúncio) ✅
  → Kommo CRM (pipeline de vendas) ✅
  → n8n (dispara automações) ✅
```

---

## LAYER 2 — ROUTING & CRM (20% → 100%)

### Arquitetura do Pipeline Kommo

```
Lead novo (n8n recebe webhook do /api/leads)
  └─→ Cria lead no Kommo com:
        nome, telefone, email
        segmento (uber/caminhao/imovel/carta)
        UTM source/medium/campaign
        valor crédito desejado
        LP de origem
  └─→ Tag automática por segmento
  └─→ Stage: "Novo Lead"
  └─→ Dispara: Notificação WhatsApp para consultor
```

### Stages do Funil (configurar no Kommo)
| Stage | Ação Automática | SLA |
|---|---|---|
| **Novo Lead** | WA bot envia mensagem de boas-vindas | 0-5min |
| **Contato Feito** | Nada — consultor assume | manual |
| **Análise** | WA lembrete se sem resposta em 48h | auto |
| **Proposta** | n8n arquiva na planilha de propostas | auto |
| **Fechado Ganho** | n8n atualiza métricas + pede indicação | auto |
| **Fechado Perdido** | n8n inicia cadência de reengajamento 30d | auto |

### n8n Workflows necessários
```
Workflow 1: Lead Router
  Trigger: Webhook /api/leads
  Actions: Kommo + WhatsApp boas-vindas + Sheets atualiza

Workflow 2: Follow-up automático
  Trigger: Cron 9h-18h (a cada 4h)
  Actions: Checa leads sem resposta > 2h → WA lembrete consultor

Workflow 3: Fechado Ganho
  Trigger: Kommo stage change → "Fechado Ganho"
  Actions: Planilha financeira + WA parabéns + pede Google Review
```

---

## LAYER 3 — NURTURING AUTOMÁTICO (10% → 90%)

### Cadência WhatsApp por segmento (Z-API + n8n)

```
Sequência: Lead Frio (não respondeu em 3 dias)

Dia 0:  [Boas-vindas consultivo]
        "Olá [Nome], recebemos sua solicitação de análise..."

Dia 1:  [Educação]
        "A diferença entre consórcio e carta contemplada em 30 segundos..."

Dia 3:  [Prova social]  
        "J.M. de SP economizou R$48.000 vs financiamento tradicional..."

Dia 7:  [Urgência real]
        "Verificamos que há [N] cartas disponíveis no segmento que você procura..."

Dia 14: [Reengajamento]
        "Ainda posso ajudar? Se mudou de plano, sem problemas — aqui quando precisar."

Dia 30: [Arquivar ou reativar]
        → Se nenhuma resposta: mover para lista fria
```

### Por segmento (personalização automática)
| Segmento detectado | Mensagem day-1 usa |
|---|---|
| `uber` | hook do aluguel de carro |
| `caminhao` | hook da frota sem juros |
| `imovel` | hook do aluguel vs consórcio |
| `carta-contemplada` | hook da liquidez imediata |
| `agro` | hook do capital de giro preservado |

---

## LAYER 4 — CRIATIVOS AUTOMÁTICOS (20% → 80%)

### Fluxo de Criação + Teste Automático

```
n8n Cron: Segunda-feira 07h
  1. Busca métricas da semana anterior via Meta API
  2. Identifica anúncio com melhor CTR por segmento
  3. Gera 3 variações de copy (Gemini API) baseadas no winner
  4. Cria criativos via Canva API ou templates HTML→screenshot
  5. Faz upload via Meta Marketing API
  6. Cria A/B test (split 33%/33%/33%)
  7. Define budget mínimo de teste (R$30/variação/dia)
  8. Pausa automático se CTR < 1% após 3 dias
  9. Escala winner: aumenta budget 30% se CTR > 3%
```

### Template de copy (3 variações automáticas)
```
Hook A: Problema → Solução (padrão)
Hook B: Pergunta provocativa (curiosidade)
Hook C: Prova social + números (autoridade)
```

### O que você faz manualmente (mínimo)
- Aprova ou rejeita winners (notificação WA semanal)
- Define orçamento máximo mensal por segmento
- Veta criativos com baixa qualidade visual

---

## LAYER 5 — CONTROLE DE CAIXA AUTOMÁTICO (0% → 85%)

### Budget Rules (Meta API + n8n)

```
Regra 1: CPL Máximo
  Se CPL > R$X por segmento por 2 dias consecutivos
  → Pausa campanha automaticamente
  → Envia WA: "Campanha [X] pausada: CPL R$Y acima do limite"

Regra 2: Scale Winner
  Se ROAS > meta por 3 dias
  → Aumenta budget 20% (máximo R$500/dia por campanha)
  → Log na planilha financeira

Regra 3: Controle Mensal
  Cron todo dia 08h: soma gastos do mês
  Se > 80% do budget mensal → alerta WA
  Se > 95% → pausa tudo automaticamente
  
Regra 4: Zero em fim de semana (opcional)
  Sexta 22h → reduz 50% de campanhas de baixo volume
  Segunda 07h → restaura budgets
```

### Dashboard Financeiro (Google Sheets automático)
```
Planilha: "Titanium Finance Dashboard"
  Aba 1: Receita por semana (atualiza segunda)
  Aba 2: Custo por lead por segmento (atualiza diário)
  Aba 3: Pipeline de vendas (atualiza com Kommo)
  Aba 4: ROI por LP (calculado automático)
```

---

## LAYER 6 — RELATÓRIO AUTOMÁTICO (20% → 100%)

### Weekly Report (toda segunda 08h no WhatsApp)

```
🏆 TITANIUM — RELATÓRIO SEMANAL

📊 LEADS
  Total: XX | Meta: YY | Δ: +/-ZZ%
  Melhor LP: [nome] | CPL: R$XX

💰 FINANCEIRO  
  Investido: R$XX | Receita: R$YY | ROI: ZZx
  Budget restante mês: R$XX (XX%)

🔥 DESTAQUES
  Anúncio winner: [nome] (CTR XX%)
  Segmento melhor: [segmento]

⚡ AÇÕES PENDENTES (só o que importa)
  □ [1-3 itens máximo]

Próximo relatório: [data]
```

### Quando você É acionado (low cortisol)
- 🔴 CPL > limite definido (alerta imediato)
- 🟡 Budget 80% utilizado (alerta diário)
- 📊 Relatório semanal (toda segunda)
- ✅ Winner de criativo para aprovação (toda semana)
- 💰 Fechamento de venda (sempre — good news)

---

## LAYER 7 — CARTAS CONTEMPLADAS (80% → 100%)

### O que está pronto (hoje)
- ✅ Vitrine pública com filtros e identidade Titanium
- ✅ Formulário de captura com UTMs e carta_id
- ✅ Admin panel para o vendedor atualizar estoque
- ✅ Banco Neon com tabelas `cartas_contempladas` e `admin_users`

### O que falta (próxima sessão)
```
AUTOMAÇÃO 1: Alerta de estoque baixo
  Se cartas disponíveis < 3 → WA para o vendedor

AUTOMAÇÃO 2: Lead de carta → Kommo com contexto
  Lead de /cartas-contempladas → Kommo com tag "carta-contemplada"
  Stage especial: resposta em < 1h (urgência maior)

AUTOMAÇÃO 3: Relatório de cartas
  Segunda: "X cartas disponíveis | Y leads da semana | Z cartas vendidas"
```

---

## ROADMAP DE IMPLEMENTAÇÃO

### 🔴 HOJE (você faz — 15 min)
```
1. Vercel → Settings → Env Vars → DATABASE_URL (string do Neon)
2. Kommo → upgrade de plano OU Vercel → apagar KOMMO_ACCESS_TOKEN
```
> Esses 2 desbloqueiam o pipeline inteiro. Sem eles, nada automatiza.

### Semana 1 — ROUTING (2-3h de configuração com agentes)
```
- n8n Workflow 1: Lead Router completo
- WhatsApp boas-vindas automático (Z-API)
- Kommo: criar stages e tags por segmento
```

### Semana 2 — NURTURING (2h)
```
- Sequências de mensagens por segmento
- Follow-up automático de leads sem resposta
- Cadência "lead frio" (7/14/30 dias)
```

### Semana 3 — BUDGET CONTROL (3h)
```
- Dashboard Google Sheets automático
- Budget rules no Meta via n8n
- Relatório semanal no WhatsApp
```

### Semana 4 — CRIATIVOS (4h)
```
- Template de criativo por segmento
- n8n gerando variações de copy
- A/B test automático via Meta API
```

### Mês 2 — ESCALA
```
- Looker Studio dashboard (visual premium)
- Score de lead automático (Kommo + IA)
- Oferta personalizada por perfil do lead
```

---

## STACK TECNOLÓGICA (JÁ PAGO / DISPONÍVEL)

| Ferramenta | Status | Uso no Autopilot |
|---|---|---|
| Vercel (Next.js) | ✅ Ativo | Site + API + Admin |
| Neon Postgres | ✅ Ativo | DB leads + cartas |
| n8n | ✅ Ativo | Hub de automação central |
| Z-API | ❓ Verificar | WhatsApp bot |
| Kommo CRM | ⚠️ Plano 402 | Pipeline de vendas |
| Meta Ads | ✅ Ativo | Mídia paga |
| Google Ads | ✅ Ativo | Mídia paga |
| Google Sheets | ✅ Ativo | Dashboard financeiro |
| Meta CAPI | ✅ Funcionando | Otimização de anúncios |
| Gemini API | ✅ Disponível | Geração de copy/criativos |

---

## KPIs DO AUTOPILOT (o que você monitora)

| KPI | Frequência | Meta | Alerta se |
|---|---|---|---|
| CPL por segmento | Diário | < R$30 | > R$50 |
| Taxa de contato WhatsApp | Diário | > 60% | < 40% |
| Leads por semana | Semanal | > 50 | < 20 |
| Taxa de fechamento | Semanal | > 8% | < 4% |
| Budget utilizado | Diário | 80% no dia 25 | > 95% |
| Cartas disponíveis | Semanal | > 5 | < 3 |
| CTR médio dos criativos | Semanal | > 2% | < 0.8% |

---

## RESUMO EXECUTIVO — O QUE MUDA NA SUA VIDA

### Antes (atual)
- Verificar leads manualmente
- Responder leads no WhatsApp um a um
- Criar criativos manualmente
- Controlar budget olhando Meta Ads todo dia
- Não saber o ROI real por LP

### Depois (Autopilot completo)
- Leads entram, são roteados e recebem boas-vindas automaticamente
- Você só fala com leads que já responderam (quentes)
- Criativos criados e testados toda semana sem você tocar
- Budget se ajusta sozinho com regras
- Relatório semanal no WhatsApp: 1 minuto para entender tudo
- Você faz estratégia e fecha as vendas. A máquina faz o resto.

---

*Titanium Engine HLM · Senior Architect Audit · Julho 2026*
*Próxima revisão: após implementação do Layer 2 (ROUTING)*
