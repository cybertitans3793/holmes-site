// Force Pairs (ABP Newton's 3rd law): pick an interaction and see the two forces: equal size, opposite direction, on different objects. Then a = F/m shows why the effects are so different.
const PAIRS = {
  bat:    { A: ['Bat', 1.0], B: ['Ball', 0.145], F: [500, 8000, 4000], onA: 'the ball pushes the bat', onB: 'the bat pushes the ball', sA: 'bat', sB: 'ball', col: ['#8a5a2b', '#f2efe6'] },
  bug:    { A: ['Truck', 10000], B: ['Bug', 0.001], F: [0.5, 5, 2], onA: 'the bug pushes the truck', onB: 'the truck pushes the bug', sA: 'truck', sB: 'bug', col: ['#1546d6', '#2d6b3c'] },
  wall:   { A: ['Wall (+ Earth)', 6e24], B: ['You (on skates)', 60], F: [20, 300, 100], onA: 'you push the wall', onB: 'the wall pushes you', sA: 'wall', sB: 'you', col: ['#9aa7b8', '#ff6a2b'] },
  rocket: { A: ['Rocket', 500000], B: ['Exhaust gas', 50], F: [1e6, 1e7, 6e6], onA: 'the gas pushes the rocket', onB: 'the rocket pushes the gas', sA: 'rocket', sB: 'gas', col: ['#d9d4c7', '#ffb380'] }};
