// Pulling a Crate: work done by an angled pull and by kinetic friction; work-energy theorem.
const SIM = {
  title: 'Pulling a Crate',
  ivs(){ return [
    { id: 'F', sym: 'F', symText: 'F', label: 'Pull', unit: 'N', min: 0, max: 200, step: 1, val: 100 },
    { id: 'th', sym: 'θ', symText: 'θ', label: 'Rope angle', unit: '°', min: 0, max: 80, step: 1, val: 30, graph: true, show: v => v.toFixed(0) + '°' },
    { id: 'd', sym: 'd', symText: 'd', label: 'Distance pulled', unit: 'm', min: 1, max: 20, step: 0.5, val: 5 },
    { id: 'm', sym: 'm', symText: 'm', label: 'Crate mass', unit: 'kg', min: 5, max: 50, step: 1, val: 20 },
    { id: 'mu', sym: 'μ<sub>k</sub>', symText: 'μk', label: 'Kinetic friction', unit: '', min: 0, max: 0.8, step: 0.05, val: 0.3, show: v => v.toFixed(2) }]; },
  calc(v){
    const th = v.th * DEG, W = v.m * G10, Fx = v.F * Math.cos(th), Fy = v.F * Math.sin(th), N = Math.max(0, W - Fy), f = v.mu * N;
    const WF = Fx * v.d, Wf = -f * v.d, Wnet = WF + Wf, vf = Wnet > 0 ? Math.sqrt(2 * Wnet / v.m) : 0;
    return { th, W, Fx, Fy, N, f, WF, Wf, Wnet, vf, lifts: Fy > W, stops: Wnet <= 0 };
  },
  dvs(){ return [
    { id: 'vf', name: 'Final speed', short: 'v_f', sym: 'v<sub>f</sub>', unit: 'm/s', f: d => d.vf },
    { id: 'Wnet', name: 'Net work = ΔK', short: 'W_net', sym: 'W<sub>net</sub>', unit: 'J', f: d => d.Wnet },
    { id: 'WF', name: 'Work by the pull', short: 'W_F', sym: 'W<sub>F</sub>', unit: 'J', f: d => d.WF },
    { id: 'Wf', name: 'Work by friction', short: 'W_f', sym: 'W<sub>f</sub>', unit: 'J', f: d => d.Wf },
    { id: 'N', name: 'Normal force', short: 'N', sym: 'N', unit: 'N', f: d => d.N, vs: 'Wt' },
    { id: 'Wt', name: 'Weight mg', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W }]; },
  work(v, d){
    return '<h4>1 · Work done by the pull (only the part along the motion counts)</h4><div class="eq">W<sub>F</sub> = F d cosθ = (' + H.iv('F') + ')(' + H.iv('d') + ') cos ' + H.iv('th') + ' = <b>' + H.n(d.WF, 'J') + '</b></div>' +
      '<h4>2 · Normal force (vertical forces balance)</h4><div class="eq">N + F sinθ = mg → N = mg − F sinθ = (' + H.iv('m') + ')(' + H.g() + ') − (' + H.iv('F') + ') sin ' + H.iv('th') + ' = <b>' + H.n(d.N, 'N') + '</b></div>' +
      (d.lifts ? '<div class="bad">F sinθ is more than the weight: the crate would lift off the floor. N = 0.</div>' : '<p class="note">Pulling upward at an angle makes N smaller, so friction is smaller too.</p>') +
      '<h4>3 · Work done by friction (opposite the motion, cos 180° = −1)</h4><div class="eq">W<sub>f</sub> = −μ<sub>k</sub>N d = −(' + H.iv('mu') + ')(' + H.n(d.N, 'N') + ')(' + H.iv('d') + ') = <b>' + H.n(d.Wf, 'J') + '</b></div>' +
      '<h4>4 · Work by gravity and by N</h4><div class="eq">Both are perpendicular to the motion: W = Fd cos 90° = 0</div>' +
      '<h4>5 · Work–energy theorem (starts from rest)</h4><div class="eq">W<sub>net</sub> = W<sub>F</sub> + W<sub>f</sub> = ' + H.n(d.WF) + ' + (' + H.n(d.Wf) + ') = <b>' + H.n(d.Wnet, 'J') + '</b> = ΔK</div>' +
      (d.stops ? '<div class="bad">W<sub>net</sub> ≤ 0: friction takes out at least as much as the pull puts in. A crate starting from rest won’t speed up.</div>'
               : '<div class="eq">½mv<sub>f</sub>² = W<sub>net</sub> → v<sub>f</sub> = √(2W<sub>net</sub>/m) = √(2(' + H.n(d.Wnet) + ')/' + H.iv('m') + ') = <b>' + H.n(d.vf, 'm/s') + '</b></div>');
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle('SIDE VIEW', 10, 18);
    const fy = 200; ctx.fillStyle = '#e8e8e8'; ctx.fillRect(0, fy, 360, 130); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(360, fy); ctx.stroke();
    if (A.s === undefined || A.reset){ A.s = 0; A.tt = 0; }
    // move the crate through distance d in a loop; speed grows like a constant-acceleration start
    const T = d.stops ? 0 : 2 * v.d / Math.max(d.vf, 0.01); A.tt += dt; if (A.tt > Math.min(6, Math.max(1.5, T)) + 1) A.tt = 0;
    const frac = d.stops ? 0 : Math.min(1, Math.pow(A.tt / Math.min(6, Math.max(1.5, T)), 2));
    const x0 = 40, span = 230, bx = x0 + span * frac, bw = 44 + v.m * 0.6, bh = 34 + v.m * 0.4;
    ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x0 + bw / 2, fy + 18); ctx.lineTo(x0 + span + bw / 2, fy + 18); ctx.stroke(); ctx.setLineDash([]);
    text('d = ' + fplain(v.d) + ' m', x0 + span / 2 + bw / 2, fy + 34, { align: 'center', font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' });
    ctx.fillStyle = '#c9a26b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(bx, fy - bh, bw, bh); ctx.strokeRect(bx, fy - bh, bw, bh);
    const cx = bx + bw / 2, cy = fy - bh / 2, sc = 70 / Math.max(d.W, v.F, 1);
    // rope
    ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + bw, cy); ctx.lineTo(bx + bw + 70 * Math.cos(d.th), cy - 70 * Math.sin(d.th)); ctx.stroke();
    arrow(bx + bw, cy, bx + bw + v.F * sc * Math.cos(d.th), cy - v.F * sc * Math.sin(d.th), COL.T, 'F', { lx: 6, ly: -6 });
    arrow(cx, cy, cx, cy + d.W * sc, COL.W, 'mg', { lx: 6, ly: 0 });
    if (d.N > 0) arrow(cx - 8, cy, cx - 8, cy - d.N * sc, COL.N, 'N', { lx: -6, ly: 0, align: 'right' });
    if (d.f > 0) arrow(bx, fy - 6, bx - d.f * sc, fy - 6, COL.F, 'f', { lx: -4, ly: -10, align: 'right' });
    if (d.stops) text('W_net ≤ 0: no speed-up', 12, 318, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' });
    // F_x vs x graph: area = work
    panelTitle('FORCE ALONG THE MOTION vs POSITION', 372, 18);
    const gx0 = 395, gy0 = 260, gw = 190, gh = 190, mx = Math.max(v.F, d.f, 1) * 1.1, Yg = q => gy0 - gh / 2 - gh / 2 * q / mx;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx0, gy0 - gh); ctx.lineTo(gx0, gy0); ctx.moveTo(gx0, Yg(0)); ctx.lineTo(gx0 + gw, Yg(0)); ctx.stroke();
    ctx.fillStyle = 'rgba(122,63,176,0.25)'; ctx.fillRect(gx0, Yg(d.Fx), gw * 0.9, Yg(0) - Yg(d.Fx));
    ctx.fillStyle = 'rgba(196,58,0,0.25)'; ctx.fillRect(gx0, Yg(0), gw * 0.9, Yg(-d.f) - Yg(0));
    ctx.strokeStyle = COL.T; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(gx0, Yg(d.Fx)); ctx.lineTo(gx0 + gw * 0.9, Yg(d.Fx)); ctx.stroke();
    ctx.strokeStyle = COL.F; ctx.beginPath(); ctx.moveTo(gx0, Yg(-d.f)); ctx.lineTo(gx0 + gw * 0.9, Yg(-d.f)); ctx.stroke();
    text('F cosθ', gx0 + 6, Yg(d.Fx) - 6, { font: '700 11px "Space Grotesk",sans-serif', col: COL.T });
    text('area = W_F = ' + fplain(d.WF) + ' J', gx0 + 6, Yg(d.Fx / 2) + 4, { font: '600 11px "IBM Plex Mono",monospace', col: '#111' });
    if (d.f > 0){ text('−f', gx0 + 6, Yg(-d.f) + 14, { font: '700 11px "Space Grotesk",sans-serif', col: COL.F }); text('area = W_f = ' + fplain(d.Wf) + ' J', gx0 + 6, Yg(-d.f / 2) + 4, { font: '600 11px "IBM Plex Mono",monospace' }); }
    text('x (0 → d)', gx0 + gw * 0.9, Yg(0) - 4, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
