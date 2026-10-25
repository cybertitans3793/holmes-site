// Orbits & Gravity: Newton's law of gravitation and circular orbits.
const GC = 6.67e-11, ME = 5.97e24, RE = 6.37e6;
const SIM = {
  title: 'Orbits & Gravity',
  hint: 'G = 6.67×10⁻¹¹ N·m²/kg²',
  ivs(){ return [
    { id: 'h', sym: 'h', symText: 'h', label: 'Altitude above surface', unit: 'km', min: 100, max: 40000, step: 10, val: 420, graph: true },
    { id: 'M', sym: 'M', symText: 'M', label: 'Planet mass (× Earth)', unit: 'M⊕', min: 0.01, max: 10, step: 0.01, val: 1, show: v => (v < 0.1 ? v.toFixed(3) : v.toFixed(2)) + ' M⊕' },
    { id: 'R', sym: 'R', symText: 'R', label: 'Planet radius (× Earth)', unit: 'R⊕', min: 0.25, max: 3, step: 0.01, val: 1, show: v => v.toFixed(2) + ' R⊕' },
    { id: 'm', sym: 'm', symText: 'm', label: 'Satellite mass', unit: 'kg', min: 100, max: 10000, step: 50, val: 1000 }]; },
  presets: [
    { label: 'ISS', v: { h: 420, M: 1, R: 1 } }, { label: 'GPS', v: { h: 20200, M: 1, R: 1 } }, { label: 'Geostationary', v: { h: 35790, M: 1, R: 1 } },
    { label: 'Low Moon orbit', v: { h: 100, M: 0.0123, R: 0.27 } }, { label: 'Low Mars orbit', v: { h: 400, M: 0.11, R: 0.53 } }],
  calc(v){
    const M = v.M * ME, R = v.R * RE, r = R + v.h * 1000, F = GC * M * v.m / (r * r), gr = GC * M / (r * r), gs = GC * M / (R * R);
    const sp = Math.sqrt(GC * M / r), P = 2 * PI * r / sp;
    return { M, R, r, F, gr, gs, pct: 100 * gr / gs, sp, P, Pmin: P / 60, Ph: P / 3600, K: P * P / (r * r * r), Wsurf: v.m * gs };
  },
  dvs(){ return [
    { id: 'F', name: 'Gravity force on satellite', short: 'F_g', sym: 'F<sub>g</sub>', unit: 'N', f: d => d.F },
    { id: 'gr', name: 'g at the satellite', short: 'g', sym: 'g', unit: 'm/s²', f: d => d.gr },
    { id: 'sp', name: 'Orbital speed v', short: 'v', sym: 'v', unit: 'm/s', f: d => d.sp },
    { id: 'Pmin', name: 'Period (minutes)', short: 'period', sym: 'period', unit: 'min', f: d => d.Pmin },
    { id: 'K', name: 'T²/r³ (Kepler’s 3rd law)', short: 'T²/r³', sym: 'T²/r³', unit: 's²/m³', f: d => d.K },
    { id: 'gs', name: 'g at the planet’s surface', short: 'g_surface', sym: 'g<sub>surface</sub>', unit: 'm/s²', f: d => d.gs }]; },
  work(v, d){
    return '<h4>1 · Distance from the planet’s <i>center</i></h4><div class="eq">r = R + h = ' + H.n(d.R, 'm') + ' + (' + H.iv('h') + ' = ' + H.n(v.h * 1000, 'm') + ') = <b>' + H.n(d.r, 'm') + '</b></div>' +
      '<h4>2 · Gravity force (Newton’s law)</h4><div class="eq">F<sub>g</sub> = GMm/r² = (6.67×10<sup>−11</sup>)(' + H.n(d.M, 'kg') + ')(' + H.iv('m') + ') / (' + H.n(d.r, 'm') + ')² = <b>' + H.n(d.F, 'N') + '</b></div>' +
      '<h4>3 · Gravitational field out here</h4><div class="eq">g = F<sub>g</sub>/m = GM/r² = <b>' + H.n(d.gr, 'm/s²') + '</b> vs. ' + H.n(d.gs, 'm/s²') + ' at the surface (' + H.n(d.pct) + '%)</div>' +
      '<p class="note">Gravity hasn’t switched off. Astronauts feel weightless because they and the station are both in free fall.</p>' +
      '<h4>4 · Gravity is the centripetal force</h4><div class="eq">GMm/r² = mv²/r → v = √(GM/r) = <b>' + H.n(d.sp, 'm/s') + '</b></div>' +
      '<p class="note">The satellite’s mass m cancels: a wrench and the station orbit together.</p>' +
      '<h4>5 · Period</h4><div class="eq">T = 2πr/v = <b>' + H.n(d.P, 's') + '</b> = ' + H.n(d.Pmin, 'min') + ' = ' + H.n(d.Ph, 'h') + '</div>' +
      '<h4>6 · Kepler’s 3rd law</h4><div class="eq">T²/r³ = 4π²/(GM) = <b>' + H.n(d.K, 's²/m³') + '</b></div>' +
      '<p class="note">Same value for every orbit around this planet. It only changes when M changes.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle('ORBIT (zoomed to fit)', 10, 18);
    const cx = 300, cy = 168, rp = 140, s = rp / d.r, Rp = Math.max(3, d.R * s);
    // planet
    const grd = ctx.createRadialGradient(cx - Rp * 0.3, cy - Rp * 0.3, Rp * 0.1, cx, cy, Rp); grd.addColorStop(0, '#8fb3ff'); grd.addColorStop(1, '#1546d6');
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, 7); ctx.fill();
    ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(cx, cy, rp, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    // display period: ISS-like ≈ 4 s; slower for higher orbits
    if (A.ph === undefined) A.ph = -PI / 2;
    const disp = Math.max(2, Math.min(40, d.Pmin / 92 * 4)); A.ph += 2 * PI / disp * dt;
    const sx = cx + rp * Math.cos(A.ph), sy = cy + rp * Math.sin(A.ph);
    ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(sx - 6, sy - 4, 12, 8); ctx.strokeRect(sx - 6, sy - 4, 12, 8);
    ctx.fillStyle = '#8a8a8a'; ctx.fillRect(sx - 16, sy - 2, 9, 4); ctx.fillRect(sx + 7, sy - 2, 9, 4);
    const ix = -Math.cos(A.ph), iy = -Math.sin(A.ph), tx = -Math.sin(A.ph), ty = Math.cos(A.ph);
    arrow(sx, sy, sx + ix * 50, sy + iy * 50, COL.F, 'F_g');
    arrow(sx, sy, sx + tx * 55, sy + ty * 55, COL.V, 'v');
    // r and h labels
    ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + rp, cy); ctx.stroke();
    text('r', cx + rp / 2, cy - 5, { font: '700 12px "Space Grotesk",sans-serif', col: '#4a4a4a', align: 'center' });
    text('R', cx - Rp / 2, cy + 13, { font: '700 11px "Space Grotesk",sans-serif', col: '#fff', align: 'center' });
    text('period ' + fplain(d.Pmin) + ' min (' + fplain(d.Ph) + ' h)', 12, 300, { font: '600 12px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('v = ' + fplain(d.sp) + ' m/s   g here = ' + fplain(d.gr) + ' m/s²', 12, 318, { font: '600 12px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('animation speed is not to scale', 588, 318, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a', align: 'right' });
  }
};
