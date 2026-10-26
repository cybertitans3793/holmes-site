// Pull at an Angle: a rope at θ above horizontal lifts some weight off the floor, which lowers friction.
const SIM = {
  title: 'Pull at an Angle',
  modes: [{ id: 'const', label: 'Constant velocity' }, { id: 'given', label: 'Given pull' }],
  ivs(mode){
    const l = [{ id: 'th', sym: 'θ', symText: 'θ', label: 'Rope angle above horizontal', unit: '°', min: 0, max: 80, step: 1, val: 30, graph: true, show: x => x.toFixed(0) + '°' },
      { id: 'm', sym: 'm', symText: 'm', label: 'Sled mass', unit: 'kg', min: 5, max: 60, step: 1, val: 20 },
      { id: 'mu', sym: 'μ<sub>k</sub>', symText: 'μk', label: 'Kinetic friction', unit: '', min: 0, max: 0.8, step: 0.01, val: 0.3, show: x => x.toFixed(2) }];
    if (mode === 'given') l.push({ id: 'F', sym: 'F', symText: 'F', label: 'Pull', unit: 'N', min: 0, max: 300, step: 1, val: 100 });
    return l;
  },
  presets: [{ label: 'Pull flat', v: { th: 0 } }, { label: 'Best angle', mode: 'const', v: { th: 17, mu: 0.3 } }, { label: 'Steep pull', v: { th: 70 } }],
  calc(v, mode){
    const th = v.th * DEG, W = v.m * G10, c = Math.cos(th), s = Math.sin(th);
    if (mode === 'const'){ const F = v.mu * W / (c + v.mu * s), Fy = F * s, N = W - Fy, f = v.mu * N; return { W, F, Fx: F * c, Fy, N, f, a: 0, best: Math.atan(v.mu) / DEG, Fbest: v.mu * W / Math.sqrt(1 + v.mu * v.mu), Fflat: v.mu * W, lifts: false }; }
    const Fx = v.F * c, Fy = v.F * s, lifts = Fy > W, N = Math.max(0, W - Fy), f = v.mu * N, moves = Fx > f, a = moves ? (Fx - f) / v.m : 0;
    return { W, F: v.F, Fx, Fy, N, f: moves ? f : Fx, fk: f, a, moves, lifts, best: Math.atan(v.mu) / DEG };
  },
  dvs(mode){
    if (mode === 'const') return [
      { id: 'F', name: 'Pull needed for constant velocity', short: 'F', sym: 'F', unit: 'N', f: d => d.F },
      { id: 'N', name: 'Normal force', short: 'N', sym: 'N', unit: 'N', f: d => d.N },
      { id: 'f', name: 'Friction', short: 'f', sym: 'f<sub>k</sub>', unit: 'N', f: d => d.f }];
    return [
      { id: 'a', name: 'Acceleration', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a },
      { id: 'N', name: 'Normal force', short: 'N', sym: 'N', unit: 'N', f: d => d.N },
      { id: 'Fx', name: 'Horizontal part of the pull', short: 'F_x', sym: 'F<sub>x</sub>', unit: 'N', f: d => d.Fx }];
  },
  work(v, d, mode){
    let h = '<h4>1 · Free-body diagram: split the pull into components</h4><div class="eq">F<sub>x</sub> = F cosθ (forward) &nbsp; F<sub>y</sub> = F sinθ (up)</div>' +
      '<h4>2 · Vertical: N + F sinθ = mg → N = mg − F sinθ</h4><div class="eq">Pulling up at an angle takes some of the weight, so the floor pushes up less, and <b>friction gets smaller</b>.</div>';
    if (mode === 'const'){
      h += '<h4>3 · Horizontal, constant velocity: F cosθ = μ<sub>k</sub>N</h4><div class="eq">F cosθ = μ<sub>k</sub>(mg − F sinθ) → <b>F = μ<sub>k</sub>mg / (cosθ + μ<sub>k</sub>sinθ)</b></div>' +
        '<div class="eq">= (' + H.iv('mu') + ')(' + H.iv('m') + ')(' + H.g() + ') / (cos ' + H.iv('th') + ' + ' + H.iv('mu') + ' sin ' + H.iv('th') + ') = <b>' + H.n(d.F, 'N') + '</b></div>' +
        '<div class="eq">Check: N = ' + H.n(d.W) + ' − ' + H.n(d.Fy) + ' = ' + H.n(d.N, 'N') + ', friction μN = ' + H.n(d.f, 'N') + ' = F cosθ = ' + H.n(d.Fx, 'N') + ' ✓</div>' +
        '<h4>4 · Is there a best angle?</h4><div class="eq">Too flat: friction is big. Too steep: most of the pull goes upward, wasted. The smallest pull is at <b>tanθ = μ<sub>k</sub></b> → θ = ' + H.n(d.best, '°') + ', needing ' + H.n(d.Fbest, 'N') + ' (vs ' + H.n(d.Fflat, 'N') + ' pulling flat).</div>' +
        '<p class="note">Graph F vs θ to see the minimum. Common mistake: writing N = mg when the rope pulls at an angle.</p>';
      return h;
    }
    h += '<div class="eq">N = (' + H.iv('m') + ')(' + H.g() + ') − (' + H.iv('F') + ')sin ' + H.iv('th') + ' = <b>' + H.n(d.N, 'N') + '</b></div>';
    if (d.lifts) return h + '<div class="bad">F sinθ is more than mg: the sled would lift off the ground. N = 0 and this is no longer a sliding problem.</div>';
    h += '<h4>3 · Horizontal: ΣF<sub>x</sub> = F cosθ − μ<sub>k</sub>N</h4><div class="eq">F cosθ = ' + H.n(d.Fx, 'N') + ', friction μ<sub>k</sub>N = (' + H.iv('mu') + ')(' + H.n(d.N) + ') = ' + H.n(d.fk, 'N') + '</div>';
    h += d.moves ? '<div class="eq">a = (F cosθ − μ<sub>k</sub>N)/m = (' + H.n(d.Fx) + ' − ' + H.n(d.fk) + ') / ' + H.iv('m') + ' = <b>' + H.n(d.a, 'm/s²') + '</b></div>'
      : '<div class="bad">F cosθ isn’t more than friction: it won’t speed up (treating μ as static too, it stays put).</div>';
    return h + '<p class="note">Change θ with F fixed: a goes up, then down. The best angle is again tanθ = μ<sub>k</sub> (' + H.n(d.best, '°') + ').</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    panelTitle(mode === 'const' ? 'PULLING A SLED AT CONSTANT VELOCITY' : 'PULLING A SLED', 10, 18);
    const gy = 240, tt = A.t % 4, vv = 1.5, xs = (vv * tt + 0.5 * d.a * tt * tt) * 20 % 600;
    ctx.fillStyle = '#eef6ff'; ctx.fillRect(0, gy, 380, 40);
    for (let k = -1; k < 8; k++){ const x = ((k * 60 - xs) % 420 + 420) % 420 - 20; ctx.fillStyle = '#c9d9ea'; ctx.fillRect(x, gy + 6, 20, 3); }
    const cx = 160, w = 70, hgt = 34;
    ctx.fillStyle = '#c98a3c'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(cx - w / 2, gy - hgt, w, hgt); ctx.strokeRect(cx - w / 2, gy - hgt, w, hgt);
    const th = v.th * DEG, rx = cx + w / 2, ry = gy - hgt / 2, L = 130;
    ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + L * Math.cos(th), ry - L * Math.sin(th)); ctx.stroke();
    // FBD on the sled
    const sc = 70 / Math.max(d.W, d.F, 1), ox = cx, oy = gy - hgt / 2;
    arrow(ox, oy, ox, oy + d.W * sc, COL.W, 'mg', { lx: 6, ly: -4 });
    if (d.N > 0.5) arrow(ox - 10, oy, ox - 10, oy - d.N * sc, COL.N, 'N', { lx: -6, ly: 0, align: 'right' });
    if (d.F > 0){ arrow(ox, oy, ox + d.F * sc * Math.cos(th), oy - d.F * sc * Math.sin(th), COL.T, 'F', { lx: 6, ly: -6 });
      ctx.setLineDash([4, 3]); arrow(ox, oy, ox + d.Fx * sc, oy, COL.comp, 'F cosθ', { w: 2, head: 6, lx: 4, ly: 12 }); arrow(ox + d.Fx * sc, oy, ox + d.Fx * sc, oy - d.Fy * sc, COL.comp, 'F sinθ', { w: 2, head: 6, lx: 6, ly: 0 }); ctx.setLineDash([]); }
    if (d.f > 0.5) arrow(cx - w / 2, gy - 4, cx - w / 2 - d.f * sc, gy - 4, COL.F, 'f', { lx: -6, ly: -8, align: 'right' });
    const msg = mode === 'const' ? 'constant velocity: F = ' + fplain(d.F) + ' N' : d.lifts ? 'lifts off the ground' : d.moves ? 'speeds up: a = ' + fplain(d.a) + ' m/s²' : 'doesn’t move';
    text(msg, 12, 300, { font: '700 13px "Space Grotesk",sans-serif', col: d.lifts || (mode === 'given' && !d.moves) ? '#c43a00' : '#111' });
    text('N = ' + fplain(d.N) + ' N (mg = ' + fplain(d.W) + ' N)', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // right: F needed vs angle curve (const) or bars (given)
    panelTitle(mode === 'const' ? 'PULL NEEDED vs ANGLE' : 'VERTICAL vs HORIZONTAL', 395, 18);
    if (mode === 'const'){
      const gx = 420, gy0 = 250, gw = 165, gh = 190, Fmax = v.mu * d.W / Math.min(...[0, 10, 20, 30, 40, 50, 60, 70, 80].map(a => Math.cos(a * DEG) + v.mu * Math.sin(a * DEG))) * 1.05 || 1;
      const Fof = a => v.mu * d.W / (Math.cos(a * DEG) + v.mu * Math.sin(a * DEG)), X = a => gx + gw * a / 80, Y = F => gy0 - gh * F / Math.max(Fmax, 1);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
      ctx.strokeStyle = COL.T; ctx.lineWidth = 2.5; ctx.beginPath(); for (let a = 0; a <= 80; a += 1) a ? ctx.lineTo(X(a), Y(Fof(a))) : ctx.moveTo(X(a), Y(Fof(a))); ctx.stroke();
      ctx.fillStyle = '#1e7d45'; ctx.beginPath(); ctx.arc(X(d.best), Y(d.Fbest), 4, 0, 7); ctx.fill(); text('best ' + fplain(d.best) + '°', X(d.best) + 6, Y(d.Fbest) + 14, { font: '600 10px "IBM Plex Mono",monospace', col: '#1e7d45' });
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(v.th), Y(d.F), 5, 0, 7); ctx.fill();
      text('0°', gx, gy0 + 13, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('80°', gx + gw, gy0 + 13, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text(fplain(Fmax), gx - 3, gy0 - gh + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    } else {
      const bmax = Math.max(d.W, d.F, 1), bw = 90, bar = (y, val, col, lab) => { ctx.fillStyle = col; ctx.fillRect(470, y, bw * val / bmax, 14); text(lab, 465, y + 11, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(val), 474 + bw * val / bmax, y + 11, { font: '600 10px "IBM Plex Mono",monospace' }); };
      bar(50, d.W, COL.W, 'mg'); bar(72, d.Fy, COL.comp, 'F sinθ'); bar(94, d.N, COL.N, 'N');
      bar(140, d.Fx, COL.comp, 'F cosθ'); bar(162, d.fk, COL.F, 'μk N');
    }
  }
};
