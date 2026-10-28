"use client";

import { useEffect, useState } from "react";

/**
 * Latar ambient versi ringan: grid garis dari CSS background (statis) dan belasan sel yang
 * berkedip lewat animasi CSS opacity di layer sendiri. Tidak ada JavaScript per frame dan
 * tidak ada repaint SVG layar penuh seperti GridPattern bawaan kit.
 */
export function AmbientGrid({ size = 50, cells = 14, maxOpacity = 0.1 }: { size?: number; cells?: number; maxOpacity?: number }) {
  const [items, setItems] = useState<{ x: number; y: number; dur: number; delay: number }[]>([]);
  useEffect(() => {
    const cols = Math.ceil(window.innerWidth / size), rows = Math.ceil(window.innerHeight / size);
    setItems(Array.from({ length: cells }).map(() => ({ x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows), dur: 6 + Math.random() * 10, delay: Math.random() * 8 })));
  }, [size, cells]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 [mask-image:linear-gradient(to_top_left,white,transparent,transparent)]">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(to right, hsl(var(--foreground) / .12) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / .12) 1px, transparent 1px)", backgroundSize: `${size}px ${size}px`, backgroundPosition: "-1px -1px" }} />
      {items.map((c, i) => (
        <span key={i} className="absolute animate-[twinkle_var(--d)_ease-in-out_var(--delay)_infinite] bg-foreground will-change-[opacity]" style={{ left: c.x * size, top: c.y * size, width: size - 1, height: size - 1, opacity: 0, "--d": c.dur + "s", "--delay": c.delay + "s", "--max": maxOpacity } as React.CSSProperties} />
      ))}
      <style>{`@keyframes twinkle { 0%, 100% { opacity: 0; } 50% { opacity: var(--max, .1); } }`}</style>
    </div>
  );
}
