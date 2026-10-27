// Rutherford Scattering (IB E.1; SL qualitative, HL closest approach and nuclear radius): alpha particles fired at a nucleus — the nuclear model vs the plum-pudding model, scattering angle vs aim, distance of closest approach from energy conservation, and where the strong force takes over.
const KE2 = 1.44; // e²/(4πε₀) in MeV·fm
const TGT = { au: ['Gold', 79, 197], al: ['Aluminium', 13, 27] };
function traj(b, d0, n){ // dimensionless: units of d0, speed 1 at infinity, a = 0.5/r²
  const L = Math.max(12, 220 / d0); let x = -L, y = b / d0, vx = 1, vy = 0; const pts = [[x, y]]; let rmin = 1e9;
  for (let i = 0; i < n; i++){ const r = Math.hypot(x, y), h = Math.min(0.05 * L / 12, 0.02 * r); const a = 0.5 / (r * r * r); vx += a * x * h; vy += a * y * h; x += vx * h; y += vy * h; rmin = Math.min(rmin, r); if (i % 3 === 0) pts.push([x, y]); if (i > 50 && (x > L || x < -L - 0.5 || Math.abs(y) > L)) break; }
  return { pts, rmin: rmin * d0, ang: Math.atan2(vy, vx) / DEG };
}
const SIM = {
  title: 'Rutherford Scattering',
  hint: 'closest approach: K = kqQ/d',
  modes: [{ id: 'nuc', label: 'Nuclear model' }, { id: 'pud', label: 'Plum-pudding model' }],
  opts: [{ id: 'tg', label: 'Target', choices: [['au', 'Gold foil'], ['al', 'Aluminium foil']] }],
  ivs(){ return [
    { id: 'b', sym: 'b', symText: 'b', label: 'How far off-centre it is aimed (impact parameter)', unit: 'fm', min: 0, max: 150, step: 1, val: 30, graph: true },
    { id: 'K', sym: 'K', symText: 'K', label: 'Alpha particle kinetic energy', unit: 'MeV', min: 1, max: 40, step: 0.5, val: 5 }]; },
  presets: [{ label: 'Head-on', v: { b: 0 } }, { label: 'Near miss', v: { b: 20 } }, { label: 'Far away', v: { b: 140 } }, { label: 'Very high energy', v: { b: 0, K: 35 } }],
  calc(v, mode, opt){
    const [nm, Z, A] = TGT[opt.tg || 'au'], d0 = KE2 * 2 * Z / v.K, R = 1.2 * Math.cbrt(A), touch = R + 1.2 * Math.cbrt(4), theta = mode === 'pud' ? 0.01 : 2 * Math.atan(d0 / (2 * Math.max(v.b, 1e-6))) / DEG;
    const rmin = v.b === 0 ? d0 : (d0 / 2) * (1 + Math.sqrt(1 + Math.pow(2 * v.b / d0, 2)));
    return { nm, Z, A, d0, R, touch, theta, rmin, strong: rmin < touch, Kmax: KE2 * 2 * Z / touch };
  },
  dvs(){ return [{ id: 'th', name: 'Scattering angle', short: 'θ', sym: 'θ', unit: '°', f: d => d.theta }, { id: 'rmin', name: 'Closest approach', short: 'r_min', sym: 'r<sub>min</sub>', unit: 'fm', f: d => d.rmin }, { id: 'd0', name: 'Closest approach head-on', short: 'd', sym: 'd', unit: 'fm', f: d => d.d0 }]; },
  work(v, d, mode){
    if (mode === 'pud') return '<h4>Thomson’s plum-pudding model</h4><div class="eq">Positive charge spread thinly through the whole atom, with electrons dotted in it. The electric field is weak everywhere, so every alpha particle should go almost straight through (deflection well under 1°).</div>' +
      '<div class="bad">Geiger and Marsden saw about 1 in 8000 alphas bounce back by more than 90°. Rutherford: “as if you fired a 15-inch shell at a piece of tissue paper and it came back and hit you.”</div><p class="note">Switch to the nuclear model to see what fits the data.</p>';
    return '<h4>1 · What the experiment showed</h4><div class="eq">Most alphas go straight through (the atom is mostly empty space). A few deflect a lot, and a very few bounce back: all the positive charge and almost all the mass is in a tiny nucleus.</div>' +
      '<h4>2 · Head-on: distance of closest approach (IB HL)</h4><div class="eq">All the kinetic energy becomes electric potential energy: K = k(2e)(' + d.Z + 'e)/d → d = (1.44 MeV·fm)(2)(' + d.Z + ')/' + H.iv('K') + ' = <b>' + H.n(d.d0, 'fm') + '</b> (1 fm = 10⁻¹⁵ m)</div>' +
      '<h4>3 · Off-centre aim</h4><div class="eq">Aimed ' + H.iv('b') + ' off-centre: scattered through θ = <b>' + H.n(d.theta, '°') + '</b>; closest approach ' + H.n(d.rmin, 'fm') + '. Closer aim → bigger deflection.</div>' +
      '<h4>4 · How big is the nucleus? (IB HL)</h4><div class="eq">R = R₀A<sup>⅓</sup> = 1.2 fm × ' + d.A + '<sup>⅓</sup> = ' + H.n(d.R, 'fm') + '. The alpha touches it at about ' + H.n(d.touch, 'fm') + '.</div>' +
      (d.strong ? '<div class="bad">The alpha reaches the nucleus: the strong force acts and the results no longer match Rutherford’s formula. This happens above about ' + fnum(d.Kmax) + ' MeV for ' + d.nm.toLowerCase() + ' — that is how the nuclear radius was first estimated.</div>' : '<p class="note">Here only the electric force acts, so the closest approach is an upper limit for the nuclear radius. Lighter targets (aluminium) have smaller charge, so fast alphas reach their nuclei more easily.</p>');
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle(mode === 'pud' ? 'PLUM-PUDDING ATOM' : 'ALPHAS PAST A ' + d.nm.toUpperCase() + ' NUCLEUS (fm)', 10, 18);
    const cx = 200, cy = 165, sc = 1.25; // px per fm
    ctx.save(); ctx.beginPath(); ctx.rect(12, 26, 374, 296); ctx.clip();
    if (mode === 'pud'){ ctx.fillStyle = 'rgba(255,160,140,0.35)'; ctx.beginPath(); ctx.arc(cx, cy, 120, 0, 7); ctx.fill(); for (let i = 0; i < 30; i++){ const a = i * 2.4, r = 110 * Math.sqrt((i + 0.5) / 30); ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 3, 0, 7); ctx.fill(); }
      for (let k = -6; k <= 6; k++){ const y = cy + k * 22; ctx.strokeStyle = k * 22 === Math.round((v.b * sc) / 22) * 22 ? '#c43a00' : 'rgba(196,58,0,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(12, y); ctx.lineTo(386, y + k * 0.15); ctx.stroke(); } ctx.restore(); }
    else {
      const key = v.K + ',' + (opt.tg || 'au'); if (A.key !== key){ A.key = key; A.fan = []; for (let b = -150; b <= 150; b += 12) A.fan.push(traj(b === 0 ? 0.0001 : b, d.d0, 4000)); }
      A.fan.forEach(tr => { ctx.strokeStyle = 'rgba(196,58,0,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); tr.pts.forEach(([x, y], i) => { const px = cx + x * d.d0 * sc, py = cy - y * d.d0 * sc; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke(); });
      const me = traj(Math.max(v.b, 0.0001), d.d0, 6000); ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.5; ctx.beginPath(); me.pts.forEach(([x, y], i) => { const px = cx + x * d.d0 * sc, py = cy - y * d.d0 * sc; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke();
      ctx.fillStyle = '#7a3fb0'; ctx.beginPath(); ctx.arc(cx, cy, Math.max(3, d.R * sc), 0, 7); ctx.fill(); ctx.strokeStyle = '#7a3fb0'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, d.rmin * sc, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      text('dashed circle: closest approach ' + fplain(d.rmin) + ' fm', 12, 316, { font: '600 10px "IBM Plex Mono",monospace', col: '#7a3fb0' });
    }
    panelTitle('SCATTERING ANGLE vs AIM', 395, 18);
    const gx = 405, gy = 220, gw = 180, gh = 170; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 150; i++){ const b = i, th = mode === 'pud' ? 0.3 : 2 * Math.atan(d.d0 / (2 * Math.max(b, 0.01))) / DEG; i ? ctx.lineTo(gx + gw * b / 150, gy - gh * th / 180) : ctx.moveTo(gx, gy - gh * th / 180); } ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(gx + gw * v.b / 150, gy - gh * d.theta / 180, 5, 0, 7); ctx.fill();
    text('180°', gx - 4, gy - gh + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace' }); text('b (fm) →', gx + gw, gy + 14, { align: 'right', font: '500 9px "IBM Plex Mono",monospace' });
    text('θ = ' + fplain(d.theta) + '°', 400, 262, { font: '700 14px "Space Grotesk",sans-serif' }); text('head-on d = ' + fplain(d.d0) + ' fm', 400, 284, { font: '600 11px "IBM Plex Mono",monospace' });
  }
};
