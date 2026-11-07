// ABP Graph Match: drive a walker to trace a target position–time or velocity–time graph (like the motion-detector "match the graph" lab). Original.
const fint = x => Number.isInteger(x) ? String(x) : (Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2)).replace(/\.?0+$/, '');
const lerpPts = (P, t) => { for (let i = 1; i < P.length; i++) if (t <= P[i][0]){ const [a, b] = [P[i - 1], P[i]]; return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0] || 1); } return P[P.length - 1][1]; };
// position targets: function of t (0..10 s), x in m (0..10)
const PT = [
  { f: t => 2 + 0.6 * t, story: ['0–10 s: straight line sloping up → walk away (forward) at a steady 0.6 m/s.'] },
  { f: t => lerpPts([[0, 8], [4, 8], [10, 2]], t), story: ['0–4 s: flat line → stand still at 8 m.', '4–10 s: straight line sloping down → walk back toward 0 at a steady 1 m/s.'] },
  { f: t => lerpPts([[0, 1], [3, 7], [6, 7], [10, 1]], t), story: ['0–3 s: steep line up → walk forward fast (2 m/s).', '3–6 s: flat → stand still at 7 m.', '6–10 s: line down → walk back slower (1.5 m/s).'] },
  { f: t => lerpPts([[0, 0], [2, 0], [6, 8], [10, 8]], t), story: ['0–2 s: flat at 0 → stand still.', '2–6 s: line up → walk forward at 2 m/s.', '6–10 s: flat at 8 m → stop and stand still.'] },
  { f: t => 1 + 0.08 * t * t, story: ['Curve that gets steeper → moving forward and <b>speeding up</b> (start slow, end fast).'] },
  { f: t => 1 + 1.6 * t - 0.08 * t * t, story: ['Curve that flattens out → moving forward and <b>slowing down</b> until you stop at 9 m.'] },
  { f: t => lerpPts([[0, 9], [2, 9], [5, 3], [7, 3], [10, 9]], t), story: ['0–2 s: flat at 9 m → stand still.', '2–5 s: line down → walk back at 2 m/s.', '5–7 s: flat at 3 m → stand still.', '7–10 s: line up → walk forward at 2 m/s.'] },
  { f: t => 9 - 0.08 * t * t, story: ['Curve going down that gets steeper → moving back toward 0 and <b>speeding up</b>.'] }];
// velocity targets: v(t) in m/s, start position x0
const VT = [
  { f: t => 1, x0: 0, story: ['Flat line above zero → steady velocity forward, 1 m/s.'] },
  { f: t => -0.8, x0: 9, story: ['Flat line below zero → steady velocity backward (toward 0), 0.8 m/s.'] },
  { f: t => t < 3 ? 0 : 1.2, x0: 0, story: ['0–3 s: on the zero line → standing still.', '3–10 s: flat at +1.2 → walk forward at a steady speed.'] },
  { f: t => 0.2 * t, x0: 0, story: ['Line going up from zero → moving forward and <b>speeding up</b> steadily (constant acceleration).'] },
  { f: t => 2 - 0.2 * t, x0: 0, story: ['Line going down toward zero → moving forward and <b>slowing down</b> until you stop.'] },
  { f: t => t < 5 ? 1 : -1, x0: 2, story: ['0–5 s: flat at +1 → walk forward at 1 m/s.', '5–10 s: flat at −1 → turn around and walk back at 1 m/s.'] },
  { f: t => 1.5 - 0.3 * t, x0: 1, story: ['A line that crosses zero: forward and slowing down, stopping at 5 s, then moving back and speeding up.'] },
  { f: t => t < 6 ? -0.5 : 0, x0: 8, story: ['0–6 s: flat at −0.5 → walk slowly backward.', '6–10 s: on the zero line → stand still.'] }];
