// Induction (AP 12.4; IB HL D.4): rod on rails (ε = BLv, Lenz), a loop moving through a field region (flux and emf graphs), and a generator coil (ε = NBAω sin ωt).
const SIM = {
  title: 'Induction',
  hint: 'Φ = BA cos θ · ε = −NΔΦ/Δt · ⊗ = B into the page',
  modes: [{ id: 'rail', label: 'Rod on rails' }, { id: 'loop', label: 'Loop through a field' }, { id: 'drop', label: 'Magnet through a coil' }, { id: 'lenz', label: 'Lenz’s law explorer' }, { id: 'gen', label: 'Generator (Extension)' }],
  opts: [{ id: 'pole', label: 'Pole at loop', modes: ['lenz'], choices: [['N', 'N'], ['S', 'S']] }],
  ivs(mode){
    if (mode === 'lenz') return [{ id: 'v', sym: 'v', symText: 'v', label: 'Magnet velocity (+ toward)', unit: 'm/s', min: -2, max: 2, step: 0.1, val: 1, graph: true }, { id: 'R', sym: 'R', symText: 'R', label: 'Resistance of the loop', unit: 'Ω', min: 0.5, max: 5, step: 0.5, val: 1 }];
    if (mode === 'drop') return [{ id: 'h', sym: 'h', symText: 'h', label: 'Drop height above the coil', unit: 'cm', min: 8, max: 100, step: 1, val: 30, graph: true }, { id: 'n', sym: 'n', symText: 'n', label: 'Number of stacked magnets', unit: '', min: 1, max: 3, step: 1, val: 1, show: x => String(x) }];
    if (mode === 'loop') return [{ id: 'B', sym: 'B', symText: 'B', label: 'Field strength', unit: 'T', min: 0.1, max: 2, step: 0.05, val: 0.5 }, { id: 'a', sym: 'a', symText: 'a', label: 'Side of the square loop', unit: 'cm', min: 5, max: 20, step: 0.5, val: 10 }, { id: 'w', sym: 'w', symText: 'w', label: 'Width of the field region', unit: 'cm', min: 10, max: 40, step: 1, val: 25 }, { id: 'v', sym: 'v', symText: 'v', label: 'Loop speed', unit: 'm/s', min: 0.1, max: 2, step: 0.05, val: 0.5, graph: true }];
    if (mode === 'gen') return [{ id: 'N', sym: 'N', symText: 'N', label: 'Turns', unit: '', min: 1, max: 500, step: 1, val: 100, show: x => x.toFixed(0) }, { id: 'B', sym: 'B', symText: 'B', label: 'Field strength', unit: 'T', min: 0.01, max: 1, step: 0.01, val: 0.2 }, { id: 'A', sym: 'A', symText: 'A', label: 'Coil area', unit: 'cm²', min: 10, max: 400, step: 10, val: 100 }, { id: 'f', sym: 'f', symText: 'f', label: 'Rotation frequency', unit: 'Hz', min: 0.2, max: 60, step: 0.1, val: 1, graph: true }];
    return [{ id: 'B', sym: 'B', symText: 'B', label: 'Field strength (into page)', unit: 'T', min: 0.1, max: 2, step: 0.05, val: 0.5 }, { id: 'L', sym: 'L', symText: 'L', label: 'Rod length (rail spacing)', unit: 'm', min: 0.1, max: 1, step: 0.05, val: 0.4 }, { id: 'v', sym: 'v', symText: 'v', label: 'Rod speed (to the right)', unit: 'm/s', min: 0.5, max: 10, step: 0.5, val: 4, graph: true }, { id: 'R', sym: 'R', symText: 'R', label: 'Resistance of the circuit', unit: 'Ω', min: 0.5, max: 20, step: 0.5, val: 2 }];
  },
  presets: [{ label: 'Double the speed', mode: 'rail', v: { v: 8 } }, { label: 'Narrow field', mode: 'loop', v: { w: 10 } }, { label: 'Double the frequency', mode: 'gen', v: { f: 2 } }, { label: 'N pole toward', mode: 'lenz', opt: { pole: 'N' }, v: { v: 1 } }, { label: 'N pole away', mode: 'lenz', opt: { pole: 'N' }, v: { v: -1 } }, { label: 'S pole toward', mode: 'lenz', opt: { pole: 'S' }, v: { v: 1 } }],
  calc(v, mode, opt){
    if (mode === 'lenz'){ const sB = opt.pole === 'S' ? -1 : 1, sv = Math.abs(v.v) < 0.05 ? 0 : Math.sign(v.v), ch = sB * sv, emf = 0.01 * Math.abs(v.v) * (sv ? 1 : 0), I = emf / v.R;
      return { sB, sv, ch, ccw: ch > 0, indN: ch > 0, repel: sv > 0, emf, I, mag: opt.pole === 'S' ? 'S' : 'N' }; }
    if (mode === 'drop'){ const a = 0.015, h = v.h / 100, g = 10, Phi0 = 200 * 0.05 * v.n * PI * a * a, P = z => Phi0 / Math.pow(1 + (z / a) * (z / a), 1.5), dP = z => -3 * Phi0 * z / (a * a) / Math.pow(1 + (z / a) * (z / a), 2.5);
      const z0 = Math.min(h, 4 * a), pts = []; for (let i = 0; i <= 400; i++){ const z = z0 - (z0 + 4 * a) * i / 400, t = Math.sqrt(2 * (h - z) / g), e = -dP(z) * g * t; pts.push([t, e, z]); }
      const t0 = pts[0][0]; pts.forEach(p => p[0] -= t0); let p1 = 0, p2 = 0; pts.forEach(([, e]) => { if (e > p1) p1 = e; if (e < p2) p2 = e; });
      return { pts, p1, p2: -p2, vc: Math.sqrt(2 * g * h), Phi0, pk: -p2 }; }
    if (mode === 'loop'){ const a = v.a / 100, w = v.w / 100, emf = v.B * a * v.v, tIn = a / v.v, tFull = Math.max(w, a) / v.v; return { a, w, emf, tIn, Phimax: v.B * a * Math.min(a, w), tTot: (w + a) / v.v }; }
    if (mode === 'gen'){ const om = 2 * PI * v.f, peak = v.N * v.B * (v.A / 1e4) * om; return { om, peak, rms: peak / Math.SQRT2, T: 1 / v.f }; }
    const emf = v.B * v.L * v.v, I = emf / v.R, F = v.B * I * v.L, P = F * v.v;
    return { emf, I, F, P, Pr: I * I * v.R };
  },
  dvs(mode){
    if (mode === 'lenz') return [{ id: 'emf', name: 'Induced emf', short: 'ε', sym: 'ε', unit: 'mV', f: d => d.emf * 1000 }, { id: 'I', name: 'Induced current', short: 'I', sym: 'I', unit: 'mA', f: d => d.I * 1000 }];
    if (mode === 'drop') return [{ id: 'pk', name: 'Peak emf (second pulse)', short: 'ε_peak', sym: 'ε<sub>peak</sub>', unit: 'V', f: d => d.pk }, { id: 'vc', name: 'Speed through the coil', short: 'v', sym: 'v', unit: 'm/s', f: d => d.vc }];
    if (mode === 'loop') return [{ id: 'emf', name: 'emf while entering or leaving', short: 'ε', sym: 'ε', unit: 'V', f: d => d.emf }];
    if (mode === 'gen') return [{ id: 'peak', name: 'Peak emf', short: 'ε₀', sym: 'ε<sub>0</sub>', unit: 'V', f: d => d.peak }];
    return [{ id: 'emf', name: 'Induced emf', short: 'ε', sym: 'ε', unit: 'V', f: d => d.emf }, { id: 'I', name: 'Current', short: 'I', sym: 'I', unit: 'A', f: d => d.I }, { id: 'F', name: 'Force needed to keep it moving', short: 'F', sym: 'F', unit: 'N', f: d => d.F }, { id: 'P', name: 'Power you supply', short: 'P', sym: 'P', unit: 'W', f: d => d.P }];
  },
  work(v, d, mode){
    if (mode === 'lenz'){ const m = d.mag, oth = m === 'N' ? 'S' : 'N', toward = d.sv > 0, away = d.sv < 0, bdir = d.sB > 0 ? 'away from the magnet' : 'toward the magnet';
      const h1 = '<h4>1 · Field of the magnet through the loop</h4><p class="st">Field lines leave an <b>N</b> pole and enter an <b>S</b> pole. The ' + m + ' pole faces the loop, so the field through the loop points <b>' + bdir + '</b>.</p>';
      if (!d.sv) return h1 + '<h4>2 · Is the flux changing?</h4><p class="st">The magnet is <b>still</b>, so the flux through the loop is constant: ΔΦ = 0.</p>' + TEXA`\varepsilon = -\frac{\Delta\Phi}{\Delta t} = 0` + '<p class="st">No change in flux → <b>no emf, no current</b>, no force on the magnet. (A steady magnet next to a loop does nothing.)</p><p class="note">Slide the velocity away from 0 to see the loop fight the change.</p>';
      const inc = toward, ibd = d.sB * d.sv > 0 ? 'toward the magnet' : 'away from the magnet', face = d.indN ? 'N' : 'S', cur = d.ccw ? 'counterclockwise' : 'clockwise';
      const k = 0.01, emfV = d.emf;
      return h1 + '<h4>2 · Is the flux increasing or decreasing?</h4><p class="st">The magnet moves <b>' + (toward ? 'toward' : 'away from') + '</b> the loop, so the field through it gets <b>' + (inc ? 'stronger' : 'weaker') + '</b>: the flux is <b>' + (inc ? 'increasing' : 'decreasing') + '</b>.</p>' +
      '<h4>3 · The induced field opposes the change</h4><p class="st">' + (inc ? 'Flux is increasing, so the loop makes a field <b>opposite</b> to the magnet’s' : 'Flux is decreasing, so the loop makes a field in the <b>same direction</b> as the magnet’s, to keep it up') + ': the induced B inside the loop points <b>' + ibd + '</b>.</p>' +
      '<h4>4 · Right-hand rule gives the current</h4><p class="st">Point your right thumb along the induced B (' + ibd + '). Your fingers curl <b>' + cur + '</b> as seen from the magnet’s side. So the current goes <b>' + cur + '</b>.</p>' +
      '<h4>5 · Force on the magnet</h4><p class="st">The field leaving the loop’s magnet-side face means that face is an <b>' + face + '</b> pole (induced B points ' + ibd + '). The magnet’s ' + m + ' pole faces it: ' + (face === m ? 'like poles → <b>repel</b>.' : 'opposite poles → <b>attract</b>.') + '</p><div class="ok">The loop ' + (toward ? 'pushes the approaching magnet back' : 'pulls the leaving magnet back') + ': it resists the motion. That is Lenz’s law.</div>' +
      '<h4>6 · How big? ε = −ΔΦ/Δt</h4><p class="st">The minus sign is the opposing direction. For the size: faster motion → faster flux change → bigger emf. Suppose each metre of motion changes the flux by 0.010 Wb:</p>' +
      TEX`\left|\frac{\Delta\Phi}{\Delta t}\right| = (0.010\,\text{Wb/m})\,|v|` + TEX`\varepsilon = (0.010\,\text{Wb/m})(${M.n(Math.abs(v.v), 'm/s')})` + TEXA`\varepsilon = ${M.n(emfV, 'V')}` +
      TEX`I = \frac{\varepsilon}{R}` + TEX`I = \frac{${M.n(emfV, 'V')}}{${M.iv('R')}}` + TEXA`I = ${M.n(d.I, 'A')}` +
      '<p class="note">Double the speed → double ε and I. Switch the pole facing the loop: the current <i>reverses</i> but the magnet is still pushed back (approaching) or pulled back (leaving).</p>'; }
    if (mode === 'drop') return '<h4>1 · Falling into the coil: flux goes up</h4><p class="st">As the magnet comes closer, more field passes through the coil. Changing flux → an emf (Faraday). First pulse:</p>' + TEXA`\varepsilon_1 = ${M.n(d.p1, 'V')}` +
      '<h4>2 · Falling out: flux goes down</h4><p class="st">Leaving, the flux decreases, so the emf has the <b>opposite sign</b> (Lenz). It is <b>taller and narrower</b> because the magnet is moving faster by then. Second pulse:</p>' + TEXA`\varepsilon_2 = ${M.n(d.p2, 'V')}` +
      '<h4>3 · Same area under both pulses</h4><p class="st">Area under an emf–time pulse = ΔΦ. The flux rises to Φ<sub>max</sub> and falls back by the same amount, so both pulses have the same area: a faster pulse must be taller and thinner.</p>' +
      '<h4>4 · Higher drop → bigger emf</h4><p class="st">Speed through the coil:</p>' + TEX`v = \sqrt{2gh}` + TEX`v = \sqrt{2(10\,\text{m/s}^2)(${M.n(v.h / 100, 'm')})}` + TEXA`v = ${M.n(d.vc, 'm/s')}` +
      '<p class="st">The emf is the rate of change of flux, so it is proportional to v:</p>' + TEX`\varepsilon_{\text{peak}} \propto v \propto \sqrt{h}` + '<p class="st">Graph peak emf against √h: a straight line. More magnets → stronger B → bigger emf.</p>' +
      '<p class="note">Lab: a data logger records the coil voltage as the magnet drops through a tube. Try the copper-pipe demo (extension): currents induced in the pipe slow the magnet down a lot.</p>';
    if (mode === 'loop') return '<h4>1 · Flux through the loop (only the part inside the field)</h4>' + TEX`\Phi = BA` + '<p class="st">Entering: the area inside grows at a × v per second:</p>' + TEX`\frac{\Delta\Phi}{\Delta t} = B a v` +
      '<h4>2 · emf while entering or leaving</h4>' + TEX`\varepsilon = Bav` + TEX`\varepsilon = (${M.iv('B')})(${M.n(d.a, 'm')})(${M.iv('v')})` + TEXA`\varepsilon = ${M.n(d.emf, 'V')}` + '<p class="st">This lasts for ' + H.n(d.tIn, 's') + '.</p>' +
      '<p class="st">' + (d.w >= d.a ? 'Fully inside: Φ = constant → <b>ε = 0</b> (no change, no emf), even though it’s in the field.' : 'The loop is wider than the field: some part is always entering while another leaves.') + '</p>' +
      '<h4>3 · Direction (Lenz’s law)</h4><p class="st">Entering: flux into the page increases → induced current makes field <b>out of</b> the page → <b>counterclockwise</b>. Leaving: flux decreases → <b>clockwise</b>.</p>' +
      '<p class="note">Classic FRQ: sketch Φ vs t (ramp up, flat, ramp down) and ε vs t (block, zero, opposite block). ε is the slope of Φ.</p>';
    if (mode === 'gen') return '<h4>1 · Flux through a rotating coil</h4>' + TEX`\Phi = BA\cos\omega t` + TEX`\omega = 2\pi f` + TEX`\omega = 2\pi(${M.iv('f')})` + TEXA`\omega = ${M.n(d.om, 'rad/s')}` +
      '<h4>2 · Induced emf</h4>' + TEX`\varepsilon = NBA\omega\sin\omega t` + '<p class="st">Peak value:</p>' + TEX`\varepsilon_0 = NBA\omega` + TEX`\varepsilon_0 = (${M.n(v.N)})(${M.iv('B')})(${M.n(v.A / 1e4, 'm²')})(${M.n(d.om, 'rad/s')})` + TEXA`\varepsilon_0 = ${M.n(d.peak, 'V')}` +
      '<p class="st">The emf is biggest when the coil is parallel to B (flux = 0 but changing fastest), zero when perpendicular (flux biggest).</p>' +
      '<p class="note">IB HL D.4: double the frequency → double the peak emf <i>and</i> half the period.</p>';
    return '<h4>1 · Motional emf</h4><p class="st">The area of the circuit grows by Lv each second:</p>' + TEX`\frac{\Delta\Phi}{\Delta t} = BLv` + TEX`\varepsilon = BLv` + TEX`\varepsilon = (${M.iv('B')})(${M.iv('L')})(${M.iv('v')})` + TEXA`\varepsilon = ${M.n(d.emf, 'V')}` +
      '<h4>2 · Current and direction</h4>' + TEX`I = \frac{\varepsilon}{R}` + TEX`I = \frac{${M.n(d.emf, 'V')}}{${M.iv('R')}}` + TEXA`I = ${M.n(d.I, 'A')}` +
      '<p class="st">Flux into the page increases → Lenz: the induced current makes field out of the page inside the loop → <b>counterclockwise</b>.</p>' +
      '<h4>3 · The magnetic force on the rod opposes the motion</h4>' + TEX`F = BIL` + TEX`F = (${M.iv('B')})(${M.n(d.I, 'A')})(${M.iv('L')})` + TEXA`F = ${M.n(d.F, 'N')}` + '<p class="st">To the left. To keep v constant you must push with ' + H.n(d.F, 'N') + '.</p>' +
      '<h4>4 · Energy</h4><p class="st">Your power:</p>' + TEX`P = Fv` + TEX`P = (${M.n(d.F, 'N')})(${M.iv('v')})` + TEXA`P = ${M.n(d.P, 'W')}` + '<p class="st">Heating in the circuit:</p>' + TEX`P = I^2 R` + TEX`P = (${M.n(d.I, 'A')})^2(${M.iv('R')})` + TEXA`P = ${M.n(d.Pr, 'W')}` +
      '<p class="st">They match ✓ (that’s why Lenz’s law must be true).</p>' +
      '<p class="note">Double v → double ε, I and F → 4× the power. Let go and the rod slows down.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const cross = (x0, y0, x1, y1) => { ctx.strokeStyle = 'rgba(122,63,176,0.35)'; ctx.lineWidth = 1.2; for (let x = x0 + 12; x < x1; x += 26) for (let y = y0 + 12; y < y1; y += 26){ ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); } };
    if (mode === 'lenz'){
      const cy = 150, cxL = 300, R = 58, mw = 80, mh = 34, lo = 110, hi = 235;
      if (A.p === undefined || A.reset) A.p = 0; if (A.ph === undefined) A.ph = 0;
      A.p = (A.p + Math.abs(v.v) * 0.3 * dt) % 1; const mx = d.sv ? lo + (hi - lo) * (d.sv > 0 ? A.p : 1 - A.p) : 170, gap = cxL - mx, str = 1 / Math.pow(1 + (gap / 70) * (gap / 70), 1.5);
      panelTitle('MAGNET AND A WIRE LOOP (side view)', 10, 18);
      text('looking this way →', 12, 36, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('(“seen from the magnet”)', 12, 48, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(12, cy); ctx.lineTo(385, cy); ctx.stroke(); ctx.setLineDash([]);
      // loop: 3-D circle in the y–z plane, viewed obliquely. alpha increases counterclockwise as seen from the magnet (looking +x, viewer's right = toward the reader).
      const P = a => [cxL + 0.4 * R * Math.cos(a), cy - R * Math.sin(a)];
      const half = (a0, a1, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); for (let i = 0; i <= 40; i++){ const [x, y] = P(a0 + (a1 - a0) * i / 40); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); };
      half(PI / 2, 3 * PI / 2, 'rgba(196,122,58,0.5)', 3.5);
      // magnet (pole facing the loop is on its right)
      const m = d.mag, right = m === 'N' ? '#e2453c' : '#1546d6', left = m === 'N' ? '#1546d6' : '#e2453c', lr = m === 'N' ? 'S' : 'N';
      ctx.fillStyle = left; ctx.fillRect(mx - mw, cy - mh / 2, mw / 2, mh); ctx.fillStyle = right; ctx.fillRect(mx - mw / 2, cy - mh / 2, mw / 2, mh); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.8; ctx.strokeRect(mx - mw, cy - mh / 2, mw, mh);
      text(lr, mx - mw * 0.75, cy + 6, { align: 'center', font: '700 17px "Space Grotesk",sans-serif', col: '#fff' }); text(m, mx - mw * 0.25, cy + 6, { align: 'center', font: '700 17px "Space Grotesk",sans-serif', col: '#fff' });
      // external field arrows through the loop (purple)
      const La = 16 + 44 * str; [-40, 0, 40].forEach(oy => { const x0 = cxL - d.sB * La / 2, x1 = cxL + d.sB * La / 2; arrow(x0, cy + oy, x1, cy + oy, '#7a3fb0', null, { w: 2.5, head: 7 }); });
      // induced field arrows (green), opposite to the change
      if (d.sv){ const dirI = -d.sB * d.sv, Li = 14 + 22 * Math.min(1, Math.abs(v.v) / 2); [-20, 20].forEach(oy => arrow(cxL - dirI * Li / 2, cy + oy, cxL + dirI * Li / 2, cy + oy, '#1e7d45', null, { w: 2.5, head: 7 })); }
      // front half of loop, then animated current arrows
      half(-PI / 2, PI / 2, '#c47a3a', 5.5);
      if (d.sv){ const dir = d.ccw ? 1 : -1; A.ph += dir * dt * (0.7 + 1.1 * Math.abs(v.v)); for (let k = 0; k < 6; k++){ const a = A.ph + k * PI / 3, [x, y] = P(a), tx = -0.4 * R * Math.sin(a) * dir, ty = -R * Math.cos(a) * dir, tl = Math.hypot(tx, ty), ux = tx / tl, uy = ty / tl, sz = 6;
          ctx.fillStyle = '#c43a00'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x + ux * sz, y + uy * sz); ctx.lineTo(x - ux * sz - uy * sz * 0.7, y - uy * sz + ux * sz * 0.7); ctx.lineTo(x - ux * sz + uy * sz * 0.7, y - uy * sz - ux * sz * 0.7); ctx.closePath(); ctx.stroke(); ctx.fill(); } }
      text('loop', cxL + 22, cy - R + 4, { font: '700 11px "Space Grotesk",sans-serif', col: '#c47a3a' });
      // velocity and force on the magnet
      if (d.sv){ const vl = 22 + 16 * Math.abs(v.v), xm = mx - mw / 2; arrow(xm - d.sv * vl / 2, cy - mh / 2 - 22, xm + d.sv * vl / 2, cy - mh / 2 - 22, COL.V, null, { w: 3, head: 8 }); text('v', xm, cy - mh / 2 - 30, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: COL.V });
        const fl = 26 + 10 * Math.abs(v.v), fdir = d.repel ? -1 : 1; arrow(xm - fdir * fl / 2, cy + mh / 2 + 26, xm + fdir * fl / 2, cy + mh / 2 + 26, COL.F, null, { w: 3.5, head: 9 }); text('F on magnet: ' + (d.repel ? 'repel' : 'attract'), xm, cy + mh / 2 + 48, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: COL.F }); }
      else text('magnet at rest: no emf, no force', 170, cy + mh / 2 + 30, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: '#4a4a4a' });
      // legend
      [['#7a3fb0', 'B of the magnet'], ['#1e7d45', 'induced B'], ['#c43a00', 'induced current']].forEach(([c, l], i) => { ctx.fillStyle = c; ctx.fillRect(12 + i * 118, 295, 10, 10); text(l, 26 + i * 118, 304, { font: '600 11px "Space Grotesk",sans-serif' }); });
      panelTitle('LENZ CHECK', 395, 18);
      const row = (i, lab, val, col) => { text(lab, 397, 40 + i * 33, { font: '600 10px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(val, 397, 56 + i * 33, { font: '700 13px "Space Grotesk",sans-serif', col: col || '#111' }); };
      row(0, 'Magnet’s B through the loop', d.sB > 0 ? 'away from the magnet' : 'toward the magnet', '#7a3fb0');
      row(1, 'Flux through the loop', d.sv > 0 ? 'increasing' : d.sv < 0 ? 'decreasing' : 'not changing', '#111');
      row(2, 'Induced B inside the loop', d.sv ? (d.sB * d.sv > 0 ? 'toward the magnet' : 'away from the magnet') : '— none', '#1e7d45');
      row(3, 'Induced current (seen from magnet)', d.sv ? (d.ccw ? 'counterclockwise' : 'clockwise') : '— none', '#c43a00');
      row(4, 'Loop face toward the magnet', d.sv ? (d.indN ? 'N pole' : 'S pole') : '— none', '#111');
      row(5, 'Force on the magnet', d.sv ? (d.repel ? 'repel (pushed back)' : 'attract (pulled back)') : '— none', '#c43a00');
      row(6, 'emf  ε = −ΔΦ/Δt', fplain(d.emf * 1000) + ' mV', '#111'); row(7, 'Current  I = ε/R', fplain(d.I * 1000) + ' mA', '#111');
      return;
    }
    if (mode === 'drop'){
      panelTitle('MAGNET FALLING THROUGH A COIL', 10, 18);
      const coilY = 230, cmpx = 3.2, topY = Math.max(36, coilY - v.h * cmpx * 0.6), T = Math.sqrt(2 * (v.h / 100 + 0.1) / 10) * 3 + 0.6;
      if (A.s === undefined || A.reset) A.s = 0; A.s = (A.s + dt) % T; const u = Math.min(1, A.s / (T - 0.6)), my = topY + (coilY + 60 - topY) * u * u;
      ctx.fillStyle = 'rgba(180,200,220,0.35)'; ctx.fillRect(170, 30, 60, 290); ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.strokeRect(170, 30, 60, 290);
      for (let k = 0; k < 7; k++){ ctx.strokeStyle = '#c47a3a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(200, coilY - 15 + k * 5, 38, 7, 0, 0, 7); ctx.stroke(); }
      text('coil', 244, coilY + 4, { font: '700 11px "Space Grotesk",sans-serif', col: '#c47a3a' });
      const hM = 18 * v.n; ctx.fillStyle = '#e2453c'; ctx.fillRect(188, my - hM, 24, hM / 2); ctx.fillStyle = '#1546d6'; ctx.fillRect(188, my - hM / 2, 24, hM / 2); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(188, my - hM, 24, hM);
      text('N', 200, my - hM + 12, { align: 'center', font: '700 10px "Space Grotesk",sans-serif', col: '#fff' });
      ctx.strokeStyle = '#888'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(120, topY); ctx.lineTo(170, topY); ctx.moveTo(120, coilY); ctx.lineTo(160, coilY); ctx.stroke(); ctx.setLineDash([]);
      arrow(130, topY, 130, coilY, '#111', null, { w: 1.2, head: 5 }); arrow(130, coilY, 130, topY, '#111', null, { w: 1.2, head: 5 }); text('h = ' + v.h + ' cm', 124, (topY + coilY) / 2 + 4, { align: 'right', font: '700 11px "IBM Plex Mono",monospace' });
      text('v through coil = ' + fplain(d.vc) + ' m/s', 12, 312, { font: '700 12px "Space Grotesk",sans-serif' });
      panelTitle('COIL emf vs TIME (DATA LOGGER)', 395, 18); const gx = 405, gw = 182, gy = 165, gh = 110, P = d.pts, tEnd = P[P.length - 1][0], tA = P.findIndex(p => p[2] < 3 * 0.015), tS = P[Math.max(0, tA)][0], span = tEnd - tS, X = t => gx + gw * (t - tS) / span, emax = Math.max(0.05, 1.4 * Math.max(d.p1, d.p2));
      ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy + gh); ctx.stroke();
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.2; ctx.beginPath(); let st = false; P.forEach(([t, e]) => { if (t < tS) return; const x = X(t), y = gy - gh * e / emax; st ? ctx.lineTo(x, y) : ctx.moveTo(x, y); st = true; }); ctx.stroke();
      text('+' + fplain(+d.p1.toFixed(3)) + ' V', gx + 4, gy - gh * d.p1 / emax - 6, { font: '700 10px "IBM Plex Mono",monospace', col: '#c43a00' }); text('−' + fplain(+d.p2.toFixed(3)) + ' V', gx + gw - 4, gy + gh * d.p2 / emax + 14, { align: 'right', font: '700 10px "IBM Plex Mono",monospace', col: '#c43a00' });
      text('time →  (' + fplain(+(span * 1000).toFixed(0)) + ' ms shown)', gx + gw, gy + gh + 14, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    if (mode === 'gen'){
      if (A.th === undefined || A.reset){ A.th = 0; A.tt = 0; } const wv = 2 * PI * Math.min(v.f, 1.2); A.th += wv * dt; A.tt += dt;
      panelTitle('COIL ROTATING IN A FIELD (side view)', 10, 18);
      ctx.fillStyle = '#c43a00'; ctx.fillRect(20, 70, 40, 200); ctx.fillStyle = '#1546d6'; ctx.fillRect(330, 70, 40, 200); for (let y = 90; y < 270; y += 36) arrow(64, y, 326, y, 'rgba(122,63,176,0.3)', null, { w: 1.5, head: 6 });
      const c = Math.cos(A.th), hw = 70 * Math.abs(c) + 4; ctx.strokeStyle = '#c47a3a'; ctx.lineWidth = 6; ctx.strokeRect(195 - hw, 100, 2 * hw, 140); ctx.fillStyle = 'rgba(196,122,58,0.15)'; ctx.fillRect(195 - hw, 100, 2 * hw, 140);
      text('Φ ∝ cos ωt', 195, 270, { align: 'center', font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('Φ AND ε vs TIME', 395, 18); const gx = 405, gw = 180, ph = A.th % (4 * PI);
      [[110, Math.cos, '#7a3fb0', 'Φ'], [240, Math.sin, '#c43a00', 'ε']].forEach(([gy, f, col, l]) => { ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 120; i++){ const a = 4 * PI * i / 120; i ? ctx.lineTo(gx + gw * i / 120, gy - 45 * f(a)) : ctx.moveTo(gx, gy - 45 * f(a)); } ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(gx + gw * ph / (4 * PI), gy - 45 * f(ph), 4, 0, 7); ctx.fill(); text(l, gx - 12, gy + 4, { font: '700 12px "IBM Plex Mono",monospace', col }); });
      text('ε₀ = ' + fplain(d.peak) + ' V', 400, 300, { font: '700 14px "Space Grotesk",sans-serif' });
      return;
    }
    if (mode === 'loop'){
      const sc = 4.5, a = v.a * sc, w = v.w * sc, fx0 = 150, total = (v.w + v.a) / 100, x0 = fx0 - a - 20;
      if (A.s === undefined || A.reset) A.s = 0; A.s = (A.s + dt / Math.max(1.5, total / v.v * 1.5)) % 1.2; const s = Math.min(1, A.s), lx = x0 + (w + a + 40) * s;
      panelTitle('SQUARE LOOP MOVING THROUGH A FIELD REGION', 10, 18);
      ctx.fillStyle = 'rgba(122,63,176,0.08)'; ctx.fillRect(fx0, 40, w, 200); cross(fx0, 40, fx0 + w, 240);
      const inside = Math.max(0, Math.min(lx + a, fx0 + w) - Math.max(lx, fx0)); ctx.fillStyle = 'rgba(255,106,43,0.3)'; ctx.fillRect(Math.max(lx, fx0), 140 - a / 2, inside, a);
      ctx.strokeStyle = '#c47a3a'; ctx.lineWidth = 4; ctx.strokeRect(lx, 140 - a / 2, a, a); arrow(lx + a + 6, 140, lx + a + 30, 140, COL.V, 'v', { w: 2.5 });
      const entering = lx + a > fx0 && lx < fx0 && lx + a < fx0 + w, leaving = lx < fx0 + w && lx + a > fx0 + w;
      text(entering ? 'entering: ε, current CCW' : leaving ? 'leaving: ε reversed, CW' : inside > 0 ? 'Φ constant: ε = 0' : 'outside: Φ = 0', 12, 262, { font: '700 12px "Space Grotesk",sans-serif', col: entering || leaving ? '#c43a00' : '#4a4a4a' });
      panelTitle('Φ AND ε vs POSITION', 395, 18);
      const gx = 405, gw = 180, X = q => gx + gw * q, phi = q => { const L = x0 + (w + a + 40) * q; return Math.max(0, Math.min(L + a, fx0 + w) - Math.max(L, fx0)) / Math.min(a, w); };
      [[110, phi, '#7a3fb0', 'Φ'], [240, q => (phi(Math.min(1, q + 0.002)) - phi(Math.max(0, q - 0.002))) / 0.004 * Math.min(a, w) / (w + a + 40) * 1.8, '#c43a00', 'ε']].forEach(([gy, f, col, l]) => { ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 200; i++){ const q = i / 200, y = gy - 55 * Math.max(-1.2, Math.min(1.2, f(q))); i ? ctx.lineTo(X(q), y) : ctx.moveTo(X(q), y); } ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(s), gy - 55 * Math.max(-1.2, Math.min(1.2, f(s))), 4, 0, 7); ctx.fill(); text(l, gx - 12, gy + 4, { font: '700 12px "IBM Plex Mono",monospace', col }); });
      text('ε (+ = counterclockwise)', 405, 300 - 10, { font: '600 9px "IBM Plex Mono",monospace', col: '#c43a00' }); text('ε = Bav = ' + fplain(d.emf) + ' V', 400, 314, { font: '700 13px "Space Grotesk",sans-serif' });
      return;
    }
    if (A.x === undefined || A.reset) A.x = 0; A.x = (A.x + v.v * 12 * dt) % 200; const rx = 120 + A.x, sp = 50 + 180 * v.L;
    panelTitle('ROD SLIDING ON RAILS (B into page)', 10, 18);
    const yT = 165 - sp / 2, yB = 165 + sp / 2; cross(20, yT - 10, 385, yB + 10);
    ctx.strokeStyle = '#555'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(40, yT); ctx.lineTo(385, yT); ctx.moveTo(40, yB); ctx.lineTo(385, yB); ctx.stroke();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(40, yT); ctx.lineTo(40, 140); ctx.moveTo(40, 190); ctx.lineTo(40, yB); ctx.stroke(); ctx.strokeRect(32, 140, 16, 50); text('R', 54, 170, { font: '700 12px "IBM Plex Mono",monospace' });
    ctx.fillStyle = 'rgba(255,106,43,0.18)'; ctx.fillRect(40, yT, rx - 40, sp);
    ctx.strokeStyle = '#c47a3a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(rx, yT - 6); ctx.lineTo(rx, yB + 6); ctx.stroke();
    arrow(rx + 6, 165, rx + 40, 165, COL.V, 'v', { w: 3 }); arrow(rx - 6, 145, rx - 6 - Math.min(60, 10 + d.F * 20), 145, COL.F, 'F_B', { w: 3 });
    arrow(rx - 10, yB - 20, rx - 10, yT + 20, '#1e7d45', null, { w: 2, head: 7 }); text('I', rx - 22, yT + 30, { font: '700 12px "IBM Plex Mono",monospace', col: '#1e7d45' }); text('CCW', 60, yT + 18, { font: '700 11px "IBM Plex Mono",monospace', col: '#1e7d45' });
    text('ε = ' + fplain(d.emf) + ' V  I = ' + fplain(d.I) + ' A', 12, 312, { font: '700 13px "Space Grotesk",sans-serif' });
    panelTitle('ENERGY CHECK', 395, 18); text('Fv = ' + fplain(d.P) + ' W', 400, 56, { font: '700 13px "Space Grotesk",sans-serif' }); text('I²R = ' + fplain(d.Pr) + ' W', 400, 80, { font: '700 13px "Space Grotesk",sans-serif' });
  }
};
