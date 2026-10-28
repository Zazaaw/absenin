import type { License } from "@/lib/db/types";

/** Status tampilan lisensi: dicabut, kedaluwarsa, trial, atau aktif. Murni, aman dipakai di server maupun client. */
export type LicenseKind = "revoked" | "expired" | "trial" | "active";
export function kindOf(l: Pick<License, "status" | "expiresAt" | "plan">, now = Date.now()): LicenseKind {
  if (l.status === "revoked") return "revoked";
  if (Date.parse(l.expiresAt) < now) return "expired";
  return l.plan === "trial" ? "trial" : "active";
}

/** Hari tersisa (negatif kalau sudah lewat). */
export function daysLeft(expiresAt: string, now = Date.now()): number {
  return Math.ceil((Date.parse(expiresAt) - now) / 86400000);
}
/** Lisensi aktif/trial yang habis dalam `days` hari ke depan. */
export function expiringWithin<T extends Pick<License, "status" | "expiresAt" | "plan">>(list: T[], days: number): T[] {
  const now = Date.now();
  return list.filter((l) => { const k = kindOf(l, now); const d = (Date.parse(l.expiresAt) - now) / 86400000; return (k === "active" || k === "trial") && d >= 0 && d <= days; });
}
/** Apakah stempel waktu masih dalam `days` hari terakhir. */
export function withinLastDays(iso: string, days: number): boolean {
  return Date.now() - Date.parse(iso) < days * 86400000;
}
/** Ringkasan tampilan satu lisensi untuk kartu/tabel. */
export function licenseView(l: Pick<License, "status" | "expiresAt" | "plan">) {
  const now = Date.now();
  const kind = kindOf(l, now);
  const left = daysLeft(l.expiresAt, now);
  return { kind, expired: kind === "expired", daysLeft: Math.max(0, left), rawDaysLeft: left };
}
