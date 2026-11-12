// Car on a Curve: flat road (static friction) and banked road (no friction).
const SIM = {
  title: 'Car on a Curve',
  modes: [{ id: 'flat', label: 'Flat road (friction)' }, { id: 'bank', label: 'Banked road (no friction)' }, { id: 'steer', label: 'Steering car: aₜ, a_c' }],
  opts: [{ id: 'sp', label: 'Path', modes: ['steer'], choices: [['circle', 'Circle'], ['sbend', 'S-bend'], ['oval', 'Speed up on a curve']] }],
  ivs(mode, opt){
    if (mode === 'steer') return [
      { id: 'v', sym: 'v', symText: 'v', label: 'Speed (start of run)', unit: 'm/s', min: 2, max: 30, step: 0.5, val: 12, graph: true },
      { id: 'r', sym: 'r', symText: 'r', label: 'Curve radius', unit: 'm', min: 10, max: 100, step: 1, val: 30 }].concat((opt && opt.sp) === 'sbend' ? [] : [
      { id: 'at', sym: 'a<sub>t</sub>', symText: 'at', label: 'Gas (+) / brake (−)', unit: 'm/s²', min: -6, max: 6, step: 0.5, val: 2, show: x => (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x).toFixed(1) + ' m/s²' }]);
    const base = [
      { id: 'm', sym: 'm', symText: 'm', label: 'Car mass', unit: 'kg', min: 500, max: 3000, step: 50, val: 1200 },
      { id: 'v', sym: 'v', symText: 'v', label: 'Speed', unit: 'm/s', min: 2, max: 40, step: 0.5, val: 15, graph: true },
      { id: 'r', sym: 'r', symText: 'r', label: 'Curve radius', unit: 'm', min: 10, max: 200, step: 1, val: 50 }];
    return mode === 'flat'
      ? base.concat([{ id: 'mu', sym: 'μ<sub>s</sub>', symText: 'μs', label: 'Static friction', unit: '', min: 0.1, max: 1, step: 0.05, val: 0.6, show: v => v.toFixed(2) }])
      : base.concat([{ id: 'th', sym: 'θ', symText: 'θ', label: 'Bank angle', unit: '°', min: 5, max: 45, step: 1, val: 20, show: v => v.toFixed(0) + '°' }]);
  },
  calc(v, mode, opt){
    if (mode === 'steer'){ const ac = v.v * v.v / v.r, at = (opt && opt.sp) === 'sbend' ? 0 : v.at, a = Math.hypot(at, ac); return { steer: true, ac, at, a, ang: Math.atan2(Math.abs(at), ac) / DEG }; }
    const ac = v.v * v.v / v.r, Fc = v.m * ac, W = v.m * G10;
    if (mode === 'flat'){ const fmax = v.mu * W, vmax = Math.sqrt(v.mu * G10 * v.r); return { ac, Fc, W, N: W, fmax, vmax, ok: Fc <= fmax * (1 + 1e-9), f: Math.min(Fc, fmax) }; }
    const th = v.th * DEG, N = W / Math.cos(th), Fprov = W * Math.tan(th), v0 = Math.sqrt(G10 * v.r * Math.tan(th));
    return { ac, Fc, W, N, Fprov, v0, diff: Fc - Fprov, th };
  },
  dvs(mode){
    if (mode === 'steer') return [
      { id: 'ac', name: 'Centripetal acceleration a_c = v²/r', short: 'a_c', sym: 'a<sub>c</sub>', unit: 'm/s²', f: d => d.ac, vs: 'a' },
      { id: 'a', name: 'Total acceleration |a|', short: '|a|', sym: '|a|', unit: 'm/s²', f: d => d.a },
      { id: 'ang', name: 'Tilt of a from the centre direction', short: 'tilt', sym: 'tilt', unit: '°', f: d => d.ang }];
    return mode === 'flat' ? [
      { id: 'Fc', name: 'Force needed, mv²/r', short: 'F needed', sym: 'F<sub>needed</sub>', unit: 'N', f: d => d.Fc, vs: 'fmax' },
      { id: 'ac', name: 'Centripetal acceleration', short: 'a_c', sym: 'a<sub>c</sub>', unit: 'm/s²', f: d => d.ac },
      { id: 'vmax', name: 'Fastest safe speed', short: 'v_max', sym: 'v<sub>max</sub>', unit: 'm/s', f: d => d.vmax },
      { id: 'fmax', name: 'Max static friction', short: 'f_s,max', sym: 'f<sub>s,max</sub>', unit: 'N', f: d => d.fmax }
    ] : [
      { id: 'Fc', name: 'Force needed, mv²/r', short: 'F needed', sym: 'F<sub>needed</sub>', unit: 'N', f: d => d.Fc, vs: 'Fprov' },
      { id: 'v0', name: 'Design speed v₀', short: 'v₀', sym: 'v<sub>0</sub>', unit: 'm/s', f: d => d.v0 },
      { id: 'N', name: 'Normal force', short: 'N', sym: 'N', unit: 'N', f: d => d.N },
      { id: 'Fprov', name: 'Force the bank gives, N sinθ', short: 'N sinθ', sym: 'N sinθ', unit: 'N', f: d => d.Fprov },
      { id: 'ac', name: 'Centripetal acceleration', short: 'a_c', sym: 'a<sub>c</sub>', unit: 'm/s²', f: d => d.ac }
    ];
  },
  work(v, d, mode, opt){
    if (mode === 'steer') return workSteer(v, d, opt);
    const g = M.n(10, 'm/s²');
    let h = '<h4>1 · Centripetal acceleration</h4>' + TEX`a_c = \frac{v^2}{r}` + TEX`a_c = \frac{(${M.iv('v')})^2}{${M.iv('r')}}` + TEXA`a_c = ${M.n(d.ac, 'm/s²')}` +
      '<h4>2 · Net force needed toward the center</h4>' + TEX`\Sigma F_c = m\,a_c` + TEX`\Sigma F_c = (${M.iv('m')})(${M.n(d.ac, 'm/s²')})` + TEXA`\Sigma F_c = ${M.n(d.Fc, 'N')}`;
    if (mode === 'flat'){
      h += '<p class="note">On a flat road the only sideways force is <b>static friction</b>, so friction has to supply all of it.</p>' +
        '<h4>3 · Most friction the tires can get</h4>' + TEX`f_{s,\max} = \mu_s N = \mu_s\,m g` + TEX`f_{s,\max} = (${M.iv('mu')})(${M.iv('m')})(${g})` + TEXA`f_{s,\max} = ${M.n(d.fmax, 'N')}` +
        '<h4>4 · Compare</h4>' + (d.ok
          ? '<div class="ok">Needed ' + H.n(d.Fc, 'N') + ' ≤ available ' + H.n(d.fmax, 'N') + ' → friction can do it. The car makes the turn.</div>'
          : '<div class="bad">Needed ' + H.n(d.Fc, 'N') + ' &gt; available ' + H.n(d.fmax, 'N') + ' → not enough friction. The car skids toward the <b>outside</b> of the curve (closer to a straight line).</div>') +
        '<h4>5 · Fastest speed that works</h4>' + TEX`\mu_s\,m g = \frac{m\,v_{\max}^2}{r}` + TEX`v_{\max} = \sqrt{\mu_s\,g\,r}` + TEX`v_{\max} = \sqrt{(${M.iv('mu')})(${g})(${M.iv('r')})}` + TEXA`v_{\max} = ${M.n(d.vmax, 'm/s')}` +
        '<p class="note">m is on both sides and cancels: a heavier car needs more force but also gets more friction.</p>';
    } else {
      h += '<h4>3 · Vertical: no up/down acceleration</h4>' + TEX`N\,\cos\theta = m g` + TEX`N = \frac{m g}{\cos\theta}` + TEX`N = \frac{(${M.iv('m')})(${g})}{\cos ${M.iv('th')}}` + TEXA`N = ${M.n(d.N, 'N')}` +
        '<h4>4 · Sideways force the bank gives</h4>' + TEX`N\,\sin\theta = m g\,\tan\theta` + TEX`N\,\sin\theta = (${M.iv('m')})(${g})\,\tan ${M.iv('th')}` + TEXA`N\,\sin\theta = ${M.n(d.Fprov, 'N')}` +
        '<h4>5 · Compare</h4>' + (Math.abs(d.diff) <= 0.01 * d.Fc
          ? '<div class="ok">Needed ≈ given. This is the design speed: no friction is needed at all.</div>'
          : d.diff > 0
            ? '<div class="bad">Needed ' + H.n(d.Fc, 'N') + ' &gt; given ' + H.n(d.Fprov, 'N') + '. Too fast: the car slides <b>up the bank</b> (outward). Friction would have to point down the slope to help.</div>'
            : '<div class="bad">Needed ' + H.n(d.Fc, 'N') + ' &lt; given ' + H.n(d.Fprov, 'N') + '. Too slow: the car slides <b>down the bank</b> (inward). Friction would have to point up the slope to help.</div>') +
        '<h4>6 · Design speed (no friction needed)</h4><p class="st">Sideways and vertical together:</p>' + TEX`N\,\sin\theta = \frac{m\,v_0^2}{r}` + TEX`N\,\cos\theta = m g` + TEX`\tan\theta = \frac{v_0^2}{g\,r}` + TEX`v_0 = \sqrt{g\,r\,\tan\theta}` + TEX`v_0 = \sqrt{(${g})(${M.iv('r')})\,\tan ${M.iv('th')}}` + TEXA`v_0 = ${M.n(d.v0, 'm/s')}` +
        '<p class="note">Mass cancels again: every car has the same design speed.</p>';
    }
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    // ---- top view ----
    const cx = 180, cy = 165, R = 40 + 118 * (v.r / 200);
    panelTitle('TOP VIEW', 10, 18);
    ctx.lineWidth = 22; ctx.strokeStyle = mode === 'bank' ? '#c9c9c9' : '#d9d9d9'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff'; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill(); text('center', cx + 6, cy + 4, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    if (A.phi === undefined || A.reset){ if (A.phi === undefined) A.phi = -PI / 2; A.off = 0; A.skid = 0; }
    const w = Math.max(0.25, Math.min(2.5, v.v / v.r));
    let rr = R, px, py, heading;
    if (mode === 'flat' && !d.ok){
      A.skid += dt; if (A.skid > 2.6){ A.skid = 0; }
      const k = (d.Fc - d.fmax) / d.Fc; // fraction of the needed force that is missing
      A.phi += w * dt * (1 - 0.5 * k);
      rr = R + 70 * k * A.skid * A.skid;
    } else {
      A.phi += w * dt;
      if (mode === 'bank'){ const k = Math.max(-1, Math.min(1, d.diff / Math.max(d.Fc, d.Fprov))); A.off += (k * 10 - A.off) * Math.min(1, dt * 3); rr = R + A.off; }
    }
    px = cx + rr * Math.cos(A.phi); py = cy + rr * Math.sin(A.phi); heading = A.phi + PI / 2;
    ctx.save(); ctx.translate(px, py); ctx.rotate(heading); ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(-11, -6, 22, 12); ctx.strokeRect(-11, -6, 22, 12); ctx.restore();
    const ux = Math.cos(heading), uy = Math.sin(heading), inx = -Math.cos(A.phi), iny = -Math.sin(A.phi);
    arrow(px, py, px + ux * (20 + v.v * 1.6), py + uy * (20 + v.v * 1.6), COL.V, 'v');
    const fShown = mode === 'flat' ? d.f : d.Fprov, fl = Math.min(70, 12 + 55 * fShown / Math.max(d.W, 1));
    arrow(px, py, px + inx * fl, py + iny * fl, COL.F, mode === 'flat' ? (d.ok ? 'f (toward center)' : 'f (max)') : 'N sinθ');
    if (mode === 'flat' && !d.ok) text('SKIDDING', 12, 318, { font: '700 14px "Space Grotesk",sans-serif', col: '#c43a00' });
    if (mode === 'bank' && Math.abs(d.diff) > 0.01 * d.Fc) text(d.diff > 0 ? 'sliding up the bank' : 'sliding down the bank', 12, 318, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' });
    // ---- side view FBD (looking from behind the car; center of the curve is to the left) ----
    const bx = 470, by = 230; panelTitle('FROM BEHIND (center ←)', 372, 18);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
    const th = mode === 'bank' ? v.th * DEG : 0;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-th);
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(-110, 0, 220, 60); ctx.beginPath(); ctx.moveTo(-110, 0); ctx.lineTo(110, 0); ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.fillRect(-26, -30, 52, 30); ctx.strokeRect(-26, -30, 52, 30);
    ctx.restore();
    const ox = bx - 15 * Math.sin(th) * 0, oy = by - 15;
    const sc = 75 / d.W;
    arrow(ox, oy, ox, oy + d.W * sc, COL.W, 'mg', { lx: 6, ly: 2 });
    if (mode === 'flat'){
      arrow(ox, oy, ox, oy - d.N * sc, COL.N, 'N', { lx: 6, ly: 4 });
      arrow(ox, oy, ox - d.f * sc, oy, COL.F, 'f', { lx: -6, ly: -8 });
    } else {
      const nl = d.N * sc, nx = -Math.sin(th) * nl, ny = -Math.cos(th) * nl;
      arrow(ox, oy, ox + nx, oy + ny, COL.N, 'N', { lx: -8, ly: -6 });
      arrow(ox, oy, ox + nx, oy, COL.comp, 'N sinθ', { w: 2, dash: [4, 3], lx: -6, ly: 12 });
      arrow(ox, oy, ox, oy + ny, COL.comp, 'N cosθ', { w: 2, dash: [4, 3], lx: 6, ly: 2 });
    }
    text('arrows to scale (mg = ' + fnum(d.W).replace(/<[^>]+>/g, '') + ' N)', 372, 318, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};

const _baseDraw = SIM.draw;
SIM.draw = function(v, d, mode, opt, t, dt, A){
  if (mode === 'steer') return drawSteer(v, d, opt, t, dt, A);
  return _baseDraw.apply(this, arguments);
};

// ---------- Steering car: tangential and centripetal acceleration ----------
const CPF = '"Space Grotesk",sans-serif', CPM = '"IBM Plex Mono",monospace';
const C_A = '#1e7d45', C_C = '#c43a00', C_TOT = '#7a3fb0';
function workSteer(v, d, opt){
  const sp = (opt && opt.sp) || 'circle', onCurve = sp !== 'oval' ? 'on the curve' : 'in the curved part';
  let h = '<p class="st">The numbers below are for the speed at the <b>start of each run</b>. In the animation the speed keeps changing, so watch the live readouts.</p>' +
    '<h4>1 · Velocity: along the path</h4><p class="st">v is always <b>tangent</b> to the path (the direction the car is heading). Speed now: ' + H.iv('v') + '.</p>' +
    '<h4>2 · Centripetal acceleration: turns the car</h4><p class="st">It points <b>toward the centre of the curve</b>, at 90° to v. It changes the direction of v, not the speed.</p>' +
    TEX`a_c = \frac{v^2}{r}` + TEX`a_c = \frac{(${M.iv('v')})^2}{${M.iv('r')}}` + TEXA`a_c = ${M.n(d.ac, 'm/s²')}` +
    '<h4>3 · Tangential acceleration: speeds up or slows down</h4>';
  if (sp === 'sbend') h += '<p class="st">Constant speed, so there is no gas or brake:</p>' + TEXA`a_t = 0` + '<p class="note">The a_c arrow still flips sides: toward the centre of each bend (left bend: car’s left; right bend: car’s right).</p>';
  else h += '<p class="st">It points <b>along v</b> when you press the gas, and <b>against v</b> when you brake. It changes the speed, not the direction. From the slider:</p>' + TEXA`a_t = ${M.iv('at')}` +
    '<p class="st">' + (d.at > 0 ? 'Gas: a<sub>t</sub> points forward, so the car speeds up.' : d.at < 0 ? 'Brake: a<sub>t</sub> points backward, so the car slows down.' : 'a<sub>t</sub> = 0: constant speed.') + '</p>';
  h += '<h4>4 · Total acceleration: add the two (they are at 90°)</h4>' + TEX`|\vec{a}| = \sqrt{a_t^2 + a_c^2}` + TEX`|\vec{a}| = \sqrt{(${M.n(d.at)})^2 + (${M.n(d.ac)})^2}` + TEXA`|\vec{a}| = ${M.n(d.a, 'm/s²')}`;
  if (Math.abs(d.at) < 1e-9) h += '<p class="st">Direction: all a<sub>c</sub>, so <b>a points to the centre</b>.</p>';
  else h += '<p class="st">Direction: tilted away from the centre line by</p>' + TEX`\tan\theta = \frac{|a_t|}{a_c}` + TEXA`\theta = ${M.n(d.ang, '°')}` +
    '<p class="st">' + (d.at > 0 ? 'a points toward the centre <b>and forward</b> (gas).' : 'a points toward the centre <b>and backward</b> (brake).') + '</p>';
  if (sp === 'oval') h += '<p class="note">On the straight parts r is infinite, so a<sub>c</sub> = 0 and the total acceleration is just a<sub>t</sub> (along v). ' + onCurve.replace('on the curve', 'In the curve') + ' the numbers above apply.</p>';
  else h += '<p class="note">If a<sub>t</sub> = 0, the total acceleration is just a<sub>c</sub>: toward the centre. With gas or brake, a leans forward or backward.</p>';
  return h;
}
// path geometry (screen px, y down). rpx = drawn radius of the curved parts. Returns {pts:[{x,y,hx,hy,k}], len}; k = +1 curving left, -1 right, 0 straight
const STP = window._stp = window._stp || {};
function stPath(kind, rpx){
  const key = kind + rpx.toFixed(1); if (STP.key === key) return STP.path;
  const pts = []; const add = (x, y, hx, hy, k) => pts.push({ x, y, hx, hy, k });
  if (kind === 'circle'){ const cx = 190, cy = 172, n = Math.ceil(2 * PI * rpx); for (let i = 0; i < n; i++){ const a = i / n * 2 * PI; add(cx + rpx * Math.sin(a), cy + rpx * Math.cos(a), Math.cos(a), -Math.sin(a), 1); } }
  else if (kind === 'oval'){ const Ls = Math.max(60, 330 - 2 * rpx), cx = 190, cy = 172, xl = cx - Ls / 2, xr = cx + Ls / 2;
    for (let x = 0; x < Ls; x++) add(xl + x, cy + rpx, 1, 0, 0);
    let n = Math.ceil(PI * rpx); for (let i = 0; i < n; i++){ const a = i / n * PI; add(xr + rpx * Math.sin(a), cy + rpx * Math.cos(a), Math.cos(a), -Math.sin(a), 1); }
    for (let x = 0; x < Ls; x++) add(xr - x, cy - rpx, -1, 0, 0);
    for (let i = 0; i < n; i++){ const a = i / n * PI; add(xl - rpx * Math.sin(a), cy - rpx * Math.cos(a), -Math.cos(a), Math.sin(a), 1); } }
  else { // S-bend: heading swings between +0.5 and -0.5 rad, left then right turns, loops back by wrapping
    let x = 12, y = 0, psi = 0.5, k = 1; const arc = 1.0 / (1 / rpx); // arc length of one turn
    while (x < 372){ const n = Math.ceil(arc); for (let i = 0; i < n && x < 372; i++){ add(x, y, Math.cos(psi), Math.sin(psi), k); const ds = arc / n; x += Math.cos(psi) * ds; y += Math.sin(psi) * ds; psi -= k * ds / rpx; } k = -k; }
    const my = pts.reduce((a, p) => a + p.y, 0) / pts.length; pts.forEach(p => p.y += 172 - my); }
  STP.key = key; STP.path = { pts, len: pts.length }; return STP.path;
}
function drawSteer(v, d, opt, t, dt, A){
  const sp = (opt && opt.sp) || 'circle', rpx = 38 + 82 * (v.r - 10) / 90, P = stPath(sp, rpx), scale = rpx / v.r;
  if (A.s === undefined || A.sp !== sp || A.rpx !== rpx){ A.s = 0; A.sp = sp; A.rpx = rpx; A.reset = true; }
  if (A.reset || A.v === undefined){ A.v = v.v; A.tr = 0; }
  const at = d.at;
  A.v += at * dt; A.tr += dt; if (A.v < 0.8 || A.v > 36 || A.tr > 5){ A.v = v.v; A.tr = 0; }
  A.s = (A.s + A.v * scale * dt) % P.len;
  const p = P.pts[Math.floor(A.s)], vn = A.v;
  panelTitle('TOP VIEW OF THE ROAD', 10, 18);
  // road
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = '#d9d9d9'; ctx.lineWidth = 20;
  ctx.beginPath(); P.pts.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); if (sp !== 'sbend') ctx.closePath(); ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.setLineDash([7, 7]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  // centre of the current curve
  const acNow = p.k ? vn * vn / v.r : 0, nx = p.k * p.hy, ny = -p.k * p.hx;
  if (p.k){ const cR = rpx; ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(p.x + nx * cR, p.y + ny * cR, 3, 0, 7); ctx.fill(); ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + nx * cR, p.y + ny * cR); ctx.stroke(); ctx.setLineDash([]); text('centre', p.x + nx * cR + 6, p.y + ny * cR - 6, { font: '500 10px ' + CPM, col: '#4a4a4a' }); text('r', p.x + nx * cR * 0.5 + 4, p.y + ny * cR * 0.5, { font: '600 11px ' + CPF, col: '#8a8a8a' }); }
  // car
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.hy, p.hx)); ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(-11, -6, 22, 12); ctx.strokeRect(-11, -6, 22, 12); ctx.fillStyle = '#fff'; ctx.fillRect(4, -4, 4, 8); ctx.restore();
  // vectors
  const vl = 16 + vn * 2, kA = Math.min(8, 90 / Math.max(acNow, Math.abs(at), 0.1)), small = kA < 8;
  const tx = p.hx * at * kA, ty = p.hy * at * kA, cx2 = nx * acNow * kA, cy2 = ny * acNow * kA;
  arrow(p.x, p.y, p.x + p.hx * vl, p.y + p.hy * vl, COL.V, 'v', { lx: p.hx * 4, ly: p.hy * 8 - 4 });
  if (Math.abs(at) > 0.05 && acNow > 0.05){ ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x + tx, p.y + ty); ctx.lineTo(p.x + tx + cx2, p.y + ty + cy2); ctx.lineTo(p.x + cx2, p.y + cy2); ctx.stroke(); ctx.restore(); }
  const totL = Math.hypot(tx + cx2, ty + cy2);
  const hasT = Math.abs(at) > 0.05, hasC = acNow > 0.05, both = hasT && hasC;
  if (totL > 3) arrow(p.x, p.y, p.x + tx + cx2, p.y + ty + cy2, C_TOT, both ? 'a' : hasC ? 'a = a_c' : 'a = aₜ', { w: 5, head: 10, lx: 6, ly: 0 });
  if (both) arrow(p.x, p.y, p.x + cx2, p.y + cy2, C_C, 'a_c', { w: 2.5, head: 7, lx: 5, ly: 8 });
  if (both) arrow(p.x, p.y, p.x + tx, p.y + ty, C_A, 'aₜ', { w: 2.5, head: 7, lx: 5, ly: -8 });
  text(small ? 'acceleration arrows shrunk to fit' : '1 m/s² = 8 px (acceleration arrows)', 12, 322, { font: '500 10px ' + CPM, col: '#8a8a8a' });
  // live readouts
  const aNow = Math.hypot(at, acNow);
  panelTitle('LIVE READOUTS', 395, 18);
  [['v', fplain(vn) + ' m/s', COL.V], ['aₜ', (at > 0 ? '+' : at < 0 ? '−' : '') + fplain(Math.abs(at)) + ' m/s²', C_A], ['a_c = v²/r', fplain(acNow) + ' m/s²', C_C], ['|a|', fplain(aNow) + ' m/s²', C_TOT]].forEach(([a, b, c], i) => { text(a, 400, 42 + i * 22, { font: '700 12px ' + CPF, col: c }); text(b, 592, 42 + i * 22, { align: 'right', font: '700 13px ' + CPM }); });
  text(p.k === 0 ? 'on a straight: a_c = 0' : 'turning ' + (p.k > 0 ? 'left' : 'right') + ', centre on the ' + (p.k > 0 ? 'left' : 'right'), 400, 136, { font: '600 11.5px ' + CPF, col: '#4a4a4a' });
  text(at > 0.05 ? 'gas: speeding up' : at < -0.05 ? 'brake: slowing down' : 'constant speed', 400, 152, { font: '600 11.5px ' + CPF, col: '#4a4a4a' });
  // car's-frame vector triangle
  panelTitle('IN THE CAR’S FRAME', 395, 176); text('forward ↑   centre ←', 395, 190, { font: '500 10px ' + CPM, col: '#4a4a4a' });
  const ox = 548, oy = 300, k2 = Math.min(6, 80 / Math.max(acNow, Math.abs(at), 0.1)), fx = ox - acNow * k2, fy = oy - at * k2;
  ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox, oy + 6); ctx.lineTo(ox, 200); ctx.moveTo(ox - 150, oy); ctx.lineTo(ox + 12, oy); ctx.stroke();
  ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = '#8a8a8a'; ctx.beginPath(); ctx.moveTo(fx, oy); ctx.lineTo(fx, fy); ctx.lineTo(ox, fy); ctx.stroke(); ctx.restore();
  const bothF = Math.abs(at) > 0.05 && acNow > 0.05;
  arrow(ox, oy, fx, fy, C_TOT, bothF ? '|a|' : acNow > 0.05 ? '|a| = a_c' : '|a| = aₜ', { w: 4, head: 9, lx: -4, ly: at >= 0 ? -9 : 10, align: 'right' });
  if (bothF) arrow(ox, oy, fx, oy, C_C, 'a_c', { w: 2.5, head: 7, lx: 0, ly: 12, align: 'right' });
  if (bothF) arrow(ox, oy, ox, fy, C_A, 'aₜ', { w: 2.5, head: 7, lx: 6, ly: 0 });
}
