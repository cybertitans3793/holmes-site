// Reading Instruments (IB Tools): the uncertainty of a single reading. Ruler, analog meter, digital scale, and a hand-timed stopwatch.
const SIM = {
  title: 'Reading Instruments',
  modes: [{ id: 'ruler', label: 'Ruler' }, { id: 'meter', label: 'Analog meter' }, { id: 'digital', label: 'Digital scale' }, { id: 'watch', label: 'Stopwatch' }],
  ivs(mode){
    if (mode === 'ruler') return [{ id: 'L', sym: 'L', symText: 'L', label: 'True length of the pencil', unit: 'cm', min: 3, max: 14.5, step: 0.01, val: 8.37, show: x => '?' }, { id: 'x0', sym: 'x<sub>0</sub>', symText: 'x0', label: 'Where the left end sits on the ruler', unit: 'cm', min: 0, max: 2, step: 0.01, val: 1.0 }];
    if (mode === 'meter') return [{ id: 'I', sym: 'I', symText: 'I', label: 'True current', unit: 'A', min: 0, max: 5, step: 0.001, val: 2.36, show: x => '?' }, { id: 'zero', sym: 'zero', symText: 'zero', label: 'Zero error (needle offset)', unit: 'A', min: -0.3, max: 0.3, step: 0.05, val: 0 }];
    if (mode === 'digital') return [{ id: 'm', sym: 'm', symText: 'm', label: 'True mass', unit: 'g', min: 0, max: 500, step: 0.001, val: 152.347, show: x => '?' }, { id: 'res', sym: 'res', symText: 'res', label: 'Decimal places shown', unit: '', min: 0, max: 2, step: 1, val: 1, show: x => x.toFixed(0) }];
    return [{ id: 'T', sym: 'T', symText: 'T', label: 'True period of a pendulum', unit: 's', min: 0.5, max: 3, step: 0.01, val: 1.42, show: x => '?' }, { id: 'N', sym: 'N', symText: 'N', label: 'Oscillations timed', unit: '', min: 1, max: 20, step: 1, val: 1, graph: true, show: x => x.toFixed(0) }, { id: 'rt', sym: 't<sub>r</sub>', symText: 'tr', label: 'Your reaction-time uncertainty', unit: 's', min: 0.05, max: 0.3, step: 0.01, val: 0.2 }];
  },
  presets: [{ label: 'Time 10 swings', mode: 'watch', v: { N: 10 } }, { label: 'Zero error', mode: 'meter', v: { zero: 0.2 } }],
  calc(v, mode){
    const r = (x, s) => Math.round(x / s) * s;
    if (mode === 'ruler'){ const e1 = r(v.x0, 0.05), e2 = r(v.x0 + v.L, 0.05), L = e2 - e1, dL = 0.1; return { e1, e2, read: L, d: dL, u: 'cm', pct: 100 * dL / L, each: 0.05 }; }
    if (mode === 'meter'){ const shown = v.I + v.zero, read = r(shown, 0.05), d = 0.05; return { read, d, u: 'A', pct: read ? 100 * d / read : NaN, corrected: read - v.zero }; }
    if (mode === 'digital'){ const s = Math.pow(10, -v.res), read = r(v.m, s), d = s; return { read, d, u: 'g', pct: read ? 100 * d / read : NaN, s }; }
    const total = v.N * v.T, read = r(total, 0.01), dTot = v.rt, Tm = read / v.N, dT = dTot / v.N; return { total, read, dTot, Tm, d: dT, u: 's', pct: 100 * dT / Tm };
  },
  dvs(){ return [{ id: 'd', name: 'Absolute uncertainty', short: 'Δ', sym: 'Δ', unit: '', f: d => d.d }, { id: 'pct', name: 'Percentage uncertainty', short: '%', sym: '%Δ', unit: '%', f: d => d.pct }]; },
  work(v, d, mode){
    const fx = (x, dp) => (Math.round(x * 10 ** dp + 1e-6) / 10 ** dp).toFixed(dp);
    if (mode === 'ruler') return '<h4>1 · Analog scale: uncertainty = ± half the smallest division</h4><div class="eq">Smallest division 1 mm = 0.1 cm → each reading ±0.05 cm</div>' +
      '<h4>2 · A length needs two readings</h4><div class="eq">Left end ' + fx(d.e1, 2) + ' cm, right end ' + fx(d.e2, 2) + ' cm → L = ' + fx(d.e2, 2) + ' − ' + fx(d.e1, 2) + ' = <b>' + fx(d.read, 2) + ' cm</b></div>' +
      '<div class="eq">Two readings, so the uncertainties add: ±0.05 + 0.05 = <b>±0.1 cm</b> → L = (' + fx(d.read, 1) + ' ± 0.1) cm</div>' +
      '<h4>3 · Percentage uncertainty</h4><div class="eq">0.1 / ' + fx(d.read, 2) + ' × 100 = <b>' + H.n(d.pct, '%') + '</b>. Longer objects → smaller percentage uncertainty.</div>' +
      '<p class="note">Write the value to the same decimal place as the uncertainty. Starting from 0 cm instead doesn’t remove the first reading: you still line up the end by eye.</p>';
    if (mode === 'meter') return '<h4>1 · Analog meter: ± half the smallest division</h4><div class="eq">Divisions of 0.1 A → reading ±0.05 A. The needle points at <b>' + fx(d.read, 2) + ' A</b></div>' +
      '<div class="eq">I = (' + fx(d.read, 2) + ' ± 0.05) A, ' + H.n(d.pct, '%') + '</div>' +
      (v.zero ? '<h4>2 · Zero error: a systematic error</h4><div class="bad">With no current the needle already sits at ' + H.iv('zero') + '. Every reading is off by the same amount, and repeating doesn’t help.</div><div class="eq">Corrected: ' + fx(d.read, 2) + ' − ' + H.p(v.zero) + ' = <b>' + fx(d.corrected, 2) + ' A</b></div>'
        : '<p class="note">Check for a zero error first: with nothing connected, does the needle sit exactly on 0? Try the preset.</p>') +
      '<p class="note">Read the scale straight on, not from an angle (parallax).</p>';
    if (mode === 'digital') return '<h4>1 · Digital: ± the last digit shown</h4><div class="eq">The display shows ' + fx(d.read, v.res) + ' g, so Δm = ±' + fx(d.s, v.res) + ' g → m = (' + fx(d.read, v.res) + ' ± ' + fx(d.s, v.res) + ') g</div>' +
      '<div class="eq">Percentage: <b>' + H.n(d.pct, '%') + '</b></div>' +
      '<p class="note">More decimal places → more precise, not necessarily more accurate: a badly calibrated scale can show 3 decimals and still be wrong.</p>';
    return '<h4>1 · The stopwatch shows 0.01 s, but your reaction time is the real uncertainty</h4><div class="eq">Uncertainty in a hand-timed reading ≈ ±' + H.iv('rt') + ' (reaction time), not ±0.01 s</div>' +
      '<h4>2 · Time many oscillations and divide</h4><div class="eq">' + H.iv('N') + ' oscillations: t = (' + d.read.toFixed(2) + ' ± ' + v.rt.toFixed(2) + ') s</div>' +
      '<div class="eq">T = t/N = ' + d.Tm.toFixed(3) + ' s, ΔT = Δt/N = ' + v.rt.toFixed(2) + '/' + v.N + ' = <b>±' + H.n(d.d, 's') + '</b> (' + H.n(d.pct, '%') + ')</div>' +
      '<p class="note">The reaction-time error is made once for the whole run, so spreading it over N oscillations shrinks ΔT by a factor of N.</p>';
  },
  draw(v, d, mode){
    panelTitle(({ ruler: 'MEASURE THE PENCIL', meter: 'READ THE AMMETER', digital: 'READ THE SCALE', watch: 'TIME THE PENDULUM' })[mode], 10, 18);
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
      text('I = (' + d.read.toFixed(2) + ' ± 0.05) A', 12, 300, { font: '700 14px "Space Grotesk",sans-serif' });
    } else if (mode === 'digital'){
      ctx.fillStyle = '#9aa7b8'; ctx.fillRect(130, 200, 260, 60); ctx.fillStyle = '#ddd'; ctx.fillRect(150, 185, 220, 16); ctx.fillStyle = '#c98a3c'; ctx.fillRect(220, 130, 80, 55);
      ctx.fillStyle = '#111'; ctx.fillRect(190, 212, 140, 38); text(d.read.toFixed(v.res) + ' g', 320, 240, { align: 'right', font: '700 22px "IBM Plex Mono",monospace', col: '#7dff9a' });
      text('m = (' + d.read.toFixed(v.res) + ' ± ' + d.s.toFixed(v.res) + ') g', 12, 300, { font: '700 14px "Space Grotesk",sans-serif' });
    } else {
      ctx.fillStyle = '#111'; ctx.fillRect(150, 80, 220, 90); ctx.fillStyle = '#7dff9a'; text(d.read.toFixed(2) + ' s', 350, 140, { align: 'right', font: '700 34px "IBM Plex Mono",monospace', col: '#7dff9a' });
      text('for ' + v.N + ' oscillation' + (v.N > 1 ? 's' : ''), 260, 200, { align: 'center', font: '600 13px "Space Grotesk",sans-serif' });
      text('T = (' + d.Tm.toFixed(3) + ' ± ' + d.d.toFixed(3) + ') s', 12, 300, { font: '700 14px "Space Grotesk",sans-serif' });
    }
    text(isFinite(d.pct) ? 'percentage uncertainty ' + fplain(d.pct) + '%' : '', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
