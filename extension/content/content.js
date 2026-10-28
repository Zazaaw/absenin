// Content script di monev.maganghub.kemnaker.go.id
// 1) Baca status hari ini dari kalender dan lapor ke background.
// 2) Panel "Sawit" mengambang: ceritain dikit -> generate -> isi ke form.
// 3) Deteksi klik "Simpan dan Kirim" untuk menandai hari ini terkirim.
(() => {
  if (window.top !== window) return;
  if (document.getElementById('sawit-diary-root')) return;

  const U = globalThis.SawitUtil;
  const TODAY = new Date();
  const TODAY_KEY = U.dateKey(TODAY);
  const DAY = String(TODAY.getDate());
  const MONTH_ABBR = { jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5, jul: 6, agu: 7, agt: 7, sep: 8, okt: 9, nov: 10, des: 11 };

  let state = null;
  const TH = globalThis.SawitThemes;
  let THEME = TH.THEMES[0];
  const tt = (s) => TH.tt(THEME, s);
  const simpel = () => THEME.id === 'simpel';
  let lastReported = null;
  let lastFilled = null;
  let draft = null;

  function send(msg) {
    return new Promise(resolve => {
      try { chrome.runtime.sendMessage(msg, r => resolve(r || { ok: false, error: chrome.runtime.lastError?.message })); }
      catch (e) { resolve({ ok: false, error: e.message }); }
    });
  }

  // ---------- warna ----------
  function parseRgb(str) {
    const m = str && str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(s => parseFloat(s));
    if (p.length > 3 && p[3] === 0) return null;
    return { r: p[0], g: p[1], b: p[2] };
  }
  function toHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h, s, l };
  }
  function classifyHue(h) {
    if (h >= 70 && h <= 175) return 'done';      // hijau: hadir / izin disetujui
    if (h > 175 && h <= 265) return 'waiting';   // biru: menunggu mentor
    return 'action';                             // merah / oranye: ditolak, perlu tindakan, tidak hadir
  }

  // ---------- cari sel tanggal hari ini ----------
  function periodStartMonth() {
    const re = /(\d{1,2})\s+([A-Za-z]{3})\w*\s+(\d{4})\s*[-–]\s*(\d{1,2})\s+([A-Za-z]{3})/;
    const els = [...document.querySelectorAll('div,span,p,h1,h2,h3,h4,h5,h6')].filter(e => e.children.length === 0);
    for (const e of els) {
      const m = e.textContent.match(re);
      if (m) { const mo = MONTH_ABBR[m[2].toLowerCase()]; if (mo !== undefined) return mo; }
    }
    return null;
  }
  function findTodayCells() {
    const leaves = [...document.querySelectorAll('body *')].filter(el =>
      el.children.length === 0 && el.textContent.trim() === DAY && el.offsetParent !== null && !el.closest('#sawit-diary-root'));
    const cells = [];
    for (const el of leaves) {
      let c = el.parentElement;
      for (let i = 0; i < 4 && c; i++) {
        if (c.querySelector('svg, [class*="icon" i]')) break;
        c = c.parentElement;
      }
      if (!c || !c.querySelector('svg, [class*="icon" i]')) continue;
      const r = c.getBoundingClientRect();
      if (r.width > 220 || r.height > 220) continue;
      if (!cells.some(x => x.cell === c)) cells.push({ cell: c, num: el });
    }
    return cells;
  }
  function isHighlighted(numEl) {
    let e = numEl;
    for (let i = 0; i < 3 && e; i++) {
      const cs = getComputedStyle(e);
      if ((parseFloat(cs.borderWidth) > 0 && parseRgb(cs.borderColor)) || cs.boxShadow !== 'none' || parseFloat(cs.outlineWidth) > 0) return true;
      if (/today|selected|active/i.test(e.className || '')) return true;
      e = e.parentElement;
    }
    return false;
  }
  function pickTodayCell() {
    const cells = findTodayCells();
    if (!cells.length) return null;
    if (cells.length === 1) return cells[0];
    const hl = cells.find(c => isHighlighted(c.num));
    if (hl) return hl;
    const startMo = periodStartMonth();
    if (startMo !== null) return TODAY.getMonth() === startMo ? cells[0] : cells[cells.length - 1];
    return cells[0];
  }
  function collectColors(cell, numEl) {
    const out = [];
    const push = v => { const rgb = parseRgb(v); if (rgb) out.push(rgb); };
    // Hanya elemen gambar di dalam svg (path, circle, rect, ...). Root svg punya fill hitam bawaan yang menyesatkan.
    cell.querySelectorAll('svg path, svg circle, svg rect, svg ellipse, svg polygon, svg line, svg polyline, svg use').forEach(el => {
      const cs = getComputedStyle(el);
      ['fill', 'stroke'].forEach(p => { const v = cs[p]; if (v && v !== 'none') push(v); });
    });
    cell.querySelectorAll('[class*="icon" i]:not(svg)').forEach(el => {
      const cs = getComputedStyle(el);
      push(cs.color); push(cs.backgroundColor);
    });
    cell.querySelectorAll('*').forEach(el => {
      if (el === numEl || el.contains(numEl) || el.tagName === 'svg' || el.closest('svg')) return;
      const r = el.getBoundingClientRect();
      if (r.width > 26 || r.height > 26 || r.width === 0) return;
      const cs = getComputedStyle(el);
      push(cs.backgroundColor);
      if (parseFloat(cs.borderWidth) > 0) push(cs.borderColor);
    });
    return out;
  }
  function detectStatus() {
    const found = pickTodayCell();
    if (!found) return null;
    const colors = collectColors(found.cell, found.num).map(toHsl);
    if (!colors.length) return null;
    const sat = colors.find(c => c.s > 0.28 && c.l > 0.12 && c.l < 0.9);
    if (sat) return classifyHue(sat.h);
    if (colors.some(c => c.l < 0.32)) return 'libur';
    return 'pending';
  }
  let detectFails = 0;
  async function reportStatus() {
    const st = detectStatus();
    if (!st && location.pathname.includes('/dashboard/riwayat')) { detectFails++; if (detectFails === 3) send({ type: 'telemetry', event: 'detect-failed', detail: 'kalender hari ini tidak terbaca di ' + location.pathname }); }
    if (!st || st === lastReported) return st;
    lastReported = st;
    await send({ type: 'pageStatus', date: TODAY_KEY, status: st });
    await refreshState();
    return st;
  }

  // ---------- dialog form ----------
  function findDialog() {
    const heads = [...document.querySelectorAll('body *')]
      .filter(e => e.children.length === 0 && /(tambah|edit|ubah|lihat) laporan/i.test(e.textContent) && !e.closest('#sawit-diary-root') && e.offsetParent !== null);
    for (const h of heads) {
      let c = h;
      for (let i = 0; i < 10 && c; i++) {
        if (c.querySelectorAll('textarea').length >= 1) return c;
        c = c.parentElement;
      }
    }
    return null;
  }
  function labelOf(ta) {
    const direct = ta.getAttribute('aria-label') || ta.placeholder || '';
    if (direct) return direct;
    if (ta.id) { const l = document.querySelector('label[for="' + CSS.escape(ta.id) + '"]'); if (l) return l.textContent; }
    const lb = ta.getAttribute('aria-labelledby');
    if (lb) { const l = document.getElementById(lb); if (l) return l.textContent; }
    const wrap = ta.closest('.MuiFormControl-root, .MuiTextField-root, [class*="FormControl"], [class*="TextField"]') || ta.parentElement?.parentElement;
    const l = wrap && wrap.querySelector('label, legend');
    return l ? l.textContent : '';
  }
  function setNative(el, value) {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function fillForm(fields) {
    const dlg = findDialog();
    if (!dlg) return { ok: false, error: 'Form "Tambah laporan" belum kebuka. Klik tanggal ' + DAY + ' di kalender dulu, ya.' };
    const tas = [...dlg.querySelectorAll('textarea')].filter(t => !t.readOnly && t.getAttribute('aria-hidden') !== 'true' && t.offsetParent !== null);
    if (tas.length < 3) return { ok: false, error: 'Kolom isian belum ketemu (' + tas.length + ' textarea). Coba tutup dan buka lagi formnya.' };
    const map = { aktivitas: null, pembelajaran: null, kendala: null };
    const rest = [];
    for (const ta of tas) {
      const l = labelOf(ta).toLowerCase();
      if (/uraian|aktivitas|aktifitas/.test(l) && !map.aktivitas) map.aktivitas = ta;
      else if (/pembelajaran|belajar|diperoleh/.test(l) && !map.pembelajaran) map.pembelajaran = ta;
      else if (/kendala|hambatan/.test(l) && !map.kendala) map.kendala = ta;
      else rest.push(ta);
    }
    for (const k of ['aktivitas', 'pembelajaran', 'kendala']) if (!map[k]) map[k] = rest.shift() || null;
    let n = 0;
    for (const k of Object.keys(map)) {
      if (map[k] && fields[k]) { setNative(map[k], fields[k]); n++; }
    }
    if (map.aktivitas) map.aktivitas.focus();
    lastFilled = fields;
    return { ok: true, filled: n };
  }

  // Deteksi klik "Simpan dan Kirim"
  document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest && e.target.closest('button');
    if (!btn || btn.closest('#sawit-diary-root')) return;
    if (!/simpan\s*(dan|&)\s*kirim/i.test(btn.textContent || '')) return;
    const snapshot = currentFormValues();
    setTimeout(async () => {
      if (findDialog()) return; // dialog masih ada, mungkin ada error validasi
      await send({ type: 'markStatus', date: TODAY_KEY, status: 'submitted', fields: snapshot || lastFilled || undefined });
      lastReported = 'submitted';
      await refreshState();
      toast(simpel() ? 'Laporan terkirim.' : tt('Laporan terkirim. {N} senyum lebar hari ini.'));
      setTimeout(() => { lastReported = null; reportStatus(); }, 4000);
    }, 2500);
  }, true);
  function currentFormValues() {
    const dlg = findDialog();
    if (!dlg) return null;
    const tas = [...dlg.querySelectorAll('textarea')].filter(t => !t.readOnly && t.getAttribute('aria-hidden') !== 'true');
    if (tas.length < 3) return null;
    return { aktivitas: tas[0].value, pembelajaran: tas[1].value, kendala: tas[2].value };
  }

  // ---------- UI (shadow DOM) ----------
  const PANEL_CSS = String.raw`
    :host { all: initial; }
    * { box-sizing: border-box; font-family: "Nunito", "Quicksand", "Segoe UI", system-ui, sans-serif; }
    .fab { position: fixed; right: 18px; bottom: 96px; width: 64px; height: 64px; border-radius: 50%; background: var(--bg);
      border: 2px solid var(--line); box-shadow: 0 8px 24px var(--shadow); cursor: pointer; display: grid; place-items: center;
      z-index: 2147483000; transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s, background .3s; }
    .fab:hover { transform: translateY(-3px) scale(1.06); box-shadow: 0 12px 30px var(--shadow); }
    .fab .av { display: grid; place-items: center; }
    .fab svg { width: 50px; height: 50px; transform-origin: 50% 90%; }
    :host(.sway) .fab svg { animation: sway 4s ease-in-out infinite; }
    .fab.alert svg { animation: wiggle 1.6s ease-in-out infinite; }
    .fab.thinking svg { animation: bounce .9s ease-in-out infinite; }
    .fab .badge { position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; border-radius: 50%; background: var(--pending-ink); border: 2px solid var(--bg); display: none; }
    .fab.alert .badge { display: block; animation: pulse 1.4s infinite; }
    @keyframes pulse { 0%,100% { transform: scale(1);} 50% { transform: scale(1.3);} }
    @keyframes sway { 0%,100% { transform: rotate(-2deg);} 50% { transform: rotate(2deg);} }
    @keyframes wiggle { 0%,100% { transform: rotate(0);} 20% { transform: rotate(-7deg);} 40% { transform: rotate(6deg);} 60% { transform: rotate(-4deg);} 80% { transform: rotate(3deg);} }
    @keyframes bounce { 0%,100% { transform: translateY(0) scale(1,1);} 50% { transform: translateY(-6px) scale(.96,1.05);} }
    .bubble { position: fixed; right: 92px; bottom: 112px; max-width: 260px; background: var(--bg); color: var(--ink); border-radius: 16px 16px 4px 16px;
      padding: 10px 14px; font-size: 13px; line-height: 1.4; box-shadow: 0 8px 24px var(--shadow); border: 1px solid var(--line); z-index: 2147483000; display: none; }
    .bubble.show { display: block; animation: pop .3s cubic-bezier(.34,1.56,.64,1); }
    @keyframes pop { from { opacity: 0; transform: translateY(10px) scale(.96);} to { opacity: 1; transform: none;} }
    .panel { position: fixed; right: 18px; bottom: 170px; width: 460px; max-height: calc(100vh - 190px); overflow-y: auto; scrollbar-width: none;
      background: var(--paper); color: var(--ink); border-radius: 22px; box-shadow: 0 20px 56px var(--shadow); border: 1px solid var(--line); z-index: 2147483001;
      display: none; transform-origin: 100% 100%; transition: background .3s, color .3s; }
    .panel::-webkit-scrollbar { display: none; }
    .panel.open { display: block; animation: spring .4s cubic-bezier(.34,1.56,.64,1); }
    .panel.closing { animation: shrink .2s ease-in forwards; }
    @keyframes spring { from { opacity: 0; transform: translateY(16px) scale(.9);} to { opacity: 1; transform: none;} }
    @keyframes shrink { to { opacity: 0; transform: translateY(12px) scale(.94);} }
    .head { display: flex; align-items: center; gap: 12px; padding: 14px 18px 12px; background: linear-gradient(135deg, var(--hero1), var(--hero2)); border-radius: 22px 22px 0 0; position: sticky; top: 0; z-index: 2; }
    .head .avatar svg { width: 46px; height: 46px; transform-origin: 50% 90%; }
    :host(.sway) .head .avatar svg { animation: sway 4s ease-in-out infinite; }
    .head.thinking .avatar svg { animation: bounce .9s ease-in-out infinite; }
    .head .t { font-weight: 800; font-size: 15px; }
    .head .s { font-size: 12px; color: var(--muted); min-height: 15px; }
    .head .x { margin-left: auto; background: var(--paper); border: 1px solid var(--line); width: 28px; height: 28px; border-radius: 50%; font-size: 16px; cursor: pointer; color: var(--muted); display: grid; place-items: center; transition: transform .2s; }
    .head .x:hover { transform: rotate(90deg); }
    .body { padding: 14px 18px 18px; }
    .step { display: none; }
    .step.on { display: grid; gap: 10px; animation: fadeUp .3s ease-out; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: none;} }
    label.lbl { font-size: 12px; font-weight: 800; color: var(--tertiary-ink); display: flex; align-items: center; gap: 8px; }
    label.lbl .cnt { margin-left: auto; font-weight: 600; font-size: 11px; color: var(--muted); }
    label.lbl .cnt.ok { color: var(--ok); }
    label.lbl .cnt.bad { color: var(--warn); }
    textarea, select { width: 100%; border: 1.5px solid var(--line); border-radius: 14px; padding: 10px 12px; font-size: 13px; line-height: 1.5; background: var(--paper); color: var(--ink); resize: none; transition: border-color .2s, box-shadow .2s; }
    :host([data-dark="1"]) textarea, :host([data-dark="1"]) select { background: var(--soft); }
    textarea:focus, select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--secondary); }
    textarea.brief { min-height: 84px; }
    textarea.out { overflow: hidden; }
    .row { display: flex; gap: 8px; align-items: center; }
    .btn { border: 0; border-radius: 999px; padding: 10px 18px; font-weight: 800; font-size: 13px; cursor: pointer; transition: transform .2s cubic-bezier(.34,1.56,.64,1), filter .15s, background .2s; white-space: nowrap; }
    .btn:hover { filter: brightness(.97); transform: translateY(-1px); }
    .btn:active { transform: scale(.95); }
    .btn:disabled { opacity: .55; cursor: wait; transform: none; }
    .btn.p { background: var(--primary); color: var(--primary-ink); }
    .btn.l { background: var(--secondary); color: var(--secondary-ink); }
    .btn.g { background: var(--tertiary); color: var(--tertiary-ink); }
    .btn.sm { padding: 5px 11px; font-size: 11px; }
    .btn.copied { background: var(--ok); color: #FFF; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip { background: var(--chip); color: var(--chip-ink); border: 1px solid var(--chip-line); border-radius: 999px; padding: 4px 11px; font-size: 12px; cursor: pointer; transition: transform .2s cubic-bezier(.34,1.56,.64,1), filter .15s; animation: fadeUp .3s ease-out both; }
    .chip:hover { filter: brightness(.96); transform: translateY(-1px) scale(1.03); }
    .chip.recent { background: var(--secondary); color: var(--secondary-ink); border-color: var(--secondary); }
    .field { display: grid; gap: 5px; opacity: 0; transform: translateY(10px); }
    .field.in { animation: fadeUp .45s cubic-bezier(.2,.8,.2,1) forwards; }
    .skel { height: 92px; border-radius: 14px; background: linear-gradient(90deg, var(--soft) 25%, var(--paper) 50%, var(--soft) 75%); background-size: 200% 100%; animation: shimmer 1.3s linear infinite; }
    @keyframes shimmer { from { background-position: 200% 0;} to { background-position: -200% 0;} }
    .status { font-size: 12px; color: var(--muted); min-height: 16px; line-height: 1.4; }
    .status.err { color: var(--warn); }
    .status.ok { color: var(--ok); }
    .hintline { font-size: 11px; color: var(--muted); text-align: center; margin-top: 2px; }
    .toast { position: fixed; left: 50%; bottom: 150px; transform: translateX(-50%); background: var(--ink); color: var(--bg); padding: 10px 18px; border-radius: 999px;
      font-size: 13px; z-index: 2147483002; box-shadow: 0 8px 24px rgba(0,0,0,.2); animation: toastIn .35s cubic-bezier(.34,1.56,.64,1); }
    @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 12px) scale(.9);} to { opacity: 1; transform: translate(-50%, 0);} }
    .spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid var(--primary); border-top-color: transparent; border-radius: 50%; animation: spin .8s linear infinite; vertical-align: -2px; margin-right: 6px; }
    @keyframes spin { to { transform: rotate(360deg);} }
    .petal { position: fixed; top: -20px; width: 14px; height: 14px; border-radius: 14px 0 14px 0; z-index: 2147483002; pointer-events: none; animation: fall linear forwards; }
    @keyframes fall { 0% { transform: translateY(0) rotate(0) translateX(0); opacity: 1;} 100% { transform: translateY(100vh) rotate(540deg) translateX(40px); opacity: .2;} }
    kbd { background: var(--tertiary); border-radius: 5px; padding: 1px 5px; font-size: 10px; font-family: inherit; }
  `;

  const root = document.createElement('div');
  root.id = 'sawit-diary-root';
  const shadow = root.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = PANEL_CSS;
  shadow.appendChild(style);

  const fab = document.createElement('button');
  fab.className = 'fab';
  fab.title = 'Absenin';
  fab.innerHTML = '<span class="av"></span><span class="badge"></span>';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `
    <div class="head">
      <div class="avatar"></div>
      <div><div class="t" id="ttl">Ceritain dikit, sisanya otomatis</div><div class="s" id="sub">Hari ini ngapain aja?</div></div>
      <button class="x" title="Tutup">×</button>
    </div>
    <div class="body">
      <div class="step on" id="step1">
        <div class="chips" id="chips"></div>
        <div class="row" id="histRow" style="display:none"><button class="btn g sm" id="hist">✨ Tebak dari riwayat Chrome hari ini</button></div>
        <textarea class="brief" id="brief" placeholder="Contoh: benerin bug login di modul absensi, terus meeting sama mentor bahas deploy ke server staging"></textarea>
        <div class="row">
          <select id="tpl"></select>
          <button class="btn p" id="gen">Generate</button>
        </div>
        <div class="status" id="st"></div>
        <div class="hintline"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> buat generate</div>
      </div>
      <div class="step" id="step2">
        <div id="skel" style="display:grid;gap:10px"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>
        <div id="fields" style="display:none;gap:10px">
          <div class="field"><label class="lbl">Uraian aktivitas <button class="btn g sm copy" data-k="aktivitas">Salin</button><span class="cnt"></span></label><textarea class="out" id="f_aktivitas" rows="3"></textarea></div>
          <div class="field"><label class="lbl">Pembelajaran yang diperoleh <button class="btn g sm copy" data-k="pembelajaran">Salin</button><span class="cnt"></span></label><textarea class="out" id="f_pembelajaran" rows="3"></textarea></div>
          <div class="field"><label class="lbl">Kendala yang dialami <button class="btn g sm copy" data-k="kendala">Salin</button><span class="cnt"></span></label><textarea class="out" id="f_kendala" rows="3"></textarea></div>
          <div class="row" style="margin-top:2px">
            <button class="btn g" id="back">← Ubah cerita</button>
            <button class="btn l" id="copyAll">Salin semua</button>
            <button class="btn p" id="fill" style="margin-left:auto">Isi ke form</button>
          </div>
          <div class="status" id="st2"></div>
          <div class="hintline">Tombol "Simpan dan Kirim" nggak diklik otomatis. Cek dulu, centang pernyataan, lalu kirim sendiri.</div>
        </div>
      </div>
    </div>`;
  shadow.append(fab, bubble, panel);
  document.documentElement.appendChild(root);

  const $ = sel => panel.querySelector(sel);
  const headEl = $('.head');
  const avatarEl = $('.avatar');
  const KEYS = ['aktivitas', 'pembelajaran', 'kendala'];
  const CHIPS = ['coding fitur', 'benerin bug', 'deploy ke server', 'meeting mentor', 'rekap data', 'bikin dokumen', 'belajar sistem', 'testing'];

  function renderChips() {
    const box = $('#chips');
    const recent = [];
    if (state && state.history) {
      Object.keys(state.history).sort().reverse().forEach(k => {
        const b = state.history[k].brief;
        if (b && k !== TODAY_KEY && recent.length < 2 && !recent.includes(b)) recent.push(b);
      });
    }
    const items = [...recent.map(b => ({ t: b, r: true })), ...CHIPS.map(t => ({ t }))];
    box.innerHTML = items.map((c, i) => '<span class="chip' + (c.r ? ' recent' : '') + '" style="animation-delay:' + (i * 35) + 'ms" title="' + (c.r ? 'Cerita hari sebelumnya' : '') + '"></span>').join('');
    [...box.children].forEach((el, i) => { el.textContent = (items[i].r ? '↺ ' : '') + (items[i].t.length > 42 ? items[i].t.slice(0, 40) + '…' : items[i].t); el.dataset.t = items[i].t; });
  }
  $('#chips').addEventListener('click', e => {
    const chip = e.target.closest('.chip'); if (!chip) return;
    const b = $('#brief');
    b.value = (b.value.trim() ? b.value.trim() + ', ' : '') + chip.dataset.t;
    b.focus();
  });

  function showStep(n) {
    $('#step1').classList.toggle('on', n === 1);
    $('#step2').classList.toggle('on', n === 2);
  }
  function setStatusText(t, cls, which) {
    const el = $(which === 2 ? '#st2' : '#st'); el.textContent = t || ''; el.className = 'status ' + (cls || '');
  }
  function autosize(ta) { ta.style.height = 'auto'; ta.style.height = (ta.scrollHeight + 2) + 'px'; }
  function countUp(el, n, cls) {
    const start = performance.now(), dur = 600;
    const tick = (t) => {
      const p = Math.min(1, Math.max(0, (t - start) / dur));
      const v = Math.round(n * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + ' karakter' + (n < 100 ? ' (min 100)' : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    el.className = 'cnt ' + cls;
    requestAnimationFrame(tick);
  }
  function updateCount(k, animate) {
    const ta = $('#f_' + k); const n = ta.value.trim().length;
    const c = ta.parentElement.querySelector('.cnt');
    const cls = n >= 100 ? 'ok' : 'bad';
    if (animate) countUp(c, n, cls);
    else { c.textContent = n + ' karakter' + (n < 100 ? ' (min 100)' : ''); c.className = 'cnt ' + cls; }
  }
  panel.addEventListener('input', e => {
    if (e.target.id && e.target.id.startsWith('f_')) { autosize(e.target); updateCount(e.target.id.slice(2)); }
  });
  function showOutput(fields, animate) {
    draft = fields;
    $('#skel').style.display = 'none';
    $('#fields').style.display = 'grid';
    showStep(2);
    KEYS.forEach((k, i) => {
      const ta = $('#f_' + k);
      ta.value = fields[k] || '';
      const f = ta.closest('.field');
      f.classList.remove('in');
      void f.offsetWidth;
      f.style.animationDelay = animate ? (i * 140) + 'ms' : '0ms';
      f.classList.add('in');
      requestAnimationFrame(() => { autosize(ta); updateCount(k, animate); });
    });
    try { sessionStorage.setItem('sawit-draft', JSON.stringify({ brief: $('#brief').value, fields })); } catch (e) { /* abaikan */ }
  }
  function readOutput() {
    const o = {}; KEYS.forEach(k => { o[k] = $('#f_' + k).value.trim(); }); return o;
  }
  function setThinking(on) {
    headEl.classList.toggle('thinking', on);
    fab.classList.toggle('thinking', on);
  }

  async function doGenerate() {
    const brief = $('#brief').value.trim();
    if (brief.length < 5) { setStatusText('Ceritain dulu minimal satu kegiatan, ya.', 'err'); $('#brief').focus(); return; }
    $('#gen').disabled = true;
    setStatusText('', '');
    $('#skel').style.display = 'grid';
    $('#fields').style.display = 'none';
    showStep(2);
    $('#sub').textContent = simpel() ? 'Lagi merangkai kalimat...' : tt('{N} lagi merangkai kalimat...');
    setThinking(true);
    const r = await send({ type: 'generate', brief, templateId: $('#tpl').value });
    $('#gen').disabled = false;
    setThinking(false);
    if (!r.ok) {
      showStep(1);
      setMood('worried');
      $('#sub').textContent = 'Hmm, ada yang nyangkut.';
      if (r.error === 'NO_KEY') setStatusText('API key OpenAI belum diisi. Klik kanan ikon Absenin di toolbar > Options.', 'err');
      else if (r.error === 'NO_LICENSE') setStatusText('Kode lisensi belum diaktifkan. Buka pengaturan ekstensi > Akun.', 'err');
      else if (r.code === 'UPDATE_REQUIRED') setStatusText('Ekstensi perlu diperbarui. Unduh versi terbaru di dashboard Absenin, lalu Load unpacked ulang.', 'err');
      else setStatusText(r.error || 'Gagal generate.', 'err');
      return;
    }
    setMood('happy');
    $('#sub').textContent = 'Jadi! Baca dulu, ubah kalau perlu.';
    showOutput(r.fields, true);
    setStatusText('', '', 2);
    try { sessionStorage.setItem('sawit-brief', brief); } catch (e) { /* abaikan */ }
    await refreshState();
  }
  $('#gen').addEventListener('click', doGenerate);
  $('#hist').addEventListener('click', async () => {
    const b = $('#hist'); b.disabled = true;
    setStatusText('Baca riwayat Chrome hari ini (di laptop ini aja)...', '');
    const r = await send({ type: 'historySummary' });
    b.disabled = false;
    if (!r.ok) { setStatusText(r.error === 'NO_HISTORY' ? 'Izin riwayat belum diberikan. Nyalain di pengaturan ekstensi.' : (r.error || 'Gagal baca riwayat.'), 'err'); return; }
    if (!r.brief) { setStatusText('Belum ada riwayat yang kebaca hari ini.', 'err'); return; }
    const ta = $('#brief');
    ta.value = (ta.value.trim() ? ta.value.trim() + '\n' : '') + r.brief;
    autosize(ta);
    ta.focus();
    setStatusText('Tebakan dari ' + r.total + ' kunjungan hari ini. Ubah kalau kurang pas, lalu Generate.', 'ok');
  });
  $('#brief').addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); doGenerate(); } });
  $('#back').addEventListener('click', () => { showStep(1); $('#sub').textContent = 'Ubah ceritanya, lalu generate lagi.'; $('#brief').focus(); });
  $('#fill').addEventListener('click', () => {
    const f = readOutput();
    const r = fillForm(f);
    if (!r.ok) { setStatusText(r.error, 'err', 2); toast(r.error); send({ type: 'telemetry', event: 'fill-failed', detail: r.error }); return; }
    setStatusText('Terisi ' + r.filled + ' kolom. Tinggal centang pernyataan dan klik "Simpan dan Kirim".', 'ok', 2);
    toast('Form terisi. Cek, centang, lalu kirim sendiri ya.');
    petals();
  });

  async function copyText(text, btn) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    if (btn) {
      const old = btn.textContent;
      btn.textContent = 'Tersalin ✓'; btn.classList.add('copied');
      setTimeout(() => { btn.textContent = old; btn.classList.remove('copied'); }, 1400);
    }
  }
  panel.addEventListener('click', e => {
    const b = e.target.closest('.copy'); if (!b) return;
    copyText($('#f_' + b.dataset.k).value.trim(), b);
  });
  $('#copyAll').addEventListener('click', (e) => {
    const f = readOutput();
    const text = 'Uraian aktivitas:\n' + f.aktivitas + '\n\nPembelajaran yang diperoleh:\n' + f.pembelajaran + '\n\nKendala yang dialami:\n' + f.kendala;
    copyText(text, e.currentTarget);
    toast('Semua tersalin. Tinggal tempel.');
  });

  function closePanel() {
    panel.classList.add('closing');
    setTimeout(() => { panel.classList.remove('open', 'closing'); }, 190);
  }
  $('.x').addEventListener('click', closePanel);
  fab.addEventListener('click', () => {
    bubble.classList.remove('show');
    if (panel.classList.contains('open')) { closePanel(); return; }
    panel.classList.add('open');
    if ($('#step1').classList.contains('on')) $('#brief').focus();
  });

  let idleFab = null, idleHead = null;
  function setMood(m) {
    if (!idleFab) {
      idleFab = globalThis.SawitIdle.attach(fab.querySelector('.av'), { theme: THEME, mood: m, size: 50, root: shadow, doc: document });
      idleHead = globalThis.SawitIdle.attach(avatarEl, { theme: THEME, mood: m, size: 46, root: shadow, doc: document });
    } else {
      idleFab.update(m, THEME, 50);
      idleHead.update(m, THEME, 46);
    }
  }
  function toast(text) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = text;
    shadow.appendChild(t); setTimeout(() => t.remove(), 3800);
  }
  function speak(text, ms) {
    bubble.textContent = text; bubble.classList.add('show');
    clearTimeout(speak._t); speak._t = setTimeout(() => bubble.classList.remove('show'), ms || 7000);
  }
  function petals() {
    const colors = ['#F7B5A3', '#A8D5AE', '#C7BEF2', '#F9D29D', '#9CC9EA'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      p.style.left = (5 + Math.random() * 90) + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
      p.style.animationDelay = (Math.random() * .6) + 's';
      p.style.transform = 'scale(' + (0.7 + Math.random() * 0.8) + ')';
      shadow.appendChild(p);
      setTimeout(() => p.remove(), 4200);
    }
  }
  function fillTemplates() {
    const sel = $('#tpl');
    const cur = sel.value || (state && state.settings.templateId);
    sel.innerHTML = (state ? state.templates : globalThis.SAWIT_TEMPLATES).map(t => '<option value="' + t.id + '">' + t.emoji + ' ' + t.nama + '</option>').join('');
    if (cur && [...sel.options].some(o => o.value === cur)) sel.value = cur;
  }

  async function refreshState() {
    const r = await send({ type: 'getState' });
    if (!r.ok) return;
    state = r.state;
    const applied = TH.applyTheme(root, state.settings);
    THEME = applied.theme;
    root.classList.toggle('sway', !!THEME.sway);
    $('#ttl').textContent = simpel() ? 'Ceritain dikit, sisanya otomatis' : tt('Ceritain dikit, sisanya {n}');
    $('#histRow').style.display = (state.settings.historyHints && state.hasHistory) ? 'flex' : 'none';
    fillTemplates();
    renderChips();
    const hour = new Date().getHours() * 60 + new Date().getMinutes();
    const target = state.settings.hour * 60 + state.settings.minute;
    if (headEl.classList.contains('thinking')) return;
    if (!state.workday) { setMood('sleep'); fab.classList.remove('alert'); $('#sub').textContent = simpel() ? 'Hari ini libur.' : tt('Hari ini libur. {N} tidur dulu.'); }
    else if (state.doneToday) { setMood('happy'); fab.classList.remove('alert'); $('#sub').textContent = 'Hari ini udah terkirim. Streak ' + state.streak + ' hari.'; }
    else if (hour >= target) { setMood('worried'); fab.classList.add('alert'); $('#sub').textContent = 'Belum diisi nih. Yuk, cerita dikit.'; }
    else { setMood('happy'); fab.classList.remove('alert'); $('#sub').textContent = 'Hari ini ngapain aja?'; }
  }

  function nudge() {
    if (state && (state.doneToday || !state.workday)) return;
    speak('Klik tanggal ' + DAY + ' di kalender, nanti aku bantu isi. Ceritain dikit aja.', 9000);
    fab.classList.add('alert');
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'sawitNudge') { refreshState().then(nudge); sendResponse({ ok: true }); }
    else if (msg.type === 'sawitOpenPanel') { panel.classList.add('open'); if ($('#step1').classList.contains('on')) $('#brief').focus(); sendResponse({ ok: true }); }
    else if (msg.type === 'fillFromPopup') { sendResponse(fillForm(msg.fields || {})); }
    else if (msg.type === 'detectNow') { lastReported = null; reportStatus().then(st => sendResponse({ ok: true, status: st })); return true; }
  });

  // Saat dialog form muncul, buka panel otomatis sekali.
  let dialogSeen = false;
  let timer = null;
  const obs = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      reportStatus();
      const dlg = findDialog();
      if (dlg && !dialogSeen) {
        dialogSeen = true;
        if (!(state && state.doneToday) && !panel.classList.contains('open')) {
          panel.classList.add('open');
          if ($('#step1').classList.contains('on')) $('#brief').focus();
          speak('Form kebuka. Ceritain hari ini ngapain, aku yang rangkai.', 6000);
        }
      } else if (!dlg && dialogSeen) {
        dialogSeen = false;
      }
    }, 700);
  });
  obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'fill', 'stroke'] });

  // init
  setMood('happy');
  try {
    const saved = JSON.parse(sessionStorage.getItem('sawit-draft') || 'null');
    if (saved && saved.fields) { $('#brief').value = saved.brief || ''; showOutput(saved.fields, false); }
  } catch (e) { /* abaikan */ }
  renderChips();
  refreshState().then(() => {
    reportStatus();
    if (location.hash.includes('sawit')) setTimeout(nudge, 1200);
  });
  setTimeout(reportStatus, 2500);
})();
