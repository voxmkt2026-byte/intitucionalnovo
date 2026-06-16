"use client";

import { useEffect, useRef, useCallback } from "react";

interface ShapeGridProps {
  speed?: number;
  squareSize?: number;
  direction?: "up" | "down" | "left" | "right";
  borderColor?: string;
  hoverFillColor?: string;
  shape?: "square" | "hexagon" | "diamond";
  hoverTrailAmount?: number;
}

export default function ShapeGrid({
  speed = 0.25,
  squareSize = 45,
  direction = "up",
  borderColor = "#365900",
  hoverFillColor = "#066800",
  shape = "hexagon",
  hoverTrailAmount = 5,
}: ShapeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const offsetRef = useRef(0);
  const hoverRef = useRef<{ col: number; row: number; alpha: number }[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });

  const drawShape = useCallback(
    (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
      ctx.beginPath();
      if (shape === "hexagon") {
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const x = cx + (size / 2) * Math.cos(angle);
          const y = cy + (size / 2) * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else if (shape === "diamond") {
        const hs = size / 2;
        ctx.moveTo(cx, cy - hs);
        ctx.lineTo(cx + hs, cy);
        ctx.lineTo(cx, cy + hs);
        ctx.lineTo(cx - hs, cy);
      } else {
        const hs = size / 2;
        ctx.rect(cx - hs, cy - hs, size, size);
      }
      ctx.closePath();
    },
    [shape]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Mobile detection: disable animation on small screens ──
    const isMobile = window.innerWidth < 768;
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = canvas.getContext("2d")!;
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      // Lower DPR on mobile for performance
      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    // Proper honeycomb tessellation
    const r = squareSize / 2;
    const colGap = Math.sqrt(3) * r;
    const rowGap = 1.5 * r;

    // ── Static render for mobile: draw once, no animation loop ──
    const renderStatic = () => {
      ctx.clearRect(0, 0, w, h);
      const bufferCells = 2;
      const cols = Math.ceil(w / colGap) + bufferCells;
      const rows = Math.ceil(h / rowGap) + bufferCells;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          let cx = col * colGap;
          let cy = row * rowGap;
          if (((row % 2) + 2) % 2 !== 0) cx += colGap / 2;

          drawShape(ctx, cx, cy, squareSize);
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    };

    // ── Animated render for desktop ──
    const renderAnimated = () => {
      ctx.clearRect(0, 0, w, h);
      offsetRef.current += speed;

      const loopPeriod = rowGap * 2;
      const offset = offsetRef.current % loopPeriod;

      const bufferCells = 4;
      const cols = Math.ceil(w / colGap) + bufferCells;
      const rows = Math.ceil(h / rowGap) + bufferCells;

      let xShift = 0;
      let yShift = 0;
      if (direction === "up") yShift = -offset;
      else if (direction === "down") yShift = offset;
      else if (direction === "left") xShift = -offset;
      else xShift = offset;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let row = -bufferCells; row < rows; row++) {
        for (let col = -bufferCells; col < cols; col++) {
          let cx = col * colGap + xShift;
          let cy = row * rowGap + yShift;

          if (((row % 2) + 2) % 2 !== 0) {
            cx += colGap / 2;
          }

          const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
          const isHover = dist < squareSize * 0.7;

          if (isHover) {
            const existing = hoverRef.current.find(
              (h) => h.col === col && h.row === row
            );
            if (!existing) {
              hoverRef.current.push({ col, row, alpha: 1 });
              if (hoverRef.current.length > hoverTrailAmount * 3) {
                hoverRef.current = hoverRef.current.slice(-hoverTrailAmount * 2);
              }
            }
          }

          drawShape(ctx, cx, cy, squareSize);

          const trailItem = hoverRef.current.find(
            (h) => h.col === col && h.row === row
          );

          if (trailItem && trailItem.alpha > 0.01) {
            ctx.fillStyle =
              hoverFillColor +
              Math.round(trailItem.alpha * 255)
                .toString(16)
                .padStart(2, "0");
            ctx.fill();
          }

          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Fade trail
      hoverRef.current = hoverRef.current
        .map((h) => ({ ...h, alpha: h.alpha * 0.96 }))
        .filter((h) => h.alpha > 0.01);

      animRef.current = requestAnimationFrame(renderAnimated);
    };

    resize();
    window.addEventListener("resize", resize);

    if (isMobile || prefersReduced) {
      // Mobile/reduced-motion: single static render, no rAF loop
      renderStatic();
    } else {
      // Desktop: full animation + hover trail
      window.addEventListener("mousemove", handleMouseMove);
      animRef.current = requestAnimationFrame(renderAnimated);
    }

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [speed, squareSize, direction, borderColor, hoverFillColor, shape, hoverTrailAmount, drawShape]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.12 }}
    />
  );
}
