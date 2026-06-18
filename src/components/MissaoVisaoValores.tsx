"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const CircularGallery = dynamic(() => import("./CircularGallery"), { ssr: false });

/* ── Data ── */
const missao = {
  title: "Missão",
  text: "Democratizar o acesso a cartas contempladas com transparência, segurança jurídica e atendimento consultivo de excelência. Atuamos como ponte entre quem busca realizar o sonho da casa própria, do veículo novo ou da expansão do patrimônio e as melhores oportunidades de crédito contemplado do mercado. Cada negociação é conduzida com auditoria completa, suporte personalizado e compromisso real com o resultado de cada cliente em todo o Brasil.",
};

const visao = {
  title: "Visão",
  text: "Ser a referência nacional em intermediação de cartas contempladas, reconhecida pela confiança, inovação e pelo compromisso genuíno com cada cliente. Queremos transformar o mercado de consórcios no Brasil, tornando o acesso ao crédito contemplado mais seguro, acessível e transparente para milhares de famílias e empresas.",
};

/* SVG icon drawers for canvas cards — ultra-light Phosphor-style */
const svgIcons: Record<string, (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => void> = {
  eye: (ctx, cx, cy, s) => {
    // Refined eye with lash detail and iris ring
    ctx.strokeStyle = "#15B85C"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    // Outer glow
    ctx.shadowColor = "#15B85C40"; ctx.shadowBlur = 8;
    // Upper lid
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.45, cy);
    ctx.bezierCurveTo(cx - s * 0.2, cy - s * 0.32, cx + s * 0.2, cy - s * 0.32, cx + s * 0.45, cy);
    ctx.stroke();
    // Lower lid
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.45, cy);
    ctx.bezierCurveTo(cx - s * 0.2, cy + s * 0.28, cx + s * 0.2, cy + s * 0.28, cx + s * 0.45, cy);
    ctx.stroke();
    // Iris ring
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.15, 0, Math.PI * 2); ctx.stroke();
    // Pupil
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.06, 0, Math.PI * 2); ctx.fillStyle = "#15B85C"; ctx.fill();
    // Catchlight
    ctx.beginPath(); ctx.arc(cx + s * 0.05, cy - s * 0.05, s * 0.025, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.shadowBlur = 0;
  },
  shield: (ctx, cx, cy, s) => {
    // Elegant shield with inner check
    ctx.strokeStyle = "#15B85C"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.shadowColor = "#15B85C40"; ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.42);
    ctx.lineTo(cx + s * 0.32, cy - s * 0.28);
    ctx.lineTo(cx + s * 0.32, cy + s * 0.05);
    ctx.bezierCurveTo(cx + s * 0.3, cy + s * 0.28, cx + s * 0.08, cy + s * 0.42, cx, cy + s * 0.48);
    ctx.bezierCurveTo(cx - s * 0.08, cy + s * 0.42, cx - s * 0.3, cy + s * 0.28, cx - s * 0.32, cy + s * 0.05);
    ctx.lineTo(cx - s * 0.32, cy - s * 0.28);
    ctx.closePath(); ctx.stroke();
    // Checkmark inside
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.12, cy + s * 0.02);
    ctx.lineTo(cx - s * 0.02, cy + s * 0.13);
    ctx.lineTo(cx + s * 0.15, cy - s * 0.08);
    ctx.stroke();
    ctx.shadowBlur = 0;
  },
  handshake: (ctx, cx, cy, s) => {
    // Two hands meeting — refined partnership symbol
    ctx.strokeStyle = "#15B85C"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.shadowColor = "#15B85C40"; ctx.shadowBlur = 8;
    // Left hand base
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.45, cy - s * 0.05);
    ctx.lineTo(cx - s * 0.2, cy - s * 0.05);
    ctx.bezierCurveTo(cx - s * 0.05, cy - s * 0.2, cx + s * 0.1, cy + s * 0.05, cx + s * 0.05, cy + s * 0.1);
    ctx.stroke();
    // Right hand base
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.45, cy - s * 0.05);
    ctx.lineTo(cx + s * 0.2, cy - s * 0.05);
    ctx.bezierCurveTo(cx + s * 0.05, cy - s * 0.15, cx - s * 0.1, cy + s * 0.1, cx - s * 0.05, cy + s * 0.15);
    ctx.stroke();
    // Fingers detail
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.05, cy + s * 0.1);
    ctx.bezierCurveTo(cx, cy + s * 0.2, cx + s * 0.08, cy + s * 0.18, cx + s * 0.05, cy + s * 0.1);
    ctx.stroke();
    ctx.shadowBlur = 0;
  },
  bolt: (ctx, cx, cy, s) => {
    // Sleek lightning bolt — outlined, not filled
    ctx.strokeStyle = "#15B85C"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.shadowColor = "#15B85C40"; ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.08, cy - s * 0.42);
    ctx.lineTo(cx - s * 0.15, cy - s * 0.02);
    ctx.lineTo(cx + s * 0.03, cy - s * 0.02);
    ctx.lineTo(cx - s * 0.08, cy + s * 0.42);
    ctx.stroke();
    // Glow accent dot
    ctx.beginPath(); ctx.arc(cx - s * 0.08, cy + s * 0.42, s * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = "#15B85C"; ctx.fill();
    ctx.shadowBlur = 0;
  },
  lightbulb: (ctx, cx, cy, s) => {
    // Elegant lightbulb with filament
    ctx.strokeStyle = "#15B85C"; ctx.lineWidth = 1.5; ctx.lineCap = "round";
    ctx.shadowColor = "#15B85C40"; ctx.shadowBlur = 10;
    // Bulb globe
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.12, s * 0.22, Math.PI * 0.85, Math.PI * 0.15, true);
    ctx.stroke();
    // Neck lines connecting to base
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.13, cy + s * 0.12); ctx.lineTo(cx - s * 0.13, cy + s * 0.06);
    ctx.moveTo(cx + s * 0.13, cy + s * 0.12); ctx.lineTo(cx + s * 0.13, cy + s * 0.06);
    ctx.stroke();
    // Base ridges
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.12, cy + s * 0.16); ctx.lineTo(cx + s * 0.12, cy + s * 0.16);
    ctx.moveTo(cx - s * 0.1, cy + s * 0.22); ctx.lineTo(cx + s * 0.1, cy + s * 0.22);
    ctx.stroke();
    // Tip
    ctx.beginPath(); ctx.arc(cx, cy + s * 0.26, s * 0.02, 0, Math.PI * 2); ctx.fillStyle = "#15B85C"; ctx.fill();
    // Filament rays
    ctx.lineWidth = 1; ctx.globalAlpha = 0.4;
    for (let i = 0; i < 3; i++) {
      const angle = -Math.PI / 2 + (i - 1) * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * s * 0.3, cy - s * 0.12 + Math.sin(angle) * s * 0.3);
      ctx.lineTo(cx + Math.cos(angle) * s * 0.4, cy - s * 0.12 + Math.sin(angle) * s * 0.4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  },
  diamond: (ctx, cx, cy, s) => {
    // Faceted gem with inner cut lines
    ctx.strokeStyle = "#15B85C"; ctx.lineWidth = 1.5; ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.shadowColor = "#15B85C40"; ctx.shadowBlur = 10;
    // Crown
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy - s * 0.12);
    ctx.lineTo(cx - s * 0.15, cy - s * 0.38);
    ctx.lineTo(cx + s * 0.15, cy - s * 0.38);
    ctx.lineTo(cx + s * 0.3, cy - s * 0.12);
    ctx.closePath(); ctx.stroke();
    // Pavilion
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy - s * 0.12);
    ctx.lineTo(cx, cy + s * 0.42);
    ctx.lineTo(cx + s * 0.3, cy - s * 0.12);
    ctx.stroke();
    // Inner facet lines
    ctx.lineWidth = 1; ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.08, cy - s * 0.12);
    ctx.lineTo(cx, cy + s * 0.42);
    ctx.moveTo(cx + s * 0.08, cy - s * 0.12);
    ctx.lineTo(cx, cy + s * 0.42);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  },
  target: (ctx, cx, cy, s) => {
    // Concentric crosshair — precision feel
    ctx.strokeStyle = "#15B85C"; ctx.lineWidth = 1.5;
    ctx.shadowColor = "#15B85C40"; ctx.shadowBlur = 8;
    // Outer ring
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.38, 0, Math.PI * 2); ctx.stroke();
    // Inner ring
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.22, 0, Math.PI * 2); ctx.stroke();
    // Crosshair lines
    ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.45); ctx.lineTo(cx, cy - s * 0.28);
    ctx.moveTo(cx, cy + s * 0.45); ctx.lineTo(cx, cy + s * 0.28);
    ctx.moveTo(cx - s * 0.45, cy); ctx.lineTo(cx - s * 0.28, cy);
    ctx.moveTo(cx + s * 0.45, cy); ctx.lineTo(cx + s * 0.28, cy);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Center dot
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.04, 0, Math.PI * 2); ctx.fillStyle = "#15B85C"; ctx.fill();
    ctx.shadowBlur = 0;
  },
  telescope: (ctx, cx, cy, s) => {
    // Refined spyglass with lens flare
    ctx.strokeStyle = "#15B85C"; ctx.lineWidth = 1.5; ctx.lineCap = "round";
    ctx.shadowColor = "#15B85C40"; ctx.shadowBlur = 8;
    // Lens (large circle)
    ctx.beginPath(); ctx.arc(cx + s * 0.2, cy - s * 0.2, s * 0.18, 0, Math.PI * 2); ctx.stroke();
    // Tube body
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.06, cy - s * 0.06);
    ctx.lineTo(cx - s * 0.3, cy + s * 0.3);
    ctx.stroke();
    // Tripod legs
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.18, cy + s * 0.18);
    ctx.lineTo(cx - s * 0.38, cy + s * 0.42);
    ctx.moveTo(cx - s * 0.18, cy + s * 0.18);
    ctx.lineTo(cx - s * 0.05, cy + s * 0.42);
    ctx.stroke();
    // Lens flare accent
    ctx.lineWidth = 1; ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.3, cy - s * 0.38); ctx.lineTo(cx + s * 0.38, cy - s * 0.45);
    ctx.moveTo(cx + s * 0.38, cy - s * 0.22); ctx.lineTo(cx + s * 0.45, cy - s * 0.22);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  },
};

