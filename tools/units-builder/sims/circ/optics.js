// Mirrors & Lenses (AP 13.2, 13.4): ray diagrams with the three principal rays, 1/sₒ + 1/sᵢ = 1/f, magnification, and where cameras, projectors, magnifiers and mirrors fit.
const SIM = {
  title: 'Mirrors & Lenses',
  hint: '1/sₒ + 1/sᵢ = 1/f · M = −sᵢ/sₒ',
  modes: [{ id: 'lens', label: 'Lens' }, { id: 'mirror', label: 'Mirror' }, { id: 'refl', label: 'Plane mirror & reflection' }, { id: 'bench', label: 'Optics bench (lab)' }, { id: 'challenge', label: 'Can you make this image?' }],
  opts: [{ id: 'lt', label: 'Type', modes: ['lens'], choices: [['conv', 'Converging (convex)'], ['div', 'Diverging (concave)']] },
    { id: 'mt', label: 'Type', modes: ['mirror'], choices: [['cave', 'Concave'], ['vex', 'Convex'], ['plane', 'Plane']] },
    { id: 'ms', label: 'Lens', modes: ['bench'], choices: [['shown', 'f shown'], ['mystery', 'Mystery lens']] },
    { id: 'co', label: '', modes: ['challenge'], choices: [['conv', 'Conv. lens'], ['div', 'Div. lens'], ['cave', 'Concave'], ['vex', 'Convex']] },
    { id: 'rk', label: 'Show', modes: ['refl'], choices: [['full', 'Full-length mirror'], ['diff', 'Smooth vs rough surface']] }],
  ivs(mode, opt){
    if (mode === 'bench'){ const my = (opt && opt.ms) === 'mystery'; return [
      { id: 'so', sym: 's<sub>o</sub>', symText: 'so', label: 'Object distance', unit: 'cm', min: 8, max: 30, step: 0.5, val: 25, graph: true },
      { id: 'f', sym: 'f', symText: 'f', label: 'Focal length', unit: 'cm', min: 5, max: 15, step: 0.5, val: my ? 11.5 : 10, show: my ? () => 'hidden' : undefined },
      { id: 'ss', sym: 's<sub>screen</sub>', symText: 'screen', label: 'Screen position', unit: 'cm', min: 5, max: 70, step: 0.5, val: 40 }]; }
    if (mode === 'challenge') return [
      { id: 'so', sym: 's<sub>o</sub>', symText: 'so', label: 'Object distance', unit: 'cm', min: 2, max: 70, step: 0.5, val: 30, graph: true },
      { id: 'f', sym: '|f|', symText: '|f|', label: 'Focal length (size)', unit: 'cm', min: 5, max: 30, step: 0.5, val: 12 },
      { id: 'lv', sym: '', symText: 'level', label: 'Target level (1 easiest)', unit: '', min: 1, max: 3, step: 1, val: 1, show: x => 'Level ' + x }];
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
  presets: [{ label: 'Camera (beyond 2f)', mode: 'lens', v: { so: 40, f: 12 } }, { label: 'Projector (f to 2f)', mode: 'lens', v: { so: 16, f: 12 } }, { label: 'Magnifier (inside f)', mode: 'lens', v: { so: 7, f: 12 } }, { label: 'Makeup mirror', mode: 'mirror', v: { so: 8, f: 12 } }, { label: 'Step back', mode: 'refl', opt: { rk: 'full' }, v: { D: 280 } }, { label: 'Rough paper', mode: 'refl', opt: { rk: 'diff' }, v: { r: 80 } }, { label: 'Lab: far object', mode: 'bench', v: { so: 28, f: 10 } }, { label: 'Lab: closer object', mode: 'bench', v: { so: 16, f: 10 } }],
  calc(v, mode, opt){
    if (mode === 'bench'){ const f = v.f, si = Math.abs(v.so - f) < 1e-9 ? Infinity : 1 / (1 / f - 1 / v.so), real = isFinite(si) && si > 0, diff = real ? Math.abs(v.ss - si) : Infinity, M = isFinite(si) ? -si / v.so : Infinity;
      return { bench: true, f, si, real, M, diff, sharp: real && diff <= 0.75, blur: real ? (diff <= 0.75 ? 0 : Math.min(14, 3 + 1.6 * (diff - 0.75))) : 0, off: real && si > 70, mystery: (opt.ms || 'shown') === 'mystery' }; }
    if (mode === 'challenge'){ const kind = opt.co || 'conv', b = SIM.calc(Object.assign({ ho: 4 }, v), (kind === 'conv' || kind === 'div') ? 'lens' : 'mirror', { lt: kind, mt: kind }), T = chTarget(v), t = T.t, conv = kind === 'conv' || kind === 'cave';
      const okT = isFinite(b.si) && b.real === t.real, okO = isFinite(b.si) && (b.M < 0) === t.inv, okS = isFinite(b.M) && Math.abs(Math.abs(b.M) - Math.abs(t.M)) <= 0.1 * Math.abs(t.M), k = 1 - 1 / t.M, can = (k > 0) === conv;
      return Object.assign(b, { ch: true, t, conv, okT, okO, okS, all: okT && okO && okS, k, can }); }
    if (mode === 'refl'){ if (opt.rk === 'diff'){ const sp = v.r * 0.6; return { diff: true, sp }; }
      const e = v.Hp - 10; return { diff: false, e, L: v.Hp / 2, bot: e / 2, top: (v.Hp + e) / 2, si: -v.D }; }
    const kind = mode === 'lens' ? (opt.lt || 'conv') : (opt.mt || 'cave'), plane = kind === 'plane', f = plane ? Infinity : (kind === 'conv' || kind === 'cave' ? v.f : -v.f);
    const si = plane ? -v.so : (Math.abs(v.so - f) < 1e-9 ? Infinity : 1 / (1 / f - 1 / v.so)), M = isFinite(si) ? -si / v.so : Infinity, hi = M * v.ho;
    const real = isFinite(si) && si > 0, region = !isFinite(f) || f < 0 ? 'any' : v.so > 2 * f ? 'beyond 2f' : Math.abs(v.so - 2 * f) < 1e-9 ? 'at 2f' : v.so > f ? 'between f and 2f' : Math.abs(v.so - f) < 1e-9 ? 'at f' : 'inside f';
    return { kind, plane, f, si, M, hi, real, region };
  },
  dvs(mode, opt){
    if (mode === 'bench' && opt && opt.ms === 'mystery') return [{ id: 'x', name: '(no graph: f is hidden)', short: '', sym: '', unit: '', noTag: true, f: () => NaN }];
    if (mode === 'bench') return [{ id: 'si', name: 'Image distance', short: 'sᵢ', sym: 's<sub>i</sub>', unit: 'cm', f: d => isFinite(d.si) && Math.abs(d.si) < 400 ? d.si : NaN, negNote: 'virtual (sᵢ < 0)', signOK: 'The image switches between real and virtual.' }];
    if (mode === 'challenge') return [{ id: 'M', name: 'Magnification', short: 'M', sym: 'M', unit: '', f: d => isFinite(d.M) && Math.abs(d.M) < 20 ? d.M : NaN, signOK: 'The image flips between upright and inverted.' }, { id: 'si', name: 'Image distance', short: 'sᵢ', sym: 's<sub>i</sub>', unit: 'cm', f: d => isFinite(d.si) && Math.abs(d.si) < 400 ? d.si : NaN, negNote: 'virtual (sᵢ < 0)', signOK: 'The image switches between real and virtual.' }];
    if (mode === 'refl') return opt && opt.rk === 'diff' ? [{ id: 'sp', name: 'Spread of reflected rays', short: 'spread', sym: 'spread', unit: '°', f: d => d.sp }] : [{ id: 'L', name: 'Shortest mirror that works', short: 'L', sym: 'L', unit: 'cm', f: d => d.L }, { id: 'bot', name: 'Height of the bottom edge', short: 'bottom', sym: 'y', unit: 'cm', f: d => d.bot }];
    return [{ id: 'si', name: 'Image distance', short: 'sᵢ', sym: 's<sub>i</sub>', unit: 'cm', f: d => isFinite(d.si) && Math.abs(d.si) < 400 ? d.si : NaN, negNote: 'virtual (sᵢ < 0)', signOK: 'The image switches between real and virtual.' }, { id: 'M', name: 'Magnification', short: 'M', sym: 'M', unit: '', f: d => isFinite(d.M) && Math.abs(d.M) < 20 ? d.M : NaN, signOK: 'The image flips between upright and inverted.' }]; },
  work(v, d, mode, opt){
    if (mode === 'bench') return workBench(v, d, opt);
    if (mode === 'challenge') return workChallenge(v, d, opt);
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

const _baseDraw = SIM.draw;
SIM.draw = function(v, d, mode, opt, t, dt, A){
  if (mode === 'bench') return drawBench(v, d, opt, t, A);
  if (mode === 'challenge') return drawChallenge(v, d, opt, t, dt, A);
  return _baseDraw.apply(this, arguments);
};

// ---------- shared helpers for the two lab modes ----------
const OPF = '"Space Grotesk",sans-serif', OPM = '"IBM Plex Mono",monospace';
const BN = window._bn = window._bn || { pts: [], msg: '', msgT: -9, btn: [], cur: null };
const CHL = [
  [{ txt: 'real, inverted, twice as big', real: true, inv: true, M: -2 }, { txt: 'real, inverted, half size', real: true, inv: true, M: -0.5 }, { txt: 'virtual, upright, 3× bigger', real: false, inv: false, M: 3 }, { txt: 'real, inverted, the same size', real: true, inv: true, M: -1 }],
  [{ txt: 'virtual, upright, half size', real: false, inv: false, M: 0.5 }, { txt: 'real, inverted, 3× bigger', real: true, inv: true, M: -3 }, { txt: 'virtual, upright, 1.5× bigger', real: false, inv: false, M: 1.5 }, { txt: 'real, inverted, one quarter size', real: true, inv: true, M: -0.25 }],
  [{ txt: 'real, inverted, 4× bigger', real: true, inv: true, M: -4 }, { txt: 'virtual, upright, 5× bigger', real: false, inv: false, M: 5 }, { txt: 'virtual, upright, one quarter size', real: false, inv: false, M: 0.25 }, { txt: 'real, inverted, one third size', real: true, inv: true, M: -1 / 3 }]];
const CH = window._ch = window._ch || { i: [0, 0, 0] };
function chTarget(v){ const lv = Math.max(1, Math.min(3, Math.round(v.lv || 1))), L = CHL[lv - 1]; return { t: L[CH.i[lv - 1] % L.length], n: L.length, lv }; }
function chNew(){ const T = chTarget(S.v); let j = CH.i[T.lv - 1]; while (j === CH.i[T.lv - 1] && T.n > 1) j = Math.floor(Math.random() * T.n); CH.i[T.lv - 1] = j; S.anim = {}; update(); }
function wrapT(s, x, y, w, lh, o){ ctx.save(); ctx.font = o.font; const ws = s.split(' '); let line = '', yy = y; ws.forEach(word => { const tst = line ? line + ' ' + word : word; if (ctx.measureText(tst).width > w && line){ ctx.restore(); text(line, x, yy, o); ctx.save(); ctx.font = o.font; line = word; yy += lh; } else line = tst; }); ctx.restore(); text(line, x, yy, o); return yy + lh; }
function btnDraw(x, y, w, h, label, hot){ BN.btn.push({ x, y, w, h, label }); ctx.save(); ctx.fillStyle = hot ? '#ff6a2b' : '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); ctx.restore(); text(label, x + w / 2, y + h / 2 + 4.5, { align: 'center', font: '700 12px ' + OPF, col: hot ? '#fff' : '#111' }); }
function benchRecord(){ const c = BN.cur; if (!c) return; const { v, d } = c;
  if (!d.real) BN.msg = 'Virtual image: nothing on the screen'; else if (!d.sharp) BN.msg = 'Not sharp yet: slide the screen';
  else { const k = BN.pts.findIndex(p => Math.abs(p.so - v.so) < 0.01); if (k >= 0) BN.pts[k] = { so: v.so, si: v.ss, f: v.f }; else if (BN.pts.length >= 8){ BN.msg = 'Table full: clear it first'; BN.msgT = S.t; return update(); } else BN.pts.push({ so: v.so, si: v.ss, f: v.f }); BN.msg = 'Recorded sₒ = ' + fplain(v.so) + ', sᵢ = ' + fplain(v.ss); }
  BN.msgT = S.t; update(); }
function benchClear(){ BN.pts.length = 0; BN.msg = 'Table cleared'; BN.msgT = S.t; update(); }
const BACT = { 'Record point': () => S.mode === 'bench' && benchRecord(), 'Clear table': () => S.mode === 'bench' && benchClear(), 'New target': () => S.mode === 'challenge' && chNew() };
(function(){ const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 600, (e.clientY - r.top) / r.height * 330]; };
  const hit = e => { const [x, y] = pos(e); return BN.btn.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h); };
  cv.addEventListener('pointerdown', e => { const b = hit(e); if (b && BACT[b.label]){ BACT[b.label](); e.preventDefault(); } });
  cv.addEventListener('pointermove', e => { cv.style.cursor = hit(e) ? 'pointer' : ''; });
  document.addEventListener('keydown', e => { if (e.ctrlKey || e.metaKey || e.altKey) return; const k = e.key.toLowerCase(); if (S.mode === 'bench' && k === 'r') benchRecord(); else if (S.mode === 'bench' && k === 'c') benchClear(); else if (S.mode === 'challenge' && k === 'n') chNew(); }); })();
function lsq(pts){ const n = pts.length; if (n < 2) return null; let sx = 0, sy = 0, sxx = 0, sxy = 0; pts.forEach(([x, y]) => { sx += x; sy += y; sxx += x * x; sxy += x * y; }); const den = n * sxx - sx * sx; if (Math.abs(den) < 1e-12) return null; const m = (n * sxy - sx * sy) / den; return { m, b: (sy - m * sx) / n }; }

// ---------- Optics bench ----------
function workBench(v, d, opt){
  const pts = BN.pts, n = pts.length;
  let h = '<h4>1 · The thin-lens equation</h4><p class="st">Slide the screen until the image is sharp. Then the screen is exactly where the image forms, so the screen distance is sᵢ.</p>' + TEX`\frac{1}{s_o} + \frac{1}{s_i} = \frac{1}{f}` + '<h4>2 · This setup</h4>';
  if (d.mystery) h += '<p class="st">The lens’s f is hidden. Object at sₒ = ' + H.n(v.so, 'cm') + '. Find the sharp image, then record several points to measure f.</p>';
  else if (!isFinite(d.si)) h += '<div class="bad">Object at the focal point: the rays leave parallel, so there is no image on any screen.</div>';
  else { h += TEX`\frac{1}{s_i} = \frac{1}{f} - \frac{1}{s_o}` + TEX`\frac{1}{s_i} = \frac{1}{${M.n(v.f, 'cm')}} - \frac{1}{${M.iv('so')}}` + TEXA`s_i = ${M.n(d.si, 'cm')}`;
    h += d.real ? '<p class="st">Sharp when the screen is at ' + H.n(d.si, 'cm') + '. It is now at ' + H.n(v.ss, 'cm') + (d.sharp ? ': <b>sharp</b>.' : ': ' + H.n(d.diff, 'cm') + ' off, so blurry.') + (d.off ? ' (That is beyond the end of the bench.)' : '') + '</p>'
      : '<div class="bad">sᵢ is negative: the image is virtual, on the same side as the object. Rays do not meet, so a screen shows nothing. Look <i>through</i> the lens instead.</div>'; }
  h += '<h4>3 · Your data</h4>';
  if (n < 2) return h + '<p class="st">Record at least two sharp images (different sₒ). Use <b>Record point</b> on the picture (or press R). Points so far: ' + n + '.</p>';
  const q = pts.map(p => [1 / p.so, 1 / p.si]), L = lsq(q);
  if (!L) return h + '<p class="st">Use different object distances so the points spread out along a line.</p>';
  h += '<p class="st">Rearranged, the thin-lens equation is a straight line when you plot 1/sᵢ against 1/sₒ:</p>' + TEX`\frac{1}{s_i} = -\frac{1}{s_o} + \frac{1}{f}` + '<p class="st">So the slope should be −1 and the intercept on the vertical axis is 1/f. Best-fit line through your ' + n + ' points:</p>' + TEX`\text{slope} = ${M.n(L.m)}` + TEX`\text{intercept} = ${M.n(L.b, 'cm⁻¹')}`;
  if (L.b <= 0.003) return h + '<div class="bad">The intercept is about zero, so these points do not fit a lens well. Clear the table and re-measure.</div>';
  h += '<h4>4 · Focal length from the intercept</h4>' + TEX`f = \frac{1}{\text{intercept}}` + TEX`f = \frac{1}{${M.n(L.b)}}` + TEXA`f = ${M.n(1 / L.b, 'cm')}`;
  const fs = pts.map(p => p.so * p.si / (p.so + p.si)), fm = fs.reduce((a, b) => a + b, 0) / n;
  h += '<p class="st">Check each point on its own:</p>' + TEX`f = \frac{s_o\,s_i}{s_o + s_i}` + '<p class="st">Average of your points: ' + H.n(fm, 'cm') + '.</p>';
  h += d.mystery ? '<p class="note">Switch Lens to “f shown” to see how close you got.</p>' : '<p class="note">The lens’s real f is ' + H.n(v.f, 'cm') + ': your intercept is off by ' + fnum(Math.abs(1 / L.b - v.f) / v.f * 100) + '%.</p>';
  return h;
}
function drawBench(v, d, opt, t, A){
  BN.btn = []; BN.cur = { v, d };
  const X = cm => 14 + cm * 3.6, ay = 150, kx = 6, XL = X(30), xo = X(30 - v.so), xs = X(30 + v.ss), ho = 5 * kx;
  panelTitle('OPTICS BENCH: SLIDE THE SCREEN UNTIL SHARP', 10, 18);
  ctx.save(); ctx.beginPath(); ctx.rect(12, 100, 372, 106); ctx.clip();
  ctx.strokeStyle = '#c9c4b8'; ctx.lineWidth = 1; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(X(0), ay); ctx.lineTo(X(100), ay); ctx.stroke(); ctx.setLineDash([]);
  // rays for a real image
  const yi = ay - (isFinite(d.M) ? d.M * ho : 0), xi = XL + d.si * 3.6;
  if (d.real){ ctx.strokeStyle = 'rgba(196,58,0,0.5)'; ctx.lineWidth = 1.3; [[XL, ay - ho], [XL, ay]].forEach(([mx, my]) => { const dx = xi - mx, dy = yi - my, L = 600 / Math.max(1, Math.abs(dx)); ctx.beginPath(); ctx.moveTo(xo, ay - ho); ctx.lineTo(mx, my); ctx.lineTo(mx + dx * Math.min(L, 3), my + dy * Math.min(L, 3)); ctx.stroke(); }); }
  // lens
  ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(XL, ay - 48); ctx.lineTo(XL, ay + 48); ctx.stroke(); [-1, 1].forEach(sg => { const ye = ay + sg * 48; ctx.beginPath(); ctx.moveTo(XL - 7, ye - sg * 7); ctx.lineTo(XL, ye); ctx.lineTo(XL + 7, ye - sg * 7); ctx.stroke(); });
  // screen
  ctx.fillStyle = '#ece8dc'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(xs - 3, ay - 48, 6, 96); ctx.strokeRect(xs - 3, ay - 48, 6, 96);
  ctx.restore();
  arrow(xo, ay, xo, ay - ho, '#1e7d45', null, { w: 3.5 });
  ctx.save(); ctx.fillStyle = 'rgba(255,200,40,0.35)'; ctx.beginPath(); ctx.arc(xo, ay - ho, 7, 0, 7); ctx.fill(); ctx.restore();
  text('lit object', xo, ay - ho - 10, { align: 'center', font: '700 11px ' + OPF, col: '#1e7d45' });
  text(d.mystery ? 'f = ?' : 'f = ' + fplain(v.f) + ' cm', XL, 94, { align: 'center', font: '700 11px ' + OPF, col: '#1546d6' });
  text('screen', xs, ay - 54, { align: 'center', font: '700 11px ' + OPF, col: '#111' });
  // metre stick
  const ry = 208; ctx.fillStyle = '#f4e9b8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(X(0) - 4, ry, 368, 26); ctx.strokeRect(X(0) - 4, ry, 368, 26);
  ctx.lineWidth = 1; for (let c = 0; c <= 100; c++){ const lh = c % 10 === 0 ? 10 : c % 5 === 0 ? 7 : 4; ctx.beginPath(); ctx.moveTo(X(c), ry); ctx.lineTo(X(c), ry + lh); ctx.stroke(); if (c % 10 === 0) text(String(c), X(c), ry + 22, { align: 'center', font: '500 9px ' + OPM }); }
  [[X(30 - v.so), '#1e7d45'], [XL, '#1546d6'], [xs, '#7a3fb0']].forEach(([x, col]) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, ry + 27); ctx.lineTo(x - 5, ry + 36); ctx.lineTo(x + 5, ry + 36); ctx.closePath(); ctx.fill(); });
  text('sₒ = ' + fplain(v.so) + ' cm', 14, 262, { font: '700 13px ' + OPF, col: '#1e7d45' }); text('screen is ' + fplain(v.ss) + ' cm past the lens', 120, 262, { font: '700 13px ' + OPF, col: '#7a3fb0' });
  const st = !d.real ? ['Virtual image: nothing appears on a screen', '#c43a00'] : d.sharp ? ['SHARP: record it!', '#1e7d45'] : d.off ? ['Image is beyond the end of the bench', '#c43a00'] : ['Blurry: slide the screen ' + (v.ss < d.si ? 'farther' : 'closer'), '#c43a00'];
  text(st[0], 14, 282, { font: '700 13px ' + OPF, col: st[1] });
  btnDraw(14, 292, 96, 26, 'Record point', S.t - BN.msgT < 0.25); btnDraw(118, 292, 90, 26, 'Clear table', false);
  if (S.t - BN.msgT < 3.5) text(BN.msg, 216, 309, { font: '600 10.5px ' + OPF, col: '#4a4a4a' }); else text('keys: R record, C clear', 216, 309, { font: '500 10px ' + OPM, col: '#8a8a8a' });
  // face-on view of the screen
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(296, 24, 88, 70); ctx.strokeRect(296, 24, 88, 70);
  text('screen view', 340, 106, { align: 'center', font: '600 9.5px ' + OPM, col: '#4a4a4a' });
  if (d.real && !d.off){ ctx.save(); ctx.beginPath(); ctx.rect(297, 25, 86, 68); ctx.clip(); const hh = -d.M * 4 * 6 * 0.5, k = Math.min(1, 28 / Math.max(1, Math.abs(hh)));
    if (d.blur > 0){ if ('filter' in ctx) ctx.filter = 'blur(' + (d.blur * 0.8) + 'px)'; else { ctx.shadowColor = '#7a3fb0'; ctx.shadowBlur = d.blur * 2; } }
    ctx.globalAlpha = d.blur > 0 ? Math.max(0.4, 1 - d.blur / 18) : 1; arrow(340, 60, 340, 60 + hh * k, '#7a3fb0', null, { w: d.blur > 0 ? 6 : 3.5 }); ctx.restore(); }
  else text(d.real ? 'beyond bench' : 'no image', 340, 62, { align: 'center', font: '700 11px ' + OPF, col: '#8a8a8a' });
  // data table
  panelTitle('DATA TABLE', 395, 18);
  [['sₒ', 440], ['sᵢ', 480], ['1/sₒ', 535], ['1/sᵢ', 592]].forEach(([a, x]) => text(a, x, 33, { align: 'right', font: '700 10px ' + OPM, col: '#4a4a4a' })); text('cm', 400, 33, { font: '500 9px ' + OPM, col: '#8a8a8a' });
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(396, 37); ctx.lineTo(596, 37); ctx.stroke();
  BN.pts.forEach((p, i) => { const y = 49 + i * 12; text(String(i + 1), 400, y, { font: '500 10px ' + OPM, col: '#8a8a8a' }); text(fplain(p.so), 440, y, { align: 'right', font: '600 11px ' + OPM }); text(fplain(p.si), 480, y, { align: 'right', font: '600 11px ' + OPM }); text((1 / p.so).toFixed(3), 535, y, { align: 'right', font: '600 11px ' + OPM }); text((1 / p.si).toFixed(3), 592, y, { align: 'right', font: '600 11px ' + OPM }); });
  if (!BN.pts.length) text('(empty: record a sharp image)', 400, 53, { font: '500 10.5px ' + OPF, col: '#8a8a8a' });
  // plot of 1/si vs 1/so
  const q = BN.pts.map(p => [1 / p.so, 1 / p.si]), L = lsq(q), px0 = 428, px1 = 584, py0 = 292, py1 = 192, PX = x => px0 + x / 0.2 * (px1 - px0), PY = y => py0 - y / 0.2 * (py0 - py1);
  panelTitle('1/sᵢ vs 1/sₒ (cm⁻¹)', 395, 176);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px0, py1 - 4); ctx.lineTo(px0, py0); ctx.lineTo(px1 + 4, py0); ctx.stroke();
  [0, 0.1, 0.2].forEach(x => { text(x === 0 ? '0' : String(x), PX(x), py0 + 12, { align: 'center', font: '500 9px ' + OPM, col: '#4a4a4a' }); text(x === 0 ? '' : String(x), px0 - 4, PY(x) + 3, { align: 'right', font: '500 9px ' + OPM, col: '#4a4a4a' }); ctx.strokeStyle = '#e3e0d6'; ctx.beginPath(); ctx.moveTo(px0, PY(x)); ctx.lineTo(px1, PY(x)); ctx.moveTo(PX(x), py0); ctx.lineTo(PX(x), py1); ctx.stroke(); });
  text('1/sₒ', px1 + 2, py0 + 24, { align: 'right', font: '700 10px ' + OPF }); text('1/sᵢ', px0 + 4, py1 - 4, { font: '700 10px ' + OPF });
  if (L){ ctx.save(); ctx.beginPath(); ctx.rect(px0, py1 - 4, px1 - px0 + 4, py0 - py1 + 4); ctx.clip(); ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PX(0), PY(L.b)); ctx.lineTo(PX(0.2), PY(L.m * 0.2 + L.b)); ctx.stroke(); ctx.restore();
    text('slope ' + fplain(L.m) + ' · intercept ' + fplain(L.b), 395, 148, { font: '600 11px ' + OPF, col: '#1546d6' }); if (L.b > 0.003) text('f = 1/intercept ≈ ' + fplain(1 / L.b) + ' cm', 395, 161, { font: '700 11.5px ' + OPF, col: '#1546d6' }); }
  q.forEach(([x, y]) => { ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(PX(x), PY(y), 3.8, 0, 7); ctx.fill(); ctx.stroke(); });
  if (!L) text(BN.pts.length ? 'need 2+ points for a line' : 'points will appear here', (px0 + px1) / 2, 235, { align: 'center', font: '500 10.5px ' + OPF, col: '#8a8a8a' });
}

