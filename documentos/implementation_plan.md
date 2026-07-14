# Implementação de ROI, ROAS e Rastreio de Vendas

Atualmente, o `% de conversão` que você vê na tabela refere-se ao **CTR** (Click-Through Rate), ou seja, a porcentagem de pessoas que viram o anúncio e clicaram nele. Ele mede a qualidade do anúncio, mas não mede as vendas.

Para calcular a Conversão Real, ROI e ROAS, precisamos conectar os gastos da campanha com o que **realmente entrou de dinheiro** na empresa.

## Como vai funcionar?

1. **Aba de Leads:** Quando um lead comprar o consórcio, você vai abrir o cadastro dele, mudar o Status para `Vendido` e preencher um novo campo: **Valor da Venda (Receita/Revenue)**.
2. **Aba de Campanhas:** O sistema vai somar todas as vendas geradas por cada campanha específica e cruzar com o Gasto (Spend) que puxamos do Google e do Meta.

## O que será entregue nesta atualização:

### 1. Banco de Dados (Leads)
- [NEW] Adicionar uma nova coluna `revenue` (numérica) na tabela de Leads no NeonDB de forma automática.
- [MODIFY] Atualizar as rotas da API (`/api/admin/leads` e `/api/admin/leads/[id]`) para salvar e retornar esse valor.

### 2. Interface de Leads (CRM)
- [MODIFY] No `LeadDrawer.tsx` (quando você clica para ver os detalhes do lead), vamos adicionar um campo monetário (R$) chamado **"Valor da Venda (Receita)"**. Ele só será obrigatório/relevante se o status for marcado como `Vendido`.

### 3. API de Campanhas (Google & Meta)
- [MODIFY] Os endpoints `/api/admin/google-insights` e `/api/admin/meta-insights` passarão a somar a coluna `revenue` de todos os leads `Vendidos` daquela campanha.
- Eles retornarão dois novos dados: 
  - **ROAS:** Retorno sobre o Gasto com Anúncios (Ex: 5.5x) -> `(Receita / Gasto)`.
  - **ROI:** Retorno sobre Investimento (%) -> `((Receita - Gasto) / Gasto) * 100`.

### 4. Tabela de Campanhas (Dashboard)
- [MODIFY] `CampaignTable.tsx` receberá duas novas colunas: **Receita** (R$) e **ROAS**.
- [MODIFY] Os cartões (Cards) no topo da tela passarão a mostrar o **ROI Global** e a **Receita Total** das campanhas, tirando o foco apenas de cliques/impressões e colocando o foco no dinheiro que volta.

---

> [!IMPORTANT]
> **Aprovação Necessária:**
> Clique no botão **Proceed/Aprovar** para eu alterar o banco de dados e aplicar essa grande atualização no CRM e no Dashboard!
