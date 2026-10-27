const fint = x => Number.isInteger(x) ? String(x) : (Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2)).replace(/\.?0+$/, '');
// ABP Kinematics: Motion graphs (Physics Classroom style). Position–time: slope = velocity (rise/run). Velocity–time: slope = acceleration, area = displacement (rectangles and triangles, negative below the axis). No kinematic equations.
function stageWords(va, vb){
  if (va === 0 && vb === 0) return 'at rest';
  if (va * vb < 0) return 'moving in the ' + (va > 0 ? '+' : '−') + ' direction and slowing down, stops, then turns around and speeds up in the ' + (vb > 0 ? '+' : '−') + ' direction';
  const dir = (va || vb) > 0 ? '+' : '−';
  if (va === vb) return 'moving in the ' + dir + ' direction at a constant speed';
  return 'moving in the ' + dir + ' direction and ' + (Math.abs(vb) > Math.abs(va) ? 'speeding up' : 'slowing down') + (vb === 0 ? ' to a stop' : va === 0 ? ' from rest' : '');
}
const SIM = {
  title: 'Motion Graphs',
  hint: 'slope and area',
  noGraph: true,
  modes: [{ id: 'pt', label: 'Position–time graphs' }, { id: 'vt', label: 'Velocity–time graphs' }],
  opts: [{ id: 'T', label: 'Each stage lasts', choices: [['5', '5 s'], ['10', '10 s']] }],
  ivs(mode){
    if (mode === 'vt') return [
      { id: 'v0', sym: '', symText: 'v0', label: 'Velocity at the start', unit: 'm/s', show: x => fint(x) + ' m/s', min: -20, max: 20, step: 1, val: 0 },
      { id: 'v1', sym: '', symText: 'v1', label: 'Velocity at the end of stage 1', unit: 'm/s', show: x => fint(x) + ' m/s', min: -20, max: 20, step: 1, val: 20 },
      { id: 'v2', sym: '', symText: 'v2', label: 'Velocity at the end of stage 2', unit: 'm/s', show: x => fint(x) + ' m/s', min: -20, max: 20, step: 1, val: 20 },
      { id: 'v3', sym: '', symText: 'v3', label: 'Velocity at the end of stage 3', unit: 'm/s', show: x => fint(x) + ' m/s', min: -20, max: 20, step: 1, val: 0 }];
    return [
      { id: 'x0', sym: '', symText: 'x0', label: 'Starting position', unit: 'm', show: x => fint(x) + ' m', min: 0, max: 40, step: 5, val: 0 },
      { id: 'u1', sym: '', symText: 'v1', label: 'Stage 1 velocity', unit: 'm/s', show: x => fint(x) + ' m/s', min: -10, max: 10, step: 1, val: 4 },
      { id: 'u2', sym: '', symText: 'v2', label: 'Stage 2 velocity', unit: 'm/s', show: x => fint(x) + ' m/s', min: -10, max: 10, step: 1, val: 0 },
      { id: 'u3', sym: '', symText: 'v3', label: 'Stage 3 velocity', unit: 'm/s', show: x => fint(x) + ' m/s', min: -10, max: 10, step: 1, val: -6 }];
  },
  presets: [{ label: 'Walk, stop, walk back', mode: 'pt', v: { x0: 0, u1: 4, u2: 0, u3: -6 } }, { label: 'Fast then slow', mode: 'pt', v: { x0: 0, u1: 8, u2: 3, u3: 0 } }, { label: 'Speed up, cruise, stop', mode: 'vt', v: { v0: 0, v1: 20, v2: 20, v3: 0 } }, { label: 'Turns around', mode: 'vt', v: { v0: 20, v1: 0, v2: -20, v3: -20 } }],
  calc(v, mode, opt){
    const T = +(opt.T || 5);
    if (mode === 'pt'){ const us = [v.u1, v.u2, v.u3], xs = [v.x0]; us.forEach(u => xs.push(xs[xs.length - 1] + u * T)); return { T, us, xs, final: xs[3] }; }
    const vs = [v.v0, v.v1, v.v2, v.v3], st = [];
    for (let i = 0; i < 3; i++){ const va = vs[i], vb = vs[i + 1], a = (vb - va) / T, area = (va + vb) / 2 * T; let parts;
      if (va * vb < 0){ const t0 = T * va / (va - vb); parts = { cross: true, t0, A1: 0.5 * t0 * va, A2: 0.5 * (T - t0) * vb }; }
      else { const near = Math.abs(va) < Math.abs(vb) ? va : vb, far = near === va ? vb : va; parts = { cross: false, rect: near * T, tri: 0.5 * T * (far - near), near, far }; }
      st.push({ va, vb, a, area, parts, dist: parts.cross ? Math.abs(parts.A1) + Math.abs(parts.A2) : Math.abs(area) }); }
    const disp = st.reduce((s, x) => s + x.area, 0), dist = st.reduce((s, x) => s + x.dist, 0);
    return { T, vs, st, disp, dist };
  },
  dvs(){ return [{ id: 'x', name: 'x', short: 'x', sym: 'x', unit: 'm', f: d => d.final || d.disp }]; },
  work(v, d, mode){
    const sg = x => (x > 0 ? '+' : x < 0 ? '−' : '') + fint(Math.abs(x)), t = i => (i * d.T) + '–' + ((i + 1) * d.T) + ' s';
    if (mode === 'pt') return d.us.map((u, i) => '<h4>Stage ' + (i + 1) + ' (' + t(i) + ')</h4><div class="eq">slope = rise ÷ run = (' + fint(d.xs[i + 1]) + ' m − ' + fint(d.xs[i]) + ' m) ÷ ' + d.T + ' s = <b>' + sg(u) + ' m/s</b><br>' + stageWords(u, u).replace(/^./, c => c.toUpperCase()) + (u ? (Math.abs(u) >= 7 ? ' (fast: steep line).' : Math.abs(u) <= 2 ? ' (slow: gentle line).' : '.') : ' (flat line: zero slope).') + '</div>').join('') +
      '<p class="note">“As the slope goes, so goes the velocity.” Straight line = constant velocity. Uphill = + direction, downhill = − direction, flat = at rest. Final position: ' + fint(d.final) + ' m.</p>';
    let s = d.st.map((x, i) => { const p = x.parts, area = p.cross ? '½ · ' + fint(p.t0) + ' s · ' + sg(x.va) + ' m/s + ½ · ' + fint(d.T - p.t0) + ' s · ' + sg(x.vb) + ' m/s = ' + sg(p.A1) + ' m + ' + sg(p.A2) + ' m'
        : (p.near !== 0 ? 'rectangle ' + d.T + ' s × ' + sg(p.near) + ' m/s = ' + sg(p.rect) + ' m' : '') + (p.near !== 0 && p.far !== p.near ? '<br>+ ' : '') + (p.far !== p.near ? 'triangle ½ × ' + d.T + ' s × ' + sg(p.far - p.near) + ' m/s = ' + sg(p.tri) + ' m' : '') + (x.va === 0 && x.vb === 0 ? 'no area: at rest' : '');
      return '<h4>Stage ' + (i + 1) + ' (' + t(i) + ')</h4><div class="eq">' + stageWords(x.va, x.vb).replace(/^./, c => c.toUpperCase()) + '.<br>a = slope = Δv ÷ Δt = (' + sg(x.vb) + ' − ' + sg(x.va) + ') m/s ÷ ' + d.T + ' s = <b>' + sg(x.a) + ' m/s/s</b><br>Displacement = area: ' + area + ' → <b>' + sg(x.area) + ' m</b></div>'; }).join('');
    return s + '<h4>Whole trip</h4><div class="eq">Displacement = ' + d.st.map(x => sg(x.area)).join(' + ') + ' = <b>' + sg(d.disp) + ' m</b>' + (Math.abs(d.dist - Math.abs(d.disp)) > 1e-9 ? '; distance = <b>' + fint(d.dist) + ' m</b> (count area below the axis as positive)' : '') + '</div>' +
      '<p class="note">Area above the time axis = + displacement; area below = − displacement. The line crossing the axis means the object turned around.</p>';
  },
  draw(v, d, mode, opt, t){
    const T = d.T, tt = (t * (T / 5)) % (3 * T + 2), tc = Math.min(3 * T, tt);
    const gx = 50, gw = 330, X = s => gx + gw * s / (3 * T);
    const axes = (y0, h, ymin, ymax, lab, unit) => { const Y = val => y0 + h - h * (val - ymin) / (ymax - ymin); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, y0); ctx.lineTo(gx, y0 + h); ctx.lineTo(gx + gw, y0 + h); ctx.stroke();
      if (ymin < 0){ ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(gx, Y(0)); ctx.lineTo(gx + gw, Y(0)); ctx.stroke(); }
      for (let s = 0; s <= 3; s++){ ctx.strokeStyle = '#eee'; ctx.beginPath(); ctx.moveTo(X(s * T), y0); ctx.lineTo(X(s * T), y0 + h); ctx.stroke(); text(String(s * T), X(s * T), y0 + h + 13, { align: 'center', font: '500 10px "IBM Plex Mono",monospace' }); }
      [ymin, ymin < 0 ? 0 : null, ymax].filter(x => x !== null).forEach(val => text(String(val), gx - 4, Y(val) + 3, { align: 'right', font: '500 10px "IBM Plex Mono",monospace' }));
      text(lab + ' (' + unit + ')', gx - 4, y0 - 6, { font: '700 10px "IBM Plex Mono",monospace' }); text('t (s)', gx + gw, y0 + h + 26, { align: 'right', font: '600 10px "IBM Plex Mono",monospace' }); return Y; };
    const nice = x => Math.ceil(x / 10) * 10 || 10;
    if (mode === 'pt'){
      // position at time
      const xAt = s => { let x = v.x0; for (let i = 0; i < 3; i++){ const ds = Math.min(T, Math.max(0, s - i * T)); x += d.us[i] * ds; } return x; };
      const lo = Math.min(0, ...d.xs), hi = Math.max(...d.xs, 10), ymin = Math.floor(lo / 10) * 10, ymax = nice(hi);
      // track
      panelTitle('THE MOTION', 10, 18); const tx = p => 30 + 340 * (p - ymin) / (ymax - ymin); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(25, 52); ctx.lineTo(375, 52); ctx.stroke();
      ctx.fillStyle = '#1546d6'; ctx.fillRect(tx(xAt(tc)) - 10, 36, 20, 12); text(fint(xAt(tc)) + ' m', tx(xAt(tc)), 32, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' });
      const Y = axes(90, 200, ymin, ymax, 'position', 'm');
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 3; ctx.beginPath(); d.xs.forEach((x, i) => i ? ctx.lineTo(X(i * T), Y(x)) : ctx.moveTo(X(0), Y(x))); ctx.stroke();
      d.us.forEach((u, i) => { if (!u) return; const x1 = X(i * T), x2 = X((i + 1) * T), y1 = Y(d.xs[i]), y2 = Y(d.xs[i + 1]); ctx.strokeStyle = '#c43a00'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
        text('rise ' + (u * T > 0 ? '+' : '') + u * T, x2 > 340 ? x2 - 4 : x2 + 3, (y1 + y2) / 2 + 3, { align: x2 > 340 ? 'right' : 'left', font: '600 9px "IBM Plex Mono",monospace', col: '#c43a00' }); });
      ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(X(tc), Y(xAt(tc)), 5, 0, 7); ctx.fill();
      panelTitle('STAGES', 395, 18); d.us.forEach((u, i) => { const y = 48 + i * 60; text('Stage ' + (i + 1), 400, y, { font: '700 13px "Space Grotesk",sans-serif' }); text('slope = ' + (u > 0 ? '+' : '') + u + ' m/s', 400, y + 18, { font: '600 12px "IBM Plex Mono",monospace' }); text(u === 0 ? 'at rest' : (u > 0 ? '+ dir’n' : '− dir’n') + ', constant speed', 400, y + 34, { font: '500 11px "Space Grotesk",sans-serif', col: '#4a4a4a' }); });
      return;
    }
    const vmax = nice(Math.max(...d.vs.map(Math.abs), 10)), Y = axes(40, 230, -vmax, vmax, 'velocity', 'm/s');
    panelTitle('VELOCITY–TIME GRAPH (SHADED AREA = DISPLACEMENT)', 10, 18);
    // shaded areas
    for (let i = 0; i < 3; i++){ const va = d.vs[i], vb = d.vs[i + 1], t0 = i * T, t1 = (i + 1) * T, segs = va * vb < 0 ? [[t0, va, t0 + T * va / (va - vb), 0], [t0 + T * va / (va - vb), 0, t1, vb]] : [[t0, va, t1, vb]];
      segs.forEach(([a, p, b, q]) => { const pos = (p + q) >= 0; ctx.fillStyle = pos ? 'rgba(21,70,214,0.18)' : 'rgba(196,58,0,0.18)'; ctx.beginPath(); ctx.moveTo(X(a), Y(0)); ctx.lineTo(X(a), Y(p)); ctx.lineTo(X(b), Y(q)); ctx.lineTo(X(b), Y(0)); ctx.closePath(); ctx.fill(); });
      const st = d.st[i]; text((st.area > 0 ? '+' : '') + fint(st.area) + ' m', X(t0 + T / 2), Y(0) + (st.area >= 0 ? 16 : -8), { align: 'center', font: '700 11px "IBM Plex Mono",monospace', col: st.area >= 0 ? '#1546d6' : '#c43a00' }); }
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); d.vs.forEach((vv, i) => i ? ctx.lineTo(X(i * T), Y(vv)) : ctx.moveTo(X(0), Y(vv))); ctx.stroke();
    const vAt = s => { const i = Math.min(2, Math.floor(s / T)); return d.vs[i] + (d.vs[i + 1] - d.vs[i]) * (s - i * T) / T; }; ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(X(tc), Y(vAt(tc)), 5, 0, 7); ctx.fill();
    // right: stage table + mini p-t graph
    panelTitle('EACH STAGE', 395, 18); d.st.forEach((st, i) => { const y = 42 + i * 40; text('Stage ' + (i + 1) + ':  a = ' + (st.a > 0 ? '+' : '') + fint(st.a) + ' m/s/s', 400, y, { font: '600 12px "IBM Plex Mono",monospace' }); text('Δx = ' + (st.area > 0 ? '+' : '') + fint(st.area) + ' m', 400, y + 16, { font: '700 12px "IBM Plex Mono",monospace', col: st.area >= 0 ? '#1546d6' : '#c43a00' }); });
    text('total Δx = ' + (d.disp > 0 ? '+' : '') + fint(d.disp) + ' m', 400, 172, { font: '700 13px "Space Grotesk",sans-serif' });
    panelTitle('POSITION–TIME (SAME MOTION)', 395, 198);
    const xs = []; for (let k = 0; k <= 60; k++){ const s = 3 * T * k / 60; let x = 0; for (let j = 0; j < 60 && j < k; j++){ const s0 = 3 * T * j / 60; x += vAt(s0 + 3 * T / 120) * 3 * T / 60; } xs.push(x); }
    const lo = Math.min(0, ...xs), hi = Math.max(1, ...xs), px = k => 405 + 180 * k / 60, py = x => 300 - 85 * (x - lo) / (hi - lo);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(405, 210); ctx.lineTo(405, 300); ctx.lineTo(585, 300); ctx.stroke(); if (lo < 0){ ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(405, py(0)); ctx.lineTo(585, py(0)); ctx.stroke(); }
    ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); xs.forEach((x, k) => k ? ctx.lineTo(px(k), py(x)) : ctx.moveTo(px(0), py(x))); ctx.stroke();
    text('curved where the speed changes', 405, 316, { font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
