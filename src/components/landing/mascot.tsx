"use client";

import { useEffect, useRef, useState } from "react";

// Memuat file tema asli ekstensi (public/ext/*.js) supaya maskot di landing page identik dengan di produk.
type ThemeDef = { id: string; nama: string; maskot: string; deskripsi: string; bold?: boolean; flowers: string[]; char: (mood: string, size: number) => string; sway?: boolean; kalender?: string };
type Idle = { attach: (el: HTMLElement, o: Record<string, unknown>) => { update: (m?: string, t?: ThemeDef, s?: number) => void; destroy: () => void } };
type ThemesApi = { THEMES: ThemeDef[]; palette: (t: ThemeDef, dark: boolean) => Record<string, string> };

declare global { interface Window { SawitThemes?: ThemesApi; SawitIdle?: Idle; __extLoading?: Promise<void> } }

export function loadExt(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.SawitThemes && window.SawitIdle) return Promise.resolve();
  if (!window.__extLoading) {
    window.__extLoading = (async () => {
      for (const f of ["util.js", "templates.js", "sawit.js", "themes.js", "idle.js"]) {
        await new Promise<void>((res, rej) => {
          const s = document.createElement("script"); s.src = `/ext/${f}`; s.onload = () => res(); s.onerror = () => rej(new Error(f)); document.head.appendChild(s);
        });
      }
    })();
  }
  return window.__extLoading;
}

export function useThemes() {
  const [themes, setThemes] = useState<ThemeDef[]>([]);
  useEffect(() => { loadExt().then(() => setThemes(window.SawitThemes!.THEMES)); }, []);
  return themes;
}

export function usePalette(theme: ThemeDef | undefined, dark = false) {
  return theme && typeof window !== "undefined" && window.SawitThemes ? window.SawitThemes.palette(theme, dark) : null;
}

/** Maskot hidup: kedip, napas, melirik kursor. */
export function Mascot({ themeId = "sawit", mood = "happy", size = 120, className }: { themeId?: string; mood?: string; size?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handle = useRef<ReturnType<Idle["attach"]> | null>(null);
  useEffect(() => {
    let dead = false;
    loadExt().then(() => {
      if (dead || !ref.current) return;
      const theme = window.SawitThemes!.THEMES.find((t) => t.id === themeId) || window.SawitThemes!.THEMES[0];
      if (!handle.current) handle.current = window.SawitIdle!.attach(ref.current, { theme, mood, size });
      else handle.current.update(mood, theme, size);
    });
    return () => { dead = true; };
  }, [themeId, mood, size]);
  useEffect(() => () => { handle.current?.destroy(); handle.current = null; }, []);
  return <div ref={ref} className={className} style={{ width: size, height: size }} aria-label={`Maskot ${themeId}`} />;
}
