import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import { getDb } from "@/lib/db";
import { fail } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = rateLimit("login:" + clientIp(req), 10, 10 * 60 * 1000);
  if (!rl.ok) return fail(`Terlalu banyak percobaan. Coba lagi ${Math.ceil(rl.retryAfterSec / 60)} menit lagi.`, 429);
  const { email = "", password = "" } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!email || !password) return fail("Isi email dan kata sandi.", 400);

  // Sesi dipegang Supabase Auth; cookie-nya ditulis oleh @supabase/ssr ke respons ini.
  const pending: { name: string; value: string; options: Record<string, unknown> }[] = [];
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: { getAll: () => [], setAll: (list) => list.forEach((c) => pending.push(c)) },
  });
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return fail(error.message.includes("Email not confirmed") ? "Email belum dikonfirmasi. Cek kotak masuk kamu." : "Email atau kata sandi salah.", 401);
  const profile = await getDb().getUserByEmail(email);
  const res = NextResponse.json({ ok: true, role: profile?.role || "user" });
  pending.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
  return res;
}
