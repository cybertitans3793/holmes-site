// Potential Landscape (AP 2 P2-02, electric potential): V as terrain. Side view = hillside along a line through two charges; top view = filled equipotential bands for 1-3 charges. A test marble (q = ±1 μC, m = 1 g) is released and moves under qE. Original.
const K = 8.99e9, RMIN = 0.02, QM = 1e-6, MM = 1e-3;
const LS = { drag: false };
function lsCharges(v, mode){ const s = v.s / 100;
  if (mode === 'side') return [[-s / 2, 0, v.q1, 0], [s / 2, 0, v.q2, 1]];
  return [[-s / 2, 0, v.q1, 0], [s / 2, 0, v.q2, 1], [0, 0.6 * s, v.q3, 2]].filter(c => c[2] !== 0); }
function lsV(Q, x, y){ let t = 0; for (const [cx, cy, q] of Q) t += K * q * 1e-6 / Math.max(RMIN, Math.hypot(x - cx, y - cy)); return t; }
function lsE(Q, x, y){ let ex = 0, ey = 0; for (const [cx, cy, q] of Q){ const dx = x - cx, dy = y - cy, r = Math.max(RMIN, Math.hypot(dx, dy)), e = K * q * 1e-6 / (r * r), rr = Math.hypot(dx, dy) || 1; ex += e * dx / rr; ey += e * dy / rr; } return [ex, ey]; }
// simulate the marble (velocity Verlet, step limited to ~1 mm) from rest; stops at the edge of the map, at a charge, or after 4000 steps
function lsPath(Q, x0, y0, qm, lim){
  const P = { x: [x0], y: [y0], t: [0], V: [lsV(Q, x0, y0)], why: 'time' }, V0 = P.V[0];
  let x = x0, y = y0, vx = 0, vy = 0, t = 0, [ex, ey] = lsE(Q, x, y), ax = qm * ex / MM, ay = qm * ey / MM;
  if (Q.some(c => Math.hypot(x - c[0], y - c[1]) < RMIN)){ P.why = 'charge'; return P; }
  if (Math.hypot(ax, ay) < 1e-3){ P.why = 'rest'; return P; }
  for (let i = 0; i < 4000; i++){
    const sp = Math.hypot(vx, vy), a = Math.hypot(ax, ay), h = Math.min(5e-3, 1e-3 / (sp + Math.sqrt(2 * a * 1e-3) + 1e-9));
    x += vx * h + 0.5 * ax * h * h; y += vy * h + 0.5 * ay * h * h;
    [ex, ey] = lsE(Q, x, y); const bx = qm * ex / MM, by = qm * ey / MM; vx += 0.5 * (ax + bx) * h; vy += 0.5 * (ay + by) * h; ax = bx; ay = by; t += h;
    P.x.push(x); P.y.push(y); P.t.push(t); P.V.push(lsV(Q, x, y));
    if (Q.some(c => Math.hypot(x - c[0], y - c[1]) < RMIN)){ P.why = 'charge'; break; }
    if (Math.abs(x) > lim[0] || Math.abs(y) > lim[1]){ P.why = 'edge'; break; } }
  P.V0 = V0; P.n = P.x.length; return P; }
