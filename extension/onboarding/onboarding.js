// Panduan 4 langkah saat pertama dipasang: lisensi, tema, jam, selesai.
const U = globalThis.SawitUtil;
const TH = globalThis.SawitThemes;
const $ = (s) => document.querySelector(s);
const send = (msg) => new Promise((res) => chrome.runtime.sendMessage(msg, (r) => res(r || { ok: false, error: chrome.runtime.lastError?.message })));

let settings = { ...U.DEFAULT_SETTINGS };
let step = 1;
let idle1 = null, idle4 = null;

function applyTheme() {
  const { theme } = TH.applyTheme(document.documentElement, settings);
  const a1 = $('#av1'), a4 = $('#av4');
  if (!idle1) idle1 = globalThis.SawitIdle.attach(a1, { theme, mood: 'happy', size: 96 }); else idle1.update('happy', theme, 96);
  if (!idle4) idle4 = globalThis.SawitIdle.attach(a4, { theme, mood: 'happy', size: 96 }); else idle4.update('happy', theme, 96);
  document.querySelectorAll('.theme').forEach((el) => el.classList.toggle('on', el.dataset.id === theme.id));
  $('#themeDesc').textContent = theme.nama + ': ' + theme.deskripsi;
}
function go(n) {
  step = n;
  document.querySelectorAll('.step').forEach((el) => el.classList.toggle('on', Number(el.dataset.step) === n));
  document.querySelectorAll('.progress span').forEach((el) => { const k = Number(el.dataset.step); el.classList.toggle('on', k === n); el.classList.toggle('done', k < n); });
  if (n === 4) $('#jamText').textContent = U.pad(settings.hour) + '.' + U.pad(settings.minute);
}
async function save(patch) {
  settings = { ...settings, ...patch };
  await send({ type: 'saveSettings', settings: patch });
}

// langkah 1: lisensi
$('#activate').addEventListener('click', async () => {
  const hint = $('#licHint');
  hint.textContent = 'Menghubungi server...'; hint.className = 'hint';
  await save({ mode: 'lisensi' });
  const r = await send({ type: 'activateLicense', key: $('#license').value.trim() });
  if (!r.ok) { hint.textContent = 'Gagal: ' + r.error; hint.className = 'hint err'; return; }
  hint.textContent = 'Aktif. Paket ' + r.info.plan + ', ' + r.info.dailyQuota + ' generate per hari.'; hint.className = 'hint ok';
  setTimeout(() => go(2), 700);
});
$('#openDash').addEventListener('click', (e) => { e.preventDefault(); chrome.tabs.create({ url: (settings.apiBase || 'http://localhost:3000') + '/dashboard' }); });
$('#skipKey').addEventListener('click', async (e) => { e.preventDefault(); await save({ mode: 'key' }); go(2); });

// langkah 2: tema
const grid = $('#themes');
TH.THEMES.forEach((t) => {
  const el = document.createElement('button');
  el.className = 'theme'; el.dataset.id = t.id;
  el.innerHTML = t.char('happy', 48) + '<span class="n"></span>';
  el.querySelector('.n').textContent = t.nama.split(' ')[0];
  el.addEventListener('click', async () => { await save({ theme: t.id }); applyTheme(); });
  grid.appendChild(el);
});

// langkah 3: jam
for (let i = 0; i < 24; i++) $('#hour').insertAdjacentHTML('beforeend', '<option value="' + i + '">' + U.pad(i) + '</option>');
for (let i = 0; i < 60; i++) $('#minute').insertAdjacentHTML('beforeend', '<option value="' + i + '">' + U.pad(i) + '</option>');
$('#test').addEventListener('click', async () => {
  await save({ hour: Number($('#hour').value), minute: Number($('#minute').value), nickname: $('#nickname').value.trim(), sound: $('#sound').checked, telemetry: $('#telemetry').checked });
  $('#testHint').textContent = 'Layar pembuka dan notifikasi harusnya muncul sebentar lagi...';
  await send({ type: 'testNag' });
});

document.querySelectorAll('[data-next]').forEach((b) => b.addEventListener('click', async () => {
  if (step === 3) await save({ hour: Number($('#hour').value), minute: Number($('#minute').value), nickname: $('#nickname').value.trim(), sound: $('#sound').checked, telemetry: $('#telemetry').checked });
  go(step + 1);
}));
document.querySelectorAll('[data-prev]').forEach((b) => b.addEventListener('click', () => go(step - 1)));

// langkah 4
$('#openSettings').addEventListener('click', async () => { await send({ type: 'setOnboarded' }); chrome.runtime.openOptionsPage(); });
$('#finish').addEventListener('click', async () => { await send({ type: 'setOnboarded' }); await send({ type: 'openPage', fullscreen: false }); window.close(); });

send({ type: 'getState' }).then((r) => {
  if (r.ok) settings = { ...U.DEFAULT_SETTINGS, ...r.state.settings };
  $('#hour').value = String(settings.hour); $('#minute').value = String(settings.minute);
  $('#nickname').value = settings.nickname || '';
  $('#sound').checked = settings.sound !== false; $('#telemetry').checked = settings.telemetry !== false;
  applyTheme();
  if (r.ok && r.state.license && r.state.license.hasKey) { $('#licHint').textContent = 'Lisensi sudah aktif (' + r.state.license.keyMasked + '). Lanjut saja.'; $('#licHint').className = 'hint ok'; $('#activate').textContent = 'Lanjut'; $('#activate').onclick = () => go(2); }
});
