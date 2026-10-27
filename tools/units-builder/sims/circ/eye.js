// The Eye & Eyeglasses (AP 13.4 application): the eye as a thin lens with a fixed lens-to-retina distance, accommodation, near and far points, nearsighted / farsighted / aging eyes, and working out a glasses prescription in diopters.
const SR = 0.017, P0 = 1 / SR; // simplified eye: lens 1.7 cm in front of the retina
const SIM = {
  title: 'The Eye & Eyeglasses',
  hint: 'P = 1/f, f in metres',
  modes: [{ id: 'normal', label: 'How the eye focuses' }, { id: 'myo', label: 'Nearsighted' }, { id: 'hyp', label: 'Farsighted / aging' }],
  opts: [{ id: 'gl', label: 'Glasses', modes: ['myo', 'hyp'], choices: [['off', 'Off'], ['on', 'On']] }],
  ivs(mode){
    const so = { id: 'so', sym: 's<sub>o</sub>', symText: 'so', label: 'Distance to what you look at', unit: 'm', min: 0.1, max: 8, step: 0.01, val: mode === 'hyp' ? 0.25 : mode === 'myo' ? 6 : 2, graph: true };
    if (mode === 'myo') return [so, { id: 'FP', sym: 'FP', symText: 'FP', label: 'Far point (farthest you can see clearly)', unit: 'm', min: 0.2, max: 4, step: 0.05, val: 0.5 }];
    if (mode === 'hyp') return [so, { id: 'NP', sym: 'NP', symText: 'NP', label: 'Near point (closest you can see clearly)', unit: 'm', min: 0.3, max: 3, step: 0.05, val: 1 }];
    return [so, { id: 'NP', sym: 'NP', symText: 'NP', label: 'Near point (10 cm at 15 yr, 25 cm at 40 yr)', unit: 'm', min: 0.08, max: 0.5, step: 0.01, val: 0.25 }];
  },
  presets: [{ label: 'Reading a book', mode: 'normal', v: { so: 0.25 } }, { label: 'Can’t read the board', mode: 'myo', v: { so: 6, FP: 0.5 } }, { label: 'Reading glasses (age 60)', mode: 'hyp', v: { so: 0.25, NP: 1.5 } }, { label: 'Too close to focus', mode: 'normal', v: { so: 0.1 } }],
  calc(v, mode, opt){
    let Pmin, Pmax; const A = 4;
    if (mode === 'myo'){ Pmin = P0 + 1 / v.FP; Pmax = Pmin + A; } else if (mode === 'hyp'){ Pmax = P0 + 1 / v.NP; Pmin = Pmax - A; } else { Pmin = P0; Pmax = P0 + 1 / v.NP; }
    const glOn = mode !== 'normal' && (opt.gl || 'off') === 'on', Rx = mode === 'myo' ? -1 / v.FP : mode === 'hyp' ? 1 / 0.25 - 1 / v.NP : 0, Pg = glOn ? Rx : 0;
    const need = 1 / v.so + P0 - Pg, Peye = Math.min(Pmax, Math.max(Pmin, need)), Ptot = Peye + Pg, si = 1 / (Ptot - 1 / v.so), err = si - SR, sharp = Math.abs(need - Peye) < 0.05;
    const nearPt = Pmax - P0 + Pg > 0 ? 1 / (Pmax - P0 + Pg) : Infinity, farPt = Pmin - P0 + Pg > 1e-6 ? 1 / (Pmin - P0 + Pg) : Infinity;
    return { Pmin, Pmax, need, Peye, Pg, Rx, glOn, si, err, sharp, nearPt, farPt, fEye: 1 / Peye, RxQ: Math.round(Rx * 4) / 4 };
  },
  dvs(mode){
    const a = [{ id: 'need', name: 'Lens power the eye needs', short: 'P', sym: 'P', unit: 'D', f: d => d.need }, { id: 'err', name: 'Focus miss (+ behind retina)', short: 'miss', sym: 'miss', unit: 'mm', f: d => d.err * 1000 }];
    if (mode !== 'normal') a.push({ id: 'rx', name: 'Prescription needed', short: 'Rx', sym: 'Rx', unit: 'D', f: d => d.Rx });
    return a;
  },
  work(v, d, mode){
    const where = d.sharp ? '<b>sharp on the retina</b>' : d.err > 0 ? 'focused <b>behind</b> the retina → blurry' : 'focused <b>in front of</b> the retina → blurry';
    let s = '<h4>1 · The eye is a converging lens with a fixed screen</h4><div class="eq">Cornea + lens act like one lens 1.7 cm from the retina, so sᵢ = 1.7 cm always. The eye muscles change the lens shape to change f instead.</div>' +
      '<h4>2 · Power needed for this object</h4><div class="eq">P = 1/f = 1/sₒ + 1/sᵢ = 1/' + H.iv('so') + (d.glOn ? ' − (glasses ' + fnum(d.Pg) + ' D)' : '') + ' + 1/0.017 m = <b>' + H.n(d.need, 'D') + '</b> (diopters = 1/m)</div>' +
      '<h4>3 · Can this eye do it?</h4><div class="eq">This eye’s range: ' + fnum(d.Pmin) + ' D (relaxed) to ' + fnum(d.Pmax) + ' D (fully squeezed) → ' + where + '.</div>';
    if (mode === 'normal') return s + '<p class="note">Far object: relaxed lens, thinner, longer f. Close object: muscles make the lens fatter → shorter f, more power (accommodation). Past the near point (' + H.iv('NP') + ') it can’t get any stronger. With age the lens stiffens and the near point moves out — that’s why people over 45 hold menus at arm’s length.</p>';
    if (mode === 'myo') return s + '<h4>4 · Prescription</h4><div class="eq">The eye is too strong (or the eyeball too long): distant light focuses in front of the retina. A diverging lens must make distant objects look like they are at the far point: P = −1/FP = −1/' + H.iv('FP') + ' = <b>' + H.n(d.Rx, 'D') + '</b> → Rx <b>SPH ' + (d.RxQ > 0 ? '+' : '') + d.RxQ.toFixed(2) + '</b></div>' +
      '<p class="note">Negative power = diverging lens = thinner in the middle. With glasses on you see clearly from ' + (isFinite(d.nearPt) ? fnum(d.nearPt * 100) + ' cm' : '—') + ' to ' + (isFinite(d.farPt) ? fnum(d.farPt) + ' m' : 'infinity') + '. (Real glasses sit about 1.5 cm from the eye, so optometrists adjust slightly; contact lenses match this calculation.)</p>';
    return s + '<h4>4 · Prescription</h4><div class="eq">The eye is too weak (eyeball too short, or a stiff aging lens): close objects focus behind the retina. A converging lens must make a book at 25 cm look like it is at the near point: P = 1/0.25 − 1/NP = 4 − 1/' + H.iv('NP') + ' = <b>' + H.n(d.Rx, 'D') + '</b> → Rx <b>SPH +' + d.RxQ.toFixed(2) + '</b></div>' +
      '<p class="note">Positive power = converging lens = magnifying, thicker in the middle. Drugstore reading glasses are labelled +1.00 to +3.50 — exactly this number. Bifocals and progressives have a different power at the bottom for reading. A prescription may also list CYL and AXIS: that corrects astigmatism, where the cornea is curved more one way than the other.</p>';
  },
  draw(v, d, mode){
    panelTitle(({ normal: 'THE EYE FOCUSING', myo: 'NEARSIGHTED EYE', hyp: 'FARSIGHTED EYE' })[mode] + (d.glOn ? ' + GLASSES' : ''), 10, 18);
    const cy = 165, lx = 160, rx = 315, k = (rx - lx) / SR;
    ctx.fillStyle = '#fbeee6'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(240, cy, 85, 0, 7); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(240, cy, 83, -0.8, 0.8); ctx.stroke(); text('retina', 330, cy - 70, { font: '700 11px "Space Grotesk",sans-serif', col: '#c43a00' });
    const fat = Math.min(1, Math.max(0, (d.Peye - d.Pmin) / 6)); ctx.fillStyle = 'rgba(120,170,230,0.55)'; ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(lx, cy, 7 + 6 * fat, 34, 0, 0, 7); ctx.fill(); ctx.stroke(); text('lens', lx, cy + 52, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#1546d6' });
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lx + 30, cy, 50, PI - 0.75, PI + 0.75); ctx.stroke(); text('cornea', lx - 26, cy - 46, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    if (d.glOn){ const gx = 85; ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 3; ctx.beginPath(); if (d.Pg < 0){ ctx.moveTo(gx - 7, cy - 42); ctx.quadraticCurveTo(gx + 2, cy, gx - 7, cy + 42); ctx.lineTo(gx + 7, cy + 42); ctx.quadraticCurveTo(gx - 2, cy, gx + 7, cy - 42); ctx.closePath(); } else { ctx.ellipse(gx, cy, 7, 42, 0, 0, 7); } ctx.stroke(); text('glasses ' + (d.RxQ > 0 ? '+' : '') + d.RxQ.toFixed(2) + ' D', gx, cy + 62, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#7a3fb0' }); }
    // rays: from far left to the lens (nearly parallel unless very close), then toward the image point, stopped at the retina
    const xi = lx + d.si * k; ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 1.8; [-28, -14, 14, 28].forEach(y0 => { ctx.beginPath(); ctx.moveTo(20, cy + y0 * (1 - (lx - 20) / Math.max(lx - 20 + 1, v.so * k * 0.05))); ctx.lineTo(lx, cy + y0);
      const ux = xi - lx, uy = -y0, xe = rx - 4, t = (xe - lx) / ux; ctx.lineTo(xe, cy + y0 + uy * t); ctx.stroke(); });
    const blur = Math.abs(28 * (1 - (rx - 4 - lx) / (xi - lx))); ctx.fillStyle = d.sharp ? '#1e7d45' : '#ff6a2b'; ctx.beginPath(); ctx.ellipse(rx - 2, cy, 4, Math.max(2, blur), 0, 0, 7); ctx.fill();
    if (!d.sharp && xi > lx && xi < 380){ ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(xi, cy, 3, 0, 7); ctx.fill(); text('focus', xi, cy + 16, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); }
    text(d.sharp ? 'SHARP' : 'BLURRY', 20, 300, { font: '700 16px "Space Grotesk",sans-serif', col: d.sharp ? '#1e7d45' : '#c43a00' }); text('object ' + v.so + ' m away (not to scale) →', 20, 46, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    panelTitle(mode === 'normal' ? 'EYE POWER' : 'PRESCRIPTION', 395, 18);
    if (mode !== 'normal'){ ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(400, 30, 185, 52); text('Rx   SPH', 408, 50, { font: '700 12px "IBM Plex Mono",monospace' }); text((d.RxQ > 0 ? '+' : '') + d.RxQ.toFixed(2), 578, 70, { align: 'right', font: '700 22px "Space Grotesk",sans-serif', col: '#7a3fb0' }); text(d.Rx < 0 ? 'diverging' : 'converging', 408, 72, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
    const y0 = mode === 'normal' ? 40 : 100; [['needed', fplain(d.need) + ' D'], ['eye range', fplain(d.Pmin) + '–' + fplain(d.Pmax) + ' D'], ['near point', isFinite(d.nearPt) ? fplain(d.nearPt * 100) + ' cm' : '—'], ['far point', isFinite(d.farPt) ? fplain(d.farPt) + ' m' : '∞']].forEach(([a, b], i) => { text(a, 400, y0 + i * 24, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, y0 + i * 24, { align: 'right', font: '700 12px "IBM Plex Mono",monospace' }); });
    // clear-vision range bar (log scale 5 cm to 10 m)
    const bx = 400, bw = 185, by = y0 + 112, L = x => bx + bw * (Math.log10(Math.min(10, Math.max(0.05, x))) + 1.301) / 2.301;
    text('clear from … to …', bx, by - 6, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); ctx.fillStyle = '#ddd'; ctx.fillRect(bx, by, bw, 12); ctx.fillStyle = '#1e7d45'; const a = L(d.nearPt), b = isFinite(d.farPt) && d.farPt > 0 ? L(d.farPt) : bx + bw; ctx.fillRect(a, by, Math.max(2, b - a), 12);
    ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(L(v.so), by + 6, 5, 0, 7); ctx.fill(); [[0.1, '10 cm'], [1, '1 m'], [10, '10 m']].forEach(([x, t]) => text(t, L(x), by + 26, { align: 'center', font: '500 9px "IBM Plex Mono",monospace' }));
  }
};
