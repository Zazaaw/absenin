// Jadikan sebuah email admin. Membuat user Supabase Auth (terkonfirmasi) bila belum ada, lalu set profiles.role = 'admin'.
//   npm run admin -- email@kamu.id kata-sandi-kuat
//   npm run admin -- email@kamu.id            (user sudah ada; hanya naikkan role)
import { adminClient, assertSchema, ensureUser } from "./supa.mjs";

const [email, password] = process.argv.slice(2);
if (!email) { console.error("Pakai: npm run admin -- email@kamu.id [kata-sandi]"); process.exit(1); }
const { sb, env: senv } = adminClient();
await assertSchema(sb, senv);
const user = await ensureUser(sb, email, password, "Admin");
const { data: prof, error } = await sb.from("profiles").upsert({ email: email.toLowerCase(), auth_id: user.id, role: "admin", name: "Admin" }, { onConflict: "email" }).select().single();
if (error) throw error;
console.log(`admin siap: ${prof.email} (role ${prof.role}, auth ${user.id.slice(0, 8)}…)`);
console.log("masuk di /login pakai email itu dan kata sandinya.");
