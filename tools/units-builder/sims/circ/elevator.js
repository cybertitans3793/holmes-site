// Elevator Scale: apparent weight N = m(g + a) during a ride, plus a snapped cable.
const SIM = {
  title: 'Elevator Scale',
  modes: [{ id: 'up', label: 'Ride up' }, { id: 'down', label: 'Ride down' }, { id: 'snap', label: 'Cable snaps' }],
  ivs(mode){
    const l = [{ id: 'm', sym: 'm', symText: 'm', label: 'Your mass', unit: 'kg', min: 20, max: 120, step: 1, val: 60 }];
    if (mode !== 'snap') l.push({ id: 'a', sym: 'a', symText: 'a', label: 'Elevator’s acceleration (size)', unit: 'm/s²', min: 0, max: 5, step: 0.1, val: 2, graph: true },
      { id: 't1', sym: 't<sub>1</sub>', symText: 't1', label: 'Time spent speeding up (and slowing down)', unit: 's', min: 0.5, max: 4, step: 0.1, val: 2 });
    else l.push({ id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Speed (going up) when the cable snaps', unit: 'm/s', min: 0, max: 8, step: 0.5, val: 0, graph: true });
    return l;
  },
  calc(v, mode){
    const W = v.m * G10;
    if (mode === 'snap') return { W, N1: 0, N2: 0, N3: 0, read1: 0, vmax: v.v0, ratio: 0 };
    const s = mode === 'up' ? 1 : -1, a1 = s * v.a, a3 = -s * v.a;   // a_y while speeding up / slowing down (up = +)
    const N1 = v.m * (G10 + a1), N2 = W, N3 = v.m * (G10 + a3), vmax = v.a * v.t1;
    return { W, s, a1, a3, N1, N2, N3, read1: N1 / G10, read3: N3 / G10, vmax, ratio: N1 / W, tc: 3, T: 2 * v.t1 + 3 };
  },
  dvs(mode){
    if (mode === 'snap') return [{ id: 'N1', name: 'Scale reading in free fall', short: 'N', sym: 'N', unit: 'N', f: d => d.N1, vs: 'W' }, { id: 'W', name: 'True weight mg', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W }];
    return [
      { id: 'N1', name: 'Scale reading while starting', short: 'N_start', sym: 'N<sub>start</sub>', unit: 'N', f: d => d.N1, vs: 'W' },
      { id: 'N3', name: 'Scale reading while stopping', short: 'N_stop', sym: 'N<sub>stop</sub>', unit: 'N', f: d => d.N3, vs: 'W' },
      { id: 'W', name: 'True weight mg (cruising)', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W },
      { id: 'vmax', name: 'Cruising speed', short: 'v', sym: 'v<sub>max</sub>', unit: 'm/s', f: d => d.vmax }];
  },
  work(v, d, mode){
    const h0 = '<h4>1 · Free-body diagram of you</h4><div class="eq">Only two forces: weight mg = (' + H.iv('m') + ')(' + H.g() + ') = ' + H.n(d.W, 'N') + ' down, and the scale’s normal force N up. <b>The scale reads N</b>, not mg.</div>' +
      '<div class="eq">Newton’s 2nd law (up = +): N − mg = ma → <b>N = m(g + a)</b></div>';
    if (mode === 'snap') return h0 + '<h4>2 · Cable snaps: everything falls with a = −g</h4><div class="eq">N = m(g + (−g)) = <b>0 N</b>. You, the scale and the elevator all fall together, so you don’t press on the scale.</div>' +
      '<div class="eq">This is true even if the elevator was still going up at ' + H.iv('v0') + ' when it snapped: the acceleration is −g the moment the only force is gravity.</div>' +
      '<p class="note">“Weightless” doesn’t mean gravity turned off: mg is still ' + H.n(d.W, 'N') + '. It means nothing is holding you up. Same reason astronauts float in orbit.</p>';
    const up = mode === 'up', dirW = up ? 'up' : 'down';
    return h0 +
      '<h4>2 · Starting (speeding up going ' + dirW + '): a points ' + dirW + '</h4><div class="eq">N = m(g + a) = (' + H.iv('m') + ')(10 ' + (up ? '+' : '−') + ' ' + H.iv('a') + ') = <b>' + H.n(d.N1, 'N') + '</b> → you feel ' + (up ? '<b>heavier</b>' : '<b>lighter</b>') + ' (scale shows ' + H.n(d.read1, 'kg') + ')</div>' +
      '<h4>3 · Cruising at ' + H.n(d.vmax, 'm/s') + ': a = 0</h4><div class="eq">N = mg = <b>' + H.n(d.N2, 'N') + '</b>: same as standing still, however fast you go. (Newton’s 1st law)</div>' +
      '<h4>4 · Stopping (slowing down going ' + dirW + '): a points ' + (up ? 'down' : 'up') + '</h4><div class="eq">N = (' + H.iv('m') + ')(10 ' + (up ? '−' : '+') + ' ' + H.iv('a') + ') = <b>' + H.n(d.N3, 'N') + '</b> → you feel ' + (up ? '<b>lighter</b>' : '<b>heavier</b>') + ' (' + H.n(d.read3, 'kg') + ')</div>' +
      '<p class="note">The scale depends on the direction of the <b>acceleration</b>, not the direction of motion. Heavier whenever a points up: starting up <i>or</i> stopping on the way down.</p>' +
      (v.a > G10 * 0.99 && !up ? '<div class="bad">a = g going down: you’d float off the scale.</div>' : '');
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const snap = mode === 'snap', T = snap ? 3 : d.T + 1.5, tt = A.t % (T + 1);
    // motion profile
    let vy, y, ay, N;
    if (snap){ const s = Math.min(tt, 2.2), tSnap = 0.8; if (s < tSnap){ vy = v.v0; ay = 0; y = v.v0 * s; } else { const q = s - tSnap; vy = v.v0 - G10 * q; ay = -G10; y = v.v0 * tSnap + v.v0 * q - 5 * q * q; } N = ay === 0 ? d.W : 0; }
    else { const s = Math.min(tt, d.T), t1 = v.t1, sg = d.s; let vv, yy, aa;
      if (s < t1){ aa = v.a; vv = v.a * s; yy = 0.5 * v.a * s * s; }
      else if (s < t1 + 3){ aa = 0; vv = d.vmax; yy = 0.5 * v.a * t1 * t1 + d.vmax * (s - t1); }
      else { const q = s - t1 - 3; aa = -v.a; vv = d.vmax - v.a * q; yy = 0.5 * v.a * t1 * t1 + d.vmax * 3 + d.vmax * q - 0.5 * v.a * q * q; }
      vy = sg * vv; y = sg * yy; ay = sg * aa; N = v.m * (G10 + ay); }
    panelTitle(snap ? 'CABLE SNAPS' : mode === 'up' ? 'RIDING UP' : 'RIDING DOWN', 10, 18);
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
