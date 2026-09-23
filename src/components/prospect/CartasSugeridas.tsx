"use client";

import { useEffect, useState } from "react";
import CartaCard, { type Carta } from "@/components/CartaCard";
import type { ProspectSegment } from "@/features/prospects/domain/types";

export default function CartasSugeridas({ segmento, credito }: { segmento: ProspectSegment; credito: number }) {
  const [cartas, setCartas] = useState<Carta[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      segmento: segmento === "imovel" ? "imoveis" : "veiculos",
      valor_min: String(0.7 * credito), valor_max: String(1.3 * credito),
      limit: "3", sort: "valor_credito", dir: "asc",
    });
    async function load() {
      try {
        const response = await fetch(`/api/cartas/?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("cards_failed");
        const body = await response.json();
        const data: Carta[] = Array.isArray(body.data) ? body.data : [];
        if (!controller.signal.aborted) setCartas(data.filter((carta) => carta.disponivel && !/vendid|reservad/i.test(carta.status_cota || "")).slice(0, 3));
      } catch { if (!controller.signal.aborted) setCartas([]); }
    }
    void load();
    return () => controller.abort();
  }, [segmento, credito]);
  if (cartas.length === 0) return null;
  return (
    <section aria-labelledby="prospect-cards-title" className="space-y-5">
      <h2 id="prospect-cards-title" className="text-2xl font-bold text-slate-900">Opções disponíveis hoje</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cartas.map((carta) => <CartaCard key={carta.id} carta={carta} />)}
      </div>
    </section>
  );
}
