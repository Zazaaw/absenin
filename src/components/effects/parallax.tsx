"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Bergerak lebih lambat/cepat dari scroll (ScrollTrigger scrub, transform saja). speed negatif = berlawanan arah. */
export function Parallax({ children, speed = 0.2, className }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(ref.current, { y: speed * 120 }, { y: speed * -120, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.5 } });
  }, { scope: ref });
  return <div ref={ref} className={cn("will-change-transform", className)}>{children}</div>;
}

/** Muncul sambil naik saat masuk layar, sekali saja. */
export function Reveal({ children, className, delay = 0, y = 24 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(ref.current, { opacity: 0, y }, { opacity: 1, y: 0, duration: 0.8, delay, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 88%", once: true } });
  }, { scope: ref });
  return <div ref={ref} className={cn("will-change-transform", className)}>{children}</div>;
}
