// RC Circuits (AP 11.8): charging and discharging a capacitor through a resistor, time constant τ = RC, and the classic FRQ circuit: what happens just after the switch closes vs a long time later.
//@include _schem.js
const SIM = {
  title: 'RC Circuits',
  hint: 'τ = RC · uncharged capacitor acts like a wire · fully charged acts like a break',
  modes: [{ id: 'chg', label: 'Charging' }, { id: 'dis', label: 'Discharging' }, { id: 'fork', label: 'Capacitor in a branch' }],
  opts: [{ id: 'when', label: 'Look at', modes: ['fork'], choices: [['zero', 'Just after closing'], ['long', 'A long time later']] }],
  ivs(mode){
    const E = { id: 'E', sym: 'ε', symText: 'emf', label: 'Battery', unit: 'V', min: 1, max: 24, step: 0.5, val: 12 };
    if (mode === 'fork') return [E, { id: 'R1', sym: 'R<sub>1</sub>', symText: 'R1', label: 'Series resistor', unit: 'Ω', min: 1, max: 100, step: 1, val: 20 }, { id: 'R2', sym: 'R<sub>2</sub>', symText: 'R2', label: 'Resistor in parallel with C', unit: 'Ω', min: 1, max: 100, step: 1, val: 40, graph: true }, { id: 'C', sym: 'C', symText: 'C', label: 'Capacitance', unit: 'μF', min: 10, max: 1000, step: 10, val: 100 }];
    return [E, { id: 'R', sym: 'R', symText: 'R', label: 'Resistance', unit: 'kΩ', min: 1, max: 100, step: 1, val: 10 }, { id: 'C', sym: 'C', symText: 'C', label: 'Capacitance', unit: 'μF', min: 10, max: 1000, step: 10, val: 100 },
      { id: 't', sym: 't', symText: 't', label: 'Time after the switch is thrown', unit: 's', min: 0, max: 10, step: 0.05, val: 1, graph: true }];
  },
  presets: [{ label: 'Double R', mode: 'chg', v: { R: 20 } }, { label: 'Double C', mode: 'chg', v: { C: 200 } }, { label: 'Equal resistors', mode: 'fork', v: { R1: 30, R2: 30 } }],
  calc(v, mode, opt){
    if (mode === 'fork'){ const zero = (opt.when || 'zero') === 'zero';
      if (zero) return { zero, I1: v.E / v.R1, I2: 0, Ic: v.E / v.R1, Vc: 0, Q: 0, U: 0 };
      const I = v.E / (v.R1 + v.R2), Vc = I * v.R2, Q = v.C * 1e-6 * Vc; return { zero, I1: I, I2: I, Ic: 0, Vc, Q, U: 0.5 * Q * Vc }; }
    const R = v.R * 1000, C = v.C * 1e-6, tau = R * C, x = Math.exp(-v.t / tau), Q0 = C * v.E;
    if (mode === 'dis') return { tau, Q: Q0 * x, Vc: v.E * x, I: (v.E / R) * x, VR: v.E * x, frac: x, Q0, I0: v.E / R };
    return { tau, Q: Q0 * (1 - x), Vc: v.E * (1 - x), I: (v.E / R) * x, VR: v.E * x, frac: 1 - x, Q0, I0: v.E / R };
  },
  dvs(mode){
    if (mode === 'fork') return [{ id: 'I1', name: 'Current through R₁', short: 'I₁', sym: 'I<sub>1</sub>', unit: 'A', f: d => d.I1 }, { id: 'Vc', name: 'Voltage across C', short: 'V_C', sym: 'V<sub>C</sub>', unit: 'V', f: d => d.Vc }, { id: 'Q', name: 'Charge on C', short: 'Q', sym: 'Q', unit: 'C', f: d => d.Q }];
    return [{ id: 'Q', name: 'Charge on the capacitor', short: 'Q', sym: 'Q', unit: 'C', f: d => d.Q }, { id: 'I', name: 'Current', short: 'I', sym: 'I', unit: 'A', f: d => d.I }, { id: 'Vc', name: 'Voltage across C', short: 'V_C', sym: 'V<sub>C</sub>', unit: 'V', f: d => d.Vc }];
  },
  work(v, d, mode){
    if (mode === 'fork'){
      if (d.zero) return '<h4>1 · Just after closing: the capacitor is uncharged, so V<sub>C</sub> = 0</h4><p class="st">An uncharged capacitor acts like a <b>plain wire</b>. It shorts out R₂ (same 0 V across it), so no current goes through R₂.</p>' +
        '<h4>2 · Only R₁ limits the current</h4>' + TEX`I_1 = \frac{\varepsilon}{R_1}` + TEX`I_1 = \frac{${M.iv('E')}}{${M.iv('R1')}}` + TEXA`I_1 = ${M.n(d.I1, 'A')}` +
        '<p class="st">All of it flows onto the capacitor.</p>' + TEXA`I_2 = ${M.n(0, 'A')}` +
        '<p class="note">Switch to “a long time later” and predict before you look.</p>';
      return '<h4>1 · A long time later: the capacitor is fully charged, no current through it</h4><p class="st">A charged capacitor acts like a <b>break</b> in the wire. Current flows through R₁ and R₂ in series.</p>' +
        TEX`I = \frac{\varepsilon}{R_1 + R_2}` + TEX`I = \frac{${M.iv('E')}}{${M.iv('R1')} + ${M.iv('R2')}}` + TEXA`I = ${M.n(d.I1, 'A')}` +
        '<h4>2 · The capacitor has the same voltage as R₂ (parallel)</h4>' + TEX`V_C = I\,R_2` + TEX`V_C = (${M.n(d.I1, 'A')})(${M.iv('R2')})` + TEXA`V_C = ${M.n(d.Vc, 'V')}` +
        TEX`Q = C\,V_C` + TEX`Q = (${M.iv('C', 1e-6)}\,\text{F})(${M.n(d.Vc, 'V')})` + TEXA`Q = ${M.n(d.Q, 'C')}` +
        TEX`U = \frac{1}{2} Q\,V_C` + TEX`U = \frac{1}{2}(${M.n(d.Q, 'C')})(${M.n(d.Vc, 'V')})` + TEXA`U = ${M.n(d.U, 'J')}` +
        '<p class="note">Classic FRQ ranking: which resistor has the larger current at t = 0? A long time later? (t = 0: R₁. Later: equal.)</p>';
    }
    const ch = mode === 'chg';
    return '<h4>1 · Time constant</h4>' + TEX`\tau = RC` + TEX`\tau = (${M.iv('R', 1000)}\,\Omega)(${M.iv('C', 1e-6)}\,\text{F})` + TEXA`\tau = ${M.n(d.tau, 's')}` +
      '<p class="st">Bigger τ → it charges and discharges more slowly.</p>' +
      '<h4>2 · At t = 0</h4><p class="st">' + (ch ? 'Uncharged C acts like a wire:' : 'Fully charged:') + '</p>' +
      TEX`I_0 = \frac{\varepsilon}{R}` + TEX`I_0 = \frac{${M.iv('E')}}{${M.iv('R', 1000)}\,\Omega}` + TEXA`I_0 = ${M.n(d.I0, 'A')}` +
      (ch ? TEXA`V_C = 0` : TEXA`V_C = ${M.iv('E')}` + '<p class="st">The current is now flowing the other way.</p>') +
      '<h4>3 · At t = ' + H.iv('t') + '</h4><p class="st">Read off the graphs:</p>' + TEX`Q = ${M.n(d.Q, 'C')}` + TEXA`V_C = ${M.n(d.Vc, 'V')}` + TEXA`I = ${M.n(d.I, 'A')}` +
      (ch ? TEX`\varepsilon = V_R + V_C` + TEX`${M.iv('E')} = ${M.n(d.VR, 'V')} + ${M.n(d.Vc, 'V')}` + '<p class="st">The loop rule checks out ✓</p>'
        : TEX`V_R = V_C` + TEX`V_R = ${M.n(d.Vc, 'V')}`) +
      '<h4>4 · Long time</h4>' + (ch ? '<p class="st">The capacitor charges up to its limit, and the current dies away:</p>' + TEX`Q \to C\,\varepsilon` + TEXA`Q \to ${M.n(d.Q0, 'C')}` + TEXA`I \to 0` + '<p class="st">The capacitor acts like a break.</p>'
        : TEXA`Q \to 0` + TEXA`I \to 0`) +
      '<p class="note">AP: know the shapes. Current always decays. Q and V<sub>C</sub> rise to a limit (charging) or decay (discharging). Bigger R or C → slower.</p>';
  },
  draw(v, d, mode, opt, t){
    if (mode === 'fork'){
      panelTitle(d.zero ? 'JUST AFTER CLOSING (C acts like a wire)' : 'LONG TIME LATER (C acts like a break)', 10, 18);
      battery(50, 230, 50, 110, v.E + ' V'); wire([[50, 110], [50, 60], [90, 60]]); resistor(90, 60, 180, 60, 'R₁ ' + v.R1 + 'Ω'); wire([[180, 60], [320, 60]]); wire([[50, 230], [50, 280], [320, 280]]);
      wire([[230, 60], [230, 130]]); resistor(230, 130, 230, 200, 'R₂ ' + v.R2 + 'Ω'); wire([[230, 200], [230, 280]]); dotN(230, 60); dotN(230, 280);
      wire([[320, 60], [320, 160]]); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(300, 160); ctx.lineTo(340, 160); ctx.moveTo(300, 172); ctx.lineTo(340, 172); ctx.stroke(); wire([[320, 172], [320, 280]]); text('C', 346, 170, { font: '700 12px "IBM Plex Mono",monospace' });
      if (d.zero){ ctx.strokeStyle = '#1e7d45'; ctx.setLineDash([4, 3]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(320, 160); ctx.lineTo(320, 172); ctx.stroke(); ctx.setLineDash([]); }
      else { ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(312, 150); ctx.lineTo(328, 182); ctx.stroke(); }
      curArrow(135, 95, 1, 0, 'I₁ ' + fplain(d.I1) + ' A'); if (d.I2 > 0) curArrow(250, 235, 0, 1, 'I₂ ' + fplain(d.I2)); if (d.Ic > 0) curArrow(320, 115, 0, 1, 'I_C ' + fplain(d.Ic), '#1e7d45');
      panelTitle('VALUES', 395, 18); [['I₁', d.I1, 'A'], ['I₂', d.I2, 'A'], ['I_C', d.Ic, 'A'], ['V_C', d.Vc, 'V'], ['Q', d.Q, 'C']].forEach(([n, x, u], i) => text(n + ' = ' + fplain(x) + ' ' + u, 400, 56 + i * 24, { font: '700 13px "Space Grotesk",sans-serif' }));
      return;
    }
    panelTitle(mode === 'chg' ? 'CHARGING' : 'DISCHARGING', 10, 18);
    if (mode === 'chg'){ battery(50, 230, 50, 110, v.E + ' V'); wire([[50, 110], [50, 60], [120, 60]]); } else { wire([[50, 230], [50, 60], [120, 60]]); }
    resistor(120, 60, 220, 60, 'R ' + v.R + ' kΩ'); wire([[220, 60], [300, 60], [300, 150]]); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(280, 150); ctx.lineTo(320, 150); ctx.moveTo(280, 162); ctx.lineTo(320, 162); ctx.stroke(); wire([[300, 162], [300, 280], [50, 280], [50, 230]]);
    const n = Math.round(8 * d.frac * (mode === 'chg' ? 1 : 1)); for (let i = 0; i < n; i++){ text('+', 284 + i * 4.5, 146, { font: '700 9px "Space Grotesk",sans-serif', col: '#c43a00' }); text('−', 284 + i * 4.5, 172, { font: '700 9px "Space Grotesk",sans-serif', col: '#1546d6' }); }
    if (d.I > d.I0 * 0.01) curArrow(250, 85, mode === 'chg' ? 1 : -1, 0, 'I = ' + fplain(d.I) + ' A');
    text('V_C = ' + fplain(d.Vc) + ' V at t = ' + v.t + ' s  (τ = ' + fplain(d.tau) + ' s)', 12, 312, { font: '700 12px "Space Grotesk",sans-serif' });
    panelTitle('Q(t) AND I(t)', 395, 18);
    const gx = 405, gw = 180, tm = Math.max(5 * d.tau, v.t * 1.1), X = s => gx + gw * s / tm;
    const plot = (gy, gh, f, col, lab) => { ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 100; i++){ const s = tm * i / 100; i ? ctx.lineTo(X(s), gy - gh * f(s)) : ctx.moveTo(X(s), gy - gh * f(s)); } ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(v.t), gy - gh * f(v.t), 4, 0, 7); ctx.fill(); text(lab, gx + 4, gy - gh - 2, { font: '700 10px "IBM Plex Mono",monospace', col }); };
    const e = s => Math.exp(-s / d.tau); plot(140, 95, mode === 'chg' ? s => 1 - e(s) : e, '#1546d6', 'Q'); plot(280, 95, e, '#c43a00', 'I');
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(X(d.tau), 40); ctx.lineTo(X(d.tau), 280); ctx.stroke(); ctx.setLineDash([]); text('τ', X(d.tau) - 3, 296, { font: '700 11px "IBM Plex Mono",monospace' });
  }
};
