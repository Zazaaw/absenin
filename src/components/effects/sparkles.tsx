"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Partikel kecil berkelip di canvas, warna mengikuti currentColor (gaya Aceternity Sparkles). */
export function Sparkles({ className, density = 70, speed = 0.25 }: { className?: string; density?: number; speed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = 0, h = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pts: { x: number; y: number; r: number; a: number; da: number; vy: number }[] = [];
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = canvas.width = Math.floor(r.width * devicePixelRatio);
      h = canvas.height = Math.floor(r.height * devicePixelRatio);
      pts.length = 0;
      const n = Math.floor((r.width * r.height) / 9000 * (density / 70));
      for (let i = 0; i < n; i++) pts.push({ x: Math.random() * w, y: Math.random() * h, r: (0.6 + Math.random() * 1.4) * devicePixelRatio, a: Math.random(), da: (0.004 + Math.random() * 0.012) * (Math.random() < 0.5 ? 1 : -1), vy: (0.1 + Math.random() * 0.3) * speed * devicePixelRatio });
    };
    const color = () => getComputedStyle(canvas).color;
    let visible = true;
    const io = new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); } });
    io.observe(canvas);
    const tick = () => {
      if (!visible) return; // berhenti saat di luar layar, lanjut lagi saat terlihat
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color();
      for (const p of pts) {
        p.a += p.da; if (p.a <= 0 || p.a >= 1) p.da *= -1;
        if (!reduce) { p.y -= p.vy; if (p.y < -4) p.y = h + 4; }
        ctx.globalAlpha = Math.max(0, Math.min(1, p.a)) * 0.9;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [density, speed]);
  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />;
}