const cap1 = x => x[0].toUpperCase() + x.slice(1);
const SIM = {
  title: 'Force Pairs',
  hint: 'F on A by B = −F on B by A · a = F/m',
  modes: [{ id: 'bat', label: 'Bat and ball' }, { id: 'bug', label: 'Truck and bug' }, { id: 'wall', label: 'You push a wall' }, { id: 'rocket', label: 'Rocket and exhaust' }],
  opts: [{ id: 'sh', label: 'Forces', choices: [['hide', 'Predict first'], ['show', 'Show them']] }],
  ivs(mode){ const P = PAIRS[mode]; return [{ id: 'F', sym: 'F', symText: 'F', label: 'Size of the push', unit: 'N', min: P.F[0], max: P.F[1], step: (P.F[1] - P.F[0]) / 100, val: P.F[2], graph: true }]; },
  calc(v, mode){ const P = PAIRS[mode]; return { P, aA: v.F / P.A[1], aB: v.F / P.B[1] }; },
  dvs(){ return [{ id: 'aB', name: 'Acceleration of the lighter object', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.aB }, { id: 'aA', name: 'Acceleration of the heavier object', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.aA }]; },
  work(v, d, mode, opt){
    const P = d.P;
    if ((opt.sh || 'hide') === 'hide') return '<h4>Predict first</h4><p class="st">Which force is bigger: ' + P.onB + ', or ' + P.onA + '? Which object speeds up more? Write your answers, then switch Forces to <b>Show them</b>.</p>';
    return '<h4>1 · Newton’s 3rd law</h4><p class="st">' + cap1(P.onB) + ' with ' + H.iv('F') + '. ' + cap1(P.onA) + ' with <b>the same ' + H.n(v.F, 'N') + '</b>, in the opposite direction. Always equal, always opposite, always on <b>different</b> objects.</p>' +
      '<h4>2 · Same force, different effects</h4><p class="st"><b>' + P.B[0] + ':</b></p>' + TEX`a = \frac{F}{m}` + TEX`a = \frac{${M.iv('F')}}{${M.n(P.B[1], 'kg')}}` + TEXA`a = ${M.n(d.aB, 'm/s²')}` +
      '<p class="st"><b>' + P.A[0] + ':</b></p>' + TEX`a = \frac{F}{m}` + TEX`a = \frac{${M.iv('F')}}{${M.n(P.A[1], 'kg')}}` + TEXA`a = ${M.n(d.aA, 'm/s²')}` +
      '<p class="note">The forces don’t cancel because they act on different objects. To see if something speeds up, add up only the forces acting <b>on it</b>.' + (mode === 'rocket' ? ' A rocket needs no air to push on: it pushes on its own exhaust.' : mode === 'wall' ? ' You roll backward because the wall pushes you; the wall is attached to the whole Earth, so its acceleration is far too small to notice.' : '') + '</p>';
  },
  draw(v, d, mode, opt){
    const F = '"Space Grotesk",sans-serif', Mo = '"IBM Plex Mono",monospace', P = d.P, show = (opt.sh || 'hide') === 'show';
    panelTitle('THE INTERACTION', 10, 18);
    const cx = 190, cy = 160, wA = mode === 'bug' || mode === 'rocket' ? 130 : mode === 'wall' ? 50 : 120, hA = mode === 'bat' ? 20 : mode === 'wall' ? 200 : 70;
    const ax = cx - wA, ay = cy - hA / 2;
    ctx.fillStyle = P.col[0]; ctx.fillRect(ax, ay, wA, hA); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(ax, ay, wA, hA);
    text(P.A[0], ax + wA / 2, mode === 'wall' ? ay + hA + 16 : ay - 8, { align: 'center', font: '700 12px ' + F });
    const rB = mode === 'bug' ? 6 : mode === 'bat' ? 12 : mode === 'wall' ? 22 : 18;
    ctx.fillStyle = P.col[1]; ctx.beginPath(); ctx.arc(cx + rB, cy, rB, 0, 7); ctx.fill(); ctx.stroke();
    text(P.B[0], cx + rB + (mode === 'bug' ? 14 : 0), cy + Math.max(rB, 10) + 18, { align: 'center', font: '700 12px ' + F });
    if (show){ const L = 80;
      arrow(cx + rB, cy - 40, cx + rB + L, cy - 40, '#c43a00', 'on ' + P.sB, { w: 4, ly: -8, align: 'left', lx: -40 });
      arrow(cx - 4, cy + 44, cx - 4 - L, cy + 44, '#1546d6', 'on ' + P.sA, { w: 4, ly: 16, align: 'right', lx: 30 }); text('same size: ' + fplain(v.F) + ' N each', cx, 300, { align: 'center', font: '700 12px ' + F, col: '#4a4a4a' });
    } else text('? which push is bigger ?', cx, 60, { align: 'center', font: '700 13px ' + F, col: '#7a3fb0' });
    panelTitle('ACCELERATION (a = F/m)', 395, 18);
    [['mass of ' + P.B[0].split(' ')[0].toLowerCase(), fplain(P.B[1]) + ' kg'], ['mass of ' + P.A[0].split(' ')[0].toLowerCase(), fplain(P.A[1]) + ' kg']].forEach(([a, b], i) => { text(a, 400, 50 + i * 24, { font: '600 12px ' + F, col: '#4a4a4a' }); text(b, 590, 50 + i * 24, { align: 'right', font: '700 12px ' + Mo }); });
    if (!show){ text('switch Forces to “Show them”', 400, 130, { font: '600 11px ' + F, col: '#7a3fb0' }); return; }
    const lg = x => Math.max(0, (Math.log10(x) + 25) / 32);
    [[P.B[0].split(' ')[0], d.aB, P.col[1]], [P.A[0].split(' ')[0], d.aA, P.col[0]]].forEach(([n, a], i) => { const y = 120 + i * 60; ctx.fillStyle = i ? '#1546d6' : '#c43a00'; ctx.fillRect(400, y, 185 * lg(a), 20); text(n.toLowerCase(), 400, y - 4, { font: '600 11px ' + F }); text(fplain(a) + ' m/s²', 590, y + 36, { align: 'right', font: '700 12px ' + Mo }); });
    text('bar length: log scale', 400, 300, { font: '500 10px ' + Mo, col: '#8a8a8a' });
  }
};
