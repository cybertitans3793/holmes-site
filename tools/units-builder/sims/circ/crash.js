// Crash Test: impulse, change in momentum, average force, and collision time.
const SIM = {
  title: 'Crash Test',
  modes: [{ id: 'stop', label: 'Car stops dead' }, { id: 'bounce', label: 'Car bounces back' }],
  ivs(mode){ const l = [
    { id: 'm', sym: 'm', symText: 'm', label: 'Car mass', unit: 'kg', min: 500, max: 2500, step: 50, val: 1200 },
    { id: 'v0', sym: 'v<sub>i</sub>', symText: 'vi', label: 'Speed before', unit: 'm/s', min: 5, max: 30, step: 0.5, val: 15 },
    { id: 'dt', sym: 'Δt', symText: 'Δt', label: 'Collision time', unit: 's', min: 0.01, max: 0.5, step: 0.005, val: 0.1, graph: true }];
    if (mode === 'bounce') l.push({ id: 'e', sym: 'v<sub>f</sub>/v<sub>i</sub>', symText: 'bounce', label: 'Bounce-back speed fraction', unit: '', min: 0.05, max: 0.8, step: 0.05, val: 0.3, show: v => v.toFixed(2) });
    return l; },
  presets: [{ label: 'Rigid steel wall (0.02 s)', v: { dt: 0.02 } }, { label: 'Crumple zone (0.12 s)', v: { dt: 0.12 } }, { label: 'Water barrels (0.30 s)', v: { dt: 0.3 } }],
  calc(v, mode){
    const vf = mode === 'bounce' ? -v.e * v.v0 : 0, dv = vf - v.v0, dp = v.m * dv, F = dp / v.dt, a = dv / v.dt;
    return { vf, dv, dp, J: dp, F, Fpk: 2 * F, a, gs: Math.abs(a) / G10, Fp: 70 * Math.abs(a), Ki: 0.5 * v.m * v.v0 * v.v0, Kf: 0.5 * v.m * vf * vf };
  },
  dvs(){ return [
    { id: 'F', name: 'Average force on car (size)', short: '|F_avg|', sym: '|F<sub>avg</sub>|', unit: 'N', f: d => Math.abs(d.F) },
    { id: 'J', name: 'Impulse = Δp (size)', short: '|J|', sym: '|J|', unit: 'N·s', f: d => Math.abs(d.J) },
    { id: 'gs', name: 'Passenger g-force', short: 'g’s', sym: 'g’s', unit: 'g', f: d => d.gs },
    { id: 'Fp', name: 'Force on a 70 kg passenger', short: 'F_passenger', sym: 'F<sub>passenger</sub>', unit: 'N', f: d => d.Fp }]; },
  work(v, d, mode){
    return '<h4>1 · Change in momentum (+ is toward the wall)</h4><div class="eq">Δp = m(v<sub>f</sub> − v<sub>i</sub>) = (' + H.iv('m') + ')(' + H.n(d.vf, 'm/s') + ' − ' + H.iv('v0') + ') = <b>' + H.n(d.dp, 'kg·m/s') + '</b></div>' +
      (mode === 'bounce' ? '<p class="note">Bouncing back makes Δv bigger (' + H.n(d.dv, 'm/s') + ' instead of ' + H.n(-v.v0, 'm/s') + '), so the impulse is bigger.</p>' : '') +
      '<h4>2 · Impulse–momentum theorem</h4><div class="eq">J = F<sub>avg</sub>Δt = Δp → F<sub>avg</sub> = Δp/Δt = ' + H.n(d.dp) + ' / ' + H.iv('dt') + ' = <b>' + H.n(d.F, 'N') + '</b></div>' +
      '<p class="note">Negative means the wall pushes the car backward. Same Δp, longer Δt → smaller force: that is the whole point of a crumple zone.</p>' +
      '<h4>3 · What a 70 kg passenger feels</h4><div class="eq">a = Δv/Δt = ' + H.n(d.dv, 'm/s') + ' / ' + H.iv('dt') + ' = ' + H.n(d.a, 'm/s²') + ' → <b>' + H.n(d.gs) + ' g’s</b>, force ' + H.n(d.Fp, 'N') + '</div>' +
      '<h4>4 · Force–time graph</h4><div class="eq">The area under F vs t is the impulse. A triangle-shaped hit with the same area peaks at 2F<sub>avg</sub> = ' + H.n(Math.abs(d.Fpk), 'N') + '.</div>' +
      '<h4>5 · Energy</h4><div class="eq">K before = ' + H.n(d.Ki, 'J') + ', K after = ' + H.n(d.Kf, 'J') + '. Momentum of car + Earth is conserved; kinetic energy is not.</div>';
  },
  draw(v, d, mode, opt, t, dt, A){
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
