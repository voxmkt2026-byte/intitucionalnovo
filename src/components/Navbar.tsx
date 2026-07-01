"use client";

import { useEffect, useRef, useState } from "react";
import StaggeredMenu from "./StaggeredMenu";

/* ─── Menu items ─────────────────────────────────────────── */
const menuItems = [
  { label: "Segmentos",     ariaLabel: "Ver segmentos",              link: "/#segmentos" },
  { label: "Para Você",     ariaLabel: "Soluções por perfil",        link: "/#para-voce" },
  { label: "Simulador",     ariaLabel: "Simular carta",              link: "/#simulador" },
  { label: "Sobre Nós",     ariaLabel: "Sobre a Titanium",           link: "/#sobre" },
  { label: "Nossos Valores",ariaLabel: "Missão, visão e valores",    link: "/missao-visao-valores" },
  { label: "Trajetória",    ariaLabel: "Nossa linha do tempo",       link: "/trajetoria" },
  { label: "Contato",       ariaLabel: "Fale conosco",               link: "https://wa.me/5511930048940" },
];

const socialItems = [
  { label: "Instagram", link: "https://www.instagram.com/titaniumconsultoriafinanceira" },
  { label: "WhatsApp",  link: "https://wa.me/5511930048940" },
];

/* ─── Navbar ─────────────────────────────────────────────── */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const rafRef    = useRef<number>(0);
  const headerRef = useRef<HTMLElement | null>(null);

  /* Glassmorphism: toggle .scrolled class on header */
  useEffect(() => {
    headerRef.current = document.querySelector<HTMLElement>(".staggered-menu-header");

    const getHeroBottom = () => {
      const hero =
        document.querySelector<HTMLElement>("[data-hero]") ??
        document.querySelector<HTMLElement>("main > section:first-of-type");
      return hero ? hero.getBoundingClientRect().bottom + window.scrollY : window.innerHeight * 0.7;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const pastHero = window.scrollY > getHeroBottom() - 100;
        headerRef.current?.classList.toggle("scrolled", pastHero);
      });
    };

    /* Initial check after DOM settles */
    const t1 = setTimeout(onScroll, 80);
    const t2 = setTimeout(onScroll, 350);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* Menu toggle button color — always white (site é escuro) */
  useEffect(() => {
    const btn = document.querySelector<HTMLElement>(".sm-toggle");
    if (!btn) return;
    btn.style.transition = "color 0.3s ease";
    btn.style.color = "#ffffff";
  }, [menuOpen]);

  /* Logo opacity: hide on mobile when scrolled past hero on /trajetoria */
  useEffect(() => {
    const isTrajetoria = window.location.pathname.includes("trajetoria");
    if (!isTrajetoria) return;

    const logoEl  = document.querySelector<HTMLElement>(".sm-logo");
    const heroEl  = document.querySelector<HTMLElement>("main > section:first-of-type");

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!logoEl) return;
        const isMobile  = window.innerWidth < 768;
        const heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : 999;
        const pastHero  = isMobile && heroBottom < 0;
        logoEl.style.transition    = "opacity 0.3s ease";
        logoEl.style.opacity       = pastHero ? "0" : "1";
        logoEl.style.pointerEvents = pastHero ? "none" : "auto";
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <StaggeredMenu
      position="right"
      items={menuItems}
      socialItems={socialItems}
      displaySocials={true}
      displayItemNumbering={true}
      logoUrl="/img/logo-titanium-white.png"
      menuButtonColor="#ffffff"
      openMenuButtonColor="#ffffff"
      changeMenuColorOnOpen={true}
      colors={["#111", "#1a1a1a"]}
      accentColor="#C9A84C"
      isFixed={true}
      closeOnClickAway={true}
      onMenuOpen={() => setMenuOpen(true)}
      onMenuClose={() => setMenuOpen(false)}
    />
  );
}
