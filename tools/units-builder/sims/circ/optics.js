// Mirrors & Lenses (AP 13.2, 13.4): ray diagrams with the three principal rays, 1/sₒ + 1/sᵢ = 1/f, magnification, and where cameras, projectors, magnifiers and mirrors fit.
const SIM = {
  title: 'Mirrors & Lenses',
  hint: '1/sₒ + 1/sᵢ = 1/f · M = −sᵢ/sₒ',
  modes: [{ id: 'lens', label: 'Lens' }, { id: 'mirror', label: 'Mirror' }, { id: 'refl', label: 'Plane mirror & reflection' }],
  opts: [{ id: 'lt', label: 'Type', modes: ['lens'], choices: [['conv', 'Converging (convex)'], ['div', 'Diverging (concave)']] },
    { id: 'mt', label: 'Type', modes: ['mirror'], choices: [['cave', 'Concave'], ['vex', 'Convex'], ['plane', 'Plane']] },
    { id: 'rk', label: 'Show', modes: ['refl'], choices: [['full', 'Full-length mirror'], ['diff', 'Smooth vs rough surface']] }],
  ivs(mode, opt){
    if (mode === 'refl') return (opt && opt.rk) === 'diff' ? [
      { id: 'th', sym: 'θ<sub>i</sub>', symText: 'theta', label: 'Angle of incidence', unit: '°', min: 10, max: 70, step: 1, val: 40 },
      { id: 'r', sym: 'r', symText: 'rough', label: 'Surface roughness', unit: '%', min: 0, max: 100, step: 5, val: 0, graph: true }] : [
      { id: 'Hp', sym: 'H', symText: 'H', label: 'Your height', unit: 'cm', min: 120, max: 200, step: 1, val: 170 },
      { id: 'D', sym: 'D', symText: 'D', label: 'Distance from the mirror', unit: 'cm', min: 50, max: 300, step: 5, val: 100, graph: true }];
    const plane = mode === 'mirror' && (opt && opt.mt) === 'plane', a = [
      { id: 'so', sym: 's<sub>o</sub>', symText: 'so', label: 'Object distance', unit: 'cm', min: 2, max: 70, step: 0.5, val: 30, graph: true },
      { id: 'ho', sym: 'h<sub>o</sub>', symText: 'ho', label: 'Object height', unit: 'cm', min: 1, max: 6, step: 0.5, val: 4 }];
    if (!plane) a.splice(1, 0, { id: 'f', sym: '|f|', symText: '|f|', label: 'Focal length (size)', unit: 'cm', min: 5, max: 30, step: 0.5, val: 12 });
    return a;
  },
  presets: [{ label: 'Camera (beyond 2f)', mode: 'lens', v: { so: 40, f: 12 } }, { label: 'Projector (f to 2f)', mode: 'lens', v: { so: 16, f: 12 } }, { label: 'Magnifier (inside f)', mode: 'lens', v: { so: 7, f: 12 } }, { label: 'Makeup mirror', mode: 'mirror', v: { so: 8, f: 12 } }, { label: 'Step back', mode: 'refl', opt: { rk: 'full' }, v: { D: 280 } }, { label: 'Rough paper', mode: 'refl', opt: { rk: 'diff' }, v: { r: 80 } }],
  calc(v, mode, opt){
    if (mode === 'refl'){ if (opt.rk === 'diff'){ const sp = v.r * 0.6; return { diff: true, sp }; }
      const e = v.Hp - 10; return { diff: false, e, L: v.Hp / 2, bot: e / 2, top: (v.Hp + e) / 2, si: -v.D }; }
    const kind = mode === 'lens' ? (opt.lt || 'conv') : (opt.mt || 'cave'), plane = kind === 'plane', f = plane ? Infinity : (kind === 'conv' || kind === 'cave' ? v.f : -v.f);
    const si = plane ? -v.so : (Math.abs(v.so - f) < 1e-9 ? Infinity : 1 / (1 / f - 1 / v.so)), M = isFinite(si) ? -si / v.so : Infinity, hi = M * v.ho;
    const real = isFinite(si) && si > 0, region = !isFinite(f) || f < 0 ? 'any' : v.so > 2 * f ? 'beyond 2f' : Math.abs(v.so - 2 * f) < 1e-9 ? 'at 2f' : v.so > f ? 'between f and 2f' : Math.abs(v.so - f) < 1e-9 ? 'at f' : 'inside f';
    return { kind, plane, f, si, M, hi, real, region };
  },
  dvs(mode, opt){ if (mode === 'refl') return opt && opt.rk === 'diff' ? [{ id: 'sp', name: 'Spread of reflected rays', short: 'spread', sym: 'spread', unit: '°', f: d => d.sp }] : [{ id: 'L', name: 'Shortest mirror that works', short: 'L', sym: 'L', unit: 'cm', f: d => d.L }, { id: 'bot', name: 'Height of the bottom edge', short: 'bottom', sym: 'y', unit: 'cm', f: d => d.bot }];
    return [{ id: 'si', name: 'Image distance', short: 'sᵢ', sym: 's<sub>i</sub>', unit: 'cm', f: d => isFinite(d.si) && Math.abs(d.si) < 400 ? d.si : NaN, negNote: 'virtual (sᵢ < 0)', signOK: 'The image switches between real and virtual.' }, { id: 'M', name: 'Magnification', short: 'M', sym: 'M', unit: '', f: d => isFinite(d.M) && Math.abs(d.M) < 20 ? d.M : NaN, signOK: 'The image flips between upright and inverted.' }]; },
  work(v, d, mode){
    if (mode === 'refl'){
      if (d.diff) return '<h4>1 · Law of reflection</h4><p class="st">At every point, the angle of reflection equals the angle of incidence, measured from the <b>local</b> normal.</p>' + TEXA`\theta_r = \theta_i` +
        '<h4>2 · Smooth or rough?</h4><p class="st">' + (v.r === 0 ? '<b>Specular</b>: one flat surface, one normal, so parallel rays leave parallel. You see a clear image (mirror, still water).' : '<b>Diffuse</b>: the normals tilt from bump to bump, so the reflected rays spread over about ' + fnum(d.sp) + '°. No image, but you can see the surface from any angle (paper, walls).') + '</p>' +
        '<p class="note">Diffuse reflection does not break the law of reflection; each ray still obeys it.</p>';
      return '<h4>1 · Where the image is</h4><p class="st">Plane mirror: the image is as far behind the glass as you are in front.</p>' + TEX`s_i = -s_o` + TEX`s_i = -(${M.iv('D')})` + TEXA`s_i = ${M.n(-v.D, 'cm')}` +
        '<p class="st">Upright and the same size:</p>' + TEX`M = +1` +
        '<h4>2 · Ray from your feet</h4><p class="st">It hits the mirror halfway between your eye and the floor (eye height e = ' + H.n(d.e, 'cm') + ').</p>' + TEX`y = \frac{e}{2}` + TEX`y = \frac{${M.n(d.e)}}{2}` + TEXA`y = ${M.n(d.bot, 'cm')}` +
        '<h4>3 · Ray from the top of your head</h4><p class="st">It hits halfway between your eye and your head.</p>' + TEXA`y = ${M.n(d.top, 'cm')}` +
        '<h4>4 · Shortest mirror</h4>' + TEX`L = y_{\text{top}} - y_{\text{bottom}}` + TEX`L = ${M.n(d.top)} - ${M.n(d.bot)}` + TEX`L = \frac{H}{2}` + TEXA`L = ${M.n(d.L, 'cm')}` +
        '<p class="st">Change D: it does not matter how far away you stand.</p>';
    }
    const nm = { conv: 'converging lens', div: 'diverging lens', cave: 'concave mirror', vex: 'convex mirror', plane: 'plane mirror' }[d.kind];
    if (d.plane) return '<h4>Plane mirror</h4><p class="st">The image is as far behind the mirror as the object is in front.</p>' + TEX`s_i = -s_o` + TEXA`s_i = ${M.n(d.si, 'cm')}` + TEX`M = +1` + '<p class="note">Virtual, upright, same size, left–right reversed. A full-length mirror only needs to be half your height.</p>';
    if (!isFinite(d.si)) return '<h4>Object at the focal point</h4>' + TEX`\frac{1}{s_i} = \frac{1}{f} - \frac{1}{s_o}` + TEXA`\frac{1}{s_i} = 0` + '<div class="bad">So the reflected or refracted rays come out parallel: no image forms (it is “at infinity”). Lighthouses and headlights put the bulb here.</div>';
    const desc = [d.real ? 'real' : 'virtual', d.M < 0 ? 'inverted' : 'upright', Math.abs(Math.abs(d.M) - 1) < 0.01 ? 'same size' : Math.abs(d.M) > 1 ? 'enlarged' : 'reduced'].join(', ');
    const use = d.kind === 'conv' ? { 'beyond 2f': 'camera or eye: small real image on the sensor/retina', 'at 2f': 'photocopier at 100%', 'between f and 2f': 'projector: big real image on a screen', 'inside f': 'magnifying glass: big virtual image' }[d.region]
      : d.kind === 'cave' ? { 'beyond 2f': 'telescope mirror', 'at 2f': 'image same size, at 2f', 'between f and 2f': 'stage spotlight / projector', 'inside f': 'makeup or shaving mirror' }[d.region]
      : d.kind === 'vex' ? 'security and car side mirrors: wide view, small upright image (“objects are closer than they appear”)' : 'eyeglasses for nearsighted people; peepholes';
    const fs = (d.f > 0 ? '<mo>+</mo>' : '<mo>−</mo>') + M.n(Math.abs(d.f), 'cm');
    return '<h4>1 · Sign of f</h4><p class="st">A ' + nm + ': ' + (d.f > 0 ? 'converging → positive f.' : 'diverging → negative f.') + '</p>' + TEXA`f = ${fs}` +
      '<h4>2 · Image distance</h4>' + TEX`\frac{1}{s_i} = \frac{1}{f} - \frac{1}{s_o}` + TEX`\frac{1}{s_i} = \frac{1}{${M.p(d.f, 'cm')}} - \frac{1}{${M.iv('so')}}` + TEXA`s_i = ${M.n(d.si, 'cm')}` +
      '<p class="st">' + (d.si > 0 ? (mode === 'lens' ? 'Positive: opposite side from the object.' : 'Positive: in front of the mirror.') : (mode === 'lens' ? 'Negative: same side as the object.' : 'Negative: behind the mirror.')) + '</p>' +
      '<h4>3 · Magnification</h4>' + TEX`M = -\frac{s_i}{s_o}` + TEX`M = -\frac{${M.p(d.si)}}{${M.n(v.so)}}` + TEXA`M = ${M.n(d.M)}` +
      TEX`h_i = M\,h_o` + TEX`h_i = (${M.p(d.M)})(${M.iv('ho')})` + TEXA`h_i = ${M.n(d.hi, 'cm')}` +
      '<h4>4 · Describe it</h4><p class="st"><b>' + desc + '</b></p>' + (d.region !== 'any' ? '<p class="note">Object ' + d.region + '. Use: ' + use + '.</p>' : '<p class="note">A ' + nm + ' always gives a virtual, upright, reduced image. Use: ' + use + '.</p>') +
      '<p class="note">Check the ray diagram: real images are where the rays actually cross; virtual images are where the dashed extensions cross.</p>';
  },
  draw(v, d, mode){
    if (mode === 'refl') return drawRefl(v, d);
    const ax = 160, sx = 2.6, sy = 11, C = mode === 'lens' ? 210 : 250, X0 = 14, X1 = 384, clipR = () => { ctx.save(); ctx.beginPath(); ctx.rect(X0, 22, X1 - X0, 290); ctx.clip(); };
    panelTitle((mode === 'lens' ? 'RAY DIAGRAM: ' : 'RAY DIAGRAM: ') + ({ conv: 'CONVERGING LENS', div: 'DIVERGING LENS', cave: 'CONCAVE MIRROR', vex: 'CONVEX MIRROR', plane: 'PLANE MIRROR' })[d.kind], 10, 18);
    ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, ax); ctx.lineTo(X1, ax); ctx.stroke();
    // optic
    ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 3;
    if (mode === 'lens'){ ctx.beginPath(); ctx.moveTo(C, ax - 110); ctx.lineTo(C, ax + 110); ctx.stroke(); const hd = d.kind === 'conv' ? 1 : -1; [-1, 1].forEach(s => { const ye = ax + s * 110; ctx.beginPath(); ctx.moveTo(C - 8, ye - s * 8 * hd); ctx.lineTo(C, ye); ctx.lineTo(C + 8, ye - s * 8 * hd); ctx.stroke(); }); }
    else { ctx.beginPath(); const bow = d.kind === 'cave' ? 10 : d.kind === 'vex' ? -10 : 0; ctx.moveTo(C - bow, ax - 110); ctx.quadraticCurveTo(C + bow, ax, C - bow, ax + 110); ctx.stroke(); ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; for (let y = ax - 104; y < ax + 110; y += 10){ ctx.beginPath(); ctx.moveTo(C + 4, y); ctx.lineTo(C + 10, y - 6); ctx.stroke(); } }
    // focal points
    const dirOut = mode === 'lens' ? 1 : -1, fpx = d.plane ? null : Math.abs(d.f) * sx;
    if (fpx){ const pts = mode === 'lens' ? [[C - fpx, 'F'], [C + fpx, 'F'], [C - 2 * fpx, '2F'], [C + 2 * fpx, '2F']] : d.kind === 'cave' ? [[C - fpx, 'F'], [C - 2 * fpx, 'C']] : [[C + fpx, 'F'], [C + 2 * fpx, 'C']];
      pts.forEach(([x, n]) => { if (x < X0 || x > X1) return; ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, ax, 3, 0, 7); ctx.fill(); text(n, x, ax + 16, { align: 'center', font: '700 11px "Space Grotesk",sans-serif' }); }); }
    // object
    const xo = C - v.so * sx, yo = ax - v.ho * sy; arrow(xo, ax, xo, yo, '#1e7d45', 'object', { w: 3.5, ly: -10, align: 'center', lx: 0 });
    // image
    const hasImg = isFinite(d.si) && Math.abs(d.si) < 300, xi = C + dirOut * d.si * sx, yi = ax - d.hi * sy;
    clipR();
    const ray = (pts, extBack) => { ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1])); ctx.stroke();
      if (extBack){ ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(196,58,0,0.6)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(extBack[0][0], extBack[0][1]); ctx.lineTo(extBack[1][0], extBack[1][1]); ctx.stroke(); ctx.setLineDash([]); } };
    const go = (x, y, dx, dy, L) => [x + dx * L, y + dy * L], far = 900, virt = hasImg && !d.real;
    const exitFrom = (px, py, tx, ty) => { const dx = tx - px, dy = ty - py, n = Math.hypot(dx, dy); return [dx / n, dy / n]; };
    if (d.plane){
      [[C, yo], [C, ax]].forEach(([mx, my]) => { const [ux, uy] = exitFrom(xo, yo, mx, my); ray([[xo, yo], [mx, my], go(mx, my, -ux, uy, far)], [[mx, my], [xi, yi]]); });
    } else {
      // ray 1: parallel to the axis → through (or from) the focal point
      const Ff = C + dirOut * d.f * sx; // the focal point the outgoing ray passes through (real) or appears to come from (virtual)
      let [u1x, u1y] = exitFrom(C, yo, Ff, ax); if (d.f < 0){ u1x = -u1x; u1y = -u1y; }
      ray([[xo, yo], [C, yo], go(C, yo, u1x, u1y, far)], virt || d.f < 0 ? [[C, yo], [xi, yi]] : null);
      // ray 2: through the centre (lens straight; mirror reflects symmetrically)
      if (mode === 'lens'){ const [ux, uy] = exitFrom(xo, yo, C, ax); ray([[xo, yo], go(xo, yo, ux, uy, far)], virt ? [[C, ax], [xi, yi]] : null); }
      else { const [ux, uy] = exitFrom(xo, yo, C, ax); ray([[xo, yo], [C, ax], go(C, ax, -ux, uy, far)], virt ? [[C, ax], [xi, yi]] : null); }
      // ray 3: toward the focal point on the object side (or the far one for diverging) → leaves parallel
      const fx = mode === 'lens' ? (d.f > 0 ? C - d.f * sx : C + Math.abs(d.f) * sx) : (d.f > 0 ? C - d.f * sx : C + Math.abs(d.f) * sx);
      if (Math.abs(fx - xo) > 1){ const yAt = yo + (ax - yo) * (C - xo) / (fx - xo); if (Math.abs(yAt - ax) < 115 && isFinite(yAt) && !(d.f > 0 && Math.abs(v.so - d.f) < 0.3)){ ray([[xo, yo], [C, yAt], [C + dirOut * far, yAt]], virt || d.f < 0 ? [[C, yAt], [xi, yAt]] : null); } }
    }
    ctx.restore();
    if (hasImg && xi > X0 && xi < X1){ arrow(xi, ax, xi, yi, d.real ? '#7a3fb0' : 'rgba(122,63,176,0.55)', 'image', { w: 3.5, dash: d.real ? null : [5, 4], ly: d.hi > 0 ? -10 : 12, align: 'center', lx: 0 }); }
    text('sₒ = ' + v.so + ' cm   sᵢ = ' + (isFinite(d.si) ? fplain(d.si) + ' cm' : '∞'), 12, 312, { font: '700 13px "Space Grotesk",sans-serif' });
    panelTitle('THE IMAGE', 395, 18);
    const rows = isFinite(d.si) ? [['sᵢ', fplain(d.si) + ' cm'], ['M', fplain(d.M)], ['hᵢ', fplain(d.hi) + ' cm'], ['type', d.real ? 'real' : 'virtual'], ['orientation', d.M < 0 ? 'inverted' : 'upright'], ['size', Math.abs(Math.abs(d.M) - 1) < 0.01 ? 'same' : Math.abs(d.M) > 1 ? 'enlarged' : 'reduced']] : [['image', 'none (at ∞)']];
    rows.forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px "IBM Plex Mono",monospace' }); });
    if (d.region !== 'any') text('object ' + d.region, 400, 220, { font: '700 12px "Space Grotesk",sans-serif', col: '#1e7d45' });
    text('dashed = extensions', 400, 300, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
  }
};

