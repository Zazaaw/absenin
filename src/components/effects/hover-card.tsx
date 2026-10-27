"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Kartu dengan sorot dan garis tepi yang mengikuti kursor. Posisi sorot ditulis sebagai variabel CSS lewat GSAP quickTo. */
export function HoverCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = ref.current!;
    const mx = gsap.quickTo(el, "--mx", { duration: 0.25, ease: "power2.out" });
    const my = gsap.quickTo(el, "--my", { duration: 0.25, ease: "power2.out" });
    const move = (e: MouseEvent) => { const r = el.getBoundingClientRect(); mx(e.clientX - r.left); my(e.clientY - r.top); };
    el.addEventListener("mousemove", move);
    return () => el.removeEventListener("mousemove", move);
  }, { scope: ref });
  return (
    <div
      ref={ref}
      style={{ "--mx": "-500px", "--my": "-500px" } as React.CSSProperties}
      className={cn("group relative rounded-xl border border-neutral-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700", className)}
    >
      <div aria-hidden className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(220px circle at var(--mx) var(--my), hsl(var(--foreground) / 0.5), transparent 70%)", WebkitMask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)", WebkitMaskComposite: "xor", maskComposite: "exclude", padding: 1 }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(260px circle at var(--mx) var(--my), hsl(var(--foreground) / 0.08), transparent 70%)" }} />
      <div className="relative">{children}</div>
    </div>
  );
}
