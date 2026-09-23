import type { SimulationValues } from "@/features/prospects/domain/types";
import { simulationPayload } from "@/features/prospects/domain/types";

/** Analytics must never delay a navigation or break the simulation. */
export function sendProspectEvent(token: string, tipo: "recalculo" | "whatsapp_click", values: SimulationValues) {
  try {
    void fetch(`/api/prospects/${encodeURIComponent(token)}/evento/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, payload: simulationPayload(values) }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* Logging is best effort. */ }
}
