// Friction Pull: the classic force-sensor lab. Ramp the pull until the block slips (static peak), then it slides (kinetic plateau); or hold a constant pull and watch it accelerate.
const FP_BTN = { x: 296, y: 25, w: 82, h: 22 };
let FP_REPLAY = false;
cv.addEventListener('click', e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 600, y = (e.clientY - r.top) / r.height * 330;
  if (x >= FP_BTN.x && x <= FP_BTN.x + FP_BTN.w && y >= FP_BTN.y && y <= FP_BTN.y + FP_BTN.h) FP_REPLAY = true; });
cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 600, y = (e.clientY - r.top) / r.height * 330;
  cv.style.cursor = (x >= FP_BTN.x && x <= FP_BTN.x + FP_BTN.w && y >= FP_BTN.y && y <= FP_BTN.y + FP_BTN.h) ? 'pointer' : ''; });
// What the sensor, friction and block are doing at time t (seconds of lab time)
function fpState(v, d, mode, t){
  if (mode === 'speedup'){
    if (!d.moves) return { F: v.F, f: v.F, v: 0, x: 0, a: 0, ph: 'rest' };
    return { F: v.F, f: d.fk, v: d.a * t, x: 0.5 * d.a * t * t, a: d.a, ph: 'accel' };
  }
  if (t < d.tb) return { F: v.rate * t, f: v.rate * t, v: 0, x: 0, a: 0, ph: 'static' };
  const u = t - d.tb, dF = d.peak - d.fk;
  if (u < d.tau){ const s = u / d.tau; return { F: d.peak - dF * s, f: d.fk, v: dF / v.m * (u - u * u / (2 * d.tau)), x: dF / v.m * (u * u / 2 - u * u * u / (6 * d.tau)), a: (d.peak - dF * s - d.fk) / v.m, ph: 'slide' }; }
  return { F: d.fk, f: d.fk, v: d.vc, x: dF * d.tau * d.tau / (3 * v.m) + d.vc * (u - d.tau), a: 0, ph: 'steady' };
}
const SIM = {
  title: 'Friction Pull',
  hint: 'g = 10 m/s²',
  modes: [{ id: 'ramp', label: 'Pull ramp' }, { id: 'speedup', label: 'Constant pull' }],
  ivs(mode){
    const l = [{ id: 'm', sym: 'm', symText: 'm', label: 'Block mass', unit: 'kg', min: 0.5, max: 5, step: 0.1, val: 2 },
      { id: 'mus', sym: 'μ<sub>s</sub>', symText: 'μs', label: 'Static friction', unit: '', min: 0.1, max: 1, step: 0.01, val: 0.5, show: v => v.toFixed(2), graph: mode === 'ramp' },
      { id: 'muk', sym: 'μ<sub>k</sub>', symText: 'μk', label: 'Kinetic friction', unit: '', min: 0.05, max: 1, step: 0.01, val: 0.35, show: v => v.toFixed(2) }];
    if (mode === 'ramp') l.push({ id: 'rate', sym: 'r', symText: 'r', label: 'Pull rate (how fast the pull grows)', unit: 'N/s', min: 1, max: 10, step: 0.5, val: 3 });
    else l.push({ id: 'F', sym: 'F', symText: 'F', label: 'Pull (held constant)', unit: 'N', min: 1, max: 60, step: 0.5, val: 14, graph: true });
    return l;
  },
  presets: [{ label: 'Heavy block', mode: 'ramp', v: { m: 4 } }, { label: 'Sticky surface', mode: 'ramp', v: { mus: 0.9, muk: 0.5 } }, { label: 'Slick surface', mode: 'ramp', v: { mus: 0.25, muk: 0.2 } },
    { label: 'Pull too weak to start', mode: 'speedup', v: { F: 8 } }, { label: 'Strong pull', mode: 'speedup', v: { F: 30 } }],
  calc(v, mode){
    const W = v.m * G10, N = W, peak = v.mus * N, mukE = Math.min(v.muk, v.mus), fk = mukE * N, tau = 0.6;
    const r = { W, N, peak, fk, mukE, mukBad: v.muk > v.mus + 1e-9, tau };
    if (mode === 'speedup'){
      const moves = v.F > peak + 1e-9, a = moves ? (v.F - fk) / v.m : 0;
      return Object.assign(r, { moves, a, Tend: 4, tb: 0, vc: 0, net: moves ? v.F - fk : 0, plateau: fk });
    }
    const tb = peak / v.rate, vc = (peak - fk) * tau / (2 * v.m), Tend = tb + tau + Math.max(3, 0.35 * tb);
    return Object.assign(r, { tb, vc, Tend, plateau: fk, moves: true, a: 0, net: 0 });
  },
  dvs(mode){
    if (mode === 'speedup') return [
      { id: 'a', name: 'Acceleration', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a },
      { id: 'fk', name: 'Kinetic friction μ_k mg', short: 'f_k', sym: 'f<sub>k</sub>', unit: 'N', f: d => d.fk },
      { id: 'peak', name: 'Pull needed to start it, μ_s mg', short: 'μs·mg', sym: 'μ<sub>s</sub>mg', unit: 'N', f: d => d.peak }];
    return [
      { id: 'peak', name: 'Static peak (breaks free)', short: 'F_peak', sym: 'F<sub>peak</sub>', unit: 'N', f: d => d.peak, vs: 'plateau' },
      { id: 'plateau', name: 'Kinetic plateau', short: 'F_plat', sym: 'F<sub>plateau</sub>', unit: 'N', f: d => d.plateau },
      { id: 'tb', name: 'Time until it breaks free', short: 't', sym: 't<sub>break</sub>', unit: 's', f: d => d.tb }];
  },
  work(v, d, mode){
    const I = id => M.iv(id, 1), mk = d.mukBad ? M.n(d.mukE) : I('muk');
    const clamp = d.mukBad ? '<p class="note">μ<sub>k</sub> is set above μ<sub>s</sub>, which real surfaces don’t do (sliding is never harder than starting). Using μ<sub>k</sub> = μ<sub>s</sub>.</p>' : '';
    const vert = '<p class="st">Vertical: no acceleration, so the table holds the block up:</p>' + TEX`N = m g` + TEX`N = (${I('m')})(10)` + TEXA`N = ${M.n(d.N, 'N')}`;
    if (mode === 'speedup'){
      let h = '<h4>1 · Forces on the block</h4>' + vert +
        '<h4>2 · Friction once it slides</h4>' + TEX`f_k = \mu_k N` + TEX`f_k = (${mk})(${M.n(d.N)})` + TEXA`f_k = ${M.n(d.fk, 'N')}` + clamp;
      if (!d.moves) return h + '<h4>3 · Does it start?</h4><p class="st">From rest, the pull has to beat the <b>static</b> limit first:</p>' + TEX`\mu_s N = (${I('mus')})(${M.n(d.N)})` + TEXA`\mu_s N = ${M.n(d.peak, 'N')}` +
        TEX`${I('F')} \le ${M.n(d.peak)}` + '<div class="bad">The pull is not more than μ<sub>s</sub>mg, so static friction holds the block still: f<sub>s</sub> = F, a = 0. Raise the pull.</div>';
      return h + '<h4>3 · Newton’s 2nd law along the table</h4><p class="st">Pull F forward, kinetic friction backward:</p>' + TEX`F - f_k = m a` + TEX`a = \frac{F - f_k}{m}` +
        TEX`a = \frac{${I('F')} - ${M.n(d.fk)}}{${I('m')}}` + TEXA`a = ${M.n(d.a, 'm/s²')}` +
        '<p class="note">If the pull were only ' + H.n(d.fk, 'N') + ' (= f<sub>k</sub>), then a = 0 and the block would slide at constant speed: the plateau in the ramp lab.</p>';
    }
    return '<h4>1 · Before it moves: static friction matches the pull</h4><p class="st">The block stays put (a = 0), so friction equals whatever the sensor reads, up to a limit:</p>' +
      TEX`f_s = F` + TEX`f_s \le \mu_s N` + vert +
      '<h4>2 · The peak: the biggest static friction</h4><p class="st">The block slips the instant the pull reaches the limit:</p>' +
      TEX`F_{\text{peak}} = \mu_s N` + TEX`F_{\text{peak}} = (${I('mus')})(${M.n(d.N)})` + TEXA`F_{\text{peak}} = ${M.n(d.peak, 'N')}` +
      '<p class="st">The pull grows at ' + H.iv('rate') + ', so that takes:</p>' + TEX`t = \frac{F_{\text{peak}}}{r}` + TEX`t = \frac{${M.n(d.peak)}}{${I('rate')}}` + TEXA`t = ${M.n(d.tb, 's')}` +
      '<h4>3 · The plateau: sliding at steady speed</h4><p class="st">Constant speed means a = 0, so the sensor reads exactly the kinetic friction:</p>' +
      TEX`F_{\text{plateau}} = f_k = \mu_k N` + TEX`F_{\text{plateau}} = (${mk})(${M.n(d.N)})` + TEXA`F_{\text{plateau}} = ${M.n(d.plateau, 'N')}` + clamp +
      '<p class="note">The plateau is lower than the peak: it takes less force to keep a block sliding than to start it.</p>' +
      '<h4>4 · Reading μ off the trace</h4>' + TEX`\mu_s = \frac{F_{\text{peak}}}{m g}` + TEX`\mu_s = \frac{${M.n(d.peak)}}{${M.n(d.W)}}` + TEXA`\mu_s = ${M.n(d.peak / d.W)}` +
      TEX`\mu_k = \frac{F_{\text{plateau}}}{m g}` + TEX`\mu_k = \frac{${M.n(d.plateau)}}{${M.n(d.W)}}` + TEXA`\mu_k = ${M.n(d.plateau / d.W)}`;
  },
  draw(v, d, mode, opt, t, dt, A){
    const ramp = mode === 'ramp', ps = Math.max(1, d.Tend / 10);
    if (A.t === undefined || A.reset || FP_REPLAY){ A.t = 0; FP_REPLAY = false; }
    A.t = Math.min(d.Tend, A.t + dt * ps);
    const tt = A.t, st = fpState(v, d, mode, tt);
    const halo = (s, x, y, col, align, font) => { ctx.save(); ctx.font = font || '700 10px "IBM Plex Mono",monospace'; ctx.textAlign = align || 'left'; ctx.lineWidth = 3; ctx.strokeStyle = '#fbfbfb'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); };
    // ---- scene: block on the table, force sensor in the string
    panelTitle('BLOCK PULLED BY A FORCE SENSOR', 10, 18);
    const PX = 90, dpx = st.x * PX, move = Math.min(dpx, 90), bx = 60 + move, tabY = 122, bw = 54, bh = 38;
    ctx.fillStyle = '#d6d6d6'; ctx.fillRect(0, tabY, 385, 14); ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 2;
    const sh = (((dpx - move) % 40) + 40) % 40; for (let x = -40; x < 420; x += 40){ ctx.beginPath(); ctx.moveTo(x - sh, tabY + 2); ctx.lineTo(x - sh, tabY + 12); ctx.stroke(); }
    ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(bx, tabY - bh, bw, bh); ctx.strokeRect(bx, tabY - bh, bw, bh);
    text(v.m.toFixed(1) + ' kg', bx + bw / 2, tabY - bh / 2 + 4, { align: 'center', font: '700 10px "IBM Plex Mono",monospace' });
    const sx = bx + bw, sy = tabY - bh / 2;
    ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 56 + 34, sy); ctx.stroke();
    ctx.fillStyle = '#333'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(sx + 8, sy - 11, 52, 22); ctx.strokeRect(sx + 8, sy - 11, 52, 22);
    text(fplain(st.F) + ' N', sx + 34, sy + 4, { align: 'center', font: '700 11px "IBM Plex Mono",monospace', col: '#7dff9a' });
    ctx.fillStyle = '#f2c7a0'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sx + 90 + 8, sy, 9, 0, 7); ctx.fill(); ctx.stroke();
    text('hand', sx + 98, sy - 14, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // replay button
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(FP_BTN.x, FP_BTN.y, FP_BTN.w, FP_BTN.h); ctx.strokeRect(FP_BTN.x, FP_BTN.y, FP_BTN.w, FP_BTN.h);
    text('↻ Replay', FP_BTN.x + FP_BTN.w / 2, FP_BTN.y + 15, { align: 'center', font: '700 12px "Space Grotesk",sans-serif' });
    // status line
    const sttxt = { rest: 'at rest: static friction = the pull', static: 'at rest: static friction = the pull', slide: 'it slipped: kinetic friction, speeding up', accel: 'sliding: pull beats kinetic friction, a > 0', steady: d.vc < 0.005 ? 'μk = μs: no drop after the peak' : 'sliding at steady speed: sensor reads μk·mg' }[st.ph];
    text(sttxt, 10, 152, { font: '700 13px "Space Grotesk",sans-serif', col: (st.ph === 'static' || st.ph === 'rest') ? '#1e7d45' : '#c43a00' });
    // ---- force-vs-time trace
    const pl = 46, pr = 380, pt = 182, pb = 296, ymax = ramp ? d.peak * 1.25 : Math.max(v.F, d.peak, d.fk) * 1.25;
    const X = q => pl + (pr - pl) * q / d.Tend, Y = f => pb - (pb - pt) * f / ymax;
    panelTitle(ramp ? 'SENSOR READING F (N) vs TIME (s)' : 'PULL F AND FRICTION f (N) vs TIME (s)', 10, 172);
    if (ps > 1.05) text('plays ×' + fplain(ps) + ' faster', 380, 172, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(pl, pt - 4); ctx.lineTo(pl, pb); ctx.lineTo(pr, pb); ctx.stroke();
    text('0', pl - 4, pb + 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(ymax), pl - 4, pt + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('0', pl, pb + 12, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(d.Tend) + ' s', pr, pb + 12, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    const curve = (fn, col, w, upto, dash) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.beginPath(); const n = 240; for (let k = 0; k <= n; k++){ const q = upto * k / n, y = fn(fpState(v, d, mode, q)); k ? ctx.lineTo(X(q), Y(y)) : ctx.moveTo(X(q), Y(y)); } ctx.stroke(); ctx.setLineDash([]); };
    if (ramp){
      curve(s => s.F, '#d4d4d4', 2, d.Tend, [4, 3]);
      ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); [d.peak, d.fk].forEach(f => { ctx.beginPath(); ctx.moveTo(pl, Y(f)); ctx.lineTo(pr, Y(f)); ctx.stroke(); }); ctx.setLineDash([]);
      curve(s => s.F, COL.F, 3, tt);
      if (tt >= d.tb) halo('static peak  μs·mg = ' + fplain(d.peak) + ' N', pl + 6, Y(d.peak) - 5, '#1e7d45');
      if (tt >= d.tb + d.tau) halo('kinetic plateau  μk·mg = ' + fplain(d.fk) + ' N', pr - 12, Y(d.fk) + 13, COL.T, 'right');
    } else {
      curve(s => s.F, COL.F, 3, d.Tend);
      if (d.moves){ curve(s => s.f, COL.T, 3, d.Tend, [6, 4]);
        ctx.fillStyle = 'rgba(21,70,214,0.10)'; ctx.fillRect(pl, Y(v.F), pr - pl, Y(d.fk) - Y(v.F));
        halo('pull F = ' + fplain(v.F) + ' N', pl + 6, Y(v.F) - 5, COL.F); halo('kinetic friction μk·mg = ' + fplain(d.fk) + ' N', pl + 6, Y(d.fk) + 13, COL.T);
        halo('net = F − f = ma = ' + fplain(d.net) + ' N', pr - 4, Y(d.fk) - 5, COL.V, 'right'); }
      else halo('pull F = ' + fplain(v.F) + ' N (static: stays put)', pl + 6, Y(v.F) + 13, '#1e7d45');
      ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(pl, Y(d.peak)); ctx.lineTo(pr, Y(d.peak)); ctx.stroke(); ctx.setLineDash([]);
      halo('to start: F > μs·mg = ' + fplain(d.peak) + ' N', d.moves ? pl + 6 : pr - 4, Y(d.peak) - 4, '#555', d.moves ? 'left' : 'right', '500 10px "IBM Plex Mono",monospace');
    }
    ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(tt), pb); ctx.lineTo(X(tt), Y(st.F)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(tt), Y(st.F), 5, 0, 7); ctx.fill(); ctx.stroke();
    // ---- right: free-body diagram and readouts
    panelTitle('FORCES ON THE BLOCK', 395, 18);
    const fx = 490, fy = 88, s = 30, sc = 38 / Math.max(d.W, st.F, 1);
    ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(fx - s / 2, fy - s / 2, s, s); ctx.strokeRect(fx - s / 2, fy - s / 2, s, s);
    arrow(fx, fy - s / 2, fx, fy - s / 2 - d.N * sc, COL.N, 'N', { lx: 6, ly: 0 });
    arrow(fx, fy + s / 2, fx, fy + s / 2 + d.W * sc, COL.W, 'mg', { lx: 6, ly: 0 });
    const sh2 = 62 / Math.max(d.peak, st.F, 1);
    arrow(fx + s / 2, fy, fx + s / 2 + st.F * sh2, fy, COL.F, 'pull F', { lx: 0, ly: -12, align: 'center' });
    if (st.f > 0.01) arrow(fx - s / 2, fy, fx - s / 2 - st.f * sh2, fy, COL.T, (st.ph === 'static' || st.ph === 'rest') ? 'f_s' : 'f_k', { lx: 0, ly: 13, align: 'center' });
    const rows = [['sensor F', fplain(st.F) + ' N', COL.F], ['friction', fplain(st.f) + ' N ' + ((st.ph === 'static' || st.ph === 'rest') ? '(static)' : '(kinetic)'), COL.T], ['net force', fplain(Math.max(0, st.F - st.f)) + ' N', '#111'], ['speed v', fplain(st.v) + ' m/s', COL.V], ['accel a', fplain(st.a) + ' m/s²', COL.V], ['time', fplain(tt) + ' s', '#4a4a4a']];
    rows.forEach((r, i) => { text(r[0], 395, 188 + i * 17, { font: '500 11px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(r[1], 462, 188 + i * 17, { font: '700 11px "IBM Plex Mono",monospace', col: r[2] }); });
    text('mg = ' + fplain(d.W) + ' N   N = ' + fplain(d.N) + ' N', 395, 308, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    if (d.mukBad) text('μk > μs: using μk = μs', 395, 322, { font: '700 11px "IBM Plex Mono",monospace', col: '#c43a00' });
  }
};
