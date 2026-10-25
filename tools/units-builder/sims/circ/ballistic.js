// Ballistic Pendulum: momentum in the collision, then energy in the swing.
const SIM = {
  title: 'Ballistic Pendulum',
  modes: [{ id: 'stick', label: 'Bullet sticks' }, { id: 'through', label: 'Bullet passes through' }, { id: 'bounce', label: 'Rubber bullet bounces off' }],
  ivs(mode){ const l = [
    { id: 'm', sym: 'm', symText: 'm', label: 'Bullet mass', unit: 'g', min: 2, max: 50, step: 1, val: 10 },
    { id: 'M', sym: 'M', symText: 'M', label: 'Block mass', unit: 'kg', min: 0.5, max: 5, step: 0.1, val: 2 },
    { id: 'v', sym: 'v', symText: 'v', label: 'Bullet speed', unit: 'm/s', min: 50, max: 600, step: 5, val: 300, graph: true },
    { id: 'L', sym: 'L', symText: 'L', label: 'String length', unit: 'm', min: 0.5, max: 3, step: 0.1, val: 1.5 }];
    if (mode === 'through') l.push({ id: 'vo', sym: 'v<sub>out</sub>', symText: 'vout', label: 'Bullet speed coming out', unit: 'm/s', min: 0, max: 400, step: 5, val: 150 });
    if (mode === 'bounce') l.push({ id: 'vo', sym: 'v<sub>back</sub>', symText: 'vback', label: 'Bullet speed bouncing back', unit: 'm/s', min: 0, max: 300, step: 5, val: 100 });
    return l; },
  calc(v, mode){
    const m = v.m / 1000, M = v.M;
    let V, moving = M;
    if (mode === 'stick'){ V = m * v.v / (m + M); moving = m + M; }
    else if (mode === 'through'){ V = m * (v.v - v.vo) / M; }
    else { V = m * (v.v + v.vo) / M; }
    const h = V * V / (2 * G10), c = 1 - h / v.L, th = c >= -1 ? Math.acos(Math.max(-1, Math.min(1, c))) / DEG : 180;
    const K0 = 0.5 * m * v.v * v.v, Kb = mode === 'stick' ? 0 : 0.5 * m * v.vo * v.vo, K1 = 0.5 * moving * V * V + Kb;
    return { m, V, h, th, K0, K1, lost: 1 - K1 / K0, moving, bad: mode === 'through' && v.vo >= v.v, over: h > v.L };
  },
  dvs(){ return [
    { id: 'h', name: 'Height of the swing', short: 'h', sym: 'h', unit: 'm', f: d => d.h },
    { id: 'V', name: 'Block speed after the hit', short: 'V', sym: 'V', unit: 'm/s', f: d => d.V },
    { id: 'th', name: 'Swing angle', short: 'θ', sym: 'θ', unit: '°', f: d => d.th },
    { id: 'lost', name: 'Fraction of KE lost', short: 'KE lost', sym: 'KE lost', unit: '', f: d => d.lost }]; },
  work(v, d, mode){
    let h = '<h4>Stage 1 · The collision (fast): momentum is conserved</h4>';
    if (mode === 'stick') h += '<div class="eq">mv = (m + M)V → V = mv/(m + M) = (' + H.n(d.m, 'kg') + ')(' + H.iv('v') + ') / (' + H.n(d.m) + ' + ' + H.iv('M') + ') = <b>' + H.n(d.V, 'm/s') + '</b></div>';
    else if (mode === 'through') h += '<div class="eq">mv = mv<sub>out</sub> + MV → V = m(v − v<sub>out</sub>)/M = (' + H.n(d.m, 'kg') + ')(' + H.iv('v') + ' − ' + H.iv('vo') + ') / ' + H.iv('M') + ' = <b>' + H.n(d.V, 'm/s') + '</b></div>' +
      (d.bad ? '<div class="bad">The bullet can’t come out faster than it went in.</div>' : '');
    else h += '<div class="eq">mv = m(−v<sub>back</sub>) + MV → V = m(v + v<sub>back</sub>)/M = (' + H.n(d.m, 'kg') + ')(' + H.iv('v') + ' + ' + H.iv('vo') + ') / ' + H.iv('M') + ' = <b>' + H.n(d.V, 'm/s') + '</b></div>' +
      '<p class="note">Bouncing back gives the block a bigger push than sticking: the bullet’s Δp is bigger.</p>';
    h += '<p class="note">Energy is <b>not</b> conserved in this stage: ' + H.n(100 * d.lost) + '% of the bullet’s kinetic energy turns into heat and deformation.</p>' +
      '<h4>Stage 2 · The swing (slow): mechanical energy is conserved</h4><div class="eq">½' + (mode === 'stick' ? '(m + M)' : 'M') + 'V² = ' + (mode === 'stick' ? '(m + M)' : 'M') + 'gh → h = V²/(2g) = (' + H.n(d.V) + ')² / (2 × ' + H.g() + ') = <b>' + H.n(d.h, 'm') + '</b></div>' +
      '<p class="note">Momentum is not conserved here: the string and gravity are outside forces.</p>' +
      '<h4>Swing angle</h4><div class="eq">h = L(1 − cosθ) → θ = cos<sup>−1</sup>(1 − h/L) = cos<sup>−1</sup>(1 − ' + H.n(d.h) + '/' + H.iv('L') + ') = <b>' + (d.over ? 'past horizontal' : H.n(d.th, '°')) + '</b></div>' +
      (mode === 'stick' ? '<h4>Working backward (the real lab)</h4><div class="eq">Measure h → V = √(2gh) → v = (m + M)V/m. That’s how this device measures bullet speeds.</div>' : '');
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle('SIDE VIEW', 10, 18);
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt; const cyc = 4.5, tt = A.t % cyc, tHit = 0.8;
    const px = 250, py = 30, Lp = 70 * v.L, bw = 30 + v.M * 6, bh = 24 + v.M * 4;
    const thMax = Math.min(d.th, 175) * DEG, w = Math.sqrt(G10 / v.L);
    let th = 0; if (tt > tHit) th = thMax * Math.sin(w * (tt - tHit));
    const bx = px + Lp * Math.sin(th), by = py + Lp * Math.cos(th);
    ctx.fillStyle = '#111'; ctx.fillRect(px - 40, py - 8, 80, 6);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px - 10, py); ctx.lineTo(bx - 10, by); ctx.moveTo(px + 10, py); ctx.lineTo(bx + 10, by); ctx.stroke();
    ctx.fillStyle = '#c9a26b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(bx - bw / 2, by, bw, bh); ctx.strokeRect(bx - bw / 2, by, bw, bh);
    // bullet
    const yb = py + Lp + bh / 2; ctx.fillStyle = '#444';
    if (tt < tHit){ const xb = 20 + (px - bw / 2 - 20) * tt / tHit; ctx.fillRect(xb - 8, yb - 2, 10, 4); }
    else if (mode === 'stick'){ ctx.fillRect(bx - bw / 2 + 2, by + bh / 2 - 2, 6, 4); }
    else if (mode === 'through' && !d.bad){ const xb = px + bw / 2 + (tt - tHit) * 200 * v.vo / Math.max(v.v, 1); ctx.fillRect(xb, yb - 2, 10, 4); }
    else if (mode === 'bounce'){ const xb = px - bw / 2 - 10 - (tt - tHit) * 200 * v.vo / Math.max(v.v, 1); ctx.fillStyle = '#c43a00'; ctx.fillRect(xb, yb - 2, 10, 4); }
    // height marker
    const hp = Lp * (1 - Math.cos(thMax)); ctx.setLineDash([4, 4]); ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px - 120, py + Lp + bh - hp); ctx.lineTo(px + 120, py + Lp + bh - hp); ctx.moveTo(px - 120, py + Lp + bh); ctx.lineTo(px + 120, py + Lp + bh); ctx.stroke(); ctx.setLineDash([]);
    text('h = ' + fplain(d.h) + ' m', px - 124, py + Lp + bh - hp / 2 + 4, { align: 'right', font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' });
    text('bullet path ' + fplain(v.v) + ' m/s →', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // stage bars: KE before collision, after collision, PE at top
    panelTitle('ENERGY (J)', 420, 18);
    const vals = [['K bullet', d.K0, '#8a8a8a'], ['K after hit', d.K1, '#1546d6']], Em = d.K0 * 1.05, base = 260, hh = 210;
    vals.forEach(([l, q, col], i) => { const x = 425 + i * 85, hgt = hh * q / Em; ctx.fillStyle = col; ctx.fillRect(x, base - hgt, 55, hgt); ctx.strokeStyle = '#111'; ctx.strokeRect(x, base - hgt, 55, hgt); text(l, x + 27, base + 14, { align: 'center', font: '700 10px "IBM Plex Mono",monospace' }); text(fplain(q) + ' J', x + 27, base - hgt - 6, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); });
    ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(420, base); ctx.lineTo(590, base); ctx.stroke();
    text(fplain(100 * d.lost) + '% lost in the hit', 425, 300, { font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' });
  }
};
