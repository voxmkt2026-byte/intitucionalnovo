"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg-dark/95 backdrop-blur-md border-b border-white/[0.08] py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-[1140px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/img/logo-titanium-white.png"
            alt="Titanium Consultoria"
            width={140}
            height={35}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-5 md:gap-10">
          <Link
            href="/"
            className="text-[11px] md:text-sm font-semibold tracking-wider text-white/80 hover:text-green-vivid transition-colors uppercase font-[family-name:var(--font-montserrat)]"
          >
            Início
          </Link>
          <a
            href="/#sobre"
            className="text-[11px] md:text-sm font-semibold tracking-wider text-white/80 hover:text-green-vivid transition-colors uppercase font-[family-name:var(--font-montserrat)]"
          >
            Sobre
          </a>
          <a
            href="/#simulador"
            className="text-[11px] md:text-sm font-semibold tracking-wider text-white/80 hover:text-green-vivid transition-colors uppercase font-[family-name:var(--font-montserrat)]"
          >
            Simulação
          </a>
          <Link
            href="/cartas-contempladas"
            className="text-[11px] md:text-sm font-semibold tracking-wider text-white/80 hover:text-green-vivid transition-colors uppercase font-[family-name:var(--font-montserrat)]"
          >
            Cartas Contempladas
          </Link>
          <a
            href="#contato"
            className="text-[11px] md:text-sm font-semibold tracking-wider text-white/80 hover:text-green-vivid transition-colors uppercase font-[family-name:var(--font-montserrat)]"
          >
            Contato
          </a>
        </nav>

        {/* Right CTA Button (Desktop) */}
        <div className="hidden md:block">
          <a
            href="https://wa.me/5511930048940"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              backgroundColor: "var(--green-vivid)",
              color: "#ffffff",
            }}
          >
            Falar com Especialista
          </a>
        </div>
      </div>
    </header>
  );
}
