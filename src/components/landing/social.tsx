"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberTicker } from "@/components/effects/number-ticker";
import { SectionHead } from "./sections";
import { Mascot } from "./mascot";

/**
 * Bukti sosial yang jujur: angka asli dari database (bukan angka karangan) dan program beta tester
 * yang mengubah pengunjung jadi pengguna pertama. Testimoni ditambahkan setelah ada yang benar-benar memakai.
 */
export function SocialProof() {
  const [stats, setStats] = useState<{ users: number; generates: number; licenses: number } | null>(null);
  const [email, setEmail] = useState("");
  const [kampus, setKampus] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "dup" | "err">("idle");
  const [err, setErr] = useState("");
  const floatRef = useRef<HTMLDivElement>(null);
  useGSAP(() => { gsap.utils.toArray<HTMLElement>(".bob").forEach((el, i) => gsap.to(el, { y: -6, duration: 1.5 + i * 0.5, yoyo: true, repeat: -1, ease: "sine.inOut" })); }, { scope: floatRef });
  useEffect(() => { fetch("/api/beta").then((r) => r.json()).then((j) => j.ok && setStats(j)).catch(() => {}); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState("busy"); setErr("");
    const r = await fetch("/api/beta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, kampus }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setState("err"); setErr(j.error || "Gagal."); return; }
    setState(j.dup ? "dup" : "done");
  }

  const spots = Math.max(0, 20 - (stats?.licenses || 0));
  return (
    <section id="beta" className="mx-auto max-w-6xl scroll-m-24 px-6 py-20">
      <SectionHead overline="Pengguna pertama" title="Belum ada testimoni. Jujur aja." sub="Produk ini baru. Daripada pasang kutipan karangan, kami kasih angka asli dan tempat buat kamu jadi 20 pengguna pertama." />
      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-1">
          {[
            { v: stats?.users ?? 0, label: "akun terdaftar" },
            { v: stats?.generates ?? 0, label: "laporan dirangkai" },
            { v: spots, label: "slot beta tersisa dari 20" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
              <p className="tnum text-h3 font-extrabold tracking-tight"><NumberTicker value={s.v} /></p>
              <p className="text-caption text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
          <div ref={floatRef} className="absolute -right-4 -top-4 flex gap-1 opacity-80">
            {["bara", "robo", "astro"].map((t) => <div key={t} className="bob will-change-transform"><Mascot themeId={t} size={48} /></div>)}
          </div>
          <h3 className="text-h5 font-bold tracking-tight">Program beta tester</h3>
          <ul className="mt-3 space-y-1.5 text-body-sm text-muted-foreground">
            {["Gratis 2 bulan, bukan 7 hari", "Nama kamu (kalau mau) tampil di halaman ini sebagai pengguna pertama", "Ngobrol langsung sama yang bikin, fitur yang kamu minta didahulukan", "Syaratnya satu: pakai beneran tiap hari kerja selama 2 minggu"].map((t) => (
              <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />{t}</li>
            ))}
          </ul>
          {state === "done" || state === "dup" ? (
            <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-body-sm text-emerald-600 dark:text-emerald-400">
              {state === "dup" ? "Email ini sudah terdaftar. Tunggu kabar dari kami, ya." : "Masuk daftar. Kami kirim kode lisensi beta lewat email dalam 1 sampai 2 hari."}
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input type="email" required placeholder="Email kamu" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Kampus / tempat magang (opsional)" value={kampus} onChange={(e) => setKampus(e.target.value)} />
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <Button type="submit" disabled={state === "busy"}>{state === "busy" ? "Sebentar..." : "Daftar beta"}</Button>
              {err && <p className="text-caption text-red-500 sm:col-span-3">{err}</p>}
            </form>
          )}
          <p className="mt-3 text-caption text-muted-foreground">Nggak ada spam. Email dipakai buat kirim kode dan tanya kabar sekali di minggu kedua.</p>
        </div>
      </div>
    </section>
  );
}
