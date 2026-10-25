// Energy Track: a cart on a track. Energy bar charts, a point B to analyze, and a system switch.
function buildTrack(v, mode){
  const p = [{ x: 0, y: v.h0 }];
  const seg = (x2, y2, n) => { const a = p[p.length - 1]; n = n || 40; for (let i = 1; i <= n; i++){ const f = i / n; p.push({ x: a.x + (x2 - a.x) * f, y: a.y + (y2 - a.y) * (1 - Math.cos(PI * f)) / 2 }); } };
  const flat = (x2, n) => { const a = p[p.length - 1]; n = n || 30; for (let i = 1; i <= n; i++) p.push({ x: a.x + (x2 - a.x) * i / n, y: a.y }); };
  let loop = null, rough = null, spring = null;
  if (mode === 'valley'){ seg(6, 0.5); seg(13, 5); seg(20, 1); seg(26, 4); flat(30, 10); }
  else if (mode === 'hump'){ seg(7, 0); flat(11, 10); seg(15.5, 4, 30); seg(20, 0, 30); flat(30, 20); }
  else if (mode === 'loop'){ seg(8, 0); flat(13, 12); const c = 13, R = v.R, n = 120;
    for (let i = 1; i <= n; i++){ const ph = -PI / 2 + 2 * PI * i / n; p.push({ x: c + R * Math.cos(ph), y: R + R * Math.sin(ph), ph }); }
    flat(30, 30); loop = { c, R }; }
  else if (mode === 'rough'){ seg(7, 0); flat(23, 60); seg(30, 7, 40); rough = { x1: 9, x2: 9 + v.L }; }
  else if (mode === 'spring'){ seg(8, 0); flat(30, 60); spring = { x0: 24 }; }
  // arc lengths
  const s = [0]; for (let i = 1; i < p.length; i++) s.push(s[i - 1] + Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y));
  const sAtX = x => { for (let i = 1; i < p.length; i++){ if (p[i].x >= x && !('ph' in p[i])){ const f = (x - p[i - 1].x) / ((p[i].x - p[i - 1].x) || 1); return s[i - 1] + f * (s[i] - s[i - 1]); } } return s[s.length - 1]; };
  if (rough){ rough.s1 = sAtX(rough.x1); rough.s2 = sAtX(Math.min(rough.x2, 23)); }
  if (spring) spring.s0 = sAtX(spring.x0);
  return { p, s, total: s[s.length - 1], loop, rough, spring };
}
function trackAt(tr, sq){
  const s = tr.s, p = tr.p; sq = Math.max(0, Math.min(tr.total, sq));
  let lo = 0, hi = s.length - 1; while (hi - lo > 1){ const mid = (lo + hi) >> 1; if (s[mid] <= sq) lo = mid; else hi = mid; }
  const f = (sq - s[lo]) / ((s[hi] - s[lo]) || 1), a = p[lo], b = p[hi];
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, ang: Math.atan2(b.y - a.y, b.x - a.x), ph: ('ph' in b) ? b.ph : null };
}
function roughBefore(tr, sq){ if (!tr.rough) return 0; return Math.max(0, Math.min(sq, tr.rough.s2) - tr.rough.s1); }
function compAt(tr, sq){ return tr.spring ? Math.max(0, sq - tr.spring.s0) : 0; }

