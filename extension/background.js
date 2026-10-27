// Service worker: alarm pengingat, notifikasi, buka tab, dan panggilan OpenAI.
// API key hanya hidup di sini. Popup, options, dan content script tidak pernah menerimanya.
importScripts('shared/util.js', 'shared/templates.js', 'shared/sawit.js', 'shared/themes.js');

const U = globalThis.SawitUtil;
const TH = globalThis.SawitThemes;
const URL_RIWAYAT = 'https://monev.maganghub.kemnaker.go.id/dashboard/riwayat';
const SITE_PREFIX = 'https://monev.maganghub.kemnaker.go.id/';
const NOTIF_ID = 'sawit-reminder';

const PESAN_PERTAMA = [
  'Jam {jam} nih. Hari ini ngapain aja? Ceritain dong, 2 menit selesai.',
  '{N} nungguin cerita hari ini. Laporan MagangHub belum diisi.',
  'Sebelum lupa, yuk isi laporan harian. Panelnya udah siap.',
  'Streak {streak} hari jangan putus. Isi laporan dulu, yuk.'
];
const PESAN_ULANG = [
  'Masih belum diisi. {N} mulai gelisah.',
  'Pengingat lagi: laporan hari ini masih kosong.',
  'Laporan hari ini belum terkirim. Isi dulu, yuk.',
  'Lima menit aja. Ceritain dikit, sisanya {n} yang rangkai.'
];
const PESAN_SIMPEL_PERTAMA = ['Jam {jam}. Laporan MagangHub hari ini belum diisi.', 'Waktunya isi laporan harian MagangHub. Streak {streak} hari.'];
const PESAN_SIMPEL_ULANG = ['Pengingat lagi: laporan hari ini masih kosong.', 'Laporan MagangHub belum terkirim.'];

// ---------- storage ----------
async function getSettings() {
  const { settings } = await chrome.storage.local.get('settings');
  return { ...U.DEFAULT_SETTINGS, ...(settings || {}) };
}
async function saveSettings(patch) {
  const s = await getSettings();
  const next = { ...s, ...patch };
  await chrome.storage.local.set({ settings: next });
  return next;
}
async function getHistory() {
  const { history } = await chrome.storage.local.get('history');
  return history || {};
}
async function setStatus(date, status, extra) {
  const h = await getHistory();
  h[date] = { ...(h[date] || {}), ...(extra || {}), status, updatedAt: Date.now() };
  await chrome.storage.local.set({ history: h });
  return h;
}
async function getKey() {
  const { openaiKey } = await chrome.storage.local.get('openaiKey');
  return openaiKey || '';
}

// Log kejadian (30 terakhir) supaya bisa dilihat di halaman pengaturan.
async function log(text) {
  try {
    const { eventLog } = await chrome.storage.local.get('eventLog');
    const arr = eventLog || [];
    const d = new Date();
    arr.push({ t: Date.now(), s: U.pad(d.getHours()) + '.' + U.pad(d.getMinutes()) + '.' + U.pad(d.getSeconds()) + ' ' + text });
    await chrome.storage.local.set({ eventLog: arr.slice(-30) });
  } catch (e) { /* abaikan */ }
}

function todayKey() { return U.dateKey(new Date()); }
async function isDoneToday() { return U.isDone((await getHistory())[todayKey()]); }
async function isWorkdayToday() { return U.isWorkday(todayKey(), await getSettings(), await getHistory()); }

