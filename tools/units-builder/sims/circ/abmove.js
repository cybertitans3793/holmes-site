const fint = x => Number.isInteger(x) ? String(x) : (Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2)).replace(/\.?0+$/, '');
// ABP Kinematics: Distance vs Displacement, Speed vs Velocity (Physics Classroom style). East/right = +. No kinematic equations.
const dirW = x => x > 0 ? 'east' : x < 0 ? 'west' : '';
const SIM = {
  title: 'Distance, Displacement & Velocity',
  hint: 'east = + · west = −',
  noGraph: true,
  modes: [{ id: 'walk', label: 'Walk east & west' }, { id: 'coach', label: 'Coach on the sideline' }, { id: 'trip', label: 'Round trip' }],
  ivs(mode){
    if (mode === 'coach') return [
      { id: 'A', sym: '', symText: 'A', label: 'Starts at (A)', unit: 'yd', show: x => fint(x) + ' yd', min: 0, max: 50, step: 5, val: 10 },
      { id: 'B', sym: '', symText: 'B', label: 'Walks to (B)', unit: 'yd', show: x => fint(x) + ' yd', min: 0, max: 50, step: 5, val: 40 },
      { id: 'C', sym: '', symText: 'C', label: 'Then to (C)', unit: 'yd', show: x => fint(x) + ' yd', min: 0, max: 50, step: 5, val: 0 },
      { id: 'D', sym: '', symText: 'D', label: 'Finishes at (D)', unit: 'yd', show: x => fint(x) + ' yd', min: 0, max: 50, step: 5, val: 30 },
      { id: 't', sym: '', symText: 't', label: 'Total time', unit: 's', show: x => fint(x) + ' s', min: 10, max: 300, step: 10, val: 100 }];
    if (mode === 'trip') return [
      { id: 'd', sym: '', symText: 'd', label: 'Distance to your friend’s house', unit: 'mi', show: x => fint(x) + ' mi', min: 1, max: 10, step: 0.5, val: 3 },
      { id: 't1', sym: '', symText: 't1', label: 'Time to run there', unit: 'min', show: x => fint(x) + ' min', min: 10, max: 120, step: 5, val: 30 },
      { id: 't2', sym: '', symText: 't2', label: 'Time to walk home', unit: 'min', show: x => fint(x) + ' min', min: 10, max: 180, step: 5, val: 60 }];
    return [
      { id: 'L1', sym: '', symText: 'leg1', label: 'Leg 1 (+ east, − west)', unit: 'm', show: x => fint(x) + ' m', min: -10, max: 10, step: 1, val: 6 },
      { id: 'L2', sym: '', symText: 'leg2', label: 'Leg 2', unit: 'm', show: x => fint(x) + ' m', min: -10, max: 10, step: 1, val: -4 },
      { id: 'L3', sym: '', symText: 'leg3', label: 'Leg 3', unit: 'm', show: x => fint(x) + ' m', min: -10, max: 10, step: 1, val: 0 }];
  },
  presets: [{ label: 'Rhee Verse (6 E, 4 W)', mode: 'walk', v: { L1: 6, L2: -4, L3: 0 } }, { label: 'Kent Decide (2 E, 8 W, 4 E)', mode: 'walk', v: { L1: 2, L2: -8, L3: 4 } }, { label: 'Round trip home', mode: 'walk', v: { L1: 5, L2: -5, L3: 0 } }, { label: 'Your turn: coach', mode: 'coach', v: { A: 30, B: 10, C: 50, D: 20, t: 200 } }],
  calc(v, mode){
    if (mode === 'coach'){ const legs = [v.B - v.A, v.C - v.B, v.D - v.C], dist = legs.reduce((a, b) => a + Math.abs(b), 0), disp = v.D - v.A; return { legs, dist, disp, sp: dist / v.t, vel: disp / v.t }; }
    if (mode === 'trip'){ const T = (v.t1 + v.t2) / 60; return { dist: 2 * v.d, disp: 0, T, sp: 2 * v.d / T }; }
    const legs = [v.L1, v.L2, v.L3], dist = legs.reduce((a, b) => a + Math.abs(b), 0), disp = legs.reduce((a, b) => a + b, 0); return { legs, dist, disp };
  },
  dvs(){ return [{ id: 'd', name: 'Distance', short: 'd', sym: 'd', unit: '', f: d => d.dist }]; },
  work(v, d, mode){
    const mn = (x, u) => '<mrow>' + (x < 0 ? '<mo>−</mo>' : '') + '<mn>' + fint(Math.abs(x)) + '</mn>' + M.u(u) + '</mrow>', mp = (x, u) => x < 0 ? '<mrow><mo>(</mo>' + mn(x, u) + '<mo>)</mo></mrow>' : mn(x, u);
    const sg = (x, u) => '<mrow>' + (x > 0 ? '<mo>+</mo>' : '') + mn(x, u) + '</mrow>', plus = a => a.join('<mo>+</mo>');
    if (mode === 'trip') return '<h4>Distance</h4><p class="st">There and back:</p>' + TEX`d = ${mn(v.d, 'mi')} + ${mn(v.d, 'mi')}` + TEXA`d = ${mn(d.dist, 'mi')}` +
      '<h4>Displacement</h4><p class="st">You finish where you started (a round trip), so displacement is zero.</p>' + TEXA`\Delta x = 0\,\text{mi}` +
      '<h4>Time</h4>' + TEX`t = t_1 + t_2` + TEX`t = ${mn(v.t1, 'min')} + ${mn(v.t2, 'min')}` + TEX`t = ${mn(v.t1 + v.t2, 'min')}` + TEXA`t = ${mn(d.T, 'hr')}` +
      '<h4>Average speed = distance ÷ time</h4>' + TEX`\text{speed} = \frac{d}{t}` + TEX`\text{speed} = \frac{${mn(d.dist, 'mi')}}{${mn(d.T, 'hr')}}` + TEXA`\text{speed} = ${mn(d.sp, 'mi/hr')}` +
      '<h4>Average velocity = displacement ÷ time</h4>' + TEX`\text{velocity} = \frac{\Delta x}{t}` + TEX`\text{velocity} = \frac{0\,\text{mi}}{${mn(d.T, 'hr')}}` + TEXA`\text{velocity} = 0\,\text{mi/hr}` +
      '<p class="note">You were moving the whole time, but your average velocity is zero: you ended up right back where you started.</p>';
    if (mode === 'coach'){ const where = d.disp ? '<mtext>' + (d.disp > 0 ? 'toward the 50' : 'toward the goal line') + '</mtext>' : '';
      return '<h4>Distance (add up every leg, ignore direction)</h4>' + TEX`d = ${plus(d.legs.map(x => mn(Math.abs(x), 'yd')))}` + TEXA`d = ${mn(d.dist, 'yd')}` +
      '<h4>Displacement (finish − start)</h4>' + TEX`\Delta x = x_D - x_A` + TEX`\Delta x = ${mn(v.D, 'yd')} - ${mn(v.A, 'yd')}` + TEXA`\Delta x = ${mn(Math.abs(d.disp), 'yd')}\ ${where}` +
      '<h4>Average speed = distance ÷ time</h4>' + TEX`\text{speed} = \frac{d}{t}` + TEX`\text{speed} = \frac{${mn(d.dist, 'yd')}}{${mn(v.t, 's')}}` + TEXA`\text{speed} = ${mn(d.sp, 'yd/s')}` +
      '<h4>Average velocity = displacement ÷ time</h4>' + TEX`\text{velocity} = \frac{\Delta x}{t}` + TEX`\text{velocity} = \frac{${mn(Math.abs(d.disp), 'yd')}}{${mn(v.t, 's')}}` + TEXA`\text{velocity} = ${mn(Math.abs(d.vel), 'yd/s')}\ ${where}` +
      '<p class="note">Distance and speed don’t care about direction. Displacement and velocity only care where he started and where he finished.</p>'; }
    const nz = d.legs.filter(x => x), changed = nz.some(x => Math.sign(x) !== Math.sign(nz[0])),
      dTerms = nz.length ? plus(nz.map(x => mn(Math.abs(x), 'm'))) : mn(0, 'm'),
      xTerms = nz.length ? nz.map((x, i) => (i ? '<mo>+</mo>' + mp(x, 'm') : mn(x, 'm'))).join('') : mn(0, 'm'),
      dirw = d.disp ? '<mtext>' + dirW(d.disp) + '</mtext>' : '';
    return '<h4>Distance (amount of ground covered)</h4>' + TEX`d = \left|\text{leg}_1\right| + \left|\text{leg}_2\right| + \left|\text{leg}_3\right|` + TEX`d = ${dTerms}` + TEXA`d = ${mn(d.dist, 'm')}` +
      '<h4>Displacement (overall change in position)</h4>' + TEX`\Delta x = \text{leg}_1 + \text{leg}_2 + \text{leg}_3` + TEX`\Delta x = ${xTerms}` + TEXA`\Delta x = ${mn(Math.abs(d.disp), 'm')}\ ${dirw}` +
      '<p class="note">' + (d.disp === 0 && d.dist > 0 ? 'Round trip: you finish where you started, so the displacement is 0.' : changed ? 'You changed direction, so distance and displacement are different. Displacement is a vector: west cancels east.' : 'No change of direction, so distance and displacement have the same number (but displacement also has a direction).') + '</p>';
  },
  draw(v, d, mode, opt, t){
    if (mode === 'trip'){
      panelTitle('YOUR HOUSE → FRIEND’S HOUSE → HOME', 10, 18);
      const house = (x, lab, col) => { ctx.fillStyle = col; ctx.fillRect(x - 22, 120, 44, 34); ctx.beginPath(); ctx.moveTo(x - 28, 122); ctx.lineTo(x, 96); ctx.lineTo(x + 28, 122); ctx.fill(); text(lab, x, 172, { align: 'center', font: '700 12px "Space Grotesk",sans-serif' }); };
      house(60, 'your house', '#1546d6'); house(340, 'friend’s house', '#c43a00');
      arrow(85, 196, 315, 196, '#111', null, { w: 3 }); text('run: ' + v.d + ' mi in ' + v.t1 + ' min', 200, 190, { align: 'center', font: '600 12px "IBM Plex Mono",monospace' });
      arrow(315, 236, 85, 236, '#8a8a8a', null, { w: 3 }); text('walk: ' + v.d + ' mi in ' + v.t2 + ' min', 200, 256, { align: 'center', font: '600 12px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      const ph = (t % 6) / 6, x = ph < 0.4 ? 60 + 280 * ph / 0.4 : 340 - 280 * (ph - 0.4) / 0.6; ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(x, 214, 7, 0, 7); ctx.fill();
      panelTitle('RESULTS', 395, 18); [['distance', fint(d.dist) + ' mi'], ['displacement', '0 mi'], ['total time', fint(d.T) + ' hr'], ['ave. speed', fint(d.sp) + ' mi/hr'], ['ave. velocity', '0 mi/hr']].forEach(([a, b], i) => { text(a, 400, 50 + i * 28, { font: '600 13px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 50 + i * 28, { align: 'right', font: '700 14px "IBM Plex Mono",monospace' }); });
      return;
    }
    const coach = mode === 'coach', X = coach ? (yd => 30 + 6.6 * yd) : (m => 195 + 9 * m);
    panelTitle(coach ? 'COACH ULCER PACES THE SIDELINE' : 'WALKING EAST AND WEST (1 m per tick)', 10, 18);
    if (coach){ ctx.fillStyle = '#3f8f4a'; ctx.fillRect(20, 40, 350, 230); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; for (let y = 0; y <= 50; y += 5){ ctx.beginPath(); ctx.moveTo(X(y), 40); ctx.lineTo(X(y), 270); ctx.stroke(); if (y % 10 === 0) text(String(y), X(y), 286, { align: 'center', font: '700 11px "IBM Plex Mono",monospace' }); } text('yard line', 200, 304, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
    else { ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(15, 270); ctx.lineTo(375, 270); ctx.stroke(); for (let m = -20; m <= 20; m++){ ctx.beginPath(); ctx.moveTo(X(m), 270); ctx.lineTo(X(m), m % 5 ? 275 : 280); ctx.stroke(); if (m % 5 === 0) text(String(m), X(m), 294, { align: 'center', font: '500 10px "IBM Plex Mono",monospace' }); } text('W ←', 20, 312, { font: '700 11px "Space Grotesk",sans-serif' }); text('→ E', 370, 312, { align: 'right', font: '700 11px "Space Grotesk",sans-serif' }); }
    const pts = coach ? [v.A, v.B, v.C, v.D] : [0, v.L1, v.L1 + v.L2, v.L1 + v.L2 + v.L3], cols = ['#1546d6', '#c43a00', '#7a3fb0'];
    for (let i = 0; i < 3; i++){ if (pts[i + 1] === pts[i]) continue; const y = 70 + i * 50; arrow(X(pts[i]), y, X(pts[i + 1]), y, coach ? '#fff' : cols[i], (coach ? 'ABC'[i] + '→' + 'BCD'[i] + ': ' : 'leg ' + (i + 1) + ': ') + Math.abs(pts[i + 1] - pts[i]) + (coach ? ' yd' : ' m'), { w: 3.5, ly: -12, lx: pts[i + 1] > pts[i] ? -4 : 4, align: pts[i + 1] > pts[i] ? 'right' : 'left' });
      ctx.setLineDash([2, 3]); ctx.strokeStyle = coach ? 'rgba(255,255,255,0.6)' : '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(pts[i + 1]), y); ctx.lineTo(X(pts[i + 1]), y + 50); ctx.stroke(); ctx.setLineDash([]); }
    const yb = 230; if (pts[3] !== pts[0]) arrow(X(pts[0]), yb, X(pts[3]), yb, '#ff6a2b', 'displacement', { w: 5, ly: -12, align: 'center', lx: (X(pts[0]) - X(pts[3])) / 2 });
    else text('displacement = 0', X(pts[0]), yb - 6, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: '#ff6a2b' });
    ctx.fillStyle = coach ? '#fff' : '#111'; ctx.beginPath(); ctx.arc(X(pts[0]), 70, 6, 0, 7); ctx.fill(); if (!coach){ ctx.fillStyle = '#111'; ctx.beginPath(); ctx.moveTo(X(pts[0]), 262); ctx.lineTo(X(pts[0]) - 6, 252); ctx.lineTo(X(pts[0]) + 6, 252); ctx.fill(); text('start', X(pts[0]) + 9, 258, { font: '700 10px "Space Grotesk",sans-serif' }); }
    panelTitle('RESULTS', 395, 18);
    const u = coach ? 'yd' : 'm', rows = [['distance', fint(d.dist) + ' ' + u], ['displacement', d.disp ? fint(Math.abs(d.disp)) + ' ' + u + (coach ? '' : ', ' + dirW(d.disp)) : '0 ' + u]];
    if (coach) rows.push(['ave. speed', fint(d.sp) + ' yd/s'], ['ave. velocity', fint(Math.abs(d.vel)) + ' yd/s']);
    rows.forEach(([a, b], i) => { text(a, 400, 50 + i * 28, { font: '600 13px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 50 + i * 28, { align: 'right', font: '700 14px "IBM Plex Mono",monospace' }); });
    text('distance: scalar', 400, 190, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('displacement: vector', 400, 208, { font: '600 11px "IBM Plex Mono",monospace', col: '#ff6a2b' });
  }
};
