// Fields of Wires (AP 12.1, 12.3; IB D.2 field patterns, D.3 F = BIL sinθ and force between parallel wires): one long wire, two wires (field at a point and the force between them), force on a wire between magnet poles.
const MU = 2e-7;   // μ₀/2π
function bAt(W, x, y){ let Bx = 0, By = 0; const parts = W.map(([wx, wy, I]) => { const dx = x - wx, dy = y - wy, r2 = dx * dx + dy * dy, r = Math.sqrt(r2), B = MU * I / r; const bx = -B * dy / r, by = B * dx / r; Bx += bx; By += by; return { r, B: Math.abs(B), bx, by, I }; }); return { Bx, By, B: Math.hypot(Bx, By), parts }; }
function wireSym(x, y, I, r){ r = r || 11; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); if (I > 0){ ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.fill(); } else if (I < 0){ ctx.beginPath(); ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6); ctx.stroke(); } }
const SIM = {
  title: 'Fields of Wires',
  hint: 'μ₀ = 4π×10⁻⁷ T·m/A · B = μ₀I/(2πr) · ⊙ out of page, ⊗ into page',
  modes: [{ id: 'one', label: 'One long wire' }, { id: 'two', label: 'Two parallel wires' }, { id: 'motor', label: 'Wire between magnet poles' }],
  opts: [{ id: 'cur', label: 'Current', modes: ['one', 'motor'], choices: [['out', 'Out of page ⊙ / to the right'], ['in', 'Into page ⊗ / to the left']] }],
  ivs(mode){
    if (mode === 'two') return [
      { id: 'I1', sym: 'I<sub>1</sub>', symText: 'I1', label: 'Left wire (+ = out of page)', unit: 'A', min: -30, max: 30, step: 1, val: 20 },
      { id: 'I2', sym: 'I<sub>2</sub>', symText: 'I2', label: 'Right wire (+ = out of page)', unit: 'A', min: -30, max: 30, step: 1, val: 20 },
      { id: 'd', sym: 'd', symText: 'd', label: 'Separation', unit: 'cm', min: 2, max: 24, step: 0.5, val: 10, graph: true },
      { id: 'px', sym: 'x<sub>P</sub>', symText: 'xP', label: 'Point P: x', unit: 'cm', min: -18, max: 18, step: 0.5, val: 0 },
      { id: 'py', sym: 'y<sub>P</sub>', symText: 'yP', label: 'Point P: y', unit: 'cm', min: -13, max: 13, step: 0.5, val: 6 }];
    if (mode === 'motor') return [
      { id: 'B', sym: 'B', symText: 'B', label: 'Field between the poles', unit: 'T', min: 0.01, max: 1, step: 0.01, val: 0.2 },
      { id: 'I', sym: 'I', symText: 'I', label: 'Current', unit: 'A', min: 0.5, max: 10, step: 0.5, val: 3 },
      { id: 'L', sym: 'L', symText: 'L', label: 'Length of wire in the field', unit: 'cm', min: 1, max: 20, step: 0.5, val: 8 },
      { id: 'th', sym: 'θ', symText: 'theta', label: 'Angle between wire and B', unit: '°', min: 0, max: 90, step: 1, val: 90, graph: true }];
    return [{ id: 'I', sym: 'I', symText: 'I', label: 'Current', unit: 'A', min: 1, max: 50, step: 1, val: 10 }, { id: 'r', sym: 'r', symText: 'r', label: 'Distance from the wire', unit: 'cm', min: 1, max: 20, step: 0.5, val: 5, graph: true }];
  },
  presets: [{ label: 'Opposite currents', mode: 'two', v: { I1: 20, I2: -20 } }, { label: 'P halfway between', mode: 'two', v: { px: 0, py: 0 } }, { label: 'Wire parallel to B', mode: 'motor', v: { th: 0 } }],
  calc(v, mode, opt){
    const sg = (opt.cur || 'out') === 'out' ? 1 : -1;
    if (mode === 'motor'){ const F = v.B * v.I * (v.L / 100) * Math.sin(v.th * DEG); return { F, sg, into: sg > 0 }; }
    if (mode === 'two'){ const d = v.d / 100, W = [[-d / 2, 0, v.I1], [d / 2, 0, v.I2]], b = bAt(W, v.px / 100, v.py / 100); return { W, ...b, FL: MU * Math.abs(v.I1 * v.I2) / d, attract: v.I1 * v.I2 > 0, ang: Math.atan2(b.By, b.Bx) / DEG }; }
    const B = MU * v.I / (v.r / 100); return { B, sg, earth: B / 5e-5 };
  },
  dvs(mode){
    if (mode === 'motor') return [{ id: 'F', name: 'Force on the wire', short: 'F', sym: 'F', unit: 'N', f: d => d.F }];
    if (mode === 'two') return [{ id: 'FL', name: 'Force per meter between the wires', short: 'F/L', sym: 'F/L', unit: 'N/m', f: d => d.FL }, { id: 'B', name: 'Field at P', short: 'B', sym: 'B<sub>P</sub>', unit: 'T', f: d => d.B }];
    return [{ id: 'B', name: 'Field at distance r', short: 'B', sym: 'B', unit: 'T', f: d => d.B }];
  },
  work(v, d, mode){
    if (mode === 'motor') return '<h4>1 · Force on a current in a field: F = BIL sin θ</h4><div class="eq">F = (' + H.iv('B') + ')(' + H.iv('I') + ')(' + fnum(v.L / 100) + ' m) sin ' + v.th + '° = <b>' + H.n(d.F, 'N') + '</b></div>' +
      '<h4>2 · Direction: right-hand rule</h4><div class="eq">Fingers along the current, curl toward B (or: thumb = I, fingers = B, palm pushes = F). Here the force is ' + (d.F < 1e-12 ? '<b>zero</b>: the wire is parallel to B.' : '<b>' + (d.into ? 'into the page ⊗' : 'out of the page ⊙') + '</b>.') + '</div>' +
      '<p class="note">Biggest force when the wire is perpendicular to B; zero when parallel. Reverse the current or the field and the force reverses. This is how motors and loudspeakers work.</p>';
    if (mode === 'two'){ const rows = d.parts.map((p, i) => '<div class="eq">Wire ' + (i + 1) + ' (' + Math.abs(p.I) + ' A ' + (p.I > 0 ? 'out' : 'in') + '): r = ' + H.n(p.r * 100, 'cm') + ', B = μ₀I/2πr = ' + H.n(p.B, 'T') + ' → (' + fnum(p.bx) + ', ' + fnum(p.by) + ')</div>').join('');
      return '<h4>1 · Field at P from each wire (circles around each wire)</h4>' + rows +
        '<h4>2 · Add as vectors</h4><div class="eq">B<sub>P</sub> = <b>' + H.n(d.B, 'T') + '</b> at ' + H.n(d.ang, '°') + ' from +x</div>' +
        '<h4>3 · Force between the wires</h4><div class="eq">Wire 2 sits in wire 1’s field B = μ₀I₁/2πd → F/L = μ₀I₁I₂/(2πd) = <b>' + H.n(d.FL, 'N/m') + '</b>, ' + (d.attract ? '<b>attract</b> (currents the same way)' : '<b>repel</b> (currents opposite)') + '</div>' +
        '<p class="note">Same direction attracts, opposite repels: the reverse of charges! Newton’s third law: each wire feels the same force even if the currents differ.</p>'; }
    return '<h4>1 · Field around a long straight wire</h4><div class="eq">B = μ₀I/(2πr) = (2×10⁻⁷)(' + H.iv('I') + ')/(' + fnum(v.r / 100) + ' m) = <b>' + H.n(d.B, 'T') + '</b></div>' +
      '<div class="eq">That’s ' + H.n(d.earth) + '× Earth’s field (about 5×10⁻⁵ T): enough to turn a compass nearby.</div>' +
      '<h4>2 · Direction: right-hand grip rule</h4><div class="eq">Thumb along the current, fingers curl the way B goes: ' + (d.sg > 0 ? 'out of the page → B circles <b>counterclockwise</b>.' : 'into the page → B circles <b>clockwise</b>.') + '</div>' +
      '<p class="note">Double r → half B (1/r, not 1/r²). Field lines are circles: no start or end, unlike electric field lines.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const X = x => 195 + 900 * x, Y = y => 165 - 900 * y;
    if (mode === 'motor'){
      panelTitle('WIRE BETWEEN THE POLES OF A MAGNET (top view)', 10, 18);
      ctx.fillStyle = '#c43a00'; ctx.fillRect(20, 60, 50, 220); ctx.fillStyle = '#1546d6'; ctx.fillRect(320, 60, 50, 220); text('N', 45, 175, { align: 'center', font: '700 22px "Space Grotesk",sans-serif', col: '#fff' }); text('S', 345, 175, { align: 'center', font: '700 22px "Space Grotesk",sans-serif', col: '#fff' });
      for (let y = 80; y < 280; y += 36) arrow(80, y, 310, y, 'rgba(122,63,176,0.35)', null, { w: 1.5, head: 7 }); text('B', 300, 74, { font: '700 12px "Space Grotesk",sans-serif', col: '#7a3fb0' });
      const len = 8 * v.L + 30, a = v.th * DEG, cx = 195, cy = 170, dx = Math.cos(a) * len / 2 * d.sg, dy = -Math.sin(a) * len / 2 * d.sg;
      ctx.strokeStyle = '#c47a3a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx - dx, cy - dy); ctx.lineTo(cx + dx, cy + dy); ctx.stroke(); arrow(cx - dx * 0.3, cy - dy * 0.3, cx + dx * 0.6, cy + dy * 0.6, '#1e7d45', 'I', { w: 2.5 });
      if (d.F > 1e-12){ const into = d.into; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx + 40, cy + 40, 13, 0, 7); ctx.fill(); ctx.stroke(); if (into){ ctx.beginPath(); ctx.moveTo(cx + 32, cy + 32); ctx.lineTo(cx + 48, cy + 48); ctx.moveTo(cx + 48, cy + 32); ctx.lineTo(cx + 32, cy + 48); ctx.stroke(); } else { ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(cx + 40, cy + 40, 4, 0, 7); ctx.fill(); } text('F ' + (into ? 'into page' : 'out of page'), cx + 58, cy + 45, { font: '700 11px "Space Grotesk",sans-serif', col: '#c43a00' }); }
      text('F = ' + fplain(d.F) + ' N', 12, 312, { font: '700 14px "Space Grotesk",sans-serif' });
      panelTitle('F vs θ', 395, 18); const gx = 405, gy = 240, gw = 180, gh = 170; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 90; i++){ const y = gy - gh * Math.sin(i * DEG); i ? ctx.lineTo(gx + gw * i / 90, y) : ctx.moveTo(gx, y); } ctx.stroke(); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(gx + gw * v.th / 90, gy - gh * Math.sin(v.th * DEG), 5, 0, 7); ctx.fill(); text('θ: 0 → 90°', gx + gw, gy + 13, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    if (mode === 'two'){
      const key = [v.I1, v.I2, v.d].join(); if (!A.img || A.key !== key){ A.key = key; const oc = document.createElement('canvas'); oc.width = 760; oc.height = 600; const o = oc.getContext('2d'); o.setTransform(2, 0, 0, 2, 0, 0); o.fillStyle = '#fff'; o.fillRect(10, 30, 375, 275);
        for (let gx = 25; gx < 380; gx += 24) for (let gy = 42; gy < 300; gy += 24){ const b = bAt(d.W, (gx - 195) / 900, (165 - gy) / 900); if (!isFinite(b.B) || b.B === 0 || d.W.some(([wx, wy]) => Math.hypot(gx - X(wx), gy - Y(wy)) < 14)) continue; const L = Math.min(10, 2 * Math.log10(1 + b.B / 1e-6)), ux = b.Bx / b.B, uy = -b.By / b.B; o.strokeStyle = '#b9a8d6'; o.fillStyle = '#b9a8d6'; o.lineWidth = 1.2; o.beginPath(); o.moveTo(gx - ux * L, gy - uy * L); o.lineTo(gx + ux * L, gy + uy * L); o.stroke(); o.beginPath(); o.moveTo(gx + ux * L, gy + uy * L); o.lineTo(gx + ux * L - ux * 4 - uy * 3, gy + uy * L - uy * 4 + ux * 3); o.lineTo(gx + ux * L - ux * 4 + uy * 3, gy + uy * L - uy * 4 - ux * 3); o.fill(); }
        A.img = oc; }
      ctx.drawImage(A.img, 0, 0, 760, 600, 0, 0, 380, 300); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(10, 30, 375, 275);
      panelTitle('TWO WIRES (⊙ out, ⊗ in) · purple = B field', 10, 18);
      d.W.forEach(([wx, wy, I], i) => { wireSym(X(wx), Y(wy), I); text((i + 1) + ': ' + Math.abs(I) + ' A', X(wx) - 16, Y(wy) + 28, { font: '700 10px "IBM Plex Mono",monospace' }); });
      const fl = 22, dir = d.attract ? 1 : -1; if (v.I1 && v.I2){ arrow(X(d.W[0][0]) + 14, Y(0) - 22, X(d.W[0][0]) + 14 + dir * fl, Y(0) - 22, COL.F, 'F', { w: 2.5, head: 7 }); arrow(X(d.W[1][0]) - 14, Y(0) - 22, X(d.W[1][0]) - 14 - dir * fl, Y(0) - 22, COL.F, 'F', { w: 2.5, head: 7 }); }
      const px = X(v.px / 100), py = Y(v.py / 100), sc = B => Math.min(60, 14 * Math.log10(1 + B / 1e-6)); if (isFinite(d.B) && d.B > 0){ d.parts.forEach((p, i) => { const m = Math.hypot(p.bx, p.by) || 1; arrow(px, py, px + sc(p.B) * p.bx / m, py - sc(p.B) * p.by / m, ['#c43a00', '#1546d6'][i], null, { w: 2, head: 6, dash: [4, 3] }); }); arrow(px, py, px + sc(d.B) * d.Bx / d.B, py - sc(d.B) * d.By / d.B, '#111', 'B', { w: 3.5 }); }
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(px, py, 4, 0, 7); ctx.fill(); text('P', px - 12, py - 6, { font: '700 12px "Space Grotesk",sans-serif' });
      panelTitle('RESULTS', 395, 18); text('B at P = ' + fplain(d.B) + ' T', 400, 56, { font: '700 13px "Space Grotesk",sans-serif' }); text('F/L = ' + fplain(d.FL) + ' N/m', 400, 82, { font: '700 13px "Space Grotesk",sans-serif', col: COL.F }); text(d.attract ? 'attract' : 'repel', 400, 102, { font: '600 11px "IBM Plex Mono",monospace', col: COL.F });
      return;
    }
    panelTitle('LONG STRAIGHT WIRE (cross-section)', 10, 18);
    const cx = 195, cy = 165, sc = 9; [2, 5, 9, 14].forEach(r => { ctx.strokeStyle = 'rgba(122,63,176,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r * sc, 0, 7); ctx.stroke(); const a = -t * 0.6 * d.sg + r; const ax = cx + r * sc * Math.cos(a), ay = cy + r * sc * Math.sin(a); arrow(ax, ay, ax + d.sg * 8 * Math.sin(a), ay - d.sg * 8 * Math.cos(a), '#7a3fb0', null, { w: 1.5, head: 6 }); });
    for (let k = 0; k < 8; k++){ const a = k * PI / 4, R = 11.5 * sc, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), ux = d.sg * Math.sin(a), uy = -d.sg * Math.cos(a); ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + ux * 9, y + uy * 9); ctx.stroke(); ctx.strokeStyle = '#888'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - ux * 9, y - uy * 9); ctx.stroke(); }
    wireSym(cx, cy, d.sg);
    const pr = v.r * sc; ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx + pr, cy, 4, 0, 7); ctx.fill(); arrow(cx + pr, cy, cx + pr, cy - d.sg * Math.min(60, 12 * Math.log10(1 + d.B / 1e-6)), '#111', 'B', { w: 3 });
    text('compasses (red = north end) line up with B', 12, 312, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    panelTitle('B vs r', 395, 18); const gx = 405, gy = 240, gw = 180, gh = 170, Bm = MU * v.I / 0.01; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 100; i++){ const r = 1 + 19 * i / 100, B = MU * v.I / (r / 100); i ? ctx.lineTo(gx + gw * (r - 1) / 19, gy - gh * B / Bm) : ctx.moveTo(gx, gy - gh); } ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(gx + gw * (v.r - 1) / 19, gy - gh * d.B / Bm, 5, 0, 7); ctx.fill(); text('r (cm)', gx + gw, gy + 13, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('B = ' + fplain(d.B) + ' T', 400, 290, { font: '700 14px "Space Grotesk",sans-serif' });
  }
};
