// Projectiles: horizontal launch, angled launch on level ground, angled launch from a height, and hitting a target.
const SIM = {
  title: 'Projectiles',
  modes: [{ id: 'horiz', label: 'Off a cliff' }, { id: 'level', label: 'Level ground' }, { id: 'height', label: 'From a height' }, { id: 'target', label: 'Hit the target' }, { id: 'dh', label: 'Launcher lab: D² vs H' }],
  opts: [{ id: 'vk', label: 'Launch speed', modes: ['dh'], choices: [['shown', 'v₀ shown'], ['mystery', 'Mystery v₀']] }],
  ivs(mode, opt){
    if (mode === 'dh'){ const my = (opt && opt.vk) === 'mystery'; return [
      { id: 'H', sym: 'H', symText: 'H', label: 'Table height', unit: 'm', min: 0.3, max: 2, step: 0.05, val: 1, graph: true }].concat(my ? [] : [
      { id: 'vl', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Launch speed (horizontal)', unit: 'm/s', min: 1, max: 5, step: 0.1, val: 3 }]); }
    if (mode === 'horiz') return [
      { id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Launch speed (horizontal)', unit: 'm/s', min: 0, max: 30, step: 0.5, val: 10, graph: true },
      { id: 'h', sym: 'h', symText: 'h', label: 'Cliff height', unit: 'm', min: 5, max: 100, step: 1, val: 45 }];
    if (mode === 'level') return [
      { id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Launch speed', unit: 'm/s', min: 5, max: 40, step: 0.5, val: 20 },
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Launch angle', unit: '°', min: 5, max: 85, step: 1, val: 30, graph: true, show: x => x.toFixed(0) + '°' }];
    if (mode === 'height') return [
      { id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Launch speed', unit: 'm/s', min: 2, max: 40, step: 0.5, val: 15 },
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Launch angle (− = downward)', unit: '°', min: -60, max: 85, step: 1, val: 30, graph: true, show: x => x.toFixed(0) + '°' },
      { id: 'h', sym: 'h', symText: 'h', label: 'Launch height above the ground', unit: 'm', min: 0, max: 80, step: 1, val: 20 }];
    return [
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Launch angle', unit: '°', min: 10, max: 80, step: 1, val: 45, graph: true, show: x => x.toFixed(0) + '°' },
      { id: 'D', sym: 'D', symText: 'D', label: 'Target distance', unit: 'm', min: 5, max: 80, step: 1, val: 30 },
      { id: 'yT', sym: 'y<sub>T</sub>', symText: 'yT', label: 'Target height (− = below)', unit: 'm', min: -20, max: 30, step: 0.5, val: 5 }];
  },
  presets: [{ label: 'Complementary angles', mode: 'level', v: { th: 60 } }, { label: '45°', mode: 'level', v: { th: 45 } }, { label: 'Thrown down', mode: 'height', v: { th: -30 } }, { label: 'Just drop it', mode: 'horiz', v: { v0: 0 } }, { label: 'Lab: low table', mode: 'dh', v: { H: 0.5 } }, { label: 'Lab: high table', mode: 'dh', v: { H: 1.8 } }],
  calc(v, mode, opt){
    if (mode === 'dh'){ const my = (opt && opt.vk) === 'mystery', v0 = my ? DH_MYSTERY : v.vl, t = Math.sqrt(2 * v.H / G10), D = v0 * t; return { dh: true, mystery: my, v0, H: v.H, t, D, D2: D * D, slope: 2 * v0 * v0 / G10 }; }
    let v0, th, h = 0, ok = true;
    if (mode === 'horiz'){ v0 = v.v0; th = 0; h = v.h; }
    else if (mode === 'level'){ v0 = v.v0; th = v.th; }
    else if (mode === 'height'){ v0 = v.v0; th = v.th; h = v.h; }
    else { th = v.th; const c = Math.cos(th * DEG), den = v.D * Math.tan(th * DEG) - v.yT; ok = den > 0; v0 = ok ? v.D / c * Math.sqrt(G10 / (2 * den)) : NaN; }
    const vx = v0 * Math.cos(th * DEG), vy = v0 * Math.sin(th * DEG);
    let T;
    if (mode === 'target') T = ok ? v.D / vx : NaN; else T = (vy + Math.sqrt(vy * vy + 2 * G10 * h)) / G10;
    const R = vx * T, yEnd = mode === 'target' ? v.yT : 0, vyEnd = vy - G10 * T, vEnd = Math.hypot(vx, vyEnd), angEnd = Math.atan2(vyEnd, vx) / DEG;
    const tTop = vy > 0 ? vy / G10 : 0, yMax = h + (vy > 0 ? vy * vy / (2 * G10) : 0);
    const pos = s => [vx * s, h + vy * s - 5 * s * s];
    return { v0, th, h, vx, vy, T, R, yEnd, vyEnd, vEnd, angEnd, tTop, yMax, pos, ok, R90: mode === 'level' ? v0 * v0 * Math.sin(2 * (90 - th) * DEG) / G10 : NaN };
  },
  dvs(mode){
    if (mode === 'dh') return [
      { id: 'D2', name: 'D² (landing distance squared)', short: 'D²', sym: 'D²', unit: 'm²', f: d => d.D2 },
      { id: 'D', name: 'Landing distance D', short: 'D', sym: 'D', unit: 'm', f: d => d.D },
      { id: 't', name: 'Time of fall', short: 't', sym: 't', unit: 's', f: d => d.t }];
    const l = [
      { id: 'R', name: 'Horizontal distance (range)', short: 'R', sym: 'R', unit: 'm', f: d => d.R },
      { id: 'T', name: 'Time in the air', short: 't', sym: 't', unit: 's', f: d => d.T },
      { id: 'yMax', name: 'Highest point', short: 'y_max', sym: 'y<sub>max</sub>', unit: 'm', f: d => d.yMax },
      { id: 'vEnd', name: 'Speed at impact', short: 'v_f', sym: 'v<sub>f</sub>', unit: 'm/s', f: d => d.vEnd }];
    if (mode === 'target') l.unshift({ id: 'v0', name: 'Launch speed needed', short: 'v0', sym: 'v<sub>0</sub>', unit: 'm/s', f: d => d.v0 });
    return l;
  },
  work(v, d, mode, opt){
    if (mode === 'dh') return workDH(v, d, opt);
    if (mode === 'target' && !d.ok) return '<div class="bad">At ' + H.iv('th') + ' the launch line points below the target, so no speed can reach it. Aim higher.</div>';
    const iv0 = mode === 'target' ? M.n(d.v0, 'm/s') : M.iv('v0'), ith = mode === 'horiz' ? '<mrow><mn>0</mn><mo>°</mo></mrow>' : M.iv('th');
    let h = '<h4>1 · Split the launch velocity into components</h4>' +
      (mode === 'horiz' ? '<p class="st">Launched horizontally:</p>' + TEXA`v_x = ${iv0}` + TEXA`v_{y0} = 0`
        : TEX`v_x = v_0\cos\theta` + TEX`v_x = (${iv0})\cos ${ith}` + TEXA`v_x = ${M.n(d.vx, 'm/s')}` +
          TEX`v_{y0} = v_0\sin\theta` + TEX`v_{y0} = (${iv0})\sin ${ith}` + TEXA`v_{y0} = ${M.n(d.vy, 'm/s')}`) +
      '<p class="note">Horizontal: no force → v<sub>x</sub> stays constant. Vertical: a = −g. The two directions are independent; time links them.</p>';
    if (mode === 'target'){
      h += '<h4>2 · Horizontal gives the time</h4>' + TEX`t = \frac{D}{v_x}` + TEX`t = \frac{D}{v_0\cos\theta}` +
        '<h4>3 · Vertical must land on the target</h4>' + TEX`y_T = (v_0\sin\theta)\,t - \frac{1}{2}g t^2` + '<p class="st">Substitute t:</p>' +
        TEX`y_T = D\tan\theta - \frac{g D^2}{2 v_0^2\cos^2\theta}` + '<p class="st">Solve for the launch speed:</p>' +
        TEX`v_0 = \frac{D}{\cos\theta}\sqrt{\frac{g}{2\left(D\tan\theta - y_T\right)}}` + TEXA`v_0 = ${M.n(d.v0, 'm/s')}` +
        '<p class="st">Time in the air:</p>' + TEXA`t = ${M.n(d.T, 's')}` +
        '<p class="note">Try other angles: the needed speed has a minimum somewhere between θ = 45° and straight at the target.</p>';
      return h;
    }
    h += '<h4>2 · Vertical: how long is it in the air?</h4>' +
      (d.h === 0 ? '<p class="st">Lands at the same height:</p>' + TEX`0 = v_{y0}t - \frac{1}{2}g t^2` + TEX`t = \frac{2 v_{y0}}{g}` + TEX`t = \frac{2(${M.n(d.vy)})}{10\,\text{m/s}^2}` + TEXA`t = ${M.n(d.T, 's')}`
        : mode === 'horiz' ? '<p class="st">Falls h with v<sub>y0</sub> = 0:</p>' + TEX`h = \frac{1}{2}g t^2` + TEX`t = \sqrt{\frac{2h}{g}}` + TEX`t = \sqrt{\frac{2 \times ${M.iv('h')}}{10\,\text{m/s}^2}}` + TEXA`t = ${M.n(d.T, 's')}` + '<p class="note">The same time as a ball just dropped from the cliff (the grey ball): horizontal speed doesn’t change how fast it falls.</p>'
        : TEX`0 = h + v_{y0}t - \frac{1}{2}g t^2` + TEX`t = \frac{v_{y0} + \sqrt{v_{y0}^2 + 2gh}}{g}` + TEXA`t = ${M.n(d.T, 's')}`);
    h += '<h4>3 · Horizontal: how far?</h4>' + TEX`R = v_x t` + TEX`R = (${M.n(d.vx)})(${M.n(d.T)})` + TEXA`R = ${M.n(d.R, 'm')}`;
    if (d.vy > 0) h += '<h4>4 · Top of the path: v<sub>y</sub> = 0 (v<sub>x</sub> isn’t!)</h4>' + TEX`t_{\text{top}} = \frac{v_{y0}}{g}` + TEXA`t_{\text{top}} = ${M.n(d.tTop, 's')}` +
      (d.h ? TEX`y_{\text{max}} = h + \frac{v_{y0}^2}{2g}` : TEX`y_{\text{max}} = \frac{v_{y0}^2}{2g}`) + TEXA`y_{\text{max}} = ${M.n(d.yMax, 'm')}` +
      '<p class="st">Speed at the top is just v<sub>x</sub>:</p>' + TEXA`v_{\text{top}} = ${M.n(d.vx, 'm/s')}`;
    h += '<h4>' + (d.vy > 0 ? '5' : '4') + ' · Impact velocity</h4>' + TEX`v_y = v_{y0} - g t` + TEXA`v_y = ${M.n(d.vyEnd, 'm/s')}` +
      TEX`|v| = \sqrt{v_x^2 + v_y^2}` + TEX`|v| = \sqrt{(${M.n(d.vx)})^2 + (${M.n(d.vyEnd)})^2}` + TEXA`|v| = ${M.n(d.vEnd, 'm/s')}` +
      '<p class="st">Angle below horizontal:</p>' + TEXA`\theta = ${M.n(-d.angEnd, '°')}`;
    if (mode === 'level') h += '<p class="note">Range on level ground: R = v<sub>0</sub>² sin(2θ)/g. Biggest at 45°; complementary angles (like 30° and 60°) give the same range: the dashed path is ' + H.n(90 - v.th, '°') + '.</p>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    if (mode === 'target' && !d.ok){ panelTitle('HIT THE TARGET', 10, 18); text('Aim higher: the launch line is below the target.', 300, 160, { align: 'center', font: '700 15px "Space Grotesk",sans-serif', col: '#c43a00' }); return; }
    const T = d.T, tt = Math.min(A.t % (T + 1.5), T);
    panelTitle(mode === 'horiz' ? 'LAUNCHED HORIZONTALLY OFF A CLIFF' : mode === 'level' ? 'LAUNCHED ON LEVEL GROUND' : mode === 'height' ? 'LAUNCHED FROM A HEIGHT' : 'HIT THE TARGET', 10, 18);
    // scale to fit
    let xmax = Math.max(d.R, 5), ymax = Math.max(d.yMax, d.h, mode === 'target' ? v.yT : 0, 3), ymin = Math.min(0, mode === 'target' ? v.yT : 0);
    if (mode === 'level') xmax = Math.max(xmax, d.R90);
    const sc = Math.min(480 / xmax, 230 / (ymax - ymin)), x0 = mode === 'horiz' || mode === 'height' ? 80 : 50, gy = 280 + ymin * sc;
    const X = x => x0 + x * sc, Y = y => gy - y * sc;
    ctx.fillStyle = '#e6dccb'; ctx.fillRect(0, Y(0), 600, 330 - Y(0));
    if (d.h > 0){ ctx.fillStyle = '#b89a6a'; ctx.fillRect(0, Y(d.h), x0, Y(0) - Y(d.h)); ctx.fillStyle = '#4a7a3a'; ctx.fillRect(0, Y(d.h) - 3, x0, 3); }
    if (mode === 'target'){ const tx = X(v.D), ty = Y(v.yT); if (v.yT > 0){ ctx.fillStyle = '#b89a6a'; ctx.fillRect(tx - 6, ty, 600, Y(0) - ty); } else if (v.yT < 0){ ctx.fillStyle = '#fbfbfb'; ctx.fillRect(tx - 30, Y(0), 600, ty - Y(0)); ctx.fillStyle = '#b89a6a'; ctx.fillRect(tx - 34, Y(0), 4, ty - Y(0)); }
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 3; [12, 7].forEach(r => { ctx.beginPath(); ctx.arc(tx, ty - 1, r, PI, 2 * PI); ctx.stroke(); }); }
    if (mode === 'level'){ const th2 = 90 - v.th, vx2 = d.v0 * Math.cos(th2 * DEG), vy2 = d.v0 * Math.sin(th2 * DEG), T2 = 2 * vy2 / G10; ctx.setLineDash([4, 4]); ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = 0; k <= 80; k++){ const s = T2 * k / 80; const px = X(vx2 * s), py = Y(vy2 * s - 5 * s * s); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.setLineDash([]); text(fplain(th2) + '°', X(vx2 * T2 / 2), Y(vy2 * vy2 / 20) - 6, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#999' }); }
    // dropped comparison ball for the horizontal launch
    if (mode === 'horiz'){ const yd = Math.max(0, d.h - 5 * tt * tt); ctx.fillStyle = '#bbb'; ctx.beginPath(); ctx.arc(X(0) - 12, Y(yd), 6, 0, 7); ctx.fill(); }
    // path, strobe dots
    ctx.strokeStyle = 'rgba(255,106,43,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = 0; k <= 100; k++){ const p = d.pos(T * k / 100); k ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])); } ctx.stroke();
    const step = T > 4 ? 0.5 : T > 2 ? 0.25 : 0.1;
    for (let s = 0; s <= tt + 1e-9; s += step){ const p = d.pos(s); ctx.fillStyle = '#ffb38f'; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 3, 0, 7); ctx.fill(); if (mode === 'horiz'){ ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(X(0) - 12, Y(d.pos(s)[1]), 2.5, 0, 7); ctx.fill(); } }
    const p = d.pos(tt), bx = X(p[0]), by = Y(p[1]); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(bx, by, 7, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.stroke();
    const vyNow = d.vy - G10 * tt, k = 2.2;
    arrow(bx, by, bx + d.vx * k, by, COL.V, 'vx', { w: 2.5, head: 7, lx: 4, ly: -8 });
    if (Math.abs(vyNow) > 0.3) arrow(bx, by, bx, by - vyNow * k, '#7a3fb0', 'vy', { w: 2.5, head: 7, lx: 6, ly: 0 });
    // launcher
    const lx = X(0), ly = Y(d.h); ctx.save(); ctx.translate(lx, ly); ctx.rotate(-d.th * DEG); ctx.fillStyle = '#333'; ctx.fillRect(-6, -5, 26, 10); ctx.restore();
    // readouts
    text('R = ' + fplain(d.R) + ' m   t = ' + fplain(d.T) + ' s' + (mode === 'target' ? '   v₀ needed = ' + fplain(d.v0) + ' m/s' : ''), 590, 18, { align: 'right', font: '700 12px "IBM Plex Mono",monospace' });
    if (d.vy > 0){ ctx.setLineDash([3, 3]); ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(d.vx * d.tTop) - 40, Y(d.yMax)); ctx.lineTo(X(d.vx * d.tTop) + 40, Y(d.yMax)); ctx.stroke(); ctx.setLineDash([]); text('top: vy = 0', X(d.vx * d.tTop) + 44, Y(d.yMax) + 4, { font: '600 10px "IBM Plex Mono",monospace', col: '#888' }); }
    text('t = ' + fplain(tt) + ' s   x = ' + fplain(p[0]) + ' m   y = ' + fplain(p[1]) + ' m', 12, 322, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};

const _baseDraw = SIM.draw;
SIM.draw = function(v, d, mode, opt, t, dt, A){
  if (mode === 'dh') return drawDH(v, d, opt, t, dt, A);
  return _baseDraw.apply(this, arguments);
};

// ---------- Launcher lab: D² vs H ----------
const DH_MYSTERY = 3.4;
const OPF = '"Space Grotesk",sans-serif', OPM = '"IBM Plex Mono",monospace';
const DHS = window._dh = window._dh || { pts: [], msg: '', msgT: -9, btn: [], cur: null };
function btnDraw(x, y, w, h, label, hot){ DHS.btn.push({ x, y, w, h, label }); ctx.save(); ctx.fillStyle = hot ? '#ff6a2b' : '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); ctx.restore(); text(label, x + w / 2, y + h / 2 + 4.5, { align: 'center', font: '700 12px ' + OPF, col: hot ? '#fff' : '#111' }); }
function dhRecord(){ const v = S.v, d = S.d; if (!d || !d.dh) return;
  const k = DHS.pts.findIndex(p => Math.abs(p.H - v.H) < 0.001);
  if (k >= 0) DHS.pts[k] = { H: v.H, D: d.D, v0: d.v0 }; else if (DHS.pts.length >= 8){ DHS.msg = 'Table full: clear it first'; DHS.msgT = S.t; return update(); } else DHS.pts.push({ H: v.H, D: d.D, v0: d.v0 });
  DHS.msg = 'Recorded H = ' + fplain(v.H) + ' m, D = ' + fplain(d.D) + ' m'; DHS.msgT = S.t; update(); }
function dhClear(){ DHS.pts.length = 0; DHS.msg = 'Table cleared'; DHS.msgT = S.t; update(); }
const DHACT = { 'Record point': () => S.mode === 'dh' && dhRecord(), 'Clear table': () => S.mode === 'dh' && dhClear() };
(function(){ const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 600, (e.clientY - r.top) / r.height * 330]; };
  const hit = e => { const [x, y] = pos(e); return DHS.btn.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h); };
  cv.addEventListener('pointerdown', e => { const b = hit(e); if (b && DHACT[b.label]){ DHACT[b.label](); e.preventDefault(); } });
  cv.addEventListener('pointermove', e => { cv.style.cursor = S.mode === 'dh' && hit(e) ? 'pointer' : ''; });
  document.addEventListener('keydown', e => { if (e.ctrlKey || e.metaKey || e.altKey || S.mode !== 'dh') return; const k = e.key.toLowerCase(); if (k === 'r') dhRecord(); else if (k === 'c') dhClear(); }); })();
// best-fit line through the origin: y = m x
function fitOrigin(pts){ let sxy = 0, sxx = 0; pts.forEach(([x, y]) => { sxy += x * y; sxx += x * x; }); return sxx > 1e-12 ? sxy / sxx : null; }
function niceMax(x, list){ return list.find(n => n >= x) || Math.ceil(x); }

function workDH(v, d, opt){
  const pts = DHS.pts, n = pts.length;
  let h = '<h4>1 · Time to fall off the table</h4><p class="st">Launched horizontally, so it starts with no downward speed. The fall height is H:</p>' +
    TEX`H = \frac{1}{2}g t^2` + TEX`t = \sqrt{\frac{2H}{g}}` + TEX`t = \sqrt{\frac{2(${M.iv('H')})}{10\,\text{m/s}^2}}` + TEXA`t = ${M.n(d.t, 's')}` +
    '<h4>2 · Distance across the floor</h4><p class="st">Horizontal speed stays constant:</p>' + TEX`D = v_0\,t` +
    (d.mystery ? '<p class="st">The launch speed v₀ is hidden. You measure D with the ruler: ' + H.n(d.D, 'm') + '.</p>'
      : TEX`D = (${M.iv('vl')})(${M.n(d.t)})` + TEXA`D = ${M.n(d.D, 'm')}`) +
    '<h4>3 · Square it to get a straight line</h4>' + TEX`D^2 = v_0^2\,t^2 = v_0^2\,\frac{2H}{g}` + TEXA`D^2 = \left(\frac{2 v_0^2}{g}\right) H` +
    '<p class="st">That is y = m·x with y = D², x = H. A line through the origin with slope 2v₀²/g.</p>' +
    (d.mystery ? '' : TEX`\text{slope} = \frac{2 v_0^2}{g} = \frac{2(${M.iv('vl')})^2}{10\,\text{m/s}^2}` + TEXA`\text{slope} = ${M.n(d.slope, 'm')}`) +
    '<h4>4 · Your data</h4>';
  if (n < 2) return h + '<p class="st">Change H and use <b>Record point</b> on the picture (or press R) at 4 or more heights. Points so far: ' + n + '.</p>';
  const m = fitOrigin(pts.map(p => [p.H, p.D * p.D]));
  if (!m) return h + '<p class="st">Use different heights.</p>';
  const v0 = Math.sqrt(m * G10 / 2), mixed = pts.some(p => Math.abs(p.v0 - pts[0].v0) > 1e-9);
  h += '<p class="st">Best-fit line through the origin for your ' + n + ' points:</p>' + TEXA`\text{slope} = ${M.n(m, 'm')}` +
    '<h4>5 · Launch speed from the slope</h4>' + TEX`\text{slope} = \frac{2 v_0^2}{g}` + TEX`v_0 = \sqrt{\frac{\text{slope}\cdot g}{2}}` + TEX`v_0 = \sqrt{\frac{(${M.n(m)})(10)}{2}}` + TEXA`v_0 = ${M.n(v0, 'm/s')}`;
  if (mixed) h += '<div class="bad">You changed the launch speed between points, so they do not lie on one line. Clear the table and keep v₀ the same.</div>';
  else h += d.mystery ? '<p class="note">Switch Launch speed to “v₀ shown” to see how close you got.</p>' : '<p class="note">The launcher’s real v₀ is ' + H.n(d.v0, 'm/s') + ': your slope is off by ' + fnum(Math.abs(v0 - d.v0) / d.v0 * 100) + '%.</p>';
  return h;
}
function drawDH(v, d, opt, t, dt, A){
  DHS.btn = []; DHS.cur = { v, d };
  if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
  panelTitle('LAUNCHER LAB: BALL OFF A TABLE EDGE', 10, 18);
  const sc = 85, x0 = 70, gy = 262, X = m => x0 + m * sc, Y = m => gy - m * sc;
  // floor + ruler
  ctx.fillStyle = '#e6dccb'; ctx.fillRect(0, gy, 385, 4);
  ctx.fillStyle = '#f4e9b8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(x0, gy + 4, 3.5 * sc, 18); ctx.strokeRect(x0, gy + 4, 3.5 * sc, 18);
  ctx.lineWidth = 1; for (let c = 0; c <= 35; c++){ const lh = c % 10 === 0 ? 9 : c % 5 === 0 ? 7 : 4; ctx.beginPath(); ctx.moveTo(X(c / 10), gy + 4); ctx.lineTo(X(c / 10), gy + 4 + lh); ctx.stroke(); if (c % 5 === 0) text(c % 10 === 0 ? String(c / 10) : '', X(c / 10), gy + 20, { align: 'center', font: '500 9px ' + OPM }); }
  text('m', X(3.5) + 4, gy + 18, { font: '500 9px ' + OPM, col: '#4a4a4a' });
  // table
  const ty = Y(v.H); ctx.fillStyle = '#b89a6a'; ctx.fillRect(10, ty, x0 - 10, gy - ty); ctx.fillStyle = '#7a5c30'; ctx.fillRect(10, ty - 5, x0 - 10 + 4, 7);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.strokeRect(10, ty - 5, x0 - 10 + 4, gy - ty + 5);
  // H dimension
  ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0 + 14, ty); ctx.lineTo(x0 + 14, gy); ctx.stroke(); [[ty, 1], [gy, -1]].forEach(([yy, sg]) => { ctx.beginPath(); ctx.moveTo(x0 + 10, yy + sg * 6); ctx.lineTo(x0 + 14, yy); ctx.lineTo(x0 + 18, yy + sg * 6); ctx.stroke(); });
  text('H = ' + fplain(v.H) + ' m', 38, (ty + gy) / 2 + 4, { align: 'center', font: '700 11px ' + OPF, col: '#fff' });
  // launcher at the edge
  ctx.fillStyle = '#333'; ctx.fillRect(x0 - 26, ty - 14, 26, 9);
  // landing mark
  const lxm = X(d.D); ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(lxm - 5, gy - 5); ctx.lineTo(lxm + 5, gy + 5); ctx.moveTo(lxm + 5, gy - 5); ctx.lineTo(lxm - 5, gy + 5); ctx.stroke();
  // ball (animated, loops)
  const T = d.t, cyc = T + 1.2, tt = Math.min(A.t % cyc, T), pos = s => [d.v0 * s, v.H - 5 * s * s];
  ctx.strokeStyle = 'rgba(255,106,43,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = 0; k <= 60; k++){ const p = pos(T * k / 60); k ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])); } ctx.stroke();
  for (let s = 0; s <= tt + 1e-9; s += 0.05){ const p = pos(s); ctx.fillStyle = '#ffb38f'; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 2.5, 0, 7); ctx.fill(); }
  const p = pos(tt); ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]) - 0, 6, 0, 7); ctx.fill(); ctx.stroke();
  // D dimension on the floor
  ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, gy - 8); ctx.lineTo(lxm, gy - 8); ctx.stroke(); text('D = ' + fplain(d.D) + ' m', (x0 + lxm) / 2, gy - 12, { align: 'center', font: '700 12px ' + OPF, col: '#c43a00' });
  text(d.mystery ? 'v₀ = ? (hidden)' : 'v₀ = ' + fplain(d.v0) + ' m/s', 380, 18 + 14, { align: 'right', font: '700 12px ' + OPM, col: '#4a4a4a' });
  text('t = ' + fplain(d.t) + ' s', 380, 18 + 28, { align: 'right', font: '600 11px ' + OPM, col: '#4a4a4a' });
  // buttons
  btnDraw(14, 294, 96, 26, 'Record point', S.t - DHS.msgT < 0.25); btnDraw(118, 294, 90, 26, 'Clear table', false);
  if (S.t - DHS.msgT < 3.5) text(DHS.msg, 216, 311, { font: '600 10.5px ' + OPF, col: '#4a4a4a' }); else text('keys: R record, C clear', 216, 311, { font: '500 10px ' + OPM, col: '#8a8a8a' });
  // data table
  panelTitle('DATA TABLE', 395, 18);
  [['H (m)', 458], ['D (m)', 525], ['D² (m²)', 592]].forEach(([a, x]) => text(a, x, 33, { align: 'right', font: '700 10px ' + OPM, col: '#4a4a4a' }));
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(396, 37); ctx.lineTo(596, 37); ctx.stroke();
  DHS.pts.forEach((q, i) => { const y = 49 + i * 12; text(String(i + 1), 400, y, { font: '500 10px ' + OPM, col: '#8a8a8a' }); text(fplain(q.H), 458, y, { align: 'right', font: '600 11px ' + OPM }); text(q.D.toFixed(2), 525, y, { align: 'right', font: '600 11px ' + OPM }); text((q.D * q.D).toFixed(2), 592, y, { align: 'right', font: '600 11px ' + OPM }); });
  if (!DHS.pts.length) text('(empty: record a point)', 400, 53, { font: '500 10.5px ' + OPF, col: '#8a8a8a' });
  // plot D² vs H
  const q2 = DHS.pts.map(q => [q.H, q.D * q.D]), m = fitOrigin(q2);
  const ymax = niceMax(Math.max(1, ...q2.map(a => a[1]), d.D2) * 1.05, [1, 2, 4, 6, 8, 10, 12]);
  const px0 = 428, px1 = 584, py0 = 292, py1 = 196, PX = x => px0 + x / 2 * (px1 - px0), PY = y => py0 - y / ymax * (py0 - py1);
  panelTitle('D² (m²) vs H (m)', 395, 180);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px0, py1 - 4); ctx.lineTo(px0, py0); ctx.lineTo(px1 + 4, py0); ctx.stroke();
  [0, 1, 2].forEach(x => { text(String(x), PX(x), py0 + 12, { align: 'center', font: '500 9px ' + OPM, col: '#4a4a4a' }); ctx.strokeStyle = '#e3e0d6'; ctx.beginPath(); ctx.moveTo(PX(x), py0); ctx.lineTo(PX(x), py1); ctx.stroke(); });
  [0, ymax / 2, ymax].forEach(y => { text(fplain(y), px0 - 4, PY(y) + 3, { align: 'right', font: '500 9px ' + OPM, col: '#4a4a4a' }); ctx.strokeStyle = '#e3e0d6'; ctx.beginPath(); ctx.moveTo(px0, PY(y)); ctx.lineTo(px1, PY(y)); ctx.stroke(); });
  text('H (m)', px1 + 2, py0 + 24, { align: 'right', font: '700 10px ' + OPF });
  if (m !== null){ ctx.save(); ctx.beginPath(); ctx.rect(px0, py1 - 4, px1 - px0 + 4, py0 - py1 + 4); ctx.clip(); ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PX(0), PY(0)); ctx.lineTo(PX(2), PY(2 * m)); ctx.stroke(); ctx.restore();
    text('slope = ' + fplain(m) + ' m', 395, 150, { font: '600 11px ' + OPF, col: '#1546d6' }); text('v₀ = √(slope·g/2) ≈ ' + fplain(Math.sqrt(m * G10 / 2)) + ' m/s', 395, 164, { font: '700 11.5px ' + OPF, col: '#1546d6' }); }
  q2.forEach(([x, y]) => { ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(PX(x), PY(y), 3.8, 0, 7); ctx.fill(); ctx.stroke(); });
  if (m === null) text(DHS.pts.length ? 'need 2+ points for a line' : 'points will appear here', (px0 + px1) / 2, 245, { align: 'center', font: '500 10.5px ' + OPF, col: '#8a8a8a' });
}
