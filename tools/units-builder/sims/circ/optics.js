// Mirrors & Lenses (AP 13.2, 13.4): ray diagrams with the three principal rays, 1/sₒ + 1/sᵢ = 1/f, magnification, and where cameras, projectors, magnifiers and mirrors fit.
const SIM = {
  title: 'Mirrors & Lenses',
  hint: '1/sₒ + 1/sᵢ = 1/f · M = −sᵢ/sₒ',
  modes: [{ id: 'lens', label: 'Lens' }, { id: 'mirror', label: 'Mirror' }],
  opts: [{ id: 'lt', label: 'Type', modes: ['lens'], choices: [['conv', 'Converging (convex)'], ['div', 'Diverging (concave)']] },
    { id: 'mt', label: 'Type', modes: ['mirror'], choices: [['cave', 'Concave'], ['vex', 'Convex'], ['plane', 'Plane']] }],
  ivs(mode, opt){
    const plane = mode === 'mirror' && (opt && opt.mt) === 'plane', a = [
      { id: 'so', sym: 's<sub>o</sub>', symText: 'so', label: 'Object distance', unit: 'cm', min: 2, max: 70, step: 0.5, val: 30, graph: true },
      { id: 'ho', sym: 'h<sub>o</sub>', symText: 'ho', label: 'Object height', unit: 'cm', min: 1, max: 6, step: 0.5, val: 4 }];
    if (!plane) a.splice(1, 0, { id: 'f', sym: '|f|', symText: '|f|', label: 'Focal length (size)', unit: 'cm', min: 5, max: 30, step: 0.5, val: 12 });
    return a;
  },
  presets: [{ label: 'Camera (beyond 2f)', mode: 'lens', v: { so: 40, f: 12 } }, { label: 'Projector (f to 2f)', mode: 'lens', v: { so: 16, f: 12 } }, { label: 'Magnifier (inside f)', mode: 'lens', v: { so: 7, f: 12 } }, { label: 'Makeup mirror', mode: 'mirror', v: { so: 8, f: 12 } }],
  calc(v, mode, opt){
    const kind = mode === 'lens' ? (opt.lt || 'conv') : (opt.mt || 'cave'), plane = kind === 'plane', f = plane ? Infinity : (kind === 'conv' || kind === 'cave' ? v.f : -v.f);
    const si = plane ? -v.so : (Math.abs(v.so - f) < 1e-9 ? Infinity : 1 / (1 / f - 1 / v.so)), M = isFinite(si) ? -si / v.so : Infinity, hi = M * v.ho;
    const real = isFinite(si) && si > 0, region = !isFinite(f) || f < 0 ? 'any' : v.so > 2 * f ? 'beyond 2f' : Math.abs(v.so - 2 * f) < 1e-9 ? 'at 2f' : v.so > f ? 'between f and 2f' : Math.abs(v.so - f) < 1e-9 ? 'at f' : 'inside f';
    return { kind, plane, f, si, M, hi, real, region };
  },
  dvs(){ return [{ id: 'si', name: 'Image distance', short: 'sᵢ', sym: 's<sub>i</sub>', unit: 'cm', f: d => isFinite(d.si) && Math.abs(d.si) < 400 ? d.si : NaN, negNote: 'virtual (sᵢ < 0)', signOK: 'The image switches between real and virtual.' }, { id: 'M', name: 'Magnification', short: 'M', sym: 'M', unit: '', f: d => isFinite(d.M) && Math.abs(d.M) < 20 ? d.M : NaN, signOK: 'The image flips between upright and inverted.' }]; },
  work(v, d, mode){
    const nm = { conv: 'converging lens', div: 'diverging lens', cave: 'concave mirror', vex: 'convex mirror', plane: 'plane mirror' }[d.kind];
    if (d.plane) return '<h4>Plane mirror</h4><div class="eq">The image is as far behind the mirror as the object is in front: sᵢ = −sₒ = <b>' + H.n(d.si, 'cm') + '</b>; M = +1.</div><p class="note">Virtual, upright, same size, left–right reversed. A full-length mirror only needs to be half your height.</p>';
    if (!isFinite(d.si)) return '<h4>Object at the focal point</h4><div class="bad">1/sᵢ = 1/f − 1/sₒ = 0, so the reflected or refracted rays come out parallel: no image forms (it is “at infinity”). Lighthouses and headlights put the bulb here.</div>';
    const desc = [d.real ? 'real' : 'virtual', d.M < 0 ? 'inverted' : 'upright', Math.abs(Math.abs(d.M) - 1) < 0.01 ? 'same size' : Math.abs(d.M) > 1 ? 'enlarged' : 'reduced'].join(', ');
    const use = d.kind === 'conv' ? { 'beyond 2f': 'camera or eye: small real image on the sensor/retina', 'at 2f': 'photocopier at 100%', 'between f and 2f': 'projector: big real image on a screen', 'inside f': 'magnifying glass: big virtual image' }[d.region]
      : d.kind === 'cave' ? { 'beyond 2f': 'telescope mirror', 'at 2f': 'image same size, at 2f', 'between f and 2f': 'stage spotlight / projector', 'inside f': 'makeup or shaving mirror' }[d.region]
      : d.kind === 'vex' ? 'security and car side mirrors: wide view, small upright image (“objects are closer than they appear”)' : 'eyeglasses for nearsighted people; peepholes';
    return '<h4>1 · Sign of f</h4><div class="eq">A ' + nm + ' has f = <b>' + (d.f > 0 ? '+' : '−') + fnum(Math.abs(d.f)) + ' cm</b> (' + (d.f > 0 ? 'converging → positive' : 'diverging → negative') + ').</div>' +
      '<h4>2 · Image distance</h4><div class="eq">1/sᵢ = 1/f − 1/sₒ = 1/(' + fnum(d.f) + ') − 1/' + H.iv('so') + ' → sᵢ = <b>' + H.n(d.si, 'cm') + '</b>' + (d.si > 0 ? (mode === 'lens' ? ' (opposite side from the object)' : ' (in front of the mirror)') : (mode === 'lens' ? ' (same side as the object)' : ' (behind the mirror)')) + '</div>' +
      '<h4>3 · Magnification</h4><div class="eq">M = −sᵢ/sₒ = −(' + fnum(d.si) + ')/' + fnum(v.so) + ' = <b>' + fnum(d.M) + '</b> → hᵢ = M hₒ = ' + H.n(d.hi, 'cm') + '</div>' +
      '<h4>4 · Describe it</h4><div class="eq"><b>' + desc + '</b></div>' + (d.region !== 'any' ? '<p class="note">Object ' + d.region + '. Use: ' + use + '.</p>' : '<p class="note">A ' + nm + ' always gives a virtual, upright, reduced image. Use: ' + use + '.</p>') +
      '<p class="note">Check the ray diagram: real images are where the rays actually cross; virtual images are where the dashed extensions cross.</p>';
  },
  draw(v, d, mode){
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
