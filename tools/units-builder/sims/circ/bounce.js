// Bouncing Ball: impulse from the floor, momentum of the ball vs the ball + Earth system, and "how elastic?"
const SIM = {
  title: 'Bouncing Ball',
  ivs(){ return [
    { id: 'h', sym: 'h', symText: 'h', label: 'Drop height', unit: 'm', min: 0.5, max: 3, step: 0.05, val: 1.5 },
    { id: 'f', sym: 'h′/h', symText: 'h′/h', label: 'Bounce height fraction', unit: '', min: 0, max: 1, step: 0.01, val: 0.6, graph: true, show: v => v.toFixed(2) },
    { id: 'm', sym: 'm', symText: 'm', label: 'Ball mass', unit: 'kg', min: 0.05, max: 0.6, step: 0.01, val: 0.06 },
    { id: 'dt', sym: 'Δt', symText: 'Δt', label: 'Contact time', unit: 's', min: 0.002, max: 0.05, step: 0.001, val: 0.01 }]; },
  presets: [{ label: 'Superball', v: { f: 0.9 } }, { label: 'Tennis ball', v: { f: 0.55 } }, { label: 'Basketball', v: { f: 0.65, m: 0.6 } }, { label: 'Clay', v: { f: 0 } }],
  calc(v){
    const v1 = Math.sqrt(2 * G10 * v.h), h2 = v.f * v.h, v2 = Math.sqrt(2 * G10 * h2), dp = v.m * (v2 + v1), Fnet = dp / v.dt, N = Fnet + v.m * G10;
    return { v1, h2, v2, dp, Fnet, N, ratio: N / (v.m * G10), Klost: 1 - v.f, vE: dp / 5.97e24 };
  },
  dvs(){ return [
    { id: 'dp', name: 'Change in ball’s momentum', short: 'Δp', sym: 'Δp', unit: 'kg·m/s', f: d => d.dp },
    { id: 'N', name: 'Average force from floor', short: 'F_floor', sym: 'F<sub>floor</sub>', unit: 'N', f: d => d.N },
    { id: 'v2', name: 'Speed after bounce', short: 'v_up', sym: 'v<sub>up</sub>', unit: 'm/s', f: d => d.v2 },
    { id: 'Klost', name: 'Fraction of KE lost', short: 'KE lost', sym: 'KE lost', unit: '', f: d => d.Klost }]; },
  work(v, d){
    return '<h4>1 · Speed just before hitting (energy)</h4>' + TEX`v_{\text{down}} = \sqrt{2gh}` + TEX`v_{\text{down}} = \sqrt{2\,(${M.n(10, 'm/s²')})(${M.iv('h')})}` + TEXA`v_{\text{down}} = ${M.n(d.v1, 'm/s')}` +
      '<h4>2 · Speed just after (from the bounce height)</h4>' + TEX`h' = \frac{h'}{h}\,h = (${M.iv('f')})\,h` + TEX`h' = ${M.n(d.h2, 'm')}` +
      TEX`v_{\text{up}} = \sqrt{2gh'}` + TEX`v_{\text{up}} = \sqrt{2\,(${M.n(10, 'm/s²')})(${M.n(d.h2)})}` + TEXA`v_{\text{up}} = ${M.n(d.v2, 'm/s')}` +
      '<h4>3 · Change in momentum (+ = up)</h4>' + TEX`\Delta p = m\left(v_{\text{up}} - (-v_{\text{down}})\right)` + TEX`\Delta p = (${M.iv('m')})(${M.n(d.v2)} + ${M.n(d.v1)})` + TEXA`\Delta p = ${M.n(d.dp, 'kg·m/s')}` +
      '<p class="note">Bouncing up adds to Δp. A superball gets almost twice the impulse of a clay ball dropped from the same height.</p>' +
      '<h4>4 · Force from the floor</h4><p class="st">The floor’s push N and the weight mg act on the ball during contact:</p>' + TEX`(N - mg)\,\Delta t = \Delta p` + TEX`N = \frac{\Delta p}{\Delta t} + mg` +
      TEX`N = \frac{${M.n(d.dp)}}{${M.iv('dt')}} + ${M.n(v.m * G10)}` + TEXA`N = ${M.n(d.N, 'N')}` + '<p class="st">That is ' + H.n(d.ratio) + ' × its weight.</p>' +
      '<h4>5 · Is momentum conserved?</h4><p class="st">Not for the ball alone: the floor pushes on it. For ball + Earth, yes. Earth gets</p>' + TEX`\Delta p_{\text{Earth}} = ${M.n(-d.dp, 'kg·m/s')}` +
      '<p class="st">so its speed changes by ' + H.n(d.vE, 'm/s') + '.</p>' +
      '<h4>6 · How elastic?</h4>' + TEX`\frac{K_{\text{after}}}{K_{\text{before}}} = \frac{h'}{h} = ${M.iv('f')}` + TEXA`\text{lost} = ${M.n(100 * d.Klost)}\%` +
      '<p class="st">of the kinetic energy is lost' + (v.f >= 0.999 ? ' (perfectly elastic)' : v.f === 0 ? ' (perfectly inelastic)' : '') + '.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle('SIDE VIEW', 10, 18);
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const gy = 280, sc = 230 / 3, x = 140, r = 6 + 14 * Math.sqrt(v.m / 0.6);
    const tFall = Math.sqrt(2 * v.h / G10), tUp = d.v2 / G10, cyc = tFall + 2 * tUp + 0.6; const tt = A.t % cyc;
    let y; if (tt < tFall) y = v.h - 0.5 * G10 * tt * tt; else if (tt < tFall + 2 * tUp) { const s = tt - tFall; y = d.v2 * s - 0.5 * G10 * s * s; } else y = 0;
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(0, gy, 370, 50); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(370, gy); ctx.stroke();
    const line = (hh, lab, col) => { const py = gy - hh * sc; ctx.setLineDash([4, 4]); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(60, py); ctx.lineTo(300, py); ctx.stroke(); ctx.setLineDash([]); text(lab, 304, py + 4, { font: '600 11px "IBM Plex Mono",monospace', col }); };
    line(v.h, 'h', '#4a4a4a'); line(d.h2, 'h′', '#c43a00');
    ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, gy - r - y * sc, r, 0, 7); ctx.fill(); ctx.stroke();
    // momentum vectors just before and after the bounce
    panelTitle('MOMENTUM AT THE BOUNCE', 390, 18);
    const s = 120 / Math.max(v.m * d.v1 * 2, 1e-9), bx = 405, by = 170;
    arrow(bx, by - 60, bx, by - 60 + v.m * d.v1 * s, '#1546d6', 'p before', { lx: 8, ly: 0 });
    if (d.v2 > 0) arrow(bx + 60, by, bx + 60, by - v.m * d.v2 * s, '#1e7d45', 'p after', { lx: 8, ly: 0 });
    arrow(bx + 120, by + 60, bx + 120, by + 60 - d.dp * s, '#c43a00', 'Δp = J', { lx: -6, ly: 0, align: 'right' });
    text('Δp = p after − p before', 390, 300, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('(arrows to scale)', 390, 316, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
  }
};
