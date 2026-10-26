// Reading Instruments (IB Tools): the uncertainty of a single reading. Ruler, analog meter, digital scale. Uncertainty from the instrument only.
const SIM = {
  title: 'Reading Instruments',
  modes: [{ id: 'ruler', label: 'Ruler' }, { id: 'meter', label: 'Analog meter' }, { id: 'digital', label: 'Digital scale' }],
  ivs(mode){
    if (mode === 'ruler') return [{ id: 'L', sym: 'L', symText: 'L', label: 'True length of the pencil', unit: 'cm', min: 3, max: 14.5, step: 0.01, val: 8.37, show: x => '?' }, { id: 'x0', sym: 'x<sub>0</sub>', symText: 'x0', label: 'Where the left end sits on the ruler', unit: 'cm', min: 0, max: 2, step: 0.01, val: 1.0 }];
    if (mode === 'meter') return [{ id: 'I', sym: 'I', symText: 'I', label: 'True current', unit: 'A', min: 0, max: 5, step: 0.001, val: 2.36, show: x => '?' }, { id: 'zero', sym: 'zero', symText: 'zero', label: 'Zero error (needle offset)', unit: 'A', min: -0.3, max: 0.3, step: 0.05, val: 0 }];
    if (mode === 'digital') return [{ id: 'm', sym: 'm', symText: 'm', label: 'True mass', unit: 'g', min: 0, max: 500, step: 0.001, val: 152.347, show: x => '?' }, { id: 'res', sym: 'res', symText: 'res', label: 'Decimal places shown', unit: '', min: 0, max: 2, step: 1, val: 1, show: x => x.toFixed(0) }];
    return [];
  },
  presets: [{ label: 'Zero error', mode: 'meter', v: { zero: 0.2 } }, { label: 'Short pencil', mode: 'ruler', v: { L: 3.2 } }, { label: 'No decimals', mode: 'digital', v: { res: 0 } }],
  calc(v, mode){
    const r = (x, s) => Math.round(x / s) * s;
    if (mode === 'ruler'){ const e1 = r(v.x0, 0.05), e2 = r(v.x0 + v.L, 0.05), L = e2 - e1, dL = 0.1; return { e1, e2, read: L, d: dL, u: 'cm', pct: 100 * dL / L, each: 0.05 }; }
    if (mode === 'meter'){ const shown = v.I + v.zero, read = r(shown, 0.05), d = 0.05; const corrected = read - v.zero; return { read, d, u: 'A', pct: corrected > 0 ? 100 * d / corrected : NaN, corrected }; }
    if (mode === 'digital'){ const s = Math.pow(10, -v.res), read = r(v.m, s), d = s; return { read, d, u: 'g', pct: read ? 100 * d / read : NaN, s }; }
    return {};
  },
  dvs(){ return [{ id: 'd', name: 'Absolute uncertainty', short: 'Δ', sym: 'Δ', unit: '', f: d => d.d }, { id: 'pct', name: 'Percentage uncertainty', short: '%', sym: '%Δ', unit: '%', f: d => d.pct }]; },
  work(v, d, mode){
    const fx = (x, dp) => (Math.round(x * 10 ** dp + 1e-6) / 10 ** dp).toFixed(dp);
    const steps = '<h4>How to read any instrument</h4><div class="eq"><b>①</b> Find the smallest division (analog) or the last digit (digital). That’s the <b>resolution</b>.<br>' +
      '<b>②</b> Uncertainty of one reading: <b>analog → ± half the smallest division</b>; <b>digital → ± one in the last digit</b>.<br>' +
      '<b>③</b> Before you read: check the zero, and look straight at the scale (no parallax).<br>' +
      '<b>④</b> If the measurement is the difference of two readings (both ends of an object), the two uncertainties <b>add</b>.<br>' +
      '<b>⑤</b> Write it as (value ± uncertainty) unit: uncertainty to 1 significant figure, value to the same decimal place.</div>';
    if (mode === 'ruler') return steps +
      '<h4>1 · Resolution and uncertainty of one reading</h4><div class="eq">Smallest division = 1 mm = 0.1 cm (analog) → each reading is ± ½ × 0.1 = <b>±0.05 cm</b></div>' +
      '<h4>2 · Read both ends</h4><div class="eq">Left end x<sub>1</sub> = ' + fx(d.e1, 2) + ' cm, right end x<sub>2</sub> = ' + fx(d.e2, 2) + ' cm (eye straight above each end)</div>' +
      '<div class="eq">L = x<sub>2</sub> − x<sub>1</sub> = ' + fx(d.e2, 2) + ' − ' + fx(d.e1, 2) + ' = <b>' + fx(d.read, 2) + ' cm</b></div>' +
      '<h4>3 · Two readings → add the uncertainties</h4><div class="eq">ΔL = 0.05 + 0.05 = <b>0.1 cm</b></div>' +
      '<h4>4 · Write it properly</h4><div class="eq">ΔL has 1 decimal place, so round L to 1 decimal place: <b>L = (' + fx(d.read, 1) + ' ± 0.1) cm</b></div>' +
      '<h4>5 · Percentage uncertainty</h4><div class="eq">ΔL/L × 100 = 0.1 / ' + fx(d.read, 1) + ' × 100 = <b>' + H.n(d.pct, '%') + '</b></div>' +
      '<p class="note">Lining the pencil up with 0 doesn’t remove the first reading: you still judge where the end sits. A longer object has the same ΔL, so a smaller percentage uncertainty.</p>';
    if (mode === 'meter') return steps +
      '<h4>1 · Resolution and uncertainty</h4><div class="eq">Labeled every 1 A with 10 divisions between labels → smallest division 0.1 A (analog) → <b>±0.05 A</b></div>' +
      '<h4>2 · Check the zero</h4>' + (v.zero ? '<div class="bad">With no current the needle already sits at ' + H.iv('zero') + ': a zero error. It is systematic: every reading is off by the same amount.</div>' : '<div class="eq">The needle sits on 0 with no current: no zero error.</div>') +
      '<h4>3 · Read the needle (straight on)</h4><div class="eq">Nearest half-division: the needle reads <b>' + fx(d.read, 2) + ' A</b></div>' +
      (v.zero ? '<div class="eq">Correct for the zero error: ' + fx(d.read, 2) + ' − (' + H.p(v.zero) + ') = <b>' + fx(d.corrected, 2) + ' A</b></div>' : '') +
      '<h4>4 · Write it properly</h4><div class="eq"><b>I = (' + fx(v.zero ? d.corrected : d.read, 2) + ' ± 0.05) A</b>, ' + H.n(d.pct, '%') + '</div>' +
      '<p class="note">One reading here (the scale starts at a fixed zero), so no doubling. Correcting a zero error doesn’t change the uncertainty, only the value.</p>';
    return steps +
      '<h4>1 · Resolution and uncertainty</h4><div class="eq">The last digit shown is the ' + (v.res ? fx(d.s, v.res) + ' g' : '1 g') + ' place (digital) → <b>Δm = ±' + fx(d.s, v.res) + ' g</b></div>' +
      '<h4>2 · Check the zero</h4><div class="eq">Press tare with nothing (or just the container) on the scale so it reads 0 first.</div>' +
      '<h4>3 · Write it properly</h4><div class="eq">Display ' + fx(d.read, v.res) + ' g → <b>m = (' + fx(d.read, v.res) + ' ± ' + fx(d.s, v.res) + ') g</b></div>' +
      '<h4>4 · Percentage uncertainty</h4><div class="eq">' + fx(d.s, v.res) + ' / ' + fx(d.read, v.res) + ' × 100 = <b>' + H.n(d.pct, '%') + '</b></div>' +
      '<p class="note">Don’t halve a digital resolution: you can’t see between digits. More decimals means more precise, not necessarily more accurate (a badly calibrated scale is still wrong).</p>';
  },
  draw(v, d, mode){
    panelTitle(({ ruler: 'MEASURE THE PENCIL', meter: 'READ THE AMMETER', digital: 'READ THE SCALE' })[mode], 10, 18);
    if (mode === 'ruler'){
      const x0 = 30, sc = 34;   // px per cm, 16 cm ruler
      ctx.fillStyle = '#f3e2a6'; ctx.fillRect(x0 - 10, 150, 16 * sc + 20, 60); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.strokeRect(x0 - 10, 150, 16 * sc + 20, 60);
      for (let mm = 0; mm <= 160; mm++){ const x = x0 + mm * sc / 10, h = mm % 10 === 0 ? 22 : mm % 5 === 0 ? 15 : 9; ctx.fillStyle = '#111'; ctx.fillRect(x, 150, 1, h); if (mm % 10 === 0) text(String(mm / 10), x, 186, { align: 'center', font: '600 11px "IBM Plex Mono",monospace' }); }
      text('cm', x0 + 16 * sc - 4, 204, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      const pa = x0 + v.x0 * sc, pb = x0 + (v.x0 + v.L) * sc; ctx.fillStyle = '#ff6a2b'; ctx.fillRect(pa, 110, pb - pa - 16, 30); ctx.fillStyle = '#f2c7a0'; ctx.beginPath(); ctx.moveTo(pb - 16, 110); ctx.lineTo(pb, 125); ctx.lineTo(pb - 16, 140); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#111'; ctx.strokeRect(pa, 110, pb - pa - 16, 30);
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#c43a00'; [pa, pb].forEach(x => { ctx.beginPath(); ctx.moveTo(x, 100); ctx.lineTo(x, 172); ctx.stroke(); }); ctx.setLineDash([]);
      text('zoom in: each tick is 1 mm', 12, 240, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text('L = (' + (Math.round(d.read * 10 + 1e-6) / 10).toFixed(1) + ' ± 0.1) cm', 12, 300, { font: '700 14px "Space Grotesk",sans-serif' });
    } else if (mode === 'meter'){
      const cx = 300, cy = 260, R = 190; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R + 10, PI * 1.12, PI * 1.88); ctx.lineTo(cx, cy); ctx.closePath(); ctx.fill(); ctx.stroke();
      const ang = q => PI * 1.2 + (q / 5) * PI * 0.6;
      for (let k = 0; k <= 50; k++){ const a = ang(k / 10), r1 = R - (k % 10 === 0 ? 22 : k % 5 === 0 ? 15 : 9); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); ctx.lineTo(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)); ctx.stroke(); if (k % 10 === 0) text(String(k / 10), cx + (R - 36) * Math.cos(a), cy + (R - 36) * Math.sin(a) + 4, { align: 'center', font: '700 13px "IBM Plex Mono",monospace' }); }
      const na = ang(Math.max(-0.2, Math.min(5.2, v.I + v.zero))); ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (R - 4) * Math.cos(na), cy + (R - 4) * Math.sin(na)); ctx.stroke();
      text('A', cx, cy - 40, { align: 'center', font: '700 18px "Space Grotesk",sans-serif' });
      text((v.zero ? 'corrected ' : '') + 'I = (' + d.corrected.toFixed(2) + ' ± 0.05) A', 12, 300, { font: '700 14px "Space Grotesk",sans-serif' });
    } else {
      ctx.fillStyle = '#9aa7b8'; ctx.fillRect(130, 200, 260, 60); ctx.fillStyle = '#ddd'; ctx.fillRect(150, 185, 220, 16); ctx.fillStyle = '#c98a3c'; ctx.fillRect(220, 130, 80, 55);
      ctx.fillStyle = '#111'; ctx.fillRect(190, 212, 140, 38); text(d.read.toFixed(v.res) + ' g', 320, 240, { align: 'right', font: '700 22px "IBM Plex Mono",monospace', col: '#7dff9a' });
      text('m = (' + d.read.toFixed(v.res) + ' ± ' + d.s.toFixed(v.res) + ') g', 12, 300, { font: '700 14px "Space Grotesk",sans-serif' });
    }
    text(isFinite(d.pct) ? 'percentage uncertainty ' + fplain(d.pct) + '%' : '', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
