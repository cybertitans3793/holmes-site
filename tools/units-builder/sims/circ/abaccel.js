const fint = x => Number.isInteger(x) ? String(x) : (Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2)).replace(/\.?0+$/, '');
// ABP Kinematics: Acceleration as a rate (a = Δv/Δt) from velocity–time tables, the direction rules (speeding up / slowing down), and free fall (velocity changes by −10 m/s every second). No kinematic equations.
const SIM = {
  title: 'Acceleration',
  hint: 'a = Δv ÷ Δt · right = +',
  noGraph: true,
  modes: [{ id: 'car', label: 'Car speeding up / slowing down' }, { id: 'fall', label: 'Free fall' }],
  ivs(mode){
    if (mode === 'fall') return [{ id: 'v0', sym: '', symText: 'v0', label: 'Throw speed (up = +)', unit: 'm/s', show: x => fint(x) + ' m/s', min: 0, max: 40, step: 10, val: 30 }];
    return [
      { id: 'v0', sym: '', symText: 'v0', label: 'Starting velocity (+ right, − left)', unit: 'm/s', show: x => fint(x) + ' m/s', min: -30, max: 30, step: 1, val: 12 },
      { id: 'a', sym: '', symText: 'a', label: 'Change in velocity each second', unit: 'm/s/s', show: x => fint(x) + ' m/s/s', min: -10, max: 10, step: 1, val: 3 }];
  },
  presets: [{ label: 'From rest, +5 m/s/s', mode: 'car', v: { v0: 0, a: 5 } }, { label: 'Slowing down', mode: 'car', v: { v0: 25, a: -5 } }, { label: 'Moving left, speeding up', mode: 'car', v: { v0: -5, a: -3 } }, { label: 'Dropped', mode: 'fall', v: { v0: 0 } }],
  calc(v, mode){
    const a = mode === 'fall' ? -10 : v.a, n = mode === 'fall' ? (v.v0 ? Math.round(2 * v.v0 / 10) : 4) : 5, rows = [];
    for (let i = 0; i <= n; i++) rows.push([i, v.v0 + a * i]);
    return { a, rows, n, vEnd: v.v0 + a * n, tTop: v.v0 / 10 };
  },
  dvs(){ return [{ id: 'a', name: 'Acceleration', short: 'a', sym: 'a', unit: 'm/s/s', f: d => d.a }]; },
  work(v, d, mode){
    const sgn = x => (x > 0 ? '+' : '') + fint(x);
    if (mode === 'fall') return '<h4>1 · What is free fall?</h4><div class="eq">Gravity is the only force acting (ignore air resistance). The acceleration is 9.8 m/s/s down — about <b>10 m/s/s down</b> — no matter what the object weighs.</div>' +
      '<h4>2 · Velocity changes by −10 m/s every second</h4><div class="eq">' + d.rows.map(([t, vv]) => 't = ' + t + ' s: ' + sgn(vv) + ' m/s').join('<br>') + '</div>' +
      (v.v0 > 0 ? '<h4>3 · At the very top</h4><div class="eq">After ' + fint(d.tTop) + ' s the velocity is 0 m/s for an instant — but the acceleration is <b>still 10 m/s/s down</b>. Going up it slows down; coming down it speeds up.</div>' : '') +
      '<p class="note">Going up: velocity up, acceleration down → slowing down. Coming down: velocity down, acceleration down → speeding up. ' + (v.v0 > 0 ? 'It takes the same time to come back down to where it was thrown, and it is moving just as fast (' + fint(v.v0) + ' m/s, now downward).' : '') + '</p>';
    const moving = v.v0 > 0 ? '+ (right)' : v.v0 < 0 ? '− (left)' : 'at rest to start', speeding = d.a === 0 ? 'constant velocity' : v.v0 === 0 || Math.sign(v.v0) === Math.sign(d.a) ? 'speeding up' : 'slowing down';
    const flip = v.v0 !== 0 && d.a !== 0 && Math.sign(d.vEnd) !== Math.sign(v.v0) && d.vEnd !== 0;
    return '<h4>1 · Read the table: Δv each second</h4><div class="eq">Every 1 s the velocity changes by ' + sgn(d.a) + ' m/s' + (d.a ? ': that’s a <b>uniform</b> (constant) acceleration.' : ': no change at all.') + '</div>' +
      '<h4>2 · a = Δv ÷ Δt (first and last rows)</h4><div class="eq">a = (' + sgn(d.vEnd) + ' − ' + sgn(v.v0) + ') m/s ÷ 5 s = <b>' + sgn(d.a) + ' m/s/s</b></div>' +
      '<h4>3 · Direction</h4><div class="eq">Moving ' + moving + ', ' + speeding + '. ' + (d.a === 0 ? 'Not accelerating.' : 'Acceleration is <b>' + (d.a > 0 ? '+ (right)' : '− (left)') + '</b>: ' + (speeding === 'speeding up' ? 'same direction it moves (speeding up rule).' : 'opposite the direction it moves (slowing down rule).')) + '</div>' +
      (flip ? '<div class="bad">The velocity changes sign during the table: the car slows to a stop and turns around.</div>' : '') +
      '<p class="note">A negative acceleration doesn’t always mean slowing down — it means the acceleration points left. Speeding up or slowing down depends on whether v and a point the same way.</p>';
  },
  draw(v, d, mode, opt, t){
    const rowsDraw = (x0, y0) => { panelTitle('VELOCITY TABLE', x0, y0); text('t (s)', x0 + 5, y0 + 22, { font: '700 12px "IBM Plex Mono",monospace' }); text('v (m/s)', x0 + 70, y0 + 22, { font: '700 12px "IBM Plex Mono",monospace' }); text('Δv', x0 + 150, y0 + 22, { font: '700 12px "IBM Plex Mono",monospace', col: '#c43a00' });
      d.rows.slice(0, 9).forEach(([tt, vv], i) => { const y = y0 + 42 + i * 22; text(String(tt), x0 + 12, y, { font: '600 13px "IBM Plex Mono",monospace' }); text((vv > 0 ? '+' : '') + vv, x0 + 75, y, { font: '700 13px "IBM Plex Mono",monospace' }); if (i) text((d.a > 0 ? '+' : '') + d.a, x0 + 152, y - 11, { font: '600 11px "IBM Plex Mono",monospace', col: '#c43a00' }); }); };
    if (mode === 'fall'){
      panelTitle(v.v0 > 0 ? 'BALL THROWN STRAIGHT UP (ONE DOT EACH SECOND)' : 'BALL DROPPED (ONE DOT EACH SECOND)', 10, 18);
      const drop = v.v0 === 0, H0 = drop ? 5 * d.n * d.n : 0, top = drop ? H0 : v.v0 * v.v0 / 20, Y = h => 286 - 230 * h / Math.max(20, top);
      ctx.fillStyle = '#ccc'; ctx.fillRect(20, 288, 360, 5);
      if (!drop){ text('going up', 110, 44, { align: 'center', font: '700 11px "Space Grotesk",sans-serif' }); text('coming down', 280, 44, { align: 'center', font: '700 11px "Space Grotesk",sans-serif' }); }
      d.rows.forEach(([tt, vv]) => { const h = drop ? H0 - 5 * tt * tt : v.v0 * tt - 5 * tt * tt; if (h < -1e-6) return; const x = drop ? 200 : (vv > 0 ? 110 : vv < 0 ? 280 : 195), y = Y(h);
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill();
        if (vv) arrow(x, y, x, y - vv * 1.1 * Math.min(1, 40 / Math.max(...d.rows.map(r => Math.abs(r[1])))), '#1546d6', null, { w: 2.5, head: 6 }); arrow(x + 12, y - 6, x + 12, y + 10, '#c43a00', null, { w: 2, head: 5 });
        text('t=' + tt + ' s', x - 10, y - 2, { align: 'right', font: '600 10px "IBM Plex Mono",monospace' }); text((vv > 0 ? '+' : '') + vv + ' m/s', x - 10, y + 10, { align: 'right', font: '700 10px "IBM Plex Mono",monospace', col: '#1546d6' }); });
      text('blue: velocity  ·  red: acceleration (always 10 m/s/s down)', 12, 312, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      rowsDraw(400, 18); return;
    }
    panelTitle('DOT DIAGRAM: WHERE THE CAR IS EACH SECOND', 10, 18);
    let x = 0; const pos = [0]; for (let i = 1; i <= 5; i++){ x += (d.rows[i - 1][1] + d.rows[i][1]) / 2; pos.push(x); }
    const mn = Math.min(...pos), mx = Math.max(...pos), sc = 330 / Math.max(40, mx - mn), X = p => 30 + (p - mn) * sc;
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(15, 52, 370, 40);
    pos.forEach((p, i) => { ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(X(p), 72, 6, 0, 7); ctx.fill(); text(String(i), X(p), 108 + (i % 2) * 12, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); });
    panelTitle('VELOCITY ARROW EACH SECOND', 10, 148);
    ctx.strokeStyle = '#bbb'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(200, 156); ctx.lineTo(200, 300); ctx.stroke(); ctx.setLineDash([]);
    const vs = 150 / Math.max(10, ...d.rows.map(r => Math.abs(r[1])));
    d.rows.forEach(([tt, vv], i) => { const y = 170 + i * 24; text('t=' + tt, 24, y + 4, { font: '600 11px "IBM Plex Mono",monospace' }); if (vv) arrow(200, y, 200 + vv * vs, y, '#1546d6', null, { w: 3, head: 7 }); else { ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(200, y, 3, 0, 7); ctx.fill(); } });
    if (d.a) arrow(340, 230, 340 + Math.sign(d.a) * Math.min(40, Math.abs(d.a) * 4), 230, '#c43a00', 'a', { w: 4, ly: -12 });
    text('left (−)', 150, 316, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('right (+)', 250, 316, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    rowsDraw(400, 18);
  }
};