function lsNice(x){ const e = Math.pow(10, Math.floor(Math.log10(x))), m = x / e; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * e; }
function lsKV(x){ return fplain(x / 1000) + ' kV'; }
function lsQmax(v, mode){ return Math.max(0.5, Math.abs(v.q1), Math.abs(v.q2), mode === 'top' ? Math.abs(v.q3) : 0); }
function lsVc(v, mode){ return K * lsQmax(v, mode) * 1e-6 / 0.03; }
const LSX = x => 195 + 900 * x, LSY = y => 165 - 900 * y;   // top view: 9 px per cm
function lsSet(id, val){ const d = S.def[id]; if (!d) return; val = Math.max(d.min, Math.min(d.max, Math.round(val / d.step) * d.step)); S.v[id] = val; S.store[S.mode + ':' + id] = val; const r = $('r-' + id); if (r) r.value = val; }
function lsPtr(e){ const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 600, (e.clientY - r.top) / r.height * 330]; }
cv.style.touchAction = 'none';
cv.addEventListener('pointerdown', e => { const [x, y] = lsPtr(e);
  if (LS.btn && x >= LS.btn[0] && x <= LS.btn[0] + LS.btn[2] && y >= LS.btn[1] && y <= LS.btn[1] + LS.btn[3]){ S.anim.reset = true; update(); return; }
  if (x < 10 || x > 385 || y < 30 || y > 305) return;
  LS.drag = true; try { cv.setPointerCapture(e.pointerId); } catch (er) {} lsMove(x, y); });
