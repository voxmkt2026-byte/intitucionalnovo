import * as XLSX from "xlsx";

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

export function parseSpreadsheetToCartas(dataBuffer: ArrayBuffer | string): ParsedCartaRow[] {
  try {
    let workbook: XLSX.WorkBook;
    if (typeof dataBuffer === "string") {
      workbook = XLSX.read(dataBuffer, { type: "string" });
    } else {
      workbook = XLSX.read(dataBuffer, { type: "array" });
    }

    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      return [];
    }

    // Selecionar a melhor aba (prioridade para abas com "Importação", "Cartas" ou a primeira aba)
    const targetSheetName =
      workbook.SheetNames.find(
        (name) =>
          name.toLowerCase().includes("import") ||
          name.toLowerCase().includes("carta") ||
          name.toLowerCase().includes("dados")
      ) || workbook.SheetNames[0];

    const worksheet = workbook.Sheets[targetSheetName];
    if (!worksheet) return [];

    const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });
    if (jsonRows.length === 0) return [];

    const results: ParsedCartaRow[] = [];

    for (const r of jsonRows) {
      const findVal = (keywords: string[]): any => {
        for (const k of Object.keys(r)) {
          const lk = k.toLowerCase().trim();
          if (keywords.some((kw) => lk.includes(kw))) return r[k];
        }
        return "";
      };

      const rawCredito = findVal(["crédito", "credito", "valor credito", "valor_credito", "valor total"]);
      const rawEntrada = findVal(["entrada", "valor entrada"]);
      const rawParcelas = findVal(["qtd. parcelas", "qtd_parcelas", "nº parcelas", "parcelas", "qtd"]);
      const rawValorParc = findVal(["valor da parcela", "valor_parcela", "por mês", "parcela (r$)"]);
      const rawAdmin = findVal(["administradora", "admin", "empresa", "banco"]);
      const rawVenc = findVal(["vencimento", "data"]);
      const rawObs = findVal(["observações", "observacoes", "obs", "status"]);
      const rawSeg = findVal(["segmento", "tipo"]);

      let credito = parseBRLNumber(rawCredito);
      let entrada = parseBRLNumber(rawEntrada);
      let parcelas = 60;
      let valor_parcela = parseBRLNumber(rawValorParc);
      let administradora = String(rawAdmin || "").trim() || "Caixa Consórcios";
      let vencimento_parcela = String(rawVenc || "").trim() || "Dia 15";
      let observacoes = String(rawObs || "").trim() || "Disponível";
      let segmento = String(rawSeg || "").trim();

      // Tratar parcelas no formato "42 x R$354,00" ou apenas número "42"
      const pStr = String(rawParcelas).toLowerCase().trim();
      if (pStr.includes("x")) {
        const parts = pStr.split("x");
        const parsedCount = parseInt(parts[0].replace(/\D/g, ""), 10);
        if (parsedCount > 0) parcelas = parsedCount;
        if (valor_parcela === 0) valor_parcela = parseBRLNumber(parts[1]);
      } else if (pStr) {
        const parsedCount = parseInt(pStr.replace(/\D/g, ""), 10);
        if (parsedCount > 0) parcelas = parsedCount;
      }

      // Se por algum motivo as colunas vieram sem nome padrão (ex: sem cabeçalho)
      if (credito === 0) {
        const cellVals = Object.values(r);
        const nums = cellVals.map((v) => parseBRLNumber(v)).filter((n) => n > 0);
        if (nums.length > 0) {
          nums.sort((a, b) => b - a);
          credito = nums[0];
          if (nums.length > 1 && nums[1] < credito && nums[1] > 1000) entrada = nums[1];
        }
      }

      if (credito > 0) {
        const isReservada =
          observacoes.toLowerCase().includes("reservad") ||
          observacoes.toLowerCase().includes("vendid") ||
          observacoes === "0" ||
          observacoes === "false";

        if (!segmento) {
          segmento = credito >= 180000 ? "imoveis" : "veiculos";
        } else {
          segmento = segmento.toLowerCase().includes("veíc") || segmento.toLowerCase().includes("veic") || segmento.toLowerCase().includes("car") || segmento.toLowerCase().includes("moto")
            ? "veiculos"
            : "imoveis";
        }

        results.push({
          credito,
          entrada,
          parcelas: parcelas || 60,
          valor_parcela: valor_parcela || Math.round((credito - entrada) / (parcelas || 60)),
          taxa_transferencia: String(r["TAXA DE TRANSFERÊNCIA"] || r["taxa_transferencia"] || "R$ 0,00"),
          administradora,
          vencimento_parcela,
          observacoes,
          segmento,
          disponivel: !isReservada,
        });
      }
    }

    return results;
  } catch (err) {
    console.error("[parseSpreadsheetToCartas error]", err);
    return [];
  }
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
