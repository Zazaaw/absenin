// Util bersama: tanggal, hari kerja, streak. Dipakai background, popup, options, content.
(function (g) {
  const DEFAULT_SETTINGS = {
    hour: 16,
    minute: 0,
    intervalMin: 10,
    snoozeMin: 15,
    fullscreen: true,
    splash: true,
    sound: true,
    theme: 'simpel',
    nightMode: 'auto',
    chime: 'auto',
    badge: true,
    mode: 'lisensi',
    telemetry: true,
    apiBase: 'http://localhost:3000',
    historyHints: false,
    model: 'gpt-4o-mini',
    templateId: 'teknis',
    nickname: '',
    extraHolidays: [],
    customTemplates: []
  };
  const DONE = ['done', 'waiting', 'submitted'];

  function pad(n) { return String(n).padStart(2, '0'); }
  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseKey(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }
  function isWeekend(d) { const x = d.getDay(); return x === 0 || x === 6; }
  function isHoliday(key, settings, history) {
    return (settings.extraHolidays || []).includes(key) || (history[key] && history[key].status === 'libur');
  }
  function isWorkday(key, settings, history) {
    return !isWeekend(parseKey(key)) && !isHoliday(key, settings, history);
  }
  function isDone(entry) { return !!entry && DONE.includes(entry.status); }

  // Streak = hari kerja berturut-turut yang laporannya terkirim, berakhir hari ini atau kemarin.
  function computeStreak(history, settings, today) {
    const d = new Date(today || new Date());
    let streak = 0;
    if (!isDone(history[dateKey(d)])) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 400; i++) {
      const k = dateKey(d);
      if (isWorkday(k, settings, history)) {
        if (isDone(history[k])) streak++; else break;
      }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  function allTemplates(settings) {
    const custom = (settings.customTemplates || []).map(t => ({ ...t, emoji: t.emoji || '✨', custom: true }));
    return [...(g.SAWIT_TEMPLATES || []), ...custom];
  }

  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  function formatLong(d) { return HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear(); }

  g.SawitUtil = { DEFAULT_SETTINGS, DONE, pad, dateKey, parseKey, isWeekend, isHoliday, isWorkday, isDone, computeStreak, allTemplates, HARI, BULAN, formatLong };
})(globalThis);
