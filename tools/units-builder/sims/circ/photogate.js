// Photogate Ramp (AP 1 kinematics lab rehearsal): a cart on a frictionless ramp (a = g sin θ) passes a photogate; the flag's blocked time Δt gives v = w/Δt. One gate: v² = 2ad. Two gates: a = Δv/Δt. Record points and plot v² vs d.
const PGF = '"Space Grotesk",sans-serif', PGM = '"IBM Plex Mono",monospace';
const PG = { pts: [], th: null, btn: [], msg: '', msgT: -9, cur: null };
const PGK = 215;                       // drawing scale: pixels per metre along the ramp
const PGC = ['#7a3fb0', '#1546d6'];     // gate 1, gate 2 colours
const tAt = (s, a) => Math.sqrt(2 * s / a);

const SIM = {
  title: 'Photogate Ramp',
  hint: 'v = w/Δt · v² = 2ad · a = g sin θ · g = 10 m/s²',
  modes: [{ id: 'one', label: 'One gate: v² = 2ad' }, { id: 'two', label: 'Two gates: a = Δv/Δt' }],
  ivs(mode){
    const th = { id: 'th', sym: 'θ', symText: 'θ', label: 'Ramp angle', unit: '°', min: 5, max: 30, step: 1, val: 20 };
    const w = { id: 'w', sym: 'w', symText: 'w', label: 'Flag width', unit: 'cm', min: 1, max: 10, step: 0.5, val: 3 };
    if (mode === 'two') return [th,
      { id: 'd1', sym: 'd<sub>1</sub>', symText: 'd1', label: 'Gate 1 position', unit: 'm', min: 0.15, max: 0.7, step: 0.05, val: 0.3, graph: true },
      { id: 'd2', sym: 'd<sub>2</sub>', symText: 'd2', label: 'Gate 2 position', unit: 'm', min: 0.4, max: 1.2, step: 0.05, val: 0.9 }, w];
    return [th, { id: 'd', sym: 'd', symText: 'd', label: 'Gate distance', unit: 'm', min: 0.2, max: 1.2, step: 0.05, val: 0.6, graph: true }, w];
  },
  presets: [{ label: 'Skinny flag (1 cm)', mode: 'one', v: { th: 20, d: 0.6, w: 1 } }, { label: 'Wide flag, close gate', mode: 'one', v: { th: 20, d: 0.2, w: 10 } },
    { label: 'Steep ramp', mode: 'one', v: { th: 30, d: 0.8, w: 3 } }, { label: 'Gentle ramp', mode: 'two', v: { th: 10, d: 0.5, w: 3, d1: 0.3, d2: 1.0 } }],
  calc(v, mode){
    const a = 10 * Math.sin(v.th * DEG), w = v.w / 100;
    const gate = dd => { const t1 = tAt(dd - w / 2, a), t2 = tAt(dd + w / 2, a); return { d: dd, t1, t2, dt: t2 - t1, v: w / (t2 - t1), vt: Math.sqrt(2 * a * dd) }; };
    if (mode === 'two'){
      const ds = [v.d1, v.d2].sort((x, y) => x - y), g1 = gate(ds[0]), g2 = gate(ds[1]), bad = ds[1] - ds[0] < 0.05, T = g2.t1 - g1.t1;
      return { two: true, a, w, gs: [g1, g2], g1, g2, T, bad, aMeas: bad ? NaN : (g2.v - g1.v) / T, send: ds[1] + w / 2 + 0.1 };
    }
    const g1 = gate(v.d);
    return { two: false, a, w, gs: [g1], g1, aMeas: g1.v * g1.v / (2 * v.d), send: v.d + w / 2 + 0.1 };
  },
  dvs(mode){
    const ath = { id: 'ath', name: 'Theory a = g sin θ', short: 'g sin θ', sym: 'g sin θ', unit: 'm/s²', f: d => d.a };
    if (mode === 'two') return [{ id: 'am', name: 'a from Δv/Δt', short: 'a', sym: 'a', unit: 'm/s²', vs: 'ath', f: d => d.aMeas },
      ath, { id: 'T', name: 'Time between gates', short: 'T', sym: 'T', unit: 's', f: d => d.T }, { id: 'v2', name: 'Speed at gate 2', short: 'v₂', sym: 'v<sub>2</sub>', unit: 'm/s', f: d => d.g2.v }];
    return [{ id: 'v', name: 'v = w/Δt', short: 'v', sym: 'v', unit: 'm/s', vs: 'vt', f: d => d.g1.v },
      { id: 'vt', name: 'True speed at gate', short: 'true v', sym: 'v<sub>true</sub>', unit: 'm/s', f: d => d.g1.vt },
      { id: 'dt', name: 'Blocked time Δt', short: 'Δt', sym: 'Δt', unit: 'ms', f: d => d.g1.dt * 1000 },
      { id: 'am', name: 'a from v² = 2ad', short: 'a', sym: 'a', unit: 'm/s²', vs: 'ath', f: d => d.aMeas }, ath];
  },
  work(v, d, mode){ syncTh(v); return mode === 'two' ? workTwo(v, d) : workOne(v, d); },
  draw(v, d, mode, opt, t, dt, A){ drawPG(v, d, mode, t, A); }
};

