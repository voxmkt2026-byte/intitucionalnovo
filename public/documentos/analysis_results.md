# Relatório de Auditoria por Evidências — Titanium Consultoria

Este documento apresenta a auditoria técnica e regulatória realizada nas 11 landing pages (LPs) da Titanium Consultoria, estruturado conforme o padrão de raciocínio orientado a evidências e impacto financeiro.

---

## 1. Veredito

**As landing pages estão em nível estético e de copy profissional de alta conversão, mas NÃO estão prontas para receber tráfego pago.** O lançamento está bloqueado (P0) devido à ausência de códigos reais de rastreamento (Pixel e GTM) e à presença de alegações de alto risco regulatório (promessas de aprovação e prazos de contemplação) que violam as regras do Banco Central e podem causar banimento imediato de contas de anúncios no Meta Ads e Google Ads.

---

## 2. O que está bom

- **Estrutura de Conversão**: Fluxo WhatsApp-first enxuto e bem desenhado, com barra de progresso no topo, sticky CTA responsivo no mobile e quebra progressiva de objeções.
- **Integração de Contatos**: CNPJ (`46.640.755/0001-51`), Telefone/WhatsApp (`(11) 95101-4269`), E-mail (`contato@titaniumconsultoria.com.br`) e Instagram (`@titaniumconsultoria`) estão 100% consistentes e corretos em todas as 11 páginas.
- **Qualidade e Semântica do HTML**: Código limpo, com exatamente um único tag `<h1>` por página (otimizado para SEO) e sem IDs duplicados.
- **Tipografia Consistente**: O Sora foi completamente removido e substituído por `Plus Jakarta Sans` em todas as folhas de estilos (`style.css`), trazendo maior suavidade e sofisticação às fontes.
- **Contextualização de WhatsApp e Testemunhos**: Mensagens do WhatsApp pré-preenchidas e textos de depoimentos são 100% contextualizados por nicho de atuação (ex. trator para agrícola, caminhão para fretes).

---

## 3. Bloqueadores (P0 — Não lançar sem corrigir)

### A. Rastreamento Inexistente (Zero Tracking)
Todas as páginas contêm apenas scripts com IDs de placeholders genéricos. O lançamento sem IDs válidos fará com que as campanhas rodem "às cegas", impedindo a otimização de conversão.

| Elemento | Código Identificado | Arquivos Afetados | Ação Necessária |
| :--- | :--- | :--- | :--- |
| **Google Tag Manager** | `GTM-XXXXXXX` | Todas as 11 páginas | Substituir pelo ID do contêiner GTM real |
| **Meta Pixel** | `XXXXXXXXXX` | Todas as 11 páginas | Substituir pelo ID do Pixel do Facebook real |

### B. Claims de Alto Risco Regulatório (Bacen / CDC / Ads)
Foram identificadas promessas de "aprovação garantida" e prazos explícitos para liberação/contemplação. As normas do Banco Central do Brasil (Lei 11.795/2008) e as diretrizes do Meta/Google Ads proíbem estritamente promessas de contemplação rápida ou aprovação garantida. Há também contradição direta com o disclaimer legal do rodapé.

> [!CAUTION]
> **Contradição Interna Detectada:** O rodapé de todas as LPs afirma legalmente que a Titanium *não constitui promessa de contemplação, aprovação ou rentabilidade futura*. No entanto, o topo das páginas promete o oposto.

*Evidências extraídas por script:*

1. **Aprovação Garantida (Uber):**
   - *Claim:* `"Aprovação com grandes instituições. Carta garantida."`
   - *Risco:* Não existe aprovação garantida; a administradora realiza análise de crédito no momento da contemplação.
2. **Prazos de Liberação Explícitos (Carta Contemplada, Aeronaves, Terrenos):**
   - *Aeronaves:* `"Processo em 45 dias."`
   - *Carta Contemplada:* `"Crédito aprovado em 15 dias"`, `"Crédito aprovado em até 3 dias úteis."`
   - *Terrenos Agrícolas:* `"processo em 30 dias."`
   - *Risco:* A transferência de titularidade de cotas contempladas depende da aprovação burocrática da administradora, inviabilizando garantias exatas de prazo.
3. **Garantia de Valorização (Terrenos Agrícolas):**
   - *Claim:* `"Valorização garantida"`
   - *Risco:* Promessa de rentabilidade financeira futura garantida sem disclaimer de volatilidade de mercado.

---

## 4. Melhorias Recomendadas (P1 — Lança, mas sangra)

