// Karakter pohon sawit kecil. mood: happy | worried | wilted | sleep
globalThis.sawitSVG = function (mood, size) {
  mood = mood || 'happy'; size = size || 96;
  const wilt = mood === 'wilted', worried = mood === 'worried', sleep = mood === 'sleep';
  const leaf = wilt ? '#CFD3BE' : '#A8D5AE';
  const leafDark = wilt ? '#B3B8A1' : '#79B589';
  const trunk = '#D3B48F', trunkDark = '#BE9B73', head = '#FBEBD3', ink = '#4A4458';
  const angles = wilt ? [-118, -92, -64, 64, 92, 118] : [-82, -48, -16, 16, 48, 82];
  const fronds = angles.map((a, i) => {
    const c = i % 2 ? leafDark : leaf;
    const rx = wilt ? 7 : 9;
    return '<g transform="rotate(' + a + ' 60 58)"><ellipse cx="60" cy="30" rx="' + rx + '" ry="26" fill="' + c + '"/>' +
      '<path d="M60 14 V 52" stroke="' + (c === leaf ? leafDark : leaf) + '" stroke-width="1.5" stroke-linecap="round" opacity=".8"/></g>';
  }).join('');
  const fruit = (wilt || sleep) ? '' :
    '<circle cx="47" cy="66" r="4" fill="#F2A07B"/><circle cx="53" cy="70" r="4" fill="#F7B994"/><circle cx="45" cy="73" r="3.5" fill="#F7B994"/>';
  let face;
  if (sleep) {
    face = '<path d="M50 60 q4 3 8 0" stroke="' + ink + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<path d="M64 60 q4 3 8 0" stroke="' + ink + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<path d="M57 68 q4 2 8 0" stroke="' + ink + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<text x="80" y="46" font-size="11" font-weight="700" fill="' + ink + '" font-family="sans-serif">z</text>' +
      '<text x="88" y="38" font-size="8" font-weight="700" fill="' + ink + '" font-family="sans-serif">z</text>';
  } else if (worried) {
    face = '<circle cx="54" cy="61" r="2.6" fill="' + ink + '"/><circle cx="68" cy="61" r="2.6" fill="' + ink + '"/>' +
      '<path d="M49 54 l8 3" stroke="' + ink + '" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M73 54 l-8 3" stroke="' + ink + '" stroke-width="2" stroke-linecap="round"/>' +
      '<ellipse cx="61" cy="70" rx="3.5" ry="2.5" fill="' + ink + '"/>' +
      '<path d="M81 52 q4 7 0 9 q-4 -2 0 -9z" fill="#9CC9EA"/>';
  } else if (wilt) {
    face = '<path d="M50 59 q4 -3 8 0" stroke="' + ink + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<path d="M64 59 q4 -3 8 0" stroke="' + ink + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<path d="M55 71 q6 -4 12 0" stroke="' + ink + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
  } else {
    face = '<circle cx="54" cy="61" r="2.8" fill="' + ink + '"/><circle cx="68" cy="61" r="2.8" fill="' + ink + '"/>' +
      '<path d="M54 68 q7 6 14 0" stroke="' + ink + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      '<circle cx="47" cy="66" r="3" fill="#F7B5A3" opacity=".7"/><circle cx="75" cy="66" r="3" fill="#F7B5A3" opacity=".7"/>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="' + size + '" height="' + size + '" role="img" aria-label="Sawit ' + mood + '">' +
    '<ellipse cx="60" cy="108" rx="30" ry="6" fill="#000" opacity=".06"/>' +
    fronds +
    '<path d="M55 78 Q56 96 54 108 L66 108 Q64 96 65 78 Z" fill="' + trunk + '"/>' +
    '<path d="M56 86 h8 M56 94 h8 M55 102 h9" stroke="' + trunkDark + '" stroke-width="1.5" stroke-linecap="round"/>' +
    '<circle cx="61" cy="63" r="17" fill="' + head + '"/>' +
    fruit + face +
    '</svg>';
};
