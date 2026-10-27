"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * BlurFade (GSAP): konten muncul sambil hilang blur dan naik sedikit. Tanda tangan sistem ini.
 *   inView={false} (default) animasi saat mount; inView={true} tunggu masuk layar (sekali).
 *   Stagger daftar dengan delay={i * 0.05}.
 * Setelah selesai, filter dibuang supaya tidak ada lapisan filter yang diproses tiap frame saat scroll.
 */
interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: string;
  blur?: string;
}

export default function BlurFade({ children, className, duration = 0.4, delay = 0, yOffset = 6, inView = false, inViewMargin = "-50px", blur = "6px" }: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = ref.current!;
    const margin = parseInt(inViewMargin, 10) || 0;
    gsap.fromTo(
      el,
      { y: yOffset, opacity: 0, filter: `blur(${blur})` },
      {
        y: -yOffset, opacity: 1, filter: "blur(0px)", duration, delay: 0.04 + delay, ease: "power2.out",
        onComplete: () => { el.style.filter = "none"; el.style.willChange = "auto"; },
        scrollTrigger: inView ? { trigger: el, start: `top bottom${margin >= 0 ? "-=" : "+="}${Math.abs(margin)}px`, once: true } : undefined,
      }
    );
  }, { scope: ref });
  return <div ref={ref} className={className} style={{ opacity: 0 }}>{children}</div>;
}
