// Resistance & Ohm's Law (AP 11.1–11.3, 11.4 power; IB B.5): R = ρL/A for a wire, and I–V characteristics of a resistor, a filament lamp and a diode.
//@include _schem.js
const MAT = { cu: ['copper', 1.7e-8], al: ['aluminum', 2.8e-8], ni: ['nichrome', 1.1e-6], gr: ['graphite (pencil lead)', 3.5e-5] };
function devI(V, dev, R0){ if (dev === 'lamp') return V / (R0 * (1 + 0.15 * Math.abs(V))); if (dev === 'diode') return V <= 0 ? 0 : 1e-9 * (Math.exp(V / 0.032) - 1) > 2 ? 2 : 1e-9 * (Math.exp(V / 0.032) - 1); return V / R0; }
const SIM = {
  title: 'Resistance & Ohm’s Law',
  hint: 'R = ρL/A · V = IR · P = IV',
  modes: [{ id: 'wire', label: 'Resistance of a wire' }, { id: 'iv', label: 'I–V characteristics' }],
  opts: [{ id: 'mat', label: 'Material', modes: ['wire'], choices: [['ni', 'Nichrome'], ['cu', 'Copper'], ['al', 'Aluminum'], ['gr', 'Graphite']] }, { id: 'dev', label: 'Device', modes: ['iv'], choices: [['res', 'Resistor'], ['lamp', 'Filament lamp'], ['diode', 'Diode']] }],
  ivs(mode, opt){
    if (mode === 'iv'){ const di = (opt && opt.dev) === 'diode'; return [{ id: 'V', sym: 'V', symText: 'V', label: 'Potential difference across it', unit: 'V', min: di ? -1 : -12, max: di ? 1 : 12, step: di ? 0.01 : 0.1, val: di ? 0.6 : 6, graph: true },
      { id: 'R0', sym: 'R<sub>0</sub>', symText: 'R0', label: di ? '(not used for the diode)' : 'Resistance (cold, for the lamp)', unit: 'Ω', min: 2, max: 50, step: 1, val: 10 }]; }
    return [{ id: 'L', sym: 'L', symText: 'L', label: 'Length', unit: 'm', min: 0.1, max: 5, step: 0.05, val: 1, graph: true },
      { id: 'dmm', sym: 'd', symText: 'd', label: 'Wire diameter', unit: 'mm', min: 0.1, max: 2, step: 0.05, val: 0.5 },
      { id: 'V', sym: 'V', symText: 'V', label: 'Battery voltage', unit: 'V', min: 0.5, max: 12, step: 0.5, val: 3 }];
  },
  presets: [{ label: 'Double the length', mode: 'wire', v: { L: 2 } }, { label: 'Double the diameter', mode: 'wire', v: { dmm: 1 } }, { label: 'Reverse the voltage', mode: 'iv', v: { V: -6 } }],
  calc(v, mode, opt){
    if (mode === 'iv'){ const dev = opt.dev || 'res', I = devI(v.V, dev, v.R0); return { dev, I, R: Math.abs(I) > 1e-9 ? v.V / I : Infinity, P: v.V * I }; }
    const [nm, rho] = MAT[opt.mat || 'ni'], A = PI * Math.pow(v.dmm / 2000, 2), R = rho * v.L / A, I = v.V / R;
    return { nm, rho, A, R, I, P: v.V * I };
  },
  dvs(mode){
    if (mode === 'iv') return [{ id: 'I', name: 'Current', short: 'I', sym: 'I', unit: 'A', f: d => d.I }, { id: 'R', name: 'Resistance V/I at this point', short: 'R', sym: 'R', unit: 'Ω', f: d => isFinite(d.R) ? d.R : NaN }];
    return [{ id: 'R', name: 'Resistance', short: 'R', sym: 'R', unit: 'Ω', f: d => d.R }, { id: 'I', name: 'Current', short: 'I', sym: 'I', unit: 'A', f: d => d.I }, { id: 'P', name: 'Power (heating)', short: 'P', sym: 'P', unit: 'W', f: d => d.P }];
  },
  work(v, d, mode){
    if (mode === 'iv'){
      const head = '<h4>1 · Resistance at a point: R = V/I (not the slope of the graph)</h4><div class="eq">V = ' + H.iv('V') + ', I = ' + H.n(d.I, 'A') + ' → R = <b>' + (isFinite(d.R) ? H.n(d.R, 'Ω') : '∞ (no current)') + '</b></div>';
      if (d.dev === 'lamp') return head + '<h4>2 · Filament lamp: non-ohmic</h4><div class="eq">More current → hotter filament → atoms vibrate more → more collisions → <b>higher resistance</b>. The I–V curve bends over.</div><p class="note">Cold resistance R₀ = ' + v.R0 + ' Ω. Compare R at 2 V and at 10 V.</p>';
      if (d.dev === 'diode') return head + '<h4>2 · Diode: current one way only</h4><div class="eq">Below about 0.6 V almost no current; above it the current rises very steeply. Reverse voltage: essentially zero current.</div><p class="note">IB: I–V characteristics of non-ohmic devices. Why is a single “resistance” meaningless for a diode?</p>';
      return head + '<h4>2 · Ohmic resistor</h4><div class="eq">Straight line through the origin: R is the same at every voltage, and reversing V just reverses I.</div><p class="note">Power P = IV = ' + H.n(d.P, 'W') + ' is turned into thermal energy.</p>';
    }
    return '<h4>1 · Cross-sectional area</h4><div class="eq">A = πr² = π(' + fnum(v.dmm / 2000) + ' m)² = ' + H.n(d.A, 'm²') + '</div>' +
      '<h4>2 · Resistance: R = ρL/A</h4><div class="eq">' + d.nm + ': ρ = ' + fnum(d.rho) + ' Ω·m → R = (' + fnum(d.rho) + ')(' + H.iv('L') + ')/(' + fnum(d.A) + ') = <b>' + H.n(d.R, 'Ω') + '</b></div>' +
      '<h4>3 · Ohm’s law and power</h4><div class="eq">I = V/R = <b>' + H.n(d.I, 'A') + '</b> &nbsp; P = IV = ' + H.n(d.P, 'W') + '</div>' +
      '<p class="note">Double L → double R. Double the <i>diameter</i> → 4× the area → ¼ R. Lab: graph R vs L; the slope is ρ/A.</p>';
  },
  draw(v, d, mode){
    if (mode === 'iv'){
      panelTitle('CIRCUIT', 10, 18);
      battery(70, 250, 70, 80, Math.abs(v.V).toFixed(1) + ' V'); wire([[70, 80], [70, 60], [300, 60], [300, 130]]); wire([[300, 200], [300, 270], [70, 270], [70, 250]]);
      if (d.dev === 'lamp') bulb(300, 165, Math.min(1, Math.abs(d.P) / 15), 'lamp'); else if (d.dev === 'diode'){ wire([[300, 130], [300, 150]]); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.moveTo(288, 150); ctx.lineTo(312, 150); ctx.lineTo(300, 172); ctx.fill(); ctx.fillRect(288, 172, 24, 3); wire([[300, 175], [300, 200]]); } else { resistor(300, 130, 300, 200, v.R0 + ' Ω'); }
      if (d.dev === 'lamp') wire([[300, 130], [300, 154]]), wire([[300, 176], [300, 200]]);
      if (Math.abs(d.I) > 1e-6) curArrow(170, 60, d.I > 0 ? 1 : -1, 0, fplain(Math.abs(d.I)) + ' A');
      text('I = ' + fplain(d.I) + ' A   R = ' + (isFinite(d.R) ? fplain(d.R) + ' Ω' : '∞'), 12, 310, { font: '700 13px "Space Grotesk",sans-serif' });
      panelTitle('I–V GRAPH', 395, 18);
      const gx = 490, gy = 170, gw = 95, gh = 120, Vm = d.dev === 'diode' ? 1 : 12, Im = d.dev === 'diode' ? 2 : Math.max(...Array.from({ length: 41 }, (_, i) => Math.abs(devI(Vm * i / 40, d.dev, v.R0)))) * 1.1 || 1;
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx - gw, gy); ctx.lineTo(gx + gw, gy); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy + gh); ctx.stroke();
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 120; i++){ const V = -Vm + 2 * Vm * i / 120, I = devI(V, d.dev, v.R0); i ? ctx.lineTo(gx + gw * V / Vm, gy - gh * Math.max(-1, Math.min(1, I / Im))) : ctx.moveTo(gx + gw * V / Vm, gy - gh * Math.max(-1, Math.min(1, I / Im))); } ctx.stroke();
      ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(gx + gw * v.V / Vm, gy - gh * Math.max(-1, Math.min(1, d.I / Im)), 5, 0, 7); ctx.fill();
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#ff6a2b'; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw * v.V / Vm, gy - gh * Math.max(-1, Math.min(1, d.I / Im))); ctx.stroke(); ctx.setLineDash([]);
      text('V', gx + gw, gy + 13, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('I', gx + 6, gy - gh + 8, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text('dashed: R = V/I', 400, 310, { font: '600 10px "IBM Plex Mono",monospace', col: '#ff6a2b' });
      return;
    }
    panelTitle('MEASURING A WIRE', 10, 18);
    const len = 60 + 55 * v.L, th = 2 + 5 * v.dmm; ctx.fillStyle = { ni: '#9aa7b8', cu: '#c47a3a', al: '#c9c9c9', gr: '#333' }[Object.keys(MAT).find(k => MAT[k][0] === d.nm)];
    ctx.fillRect(40, 150 - th / 2, len, th); ctx.fillStyle = '#c43a00'; ctx.fillRect(34, 140, 10, 20); ctx.fillRect(36 + len, 140, 10, 20);
    battery(40, 260, 40 + len, 260, v.V + ' V'); wire([[40, 260], [20, 260], [20, 150], [34, 150]]); wire([[40 + len, 260], [70 + len > 380 ? 380 : 70 + len, 260], [70 + len > 380 ? 380 : 70 + len, 150], [46 + len, 150]]);
    curArrow(40 + len / 2, 120, 1, 0, 'I = ' + fplain(d.I) + ' A');
    text('L = ' + v.L + ' m, d = ' + v.dmm + ' mm', 40, 200, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('R = ' + fplain(d.R) + ' Ω', 12, 310, { font: '700 14px "Space Grotesk",sans-serif' });
    panelTitle('RESISTIVITY ρ (Ω·m)', 395, 18);
    Object.values(MAT).forEach(([n, r], i) => { const w = 10 + 16 * (Math.log10(r) + 8.5); ctx.fillStyle = n === d.nm ? '#ff6a2b' : '#bbb'; ctx.fillRect(400, 44 + i * 30, w, 18); text(n.split(' ')[0] + ' ' + fplain(r), 405 + w, 57 + i * 30, { font: '600 10px "IBM Plex Mono",monospace' }); });
    text('(log scale)', 400, 175, { font: '500 9px "IBM Plex Mono",monospace', col: '#8a8a8a' });
  }
};
