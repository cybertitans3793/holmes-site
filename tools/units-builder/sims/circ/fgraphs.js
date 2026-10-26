// Force & Motion Graphs: a net force in three 3-second stages → a, v and x graphs (translate between representations).
const SIM = {
  title: 'Force & Motion Graphs',
  ivs(){ return [
    { id: 'm', sym: 'm', symText: 'm', label: 'Cart mass', unit: 'kg', min: 1, max: 10, step: 0.5, val: 2 },
    { id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Starting velocity', unit: 'm/s', min: -5, max: 5, step: 0.5, val: 0 },
    { id: 'F1', sym: 'F<sub>1</sub>', symText: 'F1', label: 'Net force, 0–3 s', unit: 'N', min: -10, max: 10, step: 0.5, val: 4, graph: true },
    { id: 'F2', sym: 'F<sub>2</sub>', symText: 'F2', label: 'Net force, 3–6 s', unit: 'N', min: -10, max: 10, step: 0.5, val: 0 },
    { id: 'F3', sym: 'F<sub>3</sub>', symText: 'F3', label: 'Net force, 6–9 s', unit: 'N', min: -10, max: 10, step: 0.5, val: -6 }]; },
  presets: [{ label: 'Speed up, cruise, stop', v: { v0: 0, F1: 4, F2: 0, F3: -4, m: 2 } }, { label: 'Turn around', v: { v0: 4, F1: -4, F2: -4, F3: 0, m: 2 } }, { label: 'All zero', v: { F1: 0, F2: 0, F3: 0, v0: 2 } }],
  calc(v){
    const Fs = [v.F1, v.F2, v.F3], as = Fs.map(F => F / v.m), vs = [v.v0], xs = [0];
    for (let i = 0; i < 3; i++){ vs.push(vs[i] + as[i] * 3); xs.push(xs[i] + vs[i] * 3 + 0.5 * as[i] * 9); }
    const seg = s => Math.min(2, Math.floor(s / 3)), F = s => Fs[seg(s)], a = s => as[seg(s)];
    const vel = s => { const i = seg(s), q = s - 3 * i; return vs[i] + as[i] * q; }, pos = s => { const i = seg(s), q = s - 3 * i; return xs[i] + vs[i] * q + 0.5 * as[i] * q * q; };
    return { Fs, as, vs, xs, F, a, vel, pos, vEnd: vs[3], xEnd: xs[3], a1: as[0] };
  },
  dvs(){ return [
    { id: 'vEnd', name: 'Velocity at 9 s', short: 'v(9)', sym: 'v(9 s)', unit: 'm/s', f: d => d.vEnd },
    { id: 'xEnd', name: 'Position at 9 s', short: 'x(9)', sym: 'x(9 s)', unit: 'm', f: d => d.xEnd },
    { id: 'a1', name: 'Acceleration, 0–3 s', short: 'a1', sym: 'a<sub>1</sub>', unit: 'm/s²', f: d => d.a1 }]; },
  work(v, d){
    const ids = ['F1', 'F2', 'F3'];
    let h = '<h4>1 · Newton’s 2nd law in each stage: a = F<sub>net</sub>/m</h4>';
    for (let i = 0; i < 3; i++) h += '<div class="eq">' + (3 * i) + '–' + (3 * i + 3) + ' s: a = ' + H.iv(ids[i]) + ' / ' + H.iv('m') + ' = <b>' + H.n(d.as[i], 'm/s²') + '</b></div>';
    h += '<p class="note">The a–t graph is the F–t graph divided by m: same shape.</p><h4>2 · Velocity: Δv = a·Δt (area under the a–t graph)</h4>';
    for (let i = 0; i < 3; i++) h += '<div class="eq">v(' + (3 * i + 3) + ' s) = ' + H.n(d.vs[i]) + ' + (' + H.n(d.as[i]) + ')(3) = <b>' + H.n(d.vs[i + 1], 'm/s') + '</b></div>';
    h += '<h4>3 · Position: Δx = area under the v–t graph</h4>';
    for (let i = 0; i < 3; i++) h += '<div class="eq">' + (3 * i) + '–' + (3 * i + 3) + ' s: Δx = ½(' + H.n(d.vs[i]) + ' + ' + H.n(d.vs[i + 1]) + ')(3) = ' + H.n(d.xs[i + 1] - d.xs[i], 'm') + ' → x = <b>' + H.n(d.xs[i + 1], 'm') + '</b></div>';
    h += '<h4>4 · Read the shapes</h4><div class="eq">F = 0 → a = 0 → v flat → x a straight line (Newton’s 1st law). F constant → v a straight line → x a curve (parabola).</div>' +
      '<p class="note">Where v crosses zero, the cart turns around: that’s the peak or valley of the x–t graph. F can point backward while the cart moves forward: it’s slowing down.</p>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const T = 9, tt = Math.min(A.t % (T + 1.5), T);
    // cart strip
    const xs = []; for (let s = 0; s <= T; s += 0.1) xs.push(d.pos(s)); const lo = Math.min(...xs, 0), hi = Math.max(...xs, 0), span = Math.max(hi - lo, 2);
    const X = x => 40 + 520 * (x - lo) / span;
    ctx.fillStyle = '#e6dccb'; ctx.fillRect(20, 36, 560, 8);
    const cx = X(d.pos(tt)); ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.fillRect(cx - 14, 20, 28, 14); ctx.strokeRect(cx - 14, 20, 28, 14);
    const Fn = d.F(tt); if (Math.abs(Fn) > 0.01) arrow(cx, 27, cx + Fn * 4, 27, COL.F, '', { w: 2.5, head: 7 });
    text('t = ' + fplain(tt) + ' s', 590, 16, { align: 'right', font: '700 11px "IBM Plex Mono",monospace' });
    // four graphs
    const G = [[20, 60, 'NET FORCE F (N)', d.F, COL.F, true], [310, 60, 'ACCELERATION a (m/s²)', d.a, '#7a3fb0', true], [20, 195, 'VELOCITY v (m/s)', d.vel, COL.V, false], [310, 195, 'POSITION x (m)', d.pos, '#111', false]];
    G.forEach(([gx0, gy, title, f, col, step]) => {
      const gx = gx0 + 30, gw = 240, gh = 95, vals = []; for (let s = 0; s <= T; s += 0.05) vals.push(f(s));
      let mn = Math.min(0, ...vals), mx = Math.max(0, ...vals); if (mx - mn < 1e-6){ mx = 1; mn = -1; } const pad = (mx - mn) * 0.1; mn -= pad; mx += pad;
      const Xg = s => gx + gw * s / T, Yg = q => gy + 12 + gh * (mx - q) / (mx - mn);
      panelTitle(title, gx0, gy + 4);
      ctx.strokeStyle = '#eee'; ctx.lineWidth = 1; [3, 6].forEach(s => { ctx.beginPath(); ctx.moveTo(Xg(s), gy + 12); ctx.lineTo(Xg(s), gy + 12 + gh); ctx.stroke(); });
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy + 12); ctx.lineTo(gx, gy + 12 + gh); ctx.stroke();
      ctx.strokeStyle = '#999'; ctx.beginPath(); ctx.moveTo(gx, Yg(0)); ctx.lineTo(gx + gw, Yg(0)); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let k = 0; k <= 270; k++){ const s = tt * k / 270; const yy = Yg(f(s)); if (k && step && Math.floor(s / 3) !== Math.floor((tt * (k - 1) / 270) / 3)){ ctx.lineTo(Xg(s), Yg(f(tt * (k - 1) / 270))); } k ? ctx.lineTo(Xg(s), yy) : ctx.moveTo(Xg(s), yy); }
      ctx.stroke();
      text(fplain(mx), gx - 3, gy + 16, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(mn), gx - 3, gy + 12 + gh, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      [0, 3, 6, 9].forEach(s => text(s + '', Xg(s), gy + 24 + gh, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#8a8a8a' }));
    });
  }
};
