import { getDb } from "@/lib/db";
import { checkLicense } from "@/lib/license";
import { bearer, fail, json, preflight } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export async function OPTIONS() { return preflight(); }

const ALLOWED = new Set(["detect-failed", "generate-error", "fill-failed", "update-required", "install", "uninstall-intent", "nag-skipped"]);

// Laporan error anonim dari ekstensi (opt-in). Tanpa isi laporan, tanpa URL selain domain MagangHub.
export async function POST(req: Request) {
  const rl = rateLimit("tele:" + clientIp(req), 60, 60 * 60 * 1000);
  if (!rl.ok) return fail("Terlalu sering.", 429);
  const b = (await req.json().catch(() => ({}))) as { event?: string; detail?: string; version?: string };
  const event = String(b.event || "");
  if (!ALLOWED.has(event)) return fail("event tidak dikenal.", 400);
  let licenseId: string | null = null, email = "";
  const key = bearer(req);
  if (key) { const c = await checkLicense(key); if (c.ok) { licenseId = c.license.id; email = c.license.email; } }
  await getDb().logTelemetry({ event, detail: String(b.detail || "").slice(0, 400), version: String(b.version || "").slice(0, 20), licenseId, email });
  return json({ ok: true });
}
