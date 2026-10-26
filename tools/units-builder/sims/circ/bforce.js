// Charges in Magnetic Fields (AP 12.2, IB D.3): circular motion F = qvB, mass spectrometer and q/m (IB), velocity selector with crossed E and B fields.
const E0 = 1.6e-19, U = 1.66e-27, PART = { p: ['proton', 1, 1.67e-27], e: ['electron', -1, 9.11e-31], a: ['alpha particle', 2, 6.64e-27] };
function crossGrid(x0, y0, x1, y1){ ctx.strokeStyle = 'rgba(122,63,176,0.3)'; ctx.lineWidth = 1.2; for (let x = x0 + 12; x < x1; x += 28) for (let y = y0 + 12; y < y1; y += 28){ ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); } }
const SIM = {
  title: 'Charges in Magnetic Fields',
  hint: 'e = 1.60×10⁻¹⁹ C · 1 u = 1.66×10⁻²⁷ kg · ⊗ = B into the page',
  modes: [{ id: 'circ', label: 'Circular motion' }, { id: 'sel', label: 'Velocity selector' }, { id: 'spec', label: 'Mass spectrometer (IB q/m)' }],
  opts: [{ id: 'pt', label: 'Particle', modes: ['circ', 'sel'], choices: [['p', 'Proton'], ['e', 'Electron'], ['a', 'Alpha']] }],
  ivs(mode){
    if (mode === 'sel') return [{ id: 'E', sym: 'E', symText: 'E', label: 'Electric field (between plates)', unit: 'kV/m', min: 1, max: 100, step: 1, val: 20 }, { id: 'B', sym: 'B', symText: 'B', label: 'Magnetic field', unit: 'T', min: 0.01, max: 0.5, step: 0.01, val: 0.1 }, { id: 'v', sym: 'v', symText: 'v', label: 'Particle speed', unit: '×10⁵ m/s', min: 0.5, max: 10, step: 0.1, val: 2, graph: true }];
    if (mode === 'spec') return [{ id: 'V', sym: 'V', symText: 'V', label: 'Accelerating voltage', unit: 'V', min: 100, max: 5000, step: 50, val: 1000 }, { id: 'B', sym: 'B', symText: 'B', label: 'Magnetic field', unit: 'T', min: 0.05, max: 1, step: 0.01, val: 0.2 }, { id: 'm2', sym: 'm<sub>2</sub>', symText: 'm2', label: 'Mass of the second ion (first is ¹²C⁺)', unit: 'u', min: 12, max: 40, step: 1, val: 14, graph: true }];
    return [{ id: 'v', sym: 'v', symText: 'v', label: 'Speed', unit: '×10⁶ m/s', min: 0.1, max: 10, step: 0.1, val: 1, graph: true }, { id: 'B', sym: 'B', symText: 'B', label: 'Magnetic field (into page)', unit: 'mT', min: 1, max: 1000, step: 1, val: 100 }];
  },
  presets: [{ label: 'Double the speed', mode: 'circ', v: { v: 2 } }, { label: 'Just right (v = E/B)', mode: 'sel', v: { E: 20, B: 0.1, v: 2 } }, { label: 'Too fast', mode: 'sel', v: { v: 4 } }],
  calc(v, mode, opt){
    if (mode === 'spec'){ const q = E0, m1 = 12 * U, m2 = v.m2 * U, r = m => Math.sqrt(2 * m * v.V / q) / v.B, r1 = r(m1), r2 = r(m2); return { r1, r2, sep: 2 * Math.abs(r2 - r1), v1: Math.sqrt(2 * q * v.V / m1), qm: 2 * v.V / (v.B * v.B * r1 * r1) }; }
    const [nm, z, m] = PART[opt.pt || 'p'], q = Math.abs(z) * E0;
    if (mode === 'sel'){ const vv = v.v * 1e5, FE = q * v.E * 1e3, FB = q * vv * v.B, v0 = v.E * 1e3 / v.B; return { nm, z, m, q, vv, FE, FB, v0, net: FB - FE }; }
    const vv = v.v * 1e6, B = v.B / 1000, F = q * vv * B, r = m * vv / (q * B), T = 2 * PI * m / (q * B);
    return { nm, z, m, q, vv, B, F, r, T, f: 1 / T, KE: 0.5 * m * vv * vv };
  },
  dvs(mode){
    if (mode === 'sel') return [{ id: 'net', name: 'Net force (+ = magnetic wins)', short: 'F_net', sym: 'F<sub>net</sub>', unit: 'N', f: d => d.net }];
    if (mode === 'spec') return [{ id: 'sep', name: 'Distance between the two landing spots', short: 'Δx', sym: 'Δx', unit: 'm', f: d => d.sep }, { id: 'r2', name: 'Radius for ion 2', short: 'r₂', sym: 'r<sub>2</sub>', unit: 'm', f: d => d.r2 }];
    return [{ id: 'r', name: 'Radius of the circle', short: 'r', sym: 'r', unit: 'm', f: d => d.r }, { id: 'T', name: 'Period', short: 'T', sym: 'T', unit: 's', f: d => d.T }, { id: 'F', name: 'Magnetic force', short: 'F', sym: 'F', unit: 'N', f: d => d.F }];
  },
  work(v, d, mode){
    if (mode === 'sel') return '<h4>1 · Two forces on a ' + d.nm + ' moving right</h4><div class="eq">Electric (down, from the + top plate): F<sub>E</sub> = qE = ' + H.n(d.FE, 'N') + ' &nbsp; Magnetic (up, right-hand rule): F<sub>B</sub> = qvB = ' + H.n(d.FB, 'N') + '</div>' +
      '<h4>2 · Goes straight only if they balance: qE = qvB → v = E/B</h4><div class="eq">v = (' + fnum(v.E * 1e3) + ')/(' + v.B + ') = <b>' + H.n(d.v0, 'm/s') + '</b>, for any charge or mass!</div>' +
      '<div class="eq">This particle: v = ' + H.n(d.vv, 'm/s') + ' → ' + (Math.abs(d.net) < 0.02 * d.FE ? '<b>goes straight through the slit</b>' : d.net > 0 ? 'too fast: magnetic force wins, it bends ' + (d.z > 0 ? 'up' : 'down') : 'too slow: electric force wins, it bends ' + (d.z > 0 ? 'down' : 'up')) + '</div>' +
      '<p class="note">An electron feels both forces reversed, so the same speed still passes. IB D.3: motion in perpendicular E and B fields.</p>';
    if (mode === 'spec') return '<h4>1 · Accelerate through V: qV = ½mv²</h4><div class="eq">¹²C⁺: v = √(2qV/m) = ' + H.n(d.v1, 'm/s') + '</div>' +
      '<h4>2 · Semicircle in B: qvB = mv²/r → r = mv/(qB) = (1/B)√(2mV/q)</h4><div class="eq">r₁ (¹²C⁺) = <b>' + H.n(d.r1 * 100, 'cm') + '</b> &nbsp; r₂ (' + v.m2 + ' u) = <b>' + H.n(d.r2 * 100, 'cm') + '</b></div>' +
      '<div class="eq">They land 2(r₂ − r₁) = <b>' + H.n(d.sep * 100, 'cm') + '</b> apart. r ∝ √m, so heavier ions curve less.</div>' +
      '<h4>3 · <span style="color:#7a3fb0">IB</span> Find q/m from the measured radius</h4><div class="eq">q/m = 2V/(B²r²) = ' + H.n(d.qm, 'C/kg') + ' (true for ¹²C⁺: ' + fnum(E0 / (12 * U)) + ')</div>';
    return '<h4>1 · The magnetic force is always perpendicular to v</h4><div class="eq">F = qvB = (' + fnum(d.q) + ')(' + fnum(d.vv) + ')(' + fnum(d.B) + ') = <b>' + H.n(d.F, 'N') + '</b>: it changes direction, never speed. Work = 0, KE stays ' + H.n(d.KE, 'J') + '.</div>' +
      '<h4>2 · It provides the centripetal force: qvB = mv²/r</h4><div class="eq">r = mv/(qB) = <b>' + H.n(d.r, 'm') + '</b></div>' +
      '<h4>3 · Period</h4><div class="eq">T = 2πr/v = 2πm/(qB) = <b>' + H.n(d.T, 's') + '</b>: doesn’t depend on speed!</div>' +
      '<p class="note">B into the page: a positive charge moving right is pushed up, so it circles counterclockwise; an electron circles clockwise. Double v → double r, same T.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
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
