(function () {
  'use strict';

  function updateConsent(granted) {
    var state = granted ? 'granted' : 'denied';
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': state,
        'analytics_storage': state,
        'ad_user_data': state,
        'ad_personalization': state
      });
    }
    if (window.fbq) {
      window.fbq('consent', granted ? 'grant' : 'revoke');
    }
  }

  function renderBanner() {
    // If already decided, run consent configuration and exit
    var consent = localStorage.getItem('titanium_cookie_consent');
    if (consent) {
      updateConsent(consent === 'granted');
      return;
    }

    // Otherwise show banner
    var banner = document.createElement('div');
    banner.id = 'titanium-cookie-consent';
    banner.style.position = 'fixed';
    banner.style.bottom = '24px';
    banner.style.left = '24px';
    banner.style.right = '24px';
    banner.style.backgroundColor = '#0A0A0A';
    banner.style.border = '1px solid rgba(201, 168, 76, 0.3)';
    banner.style.borderRadius = '16px';
    banner.style.padding = '24px';
    banner.style.zIndex = '99999';
    banner.style.color = '#FFFFFF';
    banner.style.fontFamily = "'Inter', sans-serif";
    banner.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    banner.style.transition = 'all 0.3s ease';

    // Desktop max width
    if (window.innerWidth > 768) {
      banner.style.left = 'auto';
      banner.style.width = '400px';
    }

    banner.innerHTML = 
      '<h3 style="margin: 0 0 8px 0; font-family: \'Fraunces\', serif; font-size: 18px; color: #C9A84C; font-weight: 600;">Privacidade & Cookies</h3>' +
      '<p style="margin: 0 0 16px 0; font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1.6;">' +
        'Valorizamos sua privacidade. Utilizamos cookies para analisar nosso tráfego e otimizar campanhas de marketing em conformidade com a LGPD (Lei nº 13.709/2018).' +
      '</p>' +
      '<div style="display: flex; justify-content: flex-end; gap: 12px; font-size: 12px;">' +
        '<button id="cookie-decline-btn" style="background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; padding: 8px 12px; font-weight: 500; transition: color 0.2s;">Recusar</button>' +
        '<button id="cookie-accept-btn" style="background-color: #10B981; border: none; color: #FFFFFF; cursor: pointer; padding: 8px 20px; border-radius: 8px; font-weight: 600; transition: background-color 0.2s;">Aceitar todos</button>' +
      '</div>';

    document.body.appendChild(banner);

    // Style hover effects
    var declineBtn = document.getElementById('cookie-decline-btn');
    var acceptBtn = document.getElementById('cookie-accept-btn');

    declineBtn.onmouseover = function() { declineBtn.style.color = '#FFFFFF'; };
    declineBtn.onmouseout = function() { declineBtn.style.color = 'rgba(255,255,255,0.5)'; };
    
    acceptBtn.onmouseover = function() { acceptBtn.style.backgroundColor = '#059669'; };
    acceptBtn.onmouseout = function() { acceptBtn.style.backgroundColor = '#10B981'; };

    declineBtn.onclick = function () {
      localStorage.setItem('titanium_cookie_consent', 'denied');
      updateConsent(false);
      banner.remove();
    };

    acceptBtn.onclick = function () {
      localStorage.setItem('titanium_cookie_consent', 'granted');
      updateConsent(true);
      banner.remove();
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderBanner);
  } else {
    renderBanner();
  }
})();