function syncTh(v){ if (PG.th !== null && PG.th !== v.th){ PG.pts.length = 0; PG.msg = 'Cleared (new angle)'; PG.msgT = S.t; } PG.th = v.th; }
function lsq(pts){ const n = pts.length; if (n < 2) return null; let sx = 0, sy = 0, sxx = 0, sxy = 0; pts.forEach(([x, y]) => { sx += x; sy += y; sxx += x * x; sxy += x * y; }); const den = n * sxx - sx * sx; if (Math.abs(den) < 1e-12) return null; const m = (n * sxy - sx * sy) / den; return { m, b: (sy - m * sx) / n }; }
function compareA(am, a){ const pc = (am - a) / a * 100; return '<p class="st">Your a is ' + H.n(Math.abs(pc), '%') + (pc < 0 ? ' below' : ' above') + ' the theory value' + (Math.abs(pc) < 3 ? ': a good match.' : '.') + '</p>'; }

function workOne(v, d){
  const g = d.g1, pts = PG.pts, n = pts.length;
  let h = '<h4>1 · The gate gives Δt</h4><p class="st">The flag (width w) blocks the beam while it passes. The timer reads:</p>' + TEXA`\Delta t = ${M.n(g.dt * 1000, 'ms')}`;
  h += '<h4>2 · Speed from the flag</h4><p class="st">The flag moves its own width in Δt. (Δt = ' + H.n(g.dt, 's') + '.)</p>' + TEX`v = \frac{w}{\Delta t}` + TEX`v = \frac{${M.iv('w', 0.01)}\,\text{m}}{${M.n(g.dt, 's')}}` + TEXA`v = ${M.n(g.v, 'm/s')}`;
  h += '<p class="note">This is the <b>average</b> speed over the flag. The true speed at the gate is ' + H.n(g.vt, 'm/s') + ' (' + fnum(Math.abs(g.v - g.vt) / g.vt * 100) + '% different). A narrower flag gives a better match.</p>';
  h += '<h4>3 · Acceleration from v² = 2ad</h4><p class="st">The cart starts from rest, so:</p>' + TEX`v^2 = 2ad` + TEX`a = \frac{v^2}{2d}` + TEX`a = \frac{(${M.n(g.v)})^2}{2\,(${M.iv('d')})}` + TEXA`a = ${M.n(d.aMeas, 'm/s²')}`;
  h += '<h4>4 · Compare with the ramp</h4><p class="st">No friction, so gravity along the slope is all there is:</p>' + TEX`a = g\sin\theta` + TEX`a = ${M.n(10)}\,\sin ${M.iv('th')}` + TEXA`a = ${M.n(d.a, 'm/s²')}` + compareA(d.aMeas, d.a);
  h += '<h4>5 · Your data</h4>';
  if (n < 2) return h + '<p class="st">Press <b>Record</b> at several gate distances d (same angle). Points so far: ' + n + '. Then v² vs d should be a straight line.</p>';
  const L = lsq(pts.map(p => [p.d, p.v * p.v]));
  if (!L) return h + '<p class="st">Use different gate distances so the points spread out.</p>';
  return h + '<p class="st">From v² = 2ad, a graph of v² against d has slope 2a. Best-fit line through your ' + n + ' points:</p>' + TEX`\text{slope} = ${M.n(L.m, 'm/s²')}` + TEX`a = \frac{\text{slope}}{2}` + TEX`a = \frac{${M.n(L.m)}}{2}` + TEXA`a = ${M.n(L.m / 2, 'm/s²')}` + compareA(L.m / 2, d.a);
}
function workTwo(v, d){
  const a = d.g1, b = d.g2;
  if (d.bad) return '<h4>Gates too close</h4><div class="bad">The two gates are almost on top of each other, so there is hardly any time between them. Move gate 2 farther down the ramp.</div>';
  let h = '<h4>1 · Speed at each gate</h4><p class="st">The same flag (width w) passes both gates.</p>';
  h += TEX`v_1 = \frac{w}{\Delta t_1}` + TEX`v_1 = \frac{${M.iv('w', 0.01)}\,\text{m}}{${M.n(a.dt, 's')}}` + TEXA`v_1 = ${M.n(a.v, 'm/s')}`;
  h += TEX`v_2 = \frac{w}{\Delta t_2}` + TEX`v_2 = \frac{${M.iv('w', 0.01)}\,\text{m}}{${M.n(b.dt, 's')}}` + TEXA`v_2 = ${M.n(b.v, 'm/s')}`;
  h += '<h4>2 · Time between the gates</h4><p class="st">The timer also reads how long the cart took to get from gate 1 to gate 2:</p>' + TEXA`T = ${M.n(d.T, 's')}`;
  h += '<h4>3 · Acceleration</h4><p class="st">Acceleration is the change in speed divided by the time it took:</p>' + TEX`a = \frac{v_2 - v_1}{T}` + TEX`a = \frac{${M.n(b.v)} - ${M.n(a.v)}}{${M.n(d.T)}}` + TEXA`a = ${M.n(d.aMeas, 'm/s²')}`;
  h += '<h4>4 · Compare with the ramp</h4>' + TEX`a = g\sin\theta` + TEX`a = ${M.n(10)}\,\sin ${M.iv('th')}` + TEXA`a = ${M.n(d.a, 'm/s²')}` + compareA(d.aMeas, d.a);
  return h + '<p class="note">A small difference is normal: each v = w/Δt is an average over the flag, not the exact speed at the beam.</p>';
}

