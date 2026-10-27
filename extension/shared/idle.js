// Maskot idle: kedip acak, napas pelan, nguap kalau malam, melirik ke arah kursor.
// Bekerja untuk semua karakter: "kedip" memakai gambar mood 'sleep' tanpa huruf z.
(function (g) {
  const STYLE_ID = 'sawit-idle-style';
  const CSS = '.sawit-breath{display:inline-block;transform-origin:50% 92%;will-change:transform;animation:sawitBreathe 3.4s ease-in-out infinite}.sawit-idle.paused .sawit-breath{animation-play-state:paused}' +
    '@keyframes sawitBreathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.025) scaleX(.992)}}' +
    '.sawit-idle{display:inline-block;transform-origin:50% 90%;transition:transform .35s ease-out}';

  function ensureStyle(root) {
    const host = root || document.head;
    if (host.querySelector && host.querySelector('#' + STYLE_ID)) return;
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = CSS;
    host.appendChild(st);
  }

  function blinkSVG(theme, size) {
    let s = theme.char('sleep', size);
    s = s.replace(/<text[^>]*>z<\/text>/g, '');
    s = s.replace(/transform="translate\(60 100\) scale\(\.8\) translate\(-60 -100\)"/, 'transform=""');
    return s;
  }

  // opts: { theme, mood, size, root (shadowRoot atau document.head), doc (untuk mousemove) }
  function attach(el, opts) {
    ensureStyle(opts.root);
    const st = { theme: opts.theme, mood: opts.mood || 'happy', size: opts.size || 64, timers: [], dead: false };
    el.classList.add('sawit-idle');
    const render = (m) => {
      const svg = m === 'blink' ? blinkSVG(st.theme, st.size) : st.theme.char(m, st.size);
      el.innerHTML = '<span class="sawit-breath">' + svg + '</span>';
    };
    render(st.mood);

    const later = (fn, ms) => { const t = setTimeout(() => { if (!st.dead) fn(); }, ms); st.timers.push(t); return t; };
    const blink = () => { render('blink'); later(() => render(st.mood), 130); };
    const scheduleBlink = () => later(() => {
      if (st.mood !== 'sleep' && st.mood !== 'wilted') {
        blink();
        if (Math.random() < 0.25) later(blink, 300);
      }
      scheduleBlink();
    }, 2500 + Math.random() * 4500);
    scheduleBlink();

    // nguap kalau sudah malam
    const yawn = setInterval(() => {
      if (st.dead) return;
      const h = new Date().getHours();
      if ((h >= 21 || h < 6) && st.mood === 'happy' && Math.random() < 0.5) {
        render('sleep');
        later(() => render(st.mood), 1400);
      }
    }, 15000);
    st.timers.push(yawn);

    // melirik ke arah kursor: satu listener global, dihitung di rAF, hanya saat elemen terlihat
    const doc = opts.doc || document;
    const P = g.__sawitPointer || (g.__sawitPointer = { x: -1, y: -1, t: 0 });
    if (!P.bound) {
      P.bound = true;
      doc.addEventListener('mousemove', (e) => { P.x = e.clientX; P.y = e.clientY; P.t = performance.now(); }, { passive: true });
      doc.addEventListener('mouseleave', () => { P.x = -1; P.t = performance.now(); }, { passive: true });
    }
    let visible = true, raf = 0, lastSeen = -1;
    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((en) => { visible = en[0].isIntersecting; el.classList.toggle('paused', !visible); }, { threshold: 0 }) : null;
    if (io) io.observe(el);
    const loop = () => {
      if (st.dead) return;
      raf = requestAnimationFrame(loop);
      if (!visible || P.t === lastSeen) return;
      lastSeen = P.t;
      if (P.x < 0) { el.style.transform = ''; return; }
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      const dx = Math.max(-1, Math.min(1, (P.x - (r.left + r.width / 2)) / 320));
      const dy = Math.max(-1, Math.min(1, (P.y - (r.top + r.height / 2)) / 320));
      el.style.transform = 'translate(' + (dx * 3).toFixed(1) + 'px,' + (dy * 2).toFixed(1) + 'px) rotate(' + (dx * 3).toFixed(1) + 'deg)';
    };
    raf = requestAnimationFrame(loop);

    return {
      update(m, theme, size) {
        if (theme) st.theme = theme;
        if (size) st.size = size;
        if (m) st.mood = m;
        render(st.mood);
      },
      destroy() {
        st.dead = true;
        st.timers.forEach(t => { clearTimeout(t); clearInterval(t); });
        cancelAnimationFrame(raf);
        if (io) io.disconnect();
      }
    };
  }

  g.SawitIdle = { attach, blinkSVG };
})(globalThis);
