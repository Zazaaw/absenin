import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { localLogin, SESSION_COOKIE } from "@/lib/auth";
import { env, isSupabaseMode } from "@/lib/env";
import { fail } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = rateLimit("login:" + clientIp(req), 10, 10 * 60 * 1000);
  if (!rl.ok) return fail(`Terlalu banyak percobaan. Coba lagi ${Math.ceil(rl.retryAfterSec / 60)} menit lagi.`, 429);
  const { email = "", password = "" } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!email || !password) return fail("Isi email dan kata sandi.", 400);

  if (isSupabaseMode()) {
    const res = NextResponse.json({ ok: true });
    const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
      cookies: {
        getAll: () => [],
        setAll: (list) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return fail("Email atau kata sandi salah.", 401);
    return res;
  }

  const r = await localLogin(email, password);
  if (!r.ok) return fail(r.error, 401);
  const res = NextResponse.json({ ok: true, role: r.user.role });
  res.cookies.set(SESSION_COOKIE, r.token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14, secure: process.env.NODE_ENV === "production" });
  return res;
}
