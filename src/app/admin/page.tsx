import Link from "next/link";
import { ArrowRight, Plus, TrendingUp, AlertTriangle, Users, KeyRound, Wallet, Zap } from "lucide-react";
import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { NumberTicker } from "@/components/effects/number-ticker";
import { Button } from "@/components/ui/button";
import { Empty, Panel, StatusPill } from "@/components/app/shell";
import { expiringWithin } from "@/lib/license-kind";
import { getDb } from "@/lib/db";

export const metadata = { title: "Ringkasan admin" };
export const dynamic = "force-dynamic";

const fmtTime = (d: string) => new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function AdminHome() {
  const db = getDb();
  const [stats, licenses, usage, telemetry, beta] = await Promise.all([db.stats(), db.listLicenses(), db.listUsage({ limit: 8 }), db.listTelemetry(6), db.listBeta()]);
  const max = Math.max(1, ...stats.perDay.map((d) => d.count + d.errors));
  // gpt-4o-mini: sekitar $0.15/1M token masuk dan $0.60/1M keluar. Dirata-rata kasar $0.40/1M, kurs 16.000.
  const costRp = Math.round((stats.tokens30d / 1e6) * 0.4 * 16000);
  const expiringSoon = expiringWithin(licenses, 3);
  const betaWithoutLicense = beta.filter((b) => !licenses.some((l) => l.email === b.email));

  const tiles = [
    { label: "Generate hari ini", value: stats.generatesToday, icon: Zap, hint: "laporan yang dirangkai AI sejak 00.00", hero: true },
    { label: "Lisensi aktif", value: stats.activeLicenses, icon: KeyRound, hint: "termasuk trial yang belum habis" },
    { label: "Pengguna", value: stats.users, icon: Users, hint: "akun yang pernah daftar" },
    { label: "Generate 30 hari", value: stats.generates30d, icon: TrendingUp, hint: "total sebulan terakhir" },
    { label: "Gagal 7 hari", value: stats.errors7d, icon: AlertTriangle, hint: "generate yang error di server" },
    { label: "Biaya AI 30 hari", value: costRp, prefix: "Rp", icon: Wallet, hint: "perkiraan dari jumlah token" },
  ];

  return (
    <BlurFade>
      <PageHeader title="Ringkasan" subtitle="Kondisi Absenin hari ini. Angka-angka di sini dihitung langsung dari Supabase." action={<Button asChild><Link href="/admin/lisensi/baru"><Plus />Buat lisensi</Link></Button>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t, i) => (
          <BlurFade key={t.label} delay={i * 0.04}>
            <div className={t.hero ? "rounded-xl bg-linear-to-br from-neutral-900 to-neutral-700 p-5 text-white shadow-md dark:from-white dark:to-neutral-300 dark:text-neutral-900" : "rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50"}>
              <div className="flex items-center justify-between">
                <p className={`text-caption font-medium ${t.hero ? "opacity-70" : "text-muted-foreground"}`}>{t.label}</p>
                <t.icon className={`size-4 ${t.hero ? "opacity-60" : "text-muted-foreground/60"}`} />
              </div>
              <p className="tnum mt-2 text-h4 font-extrabold tracking-tight"><NumberTicker value={t.value} prefix={t.prefix || ""} /></p>
              <p className={`mt-1 text-caption ${t.hero ? "opacity-60" : "text-muted-foreground"}`}>{t.hint}</p>
            </div>
          </BlurFade>
        ))}
      </div>

      {(expiringSoon.length > 0 || betaWithoutLicense.length > 0) && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {expiringSoon.length > 0 && (
            <Link href="/admin/lisensi" className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-body-sm text-amber-700 transition-colors hover:bg-amber-500/15 dark:text-amber-300">
              <AlertTriangle className="size-4 shrink-0" /><span><b>{expiringSoon.length} lisensi</b> habis dalam 3 hari. Perpanjang atau ingatkan pembelinya.</span><ArrowRight className="ml-auto size-4" />
            </Link>
          )}
          {betaWithoutLicense.length > 0 && (
            <Link href="/admin/laporan#beta" className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-body-sm text-blue-700 transition-colors hover:bg-blue-500/15 dark:text-blue-300">
              <Users className="size-4 shrink-0" /><span><b>{betaWithoutLicense.length} pendaftar beta</b> belum dibuatkan lisensi.</span><ArrowRight className="ml-auto size-4" />
            </Link>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <Panel className="p-6 lg:col-span-3" title="Generate 14 hari terakhir" desc="Hijau berhasil, merah gagal. Arahkan kursor ke batang untuk angkanya.">
          <div className="px-5 pb-5">
            <div className="mt-5 flex h-44 items-end gap-1.5">
              {stats.perDay.map((d) => (
                <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end gap-px" title={`${d.date}: ${d.count} berhasil, ${d.errors} gagal`}>
                  <div className="rounded-t-sm bg-red-500/70" style={{ height: `${(d.errors / max) * 100}%` }} />
                  <div className="rounded-t-sm bg-emerald-500/80 transition-colors group-hover:bg-emerald-500" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 3 : 0 }} />
                  {!d.count && !d.errors && <div className="h-px bg-border" />}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-overline text-muted-foreground"><span>{stats.perDay[0]?.date.slice(5)}</span><span>hari ini</span></div>
          </div>
        </Panel>

        <Panel className="lg:col-span-2" title="Laporan ekstensi terbaru" desc="Telemetri anonim dari ekstensi pengguna." action={<Button asChild variant="ghost" size="sm"><Link href="/admin/laporan">Semua<ArrowRight /></Link></Button>}>
          <ul className="divide-y">
            {telemetry.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-2.5 text-body-sm">
                <StatusPill kind={t.event === "device-change" ? "expired" : /error|failed/.test(t.event) ? "revoked" : "neutral"} label={t.event} />
                <span className="truncate text-muted-foreground">{t.detail || t.email || "-"}</span>
                <span className="tnum ml-auto shrink-0 text-caption text-muted-foreground">{fmtTime(t.createdAt)}</span>
              </li>
            ))}
            {telemetry.length === 0 && <li><Empty>Belum ada laporan dari ekstensi. Bagus, berarti nggak ada yang rusak.</Empty></li>}
          </ul>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Pemakaian terakhir" desc="Siapa yang barusan generate dan berapa token yang dipakai." action={<Button asChild variant="ghost" size="sm"><Link href="/admin/laporan">Semua<ArrowRight /></Link></Button>}>
          <ul className="divide-y">
            {usage.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-5 py-2.5 text-body-sm">
                <span className={`size-2 shrink-0 rounded-full ${u.ok ? "bg-emerald-500" : "bg-red-500"}`} />
                <span className="truncate font-medium">{u.email}</span>
                <span className="hidden text-caption text-muted-foreground sm:inline">gaya {u.templateId}{u.offline ? " · template cadangan" : ""}</span>
                <span className="tnum ml-auto shrink-0 text-caption text-muted-foreground">{u.ok ? `${u.promptTokens + u.completionTokens} token` : u.error.slice(0, 40)} · {fmtTime(u.createdAt)}</span>
              </li>
            ))}
            {usage.length === 0 && <li><Empty>Belum ada yang generate.</Empty></li>}
          </ul>
        </Panel>
      </div>
    </BlurFade>
  );
}
