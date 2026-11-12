// Ruler-Drop Reaction Timer (kinematics, d = ½gt²): catch a falling metre ruler, read d, get your reaction time t = √(2d/g). A second mode converts any catch distance to a time and draws the reaction-time strip.
const RDF = '"Space Grotesk",sans-serif', RDM = '"IBM Plex Mono",monospace';
const RD = { phase: 'idle', wait0: 0, rel: 0, d: null, msg: '', trials: [], endAt: -9, btn: [], spaceUsed: false };
const rdNow = () => performance.now() / 1000;
const RDK = 2.4, RDYC = 276, RDX0 = 130, RDW = 30;   // px per cm of ruler, y of the catching fingers, ruler left edge and width
const rdT = dcm => Math.sqrt(2 * (dcm / 100) / 10);   // d = ½ g t²  →  t = √(2d/g), g = 10

const SIM = {
  title: 'Ruler-Drop Reaction Timer',
  hint: 'd = ½gt² → t = √(2d/g) · g = 10 m/s²',
  modes: [{ id: 'game', label: 'Catch the ruler' }, { id: 'table', label: 'Ruler to time (conversion)' }],
  ivs(mode){
    return [{ id: 'd', sym: 'd', symText: 'd', label: mode === 'game' ? 'Example catch distance' : 'Catch distance', unit: 'cm', min: 1, max: 100, step: 0.5, val: mode === 'game' ? 20 : 23, graph: true }];
  },
  presets: [{ label: 'Quick (10 cm)', mode: 'table', v: { d: 10 } }, { label: 'Typical (22 cm)', mode: 'table', v: { d: 22 } }, { label: 'Slow (40 cm)', mode: 'table', v: { d: 40 } }],
  calc(v, mode){
    const tr = RD.trials.slice(-5), ts = tr.map(x => x.t), n = ts.length, mean = n ? ts.reduce((a, b) => a + b, 0) / n : NaN, mn = n ? Math.min(...ts) : NaN, mx = n ? Math.max(...ts) : NaN;
    return { d: v.d, t: rdT(v.d), tr, ts, n, mean, mn, mx, rng: mx - mn };
  },
  dvs(mode){ return [{ id: 't', name: 'Reaction time', short: 't', sym: 't', unit: 's', f: d => d.t }]; },
  work(v, d, mode){ return mode === 'table' ? workTable(v, d) : workGame(v, d); },
  draw(v, d, mode, opt, t, dt, A){ if (mode === 'table') drawTable(v, d); else drawGame(v, d); }
};

