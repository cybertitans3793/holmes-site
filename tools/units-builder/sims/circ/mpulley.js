// Massive Pulley: the pulley's rotational inertia slows everything down, and the tensions on the two sides differ.
const SIM = {
  title: 'Massive Pulley',
  modes: [{ id: 'spool', label: 'Hanging from a spool' }, { id: 'atwood', label: 'Atwood' }, { id: 'table', label: 'Table + hanging mass' }],
  opts: [{ id: 'shape', label: 'Pulley', choices: [['disk', 'Disk ½MR²'], ['hoop', 'Hoop MR²']] }],
  ivs(mode){
    const l = [];
    if (mode === 'spool') l.push({ id: 'm', sym: 'm', symText: 'm', label: 'Hanging mass', unit: 'kg', min: 0.1, max: 5, step: 0.1, val: 1 });
    else l.push({ id: 'm1', sym: 'm<sub>1</sub>', symText: 'm1', label: mode === 'atwood' ? 'Left mass' : 'Block on the table', unit: 'kg', min: 0.1, max: 5, step: 0.1, val: mode === 'atwood' ? 3 : 2 },
      { id: 'm2', sym: 'm<sub>2</sub>', symText: 'm2', label: mode === 'atwood' ? 'Right mass' : 'Hanging mass', unit: 'kg', min: 0.1, max: 5, step: 0.1, val: mode === 'atwood' ? 1 : 1 });
    l.push({ id: 'M', sym: 'M', symText: 'M', label: 'Pulley mass', unit: 'kg', min: 0, max: 10, step: 0.1, val: 2, graph: true },
      { id: 'R', sym: 'R', symText: 'R', label: 'Pulley radius', unit: 'm', min: 0.05, max: 0.5, step: 0.01, val: 0.2 });
    return l;
  },
  presets: [{ label: 'Massless pulley', v: { M: 0 } }, { label: 'Heavy pulley', v: { M: 8 } }],
  calc(v, mode, opt){
    const k = opt.shape === 'hoop' ? 1 : 0.5, I = k * v.M * v.R * v.R, Ieff = k * v.M;   // I/R² = kM
    if (mode === 'spool'){ const a = v.m * G10 / (v.m + Ieff), T = v.m * (G10 - a); return { k, I, Ieff, a, T, al: a / v.R, a0: G10, T1: T, T2: 0, tau: T * v.R }; }
    if (mode === 'atwood'){ const a = (v.m1 - v.m2) * G10 / (v.m1 + v.m2 + Ieff), T1 = v.m1 * (G10 - a), T2 = v.m2 * (G10 + a), a0 = (v.m1 - v.m2) * G10 / (v.m1 + v.m2);
      return { k, I, Ieff, a, T1, T2, al: a / v.R, a0, tau: (T1 - T2) * v.R }; }
    const a = v.m2 * G10 / (v.m1 + v.m2 + Ieff), T1 = v.m1 * a, T2 = v.m2 * (G10 - a), a0 = v.m2 * G10 / (v.m1 + v.m2);
    return { k, I, Ieff, a, T1, T2, al: a / v.R, a0, tau: (T2 - T1) * v.R };
  },
  dvs(mode){ const l = [{ id: 'a', name: 'Acceleration of the masses', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a, vs: 'a0' }, { id: 'a0', name: 'Acceleration with a massless pulley', short: 'a₀', sym: 'a<sub>0</sub>', unit: 'm/s²', f: d => d.a0 }];
    if (mode === 'spool') l.push({ id: 'T1', name: 'String tension', short: 'T', sym: 'T', unit: 'N', f: d => d.T1 });
    else l.push({ id: 'T1', name: mode === 'atwood' ? 'Tension on the left' : 'Tension to the block', short: 'T1', sym: 'T<sub>1</sub>', unit: 'N', f: d => d.T1 }, { id: 'T2', name: mode === 'atwood' ? 'Tension on the right' : 'Tension to the hanging mass', short: 'T2', sym: 'T<sub>2</sub>', unit: 'N', f: d => d.T2 });
    l.push({ id: 'al', name: 'Pulley’s angular acceleration', short: 'α', sym: 'α', unit: 'rad/s²', f: d => d.al });
    return l; },
  work(v, d, mode, opt){
    const kS = opt.shape === 'hoop' ? 'MR²' : '½MR²', IR = opt.shape === 'hoop' ? 'M' : '½M';
    let h = '<h4>1 · The pulley: τ = Iα, with the string not slipping (a = Rα)</h4><div class="eq">I = ' + kS + ' = ' + H.n(d.I, 'kg·m²') + '</div>';
    if (mode === 'spool'){
      h += '<div class="eq">Torque from the string: TR = Iα = I(a/R) → T = (I/R²)a = ' + IR + '·a</div>' +
        '<h4>2 · The hanging mass (down = +): mg − T = ma</h4><div class="eq">mg − ' + IR + '·a = ma → <b>a = mg/(m + ' + IR + ')</b> = (' + H.iv('m') + ')(' + H.g() + ') / (' + H.iv('m') + ' + ' + H.n(d.Ieff) + ') = <b>' + H.n(d.a, 'm/s²') + '</b></div>' +
        '<div class="eq">T = m(g − a) = <b>' + H.n(d.T1, 'N') + '</b> (less than mg = ' + H.n(v.m * G10, 'N') + ')</div>' +
        '<div class="eq">α = a/R = ' + H.n(d.a) + ' / ' + H.iv('R') + ' = ' + H.n(d.al, 'rad/s²') + '</div>' +
        '<p class="note">R cancels out of a (I/R² = ' + IR + '), but not out of α. A massless pulley (M = 0) gives free fall: a = g.</p>';
      return h;
    }
    const at = mode === 'atwood';
    h += '<div class="eq">The two sides pull with <b>different</b> tensions; their difference turns the pulley: (' + (at ? 'T<sub>1</sub> − T<sub>2</sub>' : 'T<sub>2</sub> − T<sub>1</sub>') + ')R = Iα → ' + (at ? 'T<sub>1</sub> − T<sub>2</sub>' : 'T<sub>2</sub> − T<sub>1</sub>') + ' = ' + IR + '·a</div>' +
      '<h4>2 · Newton’s 2nd law for each mass</h4>' +
      (at ? '<div class="eq">Left (down +): m<sub>1</sub>g − T<sub>1</sub> = m<sub>1</sub>a &nbsp; Right (up +): T<sub>2</sub> − m<sub>2</sub>g = m<sub>2</sub>a</div>'
        : '<div class="eq">Block: T<sub>1</sub> = m<sub>1</sub>a &nbsp; Hanging (down +): m<sub>2</sub>g − T<sub>2</sub> = m<sub>2</sub>a</div>') +
      '<h4>3 · Add all three equations: the tensions cancel</h4><div class="eq">a = ' + (at ? '(m<sub>1</sub> − m<sub>2</sub>)g' : 'm<sub>2</sub>g') + ' / (m<sub>1</sub> + m<sub>2</sub> + ' + IR + ') = <b>' + H.n(d.a, 'm/s²') + '</b> (vs ' + H.n(d.a0, 'm/s²') + ' with a massless pulley)</div>' +
      '<div class="eq">T<sub>1</sub> = <b>' + H.n(d.T1, 'N') + '</b> &nbsp; T<sub>2</sub> = <b>' + H.n(d.T2, 'N') + '</b> → difference ' + H.n(Math.abs(d.T1 - d.T2), 'N') + ' = ' + IR + '·a ✓</div>' +
      '<p class="note">The pulley acts like an extra mass ' + IR + ' = ' + H.n(d.Ieff, 'kg') + ' that has to be accelerated, but it isn’t pulled by gravity in the direction of motion.</p>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt; const tt = A.t % 3, s = Math.min(0.5 * d.a * tt * tt * 25, 110), ang = s / 25 / v.R * 0.25;
    const pulley = (cx, cy, Rp) => { ctx.fillStyle = opt.shape === 'hoop' ? '#fff' : '#9aa7b8'; ctx.strokeStyle = '#111'; ctx.lineWidth = opt.shape === 'hoop' ? 6 : 1.5; ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, 7); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Rp * Math.cos(ang), cy + Rp * Math.sin(ang)); ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill(); };
    const box = (x, y, m, lab, col) => { const b = 18 + 12 * Math.sqrt(m); ctx.fillStyle = col; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(x - b / 2, y, b, b); ctx.strokeRect(x - b / 2, y, b, b); text(lab, x, y + b / 2 + 4, { align: 'center', font: '700 10px "Space Grotesk",sans-serif', col: '#fff' }); return b; };
    const Rp = 20 + v.R * 80, fs = 50 / G10;
    ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 2;
    if (mode === 'spool'){
      panelTitle('MASS HANGING FROM A SPOOL', 10, 18);
      const cx = 190, cy = 80; ctx.fillStyle = '#111'; ctx.fillRect(cx - 4, 28, 8, cy - 28);
      const y = 140 + s; ctx.beginPath(); ctx.moveTo(cx + Rp, cy); ctx.lineTo(cx + Rp, y); ctx.stroke(); pulley(cx, cy, Rp);
      const b = box(cx + Rp, y, v.m, 'm', '#ff6a2b');
      arrow(cx + Rp + b / 2 + 10, y + b / 2, cx + Rp + b / 2 + 10, y + b / 2 - d.T1 * fs / Math.max(v.m, 0.3), COL.T, 'T', { lx: 5, ly: 0 });
      arrow(cx + Rp + b / 2 + 26, y + b / 2, cx + Rp + b / 2 + 26, y + b / 2 + v.m * G10 * fs / Math.max(v.m, 0.3), COL.W, 'mg', { lx: 5, ly: 0 });
    } else if (mode === 'atwood'){
      panelTitle('ATWOOD MACHINE WITH A MASSIVE PULLEY', 10, 18);
      const cx = 190, cy = 70; ctx.fillStyle = '#111'; ctx.fillRect(cx - 4, 26, 8, cy - 26);
      const dir = Math.sign(d.a), y1 = 160 + dir * s * 0.6, y2 = 160 - dir * s * 0.6;
      ctx.beginPath(); ctx.moveTo(cx - Rp, cy); ctx.lineTo(cx - Rp, y1); ctx.moveTo(cx + Rp, cy); ctx.lineTo(cx + Rp, y2); ctx.stroke(); pulley(cx, cy, Rp);
      box(cx - Rp, y1, v.m1, 'm1', '#ff6a2b'); box(cx + Rp, y2, v.m2, 'm2', '#1546d6');
      text('T1 = ' + fplain(d.T1) + ' N', cx - Rp - 12, cy + 120, { align: 'right', font: '700 11px "IBM Plex Mono",monospace', col: COL.T });
      text('T2 = ' + fplain(d.T2) + ' N', cx + Rp + 12, cy + 120, { font: '700 11px "IBM Plex Mono",monospace', col: COL.T });
    } else {
      panelTitle('TABLE + HANGING MASS, MASSIVE PULLEY', 10, 18);
      const ty = 110, edge = 270, cx = edge + 6, cy = ty - 13 + Rp; ctx.fillStyle = '#e6dccb'; ctx.fillRect(20, ty, edge - 20, 12); ctx.fillRect(edge - 20, ty + 12, 10, 170);
      const bx = 80 + s; ctx.fillStyle = '#ff6a2b'; const bw = 30 + v.m1 * 8; ctx.fillRect(bx, ty - 26, bw, 26); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(bx, ty - 26, bw, 26); text('m1', bx + bw / 2, ty - 9, { align: 'center', font: '700 10px "Space Grotesk",sans-serif', col: '#fff' });
      ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + bw, ty - 13); ctx.lineTo(cx, ty - 13); ctx.moveTo(cx + Rp, cy); ctx.lineTo(cx + Rp, cy + 60 + s); ctx.stroke();
      pulley(cx, cy, Rp); box(cx + Rp, cy + 60 + s, v.m2, 'm2', '#1546d6');
      text('T1 = ' + fplain(d.T1) + ' N', 90, ty - 40, { font: '700 11px "IBM Plex Mono",monospace', col: COL.T });
      text('T2 = ' + fplain(d.T2) + ' N', cx + Rp + 30, 140, { font: '700 11px "IBM Plex Mono",monospace', col: COL.T });
    }
    text('a = ' + fplain(d.a) + ' m/s²   (massless pulley: ' + fplain(d.a0) + ')', 12, 300, { font: '700 13px "Space Grotesk",sans-serif' });
    text('α = ' + fplain(d.al) + ' rad/s²   I = ' + fplain(d.I) + ' kg·m²', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    panelTitle('MASSIVE vs MASSLESS PULLEY', 395, 18);
    const mx = Math.max(d.a0, 0.01), bar = (y, val, col, lab) => { const w = 85 * Math.abs(val) / mx; ctx.fillStyle = col; ctx.fillRect(470, y, w, 14); text(lab, 465, y + 11, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(val), 474 + w, y + 11, { font: '600 10px "IBM Plex Mono",monospace' }); };
    bar(45, d.a0, '#bbb', 'a, massless'); bar(70, d.a, '#ff6a2b', 'a, this one');
    if (mode !== 'spool'){ const tm = Math.max(d.T1, d.T2, 1); panelTitle('TENSIONS (N)', 395, 120); [[d.T1, 'T1'], [d.T2, 'T2']].forEach(([T, l], i) => { const w = 85 * T / tm; ctx.fillStyle = COL.T; ctx.fillRect(470, 135 + i * 25, w, 14); text(l, 465, 146 + i * 25, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(T), 474 + w, 146 + i * 25, { font: '600 10px "IBM Plex Mono",monospace' }); });
      text(Math.abs(d.T1 - d.T2) < 0.01 ? 'equal tensions (massless pulley)' : 'unequal: the difference spins the pulley', 395, 200, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
  }
};
