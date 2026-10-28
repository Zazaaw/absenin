const U = globalThis.SawitUtil;
const TH = globalThis.SawitThemes;
const $ = (s) => document.querySelector(s);
function send(msg) {
  return new Promise(resolve => chrome.runtime.sendMessage(msg, r => resolve(r || { ok: false, error: chrome.runtime.lastError?.message })));
}

let settings = { ...U.DEFAULT_SETTINGS };
let hasKey = false;

const CH = globalThis.SawitChime;
function chimeFor() {
  const theme = TH.themeFor(settings);
  const id = settings.chime && settings.chime !== 'auto' ? settings.chime : (theme.chime || 'marimba');
  return CH.CHIMES.find(c => c.id === id) || CH.CHIMES[0];
}
function renderChime() {
  const sel = $('#chime');
  if (!sel.options.length) {
    sel.innerHTML = '<option value="auto">Otomatis ikut tema</option>' + CH.CHIMES.map(c => '<option value="' + c.id + '">' + c.nama + '</option>').join('');
  }
  sel.value = settings.chime || 'auto';
  const c = chimeFor();
  $('#chimeDesc').textContent = (settings.chime === 'auto' || !settings.chime ? 'Tema ini pakai ' + c.nama + '. ' : '') + c.deskripsi;
}
let previewCtx = null;
$('#playChime').addEventListener('click', () => {
  try {
    if (previewCtx) { try { previewCtx.close(); } catch (e) { /* abaikan */ } }
    previewCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = previewCtx;
    ctx.resume().then(() => CH.play(ctx, chimeFor().id, 2.6));
    setTimeout(() => { try { ctx.close(); } catch (e) { /* abaikan */ } }, 3000);
  } catch (e) { $('#chimeDesc').textContent = 'Nggak bisa memutar suara: ' + e.message; }
});
$('#chime').addEventListener('change', () => { settings.chime = $('#chime').value; renderChime(); });

function applyLive() {
  const { theme } = TH.applyTheme(document.documentElement, settings);
  if (!applyLive.idle) applyLive.idle = globalThis.SawitIdle.attach($('#avatar'), { theme, mood: 'happy', size: 44 });
  else applyLive.idle.update('happy', theme, 44);
  renderChime();
  document.querySelectorAll('.theme').forEach(el => el.classList.toggle('on', el.dataset.id === theme.id));
  const td = $('#themeDesc'); if (td) td.textContent = theme.nama + ': ' + theme.deskripsi;
}

function renderThemes() {
  const box = $('#themes');
  box.innerHTML = '';
  TH.THEMES.forEach(t => {
    const p = TH.palette(t, false);
    const el = document.createElement('div');
    el.className = 'theme' + (t.id === settings.theme ? ' on' : '');
    el.dataset.id = t.id;
    el.innerHTML = '<div>' + t.char('happy', 46) + '</div><div class="n"></div><div class="sw">' +
      ['bg', 'primary', 'secondary', 'chip', 'pending-bg'].map(k => '<i style="background:' + p[k] + '"></i>').join('') + '</div>';
    el.querySelector('.n').textContent = t.nama;
    el.title = t.deskripsi;
    el.addEventListener('click', () => { settings.theme = t.id; applyLive(); });
    box.appendChild(el);
  });
}

