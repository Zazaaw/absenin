// Helper bersama untuk skrip: baca .env.local dan buat klien Supabase service role (hanya di laptop/server, tidak pernah di browser).
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export function loadEnv() {
  const out = { ...process.env };
  for (const f of [".env", ".env.local"]) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m && !(m[1] in process.env)) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return out;
}
export function adminClient() {
  const env = loadEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum ada di .env.local");
  return { env, sb: createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }) };
}
// Pastikan schema.sql sudah dijalankan; kalau belum, beri petunjuk yang bisa langsung diikuti.
export async function assertSchema(sb, env) {
  const { error } = await sb.from("profiles").select("id").limit(1);
  if (error && (String(error.code) === "PGRST205" || /schema cache|does not exist/i.test(String(error.message)))) {
    const ref = (env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([a-z0-9]+)\./) || [])[1] || "<ref>";
    console.error(`
Skema belum dipasang di project ${ref}.
  1. Buka https://supabase.com/dashboard/project/${ref}/sql/new
  2. Tempel isi supabase/schema.sql, klik Run.
  3. Jalankan perintah ini lagi.
`);
    process.exit(2);
    throw new Error(`Skema belum dipasang di project ${ref}.
  1. Buka https://supabase.com/dashboard/project/${ref}/sql/new
  2. Tempel isi supabase/schema.sql, klik Run.
  3. Jalankan perintah ini lagi.`);
  }
  if (error) throw error;
}
// Buat user Supabase Auth yang sudah terkonfirmasi (atau pakai yang ada), kembalikan auth user.
export async function ensureUser(sb, email, password, name = "") {
  const { data: list } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const found = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (found) {
    if (password) await sb.auth.admin.updateUserById(found.id, { password, email_confirm: true });
    return found;
  }
  const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
  if (error) throw error;
  return data.user;
}
