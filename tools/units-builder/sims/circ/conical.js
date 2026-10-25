// Conical Pendulum: bob on a string moving in a horizontal circle.
const SIM = {
  title: 'Conical Pendulum',
  ivs(){ return [
    { id: 'm', sym: 'm', symText: 'm', label: 'Bob mass', unit: 'kg', min: 0.1, max: 2, step: 0.05, val: 0.5 },
    { id: 'th', sym: 'θ', symText: 'θ', label: 'Angle from vertical', unit: '°', min: 5, max: 80, step: 1, val: 30, graph: true, show: v => v.toFixed(0) + '°' },
    { id: 'L', sym: 'L', symText: 'L', label: 'String length', unit: 'm', min: 0.3, max: 3, step: 0.05, val: 1.5 }]; },
  calc(v){
    const th = v.th * DEG, W = v.m * G10, T = W / Math.cos(th), r = v.L * Math.sin(th), Fc = W * Math.tan(th);
    const sp = Math.sqrt(G10 * r * Math.tan(th)), P = 2 * PI * r / sp, Psimple = 2 * PI * Math.sqrt(v.L / G10);
    return { th, W, T, r, Fc, sp, P, Psimple, h: v.L * Math.cos(th), Tv: T * Math.cos(th), Th: T * Math.sin(th) };
  },
  dvs(){ return [
    { id: 'T', name: 'Tension T', short: 'T', sym: 'T', unit: 'N', f: d => d.T, vs: 'W' },
    { id: 'sp', name: 'Speed v', short: 'v', sym: 'v', unit: 'm/s', f: d => d.sp },
    { id: 'P', name: 'Period (time for one circle)', short: 'period', sym: 'period', unit: 's', f: d => d.P },
    { id: 'Fc', name: 'Centripetal force T sinθ', short: 'T sinθ', sym: 'T sinθ', unit: 'N', f: d => d.Fc },
    { id: 'r', name: 'Circle radius r', short: 'r', sym: 'r', unit: 'm', f: d => d.r },
    { id: 'W', name: 'Weight mg', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W }]; },
  work(v, d){
    return '<h4>1 · Radius of the circle (not the string length!)</h4><div class="eq">r = L sinθ = (' + H.iv('L') + ') sin ' + H.iv('th') + ' = <b>' + H.n(d.r, 'm') + '</b></div>' +
      '<h4>2 · Vertical: the bob stays at one height, so a<sub>y</sub> = 0</h4><div class="eq">T cosθ = mg → T = mg/cosθ = (' + H.iv('m') + ')(' + H.g() + ') / cos ' + H.iv('th') + ' = <b>' + H.n(d.T, 'N') + '</b></div>' +
      '<p class="note">T is always more than mg: only part of it (T cosθ) holds the bob up.</p>' +
      '<h4>3 · Horizontal: T sinθ is the centripetal force</h4><div class="eq">T sinθ = mv²/r → ' + H.n(d.T, 'N') + ' × sin ' + H.iv('th') + ' = <b>' + H.n(d.Fc, 'N') + '</b></div>' +
      '<h4>4 · Divide the two equations to get the speed</h4><div class="eq">tanθ = v²/(gr) → v = √(g r tanθ) = √((' + H.g() + ')(' + H.n(d.r, 'm') + ') tan ' + H.iv('th') + ') = <b>' + H.n(d.sp, 'm/s') + '</b></div>' +
      '<h4>5 · Period (one trip around)</h4><div class="eq">period = 2πr/v = 2π(' + H.n(d.r, 'm') + ')/(' + H.n(d.sp, 'm/s') + ') = <b>' + H.n(d.P, 's') + '</b></div>' +
      '<p class="note">Same as 2π√(L cosθ / g). The mass cancels in steps 4 and 5. Compare a simple pendulum of the same length: 2π√(L/g) = ' + H.n(d.Psimple, 's') + '.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle('SIDE VIEW (seen at a slight tilt)', 10, 18);
    let k = 88; if (k * v.L * Math.sin(d.th) > 170) k = 170 / (v.L * Math.sin(d.th));
    if (k < 88) text('zoomed out to fit', 12, 300, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    const px = 200, py = 32, Lp = k * v.L, rp = Lp * Math.sin(d.th), hp = Lp * Math.cos(d.th), cy = py + hp, squash = 0.28;
    ctx.fillStyle = '#111'; ctx.fillRect(px - 50, py - 8, 100, 6);
    ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.ellipse(px, cy, Math.max(rp, 0.1), Math.max(rp * squash, 0.1), 0, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, cy); ctx.stroke(); ctx.setLineDash([]);
    text('h', px + 4, py + hp / 2, { font: '600 11px "Space Grotesk",sans-serif', col: '#8a8a8a' });
    if (A.ph === undefined) A.ph = 0; A.ph += (2 * PI / Math.max(0.4, d.P)) * dt;
    const bx = px + rp * Math.cos(A.ph), by = cy + rp * squash * Math.sin(A.ph);
    const front = Math.sin(A.ph) > 0;
    ctx.strokeStyle = front ? '#111' : '#888'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
    ctx.fillStyle = front ? '#ff6a2b' : '#ffb28f'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, by, 6 + 4 * Math.sqrt(v.m), 0, 7); ctx.fill(); ctx.stroke();
    // r label on the near side
    ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px + rp, cy); ctx.stroke(); text('r', px + rp / 2, cy - 4, { font: '600 11px "Space Grotesk",sans-serif', col: '#8a8a8a' });
    text('θ', px + 6, py + 26, { font: '700 12px "Space Grotesk",sans-serif', col: '#4a4a4a' });
    text('period ' + fplain(d.P) + ' s', 12, 318, { font: '600 12px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // FBD when the bob is at the right edge (center of circle to the left)
    const fx = 480, fy = 175; panelTitle('FREE-BODY DIAGRAM', 380, 18); text('(bob at the right edge; center ←)', 380, 34, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    const sc = 85 / Math.max(d.T, d.W);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(fx, fy, 6, 0, 7); ctx.fill();
    const tx = -Math.sin(d.th) * d.T * sc, ty = -Math.cos(d.th) * d.T * sc;
    arrow(fx, fy, fx + tx, fy + ty, COL.T, 'T', { lx: -8, ly: -4 });
    arrow(fx, fy, fx, fy + d.W * sc, COL.W, 'mg', { lx: 8, ly: 0 });
    arrow(fx, fy, fx + tx, fy, COL.comp, 'T sinθ', { w: 2, dash: [4, 3], lx: -6, ly: 12, align: 'right' });
    arrow(fx, fy, fx, fy + ty, COL.comp, 'T cosθ', { w: 2, dash: [4, 3], lx: 8, ly: 0 });
    text('T cosθ = mg', 380, 296, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' });
    text('T sinθ = mv²/r', 380, 312, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' });
  }
};
