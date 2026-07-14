"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("titanium_cookie_consent");
    if (!consent) {
      setShowBanner(true);
    } else if (consent === "granted") {
      updateConsent(true);
    } else {
      updateConsent(false);
    }
  }, []);

  const updateConsent = (granted: boolean) => {
    if (typeof window !== "undefined") {
      const state = granted ? "granted" : "denied";
      
      // Update Google Consent Mode v2
      if (window.gtag) {
        window.gtag("consent", "update", {
          ad_storage: state,
          analytics_storage: state,
          ad_user_data: state,
          ad_personalization: state,
        });
      }
      
      // Update Meta Pixel Consent
      if (window.fbq) {
        window.fbq("consent", granted ? "grant" : "revoke");
      }
    }
  };

  const handleAccept = () => {
    localStorage.setItem("titanium_cookie_consent", "granted");
    updateConsent(true);
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("titanium_cookie_consent", "denied");
    updateConsent(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-[9999] bg-[#0A0A0A] border border-[#C9A84C]/30 text-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
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
