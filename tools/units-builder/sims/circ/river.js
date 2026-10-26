// River Crossing: relative velocity. A boat in a current, and a plane in a crosswind.
const SIM = {
  title: 'River Crossing',
  modes: [{ id: 'boat', label: 'Boat in a current' }, { id: 'plane', label: 'Plane in a crosswind' }],
  ivs(mode){
    const b = mode === 'boat';
    return [
      { id: 'vb', sym: b ? 'v<sub>b</sub>' : 'v<sub>a</sub>', symText: b ? 'vb' : 'va', label: b ? 'Boat speed (relative to the water)' : 'Airspeed (relative to the air)', unit: b ? 'm/s' : 'km/h', min: b ? 1 : 100, max: b ? 10 : 900, step: b ? 0.1 : 10, val: b ? 4 : 500 },
      { id: 'vc', sym: b ? 'v<sub>c</sub>' : 'v<sub>w</sub>', symText: b ? 'vc' : 'vw', label: b ? 'Current (→)' : 'Wind from the west (→)', unit: b ? 'm/s' : 'km/h', min: 0, max: b ? 8 : 200, step: b ? 0.1 : 5, val: b ? 3 : 100, graph: true },
      { id: 'phi', sym: 'φ', symText: 'φ', label: b ? 'Aim upstream of straight across' : 'Heading west of north', unit: '°', min: -60, max: 80, step: 1, val: 0, show: x => x.toFixed(0) + '°' },
      { id: 'W', sym: b ? 'w' : 'D', symText: b ? 'w' : 'D', label: b ? 'River width' : 'Distance to fly north', unit: b ? 'm' : 'km', min: b ? 20 : 100, max: b ? 200 : 2000, step: b ? 1 : 10, val: b ? 60 : 1000 }];
  },
  presets: [{ label: 'Aim straight across', v: { phi: 0 } }, { label: 'Land straight across', mode: 'boat', v: { vb: 4, vc: 2, phi: 30 } }, { label: 'Current too fast', mode: 'boat', v: { vb: 3, vc: 5, phi: 30 } }],
  calc(v, mode){
    const p = v.phi * DEG, ax = -v.vb * Math.sin(p), ay = v.vb * Math.cos(p), gx0 = v.vc + ax, gx = Math.abs(gx0) < 1e-9 ? 0 : gx0, gy = ay, sp = Math.hypot(gx, gy);
    const ok = gy > 0, T = ok ? v.W / gy : NaN, drift = ok ? gx * T : NaN, phiStraight = v.vc < v.vb ? Math.asin(v.vc / v.vb) / DEG : NaN;
    const tMin = v.W / v.vb, dir = Math.atan2(gx, gy) / DEG;
    return { ax, ay, gx, gy, sp, ok, T, drift, phiStraight, tMin, dir, hours: mode === 'plane' };
  },
  dvs(mode){ const b = mode === 'boat'; return [
    { id: 'drift', name: b ? 'Drift downstream when it lands' : 'Drift east when it arrives', short: 'drift', sym: 'drift', unit: b ? 'm' : 'km', f: d => d.drift },
    { id: 'T', name: b ? 'Time to cross' : 'Flight time', short: 't', sym: 't', unit: b ? 's' : 'h', f: d => d.T },
    { id: 'sp', name: 'Speed relative to the ground', short: 'v_g', sym: 'v<sub>ground</sub>', unit: b ? 'm/s' : 'km/h', f: d => d.sp }]; },
  work(v, d, mode){
    const b = mode === 'boat', u = b ? 'm/s' : 'km/h', vbS = b ? 'v<sub>b</sub>' : 'v<sub>a</sub>', vcS = b ? 'v<sub>c</sub>' : 'v<sub>w</sub>', across = b ? 'across' : 'north', down = b ? 'downstream' : 'east';
    let h = '<h4>1 · Velocities add as vectors</h4><div class="eq">v<sub>ground</sub> = v<sub>' + (b ? 'boat rel. water' : 'plane rel. air') + '</sub> + v<sub>' + (b ? 'water rel. ground' : 'air rel. ground') + '</sub></div>' +
      '<h4>2 · Components (' + across + ' and ' + down + ')</h4><div class="eq">' + across[0].toUpperCase() + across.slice(1) + ': ' + vbS + 'cosφ = (' + H.iv('vb') + ')cos ' + H.iv('phi') + ' = ' + H.n(d.ay, u) + '</div>' +
      '<div class="eq">' + down[0].toUpperCase() + down.slice(1) + ': ' + vcS + ' − ' + vbS + 'sinφ = ' + H.iv('vc') + ' − (' + H.iv('vb') + ')sin ' + H.iv('phi') + ' = ' + H.n(d.gx, u) + '</div>' +
      '<div class="eq">Ground speed √(' + H.n(d.ay) + '² + ' + H.n(d.gx) + '²) = <b>' + H.n(d.sp, u) + '</b></div>';
    if (!d.ok) return h + '<div class="bad">Aimed this far ' + (b ? 'upstream' : 'west') + ', there’s no ' + across + ' component left: it never gets ' + (b ? 'across' : 'there') + '.</div>';
    h += '<h4>3 · Only the ' + across + ' part gets you ' + (b ? 'across' : 'there') + '</h4><div class="eq">t = ' + (b ? 'w' : 'D') + ' / v<sub>' + across + '</sub> = ' + H.iv('W') + ' / ' + H.n(d.ay, u) + ' = <b>' + H.n(d.T, b ? 's' : 'h') + '</b></div>' +
      '<div class="eq">Meanwhile it drifts ' + down + ': ' + H.n(d.gx) + ' × ' + H.n(d.T) + ' = <b>' + H.n(d.drift, b ? 'm' : 'km') + '</b></div>' +
      '<h4>4 · Two different “best” aims</h4><div class="eq"><b>Fastest crossing:</b> aim straight ' + across + ' (φ = 0): t = ' + (b ? 'w' : 'D') + '/' + vbS + ' = ' + H.n(d.tMin, b ? 's' : 'h') + '. The ' + (b ? 'current' : 'wind') + ' doesn’t change the time, only where you land.</div>' +
      (isFinite(d.phiStraight) ? '<div class="eq"><b>No drift:</b> aim so ' + vbS + 'sinφ cancels ' + vcS + ': sinφ = ' + vcS + '/' + vbS + ' → φ = <b>' + H.n(d.phiStraight, '°') + '</b> (slower, but lands straight ' + (b ? 'across' : 'north') + ')</div>'
        : '<div class="bad">The ' + (b ? 'current' : 'wind') + ' is faster than ' + (b ? 'the boat' : 'the plane') + ': no aim can cancel the drift.</div>');
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const b = mode === 'boat';
    panelTitle(b ? 'TOP VIEW: RIVER (current →)' : 'MAP VIEW (wind →, north ↑)', 10, 18);
    const yB = 290, yT = 50, W = v.W, maxDrift = d.ok ? Math.abs(d.drift) : 0, sc = Math.min((yB - yT) / W, 340 / Math.max(maxDrift, 1) * 0.9), x0 = d.ok && d.drift < 0 ? 330 : 50;
    const X = x => x0 + x * sc, Y = y => yB - y * sc;
    if (b){ ctx.fillStyle = '#4a7a3a'; ctx.fillRect(0, yB, 380, 30); ctx.fillRect(0, 26, 380, Y(W) - 26); ctx.fillStyle = '#cfe6ff'; ctx.fillRect(0, Y(W), 380, yB - Y(W));
      for (let k = 0; k < 10; k++){ const yy = Y(W) + (k + 0.5) * (yB - Y(W)) / 10, xx = ((A.t * v.vc * 18 + k * 53) % 420) - 20; ctx.strokeStyle = '#8fb6e6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + 16, yy); ctx.stroke(); } }
    else { ctx.fillStyle = '#eef3e6'; ctx.fillRect(0, 26, 380, 294); ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(X(0), Y(W), 6, 0, 7); ctx.fill(); text('destination', X(0) + 8, Y(W) + 4, { font: '600 10px "IBM Plex Mono",monospace', col: '#c43a00' });
      for (let k = 0; k < 8; k++){ const yy = 40 + k * 34, xx = ((A.t * v.vc * 0.6 + k * 61) % 420) - 20; ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + 20, yy); ctx.lineTo(xx + 15, yy - 3); ctx.stroke(); } }
    // target straight across
    ctx.setLineDash([4, 4]); ctx.strokeStyle = '#888'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(0), Y(W)); ctx.stroke(); ctx.setLineDash([]);
    if (!d.ok){ text('never gets ' + (b ? 'across' : 'there'), 190, 160, { align: 'center', font: '700 14px "Space Grotesk",sans-serif', col: '#c43a00' }); }
    else {
      const T = d.T, play = 4, tt = Math.min((A.t % (play + 1.2)) / play, 1) * T, px = X(d.gx * tt), py = Y(d.gy * tt);
      ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(px, py); ctx.stroke();
      ctx.save(); ctx.translate(px, py); ctx.rotate(-v.phi * DEG); ctx.fillStyle = b ? '#ff6a2b' : '#1546d6'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
      ctx.beginPath(); if (b){ ctx.moveTo(0, -12); ctx.lineTo(6, 2); ctx.lineTo(6, 10); ctx.lineTo(-6, 10); ctx.lineTo(-6, 2); } else { ctx.moveTo(0, -12); ctx.lineTo(3, 0); ctx.lineTo(14, 4); ctx.lineTo(3, 4); ctx.lineTo(2, 10); ctx.lineTo(-2, 10); ctx.lineTo(-3, 4); ctx.lineTo(-14, 4); ctx.lineTo(-3, 0); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      if (tt >= T) text('drift ' + fplain(d.drift) + (b ? ' m' : ' km'), px + 8, py + 18, { font: '700 11px "Space Grotesk",sans-serif', col: '#c43a00' });
    }
    // vector triangle
    panelTitle('VELOCITY TRIANGLE (' + (b ? 'm/s' : 'km/h') + ')', 395, 18);
    const ox = 470, oy = 250, k = 150 / Math.max(v.vb + v.vc, d.sp, 1);
    arrow(ox, oy, ox + d.ax * k, oy - d.ay * k, '#ff6a2b', b ? 'boat rel. water' : 'airspeed', { w: 3, lx: -4, ly: -8, align: 'right' });
    arrow(ox + d.ax * k, oy - d.ay * k, ox + d.gx * k, oy - d.gy * k, '#8fb6e6', b ? 'current' : 'wind', { w: 3, lx: 4, ly: -8 });
    arrow(ox, oy, ox + d.gx * k, oy - d.gy * k, '#111', 'ground', { w: 3.5, lx: 6, ly: 12 });
    text('ground speed ' + fplain(d.sp) + (b ? ' m/s' : ' km/h'), 395, 300, { font: '700 12px "Space Grotesk",sans-serif' });
    if (d.ok) text((b ? 'crossing time ' : 'flight time ') + fplain(d.T) + (b ? ' s' : ' h'), 395, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
