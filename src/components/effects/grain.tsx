"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

let cached: string | null = null;
/**
 * Tekstur grain 160px dibuat sekali di canvas lalu di-tile. Pakai alpha per piksel (bintik putih
 * dan hitam transparan), jadi tidak butuh mix-blend-mode. Blend mode memaksa GPU meracik ulang
 * lapisan layar penuh tiap frame; itu pemboros terbesar yang terukur.
 */
function makeNoise(): string {
  if (cached) return cached;
  const size = 160;
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const light = Math.random() < 0.5;
    const v = light ? 255 : 0;
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v;
    img.data[i + 3] = Math.random() * 90;
  }
  ctx.putImageData(img, 0, 0);
  cached = c.toDataURL("image/png");
  return cached;
}

export function Grain({ className, opacity = 0.35 }: { className?: string; opacity?: number }) {
  const [url, setUrl] = useState<string | null>(cached);
  useEffect(() => { setUrl(makeNoise()); }, []);
  if (!url) return null;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{ opacity, backgroundImage: `url(${url})`, backgroundRepeat: "repeat", backgroundSize: "160px 160px" }}
    />
  );
}
