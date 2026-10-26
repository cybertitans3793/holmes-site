// Induction (AP 12.4; IB HL D.4): rod on rails (ε = BLv, Lenz), a loop moving through a field region (flux and emf graphs), and a generator coil (ε = NBAω sin ωt).
const SIM = {
  title: 'Induction',
  hint: 'Φ = BA cos θ · ε = −NΔΦ/Δt · ⊗ = B into the page',
  modes: [{ id: 'rail', label: 'Rod on rails' }, { id: 'loop', label: 'Loop through a field' }, { id: 'gen', label: 'Generator (IB HL)' }],
  ivs(mode){
    if (mode === 'loop') return [{ id: 'B', sym: 'B', symText: 'B', label: 'Field strength', unit: 'T', min: 0.1, max: 2, step: 0.05, val: 0.5 }, { id: 'a', sym: 'a', symText: 'a', label: 'Side of the square loop', unit: 'cm', min: 5, max: 20, step: 0.5, val: 10 }, { id: 'w', sym: 'w', symText: 'w', label: 'Width of the field region', unit: 'cm', min: 10, max: 40, step: 1, val: 25 }, { id: 'v', sym: 'v', symText: 'v', label: 'Loop speed', unit: 'm/s', min: 0.1, max: 2, step: 0.05, val: 0.5, graph: true }];
    if (mode === 'gen') return [{ id: 'N', sym: 'N', symText: 'N', label: 'Turns', unit: '', min: 1, max: 500, step: 1, val: 100, show: x => x.toFixed(0) }, { id: 'B', sym: 'B', symText: 'B', label: 'Field strength', unit: 'T', min: 0.01, max: 1, step: 0.01, val: 0.2 }, { id: 'A', sym: 'A', symText: 'A', label: 'Coil area', unit: 'cm²', min: 10, max: 400, step: 10, val: 100 }, { id: 'f', sym: 'f', symText: 'f', label: 'Rotation frequency', unit: 'Hz', min: 0.2, max: 60, step: 0.1, val: 1, graph: true }];
    return [{ id: 'B', sym: 'B', symText: 'B', label: 'Field strength (into page)', unit: 'T', min: 0.1, max: 2, step: 0.05, val: 0.5 }, { id: 'L', sym: 'L', symText: 'L', label: 'Rod length (rail spacing)', unit: 'm', min: 0.1, max: 1, step: 0.05, val: 0.4 }, { id: 'v', sym: 'v', symText: 'v', label: 'Rod speed (to the right)', unit: 'm/s', min: 0.5, max: 10, step: 0.5, val: 4, graph: true }, { id: 'R', sym: 'R', symText: 'R', label: 'Resistance of the circuit', unit: 'Ω', min: 0.5, max: 20, step: 0.5, val: 2 }];
  },
  presets: [{ label: 'Double the speed', mode: 'rail', v: { v: 8 } }, { label: 'Narrow field', mode: 'loop', v: { w: 10 } }, { label: 'Double the frequency', mode: 'gen', v: { f: 2 } }],
  calc(v, mode){
    if (mode === 'loop'){ const a = v.a / 100, w = v.w / 100, emf = v.B * a * v.v, tIn = a / v.v, tFull = Math.max(w, a) / v.v; return { a, w, emf, tIn, Phimax: v.B * a * Math.min(a, w), tTot: (w + a) / v.v }; }
    if (mode === 'gen'){ const om = 2 * PI * v.f, peak = v.N * v.B * (v.A / 1e4) * om; return { om, peak, rms: peak / Math.SQRT2, T: 1 / v.f }; }
    const emf = v.B * v.L * v.v, I = emf / v.R, F = v.B * I * v.L, P = F * v.v;
    return { emf, I, F, P, Pr: I * I * v.R };
  },
  dvs(mode){
    if (mode === 'loop') return [{ id: 'emf', name: 'emf while entering or leaving', short: 'ε', sym: 'ε', unit: 'V', f: d => d.emf }];
    if (mode === 'gen') return [{ id: 'peak', name: 'Peak emf', short: 'ε₀', sym: 'ε<sub>0</sub>', unit: 'V', f: d => d.peak }];
    return [{ id: 'emf', name: 'Induced emf', short: 'ε', sym: 'ε', unit: 'V', f: d => d.emf }, { id: 'I', name: 'Current', short: 'I', sym: 'I', unit: 'A', f: d => d.I }, { id: 'F', name: 'Force needed to keep it moving', short: 'F', sym: 'F', unit: 'N', f: d => d.F }, { id: 'P', name: 'Power you supply', short: 'P', sym: 'P', unit: 'W', f: d => d.P }];
  },
  work(v, d, mode){
    if (mode === 'loop') return '<h4>1 · Flux through the loop: Φ = BA (only the part inside the field)</h4><div class="eq">Entering: area inside grows at a × v per second → ΔΦ/Δt = Bav</div>' +
      '<h4>2 · emf while entering or leaving</h4><div class="eq">ε = Bav = (' + H.iv('B') + ')(' + fnum(d.a) + ' m)(' + H.iv('v') + ') = <b>' + H.n(d.emf, 'V') + '</b> for ' + H.n(d.tIn, 's') + '</div>' +
      '<div class="eq">' + (d.w >= d.a ? 'Fully inside: Φ = constant → <b>ε = 0</b> (no change, no emf), even though it’s in the field.' : 'The loop is wider than the field: some part is always entering while another leaves.') + '</div>' +
      '<h4>3 · Direction (Lenz’s law)</h4><div class="eq">Entering: flux into the page increases → induced current makes field <b>out of</b> the page → <b>counterclockwise</b>. Leaving: flux decreases → <b>clockwise</b>.</div>' +
      '<p class="note">Classic FRQ: sketch Φ vs t (ramp up, flat, ramp down) and ε vs t (block, zero, opposite block). ε is the slope of Φ.</p>';
    if (mode === 'gen') return '<h4>1 · Flux through a rotating coil: Φ = BA cos ωt</h4><div class="eq">ω = 2πf = ' + H.n(d.om, 'rad/s') + '</div>' +
      '<h4>2 · Induced emf: ε = NBAω sin ωt</h4><div class="eq">Peak ε₀ = NBAω = (' + v.N + ')(' + H.iv('B') + ')(' + fnum(v.A / 1e4) + ')(' + fnum(d.om) + ') = <b>' + H.n(d.peak, 'V') + '</b></div>' +
      '<div class="eq">emf is biggest when the coil is parallel to B (flux = 0 but changing fastest), zero when perpendicular (flux biggest).</div>' +
      '<p class="note">IB HL D.4: double the frequency → double the peak emf <i>and</i> half the period.</p>';
    return '<h4>1 · Motional emf</h4><div class="eq">The area of the circuit grows by Lv each second → ΔΦ/Δt = BLv → ε = BLv = (' + H.iv('B') + ')(' + H.iv('L') + ')(' + H.iv('v') + ') = <b>' + H.n(d.emf, 'V') + '</b></div>' +
      '<h4>2 · Current and direction</h4><div class="eq">I = ε/R = <b>' + H.n(d.I, 'A') + '</b>. Flux into the page increases → Lenz: the induced current makes field out of the page inside the loop → <b>counterclockwise</b>.</div>' +
      '<h4>3 · The magnetic force on the rod opposes the motion</h4><div class="eq">F = BIL = <b>' + H.n(d.F, 'N') + '</b> to the left. To keep v constant you must push with ' + fnum(d.F) + ' N.</div>' +
      '<h4>4 · Energy</h4><div class="eq">Your power Fv = ' + H.n(d.P, 'W') + ' = heating I²R = ' + H.n(d.Pr, 'W') + ' ✓ (that’s why Lenz’s law must be true)</div>' +
      '<p class="note">Double v → double ε, I and F → 4× the power. Let go and the rod slows down.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const cross = (x0, y0, x1, y1) => { ctx.strokeStyle = 'rgba(122,63,176,0.35)'; ctx.lineWidth = 1.2; for (let x = x0 + 12; x < x1; x += 26) for (let y = y0 + 12; y < y1; y += 26){ ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); } };
    if (mode === 'gen'){
      if (A.th === undefined || A.reset){ A.th = 0; A.tt = 0; } const wv = 2 * PI * Math.min(v.f, 1.2); A.th += wv * dt; A.tt += dt;
      panelTitle('COIL ROTATING IN A FIELD (side view)', 10, 18);
      ctx.fillStyle = '#c43a00'; ctx.fillRect(20, 70, 40, 200); ctx.fillStyle = '#1546d6'; ctx.fillRect(330, 70, 40, 200); for (let y = 90; y < 270; y += 36) arrow(64, y, 326, y, 'rgba(122,63,176,0.3)', null, { w: 1.5, head: 6 });
      const c = Math.cos(A.th), hw = 70 * Math.abs(c) + 4; ctx.strokeStyle = '#c47a3a'; ctx.lineWidth = 6; ctx.strokeRect(195 - hw, 100, 2 * hw, 140); ctx.fillStyle = 'rgba(196,122,58,0.15)'; ctx.fillRect(195 - hw, 100, 2 * hw, 140);
      text('Φ ∝ cos ωt', 195, 270, { align: 'center', font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('Φ AND ε vs TIME', 395, 18); const gx = 405, gw = 180, ph = A.th % (4 * PI);
      [[110, Math.cos, '#7a3fb0', 'Φ'], [240, Math.sin, '#c43a00', 'ε']].forEach(([gy, f, col, l]) => { ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 120; i++){ const a = 4 * PI * i / 120; i ? ctx.lineTo(gx + gw * i / 120, gy - 45 * f(a)) : ctx.moveTo(gx, gy - 45 * f(a)); } ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(gx + gw * ph / (4 * PI), gy - 45 * f(ph), 4, 0, 7); ctx.fill(); text(l, gx - 12, gy + 4, { font: '700 12px "IBM Plex Mono",monospace', col }); });
      text('ε₀ = ' + fplain(d.peak) + ' V', 400, 300, { font: '700 14px "Space Grotesk",sans-serif' });
      return;
    }
    if (mode === 'loop'){
      const sc = 4.5, a = v.a * sc, w = v.w * sc, fx0 = 150, total = (v.w + v.a) / 100, x0 = fx0 - a - 20;
      if (A.s === undefined || A.reset) A.s = 0; A.s = (A.s + dt / Math.max(1.5, total / v.v * 1.5)) % 1.2; const s = Math.min(1, A.s), lx = x0 + (w + a + 40) * s;
      panelTitle('SQUARE LOOP MOVING THROUGH A FIELD REGION', 10, 18);
      ctx.fillStyle = 'rgba(122,63,176,0.08)'; ctx.fillRect(fx0, 40, w, 200); cross(fx0, 40, fx0 + w, 240);
      const inside = Math.max(0, Math.min(lx + a, fx0 + w) - Math.max(lx, fx0)); ctx.fillStyle = 'rgba(255,106,43,0.3)'; ctx.fillRect(Math.max(lx, fx0), 140 - a / 2, inside, a);
      ctx.strokeStyle = '#c47a3a'; ctx.lineWidth = 4; ctx.strokeRect(lx, 140 - a / 2, a, a); arrow(lx + a + 6, 140, lx + a + 30, 140, COL.V, 'v', { w: 2.5 });
      const entering = lx + a > fx0 && lx < fx0 && lx + a < fx0 + w, leaving = lx < fx0 + w && lx + a > fx0 + w;
      text(entering ? 'entering: ε, current CCW' : leaving ? 'leaving: ε reversed, CW' : inside > 0 ? 'Φ constant: ε = 0' : 'outside: Φ = 0', 12, 262, { font: '700 12px "Space Grotesk",sans-serif', col: entering || leaving ? '#c43a00' : '#4a4a4a' });
      panelTitle('Φ AND ε vs POSITION', 395, 18);
      const gx = 405, gw = 180, X = q => gx + gw * q, phi = q => { const L = x0 + (w + a + 40) * q; return Math.max(0, Math.min(L + a, fx0 + w) - Math.max(L, fx0)) / Math.min(a, w); };
      [[110, phi, '#7a3fb0', 'Φ'], [240, q => (phi(Math.min(1, q + 0.002)) - phi(Math.max(0, q - 0.002))) / 0.004 * Math.min(a, w) / (w + a + 40) * 1.8, '#c43a00', 'ε']].forEach(([gy, f, col, l]) => { ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 200; i++){ const q = i / 200, y = gy - 55 * Math.max(-1.2, Math.min(1.2, f(q))); i ? ctx.lineTo(X(q), y) : ctx.moveTo(X(q), y); } ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(s), gy - 55 * Math.max(-1.2, Math.min(1.2, f(s))), 4, 0, 7); ctx.fill(); text(l, gx - 12, gy + 4, { font: '700 12px "IBM Plex Mono",monospace', col }); });
      text('ε (+ = counterclockwise)', 405, 300 - 10, { font: '600 9px "IBM Plex Mono",monospace', col: '#c43a00' }); text('ε = Bav = ' + fplain(d.emf) + ' V', 400, 314, { font: '700 13px "Space Grotesk",sans-serif' });
      return;
    }
    if (A.x === undefined || A.reset) A.x = 0; A.x = (A.x + v.v * 12 * dt) % 200; const rx = 120 + A.x, sp = 50 + 180 * v.L;
    panelTitle('ROD SLIDING ON RAILS (B into page)', 10, 18);
    const yT = 165 - sp / 2, yB = 165 + sp / 2; cross(20, yT - 10, 385, yB + 10);
    ctx.strokeStyle = '#555'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(40, yT); ctx.lineTo(385, yT); ctx.moveTo(40, yB); ctx.lineTo(385, yB); ctx.stroke();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(40, yT); ctx.lineTo(40, 140); ctx.moveTo(40, 190); ctx.lineTo(40, yB); ctx.stroke(); ctx.strokeRect(32, 140, 16, 50); text('R', 54, 170, { font: '700 12px "IBM Plex Mono",monospace' });
    ctx.fillStyle = 'rgba(255,106,43,0.18)'; ctx.fillRect(40, yT, rx - 40, sp);
    ctx.strokeStyle = '#c47a3a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(rx, yT - 6); ctx.lineTo(rx, yB + 6); ctx.stroke();
    arrow(rx + 6, 165, rx + 40, 165, COL.V, 'v', { w: 3 }); arrow(rx - 6, 145, rx - 6 - Math.min(60, 10 + d.F * 20), 145, COL.F, 'F_B', { w: 3 });
    arrow(rx - 10, yB - 20, rx - 10, yT + 20, '#1e7d45', null, { w: 2, head: 7 }); text('I', rx - 22, yT + 30, { font: '700 12px "IBM Plex Mono",monospace', col: '#1e7d45' }); text('CCW', 60, yT + 18, { font: '700 11px "IBM Plex Mono",monospace', col: '#1e7d45' });
    text('ε = ' + fplain(d.emf) + ' V  I = ' + fplain(d.I) + ' A', 12, 312, { font: '700 13px "Space Grotesk",sans-serif' });
    panelTitle('ENERGY CHECK', 395, 18); text('Fv = ' + fplain(d.P) + ' W', 400, 56, { font: '700 13px "Space Grotesk",sans-serif' }); text('I²R = ' + fplain(d.Pr) + ' W', 400, 80, { font: '700 13px "Space Grotesk",sans-serif' });
  }
};
