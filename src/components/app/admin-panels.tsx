"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Copy, Plus, Search, Sparkles, Users as UsersIcon, Zap, Clock, Unlink, Ban, RotateCcw, CalendarPlus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PillTabs from "@/components/ui/pill-tabs";
import { Empty, Panel, StatusPill } from "./shell";
import { cn } from "@/lib/utils";
import { kindOf, daysLeft as daysLeftOf } from "@/lib/license-kind";
import type { License, RemoteConfig, User } from "@/lib/db";

const fmt = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
const fmtLong = (d: Date | string) => new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/* ---------------------------------------------------------------- Buat lisensi */

const PLANS = [
  { id: "trial", label: "Trial", desc: "Coba gratis. Cocok buat beta tester atau yang masih ragu.", icon: Sparkles, days: 7, quota: 6 },
  { id: "pro", label: "Pro", desc: "Pembeli perorangan. Pilihan yang paling sering dipakai.", icon: Zap, days: 30, quota: 6 },
  { id: "tim", label: "Tim", desc: "Satu kode per anggota, dibeli bareng sekantor atau sekampus.", icon: UsersIcon, days: 30, quota: 10 },
] as const;
const DAY_PRESETS = [7, 30, 90, 365];
const QUOTA_PRESETS = [6, 10, 20];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-body-sm font-semibold">{label}</label>
      {hint && <p className="mt-0.5 mb-2 text-caption text-muted-foreground">{hint}</p>}
      {!hint && <div className="mb-2" />}
      {children}
    </div>
  );
}

function Chips({ options, value, onChange, suffix }: { options: number[]; value: number; onChange: (v: number) => void; suffix: string }) {
  const custom = !options.includes(value);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} className={cn("rounded-full border px-3.5 py-1.5 text-body-sm font-medium transition-colors", value === o ? "border-foreground bg-foreground text-background" : "border-input hover:bg-accent")}>
          {o} {suffix}
        </button>
      ))}
      <div className={cn("flex items-center gap-1.5 rounded-full border px-2 py-0.5", custom ? "border-foreground" : "border-input")}>
        <span className="pl-1.5 text-caption text-muted-foreground">lain:</span>
        <input type="number" min={1} value={custom ? value : ""} placeholder="…" onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))} className="w-14 bg-transparent text-body-sm outline-hidden tnum" />
      </div>
    </div>
  );
}

