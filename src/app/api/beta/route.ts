import { getDb } from "@/lib/db";
import { fail, json } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

// Daftar jadi beta tester dari landing page.
export async function POST(req: Request) {
  const rl = rateLimit("beta:" + clientIp(req), 5, 60 * 60 * 1000);
  if (!rl.ok) return fail("Terlalu sering. Coba lagi nanti.", 429);
  const b = (await req.json().catch(() => ({}))) as { email?: string; kampus?: string; note?: string; website?: string };
  if (b.website) return json({ ok: true }); // honeypot bot
  const email = String(b.email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Email tidak valid.", 400);
  const r = await getDb().addBeta({ email, kampus: String(b.kampus || "").slice(0, 80), note: String(b.note || "").slice(0, 200) });
  return json({ ok: true, dup: r.dup });
}

export async function GET() {
  const s = await getDb().publicStats();
  return json({ ok: true, ...s });
}
