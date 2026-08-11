export type SegmentoCarta = "imoveis" | "veiculos" | "agro" | "outros";

export function normalizarTexto(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function normalizarSegmento(value: unknown): SegmentoCarta {
  const normalized = normalizarTexto(value);

  if (/imov|imobil|casa|apart|terreno|lote/.test(normalized)) return "imoveis";
  if (/veic|auto|carro|moto|frota|caminh/.test(normalized)) return "veiculos";
  if (/agro|agric|rural|maquina|pesad/.test(normalized)) return "agro";
  return "outros";
}

export function rotuloSegmento(value: unknown): string {
  const labels: Record<SegmentoCarta, string> = {
    imoveis: "Imóveis",
    veiculos: "Veículos",
    agro: "Agro",
    outros: "Outros",
  };
  return labels[normalizarSegmento(value)];
}
