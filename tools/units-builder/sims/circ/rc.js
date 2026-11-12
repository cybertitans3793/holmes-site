// RC Circuits (AP 11.8): charging and discharging a capacitor through a resistor, time constant τ = RC, and the classic FRQ circuit: what happens just after the switch closes vs a long time later.
//@include _schem.js
// Bulb and capacitor: internal curve only (never shown as a formula). v: E (V), Rb (bulb, ohm), R1 (series resistor, ohm), C (mF); s in seconds
function bulbAt(v, par, s){
  const C = v.C * 1e-3, s0 = Math.max(0, s);
  if (!par){ const tau = v.Rb * C, x = Math.exp(-s0 / tau), Ib = (v.E / v.Rb) * x, Vc = v.E * (1 - x);
    return { tau, x, Ib, Vb: Ib * v.Rb, Vc, Q: C * Vc, Qf: C * v.E, Itot: Ib, Ic: Ib, bright: x * x }; }
  const Rp = v.R1 * v.Rb / (v.R1 + v.Rb), Vf = v.E * v.Rb / (v.R1 + v.Rb), tau = Rp * C, x = Math.exp(-s0 / tau), Vc = Vf * (1 - x), Ib = Vc / v.Rb, Itot = (v.E - Vc) / v.R1;
  return { tau, x, Ib, Vb: Vc, Vc, Q: C * Vc, Qf: C * Vf, Itot, Ic: Itot - Ib, bright: Math.pow(Vc / v.E, 2) };
}
const SIM = {
  title: 'RC Circuits',
  hint: 'τ = RC · uncharged capacitor acts like a wire · fully charged acts like a break',
  modes: [{ id: 'chg', label: 'Charging' }, { id: 'dis', label: 'Discharging' }, { id: 'fork', label: 'Capacitor in a branch' }, { id: 'bulb', label: 'Bulb and capacitor' }],
  opts: [{ id: 'arr', label: 'C is', modes: ['bulb'], choices: [['ser', 'In series with bulb'], ['par', 'In parallel with bulb']] }, { id: 'when', label: 'Look at', modes: ['fork'], choices: [['zero', 'Just after closing'], ['long', 'A long time later']] }],
  ivs(mode, opt){
    if (mode === 'bulb'){ const par = (opt.arr || 'ser') === 'par', T = { id: 't', sym: 't', symText: 't', label: 'Time after closing', unit: 's', min: 0, max: 5, step: 0.05, val: 1, graph: true };
      return [{ id: 'E', sym: 'ε', symText: 'emf', label: 'Battery', unit: 'V', min: 1, max: 24, step: 0.5, val: 12 }, { id: 'Rb', sym: 'R<sub>bulb</sub>', symText: 'Rbulb', label: 'Bulb R', unit: 'Ω', min: 5, max: 50, step: 1, val: 20 }]
        .concat(par ? [{ id: 'R1', sym: 'R<sub>1</sub>', symText: 'R1', label: 'Series resistor', unit: 'Ω', min: 5, max: 50, step: 1, val: 20 }] : [], [{ id: 'C', sym: 'C', symText: 'C', label: 'Capacitance', unit: 'mF', min: 10, max: 100, step: 5, val: 50 }, T]); }
    const E = { id: 'E', sym: 'ε', symText: 'emf', label: 'Battery', unit: 'V', min: 1, max: 24, step: 0.5, val: 12 };
    if (mode === 'fork') return [E, { id: 'R1', sym: 'R<sub>1</sub>', symText: 'R1', label: 'Series resistor', unit: 'Ω', min: 1, max: 100, step: 1, val: 20 }, { id: 'R2', sym: 'R<sub>2</sub>', symText: 'R2', label: 'Resistor in parallel with C', unit: 'Ω', min: 1, max: 100, step: 1, val: 40, graph: true }, { id: 'C', sym: 'C', symText: 'C', label: 'Capacitance', unit: 'μF', min: 10, max: 1000, step: 10, val: 100 }];
    return [E, { id: 'R', sym: 'R', symText: 'R', label: 'Resistance', unit: 'kΩ', min: 1, max: 100, step: 1, val: 10 }, { id: 'C', sym: 'C', symText: 'C', label: 'Capacitance', unit: 'μF', min: 10, max: 1000, step: 10, val: 100 },
      { id: 't', sym: 't', symText: 't', label: 'Time after the switch is thrown', unit: 's', min: 0, max: 10, step: 0.05, val: 1, graph: true }];
  },
  presets: [{ label: 'Double R', mode: 'chg', v: { R: 20 } }, { label: 'Double C', mode: 'chg', v: { C: 200 } }, { label: 'Equal resistors', mode: 'fork', v: { R1: 30, R2: 30 } }, { label: 'Bigger C (bulb)', mode: 'bulb', v: { C: 100 } }, { label: 'C in parallel with bulb', mode: 'bulb', opt: { arr: 'par' }, v: {} }],
  calc(v, mode, opt){
    if (mode === 'bulb'){ const par = (opt.arr || 'ser') === 'par', c = bulbAt(v, par, v.t), f = bulbAt(v, par, 1e9), z = bulbAt(v, par, 0);
      return { par, tau: c.tau, Ib: c.Ib, Vb: c.Vb, Vc: c.Vc, Q: c.Q, Qf: f.Q, Vf: f.Vc, bright: c.bright, I0: z.Itot, Ib0: z.Ib, If: f.Ib, Ibf: f.Ib, Ib_now: c.Ib, P0: z.Ib * z.Ib * v.Rb, Pf: f.Ib * f.Ib * v.Rb, Itot: c.Itot, Ic: c.Ic, Rtot: v.Rb + (par ? v.R1 : 0) }; }
    if (mode === 'fork'){ const zero = (opt.when || 'zero') === 'zero';
      if (zero) return { zero, I1: v.E / v.R1, I2: 0, Ic: v.E / v.R1, Vc: 0, Q: 0, U: 0 };
      const I = v.E / (v.R1 + v.R2), Vc = I * v.R2, Q = v.C * 1e-6 * Vc; return { zero, I1: I, I2: I, Ic: 0, Vc, Q, U: 0.5 * Q * Vc }; }
    const R = v.R * 1000, C = v.C * 1e-6, tau = R * C, x = Math.exp(-v.t / tau), Q0 = C * v.E;
    if (mode === 'dis') return { tau, Q: Q0 * x, Vc: v.E * x, I: (v.E / R) * x, VR: v.E * x, frac: x, Q0, I0: v.E / R };
    return { tau, Q: Q0 * (1 - x), Vc: v.E * (1 - x), I: (v.E / R) * x, VR: v.E * x, frac: 1 - x, Q0, I0: v.E / R };
  },
  dvs(mode){
    if (mode === 'bulb') return [{ id: 'Ib', name: 'Current through the bulb', short: 'I_bulb', sym: 'I<sub>bulb</sub>', unit: 'A', f: d => d.Ib }, { id: 'br', name: 'Bulb brightness (1 = full battery voltage on it)', short: 'brightness', sym: 'brightness', unit: '', f: d => d.bright }, { id: 'Q', name: 'Charge on the capacitor', short: 'Q', sym: 'Q', unit: 'C', f: d => d.Q }];
    if (mode === 'fork') return [{ id: 'I1', name: 'Current through R₁', short: 'I₁', sym: 'I<sub>1</sub>', unit: 'A', f: d => d.I1 }, { id: 'Vc', name: 'Voltage across C', short: 'V_C', sym: 'V<sub>C</sub>', unit: 'V', f: d => d.Vc }, { id: 'Q', name: 'Charge on C', short: 'Q', sym: 'Q', unit: 'C', f: d => d.Q }];
    return [{ id: 'Q', name: 'Charge on the capacitor', short: 'Q', sym: 'Q', unit: 'C', f: d => d.Q }, { id: 'I', name: 'Current', short: 'I', sym: 'I', unit: 'A', f: d => d.I }, { id: 'Vc', name: 'Voltage across C', short: 'V_C', sym: 'V<sub>C</sub>', unit: 'V', f: d => d.Vc }];
  },
  work(v, d, mode){
    if (mode === 'bulb'){
      if (!d.par) return '<h4>1 · The instant the switch closes</h4><p class="st">The capacitor is uncharged (0 V across it), so it acts like a <b>plain wire</b>. Only the bulb limits the current:</p>' +
        TEX`I_0 = \frac{\varepsilon}{R_{\text{bulb}}}` + TEX`I_0 = \frac{${M.iv('E')}}{${M.iv('Rb')}}` + TEXA`I_0 = ${M.n(d.I0, 'A')}` + '<p class="st">The bulb is <b>brightest</b> now.</p>' +
        '<h4>2 · A long time later</h4><p class="st">Charge has piled up on the plates until the capacitor’s voltage equals the battery’s. The capacitor now acts like a <b>break</b>:</p>' +
        TEXA`I = ${M.n(0, 'A')}` + '<p class="st">No current, so the <b>bulb is dark</b>. All of ε is across the capacitor:</p>' +
        TEX`Q = C\,V_C` + TEX`Q = (${M.iv('C', 1e-3)}\,\text{F})(${M.iv('E')})` + TEXA`Q = ${M.n(d.Qf, 'C')}` +
        '<h4>3 · At t = ' + H.iv('t') + '</h4><p class="st">In between, the bulb dims as the capacitor fills. Read the graph:</p>' + TEXA`I_{\text{bulb}} = ${M.n(d.Ib, 'A')}` + TEXA`Q = ${M.n(d.Q, 'C')}` +
        '<p class="note">Bigger C (or bigger R) means more charge to deliver, so the bulb stays lit longer. The bulb never comes back on until you discharge the capacitor.</p>';
      return '<h4>1 · The instant the switch closes</h4><p class="st">The capacitor is uncharged, so it acts like a <b>plain wire</b> right across the bulb. That shorts the bulb out: 0 V across it, so <b>no current</b> through it (dark). All the current goes into the capacitor:</p>' +
        TEX`I_0 = \frac{\varepsilon}{R_1}` + TEX`I_0 = \frac{${M.iv('E')}}{${M.iv('R1')}}` + TEXA`I_0 = ${M.n(d.I0, 'A')}` +
        '<h4>2 · A long time later</h4><p class="st">The capacitor is full and acts like a <b>break</b> in its branch, so the current goes through R₁ and the bulb in series:</p>' +
        TEX`I = \frac{\varepsilon}{R_1 + R_{\text{bulb}}}` + TEX`I = \frac{${M.iv('E')}}{${M.iv('R1')} + ${M.iv('Rb')}}` + TEXA`I = ${M.n(d.If, 'A')}` +
        '<p class="st">The capacitor is in parallel with the bulb, so it has the bulb’s voltage:</p>' + TEX`V_C = I\,R_{\text{bulb}}` + TEX`V_C = (${M.n(d.If, 'A')})(${M.iv('Rb')})` + TEXA`V_C = ${M.n(d.Vf, 'V')}` +
        TEX`Q = C\,V_C` + TEX`Q = (${M.iv('C', 1e-3)}\,\text{F})(${M.n(d.Vf, 'V')})` + TEXA`Q = ${M.n(d.Qf, 'C')}` +
        '<h4>3 · At t = ' + H.iv('t') + '</h4><p class="st">The bulb starts dark and brightens as the capacitor charges. Read the graph:</p>' + TEXA`I_{\text{bulb}} = ${M.n(d.Ib, 'A')}` + TEXA`Q = ${M.n(d.Q, 'C')}` +
        '<p class="note">It never gets as bright as with the full battery voltage on it, because R₁ takes some of the voltage.</p>';
    }
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
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'bulb'){
      const par = d.par, TM = 5;
      if (!window._bulbHook){ window._bulbHook = 1; const R = cv.getBoundingClientRect.bind(cv);
        cv.addEventListener('pointerdown', e => { if (S.mode !== 'bulb') return; const r = R(), x = (e.clientX - r.left) * 600 / r.width, y = (e.clientY - r.top) * 330 / r.height; if (x > 275 && x < 385 && y > 298 && y < 324){ S.anim.play = true; S.anim.hold = false; S.anim.tt = -0.6; } }); }
      if (A.reset){ A.play = false; A.hold = false; }
      if (A.play){ A.tt += dt; if (A.tt >= TM){ A.tt = TM; A.play = false; A.hold = true; } }
      const live = A.play || A.hold, tc = live ? A.tt : v.t, open = live && tc < 0, c = open ? { Ib: 0, Ic: 0, Itot: 0, Vc: 0, Q: 0, bright: 0, Qf: d.Qf } : bulbAt(v, par, tc), g = Math.pow(Math.min(1, c.bright), 0.7);
      panelTitle(par ? 'CAPACITOR IN PARALLEL WITH THE BULB' : 'CAPACITOR IN SERIES WITH THE BULB', 10, 18);
      battery(50, 230, 50, 110, v.E + ' V'); wire([[50, 110], [50, 60], [80, 60]]);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(80, 60); open ? ctx.lineTo(104, 40) : ctx.lineTo(120, 60); ctx.stroke(); dotN(80, 60); dotN(120, 60);
      text(open ? 'switch open' : 'switch closed', 96, 38, { align: 'center', font: '600 9px "IBM Plex Mono",monospace', col: open ? '#c43a00' : '#1e7d45' });
      const plates = (x, y) => { ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 20, y); ctx.lineTo(x + 20, y); ctx.moveTo(x - 20, y + 12); ctx.lineTo(x + 20, y + 12); ctx.stroke(); const n = Math.round(8 * Math.min(1, c.Q / d.Qf)); for (let i = 0; i < n; i++){ text('+', x - 16 + i * 4.5, y - 4, { font: '700 9px "Space Grotesk",sans-serif', col: '#c43a00' }); text('−', x - 16 + i * 4.5, y + 22, { font: '700 9px "Space Grotesk",sans-serif', col: '#1546d6' }); } };
      if (!par){
        wire([[120, 60], [218, 60]]); bulb(230, 60, g, null, g < 0.02); text('bulb ' + v.Rb + ' Ω', 230, 96, { align: 'center', font: '700 11px "IBM Plex Mono",monospace' });
        wire([[242, 60], [320, 60], [320, 150]]); plates(320, 150); wire([[320, 162], [320, 280], [50, 280], [50, 230]]); text('C', 346, 160, { font: '700 12px "IBM Plex Mono",monospace' });
        if (c.Ib * v.Rb / v.E > 0.04) curArrow(280, 60, 1, 0, 'I ' + fplain(c.Ib) + ' A', '#1e7d45');
      } else {
        resistor(120, 60, 200, 60, 'R₁ ' + v.R1 + ' Ω'); wire([[200, 60], [350, 60], [350, 150]]); dotN(270, 60); dotN(270, 280);
        wire([[270, 60], [270, 118]]); bulb(270, 130, g, null, g < 0.02); text('bulb ' + v.Rb + ' Ω', 254, 134, { align: 'right', font: '700 11px "IBM Plex Mono",monospace' }); wire([[270, 142], [270, 280]]);
        plates(350, 150); wire([[350, 162], [350, 280], [50, 280], [50, 230]]); text('C', 330, 190, { font: '700 12px "IBM Plex Mono",monospace' });
        if (c.Itot > 0.002) curArrow(160, 88, 1, 0, 'I ' + fplain(c.Itot) + ' A', '#1e7d45'); if (c.Ib / (v.E / v.Rb) > 0.04) curArrow(270, 90, 0, 1, fplain(c.Ib) + ' A', '#1e7d45');
      }
      text('t = ' + (open ? 'switch not closed yet' : fplain(Math.max(0, tc)) + ' s'), 12, 316, { font: '700 12px "Space Grotesk",sans-serif' });
      ctx.fillStyle = '#111'; ctx.fillRect(275, 298, 110, 26); text(live ? '▶ Replay' : '▶ Play from 0', 330, 315, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#fff' });
      panelTitle('CHARGE ON THE CAPACITOR', 395, 18); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(400, 28, 180, 16); ctx.fillStyle = '#1546d6'; ctx.fillRect(400, 28, 180 * Math.min(1, c.Q / d.Qf), 16);
      text('Q = ' + fplain(c.Q * 1000) + ' mC', 400, 62, { font: '700 12px "Space Grotesk",sans-serif' }); text('(full: ' + fplain(d.Qf * 1000) + ' mC)', 400, 78, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('BRIGHTNESS vs TIME', 395, 106); const gx = 410, gw = 170, gb = 292, gh = 150, X = s => gx + gw * s / TM;
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gb - gh); ctx.lineTo(gx, gb); ctx.lineTo(gx + gw, gb); ctx.stroke(); text('brighter', gx + 4, gb - gh + 10, { font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('time →', gx + gw, gb + 13, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 100; i++){ const s = TM * i / 100, b = bulbAt(v, par, s).bright; i ? ctx.lineTo(X(s), gb - gh * b) : ctx.moveTo(X(s), gb - gh * b); } ctx.stroke();
      if (!open){ const b = bulbAt(v, par, tc).bright; ctx.strokeStyle = '#bbb'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(tc), gb); ctx.lineTo(X(tc), gb - gh * b); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(tc), gb - gh * b, 4.5, 0, 7); ctx.fill(); ctx.stroke(); }
      return;
    }
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