// ---------- alarm ----------
function nextFire(hour, minute) {
  const now = new Date();
  const t = new Date();
  t.setHours(hour, minute, 0, 0);
  if (t <= now) t.setDate(t.getDate() + 1);
  return t.getTime();
}
async function scheduleDaily() {
  const s = await getSettings();
  await chrome.alarms.clear('daily');
  const when = nextFire(s.hour, s.minute);
  await chrome.alarms.create('daily', { when, periodInMinutes: 1440 });
  const d = new Date(when);
  await log('Alarm harian dijadwalkan ' + U.formatLong(d) + ' ' + U.pad(d.getHours()) + '.' + U.pad(d.getMinutes()));
}
async function isNagging() { return !!(await chrome.alarms.get('nag')); }

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
async function notify(first) {
  const s = await getSettings();
  const streak = U.computeStreak(await getHistory(), s);
  const jam = U.pad(s.hour) + '.' + U.pad(s.minute);
  const theme = TH.themeFor(s);
  const simpel = theme.id === 'simpel';
  const list = simpel ? (first ? PESAN_SIMPEL_PERTAMA : PESAN_SIMPEL_ULANG) : (first ? PESAN_PERTAMA : PESAN_ULANG);
  let msg = pick(list);
  if (msg.includes('{streak}') && streak < 2) msg = list[0];
  msg = TH.tt(theme, msg.replace('{jam}', jam).replace('{streak}', streak));
  const sapa = s.nickname ? 'Hai ' + s.nickname + '! ' : '';
  try {
    const level = await chrome.notifications.getPermissionLevel();
    if (level !== 'granted') await log('Notifikasi Chrome dimatikan (' + level + '). Cek Windows > Notifications > Google Chrome.');
  } catch (e) { /* abaikan */ }
  try {
    await chrome.notifications.clear(NOTIF_ID);
    await chrome.notifications.create(NOTIF_ID, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: first ? 'Waktunya isi laporan MagangHub' : 'Laporan MagangHub masih kosong',
      message: sapa + msg,
      priority: 2,
      requireInteraction: true,
      buttons: [{ title: 'Isi sekarang' }, { title: 'Tunda ' + s.snoozeMin + ' menit' }]
    });
    await log('Notifikasi ditampilkan');
  } catch (e) {
    await log('Notifikasi gagal: ' + (e.message || e));
  }
}

// Setiap langkah dijaga sendiri: satu langkah gagal tidak membatalkan yang lain.
async function openMagangHub(opts) {
  const s = await getSettings();
  const fullscreen = (opts && opts.fullscreen !== undefined) ? opts.fullscreen : s.fullscreen;
  const step = async (name, fn) => { try { return await fn(); } catch (e) { await log('Gagal ' + name + ': ' + (e.message || e)); return null; } };
  const splash = !!(opts && opts.splash && s.splash !== false);
  const SPLASH_URL = chrome.runtime.getURL('splash/splash.html');
  const targetUrl = splash ? SPLASH_URL + '#r=' + encodeURIComponent((opts && opts.reason) || 'daily') : URL_RIWAYAT + '#sawit';
  const tabs = (await step('cari tab', () => chrome.tabs.query({ url: [SITE_PREFIX + '*', SPLASH_URL + '*'] }))) || [];
  let tab = tabs.find(t => (t.url || '').includes('/dashboard/riwayat')) || tabs[0];
  if (!tab) {
    const win = await step('buka jendela baru', () => chrome.windows.create({ url: targetUrl, focused: true }));
    tab = win && win.tabs && win.tabs[0];
    if (!tab) return null;
    if (fullscreen) await step('fullscreen jendela baru', () => chrome.windows.update(tab.windowId, { state: 'fullscreen' }));
    await log('Buka jendela baru ' + (splash ? 'layar pembuka' : 'MagangHub'));
    return tab;
  }
  const upd = { active: true };
  if (splash || !(tab.url || '').includes('/dashboard/riwayat')) upd.url = targetUrl;
  await step('aktifkan tab', () => chrome.tabs.update(tab.id, upd));
  const w = await step('baca jendela', () => chrome.windows.get(tab.windowId));
  if (w && w.state === 'minimized') await step('restore jendela', () => chrome.windows.update(tab.windowId, { state: 'normal' }));
  await step('fokus jendela', () => chrome.windows.update(tab.windowId, { focused: true }));
  if (fullscreen) await step('fullscreen', () => chrome.windows.update(tab.windowId, { state: 'fullscreen' }));
  else await step('draw attention', () => chrome.windows.update(tab.windowId, { drawAttention: true }));
  if (opts && opts.ping && !splash) chrome.tabs.sendMessage(tab.id, { type: 'sawitNudge' }).catch(() => {});
  await log('Tab difokuskan' + (splash ? ' ke layar pembuka' : ' ke MagangHub') + (fullscreen ? ' (fullscreen)' : ''));
  return tab;
}