function renderTemplates() {
  const all = U.allTemplates(settings);
  const sel = $('#template');
  sel.innerHTML = all.map(t => '<option value="' + t.id + '">' + t.emoji + ' ' + t.nama + '</option>').join('');
  if (all.some(t => t.id === settings.templateId)) sel.value = settings.templateId; else sel.value = all[0].id;
  renderTplDesc();
  const list = $('#customList');
  const custom = settings.customTemplates || [];
  list.innerHTML = custom.length ? '' : '<div class="hint">Belum ada gaya tambahan.</div>';
  custom.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = '<span>' + (t.emoji || '✨') + '</span><span class="n"></span><span class="i"></span><button type="button" title="Hapus">×</button>';
    el.querySelector('.n').textContent = t.nama;
    el.querySelector('.i').textContent = t.instruksi;
    el.querySelector('button').addEventListener('click', () => { settings.customTemplates.splice(i, 1); renderTemplates(); });
    list.appendChild(el);
  });
}
function renderTplDesc() {
  const t = U.allTemplates(settings).find(x => x.id === $('#template').value);
  $('#tplDesc').textContent = t ? (t.deskripsi || t.instruksi) : '';
}
function renderHolidays() {
  const box = $('#holidayList');
  const list = [...(settings.extraHolidays || [])].sort();
  box.innerHTML = list.length ? '' : '<span class="hint">Belum ada.</span>';
  list.forEach(k => {
    const el = document.createElement('span');
    el.className = 'chip';
    el.innerHTML = '<span></span><button type="button" title="Hapus">×</button>';
    el.querySelector('span').textContent = U.formatLong(U.parseKey(k));
    el.querySelector('button').addEventListener('click', () => { settings.extraHolidays = settings.extraHolidays.filter(x => x !== k); renderHolidays(); });
    box.appendChild(el);
  });
}
function renderKeyHint(state) {
  hasKey = state.hasKey;
  $('#keyHint').textContent = hasKey ? 'Key tersimpan (' + state.keyHint + '). Kosongkan kolom dan Simpan untuk menghapus, atau isi key baru untuk mengganti.' : 'Belum ada key. Tanpa key, tombol Generate tidak jalan.';
  $('#keyHint').className = 'hint';
  $('#key').placeholder = hasKey ? state.keyHint + ' (tersimpan)' : 'sk-...';
}
function renderLog(state) {
  const box = $('#logList');
  const log = state.eventLog || [];
  box.innerHTML = log.length ? '' : '<div class="e">Belum ada kejadian. Klik "Tes pengingat sekarang".</div>';
  [...log].reverse().forEach(e => {
    const el = document.createElement('div');
    el.className = 'e' + (/gagal|error|dimatikan|dilewati/i.test(e.s) ? ' bad' : '');
    el.textContent = e.s;
    box.appendChild(el);
  });
  if (state.nextDaily) {
    const d = new Date(state.nextDaily);
    $('#alarmInfo').textContent = 'Alarm harian berikutnya: ' + U.formatLong(d) + ' jam ' + U.pad(d.getHours()) + '.' + U.pad(d.getMinutes()) +
      (state.doneToday ? '. Hari ini laporan sudah terkirim, jadi alarm hari ini diam.' : '');
  } else {
    $('#alarmInfo').textContent = 'Alarm harian belum terjadwal. Klik Simpan untuk menjadwalkan.';
  }
  const np = state.notifPermission;
  $('#notifInfo').textContent = np === 'granted' ? 'Notifikasi Chrome: aktif.' : 'Notifikasi Chrome: ' + np + '. Cek Windows Settings > System > Notifications > Google Chrome, dan matikan Focus Assist / Do not disturb.';
  $('#notifInfo').className = 'hint ' + (np === 'granted' ? 'ok' : 'err');
}
function renderLicense(state) {
  const lic = state.license || {};
  const hint = $('#licenseHint');
  const mode = settings.mode || 'lisensi';
  $('#modeLisensi').checked = mode !== 'key';
  $('#modeKey').checked = mode === 'key';
  $('#boxLisensi').style.display = mode === 'key' ? 'none' : 'grid';
  $('#boxKey').style.display = mode === 'key' ? 'grid' : 'none';
  if (mode === 'key') { const d = $('#boxKey').closest('details'); if (d) d.open = true; }
  $('#apiBase').value = settings.apiBase || 'http://localhost:3000';
  if (lic.hasKey && lic.info) {
    const exp = lic.info.expiresAt ? U.formatLong(new Date(lic.info.expiresAt)) : '-';
    hint.textContent = 'Aktif: ' + lic.keyMasked + ' · paket ' + lic.info.plan + ' · berlaku sampai ' + exp + ' · kuota ' + (lic.info.remaining ?? lic.info.dailyQuota) + '/' + lic.info.dailyQuota + ' tersisa hari ini.' + (lic.info.announcement ? ' Pengumuman: ' + lic.info.announcement : '');
    hint.className = 'hint ok';
    $('#license').placeholder = lic.keyMasked + ' (aktif)';
  } else if (lic.hasKey) {
    hint.textContent = 'Kode tersimpan (' + lic.keyMasked + ') tapi belum terverifikasi. Klik Aktifkan.'; hint.className = 'hint err';
  } else {
    hint.textContent = 'Belum ada lisensi. Dapatkan di dashboard Absenin, lalu tempel di sini.'; hint.className = 'hint';
  }
}
document.querySelectorAll('input[name="mode"]').forEach(r => r.addEventListener('change', () => { settings.mode = $('#modeKey').checked ? 'key' : 'lisensi'; renderLicense({ license: lastState && lastState.license }); }));
$('#activate').addEventListener('click', async () => {
  const hint = $('#licenseHint');
  settings.apiBase = $('#apiBase').value.trim() || 'http://localhost:3000';
  await send({ type: 'saveSettings', settings: { apiBase: settings.apiBase, mode: 'lisensi' } });
  hint.textContent = 'Menghubungi server...'; hint.className = 'hint';
  const key = $('#license').value.trim();
  const r = await send({ type: 'activateLicense', key: key || undefined });
  if (!r.ok) { hint.textContent = 'Gagal: ' + r.error; hint.className = 'hint err'; return; }
  $('#license').value = '';
  const st = await send({ type: 'getState' });
  if (st.ok) { lastState = st.state; renderLicense(st.state); }
});
let lastState = null;

