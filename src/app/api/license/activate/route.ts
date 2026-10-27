import { getDb } from "@/lib/db";
import { checkLicense, maskKey } from "@/lib/license";
import { fail, json, preflight } from "@/lib/api";
import { clientIp, rateLimit, versionAtLeast } from "@/lib/ratelimit";

export const runtime = "nodejs";
export async function OPTIONS() { return preflight(); }

// Ekstensi mengirim kode lisensi + id perangkat. Satu lisensi terikat ke satu perangkat;
// pindah perangkat diizinkan (perangkat lama otomatis lepas), tapi tercatat.
export async function POST(req: Request) {
  const rl = rateLimit("activate:" + clientIp(req), 20, 10 * 60 * 1000);
  if (!rl.ok) return fail("Terlalu sering. Coba lagi beberapa menit.", 429);
  let body: { key?: string; deviceId?: string; deviceName?: string; version?: string };
  try { body = await req.json(); } catch { return fail("Body bukan JSON.", 400); }
  const check = await checkLicense(body.key);
  if (!check.ok) return fail(check.error, check.status);
  const db = getDb();
  const cfg = await db.getConfig();
  const deviceId = String(body.deviceId || "").slice(0, 80) || null;
  const deviceName = String(body.deviceName || "").slice(0, 80) || null;
  const prev = check.license;
  // Ikatan perangkat: pindah perangkat dicatat sebagai kejadian, kelihatan di dashboard dan admin.
  if (prev.deviceId && deviceId && prev.deviceId !== deviceId) {
    await db.logTelemetry({ event: "device-change", detail: `${prev.deviceName || prev.deviceId} -> ${deviceName || deviceId}`, version: String(body.version || ""), licenseId: prev.id, email: prev.email });
  }
  const lic = await db.updateLicense(prev.id, { deviceId, deviceName, lastUsedAt: new Date().toISOString() });
  const version = String(body.version || "0.0.0");
  const updateRequired = !versionAtLeast(version, cfg.minExtensionVersion || "0.0.0");
  if (updateRequired) await db.logTelemetry({ event: "update-required", detail: `versi ${version} < ${cfg.minExtensionVersion}`, version, licenseId: prev.id, email: prev.email });
  return json({
    ok: true,
    plan: lic?.plan, status: lic?.status, expiresAt: lic?.expiresAt, dailyQuota: lic?.dailyQuota,
    usedToday: check.usedToday, remaining: check.remaining, email: lic?.email, keyMasked: maskKey(lic?.key || ""),
    announcement: cfg.announcement || "", minExtensionVersion: cfg.minExtensionVersion, updateRequired,
  });
}