async function startNagging(reason, force) {
  if (!force) {
    if (!(await isWorkdayToday())) { await log('Alarm ' + reason + ' dilewati: hari ini bukan hari kerja / libur'); return false; }
    if (await isDoneToday()) { await log('Alarm ' + reason + ' dilewati: laporan hari ini sudah terkirim'); return false; }
  }
  const s = await getSettings();
  await log('Pengingat mulai (' + reason + ')');
  await openMagangHub({ ping: true, splash: true, reason });
  await notify(true);
  await chrome.alarms.clear('snooze');
  await chrome.alarms.clear('nag');
  chrome.alarms.create('nag', { periodInMinutes: Math.max(1, Number(s.intervalMin) || 10) });
  return true;
}
async function stopNagging() {
  await chrome.alarms.clear('nag');
  await chrome.alarms.clear('snooze');
  await chrome.notifications.clear(NOTIF_ID);
}
async function snooze() {
  const s = await getSettings();
  await chrome.alarms.clear('nag');
  await chrome.notifications.clear(NOTIF_ID);
  chrome.alarms.create('snooze', { delayInMinutes: Math.max(1, Number(s.snoozeMin) || 15) });
}
async function catchUp() {
  // Chrome baru dibuka (misalnya oleh Task Scheduler) setelah jam pengingat lewat.
  const s = await getSettings();
  const t = new Date();
  t.setHours(s.hour, s.minute, 0, 0);
  if (new Date() >= t) await startNagging('catchup');
}

chrome.alarms.onAlarm.addListener(async (a) => {
  if (a.name === 'badge') { await updateBadge(); return; }
  await log('Alarm bunyi: ' + a.name);
  if (a.name === 'daily' || a.name === 'snooze') {
    await startNagging(a.name);
  } else if (a.name === 'nag') {
    if (await isDoneToday() || !(await isWorkdayToday())) { await log('Pengingat berhenti: sudah terkirim / libur'); await stopNagging(); return; }
    await openMagangHub({ ping: true, splash: true, reason: 'nag' });
    await notify(false);
  }
});
chrome.runtime.onStartup.addListener(() => { scheduleDaily(); catchUp(); });
chrome.runtime.onInstalled.addListener(async (details) => {
  const { installedAt, onboarded } = await chrome.storage.local.get(['installedAt', 'onboarded']);
  if (!installedAt) await chrome.storage.local.set({ installedAt: todayKey() });
  if (details.reason === 'install' || !onboarded) {
    await chrome.tabs.create({ url: chrome.runtime.getURL('onboarding/onboarding.html') });
    if (details.reason === 'install') report('install', '');
  }
  scheduleDaily(); catchUp();
});

chrome.notifications.onButtonClicked.addListener(async (id, idx) => {
  if (id !== NOTIF_ID) return;
  if (idx === 0) { await chrome.notifications.clear(NOTIF_ID); await openMagangHub({ ping: true }); }
  else await snooze();
});
chrome.notifications.onClicked.addListener(async (id) => {
  if (id !== NOTIF_ID) return;
  await chrome.notifications.clear(NOTIF_ID);
  await openMagangHub({ ping: true });
});