// Tab di sisi kiri: satu panel yang terlihat, sisanya disembunyikan. Tab terakhir diingat.
function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === id));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('on', p.dataset.panel === id));
  try { localStorage.setItem('md-tab', id); } catch (e) { /* abaikan */ }
}
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));
showTab((location.hash || '').replace('#', '') || (() => { try { return localStorage.getItem('md-tab'); } catch (e) { return null; } })() || 'akun');
$('#runGuide').addEventListener('click', () => send({ type: 'openOnboarding' }));
$('#openDash').addEventListener('click', (e) => { e.preventDefault(); chrome.tabs.create({ url: (settings.apiBase || 'http://localhost:3000') + '/dashboard' }); });

function fillTimeSelects() {
  const h = $('#hour'), m = $('#minute');
  if (h.options.length) return;
  for (let i = 0; i < 24; i++) h.insertAdjacentHTML('beforeend', '<option value="' + i + '">' + U.pad(i) + '</option>');
  for (let i = 0; i < 60; i++) m.insertAdjacentHTML('beforeend', '<option value="' + i + '">' + U.pad(i) + '</option>');
}

function load(state) {
  settings = { ...U.DEFAULT_SETTINGS, ...state.settings };
  lastState = state;
  renderLog(state);
  renderLicense(state);
  fillTimeSelects();
  $('#hour').value = String(settings.hour);
  $('#minute').value = String(settings.minute);
  $('#interval').value = settings.intervalMin;
  $('#snooze').value = settings.snoozeMin;
  $('#nickname').value = settings.nickname || '';
  $('#fullscreen').checked = !!settings.fullscreen;
  $('#splash').checked = settings.splash !== false;
  $('#sound').checked = settings.sound !== false;
  $('#model').value = settings.model || 'gpt-4o-mini';
  $('#nightMode').value = settings.nightMode || 'auto';
  $('#badge').checked = settings.badge !== false;
  $('#telemetry').checked = settings.telemetry !== false;
  if (state.version) $('#verText').textContent = 'v' + state.version;
  $('#historyHints').checked = !!settings.historyHints && !!state.hasHistory;
  renderThemes();
  renderTemplates();
  renderHolidays();
  renderKeyHint(state);
  applyLive();
}

