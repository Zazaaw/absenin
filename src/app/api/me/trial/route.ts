import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { makeLicenseKey } from "@/lib/crypto";
import { fail, json } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

// Buat lisensi trial untuk user yang login, kalau belum pernah punya.
export async function POST(req: Request) {
  const rl = rateLimit("trial:" + clientIp(req), 3, 60 * 60 * 1000);
  if (!rl.ok) return fail("Terlalu sering. Coba lagi nanti.", 429);
  const user = await getSessionUser();
  if (!user) return fail("Belum login.", 401);
  const db = getDb();
  const existing = await db.listLicenses({ email: user.email });
  if (existing.length) return fail("Kamu sudah punya lisensi. Lihat di dashboard.", 409);
  const cfg = await db.getConfig();
  const lic = await db.createLicense({
    key: makeLicenseKey(), userId: user.id, email: user.email, plan: "trial", status: "active", dailyQuota: cfg.defaultDailyQuota,
    expiresAt: new Date(Date.now() + cfg.trialDays * 86400000).toISOString(), deviceId: null, deviceName: null, note: "Trial otomatis",
  });
  return json({ ok: true, key: lic.key, expiresAt: lic.expiresAt });
}
