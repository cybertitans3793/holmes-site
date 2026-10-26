// Propagating Uncertainties (IB Tool 3): add/subtract → add absolute; multiply/divide → add fractional; powers → multiply by n. Worked example: density of a cube.
const SIM = {
  title: 'Propagating Uncertainties',
  modes: [{ id: 'add', label: 'Add / subtract' }, { id: 'mult', label: 'Multiply / divide' }, { id: 'power', label: 'Powers' }, { id: 'cube', label: 'Example: density' }],
  opts: [{ id: 'op', label: 'Operation', modes: ['add'], choices: [['a', 'A + B'], ['b', 'A − B']] }, { id: 'op', label: 'Operation', modes: ['mult'], choices: [['a', 'A × B'], ['b', 'A ÷ B']] }],
  ivs(mode){
    if (mode === 'power') return [{ id: 'A', sym: 'A', symText: 'A', label: 'A', unit: '', min: 0.5, max: 10, step: 0.1, val: 4 }, { id: 'dA', sym: 'ΔA', symText: 'ΔA', label: 'ΔA', unit: '', min: 0, max: 1, step: 0.01, val: 0.1 }, { id: 'n', sym: 'n', symText: 'n', label: 'Power n (A to the n)', unit: '', min: -3, max: 3, step: 0.5, val: 2, graph: true, show: x => x.toFixed(1) }];
    if (mode === 'cube') return [{ id: 'm', sym: 'm', symText: 'm', label: 'Mass', unit: 'g', min: 10, max: 500, step: 1, val: 216 }, { id: 'dm', sym: 'Δm', symText: 'Δm', label: 'Δm', unit: 'g', min: 0, max: 5, step: 0.1, val: 1 }, { id: 'L', sym: 'L', symText: 'L', label: 'Side length', unit: 'cm', min: 1, max: 10, step: 0.05, val: 3 }, { id: 'dL', sym: 'ΔL', symText: 'ΔL', label: 'ΔL', unit: 'cm', min: 0, max: 0.3, step: 0.01, val: 0.05, graph: true }];
    return [{ id: 'A', sym: 'A', symText: 'A', label: 'A', unit: '', min: 1, max: 20, step: 0.1, val: 12 }, { id: 'dA', sym: 'ΔA', symText: 'ΔA', label: 'ΔA', unit: '', min: 0, max: 2, step: 0.05, val: 0.5, graph: true }, { id: 'B', sym: 'B', symText: 'B', label: 'B', unit: '', min: 1, max: 20, step: 0.1, val: 8 }, { id: 'dB', sym: 'ΔB', symText: 'ΔB', label: 'ΔB', unit: '', min: 0, max: 2, step: 0.05, val: 0.3 }];
  },
  presets: [{ label: 'Nearly equal values (subtract)', mode: 'add', v: { A: 10.2, B: 9.8, dA: 0.2, dB: 0.2 } }, { label: 'Measure L more carefully', mode: 'cube', v: { dL: 0.01 } }],
  calc(v, mode, opt){
    const o = opt.op || 'a';
    if (mode === 'add'){ const R = o === 'a' ? v.A + v.B : v.A - v.B, dR = v.dA + v.dB; return { R, dR, pct: 100 * dR / Math.abs(R || 1e-9), fA: v.dA / v.A, fB: v.dB / v.B, sym: o === 'a' ? '+' : '−' }; }
    if (mode === 'mult'){ const R = o === 'a' ? v.A * v.B : v.A / v.B, f = v.dA / v.A + v.dB / v.B; return { R, dR: f * R, pct: 100 * f, fA: v.dA / v.A, fB: v.dB / v.B, sym: o === 'a' ? '×' : '÷' }; }
    if (mode === 'power'){ const R = Math.pow(v.A, v.n), f = Math.abs(v.n) * v.dA / v.A; return { R, dR: f * Math.abs(R), pct: 100 * f, fA: v.dA / v.A }; }
    const V = v.L ** 3, rho = v.m / V, fm = v.dm / v.m, fL = v.dL / v.L, f = fm + 3 * fL; return { V, R: rho, dR: f * rho, pct: 100 * f, fm, fL, partM: 100 * fm, partL: 300 * fL };
  },
  dvs(){ return [{ id: 'dR', name: 'Absolute uncertainty of the result', short: 'ΔR', sym: 'ΔR', unit: '', f: d => d.dR }, { id: 'pct', name: 'Percentage uncertainty of the result', short: '%', sym: '%ΔR', unit: '%', f: d => d.pct }]; },
  work(v, d, mode, opt){
    const f = x => fnum(x);
    if (mode === 'add') return '<h4>1 · Adding or subtracting: add the <b>absolute</b> uncertainties</h4><div class="eq">R = A ' + d.sym + ' B = ' + H.iv('A') + ' ' + d.sym + ' ' + H.iv('B') + ' = ' + H.n(d.R) + '</div>' +
      '<div class="eq">ΔR = ΔA + ΔB = ' + H.iv('dA') + ' + ' + H.iv('dB') + ' = <b>' + H.n(d.dR) + '</b> → R = ' + f(d.R) + ' ± ' + f(d.dR) + ' (' + H.n(d.pct, '%') + ')</div>' +
      '<p class="note">Always add, even when subtracting: the worst case is one value too high and the other too low.</p>' +
      (d.sym === '−' ? '<p class="note">Subtracting two nearly equal values gives a small result with the same absolute uncertainty: a huge percentage uncertainty. Try the preset.</p>' : '');
    if (mode === 'mult') return '<h4>1 · Multiplying or dividing: add the <b>fractional</b> (or percentage) uncertainties</h4><div class="eq">ΔA/A = ' + H.n(d.fA * 100, '%') + ', ΔB/B = ' + H.n(d.fB * 100, '%') + '</div>' +
      '<div class="eq">R = A ' + d.sym + ' B = ' + H.n(d.R) + ', ΔR/R = ' + H.n(d.fA * 100, '%') + ' + ' + H.n(d.fB * 100, '%') + ' = <b>' + H.n(d.pct, '%') + '</b></div>' +
      '<div class="eq">ΔR = ' + H.n(d.pct / 100) + ' × ' + H.n(d.R) + ' = <b>' + H.n(d.dR) + '</b> → R = ' + f(d.R) + ' ± ' + f(d.dR) + '</div>' +
      '<p class="note">Dividing also adds the percentages, never subtracts them.</p>';
    if (mode === 'power') return '<h4>1 · Powers: multiply the fractional uncertainty by |n|</h4><div class="eq">R = A<sup>n</sup> = ' + H.iv('A') + '<sup>' + f(v.n) + '</sup> = ' + H.n(d.R) + '</div>' +
      '<div class="eq">ΔR/R = |n|·ΔA/A = ' + f(Math.abs(v.n)) + ' × ' + H.n(d.fA * 100, '%') + ' = <b>' + H.n(d.pct, '%') + '</b> → ΔR = ' + H.n(d.dR) + '</div>' +
      '<p class="note">Square roots halve the percentage uncertainty (n = ½); squaring doubles it. For example, if T has a 2% uncertainty, T² has 4%.</p>';
    return '<h4>1 · Density of a cube: ρ = m/L³</h4><div class="eq">V = L³ = (' + H.iv('L') + ')³ = ' + H.n(d.V, 'cm³') + ' → ρ = ' + H.iv('m') + ' / ' + H.n(d.V) + ' = <b>' + H.n(d.R, 'g/cm³') + '</b></div>' +
      '<h4>2 · Percentages: mass once, length three times (it’s cubed)</h4><div class="eq">Δρ/ρ = Δm/m + 3ΔL/L = ' + H.n(d.partM, '%') + ' + 3(' + H.n(d.fL * 100, '%') + ') = <b>' + H.n(d.pct, '%') + '</b></div>' +
      '<div class="eq">ρ = (' + f(d.R) + ' ± ' + f(d.dR) + ') g/cm³</div>' +
      '<p class="note">Which measurement should you improve? The bar chart shows where the uncertainty comes from: here the cubed length dominates (' + H.n(d.partL, '%') + ' vs ' + H.n(d.partM, '%') + ').</p>';
  },
  draw(v, d, mode){
    panelTitle('VALUES WITH THEIR UNCERTAINTY RANGES', 10, 18);
    const items = mode === 'cube' ? [['m (g)', v.m, v.dm], ['L (cm)', v.L, v.dL], ['ρ (g/cm³)', d.R, d.dR]] : mode === 'power' ? [['A', v.A, v.dA], ['R', d.R, d.dR]] : [['A', v.A, v.dA], ['B', v.B, v.dB], ['R', d.R, d.dR]];
    items.forEach(([l, x, dx], i) => { const y = 70 + i * 70, lo = x - dx, hi = x + dx, span = Math.max(Math.abs(x) * 1.6, 1e-6), X = q => 60 + 300 * (q - (x - span / 2)) / span;
      ctx.fillStyle = 'rgba(21,70,214,0.18)'; ctx.fillRect(X(lo), y - 12, X(hi) - X(lo), 24); ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(lo), y); ctx.lineTo(X(hi), y); ctx.moveTo(X(lo), y - 10); ctx.lineTo(X(lo), y + 10); ctx.moveTo(X(hi), y - 10); ctx.lineTo(X(hi), y + 10); ctx.stroke();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(x), y, 4, 0, 7); ctx.fill();
      text(l, 50, y + 4, { align: 'right', font: '700 12px "IBM Plex Mono",monospace' }); text(fplain(x) + ' ± ' + fplain(dx) + '  (' + fplain(100 * dx / Math.abs(x || 1)) + '%)', 210, y - 18, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); });
    text('each bar is drawn on its own scale, centered on its value', 12, 318, { font: '500 9px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    panelTitle('SOURCES OF UNCERTAINTY', 395, 18);
    const parts = mode === 'cube' ? [['Δm/m', d.partM, '#1546d6'], ['3ΔL/L', d.partL, '#ff6a2b']] : mode === 'power' ? [['|n|ΔA/A', d.pct, '#ff6a2b']] : mode === 'mult' ? [['ΔA/A', 100 * d.fA, '#1546d6'], ['ΔB/B', 100 * d.fB, '#ff6a2b']] : [['ΔA', v.dA, '#1546d6'], ['ΔB', v.dB, '#ff6a2b']];
    const tot = parts.reduce((a, p) => a + p[1], 0) || 1; let x0 = 400;
    parts.forEach(([l, q, c]) => { const w = 180 * q / tot; ctx.fillStyle = c; ctx.fillRect(x0, 50, w, 24); if (w > 30) text(l, x0 + w / 2, 66, { align: 'center', font: '700 10px "IBM Plex Mono",monospace', col: '#fff' }); x0 += w; });
    text(mode === 'add' ? 'absolute ΔR = ' + fplain(d.dR) : 'total ' + fplain(d.pct) + '%', 400, 100, { font: '700 12px "IBM Plex Mono",monospace' });
  }
};
