// Gas in a Piston (AP 9.4, IB B.3 P–V diagrams, IB HL B.4 first law): isobaric, isochoric, isothermal, adiabatic. Particles, P–V path, and Q, W, ΔU with AP or IB sign convention.
const RG = 8.31;
const SIM = {
  title: 'Gas in a Piston',
  hint: 'R = 8.31 J/(mol·K) · kPa × L = J · monatomic ideal gas',
  modes: [{ id: 'bar', label: 'Constant P (heat it)' }, { id: 'vol', label: 'Constant V (sealed can)' }, { id: 'iso', label: 'Constant T (slow push)' }, { id: 'adi', label: 'No heat (fast push)' }],
  opts: [{ id: 'sign', label: 'Sign convention', choices: [['ap', 'AP: ΔU = Q + W'], ['ib', 'IB: Q = ΔU + W']] }],
  ivs(mode){
    const n = { id: 'n', sym: 'n', symText: 'n', label: 'Amount of gas', unit: 'mol', min: 0.02, max: 0.5, step: 0.01, val: 0.1 };
    if (mode === 'bar') return [n, { id: 'P', sym: 'P', symText: 'P', label: 'Pressure (set by the weights)', unit: 'kPa', min: 100, max: 400, step: 5, val: 150 },
      { id: 'T1', sym: 'T<sub>1</sub>', symText: 'T1', label: 'Starting temperature', unit: 'K', min: 200, max: 600, step: 5, val: 300 },
      { id: 'T2', sym: 'T<sub>2</sub>', symText: 'T2', label: 'Final temperature', unit: 'K', min: 150, max: 800, step: 5, val: 600, graph: true }];
    if (mode === 'vol') return [n, { id: 'V', sym: 'V', symText: 'V', label: 'Volume (piston locked)', unit: 'L', min: 0.5, max: 5, step: 0.1, val: 2 },
      { id: 'T1', sym: 'T<sub>1</sub>', symText: 'T1', label: 'Starting temperature', unit: 'K', min: 200, max: 600, step: 5, val: 300 },
      { id: 'T2', sym: 'T<sub>2</sub>', symText: 'T2', label: 'Final temperature', unit: 'K', min: 150, max: 800, step: 5, val: 450, graph: true }];
    return [n, { id: 'T1', sym: mode === 'iso' ? 'T' : 'T<sub>1</sub>', symText: 'T1', label: mode === 'iso' ? 'Temperature (water bath)' : 'Starting temperature', unit: 'K', min: 200, max: 600, step: 5, val: 300 },
      { id: 'V1', sym: 'V<sub>1</sub>', symText: 'V1', label: 'Starting volume', unit: 'L', min: 0.5, max: 5, step: 0.1, val: 3 },
      { id: 'V2', sym: 'V<sub>2</sub>', symText: 'V2', label: 'Final volume', unit: 'L', min: 0.3, max: 6, step: 0.05, val: 1.5, graph: true }];
  },
  presets: [{ label: 'Cool it instead', mode: 'bar', v: { T2: 200 } }, { label: 'Let it expand', mode: 'adi', v: { V2: 5 } }, { label: 'Double T', mode: 'vol', v: { T1: 300, T2: 600 } }],
  calc(v, mode, opt){
    const nR = v.n * RG; let P1, V1, T1, P2, V2, T2, Won;
    if (mode === 'bar'){ T1 = v.T1; T2 = v.T2; P1 = P2 = v.P; V1 = nR * T1 / v.P; V2 = nR * T2 / v.P; Won = -v.P * (V2 - V1); }
    else if (mode === 'vol'){ T1 = v.T1; T2 = v.T2; V1 = V2 = v.V; P1 = nR * T1 / v.V; P2 = nR * T2 / v.V; Won = 0; }
    else if (mode === 'iso'){ T1 = T2 = v.T1; V1 = v.V1; V2 = v.V2; P1 = nR * T1 / V1; P2 = nR * T2 / V2; Won = -nR * T1 * Math.log(V2 / V1); }
    else { T1 = v.T1; V1 = v.V1; V2 = v.V2; P1 = nR * T1 / V1; P2 = P1 * Math.pow(V1 / V2, 5 / 3); T2 = P2 * V2 / nR; Won = 1.5 * (P2 * V2 - P1 * V1); }
    const dU = 1.5 * nR * (T2 - T1), Q = dU - Won, ib = (opt.sign || 'ap') === 'ib';
    return { P1, V1, T1, P2, V2, T2, Won, Wby: -Won, W: ib ? -Won : Won, dU, Q: Math.abs(Q) < 1e-9 ? 0 : Q, ib };
  },
  dvs(mode, opt){ const ib = (opt.sign || 'ap') === 'ib';
    return [{ id: 'Q', name: 'Heat added to the gas Q', short: 'Q', sym: 'Q', unit: 'J', f: d => d.Q },
      { id: 'W', name: ib ? 'Work done BY the gas W (IB)' : 'Work done ON the gas W (AP)', short: 'W', sym: 'W', unit: 'J', f: d => d.W },
      { id: 'dU', name: 'Change in internal energy ΔU', short: 'ΔU', sym: 'ΔU', unit: 'J', f: d => d.dU },
      { id: 'P2', name: 'Final pressure', short: 'P₂', sym: 'P<sub>2</sub>', unit: 'kPa', f: d => d.P2 },
      { id: 'V2o', name: 'Final volume', short: 'V₂', sym: 'V<sub>2</sub>', unit: 'L', f: d => d.V2 },
      { id: 'T2o', name: 'Final temperature', short: 'T₂', sym: 'T<sub>2</sub>', unit: 'K', f: d => d.T2 }]; },
  work(v, d, mode, opt){
    const ib = d.ib, law = ib ? 'Q = ΔU + W, W = work done <b>by</b> the gas = +PΔV' : 'ΔU = Q + W, W = work done <b>on</b> the gas = −PΔV';
    const st = '<div class="eq">State 1: P = ' + H.n(d.P1, 'kPa') + ', V = ' + H.n(d.V1, 'L') + ', T = ' + H.n(d.T1, 'K') + ' &nbsp;→&nbsp; State 2: P = ' + H.n(d.P2, 'kPa') + ', V = ' + H.n(d.V2, 'L') + ', T = ' + H.n(d.T2, 'K') + '</div>';
    const wLine = mode === 'vol' ? 'V doesn’t change, so <b>W = 0</b>' : mode === 'bar' ? 'W = ' + (ib ? '' : '−') + 'PΔV = ' + (ib ? '' : '−') + '(' + H.iv('P') + ')(' + fnum(d.V2 - d.V1) + ' L) = <b>' + H.n(d.W, 'J') + '</b>' :
      'W = ' + (ib ? '+' : '−') + '(area under the curve) = <b>' + H.n(d.W, 'J') + '</b>' + (mode === 'iso' ? ' <span class="hint">(count squares; exact value uses nRT ln(V₂/V₁), not required)</span>' : '');
    const qLine = mode === 'adi' ? 'Insulated or too fast for heat to flow: <b>Q = 0</b>' : ib ? 'Q = ΔU + W = ' + fnum(d.dU) + ' + ' + H.p(d.W) + ' = <b>' + H.n(d.Q, 'J') + '</b>' : 'Q = ΔU − W = ' + fnum(d.dU) + ' − ' + H.p(d.W) + ' = <b>' + H.n(d.Q, 'J') + '</b>';
    const name = { bar: 'Isobaric (constant pressure)', vol: 'Isovolumetric / isochoric (constant volume)', iso: 'Isothermal (constant temperature)', adi: 'Adiabatic (Q = 0)' }[mode];
    return '<h4>1 · ' + name + ': use PV = nRT for the missing state variables</h4>' + st +
      '<h4>2 · Internal energy depends only on T: ΔU = (3/2)nRΔT</h4><div class="eq">ΔU = 1.5 × ' + H.iv('n') + ' × 8.31 × (' + fnum(d.T2) + ' − ' + fnum(d.T1) + ') = <b>' + H.n(d.dU, 'J') + '</b>' + (mode === 'iso' ? ' (T constant → ΔU = 0)' : '') + '</div>' +
      '<h4>3 · Work: area under the P–V path</h4><div class="eq">' + wLine + '</div>' +
      '<h4>4 · First law: ' + law + '</h4><div class="eq">' + qLine + '</div>' +
      (mode === 'adi' ? '<div class="eq">So ΔU = ' + (ib ? '−W' : 'W') + ': compressing it heats it up (T₂ = ' + H.n(d.T2, 'K') + '), letting it expand cools it. PV<sup>5/3</sup> = constant <span class="hint">(IB HL)</span>.</div>' : '') +
      '<p class="note">' + (ib ? 'IB counts work done BY the gas, so expanding gas has W &gt; 0.' : 'AP counts work done ON the gas, so expanding gas has W &lt; 0.') + ' Same physics, opposite sign for W. Switch the convention to compare.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.s === undefined || A.reset){ A.s = 0; A.p = null; } A.s = (A.s + dt / 3.5) % 1.4; const s = Math.min(1, A.s);
    // state along the path
    let V, P, T; if (mode === 'adi'){ V = d.V1 + (d.V2 - d.V1) * s; P = d.P1 * Math.pow(d.V1 / V, 5 / 3); T = P * V / (v.n * RG); }
    else if (mode === 'iso'){ V = d.V1 + (d.V2 - d.V1) * s; T = d.T1; P = v.n * RG * T / V; } else { T = d.T1 + (d.T2 - d.T1) * s; V = mode === 'bar' ? v.n * RG * T / d.P1 : d.V1; P = v.n * RG * T / V; }
    panelTitle('CYLINDER', 10, 18);
    const cx = 40, cw = 150, bot = 285, Vmax = 6.5, hgt = 20 + 200 * V / Vmax, top = bot - hgt;
    if (mode === 'iso'){ ctx.fillStyle = '#cfe6ff'; ctx.fillRect(cx - 18, 60, cw + 36, bot - 50); text('water bath', cx + cw / 2, bot + 18, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#1546d6' }); }
    ctx.strokeStyle = '#111'; ctx.lineWidth = mode === 'adi' ? 7 : 3; ctx.beginPath(); ctx.moveTo(cx, 40); ctx.lineTo(cx, bot); ctx.lineTo(cx + cw, bot); ctx.lineTo(cx + cw, 40); ctx.stroke();
    if (mode === 'adi') text('insulated', cx + cw + 8, 60, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    ctx.fillStyle = 'rgba(255,106,43,' + (0.08 + 0.25 * Math.min(1, T / 800)) + ')'; ctx.fillRect(cx + 2, top, cw - 4, bot - top);
    ctx.fillStyle = '#555'; ctx.fillRect(cx + 2, top - 12, cw - 4, 12); ctx.fillRect(cx + cw / 2 - 4, top - 40, 8, 28);
    if (mode === 'bar'){ ctx.fillStyle = '#222'; ctx.fillRect(cx + 40, top - 60, 70, 20); text('weights', cx + 75, top - 46, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#fff' }); }
    if (mode === 'vol'){ ctx.fillStyle = '#c43a00'; ctx.fillRect(cx - 10, top - 14, 10, 16); ctx.fillRect(cx + cw, top - 14, 10, 16); text('locked', cx + cw + 12, top - 2, { font: '600 10px "IBM Plex Mono",monospace', col: '#c43a00' }); }
    if (mode === 'adi' || mode === 'iso'){ const dir = d.V2 < d.V1 ? 1 : -1; arrow(cx + cw / 2, top - 70, cx + cw / 2, top - 70 + dir * 24, '#111', d.V2 < d.V1 ? 'push' : 'pull', { w: 3 }); }
    if ((mode === 'bar' || mode === 'vol') && Math.abs(d.T2 - d.T1) > 1){ const hot = d.T2 > d.T1; ctx.fillStyle = hot ? '#ff6a2b' : '#7fc3ff'; for (let i = 0; i < 5; i++){ ctx.beginPath(); ctx.moveTo(cx + 20 + i * 28, bot + 30); ctx.quadraticCurveTo(cx + 30 + i * 28, bot + 6 + 4 * Math.sin(t * 8 + i), cx + 34 + i * 28, bot + 30); ctx.fill(); } text(hot ? 'heating' : 'cooling', cx + cw + 8, bot + 22, { font: '600 10px "IBM Plex Mono",monospace', col: hot ? '#c43a00' : '#1546d6' }); }
    // particles
    if (!A.p){ A.p = []; for (let i = 0; i < 30; i++){ const r = Math.sin(i * 91.3) * 43758.5; A.p.push({ x: (r - Math.floor(r)), y: ((r * 7) - Math.floor(r * 7)), a: i * 2.4 }); } }
    const spd = 0.25 * Math.sqrt(T / 300);
    A.p.forEach(p => { p.x += Math.cos(p.a) * spd * dt; p.y += Math.sin(p.a) * spd * dt; if (p.x < 0 || p.x > 1){ p.a = PI - p.a; p.x = Math.max(0, Math.min(1, p.x)); } if (p.y < 0 || p.y > 1){ p.a = -p.a; p.y = Math.max(0, Math.min(1, p.y)); }
      ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(cx + 8 + p.x * (cw - 16), top + 6 + p.y * (bot - top - 12), 3.5, 0, 7); ctx.fill(); });
    text('P = ' + fplain(P) + ' kPa  V = ' + fplain(V) + ' L  T = ' + fplain(T) + ' K', 12, 322, { font: '700 11px "IBM Plex Mono",monospace' });
    // energy bars
    const bars = [['Q', d.Q, '#c43a00'], ['W', d.W, '#1546d6'], ['ΔU', d.dU, '#1e7d45']], mx = Math.max(1, ...bars.map(b => Math.abs(b[1]))), b0 = 185;
    ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(232, b0); ctx.lineTo(380, b0); ctx.stroke();
    bars.forEach(([l, q, c], i) => { const hh = 95 * q / mx, x = 240 + i * 48; ctx.fillStyle = c; ctx.fillRect(x, Math.min(b0, b0 - hh), 26, Math.abs(hh)); text(l, x + 13, q < 0 ? b0 - 4 : b0 + 14, { align: 'center', font: '700 11px "IBM Plex Mono",monospace' }); text(fplain(q), x + 13, q < 0 ? b0 - hh + 12 : b0 - hh - 4, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); });
    text(d.ib ? 'IB: Q = ΔU + W' : 'AP: ΔU = Q + W', 236, 40, { font: '700 11px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('energy (J)', 236, 54, { font: '500 9px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    // P–V diagram
    panelTitle('P–V DIAGRAM', 395, 18);
    const gx = 415, gy = 290, gw = 170, gh = 245, Vm = 6.5, Pm = Math.max(d.P1, d.P2) * 1.2, X = q => gx + gw * q / Vm, Y = q => gy - gh * q / Pm;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    [d.T1, d.T2].forEach(TT => { ctx.strokeStyle = '#ccc'; ctx.setLineDash([3, 3]); ctx.beginPath(); for (let i = 1; i <= 60; i++){ const q = Vm * i / 60, p = v.n * RG * TT / q; if (p > Pm * 1.2) continue; ctx.lineTo(X(q), Y(p)); } ctx.stroke(); ctx.setLineDash([]); });
    // area under path
    ctx.fillStyle = 'rgba(21,70,214,0.12)'; ctx.beginPath(); ctx.moveTo(X(d.V1), gy); for (let i = 0; i <= 40; i++){ const q = i / 40; let VV, PP; if (mode === 'adi'){ VV = d.V1 + (d.V2 - d.V1) * q; PP = d.P1 * Math.pow(d.V1 / VV, 5 / 3); } else if (mode === 'iso'){ VV = d.V1 + (d.V2 - d.V1) * q; PP = v.n * RG * d.T1 / VV; } else { VV = d.V1 + (d.V2 - d.V1) * q; PP = d.P1 + (d.P2 - d.P1) * q; } ctx.lineTo(X(VV), Y(PP)); } ctx.lineTo(X(d.V2), gy); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 40; i++){ const q = i / 40; let VV, PP; if (mode === 'adi'){ VV = d.V1 + (d.V2 - d.V1) * q; PP = d.P1 * Math.pow(d.V1 / VV, 5 / 3); } else if (mode === 'iso'){ VV = d.V1 + (d.V2 - d.V1) * q; PP = v.n * RG * d.T1 / VV; } else { VV = d.V1 + (d.V2 - d.V1) * q; PP = d.P1 + (d.P2 - d.P1) * q; } i ? ctx.lineTo(X(VV), Y(PP)) : ctx.moveTo(X(VV), Y(PP)); } ctx.stroke();
    text('1', X(d.V1) - 10, Y(d.P1) - 4, { font: '700 11px "IBM Plex Mono",monospace' }); text('2', X(d.V2) + 4, Y(d.P2) - 4, { font: '700 11px "IBM Plex Mono",monospace' });
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(V), Y(P), 5, 0, 7); ctx.fill();
    text('V (L)', gx + gw, gy + 13, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('P (kPa)', gx + 4, gy - gh - 2, { font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text(fplain(Pm), gx - 3, gy - gh + 8, { align: 'right', font: '500 8px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