// ---------- OpenAI ----------
function buildPrompt(s, tpl, brief, recent) {
  const sys = [
    'Kamu asisten yang membantu peserta magang menulis laporan harian di MagangHub (Kemnaker).',
    'Peserta hanya memberi cerita singkat. Kembangkan menjadi laporan yang natural, jujur, dan profesional dalam Bahasa Indonesia yang baku tapi tidak kaku. Tulis dari sudut pandang orang pertama ("saya").',
    'Jangan mengarang detail yang bertentangan dengan cerita. Boleh memperluas dengan hal yang wajar dan umum untuk jenis pekerjaan tersebut.',
    'Hindari kalimat klise yang berulang antar hari. Jangan menyebut nama orang.',
    'Gaya laporan: ' + tpl.nama + '. ' + tpl.instruksi,
    'Kembalikan HANYA JSON dengan kunci persis: "aktivitas", "pembelajaran", "kendala".',
    'Setiap nilai adalah satu paragraf 160 sampai 320 karakter, tidak boleh kurang dari 130 karakter, tanpa bullet dan tanpa judul.',
    'aktivitas: apa yang dikerjakan hari ini, urut dan konkret.',
    'pembelajaran: hal yang dipelajari atau disadari dari kegiatan itu.',
    'kendala: hambatan yang dialami beserta cara mengatasinya. Jika cerita tidak menyebut kendala, tulis kendala ringan yang realistis untuk pekerjaan tersebut. Jangan menulis "tidak ada kendala".'
  ].join('\n');
  const parts = ['Tanggal: ' + U.formatLong(new Date())];
  if (s.nickname) parts.push('Nama panggilan peserta: ' + s.nickname);
  if (recent.length) {
    parts.push('Laporan beberapa hari sebelumnya (jangan ulangi kalimatnya, boleh menyambung konteksnya):');
    recent.forEach(r => parts.push('- ' + r.date + ': ' + (r.fields.aktivitas || '').slice(0, 220)));
  }
  parts.push('Cerita singkat hari ini: ' + brief.trim());
  return { system: sys, user: parts.join('\n') };
}

async function callOpenAI(key, model, messages) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({ model, temperature: 0.85, response_format: { type: 'json_object' }, messages })
  });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json()).error?.message || ''; } catch (e) { /* abaikan */ }
    if (res.status === 401) throw new Error('API key ditolak OpenAI. Cek lagi di pengaturan.');
    if (res.status === 429) throw new Error('Kuota atau rate limit OpenAI habis. ' + detail);
    if (res.status === 404) throw new Error('Model "' + model + '" tidak ditemukan. Ganti di pengaturan. ' + detail);
    throw new Error('OpenAI error ' + res.status + '. ' + detail);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(text);
}

function normalizeFields(obj) {
  const clean = v => String(v || '').replace(/\s+/g, ' ').trim();
  return { aktivitas: clean(obj.aktivitas), pembelajaran: clean(obj.pembelajaran), kendala: clean(obj.kendala) };
}

// ---------- mode lisensi: proxy ke server Magang Diary ----------
async function getLicense() {
  const { licenseKey, licenseInfo, deviceId } = await chrome.storage.local.get(['licenseKey', 'licenseInfo', 'deviceId']);
  return { key: licenseKey || '', info: licenseInfo || null, deviceId: deviceId || '' };
}
async function ensureDeviceId() {
  const { deviceId } = await chrome.storage.local.get('deviceId');
  if (deviceId) return deviceId;
  const id = 'dev-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  await chrome.storage.local.set({ deviceId: id });
  return id;
}
function apiUrl(s, p) { return String(s.apiBase || 'http://localhost:3000').replace(/\/+$/, '') + p; }
const VERSION = chrome.runtime.getManifest().version;

// Laporan error anonim ke server (bisa dimatikan di pengaturan > Lanjutan). Tidak pernah berisi isi laporan.
async function report(event, detail) {
  try {
    const s = await getSettings();
    if (s.telemetry === false || s.mode === 'key') return;
    const { key } = await getLicense();
    await fetch(apiUrl(s, '/api/telemetry'), {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: 'Bearer ' + key } : {}) },
      body: JSON.stringify({ event, detail: String(detail || '').slice(0, 300), version: VERSION })
    });
  } catch (e) { /* diam */ }
}

async function activateLicense(key) {
  const s = await getSettings();
  const deviceId = await ensureDeviceId();
  const k = String(key || '').trim().toUpperCase();
  if (!k) throw new Error('Kode lisensi kosong.');
  let res;
  try {
    res = await fetch(apiUrl(s, '/api/license/activate'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: k, deviceId, deviceName: navigator.userAgent.includes('Windows') ? 'Windows · Chrome' : 'Chrome', version: VERSION })
    });
  } catch (e) { throw new Error('Server tidak bisa dihubungi (' + apiUrl(s, '') + '). Cek alamat server di pengaturan.'); }
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || ('Aktivasi gagal (' + res.status + ')'));
  const info = { ...j, checkedAt: Date.now() };
  await chrome.storage.local.set({ licenseKey: k, licenseInfo: info });
  await log('Lisensi aktif: ' + (j.keyMasked || k) + ' paket ' + j.plan);
  return info;
}

