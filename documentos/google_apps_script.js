// ══════════════════════════════════════════════════════════
// TITANIUM GOOGLE APPS SCRIPT — Ciclo Infinito de Dados v2
// ATUALIZADO: gclid na aba Leads + fix de colunas
// Cole em: Google Sheets → Extensões → Apps Script
// Publique como Web App (Executar como: Eu, Acesso: Qualquer pessoa)
// ══════════════════════════════════════════════════════════

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    return processData(data);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // Fallback: alguns clientes enviam como GET com payload
    var payload = e.parameter.payload;
    if (payload) {
      var data = JSON.parse(payload);
      return processData(data);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', version: '2.0' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function processData(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = data.sheet || 'Leads';
  if (sheetName === 'Cliques') {
    writeCliques(ss, data);
  } else {
    writeLeads(ss, data);
  }
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function writeLeads(ss, data) {
  var sheet = ss.getSheetByName('Leads');
  if (!sheet) {
    sheet = ss.insertSheet('Leads');
    sheet.appendRow([
      'timestamp', 'nome', 'telefone', 'email', 'segmento',
      'credito', 'plano', 'origem', 'ref', 'status', 'valor', 'gclid'
    ]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#0A7B3E').setFontColor('white');
    sheet.setFrozenRows(1);
  }

  // Verifica se gclid já existe como coluna (compatibilidade com planilha existente)
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var gclidCol = headers.indexOf('gclid');
  if (gclidCol === -1) {
    // Adiciona coluna gclid se não existir
    var nextCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, nextCol).setValue('gclid').setFontWeight('bold').setBackground('#0A7B3E').setFontColor('white');
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.name || '',
    data.phone || '',
    data.email || '',
    data.segment || '',
    data.credit || '',
    data.plan || '',
    data.origin || data.lp || '',
    data.ref || '',
    'Novo',           // status padrão
    '',               // valor (preenchido manualmente)
    data.gclid || ''
  ]);

  // Dropdown de status na coluna 10 (J)
  var lastRow = sheet.getLastRow();
  var statusCell = sheet.getRange(lastRow, 10);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Novo', 'Qualificado', 'Vendido', 'Perdido'], true)
    .setAllowInvalid(false)
    .setHelpText('Status do lead')
    .build();
  statusCell.setDataValidation(rule);
}

function writeCliques(ss, data) {
  var sheet = ss.getSheetByName('Cliques');
  if (!sheet) {
    sheet = ss.insertSheet('Cliques');
    sheet.appendRow([
      'ref', 'timestamp', 'fbc', 'fbp', 'gclid',
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'lp'
    ]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#1a1a1a').setFontColor('white');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    data.ref || '',
    data.timestamp || new Date().toISOString(),
    data.fbc || '',
    data.fbp || '',
    data.gclid || '',
    data.utm_source || '',
    data.utm_medium || '',
    data.utm_campaign || '',
    data.utm_content || '',
    data.lp || ''
  ]);
}

// ── FUNÇÕES DE TESTE (rodar direto no Apps Script) ──

function testeLeads() {
  var mockEvent = {
    postData: {
      contents: JSON.stringify({
        sheet: "Leads",
        name: "Teste Script v2",
        email: "teste@titanium.com.br",
        phone: "(11) 99999-0000",
        segment: "imovel",
        credit: "300000",
        plan: "carta-contemplada",
        origin: "cartas-contempladas",
        ref: "tf_teste_" + Date.now(),
        gclid: "GCLID_TEST_SCRIPT",
        utm_source: "google",
        utm_campaign: "teste_script",
        timestamp: new Date().toISOString()
      })
    }
  };
  var result = doPost(mockEvent);
  Logger.log(result.getContent());
}

function testeCliques() {
  var mockEvent = {
    postData: {
      contents: JSON.stringify({
        sheet: "Cliques",
        ref: "tf_teste_" + Date.now(),
        gclid: "GCLID_TEST_CLIQUE",
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "imovel_teste",
        lp: "cartas-contempladas",
        timestamp: new Date().toISOString()
      })
    }
  };
  var result = doPost(mockEvent);
  Logger.log(result.getContent());
}
