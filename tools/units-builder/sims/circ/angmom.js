// Angular Momentum: L = Iω is conserved with no outside torque. Spinning stool, jumping onto a merry-go-round, clay hitting a door.
const SIM = {
  title: 'Angular Momentum',
  modes: [{ id: 'stool', label: 'Pull the weights in' }, { id: 'jump', label: 'Jump on a merry-go-round' }, { id: 'door', label: 'Clay hits a door' }],
  ivs(mode){
    if (mode === 'stool') return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Each dumbbell', unit: 'kg', min: 0.5, max: 5, step: 0.1, val: 2 },
      { id: 'r1', sym: 'r<sub>1</sub>', symText: 'r1', label: 'Arms out', unit: 'm', min: 0.4, max: 1, step: 0.01, val: 0.8 },
      { id: 'r2', sym: 'r<sub>2</sub>', symText: 'r2', label: 'Arms in', unit: 'm', min: 0.1, max: 0.4, step: 0.01, val: 0.2, graph: true },
      { id: 'w1', sym: 'ω<sub>1</sub>', symText: 'ω1', label: 'Spin with arms out', unit: 'rad/s', min: 0.5, max: 6, step: 0.1, val: 2 }];
    if (mode === 'jump') return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Kid’s mass', unit: 'kg', min: 20, max: 80, step: 1, val: 40 },
      { id: 'v', sym: 'v', symText: 'v', label: 'Kid’s running speed (along the edge)', unit: 'm/s', min: 1, max: 8, step: 0.1, val: 4, graph: true },
      { id: 'M', sym: 'M', symText: 'M', label: 'Merry-go-round mass (disk)', unit: 'kg', min: 50, max: 300, step: 5, val: 150 },
      { id: 'R', sym: 'R', symText: 'R', label: 'Radius', unit: 'm', min: 1, max: 3, step: 0.05, val: 2 }];
    return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Clay mass', unit: 'kg', min: 0.05, max: 1, step: 0.01, val: 0.2 },
      { id: 'v', sym: 'v', symText: 'v', label: 'Clay speed', unit: 'm/s', min: 2, max: 20, step: 0.5, val: 10 },
      { id: 'r', sym: 'r', symText: 'r', label: 'Where it hits (from the hinge)', unit: 'm', min: 0.05, max: 1, step: 0.01, val: 0.8, graph: true },
      { id: 'M', sym: 'M', symText: 'M', label: 'Door mass (1 m wide)', unit: 'kg', min: 5, max: 30, step: 0.5, val: 15 }];
  },
  presets: [{ label: 'Hit near the hinge', mode: 'door', v: { r: 0.1 } }, { label: 'Hit the edge', mode: 'door', v: { r: 1 } }],
  calc(v, mode){
    if (mode === 'stool'){ const Ib = 1.2, I1 = Ib + 2 * v.m * v.r1 * v.r1, I2 = Ib + 2 * v.m * v.r2 * v.r2, L = I1 * v.w1, w2 = L / I2, K1 = 0.5 * I1 * v.w1 * v.w1, K2 = 0.5 * I2 * w2 * w2;
      return { Ib, I1, I2, L, Lf: I2 * w2, w2, K1, K2, ratio: w2 / v.w1 }; }
    if (mode === 'jump'){ const Id = 0.5 * v.M * v.R * v.R, L = v.m * v.v * v.R, If = Id + v.m * v.R * v.R, w = L / If, K1 = 0.5 * v.m * v.v * v.v, K2 = 0.5 * If * w * w;
      return { Id, L, Lf: If * w, If, w, K1, K2, vEdge: w * v.R }; }
    const Id = v.M / 3, L = v.m * v.v * v.r, If = Id + v.m * v.r * v.r, w = L / If, K1 = 0.5 * v.m * v.v * v.v, K2 = 0.5 * If * w * w;
    return { Id, L, Lf: If * w, If, w, K1, K2 };
  },
  dvs(mode){
    if (mode === 'stool') return [{ id: 'w2', name: 'Spin with arms in', short: 'ω2', sym: 'ω<sub>2</sub>', unit: 'rad/s', f: d => d.w2 }, { id: 'K2', name: 'KE after (arms in)', short: 'K2', sym: 'K<sub>2</sub>', unit: 'J', f: d => d.K2, vs: 'K1' }, { id: 'K1', name: 'KE before', short: 'K1', sym: 'K<sub>1</sub>', unit: 'J', f: d => d.K1 }, { id: 'L', name: 'Angular momentum (same before and after)', short: 'L', sym: 'L', unit: 'kg·m²/s', f: d => d.L }];
    return [{ id: 'w', name: 'Angular velocity after', short: 'ω', sym: 'ω', unit: 'rad/s', f: d => d.w }, { id: 'L', name: 'Angular momentum', short: 'L', sym: 'L', unit: 'kg·m²/s', f: d => d.L }, { id: 'K2', name: 'KE after', short: 'K2', sym: 'K<sub>2</sub>', unit: 'J', f: d => d.K2, vs: 'K1' }, { id: 'K1', name: 'KE before', short: 'K1', sym: 'K<sub>1</sub>', unit: 'J', f: d => d.K1 }];
  },
  work(v, d, mode){
    if (mode === 'stool') return '<h4>1 · No outside torque (frictionless stool) → L = Iω stays the same</h4><p class="st">Arms out:</p>' + TEX`I_1 = I_{\text{body}} + 2mr_1^2` + TEX`I_1 = 1.2 + 2(${M.iv('m')})(${M.iv('r1')})^2` + TEXA`I_1 = ${M.n(d.I1, 'kg·m²')}` +
      '<p class="st">Arms in:</p>' + TEX`I_2 = I_{\text{body}} + 2mr_2^2` + TEX`I_2 = 1.2 + 2(${M.iv('m')})(${M.iv('r2')})^2` + TEXA`I_2 = ${M.n(d.I2, 'kg·m²')}` +
      '<h4>2 · I<sub>1</sub>ω<sub>1</sub> = I<sub>2</sub>ω<sub>2</sub></h4>' + TEX`\omega_2 = \frac{I_1\omega_1}{I_2}` + TEX`\omega_2 = \frac{(${M.n(d.I1)})(${M.iv('w1')})}{${M.n(d.I2)}}` + TEXA`\omega_2 = ${M.n(d.w2, 'rad/s')}` + '<p class="st">(' + H.n(d.ratio) + '× faster)</p>' +
      '<h4>3 · Kinetic energy is <i>not</i> conserved</h4>' + TEX`K = \tfrac{1}{2}I\omega^2 = \frac{L^2}{2I}` + TEX`K_1 = ${M.n(d.K1, 'J')}` + TEXA`K_2 = ${M.n(d.K2, 'J')}` + '<p class="st">It goes <b>up</b>: you did work pulling the weights in.</p>' +
      '<p class="note">Same physics as a figure skater pulling her arms in, or a diver tucking.</p>';
    if (mode === 'jump') return '<h4>1 · Before: the kid’s angular momentum about the center</h4><p class="st">Moving along the edge, so r<sub>⊥</sub> = R. The merry-go-round starts at rest.</p>' + TEX`L = mvR` + TEX`L = (${M.iv('m')})(${M.iv('v')})(${M.iv('R')})` + TEXA`L = ${M.n(d.L, 'kg·m²/s')}` +
      '<h4>2 · After: they turn together</h4>' + TEX`I = \tfrac{1}{2}MR^2 + mR^2` + TEX`I = ${M.n(d.Id)} + ${M.n(v.m * v.R * v.R)}` + TEXA`I = ${M.n(d.If, 'kg·m²')}` +
      TEX`\omega = \frac{L}{I}` + TEXA`\omega = ${M.n(d.w, 'rad/s')}` + '<p class="st">The kid now moves at ωR:</p>' + TEX`v = \omega R = ${M.n(d.vEdge, 'm/s')}` +
      '<h4>3 · Energy</h4>' + TEX`K_{\text{before}} = ${M.n(d.K1, 'J')}` + TEXA`K_{\text{after}} = ${M.n(d.K2, 'J')}` + '<p class="st">Some is lost (it’s a perfectly inelastic collision, rotational version).</p>' +
      '<p class="note">Linear momentum isn’t conserved here: the axle pushes on the merry-go-round. That force goes through the axis, so it makes no torque, and L is conserved.</p>';
    return '<h4>1 · Before: the clay’s angular momentum about the hinge</h4>' + TEX`L = mvr` + TEX`L = (${M.iv('m')})(${M.iv('v')})(${M.iv('r')})` + TEXA`L = ${M.n(d.L, 'kg·m²/s')}` +
      '<h4>2 · After: door + clay turn together</h4>' + TEX`I = \tfrac{1}{3}ML^2 + mr^2` + TEX`I = \tfrac{1}{3}(${M.iv('M')})(1)^2 + (${M.iv('m')})(${M.iv('r')})^2` + TEXA`I = ${M.n(d.If, 'kg·m²')}` +
      TEX`\omega = \frac{L}{I}` + TEXA`\omega = ${M.n(d.w, 'rad/s')}` +
      '<h4>3 · Energy</h4>' + TEX`K_{\text{before}} = ${M.n(d.K1, 'J')}` + TEX`K_{\text{after}} = ${M.n(d.K2, 'J')}` + '<p class="st">Most is lost: the clay sticks.</p>' +
      '<p class="note">Hit near the hinge and the door barely moves: small r, small L. That’s why handles are on the far edge.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset){ A.t = 0; A.a1 = 0; A.a2 = 0; } A.t += dt;
    const lbar = (items, title, y0) => { panelTitle(title, 395, y0); const mx = Math.max(...items.map(i => i[1]), 1e-6); items.forEach(([lab, val, col], i) => { const y = y0 + 16 + i * 24, w = 80 * val / mx; ctx.fillStyle = col; ctx.fillRect(470, y, w, 14); text(lab, 465, y + 11, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(val), 474 + w, y + 11, { font: '600 10px "IBM Plex Mono",monospace' }); }); };
    if (mode === 'stool'){
      panelTitle('TOP VIEW: BEFORE (arms out) and AFTER (arms in)', 10, 18);
      A.a1 += v.w1 * dt * 0.5; A.a2 += d.w2 * dt * 0.5;
      [[100, A.a1, v.r1, 'ω₁ = ' + fplain(v.w1)], [280, A.a2, v.r2, 'ω₂ = ' + fplain(d.w2)]].forEach(([cx, a, r, lab]) => { const cy = 160, sc = 95;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(-a); ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 14, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#f2c7a0'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill();
        ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-r * sc, 0); ctx.lineTo(r * sc, 0); ctx.stroke();
        [-1, 1].forEach(sg => { ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(sg * r * sc, 0, 6 + 2 * Math.sqrt(v.m), 0, 7); ctx.fill(); }); ctx.restore();
        text(lab + ' rad/s', cx, 285, { align: 'center', font: '700 12px "IBM Plex Mono",monospace' }); });
      text('animation slowed 2×', 12, 318, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
      lbar([['L before', d.L, '#111'], ['L after', d.Lf, '#111']], 'ANGULAR MOMENTUM (same)', 18);
      lbar([['K before', d.K1, '#ff6a2b'], ['K after', d.K2, '#ff6a2b']], 'KINETIC ENERGY (goes up)', 110);
      return;
    }
    if (mode === 'jump'){
      panelTitle('TOP VIEW: KID RUNS ALONG THE EDGE AND JUMPS ON', 10, 18);
      const cx = 190, cy = 165, sc = 55, Rp = v.R * sc, cyc = 5, tt = A.t % cyc, tJ = 1.5;
      const a = tt < tJ ? 0 : d.w * (tt - tJ) * 0.6;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.fillStyle = '#d9e4f5'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, Rp, 0, 7); ctx.fill(); ctx.stroke();
      for (let k = 0; k < 4; k++){ ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Rp * Math.cos(k * PI / 2), Rp * Math.sin(k * PI / 2)); ctx.stroke(); } ctx.restore();
      let kx, ky; if (tt < tJ){ kx = cx - (tJ - tt) * v.v * sc * 0.4; ky = cy - Rp; } else { kx = cx + Rp * Math.cos(-PI / 2 + a); ky = cy + Rp * Math.sin(-PI / 2 + a); }
      ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(kx, ky, 9, 0, 7); ctx.fill();
      if (tt < tJ) arrow(kx, ky - 16, kx + 30, ky - 16, COL.V, 'v', { w: 2.5, head: 7 });
      text(tt < tJ ? 'running at ' + fplain(v.v) + ' m/s' : 'together: ω = ' + fplain(d.w) + ' rad/s', 12, 300, { font: '700 13px "Space Grotesk",sans-serif' });
      text('animation slowed', 12, 318, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
      lbar([['L before', d.L, '#111'], ['L after', d.Lf, '#111']], 'ANGULAR MOMENTUM (same)', 18);
      lbar([['K before', d.K1, '#ff6a2b'], ['K after', d.K2, '#ff6a2b']], 'KINETIC ENERGY (some lost)', 110);
      return;
    }
    panelTitle('TOP VIEW: CLAY HITS A DOOR AND STICKS', 10, 18);
    const hx = 60, hy = 230, sc = 240, cyc = 4, tt = A.t % cyc, tH = 1, a = tt < tH ? 0 : Math.min(d.w * (tt - tH), 0.8);
    ctx.fillStyle = '#bbb'; ctx.fillRect(hx - 30, hy - 10, 30, 20);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-a); ctx.fillStyle = '#c98a3c'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(0, -6, sc, 12); ctx.strokeRect(0, -6, sc, 12);
    if (tt >= tH){ ctx.fillStyle = '#7a3fb0'; ctx.beginPath(); ctx.arc(v.r * sc, 10, 6, 0, 7); ctx.fill(); }
    ctx.restore(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(hx, hy, 5, 0, 7); ctx.fill();
    if (tt < tH){ const cy = hy + 16 + (tH - tt) * 90; ctx.fillStyle = '#7a3fb0'; ctx.beginPath(); ctx.arc(hx + v.r * sc, cy, 6, 0, 7); ctx.fill(); arrow(hx + v.r * sc + 14, cy + 10, hx + v.r * sc + 14, cy - 20, COL.V, 'v', { w: 2.5, head: 7 }); }
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#888'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx, hy - 24); ctx.lineTo(hx + v.r * sc, hy - 24); ctx.stroke(); ctx.setLineDash([]); text('r = ' + fplain(v.r) + ' m', hx + v.r * sc / 2, hy - 30, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('ω after = ' + fplain(d.w) + ' rad/s', 12, 300, { font: '700 13px "Space Grotesk",sans-serif' });
    lbar([['L before', d.L, '#111'], ['L after', d.Lf, '#111']], 'ANGULAR MOMENTUM (same)', 18);
    lbar([['K before', d.K1, '#ff6a2b'], ['K after', d.K2, '#ff6a2b']], 'KINETIC ENERGY (mostly lost)', 110);
  }
};