async function generateViaServer({ brief, tpl, recent, s }) {
  const { key } = await getLicense();
  if (!key) throw new Error('NO_LICENSE');
  let res;
  try {
    res = await fetch(apiUrl(s, '/api/generate'), {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key, 'X-Extension-Version': VERSION },
      body: JSON.stringify({ brief, templateId: tpl.id, gaya: { nama: tpl.nama, instruksi: tpl.instruksi }, nickname: s.nickname, date: U.formatLong(new Date()), recent: recent.map(r => ({ date: r.date, aktivitas: r.fields.aktivitas })) })
    });
  } catch (e) { throw new Error('Server tidak bisa dihubungi. Cek koneksi atau alamat server di pengaturan.'); }
  const j = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) await chrome.storage.local.remove('licenseInfo');
    if (res.status === 426) { const info = (await getLicense()).info || {}; await chrome.storage.local.set({ licenseInfo: { ...info, updateRequired: true } }); }
    const err = new Error(j.error || ('Server menjawab ' + res.status));
    err.code = j.code;
    if (res.status >= 500) report('generate-error', 'HTTP ' + res.status + ' ' + (j.error || '').slice(0, 80));
    throw err;
  }
  const info = (await getLicense()).info || {};
  await chrome.storage.local.set({ licenseInfo: { ...info, remaining: j.remaining, usedToday: Math.max(0, (info.dailyQuota || 0) - j.remaining), announcement: j.announcement || '' } });
  return { fields: normalizeFields(j.fields), offline: !!j.offline, remaining: j.remaining };
}

async function generate({ brief, templateId }) {
  if (!brief || brief.trim().length < 5) throw new Error('Ceritanya terlalu pendek. Minimal sebut satu kegiatan.');
  const s = await getSettings();
  const tpl = U.allTemplates(s).find(t => t.id === (templateId || s.templateId)) || globalThis.SAWIT_TEMPLATES[0];
  const h = await getHistory();
  const recent = Object.keys(h).filter(k => h[k].fields && h[k].fields.aktivitas && k !== todayKey())
    .sort().slice(-3).map(k => ({ date: k, fields: h[k].fields }));

  if (s.mode !== 'key') {
    const r = await generateViaServer({ brief: brief.trim(), tpl, recent, s });
    await setStatus(todayKey(), (h[todayKey()] && h[todayKey()].status) || 'pending', { draft: r.fields, brief: brief.trim(), templateId: tpl.id });
    return r.fields;
  }

  const key = await getKey();
  if (!key) throw new Error('NO_KEY');
  const { system, user } = buildPrompt(s, tpl, brief, recent);
  const messages = [{ role: 'system', content: system }, { role: 'user', content: user }];
  let fields = normalizeFields(await callOpenAI(key, s.model, messages));
  const short = Object.entries(fields).filter(([, v]) => v.length < 110).map(([k]) => k);
  if (short.length) {
    messages.push({ role: 'assistant', content: JSON.stringify(fields) });
    messages.push({ role: 'user', content: 'Bagian ' + short.join(', ') + ' masih terlalu pendek. Tulis ulang seluruh JSON, setiap bagian minimal 150 karakter.' });
    fields = normalizeFields(await callOpenAI(key, s.model, messages));
  }
  await setStatus(todayKey(), (h[todayKey()] && h[todayKey()].status) || 'pending', { draft: fields, brief: brief.trim(), templateId: tpl.id });
  return fields;
}

