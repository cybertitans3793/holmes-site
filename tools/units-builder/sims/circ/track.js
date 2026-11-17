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
    if (window.ABP){ const W = d.Eth > 0 ? -d.Eth : 0, dR = roughBefore(d.tr, d.sB);
      let h = '<h4>1 · Start (point A)</h4>' +
        TEX`KE_i = \frac{1}{2} m v^2` + TEX`KE_i = \frac{1}{2}(${M.iv('m')})(${M.iv('v0')})^2` + TEX`KE_i = ${M.n(d.KA, 'J')}` +
        TEX`PE_i = mgh` + TEX`PE_i = (${M.iv('m')})(10)(${M.iv('h0')})` + TEX`PE_i = ${M.n(d.UgA, 'J')}` +
        TEX`\text{TME} = KE_i + PE_i` + TEXA`\text{TME} = ${M.n(d.E0, 'J')}` +
        '<h4>2 · Point B</h4>' + TEX`h = ${M.n(d.hB, 'm')}` + TEX`PE_f = mgh` + TEXA`PE_f = ${M.n(d.UgB, 'J')}`;
      let n = 3;
      if (mode === 'rough') h += '<h4>' + (n++) + ' · Work done by friction</h4>' + (dR > 0 ?
        '<p class="st">Friction force:</p>' + TEX`F_f = \mu F_N = \mu m g` + TEX`F_f = (${M.iv('mu')})(${M.iv('m')})(10)` + TEX`F_f = ${M.n(v.mu * v.m * 10, 'N')}` +
        '<p class="st">Rough ground crossed before B:</p>' + TEX`d = ${M.n(dR, 'm')}` +
        TEX`W = -F_f \times d` + TEX`W = -(${M.n(v.mu * v.m * 10, 'N')})(${M.n(dR, 'm')})` + TEXA`W = ${M.n(W, 'J')}` + '<p class="st">Negative: friction takes energy out.</p>'
        : '<p class="st">The cart hasn’t reached the rough patch yet: W = 0 J so far.</p>');
      h += '<h4>' + (n++) + ' · KE<sub>i</sub> + PE<sub>i</sub> + W = KE<sub>f</sub> + PE<sub>f</sub></h4>' + TEX`KE_i + PE_i + W = KE_f + PE_f` +
        TEX`${M.n(d.KA)} + ${M.n(d.UgA)} + ${mode === 'rough' ? M.p(W) : '<mn>0</mn>'} = KE_f + ${M.n(d.UgB)}` + TEXA`KE_f = ${M.n(d.KB, 'J')}`;
      if (!d.reach) h += '<div class="bad">' + (d.why === 'fall' ? 'The cart falls off the loop before it gets to B.' : 'KE would be negative: the cart runs out of energy and turns back before B.') + '</div>';
      else h += '<h4>' + (n++) + ' · Speed at B</h4>' + TEX`KE = \frac{1}{2} m v^2` + TEX`v = \sqrt{\frac{2\,KE}{m}}` + TEX`v = \sqrt{\frac{2 \times ${M.n(d.KB)}}{${M.iv('m')}}}` + TEXA`v = ${M.n(d.vB, 'm/s')}`;
      if (mode === 'rough') h += '<h4>' + (n++) + ' · TME</h4>' + TEX`\text{TME at B} = \text{TME}_A - |W|` + TEX`\text{TME at B} = ${M.n(d.E0)} - ${M.n(-W)}` + TEXA`\text{TME at B} = ${M.n(d.E0 + W, 'J')}` +
        '<p class="st">Friction lowers the total mechanical energy; the lost energy heats the cart and ground.</p>' +
        '<p class="st">Height it climbs on the far ramp:</p>' + (d.hf > 0 ? TEXA`h = ${M.n(d.hf, 'm')}` + '<p class="st">That is lower than the start.</p>' : '<p class="st">None — it stops on the rough patch.</p>');
      if (mode === 'loop') h += '<h4>' + (n++) + ' · Making the loop</h4><p class="st">It has to be going fast enough at the top. Starting from rest, the start must be at least <b>2.5 × the loop radius</b> high.</p>' +
        TEX`h \geq 2.5\,R` + TEXA`h \geq ${M.n(2.5 * v.R, 'm')}`;
      return h + (mode === 'rough' ? '' : '<p class="note">No friction: W = 0, so TME stays the same everywhere. PE turns into KE and back. The mass cancels: every cart has the same speed at B.</p>');
    }
    const cart = opt.sys === 'cart', rf = d.Eth > 0, sp = d.Us > 0, dRb = roughBefore(d.tr, d.sB);
    let h = '<h4>1 · Start (point A)</h4>' + (cart
        ? TEX`K_A = \frac{1}{2} m v_A^2` + TEX`K_A = \frac{1}{2}(${M.iv('m')})(${M.iv('v0')})^2` + TEXA`K_A = ${M.n(d.KA, 'J')}`
        : TEX`E_A = m g h_A + \frac{1}{2} m v_A^2` + TEX`m g h_A = (${M.iv('m')})(10\,\text{m/s}^2)(${M.iv('h0')})` + TEX`\frac{1}{2} m v_A^2 = \frac{1}{2}(${M.iv('m')})(${M.iv('v0')})^2` + TEXA`E_A = ${M.n(d.E0, 'J')}`) +
      '<h4>2 · Point B</h4><p class="st">Height read off the track:</p>' + TEXA`h_B = ${M.n(d.hB, 'm')}`;
    const extras = [];
    if (mode === 'rough' && rf) extras.push('<p class="st">Rough patch crossed before B:</p>' + TEX`d = ${M.n(dRb, 'm')}` + (cart
      ? TEX`W_f = -\mu_k m g d` + TEX`W_f = -(${M.iv('mu')})(${M.iv('m')})(10\,\text{m/s}^2)(${M.n(dRb, 'm')})` + TEXA`W_f = ${M.n(-d.Eth, 'J')}`
      : TEX`\Delta E_{\text{th}} = \mu_k m g d` + TEX`\Delta E_{\text{th}} = (${M.iv('mu')})(${M.iv('m')})(10\,\text{m/s}^2)(${M.n(dRb, 'm')})` + TEXA`\Delta E_{\text{th}} = ${M.n(d.Eth, 'J')}`));
    if (mode === 'spring' && sp) extras.push('<p class="st">Spring squeezed at B:</p>' + TEX`x = ${M.n(d.xc, 'm')}` + (cart
      ? TEX`W_s = -\frac{1}{2} k x^2` + TEX`W_s = -\frac{1}{2}(${M.iv('k')})(${M.n(d.xc)})^2` + TEXA`W_s = ${M.n(-d.Us, 'J')}`
      : TEX`U_s = \frac{1}{2} k x^2` + TEX`U_s = \frac{1}{2}(${M.iv('k')})(${M.n(d.xc)})^2` + TEXA`U_s = ${M.n(d.Us, 'J')}`));
    extras.forEach((e, i) => { h += '<h4>' + (3 + i) + ' · ' + (mode === 'rough' ? 'Friction on the rough patch' : 'Spring') + '</h4>' + e; });
    const n = 3 + extras.length;
    if (cart){
      h += '<h4>' + n + ' · Work–energy theorem (cart only: gravity is outside the system, so it does work)</h4>' +
        TEX`W_g = mg(h_A - h_B)` + TEX`W_g = (${M.iv('m')})(10\,\text{m/s}^2)(${M.iv('h0')} - ${M.n(d.hB, 'm')})` + TEX`W_g = ${M.n(d.Wg, 'J')}` +
        (rf ? TEX`W_g + W_f = K_B - K_A` + TEX`${M.n(d.Wg)} + ${M.p(-d.Eth)} = K_B - ${M.n(d.KA)}`
         : sp ? TEX`W_g + W_s = K_B - K_A` + TEX`${M.n(d.Wg)} + ${M.p(-d.Us)} = K_B - ${M.n(d.KA)}`
         : TEX`W_g = K_B - K_A` + TEX`${M.n(d.Wg)} = K_B - ${M.n(d.KA)}`) + TEXA`K_B = ${M.n(d.KB, 'J')}`;
    } else {
      h += '<h4>' + n + ' · Energy conservation (cart + Earth' + (mode === 'rough' ? ', friction makes thermal energy' : '') + ')</h4>' +
        (rf ? TEX`m g h_A + \frac{1}{2} m v_A^2 = m g h_B + \frac{1}{2} m v_B^2 + \Delta E_{\text{th}}` + TEX`K_B = E_A - U_{gB} - \Delta E_{\text{th}}` + TEX`K_B = ${M.n(d.E0)} - ${M.n(d.UgB)} - ${M.n(d.Eth)}`
         : sp ? TEX`m g h_A + \frac{1}{2} m v_A^2 = m g h_B + \frac{1}{2} m v_B^2 + \frac{1}{2} k x^2` + TEX`K_B = E_A - U_{gB} - U_s` + TEX`K_B = ${M.n(d.E0)} - ${M.n(d.UgB)} - ${M.n(d.Us)}`
         : TEX`m g h_A + \frac{1}{2} m v_A^2 = m g h_B + \frac{1}{2} m v_B^2` + TEX`K_B = E_A - U_{gB}` + TEX`K_B = ${M.n(d.E0)} - ${M.n(d.UgB)}`) + TEXA`K_B = ${M.n(d.KB, 'J')}`;
    }
    if (!d.reach) h += '<div class="bad">' + (d.why === 'fall' ? 'The cart falls off the loop before it gets to B (N would have to be negative).' : 'K would be negative before B: the cart runs out of energy and turns around before it gets there.') + '</div>';
    else h += (rf ? TEX`v_B = \sqrt{v_A^2 + 2g(h_A - h_B) - 2\mu_k g d}` : sp ? TEX`v_B = \sqrt{v_A^2 + 2g(h_A - h_B) - \frac{k x^2}{m}}` : TEX`v_B = \sqrt{v_A^2 + 2g(h_A - h_B)}`) +
      TEX`v_B = \sqrt{\frac{2 K_B}{m}}` + TEX`v_B = \sqrt{\frac{2(${M.n(d.KB)})}{${M.iv('m')}}}` + TEXA`v_B = ${M.n(d.vB, 'm/s')}` +
      (sp ? '' : '<p class="note">m cancels when there’s no spring: every cart has the same speed at B.</p>');
    if (mode === 'loop') h += '<h4>' + (n + 1) + ' · Top of the loop (height 2R)</h4>' +
      TEX`v_{\text{top}}^2 = v_A^2 + 2g(h_A - 2R)` + TEX`v_{\text{top}}^2 = ${M.n(d.vtop2, 'm²/s²')}` +
      '<p class="st">Stays on the track if N ≥ 0:</p>' + TEX`mg + N = \frac{m v^2}{R}` + TEX`v_{\text{top}}^2 \geq gR` + TEX`gR = ${M.n(G10 * v.R, 'm²/s²')}` +
      '<p class="st">From rest:</p>' + TEX`2g(h_A - 2R) \geq gR` + TEX`h_A \geq 2.5\,R` + TEXA`h_{\text{min}} = ${M.n(d.hmin, 'm')}` + (v.v0 > 0 ? '<p class="st">That is less with a starting push.</p>' : '') +
      (d.Ntop >= 0 ? '<div class="ok">N at the top = ' + H.n(d.Ntop, 'N') + ' → makes the loop.</div>' : '<div class="bad">N at the top would be ' + H.n(d.Ntop, 'N') + ' → falls off.</div>');
    if (mode === 'rough') h += '<h4>' + (n + 1) + ' · How high it climbs the far ramp</h4>' +
      TEX`m g h_A + \frac{1}{2} m v_A^2 - \mu_k m g d = m g h_f` + TEX`h_f = h_A + \frac{v_A^2}{2g} - \mu_k d` + TEXA`h_f = ${M.n(d.hf, 'm')}` +
      (d.hf < 0 ? '<div class="bad">Negative: it stops on the rough patch after ' + H.n(d.dstop, 'm') + ' of it.</div>' : '');
    if (mode === 'spring') h += '<h4>' + (n + 1) + ' · Biggest squeeze (all energy in the spring)</h4>' +
      TEX`E_A = \frac{1}{2} k x_{\text{max}}^2` + TEX`x_{\text{max}} = \sqrt{\frac{2 E_A}{k}}` + TEX`x_{\text{max}} = \sqrt{\frac{2(${M.n(d.E0)})}{${M.iv('k')}}}` + TEXA`x_{\text{max}} = ${M.n(d.xmax, 'm')}`;
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
      : window.ABP ? [['KE', K, '#1546d6'], ['PE', Ug, '#111'], ['TME', K + Ug, '#9a9a9a'], ['heat', Eth, '#c43a00']]
      : [['K', K, '#1546d6'], ['U_g', Ug, '#111'], ['U_s', Us, '#7a3fb0'], ['E_th', Eth, '#c43a00'], ['Total', K + Ug + Us + Eth, '#9a9a9a']];
    const base = cart ? 190 : 270, top = 40, Emax = Math.max(d.E0, 1) * 1.05, hgt = cart ? 150 : 230, bw = cart ? 30 : 24, gap = cart ? 8 : 5;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(440, base); ctx.lineTo(595, base); ctx.stroke();
    bars.forEach(([lab, val, col], i) => { const x0 = 446 + i * (bw + gap), hh = hgt * val / Emax; ctx.fillStyle = col; ctx.fillRect(x0, hh >= 0 ? base - hh : base, bw, Math.abs(hh)); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.strokeRect(x0, hh >= 0 ? base - hh : base, bw, Math.abs(hh));
      text(lab, x0 + bw / 2, cart ? base + Math.max(0, -hh) + 13 : base + 13, { align: 'center', font: '700 10px "IBM Plex Mono",monospace' }); });
    if (cart) text('W_g + W_f + W_s = ΔK', 445, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    else if (window.ABP) text(mode === 'rough' ? 'TME drops on rough ground' : 'TME stays the same', 445, 300, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    else text('Total stays the same', 445, 300, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    if (!cart && window.ABP && mode === 'rough') text('(friction → heat)', 445, 314, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    else if (!cart && !window.ABP) text('(friction → E_th)', 445, 314, { font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
  }
};

// ---------------- Ramp lab: Energy and Friction on a Ramp (P1-06) ----------------
// A block is released from rest on a 1 m ramp board taped to a 1 m level board and slides until it stops.
// Students measure h, L and d (to the back edge of the block), compute x_ramp = sqrt(L^2 - h^2) and D = x_ramp + d,
// and graph h vs D. Energy: mgh = μk·mg·cosθ·L + μk·mg·d = μk·mg·D, so h = μk·D (slope = μk).
// No best-fit line or regression is shown (the students make their own); the hidden μk can be revealed to check.
const RL = { trials: [], key: '', reveal: false,
  mu0: Math.round((0.20 + Math.random() * 0.20) * 1000) / 1000 };   // hidden μk, new on every page load
const RBOARD = 1.0, RBLOCK = 0.08;                                    // board length, block length (m)
function rlGauss(){ let u = 0, w = 0; while (!u) u = Math.random(); while (!w) w = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * PI * w); }
function rlMu(v, opt){ return opt.surf === 'set' ? v.mu : RL.mu0; }
// one release: returns the measured values (with a little realistic scatter, plus the chosen error)
function rlRun(v, opt){
  const th = v.th * DEG, mu = rlMu(v, opt) * (opt.err === 'uneven' ? 1 + 0.10 * rlGauss() : 1);
  const v0sq = opt.err === 'push' ? 2 * G10 * 0.03 : 0;               // a small push = 3 cm of extra drop
  const a1 = Math.max(0.05, G10 * (Math.sin(th) - mu * Math.cos(th)));
  let v1sq = v0sq + 2 * a1 * v.L; if (opt.err === 'bump') v1sq *= 0.85;   // bump at the joint loses 15% of the KE
  const d = Math.max(0, v1sq / (2 * mu * G10) + 0.004 * rlGauss());    // ±4 mm measuring scatter
  const h = v.L * Math.sin(th);
  return { h, L: v.L, d, xr: Math.sqrt(v.L * v.L - h * h), D: Math.sqrt(v.L * v.L - h * h) + d, a1, v1: Math.sqrt(v1sq), mu, v0: Math.sqrt(v0sq), off: d > RBOARD - RBLOCK };
}
function rlKey(v, opt){ return opt.surf + ':' + (opt.surf === 'set' ? v.mu : RL.mu0); }
const f3 = x => x.toFixed(3);
const RAMP = {
  ivs(mode, opt){
    const l = [
      { id: 'L', sym: 'L', symText: 'L', label: 'Release point (distance along ramp)', unit: 'm', min: 0.20, max: 0.90, step: 0.01, val: 0.50, graph: true },
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Ramp angle', unit: '°', min: 25, max: 35, step: 1, val: 30 },
      { id: 'm', sym: 'm', symText: 'm', label: 'Block mass', unit: 'kg', min: 0.2, max: 0.5, step: 0.05, val: 0.3 }];
    if (opt.surf === 'set') l.push({ id: 'mu', sym: 'μ<sub>k</sub>', symText: 'μk', label: 'Friction (both boards)', unit: '', min: 0.10, max: 0.40, step: 0.01, val: 0.30, show: x => x.toFixed(2) });
    return l;
  },
  calc(v){ const h = v.L * Math.sin(v.th * DEG); return { h, xr: Math.sqrt(v.L * v.L - h * h) }; },
  dvs(){ return [{ id: 'h', name: 'Release height', short: 'h', sym: 'h', unit: 'm', f: d => d.h }]; },
  work(v, d, mode, opt){
    const T = RL.trials, last = RL.last;
    let h = '<h4>1 · Data table</h4>';
    if (!T.length) h += '<p class="st">No trials yet. Press <b>Release</b>, then <b>Record</b>. Do 6 different release points.</p>';
    else h += '<table style="border-collapse:collapse;font:500 12px \'IBM Plex Mono\',monospace;margin:4px 0 6px;width:100%"><tr style="border-bottom:2px solid #111;text-align:right">' +
      ['#', 'h (m)', 'L (m)', 'x<sub>ramp</sub> (m)', 'd (m)', 'D (m)'].map(c => '<th style="padding:2px 4px">' + c + '</th>').join('') + '</tr>' +
      T.map((r, i) => '<tr style="text-align:right;border-bottom:1px solid #ddd"><td style="padding:2px 4px">' + (i + 1) + '</td><td>' + f3(r.h) + '</td><td>' + f3(r.L) + '</td><td>' + f3(r.xr) + '</td><td>' + f3(r.d) + '</td><td><b>' + f3(r.D) + '</b></td></tr>').join('') + '</table>' +
      (T.length < 6 ? '<p class="st">' + (6 - T.length) + ' more trial' + (T.length === 5 ? '' : 's') + ' to go.</p>' : '<p class="st">All 6 trials done. Graph h (up) vs D (across) by hand, draw your best-fit line, and find its slope.</p>');
    if (last && !last.off){
      h += '<h4>2 · This trial’s numbers</h4><p class="st">Measured: h, L and d. Calculated:</p>' +
        TEX`x_{\text{ramp}} = \sqrt{L^2 - h^2}` + TEX`x_{\text{ramp}} = \sqrt{(${M.n(+f3(last.L), 'm')})^2 - (${M.n(+f3(last.h), 'm')})^2}` + TEX`x_{\text{ramp}} = ${M.n(+f3(last.xr), 'm')}` +
        TEX`D = x_{\text{ramp}} + d` + TEX`D = ${M.n(+f3(last.xr), 'm')} + ${M.n(+f3(last.d), 'm')}` + TEXA`D = ${M.n(+f3(last.D), 'm')}`;
    }
    h += '<h4>' + (last && !last.off ? 3 : 2) + ' · Why h vs D is a straight line</h4>' +
      '<p class="st">The block starts and ends at rest, so all of its starting PE is used up by friction:</p>' +
      TEX`mgh = W_{\text{ramp}} + W_{\text{level}}` +
      '<p class="st">On the ramp the normal force is mg cos θ:</p>' +
      TEX`W_{\text{ramp}} = \mu_k\,mg\cos\theta \cdot L` + TEX`L\cos\theta = x_{\text{ramp}}` + TEX`W_{\text{ramp}} = \mu_k\,mg\,x_{\text{ramp}}` +
      '<p class="st">On the level board the normal force is mg:</p>' + TEX`W_{\text{level}} = \mu_k\,mg\,d` +
      TEX`mgh = \mu_k\,mg\,(x_{\text{ramp}} + d)` + TEXA`h = \mu_k\,D` +
      '<p class="st">A direct (linear) relationship through the origin. Mass and ramp angle cancel, so the slope of h vs D is μ<sub>k</sub>.</p>';
    if (opt.err === 'bump') h += '<div class="bad">Bump at the joint: the block loses extra energy there, so D comes out too short and the slope (μ<sub>k</sub>) too high.</div>';
    if (opt.err === 'push') h += '<div class="bad">Pushing at release: extra KE at the start, so D comes out too long and the slope (μ<sub>k</sub>) too low.</div>';
    if (opt.err === 'uneven') h += '<div class="bad">Uneven boards (dust, worn spots): μ<sub>k</sub> changes a little from run to run, so d scatters. A random error.</div>';
    return h;
  },
  graph(g, W, Hh){
    const T = RL.trials, l = 34, r = W - 10, tp = 10, b = Hh - 26;
    const Dm = Math.max(1, ...T.map(q => q.D)) * 1.1, hm = Math.max(0.3, ...T.map(q => q.h)) * 1.15;
    const X = D => l + (r - l) * D / Dm, Y = h => b - (b - tp) * h / hm;
    g.strokeStyle = '#e4e4e4'; g.lineWidth = 1;
    const sx = Dm > 1.5 ? 0.5 : 0.2, sy = hm > 0.45 ? 0.1 : 0.05;
    g.font = '500 9px "IBM Plex Mono",monospace'; g.fillStyle = '#6a6a6a';
    for (let x = 0; x <= Dm + 1e-9; x += sx){ g.beginPath(); g.moveTo(X(x), tp); g.lineTo(X(x), b); g.stroke(); g.textAlign = 'center'; g.fillText(x.toFixed(1), X(x), b + 11); }
    for (let y = 0; y <= hm + 1e-9; y += sy){ g.beginPath(); g.moveTo(l, Y(y)); g.lineTo(r, Y(y)); g.stroke(); g.textAlign = 'right'; g.fillText(y.toFixed(2), l - 3, Y(y) + 3); }
    g.strokeStyle = '#111'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(l, tp); g.lineTo(l, b); g.lineTo(r, b); g.stroke();
    g.fillStyle = '#111'; g.textAlign = 'center'; g.font = '600 10px "Space Grotesk",sans-serif'; g.fillText('D, total horizontal distance (m)', (l + r) / 2, Hh - 3);
    g.save(); g.translate(9, (tp + b) / 2); g.rotate(-PI / 2); g.fillText('h (m)', 0, 0); g.restore();
    T.forEach(q => { g.fillStyle = '#ff6a2b'; g.strokeStyle = '#111'; g.lineWidth = 1; g.beginPath(); g.arc(X(q.D), Y(q.h), 3.5, 0, 7); g.fill(); g.stroke(); });
    if (!T.length){ g.fillStyle = '#9a9a9a'; g.textAlign = 'center'; g.font = '500 10px "Space Grotesk",sans-serif'; g.fillText('Recorded trials appear here', (l + r) / 2, (tp + b) / 2); }
    return 'Your data: h vs D';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (rlKey(v, opt) !== RL.key){ RL.key = rlKey(v, opt); RL.trials = []; RL.last = null; RL.reveal = false; setTimeout(update, 0); }
    const th = v.th * DEG, S = 158, base = 250, J = 100 + S * Math.cos(th) * RBOARD, F = '"Space Grotesk",sans-serif', Mo = '"IBM Plex Mono",monospace';
    const onRamp = u => [J - u * Math.cos(th) * S, base - u * Math.sin(th) * S], onFlat = x => [J + x * S, base];
    panelTitle('RAMP LAB · ENERGY AND FRICTION', 10, 18);
    // boards
    ctx.fillStyle = '#c8a46a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5;
    const [tx, ty] = onRamp(RBOARD);
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(J, base); ctx.lineTo(J, base + 7); ctx.lineTo(tx, ty + 7 / Math.cos(th)); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillRect(J, base, S * RBOARD, 7); ctx.strokeRect(J, base, S * RBOARD, 7);
    ctx.fillStyle = '#8a8a8a'; ctx.fillRect(tx - 6, ty + 6, 6, base + 7 - ty - 6);    // prop under the ramp
    ctx.fillStyle = '#bdbdbd'; ctx.fillRect(J - 7, base - 1, 14, 3);                    // tape over the joint
    if (opt.err === 'bump'){ ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.moveTo(J - 6, base); ctx.quadraticCurveTo(J, base - 7, J + 6, base); ctx.fill(); }
    ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, base + 7.5); ctx.lineTo(400, base + 7.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(J, base, 26, PI, PI + th); ctx.stroke(); text('θ = ' + v.th + '°', J - 70, base - 6, { font: '600 11px ' + F });
    // motion
    if (A.reset || !A.st) { const was = A.st; A.st = 'ready'; A.t = 0; A.run = null; A.recorded = false; if (was && was !== 'ready') setTimeout(update, 0); }
    if (A.st === 'go'){
      A.t += dt; const r = A.run, t1 = r.v0 ? (-r.v0 + Math.sqrt(r.v0 * r.v0 + 2 * r.a1 * r.L)) / r.a1 : Math.sqrt(2 * r.L / r.a1);
      if (A.t < t1){ A.u = r.L - (r.v0 * A.t + 0.5 * r.a1 * A.t * A.t); A.x = null; }
      else { const tt = A.t - t1, dec = r.mu * G10, tstop = r.v1 / dec; A.u = null; A.x = tt >= tstop ? r.d : r.v1 * tt - 0.5 * dec * tt * tt;
        if (r.off && A.x > RBOARD - RBLOCK){ A.x = RBOARD - RBLOCK; A.st = 'off'; RL.last = r; setTimeout(update, 0); }
        else if (tt >= tstop){ A.st = 'done'; RL.last = r; setTimeout(update, 0); } }
    } else if (A.st === 'ready'){ A.u = v.L; A.x = null; }
    // block: back edge at the measured point
    ctx.save();
    if (A.x === null || A.x === undefined){ const [bx, by] = onRamp(A.u); ctx.translate(bx, by); ctx.rotate(th); }
    else { const [bx, by] = onFlat(A.x); ctx.translate(bx, by); }
    ctx.fillStyle = '#1546d6'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(0, -10, RBLOCK * S, 10); ctx.strokeRect(0, -10, RBLOCK * S, 10);
    ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(0, -10, 2.5, 0, 7); ctx.fill(); ctx.restore();
    // measurements (shown once the block is released from a set point)
    const meas = A.st === 'done' || A.st === 'off' ? RL.last : null, hNow = v.L * Math.sin(th);
    const [rx, ry] = onRamp(v.L);
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(rx, ry - 10); ctx.lineTo(rx, base); ctx.stroke(); ctx.setLineDash([]);
    text('h = ' + f3(hNow) + ' m', rx - 6, (ry + base) / 2, { align: 'right', font: '700 11px ' + Mo, col: '#7a3fb0' });
    const nx = -Math.sin(th), ny = -Math.cos(th);   // offset the L line above the ramp
    const o = 22; ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(rx + nx * o, ry + ny * o); ctx.lineTo(J + nx * o, base + ny * o); ctx.stroke();
    text('L = ' + f3(v.L) + ' m', (rx + J) / 2 + nx * (o + 14) - 18, (ry + base) / 2 + ny * (o + 14), { align: 'center', font: '700 11px ' + Mo, col: '#1e7d45' });
    if (meas){
      const [ex] = onFlat(Math.min(meas.d, RBOARD - RBLOCK));
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(J, base + 18); ctx.lineTo(ex, base + 18); ctx.moveTo(J, base + 13); ctx.lineTo(J, base + 23); ctx.moveTo(ex, base + 13); ctx.lineTo(ex, base + 23); ctx.stroke();
      if (!meas.off) text('d = ' + f3(meas.d) + ' m', (J + ex) / 2, base + 34, { align: 'center', font: '700 11px ' + Mo, col: '#c43a00' });
    }
    if (A.st === 'off') text('Too high: it slides off the end of the board. Release lower.', 12, 318, { font: '700 11px ' + F, col: '#c43a00' });
    else text('Measure h, L and d to the back edge of the block (orange dot).', 12, 318, { font: '500 10px ' + F, col: '#6a6a6a' });
    // right panel: status (the buttons are real HTML buttons above the sliders, see SIM.actions)
    panelTitle('LAB BENCH', 412, 18);
    const T = RL.trials;
    text('Trials recorded: ' + T.length + ' / 6', 412, 44, { font: '700 13px ' + F });
    const stTxt = { ready: 'Ready: press Release.', go: 'Sliding…', done: A.recorded ? '✓ Recorded.' : 'Stopped: press Record.', off: 'Slid off the end.' }[A.st];
    text(stTxt, 412, 64, { font: '600 12px ' + F, col: A.st === 'off' ? '#c43a00' : A.recorded || A.st === 'done' ? '#1e7d45' : '#1546d6' });
    if (A.recorded && T.length < 6){ text('Move the release point', 412, 80, { font: '500 11px ' + F, col: '#4a4a4a' }); text('and go again.', 412, 94, { font: '500 11px ' + F, col: '#4a4a4a' }); }
    if (T.length >= 6){ text('✓ 6 trials done.', 412, 80, { font: '700 12px ' + F, col: '#1e7d45' }); text('Now make your graph.', 412, 94, { font: '500 11px ' + F, col: '#4a4a4a' }); }
    text(opt.surf === 'set' ? 'μk = ' + v.mu.toFixed(2) + ' (you set it)' : 'Surface: mystery μk', 412, 130, { font: '700 12px ' + F });
    if (opt.surf !== 'set'){
      if (RL.reveal) text('Hidden μk = ' + RL.mu0.toFixed(2), 412, 152, { font: '700 14px ' + Mo, col: '#c43a00' });
      text(RL.reveal ? 'Compare it with your slope.' : T.length < 6 ? 'Reveal μk unlocks after 6 trials.' : 'Find μk from your graph first.', 412, RL.reveal ? 170 : 150, { font: '500 10px ' + F, col: '#6a6a6a' });
    }
  }
};
const RLACT = {
  release(){ const A = S.anim; if (A.st === 'go') return; A.run = rlRun(S.v, S.opt); A.t = 0; A.st = 'go'; A.recorded = false; RL.last = null; },
  record(){ const A = S.anim; if (A.st !== 'done' || A.recorded || RL.trials.length >= 6) return; RL.trials.push(A.run); A.recorded = true; },
  clear(){ RL.trials = []; RL.reveal = false; S.anim.recorded = false; },
  reset(){ S.anim.st = 'ready'; S.anim.recorded = false; RL.last = null; },
  reveal(){ if (RL.trials.length >= 6) RL.reveal = true; }
};
SIM.actions = (mode, opt) => {
  if (mode !== 'ramplab') return [];
  const A = S.anim, n = RL.trials.length, st = A.st || 'ready';
  const l = [
    { id: 'release', label: 'Release', hot: st === 'ready', disabled: st === 'go', onClick: RLACT.release },
    { id: 'record', label: 'Record', hot: st === 'done' && !A.recorded && n < 6, disabled: !(st === 'done' && !A.recorded && n < 6), onClick: RLACT.record },
    { id: 'reset', label: 'Reset block', disabled: st === 'ready', onClick: RLACT.reset },
    { id: 'clear', label: 'Clear table', disabled: !n, onClick: RLACT.clear }];
  if (opt.surf !== 'set') l.push({ id: 'reveal', label: RL.reveal ? 'μk = ' + RL.mu0.toFixed(2) : 'Reveal μk', disabled: n < 6 || RL.reveal, onClick: RLACT.reveal });
  return l;
};
SIM.actionStatus = mode => { if (mode !== 'ramplab') return ''; const A = S.anim, st = A.st || 'ready';
  return 'Trials: ' + RL.trials.length + ' / 6 · ' + ({ ready: 'ready', go: 'sliding', done: A.recorded ? 'recorded' : 'stopped, press Record', off: 'slid off the end: release lower' }[st]); };
// route the ramp-lab mode to RAMP; every other mode is unchanged
SIM.modes.push({ id: 'ramplab', label: 'Ramp lab: h vs D' });
SIM.opts[0].modes = ['valley', 'hump', 'loop', 'rough', 'spring'];
SIM.opts.push({ id: 'surf', label: 'Surface', modes: ['ramplab'], choices: [['mystery', 'Mystery μk'], ['set', 'Set μk']] },
              { id: 'err', label: 'Error', modes: ['ramplab'], choices: [['none', 'None'], ['bump', 'Bump at joint'], ['push', 'Push at release'], ['uneven', 'Uneven boards']] });
{ const IDX = { ivs: 0, calc: 1, dvs: 0, work: 2, draw: 2 };
  Object.keys(IDX).forEach(k => { const f = SIM[k]; SIM[k] = function(...a){ return a[IDX[k]] === 'ramplab' ? RAMP[k](...a) : f.apply(this, a); }; }); }
SIM.customGraph = (v, d, mode, opt, g, W, Hh) => mode === 'ramplab' ? RAMP.graph(g, W, Hh) : false;
