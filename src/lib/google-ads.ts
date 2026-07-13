import { neon } from "@neondatabase/serverless";

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET || "";
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN || "";
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, "") || "";

// ID das Ações de Conversão criadas no painel do Google Ads
const CONVERSION_ACTION_QUALIFICADO = process.env.GOOGLE_ADS_CONVERSION_ACTION_QUALIFICADO || "";
const CONVERSION_ACTION_VENDIDO = process.env.GOOGLE_ADS_CONVERSION_ACTION_VENDIDO || "";

/**
 * Formata a data no padrão exigido pela API do Google Ads: "yyyy-MM-dd HH:mm:ss+|-HH:mm"
 */
function formatDateTime(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, "0");
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
  const offsetMinutes = pad(Math.abs(offset) % 60);

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}${sign}${offsetHours}:${offsetMinutes}`;
}

/**
 * Envia uma conversão de clique offline para o Google Ads
 */
export async function sendGoogleOfflineConversion(params: {
  gclid: string;
  status: "Qualificado" | "Vendido";
  revenue?: number;
  updatedAt?: Date;
}): Promise<boolean> {
  const { gclid, status, revenue = 0, updatedAt = new Date() } = params;

  if (!gclid) return false;

  // 1. Validar credenciais mínimas
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !DEVELOPER_TOKEN || !CUSTOMER_ID) {
    console.warn("[GoogleOffline] API ignorada: chaves do Google Ads não estão totalmente configuradas no ambiente.");
    return false;
  }

  // Obter a ação correspondente ao status alterado
  let actionId = "";
  if (status === "Qualificado") {
    actionId = CONVERSION_ACTION_QUALIFICADO;
  } else if (status === "Vendido") {
    actionId = CONVERSION_ACTION_VENDIDO;
  }

  if (!actionId) {
    console.warn(`[GoogleOffline] Nenhuma Conversion Action ID configurada para o status "${status}".`);
    return false;
  }

  try {
    // 2. Renovar Access Token usando o Refresh Token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("[GoogleOffline] Falha ao renovar token OAuth:", errText);
      return false;
    }

    const { access_token } = await tokenRes.json();

    // 3. Upload da conversão via Google Ads API v17
    const url = `https://googleads.googleapis.com/v17/customers/${CUSTOMER_ID}/clickConversions:upload`;
    const payload = {
      conversions: [
        {
          gclid: gclid,
          conversionAction: `customers/${CUSTOMER_ID}/conversionActions/${actionId}`,
          conversionDateTime: formatDateTime(updatedAt),
          conversionValue: revenue > 0 ? revenue : 1.0, // Google exige valor > 0
          currencyCode: "BRL",
        },
      ],
      partialFailure: true,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "developer-token": DEVELOPER_TOKEN,
        "login-customer-id": CUSTOMER_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("[GoogleOffline] Erro na API do Google Ads:", JSON.stringify(result));
      return false;
    }

    if (result.partialFailureError) {
      console.error("[GoogleOffline] Falha parcial no upload:", JSON.stringify(result));
      return false;
    }

    console.log(`[GoogleOffline] Conversão "${status}" enviada com sucesso para o gclid: ${gclid}`);
    return true;
  } catch (error) {
    console.error("[GoogleOffline] Falha de comunicação:", error);
    return false;
  }
}