// ---------- tebakan dari riwayat Chrome (diproses lokal) ----------
const HISTORY_RULES = [
  [/github\.com|gitlab\.com|bitbucket\.org/, 'ngurus repo di GitHub'],
  [/^(localhost|127\.0\.0\.1)/, 'develop dan tes aplikasi di lokal'],
  [/docs\.google\.com\/spreadsheets/, 'ngerjain spreadsheet di Google Sheets'],
  [/docs\.google\.com\/document/, 'nulis dokumen di Google Docs'],
  [/docs\.google\.com\/presentation/, 'bikin slide presentasi'],
  [/docs\.google\.com\/forms/, 'ngurus Google Form'],
  [/drive\.google\.com/, 'ngatur file di Google Drive'],
  [/canva\.com/, 'desain di Canva'],
  [/figma\.com/, 'desain di Figma'],
  [/notion\.so/, 'nyatet di Notion'],
  [/chatgpt\.com|chat\.openai\.com|claude\.ai|gemini\.google\.com/, 'riset dan diskusi dengan AI'],
  [/stackoverflow\.com|developer\.mozilla\.org|w3schools\.com|laravel\.com|react\.dev|docs\./, 'cari referensi teknis'],
  [/youtube\.com/, 'nonton tutorial'],
  [/meet\.google\.com|zoom\.us|teams\.microsoft\.com/, 'meeting online'],
  [/mail\.google\.com|outlook\./, 'balas email'],
  [/trello\.com|asana\.com|atlassian\.net|clickup\.com/, 'update task board'],
  [/vercel\.com|netlify\.com|console\.cloud\.google|aws\.amazon|portal\.azure|hostinger|cpanel|supabase\.com|firebase\.google|cloudflare\.com/, 'ngurus server dan hosting'],
  [/web\.whatsapp\.com|web\.telegram\.org/, 'koordinasi via chat'],
  [/excel|office\.com|sharepoint/, 'ngerjain file Office'],
  [/linkedin\.com/, 'buka LinkedIn'],
  [/kemnaker\.go\.id|bps\.go\.id|kemenkeu|kominfo/, 'cari data di situs pemerintah']
];
const HISTORY_SKIP = /google\.[a-z.]+\/(search|url)|^www\.google\.|^accounts\.google|^chrome|^newtab|^extensions|maganghub\.kemnaker|^chrome-extension/;

async function historySummary() {
  const has = await chrome.permissions.contains({ permissions: ['history'] });
  if (!has) throw new Error('NO_HISTORY');
  const start = new Date(); start.setHours(6, 0, 0, 0);
  const items = await chrome.history.search({ text: '', startTime: start.getTime(), maxResults: 3000 });
  const acts = new Map();
  const hosts = new Map();
  for (const it of items) {
    let u; try { u = new URL(it.url); } catch (e) { continue; }
    if (!/^https?:$/.test(u.protocol)) continue;
    const key = u.hostname.replace(/^www\./, '') + u.pathname;
    if (HISTORY_SKIP.test(u.hostname + u.pathname) || HISTORY_SKIP.test(u.hostname)) continue;
    const rule = HISTORY_RULES.find(([re]) => re.test(key));
    if (rule) acts.set(rule[1], (acts.get(rule[1]) || 0) + (it.visitCount || 1));
    else {
      const h = u.hostname.replace(/^www\./, '');
      const cur = hosts.get(h) || { n: 0, title: '' };
      cur.n += it.visitCount || 1;
      if (!cur.title && it.title) cur.title = it.title.slice(0, 60);
      hosts.set(h, cur);
    }
  }
  const topActs = [...acts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);
  const topHosts = [...hosts.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 3).map(([h]) => h);
  let brief = '';
  if (topActs.length) brief += 'Tadi seharian: ' + topActs.join(', ') + '.';
  if (topHosts.length) brief += (brief ? ' ' : '') + 'Juga buka ' + topHosts.join(', ') + '.';
  return { brief, activities: topActs, hosts: topHosts, total: items.length };
}

async function testKey(key) {
  const res = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: 'Bearer ' + key } });
  if (res.status === 401) throw new Error('Key ditolak (401).');
  if (!res.ok) throw new Error('OpenAI menjawab ' + res.status);
  return true;
}

