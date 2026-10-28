"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Grain } from "@/components/effects/grain";
import { Mascot, useThemes } from "./mascot";
import { THEME_ORDER } from "@/lib/site";

/** Galeri tema bergulir horizontal saat halaman di-scroll vertikal: ScrollTrigger pin + scrub, hanya transform. */
export function HorizontalThemes({ onPick }: { onPick?: (id: string) => void }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const themes = useThemes();
  const list = THEME_ORDER.map((id) => themes.find((t) => t.id === id)).filter(Boolean);

  useGSAP(() => {
    if (!track.current || list.length === 0) return;
    const getDist = () => Math.max(0, track.current!.scrollWidth - window.innerWidth + 48);
    const tween = gsap.to(track.current, {
      x: () => -getDist(),
      ease: "none",
      scrollTrigger: { trigger: root.current, start: "top top", end: () => "+=" + getDist(), pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true },
    });
    gsap.to(".wm", { xPercent: -30, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: () => "+=" + getDist(), scrub: true } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, { scope: root, dependencies: [list.length] });

  return (
    <section ref={root} className="relative h-screen overflow-hidden">
      <div className="wm pointer-events-none absolute top-16 left-6 whitespace-nowrap text-[18vw] font-extrabold leading-none tracking-tight text-foreground/[0.04] select-none will-change-transform md:top-10">
        sebelas tema sebelas teman
      </div>
      <div className="relative z-10 flex h-full flex-col justify-center">
        <div className="mb-8 px-6 md:px-12">
          <p className="text-overline font-bold uppercase text-muted-foreground">Galeri tema</p>
          <h2 className="mt-2 text-h3 font-extrabold tracking-tight md:text-h2">Geser ke kanan. Eh, ke bawah.</h2>
        </div>
        <div ref={track} className="flex w-max gap-6 px-6 will-change-transform md:px-12">
          {list.map((t, i) => {
            const pal = typeof window !== "undefined" && window.SawitThemes ? window.SawitThemes.palette(t!, false) : null;
            return (
              <button
                key={t!.id}
                onClick={() => onPick?.(t!.id)}
                className="group relative h-[420px] w-[300px] shrink-0 overflow-hidden rounded-3xl border border-black/10 text-left shadow-lg transition-transform duration-500 [transition-timing-function:cubic-bezier(.22,1,.36,1)] hover:-translate-y-3 md:h-[480px] md:w-[340px]"
                style={{ background: pal?.bg || "#eee", color: pal?.ink || "#222" }}
              >
                <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${pal?.hero1 || "#f3f3f3"}, ${pal?.hero2 || "#e9e9e9"} 60%, ${pal?.bg || "#eee"})` }} />
                <Grain opacity={t!.bold ? 0.14 : 0.08} />
                <div className="relative flex h-full flex-col p-7">
                  <div className="flex items-center justify-between">
                    <span className="tnum text-overline font-bold uppercase opacity-60">{String(i + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</span>
                    <span className="rounded-full px-3 py-1 text-overline font-bold uppercase" style={{ background: pal?.chip, color: pal?.["chip-ink"] }}>{t!.bold ? "gelap" : "terang"}</span>
                  </div>
                  <div className="my-auto flex justify-center transition-transform duration-500 group-hover:scale-110">
                    <Mascot themeId={t!.id} size={170} />
                  </div>
                  <div>
                    <h3 className="text-h5 font-extrabold tracking-tight">{t!.nama}</h3>
                    <p className="mt-1 text-body-sm opacity-75">{t!.deskripsi}</p>
                    <div className="mt-4 flex gap-1.5">
                      {["primary", "secondary", "chip", "pending-bg", "done-bg"].map((k) => <span key={k} className="h-4 w-4 rounded-full border border-black/10" style={{ background: pal?.[k] }} />)}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          <div className="flex w-[300px] shrink-0 items-center justify-center rounded-3xl border border-dashed p-7 text-center md:w-[340px]">
            <div>
              <p className="text-h5 font-extrabold tracking-tight">Mau tema sendiri?</p>
              <p className="mt-2 text-body-sm text-muted-foreground">Paket Tim bisa pesan tema dengan warna dan maskot kampus atau perusahaan. Maskot rektor? Bisa dibahas.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
