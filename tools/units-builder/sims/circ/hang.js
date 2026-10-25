// Spring + Gravity: a mass on a vertical spring, lowered gently or dropped.
const SIM = {
  title: 'Spring + Gravity',
  modes: [{ id: 'drop', label: 'Dropped from unstretched' }, { id: 'gentle', label: 'Lowered gently' }],
  ivs(mode){ const l = [
    { id: 'm', sym: 'm', symText: 'm', label: 'Hanging mass', unit: 'kg', min: 0.1, max: 2, step: 0.05, val: 0.5, graph: true },
    { id: 'k', sym: 'k', symText: 'k', label: 'Spring constant', unit: 'N/m', min: 10, max: 200, step: 1, val: 50 }];
    if (mode === 'drop') l.push({ id: 'y', sym: 'y', symText: 'y', label: 'Stretch at point B', unit: 'm', min: 0, max: 1, step: 0.005, val: 0.1 });
    return l; },
  calc(v, mode){
    const W = v.m * G10, xeq = W / v.k, xmax = 2 * xeq, w = Math.sqrt(v.k / v.m), P = 2 * PI / w;
    const o = { W, xeq, xmax, w, P, vmax: xeq * w };
    if (mode === 'drop'){ const y = v.y, dUg = W * y, Us = 0.5 * v.k * y * y, K = dUg - Us; Object.assign(o, { y, dUg, Us, K, vy: K > 0 ? Math.sqrt(2 * K / v.m) : 0, past: y > xmax + 1e-12 }); }
    return o;
  },
  dvs(mode){ const l = [
      { id: 'xeq', name: 'Equilibrium stretch mg/k', short: 'x_eq', sym: 'x<sub>eq</sub>', unit: 'm', f: d => d.xeq },
      { id: 'xmax', name: 'Lowest point (dropped)', short: 'x_max', sym: 'x<sub>max</sub>', unit: 'm', f: d => d.xmax },
      { id: 'vmax', name: 'Top speed (dropped)', short: 'v_max', sym: 'v<sub>max</sub>', unit: 'm/s', f: d => d.vmax },
      { id: 'P', name: 'Time for one bounce', short: 'period', sym: 'period', unit: 's', f: d => d.P }];
    if (mode === 'drop') l.unshift({ id: 'vy', name: 'Speed at point B', short: 'v_B', sym: 'v<sub>B</sub>', unit: 'm/s', f: d => d.past ? NaN : d.vy });
    return l; },
  work(v, d, mode){
    let h = '<h4>1 · Equilibrium (forces balance)</h4><div class="eq">kx<sub>eq</sub> = mg → x<sub>eq</sub> = mg/k = (' + H.iv('m') + ')(' + H.g() + ') / ' + H.iv('k') + ' = <b>' + H.n(d.xeq, 'm') + '</b></div>';
    if (mode === 'gentle') return h + '<p class="note">Lowered by hand, the mass just settles here. Your hand takes away energy (it does negative work), so there’s no bouncing.</p>' +
      '<h4>2 · Compare with dropping it</h4><div class="eq">Dropped from the unstretched length, it goes down to x<sub>max</sub> = 2mg/k = ' + H.n(d.xmax, 'm') + ' — twice as far. Switch to “Dropped” to see why.</div>';
    h += '<h4>2 · Energy from release (at rest) to point B, stretch y</h4><div class="eq">Gravity energy given up: mgy = (' + H.iv('m') + ')(' + H.g() + ')(' + H.iv('y') + ') = ' + H.n(d.dUg, 'J') + '</div>' +
      '<div class="eq">Stored in the spring: ½ky² = ½(' + H.iv('k') + ')(' + H.iv('y') + ')² = ' + H.n(d.Us, 'J') + '</div>' +
      (d.past ? '<div class="bad">B is below the lowest point: the mass never gets there (K would be negative).</div>'
              : '<div class="eq">K = mgy − ½ky² = <b>' + H.n(d.K, 'J') + '</b> → v<sub>B</sub> = √(2K/m) = <b>' + H.n(d.vy, 'm/s') + '</b></div>') +
      '<h4>3 · Lowest point (K = 0 again)</h4><div class="eq">mgx<sub>max</sub> = ½kx<sub>max</sub>² → x<sub>max</sub> = 2mg/k = <b>' + H.n(d.xmax, 'm') + '</b> = 2x<sub>eq</sub></div>' +
      '<p class="note">Not the same as equilibrium! At x<sub>max</sub> the spring pulls up with 2mg, so the mass bounces back up.</p>' +
      '<h4>4 · Fastest point is at equilibrium</h4><div class="eq">v<sub>max</sub> at y = x<sub>eq</sub>: ½mv² = mgx<sub>eq</sub> − ½kx<sub>eq</sub>² → v<sub>max</sub> = <b>' + H.n(d.vmax, 'm/s') + '</b></div>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    panelTitle(mode === 'drop' ? 'DROPPED' : 'LOWERED GENTLY', 10, 18);
    const top = 30, x0 = 160, L0 = 70, sc = Math.min(500, 220 / Math.max(d.xmax, 0.05));
    const y = mode === 'drop' ? d.xeq - d.xeq * Math.cos(d.w * A.t) : d.xeq;
    ctx.fillStyle = '#111'; ctx.fillRect(x0 - 50, top - 8, 100, 8);
    const end = top + L0 + y * sc;
    ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2; ctx.beginPath(); const nz = 14; for (let i = 0; i <= nz; i++){ const yy = top + (end - top) * i / nz, xx = x0 + (i % 2 ? -10 : 10) * (i > 0 && i < nz ? 1 : 0); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
    const bs = 18 + 12 * Math.sqrt(v.m); ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(x0 - bs / 2, end, bs, bs); ctx.strokeRect(x0 - bs / 2, end, bs, bs);
    // reference lines
    const line = (yy, lab, col) => { const py = top + L0 + yy * sc; ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x0 - (lab === 'B' ? 70 : -30), py); ctx.lineTo(x0 + (lab === 'B' ? -30 : 130), py); ctx.stroke(); ctx.setLineDash([]); text(lab, lab === 'B' ? x0 - 84 : x0 + 134, py + 4, { font: '600 11px "IBM Plex Mono",monospace', col }); };
    line(0, 'unstretched', '#8a8a8a'); line(d.xeq, 'equilibrium', '#1e7d45'); if (mode === 'drop'){ line(d.xmax, 'lowest point', '#c43a00'); if (!d.past) line(d.y, 'B', '#ff6a2b'); }
    if (sc < 500) text('distances zoomed to fit', 12, 318, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    // energy bars at point B (drop) or at equilibrium
    panelTitle(mode === 'drop' ? 'ENERGY AT B (mass + spring + Earth)' : 'FORCES AT EQUILIBRIUM', 372, 18);
    if (mode === 'drop'){
      const base = 250, Em = Math.max(d.W * d.xmax, 1e-9) * 1.05, hh = 190;
      const bars = [['K', d.past ? 0 : d.K, '#1546d6'], ['U_s', d.past ? 0 : d.Us, '#7a3fb0'], ['U_g lost', d.past ? 0 : d.dUg, '#111']];
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(390, base); ctx.lineTo(590, base); ctx.stroke();
      bars.forEach(([l, val, col], i) => { const x = 405 + i * 62, hgt = hh * val / Em; ctx.fillStyle = col; ctx.fillRect(x, base - hgt, 46, hgt); ctx.strokeStyle = '#111'; ctx.strokeRect(x, base - hgt, 46, hgt); text(l, x + 23, base + 14, { align: 'center', font: '700 10px "IBM Plex Mono",monospace' }); text(fplain(val) + ' J', x + 23, base - hgt - 5, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); });
      text('K + U_s = U_g lost', 400, 300, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    } else {
      const fx = 480, fy = 170, s = 70 / d.W; ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(fx, fy, 6, 0, 7); ctx.fill();
      arrow(fx, fy, fx, fy - d.W * s, '#7a3fb0', 'kx = ' + fplain(d.W) + ' N', { lx: 8, ly: 0 }); arrow(fx, fy, fx, fy + d.W * s, COL.W, 'mg = ' + fplain(d.W) + ' N', { lx: 8, ly: 0 });
    }
  }
};
