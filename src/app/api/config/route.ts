import { getDb } from "@/lib/db";
import { json, preflight } from "@/lib/api";

export const runtime = "nodejs";
export async function OPTIONS() { return preflight(); }

// Konfigurasi publik untuk ekstensi (tanpa rahasia).
export async function GET() {
  const cfg = await getDb().getConfig();
  return json({ ok: true, announcement: cfg.announcement, minExtensionVersion: cfg.minExtensionVersion, defaultDailyQuota: cfg.defaultDailyQuota, maxBriefChars: cfg.maxBriefChars });
}
