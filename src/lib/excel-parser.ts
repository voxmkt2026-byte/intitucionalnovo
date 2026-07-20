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
 * Formata qualquer formato de data ou texto de vencimento para o formato de data completa DD/MM/AAAA.
 * Exemplos:
 * "15/07/2026" -> "15/07/2026"
 * "Dia 15"     -> "15/08/2026"
 * "15"         -> "15/08/2026"
 */
export function formatVencimentoDate(raw: any): string {
  if (raw == null) return "15/08/2026";
  const str = String(raw).trim();
  if (!str) return "15/08/2026";

  // Se já for uma data completa no formato DD/MM/AAAA
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const parts = str.split("/");
    const d = parts[0].padStart(2, "0");
    const m = parts[1].padStart(2, "0");
    return `${d}/${m}/${parts[2]}`;
  }

  // Se vier como "Dia 15", "15" ou "Dia 10", converte para formato data completa
  const dayMatch = str.match(/\d+/);
  if (dayMatch) {
    const day = dayMatch[0].padStart(2, "0");
    const now = new Date();
    let m = now.getMonth() + 2; // próximo vencimento
    let y = now.getFullYear();
    if (m > 12) {
      m = 1;
      y += 1;
    }
    const monthStr = String(m).padStart(2, "0");
    return `${day}/${monthStr}/${y}`;
  }

  return str;
}

/**
 * Converte qualquer valor numérico ou string formatada em Real (BRL) para um número (float).
 */
export function parseBRLNumber(raw: any): number {
  if (raw == null) return 0;
  if (typeof raw === "number") return raw;
  let str = String(raw).trim();
  if (!str) return 0;

  str = str.replace(/[R$\s"']/gi, "").trim();

  if (str.includes(".") && str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(",")) {
    str = str.replace(",", ".");
  } else if (str.includes(".")) {
    const parts = str.split(".");
    if (parts.length > 1 && parts.every((p, idx) => idx === 0 || p.length === 3)) {
      str = parts.join("");
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

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
      let vencimento_parcela = formatVencimentoDate(rawVenc);
      let observacoes = String(rawObs || "").trim() || "Disponível";
      let segmento = String(rawSeg || "").trim();

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

export function exportCartasToCSV(cartas: any[]) {
  if (!cartas || cartas.length === 0) return;

  const headers = [
    "Crédito",
    "Entrada",
    "Parcelas",
    "Taxa de Transferência",
    "Administradora",
    "Vencimento da Parcela",
    "Observações / Status",
  ];

  const rows = cartas.map((c) => [
    c.valor_credito,
    c.entrada ?? 0,
    `${c.parcelas}x de R$ ${c.valor_parcela}`,
    c.taxa_transferencia || "R$ 0,00",
    c.administradora,
    formatVencimentoDate(c.vencimento_parcela || c.proximo_vencimento),
    c.observacoes || (c.disponivel ? "Disponível" : "Reservada"),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `cartas_contempladas_titanium_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
