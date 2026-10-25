// Ball Stack: a small ball resting on a big ball, dropped together. Two elastic collisions in a row.
const SIM = {
  title: 'Ball Stack',
  ivs(){ return [
    { id: 'M', sym: 'M', symText: 'M', label: 'Bottom ball mass', unit: 'kg', min: 0.1, max: 1, step: 0.01, val: 0.6, graph: true },
    { id: 'm', sym: 'm', symText: 'm', label: 'Top ball mass', unit: 'kg', min: 0.01, max: 0.6, step: 0.005, val: 0.057 },
    { id: 'h', sym: 'h', symText: 'h', label: 'Drop height', unit: 'm', min: 0.3, max: 2, step: 0.05, val: 1 }]; },
  presets: [{ label: 'Basketball + tennis ball', v: { M: 0.6, m: 0.057 } }, { label: 'Equal masses', v: { M: 0.3, m: 0.3 } }],
  calc(v){
    const u = Math.sqrt(2 * G10 * v.h), k = (3 * v.M - v.m) / (v.M + v.m), vt = u * k, vb = u * (v.M - 3 * v.m) / (v.M + v.m), h2 = vt > 0 ? vt * vt / (2 * G10) : 0;
    return { u, k, vt, vb, h2, ratio: h2 / v.h };
  },
  dvs(){ return [
    { id: 'h2', name: 'How high the top ball goes', short: 'h′', sym: 'h′', unit: 'm', f: d => d.h2 },
    { id: 'vt', name: 'Top ball speed after', short: 'v_top', sym: 'v<sub>top</sub>', unit: 'm/s', f: d => d.vt },
    { id: 'ratio', name: 'h′/h', short: 'h′/h', sym: 'h′/h', unit: '', f: d => d.ratio }]; },
  work(v, d){
    return '<h4>1 · Both balls hit the floor at the same speed</h4><div class="eq">u = √(2gh) = √(2(' + H.g() + ')(' + H.iv('h') + ')) = <b>' + H.n(d.u, 'm/s') + '</b></div>' +
      '<h4>2 · Bottom ball bounces off the floor (elastic): now moving up at u</h4><div class="eq">It meets the top ball, which is still coming down at u. Relative speed = 2u.</div>' +
      '<h4>3 · Elastic collision of the two balls (+ = up)</h4><div class="eq">v<sub>top</sub> = [(m − M)(−u) + 2M(u)]/(m + M) = u(3M − m)/(M + m) = ' + H.n(d.u) + ' × ' + H.n(d.k) + ' = <b>' + H.n(d.vt, 'm/s') + '</b></div>' +
      '<div class="eq">v<sub>bottom</sub> = u(M − 3m)/(M + m) = ' + H.n(d.vb, 'm/s') + (d.vb < 0 ? ' (moving down)' : '') + '</div>' +
      '<h4>4 · How high the top ball goes</h4><div class="eq">h′ = v<sub>top</sub>²/(2g) = <b>' + H.n(d.h2, 'm') + '</b> = ' + H.n(d.ratio) + ' × the drop height</div>' +
      '<p class="note">If M is much bigger than m, v<sub>top</sub> → 3u and h′ → 9h. Momentum and energy are both conserved; the bottom ball gives most of its energy to the top one.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle('SIDE VIEW', 10, 18);
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const gy = 300, sc = Math.min(120, 250 / Math.max(d.h2, v.h, 0.1)), R = 14 + 22 * Math.sqrt(v.M), r = 5 + 14 * Math.sqrt(v.m), x = 160;
    const tf = Math.sqrt(2 * v.h / G10), tu = Math.max(d.vt, 0) / G10, cyc = tf + 2 * tu + 0.8, tt = A.t % cyc;
    let yb, yt;
    if (tt < tf){ yb = v.h - 0.5 * G10 * tt * tt; yt = yb; }
    else { const s = tt - tf; yt = Math.max(0, d.vt * s - 0.5 * G10 * s * s); yb = Math.max(0, d.vb * s - 0.5 * G10 * s * s); }
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(0, gy, 370, 30); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(370, gy); ctx.stroke();
    const line = (hh, lab, col) => { const py = gy - hh * sc; ctx.setLineDash([4, 4]); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(40, py); ctx.lineTo(300, py); ctx.stroke(); ctx.setLineDash([]); text(lab, 304, py + 4, { font: '600 11px "IBM Plex Mono",monospace', col }); };
    line(v.h, 'h', '#4a4a4a'); line(d.h2, 'h′', '#c43a00');
    ctx.fillStyle = '#d2691e'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, gy - R - yb * sc, R, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c8e04a'; ctx.beginPath(); ctx.arc(x + (tt < tf ? 0 : 0), gy - 2 * R - r - yt * sc, r, 0, 7); ctx.fill(); ctx.stroke();
    if (sc < 120) text('zoomed to fit', 12, 318, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    panelTitle('TOP BALL SPEED / u', 400, 18);
    const base = 260, hh = 200; [['before', 1, '#8a8a8a'], ['after', Math.max(0, d.k), '#c43a00'], ['limit', 3, '#e8e8e8']].forEach(([l, q, col], i) => { const x0 = 410 + i * 60, hgt = hh * q / 3.1; ctx.fillStyle = col; ctx.fillRect(x0, base - hgt, 44, hgt); ctx.strokeStyle = '#111'; ctx.strokeRect(x0, base - hgt, 44, hgt); text(l, x0 + 22, base + 14, { align: 'center', font: '700 10px "IBM Plex Mono",monospace' }); text('×' + q.toFixed(2), x0 + 22, base - hgt - 6, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); });
    ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(405, base); ctx.lineTo(590, base); ctx.stroke();
  }
};
