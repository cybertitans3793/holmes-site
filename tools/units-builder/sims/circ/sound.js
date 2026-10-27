// Sound & Hearing (AP 14.1–14.2, 14.6–14.7; IB C.2, C.4 applications): sonar and echolocation, why instruments sound different (harmonics and timbre), and the ear (ear canal resonance, middle-ear pressure gain, the cochlea as a frequency sorter). Click the picture to hear it.
let AC = null;
function playTone(f, amps, dur){ try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t0 = AC.currentTime, g = AC.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.25, t0 + 0.03); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur); g.connect(AC.destination);
  const tot = amps.reduce((a, b) => a + b, 0) || 1; amps.forEach((a, i) => { if (a <= 0 || f * (i + 1) > 15000) return; const o = AC.createOscillator(), og = AC.createGain(); o.frequency.value = f * (i + 1); og.gain.value = a / tot; o.connect(og); og.connect(g); o.start(t0); o.stop(t0 + dur); }); } catch (e) {} }
const INSTR = { flute: ['Flute (open–open pipe)', [1, 0.55, 0.35, 0.15, 0.1, 0.05, 0.03, 0.02]], clar: ['Clarinet (closed–open pipe)', [1, 0.02, 0.65, 0.02, 0.4, 0.02, 0.25, 0.02, 0.15]], guitar: ['Guitar (string, both ends fixed)', [1, 0.6, 0.4, 0.15, 0.02, 0.1, 0.08, 0.05]] };
const SIM = {
  title: 'Sound & Hearing',
  hint: 'v = fλ · click to hear',
  modes: [{ id: 'sonar', label: 'Sonar & echolocation' }, { id: 'instr', label: 'Instruments' }, { id: 'ear', label: 'The ear' }],
  opts: [{ id: 'who', label: 'Who', modes: ['sonar'], choices: [['ship', 'Ship (sea water)'], ['bat', 'Bat (air)']] }, { id: 'ins', label: 'Instrument', modes: ['instr'], choices: [['flute', 'Flute'], ['clar', 'Clarinet'], ['guitar', 'Guitar']] }],
  ivs(mode, opt){
    if (mode === 'instr'){ const g = (opt && opt.ins) === 'guitar'; return [
      { id: 'f', sym: 'f<sub>1</sub>', symText: 'f1', label: g ? 'Open-string note' : 'Lowest note', unit: 'Hz', min: 110, max: 880, step: 1, val: g ? 330 : 262 },
      g ? { id: 'fret', sym: 'n', symText: 'fret', label: 'Fret pressed (0 = open string)', unit: '', min: 0, max: 12, step: 1, val: 0, graph: true, show: x => String(x) } : { id: 'vs', sym: 'v', symText: 'v', label: 'Speed of sound (air temperature)', unit: 'm/s', min: 330, max: 355, step: 1, val: 343, graph: true }]; }
    if (mode === 'ear') return [
      { id: 'L', sym: 'L', symText: 'L', label: 'Length of the ear canal', unit: 'cm', min: 1.5, max: 3.5, step: 0.05, val: 2.5, graph: true },
      { id: 'f', sym: 'f', symText: 'f', label: 'Frequency you hear', unit: 'Hz', min: 20, max: 20000, step: 10, val: 1000 }];
    const bat = (opt && opt.who) === 'bat'; return [
      { id: 'D', sym: 'd', symText: 'd', label: bat ? 'Distance to the insect' : 'Depth of the sea floor', unit: 'm', min: bat ? 0.5 : 10, max: bat ? 20 : 4000, step: bat ? 0.1 : 10, val: bat ? 5 : 1500, graph: true },
      { id: 'f', sym: 'f', symText: 'f', label: bat ? 'Bat’s call frequency' : 'Sonar frequency', unit: 'kHz', min: bat ? 10 : 1, max: bat ? 120 : 200, step: 1, val: bat ? 50 : 50 }];
  },
  presets: [{ label: 'Deep ocean', mode: 'sonar', v: { D: 3800 } }, { label: 'Clarinet vs flute', mode: 'instr', v: { f: 262 } }, { label: 'Octave (12th fret)', mode: 'instr', v: { fret: 12 } }, { label: 'Most sensitive pitch', mode: 'ear', v: { f: 3400 } }],
  calc(v, mode, opt){
    if (mode === 'instr'){ const ins = opt.ins || 'flute', amps = INSTR[ins][1];
      if (ins === 'guitar'){ const f = v.f * Math.pow(2, v.fret / 12), L0 = 0.65, L = L0 / Math.pow(2, v.fret / 12); return { ins, amps, f, L, vw: 2 * L0 * v.f, lam: 2 * L }; }
      const L = ins === 'clar' ? v.vs / (4 * v.f) : v.vs / (2 * v.f); return { ins, amps, f: v.f, L, lam: ins === 'clar' ? 4 * L : 2 * L }; }
    if (mode === 'ear'){ const vs = 343, L = v.L / 100, f1 = vs / (4 * L), x = Math.log10(v.f / 165.4 + 0.88) / 2.1; // Greenwood map: x = 0 apex, 1 base
      return { f1, f3: 3 * f1, lam: 4 * L, x: Math.max(0, Math.min(1, x)), gain: (55 / 3.2) * 1.3 }; }
    const bat = (opt.who || 'ship') === 'bat', vs = bat ? 343 : 1500, t = 2 * v.D / vs, lam = vs / (v.f * 1000);
    return { bat, vs, t, lam };
  },
  dvs(mode, opt){
    if (mode === 'instr'){ const a = [{ id: 'f', name: 'Frequency of the note', short: 'f', sym: 'f', unit: 'Hz', f: d => d.f }, { id: 'L', name: 'Length needed', short: 'L', sym: 'L', unit: 'm', f: d => d.L }]; return (opt && opt.ins) === 'guitar' ? a : a.reverse(); }
    if (mode === 'ear') return [{ id: 'f1', name: 'Resonant frequency of the ear canal', short: 'f₁', sym: 'f<sub>1</sub>', unit: 'Hz', f: d => d.f1 }];
    return [{ id: 't', name: 'Time for the echo to return', short: 't', sym: 't', unit: 's', f: d => d.t }, { id: 'lam', name: 'Wavelength (≈ smallest thing it can detect)', short: 'λ', sym: 'λ', unit: 'm', f: d => d.lam }];
  },
  work(v, d, mode){
    if (mode === 'instr'){ const nm = INSTR[d.ins][0];
      let s = '<h4>1 · Same note, different harmonics</h4><div class="eq">' + nm + '. Every instrument playing ' + fnum(d.f) + ' Hz has that as its 1st harmonic, but the mix of higher harmonics (the bars) is different. That mix is the <b>timbre</b>: why a flute and a clarinet don’t sound alike.</div>';
      if (d.ins === 'guitar') return s + '<h4>2 · Frets shorten the string</h4><div class="eq">Same tension, same string → same v = 2L₀f₀ = ' + H.n(d.vw, 'm/s') + '. Pressing fret ' + v.fret + ' makes L = ' + H.n(d.L * 100, 'cm') + ', so f = v/2L = <b>' + H.n(d.f, 'Hz') + '</b>.</div><p class="note">The 12th fret is exactly halfway: half the length → double the frequency → one octave up. Thicker strings have more mass per length → slower waves → lower notes. Tightening the peg raises the tension → faster waves → higher pitch.</p>';
      return s + '<h4>2 · Length of the air column</h4><div class="eq">' + (d.ins === 'clar' ? 'Closed–open (the reed end acts closed): L = λ/4 = v/(4f)' : 'Open–open: L = λ/2 = v/(2f)') + ' = ' + H.iv('vs') + '/(' + (d.ins === 'clar' ? 4 : 2) + ' × ' + fnum(d.f) + ' Hz) = <b>' + H.n(d.L * 100, 'cm') + '</b></div>' +
        '<p class="note">' + (d.ins === 'clar' ? 'Closed at one end → only odd harmonics are strong, giving the clarinet its hollow sound. It can play as low as a flute twice its length.' : 'Open at both ends → all harmonics are present. Opening finger holes effectively shortens the pipe → higher notes.') + ' Warm air → faster sound → wind instruments go slightly sharp as they warm up.</p>'; }
    if (mode === 'ear') return '<h4>1 · The ear canal is a closed pipe</h4><div class="eq">Open at the outside, closed by the eardrum: L = λ/4 → f₁ = v/(4L) = 343/(4 × ' + fnum(v.L / 100) + ' m) = <b>' + H.n(d.f1, 'Hz') + '</b>; next resonance 3f₁ = ' + H.n(d.f3, 'Hz') + '</div>' +
      '<div class="eq">Sounds near f₁ are boosted, which is why human hearing is most sensitive around 3000–4000 Hz (and why smoke alarms beep near there).</div>' +
      '<h4>2 · Middle ear: a pressure amplifier</h4><div class="eq">The eardrum (≈ 55 mm²) pushes on the bones, which push on the much smaller oval window (≈ 3.2 mm²), with a lever gain of about 1.3. Same force on a smaller area: pressure × (55/3.2)(1.3) ≈ <b>' + fnum(d.gain) + '×</b>. Needed because sound reflects off liquid unless it’s pushed hard.</div>' +
      '<h4>3 · Cochlea: sorting frequencies</h4><div class="eq">The basilar membrane is stiff and narrow near the oval window and floppy and wide at the far end, so each spot resonates at its own frequency. ' + H.iv('f') + ' makes the membrane vibrate most ' + Math.round(d.x * 100) + '% of the way from the far end (apex).</div>' +
      '<p class="note">Range of hearing: about 20 Hz to 20 000 Hz. High frequencies are detected near the entrance, where the hairs are worn out first by loud noise and age — so older people lose the high notes first.</p>';
    return '<h4>1 · Echo timing</h4><div class="eq">The pulse goes there and back: t = 2d/v = 2(' + H.iv('D') + ')/(' + fnum(d.vs) + ' m/s) = <b>' + H.n(d.t, 's') + '</b>. Rearranged: d = vt/2.</div>' +
      '<h4>2 · Wavelength and detail</h4><div class="eq">λ = v/f = ' + fnum(d.vs) + '/(' + H.iv('f') + ') = <b>' + H.n(d.lam * 100, 'cm') + '</b></div>' +
      '<p class="note">Waves diffract around things much smaller than λ and barely reflect, so you can only detect objects about the size of λ or bigger. ' + (d.bat ? 'That’s why bats use ultrasound: at 50 kHz, λ ≈ 7 mm — about the size of a moth. Humans can’t hear above about 20 kHz.' : 'Sound travels about 4× faster in water than in air. Ultrasound imaging in hospitals uses the same echo idea at 2–15 MHz in tissue.') + '</p>';
  },
  play(v, d, mode){ if (mode === 'instr') playTone(d.f, d.amps, 1.4); else if (mode === 'ear') playTone(v.f, [1], 0.8); else playTone(d.bat ? 2000 : 1200, [1, 0.3], 0.25); },
  draw(v, d, mode, opt, t, dt, A){
    if (!window._sndHook){ window._sndHook = 1; cv.style.cursor = 'pointer'; cv.addEventListener('click', () => SIM.play(S.v, S.d, S.mode)); }
    if (mode === 'instr'){
      panelTitle(INSTR[d.ins][0].toUpperCase() + ' · CLICK TO HEAR', 10, 18);
      const y0 = 110; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5;
      if (d.ins === 'guitar'){ const x0 = 30, x1 = 370; ctx.fillStyle = '#c99a5b'; ctx.fillRect(x0, y0 - 22, x1 - x0, 44); for (let n = 1; n <= 12; n++){ const x = x0 + (x1 - x0) * (1 - Math.pow(2, -n / 12)); if (x < x1){ ctx.fillStyle = '#ddd'; ctx.fillRect(x, y0 - 22, 2, 44); } }
        const xf = x0 + (x1 - x0) * (1 - Math.pow(2, -v.fret / 12)); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
        if (v.fret > 0){ ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(xf - 6, y0, 6, 0, 7); ctx.fill(); } ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 100; i++){ const x = xf + (x1 - xf) * i / 100, y = y0 - 16 * Math.sin(PI * i / 100) * Math.cos(2 * PI * 2 * t); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
        text('vibrating length ' + fplain(d.L * 100) + ' cm', 200, y0 + 40, { align: 'center', font: '600 11px "IBM Plex Mono",monospace' }); }
      else { const len = Math.min(340, d.L * 100 * 3.5), x0 = 30; ctx.fillStyle = d.ins === 'clar' ? '#333' : '#c9c9c9'; ctx.fillRect(x0, y0 - 12, len, 24); if (d.ins === 'clar'){ ctx.fillStyle = '#c43a00'; ctx.fillRect(x0 - 6, y0 - 12, 6, 24); }
        text(fplain(d.L * 100) + ' cm long' + (d.ins === 'clar' ? ' (closed at the reed)' : ''), x0, y0 + 32, { font: '600 11px "IBM Plex Mono",monospace' }); }
      // waveform
      panelTitle('WAVEFORM (3 CYCLES)', 10, 176); const wy = 232; ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); const tot = d.amps.reduce((a, b) => a + b, 0);
      for (let i = 0; i <= 360; i++){ const ph = 2 * PI * 3 * i / 360; let y = 0; d.amps.forEach((a, k) => y += a * Math.sin((k + 1) * ph + k)); i ? ctx.lineTo(20 + i, wy - 45 * y / tot * 1.6) : ctx.moveTo(20, wy - 45 * y / tot * 1.6); } ctx.stroke();
      panelTitle('HARMONICS (SPECTRUM)', 395, 18); d.amps.forEach((a, k) => { const x = 405 + k * 20, h = 150 * a; ctx.fillStyle = k % 2 ? '#8a8a8a' : '#ff6a2b'; ctx.fillRect(x, 200 - h, 14, h); text(String(k + 1), x + 7, 214, { align: 'center', font: '500 10px "IBM Plex Mono",monospace' }); });
      text('harmonic number n', 405, 230, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('f = ' + fplain(d.f) + ' Hz', 400, 270, { font: '700 14px "Space Grotesk",sans-serif' });
      return;
    }
    if (mode === 'ear'){
      panelTitle('THE EAR · CLICK TO HEAR THE TONE', 10, 18);
      const cy = 110, L = v.L * 50; ctx.fillStyle = '#f2d4c2'; ctx.beginPath(); ctx.ellipse(40, cy, 22, 55, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fbeee6'; ctx.fillRect(40, cy - 12, L, 24); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(40, cy - 12); ctx.lineTo(40 + L, cy - 12); ctx.moveTo(40, cy + 12); ctx.lineTo(40 + L, cy + 12); ctx.stroke();
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(40 + L, cy - 16); ctx.lineTo(40 + L, cy + 16); ctx.stroke(); text('eardrum', 40 + L, cy - 22, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#c43a00' });
      ctx.strokeStyle = 'rgba(21,70,214,0.8)'; ctx.lineWidth = 2; [1, -1].forEach(sg => { ctx.beginPath(); for (let i = 0; i <= 50; i++){ const x = i / 50, y = cy - sg * 10 * Math.cos(PI / 2 * x); i ? ctx.lineTo(40 + L * (1 - x), y) : ctx.moveTo(40 + L, y); } ctx.stroke(); });
      text('canal L = ' + v.L + ' cm', 40 + L / 2, cy + 30, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' });
      const bx = 50 + L; [[bx + 10, cy - 4], [bx + 24, cy + 2], [bx + 38, cy - 2]].forEach(([x, y]) => { ctx.fillStyle = '#e8dcc0'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y, 7, 5, 0.4, 0, 7); ctx.fill(); ctx.stroke(); }); text('bones', bx + 24, cy + 22, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' });
      // unrolled cochlea
      panelTitle('COCHLEA, UNROLLED', 10, 186); const c0 = 30, c1 = 380, yc = 230; ctx.fillStyle = '#f5e6d8'; ctx.beginPath(); ctx.moveTo(c0, yc - 8); ctx.lineTo(c1, yc - 20); ctx.lineTo(c1, yc + 20); ctx.lineTo(c0, yc + 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#111'; ctx.stroke();
      const xs = c0 + (c1 - c0) * (1 - d.x); ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 200; i++){ const x = c0 + (c1 - c0) * i / 200, env = Math.exp(-Math.pow((x - xs) / 22, 2)); const y = yc - 14 * env * Math.sin(i * 0.9 - t * 12); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      text('base (high f) ← near oval window', c0, yc + 36, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('apex (low f)', c1, yc + 36, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('HEARING SENSITIVITY', 395, 18);
      const gx = 405, gy = 220, gw = 180, gh = 160, X = f => gx + gw * (Math.log10(f) - 1.3) / 3, thr = f => { const k = f / 1000; return 3.64 * Math.pow(k, -0.8) - 6.5 * Math.exp(-0.6 * Math.pow(k - 3.3, 2)) + 1e-3 * Math.pow(k, 4); }, Y = db => gy - gh * (1 - Math.min(1, Math.max(0, (db + 10) / 90)));
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      ctx.fillStyle = 'rgba(255,106,43,0.15)'; ctx.fillRect(X(d.f1 * 0.7), gy - gh, X(d.f1 * 1.4) - X(d.f1 * 0.7), gh);
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 150; i++){ const f = Math.pow(10, 1.3 + 3 * i / 150); i ? ctx.lineTo(X(f), Y(thr(f))) : ctx.moveTo(X(f), Y(thr(f))); } ctx.stroke();
      ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(X(v.f), Y(thr(v.f)), 5, 0, 7); ctx.fill();
      [[20, '20'], [200, '200'], [2000, '2k'], [20000, '20k Hz']].forEach(([f, s]) => text(s, X(f), gy + 14, { align: 'center', font: '500 9px "IBM Plex Mono",monospace' }));
      text('higher = easier to hear', gx + 4, gy - gh - 4, { font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('canal resonance ' + fplain(d.f1) + ' Hz', 400, 260, { font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' });
      return;
    }
    panelTitle((d.bat ? 'BAT FINDING A MOTH' : 'SHIP SONAR') + ' · CLICK TO PING', 10, 18);
    if (!A.t0 || A.reset) A.t0 = t; const vis = 3.0, ph = ((t - A.t0) % vis) / vis;
    if (d.bat){ const x0 = 50, x1 = 50 + 320 * Math.min(1, v.D / 20), y = 150; ctx.fillStyle = '#333'; ctx.beginPath(); ctx.moveTo(x0 - 16, y - 8); ctx.lineTo(x0, y); ctx.lineTo(x0 - 16, y + 8); ctx.lineTo(x0 - 10, y); ctx.fill(); ctx.beginPath(); ctx.arc(x0, y, 6, 0, 7); ctx.fill();
      ctx.fillStyle = '#8a6a3a'; ctx.beginPath(); ctx.ellipse(x1, y, 6, 3, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(138,106,58,0.5)'; ctx.beginPath(); ctx.ellipse(x1, y - 6, 8, 5, 0.3, 0, 7); ctx.fill();
      const x = ph < 0.5 ? x0 + (x1 - x0) * ph * 2 : x1 - (x1 - x0) * (ph - 0.5) * 2; ctx.strokeStyle = ph < 0.5 ? '#1546d6' : '#c43a00'; ctx.lineWidth = 2; for (let k = 0; k < 3; k++){ ctx.beginPath(); ctx.arc(x - (ph < 0.5 ? 1 : -1) * k * 6, y, 16, ph < 0.5 ? -0.6 : PI - 0.6, ph < 0.5 ? 0.6 : PI + 0.6); ctx.stroke(); }
      text('d = ' + v.D + ' m', (x0 + x1) / 2, y + 40, { align: 'center', font: '600 11px "IBM Plex Mono",monospace' }); }
    else { const ys = 70, yb = ys + 210 * Math.min(1, v.D / 4000), x = 190; ctx.fillStyle = 'rgba(40,110,190,0.35)'; ctx.fillRect(20, ys, 365, 260 - ys + 40); ctx.fillStyle = '#8a7a5a'; ctx.fillRect(20, Math.min(300, yb + 8), 365, 30);
      ctx.fillStyle = '#555'; ctx.beginPath(); ctx.moveTo(x - 50, ys - 18); ctx.lineTo(x + 50, ys - 18); ctx.lineTo(x + 38, ys); ctx.lineTo(x - 38, ys); ctx.fill();
      const y = ph < 0.5 ? ys + (yb - ys) * ph * 2 : yb - (yb - ys) * (ph - 0.5) * 2; ctx.strokeStyle = ph < 0.5 ? '#1546d6' : '#c43a00'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y + (ph < 0.5 ? -20 : 20), 24, ph < 0.5 ? 0.6 : PI + 0.6, ph < 0.5 ? PI - 0.6 : -0.6); ctx.stroke();
      text('d = ' + v.D + ' m', x + 60, (ys + yb) / 2, { font: '600 11px "IBM Plex Mono",monospace', col: '#fff' }); }
    text('blue: going out · red: echo (slowed down)', 12, 318, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    panelTitle('NUMBERS', 395, 18);
    [['speed', fplain(d.vs) + ' m/s'], ['echo time', fplain(d.t) + ' s'], ['wavelength', fplain(d.lam * 100) + ' cm'], ['frequency', v.f + ' kHz']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px "IBM Plex Mono",monospace' }); });
  }
};
