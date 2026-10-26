// Spinning Wheel: rotational kinematics with constant α, and the link to the rim's linear motion (v = rω, a_t = rα, a_c = rω²).
const SIM = {
  title: 'Spinning Wheel',
  modes: [{ id: 'spin', label: 'Speed up / slow down' }, { id: 'stop', label: 'Coast to a stop' }],
  ivs(mode){
    if (mode === 'spin') return [
      { id: 'w0', sym: 'ω<sub>0</sub>', symText: 'ω0', label: 'Starting angular velocity', unit: 'rad/s', min: 0, max: 20, step: 0.5, val: 2 },
      { id: 'al', sym: 'α', symText: 'α', label: 'Angular acceleration', unit: 'rad/s²', min: -5, max: 5, step: 0.1, val: 3 },
      { id: 't', sym: 't', symText: 't', label: 'Time', unit: 's', min: 0.5, max: 10, step: 0.1, val: 4, graph: true },
      { id: 'R', sym: 'r', symText: 'r', label: 'Wheel radius', unit: 'm', min: 0.1, max: 1, step: 0.01, val: 0.5 }];
    return [
      { id: 'rpm', sym: 'rpm<sub>0</sub>', symText: 'rpm0', label: 'Starting speed', unit: 'rpm', min: 10, max: 300, step: 1, val: 120, show: x => x.toFixed(0) + ' rpm' },
      { id: 'tS', sym: 't<sub>stop</sub>', symText: 'tstop', label: 'Time to stop', unit: 's', min: 1, max: 20, step: 0.5, val: 6, graph: true },
      { id: 'R', sym: 'r', symText: 'r', label: 'Wheel radius', unit: 'm', min: 0.1, max: 1, step: 0.01, val: 0.3 }];
  },
  presets: [{ label: 'Slowing down', mode: 'spin', v: { w0: 12, al: -2 } }, { label: 'Turns around', mode: 'spin', v: { w0: 6, al: -3, t: 4 } }, { label: 'Ceiling fan', mode: 'stop', v: { rpm: 180, tS: 15, R: 0.6 } }],
  calc(v, mode){
    let w0, al, T;
    if (mode === 'spin'){ w0 = v.w0; al = v.al; T = v.t; } else { w0 = v.rpm * 2 * PI / 60; T = v.tS; al = -w0 / T; }
    const w = w0 + al * T, th = w0 * T + 0.5 * al * T * T, revs = th / (2 * PI), v1 = v.R * w, at = v.R * al, ac = v.R * w * w;
    const tTurn = al < 0 && w0 > 0 ? w0 / -al : NaN;
    return { w0, al, T, w, th, revs, v1, at, ac, tTurn, wavg: (w0 + w) / 2 };
  },
  dvs(mode){ const l = [
    { id: 'th', name: 'Angle turned Δθ', short: 'Δθ', sym: 'Δθ', unit: 'rad', f: d => d.th },
    { id: 'revs', name: 'Revolutions', short: 'rev', sym: 'rev', unit: '', f: d => d.revs },
    { id: 'w', name: 'Final angular velocity', short: 'ω', sym: 'ω', unit: 'rad/s', f: d => d.w },
    { id: 'v1', name: 'Rim speed v = rω (at the end)', short: 'v', sym: 'v', unit: 'm/s', f: d => d.v1 },
    { id: 'ac', name: 'Centripetal accel. of the rim rω²', short: 'a_c', sym: 'a<sub>c</sub>', unit: 'm/s²', f: d => d.ac }];
    if (mode === 'stop') l.unshift({ id: 'al', name: 'Angular acceleration', short: 'α', sym: 'α', unit: 'rad/s²', f: d => d.al });
    return l; },
  work(v, d, mode){
    let h = '<h4>1 · Same equations as Unit 2, with rotational letters</h4><div class="eq">x → θ, v → ω, a → α: &nbsp; ω = ω<sub>0</sub> + αt, &nbsp; Δθ = ω<sub>0</sub>t + ½αt², &nbsp; ω² = ω<sub>0</sub>² + 2αΔθ</div>';
    if (mode === 'stop') h += '<h4>2 · Convert rpm to rad/s</h4><div class="eq">ω<sub>0</sub> = ' + H.iv('rpm') + ' × 2π/60 = <b>' + H.n(d.w0, 'rad/s') + '</b></div>' +
      '<h4>3 · Angular acceleration (it ends at ω = 0)</h4><div class="eq">α = (0 − ω<sub>0</sub>)/t = −' + H.n(d.w0) + ' / ' + H.iv('tS') + ' = <b>' + H.n(d.al, 'rad/s²') + '</b></div>' +
      '<h4>4 · How far it turns while stopping</h4><div class="eq">Δθ = ω<sub>avg</sub>t = ½(' + H.n(d.w0) + ' + 0)(' + H.iv('tS') + ') = <b>' + H.n(d.th, 'rad') + '</b> = ' + H.n(d.th) + '/2π = <b>' + H.n(d.revs, 'rev') + '</b></div>' +
      '<p class="note">Area under the ω–t graph = angle turned, just like area under v–t = displacement.</p>';
    else {
      h += '<h4>2 · After ' + H.iv('t') + '</h4><div class="eq">ω = ' + H.iv('w0') + ' + (' + H.iv('al') + ')(' + H.iv('t') + ') = <b>' + H.n(d.w, 'rad/s') + '</b></div>' +
        '<div class="eq">Δθ = (' + H.n(d.w0) + ')(' + H.n(d.T) + ') + ½(' + H.n(d.al) + ')(' + H.n(d.T) + ')² = <b>' + H.n(d.th, 'rad') + '</b> = ' + H.n(d.revs, 'rev') + '</div>';
      if (isFinite(d.tTurn) && d.tTurn < d.T) h += '<p class="note">It stopped at t = ' + H.n(d.tTurn, 's') + ' and then spun the other way; Δθ is the net angle.</p>';
    }
    h += '<h4>' + (mode === 'stop' ? '5' : '3') + ' · A point on the rim (r = ' + H.iv('R') + ')</h4><div class="eq">Speed v = rω = <b>' + H.n(d.v1, 'm/s') + '</b> &nbsp; tangential a<sub>t</sub> = rα = ' + H.n(d.at, 'm/s²') + ' &nbsp; centripetal a<sub>c</sub> = rω² = ' + H.n(d.ac, 'm/s²') + '</div>' +
      '<p class="note">Every point on the wheel has the same ω and α, but points farther out move faster: v = rω. Radians make these work; degrees and revs don’t.</p>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const T = d.T, tt = Math.min(A.t % (T + 1.5), T), ang = d.w0 * tt + 0.5 * d.al * tt * tt, wn = d.w0 + d.al * tt;
    panelTitle(mode === 'spin' ? 'WHEEL (counterclockwise +)' : 'COASTING TO A STOP', 10, 18);
    const cx = 170, cy = 165, Rp = 60 + v.R * 70;
    ctx.fillStyle = '#eee'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, 7); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 2; for (let k = 0; k < 6; k++){ const a = -ang + k * PI / 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Rp * Math.cos(a), cy + Rp * Math.sin(a)); ctx.stroke(); }
    const px = cx + Rp * Math.cos(-ang), py = cy + Rp * Math.sin(-ang); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(px, py, 7, 0, 7); ctx.fill();
    // vectors at the dot: tangent (ccw) direction is (−sin, −cos) in screen coords for angle −ang
    const tx = -Math.sin(ang), ty = -Math.cos(ang), rx = cx - px, ry = cy - py, rl = Math.hypot(rx, ry);
    const vv = v.R * wn; if (Math.abs(vv) > 0.05) arrow(px, py, px + tx * vv * 12, py + ty * vv * 12, COL.V, 'v', { w: 2.5, head: 7 });
    const acn = v.R * wn * wn; if (acn > 0.05) arrow(px, py, px + rx / rl * Math.min(acn * 4, 60), py + ry / rl * Math.min(acn * 4, 60), '#c43a00', 'a_c', { w: 2.5, head: 7 });
    text('ω = ' + fplain(wn) + ' rad/s   θ = ' + fplain(ang) + ' rad (' + fplain(ang / (2 * PI)) + ' rev)', 12, 300, { font: '700 12px "IBM Plex Mono",monospace' });
    text('t = ' + fplain(tt) + ' s', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // ω–t graph with area
    panelTitle('ω vs t (area = angle turned)', 395, 18);
    const gx = 420, gy0 = 250, gw = 165, gh = 200, wmax = Math.max(Math.abs(d.w0), Math.abs(d.w), 1) * 1.1, lo = Math.min(0, d.w0, d.w) < 0 ? -wmax : 0;
    const X = q => gx + gw * q / T, Y = w => gy0 - gh * (w - lo) / (wmax - lo);
    ctx.fillStyle = 'rgba(255,106,43,0.2)'; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); for (let k = 0; k <= 60; k++){ const q = tt * k / 60; ctx.lineTo(X(q), Y(d.w0 + d.al * q)); } ctx.lineTo(X(tt), Y(0)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
    if (lo < 0){ ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(gx, Y(0)); ctx.lineTo(gx + gw, Y(0)); ctx.stroke(); }
    ctx.strokeStyle = COL.V; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X(0), Y(d.w0)); ctx.lineTo(X(T), Y(d.w)); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(tt), Y(wn), 4, 0, 7); ctx.fill();
    text(fplain(wmax), gx - 3, gy0 - gh + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('t → ' + fplain(T) + ' s', gx + gw, gy0 + 13, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('slope = α = ' + fplain(d.al) + ' rad/s²', 395, 300, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
