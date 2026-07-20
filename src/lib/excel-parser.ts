export interface ParsedCartaRow {
  credito: number;
  entrada: number;
  parcelas: number;
  valor_parcela: number;
  taxa_transferencia: string;
  administradora: string;
  vencimento_parcela: string;
  observacoes: string;
  segmento: string;
  disponivel: boolean;
}

/**
 * Converte qualquer valor numérico ou string formatada em Real (BRL) para um número (float).
 * Exemplos:
 * "R$ 97.800,00" -> 97800
 * "97.800"       -> 97800
 * "5.605,00"     -> 5605
 * "5.605"        -> 5605
 * "197,50"       -> 197.5
 */
export function parseBRLNumber(raw: any): number {
  if (raw == null) return 0;
  if (typeof raw === "number") return raw;
  let str = String(raw).trim();
  if (!str) return 0;

  // Remover símbolos de moeda, espaços, aspas
  str = str.replace(/[R$\s"']/gi, "").trim();

  // Se a string contém ponto E vírgula (ex: "97.800,50")
  if (str.includes(".") && str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(",")) {
    // Apenas vírgula (ex: "97800,50" ou "197,00")
    str = str.replace(",", ".");
  } else if (str.includes(".")) {
    // Apenas ponto (ex: "97.800" ou "5.605" ou "200.000")
    const parts = str.split(".");
    // Se as partes seguem o padrão de milhar (.800, .605, .000)
    if (parts.length > 1 && parts.every((p, idx) => idx === 0 || p.length === 3)) {
      str = parts.join("");
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

const KNOWN_ADMINS = [
  "caixa", "bradesco", "itaú", "itau", "banco do brasil", "bb", "porto", "porto seguro",
  "sicredi", "santander", "ademicon", "rodobens", "hs", "embracon", "safra", "simplebank"
];

export function parseCSVToCartas(csvText: string): ParsedCartaRow[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Verificar se a primeira linha é cabeçalho ou se já são dados
  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    firstLine.includes("crédito") ||
    firstLine.includes("credito") ||
    firstLine.includes("entrada") ||
    firstLine.includes("parcela") ||
    firstLine.includes("admin") ||
    firstLine.includes("empresa") ||
    firstLine.includes("vencimento");

  const headers = hasHeader
    ? lines[0].split(/[,;\t]/).map((h) => h.replace(/["']/g, "").trim().toLowerCase())
    : [];

  const startIdx = hasHeader ? 1 : 0;
  const results: ParsedCartaRow[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (!cols || cols.length === 0) continue;

    let credito = 0;
    let entrada = 0;
    let parcelas = 60;
    let valor_parcela = 0;
    let taxa_transferencia = "R$ 0,00";
    let administradora = "Caixa Consórcios";
    let vencimento_parcela = "Dia 10";
    let observacoes = "Disponível";

    if (hasHeader && headers.length > 0) {
      // 1. Mapeamento por Nomes de Cabeçalho (Header Search)
      const idxCredito = headers.findIndex((h) => h.includes("crédito") || h.includes("credito") || h.includes("valor total") || h.includes("valor_credito"));
      const idxEntrada = headers.findIndex((h) => h.includes("entrada"));
      const idxParcelas = headers.findIndex((h) => h.includes("parcela") || h.includes("qtd") || h.includes("nº"));
      const idxTaxa = headers.findIndex((h) => h.includes("taxa") || h.includes("transferência") || h.includes("transferencia"));
      const idxAdmin = headers.findIndex((h) => h.includes("admin") || h.includes("empresa") || h.includes("banco") || h.includes("grupo"));
      const idxVenc = headers.findIndex((h) => h.includes("vencimento") || h.includes("data"));
      const idxObs = headers.findIndex((h) => h.includes("obs") || h.includes("status") || h.includes("reserva"));

      if (idxCredito >= 0 && cols[idxCredito]) credito = parseBRLNumber(cols[idxCredito]);
      if (idxEntrada >= 0 && cols[idxEntrada]) entrada = parseBRLNumber(cols[idxEntrada]);

      if (idxParcelas >= 0 && cols[idxParcelas]) {
        const rawP = cols[idxParcelas];
        if (rawP.toLowerCase().includes("x")) {
          const parts = rawP.toLowerCase().split("x");
          parcelas = parseInt(parts[0].replace(/\D/g, ""), 10) || 60;
          valor_parcela = parseBRLNumber(parts[1]);
        } else {
          parcelas = parseInt(rawP.replace(/\D/g, ""), 10) || 60;
        }
      }

      if (idxTaxa >= 0 && cols[idxTaxa]) taxa_transferencia = cols[idxTaxa].trim();
      if (idxAdmin >= 0 && cols[idxAdmin]) administradora = cols[idxAdmin].trim();
      if (idxVenc >= 0 && cols[idxVenc]) vencimento_parcela = cols[idxVenc].trim();
      if (idxObs >= 0 && cols[idxObs]) observacoes = cols[idxObs].trim();
    }

    // 2. Se a análise por cabeçalho não capturou Crédito ou Administradora, aplicar Detecção Heurística Inteligente
    if (credito === 0 || administradora === "Caixa Consórcios") {
      const numbers: number[] = [];
      const strings: string[] = [];

      for (let j = 0; j < cols.length; j++) {
        const cell = cols[j].trim();
        if (!cell) continue;

        // Verificar se contém Administradora conhecida
        const lowerCell = cell.toLowerCase();
        if (KNOWN_ADMINS.some((a) => lowerCell.includes(a))) {
          administradora = cell;
          continue;
        }

        // Verificar se é texto de observação
        if (lowerCell.includes("disponív") || lowerCell.includes("disponiv") || lowerCell.includes("reservad") || lowerCell.includes("vendid")) {
          observacoes = cell;
          continue;
        }

        // Verificar se é formato "120x R$ 1.850" ou "19x 5605"
        if (lowerCell.includes("x")) {
          const parts = lowerCell.split("x");
          const pCount = parseInt(parts[0].replace(/\D/g, ""), 10);
          const pVal = parseBRLNumber(parts[1]);
          if (pCount > 0) parcelas = pCount;
          if (pVal > 0) valor_parcela = pVal;
          continue;
        }

        const numVal = parseBRLNumber(cell);
        if (numVal > 0) {
          numbers.push(numVal);
        } else {
          strings.push(cell);
        }
      }

      // Atribuir números encontrados por magnitude
      if (credito === 0 && numbers.length > 0) {
        numbers.sort((a, b) => b - a); // Ordenar do maior para o menor
        credito = numbers[0]; // Maior valor é o Crédito

        // Se o segundo maior for significativamente grande (ex: > 10.000) e menor que crédito, é a Entrada
        if (numbers.length > 1 && numbers[1] < credito && numbers[1] > 1000) {
          if (entrada === 0) entrada = numbers[1];
        }

        // Se houver valor na faixa de parcelas (ex: 500 a 15.000)
        const possibleParcelaVal = numbers.find((n) => n > 200 && n < 25000 && n !== entrada && n !== credito);
        if (possibleParcelaVal && valor_parcela === 0) {
          valor_parcela = possibleParcelaVal;
        }

        // Se houver número inteiro pequeno (12 a 240), é a quantidade de parcelas
        const possibleParcelasCount = numbers.find((n) => Number.isInteger(n) && n >= 12 && n <= 300);
        if (possibleParcelasCount && (parcelas === 60 || parcelas === 1)) {
          parcelas = possibleParcelasCount;
        }
      }
    }

    if (credito > 0) {
      const isReservada = observacoes.toLowerCase().includes("reservad") || observacoes.toLowerCase().includes("vendid");
      results.push({
        credito,
        entrada,
        parcelas: parcelas || 60,
        valor_parcela: valor_parcela || Math.round((credito - entrada) / (parcelas || 60)),
        taxa_transferencia: taxa_transferencia || "R$ 0,00",
        administradora: administradora || "Outra",
        vencimento_parcela: vencimento_parcela || "Dia 10",
        observacoes: observacoes || "Disponível",
        segmento: credito >= 180000 ? "imoveis" : "veiculos",
        disponivel: !isReservada,
      });
    }
  }

  return results;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if ((char === "," || char === ";" || char === "\t") && !inQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ""));
  return result;
}

export function exportCartasToCSV(cartas: any[]): void {
  const headers = [
    "Crédito",
    "Entrada",
    "Parcelas",
    "Taxa de Transferência",
    "Administradora",
    "Vencimento da Parcela",
    "Observações / Status",
    "Segmento",
  ];

  const rows = cartas.map((c) => [
    `R$ ${Number(c.valor_credito || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    `R$ ${Number(c.entrada || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    `${c.parcelas || 0}x R$ ${Number(c.valor_parcela || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    c.taxa_transferencia || "R$ 0,00",
    c.administradora || "Outra",
    c.vencimento_parcela || c.proximo_vencimento || "Dia 10",
    c.observacoes || (c.disponivel ? "Disponível" : "Reservada"),
    c.segmento || "imoveis",
  ]);

  const csvContent =
    "\uFEFF" +
    [headers.join(";"), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(";"))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `cartas_contempladas_titanium_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
