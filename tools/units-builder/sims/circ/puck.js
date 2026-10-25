// Puck in Space: no friction, so the puck keeps its velocity until a kick changes it (Newton's 1st law).
const SIM = {
  title: 'Puck in Space',
  modes: [{ id: 'line', label: 'Kick along the line' }, { id: 'side', label: 'Kick sideways' }],
  ivs(mode){
    if (mode === 'line') return [
      { id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Velocity before the kick', unit: 'm/s', min: -5, max: 5, step: 0.5, val: 3 },
      { id: 'dv', sym: 'Δv', symText: 'Δv', label: 'Change from the kick', unit: 'm/s', min: -8, max: 8, step: 0.5, val: -5, graph: true },
      { id: 'tk', sym: 't<sub>k</sub>', symText: 'tk', label: 'Time of the kick', unit: 's', min: 1, max: 6, step: 0.5, val: 3 }];
    return [
      { id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Speed before (→)', unit: 'm/s', min: 0, max: 6, step: 0.5, val: 3 },
      { id: 'dvy', sym: 'Δv<sub>y</sub>', symText: 'Δvy', label: 'Sideways kick (↑)', unit: 'm/s', min: 0, max: 6, step: 0.5, val: 3, graph: true },
      { id: 'tk', sym: 't<sub>k</sub>', symText: 'tk', label: 'Time of the kick', unit: 's', min: 1, max: 5, step: 0.5, val: 2 }];
  },
  presets: [{ label: 'Stop it dead', mode: 'line', v: { v0: 3, dv: -3 } }, { label: 'Reverse it', mode: 'line', v: { v0: 3, dv: -6 } }, { label: 'Kick at 90°', mode: 'side', v: { v0: 3, dvy: 3 } }],
  calc(v, mode){
    const Tt = 8;
    if (mode === 'line'){ const v1 = v.v0 + v.dv, pos = s => s < v.tk ? v.v0 * s : v.v0 * v.tk + v1 * (s - v.tk), xEnd = pos(Tt);
      return { Tt, v1, pos, xEnd, xk: v.v0 * v.tk, avg: xEnd / Tt, flip: v1 * v.v0 < 0, stop: v1 === 0 }; }
    const sp = Math.hypot(v.v0, v.dvy), ang = Math.atan2(v.dvy, v.v0) / DEG;
    const pos = s => s < v.tk ? [v.v0 * s, 0] : [v.v0 * s, v.dvy * (s - v.tk)];
    return { Tt, sp, ang, pos, end: pos(Tt) };
  },
  dvs(mode){
    if (mode === 'line') return [
      { id: 'v1', name: 'Velocity after the kick', short: 'v1', sym: 'v<sub>1</sub>', unit: 'm/s', f: d => d.v1 },
      { id: 'xEnd', name: 'Position at t = 8 s', short: 'x', sym: 'x(8 s)', unit: 'm', f: d => d.xEnd },
      { id: 'avg', name: 'Average velocity over 8 s', short: 'v_avg', sym: 'v<sub>avg</sub>', unit: 'm/s', f: d => d.avg }];
    return [
      { id: 'sp', name: 'Speed after the kick', short: 'speed', sym: '|v<sub>1</sub>|', unit: 'm/s', f: d => d.sp },
      { id: 'ang', name: 'Direction after the kick (from →)', short: 'θ', sym: 'θ', unit: '°', f: d => d.ang }];
  },
  work(v, d, mode){
    if (mode === 'line'){
      let h = '<h4>1 · Before the kick: no net force</h4><div class="eq">No friction, no push, so ΣF = 0 and the velocity stays ' + H.iv('v0') + ' (Newton’s 1st law). Equal spacing between the dots = constant velocity.</div>' +
        '<div class="eq">At the kick: x = v<sub>0</sub>t<sub>k</sub> = (' + H.iv('v0') + ')(' + H.iv('tk') + ') = ' + H.n(d.xk, 'm') + '</div>' +
        '<h4>2 · The kick: a brief force changes the velocity</h4><div class="eq">v<sub>1</sub> = v<sub>0</sub> + Δv = ' + H.iv('v0') + ' + ' + H.p(v.dv, 'm/s') + ' = <b>' + H.n(d.v1, 'm/s') + '</b></div>' +
        (d.stop ? '<div class="eq">It stops dead and <b>stays</b> stopped: nothing else pushes it.</div>' : d.flip ? '<div class="eq">The sign flipped: the puck now moves the other way.</div>' : '') +
        '<h4>3 · After the kick: no net force again</h4><div class="eq">The new velocity stays ' + H.n(d.v1, 'm/s') + ' until something else pushes it. It does <b>not</b> slowly “use up” the kick.</div>' +
        '<div class="eq">x(8 s) = ' + H.n(d.xk) + ' + (' + H.n(d.v1) + ')(8 − ' + H.iv('tk') + ') = <b>' + H.n(d.xEnd, 'm') + '</b></div>' +
        '<h4>4 · Read the graphs</h4><div class="eq">v–t: two flat steps (a force acted only at the jump). x–t: two straight lines; the slope changes at the kick.</div>';
      return h;
    }
    return '<h4>1 · Before the kick</h4><div class="eq">ΣF = 0, so the puck slides → at a steady ' + H.iv('v0') + '.</div>' +
      '<h4>2 · The kick only changes the ↑ part of the velocity</h4><div class="eq">After: v<sub>x</sub> = ' + H.iv('v0') + ' (unchanged: the kick had no → part) and v<sub>y</sub> = ' + H.iv('dvy') + '</div>' +
      '<h4>3 · Add them</h4><div class="eq">speed = √(v<sub>x</sub>² + v<sub>y</sub>²) = √((' + H.n(v.v0) + ')² + (' + H.n(v.dvy) + ')²) = <b>' + H.n(d.sp, 'm/s') + '</b> at θ = tan<sup>−1</sup>(v<sub>y</sub>/v<sub>x</sub>) = <b>' + H.n(d.ang, '°') + '</b></div>' +
      '<h4>4 · After the kick: a straight line, not a curve</h4><div class="eq">No force acts after the kick, so the new path is straight at constant speed. The puck does <b>not</b> go straight ↑ (the direction it was kicked): it keeps its → motion too.</div>' +
      '<p class="note">Classic test question: a spaceship coasting → fires its engine ↑ briefly. Which path does it follow afterward?</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const hold = 1.5, cyc = d.Tt + hold, tt = Math.min(A.t % cyc, d.Tt);
    const dotCol = '#bdbdbd', puck = (x, y) => { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(x - 2, y - 2, 3, 0, 7); ctx.fill(); };
    if (mode === 'line'){
      panelTitle('FRICTIONLESS TRACK (dots every 0.5 s)', 10, 18);
      const xs = []; for (let s = 0; s <= d.Tt; s += 0.25) xs.push(d.pos(s)); const lo = Math.min(...xs, 0) - 1, hi = Math.max(...xs, 0) + 1, X = x => 30 + 540 * (x - lo) / (hi - lo);
      ctx.fillStyle = '#e8f3ff'; ctx.fillRect(15, 40, 570, 60); ctx.strokeStyle = '#9ac'; ctx.lineWidth = 1; ctx.strokeRect(15, 40, 570, 60);
      for (let m = Math.ceil(lo); m <= hi; m++){ if (hi - lo > 30 && m % 5) continue; ctx.fillStyle = '#9ac'; ctx.fillRect(X(m), 92, 1, 8); if (m % (hi - lo > 30 ? 10 : 2) === 0) text(m + '', X(m), 112, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
      for (let s = 0; s <= tt + 1e-9; s += 0.5){ ctx.fillStyle = s < v.tk ? '#ffb38f' : '#9db4f0'; ctx.beginPath(); ctx.arc(X(d.pos(s)), 70, 4, 0, 7); ctx.fill(); }
      if (tt >= v.tk){ ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2; const kx = X(d.xk); for (let k = 0; k < 6; k++){ const a = k * PI / 3; ctx.beginPath(); ctx.moveTo(kx + 14 * Math.cos(a), 70 + 14 * Math.sin(a)); ctx.lineTo(kx + 20 * Math.cos(a), 70 + 20 * Math.sin(a)); ctx.stroke(); } text('kick', kx, 34, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#c43a00' }); }
      const vnow = tt < v.tk ? v.v0 : d.v1; puck(X(d.pos(tt)), 70); if (vnow) arrow(X(d.pos(tt)), 56, X(d.pos(tt)) + vnow * 12, 56, COL.V, '', { w: 2.5, head: 7 });
      // v–t and x–t
      const graph = (gx, title, f, lo2, hi2) => { const gy = 300, gw = 240, gh = 130; panelTitle(title, gx - 20, 140);
        const Y = q => gy - gh * (q - lo2) / (hi2 - lo2), Tx = s => gx + gw * s / d.Tt;
        ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
        if (lo2 < 0){ ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, Y(0)); ctx.lineTo(gx + gw, Y(0)); ctx.stroke(); }
        ctx.strokeStyle = COL.V; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= 200; k++){ const s = tt * k / 200; k ? ctx.lineTo(Tx(s), Y(f(s))) : ctx.moveTo(Tx(s), Y(f(s))); } ctx.stroke();
        text(fplain(hi2), gx - 4, gy - gh + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(lo2), gx - 4, gy + 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
        text('t (s) → 8', gx + gw, gy + 13, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); };
      const vlo = Math.min(0, v.v0, d.v1) - 1, vhi = Math.max(0, v.v0, d.v1) + 1;
      graph(50, 'VELOCITY vs TIME (m/s)', s => s < v.tk ? v.v0 : d.v1, vlo, vhi);
      graph(340, 'POSITION vs TIME (m)', d.pos, lo, hi);
      return;
    }
    panelTitle('TOP VIEW: FRICTIONLESS ICE (dots every 0.5 s)', 10, 18);
    const sc = 300 / Math.max(d.end[0] + 1, d.end[1] + 1, 6), X = x => 30 + x * sc, Y = y => 290 - y * sc;
    ctx.fillStyle = '#e8f3ff'; ctx.fillRect(15, 30, 365, 275);
    for (let s = 0; s <= tt + 1e-9; s += 0.5){ const p = d.pos(s); ctx.fillStyle = s < v.tk ? '#ffb38f' : '#9db4f0'; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 4, 0, 7); ctx.fill(); }
    const pk = d.pos(v.tk); if (tt >= v.tk){ arrow(X(pk[0]), Y(pk[1]) + 30, X(pk[0]), Y(pk[1]) + 6, '#c43a00', 'kick ↑', { w: 3, lx: 6, ly: 10 }); ctx.setLineDash([4, 4]); ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(pk[0]), Y(pk[1])); ctx.lineTo(X(d.end[0]), Y(pk[1])); ctx.stroke(); ctx.setLineDash([]);
      text('without the kick', X(d.end[0]) - 2, Y(pk[1]) + 14, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' }); }
    const p = d.pos(tt), vy = tt < v.tk ? 0 : v.dvy; puck(X(p[0]), Y(p[1])); arrow(X(p[0]), Y(p[1]), X(p[0]) + v.v0 * 12, Y(p[1]) - vy * 12, COL.V, 'v', { w: 2.5, head: 7 });
    // velocity addition
    panelTitle('VELOCITY BEFORE + KICK = AFTER', 395, 18);
    const ox = 420, oy = 230, k = 140 / Math.max(d.sp, 1);
    arrow(ox, oy, ox + v.v0 * k, oy, '#ff6a2b', 'before', { w: 3, lx: 0, ly: 14, align: 'center' });
    arrow(ox + v.v0 * k, oy, ox + v.v0 * k, oy - v.dvy * k, '#c43a00', 'kick', { w: 3, lx: 6, ly: 0 });
    arrow(ox, oy, ox + v.v0 * k, oy - v.dvy * k, COL.V, 'after', { w: 3.5, lx: -8, ly: -6, align: 'right' });
    text(fplain(d.sp) + ' m/s at ' + fplain(d.ang) + '°', 395, 300, { font: '700 13px "Space Grotesk",sans-serif' });
  }
};
