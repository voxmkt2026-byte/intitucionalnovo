import { NextResponse } from "next/server";
import { listarCartasDisponiveis } from "@/features/cartas/data/repository";
import { normalizarSegmento, normalizarTexto } from "@/features/cartas/domain/segmento";
import type { CartaDTO } from "@/features/cartas/domain/types";

const PAGE_SIZE = 20;

type SortField = "valor_credito" | "entrada" | "parcelas" | "valor_parcela" | "administradora";

function numberParam(params: URLSearchParams, key: string): number {
  const value = Number(params.get(key));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function compare(field: SortField, direction: "asc" | "desc") {
  const multiplier = direction === "desc" ? -1 : 1;
  return (left: CartaDTO, right: CartaDTO) => {
    const a = left[field] ?? 0;
    const b = right[field] ?? 0;
    if (typeof a === "string" && typeof b === "string") return a.localeCompare(b, "pt-BR") * multiplier;
    return (Number(a) - Number(b)) * multiplier;
  };
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const segmento = params.get("segmento") || "";
    const administradora = normalizarTexto(params.get("administradora"));
    const valorMin = numberParam(params, "valor_min");
    const valorMax = numberParam(params, "valor_max");
    const entradaMin = numberParam(params, "entrada_min");
    const entradaMax = numberParam(params, "entrada_max");
    const page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1);
    const requestedSort = params.get("sort") || "valor_credito";
    const allowedSort: SortField[] = ["valor_credito", "entrada", "parcelas", "valor_parcela", "administradora"];
    const sort = allowedSort.includes(requestedSort as SortField) ? requestedSort as SortField : "valor_credito";
    const direction = params.get("dir") === "desc" ? "desc" : "asc";

    const all = await listarCartasDisponiveis();
    const filtered = all.filter((carta) => {
      if (segmento && carta.segmento !== normalizarSegmento(segmento)) return false;
      if (administradora && normalizarTexto(carta.administradora) !== administradora) return false;
      if (valorMin && carta.valor_credito < valorMin) return false;
      if (valorMax && carta.valor_credito > valorMax) return false;
      if (entradaMin && (carta.entrada ?? 0) < entradaMin) return false;
      if (entradaMax && (carta.entrada ?? 0) > entradaMax) return false;
      return true;
    }).sort(compare(sort, direction));

    const total = filtered.length;
    const offset = (page - 1) * PAGE_SIZE;
    const data = filtered.slice(offset, offset + PAGE_SIZE);
    const segmentos = Array.from(new Set(all.map((carta) => carta.segmento))).sort();
    const administradoras = Array.from(new Set(all.map((carta) => carta.administradora))).sort((a, b) => a.localeCompare(b, "pt-BR"));

    return NextResponse.json({
      data,
      meta: { total, page, limit: PAGE_SIZE, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) },
      filters: { segmentos, administradoras },
    });
  } catch (error) {
    console.error("[/api/cartas] erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
