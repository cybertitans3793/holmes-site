// P–V Cycles & the First Law (AP 9.4 FRQ staple; IB HL B.4 heat engines): leg-by-leg Q, W, ΔU table, net work = enclosed area, efficiency and the Carnot limit.
const RG = 8.31;
function legs(v, mode){
  const n = v.n, T = (P, V) => P * V / (n * RG);
  let pts, kinds;
  if (mode === 'rect'){ pts = [[v.V1, v.Ph], [v.V2, v.Ph], [v.V2, v.Pl], [v.V1, v.Pl]]; kinds = ['isobaric', 'isochoric', 'isobaric', 'isochoric']; }
  else if (mode === 'tri'){ pts = [[v.V1, v.Pl], [v.V1, v.Ph], [v.V2, v.Pl]]; kinds = ['isochoric', 'straight line', 'isobaric']; }
  else { const VC = v.V1 * v.Ph / v.Pl; pts = [[v.V1, v.Pl], [v.V1, v.Ph], [VC, v.Pl]]; kinds = ['isochoric', 'isothermal', 'isobaric']; }
  const N = pts.length, out = [];
  for (let i = 0; i < N; i++){
    const a = pts[i], b = pts[(i + 1) % N], k = kinds[i];
    let Wby; if (k === 'isothermal') Wby = a[0] * a[1] * Math.log(b[0] / a[0]); else Wby = 0.5 * (a[1] + b[1]) * (b[0] - a[0]);
    const dU = 1.5 * (b[0] * b[1] - a[0] * a[1]); out.push({ from: String.fromCharCode(65 + i), to: String.fromCharCode(65 + (i + 1) % N), a, b, k, Wby, Won: -Wby, dU, Q: dU + Wby, Ta: T(a[1], a[0]), Tb: T(b[1], b[0]) });
  }
  return out;
}
function rev(L){ return L.slice().reverse().map(g => ({ from: g.to, to: g.from, a: g.b, b: g.a, k: g.k, Wby: -g.Wby, Won: g.Wby, dU: -g.dU, Q: -g.Q, Ta: g.Tb, Tb: g.Ta })); }
function pathPt(g, q){ if (g.k === 'isothermal'){ const V = g.a[0] + (g.b[0] - g.a[0]) * q; return [V, g.a[0] * g.a[1] / V]; } return [g.a[0] + (g.b[0] - g.a[0]) * q, g.a[1] + (g.b[1] - g.a[1]) * q]; }
const SIM = {
  title: 'P–V Cycles',
  hint: 'kPa × L = J · monatomic ideal gas · R = 8.31',
  modes: [{ id: 'rect', label: 'Rectangle' }, { id: 'tri', label: 'Triangle' }, { id: 'ap', label: 'Isochoric → isothermal → isobaric' }],
  opts: [{ id: 'dir', label: 'Direction', choices: [['cw', 'Clockwise (engine)'], ['ccw', 'Counter-clockwise (fridge)']] }, { id: 'sign', label: 'Sign convention', choices: [['ap', 'AP'], ['ib', 'IB']] }],
  ivs(mode){ return [
    { id: 'n', sym: 'n', symText: 'n', label: 'Amount of gas', unit: 'mol', min: 0.05, max: 0.5, step: 0.01, val: 0.2 },
    { id: 'Ph', sym: 'P<sub>high</sub>', symText: 'Ph', label: 'High pressure', unit: 'kPa', min: 150, max: 500, step: 5, val: 300, graph: true },
    { id: 'Pl', sym: 'P<sub>low</sub>', symText: 'Pl', label: 'Low pressure', unit: 'kPa', min: 50, max: 140, step: 5, val: 100 },
    { id: 'V1', sym: 'V<sub>1</sub>', symText: 'V1', label: 'Small volume', unit: 'L', min: 0.5, max: 2, step: 0.1, val: 1 }].concat(mode === 'ap' ? [] : [
    { id: 'V2', sym: 'V<sub>2</sub>', symText: 'V2', label: 'Large volume', unit: 'L', min: 2.2, max: 5, step: 0.1, val: 3 }]); },
  presets: [{ label: 'Tall and thin', mode: 'rect', v: { Ph: 500, V2: 2.4 } }, { label: 'Small pressure ratio', v: { Ph: 150 } }],
  calc(v, mode, opt){
    let L = legs(v, mode); if ((opt.dir || 'cw') === 'ccw') L = rev(L);
    const Wnet = L.reduce((a, g) => a + g.Wby, 0), Qin = L.reduce((a, g) => a + Math.max(0, g.Q), 0), Qout = L.reduce((a, g) => a + Math.min(0, g.Q), 0);
    const Ts = L.flatMap(g => [g.Ta, g.Tb]), Th = Math.max(...Ts), Tc = Math.min(...Ts);
    return { L, Wnet, Qin, Qout, eff: Wnet > 0 ? Wnet / Qin : NaN, carnot: 1 - Tc / Th, Th, Tc, ib: (opt.sign || 'ap') === 'ib', sumU: L.reduce((a, g) => a + g.dU, 0) };
  },
  dvs(){ return [{ id: 'Wnet', name: 'Net work done BY the gas per cycle', short: 'W_net', sym: 'W<sub>net,by</sub>', unit: 'J', f: d => d.Wnet },
    { id: 'eff', name: 'Efficiency (engine only)', short: 'η', sym: 'η', unit: '', f: d => d.eff, vs: 'carnot' }, { id: 'carnot', name: 'Carnot limit 1 − Tc/Th', short: 'η_Carnot', sym: 'η<sub>C</sub>', unit: '', f: d => d.carnot },
    { id: 'Qin', name: 'Heat taken in per cycle', short: 'Q_in', sym: 'Q<sub>in</sub>', unit: 'J', f: d => d.Qin }]; },
  work(v, d, mode, opt){
    const W = g => d.ib ? g.Wby : g.Won, td = 'style="padding:2px 6px;border-bottom:1px solid #ddd;text-align:right"';
    const rows = d.L.map(g => '<tr><td ' + td.replace('right', 'left') + '><b>' + g.from + '→' + g.to + '</b> ' + g.k + '</td><td ' + td + '>' + fnum(W(g)) + '</td><td ' + td + '>' + fnum(g.dU) + '</td><td ' + td + '><b>' + fnum(g.Q) + '</b></td></tr>').join('');
    return '<h4>1 · Each leg: W from the area, ΔU from (3/2)Δ(PV), then Q from the first law</h4>' +
      '<div class="eq">' + (d.ib ? 'IB: W = work BY the gas = +area when V grows; Q = ΔU + W' : 'AP: W = work ON the gas = −area when V grows; ΔU = Q + W → Q = ΔU − W') + '</div>' +
      '<table style="border-collapse:collapse;font:500 13px \'IBM Plex Mono\',monospace;margin:6px 0"><tr><th style="text-align:left;padding:2px 6px">leg</th><th style="padding:2px 6px">W (J)</th><th style="padding:2px 6px">ΔU (J)</th><th style="padding:2px 6px">Q (J)</th></tr>' + rows + '</table>' +
      '<h4>2 · Around the whole cycle</h4><div class="eq">ΣΔU = ' + fnum(Math.abs(d.sumU) < 1e-6 ? 0 : d.sumU) + ' J (back to the start, same T) → net Q = net work by the gas = enclosed area = <b>' + H.n(d.Wnet, 'J') + '</b></div>' +
      ((opt.dir || 'cw') === 'cw' ? '<h4>3 · <span style="color:#7a3fb0">IB HL</span> Engine efficiency</h4><div class="eq">η = W<sub>net</sub>/Q<sub>in</sub> = ' + fnum(d.Wnet) + '/' + fnum(d.Qin) + ' = <b>' + H.n(100 * d.eff, '%') + '</b></div>' +
        '<div class="eq">Carnot limit between T<sub>h</sub> = ' + H.n(d.Th, 'K') + ' and T<sub>c</sub> = ' + H.n(d.Tc, 'K') + ': 1 − T<sub>c</sub>/T<sub>h</sub> = ' + H.n(100 * d.carnot, '%') + '. A real cycle always does worse.</div>'
        : '<h4>3 · Counter-clockwise: net work is done ON the gas</h4><div class="eq">Heat is taken in at low T and dumped at high T: a refrigerator or heat pump. That needs work input (second law).</div>') +
      '<p class="note">Find which legs take heat in: Q &gt; 0. On a P–V diagram, T rises as you move up and to the right (T ∝ PV).</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.s === undefined || A.reset) A.s = 0; A.s = (A.s + dt / 2.2) % d.L.length; const li = Math.floor(A.s), q = A.s - li, g = d.L[li];
    panelTitle('P–V DIAGRAM', 10, 18);
    const gx = 50, gy = 300, gw = 320, gh = 260, Vm = Math.max(...d.L.map(g => Math.max(g.a[0], g.b[0]))) * 1.15, Pm = Math.max(...d.L.map(g => Math.max(g.a[1], g.b[1]))) * 1.15, X = x => gx + gw * x / Vm, Y = y => gy - gh * y / Pm;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    // enclosed area
    ctx.fillStyle = (opt.dir || 'cw') === 'cw' ? 'rgba(30,125,69,0.15)' : 'rgba(196,58,0,0.12)'; ctx.beginPath(); d.L.forEach((G, i) => { for (let k = 0; k <= 30; k++){ const p = pathPt(G, k / 30); (i || k) ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])); } }); ctx.closePath(); ctx.fill();
    const cols = ['#c43a00', '#1546d6', '#7a3fb0', '#1e7d45'];
    d.L.forEach((G, i) => { ctx.strokeStyle = cols[i % 4]; ctx.lineWidth = i === li ? 4.5 : 2.5; ctx.beginPath(); for (let k = 0; k <= 30; k++){ const p = pathPt(G, k / 30); k ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])); } ctx.stroke();
      const m = pathPt(G, 0.5), m2 = pathPt(G, 0.56); arrow(X(m[0]), Y(m[1]), X(m2[0]), Y(m2[1]), cols[i % 4], null, { w: 2, head: 9 });
      text(G.from, X(G.a[0]) + (G.a[0] > Vm / 2.3 ? 6 : -14), Y(G.a[1]) + (G.a[1] > Pm / 2.3 ? -6 : 16), { font: '700 14px "Space Grotesk",sans-serif' }); });
    const p = pathPt(g, q); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 6, 0, 7); ctx.fill();
    for (let k = 1; k <= 4; k++){ const V = Vm * k / 4.6; text(fplain(V), X(V), gy + 14, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
    for (let k = 1; k <= 4; k++){ const P = Pm * k / 4.6; text(fplain(P), gx - 4, Y(P) + 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
    text('V (L)', gx + gw, gy + 28, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('P (kPa)', gx + 4, gy - gh - 6, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // current leg bars
    panelTitle('LEG ' + g.from + '→' + g.to + ' (' + g.k + ')', 395, 18);
    const Wv = d.ib ? g.Wby : g.Won, bars = [['Q', g.Q, '#c43a00'], ['W', Wv, '#1546d6'], ['ΔU', g.dU, '#1e7d45']], mx = Math.max(1, ...d.L.flatMap(G => [Math.abs(G.Q), Math.abs(G.Wby), Math.abs(G.dU)])), b0 = 130;
    ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(400, b0); ctx.lineTo(585, b0); ctx.stroke();
    bars.forEach(([l, val, c], i) => { const hh = 80 * val / mx, x = 415 + i * 58; ctx.fillStyle = c; ctx.fillRect(x, Math.min(b0, b0 - hh), 34, Math.abs(hh)); text(l, x + 17, val < 0 ? b0 - 4 : b0 + 14, { align: 'center', font: '700 12px "IBM Plex Mono",monospace' }); text(fplain(val), x + 17, val < 0 ? b0 - hh + 12 : b0 - hh - 4, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); });
    text(d.ib ? 'IB: W by gas' : 'AP: W on gas', 400, 236, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('net work by gas: ' + fplain(d.Wnet) + ' J', 400, 262, { font: '700 13px "Space Grotesk",sans-serif' });
    if ((opt.dir || 'cw') === 'cw') text('η = ' + fplain(100 * d.eff) + '%  (Carnot ' + fplain(100 * d.carnot) + '%)', 400, 284, { font: '700 13px "Space Grotesk",sans-serif', col: '#1e7d45' });
    else text('fridge / heat pump', 400, 284, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' });
  }
};