function drawRefl(v, d){
  const F = '"Space Grotesk",sans-serif', M = '"IBM Plex Mono",monospace';
  if (d.diff){
    panelTitle(v.r === 0 ? 'SPECULAR REFLECTION (SMOOTH)' : 'DIFFUSE REFLECTION (ROUGH)', 10, 18);
    const y0 = 230, th = v.th * DEG, n = 7, x0 = 110, gap = 30;
    const bump = x => v.r / 100 * (Math.sin(x * 0.21) * 9 + Math.sin(x * 0.53 + 1) * 5);
    ctx.fillStyle = '#e6e2d8'; ctx.beginPath(); ctx.moveTo(14, 312); for (let x = 14; x <= 384; x += 2) ctx.lineTo(x, y0 + bump(x)); ctx.lineTo(384, 312); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2.5; ctx.beginPath(); for (let x = 14; x <= 384; x += 2){ const y = y0 + bump(x); x === 14 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    for (let i = 0; i < n; i++){
      const xh = x0 + i * gap, yh = y0 + bump(xh), L = 190, xs = xh - Math.sin(th) * L, ys = yh - Math.cos(th) * L;
      const sl = (bump(xh + 1) - bump(xh - 1)) / 2, nx = sl, ny = -1, nn = Math.hypot(nx, ny), ux = nx / nn, uy = ny / nn;
      let dx = Math.sin(th), dy = Math.cos(th); const dot = dx * ux + dy * uy; const rx = dx - 2 * dot * ux, ry = dy - 2 * dot * uy;
      ctx.save(); ctx.beginPath(); ctx.rect(14, 22, 370, 290); ctx.clip();
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(xs, ys); ctx.lineTo(xh, yh); ctx.lineTo(xh + rx * 170, yh + ry * 170); ctx.stroke();
      if (i === 3){ ctx.setLineDash([4, 4]); ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xh, yh); ctx.lineTo(xh + ux * 60, yh + uy * 60); ctx.stroke(); ctx.setLineDash([]); text('normal', xh + ux * 60, yh + uy * 60 - 6, { align: 'center', font: '600 10px ' + M, col: '#8a8a8a' }); }
      ctx.restore();
    }
    text('incoming rays are parallel', 20, 40, { font: '600 11px ' + F, col: '#c43a00' });
    panelTitle('REFLECTED RAYS', 395, 18);
    [['θᵢ', v.th + '°'], ['roughness', v.r + '%'], ['spread', fplain(d.sp) + '°'], ['type', v.r === 0 ? 'specular' : 'diffuse'], ['image?', v.r === 0 ? 'yes, clear' : v.r < 20 ? 'blurry' : 'no']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px ' + F, col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px ' + M }); });
    text('each ray: θr = θi', 400, 300, { font: '500 10px ' + M, col: '#8a8a8a' });
    return;
  }
  panelTitle('PLANE MIRROR: HOW TALL A MIRROR?', 10, 18);
  const fl = 290, s = 1.2, xm = 200, k = 0.55, xp = xm - v.D * k, xi = xm + v.D * k, Y = h => fl - h * s;
  ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(14, fl); ctx.lineTo(384, fl); ctx.stroke();
  ctx.strokeStyle = '#d9d4c7'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xm, 28); ctx.lineTo(xm, fl); ctx.stroke();
  ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(xm, Y(d.bot)); ctx.lineTo(xm, Y(d.top)); ctx.stroke();
  const person = (x, dash, col) => { ctx.save(); if (dash) ctx.setLineDash([5, 4]); ctx.strokeStyle = col; ctx.lineWidth = 3; const hT = Y(v.Hp), hr = 9;
    ctx.beginPath(); ctx.arc(x, hT + hr, hr, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, hT + 2 * hr); ctx.lineTo(x, Y(v.Hp * 0.47)); ctx.lineTo(x - 9, fl); ctx.moveTo(x, Y(v.Hp * 0.47)); ctx.lineTo(x + 9, fl); ctx.moveTo(x - 14, Y(v.Hp * 0.7)); ctx.lineTo(x + 14, Y(v.Hp * 0.7)); ctx.stroke(); ctx.restore(); };
  person(xp, false, '#1e7d45'); person(xi, true, 'rgba(122,63,176,0.6)');
  const ex = xp + 4, ey = Y(d.e); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(ex, ey, 3, 0, 7); ctx.fill();
  [[v.Hp, d.top], [0, d.bot]].forEach(([h, hm]) => { ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(xp, Y(h)); ctx.lineTo(xm, Y(hm)); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(196,58,0,0.55)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(xm, Y(hm)); ctx.lineTo(xi, Y(h)); ctx.stroke(); ctx.setLineDash([]); });
  text('you', xp, fl + 28, { align: 'center', font: '700 11px ' + F, col: '#1e7d45' }); text('image', xi, fl + 28, { align: 'center', font: '700 11px ' + F, col: '#7a3fb0' });
  text('mirror', xm - 6, Y(d.bot) + 14, { align: 'right', font: '700 11px ' + F, col: '#1546d6' }); 0 && text('', 0, 0, { font: '700 11px ' + F, col: '#1546d6' });
  text('D = ' + v.D + ' cm', (xp + xm) / 2, fl + 14, { align: 'center', font: '600 10px ' + M, col: '#4a4a4a' }); text('D', (xm + xi) / 2, fl + 14, { align: 'center', font: '600 10px ' + M, col: '#4a4a4a' });
  panelTitle('THE MIRROR', 395, 18);
  [['your height', fplain(v.Hp) + ' cm'], ['eye height', fplain(d.e) + ' cm'], ['image distance', fplain(-v.D) + ' cm'], ['mirror bottom', fplain(d.bot) + ' cm'], ['mirror top', fplain(d.top) + ' cm'], ['length needed', fplain(d.L) + ' cm']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px ' + F, col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px ' + M }); });
  text('L = H/2, whatever D is', 400, 220, { font: '700 12px ' + F, col: '#1e7d45' });
  text('dashed = extensions', 400, 300, { font: '500 10px ' + M, col: '#8a8a8a' });
}