function btnDraw(x, y, w, h, label, hot){ PG.btn.push({ x, y, w, h, label }); ctx.save(); ctx.fillStyle = hot ? '#ff6a2b' : '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); ctx.restore(); text(label, x + w / 2, y + h / 2 + 4.5, { align: 'center', font: '700 12px ' + PGF, col: hot ? '#fff' : '#111' }); }
function pgReplay(){ S.anim.reset = true; }
function pgRecord(){
  const c = PG.cur; if (!c || c.mode !== 'one') return; const g = c.d.g1;
  const k = PG.pts.findIndex(p => Math.abs(p.d - c.v.d) < 0.001);
  if (k >= 0){ PG.pts[k] = { d: c.v.d, dt: g.dt, v: g.v }; PG.msg = 'Updated #' + (k + 1); }
  else if (PG.pts.length >= 6){ PG.msg = 'Table full: clear it'; PG.msgT = S.t; return update(); }
  else { PG.pts.push({ d: c.v.d, dt: g.dt, v: g.v }); PG.msg = 'Recorded #' + PG.pts.length; }
  PG.msgT = S.t; update();
}
function pgClear(){ PG.pts.length = 0; PG.msg = 'Table cleared'; PG.msgT = S.t; update(); }
const PGACT = { 'Replay': pgReplay, 'Record': () => S.mode === 'one' && pgRecord(), 'Clear': () => S.mode === 'one' && pgClear() };
(function(){
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 600, (e.clientY - r.top) / r.height * 330]; };
  const hit = e => { const [x, y] = pos(e); return PG.btn.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h); };
  cv.addEventListener('pointerdown', e => { const b = hit(e); if (b && PGACT[b.label]){ PGACT[b.label](); e.preventDefault(); } });
  cv.addEventListener('pointermove', e => { cv.style.cursor = hit(e) ? 'pointer' : ''; });
  document.addEventListener('keydown', e => { if (e.ctrlKey || e.metaKey || e.altKey) return; const tg = e.target && e.target.tagName; if (tg === 'BUTTON' || tg === 'SELECT') return;
    const k = e.key.toLowerCase(); if (k === 'p') pgReplay(); else if (k === 'r' && S.mode === 'one') pgRecord(); else if (k === 'c' && S.mode === 'one') pgClear(); });
})();
function niceMax(x){ const p = Math.pow(10, Math.floor(Math.log10(x))), m = x / p; return p * [1, 2, 2.5, 5, 10].find(q => q >= m - 1e-9); }

