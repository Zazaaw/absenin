// Tema: palet warna + karakter. Dipakai popup, options, splash, content, background.
(function (g) {
  const INK = '#4A4458';

  // ---------- karakter ----------
  function kucingSVG(mood, size) {
    const sad = mood === 'wilted', worried = mood === 'worried', sleep = mood === 'sleep';
    const fur = sad ? '#E3DEE4' : '#F6E9EC', furDark = sad ? '#CFC8D2' : '#F1D5DC', inner = '#F7B5C4';
    const earL = sad ? 'rotate(-28 36 48)' : '', earR = sad ? 'rotate(28 84 48)' : '';
    let face;
    if (sleep) {
      face = `<path d="M46 66 q5 4 10 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M64 66 q5 4 10 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
        `<text x="84" y="40" font-size="11" font-weight="700" fill="${INK}" font-family="sans-serif">z</text><text x="92" y="32" font-size="8" font-weight="700" fill="${INK}" font-family="sans-serif">z</text>`;
    } else if (worried) {
      face = `<circle cx="50" cy="66" r="4" fill="${INK}"/><circle cx="70" cy="66" r="4" fill="${INK}"/><circle cx="51.5" cy="64.5" r="1.3" fill="#fff"/><circle cx="71.5" cy="64.5" r="1.3" fill="#fff"/>` +
        `<path d="M44 58 l8 2" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path d="M76 58 l-8 2" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>` +
        `<ellipse cx="60" cy="77" rx="3" ry="2" fill="${INK}"/><path d="M86 60 q4 7 0 9 q-4 -2 0 -9z" fill="#9CC9EA"/>`;
    } else if (sad) {
      face = `<path d="M45 66 q5 -4 10 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M65 66 q5 -4 10 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
        `<path d="M54 79 q6 -4 12 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M74 70 q3 6 0 8 q-3 -2 0 -8z" fill="#9CC9EA"/>`;
    } else {
      face = `<path d="M45 65 q5 -5 10 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M65 65 q5 -5 10 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
        `<path d="M55 74 q5 5 10 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M60 72 v3" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>` +
        `<circle cx="42" cy="73" r="4" fill="#F7B5A3" opacity=".7"/><circle cx="78" cy="73" r="4" fill="#F7B5A3" opacity=".7"/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Momo ${mood}">
      <ellipse cx="60" cy="110" rx="30" ry="5" fill="#000" opacity=".06"/>
      <ellipse cx="60" cy="94" rx="30" ry="18" fill="${fur}"/>
      <path d="M86 92 q16 -4 14 -18" stroke="${furDark}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <g transform="${earL}"><path d="M30 60 L36 30 L54 50 Z" fill="${fur}"/><path d="M36 56 L39 40 L49 51 Z" fill="${inner}"/></g>
      <g transform="${earR}"><path d="M90 60 L84 30 L66 50 Z" fill="${fur}"/><path d="M84 56 L81 40 L71 51 Z" fill="${inner}"/></g>
      <ellipse cx="60" cy="68" rx="32" ry="27" fill="${fur}"/>
      <path d="M28 70 h-12 M28 76 h-13 M92 70 h12 M92 76 h13" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
      ${face}
    </svg>`;
  }

  function kaktusSVG(mood, size) {
    const wilt = mood === 'wilted', worried = mood === 'worried', sleep = mood === 'sleep';
    const body = wilt ? '#B9C7B5' : '#9CCB9F', bodyDark = wilt ? '#A3B19F' : '#79B589';
    const pot = '#F2A07B', potDark = '#D98B66';
    const tilt = wilt ? 'rotate(8 60 90)' : '';
    let face;
    if (sleep) {
      face = `<path d="M50 60 q4 3 8 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M62 60 q4 3 8 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M56 68 q4 2 8 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>` +
        `<text x="80" y="42" font-size="11" font-weight="700" fill="${INK}" font-family="sans-serif">z</text><text x="88" y="34" font-size="8" font-weight="700" fill="${INK}" font-family="sans-serif">z</text>`;
    } else if (worried) {
      face = `<circle cx="54" cy="60" r="2.6" fill="${INK}"/><circle cx="66" cy="60" r="2.6" fill="${INK}"/><path d="M49 53 l8 3" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path d="M71 53 l-8 3" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>` +
        `<ellipse cx="60" cy="69" rx="3.5" ry="2.5" fill="${INK}"/><path d="M78 50 q4 7 0 9 q-4 -2 0 -9z" fill="#9CC9EA"/>`;
    } else if (wilt) {
      face = `<path d="M50 58 q4 -3 8 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M62 58 q4 -3 8 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M54 70 q6 -4 12 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    } else {
      face = `<circle cx="54" cy="60" r="2.8" fill="${INK}"/><circle cx="66" cy="60" r="2.8" fill="${INK}"/><path d="M53 67 q7 6 14 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
        `<circle cx="47" cy="66" r="3" fill="#F7B5A3" opacity=".7"/><circle cx="73" cy="66" r="3" fill="#F7B5A3" opacity=".7"/>`;
    }
    const flower = (wilt || sleep) ? '' : `<circle cx="60" cy="24" r="5" fill="#F7B5C4"/><circle cx="53" cy="28" r="5" fill="#F7B5C4"/><circle cx="67" cy="28" r="5" fill="#F7B5C4"/><circle cx="56" cy="34" r="5" fill="#F7B5C4"/><circle cx="64" cy="34" r="5" fill="#F7B5C4"/><circle cx="60" cy="29" r="3.5" fill="#FFE7A8"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Kaktus ${mood}">
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".06"/>
      <g transform="${tilt}">
        <rect x="44" y="30" width="32" height="58" rx="16" fill="${body}"/>
        <rect x="26" y="44" width="14" height="30" rx="7" fill="${body}"/><rect x="34" y="60" width="12" height="10" fill="${body}"/>
        <rect x="80" y="38" width="14" height="30" rx="7" fill="${body}"/><rect x="74" y="54" width="12" height="10" fill="${body}"/>
        <path d="M52 40 v34 M60 36 v40 M68 40 v34" stroke="${bodyDark}" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>
        ${flower}
        ${face}
      </g>
      <path d="M40 86 h40 l-4 24 h-32 z" fill="${pot}"/>
      <rect x="36" y="82" width="48" height="8" rx="3" fill="${potDark}"/>
    </svg>`;
  }

  function simpelSVG(mood, size) {
    const col = mood === 'happy' ? '#CFE0D4' : mood === 'worried' ? '#E6E9EE' : mood === 'wilted' ? '#EBD8D3' : '#DADEE4';
    const ink = mood === 'happy' ? '#2F5438' : mood === 'wilted' ? '#8A4B3C' : '#3B4452';
    let glyph;
    if (mood === 'happy') glyph = `<path d="M44 62 l11 11 l21 -24" stroke="${ink}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    else if (mood === 'sleep') glyph = `<path d="M68 36 a24 24 0 1 0 16 40 a20 20 0 0 1 -16 -40z" fill="${ink}"/>`;
    else glyph = `<circle cx="60" cy="42" r="5" fill="${ink}"/><rect x="55" y="54" width="10" height="30" rx="5" fill="${ink}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Status ${mood}">
      <circle cx="60" cy="60" r="44" fill="${col}"/>${glyph}</svg>`;
  }

  function roboSVG(mood, size) {
    const off = mood === 'wilted', worried = mood === 'worried', sleep = mood === 'sleep';
    const body = off ? '#C7CCD3' : '#C9D3E0', bodyDark = off ? '#A9AFB8' : '#A7B5C8', screen = off ? '#4A5160' : '#3B4A63', eye = off ? '#8E97A6' : '#9FE1CB';
    let eyes;
    if (sleep) eyes = `<path d="M46 60 h10 M64 60 h10" stroke="${eye}" stroke-width="3" stroke-linecap="round"/><text x="84" y="40" font-size="11" font-weight="700" fill="${INK}" font-family="sans-serif">z</text><text x="92" y="32" font-size="8" font-weight="700" fill="${INK}" font-family="sans-serif">z</text>`;
    else if (worried) eyes = `<circle cx="51" cy="60" r="5" fill="${eye}"/><circle cx="69" cy="60" r="5" fill="${eye}"/><path d="M45 52 l8 3 M75 52 l-8 3" stroke="${eye}" stroke-width="2.5" stroke-linecap="round"/><path d="M48 70 h24" stroke="${eye}" stroke-width="2.5" stroke-linecap="round"/><path d="M88 50 q4 7 0 9 q-4 -2 0 -9z" fill="#9CC9EA"/>`;
    else if (off) eyes = `<path d="M46 56 l8 8 M54 56 l-8 8 M66 56 l8 8 M74 56 l-8 8" stroke="${eye}" stroke-width="2.5" stroke-linecap="round"/><path d="M50 72 q10 -5 20 0" stroke="${eye}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    else eyes = `<path d="M45 61 q6 -8 12 0" stroke="${eye}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M63 61 q6 -8 12 0" stroke="${eye}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M50 70 q10 7 20 0" stroke="${eye}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Robo ${mood}">
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".06"/>
      <path d="M60 36 V 22" stroke="${bodyDark}" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="18" r="5" fill="${off ? '#A9AFB8' : '#F2A07B'}"/>
      <rect x="30" y="36" width="60" height="48" rx="14" fill="${body}"/>
      <rect x="38" y="44" width="44" height="34" rx="9" fill="${screen}"/>
      <rect x="22" y="52" width="8" height="16" rx="4" fill="${bodyDark}"/><rect x="90" y="52" width="8" height="16" rx="4" fill="${bodyDark}"/>
      <rect x="40" y="86" width="40" height="22" rx="8" fill="${body}"/>
      <rect x="46" y="92" width="28" height="4" rx="2" fill="${bodyDark}"/><rect x="46" y="100" width="18" height="4" rx="2" fill="${bodyDark}"/>
      <rect x="22" y="88" width="14" height="8" rx="4" fill="${bodyDark}"/><rect x="84" y="88" width="14" height="8" rx="4" fill="${bodyDark}"/>
      ${eyes}
    </svg>`;
  }

  function astroSVG(mood, size) {
    const low = mood === 'wilted', worried = mood === 'worried', sleep = mood === 'sleep';
    const suit = '#F3F5F8', suitDark = '#C9D3E0', visor = low ? '#4B5466' : '#2E3D5C', trim = '#8EC9D8';
    let face;
    if (sleep) face = `<path d="M50 62 q4 3 8 0 M62 62 q4 3 8 0" stroke="#F3F5F8" stroke-width="2.2" fill="none" stroke-linecap="round"/><text x="86" y="36" font-size="11" font-weight="700" fill="${INK}" font-family="sans-serif">z</text><text x="94" y="28" font-size="8" font-weight="700" fill="${INK}" font-family="sans-serif">z</text>`;
    else if (worried) face = `<circle cx="54" cy="62" r="2.8" fill="#F3F5F8"/><circle cx="66" cy="62" r="2.8" fill="#F3F5F8"/><path d="M49 55 l8 3 M71 55 l-8 3" stroke="#F3F5F8" stroke-width="2" stroke-linecap="round"/><ellipse cx="60" cy="71" rx="3" ry="2.2" fill="#F3F5F8"/><path d="M80 48 q4 7 0 9 q-4 -2 0 -9z" fill="#9CC9EA"/>`;
    else if (low) face = `<path d="M50 61 q4 -3 8 0 M62 61 q4 -3 8 0" stroke="#F3F5F8" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M53 73 q7 -5 14 0" stroke="#F3F5F8" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    else face = `<path d="M49 62 q5 -6 10 0 M61 62 q5 -6 10 0" stroke="#F3F5F8" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M53 69 q7 6 14 0" stroke="#F3F5F8" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Astro ${mood}">
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".06"/>
      <circle cx="30" cy="30" r="2" fill="${trim}"/><circle cx="92" cy="26" r="1.6" fill="${trim}"/><circle cx="98" cy="68" r="1.4" fill="${trim}"/>
      <rect x="32" y="84" width="56" height="26" rx="12" fill="${suit}"/>
      <rect x="22" y="88" width="14" height="10" rx="5" fill="${suitDark}"/><rect x="84" y="88" width="14" height="10" rx="5" fill="${suitDark}"/>
      <rect x="48" y="90" width="24" height="6" rx="3" fill="${trim}"/>
      <circle cx="60" cy="56" r="30" fill="${suit}"/>
      <circle cx="60" cy="58" r="22" fill="${visor}"/>
      <path d="M44 48 q6 -8 16 -8" stroke="#F3F5F8" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>
      ${face}
    </svg>`;
  }

  function beruangSVG(mood, size) {
    const sad = mood === 'wilted', worried = mood === 'worried', sleep = mood === 'sleep';
    const fur = sad ? '#C9B9A7' : '#C9A27E', furDark = sad ? '#B5A594' : '#B08A66', muzzle = '#EBD6BC';
    let face;
    if (sleep) face = `<path d="M46 60 q4 3 8 0 M66 60 q4 3 8 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/><text x="88" y="40" font-size="11" font-weight="700" fill="${INK}" font-family="sans-serif">z</text><text x="96" y="32" font-size="8" font-weight="700" fill="${INK}" font-family="sans-serif">z</text>`;
    else if (worried) face = `<circle cx="50" cy="60" r="3" fill="${INK}"/><circle cx="70" cy="60" r="3" fill="${INK}"/><path d="M44 53 l8 3 M76 53 l-8 3" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path d="M90 52 q4 7 0 9 q-4 -2 0 -9z" fill="#9CC9EA"/>`;
    else if (sad) face = `<path d="M45 60 q5 -4 10 0 M65 60 q5 -4 10 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    else face = `<path d="M45 60 q5 -5 10 0 M65 60 q5 -5 10 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="42" cy="68" r="4" fill="#F7B5A3" opacity=".6"/><circle cx="78" cy="68" r="4" fill="#F7B5A3" opacity=".6"/>`;
    const mouth = sad ? `<path d="M55 80 q5 -3 10 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>` : worried ? `<ellipse cx="60" cy="80" rx="3" ry="2" fill="${INK}"/>` : `<path d="M55 78 q5 4 10 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Baro ${mood}">
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".06"/>
      <ellipse cx="60" cy="96" rx="30" ry="16" fill="${fur}"/>
      <ellipse cx="60" cy="98" rx="16" ry="9" fill="${muzzle}"/>
      <circle cx="34" cy="40" r="11" fill="${fur}"/><circle cx="34" cy="40" r="5" fill="${muzzle}"/>
      <circle cx="86" cy="40" r="11" fill="${fur}"/><circle cx="86" cy="40" r="5" fill="${muzzle}"/>
      <circle cx="60" cy="62" r="30" fill="${fur}"/>
      <ellipse cx="60" cy="74" rx="13" ry="9" fill="${muzzle}"/>
      <ellipse cx="60" cy="70" rx="4.5" ry="3.2" fill="${INK}"/>
      ${mouth}
      ${face}
      <path d="M30 62 q-4 6 0 12" stroke="${furDark}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>
    </svg>`;
  }

  function baraSVG(mood, size) {
    const low = mood === 'wilted', worried = mood === 'worried', sleep = mood === 'sleep';
    const outer = low ? '#6B7A99' : '#FF7A1A', mid = low ? '#8FA3C7' : '#FFA23A', core = low ? '#C9D6EE' : '#FFD166';
    const ink = '#2B1A0E';
    let face;
    if (sleep) face = `<path d="M50 76 q4 3 8 0 M62 76 q4 3 8 0" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/><text x="84" y="48" font-size="11" font-weight="700" fill="#FFD166" font-family="sans-serif">z</text><text x="92" y="40" font-size="8" font-weight="700" fill="#FFD166" font-family="sans-serif">z</text>`;
    else if (worried) face = `<circle cx="54" cy="76" r="3" fill="${ink}"/><circle cx="66" cy="76" r="3" fill="${ink}"/><path d="M48 69 l8 3 M72 69 l-8 3" stroke="${ink}" stroke-width="2" stroke-linecap="round"/><ellipse cx="60" cy="86" rx="3" ry="2.2" fill="${ink}"/><path d="M82 62 q4 7 0 9 q-4 -2 0 -9z" fill="#9CC9EA"/>`;
    else if (low) face = `<path d="M50 75 q4 -3 8 0 M62 75 q4 -3 8 0" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M53 88 q7 -5 14 0" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    else face = `<path d="M49 76 q5 -6 10 0 M61 76 q5 -6 10 0" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M52 84 q8 7 16 0" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    const scale = sleep ? 'translate(60 100) scale(.8) translate(-60 -100)' : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Bara ${mood}">
      <ellipse cx="60" cy="112" rx="26" ry="5" fill="#000" opacity=".25"/>
      <g transform="${scale}">
        <path d="M60 14 C 48 34, 28 44, 30 72 C 31 92, 44 106, 60 106 C 76 106, 90 92, 90 72 C 91 52, 74 46, 72 30 C 70 42, 62 44, 60 14 Z" fill="${outer}"/>
        <path d="M60 40 C 52 54, 42 60, 43 76 C 44 90, 50 100, 60 100 C 70 100, 77 90, 77 76 C 78 64, 68 58, 66 48 C 65 56, 61 56, 60 40 Z" fill="${mid}"/>
        <path d="M60 60 C 56 68, 50 72, 51 82 C 52 90, 55 96, 60 96 C 65 96, 68 90, 69 82 C 70 74, 64 70, 60 60 Z" fill="${core}"/>
        ${face}
      </g>
    </svg>`;
  }

  function hiuSVG(mood, size) {
    const low = mood === 'wilted', worried = mood === 'worried', sleep = mood === 'sleep';
    const body = low ? '#8B97A8' : '#5C8DB8', belly = '#E9F2F8', fin = low ? '#73808F' : '#4A7AA3';
    const ink = '#0F2A3F';
    let face;
    if (sleep) face = `<path d="M62 56 q4 3 8 0" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/><text x="86" y="40" font-size="11" font-weight="700" fill="${ink}" font-family="sans-serif">z</text><text x="94" y="32" font-size="8" font-weight="700" fill="${ink}" font-family="sans-serif">z</text>`;
    else if (worried) face = `<circle cx="66" cy="56" r="4" fill="#fff"/><circle cx="67" cy="56" r="2.2" fill="${ink}"/><path d="M60 49 l10 3" stroke="${ink}" stroke-width="2" stroke-linecap="round"/><path d="M84 46 q4 7 0 9 q-4 -2 0 -9z" fill="#9CC9EA"/>`;
    else if (low) face = `<path d="M62 55 q4 -3 8 0" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    else face = `<circle cx="66" cy="56" r="4" fill="#fff"/><circle cx="67" cy="57" r="2.2" fill="${ink}"/>`;
    const mouth = low ? `<path d="M70 72 q8 -5 16 0" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>` :
      `<path d="M66 70 q10 8 22 0" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M71 71 l2 4 l2 -4 M77 72 l2 4 l2 -4" stroke="#fff" stroke-width="1.5" fill="#fff"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Hiu ${mood}">
      <ellipse cx="60" cy="108" rx="30" ry="5" fill="#000" opacity=".15"/>
      <path d="M18 64 L 6 44 L 10 70 L 6 90 Z" fill="${fin}"/>
      <path d="M50 44 L 58 18 L 70 44 Z" fill="${fin}"/>
      <ellipse cx="58" cy="66" rx="40" ry="24" fill="${body}"/>
      <path d="M26 72 Q 58 96, 96 74 Q 70 84, 26 72 Z" fill="${belly}"/>
      <path d="M40 84 L 30 100 L 50 90 Z" fill="${fin}"/>
      <path d="M92 60 q6 2 4 8" stroke="${ink}" stroke-width="1.5" fill="none" opacity=".4"/>
      ${mouth}
      ${face}
    </svg>`;
  }

  function harimauSVG(mood, size) {
    const low = mood === 'wilted', worried = mood === 'worried', sleep = mood === 'sleep';
    const fur = low ? '#C9A27E' : '#F28C28', stripe = '#1F1A17', muzzle = '#FFF3E0';
    const ink = '#1F1A17';
    let face;
    if (sleep) face = `<path d="M44 58 q5 3 10 0 M66 58 q5 3 10 0" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/><text x="92" y="36" font-size="11" font-weight="700" fill="${ink}" font-family="sans-serif">z</text><text x="100" y="28" font-size="8" font-weight="700" fill="${ink}" font-family="sans-serif">z</text>`;
    else if (worried) face = `<circle cx="49" cy="58" r="3.5" fill="${ink}"/><circle cx="71" cy="58" r="3.5" fill="${ink}"/><path d="M42 50 l10 3 M78 50 l-10 3" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/><path d="M92 50 q4 7 0 9 q-4 -2 0 -9z" fill="#9CC9EA"/>`;
    else if (low) face = `<path d="M44 58 q5 -4 10 0 M66 58 q5 -4 10 0" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    else face = `<circle cx="49" cy="58" r="3.5" fill="${ink}"/><circle cx="71" cy="58" r="3.5" fill="${ink}"/><circle cx="50" cy="57" r="1.2" fill="#fff"/><circle cx="72" cy="57" r="1.2" fill="#fff"/>`;
    const mouth = low ? `<path d="M54 80 q6 -4 12 0" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>` : worried ? `<ellipse cx="60" cy="80" rx="3" ry="2" fill="${ink}"/>` : `<path d="M52 77 q4 5 8 0 q4 5 8 0" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Harimau ${mood}">
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".2"/>
      <ellipse cx="60" cy="98" rx="30" ry="14" fill="${fur}"/>
      <path d="M40 92 l4 10 M52 90 l2 12 M68 90 l-2 12 M80 92 l-4 10" stroke="${stripe}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="40" r="11" fill="${fur}"/><circle cx="32" cy="40" r="5" fill="${muzzle}"/>
      <circle cx="88" cy="40" r="11" fill="${fur}"/><circle cx="88" cy="40" r="5" fill="${muzzle}"/>
      <circle cx="60" cy="62" r="31" fill="${fur}"/>
      <path d="M60 32 v10 M48 36 l4 10 M72 36 l-4 10 M34 56 l10 2 M86 56 l-10 2 M36 70 l9 -2 M84 70 l-9 -2" stroke="${stripe}" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="60" cy="76" rx="14" ry="10" fill="${muzzle}"/>
      <path d="M55 70 l5 4 l5 -4 z" fill="${ink}"/>
      ${mouth}
      ${face}
    </svg>`;
  }

  function tegasSVG(mood, size) {
    const col = mood === 'wilted' ? '#E63946' : '#FFD400';
    const ink = '#111318';
    let glyph;
    if (mood === 'happy') glyph = `<path d="M42 62 l12 12 l24 -26" stroke="${ink}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    else if (mood === 'sleep') glyph = `<path d="M68 36 a24 24 0 1 0 16 40 a20 20 0 0 1 -16 -40z" fill="${ink}"/>`;
    else glyph = `<rect x="54" y="34" width="12" height="34" rx="6" fill="${ink}"/><circle cx="60" cy="82" r="6" fill="${ink}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Status ${mood}">
      <circle cx="60" cy="60" r="44" fill="${col}"/>${glyph}</svg>`;
  }


  // ---------- ikon kehadiran di kalender (per tema) ----------
  const MARKS = {
    sun: c => '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="5" fill="' + c + '"/><g stroke="' + c + '" stroke-width="2" stroke-linecap="round"><path d="M12 3v3M4.5 6.5l2 2M19.5 6.5l-2 2M2 13h3M19 13h3"/></g><path d="M3 20h18" stroke="' + c + '" stroke-width="2" stroke-linecap="round" opacity=".6"/></svg>',
    flower: c => '<svg viewBox="0 0 24 24"><g fill="' + c + '"><circle cx="12" cy="6.5" r="3.4"/><circle cx="17.5" cy="12" r="3.4"/><circle cx="12" cy="17.5" r="3.4"/><circle cx="6.5" cy="12" r="3.4"/></g><circle cx="12" cy="12" r="3" fill="#FFE7A8"/></svg>',
    check: c => '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="' + c + '"/><path d="M7.5 12.5l3 3 6-7" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    square: c => '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" fill="' + c + '"/><path d="M7.5 12.5l3 3 6-7" stroke="#111318" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bolt: c => '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="' + c + '"/></svg>',
    star: c => '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" fill="' + c + '"/></svg>',
    flame: c => '<svg viewBox="0 0 24 24"><path d="M12 2c1 4-4 6-4 11a4 4 0 0 0 8 0c0-2-1-3-1.5-4 0 2-1 2.5-1.5 2.5C14 9 11 7 12 2z" fill="' + c + '"/><path d="M12 13c-1 1.5-1.5 2.5-1.5 3.5a1.5 1.5 0 0 0 3 0c0-1-.5-2-1.5-3.5z" fill="#FFE7A8"/></svg>',
    wave: c => '<svg viewBox="0 0 24 24"><path d="M2 14c2.5 0 2.5-2.5 5-2.5s2.5 2.5 5 2.5 2.5-2.5 5-2.5 2.5 2.5 5 2.5v3c-2.5 0-2.5-2.5-5-2.5s-2.5 2.5-5 2.5-2.5-2.5-5-2.5S4.5 17 2 17z" fill="' + c + '"/><path d="M2 8c2.5 0 2.5-2.5 5-2.5S9.5 8 12 8s2.5-2.5 5-2.5S19.5 8 22 8v3c-2.5 0-2.5-2.5-5-2.5S14.5 11 12 11 9.5 8.5 7 8.5 4.5 11 2 11z" fill="' + c + '" opacity=".55"/></svg>',
    paw: c => '<svg viewBox="0 0 24 24"><g fill="' + c + '"><ellipse cx="7" cy="8" rx="2.2" ry="2.8"/><ellipse cx="17" cy="8" rx="2.2" ry="2.8"/><ellipse cx="3.8" cy="13" rx="2" ry="2.5"/><ellipse cx="20.2" cy="13" rx="2" ry="2.5"/><path d="M12 11c-3.5 0-6 3-6 5.5 0 2 1.5 3 3 3 1 0 2-.5 3-.5s2 .5 3 .5c1.5 0 3-1 3-3 0-2.5-2.5-5.5-6-5.5z"/></g></svg>',
    claw: c => '<svg viewBox="0 0 24 24"><g fill="' + c + '"><ellipse cx="7" cy="7" rx="2.2" ry="2.8"/><ellipse cx="17" cy="7" rx="2.2" ry="2.8"/><ellipse cx="3.6" cy="12" rx="2" ry="2.5"/><ellipse cx="20.4" cy="12" rx="2" ry="2.5"/><path d="M12 10c-3.5 0-6 3-6 5.5 0 2 1.5 3 3 3 1 0 2-.5 3-.5s2 .5 3 .5c1.5 0 3-1 3-3 0-2.5-2.5-5.5-6-5.5z"/></g><path d="M6.2 3.2l.8 1.6M17.8 3.2l-.8 1.6M2.4 8.6l1.2 1.1M21.6 8.6l-1.2 1.1" stroke="' + c + '" stroke-width="1.4" stroke-linecap="round"/></svg>'
  };


  // Sore: matahari senja di atas garis cakrawala. Mood mengubah tinggi matahari dan wajahnya.
  function soreSVG(mood, size) {
    const low = mood === 'wilted', worried = mood === 'worried', sleep = mood === 'sleep';
    const cy = sleep ? 84 : low ? 76 : 62;                  // makin rendah makin "tenggelam"
    const sun = low ? '#E7A36A' : '#FFB55A', sun2 = low ? '#D98457' : '#FF8E5E', glow = low ? '#C98BD6' : '#FFD3A0';
    const horizon = '#2A2338', sea = '#3B2F55';
    const rays = sleep ? '' : [-60, -30, 0, 30, 60].map(a => `<line x1="60" y1="${cy - 34}" x2="60" y2="${cy - 44}" stroke="${glow}" stroke-width="3" stroke-linecap="round" transform="rotate(${a} 60 ${cy})" opacity="${low ? .5 : .9}"/>`).join('');
    let face;
    if (sleep) face = `<path d="M50 ${cy - 6} q4 3 8 0 M62 ${cy - 6} q4 3 8 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/><text x="82" y="${cy - 30}" font-size="11" font-weight="700" fill="#FFD3A0" font-family="sans-serif">z</text><text x="90" y="${cy - 38}" font-size="8" font-weight="700" fill="#FFD3A0" font-family="sans-serif">z</text>`;
    else if (worried) face = `<circle cx="54" cy="${cy - 4}" r="2.8" fill="${INK}"/><circle cx="66" cy="${cy - 4}" r="2.8" fill="${INK}"/><path d="M49 ${cy - 11} l8 3 M71 ${cy - 11} l-8 3" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><ellipse cx="60" cy="${cy + 5}" rx="3.2" ry="2.3" fill="${INK}"/><path d="M80 ${cy - 14} q4 7 0 9 q-4 -2 0 -9z" fill="#9CC9EA"/>`;
    else if (low) face = `<path d="M50 ${cy - 6} q4 -3 8 0 M62 ${cy - 6} q4 -3 8 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M54 ${cy + 4} q6 -4 12 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    else face = `<path d="M49 ${cy - 4} q5 -6 10 0 M61 ${cy - 4} q5 -6 10 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M53 ${cy + 3} q7 6 14 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="46" cy="${cy + 2}" r="3" fill="#FF8E5E" opacity=".6"/><circle cx="74" cy="${cy + 2}" r="3" fill="#FF8E5E" opacity=".6"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Sore ${mood}">
      <defs><clipPath id="sore-sky-${mood}"><rect x="0" y="0" width="120" height="86"/></clipPath><radialGradient id="sore-g-${mood}"><stop offset="0" stop-color="${sun}"/><stop offset="1" stop-color="${sun2}"/></radialGradient></defs>
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".25"/>
      <g clip-path="url(#sore-sky-${mood})">
        <circle cx="60" cy="${cy}" r="36" fill="${glow}" opacity=".25"/>
        ${rays}
        <circle cx="60" cy="${cy}" r="26" fill="url(#sore-g-${mood})"/>
        ${face}
      </g>
      <path d="M10 86 Q 60 80, 110 86 L 110 106 Q 60 112, 10 106 Z" fill="${sea}"/>
      <path d="M10 86 Q 60 80, 110 86" stroke="${horizon}" stroke-width="3" fill="none"/>
      <path d="M30 94 q8 -3 16 0 M74 96 q8 -3 16 0" stroke="${glow}" stroke-width="2" stroke-linecap="round" opacity=".6"/>
    </svg>`;
  }

  // ---------- palet ----------
  const BASE_LIGHT = {
    bg: '#FFF8F0', paper: '#FFFDF9', ink: '#4A4458', muted: '#8C879A', line: '#EFE7DD',
    hero1: '#FFF1E6', hero2: '#EDE8FB',
    primary: '#B8D8BA', 'primary-ink': '#2F5438',
    secondary: '#D9D2F5', 'secondary-ink': '#3F3772',
    tertiary: '#F3EEE6', 'tertiary-ink': '#6E6880',
    chip: '#FFF1E6', 'chip-ink': '#8A5A3C', 'chip-line': '#F6D9C4',
    accent: '#8E82C9', ok: '#6FA37A', warn: '#B35B3D',
    'done-bg': '#E6F2E7', 'done-ink': '#2F5438', 'pending-bg': '#FFD6C2', 'pending-ink': '#8A5A3C',
    'missed-bg': '#FBE9E2', 'missed-ink': '#B35B3D', 'off-bg': '#F3EFEA', 'off-ink': '#C4BDB6',
    soft: '#F7F2EA', shadow: 'rgba(74,68,88,.18)'
  };
  const BASE_DARK = {
    bg: '#221F2A', paper: '#2C2836', ink: '#F3EEF8', muted: '#A9A3B8', line: '#3E3950',
    hero1: '#352D45', hero2: '#3B2F3F',
    tertiary: '#3A3547', 'tertiary-ink': '#CFC9DC',
    chip: '#3A3547', 'chip-ink': '#E6DFF0', 'chip-line': '#4A4560',
    accent: '#B9AEEB', ok: '#9CCB9F', warn: '#F2A07B',
    'done-bg': '#2E4234', 'done-ink': '#BFE3C6', 'pending-bg': '#4A3A33', 'pending-ink': '#F7C6B0',
    'missed-bg': '#4A3333', 'missed-ink': '#F7B5A3', 'off-bg': '#2F2B3A', 'off-ink': '#6F6980',
    soft: '#332F3F', shadow: 'rgba(0,0,0,.45)'
  };

  const THEMES = [
    {
      id: 'sore', mark: MARKS.sun, kalender: 'Senja', chime: 'lonceng', nama: 'Sore', maskot: 'Sore', Maskot: 'Sore', deskripsi: 'Senja: plum gelap, amber, koral. Matahari kecil yang nungguin jam 16.00.', bold: true,
      light: { bg: '#201A2B', paper: '#2A2338', ink: '#F8EFE4', muted: '#B1A3AD', line: '#3B3148', hero1: '#4A2C3E', hero2: '#2F2650',
        primary: '#FFB55A', 'primary-ink': '#3A2200', secondary: '#F08A6A', 'secondary-ink': '#3A160C', tertiary: '#352D45', 'tertiary-ink': '#EADFD6',
        chip: '#3E2F44', 'chip-ink': '#FFD3A0', 'chip-line': '#5A4560', accent: '#FFC78A', ok: '#9CD67E', warn: '#FF8A80',
        'done-bg': '#3A4A3A', 'done-ink': '#CFEDB8', 'pending-bg': '#5A3A24', 'pending-ink': '#FFD3A0', 'missed-bg': '#4F2E3C', 'missed-ink': '#FFB0BE',
        'off-bg': '#2A2435', 'off-ink': '#6E6478', soft: '#302840', shadow: 'rgba(0,0,0,.5)' },
      dark: { bg: '#17121F', paper: '#201A2B', hero1: '#3A2232', hero2: '#241D40' },
      flowers: ['#FFB55A', '#F08A6A', '#FFD3A0', '#C98BD6', '#9CD67E'],
      char: soreSVG, sway: false
    },
    {
      id: 'simpel', mark: MARKS.check, kalender: 'Kalender', chime: 'marimba', nama: 'Simpel', maskot: 'aku', Maskot: 'Aku', deskripsi: 'Bersih dan netral, tanpa maskot. Abu hangat dengan aksen biru-abu.',
      light: { bg: '#F4F4F2', paper: '#FFFFFF', ink: '#2E3340', muted: '#7C8491', line: '#E3E5E9', hero1: '#ECEDEF', hero2: '#F4F4F2',
        primary: '#C3CDD9', 'primary-ink': '#243041', secondary: '#DADEE4', 'secondary-ink': '#2E3747', tertiary: '#EEF0F2', 'tertiary-ink': '#5B6472',
        chip: '#EEF0F2', 'chip-ink': '#3B4452', 'chip-line': '#DADEE4', accent: '#5B6B85', ok: '#5F9470', warn: '#A8564A',
        'done-bg': '#E3EEE5', 'done-ink': '#2F5438', 'pending-bg': '#E6E9EE', 'pending-ink': '#3B4452', 'missed-bg': '#F3E6E3', 'missed-ink': '#A8564A',
        'off-bg': '#EEEEEC', 'off-ink': '#B9BDC4', soft: '#EEF0F2', shadow: 'rgba(40,46,60,.16)' },
      dark: { bg: '#1E2026', paper: '#272A32', hero1: '#2B2F3A', hero2: '#252830', accent: '#9FB3D1', line: '#363A45', soft: '#2F333D', tertiary: '#343842', chip: '#343842', 'chip-line': '#424754' },
      flowers: ['#C3CDD9', '#CFE0D4', '#DADEE4', '#B9C7D8', '#A9B8C9'],
      char: simpelSVG, sway: false
    },
    {
      id: 'robo', mark: MARKS.bolt, kalender: 'Log', chime: 'retro', nama: 'Robo', maskot: 'Robo', Maskot: 'Robo', deskripsi: 'Slate gelap, mint neon, biru baja. Layar matanya ikut mood.', bold: true,
      light: { bg: '#1A1F27', paper: '#232933', ink: '#EEF2F6', muted: '#97A2B3', line: '#343C4B', hero1: '#273041', hero2: '#213531',
        primary: '#3DDC97', 'primary-ink': '#06281A', secondary: '#7FA7E0', 'secondary-ink': '#0B1A33', tertiary: '#303846', 'tertiary-ink': '#DCE4EE',
        chip: '#2A3341', 'chip-ink': '#9FE1CB', 'chip-line': '#3F4D60', accent: '#5EEAD4', ok: '#3DDC97', warn: '#FF7B7B',
        'done-bg': '#1F4A3A', 'done-ink': '#A7F3D0', 'pending-bg': '#2E3F5E', 'pending-ink': '#BFD3F5', 'missed-bg': '#4A2A33', 'missed-ink': '#FFA3B5',
        'off-bg': '#20252E', 'off-ink': '#5C6675', soft: '#2C3340', shadow: 'rgba(0,0,0,.45)' },
      dark: { bg: '#12161C', paper: '#1A1F27', hero1: '#1F2733', hero2: '#192A27' },
      flowers: ['#3DDC97', '#7FA7E0', '#5EEAD4', '#9FE1CB', '#BFD3F5'],
      char: roboSVG, sway: false
    },
    {
      id: 'astro', mark: MARKS.star, kalender: 'Langit', chime: 'lonceng', nama: 'Astro', maskot: 'Astro', Maskot: 'Astro', deskripsi: 'Luar angkasa: navy pekat, biru langit terang, kuning bintang.', bold: true,
      light: { bg: '#0B1020', paper: '#141A30', ink: '#EAF0FF', muted: '#8E9AC0', line: '#262E4F', hero1: '#1A2246', hero2: '#141A30',
        primary: '#4FC3F7', 'primary-ink': '#05202E', secondary: '#FFD166', 'secondary-ink': '#3B2A00', tertiary: '#222A48', 'tertiary-ink': '#DCE4FF',
        chip: '#1F2847', 'chip-ink': '#A7DBFF', 'chip-line': '#334070', accent: '#7DD3FC', ok: '#5FE0B0', warn: '#FF7B7B',
        'done-bg': '#173F4A', 'done-ink': '#A7F0E0', 'pending-bg': '#4A3A12', 'pending-ink': '#FFE38A', 'missed-bg': '#4A2440', 'missed-ink': '#FFA3D5',
        'off-bg': '#121833', 'off-ink': '#4D5880', soft: '#1B2240', shadow: 'rgba(0,0,0,.5)' },
      dark: { bg: '#070B17', paper: '#0E1328', hero1: '#131A3A', hero2: '#0E1328' },
      flowers: ['#4FC3F7', '#FFD166', '#7DD3FC', '#C7BEF2', '#5FE0B0'],
      char: astroSVG, sway: false
    },
    {
      id: 'beruang', mark: MARKS.paw, kalender: 'Hutan', chime: 'marimba', nama: 'Baro si beruang', maskot: 'Baro', Maskot: 'Baro', deskripsi: 'Kayu gelap, hijau daun, madu. Hangat dan kalem.', bold: true,
      light: { bg: '#1F1812', paper: '#2A211A', ink: '#F3EBE0', muted: '#A89A8A', line: '#3E322A', hero1: '#3A2B1E', hero2: '#273126',
        primary: '#8BC34A', 'primary-ink': '#14240A', secondary: '#D4A373', 'secondary-ink': '#2B1A0E', tertiary: '#38302A', 'tertiary-ink': '#E8DED0',
        chip: '#3A2E25', 'chip-ink': '#E8C9A0', 'chip-line': '#524438', accent: '#A3C585', ok: '#8BC34A', warn: '#FF8A5B',
        'done-bg': '#2E4A2A', 'done-ink': '#C5E8A6', 'pending-bg': '#5A4020', 'pending-ink': '#F5D4A6', 'missed-bg': '#4E2A24', 'missed-ink': '#FFB09C',
        'off-bg': '#241D17', 'off-ink': '#6B5F54', soft: '#332A23', shadow: 'rgba(0,0,0,.5)' },
      dark: { bg: '#15100C', paper: '#1F1812', hero1: '#2B2016', hero2: '#1F2A1C' },
      flowers: ['#8BC34A', '#D4A373', '#A3C585', '#F5D4A6', '#C5E8A6'],
      char: beruangSVG, sway: true
    },
    // ---- tema kontras (bukan pastel) ----
    {
      id: 'bara', mark: MARKS.flame, kalender: 'Bara', chime: 'drum', nama: 'Bara', maskot: 'Bara', Maskot: 'Bara', deskripsi: 'Arang hitam, oranye bara, kuning amber. Api kecil yang nggak mau padam.', bold: true,
      light: { bg: '#1C1B1F', paper: '#26252B', ink: '#F5F1EA', muted: '#A39E96', line: '#36343B', hero1: '#2E2420', hero2: '#26252B',
        primary: '#FF7A1A', 'primary-ink': '#1C1B1F', secondary: '#FFD166', 'secondary-ink': '#3B2A00', tertiary: '#33313A', 'tertiary-ink': '#E6E0D6',
        chip: '#3A2F2A', 'chip-ink': '#FFB380', 'chip-line': '#5A4538', accent: '#FF9A4D', ok: '#7BD389', warn: '#FF6B6B',
        'done-bg': '#2B4A33', 'done-ink': '#B8F2C2', 'pending-bg': '#5A2E12', 'pending-ink': '#FFB380', 'missed-bg': '#4A2626', 'missed-ink': '#FF9E9E',
        'off-bg': '#2C2B31', 'off-ink': '#6B6870', soft: '#2F2E35', shadow: 'rgba(0,0,0,.5)' },
      dark: { bg: '#141316', paper: '#1D1C21', hero1: '#241C18', hero2: '#1D1C21' },
      flowers: ['#FF7A1A', '#FFD166', '#FF9A4D', '#FFB380', '#F4A261'],
      char: baraSVG, sway: false
    },
    {
      id: 'hiu', mark: MARKS.wave, kalender: 'Laut', chime: 'lonceng', nama: 'Hiu', maskot: 'Hiu', Maskot: 'Hiu', deskripsi: 'Laut dalam: navy, teal terang, kuning. Hiu kecil yang gigih.', bold: true,
      light: { bg: '#0F2A3F', paper: '#163850', ink: '#EAF4FA', muted: '#8FB0C6', line: '#244B64', hero1: '#174B63', hero2: '#163850',
        primary: '#1FB6C8', 'primary-ink': '#06272E', secondary: '#F4D35E', 'secondary-ink': '#3A3000', tertiary: '#20445C', 'tertiary-ink': '#D5E7F2',
        chip: '#1E4A62', 'chip-ink': '#9EE7F0', 'chip-line': '#2C6480', accent: '#4FD3E3', ok: '#5FE0B0', warn: '#FF7B7B',
        'done-bg': '#174D4A', 'done-ink': '#9EF0DB', 'pending-bg': '#5A4A12', 'pending-ink': '#FFE38A', 'missed-bg': '#4C2A36', 'missed-ink': '#FFA3B5',
        'off-bg': '#17344A', 'off-ink': '#5F7F96', soft: '#1B4058', shadow: 'rgba(0,0,0,.45)' },
      dark: { bg: '#081A29', paper: '#0F2A3F', hero1: '#0F3A4F', hero2: '#0F2A3F' },
      flowers: ['#1FB6C8', '#F4D35E', '#4FD3E3', '#5FE0B0', '#9EE7F0'],
      char: hiuSVG, sway: true
    },
    {
      id: 'harimau', mark: MARKS.claw, kalender: 'Rimba', chime: 'drum', nama: 'Harimau', maskot: 'Harimau', Maskot: 'Harimau', deskripsi: 'Hutan gelap dan lime menyala. Belang oranye hitam.', bold: true,
      light: { bg: '#15301F', paper: '#1E3F2B', ink: '#EEF7E8', muted: '#9BB8A2', line: '#2C5438', hero1: '#244A2E', hero2: '#1E3F2B',
        primary: '#A3E635', 'primary-ink': '#1A2E0B', secondary: '#F28C28', 'secondary-ink': '#2B1A0E', tertiary: '#2A4D36', 'tertiary-ink': '#D8ECD6',
        chip: '#2B5236', 'chip-ink': '#CFF78A', 'chip-line': '#3E6E4A', accent: '#B6F26B', ok: '#A3E635', warn: '#FF8A5B',
        'done-bg': '#2E5E33', 'done-ink': '#CFF78A', 'pending-bg': '#5E3C14', 'pending-ink': '#FFC27A', 'missed-bg': '#5A2D2D', 'missed-ink': '#FFA3A3',
        'off-bg': '#1C3826', 'off-ink': '#5E7F66', soft: '#244A2E', shadow: 'rgba(0,0,0,.45)' },
      dark: { bg: '#0E2015', paper: '#15301F', hero1: '#1A3A24', hero2: '#15301F' },
      flowers: ['#A3E635', '#F28C28', '#B6F26B', '#FFD166', '#7BD389'],
      char: harimauSVG, sway: true
    },
    {
      id: 'tegas', mark: MARKS.square, kalender: 'Kalender', chime: 'retro', nama: 'Tegas', maskot: 'aku', Maskot: 'Aku', deskripsi: 'Hitam dan kuning safety, kontras tinggi, tanpa maskot.', bold: true,
      light: { bg: '#ECEDEF', paper: '#FFFFFF', ink: '#111318', muted: '#5B6068', line: '#D5D8DE', hero1: '#FFD400', hero2: '#FFE866',
        primary: '#111318', 'primary-ink': '#FFFFFF', secondary: '#FFD400', 'secondary-ink': '#111318', tertiary: '#E2E4E8', 'tertiary-ink': '#111318',
        chip: '#FFF3B0', 'chip-ink': '#3A3000', 'chip-line': '#FFD400', accent: '#0057FF', ok: '#1B8A3C', warn: '#D7263D',
        'done-bg': '#D9F2E0', 'done-ink': '#14532D', 'pending-bg': '#FFD400', 'pending-ink': '#111318', 'missed-bg': '#FFD9DE', 'missed-ink': '#9F1239',
        'off-bg': '#E2E4E8', 'off-ink': '#9CA3AF', soft: '#F2F3F5', shadow: 'rgba(17,19,24,.22)' },
      dark: { bg: '#121317', paper: '#1B1D23', ink: '#F5F5F5', muted: '#A0A4AC', line: '#2E3138', hero1: '#3A3200', hero2: '#1B1D23',
        primary: '#FFD400', 'primary-ink': '#111318', secondary: '#F5F5F5', 'secondary-ink': '#111318', tertiary: '#2A2D34', 'tertiary-ink': '#F5F5F5',
        chip: '#2A2D34', 'chip-ink': '#FFE866', 'chip-line': '#3E4149', accent: '#FFD400', 'done-bg': '#1F3D2A', 'done-ink': '#A7F3C0',
        'pending-bg': '#FFD400', 'pending-ink': '#111318', 'missed-bg': '#4A1F28', 'missed-ink': '#FFA3B5', 'off-bg': '#22252B', 'off-ink': '#5C6068', soft: '#22252B', shadow: 'rgba(0,0,0,.5)' },
      flowers: ['#FFD400', '#111318', '#0057FF', '#FFE866', '#5B6068'],
      char: tegasSVG, sway: false
    },
    {
      id: 'sawit', mark: MARKS.flower, kalender: 'Kebun', chime: 'marimba', nama: 'Sawit', maskot: 'Sawit', Maskot: 'Sawit', deskripsi: 'Pohon sawit kecil, hangat krem dan sage.',
      light: {}, dark: {},
      flowers: ['#A8D5AE', '#F7B5A3', '#C7BEF2', '#9CC9EA', '#F9D29D'],
      char: (m, s) => g.sawitSVG(m, s), sway: true
    },
    {
      id: 'kucing', mark: MARKS.paw, kalender: 'Kebun', chime: 'marimba', nama: 'Momo si kucing', maskot: 'Momo', Maskot: 'Momo', deskripsi: 'Kucing pink lembut, manja tapi rajin ngingetin.',
      light: { bg: '#FFF4F6', paper: '#FFFBFC', hero1: '#FFE4EA', hero2: '#EDE8FB', primary: '#F7C6D0', 'primary-ink': '#6E2F42', chip: '#FFE4EA', 'chip-ink': '#8A3C55', 'chip-line': '#F7C6D0', line: '#F3E1E6', 'pending-bg': '#FFD9E1', 'pending-ink': '#8A3C55', soft: '#FBEDF0' },
      dark: { hero1: '#432C38', hero2: '#352D45' },
      flowers: ['#F7B5C4', '#FFD6C2', '#C7BEF2', '#A8D5AE', '#F9D29D'],
      char: kucingSVG, sway: true
    },
    {
      id: 'kaktus', mark: MARKS.flower, kalender: 'Kebun', chime: 'marimba', nama: 'Kaktus', maskot: 'Kaktus', Maskot: 'Kaktus', deskripsi: 'Kaktus berbunga di pot oranye, mint dan pasir.',
      light: { bg: '#F3F7F1', paper: '#FBFDF9', hero1: '#E3F2E4', hero2: '#FBEBD3', primary: '#BFE3C6', 'primary-ink': '#2F5438', secondary: '#FAD9A6', 'secondary-ink': '#6E4A1E', chip: '#E3F2E4', 'chip-ink': '#2F5438', 'chip-line': '#BFE3C6', line: '#E1EADF', soft: '#EEF4EC' },
      dark: { hero1: '#2A3A2F', hero2: '#3B3328' },
      flowers: ['#F7B5C4', '#BFE3C6', '#FAD9A6', '#9CC9EA', '#C7BEF2'],
      char: kaktusSVG, sway: true
    }
  ];

  function themeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
  function themeFor(settings) { return themeById(settings && settings.theme); }
  function isNight(settings) {
    const mode = (settings && settings.nightMode) || 'auto';
    if (mode === 'on') return true;
    if (mode === 'off') return false;
    const h = new Date().getHours();
    return h >= 18 || h < 6;
  }
  function palette(theme, dark) {
    if (!dark) return { ...BASE_LIGHT, ...theme.light };
    // Tema "bold" sudah punya warna dasar sendiri; mode malam hanya menggelapkan sedikit.
    if (theme.bold) return { ...BASE_LIGHT, ...theme.light, ...theme.dark };
    return { ...BASE_LIGHT, ...theme.light, ...BASE_DARK, ...theme.dark };
  }
  // Pasang variabel CSS ke elemen (document.documentElement atau host shadow).
  function applyTheme(el, settings) {
    const theme = themeFor(settings);
    const dark = isNight(settings);
    const p = palette(theme, dark);
    Object.keys(p).forEach(k => el.style.setProperty('--' + k, p[k]));
    el.setAttribute('data-theme', theme.id);
    el.setAttribute('data-dark', dark ? '1' : '0');
    return { theme, dark, palette: p };
  }
  // Ganti {n}/{N} dengan nama maskot.
  function tt(theme, str) { return String(str).replace(/\{N\}/g, theme.Maskot).replace(/\{n\}/g, theme.maskot); }

  g.SawitThemes = { THEMES, MARKS, themeById, themeFor, isNight, palette, applyTheme, tt, BASE_LIGHT, BASE_DARK };
})(globalThis);
