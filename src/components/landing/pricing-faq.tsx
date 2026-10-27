"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlurFade from "@/components/effects/blur-fade";
import { MovingBorder } from "@/components/effects/moving-border";
import { Sparkles } from "@/components/effects/sparkles";
import { SectionHead } from "./sections";
import { Mascot } from "./mascot";
import { PLANS, FAQ } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="harga" className="mx-auto max-w-6xl scroll-m-24 px-6 py-20">
      <SectionHead overline="Harga" title="Lebih murah dari satu kali kena tegur." sub="Mulai gratis. Bayar kalau memang kepakai tiap hari. Kalau nggak kepakai, berarti kamu rajin. Selamat." />
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {PLANS.map((p, i) => {
          const card = (
            <div className={cn("flex h-full flex-col rounded-xl border bg-white p-6 shadow-xs dark:bg-neutral-900/50", p.featured ? "border-transparent" : "border-neutral-200 dark:border-neutral-800")}>
              <div className="flex items-center justify-between">
                <h3 className="text-h5 font-bold tracking-tight">{p.nama}</h3>
                {p.featured && <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-overline font-bold uppercase text-emerald-500">Paling pas</span>}
              </div>
              <p className="mt-1 text-body-sm text-muted-foreground">{p.deskripsi}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="tnum text-h3 font-extrabold tracking-tight">{p.harga}</span>
                <span className="text-caption text-muted-foreground">/ {p.periode}</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-body-sm">
                {p.fitur.map((f) => <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-emerald-500" /><span>{f}</span></li>)}
              </ul>
              <Button asChild className="mt-8 rounded-full" variant={p.featured ? "default" : "outline"}>
                <Link href={p.id === "tim" ? "mailto:halo@magangdiary.id?subject=Paket%20Tim" : `/daftar?plan=${p.id}`}>{p.cta}</Link>
              </Button>
            </div>
          );
          return (
            <BlurFade key={p.id} inView delay={i * 0.06} className={p.featured ? "lg:-mt-4 lg:mb-4" : ""}>
              {p.featured ? <MovingBorder className="h-full" duration="7s">{card}</MovingBorder> : card}
            </BlurFade>
          );
        })}
      </div>
      <p className="mt-6 text-center text-caption text-muted-foreground">Harga masih bisa berubah sebelum rilis publik. Semua paket: tombol kirim tetap kamu yang tekan. Itu bukan fitur, itu prinsip.</p>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-m-24 px-6 py-20">
      <SectionHead overline="FAQ" title="Yang biasanya ditanya duluan." />
      <div className="mt-10 divide-y rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
        {FAQ.map((f, i) => (
          <div key={f.q}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left">
              <span className="text-body font-semibold">{f.q}</span>
              <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-300", open === i && "rotate-180")} />
            </button>
            <Collapse open={open === i}><p className="px-6 pb-5 text-body-sm text-muted-foreground">{f.a}</p></Collapse>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Buka/tutup dengan tinggi diukur, lalu dilepas ke auto (GSAP). */
function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    const el = ref.current!;
    if (first.current) { first.current = false; gsap.set(el, { height: open ? "auto" : 0, opacity: open ? 1 : 0 }); return; }
    gsap.killTweensOf(el);
    if (open) gsap.to(el, { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" });
    else gsap.to(el, { height: 0, opacity: 0, duration: 0.25, ease: "power2.in" });
  }, [open]);
  return <div ref={ref} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>{children}</div>;
}

export function FinalCta() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.from(".cta-mascot", { y: 20, opacity: 0, stagger: 0.08, duration: 0.6, ease: "back.out(1.6)", scrollTrigger: { trigger: ref.current, start: "top 80%", once: true } });
  }, { scope: ref });
  return (
    <section className="px-6 py-20">
      <div ref={ref} className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-neutral-200 bg-foreground px-6 py-16 text-center text-background shadow-2xl dark:border-neutral-800">
        <Sparkles className="text-background/70" density={60} />
        <div className="relative">
          <div className="mx-auto flex w-fit items-end gap-2">
            {["sawit", "bara", "robo", "astro", "beruang"].map((t) => (
              <div key={t} className="cta-mascot will-change-transform"><Mascot themeId={t} size={56} /></div>
            ))}
          </div>
          <h2 className="mt-6 text-h3 font-extrabold tracking-tight md:text-h2">Besok jam 16.00, ada yang ngingetin.</h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-body text-background/70">Pasang sekali, lupakan. Lupakannya beneran, karena ingat-mengingat memang tugas dia. Tujuh hari pertama gratis, tanpa kartu.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-full px-6"><Link href="/daftar">Coba gratis 7 hari</Link></Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full px-6 text-background hover:bg-background/10 hover:text-background"><Link href="/login">Sudah punya lisensi</Link></Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-caption text-muted-foreground md:flex-row">
        <p>© {new Date().getFullYear()} Magang Diary. Bukan produk resmi Kemnaker atau MagangHub. Cuma teman kecil di pojok kanan bawah.</p>
        <div className="flex gap-5">
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <Link href="/privasi" className="hover:text-foreground">Privasi</Link>
          <Link href="/syarat" className="hover:text-foreground">Syarat dan refund</Link>
          <Link href="/login" className="hover:text-foreground">Masuk</Link>
          <Link href="/admin" className="hover:text-foreground">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
