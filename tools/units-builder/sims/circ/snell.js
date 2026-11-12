// Refraction & Total Internal Reflection (AP 13.1, 13.3; IB C.3): Snell's law with rays and wavefronts, the critical angle, and light guided down an optical fiber.
// ---- Semicircular dish lab (mode 'dish'): ray aimed at the centre of the flat face, protractor ring, record sinθ pairs ----
const DISH_N = { acrylic: 1.49, water: 1.33, mystery: 1.62 };
const DISH_BTN = { rec: [397, 94, 84, 20], clr: [488, 94, 52, 20] };
function dishCalc(v, opt){
  const mat = opt.dmat || 'acrylic', curved = (opt.dside || 'curved') === 'curved', nd = DISH_N[mat], mys = mat === 'mystery', n1 = curved ? nd : 1, n2 = curved ? 1 : nd;
  const s2 = n1 * Math.sin(v.th1 * DEG) / n2, tir = s2 > 1, th2 = tir ? NaN : Math.asin(s2) / DEG, thc = Math.asin(1 / nd) / DEG;
  const thD = curved ? v.th1 : th2, thA = curved ? th2 : v.th1, rd = x => mys ? Math.round(x * 2) / 2 : x;
  const R = tir ? 1 : curved ? Math.min(1, 0.07 + 0.93 * Math.pow(v.th1 / thc, 10)) : 0.05 + 0.25 * Math.pow(v.th1 / 90, 6);
  return { mat, curved, mys, nd, n1, n2, s2, tir, th2, crit: curved ? thc : NaN, thc, thD, thA, rD: rd(thD), rA: rd(thA), R, T: tir ? 0 : Math.max(0.3, 1 - 0.85 * R) };
}
function dishRecord(){
  if (S.mode !== 'dish') return; const A = S.anim, d = S.d, v = S.v; A.rec = A.rec || []; const say = m => { A.msg = m; A.msgT = S.t; };
  if (d.tir) return say('no refracted ray to record');
  if (v.th1 < 1) return say('use an angle above 0°');
  if (A.rec.length && A.rec[A.rec.length - 1].th === v.th1) return say('already recorded');
  if (A.rec.length >= 12) return say('12 max: press Clear');
  A.rec.push({ th: v.th1, sd: Math.sin(d.rD * DEG), sa: Math.sin(d.rA * DEG) });
}
(function(){
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 600 / r.width, (e.clientY - r.top) * 330 / r.height]; }, hit = (b, x, y) => x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3];
  cv.addEventListener('pointerdown', e => { if (S.mode !== 'dish') return; const [x, y] = pos(e); if (hit(DISH_BTN.rec, x, y)) dishRecord(); else if (hit(DISH_BTN.clr, x, y)) S.anim.rec = []; });
  cv.addEventListener('pointermove', e => { if (S.mode !== 'dish'){ cv.style.cursor = ''; return; } const [x, y] = pos(e); cv.style.cursor = hit(DISH_BTN.rec, x, y) || hit(DISH_BTN.clr, x, y) ? 'pointer' : ''; });
  addEventListener('keydown', e => { if (S.mode === 'dish' && (e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !e.altKey) dishRecord(); });
})();
function dishWork(v, d, opt){
  const th1 = M.iv('th1');
  if (d.mys){
    const bad = d.tir || d.rD < 0.5, nest = bad ? NaN : Math.sin(d.rA * DEG) / Math.sin(d.rD * DEG);
    return '<h4>1 · Read the protractor</h4><p class="st">The dish’s n is hidden. Read both angles from the scale (to the nearest 0.5°). Air is n = 1.00.</p>' +
      (d.tir ? '<div class="bad">θ₁ is past the critical angle: no refracted ray, so no second angle to read. Back off until the refracted ray just skims along the flat face (θ₂ = 90°): that θ₁ is the critical angle.</div>'
        : bad ? '<p class="st">θ₁ is about 0°: the ray doesn’t bend, so the angles tell you nothing. Pick a bigger angle.</p>'
        : TEX`n_{\text{air}} \sin\theta_{\text{air}} = n_{\text{dish}} \sin\theta_{\text{dish}}` + TEX`n_{\text{dish}} = \frac{\sin\theta_{\text{air}}}{\sin\theta_{\text{dish}}}` + TEX`n_{\text{dish}} = \frac{\sin ${M.n(d.rA, '°')}}{\sin ${M.n(d.rD, '°')}}` + TEXA`n_{\text{dish}} \approx ${M.n(nest)}`) +
      '<h4>2 · Better: use the critical angle</h4><p class="st">On the curved-side setting, raise θ₁ until the refracted ray just disappears along the flat face. Then sin θ<sub>c</sub> = 1/n:</p>' + TEX`n_{\text{dish}} = \frac{1}{\sin\theta_c}` +
      '<h4>3 · Best: record many angles</h4><p class="st">Press <b>Record</b> at 6 or more angles. The graph of sin θ(air) against sin θ(dish) is a straight line through the origin, and its <b>slope is n</b>.</p>';
  }
  const n1 = M.n(d.n1), n2 = M.n(d.n2);
  let s = '<h4>1 · Snell’s law at the flat face</h4><p class="st">' + (d.curved ? 'The ray runs along a radius into the curved side, so it hits that surface at 0° and is <b>not bent</b>. All the bending happens at the flat face, going <b>out</b> into air.' : 'Air to ' + (d.mat === 'water' ? 'water' : 'acrylic') + ' at the flat face. Inside, the ray runs along a radius, so it leaves the curved side without bending.') + '</p>' +
    TEX`n_1 \sin\theta_1 = n_2 \sin\theta_2` + TEX`\sin\theta_2 = \frac{n_1 \sin\theta_1}{n_2}` + TEX`\sin\theta_2 = \frac{(${n1})(\sin ${th1})}{${n2}}` + TEXA`\sin\theta_2 = ${M.n(d.s2)}`;
  if (d.tir) s += '<div class="bad">sin θ₂ can’t be more than 1: no refracted ray. <b>Total internal reflection</b>: all the light reflects (θ₁ = ' + fnum(v.th1) + '° > θ<sub>c</sub> = ' + fnum(d.thc) + '°).</div>';
  else s += TEXA`\theta_2 = ${M.n(d.th2, '°')}` + '<p class="st">Bends ' + (d.curved ? '<b>away from</b> the normal (glass to air).' : '<b>toward</b> the normal (air to ' + (d.mat === 'water' ? 'water' : 'acrylic') + ').') + '</p>';
  s += '<h4>2 · Critical angle</h4>' + (d.curved ? TEX`\sin\theta_c = \frac{n_2}{n_1}` + TEX`\sin\theta_c = \frac{${n2}}{${n1}}` + TEXA`\theta_c = ${M.n(d.thc, '°')}` + '<p class="st">Past this angle the refracted ray is gone and the reflected ray carries all the light.</p>'
    : '<p class="st">Going from air into the dish (n₁ < n₂) there is no critical angle. Even a grazing ray (θ₁ = 90°) only bends to θ₂ = ' + fnum(d.thc) + '°, which is the dish’s critical angle for the trip back out.</p>');
  return s + '<p class="note">Brightness is shown qualitatively: a little light always reflects, and the reflected ray gets brighter as θ₁ approaches θ<sub>c</sub>. Lab: press <b>Record</b> at several angles; the slope of sin θ(air) vs sin θ(dish) is n.</p>';
}
function dishDraw(v, d, opt, A){
  const cx = 195, cy = 165, Rd = 100, Rr = 116, mono = '"IBM Plex Mono",monospace', sg = d.curved ? 1 : -1, s1 = Math.sin(v.th1 * DEG), c1 = Math.cos(v.th1 * DEG);
  panelTitle('SEMICIRCULAR DISH ON A PROTRACTOR', 10, 18);
  ctx.fillStyle = d.mys ? 'rgba(122,63,176,0.16)' : d.mat === 'water' ? 'rgba(21,120,214,0.22)' : 'rgba(110,130,150,0.24)'; ctx.beginPath(); ctx.arc(cx, cy, Rd, 0, PI); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = '#555'; ctx.lineWidth = 1; for (let p = 0; p < 360; p += 5){ const a = p * DEG, r1 = p % 10 === 0 ? Rr : Rr - 5; ctx.beginPath(); ctx.moveTo(cx + (Rd + 6) * Math.sin(a), cy - (Rd + 6) * Math.cos(a)); ctx.lineTo(cx + r1 * Math.sin(a), cy - r1 * Math.cos(a)); ctx.stroke(); }
  for (let p = 0; p < 360; p += 10){ const a = p * DEG, rd = p <= 90 ? p : p <= 180 ? 180 - p : p <= 270 ? p - 180 : 360 - p; text(String(rd), cx + (Rr + 10) * Math.sin(a), cy - (Rr + 10) * Math.cos(a) + 3, { align: 'center', font: '500 8px ' + mono, col: '#4a4a4a' }); }
  ctx.setLineDash([5, 4]); ctx.strokeStyle = '#4a4a4a'; ctx.beginPath(); ctx.moveTo(cx, cy - Rd - 8); ctx.lineTo(cx, cy + Rd + 8); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - Rd, cy); ctx.lineTo(cx + Rd, cy); ctx.stroke();
  text('air', 12, cy - 8, { font: '700 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(d.mys ? 'dish (n = ?)' : 'dish', 12, cy + 18, { font: '700 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); if (!d.mys) text('n = ' + d.nd.toFixed(2), 12, cy + 32, { font: '700 10px ' + mono, col: '#4a4a4a' });
  // critical angle marker (green): on the incident side going out, on the refracted side going in
  { const xs = d.curved ? -1 : 1, ys = 1, ex = cx + xs * Rd * Math.sin(d.thc * DEG), ey = cy + ys * Rd * Math.cos(d.thc * DEG); ctx.setLineDash([4, 3]); ctx.strokeStyle = '#1e7d45'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
    if (!d.mys) text(d.curved ? 'θc' : 'θ₂ max', cx + xs * (74 * Math.sin(d.thc * DEG) + 5), cy + 74 * Math.cos(d.thc * DEG) + 3, { align: d.curved ? 'right' : 'left', font: '700 10px "Space Grotesk",sans-serif', col: '#1e7d45' }); }
  const ang = (xs, ys, r, th) => { ctx.beginPath(); for (let i = 0; i <= 12; i++){ const f = th * DEG * i / 12; const x = cx + xs * r * Math.sin(f), y = cy + ys * r * Math.cos(f); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); };
  const red = a => 'rgba(212,24,10,' + a + ')';
  // incident
  arrow(cx - Rr * s1, cy + sg * Rr * c1, cx, cy, red(1), null, { w: 3, head: 8 });
  // reflected (partial or total)
  const Ra = Math.max(0.15, d.R);
  if (d.tir){ ctx.strokeStyle = 'rgba(212,24,10,0.25)'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Rr * s1, cy + sg * Rr * c1); ctx.stroke(); ctx.lineCap = 'butt'; }
  if (v.th1 > 0.5) arrow(cx, cy, cx + Rr * s1, cy + sg * Rr * c1, red(Ra), null, { w: d.tir ? 3.5 : 1.5 + 1.5 * d.R, head: 8 });
  // refracted
  if (!d.tir){ const a2 = d.th2 * DEG; arrow(cx, cy, cx + Rr * Math.sin(a2), cy - sg * Rr * Math.cos(a2), red(d.T), null, { w: 3, head: 8 }); }
  // angle arcs and labels
  ctx.lineWidth = 1.2; ctx.strokeStyle = '#1546d6'; if (v.th1 > 0.5){ ang(-1, sg, 44, v.th1); const f = v.th1 * DEG / 2; text('θ₁', cx - 62 * Math.sin(f), cy + sg * 62 * Math.cos(f) + 4, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#1546d6' }); }
  if (!d.tir && d.th2 > 0.5){ ang(1, -sg, 44, d.th2); const f = d.th2 * DEG / 2; text('θ₂', cx + 62 * Math.sin(f), cy - sg * 62 * Math.cos(f) + 4, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#1546d6' }); }
  if (d.tir) text('TOTAL INTERNAL REFLECTION', cx, 318, { align: 'center', font: '700 14px "Space Grotesk",sans-serif', col: '#c43a00' });
  else text(d.curved ? 'enters on a radius: not bent at the curve' : 'bends at the flat face, exits along a radius', cx, 318, { align: 'center', font: '600 10px ' + mono, col: '#4a4a4a' });
  // readouts
  panelTitle('READINGS', 395, 18);
  [['n of the dish', d.mys ? '?' : d.nd.toFixed(2), '#111'], ['θ₁ (incident)', fplain(v.th1) + '°', '#111'], ['θ₂ (refracted)', d.tir ? 'none: TIR' : fplain(d.curved ? d.rA : d.rD) + '°', d.tir ? '#c43a00' : '#111'], ['critical angle', d.curved ? (d.mys ? 'find it!' : fplain(d.thc) + '°') : 'none (air→dish)', '#1e7d45']].forEach(([a, b, c], i) => { text(a, 400, 38 + i * 14, { font: '600 11px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 38 + i * 14, { align: 'right', font: '700 12px ' + mono, col: c }); });
  // record controls
  const btn = (b, label, on) => { ctx.fillStyle = on ? '#111' : '#fff'; ctx.fillRect(b[0], b[1], b[2], b[3]); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(b[0], b[1], b[2], b[3]); text(label, b[0] + b[2] / 2, b[1] + 14, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: on ? '#fff' : '#111' }); };
  btn(DISH_BTN.rec, 'Record (R)', !d.tir); btn(DISH_BTN.clr, 'Clear', false);
  const rec = A.rec || [], msgOn = A.msg && S.t - A.msgT < 2.5;
  text(msgOn ? A.msg : 'logs sin θ(dish), sin θ(air)', 397, 128, { font: '600 9px ' + mono, col: msgOn ? '#c43a00' : '#4a4a4a' });
  text('sinθd', 397, 142, { font: '700 9px ' + mono, col: '#4a4a4a' }); text('sinθa', 436, 142, { font: '700 9px ' + mono, col: '#4a4a4a' });
  rec.slice(-8).forEach((r, i) => { text(r.sd.toFixed(3), 397, 154 + i * 12, { font: '500 9px ' + mono }); text(r.sa.toFixed(3), 436, 154 + i * 12, { font: '500 9px ' + mono }); });
  const gx0 = 500, gy0 = 232, gw = 86, gh = 90, X = x => gx0 + x * gw, Y = y => gy0 - y * gh;
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx0, gy0 - gh - 4); ctx.lineTo(gx0, gy0); ctx.lineTo(gx0 + gw + 4, gy0); ctx.stroke();
  text('sinθa', gx0 - 4, gy0 - gh - 8, { font: '600 9px ' + mono, col: '#4a4a4a' }); text('sinθd →', gx0 + gw, gy0 + 11, { align: 'right', font: '600 9px ' + mono, col: '#4a4a4a' }); text('1', gx0 - 3, gy0 - gh + 3, { align: 'right', font: '500 8px ' + mono, col: '#4a4a4a' });
  let slope = NaN; if (rec.length){ const sxy = rec.reduce((a, r) => a + r.sd * r.sa, 0), sxx = rec.reduce((a, r) => a + r.sd * r.sd, 0); slope = sxy / sxx;
    ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); const xe = Math.min(1, 1 / slope); ctx.lineTo(X(xe), Y(xe * slope)); ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; rec.forEach(r => { ctx.beginPath(); ctx.arc(X(r.sd), Y(r.sa), 3, 0, 7); ctx.fill(); ctx.stroke(); }); }
  text(rec.length ? 'slope = ' + slope.toFixed(2) + ' = n' : 'slope = n', 397, 262, { font: '700 13px "Space Grotesk",sans-serif', col: rec.length ? '#1546d6' : '#8a8a8a' });
  text(rec.length ? rec.length + ' point' + (rec.length > 1 ? 's' : '') + ', line through the origin' : 'press Record at several angles', 397, 276, { font: '500 9px ' + mono, col: '#4a4a4a' });
  text('d = dish side, a = air side', 397, 304, { font: '500 9px ' + mono, col: '#4a4a4a' });
}
const SIM = {
  title: 'Refraction & Total Internal Reflection',
  hint: 'n₁ sin θ₁ = n₂ sin θ₂ · n = c/v',
  modes: [{ id: 'refr', label: 'Snell’s law' }, { id: 'fiber', label: 'Optical fiber' }, { id: 'dish', label: 'Semicircular dish (lab)' }],
  opts: [{ id: 'dmat', label: 'Dish', modes: ['dish'], choices: [['acrylic', 'Acrylic'], ['water', 'Water'], ['mystery', 'Mystery']] }, { id: 'dside', label: 'Ray enters', modes: ['dish'], choices: [['curved', 'Curved side'], ['flat', 'Flat face']] }],
  ivs(mode){
    if (mode === 'dish') return [{ id: 'th1', sym: 'θ<sub>1</sub>', symText: 'θ1', label: 'Angle of incidence (from the normal)', unit: '°', min: 0, max: 89, step: 0.5, val: 30, graph: true }];
    if (mode === 'fiber') return [
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Angle the light enters the end of the fiber', unit: '°', min: 0, max: 80, step: 0.5, val: 30, graph: true },
      { id: 'nc', sym: 'n<sub>core</sub>', symText: 'ncore', label: 'Core index', unit: '', min: 1.3, max: 1.8, step: 0.01, val: 1.5, show: x => x.toFixed(2) },
      { id: 'ncl', sym: 'n<sub>clad</sub>', symText: 'nclad', label: 'Cladding index', unit: '', min: 1, max: 1.7, step: 0.01, val: 1.4, show: x => x.toFixed(2) }];
    return [
      { id: 'th1', sym: 'θ<sub>1</sub>', symText: 'θ1', label: 'Angle of incidence (from the normal)', unit: '°', min: 0, max: 89, step: 0.5, val: 40, graph: true },
      { id: 'n1', sym: 'n<sub>1</sub>', symText: 'n1', label: 'Index of medium 1 (top)', unit: '', min: 1, max: 2.5, step: 0.01, val: 1, show: x => x.toFixed(2) },
      { id: 'n2', sym: 'n<sub>2</sub>', symText: 'n2', label: 'Index of medium 2 (bottom)', unit: '', min: 1, max: 2.5, step: 0.01, val: 1.33, show: x => x.toFixed(2) },
      { id: 'lam', sym: 'λ<sub>1</sub>', symText: 'λ1', label: 'Wavelength in medium 1', unit: 'nm', min: 400, max: 700, step: 5, val: 600 }];
  },
  presets: [{ label: 'Air → water', mode: 'refr', v: { n1: 1, n2: 1.33, th1: 40 } }, { label: 'Glass → air, past critical', mode: 'refr', v: { n1: 1.5, n2: 1, th1: 50 } }, { label: 'Diamond → air', mode: 'refr', v: { n1: 2.42, n2: 1, th1: 30 } }, { label: 'Light leaks out', mode: 'fiber', v: { th: 70, ncl: 1.45 } },
    { label: 'Acrylic dish, past critical', mode: 'dish', opt: { dmat: 'acrylic', dside: 'curved' }, v: { th1: 50 } }, { label: 'Air → water dish', mode: 'dish', opt: { dmat: 'water', dside: 'flat' }, v: { th1: 60 } }, { label: 'Mystery dish', mode: 'dish', opt: { dmat: 'mystery', dside: 'curved' }, v: { th1: 25 } }],
  calc(v, mode, opt){
    if (mode === 'dish') return dishCalc(v, opt);
    if (mode === 'fiber'){ const tr = Math.asin(Math.sin(v.th * DEG) / v.nc) / DEG, wall = 90 - tr, crit = v.ncl < v.nc ? Math.asin(v.ncl / v.nc) / DEG : 90, tir = wall > crit;
      const NA = Math.sqrt(Math.max(0, v.nc * v.nc - v.ncl * v.ncl)), acc = NA >= 1 ? 90 : Math.asin(NA) / DEG; return { tr, wall, crit, tir, acc }; }
    const s2 = v.n1 * Math.sin(v.th1 * DEG) / v.n2, tir = s2 > 1, th2 = tir ? NaN : Math.asin(s2) / DEG, crit = v.n1 > v.n2 ? Math.asin(v.n2 / v.n1) / DEG : NaN;
    return { s2, tir, th2, crit, v1: 3e8 / v.n1, v2: 3e8 / v.n2, lam2: v.lam * v.n1 / v.n2 };
  },
  dvs(mode){
    if (mode === 'dish') return [{ id: 'th2', name: 'Angle of refraction', short: 'θ₂', sym: 'θ<sub>2</sub>', unit: '°', f: d => d.th2 }, { id: 's2', name: 'sin θ₂', short: 'sin θ₂', sym: 'sin θ<sub>2</sub>', unit: '', f: d => d.tir ? NaN : d.s2 }];
    if (mode === 'fiber') return [{ id: 'wall', name: 'Angle at the core–cladding wall', short: 'θ_wall', sym: 'θ<sub>wall</sub>', unit: '°', f: d => d.wall, vs: 'crit' }, { id: 'crit', name: 'Critical angle', short: 'θ_c', sym: 'θ<sub>c</sub>', unit: '°', f: d => d.crit }];
    return [{ id: 'th2', name: 'Angle of refraction', short: 'θ₂', sym: 'θ<sub>2</sub>', unit: '°', f: d => d.th2 }, { id: 'lam2', name: 'Wavelength in medium 2', short: 'λ₂', sym: 'λ<sub>2</sub>', unit: 'nm', f: d => d.lam2 }];
  },
  work(v, d, mode, opt){
    if (mode === 'dish') return dishWork(v, d, opt);
    if (mode === 'fiber') return '<h4>1 · Refraction into the end of the fiber</h4>' + TEX`(1.00)\sin\theta = n_{\text{core}}\sin\theta_r` + TEX`(1.00)\sin ${M.iv('th')} = (${M.n(v.nc)})\sin\theta_r` + TEXA`\theta_r = ${M.n(d.tr, '°')}` +
      '<h4>2 · Angle at the wall</h4><p class="st">The wall is parallel to the axis, so the ray hits it at 90° − θ<sub>r</sub> from the normal.</p>' + TEX`\theta_{\text{wall}} = 90^{\circ} - \theta_r` + TEX`\theta_{\text{wall}} = 90^{\circ} - ${M.n(d.tr, '°')}` + TEXA`\theta_{\text{wall}} = ${M.n(d.wall, '°')}` +
      '<h4>3 · Critical angle at the wall</h4>' + (v.ncl < v.nc ? TEX`\sin\theta_c = \frac{n_{\text{clad}}}{n_{\text{core}}}` + TEX`\sin\theta_c = \frac{${M.n(v.ncl)}}{${M.n(v.nc)}}` + TEXA`\theta_c = ${M.n(d.crit, '°')}` : '<p class="st">n<sub>clad</sub> ≥ n<sub>core</sub>: no total internal reflection possible.</p>') +
      (d.tir ? TEX`${M.n(d.wall, '°')} > ${M.n(d.crit, '°')}` + '<p class="st"><b>Total internal reflection</b>: the light stays in the core.</p>' : '<div class="bad">' + fnum(d.wall) + '° < θ<sub>c</sub>: some light refracts into the cladding and leaks away every bounce.</div>') +
      '<p class="note">Light entering at up to ' + fnum(d.acc) + '° is trapped. Uses: internet cables, endoscopes for seeing inside the body. Why have a cladding at all? It protects the core surface and keeps scratches and other fibers from letting light out.</p>';
    let s = '<h4>1 · Snell’s law</h4>' + TEX`n_1 \sin\theta_1 = n_2 \sin\theta_2` + TEX`\sin\theta_2 = \frac{n_1 \sin\theta_1}{n_2}` + TEX`\sin\theta_2 = \frac{(${M.n(v.n1)})(\sin ${M.iv('th1')})}{${M.n(v.n2)}}` + TEXA`\sin\theta_2 = ${M.n(d.s2)}`;
    if (d.tir) s += '<div class="bad">sin θ₂ can’t be more than 1: no refracted ray. <b>Total internal reflection</b> — all the light reflects (θ₁ = ' + fnum(v.th1) + '° > θ<sub>c</sub> = ' + fnum(d.crit) + '°).</div>';
    else s += TEXA`\theta_2 = ${M.n(d.th2, '°')}` + '<p class="st">Bends ' + (v.n2 > v.n1 ? '<b>toward</b> the normal (into a slower medium).' : v.n2 < v.n1 ? '<b>away from</b> the normal (into a faster medium).' : 'not at all.') + '</p>';
    s += '<h4>2 · Critical angle</h4>' + (v.n1 > v.n2 ? TEX`\sin\theta_c = \frac{n_2}{n_1}` + TEX`\sin\theta_c = \frac{${M.n(v.n2)}}{${M.n(v.n1)}}` + TEXA`\theta_c = ${M.n(d.crit, '°')}` : '<p class="st">Only possible going from higher n to lower n. Here n₁ ≤ n₂, so no critical angle.</p>') +
      '<h4>3 · Speed and wavelength change; frequency doesn’t</h4>' + TEX`v_2 = \frac{c}{n_2}` + TEX`v_2 = \frac{3.00\times10^{8}\,\text{m/s}}{${M.n(v.n2)}}` + TEX`v_2 = ${M.n(d.v2, 'm/s')}` +
      TEX`\lambda_2 = \lambda_1\,\frac{n_1}{n_2}` + TEX`\lambda_2 = (${M.iv('lam')})\,\frac{${M.n(v.n1)}}{${M.n(v.n2)}}` + TEXA`\lambda_2 = ${M.n(d.lam2, 'nm')}` +
      '<p class="note">The wavefronts (thin lines) slow down on entering the bottom medium, so they get closer together and the ray turns. Some light always reflects at the surface too.</p>';
    return s;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'dish') return dishDraw(v, d, opt, A);
    if (mode === 'fiber'){
      panelTitle('LIGHT IN AN OPTICAL FIBER', 10, 18);
      const x0 = 70, x1 = 385, yc = 160, hc = 20, hcl = 40;
      ctx.fillStyle = 'rgba(120,120,140,0.18)'; ctx.fillRect(x0, yc - hcl, x1 - x0, 2 * hcl); ctx.fillStyle = 'rgba(21,120,214,0.15)'; ctx.fillRect(x0, yc - hc, x1 - x0, 2 * hc);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(x0, yc - hcl, x1 - x0, 2 * hcl); ctx.beginPath(); ctx.moveTo(x0, yc - hc); ctx.lineTo(x1, yc - hc); ctx.moveTo(x0, yc + hc); ctx.lineTo(x1, yc + hc); ctx.stroke();
      text('cladding', x1 - 4, yc - hcl - 6, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('core', x1 - 4, yc + 4, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#1546d6' });
      const a = v.th * DEG, L = 60; ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0 - L * Math.cos(a), yc + L * Math.sin(a)); ctx.lineTo(x0, yc); ctx.stroke();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0 - 50, yc); ctx.lineTo(x0, yc); ctx.stroke(); ctx.setLineDash([]);
      let x = x0, y = yc, dir = -1, tr = d.tr * DEG, I = 1; const slope = Math.tan(tr);
      for (let b = 0; b < 30 && x < x1; b++){ const yt = dir < 0 ? yc - hc : yc + hc, dx = Math.abs(yt - y) / Math.max(slope, 1e-6), xn = Math.min(x1, x + dx), yn = y + (xn - x) * slope * dir;
        ctx.strokeStyle = 'rgba(196,58,0,' + I + ')'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(xn, yn); ctx.stroke(); if (xn >= x1) break;
        if (!d.tir){ const sOut = v.nc * Math.cos(tr) / v.ncl; if (sOut < 1){ const ao = Math.asin(sOut); ctx.strokeStyle = 'rgba(196,58,0,' + I * 0.7 + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xn, yn); ctx.lineTo(xn + 24 * Math.sin(ao), yn + dir * 24 * Math.cos(ao)); ctx.stroke(); } I *= 0.55; }
        x = xn; y = yn; dir = -dir; if (I < 0.05) break; }
      text(d.tir ? 'trapped by total internal reflection' : 'leaking at every bounce', 12, 300, { font: '700 13px "Space Grotesk",sans-serif', col: d.tir ? '#1e7d45' : '#c43a00' });
      panelTitle('AT THE WALL', 395, 18);
      [['angle in core θr', fplain(d.tr) + '°'], ['angle at wall', fplain(d.wall) + '°'], ['critical angle', v.ncl < v.nc ? fplain(d.crit) + '°' : 'none'], ['accepts up to', fplain(d.acc) + '°']].forEach(([a2, b], i) => { text(a2, 400, 50 + i * 30, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 50 + i * 30, { align: 'right', font: '700 13px "IBM Plex Mono",monospace' }); });
      return;
    }
    panelTitle('RAY AND WAVEFRONTS AT A BOUNDARY', 10, 18);
    const cx = 200, cy = 160, R = 140, a1 = v.th1 * DEG, sh = n => 'rgba(21,120,214,' + Math.min(0.5, (n - 1) * 0.3) + ')';
    ctx.fillStyle = sh(v.n1); ctx.fillRect(20, 26, 365, cy - 26); ctx.fillStyle = sh(v.n2); ctx.fillRect(20, cy, 365, 300 - cy);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(385, cy); ctx.stroke();
    ctx.setLineDash([5, 4]); ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, 30); ctx.lineTo(cx, 296); ctx.stroke(); ctx.setLineDash([]);
    text('n₁ = ' + v.n1.toFixed(2), 26, 44, { font: '700 12px "IBM Plex Mono",monospace' }); text('n₂ = ' + v.n2.toFixed(2), 26, 290, { font: '700 12px "IBM Plex Mono",monospace' });
    const ix = cx - R * Math.sin(a1), iy = cy - R * Math.cos(a1); ctx.save(); ctx.beginPath(); ctx.rect(20, 26, 365, 274); ctx.clip();
    // wavefronts: lines perpendicular to the ray, spacing ∝ λ
    const sp1 = 22 * v.lam / 600, ux = Math.sin(a1), uy = Math.cos(a1);
    ctx.strokeStyle = 'rgba(17,17,17,0.35)'; ctx.lineWidth = 1;
    for (let s = sp1; s < R; s += sp1){ const px = cx - ux * s, py = cy - uy * s; if (py > cy) continue; ctx.beginPath(); ctx.moveTo(px - uy * 26, py + ux * 26); ctx.lineTo(px + uy * 26, py - ux * 26); ctx.stroke(); }
    if (!d.tir){ const a2 = d.th2 * DEG, vx = Math.sin(a2), vy = Math.cos(a2), sp2 = sp1 * v.n1 / v.n2; for (let s = sp2; s < R; s += sp2){ const px = cx + vx * s, py = cy + vy * s; ctx.beginPath(); ctx.moveTo(px - vy * 26, py + vx * 26); ctx.lineTo(px + vy * 26, py - vx * 26); ctx.stroke(); } }
    ctx.restore();
    arrow(ix, iy, cx, cy, '#c43a00', null, { w: 3 });
    const refl = d.tir ? 1 : 0.35; arrow(cx, cy, cx + R * Math.sin(a1), cy - R * Math.cos(a1), 'rgba(196,58,0,' + refl + ')', null, { w: d.tir ? 3 : 2 });
    if (!d.tir){ const a2 = d.th2 * DEG; arrow(cx, cy, cx + R * Math.sin(a2), cy + R * Math.cos(a2), '#c43a00', null, { w: 3 }); text('θ₂ = ' + fplain(d.th2) + '°', cx + 12, cy + 40, { font: '700 12px "Space Grotesk",sans-serif' }); }
    text('θ₁ = ' + v.th1 + '°', cx - 12, cy - 40, { align: 'right', font: '700 12px "Space Grotesk",sans-serif' });
    if (d.tir) text('TOTAL INTERNAL REFLECTION', cx, cy + 50, { align: 'center', font: '700 14px "Space Grotesk",sans-serif', col: '#c43a00' });
    panelTitle('NUMBERS', 395, 18);
    [['θ₂', d.tir ? 'none (TIR)' : fplain(d.th2) + '°'], ['critical angle', isFinite(d.crit) ? fplain(d.crit) + '°' : 'none'], ['v₁', fplain(d.v1) + ' m/s'], ['v₂', fplain(d.v2) + ' m/s'], ['λ₁', v.lam + ' nm'], ['λ₂', fplain(d.lam2) + ' nm']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px "IBM Plex Mono",monospace' }); });
    panelTitle('COMMON INDICES', 395, 220); text('air 1.00 · water 1.33', 400, 238, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('glass 1.5 · diamond 2.42', 400, 252, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
