import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { fail, json } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const u = await getSessionUser();
  if (!u || u.role !== "admin") return fail("Khusus admin.", 403);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if (typeof b.model === "string") patch.model = b.model.trim() || "gpt-4o-mini";
  if (b.defaultDailyQuota !== undefined) patch.defaultDailyQuota = Math.max(1, Math.min(200, Number(b.defaultDailyQuota) || 6));
  if (b.maxBriefChars !== undefined) patch.maxBriefChars = Math.max(100, Math.min(5000, Number(b.maxBriefChars) || 1200));
  if (typeof b.systemPromptExtra === "string") patch.systemPromptExtra = b.systemPromptExtra.slice(0, 2000);
  if (typeof b.announcement === "string") patch.announcement = b.announcement.slice(0, 300);
  if (typeof b.minExtensionVersion === "string") patch.minExtensionVersion = b.minExtensionVersion.slice(0, 20);
  if (b.trialDays !== undefined) patch.trialDays = Math.max(1, Math.min(90, Number(b.trialDays) || 7));
  const cfg = await getDb().setConfig(patch);
  return json({ ok: true, config: cfg });
}
