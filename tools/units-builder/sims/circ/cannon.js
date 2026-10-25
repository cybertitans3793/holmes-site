// Newton's Mountain: a cannon on a very tall mountain fires sideways. Faster and faster until it orbits.
const GM = 6.67e-11 * 5.97e24, RE = 6.37e6;
function flyPath(v0, h){
  const r0 = RE + h; let x = 0, y = r0, vx = v0, vy = 0, t = 0;
  const E = 0.5 * v0 * v0 - GM / r0, a = E < 0 ? -GM / (2 * E) : Infinity, Tb = isFinite(a) ? 2 * PI * Math.sqrt(a * a * a / GM) : Infinity;
  const tMax = isFinite(Tb) ? Math.min(1.02 * Tb, 2e5) : 6e4, dt = Math.max(2, Math.min(isFinite(Tb) ? Tb / 3000 : 30, 30));
  const pts = [[x, y, 0]]; let outcome = 'orbit', rmax = r0, ang = 0;
  const acc = (x, y) => { const r = Math.hypot(x, y), k = -GM / (r * r * r); return [k * x, k * y]; };
  let [ax, ay] = acc(x, y);
  while (t < tMax){
    vx += 0.5 * dt * ax; vy += 0.5 * dt * ay; x += dt * vx; y += dt * vy; [ax, ay] = acc(x, y); vx += 0.5 * dt * ax; vy += 0.5 * dt * ay; t += dt;
    const r = Math.hypot(x, y); rmax = Math.max(rmax, r);
    if (pts.length < 4000 && (pts.length < 2 || Math.hypot(x - pts[pts.length - 1][0], y - pts[pts.length - 1][1]) > 4e4)) pts.push([x, y, t]);
    if (r < RE){ outcome = 'lands'; ang = Math.atan2(x, y); if (ang < 0) ang += 2 * PI; pts.push([x, y, t]); break; }
    if (r > 12 * RE){ outcome = 'escape'; pts.push([x, y, t]); break; }
  }
  return { pts, outcome, rmax, t, ang, Tb };
}
const SIM = {
  title: 'Newton’s Mountain',
  hint: 'G = 6.67×10⁻¹¹, M_Earth = 5.97×10²⁴ kg',
  ivs(){ return [
    { id: 'v', sym: 'v', symText: 'v', label: 'Launch speed', unit: 'km/s', min: 0.5, max: 12, step: 0.05, val: 5, graph: true },
    { id: 'h', sym: 'h', symText: 'h', label: 'Mountain height', unit: 'km', min: 100, max: 3000, step: 10, val: 500 }]; },
  presets: [{ label: '2 km/s', v: { v: 2 } }, { label: '6 km/s', v: { v: 6 } }, { label: 'Circular orbit', v: { v: 7.61 } }, { label: '9 km/s', v: { v: 9 } }, { label: 'Escape', v: { v: 11 } }],
  calc(v){
    const h = v.h * 1000, r = RE + h, v0 = v.v * 1000, vc = Math.sqrt(GM / r), ve = Math.SQRT2 * vc, g = GM / (r * r);
    const f = flyPath(v0, h), dist = f.outcome === 'lands' ? f.ang * RE / 1000 : NaN;
    const kind = f.outcome === 'lands' ? 'lands' : f.outcome === 'escape' || v0 >= ve * 0.999 ? 'escape' : Math.abs(v0 - vc) < 0.01 * vc ? 'circle' : 'ellipse';
    return { r, h, v0, vc, ve, g, f, dist, kind, flat: v0 * Math.sqrt(2 * h / g) / 1000, Tmin: f.Tb / 60, tFlight: f.t / 60, top: (f.rmax - RE) / 1000 };
  },
  dvs(){ return [
    { id: 'dist', name: 'Distance around Earth before landing', short: 'distance', sym: 'distance', unit: 'km', f: d => d.dist },
    { id: 'Tmin', name: 'Orbit period (if it orbits)', short: 'period', sym: 'period', unit: 'min', f: d => d.kind === 'lands' || d.kind === 'escape' ? NaN : d.Tmin },
    { id: 'top', name: 'Highest altitude reached', short: 'max altitude', sym: 'max altitude', unit: 'km', f: d => d.kind === 'escape' ? NaN : d.top },
    { id: 'vc', name: 'Speed for a circular orbit', short: 'v_circ', sym: 'v<sub>circ</sub>', unit: 'm/s', f: d => d.vc }]; },
  work(v, d){
    const verdict = { lands: '<div class="bad">Too slow: it falls back to Earth after ' + H.n(d.dist, 'km') + ' around the surface (' + H.n(d.tFlight, 'min') + ' of flight).</div>',
      circle: '<div class="ok">Circular orbit: it falls around Earth forever, always at the same height.</div>',
      ellipse: '<div class="ok">Between v<sub>circ</sub> and v<sub>esc</sub>: an elliptical orbit. It swings out to ' + H.n(d.top, 'km') + ' and comes back to the mountain every ' + H.n(d.Tmin, 'min') + '.</div>',
      escape: '<div class="bad">At or above escape speed: it never comes back.</div>' }[d.kind];
    return '<h4>1 · Distance from Earth’s center</h4><div class="eq">r = R<sub>E</sub> + h = 6.37×10<sup>6</sup> m + (' + H.iv('h') + ') = ' + H.n(d.r, 'm') + '</div>' +
      '<h4>2 · Gravity up there</h4><div class="eq">g = GM/r² = <b>' + H.n(d.g, 'm/s²') + '</b> (not zero, and it points at Earth’s center)</div>' +
      '<h4>3 · Speed for a circular orbit: gravity supplies exactly mv²/r</h4><div class="eq">GMm/r² = mv²/r → v<sub>circ</sub> = √(GM/r) = <b>' + H.n(d.vc, 'm/s') + '</b></div>' +
      '<h4>4 · Escape speed</h4><div class="eq">v<sub>esc</sub> = √(2GM/r) = √2 × v<sub>circ</sub> = ' + H.n(d.ve, 'm/s') + '</div>' +
      '<h4>5 · This launch: v = ' + H.iv('v') + '</h4>' + verdict +
      '<p class="note">Every launch is a projectile falling toward the center. Faster ones travel far enough sideways that Earth curves away under them as fast as they fall. ' +
      (d.kind === 'lands' ? 'If Earth were flat with g = ' + H.n(d.g, 'm/s²') + ' everywhere, it would land only ' + H.n(d.flat, 'km') + ' away.' : '') + '</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle('NEWTON’S MOUNTAIN (not to scale: mountain is huge)', 10, 18);
    const cx = 300, cy = 172, view = Math.max(1.35 * RE, Math.min(d.f.rmax, 12 * RE) * 1.08), s = 150 / view, Rp = RE * s;
    // Earth
    const grd = ctx.createRadialGradient(cx - Rp * 0.3, cy - Rp * 0.3, Rp * 0.1, cx, cy, Rp); grd.addColorStop(0, '#9fd59a'); grd.addColorStop(1, '#2e7d32');
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, 7); ctx.fill();
    // mountain
    ctx.fillStyle = '#8d6e63'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - Rp * 0.18, cy - Rp * 0.983); ctx.lineTo(cx, cy - d.r * s); ctx.lineTo(cx + Rp * 0.18, cy - Rp * 0.983); ctx.closePath(); ctx.fill(); ctx.stroke();
    // keep a few earlier paths for comparison
    A.trails = A.trails || []; const key = v.v.toFixed(2) + '|' + v.h;
    if (A.key !== key){ if (A.key && A.lastPts) { A.trails.push(A.lastPts); if (A.trails.length > 4) A.trails.shift(); } A.key = key; A.lastPts = d.f.pts; A.t = 0; }
    A.trails.forEach((pts, i) => { ctx.strokeStyle = 'rgba(17,17,17,' + (0.12 + 0.05 * i) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); pts.forEach((p, j) => j ? ctx.lineTo(cx + p[0] * s, cy - p[1] * s) : ctx.moveTo(cx + p[0] * s, cy - p[1] * s)); ctx.stroke(); });
    const pts = d.f.pts; ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach((p, j) => j ? ctx.lineTo(cx + p[0] * s, cy - p[1] * s) : ctx.moveTo(cx + p[0] * s, cy - p[1] * s)); ctx.stroke();
    // cannonball animation: whole flight in about 4 s
    A.t = (A.t || 0) + dt; const T = pts[pts.length - 1][2], tt = ((A.t % 5) / 4) * T;
    let k = 0; while (k < pts.length - 1 && pts[k + 1][2] < tt) k++;
    const p = pts[Math.min(k, pts.length - 1)]; ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx + p[0] * s, cy - p[1] * s, 4.5, 0, 7); ctx.fill();
    text({ lands: 'falls back to Earth', circle: 'circular orbit', ellipse: 'elliptical orbit', escape: 'escapes' }[d.kind], 12, 300, { font: '700 14px "Space Grotesk",sans-serif', col: d.kind === 'lands' || d.kind === 'escape' ? '#c43a00' : '#1e7d45' });
    text('v_circ = ' + fplain(d.vc / 1000) + ' km/s   v_esc = ' + fplain(d.ve / 1000) + ' km/s', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('grey = earlier launches', 588, 318, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
  }
};
