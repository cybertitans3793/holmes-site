// Inclines: will it slip? Sliding down with friction, and pushed up the ramp.
const SIM = {
  title: 'Inclines',
  modes: [{ id: 'rest', label: 'Will it slide?' }, { id: 'push', label: 'Pushed up the ramp' }],
  ivs(mode){
    const l = [{ id: 'th', sym: 'θ', symText: 'θ', label: 'Ramp angle', unit: '°', min: 0, max: 60, step: 0.5, val: mode === 'rest' ? 20 : 25, graph: true, show: x => x.toFixed(1) + '°' },
      { id: 'm', sym: 'm', symText: 'm', label: 'Block mass', unit: 'kg', min: 1, max: 20, step: 0.5, val: 5 }];
    if (mode === 'rest') l.push({ id: 'mus', sym: 'μ<sub>s</sub>', symText: 'μs', label: 'Static friction', unit: '', min: 0, max: 1, step: 0.01, val: 0.5, show: x => x.toFixed(2) });
    l.push({ id: 'muk', sym: 'μ<sub>k</sub>', symText: 'μk', label: 'Kinetic friction', unit: '', min: 0, max: 1, step: 0.01, val: 0.4, show: x => x.toFixed(2) });
    if (mode === 'push') l.push({ id: 'F', sym: 'F', symText: 'F', label: 'Push (along the ramp, up)', unit: 'N', min: 0, max: 150, step: 1, val: 50 });
    return l;
  },
  presets: [{ label: 'Frictionless', v: { mus: 0, muk: 0 } }, { label: 'Just about to slip', mode: 'rest', v: { th: 26.5, mus: 0.5 } }, { label: 'Steep', mode: 'rest', v: { th: 40 } }],
  calc(v, mode){
    const th = v.th * DEG, W = v.m * G10, Wpar = W * Math.sin(th), Wperp = W * Math.cos(th), N = Wperp, mukE = mode === 'rest' ? Math.min(v.muk, v.mus) : v.muk;
    if (mode === 'rest'){
      const fmax = v.mus * N, slides = Wpar > fmax + 1e-9, f = slides ? mukE * N : Wpar, a = slides ? (Wpar - f) / v.m : 0;
      return { W, Wpar, Wperp, N, fmax, slides, f, a, thSlip: Math.atan(v.mus) / DEG, mukE, bad: v.muk > v.mus };
    }
    const fk = v.muk * N, net = v.F - Wpar - fk, a = net / v.m;
    return { W, Wpar, Wperp, N, f: fk, net, a, Fconst: Wpar + fk, slides: true };
  },
  dvs(mode){
    if (mode === 'rest') return [
      { id: 'f', name: 'Friction on the block', short: 'f', sym: 'f', unit: 'N', f: d => d.f, vs: 'Wpar' },
      { id: 'a', name: 'Acceleration down the ramp', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a },
      { id: 'N', name: 'Normal force mg cosθ', short: 'N', sym: 'N', unit: 'N', f: d => d.N },
      { id: 'Wpar', name: 'Weight along the ramp mg sinθ', short: 'mg sinθ', sym: 'mg sinθ', unit: 'N', f: d => d.Wpar }];
    return [
      { id: 'a', name: 'Acceleration up the ramp', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a },
      { id: 'Fconst', name: 'Push for constant velocity up', short: 'F_const', sym: 'F<sub>const</sub>', unit: 'N', f: d => d.Fconst },
      { id: 'N', name: 'Normal force', short: 'N', sym: 'N', unit: 'N', f: d => d.N }];
  },
  work(v, d, mode){
    let h = '<h4>1 · Tilt your axes: x along the ramp, y perpendicular to it</h4><p class="st">Then only the weight needs splitting:</p>' +
      TEX`W = mg` + TEX`W = (${M.iv('m')})(10\,\text{m/s}^2)` + TEXA`W = ${M.n(d.W, 'N')}` +
      '<p class="st">Along the ramp (down):</p>' + TEX`W_{\parallel} = mg\sin\theta` + TEX`W_{\parallel} = ${M.n(d.W)}\sin ${M.iv('th')}` + TEXA`W_{\parallel} = ${M.n(d.Wpar, 'N')}` +
      '<p class="st">Into the ramp:</p>' + TEX`W_{\perp} = mg\cos\theta` + TEXA`W_{\perp} = ${M.n(d.Wperp, 'N')}` +
      '<p class="note">Check: θ = 0 → all of mg presses into the floor; θ = 90° → all of it pulls along the (vertical) wall. sin goes with “along” here because θ is the ramp angle.</p>' +
      '<h4>2 · Perpendicular: no acceleration</h4>' + TEX`N = mg\cos\theta` + TEXA`N = ${M.n(d.N, 'N')}`;
    if (mode === 'rest'){
      h += '<h4>3 · Can static friction hold it?</h4><p class="st">Friction needed to hold it:</p>' + TEXA`f = mg\sin\theta = ${M.n(d.Wpar, 'N')}` +
        '<p class="st">Most static friction can give:</p>' + TEX`f_{s,\text{max}} = \mu_s N` + TEX`f_{s,\text{max}} = (${M.iv('mus')})(${M.n(d.N)})` + TEXA`f_{s,\text{max}} = ${M.n(d.fmax, 'N')}`;
      h += d.slides ? '<div class="bad">' + H.n(d.Wpar, 'N') + ' > ' + H.n(d.fmax, 'N') + ' → it <b>slides</b>.</div>' +
        '<h4>4 · Sliding: kinetic friction</h4>' + TEX`a = \frac{mg\sin\theta - \mu_k mg\cos\theta}{m}` + TEX`a = g\left(\sin\theta - \mu_k\cos\theta\right)` + TEXA`a = ${M.n(d.a, 'm/s²')}` + '<p class="st">down the ramp (mass cancels)</p>' + (d.bad ? '<p class="note">μ<sub>k</sub> above μ<sub>s</sub> isn’t realistic; using μ<sub>k</sub> = μ<sub>s</sub>.</p>' : '')
        : TEX`${M.n(d.Wpar, 'N')} \le ${M.n(d.fmax, 'N')}` + '<p class="st">It <b>stays put</b>. Static friction is exactly the needed amount (not μ<sub>s</sub>N), pointing up the ramp:</p>' + TEXA`f_s = ${M.n(d.f, 'N')}`;
      h += '<h4>' + (d.slides ? '5' : '4') + ' · The slipping angle</h4><p class="st">Just about to slip:</p>' + TEX`mg\sin\theta = \mu_s mg\cos\theta` + TEXA`\tan\theta = \mu_s` + TEXA`\theta_{\text{slip}} = ${M.n(d.thSlip, '°')}` +
        '<p class="st">Mass cancels: a heavy and a light block slip at the same angle.</p>' +
        '<p class="note">Lab tip: tilt a board until a block just slips, measure θ, and you’ve measured μ<sub>s</sub> = tanθ.</p>';
      return h;
    }
    h += '<h4>3 · Along the ramp (up = +), block moving up</h4><p class="st">Friction points down the ramp (against the motion):</p>' +
      TEX`f_k = \mu_k N` + TEX`f_k = (${M.iv('muk')})(${M.n(d.N)})` + TEXA`f_k = ${M.n(d.f, 'N')}` +
      TEX`\Sigma F = F - mg\sin\theta - f_k` + TEX`\Sigma F = ${M.iv('F')} - ${M.n(d.Wpar)} - ${M.n(d.f)}` + TEXA`\Sigma F = ${M.n(d.net, 'N')}` +
      TEX`a = \frac{\Sigma F}{m}` + TEXA`a = ${M.n(d.a, 'm/s²')}` + '<p class="st">' + (d.a > 0.005 ? 'Speeding up the ramp.' : d.a < -0.005 ? 'Slowing down while it still moves up.' : 'Constant velocity.') + '</p>' +
      '<h4>4 · Push for constant velocity up the ramp</h4>' + TEX`\Sigma F = 0` + TEX`F = mg\sin\theta + \mu_k mg\cos\theta` + TEXA`F = ${M.n(d.Fconst, 'N')}` +
      '<p class="note">Pushing it <i>down</i> the ramp at constant speed would need F = μ<sub>k</sub>mg cosθ − mg sinθ instead: friction flips direction, gravity doesn’t.</p>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    panelTitle(mode === 'rest' ? 'BLOCK ON A RAMP' : 'PUSHED UP THE RAMP', 10, 18);
    const th = v.th * DEG, Lr = 330, bx0 = 20, by0 = 290, topx = bx0 + Lr * Math.cos(th), topy = by0 - Lr * Math.sin(th);
    ctx.fillStyle = '#e6dccb'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx0 + Lr * Math.cos(th), by0); ctx.lineTo(topx, topy); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (v.th > 2){ ctx.beginPath(); ctx.arc(bx0, by0, 40, -th, 0); ctx.stroke(); text('θ', bx0 + 48, by0 - 6, { font: '700 12px "Space Grotesk",sans-serif' }); }
    // block position along the ramp (s from the bottom, in px)
    const cyc = 3, tt = A.t % (cyc + 1), sTop = 230;
    let s = 170;
    if (mode === 'rest' && d.slides) s = Math.max(80, sTop - 0.5 * d.a * Math.min(tt, cyc) ** 2 * 14);
    if (mode === 'push'){ const v0 = 1.5; const q = Math.min(tt, cyc); s = Math.min(270, Math.max(80, 90 + (v0 * q + 0.5 * d.a * q * q) * 14)); }
    const ux = Math.cos(th), uy = -Math.sin(th), nx = Math.sin(th), ny = Math.cos(th);   // along-ramp (up) and outward normal (screen coords: normal = (−sin, −cos))
    const cx = bx0 + s * ux - 18 * nx, cy = by0 + s * uy - 18 * ny;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-th); ctx.fillStyle = '#ff6a2b'; ctx.fillRect(-20, -18, 40, 36); ctx.strokeRect(-20, -18, 40, 36); ctx.restore();
    const sc = 70 / Math.max(d.W, 1), A2 = (len, dx, dy, col, lab, o) => arrow(cx, cy, cx + dx * len * sc, cy + dy * len * sc, col, lab, o || {});
    A2(d.W, 0, 1, COL.W, 'mg', { lx: 6, ly: 4 });
    A2(d.N, -nx, -ny, COL.N, 'N', { lx: -6, ly: -6, align: 'right' });
    ctx.setLineDash([4, 3]); A2(d.Wpar, -ux, -uy, COL.comp, 'mg sinθ', { w: 2, head: 6, lx: -6, ly: 10, align: 'right' }); A2(d.Wperp, nx, ny, COL.comp, 'mg cosθ', { w: 2, head: 6, lx: 6, ly: 8 }); ctx.setLineDash([]);
    if (d.f > 0.01){ const dir = mode === 'push' ? -1 : 1; arrow(cx + 20 * nx * 0, cy, cx + dir * ux * d.f * sc, cy + dir * uy * d.f * sc, COL.F, 'f', { w: 3, lx: dir * 6, ly: -8 }); }
    if (mode === 'push' && v.F > 0) arrow(cx - ux * (30 + v.F * sc), cy - uy * (30 + v.F * sc), cx - ux * 22, cy - uy * 22, COL.T, 'F', { lx: -6, ly: -10, align: 'right' });
    // right: status and component comparison
    panelTitle('ALONG THE RAMP (N)', 395, 18);
    const bmax = Math.max(d.Wpar, d.f, mode === 'push' ? v.F : 0, mode === 'rest' ? d.fmax : 0, 1), bw = 85;
    const bar = (y, val, col, lab) => { ctx.fillStyle = col; ctx.fillRect(470, y, bw * val / bmax, 14); text(lab, 465, y + 11, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(val), 474 + bw * val / bmax, y + 11, { font: '600 10px "IBM Plex Mono",monospace' }); };
    bar(45, d.Wpar, COL.comp, 'mg sinθ');
    if (mode === 'rest'){ bar(70, d.fmax, '#bbb', 'max μs·N'); bar(95, d.f, COL.F, d.slides ? 'μk·N' : 'f (static)'); }
    else { bar(70, d.f, COL.F, 'μk·N'); bar(95, v.F, COL.T, 'push F'); }
    const msg = mode === 'rest' ? (d.slides ? 'slides: a = ' + fplain(d.a) + ' m/s²' : 'stays put') : (Math.abs(d.a) < 0.005 ? 'constant velocity' : d.a > 0 ? 'speeds up the ramp: a = ' + fplain(d.a) + ' m/s²' : 'slows down: a = ' + fplain(d.a) + ' m/s²');
    text(msg, 395, 140, { font: '700 13px "Space Grotesk",sans-serif', col: mode === 'rest' && !d.slides ? '#1e7d45' : '#c43a00' });
    if (mode === 'rest') text('slips at θ = tan⁻¹(μs) = ' + fplain(d.thSlip) + '°', 395, 162, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    else text('constant v needs F = ' + fplain(d.Fconst) + ' N', 395, 162, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