function workGame(v, d){
  let h = '<h4>1 · The idea</h4><p class="st">The ruler starts at rest and falls freely, so it drops a distance d in time t:</p>' + TEX`d = \frac{1}{2}\,g\,t^2` + '<p class="st">Solve for the time you took to catch it:</p>' + TEX`t = \sqrt{\frac{2d}{g}}`;
  h += '<h4>2 · Your last catch</h4>';
  const last = d.tr[d.tr.length - 1];
  if (!last) h += '<p class="st">No catches yet. Press <b>Start</b> (or Space), wait for the ruler to drop, then hit <b>Catch!</b> (or Space).</p>';
  else h += '<p class="st">Read d off the ruler at your fingers (in metres):</p>' + TEX`t = \sqrt{\frac{2\,(${M.n(last.d / 100, 'm')})}{${M.n(10, 'm/s²')}}}` + TEXA`t = ${M.n(last.t, 's')}`;
  h += '<h4>3 · Mean and spread</h4>';
  if (!d.n) h += '<p class="st">Catch a few times (the last 5 are kept).</p>';
  else {
    const sum = '<mrow>' + d.ts.map(x => M.num(x)).join('<mo>+</mo>') + '</mrow>';
    h += (d.n > 1 ? '<p class="st">Average of your last ' + d.n + ' catches:</p>' + TEX`\bar{t} = \frac{t_1 + t_2 + \dots}{n}` + TEX`\bar{t} = \frac{${sum}}{${M.n(d.n)}}` : '<p class="st">One catch so far:</p>') + TEXA`\bar{t} = ${M.n(d.mean, 's')}`;
    if (d.n > 1) h += '<p class="st">Spread (how much your trials vary):</p>' + TEX`\text{range} = t_{\max} - t_{\min}` + TEX`\text{range} = ${M.n(d.mx)} - ${M.n(d.mn)}` + TEXA`\text{range} = ${M.n(d.rng, 's')}`;
  }
  h += '<h4>4 · Try any distance</h4><p class="st">If you caught it at d = ' + H.iv('d') + ':</p>' + TEX`t = \sqrt{\frac{2\,(${M.iv('d', 0.01)}\,\text{m})}{${M.n(10, 'm/s²')}}}` + TEXA`t = ${M.n(d.t, 's')}`;
  return h + '<p class="note">Your time includes your reaction, the screen and the mouse click, so it runs a bit longer than a hand catch.</p>';
}
function workTable(v, d){
  const tm = 0.2;
  let h = '<h4>1 · From distance to time</h4><p class="st">A dropped ruler starts from rest and falls freely:</p>' + TEX`d = \frac{1}{2}\,g\,t^2` + TEX`t = \sqrt{\frac{2d}{g}}`;
  h += '<h4>2 · Your catch</h4><p class="st">Catch at d = ' + H.iv('d') + ' = ' + H.n(v.d / 100, 'm') + ':</p>' + TEX`t = \sqrt{\frac{2\,(${M.iv('d', 0.01)}\,\text{m})}{${M.n(10, 'm/s²')}}}` + TEX`t = \sqrt{${M.n(2 * v.d / 100 / 10)}}` + TEXA`t = ${M.n(d.t, 's')}`;
  h += '<h4>3 · Making the strip</h4><p class="st">To mark a ruler for a reaction time, go the other way. For t = 0.20 s:</p>' + TEX`d = \frac{1}{2}\,g\,t^2` + TEX`d = \frac{1}{2}\,(${M.n(10)})\,(${M.n(tm)})^2` + TEXA`d = ${M.n(0.5 * 10 * tm * tm, 'm')} = ${M.n(0.5 * 10 * tm * tm * 100, 'cm')}`;
  return h + '<p class="note">The marks bunch up at the bottom and spread out higher up, because d grows with t². Double the time and the ruler falls four times as far.</p>';
}

function rdStart(){ if (RD.phase === 'wait' || RD.phase === 'fall') return; RD.phase = 'wait'; RD.wait0 = rdNow(); RD.rel = RD.wait0 + 1 + 2 * Math.random(); RD.d = null; RD.msg = ''; }
function rdCatch(ts){
  if (RD.phase !== 'wait' && RD.phase !== 'fall') return;
  if (ts < RD.rel + 0.1){ RD.phase = 'early'; RD.endAt = rdNow(); RD.msg = ts < RD.rel ? 'Wait for the ruler to move.' : 'That was a guess: react to the drop.'; return; }
  const cm = 500 * (ts - RD.rel) * (ts - RD.rel), d = Math.max(0.5, Math.round(cm * 2) / 2);
  RD.endAt = rdNow();
  if (d > 100){ RD.phase = 'missed'; RD.msg = 'The ruler fell past 100 cm.'; return; }
  RD.d = d; RD.phase = 'caught'; RD.trials.push({ d, t: rdT(d) }); if (RD.trials.length > 5) RD.trials.shift(); RD.msg = ''; update();
}
function rdClear(){ RD.trials.length = 0; RD.phase = 'idle'; RD.d = null; RD.msg = ''; update(); }
const RDACT = { 'Start': () => S.mode === 'game' && rdStart(), 'Catch!': () => S.mode === 'game' && rdCatch(performance.now() / 1000), 'Clear trials': () => S.mode === 'game' && rdClear() };
(function(){
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 600, (e.clientY - r.top) / r.height * 330]; };
  const hit = e => { const [x, y] = pos(e); return RD.btn.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h); };
  cv.addEventListener('pointerdown', e => { const b = hit(e); if (!b || !RDACT[b.label]) return; e.preventDefault();
    if (b.label === 'Catch!') rdCatch(e.timeStamp / 1000); else RDACT[b.label](); });
  cv.addEventListener('pointermove', e => { cv.style.cursor = hit(e) ? 'pointer' : ''; });
  document.addEventListener('keydown', e => {
    if (S.mode !== 'game' || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    const tg = e.target && e.target.tagName, sp = e.key === ' ' || e.code === 'Space', busy = RD.phase === 'wait' || RD.phase === 'fall';
    if (sp && busy){ e.preventDefault(); RD.spaceUsed = true; rdCatch(e.timeStamp / 1000); return; }
    if (tg === 'BUTTON' || tg === 'SELECT') return;
    if ((sp || e.key === 'Enter' || e.key.toLowerCase() === 's') && !busy && rdNow() - RD.endAt > 0.6){ e.preventDefault(); rdStart(); }
  });
  document.addEventListener('keyup', e => { if (RD.spaceUsed && (e.key === ' ' || e.code === 'Space')){ e.preventDefault(); RD.spaceUsed = false; } });
})();
function btnDraw(x, y, w, h, label, hot, off){ RD.btn.push({ x, y, w, h, label }); ctx.save(); ctx.fillStyle = hot ? '#ff6a2b' : off ? '#eee' : '#fff'; ctx.strokeStyle = off ? '#999' : '#111'; ctx.lineWidth = 2; ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); ctx.restore();
  text(label, x + w / 2, y + h / 2 + (h > 40 ? 7 : 4.5), { align: 'center', font: '700 ' + (h > 40 ? 20 : 12) + 'px ' + RDF, col: hot ? '#fff' : off ? '#999' : '#111' }); }

