// Collision Carts: 1D collisions on a track. Elastic, sticky, or an explosion.
const SIM = {
  title: 'Collision Carts',
  modes: [{ id: 'elastic', label: 'Elastic (magnets/springs)' }, { id: 'sticky', label: 'Sticky (clay)' }, { id: 'explode', label: 'Explosion (spring release)' }],
  ivs(mode){
    const l = [
      { id: 'mA', sym: 'm<sub>A</sub>', symText: 'mA', label: 'Cart A mass', unit: 'kg', min: 0.5, max: 5, step: 0.1, val: 1, graph: true },
      { id: 'mB', sym: 'm<sub>B</sub>', symText: 'mB', label: 'Cart B mass', unit: 'kg', min: 0.5, max: 5, step: 0.1, val: 1 }];
    if (mode === 'explode' && window.ABP) l.push({ id: 'ua', sym: 'v<sub>A</sub>′', symText: 'vA', label: 'A’s speed after (moving left)', unit: 'm/s', min: 0.2, max: 3, step: 0.1, val: 1 });
    else if (mode === 'explode') l.push({ id: 'Es', sym: 'U<sub>s</sub>', symText: 'Us', label: 'Spring energy released', unit: 'J', min: 0.5, max: 20, step: 0.5, val: 4 });
    else l.push({ id: 'vA', sym: 'v<sub>A</sub>', symText: 'vA', label: 'A’s velocity before', unit: 'm/s', min: -3, max: 3, step: 0.1, val: 2 },
                { id: 'vB', sym: 'v<sub>B</sub>', symText: 'vB', label: 'B’s velocity before', unit: 'm/s', min: -3, max: 3, step: 0.1, val: 0 });
    return l;
  },
  calc(v, mode){
    const mA = v.mA, mB = v.mB, M = mA + mB;
    let vA = v.vA || 0, vB = v.vB || 0, uA, uB, meet = vA > vB;
    if (mode === 'elastic'){ uA = ((mA - mB) * vA + 2 * mB * vB) / M; uB = ((mB - mA) * vB + 2 * mA * vA) / M; }
    else if (mode === 'sticky'){ uA = uB = (mA * vA + mB * vB) / M; }
    else { vA = vB = 0; meet = true; uA = v.ua !== undefined ? -v.ua : -Math.sqrt(2 * v.Es * mB / (mA * M)); uB = -mA * uA / mB; }
    if (!meet){ uA = vA; uB = vB; }
    const p0 = mA * vA + mB * vB, p1 = mA * uA + mB * uB, K0 = 0.5 * mA * vA * vA + 0.5 * mB * vB * vB, K1 = 0.5 * mA * uA * uA + 0.5 * mB * uB * uB;
    return { vA, vB, uA, uB, p0, p1, K0, K1, dK: K1 - K0, meet, vcm: p0 / M, JB: mB * (uB - vB) };
  },
  dvs(mode){ return (window.ABP ? x => x.filter(q => q.id[0] !== 'K') : x => x)([
    { id: 'uB', name: 'B’s velocity after', short: 'v_B′', sym: 'v<sub>B</sub>′', unit: 'm/s', f: d => d.uB },
    { id: 'uA', name: 'A’s velocity after', short: 'v_A′', sym: 'v<sub>A</sub>′', unit: 'm/s', f: d => d.uA },
    { id: 'p1', name: 'Total momentum after', short: 'p_total', sym: 'p<sub>total</sub>', unit: 'kg·m/s', f: d => d.p1 },
    { id: 'K1', name: 'Total kinetic energy after', short: 'K after', sym: 'K<sub>after</sub>', unit: 'J', f: d => d.K1, vs: mode === 'explode' ? null : 'K0' },
    { id: 'K0', name: 'Total kinetic energy before', short: 'K before', sym: 'K<sub>before</sub>', unit: 'J', f: d => d.K0 },
    { id: 'JB', name: 'Impulse on B', short: 'J_B', sym: 'J<sub>B</sub>', unit: 'N·s', f: d => d.JB }]); },
  work(v, d, mode){
    const ex = mode === 'explode';
    const pb = '<h4>1 · Momentum before (+ = right)</h4>' + TEX`p = m_A v_A + m_B v_B` +
      TEX`p = (${M.iv('mA')})(${ex ? M.n(0, 'm/s') : M.iv('vA')}) + (${M.iv('mB')})(${ex ? M.n(0, 'm/s') : M.iv('vB')})` + TEXA`p = ${M.n(d.p0, 'kg·m/s')}`;
    if (!d.meet) return pb + '<div class="bad">A isn’t gaining on B (v<sub>A</sub> ≤ v<sub>B</sub>), so they never collide. Make A faster than B.</div>';
    let h = pb;
    const pAfter = TEX`p' = (${M.iv('mA')})(${M.p(d.uA)}) + (${M.iv('mB')})(${M.p(d.uB)})` + TEXA`p' = ${M.n(d.p1, 'kg·m/s')}`;
    const sticky = TEX`m_A v_A + m_B v_B = (m_A + m_B)\,v'` + TEX`v' = \frac{p}{m_A + m_B}` + TEX`v' = \frac{${M.n(d.p0)}}{${M.iv('mA')} + ${M.iv('mB')}}` + TEXA`v' = ${M.n(d.uA, 'm/s')}`;
    const zero = TEX`0 = m_A v'_A + m_B v'_B` + TEX`v'_B = -\frac{m_A v'_A}{m_B}` + TEX`v'_B = -\frac{(${M.iv('mA')})(${M.p(d.uA)})}{${M.iv('mB')}}` + TEXA`v'_B = ${M.n(d.uB, 'm/s')}`;
    if (window.ABP){
      if (mode === 'sticky') h += '<h4>2 · Momentum is conserved; they move together</h4>' + sticky;
      else if (mode === 'elastic') h += '<h4>2 · They rebound</h4><p class="st">Perfectly bouncy bumpers. After the collision:</p>' + TEXA`v'_A = ${M.n(d.uA, 'm/s')}` + TEXA`v'_B = ${M.n(d.uB, 'm/s')}` +
        '<h4>3 · Check: momentum after</h4>' + pAfter + '<p class="st">This equals the momentum before ✓</p>' +
        '<p class="note">Equal masses, B at rest: they swap velocities (Newton’s cradle).</p>';
      else h += '<h4>2 · Momentum stays zero</h4>' + zero +
        '<p class="note">The lighter cart moves off faster, but both carts get the same size momentum (' + H.n(Math.abs(v.mA * d.uA), 'kg·m/s') + ') in opposite directions.</p>';
    } else if (mode === 'sticky'){
      h += '<h4>2 · Momentum is conserved; they move together</h4>' + sticky +
        '<h4>3 · Kinetic energy</h4>' + TEX`K = \tfrac{1}{2}mv^2` + TEX`K_{\text{before}} = ${M.n(d.K0, 'J')}` + TEX`K_{\text{after}} = ${M.n(d.K1, 'J')}` +
        TEX`\text{lost} = K_{\text{before}} - K_{\text{after}}` + TEXA`\text{lost} = ${M.n(-d.dK, 'J')}\ \left(${M.n(d.K0 > 0 ? -100 * d.dK / d.K0 : 0)}\%\right)` +
        '<p class="st">This is lost to thermal energy and denting the clay.</p>' +
        '<p class="note">Perfectly inelastic: the most kinetic energy a collision can lose while still conserving momentum.</p>';
    } else if (mode === 'elastic'){
      h += '<h4>2 · Two things are conserved</h4><p class="st">Momentum:</p>' + TEX`m_A v_A + m_B v_B = m_A v'_A + m_B v'_B` +
        '<p class="st">Kinetic energy:</p>' + TEX`\tfrac{1}{2}m_A v_A^2 + \tfrac{1}{2}m_B v_B^2 = \tfrac{1}{2}m_A (v'_A)^2 + \tfrac{1}{2}m_B (v'_B)^2` +
        '<h4>3 · Solving both together gives</h4>' + TEX`v'_A = \frac{(m_A - m_B)\,v_A + 2m_B v_B}{m_A + m_B}` +
        TEX`v'_A = \frac{(${M.n(v.mA - v.mB)})(${M.p(d.vA)}) + 2(${M.iv('mB', 1)})(${M.p(d.vB)})}{${M.n(v.mA + v.mB)}}` + TEXA`v'_A = ${M.n(d.uA, 'm/s')}` +
        TEX`v'_B = \frac{(m_B - m_A)\,v_B + 2m_A v_A}{m_A + m_B}` +
        TEX`v'_B = \frac{(${M.n(v.mB - v.mA)})(${M.p(d.vB)}) + 2(${M.iv('mA', 1)})(${M.p(d.vA)})}{${M.n(v.mA + v.mB)}}` + TEXA`v'_B = ${M.n(d.uB, 'm/s')}` +
        '<h4>4 · Check</h4>' + pAfter + '<p class="st">Momentum is conserved ✓</p>' + TEX`K' = \tfrac{1}{2}(${M.iv('mA')})(${M.p(d.uA)})^2 + \tfrac{1}{2}(${M.iv('mB')})(${M.p(d.uB)})^2` + TEXA`K' = ${M.n(d.K1, 'J')}` + '<p class="st">Kinetic energy is conserved ✓</p>' +
        '<p class="note">Equal masses, B at rest: they swap velocities (Newton’s cradle).</p>';
    } else {
      h += '<h4>2 · Momentum stays zero</h4>' + TEX`0 = m_A v'_A + m_B v'_B` + TEX`v'_B = -\frac{m_A}{m_B}\,v'_A` +
        '<h4>3 · The spring’s energy becomes kinetic energy</h4>' + TEX`U_s = \tfrac{1}{2}m_A (v'_A)^2 + \tfrac{1}{2}m_B (v'_B)^2 = ${M.iv('Es')}` +
        TEX`v'_A = -\sqrt{\frac{2U_s\,m_B}{m_A\,(m_A + m_B)}}` + TEX`v'_A = -\sqrt{\frac{2(${M.iv('Es')})(${M.iv('mB')})}{(${M.iv('mA')})(${M.iv('mA')} + ${M.iv('mB')})}}` + TEXA`v'_A = ${M.n(d.uA, 'm/s')}` + TEXA`v'_B = ${M.n(d.uB, 'm/s')}` +
        '<p class="note">The lighter cart gets the bigger speed and the bigger share of the energy, but both get the same size momentum (' + H.n(Math.abs(v.mA * d.uA), 'kg·m/s') + ').</p>';
    }
    h += '<h4>' + (window.ABP ? (mode === 'elastic' ? 4 : 3) : mode === 'elastic' ? 5 : 4) + ' · Impulse on B (= −impulse on A)</h4>' + TEX`J_B = m_B\,\Delta v_B = m_B\,(v'_B - v_B)` +
      TEX`J_B = (${M.iv('mB')})(${M.n(d.uB)} - ${M.p(d.vB)})` + TEXA`J_B = ${M.n(d.JB, 'N·s')}`;
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle('TRACK (+ to the right)', 10, 18);
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt; const cyc = 4, tc = 1.6, tt = A.t % cyc;
    const sc = 70, cx = 185, gy = 150, wA = 34 + v.mA * 8, wB = 34 + v.mB * 8;
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(0, gy, 370, 8);
    let xA, xB; // centers in px
    const vA0 = d.vA, vB0 = d.vB;
    if (mode === 'explode'){ const s = Math.max(0, tt - tc); xA = cx - wA / 2 + d.uA * s * sc; xB = cx + wB / 2 + d.uB * s * sc; }
    else if (!d.meet){ xA = cx - 60 + vA0 * (tt - tc) * sc; xB = cx + 60 + vB0 * (tt - tc) * sc; }
    else if (tt < tc){ xA = cx - wA / 2 + vA0 * (tt - tc) * sc; xB = cx + wB / 2 + vB0 * (tt - tc) * sc; }
    else { const s = tt - tc; xA = cx - wA / 2 + d.uA * s * sc; xB = cx + wB / 2 + d.uB * s * sc; }
    const cart = (x, w, col, lab) => { ctx.fillStyle = col; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(x - w / 2, gy - 30, w, 26); ctx.strokeRect(x - w / 2, gy - 30, w, 26); ctx.fillStyle = '#111'; [x - w / 3, x + w / 3].forEach(xx => { ctx.beginPath(); ctx.arc(xx, gy - 3, 4, 0, 7); ctx.fill(); }); text(lab, x, gy - 12, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: '#fff' }); };
    ctx.save(); ctx.beginPath(); ctx.rect(0, 25, 378, 150); ctx.clip();
    cart(xA, wA, '#1546d6', 'A'); cart(xB, wB, '#ff6a2b', 'B');
    ctx.restore();
    if (mode === 'explode' && tt < tc){ ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 6, gy - 17); ctx.lineTo(cx + 6, gy - 17); ctx.stroke(); }
    if (!d.meet) text('A never catches B', 12, 318, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' });
    // momentum bars before and after
    const base = 270, top = 190; panelTitle('MOMENTUM (kg·m/s)', 10, 182);
    const pm = Math.max(Math.abs(v.mA * d.vA), Math.abs(v.mB * d.vB), Math.abs(v.mA * d.uA), Math.abs(v.mB * d.uB), Math.abs(d.p0), 0.1) * 1.1, Ys = q => 230 - 40 * q / pm;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(10, 230); ctx.lineTo(360, 230); ctx.stroke();
    const grp = [['before', [v.mA * d.vA, v.mB * d.vB, d.p0], 20], ['after', [v.mA * d.uA, v.mB * d.uB, d.p1], 200]];
    grp.forEach(([lab, vals, x0]) => { vals.forEach((q, i) => { const col = ['#1546d6', '#ff6a2b', '#8a8a8a'][i]; const y = Ys(q); ctx.fillStyle = col; ctx.fillRect(x0 + i * 44, Math.min(y, 230), 36, Math.abs(230 - y)); text(['A', 'B', 'total'][i], x0 + i * 44 + 18, 288, { align: 'center', font: '700 10px "IBM Plex Mono",monospace' }); text(fplain(q), x0 + i * 44 + 18, 302, { align: 'center', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); });
      text(lab, x0 + 66, 318, { align: 'center', font: '700 11px "Space Grotesk",sans-serif' }); });
    if (window.ABP){ panelTitle('VELOCITIES (m/s, + = right)', 390, 18);
      [['A before', d.vA], ['B before', d.vB], ['A after', d.uA], ['B after', d.uB], ['p before', d.p0], ['p after', d.p1]].forEach(([a, b], i) => { text(a, 400, 50 + i * 26 + (i > 3 ? 14 : 0), { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(fplain(b) + (i > 3 ? ' kg·m/s' : ''), 590, 50 + i * 26 + (i > 3 ? 14 : 0), { align: 'right', font: '700 13px "IBM Plex Mono",monospace' }); });
      text(mode === 'elastic' ? 'they rebound' : mode === 'sticky' ? 'they stick together' : 'they push apart', 400, 240, { font: '700 12px "Space Grotesk",sans-serif', col: '#1e7d45' }); return; }
    // energy bars
    panelTitle('KINETIC ENERGY (J)', 390, 18);
    const Km = Math.max(d.K0, d.K1, v.Es || 0, 0.1) * 1.1, kb = 260, kh = 200;
    const bars = mode === 'explode' ? [['U_s before', v.Es, '#7a3fb0'], ['K after', d.K1, '#1546d6']] : [['K before', d.K0, '#8a8a8a'], ['K after', d.K1, '#1546d6']];
    bars.forEach(([l, q, col], i) => { const x = 405 + i * 95, hh = kh * q / Km; ctx.fillStyle = col; ctx.fillRect(x, kb - hh, 60, hh); ctx.strokeStyle = '#111'; ctx.strokeRect(x, kb - hh, 60, hh); text(l, x + 30, kb + 14, { align: 'center', font: '700 11px "IBM Plex Mono",monospace' }); text(fplain(q) + ' J', x + 30, kb - hh - 6, { align: 'center', font: '600 11px "IBM Plex Mono",monospace' }); });
    ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(395, kb); ctx.lineTo(590, kb); ctx.stroke();
  }
};