function drawPG(v, d, mode, t, A){
  syncTh(v); PG.btn = []; PG.cur = { v, d, mode };
  if (A.t0 === undefined || A.reset) A.t0 = t;
  const th = v.th * DEG, a = d.a, tau = Math.max(0, t - A.t0 - 0.5), P0x = 24, P0y = 72, K = PGK, Lp = 1.5 * K;
  const s = Math.min(d.send, 0.5 * a * tau * tau), wpx = v.w / 100 * K;
  panelTitle('PHOTOGATE RAMP', 10, 18);
  // wedge + ground
  const P1x = P0x + Lp * Math.cos(th), P1y = P0y + Lp * Math.sin(th);
  ctx.fillStyle = '#efeadb'; ctx.beginPath(); ctx.moveTo(P0x, P0y); ctx.lineTo(P1x, P1y); ctx.lineTo(P0x, P1y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, P1y + 9); ctx.lineTo(378, P1y + 9); ctx.stroke();
  ctx.save(); ctx.translate(P0x, P0y); ctx.rotate(th);
  ctx.fillStyle = '#cfc8b4'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(-30, 0, Lp + 30, 8); ctx.strokeRect(-30, 0, Lp + 30, 8);
  ctx.fillStyle = '#8a8a8a'; ctx.fillRect(-26, -14, 4, 14);
  // cm tick marks every 10 cm
  ctx.strokeStyle = '#555'; ctx.lineWidth = 1; for (let m = 0; m <= 1.5001; m += 0.1){ ctx.beginPath(); ctx.moveTo(m * K, 8); ctx.lineTo(m * K, Math.abs(m * 10 % 5) < 1e-6 && Math.round(m * 10) % 5 === 0 ? 12 : 11); ctx.stroke(); }
  // distance lines from the release point
  d.gs.forEach((g, i) => { const x = g.d * K, yy = 22 + i * 14; ctx.strokeStyle = PGC[d.two ? i : 0]; ctx.lineWidth = 1.3; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(x, yy); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(0, yy - 4); ctx.lineTo(0, yy + 4); ctx.moveTo(x, yy - 4); ctx.lineTo(x, yy + 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x, yy - 4); ctx.stroke();
    text((d.two ? 'd' + (i + 1) + ' = ' : 'd = ') + fplain(g.d) + ' m', Math.max(x / 2, 34), yy - 4, { align: 'center', font: '700 10.5px ' + PGF, col: PGC[d.two ? i : 0] }); });
  // gates
  const lit = d.gs.map(g => tau >= g.t1 && tau <= g.t2 + 0.45), blocked = d.gs.map(g => tau >= g.t1 && tau <= g.t2);
  d.gs.forEach((g, i) => { const x = g.d * K, col = PGC[d.two ? i : 0];
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(x - 6, -48, 12, 28); ctx.fillStyle = col; ctx.fillRect(x - 6, -48, 12, 5);
    if (d.two){ ctx.save(); ctx.fillStyle = '#fff'; ctx.font = '700 9px ' + PGM; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), x, -22); ctx.restore(); }
    ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, -20); ctx.lineTo(x, 0); ctx.stroke();
    if (lit[i]){ ctx.fillStyle = 'rgba(214,40,40,0.28)'; ctx.beginPath(); ctx.arc(x, -34, 11, 0, 7); ctx.fill(); }
    ctx.fillStyle = lit[i] ? '#e02020' : '#1e7d45'; ctx.beginPath(); ctx.arc(x, -34, 4.2, 0, 7); ctx.fill(); });
  // cart with flag
  const cx = s * K;
  ctx.fillStyle = '#1546d6'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(cx - 18, -14, 36, 10); ctx.strokeRect(cx - 18, -14, 36, 10);
  ctx.fillStyle = '#fff'; [-11, 11].forEach(o => { ctx.beginPath(); ctx.arc(cx + o, -3, 3.4, 0, 7); ctx.fill(); ctx.stroke(); });
  ctx.fillStyle = '#ff6a2b'; ctx.fillRect(cx - wpx / 2, -38, wpx, 24); ctx.strokeRect(cx - wpx / 2, -38, wpx, 24);
  ctx.restore();
  // status
  const anyB = blocked.some(Boolean);
  text(anyB ? 'BEAM BLOCKED' : 'beam clear', 382, 18, { align: 'right', font: '700 11px ' + PGM, col: anyB ? '#c43a00' : '#1e7d45' });
  // readouts
  const ms = g => fplain(g.dt * 1000) + ' ms';
  if (!d.two){ const g = d.g1;
    text('Δt = ' + ms(g) + '    v = w/Δt = ' + fplain(g.v) + ' m/s', 14, 256, { font: '700 12.5px ' + PGF, col: '#7a3fb0' });
    text('true speed at the gate = ' + fplain(g.vt) + ' m/s', 14, 271, { font: '600 12px ' + PGF, col: '#4a4a4a' });
    text('a = v²/2d = ' + fplain(d.aMeas) + ' m/s²    g sin θ = ' + fplain(d.a) + ' m/s²', 14, 286, { font: '700 12.5px ' + PGF, col: '#1546d6' });
  } else if (d.bad) text('Gates too close: move gate 2 down the ramp', 14, 262, { font: '700 12.5px ' + PGF, col: '#c43a00' });
  else {
    d.gs.forEach((g, i) => text('gate ' + (i + 1) + ': Δt = ' + ms(g) + ', v = ' + fplain(g.v) + ' m/s', 14, 256 + i * 15, { font: '700 12.5px ' + PGF, col: PGC[i] }));
    text('T = ' + fplain(d.T) + ' s → a = Δv/T = ' + fplain(d.aMeas) + ' m/s²  (g sin θ = ' + fplain(d.a) + ')', 14, 286, { font: '700 12px ' + PGF, col: '#111' });
  }
  // buttons
  btnDraw(14, 294, 70, 26, 'Replay', false);
  if (mode === 'one'){ btnDraw(92, 294, 74, 26, 'Record', S.t - PG.msgT < 0.25); btnDraw(174, 294, 60, 26, 'Clear', false); }
  const hx = mode === 'one' ? 242 : 96;
  if (S.t - PG.msgT < 3.5) text(PG.msg, hx, 311, { font: '600 10.5px ' + PGF, col: '#4a4a4a' }); else text(mode === 'one' ? 'keys: P replay, R record' : 'key: P replay', hx, 311, { font: '500 10px ' + PGM, col: '#8a8a8a' });
  if (mode === 'one') drawOneRight(v, d); else drawTwoRight(d);
}

