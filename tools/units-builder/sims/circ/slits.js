// Interference & Diffraction (AP 14.6–14.8; IB C.3 SL double slit, HL single slit and gratings): two speakers and path difference, Young's double slit, single-slit diffraction (and how it modulates a double-slit pattern), and diffraction gratings with white light.
function wlRGB(l){ let r = 0, g = 0, b = 0; if (l < 440){ r = (440 - l) / 60; b = 1; } else if (l < 490){ g = (l - 440) / 50; b = 1; } else if (l < 510){ g = 1; b = (510 - l) / 20; } else if (l < 580){ r = (l - 510) / 70; g = 1; } else if (l < 645){ r = 1; g = (645 - l) / 65; } else r = 1;
  const a = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 700 ? 0.3 + 0.7 * (780 - l) / 80 : 1; return [r, g, b].map(c => Math.round(255 * Math.max(0, Math.min(1, c * a)))); }
// AP (2024 CED / equation sheet) vs IB (2025 guide / data booklet) symbols for the same quantities.
const SY = o => (o && o.sym) === 'ib'
  ? { ib: true, L: 'D', m: 'n', a: 'b', pd: 'path difference', pdS: 'Δ', yb: 's', ybName: 'fringe spacing s', yd: 'y₁' }
  : { ib: false, L: 'L', m: 'm', a: 'a', pd: 'ΔD', pdS: 'ΔD', yb: 'y<sub>max</sub>', ybName: 'y_max (m = 1)', yd: 'y<sub>min</sub>' };
