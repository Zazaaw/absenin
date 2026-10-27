const U = globalThis.SawitUtil;
const $ = (s) => document.querySelector(s);

function send(msg) {
  return new Promise(resolve => chrome.runtime.sendMessage(msg, r => resolve(r || { ok: false, error: chrome.runtime.lastError?.message })));
}

const FLOWER = (color) => '<svg viewBox="0 0 24 24"><g fill="' + color + '">' +
  '<circle cx="12" cy="6.5" r="3.4"/><circle cx="17.5" cy="12" r="3.4"/><circle cx="12" cy="17.5" r="3.4"/><circle cx="6.5" cy="12" r="3.4"/>' +
  '</g><circle cx="12" cy="12" r="3" fill="#FFE7A8"/></svg>';
const TH = globalThis.SawitThemes;
let THEME = TH.THEMES[0];
const tt = (s) => TH.tt(THEME, s);

function moodFor(state, now) {
  if (!state.workday) return 'sleep';
  if (state.doneToday) return 'happy';
  const mins = now.getHours() * 60 + now.getMinutes();
  const target = state.settings.hour * 60 + state.settings.minute;
  if (mins >= target + 120) return 'wilted';
  if (mins >= target) return 'worried';
  return 'happy';
}

function sayFor(state, mood) {
  const name = state.settings.nickname ? state.settings.nickname : 'kamu';
  const simpel = THEME.id === 'simpel';
  if (state.todayStatus === 'libur' || (!state.workday && !U.isWeekend(new Date()))) return simpel ? 'Hari ini libur. Nggak ada pengingat.' : tt('Hari ini libur. {N} tidur dulu, besok lanjut cerita.');
  if (!state.workday) return 'Weekend! Istirahat yang cukup, ' + name + '.';
  if (state.doneToday) {
    if (state.todayStatus === 'waiting' || state.todayStatus === 'submitted') return 'Laporan hari ini udah terkirim. Tinggal nunggu mentor.' + (simpel ? '' : ' Makasih ya!');
    return simpel ? 'Hari ini udah beres dan disetujui.' : tt('Hari ini udah beres dan disetujui. {N} seneng banget.');
  }
  if (mood === 'wilted') return simpel ? 'Udah 2 jam lewat dari jam pengingat. Laporan masih kosong.' : tt('{N} mulai layu nih... laporannya masih kosong. Isi sekarang, yuk?');
  if (mood === 'worried') return 'Udah lewat jam ' + U.pad(state.settings.hour) + '.' + U.pad(state.settings.minute) + '. Ceritain hari ini ngapain, 2 menit aja.';
  return 'Nanti jam ' + U.pad(state.settings.hour) + '.' + U.pad(state.settings.minute) + (simpel ? ' ada pengingat.' : tt(' {n} ingetin. Semangat kerjanya!'));
}

function renderGarden(state) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // Senin = 0
  const grid = $('#grid');
  grid.innerHTML = '';
  let done = 0, workdays = 0;
  for (let i = 0; i < offset; i++) { const e = document.createElement('div'); e.className = 'day empty'; grid.appendChild(e); }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d);
    const key = U.dateKey(date);
    const entry = state.history[key];
    const el = document.createElement('div');
    el.className = 'day';
    el.title = U.formatLong(date);
    const isToday = key === state.today;
    const future = date > now && !isToday;
    if (isToday) el.classList.add('today');
    const beforeInstall = key < (state.installedAt || state.today) && !U.isDone(entry);
    if (U.isWeekend(date)) { el.classList.add('weekend'); el.textContent = d; }
    else if (U.isHoliday(key, state.settings, state.history)) { el.classList.add('libur'); el.textContent = d; }
    else if (future) { el.classList.add('future'); el.textContent = d; }
    else if (beforeInstall) { el.classList.add('unknown'); el.textContent = d; el.title += ' (sebelum ekstensi dipasang)'; }
    else {
      workdays++;
      if (U.isDone(entry)) {
        done++;
        el.classList.add('done');
        el.innerHTML = (THEME.mark || FLOWER)(THEME.flowers[d % THEME.flowers.length]) + '<span>' + d + '</span>';
      } else if (isToday) { el.classList.add('pending'); el.textContent = d; }
      else { el.classList.add('missed'); el.textContent = d; }
    }
    grid.appendChild(el);
  }
  $('#monthName').textContent = (THEME.kalender || 'Kebun') + ' ' + U.BULAN[m];
  $('#monthDone').textContent = done;
  $('#monthLbl').textContent = 'dari ' + workdays + ' hari kerja' + (workdays === 1 ? ' (sejak dipasang)' : '');
}

