// Elevator Scale: apparent weight N = m(g + a) during a ride, plus a snapped cable.
// v–t trips for the 'vt' mode: each segment is [t start, t end, v start, v end] (up = +), constant acceleration in each.
const ELT = {
  up:    { name: 'up',    T: 10, tid: 'tu', segs: [[0, 3, 0, 6], [3, 7, 6, 6], [7, 10, 6, 0]] },
  down:  { name: 'down',  T: 8,  tid: 'td', segs: [[0, 2, 0, -4], [2, 6, -4, -4], [6, 8, -4, 0]] },
  bumpy: { name: 'bumpy', T: 7,  tid: 'tb', segs: [[0, 2, 0, 6], [2, 6, 6, 2], [6, 7, 2, 0]] }
};
function elState(trip, t){
  const tr = ELT[trip]; let y = 0;
  for (let k = 0; k < tr.segs.length; k++){
    const [t0, t1, v0, v1] = tr.segs[k], a = (v1 - v0) / (t1 - t0);
    if (t <= t1 || k === tr.segs.length - 1){ const u = t - t0; return { k, t0, t1, v0, v1, a, v: v0 + a * u, y: y + v0 * u + 0.5 * a * u * u }; }
    y += (v0 + v1) / 2 * (t1 - t0);
  }
}
const SIM = {
  title: 'Elevator Scale',
  modes: [{ id: 'up', label: 'Ride up' }, { id: 'down', label: 'Ride down' }, { id: 'snap', label: 'Cable snaps' }, { id: 'vt', label: 'From a v–t graph' }],
  opts: [{ id: 'trip', label: 'Trip', modes: ['vt'], choices: [['up', 'Up'], ['down', 'Down'], ['bumpy', 'Bumpy']] }],
  ivs(mode, opt){
    if (mode === 'vt'){ const tr = ELT[(opt && opt.trip) || 'up'];
      return [{ id: 'm', sym: 'm', symText: 'm', label: 'Your mass', unit: 'kg', min: 20, max: 120, step: 1, val: 60 },
        { id: tr.tid, sym: 't', symText: 't', label: 'Time into the trip', unit: 's', min: 0, max: tr.T, step: 0.1, val: 1, graph: true }]; }
    const l = [{ id: 'm', sym: 'm', symText: 'm', label: 'Your mass', unit: 'kg', min: 20, max: 120, step: 1, val: 60 }];
    if (mode !== 'snap') l.push({ id: 'a', sym: 'a', symText: 'a', label: 'Elevator’s acceleration (size)', unit: 'm/s²', min: 0, max: 5, step: 0.1, val: 2, graph: true },
      { id: 't1', sym: 't<sub>1</sub>', symText: 't1', label: 'Time spent speeding up (and slowing down)', unit: 's', min: 0.5, max: 4, step: 0.1, val: 2 });
    else l.push({ id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Speed (going up) when the cable snaps', unit: 'm/s', min: 0, max: 8, step: 0.5, val: 0, graph: true });
    return l;
  },
  calc(v, mode, opt){
    const W = v.m * G10;
    if (mode === 'vt'){ const trip = (opt && opt.trip) || 'up', tr = ELT[trip], tv = v[tr.tid], t = Math.max(0, Math.min(tv === undefined ? 1 : tv, tr.T)), st = elState(trip, t);
      const segs = tr.segs.map(([t0, t1, v0, v1]) => { const a = (v1 - v0) / (t1 - t0); return { t0, t1, v0, v1, a, N: v.m * (G10 + a) }; });
      const N = v.m * (G10 + st.a);
      return { W, trip, tr, tid: tr.tid, T: tr.T, t, k: st.k, seg: segs[st.k], segs, a: st.a, vnow: st.v, y: st.y, N, read: N / G10, ratio: N / W }; }
    if (mode === 'snap') return { W, N1: 0, N2: 0, N3: 0, read1: 0, vmax: v.v0, ratio: 0 };
    const s = mode === 'up' ? 1 : -1, a1 = s * v.a, a3 = -s * v.a;   // a_y while speeding up / slowing down (up = +)
    const N1 = v.m * (G10 + a1), N2 = W, N3 = v.m * (G10 + a3), vmax = v.a * v.t1;
    return { W, s, a1, a3, N1, N2, N3, read1: N1 / G10, read3: N3 / G10, vmax, ratio: N1 / W, tc: 3, T: 2 * v.t1 + 3 };
  },
  dvs(mode){
    if (mode === 'vt') return [
      { id: 'N', name: 'Scale reading N', short: 'N', sym: 'N', unit: 'N', f: d => d.N, vs: 'W' },
      { id: 'W', name: 'True weight mg', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W },
      { id: 'a', name: 'Acceleration (slope of v–t)', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a },
      { id: 'v', name: 'Velocity', short: 'v', sym: 'v', unit: 'm/s', f: d => d.vnow }];
    if (mode === 'snap') return [{ id: 'N1', name: 'Scale reading in free fall', short: 'N', sym: 'N', unit: 'N', f: d => d.N1, vs: 'W' }, { id: 'W', name: 'True weight mg', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W }];
    return [
      { id: 'N1', name: 'Scale reading while starting', short: 'N_start', sym: 'N<sub>start</sub>', unit: 'N', f: d => d.N1, vs: 'W' },
      { id: 'N3', name: 'Scale reading while stopping', short: 'N_stop', sym: 'N<sub>stop</sub>', unit: 'N', f: d => d.N3, vs: 'W' },
      { id: 'W', name: 'True weight mg (cruising)', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W },
      { id: 'vmax', name: 'Cruising speed', short: 'v', sym: 'v<sub>max</sub>', unit: 'm/s', f: d => d.vmax }];
  },
  work(v, d, mode){
    const I = id => M.iv(id, 1), CK = '<mtext>✓</mtext>';
    if (mode === 'vt'){
      const sg = d.seg, nm = sg.a > 0 ? 'a points up' : sg.a < 0 ? 'a points down' : 'a = 0', I2 = id => M.iv(id, 1);
      const feel = d.N > d.W + 0.5 ? '<b>heavier</b>' : d.N < d.W - 0.5 ? '<b>lighter</b>' : '<b>normal</b>';
      return '<h4>1 · The slope of v–t is the acceleration</h4><p class="st">At t = ' + H.iv(d.tid) + ' you are in segment ' + (d.k + 1) + ' of 3 (highlighted in orange on the graph), so use that segment’s slope:</p>' +
        TEX`a = \frac{\Delta v}{\Delta t}` + TEX`a = \frac{${M.n(sg.v1)} - ${M.p(sg.v0)}}{${M.n(sg.t1)} - ${M.n(sg.t0)}}` + TEXA`a = ${M.n(sg.a, 'm/s²')}` +
        '<p class="st">' + (sg.a === 0 ? 'Flat line: no acceleration (even when you are moving fast).' : sg.a > 0 ? 'Slope up (+): a points <b>up</b>.' : 'Slope down (−): a points <b>down</b>.') + '</p>' +
        '<h4>2 · Newton’s 2nd law on you (up = +)</h4><p class="st">Weight mg down, scale force N up:</p>' +
        TEX`N - m g = m a` + TEX`N = m(g + a)` + TEX`N = (${I2('m')})(10 + ${M.p(sg.a)})` + TEXA`N = ${M.n(d.N, 'N')}` +
        '<p class="st">The scale reads ' + H.n(d.read, 'kg') + ': you feel ' + feel + ' (' + nm + ').</p>' +
        '<p class="note">Only the <b>slope</b> counts, not the sign of v. Going down and slowing down is a slope that points up, so you feel heavier.</p>';
    }
    const h0 = '<h4>1 · Free-body diagram of you</h4><p class="st">Only two forces: weight mg down, and the scale’s normal force N up. <b>The scale reads N</b>, not mg.</p>' +
      TEX`W = m g` + TEX`W = (${I('m')})(10)` + TEXA`W = ${M.n(d.W, 'N')}` +
      '<p class="st">Newton’s 2nd law (up = +):</p>' + TEX`N - m g = m a` + TEXA`N = m(g + a)`;
    if (mode === 'snap') return h0 + '<h4>2 · Cable snaps: everything falls with a = −g</h4>' + TEX`N = m\left(g + (-g)\right)` + TEXA`N = 0\,\text{N}` +
      '<p class="st">You, the scale and the elevator all fall together, so you don’t press on the scale.</p>' +
      '<p class="st">This is true even if the elevator was still going up at ' + H.iv('v0') + ' when it snapped: the acceleration is −g the moment the only force is gravity.</p>' +
      '<p class="note">“Weightless” doesn’t mean gravity turned off: mg is still ' + H.n(d.W, 'N') + '. It means nothing is holding you up. Same reason astronauts float in orbit.</p>';
    const up = mode === 'up', dirW = up ? 'up' : 'down', plus = '<mo>+</mo>', minus = '<mo>−</mo>';
    return h0 +
      '<h4>2 · Starting (speeding up going ' + dirW + '): a points ' + dirW + '</h4>' + TEX`N = (${I('m')})(10 ${up ? plus : minus} ${I('a')})` + TEXA`N = ${M.n(d.N1, 'N')}` +
      '<p class="st">You feel ' + (up ? '<b>heavier</b>' : '<b>lighter</b>') + ' (scale shows ' + H.n(d.read1, 'kg') + ').</p>' +
      '<h4>3 · Cruising at ' + H.n(d.vmax, 'm/s') + ': a = 0</h4>' + TEX`N = m g` + TEX`N = (${I('m')})(10)` + TEXA`N = ${M.n(d.N2, 'N')}` +
      '<p class="st">Same as standing still, however fast you go. (Newton’s 1st law)</p>' +
      '<h4>4 · Stopping (slowing down going ' + dirW + '): a points ' + (up ? 'down' : 'up') + '</h4>' + TEX`N = (${I('m')})(10 ${up ? minus : plus} ${I('a')})` + TEXA`N = ${M.n(d.N3, 'N')}` +
      '<p class="st">You feel ' + (up ? '<b>lighter</b>' : '<b>heavier</b>') + ' (' + H.n(d.read3, 'kg') + ').</p>' +
      '<p class="note">The scale depends on the direction of the <b>acceleration</b>, not the direction of motion. Heavier whenever a points up: starting up <i>or</i> stopping on the way down.</p>' +
      (v.a > G10 * 0.99 && !up ? '<div class="bad">a = g going down: you’d float off the scale.</div>' : '');
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const snap = mode === 'snap', vt = mode === 'vt', T = snap ? 3 : d.T + 1.5, tt = vt ? d.t : A.t % (T + 1);
    // motion profile
    let vy, y, ay, N;
    if (vt){ vy = d.vnow; y = d.y; ay = d.a; N = d.N; }
    else if (snap){ const s = Math.min(tt, 2.2), tSnap = 0.8; if (s < tSnap){ vy = v.v0; ay = 0; y = v.v0 * s; } else { const q = s - tSnap; vy = v.v0 - G10 * q; ay = -G10; y = v.v0 * tSnap + v.v0 * q - 5 * q * q; } N = ay === 0 ? d.W : 0; }
    else { const s = Math.min(tt, d.T), t1 = v.t1, sg = d.s; let vv, yy, aa;
      if (s < t1){ aa = v.a; vv = v.a * s; yy = 0.5 * v.a * s * s; }
      else if (s < t1 + 3){ aa = 0; vv = d.vmax; yy = 0.5 * v.a * t1 * t1 + d.vmax * (s - t1); }
      else { const q = s - t1 - 3; aa = -v.a; vv = d.vmax - v.a * q; yy = 0.5 * v.a * t1 * t1 + d.vmax * 3 + d.vmax * q - 0.5 * v.a * q * q; }
      vy = sg * vv; y = sg * yy; ay = sg * aa; N = v.m * (G10 + ay); }
    panelTitle(vt ? 'RIDING ' + d.trip.toUpperCase() + ': ONLY THE v–t GRAPH IS GIVEN' : snap ? 'CABLE SNAPS' : mode === 'up' ? 'RIDING UP' : 'RIDING DOWN', 10, 18);
    // shaft with floors moving past (camera on the elevator)
    const cx = 120, top = 40, bot = 290, px = 6; ctx.fillStyle = '#eee'; ctx.fillRect(cx - 80, top - 10, 160, bot - top + 20);
    for (let f = -40; f <= 40; f++){ const yy = 165 + (y - f * 4) * px; if (yy < top - 10 || yy > bot + 10) continue; ctx.fillStyle = '#bbb'; ctx.fillRect(cx - 80, yy, 160, 2); text('floor ' + f, cx + 78, yy - 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#8a8a8a' }); }
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(cx - 50, 95, 100, 140); ctx.strokeRect(cx - 50, 95, 100, 140);
    if (!snap){ ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, top - 10); ctx.lineTo(cx, 95); ctx.stroke(); }
    else if (tt < 0.8){ ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, top - 10); ctx.lineTo(cx, 95); ctx.stroke(); }
    else { ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, top - 10); ctx.lineTo(cx + 6, 60); ctx.stroke(); }
    // person on scale
    const fy = 225; ctx.fillStyle = '#555'; ctx.fillRect(cx - 22, fy, 44, 8); ctx.fillStyle = '#1546d6'; ctx.fillRect(cx - 9, fy - 62, 18, 50); ctx.fillRect(cx - 9, fy - 14, 7, 14); ctx.fillRect(cx + 2, fy - 14, 7, 14);
    ctx.fillStyle = '#f2c7a0'; ctx.beginPath(); ctx.arc(cx, fy - 72, 10, 0, 7); ctx.fill();
    // scale display
    ctx.fillStyle = '#111'; ctx.fillRect(180, 120, 110, 50); text(fplain(N / G10) + ' kg', 235, 152, { align: 'center', font: '700 18px "IBM Plex Mono",monospace', col: '#7dff9a' }); text('SCALE', 235, 115, { align: 'center', font: '700 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    const fs = 70 / d.W;
    arrow(cx + 40, fy - 30, cx + 40, fy - 30 + d.W * fs, COL.W, 'mg', { lx: 5, ly: -6 });
    if (N > 1) arrow(cx - 40, fy - 30, cx - 40, fy - 30 - N * fs, COL.N, 'N', { lx: -5, ly: 0, align: 'right' });
    if (Math.abs(ay) > 0.01) arrow(220, 230, 220, 230 - Math.sign(ay) * Math.min(40, 10 + Math.abs(ay) * 4), '#c43a00', 'a', { w: 3, lx: 6, ly: 0 });
    if (Math.abs(vy) > 0.01) arrow(260, 230, 260, 230 - Math.sign(vy) * Math.min(40, 10 + Math.abs(vy) * 4), COL.V, 'v', { w: 3, lx: 6, ly: 0 });
    const feel = N > d.W + 1 ? 'feels HEAVIER' : N < d.W - 1 ? (N < 1 ? 'WEIGHTLESS' : 'feels LIGHTER') : 'feels normal';
    text(feel, 12, 300, { font: '700 13px "Space Grotesk",sans-serif', col: Math.abs(N - d.W) < 1 ? '#1e7d45' : '#c43a00' });
    text('N = ' + fplain(N) + ' N   mg = ' + fplain(d.W) + ' N', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    if (vt){
      const gx = 330, gw = 240, TT = d.T, X = q => gx + gw * q / TT, sg = d.seg;
      const vs = d.segs.flatMap(s => [s.v0, s.v1]); let lo = Math.min(0, ...vs), hi = Math.max(0, ...vs); const sp = hi - lo; hi += 0.1 * sp; if (lo < 0) lo -= 0.1 * sp;
      const g1 = 134, h1 = 100, Y1 = q => g1 - h1 * (q - lo) / (hi - lo);
      panelTitle('VELOCITY v (m/s, up = +) vs TIME (s)', gx - 10, 22);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, g1 - h1); ctx.lineTo(gx, g1); ctx.lineTo(gx + gw, g1); ctx.stroke();
      if (lo < 0){ ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(gx, Y1(0)); ctx.lineTo(gx + gw, Y1(0)); ctx.stroke(); }
      text('0', gx - 4, Y1(0) + 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      const vx = vs.reduce((b, q) => Math.abs(q) > Math.abs(b) ? q : b, 0); text(fplain(vx), gx - 4, Y1(vx) + 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      // current time guide and segment boundaries
      ctx.setLineDash([2, 3]); ctx.lineWidth = 1; ctx.strokeStyle = '#ccc'; d.segs.slice(1).forEach(s => { ctx.beginPath(); ctx.moveTo(X(s.t0), g1 - h1); ctx.lineTo(X(s.t0), g1); ctx.stroke(); }); ctx.setLineDash([]);
      d.segs.forEach((s, i) => { const cur = i === d.k; ctx.strokeStyle = cur ? '#ff6a2b' : COL.V; ctx.lineWidth = cur ? 5 : 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X(s.t0), Y1(s.v0)); ctx.lineTo(X(s.t1), Y1(s.v1)); ctx.stroke(); ctx.lineCap = 'butt';
        text('a = ' + (s.a > 0 ? '+' : s.a < 0 ? '−' : '') + fplain(Math.abs(s.a)), X((s.t0 + s.t1) / 2), g1 + 14, { align: 'center', font: (cur ? '700' : '500') + ' 10px "IBM Plex Mono",monospace', col: cur ? '#c43a00' : '#4a4a4a' }); });
      // slope triangle on the current segment
      if (Math.abs(sg.v1 - sg.v0) > 1e-9){ ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(sg.t0), Y1(sg.v0)); ctx.lineTo(X(sg.t1), Y1(sg.v0)); ctx.lineTo(X(sg.t1), Y1(sg.v1)); ctx.stroke(); ctx.setLineDash([]);
        const late = X(sg.t1) > gx + gw - 50; text('Δv = ' + (sg.v1 - sg.v0 > 0 ? '+' : '−') + fplain(Math.abs(sg.v1 - sg.v0)), X(sg.t1) + (late ? -4 : 4), Y1(sg.v0 + (sg.v1 - sg.v0) * (Math.abs(X(sg.t1) - X(d.t)) < 34 ? 0.2 : 0.5)) + 3, { align: late ? 'right' : 'left', font: '700 9px "IBM Plex Mono",monospace', col: '#c43a00' }); }
      ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(d.t), g1); ctx.lineTo(X(d.t), Y1(d.vnow)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(d.t), Y1(d.vnow), 5, 0, 7); ctx.fill(); ctx.stroke();
      // N–t graph builds up to the current time
      const g2 = 292, h2 = 100, hiN = Math.max(d.W, ...d.segs.map(s => s.N)) * 1.15, Y2 = q => g2 - h2 * q / hiN;
      panelTitle('SCALE READING N (newtons) vs TIME (s)', gx - 10, 170);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, g2 - h2); ctx.lineTo(gx, g2); ctx.lineTo(gx + gw, g2); ctx.stroke();
      ctx.setLineDash([4, 3]); ctx.strokeStyle = '#888'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, Y2(d.W)); ctx.lineTo(gx + gw, Y2(d.W)); ctx.stroke(); ctx.setLineDash([]);
      text('mg = ' + fplain(d.W), gx + gw, Y2(d.W) + 11, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#888' });
      text('0', gx - 4, g2 + 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(hiN), gx - 4, g2 - h2 + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      ctx.setLineDash([2, 3]); ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1.5; ctx.beginPath(); d.segs.forEach((s, i) => { ctx.moveTo(X(s.t0), Y2(s.N)); ctx.lineTo(X(s.t1), Y2(s.N)); }); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 3; ctx.beginPath(); let first = true;
      d.segs.forEach((s, i) => { if (d.t <= s.t0 && i > 0) return; const e = Math.min(s.t1, d.t); if (first){ ctx.moveTo(X(s.t0), Y2(s.N)); first = false; } else ctx.lineTo(X(s.t0), Y2(s.N)); ctx.lineTo(X(e), Y2(s.N)); }); ctx.stroke();
      ctx.fillStyle = '#1e7d45'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(d.t), Y2(d.N), 5, 0, 7); ctx.fill(); ctx.stroke();
      const lateN = X(d.t) > gx + gw - 60; text('N = ' + fplain(d.N), X(d.t) + (lateN ? -7 : 7), Y2(d.N) - 8, { align: lateN ? 'right' : 'left', font: '700 10px "IBM Plex Mono",monospace', col: '#1e7d45' });
      const ticks = [0].concat(d.segs.map(s => s.t1)); ticks.forEach(q => text(fplain(q), X(q), g2 + 12, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }));
      return;
    }
    // graphs: v–t and N–t for the whole ride
    const TT = snap ? 2.2 : d.T, gx = 330, gw = 250;
    const vf = q => { if (snap) return q < 0.8 ? v.v0 : v.v0 - G10 * (q - 0.8); const s = d.s; return s * (q < v.t1 ? v.a * q : q < v.t1 + 3 ? d.vmax : d.vmax - v.a * (q - v.t1 - 3)); };
    const Nf = q => snap ? (q < 0.8 ? d.W : 0) : v.m * (G10 + d.s * (q < v.t1 ? v.a : q < v.t1 + 3 ? 0 : -v.a));
    const plot = (gy0, gh, title, f, lo, hi, col, ref) => { panelTitle(title, gx - 10, gy0 - gh - 8);
      const X = q => gx + gw * q / TT, Y = q => gy0 - gh * (q - lo) / (hi - lo);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
      if (lo < 0){ ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(gx, Y(0)); ctx.lineTo(gx + gw, Y(0)); ctx.stroke(); }
      if (ref !== undefined){ ctx.setLineDash([4, 3]); ctx.strokeStyle = '#888'; ctx.beginPath(); ctx.moveTo(gx, Y(ref)); ctx.lineTo(gx + gw, Y(ref)); ctx.stroke(); ctx.setLineDash([]); text('mg', gx + gw - 2, Y(ref) - 3, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#888' }); }
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= 300; k++){ const q = TT * k / 300; k ? ctx.lineTo(X(q), Y(f(q))) : ctx.moveTo(X(q), Y(f(q))); } ctx.stroke();
      const qn = Math.min(tt, TT); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(qn), Y(f(qn)), 4, 0, 7); ctx.fill();
      text(fplain(hi), gx - 3, gy0 - gh + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(lo), gx - 3, gy0 + 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); };
    const vmx = snap ? Math.max(v.v0, 1) : Math.max(d.vmax, 1), vmn = snap ? v.v0 - G10 * 1.4 : 0;
    plot(140, 100, 'VELOCITY v (m/s, up = +)', vf, Math.min(vmn, d.s < 0 ? -vmx : 0), d.s < 0 ? 0.5 : vmx, COL.V);
    plot(300, 110, 'SCALE READING N (newtons)', Nf, 0, Math.max(d.W * 1.6, 1), '#1e7d45', d.W);
    text('t (s) → ' + fplain(TT), gx + gw, 314, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
