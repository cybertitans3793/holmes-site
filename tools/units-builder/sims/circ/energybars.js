// Energy bar charts (AP 1 energy, the "LOL diagram"): initial energy + work by outside forces = final energy. Drag the bars; choose the system. Original.
const EB = window._eb = window._eb || { ans: {}, chk: {}, rev: {}, sys: { D: true, S: false, E: false }, hit: [], drag: null, cols: [], mode: 'build', sc: 1 };
const EBK = { K: '#1e7d45', Ug: '#1546d6', Us: '#7a3fb0', Eth: '#c43a00', W: '#ff6a2b' };
const EBF = '"Space Grotesk",sans-serif', EBM = '"IBM Plex Mono",monospace';
const EBY = { top: 124, cell: 13, zero: 228, rows: 13, minN: -5 };   // grid: +8 at the top; build mode goes down to -5, system mode to -8
const ebn = x => '<mn>' + x + '</mn>', ebp = x => x < 0 ? '<mrow><mo>(</mo><mn>−' + (-x) + '</mn><mo>)</mo></mrow>' : ebn(x), ebb = x => '<mrow>' + ebn(x) + M.u('blocks') + '</mrow>';
// order of bars: Ki, Ug,i, Us,i, W, Kf, Ug,f, Us,f, Eth
const EBS = [
  { n: 'Ball dropped', sys: 'ball + Earth', story: 'A ball is released from rest and falls. Look at it just before it lands.', a: [0, 4, 0, 0, 4, 0, 0, 0],
    why: 'The ball and Earth are both in the system, so gravity is an inside force: no work from outside. Gravitational energy turns into kinetic energy.' },
  { n: 'Block slides to a stop', sys: 'block + floor', story: 'A block slides across a rough floor and comes to rest.', a: [6, 0, 0, 0, 0, 0, 0, 6],
    why: 'Nothing outside pushes. Friction is inside the block + floor system, so all the kinetic energy becomes thermal energy.' },
  { n: 'Spring launches a cart', sys: 'cart + spring + Earth', story: 'A compressed spring shoots a cart up a smooth ramp. At the top it is still moving.', a: [0, 0, 6, 0, 2, 4, 0, 0],
    why: 'Spring, cart and Earth are all inside, so no outside work. The spring energy ends up as height (Ug) and speed (K). The ramp is smooth, so no thermal.' },
  { n: 'Roller coaster car', sys: 'car + track + Earth', story: 'A car starts at rest on the hill and goes over the top of the loop. Rubbing warms the track a little.', a: [0, 8, 0, 0, 2, 5, 0, 1],
    why: 'No outside work. Some Ug turns into K, and a little into thermal energy from friction and air.' },
  { n: 'Ball thrown straight up', sys: 'ball only', story: 'A ball leaves your hand moving up. Look at it at its highest point.', a: [5, 0, 0, -5, 0, 0, 0, 0],
    why: 'Earth is NOT in the system, so there is no Ug bar. Gravity is an outside force that does negative work as the ball rises: it takes the kinetic energy away.' },
  { n: 'Crate pushed up a ramp', sys: 'crate + ramp + Earth', story: 'You push a crate up a rough ramp at nearly constant speed.', a: [1, 0, 0, 6, 1, 4, 0, 2],
    why: 'Your push is an outside force and does positive work. It raises the crate (Ug) and heats the ramp and crate (thermal). K stays about the same.' }
];
const EBC = ['Ki', 'Ugi', 'Usi', 'W', 'Kf', 'Ugf', 'Usf', 'Eth'];

