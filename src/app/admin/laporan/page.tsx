import Link from "next/link";
import { Plus } from "lucide-react";
import BlurFade from "@/components/effects/blur-fade";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Empty, Panel, StatusPill } from "@/components/app/shell";
import { getDb } from "@/lib/db";

export const metadata = { title: "Laporan" };
export const dynamic = "force-dynamic";

const fmtTime = (d: string) => new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const EVENT_HINT: Record<string, string> = {
  "detect-failed": "ekstensi gagal membaca kalender MagangHub, kemungkinan tampilannya berubah",
  "fill-failed": "ekstensi gagal mengisi kolom laporan",
  "generate-error": "server gagal merangkai laporan",
  "device-change": "lisensi dipindah ke perangkat lain",
  "update-required": "ekstensi versi lama ditolak",
};

export default async function ReportsPage() {
  const db = getDb();
  const [usage, telemetry, beta, licenses] = await Promise.all([db.listUsage({ limit: 60 }), db.listTelemetry(60), db.listBeta(), db.listLicenses()]);
  const eventCounts = telemetry.reduce<Record<string, number>>((a, t) => { a[t.event] = (a[t.event] || 0) + 1; return a; }, {});
  const hasLicense = (email: string) => licenses.some((l) => l.email === email);

  return (
    <BlurFade>
      <PageHeader title="Laporan" subtitle="Tiga hal yang masuk ke server: pemakaian generate, sinyal masalah dari ekstensi, dan pendaftar beta dari landing page." />

      <div className="space-y-8">
        <Panel title="Sinyal dari ekstensi" desc="Dikirim anonim oleh ekstensi pengguna yang mengizinkan telemetri. Kalau detect-failed naik serentak, MagangHub ganti tampilan.">
          {Object.keys(eventCounts).length > 0 && (
            <div className="flex flex-wrap gap-2 border-b px-5 py-3">
              {Object.entries(eventCounts).sort((a, b) => b[1] - a[1]).map(([ev, n]) => (
                <span key={ev} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-caption" title={EVENT_HINT[ev] || ev}><span className="font-mono">{ev}</span><b className="tnum">{n}</b></span>
              ))}
            </div>
          )}
          <ul className="divide-y">
            {telemetry.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-2.5 text-body-sm">
                <StatusPill kind={t.event === "device-change" ? "expired" : /error|failed/.test(t.event) ? "revoked" : "neutral"} label={t.event} />
                <span className="truncate text-muted-foreground" title={EVENT_HINT[t.event]}>{t.detail || t.email || EVENT_HINT[t.event] || "-"}</span>
                <span className="tnum ml-auto shrink-0 text-caption text-muted-foreground">v{t.version || "?"} · {fmtTime(t.createdAt)}</span>
              </li>
            ))}
            {telemetry.length === 0 && <li><Empty>Belum ada sinyal. Artinya nggak ada yang rusak, atau belum ada yang pakai.</Empty></li>}
          </ul>
        </Panel>

        <Panel title="Pendaftar beta" desc={`${beta.length} orang daftar dari landing page. Buatkan lisensi trial 60 hari, lalu kirim kodenya.`}>
          <ul id="beta" className="divide-y">
            {beta.map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-5 py-2.5 text-body-sm">
                <div className="min-w-0"><p className="truncate font-medium">{b.email}</p><p className="truncate text-caption text-muted-foreground">{[b.kampus, b.note].filter(Boolean).join(" · ") || "tanpa keterangan"}</p></div>
                <span className="tnum ml-auto shrink-0 text-caption text-muted-foreground">{fmtTime(b.createdAt)}</span>
                {hasLicense(b.email) ? <StatusPill kind="active" label="sudah" /> : <Button asChild size="sm" variant="outline"><Link href={`/admin/lisensi/baru?email=${encodeURIComponent(b.email)}`}><Plus />Buat lisensi</Link></Button>}
              </li>
            ))}
            {beta.length === 0 && <li><Empty>Belum ada pendaftar.</Empty></li>}
          </ul>
        </Panel>

        <Panel title="Log pemakaian" desc="Setiap klik Generate dari ekstensi tercatat di sini, berhasil maupun gagal.">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead className="text-left text-overline uppercase tracking-wide text-muted-foreground"><tr className="[&>th]:px-5 [&>th]:py-2.5 [&>th]:font-bold"><th>Waktu</th><th>Pengguna</th><th>Gaya</th><th>Hasil</th><th className="text-right">Token</th></tr></thead>
              <tbody className="divide-y">
                {usage.map((u) => (
                  <tr key={u.id} className="[&>td]:px-5 [&>td]:py-2.5 [&>td]:whitespace-nowrap">
                    <td className="tnum text-muted-foreground">{fmtTime(u.createdAt)}</td>
                    <td className="max-w-[260px] truncate font-medium">{u.email}</td>
                    <td className="text-muted-foreground">{u.templateId}</td>
                    <td>{u.ok ? <StatusPill kind="active" label={u.offline ? "cadangan" : "ok"} /> : <span className="text-red-500" title={u.error}>{u.error.slice(0, 50) || "gagal"}</span>}</td>
                    <td className="tnum text-right text-muted-foreground">{u.ok ? u.promptTokens + u.completionTokens : "-"}</td>
                  </tr>
                ))}
                {usage.length === 0 && <tr><td colSpan={5}><Empty>Belum ada pemakaian.</Empty></td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </BlurFade>
  );
}
