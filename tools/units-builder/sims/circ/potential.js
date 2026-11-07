// Electric Potential (AP 10.4–10.5, 10.7; IB HL D.2): equipotential map and work W = qΔV, potential energy of a system of charges, release from rest (energy conservation), charged conducting sphere E(r) and V(r).
const K = 8.99e9;
function Vat(Q, x, y){ return Q.reduce((a, [cx, cy, q]) => a + K * q * 1e-9 / Math.hypot(x - cx, y - cy), 0); }
const SIM = {
  title: 'Electric Potential',
  hint: 'k = 8.99×10⁹ N·m²/C² · V = 0 at infinity',
  modes: [{ id: 'map', label: 'Equipotentials & work' }, { id: 'energy', label: 'Energy of a system' }, { id: 'release', label: 'Release from rest' }, { id: 'sphere', label: 'Charged conducting sphere' }],
  ivs(mode){
    if (mode === 'energy') return [
      { id: 'q1', sym: 'q<sub>1</sub>', symText: 'q1', label: 'Charge 1', unit: 'nC', min: -10, max: 10, step: 0.5, val: 4 },
      { id: 'q2', sym: 'q<sub>2</sub>', symText: 'q2', label: 'Charge 2', unit: 'nC', min: -10, max: 10, step: 0.5, val: 4 },
      { id: 'q3', sym: 'q<sub>3</sub>', symText: 'q3', label: 'Charge 3', unit: 'nC', min: -10, max: 10, step: 0.5, val: -4 },
      { id: 's', sym: 's', symText: 's', label: 'Side of the triangle', unit: 'cm', min: 2, max: 30, step: 0.5, val: 10, graph: true }];
    if (mode === 'release') return [
      { id: 'Q', sym: 'Q', symText: 'Q', label: 'Fixed charge', unit: 'nC', min: 10, max: 500, step: 10, val: 200 },
      { id: 'q', sym: 'q', symText: 'q', label: 'Charge on the bead (− = attracted)', unit: 'nC', min: -200, max: 200, step: 5, val: 50 },
      { id: 'm', sym: 'm', symText: 'm', label: 'Mass of the bead', unit: 'g', min: 0.1, max: 10, step: 0.1, val: 1 },
      { id: 'r1', sym: 'r<sub>1</sub>', symText: 'r1', label: 'Released from rest at', unit: 'cm', min: 2, max: 50, step: 0.5, val: 5 },
      { id: 'r2', sym: 'r<sub>2</sub>', symText: 'r2', label: 'Speed found at', unit: 'cm', min: 2, max: 100, step: 0.5, val: 20, graph: true }];
    if (mode === 'sphere') return [
      { id: 'Q', sym: 'Q', symText: 'Q', label: 'Charge on the sphere', unit: 'nC', min: -50, max: 50, step: 1, val: 20 },
      { id: 'R', sym: 'R', symText: 'R', label: 'Sphere radius', unit: 'cm', min: 5, max: 30, step: 0.5, val: 10 },
      { id: 'r', sym: 'r', symText: 'r', label: 'Distance from the center', unit: 'cm', min: 0, max: 60, step: 0.5, val: 20, graph: true }];
    return [
      { id: 'q1', sym: 'q<sub>1</sub>', symText: 'q1', label: 'Left charge', unit: 'nC', min: -10, max: 10, step: 0.5, val: 5 },
      { id: 'q2', sym: 'q<sub>2</sub>', symText: 'q2', label: 'Right charge', unit: 'nC', min: -10, max: 10, step: 0.5, val: -5 },
      { id: 's', sym: 's', symText: 's', label: 'Separation', unit: 'cm', min: 4, max: 24, step: 0.5, val: 12 },
      { id: 'xA', sym: 'x<sub>A</sub>', symText: 'xA', label: 'Point A: x (y = 6 cm)', unit: 'cm', min: -18, max: 18, step: 0.5, val: -8 },
      { id: 'xB', sym: 'x<sub>B</sub>', symText: 'xB', label: 'Point B: x (y = 6 cm)', unit: 'cm', min: -18, max: 18, step: 0.5, val: 8, graph: true },
      { id: 'qt', sym: 'q<sub>test</sub>', symText: 'qtest', label: 'Charge moved from A to B', unit: 'nC', min: -5, max: 5, step: 0.5, val: 1 }];
  },
  presets: [{ label: 'Like charges', mode: 'map', v: { q1: 5, q2: 5 } }, { label: 'Move an electron-like charge', mode: 'map', v: { qt: -1 } }, { label: 'Attracted bead', mode: 'release', v: { q: -50, r1: 30, r2: 5 } }],
  calc(v, mode){
    if (mode === 'energy'){ const s = v.s / 100, q = [v.q1, v.q2, v.q3].map(c => c * 1e-9), U12 = K * q[0] * q[1] / s, U13 = K * q[0] * q[2] / s, U23 = K * q[1] * q[2] / s; return { U12, U13, U23, U: U12 + U13 + U23, s }; }
    if (mode === 'release'){ const Q = v.Q * 1e-9, q = v.q * 1e-9, m = v.m / 1000, r1 = v.r1 / 100, r2 = v.r2 / 100, U1 = K * Q * q / r1, U2 = K * Q * q / r2, KE = U1 - U2; return { U1, U2, KE, v: KE >= 0 ? Math.sqrt(2 * KE / m) : NaN, ok: KE >= 0, Vf1: K * Q / r1, Vf2: K * Q / r2 }; }
    if (mode === 'sphere'){ const Q = v.Q * 1e-9, R = v.R / 100, r = v.r / 100, inside = r < R; return { inside, E: inside ? 0 : K * Q / (r * r), V: inside ? K * Q / R : K * Q / r, Vsurf: K * Q / R, Esurf: K * Q / (R * R) }; }
    const s = v.s / 100, Q = [[-s / 2, 0, v.q1], [s / 2, 0, v.q2]], yA = 0.06, VA = Vat(Q, v.xA / 100, yA), VB = Vat(Q, v.xB / 100, yA), q = v.qt * 1e-9;
    return { Q, VA, VB, dV: VB - VA, Wf: -q * (VB - VA), Wext: q * (VB - VA), Eavg: Math.abs(v.xB - v.xA) > 0.1 ? -(VB - VA) / ((v.xB - v.xA) / 100) : NaN };
  },
  dvs(mode){
    if (mode === 'energy') return [{ id: 'U', name: 'Total potential energy of the system', short: 'U', sym: 'U', unit: 'J', f: d => d.U }];
    if (mode === 'release') return [{ id: 'v', name: 'Speed at r₂', short: 'v', sym: 'v', unit: 'm/s', f: d => d.v }, { id: 'KE', name: 'Kinetic energy gained', short: 'KE', sym: 'KE', unit: 'J', f: d => d.KE }];
    if (mode === 'sphere') return [{ id: 'E', name: 'Field strength at r', short: 'E', sym: 'E', unit: 'N/C', f: d => d.E }, { id: 'V', name: 'Potential at r', short: 'V', sym: 'V', unit: 'V', f: d => d.V }];
    return [{ id: 'VB', name: 'Potential at B', short: 'V_B', sym: 'V<sub>B</sub>', unit: 'V', f: d => d.VB }, { id: 'dV', name: 'Potential difference V_B − V_A', short: 'ΔV', sym: 'ΔV', unit: 'V', f: d => d.dV }, { id: 'Wext', name: 'Work by you to move it A → B', short: 'W_ext', sym: 'W<sub>ext</sub>', unit: 'J', f: d => d.Wext }];
  },
  work(v, d, mode){
    if (mode === 'energy') return '<h4>1 · Potential energy of a pair: U = kq<sub>1</sub>q<sub>2</sub>/r (sign included)</h4>' + TEX`U_{12} = \frac{k\,q_1 q_2}{r}` +
      TEX`U_{12} = \frac{(8.99\times10^{9})(${M.iv('q1', 1e-9)})(${M.iv('q2', 1e-9)})}{${M.iv('s', 0.01)}}` + TEXA`U_{12} = ${M.n(d.U12, 'J')}` +
      TEX`U_{13} = \frac{(8.99\times10^{9})(${M.iv('q1', 1e-9)})(${M.iv('q3', 1e-9)})}{${M.iv('s', 0.01)}}` + TEXA`U_{13} = ${M.n(d.U13, 'J')}` +
      TEX`U_{23} = \frac{(8.99\times10^{9})(${M.iv('q2', 1e-9)})(${M.iv('q3', 1e-9)})}{${M.iv('s', 0.01)}}` + TEXA`U_{23} = ${M.n(d.U23, 'J')}` +
      '<h4>2 · System energy = sum over every pair (it’s a scalar)</h4>' + TEX`U = U_{12} + U_{13} + U_{23}` + TEX`U = ${M.n(d.U12)} + ${M.p(d.U13)} + ${M.p(d.U23)}` + TEXA`U = ${M.n(d.U, 'J')}` +
      '<h4>3 · Meaning: work to assemble the charges from infinitely far apart</h4><p class="st">Bring q₁: 0. Bring q₂: U<sub>12</sub>. Bring q₃: U<sub>13</sub> + U<sub>23</sub>. Total = U.</p>' +
      '<p class="st">' + (d.U > 0 ? 'U &gt; 0: you had to push them together; let go and they fly apart.' : d.U < 0 ? 'U &lt; 0: the system is bound; you’d have to do work to pull it apart.' : 'U = 0') + '</p>' +
      '<p class="note">Halve the side → each pair energy doubles (1/r, not 1/r²).</p>';
    if (mode === 'release') return '<h4>1 · Only the electric force does work: energy is conserved</h4>' + TEX`K_1 + U_1 = K_2 + U_2` + '<p class="st">With K<sub>1</sub> = 0 and U = kQq/r:</p>' +
      TEX`U_1 = \frac{k\,Q\,q}{r_1}` + TEX`U_1 = \frac{(8.99\times10^{9})(${M.iv('Q', 1e-9)})(${M.iv('q', 1e-9)})}{${M.iv('r1', 0.01)}}` + TEXA`U_1 = ${M.n(d.U1, 'J')}` +
      TEX`U_2 = \frac{k\,Q\,q}{r_2}` + TEX`U_2 = \frac{(8.99\times10^{9})(${M.iv('Q', 1e-9)})(${M.iv('q', 1e-9)})}{${M.iv('r2', 0.01)}}` + TEXA`U_2 = ${M.n(d.U2, 'J')}` +
      (d.ok ? TEX`K_2 = U_1 - U_2` + TEX`K_2 = ${M.n(d.U1)} - ${M.p(d.U2)}` + TEXA`K_2 = ${M.n(d.KE, 'J')}` +
        TEX`v = \sqrt{\frac{2K}{m}}` + TEX`v = \sqrt{\frac{2 \times ${M.n(d.KE)}}{${M.iv('m', 1e-3)}}}` + TEXA`v = ${M.n(d.v, 'm/s')}` : '<div class="bad">U<sub>2</sub> &gt; U<sub>1</sub>: it would need negative KE. Released from rest, it never gets to r<sub>2</sub> (it moves the other way).</div>') +
      '<h4>2 · Same thing with potential: ΔK = −qΔV</h4>' + TEX`\Delta K = -q\,\Delta V` + TEX`V_1 = \frac{k\,Q}{r_1} = ${M.n(d.Vf1, 'V')}`.replace('','') + TEX`V_2 = \frac{k\,Q}{r_2}` + TEXA`V_2 = ${M.n(d.Vf2, 'V')}` +
      '<p class="st">' + (v.q > 0 ? 'Positive charges fall from high V to low V.' : 'Negative charges “fall” from low V to high V.') + '</p>' +
      '<p class="note">Use energy, not F = ma: the force changes with distance, so the acceleration isn’t constant.</p>';
    if (mode === 'sphere') return '<h4>1 · Conductor in equilibrium: charge sits on the surface</h4><p class="st">Inside (r &lt; R), V is the same everywhere:</p>' + TEXA`E = ${M.n(0, 'N/C')}` +
      TEX`V = \frac{k\,Q}{R}` + TEX`V = \frac{(8.99\times10^{9})(${M.iv('Q', 1e-9)})}{${M.iv('R', 0.01)}}` + TEXA`V = ${M.n(d.Vsurf, 'V')}` +
      '<h4>2 · Outside: acts like a point charge at the center</h4>' + TEX`E = \frac{k\,Q}{r^2}` + TEX`V = \frac{k\,Q}{r}` + '<p class="st">At the surface:</p>' + TEX`E = \frac{k\,Q}{R^2}` + TEXA`E = ${M.n(d.Esurf, 'N/C')}` +
      '<h4>3 · At r = ' + H.iv('r') + (d.inside ? ' (inside)' : ' (outside)') + '</h4>' + TEXA`E = ${M.n(d.E, 'N/C')}` + TEXA`V = ${M.n(d.V, 'V')}` +
      '<p class="note">E = −ΔV/Δr: where V is flat (inside), E = 0. The surface is an equipotential, so E meets it at right angles. Hollow or solid, the answer is the same.</p>';
    return '<h4>1 · Potential is a scalar: V = Σ kq/r (keep the signs)</h4>' + TEX`V = \sum \frac{k\,q}{r}` + TEXA`V_A = ${M.n(d.VA, 'V')}` + TEXA`V_B = ${M.n(d.VB, 'V')}` +
      TEX`\Delta V = V_B - V_A` + TEX`\Delta V = ${M.n(d.VB)} - ${M.p(d.VA)}` + TEXA`\Delta V = ${M.n(d.dV, 'V')}` +
      '<h4>2 · Work to move q = ' + H.iv('qt') + ' from A to B (slowly)</h4>' + TEX`W_{\text{you}} = q\,\Delta V` + TEX`W_{\text{you}} = (${M.iv('qt', 1e-9)})(${M.p(d.dV)})` + TEXA`W_{\text{you}} = ${M.n(d.Wext, 'J')}` +
      TEX`W_{\text{field}} = -q\,\Delta V` + TEXA`W_{\text{field}} = ${M.n(d.Wf, 'J')}` + TEX`\Delta U = q\,\Delta V` + TEXA`\Delta U = ${M.n(d.Wext, 'J')}` + '<p class="st">The path doesn’t matter, only the start and end.</p>' +
      '<h4>3 · Field from potential: E = −ΔV/Δx</h4>' + (isNaN(d.Eavg) ? '<p class="st">A and B are at the same x, so there is no Δx to average over.</p>' : TEX`E_x \approx -\frac{\Delta V}{\Delta x}` + TEXA`E_x \approx ${M.n(d.Eavg, 'V/m')}`) +
      '<p class="st">E points from high V to low V, at right angles to the equipotentials.</p>' +
      '<p class="note">Moving along an equipotential takes no work. Close-together equipotentials = strong field.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const small = (s, x, y, c) => text(s, x, y, { font: '600 10px "IBM Plex Mono",monospace', col: c || '#4a4a4a' });
    if (mode === 'energy'){
      panelTitle('ASSEMBLE THREE CHARGES (equilateral triangle)', 10, 18);
      const s = 60 + 6 * v.s, cx = 195, cy = 175, pts = [[cx - s / 2, cy + s * 0.29], [cx + s / 2, cy + s * 0.29], [cx, cy - s * 0.58]], qs = [v.q1, v.q2, v.q3];
      const pair = (i, j, U) => { ctx.strokeStyle = U > 0 ? '#c43a00' : U < 0 ? '#1546d6' : '#bbb'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...pts[i]); ctx.lineTo(...pts[j]); ctx.stroke(); const mx = (pts[i][0] + pts[j][0]) / 2, my = (pts[i][1] + pts[j][1]) / 2, ox = mx - cx, oy = my - (cy - s * 0.0), on = Math.hypot(ox, oy) || 1; text(fplain(U) + ' J', mx + 26 * ox / on, my + 26 * oy / on + 4, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: U > 0 ? '#c43a00' : '#1546d6' }); };
      pair(0, 1, d.U12); pair(0, 2, d.U13); pair(1, 2, d.U23);
      pts.forEach(([x, y], i) => { const q = qs[i]; ctx.fillStyle = q > 0 ? '#ff6a2b' : q < 0 ? '#1546d6' : '#bbb'; ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.stroke(); text(q > 0 ? '+' : q < 0 ? '−' : '0', x, y + 5, { align: 'center', font: '700 14px "Space Grotesk",sans-serif', col: '#fff' }); small('q' + (i + 1), x + 15, y + 4, '#111'); });
      small('red = positive pair energy (repel) · blue = negative (attract)', 12, 316);
      panelTitle('TOTAL', 395, 18); text('U = ' + fplain(d.U) + ' J', 400, 60, { font: '700 16px "Space Grotesk",sans-serif', col: d.U >= 0 ? '#c43a00' : '#1546d6' });
      return;
    }
    if (mode === 'release'){
      if (A.s === undefined || A.reset) A.s = 0; A.s = (A.s + dt / 3) % 1.3; const s = Math.min(1, A.s);
      panelTitle('BEAD RELEASED FROM REST', 10, 18);
      const X = r => 40 + 330 * r / 100; ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(40, 150, 14, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.stroke(); text('+Q', 40, 155, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#fff' });
      ctx.strokeStyle = '#ccc'; ctx.beginPath(); ctx.moveTo(40, 150); ctx.lineTo(375, 150); ctx.stroke();
      [[v.r1, 'r₁', 205], [v.r2, 'r₂', 222]].forEach(([r, l, yy]) => { ctx.strokeStyle = '#888'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(r), 110); ctx.lineTo(X(r), yy - 10); ctx.stroke(); ctx.setLineDash([]); small(l + ' = ' + r + ' cm', X(r) - 20, yy); });
      if (d.ok){ const r = v.r1 + (v.r2 - v.r1) * s; ctx.fillStyle = v.q > 0 ? '#ff6a2b' : '#1546d6'; ctx.beginPath(); ctx.arc(X(r), 150, 8, 0, 7); ctx.fill(); }
      else { ctx.fillStyle = v.q > 0 ? '#ff6a2b' : '#1546d6'; ctx.beginPath(); ctx.arc(X(v.r1), 150, 8, 0, 7); ctx.fill(); small('can’t reach r₂ from rest', 120, 240, '#c43a00'); }
      text(d.ok ? 'v at r₂ = ' + fplain(d.v) + ' m/s' : 'never gets to r₂', 12, 300, { font: '700 14px "Space Grotesk",sans-serif' });
      panelTitle('ENERGY (J)', 395, 18);
      const bars = [['U₁', d.U1, '#7a3fb0'], ['U₂', d.U2, '#7a3fb0'], ['K₂', d.ok ? d.KE : 0, '#1546d6']], mx = Math.max(...bars.map(b => Math.abs(b[1])), 1e-12), b0 = 170;
      ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(400, b0); ctx.lineTo(585, b0); ctx.stroke();
      bars.forEach(([l, q, c], i) => { const h = 100 * q / mx, x = 415 + i * 58; ctx.fillStyle = c; ctx.fillRect(x, Math.min(b0, b0 - h), 34, Math.abs(h)); small(l, x + 12, q < 0 ? b0 - 4 : b0 + 14, '#111'); small(fplain(q), x, q < 0 ? b0 - h + 12 : b0 - h - 4); });
      return;
    }
    if (mode === 'sphere'){
      panelTitle('CHARGED CONDUCTING SPHERE', 10, 18);
      const cx = 140, cy = 170, Rp = 30 + 3 * v.R, sc = Rp / v.R; ctx.fillStyle = '#e6e6e6'; ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke();
      const n = Math.min(24, Math.round(Math.abs(v.Q) / 2)); for (let i = 0; i < n; i++){ const a = 2 * PI * i / n; text(v.Q > 0 ? '+' : '−', cx + (Rp - 6) * Math.cos(a), cy + (Rp - 6) * Math.sin(a) + 4, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: v.Q > 0 ? '#c43a00' : '#1546d6' }); }
      for (let i = 0; i < Math.min(12, n); i++){ const a = 2 * PI * i / Math.min(12, n) + 0.13; const x1 = cx + (Rp + 4) * Math.cos(a), y1 = cy + (Rp + 4) * Math.sin(a), x2 = cx + (Rp + 40) * Math.cos(a), y2 = cy + (Rp + 40) * Math.sin(a); v.Q > 0 ? arrow(x1, y1, x2, y2, '#7a3fb0', null, { w: 1.5, head: 6 }) : arrow(x2, y2, x1, y1, '#7a3fb0', null, { w: 1.5, head: 6 }); }
      small('E = 0 inside', cx - 34, cy + 4, '#1e7d45');
      const px = cx + sc * v.r; ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(Math.min(385, px), cy, 4, 0, 7); ctx.fill(); small('r', Math.min(380, px) - 2, cy - 8, '#111');
      panelTitle('E(r) AND V(r)', 395, 18);
      const gx = 405, gw = 180, rmax = 60, Xg = r => gx + gw * r / rmax;
      const plot = (gy, gh, f, col, lab) => { ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke(); const mx = Math.max(...Array.from({ length: 121 }, (_, i) => Math.abs(f(rmax * i / 120)))) || 1;
        ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 120; i++){ const r = rmax * i / 120, y = gy - gh * Math.abs(f(r)) / mx; i ? ctx.lineTo(Xg(r), y) : ctx.moveTo(Xg(r), y); } ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(Xg(v.r), gy - gh * Math.abs(f(v.r)) / mx, 4, 0, 7); ctx.fill(); small(lab, gx + 4, gy - gh - 2, col);
        ctx.setLineDash([3, 3]); ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(Xg(v.R), gy - gh); ctx.lineTo(Xg(v.R), gy); ctx.stroke(); ctx.setLineDash([]); };
      const Ef = r => r < v.R ? 0 : K * v.Q * 1e-9 / Math.pow(r / 100, 2), Vf = r => K * v.Q * 1e-9 / (Math.max(r, v.R) / 100);
      plot(150, 100, Ef, '#c43a00', '|E|'); plot(290, 100, Vf, '#1546d6', '|V|'); small('R', Xg(v.R) - 3, 302); small('r (cm)', gx + gw - 30, 302);
      return;
    }
    // equipotential map
    const X = x => 195 + 900 * x, Y = y => 165 - 900 * y, key = [v.q1, v.q2, v.s].join();
    if (!A.img || A.key !== key){ A.key = key; const oc = document.createElement('canvas'); oc.width = 760; oc.height = 600; const o = oc.getContext('2d'); o.setTransform(2, 0, 0, 2, 0, 0);
      const st = 3, nx = Math.ceil(375 / st) + 1, ny = Math.ceil(275 / st) + 1, G = [];
      for (let j = 0; j < ny; j++){ G.push([]); for (let i = 0; i < nx; i++){ const px = 10 + i * st, py = 30 + j * st; G[j].push(Vat(d.Q, (px - 195) / 900, (165 - py) / 900)); } }
      for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++){ const Vv = G[j][i], a = Math.min(1, Math.log10(1 + Math.abs(Vv) / 20) / 3.2); o.fillStyle = Vv > 0 ? 'rgba(255,106,43,' + a * 0.55 + ')' : 'rgba(21,70,214,' + a * 0.55 + ')'; o.fillRect(10 + i * st, 30 + j * st, st, st); }
      const levels = [-3000, -1500, -800, -400, -200, -100, 0, 100, 200, 400, 800, 1500, 3000];
      o.lineWidth = 1.2;
      levels.forEach(L => { o.strokeStyle = L === 0 ? '#111' : '#333'; o.beginPath();
        for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++){ const c = [G[j][i], G[j][i + 1], G[j + 1][i + 1], G[j + 1][i]]; if (c.some(z => !isFinite(z) || Math.abs(z) > 5e4)) continue; const pts = [], e = [[0, 1, 0, 0, 1, 0], [1, 2, 1, 0, 1, 1], [2, 3, 1, 1, 0, 1], [3, 0, 0, 1, 0, 0]];
          e.forEach(([a, b, x1, y1, x2, y2]) => { if ((c[a] - L) * (c[b] - L) < 0){ const f = (L - c[a]) / (c[b] - c[a]); pts.push([10 + (i + x1 + (x2 - x1) * f) * st, 30 + (j + y1 + (y2 - y1) * f) * st]); } });
          if (pts.length >= 2){ o.moveTo(...pts[0]); o.lineTo(...pts[1]); if (pts.length === 4){ o.moveTo(...pts[2]); o.lineTo(...pts[3]); } } }
        o.stroke(); });
      A.img = oc; }
    ctx.drawImage(A.img, 0, 0, 760, 600, 0, 0, 380, 300); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(10, 30, 375, 275);
    panelTitle('EQUIPOTENTIALS (lines) · red = high V, blue = low V', 10, 18);
    d.Q.forEach(([cx, cy, q], i) => { ctx.fillStyle = q > 0 ? '#ff6a2b' : q < 0 ? '#1546d6' : '#bbb'; ctx.beginPath(); ctx.arc(X(cx), Y(cy), 9, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.stroke(); text(q > 0 ? '+' : q < 0 ? '−' : '0', X(cx), Y(cy) + 5, { align: 'center', font: '700 13px "Space Grotesk",sans-serif', col: '#fff' }); });
    const ax = X(v.xA / 100), bx = X(v.xB / 100), yy = Y(0.06);
    ctx.setLineDash([5, 4]); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ax, yy); ctx.quadraticCurveTo((ax + bx) / 2, yy - 50, bx, yy); ctx.stroke(); ctx.setLineDash([]);
    [[ax, 'A'], [bx, 'B']].forEach(([x, l]) => { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, yy, 5, 0, 7); ctx.fill(); text(l, x - 4, yy - 9, { font: '700 13px "Space Grotesk",sans-serif' }); });
    text('V_A = ' + fplain(d.VA) + ' V   V_B = ' + fplain(d.VB) + ' V', 14, 320, { font: '700 12px "Space Grotesk",sans-serif' });
    panelTitle('MOVE q FROM A TO B', 395, 18);
    text('ΔV = ' + fplain(d.dV) + ' V', 400, 56, { font: '700 14px "Space Grotesk",sans-serif' });
    text('W by you = ' + fplain(d.Wext) + ' J', 400, 82, { font: '600 12px "IBM Plex Mono",monospace', col: d.Wext >= 0 ? '#c43a00' : '#1e7d45' });
    text('W by field = ' + fplain(d.Wf) + ' J', 400, 102, { font: '600 12px "IBM Plex Mono",monospace' });
    small('any path: same W', 400, 300);
  }
};
