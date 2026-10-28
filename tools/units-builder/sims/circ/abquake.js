// ABP Earthquake location lab: S–P time lag → distance → three circles → epicenter. P waves 8 km/s, S waves 4 km/s (simplified), so distance = 8 × (S − P). Original.
const fint = x => Number.isInteger(x) ? String(x) : (Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2)).replace(/\.?0+$/, '');
const VP = 8, VS = 4, STA = [['A', 100, 130, '#1546d6'], ['B', 500, 210, '#1e7d45'], ['C', 230, 610, '#7a3fb0']];
const rng = q => { let a = (q * 2654435761) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const QUAKE = q => { const r = rng(q + 7); let x, y; do { x = 60 + Math.round(r() * 48) * 10; y = 60 + Math.round(r() * 58) * 10; } while (STA.some(s => Math.hypot(s[1] - x, s[2] - y) < 120 || Math.hypot(s[1] - x, s[2] - y) > 600)); return { x, y, t0: 41 * 60 + Math.round(r() * 50) }; };
const clk = s => { s = Math.round(s); const m = Math.floor(s / 60), ss = s - 60 * m; return '10:' + String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0'); };
const wig = (t, tP, tS, k) => { const n = Math.sin(t * 2.9 + k) * Math.sin(t * 0.7 + 3 * k); let y = 0.035 * n;
  if (t >= tP){ const u = t - tP; y += (0.3 * Math.exp(-u / 14) + 0.07) * Math.sin(u * 2.4 + k); }
  if (t >= tS){ const u = t - tS; y += (0.8 * Math.exp(-u / 18) + 0.12) * Math.sin(u * 1.5 + 2 * k); } return Math.max(-1, Math.min(1, y)); };
const SIM = {
  title: 'Earthquake Location Lab',
  hint: 'P: 8 km/s · S: 4 km/s · distance = 8 × (S − P)',
  noGraph: true,
  modes: [{ id: 'how', label: 'How it works' }, { id: 'lab', label: 'Find the epicenter' }],
  opts: [{ id: 'chk', label: 'Answer', modes: ['lab'], choices: [['no', 'Hidden'], ['yes', 'Check my answer']] }],
  ivs(mode){
    if (mode === 'how') return [{ id: 'd', sym: '', symText: 'd', label: 'Distance from the earthquake to the station', unit: 'km', show: x => fint(x) + ' km', min: 80, max: 640, step: 40, val: 400 }];
    return [{ id: 'q', sym: '', symText: '#', label: 'Earthquake number (your teacher may assign one)', unit: '', show: x => '#' + x, min: 1, max: 30, step: 1, val: 1 },
      { id: 'r0', sym: '', symText: 'rA', label: 'Circle around station A', unit: 'km', show: x => fint(x) + ' km', min: 0, max: 800, step: 5, val: 0 },
      { id: 'r1', sym: '', symText: 'rB', label: 'Circle around station B', unit: 'km', show: x => fint(x) + ' km', min: 0, max: 800, step: 5, val: 0 },
      { id: 'r2', sym: '', symText: 'rC', label: 'Circle around station C', unit: 'km', show: x => fint(x) + ' km', min: 0, max: 800, step: 5, val: 0 }];
  },
  presets: [{ label: 'Close station (120 km)', mode: 'how', v: { d: 120 } }, { label: 'Far station (640 km)', mode: 'how', v: { d: 640 } }, { label: 'Start the lab (quake #1)', mode: 'lab', v: { q: 1, r0: 0, r1: 0, r2: 0 } }],
  calc(v, mode){
    if (mode === 'how') return { tP: v.d / VP, tS: v.d / VS, lag: v.d / VP };
    const Q = QUAKE(v.q), st = STA.map(([n, x, y, c], i) => { const D = Math.hypot(x - Q.x, y - Q.y), tP = Q.t0 + D / VP, tS = Q.t0 + D / VS; return { n, x, y, c, D, tP, tS, lag: tS - tP, w0: Math.floor((tP - 8 - (i * 2)) / 10) * 10, r: v['r' + i] }; });
    return { Q, st, col: 'ABCDEF'[Math.floor(Q.x / 100)], row: Math.floor(Q.y / 100) + 1 };
  },
  dvs(mode){ return [{ id: 'x', name: '—', short: '', sym: '', unit: '', noTag: true, f: () => 0 }]; },
  work(v, d, mode, opt){
    if (mode === 'how') return '<h4>1 · Two kinds of waves leave at the same moment</h4><div class="eq">P waves (push–pull) travel about <b>8 km/s</b>. S waves (side to side) travel about <b>4 km/s</b>. The P wave always arrives first.</div>' +
      '<h4>2 · Travel times for ' + fint(v.d) + ' km</h4><div class="eq">P: time = distance ÷ speed = ' + fint(v.d) + ' ÷ 8 = <b>' + fint(d.tP) + ' s</b><br>S: ' + fint(v.d) + ' ÷ 4 = <b>' + fint(d.tS) + ' s</b></div>' +
      '<h4>3 · The time lag (S − P)</h4><div class="eq">' + fint(d.tS) + ' − ' + fint(d.tP) + ' = <b>' + fint(d.lag) + ' s</b></div>' +
      '<h4>4 · Work backwards</h4><div class="eq">Every 1 s of lag means 8 km of distance:<br><b>distance = 8 × (S − P)</b> = 8 × ' + fint(d.lag) + ' = ' + fint(v.d) + ' km</div>' +
      '<p class="note">The farther away the station, the bigger the gap between the P and S waves — like seeing lightning before you hear thunder. (Real speeds vary with the rock; we use 8 and 4 km/s to keep the numbers simple.)</p>';
    const chk = opt.chk === 'yes';
    const rows = d.st.map(s => { const r = s.r, ok = r && Math.abs(r - s.D) <= 25;
      return '<tr><td style="color:' + s.c + '"><b>' + s.n + '</b></td>' + (chk ? '<td>' + clk(s.tP) + '</td><td>' + clk(s.tS) + '</td><td>' + fint(Math.round(s.lag)) + ' s</td><td>' + fint(Math.round(8 * Math.round(s.lag))) + ' km</td>' : '<td>?</td><td>?</td><td>?</td><td>?</td>') + '<td>' + (r ? fint(r) + ' km' + (chk ? (ok ? ' ✓' : ' ✗') : '') : '—') + '</td></tr>'; }).join('');
    return '<h4>1 · Read each seismogram</h4><div class="eq">Find the time the <b>P wave</b> starts (first small wiggles) and the <b>S wave</b> starts (big wiggles). Subtract: S − P.</div>' +
      '<h4>2 · Distance to each station</h4><div class="eq">distance = 8 km/s × (S − P)</div>' +
      '<h4>3 · Draw the circles</h4><div class="eq">Set each circle’s radius to that station’s distance. The quake is somewhere on each circle. Where all <b>three</b> circles cross is the <b>epicenter</b>. Name its grid square (like C4).</div>' +
      '<table style="width:100%;font:12px \'IBM Plex Mono\',monospace;border-collapse:collapse;margin:6px 0" border="1" cellpadding="3"><tr><th>Stn</th><th>P</th><th>S</th><th>S−P</th><th>dist.</th><th>your circle</th></tr>' + rows + '</table>' +
      (chk ? '<div class="eq">Epicenter of quake #' + v.q + ': grid square <b>' + d.col + d.row + '</b> (the star).</div>' : '<p class="note">Copy the table onto your lab sheet and fill in the ? boxes from the seismograms. Turn on <b>Check my answer</b> when you are done.</p>');
  },
  draw(v, d, mode, opt, t){
    const mono = '"IBM Plex Mono",monospace', sg = '"Space Grotesk",sans-serif';
    if (mode === 'how'){
      panelTitle('SIDE VIEW: WAVES RACE TO THE STATION', 10, 18);
      const x0 = 30, sc = 330 / 640, xs = x0 + v.d * sc, gy = 120, T = d.tS + 25, tt = (t * 16) % T;
      ctx.fillStyle = '#d9c7a6'; ctx.fillRect(12, gy, 376, 170); ctx.fillStyle = '#9ec98a'; ctx.fillRect(12, gy - 6, 376, 6);
      ctx.fillStyle = '#c43a00'; ctx.beginPath(); for (let k = 0; k < 10; k++){ const a = k * PI / 5, r = k % 2 ? 4 : 10; ctx.lineTo(x0 + r * Math.sin(a), gy + 18 - r * Math.cos(a)); } ctx.fill(); text('earthquake', x0, gy + 42, { align: 'center', font: '700 10px ' + sg, col: '#c43a00' });
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.moveTo(xs, gy - 22); ctx.lineTo(xs - 9, gy - 6); ctx.lineTo(xs + 9, gy - 6); ctx.fill(); text('station', xs, gy - 28, { align: 'center', font: '700 10px ' + sg });
      ctx.save(); ctx.beginPath(); ctx.rect(12, gy, 376, 170); ctx.clip();
      const pP = Math.min(xs, x0 + VP * tt * sc), pS = Math.min(xs, x0 + VS * tt * sc);
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x0, gy + 18, Math.max(1, pP - x0), -PI / 2, PI / 2); ctx.stroke();
      ctx.strokeStyle = '#c43a00'; ctx.beginPath(); ctx.arc(x0, gy + 18, Math.max(1, pS - x0), -PI / 2, PI / 2); ctx.stroke(); ctx.restore();
      text('P (8 km/s)', 20, 60, { font: '700 11px ' + sg, col: '#1546d6' }); text('S (4 km/s)', 110, 60, { font: '700 11px ' + sg, col: '#c43a00' });
      arrow(x0, gy + 150, xs, gy + 150, '#111', null, { w: 1.2, head: 5 }); arrow(xs, gy + 150, x0, gy + 150, '#111', null, { w: 1.2, head: 5 }); text(fint(v.d) + ' km', (x0 + xs) / 2, gy + 144, { align: 'center', font: '700 12px ' + sg });
      text('time since the quake: ' + Math.floor(tt) + ' s', 20, 80, { font: '700 12px ' + mono });
      // seismogram
      panelTitle('SEISMOGRAM AT THE STATION', 395, 18);
      const sx0 = 400, sw = 188, tm = 170, X = s => sx0 + sw * s / tm, cy = 120;
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; for (let s = 0; s <= tm; s += 10){ ctx.beginPath(); ctx.moveTo(X(s), 50); ctx.lineTo(X(s), 190); ctx.stroke(); if (s % 50 === 0) text(String(s), X(s), 204, { align: 'center', font: '600 9px ' + mono }); }
      text('seconds after the quake', 400, 218, { font: '600 9px ' + mono, col: '#4a4a4a' });
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); for (let s = 0; s <= Math.min(tt, tm); s += 0.25){ const y = cy - 60 * wig(s, d.tP, d.tS, 1); s ? ctx.lineTo(X(s), y) : ctx.moveTo(X(s), y); } ctx.stroke();
      if (tt > d.tP){ ctx.strokeStyle = '#1546d6'; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.moveTo(X(d.tP), 50); ctx.lineTo(X(d.tP), 190); ctx.stroke(); text('P', X(d.tP), 46, { align: 'center', font: '700 11px ' + sg, col: '#1546d6' }); }
      if (tt > d.tS){ ctx.strokeStyle = '#c43a00'; ctx.beginPath(); ctx.moveTo(X(d.tS), 50); ctx.lineTo(X(d.tS), 190); ctx.stroke(); text('S', X(d.tS), 46, { align: 'center', font: '700 11px ' + sg, col: '#c43a00' }); ctx.setLineDash([]);
        arrow(X(d.tP), 240, X(d.tS), 240, '#111', null, { w: 1.5, head: 5 }); text('S − P = ' + fint(d.lag) + ' s', (X(d.tP) + X(d.tS)) / 2, 258, { align: 'center', font: '700 12px ' + mono }); }
      ctx.setLineDash([]);
      text('distance = 8 × ' + fint(d.lag) + ' = ' + fint(v.d) + ' km', 400, 290, { font: '700 13px ' + sg, col: tt > d.tS ? '#c43a00' : '#bbb' });
      return;
    }
    // map
    const mx = 12, my = 28, k = 0.4, M = (x, y) => [mx + x * k, my + y * k];
    ctx.fillStyle = '#eef3e6'; ctx.fillRect(mx, my, 240, 280); ctx.strokeStyle = '#c9d3bd'; ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++){ ctx.beginPath(); ctx.moveTo(mx + i * 40, my); ctx.lineTo(mx + i * 40, my + 280); ctx.stroke(); }
    for (let j = 0; j <= 7; j++){ ctx.beginPath(); ctx.moveTo(mx, my + j * 40); ctx.lineTo(mx + 240, my + j * 40); ctx.stroke(); }
    for (let i = 0; i < 6; i++) for (let j = 0; j < 7; j++) text('ABCDEF'[i] + (j + 1), mx + i * 40 + 3, my + j * 40 + 10, { font: '500 8px ' + mono, col: '#9aa58c' });
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(mx, my, 240, 280);
    panelTitle('MAP (EACH SQUARE = 100 km)', 10, 18);
    ctx.save(); ctx.beginPath(); ctx.rect(mx, my, 240, 280); ctx.clip();
    d.st.forEach(s => { const [px, py] = M(s.x, s.y); if (s.r){ ctx.strokeStyle = s.c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, s.r * k, 0, 7); ctx.stroke(); } });
    if (opt.chk === 'yes'){ const [qx, qy] = M(d.Q.x, d.Q.y); ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); for (let q = 0; q < 10; q++){ const a = q * PI / 5, r = q % 2 ? 4 : 10; ctx.lineTo(qx + r * Math.sin(a), qy - r * Math.cos(a)); } ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    d.st.forEach(s => { const [px, py] = M(s.x, s.y); ctx.fillStyle = s.c; ctx.beginPath(); ctx.moveTo(px, py - 9); ctx.lineTo(px - 7, py + 5); ctx.lineTo(px + 7, py + 5); ctx.closePath(); ctx.fill(); text(s.n, px + 9, py + 4, { font: '700 12px ' + sg, col: s.c }); });
    text('quake #' + v.q, 14, 322, { font: '700 11px ' + mono });
    // seismograms
    const sx0 = 262, sw = 326, win = 110, X = s => sx0 + sw * s / win;
    panelTitle('SEISMOGRAMS (CLOCK TIME, 10:mm:ss)', 262, 18);
    d.st.forEach((s, i) => { const y0 = 30 + i * 96, cy = y0 + 42;
      ctx.fillStyle = '#fff'; ctx.fillRect(sx0, y0, sw, 70); ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.strokeRect(sx0, y0, sw, 70);
      for (let q = 0; q <= win; q += 2){ ctx.strokeStyle = q % 10 ? '#f0f0f0' : '#cfcfcf'; ctx.beginPath(); ctx.moveTo(X(q), y0); ctx.lineTo(X(q), y0 + 70); ctx.stroke(); if (q % 10 === 0 && q > 0 && q < win) text(clk(s.w0 + q).slice(3), X(q), y0 + 82, { align: 'center', font: '500 8px ' + mono, col: '#4a4a4a' }); }
      text('Station ' + s.n, sx0 + 4, y0 + 11, { font: '700 11px ' + sg, col: s.c });
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); for (let q = 0; q <= win; q += 0.15){ const y = cy - 30 * wig(s.w0 + q, s.tP, s.tS, i + 1); q ? ctx.lineTo(X(q), y) : ctx.moveTo(X(q), y); } ctx.stroke();
      if (opt.chk === 'yes'){ ctx.setLineDash([3, 2]); [[s.tP, '#1546d6', 'P'], [s.tS, '#c43a00', 'S']].forEach(([tt, c, l]) => { const xx = X(tt - s.w0); if (xx <= sx0 + sw){ ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(xx, y0); ctx.lineTo(xx, y0 + 70); ctx.stroke(); text(l, xx + 3, y0 + 22, { font: '700 10px ' + sg, col: c }); } }); ctx.setLineDash([]); } });
  }
};
