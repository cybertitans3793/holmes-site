// Wave Basics (AP 14.1–14.3, IB C.2): transverse and longitudinal waves, displacement–distance vs displacement–time graphs, v = fλ, phase difference, a wave entering a new medium, and polarization.
const SIM = {
  title: 'Wave Basics',
  hint: 'v = fλ · T = 1/f',
  modes: [{ id: 'trans', label: 'Transverse' }, { id: 'long', label: 'Longitudinal' }, { id: 'medium', label: 'New medium' }, { id: 'polar', label: 'Polarization' }],
  opts: [{ id: 'npol', label: 'Filters', modes: ['polar'], choices: [['two', 'Two'], ['three', 'Three (crossed outer pair)']] }],
  ivs(mode, opt){
    if (mode === 'polar') return [
      { id: 'I0', sym: 'I<sub>0</sub>', symText: 'I0', label: 'Intensity of unpolarized light', unit: 'W/m²', min: 10, max: 1000, step: 10, val: 400 },
      { id: 'th', sym: 'θ', symText: 'θ', label: (opt && opt.npol) === 'three' ? 'Angle of the middle filter' : 'Angle of the second filter (analyzer)', unit: '°', min: 0, max: 90, step: 1, val: 30, graph: true }];
    if (mode === 'medium') return [
      { id: 'f', sym: 'f', symText: 'f', label: 'Frequency (set by the source)', unit: 'Hz', min: 0.2, max: 2, step: 0.05, val: 1 },
      { id: 'v1', sym: 'v<sub>1</sub>', symText: 'v1', label: 'Speed in medium 1', unit: 'm/s', min: 0.5, max: 3, step: 0.1, val: 2 },
      { id: 'v2', sym: 'v<sub>2</sub>', symText: 'v2', label: 'Speed in medium 2', unit: 'm/s', min: 0.5, max: 3, step: 0.1, val: 1, graph: true }];
    return [
      { id: 'A', sym: 'A', symText: 'A', label: 'Amplitude', unit: 'cm', min: 0.5, max: 5, step: 0.1, val: 3 },
      { id: 'f', sym: 'f', symText: 'f', label: 'Frequency', unit: 'Hz', min: 0.2, max: 2, step: 0.05, val: 0.5, graph: true },
      { id: 'v', sym: 'v', symText: 'v', label: 'Wave speed', unit: 'm/s', min: 0.5, max: 3, step: 0.1, val: 1 },
      { id: 'dx', sym: 'Δx', symText: 'Δx', label: 'Distance from P to Q', unit: 'm', min: 0, max: 3, step: 0.05, val: 0.5 }];
  },
  presets: [{ label: 'Double the frequency', mode: 'trans', v: { f: 1 } }, { label: 'Q half a λ from P', mode: 'trans', v: { f: 0.5, v: 1, dx: 1 } }, { label: 'Into a slower medium', mode: 'medium', v: { v1: 2, v2: 1 } }, { label: 'Crossed filters', mode: 'polar', v: { th: 90 } }],
  calc(v, mode, opt){
    if (mode === 'polar'){ const three = (opt.npol || 'two') === 'three', I1 = v.I0 / 2, c2 = Math.pow(Math.cos(v.th * DEG), 2);
      const I2 = I1 * c2, I3 = three ? I2 * Math.pow(Math.cos((90 - v.th) * DEG), 2) : NaN; return { three, I1, I2, I3, Iout: three ? I3 : I2 }; }
    if (mode === 'medium') return { l1: v.v1 / v.f, l2: v.v2 / v.f, T: 1 / v.f };
    const lam = v.v / v.f, T = 1 / v.f, ph = 2 * PI * v.dx / lam, phm = ((ph % (2 * PI)) + 2 * PI) % (2 * PI);
    return { lam, T, ph, phm, vmax: 2 * PI * v.f * v.A / 100 };
  },
  dvs(mode){
    if (mode === 'polar') return [{ id: 'Io', name: 'Intensity that gets through', short: 'I', sym: 'I', unit: 'W/m²', f: d => d.Iout }];
    if (mode === 'medium') return [{ id: 'l2', name: 'Wavelength in medium 2', short: 'λ₂', sym: 'λ<sub>2</sub>', unit: 'm', f: d => d.l2 }, { id: 'l1', name: 'Wavelength in medium 1', short: 'λ₁', sym: 'λ<sub>1</sub>', unit: 'm', f: d => d.l1 }];
    return [{ id: 'lam', name: 'Wavelength', short: 'λ', sym: 'λ', unit: 'm', f: d => d.lam }, { id: 'T', name: 'Period', short: 'T', sym: 'T', unit: 's', f: d => d.T },
      { id: 'ph', name: 'Phase difference P to Q', short: 'Δφ', sym: 'Δφ', unit: 'rad', f: d => d.ph }, { id: 'vm', name: 'Maximum speed of a particle', short: 'v_max', sym: 'v<sub>max</sub>', unit: 'm/s', f: d => d.vmax }];
  },
  work(v, d, mode){
    if (mode === 'polar'){
      let s = '<h4>1 · First filter: unpolarized → polarized</h4><div class="eq">Unpolarized light vibrates in every direction. A filter lets through only one plane, so half the intensity gets through: I₁ = I₀/2 = <b>' + H.n(d.I1, 'W/m²') + '</b></div>' +
        '<h4>2 · Next filter at θ to the first (Malus’s law)</h4><div class="eq">I₂ = I₁ cos²θ = ' + fnum(d.I1) + ' × cos²(' + H.iv('th') + ') = <b>' + H.n(d.I2, 'W/m²') + '</b></div>';
      if (d.three) s += '<h4>3 · Last filter at 90° to the first, so (90° − θ) to the middle one</h4><div class="eq">I₃ = I₂ cos²(90° − θ) = <b>' + H.n(d.I3, 'W/m²') + '</b></div><p class="note">With no middle filter, crossed filters pass nothing. Adding a filter <i>between</i> them lets light through: the middle filter re-polarizes the light at a new angle. Most light gets through at θ = 45°.</p>';
      else s += '<p class="note">Only <b>transverse</b> waves can be polarized; sound (longitudinal) can’t. Uses: polarized sunglasses block glare (light reflected off water or a road is partly polarized), LCD screens, 3-D movie glasses.</p>';
      return s;
    }
    if (mode === 'medium') return '<h4>1 · Frequency stays the same</h4><div class="eq">The source sets f = ' + H.iv('f') + ' on both sides. Each crest that arrives at the boundary makes one crest on the other side.</div>' +
      '<h4>2 · Speed is set by the medium</h4><div class="eq">λ₁ = v₁/f = ' + H.iv('v1') + '/' + H.iv('f') + ' = <b>' + H.n(d.l1, 'm') + '</b><br>λ₂ = v₂/f = ' + H.iv('v2') + '/' + H.iv('f') + ' = <b>' + H.n(d.l2, 'm') + '</b></div>' +
      '<p class="note">' + (v.v2 < v.v1 ? 'Slower medium → shorter wavelength (light entering glass, a wave on a string reaching a heavier string).' : v.v2 > v.v1 ? 'Faster medium → longer wavelength (sound going from air into water).' : 'Same speed: nothing changes.') + ' FRQ trap: the frequency never changes at a boundary.</p>';
    const deg = d.phm / DEG, inph = Math.abs(deg) < 0.5 || Math.abs(deg - 360) < 0.5, anti = Math.abs(deg - 180) < 0.5;
    return '<h4>1 · Wavelength and period</h4><div class="eq">λ = v/f = ' + H.iv('v') + '/' + H.iv('f') + ' = <b>' + H.n(d.lam, 'm') + '</b> &nbsp; T = 1/f = <b>' + H.n(d.T, 's') + '</b></div>' +
      '<h4>2 · Reading the two graphs</h4><div class="eq">Displacement–<b>distance</b> graph: peak to peak = λ. Displacement–<b>time</b> graph: peak to peak = T. Both have the same amplitude A = ' + H.iv('A') + '.</div>' +
      '<h4>3 · Phase difference between P and Q</h4><div class="eq">Δφ = 2πΔx/λ = 2π(' + H.iv('dx') + ')/' + fnum(d.lam) + ' m = <b>' + H.n(d.ph, 'rad') + '</b> (' + Math.round(d.ph / DEG) + '°)' + (inph ? ' → <b>in phase</b>' : anti ? ' → <b>in antiphase</b>' : '') + '</div>' +
      '<p class="note">' + (mode === 'long' ? 'Longitudinal: particles move <b>along</b> the direction the wave travels. Compressions are where the particles bunch up; on the displacement graph they are where the curve crosses zero going down.' : 'Transverse: particles move <b>perpendicular</b> to the direction the wave travels. The particles never travel along with the wave; only energy moves.') + '</p>';
  },
  draw(v, d, mode, opt, t){
    if (mode === 'polar'){
      panelTitle('UNPOLARIZED LIGHT THROUGH FILTERS', 10, 18);
      const y = 150, xs = d.three ? [110, 210, 310] : [140, 290], angs = d.three ? [0, v.th, 90] : [0, v.th], Is = d.three ? [v.I0, d.I1, d.I2, d.I3] : [v.I0, d.I1, d.I2];
      const seg = (x1, x2, I, ang) => { const a = Math.min(1, I / v.I0); ctx.fillStyle = 'rgba(255,210,60,' + (0.15 + 0.7 * a) + ')'; ctx.fillRect(x1, y - 22, x2 - x1, 44);
        const mid = (x1 + x2) / 2; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
        if (ang === null){ [0, 45, 90, 135].forEach(q => { const c = Math.cos(q * DEG) * 18 * Math.sqrt(a + 0.05), s = Math.sin(q * DEG) * 18 * Math.sqrt(a + 0.05); ctx.beginPath(); ctx.moveTo(mid - s, y - c); ctx.lineTo(mid + s, y + c); ctx.stroke(); }); }
        else if (I > 0.5){ const L = 20 * Math.sqrt(a), c = Math.cos(ang * DEG) * L, s = Math.sin(ang * DEG) * L; arrow(mid, y, mid + s, y - c, '#111', null, { w: 2, head: 6 }); arrow(mid, y, mid - s, y + c, '#111', null, { w: 2, head: 6 }); }
        text(fplain(I) + ' W/m²', mid, y + 44, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); };
      const edges = [20].concat(xs).concat([385]);
      for (let i = 0; i < edges.length - 1; i++) seg(edges[i] + (i ? 6 : 0), edges[i + 1] - (i < edges.length - 2 ? 6 : 0), Is[i], i === 0 ? null : angs[i - 1]);
      xs.forEach((x, i) => { ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(120,120,140,0.25)'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, 8, 52, 0, 0, 7); ctx.fill(); ctx.stroke();
        ctx.rotate(angs[i] * DEG); ctx.strokeStyle = '#333'; ctx.lineWidth = 1; for (let k = -2; k <= 2; k++){ ctx.beginPath(); ctx.moveTo(k * 3, -40); ctx.lineTo(k * 3, 40); ctx.stroke(); } ctx.restore();
        text(angs[i] + '°', x, y - 62, { align: 'center', font: '700 12px "Space Grotesk",sans-serif' }); });
      text('lines show each filter’s transmission axis', 12, 312, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('OUTPUT vs ANGLE', 395, 18);
      const gx = 405, gy = 230, gw = 180, gh = 150; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 90; i++){ const c2 = Math.pow(Math.cos(i * DEG), 2), I = d.three ? c2 * (1 - c2) * 4 : c2; i ? ctx.lineTo(gx + gw * i / 90, gy - gh * I) : ctx.moveTo(gx, gy - gh * I); } ctx.stroke();
      const cur = d.Iout / (d.three ? d.I1 / 4 : d.I1); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(gx + gw * v.th / 90, gy - gh * cur, 5, 0, 7); ctx.fill();
      text('0°', gx, gy + 14, { align: 'center', font: '500 10px "IBM Plex Mono",monospace' }); text('90°', gx + gw, gy + 14, { align: 'center', font: '500 10px "IBM Plex Mono",monospace' }); text('θ', gx + gw / 2, gy + 14, { align: 'center', font: '600 11px "IBM Plex Mono",monospace' });
      text(d.three ? 'max = I₀/8 at 45°' : 'max = I₀/2 at 0°', gx + 4, gy - gh - 6, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text('I out = ' + fplain(d.Iout) + ' W/m²', 400, 290, { font: '700 13px "Space Grotesk",sans-serif' });
      return;
    }
    const PX = 60, X0 = 20, XW = 360;
    if (mode === 'medium'){
      panelTitle('A WAVE CROSSING INTO A NEW MEDIUM', 10, 18);
      const xb = X0 + 180, y0 = 130, A = 35, w = 2 * PI * v.f;
      ctx.fillStyle = 'rgba(21,70,214,0.06)'; ctx.fillRect(xb, 40, X0 + XW - xb, 180); ctx.strokeStyle = '#8a8a8a'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(xb, 40); ctx.lineTo(xb, 220); ctx.stroke(); ctx.setLineDash([]);
      text('medium 1: v₁ = ' + v.v1 + ' m/s', X0 + 4, 52, { font: '600 11px "IBM Plex Mono",monospace' }); text('medium 2: v₂ = ' + v.v2 + ' m/s', xb + 6, 52, { font: '600 11px "IBM Plex Mono",monospace' });
      const ph = x => { const m = (x - X0) / PX, mb = (xb - X0) / PX; return x <= xb ? w * (t - m / v.v1) : w * (t - mb / v.v1 - (m - mb) / v.v2); };
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2.5; ctx.beginPath(); for (let x = X0; x <= X0 + XW; x += 2){ const y = y0 - A * Math.sin(ph(x)); x === X0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
      const bracket = (x1, lam, lab) => { const x2 = x1 + lam * PX; ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x1, 200); ctx.lineTo(x2, 200); ctx.moveTo(x1, 194); ctx.lineTo(x1, 206); ctx.moveTo(x2, 194); ctx.lineTo(x2, 206); ctx.stroke(); text(lab, (x1 + x2) / 2, 216, { align: 'center', font: '700 11px "IBM Plex Mono",monospace', col: '#c43a00' }); };
      if (d.l1 * PX < 175) bracket(X0 + 2, d.l1, 'λ₁ = ' + fplain(d.l1) + ' m'); if (d.l2 * PX < 175) bracket(xb + 4, d.l2, 'λ₂ = ' + fplain(d.l2) + ' m');
      text('f = ' + v.f + ' Hz on both sides', 12, 260, { font: '700 13px "Space Grotesk",sans-serif' });
      text('1 m', X0, 300, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); ctx.fillStyle = '#111'; ctx.fillRect(X0, 304, PX, 3);
      panelTitle('SAME f, DIFFERENT λ', 395, 18);
      [['medium 1', d.l1], ['medium 2', d.l2]].forEach(([n, l], i) => { const y = 60 + i * 60; text(n + ': λ = ' + fplain(l) + ' m', 400, y, { font: '700 12px "Space Grotesk",sans-serif' }); ctx.fillStyle = i ? '#1546d6' : '#8a8a8a'; ctx.fillRect(400, y + 8, Math.min(180, l * 40), 12); });
      text('Light into glass:', 400, 196, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('slower, shorter λ', 400, 210, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('Sound air → water:', 400, 232, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('faster, longer λ', 400, 246, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    const lam = d.lam, k = 2 * PI / lam, w = 2 * PI * v.f, xP = 1, xQ = 1 + v.dx, disp = x => v.A * Math.sin(w * t - k * x);
    if (mode === 'trans'){
      panelTitle('SNAPSHOT: DISPLACEMENT vs DISTANCE', 10, 18);
      const y0 = 100, sc = 9; ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, y0); ctx.lineTo(X0 + XW, y0); ctx.stroke();
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = X0; x <= X0 + XW; x += 2){ const y = y0 - sc * disp((x - X0) / PX); x === X0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
      for (let m = 0; m <= 6; m += 0.2){ ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X0 + m * PX, y0 - sc * disp(m), 2.2, 0, 7); ctx.fill(); }
      [[xP, 'P', '#ff6a2b'], [xQ, 'Q', '#1e7d45']].forEach(([x, n, c]) => { if (x > 6) return; const px = X0 + x * PX, py = y0 - sc * disp(x); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.fill(); text(n, px + 8, py - 8, { font: '700 13px "Space Grotesk",sans-serif', col: c }); });
      arrow(300, 40, 360, 40, '#4a4a4a', 'v', { w: 2, head: 7 });
      if (lam * PX < 340){ const xa = X0 + (((w * t / k) + lam / 4) % lam) * PX; ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xa, 150); ctx.lineTo(xa + lam * PX, 150); ctx.stroke(); text('λ = ' + fplain(lam) + ' m', xa + lam * PX / 2, 164, { align: 'center', font: '700 11px "IBM Plex Mono",monospace', col: '#c43a00' }); }
    } else {
      panelTitle('PARTICLES OF THE MEDIUM (AIR, SPRING COIL)', 10, 18);
      const sc = 4; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2;
      for (let m = 0; m <= 6; m += 0.06){ const x = X0 + m * PX + sc * disp(m); if (x < X0 - 2 || x > X0 + XW + 2) continue; ctx.beginPath(); ctx.moveTo(x, 42); ctx.lineTo(x, 88); ctx.stroke(); }
      [[xP, 'P', '#ff6a2b'], [xQ, 'Q', '#1e7d45']].forEach(([x, n, c]) => { if (x > 6) return; const px = X0 + x * PX + sc * disp(x); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(px, 65, 6, 0, 7); ctx.fill(); text(n, px, 104, { align: 'center', font: '700 13px "Space Grotesk",sans-serif', col: c }); });
      for (let n = -2; n < 8; n++){ const xc = (w * t / k) + n * lam; if (xc >= 0 && xc <= 6) text('C', X0 + xc * PX, 38, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#c43a00' }); const xr = xc + lam / 2; if (xr >= 0 && xr <= 6) text('R', X0 + xr * PX, 38, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#1546d6' }); }
      const y0 = 140, s2 = 7; ctx.strokeStyle = '#ccc'; ctx.beginPath(); ctx.moveTo(X0, y0); ctx.lineTo(X0 + XW, y0); ctx.stroke();
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = X0; x <= X0 + XW; x += 2){ const y = y0 - s2 * disp((x - X0) / PX); x === X0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
      text('displacement (+ = right) vs distance', X0, 180, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    }
    // displacement-time of P
    const gy = 250, gh = 9 * Math.min(v.A, 5) * 0.75, tw = 8; panelTitle('DISPLACEMENT vs TIME AT P', 10, 200);
    ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, gy); ctx.lineTo(X0 + XW, gy); ctx.stroke();
    ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 180; i++){ const tt = tw * i / 180, y = gy - 0.75 * 9 * v.A * Math.sin(w * tt - k * xP); i ? ctx.lineTo(X0 + XW * i / 180, y) : ctx.moveTo(X0, y); } ctx.stroke();
    const tc = t % tw; ctx.strokeStyle = '#111'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X0 + XW * tc / tw, gy - 40); ctx.lineTo(X0 + XW * tc / tw, gy + 40); ctx.stroke(); ctx.setLineDash([]);
    if (d.T < tw / 1.2){ ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; const x1 = X0 + XW * ((0.25 + k * xP / (2 * PI)) % 1) * d.T / tw; ctx.beginPath(); ctx.moveTo(x1, gy + 42); ctx.lineTo(x1 + XW * d.T / tw, gy + 42); ctx.stroke(); text('T = ' + fplain(d.T) + ' s', x1 + XW * d.T / tw / 2, gy + 56, { align: 'center', font: '700 11px "IBM Plex Mono",monospace', col: '#c43a00' }); }
    text('0 to ' + tw + ' s', X0 + XW, gy + 56, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    panelTitle('NUMBERS', 395, 18);
    [['λ', fplain(d.lam) + ' m'], ['T', fplain(d.T) + ' s'], ['f', v.f + ' Hz'], ['v = fλ', fplain(v.f * d.lam) + ' m/s'], ['Δφ (P→Q)', Math.round(d.ph / DEG) + '°'], ['v max particle', fplain(d.vmax) + ' m/s']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px "IBM Plex Mono",monospace' }); });
    text('Particles oscillate;', 400, 230, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('energy travels.', 400, 244, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
