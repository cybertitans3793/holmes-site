// Series & Parallel (AP 11.4–11.7, IB B.5): bulbs in series, parallel and a combination. Equivalent resistance, current, voltage and power (brightness) for each bulb; what happens when one bulb is removed.
//@include _schem.js
const SIM = {
  title: 'Series & Parallel',
  hint: 'ideal battery and wires · brightness ∝ power',
  modes: [{ id: 'ser', label: 'Series' }, { id: 'par', label: 'Parallel' }, { id: 'combo', label: 'Combination' }],
  opts: [{ id: 'b3', label: 'Bulb 3', choices: [['in', 'In'], ['out', 'Removed']] }],
  ivs(){ return [
    { id: 'E', sym: 'ε', symText: 'emf', label: 'Battery', unit: 'V', min: 1, max: 24, step: 0.5, val: 12 },
    { id: 'R1', sym: 'R<sub>1</sub>', symText: 'R1', label: 'Bulb 1 resistance', unit: 'Ω', min: 1, max: 50, step: 1, val: 10 },
    { id: 'R2', sym: 'R<sub>2</sub>', symText: 'R2', label: 'Bulb 2 resistance', unit: 'Ω', min: 1, max: 50, step: 1, val: 10 },
    { id: 'R3', sym: 'R<sub>3</sub>', symText: 'R3', label: 'Bulb 3 resistance', unit: 'Ω', min: 1, max: 50, step: 1, val: 10, graph: true }]; },
  presets: [{ label: 'All equal', v: { R1: 10, R2: 10, R3: 10 } }, { label: 'Bulb 1 big', v: { R1: 40, R2: 10, R3: 10 } }],
  calc(v, mode, opt){
    const out = (opt.b3 || 'in') === 'out'; let Req, I = [0, 0, 0], V = [0, 0, 0], steps = [];
    if (mode === 'ser'){ if (out){ Req = Infinity; } else { Req = v.R1 + v.R2 + v.R3; const i = v.E / Req; I = [i, i, i]; V = [i * v.R1, i * v.R2, i * v.R3]; } steps = ['R<sub>eq</sub> = R₁ + R₂ + R₃' + (out ? ': but the circuit is broken' : ' = ' + fnum(Req) + ' Ω')]; }
    else if (mode === 'par'){ const inv = 1 / v.R1 + 1 / v.R2 + (out ? 0 : 1 / v.R3); Req = 1 / inv; V = [v.E, v.E, out ? 0 : v.E]; I = [v.E / v.R1, v.E / v.R2, out ? 0 : v.E / v.R3]; steps = ['1/R<sub>eq</sub> = 1/R₁ + 1/R₂' + (out ? '' : ' + 1/R₃') + ' → R<sub>eq</sub> = ' + fnum(Req) + ' Ω']; }
    else { const Rp = out ? v.R2 : 1 / (1 / v.R2 + 1 / v.R3); Req = v.R1 + Rp; const it = v.E / Req, vp = it * Rp; I = [it, vp / v.R2, out ? 0 : vp / v.R3]; V = [it * v.R1, vp, out ? 0 : vp]; steps = [(out ? 'Only R₂ in the branch: R<sub>p</sub> = ' + fnum(Rp) + ' Ω' : 'R₂ ∥ R₃: R<sub>p</sub> = (1/R₂ + 1/R₃)⁻¹ = ' + fnum(Rp) + ' Ω'), 'R<sub>eq</sub> = R₁ + R<sub>p</sub> = ' + fnum(Req) + ' Ω']; }
    const P = I.map((i, k) => i * V[k]), Itot = isFinite(Req) ? v.E / Req : 0;
    return { out, Req, I, V, P, Itot, Ptot: Itot * v.E, steps };
  },
  dvs(){ return [{ id: 'P1', name: 'Power of bulb 1 (brightness)', short: 'P₁', sym: 'P<sub>1</sub>', unit: 'W', f: d => d.P[0] }, { id: 'P2', name: 'Power of bulb 2', short: 'P₂', sym: 'P<sub>2</sub>', unit: 'W', f: d => d.P[1] }, { id: 'P3', name: 'Power of bulb 3', short: 'P₃', sym: 'P<sub>3</sub>', unit: 'W', f: d => d.P[2] }, { id: 'It', name: 'Current from the battery', short: 'I', sym: 'I', unit: 'A', f: d => d.Itot }]; },
  work(v, d, mode){
    if (mode === 'ser' && d.out) return '<h4>Series circuit with a bulb removed</h4><div class="bad">There is only one path for charge. Break it anywhere and the current everywhere is zero: all the bulbs go out.</div><p class="note">This is why old holiday lights went dark when one bulb failed.</p>';
    const rows = [0, 1, 2].map(k => '<div class="eq">Bulb ' + (k + 1) + ': I = ' + H.n(d.I[k], 'A') + ', V = ' + H.n(d.V[k], 'V') + ', P = IV = <b>' + H.n(d.P[k], 'W') + '</b>' + (k === 2 && d.out ? ' (removed)' : '') + '</div>').join('');
    const rule = { ser: 'Series: same current through every bulb; the voltages add up to ε.', par: 'Parallel: same voltage (ε) across every branch; the currents add up.', combo: 'Bulb 1 carries all the current; it splits between bulbs 2 and 3, which share the same voltage.' }[mode];
    return '<h4>1 · Equivalent resistance</h4><div class="eq">' + d.steps.join('<br>') + '</div>' +
      '<h4>2 · Current from the battery</h4><div class="eq">I = ε/R<sub>eq</sub> = ' + H.iv('E') + '/' + fnum(d.Req) + ' Ω = <b>' + H.n(d.Itot, 'A') + '</b></div>' +
      '<h4>3 · Each bulb (brightness ∝ power)</h4>' + rows +
      '<h4>4 · Checks (Kirchhoff)</h4><div class="eq">' + rule + ' Total power ' + fnum(d.P[0] + d.P[1] + d.P[2]) + ' W = εI = ' + fnum(d.Ptot) + ' W ✓</div>' +
      (mode === 'combo' ? '<p class="note">Remove bulb 3: R<sub>eq</sub> goes up, so less total current → bulb 1 dims. But bulb 2 gets more voltage → it brightens. A classic FRQ prediction.</p>' : mode === 'par' ? '<p class="note">Remove bulb 3: the others don’t change (each still has ε across it), but the battery supplies less current.</p>' : '<p class="note">In series the biggest resistance gets the biggest share of the voltage, so it’s the brightest.</p>');
  },
  draw(v, d, mode, opt, t){
    const Pm = Math.max(...d.P, 0.01), glow = k => Math.min(1, d.P[k] / Math.max(Pm, 2)), lab = k => 'B' + (k + 1);
    panelTitle(({ ser: 'SERIES', par: 'PARALLEL', combo: 'BULB 1 IN SERIES WITH (2 ∥ 3)' })[mode], 10, 18);
    const L = 50, R = 350, T = 70, B = 270;
    battery(L, B - 60, L, T + 60, v.E + ' V'); wire([[L, T + 60], [L, T]]); wire([[L, B - 60], [L, B]]);
    if (mode === 'ser'){
      wire([[L, T], [190, T]]); bulb(200, T, glow(0), lab(0)); wire([[211, T], [R, T], [R, 160]]); bulb(R, 171, glow(1), lab(1)); wire([[R, 182], [R, B], [211, B]]);
      if (!d.out){ bulb(200, B, glow(2), lab(2)); wire([[189, B], [L, B]]); } else { bulb(200, B, 0, lab(2), true); wire([[180, B], [L, B]]); }
    } else if (mode === 'par'){
      wire([[L, T], [300, T]]); wire([[L, B], [300, B]]);
      [[140, 0], [220, 1], [300, 2]].forEach(([x, k]) => { wire([[x, T], [x, 159]]); if (k === 2 && d.out){ bulb(x, 170, 0, lab(k), true); wire([[x, 190], [x, B]]); } else { bulb(x, 170, glow(k), lab(k)); wire([[x, 181], [x, B]]); } dotN(x, T); dotN(x, B); });
    } else {
      wire([[L, T], [140, T]]); bulb(151, T, glow(0), lab(0)); wire([[162, T], [320, T]]); wire([[L, B], [320, B]]);
      [[240, 1], [320, 2]].forEach(([x, k]) => { wire([[x, T], [x, 159]]); if (k === 2 && d.out){ bulb(x, 170, 0, lab(k), true); wire([[x, 190], [x, B]]); } else { bulb(x, 170, glow(k), lab(k)); wire([[x, 181], [x, B]]); } }); dotN(240, T); dotN(240, B);
    }
    if (d.Itot > 0) curArrow(L, T + 30, 0, -1, fplain(d.Itot) + ' A');
    text('R_eq = ' + (isFinite(d.Req) ? fplain(d.Req) + ' Ω' : '∞') + '   I = ' + fplain(d.Itot) + ' A', 12, 312, { font: '700 13px "Space Grotesk",sans-serif' });
    panelTitle('EACH BULB', 395, 18);
    [0, 1, 2].forEach(k => { const y = 46 + k * 74; text('B' + (k + 1) + (k === 2 && d.out ? ' (removed)' : ''), 400, y, { font: '700 13px "Space Grotesk",sans-serif' }); text('I ' + fplain(d.I[k]) + ' A · V ' + fplain(d.V[k]) + ' V', 400, y + 17, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      const w = 170 * d.P[k] / Math.max(Pm, 1e-6); ctx.fillStyle = '#ffd23c'; ctx.fillRect(400, y + 24, w, 14); ctx.strokeStyle = '#111'; ctx.strokeRect(400, y + 24, 170, 14); text(fplain(d.P[k]) + ' W', 404, y + 35, { font: '600 10px "IBM Plex Mono",monospace' }); });
  }
};
