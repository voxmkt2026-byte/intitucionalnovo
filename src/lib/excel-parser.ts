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

export function parseCSVToCartas(csvText: string): ParsedCartaRow[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = lines[0].toLowerCase().split(/[,;\t]/).map((h) => h.replace(/["']/g, "").trim());
  
  // Find column indexes
  const colCredito = headers.findIndex((h) => h.includes("crédito") || h.includes("credito") || h.includes("valor"));
  const colEntrada = headers.findIndex((h) => h.includes("entrada"));
  const colParcelas = headers.findIndex((h) => h.includes("parcela"));
  const colTaxa = headers.findIndex((h) => h.includes("taxa") || h.includes("transferência") || h.includes("transferencia"));
  const colAdmin = headers.findIndex((h) => h.includes("admin") || h.includes("empresa") || h.includes("banco"));
  const colVencimento = headers.findIndex((h) => h.includes("vencimento") || h.includes("data"));
  const colObs = headers.findIndex((h) => h.includes("obs") || h.includes("status") || h.includes("reserva"));

  const results: ParsedCartaRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (!cols || cols.length === 0) continue;

    const creditoRaw = colCredito >= 0 ? cols[colCredito] : cols[0] || "0";
    const entradaRaw = colEntrada >= 0 ? cols[colEntrada] : cols[1] || "0";
    const parcelasRaw = colParcelas >= 0 ? cols[colParcelas] : cols[2] || "0";
    const taxaRaw = colTaxa >= 0 ? cols[colTaxa] : cols[3] || "R$ 0,00";
    const adminRaw = colAdmin >= 0 ? cols[colAdmin] : cols[4] || "Outra";
    const vencimentoRaw = colVencimento >= 0 ? cols[colVencimento] : cols[5] || "Dia 10";
    const obsRaw = colObs >= 0 ? cols[colObs] : cols[6] || "Disponível";

    // Parse numeric credit
    const credito = parseFloat(creditoRaw.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
    const entrada = parseFloat(entradaRaw.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;

    // Parse parcelas: format like "120x R$ 1.850" or "120"
    let numParcelas = 60;
    let valorParcela = 0;
    if (parcelasRaw.toLowerCase().includes("x")) {
      const parts = parcelasRaw.toLowerCase().split("x");
      numParcelas = parseInt(parts[0].replace(/\D/g, ""), 10) || 60;
      valorParcela = parseFloat(parts[1].replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
    } else {
      numParcelas = parseInt(parcelasRaw.replace(/\D/g, ""), 10) || 60;
    }

    if (credito > 0) {
      const isReservada = obsRaw.toLowerCase().includes("reservad") || obsRaw.toLowerCase().includes("vendid");
      results.push({
        credito,
        entrada,
        parcelas: numParcelas,
        valor_parcela: valorParcela,
        taxa_transferencia: taxaRaw.trim() || "R$ 0,00",
        administradora: adminRaw.trim() || "Outra",
        vencimento_parcela: vencimentoRaw.trim() || "Dia 10",
        observacoes: obsRaw.trim() || "Disponível",
        segmento: credito > 180000 ? "imoveis" : "veiculos",
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
    } else if ((char === ',' || char === ';' || char === '\t') && !inQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''));
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
