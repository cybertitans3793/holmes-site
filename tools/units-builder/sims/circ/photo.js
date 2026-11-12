// Photoelectric Effect (AP 15.5, IB E.2 HL): K_max = hf − φ, threshold frequency, stopping potential, why brightness changes the current but not the electron energy, and the K_max vs f graph (slope h, intercept −φ).
const METALS = { cs: ['Cesium', 2.1], na: ['Sodium', 2.28], zn: ['Zinc', 4.3], cu: ['Copper', 4.7] }, HEV = 4.14e-15; // h in eV·s
function wlRGB(l){ let r = 0, g = 0, b = 0; if (l < 440){ r = (440 - l) / 60; b = 1; } else if (l < 490){ g = (l - 440) / 50; b = 1; } else if (l < 510){ g = 1; b = (510 - l) / 20; } else if (l < 580){ r = (l - 510) / 70; g = 1; } else if (l < 645){ r = 1; g = (645 - l) / 65; } else r = 1;
  return 'rgb(' + [r, g, b].map(c => Math.round(255 * Math.max(0, Math.min(1, c)))).join(',') + ')'; }
const SIM = {
  title: 'Photoelectric Effect',
  hint: 'K_max = hf − φ · E = hc/λ',
  modes: [{ id: 'tube', label: 'Photoelectric tube' }, { id: 'stream', label: 'Photon stream' }],
  opts: [{ id: 'm', label: 'Metal', choices: [['na', 'Sodium'], ['cs', 'Cesium'], ['zn', 'Zinc'], ['cu', 'Copper']] }],
  ivs(mode){
    if (mode === 'stream') return [
      { id: 'P', sym: 'P', symText: 'P', label: 'Power of each beam', unit: 'mW', min: 1, max: 100, step: 1, val: 10 },
      { id: 'lam', sym: 'λ', symText: 'lambda', label: 'Wavelength of the second beam', unit: 'nm', min: 380, max: 700, step: 5, val: 450, graph: true }];
    return [
    { id: 'f', sym: 'f', symText: 'f', label: 'Light frequency (×10¹⁴ Hz)', unit: '×10¹⁴ Hz', min: 3, max: 15, step: 0.05, val: 7.5, graph: true, show: x => x.toFixed(2) + '×10¹⁴ Hz' },
    { id: 'B', sym: 'N', symText: 'N', label: 'Brightness (photons per second, %)', unit: '%', min: 0, max: 100, step: 1, val: 60 },
    { id: 'V', sym: 'V', symText: 'V', label: 'Battery voltage (− = stopping)', unit: 'V', min: -4, max: 3, step: 0.02, val: 0 }]; },
  presets: [{ label: 'Red light (any brightness)', mode: 'tube', v: { f: 4.5, B: 100 } }, { label: 'Dim UV', mode: 'tube', v: { f: 12, B: 10 } }, { label: 'Find the stopping voltage', mode: 'tube', v: { f: 9, V: -1.45 } }, { label: 'Equal power: red vs violet', mode: 'stream', v: { P: 20, lam: 400 } }],
  calc(v, mode, opt){
    if (mode === 'stream'){ const [nm, phi] = METALS[opt.m || 'na'], lamR = 650, E1 = 1240 / lamR, E2 = 1240 / v.lam, PW = v.P * 1e-3, N1 = PW / (E1 * 1.6e-19), N2 = PW / (E2 * 1.6e-19);
      return { nm, phi, lamR, E1, E2, E1J: E1 * 1.6e-19, E2J: E2 * 1.6e-19, PW, N1, N2, yes1: E1 > phi, yes2: E2 > phi, K1: Math.max(0, E1 - phi), K2: Math.max(0, E2 - phi), ratioN: N1 / N2, ratioE: E2 / E1 }; }
    const [nm, phi] = METALS[opt.m || 'na'], f = v.f * 1e14, E = HEV * f, K = E - phi, lam = 3e8 / f * 1e9, f0 = phi / HEV, yes = K > 0;
    const frac = !yes ? 0 : v.V >= 0 ? 1 : Math.max(0, 1 + v.V / K), I = v.B / 100 * frac;
    return { nm, phi, E, K, Kmax: yes ? K : 0, lam, f0, yes, I, Vs: yes ? K : 0 };
  },
  dvs(mode){
    if (mode === 'stream') return [{ id: 'N2', name: 'Photons per second in the second beam', short: 'N', sym: 'N', unit: 's⁻¹', f: d => d.N2 }, { id: 'E2', name: 'Energy of one photon in the second beam', short: 'E', sym: 'E', unit: 'eV', f: d => d.E2 }];
    return [{ id: 'K', name: 'Maximum kinetic energy of the electrons', short: 'K_max', sym: 'K<sub>max</sub>', unit: 'eV', f: d => d.Kmax }, { id: 'I', name: 'Current (fraction of maximum)', short: 'I', sym: 'I', unit: '', f: d => d.I }, { id: 'Vs', name: 'Stopping voltage', short: 'V_s', sym: 'V<sub>s</sub>', unit: 'V', f: d => d.Vs }]; },
  work(v, d, mode){
    if (mode === 'stream'){
      const nm = x => '<mn>' + x + '</mn>', lam2 = M.iv('lam');
      let s = '<p class="st">Both beams carry the <b>same power</b>, P = ' + H.iv('P') + ' = ' + fnum(d.PW) + ' W (joules per second). One beam is red (650 nm), the other is ' + H.iv('lam') + '.</p>' +
        '<h4>1 · Energy of one photon</h4>' + TEX`E = \frac{hc}{\lambda}` + '<p class="st">Red beam:</p>' + TEX`E_{\text{red}} = \frac{1240\,\text{eV}\cdot\text{nm}}{${M.n(d.lamR, 'nm')}}` + TEXA`E_{\text{red}} = ${M.n(d.E1, 'eV')}` + TEX`E_{\text{red}} = (${M.n(d.E1)})(1.6\times10^{-19}\,\text{J/eV})` + TEXA`E_{\text{red}} = ${M.n(d.E1J, 'J')}` +
        '<p class="st">Second beam:</p>' + TEX`E_2 = \frac{1240\,\text{eV}\cdot\text{nm}}{${lam2}}` + TEXA`E_2 = ${M.n(d.E2, 'eV')}` + TEX`E_2 = (${M.n(d.E2)})(1.6\times10^{-19}\,\text{J/eV})` + TEXA`E_2 = ${M.n(d.E2J, 'J')}` +
        '<h4>2 · Photons per second</h4><p class="st">Power = energy per second = (number per second) × (energy of one photon).</p>' + TEX`N = \frac{P}{E}` + '<p class="st">Red beam:</p>' + TEX`N_{\text{red}} = \frac{${M.n(d.PW, 'W')}}{${M.n(d.E1J, 'J')}}` + TEXA`N_{\text{red}} = ${M.n(d.N1, 's⁻¹')}` +
        '<p class="st">Second beam:</p>' + TEX`N_2 = \frac{${M.n(d.PW, 'W')}}{${M.n(d.E2J, 'J')}}` + TEXA`N_2 = ${M.n(d.N2, 's⁻¹')}` +
        '<h4>3 · Compare</h4>' + TEX`\frac{N_2}{N_{\text{red}}} = \frac{E_{\text{red}}}{E_2} = \frac{${M.n(d.E1)}}{${M.n(d.E2)}}` + TEXA`\frac{N_2}{N_{\text{red}}} = ${M.n(1 / d.ratioN)}` +
        '<p class="st">' + (v.lam < 650 ? 'Each shorter-wavelength photon carries more energy, so the same power means <b>fewer photons per second</b>.' : v.lam > 650 ? 'Each longer-wavelength photon carries less energy, so the same power means <b>more photons per second</b>.' : 'Same wavelength, same photons, same everything.') + '</p>' +
        '<h4>4 · Which beam ejects electrons from ' + d.nm.toLowerCase() + '? (φ = ' + d.phi + ' eV)</h4><p class="st">One photon gives all its energy to one electron, so it needs E &gt; φ. Red: ' + fplain(d.E1) + ' eV ' + (d.yes1 ? '&gt;' : '&lt;') + ' ' + d.phi + ' eV → ' + (d.yes1 ? '<b>ejects electrons</b>' : '<b>no electrons</b>') + '. Second: ' + fplain(d.E2) + ' eV ' + (d.yes2 ? '&gt;' : '&lt;') + ' ' + d.phi + ' eV → ' + (d.yes2 ? '<b>ejects electrons</b>' : '<b>no electrons</b>') + '.</p>' +
        (d.yes2 ? TEX`K_{\text{max}} = E_2 - \phi = ${M.n(d.E2)} - ${M.n(d.phi)}` + TEXA`K_{\text{max}} = ${M.n(d.K2, 'eV')}` : '');
      return s + '<p class="note">' + (d.yes2 !== d.yes1 ? 'Equal power, but only one beam works: the metal cares about the energy of <b>each photon</b>, not the total power. Red has plenty of photons, but each one is too weak and photons do not team up. ' : '') + 'Brightness (power) at a fixed colour changes the <i>number</i> of photons, so the number of electrons — never the energy of one photon.</p>';
    }
    let s = '<h4>1 · Energy of one photon</h4>' + TEX`E = hf` + TEX`E = (4.14\times10^{-15}\,\text{eV}\cdot\text{s})(${M.iv('f')})` + TEXA`E = ${M.n(d.E, 'eV')}` + TEX`\lambda = ${M.n(d.lam, 'nm')}` +
      '<h4>2 · Compare with the work function</h4><p class="st">' + d.nm + ':</p>' + TEX`f_0 = \frac{\phi}{h}` + TEX`f_0 = \frac{${M.n(d.phi, 'eV')}}{4.14\times10^{-15}\,\text{eV}\cdot\text{s}}` + TEXA`f_0 = ${M.n(d.f0, 'Hz')}`;
    if (!d.yes) return s + '<div class="bad">hf < φ: no single photon has enough energy to free an electron. <b>No electrons, no matter how bright the light.</b> A wave model predicted that bright enough light should eventually work — it doesn’t.</div>';
    s += '<h4>3 · Fastest electrons</h4>' + TEX`K_{\text{max}} = hf - \phi` + TEX`K_{\text{max}} = ${M.n(d.E)} - ${M.n(d.phi)}` + TEXA`K_{\text{max}} = ${M.n(d.K, 'eV')}` + TEX`K_{\text{max}} = ${M.n(d.K * 1.6e-19, 'J')}` +
      '<h4>4 · Stopping voltage</h4><p class="st">To stop even the fastest electrons:</p>' + TEX`eV_s = K_{\text{max}}` + TEXA`V_s = ${M.n(d.K, 'V')}` +
      '<p class="st">Now the battery is ' + H.iv('V') + ' → current = ' + Math.round(d.I * 100) + '% of max' + (v.V <= -d.K ? ' (all stopped)' : '') + '.</p>';
    return s + '<p class="note">Brighter light = more photons → <b>more electrons</b> (more current), but each electron gets the same K<sub>max</sub>. Higher frequency → bigger K<sub>max</sub>. Graph K<sub>max</sub> vs f: slope = h, x-intercept = f₀, y-intercept = −φ. Uses: solar cells, light sensors on street lights, camera sensors.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'stream') return drawStream(v, d, t);
    panelTitle('PHOTOELECTRIC TUBE', 10, 18);
    ctx.fillStyle = 'rgba(200,220,240,0.35)'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(200, 130, 160, 80, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9aa7b8'; ctx.fillRect(70, 85, 14, 90); text(d.nm.toLowerCase(), 77, 190, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); ctx.fillStyle = '#555'; ctx.fillRect(320, 95, 8, 70);
    const col = d.lam >= 380 && d.lam <= 750 ? wlRGB(d.lam) : d.lam < 380 ? '#9b59d0' : '#8a1a1a'; ctx.globalAlpha = 0.15 + 0.5 * v.B / 100; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(150, 20); ctx.lineTo(200, 20); ctx.lineTo(84, 175); ctx.lineTo(84, 85); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    text(d.lam < 380 ? 'UV ' : d.lam > 750 ? 'IR ' : '', 205, 26, { font: '700 11px "Space Grotesk",sans-serif' }); text(fplain(d.lam) + ' nm', 205, 40, { font: '600 10px "IBM Plex Mono",monospace' });
    // electrons
    if (!A.e || A.reset) A.e = []; const rate = d.yes ? v.B / 100 * 30 : 0; A.acc = (A.acc || 0) + rate * dt; while (A.acc > 1){ A.acc--; A.e.push({ x: 86, y: 90 + Math.random() * 80, vx: 40 + 160 * Math.sqrt(Math.random()) * Math.sqrt(d.K / 3) , vy: (Math.random() - 0.5) * 20 }); }
    const acc = v.V * 40; A.e.forEach(e => { e.vx += acc * dt; e.x += e.vx * dt; e.y += e.vy * dt; }); A.e = A.e.filter(e => e.x > 84 && e.x < 320 && A.e.length < 200);
    ctx.fillStyle = '#1546d6'; A.e.forEach(e => { ctx.beginPath(); ctx.arc(e.x, e.y, 2.5, 0, 7); ctx.fill(); });
    // circuit
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(77, 175); ctx.lineTo(77, 280); ctx.lineTo(160, 280); ctx.moveTo(240, 280); ctx.lineTo(324, 280); ctx.lineTo(324, 165); ctx.stroke();
    ctx.beginPath(); ctx.arc(200, 280, 24, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); text('A', 200, 285, { align: 'center', font: '700 14px "Space Grotesk",sans-serif' }); ctx.beginPath(); ctx.moveTo(176, 280); ctx.lineTo(160, 280); ctx.moveTo(224, 280); ctx.lineTo(240, 280); ctx.stroke();
    text('I = ' + Math.round(d.I * 100) + '%', 200, 318, { align: 'center', font: '700 13px "Space Grotesk",sans-serif' }); text('V = ' + v.V.toFixed(2) + ' V', 340, 230, { font: '700 12px "IBM Plex Mono",monospace' }); text(v.V < 0 ? '(collector −: pushes back)' : '', 340, 246, { font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    panelTitle('K_max vs f (ALL METALS)', 395, 18);
    const gx = 410, gy = 150, gw = 175, gh = 115, X = f => gx + gw * (f - 0) / 15, Y = K => gy - gh * K / 5;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy + 20); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    Object.entries(METALS).forEach(([k, [n, p]]) => { const on = n === d.nm; ctx.strokeStyle = on ? '#1546d6' : '#ccc'; ctx.lineWidth = on ? 2.2 : 1.2; ctx.beginPath(); const f0 = p / HEV / 1e14; ctx.moveTo(X(f0), Y(0)); ctx.lineTo(X(15), Y(HEV * 15e14 - p)); ctx.stroke(); if (on){ ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(0), Y(-p) ); ctx.lineTo(X(f0), Y(0)); ctx.stroke(); ctx.setLineDash([]); } });
    if (d.yes){ ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(X(v.f), Y(d.K), 5, 0, 7); ctx.fill(); } else { ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(X(v.f), Y(0), 5, 0, 7); ctx.fill(); }
    text('f (×10¹⁴ Hz)', gx + gw, gy + 14, { align: 'right', font: '500 9px "IBM Plex Mono",monospace' }); text('slope = h', gx + 100, gy - 70, { font: '600 10px "IBM Plex Mono",monospace', col: '#1546d6' });
    panelTitle('CURRENT vs BATTERY VOLTAGE', 395, 200);
    const hx = 410, hy = 290, hw = 175, hh = 70, XV = V => hx + hw * (V + 4) / 7; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + hw, hy); ctx.moveTo(XV(0), hy); ctx.lineTo(XV(0), hy - hh - 6); ctx.stroke();
    ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 100; i++){ const V = -4 + 7 * i / 100, fr = !d.yes ? 0 : V >= 0 ? 1 : Math.max(0, 1 + V / d.K), y = hy - hh * fr * v.B / 100; i ? ctx.lineTo(XV(V), y) : ctx.moveTo(XV(V), y); } ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(XV(v.V), hy - hh * d.I, 4, 0, 7); ctx.fill(); text('−V_s', XV(-d.Vs), hy + 12, { align: 'center', font: '500 9px "IBM Plex Mono",monospace' });
  }
};

