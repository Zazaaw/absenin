"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PillTabs from "@/components/ui/pill-tabs";
import { StatusPill } from "./shell";
import type { License, RemoteConfig, User } from "@/lib/db";

const fmt = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export function CreateLicense() {
  const router = useRouter();
  const [f, setF] = useState({ email: "", plan: "pro", days: 30, dailyQuota: 6, note: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = await fetch("/api/admin/licenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: j.error || "Gagal." }); return; }
    setMsg({ ok: true, text: `Lisensi dibuat: ${j.license.key}` });
    setF({ ...f, email: "", note: "" });
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
      <h3 className="font-semibold">Buat lisensi</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input type="email" placeholder="Email pembeli" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm" value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value })}>
          <option value="trial">trial</option><option value="pro">pro</option><option value="tim">tim</option>
        </select>
        <Input type="number" min={1} placeholder="Hari" value={f.days} onChange={(e) => setF({ ...f, days: Number(e.target.value) })} />
        <Input type="number" min={1} placeholder="Kuota/hari" value={f.dailyQuota} onChange={(e) => setF({ ...f, dailyQuota: Number(e.target.value) })} />
        <Input className="sm:col-span-2" placeholder="Catatan (opsional)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" disabled={busy}>{busy ? "Membuat..." : "Buat"}</Button>
        {msg && <p className={`font-mono text-caption ${msg.ok ? "text-emerald-500" : "text-red-500"}`}>{msg.text}</p>}
      </div>
    </form>
  );
}

export function LicenseTable({ licenses }: { licenses: License[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("Semua");
  const [q, setQ] = useState("");
  const now = Date.now();
  const kindOf = (l: License) => l.status === "revoked" ? "revoked" : Date.parse(l.expiresAt) < now ? "expired" : l.plan === "trial" ? "trial" : "active";
  const shown = licenses.filter((l) => (filter === "Semua" || kindOf(l) === filter.toLowerCase()) && (!q || l.email.includes(q.toLowerCase()) || l.key.includes(q.toUpperCase())));
  async function act(id: string, action: string, extra: Record<string, unknown> = {}) {
    await fetch("/api/admin/licenses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action, ...extra }) });
    router.refresh();
  }
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <PillTabs tabs={["Semua", "Active", "Trial", "Expired", "Revoked"]} value={filter} onChange={setFilter} />
        <Input placeholder="Cari email atau kode" value={q} onChange={(e) => setQ(e.target.value)} className="sm:w-64" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-body-sm">
          <thead className="text-left text-overline uppercase text-muted-foreground">
            <tr className="[&>th]:px-4 [&>th]:py-2"><th>Email</th><th>Kode</th><th>Paket</th><th>Status</th><th>Kuota</th><th>Berlaku</th><th>Perangkat</th><th></th></tr>
          </thead>
          <tbody className="divide-y">
            {shown.map((l) => (
              <tr key={l.id} className="[&>td]:px-4 [&>td]:py-2.5">
                <td className="font-medium">{l.email}</td>
                <td className="font-mono text-caption">{l.key}</td>
                <td>{l.plan}</td>
                <td><StatusPill kind={kindOf(l)} label={kindOf(l)} /></td>
                <td className="tnum">{l.dailyQuota}/hari</td>
                <td className="tnum">{fmt(l.expiresAt)}</td>
                <td className="max-w-[140px] truncate text-muted-foreground">{l.deviceName || "-"}</td>
                <td className="whitespace-nowrap">
                  <Button variant="ghost" size="sm" onClick={() => act(l.id, "extend", { days: 30 })}>+30 hari</Button>
                  {l.deviceId && <Button variant="ghost" size="sm" onClick={() => act(l.id, "unbind")}>Lepas</Button>}
                  {l.status === "revoked" ? <Button variant="ghost" size="sm" onClick={() => act(l.id, "activate")}>Aktifkan</Button> : <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm("Cabut lisensi " + l.email + "?")) act(l.id, "revoke"); }}>Cabut</Button>}
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Tidak ada lisensi.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UserTable({ users, meId }: { users: User[]; meId: string }) {
  const router = useRouter();
  async function toggle(u: User) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: u.id, role: u.role === "admin" ? "user" : "admin" }) });
    router.refresh();
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
      <table className="w-full text-body-sm">
        <thead className="text-left text-overline uppercase text-muted-foreground"><tr className="[&>th]:px-4 [&>th]:py-2"><th>Nama</th><th>Email</th><th>Role</th><th>Daftar</th><th></th></tr></thead>
        <tbody className="divide-y">
          {users.map((u) => (
            <tr key={u.id} className="[&>td]:px-4 [&>td]:py-2.5 [&>td]:whitespace-nowrap">
              <td className="font-medium">{u.name || "-"}</td><td className="max-w-[220px] truncate">{u.email}</td>
              <td><StatusPill kind={u.role === "admin" ? "active" : "neutral"} label={u.role} /></td>
              <td className="tnum text-muted-foreground">{fmt(u.createdAt)}</td>
              <td className="text-right">{u.id !== meId && <Button variant="ghost" size="sm" onClick={() => toggle(u)}>{u.role === "admin" ? "Cabut admin" : "Jadikan admin"}</Button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ConfigForm({ config }: { config: RemoteConfig }) {
  const router = useRouter();
  const [c, setC] = useState(config);
  const [msg, setMsg] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg("Menyimpan...");
    const r = await fetch("/api/admin/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) });
    setMsg(r.ok ? "Tersimpan. Ekstensi membaca ini saat generate berikutnya." : "Gagal menyimpan.");
    router.refresh();
  }
  const field = (label: string, el: React.ReactNode) => <label className="grid gap-1.5 text-caption font-semibold text-muted-foreground">{label}{el}</label>;
  return (
    <form onSubmit={save} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
      <h3 className="font-semibold">Konfigurasi jarak jauh</h3>
      <p className="mt-1 text-caption text-muted-foreground">Berlaku untuk semua pengguna tanpa rilis ulang ekstensi.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {field("Model OpenAI", <Input value={c.model} onChange={(e) => setC({ ...c, model: e.target.value })} />)}
        {field("Kuota default / hari", <Input type="number" min={1} value={c.defaultDailyQuota} onChange={(e) => setC({ ...c, defaultDailyQuota: Number(e.target.value) })} />)}
        {field("Maks karakter cerita", <Input type="number" min={100} value={c.maxBriefChars} onChange={(e) => setC({ ...c, maxBriefChars: Number(e.target.value) })} />)}
        {field("Trial (hari)", <Input type="number" min={1} value={c.trialDays} onChange={(e) => setC({ ...c, trialDays: Number(e.target.value) })} />)}
        {field("Versi ekstensi minimum", <Input value={c.minExtensionVersion} onChange={(e) => setC({ ...c, minExtensionVersion: e.target.value })} />)}
        {field("Pengumuman (tampil di dashboard dan ekstensi)", <Input value={c.announcement} onChange={(e) => setC({ ...c, announcement: e.target.value })} placeholder="kosong = tidak ada" />)}
        <label className="grid gap-1.5 text-caption font-semibold text-muted-foreground sm:col-span-2">Instruksi tambahan untuk AI
          <textarea rows={3} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" value={c.systemPromptExtra} onChange={(e) => setC({ ...c, systemPromptExtra: e.target.value })} placeholder="Misalnya: selalu sebut unit kerja secara umum, hindari istilah asing." />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3"><Button type="submit">Simpan</Button><span className="text-caption text-muted-foreground">{msg}</span></div>
    </form>
  );
}
