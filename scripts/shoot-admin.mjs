// Screenshot halaman admin dan dashboard untuk README. Membuat admin sementara + data contoh di Supabase, lalu menghapusnya lagi.
// Jalankan setelah `npm run dev`:  npm run shots:admin
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { adminClient, ensureUser } from "./supa.mjs";
const BASE = "http://localhost:3000";
const OUT = path.resolve("docs/screenshots"); fs.mkdirSync(OUT, { recursive: true });
const { sb } = adminClient();
const stamp = Date.now();
const adminEmail = `shot-admin-${stamp}@absenin.test`, pw = "rahasia123";
const a = await ensureUser(sb, adminEmail, pw, "Faiz");
await sb.from("profiles").upsert({ email: adminEmail, auth_id: a.id, role: "admin", name: "Faiz" }, { onConflict: "email" });
// data contoh supaya tabel nggak kosong
const demo = [
  { email: "nadia@unpad.ac.id", plan: "pro", days: 30, quota: 6, device: "Laptop Nadia", note: "bayar QRIS 25 Okt" },
  { email: "rizky@ui.ac.id", plan: "trial", days: 7, quota: 6, device: "ASUS-RIZKY", note: "" },
  { email: "tim-hcm@ptpn.id", plan: "tim", days: 90, quota: 10, device: null, note: "5 kode, dibayar kantor" },
  { email: "lama@ugm.ac.id", plan: "pro", days: -4, quota: 6, device: "PC Lab", note: "" },
];
const ids = [];
for (const d of demo) {
  const key = "AB-" + [0, 1, 2].map(() => Math.random().toString(36).slice(2, 6).toUpperCase()).join("-");
  const { data } = await sb.from("licenses").insert({ key, email: d.email, plan: d.plan, status: "active", daily_quota: d.quota, expires_at: new Date(Date.now() + d.days * 864e5).toISOString(), device_id: d.device ? "dev-" + d.email : null, device_name: d.device, note: d.note, last_used_at: d.device ? new Date().toISOString() : null }).select().single();
  if (data) ids.push(data.id);
}
for (let i = 0; i < 14; i++) for (let j = 0; j < (i * 7) % 5; j++) await sb.from("usage_log").insert({ license_id: ids[0], email: demo[0].email, ok: j !== 3, prompt_tokens: 420, completion_tokens: 260, template_id: ["teknis", "data", "rapat"][j % 3], offline: false, error: j === 3 ? "OpenAI 429 rate limit" : "", created_at: new Date(Date.now() - i * 864e5 - j * 36e5).toISOString() });
await sb.from("telemetry").insert([{ event: "device-change", detail: "Laptop Nadia → HP-Nadia", version: "0.2.0", license_id: ids[0], email: demo[0].email }, { event: "detect-failed", detail: "kalender tidak ditemukan", version: "0.1.9", license_id: ids[1], email: demo[1].email }]);
await sb.from("beta_signups").insert({ email: "beta@itb.ac.id", kampus: "ITB", note: "magang di BUMN" });

const browser = await chromium.launch({ channel: "chromium" });
async function shoot(dark) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: dark ? "dark" : "light" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/login"); await page.fill("input[type=email]", adminEmail); await page.fill("input[type=password]", pw);
  await page.click("button[type=submit]"); await page.waitForURL("**/admin", { timeout: 20000 });
  const sfx = dark ? "-dark" : "";
  for (const [p, name] of [["/admin", "admin"], ["/admin/lisensi", "admin-lisensi"], ["/admin/lisensi/baru", "admin-lisensi-baru"], ["/admin/pengguna", "admin-pengguna"], ["/admin/laporan", "admin-laporan"], ["/admin/konfigurasi", "admin-konfigurasi"], ["/dashboard", "dashboard"]]) {
    if (dark && !["admin", "admin-lisensi-baru"].includes(name)) continue;
    await page.goto(BASE + p, { waitUntil: "networkidle" }); await page.waitForTimeout(1200);
    if (name === "admin-lisensi-baru") { await page.fill("input[type=email]", "nadia@unpad.ac.id"); await page.waitForTimeout(300); }
    await page.screenshot({ path: path.join(OUT, name + sfx + ".png"), fullPage: true });
    console.log("•", name + sfx);
  }
  await ctx.close();
}
await shoot(false); await shoot(true);
await browser.close();
// bersihkan
for (const id of ids) { await sb.from("usage_log").delete().eq("license_id", id); await sb.from("telemetry").delete().eq("license_id", id); }
await sb.from("licenses").delete().in("id", ids);
await sb.from("beta_signups").delete().eq("email", "beta@itb.ac.id");
await sb.from("profiles").delete().eq("email", adminEmail);
await sb.auth.admin.deleteUser(a.id);
console.log("bersih, selesai");
