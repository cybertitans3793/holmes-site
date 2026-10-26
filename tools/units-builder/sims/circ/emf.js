// Internal Resistance (AP 11.5, IB B.5 ε = I(R + r)): terminal voltage, V vs I graph (slope −r, intercept ε), power to the load. IB: potential divider with an LDR or thermistor.
//@include _schem.js
function rSensor(kind, x){ return kind === 'ldr' ? 1e5 * Math.pow(10 / x, 0.7) : 1e4 * Math.exp(3900 * (1 / (x + 273) - 1 / 298)); }
const SIM = {
  title: 'Internal Resistance',
  hint: 'ε = I(R + r) · V<sub>terminal</sub> = ε − Ir',
  modes: [{ id: 'int', label: 'Battery with internal resistance' }, { id: 'div', label: 'Potential divider (IB)' }],
  opts: [{ id: 'sen', label: 'Sensor', modes: ['div'], choices: [['ldr', 'LDR (light)'], ['th', 'Thermistor (temperature)']] }],
  ivs(mode, opt){
    if (mode === 'div'){ const ldr = (opt && opt.sen || 'ldr') === 'ldr'; return [{ id: 'E', sym: 'ε', symText: 'emf', label: 'Supply', unit: 'V', min: 1, max: 12, step: 0.5, val: 9 }, { id: 'R1', sym: 'R<sub>1</sub>', symText: 'R1', label: 'Fixed resistor', unit: 'kΩ', min: 1, max: 100, step: 1, val: 20 },
      ldr ? { id: 'x', sym: 'light', symText: 'light', label: 'Light level', unit: 'lux', min: 1, max: 1000, step: 1, val: 50, graph: true } : { id: 'x', sym: 'T', symText: 'T', label: 'Temperature', unit: '°C', min: 0, max: 100, step: 1, val: 25, graph: true }]; }
    return [{ id: 'E', sym: 'ε', symText: 'emf', label: 'Battery emf', unit: 'V', min: 1.5, max: 12, step: 0.5, val: 9 },
      { id: 'r', sym: 'r', symText: 'r', label: 'Internal resistance', unit: 'Ω', min: 0, max: 5, step: 0.1, val: 1 },
      { id: 'R', sym: 'R', symText: 'R', label: 'Load resistance', unit: 'Ω', min: 0.1, max: 30, step: 0.1, val: 5, graph: true }];
  },
  presets: [{ label: 'Short circuit', mode: 'int', v: { R: 0.1 } }, { label: 'R = r (max power)', mode: 'int', v: { R: 1, r: 1 } }, { label: 'Dusk', mode: 'div', v: { x: 5 } }],
  calc(v, mode, opt){
    if (mode === 'div'){ const kind = opt.sen || 'ldr', Rs = rSensor(kind, v.x), R1 = v.R1 * 1000, Vout = v.E * Rs / (R1 + Rs); return { kind, Rs, Vout, V1: v.E - Vout, I: v.E / (R1 + Rs) }; }
    const I = v.E / (v.R + v.r), V = I * v.R, lost = I * v.r, P = I * I * v.R, Pmax = v.E * v.E / (4 * Math.max(v.r, 1e-6));
    return { I, V, lost, P, Pmax, eff: v.R / (v.R + v.r), Isc: v.r > 0 ? v.E / v.r : Infinity };
  },
  dvs(mode){
    if (mode === 'div') return [{ id: 'Vout', name: 'Voltage across the sensor (output)', short: 'V_out', sym: 'V<sub>out</sub>', unit: 'V', f: d => d.Vout }, { id: 'Rs', name: 'Sensor resistance', short: 'R_s', sym: 'R<sub>s</sub>', unit: 'Ω', f: d => d.Rs }];
    return [{ id: 'V', name: 'Terminal voltage', short: 'V', sym: 'V<sub>T</sub>', unit: 'V', f: d => d.V }, { id: 'I', name: 'Current', short: 'I', sym: 'I', unit: 'A', f: d => d.I }, { id: 'P', name: 'Power delivered to the load', short: 'P', sym: 'P', unit: 'W', f: d => d.P }];
  },
  work(v, d, mode){
    if (mode === 'div') return '<h4>1 · Two resistors in series share the supply voltage</h4><div class="eq">V<sub>out</sub> = ε × R<sub>s</sub>/(R₁ + R<sub>s</sub>)</div>' +
      '<h4>2 · The sensor’s resistance</h4><div class="eq">' + (d.kind === 'ldr' ? 'LDR: resistance <b>falls</b> as light increases. At ' + v.x + ' lux: ' : 'Thermistor (NTC): resistance <b>falls</b> as temperature rises. At ' + v.x + ' °C: ') + 'R<sub>s</sub> = ' + H.n(d.Rs / 1000, 'kΩ') + '</div>' +
      '<div class="eq">V<sub>out</sub> = ' + H.iv('E') + ' × ' + fnum(d.Rs / 1000) + '/(' + v.R1 + ' + ' + fnum(d.Rs / 1000) + ') = <b>' + H.n(d.Vout, 'V') + '</b></div>' +
      '<p class="note">' + (d.kind === 'ldr' ? 'Darker → bigger R<sub>s</sub> → bigger V<sub>out</sub>. That rising voltage can switch on a street light at dusk.' : 'Hotter → smaller R<sub>s</sub> → smaller V<sub>out</sub>. Swap the positions to make V<sub>out</sub> rise with temperature instead (a fire alarm).') + '</p>';
    return '<h4>1 · Real batteries have internal resistance r</h4><div class="eq">I = ε/(R + r) = ' + H.iv('E') + '/(' + fnum(v.R) + ' + ' + fnum(v.r) + ') = <b>' + H.n(d.I, 'A') + '</b></div>' +
      '<h4>2 · Terminal voltage (what a voltmeter across the battery reads)</h4><div class="eq">V<sub>T</sub> = ε − Ir = ' + v.E + ' − (' + fnum(d.I) + ')(' + fnum(v.r) + ') = <b>' + H.n(d.V, 'V') + '</b> (“lost volts” Ir = ' + H.n(d.lost, 'V') + ')</div>' +
      '<h4>3 · Power to the load</h4><div class="eq">P = I²R = <b>' + H.n(d.P, 'W') + '</b>. Maximum (' + H.n(d.Pmax, 'W') + ') when R = r.</div>' +
      '<p class="note">Lab: vary R, measure V and I, graph V vs I. Straight line: intercept = ε, gradient = −r. (CED 11.5 activity.) Short circuit: I = ε/r = ' + (isFinite(d.Isc) ? H.n(d.Isc, 'A') : '∞') + '.</p>';
  },
  draw(v, d, mode){
    if (mode === 'div'){
      panelTitle('POTENTIAL DIVIDER', 10, 18);
      battery(50, 230, 50, 110, v.E + ' V'); wire([[50, 110], [50, 60], [220, 60], [220, 80]]); resistor(220, 80, 220, 150, 'R₁ ' + v.R1 + ' kΩ'); wire([[220, 150], [220, 175]]);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(205, 175, 30, 60); if (d.kind === 'ldr'){ arrow(260, 170, 240, 190, '#d9a400', null, { w: 2, head: 6 }); arrow(272, 182, 252, 202, '#d9a400', null, { w: 2, head: 6 }); text('LDR', 242, 230, { font: '700 11px "IBM Plex Mono",monospace' }); } else { ctx.beginPath(); ctx.moveTo(195, 245); ctx.lineTo(245, 168); ctx.stroke(); text('thermistor', 242, 230, { font: '700 11px "IBM Plex Mono",monospace' }); }
      wire([[220, 235], [220, 280], [50, 280], [50, 230]]); dotN(220, 162); dotN(220, 280); wire([[220, 162], [330, 162]]); wire([[220, 280], [330, 280]]);
      text('V_out', 336, 226, { font: '700 12px "IBM Plex Mono",monospace', col: '#7a3fb0' }); text(fplain(d.Vout) + ' V', 336, 244, { font: '700 14px "Space Grotesk",sans-serif', col: '#7a3fb0' });
      panelTitle('V_out vs ' + (d.kind === 'ldr' ? 'LIGHT' : 'TEMPERATURE'), 395, 18);
      const gx = 405, gy = 260, gw = 180, gh = 200, xmax = d.kind === 'ldr' ? 1000 : 100, xmin = d.kind === 'ldr' ? 1 : 0, X = x => d.kind === 'ldr' ? gx + gw * Math.log10(x) / 3 : gx + gw * x / 100;
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 100; i++){ const x = d.kind === 'ldr' ? Math.pow(10, 3 * i / 100) : 100 * i / 100, Rs = rSensor(d.kind, x), Vo = v.E * Rs / (v.R1 * 1000 + Rs); i ? ctx.lineTo(X(x), gy - gh * Vo / v.E) : ctx.moveTo(X(x), gy - gh * Vo / v.E); } ctx.stroke();
      ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(X(v.x), gy - gh * d.Vout / v.E, 5, 0, 7); ctx.fill();
      text(d.kind === 'ldr' ? 'light (lux, log)' : 'T (°C)', gx + gw, gy + 13, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    panelTitle('BATTERY (dashed box) + LOAD', 10, 18);
    ctx.setLineDash([5, 4]); ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5; ctx.strokeRect(25, 80, 70, 190); ctx.setLineDash([]); text('battery', 30, 74, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    battery(60, 250, 60, 190, 'ε ' + v.E + 'V'); wire([[60, 190], [60, 170]]); resistor(60, 170, 60, 100, 'r'); wire([[60, 100], [60, 55], [300, 55], [300, 130]]); resistor(300, 130, 300, 200, 'R ' + v.R + 'Ω'); wire([[300, 200], [300, 295], [60, 295], [60, 250]]);
    curArrow(180, 55, 1, 0, 'I = ' + fplain(d.I) + ' A');
    ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(160, 175, 18, 0, 7); ctx.stroke(); text('V', 160, 180, { align: 'center', font: '700 13px "Space Grotesk",sans-serif', col: '#7a3fb0' }); wire([[142, 175], [110, 175], [110, 55]], '#7a3fb0'); wire([[178, 175], [200, 175], [200, 295]], '#7a3fb0'); dotN(110, 55); dotN(200, 295);
    text(fplain(d.V) + ' V', 160, 210, { align: 'center', font: '700 12px "IBM Plex Mono",monospace', col: '#7a3fb0' });
    panelTitle('V vs I (slope −r)', 395, 18);
    const gx = 405, gy = 260, gw = 180, gh = 200, Imax = Math.min(isFinite(d.Isc) ? d.Isc : 20, 20), X = I => gx + gw * I / Imax, Y = V => gy - gh * V / v.E;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(X(0), Y(v.E)); ctx.lineTo(X(Imax), Y(v.E - Imax * v.r)); ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(X(d.I), Y(d.V), 5, 0, 7); ctx.fill();
    text('ε', gx - 10, Y(v.E) + 4, { font: '700 12px "IBM Plex Mono",monospace' }); text('I (A)', gx + gw, gy + 13, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('V_T', gx + 4, gy - gh - 4, { font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('P = ' + fplain(d.P) + ' W  (max ' + fplain(d.Pmax) + ')', 400, 300, { font: '700 12px "Space Grotesk",sans-serif' });
  }
};