function renderActions(state) {
  const box = $('#actions');
  box.innerHTML = '';
  const add = (html) => { box.insertAdjacentHTML('beforeend', html); };
  if (state.updateRequired) add('<div class="note warn">Ekstensi perlu diperbarui. <button class="link" id="dl">Unduh versi baru</button></div>');
  add('<button class="btn p" id="open">Buka MagangHub</button>');
  if (state.workday && !state.doneToday) {
    add('<div class="row"><button class="btn l" id="markDone">Udah kukirim sendiri</button><button class="btn g" id="snooze">Tunda ' + state.settings.snoozeMin + ' mnt</button></div>');
    if (state.nagging) add('<div class="note warn">Pengingat aktif, ngulang tiap ' + state.settings.intervalMin + ' menit. <button class="link" id="stopNag">Matikan untuk hari ini</button></div>');
    else if (state.snoozed) add('<div class="note">Ditunda. Nanti pengingatnya balik lagi.</div>');
    else add('<div class="note">Panel generate ada di halaman MagangHub, pojok kanan bawah.</div>');
  } else if (state.doneToday) {
    add('<div class="note">Pengingat hari ini diam karena laporan udah terkirim. Salah tandai? <button class="link" id="resetToday">Batalkan tanda hari ini</button></div>');
  } else {
    add('<div class="note">Bukan hari kerja. Nggak ada pengingat.</div>');
  }

  $('#open').addEventListener('click', async () => { await send({ type: 'openPage', fullscreen: false }); window.close(); });
  const dl = $('#dl');
  if (dl) dl.addEventListener('click', () => chrome.tabs.create({ url: (state.settings.apiBase || 'http://localhost:3000') + '/dashboard' }));
  const md = $('#markDone');
  if (md) md.addEventListener('click', async () => {
    const r = await send({ type: 'markStatus', date: state.today, status: 'submitted', manual: true });
    if (r.ok) render(r.state);
  });
  const sn = $('#snooze');
  if (sn) sn.addEventListener('click', async () => { const r = await send({ type: 'snooze' }); if (r.ok) render(r.state); });
  const st = $('#stopNag');
  if (st) st.addEventListener('click', async () => { const r = await send({ type: 'stopNag' }); if (r.ok) render(r.state); });
  const rs = $('#resetToday');
  if (rs) rs.addEventListener('click', async () => { const r = await send({ type: 'resetToday' }); if (r.ok) render(r.state); });
}

function render(state) {
  const now = new Date();
  const applied = TH.applyTheme(document.documentElement, state.settings);
  THEME = applied.theme;
  document.body.classList.toggle('sway', !!THEME.sway);
  const mood = moodFor(state, now);
  if (!render.idle) render.idle = globalThis.SawitIdle.attach($('#avatar'), { theme: THEME, mood, size: 78 });
  else render.idle.update(mood, THEME, 78);
  const h = now.getHours();
  const sapa = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
  $('#greet').textContent = sapa + (state.settings.nickname ? ', ' + state.settings.nickname : '') + '!';
  $('#date').textContent = U.formatLong(now);
  $('#say').textContent = sayFor(state, mood);
  $('#streak').textContent = state.streak;
  $('#jam').textContent = U.pad(state.settings.hour) + '.' + U.pad(state.settings.minute);
  $('#keyState').textContent = state.hasKey ? 'OpenAI ' + state.keyHint : 'OpenAI key belum diisi';
  renderGarden(state);
  renderActions(state);
}

$('#openOptions').addEventListener('click', () => chrome.runtime.openOptionsPage());
$('#testNag').addEventListener('click', async () => { await send({ type: 'testNag' }); window.close(); });

send({ type: 'getState' }).then(r => {
  if (r.ok) render(r.state);
  else $('#say').textContent = 'Gagal memuat: ' + r.error;
});
