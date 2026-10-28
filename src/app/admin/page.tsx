import { redirect } from "next/navigation";
import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { NumberTicker } from "@/components/effects/number-ticker";
import { AppShell } from "@/components/app/shell";
import { CreateLicense, LicenseTable, UserTable, ConfigForm } from "@/components/app/admin-panels";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  const db = getDb();
  const [stats, licenses, users, usage, config, telemetry, beta] = await Promise.all([db.stats(), db.listLicenses(), db.listUsers(), db.listUsage({ limit: 20 }), db.getConfig(), db.listTelemetry(30), db.listBeta()]);
  const max = Math.max(1, ...stats.perDay.map((d) => d.count + d.errors));
  // perkiraan biaya: gpt-4o-mini sekitar $0.15/1M input dan $0.60/1M output; kasar: $0.4/1M rata-rata
  const costUsd = (stats.tokens30d / 1e6) * 0.4;

  const tiles = [
    { label: "Generate hari ini", value: stats.generatesToday, hero: true },
    { label: "Lisensi aktif", value: stats.activeLicenses },
    { label: "Pengguna", value: stats.users },
    { label: "Generate 30 hari", value: stats.generates30d },
    { label: "Error 7 hari", value: stats.errors7d },
    { label: "Perkiraan biaya AI 30 hari", value: Math.round(costUsd * 16000), prefix: "Rp" },
  ];

  return (
    <AppShell admin email={user.email}>
      <BlurFade>
        <PageHeader title="Admin" subtitle="Pantau pemakaian, kelola lisensi, ubah konfigurasi tanpa rilis ulang. Semua data di Supabase." />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {tiles.map((t, i) => (
            <BlurFade key={t.label} delay={i * 0.04}>
              <div className={t.hero ? "rounded-xl border border-transparent bg-linear-to-br from-neutral-900 to-neutral-700 p-5 text-white shadow-md dark:from-white dark:to-neutral-300 dark:text-neutral-900" : "rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50"}>
                <p className={`text-caption ${t.hero ? "opacity-70" : "text-muted-foreground"}`}>{t.label}</p>
                <p className="tnum mt-1 text-h4 font-extrabold tracking-tight"><NumberTicker value={t.value} prefix={t.prefix || ""} /></p>
              </div>
            </BlurFade>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Generate 14 hari terakhir</h3><span className="text-caption text-muted-foreground">hijau berhasil · merah gagal</span></div>
            <div className="mt-6 flex h-40 items-end gap-1.5">
              {stats.perDay.map((d) => (
                <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end gap-px" title={`${d.date}: ${d.count} ok, ${d.errors} gagal`}>
                  <div className="rounded-t-sm bg-red-500/70 transition-all" style={{ height: `${(d.errors / max) * 100}%` }} />
                  <div className="rounded-t-sm bg-emerald-500/80 transition-all group-hover:bg-emerald-500" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 3 : 0 }} />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-overline text-muted-foreground"><span>{stats.perDay[0]?.date.slice(5)}</span><span>hari ini</span></div>
          </div>
          <CreateLicense />
        </div>

        <h2 className="mt-10 mb-3 text-h5 font-bold tracking-tight">Lisensi</h2>
        <LicenseTable licenses={licenses} />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-h5 font-bold tracking-tight">Pengguna</h2>
            <UserTable users={users} meId={user.id} />
          </div>
          <div>
            <h2 className="mb-3 text-h5 font-bold tracking-tight">Log terakhir</h2>
            <div className="rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
              <ul className="divide-y">
                {usage.map((u) => (
                  <li key={u.id} className="flex items-center gap-3 px-4 py-2.5 text-body-sm">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${u.ok ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="truncate font-medium">{u.email}</span>
                    <span className="text-caption text-muted-foreground">{u.templateId}</span>
                    <span className="tnum ml-auto shrink-0 text-caption text-muted-foreground">{u.ok ? `${u.promptTokens + u.completionTokens} tok` : u.error.slice(0, 40)}</span>
                  </li>
                ))}
                {usage.length === 0 && <li className="px-4 py-8 text-center text-body-sm text-muted-foreground">Belum ada pemakaian.</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-h5 font-bold tracking-tight">Laporan dari ekstensi</h2>
            <p className="mb-3 text-caption text-muted-foreground">Telemetri anonim: deteksi kalender gagal, generate error, pindah perangkat, versi lama. Kalau "detect-failed" naik, MagangHub ganti tampilan.</p>
            <div className="rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
              <ul className="divide-y">
                {telemetry.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-2.5 text-body-sm">
                    <span className={`rounded-full border px-2 py-0.5 text-overline font-bold uppercase ${t.event === "device-change" ? "border-amber-500/20 bg-amber-500/10 text-amber-500" : t.event.includes("error") || t.event.includes("failed") ? "border-red-500/20 bg-red-500/10 text-red-500" : "border-neutral-500/20 bg-neutral-500/10 text-neutral-500"}`}>{t.event}</span>
                    <span className="truncate text-muted-foreground">{t.detail || t.email || "-"}</span>
                    <span className="tnum ml-auto shrink-0 text-caption text-muted-foreground">v{t.version || "?"} · {new Date(t.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </li>
                ))}
                {telemetry.length === 0 && <li className="px-4 py-8 text-center text-body-sm text-muted-foreground">Belum ada laporan.</li>}
              </ul>
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-h5 font-bold tracking-tight">Daftar beta tester</h2>
            <p className="mb-3 text-caption text-muted-foreground">{beta.length} pendaftar dari landing page. Buat lisensi 60 hari untuk mereka lewat form di atas.</p>
            <div className="rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
              <ul className="divide-y">
                {beta.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 px-4 py-2.5 text-body-sm">
                    <span className="font-medium">{b.email}</span>
                    <span className="truncate text-muted-foreground">{b.kampus || "-"}</span>
                    <span className="tnum ml-auto shrink-0 text-caption text-muted-foreground">{new Date(b.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}</span>
                  </li>
                ))}
                {beta.length === 0 && <li className="px-4 py-8 text-center text-body-sm text-muted-foreground">Belum ada pendaftar.</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10"><ConfigForm config={config} /></div>
      </BlurFade>
    </AppShell>
  );
}
