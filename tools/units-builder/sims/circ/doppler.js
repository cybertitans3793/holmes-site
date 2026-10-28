let AC = null, OSC = null, GN = null, SND = false;
// Doppler Effect (AP 14.5 qualitative; IB C.5 SL light, HL sound): wavefront diagrams for a moving source and observer, the sonic boom, red shift of galaxies, and radar / ultrasound speed measurement.
const LINES = [[656.3, 'Hα'], [486.1, 'Hβ'], [434.0, 'Hγ'], [410.2, 'Hδ']];
function wlRGB(l){ let r = 0, g = 0, b = 0; if (l < 440){ r = (440 - l) / 60; b = 1; } else if (l < 490){ g = (l - 440) / 50; b = 1; } else if (l < 510){ g = 1; b = (510 - l) / 20; } else if (l < 580){ r = (l - 510) / 70; g = 1; } else if (l < 645){ r = 1; g = (645 - l) / 65; } else r = 1;
  const a = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 700 ? 0.3 + 0.7 * (780 - l) / 80 : 1; return [r, g, b].map(c => Math.round(255 * Math.max(0, Math.min(1, c * a)))); }
const SIM = {
  title: 'Doppler Effect',
  hint: 'toward → higher f · away → lower f',
  modes: [{ id: 'sound', label: 'Moving source (sound)' }, { id: 'color', label: 'Red & blue shift (color)' }, { id: 'light', label: 'Red shift (light)' }, { id: 'radar', label: 'Radar & ultrasound' }],
  opts: [{ id: 'dev', label: 'Device', modes: ['radar'], choices: [['radar', 'Police radar'], ['us', 'Ultrasound (blood flow)']] }],
  ivs(mode, opt){
    if (mode === 'color') return [
      { id: 'vc', sym: 'v', symText: 'v', label: 'Speed of the light source (% of light speed, + = moving right)', unit: '% c', min: -30, max: 30, step: 1, val: 15, graph: true },
      { id: 'l0', sym: 'λ₀', symText: 'λ0', label: 'Color it gives off when still', unit: 'nm', min: 450, max: 650, step: 5, val: 550 }];
    if (mode === 'light') return [{ id: 'vr', sym: 'v', symText: 'v', label: 'Speed away from us (− = toward)', unit: 'km/s', min: -3000, max: 30000, step: 50, val: 6000, graph: true }];
    if (mode === 'radar'){ const us = (opt && opt.dev) === 'us'; return [
      { id: 'f', sym: 'f', symText: 'f', label: us ? 'Ultrasound frequency' : 'Radar frequency', unit: us ? 'MHz' : 'GHz', min: us ? 1 : 10, max: us ? 10 : 35, step: us ? 0.1 : 0.1, val: us ? 5 : 24 },
      { id: 'u', sym: 'u', symText: 'u', label: us ? 'Blood speed toward the probe' : 'Car speed toward the radar', unit: 'm/s', min: us ? -1 : -40, max: us ? 1 : 40, step: us ? 0.01 : 0.5, val: us ? 0.4 : 30, graph: true }]; }
    return [
      { id: 'f0', sym: 'f<sub>0</sub>', symText: 'f0', label: 'Frequency of the siren', unit: 'Hz', min: 200, max: 1000, step: 10, val: 500 },
      { id: 'vs', sym: 'u<sub>s</sub>', symText: 'us', label: 'Source speed toward the observer (− = away)', unit: 'm/s', min: -200, max: 500, step: 1, val: 100, graph: true },
      { id: 'vo', sym: 'u<sub>o</sub>', symText: 'uo', label: 'Observer speed toward the source', unit: 'm/s', min: -100, max: 100, step: 1, val: 0 },
      { id: 'c', sym: 'v', symText: 'v', label: 'Speed of sound', unit: 'm/s', min: 300, max: 360, step: 1, val: 340 }];
  },
  presets: [{ label: 'Ambulance passing', mode: 'sound', v: { vs: 30, vo: 0 } }, { label: 'Sonic boom', mode: 'sound', v: { vs: 400, vo: 0 } }, { label: 'Distant galaxy', mode: 'light', v: { vr: 22000 } }, { label: 'Speeding car', mode: 'radar', v: { u: 35 } }],
  calc(v, mode, opt){
    if (mode === 'color'){ const z = v.vc / 100; return { z, la: v.l0 * (1 - z), lb: v.l0 * (1 + z) }; }
    if (mode === 'light'){ const z = v.vr / 3e5; return { z, lines: LINES.map(([l, n]) => [l, l * (1 + z), n]), dl: 656.3 * z }; }
    if (mode === 'radar'){ const us = (opt.dev || 'radar') === 'us', c = us ? 1540 : 3e8, f = v.f * (us ? 1e6 : 1e9), df = 2 * v.u * f / c; return { us, c, fHz: f, df }; }
    const shock = v.vs >= v.c, fa = shock ? NaN : v.f0 * (v.c + v.vo) / (v.c - v.vs), lamA = (v.c - v.vs) / v.f0, lamB = (v.c + v.vs) / v.f0, fb = v.f0 * (v.c - v.vo) / (v.c + v.vs);
    return { shock, fa, fb, lamA, lamB, mach: v.vs / v.c, lam0: v.c / v.f0, f0: v.f0 };
  },
  dvs(mode){
    if (mode === 'color') return [{ id: 'la', name: 'Wavelength seen in front', short: 'λ front', sym: 'λ', unit: 'nm', f: d => d.la }, { id: 'lb', name: 'Wavelength seen behind', short: 'λ behind', sym: 'λ', unit: 'nm', f: d => d.lb }];
    if (mode === 'light') return [{ id: 'dl', name: 'Shift of the Hα line', short: 'Δλ', sym: 'Δλ', unit: 'nm', f: d => d.dl }];
    if (mode === 'radar') return [{ id: 'df', name: 'Frequency shift of the echo', short: 'Δf', sym: 'Δf', unit: 'Hz', f: d => d.df }];
    return [{ id: 'fa', name: 'Frequency heard by the observer ahead', short: 'f', sym: 'f′', unit: 'Hz', f: d => d.fa < 4 * d.f0 ? d.fa : NaN }, { id: 'la', name: 'Wavelength in front of the source', short: 'λ ahead', sym: 'λ', unit: 'm', f: d => d.lamA }];
  },
  work(v, d, mode){
    if (mode === 'color'){ const nm = l => l < 450 ? 'violet' : l < 495 ? 'blue' : l < 570 ? 'green' : l < 590 ? 'yellow' : l < 620 ? 'orange' : 'red';
      return '<h4>1 · Light is a wave too</h4><div class="eq">A moving light source bunches up its waves in front and stretches them out behind, just like sound.</div>' +
        '<h4>2 · In front: waves squeezed → shorter wavelength → <span style="color:#1546d6">bluer</span></h4><div class="eq">λ ≈ λ₀(1 − v/c) = ' + H.iv('l0') + ' × (1 − ' + fnum(Math.abs(d.z)) + ') = <b>' + H.n(d.la, 'nm') + '</b> (' + nm(d.la) + ')</div>' +
        '<h4>3 · Behind: waves stretched → longer wavelength → <span style="color:#c43a00">redder</span></h4><div class="eq">λ ≈ λ₀(1 + v/c) = <b>' + H.n(d.lb, 'nm') + '</b> (' + nm(d.lb) + ')</div>' +
        '<p class="note">' + (d.z === 0 ? 'Not moving: everyone sees the same color.' : 'Moving toward you = <b>blue shift</b>. Moving away = <b>red shift</b>.') + ' Real stars and galaxies move far slower than this, so the color change is tiny — astronomers measure it with the dark lines in the spectrum. Nearly every galaxy is red-shifted: they are all moving away from us, so the universe is expanding.</p>'; }
    if (mode === 'light') return '<h4>1 · Light from a moving source (IB SL)</h4><div class="eq">For v ≪ c: Δλ/λ = Δf/f ≈ v/c = ' + fnum(v.vr) + ' km/s ÷ 3.00×10⁵ km/s = <b>' + fnum(d.z) + '</b></div>' +
      '<h4>2 · Shift of the hydrogen-α line</h4><div class="eq">Δλ = (656.3 nm)(' + fnum(d.z) + ') = <b>' + H.n(d.dl, 'nm') + '</b> → observed at ' + H.n(656.3 + d.dl, 'nm') + '</div>' +
      '<p class="note">' + (v.vr > 0 ? '<b>Red shift</b>: every line moves to longer wavelength by the same <i>fraction</i>. The galaxy is moving away. Almost all galaxies are red-shifted, and farther ones more: the universe is expanding.' : v.vr < 0 ? '<b>Blue shift</b>: moving toward us (the Andromeda galaxy, one side of a spinning star).' : 'No relative motion, no shift.') + ' Use the <i>pattern</i> of lines to recognise hydrogen, then compare with the lab values.</p>';
    if (mode === 'radar') return '<h4>1 · Two Doppler shifts</h4><div class="eq">The ' + (d.us ? 'moving blood cells receive a shifted wave, then re-emit it' : 'moving car receives a shifted wave, then re-emits it') + ' as a moving source. So the echo is shifted twice: Δf ≈ 2uf/c.</div>' +
      '<h4>2 · Calculate the shift</h4><div class="eq">Δf = 2(' + H.iv('u') + ')(' + fnum(d.fHz) + ' Hz)/(' + fnum(d.c) + ' m/s) = <b>' + H.n(d.df, 'Hz') + '</b></div>' +
      '<p class="note">' + (d.us ? 'c here is the speed of sound in soft tissue (1540 m/s). Doctors use this to find blockages in arteries.' : 'The radar mixes the echo with its own signal and counts the beats: f<sub>beat</sub> = Δf. Rearranged for the exam: u = cΔf/(2f).') + '</p>';
    let s = '<h4>1 · Wavefronts bunch up in front</h4><div class="eq">The source moves ' + fnum(Math.abs(v.vs)) + ' m/s ' + (v.vs >= 0 ? 'toward' : 'away from') + ' the observer between wavefronts, so the gap ahead is λ = (v − u<sub>s</sub>)/f₀ = <b>' + H.n(d.lamA, 'm') + '</b> (at rest it would be ' + fnum(d.lam0) + ' m).</div>';
    if (d.shock) return '<h4>1 · Faster than sound!</h4><div class="bad">u<sub>s</sub> ≥ v: the source outruns its own waves. The wavefronts pile up into a cone (shock wave). The observer hears nothing until the cone sweeps past, then a sonic boom. Mach ' + fnum(d.mach) + '. The Doppler formula no longer applies.</div>';
    if (false) return s + '<h4>2 · Faster than sound!</h4><div class="bad">u<sub>s</sub> ≥ v: the wavefronts pile up into a cone (shock wave). The observer hears nothing until the cone sweeps past, then a sonic boom. Mach ' + fnum(d.mach) + '. The Doppler formula no longer applies.</div>';
    return s + '<h4>2 · Frequency heard (IB HL formula)</h4><div class="eq">f′ = f₀(v + u<sub>o</sub>)/(v − u<sub>s</sub>) = ' + H.iv('f0') + '(' + fnum(v.c) + ' + ' + fnum(v.vo) + ')/(' + fnum(v.c) + ' − ' + fnum(v.vs) + ') = <b>' + H.n(d.fa, 'Hz') + '</b></div>' +
      '<div class="eq">Behind the source: f = ' + H.n(d.fb, 'Hz') + '</div>' +
      '<p class="note">AP: qualitative only — toward → higher pitch, away → lower pitch, same velocity → no shift. The source’s own frequency f₀ never changes; only the waves reaching you do.</p>';
  },
  play(v, d, mode){ if (mode !== 'sound') return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
      if (!OSC){ OSC = AC.createOscillator(); OSC.type = 'triangle'; GN = AC.createGain(); GN.gain.value = 0; OSC.connect(GN); GN.connect(AC.destination); OSC.start(); }
      SND = true; S.anim.reset = true; } catch (e) {} },
  boom(){ try { const n = AC.sampleRate * 0.7, buf = AC.createBuffer(1, n, AC.sampleRate), ch = buf.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (n / 6)); const src = AC.createBufferSource(); src.buffer = buf; const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; const g = AC.createGain(); g.gain.value = 0.9; src.connect(lp); lp.connect(g); g.connect(AC.destination); src.start(); } catch (e) {} },
  // Set the audio to what the observer hears right now: the wavefront arriving now was sent at time te, when the source was at x0 + vs·te.
  hear(v, d, A, xo, yo, y, SC){
    const tt = A.tt, sx = te => A.x0 + v.vs * SC * te, g = te => Math.hypot(xo - sx(te), yo - y) - v.c * SC * (tt - te);
    let f = null, dist = 0;
    if (d.shock){ let hit = false; for (let k = 0; k <= 60; k++) if (g(tt * k / 60) <= 0){ hit = true; break; } if (hit && !A.boomed){ A.boomed = true; if (SND) SIM.boom(); } }
    else if (g(0) <= 0){ let lo = 0, hi = tt; for (let k = 0; k < 40; k++){ const m = (lo + hi) / 2; if (g(m) <= 0) lo = m; else hi = m; }
      const te = lo; dist = Math.hypot(xo - sx(te), yo - y); const ux = (xo - sx(te)) / dist; f = v.f0 * (v.c + v.vo * ux) / (v.c - v.vs * ux); }
    A.fNow = f;
    if (OSC){ const now = AC.currentTime, on = SND && f && isFinite(f);
      if (on) OSC.frequency.setTargetAtTime(f, now, 0.02); GN.gain.setTargetAtTime(on ? 0.06 + 0.22 * Math.min(1, 60 / dist) : 0, now, 0.05);
      clearTimeout(window._dopMute); window._dopMute = setTimeout(() => { SND = false; GN.gain.setTargetAtTime(0, AC.currentTime, 0.05); }, 300); }
  },
  draw(v, d, mode, opt, t, dt, A){
    if (!window._dopHook){ window._dopHook = 1; cv.style.cursor = 'pointer'; cv.addEventListener('click', () => SIM.play(S.v, S.d, S.mode)); }
    if (mode === 'sound') text(SND ? 'playing… (stops after one pass)' : 'click the picture to hear it go past', 590, 318, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#ff6a2b' });
    if (mode === 'color'){
      panelTitle('A MOVING LIGHT SOURCE (SLOWED WAY DOWN)', 10, 18);
      const SC = 85, T0 = 0.28, z = d.z, vx = z * SC;
      if (!A.em || A.reset){ A.em = []; A.tt = 0; A.next = 0; A.xs = z >= 0 ? 60 : 340; }
      A.tt += dt; A.xs += vx * dt; if (A.xs > 360 || A.xs < 40){ A.em = []; A.tt = 0; A.next = 0; A.xs = z >= 0 ? 60 : 340; }
      while (A.next <= A.tt){ A.em.push([A.xs - vx * (A.tt - A.next), A.next]); A.next += T0; } if (A.em.length > 40) A.em.shift();
      const y = 160; ctx.fillStyle = '#0d1424'; ctx.fillRect(12, 26, 376, 270); ctx.save(); ctx.beginPath(); ctx.rect(12, 26, 376, 270); ctx.clip();
      A.em.forEach(([x0, te]) => { const r = SC * (A.tt - te); for (let k = 0; k < 36; k++){ const a0 = k / 36 * 2 * PI, a1 = (k + 1) / 36 * 2 * PI, l = v.l0 * (1 - z * Math.cos((a0 + a1) / 2)); ctx.strokeStyle = 'rgb(' + wlRGB(l).join(',') + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x0, y, r, a0, a1); ctx.stroke(); } });
      ctx.restore();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(A.xs, y, 7, 0, 7); ctx.fill(); if (z) arrow(A.xs, y + 22, A.xs + Math.sign(z) * 30, y + 22, '#fff', null, { w: 2, head: 6 });
      const eye = (x, lab) => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x, 60, 12, 7, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, 60, 3.5, 0, 7); ctx.fill(); text(lab, x, 44, { align: 'center', font: '700 10px "Space Grotesk",sans-serif', col: '#fff' }); };
      eye(36, 'behind'); eye(364, 'in front');
      text('waves from a source moving ' + (z > 0 ? 'right' : z < 0 ? 'left' : '— not moving'), 200, 288, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#cfd8e6' });
      panelTitle('WHAT EACH PERSON SEES', 395, 18);
      const sw = (y0, lab, l) => { text(lab, 400, y0, { font: '700 12px "Space Grotesk",sans-serif' }); ctx.fillStyle = 'rgb(' + wlRGB(l).join(',') + ')'; ctx.fillRect(400, y0 + 8, 185, 40); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(400, y0 + 8, 185, 40); text(fplain(l) + ' nm', 404, y0 + 64, { font: '700 12px "IBM Plex Mono",monospace' }); };
      const right = z >= 0; sw(44, 'Person on the right', d.la); sw(130, 'Still (no motion)', v.l0); sw(216, 'Person on the left', d.lb);
      text(z > 0 ? '← red shift · blue shift →' : z < 0 ? '← blue shift · red shift →' : '', 492, 318, { align: 'center', font: '700 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    if (mode === 'light'){
      panelTitle('SPECTRUM: LAB vs GALAXY', 10, 18);
      const X = l => 20 + 360 * (l - 380) / 400, strip = (y, lines, lab) => { for (let l = 380; l <= 780; l++){ const [r, g, b] = wlRGB(l); ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'; ctx.fillRect(X(l), y, 1.2, 40); }
        ctx.fillStyle = '#000'; lines.forEach(l => { if (l >= 380 && l <= 780) ctx.fillRect(X(l) - 1.5, y, 3, 40); }); text(lab, 20, y - 6, { font: '700 11px "IBM Plex Mono",monospace' }); };
      strip(50, LINES.map(x => x[0]), 'HYDROGEN IN THE LAB'); strip(140, d.lines.map(x => x[1]), 'LIGHT FROM THE GALAXY (' + (v.vr >= 0 ? 'away' : 'toward') + ' ' + v.vr + ' km/s)');
      d.lines.forEach(([l0, l1, n]) => { if (l1 > 780) return; ctx.strokeStyle = '#4a4a4a'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(l0), 92); ctx.lineTo(X(l1), 138); ctx.stroke(); ctx.setLineDash([]); text(n, X(l0), 104, { align: 'center', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); });
      [400, 500, 600, 700].forEach(l => text(l + ' nm', X(l), 198, { align: 'center', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }));
      text('z = Δλ/λ = ' + fplain(d.z), 12, 240, { font: '700 14px "Space Grotesk",sans-serif' });
      panelTitle('LINE POSITIONS (nm)', 395, 18);
      d.lines.forEach(([l0, l1, n], i) => { text(n, 400, 50 + i * 30, { font: '700 12px "Space Grotesk",sans-serif' }); text(l0.toFixed(1) + ' → ' + l1.toFixed(1), 590, 50 + i * 30, { align: 'right', font: '600 12px "IBM Plex Mono",monospace' }); });
      text('same fraction for every line', 400, 190, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    if (mode === 'radar'){
      panelTitle(d.us ? 'ULTRASOUND PROBE ON AN ARTERY' : 'RADAR GUN AND A CAR', 10, 18);
      const y = 140; if (!A.x || A.reset) A.x = 340; A.x -= v.u * (d.us ? 60 : 1.5) * dt; if (A.x < 120) A.x = 340; if (A.x > 360) A.x = 140;
      if (d.us){ ctx.fillStyle = 'rgba(196,58,0,0.15)'; ctx.fillRect(20, y - 30, 360, 60); for (let k = 0; k < 10; k++){ const xx = ((A.x + k * 37) % 300) + 60; ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.ellipse(xx, y + ((k * 13) % 30) - 15, 7, 4, 0, 0, 7); ctx.fill(); } ctx.fillStyle = '#555'; ctx.fillRect(30, y - 80, 30, 40); text('probe', 45, y - 86, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); }
      else { ctx.fillStyle = '#555'; ctx.fillRect(30, y - 12, 34, 24); ctx.fillRect(40, y + 12, 10, 26); ctx.fillStyle = '#1546d6'; ctx.fillRect(A.x, y - 18, 60, 26); ctx.fillRect(A.x + 12, y - 32, 32, 16); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(A.x + 14, y + 10, 7, 0, 7); ctx.arc(A.x + 48, y + 10, 7, 0, 7); ctx.fill(); }
      const xt = d.us ? 200 : A.x; for (let k = 0; k < 6; k++){ const ph = ((t * 1.2 + k / 6) % 1); ctx.strokeStyle = 'rgba(21,70,214,' + (1 - ph) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(64, y, 10 + ph * (xt - 64), -0.3, 0.3); ctx.stroke();
        ctx.strokeStyle = 'rgba(196,58,0,' + (1 - ph) + ')'; ctx.beginPath(); ctx.arc(xt, y, 10 + ph * (xt - 64), PI - 0.3, PI + 0.3); ctx.stroke(); }
      arrow(d.us ? 300 : A.x + 30, y + 50, (d.us ? 300 : A.x + 30) - Math.sign(v.u) * 40, y + 50, '#111', 'u = ' + v.u + ' m/s', { w: 2.5, ly: 14 });
      text('blue: sent · red: echo', 12, 300, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('ECHO', 395, 18); text('Δf = ' + fplain(d.df) + ' Hz', 400, 60, { font: '700 16px "Space Grotesk",sans-serif' }); text(v.u > 0 ? 'approaching: echo higher' : v.u < 0 ? 'moving away: echo lower' : 'no motion: no shift', 400, 84, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      if (!d.us) text('= ' + fplain(Math.abs(v.u) * 3.6) + ' km/h', 400, 110, { font: '600 12px "IBM Plex Mono",monospace' });
      return;
    }
    panelTitle(d.shock ? 'SHOCK WAVE (SONIC BOOM)' : 'WAVEFRONT DIAGRAM', 10, 18);
    const SC = 0.5, T0 = 0.11; // px per (m/s · s) and visual emission period
    if (!A.em || A.reset){ A.em = []; A.tt = 0; A.xs = d.shock || v.vs > 0 ? 40 : 200; A.x0 = A.xs; A.next = 0; A.boomed = false; }
    A.tt += dt; A.xs += v.vs * SC * dt; const xo0 = 340 - v.vo * SC * A.tt;
    if (A.xs > (SND ? 640 : 400) || A.xs < (SND ? -240 : -20) || xo0 < 40 || A.tt > 14){ A.em = []; A.xs = v.vs >= 0 ? 40 : 330; A.x0 = A.xs; A.tt = 0; A.next = 0; A.boomed = false; SND = false; }
    while (A.next <= A.tt){ A.em.push([A.xs - v.vs * SC * (A.tt - A.next), A.next]); A.next += T0; } if (A.em.length > 90) A.em.shift();
    const y = 150; ctx.save(); ctx.beginPath(); ctx.rect(10, 26, 375, 260); ctx.clip();
    A.em.forEach(([x0, te]) => { const r = v.c * SC * (A.tt - te); ctx.strokeStyle = 'rgba(21,70,214,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x0, y, r, 0, 7); ctx.stroke(); });
    ctx.restore();
    if (A.xs < 385 && A.xs > 10){ ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(A.xs, y, 7, 0, 7); ctx.fill(); } if (A.xs < 385 && A.xs > 10) text('source', A.xs, y + 24, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#c43a00' });
    const xo = Math.max(40, Math.min(380, xo0)); SIM.hear(v, d, A, 340 - v.vo * SC * A.tt, y - 60, y, SC); ctx.fillStyle = '#1e7d45'; ctx.beginPath(); ctx.arc(xo, y - 60, 7, 0, 7); ctx.fill(); text('observer', xo, y - 72, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#1e7d45' });
    text(d.shock ? 'Mach ' + fplain(d.mach) : 'ahead: λ = ' + fplain(d.lamA) + ' m   behind: λ = ' + fplain(d.lamB) + ' m', 12, 310, { font: '700 13px "Space Grotesk",sans-serif' });
    panelTitle('PITCH HEARD', 395, 18);
    const bars = [['source (f₀)', v.f0], ['ahead (f′)', d.fa], ['behind', d.fb]]; const fm = Math.max(...bars.map(b => isFinite(b[1]) ? b[1] : 0), v.f0);
    bars.forEach(([n, f], i) => { const yy = 50 + i * 50; text(n, 400, yy, { font: '700 12px "Space Grotesk",sans-serif' }); ctx.fillStyle = i ? (f > v.f0 ? '#ff6a2b' : '#1546d6') : '#8a8a8a'; if (isFinite(f)) ctx.fillRect(400, yy + 8, 170 * f / fm, 14); text(isFinite(f) ? fplain(f) + ' Hz' : '—', 404, yy + 36, { font: '600 11px "IBM Plex Mono",monospace' }); });
    text('Observer hears now', 400, 214, { font: '700 12px "Space Grotesk",sans-serif' }); text(A.fNow ? fplain(A.fNow) + ' Hz' : d.shock ? (A.boomed ? 'BOOM!' : 'silence…') : 'waiting for the waves…', 400, 238, { font: '700 16px "IBM Plex Mono",monospace', col: A.fNow ? (A.fNow > v.f0 ? '#ff6a2b' : '#1546d6') : '#4a4a4a' });
    text('waves slowed down to watch', 400, 262, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
  }
};
