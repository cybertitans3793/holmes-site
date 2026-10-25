// Gears: meshed gears, a third (idler) gear, and a bike chain. Same rim speed → ω₁r₁ = ω₂r₂.
const SIM = {
  title: 'Gears',
  modes: [{ id: 'mesh', label: 'Two gears' }, { id: 'idler', label: 'Three gears' }, { id: 'chain', label: 'Bike chain' }],
  ivs(mode){
    const l = [
      { id: 'N1', sym: 'N<sub>1</sub>', symText: 'N1', label: mode === 'chain' ? 'Front chainring teeth' : 'Driving gear teeth', unit: '', min: 8, max: 60, step: 1, val: mode === 'chain' ? 44 : 20, show: v => v.toFixed(0) },
      { id: 'N2', sym: 'N<sub>2</sub>', symText: 'N2', label: mode === 'chain' ? 'Rear cog teeth' : 'Driven gear teeth', unit: '', min: 8, max: 60, step: 1, val: mode === 'chain' ? 16 : 40, graph: true, show: v => v.toFixed(0) },
      { id: 'rpm', sym: 'rpm<sub>1</sub>', symText: 'rpm1', label: mode === 'chain' ? 'Pedaling rate' : 'Driving gear speed', unit: 'rpm', min: 10, max: 120, step: 1, val: 60, show: v => v.toFixed(0) + ' rpm' }];
    if (mode === 'idler') l.splice(1, 0, { id: 'Ni', sym: 'N<sub>i</sub>', symText: 'Ni', label: 'Middle (idler) gear teeth', unit: '', min: 8, max: 60, step: 1, val: 12, show: v => v.toFixed(0) });
    if (mode === 'chain') l.push({ id: 'R', sym: 'R', symText: 'R', label: 'Wheel radius', unit: 'm', min: 0.2, max: 0.4, step: 0.01, val: 0.34 });
    return l;
  },
  presets: [{ label: 'Same size', v: { N1: 30, N2: 30 } }, { label: '2 : 1', v: { N1: 20, N2: 40 } }, { label: '1 : 3', v: { N1: 45, N2: 15 } }],
  calc(v, mode){
    const rr = N => N * 0.002; // pitch radius: 2 mm per tooth
    const R1 = rr(v.N1), R2 = rr(v.N2), w1 = v.rpm * 2 * PI / 60, vr = w1 * R1, w2 = vr / R2, rpm2 = w2 * 60 / (2 * PI), ratio = v.N2 / v.N1;
    const o = { R1, R2, w1, w2, vr, rpm2, ratio, same: mode === 'chain' || mode === 'idler' };
    if (mode === 'idler'){ o.Ri = rr(v.Ni); o.wi = vr / o.Ri; o.rpmi = o.wi * 60 / (2 * PI); }
    if (mode === 'chain'){ o.bike = w2 * v.R; o.kmh = o.bike * 3.6; o.mph = o.bike * 2.237; }
    return o;
  },
  dvs(mode){ const l = [
      { id: 'rpm2', name: mode === 'chain' ? 'Rear wheel rpm' : 'Driven gear rpm', short: 'rpm2', sym: 'rpm<sub>2</sub>', unit: 'rpm', f: d => d.rpm2 },
      { id: 'w2', name: 'Driven angular speed ω₂', short: 'ω2', sym: 'ω<sub>2</sub>', unit: 'rad/s', f: d => d.w2 },
      { id: 'vr', name: 'Rim (or chain) speed', short: 'v_rim', sym: 'v<sub>rim</sub>', unit: 'm/s', f: d => d.vr }];
    if (mode === 'chain') l.unshift({ id: 'bike', name: 'Bike speed', short: 'v_bike', sym: 'v<sub>bike</sub>', unit: 'm/s', f: d => d.bike });
    if (mode === 'idler') l.push({ id: 'rpmi', name: 'Idler gear rpm', short: 'rpm_i', sym: 'rpm<sub>i</sub>', unit: 'rpm', f: d => d.rpmi });
    return l; },
  work(v, d, mode){
    let h = '<h4>1 · Angular speed of the ' + (mode === 'chain' ? 'pedals / chainring' : 'driving gear') + '</h4><div class="eq">ω<sub>1</sub> = 2π × rpm/60 = 2π(' + H.iv('rpm') + ')/60 = ' + H.n(d.w1, 'rad/s') + '</div>' +
      '<h4>2 · The teeth (or chain) make the rims move at the same speed</h4><div class="eq">v<sub>rim</sub> = ω<sub>1</sub>r<sub>1</sub> = ω<sub>2</sub>r<sub>2</sub> = (' + H.n(d.w1) + ')(' + H.n(d.R1, 'm') + ') = <b>' + H.n(d.vr, 'm/s') + '</b></div>' +
      '<p class="note">Teeth are the same size on both gears, so r is proportional to the number of teeth N.</p>' +
      '<h4>3 · So the angular speeds are in the inverse ratio of the sizes</h4><div class="eq">ω<sub>2</sub> = ω<sub>1</sub>r<sub>1</sub>/r<sub>2</sub> = ω<sub>1</sub>N<sub>1</sub>/N<sub>2</sub> → rpm<sub>2</sub> = ' + H.iv('rpm') + ' × ' + H.iv('N1') + '/' + H.iv('N2') + ' = <b>' + H.n(d.rpm2, 'rpm') + '</b></div>' +
      '<div class="eq">Gear ratio N<sub>2</sub>/N<sub>1</sub> = ' + H.n(d.ratio) + ': the ' + (d.ratio > 1 ? 'bigger driven gear turns slower' : d.ratio < 1 ? 'smaller driven gear turns faster' : 'gears turn at the same rate') + '.</div>';
    if (mode === 'mesh') h += '<h4>4 · Direction</h4><div class="eq">Meshed gears turn in <b>opposite</b> directions.</div>';
    if (mode === 'idler') h += '<h4>4 · The idler in the middle</h4><div class="eq">It turns at ' + H.n(d.rpmi, 'rpm') + ', but it doesn’t change the final speed: ω<sub>1</sub>N<sub>1</sub> = ω<sub>i</sub>N<sub>i</sub> = ω<sub>2</sub>N<sub>2</sub>. It only flips the direction, so gears 1 and 2 turn the <b>same</b> way.</div>';
    if (mode === 'chain') h += '<h4>4 · A chain doesn’t reverse the direction</h4><div class="eq">Front and rear turn the same way.</div>' +
      '<h4>5 · Bike speed (the rear cog and wheel share ω<sub>2</sub>)</h4><div class="eq">v = ω<sub>2</sub>R = (' + H.n(d.w2, 'rad/s') + ')(' + H.iv('R') + ') = <b>' + H.n(d.bike, 'm/s') + '</b> = ' + H.n(d.kmh, 'km/h') + ' = ' + H.n(d.mph, 'mph') + '</div>' +
      '<p class="note">Low gear (small chainring, big cog) = slow but easy to pedal up a hill. The trade-off is torque, which comes in the rotation unit.</p>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle(mode === 'chain' ? 'BIKE DRIVETRAIN' : 'GEARS', 10, 18);
    if (A.a1 === undefined){ A.a1 = 0; A.a2 = 0; A.ai = 0; }
    const slow = 0.25; A.a1 += d.w1 * dt * slow; const sgn = mode === 'mesh' ? -1 : 1;
    A.a2 += sgn * d.w2 * dt * slow; if (mode === 'idler') A.ai -= d.wi * dt * slow;
    let scale = 1500; const gear = (x, y, N, R, ang, col) => {
      const rp = R * scale, ro = rp + 5, ri = rp - 5; ctx.fillStyle = col; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let i = 0; i < N; i++){ const a0 = ang + 2 * PI * i / N, a1 = a0 + PI / N * 0.45, a2 = a0 + PI / N, a3 = a0 + PI / N * 1.55;
        ctx.lineTo(x + ri * Math.cos(a0), y + ri * Math.sin(a0)); ctx.lineTo(x + ro * Math.cos(a1), y + ro * Math.sin(a1)); ctx.lineTo(x + ro * Math.cos(a2), y + ro * Math.sin(a2)); ctx.lineTo(x + ri * Math.cos(a3), y + ri * Math.sin(a3)); }
      ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rp - 8) * Math.cos(ang), y + (rp - 8) * Math.sin(ang)); ctx.stroke(); return rp; };
    const y = 170;
    if (mode === 'mesh'){ scale = Math.min(1500, 175 / (d.R1 + d.R2), 118 / Math.max(d.R1, d.R2)); const r1 = d.R1 * scale, r2 = d.R2 * scale, x1 = 190 - (r1 + r2) / 2, x2 = x1 + r1 + r2;
      gear(x1, y, Math.round(v.N1), d.R1, A.a1, '#ff6a2b'); gear(x2, y, Math.round(v.N2), d.R2, A.a2 + PI / Math.round(v.N2), '#1546d6'); }
    else if (mode === 'idler'){ scale = Math.min(1500, 175 / (d.R1 + d.Ri + d.R2), 118 / Math.max(d.R1, d.Ri, d.R2)); const r1 = d.R1 * scale, ri = d.Ri * scale, r2 = d.R2 * scale, tot = 2 * r1 + 2 * ri + 2 * r2, x1 = 190 - tot / 2 + r1, xi = x1 + r1 + ri, x2 = xi + ri + r2;
      gear(x1, y, Math.round(v.N1), d.R1, A.a1, '#ff6a2b'); gear(xi, y, Math.round(v.Ni), d.Ri, A.ai + PI / Math.round(v.Ni), '#bdbdbd'); gear(x2, y, Math.round(v.N2), d.R2, A.a2, '#1546d6'); }
    else { scale = Math.min(1400, 92 / d.R1, 55 / d.R2); const x1 = 112, x2 = 285, r1 = d.R1 * scale, r2 = d.R2 * scale;
      ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1, y - r1 - 3); ctx.lineTo(x2, y - r2 - 3); ctx.moveTo(x1, y + r1 + 3); ctx.lineTo(x2, y + r2 + 3); ctx.stroke();
      ctx.strokeStyle = '#d0d0d0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x2, y, 98, 0, 7); ctx.stroke(); ctx.lineWidth = 1; for (let i = 0; i < 12; i++){ const a = A.a2 + i * PI / 6; ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(x2 + 96 * Math.cos(a), y + 96 * Math.sin(a)); ctx.stroke(); }
      gear(x1, y, Math.round(v.N1), d.R1, A.a1, '#ff6a2b'); gear(x2, y, Math.round(v.N2), d.R2, A.a2, '#1546d6');
      ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + 40 * Math.cos(A.a1 + 1), y + 40 * Math.sin(A.a1 + 1)); ctx.stroke(); }
    text('rpm1 = ' + fplain(v.rpm) + '   rpm2 = ' + fplain(d.rpm2) + (mode === 'chain' ? '   bike ' + fplain(d.kmh) + ' km/h' : ''), 12, 300, { font: '700 13px "IBM Plex Mono",monospace' });
    text('animation slowed down 4×', 12, 318, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    panelTitle('RIM SPEED IS SHARED', 400, 18);
    const base = 250, mx = Math.max(v.rpm, d.rpm2, 1) * 1.1;
    [['rpm1', v.rpm, '#ff6a2b'], ['rpm2', d.rpm2, '#1546d6']].forEach(([l, q, col], i) => { const x = 415 + i * 85, h = 180 * q / mx; ctx.fillStyle = col; ctx.fillRect(x, base - h, 55, h); ctx.strokeStyle = '#111'; ctx.strokeRect(x, base - h, 55, h); text(l, x + 27, base + 14, { align: 'center', font: '700 10px "IBM Plex Mono",monospace' }); text(fplain(q), x + 27, base - h - 6, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); });
    ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(405, base); ctx.lineTo(590, base); ctx.stroke();
    text('ω1 r1 = ω2 r2', 415, 290, { font: '700 14px "Space Grotesk",sans-serif' });
  }
};
