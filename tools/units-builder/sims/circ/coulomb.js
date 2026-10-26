// Coulomb's Law (AP 10.1, IB D.2): two charges and Newton's third law, three charges on a line (net force by subtasks), two charged spheres hanging from strings.
const K = 8.99e9;
const SIM = {
  title: 'Coulomb’s Law',
  hint: 'k = 8.99×10⁹ N·m²/C² · g = 10 m/s²',
  modes: [{ id: 'two', label: 'Two charges' }, { id: 'line', label: 'Three in a line' }, { id: 'hang', label: 'Hanging spheres' }],
  ivs(mode){
    if (mode === 'line') return [
      { id: 'q1', sym: 'q<sub>1</sub>', symText: 'q1', label: 'Left charge', unit: 'μC', min: -10, max: 10, step: 0.5, val: 3 },
      { id: 'q2', sym: 'q<sub>2</sub>', symText: 'q2', label: 'Middle charge', unit: 'μC', min: -10, max: 10, step: 0.5, val: -2 },
      { id: 'q3', sym: 'q<sub>3</sub>', symText: 'q3', label: 'Right charge', unit: 'μC', min: -10, max: 10, step: 0.5, val: 5 },
      { id: 'd1', sym: 'd<sub>12</sub>', symText: 'd12', label: 'Left to middle', unit: 'cm', min: 2, max: 30, step: 0.5, val: 10, graph: true },
      { id: 'd2', sym: 'd<sub>23</sub>', symText: 'd23', label: 'Middle to right', unit: 'cm', min: 2, max: 30, step: 0.5, val: 15 }];
    if (mode === 'hang') return [
      { id: 'q1', sym: 'q<sub>A</sub>', symText: 'qA', label: 'Charge on A', unit: 'nC', min: 10, max: 500, step: 5, val: 200 },
      { id: 'q2', sym: 'q<sub>B</sub>', symText: 'qB', label: 'Charge on B', unit: 'nC', min: 10, max: 500, step: 5, val: 200, graph: true },
      { id: 'm1', sym: 'm<sub>A</sub>', symText: 'mA', label: 'Mass of A', unit: 'g', min: 0.5, max: 10, step: 0.1, val: 2 },
      { id: 'm2', sym: 'm<sub>B</sub>', symText: 'mB', label: 'Mass of B', unit: 'g', min: 0.5, max: 10, step: 0.1, val: 2 },
      { id: 'L', sym: 'L', symText: 'L', label: 'String length', unit: 'cm', min: 10, max: 100, step: 1, val: 50 }];
    return [
      { id: 'q1', sym: 'q<sub>1</sub>', symText: 'q1', label: 'Charge 1', unit: 'μC', min: -10, max: 10, step: 0.5, val: 4 },
      { id: 'q2', sym: 'q<sub>2</sub>', symText: 'q2', label: 'Charge 2', unit: 'μC', min: -10, max: 10, step: 0.5, val: -2 },
      { id: 'r', sym: 'r', symText: 'r', label: 'Distance between centers', unit: 'cm', min: 2, max: 50, step: 0.5, val: 10, graph: true }];
  },
  presets: [{ label: 'Double the distance', mode: 'two', v: { r: 20 } }, { label: 'Different masses', mode: 'hang', v: { m1: 1, m2: 4 } }, { label: 'Different charges', mode: 'hang', v: { q1: 50, q2: 400, m1: 2, m2: 2 } }],
  calc(v, mode){
    if (mode === 'line'){
      const x = [0, v.d1 / 100, (v.d1 + v.d2) / 100], q = [v.q1, v.q2, v.q3].map(c => c * 1e-6);
      const f = (i, j) => { const dx = x[i] - x[j]; return K * q[i] * q[j] / (dx * dx) * Math.sign(dx); }; // force on i from j (+ = right)
      const parts = [[f(0, 1), f(0, 2)], [f(1, 0), f(1, 2)], [f(2, 0), f(2, 1)]], net = parts.map(p => p[0] + p[1]);
      return { x, q, parts, net, sum: net[0] + net[1] + net[2] };
    }
    if (mode === 'hang'){
      const m1 = v.m1 / 1000, m2 = v.m2 / 1000, L = v.L / 100, qq = v.q1 * v.q2 * 1e-18; let t1 = 0.3, t2 = 0.3, F = 0;
      for (let i = 0; i < 300; i++){ const r = L * Math.sin(t1) + L * Math.sin(t2); F = K * qq / (r * r); const n1 = Math.atan(F / (m1 * 10)), n2 = Math.atan(F / (m2 * 10)); t1 += 0.3 * (n1 - t1); t2 += 0.3 * (n2 - t2); }
      const r = L * (Math.sin(t1) + Math.sin(t2));
      return { t1, t2, F, r, T1: m1 * 10 / Math.cos(t1), T2: m2 * 10 / Math.cos(t2), m1, m2, L };
    }
    const r = v.r / 100, F = K * Math.abs(v.q1 * v.q2) * 1e-12 / (r * r);
    return { r, F, attract: v.q1 * v.q2 < 0, zero: v.q1 * v.q2 === 0 };
  },
  dvs(mode){
    if (mode === 'line') return [{ id: 'n2', name: 'Net force on the middle charge (+ = right)', short: 'F₂', sym: 'F<sub>2,net</sub>', unit: 'N', f: d => d.net[1] }, { id: 'n1', name: 'Net force on the left charge', short: 'F₁', sym: 'F<sub>1,net</sub>', unit: 'N', f: d => d.net[0] }, { id: 'n3', name: 'Net force on the right charge', short: 'F₃', sym: 'F<sub>3,net</sub>', unit: 'N', f: d => d.net[2] }];
    if (mode === 'hang') return [{ id: 't1', name: 'Angle of A from vertical', short: 'θA', sym: 'θ<sub>A</sub>', unit: '°', f: d => d.t1 / DEG, vs: 't2' }, { id: 't2', name: 'Angle of B from vertical', short: 'θB', sym: 'θ<sub>B</sub>', unit: '°', f: d => d.t2 / DEG }, { id: 'F', name: 'Electric force (same on both)', short: 'F', sym: 'F<sub>E</sub>', unit: 'N', f: d => d.F }];
    return [{ id: 'F', name: 'Force on each charge', short: 'F', sym: 'F', unit: 'N', f: d => d.F }];
  },
  work(v, d, mode){
    if (mode === 'line'){ const nm = ['q₁', 'q₂', 'q₃'], dir = F => (F >= 0 ? 'right' : 'left'), row = i => {
        const [a, b] = d.parts[i], o = [0, 1, 2].filter(j => j !== i);
        return '<div class="eq"><b>On ' + nm[i] + ':</b> from ' + nm[o[0]] + ' ' + H.n(Math.abs(a), 'N') + ' ' + dir(a) + ', from ' + nm[o[1]] + ' ' + H.n(Math.abs(b), 'N') + ' ' + dir(b) + ' → net <b>' + H.n(Math.abs(d.net[i]), 'N') + ' ' + dir(d.net[i]) + '</b></div>'; };
      return '<h4>1 · Each pair: F = k|q<sub>1</sub>q<sub>2</sub>|/r², direction from like/unlike signs</h4><div class="eq">Do each pair separately, then add as vectors (here + = right).</div>' + [0, 1, 2].map(row).join('') +
        '<h4>2 · Check: forces inside the system cancel in pairs (Newton’s 3rd law)</h4><div class="eq">F₁ + F₂ + F₃ = ' + H.n(Math.abs(d.sum) < 1e-9 ? 0 : d.sum, 'N') + '</div>' +
        '<p class="note">Distances: q₁ to q₃ is ' + fnum(v.d1 + v.d2) + ' cm, not ' + v.d2 + ' cm. Using the wrong distance is the most common mistake.</p>'; }
    if (mode === 'hang') return '<h4>1 · Free-body diagram for each sphere: weight, tension, electric force</h4><div class="eq">Vertical: T cos θ = mg &nbsp; Horizontal: T sin θ = F<sub>E</sub> → <b>tan θ = F<sub>E</sub>/(mg)</b></div>' +
      '<h4>2 · The electric force is the same size on both (Newton’s 3rd law)</h4><div class="eq">r = L sin θ<sub>A</sub> + L sin θ<sub>B</sub> = ' + H.n(d.r * 100, 'cm') + ' → F<sub>E</sub> = kq<sub>A</sub>q<sub>B</sub>/r² = <b>' + H.n(d.F, 'N') + '</b></div>' +
      '<div class="eq">θ<sub>A</sub> = tan⁻¹(F/m<sub>A</sub>g) = <b>' + H.n(d.t1 / DEG, '°') + '</b> &nbsp; θ<sub>B</sub> = <b>' + H.n(d.t2 / DEG, '°') + '</b></div>' +
      '<h4>3 · Which hangs at the bigger angle?</h4><div class="eq">' + (Math.abs(v.m1 - v.m2) < 0.05 ? 'Equal masses → equal angles, even if the charges are different!' : 'The <b>lighter</b> sphere hangs at the bigger angle: same F<sub>E</sub>, less weight to balance it.') + '</div>' +
      '<p class="note">CED “conflicting contentions”: a bigger angle means less mass, not less (or more) charge. The force on each is the same.</p>';
    return '<h4>1 · Coulomb’s law</h4><div class="eq">F = k|q<sub>1</sub>q<sub>2</sub>|/r² = (8.99×10⁹)(' + fnum(Math.abs(v.q1) * 1e-6) + ')(' + fnum(Math.abs(v.q2) * 1e-6) + ')/(' + fnum(d.r) + ')² = <b>' + H.n(d.F, 'N') + '</b></div>' +
      '<h4>2 · Direction</h4><div class="eq">' + (d.zero ? 'One charge is zero: no force.' : d.attract ? 'Opposite signs → <b>attract</b>.' : 'Same signs → <b>repel</b>.') + '</div>' +
      '<h4>3 · Newton’s third law</h4><div class="eq">Charge 1 pushes or pulls charge 2 exactly as hard as 2 does on 1, even if one charge is much bigger.</div>' +
      '<p class="note">Inverse square: double r → ¼ F. Triple r → 1/9 F. Double one charge → 2F.</p>';
  },
  draw(v, d, mode){
    const ball = (x, y, q, r, lab) => { ctx.fillStyle = q > 0 ? '#ff6a2b' : q < 0 ? '#1546d6' : '#bbb'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.stroke(); text(q > 0 ? '+' : q < 0 ? '−' : '0', x, y + 5, { align: 'center', font: '700 15px "Space Grotesk",sans-serif', col: '#fff' }); if (lab) text(lab, x, y + r + 16, { align: 'center', font: '600 11px "IBM Plex Mono",monospace' }); };
    const alen = F => Math.min(70, 14 * Math.log10(1 + F * 1000));
    if (mode === 'line'){
      panelTitle('THREE CHARGES ON A LINE', 10, 18);
      const tot = (v.d1 + v.d2) / 100, X = x => 50 + 290 * x / tot, cols = ['#c43a00', '#7a3fb0'];
      ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(30, 150); ctx.lineTo(360, 150); ctx.stroke();
      d.x.forEach((x, i) => { ball(X(x), 150, d.q[i], 14, 'q' + (i + 1) + ' = ' + [v.q1, v.q2, v.q3][i] + ' μC');
        d.parts[i].forEach((F, k) => { const L = alen(Math.abs(F)) * Math.sign(F); if (Math.abs(L) > 2) arrow(X(x), 110 - k * 22, X(x) + L, 110 - k * 22, cols[k], null, { w: 2.5, head: 7 }); });
        const Ln = alen(Math.abs(d.net[i])) * Math.sign(d.net[i]); if (Math.abs(Ln) > 2) arrow(X(x), 205, X(x) + Ln, 205, '#111', 'net', { w: 3.5, ly: 12 }); });
      text(v.d1 + ' cm', (X(d.x[0]) + X(d.x[1])) / 2, 238, { align: 'center', font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(v.d2 + ' cm', (X(d.x[1]) + X(d.x[2])) / 2, 238, { align: 'center', font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text('colored = each pair · black = net (log scale)', 12, 300, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('NET FORCES', 395, 18); d.net.forEach((F, i) => text('F' + (i + 1) + ' = ' + fplain(Math.abs(F)) + ' N ' + (F >= 0 ? '→' : '←'), 400, 60 + i * 26, { font: '700 13px "Space Grotesk",sans-serif' }));
      return;
    }
    if (mode === 'hang'){
      panelTitle('TWO CHARGED SPHERES ON STRINGS', 10, 18);
      const px = 195, py = 36, sc = 220 / d.L, x1 = px - sc * d.L * Math.sin(d.t1), y1 = py + sc * d.L * Math.cos(d.t1), x2 = px + sc * d.L * Math.sin(d.t2), y2 = py + sc * d.L * Math.cos(d.t2);
      ctx.fillStyle = '#111'; ctx.fillRect(px - 60, py - 6, 120, 6); ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x1, y1); ctx.moveTo(px, py); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + 240); ctx.stroke(); ctx.setLineDash([]);
      const rA = 8 + 3 * Math.cbrt(v.m1), rB = 8 + 3 * Math.cbrt(v.m2); ball(x1, y1, 1, rA, 'A'); ball(x2, y2, 1, rB, 'B');
      const s = 40 / Math.max(d.F, d.m1 * 10, d.m2 * 10);
      [[x1, y1, -1, d.m1, d.t1], [x2, y2, 1, d.m2, d.t2]].forEach(([x, y, sg, m, t]) => { arrow(x, y, x + sg * d.F * s, y, COL.F, 'F', { w: 2.5, head: 7 }); arrow(x, y, x, y + m * 10 * s, COL.W, 'mg', { w: 2.5, head: 7 }); const T = m * 10 / Math.cos(t); arrow(x, y, x - sg * T * s * Math.sin(t), y - T * s * Math.cos(t), COL.T, 'T', { w: 2.5, head: 7 }); });
      text('θA = ' + fplain(d.t1 / DEG) + '°   θB = ' + fplain(d.t2 / DEG) + '°', 12, 316, { font: '700 13px "Space Grotesk",sans-serif' });
      panelTitle('SAME FORCE ON BOTH', 395, 18); text('F_E = ' + fplain(d.F) + ' N', 400, 60, { font: '700 14px "Space Grotesk",sans-serif', col: COL.F }); text('m_A g = ' + fplain(d.m1 * 10) + ' N', 400, 86, { font: '600 12px "IBM Plex Mono",monospace' }); text('m_B g = ' + fplain(d.m2 * 10) + ' N', 400, 106, { font: '600 12px "IBM Plex Mono",monospace' });
      return;
    }
    panelTitle('TWO POINT CHARGES', 10, 18);
    const sep = 40 + 280 * (v.r - 2) / 48, x1 = 195 - sep / 2, x2 = 195 + sep / 2;
    ball(x1, 150, v.q1, 10 + Math.abs(v.q1) * 1.6, 'q₁ = ' + v.q1 + ' μC'); ball(x2, 150, v.q2, 10 + Math.abs(v.q2) * 1.6, 'q₂ = ' + v.q2 + ' μC');
    if (!d.zero){ const L = alen(d.F), dir = d.attract ? 1 : -1; arrow(x1, 112, x1 + dir * L, 112, COL.F, null, { w: 3 }); text('F on 1', x1, 102, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: COL.F }); arrow(x2, 192, x2 - dir * L, 192, COL.F, null, { w: 3 }); text('F on 2', x2, 210, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: COL.F }); }
    ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(x1, 240); ctx.lineTo(x2, 240); ctx.stroke(); text('r = ' + v.r + ' cm', 195, 256, { align: 'center', font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('F = ' + fplain(d.F) + ' N  (' + (d.zero ? 'none' : d.attract ? 'attract' : 'repel') + ')', 12, 300, { font: '700 14px "Space Grotesk",sans-serif' });
    panelTitle('F vs r (inverse square)', 395, 18);
    const gx = 405, gy = 240, gw = 180, gh = 180, Fm = K * Math.abs(v.q1 * v.q2) * 1e-12 / (0.02 * 0.02) || 1; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 100; i++){ const r = 0.02 + 0.48 * i / 100, F = K * Math.abs(v.q1 * v.q2) * 1e-12 / (r * r); i ? ctx.lineTo(gx + gw * i / 100, gy - gh * Math.min(1, F / Fm * 4)) : ctx.moveTo(gx, gy - gh * Math.min(1, F / Fm * 4)); } ctx.stroke();
    const xi = gx + gw * (v.r - 2) / 48; ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(xi, gy - gh * Math.min(1, d.F / Fm * 4), 5, 0, 7); ctx.fill();
    text('r', gx + gw, gy + 13, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
