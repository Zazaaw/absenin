import { getDb, type License } from "./db";

export type LicenseCheck =
  | { ok: true; license: License; usedToday: number; remaining: number }
  | { ok: false; status: 401 | 402 | 429; error: string; license?: License };

// Validasi kode lisensi dari ekstensi: ada, aktif, belum kedaluwarsa, kuota harian masih ada.
export async function checkLicense(rawKey: string | null | undefined, opts?: { consume?: boolean }): Promise<LicenseCheck> {
  const key = (rawKey || "").trim().toUpperCase();
  if (!key) return { ok: false, status: 401, error: "Kode lisensi kosong." };
  const db = getDb();
  const license = await db.getLicenseByKey(key);
  if (!license) return { ok: false, status: 401, error: "Kode lisensi tidak dikenal." };
  if (license.status === "revoked") return { ok: false, status: 401, error: "Lisensi dicabut. Hubungi admin.", license };
  if (Date.parse(license.expiresAt) < Date.now()) {
    if (license.status !== "expired") await db.updateLicense(license.id, { status: "expired" });
    return { ok: false, status: 402, error: "Lisensi kedaluwarsa. Perpanjang di dashboard.", license };
  }
  const usedToday = await db.countUsageToday(license.id);
  const remaining = Math.max(0, license.dailyQuota - usedToday);
  if (opts?.consume && remaining <= 0) return { ok: false, status: 429, error: `Kuota harian habis (${license.dailyQuota} generate/hari). Coba lagi besok.`, license };
  return { ok: true, license, usedToday, remaining };
}

export function maskKey(key: string) {
  return key.replace(/^(MD-[A-Z0-9]{4})-[A-Z0-9]{4}-([A-Z0-9]{4})$/, "$1-••••-$2");
}
