// ABP Data Table Detective: position or velocity tables → at rest, constant velocity, speeding up or slowing down; acceleration = Δv ÷ Δt. Original.
const fint = x => Number.isInteger(x) ? String(x) : (Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2)).replace(/\.?0+$/, '');
const sg = x => (x > 0 ? '+' : x < 0 ? '−' : '') + fint(Math.abs(x));
const CASES = [
  ['A jogger stretching', 'runner', 'p', [4, 4, 4, 4, 4, 4], 'rest'],
  ['A car on the highway', 'car', 'p', [0, 6, 12, 18, 24, 30], 'const'],
  ['A car leaving a stoplight', 'car', 'p', [0, 1, 4, 9, 16, 25], 'up'],
  ['A runner after the finish line', 'runner', 'p', [0, 9, 16, 21, 24, 25], 'down'],
  ['A car on cruise control', 'car', 'v', [12, 12, 12, 12, 12, 12], 'const'],
  ['A car merging onto the highway', 'car', 'v', [0, 3, 6, 9, 12, 15], 'up'],
  ['A sprinter easing up', 'runner', 'v', [10, 8, 6, 4, 2, 0], 'down'],
  ['A parked car', 'car', 'v', [0, 0, 0, 0, 0, 0], 'rest'],
  ['A car driving left (west)', 'car', 'p', [20, 16, 12, 8, 4, 0], 'const'],
  ['A car backing up faster and faster', 'car', 'v', [-2, -4, -6, -8, -10, -12], 'up'],
  ['A runner heading left, picking up speed', 'runner', 'p', [30, 29, 26, 21, 14, 5], 'up'],
  ['A car moving left, braking', 'car', 'v', [-15, -12, -9, -6, -3, 0], 'down']];
