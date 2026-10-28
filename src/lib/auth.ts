// Sesi web untuk manusia (dashboard/admin): Supabase Auth lewat cookie @supabase/ssr.
// Profil (tabel profiles) dibuat oleh trigger saat daftar; kalau belum ada (mis. user dibuat manual), dibuat di sini.
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getDb, type User } from "./db";
import { env, assertSupabaseEnv } from "./env";

export async function getSessionUser(): Promise<User | null> {
  assertSupabaseEnv();
  const jar = await cookies();
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: { getAll: () => jar.getAll(), setAll: () => {} },
  });
  const { data } = await supabase.auth.getUser();
  const au = data.user;
  if (!au?.email) return null;
  const db = getDb();
  const existing = (await db.getUserByAuthId(au.id)) || (await db.getUserByEmail(au.email));
  if (existing) {
    if (!existing.authId) await db.linkAuthId(existing.id, au.id);
    return existing;
  }
  return db.createUser({ email: au.email, name: au.user_metadata?.name || "", role: "user", authId: au.id });
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
