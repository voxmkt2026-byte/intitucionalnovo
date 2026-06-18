/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TITANIUM LOGO-LOOP ENGINE — React Bits LogoLoop (Vanilla Edition) ║
 * ║  Substitui automaticamente o marquee antigo por um loop premium    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
;(function () {
  'use strict';

  /* ── CONFIG ──────────────────────────────────────────────── */
  const SPEED       = 80;   // px/s
  const LOGO_HEIGHT = 36;   // px
  const GAP         = 48;   // px entre logos
  const SMOOTH_TAU  = 0.25; // easing
  const MIN_COPIES  = 2;
  const HEADROOM    = 2;
  const FADE_COLOR  = 'var(--bg-dark, #0a0e0a)';

  /* ── STYLES ─────────────────────────────────────────────── */
  const STYLES = `
    .ll-root {
      position: relative;
      overflow: hidden;
      width: 100%;
      padding: 20px 0;
    }
    .ll-root::before,
    .ll-root::after {
      content: '';
      position: absolute;
      top: 0; bottom: 0;
      width: clamp(24px, 12%, 160px);
      pointer-events: none;
      z-index: 10;
    }
    .ll-root::before {
      left: 0;
      background: linear-gradient(to right, ${FADE_COLOR} 0%, transparent 100%);
    }
    .ll-root::after {
      right: 0;
      background: linear-gradient(to left, ${FADE_COLOR} 0%, transparent 100%);
    }
    .ll-track {
      display: flex;
      width: max-content;
      will-change: transform;
      user-select: none;
    }
    .ll-set {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: ${GAP}px;
      padding-right: ${GAP}px;
    }
    .ll-item {
      flex: 0 0 auto;
      line-height: 1;
    }
    .ll-item img {
      height: ${LOGO_HEIGHT}px;
      width: auto;
      display: block;
      object-fit: contain;
      filter: brightness(0) invert(1) opacity(0.5);
      transition: filter 0.3s ease, transform 0.3s ease;
      pointer-events: none;
      -webkit-user-drag: none;
    }
    .ll-item:hover img {
      filter: brightness(0) invert(1) opacity(0.85);
      transform: scale(1.12);
    }
  `;

  function injectStyles() {
    if (document.getElementById('ll-styles')) return;
    const s = document.createElement('style');
    s.id = 'll-styles';
    s.textContent = STYLES;
    document.head.appendChild(s);
  }

  /* ── COLLECT LOGOS FROM OLD MARQUEE ──────────────────────── */
  function collectLogos(marqueeEl) {
    const logos = [];
    const seen = new Set();
    const imgs = marqueeEl.querySelectorAll('.marquee__item img, .marquee__track img');
    imgs.forEach(img => {
      const src = img.getAttribute('src');
      if (!src || seen.has(src)) return;
      seen.add(src);
      logos.push({ src, alt: img.getAttribute('alt') || '' });
    });
    return logos;
  }

  /* ── BUILD LOGOLOOP DOM ─────────────────────────────────── */
  function buildLogoLoop(logos) {
    const root = document.createElement('div');
    root.className = 'll-root';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'Parceiros de confiança');

    const track = document.createElement('div');
    track.className = 'll-track';
    root.appendChild(track);

    // We'll start with MIN_COPIES and adjust after measuring
    root._track = track;
    root._logos = logos;
    root._copyCount = MIN_COPIES;

    function renderCopies(count) {
      track.innerHTML = '';
      for (let c = 0; c < count; c++) {
        const ul = document.createElement('ul');
        ul.className = 'll-set';
        if (c > 0) ul.setAttribute('aria-hidden', 'true');
        logos.forEach(logo => {
          const li = document.createElement('li');
          li.className = 'll-item';
          const img = document.createElement('img');
          img.src = logo.src;
          img.alt = logo.alt;
          img.height = LOGO_HEIGHT;
          img.loading = 'lazy';
          img.decoding = 'async';
          img.draggable = false;
          li.appendChild(img);
          ul.appendChild(li);
        });
        track.appendChild(ul);
      }
    }

    renderCopies(MIN_COPIES);

    return { root, track, renderCopies };
  }

  /* ── ANIMATION LOOP ─────────────────────────────────────── */
  function startAnimation(track, getSeqWidth) {
    let offset = 0;
    let velocity = 0;
    let lastT = null;
    let isHovered = false;
    const targetV = SPEED; // moving left

    track.addEventListener('mouseenter', () => { isHovered = true; });
    track.addEventListener('mouseleave', () => { isHovered = false; });

    function tick(ts) {
      if (lastT === null) lastT = ts;
      const dt = Math.max(0, ts - lastT) / 1000;
      lastT = ts;

      const target = isHovered ? 0 : targetV;
      const ease = 1 - Math.exp(-dt / SMOOTH_TAU);
      velocity += (target - velocity) * ease;

      const sw = getSeqWidth();
      if (sw > 0) {
        offset += velocity * dt;
        offset = ((offset % sw) + sw) % sw;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ── INIT ───────────────────────────────────────────────── */
  function init() {
    const marquees = document.querySelectorAll('.marquee');
    if (!marquees.length) return;

    injectStyles();

    marquees.forEach(marqueeEl => {
      const logos = collectLogos(marqueeEl);
      if (!logos.length) return;

      const { root, track, renderCopies } = buildLogoLoop(logos);

      // Replace the old marquee
      marqueeEl.parentNode.insertBefore(root, marqueeEl);
      marqueeEl.style.display = 'none';

      // After images load, measure and set proper copy count
      let seqWidth = 0;

      function measure() {
        const firstSet = track.querySelector('.ll-set');
        if (!firstSet) return;
        const rect = firstSet.getBoundingClientRect();
        seqWidth = Math.ceil(rect.width);
        const containerW = root.clientWidth;
        if (seqWidth > 0) {
          const needed = Math.ceil(containerW / seqWidth) + HEADROOM;
          const count = Math.max(MIN_COPIES, needed);
          if (count !== root._copyCount) {
            root._copyCount = count;
            renderCopies(count);
          }
        }
      }

      // Wait for images then measure
      const imgs = track.querySelectorAll('img');
      let remaining = imgs.length;
      const onLoad = () => {
        remaining--;
        if (remaining <= 0) {
          measure();
          startAnimation(track, () => seqWidth);
        }
      };
      if (remaining === 0) {
        measure();
        startAnimation(track, () => seqWidth);
      } else {
        imgs.forEach(img => {
          if (img.complete) { onLoad(); }
          else {
            img.addEventListener('load', onLoad, { once: true });
            img.addEventListener('error', onLoad, { once: true });
          }
        });
      }

      // Remeasure on resize
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(measure, 200);
      });
    });
  }

  // Execute
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
