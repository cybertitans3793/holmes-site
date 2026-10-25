// Spring Launcher: elastic potential energy → kinetic → gravitational.
const SIM = {
  title: 'Spring Launcher',
  modes: [{ id: 'flat', label: 'Launch along a track, up a ramp' }, { id: 'up', label: 'Launch straight up' }],
  ivs(){ return [
    { id: 'x', sym: 'x', symText: 'x', label: 'Compression', unit: 'm', min: 0.02, max: 0.3, step: 0.005, val: 0.1, graph: true },
    { id: 'k', sym: 'k', symText: 'k', label: 'Spring constant', unit: 'N/m', min: 100, max: 2000, step: 10, val: 500 },
    { id: 'm', sym: 'm', symText: 'm', label: 'Ball mass', unit: 'kg', min: 0.05, max: 2, step: 0.01, val: 0.2 }]; },
  calc(v, mode){
    const Us = 0.5 * v.k * v.x * v.x, F = v.k * v.x, W = v.m * G10;
    if (mode === 'flat'){ const vl = v.x * Math.sqrt(v.k / v.m), h = Us / W; return { Us, F, W, vl, h }; }
    const v2 = v.k * v.x * v.x / v.m - 2 * G10 * v.x, vl = v2 > 0 ? Math.sqrt(v2) : 0, H = Us / W, hAbove = H - v.x;
    return { Us, F, W, vl, v2, H, hAbove, weak: Us <= W * v.x };
  },
  dvs(mode){ return mode === 'flat' ? [
      { id: 'vl', name: 'Launch speed', short: 'v', sym: 'v', unit: 'm/s', f: d => d.vl },
      { id: 'h', name: 'Height up the ramp', short: 'h', sym: 'h', unit: 'm', f: d => d.h },
      { id: 'Us', name: 'Spring energy ½kx²', short: 'U_s', sym: 'U<sub>s</sub>', unit: 'J', f: d => d.Us },
      { id: 'F', name: 'Spring force kx (max)', short: 'F_s', sym: 'F<sub>s</sub>', unit: 'N', f: d => d.F }]
    : [
      { id: 'H', name: 'Height above release point', short: 'H', sym: 'H', unit: 'm', f: d => d.H },
      { id: 'vl', name: 'Speed leaving the spring', short: 'v', sym: 'v', unit: 'm/s', f: d => d.v2 > 0 ? d.vl : NaN },
      { id: 'Us', name: 'Spring energy ½kx²', short: 'U_s', sym: 'U<sub>s</sub>', unit: 'J', f: d => d.Us }]; },
  work(v, d, mode){
    let h = '<h4>1 · Energy stored in the spring</h4><div class="eq">U<sub>s</sub> = ½kx² = ½(' + H.iv('k') + ')(' + H.iv('x') + ')² = <b>' + H.n(d.Us, 'J') + '</b></div>' +
      '<p class="note">It’s the area under the F–x line (a triangle: ½ × x × kx).</p>';
    if (mode === 'flat'){
      h += '<h4>2 · Launch speed (no friction, track is level)</h4><div class="eq">½kx² = ½mv² → v = x√(k/m) = (' + H.iv('x') + ')√(' + H.iv('k') + '/' + H.iv('m') + ') = <b>' + H.n(d.vl, 'm/s') + '</b></div>' +
        '<h4>3 · Height it reaches on the ramp</h4><div class="eq">½kx² = mgh → h = kx²/(2mg) = (' + H.iv('k') + ')(' + H.iv('x') + ')² / (2(' + H.iv('m') + ')(' + H.g() + ')) = <b>' + H.n(d.h, 'm') + '</b></div>' +
        '<p class="note">Double x → 4× the energy → 2× the speed but 4× the height.</p>';
    } else {
      h += '<h4>2 · Highest point (measured from where it was released)</h4><div class="eq">½kx² = mgH → H = kx²/(2mg) = <b>' + H.n(d.H, 'm') + '</b></div>' +
        '<div class="eq">Above the spring’s relaxed top: H − x = ' + H.n(d.hAbove, 'm') + '</div>' +
        '<h4>3 · Speed as it leaves the spring (it has already risen x)</h4><div class="eq">½kx² = ½mv² + mgx → v = √(kx²/m − 2gx) = √(' + H.n(v.k * v.x * v.x / v.m) + ' − ' + H.n(2 * G10 * v.x) + ') = <b>' + (d.v2 > 0 ? H.n(d.vl, 'm/s') : '—') + '</b></div>' +
        (d.weak ? '<div class="bad">½kx² ≤ mgx: the spring can’t even lift the ball back to its relaxed length.</div>' : '') +
        '<p class="note">Here the mass doesn’t cancel: a heavier ball goes less high.</p>';
    }
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset){ A.t = 0; } A.t += dt; const cyc = 3.2; const tt = A.t % cyc;
    const sc = 600; // px per m for spring
    if (mode === 'flat'){
      panelTitle('SIDE VIEW', 10, 18);
      const gy = 250, rampX = 250, hpx = 30; // ramp drawn at fixed angle; height scale
      const hs = Math.min(200, 140 / Math.max(0.5, 1) * 1); // px per m for heights
      const maxH = Math.max(d.h, 0.2), hScale = Math.min(160 / maxH, 400);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(10, gy); ctx.lineTo(rampX, gy); ctx.lineTo(rampX + 160, gy - 160); ctx.stroke();
      ctx.fillStyle = '#efefef'; ctx.beginPath(); ctx.moveTo(10, gy); ctx.lineTo(rampX, gy); ctx.lineTo(rampX + 160, gy - 160); ctx.lineTo(rampX + 160, 330); ctx.lineTo(10, 330); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#111'; ctx.fillRect(10, gy - 40, 6, 40);
      // phases: 0-0.6 compressed hold, 0.6-0.8 release, then roll and climb
      const relax = 90, comp = Math.min(70, v.x * sc * 0.4);
      let sx, bx, by; const r = 9;
      if (tt < 0.6){ sx = relax - comp; bx = 16 + sx + r; by = gy - r; }
      else if (tt < 0.75){ const f = (tt - 0.6) / 0.15; sx = relax - comp * (1 - f); bx = 16 + sx + r; by = gy - r; }
      else { sx = relax; const f = (tt - 0.75) / (cyc - 0.75); const climb = d.h * hScale; // up the 45° ramp
        const path = (rampX - (16 + relax + r)) + climb * Math.SQRT2; const dist = path * Math.sin(Math.min(1, f * 1.6) * PI / 2);
        const flatLen = rampX - (16 + relax + r);
        if (dist < flatLen){ bx = 16 + relax + r + dist; by = gy - r; } else { const u = (dist - flatLen) / Math.SQRT2; bx = rampX + u + r * 0.3; by = gy - u - r; } }
      ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 16; i++){ const xx = 16 + sx * i / 16, yy = gy - 12 + (i % 2 ? -8 : 8) * (i > 0 && i < 16 ? 1 : 0); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
      ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill(); ctx.stroke();
      const topY = gy - d.h * hScale; ctx.setLineDash([4, 4]); ctx.strokeStyle = '#ff6a2b'; ctx.beginPath(); ctx.moveTo(rampX - 40, topY); ctx.lineTo(rampX + 170, topY); ctx.stroke(); ctx.setLineDash([]);
      text('h = ' + fplain(d.h) + ' m', rampX - 38, topY - 5, { font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' });
      text('heights zoomed to fit', 12, 318, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    } else {
      panelTitle('LAUNCH STRAIGHT UP', 10, 18);
      const bx = 180, gy = 300, relax = 80, comp = Math.min(60, v.x * sc * 0.35), r = 10, Hpx = Math.min(220, 40 + d.hAbove * 30);
      let sy, by;
      if (tt < 0.6){ sy = relax - comp; by = gy - sy - r; }
      else if (tt < 0.72){ const f = (tt - 0.6) / 0.12; sy = relax - comp * (1 - f); by = gy - sy - r; }
      else { sy = relax; const f = (tt - 0.72) / (cyc - 0.72); const yy = d.weak ? 0 : Math.sin(PI * f); by = gy - relax - r - Math.max(0, d.hAbove) * yy * (Hpx - 40) / Math.max(d.hAbove, 1e-6); }
      ctx.fillStyle = '#111'; ctx.fillRect(bx - 30, gy, 60, 6);
      ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 14; i++){ const yy = gy - sy * i / 14, xx = bx + (i % 2 ? -10 : 10) * (i > 0 && i < 14 ? 1 : 0); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
      ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill(); ctx.stroke();
      text('max height above spring top: ' + fplain(Math.max(0, d.hAbove)) + ' m', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    }
    // F–x graph of the spring with the area shaded
    panelTitle('SPRING FORCE vs COMPRESSION', 372, 18);
    const gx0 = 400, gy0 = 270, gw = 180, gh = 200, xm = 0.3, Fm = 2000 * 0.3;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx0, gy0 - gh); ctx.lineTo(gx0, gy0); ctx.lineTo(gx0 + gw, gy0); ctx.stroke();
    const P = (x, F) => [gx0 + gw * x / xm, gy0 - gh * F / Fm];
    ctx.fillStyle = 'rgba(122,63,176,0.25)'; ctx.beginPath(); ctx.moveTo(...P(0, 0)); ctx.lineTo(...P(v.x, 0)); ctx.lineTo(...P(v.x, d.F)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(...P(0, 0)); ctx.lineTo(...P(xm, v.k * xm)); ctx.stroke();
    text('shaded area = ½kx² = ' + fplain(d.Us) + ' J', gx0 + 6, gy0 - gh + 14, { font: '600 11px "IBM Plex Mono",monospace' });
    text('slope = k', P(xm * 0.55, v.k * xm * 0.55)[0] - 50, P(xm * 0.55, v.k * xm * 0.55)[1] - 6, { font: '700 11px "Space Grotesk",sans-serif', col: '#7a3fb0' });
    text('F (N)', gx0 - 4, gy0 - gh - 6, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('x (m)', gx0 + gw, gy0 + 14, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