// ---------- state untuk UI ----------
async function getState() {
  const settings = await getSettings();
  const history = await getHistory();
  const key = await getKey();
  const tk = todayKey();
  const { eventLog, installedAt } = await chrome.storage.local.get(['eventLog', 'installedAt']);
  const daily = await chrome.alarms.get('daily');
  return {
    eventLog: eventLog || [],
    installedAt: installedAt || tk,
    nextDaily: daily ? daily.scheduledTime : null,
    notifPermission: await chrome.notifications.getPermissionLevel().catch(() => 'unknown'),
    hasHistory: await chrome.permissions.contains({ permissions: ['history'] }).catch(() => false),
    settings,
    history,
    today: tk,
    doneToday: U.isDone(history[tk]),
    todayStatus: (history[tk] && history[tk].status) || 'pending',
    workday: U.isWorkday(tk, settings, history),
    nagging: await isNagging(),
    snoozed: !!(await chrome.alarms.get('snooze')),
    streak: U.computeStreak(history, settings),
    hasKey: !!key,
    keyHint: key ? '••••' + key.slice(-4) : '',
    license: await getLicense().then(l => ({ hasKey: !!l.key, keyMasked: l.key ? l.key.replace(/^(MD-[A-Z0-9]{4})-[A-Z0-9]{4}-([A-Z0-9]{4})$/, '$1-••••-$2') : '', info: l.info })),
    version: VERSION,
    updateRequired: !!(((await getLicense()).info) || {}).updateRequired,
    templates: U.allTemplates(settings)
  };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      switch (msg.type) {
        case 'getState': return sendResponse({ ok: true, state: await getState() });
        case 'saveSettings': {
          await saveSettings(msg.settings || {});
          await scheduleDaily();
          return sendResponse({ ok: true, state: await getState() });
        }
        case 'saveKey': {
          const k = String(msg.key || '').trim();
          if (k) await chrome.storage.local.set({ openaiKey: k });
          else await chrome.storage.local.remove('openaiKey');
          return sendResponse({ ok: true, hasKey: !!k });
        }
        case 'testKey': {
          const k = String(msg.key || '').trim() || await getKey();
          if (!k) throw new Error('Belum ada key.');
          await testKey(k);
          return sendResponse({ ok: true });
        }
        case 'markStatus': {
          const date = msg.date || todayKey();
          const extra = msg.fields ? { fields: msg.fields } : {};
          if (msg.manual) extra.manual = true;
          await setStatus(date, msg.status, extra);
          if (date === todayKey() && (U.DONE.includes(msg.status) || msg.status === 'libur')) await stopNagging();
          return sendResponse({ ok: true, state: await getState() });
        }
        case 'pageStatus': {
          // Laporan dari content script hasil membaca kalender.
          const h = await getHistory();
          const cur = h[msg.date];
          const manualDone = cur && U.isDone(cur) && cur.manual;
          const submittedRecently = cur && cur.status === 'submitted';
          if (msg.status === 'pending' && (manualDone || submittedRecently)) return sendResponse({ ok: true, kept: true });
          if (!cur || cur.status !== msg.status) await setStatus(msg.date, msg.status, { source: 'page' });
          if (msg.date === todayKey() && (U.DONE.includes(msg.status) || msg.status === 'libur')) await stopNagging();
          return sendResponse({ ok: true });
        }
        case 'generate': {
          try {
            const fields = await generate(msg);
            return sendResponse({ ok: true, fields });
          } catch (e) {
            if (e.message === 'NO_KEY') return sendResponse({ ok: false, error: 'NO_KEY' });
            if (e.message === 'NO_LICENSE') return sendResponse({ ok: false, error: 'NO_LICENSE' });
            await log('Generate gagal: ' + e.message);
            return sendResponse({ ok: false, error: e.message, code: e.code });
          }
        }
        case 'activateLicense': {
          try { return sendResponse({ ok: true, info: await activateLicense(msg.key) }); }
          catch (e) { return sendResponse({ ok: false, error: e.message }); }
        }
        case 'telemetry': { report(msg.event, msg.detail); return sendResponse({ ok: true }); }
        case 'openOnboarding': { await chrome.tabs.create({ url: chrome.runtime.getURL('onboarding/onboarding.html') }); return sendResponse({ ok: true }); }
        case 'setOnboarded': { await chrome.storage.local.set({ onboarded: true }); return sendResponse({ ok: true }); }
        case 'clearLicense': {
          await chrome.storage.local.remove(['licenseKey', 'licenseInfo']);
          return sendResponse({ ok: true, state: await getState() });
        }
        case 'openPage': await openMagangHub({ fullscreen: !!msg.fullscreen, ping: true }); return sendResponse({ ok: true });
        case 'snooze': await snooze(); return sendResponse({ ok: true, state: await getState() });
        case 'stopNag': await stopNagging(); return sendResponse({ ok: true, state: await getState() });
        case 'testNag': {
          // Tes selalu dipaksa jalan, apa pun status hari ini.
          const skipReason = !(await isWorkdayToday()) ? 'hari ini libur' : (await isDoneToday()) ? 'laporan hari ini sudah terkirim' : '';
          await startNagging('tes', true);
          if (skipReason) await log('Catatan: pengingat terjadwal hari ini akan diam karena ' + skipReason);
          return sendResponse({ ok: true, started: true, skipReason, state: await getState() });
        }
        case 'historySummary': {
          try { return sendResponse({ ok: true, ...(await historySummary()) }); }
          catch (e) { return sendResponse({ ok: false, error: e.message === 'NO_HISTORY' ? 'NO_HISTORY' : e.message }); }
        }
        case 'unfullscreen': {
          if (sender.tab) await chrome.windows.update(sender.tab.windowId, { state: 'normal' }).catch(() => {});
          return sendResponse({ ok: true });
        }
        case 'clearLog': await chrome.storage.local.remove('eventLog'); return sendResponse({ ok: true, state: await getState() });
        case 'reschedule': await scheduleDaily(); return sendResponse({ ok: true, state: await getState() });
        case 'resetToday': {
          const h = await getHistory();
          delete h[todayKey()];
          await chrome.storage.local.set({ history: h });
          return sendResponse({ ok: true, state: await getState() });
        }
        default: return sendResponse({ ok: false, error: 'Pesan tidak dikenal: ' + msg.type });
      }
    } catch (e) {
      await log('Error pesan ' + msg.type + ': ' + (e.message || e));
      sendResponse({ ok: false, error: e.message || String(e) });
    }
  })();
  return true;
});

