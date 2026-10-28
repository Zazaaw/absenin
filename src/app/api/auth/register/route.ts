import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import { fail } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = rateLimit("register:" + clientIp(req), 5, 60 * 60 * 1000);
  if (!rl.ok) return fail("Terlalu banyak pendaftaran dari jaringan ini. Coba lagi nanti.", 429);
  const { email = "", password = "", name = "", setuju = false } = (await req.json().catch(() => ({}))) as { email?: string; password?: string; name?: string; setuju?: boolean };
  if (!email || !password) return fail("Isi email dan kata sandi.", 400);
  if (!setuju) return fail("Centang persetujuan Syarat Layanan dulu.", 400);

  if (password.length < 6) return fail("Kata sandi minimal 6 karakter.", 400);
  const pending: { name: string; value: string; options: Record<string, unknown> }[] = [];
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: { getAll: () => [], setAll: (list) => list.forEach((c) => pending.push(c)) },
  });
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: name || email.split("@")[0] } } });
  if (error) return fail(error.message.includes("already registered") ? "Email sudah terdaftar." : error.message, 400);
  // Kalau "Confirm email" aktif di Supabase, belum ada sesi: user harus klik tautan di email dulu.
  const needsConfirm = !data.session;
  const res = NextResponse.json({ ok: true, role: "user", needsConfirm });
  pending.forEach(({ name: n, value, options }) => res.cookies.set(n, value, options));
  return res;
}
