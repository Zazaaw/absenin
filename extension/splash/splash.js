// Layar pembuka sebelum halaman MagangHub: animasi, suara singkat, lalu pindah.
const U = globalThis.SawitUtil;
const URL_RIWAYAT = 'https://monev.maganghub.kemnaker.go.id/dashboard/riwayat#sawit';
const DURASI = 4; // detik sebelum pindah otomatis
const params = new URLSearchParams(location.hash.slice(1));
const reason = params.get('r') || 'daily';

function send(msg) {
  return new Promise(resolve => chrome.runtime.sendMessage(msg, r => resolve(r || { ok: false })));
}

// Chime (disintesis di shared/chime.js), diulang selama CHIME_DETIK lalu memudar.
const CHIME_DETIK = 5;
let chimeCtx = null;
function chime(id) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    chimeCtx = ctx;
    const play = () => {
      if (play.done) return; play.done = true;
      globalThis.SawitChime.play(ctx, id, CHIME_DETIK);
      setTimeout(() => { try { ctx.close(); } catch (e) { /* abaikan */ } }, (CHIME_DETIK + 0.5) * 1000);
    };
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => { if (ctx.state === 'running') play(); });
      // kalau autoplay diblokir, bunyi saat klik pertama
      const once = () => { ctx.resume().then(play); document.removeEventListener('pointerdown', once); };
      document.addEventListener('pointerdown', once);
    } else play();
  } catch (e) { /* tanpa suara */ }
}

function petals(colors) {
  const box = document.getElementById('petals');
  for (let i = 0; i < 26; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    p.style.animationDelay = (0.6 + Math.random() * 3) + 's';
    p.style.transform = 'scale(' + (0.6 + Math.random()) + ')';
    box.appendChild(p);
  }
}

let left = DURASI;
let timer = null;
const ringFg = document.getElementById('ringFg');
const countEl = document.getElementById('count');
function tick() {
  left -= 1;
  countEl.textContent = Math.max(0, left);
  ringFg.style.strokeDashoffset = String(100.5 * (1 - left / DURASI));
  if (left <= 0) go();
}
function go() {
  clearTimeout(timer); clearInterval(tick._i);
  if (chimeCtx) { try { chimeCtx.close(); } catch (e) { /* abaikan */ } }
  document.body.classList.add('leaving');
  setTimeout(() => location.replace(URL_RIWAYAT), 420);
}
document.getElementById('go').addEventListener('click', go);
document.getElementById('snooze').addEventListener('click', async () => {
  clearInterval(tick._i);
  await send({ type: 'snooze' });
  await send({ type: 'unfullscreen' });
  document.getElementById('title').textContent = 'Oke, ditunda dulu';
  document.getElementById('sub').textContent = 'Nanti pengingatnya balik lagi. Jangan lupa ya.';
  document.querySelector('.actions').style.display = 'none';
  document.querySelector('.ring').style.display = 'none';
  setTimeout(() => { if (history.length > 1) history.back(); else location.replace(URL_RIWAYAT.replace('#sawit', '')); }, 1600);
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') go(); if (e.key === 'Escape') document.getElementById('snooze').click(); });

(async () => {
  const TH = globalThis.SawitThemes;
  const r = await send({ type: 'getState' });
  const s = (r.ok && r.state.settings) || U.DEFAULT_SETTINGS;
  const { theme } = TH.applyTheme(document.documentElement, s);
  document.body.classList.toggle('sway', !!theme.sway);
  document.body.classList.toggle('simpel', theme.id === 'simpel');
  const size = theme.id === 'simpel' ? 160 : 260;
  const idle = globalThis.SawitIdle.attach(document.getElementById('tree'), { theme, mood: 'happy', size });
  const jam = U.pad(s.hour) + '.' + U.pad(s.minute);
  document.getElementById('kicker').textContent = reason === 'nag' ? 'Masih belum diisi' : reason === 'tes' ? 'Tes pengingat' : 'Jam ' + jam;
  if (reason === 'nag') {
    document.getElementById('title').textContent = theme.id === 'simpel' ? 'Laporan masih kosong' : TH.tt(theme, '{N} masih nungguin');
    document.getElementById('sub').textContent = 'Laporan hari ini belum terkirim. Lima menit aja, yuk.';
    idle.update('worried');
  } else if (s.nickname) {
    document.getElementById('title').textContent = 'Hai ' + s.nickname + ', waktunya cerita';
  }
  if (theme.id !== 'simpel') document.getElementById('sub').textContent = TH.tt(theme, 'Hari ini ngapain aja? Ceritain dikit, sisanya {n} yang rangkai.');
  if (r.ok && r.state.streak > 1) document.getElementById('streak').textContent = '🌱 Streak ' + r.state.streak + ' hari, jangan putus.';
  if (s.sound !== false) setTimeout(() => chime((s.chime && s.chime !== 'auto') ? s.chime : (theme.chime || 'marimba')), 500);
  petals(theme.flowers);
  countEl.textContent = DURASI;
  timer = setTimeout(() => { tick._i = setInterval(tick, 1000); }, 1800);
})();
