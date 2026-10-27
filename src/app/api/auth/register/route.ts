import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { localRegister, SESSION_COOKIE } from "@/lib/auth";
import { env, isSupabaseMode } from "@/lib/env";
import { fail } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = rateLimit("register:" + clientIp(req), 5, 60 * 60 * 1000);
  if (!rl.ok) return fail("Terlalu banyak pendaftaran dari jaringan ini. Coba lagi nanti.", 429);
  const { email = "", password = "", name = "", setuju = false } = (await req.json().catch(() => ({}))) as { email?: string; password?: string; name?: string; setuju?: boolean };
  if (!email || !password) return fail("Isi email dan kata sandi.", 400);
  if (!setuju) return fail("Centang persetujuan Syarat Layanan dulu.", 400);

  if (isSupabaseMode()) {
    const res = NextResponse.json({ ok: true });
    const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
      cookies: { getAll: () => [], setAll: (list) => list.forEach(({ name: n, value, options }) => res.cookies.set(n, value, options)) },
    });
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) return fail(error.message, 400);
    return res;
  }

  const r = await localRegister(email, password, name || email.split("@")[0]);
  if (!r.ok) return fail(r.error, 400);
  const res = NextResponse.json({ ok: true, role: r.user.role });
  res.cookies.set(SESSION_COOKIE, r.token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14, secure: process.env.NODE_ENV === "production" });
  return res;
}
