// Pipe Flow: continuity A1v1 = A2v2 and Bernoulli's equation for a pipe that narrows and rises.
const RHO = 1000, P1 = 2.0e5;
const SIM = {
  title: 'Pipe Flow',
  hint: 'water, P₁ = 2.0×10⁵ Pa',
  ivs(){ return [
    { id: 'v1', sym: 'v<sub>1</sub>', symText: 'v1', label: 'Speed in the wide part', unit: 'm/s', min: 0.5, max: 5, step: 0.1, val: 2 },
    { id: 'A1', sym: 'A<sub>1</sub>', symText: 'A1', label: 'Wide part area', unit: 'cm²', min: 10, max: 100, step: 1, val: 40 },
    { id: 'A2', sym: 'A<sub>2</sub>', symText: 'A2', label: 'Narrow part area', unit: 'cm²', min: 2, max: 100, step: 1, val: 10, graph: true },
    { id: 'dy', sym: 'Δy', symText: 'Δy', label: 'Height of part 2 above part 1', unit: 'm', min: -5, max: 5, step: 0.1, val: 2 }]; },
  presets: [{ label: 'Level pipe', v: { dy: 0 } }, { label: 'Same width, uphill', v: { A2: 40, dy: 3 } }, { label: 'Half the area', v: { A1: 40, A2: 20, dy: 0 } }],
  calc(v){
    const v2 = v.v1 * v.A1 / v.A2, Q = v.A1 * 1e-4 * v.v1, dK = 0.5 * RHO * (v2 * v2 - v.v1 * v.v1), dU = RHO * G10 * v.dy, P2 = P1 - dK - dU;
    return { v2, Q, dK, dU, P2, dP: P2 - P1, bad: P2 < 0, L: Q * 60 * 1000 };
  },
  dvs(){ return [
    { id: 'P2', name: 'Pressure in part 2', short: 'P2', sym: 'P<sub>2</sub>', unit: 'Pa', f: d => d.P2 },
    { id: 'v2', name: 'Speed in part 2', short: 'v2', sym: 'v<sub>2</sub>', unit: 'm/s', f: d => d.v2 },
    { id: 'Q', name: 'Volume flow rate', short: 'Q', sym: 'Q', unit: 'm³/s', f: d => d.Q }]; },
  work(v, d){
    return '<h4>1 · Continuity: the same volume passes every point each second</h4><div class="eq">Q = A<sub>1</sub>v<sub>1</sub> = (' + H.n(v.A1 * 1e-4, 'm²') + ')(' + H.iv('v1') + ') = ' + H.n(d.Q, 'm³/s') + ' (' + H.n(d.L, 'L/min') + ')</div>' +
      '<div class="eq">A<sub>1</sub>v<sub>1</sub> = A<sub>2</sub>v<sub>2</sub> → v<sub>2</sub> = v<sub>1</sub>(A<sub>1</sub>/A<sub>2</sub>) = ' + H.iv('v1') + ' × ' + H.n(v.A1 / v.A2) + ' = <b>' + H.n(d.v2, 'm/s') + '</b></div>' +
      '<h4>2 · Bernoulli: energy per volume is the same along the flow</h4><div class="eq">P<sub>1</sub> + ½ρv<sub>1</sub>² + ρgy<sub>1</sub> = P<sub>2</sub> + ½ρv<sub>2</sub>² + ρgy<sub>2</sub></div>' +
      '<div class="eq">P<sub>2</sub> = P<sub>1</sub> − ½ρ(v<sub>2</sub>² − v<sub>1</sub>²) − ρgΔy = 2.0×10<sup>5</sup> − ' + H.p(d.dK) + ' − ' + H.p(d.dU) + ' = <b>' + H.n(d.P2, 'Pa') + '</b></div>' +
      (d.bad ? '<div class="bad">That’s below zero: impossible. The water can’t be pushed up and sped up this much with only 2.0×10⁵ Pa behind it.</div>' : '') +
      '<p class="note">Where the fluid is faster, the pressure is lower (at the same height). Going uphill also costs pressure: ρgΔy = ' + H.n(d.dU, 'Pa') + '.</p>' +
      '<p class="note">Common mistake: “narrow pipe → water squeezed → higher pressure.” The opposite is true for steady flow.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    panelTitle('PIPE (flow →)', 10, 18);
    const h1 = 10 + Math.sqrt(v.A1) * 7, h2 = 10 + Math.sqrt(v.A2) * 7, y1 = 210, y2 = 210 - v.dy * 18, x0 = 20, xa = 140, xb = 230, x3 = 370;
    const top = x => x < xa ? y1 - h1 / 2 : x > xb ? y2 - h2 / 2 : (y1 - h1 / 2) + (x - xa) / (xb - xa) * ((y2 - h2 / 2) - (y1 - h1 / 2));
    const bot = x => x < xa ? y1 + h1 / 2 : x > xb ? y2 + h2 / 2 : (y1 + h1 / 2) + (x - xa) / (xb - xa) * ((y2 + h2 / 2) - (y1 + h1 / 2));
    ctx.fillStyle = '#9cc6f0'; ctx.beginPath(); for (let x = x0; x <= x3; x += 5) ctx.lineTo(x, top(x)); for (let x = x3; x >= x0; x -= 5) ctx.lineTo(x, bot(x)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = x0; x <= x3; x += 5) ctx.lineTo(x, top(x)); ctx.stroke(); ctx.beginPath(); for (let x = x0; x <= x3; x += 5) ctx.lineTo(x, bot(x)); ctx.stroke();
    // moving dots (faster in the narrow part)
    for (let k = 0; k < 6; k++){ const ph = (A.t * v.v1 * 0.15 + k / 6) % 1, x = x0 + ph * (xa - x0); ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(x, y1, 3, 0, 7); ctx.fill(); }
    for (let k = 0; k < 6; k++){ const ph = (A.t * Math.min(d.v2, 20) * 0.15 + k / 6) % 1, x = xb + ph * (x3 - xb); ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(x, y2, 3, 0, 7); ctx.fill(); }
    // pressure gauges as vertical columns
    const pc = (x, y, h, P, lab) => { const ph = Math.max(0, P) / 2.5e5 * 90; ctx.fillStyle = '#eee'; ctx.fillRect(x - 5, y - h / 2 - 95, 10, 95); ctx.fillStyle = '#c43a00'; ctx.fillRect(x - 5, y - h / 2 - ph, 10, ph); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.strokeRect(x - 5, y - h / 2 - 95, 10, 95);
      text(lab, x + 10, y - h / 2 - 80, { font: '700 10px "IBM Plex Mono",monospace' }); };
    pc(70, y1, h1, P1, '1'); pc(300, y2, h2, d.P2, '2');
    text('v₁ = ' + fplain(v.v1) + ' m/s', 30, y1 + h1 / 2 + 18, { font: '600 10px "IBM Plex Mono",monospace' }); text('v₂ = ' + fplain(d.v2) + ' m/s', 250, Math.min(300, y2 + h2 / 2 + 18), { font: '600 10px "IBM Plex Mono",monospace' });
    text(d.bad ? 'P₂ < 0: impossible' : 'P₂ = ' + fplain(d.P2) + ' Pa', 12, 318, { font: '700 12px "Space Grotesk",sans-serif', col: d.bad ? '#c43a00' : '#111' });
    panelTitle('BERNOULLI BUDGET (Pa)', 395, 18);
    const items = [['P₁', P1, '#c43a00'], ['½ρv₁²', 0.5 * RHO * v.v1 * v.v1, '#1546d6'], ['P₂', Math.max(d.P2, 0), '#c43a00'], ['½ρv₂²', 0.5 * RHO * d.v2 * d.v2, '#1546d6'], ['ρgΔy', Math.max(d.dU, 0), '#1e7d45']];
    const mx = Math.max(...items.map(i => i[1]), 1);
    items.forEach(([l, q, c], i) => { const y = 40 + i * 24 + (i >= 2 ? 14 : 0), w = 80 * q / mx; ctx.fillStyle = c; ctx.fillRect(470, y, w, 14); text(l, 465, y + 11, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(q), 474 + w, y + 11, { font: '600 9px "IBM Plex Mono",monospace' }); });
    text('at 1', 400, 36, { font: '600 9px "IBM Plex Mono",monospace', col: '#888' }); text('at 2', 400, 98, { font: '600 9px "IBM Plex Mono",monospace', col: '#888' });
  }
};
