// Conical Pendulum: bob on a string moving in a horizontal circle.
const SIM = {
  title: 'Conical Pendulum',
  modes: [{ id: 'cone', label: 'Conical pendulum' }, { id: 'whirl', label: 'Whirligig lab' }],
  presets: [{ label: 'Lab: heavy washers', mode: 'whirl', v: { M: 150 } }, { label: 'Lab: light washers', mode: 'whirl', v: { M: 40 } }],
  ivs(mode){
    if (mode === 'whirl') return [
      { id: 'M', sym: 'M', symText: 'M', label: 'Hanging mass (washers)', unit: 'g', min: 20, max: 200, step: 5, val: 60, graph: true },
      { id: 'ms', sym: 'm', symText: 'm', label: 'Stopper mass', unit: 'g', min: 10, max: 40, step: 1, val: 20 },
      { id: 'r', sym: 'r', symText: 'r', label: 'Radius of the circle', unit: 'm', min: 0.3, max: 1, step: 0.05, val: 0.6 }];
    return [
    { id: 'm', sym: 'm', symText: 'm', label: 'Bob mass', unit: 'kg', min: 0.1, max: 2, step: 0.05, val: 0.5 },
    { id: 'th', sym: 'θ', symText: 'θ', label: 'Angle from vertical', unit: '°', min: 5, max: 80, step: 1, val: 30, graph: true, show: v => v.toFixed(0) + '°' },
    { id: 'L', sym: 'L', symText: 'L', label: 'String length', unit: 'm', min: 0.3, max: 3, step: 0.05, val: 1.5 }]; },
  calc(v, mode){
    if (mode === 'whirl'){ const M = v.M / 1000, m = v.ms / 1000, Mg = M * G10, v2 = Mg * v.r / m, sp = Math.sqrt(v2), T = 2 * PI * v.r / sp; return { whirl: true, M, m, Mg, v2, sp, T, T10: 10 * T, r: v.r, slope: m / v.r }; }
    const th = v.th * DEG, W = v.m * G10, T = W / Math.cos(th), r = v.L * Math.sin(th), Fc = W * Math.tan(th);
    const sp = Math.sqrt(G10 * r * Math.tan(th)), P = 2 * PI * r / sp, Psimple = 2 * PI * Math.sqrt(v.L / G10);
    return { th, W, T, r, Fc, sp, P, Psimple, h: v.L * Math.cos(th), Tv: T * Math.cos(th), Th: T * Math.sin(th) };
  },
  dvs(mode){
    if (mode === 'whirl') return [
      { id: 'T10', name: 'Time for 10 revolutions', short: 'T10', sym: 'T<sub>10</sub>', unit: 's', f: d => d.T10 },
      { id: 'sp', name: 'Speed v', short: 'v', sym: 'v', unit: 'm/s', f: d => d.sp },
      { id: 'v2', name: 'v² (m²/s²)', short: 'v²', sym: 'v²', unit: 'm²/s²', f: d => d.v2 },
      { id: 'Mg', name: 'Tension Mg', short: 'Mg', sym: 'Mg', unit: 'N', f: d => d.Mg }];
    return [
    { id: 'T', name: 'Tension T', short: 'T', sym: 'T', unit: 'N', f: d => d.T, vs: 'W' },
    { id: 'sp', name: 'Speed v', short: 'v', sym: 'v', unit: 'm/s', f: d => d.sp },
    { id: 'P', name: 'Period (time for one circle)', short: 'period', sym: 'period', unit: 's', f: d => d.P },
    { id: 'Fc', name: 'Centripetal force T sinθ', short: 'T sinθ', sym: 'T sinθ', unit: 'N', f: d => d.Fc },
    { id: 'r', name: 'Circle radius r', short: 'r', sym: 'r', unit: 'm', f: d => d.r },
    { id: 'W', name: 'Weight mg', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W }]; },
  work(v, d, mode){
    if (mode === 'whirl') return workWhirl(v, d);
    const g = M.n(10, 'm/s²');
    return '<h4>1 · Radius of the circle (not the string length!)</h4>' + TEX`r = L\,\sin\theta` + TEX`r = (${M.iv('L')})\,\sin ${M.iv('th')}` + TEXA`r = ${M.n(d.r, 'm')}` +
      '<h4>2 · Vertical: the bob stays at one height, so a<sub>y</sub> = 0</h4>' + TEX`T\,\cos\theta = m g` + TEX`T = \frac{m g}{\cos\theta}` + TEX`T = \frac{(${M.iv('m')})(${g})}{\cos ${M.iv('th')}}` + TEXA`T = ${M.n(d.T, 'N')}` +
      '<p class="note">T is always more than mg: only part of it (T cosθ) holds the bob up.</p>' +
      '<h4>3 · Horizontal: T sinθ is the centripetal force</h4>' + TEX`T\,\sin\theta = \frac{m v^2}{r}` + TEX`F_c = T\,\sin\theta` + TEX`F_c = ${M.n(d.T, 'N')} \times \sin ${M.iv('th')}` + TEXA`F_c = ${M.n(d.Fc, 'N')}` +
      '<h4>4 · Divide the two equations to get the speed</h4>' + TEX`\tan\theta = \frac{v^2}{g r}` + TEX`v = \sqrt{g\,r\,\tan\theta}` + TEX`v = \sqrt{(${g})(${M.n(d.r, 'm')})\,\tan ${M.iv('th')}}` + TEXA`v = ${M.n(d.sp, 'm/s')}` +
      '<h4>5 · Period (one trip around)</h4>' + TEX`\text{period} = \frac{2\pi r}{v}` + TEX`\text{period} = \frac{2\pi (${M.n(d.r, 'm')})}{${M.n(d.sp, 'm/s')}}` + TEXA`\text{period} = ${M.n(d.P, 's')}` +
      '<p class="note">Same as 2π√(L cosθ / g). The mass cancels in steps 4 and 5. Compare a simple pendulum of the same length: 2π√(L/g) = ' + H.n(d.Psimple, 's') + '.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle('SIDE VIEW (seen at a slight tilt)', 10, 18);
    let k = 88; if (k * v.L * Math.sin(d.th) > 170) k = 170 / (v.L * Math.sin(d.th));
    if (k < 88) text('zoomed out to fit', 12, 300, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    const px = 200, py = 32, Lp = k * v.L, rp = Lp * Math.sin(d.th), hp = Lp * Math.cos(d.th), cy = py + hp, squash = 0.28;
    ctx.fillStyle = '#111'; ctx.fillRect(px - 50, py - 8, 100, 6);
    ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.ellipse(px, cy, Math.max(rp, 0.1), Math.max(rp * squash, 0.1), 0, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, cy); ctx.stroke(); ctx.setLineDash([]);
    text('h', px + 4, py + hp / 2, { font: '600 11px "Space Grotesk",sans-serif', col: '#8a8a8a' });
    if (A.ph === undefined) A.ph = 0; A.ph += (2 * PI / Math.max(0.4, d.P)) * dt;
    const bx = px + rp * Math.cos(A.ph), by = cy + rp * squash * Math.sin(A.ph);
    const front = Math.sin(A.ph) > 0;
    ctx.strokeStyle = front ? '#111' : '#888'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
    ctx.fillStyle = front ? '#ff6a2b' : '#ffb28f'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, 6 + 4 * Math.sqrt(v.m), 0, 7); ctx.fill(); ctx.stroke();
    // r label on the near side
    ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px + rp, cy); ctx.stroke(); text('r', px + rp / 2, cy - 4, { font: '600 11px "Space Grotesk",sans-serif', col: '#8a8a8a' });
    text('θ', px + 6, py + 26, { font: '700 12px "Space Grotesk",sans-serif', col: '#4a4a4a' });
    text('period ' + fplain(d.P) + ' s', 12, 318, { font: '600 12px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // FBD when the bob is at the right edge (center of circle to the left)
    const fx = 480, fy = 175; panelTitle('FREE-BODY DIAGRAM', 380, 18); text('(bob at the right edge; center ←)', 380, 34, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    const sc = 85 / Math.max(d.T, d.W);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(fx, fy, 6, 0, 7); ctx.fill();
    const tx = -Math.sin(d.th) * d.T * sc, ty = -Math.cos(d.th) * d.T * sc;
    arrow(fx, fy, fx + tx, fy + ty, COL.T, 'T', { lx: -8, ly: -4 });
    arrow(fx, fy, fx, fy + d.W * sc, COL.W, 'mg', { lx: 8, ly: 0 });
    arrow(fx, fy, fx + tx, fy, COL.comp, 'T sinθ', { w: 2, dash: [4, 3], lx: -6, ly: 12, align: 'right' });
    arrow(fx, fy, fx, fy + ty, COL.comp, 'T cosθ', { w: 2, dash: [4, 3], lx: 8, ly: 0 });
    text('T cosθ = mg', 380, 296, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' });
    text('T sinθ = mv²/r', 380, 312, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' });
  }
};

const _baseDraw = SIM.draw;
SIM.draw = function(v, d, mode, opt, t, dt, A){
  if (mode === 'whirl') return drawWhirl(v, d, t, dt, A);
  return _baseDraw.apply(this, arguments);
};

// ---------- Whirligig lab ----------
const WF = '"Space Grotesk",sans-serif', WM = '"IBM Plex Mono",monospace';
const WH = window._wh = window._wh || { pts: [], msg: '', msgT: -9, btn: [], cur: null };
function btnDraw(x, y, w, h, label, hot){ WH.btn.push({ x, y, w, h, label }); ctx.save(); ctx.fillStyle = hot ? '#ff6a2b' : '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); ctx.restore(); text(label, x + w / 2, y + h / 2 + 4.5, { align: 'center', font: '700 12px ' + WF, col: hot ? '#fff' : '#111' }); }
function whRecord(){ const v = S.v, d = S.d; if (!d || !d.whirl) return; const pt = { M: v.M, m: v.ms, r: v.r, T10: d.T10, Mg: d.Mg, v2: d.v2 };
  const k = WH.pts.findIndex(p => Math.abs(p.M - v.M) < 0.01 && p.m === v.ms && p.r === v.r);
  if (k >= 0) WH.pts[k] = pt; else if (WH.pts.length >= 8){ WH.msg = 'Table full: clear it first'; WH.msgT = S.t; return update(); } else WH.pts.push(pt);
  WH.msg = 'Recorded M = ' + fplain(v.M) + ' g, 10 rev = ' + fplain(d.T10) + ' s'; WH.msgT = S.t; update(); }
function whClear(){ WH.pts.length = 0; WH.msg = 'Table cleared'; WH.msgT = S.t; update(); }
const WACT = { 'Record point': () => S.mode === 'whirl' && whRecord(), 'Clear table': () => S.mode === 'whirl' && whClear() };
(function(){ const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 600, (e.clientY - r.top) / r.height * 330]; };
  const hit = e => { const [x, y] = pos(e); return WH.btn.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h); };
  cv.addEventListener('pointerdown', e => { const b = hit(e); if (b && WACT[b.label]){ WACT[b.label](); e.preventDefault(); } });
  cv.addEventListener('pointermove', e => { cv.style.cursor = S.mode === 'whirl' && hit(e) ? 'pointer' : ''; });
  document.addEventListener('keydown', e => { if (e.ctrlKey || e.metaKey || e.altKey || S.mode !== 'whirl') return; const k = e.key.toLowerCase(); if (k === 'r') whRecord(); else if (k === 'c') whClear(); }); })();
function fitOrigin(pts){ let sxy = 0, sxx = 0; pts.forEach(([x, y]) => { sxy += x * y; sxx += x * x; }); return sxx > 1e-12 ? sxy / sxx : null; }
function niceMax(x, list){ return list.find(n => n >= x) || Math.ceil(x); }

function workWhirl(v, d){
  const pts = WH.pts, n = pts.length;
  let h = '<h4>1 · The string pulls with the hanging weight</h4><p class="st">The washers hang still, so the tension equals their weight. The string passes over the tube, so it pulls the stopper with the same tension. (Friction in the tube is ignored.)</p>' +
    TEX`T = Mg` + TEX`T = (${M.iv('M', 0.001)}\,\text{kg})(10\,\text{m/s}^2)` + TEXA`T = ${M.n(d.Mg, 'N')}` +
    '<h4>2 · That tension is the centripetal force</h4><p class="st">We treat the string as horizontal (really it sags a little, since gravity pulls on the stopper too).</p>' +
    TEX`Mg = \frac{m v^2}{r}` + TEX`v = \sqrt{\frac{M g\,r}{m}}` + TEX`v = \sqrt{\frac{(${M.n(d.Mg)})(${M.iv('r')})}{${M.iv('ms', 0.001)}\,\text{kg}}}` + TEXA`v = ${M.n(d.sp, 'm/s')}` +
    '<h4>3 · What the stopwatch shows</h4><p class="st">Time one trip around, then time 10 trips to reduce the error:</p>' +
    TEX`T = \frac{2\pi r}{v}` + TEX`T = \frac{2\pi (${M.iv('r')})}{${M.n(d.sp)}}` + TEXA`T = ${M.n(d.T, 's')}` + TEXA`T_{10} = 10\,T = ${M.n(d.T10, 's')}` +
    '<h4>4 · Your data</h4>';
  if (n < 2) return h + '<p class="st">In the lab you only measure T₁₀ and r, then get v = 2πr/T. Change M and use <b>Record point</b> on the picture (or press R) at 4 or more masses. Keep m and r the same. Points so far: ' + n + '.</p>';
  const L = fitOrigin(pts.map(p => [p.v2, p.Mg])); if (!L) return h + '<p class="st">Use different hanging masses.</p>';
  const mixed = pts.some(p => p.m !== pts[0].m || p.r !== pts[0].r), r0 = pts[0].r, m0 = pts[0].m;
  h += '<p class="st">From the timing, each point has v = 2πr/T. Rearrange Mg = mv²/r as a straight line:</p>' + TEX`Mg = \left(\frac{m}{r}\right) v^2` +
    '<p class="st">Plot Mg (y) against v² (x): a line through the origin with slope m/r. Best fit for your ' + n + ' points:</p>' + TEXA`\text{slope} = ${M.n(L, 'kg/m')}`;
  if (mixed) return h + '<div class="bad">You changed m or r between points, so they do not lie on one line. Clear the table and keep m and r the same.</div>';
  const mfit = L * r0;
  h += '<h4>5 · Stopper mass from the slope</h4>' + TEX`m = \text{slope} \times r` + TEX`m = (${M.n(L)})(${M.n(r0, 'm')})` + TEXA`m = ${M.n(mfit * 1000, 'g')}` +
    '<p class="note">The stopper’s real mass is ' + H.n(m0, 'g') + ': your slope is off by ' + fnum(Math.abs(mfit * 1000 - m0) / m0 * 100) + '%.</p>';
  return h;
}
function drawWhirl(v, d, t, dt, A){
  WH.btn = []; WH.cur = { v, d };
  if (A.rev === undefined || A.reset){ A.rev = 0; A.hold = 0; }
  if (A.hold > 0){ A.hold -= dt; if (A.hold <= 0){ A.rev = 0; A.hold = 0; } }
  else { A.rev += dt / d.T; if (A.rev >= 10){ A.rev = 10; A.hold = 2.2; } }
  const el = A.rev * d.T, ph = -2 * PI * A.rev;
  panelTitle('WHIRLIGIG: TOP VIEW', 10, 18);
  // top view
  const cx = 125, cy = 150, rp = 100 * v.r;
  ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(cx, cy, rp, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  const bx = cx + rp * Math.cos(ph), by = cy + rp * Math.sin(ph);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
  ctx.fillStyle = '#e8e8e8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, 7); ctx.fill(); ctx.stroke(); text('tube', cx, cy + 20, { align: 'center', font: '600 10px ' + WF, col: '#4a4a4a' });
  ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, 6 + 5 * Math.sqrt(v.ms / 40), 0, 7); ctx.fill(); ctx.stroke();
  // velocity (tangent, counterclockwise on screen) and tension (toward centre)
  const dirx = Math.sin(ph), diry = -Math.cos(ph); // d/d(rev) of position is (-sin ph, cos ph)*(-2pi) -> (sin ph, -cos ph)
  arrow(bx, by, bx + dirx * (12 + d.sp * 5), by + diry * (12 + d.sp * 5), COL.V, 'v', { lx: dirx * 6, ly: diry * 6 });
  const tl = Math.min(rp - 14, 12 + d.Mg * 30); arrow(bx, by, bx - Math.cos(ph) * tl, by - Math.sin(ph) * tl, COL.T, 'T', { lx: -Math.cos(ph) * 6, ly: -Math.sin(ph) * 6 - 6 });
  text('r = ' + fplain(v.r) + ' m', 12, 268, { font: '700 12px ' + WM, col: '#4a4a4a' });
  // stopwatch
  ctx.fillStyle = '#111'; ctx.fillRect(268, 26, 114, 52); ctx.fillStyle = '#9ef0b4'; ctx.font = '700 22px ' + WM; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.fillText(el.toFixed(2) + ' s', 374, 56);
  text('rev ' + (A.hold > 0 ? '10' : String(Math.floor(A.rev))) + ' / 10', 274, 72, { font: '600 10.5px ' + WM, col: '#cfcfcf' }); if (A.hold > 0) text('T₁₀', 376, 72, { align: 'right', font: '700 10.5px ' + WM, col: '#9ef0b4' });
  // side schematic: tube, horizontal string, hanging washers
  const tbx = 292, sy = 130, ex = tbx + 20 + 52 * v.r, wy = 222;
  ctx.fillStyle = '#e8e8e8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(tbx - 5, sy - 6, 10, 74); ctx.strokeRect(tbx - 5, sy - 6, 10, 74);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tbx, sy); ctx.lineTo(ex, sy); ctx.moveTo(tbx, sy + 68); ctx.lineTo(tbx, wy); ctx.stroke();
  ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(ex, sy, 6 + 5 * Math.sqrt(v.ms / 40), 0, 7); ctx.fill(); ctx.stroke();
  const nW = Math.max(1, Math.round(v.M / 20));
  for (let i = 0; i < nW; i++){ ctx.fillStyle = '#9a9a9a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.fillRect(tbx - 11, wy + i * 4, 22, 3.5); ctx.strokeRect(tbx - 11, wy + i * 4, 22, 3.5); }
  const aw = Math.min(40, 8 + d.Mg * 14);
  arrow(ex, sy, ex - aw - 2, sy, COL.T, 'T', { lx: -4, ly: -12, align: 'right' }); arrow(tbx + 14, wy + 8, tbx + 14, wy + 8 + aw * 0.7, COL.W, 'Mg', { lx: 5, ly: 2 });
  text('M = ' + fplain(v.M) + ' g', tbx - 16, wy + 16, { align: 'right', font: '700 11px ' + WF, col: '#4a4a4a' }); text('m = ' + fplain(v.ms) + ' g', ex, sy + 24, { align: 'center', font: '700 11px ' + WF, col: '#4a4a4a' });
  text('string taken as horizontal', 268, 94, { font: '500 9.5px ' + WM, col: '#8a8a8a' });
  text('v = ' + fplain(d.sp) + ' m/s    T = ' + fplain(d.T) + ' s per rev', 12, 284, { font: '600 11px ' + WM, col: '#4a4a4a' });
  // buttons
  btnDraw(14, 294, 96, 26, 'Record point', S.t - WH.msgT < 0.25); btnDraw(118, 294, 90, 26, 'Clear table', false);
  if (S.t - WH.msgT < 3.5) text(WH.msg, 216, 311, { font: '600 10px ' + WF, col: '#4a4a4a' }); else text('keys: R record, C clear', 216, 311, { font: '500 10px ' + WM, col: '#8a8a8a' });
  // data table
  panelTitle('DATA TABLE', 395, 18);
  [['M (g)', 440], ['T₁₀ (s)', 495], ['Mg (N)', 545], ['v² ', 596]].forEach(([a, x]) => text(a, x, 33, { align: 'right', font: '700 10px ' + WM, col: '#4a4a4a' }));
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(396, 37); ctx.lineTo(596, 37); ctx.stroke();
  WH.pts.forEach((q, i) => { const y = 49 + i * 12; text(String(i + 1), 398, y, { font: '500 10px ' + WM, col: '#8a8a8a' }); text(fplain(q.M), 440, y, { align: 'right', font: '600 11px ' + WM }); text(q.T10.toFixed(2), 495, y, { align: 'right', font: '600 11px ' + WM }); text(q.Mg.toFixed(2), 545, y, { align: 'right', font: '600 11px ' + WM }); text(q.v2.toFixed(1), 596, y, { align: 'right', font: '600 11px ' + WM }); });
  if (!WH.pts.length) text('(empty: record a point)', 400, 53, { font: '500 10.5px ' + WF, col: '#8a8a8a' });
  // plot Mg vs v²
  const q2 = WH.pts.map(q => [q.v2, q.Mg]), L = fitOrigin(q2);
  const xmax = niceMax(Math.max(10, ...q2.map(a => a[0]), d.v2) * 1.05, [10, 20, 40, 60, 80, 100, 150, 200, 300]), ymax = niceMax(Math.max(0.5, ...q2.map(a => a[1]), d.Mg) * 1.05, [0.5, 1, 1.5, 2, 3]);
  const px0 = 434, px1 = 584, py0 = 292, py1 = 196, PX = x => px0 + x / xmax * (px1 - px0), PY = y => py0 - y / ymax * (py0 - py1);
  panelTitle('Mg (N) vs v² (m²/s²)', 395, 180);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px0, py1 - 4); ctx.lineTo(px0, py0); ctx.lineTo(px1 + 4, py0); ctx.stroke();
  [0, xmax / 2, xmax].forEach(x => { text(fplain(x), PX(x), py0 + 12, { align: 'center', font: '500 9px ' + WM, col: '#4a4a4a' }); ctx.strokeStyle = '#e3e0d6'; ctx.beginPath(); ctx.moveTo(PX(x), py0); ctx.lineTo(PX(x), py1); ctx.stroke(); });
  [0, ymax / 2, ymax].forEach(y => { text(fplain(y), px0 - 4, PY(y) + 3, { align: 'right', font: '500 9px ' + WM, col: '#4a4a4a' }); ctx.strokeStyle = '#e3e0d6'; ctx.beginPath(); ctx.moveTo(px0, PY(y)); ctx.lineTo(px1, PY(y)); ctx.stroke(); });
  if (L !== null){ const mixed = WH.pts.some(p => p.m !== WH.pts[0].m || p.r !== WH.pts[0].r); ctx.save(); ctx.beginPath(); ctx.rect(px0, py1 - 4, px1 - px0 + 4, py0 - py1 + 4); ctx.clip(); ctx.strokeStyle = mixed ? '#999' : '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PX(0), PY(0)); ctx.lineTo(PX(xmax), PY(L * xmax)); ctx.stroke(); ctx.restore();
    text('slope = ' + fplain(L) + ' kg/m', 395, 150, { font: '600 11px ' + WF, col: '#1546d6' });
    text(mixed ? 'm or r changed: not one line' : 'm = slope × r ≈ ' + fplain(L * WH.pts[0].r * 1000) + ' g', 395, 164, { font: '700 11.5px ' + WF, col: mixed ? '#c43a00' : '#1546d6' }); }
  q2.forEach(([x, y]) => { ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(PX(x), PY(y), 3.8, 0, 7); ctx.fill(); ctx.stroke(); });
  if (L === null) text(WH.pts.length ? 'need 2+ points for a line' : 'points will appear here', (px0 + px1) / 2, 245, { align: 'center', font: '500 10.5px ' + WF, col: '#8a8a8a' });
}
