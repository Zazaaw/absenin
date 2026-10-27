"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Garis meteor jatuh memakai keyframe meteor dari kit. Posisi acak dibuat setelah mount supaya SSR dan klien sama. */
export function Meteors({ number = 14, className }: { number?: number; className?: string }) {
  const [items, setItems] = useState<{ top: string; left: string; delay: string; dur: string }[]>([]);
  useEffect(() => {
    setItems(Array.from({ length: number }).map(() => ({
      top: Math.random() * 60 - 10 + "%", left: Math.random() * 100 + "%", delay: Math.random() * 6 + "s", dur: 5 + Math.random() * 6 + "s",
    })));
  }, [number]);
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {items.map((m, i) => (
        <span
          key={i}
          className="absolute top-1/2 left-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-foreground/60 shadow-[0_0_0_1px_rgba(255,255,255,.1)] before:absolute before:top-1/2 before:h-px before:w-[60px] before:-translate-y-1/2 before:bg-linear-to-r before:from-foreground/60 before:to-transparent before:content-['']"
          style={{ top: m.top, left: m.left, animationDelay: m.delay, animationDuration: m.dur }}
        />
      ))}
    </div>
  );
}
