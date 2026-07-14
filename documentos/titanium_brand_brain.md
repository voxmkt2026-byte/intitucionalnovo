# 🏛️ TITANIUM — BRAND BRAIN
### Dossiê Completo de Identidade, Design System, Cérebro e Comunicação
`Versão 1.0 — Junho 2026` · `Documento confidencial — uso interno`

---

## 1. IDENTIDADE DA MARCA

### Quem somos
**Titanium Consultoria Financeira** é uma empresa especializada na intermediação e consultoria para aquisição de Créditos por Consórcio, atuando com foco em segurança jurídica, transparência e excelência no atendimento.

> "Não somos uma corretora de consórcios de varejo. Somos estrategistas financeiros que estruturam operações de alavancagem patrimonial para quem já chegou lá — e quer ir mais longe."

### Posicionamento
- **Mercado:** High-ticket. Consórcio como ferramenta de inteligência financeira, não como "parcelamento sem juros"
- **Regra:** 80/20 — focamos no topo da pirâmide (HNWIs, produtores rurais, CFOs, empresários)
- **Anti-posicionamento:** Não somos varejistas. Não vendemos "sonho". Vendemos resultado

### Dados cadastrais
| Campo | Valor |
|---|---|
| Razão Social | Titanium Consultoria Financeira |
| CNPJ | 46.640.755/0001-51 |
| Site | titaniumconsultoria.com.br |
| Tempo de mercado | 4 anos |

---

## 2. CONTATOS OFICIAIS

