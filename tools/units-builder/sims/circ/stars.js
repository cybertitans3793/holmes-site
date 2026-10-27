// Stars: Distance & the HR Diagram (IB E.5): stellar parallax d(pc) = 1/p(arcsec) with AU / ly / pc conversions, and an HR diagram where you place a star by temperature and luminosity, read off its radius (L = 4πR²σT⁴), region, and — on the main sequence — mass and lifetime.
const STARS = [['Sun', 5778, 0], ['Sirius A', 9940, 1.4], ['Vega', 9600, 1.6], ['Betelgeuse', 3500, 5.1], ['Rigel', 12100, 5.08], ['Aldebaran', 3900, 2.6], ['Proxima Cen', 3042, -2.8], ['Sirius B', 25000, -1.6], ['Spica', 22400, 4.3]];
function starCol(T){ const x = Math.max(0, Math.min(1, (Math.log10(T) - 3.4) / 1.2)); return 'rgb(' + Math.round(255 - 110 * x) + ',' + Math.round(150 + 80 * Math.min(1, x * 1.6)) + ',' + Math.round(90 + 165 * x) + ')'; }
const SIM = {
  title: 'Stars: Distance & the HR Diagram',
  hint: 'd(pc) = 1/p(″) · L = 4πR²σT⁴',
  modes: [{ id: 'hr', label: 'HR diagram' }, { id: 'par', label: 'Parallax' }],
  ivs(mode){
    if (mode === 'par') return [{ id: 'p', sym: 'p', symText: 'p', label: 'Parallax angle', unit: 'arcsec', min: 0.01, max: 1, step: 0.001, val: 0.768, graph: true }];
    return [
      { id: 'T', sym: 'T', symText: 'T', label: 'Surface temperature', unit: 'K', min: 2500, max: 40000, step: 50, val: 5778, graph: true },
      { id: 'lL', sym: 'log L', symText: 'logL', label: 'Luminosity (as a power of 10 × the Sun’s)', unit: '', min: -4, max: 6, step: 0.05, val: 0, show: x => '10^' + x.toFixed(2) + ' L☉' }];
  },
  presets: [{ label: 'The Sun', mode: 'hr', v: { T: 5778, lL: 0 } }, { label: 'Betelgeuse', mode: 'hr', v: { T: 3500, lL: 5.1 } }, { label: 'Sirius B (white dwarf)', mode: 'hr', v: { T: 25000, lL: -1.6 } }, { label: 'Proxima Centauri', mode: 'par', v: { p: 0.768 } }],
  calc(v, mode){
    if (mode === 'par'){ const d = 1 / v.p; return { d, ly: d * 3.26, au: d * 206265, m: d * 3.086e16 }; }
    const L = Math.pow(10, v.lL), R = Math.sqrt(L) * Math.pow(5778 / v.T, 2), lms = 7.5 * Math.log10(v.T / 5778), off = v.lL - lms;
    let reg = 'between the main regions';
    if (Math.abs(off) < 0.8) reg = 'main sequence'; else if (off > 0 && R >= 100) reg = 'supergiant'; else if (off > 0 && R >= 8) reg = 'red giant'; else if (off < 0 && R < 0.05) reg = 'white dwarf';
    const ms = reg === 'main sequence', M = ms ? Math.pow(L, 1 / 3.5) : NaN, life = ms ? 1e10 * Math.pow(M, -2.5) : NaN;
    return { L, R, reg, ms, M, life, Rm: R * 6.96e8, P: L * 3.83e26 };
  },
  dvs(mode){
    if (mode === 'par') return [{ id: 'd', name: 'Distance', short: 'd', sym: 'd', unit: 'pc', f: d => d.d }, { id: 'ly', name: 'Distance in light-years', short: 'd', sym: 'd', unit: 'ly', f: d => d.ly }];
    return [{ id: 'R', name: 'Radius (Sun = 1)', short: 'R', sym: 'R', unit: 'R☉', f: d => d.R }];
  },
  work(v, d, mode){
    if (mode === 'par') return '<h4>1 · What parallax is</h4><div class="eq">Photograph the star in January and again in July, from opposite sides of Earth’s orbit. A nearby star shifts against the far-away background. The parallax angle p is <b>half</b> the total shift.</div>' +
      '<h4>2 · Distance</h4><div class="eq">d (pc) = 1/p (arcsec) = 1/' + H.iv('p') + ' = <b>' + H.n(d.d, 'pc') + '</b></div>' +
      '<h4>3 · Convert</h4><div class="eq">1 pc = 3.26 ly = 206 265 AU = 3.086×10¹⁶ m → ' + H.n(d.ly, 'ly') + ' = ' + H.n(d.au, 'AU') + ' = ' + H.n(d.m, 'm') + '</div>' +
      '<p class="note">A parsec is the distance at which 1 AU subtends 1 arcsecond (1/3600 of a degree). Even the nearest star (Proxima Centauri, 0.768″) is 1.3 pc away. Telescopes on the ground can measure down to about 0.01″ (100 pc); the Gaia satellite reaches thousands of parsecs. Farther stars need other methods (their luminosity).</p>';
    return '<h4>1 · Radius from L and T</h4><div class="eq">L = 4πR²σT⁴ → R/R☉ = √(L/L☉) × (T☉/T)² = √(' + fnum(d.L) + ') × (5778/' + H.iv('T') + ')² = <b>' + H.n(d.R, 'R☉') + '</b> (' + H.n(d.Rm, 'm') + ')</div>' +
      '<h4>2 · Where it sits</h4><div class="eq">This star is in the <b>' + d.reg + '</b> region.</div>' +
      (d.ms ? '<h4>3 · Main-sequence star (IB HL: mass–luminosity)</h4><div class="eq">L ∝ M<sup>3.5</sup> → M = (' + fnum(d.L) + ')<sup>1/3.5</sup> = <b>' + H.n(d.M, 'M☉') + '</b>. Lifetime ∝ M/L ≈ 10¹⁰ yr × M<sup>−2.5</sup> = <b>' + H.n(d.life, 'yr') + '</b></div>' : '') +
      '<p class="note">Main sequence: fusing hydrogen in the core; gravity pulling in is balanced by radiation and gas pressure pushing out. Hotter and brighter = more massive, and it burns out faster. Red giants and supergiants are cool but huge, so they are very luminous. White dwarfs are hot but tiny (Earth-sized), so they are dim. Lines of constant radius run diagonally.</p>';
  },
  draw(v, d, mode){
    if (mode === 'par'){
      panelTitle('PARALLAX (ANGLES HUGELY EXAGGERATED)', 10, 18);
      const sx = 200, sy = 270, dist = 60 + 160 * Math.min(1, 0.1 / v.p) ; const starY = sy - 200 + Math.min(150, 40 / v.p * 0) ;
      ctx.fillStyle = '#ffcf40'; ctx.beginPath(); ctx.arc(sx, sy, 10, 0, 7); ctx.fill(); ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(sx, sy, 90, 22, 0, 0, 7); ctx.stroke();
      const e1 = [sx - 90, sy], e2 = [sx + 90, sy], st = [sx, sy - 120 - 120 * (1 - Math.min(1, v.p))]; [e1, e2].forEach((e, i) => { ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(e[0], e[1], 5, 0, 7); ctx.fill(); text(i ? 'July' : 'January', e[0], e[1] + 18, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); });
      ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(st[0], Math.max(40, st[1]), 6, 0, 7); ctx.fill(); const sty = Math.max(40, st[1]);
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(...e1); ctx.lineTo(st[0], sty); ctx.lineTo(...e2); ctx.stroke(); ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(st[0], sty); ctx.stroke(); ctx.setLineDash([]);
      text('p', st[0] + 6, sty + 30, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' }); text('1 AU', sx + 40, sy - 6, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); text('d', sx - 12, (sy + sty) / 2, { align: 'right', font: '700 13px "Space Grotesk",sans-serif' });
      for (let i = 0; i < 18; i++){ ctx.fillStyle = '#bbb'; ctx.beginPath(); ctx.arc(20 + (i * 53) % 360, 30 + (i * 37) % 30, 1.5, 0, 7); ctx.fill(); } text('distant background stars', 380, 26, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#8a8a8a' });
      panelTitle('THE TWO PHOTOS', 395, 18); const sh = Math.min(30, 40 * v.p);
      [[400, 'January', -sh], [495, 'July', sh]].forEach(([x, n, s]) => { ctx.fillStyle = '#111'; ctx.fillRect(x, 34, 88, 80); [[12, 20], [70, 30], [40, 64], [20, 70], [76, 58]].forEach(([a, b]) => { ctx.fillStyle = '#ddd'; ctx.fillRect(x + a, 34 + b, 2, 2); }); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(x + 44 + s / 2, 74, 4, 0, 7); ctx.fill(); text(n, x + 44, 128, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); });
      [['p', v.p + '″'], ['d', fplain(d.d) + ' pc'], ['', fplain(d.ly) + ' ly'], ['', fplain(d.au) + ' AU']].forEach(([a, b], i) => { text(a, 400, 160 + i * 24, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 160 + i * 24, { align: 'right', font: '700 13px "IBM Plex Mono",monospace' }); });
      return;
    }
    panelTitle('HERTZSPRUNG–RUSSELL DIAGRAM', 10, 18);
    const gx = 50, gy = 296, gw = 330, gh = 246, lt0 = Math.log10(40000), lt1 = Math.log10(2500), X = T => gx + gw * (lt0 - Math.log10(T)) / (lt0 - lt1), Y = l => gy - gh * (l + 4) / 10;
    ctx.fillStyle = '#0d1424'; ctx.fillRect(gx, gy - gh, gw, gh);
    ctx.save(); ctx.beginPath(); ctx.rect(gx, gy - gh, gw, gh); ctx.clip();
    [0.01, 0.1, 1, 10, 100, 1000].forEach(R => { ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i <= 40; i++){ const T = Math.pow(10, lt1 + (lt0 - lt1) * i / 40), l = Math.log10(R * R * Math.pow(T / 5778, 4)); i ? ctx.lineTo(X(T), Y(l)) : ctx.moveTo(X(T), Y(l)); } ctx.stroke(); ctx.setLineDash([]); const Tl = 3000, ll = Math.log10(R * R * Math.pow(Tl / 5778, 4)); if (ll > -3.8 && ll < 5.6) text(R + ' R☉', X(Tl) - 2, Y(ll) - 3, { align: 'right', font: '500 8px "IBM Plex Mono",monospace', col: 'rgba(255,255,255,0.5)' }); });
    ctx.strokeStyle = 'rgba(120,180,255,0.35)'; ctx.lineWidth = 16; ctx.beginPath(); for (let i = 0; i <= 40; i++){ const T = Math.pow(10, lt1 + (lt0 - lt1) * i / 40), l = 7.5 * Math.log10(T / 5778); i ? ctx.lineTo(X(T), Y(l)) : ctx.moveTo(X(T), Y(l)); } ctx.stroke();
    STARS.forEach(([n, T, l]) => { ctx.fillStyle = starCol(T); ctx.beginPath(); ctx.arc(X(T), Y(l), 3, 0, 7); ctx.fill(); text(n, X(T) + 5, Y(l) + 3, { font: '500 8px "IBM Plex Mono",monospace', col: 'rgba(255,255,255,0.7)' }); });
    text('main sequence', X(9000), Y(2.9), { font: '600 9px "Space Grotesk",sans-serif', col: '#9fc4ff' }); text('red giants', X(4200), Y(3.0), { font: '600 9px "Space Grotesk",sans-serif', col: '#ffb380' }); text('supergiants', X(9000), Y(5.6), { font: '600 9px "Space Grotesk",sans-serif', col: '#ffd0a0' }); text('white dwarfs', X(22000), Y(-3.2), { font: '600 9px "Space Grotesk",sans-serif', col: '#e0e8ff' });
    ctx.fillStyle = starCol(v.T); ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(X(v.T), Y(v.lL), 7, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
    [40000, 10000, 5000, 2500].forEach(T => text(String(T), X(T), gy + 12, { align: 'center', font: '500 9px "IBM Plex Mono",monospace' })); text('surface temperature (K) — hotter on the LEFT', gx + gw / 2, gy + 24, { align: 'center', font: '600 9px "IBM Plex Mono",monospace' });
    [-4, -2, 0, 2, 4, 6].forEach(l => text('10' + (l < 0 ? '⁻' : '') + '⁰¹²³⁴⁵⁶'[Math.abs(l)], gx - 4, Y(l) + 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace' })); text('L/L☉', gx - 4, gy - gh - 6, { align: 'right', font: '600 9px "IBM Plex Mono",monospace' });
    panelTitle('YOUR STAR', 395, 18);
    const rr = Math.max(2, Math.min(60, 12 * Math.cbrt(d.R))); ctx.fillStyle = starCol(v.T); ctx.beginPath(); ctx.arc(490, 90, rr, 0, 7); ctx.fill(); ctx.fillStyle = '#ffcf40'; ctx.beginPath(); ctx.arc(570, 140, 12, 0, 7); ctx.fill(); text('Sun', 570, 166, { align: 'center', font: '500 9px "IBM Plex Mono",monospace' }); text('(size ∝ ∛R so it fits)', 400, 166, { font: '500 9px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    [['region', d.reg], ['radius', fplain(d.R) + ' R☉'], ['mass', d.ms ? fplain(d.M) + ' M☉' : '—'], ['lifetime', d.ms ? fplain(d.life) + ' yr' : '—']].forEach(([a, b], i) => { text(a, 400, 192 + i * 24, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 192 + i * 24, { align: 'right', font: '700 12px "IBM Plex Mono",monospace' }); });
  }
};
