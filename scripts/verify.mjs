// Uji alur end-to-end di server lokal (http://localhost:3000) dan screenshot halaman web.
// Jalankan setelah `npm run start` atau `npm run dev`:  node scripts/verify.mjs
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const BASE = process.env.BASE || "http://localhost:3000";
const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, "..", ".verify");
fs.mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log("•", ...a);

async function api(p, opts = {}, cookie = "") {
  const r = await fetch(BASE + p, { ...opts, headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}), ...(opts.headers || {}) } });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, j, cookie: r.headers.get("set-cookie") || "" };
}

async function main() {
  // 1. daftar user baru
  const email = `tes${Date.now()}@contoh.id`;
  const reg = await api("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password: "rahasia123", name: "Tester", setuju: true }) });
  if (reg.status !== 200) throw new Error("register gagal " + JSON.stringify(reg.j));
  const cookie = reg.cookie.split(";")[0];
  log("daftar ok", email);
  // 2. trial
  const trial = await api("/api/me/trial", { method: "POST" }, cookie);
  if (trial.status !== 200) throw new Error("trial gagal " + JSON.stringify(trial.j));
  log("trial ok", trial.j.key);
  // 3. aktivasi seperti ekstensi
  const act = await api("/api/license/activate", { method: "POST", body: JSON.stringify({ key: trial.j.key, deviceId: "dev-verify", deviceName: "Verify bot" }) });
  if (act.status !== 200) throw new Error("activate gagal " + JSON.stringify(act.j));
  log("aktivasi ok", act.j.plan, "kuota", act.j.dailyQuota);
  // 4. generate (offline template kalau OPENAI_API_KEY kosong)
  const gen = await api("/api/generate", { method: "POST", headers: { Authorization: "Bearer " + trial.j.key }, body: JSON.stringify({ brief: "rekap data absensi karyawan, meeting mentor", templateId: "data", gaya: { nama: "Analis Data", instruksi: "fokus proses data" } }) });
  if (gen.status !== 200) throw new Error("generate gagal " + JSON.stringify(gen.j));
  log("generate ok", gen.j.offline ? "(template offline)" : "(OpenAI)", "sisa", gen.j.remaining, "aktivitas", gen.j.fields.aktivitas.length, "char");
  // 5. lisensi salah
  const bad = await api("/api/generate", { method: "POST", headers: { Authorization: "Bearer AB-XXXX-XXXX-XXXX" }, body: JSON.stringify({ brief: "apa saja" }) });
  if (bad.status !== 401) throw new Error("lisensi salah harusnya 401, dapat " + bad.status);
  log("lisensi salah ditolak 401 ok");

  // 6. screenshot halaman
  const browser = await chromium.launch({ channel: "chromium" });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, "landing-top.png") });
  // scroll pelan supaya animasi in-view terpicu, lalu full page
  for (let y = 0; y < 9000; y += 600) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, "landing-full.png"), fullPage: true });
  log("landing screenshot ok, tinggi", await page.evaluate(() => document.documentElement.scrollHeight));

  await page.goto(BASE + "/login"); await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "login.png") });
  await page.fill('input[type=email]', "admin@absenin.local"); await page.fill('input[type=password]', "admin123");
  await page.click('button[type=submit]'); await page.waitForURL("**/admin", { timeout: 15000 }); await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, "admin.png"), fullPage: true });
  log("admin ok");
  await page.goto(BASE + "/dashboard"); await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, "dashboard-admin.png"), fullPage: true });
  await api("/api/auth/logout", { method: "POST" });
  await ctx.clearCookies();
  await page.goto(BASE + "/login"); await page.fill('input[type=email]', email); await page.fill('input[type=password]', "rahasia123");
  await page.click('button[type=submit]'); await page.waitForURL("**/dashboard", { timeout: 15000 }); await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, "dashboard-user.png"), fullPage: true });
  log("dashboard user ok");
  await browser.close();
  if (errors.length) { console.log("Error browser:"); errors.forEach((e) => console.log("  ", e)); }
  console.log("selesai →", OUT);
}
main().catch((e) => { console.error("GAGAL:", e.message); process.exit(1); });
