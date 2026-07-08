# 🖥️ Plano: Dashboard de Gestão Titanium

Substituir Google Sheets por uma aplicação interna completa onde o gestor gerencia leads, acompanha tráfego e toma decisões em tempo real.

---

## Arquitetura Geral

```
titaniumconsultorias.com.br/admin/
│
├── login              → já existe (JWT auth) ✅
├── dashboard          → NOVO — visão geral KPIs
├── leads              → NOVO — CRM de leads completo
└── cartas             → já existe (gestão de cartas) ✅
```

Tecnologia: **Next.js App Router + Neon Postgres + JWT existente**. Sem libs externas novas — charts com SVG/CSS nativo.

---

## Mudanças no Banco de Dados

### Tabela `leads` — 3 colunas novas
```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Novo';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes  TEXT DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
```
Status: `Novo` | `Qualificado` | `Vendido` | `Perdido`

### Nova tabela `lead_events` (histórico de ações)
```sql
CREATE TABLE IF NOT EXISTS lead_events (
  id        SERIAL PRIMARY KEY,
  lead_id   INTEGER REFERENCES leads(id),
  tipo      TEXT,       -- 'status_change', 'nota'
  valor     TEXT,
  admin     TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Novas Páginas

### `/admin/dashboard` — Visão Geral
KPI cards + mini funil + feed ao vivo de leads.

```
┌─────────────────────────────────────────────────────────┐
│ TITANIUM ADMIN     [Dashboard] [Leads] [Cartas] [Sair]  │
├─────────────────────────────────────────────────────────┤
│  📥 3 hoje   📅 18/7d   📅 67/30d   🏆 11.9% conv.      │
│                                                         │
│  ┌─ Funil ──────────────┐  ┌─ Leads recentes ────────┐  │
│  │ Novo        45 ████  │  │ João S. — imóvel 300k   │  │
│  │ Qualificado 12 ██    │  │ há 12min · google       │  │
│  │ Vendido      8 █     │  │ Maria L. — veículo 80k  │  │
│  │ Perdido      2 ░     │  │ há 1h · facebook        │  │
│  └──────────────────────┘  └─────────────────────────┘  │
│                                                         │
│  ┌─ Por fonte ───────────┐  ┌─ Por LP ───────────────┐  │
│  │ google     38 ██████  │  │ cartas-contemp. 14     │  │
│  │ facebook   22 ███     │  │ main           53      │  │
│  │ organico    7 █       │  └────────────────────────┘  │
│  └───────────────────────┘                              │
└─────────────────────────────────────────────────────────┘
```

**KPIs:**
| Card | Query |
|------|-------|
| Leads hoje | `COUNT WHERE DATE = today` |
| Leads 7 dias | `COUNT WHERE > -7d` |
| Leads 30 dias | `COUNT WHERE > -30d` |
| Taxa conversão | `Vendido / Total × 100` |
| Ticket médio | `AVG(credit) WHERE status=Vendido` |

### `/admin/leads` — CRM Completo

Tabela com todas as colunas + filtros + ações inline.

**Colunas:** Data · Nome · WhatsApp · Segmento · Crédito · UTM Source · LP · fbc/gclid (ícones) · **Status** (dropdown) · **Notas**

**Filtros:** Status · Segmento · UTM Source · Intervalo de datas · Busca texto

**Ações por lead:**
- Mudar status com 1 clique
- Adicionar nota (drawer lateral com histórico)
- Abrir WhatsApp direto (`wa.me/55...`)
- Copiar telefone

---

## Novas APIs (todas protegidas por JWT)

### `GET /api/admin/stats`
```json
{
  "hoje": 3, "semana": 18, "mes": 67, "total": 312,
  "por_status": { "Novo": 45, "Qualificado": 12, "Vendido": 8, "Perdido": 2 },
  "por_source": { "google": 38, "facebook": 22, "organico": 7 },
  "por_lp": { "cartas-contempladas": 14, "main": 53 },
  "por_segmento": { "imovel": 44, "veiculos": 23 },
  "ticket_medio_vendido": 285000,
  "taxa_conversao": 11.9
}
```

### `GET /api/admin/leads`
Filtros: `?status=&segmento=&utm_source=&q=&data_inicio=&data_fim=&sort=&dir=&page=`

### `PATCH /api/admin/leads/[id]`
```json
{ "status": "Qualificado", "notes": "Ligou às 14h, interesse em imóvel 300k" }
```

---

## Arquivo por Arquivo

| Arquivo | Ação |
|---------|------|
| `src/app/admin/page.tsx` | NOVO — redirect → dashboard |
| `src/app/admin/dashboard/page.tsx` | NOVO — KPI overview |
| `src/app/admin/leads/page.tsx` | NOVO — CRM table |
| `src/components/admin/AdminLayout.tsx` | NOVO — navbar/sidebar |
| `src/components/admin/KpiCard.tsx` | NOVO |
| `src/components/admin/FunnelChart.tsx` | NOVO — CSS bars |
| `src/components/admin/BarChart.tsx` | NOVO — CSS bars |
| `src/components/admin/LeadsTable.tsx` | NOVO — client component |
| `src/components/admin/LeadDrawer.tsx` | NOVO — slide panel |
| `src/app/api/admin/stats/route.ts` | NOVO |
| `src/app/api/admin/leads/route.ts` | NOVO |
| `src/app/api/admin/leads/[id]/route.ts` | NOVO |

---

## Fase de Aposentadoria das Planilhas

1. Dashboard funcionando → planilhas viram backup passivo
2. Após 30 dias sem problemas → remover `sendToSheets()` do `route.ts`
3. Manter aba `Cliques` por 60 dias (backup de `gclid`/`fbc` histórico)

> [!NOTE]
> Não deletamos nada da planilha imediatamente. O Neon vira a fonte de verdade e o dashboard a interface. A planilha fica como seguro por 30 dias.

> [!IMPORTANT]
> A autenticação JWT existente é reutilizada. O gestor usa o mesmo login de `/admin/login` para acessar tudo.

---

## O que NÃO entra nessa fase

- Meta Ads API (métricas de campanha — custo, CPC, ROAS)
- Google Ads API (conectar ao dashboard)
- Google Offline Conversions (tarefa separada)
- Exportação PDF/CSV
- Multi-usuários com permissões diferentes
