import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  // cookie Supabase (kalau ada)
  const jar = await cookies();
  jar.getAll().forEach((c) => { if (c.name.startsWith("sb-")) res.cookies.set(c.name, "", { path: "/", maxAge: 0 }); });
  return res;
}
