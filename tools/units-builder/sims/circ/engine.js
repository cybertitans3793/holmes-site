// Heat Engines (AP 9.4/9.6 context; IB HL B.4): a steam engine with its indicator (P–V) diagram, the energy-flow picture for engines and fridges, and the Carnot cycle.
const RG = 8.31, MW = 0.018, LV = 2.26e6;
function tsat(PkPa){ return 1 / (1 / 373 - (RG / (MW * LV)) * Math.log(PkPa / 101)); }   // boiling point of water at pressure P (Clausius–Clapeyron)
const SIM = {
  title: 'Heat Engines',
  hint: 'kPa × L = J · steam treated as an ideal gas',
  modes: [{ id: 'steam', label: 'Steam engine' }, { id: 'flow', label: 'Energy flow' }, { id: 'carnot', label: 'Carnot cycle (IB HL)' }],
  opts: [{ id: 'dev', label: 'Device', modes: ['flow'], choices: [['eng', 'Engine'], ['fridge', 'Fridge / heat pump']] }],
  ivs(mode){
    if (mode === 'flow') return [
      { id: 'Th', sym: 'T<sub>h</sub>', symText: 'Th', label: 'Hot reservoir', unit: 'K', min: 310, max: 1500, step: 10, val: 800 },
      { id: 'Tc', sym: 'T<sub>c</sub>', symText: 'Tc', label: 'Cold reservoir', unit: 'K', min: 250, max: 300, step: 5, val: 300 },
      { id: 'Q', sym: 'Q', symText: 'Q', label: 'Heat in (engine) or heat removed (fridge)', unit: 'J', min: 100, max: 5000, step: 50, val: 1000 },
      { id: 'f', sym: 'f', symText: 'f', label: 'How close to the Carnot limit', unit: '%', min: 5, max: 100, step: 1, val: 50, graph: true }];
    if (mode === 'carnot') return [
      { id: 'Th', sym: 'T<sub>h</sub>', symText: 'Th', label: 'Hot reservoir', unit: 'K', min: 350, max: 900, step: 10, val: 600 },
      { id: 'Tc', sym: 'T<sub>c</sub>', symText: 'Tc', label: 'Cold reservoir', unit: 'K', min: 200, max: 340, step: 5, val: 300, graph: true },
      { id: 'r', sym: 'V<sub>B</sub>/V<sub>A</sub>', symText: 'VB/VA', label: 'Isothermal expansion ratio', unit: '', min: 1.3, max: 3, step: 0.05, val: 2 }];
    return [
      { id: 'Pb', sym: 'P<sub>boiler</sub>', symText: 'Pboiler', label: 'Boiler pressure (absolute)', unit: 'kPa', min: 150, max: 1500, step: 10, val: 400, graph: true },
      { id: 'cut', sym: 'cutoff', symText: 'cutoff', label: 'Valve closes at this fraction of the stroke', unit: '%', min: 10, max: 100, step: 1, val: 40 },
      { id: 'Pe', sym: 'P<sub>exhaust</sub>', symText: 'Pexhaust', label: 'Exhaust pressure (101 = open air, lower = condenser)', unit: 'kPa', min: 10, max: 101, step: 1, val: 101 },
      { id: 'Vs', sym: 'V<sub>s</sub>', symText: 'Vs', label: 'Swept volume of the cylinder', unit: 'cm³', min: 1, max: 500, step: 1, val: 5 },
      { id: 'rpm', sym: 'rpm', symText: 'rpm', label: 'Speed', unit: 'rev/min', min: 30, max: 1200, step: 10, val: 300 }];
  },
  presets: [{ label: 'Toy engine', mode: 'steam', v: { Pb: 200, cut: 60, Pe: 101, Vs: 5, rpm: 600 } }, { label: 'Add a condenser', mode: 'steam', v: { Pe: 20 } }, { label: 'Early cutoff', mode: 'steam', v: { cut: 15 } }, { label: 'Car engine', mode: 'flow', v: { Th: 1100, Tc: 300, f: 50 } }],
  calc(v, mode, opt){
    if (mode === 'flow'){ const eC = 1 - v.Tc / v.Th, fr = (opt.dev || 'eng') === 'fridge';
      if (fr){ const copC = v.Tc / (v.Th - v.Tc), cop = copC * v.f / 100, W = v.Q / cop; return { fr, eC, copC, cop, Qc: v.Q, W, Qh: v.Q + W, dS: (v.Q + W) / v.Th - v.Q / v.Tc }; }
      const eta = eC * v.f / 100, W = eta * v.Q; return { fr, eC, eta, Qh: v.Q, W, Qc: v.Q - W, dS: (v.Q - W) / v.Tc - v.Q / v.Th }; }
    if (mode === 'carnot'){ const n = 0.1, k = Math.pow(v.Th / v.Tc, 1.5), VA = 1, VB = v.r, VC = VB * k, VD = VA * k;
      const Qh = n * RG * v.Th * Math.log(v.r), Qc = n * RG * v.Tc * Math.log(v.r), W = Qh - Qc;
      return { n, VA, VB, VC, VD, Qh, Qc, W, eta: W / Qh, eC: 1 - v.Tc / v.Th }; }
    const V0 = 0.08 * v.Vs, Vc = V0 + v.cut / 100 * v.Vs, Vm = V0 + v.Vs, g = 1.3, P2 = v.Pb * Math.pow(Vc / Vm, g);
    const Wadm = v.Pb * (Vc - V0), Wexp = (v.Pb * Vc - P2 * Vm) / (g - 1), Wex = v.Pe * (Vm - V0), W = (Wadm + Wexp - Wex) / 1000;   // kPa·cm³ → J
    const Tb = tsat(v.Pb), Te = tsat(v.Pe), m = v.Pb * 1000 * (Vc - V0) * 1e-6 * MW / (RG * Tb), Qin = m * (LV + 4200 * (Tb - 293));
    return { V0, Vc, Vm, P2, W, Wadm: Wadm / 1000, Wexp: Wexp / 1000, Wex: Wex / 1000, Tb, Te, m, Qin, eta: W / Qin, eC: 1 - Te / Tb, P: W * v.rpm / 60 };
  },
  dvs(mode){
    if (mode === 'flow') return [{ id: 'W', name: 'Work (out for engine, in for fridge)', short: 'W', sym: 'W', unit: 'J', f: d => d.W }, { id: 'Qc', name: 'Heat to/from the cold reservoir', short: 'Q_c', sym: 'Q<sub>c</sub>', unit: 'J', f: d => d.Qc }, { id: 'dS', name: 'Entropy change of the reservoirs', short: 'ΔS', sym: 'ΔS', unit: 'J/K', f: d => d.dS }];
    if (mode === 'carnot') return [{ id: 'eta', name: 'Carnot efficiency', short: 'η', sym: 'η', unit: '', f: d => d.eta }, { id: 'W', name: 'Net work per cycle', short: 'W', sym: 'W', unit: 'J', f: d => d.W }];
    return [{ id: 'W', name: 'Work per stroke (area of the loop)', short: 'W', sym: 'W', unit: 'J', f: d => d.W }, { id: 'eta', name: 'Efficiency', short: 'η', sym: 'η', unit: '', f: d => d.eta, vs: 'eC' }, { id: 'eC', name: 'Carnot limit', short: 'η_C', sym: 'η<sub>C</sub>', unit: '', f: d => d.eC }, { id: 'P', name: 'Power output', short: 'P', sym: 'P', unit: 'W', f: d => d.P }];
  },
  work(v, d, mode){
    if (mode === 'flow'){
      if (d.fr) return '<h4>1 · A fridge moves heat from cold to hot, which needs work</h4><div class="eq">Q<sub>h</sub> = Q<sub>c</sub> + W (energy conservation)</div>' +
        '<h4>2 · Best possible (Carnot) performance</h4><div class="eq">COP<sub>max</sub> = T<sub>c</sub>/(T<sub>h</sub> − T<sub>c</sub>) = ' + v.Tc + '/' + (v.Th - v.Tc) + ' = ' + H.n(d.copC) + '. This one: COP = ' + H.n(d.cop) + '</div>' +
        '<div class="eq">W = Q<sub>c</sub>/COP = ' + H.iv('Q') + '/' + fnum(d.cop) + ' = <b>' + H.n(d.W, 'J') + '</b> → Q<sub>h</sub> = <b>' + H.n(d.Qh, 'J') + '</b> dumped into the warm room</div>' +
        '<h4>3 · Second law check</h4><div class="eq">ΔS = Q<sub>h</sub>/T<sub>h</sub> − Q<sub>c</sub>/T<sub>c</sub> = <b>' + H.n(d.dS, 'J/K') + '</b> ≥ 0 ✓ (= 0 only at the Carnot limit)</div>' +
        '<p class="note">Without the work input, heat would have to flow cold → hot on its own: forbidden.</p>';
      return '<h4>1 · Energy in = energy out</h4><div class="eq">Q<sub>h</sub> = W + Q<sub>c</sub>. Some heat <i>must</i> be dumped to the cold reservoir.</div>' +
        '<h4>2 · The Carnot limit</h4><div class="eq">η<sub>Carnot</sub> = 1 − T<sub>c</sub>/T<sub>h</sub> = 1 − ' + v.Tc + '/' + v.Th + ' = <b>' + H.n(100 * d.eC, '%') + '</b></div>' +
        '<h4>3 · This engine</h4><div class="eq">η = ' + H.iv('f') + ' of Carnot = ' + H.n(100 * d.eta, '%') + ' → W = ηQ<sub>h</sub> = <b>' + H.n(d.W, 'J') + '</b>, Q<sub>c</sub> = <b>' + H.n(d.Qc, 'J') + '</b></div>' +
        '<h4>4 · Second law check</h4><div class="eq">ΔS = Q<sub>c</sub>/T<sub>c</sub> − Q<sub>h</sub>/T<sub>h</sub> = <b>' + H.n(d.dS, 'J/K') + '</b> ≥ 0 ✓. At 100% of Carnot it’s exactly 0; beating Carnot would make it negative.</div>' +
        '<p class="note">To raise the limit, make T<sub>h</sub> hotter or T<sub>c</sub> colder. That’s why power plants use superheated steam and cooling towers.</p>';
    }
    if (mode === 'carnot') return '<h4>1 · Four reversible steps between two reservoirs</h4><div class="eq">A→B isothermal expansion at T<sub>h</sub> (takes in Q<sub>h</sub>) · B→C adiabatic expansion (cools to T<sub>c</sub>) · C→D isothermal compression at T<sub>c</sub> (gives out Q<sub>c</sub>) · D→A adiabatic compression</div>' +
      '<h4>2 · Heat in and out (n = 0.1 mol)</h4><div class="eq">Q<sub>h</sub> = nRT<sub>h</sub> ln(V<sub>B</sub>/V<sub>A</sub>) = ' + H.n(d.Qh, 'J') + ' &nbsp; Q<sub>c</sub> = nRT<sub>c</sub> ln(V<sub>C</sub>/V<sub>D</sub>) = ' + H.n(d.Qc, 'J') + '</div>' +
      '<div class="eq">The adiabats make V<sub>C</sub>/V<sub>D</sub> = V<sub>B</sub>/V<sub>A</sub>, so Q<sub>c</sub>/Q<sub>h</sub> = T<sub>c</sub>/T<sub>h</sub></div>' +
      '<h4>3 · Efficiency</h4><div class="eq">η = 1 − Q<sub>c</sub>/Q<sub>h</sub> = 1 − T<sub>c</sub>/T<sub>h</sub> = 1 − ' + v.Tc + '/' + v.Th + ' = <b>' + H.n(100 * d.eta, '%') + '</b></div>' +
      '<p class="note">IB HL: no engine working between the same two temperatures can beat this. The expansion ratio changes the work per cycle, not the efficiency.</p>';
    return '<h4>1 · The indicator diagram (Watt’s invention: the first P–V diagram)</h4><div class="eq"><b>Admission:</b> valve open, steam pushes at boiler pressure ' + H.iv('Pb') + ' until cutoff (' + H.iv('cut') + ' of the stroke): W = ' + H.n(d.Wadm, 'J') + '</div>' +
      '<div class="eq"><b>Expansion:</b> valve closed, steam keeps pushing as its pressure falls to ' + H.n(d.P2, 'kPa') + ': W = ' + H.n(d.Wexp, 'J') + ' (free work from steam you already paid for)</div>' +
      '<div class="eq"><b>Exhaust:</b> piston pushes the used steam out against ' + H.iv('Pe') + ': W = −' + H.n(d.Wex, 'J') + '</div>' +
      '<div class="eq">Net work per stroke = area inside the loop = <b>' + H.n(d.W, 'J') + '</b> → power at ' + H.iv('rpm') + ' = <b>' + H.n(d.P, 'W') + '</b></div>' +
      (d.P2 < v.Pe ? '<div class="bad">The steam expands below the exhaust pressure (' + fnum(d.P2) + ' &lt; ' + v.Pe + ' kPa): the end of the loop runs backward and costs work. Cutting off this early only pays with a condenser.</div>' : '') +
      '<h4>2 · Heat in: boil the water that fills the cylinder</h4><div class="eq">Steam admitted per stroke m = PV/(RT)·M = ' + H.n(d.m * 1000, 'g') + ' at ' + H.n(d.Tb - 273, '°C') + ' → Q<sub>h</sub> = m(L<sub>v</sub> + cΔT) = ' + H.n(d.Qin, 'J') + '</div>' +
      '<h4>3 · Efficiency vs the Carnot limit</h4><div class="eq">η = W/Q<sub>h</sub> = <b>' + H.n(100 * d.eta, '%') + '</b> &nbsp; Carnot between ' + fnum(d.Tb - 273) + ' °C and ' + fnum(d.Te - 273) + ' °C: ' + H.n(100 * d.eC, '%') + '</div>' +
      '<p class="note">Most of the energy leaves as hot exhaust steam: you can see it puff out. Early cutoff and a condenser (low exhaust pressure) were how real engines got more efficient. Real engines also lose heat through the cylinder walls, so they do even worse than this.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const small = (s, x, y, c) => text(s, x, y, { font: '600 10px "IBM Plex Mono",monospace', col: c || '#4a4a4a' });
    if (mode === 'flow'){
      panelTitle(d.fr ? 'FRIDGE / HEAT PUMP' : 'HEAT ENGINE', 10, 18);
      ctx.fillStyle = '#ffd2c0'; ctx.fillRect(110, 30, 180, 44); ctx.fillStyle = '#d6e9ff'; ctx.fillRect(110, 256, 180, 44); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(110, 30, 180, 44); ctx.strokeRect(110, 256, 180, 44);
      text('HOT ' + v.Th + ' K', 200, 58, { align: 'center', font: '700 14px "Space Grotesk",sans-serif', col: '#c43a00' }); text('COLD ' + v.Tc + ' K', 200, 284, { align: 'center', font: '700 14px "Space Grotesk",sans-serif', col: '#1546d6' });
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(200, 165, 40, 0, 7); ctx.fill(); ctx.stroke(); text(d.fr ? 'fridge' : 'engine', 200, 170, { align: 'center', font: '700 13px "Space Grotesk",sans-serif' });
      const sc = 40 / Math.max(d.Qh, 1), band = (x1, y1, x2, y2, q, col) => { ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, q * sc); ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
      if (!d.fr){ band(200, 74, 200, 125, d.Qh, '#e2492a'); band(200, 205, 200, 256, d.Qc, '#4a8fe0'); band(240, 165, 360, 165, d.W, '#1e7d45'); arrow(355, 165, 385, 165, '#1e7d45', null, { w: 3 });
        small('Q_h = ' + fplain(d.Qh) + ' J', 210, 100, '#c43a00'); small('Q_c = ' + fplain(d.Qc) + ' J', 210, 236, '#1546d6'); small('W = ' + fplain(d.W) + ' J', 250, 140, '#1e7d45'); }
      else { band(200, 125, 200, 74, d.Qh, '#e2492a'); band(200, 256, 200, 205, d.Qc, '#4a8fe0'); band(360, 165, 240, 165, d.W, '#1e7d45'); arrow(260, 165, 244, 165, '#1e7d45', null, { w: 3 });
        small('Q_h = ' + fplain(d.Qh) + ' J', 210, 100, '#c43a00'); small('Q_c = ' + fplain(d.Qc) + ' J', 210, 236, '#1546d6'); small('W in = ' + fplain(d.W) + ' J', 250, 135, '#1e7d45'); }
      panelTitle(d.fr ? 'COEFFICIENT OF PERFORMANCE' : 'EFFICIENCY', 395, 18);
      const bars = d.fr ? [['COP', d.cop, d.copC]] : [['η', d.eta, d.eC]];
      const [l, val, lim] = bars[0], mx = d.fr ? Math.max(lim, 1) * 1.1 : 1; ctx.fillStyle = '#eee'; ctx.fillRect(410, 60, 40, 200); ctx.fillStyle = '#1e7d45'; ctx.fillRect(410, 260 - 200 * val / mx, 40, 200 * val / mx);
      ctx.strokeStyle = '#c43a00'; ctx.setLineDash([5, 3]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(400, 260 - 200 * lim / mx); ctx.lineTo(470, 260 - 200 * lim / mx); ctx.stroke(); ctx.setLineDash([]);
      text('Carnot limit ' + (d.fr ? fplain(lim) : fplain(100 * lim) + '%'), 475, 264 - 200 * lim / mx, { font: '700 11px "IBM Plex Mono",monospace', col: '#c43a00' });
      text(l + ' = ' + (d.fr ? fplain(val) : fplain(100 * val) + '%'), 410, 290, { font: '700 15px "Space Grotesk",sans-serif', col: '#1e7d45' });
      return;
    }
    if (mode === 'carnot'){
      if (A.s === undefined || A.reset) A.s = 0; A.s = (A.s + dt / 2) % 4; const leg = Math.floor(A.s), q = A.s - leg;
      panelTitle('CARNOT CYCLE ON A P–V DIAGRAM', 10, 18);
      const nR = d.n * RG, P = (V, T) => nR * T / V, pts = [[d.VA, v.Th], [d.VB, v.Th], [d.VC, v.Tc], [d.VD, v.Tc]];
      const path = (i, s) => { const [Va, Ta] = pts[i], [Vb, Tb] = pts[(i + 1) % 4], V = Va * Math.pow(Vb / Va, s); if (i % 2 === 0) return [V, P(V, Ta)]; const T = Ta * Math.pow(Va / V, 2 / 3); return [V, P(V, T)]; };
      const Vmax = d.VC * 1.1, Pmax = P(d.VA, v.Th) * 1.1, gx = 50, gy = 300, gw = 320, gh = 260, X = V => gx + gw * V / Vmax, Y = p => gy - gh * p / Pmax;
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      ctx.fillStyle = 'rgba(30,125,69,0.15)'; ctx.beginPath(); for (let i = 0; i < 4; i++) for (let k = 0; k <= 30; k++){ const p = path(i, k / 30); (i || k) ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])); } ctx.closePath(); ctx.fill();
      const cols = ['#c43a00', '#7a3fb0', '#1546d6', '#7a3fb0'];
      for (let i = 0; i < 4; i++){ ctx.strokeStyle = cols[i]; ctx.lineWidth = i === leg ? 4.5 : 2.5; ctx.beginPath(); for (let k = 0; k <= 40; k++){ const p = path(i, k / 40); k ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])); } ctx.stroke(); const p = pts[i]; text('ABCD'[i], X(p[0]) + (i < 2 ? -4 : 6), Y(P(p[0], p[1])) - 8, { font: '700 14px "Space Grotesk",sans-serif' }); }
      const cp = path(leg, q); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(cp[0]), Y(cp[1]), 6, 0, 7); ctx.fill();
      small('red: isotherm ' + v.Th + ' K · blue: isotherm ' + v.Tc + ' K · purple: adiabats', gx, gy + 22);
      panelTitle('ENERGY PER CYCLE', 395, 18);
      [['Q_h', d.Qh, '#c43a00'], ['W', d.W, '#1e7d45'], ['Q_c', d.Qc, '#1546d6']].forEach(([l, q2, c], i) => { const w = 170 * q2 / d.Qh; ctx.fillStyle = c; ctx.fillRect(410, 50 + i * 40, w, 24); small(l + ' = ' + fplain(q2) + ' J', 410, 88 + i * 40); });
      text('η = 1 − Tc/Th = ' + fplain(100 * d.eta) + '%', 400, 200, { font: '700 15px "Space Grotesk",sans-serif', col: '#1e7d45' });
      return;
    }
    // steam engine
    const omega = 2 * PI * Math.min(v.rpm, 240) / 60; if (A.th === undefined || A.reset) A.th = 0; A.th = (A.th + omega * dt) % (2 * PI);
    const th = A.th, power = th < PI, s = (1 - Math.cos(th)) / 2, V = d.V0 + s * v.Vs;
    let P; if (power){ P = V <= d.Vc ? v.Pb : v.Pb * Math.pow(d.Vc / V, 1.3); } else P = v.Pe;
    const admitting = power && V <= d.Vc, exhausting = !power;
    panelTitle('STEAM ENGINE', 10, 18);
    // boiler
    ctx.fillStyle = '#b07a3a'; ctx.beginPath(); ctx.roundRect(20, 150, 90, 110, 12); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke(); small('boiler', 40, 278); small(fplain(d.Tb - 273) + ' °C', 36, 292, '#c43a00');
    for (let i = 0; i < 4; i++){ ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.moveTo(30 + i * 20, 268); ctx.quadraticCurveTo(38 + i * 20, 250 + 5 * Math.sin(t * 9 + i), 44 + i * 20, 268); ctx.fill(); }
    // pipe and cylinder
    ctx.fillStyle = admitting ? '#ffe2d3' : '#ddd'; ctx.fillRect(110, 168, 40, 10); ctx.strokeRect(110, 168, 40, 10);
    const cx0 = 150, cl = 150, cy = 150, ch = 46; ctx.fillStyle = '#eee'; ctx.fillRect(cx0, cy, cl, ch); ctx.strokeRect(cx0, cy, cl, ch);
    const px = cx0 + 10 + (cl - 30) * (V - d.V0) / v.Vs; ctx.fillStyle = 'rgba(255,106,43,' + (0.15 + 0.6 * P / Math.max(v.Pb, 200)) + ')'; ctx.fillRect(cx0 + 2, cy + 2, px - cx0 - 2, ch - 4);
    ctx.fillStyle = '#555'; ctx.fillRect(px, cy + 2, 12, ch - 4);
    // valve chest indicator
    small(admitting ? 'valve OPEN: steam in' : power ? 'valve closed: expanding' : 'exhaust open', cx0, cy - 8, admitting ? '#c43a00' : power ? '#7a3fb0' : '#4a4a4a');
    if (exhausting){ for (let i = 0; i < 3; i++){ const ph = (t * 1.2 + i / 3) % 1; ctx.fillStyle = 'rgba(180,180,180,' + (1 - ph) + ')'; ctx.beginPath(); ctx.arc(cx0 + 20 + 10 * i, cy - 20 - 70 * ph, 6 + 12 * ph, 0, 7); ctx.fill(); } }
    // crank and flywheel
    const fx = 345, fy = cy + ch / 2, R = 30, ang = th + PI, cxk = fx + R * Math.cos(ang), cyk = fy + R * Math.sin(ang);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(fx, fy, 42, 0, 7); ctx.stroke(); for (let k = 0; k < 6; k++){ const a = th + k * PI / 3; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + 42 * Math.cos(a), fy + 42 * Math.sin(a)); ctx.stroke(); }
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px + 12, fy); ctx.lineTo(cxk, cyk); ctx.stroke(); ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(cxk, cyk, 4, 0, 7); ctx.fill();
    text('P = ' + fplain(P) + ' kPa', 160, 230, { font: '700 12px "IBM Plex Mono",monospace' }); text('W per stroke = ' + fplain(d.W) + ' J · power ' + fplain(d.P) + ' W', 12, 316, { font: '700 12px "Space Grotesk",sans-serif' });
    // indicator diagram
    panelTitle('INDICATOR DIAGRAM (P–V)', 395, 18);
    const gx = 410, gy = 290, gw = 175, gh = 240, Vmx = d.Vm * 1.08, Pmx = v.Pb * 1.12, X = q => gx + gw * q / Vmx, Y = q => gy - gh * q / Pmx;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    const loop = []; loop.push([d.V0, v.Pb], [d.Vc, v.Pb]); for (let k = 1; k <= 30; k++){ const VV = d.Vc + (d.Vm - d.Vc) * k / 30; loop.push([VV, v.Pb * Math.pow(d.Vc / VV, 1.3)]); } loop.push([d.Vm, v.Pe], [d.V0, v.Pe]);
    ctx.fillStyle = 'rgba(30,125,69,0.18)'; ctx.beginPath(); loop.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.5; ctx.beginPath(); loop.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); ctx.closePath(); ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#888'; ctx.beginPath(); ctx.moveTo(gx, Y(101)); ctx.lineTo(gx + gw, Y(101)); ctx.stroke(); ctx.setLineDash([]); small('1 atm', gx + gw - 30, Y(101) - 3);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(V), Y(P), 5, 0, 7); ctx.fill();
    small('cutoff', X(d.Vc) - 14, Y(v.Pb) - 6, '#c43a00'); small('V', gx + gw - 6, gy + 13); small('P', gx + 4, gy - gh + 8);
    text('η = ' + fplain(100 * d.eta) + '% (Carnot ' + fplain(100 * d.eC) + '%)', 400, 314, { font: '700 12px "Space Grotesk",sans-serif', col: '#1e7d45' });
  }
};