// ruler: off = how far it has fallen (cm). strip = draw the reaction-time strip. mark = catch distance marker (cm) or null.
function drawRuler(off, strip){
  const x0 = RDX0, x1 = x0 + RDW, y = h => RDYC - h * RDK + off * RDK;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 24, 386, 302); ctx.clip();
  ctx.fillStyle = '#f4e9b8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(x0, y(100), RDW, 100 * RDK); ctx.strokeRect(x0, y(100), RDW, 100 * RDK);
  ctx.lineWidth = 1; for (let c = 0; c <= 100; c++){ const lh = c % 10 === 0 ? 11 : c % 5 === 0 ? 7 : 4; ctx.beginPath(); ctx.moveTo(x1, y(c)); ctx.lineTo(x1 - lh, y(c)); ctx.stroke(); if (c % 10 === 0 && c > 0 && c < 100) text(String(c), x0 + 3, y(c) + 3.5, { font: '500 9.5px ' + RDM }); }
  text('0', x0 + 3, y(0) - 3, { font: '500 9.5px ' + RDM }); text('100', x0 + 3, y(100) + 12, { font: '500 9.5px ' + RDM });
  if (strip){
    ctx.fillStyle = '#f3edf9'; ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 1.2; ctx.fillRect(x1, y(100), 74, 100 * RDK); ctx.strokeRect(x1, y(100), 74, 100 * RDK);
    [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4].forEach(tt => { const yy = y(500 * tt * tt); ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x1, yy); ctx.lineTo(x1 + 16, yy); ctx.stroke(); text(tt.toFixed(2) + ' s', x1 + 20, yy + 3.5, { font: '700 10.5px ' + RDM, col: '#7a3fb0' }); });
  }
  ctx.restore();
}
function drawHand(gap, yc){
  // forearm and palm on the left; two pads reach the ruler's left edge
  const px = RDX0 - 4;
  ctx.fillStyle = '#e9b98f'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.6;
  ctx.fillRect(2, yc - 26, 44, 52); ctx.strokeRect(2, yc - 26, 44, 52);
  ctx.beginPath(); ctx.rect(46, yc - 30, 44, 60); ctx.fill(); ctx.stroke();
  [[-1, 'index finger'], [1, 'thumb']].forEach(([sg]) => { const yy = sg < 0 ? yc - gap - 13 : yc + gap; ctx.fillRect(90, yy, px - 90, 13); ctx.strokeRect(90, yy, px - 90, 13); });
}
function rdMarker(yc){ ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(RDX0 - 6, yc); ctx.lineTo(RDX0 + RDW + 6, yc); ctx.stroke(); ctx.setLineDash([]); }

