// Balanced Forces: constant velocity means ΣF = 0 (Newton's 1st law). Push a crate, let it go, or fall at terminal speed.
const SIM = {
  title: 'Balanced Forces',
  modes: [{ id: 'push', label: 'Push a crate' }, { id: 'letgo', label: 'Let go' }, { id: 'sky', label: 'Skydiver' }],
  opts: [{ id: 'chute', label: 'Parachute', modes: ['sky'], choices: [['closed', 'Closed'], ['open', 'Open']] }],
  ivs(mode, opt){
    if (mode === 'push') return [
      { id: 'F', sym: 'F', symText: 'F', label: 'Your push', unit: 'N', min: 0, max: 200, step: 1, val: 60, graph: true },
      { id: 'm', sym: 'm', symText: 'm', label: 'Crate mass', unit: 'kg', min: 5, max: 50, step: 1, val: 20 },
      { id: 'mu', sym: 'μ<sub>k</sub>', symText: 'μk', label: 'Friction', unit: '', min: 0, max: 0.8, step: 0.01, val: 0.3, show: v => v.toFixed(2) }];
    if (mode === 'letgo') return [
      { id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Speed when you let go', unit: 'm/s', min: 1, max: 10, step: 0.5, val: 4 },
      { id: 'm', sym: 'm', symText: 'm', label: 'Crate mass', unit: 'kg', min: 5, max: 50, step: 1, val: 20 },
      { id: 'mu', sym: 'μ<sub>k</sub>', symText: 'μk', label: 'Friction', unit: '', min: 0, max: 0.8, step: 0.01, val: 0.3, show: v => v.toFixed(2), graph: true }];
    const open = opt.chute === 'open';
    return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Skydiver + gear mass', unit: 'kg', min: 40, max: 130, step: 1, val: 80, graph: true },
      { id: 'b', sym: 'b', symText: 'b', label: open ? 'Drag constant (open chute)' : 'Drag constant (body position)', unit: 'kg/m', min: open ? 15 : 0.15, max: open ? 50 : 0.6, step: open ? 0.5 : 0.01, val: open ? 30 : 0.26, show: v => v.toFixed(2) + ' kg/m' }];
  },
  presets: [{ label: 'Balanced push', mode: 'push', v: { F: 60, m: 20, mu: 0.3 } }, { label: 'Frictionless floor', mode: 'letgo', v: { mu: 0 } }, { label: 'Ice', mode: 'letgo', v: { mu: 0.05 } }],
  calc(v, mode, opt){
    if (mode === 'push'){ const W = v.m * G10, f = v.mu * W; return { W, N: W, f, net: v.F - f, bal: Math.abs(v.F - f) < 0.5 }; }
    if (mode === 'letgo'){ const W = v.m * G10, f = v.mu * W, a = v.mu * G10; return { W, N: W, f, net: -f, tStop: a > 0 ? v.v0 / a : Infinity, dStop: a > 0 ? v.v0 * v.v0 / (2 * a) : Infinity }; }
    const W = v.m * G10, vt = Math.sqrt(W / v.b), v0 = opt.chute === 'open' ? Math.sqrt(W / 0.26) : 0;
    return { W, vt, v0, dragStart: v.b * v0 * v0 };
  },
  dvs(mode){
    if (mode === 'push') return [
      { id: 'net', name: 'Net force ΣF = F − f', short: 'ΣF', sym: 'ΣF', unit: 'N', f: d => d.net },
      { id: 'f', name: 'Kinetic friction', short: 'f', sym: 'f<sub>k</sub>', unit: 'N', f: d => d.f }];
    if (mode === 'letgo') return [
      { id: 'f', name: 'Friction (the only horizontal force)', short: 'f', sym: 'f<sub>k</sub>', unit: 'N', f: d => d.f },
      { id: 'tStop', name: 'Time to stop', short: 't', sym: 't<sub>stop</sub>', unit: 's', f: d => d.tStop },
      { id: 'dStop', name: 'Distance to stop', short: 'd', sym: 'd<sub>stop</sub>', unit: 'm', f: d => d.dStop }];
    return [
      { id: 'vt', name: 'Terminal speed', short: 'v_t', sym: 'v<sub>t</sub>', unit: 'm/s', f: d => d.vt },
      { id: 'W', name: 'Weight = drag at terminal speed', short: 'W', sym: 'W', unit: 'N', f: d => d.W }];
  },
  work(v, d, mode, opt){
    if (mode === 'push'){
      let h = '<h4>1 · Free-body diagram of the crate</h4><div class="eq">Vertical: N = mg = (' + H.iv('m') + ')(' + H.g() + ') = ' + H.n(d.N, 'N') + ' (it doesn’t move up or down)</div>' +
        '<div class="eq">Horizontal: your push F = ' + H.iv('F') + ' forward, kinetic friction backward</div>' +
        '<h4>2 · Friction while it slides</h4><div class="eq">f<sub>k</sub> = μ<sub>k</sub>N = (' + H.iv('mu') + ')(' + H.n(d.N, 'N') + ') = <b>' + H.n(d.f, 'N') + '</b></div>' +
        '<h4>3 · Net force</h4><div class="eq">ΣF = F − f<sub>k</sub> = ' + H.iv('F') + ' − ' + H.n(d.f, 'N') + ' = <b>' + H.n(d.net, 'N') + '</b></div>';
      h += d.bal ? '<div class="eq">ΣF = 0 → <b>constant velocity</b>. Newton’s 1st law: balanced forces don’t mean “not moving,” they mean “velocity not changing.”</div>'
        : d.net > 0 ? '<div class="eq">ΣF points forward → the crate <b>speeds up</b>. (How fast it speeds up is Newton’s 2nd law, next unit.)</div>'
        : '<div class="eq">ΣF points backward → the crate <b>slows down</b>, even though you’re still pushing forward.</div>';
      h += '<h4>4 · Push needed for constant velocity</h4><div class="eq">F = f<sub>k</sub> = ' + H.n(d.f, 'N') + '. Faster or slower doesn’t matter: the same push keeps it at <i>any</i> steady speed.</div>' +
        '<p class="note">Common mistake: “if it moves forward, the forward force must be bigger.” Only if it’s speeding up.</p>';
      return h;
    }
    if (mode === 'letgo') return '<h4>1 · After you let go, the only horizontal force is friction</h4><div class="eq">f<sub>k</sub> = μ<sub>k</sub>mg = (' + H.iv('mu') + ')(' + H.iv('m') + ')(' + H.g() + ') = <b>' + H.n(d.f, 'N') + '</b>, backward</div>' +
      (v.mu === 0 ? '<h4>2 · No friction → no net force</h4><div class="eq">ΣF = 0, so the crate keeps moving at ' + H.iv('v0') + ' <b>forever</b>. Nothing is needed to keep it going: that’s inertia.</div>'
        : '<h4>2 · Unbalanced → the velocity changes</h4><div class="eq">ΣF = ' + H.n(d.f, 'N') + ' backward, so the crate slows down and stops.</div>' +
          '<div class="eq">Preview of Unit 2: it stops after ' + H.n(d.tStop, 's') + ' and ' + H.n(d.dStop, 'm') + '.</div>') +
      '<h4>3 · Why do things “naturally” stop?</h4><div class="eq">Not because the push “runs out.” Friction stops them. Make μ smaller and watch it go farther; at μ = 0 it never stops.</div>' +
      '<p class="note">Aristotle thought a moving object needs a force to keep moving. Galileo and Newton: it needs a force to <i>change</i> its motion.</p>';
    const open = opt.chute === 'open';
    return '<h4>1 · Forces on the skydiver</h4><div class="eq">Weight W = mg = (' + H.iv('m') + ')(' + H.g() + ') = ' + H.n(d.W, 'N') + ' down. Air drag D = bv² up, and it grows as the speed grows.</div>' +
      (open ? '<h4>2 · Chute opens at ' + H.n(d.v0, 'm/s') + '</h4><div class="eq">D = bv² = (' + H.iv('b') + ')(' + H.n(d.v0) + ')² = ' + H.n(d.dragStart, 'N') + ' > W, so ΣF points <b>up</b>: the skydiver slows down (while still falling!).</div>'
        : '<h4>2 · Just after jumping</h4><div class="eq">v ≈ 0, so D ≈ 0 and ΣF = W down: the skydiver speeds up. As v grows, D grows.</div>') +
      '<h4>3 · Terminal speed: the forces balance</h4><div class="eq">ΣF = 0: bv<sub>t</sub>² = mg → v<sub>t</sub> = √(mg/b) = √(' + H.n(d.W) + ' / ' + H.iv('b') + ') = <b>' + H.n(d.vt, 'm/s') + '</b></div>' +
      '<div class="eq">From then on: constant velocity, even though gravity is still pulling.</div>' +
      '<p class="note">Heavier skydivers have a higher terminal speed: the drag has to grow bigger to balance a bigger weight.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset){ A.t = 0; A.x = 0; A.hist = []; A.v = mode === 'push' ? 2 : mode === 'letgo' ? v.v0 : d.v0; A.y = 0; }
    const T = mode === 'sky' ? 14 : 8; if (A.t > T){ A.t = 0; A.x = 0; A.hist = []; A.v = mode === 'push' ? 2 : mode === 'letgo' ? v.v0 : d.v0; }
    A.t += dt;
    // physics stepping (small steps)
    for (let k = 0; k < 5; k++){ const h = dt / 5;
      if (mode === 'push'){ const a = (v.F - d.f) / v.m; if (A.v > 0 || v.F > d.f) A.v = Math.max(0, A.v + a * h); A.v = Math.min(A.v, 12); }
      else if (mode === 'letgo'){ if (A.t > 0.6) A.v = Math.max(0, A.v - v.mu * G10 * h); }
      else { A.v += (G10 - v.b / v.m * A.v * A.v) * h; }
      A.x += A.v * h; }
    A.hist.push([A.t, A.v]);
    const sc = 26, crateY = 230;
    if (mode !== 'sky'){
      panelTitle(mode === 'push' ? 'PUSHING A CRATE' : 'SLIDING AFTER YOU LET GO', 10, 18);
      // floor with scrolling marks (camera follows crate)
      ctx.fillStyle = mode === 'letgo' && v.mu === 0 ? '#dff0ff' : '#e6dccb'; ctx.fillRect(0, crateY, 380, 40);
      for (let xm = Math.floor(A.x - 8); xm <= A.x + 8; xm++){ const px = 180 + (xm - A.x) * sc; if (px < 0 || px > 380) continue; ctx.fillStyle = '#9a8a6a'; ctx.fillRect(px, crateY + 2, 2, xm % 2 ? 6 : 12); if (xm % 2 === 0) text(xm + ' m', px, crateY + 30, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#6a5a3a' }); }
      const cw = 50 + v.m, ch = 40 + v.m * 0.5, cx = 180;
      ctx.fillStyle = '#c98a3c'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(cx - cw / 2, crateY - ch, cw, ch); ctx.strokeRect(cx - cw / 2, crateY - ch, cw, ch);
      const fs = 70 / Math.max(d.W, 1);
      const pushing = mode === 'push' || A.t < 0.6;
      if (pushing && mode === 'push' && v.F > 0){ arrow(cx - cw / 2 - 8 - v.F * fs * 0.9, crateY - ch / 2, cx - cw / 2 - 2, crateY - ch / 2, COL.T, 'F', { lx: -v.F * fs * 0.9 - 6, ly: -10, align: 'left' }); }
      if (mode === 'letgo' && A.t < 0.6) text('✋ letting go…', cx - cw / 2 - 90, crateY - ch / 2, { font: '600 12px "Space Grotesk",sans-serif' });
      if (A.v > 0 && d.f > 0) arrow(cx, crateY - 4, cx - d.f * fs * 0.9, crateY - 4, COL.F, 'f', { lx: -6, ly: -10, align: 'right' });
      if (A.v > 0.01) arrow(cx - 20, crateY - ch - 16, cx - 20 + A.v * 10, crateY - ch - 16, COL.V, 'v', { w: 2.5, lx: 6, ly: 0 });
      const net = mode === 'push' ? (A.v > 0 || v.F > d.f ? v.F - d.f : 0) : A.v > 0 ? -d.f : 0;
      const st = Math.abs(net) < 0.5 ? (A.v > 0.01 ? 'ΣF = 0 → constant velocity' : 'at rest') : net > 0 ? 'ΣF forward → speeding up' : 'ΣF backward → slowing down';
      text(st, 12, 300, { font: '700 13px "Space Grotesk",sans-serif', col: Math.abs(net) < 0.5 ? '#1e7d45' : '#c43a00' });
      text('v = ' + fplain(A.v) + ' m/s   x = ' + fplain(A.x) + ' m', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    } else {
      panelTitle(opt.chute === 'open' ? 'SKYDIVER, CHUTE OPEN' : 'SKYDIVER, FREE FALL', 10, 18);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 26, 380, 260); ctx.clip(); ctx.fillStyle = '#e6f2ff'; ctx.fillRect(0, 26, 380, 260);
      const sp = 70, off = ((A.x * 6) % sp + sp) % sp; ctx.fillStyle = '#fff'; for (let y = -sp; y < 330; y += sp){ const yy = y - off + sp; ctx.beginPath(); ctx.ellipse(80, yy, 30, 9, 0, 0, 7); ctx.ellipse(300, (yy + 35) % 300, 26, 8, 0, 0, 7); ctx.fill(); }
      ctx.restore();
      const cx = 190, cy = 160;
      if (opt.chute === 'open'){ ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(cx, cy - 70, 48, PI, 2 * PI); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - 48, cy - 70); ctx.lineTo(cx - 6, cy - 14); ctx.moveTo(cx + 48, cy - 70); ctx.lineTo(cx + 6, cy - 14); ctx.stroke(); }
      ctx.fillStyle = '#1546d6'; ctx.fillRect(cx - 7, cy - 14, 14, 28); ctx.fillStyle = '#f2c7a0'; ctx.beginPath(); ctx.arc(cx, cy - 20, 7, 0, 7); ctx.fill();
      const D = v.b * A.v * A.v, fs = 80 / d.W;
      arrow(cx + 26, cy, cx + 26, cy + d.W * fs, COL.W, 'W', { lx: 6, ly: 0 });
      const dx = opt.chute === 'open' ? 70 : 26; arrow(cx - dx, cy + 10, cx - dx, cy + 10 - Math.min(D, 3 * d.W) * fs, COL.F, 'D', { lx: -6, ly: 0, align: 'right' });
      const bal = Math.abs(D - d.W) < 0.02 * d.W;
      text(bal ? 'D = W → ΣF = 0 → constant velocity' : D < d.W ? 'D < W → ΣF down → speeding up' : 'D > W → ΣF up → slowing down', 12, 300, { font: '700 13px "Space Grotesk",sans-serif', col: bal ? '#1e7d45' : '#c43a00' });
      text('v = ' + fplain(A.v) + ' m/s (down)   D = ' + fplain(D) + ' N', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    }
    // live v–t graph
    panelTitle('VELOCITY vs TIME (live)', 395, 18);
    const gx0 = 420, gy0 = 260, gw = 165, gh = 200;
    const vmax = mode === 'push' ? 12 : mode === 'letgo' ? Math.max(v.v0, 1) * 1.2 : Math.max(d.vt, d.v0, 1) * 1.15;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx0, gy0 - gh); ctx.lineTo(gx0, gy0); ctx.lineTo(gx0 + gw, gy0); ctx.stroke();
    if (mode === 'sky'){ const yv = gy0 - gh * d.vt / vmax; ctx.setLineDash([4, 3]); ctx.strokeStyle = '#1e7d45'; ctx.beginPath(); ctx.moveTo(gx0, yv); ctx.lineTo(gx0 + gw, yv); ctx.stroke(); ctx.setLineDash([]); text('v_t', gx0 + gw - 2, yv - 4, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#1e7d45' }); }
    ctx.strokeStyle = COL.V; ctx.lineWidth = 2.5; ctx.beginPath(); A.hist.forEach(([s, q], i) => { const X = gx0 + gw * s / T, Y = gy0 - gh * Math.min(q, vmax) / vmax; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke();
    text('v (m/s)', gx0 - 4, gy0 - gh - 6, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(vmax), gx0 - 4, gy0 - gh + 4, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('t (s) → ' + T, gx0 + gw, gy0 + 14, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('flat line = ΣF = 0', 395, 300, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
