# Google Sheets — Script para Captura de Leads do Simulador

## Passo 1: Criar a Planilha

1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie uma nova planilha chamada **"Leads Titanium"**
3. Na **linha 1**, coloque estes cabeçalhos:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Data/Hora | Nome | Email | WhatsApp | Segmento | Valor Crédito | Prazo (meses) | Plano | Origem |

## Passo 2: Criar o Apps Script

1. Na planilha, vá em **Extensões → Apps Script**
2. **Apague** todo o código existente
3. **Cole** o código abaixo:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.segment || '',
      data.credit || '',
      data.months || '',
      data.plan || '',
      data.origin || 'simulador'
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Webhook ativo' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Passo 3: Implantar como Web App

1. Clique em **Implantar → Nova implantação**
2. Em "Tipo", selecione **App da Web**
3. Configurações:
   - **Descrição**: Webhook Leads Titanium
   - **Executar como**: Eu (seu email)
   - **Quem tem acesso**: **Qualquer pessoa**
4. Clique em **Implantar**
5. **Autorize** o acesso quando solicitado
6. **Copie a URL** que aparece (será algo como: `https://script.google.com/macros/s/AKfycb.../exec`)

## Passo 4: Colar a URL no Código

> [!IMPORTANT]
> Depois de copiar a URL do Apps Script, cole ela aqui no chat para eu atualizar o código do simulador.

A URL será algo como:
```
https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec
```
