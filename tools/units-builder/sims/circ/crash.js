// Crash Test: impulse, change in momentum, average force, and collision time.
const DT_WALL = 0.02;
// Same-impulse mode: triangular force pulses (peak = 2 x average) so the areas match; v(t) is the running impulse.
function drawFt(v, d, dt, A){
  if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
  const Ds = v.dt, Tmax = Math.max(Ds, DT_WALL) * 1.2, tc = Math.min((A.t % 4) / 3, 1) * Tmax;
  const J = Math.abs(d.J), Fh = Math.abs(d.Fw), Fs = Math.abs(d.F), BL = '#1546d6', OR = '#ff6a2b', ORD = '#c43a00';
  const gx0 = 48, gw = 332, vt = 26, vb = 112, ft = 146, fb = 290, Fmax = 2 * Fh * 1.1;
  const X = q => gx0 + gw * q / Tmax, YV = s => vb - (vb - vt) * s / v.v0, YF = f => fb - (fb - ft) * f / Fmax;
  const cum = (q, D) => q <= 0 ? 0 : q >= D ? 1 : q < D / 2 ? 2 * (q / D) * (q / D) : 1 - 2 * ((D - q) / D) * ((D - q) / D);
  const fF = (q, D) => (q < 0 || q > D) ? 0 : 2 * J / D * (q < D / 2 ? 2 * q / D : 2 * (D - q) / D);
  const path = (fn, Y, tEnd, close) => { const N = 400; ctx.beginPath(); if (close) ctx.moveTo(X(0), Y(0 * 0 + (close === 'v' ? 0 : 0))); for (let i = 0; i <= N; i++){ const q = tEnd * i / N; (i === 0 && !close) ? ctx.moveTo(X(q), Y(fn(q))) : ctx.lineTo(X(q), Y(fn(q))); } };
  const axes = (y0, y1, lab0, lab1, ttl) => { panelTitle(ttl, 10, y0 - 10); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx0, y0); ctx.lineTo(gx0, y1); ctx.lineTo(gx0 + gw, y1); ctx.stroke();
    text(lab1, gx0 - 4, y0 + 8, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('0', gx0 - 4, y1, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); };
  axes(vt, vb, '0', fplain(v.v0), 'SPEED (m/s) vs TIME');
  [[DT_WALL, BL], [Ds, OR]].forEach(([D, c]) => { ctx.strokeStyle = c; ctx.lineWidth = 2.5; path(q => v.v0 * (1 - cum(q, D)), q => YV(q), Tmax, false); ctx.stroke(); });
  axes(ft, fb, '0', fplain(Fmax), 'FORCE vs TIME (both cars, same axes)');
  [[DT_WALL, BL, 'rgba(21,70,214,'], [Ds, OR, 'rgba(255,106,43,']].forEach(([D, c, rg]) => {
    ctx.beginPath(); ctx.moveTo(X(0), fb); for (let i = 0; i <= 200; i++){ const q = Math.min(D, tc) * i / 200; ctx.lineTo(X(q), YF(fF(q, D))); } ctx.lineTo(X(Math.min(D, tc)), fb); ctx.closePath(); ctx.fillStyle = rg + '0.45)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(X(0), fb); ctx.lineTo(X(D / 2), YF(2 * J / D)); ctx.lineTo(X(D), fb); ctx.closePath(); ctx.fillStyle = rg + '0.14)'; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.stroke(); });
  text('t (s)', gx0 + gw, fb + 13, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('0', gx0, fb + 13, { align: 'center', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(Tmax), gx0 + gw - 34, fb + 13, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  text('wall peak ' + fplain(2 * Fh) + ' N', X(DT_WALL / 2) + 8, ft + 11, { font: '600 10px "IBM Plex Mono",monospace', col: BL });
  text('airbag peak ' + fplain(2 * Fs) + ' N', Math.min(X(Ds / 2) + 4, gx0 + gw - 112), YF(2 * Fs) - 5, { font: '600 10px "IBM Plex Mono",monospace', col: ORD });
  text('both shaded areas = J = ' + fplain(J) + ' N·s', gx0 + gw - 4, ft + 28, { align: 'right', font: '600 10px "IBM Plex Mono",monospace' });
  // time cursor + dots
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(tc), vt); ctx.lineTo(X(tc), fb); ctx.stroke(); ctx.setLineDash([]);
  [[DT_WALL, BL], [Ds, OR]].forEach(([D, c]) => { ctx.fillStyle = c; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(tc), YV(v.v0 * (1 - cum(tc, D))), 4.5, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(X(tc), YF(fF(tc, D)), 4.5, 0, 7); ctx.fill(); ctx.stroke(); });
  text('cursor replays the crash in slow motion', 12, 322, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  // readouts
  panelTitle('SAME J, DIFFERENT F', 395, 18);
  text('J = Δp = ' + fplain(J) + ' N·s', 395, 40, { font: '700 12px "IBM Plex Mono",monospace' }); text('(same for both cars)', 395, 54, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  const blk = (y, col, name, D, F, g) => { ctx.fillStyle = col; ctx.fillRect(395, y, 5, 52); text(name, 408, y + 11, { font: '700 11px "IBM Plex Mono",monospace', col }); text('Δt = ' + fplain(D) + ' s', 408, y + 26, { font: '600 11px "IBM Plex Mono",monospace' }); text('F_avg = ' + fplain(F) + ' N', 408, y + 40, { font: '600 11px "IBM Plex Mono",monospace' }); text(fplain(g) + ' g', 590, y + 11, { align: 'right', font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' }); };
  blk(72, BL, 'RIGID WALL', DT_WALL, Fh, d.gw); blk(136, OR, 'AIRBAG / CRUMPLE', Ds, Fs, d.gs);
  text('F_wall / F_airbag = ' + fplain(d.ratio), 395, 218, { font: '700 12px "IBM Plex Mono",monospace' });
  text('= Δt_airbag / Δt_wall', 395, 233, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  text('Longer stop, same area:', 395, 262, { font: '600 11px "Space Grotesk",sans-serif' }); text('lower force, fewer g’s.', 395, 277, { font: '600 11px "Space Grotesk",sans-serif' });
}
const SIM = {
  title: 'Crash Test',
  modes: [{ id: 'stop', label: 'Car stops dead' }, { id: 'bounce', label: 'Car bounces back' }, { id: 'ft', label: 'Same impulse, different force' }],
  ivs(mode){ const l = [
    { id: 'm', sym: 'm', symText: 'm', label: 'Car mass', unit: 'kg', min: 500, max: 2500, step: 50, val: 1200 },
    { id: 'v0', sym: 'v<sub>i</sub>', symText: 'vi', label: 'Speed before', unit: 'm/s', min: 5, max: 30, step: 0.5, val: 15 },
    { id: 'dt', sym: 'Δt', symText: 'Δt', label: mode === 'ft' ? 'Airbag stopping time' : 'Collision time', unit: 's', min: mode === 'ft' ? 0.04 : 0.01, max: 0.5, step: 0.005, val: 0.1, graph: true }];
    if (mode === 'bounce') l.push({ id: 'e', sym: 'v<sub>f</sub>/v<sub>i</sub>', symText: 'bounce', label: 'Bounce-back speed fraction', unit: '', min: 0.05, max: 0.8, step: 0.05, val: 0.3, show: v => v.toFixed(2) });
    return l; },
  presets: [{ label: 'Rigid steel wall (0.02 s)', v: { dt: 0.02 } }, { label: 'Crumple zone (0.12 s)', v: { dt: 0.12 } }, { label: 'Water barrels (0.30 s)', v: { dt: 0.3 } }],
  calc(v, mode){
    const vf = mode === 'bounce' ? -v.e * v.v0 : 0, dv = vf - v.v0, dp = v.m * dv, F = dp / v.dt, a = dv / v.dt;
    return { vf, dv, dp, J: dp, F, Fpk: 2 * F, a, gs: Math.abs(a) / G10, Fp: 70 * Math.abs(a), Ki: 0.5 * v.m * v.v0 * v.v0, Kf: 0.5 * v.m * vf * vf, Fw: dp / DT_WALL, ratio: v.dt / DT_WALL, gw: Math.abs(dv / DT_WALL) / G10 };
  },
  dvs(mode){ if (mode === 'ft') return [
    { id: 'F', name: 'Average force, airbag car (size)', short: '|F_airbag|', sym: '|F<sub>airbag</sub>|', unit: 'N', f: d => Math.abs(d.F), vs: 'Fw' },
    { id: 'Fw', name: 'Average force, rigid-wall car (size)', short: '|F_wall|', sym: '|F<sub>wall</sub>|', unit: 'N', f: d => Math.abs(d.Fw) },
    { id: 'J', name: 'Impulse = Δp (same for both)', short: '|J|', sym: '|J|', unit: 'N·s', f: d => Math.abs(d.J) },
    { id: 'ratio', name: 'Force ratio, wall ÷ airbag', short: 'ratio', sym: 'F<sub>wall</sub>/F<sub>airbag</sub>', unit: '', f: d => d.ratio }];
    return [
    { id: 'F', name: 'Average force on car (size)', short: '|F_avg|', sym: '|F<sub>avg</sub>|', unit: 'N', f: d => Math.abs(d.F) },
    { id: 'J', name: 'Impulse = Δp (size)', short: '|J|', sym: '|J|', unit: 'N·s', f: d => Math.abs(d.J) },
    { id: 'gs', name: 'Passenger g-force', short: 'g’s', sym: 'g’s', unit: 'g', f: d => d.gs },
    { id: 'Fp', name: 'Force on a 70 kg passenger', short: 'F_passenger', sym: 'F<sub>passenger</sub>', unit: 'N', f: d => d.Fp }]; },
  work(v, d, mode){
    if (mode === 'ft') return '<h4>1 · Same car, same speed, same stop: same impulse</h4><p class="st">Both cars go from ' + H.n(v.v0, 'm/s') + ' to rest, so the change in momentum is the same (+ is toward the wall):</p>' +
      TEX`J = \Delta p = m\,(v_f - v_i)` + TEX`J = (${M.iv('m')})(0 - ${M.iv('v0')})` + TEXA`J = \Delta p = ${M.n(d.dp, 'N·s')}` +
      '<h4>2 · Rigid wall (short Δt)</h4>' + TEX`F_{\text{wall}} = \frac{J}{\Delta t}` + TEX`F_{\text{wall}} = \frac{${M.n(d.dp)}}{${M.n(DT_WALL, 's')}}` + TEXA`F_{\text{wall}} = ${M.n(d.Fw, 'N')}` +
      '<h4>3 · Airbag / crumple zone (long Δt)</h4>' + TEX`F_{\text{airbag}} = \frac{J}{\Delta t}` + TEX`F_{\text{airbag}} = \frac{${M.n(d.dp)}}{${M.iv('dt')}}` + TEXA`F_{\text{airbag}} = ${M.n(d.F, 'N')}` +
      '<h4>4 · Compare</h4>' + TEX`\frac{F_{\text{wall}}}{F_{\text{airbag}}} = \frac{\Delta t_{\text{airbag}}}{\Delta t_{\text{wall}}}` + TEX`\frac{F_{\text{wall}}}{F_{\text{airbag}}} = \frac{${M.iv('dt')}}{${M.n(DT_WALL, 's')}}` + TEXA`\frac{F_{\text{wall}}}{F_{\text{airbag}}} = ${M.n(d.ratio)}` +
      '<p class="note">Negative means the wall pushes the car backward. The two F–t curves enclose the same area (J), so the one that is ' + H.n(d.ratio) + ' times wider is ' + H.n(d.ratio) + ' times lower.</p>' +
      '<h4>5 · What a passenger feels</h4>' + TEX`\frac{|a|}{g} = \frac{|\Delta v|}{g\,\Delta t}` + TEX`\text{wall: } \frac{${M.n(v.v0)}}{(10)(${M.n(DT_WALL)})}` + TEXA`\text{wall} = ${M.n(d.gw)}\ g` +
      TEX`\text{airbag: } \frac{${M.n(v.v0)}}{(10)(${M.iv('dt')})}` + TEXA`\text{airbag} = ${M.n(d.gs)}\ g`;
    return '<h4>1 · Change in momentum (+ is toward the wall)</h4>' + TEX`\Delta p = m\,(v_f - v_i)` +
      TEX`\Delta p = (${M.iv('m')})(${M.n(d.vf, 'm/s')} - ${M.p(v.v0, 'm/s')})` + TEXA`\Delta p = ${M.n(d.dp, 'kg·m/s')}` +
      (mode === 'bounce' ? '<p class="note">Bouncing back makes Δv bigger (' + H.n(d.dv, 'm/s') + ' instead of ' + H.n(-v.v0, 'm/s') + '), so the impulse is bigger.</p>' : '') +
      '<h4>2 · Impulse–momentum theorem</h4><p class="st">The impulse equals the change in momentum:</p>' + TEX`J = F_{\text{avg}}\,\Delta t = \Delta p` +
      TEX`F_{\text{avg}} = \frac{\Delta p}{\Delta t}` + TEX`F_{\text{avg}} = \frac{${M.n(d.dp)}}{${M.iv('dt')}}` + TEXA`F_{\text{avg}} = ${M.n(d.F, 'N')}` +
      '<p class="note">Negative means the wall pushes the car backward. Same Δp, longer Δt → smaller force: that is the whole point of a crumple zone.</p>' +
      '<h4>3 · What a 70 kg passenger feels</h4>' + TEX`a = \frac{\Delta v}{\Delta t}` + TEX`a = \frac{${M.n(d.dv, 'm/s')}}{${M.iv('dt')}}` + TEX`a = ${M.n(d.a, 'm/s²')}` +
      TEX`\frac{|a|}{g} = \frac{${M.n(Math.abs(d.a))}}{10}` + TEXA`\text{g-force} = ${M.n(d.gs)}\ g` +
      TEX`F = m_{\text{p}}\,|a| = (70\,\text{kg})(${M.n(Math.abs(d.a))})` + TEXA`F = ${M.n(d.Fp, 'N')}` +
      '<h4>4 · Force–time graph</h4><p class="st">The area under F vs t is the impulse. A triangle-shaped hit with the same area peaks at twice the average force:</p>' +
      TEX`F_{\text{peak}} = 2F_{\text{avg}} = 2\left(${M.n(Math.abs(d.F))}\right)` + TEXA`F_{\text{peak}} = ${M.n(Math.abs(d.Fpk), 'N')}` +
      '<h4>5 · Energy</h4>' + TEX`K = \tfrac{1}{2}mv^2` + TEX`K_i = \tfrac{1}{2}(${M.iv('m')})(${M.iv('v0')})^2` + TEXA`K_i = ${M.n(d.Ki, 'J')}` +
      TEX`K_f = \tfrac{1}{2}(${M.iv('m')})(${M.p(d.vf)})^2` + TEXA`K_f = ${M.n(d.Kf, 'J')}` +
      '<p class="st">Momentum of car + Earth is conserved; kinetic energy is not.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'ft') return drawFt(v, d, dt, A);
    panelTitle('CRASH', 10, 18);
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt; const cyc = 3; const tt = A.t % cyc, tHit = 1.2, slow = 6; // collision shown in slow motion
    const wallX = 320, gy = 210, carW = 70 + v.m * 0.012, X0 = 30;
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(0, gy, 360, 120); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(360, gy); ctx.stroke();
    ctx.fillStyle = v.dt < 0.05 ? '#555' : v.dt > 0.2 ? '#4aa3df' : '#999'; ctx.fillRect(wallX, gy - 90, 22, 90); ctx.strokeRect(wallX, gy - 90, 22, 90);
    let x, squash = 0;
    if (tt < tHit){ x = wallX - carW - (tHit - tt) * 160; }
    else { const tc = (tt - tHit) / slow; if (tc < v.dt){ const f = tc / v.dt; squash = Math.sin(f * PI) * Math.min(30, 4 + 100 * v.dt); x = wallX - carW + squash * (mode === 'bounce' ? 1 : 0); } else { x = wallX - carW - (tt - tHit - v.dt * slow) * 160 * (mode === 'bounce' ? v.e : 0); } }
    ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(x, gy - 34, carW - squash * 0.3, 26); ctx.strokeRect(x, gy - 34, carW - squash * 0.3, 26);
    ctx.fillRect(x + 12, gy - 50, carW * 0.5, 16); ctx.strokeRect(x + 12, gy - 50, carW * 0.5, 16);
    ctx.fillStyle = '#111'; [x + 14, x + carW - 18].forEach(xx => { ctx.beginPath(); ctx.arc(xx, gy - 6, 7, 0, 7); ctx.fill(); });
    text('Δt = ' + fplain(v.dt) + ' s (collision shown in slow motion)', 12, 318, { font: '500 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // F–t graph: triangle pulse with the same impulse, plus the stiff-wall pulse for comparison
    panelTitle('FORCE ON CAR vs TIME', 380, 18);
    const gx0 = 395, gy0 = 290, gw = 190, gh = 230, Tmax = 0.5, Fmax = Math.abs(v.m * 30 * 1.8 / 0.01) * 2;
    const ref = Math.abs(2 * d.dp / 0.02), scaleF = Math.max(Math.abs(d.Fpk), ref) * 1.05;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx0, gy0 - gh); ctx.lineTo(gx0, gy0); ctx.lineTo(gx0 + gw, gy0); ctx.stroke();
    const P = (tq, F) => [gx0 + gw * tq / Tmax, gy0 - gh * F / scaleF];
    const tri = (Dt, Fp, fill, stroke) => { ctx.beginPath(); ctx.moveTo(...P(0, 0)); ctx.lineTo(...P(Dt / 2, Fp)); ctx.lineTo(...P(Dt, 0)); ctx.closePath(); if (fill){ ctx.fillStyle = fill; ctx.fill(); } ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); };
    if (Math.abs(v.dt - 0.02) > 0.004){ ctx.setLineDash([4, 3]); tri(0.02, ref, null, '#8a8a8a'); ctx.setLineDash([]); text('steel wall', P(0.02, ref)[0] + 4, P(0.02, ref)[1] + 10, { font: '600 10px "Space Grotesk",sans-serif', col: '#8a8a8a' }); }
    tri(v.dt, Math.abs(d.Fpk), 'rgba(196,58,0,0.25)', '#c43a00');
    text('area = |J| = ' + fplain(Math.abs(d.J)) + ' N·s', gx0 + 8, gy0 - gh + 10, { font: '600 11px "IBM Plex Mono",monospace' });
    text('peak ' + fplain(Math.abs(d.Fpk)) + ' N', P(v.dt / 2, Math.abs(d.Fpk))[0] + 6, Math.max(gy0 - gh + 28, P(v.dt / 2, Math.abs(d.Fpk))[1]), { font: '600 10px "IBM Plex Mono",monospace', col: '#c43a00' });
    text('t (s) → 0.5', gx0 + gw, gy0 + 14, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
