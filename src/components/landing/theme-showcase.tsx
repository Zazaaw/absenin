"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Grain } from "@/components/effects/grain";
import { Mascot, useThemes } from "./mascot";
import { SectionHead } from "./sections";
import { THEME_ORDER } from "@/lib/site";
import { cn } from "@/lib/utils";

const MOODS = [
  { id: "happy", label: "Beres", emoji: "✓" },
  { id: "worried", label: "Lewat jam", emoji: "!" },
  { id: "wilted", label: "Dua jam lewat", emoji: "…" },
  { id: "sleep", label: "Libur", emoji: "z" },
];

type Pal = Record<string, string>;

/**
 * Panggung pemilih tema ala layar pilih karakter. Semua gerak lewat GSAP:
 * warna latar/palet di-tween (bukan transition CSS), maskot masuk dengan spring (back.out),
 * partikel ikon kalender melayang berulang, kalender mini muncul berurutan, tombol maskot membesar.
 */
export function ThemeShowcase({ initial = "sore" }: { initial?: string }) {
  const themes = useThemes();
  const [id, setId] = useState(initial);
  const [mood, setMood] = useState("happy");
  const [dark, setDark] = useState(false);
  const theme = themes.find((t) => t.id === id);
  const [pal, setPal] = useState<Pal | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const partRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (theme && window.SawitThemes) setPal(window.SawitThemes.palette(theme, dark)); }, [theme, dark]);
  useEffect(() => {
    const h = (e: Event) => { const d = (e as CustomEvent<string>).detail; if (d) { setId(d); document.getElementById("tema")?.scrollIntoView({ behavior: "smooth", block: "start" }); } };
    window.addEventListener("md:pick-theme", h);
    return () => window.removeEventListener("md:pick-theme", h);
  }, []);

  // warna panel, blob, cincin, bayangan, swatch: tween ke palet baru
  useGSAP(() => {
    if (!pal) return;
    const q = gsap.utils.selector(root);
    gsap.to(q(".panel"), { backgroundColor: pal.bg, color: pal.ink, duration: 0.7, ease: "power2.out" });
    gsap.to(q(".blob-a"), { background: `radial-gradient(60% 70% at 30% 30%, ${pal.hero1} 0%, transparent 70%)`, duration: 0.8 });
    gsap.to(q(".blob-b"), { background: `radial-gradient(50% 60% at 75% 70%, ${pal.secondary} 0%, transparent 70%)`, duration: 0.8 });
    gsap.to(q(".glow"), { background: `radial-gradient(closest-side, ${pal.primary}55, transparent)`, duration: 0.8 });
    gsap.to(q(".ring"), { borderColor: pal.accent, duration: 0.6 });
    gsap.to(q(".shadow-pill"), { backgroundColor: pal.ink, duration: 0.6 });
    gsap.to(q(".swatch"), { backgroundColor: (i: number) => pal[["bg", "paper", "primary", "secondary", "chip", "pending-bg", "done-bg"][i]] || "#ccc", duration: 0.5, stagger: 0.03 });
    gsap.to(q(".bar"), { backgroundColor: `${pal.paper}cc`, duration: 0.6 });
    gsap.to(q(".cal"), { backgroundColor: pal.paper, duration: 0.6 });
  }, { scope: root, dependencies: [pal] });

  // maskot: muncul dengan spring tiap ganti tema/mood
  useGSAP(() => {
    gsap.fromTo(stageRef.current, { scale: 0.5, opacity: 0, rotate: -8, y: 30 }, { scale: 1, opacity: 1, rotate: 0, y: 0, duration: 0.7, ease: "back.out(1.8)" });
    gsap.fromTo(infoRef.current, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" });
    gsap.fromTo(root.current!.querySelectorAll(".cell"), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, stagger: 0.03, ease: "back.out(2)" });
  }, { scope: root, dependencies: [id, mood] });

  // partikel ikon kalender: melayang naik berulang
  useGSAP(() => {
    const parts = partRef.current?.querySelectorAll<HTMLElement>(".particle");
    if (!parts?.length) return;
    const tweens = Array.from(parts).map((el, i) => gsap.fromTo(el, { opacity: 0, y: 20, scale: 0.6 }, { keyframes: [{ opacity: 0.55, y: -10, scale: 1, duration: 2 + (i % 3) }, { opacity: 0, y: -40, scale: 0.8, duration: 2 + (i % 3) }], repeat: -1, repeatDelay: 1, delay: i * 0.5, ease: "sine.inOut" }));
    return () => tweens.forEach((t) => t.kill());
  }, { scope: root, dependencies: [id] });

  // cincin putar pelan
  useGSAP(() => { gsap.to(root.current!.querySelector(".ring"), { rotate: 360, duration: 30, repeat: -1, ease: "none" }); }, { scope: root });

  // tombol pilih tema: aktif membesar, lainnya meredup
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".pick").forEach((el) => {
      const on = el.dataset.id === id;
      gsap.to(el, { scale: on ? 1.08 : 1, opacity: on ? 1 : 0.7, backgroundColor: on ? pal?.primary || "transparent" : "rgba(0,0,0,0)", color: on ? pal?.["primary-ink"] || "#000" : pal?.ink || "#000", duration: 0.35, ease: "power2.out" });
    });
  }, { scope: root, dependencies: [id, pal] });

  const ordered = THEME_ORDER.map((x) => themes.find((t) => t.id === x)).filter(Boolean);
  const mark = (theme as unknown as { mark?: (c: string) => string } | undefined)?.mark;
  const hoverUp = (e: React.MouseEvent<HTMLElement>) => gsap.to(e.currentTarget, { y: -4, duration: 0.25, ease: "power2.out" });
  const hoverDown = (e: React.MouseEvent<HTMLElement>) => gsap.to(e.currentTarget, { y: 0, duration: 0.25, ease: "power2.out" });
  const tap = (e: React.MouseEvent<HTMLElement>) => gsap.fromTo(e.currentTarget, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });

  return (
    <section id="tema" className="scroll-m-24 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead overline="Pilih karakter" title="Siapa yang bakal ngingetin kamu?" sub="Klik maskot di bawah. Latar, palet, suara, dan ikon kalender ikut berubah. Coba juga ganti mood-nya. Mereka nggak tersinggung." />
      </div>

      <div ref={root}>
        <div className="panel relative mx-auto mt-12 max-w-6xl overflow-hidden rounded-[32px] border border-black/10 shadow-2xl" style={{ background: pal?.bg || "#f4f4f2", color: pal?.ink || "#2e3340" }}>
          <div aria-hidden className="blob-a absolute inset-0 animate-aurora" />
          <div aria-hidden className="blob-b absolute inset-0 opacity-60 [animation:aurora_18s_ease-in-out_infinite_alternate-reverse]" />
          <Grain opacity={theme?.bold ? 0.14 : 0.08} />
          {mark && pal && (
            <div ref={partRef} aria-hidden className="pointer-events-none absolute inset-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={id + i} className="particle absolute h-6 w-6 will-change-transform" style={{ left: `${8 + i * 9}%`, top: `${20 + ((i * 37) % 60)}%`, opacity: 0 }} dangerouslySetInnerHTML={{ __html: mark(theme!.flowers[i % theme!.flowers.length]) }} />
              ))}
            </div>
          )}

          <div className="relative grid gap-8 p-8 md:grid-cols-[1.1fr_1fr] md:p-12">
            <div className="relative flex min-h-[380px] items-center justify-center">
              <div aria-hidden className="glow absolute h-[360px] w-[360px] rounded-full blur-2xl" />
              <div aria-hidden className="ring absolute h-[300px] w-[300px] rounded-full border opacity-30 [border-style:dashed] will-change-transform" />
              <div ref={stageRef} key={id + mood} className="relative will-change-transform">
                <Mascot themeId={id} mood={mood} size={260} />
              </div>
              <div aria-hidden className="shadow-pill absolute bottom-10 h-4 w-40 rounded-full opacity-10 blur-md" />
            </div>

            <div className="flex flex-col justify-center">
              <div ref={infoRef} key={id}>
                <p className="text-overline font-bold uppercase opacity-60">{theme?.kalender || "Kalender"} · {theme?.bold ? "tema gelap" : "tema terang"}</p>
                <h3 className="mt-1 text-h3 font-extrabold tracking-tight">{theme?.nama || "Memuat..."}</h3>
                <p className="mt-2 max-w-[44ch] text-body opacity-80">{theme?.deskripsi}</p>
              </div>

              <div className="mt-6">
                <p className="text-overline font-bold uppercase opacity-60">Mood hari ini</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button key={m.id} onClick={(e) => { tap(e); setMood(m.id); }} className="rounded-full px-4 py-1.5 text-body-sm font-bold transition-colors duration-300 will-change-transform" style={{ background: mood === m.id ? pal?.primary : pal?.tertiary, color: mood === m.id ? pal?.["primary-ink"] : pal?.["tertiary-ink"] }}>
                      <span className="mr-1.5 opacity-70">{m.emoji}</span>{m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-overline font-bold uppercase opacity-60">Palet</p>
                  <div className="mt-2 flex gap-2">
                    {["bg", "paper", "primary", "secondary", "chip", "pending-bg", "done-bg"].map((k) => (
                      <span key={k} title={k} className="swatch h-7 w-7 rounded-full border border-black/10 shadow-xs" style={{ background: pal?.[k] }} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-overline font-bold uppercase opacity-60">Mode</p>
                  <button onClick={(e) => { tap(e); setDark(!dark); }} className="mt-2 rounded-full px-4 py-1.5 text-body-sm font-bold" style={{ background: pal?.tertiary, color: pal?.["tertiary-ink"] }}>{dark ? "Malam" : "Siang"} · ganti</button>
                </div>
              </div>

              <div className="cal mt-6 rounded-2xl p-3" style={{ background: pal?.paper }}>
                <div className="mb-2 flex items-center justify-between px-1 text-caption font-bold"><span>{theme?.kalender || "Kalender"} Oktober</span><span className="opacity-60">streak 9</span></div>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const done = [0, 1, 2, 3, 7, 8, 9, 10].includes(i);
                    const weekend = i % 7 >= 5;
                    const today = i === 11;
                    return (
                      <div key={id + i} className="cell flex h-9 items-center justify-center rounded-lg text-caption font-semibold will-change-transform" style={{ background: today ? pal?.["pending-bg"] : done ? pal?.["done-bg"] : weekend ? pal?.["off-bg"] : pal?.soft, color: today ? pal?.["pending-ink"] : done ? pal?.["done-ink"] : weekend ? pal?.["off-ink"] : pal?.muted, outline: today ? `2px solid ${pal?.accent}` : "none" }}>
                        {done && mark ? <span className="h-4 w-4" dangerouslySetInnerHTML={{ __html: mark(theme!.flowers[i % 5]) }} /> : 13 + i}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bar relative border-t border-black/10 px-4 py-5">
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {ordered.map((t) => (
                <button key={t!.id} data-id={t!.id} onClick={() => setId(t!.id)} onMouseEnter={hoverUp} onMouseLeave={hoverDown} className={cn("pick flex shrink-0 flex-col items-center gap-1 rounded-2xl px-4 py-3 will-change-transform", id === t!.id && "shadow-md")}>
                  <Mascot themeId={t!.id} size={44} />
                  <span className="text-caption font-bold">{t!.nama.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
