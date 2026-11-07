// Kirchhoff's Rules (AP 11.6–11.7, IB B.5): (1) one loop with two batteries pushing opposite ways (or the same way); (2) one battery, two loops (junction rule + two loop equations). V-vs-position graph around the loop. No batteries in parallel (CED 11.6 exclusion).
//@include _schem.js
const SIM = {
  title: 'Kirchhoff’s Rules',
  hint: 'ideal batteries · Σ(ΔV) around any loop = 0 · ΣI in = ΣI out',
  modes: [{ id: 'loop', label: 'One loop, two batteries' }, { id: 'two', label: 'One battery, two loops' }],
  opts: [{ id: 'pol', label: 'Right battery', modes: ['loop'], choices: [['opp', 'Pushes the other way'], ['aid', 'Pushes the same way']] }],
  ivs(mode){
    if (mode === 'two') return [
      { id: 'E', sym: 'ε', symText: 'emf', label: 'Battery', unit: 'V', min: 1, max: 24, step: 0.5, val: 12 },
      { id: 'R1', sym: 'R<sub>1</sub>', symText: 'R1', label: 'Resistor next to the battery', unit: 'Ω', min: 1, max: 20, step: 1, val: 2 },
      { id: 'R2', sym: 'R<sub>2</sub>', symText: 'R2', label: 'Middle branch', unit: 'Ω', min: 1, max: 20, step: 1, val: 6, graph: true },
      { id: 'R3', sym: 'R<sub>3</sub>', symText: 'R3', label: 'Right branch', unit: 'Ω', min: 1, max: 20, step: 1, val: 3 }];
    return [
      { id: 'E1', sym: 'ε<sub>1</sub>', symText: 'emf1', label: 'Left battery', unit: 'V', min: 0, max: 24, step: 0.5, val: 12 },
      { id: 'E2', sym: 'ε<sub>2</sub>', symText: 'emf2', label: 'Right battery', unit: 'V', min: 0, max: 24, step: 0.5, val: 3, graph: true },
      { id: 'R1', sym: 'R<sub>1</sub>', symText: 'R1', label: 'Top resistor', unit: 'Ω', min: 1, max: 20, step: 0.5, val: 2 },
      { id: 'R2', sym: 'R<sub>2</sub>', symText: 'R2', label: 'Bottom resistor', unit: 'Ω', min: 1, max: 20, step: 0.5, val: 1 }];
  },
  presets: [{ label: 'Notes example (12 V vs 3 V)', mode: 'loop', opt: { pol: 'opp' }, v: { E1: 12, E2: 3, R1: 2, R2: 1 } }, { label: 'Equal batteries', mode: 'loop', opt: { pol: 'opp' }, v: { E1: 12, E2: 12 } }, { label: 'Right battery stronger', mode: 'loop', opt: { pol: 'opp' }, v: { E1: 6, E2: 12 } }],
  calc(v, mode, opt){
    if (mode === 'two'){ const Rp = v.R2 * v.R3 / (v.R2 + v.R3), I1 = v.E / (v.R1 + Rp), I2 = I1 * v.R3 / (v.R2 + v.R3), I3 = I1 * v.R2 / (v.R2 + v.R3); return { Rp, I1, I2, I3, Vj: v.E - I1 * v.R1 }; }
    const aid = opt.pol === 'aid', e2 = aid ? -v.E2 : v.E2, I = (v.E1 - e2) / (v.R1 + v.R2);   // + I = clockwise (up through the left battery)
    return { aid, e2, I, P1: v.E1 * I, P2: -e2 * I };
  },
  dvs(mode){ return mode === 'two' ? [{ id: 'I1', name: 'Current through the battery', short: 'I₁', sym: 'I<sub>1</sub>', unit: 'A', f: d => d.I1 }, { id: 'I2', name: 'Current in the middle branch', short: 'I₂', sym: 'I<sub>2</sub>', unit: 'A', f: d => d.I2 }, { id: 'I3', name: 'Current in the right branch', short: 'I₃', sym: 'I<sub>3</sub>', unit: 'A', f: d => d.I3 }]
    : [{ id: 'I', name: 'Current (+ = clockwise)', short: 'I', sym: 'I', unit: 'A', f: d => d.I }]; },
  work(v, d, mode){
    if (mode === 'two') return '<h4>1 · Junction rule (top junction)</h4><p class="st">Current in = current out:</p>' + TEXA`I_1 = I_2 + I_3` +
      '<h4>2 · Loop rule, left loop (battery, R₁, R₂)</h4>' + TEX`+\varepsilon - I_1 R_1 - I_2 R_2 = 0` + TEX`+${M.iv('E', 1)} - ${M.n(v.R1)}\,I_1 - ${M.n(v.R2)}\,I_2 = 0` +
      '<h4>3 · Loop rule, right loop (R₂ and R₃)</h4>' + TEX`+I_2 R_2 - I_3 R_3 = 0` + '<p class="st">The two branches have the same ΔV.</p>' +
      '<h4>4 · Solve</h4>' + TEXA`I_1 = ${M.n(d.I1, 'A')}` + TEXA`I_2 = ${M.n(d.I2, 'A')}` + TEXA`I_3 = ${M.n(d.I3, 'A')}` +
      '<p class="st">Check:</p>' + TEX`I_2 + I_3 = ${M.n(d.I2 + d.I3, 'A')}` + '<p class="st">This equals I₁ ✓</p>' +
      '<h4>5 · Potentials (bottom wire = 0 V)</h4>' + TEX`V_{\text{after battery}} = ${M.n(v.E, 'V')}` + TEX`V_{\text{after } R_1} = ${M.n(d.Vj, 'V')}` +
      '<p class="st">That is the top of both branches. Then back to 0 V through either R₂ or R₃.</p>' +
      '<p class="note">Loop rule = conservation of energy. Junction rule = conservation of charge. The bigger branch current goes through the smaller resistor.</p>';
    const cw = d.I >= 0, I = Math.abs(d.I), charged = d.I === 0 ? null : (d.P2 < 0 ? 2 : d.P1 < 0 ? 1 : null), e2 = d.aid ? '+' : '-';
    return '<h4>1 · Pick a direction and go around the loop</h4><p class="st">Clockwise, starting at the bottom-left corner:</p>' +
      (d.aid ? TEXA`+\varepsilon_1 - I\,R_1 + \varepsilon_2 - I\,R_2 = 0` : TEXA`+\varepsilon_1 - I\,R_1 - \varepsilon_2 - I\,R_2 = 0`) +
      '<h4>2 · Solve for the current</h4>' + (d.aid ? TEX`I = \frac{\varepsilon_1 + \varepsilon_2}{R_1 + R_2}` + TEX`I = \frac{${M.iv('E1')} + ${M.iv('E2')}}{${M.n(v.R1 + v.R2, 'Ω')}}`
        : TEX`I = \frac{\varepsilon_1 - \varepsilon_2}{R_1 + R_2}` + TEX`I = \frac{${M.iv('E1')} - ${M.iv('E2')}}{${M.n(v.R1 + v.R2, 'Ω')}}`) + TEXA`I = ${M.n(d.I, 'A')}` +
      (d.I < 0 ? '<p class="st">Negative: the current really goes <b>counterclockwise</b>. The right battery wins.</p>' : d.I === 0 ? '<p class="st">The batteries cancel: no current.</p>' : '') +
      '<h4>3 · Which battery is being charged?</h4>' + (charged ? '<p class="st">Current goes <b>into the + terminal</b> of battery ' + charged + ', against its push: battery ' + charged + ' is being <b>charged</b>, absorbing:</p>' + TEXA`P_{\text{absorbed}} = ${M.n(Math.abs(charged === 2 ? d.P2 : d.P1), 'W')}`
        : '<p class="st">' + (d.I === 0 ? 'Neither: no current.' : 'Neither: both batteries push the current the same way, so both are supplying energy.') + '</p>') +
      '<h4>4 · Potential around the loop</h4><p class="st">Going around the loop, one element at a time:</p>' +
      TEX`\Delta V_{\varepsilon_1} = +${M.n(v.E1, 'V')}` + TEX`\Delta V_{R_1} = -${M.n(v.R1 * I, 'V')}` +
      (d.aid ? TEX`\Delta V_{\varepsilon_2} = +${M.n(v.E2, 'V')}` : TEX`\Delta V_{\varepsilon_2} = -${M.n(v.E2, 'V')}`) + TEX`\Delta V_{R_2} = -${M.n(v.R2 * I, 'V')}` +
      TEXA`\Sigma\,\Delta V = 0` + '<p class="st">Total change = 0 ✓ (see the graph)</p>' +
      '<p class="note">A battery adds energy when current leaves its + terminal; it takes energy (is charged) when current is forced in at its + terminal.</p>';
  },
  draw(v, d, mode, opt){
    const lab = (s, x, y, c) => text(s, x, y, { font: '700 10px "IBM Plex Mono",monospace', col: c || '#1e7d45' });
    if (mode === 'two'){
      panelTitle('ONE BATTERY, TWO LOOPS', 10, 18);
      const xL = 60, xM = 210, xR = 340, T = 70, B = 280;
      wire([[xL, T], [xR, T]]); wire([[xL, B], [xR, B]]); dotN(xM, T); dotN(xM, B);
      wire([[xL, T], [xL, 100]]); resistor(xL, 100, xL, 165, 'R₁ ' + v.R1 + 'Ω'); wire([[xL, 165], [xL, 200]]); battery(xL, 250, xL, 200, 'ε ' + v.E + 'V'); wire([[xL, 250], [xL, B]]);
      wire([[xM, T], [xM, 140]]); resistor(xM, 140, xM, 210, 'R₂ ' + v.R2 + 'Ω'); wire([[xM, 210], [xM, B]]);
      wire([[xR, T], [xR, 140]]); resistor(xR, 140, xR, 210, 'R₃ ' + v.R3 + 'Ω'); wire([[xR, 210], [xR, B]]);
      curArrow(xL, 268, 0, -1); lab('I₁ ' + fplain(d.I1) + ' A', xL + 10, 272); curArrow(xM, 112, 0, 1); lab('I₂ ' + fplain(d.I2) + ' A', xM + 10, 116); curArrow(xR, 112, 0, 1); lab('I₃ ' + fplain(d.I3) + ' A', xR - 70, 106);
      text('loop 1', 120, 180, { font: '600 10px "IBM Plex Mono",monospace', col: '#8a8a8a' }); text('loop 2', 255, 180, { font: '600 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
      text('top: ' + fplain(d.Vj) + ' V', xM - 30, T - 10, { font: '600 10px "IBM Plex Mono",monospace', col: '#7a3fb0' }); text('0 V', xM - 10, B + 16, { font: '600 10px "IBM Plex Mono",monospace', col: '#7a3fb0' });
      panelTitle('CURRENTS', 395, 18); [['I₁', d.I1], ['I₂', d.I2], ['I₃', d.I3]].forEach(([n, I], i) => text(n + ' = ' + fplain(I) + ' A', 400, 56 + i * 24, { font: '700 14px "Space Grotesk",sans-serif' }));
      text('I₂ + I₃ = ' + fplain(d.I2 + d.I3) + ' A = I₁ ✓', 400, 140, { font: '600 11px "IBM Plex Mono",monospace', col: '#1e7d45' });
      // V around loop 1
      const pts = [[0, 0], [1, v.E], [2, v.E], [3, d.Vj], [4, d.Vj], [5, 0], [6, 0]], labs = ['start', 'ε', '', 'R₁', '', 'R₂', ''];
      Vgraph(pts, ['start', 'after ε', 'after R₁', 'after R₂'], v.E, 'V AROUND LOOP 1'); return;
    }
    panelTitle('ONE LOOP, TWO BATTERIES', 10, 18);
    const xL = 70, xR = 330, T = 80, B = 270;
    wire([[xL, T], [140, T]]); resistor(140, T, 260, T, 'R₁ ' + v.R1 + 'Ω'); wire([[260, T], [xR, T]]);
    wire([[xL, B], [140, B]]); resistor(140, B, 260, B, 'R₂ ' + v.R2 + 'Ω'); wire([[260, B], [xR, B]]);
    wire([[xL, T], [xL, 150]]); battery(xL, 200, xL, 150, 'ε₁ ' + v.E1 + 'V'); wire([[xL, 200], [xL, B]]);
    wire([[xR, T], [xR, 150]]); d.aid ? battery(xR, 150, xR, 200) : battery(xR, 200, xR, 150); text('ε₂ ' + v.E2 + 'V', xR + 14, 179, { font: '700 11px "IBM Plex Mono",monospace' }); wire([[xR, 200], [xR, B]]);
    text('+', xL - 22, 160, { font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' }); text('+', xR + 16, d.aid ? 200 : 160, { font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' });
    if (Math.abs(d.I) > 1e-9){ const s = Math.sign(d.I); curArrow(200, T - 18, s, 0); curArrow(200, B + 18, -s, 0); curArrow(xL + 18, 120, 0, -s); curArrow(xR - 18, 230, 0, s);
      lab('I = ' + fplain(Math.abs(d.I)) + ' A ' + (s > 0 ? 'clockwise' : 'counterclockwise'), 120, 300); }
    else lab('I = 0', 180, 300, '#4a4a4a');
    const ch = d.P2 < 0 ? 2 : d.P1 < 0 ? 1 : 0; if (ch) text('battery ' + ch + ' is being charged', ch === 2 ? 250 : 20, 140, { font: '700 10px "IBM Plex Mono",monospace', col: '#c43a00' });
    const I = d.I, V1 = v.E1, V2 = V1 - I * v.R1, V3 = V2 - d.e2, V4 = V3 - I * v.R2;
    Vgraph([[0, 0], [1, V1], [2, V1], [3, V2], [4, V2], [5, V3], [6, V3], [7, V4]], ['start', 'up ε₁', 'across R₁', (d.aid ? 'up' : 'down') + ' ε₂', 'across R₂'], Math.max(1, ...[V1, V2, V3].map(Math.abs)), 'V AROUND THE LOOP (CLOCKWISE)');
    function dummy(){}
  }
};
function Vgraph(pts, names, vmax, title){
  panelTitle(title, 395, 160); const x0 = 405, x1 = 588, y0 = 176, y1 = 300, n = pts[pts.length - 1][0], lo = Math.min(0, ...pts.map(p => p[1])), hi = Math.max(vmax, ...pts.map(p => p[1])), X = k => x0 + (x1 - x0) * k / n, Y = vv => y1 - (y1 - y0) * (vv - lo) / ((hi - lo) || 1);
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke(); text('0 V', x0 - 3, Y(0) + 3, { align: 'right', font: '500 8px "IBM Plex Mono",monospace' });
  ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach(([k, vv], i) => i ? ctx.lineTo(X(k), Y(vv)) : ctx.moveTo(X(k), Y(vv))); ctx.stroke();
  pts.forEach(([k, vv], i) => { if (i % 2 === 1 || i === 0) text(fplain(+vv.toFixed(2)), X(k) + 2, Y(vv) - 4, { font: '600 8px "IBM Plex Mono",monospace', col: '#7a3fb0' }); });
  text('around the loop →', x1, y1 + 12, { align: 'right', font: '600 8px "IBM Plex Mono",monospace', col: '#8a8a8a' });
}
