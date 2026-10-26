// Gas Law Problems (AP 9.2, IB B.3): classic ideal-gas scenarios. Tire on a hot day (gauge vs absolute), rising bubble, emptying a gas cylinder, hot-air balloon.
const RG = 8.31, PATM = 101;
const SIM = {
  title: 'Gas Law Problems',
  hint: 'R = 8.31 J/(mol·K) · P<sub>atm</sub> = 101 kPa · g = 10 m/s²',
  modes: [{ id: 'tire', label: 'Tire on a hot day' }, { id: 'bubble', label: 'Rising bubble' }, { id: 'leak', label: 'Emptying a cylinder' }, { id: 'balloon', label: 'Hot-air balloon' }],
  ivs(mode){
    if (mode === 'bubble') return [
      { id: 'h', sym: 'h', symText: 'h', label: 'Depth of the lake bed', unit: 'm', min: 1, max: 40, step: 0.5, val: 20, graph: true },
      { id: 'V1', sym: 'V<sub>1</sub>', symText: 'V1', label: 'Bubble volume at the bottom', unit: 'cm³', min: 0.5, max: 5, step: 0.1, val: 1 },
      { id: 'T1', sym: 'T<sub>1</sub>', symText: 'T1', label: 'Water temperature at the bottom', unit: '°C', min: 4, max: 20, step: 1, val: 5 },
      { id: 'T2', sym: 'T<sub>2</sub>', symText: 'T2', label: 'Water temperature at the surface', unit: '°C', min: 4, max: 30, step: 1, val: 20 }];
    if (mode === 'leak') return [
      { id: 'V', sym: 'V', symText: 'V', label: 'Cylinder volume', unit: 'L', min: 5, max: 50, step: 1, val: 20 },
      { id: 'P1', sym: 'P<sub>1</sub>', symText: 'P1', label: 'Pressure when full', unit: 'kPa', min: 2000, max: 20000, step: 100, val: 15000 },
      { id: 'P2', sym: 'P<sub>2</sub>', symText: 'P2', label: 'Pressure after use', unit: 'kPa', min: 200, max: 15000, step: 100, val: 5000, graph: true },
      { id: 'T', sym: 'T', symText: 'T', label: 'Temperature (constant)', unit: '°C', min: -10, max: 40, step: 1, val: 20 }];
    if (mode === 'balloon') return [
      { id: 'V', sym: 'V', symText: 'V', label: 'Envelope volume', unit: 'm³', min: 500, max: 4000, step: 50, val: 2500 },
      { id: 'To', sym: 'T<sub>out</sub>', symText: 'Tout', label: 'Outside air temperature', unit: '°C', min: -10, max: 35, step: 1, val: 15 },
      { id: 'Ti', sym: 'T<sub>in</sub>', symText: 'Tin', label: 'Air inside the envelope', unit: '°C', min: 40, max: 120, step: 1, val: 100, graph: true }];
    return [
      { id: 'Pg', sym: 'P<sub>gauge</sub>', symText: 'Pg', label: 'Gauge pressure, cold morning', unit: 'kPa', min: 150, max: 300, step: 5, val: 220 },
      { id: 'T1', sym: 'T<sub>1</sub>', symText: 'T1', label: 'Morning temperature', unit: '°C', min: -15, max: 25, step: 1, val: 5 },
      { id: 'T2', sym: 'T<sub>2</sub>', symText: 'T2', label: 'Tire after driving on hot road', unit: '°C', min: 10, max: 70, step: 1, val: 45, graph: true }];
  },
  presets: [{ label: 'Deep lake', mode: 'bubble', v: { h: 40 } }, { label: 'Winter morning', mode: 'tire', v: { T1: -15 } }, { label: 'Hot day', mode: 'balloon', v: { To: 35 } }],
  calc(v, mode){
    if (mode === 'bubble'){ const P1 = PATM + 10 * v.h, P2 = PATM, T1 = v.T1 + 273, T2 = v.T2 + 273, V2 = v.V1 * (P1 / P2) * (T2 / T1); return { P1, P2, T1, T2, V2, ratio: V2 / v.V1 }; }
    if (mode === 'leak'){ const T = v.T + 273, Vm = v.V / 1000, n1 = v.P1 * 1000 * Vm / (RG * T), n2 = Math.min(v.P2, v.P1) * 1000 * Vm / (RG * T), dn = n1 - n2, M = 0.032; return { T, Vm, n1, n2, dn, dm: dn * M, frac: dn / n1 }; }
    if (mode === 'balloon'){ const M = 0.029, P = PATM * 1000, To = v.To + 273, Ti = v.Ti + 273, ro = P * M / (RG * To), ri = P * M / (RG * Ti), lift = (ro - ri) * v.V * 10; return { To, Ti, ro, ri, lift, mass: lift / 10, airIn: ri * v.V }; }
    const T1 = v.T1 + 273, T2 = v.T2 + 273, P1 = v.Pg + PATM, P2 = P1 * T2 / T1, wrong = v.Pg * (v.T2 / (v.T1 || 1));
    return { T1, T2, P1, P2, Pg2: P2 - PATM, rise: P2 - P1, wrong };
  },
  dvs(mode){
    if (mode === 'bubble') return [{ id: 'V2', name: 'Volume at the surface', short: 'V₂', sym: 'V<sub>2</sub>', unit: 'cm³', f: d => d.V2 }, { id: 'ratio', name: 'Growth factor V₂/V₁', short: 'V₂/V₁', sym: 'V<sub>2</sub>/V<sub>1</sub>', unit: '', f: d => d.ratio }];
    if (mode === 'leak') return [{ id: 'dm', name: 'Mass of oxygen used', short: 'Δm', sym: 'Δm', unit: 'kg', f: d => d.dm }, { id: 'frac', name: 'Fraction of the gas used', short: 'fraction', sym: 'Δn/n', unit: '', f: d => d.frac }];
    if (mode === 'balloon') return [{ id: 'mass', name: 'Mass it can lift (payload + envelope)', short: 'mass', sym: 'm', unit: 'kg', f: d => d.mass }, { id: 'ri', name: 'Density of the inside air', short: 'ρ_in', sym: 'ρ<sub>in</sub>', unit: 'kg/m³', f: d => d.ri, vs: 'ro' }, { id: 'ro', name: 'Density of the outside air', short: 'ρ_out', sym: 'ρ<sub>out</sub>', unit: 'kg/m³', f: d => d.ro }];
    return [{ id: 'Pg2', name: 'Gauge pressure, hot', short: 'P_gauge', sym: 'P<sub>gauge,2</sub>', unit: 'kPa', f: d => d.Pg2 }, { id: 'P2', name: 'Absolute pressure, hot', short: 'P₂', sym: 'P<sub>2</sub>', unit: 'kPa', f: d => d.P2 }];
  },
  work(v, d, mode){
    if (mode === 'bubble') return '<h4>1 · Pressure at the bottom: atmosphere + water</h4><div class="eq">P<sub>1</sub> = 101 + ρgh = 101 + (1000)(10)(' + H.iv('h') + ')/1000 = <b>' + H.n(d.P1, 'kPa') + '</b> &nbsp; P<sub>2</sub> = 101 kPa</div>' +
      '<h4>2 · Same gas (n constant): P₁V₁/T₁ = P₂V₂/T₂, temperatures in kelvin</h4><div class="eq">T<sub>1</sub> = ' + d.T1 + ' K, T<sub>2</sub> = ' + d.T2 + ' K</div>' +
      '<div class="eq">V<sub>2</sub> = V<sub>1</sub>(P<sub>1</sub>/P<sub>2</sub>)(T<sub>2</sub>/T<sub>1</sub>) = ' + H.iv('V1') + ' × (' + fnum(d.P1) + '/101) × (' + d.T2 + '/' + d.T1 + ') = <b>' + H.n(d.V2, 'cm³') + '</b></div>' +
      '<p class="note">Every 10 m of water adds about one atmosphere. Most of the growth is the pressure drop; warming adds a few percent. This is why divers must not hold their breath while rising.</p>';
    if (mode === 'leak') return '<h4>1 · Rigid cylinder: V and T constant, so n ∝ P</h4><div class="eq">n<sub>1</sub> = P<sub>1</sub>V/RT = (' + fnum(v.P1 * 1000) + ')(' + fnum(d.Vm) + ')/(8.31 × ' + d.T + ') = ' + H.n(d.n1, 'mol') + '</div>' +
      '<div class="eq">n<sub>2</sub> = ' + H.n(d.n2, 'mol') + ' → Δn = <b>' + H.n(d.dn, 'mol') + '</b> (' + H.n(100 * d.frac, '%') + ' of the gas)</div>' +
      '<h4>2 · Mass of oxygen used (M = 32 g/mol)</h4><div class="eq">Δm = Δn × 0.032 = <b>' + H.n(d.dm, 'kg') + '</b></div>' +
      '<p class="note">Shortcut: fraction used = (P₁ − P₂)/P₁. The gauge reading tells you how much is left.</p>';
    if (mode === 'balloon') return '<h4>1 · Same pressure inside and out (the bottom is open): ρ = PM/RT</h4><div class="eq">ρ<sub>out</sub> = (101 000)(0.029)/(8.31 × ' + d.To + ') = <b>' + H.n(d.ro, 'kg/m³') + '</b></div>' +
      '<div class="eq">ρ<sub>in</sub> = (101 000)(0.029)/(8.31 × ' + d.Ti + ') = <b>' + H.n(d.ri, 'kg/m³') + '</b>: hotter air is less dense</div>' +
      '<h4>2 · Net upward force = buoyancy − weight of hot air inside</h4><div class="eq">F = (ρ<sub>out</sub> − ρ<sub>in</sub>)Vg = (' + fnum(d.ro) + ' − ' + fnum(d.ri) + ')(' + H.iv('V') + ')(10) = <b>' + H.n(d.lift, 'N') + '</b></div>' +
      '<div class="eq">It can lift up to <b>' + H.n(d.mass, 'kg') + '</b> of envelope, basket and people.</div>' +
      '<p class="note">On a hot day the outside air is less dense, so the balloon lifts less. Links to buoyancy from Fluids.</p>';
    return '<h4>1 · Gas laws need absolute pressure and kelvin</h4><div class="eq">P<sub>1</sub> = gauge + atmosphere = ' + H.iv('Pg') + ' + 101 = <b>' + H.n(d.P1, 'kPa') + '</b> &nbsp; T<sub>1</sub> = ' + d.T1 + ' K, T<sub>2</sub> = ' + d.T2 + ' K</div>' +
      '<h4>2 · Rigid tire (V constant): P/T = constant</h4><div class="eq">P<sub>2</sub> = P<sub>1</sub>T<sub>2</sub>/T<sub>1</sub> = ' + fnum(d.P1) + ' × ' + d.T2 + '/' + d.T1 + ' = <b>' + H.n(d.P2, 'kPa') + '</b> absolute</div>' +
      '<div class="eq">Gauge reading = ' + fnum(d.P2) + ' − 101 = <b>' + H.n(d.Pg2, 'kPa') + '</b></div>' +
      '<div class="bad">Common mistake: using gauge pressure and °C. ' + H.iv('Pg') + ' × ' + v.T2 + '/' + v.T1 + ' = ' + fnum(d.wrong) + ' kPa. Way off' + (v.T1 <= 0 ? ', and it breaks completely at or below 0 °C' : '') + '.</div>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.s === undefined || A.reset) A.s = 0; A.s = (A.s + dt / 4) % 1.25; const s = Math.min(1, A.s);
    const big = (str, x, y, col) => text(str, x, y, { font: '700 14px "Space Grotesk",sans-serif', col: col || '#111' }), small = (str, x, y) => text(str, x, y, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    if (mode === 'bubble'){
      panelTitle('A BUBBLE RISES FROM THE LAKE BED', 10, 18);
      ctx.fillStyle = '#cfe6ff'; ctx.fillRect(20, 50, 340, 250); ctx.fillStyle = '#c9b48a'; ctx.fillRect(20, 290, 340, 12); ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, 50); ctx.lineTo(360, 50); ctx.stroke();
      const y = 285 - s * 230, r = 12 * Math.cbrt(v.V1 * (1 + (d.ratio - 1) * s));
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.strokeStyle = '#1546d6'; ctx.beginPath(); ctx.arc(190, y, Math.min(48, r), 0, 7); ctx.fill(); ctx.stroke();
      small('h = ' + v.h + ' m', 30, 270); small('P₁ = ' + fplain(d.P1) + ' kPa', 30, 284); small('surface: 101 kPa', 30, 70);
      panelTitle('BOTTOM → TOP', 395, 18); big('V₁ = ' + v.V1 + ' cm³', 400, 70); big('V₂ = ' + fplain(d.V2) + ' cm³', 400, 100, '#c43a00'); small('×' + fplain(d.ratio) + ' bigger', 400, 122);
      return;
    }
    if (mode === 'leak'){
      panelTitle('OXYGEN CYLINDER', 10, 18);
      const fill = 1 - d.frac * s; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(120, 50, 110, 240, 30); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.roundRect(120, 50, 110, 240, 30); ctx.clip(); ctx.fillStyle = '#9fd3a8'; ctx.fillRect(120, 290 - 240 * fill, 110, 240 * fill); ctx.restore();
      for (let i = 0; i < Math.round(40 * fill); i++){ ctx.fillStyle = '#1e7d45'; ctx.beginPath(); ctx.arc(135 + (i * 37) % 80, 70 + (i * 53) % 200, 3, 0, 7); ctx.fill(); }
      small('P = ' + fplain(v.P1 - (v.P1 - Math.min(v.P2, v.P1)) * s) + ' kPa', 120, 310);
      panelTitle('MOLES IN THE CYLINDER', 395, 18); [['full', d.n1], ['after', d.n2]].forEach(([l, q], i) => { const w = 170 * q / d.n1; ctx.fillStyle = i ? '#9fd3a8' : '#1e7d45'; ctx.fillRect(400, 50 + i * 40, w, 24); small(l + ': ' + fplain(q) + ' mol', 400, 88 + i * 40); });
      big('used: ' + fplain(d.dm) + ' kg', 400, 160, '#c43a00'); return;
    }
    if (mode === 'balloon'){
      panelTitle('HOT-AIR BALLOON', 10, 18);
      const hc = Math.max(0, Math.min(1, (v.Ti - 40) / 80)); ctx.fillStyle = 'rgb(255,' + Math.round(200 - 110 * hc) + ',' + Math.round(150 - 120 * hc) + ')';
      const yb = 170 - Math.max(-40, Math.min(90, d.mass / 15)) * s; ctx.beginPath(); ctx.ellipse(190, yb - 40, 80, 90, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(150, yb + 35); ctx.lineTo(170, yb + 80); ctx.moveTo(230, yb + 35); ctx.lineTo(210, yb + 80); ctx.stroke(); ctx.fillStyle = '#8a5a2b'; ctx.fillRect(168, yb + 80, 44, 26);
      arrow(300, yb, 300, yb - 60, '#1e7d45', 'buoyancy', { w: 3 }); arrow(320, yb, 320, yb + 40, '#111', 'W(hot air)', { w: 3 });
      panelTitle('AIR DENSITY', 395, 18); [['outside', d.ro, '#1546d6'], ['inside', d.ri, '#c43a00']].forEach(([l, q, c], i) => { const w = 140 * q / 1.4; ctx.fillStyle = c; ctx.fillRect(400, 50 + i * 40, w, 24); small(l + ': ' + fplain(q) + ' kg/m³', 400, 88 + i * 40); });
      big('lifts ' + fplain(d.mass) + ' kg', 400, 160, '#1e7d45'); return;
    }
    panelTitle('CAR TIRE: COLD MORNING → AFTER A HIGHWAY DRIVE', 10, 18);
    const T = d.T1 + (d.T2 - d.T1) * s, P = d.P1 * T / d.T1; ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(170, 170, 100, 0, 7); ctx.fill(); ctx.fillStyle = '#bbb'; ctx.beginPath(); ctx.arc(170, 170, 50, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(170, 170, 28, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.stroke(); const a = -PI * 0.75 + PI * 1.5 * Math.min(1, (P - PATM) / 400); ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(170, 170); ctx.lineTo(170 + 24 * Math.cos(a - PI / 2), 170 + 24 * Math.sin(a - PI / 2)); ctx.stroke();
    small('gauge ' + fplain(P - PATM) + ' kPa', 120, 300); small((T - 273).toFixed(0) + ' °C', 140, 316);
    panelTitle('GAUGE READING', 395, 18); big('cold: ' + v.Pg + ' kPa', 400, 70); big('hot: ' + fplain(d.Pg2) + ' kPa', 400, 100, '#c43a00'); small('absolute = gauge + 101', 400, 124);
  }
};
