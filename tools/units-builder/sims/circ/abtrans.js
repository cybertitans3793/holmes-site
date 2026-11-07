// ABP Graph Translator: one motion on a position–time and a velocity–time graph together. Drag the points on one graph; the other follows. Slope of p–t = velocity; area under v–t = displacement. Original.
const fint = x => Number.isInteger(x) ? String(x) : (Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2)).replace(/\.?0+$/, '');
const sgn = x => (x > 0 ? '+' : x < 0 ? '−' : '') + fint(Math.abs(+x.toFixed(2)));
// shapes: positions at t = 0,2,4,6,8,10 (p→v) and velocities at t = 0..10 (v→p)
const SHP = [['At rest', [6, 6, 6, 6, 6, 6], [0, 0, 0, 0, 0, 0]], ['Constant velocity', [0, 3, 6, 9, 12, 15], [2, 2, 2, 2, 2, 2]], ['Speeding up', [0, 1, 4, 9, 16, 25], [0, 1, 2, 3, 4, 5]], ['Slowing down', [0, 9, 16, 21, 24, 25], [5, 4, 3, 2, 1, 0]], ['There and back', [0, 6, 12, 12, 6, 0], [3, 3, 0, -3, -3, 0]], ['Stop and go', [2, 2, 8, 14, 14, 10], [0, 3, 3, 0, -2, -2]]];
const TR = window._tr = window._tr || { shape: 0, mode: null, pts: null, drag: -1 };
const SIM = {
  title: 'Graph Translator',
  hint: 'slope of p–t = velocity · area under v–t = displacement',
  noGraph: true,
  modes: [{ id: 'p2v', label: 'Drag the position–time graph' }, { id: 'v2p', label: 'Drag the velocity–time graph' }],
  ivs(){ return [{ id: 'shape', sym: '', symText: 'shape', label: 'Start from', unit: '', show: x => SHP[x - 1][0], min: 1, max: 6, step: 1, val: 2 },
    { id: 'seg', sym: '', symText: 'seg', label: 'Look closely at the 2-second piece', unit: '', show: x => (2 * x - 2) + ' to ' + (2 * x) + ' s', min: 1, max: 5, step: 1, val: 1 }]; },
  calc(v, mode){
    if (TR.mode !== mode || TR.shape !== v.shape){ TR.mode = mode; TR.shape = v.shape; TR.pts = (mode === 'p2v' ? SHP[v.shape - 1][1] : SHP[v.shape - 1][2]).slice(); }
    const P = TR.pts; let X, V;
    if (mode === 'p2v'){ X = P.slice(); V = [0, 1, 2, 3, 4].map(i => (P[i + 1] - P[i]) / 2); }
    else { V = P.slice(); X = [0]; for (let i = 0; i < 5; i++) X.push(X[i] + (V[i] + V[i + 1]) / 2 * 2); }
    const i = v.seg - 1;
    return { X, V, i, dx: X[i + 1] - X[i], v0: mode === 'p2v' ? V[i] : V[i], v1: mode === 'p2v' ? V[i] : V[i + 1], area: mode === 'v2p' ? (V[i] + V[i + 1]) : X[i + 1] - X[i] };
  },
  dvs(){ return [{ id: 'x', name: '—', short: '', sym: '', unit: '', noTag: true, f: () => 0 }]; },
  work(v, d, mode){
    const mn = (x, u) => '<mrow>' + (x < 0 ? '<mo>−</mo>' : '') + '<mn>' + fint(Math.abs(x)) + '</mn>' + M.u(u) + '</mrow>', mp = (x, u) => x < 0 ? '<mrow><mo>(</mo>' + mn(x, u) + '<mo>)</mo></mrow>' : mn(x, u);
    const a = 2 * d.i, b = a + 2, i = d.i, sg1 = (x, un) => '<mrow>' + (x > 0 ? '<mo>+</mo>' : '') + mn(x, un) + '</mrow>';
    const kind = vv0 => vv0 === 0 ? 'standing still' : vv0 > 0 ? 'moving forward (+)' : 'moving backward (−)';
    if (mode === 'p2v'){ const vel = d.V[i];
      return '<h4>1 · Slope of the position–time graph (' + a + ' to ' + b + ' s)</h4>' + TEX`\text{slope} = \frac{\text{rise}}{\text{run}}` +
        TEX`\text{slope} = \frac{${mp(d.X[i + 1], 'm')} - ${mp(d.X[i], 'm')}}{${mn(2, 's')}}` + TEXA`\text{slope} = ${sg1(vel, 'm/s')}` +
        '<h4>2 · That slope IS the velocity</h4><p class="st">So the velocity–time graph is a flat line from ' + a + ' to ' + b + ' s: ' + kind(vel) + (vel ? ' at a steady speed.' : '.') + '</p>' + TEXA`v = ${sg1(vel, 'm/s')}` +
        '<p class="note">Steeper p–t line → bigger velocity. Flat p–t line → velocity 0. A p–t line going down → negative velocity. Each straight piece of a p–t graph makes a <b>flat</b> piece on the v–t graph. (A smooth curve on a p–t graph would make a sloped v–t line: try the other mode.)</p>'; }
    const v0 = d.V[i], v1 = d.V[i + 1], A = (v0 + v1) / 2 * 2, acc = (v1 - v0) / 2, B = mn(2, 's');
    let area;
    if (v0 === v1) area = '<p class="st">The shape is a rectangle.</p>' + TEX`A = b\,h` + TEX`A = (${B})(${mp(v0, 'm/s')})` + TEXA`\Delta x = ${sg1(A, 'm')}`;
    else if ((v0 === 0 || v1 === 0) && v0 * v1 >= 0) area = '<p class="st">The shape is a triangle.</p>' + TEX`A = \frac{1}{2}\,b\,h` + TEX`A = \frac{1}{2}(${B})(${mp(v0 || v1, 'm/s')})` + TEXA`\Delta x = ${sg1(A, 'm')}`;
    else if (v0 * v1 < 0){ const t0 = 2 * v0 / (v0 - v1), A1 = 0.5 * t0 * v0, A2 = 0.5 * (2 - t0) * v1;
      area = '<p class="st">Two triangles, one above and one below zero (the part below counts as negative).</p>' + TEX`A = \frac{1}{2}\,b\,h` +
        TEX`A_1 = \frac{1}{2}(${mn(t0, 's')})(${mp(v0, 'm/s')}) = ${mn(A1, 'm')}` + TEX`A_2 = \frac{1}{2}(${mn(2 - t0, 's')})(${mp(v1, 'm/s')}) = ${mn(A2, 'm')}` +
        TEX`\Delta x = A_1 + A_2` + TEX`\Delta x = ${mn(A1, 'm')} + ${mp(A2, 'm')}` + TEXA`\Delta x = ${sg1(A, 'm')}`; }
    else { const rc = 2 * Math.min(Math.abs(v0), Math.abs(v1)) * Math.sign(v0), hh = Math.abs(v1 - v0) * Math.sign(v0);
      area = '<p class="st">The shape is a rectangle plus a triangle.</p>' + TEX`A_{\text{rect}} = b\,h` + TEX`A_{\text{rect}} = (${B})(${mp(rc / 2, 'm/s')}) = ${mn(rc, 'm')}` +
        TEX`A_{\text{tri}} = \frac{1}{2}\,b\,h` + TEX`A_{\text{tri}} = \frac{1}{2}(${B})(${mp(hh, 'm/s')}) = ${mn(hh, 'm')}` +
        TEX`\Delta x = A_{\text{rect}} + A_{\text{tri}}` + TEX`\Delta x = ${mn(rc, 'm')} + ${mp(hh, 'm')}` + TEXA`\Delta x = ${sg1(A, 'm')}`; }
    return '<h4>1 · Area under the velocity–time graph (' + a + ' to ' + b + ' s)</h4>' + area +
      '<h4>2 · That area IS the displacement</h4><p class="st">So the position changes by ' + sgn(A) + ' m: from ' + fint(+d.X[i].toFixed(2)) + ' m to ' + fint(+d.X[i + 1].toFixed(2)) + ' m.</p>' +
      '<h4>3 · Slope of the velocity–time graph</h4>' + TEX`\text{slope} = \frac{\Delta v}{\Delta t}` + TEX`\text{slope} = \frac{${mp(v1, 'm/s')} - ${mp(v0, 'm/s')}}{${B}}` + TEXA`a = ${sg1(acc, 'm/s/s')}` +
      '<p class="st">This slope is the acceleration' + (acc === 0 ? ' (none: steady speed).' : Math.abs(v1) > Math.abs(v0) ? ' → speeding up.' : ' → slowing down.') + '</p>' +
      '<p class="note">Area above zero = moving forward; area below zero = moving backward. A sloped v–t line makes a <b>curved</b> p–t graph: speeding up curves steeper, slowing down flattens out.</p>';
  },
  draw(v, d, mode){
    const mono = '"IBM Plex Mono",monospace', sg = '"Space Grotesk",sans-serif', i = d.i;
    const x0 = 46, x1 = 380, T = t => x0 + (x1 - x0) * t / 10;
    const rng = (arr, pad) => { let lo = Math.min(0, ...arr), hi = Math.max(0, ...arr); if (hi - lo < 4){ hi = lo + 4; } const s = hi - lo; return [Math.floor(lo - s * pad), Math.ceil(hi + s * pad)]; };
    const fixedV = [-6, 6], fixedX = [-15, 30];
    const [xl, xh] = mode === 'p2v' ? fixedX : rng(d.X, 0.1), [vl, vh] = mode === 'v2p' ? fixedV : (m => [-m, m])(Math.max(6, 2 * Math.ceil((Math.max(...d.V.map(Math.abs)) + 0.5) / 2)));
    const pY0 = 40, pY1 = 160, vY0 = 196, vY1 = 316, PY = x => pY1 - (pY1 - pY0) * (x - xl) / (xh - xl), VY = vv => vY1 - (vY1 - vY0) * (vv - vl) / (vh - vl);
    const axes = (y0, y1, lo, hi, Y, lab, st, edit) => { ctx.fillStyle = edit ? '#fff7f2' : '#fafafa'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      for (let s = 0; s <= 10; s += 2){ ctx.strokeStyle = '#e6e6e6'; ctx.beginPath(); ctx.moveTo(T(s), y0); ctx.lineTo(T(s), y1); ctx.stroke(); text(String(s), T(s), y1 + 11, { align: 'center', font: '500 9px ' + mono }); }
      for (let q = Math.ceil(lo / st) * st; q <= hi; q += st){ ctx.strokeStyle = q === 0 ? '#111' : '#e6e6e6'; ctx.lineWidth = q === 0 ? 1.4 : 1; ctx.beginPath(); ctx.moveTo(x0, Y(q)); ctx.lineTo(x1, Y(q)); ctx.stroke(); text(String(q), x0 - 4, Y(q) + 3, { align: 'right', font: '500 9px ' + mono }); }
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0); text(lab + (edit ? '   ← drag the dots' : ''), x0 + 2, y0 - 5, { font: '700 10px ' + mono, col: edit ? '#c43a00' : '#111' }); };
    const xs = (xh - xl) > 30 ? 10 : 5;
    axes(pY0, pY1, xl, xh, PY, 'POSITION (m)', xs, mode === 'p2v'); axes(vY0, vY1, vl, vh, VY, 'VELOCITY (m/s)', vh > 10 ? 4 : 2, mode === 'v2p');
    // highlight the chosen 2-s piece
    ctx.fillStyle = 'rgba(255,106,43,0.10)'; ctx.fillRect(T(2 * i), pY0, T(2) - T(0), pY1 - pY0); ctx.fillRect(T(2 * i), vY0, T(2) - T(0), vY1 - vY0);
    // area under v-t for the piece
    const vAt = (k, f) => mode === 'p2v' ? d.V[k] : d.V[k] + (d.V[k + 1] - d.V[k]) * f;
    ctx.fillStyle = 'rgba(21,70,214,0.22)'; ctx.beginPath(); ctx.moveTo(T(2 * i), VY(0)); for (let q = 0; q <= 20; q++) ctx.lineTo(T(2 * i + 2 * q / 20), VY(vAt(i, q / 20))); ctx.lineTo(T(2 * i + 2), VY(0)); ctx.closePath(); ctx.fill();
    // p-t curve
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let k = 0; k <= 100; k++){ const t = 10 * k / 100, s = Math.min(4, Math.floor(t / 2)), f = (t - 2 * s) / 2; let x;
      if (mode === 'p2v') x = d.X[s] + (d.X[s + 1] - d.X[s]) * f; else { const va = d.V[s], vb = d.V[s + 1]; x = d.X[s] + 2 * (va * f + (vb - va) * f * f / 2); }
      k ? ctx.lineTo(T(t), PY(x)) : ctx.moveTo(T(t), PY(x)); } ctx.stroke();
    // slope triangle on p-t for the piece (secant)
    ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.moveTo(T(2 * i), PY(d.X[i])); ctx.lineTo(T(2 * i + 2), PY(d.X[i])); ctx.lineTo(T(2 * i + 2), PY(d.X[i + 1])); ctx.stroke(); ctx.setLineDash([]);
    text('Δx = ' + sgn(+(d.X[i + 1] - d.X[i]).toFixed(2)) + ' m', T(2 * i + 2) + 4, (PY(d.X[i]) + PY(d.X[i + 1])) / 2 + 3, { font: '700 10px ' + mono, col: '#c43a00' });
    // v-t graph
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5; ctx.beginPath();
    if (mode === 'p2v'){ d.V.forEach((vv, k) => { ctx.moveTo(T(2 * k), VY(vv)); ctx.lineTo(T(2 * k + 2), VY(vv)); }); }
    else d.V.forEach((vv, k) => k ? ctx.lineTo(T(2 * k), VY(vv)) : ctx.moveTo(T(0), VY(vv)));
    ctx.stroke();
    // draggable dots
    const dots = mode === 'p2v' ? d.X.map((x, k) => [T(2 * k), PY(x)]) : d.V.map((vv, k) => [T(2 * k), VY(vv)]);
    dots.forEach(([px, py], k) => { ctx.fillStyle = TR.drag === k ? '#c43a00' : '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py, 7, 0, 7); ctx.fill(); ctx.stroke(); });
    if (!window._trHook){ window._trHook = 1; const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 600 / r.width, (e.clientY - r.top) * 330 / r.height]; };
      const toVal = py => { if (TR.mode === 'p2v'){ const [lo, hi] = [-15, 30]; return Math.max(lo, Math.min(hi, Math.round(lo + (160 - py) / 120 * (hi - lo)))); } return Math.max(-6, Math.min(6, Math.round((-6 + (316 - py) / 120 * 12) * 2) / 2)); };
      cv.addEventListener('pointerdown', e => { const [px, py] = pos(e); const k = Math.round((px - 46) / 334 * 5); if (k < 0 || k > 5 || Math.abs(46 + k * 334 / 5 - px) > 14) return; const inP = py >= 30 && py <= 170, inV = py >= 186 && py <= 326; if ((TR.mode === 'p2v' && inP) || (TR.mode === 'v2p' && inV)){ TR.drag = k; try { cv.setPointerCapture(e.pointerId); } catch (er) {} TR.pts[k] = toVal(py); const sg2 = Math.min(5, k + 1); S.v.seg = sg2; S.store[TR.mode + ':seg'] = sg2; const rr = document.getElementById('r-seg'); if (rr) rr.value = sg2; update(); } });
      cv.addEventListener('pointermove', e => { if (TR.drag < 0) return; const [, py] = pos(e); const nv = toVal(py); if (nv !== TR.pts[TR.drag]){ TR.pts[TR.drag] = nv; update(); } });
      const up = () => { TR.drag = -1; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.style.touchAction = 'none'; }
    // right panel: readout
    panelTitle((2 * i) + ' TO ' + (2 * i + 2) + ' s', 400, 18);
    if (mode === 'p2v'){ text('slope of p–t', 400, 50, { font: '700 12px ' + sg }); text('= ' + sgn(+(d.X[i + 1] - d.X[i]).toFixed(2)) + ' m ÷ 2 s', 400, 68, { font: '700 12px ' + mono }); text('= ' + sgn(d.V[i]) + ' m/s', 400, 88, { font: '700 16px ' + mono, col: '#c43a00' });
      text('↓ becomes the height', 400, 116, { font: '600 10px ' + mono, col: '#4a4a4a' }); text('of the v–t graph', 400, 130, { font: '600 10px ' + mono, col: '#4a4a4a' }); }
    else { const A = d.V[i] + d.V[i + 1]; text('area under v–t', 400, 50, { font: '700 12px ' + sg }); text('= ' + sgn(A) + ' m', 400, 70, { font: '700 16px ' + mono, col: '#1546d6' }); text('↑ becomes the change', 400, 96, { font: '600 10px ' + mono, col: '#4a4a4a' }); text('in position (Δx)', 400, 110, { font: '600 10px ' + mono, col: '#4a4a4a' });
      text('slope of v–t', 400, 140, { font: '700 12px ' + sg }); text('= ' + sgn((d.V[i + 1] - d.V[i]) / 2) + ' m/s/s', 400, 158, { font: '700 14px ' + mono, col: '#c43a00' }); text('(acceleration)', 400, 172, { font: '600 10px ' + mono, col: '#4a4a4a' }); }
    const tot = d.X[5] - d.X[0]; text('Whole trip (0–10 s)', 400, 214, { font: '700 12px ' + sg }); text('displacement ' + sgn(+tot.toFixed(2)) + ' m', 400, 232, { font: '700 11px ' + mono });
    let dist = 0; for (let k = 0; k < 5; k++){ if (mode === 'p2v') dist += Math.abs(d.X[k + 1] - d.X[k]); else { const va = d.V[k], vb = d.V[k + 1]; if (va * vb >= 0) dist += Math.abs(va + vb); else { const tz = 2 * va / (va - vb); dist += Math.abs(va * tz / 2) + Math.abs(vb * (2 - tz) / 2); } } }
    text('distance ' + fint(+dist.toFixed(2)) + ' m', 400, 248, { font: '700 11px ' + mono });
    text('click a dot or use the', 400, 290, { font: '600 9px ' + mono, col: '#8a8a8a' }); text('slider to pick a piece', 400, 302, { font: '600 9px ' + mono, col: '#8a8a8a' });
  }
};
