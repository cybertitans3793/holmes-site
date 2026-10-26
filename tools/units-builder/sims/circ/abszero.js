// Finding Absolute Zero (AP 9.2, IB B.3 empirical gas laws): constant-volume P vs T, constant-pressure V vs T, Boyle's law P vs V and P vs 1/V. Extrapolate to zero.
function rnd(i){ const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
const BATHS = [[-78, 'dry ice'], [0, 'ice water'], [22, 'room'], [50, 'warm water'], [100, 'boiling']];
function lsq(xs, ys){ const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; const m = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0); return { m, b: my - m * mx }; }
const SIM = {
  title: 'Finding Absolute Zero',
  hint: '0 K = −273 °C',
  modes: [{ id: 'press', label: 'Constant volume (P vs T)' }, { id: 'vol', label: 'Constant pressure (V vs T)' }, { id: 'boyle', label: 'Constant T (Boyle)' }],
  opts: [{ id: 'plot', label: 'Plot P against', modes: ['boyle'], choices: [['V', 'V'], ['inv', '1/V']] }],
  ivs(mode){
    if (mode === 'boyle') return [
      { id: 'C', sym: 'PV', symText: 'PV', label: 'Amount of gas (sets PV)', unit: 'kPa·mL', min: 1000, max: 6000, step: 100, val: 3000 },
      { id: 'sc', sym: 'σ', symText: 'σ', label: 'Random scatter', unit: '%', min: 0, max: 5, step: 0.5, val: 1, graph: true },
      { id: 'dead', sym: 'V<sub>tube</sub>', symText: 'Vtube', label: 'Gas hidden in the tubing (not on the scale)', unit: 'mL', min: 0, max: 10, step: 0.5, val: 0 }];
    return [
      { id: 'X0', sym: mode === 'press' ? 'P<sub>0</sub>' : 'V<sub>0</sub>', symText: mode === 'press' ? 'P0' : 'V0', label: mode === 'press' ? 'Pressure at 0 °C' : 'Volume at 0 °C', unit: mode === 'press' ? 'kPa' : 'mL', min: mode === 'press' ? 60 : 20, max: mode === 'press' ? 140 : 60, step: 1, val: mode === 'press' ? 100 : 40 },
      { id: 'sc', sym: 'σ', symText: 'σ', label: 'Random scatter', unit: '%', min: 0, max: 5, step: 0.5, val: 1 },
      { id: 'off', sym: 'offset', symText: 'offset', label: mode === 'press' ? 'Gauge zero error' : 'Syringe reading offset', unit: mode === 'press' ? 'kPa' : 'mL', min: -10, max: 10, step: 0.5, val: 0, graph: true }];
  },
  presets: [{ label: 'Gauge zero error', mode: 'press', v: { off: 8 } }, { label: 'Messy data', mode: 'press', v: { sc: 4 } }, { label: 'Leaky tubing', mode: 'boyle', v: { dead: 8 } }],
  calc(v, mode, opt){
    if (mode === 'boyle'){
      const Vs = [10, 15, 20, 25, 30, 40, 50], pts = Vs.map((V, i) => ({ V, P: v.C / (V + v.dead) * (1 + v.sc / 100 * (2 * rnd(i + 7) - 1)) }));
      const xs = pts.map(p => (opt.plot || 'V') === 'inv' ? 1 / p.V : p.V), ys = pts.map(p => p.P), f = lsq(pts.map(p => 1 / p.V), ys);
      return { pts, xs, ys, m: f.m, b: f.b, PVs: pts.map(p => p.P * p.V) };
    }
    const T0 = 273;
    const pts = BATHS.map(([T, nm], i) => ({ T, nm, y: v.X0 * (T + T0) / T0 * (1 + v.sc / 100 * (2 * rnd(i + 3) - 1)) + v.off }));
    const f = lsq(pts.map(p => p.T), pts.map(p => p.y)), zero = -f.b / f.m;
    return { pts, m: f.m, b: f.b, zero, err: zero + 273 };
  },
  dvs(mode){
    if (mode === 'boyle') return [{ id: 'b', name: 'Intercept of P vs 1/V (should be 0)', short: 'b', sym: 'b', unit: 'kPa', f: d => d.b }, { id: 'm', name: 'Gradient of P vs 1/V (= PV)', short: 'm', sym: 'm', unit: 'kPa·mL', f: d => d.m }];
    return [{ id: 'zero', name: 'Extrapolated absolute zero', short: 'T₀', sym: 'T<sub>0</sub>', unit: '°C', f: d => d.zero }, { id: 'err', name: 'Error vs −273 °C', short: 'error', sym: 'error', unit: '°C', f: d => d.err }, { id: 'm', name: 'Gradient', short: 'm', sym: 'm', unit: '', f: d => d.m }];
  },
  work(v, d, mode, opt){
    if (mode === 'boyle'){ const inv = (opt.plot || 'V') === 'inv';
      return '<h4>1 · Constant T and n: P = (constant)/V</h4><div class="eq">PV values from the data: ' + d.PVs.map(x => fnum(x)).join(', ') + ' kPa·mL. Nearly constant.</div>' +
        '<h4>2 · ' + (inv ? 'P vs 1/V is a straight line through the origin' : 'P vs V is a curve (a hyperbola)') + '</h4><div class="eq">' + (inv ? 'Gradient = PV = <b>' + H.n(d.m, 'kPa·mL') + '</b>, intercept = ' + H.n(d.b, 'kPa') : 'Hard to test by eye. Switch to 1/V to straighten it.') + '</div>' +
        (v.dead ? '<div class="bad">Gas hidden in the tubing isn’t counted in V. P vs 1/V curves and misses the origin: a systematic error.</div>' : '') +
        '<p class="note">IB: gas laws are limited to constant P, V or T and the ideal gas law. AP: be ready to linearize and read PV from the gradient.</p>'; }
    const isP = mode === 'press', q = isP ? 'P' : 'V', u = isP ? 'kPa' : 'mL';
    return '<h4>1 · ' + (isP ? 'Sealed flask, fixed volume, in baths of different temperature' : 'Gas syringe at constant pressure in different baths') + '</h4><div class="eq">' + d.pts.map(p => p.T + ' °C → ' + fnum(p.y) + ' ' + u).join(' · ') + '</div>' +
      '<h4>2 · Fit a straight line: ' + q + ' = m T + b</h4><div class="eq">m = ' + H.n(d.m, u + '/°C') + ', b = ' + H.n(d.b, u) + '</div>' +
      '<h4>3 · Extrapolate to ' + q + ' = 0</h4><div class="eq">0 = mT₀ + b → T₀ = −b/m = <b>' + H.n(d.zero, '°C') + '</b> (accepted −273 °C)</div>' +
      (v.off ? '<div class="bad">A zero error shifts every reading by the same amount. The gradient barely changes, but the intercept moves, so T₀ is off by ' + fnum(d.err) + ' °C. This is a systematic error.</div>' : '') +
      '<p class="note">Every gas, any amount, extrapolates to the same −273 °C. That’s why we define the Kelvin scale from there: ' + q + ' ∝ T(K).</p>';
  },
  draw(v, d, mode, opt){
    panelTitle(mode === 'boyle' ? 'SYRINGE + PRESSURE GAUGE' : mode === 'press' ? 'SEALED FLASK + GAUGE' : 'GAS SYRINGE', 10, 18);
    // apparatus (simple)
    ctx.fillStyle = '#cfe6ff'; ctx.fillRect(20, 170, 140, 110); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(20, 170, 140, 110);
    if (mode === 'press'){ ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(90, 220, 34, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillRect(86, 120, 8, 66); ctx.strokeRect(86, 120, 8, 66); ctx.beginPath(); ctx.arc(90, 100, 22, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(90, 100); ctx.lineTo(102, 88); ctx.stroke(); text('kPa', 90, 75, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); }
    else { ctx.fillStyle = '#fff'; ctx.fillRect(40, 200, 100, 30); ctx.strokeRect(40, 200, 100, 30); ctx.fillStyle = '#111'; ctx.fillRect(100, 198, 4, 34); ctx.fillRect(104, 213, 40, 4); if (mode === 'boyle'){ ctx.strokeRect(20, 60, 0, 0); ctx.beginPath(); ctx.arc(60, 110, 22, 0, 7); ctx.stroke(); ctx.fillRect(58, 132, 4, 68); } }
    text(mode === 'boyle' ? 'room temperature' : 'bath', 90, 296, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // graph
    const gx = 220, gy = 280, gw = 360, gh = 230;
    let xs, ys, xmin, xmax, ymax, xl, yl, fitLine;
    if (mode === 'boyle'){ const inv = (opt.plot || 'V') === 'inv'; xs = d.xs; ys = d.ys; xmin = 0; xmax = Math.max(...xs) * 1.1; ymax = Math.max(...ys) * 1.15; xl = inv ? '1/V (1/mL)' : 'V (mL)'; yl = 'P (kPa)';
      fitLine = inv ? (x => d.m * x + d.b) : (x => d.m / x + d.b); }
    else { xs = d.pts.map(p => p.T); ys = d.pts.map(p => p.y); xmin = -300; xmax = 120; ymax = Math.max(...ys) * 1.15; xl = 'T (°C)'; yl = mode === 'press' ? 'P (kPa)' : 'V (mL)'; fitLine = x => d.m * x + d.b; }
    const ymin = Math.min(0, ...ys.map(y => y * 1.1), mode === 'boyle' ? 0 : d.b + d.m * xmin);
    const X = x => gx + gw * (x - xmin) / (xmax - xmin), Y = y => gy - gh * (y - ymin) / (ymax - ymin);
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; if (mode !== 'boyle') for (let t = -300; t <= 100; t += 50){ ctx.beginPath(); ctx.moveTo(X(t), gy - gh); ctx.lineTo(X(t), gy); ctx.stroke(); text(String(t), X(t), gy + 13, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(xmin), Y(0)); ctx.lineTo(X(xmax), Y(0)); ctx.stroke(); const ax = mode === 'boyle' ? X(0) : X(0); ctx.beginPath(); ctx.moveTo(ax, gy - gh); ctx.lineTo(ax, gy); ctx.stroke();
    // fit
    ctx.save(); ctx.beginPath(); ctx.rect(gx, gy - gh, gw, gh); ctx.clip();
    ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 100; i++){ const x = (mode === 'boyle' ? Math.max(xmax / 200, xmin) : xmin) + (xmax - (mode === 'boyle' ? xmax / 200 : xmin)) * i / 100; const y = fitLine(x); i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); } ctx.stroke();
    if (mode !== 'boyle'){ ctx.setLineDash([5, 4]); ctx.strokeStyle = '#c43a00'; ctx.beginPath(); ctx.moveTo(X(d.zero), Y(0) - 30); ctx.lineTo(X(d.zero), Y(0) + 6); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(X(d.zero), Y(0), 5, 0, 7); ctx.fill(); }
    ctx.restore();
    xs.forEach((x, i) => { ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(X(x), Y(ys[i]), 5, 0, 7); ctx.fill(); });
    text(xl, gx + gw, gy + 26, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(yl, ax + 4, gy - gh + 10, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    if (mode !== 'boyle') text('T₀ = ' + fplain(d.zero) + ' °C', Math.max(gx + 4, X(d.zero) - 30), Y(0) - 36, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' });
    panelTitle(mode === 'boyle' ? 'GRAPH' : 'GRAPH: EXTRAPOLATE TO ZERO', 220, 18);
  }
};
