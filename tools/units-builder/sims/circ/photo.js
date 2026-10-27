// Photoelectric Effect (AP 15.5, IB E.2 HL): K_max = hf − φ, threshold frequency, stopping potential, why brightness changes the current but not the electron energy, and the K_max vs f graph (slope h, intercept −φ).
const METALS = { cs: ['Cesium', 2.1], na: ['Sodium', 2.28], zn: ['Zinc', 4.3], cu: ['Copper', 4.7] }, HEV = 4.14e-15; // h in eV·s
function wlRGB(l){ let r = 0, g = 0, b = 0; if (l < 440){ r = (440 - l) / 60; b = 1; } else if (l < 490){ g = (l - 440) / 50; b = 1; } else if (l < 510){ g = 1; b = (510 - l) / 20; } else if (l < 580){ r = (l - 510) / 70; g = 1; } else if (l < 645){ r = 1; g = (645 - l) / 65; } else r = 1;
  return 'rgb(' + [r, g, b].map(c => Math.round(255 * Math.max(0, Math.min(1, c)))).join(',') + ')'; }
const SIM = {
  title: 'Photoelectric Effect',
  hint: 'K_max = hf − φ',
  opts: [{ id: 'm', label: 'Metal', choices: [['na', 'Sodium'], ['cs', 'Cesium'], ['zn', 'Zinc'], ['cu', 'Copper']] }],
  ivs(){ return [
    { id: 'f', sym: 'f', symText: 'f', label: 'Light frequency (×10¹⁴ Hz)', unit: '×10¹⁴ Hz', min: 3, max: 15, step: 0.05, val: 7.5, graph: true, show: x => x.toFixed(2) + '×10¹⁴ Hz' },
    { id: 'B', sym: 'N', symText: 'N', label: 'Brightness (photons per second, %)', unit: '%', min: 0, max: 100, step: 1, val: 60 },
    { id: 'V', sym: 'V', symText: 'V', label: 'Battery voltage (− = stopping)', unit: 'V', min: -4, max: 3, step: 0.02, val: 0 }]; },
  presets: [{ label: 'Red light (any brightness)', v: { f: 4.5, B: 100 } }, { label: 'Dim UV', v: { f: 12, B: 10 } }, { label: 'Find the stopping voltage', v: { f: 9, V: -1.45 } }],
  calc(v, mode, opt){
    const [nm, phi] = METALS[opt.m || 'na'], f = v.f * 1e14, E = HEV * f, K = E - phi, lam = 3e8 / f * 1e9, f0 = phi / HEV, yes = K > 0;
    const frac = !yes ? 0 : v.V >= 0 ? 1 : Math.max(0, 1 + v.V / K), I = v.B / 100 * frac;
    return { nm, phi, E, K, Kmax: yes ? K : 0, lam, f0, yes, I, Vs: yes ? K : 0 };
  },
  dvs(){ return [{ id: 'K', name: 'Maximum kinetic energy of the electrons', short: 'K_max', sym: 'K<sub>max</sub>', unit: 'eV', f: d => d.Kmax }, { id: 'I', name: 'Current (fraction of maximum)', short: 'I', sym: 'I', unit: '', f: d => d.I }, { id: 'Vs', name: 'Stopping voltage', short: 'V_s', sym: 'V<sub>s</sub>', unit: 'V', f: d => d.Vs }]; },
  work(v, d){
    let s = '<h4>1 · Energy of one photon</h4><div class="eq">E = hf = (4.14×10⁻¹⁵ eV·s)(' + H.iv('f') + ') = <b>' + H.n(d.E, 'eV') + '</b> (λ = ' + fnum(d.lam) + ' nm)</div>' +
      '<h4>2 · Compare with the work function</h4><div class="eq">' + d.nm + ': φ = ' + fnum(d.phi) + ' eV → threshold f₀ = φ/h = ' + H.n(d.f0, 'Hz') + '</div>';
    if (!d.yes) return s + '<div class="bad">hf < φ: no single photon has enough energy to free an electron. <b>No electrons, no matter how bright the light.</b> A wave model predicted that bright enough light should eventually work — it doesn’t.</div>';
    s += '<h4>3 · Fastest electrons</h4><div class="eq">K<sub>max</sub> = hf − φ = ' + fnum(d.E) + ' − ' + fnum(d.phi) + ' = <b>' + H.n(d.K, 'eV') + '</b> = ' + H.n(d.K * 1.6e-19, 'J') + '</div>' +
      '<h4>4 · Stopping voltage</h4><div class="eq">To stop even the fastest electrons: eV<sub>s</sub> = K<sub>max</sub> → V<sub>s</sub> = <b>' + H.n(d.K, 'V') + '</b>. Now the battery is ' + H.iv('V') + ' → current = ' + Math.round(d.I * 100) + '% of max' + (v.V <= -d.K ? ' (all stopped)' : '') + '.</div>';
    return s + '<p class="note">Brighter light = more photons → <b>more electrons</b> (more current), but each electron gets the same K<sub>max</sub>. Higher frequency → bigger K<sub>max</sub>. Graph K<sub>max</sub> vs f: slope = h, x-intercept = f₀, y-intercept = −φ. Uses: solar cells, light sensors on street lights, camera sensors.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
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
