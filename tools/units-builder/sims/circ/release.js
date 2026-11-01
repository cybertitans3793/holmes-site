// Cut the String (ABP circular motion): the velocity is tangent to the circle, the net force points to the centre, and when the inward force goes away the object goes straight (not outward). Plus the "centrifugal force" mistake from a turning car.
const SIM = {
  title: 'Cut the String',
  hint: 'v is tangent · F_net points to the centre · F_net = mv²/r · no force → straight line',
  modes: [{ id: 'whirl', label: 'Whirl and release' }, { id: 'car', label: 'Passenger in a turning car' }],
  opts: [{ id: 'door', label: 'Car door', modes: ['car'], choices: [['shut', 'Shut'], ['open', 'Open (no door!)']] }],
  ivs(mode){
    if (mode === 'car') return [{ id: 'v', sym: 'v', symText: 'v', label: 'Car speed', unit: 'm/s', min: 5, max: 25, step: 1, val: 15 }, { id: 'r', sym: 'r', symText: 'r', label: 'Radius of the turn', unit: 'm', min: 20, max: 100, step: 5, val: 50, graph: true }, { id: 'm', sym: 'm', symText: 'm', label: 'Passenger mass', unit: 'kg', min: 30, max: 100, step: 5, val: 60 }];
    return [{ id: 'rel', sym: '', symText: 'release', label: 'Release point (clock position)', unit: '', min: 0, max: 11, step: 1, val: 3, show: x => (x || 12) + ' o’clock' },
      { id: 'v', sym: 'v', symText: 'v', label: 'Speed', unit: 'm/s', min: 1, max: 8, step: 0.5, val: 4 },
      { id: 'r', sym: 'r', symText: 'r', label: 'String length (radius)', unit: 'm', min: 0.3, max: 1.5, step: 0.1, val: 0.8, graph: true },
      { id: 'm', sym: 'm', symText: 'm', label: 'Ball mass', unit: 'kg', min: 0.1, max: 1, step: 0.05, val: 0.2 }];
  },
  presets: [{ label: 'Let go at the top', mode: 'whirl', v: { rel: 0 } }, { label: 'Let go at 3 o’clock', mode: 'whirl', v: { rel: 3 } }, { label: 'Fast and short', mode: 'whirl', v: { v: 8, r: 0.4 } }, { label: 'Sharp turn', mode: 'car', v: { r: 20, v: 15 } }],
  calc(v){ const a = v.v * v.v / v.r; return { a, F: v.m * a }; },
  dvs(){ return [{ id: 'F', name: 'Net force (inward)', short: 'F_net', sym: 'F<sub>net</sub>', unit: 'N', f: d => d.F }, { id: 'a', name: 'Acceleration (inward)', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a }]; },
  work(v, d, mode){
    const calc = '<h4>2 · How big is the inward force?</h4><div class="eq">a = v²/r = (' + H.iv('v') + ')²/' + H.iv('r') + ' = <b>' + H.n(d.a, 'm/s²') + '</b><br>F<sub>net</sub> = ma = (' + H.iv('m') + ')(' + fnum(d.a) + ') = <b>' + H.n(d.F, 'N') + '</b> toward the centre</div>';
    if (mode === 'car') return '<h4>1 · What really happens</h4><div class="eq">Your body wants to keep going in a straight line (inertia). The car turns; the <b>door pushes you inward</b> to make you turn with it. You feel “thrown outward”, but nothing pushes you out: the car is turning under you.</div>' + calc.replace('inward force', 'door’s push') +
      '<p class="note">' + ((v.door || 'shut') === 'open' ? 'Door open: no inward force, so you go off in a straight line along the tangent, not straight out sideways.' : 'There is no “centrifugal force”. Look at it from the ground: the only horizontal force on you points to the centre.') + '</p>';
    return '<h4>1 · While it is on the string</h4><div class="eq">The velocity is always <b>tangent</b> to the circle. The string pulls <b>toward the centre</b>, so the net force (and the acceleration) point inward. The speed stays the same; only the direction changes.</div>' + calc +
      '<h4>3 · Cut the string</h4><div class="eq">No more inward force → no acceleration → the ball goes in a <b>straight line along the tangent</b>, in the direction it was moving at that instant. It does not fly straight outward.</div>' +
      '<p class="note">Seen from above (ignore gravity). Release at 3 o’clock while going counter-clockwise and the ball flies straight up the page.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const F = '"Space Grotesk",sans-serif', Mo = '"IBM Plex Mono",monospace';
    if (A.t === undefined || A.reset) { A.t = 0; A.reset = false; } A.t += dt || 0.016;
    if (mode === 'car') return drawCar(v, d, opt, A, F, Mo);
    panelTitle('SEEN FROM ABOVE', 10, 18);
    const cx = 190, cy = 170, R = 40 + v.r * 70, w = v.v / v.r * 0.35, relA = PI / 2 - v.rel * PI / 6; // clock → angle (12 = up)
    const circT = Math.max(3, 2 * PI / w * 1.25), cycle = circT + 2.5, tt = A.t % cycle;
    ctx.setLineDash([4, 5]); ctx.strokeStyle = '#b5b0a6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    for (let k = 0; k < 12; k++){ const a = PI / 2 - k * PI / 6; text(String(k || 12), cx + Math.cos(a) * (R + 16), cy - Math.sin(a) * (R + 16) + 4, { align: 'center', font: '500 9px ' + Mo, col: '#8a8a8a' }); }
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill();
    let bx, by, onStr;
    if (tt < circT){ const a = relA - w * (circT - tt); bx = cx + Math.cos(a) * R; by = cy - Math.sin(a) * R; onStr = true; }
    else { const s = tt - circT, sp = w * R; bx = cx + Math.cos(relA) * R - Math.sin(relA) * sp * s; by = cy - Math.sin(relA) * R - Math.cos(relA) * sp * s; onStr = false; }
    // predicted path
    const px = cx + Math.cos(relA) * R, py = cy - Math.sin(relA) * R; ctx.setLineDash([6, 4]); ctx.strokeStyle = 'rgba(30,125,69,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - Math.sin(relA) * 400, py - Math.cos(relA) * 400); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#1e7d45'; ctx.beginPath(); ctx.arc(px, py, 4, 0, 7); ctx.fill(); text('release', px + 8, py + 14, { font: '600 9px ' + F, col: '#1e7d45' });
    if (onStr){ ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke(); }
    ctx.save(); ctx.beginPath(); ctx.rect(14, 24, 370, 290); ctx.clip();
    ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, 9, 0, 7); ctx.fill(); ctx.stroke();
    const a = onStr ? relA - w * (circT - tt) : relA, tx = -Math.sin(a), ty = -Math.cos(a);
    arrow(bx, by, bx + tx * 50, by + ty * 50, '#1546d6', 'v', { w: 2.5, lx: 6, ly: -4 });
    if (onStr) arrow(bx, by, bx + (cx - bx) / R * 42, by + (cy - by) / R * 42, '#c43a00', 'F net', { w: 2.5, lx: 6, ly: 12 });
    ctx.restore();
    text(onStr ? 'on the string' : 'string cut: F net = 0', 20, 310, { font: '700 12px ' + F, col: onStr ? '#4a4a4a' : '#1e7d45' });
    panelTitle('WHILE ON THE STRING', 395, 18);
    [['speed', fplain(v.v) + ' m/s'], ['radius', fplain(v.r) + ' m'], ['a (inward)', fplain(d.a) + ' m/s²'], ['F net (inward)', fplain(d.F) + ' N'], ['after the cut', 'straight line']].forEach(([a2, b], i) => { text(a2, 400, 50 + i * 26, { font: '600 12px ' + F, col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px ' + Mo }); });
    text('blue = velocity · red = net force', 400, 300, { font: '500 10px ' + Mo, col: '#8a8a8a' });
  }
};
function drawCar(v, d, opt, A, F, Mo){
  const open = (opt.door || 'shut') === 'open';
  panelTitle('SEEN FROM ABOVE: CAR TURNING LEFT', 10, 18);
  const cx = 60, cy = 300, R = 220, w = 0.45, T = 3.2, tt = A.t % (T + 0.6), ang = Math.min(tt, T) * w; // starts heading up the page at the right
  ctx.strokeStyle = '#d9d4c7'; ctx.lineWidth = 46; ctx.beginPath(); ctx.arc(cx, cy, R, -PI / 2 - 0.05, 0.05); ctx.stroke();
  ctx.setLineDash([8, 8]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, -PI / 2, 0); ctx.stroke(); ctx.setLineDash([]);
  const th = -ang, car = [cx + R * Math.cos(th), cy + R * Math.sin(th)];
  ctx.save(); ctx.translate(car[0], car[1]); ctx.rotate(th); ctx.fillStyle = '#1546d6'; ctx.fillRect(-14, -24, 28, 48); ctx.restore();
  let p; const rel = 0.6;
  if (open && ang > rel){ const p0 = [cx + R * Math.cos(-rel), cy + R * Math.sin(-rel)], s = (ang - rel) * R; p = [p0[0] - Math.sin(rel) * s, p0[1] - Math.cos(rel) * s];
    ctx.setLineDash([5, 4]); ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p0[0] - Math.sin(rel) * 300, p0[1] - Math.cos(rel) * 300); ctx.stroke(); ctx.setLineDash([]); }
  else p = [car[0], car[1]];
  ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.arc(p[0], p[1], 8, 0, 7); ctx.fill(); ctx.stroke();
  const vx = -Math.sin(open && ang > rel ? rel : ang), vy = -Math.cos(open && ang > rel ? rel : ang);
  arrow(p[0], p[1], p[0] + vx * 46, p[1] + vy * 46, '#1546d6', 'v', { w: 2.5, lx: 6, ly: -4 });
  if (!(open && ang > rel)) arrow(p[0], p[1], p[0] + (cx - p[0]) / R * 40, p[1] + (cy - p[1]) / R * 40, '#c43a00', 'door push', { w: 2.5, lx: -4, ly: 14, align: 'right' });
  text(open && ang > rel ? 'no door: straight along the tangent' : 'the door pushes you inward', 20, 310, { font: '700 12px ' + F, col: open && ang > rel ? '#1e7d45' : '#c43a00' });
  panelTitle('THE PASSENGER', 395, 18);
  [['speed', v.v + ' m/s'], ['radius', v.r + ' m'], ['a (inward)', fplain(d.a) + ' m/s²'], ['door push (inward)', fplain(d.F) + ' N'], ['outward force?', 'none']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px ' + F, col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px ' + Mo }); });
  text('you feel “thrown out” because', 400, 200, { font: '600 11px ' + F, col: '#4a4a4a' }); text('your body keeps going straight', 400, 216, { font: '600 11px ' + F, col: '#4a4a4a' });
}
