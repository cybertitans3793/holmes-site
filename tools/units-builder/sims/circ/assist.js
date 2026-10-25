// Gravity Assist: a spacecraft swings around a moving planet and leaves faster (the "slingshot").
const SIM = {
  title: 'Gravity Assist',
  hint: 'planet: Jupiter-sized',
  opts: [{ id: 'frame', label: 'Watch from', choices: [['sun', 'The Sun'], ['planet', 'The planet']] }],
  ivs(){ return [
    { id: 'v', sym: 'v', symText: 'v', label: 'Spacecraft speed in', unit: 'km/s', min: 2, max: 30, step: 0.5, val: 10 },
    { id: 'U', sym: 'U', symText: 'U', label: 'Planet’s orbital speed', unit: 'km/s', min: 0, max: 30, step: 0.5, val: 13, graph: true },
    { id: 'turn', sym: 'δ', symText: 'δ', label: 'How far gravity turns it', unit: '°', min: 0, max: 180, step: 1, val: 150, show: v => v.toFixed(0) + '°' },
    { id: 'm', sym: 'm', symText: 'm', label: 'Spacecraft mass', unit: 'kg', min: 200, max: 5000, step: 50, val: 800 }]; },
  presets: [{ label: 'Jupiter (13 km/s)', v: { U: 13 } }, { label: 'Earth (30 km/s)', v: { U: 29.8 } }, { label: 'Full U-turn', v: { turn: 180 } }, { label: 'Planet standing still', v: { U: 0 } }],
  calc(v){
    // planet moves in +x at U; craft comes in head-on, moving in −x at v (Sun frame)
    const U = v.U, vin = [-v.v, 0], rel = [vin[0] - U, 0], s = Math.hypot(...rel), d = v.turn * DEG;
    // in the planet frame the speed is unchanged; the direction turns by δ (swinging around behind the planet)
    const relOut = [-s * Math.cos(d), s * Math.sin(d)], out = [relOut[0] + U, relOut[1]], vout = Math.hypot(...out);
    const dK = 0.5 * v.m * ((vout * 1000) ** 2 - (v.v * 1000) ** 2), dPlanet = v.m * Math.hypot(out[0] - vin[0], out[1] - vin[1]) * 1000 / 1.9e27;
    return { U, s, relOut, out, vout, gain: vout - v.v, dK, dPlanet, max: v.v + 2 * U };
  },
  dvs(){ return [
    { id: 'vout', name: 'Spacecraft speed out (Sun frame)', short: 'v_out', sym: 'v<sub>out</sub>', unit: 'km/s', f: d => d.vout },
    { id: 'gain', name: 'Speed gained', short: 'gain', sym: 'gain', unit: 'km/s', f: d => d.gain },
    { id: 's', name: 'Speed relative to the planet', short: 'v_rel', sym: 'v<sub>rel</sub>', unit: 'km/s', f: d => d.s }]; },
  work(v, d){
    return '<h4>1 · Ride along with the planet (planet frame)</h4><div class="eq">Coming in head-on, the craft’s speed relative to the planet is v + U = ' + H.iv('v') + ' + ' + H.iv('U') + ' = <b>' + H.n(d.s, 'km/s') + '</b></div>' +
      '<h4>2 · In the planet’s frame, gravity only turns the craft</h4><div class="eq">It swings around and leaves at the <b>same speed</b>, ' + H.n(d.s, 'km/s') + ', turned by ' + H.iv('turn') + '. Like a perfectly elastic bounce off the planet.</div>' +
      '<h4>3 · Switch back to the Sun’s frame: add the planet’s velocity</h4><div class="eq">v<sub>out</sub> = v<sub>rel,out</sub> + U = (' + H.n(d.relOut[0]) + ' + ' + H.n(d.U) + ', ' + H.n(d.relOut[1]) + ') km/s → |v<sub>out</sub>| = <b>' + H.n(d.vout, 'km/s') + '</b></div>' +
      '<div class="eq">' + (d.gain >= 0 ? 'Gained ' : 'Lost ') + '<b>' + H.n(Math.abs(d.gain), 'km/s') + '</b>. A full U-turn gives the most: v + 2U = ' + H.n(d.max, 'km/s') + '.</div>' +
      '<p class="note">Same idea as a tennis ball bouncing off the front of a moving train: it comes back faster than it was thrown.</p>' +
      '<h4>4 · Where does the energy come from?</h4><div class="eq">The craft gains ΔK = ' + H.n(d.dK, 'J') + '. The planet loses exactly that much. Momentum is conserved, so the planet (Jupiter, 1.9×10<sup>27</sup> kg) slows by about ' + H.n(d.dPlanet, 'm/s') + ': far too little to ever measure.</div>' +
      '<p class="note">Voyager, Cassini and New Horizons all used this. In movies it’s usually called a slingshot.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const sunView = opt.frame === 'sun';
    panelTitle(sunView ? 'SEEN FROM THE SUN (planet moves →)' : 'SEEN FROM THE PLANET (planet stays put)', 10, 18);
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt; const cyc = 5, tt = (A.t % cyc) - cyc / 2; // closest approach at tt = 0
    const sc = 8, Rarc = 34, cx0 = 200, cy0 = 170;
    // planet-frame path: come in along −x below the planet, swing around, leave turned by δ
    const s = d.s * sc / 6, dlt = v.turn * DEG;
    function relPos(time){
      const arcLen = Rarc * dlt, tArc = arcLen / Math.max(s, 1e-6);
      if (time < -tArc / 2){ const q = (-tArc / 2 - time) * s; return [q, Rarc]; } // incoming: moving left, at y = +Rarc (below on screen)
      if (time > tArc / 2){ const q = (time - tArc / 2) * s; const a = PI / 2 + dlt; const ex = Rarc * Math.cos(a), ey = Rarc * Math.sin(a); return [ex - q * Math.cos(dlt), ey - q * Math.sin(dlt)]; }
      const a = PI / 2 + dlt * (time + tArc / 2) / tArc; return [Rarc * Math.cos(a), Rarc * Math.sin(a)];
    }
    const planetX = t2 => sunView ? cx0 + v.U * sc / 6 * t2 : cx0;
    // trail
    ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.beginPath();
    for (let k = -cyc / 2; k <= tt; k += 0.02){ const p = relPos(k); const X = planetX(k) + p[0], Y = cy0 + p[1]; k === -cyc / 2 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); } ctx.stroke();
    const px = planetX(tt); ctx.fillStyle = '#c98a3c'; ctx.beginPath(); ctx.arc(px, cy0, 22, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.stroke();
    if (sunView) arrow(px, cy0 - 30, px + 20 + v.U * 1.5, cy0 - 30, '#c98a3c', 'U', { w: 2.5 });
    const p = relPos(tt), X = px + p[0], Y = cy0 + p[1]; ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X, Y, 4, 0, 7); ctx.fill();
    text(sunView ? 'in: ' + fplain(v.v) + ' km/s   out: ' + fplain(d.vout) + ' km/s' : 'in and out: ' + fplain(d.s) + ' km/s (same speed)', 12, 300, { font: '700 13px "IBM Plex Mono",monospace' });
    text('not to scale', 12, 318, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    // velocity diagram
    panelTitle('VELOCITY ADDITION (km/s)', 390, 18);
    const k = 150 / Math.max(Math.abs(d.out[0]), d.s, v.v, 1), ox = 430, oy = 150;
    arrow(ox, oy, ox + d.relOut[0] * k, oy - d.relOut[1] * k, '#7a3fb0', 'v_rel,out', { w: 2.5, lx: -4, ly: -8, align: 'right' });
    arrow(ox + d.relOut[0] * k, oy - d.relOut[1] * k, ox + d.out[0] * k, oy - d.out[1] * k, '#c98a3c', '+U', { w: 2.5, lx: 0, ly: -10, align: 'center' });
    arrow(ox, oy, ox + d.out[0] * k, oy - d.out[1] * k, '#111', 'v_out', { w: 3.5, lx: 0, ly: 18, align: 'center' });
    arrow(ox, oy + 90, ox - v.v * k, oy + 90, '#1546d6', 'v_in', { w: 2.5, lx: 0, ly: 12, align: 'center' });
  }
};
