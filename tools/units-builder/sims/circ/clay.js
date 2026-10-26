// Clay on a Block: classic AP FRQ. Clay drops onto an oscillating block, at equilibrium or at the end of the swing. What happens to A, T, v_max and E?
const SIM = {
  title: 'Clay on a Block',
  modes: [{ id: 'eq', label: 'Clay lands at equilibrium' }, { id: 'end', label: 'Clay lands at the end' }],
  ivs(){ return [
    { id: 'M', sym: 'M', symText: 'M', label: 'Block mass', unit: 'kg', min: 0.5, max: 4, step: 0.1, val: 2 },
    { id: 'm', sym: 'm', symText: 'm', label: 'Clay mass', unit: 'kg', min: 0.1, max: 4, step: 0.1, val: 2, graph: true },
    { id: 'k', sym: 'k', symText: 'k', label: 'Spring constant', unit: 'N/m', min: 20, max: 200, step: 5, val: 50 },
    { id: 'A', sym: 'A', symText: 'A', label: 'Amplitude before', unit: 'm', min: 0.05, max: 0.3, step: 0.01, val: 0.2 }]; },
  presets: [{ label: 'Clay = block', v: { m: 2, M: 2 } }, { label: 'Tiny clay', v: { m: 0.1 } }],
  calc(v, mode){
    const w1 = Math.sqrt(v.k / v.M), w2 = Math.sqrt(v.k / (v.M + v.m)), T1 = 2 * PI / w1, T2 = 2 * PI / w2, v1 = v.A * w1, E1 = 0.5 * v.k * v.A * v.A;
    if (mode === 'eq'){ const vp = v.M * v1 / (v.M + v.m), A2 = vp / w2, E2 = 0.5 * v.k * A2 * A2; return { w1, w2, T1, T2, v1, vp, A2, E1, E2, v2: vp, lost: E1 - E2, Tr: T2 / T1, Ar: A2 / v.A }; }
    return { w1, w2, T1, T2, v1, vp: 0, A2: v.A, E1, E2: E1, v2: v.A * w2, lost: 0, Tr: T2 / T1, Ar: 1 };
  },
  dvs(){ return [
    { id: 'A2', name: 'Amplitude after', short: 'A2', sym: 'A<sub>2</sub>', unit: 'm', f: d => d.A2 },
    { id: 'T2', name: 'Period after', short: 'T2', sym: 'T<sub>2</sub>', unit: 's', f: d => d.T2 },
    { id: 'v2', name: 'Maximum speed after', short: 'v2', sym: 'v<sub>max,2</sub>', unit: 'm/s', f: d => d.v2 },
    { id: 'E2', name: 'Energy after', short: 'E2', sym: 'E<sub>2</sub>', unit: 'J', f: d => d.E2, vs: 'E1' },
    { id: 'E1', name: 'Energy before', short: 'E1', sym: 'E<sub>1</sub>', unit: 'J', f: d => d.E1 }]; },
  work(v, d, mode){
    let h = '<h4>1 · Before: T<sub>1</sub> = 2π√(M/k) = ' + H.n(d.T1, 's') + ', v<sub>max</sub> = Aω<sub>1</sub> = ' + H.n(d.v1, 'm/s') + ', E<sub>1</sub> = ½kA² = ' + H.n(d.E1, 'J') + '</h4>' +
      '<h4>2 · After: more mass on the same spring → longer period, whatever the timing</h4><div class="eq">T<sub>2</sub> = 2π√((M + m)/k) = <b>' + H.n(d.T2, 's') + '</b> (' + H.n(d.Tr) + '× longer)</div>';
    if (mode === 'eq') return h + '<h4>3 · At equilibrium the block is moving fastest: a perfectly inelastic collision</h4><div class="eq">Horizontal momentum is conserved (the clay falls straight down, bringing none): Mv<sub>max</sub> = (M + m)v′ → v′ = ' + H.n(d.vp, 'm/s') + '</div>' +
      '<div class="eq">KE is lost in the collision: E<sub>2</sub> = ½(M + m)v′² = <b>' + H.n(d.E2, 'J') + '</b> (' + H.n(d.lost, 'J') + ' lost)</div>' +
      '<div class="eq">½kA<sub>2</sub>² = E<sub>2</sub> → A<sub>2</sub> = A√(M/(M + m)) = <b>' + H.n(d.A2, 'm') + '</b> (smaller)</div>' +
      '<p class="note">Summary: T up, A down, E down, v<sub>max</sub> down.</p>';
    return h + '<h4>3 · At the end the block is momentarily at rest</h4><div class="eq">Nothing is moving horizontally, so no KE is lost when the clay sticks. All the energy is still ½kA² stored in the spring.</div>' +
      '<div class="eq">It still turns around at the same spot: A<sub>2</sub> = A = <b>' + H.n(d.A2, 'm') + '</b>, E<sub>2</sub> = E<sub>1</sub> = ' + H.n(d.E2, 'J') + '</div>' +
      '<div class="eq">Same energy, more mass: v<sub>max,2</sub> = Aω<sub>2</sub> = <b>' + H.n(d.v2, 'm/s') + '</b> (slower)</div>' +
      '<p class="note">Summary: T up, A same, E same, v<sub>max</sub> down. Compare with landing at equilibrium.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const tHit = mode === 'eq' ? 1.75 * d.T1 : 1.0 * d.T1, Tend = tHit + 2.5 * d.T2, tt = A.t % (Tend + 1);
    // x(t): before x = A cos(ω1 t); landing at eq (t = 1.75 T1 → x = 0 moving +), at end (t = T1 → x = +A)
    const xf = q => q < tHit ? v.A * Math.cos(d.w1 * q) : (mode === 'eq' ? d.A2 * Math.sin(d.w2 * (q - tHit)) : v.A * Math.cos(d.w2 * (q - tHit)));
    panelTitle(mode === 'eq' ? 'CLAY DROPS AS THE BLOCK PASSES EQUILIBRIUM' : 'CLAY DROPS AT THE END OF THE SWING', 10, 18);
    const eq = 200, sc = 450, x = xf(tt), bx = eq + x * sc, by = 130;
    ctx.fillStyle = '#111'; ctx.fillRect(20, 80, 6, 70); ctx.fillStyle = '#e6dccb'; ctx.fillRect(20, 150, 360, 10);
    ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(26, by); for (let i = 1; i < 16; i++) ctx.lineTo(26 + (bx - 26 - 25) * i / 16, by + (i % 2 ? 8 : -8)); ctx.lineTo(bx - 25, by); ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; ctx.fillRect(bx - 25, 110, 50, 40); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(bx - 25, 110, 50, 40);
    const landX = eq + (mode === 'eq' ? 0 : v.A) * sc;
    if (tt < tHit){ const fall = Math.min(1, tt / tHit); ctx.fillStyle = '#7a3fb0'; ctx.beginPath(); ctx.arc(landX, 40 + fall * 58, 9 + 3 * Math.sqrt(v.m), 0, 7); ctx.fill(); }
    else { ctx.fillStyle = '#7a3fb0'; ctx.beginPath(); ctx.arc(bx, 100, 9 + 3 * Math.sqrt(v.m), 0, 7); ctx.fill(); }
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(eq, 60); ctx.lineTo(eq, 170); ctx.stroke(); ctx.setLineDash([]);
    text(tt < tHit ? 'before: T = ' + fplain(d.T1) + ' s, A = ' + fplain(v.A) + ' m' : 'after: T = ' + fplain(d.T2) + ' s, A = ' + fplain(d.A2) + ' m', 12, 318, { font: '700 12px "Space Grotesk",sans-serif' });
    // x–t graph
    const gx = 30, gw = 340, gy = 240, gh = 45, X = q => gx + gw * q / Tend, Y = q => gy - gh * q / v.A;
    ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k <= 300; k++){ const q = Tend * k / 300; k ? ctx.lineTo(X(q), Y(xf(q))) : ctx.moveTo(X(q), Y(xf(q))); } ctx.stroke();
    ctx.strokeStyle = '#7a3fb0'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(tHit), gy - gh - 6); ctx.lineTo(X(tHit), gy + gh + 6); ctx.stroke(); ctx.setLineDash([]); text('clay lands', X(tHit) + 4, gy - gh - 2, { font: '600 9px "IBM Plex Mono",monospace', col: '#7a3fb0' });
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(tt), Y(x), 3.5, 0, 7); ctx.fill();
    text('x', gx - 8, gy + 4, { align: 'right', font: '700 11px "IBM Plex Mono",monospace' });
    panelTitle('BEFORE → AFTER', 395, 18);
    [['period T', d.T1, d.T2, 's'], ['amplitude A', v.A, d.A2, 'm'], ['max speed', d.v1, d.v2, 'm/s'], ['energy E', d.E1, d.E2, 'J']].forEach(([l, a, b, u], i) => { const y = 50 + i * 40, mx = Math.max(a, b), ch = b > a * 1.001 ? 'up' : b < a * 0.999 ? 'down' : 'same';
      text(l, 400, y, { font: '700 11px "Space Grotesk",sans-serif' }); ctx.fillStyle = '#bbb'; ctx.fillRect(470, y - 10, 70 * a / mx, 8); ctx.fillStyle = '#ff6a2b'; ctx.fillRect(470, y, 70 * b / mx, 8);
      text(ch, 590, y, { align: 'right', font: '700 11px "IBM Plex Mono",monospace', col: ch === 'same' ? '#1e7d45' : '#c43a00' }); });
    text('grey = before, orange = after', 400, 220, { font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
