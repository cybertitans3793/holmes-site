// Pulleys: Atwood machine, block on a table pulled by a hanging mass, and a block and tackle.
const SIM = {
  title: 'Pulleys',
  modes: [{ id: 'atwood', label: 'Atwood machine' }, { id: 'table', label: 'Table + hanging mass' }, { id: 'tackle', label: 'Block and tackle' }],
  ivs(mode){
    if (mode === 'atwood') return [
      { id: 'm1', sym: 'm<sub>1</sub>', symText: 'm1', label: 'Left mass', unit: 'kg', min: 0.1, max: 5, step: 0.1, val: 2 },
      { id: 'm2', sym: 'm<sub>2</sub>', symText: 'm2', label: 'Right mass', unit: 'kg', min: 0.1, max: 5, step: 0.1, val: 1.5, graph: true }];
    if (mode === 'table') return [
      { id: 'm1', sym: 'm<sub>1</sub>', symText: 'm1', label: 'Block on table', unit: 'kg', min: 0.5, max: 5, step: 0.1, val: 2 },
      { id: 'm2', sym: 'm<sub>2</sub>', symText: 'm2', label: 'Hanging mass', unit: 'kg', min: 0.1, max: 5, step: 0.1, val: 1, graph: true },
      { id: 'mu', sym: 'μ<sub>k</sub>', symText: 'μk', label: 'Friction on table', unit: '', min: 0, max: 0.8, step: 0.05, val: 0.2, show: v => v.toFixed(2) }];
    return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Load', unit: 'kg', min: 10, max: 200, step: 5, val: 60 },
      { id: 'n', sym: 'n', symText: 'n', label: 'Rope segments holding the load', unit: '', min: 1, max: 6, step: 1, val: 2, graph: true, show: v => v.toFixed(0) },
      { id: 'h', sym: 'h', symText: 'h', label: 'Lift height', unit: 'm', min: 0.1, max: 3, step: 0.1, val: 1 }];
  },
  calc(v, mode){
    if (mode === 'atwood'){ const M = v.m1 + v.m2, a = (v.m1 - v.m2) * G10 / M, T = 2 * v.m1 * v.m2 * G10 / M; return { a, T, M, W1: v.m1 * G10, W2: v.m2 * G10 }; }
    if (mode === 'table'){ const M = v.m1 + v.m2, W2 = v.m2 * G10, f = v.mu * v.m1 * G10, moves = W2 > f, a = moves ? (W2 - f) / M : 0, T = moves ? v.m1 * a + f : W2; return { a, T, M, W2, f, moves, N: v.m1 * G10 }; }
    const W = v.m * G10, F = W / v.n, rope = v.n * v.h; return { W, F, rope, Wk: F * rope, Wout: W * v.h, ma: v.n };
  },
  dvs(mode){
    if (mode === 'tackle') return [
      { id: 'F', name: 'Pull needed', short: 'F', sym: 'F', unit: 'N', f: d => d.F, vs: 'W' },
      { id: 'rope', name: 'Rope you pull', short: 'rope', sym: 'rope pulled', unit: 'm', f: d => d.rope },
      { id: 'Wk', name: 'Work you do F × rope', short: 'W', sym: 'W', unit: 'J', f: d => d.Wk },
      { id: 'W', name: 'Weight of load', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W }];
    return [
      { id: 'a', name: 'Acceleration', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a },
      { id: 'T', name: 'Tension', short: 'T', sym: 'T', unit: 'N', f: d => d.T }];
  },
  work(v, d, mode){
    if (mode === 'atwood') return '<h4>1 · Whole system (both masses + string)</h4><div class="eq">The tensions are internal and cancel. Net force = m<sub>1</sub>g − m<sub>2</sub>g, mass = m<sub>1</sub> + m<sub>2</sub></div>' +
      '<div class="eq">a = (m<sub>1</sub> − m<sub>2</sub>)g / (m<sub>1</sub> + m<sub>2</sub>) = (' + H.iv('m1') + ' − ' + H.iv('m2') + ')(' + H.g() + ') / ' + H.n(d.M, 'kg') + ' = <b>' + H.n(d.a, 'm/s²') + '</b></div>' +
      '<p class="note">Positive: the left mass goes down. The acceleration is always less than g.</p>' +
      '<h4>2 · One mass at a time (to find T)</h4><div class="eq">Left (down = +): m<sub>1</sub>g − T = m<sub>1</sub>a → T = m<sub>1</sub>(g − a) = (' + H.iv('m1') + ')(' + H.n(G10 - d.a) + ') = <b>' + H.n(d.T, 'N') + '</b></div>' +
      '<div class="eq">Right (up = +): T − m<sub>2</sub>g = m<sub>2</sub>a → T = ' + H.n(v.m2 * (G10 + d.a), 'N') + ' ✓</div>' +
      '<h4>3 · Newton’s third law</h4><div class="eq">The string pulls up on each mass with T = ' + H.n(d.T, 'N') + '; each mass pulls down on the string with the same T. T is between the two weights (' + H.n(d.W2, 'N') + ' and ' + H.n(d.W1, 'N') + ').</div>';
    if (mode === 'table') return '<h4>1 · Forces along the motion</h4><div class="eq">Hanging weight m<sub>2</sub>g = (' + H.iv('m2') + ')(' + H.g() + ') = ' + H.n(d.W2, 'N') + ' pulls the system; friction μ<sub>k</sub>m<sub>1</sub>g = (' + H.iv('mu') + ')(' + H.iv('m1') + ')(' + H.g() + ') = ' + H.n(d.f, 'N') + ' resists</div>' +
      (d.moves ? '<h4>2 · Whole system</h4><div class="eq">a = (m<sub>2</sub>g − μ<sub>k</sub>m<sub>1</sub>g)/(m<sub>1</sub> + m<sub>2</sub>) = (' + H.n(d.W2) + ' − ' + H.n(d.f) + ') / ' + H.n(d.M, 'kg') + ' = <b>' + H.n(d.a, 'm/s²') + '</b></div>' +
        '<h4>3 · Block on the table alone</h4><div class="eq">T − μ<sub>k</sub>m<sub>1</sub>g = m<sub>1</sub>a → T = m<sub>1</sub>a + f = (' + H.iv('m1') + ')(' + H.n(d.a) + ') + ' + H.n(d.f) + ' = <b>' + H.n(d.T, 'N') + '</b></div>' +
        '<h4>4 · Hanging mass alone (check)</h4><div class="eq">m<sub>2</sub>g − T = m<sub>2</sub>a → T = ' + H.n(v.m2 * (G10 - d.a), 'N') + ' ✓ (less than its weight, because it accelerates down)</div>'
        : '<div class="bad">The hanging weight is not more than the friction, so (treating μ as static too) nothing moves. T = m<sub>2</sub>g = ' + H.n(d.T, 'N') + '.</div>');
    return '<h4>1 · The load is held up by n = ' + H.iv('n') + ' rope segments, each with the same tension</h4><div class="eq">nF = mg → F = mg/n = (' + H.iv('m') + ')(' + H.g() + ') / ' + H.iv('n') + ' = <b>' + H.n(d.F, 'N') + '</b></div>' +
      '<p class="note">Ideal pulleys (no mass, no friction), lifting at constant speed.</p>' +
      '<h4>2 · But you pull more rope</h4><div class="eq">To raise the load h, each of the n segments shortens by h: rope pulled = nh = ' + H.iv('n') + ' × ' + H.iv('h') + ' = <b>' + H.n(d.rope, 'm') + '</b></div>' +
      '<h4>3 · The work is the same</h4><div class="eq">W<sub>you</sub> = F × rope = ' + H.n(d.F) + ' × ' + H.n(d.rope) + ' = ' + H.n(d.Wk, 'J') + ' &nbsp; = &nbsp; mgh = ' + H.n(d.Wout, 'J') + '</div>' +
      '<p class="note">Pulleys trade force for distance: 1/n the force × n the distance. They never reduce the work.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt; const cyc = 2.4, tt = A.t % cyc;
    if (mode === 'atwood'){
      panelTitle('ATWOOD MACHINE', 10, 18);
      const px = 180, py = 50, R = 26, s = Math.max(-60, Math.min(60, 0.5 * d.a * tt * tt * 30));
      ctx.fillStyle = '#111'; ctx.fillRect(px - 3, 22, 6, py - 22);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, R, 0, 7); ctx.stroke();
      const y1 = 170 + s, y2 = 170 - s;
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px - R, py); ctx.lineTo(px - R, y1); ctx.moveTo(px + R, py); ctx.lineTo(px + R, y2); ctx.stroke();
      const box = (x, y, m, lab) => { const s2 = 18 + 14 * Math.sqrt(m); ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.fillRect(x - s2 / 2, y, s2, s2); ctx.strokeRect(x - s2 / 2, y, s2, s2); text(lab, x, y + s2 / 2 + 4, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#fff' }); return s2; };
      const s1 = box(px - R, y1, v.m1, 'm1'), s2 = box(px + R, y2, v.m2, 'm2');
      const sc = 70 / Math.max(d.W1, d.W2);
      arrow(px - R - 30, y1 + s1 / 2, px - R - 30, y1 + s1 / 2 - d.T * sc, COL.T, 'T', { lx: -6, ly: 0, align: 'right' }); arrow(px - R - 30, y1 + s1 / 2, px - R - 30, y1 + s1 / 2 + d.W1 * sc, COL.W, 'm1g', { lx: -6, ly: 0, align: 'right' });
      arrow(px + R + 30, y2 + s2 / 2, px + R + 30, y2 + s2 / 2 - d.T * sc, COL.T, 'T', { lx: 6, ly: 0 }); arrow(px + R + 30, y2 + s2 / 2, px + R + 30, y2 + s2 / 2 + d.W2 * sc, COL.W, 'm2g', { lx: 6, ly: 0 });
      text('a = ' + fplain(Math.abs(d.a)) + ' m/s² ' + (d.a > 0 ? '(left side goes down)' : d.a < 0 ? '(right side goes down)' : '(balanced)'), 200, 318, { font: '700 13px "Space Grotesk",sans-serif' });
    } else if (mode === 'table'){
      panelTitle('TABLE + HANGING MASS', 10, 18);
      const tx = 30, ty = 140, edge = 280, s = d.moves ? Math.min(100, 0.5 * d.a * tt * tt * 30) : 0;
      ctx.fillStyle = '#e8e8e8'; ctx.fillRect(tx, ty, edge - tx, 14); ctx.fillRect(tx + 10, ty + 14, 10, 170); ctx.fillRect(edge - 20, ty + 14, 10, 170);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(edge + 8, ty - 8, 12, 0, 7); ctx.stroke();
      const bw = 36 + v.m1 * 8, bx = 110 + s; ctx.fillStyle = '#1546d6'; ctx.fillRect(bx, ty - 30, bw, 30); ctx.strokeStyle = '#111'; ctx.strokeRect(bx, ty - 30, bw, 30);
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx + bw, ty - 15); ctx.lineTo(edge + 8, ty - 20); ctx.moveTo(edge + 20, ty - 8); ctx.lineTo(edge + 20, ty + 40 + s); ctx.stroke();
      const hs = 18 + 14 * Math.sqrt(v.m2); ctx.fillStyle = '#ff6a2b'; ctx.fillRect(edge + 20 - hs / 2, ty + 40 + s, hs, hs); ctx.strokeRect(edge + 20 - hs / 2, ty + 40 + s, hs, hs);
      const sc = 60 / Math.max(d.W2, d.N);
      arrow(bx + bw / 2, ty - 15, bx + bw / 2 + d.T * sc, ty - 15, COL.T, 'T', { lx: 2, ly: -10 }); if (d.f > 0) arrow(bx + bw / 2, ty - 4, bx + bw / 2 - Math.min(d.f, d.T) * sc, ty - 4, COL.F, 'f', { lx: -4, ly: 8, align: 'right' });
      text(d.moves ? 'a = ' + fplain(d.a) + ' m/s²' : 'stuck: m2g ≤ friction', 12, 318, { font: '700 13px "Space Grotesk",sans-serif', col: d.moves ? '#111' : '#c43a00' });
    } else {
      panelTitle('BLOCK AND TACKLE', 10, 18);
      // Real pulleys: n supporting segments, joined by pulleys that alternate top (fixed) and bottom (moving),
      // plus one top pulley that turns the free end down to the person.
      const n = Math.round(v.n), r = 14, topY = 46, yT = topY + 22, lift = 40 * (tt / cyc), loadY = 222 - lift, yB = loadY - 32, cx = 170;
      const xs = []; for (let i = 0; i <= n; i++) xs.push(cx - n * r + 2 * r * i);
      const isTop = k => (n - 1 - k) % 2 === 0;           // pulley between segment k and k+1 (k = n−1 is the turning pulley)
      const tops = [], bots = []; for (let k = 0; k < n; k++) (isTop(k) ? tops : bots).push(xs[k] + r);
      const anchorTop = n % 2 === 0;
      // ceiling
      ctx.fillStyle = '#111'; ctx.fillRect(cx - n * r - 40, topY - 10, 2 * n * r + 80, 8);
      for (let i = 0; i < 9; i++){ ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); const hx = cx - n * r - 36 + i * (2 * n * r + 72) / 8; ctx.moveTo(hx, topY - 10); ctx.lineTo(hx + 6, topY - 18); ctx.stroke(); }
      // moving block frame (bar joining the bottom pulleys and the anchor) and hook to the load
      const botXs = bots.slice(); if (!anchorTop && n > 1) botXs.push(xs[0]);
      let hookX = xs[0];
      ctx.strokeStyle = '#555'; ctx.lineWidth = 4;
      if (botXs.length){ const lo = Math.min(...botXs), hi = Math.max(...botXs); hookX = (lo + hi) / 2;
        ctx.beginPath(); ctx.moveTo(lo - 6, yB); ctx.lineTo(hi + 6, yB); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hookX, yB); ctx.lineTo(hookX, loadY); ctx.stroke(); }
      // straps from the ceiling to each top pulley
      ctx.strokeStyle = '#555'; ctx.lineWidth = 3; tops.forEach(x => { ctx.beginPath(); ctx.moveTo(x, topY - 2); ctx.lineTo(x, yT); ctx.stroke(); });
      // wheels
      const wheel = (x, y) => { ctx.fillStyle = '#d9d9d9'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r - 1.5, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 7); ctx.fill(); };
      tops.forEach(x => wheel(x, yT)); bots.forEach(x => wheel(x, yB));
      // rope: vertical segments, arcs over/under pulleys, anchor, free end
      ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      for (let i = 0; i < n; i++){
        const topEnd = (i > 0 && isTop(i - 1)) || isTop(i) ? yT : topY - 2;
        const botEnd = (i > 0 && !isTop(i - 1)) || (!isTop(i)) ? yB : (n === 1 ? loadY : yB);
        ctx.beginPath(); ctx.moveTo(xs[i], topEnd); ctx.lineTo(xs[i], botEnd); ctx.stroke();
        // segment lines are highlighted: they each hold F
        ctx.save(); ctx.strokeStyle = 'rgba(122,63,176,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xs[i], (topEnd + botEnd) / 2 - 12); ctx.lineTo(xs[i], (topEnd + botEnd) / 2 + 12); ctx.stroke(); ctx.restore();
      }
      tops.forEach(x => { ctx.beginPath(); ctx.arc(x, yT, r, PI, 2 * PI); ctx.stroke(); });
      bots.forEach(x => { ctx.beginPath(); ctx.arc(x, yB, r, 0, PI); ctx.stroke(); });
      if (anchorTop){ ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(xs[0], topY - 2, 3, 0, 7); ctx.fill(); }
      else if (n > 1){ ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(xs[0], yB, 3, 0, 7); ctx.fill(); }
      // load
      const bw = 34 + v.m * 0.06, bh = bw * 0.75; ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5;
      ctx.fillRect(hookX - bw / 2, loadY, bw, bh); ctx.strokeRect(hookX - bw / 2, loadY, bw, bh);
      text(fplain(v.m) + ' kg', hookX - bw / 2 - 6, loadY + bh / 2 + 4, { align: 'right', font: '700 11px "IBM Plex Mono",monospace' });
      // free end, pulled down by the person
      const fxp = xs[n], pull = lift * n, endY = 120 + Math.min(pull, 110);
      ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(fxp, yT); ctx.lineTo(fxp, endY); ctx.stroke();
      arrow(fxp, endY, fxp, endY + 15 + 40 * d.F / d.W, COL.T, 'F = ' + fplain(d.F) + ' N', { lx: 6, ly: 0 });
      text(n + (n === 1 ? ' segment holds' : ' segments hold') + ' the load (shaded)', 12, 300, { font: '700 13px "Space Grotesk",sans-serif' });
      text('load up ' + fplain(v.h) + ' m → you pull ' + fplain(d.rope) + ' m of rope', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    }
    // bar comparison on the right
    if (mode === 'tackle'){
      panelTitle('FORCE vs DISTANCE', 390, 18);
      const base = 260, mx = Math.max(d.W, 1);
      [['your pull F', d.F, '#7a3fb0'], ['load mg', d.W, '#111']].forEach(([l, q, col], i) => { const x = 405 + i * 90, h = 180 * q / mx; ctx.fillStyle = col; ctx.fillRect(x, base - h, 55, h); text(l, x + 27, base + 14, { align: 'center', font: '700 10px "IBM Plex Mono",monospace' }); text(fplain(q) + ' N', x + 27, base - h - 6, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); });
      ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(395, base); ctx.lineTo(590, base); ctx.stroke();
      text('F × ' + fplain(d.rope) + ' m = mg × ' + fplain(v.h) + ' m', 400, 300, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    } else {
      panelTitle('NEWTON’S THIRD LAW PAIRS', 390, 18);
      text('String on mass ↑ T', 400, 60, { font: '600 12px "Space Grotesk",sans-serif' }); text('Mass on string ↓ T', 400, 78, { font: '600 12px "Space Grotesk",sans-serif' });
      text('Earth on mass ↓ mg', 400, 110, { font: '600 12px "Space Grotesk",sans-serif' }); text('Mass on Earth ↑ mg', 400, 128, { font: '600 12px "Space Grotesk",sans-serif' });
      text('T = ' + fplain(d.T) + ' N', 400, 180, { font: '700 20px "IBM Plex Mono",monospace' });
      text('a = ' + fplain(Math.abs(d.a)) + ' m/s²', 400, 210, { font: '700 20px "IBM Plex Mono",monospace' });
    }
  }
};
