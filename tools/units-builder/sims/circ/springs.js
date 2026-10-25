// Springs: Hooke's law with hanging masses, then springs in series and in parallel.
const SIM = {
  title: 'Springs',
  modes: [{ id: 'one', label: 'One spring (Hooke’s law)' }, { id: 'series', label: 'Two in series' }, { id: 'parallel', label: 'Two in parallel' }],
  ivs(mode){
    const l = [{ id: 'm', sym: 'm', symText: 'm', label: 'Hanging mass', unit: 'kg', min: 0, max: 2, step: 0.05, val: 0.5, graph: true },
               { id: 'k1', sym: 'k<sub>1</sub>', symText: 'k1', label: mode === 'one' ? 'Spring constant' : 'Spring 1 constant', unit: 'N/m', min: 5, max: 100, step: 1, val: 20 }];
    if (mode !== 'one') l.push({ id: 'k2', sym: 'k<sub>2</sub>', symText: 'k2', label: 'Spring 2 constant', unit: 'N/m', min: 5, max: 100, step: 1, val: 40 });
    return l;
  },
  presets: [{ label: 'Equal springs', v: { k1: 30, k2: 30 } }, { label: '100 g mass', v: { m: 0.1 } }, { label: '1 kg mass', v: { m: 1 } }],
  calc(v, mode){
    const F = v.m * G10, k2 = v.k2 || 0;
    const keff = mode === 'one' ? v.k1 : mode === 'series' ? 1 / (1 / v.k1 + 1 / k2) : v.k1 + k2;
    const x = F / keff, U = 0.5 * keff * x * x;
    const o = { F, keff, x, U };
    if (mode === 'series'){ o.x1 = F / v.k1; o.x2 = F / k2; o.F1 = F; o.F2 = F; }
    if (mode === 'parallel'){ o.x1 = o.x2 = x; o.F1 = v.k1 * x; o.F2 = k2 * x; }
    if (mode !== 'one'){ o.U1 = 0.5 * v.k1 * o.x1 * o.x1; o.U2 = 0.5 * k2 * o.x2 * o.x2; }
    return o;
  },
  dvs(mode){ const l = [
      { id: 'x', name: 'Total stretch', short: 'x', sym: 'x', unit: 'm', f: d => d.x },
      { id: 'keff', name: 'Effective spring constant', short: 'k_eff', sym: 'k<sub>eff</sub>', unit: 'N/m', f: d => d.keff },
      { id: 'F', name: 'Weight / spring force mg', short: 'F', sym: 'F', unit: 'N', f: d => d.F },
      { id: 'U', name: 'Elastic energy stored ½k_eff x²', short: 'U_s', sym: 'U<sub>s</sub>', unit: 'J', f: d => d.U }];
    if (mode !== 'one') l.push({ id: 'F1', name: 'Force in spring 1', short: 'F1', sym: 'F<sub>1</sub>', unit: 'N', f: d => d.F1, vs: 'F2' }, { id: 'F2', name: 'Force in spring 2', short: 'F2', sym: 'F<sub>2</sub>', unit: 'N', f: d => d.F2 });
    return l; },
  work(v, d, mode){
    let h = '<h4>1 · The mass hangs at rest, so the spring force balances the weight</h4><div class="eq">F<sub>spring</sub> = mg = (' + H.iv('m') + ')(' + H.g() + ') = <b>' + H.n(d.F, 'N') + '</b></div>';
    if (mode === 'one') return h + '<h4>2 · Hooke’s law</h4><div class="eq">F = kx → x = F/k = ' + H.n(d.F, 'N') + ' / ' + H.iv('k1') + ' = <b>' + H.n(d.x, 'm') + '</b> = ' + H.n(d.x * 100, 'cm') + '</div>' +
      '<p class="note">Double the mass → double the stretch (until the spring is overstretched). The slope of F vs x is k: a stiffer spring has a steeper line.</p>' +
      '<h4>3 · Energy stored</h4><div class="eq">U<sub>s</sub> = ½kx² = ½(' + H.iv('k1') + ')(' + H.n(d.x) + ')² = ' + H.n(d.U, 'J') + ' (area under F vs x)</div>';
    if (mode === 'series') h += '<h4>2 · In series, each spring feels the whole weight</h4><div class="eq">F<sub>1</sub> = F<sub>2</sub> = ' + H.n(d.F, 'N') + '</div>' +
      '<div class="eq">x<sub>1</sub> = F/k<sub>1</sub> = ' + H.n(d.x1, 'm') + ', x<sub>2</sub> = F/k<sub>2</sub> = ' + H.n(d.x2, 'm') + '</div>' +
      '<h4>3 · The stretches add</h4><div class="eq">x = x<sub>1</sub> + x<sub>2</sub> = <b>' + H.n(d.x, 'm') + '</b></div>' +
      '<h4>4 · Effective spring constant (softer than either)</h4><div class="eq">1/k<sub>eff</sub> = 1/k<sub>1</sub> + 1/k<sub>2</sub> = 1/' + H.iv('k1') + ' + 1/' + H.iv('k2') + ' → k<sub>eff</sub> = <b>' + H.n(d.keff, 'N/m') + '</b></div>' +
      '<p class="note">Check: F/k<sub>eff</sub> = ' + H.n(d.F / d.keff, 'm') + ' ✓. Two equal springs in series act like one spring with half the k.</p>';
    else h += '<h4>2 · In parallel, both springs stretch the same amount</h4><div class="eq">x<sub>1</sub> = x<sub>2</sub> = x</div>' +
      '<h4>3 · The forces add up to the weight</h4><div class="eq">k<sub>1</sub>x + k<sub>2</sub>x = mg → x = mg/(k<sub>1</sub> + k<sub>2</sub>) = ' + H.n(d.F) + ' / (' + H.iv('k1') + ' + ' + H.iv('k2') + ') = <b>' + H.n(d.x, 'm') + '</b></div>' +
      '<div class="eq">F<sub>1</sub> = k<sub>1</sub>x = ' + H.n(d.F1, 'N') + ', F<sub>2</sub> = k<sub>2</sub>x = ' + H.n(d.F2, 'N') + ' (the stiffer spring carries more)</div>' +
      '<h4>4 · Effective spring constant (stiffer than either)</h4><div class="eq">k<sub>eff</sub> = k<sub>1</sub> + k<sub>2</sub> = <b>' + H.n(d.keff, 'N/m') + '</b></div>';
    h += '<h4>5 · Energy stored</h4><div class="eq">U<sub>s</sub> = ½k<sub>eff</sub>x² = ' + H.n(d.U, 'J') + ' (spring 1: ' + H.n(d.U1, 'J') + ', spring 2: ' + H.n(d.U2, 'J') + ')</div>';
    return h;
  },
  draw(v, d, mode){
    panelTitle(mode === 'one' ? 'HOOKE’S LAW' : mode === 'series' ? 'SERIES (one below the other)' : 'PARALLEL (side by side)', 10, 18);
    const top = 34, L0 = 60, cmPx = 2.2; // 1 cm = 2.2 px, up to ~1.2 m on screen
    const spring = (x, y1, y2, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.beginPath(); const n = 14; ctx.moveTo(x, y1); ctx.lineTo(x, y1 + 6); for (let i = 1; i < n; i++) ctx.lineTo(x + (i % 2 ? -9 : 9), y1 + 6 + (y2 - y1 - 12) * i / n); ctx.lineTo(x, y2 - 6); ctx.lineTo(x, y2); ctx.stroke(); };
    const cx = 150; ctx.fillStyle = '#111'; ctx.fillRect(cx - 70, top - 8, 140, 8);
    let yEnd;
    const px = q => Math.min(250, q * 100 * cmPx);
    if (mode === 'one'){ yEnd = top + L0 + px(d.x); spring(cx, top, yEnd, '#7a3fb0'); }
    else if (mode === 'series'){ const y1 = top + L0 + px(d.x1); spring(cx, top, y1, '#7a3fb0'); ctx.fillStyle = '#111'; ctx.fillRect(cx - 8, y1, 16, 5); yEnd = y1 + 5 + L0 * 0.6 + px(d.x2); spring(cx, y1 + 5, yEnd, '#1546d6'); text('k1', cx + 14, (top + y1) / 2, { font: '700 12px "Space Grotesk",sans-serif', col: '#7a3fb0' }); text('k2', cx + 14, (y1 + yEnd) / 2, { font: '700 12px "Space Grotesk",sans-serif', col: '#1546d6' }); }
    else { yEnd = top + L0 + px(d.x); spring(cx - 30, top, yEnd, '#7a3fb0'); spring(cx + 30, top, yEnd, '#1546d6'); ctx.fillStyle = '#111'; ctx.fillRect(cx - 42, yEnd, 84, 5); yEnd += 5; text('k1', cx - 62, (top + yEnd) / 2, { font: '700 12px "Space Grotesk",sans-serif', col: '#7a3fb0' }); text('k2', cx + 42, (top + yEnd) / 2, { font: '700 12px "Space Grotesk",sans-serif', col: '#1546d6' }); }
    if (v.m > 0){ const bs = 16 + 18 * Math.sqrt(v.m); ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(cx - bs / 2, yEnd, bs, bs); ctx.strokeRect(cx - bs / 2, yEnd, bs, bs); text(fplain(v.m) + ' kg', cx + bs / 2 + 4, yEnd + bs / 2 + 4, { font: '600 11px "IBM Plex Mono",monospace' }); }
    // ruler
    const rx = 60, unstretched = top + (mode === 'series' ? L0 + 5 + L0 * 0.6 : mode === 'parallel' ? L0 + 5 : L0);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(rx, unstretched); ctx.lineTo(rx, 322); ctx.stroke();
    for (let c = 0; c * cmPx <= 322 - unstretched; c += 5){ const y = unstretched + c * cmPx; ctx.beginPath(); ctx.moveTo(rx, y); ctx.lineTo(rx + (c % 10 ? 5 : 10), y); ctx.stroke(); if (c % 20 === 0) text(c + '', rx - 4, y + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
    text('cm', rx - 4, unstretched - 6, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    ctx.strokeStyle = '#ff6a2b'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(rx, yEnd); ctx.lineTo(cx - 20, yEnd); ctx.stroke(); ctx.setLineDash([]);
    text('x = ' + fplain(d.x * 100) + ' cm', 190, 318, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' });
    // F vs x plot with lines for each spring and the effective spring
    panelTitle('FORCE vs STRETCH', 330, 18);
    const gx0 = 350, gy0 = 290, gw = 230, gh = 240, xm = Math.max(0.5, d.x * 1.3), Fm = 22;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx0, gy0 - gh); ctx.lineTo(gx0, gy0); ctx.lineTo(gx0 + gw, gy0); ctx.stroke();
    const P = (x, F) => [gx0 + gw * x / xm, gy0 - gh * Math.min(F, Fm * 1.05) / Fm];
    const line = (k, col, lab, dash) => { const xe = Math.min(xm, Fm / k); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(...P(0, 0)); ctx.lineTo(...P(xe, k * xe)); ctx.stroke(); ctx.setLineDash([]); const e = P(xe, k * xe), edge = xe >= xm * 0.999; text(lab, edge ? e[0] - 4 : e[0] + 3, edge ? e[1] - 8 : e[1] + 4, { align: edge ? 'right' : 'left', font: '700 11px "Space Grotesk",sans-serif', col }); };
    if (mode === 'one') line(v.k1, '#7a3fb0', 'k');
    else { line(v.k1, '#7a3fb0', 'k1', [4, 3]); line(v.k2, '#1546d6', 'k2', [4, 3]); line(d.keff, '#111', 'k_eff'); }
    if (v.m > 0){ ctx.fillStyle = 'rgba(122,63,176,0.18)'; ctx.beginPath(); ctx.moveTo(...P(0, 0)); ctx.lineTo(...P(d.x, 0)); ctx.lineTo(...P(d.x, d.F)); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.arc(...P(d.x, d.F), 5, 0, 7); ctx.fill(); ctx.stroke(); }
    text('F (N)', gx0 - 4, gy0 - gh - 6, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('x (m) → ' + fplain(xm), gx0 + gw, gy0 + 14, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('slope = k, shaded area = ½kx²', gx0 + 6, gy0 - gh + 12, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
