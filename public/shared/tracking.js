/* ══════════════════════════════════════════════════════════════
   TITANIUM TRACKING CAPTURE v1.1
   Shared tracking script for static HTML landing pages.
   Captures ref, fbc, fbp, gclid, UTMs from URL/cookies.
   Persists in sessionStorage.
   Enriches all WhatsApp links with ref on page load.
   FIX: Always re-reads _fbc/_fbp cookies (Meta Pixel loads async)
   FIX: Retries cookie capture after 2s to catch late pixel load
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : '';
  }

  function captureIds() {
    var stored = sessionStorage.getItem('tf_ids');
    var params = new URLSearchParams(window.location.search);
    var fbclid = params.get('fbclid') || '';

    // ALWAYS re-read Facebook cookies (pixel may have loaded AFTER first capture)
    var freshFbc = getCookie('_fbc') || (fbclid ? 'fb.1.' + Date.now() + '.' + fbclid : '');
    var freshFbp = getCookie('_fbp') || '';

    if (stored) {
      // Return cached ids but ALWAYS refresh fbc/fbp
      var cached = JSON.parse(stored);
      if (freshFbc) cached.fbc = freshFbc;
      if (freshFbp) cached.fbp = freshFbp;
      sessionStorage.setItem('tf_ids', JSON.stringify(cached));
      return cached;
    }

    var ids = {
      ref: 'tf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      fbc: freshFbc,
      fbp: freshFbp,
      gclid: params.get('gclid') || '',
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || '',
      lp: window.location.pathname.replace(/\//g, '') || 'home',
      landing_time: new Date().toISOString()
    };

    sessionStorage.setItem('tf_ids', JSON.stringify(ids));
    return ids;
  }

  // Capture on page load
  var ids = captureIds();

  // Retry after 2 seconds — Meta Pixel may not have set cookies yet
  setTimeout(function () {
    var freshFbc = getCookie('_fbc');
    var freshFbp = getCookie('_fbp');
    if (freshFbc || freshFbp) {
      var current = JSON.parse(sessionStorage.getItem('tf_ids') || '{}');
      if (freshFbc && !current.fbc) current.fbc = freshFbc;
      if (freshFbp && !current.fbp) current.fbp = freshFbp;
      sessionStorage.setItem('tf_ids', JSON.stringify(current));
      ids = current;
      window.__tfIds = ids;
    }
  }, 2000);

  // Enrich all wa.me links with ref parameter
  function enrichLinks() {
    var links = document.querySelectorAll('a[href*="wa.me"]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (href && href.indexOf('Ref:') === -1) {
        // Append ref to the text parameter
        if (href.indexOf('text=') !== -1) {
          links[i].setAttribute('href', href + encodeURIComponent('\n\nRef: ' + ids.ref));
        } else if (href.indexOf('?') !== -1) {
          links[i].setAttribute('href', href + '&text=' + encodeURIComponent('Olá! Ref: ' + ids.ref));
        } else {
          links[i].setAttribute('href', href + '?text=' + encodeURIComponent('Olá! Ref: ' + ids.ref));
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enrichLinks);
  } else {
    enrichLinks();
  }

  // Expose for dream-form.js and other scripts
  window.__tfIds = ids;
})();
