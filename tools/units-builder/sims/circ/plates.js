// Charges Between Plates (AP 10.6.A.3, 10.7; IB D.2 E = V/d, D.3 motion in a uniform field): deflection like a projectile, accelerating through a potential difference (ΔK = qΔV), and Millikan's oil drop (IB).
const E0 = 1.6e-19, PART = { e: ['electron', -1, 9.11e-31], p: ['proton', 1, 1.67e-27], a: ['alpha particle', 2, 6.64e-27] };
const SIM = {
  title: 'Charges Between Plates',
  hint: 'e = 1.60×10⁻¹⁹ C · m<sub>e</sub> = 9.11×10⁻³¹ kg · m<sub>p</sub> = 1.67×10⁻²⁷ kg · g = 10 m/s²',
  modes: [{ id: 'deflect', label: 'Beam between plates' }, { id: 'accel', label: 'Accelerate from rest' }, { id: 'mill', label: 'Millikan oil drop (IB)' }],
  opts: [{ id: 'pt', label: 'Particle', modes: ['deflect', 'accel'], choices: [['e', 'Electron'], ['p', 'Proton'], ['a', 'Alpha']] }, { id: 'drop', label: 'Drop', modes: ['mill'], choices: [['A', 'A'], ['B', 'B'], ['C', 'C']] }],
  ivs(mode){
    if (mode === 'accel') return [{ id: 'V', sym: 'ΔV', symText: 'dV', label: 'Potential difference', unit: 'V', min: 1, max: 5000, step: 1, val: 1000, graph: true }, { id: 'd', sym: 'd', symText: 'd', label: 'Plate separation', unit: 'cm', min: 0.5, max: 10, step: 0.1, val: 2 }];
    if (mode === 'mill') return [{ id: 'V', sym: 'V', symText: 'V', label: 'Voltage across the plates', unit: 'V', min: 0, max: 2000, step: 1, val: 300, graph: true }, { id: 'r', sym: 'r', symText: 'r', label: 'Drop radius (from its fall speed)', unit: 'μm', min: 0.6, max: 1.6, step: 0.01, val: 1.0 }, { id: 'd', sym: 'd', symText: 'd', label: 'Plate separation', unit: 'cm', min: 0.5, max: 2, step: 0.1, val: 1 }];
    return [{ id: 'V', sym: 'ΔV', symText: 'dV', label: 'Voltage across the plates', unit: 'V', min: 0, max: 1000, step: 5, val: 100, graph: true },
      { id: 'd', sym: 'd', symText: 'd', label: 'Plate separation', unit: 'cm', min: 1, max: 10, step: 0.1, val: 2 },
      { id: 'L', sym: 'L', symText: 'L', label: 'Plate length', unit: 'cm', min: 2, max: 20, step: 0.5, val: 5 },
      { id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Entry speed', unit: '×10⁶ m/s', min: 1, max: 40, step: 0.5, val: 20 }];
  },
  presets: [{ label: 'Notes example (100 V, 2.0 cm, 2.0×10⁷ m/s)', mode: 'deflect', v: { V: 100, d: 2, L: 5, v0: 20 } }, { label: 'Double the voltage', mode: 'deflect', v: { V: 200 } }, { label: 'Double the speed', mode: 'deflect', v: { v0: 40 } }, { label: 'Balance drop A', mode: 'mill', v: { V: 471, r: 1.0, d: 1 } }],
  calc(v, mode, opt){
    if (mode === 'mill'){ const n = { A: 5, B: 3, C: 8 }[opt.drop || 'A'], q = n * E0, r = v.r * 1e-6, m = 900 * 4 / 3 * PI * r * r * r, W = m * 10, E = v.V / (v.d / 100), FE = q * E, net = FE - W, Vbal = W * (v.d / 100) / q, qCalc = v.V > 0 ? W * (v.d / 100) / v.V : NaN;
      return { n, m, W, E, FE, net, Vbal, qCalc, nCalc: qCalc / E0, bal: Math.abs(net) < 0.01 * W, vel: net / (6 * PI * 1.8e-5 * r) }; }
    const [nm, z, m] = PART[opt.pt || 'e'], q = z * E0, Q = Math.abs(q);
    if (mode === 'accel'){ const KJ = Q * v.V, vv = Math.sqrt(2 * KJ / m), E = v.V / (v.d / 100), a = Q * E / m, t = vv / a; return { nm, z, m, KJ, eV: Math.abs(z) * v.V, v: vv, E, a, t, frac: vv / 3e8 }; }
    const d = v.d / 100, L = v.L / 100, v0 = v.v0 * 1e6, E = v.V / d, a = Q * E / m, t = L / v0, y = 0.5 * a * t * t, vy = a * t, hit = y > d / 2, tHit = Math.sqrt(d / a), xHit = v0 * tHit;
    return { nm, z, m, E, a, t, y, vy, ang: Math.atan2(vy, v0) / DEG, hit, xHit, F: Q * E, Wg: m * 10 };
  },
  dvs(mode){
    if (mode === 'accel') return [{ id: 'v', name: 'Final speed', short: 'v', sym: 'v', unit: 'm/s', f: d => d.v }, { id: 'KJ', name: 'Kinetic energy gained', short: 'K', sym: 'K', unit: 'J', f: d => d.KJ }];
    if (mode === 'mill') return [{ id: 'net', name: 'Net force on the drop (+ = up)', short: 'F_net', sym: 'F<sub>net</sub>', unit: 'N', f: d => d.net }, { id: 'nCalc', name: 'Charge ÷ e if you assume it is balanced', short: 'q/e', sym: 'q/e', unit: '', f: d => d.nCalc }];
    return [{ id: 'y', name: 'Sideways deflection at the end of the plates', short: 'y', sym: 'y', unit: 'm', f: d => d.hit ? NaN : d.y }, { id: 'a', name: 'Acceleration', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a }, { id: 'ang', name: 'Exit angle', short: 'θ', sym: 'θ', unit: '°', f: d => d.hit ? NaN : d.ang }];
  },
  work(v, d, mode, opt){
    if (mode === 'mill') return '<h4>1 · Weight of the drop</h4>' + TEX`m = \rho\,\frac{4}{3}\pi r^3` + TEX`m = (900)\,\frac{4}{3}\pi\,(${M.n(v.r * 1e-6, 'm')})^3` + TEX`m = ${M.n(d.m, 'kg')}` + TEX`mg = (${M.n(d.m)})(10)` + TEXA`mg = ${M.n(d.W, 'N')}` +
      '<h4>2 · Electric force upward: F = qE = qV/d</h4>' + TEX`E = \frac{V}{d}` + TEX`E = \frac{${M.iv('V')}}{${M.n(v.d / 100, 'm')}}` + TEXA`E = ${M.n(d.E, 'V/m')}` +
      TEX`F_{\text{net}} = qE - mg` + TEXA`F_{\text{net}} = ${M.n(d.net, 'N')}` + '<p class="st">' + (d.bal ? '<b>Balanced: it hangs still.</b>' : d.net > 0 ? 'Drifts up.' : 'Falls.') + '</p>' +
      '<h4>3 · At balance: qV/d = mg → q = mgd/V</h4>' + (v.V > 0 ? '<p class="st">If balanced at this V:</p>' + TEX`q = \frac{mg\,d}{V}` + TEX`q = \frac{(${M.n(d.W)})(${M.n(v.d / 100)})}{${M.iv('V')}}` + TEX`q = ${M.n(d.qCalc, 'C')}` + TEXA`\frac{q}{e} = ${M.n(d.nCalc)}` : '<p class="st">With no voltage there is no electric force, so nothing can balance the weight.</p>') +
      (d.bal ? '<p class="st">A whole number: drop ' + (opt.drop || 'A') + ' carries ' + Math.round(d.nCalc) + ' extra electrons. Millikan found every drop’s charge was a multiple of 1.6×10⁻¹⁹ C: <b>charge is quantized</b>.</p>' : '<p class="note">Adjust V until the drop stops. Then the value above is its charge.</p>') +
      '<p class="note">Upper plate positive pulls a negatively charged drop up. Find the charge on drops A, B and C: what do they have in common?</p>';
    if (mode === 'accel') return '<h4>1 · Work done by the field = gain in kinetic energy</h4>' + TEX`\Delta K = |q|\,\Delta V` + TEX`\Delta K = (${'<mn>' + Math.abs(d.z) + '</mn>'} \times 1.6\times10^{-19})(${M.iv('V')})` + TEXA`\Delta K = ${M.n(d.KJ, 'J')}` +
      '<h4>2 · Final speed (from rest)</h4>' + TEX`v = \sqrt{\frac{2K}{m}}` + TEX`v = \sqrt{\frac{2 \times ${M.n(d.KJ)}}{${M.n(d.m)}}}` + TEXA`v = ${M.n(d.v, 'm/s')}` + '<p class="st">That is ' + H.n(100 * d.frac, '%') + ' of the speed of light.</p>' +
      '<h4>3 · The plate separation doesn’t change the final speed</h4>' + TEX`E = \frac{V}{d}` + TEXA`E = ${M.n(d.E, 'V/m')}` + TEX`a = \frac{|q|E}{m}` + TEXA`a = ${M.n(d.a, 'm/s²')}` + TEX`t = \frac{v}{a}` + TEXA`t = ${M.n(d.t, 's')}` +
      '<p class="st">Closer plates: bigger force over a shorter distance, same work qV.</p>' +
      '<p class="note">ΔK = |q|ΔV: an alpha (charge 2e) through the same ΔV gains twice the energy of an electron, but it is about 7300 times heavier, so it ends up much slower.</p>';
    return '<h4>1 · Uniform field between the plates: E = V/d</h4>' + TEX`E = \frac{V}{d}` + TEX`E = \frac{${M.iv('V')}}{${M.n(v.d / 100, 'm')}}` + TEXA`E = ${M.n(d.E, 'V/m')}` +
      TEX`F = qE` + TEXA`F = ${M.n(d.F, 'N')}` + '<p class="st">Gravity is ' + H.n(d.Wg, 'N') + ': ignore it.</p>' +
      '<h4>2 · Like a projectile: constant v<sub>x</sub>, constant a<sub>y</sub></h4>' + TEX`a = \frac{qE}{m}` + TEXA`a = ${M.n(d.a, 'm/s²')}` +
      TEX`t = \frac{L}{v_0}` + TEX`t = \frac{${M.n(v.L / 100, 'm')}}{${M.n(v.v0 * 1e6, 'm/s')}}` + TEXA`t = ${M.n(d.t, 's')}` +
      (d.hit ? '<div class="bad">½at² would be more than d/2: the ' + d.nm + ' hits the ' + (d.z < 0 ? 'positive' : 'negative') + ' plate after ' + H.n(d.xHit * 100, 'cm') + '.</div>' :
        TEX`y = \frac{1}{2}\,a\,t^2` + TEX`y = \frac{1}{2}(${M.n(d.a)})(${M.n(d.t)})^2` + TEXA`y = ${M.n(d.y * 100, 'cm')}` +
        TEX`v_y = a\,t` + TEX`v_y = (${M.n(d.a)})(${M.n(d.t)})` + TEXA`v_y = ${M.n(d.vy, 'm/s')}` +
        TEX`\theta = \tan^{-1}\left(\frac{v_y}{v_0}\right)` + TEXA`\theta = ${M.n(d.ang, '°')}`) +
      '<p class="note">After leaving the plates there’s no force, so it moves in a straight line (that’s how an old CRT aimed its beam). Path between the plates: a parabola, ' + (d.z < 0 ? 'bending toward the + plate.' : 'bending toward the − plate.') + '</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const plates = (x1, x2, yT, yB) => { ctx.fillStyle = '#c43a00'; ctx.fillRect(x1, yT - 8, x2 - x1, 8); ctx.fillStyle = '#1546d6'; ctx.fillRect(x1, yB, x2 - x1, 8); for (let x = x1 + 10; x < x2; x += 24){ text('+', x, yT - 12, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' }); text('−', x, yB + 22, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: '#1546d6' }); } for (let x = x1 + 22; x < x2; x += 44) arrow(x, yT + 4, x, yB - 4, 'rgba(122,63,176,0.35)', null, { w: 1.5, head: 6 }); };
    if (A.s === undefined || A.reset) A.s = 0; A.s = (A.s + dt / 2.2) % 1.3; const s = Math.min(1, A.s);
    if (mode === 'mill'){
      panelTitle('MILLIKAN’S OIL DROP', 10, 18);
      plates(60, 330, 70, 260); if (A.y === undefined || A.reset) A.y = 165; A.y -= Math.max(-60, Math.min(60, d.vel * 3e5)) * dt; if (A.y < 80) A.y = 250; if (A.y > 250) A.y = 80;
      ctx.fillStyle = '#d9a400'; ctx.beginPath(); ctx.arc(195, A.y, 7, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.stroke();
      const sc = 45 / Math.max(d.W, d.FE, 1e-30); arrow(215, A.y, 215, A.y - d.FE * sc, '#7a3fb0', 'qE', { w: 2.5 }); arrow(235, A.y, 235, A.y + d.W * sc, '#111', 'mg', { w: 2.5 });
      text(d.bal ? 'balanced ✓' : d.net > 0 ? 'rising' : 'falling', 12, 300, { font: '700 14px "Space Grotesk",sans-serif', col: d.bal ? '#1e7d45' : '#c43a00' });
      panelTitle('CHARGE IF BALANCED', 395, 18); text('q = ' + fplain(d.qCalc) + ' C', 400, 60, { font: '700 13px "Space Grotesk",sans-serif' }); text('= ' + fplain(d.nCalc) + ' e', 400, 84, { font: '700 16px "Space Grotesk",sans-serif', col: d.bal ? '#1e7d45' : '#4a4a4a' });
      return;
    }
    if (mode === 'accel'){
      panelTitle('ACCELERATING FROM REST (' + d.nm + ')', 10, 18);
      const xL = 70, xR = 70 + Math.min(280, 40 + 26 * v.d); const neg = d.z < 0;
      ctx.fillStyle = neg ? '#1546d6' : '#c43a00'; ctx.fillRect(xL - 8, 70, 8, 190); ctx.fillStyle = neg ? '#c43a00' : '#1546d6'; ctx.fillRect(xR, 70, 8, 190);
      text(neg ? '−' : '+', xL - 4, 62, { align: 'center', font: '700 14px "Space Grotesk",sans-serif' }); text(neg ? '+' : '−', xR + 4, 62, { align: 'center', font: '700 14px "Space Grotesk",sans-serif' });
      const x = xL + 6 + (xR - xL - 12) * s * s; ctx.fillStyle = neg ? '#1546d6' : '#ff6a2b'; ctx.beginPath(); ctx.arc(x, 165, 7, 0, 7); ctx.fill();
      text('ΔV = ' + v.V + ' V', (xL + xR) / 2, 290, { align: 'center', font: '600 11px "IBM Plex Mono",monospace' });
      text('K = ' + fplain(d.KJ) + ' J  ·  v = ' + fplain(d.v) + ' m/s', 12, 316, { font: '700 13px "Space Grotesk",sans-serif' });
      panelTitle('SAME ΔV, DIFFERENT PARTICLES', 395, 18);
      Object.entries(PART).forEach(([k, [nm, z, m]], i) => { const vv = Math.sqrt(2 * Math.abs(z) * E0 * v.V / m); text({ e: 'e⁻', p: 'p⁺', a: 'α' }[k] + ': ' + fplain(Math.abs(z) * E0 * v.V) + ' J, ' + fplain(vv) + ' m/s', 400, 56 + i * 22, { font: '600 11px "IBM Plex Mono",monospace', col: k === (opt.pt || 'e') ? '#111' : '#8a8a8a' }); });
      return;
    }
    panelTitle('BEAM OF ' + d.nm.toUpperCase() + 'S BETWEEN PLATES', 10, 18);
    const x0 = 60, Lp = 60 + 14 * v.L, gap = 40 + 18 * v.d, yc = 165, yT = yc - gap / 2, yB = yc + gap / 2, scY = gap / (v.d / 100);
    plates(x0, x0 + Lp, yT, yB);
    const dir = d.z < 0 ? 1 : -1;   // electrons go up (toward + top plate); screen y = yc - dir*y
    const xEnd = d.hit ? d.xHit : v.L / 100, nS = 60; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, yc);
    for (let i = 0; i <= nS; i++){ const x = xEnd * i / nS, tt = x / (v.v0 * 1e6), y = 0.5 * d.a * tt * tt; ctx.lineTo(x0 + Lp * x / (v.L / 100), yc - dir * Math.min(gap / 2, y * scY)); }
    if (!d.hit){ const yE = yc - dir * d.y * scY, sl = d.vy / (v.v0 * 1e6) * scY / (Lp / (v.L / 100)); ctx.lineTo(385, yE - dir * sl * (385 - x0 - Lp)); } ctx.stroke();
    const xx = s * (xEnd), tt = xx / (v.v0 * 1e6); ctx.fillStyle = d.z < 0 ? '#1546d6' : '#ff6a2b'; ctx.beginPath(); ctx.arc(x0 + Lp * xx / (v.L / 100), yc - dir * Math.min(gap / 2, 0.5 * d.a * tt * tt * scY), 5, 0, 7); ctx.fill();
    text(d.hit ? 'hits the plate!' : 'y = ' + fplain(d.y * 100) + ' cm, θ = ' + fplain(d.ang) + '°', 12, 316, { font: '700 13px "Space Grotesk",sans-serif', col: d.hit ? '#c43a00' : '#111' });
    panelTitle('COMPARE WITH A PROJECTILE', 395, 18);
    [['Gravity', 'a = g (down)', 'parabola'], ['Plates', 'a = qE/m', 'parabola']].forEach(([a, b, c], i) => { text(a, 400, 56 + i * 44, { font: '700 13px "Space Grotesk",sans-serif' }); text(b + ', v_x constant', 400, 74 + i * 44, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); });
    text('a = ' + fplain(d.a) + ' m/s²', 400, 170, { font: '700 13px "Space Grotesk",sans-serif', col: '#7a3fb0' });
  }
};