const SYNOTE = '<p class="note"><b>AP ↔ IB symbols</b> (same physics): order <b>m ↔ n</b> · slits-to-screen <b>L ↔ D</b> · slit width <b>a ↔ b</b> · path length difference <b>ΔD ↔ “path difference”</b> · AP y<sub>max</sub> = distance from the centre to the m-th bright fringe; IB s = spacing between neighbouring fringes (same number for m = 1). Slit separation is <b>d</b> in both.</p>';
const sinc2 = x => Math.abs(x) < 1e-9 ? 1 : Math.pow(Math.sin(x) / x, 2);
const SIM = {
  title: 'Interference & Diffraction',
  hint: 'AP: m, L, a, ΔD · IB: n, D, b, path diff.',
  modes: [{ id: 'two', label: 'Two speakers' }, { id: 'double', label: 'Double slit' }, { id: 'single', label: 'Single slit' }, { id: 'grating', label: 'Grating' }],
  opts: [{ id: 'sym', label: 'Symbols', choices: [['ap', 'AP'], ['ib', 'IB']] }, { id: 'pat', label: 'Slits', modes: ['single'], choices: [['one', 'One slit'], ['two', 'Two slits of this width']] },
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
        : { id: 'b', sym: SY(opt).a, symText: SY(opt).a, label: 'Slit width', unit: 'μm', min: 20, max: 200, step: 1, val: 60, graph: true },
      { id: 'D', sym: SY(opt).L, symText: SY(opt).L, label: 'Slits to screen', unit: 'm', min: 0.5, max: 3, step: 0.05, val: 2 }];
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
  dvs(mode, opt){ const Y = SY(opt);
    if (mode === 'two') return [{ id: 'n', name: 'Path difference in wavelengths', short: Y.ib ? 'Δ/λ' : 'ΔD/λ', sym: Y.ib ? 'Δ/λ' : 'ΔD/λ', unit: '', f: d => d.n }, { id: 'I', name: 'Loudness (fraction of max)', short: 'I', sym: 'I', unit: '', f: d => d.I }];
    if (mode === 'grating') return [{ id: 'th1', name: 'Angle of the 1st-order maximum', short: 'θ₁', sym: 'θ<sub>1</sub>', unit: '°', f: d => d.th1 }, { id: 'nm', name: 'Highest order you can see', short: Y.m + '_max', sym: Y.m + '<sub>max</sub>', unit: '', f: d => d.nmax }];
    if (mode === 'double') return [{ id: 's', name: Y.ib ? 'Fringe spacing s' : 'Distance to 1st bright fringe y_max', short: Y.ib ? 's' : 'y_max', sym: Y.yb, unit: 'mm', f: d => d.s * 1e3 }];
    return [{ id: 'y1', name: 'Distance to the first dark fringe', short: Y.ib ? 'y₁' : 'y_min', sym: Y.yd, unit: 'mm', f: d => d.y1 * 1e3 }, { id: 'th', name: 'Angle to the first minimum', short: 'θ', sym: 'θ', unit: '°', f: d => d.th1 }];
  },
  work(v, d, mode, opt){ const Y = SY(opt), m = Y.m, P = Y.ib ? 'path difference' : 'ΔD';
    if (mode === 'two'){ const nr = Math.round(d.n * 2) / 2, kind = Math.abs(d.n - Math.round(d.n)) < 0.05 ? 'constructive: <b>loud</b>' : Math.abs(d.n - Math.round(d.n)) > 0.45 ? 'destructive: <b>quiet</b>' : 'in between';
      return '<h4>1 · Wavelength</h4><div class="eq">λ = v/f = (340 m/s)/' + H.iv('f') + ' = <b>' + H.n(d.lam, 'm') + '</b></div>' +
        '<h4>2 · Distance from each speaker</h4><div class="eq">r₁ = √(6² + (y − d/2)²) = ' + H.n(d.r1, 'm') + '; r₂ = ' + H.n(d.r2, 'm') + '</div>' +
        '<h4>3 · Path length difference</h4><div class="eq">' + P + ' = |r₁ − r₂| = ' + H.n(d.pd, 'm') + ' = <b>' + fnum(d.n) + ' λ</b> → ' + kind + '</div>' +
        '<h4>4 · Rules</h4><div class="eq">Constructive (loud): ' + P + ' = ' + m + 'λ<br>Destructive (quiet): ' + P + ' = (' + m + ' + ½)λ &nbsp;&nbsp; ' + m + ' = 0, 1, 2 …</div>' +
        '<p class="note">' + (Math.abs(nr - Math.round(nr)) > 0.1 ? 'Here ' + P + ' ≈ ' + nr + 'λ. ' : '') + 'Noise-cancelling headphones use the same idea with a wave half a cycle out of phase.</p>' + SYNOTE; }
    if (mode === 'grating'){ if (d.white) return '<h4>1 · Line spacing</h4><div class="eq">d = 1/N = 1/(' + H.iv('N') + ') = <b>' + H.n(d.dg * 1e6, 'μm') + '</b></div>' +
        '<h4>2 · Each colour at its own angle: ' + (Y.ib ? 'nλ = d sin θ' : 'd sin θ = mλ') + '</h4><div class="eq">1st order: violet (400 nm) at ' + fnum(Math.asin(400e-9 / d.dg) / DEG) + '°, red (700 nm) at ' + (700e-9 < d.dg ? fnum(Math.asin(700e-9 / d.dg) / DEG) + '°' : 'none') + '</div>' +
        '<p class="note">The central maximum (' + m + ' = 0) is white: every colour has zero path difference there. In each order red is farthest out (longest λ). Full spectra visible up to order ' + d.nmaxW + '.</p>' + SYNOTE;
      return '<h4>1 · Line spacing</h4><div class="eq">d = 1/N = 1/(' + H.iv('N') + ') = <b>' + H.n(d.dg * 1e6, 'μm') + '</b></div>' +
        '<h4>2 · Maxima: ' + (Y.ib ? 'nλ = d sin θ' : 'd sin θ = mλ') + '</h4><div class="eq">' + (d.ords.length ? d.ords.map(([n, th]) => m + ' = ' + n + ': θ = <b>' + fnum(th) + '°</b>').join('<br>') : m + 'λ > d even for ' + m + ' = 1: no maxima except the centre.') + '</div>' +
        '<h4>3 · Highest order</h4><div class="eq">sin θ ≤ 1 → ' + m + ' ≤ d/λ = ' + fnum(d.dg / (v.lam * 1e-9)) + ' → ' + m + '<sub>max</sub> = <b>' + d.nmax + '</b></div>' +
        '<p class="note">Use sin θ, not the small-angle approximation — the angles are big.</p>' + SYNOTE; }
    if (mode === 'double'){
      const eq = Y.ib ? '<h4>1 · Fringe spacing (Young)</h4><div class="eq">s = λD/d = (' + H.iv('lam') + ')(' + H.iv('D') + ')/(' + H.iv('dd') + ') = <b>' + H.n(d.s * 1e3, 'mm') + '</b></div>'
        : '<h4>1 · Path length difference to a bright fringe</h4><div class="eq">ΔD = d sin θ = mλ</div><h4>2 · Small angles: sin θ ≈ tan θ = y<sub>max</sub>/L</h4><div class="eq">y<sub>max</sub> = mλL/d; for m = 1: (' + H.iv('lam') + ')(' + H.iv('D') + ')/(' + H.iv('dd') + ') = <b>' + H.n(d.s * 1e3, 'mm') + '</b></div>';
      return eq + (Y.ib ? '<h4>2 · Why bright and dark?</h4><div class="eq">Bright where the path difference = nλ; dark where it is (n + ½)λ.</div>' : '<h4>3 · Dark fringes</h4><div class="eq">ΔD = (m + ½)λ: halfway between the bright ones.</div>') +
        '<p class="note">Bigger λ or ' + Y.L + ' → wider fringes; bigger d → narrower. Lab: measure across 10 fringes and divide by 10.</p>' + SYNOTE; }
    return (Y.ib ? '<h4>1 · First minimum</h4><div class="eq">θ = λ/b (small angles) = <b>' + H.n(d.th1, '°') + '</b></div><h4>2 · On the screen</h4><div class="eq">y₁ = Dθ = λD/b = (' + H.iv('lam') + ')(' + H.iv('D') + ')/(' + H.iv('b') + ') = <b>'
        : '<h4>1 · Dark fringes</h4><div class="eq">ΔD = a sin θ = mλ (m = 1, 2 …) → 1st dark at θ = <b>' + H.n(d.th1, '°') + '</b></div><h4>2 · On the screen (small angles)</h4><div class="eq">y<sub>min</sub> = mλL/a; m = 1: (' + H.iv('lam') + ')(' + H.iv('D') + ')/(' + H.iv('b') + ') = <b>') +
      H.n(d.y1 * 1e3, 'mm') + '</b>; central maximum is <b>' + H.n(d.wC * 1e3, 'mm') + '</b> wide (twice the others).</div>' +
      (d.two ? '<h4>3 · Two slits of this width</h4><div class="eq">Double-slit fringes (' + (Y.ib ? 's = λD/d' : 'y<sub>max</sub> = λL/d') + ' = ' + H.n(d.sF * 1e3, 'mm') + ') sit inside the single-slit envelope. Where a single-slit minimum lands on a bright fringe, that fringe is missing.</div>' : '') +
      '<p class="note">Careful: for one slit, ' + Y.a + ' sin θ = ' + m + 'λ gives <b>dark</b> fringes; for two slits, d sin θ = ' + m + 'λ gives <b>bright</b> ones. Narrower slit → wider pattern.</p>' + SYNOTE;
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
      { const lb = (t_, x, y, c) => text(t_, x, y, { font: '700 12px "Space Grotesk",sans-serif', col: c }); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(x0 + 60, yc - v.d / 4 * PX - 22, 26, 16); ctx.fillRect(x0 + 60, yc + v.d / 4 * PX + 4, 26, 16);
        lb('r₁', x0 + 64, yc - v.d / 4 * PX - 9, '#1546d6'); lb('r₂', x0 + 64, yc + v.d / 4 * PX + 17, '#1546d6');
        ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0 - 18, yc - v.d / 2 * PX); ctx.lineTo(x0 - 24, yc - v.d / 2 * PX); ctx.lineTo(x0 - 24, yc + v.d / 2 * PX); ctx.lineTo(x0 - 18, yc + v.d / 2 * PX); ctx.stroke(); text('d', x0 - 28, yc + 4, { align: 'right', font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' });
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(x0 + 90, 280, 120, 15); arrow(x0, 300, xw, 300, '#111', null, { w: 1.2, head: 5 }); text('6 m to the wall', x0 + 150, 292, { align: 'center', font: '700 11px "Space Grotesk",sans-serif' }); }
      ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(xw - 2, yp, 7, 0, 7); ctx.fill(); text('you', xw - 12, yp - 10, { align: 'right', font: '700 11px "Space Grotesk",sans-serif', col: '#ff6a2b' });
      text('dark bands = loud (constructive)', 12, 318, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('LOUDNESS ALONG THE WALL', 395, 18);
      const gx = 400, gw = 185; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, 40); ctx.lineTo(gx, 290); ctx.stroke();
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 200; i++){ const y = 3.5 - 7 * i / 200, dd = SIM.calc(Object.assign({}, v, { y }), 'two', opt), py = yc - y * PX; i ? ctx.lineTo(gx + gw * dd.I, py) : ctx.moveTo(gx + gw * dd.I, py); } ctx.stroke();
      ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(gx + gw * d.I, yp, 5, 0, 7); ctx.fill();
      text((SY(opt).ib ? 'path diff. = ' : 'ΔD = ') + fplain(d.n) + ' λ', 590, 300, { align: 'right', font: '700 13px "Space Grotesk",sans-serif' });
      return;
    }
    if (mode === 'grating'){
      panelTitle('DIFFRACTION GRATING (SCREEN 1 m AWAY)', 10, 18);
      const gx = 40, gy = 165, R = 320; ctx.fillStyle = '#111'; ctx.fillRect(gx - 3, gy - 60, 6, 120); ctx.fillStyle = '#c43a00'; ctx.fillRect(10, gy - 2, gx - 12, 4);
      ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(gx, gy, R, -PI / 2, PI / 2); ctx.stroke();
      const beam = (th, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + R * Math.cos(th * DEG), gy - R * Math.sin(th * DEG)); ctx.stroke(); };
      const dot = (th, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(gx + R * Math.cos(th * DEG), gy - R * Math.sin(th * DEG), 5, 0, 7); ctx.fill(); };
      if (d.white){ beam(0, '#bbb', 3); dot(0, '#eee'); for (let n = 1; n <= 4; n++) for (let l = 400; l <= 700; l += 6){ const s = n * l * 1e-9 / d.dg; if (s >= 1) continue; const th = Math.asin(s) / DEG, [r, g, b] = wlRGB(l), c = 'rgb(' + r + ',' + g + ',' + b + ')'; [1, -1].forEach(sg => { ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.beginPath(); const a = sg * th * DEG; ctx.arc(gx, gy, R, -a - 0.006, -a + 0.006); ctx.stroke(); }); } }
      else { const [r, g, b] = wlRGB(v.lam), c = 'rgb(' + r + ',' + g + ',' + b + ')'; beam(0, c, 2); dot(0, c); d.ords.forEach(([n, th]) => { [1, -1].forEach(sg => { beam(sg * th, c, 1.5); dot(sg * th, c); }); text(SY(opt).m + '=' + n, gx + (R + 0) * Math.cos(th * DEG) - 26, gy - R * Math.sin(th * DEG) - 8, { font: '700 11px "Space Grotesk",sans-serif' }); }); }
      text(SY(opt).m + ' = 0', gx + R - 40, gy - 8, { font: '700 11px "Space Grotesk",sans-serif' });
      text('d = ' + fplain(d.dg * 1e6) + ' μm', 12, 312, { font: '700 13px "Space Grotesk",sans-serif' });
      panelTitle('ORDERS', 395, 18);
      if (d.white){ [1, 2, 3].forEach((n, i) => { const a = n * 400e-9 / d.dg, b = n * 700e-9 / d.dg; text(SY(opt).m + ' = ' + n + ': ' + (a < 1 ? fplain(Math.asin(a) / DEG) + '°' : '—') + ' to ' + (b < 1 ? fplain(Math.asin(b) / DEG) + '°' : 'off'), 400, 50 + i * 26, { font: '600 12px "IBM Plex Mono",monospace' }); }); text('violet → red, red farthest', 400, 140, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
      else { d.ords.forEach(([n, th], i) => text(SY(opt).m + ' = ' + n + ': θ = ' + fplain(th) + '°', 400, 50 + i * 26, { font: '600 12px "IBM Plex Mono",monospace' })); text(SY(opt).m + ' max = ' + d.nmax, 400, 60 + d.ords.length * 26, { font: '700 13px "Space Grotesk",sans-serif' }); }
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
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xs - 12, yc); ctx.lineTo(xs - 12, pym); ctx.stroke(); text(isD ? (SY(opt).ib ? 's' : 'yₘₐₓ') : (SY(opt).ib ? 'y₁' : 'yₘᵢₙ'), xs - 16, (yc + pym) / 2 + 4, { align: 'right', font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' }); }
    const Y = SY(opt), mono = '"IBM Plex Mono",monospace', lab = (t_, x, y, al, col) => text(t_, x, y, { align: al || 'left', font: '700 12px "Space Grotesk",sans-serif', col: col || '#111' });
    // slits-to-screen distance
    ctx.strokeStyle = '#111'; arrow(126, 302, xs - 2, 302, '#111', null, { w: 1.2, head: 5 }); arrow(xs - 2, 302, 126, 302, '#111', null, { w: 1.2, head: 5 }); lab(Y.L + ' = ' + v.D + ' m', (126 + xs) / 2, 316, 'center');
    // slit separation / width bracket
    ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; const gb = isD ? 6 : Math.max(4, v.b / 10); ctx.beginPath(); ctx.moveTo(110, yc - gb); ctx.lineTo(104, yc - gb); ctx.lineTo(104, yc + gb); ctx.lineTo(110, yc + gb); ctx.stroke(); lab(isD ? 'd' : Y.a, 98, yc - gb - 8, 'center', '#c43a00');
    // angle at the slits
    if (pym > 45){ const th = Math.atan2(yc - pym, xs - 125); ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(125, yc, 46, -th, 0); ctx.stroke(); lab('θ', 176, yc - 4 - 46 * Math.sin(th) / 2, 'left', '#1546d6'); }
    // zoom on path length difference
    const zx = 134, zy = 214, zw = 200, zh = 72; ctx.fillStyle = '#fff'; ctx.fillRect(zx, zy, zw, zh); ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.strokeRect(zx, zy, zw, zh);
    text('ZOOM AT THE SLITS', zx + 4, zy + 11, { font: '700 9px ' + mono, col: '#4a4a4a' });
    { ctx.save(); ctx.beginPath(); ctx.rect(zx, zy, zw, zh); ctx.clip(); const ax = zx + 30, y1 = zy + 38, y2 = zy + 64, ang = 0.5, Lr = 60;
      ctx.fillStyle = '#111'; ctx.fillRect(ax - 3, zy + 14, 3, y1 - zy - 17); ctx.fillRect(ax - 3, y1 + 3, 3, y2 - y1 - 6); ctx.fillRect(ax - 3, y2 + 3, 3, 12);
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1.2; [y1, y2].forEach(yy => { ctx.beginPath(); ctx.moveTo(ax, yy); ctx.lineTo(ax + Lr * Math.cos(ang), yy - Lr * Math.sin(ang)); ctx.stroke(); });
      const px = ax + (y2 - y1) * Math.sin(ang) * Math.cos(ang), py = y2 - (y2 - y1) * Math.sin(ang) * Math.sin(ang);
      ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(ax, y1); ctx.lineTo(px, py); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax, y2); ctx.lineTo(px, py); ctx.stroke();
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax, y2); ctx.lineTo(ax + 26, y2); ctx.stroke(); ctx.beginPath(); ctx.arc(ax, y2, 18, -ang, 0); ctx.stroke(); text('θ', ax + 21, y2 - 2, { font: '700 9px ' + mono, col: '#1546d6' });
      lab(isD ? 'd' : Y.a, ax - 7, (y1 + y2) / 2 + 4, 'right', '#c43a00');
      text((Y.ib ? 'path diff' : 'ΔD') + ' = ' + (isD ? 'd' : Y.a) + ' sinθ', zx + 90, zy + 40, { font: '700 9px ' + mono, col: '#c43a00' });
      text('= ' + Y.m + 'λ → ' + (isD ? 'bright' : 'dark'), zx + 90, zy + 52, { font: '700 9px ' + mono, col: '#c43a00' });
      text('rays → same far point', zx + 90, zy + 66, { font: '500 8px ' + mono, col: '#4a4a4a' }); ctx.restore(); }
    panelTitle('INTENSITY ON THE SCREEN', 395, 18);
    const gx = 400, gw = 185; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, 45); ctx.lineTo(gx, 285); ctx.stroke();
    ctx.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')'; ctx.lineWidth = 2; ctx.beginPath(); for (let py = 45; py <= 285; py++){ const I = d.I((yc - py) / sy); py === 45 ? ctx.moveTo(gx + gw * I, py) : ctx.lineTo(gx + gw * I, py); } ctx.stroke();
    if (!isD && !d.two){ ctx.strokeStyle = '#8a8a8a'; ctx.setLineDash([3, 3]); [1, -1].forEach(s => { const p = yc - s * d.y1 * sy; if (p > 45 && p < 285){ ctx.beginPath(); ctx.moveTo(gx, p); ctx.lineTo(gx + gw, p); ctx.stroke(); } }); ctx.setLineDash([]); }
    text('±' + (W * 1e3) + ' mm', 590, 300, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text(isD ? (SY(opt).ib ? 's = λD/d = ' : 'yₘₐₓ = mλL/d = ') + fplain(d.s * 1e3) + ' mm' : (SY(opt).ib ? 'y₁ = λD/b = ' : 'yₘᵢₙ = mλL/a = ') + fplain(d.y1 * 1e3) + ' mm', 400, 300, { font: '700 13px "Space Grotesk",sans-serif' });
  }
};