const NAMES = { rest: 'At rest', const: 'Constant velocity', up: 'Speeding up', down: 'Slowing down' };
const SIM = {
  title: 'Data Table Detective',
  hint: 'look at the change each second · a = Δv ÷ Δt',
  noGraph: true,
  modes: [{ id: 'table', label: 'Data tables' }],
  opts: [{ id: 'guess', label: 'Your answer', choices: [['none', '?'], ['rest', 'At rest'], ['const', 'Constant velocity'], ['up', 'Speeding up'], ['down', 'Slowing down']] }, { id: 'chk', label: 'Work', choices: [['no', 'Hidden'], ['yes', 'Show']] }],
  ivs(){ return [{ id: 'c', sym: '', symText: '#', label: 'Data table', unit: '', show: x => '#' + x, min: 1, max: 12, step: 1, val: 1 }]; },
  calc(v){
    const [name, who, type, vals, ans] = CASES[v.c - 1], diffs = vals.slice(1).map((x, i) => x - vals[i]);
    let pos, vel; if (type === 'p'){ pos = vals; vel = diffs; } else { vel = vals; pos = [0]; for (let i = 0; i < 5; i++) pos.push(pos[i] + (vals[i] + vals[i + 1]) / 2); }
    const acc = type === 'v' ? (vals[5] - vals[0]) / 5 : (diffs[4] - diffs[0]) / 4;
    return { name, who, type, vals, ans, diffs, pos, vel, acc };
  },
  dvs(){ return [{ id: 'x', name: '—', short: '', sym: '', unit: '', noTag: true, f: () => 0 }]; },
  work(v, d, mode, opt){
    const mn = (x, u) => '<mrow>' + (x < 0 ? '<mo>−</mo>' : '') + '<mn>' + fint(Math.abs(x)) + '</mn>' + M.u(u) + '</mrow>', mp = (x, u) => x < 0 ? '<mrow><mo>(</mo>' + mn(x, u) + '<mo>)</mo></mrow>' : mn(x, u);
    const P = d.type === 'p', show = opt.chk === 'yes', u = P ? 'm' : 'm/s', sg1 = (x, un) => '<mrow>' + (x > 0 ? '<mo>+</mo>' : '') + mn(x, un) + '</mrow>';
    let h = '<h4>1 · What kind of table?</h4><p class="st">' + (P ? '<b>Position</b> table: where it is each second. The change each second is its <b>velocity</b>.' : '<b>Velocity</b> table: how fast (and which way) it goes each second. The change each second is its <b>acceleration</b>.') + '</p>';
    h += '<h4>2 · Find the change each second</h4>' + (show ? d.diffs.map((x, i) => TEX`${'<mn>' + i + '</mn>'} \to ${'<mn>' + (i + 1) + '</mn>'}\,\text{s}:\quad ${mn(d.vals[i + 1])} - ${mp(d.vals[i])} = ${sg1(x, u)}`).join('') : '<p class="st">Subtract each row from the next one:</p>' + TEX`\text{change} = \text{next row} - \text{this row}`);
    h += '<h4>3 · Decide</h4><p class="st">' + (P ? 'Changes all 0 → <b>at rest</b>. Same change every second → <b>constant velocity</b>. Changes getting bigger (ignore the sign) → <b>speeding up</b>. Getting smaller → <b>slowing down</b>.'
      : 'All 0 → <b>at rest</b>. Same velocity every second → <b>constant velocity</b>. Velocity getting bigger (ignore the sign) → <b>speeding up</b>. Getting smaller → <b>slowing down</b>.') + (show ? '<br>Answer: <b>' + NAMES[d.ans] + '</b>' + (d.vals.some(x => x < 0) || (P && d.diffs.some(x => x < 0)) ? ', moving <b>left</b> (negative direction)' : '') + '.' : '') + '</p>';
    if (P) h += '<h4>4 · Acceleration</h4>' + (show ? '<p class="st">Velocity each second: ' + d.diffs.map(sg).join(', ') + ' m/s. Now see how much <i>they</i> change.</p>' + TEX`a = \frac{\Delta v}{\Delta t}` +
      TEX`a = \frac{${mp(d.diffs[4], 'm/s')} - ${mp(d.diffs[0], 'm/s')}}{${mn(4, 's')}}` + TEXA`a = ${sg1(d.acc, 'm/s/s')}` : '<p class="st">The changes are the velocities. How much do <i>they</i> change each second?</p>' + TEX`a = \frac{\Delta v}{\Delta t}`);
    else h += '<h4>4 · Acceleration: a = Δv ÷ Δt</h4>' + (show ? TEX`a = \frac{\Delta v}{\Delta t}` + TEX`a = \frac{${mp(d.vals[5], 'm/s')} - ${mp(d.vals[0], 'm/s')}}{${mn(5, 's')}}` + TEXA`a = ${sg1(d.acc, 'm/s/s')}` : '<p class="st">Use the first and last rows:</p>' + TEX`a = \frac{v_{\text{last}} - v_{\text{first}}}{\Delta t}`);
    h += '<p class="note">Careful with negatives: a negative velocity means moving left. A negative acceleration does NOT always mean slowing down — speeding up or slowing down depends on whether v and a point the same way.</p>';
    return h;
  },
  draw(v, d, mode, opt, t){
    const mono = '"IBM Plex Mono",monospace', sgf = '"Space Grotesk",sans-serif', show = opt.chk === 'yes', P = d.type === 'p';
    panelTitle('TABLE #' + v.c, 10, 18); text(d.name, 20, 38, { font: '700 12px ' + sgf });
    const tx = 20, ty = 46, cw = [56, 96, 100];
    ctx.fillStyle = '#111'; ctx.fillRect(tx, ty, cw[0] + cw[1] + (show ? cw[2] : 0), 24);
    text('t (s)', tx + 8, ty + 16, { font: '700 11px ' + mono, col: '#fff' }); text(P ? 'position (m)' : 'velocity (m/s)', tx + cw[0] + 6, ty + 16, { font: '700 11px ' + mono, col: '#fff' }); if (show) text('change', tx + cw[0] + cw[1] + 8, ty + 16, { font: '700 11px ' + mono, col: '#ffb08a' });
    d.vals.forEach((x, i) => { const y = ty + 24 + i * 24; ctx.fillStyle = i % 2 ? '#fff' : '#f4f4f4'; ctx.fillRect(tx, y, cw[0] + cw[1] + (show ? cw[2] : 0), 24);
      text(String(i), tx + 22, y + 16, { font: '600 13px ' + mono }); text(String(x), tx + cw[0] + 30, y + 16, { font: '700 13px ' + mono });
      if (show && i) text(sg(d.diffs[i - 1]), tx + cw[0] + cw[1] + 26, y + 4, { font: '700 12px ' + mono, col: '#c43a00' }); });
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(tx, ty, cw[0] + cw[1] + (show ? cw[2] : 0), 24 * 7);
    // motion strip
    panelTitle('WATCH IT (ONE DOT EACH SECOND)', 10, 232);
    const mn = Math.min(...d.pos), mx = Math.max(...d.pos), X = x => 40 + (x - mn) / Math.max(10, mx - mn) * 320, ly = 280;
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(20, ly + 10, 360, 6);
    d.pos.forEach((x, i) => { ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(X(x), ly, 4, 0, 7); ctx.fill(); text(String(i), X(x), ly - 8 - (i % 2) * 9, { align: 'center', font: '600 9px ' + mono, col: '#4a4a4a' }); });
    const T5 = (t % 6.5) / 5, k = Math.min(4, Math.floor(T5 * 5)), f = Math.min(1, T5 * 5 - k), xn = P ? d.pos[k] + (d.pos[k + 1] - d.pos[k]) * f : d.pos[k] + d.vals[k] * f + (d.vals[k + 1] - d.vals[k]) * f * f / 2;
    const px = X(Math.min(1, T5) >= 1 ? d.pos[5] : xn); ctx.fillStyle = '#ff6a2b';
    if (d.who === 'car'){ ctx.fillRect(px - 14, ly + 18, 28, 10); ctx.fillRect(px - 7, ly + 12, 14, 7); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(px - 8, ly + 29, 3.5, 0, 7); ctx.arc(px + 8, ly + 29, 3.5, 0, 7); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(px, ly + 14, 4, 0, 7); ctx.fill(); ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(px, ly + 18); ctx.lineTo(px, ly + 26); ctx.moveTo(px - 4, ly + 32); ctx.lineTo(px, ly + 26); ctx.lineTo(px + 4, ly + 32); ctx.stroke(); }
    text('← left (−)', 20, 324, { font: '600 9px ' + mono, col: '#8a8a8a' }); text('right (+) →', 380, 324, { align: 'right', font: '600 9px ' + mono, col: '#8a8a8a' });
    // right of table: what the changes look like
    if (show){ panelTitle('VELOCITY', 290, 18); const vs = d.vel, m = Math.max(1, ...vs.map(Math.abs)); vs.forEach((vv, i) => { const y = ty + 24 + i * 24 + (P ? 24 : 12); text(P ? i + '–' + (i + 1) + ' s' : 't=' + i, 290, y + 4, { font: '600 8px ' + mono }); if (vv) arrow(368, y, 368 + vv / m * 32, y, '#1546d6', null, { w: 2.5, head: 6 }); else { ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(368, y, 3, 0, 7); ctx.fill(); } }); }
    // answer panel
    panelTitle('YOUR ANSWER', 400, 18); const g = opt.guess;
    if (g === 'none'){ text('Pick one above:', 400, 50, { font: '700 12px ' + sgf }); ['At rest', 'Constant velocity', 'Speeding up', 'Slowing down'].forEach((s, i) => text('· ' + s, 404, 72 + i * 18, { font: '600 11px ' + mono, col: '#4a4a4a' })); }
    else { const ok = g === d.ans; ctx.fillStyle = ok ? '#e3f5e8' : '#fde8e2'; ctx.fillRect(400, 36, 186, 74); ctx.strokeStyle = ok ? '#1e7d45' : '#c43a00'; ctx.lineWidth = 2; ctx.strokeRect(400, 36, 186, 74);
      text(ok ? '✓ Correct!' : '✗ Not quite', 410, 60, { font: '700 16px ' + sgf, col: ok ? '#1e7d45' : '#c43a00' }); text(NAMES[g], 410, 80, { font: '600 11px ' + mono });
      if (!ok) text('Look at the change each second.', 410, 98, { font: '600 9px ' + mono, col: '#4a4a4a' }); }
    if (show){ text('Acceleration', 400, 150, { font: '700 12px ' + sgf }); text('a = ' + sg(d.acc) + ' m/s/s', 400, 172, { font: '700 15px ' + mono, col: '#c43a00' }); text(P ? '(change in the changes)' : '(Δv ÷ Δt)', 400, 188, { font: '600 9px ' + mono, col: '#4a4a4a' }); }
    else text('Turn on Show to check the work.', 400, 150, { font: '600 10px ' + mono, col: '#8a8a8a' });
  }
};
