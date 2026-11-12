// SHM Graph Matcher: match a target x–t (or v–t / a–t) graph for a mass on a spring by choosing A, T (or m and k) and the starting position. Original.
const SMW = 6;   // seconds shown on the graph
const SMPH = [0, -PI / 2, PI, PI / 2];   // x = A cos(ωt + φ): +A, 0 moving up, −A, 0 moving down
const SMWORDS = ['at the top (x = +A)', 'at 0, moving up', 'at the bottom (x = −A)', 'at 0, moving down'];
const SMG = window._sm = window._sm || { lvl: null, tgt: null, reveal: false, btns: [] };
const smPar = (v, opt) => { const lvl = opt.level || '1', ph = lvl === '1' ? 0 : Math.round(v.ph || 0), T = lvl === '3' ? 2 * PI * Math.sqrt(v.m / v.k) : v.T; return { A: v.A, T, ph, w: 2 * PI / T, phi: SMPH[ph] }; };
const smQ = (p, what, t) => { const a = p.w * t + p.phi; return what === 'x' ? p.A * Math.cos(a) : what === 'v' ? -p.A * p.w * Math.sin(a) : -p.A * p.w * p.w * Math.cos(a); };
const smAmp = (p, what) => what === 'x' ? p.A : what === 'v' ? p.A * p.w : p.A * p.w * p.w;
function smGen(lvl){
  const ri = n => Math.floor(Math.random() * n), A = 0.05 * (1 + ri(5)), ph = lvl === '1' ? 0 : ri(4);
  if (lvl === '3'){ let m, k, T; do { m = 0.25 * (1 + ri(12)); k = 10 * (1 + ri(10)); T = 2 * PI * Math.sqrt(m / k); } while (T < 0.6 || T > 3); return { A, ph, m, k, T }; }
  return { A, ph, T: Math.round((0.6 + 0.2 * ri(13)) * 10) / 10 };
}
function smEnsure(opt){ const lvl = opt.level || '1'; if (SMG.lvl !== lvl || !SMG.tgt){ SMG.lvl = lvl; SMG.tgt = smGen(lvl); SMG.reveal = false; } return SMG.tgt; }
function smNice(m){ for (let e = -3; e < 4; e++) for (const b of [1, 2, 5]){ const s = b * Math.pow(10, e); if (m / s <= 4) return s; } return 1; }
const SIM = {
  title: 'SHM Graph Matcher',
  hint: 'match the dashed graph',
  noGraph: true,
  modes: [{ id: 'xt', label: 'Match x–t' }, { id: 'vt', label: 'Match v–t / a–t' }],
  opts: [{ id: 'level', label: 'Level', choices: [['1', '1 · A, T'], ['2', '2 · + start'], ['3', '3 · m, k']] },
    { id: 'what', label: 'Target', modes: ['vt'], choices: [['v', 'v–t'], ['a', 'a–t']] }],
  ivs(mode, opt){
    const lvl = opt.level || '1', l = [{ id: 'A', sym: 'A', symText: 'A', label: 'Amplitude', unit: 'm', min: 0.05, max: 0.3, step: 0.01, val: 0.15 }];
    if (lvl === '3'){ l.push({ id: 'm', sym: 'm', symText: 'm', label: 'Mass', unit: 'kg', min: 0.25, max: 4, step: 0.05, val: 1 }, { id: 'k', sym: 'k', symText: 'k', label: 'Spring constant', unit: 'N/m', min: 10, max: 100, step: 5, val: 40 }); }
    else l.push({ id: 'T', sym: 'T', symText: 'T', label: 'Period', unit: 's', min: 0.5, max: 3, step: 0.05, val: 1.5 });
    if (lvl !== '1') l.push({ id: 'ph', sym: '', symText: 'start', label: 'Starts', unit: '', min: 0, max: 3, step: 1, val: 0, show: x => SMWORDS[Math.round(x)] });
    return l;
  },
  calc(v, mode, opt){
    const lvl = opt.level || '1', tg = smEnsure(opt), p = smPar(v, opt), what = mode === 'vt' ? (opt.what || 'v') : 'x', tp = { A: tg.A, T: tg.T, ph: tg.ph, w: 2 * PI / tg.T, phi: SMPH[tg.ph] };
    const Aq = smAmp(tp, what); let s = 0; const N = 240;
    for (let i = 0; i < N; i++){ const t = SMW * (i + 0.5) / N, e = smQ(p, what, t) - smQ(tp, what, t); s += e * e; }
    const rm = Math.sqrt(s / N), score = Math.max(0, 100 * (1 - rm / (0.8 * Aq)));
    return Object.assign({ lvl, what, tp, Aq, score, matched: score >= 96, f: 1 / p.T, vmax: 2 * PI * p.A / p.T, amax: Math.pow(2 * PI / p.T, 2) * p.A, m: v.m, k: v.k }, p);
  },
  dvs(){ return [{ id: 'T', name: 'Period', short: 'T', sym: 'T', unit: 's', f: d => d.T }, { id: 'vmax', name: 'Maximum speed', short: 'v_max', sym: 'v<sub>max</sub>', unit: 'm/s', f: d => d.vmax }]; },
  work(v, d, mode, opt){
    const Ts = d.lvl === '3' ? M.n(d.T, 's') : M.iv('T'), A = M.iv('A');
    let h = '';
    if (d.lvl === '3') h += '<h4>1 · The period comes from m and k</h4>' + TEX`T = 2\pi\sqrt{\frac{m}{k}}` + TEX`T = 2\pi\sqrt{\frac{${M.iv('m')}}{${M.iv('k')}}}` + TEXA`T = ${M.n(d.T, 's')}` + '<p class="note">Only the ratio m/k matters: a heavier mass and a stiffer spring can give the same graph.</p>';
    else h += '<h4>1 · Read A and T from the graph</h4><p class="st">A = height of a peak above the middle line. T = time from one peak to the next peak.</p>';
    h += '<h4>2 · The shape: where does it start?</h4><p class="st">Start ' + SMWORDS[d.ph] + ': ' + ['a cosine curve.', 'a sine curve.', 'an upside-down cosine.', 'an upside-down sine.'][d.ph] + '</p>' +
      (d.ph === 0 ? TEX`x = A\cos\left(\frac{2\pi t}{T}\right)` + TEX`x = ${A}\,\cos\left(\frac{2\pi t}{${Ts}}\right)` : d.ph === 1 ? TEX`x = A\sin\left(\frac{2\pi t}{T}\right)` + TEX`x = ${A}\,\sin\left(\frac{2\pi t}{${Ts}}\right)` :
        d.ph === 2 ? TEX`x = -A\cos\left(\frac{2\pi t}{T}\right)` + TEX`x = -${A}\,\cos\left(\frac{2\pi t}{${Ts}}\right)` : TEX`x = -A\sin\left(\frac{2\pi t}{T}\right)` + TEX`x = -${A}\,\sin\left(\frac{2\pi t}{${Ts}}\right)`) +
      '<h4>3 · Fastest and most accelerated</h4><p class="st">Speed is biggest at x = 0:</p>' + TEX`v_{\max} = \frac{2\pi A}{T}` + TEX`v_{\max} = \frac{2\pi\,${A}}{${Ts}}` + TEXA`v_{\max} = ${M.n(d.vmax, 'm/s')}` +
      '<p class="st">Acceleration is biggest at the ends (x = ±A):</p>' + TEX`a_{\max} = \left(\frac{2\pi}{T}\right)^2 A` + TEX`a_{\max} = \left(\frac{2\pi}{${Ts}}\right)^2 ${A}` + TEXA`a_{\max} = ${M.n(d.amax, 'm/s²')}`;
    if (mode === 'vt') h += d.what === 'v' ? '<p class="note">On the v–t graph, v = 0 when the mass is at an end (x = ±A), and the peaks are v<sub>max</sub> as it passes x = 0. v is the slope of the x–t graph.</p>' :
      '<p class="note">a = −(2π/T)² x, so the a–t graph is the x–t graph flipped upside down and stretched by (2π/T)². Its peaks are a<sub>max</sub>.</p>';
    else h += '<p class="note">Tip: match the peaks first (A and T), then fix the starting point.</p>';
    if (d.matched) h += '<div class="ok"><b>Matched!</b> Score ' + Math.round(d.score) + '%.</div>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const mono = '"IBM Plex Mono",monospace', sg = '"Space Grotesk",sans-serif', tg = SMG.tgt, tp = d.tp, what = d.what, tc = A.t % SMW;
    SMG.cur = { d }; SMG.A = A;
    if (!window._smHook){ window._smHook = 1; cv.addEventListener('pointerdown', e => { if (S.mode !== 'xt' && S.mode !== 'vt') return; const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 600, y = (e.clientY - r.top) / r.height * 330;
      const b = SMG.btns.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h); if (!b) return;
      if (b.id === 'new'){ SMG.tgt = smGen(SMG.lvl || '1'); SMG.reveal = false; } else SMG.reveal = !SMG.reveal; update(); }); }
    // ---- mass on a spring (x positive = up, same as the graph) ----
    panelTitle('SPRING', 10, 18);
    const cy0 = 160, scx = 300, x = smQ(d, 'x', tc), my = cy0 - x * scx, mw = d.lvl === '3' ? 22 + 8 * Math.cbrt(d.m) : 34, mh = mw * 0.68, mx = 58;
    ctx.fillStyle = '#111'; ctx.fillRect(28, 26, 60, 6);
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(4, cy0); ctx.lineTo(104, cy0); ctx.stroke(); ctx.setLineDash([]); text('x = 0', 6, cy0 - 4, { font: '600 9px ' + mono, col: '#1e7d45' });
    if (mode === 'xt'){ const gy = cy0 - smQ(tp, 'x', tc) * scx; ctx.setLineDash([4, 3]); ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1.5; ctx.strokeRect(mx - mw / 2 - 2, gy - mh / 2 - 2, mw + 4, mh + 4); ctx.setLineDash([]); }
    ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx, 32); const sy = my - mh / 2, SL = sy - 32, n = 14; for (let i = 1; i < n; i++) ctx.lineTo(mx + (i % 2 ? 9 : -9), 32 + SL * i / n); ctx.lineTo(mx, sy); ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; ctx.fillRect(mx - mw / 2, my - mh / 2, mw, mh); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(mx - mw / 2, my - mh / 2, mw, mh);
    text('t = ' + fplain(Math.round(tc * 100) / 100) + ' s', 10, 318, { font: '600 11px ' + mono, col: '#4a4a4a' });
    // ---- graph ----
    const GX0 = 118, GW = 267, cy = 160, GH = 130, Aq = d.Aq, ymax = what === 'x' ? 0.3 : (() => { const s = smNice(Aq * 1.2); return s * Math.ceil(Aq * 1.2 / s); })(), step = what === 'x' ? 0.1 : smNice(ymax);
    const X = q => GX0 + GW * q / SMW, Y = q => cy - GH * q / ymax;
    const unit = what === 'x' ? 'm' : what === 'v' ? 'm/s' : 'm/s²';
    panelTitle(what + '–t GRAPH (' + unit + ')', GX0, 18);
    ctx.lineWidth = 1; ctx.strokeStyle = '#e1e1e1'; for (let q = 1; q <= SMW; q++){ ctx.beginPath(); ctx.moveTo(X(q), cy - GH); ctx.lineTo(X(q), cy + GH); ctx.stroke(); }
    for (let q = step; q <= ymax + 1e-9; q += step){ [q, -q].forEach(y => { ctx.beginPath(); ctx.moveTo(GX0, Y(y)); ctx.lineTo(GX0 + GW, Y(y)); ctx.stroke(); text(fplain(+y.toPrecision(3)).replace('-', '−'), GX0 - 4, Y(y) + 3, { align: 'right', font: '500 9px ' + mono, col: '#4a4a4a' }); }); }
    if (d.matched){ ctx.fillStyle = 'rgba(30,125,69,0.07)'; ctx.fillRect(GX0, cy - GH, GW, 2 * GH); }
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(GX0, cy - GH - 4); ctx.lineTo(GX0, cy + GH + 4); ctx.moveTo(GX0, cy); ctx.lineTo(GX0 + GW, cy); ctx.stroke();
    for (let q = 0; q <= SMW; q++) text(String(q), X(q), cy + GH + 15, { align: 'center', font: '500 9px ' + mono, col: '#4a4a4a' }); text('0', GX0 - 4, cy + 3, { align: 'right', font: '500 9px ' + mono, col: '#4a4a4a' });
    text('t (s)', GX0 + GW, cy + GH + 28, { align: 'right', font: '600 10px ' + mono, col: '#4a4a4a' });
    ctx.save(); ctx.beginPath(); ctx.rect(GX0, cy - GH, GW, 2 * GH); ctx.clip();
    const curve = (p, col, w, dash) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.beginPath(); for (let i = 0; i <= 300; i++){ const q = SMW * i / 300; i ? ctx.lineTo(X(q), Y(smQ(p, what, q))) : ctx.moveTo(X(q), Y(smQ(p, what, q))); } ctx.stroke(); ctx.setLineDash([]); };
    curve(tp, '#1546d6', 2.2, [6, 4]); curve(d, '#ff6a2b', 2.8);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(tc), cy - GH); ctx.lineTo(X(tc), cy + GH); ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.arc(X(tc), Y(smQ(d, what, tc)), 4, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
    // ---- right panel ----
    panelTitle('MATCH', 395, 18);
    const sc = Math.round(d.score), col = d.matched ? '#1e7d45' : sc >= 75 ? '#c43a00' : '#7a3fb0';
    text(sc + '%', 395, 52, { font: '700 30px ' + sg, col }); ctx.fillStyle = '#e1e1e1'; ctx.fillRect(395, 62, 190, 8); ctx.fillStyle = col; ctx.fillRect(395, 62, 190 * sc / 100, 8);
    if (d.matched){ ctx.fillStyle = '#e5f4ea'; ctx.fillRect(395, 80, 190, 28); ctx.fillStyle = '#1e7d45'; ctx.fillRect(395, 80, 4, 28); text('Matched!', 410, 100, { font: '700 17px ' + sg, col: '#1e7d45' }); }
    else text('Not yet: keep adjusting', 395, 99, { font: '600 12px ' + sg, col: '#4a4a4a' });
    SMG.btns = [{ id: 'new', x: 395, y: 118, w: 98, h: 26, t: 'New target' }, { id: 'show', x: 499, y: 118, w: 86, h: 26, t: SMG.reveal ? 'Hide answer' : 'Show answer' }];
    SMG.btns.forEach(b => { ctx.fillStyle = '#fff'; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(b.x, b.y, b.w, b.h); text(b.t, b.x + b.w / 2, b.y + 17, { align: 'center', font: '700 12px ' + sg }); });
    panelTitle('YOURS', 395, 170);
    [['A', fplain(d.A) + ' m'], ['T', fplain(d.T) + ' s'], ['v_max', fplain(d.vmax) + ' m/s'], ['a_max', fplain(d.amax) + ' m/s²']].forEach(([l, val], i) => { text(l, 400, 188 + i * 16, { font: '700 11px ' + mono, col: '#4a4a4a' }); text(val, 585, 188 + i * 16, { align: 'right', font: '700 11px ' + mono }); });
    ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2.2; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(397, 262); ctx.lineTo(425, 262); ctx.stroke(); ctx.setLineDash([]); text('target', 432, 266, { font: '600 11px ' + sg });
    ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2.8; ctx.beginPath(); ctx.moveTo(492, 262); ctx.lineTo(520, 262); ctx.stroke(); text('yours', 527, 266, { font: '600 11px ' + sg });
    if (SMG.reveal){ text('Target: A = ' + fplain(tg.A) + ' m, T = ' + fplain(tg.T) + ' s', 395, 288, { font: '700 10px ' + mono, col: '#1546d6' }); text('starts ' + SMWORDS[tg.ph], 395, 302, { font: '600 10px ' + mono, col: '#1546d6' });
      if (d.lvl === '3') text('e.g. m = ' + fplain(tg.m) + ' kg, k = ' + fplain(tg.k) + ' N/m', 395, 316, { font: '600 10px ' + mono, col: '#1546d6' }); }
    else text(d.lvl === '3' ? 'Read A and T from the dashed curve,' : 'Read A and T from the dashed curve.', 395, 292, { font: '500 11px ' + sg, col: '#4a4a4a' }), d.lvl === '3' && text('then choose m and k to make that T.', 395, 306, { font: '500 11px ' + sg, col: '#4a4a4a' });
  }
};
