// Rotational Inertia: I = Σmr² for beads on a rod, and the standard shapes. Same torque → α = τ/I.
const SHAPES = [['hoop', 'Hoop', 1, 'MR²'], ['disk', 'Disk', 0.5, '½MR²'], ['shell', 'Hollow sphere', 2 / 3, '⅔MR²'], ['ball', 'Solid sphere', 0.4, '⅖MR²'], ['rodc', 'Rod (center)', 1 / 12, '1/12 ML²'], ['rode', 'Rod (end)', 1 / 3, '⅓ML²']];
const SIM = {
  title: 'Rotational Inertia',
  modes: [{ id: 'beads', label: 'Beads on a rod' }, { id: 'shapes', label: 'Shapes' }],
  opts: [{ id: 'shape', label: 'Spin the', modes: ['shapes'], choices: SHAPES.map(s => [s[0], s[1]]) }],
  ivs(mode){
    if (mode === 'beads') return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Each bead', unit: 'kg', min: 0.1, max: 2, step: 0.05, val: 0.5 },
      { id: 'r', sym: 'r', symText: 'r', label: 'Bead distance from the axle', unit: 'm', min: 0.05, max: 0.5, step: 0.01, val: 0.3, graph: true },
      { id: 'M', sym: 'M', symText: 'M', label: 'Rod mass (1 m long)', unit: 'kg', min: 0, max: 2, step: 0.05, val: 0.4 },
      { id: 'tau', sym: 'τ', symText: 'τ', label: 'Torque applied', unit: 'N·m', min: 0.1, max: 5, step: 0.1, val: 1 }];
    return [
      { id: 'M', sym: 'M', symText: 'M', label: 'Mass', unit: 'kg', min: 0.5, max: 5, step: 0.1, val: 2 },
      { id: 'R', sym: 'R', symText: 'R or L', label: 'Radius (rods: length)', unit: 'm', min: 0.1, max: 1, step: 0.01, val: 0.3, graph: true },
      { id: 'tau', sym: 'τ', symText: 'τ', label: 'Torque applied', unit: 'N·m', min: 0.1, max: 5, step: 0.1, val: 1 }];
  },
  presets: [{ label: 'Beads in close', mode: 'beads', v: { r: 0.05 } }, { label: 'Beads at the ends', mode: 'beads', v: { r: 0.5 } }, { label: 'Massless rod', mode: 'beads', v: { M: 0 } }],
  calc(v, mode, opt){
    if (mode === 'beads'){ const Ib = 2 * v.m * v.r * v.r, Ir = v.M / 12, I = Ib + Ir, al = v.tau / I; return { Ib, Ir, I, al, t3: 0.5 * al * 9 }; }
    const s = SHAPES.find(x => x[0] === (opt.shape || 'hoop')), I = s[2] * v.M * v.R * v.R, al = v.tau / I;
    return { s, I, al, all: SHAPES.map(x => [x[1], x[2] * v.M * v.R * v.R, x[3]]) };
  },
  dvs(){ return [
    { id: 'I', name: 'Rotational inertia I', short: 'I', sym: 'I', unit: 'kg·m²', f: d => d.I },
    { id: 'al', name: 'Angular acceleration α = τ/I', short: 'α', sym: 'α', unit: 'rad/s²', f: d => d.al }]; },
  work(v, d, mode){
    if (mode === 'beads') return '<h4>1 · Rotational inertia: I = Σmr²</h4><div class="eq">Two beads: 2mr² = 2(' + H.iv('m') + ')(' + H.iv('r') + ')² = ' + H.n(d.Ib, 'kg·m²') + '</div>' +
      '<div class="eq">Rod about its center: (1/12)ML² = (1/12)(' + H.iv('M') + ')(1 m)² = ' + H.n(d.Ir, 'kg·m²') + '</div>' +
      '<div class="eq">Total I = <b>' + H.n(d.I, 'kg·m²') + '</b></div>' +
      '<h4>2 · Newton’s 2nd law for rotation: τ = Iα</h4><div class="eq">α = τ/I = ' + H.iv('tau') + ' / ' + H.n(d.I) + ' = <b>' + H.n(d.al, 'rad/s²') + '</b></div>' +
      '<p class="note">I depends on <b>where</b> the mass is, not just how much. Move the beads twice as far out: their part of I goes up ×4 (r²).</p>' +
      '<p class="note">Same idea as m in F = ma: bigger I, harder to change the spin.</p>';
    return '<h4>1 · I depends on the shape: where the mass sits relative to the axis</h4><div class="eq">' + d.s[1] + ': I = ' + d.s[3] + ' = ' + H.n(d.s[2]) + ' × (' + H.iv('M') + ')(' + H.iv('R') + ')² = <b>' + H.n(d.I, 'kg·m²') + '</b></div>' +
      '<p class="note">Hoop: all the mass at R → biggest (for the round shapes). Solid sphere: lots of mass near the center → smallest.</p>' +
      '<h4>2 · Same torque, different shapes</h4><div class="eq">α = τ/I = ' + H.iv('tau') + ' / ' + H.n(d.I) + ' = <b>' + H.n(d.al, 'rad/s²') + '</b></div>' +
      '<h4>3 · A rod: same rod, different axis</h4><div class="eq">About its center (1/12)ML², about one end (1/3)ML²: 4× bigger, because more of the mass is far from the axis.</div>' +
      '<p class="note">On the AP exam you’re given these formulas; the skill is comparing them and explaining why.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt; const tt = A.t % 3.5, q = Math.min(tt, 3), ang = 0.5 * d.al * q * q;
    if (mode === 'beads'){
      panelTitle('ROD WITH TWO BEADS (top view, starts from rest)', 10, 18);
      const cx = 190, cy = 165, sc = 240;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-ang);
      ctx.fillStyle = v.M > 0 ? '#9aa7b8' : '#ddd'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.fillRect(-0.5 * sc, -4, sc, 8); ctx.strokeRect(-0.5 * sc, -4, sc, 8);
      [-1, 1].forEach(sg => { const bs = 8 + 8 * Math.sqrt(v.m); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(sg * v.r * sc, 0, bs, 0, 7); ctx.fill(); ctx.stroke(); });
      ctx.restore(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 7); ctx.fill();
      text('after 3 s: ' + fplain(d.t3 / (2 * PI)) + ' rev', 12, 300, { font: '700 13px "Space Grotesk",sans-serif' });
      text('I = ' + fplain(d.I) + ' kg·m²   α = ' + fplain(d.al) + ' rad/s²', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('WHERE THE INERTIA COMES FROM', 395, 18);
      const mx = Math.max(d.I, 1e-6), bar = (y, val, col, lab) => { const w = 85 * val / mx; ctx.fillStyle = col; ctx.fillRect(470, y, w, 14); text(lab, 465, y + 11, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(val), 474 + w, y + 11, { font: '600 10px "IBM Plex Mono",monospace' }); };
      bar(45, d.Ib, '#ff6a2b', 'beads 2mr²'); bar(70, d.Ir, '#9aa7b8', 'rod ML²/12'); bar(95, d.I, '#111', 'total I');
      return;
    }
    panelTitle('SAME TORQUE ON EACH SHAPE (same M and R)', 10, 18);
    const all = d.all, amx = Math.max(...all.map(a => v.tau / a[1]));
    all.forEach(([name, I, f], i) => { const col = i % 3, row = Math.floor(i / 3), cx = 70 + col * 120, cy = 90 + row * 120, sel = SHAPES[i][0] === (opt.shape || 'hoop'), a = 0.5 * (v.tau / I) * q * q, r = 34;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-a); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5;
      const id = SHAPES[i][0];
      if (id === 'hoop'){ ctx.lineWidth = 6; ctx.strokeStyle = '#1546d6'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); }
      else if (id === 'disk'){ ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); }
      else if (id === 'shell'){ const g = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r); g.addColorStop(0, '#eef'); g.addColorStop(1, '#1546d6'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); }
      else if (id === 'ball'){ const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, '#0c2a8a'); g.addColorStop(1, '#6f8ff0'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); }
      else if (id === 'rodc'){ ctx.fillStyle = '#1546d6'; ctx.fillRect(-r, -4, 2 * r, 8); }
      else { ctx.fillStyle = '#1546d6'; ctx.fillRect(0, -4, 2 * r, 8); }
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; if (id !== 'rodc' && id !== 'rode'){ ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0); ctx.stroke(); }
      ctx.restore(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, 7); ctx.fill();
      if (sel){ ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 3; ctx.strokeRect(cx - 55, cy - 50, 110, 110); }
      text(name + '  ' + f, cx, cy + 50, { align: 'center', font: '700 10px "Space Grotesk",sans-serif' }); });
    panelTitle('ANGULAR ACCELERATION α = τ/I', 395, 18);
    all.forEach(([name, I], i) => { const y = 40 + i * 26, w = 70 * (v.tau / I) / amx; ctx.fillStyle = SHAPES[i][0] === (opt.shape || 'hoop') ? '#ff6a2b' : '#9aa7b8'; ctx.fillRect(490, y, w, 14); text(name, 485, y + 11, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(v.tau / I), 494 + w, y + 11, { font: '600 9px "IBM Plex Mono",monospace' }); });
    text('biggest I → smallest α', 395, 210, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
