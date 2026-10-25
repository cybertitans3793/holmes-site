// Turntable: a coin riding on a spinning record (static friction supplies the centripetal force).
const SIM = {
  title: 'Turntable',
  ivs(){ return [
    { id: 'rpm', sym: 'rpm', symText: 'rpm', label: 'Turntable speed', unit: 'rpm', min: 10, max: 90, step: 1, val: 33, show: v => v.toFixed(0) + ' rpm' },
    { id: 'r', sym: 'r', symText: 'r', label: 'Coin distance from center', unit: 'cm', min: 2, max: 20, step: 0.5, val: 10, graph: true },
    { id: 'mu', sym: 'μ<sub>s</sub>', symText: 'μs', label: 'Static friction', unit: '', min: 0.1, max: 1, step: 0.05, val: 0.4, show: v => v.toFixed(2) },
    { id: 'm', sym: 'm', symText: 'm', label: 'Coin mass', unit: 'g', min: 1, max: 20, step: 0.5, val: 5 }]; },
  presets: [{ label: '33⅓ rpm', v: { rpm: 33 } }, { label: '45 rpm', v: { rpm: 45 } }, { label: '78 rpm', v: { rpm: 78 } }],
  calc(v){
    const w = v.rpm * 2 * PI / 60, r = v.r / 100, m = v.m / 1000, sp = w * r, ac = w * w * r, Fc = m * ac, fmax = v.mu * m * G10;
    const rmax = v.mu * G10 / (w * w), wmax = Math.sqrt(v.mu * G10 / r);
    return { w, r, m, sp, ac, Fc, fmax, W: m * G10, rmax, wmax, rpmmax: wmax * 60 / (2 * PI), slip: Fc > fmax * (1 + 1e-9), period: 2 * PI / w };
  },
  dvs(){ return [
    { id: 'Fc', name: 'Friction needed, mω²r', short: 'F needed', sym: 'F<sub>needed</sub>', unit: 'N', f: d => d.Fc, vs: 'fmax' },
    { id: 'ac', name: 'Centripetal acceleration', short: 'a_c', sym: 'a<sub>c</sub>', unit: 'm/s²', f: d => d.ac },
    { id: 'sp', name: 'Coin speed v = ωr', short: 'v', sym: 'v', unit: 'm/s', f: d => d.sp },
    { id: 'rmax', name: 'Farthest safe spot r_max', short: 'r_max', sym: 'r<sub>max</sub>', unit: 'm', f: d => d.rmax },
    { id: 'rpmmax', name: 'Fastest safe rpm at this r', short: 'rpm_max', sym: 'rpm<sub>max</sub>', unit: 'rpm', f: d => d.rpmmax },
    { id: 'fmax', name: 'Max static friction μmg', short: 'f_s,max', sym: 'f<sub>s,max</sub>', unit: 'N', f: d => d.fmax }]; },
  work(v, d){
    return '<h4>1 · Angular speed</h4><div class="eq">ω = 2π × rpm / 60 = 2π(' + H.iv('rpm') + ')/60 = <b>' + H.n(d.w, 'rad/s') + '</b></div>' +
      '<p class="note">Every point on the record has the same ω. Change units: r = ' + H.iv('r') + ' = ' + H.n(d.r, 'm') + ', m = ' + H.iv('m') + ' = ' + H.n(d.m, 'kg') + '.</p>' +
      '<h4>2 · Speed of the coin</h4><div class="eq">v = ωr = (' + H.n(d.w, 'rad/s') + ')(' + H.n(d.r, 'm') + ') = <b>' + H.n(d.sp, 'm/s') + '</b></div>' +
      '<h4>3 · Centripetal acceleration, two ways</h4><div class="eq">a<sub>c</sub> = ω²r = (' + H.n(d.w) + ')²(' + H.n(d.r) + ') = <b>' + H.n(d.ac, 'm/s²') + '</b></div>' +
      '<div class="eq">a<sub>c</sub> = v²/r = (' + H.n(d.sp) + ')²/(' + H.n(d.r) + ') = ' + H.n(d.ac, 'm/s²') + ' ✓</div>' +
      '<p class="note">At a fixed ω, farther out means <b>more</b> a<sub>c</sub> (v grows with r too).</p>' +
      '<h4>4 · Force needed (static friction supplies it)</h4><div class="eq">F = m a<sub>c</sub> = (' + H.n(d.m, 'kg') + ')(' + H.n(d.ac, 'm/s²') + ') = <b>' + H.n(d.Fc, 'N') + '</b></div>' +
      '<h4>5 · Most friction available</h4><div class="eq">f<sub>s,max</sub> = μ<sub>s</sub>mg = (' + H.iv('mu') + ')(' + H.n(d.m, 'kg') + ')(' + H.g() + ') = <b>' + H.n(d.fmax, 'N') + '</b></div>' +
      (d.slip ? '<div class="bad">Needed &gt; available → the coin slides off (along the tangent, not straight out).</div>' : '<div class="ok">Needed ≤ available → the coin rides along.</div>') +
      '<h4>6 · Farthest spot a coin can sit</h4><div class="eq">μ<sub>s</sub>mg = mω²r<sub>max</sub> → r<sub>max</sub> = μ<sub>s</sub>g/ω² = (' + H.iv('mu') + ')(' + H.g() + ')/(' + H.n(d.w) + ')² = <b>' + H.n(d.rmax, 'm') + '</b></div>' +
      '<p class="note">Mass cancels. The dashed ring on the record marks r<sub>max</sub>.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle('TOP VIEW', 10, 18);
    const cx = 180, cy = 168, Rp = 150, k = Rp / 0.2; // 20 cm = 150 px
    if (A.phi === undefined){ A.phi = 0; A.cphi = 0; }
    if (A.reset){ A.fly = null; A.cphi = A.phi; }
    A.phi += d.w * dt;
    // record
    ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, 7); ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1; for (let g = 30; g < Rp; g += 9){ ctx.beginPath(); ctx.arc(cx, cy, g, 0, 7); ctx.stroke(); }
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(A.phi); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(-2, -26, 4, 14); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, 7); ctx.fill(); ctx.restore();
    if (d.rmax < 0.2){ ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.arc(cx, cy, d.rmax * k, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      text('r_max', cx + d.rmax * k * 0.71 + 4, cy - d.rmax * k * 0.71, { font: '700 11px "IBM Plex Mono",monospace', col: '#ff6a2b' }); }
    // coin
    const rc = d.r * k; let x, y, ang = A.phi + A.cphi * 0;
    if (!d.slip){ A.fly = null; ang = A.phi; x = cx + rc * Math.cos(ang); y = cy + rc * Math.sin(ang); }
    else {
      if (!A.fly){ A.fly = { a0: A.phi, t0: 0 }; }
      A.fly.t0 += dt;
      const a0 = A.fly.a0, s = A.fly.t0, px0 = cx + rc * Math.cos(a0), py0 = cy + rc * Math.sin(a0), vx = -Math.sin(a0) * d.sp * k * 0.6, vy = Math.cos(a0) * d.sp * k * 0.6;
      x = px0 + vx * s; y = py0 + vy * s; ang = a0;
      if (s > 1.6) A.fly = null;
    }
    ctx.fillStyle = '#d4a017'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 7 + v.m * 0.15, 0, 7); ctx.fill(); ctx.stroke();
    if (!d.slip){
      const tx = -Math.sin(ang), ty = Math.cos(ang), ix = -Math.cos(ang), iy = -Math.sin(ang);
      arrow(x, y, x + tx * (14 + d.sp * 40), y + ty * (14 + d.sp * 40), COL.V, 'v');
      arrow(x, y, x + ix * (14 + 40 * d.Fc / d.fmax), y + iy * (14 + 40 * d.Fc / d.fmax), COL.F, 'f');
    } else text('SLIPPING OFF', 12, 318, { font: '700 14px "Space Grotesk",sans-serif', col: '#c43a00' });
    // bars: needed vs available
    panelTitle('FRICTION: NEEDED vs AVAILABLE', 372, 18);
    const top = 50, bot = 260, mx = Math.max(d.Fc, d.fmax) * 1.15, Y = q => bot - (bot - top) * q / mx;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(390, bot); ctx.lineTo(590, bot); ctx.stroke();
    const bar = (x0, val, col, lab) => { ctx.fillStyle = col; ctx.fillRect(x0, Y(val), 60, bot - Y(val)); ctx.strokeStyle = '#111'; ctx.strokeRect(x0, Y(val), 60, bot - Y(val));
      text(lab, x0 + 30, bot + 16, { align: 'center', font: '700 12px "Space Grotesk",sans-serif' }); text(fplain(val) + ' N', x0 + 30, Y(val) - 6, { align: 'center', font: '600 11px "IBM Plex Mono",monospace' }); };
    bar(405, d.Fc, d.slip ? '#c43a00' : '#ff6a2b', 'mω²r'); bar(505, d.fmax, '#e8e8e8', 'μ_s mg');
    text(d.slip ? 'needed > available' : 'needed ≤ available', 490, 300, { align: 'center', font: '700 13px "Space Grotesk",sans-serif', col: d.slip ? '#c43a00' : '#1e7d45' });
  }
};
