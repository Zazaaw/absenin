"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Teks besar berjalan terus; arah dan kecepatan ikut scroll, miring sedikit saat cepat. Digerakkan ticker GSAP, hanya transform. */
export function VelocityMarquee({ text, baseVelocity = 40, className }: { text: string; baseVelocity?: number; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = track.current!;
    let x = 0;
    let dir = Math.sign(baseVelocity) || 1;
    let boost = 0;
    const half = () => el.scrollWidth / 2;
    const skew = gsap.quickTo(el, "skewX", { duration: 0.4, ease: "power2.out" });
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = self.getVelocity();
        if (v < -50) dir = -Math.sign(baseVelocity); else if (v > 50) dir = Math.sign(baseVelocity);
        boost = Math.min(6, Math.abs(v) / 300);
        skew(gsap.utils.clamp(-8, 8, v / 250));
      },
    });
    const tick = (_t: number, delta: number) => {
      x -= dir * Math.abs(baseVelocity) * (1 + boost) * (delta / 1000);
      boost *= 0.95;
      const h = half();
      if (h) { if (x <= -h) x += h; if (x > 0) x -= h; }
      gsap.set(el, { x });
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); st.kill(); };
  }, { scope: root });

  return (
    <div ref={root} className={cn("overflow-hidden whitespace-nowrap py-6", className)}>
      <div ref={track} className="flex w-max will-change-transform">
        {[0, 1].map((k) => (
          <div key={k} className="flex" aria-hidden={k === 1}>
            {Array.from({ length: 4 }).map((_, i) => <span key={i} className="pr-10 text-h2 font-extrabold tracking-tight md:text-h1">{text}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}