function drawGame(v, d){
  RD.btn = [];
  const now = rdNow();
  if (RD.phase === 'wait' && now >= RD.rel) RD.phase = 'fall';
  let off = 0;
  if (RD.phase === 'fall' || RD.phase === 'missed'){ off = 500 * (now - RD.rel) * (now - RD.rel); if (RD.phase === 'fall' && off > 100){ RD.phase = 'missed'; RD.endAt = now; RD.msg = 'The ruler fell past 100 cm.'; } }
  if (RD.phase === 'caught') off = RD.d;
  panelTitle('RULER DROP', 10, 18);
  drawRuler(off, false);
  const closed = RD.phase === 'caught', yc = RDYC;
  drawHand(closed ? 0 : 7, yc);
  if (closed){ rdMarker(yc); text('d = ' + fplain(RD.d) + ' cm', 6, yc - 40, { font: '700 12px ' + RDM, col: '#c43a00' }); }
  text('fingers here', 6, yc + 44, { font: '500 10px ' + RDM, col: '#8a8a8a' });
  // status
  const X = 200, ph = RD.phase;
  if (ph === 'idle'){ text('Press Start (or Space).', X, 54, { font: '700 16px ' + RDF }); text('Catch the ruler the instant', X, 76, { font: '600 13px ' + RDF, col: '#4a4a4a' }); text('it starts to fall.', X, 92, { font: '600 13px ' + RDF, col: '#4a4a4a' }); }
  else if (ph === 'wait'){ text('Get ready…', X, 58, { font: '700 22px ' + RDF, col: '#4a4a4a' }); text('Wait for the drop. No guessing!', X, 80, { font: '600 12.5px ' + RDF, col: '#4a4a4a' }); }
  else if (ph === 'fall') text('GO!', X, 66, { font: '700 40px ' + RDF, col: '#ff6a2b' });
  else if (ph === 'early'){ text('Too early!', X, 58, { font: '700 26px ' + RDF, col: '#c43a00' }); text(RD.msg, X, 80, { font: '600 13px ' + RDF, col: '#c43a00' }); text('Not counted. Press Start.', X, 98, { font: '600 13px ' + RDF, col: '#4a4a4a' }); }
  else if (ph === 'missed'){ text('Missed!', X, 58, { font: '700 26px ' + RDF, col: '#c43a00' }); text(RD.msg, X, 80, { font: '600 13px ' + RDF, col: '#c43a00' }); text('Press Start to try again.', X, 98, { font: '600 13px ' + RDF, col: '#4a4a4a' }); }
  else { text('Caught at d = ' + fplain(RD.d) + ' cm', X, 52, { font: '700 17px ' + RDF, col: '#1e7d45' });
    text('t = √(2d/g) = ' + fplain(rdT(RD.d)) + ' s', X, 76, { font: '700 12.5px ' + RDM, col: '#1546d6' }); text('Press Start to go again.', X, 98, { font: '600 13px ' + RDF, col: '#4a4a4a' }); }
  const busy = ph === 'wait' || ph === 'fall';
  btnDraw(X, 214, 84, 32, 'Start', false, busy); btnDraw(292, 214, 88, 32, 'Clear trials', false, false);
  btnDraw(X, 258, 180, 56, 'Catch!', ph === 'fall', !busy);
  text('keys: Space = catch, Enter = start', X, 326, { font: '500 10px ' + RDM, col: '#8a8a8a' });
  // trials table
  panelTitle('LAST 5 TRIALS', 395, 18);
  [['d(cm)', 470], ['t(s)', 540]].forEach(([a, x]) => text(a, x, 33, { align: 'right', font: '700 9.5px ' + RDM, col: '#4a4a4a' }));
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(396, 37); ctx.lineTo(596, 37); ctx.stroke();
  d.tr.forEach((r, i) => { const y = 51 + i * 15, f = { align: 'right', font: '600 12px ' + RDM }; text(String(i + 1), 400, y, { font: '500 10px ' + RDM, col: '#8a8a8a' }); text(fplain(r.d), 470, y, f); text(fplain(r.t), 540, y, f); });
  if (!d.n) text('(no catches yet)', 400, 53, { font: '500 10.5px ' + RDF, col: '#8a8a8a' });
  ctx.beginPath(); ctx.moveTo(396, 118); ctx.lineTo(596, 118); ctx.stroke();
  if (d.n){ text('mean t = ' + fplain(d.mean) + ' s', 395, 136, { font: '700 13px ' + RDF, col: '#1546d6' });
    text('range = ' + fplain(d.rng) + ' s  (' + fplain(d.mn) + ' to ' + fplain(d.mx) + ')', 395, 152, { font: '600 11.5px ' + RDF, col: '#4a4a4a' }); }
  // number line of the trials
  const a0 = 0.1, a1 = 0.5, ax0 = 410, ax1 = 580, AX = tt => ax0 + (Math.min(a1, Math.max(a0, tt)) - a0) / (a1 - a0) * (ax1 - ax0), ay = 214;
  panelTitle('YOUR TIMES (s)', 395, 180);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ax0, ay); ctx.lineTo(ax1, ay); ctx.stroke();
  [0.1, 0.2, 0.3, 0.4, 0.5].forEach(tt => { ctx.beginPath(); ctx.moveTo(AX(tt), ay - 3); ctx.lineTo(AX(tt), ay + 3); ctx.stroke(); text(tt.toFixed(1), AX(tt), ay + 15, { align: 'center', font: '500 9.5px ' + RDM, col: '#4a4a4a' }); });
  if (d.n > 1){ ctx.fillStyle = 'rgba(21,70,214,0.18)'; ctx.fillRect(AX(d.mn), ay - 14, AX(d.mx) - AX(d.mn), 28); }
  d.ts.forEach(tt => { ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(AX(tt), ay - 7, 4.2, 0, 7); ctx.fill(); ctx.stroke(); });
  if (d.n){ ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(AX(d.mean), ay - 16); ctx.lineTo(AX(d.mean), ay + 6); ctx.stroke(); text('mean', AX(d.mean), ay - 20, { align: 'center', font: '700 10px ' + RDM, col: '#1546d6' }); }
  text('Time includes click lag.', 395, 262, { font: '500 10.5px ' + RDF, col: '#8a8a8a' });
  text('Fast catches: 0.15–0.25 s', 395, 276, { font: '500 10.5px ' + RDF, col: '#8a8a8a' });
}

