// Charges in Magnetic Fields (AP 12.2, IB D.3): circular motion F = qvB, mass spectrometer and q/m (IB), velocity selector with crossed E and B fields.
//@include _schem.js
const E0 = 1.6e-19, U = 1.66e-27, PART = { p: ['proton', 1, 1.67e-27], e: ['electron', -1, 9.11e-31], a: ['alpha particle', 2, 6.64e-27] };
function crossGrid(x0, y0, x1, y1){ ctx.strokeStyle = 'rgba(122,63,176,0.3)'; ctx.lineWidth = 1.2; for (let x = x0 + 12; x < x1; x += 28) for (let y = y0 + 12; y < y1; y += 28){ ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); } }
const SIM = {
  title: 'Charges in Magnetic Fields',
  hint: 'e = 1.60×10⁻¹⁹ C · 1 u = 1.66×10⁻²⁷ kg · ⊗ = B into the page',
  modes: [{ id: 'circ', label: 'Circular motion' }, { id: 'sel', label: 'Velocity selector' }, { id: 'spec', label: 'Mass spectrometer (IB q/m)' }, { id: 'hall', label: 'Hall effect' }],
  opts: [{ id: 'pt', label: 'Particle', modes: ['circ', 'sel'], choices: [['p', 'Proton'], ['e', 'Electron'], ['a', 'Alpha']] }, { id: 'car', label: 'Charge carriers', modes: ['hall'], choices: [['e', 'Electrons (metal)'], ['p', 'Positive (holes)']] }],
  ivs(mode){
    if (mode === 'hall') return [{ id: 'vd', sym: 'v<sub>d</sub>', symText: 'vd', label: 'Drift speed of the carriers', unit: 'm/s', min: 1, max: 50, step: 1, val: 10, graph: true }, { id: 'B', sym: 'B', symText: 'B', label: 'Magnetic field (into page)', unit: 'T', min: 0.05, max: 1, step: 0.05, val: 0.5 }, { id: 'w', sym: 'w', symText: 'w', label: 'Width of the strip', unit: 'cm', min: 0.5, max: 3, step: 0.1, val: 1 }];
    if (mode === 'sel') return [{ id: 'E', sym: 'E', symText: 'E', label: 'Electric field (between plates)', unit: 'kV/m', min: 1, max: 100, step: 1, val: 20 }, { id: 'B', sym: 'B', symText: 'B', label: 'Magnetic field', unit: 'T', min: 0.01, max: 0.5, step: 0.01, val: 0.1 }, { id: 'v', sym: 'v', symText: 'v', label: 'Particle speed', unit: '×10⁵ m/s', min: 0.5, max: 10, step: 0.1, val: 2, graph: true }];
    if (mode === 'spec') return [{ id: 'V', sym: 'V', symText: 'V', label: 'Accelerating voltage', unit: 'V', min: 100, max: 5000, step: 50, val: 1000 }, { id: 'B', sym: 'B', symText: 'B', label: 'Magnetic field', unit: 'T', min: 0.05, max: 1, step: 0.01, val: 0.2 }, { id: 'm2', sym: 'm<sub>2</sub>', symText: 'm2', label: 'Mass of the second ion (first is ¹²C⁺)', unit: 'u', min: 12, max: 40, step: 1, val: 14, graph: true }];
    return [{ id: 'v', sym: 'v', symText: 'v', label: 'Speed', unit: '×10⁶ m/s', min: 0.1, max: 10, step: 0.1, val: 1, graph: true }, { id: 'B', sym: 'B', symText: 'B', label: 'Magnetic field (into page)', unit: 'mT', min: 1, max: 1000, step: 1, val: 100 }];
  },
  presets: [{ label: 'Double the speed', mode: 'circ', v: { v: 2 } }, { label: 'Just right (v = E/B)', mode: 'sel', v: { E: 20, B: 0.1, v: 2 } }, { label: 'Too fast', mode: 'sel', v: { v: 4 } }],
  calc(v, mode, opt){
    if (mode === 'hall'){ const el = (opt.car || 'e') === 'e', VH = v.vd * v.B * v.w / 100; return { el, VH, F: E0 * v.vd * v.B, EH: v.vd * v.B }; }
    if (mode === 'spec'){ const q = E0, m1 = 12 * U, m2 = v.m2 * U, r = m => Math.sqrt(2 * m * v.V / q) / v.B, r1 = r(m1), r2 = r(m2); return { r1, r2, sep: 2 * Math.abs(r2 - r1), v1: Math.sqrt(2 * q * v.V / m1), qm: 2 * v.V / (v.B * v.B * r1 * r1) }; }
    const [nm, z, m] = PART[opt.pt || 'p'], q = Math.abs(z) * E0;
    if (mode === 'sel'){ const vv = v.v * 1e5, FE = q * v.E * 1e3, FB = q * vv * v.B, v0 = v.E * 1e3 / v.B; return { nm, z, m, q, vv, FE, FB, v0, net: FB - FE }; }
    const vv = v.v * 1e6, B = v.B / 1000, F = q * vv * B, r = m * vv / (q * B), T = 2 * PI * m / (q * B);
    return { nm, z, m, q, vv, B, F, r, T, f: 1 / T, KE: 0.5 * m * vv * vv };
  },
  dvs(mode){
    if (mode === 'hall') return [{ id: 'VH', name: 'Hall voltage across the strip', short: 'ΔV_H', sym: 'ΔV<sub>H</sub>', unit: 'V', f: d => d.VH }];
    if (mode === 'sel') return [{ id: 'net', name: 'Net force (+ = magnetic wins)', short: 'F_net', sym: 'F<sub>net</sub>', unit: 'N', f: d => d.net }];
    if (mode === 'spec') return [{ id: 'sep', name: 'Distance between the two landing spots', short: 'Δx', sym: 'Δx', unit: 'm', f: d => d.sep }, { id: 'r2', name: 'Radius for ion 2', short: 'r₂', sym: 'r<sub>2</sub>', unit: 'm', f: d => d.r2 }];
    return [{ id: 'r', name: 'Radius of the circle', short: 'r', sym: 'r', unit: 'm', f: d => d.r }, { id: 'T', name: 'Period', short: 'T', sym: 'T', unit: 's', f: d => d.T }, { id: 'F', name: 'Magnetic force', short: 'F', sym: 'F', unit: 'N', f: d => d.F }];
  },
  work(v, d, mode, opt){
    if (mode === 'hall') return '<h4>1 · Current to the right, B into the page</h4><p class="st">' + (d.el ? 'In a metal the carriers are <b>electrons</b>, drifting <b>left</b> (opposite the current).' : 'Here the carriers are <b>positive</b>, drifting <b>right</b> with the current.') + ' Right-hand rule (F = qv × B): either way they are pushed toward the <b>top edge</b>.</p>' +
      '<h4>2 · Charge piles up until it stops more piling</h4><p class="st">The top edge becomes <b>' + (d.el ? 'negative' : 'positive') + '</b>, the bottom edge ' + (d.el ? 'positive' : 'negative') + '. That makes an electric field across the strip. It grows until the forces balance, then carriers go straight:</p>' + TEX`qE = qv_d B` +
      '<h4>3 · Hall voltage</h4>' + TEX`E = v_d B` + TEXA`E = ${M.n(d.EH, 'V/m')}` + TEX`\Delta V_H = E\,w` + TEX`\Delta V_H = v_d B w` + TEX`\Delta V_H = (${M.iv('vd')})(${M.iv('B')})(${M.n(v.w / 100, 'm')})` + TEXA`\Delta V_H = ${M.n(d.VH, 'V')}` +
      '<p class="note">Both kinds of carrier go to the <b>same</b> edge, so the <b>sign</b> of the Hall voltage tells you which kind of charge is moving. That is how we know current in metals is carried by electrons. A Hall probe uses this to measure B.</p>';
    if (mode === 'sel'){ const fast = Math.abs(d.net) < 0.02 * d.FE;
      return '<h4>1 · Two forces on a ' + d.nm + ' moving right</h4><p class="st">Electric (down, from the + top plate):</p>' + TEX`F_E = qE` + TEXA`F_E = ${M.n(d.FE, 'N')}` +
      '<p class="st">Magnetic (up, right-hand rule):</p>' + TEX`F_B = qvB` + TEXA`F_B = ${M.n(d.FB, 'N')}` +
      '<h4>2 · Goes straight only if they balance</h4>' + TEX`qE = qvB` + TEX`v = \frac{E}{B}` + TEX`v = \frac{${M.n(v.E * 1e3, 'V/m')}}{${M.n(v.B, 'T')}}` + TEXA`v = ${M.n(d.v0, 'm/s')}` +
      '<p class="st">That works for any charge or mass! This particle:</p>' + TEX`v = ${M.n(d.vv, 'm/s')}` +
      '<p class="st">' + (fast ? '<b>Goes straight through the slit</b>' : d.net > 0 ? 'Too fast: magnetic force wins, it bends ' + (d.z > 0 ? 'up' : 'down') : 'Too slow: electric force wins, it bends ' + (d.z > 0 ? 'down' : 'up')) + '.</p>' +
      '<p class="note">An electron feels both forces reversed, so the same speed still passes. IB D.3: motion in perpendicular E and B fields.</p>'; }
    if (mode === 'spec') return '<h4>1 · Accelerate through V</h4>' + TEX`qV = \frac{1}{2}mv^2` + TEX`v = \sqrt{\frac{2qV}{m}}` + '<p class="st">For ¹²C⁺:</p>' + TEX`v_1 = \sqrt{\frac{2(${M.n(E0)})(${M.iv('V')})}{${M.n(12 * U)}}}` + TEXA`v_1 = ${M.n(d.v1, 'm/s')}` +
      '<h4>2 · Semicircle in B</h4>' + TEX`qvB = \frac{mv^2}{r}` + TEX`r = \frac{mv}{qB}` + TEX`r = \frac{1}{B}\sqrt{\frac{2mV}{q}}` +
      '<p class="st">¹²C⁺:</p>' + TEX`r_1 = \frac{1}{${M.iv('B')}}\sqrt{\frac{2(${M.n(12 * U)})(${M.iv('V')})}{${M.n(E0)}}}` + TEXA`r_1 = ${M.n(d.r1 * 100, 'cm')}` +
      '<p class="st">' + v.m2 + ' u ion:</p>' + TEX`r_2 = \frac{1}{${M.iv('B')}}\sqrt{\frac{2(${M.n(v.m2 * U)})(${M.iv('V')})}{${M.n(E0)}}}` + TEXA`r_2 = ${M.n(d.r2 * 100, 'cm')}` +
      '<p class="st">They land twice the difference in radii apart:</p>' + TEX`\Delta x = 2(r_2 - r_1)` + TEX`\Delta x = 2(${M.n(d.r2 * 100)} - ${M.n(d.r1 * 100)})\,\text{cm}` + TEXA`\Delta x = ${M.n(d.sep * 100, 'cm')}` +
      '<p class="st">r ∝ √m, so heavier ions curve less.</p>' +
      '<h4>3 · <span style="color:#7a3fb0">IB</span> Find q/m from the measured radius</h4>' + TEX`\frac{q}{m} = \frac{2V}{B^2 r^2}` + TEX`\frac{q}{m} = \frac{2(${M.iv('V')})}{(${M.iv('B')})^2(${M.n(d.r1, 'm')})^2}` + TEXA`\frac{q}{m} = ${M.n(d.qm, 'C/kg')}` +
      '<p class="st">True value for ¹²C⁺: ' + fnum(E0 / (12 * U)) + ' C/kg.</p>';
    return '<h4>1 · The magnetic force is always perpendicular to v</h4>' + TEX`F = qvB` + TEX`F = (${M.n(d.q)})(${M.n(d.vv)})(${M.n(d.B)})` + TEXA`F = ${M.n(d.F, 'N')}` +
      '<p class="st">It changes direction, never speed. Work = 0, KE stays ' + H.n(d.KE, 'J') + '.</p>' +
      '<h4>2 · It provides the centripetal force</h4>' + TEX`qvB = \frac{mv^2}{r}` + TEX`r = \frac{mv}{qB}` + TEX`r = \frac{(${M.n(d.m)})(${M.n(d.vv)})}{(${M.n(d.q)})(${M.n(d.B)})}` + TEXA`r = ${M.n(d.r, 'm')}` +
      '<h4>3 · Period</h4>' + TEX`T = \frac{2\pi r}{v}` + TEX`T = \frac{2\pi m}{qB}` + TEX`T = \frac{2\pi(${M.n(d.m)})}{(${M.n(d.q)})(${M.n(d.B)})}` + TEXA`T = ${M.n(d.T, 's')}` + '<p class="st">It doesn’t depend on speed!</p>' +
      '<p class="note">B into the page: a positive charge moving right is pushed up, so it circles counterclockwise; an electron circles clockwise. Double v → double r, same T.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'hall'){
      panelTitle('HALL EFFECT: CURRENT IN A STRIP, B INTO THE PAGE', 10, 18); crossGrid(12, 26, 388, 316);
      const x0 = 40, x1 = 360, yT = 110, yB = 230; ctx.fillStyle = 'rgba(200,170,120,0.55)'; ctx.fillRect(x0, yT, x1 - x0, yB - yT); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(x0, yT, x1 - x0, yB - yT);
      arrow(x0 - 30, yB + 40, x0 + 40, yB + 40, '#e8a200', 'I (conventional)', { w: 3, ly: 14 });
      const n = 18, el = d.el, sp = (el ? -1 : 1) * 40, col = el ? '#1546d6' : '#c43a00';
      for (let i = 0; i < n; i++){ const fx = ((i * 37 + t * sp) % (x1 - x0) + (x1 - x0)) % (x1 - x0), x = x0 + fx, lane = (i * 53 % 100) / 100, y = yB - 12 - lane * (yB - yT - 40) - Math.min(14, 6 + fx * 0.02) * 0; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; text(el ? '−' : '+', x, y + 3, { align: 'center', font: '700 8px "IBM Plex Mono",monospace', col: '#fff' }); }
      for (let x = x0 + 12; x < x1; x += 20){ text(el ? '−' : '+', x, yT + 12, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: col }); text(el ? '+' : '−', x, yB - 4, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: el ? '#c43a00' : '#1546d6' }); }
      const xc = 200; arrow(xc + 70, yT + 60, xc + 70, yT + 30, '#7a3fb0', 'F_B', { w: 2.5, lx: 6 }); arrow(xc + 110, yT + 30, xc + 110, yT + 60, '#1e7d45', 'F_E', { w: 2.5, lx: 6 }); arrow(xc - 60, yT + 60, xc - 60 + (el ? -36 : 36), yT + 60, col, 'v_d', { w: 2.5, ly: -8 });
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.fillRect(250, 34, 110, 44); ctx.strokeRect(250, 34, 110, 44); text('voltmeter (top − bottom)', 254, 48, { font: '600 8px "IBM Plex Mono",monospace' }); text((el ? '−' : '+') + fplain(d.VH) + ' V', 305, 70, { align: 'center', font: '700 14px "IBM Plex Mono",monospace', col: el ? '#1546d6' : '#c43a00' });
      wire([[300, 78], [300, yT]]); wire([[362, 56], [372, 56], [372, yB + 14], [300, yB + 14], [300, yB]]);
      panelTitle('WHAT TO NOTICE', 395, 18); text('carriers pushed to: TOP edge', 400, 52, { font: '700 11px "IBM Plex Mono",monospace' }); text('top edge is: ' + (el ? 'negative' : 'positive'), 400, 70, { font: '700 11px "IBM Plex Mono",monospace', col: col }); text('ΔV_H = v_d B w = ' + fplain(d.VH) + ' V', 400, 100, { font: '700 11px "IBM Plex Mono",monospace' });
      text('flip the carrier type:', 400, 140, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('same edge, opposite sign', 400, 154, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    if (mode === 'sel'){
      panelTitle('VELOCITY SELECTOR (B into page, E down)', 10, 18);
      ctx.fillStyle = '#c43a00'; ctx.fillRect(70, 70, 260, 8); ctx.fillStyle = '#1546d6'; ctx.fillRect(70, 252, 260, 8); crossGrid(70, 78, 330, 252); for (let x = 90; x < 330; x += 40) arrow(x, 84, x, 112, 'rgba(196,58,0,0.35)', null, { w: 1.5, head: 6 });
      ctx.fillStyle = '#111'; ctx.fillRect(355, 70, 8, 85); ctx.fillRect(355, 175, 8, 85); text('slit', 368, 168, { font: '600 10px "IBM Plex Mono",monospace' });
      const sgn = d.z > 0 ? 1 : -1, ay = sgn * (d.FE - d.FB) / d.m; let x = 20, y = 165, vy = 0; const vx = d.vv, sx = 340 / 0.3; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y);
      const dtt = 0.3 / vx / 200; for (let i = 0; i < 200; i++){ const inside = x > 70 && x < 330; vy += (inside ? ay : 0) * dtt; x += vx * dtt * sx; y += vy * dtt * sx; ctx.lineTo(x, y); if (y < 80 || y > 250) break; } ctx.stroke();
      const sc = 40 / Math.max(d.FE, d.FB); arrow(200, 165, 200, 165 + sgn * d.FE * sc, '#c43a00', 'F_E', { w: 3 }); arrow(210, 165, 210, 165 - sgn * d.FB * sc, '#7a3fb0', 'F_B', { w: 3 });
      text('v needed = E/B = ' + fplain(d.v0) + ' m/s', 12, 312, { font: '700 13px "Space Grotesk",sans-serif' });
      panelTitle('FORCES', 395, 18); text('F_E = ' + fplain(d.FE) + ' N', 400, 56, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' }); text('F_B = ' + fplain(d.FB) + ' N', 400, 80, { font: '700 13px "Space Grotesk",sans-serif', col: '#7a3fb0' });
      return;
    }
    if (mode === 'spec'){
      panelTitle('MASS SPECTROMETER (B into page)', 10, 18);
      const rmax = Math.max(d.r1, d.r2), sc = 140 / rmax, x0 = 40, y0 = 290; crossGrid(20, 30, 380, 290); ctx.fillStyle = '#111'; ctx.fillRect(20, y0, 360, 4);
      [[d.r1, '#1546d6', '¹²C⁺'], [d.r2, '#c43a00', v.m2 + ' u']].forEach(([r, c, l]) => { ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x0 + r * sc, y0, r * sc, PI, 2 * PI); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x0 + 2 * r * sc, y0, 4, 0, 7); ctx.fill(); text(l, x0 + 2 * r * sc - 8, y0 + 18, { font: '700 10px "IBM Plex Mono",monospace', col: c }); });
      arrow(x0, y0 + 30, x0, y0 + 2, '#111', null, { w: 2 }); text('ions in', x0 + 4, y0 + 24, { font: '600 9px "IBM Plex Mono",monospace' });
      panelTitle('LANDING SPOTS', 395, 18); text('r₁ = ' + fplain(d.r1 * 100) + ' cm', 400, 56, { font: '700 13px "Space Grotesk",sans-serif', col: '#1546d6' }); text('r₂ = ' + fplain(d.r2 * 100) + ' cm', 400, 80, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' }); text('apart: ' + fplain(d.sep * 100) + ' cm', 400, 108, { font: '700 13px "Space Grotesk",sans-serif' });
      return;
    }
    panelTitle('CHARGE IN A UNIFORM FIELD (⊗ into page)', 10, 18);
    crossGrid(10, 30, 385, 305); const R = 110, cx = 195, cy = 168, cw = d.z > 0 ? -1 : 1;   // screen: CCW for + (y down → negative angle rate)
    if (A.a === undefined || A.reset) A.a = PI / 2; A.a += cw * (2 * PI / 3) * dt;
    ctx.strokeStyle = '#1546d6'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    const px = cx + R * Math.cos(A.a), py = cy + R * Math.sin(A.a), tx = -Math.sin(A.a) * cw, ty = Math.cos(A.a) * cw;
    ctx.fillStyle = d.z > 0 ? '#ff6a2b' : '#1546d6'; ctx.beginPath(); ctx.arc(px, py, 8, 0, 7); ctx.fill(); text(d.z > 0 ? '+' : '−', px, py + 4, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#fff' });
    arrow(px, py, px + tx * 45, py + ty * 45, COL.V, 'v', { w: 3 }); arrow(px, py, px + (cx - px) * 0.35, py + (cy - py) * 0.35, COL.F, 'F', { w: 3 });
    text('r = ' + fplain(d.r) + ' m (drawn to fit)', 12, 312, { font: '700 13px "Space Grotesk",sans-serif' });
    panelTitle(d.nm.toUpperCase(), 395, 18); text('F = ' + fplain(d.F) + ' N', 400, 56, { font: '700 13px "Space Grotesk",sans-serif' }); text('T = ' + fplain(d.T) + ' s', 400, 80, { font: '700 13px "Space Grotesk",sans-serif' }); text(d.z > 0 ? 'counterclockwise' : 'clockwise', 400, 104, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
