const PL_I0 = 0.012, PL_RM = 0.6, PL_RR = 0.12;   // platform alone (kg·m²); ring: 0.6 kg at 0.12 m
// Massive Pulley: the pulley's rotational inertia slows everything down, and the tensions on the two sides differ.
const PL_BTN = { rec: [397, 140, 86, 20], clr: [488, 140, 52, 20] };
function platRecord(){
  if (S.mode !== 'platform') return; const A = S.anim, d = S.d, v = S.v; A.rec = A.rec || [];
  if (A.rec.length >= 6){ A.msg = '6 max: press Clear'; A.msgT = S.t; return; }
  const j = Math.sin((A.rec.length + 1) * 12.9898 + v.m * 78.233 + v.h * 37.719 + v.r * 311.7) * 43758.5453, tm = d.t * (1 + 0.02 * (2 * (j - Math.floor(j)) - 1)), a = 2 * v.h / (tm * tm);
  A.rec.push({ m: v.m, r: v.r, t: tm, a, I: v.m * (G10 - a) * v.r * v.r / a, Itrue: d.I }); A.msg = null;
}
(function(){
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 600 / r.width, (e.clientY - r.top) * 330 / r.height]; }, hit = (b, x, y) => x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3];
  cv.addEventListener('pointerdown', e => { if (S.mode !== 'platform') return; const [x, y] = pos(e); if (hit(PL_BTN.rec, x, y)) platRecord(); else if (hit(PL_BTN.clr, x, y)) S.anim.rec = []; });
  cv.addEventListener('pointermove', e => { if (S.mode !== 'platform') return; const [x, y] = pos(e); cv.style.cursor = hit(PL_BTN.rec, x, y) || hit(PL_BTN.clr, x, y) ? 'pointer' : ''; });
  addEventListener('keydown', e => { if (S.mode === 'platform' && (e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !e.altKey) platRecord(); });
})();
function platDraw(v, d, opt, dt, A){
  if (A.t === undefined || A.reset) A.t = 0; A.t += dt; if (A.reset) A.rec = A.rec || [];
  const cyc = d.t + 1.4, tt = A.t % cyc, run = Math.min(tt, d.t), s = Math.min(v.h, 0.5 * d.a * run * run), ang = s / v.r, mono = '"IBM Plex Mono",monospace', gro = '"Space Grotesk",sans-serif';
  panelTitle('FALLING MASS SPINS A PLATFORM', 10, 18);
  // table, platform (flat disk seen from the side), spindle, string over a pulley, hanging mass
  const cx = 125, cy = 116, rx = 82, ry = 15, rsp = 4 + v.r * 100, ty = 124;
  ctx.fillStyle = '#e6dccb'; ctx.fillRect(20, ty + 10, 252, 10); ctx.fillRect(30, ty + 20, 10, 150); ctx.fillRect(252, ty + 20, 10, 150);
  ctx.fillStyle = '#555'; ctx.fillRect(cx - 5, cy + 6, 10, ty + 10 - cy - 6);
  ctx.fillStyle = '#7d8a9b'; ctx.beginPath(); ctx.ellipse(cx, cy + 6, rx, ry, 0, 0, PI); ctx.lineTo(cx - rx, cy); ctx.lineTo(cx + rx, cy); ctx.fill();
  ctx.fillStyle = '#c4ced9'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.fill(); ctx.stroke();
  if (d.ring){ ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.8, ry * 0.8, 0, 0, 7); ctx.stroke(); }
  ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + rx * 0.95 * Math.cos(ang), cy + ry * 0.95 * Math.sin(ang)); ctx.stroke();
  ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(cx + rx * 0.9 * Math.cos(ang), cy + ry * 0.9 * Math.sin(ang), 3.5, 0, 7); ctx.fill();
  const sp = cy - 12; ctx.fillStyle = '#9aa7b8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(cx - rsp, sp, 2 * rsp, 12); ctx.strokeRect(cx - rsp, sp, 2 * rsp, 12);
  ctx.beginPath(); ctx.ellipse(cx, sp, rsp, rsp * 0.3, 0, 0, 7); ctx.fillStyle = '#c4ced9'; ctx.fill(); ctx.stroke();
  const px = 282, py = sp, hx = px + 9, y0 = 140, sc = 88, my = y0 + s * sc, b = 20 + 12 * Math.sqrt(v.m);
  ctx.fillStyle = '#444'; ctx.fillRect(px - 6, py + 8, 12, ty + 10 - py - 8);
  ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + rsp, sp); ctx.lineTo(px, sp - 9); ctx.arc(px, py, 9, -PI / 2, 0); ctx.lineTo(hx, my); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py, 4, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff6a2b'; ctx.fillRect(hx - b / 2, my, b, b * 0.8); ctx.strokeRect(hx - b / 2, my, b, b * 0.8); text('m', hx, my + b * 0.4 + 4, { align: 'center', font: '700 11px ' + gro, col: '#fff' });
  const fy = y0 + v.h * sc + b * 0.8; ctx.save(); ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(280, fy); ctx.lineTo(385, fy); ctx.stroke(); ctx.restore();
  text('stop', 383, fy - 4, { align: 'right', font: '600 9px ' + mono, col: '#1e7d45' });
  ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(368, y0 + b * 0.8); ctx.lineTo(368, fy); ctx.stroke(); text('h = ' + fplain(v.h) + ' m', 383, fy + 12, { align: 'right', font: '700 10px ' + mono, col: '#1e7d45' });
  const fs = 40 / Math.max(d.W, 1), ym = my + b * 0.4;
  arrow(hx + b / 2 + 8, ym, hx + b / 2 + 8, ym - d.T * fs, COL.T, 'T', { lx: 4, ly: 0 }); arrow(hx + b / 2 + 20, ym, hx + b / 2 + 20, ym + d.W * fs, COL.W, 'mg', { lx: 4, ly: 0 });
  text(d.ring ? 'platform + ring (purple)' : 'platform alone', 20, 80, { font: '600 10px ' + mono, col: '#4a4a4a' });
  text('t = ' + fplain(run) + ' s   (full drop: ' + fplain(d.t) + ' s)', 12, 300, { font: '700 12px ' + gro });
  text('a = 2h/t² = ' + fplain(d.a) + ' m/s²    α = a/r = ' + fplain(d.al) + ' rad/s²', 12, 318, { font: '600 10px ' + mono, col: '#4a4a4a' });
  // readings
  panelTitle('THIS DROP (IDEAL)', 395, 18);
  [['time to fall h', fplain(d.t) + ' s'], ['a = 2h/t²', fplain(d.a) + ' m/s²'], ['α = a/r', fplain(d.al) + ' rad/s²'], ['T = m(g − a)', fplain(d.T) + ' N'], ['τ = rT', fplain(d.tau) + ' N·m'], ['I = τ/α', fplain(d.Imeas) + ' kg·m²']].forEach(([l, val], i) => { text(l, 400, 36 + i * 15, { font: '600 10px ' + mono, col: '#4a4a4a' }); text(val, 595, 36 + i * 15, { align: 'right', font: '700 11px ' + mono }); });
  text('true I' + (d.ring ? ' (+ ring)' : ''), 400, 36 + 6 * 15 + 3, { font: '600 10px ' + mono, col: '#1e7d45' }); text(fplain(d.I) + ' kg·m²', 595, 36 + 6 * 15 + 3, { align: 'right', font: '700 11px ' + mono, col: '#1e7d45' });
  const btn = (bb, label, on) => { ctx.fillStyle = on ? '#111' : '#fff'; ctx.fillRect(bb[0], bb[1], bb[2], bb[3]); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(bb[0], bb[1], bb[2], bb[3]); text(label, bb[0] + bb[2] / 2, bb[1] + 14, { align: 'center', font: '700 12px ' + gro, col: on ? '#fff' : '#111' }); };
  btn(PL_BTN.rec, 'Record (R)', true); btn(PL_BTN.clr, 'Clear', false);
  const rec = A.rec || [];
  text('run', 400, 184, { font: '600 9px ' + mono, col: '#4a4a4a' }); text('m (kg)', 424, 184, { font: '600 9px ' + mono, col: '#4a4a4a' }); text('t (s)', 478, 184, { font: '600 9px ' + mono, col: '#4a4a4a' }); text('a (m/s²)', 520, 184, { font: '600 9px ' + mono, col: '#4a4a4a' }); text('I', 595, 184, { align: 'right', font: '600 9px ' + mono, col: '#4a4a4a' });
  ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(397, 188); ctx.lineTo(598, 188); ctx.stroke();
  rec.forEach((r, i) => { const y = 200 + i * 13, f = '600 9px ' + mono; text(String(i + 1), 400, y, { font: f }); text(fplain(r.m), 424, y, { font: f }); text(fplain(r.t), 478, y, { font: f }); text(fplain(r.a), 520, y, { font: f }); text(fplain(r.I), 595, y, { align: 'right', font: f, col: '#c43a00' }); });
  if (!rec.length) text('press Record (or R) to log a run', 400, 204, { font: '500 9px ' + mono, col: '#4a4a4a' });
  if (rec.length){ const mean = rec.reduce((x, r) => x + r.I, 0) / rec.length, err = 100 * (mean - d.I) / d.I;
    text('mean I = ' + fplain(mean) + ' kg·m²', 400, 292, { font: '700 10px ' + mono }); text('true I = ' + fplain(d.I) + ' (' + (err >= 0 ? '+' : '−') + Math.abs(err).toFixed(1) + '%)', 400, 306, { font: '600 10px ' + mono, col: '#1e7d45' }); }
  if (A.msg && S.t - A.msgT < 2.5) text(A.msg, 400, 320, { font: '700 10px ' + mono, col: '#c43a00' });
}
const SIM = {
  title: 'Massive Pulley',
  modes: [{ id: 'spool', label: 'Hanging from a spool' }, { id: 'atwood', label: 'Atwood' }, { id: 'table', label: 'Table + hanging mass' }, { id: 'platform', label: 'Falling mass spins a platform (lab)' }],
  opts: [{ id: 'load', label: 'Platform', modes: ['platform'], choices: [['plat', 'Alone'], ['ring', '+ ring']] }, { id: 'shape', label: 'Pulley', modes: ['spool', 'atwood', 'table'], choices: [['disk', 'Disk ½MR²'], ['hoop', 'Hoop MR²']] }],
  ivs(mode){
    const l = [];
    if (mode === 'platform') return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Falling mass', unit: 'kg', min: 0.05, max: 0.5, step: 0.01, val: 0.2, graph: true },
      { id: 'h', sym: 'h', symText: 'h', label: 'Fall height', unit: 'm', min: 0.2, max: 1.5, step: 0.05, val: 0.8 },
      { id: 'r', sym: 'r', symText: 'r', label: 'Spindle radius', unit: 'm', min: 0.02, max: 0.08, step: 0.005, val: 0.05, show: x => x.toFixed(3) + ' m' }];
    if (mode === 'spool') l.push({ id: 'm', sym: 'm', symText: 'm', label: 'Hanging mass', unit: 'kg', min: 0.1, max: 5, step: 0.1, val: 1 });
    else l.push({ id: 'm1', sym: 'm<sub>1</sub>', symText: 'm1', label: mode === 'atwood' ? 'Left mass' : 'Block on the table', unit: 'kg', min: 0.1, max: 5, step: 0.1, val: mode === 'atwood' ? 3 : 2 },
      { id: 'm2', sym: 'm<sub>2</sub>', symText: 'm2', label: mode === 'atwood' ? 'Right mass' : 'Hanging mass', unit: 'kg', min: 0.1, max: 5, step: 0.1, val: mode === 'atwood' ? 1 : 1 });
    l.push({ id: 'M', sym: 'M', symText: 'M', label: 'Pulley mass', unit: 'kg', min: 0, max: 10, step: 0.1, val: 2, graph: true },
      { id: 'R', sym: 'R', symText: 'R', label: 'Pulley radius', unit: 'm', min: 0.05, max: 0.5, step: 0.01, val: 0.2 });
    return l;
  },
  get presets(){ return S.mode === 'platform' ? [{ label: 'Heavier mass', mode: 'platform', v: { m: 0.4 } }, { label: 'Add the ring', mode: 'platform', opt: { load: 'ring' }, v: {} }, { label: 'Fat spindle', mode: 'platform', v: { r: 0.08 } }]
    : [{ label: 'Massless pulley', v: { M: 0 } }, { label: 'Heavy pulley', v: { M: 8 } }]; },
  calc(v, mode, opt){
    if (mode === 'platform'){ const I = PL_I0 + (opt.load === 'ring' ? PL_RM * PL_RR * PL_RR : 0), a = v.m * G10 / (v.m + I / (v.r * v.r)), t = Math.sqrt(2 * v.h / a), T = v.m * (G10 - a), al = a / v.r, tau = v.r * T;
      return { I, a, t, T, al, tau, Imeas: tau / al, ring: opt.load === 'ring', W: v.m * G10, vf: a * t }; }
    const k = opt.shape === 'hoop' ? 1 : 0.5, I = k * v.M * v.R * v.R, Ieff = k * v.M;   // I/R² = kM
    if (mode === 'spool'){ const a = v.m * G10 / (v.m + Ieff), T = v.m * (G10 - a); return { k, I, Ieff, a, T, al: a / v.R, a0: G10, T1: T, T2: 0, tau: T * v.R }; }
    if (mode === 'atwood'){ const a = (v.m1 - v.m2) * G10 / (v.m1 + v.m2 + Ieff), T1 = v.m1 * (G10 - a), T2 = v.m2 * (G10 + a), a0 = (v.m1 - v.m2) * G10 / (v.m1 + v.m2);
      return { k, I, Ieff, a, T1, T2, al: a / v.R, a0, tau: (T1 - T2) * v.R }; }
    const a = v.m2 * G10 / (v.m1 + v.m2 + Ieff), T1 = v.m1 * a, T2 = v.m2 * (G10 - a), a0 = v.m2 * G10 / (v.m1 + v.m2);
    return { k, I, Ieff, a, T1, T2, al: a / v.R, a0, tau: (T2 - T1) * v.R };
  },
  dvs(mode){
    if (mode === 'platform') return [{ id: 't', name: 'Time to fall h', short: 't', sym: 't', unit: 's', f: d => d.t }, { id: 'a', name: 'Acceleration of the mass', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a }, { id: 'al', name: 'Platform’s angular acceleration', short: 'α', sym: 'α', unit: 'rad/s²', f: d => d.al }, { id: 'T', name: 'String tension', short: 'T', sym: 'T', unit: 'N', f: d => d.T }];
    const l = [{ id: 'a', name: 'Acceleration of the masses', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a, vs: 'a0' }, { id: 'a0', name: 'Acceleration with a massless pulley', short: 'a₀', sym: 'a<sub>0</sub>', unit: 'm/s²', f: d => d.a0 }];
    if (mode === 'spool') l.push({ id: 'T1', name: 'String tension', short: 'T', sym: 'T', unit: 'N', f: d => d.T1 });
    else l.push({ id: 'T1', name: mode === 'atwood' ? 'Tension on the left' : 'Tension to the block', short: 'T1', sym: 'T<sub>1</sub>', unit: 'N', f: d => d.T1 }, { id: 'T2', name: mode === 'atwood' ? 'Tension on the right' : 'Tension to the hanging mass', short: 'T2', sym: 'T<sub>2</sub>', unit: 'N', f: d => d.T2 });
    l.push({ id: 'al', name: 'Pulley’s angular acceleration', short: 'α', sym: 'α', unit: 'rad/s²', f: d => d.al });
    return l; },
  work(v, d, mode, opt){
    if (mode === 'platform'){
      const I5 = d.ring ? TEX`I = I_{\text{platform}} + M_{\text{ring}}R^2` + TEX`I = ${M.n(PL_I0)} + (${M.n(PL_RM)})(${M.n(PL_RR)})^2` + TEXA`I_{\text{true}} = ${M.n(d.I, 'kg·m²')}` : TEXA`I_{\text{true}} = ${M.n(d.I, 'kg·m²')}`;
      return '<h4>1 · Time the fall (from rest)</h4><p class="st">The stopwatch reads t for the mass to fall h:</p>' + TEX`h = \tfrac{1}{2}at^2` + TEX`a = \frac{2h}{t^2}` + TEX`a = \frac{2(${M.iv('h')})}{(${M.n(d.t, 's')})^2}` + TEXA`a = ${M.n(d.a, 'm/s²')}` +
        '<h4>2 · The string unwinds from the spindle: a = rα</h4>' + TEX`\alpha = \frac{a}{r}` + TEX`\alpha = \frac{${M.n(d.a)}}{${M.iv('r')}}` + TEXA`\alpha = ${M.n(d.al, 'rad/s²')}` +
        '<h4>3 · Hanging mass (down = +): find T</h4>' + TEX`mg - T = ma` + TEX`T = m(g - a)` + TEX`T = (${M.iv('m')})(10 - ${M.n(d.a)})` + TEXA`T = ${M.n(d.T, 'N')}` +
        '<p class="st">T is less than mg = ' + H.n(d.W, 'N') + ' because the mass speeds up.</p>' +
        '<h4>4 · Torque on the platform</h4><p class="st">The string pulls at the spindle’s radius:</p>' + TEX`\tau = rT` + TEX`\tau = (${M.iv('r')})(${M.n(d.T)})` + TEXA`\tau = ${M.n(d.tau, 'N·m')}` +
        '<h4>5 · Rotational inertia: τ = Iα</h4>' + TEX`I = \frac{\tau}{\alpha}` + TEX`I = \frac{${M.n(d.tau)}}{${M.n(d.al)}}` + TEXA`I = ${M.n(d.Imeas, 'kg·m²')}` +
        '<p class="note">All in one line: I = m(g − a)r²/a. Use T, not mg: the falling mass is accelerating.</p>' +
        '<h4>6 · Compare with the true value</h4><p class="st">' + (d.ring ? 'The platform plus a 0.6 kg ring at radius 0.12 m:' : 'The platform alone (rotational inertia from its mass and size):') + '</p>' + I5 +
        '<p class="st">This ideal drop has no friction or timing error, so they match. Press <b>Record</b> to log runs with a realistic ±2% stopwatch error: the I you measure scatters around the true value.</p>' +
        '<p class="note">Lab: vary m and graph 1/a against 1/m. The slope is I/(g r²), so I = slope·g·r².</p>';
    }
    const hoop = opt.shape === 'hoop', IR = hoop ? 'M' : '½M', IRm = hoop ? '<mi>M</mi>' : '<mfrac><mn>1</mn><mn>2</mn></mfrac><mi>M</mi>';
    let h = '<h4>1 · The pulley: τ = Iα, with the string not slipping (a = Rα)</h4>' + (hoop ? TEX`I = MR^2` : TEX`I = \tfrac{1}{2}MR^2`) + TEXA`I = ${M.n(d.I, 'kg·m²')}`;
    if (mode === 'spool'){
      h += '<p class="st">Torque from the string: TR = Iα = I(a/R), so</p>' + TEX`T = \frac{I}{R^2}\,a` + TEX`T = ${IRm}\,a` +
        '<h4>2 · The hanging mass (down = +)</h4>' + TEX`mg - T = ma` + TEX`mg - ${IRm}\,a = ma` + TEX`a = \frac{mg}{m + ${IRm}}` +
        TEX`a = \frac{(${M.iv('m')})(10\,\text{m/s}^2)}{${M.iv('m')} + ${M.n(d.Ieff)}}` + TEXA`a = ${M.n(d.a, 'm/s²')}` +
        '<p class="st">Tension (less than mg = ' + H.n(v.m * G10, 'N') + '):</p>' + TEX`T = m(g - a)` + TEXA`T = ${M.n(d.T1, 'N')}` +
        '<p class="st">Angular acceleration of the pulley:</p>' + TEX`\alpha = \frac{a}{R}` + TEX`\alpha = \frac{${M.n(d.a)}}{${M.iv('R')}}` + TEXA`\alpha = ${M.n(d.al, 'rad/s²')}` +
        '<p class="note">R cancels out of a (I/R² = ' + IR + '), but not out of α. A massless pulley (M = 0) gives free fall: a = g.</p>';
      return h;
    }
    const at = mode === 'atwood';
    h += '<p class="st">The two sides pull with <b>different</b> tensions; their difference turns the pulley:</p>' + (at ? TEX`(T_1 - T_2)R = I\alpha` + TEX`T_1 - T_2 = ${IRm}\,a` : TEX`(T_2 - T_1)R = I\alpha` + TEX`T_2 - T_1 = ${IRm}\,a`) +
      '<h4>2 · Newton’s 2nd law for each mass</h4>' +
      (at ? '<p class="st">Left (down +):</p>' + TEX`m_1 g - T_1 = m_1 a` + '<p class="st">Right (up +):</p>' + TEX`T_2 - m_2 g = m_2 a`
        : '<p class="st">Block:</p>' + TEX`T_1 = m_1 a` + '<p class="st">Hanging (down +):</p>' + TEX`m_2 g - T_2 = m_2 a`) +
      '<h4>3 · Add all three equations: the tensions cancel</h4>' +
      (at ? TEX`a = \frac{(m_1 - m_2)g}{m_1 + m_2 + ${IRm}}` + TEX`a = \frac{(${M.iv('m1')} - ${M.iv('m2')})(10\,\text{m/s}^2)}{${M.iv('m1')} + ${M.iv('m2')} + ${M.n(d.Ieff)}}`
        : TEX`a = \frac{m_2 g}{m_1 + m_2 + ${IRm}}` + TEX`a = \frac{(${M.iv('m2')})(10\,\text{m/s}^2)}{${M.iv('m1')} + ${M.iv('m2')} + ${M.n(d.Ieff)}}`) +
      TEXA`a = ${M.n(d.a, 'm/s²')}` + '<p class="st">(vs ' + H.n(d.a0, 'm/s²') + ' with a massless pulley)</p>' +
      TEXA`T_1 = ${M.n(d.T1, 'N')}` + TEXA`T_2 = ${M.n(d.T2, 'N')}` +
      '<p class="st">Check: the difference in tensions equals ' + IR + '·a ✓</p>' + TEX`\left|T_1 - T_2\right| = ${M.n(Math.abs(d.T1 - d.T2), 'N')}` +
      '<p class="note">The pulley acts like an extra mass ' + IR + ' = ' + H.n(d.Ieff, 'kg') + ' that has to be accelerated, but it isn’t pulled by gravity in the direction of motion.</p>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'platform') return platDraw(v, d, opt, dt, A);
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt; const tt = A.t % 3, s = Math.min(0.5 * d.a * tt * tt * 25, 110), ang = s / 25 / v.R * 0.25;
    const pulley = (cx, cy, Rp) => { ctx.fillStyle = opt.shape === 'hoop' ? '#fff' : '#9aa7b8'; ctx.strokeStyle = '#111'; ctx.lineWidth = opt.shape === 'hoop' ? 6 : 1.5; ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, 7); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Rp * Math.cos(ang), cy + Rp * Math.sin(ang)); ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill(); };
    const box = (x, y, m, lab, col) => { const b = 18 + 12 * Math.sqrt(m); ctx.fillStyle = col; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(x - b / 2, y, b, b); ctx.strokeRect(x - b / 2, y, b, b); text(lab, x, y + b / 2 + 4, { align: 'center', font: '700 10px "Space Grotesk",sans-serif', col: '#fff' }); return b; };
    const Rp = 20 + v.R * 80, fs = 50 / G10;
    ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 2;
    if (mode === 'spool'){
      panelTitle('MASS HANGING FROM A SPOOL', 10, 18);
      const cx = 190, cy = 80; ctx.fillStyle = '#111'; ctx.fillRect(cx - 4, 28, 8, cy - 28);
      const y = 140 + s; ctx.beginPath(); ctx.moveTo(cx + Rp, cy); ctx.lineTo(cx + Rp, y); ctx.stroke(); pulley(cx, cy, Rp);
      const b = box(cx + Rp, y, v.m, 'm', '#ff6a2b');
      arrow(cx + Rp + b / 2 + 10, y + b / 2, cx + Rp + b / 2 + 10, y + b / 2 - d.T1 * fs / Math.max(v.m, 0.3), COL.T, 'T', { lx: 5, ly: 0 });
      arrow(cx + Rp + b / 2 + 26, y + b / 2, cx + Rp + b / 2 + 26, y + b / 2 + v.m * G10 * fs / Math.max(v.m, 0.3), COL.W, 'mg', { lx: 5, ly: 0 });
    } else if (mode === 'atwood'){
      panelTitle('ATWOOD MACHINE WITH A MASSIVE PULLEY', 10, 18);
      const cx = 190, cy = 70; ctx.fillStyle = '#111'; ctx.fillRect(cx - 4, 26, 8, cy - 26);
      const dir = Math.sign(d.a), y1 = 160 + dir * s * 0.6, y2 = 160 - dir * s * 0.6;
      ctx.beginPath(); ctx.moveTo(cx - Rp, cy); ctx.lineTo(cx - Rp, y1); ctx.moveTo(cx + Rp, cy); ctx.lineTo(cx + Rp, y2); ctx.stroke(); pulley(cx, cy, Rp);
      box(cx - Rp, y1, v.m1, 'm1', '#ff6a2b'); box(cx + Rp, y2, v.m2, 'm2', '#1546d6');
      text('T1 = ' + fplain(d.T1) + ' N', cx - Rp - 12, cy + 120, { align: 'right', font: '700 11px "IBM Plex Mono",monospace', col: COL.T });
      text('T2 = ' + fplain(d.T2) + ' N', cx + Rp + 12, cy + 120, { font: '700 11px "IBM Plex Mono",monospace', col: COL.T });
    } else {
      panelTitle('TABLE + HANGING MASS, MASSIVE PULLEY', 10, 18);
      const ty = 110, edge = 270, cx = edge + 6, cy = ty - 13 + Rp; ctx.fillStyle = '#e6dccb'; ctx.fillRect(20, ty, edge - 20, 12); ctx.fillRect(edge - 20, ty + 12, 10, 170);
      const bx = 80 + s; ctx.fillStyle = '#ff6a2b'; const bw = 30 + v.m1 * 8; ctx.fillRect(bx, ty - 26, bw, 26); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(bx, ty - 26, bw, 26); text('m1', bx + bw / 2, ty - 9, { align: 'center', font: '700 10px "Space Grotesk",sans-serif', col: '#fff' });
      ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + bw, ty - 13); ctx.lineTo(cx, ty - 13); ctx.moveTo(cx + Rp, cy); ctx.lineTo(cx + Rp, cy + 60 + s); ctx.stroke();
      pulley(cx, cy, Rp); box(cx + Rp, cy + 60 + s, v.m2, 'm2', '#1546d6');
      text('T1 = ' + fplain(d.T1) + ' N', 90, ty - 40, { font: '700 11px "IBM Plex Mono",monospace', col: COL.T });
      text('T2 = ' + fplain(d.T2) + ' N', cx + Rp + 30, 140, { font: '700 11px "IBM Plex Mono",monospace', col: COL.T });
    }
    text('a = ' + fplain(d.a) + ' m/s²   (massless pulley: ' + fplain(d.a0) + ')', 12, 300, { font: '700 13px "Space Grotesk",sans-serif' });
    text('α = ' + fplain(d.al) + ' rad/s²   I = ' + fplain(d.I) + ' kg·m²', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    panelTitle('MASSIVE vs MASSLESS PULLEY', 395, 18);
    const mx = Math.max(d.a0, 0.01), bar = (y, val, col, lab) => { const w = 85 * Math.abs(val) / mx; ctx.fillStyle = col; ctx.fillRect(470, y, w, 14); text(lab, 465, y + 11, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(val), 474 + w, y + 11, { font: '600 10px "IBM Plex Mono",monospace' }); };
    bar(45, d.a0, '#bbb', 'a, massless'); bar(70, d.a, '#ff6a2b', 'a, this one');
    if (mode !== 'spool'){ const tm = Math.max(d.T1, d.T2, 1); panelTitle('TENSIONS (N)', 395, 120); [[d.T1, 'T1'], [d.T2, 'T2']].forEach(([T, l], i) => { const w = 85 * T / tm; ctx.fillStyle = COL.T; ctx.fillRect(470, 135 + i * 25, w, 14); text(l, 465, 146 + i * 25, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(T), 474 + w, 146 + i * 25, { font: '600 10px "IBM Plex Mono",monospace' }); });
      text(Math.abs(d.T1 - d.T2) < 0.01 ? 'equal tensions (massless pulley)' : 'unequal: the difference spins the pulley', 395, 200, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
  }
};
