// Standing Waves (AP 14.6, IB C.4): strings and pipes with every pair of boundary conditions, harmonics, nodes and antinodes, and the resonance-tube lab (find the speed of sound).
const SIM = {
  title: 'Standing Waves',
  hint: 'v = fλ · N = node, A = antinode',
  modes: [{ id: 'string', label: 'Strings' }, { id: 'pipe', label: 'Pipes' }, { id: 'tube', label: 'Resonance tube lab' }, { id: 'micro', label: 'Microwave oven' }],
  opts: [{ id: 'se', label: 'Ends', modes: ['string'], choices: [['ff', 'Fixed–fixed'], ['fr', 'Fixed–free'], ['rr', 'Free–free']] },
    { id: 'pe', label: 'Ends', modes: ['pipe'], choices: [['oo', 'Open–open'], ['co', 'Closed–open'], ['cc', 'Closed–closed']] }],
  ivs(mode){
    if (mode === 'micro') return [
      { id: 'fg', sym: 'f', symText: 'f', label: 'Oven frequency (on the label)', unit: 'GHz', min: 2.4, max: 2.5, step: 0.005, val: 2.45 },
      { id: 'g', sym: 'Δx', symText: 'Δx', label: 'Your measured gap between melted spots', unit: 'cm', min: 4, max: 8, step: 0.1, val: 6.0, graph: true }];
    if (mode === 'tube') return [
      { id: 'f', sym: 'f', symText: 'f', label: 'Tuning fork', unit: 'Hz', min: 256, max: 1024, step: 1, val: 512 },
      { id: 'La', sym: 'L', symText: 'L', label: 'Length of air column (raise or lower the tube)', unit: 'cm', min: 5, max: 100, step: 0.2, val: 20, graph: true },
      { id: 'vs', sym: 'v', symText: 'v', label: 'Speed of sound (the answer!)', unit: 'm/s', min: 320, max: 360, step: 1, val: 343 }];
    return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Mode (1st, 2nd, 3rd possible pattern)', unit: '', min: 1, max: 5, step: 1, val: 1, show: x => String(x) },
      { id: 'L', sym: 'L', symText: 'L', label: mode === 'pipe' ? 'Pipe length' : 'String length', unit: 'm', min: 0.2, max: 2, step: 0.01, val: mode === 'pipe' ? 0.5 : 0.65, graph: true },
      { id: 'v', sym: 'v', symText: 'v', label: mode === 'pipe' ? 'Speed of sound' : 'Wave speed on the string', unit: 'm/s', min: mode === 'pipe' ? 300 : 50, max: mode === 'pipe' ? 400 : 500, step: 1, val: mode === 'pipe' ? 340 : 250 }];
  },
  presets: [{ label: 'Guitar string', mode: 'string', v: { m: 1, L: 0.65, v: 285 } }, { label: 'Next harmonic', mode: 'string', v: { m: 2 } }, { label: 'Clarinet (closed–open)', mode: 'pipe', v: { m: 1, L: 0.6, v: 340 } }, { label: 'First resonance', mode: 'tube', v: { La: 16.7 } }],
  calc(v, mode, opt){
    if (mode === 'micro'){ const lam = 3e8 / (v.fg * 1e9); return { lam, gapTrue: lam / 2, c: 2 * (v.g / 100) * v.fg * 1e9 }; }
    if (mode === 'tube'){ const lam = v.vs / v.f, L = v.La / 100, ns = [1, 3, 5, 7].map(k => k * lam / 4), near = ns.reduce((a, b) => Math.abs(b - L) < Math.abs(a - L) ? b : a), off = (L - near) / lam;
      const loud = 1 / (1 + Math.pow(off / 0.03, 2)); return { lam, ns, near, loud, k: Math.round(4 * near / lam) }; }
    const ends = mode === 'pipe' ? (opt.pe || 'oo') : (opt.se || 'ff'), asym = ends === 'fr' || ends === 'co';
    const n = asym ? 2 * v.m - 1 : v.m, lam = asym ? 4 * v.L / n : 2 * v.L / n, f = v.v / lam, f1 = asym ? v.v / (4 * v.L) : v.v / (2 * v.L);
    // displacement node at fixed string end / closed pipe end
    const nodeAt0 = ends === 'ff' || ends === 'fr' || ends === 'cc' || ends === 'co';
    return { ends, asym, n, lam, f, f1, nodeAt0 };
  },
  dvs(mode){
    if (mode === 'micro') return [{ id: 'c', name: 'Speed of light from your measurement', short: 'c', sym: 'c', unit: 'm/s', f: d => d.c }];
    if (mode === 'tube') return [{ id: 'loud', name: 'Loudness (resonance)', short: 'loud', sym: 'loudness', unit: '', f: d => d.loud }];
    return [{ id: 'f', name: 'Frequency', short: 'f', sym: 'f', unit: 'Hz', f: d => d.f }, { id: 'lam', name: 'Wavelength', short: 'λ', sym: 'λ', unit: 'm', f: d => d.lam }];
  },
  work(v, d, mode){
    if (mode === 'micro') return '<h4>1 · A standing wave inside the oven</h4><div class="eq">Microwaves reflect off the metal walls. The waves going each way make a standing wave: hot spots (antinodes) and cold spots (nodes). Take the turntable out so the food stays still.</div>' +
      '<h4>2 · Hot spots are half a wavelength apart</h4><div class="eq">Each wavelength has two antinodes, so the gap between melted spots is λ/2. Measure it on the ruler: Δx = ' + H.iv('g') + ' → λ = 2Δx = ' + H.n(2 * v.g, 'cm') + '</div>' +
      '<h4>3 · Speed of light</h4><div class="eq">c = fλ = (' + H.iv('fg') + ')(' + fnum(2 * v.g / 100) + ' m) = <b>' + H.n(d.c, 'm/s') + '</b> (accepted 3.00×10⁸ m/s, ' + fnum(Math.abs(d.c - 3e8) / 3e8 * 100) + '% off)</div>' +
      '<p class="note">Read the real gap off the ruler under the bar, then set the slider to it. Lab tip: measure across several spots and divide, and use chocolate, cheese or marshmallows on a plate for about 20 s. The turntable is there to move food through the hot spots so it heats evenly.</p>';
    if (mode === 'tube') return '<h4>1 · The set-up</h4><div class="eq">A tube in water: closed at the water surface, open at the top. Closed end = displacement node; open end = antinode. So resonance needs L = λ/4, 3λ/4, 5λ/4, …</div>' +
      '<h4>2 · Where it should be loud</h4><div class="eq">λ = v/f = ' + H.iv('vs') + '/' + H.iv('f') + ' = ' + H.n(d.lam * 100, 'cm') + ' → L = ' + d.ns.slice(0, 3).map(x => fnum(x * 100) + ' cm').join(', ') + ' …</div>' +
      '<h4>3 · The lab trick</h4><div class="eq">Successive loud lengths differ by <b>λ/2 = ' + H.n(d.lam * 50, 'cm') + '</b>. Measure two of them, double the gap to get λ, then v = fλ. No end correction needed!</div>' +
      '<p class="note">Right now: ' + (d.loud > 0.6 ? '<b>resonance!</b> L ≈ ' + d.k + 'λ/4.' : 'quiet. Move the tube until it gets loud.') + ' Pretend v is unknown: hide the value and find it from your two lengths.</p>';
    const what = mode === 'pipe' ? { oo: 'Open end = displacement <b>antinode</b> at both ends.', co: 'Closed end = displacement <b>node</b>; open end = <b>antinode</b>.', cc: 'Closed end = displacement <b>node</b> at both ends.' }[d.ends]
      : { ff: 'Fixed end = <b>node</b> at both ends.', fr: 'Fixed end = <b>node</b>; free end = <b>antinode</b>.', rr: 'Free end = <b>antinode</b> at both ends.' }[d.ends];
    return '<h4>1 · Boundary conditions</h4><div class="eq">' + what + '</div>' +
      '<h4>2 · Fit the wave in</h4><div class="eq">' + (d.asym ? 'One node and one antinode: L = nλ/4 with n odd only (1, 3, 5, …).' : 'Same kind at both ends: L = nλ/2 with n = 1, 2, 3, …') + '<br>Harmonic n = <b>' + d.n + '</b>: λ = ' + (d.asym ? '4L/n' : '2L/n') + ' = <b>' + H.n(d.lam, 'm') + '</b></div>' +
      '<h4>3 · Frequency</h4><div class="eq">f = v/λ = ' + H.iv('v') + '/' + fnum(d.lam) + ' m = <b>' + H.n(d.f, 'Hz') + '</b> = ' + d.n + ' × f₁ (f₁ = ' + fnum(d.f1) + ' Hz)</div>' +
      '<p class="note">' + (d.asym ? 'Only odd harmonics exist, so this ' + (mode === 'pipe' ? 'pipe' : 'string') + ' has no 2nd harmonic. ' : '') + 'Points between neighbouring nodes move in phase; points on either side of a node are in antiphase. ' + (mode === 'pipe' ? 'For pipes the pattern shows how far the air moves (displacement).' : 'Tighter string → faster wave → higher pitch.') + '</p>';
  },
  draw(v, d, mode, opt, t){
    if (mode === 'micro'){
      panelTitle('CHOCOLATE BAR IN A MICROWAVE (TURNTABLE REMOVED)', 10, 18);
      const x0 = 30, x1 = 370, pxcm = (x1 - x0) / 30, y0 = 130, k = 2 * PI / (d.lam * 100), off = 1.7;
      ctx.fillStyle = '#e9e9e9'; ctx.fillRect(14, 40, 372, 200); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(14, 40, 372, 200);
      ctx.fillStyle = '#5a3a22'; ctx.fillRect(x0, y0 - 26, x1 - x0, 52);
      for (let i = 0; i <= 300; i++){ const xc = 30 * i / 300, e = Math.abs(Math.sin(k * xc + off)); if (e > 0.93){ ctx.fillStyle = 'rgba(160,110,70,' + (e - 0.9) * 8 + ')'; ctx.beginPath(); ctx.arc(x0 + xc * pxcm, y0, 16 * (e - 0.9) * 10, 0, 7); ctx.fill(); } }
      ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; [1, -1].forEach(sg => { ctx.beginPath(); for (let i = 0; i <= 300; i++){ const xc = 30 * i / 300, y = y0 - 70 - sg * 18 * Math.sin(k * xc + off) * Math.cos(2 * PI * t); i ? ctx.lineTo(x0 + xc * pxcm, y) : ctx.moveTo(x0, y); } ctx.stroke(); });
      text('wave pattern', x0, 52, { font: '600 10px "IBM Plex Mono",monospace', col: '#ff6a2b' });
      for (let c = 0; c <= 30; c++){ const x = x0 + c * pxcm, big = c % 5 === 0; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, 200); ctx.lineTo(x, 200 + (big ? 14 : 7)); ctx.stroke(); if (big) text(String(c), x, 228, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); }
      text('cm', x1 + 6, 228, { font: '600 10px "IBM Plex Mono",monospace' }); text('melted spots = antinodes', 12, 300, { font: '700 12px "Space Grotesk",sans-serif', col: '#5a3a22' });
      panelTitle('YOUR RESULT', 395, 18);
      [['gap Δx', v.g + ' cm'], ['λ = 2Δx', fplain(2 * v.g) + ' cm'], ['f', v.fg + ' GHz'], ['c = fλ', fplain(d.c) + ' m/s']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px "IBM Plex Mono",monospace' }); });
      return;
    }
    if (mode === 'tube'){
      panelTitle('RESONANCE TUBE', 10, 18);
      const x = 160, w = 46, top = 60, bot = 300, Lpx = v.La * 2.2, ws = top + Lpx;
      ctx.fillStyle = 'rgba(21,120,214,0.25)'; ctx.fillRect(60, 240, 240, 70); ctx.fillStyle = 'rgba(21,120,214,0.45)'; ctx.fillRect(x, Math.min(ws, bot), w, Math.max(0, bot - ws));
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.moveTo(x + w, top); ctx.lineTo(x + w, bot); ctx.stroke();
      const sh = Math.sin(2 * PI * 3 * t) * 3; ctx.fillStyle = '#8a8a8a'; ctx.fillRect(x + 10 + sh, 18, 5, 34); ctx.fillRect(x + w - 15 - sh, 18, 5, 34); ctx.fillRect(x + 10, 50, w - 20, 5);
      // displacement envelope in the air column, antinode at top, node at water
      if (d.loud > 0.05){ const k = 2 * PI / (d.lam * 100 * 2.2), amp = (w / 2 - 3) * d.loud * Math.cos(2 * PI * 4 * t); ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.beginPath();
        for (let y = top; y <= Math.min(ws, bot); y += 2){ const e = amp * Math.sin(k * (ws - y)); y === top ? ctx.moveTo(x + w / 2 + e, y) : ctx.lineTo(x + w / 2 + e, y); } ctx.stroke(); }
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 14, top); ctx.lineTo(x - 14, ws); ctx.stroke(); text('L = ' + v.La.toFixed(1) + ' cm', x - 18, (top + ws) / 2, { align: 'right', font: '700 12px "IBM Plex Mono",monospace', col: '#c43a00' });
      text(d.loud > 0.6 ? 'LOUD' : d.loud > 0.2 ? 'getting louder…' : 'quiet', x + w + 14, 100, { font: '700 16px "Space Grotesk",sans-serif', col: d.loud > 0.6 ? '#c43a00' : '#8a8a8a' });
      panelTitle('LOUDNESS vs L', 395, 18);
      const gx = 405, gy = 200, gw = 180, gh = 140; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 300; i++){ const L = 5 + 95 * i / 300, dd = SIM.calc(Object.assign({}, v, { La: L }), 'tube', opt); i ? ctx.lineTo(gx + gw * i / 300, gy - gh * dd.loud) : ctx.moveTo(gx, gy - gh * dd.loud); } ctx.stroke();
      ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(gx + gw * (v.La - 5) / 95, gy - gh * d.loud, 5, 0, 7); ctx.fill();
      text('5 cm', gx, gy + 14, { align: 'center', font: '500 10px "IBM Plex Mono",monospace' }); text('100 cm', gx + gw, gy + 14, { align: 'center', font: '500 10px "IBM Plex Mono",monospace' });
      text('peaks λ/2 = ' + fplain(d.lam * 50) + ' cm apart', 400, 250, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    panelTitle((mode === 'pipe' ? 'PIPE: ' : 'STRING: ') + ({ ff: 'FIXED–FIXED', fr: 'FIXED–FREE', rr: 'FREE–FREE', oo: 'OPEN–OPEN', co: 'CLOSED–OPEN', cc: 'CLOSED–CLOSED' })[d.ends] + ' · HARMONIC ' + d.n, 10, 18);
    const X1 = 40, X2 = 360, y0 = 130, Amp = 46, k = 2 * PI / d.lam, Lm = v.L, sh = x => d.nodeAt0 ? Math.sin(k * x) : Math.cos(k * x), osc = Math.cos(2 * PI * 0.8 * t), X = x => X1 + (X2 - X1) * x / Lm;
    if (mode === 'pipe'){
      ctx.fillStyle = 'rgba(21,70,214,0.06)'; ctx.fillRect(X1, y0 - 56, X2 - X1, 112); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X1, y0 - 56); ctx.lineTo(X2, y0 - 56); ctx.moveTo(X1, y0 + 56); ctx.lineTo(X2, y0 + 56); ctx.stroke();
      if (d.ends === 'co' || d.ends === 'cc'){ ctx.fillStyle = '#111'; ctx.fillRect(X1 - 8, y0 - 56, 8, 112); } if (d.ends === 'cc'){ ctx.fillRect(X2, y0 - 56, 8, 112); }
      // air particles: horizontal displacement
      for (let i = 0; i <= 52; i++) for (let j = -3; j <= 3; j++){ const x0 = Lm * i / 52, dx = sh(x0) * osc * 7; ctx.fillStyle = '#4a4a4a'; ctx.beginPath(); ctx.arc(X(x0) + dx, y0 + j * 14 + (i % 2 ? 7 : 0) * (j < 3 ? 1 : 0), 1.8, 0, 7); ctx.fill(); }
      ctx.strokeStyle = 'rgba(196,58,0,0.8)'; ctx.lineWidth = 2; [1, -1].forEach(s => { ctx.beginPath(); for (let i = 0; i <= 200; i++){ const x = Lm * i / 200, y = y0 - s * Amp * sh(x); i ? ctx.lineTo(X(x), y) : ctx.moveTo(X(x), y); } ctx.stroke(); });
    } else {
      ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; [1, -1].forEach(s => { ctx.beginPath(); for (let i = 0; i <= 200; i++){ const x = Lm * i / 200, y = y0 - s * Amp * sh(x); i ? ctx.lineTo(X(x), y) : ctx.moveTo(X(x), y); } ctx.stroke(); });
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 200; i++){ const x = Lm * i / 200, y = y0 - Amp * sh(x) * osc; i ? ctx.lineTo(X(x), y) : ctx.moveTo(X(x), y); } ctx.stroke();
      const endMark = (x, fixed) => { if (fixed){ ctx.fillStyle = '#555'; ctx.fillRect(x - 4, y0 - 60, 8, 120); } else { ctx.fillStyle = '#555'; ctx.fillRect(x - 2, y0 - 60, 4, 120); } };
      endMark(X1, d.ends !== 'rr'); endMark(X2, d.ends === 'ff');
    }
    // node/antinode labels
    const step = d.lam / 4; for (let q = 0; q * step <= Lm + 1e-6; q++){ const x = q * step, isNode = Math.abs(sh(x)) < 0.5; text(isNode ? 'N' : 'A', X(x), y0 + 76, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: isNode ? '#111' : '#c43a00' }); }
    const lx = Math.min(d.lam, Lm); ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(0), 232); ctx.lineTo(X(lx), 232); ctx.moveTo(X(0), 226); ctx.lineTo(X(0), 238); ctx.moveTo(X(lx), 226); ctx.lineTo(X(lx), 238); ctx.stroke();
    text(lx < d.lam ? 'λ = ' + fplain(d.lam) + ' m (longer than L)' : 'λ = ' + fplain(d.lam) + ' m', X(lx / 2), 250, { align: 'center', font: '700 11px "IBM Plex Mono",monospace', col: '#c43a00' });
    text('L = ' + v.L + ' m   f = ' + fplain(d.f) + ' Hz', 12, 310, { font: '700 13px "Space Grotesk",sans-serif' });
    panelTitle('POSSIBLE FREQUENCIES', 395, 18);
    const ns = d.asym ? [1, 3, 5, 7, 9] : [1, 2, 3, 4, 5]; ns.forEach((n, i) => { const y = 46 + i * 34, f = n * d.f1, on = n === d.n; ctx.fillStyle = on ? '#ff6a2b' : '#ddd'; ctx.fillRect(400, y, Math.min(180, 18 * n), 14);
      text('n = ' + n + ': ' + fplain(f) + ' Hz', 404, y + 26, { font: (on ? '700 ' : '500 ') + '11px "IBM Plex Mono",monospace' }); });
    if (d.asym) text('odd harmonics only', 400, 226 + 18, { font: '700 11px "Space Grotesk",sans-serif', col: '#c43a00' });
  }
};
