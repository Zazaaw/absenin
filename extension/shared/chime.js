// Suara chime disintesis dengan Web Audio, tanpa file audio. Dipakai splash dan halaman pengaturan.
(function (g) {
  const CHIMES = [
    { id: 'marimba', nama: 'Marimba lembut', deskripsi: 'Tiga nada hangat, kayak kotak musik.' },
    { id: 'lonceng', nama: 'Lonceng', deskripsi: 'Dentang pelan yang panjang, tenang.' },
    { id: 'retro', nama: 'Retro 8-bit', deskripsi: 'Arpeggio game jadul, cepat dan ceria.' },
    { id: 'drum', nama: 'Drum pendek', deskripsi: 'Ketukan kick dan snare, tegas.' }
  ];

  function tone(ctx, master, f, t, dur, type, peak, partials) {
    (partials || [[1, 1]]).forEach(([mult, gain]) => {
      const o = ctx.createOscillator();
      const gn = ctx.createGain();
      o.type = type;
      o.frequency.value = f * mult;
      gn.gain.setValueAtTime(0, t);
      gn.gain.linearRampToValueAtTime(peak * gain, t + 0.015);
      gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(gn); gn.connect(master);
      o.start(t); o.stop(t + dur + 0.05);
    });
  }
  function noise(ctx, master, t, dur, peak, hp) {
    const len = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const flt = ctx.createBiquadFilter(); flt.type = 'highpass'; flt.frequency.value = hp || 1800;
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(peak, t);
    gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(flt); flt.connect(gn); gn.connect(master);
    src.start(t); src.stop(t + dur + 0.02);
  }
  function kick(ctx, master, t, peak) {
    const o = ctx.createOscillator();
    const gn = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
    gn.gain.setValueAtTime(peak, t);
    gn.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(gn); gn.connect(master);
    o.start(t); o.stop(t + 0.35);
  }

  const PATTERNS = {
    marimba: { loop: 1.3, play(ctx, m, base) {
      [[659.25, 0], [783.99, 0.22], [1046.5, 0.44], [783.99, 0.78], [659.25, 1.0]].forEach(([f, t0]) => {
        tone(ctx, m, f, base + t0, 0.9, 'sine', 1);
        tone(ctx, m, f, base + t0, 0.5, 'triangle', 0.15, [[2, 1]]);
      });
    } },
    lonceng: { loop: 2.7, play(ctx, m, base) {
      [[523.25, 0], [659.25, 0.9], [783.99, 1.8]].forEach(([f, t0]) => {
        tone(ctx, m, f, base + t0, 1.9, 'sine', 0.9, [[1, 1], [2.4, 0.35], [3.1, 0.2], [4.2, 0.1]]);
      });
    } },
    retro: { loop: 0.9, play(ctx, m, base) {
      [[659.25, 0], [783.99, 0.15], [987.77, 0.3], [1318.5, 0.45], [987.77, 0.6]].forEach(([f, t0]) => {
        tone(ctx, m, f, base + t0, 0.14, 'square', 0.25);
      });
    } },
    drum: { loop: 1.0, play(ctx, m, base) {
      kick(ctx, m, base, 1); noise(ctx, m, base + 0.25, 0.12, 0.5); kick(ctx, m, base + 0.5, 0.9); kick(ctx, m, base + 0.625, 0.6); noise(ctx, m, base + 0.75, 0.14, 0.55);
      noise(ctx, m, base + 0.125, 0.04, 0.12, 6000); noise(ctx, m, base + 0.375, 0.04, 0.12, 6000); noise(ctx, m, base + 0.875, 0.04, 0.12, 6000);
    } }
  };

  // Jadwalkan chime `id` selama `seconds` detik di `ctx`, memudar di akhir.
  function play(ctx, id, seconds) {
    const p = PATTERNS[id] || PATTERNS.marimba;
    const master = ctx.createGain();
    const vol = id === 'retro' ? 0.09 : id === 'drum' ? 0.22 : 0.18;
    const now = ctx.currentTime;
    master.gain.setValueAtTime(vol, now);
    master.gain.setValueAtTime(vol, now + Math.max(0.2, seconds - 1.0));
    master.gain.linearRampToValueAtTime(0.0001, now + seconds);
    master.connect(ctx.destination);
    for (let rep = 0; rep * p.loop < seconds; rep++) p.play(ctx, master, now + rep * p.loop);
  }

  g.SawitChime = { CHIMES, play };
})(globalThis);
