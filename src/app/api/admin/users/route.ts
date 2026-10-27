import { getDb, type Role } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { fail, json } from "@/lib/api";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const me = await getSessionUser();
  if (!me || me.role !== "admin") return fail("Khusus admin.", 403);
  const b = (await req.json().catch(() => ({}))) as { id?: string; role?: Role };
  if (!b.id || !["user", "admin"].includes(String(b.role))) return fail("id dan role wajib.", 400);
  if (b.id === me.id && b.role !== "admin") return fail("Nggak bisa mencabut admin dari diri sendiri.", 400);
  await getDb().setUserRole(b.id, b.role as Role);
  return json({ ok: true });
}
