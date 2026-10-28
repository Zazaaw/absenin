"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Garis tipis di atas halaman yang mengikuti progres scroll. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(ref.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
  }, { scope: ref });
  return <div ref={ref} aria-hidden className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-foreground will-change-transform" />;
}