$('#template').addEventListener('change', renderTplDesc);
$('#nightMode').addEventListener('change', () => { settings.nightMode = $('#nightMode').value; applyLive(); });
$('#historyHints').addEventListener('change', async (e) => {
  const cb = e.target;
  const hint = $('#histHint');
  if (cb.checked) {
    let ok = false;
    try { ok = await chrome.permissions.request({ permissions: ['history'] }); } catch (err) { ok = false; }
    if (!ok) { cb.checked = false; hint.textContent = 'Izin riwayat ditolak. Fitur tebakan tetap mati.'; hint.className = 'hint err'; return; }
    settings.historyHints = true;
    hint.textContent = 'Izin diberikan. Tombol "Tebak dari riwayat Chrome" muncul di panel setelah Simpan.'; hint.className = 'hint ok';
  } else {
    settings.historyHints = false;
    try { await chrome.permissions.remove({ permissions: ['history'] }); } catch (err) { /* abaikan */ }
    hint.textContent = 'Izin riwayat dicabut.'; hint.className = 'hint';
  }
});
$('#toggleKey').addEventListener('click', () => {
  const k = $('#key');
  k.type = k.type === 'password' ? 'text' : 'password';
  $('#toggleKey').textContent = k.type === 'password' ? 'Lihat' : 'Sembunyikan';
});
$('#testKey').addEventListener('click', async () => {
  const hint = $('#keyHint');
  hint.textContent = 'Mengecek...'; hint.className = 'hint';
  const r = await send({ type: 'testKey', key: $('#key').value });
  hint.textContent = r.ok ? 'Key valid. OpenAI menjawab.' : 'Gagal: ' + r.error;
  hint.className = 'hint ' + (r.ok ? 'ok' : 'err');
});
$('#addCustom').addEventListener('click', () => {
  const nama = $('#ctName').value.trim(), instr = $('#ctInstr').value.trim(), emoji = $('#ctEmoji').value.trim();
  if (!nama || !instr) { alert('Isi nama gaya dan instruksinya dulu.'); return; }
  settings.customTemplates = settings.customTemplates || [];
  settings.customTemplates.push({ id: 'custom-' + Date.now(), nama, instruksi: instr, emoji: emoji || '✨' });
  $('#ctName').value = ''; $('#ctInstr').value = ''; $('#ctEmoji').value = '';
  renderTemplates();
});
$('#addHoliday').addEventListener('click', () => {
  const v = $('#holiday').value;
  if (!v) return;
  settings.extraHolidays = settings.extraHolidays || [];
  if (!settings.extraHolidays.includes(v)) settings.extraHolidays.push(v);
  $('#holiday').value = '';
  renderHolidays();
});
$('#save').addEventListener('click', async () => {
  const h = Number($('#hour').value), m = Number($('#minute').value);
  const patch = {
    ...settings,
    hour: h, minute: m,
    intervalMin: Math.max(1, Number($('#interval').value) || 10),
    snoozeMin: Math.max(1, Number($('#snooze').value) || 15),
    nickname: $('#nickname').value.trim(),
    fullscreen: $('#fullscreen').checked,
    splash: $('#splash').checked,
    sound: $('#sound').checked,
    nightMode: $('#nightMode').value,
    chime: $('#chime').value || 'auto',
    badge: $('#badge').checked,
    telemetry: $('#telemetry').checked,
    historyHints: $('#historyHints').checked,
    model: $('#model').value.trim() || 'gpt-4o-mini',
    templateId: $('#template').value,
    mode: $('#modeKey').checked ? 'key' : 'lisensi',
    apiBase: $('#apiBase').value.trim() || 'http://localhost:3000'
  };
  const msg = $('#saveMsg');
  msg.textContent = 'Menyimpan...'; msg.className = 'hint';
  const keyVal = $('#key').value.trim();
  if (keyVal) await send({ type: 'saveKey', key: keyVal });
  else if (hasKey && $('#key').dataset.cleared === '1') await send({ type: 'saveKey', key: '' });
  const r = await send({ type: 'saveSettings', settings: patch });
  if (r.ok) {
    $('#key').value = '';
    delete $('#key').dataset.cleared;
    load(r.state);
    msg.textContent = 'Tersimpan. Pengingat berikutnya jam ' + U.pad(h) + '.' + U.pad(m) + '.';
    msg.className = 'hint ok';
  } else {
    msg.textContent = 'Gagal: ' + r.error; msg.className = 'hint err';
  }
});
$('#testNow').addEventListener('click', async () => {
  const msg = $('#testMsg');
  msg.textContent = 'Menjalankan...'; msg.className = 'hint';
  const r = await send({ type: 'testNag' });
  if (r.ok) {
    msg.textContent = 'Pengingat ditembak. Harusnya layar pembuka kebuka dan ada notifikasi.' + (r.skipReason ? ' Catatan: pengingat terjadwal hari ini diam karena ' + r.skipReason + '.' : '');
    msg.className = 'hint ok';
    renderLog(r.state);
  } else { msg.textContent = 'Gagal: ' + r.error; msg.className = 'hint err'; }
});
$('#clearLog').addEventListener('click', async () => { const r = await send({ type: 'clearLog' }); if (r.ok) renderLog(r.state); });
setInterval(async () => { const r = await send({ type: 'getState' }); if (r.ok) renderLog(r.state); }, 3000);
$('#key').addEventListener('input', () => { if (!$('#key').value) $('#key').dataset.cleared = '1'; else delete $('#key').dataset.cleared; });

send({ type: 'getState' }).then(r => { if (r.ok) load(r.state); });
