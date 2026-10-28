"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, Check, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./shell";
import { licenseView } from "@/lib/license-kind";
import type { License } from "@/lib/db";

function fmt(d: string) { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }); }

export function LicenseCard({ license, usedToday }: { license: License; usedToday: number }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const { kind, expired, daysLeft } = licenseView(license);
  const label = kind === "revoked" ? "Dicabut" : expired ? "Kedaluwarsa" : kind === "trial" ? "Trial" : "Aktif";
  const pct = Math.min(100, Math.round((usedToday / license.dailyQuota) * 100));
  async function copy() { await navigator.clipboard.writeText(license.key); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-overline font-bold uppercase text-muted-foreground">Kode lisensi · paket {license.plan}</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="tnum rounded-md bg-muted px-3 py-1.5 font-mono text-body font-semibold tracking-wider">{show ? license.key : license.key.replace(/^(AB-[A-Z0-9]{4})-[A-Z0-9]{4}-([A-Z0-9]{4})$/, "$1-••••-$2")}</code>
            <Button variant="ghost" size="icon" aria-label="Lihat" onClick={() => setShow(!show)}>{show ? <EyeOff /> : <Eye />}</Button>
            <Button variant="ghost" size="icon" aria-label="Salin" onClick={copy}>{copied ? <Check className="text-emerald-500" /> : <Copy />}</Button>
          </div>
        </div>
        <StatusPill kind={kind} label={label} />
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <div>
          <p className="text-caption text-muted-foreground">Berlaku sampai</p>
          <p className="tnum mt-1 font-semibold">{fmt(license.expiresAt)}</p>
          <p className="text-caption text-muted-foreground">{expired ? "sudah lewat" : `${daysLeft} hari lagi`}</p>
        </div>
        <div>
          <p className="text-caption text-muted-foreground">Kuota hari ini</p>
          <p className="tnum mt-1 font-semibold">{usedToday} / {license.dailyQuota} generate</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground transition-all duration-500" style={{ width: pct + "%" }} /></div>
        </div>
        <div>
          <p className="text-caption text-muted-foreground">Perangkat</p>
          <p className="mt-1 truncate font-semibold">{license.deviceName || "Belum diaktifkan di ekstensi"}</p>
          <p className="text-caption text-muted-foreground">{license.lastUsedAt ? "terakhir " + new Date(license.lastUsedAt).toLocaleString("id-ID") : "belum pernah dipakai"}</p>
        </div>
      </div>
    </div>
  );
}

export function TrialButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function go() {
    setBusy(true); setErr("");
    const r = await fetch("/api/me/trial", { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setErr(j.error || "Gagal."); return; }
    router.refresh();
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
      <p className="text-body font-semibold">Belum ada lisensi.</p>
      <p className="mt-1 max-w-[44ch] text-body-sm text-muted-foreground">Aktifkan trial 7 hari, tempel kodenya di pengaturan ekstensi, dan pengingat besok sore sudah jalan.</p>
      <Button className="mt-5" onClick={go} disabled={busy}><RefreshCw className={busy ? "animate-spin" : ""} /> Aktifkan trial gratis</Button>
      {err && <p className="mt-3 text-caption text-red-500">{err}</p>}
    </div>
  );
}
