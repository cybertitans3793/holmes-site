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
  presets: [{ label: 't = τ', mode: 'chg', v: { R: 10, C: 100, t: 1 } }, { label: 'Double R', mode: 'chg', v: { R: 20 } }, { label: 'Equal resistors', mode: 'fork', v: { R1: 30, R2: 30 } }],
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
      if (d.zero) return '<h4>1 · Just after closing: the capacitor is uncharged, so V<sub>C</sub> = 0</h4><div class="eq">An uncharged capacitor acts like a <b>plain wire</b>. It shorts out R₂ (same 0 V across it), so no current goes through R₂.</div>' +
        '<h4>2 · Only R₁ limits the current</h4><div class="eq">I₁ = ε/R₁ = ' + H.iv('E') + '/' + v.R1 + ' Ω = <b>' + H.n(d.I1, 'A') + '</b>, all of it flowing onto the capacitor. I₂ = 0.</div>' +
        '<p class="note">Switch to “a long time later” and predict before you look.</p>';
      return '<h4>1 · A long time later: the capacitor is fully charged, no current through it</h4><div class="eq">A charged capacitor acts like a <b>break</b> in the wire. Current flows through R₁ and R₂ in series.</div>' +
        '<div class="eq">I = ε/(R₁ + R₂) = ' + H.iv('E') + '/' + (v.R1 + v.R2) + ' Ω = <b>' + H.n(d.I1, 'A') + '</b></div>' +
        '<h4>2 · The capacitor has the same voltage as R₂ (parallel)</h4><div class="eq">V<sub>C</sub> = IR₂ = <b>' + H.n(d.Vc, 'V') + '</b> → Q = CV = <b>' + H.n(d.Q, 'C') + '</b>, U = ½QV = ' + H.n(d.U, 'J') + '</div>' +
        '<p class="note">Classic FRQ ranking: which resistor has the larger current at t = 0? A long time later? (t = 0: R₁. Later: equal.)</p>';
    }
    const ch = mode === 'chg';
    return '<h4>1 · Time constant</h4><div class="eq">τ = RC = (' + H.iv('R') + ')(' + H.iv('C') + ') = <b>' + H.n(d.tau, 's') + '</b>. In one τ it gets ' + (ch ? '63% charged' : 'down to 37%') + '.</div>' +
      '<h4>2 · At t = 0</h4><div class="eq">' + (ch ? 'Uncharged C acts like a wire: I₀ = ε/R = ' + H.n(d.I0, 'A') + ', V<sub>C</sub> = 0' : 'Fully charged: V<sub>C</sub> = ε, I₀ = ε/R = ' + H.n(d.I0, 'A') + ' (now flowing the other way)') + '</div>' +
      '<h4>3 · At t = ' + H.iv('t') + ' (' + fnum(v.t / d.tau) + ' τ)</h4><div class="eq">Q = ' + H.n(d.Q, 'C') + ' (' + H.n(100 * d.Q / d.Q0, '%') + ' of CE) · V<sub>C</sub> = <b>' + H.n(d.Vc, 'V') + '</b> · I = <b>' + H.n(d.I, 'A') + '</b></div>' +
      '<div class="eq">' + (ch ? 'Loop: ε = V<sub>R</sub> + V<sub>C</sub> → ' + fnum(d.VR) + ' + ' + fnum(d.Vc) + ' = ' + v.E + ' V ✓' : 'V<sub>R</sub> = V<sub>C</sub> = ' + fnum(d.Vc) + ' V') + '</div>' +
      '<h4>4 · Long time</h4><div class="eq">' + (ch ? 'Q → Cε = ' + H.n(d.Q0, 'C') + ', I → 0: the capacitor acts like a break.' : 'Q → 0, I → 0.') + '</div>' +
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
