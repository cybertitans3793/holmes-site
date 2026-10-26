// Up and Down: free fall with a = −g. A ball thrown from a cliff, and two balls passing each other.
const SIM = {
  title: 'Up and Down',
  modes: [{ id: 'throw', label: 'Throw from a cliff' }, { id: 'pass', label: 'Drop one, throw one' }],
  ivs(mode){
    if (mode === 'throw') return [
      { id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Launch velocity (up = +)', unit: 'm/s', min: -20, max: 30, step: 0.5, val: 15, graph: true },
      { id: 'h0', sym: 'h', symText: 'h', label: 'Cliff height', unit: 'm', min: 0, max: 80, step: 1, val: 20 }];
    return [
      { id: 'H', sym: 'H', symText: 'H', label: 'Height ball A is dropped from', unit: 'm', min: 10, max: 100, step: 1, val: 45 },
      { id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Ball B thrown up from the ground at', unit: 'm/s', min: 5, max: 40, step: 0.5, val: 20, graph: true }];
  },
  presets: [{ label: 'Just drop it', mode: 'throw', v: { v0: 0 } }, { label: 'Throw down', mode: 'throw', v: { v0: -10 } }, { label: 'From the ground', mode: 'throw', v: { h0: 0, v0: 20 } }],
  calc(v, mode){
    if (mode === 'throw'){
      const tTop = v.v0 > 0 ? v.v0 / G10 : 0, yMax = v.h0 + (v.v0 > 0 ? v.v0 * v.v0 / (2 * G10) : 0);
      const tLand = v.h0 === 0 && v.v0 <= 0 ? 0 : (v.v0 + Math.sqrt(v.v0 * v.v0 + 2 * G10 * v.h0)) / G10, vLand = v.v0 - G10 * tLand;
      const y = s => v.h0 + v.v0 * s - 5 * s * s, vy = s => v.v0 - G10 * s;
      return { tTop, yMax, tLand, vLand, y, vy, rise: yMax - v.h0, backAt: v.v0 > 0 ? 2 * v.v0 / G10 : 0 };
    }
    const t = v.H / v.v0, yA = s => Math.max(0, v.H - 5 * s * s), yB = s => Math.max(0, v.v0 * s - 5 * s * s);
    const tA = Math.sqrt(2 * v.H / G10), tB = 2 * v.v0 / G10, ok = t <= Math.min(tA, tB) + 1e-9, y = v.H - 5 * t * t;
    return { t, y, yA, yB, tA, tB, ok, vAm: -G10 * t, vBm: v.v0 - G10 * t, vMin: Math.sqrt(G10 * v.H / 2) };
  },
  dvs(mode){
    if (mode === 'throw') return [
      { id: 'tLand', name: 'Time to hit the bottom', short: 't', sym: 't<sub>land</sub>', unit: 's', f: d => d.tLand },
      { id: 'vLand', name: 'Velocity at the bottom', short: 'v', sym: 'v<sub>land</sub>', unit: 'm/s', f: d => d.vLand },
      { id: 'yMax', name: 'Highest point (above the bottom)', short: 'y_max', sym: 'y<sub>max</sub>', unit: 'm', f: d => d.yMax },
      { id: 'tTop', name: 'Time to the top', short: 't_top', sym: 't<sub>top</sub>', unit: 's', f: d => d.tTop }];
    return [
      { id: 't', name: 'Time when they pass', short: 't', sym: 't', unit: 's', f: d => d.t },
      { id: 'y', name: 'Height where they pass', short: 'y', sym: 'y', unit: 'm', f: d => d.y }];
  },
  work(v, d, mode){
    if (mode === 'throw'){
      let h = '<h4>1 · Set up (up = +, origin at the bottom)</h4><div class="eq">y<sub>0</sub> = ' + H.iv('h0') + ', v<sub>0</sub> = ' + H.iv('v0') + ', a = −g = −10 m/s² <b>the whole time</b>: going up, at the top, and coming down</div>';
      if (v.v0 > 0) h += '<h4>2 · To the top: v = 0 there (but a is still −g!)</h4><div class="eq">v = v<sub>0</sub> − gt → t<sub>top</sub> = v<sub>0</sub>/g = ' + H.iv('v0') + ' / ' + H.g() + ' = <b>' + H.n(d.tTop, 's') + '</b></div>' +
        '<div class="eq">v² = v<sub>0</sub>² − 2gΔy → rise = v<sub>0</sub>²/2g = ' + H.n(d.rise, 'm') + ' → y<sub>max</sub> = <b>' + H.n(d.yMax, 'm') + '</b></div>' +
        '<p class="note">Symmetry: it’s back at the cliff edge after 2t<sub>top</sub> = ' + H.n(d.backAt, 's') + ', moving down at ' + H.n(v.v0, 'm/s') + ', the same speed it was thrown.</p>';
      h += '<h4>' + (v.v0 > 0 ? '3' : '2') + ' · To the bottom: y = 0</h4><div class="eq">0 = h + v<sub>0</sub>t − ½gt² → 5t² − (' + H.n(v.v0) + ')t − ' + H.n(v.h0) + ' = 0</div>' +
        '<div class="eq">t = [v<sub>0</sub> + √(v<sub>0</sub>² + 2gh)]/g = <b>' + H.n(d.tLand, 's') + '</b> (the + root)</div>' +
        '<div class="eq">v<sub>land</sub> = v<sub>0</sub> − gt = ' + H.iv('v0') + ' − (10)(' + H.n(d.tLand) + ') = <b>' + H.n(d.vLand, 'm/s') + '</b></div>' +
        '<p class="note">Check without time: v² = v<sub>0</sub>² + 2gh → |v| = ' + H.n(Math.sqrt(v.v0 * v.v0 + 2 * G10 * v.h0), 'm/s') + '. Thrown up or down at the same speed, it hits the bottom at the same speed.</p>';
      return h;
    }
    let h = '<h4>1 · Both start at t = 0 with a = −g (up = +)</h4><div class="eq">A (dropped): y<sub>A</sub> = ' + H.iv('H') + ' − ½gt² &nbsp;&nbsp; B (thrown up): y<sub>B</sub> = ' + H.iv('v0') + '·t − ½gt²</div>' +
      '<h4>2 · They pass when y<sub>A</sub> = y<sub>B</sub></h4><div class="eq">H − ½gt² = v<sub>0</sub>t − ½gt² → the ½gt² cancels! → t = H/v<sub>0</sub> = ' + H.iv('H') + ' / ' + H.iv('v0') + ' = <b>' + H.n(d.t, 's') + '</b></div>' +
      '<p class="note">Why it cancels: both fall at the same rate, so relative to each other they move at a constant ' + H.n(v.v0, 'm/s') + ', as if there were no gravity.</p>';
    if (!d.ok) return h + '<div class="bad">But one ball hits the ground first (A lands at ' + H.n(d.tA, 's') + ', B at ' + H.n(d.tB, 's') + '), so they never pass in the air. B needs at least √(gH/2) = ' + H.n(d.vMin, 'm/s') + '.</div>';
    return h + '<h4>3 · Where</h4><div class="eq">y = H − ½gt² = ' + H.iv('H') + ' − 5(' + H.n(d.t) + ')² = <b>' + H.n(d.y, 'm') + '</b></div>' +
      '<div class="eq">Velocities then: A ' + H.n(d.vAm, 'm/s') + ', B ' + H.n(d.vBm, 'm/s') + (d.vBm < 0 ? ' (B is already coming back down)' : ' (B still going up)') + '</div>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const groundY = 290, top = 40;
    if (mode === 'throw'){
      panelTitle('THROW FROM A CLIFF (dots every 0.2 s)', 10, 18);
      const T = Math.max(d.tLand, 0.5), tt = Math.min(A.t % (T + 1.5), T), ymax = Math.max(d.yMax, v.h0, 5), sc = (groundY - top) / ymax, Y = y => groundY - y * sc;
      ctx.fillStyle = '#b89a6a'; ctx.fillRect(20, Y(v.h0), 120, groundY - Y(v.h0)); ctx.fillStyle = '#e6dccb'; ctx.fillRect(0, groundY, 380, 30);
      ctx.fillStyle = '#4a7a3a'; ctx.fillRect(20, Y(v.h0) - 3, 120, 3);
      const bx = 165;
      for (let s = 0; s <= tt + 1e-9; s += 0.2){ ctx.fillStyle = d.vy(s) > 0 ? '#ffb38f' : '#9db4f0'; ctx.beginPath(); ctx.arc(bx + (d.vy(s) > 0 ? -8 : 8), Y(d.y(s)), 3.5, 0, 7); ctx.fill(); }
      const yb = d.y(tt); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(bx, Y(yb), 8, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.stroke();
      const vv = d.vy(tt); if (Math.abs(vv) > 0.3) arrow(bx + 22, Y(yb), bx + 22, Y(yb) - vv * 3, COL.V, 'v', { w: 2.5, lx: 5, ly: 0 });
      if (tt < T) arrow(bx - 22, Y(yb) - 15, bx - 22, Y(yb) + 15, '#c43a00', 'a = −g', { w: 2.5, lx: -5, ly: 0, align: 'right' });
      if (v.v0 > 0){ ctx.setLineDash([3, 3]); ctx.strokeStyle = '#888'; ctx.beginPath(); ctx.moveTo(150, Y(d.yMax)); ctx.lineTo(300, Y(d.yMax)); ctx.stroke(); ctx.setLineDash([]); text('top: v = 0', 300, Y(d.yMax) + 4, { font: '600 10px "IBM Plex Mono",monospace', col: '#888' }); }
      text('y = ' + fplain(yb) + ' m   v = ' + fplain(vv) + ' m/s', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      // graphs
      const gx = 420, gw = 165, plot = (gy0, gh, title, f, lo, hi, col) => { panelTitle(title, 395, gy0 - gh - 8); const X = q => gx + gw * q / T, Yg = q => gy0 - gh * (q - lo) / (hi - lo);
        ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
        if (lo < 0){ ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(gx, Yg(0)); ctx.lineTo(gx + gw, Yg(0)); ctx.stroke(); }
        ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= 150; k++){ const q = tt * k / 150; k ? ctx.lineTo(X(q), Yg(f(q))) : ctx.moveTo(X(q), Yg(f(q))); } ctx.stroke();
        text(fplain(hi), gx - 3, gy0 - gh + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(lo), gx - 3, gy0 + 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); };
      plot(145, 105, 'HEIGHT y (m)', d.y, 0, ymax, '#ff6a2b');
      plot(300, 120, 'VELOCITY v (m/s)', d.vy, Math.min(d.vLand, 0) - 1, Math.max(v.v0, 0) + 1, COL.V);
      text('slope = −10 m/s² everywhere', 395, 318, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    panelTitle('DROP ONE, THROW ONE (same moment)', 10, 18);
    const T = Math.max(d.tA, d.tB), tt = Math.min(A.t % (T + 1.5), T), ymax = Math.max(v.H, v.v0 * v.v0 / 20) * 1.05, sc = (groundY - top) / ymax, Y = y => groundY - y * sc;
    ctx.fillStyle = '#e6dccb'; ctx.fillRect(0, groundY, 380, 30); ctx.fillStyle = '#bbb'; ctx.fillRect(60, Y(v.H), 40, groundY - Y(v.H)); ctx.fillRect(60, Y(v.H) - 4, 110, 4);
    const xA = 160, xB = 210;
    const ball = (x, y, col, lab) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, Y(y), 8, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.stroke(); text(lab, x + 12, Y(y) + 4, { font: '700 11px "Space Grotesk",sans-serif', col }); };
    const pass = d.ok && tt >= d.t;
    if (d.ok){ ctx.setLineDash([3, 3]); ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(130, Y(d.y)); ctx.lineTo(260, Y(d.y)); ctx.stroke(); ctx.setLineDash([]); if (pass) text('pass: ' + fplain(d.t) + ' s, ' + fplain(d.y) + ' m', 262, Y(d.y) + 4, { font: '700 11px "Space Grotesk",sans-serif', col: '#c43a00' }); }
    ball(xA, d.yA(tt), '#ff6a2b', 'A'); ball(xB, d.yB(tt), '#1546d6', 'B');
    text(d.ok ? 'they pass at t = H/v₀' : 'B hits the ground first: no pass', 12, 300, { font: '700 13px "Space Grotesk",sans-serif', col: d.ok ? '#111' : '#c43a00' });
    text('t = ' + fplain(tt) + ' s', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // y–t graph
    panelTitle('HEIGHT vs TIME', 395, 18);
    const gx = 420, gw = 165, gy0 = 290, gh = 250, X = q => gx + gw * q / T, Yg = y => gy0 - gh * y / ymax;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
    const ln = (f, col, upto) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= 150; k++){ const q = upto * k / 150; k ? ctx.lineTo(X(q), Yg(f(q))) : ctx.moveTo(X(q), Yg(f(q))); } ctx.stroke(); };
    ctx.globalAlpha = 0.25; ln(d.yA, '#ff6a2b', T); ln(d.yB, '#1546d6', T); ctx.globalAlpha = 1; ln(d.yA, '#ff6a2b', tt); ln(d.yB, '#1546d6', tt);
    if (d.ok){ ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(X(d.t), Yg(d.y), 4.5, 0, 7); ctx.fill(); }
    text(fplain(ymax), gx - 3, gy0 - gh + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('t → ' + fplain(T) + ' s', gx + gw, gy0 + 13, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
