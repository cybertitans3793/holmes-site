// Kirchhoff's Rules (AP 11.6–11.7, IB B.5): the classic two-battery, three-branch circuit. Junction rule, two loop equations, solve for the three currents, check with potentials.
//@include _schem.js
const SIM = {
  title: 'Kirchhoff’s Rules',
  hint: 'ideal batteries · Σ(ΔV) around any loop = 0 · ΣI in = ΣI out',
  opts: [{ id: 'pol', label: 'Right battery', choices: [['up', '+ on top'], ['down', '+ on bottom']] }],
  ivs(){ return [
    { id: 'E1', sym: 'ε<sub>1</sub>', symText: 'emf1', label: 'Left battery', unit: 'V', min: 0, max: 24, step: 0.5, val: 12 },
    { id: 'E2', sym: 'ε<sub>2</sub>', symText: 'emf2', label: 'Right battery', unit: 'V', min: 0, max: 24, step: 0.5, val: 6, graph: true },
    { id: 'R1', sym: 'R<sub>1</sub>', symText: 'R1', label: 'Left resistor', unit: 'Ω', min: 1, max: 50, step: 1, val: 4 },
    { id: 'R2', sym: 'R<sub>2</sub>', symText: 'R2', label: 'Right resistor', unit: 'Ω', min: 1, max: 50, step: 1, val: 2 },
    { id: 'R3', sym: 'R<sub>3</sub>', symText: 'R3', label: 'Middle resistor', unit: 'Ω', min: 1, max: 50, step: 1, val: 6 }]; },
  presets: [{ label: 'Equal batteries', v: { E1: 12, E2: 12 } }, { label: 'Right battery off', v: { E2: 0 } }],
  calc(v, mode, opt){
    const e2 = (opt.pol || 'up') === 'up' ? v.E2 : -v.E2, Vt = (v.E1 / v.R1 + e2 / v.R2) / (1 / v.R1 + 1 / v.R2 + 1 / v.R3);
    const I1 = (v.E1 - Vt) / v.R1, I2 = (e2 - Vt) / v.R2, I3 = Vt / v.R3;
    return { e2, Vt, I1, I2, I3, P1: v.E1 * I1, P2: e2 * I2 };
  },
  dvs(){ return [{ id: 'I1', name: 'Current up the left branch', short: 'I₁', sym: 'I<sub>1</sub>', unit: 'A', f: d => d.I1 }, { id: 'I2', name: 'Current up the right branch', short: 'I₂', sym: 'I<sub>2</sub>', unit: 'A', f: d => d.I2 }, { id: 'I3', name: 'Current down the middle', short: 'I₃', sym: 'I<sub>3</sub>', unit: 'A', f: d => d.I3 }]; },
  work(v, d){
    const f = x => fnum(x), dir = (I, a, b) => I >= 0 ? a : '<b>' + b + '</b> (negative: the guessed direction was wrong)';
    return '<h4>1 · Guess directions: I₁ up the left, I₂ up the right, I₃ down the middle</h4><div class="eq">Junction (top): <b>I₁ + I₂ = I₃</b></div>' +
      '<h4>2 · Loop rule: go around and add the potential changes</h4><div class="eq">Left loop: +ε₁ − I₁R₁ − I₃R₃ = 0 → ' + v.E1 + ' − ' + v.R1 + 'I₁ − ' + v.R3 + 'I₃ = 0</div>' +
      '<div class="eq">Right loop: ' + (d.e2 >= 0 ? '+' : '−') + 'ε₂ − I₂R₂ − I₃R₃ = 0 → ' + f(d.e2) + ' − ' + v.R2 + 'I₂ − ' + v.R3 + 'I₃ = 0</div>' +
      '<h4>3 · Solve the three equations</h4><div class="eq">I₁ = <b>' + H.n(d.I1, 'A') + '</b> ' + dir(d.I1, 'up', 'down') + '</div><div class="eq">I₂ = <b>' + H.n(d.I2, 'A') + '</b> ' + dir(d.I2, 'up', 'down') + '</div><div class="eq">I₃ = <b>' + H.n(d.I3, 'A') + '</b> ' + dir(d.I3, 'down', 'up') + '</div>' +
      '<h4>4 · Check with potentials (bottom wire = 0 V)</h4><div class="eq">Top wire: V = I₃R₃ = ' + H.n(d.Vt, 'V') + '. Left branch: ε₁ − I₁R₁ = ' + f(v.E1 - d.I1 * v.R1) + ' V ✓</div>' +
      '<div class="eq">Battery 1 ' + (d.P1 >= 0 ? 'supplies' : 'absorbs') + ' ' + H.n(Math.abs(d.P1), 'W') + ' · battery 2 ' + (d.P2 >= 0 ? 'supplies' : 'absorbs (is being charged)') + ' ' + H.n(Math.abs(d.P2), 'W') + '</div>' +
      '<p class="note">Loop rule = conservation of energy. Junction rule = conservation of charge. A negative answer just means the arrow points the other way.</p>';
  },
  draw(v, d, mode, opt){
    panelTitle('TWO BATTERIES, THREE BRANCHES', 10, 18);
    const xL = 70, xM = 200, xR = 330, T = 60, B = 290;
    wire([[xL, T], [xR, T]]); wire([[xL, B], [xR, B]]); dotN(xM, T); dotN(xM, B);
    wire([[xL, T], [xL, 90]]); resistor(xL, 90, xL, 160, 'R₁ ' + v.R1 + 'Ω'); wire([[xL, 160], [xL, 195]]); battery(xL, 245, xL, 195, 'ε₁ ' + v.E1 + 'V'); wire([[xL, 245], [xL, B]]);
    wire([[xM, T], [xM, 140]]); resistor(xM, 140, xM, 210, 'R₃ ' + v.R3 + 'Ω'); wire([[xM, 210], [xM, B]]);
    const up = (opt.pol || 'up') === 'up'; wire([[xR, T], [xR, 90]]); resistor(xR, 90, xR, 160, 'R₂ ' + v.R2 + 'Ω'); wire([[xR, 160], [xR, 195]]); up ? battery(xR, 245, xR, 195) : battery(xR, 195, xR, 245); text('ε₂ ' + v.E2 + 'V', xR + 14, 224, { font: '700 11px "IBM Plex Mono",monospace' }); wire([[xR, 245], [xR, B]]);
    const ca = (x, y, I, posDir, nm) => { if (Math.abs(I) < 1e-9) return; const s = Math.sign(I) * posDir; curArrow(x, y, 0, s, null, I >= 0 ? '#1e7d45' : '#c43a00'); text(nm + ' = ' + fplain(Math.abs(I)) + ' A', x + 10, y + 4, { font: '700 10px "IBM Plex Mono",monospace', col: I >= 0 ? '#1e7d45' : '#c43a00' }); };
    ca(xL, 270, d.I1, -1, 'I₁'); ca(xM, 110, d.I3, 1, 'I₃'); ca(xR, 270, d.I2, -1, 'I₂');
    text('top wire: ' + fplain(d.Vt) + ' V', xM - 50, T - 10, { font: '600 10px "IBM Plex Mono",monospace', col: '#7a3fb0' }); text('0 V', xM - 10, B + 16, { font: '600 10px "IBM Plex Mono",monospace', col: '#7a3fb0' });
    panelTitle('CURRENTS', 395, 18);
    [['I₁', d.I1], ['I₂', d.I2], ['I₃', d.I3]].forEach(([n, I], i) => text(n + ' = ' + fplain(I) + ' A', 400, 56 + i * 24, { font: '700 14px "Space Grotesk",sans-serif', col: I >= 0 ? '#111' : '#c43a00' }));
    text('I₁ + I₂ = ' + fplain(d.I1 + d.I2) + ' = I₃ ✓', 400, 140, { font: '600 11px "IBM Plex Mono",monospace', col: '#1e7d45' });
    text('red = opposite to the guess', 400, 300, { font: '600 10px "IBM Plex Mono",monospace', col: '#c43a00' });
  }
};
