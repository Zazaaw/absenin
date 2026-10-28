// Rekam video demo dari ekstensi asli: layar pembuka -> halaman MagangHub (tiruan) -> panel -> generate -> isi form.
// Butuh dev server jalan di BASE (default http://localhost:3000) karena generate lewat API lisensi.
// Jalankan: npm run demo   -> public/demo.webm
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import os from "os";

const BASE = process.env.BASE || "http://localhost:3000";
const here = path.dirname(fileURLToPath(import.meta.url));
const EXT = path.resolve(here, "..", "extension");
const OUT = path.resolve(here, "..", "public");
const MOCK = fs.readFileSync(path.join(here, "mock-maganghub.html"), "utf8");
const SITE = "https://monev.maganghub.kemnaker.go.id/dashboard/riwayat";

// lisensi sementara untuk demo, dibuat lewat jalur admin (tidak kena pembatas laju trial)
async function makeLicense() {
  const login = await fetch(BASE + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: process.env.ADMIN_EMAIL || "admin@absenin.local", password: process.env.ADMIN_PASSWORD || "admin123" }) });
  if (!login.ok) throw new Error("login admin gagal: " + (await login.text()));
  const cookie = (login.headers.get("set-cookie") || "").split(";")[0];
  const r = await fetch(BASE + "/api/admin/licenses", { method: "POST", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify({ email: `demo-video-${Date.now()}@absenin.local`, plan: "pro", days: 1, dailyQuota: 20, note: "lisensi sementara rekaman demo" }) });
  const j = await r.json();
  if (!j.license?.key) throw new Error("buat lisensi gagal: " + JSON.stringify(j));
  return j.license.key;
}

const key = await makeLicense();
const vidDir = fs.mkdtempSync(path.join(os.tmpdir(), "md-demo-"));
const userDir = fs.mkdtempSync(path.join(os.tmpdir(), "md-demo-profile-"));
const ctx = await chromium.launchPersistentContext(userDir, {
  channel: "chromium", headless: true, viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1,
  recordVideo: { dir: vidDir, size: { width: 1280, height: 800 } },
  args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required"],
});
let sw = ctx.serviceWorkers()[0]; if (!sw) sw = await ctx.waitForEvent("serviceworker", { timeout: 20000 });
const extId = new URL(sw.url()).host;
await ctx.route("https://monev.maganghub.kemnaker.go.id/**", (route) => route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: MOCK }));

// tutup tab onboarding yang terbuka otomatis saat install
for (const p of ctx.pages()) if (p.url().includes("onboarding")) await p.close();
const page = ctx.pages()[0] || (await ctx.newPage());
await page.goto(`chrome-extension://${extId}/options/options.html`);
await page.evaluate(async ({ key, BASE }) => {
  await chrome.storage.local.set({ settings: { hour: 16, minute: 0, nickname: "Wak", theme: "sore", nightMode: "off", sound: false, mode: "lisensi", apiBase: BASE, historyHints: false, telemetry: false }, onboarded: true, licenseKey: key, installedAt: "2026-10-01", history: {} });
}, { key, BASE });

// 1. layar pembuka (4 detik)
await page.goto(`chrome-extension://${extId}/splash/splash.html#r=daily`);
await page.waitForTimeout(4200);
// 2. halaman MagangHub tiruan, panel kebuka
await page.goto(SITE);
await page.waitForFunction(() => !!document.getElementById("sawit-diary-root"), null, { timeout: 15000 });
await page.waitForTimeout(1500);
// panel biasanya sudah terbuka otomatis saat form terdeteksi; buka hanya kalau belum
await page.evaluate(() => { const r = document.getElementById("sawit-diary-root").shadowRoot; if (!r.querySelector(".panel").classList.contains("open")) r.querySelector(".fab").click(); });
await page.waitForTimeout(900);
// 3. ketik cerita pelan-pelan
const brief = "benerin bug login modul absensi, meeting mentor bahas deploy staging";
for (const ch of brief) { await page.evaluate((c) => { const r = document.getElementById("sawit-diary-root").shadowRoot; const ta = r.querySelector("#brief"); ta.value += c; ta.dispatchEvent(new Event("input", { bubbles: true })); }, ch); await page.waitForTimeout(28); }
await page.waitForTimeout(600);
// 4. generate (lewat API dev server, template cadangan kalau tanpa OpenAI key)
await page.evaluate(() => { const r = document.getElementById("sawit-diary-root").shadowRoot; r.querySelector("#gen").click(); });
await page.waitForFunction(() => { const r = document.getElementById("sawit-diary-root").shadowRoot; return r.querySelector("#fields").style.display === "grid"; }, null, { timeout: 30000 });
await page.waitForTimeout(2200);
// 5. isi ke form + kelopak
await page.evaluate(() => { const r = document.getElementById("sawit-diary-root").shadowRoot; r.querySelector("#fill").click(); });
await page.waitForTimeout(2800);
await page.evaluate(() => { const r = document.getElementById("sawit-diary-root").shadowRoot; r.querySelector(".x").click(); });
await page.waitForTimeout(1200);
await page.evaluate(() => window.scrollTo({ top: 520, behavior: "smooth" }));
await page.waitForTimeout(1600);

// Simpan video SEBELUM konteks ditutup: di Windows, menutup konteks persisten dengan perekaman
// kadang memicu assertion libuv yang mematikan proses sebelum sempat menyalin file.
const video = page.video();
await page.close();
fs.mkdirSync(OUT, { recursive: true });
const dest = path.join(OUT, "demo.webm");
await video.saveAs(dest);
console.log("demo →", dest, Math.round(fs.statSync(dest).size / 1024) + " KB");
await ctx.close().catch(() => {});
