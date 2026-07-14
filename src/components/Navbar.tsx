"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isLightPage = pathname.startsWith("/cartas-contempladas");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isLightPage
          ? "bg-bg-dark/95 backdrop-blur-md border-b border-white/[0.08] py-4"
          : "bg-transparent py-6"
      }`}
      style={{ backgroundColor: (scrolled || isLightPage) ? "rgba(10, 10, 10, 0.95)" : "transparent" }}
    >
      <div className="max-w-[1140px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50">
          <Image
            src="/img/logo-titanium-white.png"
            alt="Titanium Consultoria"
            width={320}
            height={80}
            className="h-20 w-auto object-contain"
            priority
          />
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/"
            className="text-sm font-semibold tracking-wider text-white/80 hover:text-green-vivid transition-colors uppercase font-[family-name:var(--font-montserrat)]"
          >
            Início
          </Link>
          <a
            href="/#sobre"
            className="text-sm font-semibold tracking-wider text-white/80 hover:text-green-vivid transition-colors uppercase font-[family-name:var(--font-montserrat)]"
          >
            Sobre
          </a>
          <a
            href="/#simulador"
            className="text-sm font-semibold tracking-wider text-white/80 hover:text-green-vivid transition-colors uppercase font-[family-name:var(--font-montserrat)]"
          >
            Simulação
          </a>
          <a
            href="#contato"
            className="text-sm font-semibold tracking-wider text-white/80 hover:text-green-vivid transition-colors uppercase font-[family-name:var(--font-montserrat)]"
          >
            Contato
          </a>
        </nav>

        {/* Right CTA Button (Desktop) */}
        <div className="hidden md:block">
          <Link
            href="/cartas-contempladas"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              backgroundColor: "var(--green-vivid)",
              color: "#ffffff",
            }}
          >
            Cartas Contempladas
          </Link>
        </div>

        {/* Hamburger Toggle (Mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Menu Principal"
          className="block md:hidden text-white focus:outline-none p-2 z-50 cursor-pointer"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span className={`h-[2px] w-full bg-white rounded-full transition-transform duration-300 ${isOpen ? "rotate-45 translate-y-[9px]" : ""}`} />
            <span className={`h-[2px] w-full bg-white rounded-full transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`} />
            <span className={`h-[2px] w-full bg-white rounded-full transition-transform duration-300 ${isOpen ? "-rotate-45 -translate-y-[9px]" : ""}`} />
          </div>
        </button>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-[#0A0A0A]/98 z-40 flex flex-col justify-center items-center gap-8 transition-all duration-300 md:hidden ${
            isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
          }`}
        >
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-lg font-semibold tracking-widest text-white hover:text-green-vivid transition-colors uppercase"
          >
            Início
          </Link>
          <a
            href="/#sobre"
            onClick={() => setIsOpen(false)}
            className="text-lg font-semibold tracking-widest text-white hover:text-green-vivid transition-colors uppercase"
          >
            Sobre
          </a>
          <a
            href="/#simulador"
            onClick={() => setIsOpen(false)}
            className="text-lg font-semibold tracking-widest text-white hover:text-green-vivid transition-colors uppercase"
          >
            Simulação
          </a>
          <a
            href="#contato"
            onClick={() => setIsOpen(false)}
            className="text-lg font-semibold tracking-widest text-white hover:text-green-vivid transition-colors uppercase"
          >
            Contato
          </a>
          <Link
            href="/cartas-contempladas"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300"
            style={{
              backgroundColor: "var(--green-vivid)",
              color: "#ffffff",
            }}
          >
            Cartas Contempladas
          </Link>
        </div>
      </div>
    </header>
  );
}
