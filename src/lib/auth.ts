// Sesi web untuk manusia (dashboard/admin). Mode lokal: cookie HMAC. Mode Supabase: Supabase Auth.
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getDb, type User } from "./db";
import { env, isSupabaseMode } from "./env";
import { sign, verify, verifyPassword, hashPassword } from "./crypto";

export const SESSION_COOKIE = "md_session";

export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies();
  if (isSupabaseMode()) {
    const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
      cookies: { getAll: () => jar.getAll(), setAll: () => {} },
    });
    const { data } = await supabase.auth.getUser();
    if (!data.user?.email) return null;
    const db = getDb();
    return (await db.getUserByEmail(data.user.email)) || { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || "", role: "user", createdAt: data.user.created_at };
  }
  const tok = verify<{ uid: string }>(jar.get(SESSION_COOKIE)?.value);
  if (!tok) return null;
  return getDb().getUserById(tok.uid);
}

export async function requireUser(): Promise<User> {
  const u = await getSessionUser();
  if (!u) throw new Error("UNAUTHENTICATED");
  return u;
}
export async function requireAdmin(): Promise<User> {
  const u = await requireUser();
  if (u.role !== "admin") throw new Error("FORBIDDEN");
  return u;
}

// ---- mode lokal ----
export async function localLogin(email: string, password: string): Promise<{ ok: true; token: string; user: User } | { ok: false; error: string }> {
  const db = getDb();
  const user = await db.getUserByEmail(email);
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) return { ok: false, error: "Email atau kata sandi salah." };
  return { ok: true, token: sign({ uid: user.id }), user };
}
export async function localRegister(email: string, password: string, name: string) {
  const db = getDb();
  if (await db.getUserByEmail(email)) return { ok: false as const, error: "Email sudah terdaftar." };
  if (password.length < 6) return { ok: false as const, error: "Kata sandi minimal 6 karakter." };
  const user = await db.createUser({ email, name, role: "user", passwordHash: hashPassword(password) });
  return { ok: true as const, token: sign({ uid: user.id }), user };
}