cv.addEventListener('pointermove', e => { if (LS.drag){ const [x, y] = lsPtr(e); lsMove(x, y); } });
function lsUp(){ if (LS.drag){ LS.drag = false; S.anim.reset = true; } }
cv.addEventListener('pointerup', lsUp); cv.addEventListener('pointercancel', lsUp);
function lsMove(x, y){ lsSet('x0', (x - 195) / 9); if (S.mode === 'top') lsSet('y0', (165 - y) / 9); update(); }
const SIM = {
  title: 'Potential Landscape',
  hint: 'k = 8.99×10⁹ N·m²/C² · marble: q = ±1 μC, m = 1 g',
  modes: [{ id: 'side', label: 'Side view (hillside)' }, { id: 'top', label: 'Top view (contour map)' }],
  opts: [{ id: 'ms', label: 'Marble', choices: [['pos', '+ charge'], ['neg', '− charge']] }, { id: 'vw', label: 'Show', modes: ['top'], choices: [['both', 'Bands + field lines'], ['bands', 'Bands only']] }],
  ivs(mode){
    const q = (id, lab, val) => ({ id, sym: 'q<sub>' + id[1] + '</sub>', symText: id, label: lab, unit: 'μC', min: -5, max: 5, step: 0.5, val });
    if (mode === 'side') return [q('q1', 'Left charge', 2), q('q2', 'Right charge', -2), { id: 's', sym: 's', symText: 's', label: 'Separation', unit: 'cm', min: 8, max: 30, step: 1, val: 16 },
      { id: 'x0', sym: 'x<sub>0</sub>', symText: 'x0', label: 'Release marble at x (or drag it)', unit: 'cm', min: -19, max: 19, step: 0.5, val: -5, graph: true },
      { id: 'x1', sym: 'x<sub>1</sub>', symText: 'x1', label: 'Find its speed at x', unit: 'cm', min: -19, max: 19, step: 0.5, val: 4 }];
    return [q('q1', 'Charge 1 (left)', 2), q('q2', 'Charge 2 (right)', -2), q('q3', 'Charge 3 (top, 0 = none)', 0), { id: 's', sym: 's', symText: 's', label: 'Spacing', unit: 'cm', min: 6, max: 20, step: 1, val: 14 },
      { id: 'x0', sym: 'x<sub>0</sub>', symText: 'x0', label: 'Marble start: x (or drag it)', unit: 'cm', min: -19, max: 19, step: 0.5, val: -4, graph: true },
      { id: 'y0', sym: 'y<sub>0</sub>', symText: 'y0', label: 'Marble start: y', unit: 'cm', min: -14, max: 14, step: 0.5, val: 7 }];
  },
  presets: [{ label: 'Hill and well', mode: 'side', v: { q1: 2, q2: -2, s: 16, x0: -5, x1: 4 } }, { label: 'Two hills', mode: 'side', v: { q1: 2, q2: 2, s: 16, x0: 0, x1: 12 } }, { label: 'Dipole map', mode: 'top', v: { q1: 2, q2: -2, q3: 0, x0: -4, y0: 7 } }, { label: 'Three charges', mode: 'top', v: { q1: 2, q2: 2, q3: -3, x0: 0, y0: -8 } }],
  calc(v, mode, opt){
    const qm = (opt && opt.ms === 'neg' ? -1 : 1) * QM, Q = lsCharges(v, mode), x0 = v.x0 / 100, y0 = mode === 'side' ? 0 : v.y0 / 100, lim = mode === 'side' ? [0.2, 1] : [0.2, 0.15];
    const D = { Q, qm, x0, y0, V0: lsV(Q, x0, y0), get P(){ if (!this._P) this._P = lsPath(Q, x0, y0, qm, lim); return this._P; } };
    D.parts0 = Q.map(c => { const r = Math.max(RMIN, Math.hypot(x0 - c[0], y0 - c[1])); return { i: c[3] + 1, q: c[2], r, V: K * c[2] * 1e-6 / r }; });
    if (mode === 'side'){ const x1 = v.x1 / 100; D.x1 = x1; D.V1 = lsV(Q, x1, 0); D.parts1 = Q.map(c => { const r = Math.max(RMIN, Math.abs(x1 - c[0])); return { i: c[3] + 1, q: c[2], r, V: K * c[2] * 1e-6 / r }; });
      D.dV = D.V1 - D.V0; D.dU = qm * D.dV; D.KE = -D.dU; D.ok = D.KE >= 0; D.v = D.ok ? Math.sqrt(2 * D.KE / MM) : NaN; }
    else { const e = D.P, i = e.n - 1 || 0; D.xe = e.x[i]; D.ye = e.y[i]; D.Ve = e.V[i]; D.parts1 = Q.map(c => { const r = Math.max(RMIN, Math.hypot(D.xe - c[0], D.ye - c[1])); return { i: c[3] + 1, q: c[2], r, V: K * c[2] * 1e-6 / r }; });
      D.dV = D.Ve - D.V0; D.dU = qm * D.dV; D.KE = -D.dU; D.ok = D.KE >= 0; D.v = D.ok ? Math.sqrt(2 * D.KE / MM) : NaN; }
    return D;
  },
  dvs(mode){
    const a = [{ id: 'V0', name: 'Potential at the release point', short: 'V₀', sym: 'V<sub>0</sub>', unit: 'V', f: d => d.V0 }];
    if (mode === 'side') return a.concat([{ id: 'dU', name: 'ΔU from x₀ to x₁', short: 'ΔU', sym: 'ΔU', unit: 'J', f: d => d.dU }, { id: 'v', name: 'Speed at x₁', short: 'v', sym: 'v', unit: 'm/s', f: d => d.v }]);
    return a.concat([{ id: 'v', name: 'Speed at the end of the trail', short: 'v', sym: 'v', unit: 'm/s', f: d => d.v }]);
  },
  work(v, d, mode, opt){
    const neg = d.qm < 0, qm = M.p(d.qm, 'C');
    const sub = arr => arr.map((p, i) => { const k = '<mn>' + p.i + '</mn>';
      return TEX`V_${k} = \frac{k\,q_${k}}{r_${k}}` + TEX`V_${k} = \frac{(8.99\times10^{9})(${M.n(p.q * 1e-6)})}{${M.n(p.r, 'm')}}` + TEXA`V_${k} = ${M.n(p.V, 'V')}`; }).join('');
    const sum = arr => arr.length ? arr.map((p, i) => (i ? '<mo>+</mo>' : '') + (p.V < 0 && i ? M.p(p.V) : M.n(p.V))).join('') : '<mn>0</mn>';
    const head = mode === 'side'
      ? '<h4>1 · Potential at the release point: V = kq/r for each charge, then add</h4><p class="st">V is a scalar, so just add with signs. Release point: x = ' + H.iv('x0') + '. A + charge makes a hill (V &gt; 0), a − charge makes a well (V &lt; 0).</p>'
      : '<h4>1 · Potential at the release point: V = kq/r for each charge, then add</h4><p class="st">V is a scalar, so just add with signs. A + charge makes a hill (V &gt; 0), a − charge makes a well (V &lt; 0).</p>';
    const where1 = mode === 'side' ? 'Second point: x = ' + H.iv('x1') + '.' : 'Where the marble ends up (' + (d.P.why === 'edge' ? 'it leaves the map' : d.P.why === 'charge' ? 'it reaches a charge' : d.P.why === 'rest' ? 'it does not move: E = 0 here' : 'still moving after a long trip') + '): x = ' + fnum(d.xe * 100) + ' cm, y = ' + fnum(d.ye * 100) + ' cm.';
    return head + sub(d.parts0) + TEX`V_0 = \sum V_i = ${sum(d.parts0)}` + TEXA`V_0 = ${M.n(d.V0, 'V')}` +
      '<h4>2 · Potential at the ' + (mode === 'side' ? 'second' : 'end') + ' point</h4><p class="st">' + where1 + ' Same method:</p>' + TEX`V_1 = \sum V_i = ${sum(d.parts1)}` + TEXA`V_1 = ${M.n(mode === 'side' ? d.V1 : d.Ve, 'V')}` +
      '<h4>3 · Energy: ΔU = qΔV</h4><p class="st">Marble charge ' + (neg ? '<b>negative</b>' : '<b>positive</b>') + ', mass 1 g.</p>' +
      TEX`\Delta V = V_1 - V_0` + TEX`\Delta V = ${M.n(mode === 'side' ? d.V1 : d.Ve)} - ${M.p(d.V0)}` + TEXA`\Delta V = ${M.n(d.dV, 'V')}` +
      TEX`\Delta U = q\,\Delta V` + TEX`\Delta U = ${qm}\,${M.p(d.dV)}` + TEXA`\Delta U = ${M.n(d.dU, 'J')}` +
      '<h4>4 · Speed: the electric potential energy turns into kinetic energy</h4>' + TEX`\tfrac{1}{2}mv^2 = -q\,\Delta V` +
      (d.ok ? TEX`v = \sqrt{\frac{-2\,q\,\Delta V}{m}}` + TEX`v = \sqrt{\frac{2\,(${M.n(-d.dU)})}{1\times10^{-3}}}` + TEXA`v = ${M.n(d.v, 'm/s')}`
        : '<div class="bad">KE would be negative: released from rest, the marble never gets to that point (it goes the other way).</div>') +
      '<p class="note">' + (neg ? 'A − charge speeds up when it moves to <b>higher</b> V (uphill on the map), toward the + hills.' : 'A + charge speeds up when it moves to <b>lower</b> V (downhill), away from + hills and toward − wells.') + ' It always crosses equipotentials at right angles, along the field.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const neg = d.qm < 0, mcol = neg ? '#1546d6' : '#ff6a2b', P = d.P;
    // playback: slow-motion, restarts on any slider change or release
    if (!A.init || A.reset || LS.drag){ A.init = true; A.t0 = t; }
    const T = P.t[P.n - 1] || 0, dur = Math.max(1.5, Math.min(6, T * 50)), tr = Math.max(0, t - A.t0 - 0.35), ts = Math.min(T, tr / dur * T);
    let k = 0; if (T > 0){ let lo = 0, hi = P.n - 1; while (lo < hi){ const m = (lo + hi + 1) >> 1; if (P.t[m] <= ts) lo = m; else hi = m - 1; } k = lo; }
    const done = k >= P.n - 1 && T > 0, mx = P.x[k], my = P.y[k], Vn = P.V[k], dVn = Vn - d.V0, dUn = d.qm * dVn, KEn = -dUn, vn = Math.sqrt(Math.max(0, 2 * KEn / MM));
    if (mode === 'side') drawSide(v, d, A, P, k, mcol, neg); else drawTop(v, d, opt, A, P, k, mcol, neg);
    // readouts
    panelTitle('MARBLE (q = ' + (neg ? '−' : '+') + '1 μC)', 395, 18);
    const row = (l, val, y, col) => { text(l, 400, y, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(val, 596, y, { align: 'right', font: '700 12px "IBM Plex Mono",monospace', col: col || '#111' }); };
    row('start V₀', lsKV(d.V0), 40);
    row('now x', fplain(mx * 100) + ' cm', 62); if (mode === 'top') row('now y', fplain(my * 100) + ' cm', 80);
    row('V now', lsKV(Vn), 102); row('ΔV', lsKV(dVn), 122); row('ΔU = qΔV', fplain(dUn) + ' J', 142, dUn < 0 ? '#1e7d45' : '#c43a00');
    row('KE = −ΔU', fplain(KEn) + ' J', 162); row('speed v', fplain(vn) + ' m/s', 184, '#111');
    text(neg ? 'goes toward higher V' : 'goes toward lower V', 400, 214, { font: '700 11px "Space Grotesk",sans-serif', col: mcol === '#ff6a2b' ? '#c43a00' : '#1546d6' });
    const msg = !done ? 'rolling (slow motion)…' : P.why === 'edge' ? 'left the map' : P.why === 'charge' ? 'reached a charge (r < 2 cm)' : P.why === 'rest' ? 'E = 0: it stays put' : 'stopped (long trip)';
    text(T === 0 && P.why !== 'rest' && P.why !== 'charge' ? '' : msg, 400, 232, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('KE = ½mv² = −qΔV', 400, 300, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('drag the marble, let go', 400, 316, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
function lsButton(){ LS.btn = [318, 4, 66, 22]; ctx.fillStyle = '#fff'; ctx.fillRect(318, 4, 66, 22); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(318, 4, 66, 22); text('↻ Replay', 351, 20, { align: 'center', font: '700 12px "Space Grotesk",sans-serif' }); }
function lsChargeDot(x, y, q, i){ ctx.fillStyle = q > 0 ? '#ff6a2b' : q < 0 ? '#1546d6' : '#bbb'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.stroke(); text(q > 0 ? '+' : q < 0 ? '−' : '0', x, y + 5, { align: 'center', font: '700 13px "Space Grotesk",sans-serif', col: '#fff' }); text('q' + (i + 1), x + 11, y - 9, { font: '700 10px "IBM Plex Mono",monospace' }); }
function drawSide(v, d, A, P, k, mcol, neg){
  const Vc = lsVc(v, 'side'), Y0 = 172, SC = 125 / Vc, Yv = V => Math.max(-300, Math.min(700, Y0 - V * SC)), X = x => 195 + 900 * x;
  lsButton(); panelTitle('SIDE VIEW: V(x) AS A HILLSIDE', 10, 18);
  ctx.save(); ctx.beginPath(); ctx.rect(10, 30, 375, 275); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(10, 30, 375, 275);
  // terrain
  ctx.beginPath(); ctx.moveTo(10, 400); for (let px = 10; px <= 385; px += 1) ctx.lineTo(px, Yv(lsV(d.Q, (px - 195) / 900, 0))); ctx.lineTo(385, 400); ctx.closePath(); ctx.fillStyle = '#efe4cc'; ctx.fill();
  ctx.strokeStyle = '#8a6a30'; ctx.lineWidth = 2.5; ctx.beginPath(); for (let px = 10; px <= 385; px += 1){ const y = Yv(lsV(d.Q, (px - 195) / 900, 0)); px === 10 ? ctx.moveTo(px, y) : ctx.lineTo(px, y); } ctx.stroke();
  // zero line and scale ticks
  ctx.strokeStyle = '#888'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(10, Y0); ctx.lineTo(385, Y0); ctx.stroke(); ctx.setLineDash([]);
  [-Vc, -Vc / 2, Vc / 2, Vc].forEach(V => { const y = Y0 - V * SC; ctx.strokeStyle = '#ddd'; ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(385, y); ctx.stroke(); text((V > 0 ? '+' : '−') + fplain(Math.abs(V) / 1000) + ' kV', 14, y - 3, { font: '500 9px "IBM Plex Mono",monospace', col: '#888' }); });
  text('V = 0', 14, Y0 - 3, { font: '700 9px "IBM Plex Mono",monospace', col: '#555' });
  // no-go zone near each charge, and charge markers
  d.Q.forEach(([cx, , q], i) => { ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(X(cx) - 18, 30, 36, 275); ctx.strokeStyle = '#aaa'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(cx), 30); ctx.lineTo(X(cx), 305); ctx.stroke(); ctx.setLineDash([]); });
  // x1 marker
  ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(d.x1), 305); ctx.lineTo(X(d.x1), Yv(d.V1)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#1e7d45'; ctx.beginPath(); ctx.arc(X(d.x1), Yv(d.V1), 4, 0, 7); ctx.fill(); text('x₁', X(d.x1) + 4, 298, { font: '700 11px "Space Grotesk",sans-serif', col: '#1e7d45' });
  // start ghost
  ctx.strokeStyle = mcol; ctx.lineWidth = 1.5; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.arc(X(d.x0), Math.max(42, Math.min(296, Yv(d.V0) - 7)), 7, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  // marble: sits on the curve
  const mx = P.x[k], Vn = P.V[k], my = Math.max(42, Math.min(296, Yv(Vn) - 7)); ctx.fillStyle = mcol; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(mx), my, 7, 0, 7); ctx.fill(); ctx.stroke(); text(neg ? '−' : '+', X(mx), my + 4, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#fff' });
  // force arrow: along the slope, force direction on the marble
  const [ex] = lsE(d.Q, mx, 0), F = d.qm * ex; if (Math.abs(F) > 1e-6 && Math.hypot(...[mx - d.Q[0][0], mx - d.Q[1][0]].map(Math.abs)) > 0){ const L = Math.max(14, Math.min(46, Math.abs(F) / 0.06 * 10)); arrow(X(mx), my - 15, X(mx) + Math.sign(F) * L, my - 15, '#111', 'F', { w: 2.5, head: 7 }); }
  ctx.restore(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(10, 30, 375, 275);
  d.Q.forEach(([cx, , q, i]) => lsChargeDot(X(cx), 318, q, i));
}
function drawTop(v, d, opt, A, P, k, mcol, neg){
  const step = lsNice(K * lsQmax(v, 'top') * 1e-6 / 0.06 / 4), key = [v.q1, v.q2, v.q3, v.s, opt.vw].join();
  if (!A.img || A.key !== key){ A.key = key; const oc = document.createElement('canvas'); oc.width = 750; oc.height = 550; const o = oc.getContext('2d'), im = o.createImageData(750, 550), B = new Int16Array(750 * 550);
    for (let j = 0; j < 550; j++) for (let i = 0; i < 750; i++){ const V = lsV(d.Q, (i / 2 + 10 - 195) / 900, (165 - (j / 2 + 30)) / 900); B[j * 750 + i] = Math.max(-1000, Math.min(1000, Math.floor(V / step))); }
    for (let j = 0; j < 550; j++) for (let i = 0; i < 750; i++){ const b = B[j * 750 + i], o4 = 4 * (j * 750 + i), a = Math.min(Math.abs(b >= 0 ? b + 0.5 : b + 0.5), 9) / 9, mixc = 0.12 + 0.78 * a;
      let r, g, bl; if (b >= 0){ r = 255 - mixc * 20; g = 255 - mixc * 150; bl = 255 - mixc * 220; } else { r = 255 - mixc * 225; g = 255 - mixc * 165; bl = 255 - mixc * 40; }
      const edge = (i < 749 && B[j * 750 + i + 1] !== b) || (j < 549 && B[(j + 1) * 750 + i] !== b);
      if (edge){ const z = (b === 0 && (i < 749 && B[j * 750 + i + 1] === -1 || j < 549 && B[(j + 1) * 750 + i] === -1)) || (b === -1 && (i < 749 && B[j * 750 + i + 1] === 0 || j < 549 && B[(j + 1) * 750 + i] === 0)); const c = z ? 0 : 70; r = g = bl = c; }
      im.data[o4] = r; im.data[o4 + 1] = g; im.data[o4 + 2] = bl; im.data[o4 + 3] = 255; }
    o.putImageData(im, 0, 0);
    if (opt.vw !== 'bands'){ o.setTransform(2, 0, 0, 2, -20, -60); const fromPos = d.Q.some(c => c[2] > 0) ? 1 : -1;
      d.Q.forEach(([cx, cy, q]) => { if (q * fromPos <= 0) return; const n = Math.max(6, Math.round(2.6 * Math.abs(q))); for (let kk = 0; kk < n; kk++){ const a = 2 * PI * (kk + 0.5) / n; let x = LSX(cx) + 12 * Math.cos(a), y = LSY(cy) + 12 * Math.sin(a); o.strokeStyle = 'rgba(60,20,100,0.85)'; o.lineWidth = 1.2; o.beginPath(); o.moveTo(x, y); let mid = null;
        for (let st = 0; st < 900; st++){ const [ex, ey] = lsE(d.Q, (x - 195) / 900, (165 - y) / 900), m = Math.hypot(ex, ey); if (!isFinite(m) || m === 0) break; const ux = fromPos * ex / m, uy = -fromPos * ey / m; x += 2 * ux; y += 2 * uy; o.lineTo(x, y); if (st === 40) mid = [x, y, ux, uy]; if (x < 10 || x > 385 || y < 30 || y > 305) break; if (d.Q.some(([qx, qy]) => Math.hypot(x - LSX(qx), y - LSY(qy)) < 9)) break; }
        o.stroke(); if (mid){ const [mx, my, ux, uy] = mid; o.fillStyle = 'rgba(60,20,100,0.95)'; o.beginPath(); o.moveTo(mx + ux * 5, my + uy * 5); o.lineTo(mx - uy * 4, my + ux * 4); o.lineTo(mx + uy * 4, my - ux * 4); o.fill(); } } }); }
    A.img = oc; }
  ctx.drawImage(A.img, 0, 0, 750, 550, 10, 30, 375, 275);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(10, 30, 375, 275);
  lsButton(); panelTitle('TOP VIEW: POTENTIAL BANDS', 10, 18);
  d.Q.forEach(([cx, cy, q, i]) => lsChargeDot(LSX(cx), LSY(cy), q, i));
  // trail
  ctx.save(); ctx.beginPath(); ctx.rect(10, 30, 375, 275); ctx.clip(); ctx.strokeStyle = mcol; ctx.lineWidth = 2.5; ctx.beginPath(); const sk = Math.max(1, Math.floor(k / 400)); for (let i = 0; i <= k; i += sk){ const px = LSX(P.x[i]), py = LSY(P.y[i]); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.lineTo(LSX(P.x[k]), LSY(P.y[k])); ctx.stroke();
  ctx.strokeStyle = mcol; ctx.lineWidth = 1.5; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.arc(LSX(d.x0), LSY(d.y0), 6, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  const mx = LSX(P.x[k]), my = LSY(P.y[k]); ctx.fillStyle = mcol; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, my, 7, 0, 7); ctx.fill(); ctx.stroke(); text(neg ? '−' : '+', mx, my + 4, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#fff' });
  ctx.restore();
  text('each band = ' + lsKV(step) + ' · orange +V · blue −V', 14, 322, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
}
