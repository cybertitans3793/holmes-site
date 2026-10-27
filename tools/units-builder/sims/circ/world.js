// Refraction in the World (AP 13.3, 14.3; IB C.3 applications): dispersion in a prism, how a raindrop makes a rainbow, mirages over hot roads, and apparent depth (spear fishing).
function wlRGB(l){ let r = 0, g = 0, b = 0; if (l < 440){ r = (440 - l) / 60; b = 1; } else if (l < 490){ g = (l - 440) / 50; b = 1; } else if (l < 510){ g = 1; b = (510 - l) / 20; } else if (l < 580){ r = (l - 510) / 70; g = 1; } else if (l < 645){ r = 1; g = (645 - l) / 65; } else r = 1;
  return 'rgb(' + [r, g, b].map(c => Math.round(255 * Math.max(0, Math.min(1, c)))).join(',') + ')'; }
const V = { add: (a, b) => [a[0] + b[0], a[1] + b[1]], sub: (a, b) => [a[0] - b[0], a[1] - b[1]], mul: (a, k) => [a[0] * k, a[1] * k], dot: (a, b) => a[0] * b[0] + a[1] * b[1], norm: a => { const l = Math.hypot(a[0], a[1]); return [a[0] / l, a[1] / l]; }, rot: (a, t) => [a[0] * Math.cos(t) - a[1] * Math.sin(t), a[0] * Math.sin(t) + a[1] * Math.cos(t)] };
// refract unit direction d through a surface with unit normal nrm facing the incoming side; null = total internal reflection
function refr(d, nrm, n1, n2){ const eta = n1 / n2, ci = -V.dot(d, nrm), s2 = eta * eta * (1 - ci * ci); if (s2 > 1) return null; return V.add(V.mul(d, eta), V.mul(nrm, eta * ci - Math.sqrt(1 - s2))); }
const GLASS = { crown: ['crown glass', 1.504, 4240], flint: ['flint glass', 1.6227, 8746], water: ['water', 1.3245, 3150] }; // n(λ) = a + b/λ² (λ in nm)
const nOf = (m, l) => GLASS[m][1] + GLASS[m][2] / (l * l);
const SIM = {
  title: 'Refraction in the World',
  hint: 'n depends on colour · light bends toward higher n',
  modes: [{ id: 'prism', label: 'Prism' }, { id: 'rain', label: 'Rainbow' }, { id: 'mirage', label: 'Mirage' }, { id: 'depth', label: 'Apparent depth' }],
  opts: [{ id: 'mat', label: 'Glass', modes: ['prism'], choices: [['crown', 'Crown'], ['flint', 'Flint']] }],
  ivs(mode){
    if (mode === 'rain') return [{ id: 'b', sym: 'b', symText: 'b', label: 'Where the sunlight hits the drop (0 = centre, 1 = edge)', unit: '', min: 0, max: 0.99, step: 0.01, val: 0.86, graph: true, show: x => x.toFixed(2) }];
    if (mode === 'mirage') return [
      { id: 'dT', sym: 'ΔT', symText: 'ΔT', label: 'How much hotter the road is than the air', unit: '°C', min: 0, max: 40, step: 1, val: 25 },
      { id: 'a', sym: 'α', symText: 'α', label: 'Angle you look below horizontal', unit: '°', min: 0.05, max: 0.8, step: 0.01, val: 0.3, graph: true }];
    if (mode === 'depth') return [
      { id: 'd', sym: 'd', symText: 'd', label: 'Real depth of the fish', unit: 'm', min: 0.2, max: 2, step: 0.05, val: 1 },
      { id: 'x', sym: 'x', symText: 'x', label: 'Fish’s distance out from you', unit: 'm', min: 0, max: 3, step: 0.05, val: 1.5, graph: true },
      { id: 'h', sym: 'h', symText: 'h', label: 'Your eye height above the water', unit: 'm', min: 0.5, max: 2, step: 0.05, val: 1.5 }];
    return [
      { id: 'th', sym: 'θ<sub>1</sub>', symText: 'θ1', label: 'Angle of incidence on the first face', unit: '°', min: 20, max: 80, step: 0.5, val: 50, graph: true },
      { id: 'A', sym: 'A', symText: 'A', label: 'Apex angle of the prism', unit: '°', min: 30, max: 70, step: 1, val: 60 }];
  },
  presets: [{ label: 'Rainbow ray (42°)', mode: 'rain', v: { b: 0.86 } }, { label: 'Ray through the centre', mode: 'rain', v: { b: 0 } }, { label: 'Hot road, mirage', mode: 'mirage', v: { dT: 25, a: 0.3 } }, { label: 'Fish straight below', mode: 'depth', v: { x: 0 } }],
  calc(v, mode, opt){
    if (mode === 'prism'){ const m = opt.mat || 'crown', one = l => { const n = nOf(m, l), r1 = Math.asin(Math.sin(v.th * DEG) / n), r2 = v.A * DEG - r1, s = n * Math.sin(r2); if (s > 1) return { n, tir: true }; const t2 = Math.asin(s); return { n, r1: r1 / DEG, r2: r2 / DEG, t2: t2 / DEG, dev: v.th + t2 / DEG - v.A }; };
      const R = one(656), Vi = one(410), Y = one(589); return { m, R, Vi, Y, spread: R.tir || Vi.tir ? NaN : Vi.dev - R.dev }; }
    if (mode === 'rain'){ const one = l => { const n = nOf('water', l), i = Math.asin(v.b), r = Math.asin(v.b / n), D = 180 + 2 * i / DEG - 4 * r / DEG; return { n, i: i / DEG, r: r / DEG, D, ang: 180 - D }; };
      const peak = l => { const n = nOf('water', l), ic = Math.acos(Math.sqrt((n * n - 1) / 3)); return 4 * Math.asin(Math.sin(ic) / n) / DEG - 2 * ic / DEG; };
      return { R: one(656), Vi: one(410), Y: one(589), pR: peak(656), pV: peak(410) }; }
    if (mode === 'mirage'){ const T0 = 293, nT = T => 1 + 2.93e-4 * T0 / T, Tz = z => T0 + v.dT * Math.exp(-z / 0.3), nz = z => nT(Tz(z)), h = 1.6, C = nz(h) * Math.cos(v.a * DEG), n0 = nz(0);
      const amax = Math.acos(Math.min(1, n0 / nz(h))) / DEG, ok = C >= n0;
      // trace the ray: n cos θ = constant
      const pts = [[0, h]]; let x = 0, z = h, dir = -1, turnX = NaN, hitX = NaN; const dx = 0.5;
      for (let k = 0; k < 1200 && x < 400; k++){ const c = Math.min(1, C / nz(z)), t = Math.tan(Math.acos(c)); if (dir < 0 && c >= 0.999999999 && isNaN(turnX)){ dir = 1; turnX = x; } z += dir * Math.max(t, 1e-5) * dx; x += dx; if (z <= 0){ hitX = x; pts.push([x, 0]); break; } pts.push([x, z]); if (dir > 0 && z > 3) break; }
      return { n0, nh: nz(h), C, amax, ok, pts, turnX, hitX, h, straight: h / Math.tan(v.a * DEG) }; }
    // apparent depth: find where the ray from the fish crosses the surface so it reaches the eye
    const n = 1.33, f = s => { const ta = s / v.d, si = Math.sin(Math.atan(ta)), so = n * si; if (so >= 1) return 1e9; return s + v.h * Math.tan(Math.asin(so)) - v.x; };
    let lo = 0, hi = v.x; for (let k = 0; k < 60; k++){ const mid = (lo + hi) / 2; f(mid) > 0 ? hi = mid : lo = mid; }
    const s = (lo + hi) / 2, tw = Math.atan(s / v.d), ta = Math.asin(Math.min(1, n * Math.sin(tw))), app = s > 1e-4 ? s / Math.tan(ta) : v.d / n;
    return { n, s, tw: tw / DEG, ta: ta / DEG, app, simple: v.d / n };
  },
  dvs(mode){
    if (mode === 'rain') return [{ id: 'ang', name: 'Angle from the point opposite the sun (red)', short: 'angle', sym: 'angle', unit: '°', f: d => d.R.ang }];
    if (mode === 'mirage') return [{ id: 'turn', name: 'Distance to where the ray turns (the “puddle”)', short: 'x', sym: 'x<sub>mirage</sub>', unit: 'm', f: d => d.ok ? d.turnX : NaN }];
    if (mode === 'depth') return [{ id: 'app', name: 'Apparent depth', short: 'd′', sym: 'd′', unit: 'm', f: d => d.app }];
    return [{ id: 'dev', name: 'Deviation of yellow light', short: 'δ', sym: 'δ', unit: '°', f: d => d.Y.tir ? NaN : d.Y.dev }, { id: 'sp', name: 'Spread between red and violet', short: 'Δδ', sym: 'Δδ', unit: '°', f: d => d.spread }];
  },
  work(v, d, mode){
    if (mode === 'prism'){ const row = (nm, o) => o.tir ? '<div class="bad">' + nm + ' (n = ' + fnum(o.n) + '): total internal reflection at the second face.</div>' : '<div class="eq">' + nm + ' (n = ' + fnum(o.n) + '): r₁ = ' + fnum(o.r1) + '°, r₂ = A − r₁ = ' + fnum(o.r2) + '°, θ₂ = <b>' + fnum(o.t2) + '°</b>, deviation δ = θ₁ + θ₂ − A = <b>' + fnum(o.dev) + '°</b></div>';
      return '<h4>1 · Dispersion: n depends on wavelength</h4><div class="eq">In ' + GLASS[d.m][0] + ', violet light travels slower than red, so n<sub>violet</sub> > n<sub>red</sub> and violet bends more.</div>' +
        '<h4>2 · Snell’s law at both faces</h4><div class="eq">Face 1: sin θ₁ = n sin r₁. Inside, r₁ + r₂ = A. Face 2: n sin r₂ = sin θ₂.</div>' + row('Red 656 nm', d.R) + row('Violet 410 nm', d.Vi) +
        (isFinite(d.spread) ? '<div class="eq">Spread of the spectrum: <b>' + H.n(d.spread, '°') + '</b></div>' : '') +
        '<p class="note">Newton used a prism to show white light is a mix of colours — and a second prism to recombine them. Flint glass spreads colours more than crown glass (used in “crystal” and in chandeliers).</p>'; }
    if (mode === 'rain') return '<h4>1 · Path through the drop</h4><div class="eq">Refract in, reflect once off the back, refract out. With sin i = b: i = ' + fnum(d.Y.i) + '°, and inside sin r = sin i / n.</div>' +
      '<h4>2 · How much the light turns</h4><div class="eq">D = 180° + 2i − 4r. Red: D = ' + fnum(d.R.D) + '° → <b>' + fnum(d.R.ang) + '°</b> from the point opposite the sun. Violet: <b>' + fnum(d.Vi.ang) + '°</b>.</div>' +
      '<h4>3 · Why there is a bright bow</h4><div class="eq">Rays hitting near b ≈ 0.86 all come out at almost the same angle (the top of the graph), so light piles up there: red at ' + fnum(d.pR) + '°, violet at ' + fnum(d.pV) + '°.</div>' +
      '<p class="note">Red is on the <b>outside</b> of the bow (bigger angle). You see a rainbow with the sun behind you, and each colour comes from a different set of drops. A second, fainter bow at about 51° comes from two reflections inside — with the colours reversed.</p>';
    if (mode === 'mirage') return '<h4>1 · Hot air has a lower index</h4><div class="eq">n − 1 ∝ air density, and hot air is less dense. Here n at your eye = ' + d.nh.toFixed(6) + '; at the road = ' + d.n0.toFixed(6) + '.</div>' +
      '<h4>2 · The ray bends gradually upward</h4><div class="eq">Think of thin layers: at each one n cos θ stays the same (Snell’s law with θ from the horizontal). As n drops, the ray flattens out until it is horizontal, then curves back up.</div>' +
      '<h4>3 · Only very shallow rays turn</h4><div class="eq">Largest angle that turns: cos α<sub>max</sub> = n<sub>road</sub>/n<sub>eye</sub> → α<sub>max</sub> = <b>' + H.n(d.amax, '°') + '</b>. You are looking ' + H.iv('a') + ' down → ' + (d.ok ? 'the ray turns <b>' + H.n(d.turnX, 'm') + '</b> ahead and goes up to the sky.' : 'the ray hits the road: no mirage there.') + '</div>' +
      '<p class="note">Your brain assumes light travels in straight lines, so you see an image of the sky <i>on</i> the road — it looks like water. It’s like total internal reflection, but at a gradual boundary instead of a sharp one. Over cold water the air near the surface is denser, rays curve down, and ships can appear to float in the sky.</p>';
    return '<h4>1 · The ray that reaches your eye</h4><div class="eq">It leaves the fish at ' + fnum(d.tw) + '° from the normal, crosses the surface ' + H.n(d.s, 'm') + ' out from the fish’s position, and refracts away from the normal: 1.33 sin ' + fnum(d.tw) + '° = sin θ<sub>air</sub> → θ<sub>air</sub> = <b>' + fnum(d.ta) + '°</b></div>' +
      '<h4>2 · Where the fish appears</h4><div class="eq">Trace the ray straight back: apparent depth d′ = <b>' + H.n(d.app, 'm') + '</b>. Looking straight down, d′ = d/n = ' + fnum(v.d) + '/1.33 = ' + H.n(d.simple, 'm') + '.</div>' +
      '<p class="note">The fish is deeper (and farther out) than it looks, so a spear fisher aims <b>below</b> where they see the fish. Pools look shallower than they are — dive carefully. Looking at a steeper slant makes the fish look even shallower.</p>';
  },
  draw(v, d, mode, opt){
    if (mode === 'prism'){
      panelTitle('WHITE LIGHT THROUGH A PRISM', 10, 18);
      const A = v.A * DEG, h = 190, ap = [200, 50], bl = [200 - h * Math.tan(A / 2), 50 + h], br = [200 + h * Math.tan(A / 2), 50 + h];
      ctx.fillStyle = 'rgba(160,200,230,0.35)'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(...ap); ctx.lineTo(...bl); ctx.lineTo(...br); ctx.closePath(); ctx.fill(); ctx.stroke();
      const nOut1 = V.norm([-(ap[1] - bl[1]), ap[0] - bl[0]]).map(x => x), n1o = V.dot(nOut1, [1, 0]) < 0 ? nOut1 : V.mul(nOut1, -1); // outward normal of left face
      const P = V.mul(V.add(ap, bl), 0.5); let din = V.rot(V.mul(n1o, -1), -v.th * DEG); if (din[1] > V.rot(V.mul(n1o, -1), v.th * DEG)[1]) din = V.rot(V.mul(n1o, -1), v.th * DEG);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(P[0] - din[0] * 160, P[1] - din[1] * 160); ctx.lineTo(...P); ctx.stroke();
      const nOut2 = (() => { const t = V.norm(V.sub(br, ap)); const c = [t[1], -t[0]]; return c[0] > 0 ? c : V.mul(c, -1); })();
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P[0] + n1o[0] * 40, P[1] + n1o[1] * 40); ctx.lineTo(P[0] - n1o[0] * 30, P[1] - n1o[1] * 30); ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.beginPath(); ctx.rect(10, 26, 378, 290); ctx.clip();
      for (let l = 410; l <= 680; l += 15){ const n = nOf(d.m, l), d1 = refr(din, n1o, 1, n); if (!d1) continue;
        // intersect with right face
        const e = V.sub(br, ap), den = d1[0] * e[1] - d1[1] * e[0], t = ((ap[0] - P[0]) * e[1] - (ap[1] - P[1]) * e[0]) / den, Q = V.add(P, V.mul(d1, t));
        ctx.strokeStyle = wlRGB(l); ctx.globalAlpha = 0.8; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(...P); ctx.lineTo(...Q); ctx.stroke();
        const d2 = refr(d1, V.mul(nOut2, -1), n, 1); if (d2){ ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(...Q); ctx.lineTo(Q[0] + d2[0] * 200, Q[1] + d2[1] * 200); ctx.stroke(); } ctx.globalAlpha = 1; }
      ctx.restore();
      text('A = ' + v.A + '°', 200, 44, { align: 'center', font: '700 12px "Space Grotesk",sans-serif' });
      panelTitle('RED vs VIOLET', 395, 18);
      [['n red', fplain(d.R.n)], ['n violet', fplain(d.Vi.n)], ['δ red', d.R.tir ? 'TIR' : fplain(d.R.dev) + '°'], ['δ violet', d.Vi.tir ? 'TIR' : fplain(d.Vi.dev) + '°'], ['spread', isFinite(d.spread) ? fplain(d.spread) + '°' : '—']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px "IBM Plex Mono",monospace' }); });
      text('violet bends most', 400, 200, { font: '700 12px "Space Grotesk",sans-serif', col: '#7a3fb0' });
      return;
    }
    if (mode === 'rain'){
      panelTitle('SUNLIGHT IN A RAINDROP', 10, 18);
      const C = [230, 165], R = 105; ctx.fillStyle = 'rgba(120,180,230,0.25)'; ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(C[0], C[1], R, 0, 7); ctx.fill(); ctx.stroke();
      text('sunlight →', 14, 40, { font: '700 11px "Space Grotesk",sans-serif', col: '#c43a00' });
      const trace = (l, col, w) => { const n = nOf('water', l), P = [C[0] - R * Math.sqrt(1 - v.b * v.b), C[1] - R * v.b], nr = V.norm(V.sub(P, C));
        const d1 = refr([1, 0], nr, 1, n); const t1 = -2 * V.dot(V.sub(P, C), d1), Q = V.add(P, V.mul(d1, t1)), nq = V.norm(V.sub(Q, C)), d2 = V.sub(d1, V.mul(nq, 2 * V.dot(d1, nq)));
        const t2 = -2 * V.dot(V.sub(Q, C), d2), S2 = V.add(Q, V.mul(d2, t2)), ns = V.norm(V.sub(S2, C)), d3 = refr(d2, V.mul(ns, -1), n, 1);
        ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(20, P[1]); ctx.lineTo(...P); ctx.lineTo(...Q); ctx.lineTo(...S2); if (d3) ctx.lineTo(S2[0] + d3[0] * 220, S2[1] + d3[1] * 220); ctx.stroke(); return S2; };
      trace(589, '#c9c9c9', 3); const S2 = trace(656, '#e0201a', 1.8); trace(410, '#7a3fb0', 1.8);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(S2[0], S2[1]); ctx.lineTo(S2[0] - 120, S2[1]); ctx.stroke(); ctx.setLineDash([]);
      text(fplain(d.R.ang) + '°', S2[0] - 70, S2[1] + 30, { font: '700 13px "Space Grotesk",sans-serif' }); text('back toward the sun (dashed)', 14, 312, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('ANGLE vs WHERE IT HITS', 395, 18);
      const gx = 405, gy = 230, gw = 180, gh = 180, X = b => gx + gw * b, Y = a => gy - gh * a / 45; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      [[656, '#e0201a'], [410, '#7a3fb0']].forEach(([l, c]) => { const n = nOf('water', l); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 100; i++){ const b = 0.99 * i / 100, a = 4 * Math.asin(b / n) / DEG - 2 * Math.asin(b) / DEG; i ? ctx.lineTo(X(b), Y(a)) : ctx.moveTo(X(b), Y(a)); } ctx.stroke(); });
      ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(X(v.b), Y(d.R.ang), 5, 0, 7); ctx.fill();
      text('42°', gx - 4, Y(42) + 4, { align: 'right', font: '500 10px "IBM Plex Mono",monospace' }); text('0', gx - 4, gy + 4, { align: 'right', font: '500 10px "IBM Plex Mono",monospace' }); text('b →', gx + gw, gy + 14, { align: 'right', font: '500 10px "IBM Plex Mono",monospace' });
      text('rays pile up at the peak', 400, 260, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    if (mode === 'mirage'){
      panelTitle('LOOKING DOWN A HOT ROAD (HEIGHTS STRETCHED)', 10, 18);
      const X0 = 30, sx = 355 / 400, gy = 250, sz = 70, X = x => X0 + x * sx, Y = z => gy - z * sz;
      const sky = ctx.createLinearGradient(0, 30, 0, gy); sky.addColorStop(0, '#9cc8f0'); sky.addColorStop(1, '#e8f2fb'); ctx.fillStyle = sky; ctx.fillRect(20, 30, 365, gy - 30);
      ctx.fillStyle = '#555'; ctx.fillRect(20, gy, 365, 30); ctx.fillStyle = 'rgba(255,106,43,' + Math.min(0.5, v.dT / 60) + ')'; ctx.fillRect(20, gy - 20, 365, 20);
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(0), Y(d.h), 5, 0, 7); ctx.fill(); text('eye', X(0) + 4, Y(d.h) - 8, { font: '700 11px "Space Grotesk",sans-serif' });
      ctx.setLineDash([5, 4]); ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(0), Y(d.h)); ctx.lineTo(X(Math.min(400, d.straight)), Y(Math.max(0, d.h - Math.min(400, d.straight) * Math.tan(v.a * DEG)))); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.5; ctx.beginPath(); d.pts.forEach(([x, z], i) => { if (x > 400) return; i ? ctx.lineTo(X(x), Y(z)) : ctx.moveTo(X(x), Y(z)); }); ctx.stroke();
      if (d.ok && d.turnX < 400){ ctx.fillStyle = 'rgba(80,140,220,0.6)'; ctx.beginPath(); ctx.ellipse(X(d.straight < 400 ? d.straight : d.turnX), gy + 4, 26, 4, 0, 0, 7); ctx.fill(); text('“water” seen here', X(Math.min(d.straight, 380)), gy + 22, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#fff' }); }
      text('hot air, low n', 380, gy - 6, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#c43a00' });
      text('red: real path · dashed: where you think it came from · 0–400 m', 12, 312, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('NUMBERS', 395, 18);
      [['n at eye', d.nh.toFixed(6)], ['n at road', d.n0.toFixed(6)], ['α max', fplain(d.amax) + '°'], ['your α', v.a + '°'], ['turns at', d.ok ? fplain(d.turnX) + ' m' : 'hits road']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 12px "IBM Plex Mono",monospace' }); });
      text('a tiny change in n is enough', 400, 200, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('for grazing rays', 400, 214, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    panelTitle('SPEAR FISHING', 10, 18);
    const S = 60, ex = 40, wy = 170, X = x => ex + 30 + x * S, Y = z => wy - z * S;
    ctx.fillStyle = 'rgba(80,150,220,0.3)'; ctx.fillRect(20, wy, 365, 310 - wy); ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(20, wy); ctx.lineTo(385, wy); ctx.stroke();
    const eye = [X(0), Y(v.h)], fish = [X(v.x), Y(-v.d)], sp = [X(v.x - d.s), wy], app = [X(v.x), Y(-d.app)];
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(...eye, 5, 0, 7); ctx.fill(); text('eye', eye[0] - 8, eye[1] - 8, { align: 'right', font: '700 11px "Space Grotesk",sans-serif' });
    const fishAt = (p, a) => { ctx.globalAlpha = a; ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.ellipse(p[0], p[1], 14, 6, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(p[0] + 12, p[1]); ctx.lineTo(p[0] + 22, p[1] - 6); ctx.lineTo(p[0] + 22, p[1] + 6); ctx.fill(); ctx.globalAlpha = 1; };
    fishAt(fish, 1); fishAt(app, 0.35);
    ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(...fish); ctx.lineTo(...sp); ctx.lineTo(...eye); ctx.stroke();
    ctx.setLineDash([5, 4]); ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(...sp); ctx.lineTo(...app); ctx.stroke(); ctx.setLineDash([]);
    text('real', fish[0] + 26, fish[1] + 4, { font: '700 11px "Space Grotesk",sans-serif', col: '#c43a00' }); text('where it looks', app[0] + 26, app[1] + 4, { font: '700 11px "Space Grotesk",sans-serif', col: '#8a8a8a' });
    panelTitle('DEPTHS', 395, 18);
    [['real depth', fplain(v.d) + ' m'], ['apparent', fplain(d.app) + ' m'], ['straight down d/n', fplain(d.simple) + ' m'], ['angle in water', fplain(d.tw) + '°'], ['angle in air', fplain(d.ta) + '°']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px "IBM Plex Mono",monospace' }); });
    text('aim below the fish', 400, 200, { font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' });
  }
};
