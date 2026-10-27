// Atomic Spectra (AP 15.2–15.3, IB E.1): hydrogen energy levels (Eₙ = −13.6/n² eV), emission and absorption lines, photon energy E = hf = hc/λ, and the classic FRQ energy-level diagram (photon vs electron collisions).
const HC = 1240; // eV·nm
function wlRGB(l){ let r = 0, g = 0, b = 0; if (l < 440){ r = (440 - l) / 60; b = 1; } else if (l < 490){ g = (l - 440) / 50; b = 1; } else if (l < 510){ g = 1; b = (510 - l) / 20; } else if (l < 580){ r = (l - 510) / 70; g = 1; } else if (l < 645){ r = 1; g = (645 - l) / 65; } else r = 1;
  const a = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 700 ? 0.3 + 0.7 * (780 - l) / 80 : 1; return [r, g, b].map(c => Math.round(255 * Math.max(0, Math.min(1, c * a)))); }
const rgb = l => 'rgb(' + wlRGB(l).join(',') + ')';
const MYST = [-12.0, -7.0, -4.5, -2.0]; // mystery atom levels (eV)
const region = l => l < 380 ? 'ultraviolet' : l > 750 ? 'infrared' : 'visible';
const SIM = {
  title: 'Atomic Spectra',
  hint: 'E = hf = hc/λ · hc = 1240 eV·nm',
  modes: [{ id: 'emit', label: 'Hydrogen: emission' }, { id: 'abs', label: 'Hydrogen: absorption' }, { id: 'myst', label: 'Energy-level diagram' }],
  opts: [{ id: 'hit', label: 'Hit it with', modes: ['myst'], choices: [['ph', 'A photon'], ['el', 'An electron']] }],
  ivs(mode){
    if (mode === 'myst') return [{ id: 'E', sym: 'E', symText: 'E', label: 'Energy of the incoming photon or electron', unit: 'eV', min: 0, max: 13, step: 0.05, val: 5, graph: true }];
    return [
      { id: 'hi', sym: 'n<sub>upper</sub>', symText: 'nupper', label: 'Upper level', unit: '', min: 2, max: 7, step: 1, val: 3, graph: true, show: x => 'n = ' + x },
      { id: 'lo', sym: 'n<sub>lower</sub>', symText: 'nlower', label: 'Lower level', unit: '', min: 1, max: 6, step: 1, val: 2, show: x => 'n = ' + x }];
  },
  presets: [{ label: 'Red Hα (3 → 2)', mode: 'emit', v: { hi: 3, lo: 2 } }, { label: 'Lyman UV (2 → 1)', mode: 'emit', v: { hi: 2, lo: 1 } }, { label: 'Exactly 5.0 eV', mode: 'myst', v: { E: 5 } }, { label: 'Ionize it', mode: 'myst', v: { E: 12.5 } }],
  calc(v, mode, opt){
    if (mode === 'myst'){ const el = (opt.hit || 'ph') === 'el', gaps = MYST.slice(1).map((e, i) => e - MYST[0]), ion = -MYST[0];
      let up = 0; if (v.E >= ion) up = 'ion'; else if (el){ gaps.forEach((g, i) => { if (v.E >= g - 1e-9) up = i + 1; }); } else { gaps.forEach((g, i) => { if (Math.abs(v.E - g) < 0.026) up = i + 1; }); }
      const emits = []; if (typeof up === 'number' && up > 0) for (let a = up; a > 0; a--) for (let b = a - 1; b >= 0; b--) emits.push([a + 1, b + 1, MYST[a] - MYST[b], HC / (MYST[a] - MYST[b])]);
      return { el, gaps, ion, up, emits, left: up === 'ion' ? v.E - ion : el && up ? v.E - gaps[up - 1] : el ? v.E : 0 }; }
    const hi = Math.max(v.hi, v.lo + 1), lo = Math.min(v.lo, hi - 1), E = n => -13.6 / (n * n), dE = E(hi) - E(lo), lam = HC / dE, f = dE * 1.6e-19 / 6.63e-34;
    return { hi, lo, dE, lam, f, Ehi: E(hi), Elo: E(lo), series: ['Lyman (UV)', 'Balmer (visible)', 'Paschen (IR)', 'Brackett (IR)', 'Pfund (IR)', 'IR'][lo - 1], bad: v.hi <= v.lo };
  },
  dvs(mode){
    if (mode === 'myst') return [{ id: 'left', name: 'Energy left over (passes on / kinetic)', short: 'left', sym: 'E<sub>left</sub>', unit: 'eV', f: d => d.left }];
    return [{ id: 'lam', name: 'Wavelength of the photon', short: 'λ', sym: 'λ', unit: 'nm', f: d => d.lam }, { id: 'dE', name: 'Photon energy', short: 'E', sym: 'E', unit: 'eV', f: d => d.dE }];
  },
  work(v, d, mode){
    if (mode === 'myst'){
      const list = '<div class="eq">Gaps from the ground state: ' + d.gaps.map((g, i) => '1→' + (i + 2) + ': ' + fnum(g) + ' eV').join(', ') + '; ionization ' + fnum(d.ion) + ' eV</div>';
      let s = '<h4>1 · What can the atom absorb?</h4>' + list;
      if (d.el) s += '<div class="eq">An <b>electron</b> can give up <i>part</i> of its energy, so it excites the atom to the highest level it can reach and keeps the rest: ' + (d.up === 'ion' ? '<b>ionized</b>' : d.up ? 'up to n = <b>' + (d.up + 1) + '</b>, keeps ' + H.n(d.left, 'eV') : 'not enough for any jump; it bounces off with all ' + H.iv('E')) + '.</div>';
      else s += '<div class="eq">A <b>photon</b> is all or nothing: it is absorbed only if its energy matches a gap exactly. ' + (d.up === 'ion' ? 'Above the ionization energy: <b>ionized</b>, the electron leaves with ' + H.n(d.left, 'eV') + '.' : d.up ? 'Match! The atom jumps to n = <b>' + (d.up + 1) + '</b>.' : 'No match → the photon passes straight through.') + '</div>';
      if (d.emits.length) s += '<h4>2 · Photons it can then emit</h4><div class="eq">' + d.emits.map(([a, b, e, l]) => a + '→' + b + ': ' + fnum(e) + ' eV, λ = <b>' + fnum(l) + ' nm</b> (' + region(l) + ')').join('<br>') + '</div><p class="note">FRQ classic: from level k there are k(k−1)/2 possible downward jumps.</p>';
      return s;
    }
    if (d.bad) return '<div class="bad">The upper level must be above the lower level. Using n = ' + d.hi + ' → ' + d.lo + '.</div>';
    const abs = mode === 'abs';
    return '<h4>1 · Energy levels of hydrogen</h4><div class="eq">Eₙ = −13.6 eV/n²: E<sub>' + d.hi + '</sub> = ' + fnum(d.Ehi) + ' eV, E<sub>' + d.lo + '</sub> = ' + fnum(d.Elo) + ' eV</div>' +
      '<h4>2 · Photon energy = the gap</h4><div class="eq">E<sub>photon</sub> = ' + fnum(d.Ehi) + ' − (' + fnum(d.Elo) + ') = <b>' + H.n(d.dE, 'eV') + '</b> = ' + H.n(d.dE * 1.6e-19, 'J') + '</div>' +
      '<h4>3 · Wavelength and frequency</h4><div class="eq">λ = hc/E = 1240 eV·nm / ' + fnum(d.dE) + ' eV = <b>' + H.n(d.lam, 'nm') + '</b> (' + region(d.lam) + '); f = E/h = ' + H.n(d.f, 'Hz') + '</div>' +
      '<p class="note">' + (abs ? 'Absorption: white light passes through cool hydrogen gas. Photons with exactly this energy lift electrons from n = ' + d.lo + ' to n = ' + d.hi + ', so this colour is missing — a dark line. Dark lines in the Sun’s spectrum tell us what the Sun is made of (helium was discovered this way).' : 'Emission: hot or electrically excited gas. The electron drops from n = ' + d.hi + ' to n = ' + d.lo + ' and emits one photon. ' + d.series + ' series. Every element has its own pattern of lines — a fingerprint. Neon signs and street lights glow with their gases’ lines.') + '</p>';
  },
  draw(v, d, mode, opt){
    const lvl = (E, Emin, y0, y1) => y1 - (y1 - y0) * (E - Emin) / (0 - Emin);
    if (mode === 'myst'){
      panelTitle('MYSTERY ATOM: ENERGY-LEVEL DIAGRAM', 10, 18);
      const Y = E => lvl(E, -13, 40, 290);
      ctx.strokeStyle = '#8a8a8a'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(60, Y(0)); ctx.lineTo(300, Y(0)); ctx.stroke(); ctx.setLineDash([]); text('0 eV (ionized)', 305, Y(0) + 4, { font: '600 10px "IBM Plex Mono",monospace' });
      MYST.forEach((E, i) => { const on = d.up === i || (d.up === 0 && i === 0); ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(60, Y(E)); ctx.lineTo(300, Y(E)); ctx.stroke(); text('n = ' + (i + 1), 54, Y(E) + 4, { align: 'right', font: '700 11px "Space Grotesk",sans-serif' }); text(E.toFixed(1) + ' eV', 305, Y(E) + 4, { font: '600 10px "IBM Plex Mono",monospace' }); });
      const top = d.up === 'ion' ? 0 : d.up ? MYST[d.up] : null; if (top !== null){ arrow(90, Y(MYST[0]), 90, Y(top) + 2, '#1546d6', 'absorbed', { w: 3, lx: 6, ly: 10 }); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(100, Y(top), 6, 0, 7); ctx.fill(); }
      else { ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(100, Y(MYST[0]), 6, 0, 7); ctx.fill(); }
      d.emits.forEach(([a, b, e, l], k) => { const x = 150 + k * 22; if (x > 290) return; arrow(x, Y(MYST[a - 1]), x, Y(MYST[b - 1]) - 2, l >= 380 && l <= 750 ? rgb(l) : '#8a8a8a', null, { w: 2.5, head: 7 }); });
      ctx.fillStyle = '#ffe2d3'; ctx.fillRect(12, 296, 120, 22); text((d.el ? 'electron ' : 'photon ') + v.E.toFixed(2) + ' eV', 18, 312, { font: '700 12px "Space Grotesk",sans-serif' });
      panelTitle('EMITTED LINES', 395, 18);
      ctx.fillStyle = '#111'; ctx.fillRect(400, 40, 185, 40); d.emits.forEach(([a, b, e, l]) => { if (l >= 380 && l <= 750){ ctx.fillStyle = rgb(l); ctx.fillRect(400 + 185 * (l - 380) / 370 - 1.5, 40, 3, 40); } });
      text('380 nm', 400, 94, { font: '500 9px "IBM Plex Mono",monospace' }); text('750 nm', 585, 94, { align: 'right', font: '500 9px "IBM Plex Mono",monospace' });
      d.emits.slice(0, 6).forEach(([a, b, e, l], k) => text(a + '→' + b + '  ' + fplain(l) + ' nm ' + (region(l) === 'visible' ? '' : '(' + region(l).slice(0, 5) + '.)'), 400, 116 + k * 18, { font: '600 11px "IBM Plex Mono",monospace' }));
      if (!d.emits.length) text(d.up === 'ion' ? 'electron removed' : 'nothing emitted', 400, 116, { font: '600 11px "IBM Plex Mono",monospace', col: '#8a8a8a' });
      return;
    }
    panelTitle(mode === 'abs' ? 'ABSORPTION: ELECTRON JUMPS UP' : 'EMISSION: ELECTRON DROPS DOWN', 10, 18);
    const Y = E => lvl(E, -14, 40, 290); ctx.strokeStyle = '#8a8a8a'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(60, Y(0)); ctx.lineTo(260, Y(0)); ctx.stroke(); ctx.setLineDash([]);
    for (let n = 1; n <= 7; n++){ const E = -13.6 / (n * n), on = n === d.hi || n === d.lo; ctx.strokeStyle = on ? '#111' : '#bbb'; ctx.lineWidth = on ? 2.5 : 1.5; ctx.beginPath(); ctx.moveTo(60, Y(E)); ctx.lineTo(260, Y(E)); ctx.stroke(); if (n <= 4 || on) { text('n = ' + n, 54, Y(E) + 4, { align: 'right', font: '600 10px "Space Grotesk",sans-serif' }); text(E.toFixed(2) + ' eV', 266, Y(E) + 4, { font: '500 9px "IBM Plex Mono",monospace' }); } }
    const col = d.lam >= 380 && d.lam <= 750 ? rgb(d.lam) : '#8a8a8a';
    if (mode === 'abs') arrow(150, Y(d.Elo), 150, Y(d.Ehi) + 2, '#111', null, { w: 3 }); else arrow(150, Y(d.Ehi), 150, Y(d.Elo) - 2, '#111', null, { w: 3 });
    ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); const yy = (Y(d.Ehi) + Y(d.Elo)) / 2; for (let i = 0; i <= 60; i++){ const x = mode === 'abs' ? 70 + i : 160 + i, y = yy + 6 * Math.sin(i * 0.6); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    text(fplain(d.lam) + ' nm', mode === 'abs' ? 70 : 165, yy + 22, { font: '700 12px "Space Grotesk",sans-serif', col: col === '#8a8a8a' ? '#4a4a4a' : '#111' });
    panelTitle(mode === 'abs' ? 'WHITE LIGHT THROUGH H GAS' : 'GLOWING H GAS', 395, 18);
    const X = l => 400 + 185 * (l - 380) / 370, bal = [656.3, 486.1, 434.0, 410.2, 397.0];
    if (mode === 'abs'){ for (let l = 380; l <= 750; l++){ ctx.fillStyle = rgb(l); ctx.fillRect(X(l), 40, 1.2, 50); } ctx.fillStyle = '#000'; if (d.lo === 2) bal.forEach(l => ctx.fillRect(X(l) - 1, 40, 2, 50)); }
    else { ctx.fillStyle = '#111'; ctx.fillRect(400, 40, 185, 50); if (d.lo === 2) bal.forEach(l => { ctx.fillStyle = rgb(l); ctx.globalAlpha = 0.35; ctx.fillRect(X(l) - 1, 40, 2, 50); ctx.globalAlpha = 1; }); }
    if (d.lam >= 380 && d.lam <= 750){ ctx.fillStyle = mode === 'abs' ? '#000' : rgb(d.lam); ctx.fillRect(X(d.lam) - 2, 36, 4, 58); ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 1.5; ctx.strokeRect(X(d.lam) - 4, 34, 8, 62); }
    else text('this line is ' + region(d.lam) + ' (off this strip)', 400, 112, { font: '700 11px "Space Grotesk",sans-serif', col: '#c43a00' });
    text('380', 400, 104, { font: '500 9px "IBM Plex Mono",monospace' }); text('750 nm', 585, 104, { align: 'right', font: '500 9px "IBM Plex Mono",monospace' });
    [['jump', d.hi + ' ↔ ' + d.lo], ['photon E', fplain(d.dE) + ' eV'], ['λ', fplain(d.lam) + ' nm'], ['series', d.series]].forEach(([a, b], i) => { text(a, 400, 140 + i * 24, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 140 + i * 24, { align: 'right', font: '700 12px "IBM Plex Mono",monospace' }); });
  }
};
