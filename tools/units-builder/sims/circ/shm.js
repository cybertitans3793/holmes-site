// Mass on a Spring: T = 2π√(m/k), graphs of x, v and a, and energy. Horizontal, vertical, and the ISS "space scale".
const SIM = {
  title: 'Mass on a Spring',
  modes: [{ id: 'horiz', label: 'Horizontal' }, { id: 'vert', label: 'Vertical' }, { id: 'space', label: 'Weighing in space' }],
  ivs(mode){
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
    const M = mode === 'space' ? v.m + v.mc : v.m, w = Math.sqrt(v.k / M), T = 2 * PI / w, f = 1 / T, vmax = v.A * w, amax = v.A * w * w, E = 0.5 * v.k * v.A * v.A, x0 = mode === 'vert' ? M * G10 / v.k : 0;
    return { M, w, T, f, vmax, amax, E, x0, Fmax: v.k * v.A, mBack: v.k * T * T / (4 * PI * PI) - (mode === 'space' ? v.mc : 0) };
  },
  dvs(mode){ const l = [
    { id: 'T', name: 'Period', short: 'T', sym: 'T', unit: 's', f: d => d.T },
    { id: 'vmax', name: 'Maximum speed Aω', short: 'v_max', sym: 'v<sub>max</sub>', unit: 'm/s', f: d => d.vmax },
    { id: 'amax', name: 'Maximum acceleration Aω²', short: 'a_max', sym: 'a<sub>max</sub>', unit: 'm/s²', f: d => d.amax },
    { id: 'E', name: 'Total energy ½kA²', short: 'E', sym: 'E', unit: 'J', f: d => d.E },
    { id: 'f', name: 'Frequency', short: 'f', sym: 'f', unit: 'Hz', f: d => d.f }];
    if (mode === 'vert') l.push({ id: 'x0', name: 'Stretch at equilibrium mg/k', short: 'x_eq', sym: 'x<sub>eq</sub>', unit: 'm', f: d => d.x0 });
    return l; },
  work(v, d, mode){
    if (mode === 'space') return '<h4>1 · On the ISS a bathroom scale reads zero, but mass still resists acceleration</h4><div class="eq">NASA’s body-mass device: the astronaut rides a spring-mounted chair and the period is timed.</div>' +
      '<h4>2 · The period depends on the total mass on the spring</h4><div class="eq">T = 2π√((m + m<sub>chair</sub>)/k) = 2π√(' + H.n(d.M) + ' / ' + H.iv('k') + ') = <b>' + H.n(d.T, 's') + '</b></div>' +
      '<h4>3 · Work backward from the measured T</h4><div class="eq">m = kT²/4π² − m<sub>chair</sub> = (' + H.iv('k') + ')(' + H.n(d.T) + ')² / 4π² − ' + H.iv('mc') + ' = <b>' + H.n(d.mBack, 'kg') + '</b> ✓</div>' +
      '<p class="note">No gravity needed: the spring force alone gives a = −(k/m)x. That’s also why a vertical spring has the same period as a horizontal one.</p>';
    let h = '<h4>1 · Restoring force: F = −kx (always toward equilibrium) → a = −(k/m)x</h4><div class="eq">ω = √(k/m) = √(' + H.iv('k') + ' / ' + H.iv('m') + ') = ' + H.n(d.w, 'rad/s') + '</div>' +
      '<h4>2 · Period and frequency</h4><div class="eq">T = 2π√(m/k) = <b>' + H.n(d.T, 's') + '</b> &nbsp; f = 1/T = ' + H.n(d.f, 'Hz') + '</div>' +
      '<p class="note">Amplitude isn’t in the formula: a bigger swing goes farther but faster, in the same time. 4× the mass → 2× the period.</p>' +
      '<h4>3 · Where things are biggest</h4><div class="eq">At the ends (x = ±A): v = 0, |a| = a<sub>max</sub> = Aω² = <b>' + H.n(d.amax, 'm/s²') + '</b>, |F| = kA = ' + H.n(d.Fmax, 'N') + '</div>' +
      '<div class="eq">At equilibrium (x = 0): a = 0, speed is max: v<sub>max</sub> = Aω = <b>' + H.n(d.vmax, 'm/s') + '</b></div>' +
      '<h4>4 · Energy</h4><div class="eq">E = ½kA² = ' + H.n(d.E, 'J') + ' = ½mv<sub>max</sub>². It trades between spring energy (ends) and kinetic energy (middle).</div>';
    if (mode === 'vert') h += '<h4>5 · Vertical: gravity only moves the center</h4><div class="eq">New equilibrium where kx = mg: stretch x<sub>eq</sub> = mg/k = ' + H.n(d.x0, 'm') + '. It oscillates about that point with the same T = 2π√(m/k).</div>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
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
