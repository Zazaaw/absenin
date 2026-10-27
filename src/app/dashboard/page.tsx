import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Puzzle, KeyRound } from "lucide-react";
import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app/shell";
import { LicenseCard, TrialButton } from "@/components/app/license-card";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = getDb();
  const licenses = await db.listLicenses({ email: user.email });
  const primary = licenses.find((l) => l.status === "active") || licenses[0];
  const usedToday = primary ? await db.countUsageToday(primary.id) : 0;
  const usage = primary ? await db.listUsage({ licenseId: primary.id, limit: 12 }) : [];
  const cfg = await db.getConfig();
  const recentDeviceChange = primary ? (await db.listTelemetry(200)).find((t) => t.licenseId === primary.id && t.event === "device-change" && Date.now() - Date.parse(t.createdAt) < 7 * 86400000) : null;

  return (
    <AppShell admin={user.role === "admin"} email={user.email}>
      <BlurFade>
        <PageHeader title={`Halo, ${user.name || user.email.split("@")[0]}`} subtitle="Lisensi, pemakaian, dan cara pasang ekstensinya." action={primary && <Button asChild variant="outline"><Link href="/checkout?plan=pro">Perpanjang</Link></Button>} />
        {cfg.announcement && <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-body-sm text-blue-500">{cfg.announcement}</div>}

        {recentDeviceChange && (
          <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-body-sm text-amber-600 dark:text-amber-400">
            Lisensimu diaktifkan di perangkat lain pada {new Date(recentDeviceChange.createdAt).toLocaleString("id-ID")} ({recentDeviceChange.detail}). Kalau itu bukan kamu, hubungi halo@magangdiary.id supaya kodenya diganti.
          </div>
        )}
        {primary ? <LicenseCard license={primary} usedToday={usedToday} /> : <TrialButton />}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <h2 className="text-h5 font-bold tracking-tight">Cara pasang</h2>
            <ol className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Download, t: "Unduh ekstensi", d: "Ekstrak zip-nya ke folder yang nggak bakal kamu hapus." , cta: <Button asChild size="sm" variant="outline" className="mt-3"><a href="/downloads/magang-diary.zip">Unduh zip</a></Button> },
                { icon: Puzzle, t: "Load unpacked", d: "Buka chrome://extensions, nyalakan Developer mode, klik Load unpacked, pilih foldernya." },
                { icon: KeyRound, t: "Tempel kode lisensi", d: "Klik ikon ekstensi, Pengaturan, bagian Akun. Tempel kode di atas, klik Aktifkan." },
              ].map((s, i) => (
                <li key={s.t} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
                  <div className="flex items-center gap-2"><span className="tnum flex h-7 w-7 items-center justify-center rounded-full bg-muted text-caption font-bold">{i + 1}</span><s.icon className="size-4 text-muted-foreground" /></div>
                  <p className="mt-3 font-semibold">{s.t}</p>
                  <p className="mt-1 text-body-sm text-muted-foreground">{s.d}</p>
                  {s.cta}
                </li>
              ))}
            </ol>
          </div>
          <aside>
            <h2 className="text-h5 font-bold tracking-tight">Pemakaian terakhir</h2>
            <div className="mt-6 rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900/50">
              {usage.length === 0 ? (
                <p className="p-5 text-body-sm text-muted-foreground">Belum ada generate. Begitu kamu klik Generate di ekstensi, muncul di sini.</p>
              ) : (
                <ul className="divide-y">
                  {usage.map((u) => (
                    <li key={u.id} className="flex items-center justify-between gap-3 px-5 py-3 text-body-sm">
                      <div>
                        <p className="font-medium">{u.ok ? (u.offline ? "Template cadangan" : "Generate") : "Gagal"}<span className="ml-2 text-caption text-muted-foreground">{u.templateId}</span></p>
                        <p className="tnum text-caption text-muted-foreground">{new Date(u.createdAt).toLocaleString("id-ID")}</p>
                      </div>
                      <span className={`h-2 w-2 shrink-0 rounded-full ${u.ok ? "bg-emerald-500" : "bg-red-500"}`} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </BlurFade>
    </AppShell>
  );
}
