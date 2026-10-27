// Refraction & Total Internal Reflection (AP 13.1, 13.3; IB C.3): Snell's law with rays and wavefronts, the critical angle, and light guided down an optical fiber.
const SIM = {
  title: 'Refraction & Total Internal Reflection',
  hint: 'n₁ sin θ₁ = n₂ sin θ₂ · n = c/v',
  modes: [{ id: 'refr', label: 'Snell’s law' }, { id: 'fiber', label: 'Optical fiber' }],
  ivs(mode){
    if (mode === 'fiber') return [
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Angle the light enters the end of the fiber', unit: '°', min: 0, max: 80, step: 0.5, val: 30, graph: true },
      { id: 'nc', sym: 'n<sub>core</sub>', symText: 'ncore', label: 'Core index', unit: '', min: 1.3, max: 1.8, step: 0.01, val: 1.5, show: x => x.toFixed(2) },
      { id: 'ncl', sym: 'n<sub>clad</sub>', symText: 'nclad', label: 'Cladding index', unit: '', min: 1, max: 1.7, step: 0.01, val: 1.4, show: x => x.toFixed(2) }];
    return [
      { id: 'th1', sym: 'θ<sub>1</sub>', symText: 'θ1', label: 'Angle of incidence (from the normal)', unit: '°', min: 0, max: 89, step: 0.5, val: 40, graph: true },
      { id: 'n1', sym: 'n<sub>1</sub>', symText: 'n1', label: 'Index of medium 1 (top)', unit: '', min: 1, max: 2.5, step: 0.01, val: 1, show: x => x.toFixed(2) },
      { id: 'n2', sym: 'n<sub>2</sub>', symText: 'n2', label: 'Index of medium 2 (bottom)', unit: '', min: 1, max: 2.5, step: 0.01, val: 1.33, show: x => x.toFixed(2) },
      { id: 'lam', sym: 'λ<sub>1</sub>', symText: 'λ1', label: 'Wavelength in medium 1', unit: 'nm', min: 400, max: 700, step: 5, val: 600 }];
  },
  presets: [{ label: 'Air → water', mode: 'refr', v: { n1: 1, n2: 1.33, th1: 40 } }, { label: 'Glass → air, past critical', mode: 'refr', v: { n1: 1.5, n2: 1, th1: 50 } }, { label: 'Diamond → air', mode: 'refr', v: { n1: 2.42, n2: 1, th1: 30 } }, { label: 'Light leaks out', mode: 'fiber', v: { th: 70, ncl: 1.45 } }],
  calc(v, mode){
    if (mode === 'fiber'){ const tr = Math.asin(Math.sin(v.th * DEG) / v.nc) / DEG, wall = 90 - tr, crit = v.ncl < v.nc ? Math.asin(v.ncl / v.nc) / DEG : 90, tir = wall > crit;
      const NA = Math.sqrt(Math.max(0, v.nc * v.nc - v.ncl * v.ncl)), acc = NA >= 1 ? 90 : Math.asin(NA) / DEG; return { tr, wall, crit, tir, acc }; }
    const s2 = v.n1 * Math.sin(v.th1 * DEG) / v.n2, tir = s2 > 1, th2 = tir ? NaN : Math.asin(s2) / DEG, crit = v.n1 > v.n2 ? Math.asin(v.n2 / v.n1) / DEG : NaN;
    return { s2, tir, th2, crit, v1: 3e8 / v.n1, v2: 3e8 / v.n2, lam2: v.lam * v.n1 / v.n2 };
  },
  dvs(mode){
    if (mode === 'fiber') return [{ id: 'wall', name: 'Angle at the core–cladding wall', short: 'θ_wall', sym: 'θ<sub>wall</sub>', unit: '°', f: d => d.wall, vs: 'crit' }, { id: 'crit', name: 'Critical angle', short: 'θ_c', sym: 'θ<sub>c</sub>', unit: '°', f: d => d.crit }];
    return [{ id: 'th2', name: 'Angle of refraction', short: 'θ₂', sym: 'θ<sub>2</sub>', unit: '°', f: d => d.th2 }, { id: 'lam2', name: 'Wavelength in medium 2', short: 'λ₂', sym: 'λ<sub>2</sub>', unit: 'nm', f: d => d.lam2 }];
  },
  work(v, d, mode){
    if (mode === 'fiber') return '<h4>1 · Refraction into the end of the fiber</h4><div class="eq">(1.00) sin ' + H.iv('th') + ' = (' + fnum(v.nc) + ') sin θ<sub>r</sub> → θ<sub>r</sub> = <b>' + H.n(d.tr, '°') + '</b></div>' +
      '<h4>2 · Angle at the wall</h4><div class="eq">The wall is parallel to the axis, so the ray hits it at 90° − θ<sub>r</sub> = <b>' + H.n(d.wall, '°') + '</b> from the normal.</div>' +
      '<h4>3 · Critical angle at the wall</h4><div class="eq">' + (v.ncl < v.nc ? 'sin θ<sub>c</sub> = n<sub>clad</sub>/n<sub>core</sub> = ' + fnum(v.ncl) + '/' + fnum(v.nc) + ' → θ<sub>c</sub> = <b>' + H.n(d.crit, '°') + '</b>' : 'n<sub>clad</sub> ≥ n<sub>core</sub>: no total internal reflection possible.') + '</div>' +
      (d.tir ? '<div class="eq">' + fnum(d.wall) + '° > ' + fnum(d.crit) + '° → <b>total internal reflection</b>: the light stays in the core.</div>' : '<div class="bad">' + fnum(d.wall) + '° < θ<sub>c</sub>: some light refracts into the cladding and leaks away every bounce.</div>') +
      '<p class="note">Light entering at up to ' + fnum(d.acc) + '° is trapped. Uses: internet cables, endoscopes for seeing inside the body. Why have a cladding at all? It protects the core surface and keeps scratches and other fibers from letting light out.</p>';
    let s = '<h4>1 · Snell’s law</h4><div class="eq">n₁ sin θ₁ = n₂ sin θ₂ → sin θ₂ = (' + fnum(v.n1) + ')(sin ' + H.iv('th1') + ')/' + fnum(v.n2) + ' = <b>' + fnum(d.s2) + '</b></div>';
    if (d.tir) s += '<div class="bad">sin θ₂ can’t be more than 1: no refracted ray. <b>Total internal reflection</b> — all the light reflects (θ₁ = ' + fnum(v.th1) + '° > θ<sub>c</sub> = ' + fnum(d.crit) + '°).</div>';
    else s += '<div class="eq">θ₂ = <b>' + H.n(d.th2, '°') + '</b> — bends ' + (v.n2 > v.n1 ? '<b>toward</b> the normal (into a slower medium).' : v.n2 < v.n1 ? '<b>away from</b> the normal (into a faster medium).' : 'not at all.') + '</div>';
    s += '<h4>2 · Critical angle</h4><div class="eq">' + (v.n1 > v.n2 ? 'sin θ<sub>c</sub> = n₂/n₁ → θ<sub>c</sub> = <b>' + H.n(d.crit, '°') + '</b>' : 'Only possible going from higher n to lower n. Here n₁ ≤ n₂, so no critical angle.') + '</div>' +
      '<h4>3 · Speed and wavelength change; frequency doesn’t</h4><div class="eq">v₂ = c/n₂ = ' + H.n(d.v2, 'm/s') + '; λ₂ = λ₁n₁/n₂ = <b>' + H.n(d.lam2, 'nm') + '</b></div>' +
      '<p class="note">The wavefronts (thin lines) slow down on entering the bottom medium, so they get closer together and the ray turns. Some light always reflects at the surface too.</p>';
    return s;
  },
  draw(v, d, mode){
    if (mode === 'fiber'){
      panelTitle('LIGHT IN AN OPTICAL FIBER', 10, 18);
      const x0 = 70, x1 = 385, yc = 160, hc = 20, hcl = 40;
      ctx.fillStyle = 'rgba(120,120,140,0.18)'; ctx.fillRect(x0, yc - hcl, x1 - x0, 2 * hcl); ctx.fillStyle = 'rgba(21,120,214,0.15)'; ctx.fillRect(x0, yc - hc, x1 - x0, 2 * hc);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(x0, yc - hcl, x1 - x0, 2 * hcl); ctx.beginPath(); ctx.moveTo(x0, yc - hc); ctx.lineTo(x1, yc - hc); ctx.moveTo(x0, yc + hc); ctx.lineTo(x1, yc + hc); ctx.stroke();
      text('cladding', x1 - 4, yc - hcl - 6, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('core', x1 - 4, yc + 4, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#1546d6' });
      const a = v.th * DEG, L = 60; ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0 - L * Math.cos(a), yc + L * Math.sin(a)); ctx.lineTo(x0, yc); ctx.stroke();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0 - 50, yc); ctx.lineTo(x0, yc); ctx.stroke(); ctx.setLineDash([]);
      let x = x0, y = yc, dir = -1, tr = d.tr * DEG, I = 1; const slope = Math.tan(tr);
      for (let b = 0; b < 30 && x < x1; b++){ const yt = dir < 0 ? yc - hc : yc + hc, dx = Math.abs(yt - y) / Math.max(slope, 1e-6), xn = Math.min(x1, x + dx), yn = y + (xn - x) * slope * dir;
        ctx.strokeStyle = 'rgba(196,58,0,' + I + ')'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(xn, yn); ctx.stroke(); if (xn >= x1) break;
        if (!d.tir){ const sOut = v.nc * Math.cos(tr) / v.ncl; if (sOut < 1){ const ao = Math.asin(sOut); ctx.strokeStyle = 'rgba(196,58,0,' + I * 0.7 + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xn, yn); ctx.lineTo(xn + 24 * Math.sin(ao), yn + dir * 24 * Math.cos(ao)); ctx.stroke(); } I *= 0.55; }
        x = xn; y = yn; dir = -dir; if (I < 0.05) break; }
      text(d.tir ? 'trapped by total internal reflection' : 'leaking at every bounce', 12, 300, { font: '700 13px "Space Grotesk",sans-serif', col: d.tir ? '#1e7d45' : '#c43a00' });
      panelTitle('AT THE WALL', 395, 18);
      [['angle in core θr', fplain(d.tr) + '°'], ['angle at wall', fplain(d.wall) + '°'], ['critical angle', v.ncl < v.nc ? fplain(d.crit) + '°' : 'none'], ['accepts up to', fplain(d.acc) + '°']].forEach(([a2, b], i) => { text(a2, 400, 50 + i * 30, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 50 + i * 30, { align: 'right', font: '700 13px "IBM Plex Mono",monospace' }); });
      return;
    }
    panelTitle('RAY AND WAVEFRONTS AT A BOUNDARY', 10, 18);
    const cx = 200, cy = 160, R = 140, a1 = v.th1 * DEG, sh = n => 'rgba(21,120,214,' + Math.min(0.5, (n - 1) * 0.3) + ')';
    ctx.fillStyle = sh(v.n1); ctx.fillRect(20, 26, 365, cy - 26); ctx.fillStyle = sh(v.n2); ctx.fillRect(20, cy, 365, 300 - cy);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(385, cy); ctx.stroke();
    ctx.setLineDash([5, 4]); ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, 30); ctx.lineTo(cx, 296); ctx.stroke(); ctx.setLineDash([]);
    text('n₁ = ' + v.n1.toFixed(2), 26, 44, { font: '700 12px "IBM Plex Mono",monospace' }); text('n₂ = ' + v.n2.toFixed(2), 26, 290, { font: '700 12px "IBM Plex Mono",monospace' });
    const ix = cx - R * Math.sin(a1), iy = cy - R * Math.cos(a1); ctx.save(); ctx.beginPath(); ctx.rect(20, 26, 365, 274); ctx.clip();
    // wavefronts: lines perpendicular to the ray, spacing ∝ λ
    const sp1 = 22 * v.lam / 600, ux = Math.sin(a1), uy = Math.cos(a1);
    ctx.strokeStyle = 'rgba(17,17,17,0.35)'; ctx.lineWidth = 1;
    for (let s = sp1; s < R; s += sp1){ const px = cx - ux * s, py = cy - uy * s; if (py > cy) continue; ctx.beginPath(); ctx.moveTo(px - uy * 26, py + ux * 26); ctx.lineTo(px + uy * 26, py - ux * 26); ctx.stroke(); }
    if (!d.tir){ const a2 = d.th2 * DEG, vx = Math.sin(a2), vy = Math.cos(a2), sp2 = sp1 * v.n1 / v.n2; for (let s = sp2; s < R; s += sp2){ const px = cx + vx * s, py = cy + vy * s; ctx.beginPath(); ctx.moveTo(px - vy * 26, py + vx * 26); ctx.lineTo(px + vy * 26, py - vx * 26); ctx.stroke(); } }
    ctx.restore();
    arrow(ix, iy, cx, cy, '#c43a00', null, { w: 3 });
    const refl = d.tir ? 1 : 0.35; arrow(cx, cy, cx + R * Math.sin(a1), cy - R * Math.cos(a1), 'rgba(196,58,0,' + refl + ')', null, { w: d.tir ? 3 : 2 });
    if (!d.tir){ const a2 = d.th2 * DEG; arrow(cx, cy, cx + R * Math.sin(a2), cy + R * Math.cos(a2), '#c43a00', null, { w: 3 }); text('θ₂ = ' + fplain(d.th2) + '°', cx + 12, cy + 40, { font: '700 12px "Space Grotesk",sans-serif' }); }
    text('θ₁ = ' + v.th1 + '°', cx - 12, cy - 40, { align: 'right', font: '700 12px "Space Grotesk",sans-serif' });
    if (d.tir) text('TOTAL INTERNAL REFLECTION', cx, cy + 50, { align: 'center', font: '700 14px "Space Grotesk",sans-serif', col: '#c43a00' });
    panelTitle('NUMBERS', 395, 18);
    [['θ₂', d.tir ? 'none (TIR)' : fplain(d.th2) + '°'], ['critical angle', isFinite(d.crit) ? fplain(d.crit) + '°' : 'none'], ['v₁', fplain(d.v1) + ' m/s'], ['v₂', fplain(d.v2) + ' m/s'], ['λ₁', v.lam + ' nm'], ['λ₂', fplain(d.lam2) + ' nm']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px "IBM Plex Mono",monospace' }); });
    panelTitle('COMMON INDICES', 395, 220); text('air 1.00 · water 1.33', 400, 238, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('glass 1.5 · diamond 2.42', 400, 252, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
