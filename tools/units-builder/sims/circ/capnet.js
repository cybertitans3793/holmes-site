// Capacitors in Series and Parallel (AP 11.7 / 03-7): two capacitors and a battery. C_eq, the charge and the voltage on each. Original.
//@include _schem.js
const fnu = x => fnum(x);
const SIM = {
  title: 'Capacitors in Series & Parallel',
  hint: 'parallel: C_eq = C₁ + C₂ · series: 1/C_eq = 1/C₁ + 1/C₂ · Q = CΔV',
  modes: [{ id: 'par', label: 'Parallel' }, { id: 'ser', label: 'Series' }],
  ivs(){ return [
    { id: 'E', sym: 'ΔV', symText: 'dV', label: 'Battery', unit: 'V', min: 1, max: 24, step: 0.5, val: 12 },
    { id: 'C1', sym: 'C<sub>1</sub>', symText: 'C1', label: 'Capacitor 1', unit: 'μF', min: 1, max: 20, step: 1, val: 2, graph: true },
    { id: 'C2', sym: 'C<sub>2</sub>', symText: 'C2', label: 'Capacitor 2', unit: 'μF', min: 1, max: 20, step: 1, val: 6 }]; },
  presets: [{ label: 'Equal capacitors', v: { C1: 4, C2: 4 } }, { label: 'One much bigger', v: { C1: 1, C2: 20 } }],
  calc(v, mode){
    const C1 = v.C1 * 1e-6, C2 = v.C2 * 1e-6;
    if (mode === 'par'){ const Ceq = C1 + C2; return { Ceq, Q: Ceq * v.E, Q1: C1 * v.E, Q2: C2 * v.E, V1: v.E, V2: v.E, U: 0.5 * Ceq * v.E * v.E }; }
    const Ceq = 1 / (1 / C1 + 1 / C2), Q = Ceq * v.E; return { Ceq, Q, Q1: Q, Q2: Q, V1: Q / C1, V2: Q / C2, U: 0.5 * Ceq * v.E * v.E };
  },
  dvs(){ return [{ id: 'Ceq', name: 'Equivalent capacitance', short: 'C_eq', sym: 'C<sub>eq</sub>', unit: 'F', f: d => d.Ceq }, { id: 'Q', name: 'Charge from the battery', short: 'Q', sym: 'Q', unit: 'C', f: d => d.Q }, { id: 'V1', name: 'Voltage across C₁', short: 'ΔV₁', sym: 'ΔV<sub>1</sub>', unit: 'V', f: d => d.V1 }]; },
  work(v, d, mode){
    const uC = x => M.n(x * 1e6, 'μC'), uF = x => M.n(x * 1e6, 'μF');
    if (mode === 'par') return '<h4>1 · Parallel: same ΔV on each</h4><p class="st">Both capacitors connect straight across the battery:</p>' + TEXA`\Delta V_1 = ${M.n(v.E, 'V')}` + TEXA`\Delta V_2 = ${M.n(v.E, 'V')}` +
      '<h4>2 · Charges add</h4>' + TEX`Q_1 = C_1\,\Delta V` + TEX`Q_1 = (${M.iv('C1', 1e-6)}\,\text{F})(${M.iv('E')})` + TEX`Q_1 = ${uC(d.Q1)}` +
      TEX`Q_2 = C_2\,\Delta V` + TEX`Q_2 = (${M.iv('C2', 1e-6)}\,\text{F})(${M.iv('E')})` + TEX`Q_2 = ${uC(d.Q2)}` +
      TEX`Q = Q_1 + Q_2` + TEX`Q = ${uC(d.Q1)} + ${uC(d.Q2)}` + TEXA`Q = ${uC(d.Q)}` +
      '<h4>3 · Equivalent capacitance</h4>' + TEX`C_{eq} = \frac{Q}{\Delta V}` + TEX`C_{eq} = C_1 + C_2` + TEX`C_{eq} = ${M.iv('C1')} + ${M.iv('C2')}` + TEXA`C_{eq} = ${uF(d.Ceq)}` + '<p class="st">Bigger than either one.</p>' +
      '<p class="note">Parallel capacitors act like one capacitor with more plate area. The bigger capacitor stores more charge. (Opposite to resistors: parallel resistors make R smaller.)</p>';
    return '<h4>1 · Series: same charge on each</h4><p class="st">The middle plates are isolated, so charge only moves around:</p>' + TEX`Q_1 = Q` + TEX`Q_2 = Q` +
      '<h4>2 · Equivalent capacitance</h4>' + TEX`\frac{1}{C_{eq}} = \frac{1}{C_1} + \frac{1}{C_2}` + TEX`\frac{1}{C_{eq}} = \frac{1}{${M.iv('C1')}} + \frac{1}{${M.iv('C2')}}` + TEXA`C_{eq} = ${uF(d.Ceq)}` + '<p class="st">Smaller than either one.</p>' +
      '<h4>3 · Charge and voltages</h4>' + TEX`Q = C_{eq}\,\Delta V` + TEX`Q = (${uF(d.Ceq)})(${M.iv('E')})` + TEXA`Q = ${uC(d.Q)}` +
      TEX`\Delta V_1 = \frac{Q}{C_1}` + TEX`\Delta V_1 = \frac{${uC(d.Q)}}{${M.iv('C1')}}` + TEXA`\Delta V_1 = ${M.n(d.V1, 'V')}` +
      TEX`\Delta V_2 = \frac{Q}{C_2}` + TEX`\Delta V_2 = \frac{${uC(d.Q)}}{${M.iv('C2')}}` + TEXA`\Delta V_2 = ${M.n(d.V2, 'V')}` +
      '<p class="st">Check (loop rule):</p>' + TEX`\Delta V_1 + \Delta V_2 = ${M.n(d.V1)} + ${M.n(d.V2)}` + TEXA`\Delta V_{\text{battery}} = ${M.n(v.E, 'V')}` + '<p class="st">The two voltages add up to the battery ✓</p>' +
      '<p class="note">In series the <b>smaller</b> capacitor gets the <b>bigger</b> voltage (same Q, ΔV = Q/C). Series capacitors act like one capacitor with a wider gap.</p>';
  },
  draw(v, d, mode){
    panelTitle(mode === 'par' ? 'TWO CAPACITORS IN PARALLEL' : 'TWO CAPACITORS IN SERIES', 10, 18);
    const cap = (x, y, horiz, lab, Q, V) => { const g = 7, w = 22; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
      if (horiz){ ctx.beginPath(); ctx.moveTo(x - g, y - w); ctx.lineTo(x - g, y + w); ctx.moveTo(x + g, y - w); ctx.lineTo(x + g, y + w); ctx.stroke(); text(lab, x, y - w - 8, { align: 'center', font: '700 11px "IBM Plex Mono",monospace' }); text('+' + fplain(+(Q * 1e6).toFixed(2)) + ' μC', x - g - 4, y + w + 14, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#c43a00' }); text('ΔV = ' + fplain(+V.toFixed(2)) + ' V', x, y + w + 28, { align: 'center', font: '600 9px "IBM Plex Mono",monospace', col: '#7a3fb0' }); }
      else { ctx.beginPath(); ctx.moveTo(x - w, y - g); ctx.lineTo(x + w, y - g); ctx.moveTo(x - w, y + g); ctx.lineTo(x + w, y + g); ctx.stroke(); text(lab, x + w + 6, y - 2, { font: '700 11px "IBM Plex Mono",monospace' }); text('+' + fplain(+(Q * 1e6).toFixed(2)) + ' μC', x + w + 6, y + 12, { font: '600 9px "IBM Plex Mono",monospace', col: '#c43a00' }); text('ΔV = ' + fplain(+V.toFixed(2)) + ' V', x + w + 6, y + 24, { font: '600 9px "IBM Plex Mono",monospace', col: '#7a3fb0' }); } };
    const xL = 60, T = 70, B = 270;
    if (mode === 'par'){ const x1 = 200, x2 = 320; wire([[xL, T], [x2, T]]); wire([[xL, B], [x2, B]]); dotN(x1, T); dotN(x1, B);
      wire([[xL, T], [xL, 145]]); battery(xL, 195, xL, 145, fplain(v.E) + ' V'); wire([[xL, 195], [xL, B]]);
      wire([[x1, T], [x1, 163]]); wire([[x1, 177], [x1, B]]); cap(x1, 170, false, 'C₁ ' + v.C1 + ' μF', d.Q1, d.V1);
      wire([[x2, T], [x2, 163]]); wire([[x2, 177], [x2, B]]); cap(x2, 170, false, 'C₂ ' + v.C2 + ' μF', d.Q2, d.V2); }
    else { const xR = 330; wire([[xL, T], [140, T]]); wire([[154, T], [250, T]]); wire([[264, T], [xR, T]]); wire([[xR, T], [xR, B]]); wire([[xL, B], [xR, B]]);
      wire([[xL, T], [xL, 145]]); battery(xL, 195, xL, 145, fplain(v.E) + ' V'); wire([[xL, 195], [xL, B]]);
      cap(147, T, true, 'C₁ ' + v.C1 + ' μF', d.Q1, d.V1); cap(257, T, true, 'C₂ ' + v.C2 + ' μF', d.Q2, d.V2);
      text('isolated middle: total charge 0', 202, T + 84, { align: 'center', font: '600 9px "IBM Plex Mono",monospace', col: '#8a8a8a' }); }
    text('C_eq = ' + fplain(+(d.Ceq * 1e6).toFixed(3)) + ' μF   Q from battery = ' + fplain(+(d.Q * 1e6).toFixed(2)) + ' μC', 12, 312, { font: '700 12px "Space Grotesk",sans-serif' });
    panelTitle('COMPARE', 395, 18);
    const bars = (y, title, a, b, unit, mx) => { text(title, 400, y, { font: '700 12px "Space Grotesk",sans-serif' }); [[a, 'C₁', '#1546d6'], [b, 'C₂', '#ff6a2b']].forEach(([val, n, c], i) => { ctx.fillStyle = c; ctx.fillRect(430, y + 8 + i * 22, 140 * val / mx, 16); text(n, 400, y + 21 + i * 22, { font: '700 10px "IBM Plex Mono",monospace' }); text(fplain(+val.toFixed(2)) + ' ' + unit, 434 + 140 * val / mx, y + 21 + i * 22, { font: '600 9px "IBM Plex Mono",monospace' }); }); };
    bars(50, 'Charge', d.Q1 * 1e6, d.Q2 * 1e6, 'μC', Math.max(d.Q1, d.Q2) * 1e6 * 1.4);
    bars(130, 'Voltage', d.V1, d.V2, 'V', v.E * 1.4);
    text(mode === 'par' ? 'same ΔV, charges add' : 'same Q, voltages add', 400, 216, { font: '700 11px "IBM Plex Mono",monospace', col: '#c43a00' });
  }
};
