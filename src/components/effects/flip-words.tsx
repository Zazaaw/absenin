"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Kata berganti: huruf masuk satu per satu dari blur, keluar berhamburan ke kanan atas (GSAP). */
export function FlipWords({ words, duration = 2600, className }: { words: string[]; duration?: number; className?: string }) {
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const letters = el.querySelectorAll<HTMLElement>(".ch");
    const tl = gsap.timeline();
    tl.fromTo(letters, { opacity: 0, y: 10, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.25, stagger: 0.035, ease: "power2.out", clearProps: "filter" })
      .to(el, { opacity: 0, y: -24, x: 24, filter: "blur(8px)", scale: 1.5, duration: 0.4, ease: "power2.in" }, `+=${duration / 1000}`)
      .call(() => { gsap.set(el, { clearProps: "all" }); setIdx((i) => (i + 1) % words.length); });
    return () => { tl.kill(); };
  }, [idx, words.length, duration]);

  const word = words[idx];
  return (
    <span ref={ref} className={cn("relative z-10 inline-block whitespace-nowrap will-change-transform", className)}>
      {word.split("").map((ch, i) => (
        <span key={idx + "-" + i} className="ch inline-block">{ch === " " ? " " : ch}</span>
      ))}
    </span>
  );
}
