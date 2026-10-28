"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Play, ShieldCheck, Flame } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/effects/spotlight";
import { FlipWords } from "@/components/effects/flip-words";
import { Meteors } from "@/components/effects/meteors";
import { Mascot } from "./mascot";
import { Shot } from "./shot";

/** Hitung mundur hidup ke jam 16.00 hari kerja berikutnya. */
function Countdown() {
  const [text, setText] = useState("");
  const [sub, setSub] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const day = now.getDay();
      const target = new Date(now); target.setHours(16, 0, 0, 0);
      if (day === 0 || day === 6) { setText("Weekend"); setSub("Istirahat. Senin lanjut."); return; }
      if (now >= target) { setText("Udah lewat 16.00"); setSub("Udah isi laporan hari ini?"); return; }
      const d = target.getTime() - now.getTime();
      const h = Math.floor(d / 3600000), m = Math.floor((d % 3600000) / 60000), s = Math.floor((d % 60000) / 1000);
      setText(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      setSub("lagi sampai pengingat jam 16.00");
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  return (
    <div>
      <p className="tnum text-h5 font-extrabold tracking-tight">{text || "--:--:--"}</p>
      <p className="text-caption text-muted-foreground">{sub}</p>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const q = gsap.utils.selector(ref);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // masuk: kata per kata, lalu panggung naik dari miring
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(q(".w"), { y: 40, opacity: 0, rotateX: -40, stagger: 0.06, duration: 0.8 }, 0.1)
      .from(q(".sub"), { y: 20, opacity: 0, duration: 0.6 }, 0.6)
      .from(q(".ctas > *"), { y: 16, opacity: 0, stagger: 0.08, duration: 0.5 }, 0.8)
      .from(q(".stage"), { y: 80, opacity: 0, rotateX: 32, duration: 1.1 }, 0.7)
      .from(q(".float"), { y: 30, opacity: 0, scale: 0.9, stagger: 0.08, duration: 0.6 }, 1.2);

    // scroll: panggung menegak lalu menjauh
    gsap.fromTo(q(".stage"), { rotateX: 14 }, { rotateX: 0, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "40% top", scrub: 0.6 }, immediateRender: false });
    gsap.to(q(".stage-wrap"), { y: 120, scale: 0.96, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: 0.6 } });
    gsap.to(q(".hero-copy"), { y: -80, opacity: 0.3, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "60% top", scrub: 0.6 } });

    // mouse: kartu melayang bergerak sesuai kedalaman
    if (reduce) return;
    const floats = q<HTMLElement>(".float").map((el) => ({ el, depth: Number(el.dataset.depth || 1), x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }), y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }) }));
    const stageX = gsap.quickTo(q(".stage")[0], "rotateY", { duration: 1, ease: "power3.out" });
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2, ny = (e.clientY / window.innerHeight - 0.5) * 2;
      floats.forEach((f) => { f.x(nx * 18 * f.depth); f.y(ny * 12 * f.depth); });
      stageX(nx * 4);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, { scope: ref });

  const words = ["Laporan", "MagangHub", "selesai"];

  return (
    <section ref={ref} className="relative overflow-hidden pt-32 pb-10 md:pt-36">
      <Spotlight className="-top-40 left-0 text-neutral-500 md:-top-20 md:left-1/3" />
      <Meteors number={12} className="opacity-60" />

      <div className="hero-copy relative z-10 mx-auto max-w-4xl px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-caption font-medium text-muted-foreground backdrop-blur">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
          Ekstensi Chrome · v0.2 · buat yang jam 23.58 baru inget
        </span>
        <h1 className="mt-7 text-[clamp(2.2rem,1.4rem+3.2vw,4.4rem)] font-extrabold leading-[1.02] tracking-[-0.03em] [perspective:800px]">
          <span className="whitespace-nowrap">
            {words.map((w, i) => (
              <span key={w} className="w inline-block will-change-transform">{w}{i < words.length - 1 ? " " : ""}</span>
            ))}
          </span>
          <br />
          <span className="w inline-block will-change-transform">sebelum&nbsp;kamu&nbsp;</span>
          <span className="w inline-block font-serif italic font-normal text-muted-foreground will-change-transform">
            <FlipWords words={["lihat jam.", "lupa.", "pulang.", "panik.", "ditegur mentor."]} />
          </span>
        </h1>
        <p className="sub mx-auto mt-5 max-w-[60ch] text-body text-muted-foreground md:text-lead">
          Jam 16.00 layar kamu diambil alih: maskot muncul, chime bunyi, MagangHub kebuka. Ceritain dikit hari ini ngapain, tiga kolom laporan dirangkai otomatis. Kamu yang tinjau dan kirim.
        </p>
        <div className="ctas mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="group rounded-full px-6">
            <Link href="/daftar">Coba gratis 7 hari <ArrowRight className="transition-transform group-hover:translate-x-0.5" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-6">
            <a href="#cara"><Play /> Lihat cara kerjanya</a>
          </Button>
        </div>
        <div className="sub mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-caption text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Tombol kirim tidak pernah ditekan otomatis</span>
          <span>11 tema</span>
          <span>4 suara chime</span>
          <span>Tanpa kartu kredit, tanpa drama</span>
        </div>
      </div>

      {/* panggung */}
      <div className="stage-wrap relative z-10 mx-auto mt-12 max-w-6xl px-6 will-change-transform [perspective:1600px]">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/10 blur-3xl" />
        <div className="stage relative mx-auto max-w-[1040px] will-change-transform [transform-style:preserve-3d]">
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-black/20 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-1.5 border-b px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" /><span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" /><span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="ml-3 flex-1 rounded-md bg-muted px-2 py-0.5 text-overline text-muted-foreground">monev.maganghub.kemnaker.go.id/dashboard/riwayat</span>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-overline font-bold uppercase text-emerald-500">rekaman asli</span>
            </div>
            <video className="block w-full" autoPlay muted loop playsInline poster="/shots/panel-bara.png" aria-label="Demo Absenin: layar pembuka, panel cerita, generate, isi ke form">
              <source src="/demo.webm" type="video/webm" />
            </video>
          </div>

          {/* kartu melayang: data-depth menentukan seberapa jauh ikut mouse */}
          <div data-depth="1.6" className="float absolute -left-10 top-10 hidden w-[230px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl will-change-transform lg:block dark:border-neutral-800 dark:bg-neutral-900">
            <Shot name="popup-sore" alt="Popup Absenin tema Sore" width={840} height={1200} className="w-full" />
          </div>
          <div data-depth="1.1" className="float absolute -right-8 -top-8 hidden items-center gap-3 rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-xl backdrop-blur will-change-transform lg:flex dark:border-neutral-800 dark:bg-neutral-900/90">
            <Mascot themeId="sore" size={56} />
            <Countdown />
          </div>
          <div data-depth="2" className="float absolute -right-6 bottom-16 hidden rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-xl backdrop-blur will-change-transform lg:block dark:border-neutral-800 dark:bg-neutral-900/90">
            <p className="text-overline font-bold uppercase text-muted-foreground">Streak</p>
            <p className="tnum text-h4 font-extrabold tracking-tight">15 <span className="text-caption font-semibold text-muted-foreground">hari</span></p>
            <div className="mt-1 flex gap-1">{Array.from({ length: 7 }).map((_, i) => <span key={i} className={`h-2 w-4 rounded-full ${i < 6 ? "bg-emerald-500" : "bg-amber-500"}`} />)}</div>
          </div>
          <div data-depth="1.3" className="float absolute -left-4 bottom-6 hidden items-center gap-2 rounded-full border border-neutral-200 bg-white/90 py-2 pr-4 pl-2 shadow-xl backdrop-blur will-change-transform lg:flex dark:border-neutral-800 dark:bg-neutral-900/90">
            <Mascot themeId="robo" size={36} />
            <span className="text-caption font-semibold">Robo: "Udah kuisi tiga kolomnya."</span>
          </div>
          <div data-depth="0.7" className="float absolute left-1/2 -top-12 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 shadow-xl backdrop-blur will-change-transform lg:flex dark:border-neutral-800 dark:bg-neutral-900/90">
            <Flame className="size-4 text-orange-500" />
            <span className="text-caption font-semibold">Jam 16.00 · layar pembuka · chime 5 detik</span>
          </div>
        </div>
      </div>
    </section>
  );
}
