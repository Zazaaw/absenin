import { getDb } from "@/lib/db";
import { checkLicense } from "@/lib/license";
import { generateReport } from "@/lib/generate";
import { bearer, fail, json, preflight } from "@/lib/api";
import { clientIp, rateLimit, versionAtLeast } from "@/lib/ratelimit";

export const runtime = "nodejs";
export async function OPTIONS() { return preflight(); }

// Dipanggil ekstensi. Authorization: Bearer <kode lisensi>.
export async function POST(req: Request) {
  const rl = rateLimit("gen:" + clientIp(req), 30, 10 * 60 * 1000);
  if (!rl.ok) return fail("Terlalu sering. Tunggu sebentar.", 429, { code: "RATE" });
  const check = await checkLicense(bearer(req), { consume: true });
  if (!check.ok) return fail(check.error, check.status, { code: check.status === 401 ? "LICENSE_INVALID" : check.status === 402 ? "LICENSE_EXPIRED" : "QUOTA" });
  const { license } = check;
  const db = getDb();
  const cfg = await db.getConfig();
  const ver = req.headers.get("x-extension-version") || "";
  if (ver && !versionAtLeast(ver, cfg.minExtensionVersion || "0.0.0")) return fail(`Ekstensi versi ${ver} sudah lama. Minimal ${cfg.minExtensionVersion}. Unduh versi baru di dashboard.`, 426, { code: "UPDATE_REQUIRED" });

  let body: { brief?: string; gaya?: { nama?: string; instruksi?: string }; nickname?: string; recent?: { date: string; aktivitas: string }[]; date?: string; templateId?: string };
  try { body = await req.json(); } catch { return fail("Body bukan JSON.", 400); }
  const brief = String(body.brief || "").trim();
  if (brief.length < 5) return fail("Cerita terlalu pendek.", 400);
  if (brief.length > cfg.maxBriefChars) return fail(`Cerita terlalu panjang (maks ${cfg.maxBriefChars} karakter).`, 400);
  const gaya = { nama: String(body.gaya?.nama || "Umum").slice(0, 60), instruksi: String(body.gaya?.instruksi || "").slice(0, 600) };

  const t0 = Date.now();
  try {
    const r = await generateReport(cfg, { brief, gaya, nickname: String(body.nickname || "").slice(0, 40), recent: (body.recent || []).slice(-3), date: body.date });
    await db.logUsage({ licenseId: license.id, email: license.email, model: r.model, promptTokens: r.promptTokens, completionTokens: r.completionTokens, ok: true, error: "", templateId: String(body.templateId || ""), briefLength: brief.length, offline: r.offline });
    await db.updateLicense(license.id, { lastUsedAt: new Date().toISOString() });
    return json({ ok: true, fields: r.fields, offline: r.offline, remaining: check.remaining - 1, ms: Date.now() - t0, announcement: cfg.announcement || "" });
  } catch (e) {
    const err = e as Error & { status?: number };
    await db.logUsage({ licenseId: license.id, email: license.email, model: cfg.model, promptTokens: 0, completionTokens: 0, ok: false, error: err.message.slice(0, 300), templateId: String(body.templateId || ""), briefLength: brief.length, offline: false });
    const msg = err.status === 429 ? "Layanan AI sedang penuh, coba beberapa detik lagi." : err.status === 401 ? "Konfigurasi AI di server bermasalah. Hubungi admin." : "Gagal generate: " + err.message;
    return fail(msg, 502, { code: "UPSTREAM" });
  }
}
