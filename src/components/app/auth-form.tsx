"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BlurFade from "@/components/effects/blur-fade";
import { Logo } from "@/components/landing/navbar";
import { Mascot } from "@/components/landing/mascot";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const plan = params.get("plan");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, name, setuju }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setErr(j.error || "Gagal."); return; }
    router.push(plan ? `/checkout?plan=${plan}` : j.role === "admin" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-6 py-16">
      <BlurFade className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Mascot themeId="simpel" size={64} />
          <Logo />
          <div>
            <h1 className="text-h5 font-bold tracking-tight">{mode === "login" ? "Masuk" : "Buat akun"}</h1>
            <p className="mt-1 text-body-sm text-muted-foreground">{mode === "login" ? "Kelola lisensi dan lihat pemakaian." : plan ? `Lanjut ke paket ${plan} setelah daftar.` : "Trial 7 hari langsung aktif setelah daftar."}</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
          {mode === "register" && <Input placeholder="Nama panggilan" value={name} onChange={(e) => setName(e.target.value)} />}
          <Input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Kata sandi" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {mode === "register" && (
            <label className="flex items-start gap-2 text-caption text-muted-foreground">
              <input type="checkbox" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} className="mt-0.5" required />
              <span>Saya setuju dengan <Link href="/syarat" className="font-semibold text-foreground underline-offset-4 hover:underline" target="_blank">Syarat Layanan</Link> dan <Link href="/privasi" className="font-semibold text-foreground underline-offset-4 hover:underline" target="_blank">Kebijakan Privasi</Link>, termasuk bahwa laporan tetap saya yang kirim.</span>
            </label>
          )}
          {err && <p className="text-caption text-red-500">{err}</p>}
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sebentar..." : mode === "login" ? "Masuk" : "Daftar"}</Button>
          <p className="pt-1 text-center text-caption text-muted-foreground">
            {mode === "login" ? <>Belum punya akun? <Link href="/daftar" className="font-semibold text-foreground underline-offset-4 hover:underline">Daftar</Link></> : <>Sudah punya akun? <Link href="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">Masuk</Link></>}
          </p>
        </form>
        <p className="mt-4 text-center text-overline uppercase text-muted-foreground">Mode lokal: admin@magangdiary.local / admin123 · demo@magangdiary.local / demo123</p>
      </BlurFade>
    </div>
  );
}
