// Chase & Collide: one vehicle accelerates. Police chase, head-on with one speeding up, and a braking rear-end check.
const SIM = {
  title: 'Chase & Collide',
  modes: [{ id: 'police', label: 'Police chase' }, { id: 'head', label: 'Head-on' }, { id: 'tail', label: 'Will it rear-end?' }],
  ivs(mode){
    if (mode === 'police') return [
      { id: 'vS', sym: 'v<sub>S</sub>', symText: 'vS', label: 'Speeder’s speed (constant)', unit: 'm/s', min: 5, max: 40, step: 0.5, val: 30 },
      { id: 'a', sym: 'a', symText: 'a', label: 'Police acceleration (from rest)', unit: 'm/s²', min: 1, max: 8, step: 0.1, val: 3, graph: true },
      { id: 'td', sym: 't<sub>d</sub>', symText: 'td', label: 'Police wait before starting', unit: 's', min: 0, max: 5, step: 0.1, val: 0 }];
    if (mode === 'head') return [
      { id: 'd', sym: 'd', symText: 'd', label: 'Starting gap', unit: 'm', min: 50, max: 500, step: 5, val: 200, graph: true },
      { id: 'vA', sym: 'v<sub>A</sub>', symText: 'vA', label: 'Car A’s speed → (constant)', unit: 'm/s', min: 0, max: 30, step: 0.5, val: 10 },
      { id: 'a', sym: 'a', symText: 'a', label: 'Car B’s acceleration ← (from rest)', unit: 'm/s²', min: 0.5, max: 6, step: 0.1, val: 2 }];
    return [
      { id: 'd', sym: 'd', symText: 'd', label: 'Gap when A starts braking', unit: 'm', min: 5, max: 100, step: 1, val: 30, graph: true },
      { id: 'vA', sym: 'v<sub>A</sub>', symText: 'vA', label: 'Car A’s speed (behind)', unit: 'm/s', min: 10, max: 40, step: 0.5, val: 30 },
      { id: 'vB', sym: 'v<sub>B</sub>', symText: 'vB', label: 'Truck B’s speed (ahead, constant)', unit: 'm/s', min: 0, max: 25, step: 0.5, val: 15 },
      { id: 'a', sym: 'a', symText: 'a', label: 'A’s braking (slowing) rate', unit: 'm/s²', min: 1, max: 9, step: 0.1, val: 6 }];
  },
  presets: [{ label: 'Police, no wait', mode: 'police', v: { vS: 30, a: 3, td: 0 } }, { label: 'Police waits 2 s', mode: 'police', v: { td: 2 } }, { label: 'Truck stopped', mode: 'tail', v: { vB: 0 } }, { label: 'Wet road', mode: 'tail', v: { a: 3 } }],
  calc(v, mode){
    if (mode === 'police'){
      const tau = (v.vS + Math.sqrt(v.vS * v.vS + 2 * v.a * v.vS * v.td)) / v.a, t = v.td + tau, x = v.vS * t;
      const xA = s => s < v.td ? 0 : 0.5 * v.a * (s - v.td) ** 2, xB = s => v.vS * s, vA = s => s < v.td ? 0 : v.a * (s - v.td);
      return { t, x, tau, vPol: v.a * tau, ratio: v.a * tau / v.vS, xA, xB, vA, vB: () => v.vS, hit: true };
    }
    if (mode === 'head'){
      const t = (-v.vA + Math.sqrt(v.vA * v.vA + 2 * v.a * v.d)) / v.a, x = v.vA * t;
      const xA = s => v.vA * s, xB = s => v.d - 0.5 * v.a * s * s;
      return { t, x, xA, xB, vBm: v.a * t, closeEnd: v.vA + v.a * t, vA: () => v.vA, vB: s => -v.a * s, hit: true };
    }
    const dv = v.vA - v.vB, stopRel = dv > 0 ? dv * dv / (2 * v.a) : 0, minGap = v.d - stopRel, hit = minGap < 0;
    const t = hit ? (dv - Math.sqrt(dv * dv - 2 * v.a * v.d)) / v.a : dv / v.a;
    const tStopA = v.vA / v.a, xA = s => s < tStopA ? v.vA * s - 0.5 * v.a * s * s : v.vA * v.vA / (2 * v.a), xB = s => v.d + v.vB * s;
    return { t, x: xA(t), dv, stopRel, minGap, hit, vHit: hit ? dv - v.a * t : 0, xA, xB, vA: s => Math.max(0, v.vA - v.a * s), vB: () => v.vB, aNeed: dv * dv / (2 * v.d) };
  },
  dvs(mode){
    if (mode === 'police') return [
      { id: 't', name: 'Time when police catch up', short: 't', sym: 't', unit: 's', f: d => d.t },
      { id: 'x', name: 'Distance to catch up', short: 'x', sym: 'x', unit: 'm', f: d => d.x },
      { id: 'vPol', name: 'Police speed when they catch up', short: 'v_p', sym: 'v<sub>police</sub>', unit: 'm/s', f: d => d.vPol }];
    if (mode === 'head') return [
      { id: 't', name: 'Time when they meet', short: 't', sym: 't', unit: 's', f: d => d.t },
      { id: 'x', name: 'Where (from A’s start)', short: 'x', sym: 'x', unit: 'm', f: d => d.x },
      { id: 'vBm', name: 'B’s speed when they meet', short: 'v_B', sym: 'v<sub>B</sub>', unit: 'm/s', f: d => d.vBm }];
    return [
      { id: 'minGap', name: 'Closest gap (negative = crash)', short: 'gap', sym: 'gap<sub>min</sub>', unit: 'm', f: d => d.minGap },
      { id: 'stopRel', name: 'Extra distance A covers while matching B’s speed', short: 'Δx_rel', sym: 'Δx<sub>rel</sub>', unit: 'm', f: d => d.stopRel },
      { id: 'aNeed', name: 'Braking rate needed to just avoid', short: 'a_need', sym: 'a<sub>need</sub>', unit: 'm/s²', f: d => d.aNeed }];
  },
  work(v, d, mode){
    if (mode === 'police') return '<h4>1 · Position of each (start at the speeder passing the police car)</h4><div class="eq">Speeder (constant v): x<sub>S</sub> = ' + H.iv('vS') + '·t</div>' +
      '<div class="eq">Police (from rest, a constant' + (v.td > 0 ? ', starting at t<sub>d</sub>' : '') + '): x<sub>P</sub> = ½(' + H.iv('a') + ')' + (v.td > 0 ? '(t − ' + H.iv('td') + ')²' : 't²') + '</div>' +
      '<h4>2 · Catch up when x<sub>P</sub> = x<sub>S</sub></h4>' +
      (v.td > 0 ? '<div class="eq">Let τ = t − t<sub>d</sub>: ½aτ² = v<sub>S</sub>(τ + t<sub>d</sub>) → ½aτ² − v<sub>S</sub>τ − v<sub>S</sub>t<sub>d</sub> = 0</div><div class="eq">Quadratic formula: τ = [v<sub>S</sub> + √(v<sub>S</sub>² + 2av<sub>S</sub>t<sub>d</sub>)]/a = ' + H.n(d.tau, 's') + ' → t = <b>' + H.n(d.t, 's') + '</b></div>'
        : '<div class="eq">½at² = v<sub>S</sub>t → t(½at − v<sub>S</sub>) = 0 → t = 0 (where they start) or t = 2v<sub>S</sub>/a = 2(' + H.iv('vS') + ')/' + H.iv('a') + ' = <b>' + H.n(d.t, 's') + '</b></div>') +
      '<h4>3 · Where, and how fast</h4><div class="eq">x = v<sub>S</sub>t = <b>' + H.n(d.x, 'm') + '</b> &nbsp; v<sub>police</sub> = aτ = <b>' + H.n(d.vPol, 'm/s') + '</b> (' + H.n(d.ratio) + '× the speeder)</div>' +
      (v.td === 0 ? '<p class="note">With no wait the police are always going exactly 2× the speeder’s speed when they catch up. Why? Equal distances in equal times → equal average velocities: (0 + v<sub>P</sub>)/2 = v<sub>S</sub>.</p>' : '') +
      '<p class="note">On the v–t graph the areas under the two lines are equal at the catch-up time. The police are going the same speed as the speeder at t = ' + H.n(v.td + v.vS / v.a, 's') + ': that’s when the gap is biggest, not when they meet.</p>';
    if (mode === 'head') return '<h4>1 · Position of each (→ positive, A starts at x = 0)</h4><div class="eq">A (constant v): x<sub>A</sub> = ' + H.iv('vA') + '·t</div><div class="eq">B (from rest at d, accelerating ←): x<sub>B</sub> = ' + H.iv('d') + ' − ½(' + H.iv('a') + ')t²</div>' +
      '<h4>2 · Meet when x<sub>A</sub> = x<sub>B</sub></h4><div class="eq">v<sub>A</sub>t = d − ½at² → ½at² + v<sub>A</sub>t − d = 0</div>' +
      '<div class="eq">t = [−v<sub>A</sub> + √(v<sub>A</sub>² + 2ad)]/a = <b>' + H.n(d.t, 's') + '</b> (take the + root: time can’t be negative)</div>' +
      '<h4>3 · Where</h4><div class="eq">x = v<sub>A</sub>t = <b>' + H.n(d.x, 'm') + '</b> from A’s start. B is going ' + H.n(d.vBm, 'm/s') + ' ← by then.</div>' +
      '<p class="note">B’s x–t curve bends more and more steeply: its velocity keeps growing. A’s is a straight line.</p>';
    let h = '<h4>1 · Watch it from the truck (relative motion)</h4><div class="eq">A closes in at v<sub>A</sub> − v<sub>B</sub> = ' + H.iv('vA') + ' − ' + H.iv('vB') + ' = ' + H.n(d.dv, 'm/s') + ' and that closing speed shrinks at ' + H.iv('a') + '</div>' +
      '<h4>2 · The danger ends when A has slowed to the truck’s speed</h4><div class="eq">Extra distance A covers until then: (Δv)²/(2a) = (' + H.n(d.dv) + ')²/(2 × ' + H.iv('a') + ') = <b>' + H.n(d.stopRel, 'm') + '</b></div>' +
      '<h4>3 · Compare with the gap</h4>';
    h += d.hit ? '<div class="bad">' + H.n(d.stopRel, 'm') + ' > ' + H.iv('d') + ' → <b>crash</b>.</div><div class="eq">When: d = Δv·t − ½at² → t = [Δv − √(Δv² − 2ad)]/a = <b>' + H.n(d.t, 's') + '</b>, hitting at ' + H.n(d.vHit, 'm/s') + ' relative to the truck</div>'
      : '<div class="eq">' + H.n(d.stopRel, 'm') + ' ≤ ' + H.iv('d') + ' → <b>no crash</b>. Closest gap: ' + H.n(d.minGap, 'm') + ' at t = ' + H.n(d.t, 's') + '.</div>';
    h += '<h4>4 · Braking needed to just avoid it</h4><div class="eq">a = (Δv)²/(2d) = <b>' + H.n(d.aNeed, 'm/s²') + '</b>. By F = ma, that’s a braking force of ' + H.n(d.aNeed, 'm/s²') + ' × m.</div>' +
      '<p class="note">Common mistake: using A’s full stopping distance v<sub>A</sub>²/2a. The truck is moving too, so only the relative speed matters (unless the truck is stopped).</p>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const tEnd = Math.max(d.t * 1.3, 2), play = 5, hold = 1.2, tt = Math.min((A.t % (play + hold)) / play, 1) * tEnd;
    panelTitle(mode === 'police' ? 'THE ROAD (police start at x = 0)' : mode === 'head' ? 'THE ROAD (A starts at x = 0)' : 'THE ROAD (A starts at x = 0, braking)', 10, 18);
    const xs = []; for (let s = 0; s <= tEnd; s += tEnd / 60) xs.push(d.xA(s), d.xB(s));
    const xmin = Math.min(0, ...xs), xmax = Math.max(...xs, 10), L = 20, R = 580, X = x => L + (R - L) * (x - xmin) / (xmax - xmin);
    ctx.fillStyle = '#d6d6d6'; ctx.fillRect(L - 10, 40, R - L + 20, 50); ctx.fillStyle = '#fff'; for (let k = L; k < R; k += 40) ctx.fillRect(k, 64, 20, 3);
    const stopAt = d.hit ? d.t : tEnd, s = Math.min(tt, stopAt);
    const car = (x, y, col, lab, dir, w) => { w = w || 34; ctx.fillStyle = col; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(x - w / 2, y - 8, w, 16); ctx.strokeRect(x - w / 2, y - 8, w, 16);
      ctx.fillStyle = '#cfe0ff'; ctx.fillRect(dir > 0 ? x + w / 2 - 14 : x - w / 2 + 6, y - 6, 8, 12); text(lab, x, y - 13, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col }); };
    const sameLane = mode === 'tail';
    const labA = mode === 'police' ? 'POLICE' : 'A', labB = mode === 'police' ? 'SPEEDER' : mode === 'tail' ? 'TRUCK' : 'B';
    car(X(d.xB(s)), sameLane ? 66 : 78, '#1546d6', labB, mode === 'head' ? -1 : 1, mode === 'tail' ? 50 : 34);
    car(X(d.xA(s)), sameLane ? 66 : 54, '#ff6a2b', labA, 1);
    if (d.hit && tt >= d.t){ ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2; const hx = X(d.x); for (let k = 0; k < 8; k++){ const a = k * PI / 4; ctx.beginPath(); ctx.moveTo(hx + 22 * Math.cos(a), 66 + 22 * Math.sin(a)); ctx.lineTo(hx + 32 * Math.cos(a), 66 + 32 * Math.sin(a)); ctx.stroke(); } }
    text('t = ' + fplain(s) + ' s', R, 30, { align: 'right', font: '700 12px "IBM Plex Mono",monospace' });
    // x–t (left) and v–t (right)
    const graph = (gx, gw, title, fA, fB, lo, hi, mark) => { const gy0 = 300, gh = 150; panelTitle(title, gx - 40, 132);
      const tx = q => gx + gw * q / tEnd, py = x => gy0 - gh * (x - lo) / (hi - lo);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh - 5); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw + 5, gy0); ctx.stroke();
      if (lo < 0){ ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, py(0)); ctx.lineTo(gx + gw, py(0)); ctx.stroke(); }
      const ln = (f, col, upto) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= 120; k++){ const q = upto * k / 120; k ? ctx.lineTo(tx(q), py(f(q))) : ctx.moveTo(tx(q), py(f(q))); } ctx.stroke(); };
      ctx.globalAlpha = 0.22; ln(fA, '#ff6a2b', tEnd); ln(fB, '#1546d6', tEnd); ctx.globalAlpha = 1; ln(fA, '#ff6a2b', s); ln(fB, '#1546d6', s);
      if (mark !== undefined){ ctx.setLineDash([3, 3]); ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx(d.t), gy0); ctx.lineTo(tx(d.t), gy0 - gh); ctx.stroke(); ctx.setLineDash([]); }
      text(fplain(hi), gx - 4, gy0 - gh + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(lo), gx - 4, gy0 + 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text('t (s) → ' + fplain(tEnd), gx + gw, gy0 + 13, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return { tx, py }; };
    const g1 = graph(60, 230, 'POSITION x (m) vs t', d.xA, d.xB, xmin, xmax, (d.hit || mode !== 'tail') ? d.t : undefined);
    if (d.hit || mode !== 'tail'){ ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(g1.tx(d.t), g1.py(d.x), 5, 0, 7); ctx.fill(); }
    const vs = []; for (let q = 0; q <= tEnd; q += tEnd / 60) vs.push(d.vA(q), d.vB(q));
    graph(370, 210, 'VELOCITY v (m/s) vs t', d.vA, d.vB, Math.min(0, ...vs), Math.max(...vs, 1), (d.hit || mode !== 'tail') ? d.t : undefined);
    const msg = mode === 'tail' ? (d.hit ? 'CRASH at t = ' + fplain(d.t) + ' s' : 'no crash: closest gap ' + fplain(d.minGap) + ' m') : (mode === 'police' ? 'caught at ' : 'meet at ') + fplain(d.t) + ' s, x = ' + fplain(d.x) + ' m';
    text(msg, 300, 114, { align: 'center', font: '700 13px "Space Grotesk",sans-serif', col: d.hit && mode === 'tail' ? '#c43a00' : '#111' });
  }
};
