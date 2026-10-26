// SHM & the Circle: SHM is the shadow of uniform circular motion. x(t), v(t), a(t), the a–x graph (a = −ω²x) and where the motion starts.
const STARTS = { pA: ['+A', 0], zp: ['0, moving +', -PI / 2], mA: ['−A', PI], zm: ['0, moving −', PI / 2] };
const SIM = {
  title: 'SHM & the Circle',
  opts: [{ id: 'start', label: 'At t = 0 it’s at', choices: Object.entries(STARTS).map(([k, s]) => [k, s[0]]) }],
  ivs(){ return [
    { id: 'A', sym: 'A', symText: 'A', label: 'Amplitude', unit: 'cm', min: 1, max: 10, step: 0.5, val: 6 },
    { id: 'f', sym: 'f', symText: 'f', label: 'Frequency', unit: 'Hz', min: 0.1, max: 2, step: 0.05, val: 0.5, graph: true },
    { id: 't', sym: 't', symText: 't', label: 'Pick a time to read off', unit: 's', min: 0, max: 4, step: 0.05, val: 0.5 }]; },
  calc(){ return {}; },   // replaced below
  dvs(){ return [
    { id: 'x', name: 'Position at the chosen time', short: 'x', sym: 'x', unit: 'cm', f: d => d.x },
    { id: 'vv', name: 'Velocity at the chosen time', short: 'v', sym: 'v', unit: 'cm/s', f: d => d.vv },
    { id: 'a', name: 'Acceleration at the chosen time', short: 'a', sym: 'a', unit: 'cm/s²', f: d => d.a },
    { id: 'vmax', name: 'Maximum speed Aω', short: 'v_max', sym: 'v<sub>max</sub>', unit: 'cm/s', f: d => d.vmax }]; },
  work(v, d, mode, opt){
    const s = STARTS[opt.start || 'pA'];
    return '<h4>1 · Period, frequency, angular frequency</h4><div class="eq">T = 1/f = ' + H.n(d.T, 's') + ' &nbsp; ω = 2πf = 2π(' + H.iv('f') + ') = ' + H.n(d.w, 'rad/s') + '</div>' +
      '<h4>2 · Position: the shadow of a point going around a circle of radius A</h4><div class="eq">Starting at ' + s[0] + ': <b>x = ' + d.form + '</b></div>' +
      '<div class="eq">At t = ' + H.iv('t') + ': x = <b>' + H.n(d.x, 'cm') + '</b></div>' +
      '<h4>3 · Velocity and acceleration</h4><div class="eq">v = ' + H.n(d.vv, 'cm/s') + ' (max Aω = ' + H.n(d.vmax, 'cm/s') + ' at x = 0)</div>' +
      '<div class="eq"><b>a = −ω²x</b> = −(' + H.n(d.w) + ')²(' + H.n(d.x) + ') = <b>' + H.n(d.a, 'cm/s²') + '</b> (max Aω² = ' + H.n(d.amax, 'cm/s²') + ' at the ends)</div>' +
      '<p class="note">a = −ω²x is the definition of SHM: acceleration proportional to displacement and pointing the other way. Its graph (bottom right) is a straight line with slope −ω².</p>' +
      '<h4>4 · IB HL: speed at any position</h4><div class="eq">v = ±ω√(A² − x²) = ±(' + H.n(d.w) + ')√(' + H.n(v.A) + '² − ' + H.n(d.x) + '²) = ±' + H.n(Math.abs(d.vv), 'cm/s') + ' ✓</div>' +
      '<p class="note">Reading graphs: v is biggest where the x–t graph is steepest; a has the opposite sign of x. Velocity leads position by a quarter cycle.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const tt = A.t, ph = d.phi, w = d.w, ang = w * tt + ph, R = 90 * v.A / 10;
    panelTitle('REFERENCE CIRCLE AND ITS SHADOW', 10, 18);
    const cx = 190, cy = 120;
    ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    const px = cx + R * Math.cos(ang), py = cy - R * Math.sin(ang);
    ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke(); ctx.fillStyle = '#7a3fb0'; ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.fill();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#888'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, 250); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - 100, 250); ctx.lineTo(cx + 100, 250); ctx.stroke();
    [-1, 0, 1].forEach(s => { ctx.fillRect(cx + s * R - 0.5, 245, 1, 10); text(s ? (s > 0 ? '+A' : '−A') : '0', cx + s * R, 268, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); });
    ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(px, 250, 8, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.stroke();
    const xn = v.A * Math.cos(ang), vn = -v.A * w * Math.sin(ang), an = -w * w * xn;
    if (Math.abs(vn) > 0.05) arrow(px, 232, px + vn / d.vmax * 50, 232, COL.V, 'v', { w: 2.5, head: 6, lx: 0, ly: -8, align: 'center' });
    if (Math.abs(an) > 0.05) arrow(px, 285, px + an / d.amax * 50, 285, '#c43a00', 'a', { w: 2.5, head: 6, lx: 0, ly: 12, align: 'center' });
    text('ω = ' + fplain(w) + ' rad/s', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // graphs: x, v, a vs t (2 s window starting at 0) and a vs x
    const Tw = Math.max(2 * d.T, v.t * 1.05), gx = 420, gw = 165;
    const fx = q => v.A * Math.cos(w * q + ph), fv = q => -v.A * w * Math.sin(w * q + ph), fa = q => -w * w * v.A * Math.cos(w * q + ph);
    [['x', fx, v.A, '#ff6a2b'], ['v', fv, d.vmax, COL.V], ['a', fa, d.amax, '#c43a00']].forEach(([lab, f, mx, col], i) => { const cyy = 42 + i * 70, hh = 26, X = q => gx + gw * q / Tw, Y = q => cyy - hh * q / mx;
      ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, cyy); ctx.lineTo(gx + gw, cyy); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k <= 120; k++){ const q = Tw * k / 120; k ? ctx.lineTo(X(q), Y(f(q))) : ctx.moveTo(X(q), Y(f(q))); } ctx.stroke();
      ctx.strokeStyle = '#111'; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(X(v.t), cyy - hh - 4); ctx.lineTo(X(v.t), cyy + hh + 4); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(v.t), Y(f(v.t)), 3.5, 0, 7); ctx.fill();
      text(lab, gx - 6, cyy + 4, { align: 'right', font: '700 11px "IBM Plex Mono",monospace', col }); });
    text('t → ' + fplain(Tw) + ' s', gx + gw, 225, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    panelTitle('a vs x (slope −ω²)', 395, 245);
    const ax0 = 490, ay0 = 288, aw = 60, ah = 28; ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax0 - aw, ay0); ctx.lineTo(ax0 + aw, ay0); ctx.moveTo(ax0, ay0 - ah); ctx.lineTo(ax0, ay0 + ah); ctx.stroke();
    ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax0 - aw, ay0 - ah); ctx.lineTo(ax0 + aw, ay0 + ah); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(ax0 + aw * xn / v.A, ay0 - ah * an / d.amax, 4, 0, 7); ctx.fill();
    text('x', ax0 + aw + 4, ay0 + 4, { font: '600 10px "IBM Plex Mono",monospace' }); text('a', ax0 + 4, ay0 - ah - 2, { font: '600 10px "IBM Plex Mono",monospace' });
  }
};
// calc needs opt for the phase; the frame passes (v, mode, opt)
SIM.calc = function(v, mode, opt){
  const s = STARTS[(opt && opt.start) || 'pA'], w = 2 * PI * v.f, T = 1 / v.f, ph = s[1];
  const snap = q => Math.abs(q) < 1e-9 ? 0 : q;
  const x = snap(v.A * Math.cos(w * v.t + ph)), vv = snap(-v.A * w * Math.sin(w * v.t + ph)), a = snap(-w * w * x);
  const form = { pA: 'A cos(ωt)', zp: 'A sin(ωt)', mA: '−A cos(ωt)', zm: '−A sin(ωt)' }[(opt && opt.start) || 'pA'];
  return { w, T, phi: ph, x, vv, a, vmax: v.A * w, amax: v.A * w * w, form };
};