function drawOneRight(v, d){
  panelTitle('DATA TABLE', 395, 18);
  [['d(m)', 446], ['Δt(ms)', 498], ['v(m/s)', 547], ['v²', 593]].forEach(([a, x]) => text(a, x, 33, { align: 'right', font: '700 9.5px ' + PGM, col: '#4a4a4a' }));
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(396, 37); ctx.lineTo(596, 37); ctx.stroke();
  PG.pts.forEach((p, i) => { const y = 49 + i * 12, f = { font: '600 11px ' + PGM }; text(String(i + 1), 400, y, { font: '500 10px ' + PGM, col: '#8a8a8a' }); text(fplain(p.d), 446, y, Object.assign({ align: 'right' }, f)); text(fplain(p.dt * 1000), 498, y, Object.assign({ align: 'right' }, f)); text(fplain(p.v), 547, y, Object.assign({ align: 'right' }, f)); text(fplain(p.v * p.v), 593, y, Object.assign({ align: 'right' }, f)); });
  if (!PG.pts.length) text('(empty: press Record)', 400, 53, { font: '500 10.5px ' + PGF, col: '#8a8a8a' });
  const L = lsq(PG.pts.map(p => [p.d, p.v * p.v]));
  if (L){ text('slope = 2a = ' + fplain(L.m) + ' m/s²', 395, 127, { font: '600 11px ' + PGF, col: '#1546d6' }); text('a = ' + fplain(L.m / 2) + ' m/s²  (theory ' + fplain(d.a) + ')', 395, 140, { font: '700 11.5px ' + PGF, col: '#1546d6' }); }
  const ymax = niceMax(2 * d.a * 1.2 * 1.05), px0 = 432, px1 = 584, py0 = 292, py1 = 168, PX = x => px0 + x / 1.2 * (px1 - px0), PY = y => py0 - y / ymax * (py0 - py1);
  panelTitle('v² (m²/s²) vs d (m)', 395, 156);
  ctx.strokeStyle = '#e3e0d6'; ctx.lineWidth = 1; [0.6, 1.2].forEach(x => { ctx.beginPath(); ctx.moveTo(PX(x), py0); ctx.lineTo(PX(x), py1); ctx.stroke(); }); [ymax / 2, ymax].forEach(y => { ctx.beginPath(); ctx.moveTo(px0, PY(y)); ctx.lineTo(px1, PY(y)); ctx.stroke(); });
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px0, py1 - 3); ctx.lineTo(px0, py0); ctx.lineTo(px1 + 4, py0); ctx.stroke();
  [0, 0.6, 1.2].forEach(x => text(x === 0 ? '0' : String(x), PX(x), py0 + 12, { align: 'center', font: '500 9px ' + PGM, col: '#4a4a4a' }));
  [[0, '0'], [ymax / 2, fplain(ymax / 2)], [ymax, fplain(ymax)]].forEach(([y, s]) => text(s, px0 - 4, PY(y) + 3, { align: 'right', font: '500 9px ' + PGM, col: '#4a4a4a' }));
  ctx.save(); ctx.beginPath(); ctx.rect(px0, py1 - 4, px1 - px0 + 4, py0 - py1 + 4); ctx.clip();
  ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1.3; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(PX(0), PY(0)); ctx.lineTo(PX(1.2), PY(2 * d.a * 1.2)); ctx.stroke(); ctx.setLineDash([]);
  if (L){ ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PX(0), PY(L.b)); ctx.lineTo(PX(1.2), PY(L.m * 1.2 + L.b)); ctx.stroke(); }
  ctx.restore();
  PG.pts.forEach(p => { ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(PX(p.d), PY(p.v * p.v), 3.8, 0, 7); ctx.fill(); ctx.stroke(); });
  text('dashed: theory', px1, py1 + 9, { align: 'right', font: '500 9.5px ' + PGM, col: '#8a8a8a' });
  if (!L) text(PG.pts.length ? 'need 2+ points for a line' : 'points will appear here', (px0 + px1) / 2, 235, { align: 'center', font: '500 10.5px ' + PGF, col: '#8a8a8a' });
}