### A. Peso dos Assets (LCP Lento)
Vários assets de fundo (Hero) possuem tamanho de arquivo elevado (> 600 KB), o que aumenta consideravelmente o tempo de carregamento da página no mobile 3G/4G, reduzindo a pontuação no leilão de anúncios e encarecendo o CPC.

*Evidências de peso em disco:*
- `terrenos-construcao/assets/hero-terreno-urbano.png` (**1.01 MB**)
- `placas-solares/assets/hero-solar.png` (**960.2 KB**)
- `uber/assets/driver-success.png` (**937.9 KB**)
- `terrenos-agricolas/assets/hero-terreno-agricola.png` (**903.9 KB**)
- `caminhao/assets/hero-caminhao.png` (**899.5 KB**)

### B. Reciclagem de Avatares (Consistência de Prova Social)
Embora os depoimentos de texto sejam personalizados por nicho, as imagens correspondentes dos avatares de clientes são cópias exatas rebatizadas com outros nomes e profissões. Um usuário atento que navegue por duas LPs notará a mesma pessoa com identidades diferentes.

*Evidências de hashes MD5 idênticos:*
- **Avatar 1** (Wellington Silva na LP Uber / Patrícia Santos na LP Carta Contemplada)
- **Avatar 2** (Ricardo Mendes na LP Carro Luxo / Thiago Oliveira na LP Carta Comum)
- **Avatar 3** (José Carlos na LP Caminhão / Fernando Costa na LP Embarcação)
- **Avatar 4** (Antônio Ferreira na LP Máquinas Agrícolas / Sebastião Lima na LP Placas Solares)
- **Avatar 5** (Eduardo Prado na LP Aeronaves / Marcos Ribeiro na LP Terrenos Agrícolas)

---

## 5. Polimento Técnico (P2 — Manutenção)

### A. Imagens Órfãs (Uber)
O diretório `uber/assets/` contém quatro imagens pesadas não utilizadas em nenhum local do código, inflando desnecessariamente o pacote de publicação e o espaço em servidor.

*Evidências de arquivos órfãos:*
- `driver-success.png` (937.9 KB)
- `driver-working.png` (829.3 KB)
- `hero.png` (798.0 KB)
- `car.png` (483.3 KB)
*Total de espaço desperdiçado:* **3.05 MB**

---

## 6. Status por Landing Page

| Landing Page | Segmento | Status | Bloqueadores Ativos |
| :--- | :--- | :--- | :--- |
| **aeronaves** | Aeronaves | 🔴 Bloqueada | GTM/Pixel Placeholders, Claim de Prazo (45 dias) |
| **caminhao** | Caminhões | 🔴 Bloqueada | GTM/Pixel Placeholders |
| **carro-luxo** | Carros de Luxo | 🔴 Bloqueada | GTM/Pixel Placeholders |
| **carta-comum** | Consórcio Comum | 🔴 Bloqueada | GTM/Pixel Placeholders |
| **carta-contemplada** | Cartas Contempladas | 🔴 Bloqueada | GTM/Pixel Placeholders, Claim de Prazo (3/15 dias) |
| **embarcacao** | Embarcações / Náutico | 🔴 Bloqueada | GTM/Pixel Placeholders |
| **maquinas-agricolas** | Máquinas Agrícolas | 🔴 Bloqueada | GTM/Pixel Placeholders |
| **placas-solares** | Energia Solar | 🔴 Bloqueada | GTM/Pixel Placeholders |
| **terrenos-agricolas** | Fazendas / Agro | 🔴 Bloqueada | GTM/Pixel Placeholders, Claim de Prazo (30 dias) e Valorização Garantida |
| **terrenos-construcao** | Lotes / Construção | 🔴 Bloqueada | GTM/Pixel Placeholders |
| **uber** | Motoristas de App | 🔴 Bloqueada | GTM/Pixel Placeholders, Claim de Aprovação ("Carta Garantida") |

---

## 7. Próximo Passo Único

> [!TIP]
> Para liberar o tráfego pago com segurança, você precisa **fornecer os IDs reais do Google Tag Manager (GTM) e do Meta Pixel**.
> 
> Com esses dados em mãos, eu posso:
> 1. Executar a substituição automatizada dos IDs em todas as 11 LPs.
> 2. Suavizar e adequar juridicamente as promessas regulatórias de P0 (Ex: ajustar de *"Carta garantida"* para *"Apoio na aprovação"*, e de *"Aprovado em 3 dias"* para *"Agilidade no processo"*).
> 3. Deletar os 3.05 MB de imagens órfãs na pasta Uber para otimizar o servidor.
