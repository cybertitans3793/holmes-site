// Projectiles: horizontal launch, angled launch on level ground, angled launch from a height, and hitting a target.
const SIM = {
  title: 'Projectiles',
  modes: [{ id: 'horiz', label: 'Off a cliff' }, { id: 'level', label: 'Level ground' }, { id: 'height', label: 'From a height' }, { id: 'target', label: 'Hit the target' }],
  ivs(mode){
    if (mode === 'horiz') return [
      { id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Launch speed (horizontal)', unit: 'm/s', min: 0, max: 30, step: 0.5, val: 10, graph: true },
      { id: 'h', sym: 'h', symText: 'h', label: 'Cliff height', unit: 'm', min: 5, max: 100, step: 1, val: 45 }];
    if (mode === 'level') return [
      { id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Launch speed', unit: 'm/s', min: 5, max: 40, step: 0.5, val: 20 },
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Launch angle', unit: '°', min: 5, max: 85, step: 1, val: 30, graph: true, show: x => x.toFixed(0) + '°' }];
    if (mode === 'height') return [
      { id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Launch speed', unit: 'm/s', min: 2, max: 40, step: 0.5, val: 15 },
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Launch angle (− = downward)', unit: '°', min: -60, max: 85, step: 1, val: 30, graph: true, show: x => x.toFixed(0) + '°' },
      { id: 'h', sym: 'h', symText: 'h', label: 'Launch height above the ground', unit: 'm', min: 0, max: 80, step: 1, val: 20 }];
    return [
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Launch angle', unit: '°', min: 10, max: 80, step: 1, val: 45, graph: true, show: x => x.toFixed(0) + '°' },
      { id: 'D', sym: 'D', symText: 'D', label: 'Target distance', unit: 'm', min: 5, max: 80, step: 1, val: 30 },
      { id: 'yT', sym: 'y<sub>T</sub>', symText: 'yT', label: 'Target height (− = below)', unit: 'm', min: -20, max: 30, step: 0.5, val: 5 }];
  },
  presets: [{ label: 'Complementary angles', mode: 'level', v: { th: 60 } }, { label: '45°', mode: 'level', v: { th: 45 } }, { label: 'Thrown down', mode: 'height', v: { th: -30 } }, { label: 'Just drop it', mode: 'horiz', v: { v0: 0 } }],
  calc(v, mode){
    let v0, th, h = 0, ok = true;
    if (mode === 'horiz'){ v0 = v.v0; th = 0; h = v.h; }
    else if (mode === 'level'){ v0 = v.v0; th = v.th; }
    else if (mode === 'height'){ v0 = v.v0; th = v.th; h = v.h; }
    else { th = v.th; const c = Math.cos(th * DEG), den = v.D * Math.tan(th * DEG) - v.yT; ok = den > 0; v0 = ok ? v.D / c * Math.sqrt(G10 / (2 * den)) : NaN; }
    const vx = v0 * Math.cos(th * DEG), vy = v0 * Math.sin(th * DEG);
    let T;
    if (mode === 'target') T = ok ? v.D / vx : NaN; else T = (vy + Math.sqrt(vy * vy + 2 * G10 * h)) / G10;
    const R = vx * T, yEnd = mode === 'target' ? v.yT : 0, vyEnd = vy - G10 * T, vEnd = Math.hypot(vx, vyEnd), angEnd = Math.atan2(vyEnd, vx) / DEG;
    const tTop = vy > 0 ? vy / G10 : 0, yMax = h + (vy > 0 ? vy * vy / (2 * G10) : 0);
    const pos = s => [vx * s, h + vy * s - 5 * s * s];
    return { v0, th, h, vx, vy, T, R, yEnd, vyEnd, vEnd, angEnd, tTop, yMax, pos, ok, R90: mode === 'level' ? v0 * v0 * Math.sin(2 * (90 - th) * DEG) / G10 : NaN };
  },
  dvs(mode){
    const l = [
      { id: 'R', name: 'Horizontal distance (range)', short: 'R', sym: 'R', unit: 'm', f: d => d.R },
      { id: 'T', name: 'Time in the air', short: 't', sym: 't', unit: 's', f: d => d.T },
      { id: 'yMax', name: 'Highest point', short: 'y_max', sym: 'y<sub>max</sub>', unit: 'm', f: d => d.yMax },
      { id: 'vEnd', name: 'Speed at impact', short: 'v_f', sym: 'v<sub>f</sub>', unit: 'm/s', f: d => d.vEnd }];
    if (mode === 'target') l.unshift({ id: 'v0', name: 'Launch speed needed', short: 'v0', sym: 'v<sub>0</sub>', unit: 'm/s', f: d => d.v0 });
    return l;
  },
  work(v, d, mode){
    if (mode === 'target' && !d.ok) return '<div class="bad">At ' + H.iv('th') + ' the launch line points below the target, so no speed can reach it. Aim higher.</div>';
    const iv0 = mode === 'target' ? H.n(d.v0, 'm/s') : H.iv('v0'), ith = mode === 'horiz' ? '0°' : H.iv('th');
    let h = '<h4>1 · Split the launch velocity into components</h4>' +
      (mode === 'horiz' ? '<div class="eq">Launched horizontally: v<sub>x</sub> = ' + iv0 + ', v<sub>y0</sub> = 0</div>'
        : '<div class="eq">v<sub>x</sub> = v<sub>0</sub>cosθ = (' + iv0 + ')cos ' + ith + ' = ' + H.n(d.vx, 'm/s') + ' &nbsp; v<sub>y0</sub> = v<sub>0</sub>sinθ = ' + H.n(d.vy, 'm/s') + '</div>') +
      '<p class="note">Horizontal: no force → v<sub>x</sub> stays constant. Vertical: a = −g. The two directions are independent; time links them.</p>';
    if (mode === 'target'){
      h += '<h4>2 · Horizontal gives the time</h4><div class="eq">t = D/v<sub>x</sub> = D/(v<sub>0</sub>cosθ)</div>' +
        '<h4>3 · Vertical must land on the target</h4><div class="eq">y<sub>T</sub> = (v<sub>0</sub>sinθ)t − ½gt² → substitute t: y<sub>T</sub> = D tanθ − gD²/(2v<sub>0</sub>²cos²θ)</div>' +
        '<div class="eq">v<sub>0</sub> = (D/cosθ)·√(g / (2(D tanθ − y<sub>T</sub>))) = <b>' + H.n(d.v0, 'm/s') + '</b>, in the air for ' + H.n(d.T, 's') + '</div>' +
        '<p class="note">Try other angles: the needed speed has a minimum somewhere between θ = 45° and straight at the target.</p>';
      return h;
    }
    h += '<h4>2 · Vertical: how long is it in the air?</h4>' +
      (d.h === 0 ? '<div class="eq">Lands at the same height: 0 = v<sub>y0</sub>t − ½gt² → t = 2v<sub>y0</sub>/g = 2(' + H.n(d.vy) + ')/10 = <b>' + H.n(d.T, 's') + '</b></div>'
        : mode === 'horiz' ? '<div class="eq">Falls h with v<sub>y0</sub> = 0: h = ½gt² → t = √(2h/g) = √(2 × ' + H.iv('h') + ' / 10) = <b>' + H.n(d.T, 's') + '</b></div><p class="note">The same time as a ball just dropped from the cliff (the grey ball): horizontal speed doesn’t change how fast it falls.</p>'
        : '<div class="eq">0 = h + v<sub>y0</sub>t − ½gt² → t = [v<sub>y0</sub> + √(v<sub>y0</sub>² + 2gh)]/g = <b>' + H.n(d.T, 's') + '</b></div>');
    h += '<h4>3 · Horizontal: how far?</h4><div class="eq">R = v<sub>x</sub>t = (' + H.n(d.vx) + ')(' + H.n(d.T) + ') = <b>' + H.n(d.R, 'm') + '</b></div>';
    if (d.vy > 0) h += '<h4>4 · Top of the path: v<sub>y</sub> = 0 (v<sub>x</sub> isn’t!)</h4><div class="eq">t<sub>top</sub> = v<sub>y0</sub>/g = ' + H.n(d.tTop, 's') + ' &nbsp; y<sub>max</sub> = ' + (d.h ? 'h + ' : '') + 'v<sub>y0</sub>²/2g = <b>' + H.n(d.yMax, 'm') + '</b>. Speed at the top = v<sub>x</sub> = ' + H.n(d.vx, 'm/s') + '</div>';
    h += '<h4>' + (d.vy > 0 ? '5' : '4') + ' · Impact velocity</h4><div class="eq">v<sub>x</sub> = ' + H.n(d.vx) + ', v<sub>y</sub> = v<sub>y0</sub> − gt = ' + H.n(d.vyEnd) + ' → |v| = √(v<sub>x</sub>² + v<sub>y</sub>²) = <b>' + H.n(d.vEnd, 'm/s') + '</b> at ' + H.n(-d.angEnd, '°') + ' below horizontal</div>';
    if (mode === 'level') h += '<p class="note">Range on level ground: R = v<sub>0</sub>² sin(2θ)/g. Biggest at 45°; complementary angles (like 30° and 60°) give the same range: the dashed path is ' + H.n(90 - v.th, '°') + '.</p>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    if (mode === 'target' && !d.ok){ panelTitle('HIT THE TARGET', 10, 18); text('Aim higher: the launch line is below the target.', 300, 160, { align: 'center', font: '700 15px "Space Grotesk",sans-serif', col: '#c43a00' }); return; }
    const T = d.T, tt = Math.min(A.t % (T + 1.5), T);
    panelTitle(mode === 'horiz' ? 'LAUNCHED HORIZONTALLY OFF A CLIFF' : mode === 'level' ? 'LAUNCHED ON LEVEL GROUND' : mode === 'height' ? 'LAUNCHED FROM A HEIGHT' : 'HIT THE TARGET', 10, 18);
    // scale to fit
    let xmax = Math.max(d.R, 5), ymax = Math.max(d.yMax, d.h, mode === 'target' ? v.yT : 0, 3), ymin = Math.min(0, mode === 'target' ? v.yT : 0);
    if (mode === 'level') xmax = Math.max(xmax, d.R90);
    const sc = Math.min(480 / xmax, 230 / (ymax - ymin)), x0 = mode === 'horiz' || mode === 'height' ? 80 : 50, gy = 280 + ymin * sc;
    const X = x => x0 + x * sc, Y = y => gy - y * sc;
    ctx.fillStyle = '#e6dccb'; ctx.fillRect(0, Y(0), 600, 330 - Y(0));
    if (d.h > 0){ ctx.fillStyle = '#b89a6a'; ctx.fillRect(0, Y(d.h), x0, Y(0) - Y(d.h)); ctx.fillStyle = '#4a7a3a'; ctx.fillRect(0, Y(d.h) - 3, x0, 3); }
    if (mode === 'target'){ const tx = X(v.D), ty = Y(v.yT); if (v.yT > 0){ ctx.fillStyle = '#b89a6a'; ctx.fillRect(tx - 6, ty, 600, Y(0) - ty); } else if (v.yT < 0){ ctx.fillStyle = '#fbfbfb'; ctx.fillRect(tx - 30, Y(0), 600, ty - Y(0)); ctx.fillStyle = '#b89a6a'; ctx.fillRect(tx - 34, Y(0), 4, ty - Y(0)); }
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 3; [12, 7].forEach(r => { ctx.beginPath(); ctx.arc(tx, ty - 1, r, PI, 2 * PI); ctx.stroke(); }); }
    if (mode === 'level'){ const th2 = 90 - v.th, vx2 = d.v0 * Math.cos(th2 * DEG), vy2 = d.v0 * Math.sin(th2 * DEG), T2 = 2 * vy2 / G10; ctx.setLineDash([4, 4]); ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = 0; k <= 80; k++){ const s = T2 * k / 80; const px = X(vx2 * s), py = Y(vy2 * s - 5 * s * s); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.setLineDash([]); text(fplain(th2) + '°', X(vx2 * T2 / 2), Y(vy2 * vy2 / 20) - 6, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#999' }); }
    // dropped comparison ball for the horizontal launch
    if (mode === 'horiz'){ const yd = Math.max(0, d.h - 5 * tt * tt); ctx.fillStyle = '#bbb'; ctx.beginPath(); ctx.arc(X(0) - 12, Y(yd), 6, 0, 7); ctx.fill(); }
    // path, strobe dots
    ctx.strokeStyle = 'rgba(255,106,43,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = 0; k <= 100; k++){ const p = d.pos(T * k / 100); k ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])); } ctx.stroke();
    const step = T > 4 ? 0.5 : T > 2 ? 0.25 : 0.1;
    for (let s = 0; s <= tt + 1e-9; s += step){ const p = d.pos(s); ctx.fillStyle = '#ffb38f'; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 3, 0, 7); ctx.fill(); if (mode === 'horiz'){ ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(X(0) - 12, Y(d.pos(s)[1]), 2.5, 0, 7); ctx.fill(); } }
    const p = d.pos(tt), bx = X(p[0]), by = Y(p[1]); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(bx, by, 7, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.stroke();
    const vyNow = d.vy - G10 * tt, k = 2.2;
    arrow(bx, by, bx + d.vx * k, by, COL.V, 'vx', { w: 2.5, head: 7, lx: 4, ly: -8 });
    if (Math.abs(vyNow) > 0.3) arrow(bx, by, bx, by - vyNow * k, '#7a3fb0', 'vy', { w: 2.5, head: 7, lx: 6, ly: 0 });
    // launcher
    const lx = X(0), ly = Y(d.h); ctx.save(); ctx.translate(lx, ly); ctx.rotate(-d.th * DEG); ctx.fillStyle = '#333'; ctx.fillRect(-6, -5, 26, 10); ctx.restore();
    // readouts
    text('R = ' + fplain(d.R) + ' m   t = ' + fplain(d.T) + ' s' + (mode === 'target' ? '   v₀ needed = ' + fplain(d.v0) + ' m/s' : ''), 590, 18, { align: 'right', font: '700 12px "IBM Plex Mono",monospace' });
    if (d.vy > 0){ ctx.setLineDash([3, 3]); ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(d.vx * d.tTop) - 40, Y(d.yMax)); ctx.lineTo(X(d.vx * d.tTop) + 40, Y(d.yMax)); ctx.stroke(); ctx.setLineDash([]); text('top: vy = 0', X(d.vx * d.tTop) + 44, Y(d.yMax) + 4, { font: '600 10px "IBM Plex Mono",monospace', col: '#888' }); }
    text('t = ' + fplain(tt) + ' s   x = ' + fplain(p[0]) + ' m   y = ' + fplain(p[1]) + ' m', 12, 322, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