// ---------- badge streak di ikon toolbar ----------
async function updateBadge() {
  try {
    const s = await getSettings();
    const h = await getHistory();
    const tk = todayKey();
    if (s.badge === false) { await chrome.action.setBadgeText({ text: '' }); return; }
    const streak = U.computeStreak(h, s);
    const workday = U.isWorkday(tk, s, h);
    const done = U.isDone(h[tk]);
    let color = '#8C879A';
    let text = streak ? String(streak) : '';
    if (workday && done) color = '#3DAA6D';
    else if (workday) { color = '#F2A07B'; if (!text) text = '!'; }
    await chrome.action.setBadgeBackgroundColor({ color });
    if (chrome.action.setBadgeTextColor) await chrome.action.setBadgeTextColor({ color: '#FFFFFF' }).catch(() => {});
    await chrome.action.setBadgeText({ text });
  } catch (e) { /* abaikan */ }
}
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.history || changes.settings)) updateBadge();
});

// ---------- shortcut keyboard (Alt+M bawaan, ubah di chrome://extensions/shortcuts) ----------
chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== 'open-maganghub') return;
  const tab = await openMagangHub({ fullscreen: false, splash: false, reason: 'shortcut' });
  if (tab) setTimeout(() => chrome.tabs.sendMessage(tab.id, { type: 'sawitOpenPanel' }).catch(() => {}), 900);
});

// Service worker sering bangun-tidur; jadwalkan hanya kalau alarmnya belum ada.
chrome.alarms.get('daily').then(a => { if (!a) scheduleDaily(); });
chrome.alarms.get('badge').then(a => { if (!a) chrome.alarms.create('badge', { periodInMinutes: 30 }); });
updateBadge();
