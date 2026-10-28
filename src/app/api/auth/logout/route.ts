import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // hapus cookie sesi Supabase
  const jar = await cookies();
  jar.getAll().forEach((c) => { if (c.name.startsWith("sb-")) res.cookies.set(c.name, "", { path: "/", maxAge: 0 }); });
  return res;
}