function drawStream(v, d, t){
  const F = '"Space Grotesk",sans-serif', Mo = '"IBM Plex Mono",monospace', beams = [[78, d.lamR, d.E1, d.yes1, 'RED BEAM'], [200, v.lam, d.E2, d.yes2, 'SECOND BEAM']], x0 = 24, xp = 330;
  panelTitle('SAME POWER, DIFFERENT PHOTONS', 10, 18);
  beams.forEach(([yc, lam, E, yes, nm], bi) => {
    const col = wlRGB(lam), rad = 2.2 * E;
    ctx.fillStyle = col; ctx.globalAlpha = 0.12; ctx.fillRect(x0, yc - 34, xp - x0, 68); ctx.globalAlpha = 1;
    text(nm + ' · ' + fplain(lam) + ' nm', x0 + 2, yc - 40, { font: '700 11px ' + Mo, col: '#4a4a4a' });
    const step = 52 * (E / d.E1); // spacing ~ 1/N ~ E: more energy each, so fewer photons
    const n = Math.ceil((xp - x0) / step) + 1, off = ((t * 70) % step);
    for (let i = 0; i < n; i++){ const x = x0 + i * step + off; if (x > xp - rad) continue; const y = yc + ((i * 7 + bi * 3) % 5 - 2) * 8;
      ctx.fillStyle = col; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#9aa7b8'; ctx.fillRect(xp, yc - 40, 14, 80); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(xp, yc - 40, 14, 80);
    text(d.nm.toLowerCase(), xp + 7, yc + 54, { align: 'center', font: '600 9px ' + Mo });
    if (yes){ ctx.fillStyle = '#1546d6'; for (let j = 0; j < 4; j++){ const ph = (t * 0.7 + j / 4) % 1; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(xp + 18 + ph * 34, yc - 24 + j * 16 + Math.sin(t * 6 + j) * 2, 2.5, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; text('e⁻ out', xp + 36, yc + 44, { align: 'center', font: '700 10px ' + F, col: '#1546d6' }); }
    else text('no e⁻', xp + 36, yc + 44, { align: 'center', font: '700 10px ' + F, col: '#c43a00' });
  });
  text('dot size = energy of one photon', 10, 318, { font: '600 11px ' + F, col: '#4a4a4a' });
  panelTitle('PER PHOTON AND PER SECOND', 395, 18);
  [['', 'red', 'second'], ['λ', fplain(d.lamR) + ' nm', fplain(v.lam) + ' nm'], ['E (eV)', fplain(d.E1), fplain(d.E2)], ['E (J)', fplain(d.E1J), fplain(d.E2J)], ['P', fplain(v.P) + ' mW', fplain(v.P) + ' mW'], ['N (per s)', fplain(d.N1), fplain(d.N2)]].forEach(([a, b, c], i) => {
    const y = 48 + i * 26, hd = i === 0, f = hd ? '700 11px ' + Mo : '700 11px ' + Mo; text(a, 400, y, { font: '600 12px ' + F, col: '#4a4a4a' }); text(b, 505, y, { align: 'right', font: f, col: hd ? '#c43a00' : '#111' }); text(c, 590, y, { align: 'right', font: f, col: hd ? '#1546d6' : '#111' }); });
  text('Ejects electrons from ' + d.nm.toLowerCase() + '?', 400, 224, { font: '600 11px ' + F, col: '#4a4a4a' });
  text('red: ' + (d.yes1 ? 'YES' : 'NO'), 400, 244, { font: '700 14px ' + F, col: d.yes1 ? '#1e7d45' : '#c43a00' }); text('second: ' + (d.yes2 ? 'YES' : 'NO'), 500, 244, { font: '700 14px ' + F, col: d.yes2 ? '#1e7d45' : '#c43a00' });
  text('φ = ' + d.phi + ' eV: need E > φ', 400, 268, { font: '500 10px ' + Mo, col: '#4a4a4a' });
}