const G = window._gm = window._gm || { run: false, done: false, tt: 0, rec: [], x: 5, v: 0, drag: false, score: null };
const tgt = (mode, q) => (mode === 'vt' ? VT : PT)[q - 1];
const tgtX = (mode, q, t) => { const T = tgt(mode, q); if (mode === 'pt') return T.f(t); let x = T.x0; const n = 200; for (let i = 0; i < n; i++) x += T.f(t * (i + 0.5) / n) * t / n; return x; };
const SIM = {
  title: 'Graph Match',
  hint: 'press Start, then drag to move',
  noGraph: true,
  modes: [{ id: 'pt', label: 'Match the position–time graph' }, { id: 'vt', label: 'Match the velocity–time graph' }],
  opts: [{ id: 'who', label: 'Who moves', choices: [['me', 'I drive'], ['demo', 'Show me the answer']] }],
  ivs(){ return [{ id: 'q', sym: '', symText: '#', label: 'Target graph', unit: '', show: x => '#' + x, min: 1, max: 8, step: 1, val: 1 }]; },
  calc(v, mode){ return { T: tgt(mode, v.q) }; },
  dvs(){ return [{ id: 'x', name: '—', short: '', sym: '', unit: '', noTag: true, f: () => 0 }]; },
  work(v, d, mode, opt){
    const how = mode === 'pt' ? '<h4>How to drive</h4><p class="st">Press <b>Start</b>. For 10 seconds, drag the walker left and right along the track. Your position is graphed in orange.</p>'
      : '<h4>How to drive</h4><p class="st">Press <b>Start</b>. For 10 seconds, drag the <b>speed lever</b>: right of center = moving forward (+), left = backward (−), center = standing still. Your velocity is graphed in orange.</p>';
    const read = mode === 'pt' ? '<p class="note">Reading a position–time graph: <b>flat</b> = standing still · <b>sloped line</b> = steady speed (steeper = faster) · <b>up</b> = moving forward, <b>down</b> = moving back · <b>curving steeper</b> = speeding up, <b>flattening</b> = slowing down.</p>'
      : '<p class="note">Reading a velocity–time graph: <b>on the zero line</b> = standing still · <b>flat above/below zero</b> = steady speed forward/backward · <b>sloping away from zero</b> = speeding up · <b>sloping toward zero</b> = slowing down.</p>';
    const res = G.done && G.mode === mode && G.q === v.q ? '<h4>Your match: ' + Math.round(G.score) + '%</h4><p class="st">' + (G.score >= 85 ? 'Great match!' : G.score >= 65 ? 'Close — look where the orange line drifts from the gray one.' : 'Try again — read the graph one piece at a time first.') + '</p>' : '';
    const story = G.done || opt.who === 'demo' ? '<h4>The story of target #' + v.q + '</h4><p class="st">' + d.T.story.join('<br>') + '</p>' : '<p class="note">Before you start: say out loud what the walker has to do in each part of the graph.</p>';
    return how + res + story + read;
  },
  draw(v, d, mode, opt, t, dt, A){
    const mono = '"IBM Plex Mono",monospace', sg = '"Space Grotesk",sans-serif', demo = opt.who === 'demo';
    if (G.mode !== mode || G.q !== v.q || G.who !== opt.who){ G.mode = mode; G.q = v.q; G.who = opt.who; G.run = false; G.done = false; G.rec = []; G.tt = 0; G.x = mode === 'vt' ? d.T.x0 : tgtX(mode, v.q, 0); G.v = 0; G.score = null; }
    const TX = x => 30 + x * 34, X2x = px => Math.max(0, Math.min(10, (px - 30) / 34)), LX = vv => 200 + vv * 80, LX2v = px => Math.max(-2, Math.min(2, Math.round((px - 200) / 80 * 10) / 10));
    if (!window._gmHook){ window._gmHook = 1; const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 600 / r.width, (e.clientY - r.top) * 330 / r.height]; };
      const act = (px, py) => { if (S.mode === 'pt'){ if (py < 100) G.x = X2x(px); } else if (py >= 66 && py <= 100) G.v = LX2v(px); };
      cv.addEventListener('pointerdown', e => { const [px, py] = pos(e); if (px > 470 && px < 585 && py > 34 && py < 64){ G.run = true; G.done = false; G.tt = 0; G.rec = []; G.x = S.mode === 'vt' ? tgt('vt', S.v.q).x0 : (S.opt.who === 'demo' ? tgtX('pt', S.v.q, 0) : G.x); G.v = 0; G.score = null; update(); return; } G.drag = true; try { cv.setPointerCapture(e.pointerId); } catch (er) {} act(px, py); });
      cv.addEventListener('pointermove', e => { if (G.drag){ const [px, py] = pos(e); act(px, py); } });
      cv.addEventListener('pointerup', () => { G.drag = false; }); cv.addEventListener('pointercancel', () => { G.drag = false; }); cv.style.touchAction = 'none'; }
    // advance the run
    if (G.run){ G.tt = Math.min(10, G.tt + dt);
      if (demo){ G.x = tgtX(mode, v.q, G.tt); G.v = mode === 'vt' ? d.T.f(G.tt) : 0; }
      else if (mode === 'vt'){ G.x = Math.max(0, Math.min(10, G.x + G.v * dt)); }
      G.rec.push([G.tt, mode === 'pt' ? G.x : G.v]);
      if (G.tt >= 10){ G.run = false; G.done = true; let e = 0; G.rec.forEach(([tt, y]) => { e += Math.abs(y - (mode === 'pt' ? d.T.f(tt) : d.T.f(tt))); }); e /= G.rec.length; G.score = Math.max(0, 100 - e / (mode === 'pt' ? 2 : 1) * 100); update(); } }
    // track
    panelTitle(mode === 'pt' ? 'DRAG THE WALKER' : 'DRAG THE SPEED LEVER', 10, 18);
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(20, 52, 360, 8); for (let m = 0; m <= 10; m++){ ctx.fillStyle = '#111'; ctx.fillRect(TX(m), 60, 1, 6); text(String(m), TX(m), 75, { align: 'center', font: '500 9px ' + mono }); } text('m', 384, 75, { font: '500 9px ' + mono });
    const wx = TX(G.x); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(wx, 32, 6, 0, 7); ctx.fill(); ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx, 38); ctx.lineTo(wx, 48); ctx.moveTo(wx - 6, 52); ctx.lineTo(wx, 46); ctx.lineTo(wx + 6, 52); ctx.stroke();
    if (mode === 'vt'){ ctx.fillStyle = '#f2f2f2'; ctx.fillRect(40, 82, 320, 12); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.strokeRect(40, 82, 320, 12); ctx.fillStyle = '#111'; ctx.fillRect(199, 78, 2, 20);
      text('← backward', 44, 104, { font: '600 9px ' + mono, col: '#4a4a4a' }); text('stand still', 200, 104, { align: 'center', font: '600 9px ' + mono, col: '#4a4a4a' }); text('forward →', 356, 104, { align: 'right', font: '600 9px ' + mono, col: '#4a4a4a' });
      ctx.fillStyle = '#1546d6'; ctx.fillRect(LX(G.v) - 6, 78, 12, 20); text((G.v > 0 ? '+' : '') + G.v.toFixed(1) + ' m/s', 366, 92, { align: 'left', font: '700 10px ' + mono, col: '#1546d6' }); }
    // start / status
    ctx.fillStyle = G.run ? '#bbb' : '#111'; ctx.fillRect(472, 36, 112, 26); text(G.run ? 'running…' : (G.done ? '↻ Again' : '▶ Start'), 528, 54, { align: 'center', font: '700 13px ' + sg, col: '#fff' });
    text('t = ' + G.tt.toFixed(1) + ' s', 472, 80, { font: '700 12px ' + mono }); if (G.done) text('match: ' + Math.round(G.score) + '%', 472, 98, { font: '700 13px ' + mono, col: '#c43a00' });
    // graph
    const gx0 = 50, gx1 = 585, gy0 = 130, gy1 = 312, ymin = mode === 'pt' ? 0 : -2.5, ymax = mode === 'pt' ? 10 : 2.5, GX = tt => gx0 + (gx1 - gx0) * tt / 10, GY = y => gy1 - (gy1 - gy0) * (y - ymin) / (ymax - ymin);
    ctx.strokeStyle = '#eee'; ctx.lineWidth = 1; for (let s = 0; s <= 10; s++){ ctx.beginPath(); ctx.moveTo(GX(s), gy0); ctx.lineTo(GX(s), gy1); ctx.stroke(); text(String(s), GX(s), gy1 + 11, { align: 'center', font: '500 9px ' + mono }); }
    const step = mode === 'pt' ? 2 : 0.5; for (let y = ymin; y <= ymax + 1e-9; y += step){ ctx.strokeStyle = Math.abs(y) < 1e-9 && mode === 'vt' ? '#111' : '#eee'; ctx.beginPath(); ctx.moveTo(gx0, GY(y)); ctx.lineTo(gx1, GY(y)); ctx.stroke(); text(fint(+y.toFixed(1)), gx0 - 4, GY(y) + 3, { align: 'right', font: '500 9px ' + mono }); }
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx0, gy1); ctx.lineTo(gx1, gy1); ctx.stroke();
    text(mode === 'pt' ? 'position (m)' : 'velocity (m/s)', gx0 + 4, gy0 - 4, { font: '700 10px ' + mono }); text('time (s)', gx1, gy1 - 4, { align: 'right', font: '700 10px ' + mono });
    ctx.strokeStyle = 'rgba(17,17,17,0.35)'; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.beginPath(); for (let k = 0; k <= 200; k++){ const tt = 10 * k / 200, y = d.T.f(tt); k ? ctx.lineTo(GX(tt), GY(y)) : ctx.moveTo(GX(tt), GY(y)); } ctx.stroke();
    if (G.rec.length > 1){ ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2.5; ctx.beginPath(); G.rec.forEach(([tt, y], i) => i ? ctx.lineTo(GX(tt), GY(y)) : ctx.moveTo(GX(tt), GY(y))); ctx.stroke(); }
    if (G.run){ ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(GX(G.tt), gy0); ctx.lineTo(GX(G.tt), gy1); ctx.stroke(); ctx.setLineDash([]); }
    if (!G.run && !G.done){ text(mode === 'pt' ? 'Drag the walker to the start (' + fint(+d.T.f(0).toFixed(1)) + ' m), then press Start' : 'You start at ' + fint(d.T.x0) + ' m. Press Start, then use the lever.', 318, 140, { align: 'center', font: '700 11px ' + mono, col: '#c43a00' }); }
  }
};
