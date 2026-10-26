// Pendulum: T = 2π√(L/g) for small swings, the large-angle correction, forces and speed at the bottom, other planets and elevators, and the T² vs L lab.
const PLACES = { earth: ['Earth', 10], moon: ['Moon', 1.6], mars: ['Mars', 3.7], up: ['Elevator, a = 2 m/s² up', 12], down: ['Elevator, a = 2 m/s² down', 8] };
function agm(a, b){ for (let i = 0; i < 20; i++){ const a2 = (a + b) / 2; b = Math.sqrt(a * b); a = a2; } return a; }
const SIM = {
  title: 'Pendulum',
  modes: [{ id: 'swing', label: 'Swing' }, { id: 'lab', label: 'Lab: T² vs L' }],
  opts: [{ id: 'place', label: 'Where', choices: Object.entries(PLACES).map(([k, p]) => [k, p[0].replace(', a = 2 m/s²', '')]) }],
  ivs(mode){
    if (mode === 'lab') return [{ id: 'L', sym: 'L', symText: 'L', label: 'Length', unit: 'm', min: 0.1, max: 2, step: 0.05, val: 1, graph: true }];
    return [
      { id: 'L', sym: 'L', symText: 'L', label: 'Length', unit: 'm', min: 0.1, max: 3, step: 0.05, val: 1, graph: true },
      { id: 'th', sym: 'θ<sub>0</sub>', symText: 'θ0', label: 'Release angle', unit: '°', min: 2, max: 80, step: 1, val: 10, show: x => x.toFixed(0) + '°' },
      { id: 'm', sym: 'm', symText: 'm', label: 'Bob mass', unit: 'kg', min: 0.1, max: 5, step: 0.1, val: 0.5 }];
  },
  presets: [{ label: 'Small swing', mode: 'swing', v: { th: 5 } }, { label: 'Big swing', mode: 'swing', v: { th: 70 } }, { label: '4× the length', mode: 'swing', v: { L: 2.4 } }],
  calc(v, mode, opt){
    const pl = PLACES[opt.place || 'earth'], g = pl[1], T0 = 2 * PI * Math.sqrt(v.L / g);
    if (mode === 'lab') return { g, pl, T0, T2: T0 * T0, slope: 4 * PI * PI / g };
    const th = v.th * DEG, k = Math.sin(th / 2), T = 2 * PI * Math.sqrt(v.L / g) / agm(1, Math.sqrt(1 - k * k)), vmax = Math.sqrt(2 * g * v.L * (1 - Math.cos(th))), Tb = v.m * g + v.m * vmax * vmax / v.L, Te = v.m * g * Math.cos(th);
    return { g, pl, T0, T, err: 100 * (T - T0) / T0, vmax, Tb, Te, W: v.m * g, h: v.L * (1 - Math.cos(th)) };
  },
  dvs(mode){
    if (mode === 'lab') return [{ id: 'T2', name: 'Period squared T²', short: 'T²', sym: 'T²', unit: 's²', f: d => d.T2 }, { id: 'T0', name: 'Period', short: 'T', sym: 'T', unit: 's', f: d => d.T0 }];
    return [{ id: 'T0', name: 'Period (small-angle formula)', short: 'T', sym: 'T', unit: 's', f: d => d.T0 }, { id: 'T', name: 'Period (exact, any angle)', short: 'T_exact', sym: 'T<sub>exact</sub>', unit: 's', f: d => d.T },
      { id: 'vmax', name: 'Speed at the bottom', short: 'v_max', sym: 'v<sub>max</sub>', unit: 'm/s', f: d => d.vmax }, { id: 'Tb', name: 'String tension at the bottom', short: 'T_str', sym: 'F<sub>T,bottom</sub>', unit: 'N', f: d => d.Tb, vs: 'W' }, { id: 'W', name: 'Weight', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W }];
  },
  work(v, d, mode, opt){
    const gS = H.n(d.g, 'm/s²') + ' (' + d.pl[0] + ')';
    if (mode === 'lab') return '<h4>1 · Square the period formula</h4><div class="eq">T = 2π√(L/g) → <b>T² = (4π²/g)·L</b>: a straight line through the origin if you graph T² against L</div>' +
      '<h4>2 · The slope gives g</h4><div class="eq">slope = 4π²/g = ' + H.n(d.slope, 's²/m') + ' → g = 4π²/slope = ' + gS + '</div>' +
      '<div class="eq">At L = ' + H.iv('L') + ': T = ' + H.n(d.T0, 's') + ', T² = ' + H.n(d.T2, 's²') + '</div>' +
      '<p class="note">Lab tips: time 10 or 20 swings and divide (reaction time matters less), keep the angle small, and measure L to the center of the bob.</p>' +
      '<p class="note">Why T² and not T? Graphing T vs L gives a curve; T² vs L gives a line, and a line’s slope is easy to read.</p>';
    let h = '<h4>1 · Restoring force: the part of gravity along the arc, mg sinθ ≈ mgθ for small angles</h4><div class="eq">That makes it (nearly) simple harmonic: T = 2π√(L/g) = 2π√(' + H.iv('L') + ' / ' + H.n(d.g) + ') = <b>' + H.n(d.T0, 's') + '</b>, g = ' + gS + '</div>' +
      '<p class="note">Not in the formula: the mass (heavier bob, more force, but more inertia too) and the amplitude (for small swings).</p>' +
      '<h4>2 · How good is “small angle”?</h4><div class="eq">At ' + H.iv('th') + ' the true period is ' + H.n(d.T, 's') + ', ' + H.n(d.err, '%') + ' longer' + (d.err < 1 ? ': close enough.' : ': the formula starts to fail.') + '</div>' +
      '<h4>3 · Speed at the bottom (energy)</h4><div class="eq">mgh = ½mv² with h = L(1 − cosθ<sub>0</sub>) = ' + H.n(d.h, 'm') + ' → v = √(2gh) = <b>' + H.n(d.vmax, 'm/s') + '</b></div>' +
      '<h4>4 · String tension</h4><div class="eq">Bottom (moving in a circle): F<sub>T</sub> − mg = mv²/L → F<sub>T</sub> = ' + H.n(d.W) + ' + ' + H.n(d.Tb - d.W) + ' = <b>' + H.n(d.Tb, 'N') + '</b> (more than mg)</div>' +
      '<div class="eq">At the ends (v = 0): F<sub>T</sub> = mg cosθ<sub>0</sub> = ' + H.n(d.Te, 'N') + ' (less than mg)</div>';
    if (opt.place === 'up' || opt.place === 'down') h += '<p class="note">In an accelerating elevator the pendulum acts as if g were g ± a: up → faster swings, down → slower.</p>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'lab'){
      panelTitle('T² vs L (' + d.pl[0].toUpperCase() + ')', 10, 18);
      const gx = 60, gy0 = 290, gw = 300, gh = 240, Tm = 4 * PI * PI * 2 / d.g * 1.1, X = L => gx + gw * L / 2, Y = q => gy0 - gh * q / Tm;
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
      ctx.strokeStyle = COL.V; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(2), Y(d.slope * 2)); ctx.stroke();
      const rnd = i => Math.sin(i * 12.9898) * 0.03;   // fixed, small "measurement" scatter
      for (let i = 1; i <= 8; i++){ const L = 0.25 * i, q = d.slope * L * (1 + rnd(i)); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(X(L), Y(q), 4, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(v.L), Y(d.T2), 6, 0, 7); ctx.fill();
      text('T² (s²)', gx - 4, gy0 - gh - 6, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('L (m) → 2', gx + gw, gy0 + 14, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text(fplain(Tm), gx - 4, gy0 - gh + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('RESULT', 395, 18); text('slope = ' + fplain(d.slope) + ' s²/m', 400, 60, { font: '700 11px "IBM Plex Mono",monospace' }); text('g = 4π²/slope = ' + fplain(d.g) + ' m/s²', 400, 84, { font: '700 11px "IBM Plex Mono",monospace' });
      return;
    }
    if (A.th === undefined || A.reset){ A.th = v.th * DEG; A.om = 0; A.t = 0; }
    for (let k = 0; k < 20; k++){ const h = dt / 20; A.om += -(d.g / v.L) * Math.sin(A.th) * h; A.th += A.om * h; }
    panelTitle('PENDULUM (' + d.pl[0] + ')', 10, 18);
    const px = 190, py = 40, Lp = Math.min(230, 60 + v.L * 70), bx = px + Lp * Math.sin(A.th), by = py + Lp * Math.cos(A.th);
    ctx.fillStyle = '#111'; ctx.fillRect(px - 50, py - 6, 100, 6);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + Lp + 10); ctx.stroke(); ctx.beginPath(); ctx.arc(px, py, Lp, PI / 2 - v.th * DEG, PI / 2 + v.th * DEG); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
    const r = 8 + 5 * Math.cbrt(v.m); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.stroke();
    const sp = A.om * v.L; if (Math.abs(sp) > 0.02) arrow(bx, by, bx + Math.cos(A.th) * sp * 25, by - Math.sin(A.th) * sp * 25, COL.V, 'v', { w: 2.5, head: 6 });
    text('T = ' + fplain(d.T0) + ' s (exact ' + fplain(d.T) + ' s)', 12, 300, { font: '700 13px "Space Grotesk",sans-serif' });
    text('θ = ' + fplain(A.th / DEG) + '°', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    panelTitle('PERIOD vs RELEASE ANGLE', 395, 18);
    const gx = 420, gy0 = 250, gw = 165, gh = 190, Tm = d.T0 * 1.35, X = a => gx + gw * a / 80, Y = q => gy0 - gh * (q - d.T0 * 0.9) / (Tm - d.T0 * 0.9);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#888'; ctx.beginPath(); ctx.moveTo(gx, Y(d.T0)); ctx.lineTo(gx + gw, Y(d.T0)); ctx.stroke(); ctx.setLineDash([]); text('2π√(L/g)', gx + gw, Y(d.T0) + 12, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#888' });
    ctx.strokeStyle = COL.V; ctx.lineWidth = 2.5; ctx.beginPath(); for (let a = 1; a <= 80; a++){ const kk = Math.sin(a * DEG / 2), T = d.T0 / agm(1, Math.sqrt(1 - kk * kk)); a > 1 ? ctx.lineTo(X(a), Y(T)) : ctx.moveTo(X(a), Y(T)); } ctx.stroke();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(v.th), Y(d.T), 4, 0, 7); ctx.fill();
    text('0°', gx, gy0 + 13, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('80°', gx + gw, gy0 + 13, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