const valores = [
  {
    iconKey: "eye" as const,
    title: "Transparência Total",
    text: "Todas as condições são apresentadas com clareza antes de qualquer negociação. Sem letras miúdas, sem surpresas.",
  },
  {
    iconKey: "shield" as const,
    title: "Segurança Jurídica",
    text: "Cada carta é auditada pela nossa equipe jurídica. CNPJ ativo, regulamentação do Banco Central e conformidade com a LGPD.",
  },
  {
    iconKey: "handshake" as const,
    title: "Compromisso com o Cliente",
    text: "Atendimento consultivo e personalizado. Nosso sucesso se mede pela conquista de cada cliente que atendemos.",
  },
  {
    iconKey: "bolt" as const,
    title: "Excelência Operacional",
    text: "Processos ágeis e eficientes para que o crédito chegue rápido, sem burocracia desnecessária e com total suporte.",
  },
  {
    iconKey: "lightbulb" as const,
    title: "Inovação Contínua",
    text: "Buscamos constantemente novas formas de entregar mais valor, com tecnologia e inteligência de mercado a serviço dos nossos clientes.",
  },
  {
    iconKey: "diamond" as const,
    title: "Integridade",
    text: "Nunca solicitamos depósitos antecipados ou taxas de liberação. Atuamos com ética e responsabilidade em cada etapa.",
  },
];