export function CreateLicenseForm({ defaults, prefillEmail = "" }: { defaults: { trialDays: number; defaultDailyQuota: number }; prefillEmail?: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<(typeof PLANS)[number]["id"]>(prefillEmail ? "trial" : "pro");
  const [email, setEmail] = useState(prefillEmail);
  const [days, setDays] = useState(prefillEmail ? defaults.trialDays : 30);
  const [quota, setQuota] = useState(defaults.defaultDailyQuota);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<License | null>(null);
  const [copied, setCopied] = useState<"key" | "msg" | null>(null);

  function pickPlan(id: (typeof PLANS)[number]["id"]) {
    const p = PLANS.find((x) => x.id === id)!;
    setPlan(id);
    setDays(id === "trial" ? defaults.trialDays : p.days);
    setQuota(id === "tim" ? p.quota : defaults.defaultDailyQuota);
  }
  const [now] = useState(() => Date.now());
  const until = useMemo(() => new Date(now + days * 86400000), [now, days]);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailOk) { setErr("Email pembeli belum benar."); return; }
    setBusy(true); setErr("");
    const r = await fetch("/api/admin/licenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, plan, days, dailyQuota: quota, note }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setErr(j.error || "Gagal membuat lisensi."); return; }
    setDone(j.license);
    router.refresh();
  }
  async function copy(what: "key" | "msg", text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(what); setTimeout(() => setCopied(null), 1500);
  }

  if (done) {
    const msg = `Halo! Ini kode lisensi Absenin kamu:\n\n${done.key}\n\nPaket ${PLANS.find((p) => p.id === done.plan)?.label}, berlaku sampai ${fmtLong(done.expiresAt)}, ${done.dailyQuota} generate per hari.\n\nCara pakai: buka ikon Absenin di Chrome → Pengaturan → Akun → tempel kode → Aktifkan. Kalau belum pasang ekstensinya, unduh di ${location.origin}/dashboard.`;
    return (
      <Panel className="p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"><Check className="size-5" /></span>
          <div>
            <h3 className="text-h5 font-bold tracking-tight">Lisensi dibuat</h3>
            <p className="text-body-sm text-muted-foreground">Untuk {done.email}. Kirim kodenya ke pembeli, sisanya mereka yang aktifkan sendiri di ekstensi.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-dashed bg-muted/40 p-5 sm:flex-row sm:items-center">
          <code className="tnum rounded-lg bg-background px-4 py-2.5 font-mono text-h5 font-bold tracking-widest shadow-xs">{done.key}</code>
          <Button variant="outline" onClick={() => copy("key", done.key)}>{copied === "key" ? <Check className="text-emerald-500" /> : <Copy />}{copied === "key" ? "Tersalin" : "Salin kode"}</Button>
          <Button variant="outline" onClick={() => copy("msg", msg)}>{copied === "msg" ? <Check className="text-emerald-500" /> : <Copy />}{copied === "msg" ? "Tersalin" : "Salin pesan untuk pembeli"}</Button>
        </div>
        <dl className="mt-6 grid gap-4 text-body-sm sm:grid-cols-3">
          <div><dt className="text-caption text-muted-foreground">Paket</dt><dd className="mt-0.5 font-semibold capitalize">{done.plan}</dd></div>
          <div><dt className="text-caption text-muted-foreground">Berlaku sampai</dt><dd className="mt-0.5 font-semibold">{fmtLong(done.expiresAt)}</dd></div>
          <div><dt className="text-caption text-muted-foreground">Jatah generate</dt><dd className="mt-0.5 font-semibold">{done.dailyQuota} kali per hari</dd></div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button onClick={() => { setDone(null); setEmail(""); setNote(""); }}><Plus />Buat lagi</Button>
          <Button asChild variant="outline"><Link href="/admin/lisensi">Lihat daftar lisensi</Link></Button>
        </div>
      </Panel>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Panel className="p-6">
          <Field label="1. Paket" hint="Menentukan durasi dan jatah bawaan. Semuanya masih bisa kamu ubah di bawah.">
            <div className="grid gap-3 sm:grid-cols-3">
              {PLANS.map((p) => (
                <button key={p.id} type="button" onClick={() => pickPlan(p.id)} className={cn("rounded-xl border p-4 text-left transition-all", plan === p.id ? "border-foreground bg-foreground text-background shadow-md" : "border-input hover:bg-accent")}>
                  <p.icon className="size-5" />
                  <p className="mt-3 font-semibold">{p.label}</p>
                  <p className={cn("mt-1 text-caption", plan === p.id ? "opacity-80" : "text-muted-foreground")}>{p.desc}</p>
                </button>
              ))}
            </div>
          </Field>
        </Panel>

        <Panel className="space-y-6 p-6">
          <Field label="2. Email pembeli" hint="Kode terikat ke email ini. Kalau dia sudah punya akun, lisensinya langsung muncul di dashboard-nya.">
            <Input type="email" placeholder="nama@kampus.ac.id" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus={!prefillEmail} />
          </Field>
          <Field label="3. Masa berlaku" hint="Dihitung dari hari ini. Bisa diperpanjang kapan saja dari daftar lisensi.">
            <Chips options={DAY_PRESETS} value={days} onChange={setDays} suffix="hari" />
            <p className="mt-2 text-caption text-muted-foreground">Berlaku sampai <span className="font-semibold text-foreground">{fmtLong(until)}</span>.</p>
          </Field>
          <Field label="4. Jatah generate per hari" hint="Berapa kali pembeli boleh minta AI merangkai laporan dalam sehari. Satu laporan harian biasanya butuh 1 sampai 2 kali.">
            <Chips options={QUOTA_PRESETS} value={quota} onChange={setQuota} suffix="kali" />
          </Field>
          <Field label="5. Catatan untuk kamu sendiri" hint="Opsional. Misalnya: bayar via QRIS 28 Okt, atau beta tester dari Unpad.">
            <Input placeholder="Catatan internal, pembeli nggak lihat ini" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />
          </Field>
        </Panel>
      </div>

      <aside className="lg:sticky lg:top-10 lg:self-start">
        <Panel className="p-6">
          <p className="text-overline font-bold uppercase tracking-wider text-muted-foreground">Yang akan dibuat</p>
          <dl className="mt-4 space-y-3 text-body-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Paket</dt><dd className="font-semibold">{PLANS.find((p) => p.id === plan)?.label}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Untuk</dt><dd className={cn("truncate font-semibold", !email && "text-muted-foreground/60")}>{email || "belum diisi"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Durasi</dt><dd className="font-semibold tnum">{days} hari</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Sampai</dt><dd className="text-right font-semibold">{fmt(until.toISOString())}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Jatah</dt><dd className="font-semibold tnum">{quota} generate/hari</dd></div>
          </dl>
          <Button type="submit" className="mt-6 w-full" disabled={busy || !emailOk}>{busy ? "Membuat…" : "Buat lisensi"}</Button>
          {err && <p className="mt-3 text-caption text-red-500">{err}</p>}
          <p className="mt-4 flex gap-2 text-caption text-muted-foreground"><Info className="mt-0.5 size-3.5 shrink-0" />Kode dibuat acak dan langsung aktif. Belum ada email otomatis, jadi kirim kodenya manual ke pembeli.</p>
        </Panel>
      </aside>
    </form>
  );
}

/* ---------------------------------------------------------------- Tabel lisensi */

const FILTERS = ["Semua", "Aktif", "Trial", "Kedaluwarsa", "Dicabut"] as const;
const filterKind: Record<string, string | null> = { Semua: null, Aktif: "active", Trial: "trial", Kedaluwarsa: "expired", Dicabut: "revoked" };

export function LicenseTable({ licenses, initialQuery = "" }: { licenses: License[]; initialQuery?: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("Semua");
  const [q, setQ] = useState(initialQuery);
  const [busyId, setBusyId] = useState<string | null>(null);
  const counts = useMemo(() => {
    const c: Record<string, number> = { Semua: licenses.length };
    for (const f of FILTERS) if (filterKind[f]) c[f] = licenses.filter((l) => kindOf(l) === filterKind[f]).length;
    return c;
  }, [licenses]);
  const shown = licenses.filter((l) => (!filterKind[filter] || kindOf(l) === filterKind[filter]) && (!q || l.email.includes(q.toLowerCase()) || l.key.includes(q.toUpperCase()) || (l.note || "").toLowerCase().includes(q.toLowerCase())));

  async function act(l: License, action: string, extra: Record<string, unknown> = {}) {
    setBusyId(l.id);
    await fetch("/api/admin/licenses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: l.id, action, ...extra }) });
    setBusyId(null);
    router.refresh();
  }
  const daysLeft = (l: License) => daysLeftOf(l.expiresAt);

  return (
    <Panel>
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <PillTabs tabs={FILTERS.map((f) => (counts[f] ? `${f} (${counts[f]})` : f))} value={counts[filter] ? `${filter} (${counts[filter]})` : filter} onChange={(t) => setFilter(t.replace(/ \(\d+\)$/, ""))} />
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari email, kode, atau catatan" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-body-sm">
          <thead className="text-left text-overline uppercase tracking-wide text-muted-foreground">
            <tr className="[&>th]:px-4 [&>th]:py-2.5 [&>th]:font-bold"><th>Pembeli</th><th>Kode</th><th>Status</th><th>Berlaku</th><th>Jatah</th><th>Perangkat</th><th className="text-right">Aksi</th></tr>
          </thead>
          <tbody className="divide-y">
            {shown.map((l) => {
              const k = kindOf(l); const dl = daysLeft(l); const busy = busyId === l.id;
              return (
                <tr key={l.id} className={cn("[&>td]:px-4 [&>td]:py-3 [&>td]:align-top", busy && "opacity-50")}>
                  <td>
                    <p className="font-medium">{l.email}</p>
                    <p className="text-caption text-muted-foreground">{l.plan === "trial" ? "Trial" : l.plan === "pro" ? "Pro" : "Tim"}{l.note ? ` · ${l.note}` : ""}</p>
                  </td>
                  <td className="whitespace-nowrap"><code className="tnum font-mono text-caption">{l.key}</code></td>
                  <td><StatusPill kind={k} /></td>
                  <td className="whitespace-nowrap">
                    <p className="tnum">{fmt(l.expiresAt)}</p>
                    <p className={cn("text-caption", dl < 0 ? "text-red-500" : dl <= 3 ? "text-amber-500" : "text-muted-foreground")}>{dl < 0 ? `lewat ${-dl} hari` : dl === 0 ? "hari ini terakhir" : `${dl} hari lagi`}</p>
                  </td>
                  <td className="tnum whitespace-nowrap">{l.dailyQuota}/hari</td>
                  <td className="max-w-[160px]">
                    <p className="truncate">{l.deviceName || <span className="text-muted-foreground">belum diaktifkan</span>}</p>
                    {l.lastUsedAt && <p className="text-caption text-muted-foreground">dipakai {fmt(l.lastUsedAt)}</p>}
                  </td>
                  <td className="whitespace-nowrap text-right">
                    <Button variant="ghost" size="sm" title="Tambah 30 hari dari tanggal berakhir" disabled={busy} onClick={() => act(l, "extend", { days: 30 })}><CalendarPlus />+30 hari</Button>
                    {l.deviceId && <Button variant="ghost" size="sm" title="Lepas dari perangkat ini supaya bisa diaktifkan di laptop lain" disabled={busy} onClick={() => act(l, "unbind")}><Unlink />Lepas</Button>}
                    {k === "revoked"
                      ? <Button variant="ghost" size="sm" title="Aktifkan kembali" disabled={busy} onClick={() => act(l, "activate")}><RotateCcw />Aktifkan</Button>
                      : <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-500" title="Lisensi berhenti bekerja seketika" disabled={busy} onClick={() => { if (confirm(`Cabut lisensi ${l.email}? Ekstensinya langsung berhenti generate.`)) act(l, "revoke"); }}><Ban />Cabut</Button>}
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 && <tr><td colSpan={7}><Empty>{licenses.length === 0 ? "Belum ada lisensi. Buat yang pertama lewat tombol di kanan atas." : "Nggak ada yang cocok dengan filter atau pencarian."}</Empty></td></tr>}
          </tbody>
        </table>
      </div>
      {shown.length > 0 && <p className="border-t px-4 py-2.5 text-caption text-muted-foreground">{shown.length} dari {licenses.length} lisensi</p>}
    </Panel>
  );
}

/* ---------------------------------------------------------------- Pengguna */

export function UserTable({ users, meId, licenseCount }: { users: User[]; meId: string; licenseCount: Record<string, number> }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const shown = users.filter((u) => !q || u.email.includes(q.toLowerCase()) || (u.name || "").toLowerCase().includes(q.toLowerCase()));
  async function toggle(u: User) {
    const next = u.role === "admin" ? "user" : "admin";
    if (next === "admin" && !confirm(`Jadikan ${u.email} admin? Dia bisa buat dan cabut lisensi semua orang.`)) return;
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: u.id, role: next }) });
    router.refresh();
  }
  return (
    <Panel>
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-sm text-muted-foreground">{users.length} akun terdaftar lewat Supabase Auth.</p>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari nama atau email" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-body-sm">
          <thead className="text-left text-overline uppercase tracking-wide text-muted-foreground"><tr className="[&>th]:px-4 [&>th]:py-2.5 [&>th]:font-bold"><th>Pengguna</th><th>Peran</th><th>Lisensi</th><th>Daftar</th><th className="text-right">Aksi</th></tr></thead>
          <tbody className="divide-y">
            {shown.map((u) => (
              <tr key={u.id} className="[&>td]:px-4 [&>td]:py-3 [&>td]:whitespace-nowrap">
                <td>
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-bold uppercase">{(u.name || u.email).slice(0, 2)}</span>
                    <div><p className="font-medium">{u.name || u.email.split("@")[0]}{u.id === meId && <span className="ml-2 text-caption text-muted-foreground">(kamu)</span>}</p><p className="text-caption text-muted-foreground">{u.email}</p></div>
                  </div>
                </td>
                <td><StatusPill kind={u.role === "admin" ? "active" : "neutral"} label={u.role === "admin" ? "Admin" : "Pengguna"} /></td>
                <td className="tnum">{licenseCount[u.email] ? <Link href={`/admin/lisensi?q=${encodeURIComponent(u.email)}`} className="underline-offset-4 hover:underline">{licenseCount[u.email]} lisensi</Link> : <span className="text-muted-foreground">belum ada</span>}</td>
                <td className="tnum text-muted-foreground">{fmt(u.createdAt)}</td>
                <td className="text-right">
                  {u.id !== meId && <Button variant="ghost" size="sm" onClick={() => toggle(u)}>{u.role === "admin" ? "Cabut admin" : "Jadikan admin"}</Button>}
                  {!licenseCount[u.email] && <Button asChild variant="ghost" size="sm"><Link href={`/admin/lisensi/baru?email=${encodeURIComponent(u.email)}`}><Plus />Lisensi</Link></Button>}
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={5}><Empty>Nggak ada pengguna yang cocok.</Empty></td></tr>}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------- Konfigurasi */

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 px-5 py-5 sm:grid-cols-[1fr_280px] sm:items-start">
      <div><p className="text-body-sm font-semibold">{label}</p><p className="mt-0.5 text-caption text-muted-foreground">{hint}</p></div>
      {children}
    </div>
  );
}

export function ConfigForm({ config }: { config: RemoteConfig }) {
  const router = useRouter();
  const [c, setC] = useState(config);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const dirty = JSON.stringify(c) !== JSON.stringify(config);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setState("saving");
    const r = await fetch("/api/admin/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) });
    setState(r.ok ? "saved" : "error");
    router.refresh();
    if (r.ok) setTimeout(() => setState("idle"), 2500);
  }
  return (
    <form onSubmit={save} className="space-y-6">
      <Panel title="Paket dan jatah" desc="Nilai bawaan saat lisensi dibuat. Lisensi yang sudah ada nggak ikut berubah.">
        <div className="divide-y">
          <Row label="Lama trial" hint="Berapa hari trial gratis yang didapat pengguna baru dari dashboard.">
            <div className="flex items-center gap-2"><Input type="number" min={1} max={90} value={c.trialDays} onChange={(e) => setC({ ...c, trialDays: Number(e.target.value) })} className="w-24 tnum" /><span className="text-body-sm text-muted-foreground">hari</span></div>
          </Row>
          <Row label="Jatah generate bawaan" hint="Dipakai kalau kamu nggak menentukan jatah saat membuat lisensi.">
            <div className="flex items-center gap-2"><Input type="number" min={1} max={200} value={c.defaultDailyQuota} onChange={(e) => setC({ ...c, defaultDailyQuota: Number(e.target.value) })} className="w-24 tnum" /><span className="text-body-sm text-muted-foreground">kali per hari</span></div>
          </Row>
        </div>
      </Panel>

      <Panel title="AI" desc="Mengatur cara server merangkai laporan. Berlaku untuk semua pengguna pada generate berikutnya.">
        <div className="divide-y">
          <Row label="Model OpenAI" hint="gpt-4o-mini paling murah dan cukup bagus. Ganti hanya kalau kamu tahu biayanya.">
            <Input value={c.model} onChange={(e) => setC({ ...c, model: e.target.value })} className="font-mono" />
          </Row>
          <Row label="Panjang cerita maksimum" hint="Batas karakter cerita singkat yang boleh dikirim dari ekstensi. Makin panjang makin mahal.">
            <div className="flex items-center gap-2"><Input type="number" min={100} max={5000} value={c.maxBriefChars} onChange={(e) => setC({ ...c, maxBriefChars: Number(e.target.value) })} className="w-28 tnum" /><span className="text-body-sm text-muted-foreground">karakter</span></div>
          </Row>
          <div className="px-5 py-5">
            <p className="text-body-sm font-semibold">Instruksi tambahan untuk AI</p>
            <p className="mt-0.5 mb-3 text-caption text-muted-foreground">Ditempel ke aturan sistem setiap generate. Kosongkan kalau nggak perlu.</p>
            <textarea rows={3} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden" value={c.systemPromptExtra} onChange={(e) => setC({ ...c, systemPromptExtra: e.target.value })} placeholder="Misalnya: selalu sebut unit kerja secara umum, hindari istilah asing." />
          </div>
        </div>
      </Panel>

      <Panel title="Ekstensi" desc="Pesan dan batasan yang dibaca ekstensi saat terhubung ke server.">
        <div className="divide-y">
          <Row label="Pengumuman" hint="Tampil di dashboard pengguna dan di popup ekstensi. Kosong berarti nggak ada.">
            <Input value={c.announcement} onChange={(e) => setC({ ...c, announcement: e.target.value })} placeholder="Misalnya: server maintenance Jumat 20.00" maxLength={300} />
          </Row>
          <Row label="Versi ekstensi minimum" hint="Ekstensi di bawah versi ini ditolak dan diminta update. Naikkan hanya setelah versi baru dibagikan.">
            <Input value={c.minExtensionVersion} onChange={(e) => setC({ ...c, minExtensionVersion: e.target.value })} className="w-28 font-mono tnum" />
          </Row>
        </div>
      </Panel>

      <div className="sticky bottom-4 flex items-center gap-3 rounded-xl border bg-background/90 p-3 shadow-lg backdrop-blur-xl">
        <Button type="submit" disabled={!dirty || state === "saving"}>{state === "saving" ? "Menyimpan…" : "Simpan perubahan"}</Button>
        {dirty && state === "idle" && <Button type="button" variant="ghost" onClick={() => setC(config)}>Batalkan</Button>}
        <span className={cn("text-caption", state === "error" ? "text-red-500" : "text-muted-foreground")}>
          {state === "saved" ? "Tersimpan. Ekstensi membaca ini saat generate berikutnya." : state === "error" ? "Gagal menyimpan. Coba lagi." : dirty ? "Ada perubahan yang belum disimpan." : <span className="flex items-center gap-1.5"><Clock className="size-3.5" />Terakhir diubah {config.updatedAt ? fmt(config.updatedAt) : "belum pernah"}</span>}
        </span>
      </div>
    </form>
  );
}
