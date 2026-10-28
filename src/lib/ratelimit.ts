// Pembatas laju sederhana per kunci (IP atau lisensi), di memori proses. Cukup untuk satu instance;
// kalau nanti jalan di beberapa instance, pindahkan ke Redis/Upstash dengan antarmuka yang sama.
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  b.count++;
  if (b.count > limit) return { ok: false, remaining: 0, retryAfterSec: Math.ceil((b.reset - now) / 1000) };
  return { ok: true, remaining: limit - b.count, retryAfterSec: 0 };
}

export function clientIp(req: Request) {
  const h = req.headers;
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "local";
}

// Bandingkan versi "a.b.c". true kalau cur >= min.
export function versionAtLeast(cur: string, min: string) {
  const a = cur.split(".").map((n) => parseInt(n, 10) || 0);
  const b = min.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) { if ((a[i] || 0) > (b[i] || 0)) return true; if ((a[i] || 0) < (b[i] || 0)) return false; }
  return true;
}