const SIM = {
  title: 'Energy Bar Charts',
  hint: '1 block = a set number of joules · g = 10 m/s²',
  modes: [{ id: 'build', label: 'Build the bar chart' }, { id: 'system', label: 'Choose the system' }],
  ivs(mode){
    const u = { id: 'u', sym: 'u', symText: 'J per block', label: 'Energy in one block', unit: 'J', min: 5, max: 50, step: 5, val: 10, show: x => x + ' J' };
    if (mode === 'system') return [{ id: 'e', sym: 'E', symText: 'E (blocks)', label: 'Spring energy', unit: 'blocks', min: 2, max: 8, step: 1, val: 6, graph: true, show: x => x + ' blocks' }, u];
    return [{ id: 'sc', sym: '', symText: 'scenario', label: 'Scenario', unit: '', min: 1, max: 6, step: 1, val: 1, show: x => x + ' of 6' }, u];
  },
  presets: [
    { label: 'Dropped ball', mode: 'build', v: { sc: 1 } }, { label: 'Spring + ramp', mode: 'build', v: { sc: 3 } },
    { label: 'Thrown ball (system = ball)', mode: 'build', v: { sc: 5 } }
  ],
  calc(v, mode){
    const u = v.u;
    if (mode === 'system'){
      const e = v.e, s = EB.sys, D = s.D, S = s.S, E = s.E;
      const out = { mode, e, u, D, S, E, ok: D, Ki: 0, Kf: 0, Ugi: E ? 0 : null, Ugf: E ? e : null, Usi: S ? e : null, Usf: S ? 0 : null, Ws: S ? null : e, Wg: E ? null : -e, Eth: 0 };
      out.Wext = (out.Ws || 0) + (out.Wg || 0);
      out.Etot = out.Ki + (out.Ugi || 0) + (out.Usi || 0) + out.Wext;
      return out;
    }
    const sc = Math.max(1, Math.min(6, Math.round(v.sc))), s = EBS[sc - 1], a = s.a;
    return { mode, sc, s, a, u, L: a[0] + a[1] + a[2] + a[3], R: a[4] + a[5] + a[6] + a[7] };
  },
  dvs(mode){
    if (mode === 'system') return [
      { id: 'E', name: 'Spring energy (J)', short: 'E', sym: 'E', unit: 'J', f: d => d.e * d.u },
      { id: 'W', name: 'Work by the spring (J)', short: 'W', sym: 'W', unit: 'J', noTag: true, f: d => (d.Ws || 0) * d.u }
    ];
    return [
      { id: 'T', name: 'Tallest bar (J)', short: 'tallest', sym: 'E', unit: 'J', noTag: true, f: d => Math.max(...d.a.map(Math.abs)) * d.u },
      { id: 'K', name: 'Final kinetic energy (J)', short: 'Kf', sym: 'Kf', unit: 'J', noTag: true, f: d => d.a[4] * d.u }
    ];
  },
  work(v, d, mode){
    const fin = (L, R) => TEXA`${ebb(L)} = ${ebb(R)}` + TEX`${ebb(L)} \times ${M.iv('u')} = ${'<mrow>' + ebn(L * d.u) + M.u('J') + '</mrow>'}`;
    if (mode === 'system'){
      const e = d.e;
      if (!d.D) return '<h4>1 · Pick the system</h4><p class="st">Tick <b>Dart</b> first: the dart is the object whose energy we are following. Then add the spring and Earth to see how the chart changes.</p>';
      const nm = ['dart'].concat(d.S ? ['spring + gun'] : []).concat(d.E ? ['Earth'] : []).join(' + ');
      const head = '<h4>1 · The system</h4><p class="st">System: <b>' + nm + '</b>. The spring starts compressed with <b>' + e + ' blocks</b> of energy (' + (e * d.u) + ' J). We follow the dart from launch to the top of its flight, where it stops for an instant.</p>' +
        '<h4>2 · Energy conservation</h4>';
      let body;
      if (d.S && d.E) body = TEX`K_i + U_{s,i} = K_f + U_{g,f}` + TEX`${ebn(0)} + ${ebn(e)} = ${ebn(0)} + ${ebn(e)}` + fin(e, e) +
        '<h4>3 · Why it balances</h4><p class="st">Everything that pushes or pulls is inside the system, so there is <b>no outside work</b>. The spring energy simply becomes gravitational energy.</p>';
      else if (d.S) body = TEX`K_i + U_{s,i} + W_{\text{grav}} = K_f` + TEX`${ebn(0)} + ${ebn(e)} + ${ebp(-e)} = ${ebn(0)}` + fin(0, 0) +
        '<h4>3 · Why it balances</h4><p class="st">Earth is outside, so gravity is an outside force. It pulls down while the dart goes up: <b>negative work</b>. The spring energy leaves as kinetic energy, and gravity takes it all back, so K is 0 at the top.</p>';
      else if (d.E) body = TEX`K_i + W_{\text{spring}} = K_f + U_{g,f}` + TEX`${ebn(0)} + ${ebn(e)} = ${ebn(0)} + ${ebn(e)}` + fin(e, e) +
        '<h4>3 · Why it balances</h4><p class="st">The spring is outside, so it does <b>positive work</b> on the dart as it expands. That energy comes in from outside and is stored as Ug (dart + Earth). Gravity is now inside, so it does no work.</p>';
      else body = TEX`K_i + W_{\text{spring}} + W_{\text{grav}} = K_f` + TEX`${ebn(0)} + ${ebn(e)} + ${ebp(-e)} = ${ebn(0)}` + fin(0, 0) +
        '<h4>3 · Why it balances</h4><p class="st">With only the dart in the system, both the spring and gravity are outside. The spring does <b>+' + e + ' blocks</b> of work, gravity does <b>−' + e + ' blocks</b>. They cancel, and the dart is at rest at both ends.</p>';
      return head + body + '<p class="note">Four different charts, one real event. The choice of system changes what is called “stored” and what is called “work”, never the physics. There is no friction, so no thermal energy.</p>';
    }
    const s = d.s, a = d.a, rv = EB.rev[d.sc] || EB.chk[d.sc];
    let h = '<h4>1 · The system</h4><p class="st"><b>' + s.sys + '</b> (scenario ' + d.sc + ': ' + s.n.toLowerCase() + '). ' + s.story + '</p>' +
      '<h4>2 · Energy conservation</h4>' + TEX`K_i + U_{g,i} + U_{s,i} + W = K_f + U_{g,f} + U_{s,f} + \Delta E_{\text{th}}`;
    if (!rv) return h + '<p class="st">Drag the bars on the canvas to build the chart, then press <b>Check</b>. The numbers appear here once you do.</p>';
    return h + TEX`${ebn(a[0])} + ${ebn(a[1])} + ${ebn(a[2])} + ${ebp(a[3])} = ${ebn(a[4])} + ${ebn(a[5])} + ${ebn(a[6])} + ${ebn(a[7])}` + fin(d.L, d.R) +
      '<h4>3 · Why</h4><p class="st">' + s.why + '</p><p class="note">Count blocks: the left side and the right side must have the same number. Work is + if the outside force helps the motion, − if it opposes it.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){ ebDraw(v, d, mode); }
};

// ---------- helpers ----------
function ebWrap(s, x, y, maxW, lh, font, col){
  ctx.save(); ctx.font = font; ctx.fillStyle = col || '#111'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let line = '';
  s.split(' ').forEach(w => { const tst = line ? line + ' ' + w : w; if (ctx.measureText(tst).width > maxW && line){ ctx.fillText(line, x, y); y += lh; line = w; } else line = tst; });
  if (line){ ctx.fillText(line, x, y); y += lh; } ctx.restore(); return y;
}
function ebBtn(label, x, y, w, h, fn, on){
  ctx.save(); ctx.fillStyle = on ? '#111' : '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = on ? '#fff' : '#111'; ctx.font = '700 12px ' + EBF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + w / 2, y + h / 2 + 1); ctx.restore();
  EB.hit.push({ x, y, w, h, fn });
}
function ebLayout(mode){
  const groups = mode === 'system' ? [['K', 'Ug', 'Us'], ['Ws', 'Wg'], ['K', 'Ug', 'Us', 'Eth']] : [['K', 'Ug', 'Us'], ['W'], ['K', 'Ug', 'Us', 'Eth']];
  const words = { K: 'kin', Ug: 'grav', Us: 'spring', Eth: 'therm', W: 'work', Ws: 'spring', Wg: 'grav' };
  const lab = { K: 'K', Ug: 'Ug', Us: 'Us', Eth: 'ΔEth', W: 'W', Ws: 'W', Wg: 'W' };
  const cols = [], gs = []; let x = 40, i = 0;
  groups.forEach((g, gi) => { const g0 = x; g.forEach((k, j) => { const isW = k[0] === 'W', fin = gi === 2;
      cols.push({ key: k, x, w: 30, i: i++, lab: lab[k] + (isW ? '' : fin ? 'f' : 'i').replace('f', k === 'Eth' ? '' : 'f'), word: words[k], color: isW ? EBK.W : EBK[k], min: isW ? (mode === 'system' ? -8 : -5) : 0, max: 8 }); x += 34; });
    gs.push({ x0: g0, x1: x - 4 }); x += 14; });
  return { cols, gs, names: ['INITIAL', 'WORK', 'FINAL'] };
}
function ebGrid(L){
  const Y = EBY; ctx.save();
  L.gs.forEach(g => { for (let r = 0; r <= Y.rows; r++){ const y = Y.top + r * Y.cell, z = (y === Y.zero); ctx.strokeStyle = z ? '#111' : '#e0e0e0'; ctx.lineWidth = z ? 1.6 : 1; ctx.beginPath(); ctx.moveTo(g.x0 - 4, y); ctx.lineTo(g.x1 + 4, y); ctx.stroke(); } });
  ctx.font = '500 9px ' + EBM; ctx.fillStyle = '#4a4a4a'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let n = Math.ceil(Y.minN / 2) * 2; n <= 8; n += 2) ctx.fillText(String(n).replace('-', '−'), 32, Y.zero - n * Y.cell);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.font = '700 10px ' + EBM;
  L.gs.forEach((g, i) => { ctx.fillStyle = '#4a4a4a'; ctx.fillText(L.names[i], (g.x0 + g.x1) / 2, 106); });
  ctx.font = '700 16px ' + EBF; ctx.fillStyle = '#111'; ctx.fillText('+', (L.gs[0].x1 + L.gs[1].x0) / 2, Y.zero - 3); ctx.fillText('=', (L.gs[1].x1 + L.gs[2].x0) / 2, Y.zero - 3);
  ctx.restore();
}
function ebBar(c, val, o){
  o = o || {}; const Y = EBY, y0 = Y.zero;
  if (val === null){ ctx.save(); ctx.strokeStyle = '#bbb'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.strokeRect(c.x + 1, Y.zero - 4 * Y.cell, c.w - 2, 8 * Y.cell); ctx.setLineDash([]);
    ctx.fillStyle = '#8a8a8a'; ctx.font = '600 9px ' + EBF; ctx.textAlign = 'center'; const w = c.key[0] === 'W'; ctx.fillText(w ? 'inside:' : 'not in', c.x + c.w / 2, Y.zero - 4 * Y.cell + 14); ctx.fillText(w ? 'no work' : 'system', c.x + c.w / 2, Y.zero - 4 * Y.cell + 25); ctx.restore(); return; }
  if (!val) return;
  const h = val * Y.cell; ctx.save(); ctx.fillStyle = o.ghost ? 'rgba(30,125,69,0.0)' : c.color; if (!o.ghost) ctx.fillRect(c.x, val > 0 ? y0 - h : y0, c.w, Math.abs(h));
  ctx.strokeStyle = o.ghost ? '#1e7d45' : '#fff'; ctx.lineWidth = o.ghost ? 2.5 : 1;
  if (o.ghost){ ctx.setLineDash([4, 3]); ctx.strokeRect(c.x - 2, val > 0 ? y0 - h : y0, c.w + 4, Math.abs(h)); ctx.setLineDash([]); }
  else for (let k = 1; k < Math.abs(val); k++){ const y = y0 - Math.sign(val) * k * Y.cell; ctx.beginPath(); ctx.moveTo(c.x, y); ctx.lineTo(c.x + c.w, y); ctx.stroke(); }
  ctx.restore();
}
function ebLabels(L){
  L.cols.forEach(c => { ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = c.color; ctx.font = '700 11px ' + EBF; ctx.fillText(c.lab, c.x + c.w / 2, 308);
    ctx.fillStyle = '#4a4a4a'; ctx.font = '500 8.5px ' + EBM; ctx.fillText(c.word, c.x + c.w / 2, 319); ctx.restore(); });
}
function ebMark(c, ok){ text(ok ? '✓' : '✗', c.x + c.w / 2, 120, { align: 'center', font: '700 15px ' + EBF, col: ok ? '#1e7d45' : '#c43a00' }); }

