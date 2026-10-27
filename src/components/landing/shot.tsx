"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Screenshot ekstensi dari public/shots (dibuat script Playwright). Kalau belum ada, tampil placeholder. */
export function Shot({ name, alt, width, height, className, priority = false }: { name: string; alt: string; width: number; height: number; className?: string; priority?: boolean }) {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-caption text-muted-foreground", className)} style={{ aspectRatio: `${width}/${height}` }}>
        screenshot {name}.png belum dibuat · jalankan npm run shots
      </div>
    );
  }
  // Dioptimalkan Next (WebP, ukuran sesuai layar) supaya decode gambar tidak membebani frame saat scroll.
  return <Image src={`/shots/${name}.png`} alt={alt} width={width} height={height} className={className} priority={priority} onError={() => setMissing(true)} sizes="(max-width: 768px) 100vw, 50vw" quality={78} />;
}
