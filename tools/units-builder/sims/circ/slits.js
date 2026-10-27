// Interference & Diffraction (AP 14.6–14.8; IB C.3 SL double slit, HL single slit and gratings): two speakers and path difference, Young's double slit, single-slit diffraction (and how it modulates a double-slit pattern), and diffraction gratings with white light.
function wlRGB(l){ let r = 0, g = 0, b = 0; if (l < 440){ r = (440 - l) / 60; b = 1; } else if (l < 490){ g = (l - 440) / 50; b = 1; } else if (l < 510){ g = 1; b = (510 - l) / 20; } else if (l < 580){ r = (l - 510) / 70; g = 1; } else if (l < 645){ r = 1; g = (645 - l) / 65; } else r = 1;
  const a = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 700 ? 0.3 + 0.7 * (780 - l) / 80 : 1; return [r, g, b].map(c => Math.round(255 * Math.max(0, Math.min(1, c * a)))); }
const sinc2 = x => Math.abs(x) < 1e-9 ? 1 : Math.pow(Math.sin(x) / x, 2);
const SIM = {
  title: 'Interference & Diffraction',
  hint: 'path difference: nλ bright · (n + ½)λ dark',
  modes: [{ id: 'two', label: 'Two speakers' }, { id: 'double', label: 'Double slit' }, { id: 'single', label: 'Single slit' }, { id: 'grating', label: 'Grating' }],
  opts: [{ id: 'pat', label: 'Slits', modes: ['single'], choices: [['one', 'One slit'], ['two', 'Two slits of this width']] },
    { id: 'src', label: 'Light', modes: ['grating'], choices: [['mono', 'One wavelength'], ['white', 'White light']] }],
  ivs(mode, opt){
    if (mode === 'two') return [
      { id: 'f', sym: 'f', symText: 'f', label: 'Frequency of both speakers (in phase)', unit: 'Hz', min: 100, max: 800, step: 5, val: 340 },
      { id: 'd', sym: 'd', symText: 'd', label: 'Speaker separation', unit: 'm', min: 0.5, max: 3, step: 0.05, val: 2 },
      { id: 'y', sym: 'y', symText: 'y', label: 'Your position along the far wall', unit: 'm', min: -3.5, max: 3.5, step: 0.02, val: 0, graph: true }];
    if (mode === 'grating') return [
      { id: 'N', sym: 'N', symText: 'N', label: 'Lines per millimetre', unit: '/mm', min: 100, max: 1500, step: 10, val: 600, graph: true },
      { id: 'lam', sym: 'λ', symText: 'λ', label: (opt && opt.src) === 'white' ? '(white light: 400–700 nm)' : 'Wavelength', unit: 'nm', min: 400, max: 700, step: 5, val: 633 }];
    const a = [
      { id: 'lam', sym: 'λ', symText: 'λ', label: 'Wavelength of the laser', unit: 'nm', min: 400, max: 700, step: 5, val: 633 },
      mode === 'double' ? { id: 'dd', sym: 'd', symText: 'd', label: 'Slit separation', unit: 'mm', min: 0.05, max: 0.5, step: 0.005, val: 0.25, graph: true }
        : { id: 'b', sym: 'b', symText: 'b', label: 'Slit width (AP: a, IB: b)', unit: 'μm', min: 20, max: 200, step: 1, val: 60, graph: true },
      { id: 'D', sym: 'D', symText: 'D', label: 'Slits to screen (AP: L, IB: D)', unit: 'm', min: 0.5, max: 3, step: 0.05, val: 2 }];
    if (mode === 'single' && (opt && opt.pat) === 'two') a.push({ id: 'ds', sym: 'd', symText: 'd', label: 'Slit separation', unit: 'μm', min: 100, max: 800, step: 5, val: 300 });
    return a;
  },
  presets: [{ label: 'Quiet spot', mode: 'two', v: { f: 340, d: 2, y: 1.55 } }, { label: 'Red vs blue laser', mode: 'double', v: { lam: 450 } }, { label: 'Narrower slit', mode: 'single', v: { b: 30 } }, { label: 'CD tracks (625/mm)', mode: 'grating', v: { N: 625 } }],
  calc(v, mode, opt){
    if (mode === 'two'){ const lam = 340 / v.f, D = 6, r1 = Math.hypot(D, v.y - v.d / 2), r2 = Math.hypot(D, v.y + v.d / 2), pd = Math.abs(r1 - r2), n = pd / lam, I = Math.pow(Math.cos(PI * n), 2);
      return { lam, D, r1, r2, pd, n, I }; }
    if (mode === 'grating'){ const dg = 1e-3 / v.N, white = (opt.src || 'mono') === 'white', lam = v.lam * 1e-9, nmax = Math.floor(dg / lam), ords = [];
      for (let n = 1; n <= Math.min(nmax, 6); n++) ords.push([n, Math.asin(n * lam / dg) / DEG]); return { dg, white, nmax, ords, th1: nmax >= 1 ? ords[0][1] : NaN, nmaxW: Math.floor(dg / 700e-9) }; }
    const lam = v.lam * 1e-9;
    if (mode === 'double'){ const d = v.dd * 1e-3, s = lam * v.D / d; return { d, s, I: y => Math.pow(Math.cos(PI * d * y / (lam * v.D)), 2), W: 0.025 }; }
    const b = v.b * 1e-6, two = (opt.pat || 'one') === 'two', ds = two ? v.ds * 1e-6 : 0, y1 = lam * v.D / b, th1 = Math.asin(Math.min(1, lam / b)) / DEG;
    return { b, two, ds, y1, th1, wC: 2 * y1, sF: two ? lam * v.D / ds : NaN, I: y => { const th = Math.atan(y / v.D); return sinc2(PI * b * Math.sin(th) / lam) * (two ? Math.pow(Math.cos(PI * ds * Math.sin(th) / lam), 2) : 1); }, W: 0.08 };
  },
  dvs(mode){
    if (mode === 'two') return [{ id: 'n', name: 'Path difference in wavelengths', short: 'Δ/λ', sym: 'Δ/λ', unit: '', f: d => d.n }, { id: 'I', name: 'Loudness (fraction of max)', short: 'I', sym: 'I', unit: '', f: d => d.I }];
    if (mode === 'grating') return [{ id: 'th1', name: 'Angle of the 1st-order maximum', short: 'θ₁', sym: 'θ<sub>1</sub>', unit: '°', f: d => d.th1 }, { id: 'nm', name: 'Highest order you can see', short: 'n_max', sym: 'n<sub>max</sub>', unit: '', f: d => d.nmax }];
    if (mode === 'double') return [{ id: 's', name: 'Fringe spacing', short: 's', sym: 's', unit: 'mm', f: d => d.s * 1e3 }];
    return [{ id: 'y1', name: 'Distance to the first dark fringe', short: 'y₁', sym: 'y<sub>1</sub>', unit: 'mm', f: d => d.y1 * 1e3 }, { id: 'th', name: 'Angle to the first minimum', short: 'θ', sym: 'θ', unit: '°', f: d => d.th1 }];
  },
  work(v, d, mode){
    if (mode === 'two'){ const nr = Math.round(d.n * 2) / 2, kind = Math.abs(d.n - Math.round(d.n)) < 0.05 ? 'constructive: <b>loud</b>' : Math.abs(d.n - Math.round(d.n)) > 0.45 ? 'destructive: <b>quiet</b>' : 'in between';
      return '<h4>1 · Wavelength</h4><div class="eq">λ = v/f = (340 m/s)/' + H.iv('f') + ' = <b>' + H.n(d.lam, 'm') + '</b></div>' +
        '<h4>2 · Distance from each speaker</h4><div class="eq">r₁ = √(6² + (y − d/2)²) = ' + H.n(d.r1, 'm') + '; r₂ = ' + H.n(d.r2, 'm') + '</div>' +
        '<h4>3 · Path difference</h4><div class="eq">Δ = |r₁ − r₂| = ' + H.n(d.pd, 'm') + ' = <b>' + fnum(d.n) + ' λ</b> → ' + kind + '</div>' +
        '<p class="note">Bright/loud when Δ = nλ; dark/quiet when Δ = (n + ½)λ. Walking along the wall you hear loud–quiet–loud. ' + (Math.abs(nr - Math.round(nr)) > 0.1 ? 'Here Δ ≈ ' + nr + 'λ.' : '') + ' Noise-cancelling headphones use the same idea with a wave half a cycle out of phase.</p>'; }
    if (mode === 'grating'){ if (d.white) return '<h4>1 · Line spacing</h4><div class="eq">d = 1/N = 1/(' + H.iv('N') + ') = <b>' + H.n(d.dg * 1e6, 'μm') + '</b></div>' +
        '<h4>2 · Each colour at its own angle: d sin θ = nλ</h4><div class="eq">1st order: violet (400 nm) at ' + fnum(Math.asin(400e-9 / d.dg) / DEG) + '°, red (700 nm) at ' + (700e-9 < d.dg ? fnum(Math.asin(700e-9 / d.dg) / DEG) + '°' : 'none') + '</div>' +
        '<p class="note">The central maximum (n = 0) is white: every colour has zero path difference there. In each order red is farthest out (longest λ). Higher orders can overlap — check whether 2nd-order red passes 3rd-order violet. Full spectra visible up to order ' + d.nmaxW + '.</p>';
      return '<h4>1 · Line spacing</h4><div class="eq">d = 1/N = 1/(' + H.iv('N') + ') = <b>' + H.n(d.dg * 1e6, 'μm') + '</b></div>' +
        '<h4>2 · Maxima: d sin θ = nλ</h4><div class="eq">' + (d.ords.length ? d.ords.map(([n, th]) => 'n = ' + n + ': θ = <b>' + fnum(th) + '°</b>').join('<br>') : 'nλ > d even for n = 1: no maxima except the centre.') + '</div>' +
        '<h4>3 · Highest order</h4><div class="eq">sin θ ≤ 1 → n ≤ d/λ = ' + fnum(d.dg / (v.lam * 1e-9)) + ' → n<sub>max</sub> = <b>' + d.nmax + '</b></div>' +
        '<p class="note">Many slits make the maxima very sharp and bright, so gratings are used to measure wavelengths (spectroscopes). Use sin θ, not the small-angle approximation — the angles are big.</p>'; }
    if (mode === 'double') return '<h4>1 · Fringe spacing (Young)</h4><div class="eq">s = λD/d = (' + H.iv('lam') + ')(' + H.iv('D') + ')/(' + H.iv('dd') + ') = <b>' + H.n(d.s * 1e3, 'mm') + '</b></div>' +
      '<h4>2 · Why bright and dark?</h4><div class="eq">Bright where the path difference from the two slits is nλ (d sin θ = nλ); dark where it is (n + ½)λ.</div>' +
      '<p class="note">Lab: measure across 10 fringes and divide by 10 — less percentage uncertainty. Bigger λ or D → wider fringes; bigger d → narrower. The pattern is evidence that light is a wave (it needs coherent, monochromatic light — a laser).</p>';
    return '<h4>1 · First minimum</h4><div class="eq">b sin θ = λ (AP: a sin θ = mλ) → θ = <b>' + H.n(d.th1, '°') + '</b></div>' +
      '<h4>2 · On the screen</h4><div class="eq">y₁ = λD/b = (' + H.iv('lam') + ')(' + H.iv('D') + ')/(' + H.iv('b') + ') = <b>' + H.n(d.y1 * 1e3, 'mm') + '</b>; central maximum is <b>' + H.n(d.wC * 1e3, 'mm') + '</b> wide (twice the others).</div>' +
      (d.two ? '<h4>3 · Two slits of this width (IB HL)</h4><div class="eq">Double-slit fringes s = λD/d = ' + H.n(d.sF * 1e3, 'mm') + ' sit inside the single-slit envelope. Where a single-slit minimum lands on a bright fringe, that fringe is missing.</div>' : '') +
      '<p class="note">Narrower slit → <b>more</b> spreading (wider pattern) but dimmer. Diffraction is biggest when the opening is about the size of the wavelength — that’s why you can hear around a corner but not see around it.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'two'){
      panelTitle('TWO SPEAKERS IN A GYM (TOP VIEW)', 10, 18);
      const PX = 40, x0 = 40, yc = 165, key = v.f + ',' + v.d;
      if (A.key !== key){ const W = 345, Hh = 280, img = ctx.createImageData(W, Hh); for (let j = 0; j < Hh; j++) for (let i = 0; i < W; i++){ const xm = (i) / PX, ym = (j - Hh / 2) / PX, r1 = Math.hypot(xm, ym - v.d / 2), r2 = Math.hypot(xm, ym + v.d / 2), I = Math.pow(Math.cos(PI * (r1 - r2) / d.lam), 2), k = 4 * (j * W + i);
          img.data[k] = 255 - 60 * I; img.data[k + 1] = 255 - 140 * I; img.data[k + 2] = 255 - 200 * I; img.data[k + 3] = 255; }
        const oc = document.createElement('canvas'); oc.width = W; oc.height = Hh; oc.getContext('2d').putImageData(img, 0, 0); A.img = oc; A.key = key; }
      ctx.drawImage(A.img, x0, yc - 140, 345, 280);
      const xw = x0 + d.D * PX; ctx.fillStyle = '#555'; ctx.fillRect(xw, 25, 5, 280);
      [[v.d / 2], [-v.d / 2]].forEach(([s]) => { ctx.fillStyle = '#111'; ctx.fillRect(x0 - 14, yc - s * PX - 9, 14, 18); });
      const yp = yc - v.y * PX; ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, yc - v.d / 2 * PX); ctx.lineTo(xw, yp); ctx.moveTo(x0, yc + v.d / 2 * PX); ctx.lineTo(xw, yp); ctx.stroke();
      ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(xw - 2, yp, 7, 0, 7); ctx.fill(); text('you', xw - 12, yp - 10, { align: 'right', font: '700 11px "Space Grotesk",sans-serif', col: '#ff6a2b' });
      text('dark bands = loud (constructive)', 12, 318, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('LOUDNESS ALONG THE WALL', 395, 18);
      const gx = 400, gw = 185; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, 40); ctx.lineTo(gx, 290); ctx.stroke();
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 200; i++){ const y = 3.5 - 7 * i / 200, dd = SIM.calc(Object.assign({}, v, { y }), 'two', opt), py = yc - y * PX; i ? ctx.lineTo(gx + gw * dd.I, py) : ctx.moveTo(gx + gw * dd.I, py); } ctx.stroke();
      ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(gx + gw * d.I, yp, 5, 0, 7); ctx.fill();
      text('Δ = ' + fplain(d.n) + ' λ', 590, 300, { align: 'right', font: '700 13px "Space Grotesk",sans-serif' });
      return;
    }
    if (mode === 'grating'){
      panelTitle('DIFFRACTION GRATING (SCREEN 1 m AWAY)', 10, 18);
      const gx = 40, gy = 165, R = 320; ctx.fillStyle = '#111'; ctx.fillRect(gx - 3, gy - 60, 6, 120); ctx.fillStyle = '#c43a00'; ctx.fillRect(10, gy - 2, gx - 12, 4);
      ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(gx, gy, R, -PI / 2, PI / 2); ctx.stroke();
      const beam = (th, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + R * Math.cos(th * DEG), gy - R * Math.sin(th * DEG)); ctx.stroke(); };
      const dot = (th, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(gx + R * Math.cos(th * DEG), gy - R * Math.sin(th * DEG), 5, 0, 7); ctx.fill(); };
      if (d.white){ beam(0, '#bbb', 3); dot(0, '#eee'); for (let n = 1; n <= 4; n++) for (let l = 400; l <= 700; l += 6){ const s = n * l * 1e-9 / d.dg; if (s >= 1) continue; const th = Math.asin(s) / DEG, [r, g, b] = wlRGB(l), c = 'rgb(' + r + ',' + g + ',' + b + ')'; [1, -1].forEach(sg => { ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.beginPath(); const a = sg * th * DEG; ctx.arc(gx, gy, R, -a - 0.006, -a + 0.006); ctx.stroke(); }); } }
      else { const [r, g, b] = wlRGB(v.lam), c = 'rgb(' + r + ',' + g + ',' + b + ')'; beam(0, c, 2); dot(0, c); d.ords.forEach(([n, th]) => { [1, -1].forEach(sg => { beam(sg * th, c, 1.5); dot(sg * th, c); }); text('n=' + n, gx + (R + 0) * Math.cos(th * DEG) - 26, gy - R * Math.sin(th * DEG) - 8, { font: '700 11px "Space Grotesk",sans-serif' }); }); }
      text('n = 0', gx + R - 40, gy - 8, { font: '700 11px "Space Grotesk",sans-serif' });
      text('d = ' + fplain(d.dg * 1e6) + ' μm', 12, 312, { font: '700 13px "Space Grotesk",sans-serif' });
      panelTitle('ORDERS', 395, 18);
      if (d.white){ [1, 2, 3].forEach((n, i) => { const a = n * 400e-9 / d.dg, b = n * 700e-9 / d.dg; text('n = ' + n + ': ' + (a < 1 ? fplain(Math.asin(a) / DEG) + '°' : '—') + ' to ' + (b < 1 ? fplain(Math.asin(b) / DEG) + '°' : 'off'), 400, 50 + i * 26, { font: '600 12px "IBM Plex Mono",monospace' }); }); text('violet → red, red farthest', 400, 140, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
      else { d.ords.forEach(([n, th], i) => text('n = ' + n + ': θ = ' + fplain(th) + '°', 400, 50 + i * 26, { font: '600 12px "IBM Plex Mono",monospace' })); text('n max = ' + d.nmax, 400, 60 + d.ords.length * 26, { font: '700 13px "Space Grotesk",sans-serif' }); }
      return;
    }
    const isD = mode === 'double', [r, g, b] = wlRGB(v.lam), W = d.W, sy = 120 / W, yc = 165;
    panelTitle(isD ? 'YOUNG’S DOUBLE SLIT (NOT TO SCALE)' : (d.two ? 'TWO WIDE SLITS (NOT TO SCALE)' : 'SINGLE SLIT (NOT TO SCALE)'), 10, 18);
    ctx.fillStyle = '#555'; ctx.fillRect(14, yc - 10, 30, 20); ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'; ctx.fillRect(44, yc - 2, 76, 4);
    ctx.fillStyle = '#111'; if (isD){ ctx.fillRect(120, 40, 5, yc - 48); ctx.fillRect(120, yc - 4, 5, 8); ctx.fillRect(120, yc + 8, 5, 290 - yc - 8); } else { const gap = Math.max(4, v.b / 10); ctx.fillRect(120, 40, 5, yc - gap - 40); ctx.fillRect(120, yc + gap, 5, 290 - yc - gap); }
    // screen with pattern
    const xs = 340; ctx.fillStyle = '#111'; ctx.fillRect(xs, 40, 6, 250);
    for (let py = 45; py <= 285; py++){ const y = (yc - py) / sy, I = d.I(y); ctx.fillStyle = 'rgb(' + Math.round(r * I) + ',' + Math.round(g * I) + ',' + Math.round(b * I) + ')'; ctx.fillRect(xs + 8, py, 26, 1); }
    // rays to first bright/dark and path difference
    const ym = isD ? d.s : d.y1, pym = yc - ym * sy; if (pym > 45){ ctx.strokeStyle = 'rgba(17,17,17,0.5)'; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(125, yc - 6); ctx.lineTo(xs, pym); ctx.moveTo(125, yc + 6); ctx.lineTo(xs, pym); ctx.moveTo(125, yc); ctx.lineTo(xs, yc); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xs - 12, yc); ctx.lineTo(xs - 12, pym); ctx.stroke(); text(isD ? 's' : 'y₁', xs - 16, (yc + pym) / 2 + 4, { align: 'right', font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' }); }
    text(isD ? 'bright: path difference nλ' : '1st dark: b sin θ = λ', 150, 300, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('D = ' + v.D + ' m', 230, yc + 14, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    panelTitle('INTENSITY ON THE SCREEN', 395, 18);
    const gx = 400, gw = 185; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, 45); ctx.lineTo(gx, 285); ctx.stroke();
    ctx.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')'; ctx.lineWidth = 2; ctx.beginPath(); for (let py = 45; py <= 285; py++){ const I = d.I((yc - py) / sy); py === 45 ? ctx.moveTo(gx + gw * I, py) : ctx.lineTo(gx + gw * I, py); } ctx.stroke();
    if (!isD && !d.two){ ctx.strokeStyle = '#8a8a8a'; ctx.setLineDash([3, 3]); [1, -1].forEach(s => { const p = yc - s * d.y1 * sy; if (p > 45 && p < 285){ ctx.beginPath(); ctx.moveTo(gx, p); ctx.lineTo(gx + gw, p); ctx.stroke(); } }); ctx.setLineDash([]); }
    text('±' + (W * 1e3) + ' mm', 590, 300, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text(isD ? 's = ' + fplain(d.s * 1e3) + ' mm' : 'y₁ = ' + fplain(d.y1 * 1e3) + ' mm', 400, 300, { font: '700 13px "Space Grotesk",sans-serif' });
  }
};
