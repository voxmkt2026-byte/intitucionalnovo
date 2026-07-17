import crypto from "crypto";

const META_DESTINATIONS = [
  { pixelId: process.env.META_PIXEL_ID, token: process.env.META_ACCESS_TOKEN, label: "primary" },
  { pixelId: process.env.META_PIXEL_ID_2, token: process.env.META_ACCESS_TOKEN_2, label: "secondary" },
].filter((destination): destination is { pixelId: string; token: string; label: string } =>
  Boolean(destination.pixelId && destination.token)
);

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

interface MetaEventParams {
  eventName: "Lead" | "Purchase";
  lead: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    segment?: string | null;
    credit?: string | number | null;
    ref?: string | null;
    fbc?: string | null;
    fbp?: string | null;
    source_url?: string | null;
    revenue?: number | null;
  };
  clientIp?: string;
  userAgent?: string;
}

export async function sendMetaCAPIEvent(params: MetaEventParams): Promise<boolean> {
  const { eventName, lead, clientIp = "", userAgent = "" } = params;

  if (!META_DESTINATIONS.length) {
    console.warn("[MetaCAPI] API ignorada: chaves do Meta Ads não configuradas.");
    return false;
  }

  const eventId = lead.ref || crypto.randomUUID();
  const cleanedPhone = lead.phone ? cleanPhone(lead.phone) : "";
  const firstName = lead.name ? lead.name.split(" ")[0] : "";
  
  let creditValue = 0;
  if (eventName === "Purchase") {
    creditValue = lead.revenue ? parseFloat(String(lead.revenue)) : 0;
  } else {
    creditValue = typeof lead.credit === "number"
      ? lead.credit
      : parseFloat(String(lead.credit || "").replace(/\D/g, "")) || 0;
  }

  let ph = cleanedPhone;
  if (ph && !ph.startsWith("55") && ph.length <= 11) {
    ph = "55" + ph;
  }

  const userData: Record<string, unknown> = {
    ...(lead.email && { em: [sha256(lead.email)] }),
    ...(ph && { ph: [sha256(ph)] }),
    ...(firstName && { fn: [sha256(firstName)] }),
    ...(lead.fbc && { fbc: lead.fbc }),
    ...(lead.fbp && { fbp: lead.fbp }),
    ...(clientIp && { client_ip_address: clientIp }),
    client_user_agent: userAgent || "Mozilla/5.0",
  };

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: lead.source_url || "https://titaniumconsultorias.com.br",
        action_source: "website",
        user_data: userData,
        custom_data: {
          currency: "BRL",
          value: creditValue,
          content_name: lead.segment || "carta_contemplada",
          content_category: lead.segment || "carta_contemplada",
        },
      },
    ],
  };

  const results = await Promise.allSettled(
    META_DESTINATIONS.map(async ({ pixelId, token, label }) => {
      const res = await fetch(`https://graph.facebook.com/v23.0/${pixelId}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(`${label}: ${JSON.stringify(result)}`);
      console.log(`[MetaCAPI] Evento "${eventName}" enviado ao pixel ${label}.`);
      return true;
    })
  );

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(`[MetaCAPI] Falha parcial no evento "${eventName}":`, result.reason);
    }
  });

  return results.some((result) => result.status === "fulfilled");
}
