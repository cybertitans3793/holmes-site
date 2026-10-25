// 2D Collisions: air-hockey pucks. Momentum is conserved in x and in y separately.
const SIM = {
  title: '2D Collisions',
  modes: [{ id: 'stick', label: 'Velcro pucks stick' }, { id: 'glance', label: 'Glancing hit (B at rest)' }],
  ivs(mode){
    const l = [
      { id: 'mA', sym: 'm<sub>A</sub>', symText: 'mA', label: 'Puck A mass', unit: 'kg', min: 0.1, max: 1, step: 0.01, val: 0.2 },
      { id: 'mB', sym: 'm<sub>B</sub>', symText: 'mB', label: 'Puck B mass', unit: 'kg', min: 0.1, max: 1, step: 0.01, val: 0.2 },
      { id: 'vA', sym: 'v<sub>A</sub>', symText: 'vA', label: 'A’s speed (moving right)', unit: 'm/s', min: 0.2, max: 5, step: 0.1, val: 3, graph: true }];
    if (mode === 'stick') l.push({ id: 'vB', sym: 'v<sub>B</sub>', symText: 'vB', label: 'B’s speed (moving up)', unit: 'm/s', min: 0, max: 5, step: 0.1, val: 2 });
    else l.push({ id: 'uA', sym: 'v<sub>A</sub>′', symText: 'vA′', label: 'A’s speed after', unit: 'm/s', min: 0, max: 5, step: 0.05, val: 2.6 },
                { id: 'thA', sym: 'θ<sub>A</sub>', symText: 'θA', label: 'A’s angle after (above the x-axis)', unit: '°', min: 0, max: 90, step: 1, val: 30, show: v => v.toFixed(0) + '°' });
    return l;
  },
  calc(v, mode){
    const mA = v.mA, mB = v.mB, pAx = mA * v.vA;
    if (mode === 'stick'){
      const pBy = mB * v.vB, M = mA + mB, Vx = pAx / M, Vy = pBy / M, V = Math.hypot(Vx, Vy), ang = Math.atan2(Vy, Vx) / DEG;
      const K0 = 0.5 * mA * v.vA ** 2 + 0.5 * mB * v.vB ** 2, K1 = 0.5 * M * V * V;
      return { pAx, pBy, px: pAx, py: pBy, Vx, Vy, V, ang, K0, K1, lost: 1 - K1 / K0, p: Math.hypot(pAx, pBy) };
    }
    const th = v.thA * DEG, pAx1 = mA * v.uA * Math.cos(th), pAy1 = mA * v.uA * Math.sin(th);
    const pBx1 = pAx - pAx1, pBy1 = -pAy1, uB = Math.hypot(pBx1, pBy1) / mB, angB = Math.atan2(pBy1, pBx1) / DEG;
    const K0 = 0.5 * mA * v.vA ** 2, K1 = 0.5 * mA * v.uA ** 2 + 0.5 * mB * uB * uB;
    return { pAx, pAx1, pAy1, pBx1, pBy1, uB, angB, K0, K1, lost: 1 - K1 / K0, gain: K1 > K0 * 1.01, between: Math.abs(v.thA - angB) };
  },
  dvs(mode){ return mode === 'stick' ? [
      { id: 'V', name: 'Speed after sticking', short: 'V', sym: 'V', unit: 'm/s', f: d => d.V },
      { id: 'ang', name: 'Direction after (above x-axis)', short: 'angle', sym: 'angle', unit: '°', f: d => d.ang },
      { id: 'lost', name: 'Fraction of KE lost', short: 'KE lost', sym: 'KE lost', unit: '', f: d => d.lost }]
    : [
      { id: 'uB', name: 'B’s speed after', short: 'v_B′', sym: 'v<sub>B</sub>′', unit: 'm/s', f: d => d.uB },
      { id: 'angB', name: 'B’s direction (below x-axis)', short: 'θ_B', sym: 'θ<sub>B</sub>', unit: '°', f: d => -d.angB },
      { id: 'K1', name: 'Total KE after', short: 'K after', sym: 'K<sub>after</sub>', unit: 'J', f: d => d.K1, vs: 'K0' },
      { id: 'K0', name: 'Total KE before', short: 'K before', sym: 'K<sub>before</sub>', unit: 'J', f: d => d.K0 }]; },
  work(v, d, mode){
    if (mode === 'stick') return '<h4>1 · Momentum before, in components</h4><div class="eq">p<sub>x</sub> = m<sub>A</sub>v<sub>A</sub> = (' + H.iv('mA') + ')(' + H.iv('vA') + ') = ' + H.n(d.px, 'kg·m/s') + '</div><div class="eq">p<sub>y</sub> = m<sub>B</sub>v<sub>B</sub> = (' + H.iv('mB') + ')(' + H.iv('vB') + ') = ' + H.n(d.py, 'kg·m/s') + '</div>' +
      '<h4>2 · Each component is conserved separately</h4><div class="eq">V<sub>x</sub> = p<sub>x</sub>/(m<sub>A</sub> + m<sub>B</sub>) = ' + H.n(d.Vx, 'm/s') + ', V<sub>y</sub> = p<sub>y</sub>/(m<sub>A</sub> + m<sub>B</sub>) = ' + H.n(d.Vy, 'm/s') + '</div>' +
      '<h4>3 · Put the components back together</h4><div class="eq">V = √(V<sub>x</sub>² + V<sub>y</sub>²) = <b>' + H.n(d.V, 'm/s') + '</b> at tan<sup>−1</sup>(V<sub>y</sub>/V<sub>x</sub>) = <b>' + H.n(d.ang, '°') + '</b> above the x-axis</div>' +
      '<h4>4 · Kinetic energy</h4><div class="eq">' + H.n(d.K0, 'J') + ' → ' + H.n(d.K1, 'J') + ': ' + H.n(100 * d.lost) + '% lost (sticking is inelastic).</div>' +
      '<p class="note">You can’t add the speeds or the energies to get the answer. Momentum is a vector: add it tip to tail.</p>';
    return '<h4>1 · Before: all of the momentum is along x</h4><div class="eq">p<sub>x</sub> = m<sub>A</sub>v<sub>A</sub> = (' + H.iv('mA') + ')(' + H.iv('vA') + ') = ' + H.n(d.pAx, 'kg·m/s') + ', p<sub>y</sub> = 0</div>' +
      '<h4>2 · A after, in components</h4><div class="eq">p<sub>Ax</sub>′ = m<sub>A</sub>v<sub>A</sub>′cosθ<sub>A</sub> = ' + H.n(d.pAx1) + ', p<sub>Ay</sub>′ = m<sub>A</sub>v<sub>A</sub>′sinθ<sub>A</sub> = ' + H.n(d.pAy1) + '</div>' +
      '<h4>3 · B gets whatever is left in each direction</h4><div class="eq">p<sub>Bx</sub>′ = ' + H.n(d.pAx) + ' − ' + H.n(d.pAx1) + ' = ' + H.n(d.pBx1) + ' &nbsp; p<sub>By</sub>′ = 0 − ' + H.n(d.pAy1) + ' = ' + H.n(d.pBy1) + '</div>' +
      '<div class="eq">v<sub>B</sub>′ = √(p<sub>Bx</sub>′² + p<sub>By</sub>′²)/m<sub>B</sub> = <b>' + H.n(d.uB, 'm/s') + '</b> at <b>' + H.n(-d.angB, '°') + '</b> below the x-axis</div>' +
      '<p class="note">The y-momenta of A and B after must cancel, so they go off on opposite sides.</p>' +
      '<h4>4 · Energy check</h4><div class="eq">K before ' + H.n(d.K0, 'J') + ', K after ' + H.n(d.K1, 'J') + '</div>' +
      (d.gain ? '<div class="bad">K went up. That is impossible without an energy source: make A slower after the hit.</div>'
              : Math.abs(d.lost) < 0.01 ? '<div class="ok">Elastic (K kept).' + (Math.abs(v.mA - v.mB) < 0.005 ? ' Equal masses: the paths are ' + H.n(d.between, '°') + ' apart (90° for elastic).' : '') + '</div>'
              : '<div class="ok">' + H.n(100 * d.lost) + '% of K lost: an inelastic collision.</div>');
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle('TABLE (top view)', 10, 18);
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt; const cyc = 3.6, tc = 1.4, tt = A.t % cyc, sc = 32;
    const cx = 170, cy = 175, rA = 9 + 18 * v.mA, rB = 9 + 18 * v.mB;
    ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 1; ctx.strokeRect(14, 30, 340, 290);
    let ax, ay, bx, by;
    if (mode === 'stick'){
      if (tt < tc){ ax = cx - v.vA * (tc - tt) * sc; ay = cy; bx = cx; by = cy + v.vB * (tc - tt) * sc; }
      else { const s = tt - tc; ax = bx = cx + d.Vx * s * sc; ay = by = cy - d.Vy * s * sc; }
      if (tt >= tc){ ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(ax - rA * 0.5, ay, rA, 0, 7); ctx.fill(); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(bx + rB * 0.5, by, rB, 0, 7); ctx.fill(); }
    } else {
      const th = v.thA * DEG, tb = Math.atan2(d.pBy1, d.pBx1);
      if (tt < tc){ ax = cx - (rA + rB) * Math.cos(-tb) - v.vA * (tc - tt) * sc; ay = cy - (rA + rB) * Math.sin(-tb); bx = cx; by = cy; }
      else { const s = tt - tc; ax = cx - (rA + rB) * Math.cos(-tb) + v.uA * Math.cos(th) * s * sc; ay = cy - (rA + rB) * Math.sin(-tb) - v.uA * Math.sin(th) * s * sc; bx = cx + d.uB * Math.cos(tb) * s * sc; by = cy - d.uB * Math.sin(tb) * s * sc; }
    }
    if (!(mode === 'stick' && tt >= tc)){ ctx.save(); ctx.beginPath(); ctx.rect(14, 30, 340, 290); ctx.clip();
      ctx.fillStyle = '#1546d6'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ax, ay, rA, 0, 7); ctx.fill(); ctx.stroke(); text('A', ax, ay + 4, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#fff' });
      ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(bx, by, rB, 0, 7); ctx.fill(); ctx.stroke(); text('B', bx, by + 4, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#fff' }); ctx.restore(); }
    // momentum vectors tip to tail
    panelTitle('MOMENTUM, TIP TO TAIL', 380, 18);
    const ox = 400, oy = 200, ps = 150 / Math.max(d.pAx * 1.2, Math.hypot(d.pAx, d.pBy || 0), 1e-9);
    text('before', ox, 60, { font: '700 11px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('after', ox, 240, { font: '700 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    if (mode === 'stick'){
      arrow(ox, 110, ox + d.pAx * ps, 110, '#1546d6', 'p_A', { w: 3, lx: 0, ly: 12, align: 'center' });
      arrow(ox + d.pAx * ps, 110, ox + d.pAx * ps, 110 - d.pBy * ps, '#ff6a2b', 'p_B', { w: 3, lx: 6, ly: 0 });
      arrow(ox, 110, ox + d.pAx * ps, 110 - d.pBy * ps, '#8a8a8a', 'total', { w: 2, dash: [5, 4], lx: -8, ly: -6, align: 'right' });
      arrow(ox, 300, ox + d.pAx * ps, 300 - d.pBy * ps, '#111', 'p after = same', { w: 3, lx: 6, ly: -4 });
    } else {
      arrow(ox, 120, ox + d.pAx * ps, 120, '#1546d6', 'p_A', { w: 3, lx: 0, ly: 12, align: 'center' });
      arrow(ox, 280, ox + d.pAx1 * ps, 280 - d.pAy1 * ps, '#1546d6', 'p_A′', { w: 3, lx: -6, ly: -8, align: 'right' });
      arrow(ox + d.pAx1 * ps, 280 - d.pAy1 * ps, ox + d.pAx * ps, 280, '#ff6a2b', 'p_B′', { w: 3, lx: 6, ly: 0 });
      arrow(ox, 280, ox + d.pAx * ps, 280, '#8a8a8a', 'total', { w: 2, dash: [5, 4], lx: 0, ly: 14, align: 'center' });
    }
  }
};
