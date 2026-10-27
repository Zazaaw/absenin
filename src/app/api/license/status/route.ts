import { checkLicense, maskKey } from "@/lib/license";
import { bearer, fail, json, preflight } from "@/lib/api";

export const runtime = "nodejs";
export async function OPTIONS() { return preflight(); }

export async function GET(req: Request) {
  const check = await checkLicense(bearer(req));
  if (!check.ok) return fail(check.error, check.status);
  const l = check.license;
  return json({ ok: true, plan: l.plan, expiresAt: l.expiresAt, dailyQuota: l.dailyQuota, usedToday: check.usedToday, remaining: check.remaining, keyMasked: maskKey(l.key) });
}
