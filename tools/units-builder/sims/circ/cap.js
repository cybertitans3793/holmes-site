// Capacitors (AP 10.6): C = κε₀A/d, Q = CV, E = V/d, U = ½QV. Dielectrics. The classic FRQ: pull the plates apart while connected to the battery vs after disconnecting it.
const EPS = 8.85e-12;
function st(A, d, k, V){ const C = k * EPS * A / d; return { C, Q: C * V, V, E: V / d, U: 0.5 * C * V * V }; }
const SIM = {
  title: 'Capacitors',
  hint: 'ε₀ = 8.85×10⁻¹² C²/(N·m²) · 1 pF = 10⁻¹² F',
  modes: [{ id: 'basic', label: 'Parallel-plate capacitor' }, { id: 'pull', label: 'Pull the plates apart' }],
  opts: [{ id: 'bc', label: 'Battery', modes: ['basic'], choices: [['on', 'Connected'], ['off', 'Disconnected (charged, then removed)']] }, { id: 'conn', label: 'While pulling', modes: ['pull'], choices: [['iso', 'Battery disconnected'], ['bat', 'Battery connected']] }],
  ivs(mode){
    const A = { id: 'A', sym: 'A', symText: 'A', label: 'Plate area', unit: 'cm²', min: 10, max: 1000, step: 10, val: 200 }, V = { id: 'V', sym: 'V', symText: 'V', label: 'Battery voltage', unit: 'V', min: 1, max: 100, step: 1, val: 12 };
    if (mode === 'pull') return [A, V, { id: 'd1', sym: 'd<sub>1</sub>', symText: 'd1', label: 'Starting separation', unit: 'mm', min: 0.5, max: 5, step: 0.1, val: 1 }, { id: 'd2', sym: 'd<sub>2</sub>', symText: 'd2', label: 'Final separation', unit: 'mm', min: 0.5, max: 10, step: 0.1, val: 2, graph: true }];
    return [A, { id: 'd', sym: 'd', symText: 'd', label: 'Plate separation', unit: 'mm', min: 0.5, max: 10, step: 0.1, val: 2, graph: true }, { id: 'k', sym: 'κ', symText: 'kappa', label: 'Dielectric constant (1 = air)', unit: '', min: 1, max: 10, step: 0.1, val: 1, show: x => x.toFixed(1) }, V];
  },
  presets: [{ label: 'Double the separation', mode: 'pull', v: { d1: 1, d2: 2 } }, { label: 'Add glass (κ ≈ 5)', mode: 'basic', v: { k: 5 } }, { label: 'Double the area', mode: 'basic', v: { A: 400 } }],
  calc(v, mode, opt){
    if (mode === 'pull'){ const A = v.A / 1e4, a = st(A, v.d1 / 1000, 1, v.V), bat = (opt.conn || 'iso') === 'bat'; let b;
      if (bat) b = st(A, v.d2 / 1000, 1, v.V); else { const C = EPS * A / (v.d2 / 1000), Q = a.Q, V = Q / C; b = { C, Q, V, E: V / (v.d2 / 1000), U: 0.5 * Q * V }; }
      return { a, b, bat, dU: b.U - a.U, Wbat: bat ? (b.Q - a.Q) * v.V : 0, Wyou: bat ? (b.U - a.U) - (b.Q - a.Q) * v.V : b.U - a.U }; }
    let s = st(v.A / 1e4, v.d / 1000, v.k, v.V); const off = opt.bc === 'off';
    if (off){ const Q = EPS * v.A / 1e4 / (v.d / 1000) * v.V, Vn = Q / s.C; s = { C: s.C, Q, V: Vn, E: Vn / (v.d / 1000), U: 0.5 * Q * Vn }; }
    return { ...s, off, Efree: s.Q / (EPS * v.A / 1e4), Eind: s.Q / (EPS * v.A / 1e4) - s.E };
  },
  dvs(mode){
    if (mode === 'pull') return [{ id: 'C', name: 'Final capacitance', short: 'C', sym: 'C', unit: 'F', f: d => d.b.C }, { id: 'Q', name: 'Final charge', short: 'Q', sym: 'Q', unit: 'C', f: d => d.b.Q }, { id: 'Vf', name: 'Final voltage', short: 'V', sym: 'V', unit: 'V', f: d => d.b.V }, { id: 'E', name: 'Final field between plates', short: 'E', sym: 'E', unit: 'V/m', f: d => d.b.E }, { id: 'U', name: 'Final stored energy', short: 'U', sym: 'U', unit: 'J', f: d => d.b.U }];
    return [{ id: 'C', name: 'Capacitance', short: 'C', sym: 'C', unit: 'F', f: d => d.C }, { id: 'Q', name: 'Charge on each plate', short: 'Q', sym: 'Q', unit: 'C', f: d => d.Q }, { id: 'E', name: 'Field between the plates', short: 'E', sym: 'E', unit: 'V/m', f: d => d.E }, { id: 'U', name: 'Stored energy', short: 'U', sym: 'U', unit: 'J', f: d => d.U }];
  },
  work(v, d, mode){
    if (mode === 'pull'){ const r = (x, y) => (Math.abs(y / x - 1) < 1e-9 ? 'same' : '×' + fnum(y / x)), td = 'style="padding:2px 8px;border-bottom:1px solid #ddd;text-align:right"';
      const rows = [['C', 'F', d.a.C, d.b.C], ['Q', 'C', d.a.Q, d.b.Q], ['V', 'V', d.a.V, d.b.V], ['E', 'V/m', d.a.E, d.b.E], ['U', 'J', d.a.U, d.b.U]].map(([n, u, x, y]) => '<tr><td ' + td.replace('right', 'left') + '><b>' + n + '</b></td><td ' + td + '>' + fnum(x) + '</td><td ' + td + '>' + fnum(y) + '</td><td ' + td + '><b>' + r(x, y) + '</b></td></tr>').join('');
      return '<h4>1 · First ask: what stays constant?</h4><p class="st">' + (d.bat ? '<b>Battery connected → V stays ' + v.V + ' V.</b> Charge flows to or from the battery.' : '<b>Battery disconnected → Q stays the same.</b> The charge has nowhere to go.') + '</p>' +
        '<h4>2 · C = ε₀A/d: separation ×' + fnum(v.d2 / v.d1) + ' → C ×' + fnum(v.d1 / v.d2) + '</h4>' + TEX`C = \frac{\varepsilon_0 A}{d}` +
        '<table style="border-collapse:collapse;font:500 13px \'IBM Plex Mono\',monospace;margin:6px 0"><tr><th></th><th style="padding:2px 8px">before</th><th style="padding:2px 8px">after</th><th style="padding:2px 8px">change</th></tr>' + rows + '</table>' +
        '<h4>3 · Energy</h4>' + (d.bat ? TEX`U = \frac{1}{2}CV^2` + '<p class="st">U drops, but you still had to pull (the plates attract). Your work plus the energy given back to the battery:</p>' + TEXA`W_{\text{you}} = ${M.n(d.Wyou, 'J')}` + TEXA`W_{\text{battery}} = ${M.n(-d.Wbat, 'J')}` + '<p class="st">The battery gains the second amount.</p>' :
          TEX`U = \frac{Q^2}{2C}` + '<p class="st">U grows: the extra energy is the work you did pulling the attracting plates apart.</p>' + TEXA`W = ${M.n(d.Wyou, 'J')}` + '<p class="st">E stays the same because the charge density Q/A is the same.</p>') +
        '<p class="note">FRQ habit: write the constant quantity first, then use C = ε₀A/d, Q = CV, E = V/d and U = ½QV to get each factor.</p>'; }
    return '<h4>1 · Capacitance depends only on the geometry and the material</h4>' + TEX`C = \frac{\kappa\,\varepsilon_0 A}{d}` +
      TEX`C = \frac{(${M.iv('k')})(8.85\times10^{-12})(${M.iv('A', 1e-4)})}{${M.iv('d', 1e-3)}}` + TEXA`C = ${M.n(d.C * 1e12, 'pF')}` +
      (d.off ? '<h4>2 · Charged to ' + H.iv('V') + ' with air, then disconnected</h4>' + TEX`Q = C_{\text{air}}\,V` + TEXA`Q = ${M.n(d.Q, 'C')}` + '<p class="st">That charge is trapped on the plates. With the dielectric:</p>' + TEX`\Delta V = \frac{Q}{C}` + TEXA`\Delta V = ${M.n(d.V, 'V')}` + (v.k > 1 ? '<p class="st">(÷' + fnum(v.k) + ')</p>' : '') :
        '<h4>2 · Connected to ' + H.iv('V') + '</h4>' + TEX`Q = CV` + TEX`Q = (${M.n(d.C, 'F')})(${M.iv('V')})` + TEXA`Q = ${M.n(d.Q, 'C')}` + '<p class="st">On each plate (+Q and −Q).</p>') +
      TEX`E = \frac{\Delta V}{d}` + TEX`E = \frac{${M.n(d.V, 'V')}}{${M.iv('d', 1e-3)}}` + TEXA`E = ${M.n(d.E, 'V/m')}` + '<p class="st">Uniform between the plates, pointing from + to −.</p>' +
      TEX`U = \frac{1}{2}QV` + TEX`U = \frac{1}{2}(${M.n(d.Q, 'C')})(${M.n(d.V, 'V')})` + TEXA`U = ${M.n(d.U, 'J')}` + '<p class="st">This is the area under the Q–V graph.</p>' +
      (v.k > 1 ? '<h4>3 · The dielectric</h4><p class="st">Its molecules polarize and make an opposing field' + (d.off ? '. Q can’t change, so ΔV, E and U all drop by κ = ' + fnum(v.k) + '. (The dielectric gets pulled in: the field does work on it.)' : ' of ' + H.n(d.Eind, 'V/m') + ', so the plates can hold κ = ' + fnum(v.k) + ' times as much charge at the same V.') + '</p>' : '') +
      '<p class="note">Double A → double C. Double d → half C. C doesn’t depend on Q or V: those just tell you how full it is.</p>';
  },
  draw(v, d, mode, opt){
    const cap = (cx, gap, Q, k, conn, lab) => { const yT = 165 - gap / 2, yB = 165 + gap / 2, w = mode === 'pull' ? 100 : 150;
      if (k > 1){ ctx.fillStyle = 'rgba(122,63,176,' + Math.min(0.35, 0.05 * k) + ')'; ctx.fillRect(cx - w / 2, yT, w, gap); text('κ = ' + fplain(k), cx + w / 2 - 4, yB - 6, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#7a3fb0' }); }
      ctx.fillStyle = '#c43a00'; ctx.fillRect(cx - w / 2, yT - 7, w, 7); ctx.fillStyle = '#1546d6'; ctx.fillRect(cx - w / 2, yB, w, 7);
      const n = Math.max(1, Math.min(14, Math.round(Q))); for (let i = 0; i < n; i++){ const x = cx - w / 2 + (i + 0.5) * w / n; text('+', x, yT - 11, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' }); text('−', x, yB + 20, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: '#1546d6' }); if (i % 2 === 0 && gap > 16) arrow(x, yT + 3, x, yB - 3, 'rgba(17,17,17,0.55)', null, { w: 1.5, head: 6 }); }
      if (conn){ ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + w / 2, yT - 4); ctx.lineTo(cx + w / 2 + 30, yT - 4); ctx.lineTo(cx + w / 2 + 30, 150); ctx.moveTo(cx + w / 2 + 30, 180); ctx.lineTo(cx + w / 2 + 30, yB + 4); ctx.lineTo(cx + w / 2, yB + 4); ctx.stroke(); ctx.fillStyle = '#111'; ctx.fillRect(cx + w / 2 + 18, 150, 24, 3); ctx.fillRect(cx + w / 2 + 24, 160, 12, 3); text(v.V + ' V', cx + w / 2 + 46, 160, { font: '700 11px "IBM Plex Mono",monospace' }); }
      if (lab) text(lab, cx, 300, { align: 'center', font: '700 12px "Space Grotesk",sans-serif' }); };
    if (mode === 'pull'){
      panelTitle(d.bat ? 'BATTERY CONNECTED: V CONSTANT' : 'DISCONNECTED: Q CONSTANT', 10, 18);
      const q0 = 8; cap(80, 10 + 18 * v.d1, q0, 1, true, 'before (d = ' + v.d1 + ' mm)'); cap(260, 10 + 18 * v.d2, q0 * d.b.Q / d.a.Q, 1, d.bat, 'after (d = ' + v.d2 + ' mm)');
      panelTitle('AFTER ÷ BEFORE', 395, 18);
      [['C', d.b.C / d.a.C], ['Q', d.b.Q / d.a.Q], ['V', d.b.V / d.a.V], ['E', d.b.E / d.a.E], ['U', d.b.U / d.a.U]].forEach(([n, r], i) => { const w = Math.min(150, 60 * r); ctx.fillStyle = Math.abs(r - 1) < 1e-6 ? '#9aa7b8' : r > 1 ? '#c43a00' : '#1546d6'; ctx.fillRect(425, 44 + i * 34, w, 20); text(n, 418, 59 + i * 34, { align: 'right', font: '700 12px "IBM Plex Mono",monospace' }); text('×' + fplain(r), 430 + w, 59 + i * 34, { font: '600 11px "IBM Plex Mono",monospace' }); });
      ctx.strokeStyle = '#111'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(485, 38); ctx.lineTo(485, 216); ctx.stroke(); ctx.setLineDash([]); text('×1', 485, 230, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    panelTitle('PARALLEL-PLATE CAPACITOR', 10, 18);
    cap(160, 10 + 18 * v.d, Math.max(1, 2 + 2 * Math.log10(d.Q / 1e-10)), v.k, !d.off, 'C = ' + fplain(d.C * 1e12) + ' pF');
    panelTitle('Q vs V (slope = C, area = U)', 395, 18);
    const gx = 410, gy = 260, gw = 170, gh = 200, Vm = 100, Qm = d.C * Vm * 1.1; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    const Y = q => gy - gh * Math.min(1, q / Qm), X = V => gx + gw * V / Vm;
    ctx.fillStyle = 'rgba(30,125,69,0.25)'; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(d.V), Y(d.Q)); ctx.lineTo(X(d.V), Y(0)); ctx.fill();
    if (v.k > 1){ const C0 = d.C / v.k; ctx.setLineDash([5, 4]); ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(Vm), Y(C0 * Vm)); ctx.stroke(); ctx.setLineDash([]); text('air', X(Vm) - 2, Y(C0 * Vm) - 4, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#8a8a8a' }); }
    ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(Vm), Y(d.C * Vm)); ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(d.V), Y(d.Q), 4, 0, 7); ctx.fill();
    text('V (V)', gx + gw, gy + 13, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('Q', gx + 4, gy - gh + 8, { font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('U = ' + fplain(d.U) + ' J', 410, 300, { font: '700 13px "Space Grotesk",sans-serif', col: '#1e7d45' });
  }
};