/* ── Animated counter hook ── */
function useCountUp(ref: React.RefObject<HTMLSpanElement | null>, target: number, duration = 2000) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        let start = 0;
        const startTime = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          start = Math.round(eased * target);
          el.textContent = start.toLocaleString("pt-BR");
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, target, duration]);
}

/* ── Icon image paths ── */
const iconImagePaths: Record<string, string> = {
  eye: "/icons/eye.svg",
  shield: "/icons/shield.svg",
  handshake: "/icons/handshake.svg",
  bolt: "/icons/bolt.svg",
  lightbulb: "/icons/lightbulb.svg",
  diamond: "/icons/diamond.svg",
  target: "/icons/eye.svg",
  telescope: "/icons/lightbulb.svg",
};

/* ── Load image helper ── */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ── Generate card image via Canvas (DPR-aware, crisp) ── */
async function generateCardImage(iconKey: string, title: string, text: string): Promise<string> {
  const dpr = 3; // Always render at 3x for crisp output
  // Logical dimensions (CSS-like)
  const W = 700;
  const H = 900;
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#1A1F1C"); // var(--bg-dark)
  grad.addColorStop(1, "#0A7B3E"); // var(--green)
  ctx.fillStyle = grad;

  // Rounded rect
  const r = 40;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(W - r, 0);
  ctx.quadraticCurveTo(W, 0, W, r);
  ctx.lineTo(W, H - r);
  ctx.quadraticCurveTo(W, H, W - r, H);
  ctx.lineTo(r, H);
  ctx.quadraticCurveTo(0, H, 0, H - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // Subtle border
  ctx.strokeStyle = "rgba(21, 184, 92, 0.15)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Lime accent dot top-right
  ctx.beginPath();
  ctx.arc(W - 50, 50, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#15B85C";
  ctx.fill();

  // Draw icon from SVG image
  const iconSrc = iconImagePaths[iconKey];
  if (iconSrc) {
    try {
      const iconImg = await loadImage(iconSrc);
      const iconSize = 240;
      ctx.drawImage(iconImg, W / 2 - iconSize / 2, 50, iconSize, iconSize);
    } catch {
      ctx.beginPath();
      ctx.arc(W / 2, 170, 40, 0, Math.PI * 2);
      ctx.strokeStyle = "#15B85C";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";

  const titleWords = title.split(" ");
  let titleLines: string[] = [];
  let currentLine = "";
  for (const word of titleWords) {
    const testLine = currentLine ? currentLine + " " + word : word;
    if (ctx.measureText(testLine).width > W - 100) {
      titleLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) titleLines.push(currentLine);

  let y = 360;
  for (const line of titleLines) {
    ctx.fillText(line, W / 2, y);
    y += 46;
  }

  // Separator line
  y += 10;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, y);
  ctx.lineTo(W / 2 + 40, y);
  ctx.strokeStyle = "#15B85C";
  ctx.lineWidth = 3;
  ctx.stroke();
  y += 36;

  // Description text - word wrap with clamp
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "24px sans-serif";
  const words = text.split(" ");
  let lines: string[] = [];
  currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? currentLine + " " + word : word;
    if (ctx.measureText(testLine).width > W - 120) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Clamp to max lines that fit within canvas
  const lineHeight = 34;
  const maxLines = Math.floor((H - y - 30) / lineHeight);
  const clampedLines = lines.slice(0, maxLines);

  for (const line of clampedLines) {
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  }

  return canvas.toDataURL("image/png");
}

/* ── ValoresGallery sub-component ── */
function ValoresGallery() {
  const [cardImages, setCardImages] = useState<Array<{ image: string; text: string }>>([]);

  useEffect(() => {
    const buildCards = async () => {
      const allCards = [...valores];
      const items = await Promise.all(
        allCards.map(async (v) => ({
          image: await generateCardImage(v.iconKey, v.title, v.text),
          text: v.title,
        }))
      );
      setCardImages(items);
    };
    buildCards();
  }, []);

  if (!cardImages.length) return null;

  return (
    <section
      className="py-10 md:py-14 overflow-hidden"
      style={{ background: "linear-gradient(135deg, var(--bg-dark) 0%, var(--green) 100%)" }}
    >
      <div className="text-center mb-4 px-6">
        <span className="inline-block text-green-vivid text-xs font-[family-name:var(--font-jakarta)] font-bold uppercase tracking-[0.25em] mb-2">
          O que nos move
        </span>
        <h2 className="font-[family-name:var(--font-jakarta)] text-[clamp(1.8rem,4vw,3.5rem)] font-black text-white uppercase tracking-tight">
          Nossos Valores
        </h2>
        <p className="mt-2 text-white/50 text-base md:text-lg font-[family-name:var(--font-jakarta)] max-w-xl mx-auto">
          Arraste para explorar os princípios que guiam cada decisão da Titanium.
        </p>
      </div>
      <div className="h-[450px] md:h-[700px] relative">
        <CircularGallery
          items={cardImages}
          bend={0}
          textColor="#15B85C"
          borderRadius={0.05}
          scrollEase={0.03}
          font="bold 22px 'Plus Jakarta Sans'"
          fontUrl="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&display=swap"
        />
      </div>
    </section>
  );
}

/* ── FAQ Data ── */
const faqs = [
  {
    q: "O que é uma carta contemplada?",
    a: "Uma carta contemplada é um crédito de consórcio que já foi sorteado ou arrematado por lance. Isso significa que o valor está liberado para uso imediato na compra de imóveis, veículos ou outros bens, sem necessidade de aguardar sorteio.",
  },
  {
    q: "Qual a diferença entre carta contemplada e financiamento?",
    a: "No financiamento, você paga juros compostos que podem dobrar o valor do bem. Na carta contemplada, você paga apenas a taxa de administração do consórcio, que é significativamente menor. Além disso, não há análise de crédito bancário tradicional.",
  },
  {
    q: "Como funciona o processo de compra na Titanium?",
    a: "Primeiro, você escolhe a carta que melhor atende seu objetivo. Nossa equipe jurídica audita toda a documentação. Após sua aprovação, fazemos a transferência da carta para o seu nome junto à administradora. Todo o processo é acompanhado por um consultor dedicado.",
  },
  {
    q: "A Titanium cobra alguma taxa antecipada?",
    a: "Não. A Titanium nunca solicita depósitos antecipados, taxas de liberação ou qualquer pagamento antes da formalização do contrato. Desconfie de empresas que pedem valores adiantados.",
  },
  {
    q: "Posso usar a carta contemplada para qualquer imóvel ou veículo?",
    a: "Sim, desde que o bem esteja dentro das regras da administradora do consórcio. Cartas de imóvel podem ser usadas para casas, apartamentos, terrenos e imóveis comerciais. Cartas de veículo podem ser usadas para carros novos e seminovos, motos e utilitários.",
  },
  {
    q: "Qual o prazo para liberação do crédito?",
    a: "Após a assinatura do contrato e a transferência da carta, o prazo de liberação do crédito depende da administradora, mas geralmente varia entre 3 e 10 dias úteis para a análise e liberação do valor ao vendedor do bem.",
  },
  {
    q: "A Titanium é regulamentada?",
    a: "Sim. A Titanium Consultoria atua como intermediadora de cartas contempladas de administradoras regulamentadas pelo Banco Central do Brasil. Nosso CNPJ (46.640.755/0001-51) está ativo e operamos em conformidade com a LGPD e as normas do setor.",
  },
];

/* ── FAQ Accordion Item ── */
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-green/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 md:py-6 text-left gap-4 group cursor-pointer"
      >
        <span className="font-[family-name:var(--font-jakarta)] text-base md:text-lg font-semibold text-green group-hover:text-green-mid transition-colors">
          {q}
        </span>
        <span
          className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
            open ? "bg-green border-green rotate-45" : "border-green/20"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke={open ? "#ffffff" : "var(--green)"}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="7" y1="1" x2="7" y2="13" />
            <line x1="1" y1="7" x2="13" y2="7" />
          </svg>
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "300px" : "0", opacity: open ? 1 : 0 }}
      >
        <p className="pb-6 text-ink-soft text-sm md:text-base font-[family-name:var(--font-jakarta)] leading-relaxed max-w-3xl">
          {a}
        </p>
      </div>
    </div>
  );
}

