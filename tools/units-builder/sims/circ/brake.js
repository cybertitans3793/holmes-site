// Brake or Go? Reaction distance + braking distance (a = μg from F = ma), and the yellow-light dilemma.
const SIM = {
  title: 'Brake or Go?',
  modes: [{ id: 'stop', label: 'Can you stop?' }, { id: 'yellow', label: 'Yellow light' }],
  ivs(mode){
    const l = [{ id: 'v', sym: 'v', symText: 'v', label: 'Speed', unit: 'm/s', min: 5, max: 40, step: 0.5, val: 25, graph: true, show: x => x.toFixed(1) + ' m/s (' + (x * 2.237).toFixed(0) + ' mph)' },
      { id: 'D', sym: 'D', symText: 'D', label: mode === 'stop' ? 'Distance to the obstacle' : 'Distance to the stop line', unit: 'm', min: 10, max: 150, step: 1, val: mode === 'stop' ? 80 : 50 },
      { id: 'mu', sym: 'μ', symText: 'μ', label: 'Tire–road friction', unit: '', min: 0.1, max: 1, step: 0.01, val: 0.7, show: x => x.toFixed(2) }];
    if (mode === 'stop') l.push({ id: 'tr', sym: 't<sub>r</sub>', symText: 'tr', label: 'Reaction time', unit: 's', min: 0.3, max: 2.5, step: 0.05, val: 1 });
    else l.push({ id: 'Ty', sym: 't<sub>y</sub>', symText: 'ty', label: 'Yellow light lasts', unit: 's', min: 2, max: 6, step: 0.1, val: 3.5 });
    return l;
  },
  presets: [{ label: 'Dry road', v: { mu: 0.7 } }, { label: 'Wet road', v: { mu: 0.4 } }, { label: 'Ice', v: { mu: 0.1 } }, { label: 'Texting (2 s)', mode: 'stop', v: { tr: 2 } }],
  calc(v, mode){
    const tr = mode === 'stop' ? v.tr : 1.0, W = 15, a = v.mu * G10, dR = v.v * tr, dB = v.v * v.v / (2 * a), dS = dR + dB, tS = tr + v.v / a;
    const canStop = dS <= v.D, vHit = canStop ? 0 : (v.D <= dR ? v.v : Math.sqrt(v.v * v.v - 2 * a * (v.D - dR)));
    const tGo = (v.D + W) / v.v, canGo = mode === 'yellow' ? tGo <= v.Ty : false;
    return { tr, W, a, dR, dB, dS, tS, canStop, vHit, tGo, canGo, slack: v.D - dS };
  },
  dvs(mode){
    const l = [
      { id: 'dS', name: 'Total stopping distance', short: 'd_stop', sym: 'd<sub>stop</sub>', unit: 'm', f: d => d.dS },
      { id: 'dR', name: 'Reaction distance v·t_r', short: 'd_r', sym: 'd<sub>r</sub>', unit: 'm', f: d => d.dR },
      { id: 'dB', name: 'Braking distance v²/2μg', short: 'd_b', sym: 'd<sub>b</sub>', unit: 'm', f: d => d.dB },
      { id: 'a', name: 'Braking deceleration μg', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a }];
    if (mode === 'stop') l.push({ id: 'vHit', name: 'Speed at the obstacle', short: 'v_hit', sym: 'v<sub>hit</sub>', unit: 'm/s', f: d => d.vHit });
    else l.push({ id: 'tGo', name: 'Time to clear the intersection', short: 't_go', sym: 't<sub>go</sub>', unit: 's', f: d => d.tGo });
    return l;
  },
  work(v, d, mode){
    let h = '<h4>1 · Braking: F = ma with friction as the net force</h4><div class="eq">f = μN = μmg = ma → a = μg = (' + H.iv('mu') + ')(' + H.g() + ') = <b>' + H.n(d.a, 'm/s²') + '</b> (the mass cancels: a truck and a bike stop at the same rate)</div>' +
      '<h4>2 · Reaction: still going full speed</h4><div class="eq">d<sub>r</sub> = v·t<sub>r</sub> = (' + H.iv('v') + ')(' + (mode === 'stop' ? H.iv('tr') : H.n(d.tr, 's')) + ') = <b>' + H.n(d.dR, 'm') + '</b>' + (mode === 'yellow' ? ' (reaction time 1.0 s)' : '') + '</div>' +
      '<h4>3 · Braking distance</h4><div class="eq">v<sub>f</sub>² = v<sub>0</sub>² − 2ad → d<sub>b</sub> = v²/(2μg) = (' + H.iv('v') + ')² / (2 × ' + H.n(d.a) + ') = <b>' + H.n(d.dB, 'm') + '</b></div>' +
      '<div class="eq">Total: d<sub>stop</sub> = ' + H.n(d.dR) + ' + ' + H.n(d.dB) + ' = <b>' + H.n(d.dS, 'm') + '</b> vs ' + H.iv('D') + '</div>';
    if (mode === 'stop'){
      h += d.canStop ? '<div class="eq"><b>Stops in time</b>, with ' + H.n(d.slack, 'm') + ' to spare.</div>'
        : '<div class="bad">Can’t stop: it reaches the obstacle still going ' + H.n(d.vHit, 'm/s') + ' (v² = v<sub>0</sub>² − 2a(D − d<sub>r</sub>)).</div>';
      h += '<h4>4 · Functional dependence</h4><div class="eq">Double the speed: reaction distance ×2, braking distance <b>×4</b>. Halve μ (wet road): braking distance ×2.</div>' +
        '<p class="note">That’s why speeding is so much worse than it sounds: the braking part grows with v².</p>';
      return h;
    }
    h += '<h4>4 · Option A: stop</h4><div class="eq">' + (d.canStop ? 'Works: ' + H.n(d.dS, 'm') + ' ≤ ' + H.iv('D') : 'Doesn’t work: you need ' + H.n(d.dS, 'm') + ' but only have ' + H.iv('D')) + '</div>' +
      '<h4>5 · Option B: keep going at constant speed</h4><div class="eq">You must cover D + 15 m (the intersection) before red: t = (D + 15)/v = (' + H.iv('D') + ' + 15)/' + H.iv('v') + ' = ' + H.n(d.tGo, 's') + ' vs yellow ' + H.iv('Ty') + ' → ' + (d.canGo ? 'works' : 'doesn’t work') + '</div>';
    h += (d.canStop && d.canGo) ? '<div class="eq"><b>Both work</b>: safe either way.</div>' : d.canStop ? '<div class="eq"><b>Stop.</b></div>' : d.canGo ? '<div class="eq"><b>Go.</b></div>'
      : '<div class="bad"><b>Dilemma zone</b>: too close to stop, too far to make it. Engineers set yellow times so this can’t happen at the speed limit.</div>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const go = mode === 'yellow' && !d.canStop && d.canGo;
    const T = go ? d.tGo + 0.5 : Math.max(d.tS, 1), tt = Math.min(A.t % (T + 1.6), T);
    const pos = s => go ? d.v * s : (s < d.tr ? v.v * s : Math.min(d.dS, d.dR + v.v * (s - d.tr) - 0.5 * d.a * (s - d.tr) ** 2)), vel = s => go ? v.v : (s < d.tr ? v.v : Math.max(0, v.v - d.a * (s - d.tr)));
    panelTitle(mode === 'stop' ? 'SOMETHING ON THE ROAD AHEAD' : 'THE LIGHT TURNS YELLOW', 10, 18);
    const span = Math.max(d.dS, v.D + (mode === 'yellow' ? 15 : 0), go ? v.v * T : 0) * 1.08, L = 30, R = 575, X = x => L + (R - L) * x / span;
    ctx.fillStyle = '#d6d6d6'; ctx.fillRect(10, 50, 580, 50); ctx.fillStyle = '#fff'; for (let k = 20; k < 590; k += 40) ctx.fillRect(k, 74, 20, 3);
    if (mode === 'stop'){ ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.moveTo(X(v.D), 58); ctx.lineTo(X(v.D) + 10, 92); ctx.lineTo(X(v.D) - 10, 92); ctx.closePath(); ctx.fill(); }
    else { ctx.fillStyle = '#fff'; ctx.fillRect(X(v.D), 50, 4, 50); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(X(v.D) + 4, 50, X(v.D + 15) - X(v.D) - 4, 50);
      const red = A.t % (T + 1.6) > v.Ty; ctx.fillStyle = '#111'; ctx.fillRect(X(v.D + 15) + 6, 22, 14, 30); ctx.fillStyle = red ? '#e33' : '#fc3'; ctx.beginPath(); ctx.arc(X(v.D + 15) + 13, red ? 30 : 44, 5, 0, 7); ctx.fill(); }
    // braking zones on the road
    const zr = Math.min(d.dR, span), zb = Math.min(d.dS, span);
    ctx.fillStyle = 'rgba(122,63,176,0.18)'; ctx.fillRect(X(0), 102, X(zr) - X(0), 8); ctx.fillStyle = 'rgba(196,58,0,0.25)'; ctx.fillRect(X(zr), 102, X(zb) - X(zr), 8);
    text('reaction ' + fplain(d.dR) + ' m', X(0), 124, { font: '600 10px "IBM Plex Mono",monospace', col: '#7a3fb0' }); text('braking ' + fplain(d.dB) + ' m', Math.min(X(zr) + 4, 480), 124, { font: '600 10px "IBM Plex Mono",monospace', col: '#c43a00' });
    const px = X(pos(tt)); ctx.fillStyle = '#1546d6'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(px - 34, 64, 34, 18); ctx.strokeRect(px - 34, 64, 34, 18); ctx.fillStyle = '#cfe0ff'; ctx.fillRect(px - 12, 66, 8, 14);
    if (!go && tt > d.tr && vel(tt) > 0){ ctx.fillStyle = '#e33'; ctx.fillRect(px - 36, 66, 3, 5); ctx.fillRect(px - 36, 75, 3, 5); }
    const res = mode === 'stop' ? (d.canStop ? 'stops ' + fplain(d.slack) + ' m short' : 'hits it at ' + fplain(d.vHit) + ' m/s') : d.canStop && d.canGo ? 'either works' : d.canStop ? 'STOP' : d.canGo ? 'GO' : 'DILEMMA ZONE: neither works';
    text(res, 590, 40, { align: 'right', font: '700 13px "Space Grotesk",sans-serif', col: (mode === 'stop' ? d.canStop : (d.canStop || d.canGo)) ? '#1e7d45' : '#c43a00' });
    // v–t graph (area = distance)
    panelTitle('VELOCITY vs TIME (area = distance)', 10, 150);
    const gx = 50, gy0 = 300, gw = 260, gh = 120, X2 = q => gx + gw * q / T, Y2 = q => gy0 - gh * q / Math.max(v.v, 1);
    ctx.fillStyle = 'rgba(122,63,176,0.18)'; ctx.fillRect(X2(0), Y2(v.v), X2(Math.min(d.tr, T)) - X2(0), gy0 - Y2(v.v));
    if (!go){ ctx.fillStyle = 'rgba(196,58,0,0.25)'; ctx.beginPath(); ctx.moveTo(X2(d.tr), gy0); ctx.lineTo(X2(d.tr), Y2(v.v)); ctx.lineTo(X2(d.tS), gy0); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh - 4); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
    ctx.strokeStyle = COL.V; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= 150; k++){ const q = tt * k / 150; k ? ctx.lineTo(X2(q), Y2(vel(q))) : ctx.moveTo(X2(q), Y2(vel(q))); } ctx.stroke();
    text(fplain(v.v), gx - 3, Y2(v.v) + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('t → ' + fplain(T) + ' s', gx + gw, gy0 + 13, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // bar: stopping distance vs available
    panelTitle('NEED vs HAVE (m)', 360, 150);
    const bmax = Math.max(d.dS, v.D) * 1.1, bw = 200, bar = (y, a, b, lab) => { ctx.fillStyle = 'rgba(122,63,176,0.5)'; ctx.fillRect(370, y, bw * a / bmax, 18); ctx.fillStyle = 'rgba(196,58,0,0.6)'; ctx.fillRect(370 + bw * a / bmax, y, bw * b / bmax, 18); text(lab, 370, y - 4, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); };
    bar(185, d.dR, d.dB, 'stopping distance ' + fplain(d.dS));
    ctx.fillStyle = '#555'; ctx.fillRect(370, 235, bw * v.D / bmax, 18); text('distance available ' + fplain(v.D), 370, 231, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    if (mode === 'yellow') text('to go: ' + fplain(d.tGo) + ' s needed, ' + fplain(v.Ty) + ' s of yellow', 370, 285, { font: '600 10px "IBM Plex Mono",monospace', col: d.canGo ? '#1e7d45' : '#c43a00' });
  }
};
