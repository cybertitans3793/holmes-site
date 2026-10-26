// Torque: τ = rF sinθ on a wrench, then balance problems (seesaw, plank on two supports, beam held by a cable).
const SIM = {
  title: 'Torque',
  modes: [{ id: 'wrench', label: 'Wrench' }, { id: 'seesaw', label: 'Seesaw' }, { id: 'plank', label: 'Plank on two supports' }, { id: 'sign', label: 'Beam and cable' }],
  ivs(mode){
    if (mode === 'wrench') return [
      { id: 'F', sym: 'F', symText: 'F', label: 'Force', unit: 'N', min: 0, max: 100, step: 1, val: 40 },
      { id: 'r', sym: 'r', symText: 'r', label: 'Distance from the bolt', unit: 'm', min: 0.05, max: 0.5, step: 0.01, val: 0.25 },
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Angle between wrench and force', unit: '°', min: 0, max: 180, step: 1, val: 90, graph: true, show: x => x.toFixed(0) + '°' }];
    if (mode === 'seesaw') return [
      { id: 'm1', sym: 'm<sub>1</sub>', symText: 'm1', label: 'Left kid', unit: 'kg', min: 10, max: 60, step: 1, val: 30 },
      { id: 'd1', sym: 'd<sub>1</sub>', symText: 'd1', label: 'Left kid’s distance from the pivot', unit: 'm', min: 0, max: 2, step: 0.05, val: 1.5 },
      { id: 'm2', sym: 'm<sub>2</sub>', symText: 'm2', label: 'Right kid', unit: 'kg', min: 10, max: 60, step: 1, val: 45 },
      { id: 'd2', sym: 'd<sub>2</sub>', symText: 'd2', label: 'Right kid’s distance from the pivot', unit: 'm', min: 0, max: 2, step: 0.05, val: 1, graph: true }];
    if (mode === 'plank') return [
      { id: 'x', sym: 'x', symText: 'x', label: 'Person’s position (from support A)', unit: 'm', min: 0, max: 4, step: 0.05, val: 2, graph: true },
      { id: 'm', sym: 'm', symText: 'm', label: 'Person’s mass', unit: 'kg', min: 20, max: 100, step: 1, val: 60 },
      { id: 'M', sym: 'M', symText: 'M', label: 'Plank mass (4 m long, uniform)', unit: 'kg', min: 5, max: 100, step: 1, val: 40 }];
    return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Sign mass', unit: 'kg', min: 5, max: 50, step: 1, val: 20 },
      { id: 'x', sym: 'x', symText: 'x', label: 'Sign’s distance from the wall', unit: 'm', min: 0.2, max: 2, step: 0.05, val: 1.5 },
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Cable angle above the beam', unit: '°', min: 10, max: 80, step: 1, val: 30, graph: true, show: x => x.toFixed(0) + '°' },
      { id: 'M', sym: 'M', symText: 'M', label: 'Beam mass (2 m, uniform)', unit: 'kg', min: 0, max: 20, step: 0.5, val: 5 }];
  },
  presets: [{ label: 'Push at 90°', mode: 'wrench', v: { th: 90 } }, { label: 'Push along it', mode: 'wrench', v: { th: 0 } }, { label: 'Balance it', mode: 'seesaw', v: { m1: 30, d1: 1.5, m2: 45, d2: 1 } }, { label: 'Walk to the end', mode: 'plank', v: { x: 4 } }],
  calc(v, mode){
    if (mode === 'wrench'){ const s = Math.sin(v.th * DEG), tau = v.r * v.F * s; return { tau, arm: v.r * s, Fperp: v.F * s }; }
    if (mode === 'seesaw'){ const t1 = v.m1 * G10 * v.d1, t2 = v.m2 * G10 * v.d2, net = t1 - t2; return { t1, t2, net, bal: Math.abs(net) < 0.5, dNeed: t1 / (v.m2 * G10), N: (v.m1 + v.m2) * G10 }; }
    if (mode === 'plank'){ const W = v.M * G10, w = v.m * G10, NB = (W * 2 + w * v.x) / 3, NA = W + w - NB, xTip = 3 + v.M / v.m;
      return { W, w, NB, NA, tips: NA < -1e-9, xTip, tA: W * 2 + w * v.x }; }
    const L = 2, th = v.th * DEG, W = v.M * G10, w = v.m * G10, tauDown = W * L / 2 + w * v.x, T = tauDown / (L * Math.sin(th)), Hx = T * Math.cos(th), Hy = W + w - T * Math.sin(th);
    return { L, W, w, tauDown, T, Hx, Hy, H: Math.hypot(Hx, Hy) };
  },
  dvs(mode){
    if (mode === 'wrench') return [{ id: 'tau', name: 'Torque τ = rF sinθ', short: 'τ', sym: 'τ', unit: 'N·m', f: d => d.tau }, { id: 'arm', name: 'Lever arm r sinθ', short: 'r⊥', sym: 'r<sub>⊥</sub>', unit: 'm', f: d => d.arm }];
    if (mode === 'seesaw') return [{ id: 'net', name: 'Net torque (+ = counterclockwise)', short: 'Στ', sym: 'Στ', unit: 'N·m', f: d => d.net }, { id: 't2', name: 'Right kid’s torque', short: 'τ2', sym: 'τ<sub>2</sub>', unit: 'N·m', f: d => d.t2, vs: 't1' }, { id: 't1', name: 'Left kid’s torque', short: 'τ1', sym: 'τ<sub>1</sub>', unit: 'N·m', f: d => d.t1 }];
    if (mode === 'plank') return [{ id: 'NA', name: 'Support A pushes up', short: 'N_A', sym: 'N<sub>A</sub>', unit: 'N', f: d => d.NA }, { id: 'NB', name: 'Support B pushes up', short: 'N_B', sym: 'N<sub>B</sub>', unit: 'N', f: d => d.NB }];
    return [{ id: 'T', name: 'Cable tension', short: 'T', sym: 'T', unit: 'N', f: d => d.T }, { id: 'Hx', name: 'Hinge force, horizontal', short: 'H_x', sym: 'H<sub>x</sub>', unit: 'N', f: d => d.Hx }, { id: 'Hy', name: 'Hinge force, vertical', short: 'H_y', sym: 'H<sub>y</sub>', unit: 'N', f: d => d.Hy }];
  },
  work(v, d, mode){
    if (mode === 'wrench') return '<h4>1 · Torque = how hard a force twists</h4><div class="eq">τ = rF sinθ = (' + H.iv('r') + ')(' + H.iv('F') + ') sin ' + H.iv('th') + ' = <b>' + H.n(d.tau, 'N·m') + '</b></div>' +
      '<h4>2 · Two ways to read sinθ</h4><div class="eq">Lever arm: r<sub>⊥</sub> = r sinθ = ' + H.n(d.arm, 'm') + ' (the perpendicular distance from the bolt to the force’s line of action) → τ = r<sub>⊥</sub>F</div>' +
      '<div class="eq">Or the part of the force perpendicular to the wrench: F<sub>⊥</sub> = F sinθ = ' + H.n(d.Fperp, 'N') + ' → τ = rF<sub>⊥</sub></div>' +
      '<p class="note">Push along the wrench (θ = 0° or 180°): no twist at all. Biggest torque at 90°. Doubling r (a longer wrench) doubles τ.</p>';
    if (mode === 'seesaw') return '<h4>1 · Each kid’s weight makes a torque about the pivot (counterclockwise +)</h4><div class="eq">Left: τ<sub>1</sub> = m<sub>1</sub>g d<sub>1</sub> = (' + H.iv('m1') + ')(' + H.g() + ')(' + H.iv('d1') + ') = ' + H.n(d.t1, 'N·m') + ' ↺</div>' +
      '<div class="eq">Right: τ<sub>2</sub> = m<sub>2</sub>g d<sub>2</sub> = (' + H.iv('m2') + ')(' + H.g() + ')(' + H.iv('d2') + ') = ' + H.n(d.t2, 'N·m') + ' ↻</div>' +
      '<h4>2 · Net torque</h4><div class="eq">Στ = ' + H.n(d.t1) + ' − ' + H.n(d.t2) + ' = <b>' + H.n(d.net, 'N·m') + '</b> → ' + (d.bal ? '<b>balanced</b>' : d.net > 0 ? 'tips left (↺)' : 'tips right (↻)') + '</div>' +
      '<h4>3 · Where should the right kid sit to balance?</h4><div class="eq">m<sub>1</sub>d<sub>1</sub> = m<sub>2</sub>d<sub>2</sub> → d<sub>2</sub> = m<sub>1</sub>d<sub>1</sub>/m<sub>2</sub> = <b>' + H.n(d.dNeed, 'm') + '</b>' + (d.dNeed > 2 ? ' (past the end: can’t balance)' : '') + '</div>' +
      '<h4>4 · The pivot</h4><div class="eq">Balanced or not, the pivot pushes up with (m<sub>1</sub> + m<sub>2</sub>)g = ' + H.n(d.N, 'N') + ' (massless board). It makes no torque about itself: r = 0.</div>' +
      '<p class="note">Equilibrium needs both: ΣF = 0 <i>and</i> Στ = 0.</p>';
    if (mode === 'plank') return '<h4>1 · Free-body diagram of the plank</h4><div class="eq">Supports at A (x = 0) and B (x = 3 m); plank 4 m, its weight Mg = ' + H.n(d.W, 'N') + ' acts at its center (x = 2 m); person mg = ' + H.n(d.w, 'N') + ' at x = ' + H.iv('x') + '.</div>' +
      '<h4>2 · Torques about A (so N<sub>A</sub> drops out)</h4><div class="eq">N<sub>B</sub>(3) = Mg(2) + mg·x → N<sub>B</sub> = [' + H.n(d.W) + '(2) + ' + H.n(d.w) + '(' + H.iv('x') + ')] / 3 = <b>' + H.n(d.NB, 'N') + '</b></div>' +
      '<h4>3 · Forces: N<sub>A</sub> + N<sub>B</sub> = Mg + mg</h4><div class="eq">N<sub>A</sub> = ' + H.n(d.W + d.w) + ' − ' + H.n(d.NB) + ' = <b>' + H.n(d.NA, 'N') + '</b></div>' +
      (d.tips ? '<div class="bad">N<sub>A</sub> would have to pull <i>down</i>. A support can only push, so the plank <b>tips</b> about B.</div>' : '') +
      '<h4>4 · How far out before it tips?</h4><div class="eq">About to tip: N<sub>A</sub> = 0. Torques about B: M g(1) = mg(x − 3) → x = 3 + M/m = <b>' + H.n(d.xTip, 'm') + '</b>' + (d.xTip >= 4 ? ' (past the end of the plank: safe all the way out)' : '') + '</div>' +
      '<p class="note">Choose the pivot point at an unknown force: it disappears from the torque equation.</p>';
    return '<h4>1 · Torques about the hinge (the hinge force drops out)</h4><div class="eq">Clockwise: beam Mg at L/2 and sign mg at x: ' + H.n(d.W) + '(1) + ' + H.n(d.w) + '(' + H.iv('x') + ') = ' + H.n(d.tauDown, 'N·m') + '</div>' +
      '<div class="eq">Counterclockwise: only the cable, T sinθ at the end: T sinθ · L</div>' +
      '<h4>2 · Balance them</h4><div class="eq">T = ' + H.n(d.tauDown) + ' / (2 sin ' + H.iv('th') + ') = <b>' + H.n(d.T, 'N') + '</b></div>' +
      '<h4>3 · Then forces give the hinge</h4><div class="eq">Horizontal: H<sub>x</sub> = T cosθ = <b>' + H.n(d.Hx, 'N') + '</b> (pushing out from the wall)</div>' +
      '<div class="eq">Vertical: H<sub>y</sub> = Mg + mg − T sinθ = <b>' + H.n(d.Hy, 'N') + '</b>' + (d.Hy < 0 ? ' (negative: the hinge pulls down)' : '') + '</div>' +
      '<p class="note">A low cable angle needs a huge tension: sinθ is small, so the cable has little lever arm.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const tbars = (items) => { panelTitle('TORQUES (N·m)', 395, 18); const mx = Math.max(...items.map(i => Math.abs(i[1])), 1); items.forEach(([lab, val, col], i) => { const y = 40 + i * 26, w = 85 * Math.abs(val) / mx; ctx.fillStyle = col; ctx.fillRect(470, y, w, 14); text(lab, 465, y + 11, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(val), 474 + w, y + 11, { font: '600 10px "IBM Plex Mono",monospace' }); }); };
    if (mode === 'wrench'){
      panelTitle('WRENCH ON A BOLT (top view)', 10, 18);
      const bx = 110, by = 180, sc = 560, L = v.r * sc;
      ctx.fillStyle = '#888'; ctx.beginPath(); for (let k = 0; k < 6; k++){ const a = k * PI / 3; ctx.lineTo(bx + 16 * Math.cos(a), by + 16 * Math.sin(a)); } ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#9aa7b8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(bx, by - 8, L + 10, 16); ctx.strokeRect(bx, by - 8, L + 10, 16);
      const ex = bx + L, ey = by, a = -v.th * DEG, Fl = 40 + v.F * 1.1, fx = Math.cos(a), fy = Math.sin(a);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ex - fx * 300, ey - fy * 300); ctx.lineTo(ex + fx * 300, ey + fy * 300); ctx.stroke(); ctx.setLineDash([]);
      // lever arm: perpendicular from the bolt to the line of action
      const t0 = (bx - ex) * fx + (by - ey) * fy, px = ex + fx * t0, py = ey + fy * t0;
      if (d.arm > 0.005){ ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(px, py); ctx.stroke(); text('r⊥ = ' + fplain(d.arm) + ' m', (bx + px) / 2 - 8, (by + py) / 2 - 6, { align: 'right', font: '700 11px "Space Grotesk",sans-serif', col: '#1e7d45' }); }
      if (v.F > 0) arrow(ex, ey, ex + fx * Fl, ey + fy * Fl, COL.T, 'F', { lx: 6, ly: -6 });
      text('r = ' + fplain(v.r) + ' m', bx + L / 2, by + 26, { align: 'center', font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text('τ = ' + fplain(d.tau) + ' N·m', 12, 300, { font: '700 14px "Space Grotesk",sans-serif' });
      tbars([['τ = rF sinθ', d.tau, '#c43a00'], ['max (90°)', v.r * v.F, '#bbb']]);
      return;
    }
    if (mode === 'seesaw'){
      panelTitle('SEESAW (4 m board, pivot in the middle)', 10, 18);
      if (A.ang === undefined) A.ang = 0; const target = d.bal ? 0 : (d.net > 0 ? 1 : -1) * 0.22; A.ang += (target - A.ang) * Math.min(1, dt * 3);
      const px = 190, py = 220, sc = 80;
      ctx.fillStyle = '#555'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 18, py + 50); ctx.lineTo(px + 18, py + 50); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(px, py); ctx.rotate(-A.ang); ctx.fillStyle = '#c98a3c'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(-2 * sc, -8, 4 * sc, 8); ctx.strokeRect(-2 * sc, -8, 4 * sc, 8);
      const kid = (x, m, col, lab) => { const sz = 16 + m * 0.4; ctx.fillStyle = col; ctx.fillRect(x * sc - sz / 2, -8 - sz, sz, sz); ctx.strokeRect(x * sc - sz / 2, -8 - sz, sz, sz); text(lab, x * sc, -12 - sz, { align: 'center', font: '700 10px "Space Grotesk",sans-serif', col }); };
      kid(-v.d1, v.m1, '#ff6a2b', fplain(v.m1) + ' kg'); kid(v.d2, v.m2, '#1546d6', fplain(v.m2) + ' kg');
      for (let k = -2; k <= 2; k++){ ctx.fillStyle = '#111'; ctx.fillRect(k * sc - 0.5, 0, 1, 6); text(Math.abs(k) + '', k * sc, 16, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
      ctx.restore();
      text(d.bal ? 'balanced: Στ = 0' : d.net > 0 ? 'tips left ↺' : 'tips right ↻', 12, 300, { font: '700 14px "Space Grotesk",sans-serif', col: d.bal ? '#1e7d45' : '#c43a00' });
      text('balance needs d₂ = ' + fplain(d.dNeed) + ' m', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      tbars([['left ↺', d.t1, '#ff6a2b'], ['right ↻', d.t2, '#1546d6'], ['net', Math.abs(d.net), d.bal ? '#1e7d45' : '#c43a00']]);
      return;
    }
    if (mode === 'plank'){
      panelTitle('PLANK ON TWO SUPPORTS (A at 0 m, B at 3 m)', 10, 18);
      if (A.ang === undefined) A.ang = 0; const target = d.tips ? -0.35 : 0; A.ang += (target - A.ang) * Math.min(1, dt * 3);
      const x0 = 40, sc = 75, py = 200, Bx = x0 + 3 * sc;
      ctx.fillStyle = '#555'; [[x0, 'A'], [Bx, 'B']].forEach(([x, l]) => { ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x - 14, py + 40); ctx.lineTo(x + 14, py + 40); ctx.closePath(); ctx.fill(); text(l, x, py + 55, { align: 'center', font: '700 12px "Space Grotesk",sans-serif' }); });
      ctx.save(); ctx.translate(Bx, py); ctx.rotate(-A.ang); ctx.translate(-Bx, -py);
      ctx.fillStyle = '#c98a3c'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(x0 - 4, py - 10, 4 * sc + 4, 10); ctx.strokeRect(x0 - 4, py - 10, 4 * sc + 4, 10);
      const px = x0 + v.x * sc; ctx.fillStyle = '#1546d6'; ctx.fillRect(px - 7, py - 50, 14, 40); ctx.fillStyle = '#f2c7a0'; ctx.beginPath(); ctx.arc(px, py - 58, 8, 0, 7); ctx.fill();
      ctx.restore();
      const fs = 70 / Math.max(d.W + d.w, 1);
      if (!d.tips){ arrow(x0, py + 40, x0, py + 40 - Math.max(0, d.NA) * fs, COL.N, 'N_A', { lx: 6, ly: 0 }); }
      arrow(Bx, py + 40, Bx, py + 40 - (d.tips ? d.W + d.w : d.NB) * fs, COL.N, 'N_B', { lx: 6, ly: 0 });
      arrow(x0 + 2 * sc, py, x0 + 2 * sc, py + d.W * fs, COL.W, 'Mg', { lx: 6, ly: 0 });
      if (!d.tips) arrow(px + 12, py - 30, px + 12, py - 30 + d.w * fs, COL.W, 'mg', { lx: 5, ly: 0 });
      text(d.tips ? 'TIPS about B' : 'N_A = ' + fplain(d.NA) + ' N   N_B = ' + fplain(d.NB) + ' N', 12, 300, { font: '700 13px "Space Grotesk",sans-serif', col: d.tips ? '#c43a00' : '#111' });
      text('tips once x > 3 + M/m = ' + fplain(d.xTip) + ' m', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      tbars([['plank Mg·2', d.W * 2, '#555'], ['person mg·x', d.w * v.x, '#1546d6'], ['N_B·3', d.tips ? 0 : d.NB * 3, COL.N]]);
      text('torques about A', 395, 130, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    panelTitle('BEAM HELD BY A CABLE', 10, 18);
    const wx = 40, by = 210, sc = 150, ex = wx + d.L * sc, th = v.th * DEG, cy = by - d.L * sc * Math.tan(th);
    ctx.fillStyle = '#bbb'; ctx.fillRect(wx - 20, 30, 20, 260);
    ctx.fillStyle = '#c98a3c'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(wx, by - 6, d.L * sc, 12); ctx.strokeRect(wx, by - 6, d.L * sc, 12);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(wx, by, 5, 0, 7); ctx.fill();
    const tc = Math.min((ex - wx) / Math.cos(th), (by - 32) / Math.sin(th)); ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex, by); ctx.lineTo(ex - tc * Math.cos(th), by - tc * Math.sin(th)); ctx.stroke();
    if (cy < 32) text('(cable anchor off the top)', wx + 4, 44, { font: '500 9px "IBM Plex Mono",monospace', col: '#888' });
    const sx = wx + v.x * sc; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx, by + 6); ctx.lineTo(sx, by + 30); ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; ctx.fillRect(sx - 26, by + 30, 52, 26); ctx.strokeRect(sx - 26, by + 30, 52, 26); text('EAT', sx, by + 48, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: '#fff' });
    const fs = 60 / Math.max(d.T, d.W + d.w, 1);
    arrow(ex, by, ex - d.T * fs * Math.cos(th), by - d.T * fs * Math.sin(th), COL.T, 'T', { lx: -6, ly: -6, align: 'right' });
    arrow(wx, by, wx + d.Hx * fs, by, COL.N, 'Hx', { lx: 2, ly: 12 }); if (Math.abs(d.Hy) > 0.5) arrow(wx, by, wx, by - d.Hy * fs, COL.N, 'Hy', { lx: 6, ly: 0 });
    text('T = ' + fplain(d.T) + ' N   hinge ' + fplain(d.H) + ' N', 12, 300, { font: '700 13px "Space Grotesk",sans-serif' });
    tbars([['beam Mg·L/2', d.W, '#555'], ['sign mg·x', d.w * v.x, '#ff6a2b'], ['cable T sinθ·L', d.T * Math.sin(th) * d.L, COL.T]]);
    text('torques about the hinge', 395, 130, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
