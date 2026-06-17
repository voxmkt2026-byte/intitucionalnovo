"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import StaggeredMenu from "./StaggeredMenu";

const menuItems = [
  { label: "Segmentos", ariaLabel: "Ver segmentos", link: "/#segmentos" },
  { label: "Para Você", ariaLabel: "Soluções por perfil", link: "/#para-voce" },
  { label: "Simulador", ariaLabel: "Simular carta", link: "/#simulador" },
  { label: "Sobre Nós", ariaLabel: "Sobre a Titanium", link: "/#sobre" },
  { label: "Nossos Valores", ariaLabel: "Missão, visão e valores", link: "/missao-visao-valores" },
  { label: "Trajetória", ariaLabel: "Nossa linha do tempo", link: "/trajetoria" },
  { label: "Contato", ariaLabel: "Fale conosco", link: "https://wa.me/5511951014269" },
];

const socialItems = [
  { label: "Instagram", link: "https://instagram.com/titaniumconsultoria" },
  { label: "WhatsApp", link: "https://wa.me/5511951014269" },
];

/**
 * Finds all dark sections by checking inline style backgroundColor
 * and CSS computed backgroundColor on sections.
 */
function findDarkSections(): HTMLElement[] {
  const all = document.querySelectorAll("section, [data-dark]");
  const darkEls: HTMLElement[] = [];

  all.forEach((el) => {
    const htmlEl = el as HTMLElement;
    // Check inline style backgroundColor first
    const inlineBg = htmlEl.style.backgroundColor;
    if (inlineBg) {
      if (isDarkColor(inlineBg)) {
        darkEls.push(htmlEl);
        return;
      }
    }
    // Check inline style background (catches linear-gradient, etc.)
    const inlineBgShort = htmlEl.style.background;
    if (inlineBgShort) {
      // Extract first color from gradient or plain color
      const colorMatch = inlineBgShort.match(/#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\)/);
      if (colorMatch && isDarkColor(colorMatch[0])) {
        darkEls.push(htmlEl);
        return;
      }
    }
    // Fallback to computed style
    const computed = getComputedStyle(htmlEl).backgroundColor;
    if (computed && computed !== "transparent" && computed !== "rgba(0, 0, 0, 0)") {
      if (isDarkColor(computed)) {
        darkEls.push(htmlEl);
      }
    }
  });

  return darkEls;
}

function isDarkColor(color: string): boolean {
  // Handle hex
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return r + g + b < 250;
  }
  // Handle rgb/rgba
  const match = color.match(/\d+/g);
  if (match && match.length >= 3) {
    const [r, g, b] = match.map(Number);
    return r + g + b < 250;
  }
  return false;
}

export default function Navbar() {
  const [onDark, setOnDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const rafRef = useRef<number>(0);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const darkSectionsRef = useRef<HTMLElement[]>([]);

  // Cache dark sections — only recalculate on mount/resize, not every scroll
  const cacheDarkSections = useCallback(() => {
    darkSectionsRef.current = findDarkSections();
  }, []);

  const checkPosition = useCallback(() => {
    const navY = 40;
    let isOverDark = false;
    for (const section of darkSectionsRef.current) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= navY && rect.bottom >= navY) {
        isOverDark = true;
        break;
      }
    }
    setOnDark(isOverDark);
  }, []);

  useEffect(() => {
    // Cache dark sections on init
    cacheDarkSections();

    // Cache DOM refs once
    const logoEl = document.querySelector(".sm-logo") as HTMLElement | null;
    const heroEl = document.querySelector("main > section:first-of-type") as HTMLElement | null;
    const isTrajetoria = window.location.pathname.includes("trajetoria");

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        checkPosition();

        // Hide logo on mobile after scrolling past hero on /trajetoria
        const isMobile = window.innerWidth < 768;
        if (logoEl && isMobile && isTrajetoria) {
          const heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : 999;
          const pastHero = heroBottom < 0;
          logoEl.style.transition = "opacity 0.3s ease";
          logoEl.style.opacity = pastHero ? "0" : "1";
          logoEl.style.pointerEvents = pastHero ? "none" : "auto";
        } else if (logoEl) {
          logoEl.style.opacity = "1";
          logoEl.style.pointerEvents = "auto";
        }
      });
    };

    const onResize = () => {
      cacheDarkSections();
    };

    // Initial check after DOM settles
    const timer = setTimeout(() => { cacheDarkSections(); checkPosition(); }, 50);
    const timer2 = setTimeout(() => { cacheDarkSections(); checkPosition(); }, 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [checkPosition, cacheDarkSections]);

  // Apply logo filter + button color imperatively
  useEffect(() => {
    // Logo: original image is WHITE, needs filter to be visible
    // On light bg: apply dark green filter so it's visible
    // On dark bg: apply white invert so it's visible
    const logo = document.querySelector(".sm-logo-img") as HTMLElement;
    if (logo) {
      logo.style.transition = "filter 0.35s ease";
      logo.style.filter = (onDark || menuOpen)
        ? "brightness(0) invert(1)"  // white on dark
        : "brightness(0) saturate(100%) invert(14%) sepia(85%) saturate(800%) hue-rotate(140deg)"; // dark green on light
    }

    // Menu toggle button
    const btn = document.querySelector(".sm-toggle") as HTMLElement;
    if (btn) {
      btn.style.transition = "color 0.35s ease";
      btn.style.color = (onDark || menuOpen) ? "#ffffff" : "var(--green, #0A7B3E)";
    }
  }, [onDark, menuOpen]);

  return (
    <StaggeredMenu
      position="right"
      items={menuItems}
      socialItems={socialItems}
      displaySocials={true}
      displayItemNumbering={true}
      logoUrl="/img/logo-white.webp"
      menuButtonColor="#0A7B3E"
      openMenuButtonColor="#0A7B3E"
      changeMenuColorOnOpen={true}
      colors={["#E8F5EE", "#D1ECDD"]}
      accentColor="#0A7B3E"
      isFixed={true}
      closeOnClickAway={true}
      onMenuOpen={() => setMenuOpen(true)}
      onMenuClose={() => setMenuOpen(false)}
    />
  );
}
