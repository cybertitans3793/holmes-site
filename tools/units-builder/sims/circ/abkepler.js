// ABP Kepler's 2nd law (equal areas in equal times) and 3rd law (T² = a³ in years and AU). Original.
const fint = x => Number.isInteger(x) ? String(x) : (Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2)).replace(/\.?0+$/, '');
const PLANETS = [['Mercury', 0.387, 0.241], ['Venus', 0.723, 0.615], ['Earth', 1, 1], ['Mars', 1.524, 1.881], ['Jupiter', 5.203, 11.86], ['Saturn', 9.537, 29.46]];
const kepE = (M, e) => { let E = M; for (let i = 0; i < 30; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return E; };
const SIM = {
  title: 'Kepler’s 2nd & 3rd Laws',
  hint: 'equal areas in equal times · T² = a³',
  noGraph: true,
  modes: [{ id: 'second', label: '2nd law: equal areas' }, { id: 'third', label: '3rd law: T² = a³' }],
  ivs(mode){
    if (mode === 'third') return [{ id: 'a', sym: '', symText: 'a', label: 'Your planet’s distance from the Sun', unit: 'AU', show: x => fint(x) + ' AU', min: 0.3, max: 10, step: 0.1, val: 4 }];
    return [
      { id: 'e', sym: '', symText: 'e', label: 'How stretched the orbit is (eccentricity)', unit: '', show: x => fint(x), min: 0, max: 0.8, step: 0.05, val: 0.5 },
      { id: 'f', sym: '', symText: 'slice', label: 'Time slice (fraction of one orbit)', unit: '%', show: x => fint(x) + '% of a year', min: 4, max: 16, step: 1, val: 10 }];
  },
  presets: [{ label: 'Nearly a circle (Earth)', mode: 'second', v: { e: 0.02, f: 10 } }, { label: 'Very stretched (comet)', mode: 'second', v: { e: 0.8, f: 8 } }, { label: 'Jupiter', mode: 'third', v: { a: 5.2 } }, { label: 'Saturn', mode: 'third', v: { a: 9.5 } }],
  calc(v, mode){
    if (mode === 'third'){ const T = Math.pow(v.a, 1.5); return { T, T2: T * T, a3: v.a * v.a * v.a }; }
    const e = v.e, arc = (M0, M1) => { let s = 0, p = null; for (let i = 0; i <= 200; i++){ const E = kepE(M0 + (M1 - M0) * i / 200, e), q = [Math.cos(E), Math.sqrt(1 - e * e) * Math.sin(E)]; if (p) s += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; } return s; };
    const fr = v.f / 100, dP = arc(-PI * fr, PI * fr), dA = arc(PI - PI * fr, PI + PI * fr);
    return { e, fr, dP, dA, ratio: (1 + e) / (1 - e), rP: 1 - e, rA: 1 + e };
  },
  dvs(mode){ return mode === 'third' ? [{ id: 'T', name: 'Orbit time', short: 'T', sym: 'T', unit: 'yr', noTag: true, f: d => d.T }] : [{ id: 'ratio', name: 'Fastest ÷ slowest speed', short: 'ratio', sym: '', unit: '', noTag: true, f: d => d.ratio }]; },
  work(v, d, mode){
    if (mode === 'third') return '<h4>1 · Kepler’s 3rd law</h4><div class="eq">For every planet going around the Sun: <b>T² = a³</b><br>(T in years, a = average distance in AU; 1 AU = Earth–Sun distance)</div>' +
      '<h4>2 · Your planet</h4><div class="eq">a³ = ' + fint(v.a) + '³ = ' + fint(d.a3) + '<br>T² = ' + fint(d.a3) + ' → T = √' + fint(d.a3) + ' = <b>' + fint(d.T) + ' years</b></div>' +
      '<h4>3 · Check the ratio</h4><div class="eq">T² ÷ a³ = ' + fint(d.T2) + ' ÷ ' + fint(d.a3) + ' = <b>1</b> — the same for every planet in the table.</div>' +
      '<p class="note">Planets farther out take longer for two reasons: they have farther to go, and they move slower. Doubling the distance makes the year about 2.8 times longer, not 2 times.</p>';
    const pct = fint(v.f);
    return '<h4>1 · Kepler’s 2nd law</h4><div class="eq">A line from the Sun to the planet sweeps out <b>equal areas in equal times</b>.</div>' +
      '<h4>2 · The two shaded slices</h4><div class="eq">Each one takes ' + pct + '% of a year, so each one has the <b>same area</b> (' + pct + '% of the whole ellipse).</div>' +
      '<h4>3 · So the speed changes</h4><div class="eq">Close to the Sun the slice is short and wide: the planet covers more distance in the same time.<br>Distance near the Sun ÷ distance far away ≈ ' + fint(d.dP / d.dA) + '<br>Fastest ÷ slowest speed = (1 + e) ÷ (1 − e) = <b>' + fint(d.ratio) + '</b></div>' +
      '<p class="note">' + (v.e < 0.05 ? 'A circle: the planet is always the same distance from the Sun, so its speed never changes.' : 'Planets move fastest when closest to the Sun (perihelion) and slowest when farthest away (aphelion). Gravity speeds the planet up as it falls in, and slows it down as it climbs out.') + '</p>';
  },
  draw(v, d, mode, opt, t){
    if (mode === 'third'){
      panelTitle('TOP VIEW (NOT TO SCALE)', 10, 18);
      const cx = 200, cy = 165, R = a => 14 + 128 * Math.sqrt(a / 10);
      ctx.fillStyle = '#0d1424'; ctx.fillRect(12, 26, 376, 290);
      ctx.fillStyle = '#ffcc33'; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 7); ctx.fill();
      const orb = (a, T, col, lab, w) => { const r = R(a), th = 2 * PI * t / (4 * T); ctx.strokeStyle = col; ctx.globalAlpha = 0.45; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
        const x = cx + r * Math.cos(th), y = cy - r * Math.sin(th); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, w + 2.5, 0, 7); ctx.fill(); if (lab) text(lab, x + 7, y - 6, { font: '600 9px "IBM Plex Mono",monospace', col }); };
      PLANETS.forEach(([n, a, T]) => orb(a, T, '#9fb3d1', a > 1.6 ? n : '', 1));
      orb(v.a, d.T, '#ff6a2b', 'yours', 2);
      text('Earth goes around once every 4 s', 20, 308, { font: '600 10px "IBM Plex Mono",monospace', col: '#cfd8e6' });
      panelTitle('T² = a³ TABLE', 400, 18);
      const cols = [400, 462, 506, 548], hy = 44; ['planet', 'a (AU)', 'T (yr)', 'T²/a³'].forEach((h, i) => text(h, cols[i], hy, { font: '700 10px "IBM Plex Mono",monospace' }));
      const rows = PLANETS.map(([n, a, T]) => [n, a, T]).concat([['Yours', v.a, d.T]]);
      rows.forEach(([n, a, T], i) => { const y = hy + 24 + i * 30, me = n === 'Yours'; if (me){ ctx.fillStyle = '#ffe2d3'; ctx.fillRect(396, y - 15, 198, 22); }
        const f = { font: (me ? '700' : '600') + ' 11px "IBM Plex Mono",monospace', col: me ? '#c43a00' : '#111' };
        text(n, cols[0], y, f); text(fint(a), cols[1], y, f); text(fint(T), cols[2], y, f); text((T * T / (a * a * a)).toFixed(2), cols[3], y, f); });
      return;
    }
    panelTitle('A PLANET’S ORBIT (TOP VIEW)', 10, 18);
    const e = v.e, a = 150, b = a * Math.sqrt(1 - e * e), cx = 200 - a * e / 2, cy = 165, P = E => [cx + a * Math.cos(E), cy - b * Math.sin(E)], sx = cx + a * e;
    ctx.fillStyle = '#0d1424'; ctx.fillRect(12, 26, 376, 290);
    const sector = (M0, M1, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(sx, cy); for (let i = 0; i <= 60; i++){ const p = P(kepE(M0 + (M1 - M0) * i / 60, e)); ctx.lineTo(p[0], p[1]); } ctx.closePath(); ctx.fill(); };
    sector(-PI * d.fr, PI * d.fr, 'rgba(255,106,43,0.75)'); sector(PI - PI * d.fr, PI + PI * d.fr, 'rgba(70,140,255,0.75)');
    ctx.strokeStyle = '#cfd8e6'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(cx, cy, a, b, 0, 0, 7); ctx.stroke();
    ctx.fillStyle = '#ffcc33'; ctx.beginPath(); ctx.arc(sx, cy, 9, 0, 7); ctx.fill();
    const M = 2 * PI * ((t / 6) % 1), p = P(kepE(M, e)); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.moveTo(sx, cy); ctx.lineTo(p[0], p[1]); ctx.stroke();
    ctx.fillStyle = '#7fd1ff'; ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, 7); ctx.fill();
    text('close: fast', cx + a - 4, cy - b * 0.55 - 18, { align: 'right', font: '700 10px "Space Grotesk",sans-serif', col: '#ffb08a' });
    text('far: slow', cx - a + 4, cy - b * 0.55 - 18, { font: '700 10px "Space Grotesk",sans-serif', col: '#9cc2ff' });
    text('both slices take ' + fint(v.f) + '% of a year', 200, 308, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#cfd8e6' });
    panelTitle('SAME TIME, SAME AREA', 400, 18);
    const bar = (y, lab, val, col, mx) => { text(lab, 400, y, { font: '700 11px "Space Grotesk",sans-serif' }); ctx.fillStyle = col; ctx.fillRect(400, y + 6, 185 * val / mx, 16); text(fint(val), 404 + 185 * val / mx, y + 19, { font: '700 10px "IBM Plex Mono",monospace' }); };
    bar(46, 'Area of orange slice', v.f, '#ff6a2b', 16); bar(88, 'Area of blue slice', v.f, '#468cff', 16);
    const mx = Math.max(d.dP, d.dA); bar(140, 'Distance covered: orange', d.dP / mx * 10, '#ff6a2b', 11); bar(182, 'Distance covered: blue', d.dA / mx * 10, '#468cff', 11);
    text('areas in % of the ellipse', 400, 228, { font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('Speed close ÷ speed far', 400, 260, { font: '700 12px "Space Grotesk",sans-serif' }); text('= ' + fint(d.ratio) + (e < 0.05 ? ' (same speed)' : ''), 400, 284, { font: '700 18px "IBM Plex Mono",monospace', col: '#c43a00' });
  }
};
