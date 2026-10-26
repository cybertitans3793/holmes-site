// Electric Fields (AP 10.3, IB D.2): field vector map, field lines and the field at a point P as a vector sum, for one, two or three point charges. Null point for two charges.
const K = 8.99e9;
function charges(v, mode){ const s = (v.s || 12) / 100;
  if (mode === 'one') return [[0, 0, v.q1]];
  if (mode === 'two') return [[-s / 2, 0, v.q1], [s / 2, 0, v.q2]];
  const h = s * Math.sqrt(3) / 2; return [[-s / 2, -h / 3, v.q1], [s / 2, -h / 3, v.q2], [0, 2 * h / 3, v.q3]]; }
function fieldAt(Q, x, y){ let Ex = 0, Ey = 0; const parts = Q.map(([cx, cy, q]) => { const dx = x - cx, dy = y - cy, r2 = dx * dx + dy * dy, r = Math.sqrt(r2), E = K * q * 1e-9 / r2; const ex = E * dx / r, ey = E * dy / r; Ex += ex; Ey += ey; return { r, E: Math.abs(E), ex, ey, q }; }); return { Ex, Ey, E: Math.hypot(Ex, Ey), parts }; }
const SIM = {
  title: 'Electric Fields',
  hint: 'k = 8.99×10⁹ N·m²/C² · 1 nC = 10⁻⁹ C',
  modes: [{ id: 'one', label: 'One charge' }, { id: 'two', label: 'Two charges' }, { id: 'three', label: 'Three charges' }],
  ivs(mode){
    const q = (id, lab, val) => ({ id, sym: 'q<sub>' + id[1] + '</sub>', symText: id, label: lab, unit: 'nC', min: -10, max: 10, step: 0.5, val });
    const p = [{ id: 'px', sym: 'x<sub>P</sub>', symText: 'xP', label: 'Point P: x', unit: 'cm', min: -18, max: 18, step: 0.5, val: mode === 'one' ? 8 : 0 },
      { id: 'py', sym: 'y<sub>P</sub>', symText: 'yP', label: 'Point P: y', unit: 'cm', min: -13, max: 13, step: 0.5, val: mode === 'two' ? 6 : 0, graph: true }];
    if (mode === 'one') return [q('q1', 'Charge', 5)].concat(p);
    if (mode === 'two') return [q('q1', 'Left charge', 5), q('q2', 'Right charge', -5), { id: 's', sym: 's', symText: 's', label: 'Separation', unit: 'cm', min: 4, max: 24, step: 0.5, val: 12 }].concat(p);
    return [q('q1', 'Bottom-left charge', 5), q('q2', 'Bottom-right charge', 5), q('q3', 'Top charge', -5), { id: 's', sym: 's', symText: 's', label: 'Side of the triangle', unit: 'cm', min: 6, max: 24, step: 0.5, val: 14 }].concat(p);
  },
  presets: [{ label: 'Dipole', mode: 'two', v: { q1: 5, q2: -5 } }, { label: 'Like charges', mode: 'two', v: { q1: 5, q2: 5, px: 0, py: 0 } }, { label: 'Big and small', mode: 'two', v: { q1: 8, q2: 2 } }],
  calc(v, mode){
    const Q = charges(v, mode), f = fieldAt(Q, v.px / 100, v.py / 100); let nul = null;
    if (mode === 'two' && v.q1 * v.q2 !== 0){ const s = v.s / 100, a1 = Math.sqrt(Math.abs(v.q1)), a2 = Math.sqrt(Math.abs(v.q2));
      if (v.q1 * v.q2 > 0) nul = -s / 2 + s * a1 / (a1 + a2);
      else if (a1 !== a2){ const D = s * Math.min(a1, a2) / (Math.max(a1, a2) - Math.min(a1, a2)); nul = a1 < a2 ? -s / 2 - D : s / 2 + D; } }
    return { Q, ...f, ang: Math.atan2(f.Ey, f.Ex) / DEG, nul };
  },
  dvs(){ return [{ id: 'E', name: 'Field strength at P', short: 'E', sym: 'E<sub>P</sub>', unit: 'N/C', f: d => d.E }, { id: 'Ex', name: 'x-component at P', short: 'Ex', sym: 'E<sub>x</sub>', unit: 'N/C', f: d => d.Ex }, { id: 'Ey', name: 'y-component at P', short: 'Ey', sym: 'E<sub>y</sub>', unit: 'N/C', f: d => d.Ey }]; },
  work(v, d, mode){
    const rows = d.parts.map((p, i) => '<div class="eq">From q<sub>' + (i + 1) + '</sub> (' + p.q + ' nC): r = ' + H.n(p.r * 100, 'cm') + ', E = kq/r² = ' + H.n(p.E, 'N/C') + ' ' + (p.q > 0 ? 'away from' : 'toward') + ' it → (' + fnum(p.ex) + ', ' + fnum(p.ey) + ')</div>').join('');
    return '<h4>1 · Field from each charge: E = k|q|/r²</h4><div class="eq">Points <b>away</b> from + charges and <b>toward</b> − charges. It’s the force per coulomb on a small + test charge.</div>' + rows +
      '<h4>2 · Add as vectors (components)</h4><div class="eq">E<sub>x</sub> = ' + H.n(d.Ex, 'N/C') + ', E<sub>y</sub> = ' + H.n(d.Ey, 'N/C') + '</div>' +
      '<div class="eq">|E| = √(E<sub>x</sub>² + E<sub>y</sub>²) = <b>' + H.n(d.E, 'N/C') + '</b> at ' + H.n(d.ang, '°') + ' from +x</div>' +
      '<h4>3 · Force on a charge placed at P: F = qE</h4><div class="eq">An electron at P: F = (1.6×10⁻¹⁹)(' + fnum(d.E) + ') = ' + H.n(1.6e-19 * d.E, 'N') + ', <b>opposite</b> to E</div>' +
      (mode === 'two' ? '<h4>4 · Where is E = 0 on the axis?</h4><div class="eq">' + (d.nul === null ? 'Nowhere on the axis (other than infinitely far away).' : 'At x = <b>' + H.n(d.nul * 100, 'cm') + '</b>. ' + (v.q1 * v.q2 > 0 ? 'Like charges: between them, closer to the smaller one.' : 'Opposite charges: outside, beyond the smaller one.')) + '</div>' : '') +
      '<p class="note">Field lines: start on + and end on −, never cross, closer together = stronger field. Line count is proportional to charge.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const X = x => 195 + 900 * x, Y = y => 165 - 900 * y;   // 9 px per cm
    const key = mode + [v.q1, v.q2, v.q3, v.s].join();
    if (!A.img || A.key !== key){ A.key = key; const oc = document.createElement('canvas'); oc.width = 760; oc.height = 600; const o = oc.getContext('2d'); o.setTransform(2, 0, 0, 2, 0, 0);
      o.fillStyle = '#fff'; o.fillRect(10, 30, 375, 275);
      // vector map
      for (let gx = 25; gx < 380; gx += 26) for (let gy = 42; gy < 300; gy += 26){ const f = fieldAt(d.Q, (gx - 195) / 900, (165 - gy) / 900); if (!isFinite(f.E) || d.Q.some(([cx, cy]) => Math.hypot(gx - X(cx), gy - Y(cy)) < 14)) continue; const L = Math.min(11, 2.2 * Math.log10(1 + f.E / 20)), ux = f.Ex / f.E, uy = -f.Ey / f.E; o.strokeStyle = '#c9c9c9'; o.fillStyle = '#c9c9c9'; o.lineWidth = 1.2; o.beginPath(); o.moveTo(gx - ux * L, gy - uy * L); o.lineTo(gx + ux * L, gy + uy * L); o.stroke(); o.beginPath(); o.moveTo(gx + ux * L, gy + uy * L); o.lineTo(gx + ux * L - ux * 4 - uy * 3, gy + uy * L - uy * 4 + ux * 3); o.lineTo(gx + ux * L - ux * 4 + uy * 3, gy + uy * L - uy * 4 - ux * 3); o.fill(); }
      // field lines
      const tot = d.Q.reduce((a, c) => a + c[2], 0), fromPos = d.Q.some(c => c[2] > 0) ? 1 : -1;
      d.Q.forEach(([cx, cy, q]) => { if (q * fromPos <= 0) return; const n = Math.max(4, Math.round(3.2 * Math.abs(q))); for (let k = 0; k < n; k++){ const a = 2 * PI * (k + 0.5) / n; let x = X(cx) + 12 * Math.cos(a), y = Y(cy) + 12 * Math.sin(a); o.strokeStyle = '#7a3fb0'; o.lineWidth = 1.3; o.beginPath(); o.moveTo(x, y); let mid = null;
        for (let st = 0; st < 900; st++){ const f = fieldAt(d.Q, (x - 195) / 900, (165 - y) / 900); if (!isFinite(f.E) || f.E === 0) break; const ux = fromPos * f.Ex / f.E, uy = -fromPos * f.Ey / f.E; x += 2 * ux; y += 2 * uy; o.lineTo(x, y); if (st === 40) mid = [x, y, ux, uy]; if (x < 10 || x > 385 || y < 30 || y > 305) break; if (d.Q.some(([qx, qy]) => Math.hypot(x - X(qx), y - Y(qy)) < 9)) break; }
        o.stroke(); if (mid){ const [mx, my, ux, uy] = mid; o.fillStyle = '#7a3fb0'; o.beginPath(); o.moveTo(mx + ux * 5, my + uy * 5); o.lineTo(mx - uy * 4, my + ux * 4); o.lineTo(mx + uy * 4, my - ux * 4); o.fill(); } } });
      A.img = oc; }
    ctx.drawImage(A.img, 0, 0, 760, 600, 0, 0, 380, 300);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(10, 30, 375, 275);
    panelTitle('FIELD MAP (gray arrows) + FIELD LINES (purple)', 10, 18);
    d.Q.forEach(([cx, cy, q], i) => { ctx.fillStyle = q > 0 ? '#ff6a2b' : q < 0 ? '#1546d6' : '#bbb'; ctx.beginPath(); ctx.arc(X(cx), Y(cy), 9, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.stroke(); text(q > 0 ? '+' : q < 0 ? '−' : '0', X(cx), Y(cy) + 5, { align: 'center', font: '700 13px "Space Grotesk",sans-serif', col: '#fff' }); text('q' + (i + 1), X(cx) + 11, Y(cy) - 9, { font: '700 10px "IBM Plex Mono",monospace' }); });
    if (mode === 'two' && d.nul !== null){ ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(d.nul), Y(0), 6, 0, 7); ctx.stroke(); text('E = 0', X(d.nul) - 14, Y(0) + 20, { font: '700 10px "IBM Plex Mono",monospace', col: '#1e7d45' }); }
    // probe
    const px = X(v.px / 100), py = Y(v.py / 100), sc = E => Math.min(70, 14 * Math.log10(1 + E / 50));
    if (isFinite(d.E)){ const cols = ['#c43a00', '#1546d6', '#1e7d45']; d.parts.forEach((p, i) => { const L = sc(p.E), m = Math.hypot(p.ex, p.ey) || 1; arrow(px, py, px + L * p.ex / m, py - L * p.ey / m, cols[i], null, { w: 2, head: 6, dash: [4, 3] }); });
      const L = sc(d.E); arrow(px, py, px + L * d.Ex / d.E, py - L * d.Ey / d.E, '#111', 'E', { w: 3.5 }); }
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(px, py, 4, 0, 7); ctx.fill(); text('P', px - 12, py - 6, { font: '700 12px "Space Grotesk",sans-serif' });
    text('E at P = ' + fplain(d.E) + ' N/C', 14, 320, { font: '700 12px "Space Grotesk",sans-serif' });
    panelTitle('AT POINT P', 395, 18);
    d.parts.forEach((p, i) => text('from q' + (i + 1) + ': ' + fplain(p.E) + ' N/C', 400, 54 + i * 20, { font: '600 11px "IBM Plex Mono",monospace', col: ['#c43a00', '#1546d6', '#1e7d45'][i] }));
    text('net: ' + fplain(d.E) + ' N/C', 400, 54 + d.parts.length * 20 + 6, { font: '700 13px "Space Grotesk",sans-serif' });
    text('at ' + fplain(d.ang) + '° from +x', 400, 74 + d.parts.length * 20 + 6, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('dashed: each · black: net', 400, 300, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
