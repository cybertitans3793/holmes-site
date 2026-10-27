// Thin-Film Interference (AP 14.9): phase changes on reflection, the 2nt path difference, colours of soap bubbles and oil slicks, and anti-reflection coatings.
function wlRGB(l){ let r = 0, g = 0, b = 0; if (l < 440){ r = (440 - l) / 60; b = 1; } else if (l < 490){ g = (l - 440) / 50; b = 1; } else if (l < 510){ g = 1; b = (510 - l) / 20; } else if (l < 580){ r = (l - 510) / 70; g = 1; } else if (l < 645){ r = 1; g = (645 - l) / 65; } else r = 1;
  const a = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 700 ? 0.3 + 0.7 * (780 - l) / 80 : 1; return [r, g, b].map(c => Math.max(0, Math.min(1, c * a))); }
function filmI(l, nf, ns, t){ const sh1 = nf > 1 ? 0.5 : 0, sh2 = ns > nf ? 0.5 : 0, cyc = 2 * nf * t / l + sh2 - sh1; return { I: Math.pow(Math.cos(PI * cyc), 2), cyc, sh1, sh2 }; }
function filmColor(nf, ns, t){ let R = 0, G = 0, B = 0, n = 0; for (let l = 400; l <= 700; l += 5){ const I = filmI(l, nf, ns, t).I, [r, g, b] = wlRGB(l); R += r * I; G += g * I; B += b * I; n++; } const k = 2.6 / n; return [R * k, G * k, B * k].map(c => Math.round(255 * Math.min(1, c))); }
const SIM = {
  title: 'Thin Films',
  hint: 'reflection off higher n → ½λ shift',
  ivs(){ return [
    { id: 't', sym: 't', symText: 't', label: 'Film thickness', unit: 'nm', min: 0, max: 800, step: 1, val: 250, graph: true },
    { id: 'nf', sym: 'n<sub>film</sub>', symText: 'nfilm', label: 'Index of the film', unit: '', min: 1.1, max: 2.2, step: 0.01, val: 1.33, show: x => x.toFixed(2) },
    { id: 'ns', sym: 'n<sub>below</sub>', symText: 'nbelow', label: 'Index of what’s below the film (1.00 = air)', unit: '', min: 1, max: 2.2, step: 0.01, val: 1, show: x => x.toFixed(2) },
    { id: 'lam', sym: 'λ', symText: 'λ', label: 'Wavelength (in air) to check', unit: 'nm', min: 400, max: 700, step: 5, val: 550 }]; },
  presets: [{ label: 'Soap bubble', v: { nf: 1.33, ns: 1, t: 250 } }, { label: 'Oil on water', v: { nf: 1.45, ns: 1.33, t: 300 } }, { label: 'Anti-reflection coating', v: { nf: 1.38, ns: 1.52, t: 100, lam: 550 } }, { label: 'Very thin (black film)', v: { nf: 1.33, ns: 1, t: 5 } }],
  calc(v){ const r = filmI(v.lam, v.nf, v.ns, v.t), lf = v.lam / v.nf, one = r.sh1 !== r.sh2;
    // minimum thicknesses
    const tCon = one ? lf / 4 : lf / 2, tDes = one ? lf / 2 : lf / 4;
    return Object.assign(r, { lf, one, tCon, tDes, col: filmColor(v.nf, v.ns, v.t) }); },
  dvs(){ return [{ id: 'I', name: 'Reflected brightness at this λ', short: 'I', sym: 'I', unit: '', f: d => d.I }]; },
  work(v, d){
    const sh = (s, a, b) => s ? 'n goes up (' + a + ' → ' + b + '): <b>½λ shift</b>' : 'n goes down (' + a + ' → ' + b + '): no shift';
    return '<h4>1 · Phase change at each reflection</h4><div class="eq">Top surface (air → film): ' + sh(d.sh1, '1.00', fnum(v.nf)) + '<br>Bottom surface (film → below): ' + sh(d.sh2, fnum(v.nf), fnum(v.ns)) + '</div>' +
      '<h4>2 · Extra path inside the film</h4><div class="eq">The second ray goes down and back: 2t = ' + H.n(2 * v.t, 'nm') + '. Inside the film λ<sub>film</sub> = λ/n = ' + H.iv('lam') + '/' + fnum(v.nf) + ' = ' + H.n(d.lf, 'nm') + '.</div>' +
      '<h4>3 · Add it up (in wavelengths)</h4><div class="eq">2t/λ<sub>film</sub> ' + (d.one ? '+ ½ (one shift)' : (d.sh1 ? '(both shifted: they cancel)' : '(no shifts)')) + ' = <b>' + fnum(d.cyc) + '</b> → ' + (Math.abs(d.cyc - Math.round(d.cyc)) < 0.08 ? '<b>constructive</b>: strong reflection' : Math.abs(d.cyc - Math.round(d.cyc)) > 0.42 ? '<b>destructive</b>: no reflection' : 'partly bright') + '</div>' +
      '<h4>4 · Thinnest film that works</h4><div class="eq">' + (d.one ? 'One shift: constructive at 2t = ½λ<sub>film</sub> → t = λ/(4n) = <b>' + H.n(d.tCon, 'nm') + '</b>; destructive at t = λ/(2n) = ' + H.n(d.tDes, 'nm') : 'Zero or two shifts: destructive at t = λ/(4n) = <b>' + H.n(d.tDes, 'nm') + '</b>; constructive at t = λ/(2n) = ' + H.n(d.tCon, 'nm')) + '</div>' +
      '<p class="note">' + (v.ns > v.nf ? 'Coating on glass: both reflections shift, so a quarter-wave layer cancels the reflection — that’s an anti-reflection coating on glasses and camera lenses.' : 'Soap bubble / film in air: only the top reflection shifts. A film much thinner than λ reflects nothing (looks black) just before it pops.') + ' Different thicknesses favour different colours, so you see bands.</p>';
  },
  draw(v, d, mode, opt, t){
    panelTitle('LIGHT REFLECTING FROM A THIN FILM', 10, 18);
    const top = 120, th = 30 + v.t * 0.12, bot = top + th;
    ctx.fillStyle = 'rgba(21,120,214,' + Math.min(0.45, (v.nf - 1) * 0.35) + ')'; ctx.fillRect(20, top, 360, th); ctx.fillStyle = v.ns > 1.001 ? 'rgba(80,80,110,' + Math.min(0.5, (v.ns - 1) * 0.4) + ')' : 'rgba(255,255,255,0)'; ctx.fillRect(20, bot, 360, 300 - bot);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(20, top); ctx.lineTo(380, top); ctx.moveTo(20, bot); ctx.lineTo(380, bot); ctx.stroke();
    text('air  n = 1.00', 26, 44, { font: '600 11px "IBM Plex Mono",monospace' }); text('film  n = ' + v.nf.toFixed(2), 26, top + 16, { font: '600 11px "IBM Plex Mono",monospace' }); text('t = ' + v.t + ' nm', 376, top + 16, { align: 'right', font: '600 11px "IBM Plex Mono",monospace' }); text((v.ns > 1.001 ? 'below  n = ' : 'air  n = ') + v.ns.toFixed(2), 26, bot + 20, { font: '600 11px "IBM Plex Mono",monospace' });
    const [r, g, b] = wlRGB(v.lam).map(c => Math.round(255 * c)), col = 'rgb(' + r + ',' + g + ',' + b + ')';
    const xa = 150, sl = 0.35; arrow(xa - (top - 40) * sl, 40, xa, top, col, null, { w: 3 }); arrow(xa, top, xa + (top - 40) * sl, 40, col, '1', { w: 3, ly: -6 });
    const xb = xa + th * sl; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xa, top); ctx.lineTo(xb, bot); ctx.lineTo(xb + th * sl, top); ctx.stroke(); arrow(xb + th * sl, top, xb + th * sl + (top - 40) * sl, 40, col, '2', { w: 3, ly: -6 });
    text(d.sh1 ? '½λ shift' : 'no shift', xa - 8, top - 8, { align: 'right', font: '700 11px "Space Grotesk",sans-serif', col: '#c43a00' }); text(d.sh2 ? '½λ shift' : 'no shift', xb + 8, bot + 14, { font: '700 11px "Space Grotesk",sans-serif', col: '#c43a00' });
    text('rays drawn at an angle so you can see them; assume near-normal light', 12, 312, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    panelTitle('WHAT YOU SEE', 395, 18);
    ctx.fillStyle = 'rgb(' + d.col.join(',') + ')'; ctx.fillRect(400, 30, 80, 60); ctx.strokeStyle = '#111'; ctx.strokeRect(400, 30, 80, 60); text('white light', 488, 50, { font: '600 10px "IBM Plex Mono",monospace' }); text('reflected', 488, 64, { font: '600 10px "IBM Plex Mono",monospace' });
    ctx.fillStyle = 'rgb(' + Math.round(r * d.I) + ',' + Math.round(g * d.I) + ',' + Math.round(b * d.I) + ')'; ctx.fillRect(400, 98, 80, 26); ctx.strokeRect(400, 98, 80, 26); text(v.lam + ' nm only', 488, 115, { font: '600 10px "IBM Plex Mono",monospace' });
    panelTitle('COLOUR vs THICKNESS (0–800 nm)', 395, 150);
    for (let i = 0; i < 185; i++){ const tt = 800 * i / 185, c = filmColor(v.nf, v.ns, tt); ctx.fillStyle = 'rgb(' + c.join(',') + ')'; ctx.fillRect(400 + i, 160, 1.2, 40); }
    ctx.strokeStyle = '#111'; ctx.strokeRect(400, 160, 185, 40); const mx = 400 + 185 * v.t / 800; ctx.fillStyle = '#111'; ctx.beginPath(); ctx.moveTo(mx, 204); ctx.lineTo(mx - 5, 214); ctx.lineTo(mx + 5, 214); ctx.fill();
    text('soap film drains: thin at the top', 400, 232, { font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('2t/λ_film ' + (d.one ? '+ ½' : '') + ' = ' + fplain(d.cyc), 400, 270, { font: '700 12px "Space Grotesk",sans-serif' });
  }
};