function drawTwoRight(d){
  panelTitle('TWO GATES', 395, 18);
  [['d(m)', 488], ['Δt(ms)', 542], ['v(m/s)', 593]].forEach(([a, x]) => text(a, x, 33, { align: 'right', font: '700 9.5px ' + PGM, col: '#4a4a4a' }));
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(396, 37); ctx.lineTo(596, 37); ctx.stroke();
  d.gs.forEach((g, i) => { const y = 51 + i * 14, f = { align: 'right', font: '600 11px ' + PGM }; text('gate ' + (i + 1), 400, y, { font: '700 10px ' + PGM, col: PGC[i] }); text(fplain(g.d), 488, y, f); text(fplain(g.dt * 1000), 542, y, f); text(fplain(g.v), 593, y, f); });
  if (d.bad){ text('Gates too close together', 395, 90, { font: '700 11.5px ' + PGF, col: '#c43a00' }); return; }
  text('time between gates T = ' + fplain(d.T) + ' s', 395, 90, { font: '600 11.5px ' + PGF });
  text('Δv = v₂ − v₁ = ' + fplain(d.g2.v - d.g1.v) + ' m/s', 395, 105, { font: '600 11.5px ' + PGF });
  text('a = Δv/T = ' + fplain(d.aMeas) + ' m/s²', 395, 123, { font: '700 12.5px ' + PGF, col: '#1546d6' });
  text('theory g sin θ = ' + fplain(d.a) + ' m/s²', 395, 138, { font: '600 11px ' + PGF, col: '#4a4a4a' });
  const tmax = niceMax(d.g2.t1 * 1.15), vmax = niceMax(d.g2.v * 1.15), px0 = 432, px1 = 584, py0 = 292, py1 = 168, PX = x => px0 + x / tmax * (px1 - px0), PY = y => py0 - y / vmax * (py0 - py1);
  panelTitle('v (m/s) vs t (s)', 395, 156);
  ctx.strokeStyle = '#e3e0d6'; ctx.lineWidth = 1; [tmax / 2, tmax].forEach(x => { ctx.beginPath(); ctx.moveTo(PX(x), py0); ctx.lineTo(PX(x), py1); ctx.stroke(); }); [vmax / 2, vmax].forEach(y => { ctx.beginPath(); ctx.moveTo(px0, PY(y)); ctx.lineTo(px1, PY(y)); ctx.stroke(); });
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px0, py1 - 3); ctx.lineTo(px0, py0); ctx.lineTo(px1 + 4, py0); ctx.stroke();
  [0, tmax / 2, tmax].forEach(x => text(x === 0 ? '0' : fplain(x), PX(x), py0 + 12, { align: 'center', font: '500 9px ' + PGM, col: '#4a4a4a' }));
  [[0, '0'], [vmax / 2, fplain(vmax / 2)], [vmax, fplain(vmax)]].forEach(([y, s]) => text(s, px0 - 4, PY(y) + 3, { align: 'right', font: '500 9px ' + PGM, col: '#4a4a4a' }));
  ctx.save(); ctx.beginPath(); ctx.rect(px0, py1 - 4, px1 - px0 + 4, py0 - py1 + 4); ctx.clip();
  ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1.3; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(PX(0), PY(0)); ctx.lineTo(PX(tmax), PY(d.a * tmax)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PX(d.g1.t1), PY(d.g1.v)); ctx.lineTo(PX(d.g2.t1), PY(d.g2.v)); ctx.stroke(); ctx.restore();
  d.gs.forEach((g, i) => { ctx.fillStyle = PGC[i]; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(PX(g.t1), PY(g.v), 4, 0, 7); ctx.fill(); ctx.stroke(); });
  text('slope of the blue line = a', px1, py0 - 5, { align: 'right', font: '500 9.5px ' + PGM, col: '#1546d6' });
}
