// Mass on a Spring: T = 2π√(m/k), graphs of x, v and a, and energy. Horizontal, vertical, and the ISS "space scale".
const LAB_K = 25, LB = window._shmLab = window._shmLab || { pts: [], msg: '', btns: [] };
function labDraw(v, d, opt, dt, A){
  const mono = '"IBM Plex Mono",monospace', sg = '"Space Grotesk",sans-serif', SPD = 3;
  if (A.t === undefined || A.reset) A.t = 0; const Tm = Math.round(10 * d.T * 100) / 100; A.t = Math.min(A.t + dt * SPD, Tm + 1e-6);
  const done = A.t >= Tm, cnt = Math.min(10, Math.floor(A.t / d.T)), w = 2 * PI / d.T, x = 0.1 * Math.cos(w * A.t);
  LB.cur = { v, d, done, Tm, A };
  if (!window._shmHook){ window._shmHook = 1; cv.addEventListener('pointerdown', e => { if (S.mode !== 'lab' || !LB.cur) return; const r = cv.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * 600, py = (e.clientY - r.top) / r.height * 330;
    const b = LB.btns.find(b => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h); if (!b) return; const c = LB.cur;
    if (b.id === 'rst'){ c.A.t = 0; LB.msg = ''; }
    else if (b.id === 'clr'){ LB.pts = []; LB.msg = 'Table cleared'; }
    else if (!c.done) LB.msg = 'Wait for 10 oscillations';
    else { const T = Math.round(c.Tm * 100) / 1000, pt = { m: c.v.m, T, T2: T * T }, k = LB.pts.findIndex(p => Math.abs(p.m - pt.m) < 0.001);
      if (k >= 0){ LB.pts[k] = pt; LB.msg = 'Replaced m = ' + fplain(pt.m); } else if (LB.pts.length >= 8) LB.msg = 'Table full: clear it first'; else { LB.pts.push(pt); LB.pts.sort((a, b) => a.m - b.m); LB.msg = 'Recorded'; } }
    update(); }); }
  panelTitle('HORIZONTAL SPRING (k ' + (opt.kshow === 'shown' ? '= ' + d.k + ' N/m' : 'hidden') + ')', 10, 18);
  const eq = 105, bx = eq + x * 350, mw = 24 + 9 * Math.cbrt(v.m), mh = mw * 0.8, ty = 70;
  ctx.fillStyle = '#111'; ctx.fillRect(10, ty - 28, 6, 60); ctx.fillStyle = '#e6dccb'; ctx.fillRect(10, ty + 32, 150, 6);
  ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(16, ty); const L = bx - mw / 2 - 16; for (let i = 1; i < 14; i++) ctx.lineTo(16 + L * i / 14, ty + (i % 2 ? 8 : -8)); ctx.lineTo(bx - mw / 2, ty); ctx.stroke();
  ctx.fillStyle = '#ff6a2b'; ctx.fillRect(bx - mw / 2, ty + 32 - mh, mw, mh); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(bx - mw / 2, ty + 32 - mh, mw, mh); text(fplain(v.m) + ' kg', bx, ty + 32 - mh / 2 + 3, { align: 'center', font: '700 9px ' + mono });
  ctx.setLineDash([4, 3]); ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(eq, ty - 30); ctx.lineTo(eq, ty + 44); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#111'; ctx.fillRect(10, 118, 150, 52); ctx.fillStyle = '#e8f0e0'; ctx.fillRect(12, 120, 146, 48);
  text(fplain(Math.floor(A.t * 100) / 100).replace(/^(\d+)$/, '$1.00') + ' s', 85, 146, { align: 'center', font: '700 22px ' + mono, col: '#111' });
  text('oscillations: ' + cnt + ' / 10', 85, 162, { align: 'center', font: '600 9px ' + mono, col: '#4a4a4a' });
  text(done ? 'T = ' + fplain(Tm) + ' ÷ 10 = ' + fplain(Tm / 10) + ' s' : 'timing… (×3 speed)', 10, 188, { font: '700 11px ' + mono, col: done ? '#1e7d45' : '#4a4a4a' });
  // plot T² vs m
  const gx = 190, gy0 = 290, gw = 190, gh = 215, Ym = 7, X = m => gx + gw * m / 4, Y = q => gy0 - gh * q / Ym;
  text('T² (s²)', gx - 4, gy0 - gh - 10, { font: '500 10px ' + mono, col: '#4a4a4a' });
  ctx.strokeStyle = '#e1e1e1'; ctx.lineWidth = 1; for (let q = 2; q <= 6; q += 2){ ctx.beginPath(); ctx.moveTo(gx, Y(q)); ctx.lineTo(gx + gw, Y(q)); ctx.stroke(); text(String(q), gx - 4, Y(q) + 3, { align: 'right', font: '500 9px ' + mono, col: '#4a4a4a' }); }
  for (let m = 1; m <= 4; m++){ ctx.beginPath(); ctx.moveTo(X(m), gy0); ctx.lineTo(X(m), gy0 - gh); ctx.stroke(); text(String(m), X(m), gy0 + 13, { align: 'center', font: '500 9px ' + mono, col: '#4a4a4a' }); }
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke(); text('m (kg)', gx + gw, gy0 + 26, { align: 'right', font: '500 10px ' + mono, col: '#4a4a4a' });
  if (d.slope){ ctx.save(); ctx.beginPath(); ctx.rect(gx, gy0 - gh, gw, gh); ctx.clip(); ctx.strokeStyle = COL.V; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(4), Y(d.slope * 4)); ctx.stroke(); ctx.restore(); }
  LB.pts.forEach(p => { ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X(p.m), Y(p.T2), 4.5, 0, 7); ctx.fill(); ctx.stroke(); });
  // table and result
  panelTitle('DATA TABLE', 395, 18);
  ['m (kg)', 'T (s)', 'T² (s²)'].forEach((h, i) => text(h, [400, 470, 540][i], 34, { font: '700 10px ' + mono, col: '#4a4a4a' })); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(395, 39); ctx.lineTo(590, 39); ctx.stroke();
  LB.pts.forEach((p, i) => [fplain(p.m), fplain(p.T), fplain(p.T2)].forEach((s, j) => text(s, [400, 470, 540][j], 52 + i * 13, { font: '600 10px ' + mono })));
  if (!LB.pts.length) text('empty: time a mass, then Record', 400, 54, { font: '500 11px ' + sg, col: '#7a7a7a' });
  panelTitle('BEST-FIT LINE THROUGH 0', 395, 172);
  if (d.slope){ text('slope = ' + fplain(d.slope) + ' s²/kg', 400, 190, { font: '700 11px ' + mono }); text('k = 4π²/slope = ' + fplain(d.kfit) + ' N/m', 400, 208, { font: '700 11px ' + mono, col: '#1546d6' }); if (opt.kshow === 'shown') text('(label says ' + d.k + ' N/m)', 400, 224, { font: '500 10px ' + mono, col: '#4a4a4a' }); }
  else text('record at least one point', 400, 190, { font: '500 11px ' + sg, col: '#7a7a7a' });
  if (LB.msg) text(LB.msg, 395, 252, { font: '600 11px ' + sg, col: '#c43a00' });
  LB.btns = [{ id: 'rec', x: 395, y: 262, w: 66, h: 26, t: 'Record' }, { id: 'rst', x: 467, y: 262, w: 66, h: 26, t: 'Restart' }, { id: 'clr', x: 539, y: 262, w: 50, h: 26, t: 'Clear' }];
  LB.btns.forEach(b => { const off = b.id === 'rec' && !done; ctx.fillStyle = off ? '#eee' : '#fff'; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.strokeStyle = off ? '#999' : '#111'; ctx.lineWidth = 2; ctx.strokeRect(b.x, b.y, b.w, b.h); text(b.t, b.x + b.w / 2, b.y + 17, { align: 'center', font: '700 12px ' + sg, col: off ? '#888' : '#111' }); });
}
const SIM = {
  title: 'Mass on a Spring',
  modes: [{ id: 'horiz', label: 'Horizontal' }, { id: 'vert', label: 'Vertical' }, { id: 'space', label: 'Weighing in space' }, { id: 'lab', label: 'Lab: T² vs m' }],
  opts: [{ id: 'kshow', label: 'Spring', modes: ['lab'], choices: [['mystery', 'Mystery k'], ['shown', 'k shown']] }],
  ivs(mode){
    if (mode === 'lab') return [{ id: 'm', sym: 'm', symText: 'm', label: 'Mass', unit: 'kg', min: 0.1, max: 4, step: 0.05, val: 1, graph: true }];
    if (mode === 'space') return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Astronaut’s mass (what we want to find)', unit: 'kg', min: 40, max: 120, step: 1, val: 75, graph: true },
      { id: 'mc', sym: 'm<sub>chair</sub>', symText: 'm_chair', label: 'Chair mass', unit: 'kg', min: 5, max: 30, step: 1, val: 15 },
      { id: 'k', sym: 'k', symText: 'k', label: 'Spring constant', unit: 'N/m', min: 500, max: 5000, step: 50, val: 2000 },
      { id: 'A', sym: 'A', symText: 'A', label: 'Amplitude', unit: 'm', min: 0.02, max: 0.2, step: 0.01, val: 0.1 }];
    return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Mass', unit: 'kg', min: 0.1, max: 4, step: 0.05, val: 1, graph: true },
      { id: 'k', sym: 'k', symText: 'k', label: 'Spring constant', unit: 'N/m', min: 5, max: 200, step: 1, val: 40 },
      { id: 'A', sym: 'A', symText: 'A', label: 'Amplitude', unit: 'm', min: 0.02, max: 0.3, step: 0.01, val: 0.15 }];
  },
  presets: [{ label: '4× the mass', mode: 'horiz', v: { m: 4, k: 40 } }, { label: 'Double the amplitude', mode: 'horiz', v: { A: 0.3 } }],
  calc(v, mode){
    if (mode === 'lab'){ const k = LAB_K, T = 2 * PI * Math.sqrt(v.m / k), P = LB.pts, sm = P.reduce((a, p) => a + p.m * p.m, 0), slope = P.length ? P.reduce((a, p) => a + p.m * p.T2, 0) / sm : null;
      return { k, T, T2: T * T, slope0: 4 * PI * PI / k, slope, kfit: slope ? 4 * PI * PI / slope : null, n: P.length, M: v.m }; }
    const M = mode === 'space' ? v.m + v.mc : v.m, w = Math.sqrt(v.k / M), T = 2 * PI / w, f = 1 / T, vmax = v.A * w, amax = v.A * w * w, E = 0.5 * v.k * v.A * v.A, x0 = mode === 'vert' ? M * G10 / v.k : 0;
    return { M, w, T, f, vmax, amax, E, x0, Fmax: v.k * v.A, mBack: v.k * T * T / (4 * PI * PI) - (mode === 'space' ? v.mc : 0) };
  },
  dvs(mode){
    if (mode === 'lab') return [{ id: 'T2', name: 'Period squared T²', short: 'T²', sym: 'T²', unit: 's²', f: d => d.T2 }, { id: 'T', name: 'Period', short: 'T', sym: 'T', unit: 's', f: d => d.T }];
    const l = [
    { id: 'T', name: 'Period', short: 'T', sym: 'T', unit: 's', f: d => d.T },
    { id: 'vmax', name: 'Maximum speed Aω', short: 'v_max', sym: 'v<sub>max</sub>', unit: 'm/s', f: d => d.vmax },
    { id: 'amax', name: 'Maximum acceleration Aω²', short: 'a_max', sym: 'a<sub>max</sub>', unit: 'm/s²', f: d => d.amax },
    { id: 'E', name: 'Total energy ½kA²', short: 'E', sym: 'E', unit: 'J', f: d => d.E },
    { id: 'f', name: 'Frequency', short: 'f', sym: 'f', unit: 'Hz', f: d => d.f }];
    if (mode === 'vert') l.push({ id: 'x0', name: 'Stretch at equilibrium mg/k', short: 'x_eq', sym: 'x<sub>eq</sub>', unit: 'm', f: d => d.x0 });
    return l; },
  work(v, d, mode, opt){
    if (mode === 'lab') return '<h4>1 · Square the period formula</h4><p class="st">A straight line through the origin if you graph T² against m:</p>' + TEX`T = 2\pi\sqrt{\frac{m}{k}}` + TEXA`T^2 = \frac{4\pi^2}{k}\,m` +
      '<h4>2 · The slope gives k</h4>' + TEX`\text{slope} = \frac{4\pi^2}{k}` + TEX`k = \frac{4\pi^2}{\text{slope}}` +
      (d.slope ? '<p class="st">From your ' + d.n + ' recorded point' + (d.n > 1 ? 's' : '') + ' (best-fit line through the origin):</p>' + TEX`\text{slope} = ${M.n(d.slope, 's²/kg')}` + TEX`k = \frac{4\pi^2}{${M.n(d.slope)}}` + TEXA`k = ${M.n(d.kfit, 'N/m')}` + (opt.kshow === 'shown' ? '<p class="st">The spring is labeled ' + H.n(d.k, 'N/m') + ' → a check on your lab.</p>' : '<p class="st">The label is hidden: your graph is the only way to find k.</p>') : '<p class="st">Record a few masses (Record button) and the slope appears here.</p>') +
      '<p class="st">At m = ' + H.iv('m') + ':</p>' + TEX`T = 2\pi\sqrt{\frac{${M.iv('m')}}{${M.n(d.k)}}}` + TEX`T = ${M.n(d.T, 's')}` + TEX`T^2 = ${M.n(d.T2, 's²')}` +
      '<p class="note">The stopwatch counts 10 oscillations (the animation runs ×3 faster than real time). T = time ÷ 10, which cuts down timing error.</p>' +
      '<p class="note">Why T² and not T? T vs m is a curve; T² vs m is a line through the origin, and a line’s slope is easy to read.</p>';
    if (mode === 'space') return '<h4>1 · On the ISS a bathroom scale reads zero, but mass still resists acceleration</h4><p class="st">NASA’s body-mass device: the astronaut rides a spring-mounted chair and the period is timed.</p>' +
      '<h4>2 · The period depends on the total mass on the spring</h4>' + TEX`T = 2\pi\sqrt{\frac{m + m_{\text{chair}}}{k}}` + TEX`T = 2\pi\sqrt{\frac{${M.n(d.M)}}{${M.iv('k')}}}` + TEXA`T = ${M.n(d.T, 's')}` +
      '<h4>3 · Work backward from the measured T</h4>' + TEX`m = \frac{k T^2}{4\pi^2} - m_{\text{chair}}` + TEX`m = \frac{(${M.iv('k')})(${M.n(d.T)})^2}{4\pi^2} - ${M.iv('mc')}` + TEXA`m = ${M.n(d.mBack, 'kg')}` + '<p class="st">That matches the mass we started with ✓</p>' +
      '<p class="note">No gravity needed: the spring force alone gives a = −(k/m)x. That’s also why a vertical spring has the same period as a horizontal one.</p>';
    let h = '<h4>1 · Restoring force: F = −kx (always toward equilibrium) → a = −(k/m)x</h4>' + TEX`\omega = \sqrt{\frac{k}{m}}` + TEX`\omega = \sqrt{\frac{${M.iv('k')}}{${M.iv('m')}}}` + TEX`\omega = ${M.n(d.w, 'rad/s')}` +
      '<h4>2 · Period and frequency</h4>' + TEX`T = 2\pi\sqrt{\frac{m}{k}}` + TEXA`T = ${M.n(d.T, 's')}` + TEX`f = \frac{1}{T}` + TEX`f = ${M.n(d.f, 'Hz')}` +
      '<p class="note">Amplitude isn’t in the formula: a bigger swing goes farther but faster, in the same time. 4× the mass → 2× the period.</p>' +
      '<h4>3 · Where things are biggest</h4><p class="st">At the ends (x = ±A): v = 0.</p>' + TEX`a_{\max} = A\,\omega^2` + TEX`a_{\max} = (${M.iv('A')})(${M.n(d.w)})^2` + TEXA`a_{\max} = ${M.n(d.amax, 'm/s²')}` +
      TEX`|F| = k A` + TEX`|F| = (${M.iv('k')})(${M.iv('A')})` + TEX`|F| = ${M.n(d.Fmax, 'N')}` +
      '<p class="st">At equilibrium (x = 0): a = 0, speed is max.</p>' + TEX`v_{\max} = A\,\omega` + TEX`v_{\max} = (${M.iv('A')})(${M.n(d.w)})` + TEXA`v_{\max} = ${M.n(d.vmax, 'm/s')}` +
      '<h4>4 · Energy</h4>' + TEX`E = \frac{1}{2} k A^2` + TEX`E = ${M.n(d.E, 'J')}` + TEX`E = \frac{1}{2} m\,v_{\max}^2` + '<p class="st">It trades between spring energy (ends) and kinetic energy (middle).</p>';
    if (mode === 'vert') h += '<h4>5 · Vertical: gravity only moves the center</h4><p class="st">New equilibrium where kx = mg:</p>' + TEX`x_{\text{eq}} = \frac{m g}{k}` + TEX`x_{\text{eq}} = ${M.n(d.x0, 'm')}` + '<p class="st">It oscillates about that point with the same T = 2π√(m/k).</p>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'lab') return labDraw(v, d, opt, dt, A);
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const tt = A.t, w = d.w, x = v.A * Math.cos(w * tt), vel = -v.A * w * Math.sin(w * tt), acc = -w * w * x;
    const sc = 300, spring = (x1, y1, x2, y2, n) => { ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L; for (let i = 1; i < n; i++){ const s = i / n, o = (i % 2 ? 9 : -9); ctx.lineTo(x1 + ux * L * s - uy * o, y1 + uy * L * s + ux * o); } ctx.lineTo(x2, y2); ctx.stroke(); };
    if (mode === 'vert'){
      panelTitle('VERTICAL SPRING', 10, 18);
      ctx.fillStyle = '#111'; ctx.fillRect(40, 28, 120, 6); const eq = 160, by = eq + x * sc;   // down = + on screen
      spring(100, 34, 100, by - 18, 14); ctx.fillStyle = '#ff6a2b'; ctx.fillRect(80, by - 18, 40, 36); ctx.strokeStyle = '#111'; ctx.strokeRect(80, by - 18, 40, 36);
      ctx.setLineDash([4, 3]); ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(40, eq); ctx.lineTo(170, eq); ctx.stroke(); ctx.setLineDash([]); text('equilibrium', 172, eq + 4, { font: '600 9px "IBM Plex Mono",monospace', col: '#1e7d45' });
      if (Math.abs(vel) > 0.01) arrow(135, by, 135, by + vel * 40, COL.V, 'v', { w: 2.5, head: 6, lx: 5, ly: 0 });
    } else {
      panelTitle(mode === 'space' ? 'BODY-MASS DEVICE ON THE ISS (top view)' : 'HORIZONTAL SPRING, NO FRICTION', 10, 18);
      const eq = 190, bx = eq + x * (mode === 'space' ? 600 : sc);
      ctx.fillStyle = '#111'; ctx.fillRect(20, 60, 6, 70); ctx.fillStyle = '#e6dccb'; if (mode !== 'space') ctx.fillRect(20, 130, 360, 10);
      spring(26, 95, bx - 22, 95, 16);
      if (mode === 'space'){ ctx.fillStyle = '#9aa7b8'; ctx.fillRect(bx - 22, 70, 44, 50); ctx.fillStyle = '#f2c7a0'; ctx.beginPath(); ctx.arc(bx, 60, 10, 0, 7); ctx.fill(); ctx.fillStyle = '#1546d6'; ctx.fillRect(bx - 12, 70, 24, 40); }
      else { ctx.fillStyle = '#ff6a2b'; ctx.fillRect(bx - 22, 76, 44, 54); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(bx - 22, 76, 44, 54); }
      ctx.setLineDash([4, 3]); ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(eq, 40); ctx.lineTo(eq, 150); ctx.stroke(); ctx.setLineDash([]);
      if (Math.abs(vel) > 0.01) arrow(bx, 160, bx + vel * 60, 160, COL.V, 'v', { w: 2.5, head: 6, lx: 0, ly: 10, align: 'center' });
      if (Math.abs(acc) > 0.05) arrow(bx, 178, bx + Math.max(-60, Math.min(60, acc * 8)), 178, '#c43a00', 'a', { w: 2.5, head: 6, lx: 0, ly: 10, align: 'center' });
    }
    // energy bars
    const K = 0.5 * d.M * vel * vel, U = 0.5 * v.k * x * x, by0 = 300, eh = 90;
    [['K', K, '#1546d6'], ['U_s', U, '#7a3fb0'], ['E', d.E, '#111']].forEach(([l, q, c], i) => { const hh = eh * q / d.E, xx = 240 + i * 45; ctx.fillStyle = c; ctx.fillRect(xx, by0 - hh, 30, hh); text(l, xx + 15, by0 + 12, { align: 'center', font: '700 10px "IBM Plex Mono",monospace' }); });
    text('T = ' + fplain(d.T) + ' s', 12, 300, { font: '700 13px "Space Grotesk",sans-serif' });
    text('x = ' + fplain(x) + ' m', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // x, v, a graphs over 2 periods
    const Tw = 2 * d.T, gx = 415, gw = 170, rows = [['x', q => v.A * Math.cos(w * q), v.A, '#ff6a2b'], ['v', q => -v.A * w * Math.sin(w * q), d.vmax, COL.V], ['a', q => -w * w * v.A * Math.cos(w * q), d.amax, '#c43a00']];
    rows.forEach(([lab, f, mx, col], i) => { const cy = 50 + i * 95, hh = 36, X = q => gx + gw * q / Tw, Y = q => cy - hh * q / mx;
      ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, cy); ctx.lineTo(gx + gw, cy); ctx.stroke(); ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(gx, cy - hh - 4); ctx.lineTo(gx, cy + hh + 4); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let k = 0; k <= 120; k++){ const q = Tw * k / 120; k ? ctx.lineTo(X(q), Y(f(q))) : ctx.moveTo(X(q), Y(f(q))); } ctx.stroke();
      const qn = tt % Tw; ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(qn), Y(f(qn)), 4, 0, 7); ctx.fill();
      text(lab, gx - 8, cy + 4, { align: 'right', font: '700 12px "IBM Plex Mono",monospace', col });
      text('±' + fplain(mx), gx + gw, cy - hh - 6, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); });
    text('two periods', gx + gw, 318, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