const SIM = {
  title: 'Energy Track',
  modes: [{ id: 'valley', label: 'Hill & valley' }, { id: 'hump', label: 'Hump' }, { id: 'loop', label: 'Loop' }, { id: 'rough', label: 'Rough patch' }, { id: 'spring', label: 'Spring bumper' }],
  opts: [{ id: 'sys', label: 'System', choices: [['earth', 'Cart + Earth'], ['cart', 'Cart only']] }],
  ivs(mode){
    const base = [
      { id: 'h0', sym: 'h<sub>A</sub>', symText: 'hA', label: 'Start height', unit: 'm', min: 1, max: 12, step: 0.1, val: mode === 'loop' ? 10 : 8, graph: true },
      { id: 'v0', sym: 'v<sub>A</sub>', symText: 'vA', label: 'Start speed', unit: 'm/s', min: 0, max: 10, step: 0.1, val: 0 },
      { id: 'm', sym: 'm', symText: 'm', label: 'Cart mass', unit: 'kg', min: 20, max: 100, step: 1, val: 60 },
      { id: 'pB', sym: 'B', symText: 'B', label: 'Point B along track', unit: '%', min: 0, max: 100, step: 0.5, val: 50, show: v => v.toFixed(1) + '%' }];
    if (mode === 'loop') base.push({ id: 'R', sym: 'R', symText: 'R', label: 'Loop radius', unit: 'm', min: 1, max: 4.5, step: 0.1, val: 3 });
    if (mode === 'rough') base.push({ id: 'mu', sym: 'μ<sub>k</sub>', symText: 'μk', label: 'Rough-patch friction', unit: '', min: 0, max: 0.6, step: 0.05, val: 0.3, show: v => v.toFixed(2) },
      { id: 'L', sym: 'd', symText: 'd', label: 'Rough-patch length', unit: 'm', min: 1, max: 14, step: 0.5, val: 6 });
    if (mode === 'spring') base.push({ id: 'k', sym: 'k', symText: 'k', label: 'Spring constant', unit: 'N/m', min: 200, max: 5000, step: 50, val: 1500 });
    return base;
  },
  calc(v, mode){
    const tr = buildTrack(v, mode), m = v.m, E0 = m * G10 * v.h0 + 0.5 * m * v.v0 * v.v0;
    const sB = tr.total * v.pB / 100, B = trackAt(tr, sB), dR = roughBefore(tr, sB), Eth = (v.mu || 0) * m * G10 * dR, xc = compAt(tr, sB), Us = 0.5 * (v.k || 0) * xc * xc;
    // does the cart reach B on its first trip? check every point up to B
    let reach = true, why = '', vmin2 = Infinity;
    for (let i = 0; i < tr.p.length && tr.s[i] <= sB + 1e-9; i++){
      const q = tr.p[i], K = E0 - (v.mu || 0) * m * G10 * roughBefore(tr, tr.s[i]) - m * G10 * q.y - 0.5 * (v.k || 0) * compAt(tr, tr.s[i]) ** 2;
      if (K < -1e-9){ reach = false; why = 'turn'; break; }
      if ('ph' in q){ const v2 = 2 * K / m, N = m * v2 / v.R - m * G10 * Math.sin(q.ph); if (N < -1e-9){ reach = false; why = 'fall'; break; } }
    }
    const KB = E0 - Eth - m * G10 * B.y - Us, vB = KB > 0 ? Math.sqrt(2 * KB / m) : 0;
    const out = { tr, E0, sB, hB: B.y, Eth, xc, Us, KB, vB, reach, why, UgA: m * G10 * v.h0, KA: 0.5 * m * v.v0 * v.v0, UgB: m * G10 * B.y, Wg: m * G10 * (v.h0 - B.y) };
    if (mode === 'loop'){ out.vtop2 = v.v0 * v.v0 + 2 * G10 * (v.h0 - 2 * v.R); out.vtop = out.vtop2 > 0 ? Math.sqrt(out.vtop2) : 0; out.hmin = 2.5 * v.R - v.v0 * v.v0 / (2 * G10); out.Ntop = m * out.vtop2 / v.R - m * G10; }
    if (mode === 'rough'){ out.Eloss = v.mu * m * G10 * v.L; out.hf = v.h0 + v.v0 * v.v0 / (2 * G10) - v.mu * v.L; out.dstop = v.mu > 0 ? (v.h0 + v.v0 * v.v0 / (2 * G10)) / v.mu : Infinity; }
    if (mode === 'spring'){ out.xmax = Math.sqrt(2 * E0 / v.k); }
    return out;
  },
  dvs(mode){
    const l = [
      { id: 'vB', name: 'Speed at B', short: 'v_B', sym: 'v<sub>B</sub>', unit: 'm/s', f: d => d.reach ? d.vB : NaN },
      { id: 'KB', name: 'Kinetic energy at B', short: 'K_B', sym: 'K<sub>B</sub>', unit: 'J', f: d => d.reach ? d.KB : NaN },
      { id: 'E0', name: 'Total energy at A', short: 'E_A', sym: 'E<sub>A</sub>', unit: 'J', f: d => d.E0 }];
    if (mode === 'loop') l.push({ id: 'vtop', name: 'Speed at top of loop', short: 'v_top', sym: 'v<sub>top</sub>', unit: 'm/s', f: d => d.vtop2 >= 0 ? d.vtop : NaN },
      { id: 'Ntop', name: 'Normal force at top of loop', short: 'N_top', sym: 'N<sub>top</sub>', unit: 'N', f: d => d.Ntop, negNote: 'track would have to pull: falls off' },
      { id: 'hmin', name: 'Lowest start height that works', short: 'h_min', sym: 'h<sub>min</sub>', unit: 'm', f: d => d.hmin });
    if (mode === 'rough') l.push({ id: 'hf', name: 'Height reached on far ramp', short: 'h_f', sym: 'h<sub>f</sub>', unit: 'm', f: d => d.hf },
      { id: 'Eloss', name: 'Energy to thermal (whole patch)', short: 'ΔE_th', sym: 'ΔE<sub>th</sub>', unit: 'J', f: d => d.Eloss });
    if (mode === 'spring') l.push({ id: 'xmax', name: 'Max spring compression', short: 'x_max', sym: 'x<sub>max</sub>', unit: 'm', f: d => d.xmax });
    return l;
  },
  work(v, d, mode, opt){
    const cart = opt.sys === 'cart';
    let h = '<h4>1 · Start (point A)</h4><div class="eq">' + (cart ? 'K<sub>A</sub> = ½mv<sub>A</sub>² = ½(' + H.iv('m') + ')(' + H.iv('v0') + ')² = <b>' + H.n(d.KA, 'J') + '</b>'
        : 'E<sub>A</sub> = mgh<sub>A</sub> + ½mv<sub>A</sub>² = (' + H.iv('m') + ')(' + H.g() + ')(' + H.iv('h0') + ') + ½(' + H.iv('m') + ')(' + H.iv('v0') + ')² = <b>' + H.n(d.E0, 'J') + '</b>') + '</div>' +
      '<h4>2 · Point B</h4><div class="eq">Height read off the track: h<sub>B</sub> = <b>' + H.n(d.hB, 'm') + '</b></div>';
    const extras = [];
    if (mode === 'rough' && d.Eth > 0) extras.push(['μ<sub>k</sub>mgd', 'Rough patch crossed before B: d = ' + H.n(roughBefore(d.tr, d.sB), 'm') + ', so ' + (cart ? 'W<sub>f</sub> = −μ<sub>k</sub>mgd = −' : 'ΔE<sub>th</sub> = μ<sub>k</sub>mgd = ') + '(' + H.iv('mu') + ')(' + H.iv('m') + ')(' + H.g() + ')(' + H.n(roughBefore(d.tr, d.sB), 'm') + ') = ' + H.n(cart ? -d.Eth : d.Eth, 'J')]);
    if (mode === 'spring' && d.Us > 0) extras.push(['½kx²', 'Spring squeezed by x = ' + H.n(d.xc, 'm') + ' at B: ' + (cart ? 'W<sub>s</sub> = −½kx² = ' + H.n(-d.Us, 'J') : 'U<sub>s</sub> = ½kx² = ½(' + H.iv('k') + ')(' + H.n(d.xc) + ')² = ' + H.n(d.Us, 'J'))]);
    extras.forEach((e, i) => { h += '<h4>' + (3 + i) + ' · ' + (mode === 'rough' ? 'Friction on the rough patch' : 'Spring') + '</h4><div class="eq">' + e[1] + '</div>'; });
    const n = 3 + extras.length;
    if (cart){
      h += '<h4>' + n + ' · Work–energy theorem (cart only: gravity is outside the system, so it does work)</h4>' +
        '<div class="eq">W<sub>g</sub> = mg(h<sub>A</sub> − h<sub>B</sub>) = (' + H.iv('m') + ')(' + H.g() + ')(' + H.iv('h0') + ' − ' + H.n(d.hB, 'm') + ') = ' + H.n(d.Wg, 'J') + '</div>' +
        '<div class="eq">W<sub>g</sub>' + (mode === 'rough' && d.Eth > 0 ? ' + W<sub>f</sub>' : '') + (mode === 'spring' && d.Us > 0 ? ' + W<sub>s</sub>' : '') + ' = K<sub>B</sub> − K<sub>A</sub> → K<sub>B</sub> = <b>' + H.n(d.KB, 'J') + '</b></div>';
    } else {
      h += '<h4>' + n + ' · Energy conservation (cart + Earth' + (mode === 'rough' ? ', friction makes thermal energy' : '') + ')</h4>' +
        '<div class="eq">mgh<sub>A</sub> + ½mv<sub>A</sub>² = mgh<sub>B</sub> + ½mv<sub>B</sub>²' + (mode === 'rough' && d.Eth > 0 ? ' + ΔE<sub>th</sub>' : '') + (mode === 'spring' && d.Us > 0 ? ' + ½kx²' : '') + '</div>' +
        '<div class="eq">K<sub>B</sub> = ' + H.n(d.E0) + ' − ' + H.n(d.UgB) + (d.Eth > 0 ? ' − ' + H.n(d.Eth) : '') + (d.Us > 0 ? ' − ' + H.n(d.Us) : '') + ' = <b>' + H.n(d.KB, 'J') + '</b></div>';
    }
    if (!d.reach) h += '<div class="bad">' + (d.why === 'fall' ? 'The cart falls off the loop before it gets to B (N would have to be negative).' : 'K would be negative before B: the cart runs out of energy and turns around before it gets there.') + '</div>';
    else h += '<div class="eq">v<sub>B</sub> = √(2K<sub>B</sub>/m) = √(v<sub>A</sub>² + 2g(h<sub>A</sub> − h<sub>B</sub>)' + (mode === 'rough' && d.Eth > 0 ? ' − 2μ<sub>k</sub>gd' : '') + (mode === 'spring' && d.Us > 0 ? ' − kx²/m' : '') + ') = <b>' + H.n(d.vB, 'm/s') + '</b></div>' +
      (mode === 'spring' && d.Us > 0 ? '' : '<p class="note">m cancels when there’s no spring: every cart has the same speed at B.</p>');
    if (mode === 'loop') h += '<h4>' + (n + 1) + ' · Top of the loop (height 2R)</h4><div class="eq">v<sub>top</sub>² = v<sub>A</sub>² + 2g(h<sub>A</sub> − 2R) = ' + H.n(d.vtop2, 'm²/s²') + '</div>' +
      '<div class="eq">Stays on the track if N ≥ 0: mg + N = mv²/R needs v<sub>top</sub>² ≥ gR = ' + H.n(G10 * v.R, 'm²/s²') + '</div>' +
      '<div class="eq">From rest: g(h<sub>A</sub> − 2R)·2 ≥ gR → h<sub>A</sub> ≥ 2.5R = <b>' + H.n(d.hmin, 'm') + '</b>' + (v.v0 > 0 ? ' (less with a starting push)' : '') + '</div>' +
      (d.Ntop >= 0 ? '<div class="ok">N at the top = ' + H.n(d.Ntop, 'N') + ' → makes the loop.</div>' : '<div class="bad">N at the top would be ' + H.n(d.Ntop, 'N') + ' → falls off.</div>');
    if (mode === 'rough') h += '<h4>' + (n + 1) + ' · How high it climbs the far ramp</h4><div class="eq">mgh<sub>A</sub> + ½mv<sub>A</sub>² − μ<sub>k</sub>mgd = mgh<sub>f</sub> → h<sub>f</sub> = h<sub>A</sub> + v<sub>A</sub>²/2g − μ<sub>k</sub>d = <b>' + H.n(d.hf, 'm') + '</b></div>' +
      (d.hf < 0 ? '<div class="bad">Negative: it stops on the rough patch after ' + H.n(d.dstop, 'm') + ' of it.</div>' : '');
    if (mode === 'spring') h += '<h4>' + (n + 1) + ' · Biggest squeeze (all energy in the spring)</h4><div class="eq">E<sub>A</sub> = ½kx<sub>max</sub>² → x<sub>max</sub> = √(2E<sub>A</sub>/k) = √(2(' + H.n(d.E0) + ')/' + H.iv('k') + ') = <b>' + H.n(d.xmax, 'm') + '</b></div>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    const tr = d.tr, m = v.m, X = x => 12 + x * 13.8, Y = y => 222 - y * 15;
    panelTitle('TRACK', 10, 18);
    // ground + track
    ctx.fillStyle = '#efefef'; ctx.fillRect(0, Y(0) + 2, 430, 330);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.beginPath(); tr.p.forEach((q, i) => i ? ctx.lineTo(X(q.x), Y(q.y)) : ctx.moveTo(X(q.x), Y(q.y))); ctx.stroke();
    if (tr.rough){ ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 6; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(tr.rough.x1), Y(0)); ctx.lineTo(X(Math.min(tr.rough.x2, 23)), Y(0)); ctx.stroke(); ctx.setLineDash([]); text('rough', X(tr.rough.x1), Y(0) + 16, { font: '700 11px "Space Grotesk",sans-serif', col: '#c43a00' }); }
    // height scale
    ctx.strokeStyle = '#d0d0d0'; ctx.lineWidth = 1; for (let hh = 2; hh <= 12; hh += 2){ ctx.beginPath(); ctx.moveTo(0, Y(hh)); ctx.lineTo(8, Y(hh)); ctx.stroke(); text(hh + ' m', 10, Y(hh) + 3, { font: '500 9px "IBM Plex Mono",monospace', col: '#9a9a9a' }); }
    // live motion
    if (A.s === undefined || A.reset){ A.s = 0; A.dir = 1; A.loss = 0; A.fall = null; A.done = 0; A.age = 0; }
    A.age += dt;
    const Kat = (sq, loss) => d.E0 - loss - m * G10 * trackAt(tr, sq).y - 0.5 * (v.k || 0) * compAt(tr, sq) ** 2;
    if (!A.fall && !A.done){
      const n = 25;
      for (let i = 0; i < n; i++){
        let K = Kat(A.s, A.loss); if (K <= 0){ A.dir = -A.dir; K = 1e-6; }
        const sp = Math.sqrt(2 * K / m), ds = A.dir * Math.max(sp, 0.15) * dt / n;
        const s2 = A.s + ds;
        if (tr.rough){ const a1 = Math.max(Math.min(A.s, s2), tr.rough.s1), a2 = Math.min(Math.max(A.s, s2), tr.rough.s2); if (a2 > a1) A.loss += v.mu * m * G10 * (a2 - a1); }
        if (Kat(s2, A.loss) < 0){ A.dir = -A.dir; continue; }
        A.s = Math.max(0, s2);
        const q = trackAt(tr, A.s);
        if (q.ph !== null && tr.loop){ const v2 = 2 * Math.max(0, Kat(A.s, A.loss)) / m, N = m * v2 / v.R - m * G10 * Math.sin(q.ph); if (N < 0){ const sp2 = Math.sqrt(v2); A.fall = { x: q.x, y: q.y, vx: sp2 * Math.cos(q.ang) * A.dir, vy: sp2 * Math.sin(q.ang) * A.dir, t: 0 }; break; } }
        if (A.s >= tr.total - 1e-6){ A.done = 0.001; break; }
      }
      if (tr.rough && Kat(A.s, A.loss) < 0.5 && A.s > tr.rough.s1 && A.s < tr.rough.s2) A.done = 0.001;
    }
    if (A.done){ A.done += dt; if (A.done > 1.2){ A.s = 0; A.dir = 1; A.loss = 0; A.done = 0; A.age = 0; } }
    if (A.age > 16){ A.s = 0; A.dir = 1; A.loss = 0; A.age = 0; }
    let cxp, cyp, ang;
    if (A.fall){ const f = A.fall; f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy -= G10 * dt; cxp = X(f.x); cyp = Y(f.y); ang = 0; if (f.t > 1.4 || f.y < -1){ A.fall = null; A.s = 0; A.dir = 1; A.loss = 0; A.age = 0; } text('FELL OFF THE LOOP', 12, 318, { font: '700 14px "Space Grotesk",sans-serif', col: '#c43a00' }); }
    else { const q = trackAt(tr, A.s); ang = q.ang; cxp = X(q.x); cyp = Y(q.y); }
    // spring
    if (tr.spring){ const comp = compAt(tr, A.fall ? 0 : A.s), x0 = tr.spring.x0 + comp; ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2; ctx.beginPath(); const L = 30 - x0, nz = 10; for (let i = 0; i <= nz * 2; i++){ const xx = X(x0 + L * i / (nz * 2)), yy = Y(0) - 10 + (i % 2 ? -7 : 7) * (i > 0 && i < nz * 2 ? 1 : 0); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); ctx.fillStyle = '#111'; ctx.fillRect(X(30), Y(0) - 26, 5, 26); ctx.fillRect(X(x0) - 2, Y(0) - 20, 4, 20); }
    // A and B markers
    const B = trackAt(tr, d.sB);
    text('A', X(0) + 18, Y(v.h0) - 6, { font: '700 13px "Space Grotesk",sans-serif' });
    ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(B.x), Y(B.y), 5, 0, 7); ctx.fill(); ctx.stroke();
    text('B', X(B.x) + 7, Y(B.y) - 7, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' });
    // cart (drawn on the "inside" of the track direction)
    ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(-ang); ctx.fillStyle = '#1546d6'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(-9, -12, 18, 10); ctx.strokeRect(-9, -12, 18, 10); ctx.fillStyle = '#111'; [-5, 5].forEach(x => { ctx.beginPath(); ctx.arc(x, -2, 2.5, 0, 7); ctx.fill(); }); ctx.restore();
    // energy bars for the live cart
    const sNow = A.fall ? null : A.s, qn = sNow === null ? null : trackAt(tr, sNow);
    const K = sNow === null ? 0 : Math.max(0, Kat(sNow, A.loss)), Ug = qn ? m * G10 * qn.y : 0, Us = sNow === null ? 0 : 0.5 * (v.k || 0) * compAt(tr, sNow) ** 2, Eth = A.loss;
    const cart = opt.sys === 'cart';
    panelTitle(cart ? 'WORK DONE ON CART SO FAR' : 'ENERGY RIGHT NOW', 438, 18);
    const bars = cart
      ? [['K', K, '#1546d6'], ['W_g', qn ? m * G10 * (v.h0 - qn.y) : 0, '#111'], ['W_f', -Eth, '#c43a00'], ['W_s', -Us, '#7a3fb0']]
      : [['K', K, '#1546d6'], ['U_g', Ug, '#111'], ['U_s', Us, '#7a3fb0'], ['E_th', Eth, '#c43a00'], ['Total', K + Ug + Us + Eth, '#9a9a9a']];
    const base = cart ? 190 : 270, top = 40, Emax = Math.max(d.E0, 1) * 1.05, hgt = cart ? 150 : 230, bw = cart ? 30 : 24, gap = cart ? 8 : 5;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(440, base); ctx.lineTo(595, base); ctx.stroke();
    bars.forEach(([lab, val, col], i) => { const x0 = 446 + i * (bw + gap), hh = hgt * val / Emax; ctx.fillStyle = col; ctx.fillRect(x0, hh >= 0 ? base - hh : base, bw, Math.abs(hh)); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.strokeRect(x0, hh >= 0 ? base - hh : base, bw, Math.abs(hh));
      text(lab, x0 + bw / 2, cart ? base + Math.max(0, -hh) + 13 : base + 13, { align: 'center', font: '700 10px "IBM Plex Mono",monospace' }); });
    if (cart) text('W_g + W_f + W_s = ΔK', 445, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    else text('Total stays the same', 445, 300, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    if (!cart) text('(friction → E_th)', 445, 314, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
  }
};