/* ── FAQ Section ── */
function FAQSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[900px] mx-auto px-6 md:px-12">
        <div className="text-center mb-10">
          <span className="inline-block text-green text-xs font-[family-name:var(--font-jakarta)] font-bold uppercase tracking-[0.25em] mb-3">
            Tire suas dúvidas
          </span>
          <h2 className="font-[family-name:var(--font-jakarta)] text-[clamp(1.8rem,4vw,3rem)] font-black text-green uppercase tracking-tight">
            Perguntas Frequentes
          </h2>
        </div>
        <div className="border-t border-green/10">
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Component ── */
export default function MissaoVisaoValores() {
  const numRef1 = useRef<HTMLSpanElement>(null);
  const numRef2 = useRef<HTMLSpanElement>(null);
  const numRef3 = useRef<HTMLSpanElement>(null);

  useCountUp(numRef1, 4, 1800);
  useCountUp(numRef2, 2000, 2200);
  useCountUp(numRef3, 50, 2000);

  // Scroll-reveal for .mv-reveal elements
  useEffect(() => {
    const els = document.querySelectorAll('.mv-reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('mv-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-bg">

      {/* ═══ Hero Banner ═══ */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--bg-dark) 0%, var(--green-deep) 60%, var(--bg-dark) 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-green-vivid/5" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-green-vivid/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
        </div>

        <div className="relative z-10 text-center px-6 py-24 max-w-4xl mx-auto">
          <span className="inline-block text-green-vivid text-xs font-[family-name:var(--font-jakarta)] font-bold uppercase tracking-[0.25em] mb-6">
            Quem Somos
          </span>
          <h1 className="font-[family-name:var(--font-jakarta)] text-[clamp(2rem,6vw,4.5rem)] font-black leading-[1.05] text-white uppercase tracking-tight">
            Missão, Visão<br />e Valores
          </h1>
          <p className="mt-6 text-white/60 text-lg md:text-xl font-[family-name:var(--font-jakarta)] max-w-2xl mx-auto leading-relaxed">
            Os princípios que guiam cada decisão e cada atendimento da Titanium Consultoria.
          </p>
        </div>
      </section>

      {/* ═══ Missão & Visão — Editorial Luxury ═══ */}
      <section className="relative py-28 md:py-40 overflow-hidden" style={{ background: '#fafaf8' }}>
        {/* Noise overlay for paper texture */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
        />

        <div className="relative z-[2] max-w-[1300px] mx-auto px-4 md:px-12 lg:px-16">
          {/* Section eyebrow */}
          <div className="text-center mb-16 md:mb-24 mv-reveal">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.25em] font-[family-name:var(--font-jakarta)] font-bold text-green/60 border border-green/10 mb-6">
              O que nos guia
            </span>
            <h2 className="font-[family-name:var(--font-jakarta)] text-[clamp(1.6rem,4vw,3rem)] font-black text-green uppercase tracking-tight">
              Propósito & Direção
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

            {/* ── Missão Card — Double-Bezel ── */}
            <div className="mv-reveal mv-reveal-delay-1">
              {/* Outer shell */}
              <div
                className="rounded-[2rem] p-[3px]"
                style={{ background: 'linear-gradient(135deg, rgba(10,123,62,0.08), rgba(21,184,92,0.05))' }}
              >
                {/* Inner core */}
                <div className="rounded-[calc(2rem-3px)] bg-white p-8 md:p-12 relative overflow-hidden group"
                  style={{ boxShadow: '0 1px 2px rgba(10,123,62,0.04), 0 24px 60px -12px rgba(10,123,62,0.06)' }}
                >
                  {/* Lime accent line */}
                  <div className="absolute top-0 left-8 md:left-12 w-12 h-[3px] bg-green-vivid rounded-full" />

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-green flex items-center justify-center mt-4 mb-8 group-hover:scale-105 transition-transform duration-700"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                  >
                    <img src="/icons/eye.svg" alt="" className="w-7 h-7 brightness-0 invert" />
                  </div>

                  {/* Eyebrow */}
                  <span className="text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-jakarta)] font-bold text-green/50 block mb-3">
                    01 — Nossa Missão
                  </span>

                  {/* Title */}
                  <h3 className="font-[family-name:var(--font-jakarta)] text-2xl md:text-3xl font-black text-green uppercase tracking-tight mb-6 leading-[1.1]">
                    {missao.title}
                  </h3>

                  {/* Text */}
                  <p className="text-sm md:text-base text-ink-soft font-[family-name:var(--font-jakarta)] leading-[1.8]">
                    {missao.text}
                  </p>

                  {/* Bottom accent */}
                  <div className="mt-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-tint border border-green-tint-2 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-xs uppercase tracking-[0.15em] font-[family-name:var(--font-jakarta)] font-bold text-ink-mute">
                      Nosso compromisso diário
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Visão Card — Double-Bezel ── */}
            <div className="mv-reveal mv-reveal-delay-2">
              {/* Outer shell */}
              <div
                className="rounded-[2rem] p-[3px]"
                style={{ background: 'linear-gradient(135deg, rgba(21,184,92,0.08), rgba(10,123,62,0.05))' }}
              >
                {/* Inner core */}
                <div className="rounded-[calc(2rem-3px)] bg-white p-8 md:p-12 relative overflow-hidden group"
                  style={{ boxShadow: '0 1px 2px rgba(10,123,62,0.04), 0 24px 60px -12px rgba(10,123,62,0.06)' }}
                >
                  {/* Lime accent line */}
                  <div className="absolute top-0 left-8 md:left-12 w-12 h-[3px] bg-green-vivid rounded-full" />

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-green flex items-center justify-center mt-4 mb-8 group-hover:scale-105 transition-transform duration-700"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                  >
                    <img src="/icons/lightbulb.svg" alt="" className="w-7 h-7 brightness-0 invert" />
                  </div>

                  {/* Eyebrow */}
                  <span className="text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-jakarta)] font-bold text-green/50 block mb-3">
                    02 — Nossa Visão
                  </span>

                  {/* Title */}
                  <h3 className="font-[family-name:var(--font-jakarta)] text-2xl md:text-3xl font-black text-green uppercase tracking-tight mb-6 leading-[1.1]">
                    {visao.title}
                  </h3>

                  {/* Text */}
                  <p className="text-sm md:text-base text-ink-soft font-[family-name:var(--font-jakarta)] leading-[1.8]">
                    {visao.text}
                  </p>

                  {/* Bottom accent */}
                  <div className="mt-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-tint border border-green-tint-2 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M3 5l3-3 3 3" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-xs uppercase tracking-[0.15em] font-[family-name:var(--font-jakarta)] font-bold text-ink-mute">
                      Onde queremos chegar
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Stats strip ── */}
          <div className="mt-16 md:mt-24 grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mv-reveal mv-reveal-delay-3">
            <div className="text-center">
              <span ref={numRef1} className="block font-[family-name:var(--font-jakarta)] text-3xl md:text-5xl font-black text-green tabular-nums">0</span>
              <span className="block mt-1 text-xs uppercase tracking-[0.15em] font-[family-name:var(--font-jakarta)] font-bold text-ink-mute">Anos de mercado</span>
            </div>
            <div className="text-center">
              <span className="block font-[family-name:var(--font-jakarta)] text-3xl md:text-5xl font-black text-green tabular-nums">+<span ref={numRef2}>0</span></span>
              <span className="block mt-1 text-xs uppercase tracking-[0.15em] font-[family-name:var(--font-jakarta)] font-bold text-ink-mute">Clientes atendidos*</span>
              <span className="block mt-0.5 text-[0.6rem] font-[family-name:var(--font-jakarta)] text-ink-mute/60 normal-case tracking-normal">*Dados internos Titanium Consultoria</span>
            </div>
            <div className="text-center">
              <span className="block font-[family-name:var(--font-jakarta)] text-3xl md:text-5xl font-black text-green tabular-nums">R$<span ref={numRef3}>0</span>M</span>
              <span className="block mt-1 text-xs uppercase tracking-[0.15em] font-[family-name:var(--font-jakarta)] font-bold text-ink-mute">Em crédito negociado*</span>
              <span className="block mt-0.5 text-[0.6rem] font-[family-name:var(--font-jakarta)] text-ink-mute/60 normal-case tracking-normal">*Valor acumulado desde a fundação</span>
            </div>
          </div>
        </div>
      </section>



      {/* ═══ Valores — CircularGallery Cards ═══ */}
      <ValoresGallery />

      {/* ═══ FAQ ═══ */}
      <FAQSection />

      {/* ═══ CTA Section ═══ */}
      <section
        className="py-20 md:py-28"
        style={{ background: "linear-gradient(135deg, var(--bg-dark) 0%, var(--green-deep) 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-[family-name:var(--font-jakarta)] text-[clamp(1.5rem,4vw,3rem)] font-black text-white uppercase tracking-tight leading-tight">
            Pronto para conquistar<br />seu próximo bem?
          </h2>
          <p className="mt-5 text-white/60 text-lg font-[family-name:var(--font-jakarta)] max-w-xl mx-auto">
            Fale com um consultor Titanium e descubra a carta contemplada ideal para você.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/5511930048940"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Falar no WhatsApp →
            </a>
            <a
              href="/"
              className="btn-outline-white"
            >
              Voltar ao site
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
