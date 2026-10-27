// Screenshot ekstensi asli dengan Playwright (Chromium + ekstensi unpacked).
// Jalankan: npm run shots   (sekali: npx playwright install chromium)
// Hasil: public/shots/*.png, dipakai landing page.
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import os from "os";

const here = path.dirname(fileURLToPath(import.meta.url));
const EXT = path.resolve(here, "..", "extension");
const OUT = path.resolve(here, "..", "public", "shots");
const MOCK = fs.readFileSync(path.join(here, "mock-maganghub.html"), "utf8");
const SITE = "https://monev.maganghub.kemnaker.go.id/dashboard/riwayat";
fs.mkdirSync(OUT, { recursive: true });

const FIELDS = {
  aktivitas: "Hari ini saya memperbaiki bug pada modul login di sistem absensi, menelusuri penyebab sesi yang kedaluwarsa lebih cepat dari seharusnya, lalu menguji ulang alur masuk di lingkungan staging bersama mentor.",
  pembelajaran: "Saya belajar membaca log server secara sistematis untuk menemukan akar masalah, serta memahami pentingnya pengujian di staging sebelum perubahan dibawa ke server produksi.",
  kendala: "Kendala yang dialami adalah akses ke server staging sempat terputus karena konfigurasi jaringan kantor. Saya mengatasinya dengan berkoordinasi ke tim IT dan memakai koneksi cadangan.",
};

async function main() {
  const userDir = fs.mkdtempSync(path.join(os.tmpdir(), "md-shots-"));
  const headless = process.env.HEADFUL ? false : true;
  const ctx = await chromium.launchPersistentContext(userDir, {
    channel: "chromium",
    headless,
    viewport: { width: 1280, height: 860 },
    deviceScaleFactor: 2,
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, "--hide-scrollbars"],
  });
  let sw = ctx.serviceWorkers()[0];
  if (!sw) sw = await ctx.waitForEvent("serviceworker", { timeout: 20000 });
  const extId = new URL(sw.url()).host;
  console.log("extension id", extId);

  // Halaman MagangHub tiruan: route dipenuhi dari file lokal supaya content script tetap jalan.
  await ctx.route("https://monev.maganghub.kemnaker.go.id/**", (route) => route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: MOCK }));

  const page = await ctx.newPage();
  const extUrl = (p) => `chrome-extension://${extId}/${p}`;

  async function setSettings(patch, history) {
    await page.goto(extUrl("options/options.html"));
    await page.evaluate(async ({ patch, history }) => {
      const { settings } = await chrome.storage.local.get("settings");
      const next = { ...(settings || {}), hour: 16, minute: 0, nickname: "Wak", ...patch };
      const store = { settings: next, installedAt: "2026-10-01", openaiKey: "sk-demo", eventLog: [{ t: 1, s: "16.00.00 Alarm harian dijadwalkan Rabu, 28 Oktober 2026 16.00" }, { t: 2, s: "16.00.01 Pengingat mulai (daily)" }, { t: 3, s: "16.00.02 Notifikasi ditampilkan" }] };
      if (history) store.history = history;
      await chrome.storage.local.set(store);
    }, { patch, history });
  }
  // riwayat 3 minggu: hari kerja terkirim, hari ini (27 Okt 2026) belum
  const hist = {};
  for (let d = 6; d <= 26; d++) { const dt = new Date(2026, 9, d); if (dt.getDay() % 6) hist[`2026-10-${String(d).padStart(2, "0")}`] = { status: "done", fields: { aktivitas: "x" }, brief: "coding modul absensi, meeting mentor" }; }

  async function shotPopup(name, theme, done = false) {
    const h = { ...hist }; if (done) h["2026-10-27"] = { status: "submitted" };
    await setSettings({ theme, nightMode: "off" }, h);
    await page.goto(extUrl("popup/popup.html"));
    await page.setViewportSize({ width: 420, height: 600 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    await page.setViewportSize({ width: 1280, height: 860 });
  }
  async function shotSplash(name, theme, reason = "daily") {
    await setSettings({ theme, nightMode: "off", sound: false });
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(extUrl(`splash/splash.html#r=${reason}`));
    await page.waitForTimeout(2600);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    await page.setViewportSize({ width: 1280, height: 860 });
  }
  async function shotOptions(name, theme) {
    await setSettings({ theme, nightMode: "off" });
    await page.setViewportSize({ width: 1536, height: 900 });
    await page.goto(extUrl("options/options.html"));
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    await page.setViewportSize({ width: 1280, height: 860 });
  }
  async function shotPanel(name, theme, { filled = false, hist: useHist = true } = {}) {
    await setSettings({ theme, nightMode: "off", historyHints: false }, useHist ? hist : {});
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto(SITE);
    await page.waitForFunction(() => !!document.getElementById("sawit-diary-root"), null, { timeout: 15000 });
    await page.waitForTimeout(1200);
    await page.evaluate(({ filled, FIELDS }) => {
      const root = document.getElementById("sawit-diary-root").shadowRoot;
      root.querySelector(".panel").classList.add("open");
      root.querySelector("#brief").value = "benerin bug login modul absensi, meeting mentor bahas deploy staging";
      if (filled) {
        root.querySelector("#skel").style.display = "none";
        root.querySelector("#fields").style.display = "grid";
        root.querySelector("#step1").classList.remove("on");
        root.querySelector("#step2").classList.add("on");
        for (const k of ["aktivitas", "pembelajaran", "kendala"]) { const ta = root.querySelector("#f_" + k); ta.value = FIELDS[k]; ta.style.height = "auto"; ta.style.height = ta.scrollHeight + 2 + "px"; ta.dispatchEvent(new Event("input", { bubbles: true })); }
        root.querySelectorAll(".field").forEach((f) => { f.style.opacity = 1; f.style.transform = "none"; });
        document.querySelectorAll("#dialog textarea").forEach((t, i) => { t.value = Object.values(FIELDS)[i]; });
      }
    }, { filled, FIELDS });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    await page.setViewportSize({ width: 1280, height: 860 });
  }

  await shotPopup("popup-bara", "bara");
  await shotPopup("popup-simpel", "simpel");
  await shotPopup("popup-robo", "robo");
  await shotPopup("popup-astro", "astro", true);
  await shotPopup("popup-harimau", "harimau", true);
  await shotPopup("popup-hiu", "hiu");
  await shotSplash("splash-hiu", "hiu");
  await shotSplash("splash-bara", "bara");
  await shotSplash("splash-robo", "robo", "nag");
  await shotOptions("options-bara", "bara");
  await shotOptions("options-simpel", "simpel");
  // panduan pertama kali
  await setSettings({ theme: "bara", nightMode: "off" });
  await page.setViewportSize({ width: 1100, height: 820 });
  await page.goto(extUrl("onboarding/onboarding.html"));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, "onboarding.png") });
  await page.evaluate(() => { document.querySelectorAll(".step").forEach((s) => s.classList.toggle("on", s.dataset.step === "2")); });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, "onboarding-tema.png") });
  await page.setViewportSize({ width: 1280, height: 860 });
  await shotPanel("panel-bara", "bara");
  await shotPanel("panel-robo", "robo");
  await shotPanel("panel-astro", "astro");
  await shotPanel("panel-filled", "bara", { filled: true });

  await ctx.close();
  console.log("done →", OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
