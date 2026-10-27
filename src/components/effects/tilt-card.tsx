"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Kartu 3D yang miring mengikuti kursor, kilau ikut bergerak (GSAP quickTo, hanya transform). */
export function TiltCard({ children, className, max = 10, glare = true }: { children: React.ReactNode; className?: string; max?: number; glare?: boolean }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = inner.current!;
    const rx = gsap.quickTo(el, "rotateX", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotateY", { duration: 0.5, ease: "power3.out" });
    const gx = gsap.quickTo(el, "--gx", { duration: 0.3 });
    const gy = gsap.quickTo(el, "--gy", { duration: 0.3 });
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * max * 2); rx((0.5 - py) * max * 2); gx(px * 100); gy(py * 100);
    };
    const leave = () => { rx(0); ry(0); };
    el.addEventListener("mousemove", move); el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); };
  }, { scope: outer });
  return (
    <div ref={outer} style={{ perspective: 1200 }} className={className}>
      <div ref={inner} style={{ transformStyle: "preserve-3d", "--gx": 50, "--gy": 50 } as React.CSSProperties} className="relative will-change-transform">
        {children}
        {glare && <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: "radial-gradient(circle at calc(var(--gx) * 1%) calc(var(--gy) * 1%), rgba(255,255,255,.25), transparent 55%)" }} />}
      </div>
    </div>
  );
}