// ---------- pictures (each pane 180 wide, 70 tall, origin = top-left) ----------
function ebPane(x, y, label){ ctx.save(); ctx.strokeStyle = '#d0d0d0'; ctx.lineWidth = 1; ctx.strokeRect(x, y, 180, 74); ctx.restore(); text(label, x + 4, y - 4, { font: '700 10px ' + EBM, col: '#4a4a4a' }); }
function ebGround(x, y, w){ ctx.save(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke(); ctx.lineWidth = 1; ctx.strokeStyle = '#999'; for (let i = x + 4; i < x + w; i += 8){ ctx.beginPath(); ctx.moveTo(i, y); ctx.lineTo(i - 5, y + 5); ctx.stroke(); } ctx.restore(); }
function ebBall(x, y, r, col){ ctx.save(); ctx.fillStyle = col || '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
function ebBox(x, y, w, h, ang, col){ ctx.save(); ctx.translate(x, y); ctx.rotate(ang || 0); ctx.fillStyle = col || '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(-w / 2, -h, w, h); ctx.strokeRect(-w / 2, -h, w, h); ctx.restore(); }
function ebSpring(x0, x1, y, n){ ctx.save(); ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0, y); for (let i = 0; i < n; i++){ const xa = x0 + (x1 - x0) * (i + 0.5) / n; ctx.lineTo(xa, y + (i % 2 ? 7 : -7)); } ctx.lineTo(x1, y); ctx.stroke(); ctx.restore(); }
function ebScene(sc, st, ox, oy){
  ctx.save(); ctx.translate(ox, oy);
  const ang = Math.atan2(38, 100);
  if (sc === 1){ ebGround(10, 66, 160); ctx.setLineDash([3, 3]); ctx.strokeStyle = '#999'; ctx.beginPath(); ctx.moveTo(90, 66); ctx.lineTo(90, 16); ctx.stroke(); ctx.setLineDash([]);
    ebBall(90, st ? 59 : 12, 7); text(st ? 'v ↓' : 'v = 0', 106, st ? 56 : 16, { font: '700 11px ' + EBF, col: '#c43a00' }); text('Earth', 150, 60, { font: '600 10px ' + EBF, col: '#4a4a4a', align: 'center' }); }
  else if (sc === 2){ ebGround(10, 58, 160); ebBox(st ? 120 : 45, 58, 30, 20); if (!st) arrow(62, 44, 100, 44, '#c43a00', 'v', { w: 3 }); else text('v = 0', 120, 24, { align: 'center', font: '700 11px ' + EBF, col: '#c43a00' }); text('rough floor', 90, 70, { align: 'center', font: '600 9px ' + EBF, col: '#4a4a4a' }); }
  else if (sc === 3 || sc === 6){
    ctx.fillStyle = '#e8e8e8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, 66); ctx.lineTo(70, 66); ctx.lineTo(170, 28); ctx.lineTo(170, 66); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (sc === 3){ ctx.fillStyle = '#111'; ctx.fillRect(6, 40, 4, 26); if (!st){ ebSpring(10, 30, 53, 6); ebBox(46, 66, 30, 14, 0); } else { ebSpring(10, 40, 53, 9); ebBox(150, 31.5, 28, 14, -ang); text('still moving', 120, 14, { font: '700 10px ' + EBF, col: '#c43a00', align: 'center' }); } if (!st) text('compressed', 30, 28, { font: '600 9px ' + EBF, col: '#7a3fb0', align: 'center' }); if (st) ctx.clearRect(0, 0, 0, 0); }
    else { const bx = st ? 148 : 56, by = st ? 66 - (148 - 70) * 0.38 : 66; ebBox(bx, st ? by : by, 26, 18, st ? -ang : 0); ctx.save(); ctx.translate(bx, by); ctx.rotate(st ? -ang : 0); arrow(-34, -9, -17, -9, '#c43a00', '', { w: 3, head: 7 }); ctx.restore(); text('push', st ? bx - 40 : bx - 38, st ? by - 22 : 40, { font: '700 10px ' + EBF, col: '#c43a00' }); } }
  else if (sc === 4){ ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(8, 20); ctx.quadraticCurveTo(50, 22, 78, 66); ctx.lineTo(120, 66); ctx.stroke(); ctx.beginPath(); ctx.arc(140, 46, 20, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(158, 66); ctx.lineTo(172, 66); ctx.stroke(); ctx.beginPath(); ctx.moveTo(120, 66); ctx.lineTo(160, 66); ctx.stroke();
    if (!st) ebBox(24, 18, 16, 9, 0.2); else ebBox(140, 24, 16, 9, 0); ctx.setLineDash([3, 3]); ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(8, 66); ctx.lineTo(172, 66); ctx.stroke(); ctx.setLineDash([]);
    text(st ? 'top of loop' : 'start (at rest)', st ? 126 : 100, st ? 22 : 14, { font: '700 10px ' + EBF, col: '#c43a00', align: st ? 'right' : 'center' }); }
  else if (sc === 5){ ebGround(10, 68, 160); ebBall(90, st ? 12 : 54, 7); ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(90, st ? 12 : 54, 13, 0, 7); ctx.stroke(); ctx.restore();
    if (!st) arrow(90, 38, 90, 20, '#c43a00', '', { w: 3, head: 7 }); text(st ? 'v = 0 (top)' : 'v ↑', 112, st ? 16 : 36, { font: '700 11px ' + EBF, col: '#c43a00' }); text('system', 46, 24, { font: '600 10px ' + EBF, col: '#c43a00', align: 'center' }); }
  ctx.restore();
}

function ebDraw(v, d, mode){
  Object.assign(EBY, mode === 'system' ? { cell: 10, zero: 204, rows: 16, minN: -8 } : { cell: 13, zero: 228, rows: 13, minN: -5 }); EB.hit = []; EB.mode = mode;
  const L = ebLayout(mode); EB.cols = L.cols; EB.L = L;
  if (mode === 'build') return ebBuild(v, d, L);
  ebSystem(v, d, L);
}

function ebBuild(v, d, L){
  const sc = d.sc, s = d.s; EB.sc = sc; const ans = EB.ans[sc] = EB.ans[sc] || [0, 0, 0, 0, 0, 0, 0, 0], chk = EB.chk[sc], rev = EB.rev[sc];
  panelTitle('INITIAL STATE', 10, 18); panelTitle('FINAL STATE', 200, 18);
  ebPane(8, 24, ''); ebPane(198, 24, ''); ebScene(sc, 0, 8, 24); ebScene(sc, 1, 198, 24);
  ctx.save(); ctx.fillStyle = '#111'; ctx.font = '700 14px ' + EBF; ctx.textAlign = 'center'; ctx.fillText('→', 193, 64); ctx.restore();
  ebGrid(L);
  L.cols.forEach(c => { ebBar(c, ans[c.i]); if (rev) ebBar(c, s.a[c.i], { ghost: true }); if (chk) ebMark(c, chk[c.i]); });
  ebLabels(L);
  // right panel
  panelTitle('SCENARIO ' + sc + ' OF 6', 395, 18);
  let y = ebWrap(s.n, 395, 38, 200, 16, '700 14px ' + EBF);
  y = ebWrap(s.story, 395, y + 2, 200, 14, '500 11.5px ' + EBF, '#333');
  text('SYSTEM', 395, y + 8, { font: '700 11px ' + EBM, col: '#c43a00' }); text(s.sys, 395, y + 24, { font: '700 13px ' + EBF, col: '#c43a00' });
  text('1 block = ' + d.u + ' J', 395, y + 42, { font: '600 11px ' + EBM, col: '#4a4a4a' });
  const by = Math.max(y + 52, 196);
  ebBtn('Check', 395, by, 54, 24, () => { EB.chk[sc] = ans.map((x, i) => x === s.a[i]); update(); });
  ebBtn('Show answer', 454, by, 88, 24, () => { EB.ans[sc] = s.a.slice(); EB.rev[sc] = true; EB.chk[sc] = s.a.map(() => true); update(); });
  ebBtn('Reset', 547, by, 48, 24, () => { EB.ans[sc] = [0, 0, 0, 0, 0, 0, 0, 0]; EB.chk[sc] = null; EB.rev[sc] = false; update(); });
  const yy = by + 44;
  if (chk){ const n = chk.filter(x => x).length, lft = ans[0] + ans[1] + ans[2] + ans[3], rgt = ans[4] + ans[5] + ans[6] + ans[7];
    text(n + ' of 8 bars correct', 395, yy, { font: '700 13px ' + EBF, col: n === 8 ? '#1e7d45' : '#c43a00' });
    text('your chart: ' + lft + ' ' + (lft === rgt ? '=' : '≠') + ' ' + rgt + (lft === rgt ? '  balanced' : '  not balanced'), 395, yy + 17, { font: '600 11px ' + EBM, col: lft === rgt ? '#1e7d45' : '#c43a00' });
    if (n < 8) text('green dashes: not yet right? try again', 395, yy + 33, { font: '500 10px ' + EBM, col: '#8a8a8a' }); }
  else text('Drag each bar to its height, then Check.', 395, yy, { font: '500 11px ' + EBF, col: '#8a8a8a' });
  ebHook();
}

function ebSystem(v, d, L){
  const sys = EB.sys, e = d.e;
  panelTitle('THE DART GUN', 10, 18); ebPane(8, 24, '');
  // picture: dart gun, launch and top of flight
  ctx.save(); ctx.translate(8, 24);
  const on = (k, f) => { ctx.save(); ctx.globalAlpha = sys[k] ? 1 : 0.28; f(); ctx.restore(); if (sys[k]){ ctx.save(); ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.restore(); } };
  on('E', () => { ebGround(8, 68, 164); text('Earth', 150, 62, { font: '600 10px ' + EBF, col: '#4a4a4a', align: 'center' }); });
  on('S', () => { ctx.fillStyle = '#e0e0e0'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(40, 46, 10, 22); ctx.strokeRect(40, 46, 10, 22); ctx.fillRect(64, 46, 10, 22); ctx.strokeRect(64, 46, 10, 22); ebSpring(51, 63, 60, 5); text('spring + gun', 80, 60, { font: '600 9px ' + EBF, col: '#7a3fb0' }); });
  on('D', () => { const dart = (x, y) => { ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 5, y + 4); ctx.lineTo(x - 5, y + 4); ctx.closePath(); ctx.fill(); ctx.stroke(); };
    dart(57, 38); ctx.setLineDash([3, 3]); ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(57, 26); ctx.lineTo(57, 14); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 0.5; dart(57, 12); ctx.globalAlpha = 1;
    text('launch', 82, 36, { font: '600 9px ' + EBF, col: '#4a4a4a' }); text('top: v = 0', 82, 14, { font: '600 9px ' + EBF, col: '#4a4a4a' }); });
  ctx.restore();
  // checkboxes
  panelTitle('IN THE SYSTEM?', 200, 18);
  [['D', 'Dart'], ['S', 'Spring and gun'], ['E', 'Earth']].forEach(([k, lab], i) => {
    const x = 204, y = 30 + i * 22; ctx.save(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillStyle = sys[k] ? '#ff6a2b' : '#fff'; ctx.fillRect(x, y, 16, 16); ctx.strokeRect(x, y, 16, 16);
    if (sys[k]){ ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x + 3, y + 8); ctx.lineTo(x + 7, y + 12); ctx.lineTo(x + 13, y + 4); ctx.stroke(); }
    ctx.restore(); text(lab, x + 24, y + 13, { font: '600 13px ' + EBF });
    EB.hit.push({ x: x - 4, y: y - 3, w: 150, h: 22, fn: () => { sys[k] = !sys[k]; update(); } }); });
  ebGrid(L);
  const vals = d.D ? [0, d.Ugi, d.Usi, d.Ws, d.Wg, 0, d.Ugf, d.Usf, d.Eth] : null;
  // columns: Ki, Ugi, Usi | Wspring, Wgrav | Kf, Ugf, Usf, Eth
  const order = vals; L.cols.forEach((c, i) => { if (d.D) ebBar(c, vals[i]); });
  ebLabels(L);
  if (!d.D) text('Tick the dart to see its chart.', 200, 160, { font: '600 12px ' + EBF, col: '#c43a00' });
  // right panel
  const nm = ['dart'].concat(sys.S ? ['spring + gun'] : []).concat(sys.E ? ['Earth'] : []).join(' + ');
  panelTitle('SYSTEM', 395, 18); let y = ebWrap(nm, 395, 38, 200, 16, '700 14px ' + EBF, '#c43a00');
  text('1 block = ' + d.u + ' J', 395, y + 4, { font: '600 11px ' + EBM, col: '#4a4a4a' });
  y += 28; panelTitle('STORED INSIDE', 395, y); y += 16;
  const st = [sys.E ? 'Ug (dart + Earth)' : null, sys.S ? 'Us (spring)' : null].filter(x => x);
  y = ebWrap(d.D ? (st.length ? st.join(', ') : 'no Ug or Us bars: only the dart’s own K') : '—', 395, y, 200, 14, '600 12px ' + EBF) + 6;
  panelTitle('WORK FROM OUTSIDE', 395, y); y += 16;
  const wk = [!sys.S ? 'spring: +' + e + ' blocks' : null, !sys.E ? 'gravity: −' + e + ' blocks' : null].filter(x => x);
  y = ebWrap(d.D ? (wk.length ? wk.join(', ') : 'none: all forces are inside') : '—', 395, y, 200, 14, '600 12px ' + EBF) + 6;
  if (d.D) ebWrap('Both sides add up to ' + d.Etot + ' blocks (' + (d.Etot * d.u) + ' J).', 395, y, 200, 14, '500 11px ' + EBF, '#555');
  ebHook();
}

function ebHook(){
  if (window._ebHook) return; window._ebHook = 1; cv.style.touchAction = 'none';
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 600 / r.width, (e.clientY - r.top) * 330 / r.height]; };
  const setBar = (c, y) => { if (EB.mode !== 'build') return; const sc = EB.sc; let val = Math.round((EBY.zero - y) / EBY.cell); val = Math.max(c.min, Math.min(c.max, val));
    const a = EB.ans[sc]; if (a[c.i] === val) return; a[c.i] = val;
    if (EB.chk[sc] || EB.rev[sc]){ EB.chk[sc] = null; EB.rev[sc] = false; update(); } };
  cv.addEventListener('pointerdown', e => { const [x, y] = pos(e);
    const h = EB.hit.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h); if (h){ h.fn(); return; }
    if (EB.mode !== 'build') return;
    const c = EB.cols.find(c => x >= c.x - 2 && x <= c.x + c.w + 2); if (!c || y < EBY.top - 6 || y > EBY.top + EBY.rows * EBY.cell + 6) return;
    EB.drag = c; try { cv.setPointerCapture(e.pointerId); } catch (er) {} setBar(c, y); });
  cv.addEventListener('pointermove', e => { if (!EB.drag) return; const [x, y] = pos(e); setBar(EB.drag, y); });
  const up = () => { EB.drag = null; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
}
