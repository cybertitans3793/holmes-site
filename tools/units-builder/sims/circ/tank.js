// Leaky Tank: Torricelli v = √(2gh), where the stream lands, and which of three holes shoots farthest.
const SIM = {
  title: 'Leaky Tank',
  modes: [{ id: 'one', label: 'One hole' }, { id: 'three', label: 'Three holes' }],
  ivs(mode){
    if (mode === 'one') return [
      { id: 'h', sym: 'h', symText: 'h', label: 'Water depth above the hole', unit: 'm', min: 0.1, max: 5, step: 0.05, val: 1.8, graph: true },
      { id: 'y', sym: 'y', symText: 'y', label: 'Hole height above the ground', unit: 'm', min: 0.1, max: 5, step: 0.05, val: 1.25 },
      { id: 'a', sym: 'a', symText: 'a', label: 'Hole area', unit: 'cm²', min: 0.5, max: 10, step: 0.1, val: 2 },
      { id: 'Pg', sym: 'P<sub>top</sub>', symText: 'Ptop', label: 'Extra (gauge) pressure on top if sealed', unit: 'kPa', min: 0, max: 100, step: 1, val: 0 }];
    return [{ id: 'H', sym: 'H', symText: 'H', label: 'Water surface height above the ground', unit: 'm', min: 1, max: 6, step: 0.1, val: 4, graph: true }];
  },
  presets: [{ label: 'Open top', mode: 'one', v: { Pg: 0 } }, { label: 'Sealed + pumped', mode: 'one', v: { Pg: 50 } }],
  calc(v, mode){
    if (mode === 'one'){ const v2 = 2 * G10 * v.h + 2 * v.Pg * 1000 / 1000, sp = Math.sqrt(v2), tf = Math.sqrt(2 * v.y / G10), x = sp * tf, Q = v.a * 1e-4 * sp;
      return { sp, tf, x, Q, Lmin: Q * 60000, hEff: v.h + v.Pg * 1000 / (1000 * G10) }; }
    const holes = [0.25, 0.5, 0.75].map(f => { const y = f * v.H, h = v.H - y, s = Math.sqrt(2 * G10 * h), x = s * Math.sqrt(2 * y / G10); return { f, y, h, s, x }; });
    return { holes, xMid: holes[1].x, x: holes[1].x };
  },
  dvs(mode){
    if (mode === 'one') return [{ id: 'sp', name: 'Speed out of the hole', short: 'v', sym: 'v', unit: 'm/s', f: d => d.sp }, { id: 'x', name: 'Where it lands (from the tank)', short: 'x', sym: 'x', unit: 'm', f: d => d.x }, { id: 'Q', name: 'Volume flow rate', short: 'Q', sym: 'Q', unit: 'm³/s', f: d => d.Q }];
    return [{ id: 'xMid', name: 'Range from the middle hole', short: 'x_mid', sym: 'x<sub>mid</sub>', unit: 'm', f: d => d.xMid }];
  },
  work(v, d, mode){
    if (mode === 'one') return '<h4>1 · Bernoulli from the surface (point 1) to the hole (point 2)</h4><div class="eq">P<sub>1</sub> + ½ρv<sub>1</sub>² + ρgh = P<sub>2</sub> + ½ρv<sub>2</sub>² + 0. Wide tank: v<sub>1</sub> ≈ 0. ' + (v.Pg > 0 ? 'Top sealed: P<sub>1</sub> − P<sub>2</sub> = ' + H.iv('Pg') + '.' : 'Both open to the air: P<sub>1</sub> = P<sub>2</sub>.') + '</div>' +
      '<div class="eq">v = √(2gh' + (v.Pg > 0 ? ' + 2ΔP/ρ' : '') + ') = √(2(10)(' + H.iv('h') + ')' + (v.Pg > 0 ? ' + 2(' + H.n(v.Pg * 1000) + ')/1000' : '') + ') = <b>' + H.n(d.sp, 'm/s') + '</b></div>' +
      '<p class="note">Torricelli: the same speed as something dropped from the surface down to the hole.</p>' +
      '<h4>2 · Then it’s a horizontal projectile</h4><div class="eq">Fall time: t = √(2y/g) = √(2(' + H.iv('y') + ')/10) = ' + H.n(d.tf, 's') + '</div>' +
      '<div class="eq">Lands at x = vt = (' + H.n(d.sp) + ')(' + H.n(d.tf) + ') = <b>' + H.n(d.x, 'm') + '</b></div>' +
      '<h4>3 · Flow rate</h4><div class="eq">Q = av = (' + H.n(v.a * 1e-4, 'm²') + ')(' + H.n(d.sp) + ') = ' + H.n(d.Q, 'm³/s') + ' = ' + H.n(d.Lmin, 'L/min') + '</div>' +
      '<p class="note">As the tank drains, h drops, so v and x shrink: the stream gets weaker over time.</p>';
    const hs = d.holes;
    return '<h4>1 · Each hole: v = √(2gh) where h is the depth below the surface</h4><h4>2 · Each stream falls from height y = H − h: t = √(2y/g)</h4>' +
      '<div class="eq">x = vt = √(2gh)·√(2y/g) = <b>2√(hy)</b></div>' +
      hs.map((q, i) => '<div class="eq">' + ['Low', 'Middle', 'High'][i] + ' hole (y = ' + H.n(q.y, 'm') + ', h = ' + H.n(q.h, 'm') + '): v = ' + H.n(q.s, 'm/s') + ', x = ' + H.n(q.x, 'm') + '</div>').join('') +
      '<h4>3 · Which goes farthest?</h4><div class="eq">h + y = H is fixed, and hy is biggest when h = y: the <b>middle</b> hole, x = H = ' + H.iv('H') + '. The low and high holes (same hy) land at the same spot.</div>' +
      '<p class="note">The low hole squirts fastest but has the least time to fly; the high hole has lots of time but squirts slowly.</p>';
  },
  draw(v, d, mode){
    panelTitle(mode === 'one' ? 'LEAKY TANK' : 'THREE HOLES, ONE TANK', 10, 18);
    const gy = 290;
    if (mode === 'one'){
      const span = Math.max(d.x + 1.5, v.y + v.h + 0.5), sc = Math.min(260 / (v.y + v.h + 0.3), 340 / (d.x + 1.2)), tx = 30, tw = 70;
      const Y = q => gy - q * sc, X = q => tx + tw + q * sc;
      ctx.fillStyle = '#e6dccb'; ctx.fillRect(0, gy, 380, 30);
      ctx.fillStyle = '#9cc6f0'; ctx.fillRect(tx, Y(v.y + v.h), tw, (v.y + v.h) * sc - 0); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(tx, Y(v.y + v.h + 0.3), tw, (v.y + v.h + 0.3) * sc);
      if (v.Pg > 0){ ctx.fillStyle = '#555'; ctx.fillRect(tx, Y(v.y + v.h + 0.3) - 4, tw, 6); text('sealed, +' + fplain(v.Pg) + ' kPa', tx, Y(v.y + v.h + 0.3) - 10, { font: '600 9px "IBM Plex Mono",monospace' }); }
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 3; ctx.beginPath(); for (let k = 0; k <= 40; k++){ const q = d.tf * k / 40, px = X(d.sp * q), py = Y(v.y - 5 * q * q); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx + tw + 8, Y(v.y)); ctx.lineTo(tx + tw + 8, Y(v.y + v.h)); ctx.stroke(); text('h', tx + tw + 12, Y(v.y + v.h / 2), { font: '700 11px "Space Grotesk",sans-serif' });
      ctx.beginPath(); ctx.moveTo(tx - 8, Y(0)); ctx.lineTo(tx - 8, Y(v.y)); ctx.stroke(); text('y', tx - 18, Y(v.y / 2), { font: '700 11px "Space Grotesk",sans-serif' });
      text('x = ' + fplain(d.x) + ' m', X(d.x) - 10, gy - 6, { align: 'right', font: '700 11px "IBM Plex Mono",monospace', col: '#c43a00' }); ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(X(d.x), gy, 4, 0, 7); ctx.fill();
      text('v = ' + fplain(d.sp) + ' m/s   Q = ' + fplain(d.Lmin) + ' L/min', 12, 318, { font: '700 12px "Space Grotesk",sans-serif' });
      panelTitle('SPEED vs DEPTH h', 395, 18);
      const gx = 425, gy0 = 250, gw = 160, gh = 190, vm = Math.sqrt(2 * G10 * 5 + 200) , Xg = q => gx + gw * q / 5, Yg = q => gy0 - gh * q / vm;
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
      ctx.strokeStyle = COL.V; ctx.lineWidth = 2.5; ctx.beginPath(); for (let q = 0; q <= 5; q += 0.05){ const s = Math.sqrt(2 * G10 * q + 2 * v.Pg); q ? ctx.lineTo(Xg(q), Yg(s)) : ctx.moveTo(Xg(q), Yg(s)); } ctx.stroke();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(Xg(v.h), Yg(d.sp), 4, 0, 7); ctx.fill();
      text('v ∝ √h', 400, 290, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    const sc = 250 / Math.max(v.H + 0.3, v.H * 1.05 + 1), tx = 30, tw = 60, X = q => tx + tw + q * sc, Y = q => gy - q * sc;
    ctx.fillStyle = '#e6dccb'; ctx.fillRect(0, gy, 600, 30);
    ctx.fillStyle = '#9cc6f0'; ctx.fillRect(tx, Y(v.H), tw, v.H * sc); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(tx, Y(v.H + 0.3), tw, (v.H + 0.3) * sc);
    const cols = ['#1546d6', '#c43a00', '#1e7d45'];
    d.holes.forEach((q, i) => { ctx.strokeStyle = cols[i]; ctx.lineWidth = 2.5; const tf = Math.sqrt(2 * q.y / G10); ctx.beginPath(); for (let k = 0; k <= 40; k++){ const tt = tf * k / 40, px = X(q.s * tt), py = Y(q.y - 5 * tt * tt); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
      text(['low', 'middle', 'high'][i] + ' hole: ' + fplain(q.x) + ' m', 590, 62 + i * 18, { align: 'right', font: '700 11px "IBM Plex Mono",monospace', col: cols[i] }); });
    text('middle hole goes farthest: x = H', 590, 40, { align: 'right', font: '700 12px "Space Grotesk",sans-serif' });
  }
};
