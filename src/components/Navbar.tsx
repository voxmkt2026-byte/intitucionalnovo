"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isDarkHeroPage = pathname === "/" || pathname === "/colaboradores";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 px-4"
          : "py-5 px-4 sm:px-6"
      }`}
    >
      <div
        className={`max-w-[1160px] mx-auto rounded-full transition-all duration-300 px-6 py-2.5 flex items-center justify-between ${
          scrolled
            ? "bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.08),inset_0_1px_1px_rgba(255,255,255,1)]"
            : isDarkHeroPage
            ? "bg-slate-900/40 backdrop-blur-md border border-white/10"
            : "bg-white/70 backdrop-blur-lg border border-slate-200/60 shadow-xs"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50">
          <Image
            src={scrolled || !isDarkHeroPage ? "/img/logo-titanium-dark.png" : "/img/logo-titanium-white.png"}
            alt="Titanium Consultoria"
            width={180}
            height={48}
            className="h-10 sm:h-11 w-auto object-contain transition-opacity duration-300"
            priority
            onError={(e) => {
              // Fallback se a logo dark não existir
              const target = e.target as HTMLImageElement;
              target.src = "/img/logo-titanium-white.png";
            }}
          />
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Início", href: "/" },
            { label: "Sobre", href: "/#sobre" },
            { label: "Simulação", href: "/#simulador" },
            { label: "Contato", href: "/#contato" },
            { label: "Parceiros", href: "/colaboradores" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                scrolled || !isDarkHeroPage
                  ? "text-slate-700 hover:text-[#0A7B3E]"
                  : "text-slate-200 hover:text-emerald-400"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA Button (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/cartas-contempladas"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#0D9E50] to-[#0A7B3E] hover:from-[#15B85C] hover:to-[#0D9E50] shadow-md shadow-[#0A7B3E]/20 hover:shadow-lg hover:shadow-[#0A7B3E]/30 transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/25"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Cartas Contempladas
          </Link>
        </div>

        {/* Hamburger Toggle (Mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Menu Principal"
          className={`block md:hidden focus:outline-none p-2 z-50 cursor-pointer ${
            scrolled || !isDarkHeroPage ? "text-slate-800" : "text-white"
          }`}
        >
          <div className="w-5 h-4 relative flex flex-col justify-between">
            <span className={`h-[2px] w-full rounded-full transition-transform duration-300 ${scrolled || !isDarkHeroPage ? "bg-slate-800" : "bg-white"} ${isOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`h-[2px] w-full rounded-full transition-opacity duration-300 ${scrolled || !isDarkHeroPage ? "bg-slate-800" : "bg-white"} ${isOpen ? "opacity-0" : ""}`} />
            <span className={`h-[2px] w-full rounded-full transition-transform duration-300 ${scrolled || !isDarkHeroPage ? "bg-slate-800" : "bg-white"} ${isOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </div>
        </button>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-40 flex flex-col justify-center items-center gap-6 transition-all duration-300 md:hidden ${
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
          }`}
        >
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-base font-bold tracking-widest text-white hover:text-emerald-400 transition-colors uppercase"
          >
            Início
          </Link>
          <a
            href="/#sobre"
            onClick={() => setIsOpen(false)}
            className="text-base font-bold tracking-widest text-white hover:text-emerald-400 transition-colors uppercase"
          >
            Sobre
          </a>
          <a
            href="/#simulador"
            onClick={() => setIsOpen(false)}
            className="text-base font-bold tracking-widest text-white hover:text-emerald-400 transition-colors uppercase"
          >
            Simulação
          </a>
          <a
            href="/#contato"
            onClick={() => setIsOpen(false)}
            className="text-base font-bold tracking-widest text-white hover:text-emerald-400 transition-colors uppercase"
          >
            Contato
          </a>
          <Link
            href="/colaboradores"
            onClick={() => setIsOpen(false)}
            className="text-base font-bold tracking-widest text-white hover:text-emerald-400 transition-colors uppercase"
          >
            Parceiros
          </Link>
          <Link
            href="/cartas-contempladas"
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 rounded-full bg-[#0A7B3E] text-white text-xs font-bold uppercase tracking-wider shadow-lg"
          >
            Ver Cartas Contempladas
          </Link>
        </div>
      </div>
    </header>
  );
}
