"use client";

import { useRef } from "react";
import { AlarmClock, MessageSquareText, SendHorizontal } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SectionHead } from "./sections";
import { Shot } from "./shot";
import { Mascot } from "./mascot";

const STEPS = [
  {
    n: "01", icon: AlarmClock, title: "Jam pengingat tiba",
    desc: "Chrome dibawa ke depan dan fullscreen. Layar pembuka muncul: maskot tumbuh, kelopak jatuh, chime lima detik. Empat detik kemudian halaman Riwayat MagangHub kebuka.",
    bullets: ["Nggak kaget, nggak kelewat", "Ngulang tiap 10 menit sampai beres", "Tunda kalau lagi meeting"],
    shot: "splash-bara", w: 1366, h: 768, pos: "object-center", mascot: "bara", mood: "worried",
  },
  {
    n: "02", icon: MessageSquareText, title: "Ceritain dikit",
    desc: "Klik tanggal hari ini, panel ikut kebuka. Ketik satu baris, tap chip kegiatan, atau tebak dari riwayat Chrome. Pilih gaya: teknis, data, administrasi, rapat, desain, riset.",
    bullets: ["Satu baris cukup", "Tebak dari riwayat Chrome", "Belum ada gaya bengong seharian"],
    shot: "panel-robo", w: 1200, h: 900, pos: "object-right", mascot: "robo", mood: "happy",
  },
  {
    n: "03", icon: SendHorizontal, title: "Baca, centang, kirim sendiri",
    desc: "Tiga kolom terisi dan bisa diedit. Kamu yang membaca, mencentang pernyataan, dan menekan Simpan dan Kirim. Begitu terkirim, pengingat berhenti dan kebun dapat satu tanda baru.",
    bullets: ["Tombol kirim tetap kamu yang tekan", "Pengingat berhenti sendiri", "Maskot ikut senyum, seolah dia yang kerja"],
    shot: "panel-filled", w: 1200, h: 900, pos: "object-right", mascot: "astro", mood: "happy",
  },
];

/** Kartu bertumpuk: tiap langkah sticky di posisi yang sama; kartu berikutnya naik menutupi, kartu di bawahnya mengecil dan meredup. */
export function Steps() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cards = gsap.utils.toArray<HTMLElement>(".step-card");
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, {
          scale: 0.93, opacity: 0.45, y: -24, ease: "none",
          scrollTrigger: { trigger: next, start: "top 85%", end: "top 12%", scrub: 0.4 },
        });
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section id="cara" className="mx-auto max-w-6xl scroll-m-24 px-6 py-20">
      <SectionHead overline="Cara kerja" title="Tiga langkah, dua menit." sub="Lebih cepat dari ngantri fotokopi." />
      <div ref={root} className="relative mt-12">
        {STEPS.map((s, i) => (
          <div key={s.n} className="step-card mb-8 origin-top will-change-transform lg:sticky lg:top-[12vh] lg:mb-[22vh] lg:h-[76vh] last:lg:mb-0">
            <div className="grid h-full overflow-hidden rounded-3xl border border-neutral-200 bg-card shadow-xl shadow-black/5 lg:grid-cols-[0.9fr_1.1fr] dark:border-neutral-800">
              <div className="relative flex flex-col justify-center p-8 md:p-12">
                <div className="flex items-center gap-3">
                  <span className="tnum text-overline font-bold uppercase text-muted-foreground">Langkah {s.n}</span>
                  <span className="h-px flex-1 bg-border" />
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"><s.icon className="size-4" /></span>
                </div>
                <h3 className="mt-6 text-h4 font-extrabold tracking-tight md:text-h3">{s.title}</h3>
                <p className="mt-4 max-w-[46ch] text-body text-muted-foreground">{s.desc}</p>
                <ul className="mt-6 space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-body-sm"><span className="h-1.5 w-1.5 rounded-full bg-foreground" />{b}</li>
                  ))}
                </ul>
                <div className="mt-8 flex items-center gap-3 text-caption text-muted-foreground">
                  <Mascot themeId={s.mascot} mood={s.mood} size={40} />
                  <span>{i === 0 ? "Bara mulai gelisah. Wajar, jam 16.00." : i === 1 ? "Robo nunggu satu baris aja." : "Astro lega. Besok ketemu lagi."}</span>
                </div>
                <span aria-hidden className="pointer-events-none absolute -bottom-6 -left-2 select-none text-[10rem] font-extrabold leading-none text-foreground/[0.04]">{s.n}</span>
              </div>
              <div className="relative min-h-[260px] bg-muted/40 p-4 md:p-6 lg:p-8">
                <div className="h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                  <Shot name={s.shot} alt={s.title} width={s.w} height={s.h} className={`h-full w-full object-cover ${s.pos}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