// ---------- Can you make this image? ----------
function workChallenge(v, d, opt){
  const nm = { conv: 'converging lens', div: 'diverging lens', cave: 'concave mirror', vex: 'convex mirror' }[d.kind], t = d.t, Mt = t.M;
  let h = '<h4>1 · The target</h4><p class="st"><b>' + t.txt + '</b></p>' + TEXA`M_{\text{target}} = ${M.n(Mt)}` + '<p class="st">Real = inverted. Upright = virtual.</p>';
  h += '<h4>2 · Your ' + nm + '</h4><p class="st">' + (d.conv ? 'Converging → positive f.' : 'Diverging → negative f.') + '</p>';
  if (!isFinite(d.si)) h += '<div class="bad">Object at the focal point: no image (it is “at infinity”). Move the object.</div>';
  else {
    h += TEX`\frac{1}{s_i} = \frac{1}{f} - \frac{1}{s_o}` + TEX`\frac{1}{s_i} = \frac{1}{${M.p(d.f, 'cm')}} - \frac{1}{${M.iv('so')}}` + TEXA`s_i = ${M.n(d.si, 'cm')}` + TEX`M = -\frac{s_i}{s_o}` + TEX`M = -\frac{${M.p(d.si)}}{${M.n(v.so)}}` + TEXA`M = ${M.n(d.M)}`;
    h += '<p class="st">Your image: <b>' + (d.real ? 'real' : 'virtual') + ', ' + (d.M < 0 ? 'inverted' : 'upright') + ', ×' + fnum(Math.abs(d.M)) + '</b>.</p>';
  }
  h += '<h4>3 · Checklist</h4><p class="st">' + (d.okT ? '✓' : '✗') + ' real or virtual · ' + (d.okO ? '✓' : '✗') + ' upright or inverted · ' + (d.okS ? '✓' : '✗') + ' size within 10% of ×' + fnum(Math.abs(Mt)) + '</p>';
  if (d.all) return h + '<div class="ok"><b>Match!</b> All three agree. Press New target for another.</div>' + '<p class="st">Check with the formula:</p>' + TEX`s_o = f\left(1 - \frac{1}{M}\right)` + TEX`s_o = ${M.p(d.f, 'cm')}\left(1 - \frac{1}{${M.p(Mt)}}\right)` + TEXA`s_o = ${M.n(d.f * (1 - 1 / Mt), 'cm')}` + '<p class="note">Your sₒ is close to this.</p>';
  h += '<h4>4 · Can this optic do it?</h4>';
  if (!d.can) h += '<div class="bad">' + (d.conv ? 'No. A ' + nm + ' makes either a real inverted image, or a virtual upright image that is <b>bigger</b> than the object. It never makes a smaller upright image. Try a diverging lens or a convex mirror.'
    : 'No. A ' + nm + ' has f &lt; 0, so 1/sᵢ = 1/f − 1/sₒ is always negative: sᵢ &lt; 0. The image is always <b>virtual, upright and smaller</b>. For a real image or a bigger one, pick a converging lens or a concave mirror.') + '</div>';
  else h += '<p class="st">Yes. Use M = −sᵢ/sₒ to write sᵢ = −M·sₒ, put it in the thin-lens equation and solve for sₒ:</p>' + TEX`s_i = -M\,s_o` + TEX`\frac{1}{s_o} - \frac{1}{M\,s_o} = \frac{1}{f}` + TEXA`s_o = f\left(1 - \frac{1}{M}\right)` + '<p class="note">Put in the target M and your f (with its sign), then set sₒ. Fine-tune f too.</p>';
  return h;
}
function drawChallenge(v, d, opt, t, dt, A){
  BN.btn = [];
  const mode = (d.kind === 'conv' || d.kind === 'div') ? 'lens' : 'mirror';
  _baseDraw(Object.assign({ ho: 4 }, v), d, mode, opt, t, dt, A);
  ctx.fillStyle = '#fbfbfb'; ctx.fillRect(390, 0, 210, 330);
  const T = d.t, nm = { conv: 'converging lens', div: 'diverging lens', cave: 'concave mirror', vex: 'convex mirror' }[d.kind];
  panelTitle('TARGET IMAGE', 395, 18);
  wrapT(T.txt, 395, 38, 200, 16, { font: '700 14px ' + OPF, col: '#7a3fb0' });
  text('want', 505, 84, { align: 'right', font: '700 10px ' + OPM, col: '#4a4a4a' }); text('yours', 568, 84, { align: 'right', font: '700 10px ' + OPM, col: '#4a4a4a' });
  const fin = isFinite(d.si), rows = [['type', T.real ? 'real' : 'virtual', fin ? (d.real ? 'real' : 'virtual') : '—', d.okT], ['facing', T.inv ? 'inverted' : 'upright', fin ? (d.M < 0 ? 'inverted' : 'upright') : '—', d.okO], ['size (±10%)', '×' + fplain(Math.abs(T.M)), fin ? '×' + fplain(Math.abs(d.M)) : '—', d.okS]];
  rows.forEach(([a, w, y, ok], i) => { const yy = 106 + i * 24; text(a, 395, yy, { font: '600 12px ' + OPF, col: '#4a4a4a' }); text(w, 505, yy, { align: 'right', font: '700 11px ' + OPM }); text(y, 568, yy, { align: 'right', font: '700 11px ' + OPM, col: ok ? '#1e7d45' : '#c43a00' }); text(ok ? '✓' : '✗', 578, yy, { font: '700 15px ' + OPF, col: ok ? '#1e7d45' : '#c43a00' }); });
  text(nm + ', |f| = ' + fplain(v.f) + ' cm', 395, 188, { font: '600 11px ' + OPF, col: '#1546d6' });
  if (d.all){ A.win = (A.win || 0) + dt; ctx.fillStyle = '#e5f4ea'; ctx.fillRect(395, 198, 200, 34); ctx.fillStyle = '#1e7d45'; ctx.fillRect(395, 198, 4, 34); text('Match! All three ✓', 408, 220, { font: '700 15px ' + OPF, col: '#1e7d45' });
    const cols = ['#ff6a2b', '#1546d6', '#1e7d45', '#7a3fb0', '#c43a00']; for (let i = 0; i < 16; i++){ const x = 395 + (i * 37.7 + Math.sin(i * 3.1) * 14) % 200, y = ((A.win * 60 + i * 53) % 340) - 10; ctx.save(); ctx.translate(x, y); ctx.rotate(A.win * 3 + i); ctx.fillStyle = cols[i % 5]; ctx.fillRect(-3, -2, 6, 4); ctx.restore(); }
    ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, 596, 326); }
  else { A.win = 0; if (!d.can) wrapT(d.conv ? 'This optic never makes a smaller upright image.' : 'A diverging optic only makes virtual, upright, smaller images.', 395, 206, 200, 14, { font: '600 11px ' + OPF, col: '#c43a00' }); else if (!fin) text('Object at F: no image. Move it.', 395, 206, { font: '600 11px ' + OPF, col: '#c43a00' }); else text('Adjust sₒ and f to match.', 395, 206, { font: '600 11px ' + OPF, col: '#4a4a4a' }); }
  btnDraw(395, 292, 96, 26, 'New target', false); text('Level ' + v.lv + ' · key N', 500, 309, { font: '500 10px ' + OPM, col: '#8a8a8a' });
}

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