| Canal | Dado |
|---|---|
| 📱 WhatsApp | +55 11 93004-8940 · `(11) 93004-8940` |
| 📧 E-mail | contato@titaniumconsultoria.com.br |
| 📸 Instagram | [@titaniumconsultoriafinanceira](https://www.instagram.com/titaniumconsultoriafinanceira?igsh=MXY5c3N3Mm5naXR4bA==) |

> [!IMPORTANT]
> Esses são os únicos dados de contato oficiais. Qualquer LP, automação, bot ou material que exiba outro número ou handle deve ser corrigido imediatamente.

---

## 3. PORTFÓLIO DE PRODUTOS (11 LPs Ativas)

| Produto | Público-alvo | LP |
|---|---|---|
| Veículo Popular | Motoristas de app (Uber/99) | `/uber` |
| Veículo Alto Padrão | Executivos, empresários | `/carro-luxo` |
| Caminhão | Transportadores, frotas | `/caminhao` |
| Moto | Motofretistas, uso pessoal | — |
| Imóvel / Alto Padrão | Investidores imobiliários | — |
| Terreno Urbano | Construtores, incorporadores | `/terrenos-construcao` |
| Terreno Agrícola | Produtores rurais | `/terrenos-agricolas` |
| Máquinas Agrícolas | Agronegócio | `/maquinas-agricolas` |
| Aeronaves | HNWIs, empresários | `/aeronaves` |
| Embarcações | Nautica, lazer premium | `/embarcacao` |
| Placas Solares | Energia, sustentabilidade | `/placas-solares` |
| **Carta Contemplada** | Quem precisa de crédito JÁ | `/carta-contemplada` |
| Carta Comum | Planejamento de médio prazo | `/carta-comum` |

### Produto Estrela: Carta Contemplada
- Crédito já aprovado, uso imediato
- Sem análise de crédito tradicional
- Ideal para quem precisa de liquidez rápida
- Posicionamento: "Crédito contemplado já aprovado"

---

## 4. DESIGN SYSTEM — TOKENS COMPLETOS

### 4.1 Paleta de Cores

#### Backgrounds
| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#F8F7F4` | Fundo principal (off-white quente) |
| `--bg-2` | `#EFEDE8` | Seções alternadas |
| `--bg-3` | `#E5E2DC` | Destaques leves |
| `--bg-white` | `#FFFFFF` | Cards, formulários |
| `--bg-dark` | `#1A1F1C` | Seções escuras, hero dark |

#### Texto / Tipografia
| Token | Hex | Uso |
|---|---|---|
| `--ink` | `#1A1A1A` | Texto principal |
| `--ink-soft` | `#4A4A4A` | Texto secundário |
| `--ink-mute` | `#8A8A8A` | Labels, captions |
| `--ink-white` | `#FFFFFF` | Texto sobre fundo escuro |

#### Verde — Deep Emerald (cor principal da marca)
| Token | Hex | Uso |
|---|---|---|
| `--green` | `#0A7B3E` | Cor primária da marca |
| `--green-mid` | `#0D9E50` | Estados hover |
| `--green-vivid` | `#15B85C` | Destaques, gradientes |
| `--green-deep` | `#06532A` | Sombras, profundidade |
| `--green-tint` | `#E8F5EE` | Fundos de chips/badges |
| `--green-tint-2` | `#D1ECDD` | Bordas de chips/badges |

#### Funcionais
| Token | Hex | Uso |
|---|---|---|
| `--good` | `#0D9E50` | Sucesso, aprovação |
| `--bad` | `#C44040` | Erro, alerta |
| `--whatsapp` | `#25D366` | Botões WhatsApp exclusivamente |

### 4.2 Tipografia

**Fonte única:** `Plus Jakarta Sans` (Google Fonts)
- Pesos utilizados: 300 · 400 · 500 · 600 · 700 · 800
- URL: `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800`

| Classe | Tamanho | Peso | Uso |
|---|---|---|---|
| `.display` | `clamp(2.2rem, 5.8vw, 4.6rem)` | 900 | Headlines de hero |
| `.h2` | `clamp(1.6rem, 3.8vw, 2.6rem)` | 700 | Títulos de seção |
| `.h3` | `clamp(1.2rem, 2.4vw, 1.6rem)` | 700 | Subtítulos |
| `.lead` | `clamp(1.05rem, 1.6vw, 1.3rem)` | 400 | Parágrafos principais |
| `.kicker` | `0.75rem` | 600 | Labels acima de títulos |

### 4.3 Layout e Grid

```css
--wrap:   1200px;   /* Largura máxima do conteúdo */
--pad:    clamp(1.15rem, 4vw, 2.2rem);  /* Padding responsivo */
```

### 4.4 Border Radius
| Token | Valor | Uso |
|---|---|---|
| `--r` | `12px` | Inputs, chips, cards pequenos |
| `--r-lg` | `16px` | Cards médios |
| `--r-xl` | `20px` | Containers grandes |
| `--r-pill` | `999px` | Botões, badges pill |

### 4.5 Sombras (Cards)
```css
--card-shadow:    0 1px 3px rgba(0,0,0,.04), 0 6px 24px rgba(0,0,0,.06);
--card-shadow-lg: 0 4px 12px rgba(0,0,0,.05), 0 16px 48px rgba(0,0,0,.08);
--card-hover:     0 8px 32px rgba(0,0,0,.08), 0 24px 64px rgba(0,0,0,.1);
```

### 4.6 Motion / Animações
```css
--ease:        cubic-bezier(.22,1,.36,1);       /* Padrão suave */
--ease-spring: cubic-bezier(.34,1.56,.64,1);    /* Elástico, interativo */
```

### 4.7 Gradiente de Texto (Marca)
```css
background: linear-gradient(100deg, #0A7B3E, #15B85C 55%, #06532A);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
```

### 4.8 Filosofia do Design System
> *"Light Professional · Deep Emerald · Financial Trust. No neon. No dark mode. Clean, trustworthy, premium."*

- ✅ Off-white quente como base (não branco frio)
- ✅ Verde esmeralda profundo (não neon, não lime)
- ✅ Tipografia com personalidade mas legível
- ✅ Sombras sutis e camadas de profundidade
- ❌ Sem dark mode
- ❌ Sem neon, gradientes chamativos ou elementos de fintech genérica
- ❌ Sem imagens de banco padrão (pessoas apontando pra tela)

---

## 5. RASTREAMENTO E ANALYTICS

| Plataforma | ID | Uso |
|---|---|---|
| Google Ads (GAds) | `AW-18226518834` | Conversões pagas |
| Meta Pixel | `1667309107949808` | Facebook / Instagram Ads |

> [!WARNING]
> Esses IDs devem estar presentes no `<head>` de **todas** as LPs. Nunca remover ou alterar.

---

## 6. ARQUITETURA TÉCNICA DAS LPs

### Estrutura de arquivos (por produto)
```
/[produto]/
  ├── index.html     ← Estrutura e conteúdo
  ├── style.css      ← Design system + estilos específicos
  └── assets/
       ├── hero-[produto].webp   ← Imagem hero
       ├── favicon.png
       └── og-image.png          ← Open Graph
```

### Repositórios
| Repo | Path | Versão |
|---|---|---|
| titanium-lps | `C:\Users\callo\.gemini\antigravity\scratch\titanium-lps` | v5 (atual) |
| titanium-lps-v6 | `C:\Users\callo\.gemini\antigravity\scratch\titanium-lps-v6` | v6 (paralela) |

### Régua de logos (parceiros/administradoras)
- Loop infinito, estrutura CSS com dois tracks duplicados
- `overflow: hidden` + `display: flex` + `animation: marquee-track`
- Logos: Porto Seguro · Embracon · Rodobens · [demais administradoras parceiras]

---

## 7. CÉREBRO DE COMUNICAÇÃO

### 7.1 Identidade Verbal

**Tom de Voz:** Sofisticado · Pragmático · Analítico · Discreto · Corporativo

**Léxico PROIBIDO** — Nunca usar:
- "Realize seu sonho"
- "Parcela que cabe no bolso"
- "Seu primeiro carro"
- "Compre sem juros"
- "Oportunidade imperdível"
- Qualquer coisa que soe a panfleto de varejo

**Léxico OBRIGATÓRIO — Titanium fala assim:**
- "Estruturar uma operação"
- "Alavancagem patrimonial"
- "Liquidez imediata"
- "Crédito já aprovado"
- "Inteligência financeira"
- "Proteção de capital"
- "Expansão de frota / portfólio"

### 7.2 Público-alvo por Segmento

| Segmento | Dor Principal | Argumento Titanium |
|---|---|---|
| Motorista de app | Paga R$2.700/mês de aluguel | "Esse valor já pagaria a parcela do seu consórcio" |
| Produtor rural | Necessita de maquinário sem travar caixa | "Alavancagem sem comprometer o capital de giro" |
| Empresário / CFO | Expansão de frota/ativo sem juros bancários | "Crédito estratégico com custo zero de juros" |
| Investidor imobiliário | Quer diversificar sem liquidez comprometida | "Carta contemplada como instrumento de arbitragem" |
| HNWI (aeronave/embarcação) | Não quer expor capital | "Aquisição de ativo premium com eficiência fiscal" |

### 7.3 Estrutura das LPs (Seções-padrão)

1. **NAV** — Logo + CTA sticky
2. **HERO** — Headline impactante + sub + CTA primário
3. **RÉGUA DE LOGOS** — Credibilidade (administradoras parceiras)
4. **PROBLEMA** — A dor do público em números
5. **SOLUÇÃO** — O que é consórcio / carta contemplada
6. **BENEFÍCIOS** — 4 anos de mercado · aprovação nas maiores administradoras
7. **DEPOIMENTOS** — Prova social com avatar + nome + cidade
8. **FAQ** — Objeções respondidas
9. **CTA FINAL** — Urgência + botão WhatsApp
10. **FOOTER** — Logo · Navegação · Contato · Aviso legal

### 7.4 Frases-âncora por produto

| Produto | Headline Principal |
|---|---|
| Uber | "Pare de pagar aluguel de carro" |
| Carta Contemplada | "Crédito contemplado já aprovado" |
| Caminhão | "Expanda sua frota sem juros bancários" |
| Imóvel | "Patrimônio real. Sem juros. Sem banco." |
| Agro | "Máquinas novas. Capital preservado." |
| Aeronave | "Operação aérea com inteligência financeira" |

---

## 8. REGRAS OPERACIONAIS

### Sempre verificar antes de publicar qualquer LP:
- [ ] WhatsApp correto: `+55 11 93004-8940`
- [ ] Instagram correto: `@titaniumconsultoriafinanceira`
- [ ] Link IG: `https://www.instagram.com/titaniumconsultoriafinanceira?igsh=MXY5c3N3Mm5naXR4bA==`
- [ ] Google Ads tag: `AW-18226518834`
- [ ] Meta Pixel: `1667309107949808`
- [ ] CNPJ no rodapé: `46.640.755/0001-51`
- [ ] Ano de copyright atualizado
- [ ] Régua de logos funcionando no mobile

### Ortografia crítica (erros históricos a evitar):
- ✅ "Carta Contemplada" — NÃO "comtemplada"
- ✅ "Crédito contemplado" — NÃO "crédito contemplado já aprovado" (repetição)
- ✅ "Cartas Contempladas" — NÃO "Cartas Comtempladas"

---

## 9. PRÓXIMAS INICIATIVAS MAPEADAS

| Iniciativa | Status | Prioridade |
|---|---|---|
| Automação WhatsApp (n8n + Z-API) | Planejamento | 🔴 Alta |
| Script de qualificação por produto | Pendente | 🔴 Alta |
| CRM de leads (Google Sheets / Airtable) | Pendente | 🟡 Média |
| Régua de nutrição (leads frios) | Pendente | 🟡 Média |
| Dossiê automático para atendente | Pendente | 🔴 Alta |

---

*Documento mantido por: Antigravity AI — Titanium Consultoria*
*Última atualização: Junho 2026*