function drawTable(v, d){
  RD.btn = [];
  panelTitle('RULER → REACTION TIME', 10, 18);
  const yc = RDYC - v.d * RDK;
  drawRuler(0, true); drawHand(0, yc); rdMarker(yc);
  ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(RDX0 + RDW, yc); ctx.lineTo(RDX0 + RDW + 80, yc); ctx.stroke(); ctx.setLineDash([]);
  const ty = Math.max(70, Math.min(250, yc));
  text('d = ' + fplain(v.d) + ' cm', 252, ty - 6, { font: '700 15px ' + RDF, col: '#c43a00' });
  text('t = ' + fplain(d.t) + ' s', 252, ty + 14, { font: '700 17px ' + RDM, col: '#1546d6' });
  text('t = √(2d/g)', 252, 50, { font: '700 13px ' + RDM, col: '#4a4a4a' });
  text('Slide d: the orange line', 252, 290, { font: '500 10.5px ' + RDF, col: '#8a8a8a' }); text('moves up the ruler.', 252, 303, { font: '500 10.5px ' + RDF, col: '#8a8a8a' });
  text('fingers', 6, yc + 44, { font: '500 10px ' + RDM, col: '#8a8a8a' });
  text('cm', RDX0 + 3, 33, { font: '500 9.5px ' + RDM, col: '#4a4a4a' });
  text('s', RDX0 + RDW + 4, 33, { font: '700 9.5px ' + RDM, col: '#7a3fb0' });
  // conversion table
  panelTitle('CONVERSION TABLE (g = 10)', 395, 18);
  const L = [5, 10, 15, 20, 25, 30, 35, 40], R = [45, 50, 60, 70, 80, 90, 100];
  [[395, 'd(cm)', 't(s)'], [500, 'd(cm)', 't(s)']].forEach(([x]) => { text('d(cm)', x + 50, 33, { align: 'right', font: '700 9.5px ' + RDM, col: '#4a4a4a' }); text('t(s)', x + 96, 33, { align: 'right', font: '700 9.5px ' + RDM, col: '#4a4a4a' }); });
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(396, 37); ctx.lineTo(596, 37); ctx.stroke();
  [[L, 395], [R, 500]].forEach(([arr, x]) => arr.forEach((dd, i) => { const y = 52 + i * 16, near = Math.abs(dd - v.d) <= 2.5; if (near){ ctx.fillStyle = '#ffe2d3'; ctx.fillRect(x - 2, y - 12, 104, 16); } const f = { align: 'right', font: '600 12px ' + RDM }; text(String(dd), x + 50, y, f); text(rdT(dd).toFixed(2), x + 96, y, f); }));
  text('Print-style strip: tape the purple', 395, 196, { font: '500 10.5px ' + RDF, col: '#4a4a4a' }); text('marks next to a real ruler.', 395, 210, { font: '500 10.5px ' + RDF, col: '#4a4a4a' });
  text('Most people land at 15–30 cm', 395, 238, { font: '600 11px ' + RDF, col: '#4a4a4a' }); text('(about 0.17–0.25 s).', 395, 252, { font: '600 11px ' + RDF, col: '#4a4a4a' });
}
