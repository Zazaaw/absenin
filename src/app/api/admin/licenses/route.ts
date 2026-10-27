import { getDb, type Plan } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { makeLicenseKey } from "@/lib/crypto";
import { fail, json } from "@/lib/api";

export const runtime = "nodejs";

async function admin() {
  const u = await getSessionUser();
  return u && u.role === "admin" ? u : null;
}

// Buat lisensi baru.
export async function POST(req: Request) {
  if (!(await admin())) return fail("Khusus admin.", 403);
  const b = (await req.json().catch(() => ({}))) as { email?: string; plan?: Plan; days?: number; dailyQuota?: number; note?: string };
  const email = String(b.email || "").trim().toLowerCase();
  if (!email.includes("@")) return fail("Email tidak valid.", 400);
  const db = getDb();
  const cfg = await db.getConfig();
  const user = await db.getUserByEmail(email);
  const days = Math.max(1, Math.min(3650, Number(b.days) || 30));
  const lic = await db.createLicense({
    key: makeLicenseKey(), userId: user?.id || null, email, plan: (["trial", "pro", "tim"].includes(String(b.plan)) ? b.plan : "pro") as Plan,
    status: "active", dailyQuota: Math.max(1, Number(b.dailyQuota) || cfg.defaultDailyQuota),
    expiresAt: new Date(Date.now() + days * 86400000).toISOString(), deviceId: null, deviceName: null, note: String(b.note || "").slice(0, 200),
  });
  return json({ ok: true, license: lic });
}

// Cabut, aktifkan lagi, perpanjang, atau ubah kuota.
export async function PATCH(req: Request) {
  if (!(await admin())) return fail("Khusus admin.", 403);
  const b = (await req.json().catch(() => ({}))) as { id?: string; action?: string; days?: number; dailyQuota?: number };
  if (!b.id) return fail("id wajib.", 400);
  const db = getDb();
  const all = await db.listLicenses();
  const lic = all.find((l) => l.id === b.id);
  if (!lic) return fail("Lisensi tidak ditemukan.", 404);
  if (b.action === "revoke") await db.updateLicense(lic.id, { status: "revoked" });
  else if (b.action === "activate") await db.updateLicense(lic.id, { status: "active", expiresAt: Date.parse(lic.expiresAt) < Date.now() ? new Date(Date.now() + 30 * 86400000).toISOString() : lic.expiresAt });
  else if (b.action === "extend") {
    const base = Math.max(Date.now(), Date.parse(lic.expiresAt));
    await db.updateLicense(lic.id, { status: "active", expiresAt: new Date(base + Math.max(1, Number(b.days) || 30) * 86400000).toISOString() });
  } else if (b.action === "quota") await db.updateLicense(lic.id, { dailyQuota: Math.max(1, Number(b.dailyQuota) || lic.dailyQuota) });
  else if (b.action === "unbind") await db.updateLicense(lic.id, { deviceId: null, deviceName: null });
  else return fail("action tidak dikenal.", 400);
  return json({ ok: true });
}
