"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Angka menghitung naik saat masuk layar (GSAP tween pada objek, bukan DOM per frame dari React). */
export function NumberTicker({ value, suffix = "", prefix = "", className, decimals = 0 }: { value: number; suffix?: string; prefix?: string; className?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (v: number) => prefix + Number(v).toLocaleString("id-ID", { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) + suffix;
  useEffect(() => {
    const el = ref.current!;
    const obj = { v: 0 };
    const st = ScrollTrigger.create({
      trigger: el, start: "top 95%", once: true,
      onEnter: () => { gsap.to(obj, { v: value, duration: 1.4, ease: "power3.out", onUpdate: () => { el.textContent = fmt(obj.v); } }); },
    });
    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, prefix, suffix, decimals]);
  return <span ref={ref} className={className}>{fmt(0)}</span>;
}
