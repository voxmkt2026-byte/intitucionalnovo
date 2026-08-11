"use client";

import { useEffect, useSyncExternalStore } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

type Consent = "granted" | "denied" | null;
const CONSENT_KEY = "titanium_cookie_consent";
const CONSENT_EVENT = "titanium-consent-change";

function subscribeToConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CONSENT_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CONSENT_EVENT, callback);
  };
}

function getConsentSnapshot(): Consent {
  const value = localStorage.getItem(CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

function updateTrackingConsent(granted: boolean) {
  const state = granted ? "granted" : "denied";

  window.gtag?.("consent", "update", {
    ad_storage: state,
    analytics_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });
  window.fbq?.("consent", granted ? "grant" : "revoke");
}

export default function CookieConsent() {
  const consent = useSyncExternalStore(subscribeToConsent, getConsentSnapshot, () => null);

  useEffect(() => {
    if (consent) updateTrackingConsent(consent === "granted");
  }, [consent]);

  const saveConsent = (value: Exclude<Consent, null>) => {
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  };

  const handleAccept = () => {
    saveConsent("granted");
  };

  const handleDecline = () => {
    saveConsent("denied");
  };

  if (consent) return null;

  return (
    <div
      data-site-overlay
      role="region"
      aria-label="Preferências de privacidade e cookies"
      className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md bg-[#0A0A0A] border border-[#C9A84C]/30 text-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300"
      style={{ zIndex: "var(--layer-toast)" }}
    >
      <h3 className="font-serif text-lg text-[#C9A84C] font-semibold mb-2">
        Privacidade & Cookies
      </h3>
      <p className="text-xs text-white/70 leading-relaxed mb-4">
        Valorizamos sua privacidade. Utilizamos cookies para analisar nosso tráfego e otimizar campanhas de marketing em conformidade com a LGPD (Lei nº 13.709/2018).
      </p>
      <div className="flex items-center justify-end gap-3 text-xs">
        <button
          onClick={handleDecline}
          className="px-4 py-2 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          Recusar
        </button>
        <button
          onClick={handleAccept}
          className="px-5 py-2 bg-[#10B981] hover:bg-[#10B981]/80 text-white font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Aceitar todos
        </button>
      </div>
    </div>
  );
}
