// Charging by Rubbing & Polarization (ABP electrostatics): the triboelectric series (electrons move from one material to the other, charge is conserved, Q = ne), and why a charged object attracts a neutral one (conductors: electrons move; insulators: molecules polarize).
const TRIBO = ['Rabbit fur', 'Glass', 'Human hair', 'Nylon', 'Wool', 'Silk', 'Paper', 'Cotton', 'Rubber balloon', 'Styrofoam', 'Plastic wrap', 'PVC pipe', 'Teflon'];
const SIM = {
  title: 'Charging by Rubbing & Polarization',
  hint: 'Q = ne · e = 1.6 × 10⁻¹⁹ C · only electrons move',
  modes: [{ id: 'rub', label: 'Charging by rubbing' }, { id: 'pol', label: 'Polarization' }],
  opts: [{ id: 'obj', label: 'Neutral object', modes: ['pol'], choices: [['cond', 'Metal can (conductor)'], ['ins', 'Paper bit / wall (insulator)']] },
    { id: 'rs', label: 'Rod', modes: ['pol'], choices: [['neg', 'Negative'], ['pos', 'Positive']] }],
  ivs(mode){
    if (mode === 'pol') return [{ id: 'dd', sym: 'd', symText: 'd', label: 'Rod to object', unit: 'cm', min: 1, max: 10, step: 0.5, val: 3, graph: true }];
    const sh = x => TRIBO[x];
    return [{ id: 'a', sym: 'A', symText: 'A', label: 'Material A', unit: '', min: 0, max: TRIBO.length - 1, step: 1, val: 4, show: sh },
      { id: 'b', sym: 'B', symText: 'B', label: 'Material B', unit: '', min: 0, max: TRIBO.length - 1, step: 1, val: 8, show: sh },
      { id: 'n', sym: 'rubs', symText: 'rubs', label: 'Number of rubs', unit: '', min: 1, max: 20, step: 1, val: 10, graph: true, show: x => String(x) }];
  },
  presets: [{ label: 'Balloon on hair', mode: 'rub', v: { a: 2, b: 8 } }, { label: 'Glass rod and silk', mode: 'rub', v: { a: 1, b: 5 } }, { label: 'Fur and PVC', mode: 'rub', v: { a: 0, b: 11 } }, { label: 'Balloon near a wall', mode: 'pol', opt: { obj: 'ins', rs: 'neg' }, v: { dd: 2 } }],
  calc(v, mode, opt){
    if (mode === 'pol'){ const w = 3, F = 100 * (1 / (v.dd * v.dd) - 1 / Math.pow(v.dd + w * (opt.obj === 'ins' ? 0.15 : 1), 2)); return { pol: true, cond: (opt.obj || 'cond') === 'cond', neg: (opt.rs || 'neg') === 'neg', F }; }
    const gap = Math.abs(v.a - v.b), ne = v.n * gap * 3e9, Q = ne * 1.6e-19, lose = v.a < v.b ? 'A' : v.a > v.b ? 'B' : null;
    return { gap, ne, Q, lose };
  },
  dvs(mode){
    if (mode === 'pol') return [{ id: 'F', name: 'Net pull toward the rod', short: 'pull', sym: 'pull', unit: '', f: d => d.F }];
    return [{ id: 'ne', name: 'Electrons moved', short: 'n', sym: 'n', unit: '', f: d => d.ne }, { id: 'Q', name: 'Charge on each object', short: 'Q', sym: 'Q', unit: 'C', f: d => d.Q }];
  },
  work(v, d, mode){
    if (mode === 'pol'){ const near = d.neg ? 'positive' : 'negative', far = d.neg ? 'negative' : 'positive';
      return '<h4>1 · The object is neutral</h4><p class="st">Equal numbers of + and − charges. Rubbing or touching is not needed.</p>' +
        '<h4>2 · The charges shift</h4><p class="st">' + (d.cond ? 'In a <b>conductor</b>, free electrons ' + (d.neg ? 'are pushed away to the far side' : 'are pulled to the near side') + '. The near side ends up ' + near + ', the far side ' + far + '.' : 'In an <b>insulator</b>, electrons can’t travel, but each molecule’s electrons shift a tiny bit. Every molecule lines up with its ' + near + ' end toward the rod.') + '</p>' +
        '<h4>3 · Why it is attracted</h4><p class="st">The ' + near + ' side is <b>closer</b> to the rod than the ' + far + ' side. Closer charges push or pull harder, so the attraction beats the repulsion: <b>net pull toward the rod</b>.</p>' +
        '<p class="note">That is why a charged balloon sticks to a neutral wall, and a charged comb picks up bits of paper. A charged object attracts a neutral one whatever its sign.</p>'; }
    if (!d.lose) return '<h4>Same material</h4><div class="bad">Rubbing two pieces of the same material moves no electrons on average. Pick two different materials.</div>';
    const giver = d.lose === 'A' ? TRIBO[v.a] : TRIBO[v.b], taker = d.lose === 'A' ? TRIBO[v.b] : TRIBO[v.a];
    return '<h4>1 · Which way do electrons go?</h4><p class="st">' + taker + ' is lower on the series, so it grabs electrons. Electrons move from the <b>' + giver.toLowerCase() + '</b> to the <b>' + taker.toLowerCase() + '</b>.</p>' +
      '<h4>2 · The signs</h4><p class="st">' + giver + ' loses electrons → <b>positive</b>. ' + taker + ' gains electrons → <b>negative</b>. Protons never move.</p>' +
      '<h4>3 · How much charge</h4>' + TEX`Q = ne` + TEX`Q = (${M.n(d.ne)})(1.6\times10^{-19}\,\text{C})` + TEXA`Q = ${M.n(d.Q, 'C')}` + '<p class="st">That is +Q on the ' + giver.toLowerCase() + ' and −Q on the ' + taker.toLowerCase() + ': the same size on each.</p>' +
      '<p class="note">Charge is conserved: the total is still zero, it has just been separated. Materials farther apart on the series trade more electrons. (Real series vary a little from list to list.)</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const F = '"Space Grotesk",sans-serif', Mo = '"IBM Plex Mono",monospace', T = t || 0;
    if (mode === 'pol') return drawPol(v, d, T, F, Mo, A);
    return drawRub(v, d, T, F, Mo, A);
  }
};
function drawRub(v, d, T, F, Mo, A){
  RB.btn = [];
  panelTitle('RUB THEM TOGETHER', 10, 18);
  const dt = Math.min(0.05, Math.max(0, T - (A.lt === undefined ? T : A.lt))); A.lt = T;
  if (A.s === undefined || A.reset) A.s = 0; A.s += dt;
  const STROKE = 0.55, done = Math.min(v.n, Math.floor(A.s / STROKE)), rubbing = done < v.n, ph = (A.s % STROKE) / STROKE;
  const lift = rubbing ? 0 : Math.min(1, (A.s - v.n * STROKE) / 0.5), eased = lift * lift * (3 - 2 * lift);
  const padX = rubbing ? 200 + 85 * Math.sin(ph * 2 * Math.PI) : 200, padY = 108 - 55 * eased;
  const qn = Math.round(Math.min(10, d.gap * v.n / 12 + (d.gap ? 1 : 0)) * done / v.n), sA = d.lose === 'A' ? 1 : d.lose === 'B' ? -1 : 0;
  const charges = (x, y, w, h, n, cols) => { for (let i = 0; i < Math.abs(n); i++){ const c = i % cols, r = Math.floor(i / cols), xx = x + w * (c + 0.5) / cols, yy = y + 16 + r * 20; text(n > 0 ? '+' : '−', xx, yy + 6, { align: 'center', font: '700 18px ' + F, col: n > 0 ? '#c43a00' : '#1546d6' }); } };
  const tag = (n, x, y) => text(n > 0 ? 'positive' : n < 0 ? 'negative' : 'neutral', x, y, { align: 'center', font: '600 11px ' + Mo, col: n > 0 ? '#c43a00' : n < 0 ? '#1546d6' : '#4a4a4a' });
  // B: the long bar underneath
  const bx = 40, by = 170, bw = 320, bh = 62;
  ctx.fillStyle = '#e6ecf7'; ctx.fillRect(bx, by, bw, bh); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
  text(TRIBO[v.b] + ' (B)', bx + bw / 2, by + bh + 16, { align: 'center', font: '700 12px ' + F });
  charges(bx + 20, by + 4, bw - 40, bh, -sA * qn, 10); tag(-sA * qn, bx + bw / 2, by + bh + 31);
  // A: the pad that slides back and forth
  const pw = 110, ph2 = 60, px = padX - pw / 2;
  ctx.fillStyle = '#f2efe6'; ctx.fillRect(px, padY, pw, ph2); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(px, padY, pw, ph2);
  text(TRIBO[v.a] + ' (A)', padX, padY - 8, { align: 'center', font: '700 12px ' + F });
  charges(px + 8, padY + 2, pw - 16, ph2, sA * qn, 5); if (!rubbing) tag(sA * qn, padX + pw / 2 + 50, padY + 34);
  if (rubbing){ const dir = ph < 0.25 || ph > 0.75 ? 1 : -1; for (let k = 0; k < 3; k++){ const xx = padX - dir * (70 + k * 14); ctx.strokeStyle = 'rgba(17,17,17,' + (0.35 - k * 0.1) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xx, padY + 12); ctx.lineTo(xx, padY + 48); ctx.stroke(); } }
  // electrons hopping across the contact line while rubbing
  if (rubbing && d.lose){ const down = d.lose === 'A'; for (let k = 0; k < 3; k++){ const q = (ph * 2 + k / 3) % 1, xx = padX - 36 + k * 36, y1 = down ? 150 : 190, y2 = down ? 190 : 150; text('e⁻', xx, y1 + (y2 - y1) * q, { align: 'center', font: '700 12px ' + Mo, col: '#1546d6' }); } }
  const moved = d.ne * done / v.n;
  text('stroke ' + done + ' of ' + v.n, 122, 304, { font: '700 12px ' + F });
  text(d.lose ? 'electrons moved so far ≈ ' + sci(moved) : 'same material: no electrons move', 122, 318, { font: '600 10.5px ' + Mo, col: d.lose ? '#1546d6' : '#8a8a8a' });
  if (d.lose) text('electrons go ' + (d.lose === 'A' ? 'from A down into B' : 'from B up into A'), 200, 282, { align: 'center', font: '600 11px ' + F, col: '#1546d6' });
  rbBtn(20, 296, 92, 24, rubbing ? 'Rubbing…' : 'Rub again', rubbing);
    panelTitle('TRIBOELECTRIC SERIES', 395, 18);
    text('+  gives up electrons', 400, 40, { font: '600 10px ' + Mo, col: '#c43a00' });
    TRIBO.forEach((nm, i) => { const y = 58 + i * 19, on = i === v.a || i === v.b; ctx.fillStyle = on ? (i === v.a ? '#f2efe6' : '#e6ecf7') : 'transparent'; if (on) ctx.fillRect(398, y - 12, 190, 17); text(nm, 404, y, { font: (on ? '700' : '500') + ' 11px ' + F, col: on ? '#111' : '#4a4a4a' }); if (on) text(i === v.a ? 'A' : 'B', 584, y, { align: 'right', font: '700 11px ' + Mo }); });
    text('−  grabs electrons', 400, 58 + TRIBO.length * 19, { font: '600 10px ' + Mo, col: '#1546d6' });
}
const RB = { btn: [] }; let POLCAP = [];
function sci(x){ if (!(x > 0)) return '0'; const e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e), sup = String(e).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c] || c).join(''); return m.toFixed(1) + ' × 10' + sup; }
function rbBtn(x, y, w, h, label, hot){ RB.btn.push({ x, y, w, h, label }); ctx.save(); ctx.fillStyle = hot ? '#ff6a2b' : '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); ctx.restore(); text(label, x + w / 2, y + h / 2 + 4.5, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: hot ? '#fff' : '#111' }); }
const RBACT = {
  'Rub again': () => { S.anim.reset = true; }, 'Rubbing…': () => { S.anim.reset = true; },
  'Auto ▶': () => { S.anim.auto = true; S.anim.ap = Math.acos(Math.max(-1, Math.min(1, (S.v.dd - 5.5) / 4.5))); },
  'Stop ■': () => { S.anim.auto = false; }
};
(function(){
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 600, (e.clientY - r.top) / r.height * 330]; };
  const hit = e => { const [x, y] = pos(e); return RB.btn.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h); };
  cv.addEventListener('pointerdown', e => { const b = hit(e); if (b && RBACT[b.label]){ RBACT[b.label](); e.preventDefault(); } });
  cv.addEventListener('pointermove', e => { cv.style.cursor = hit(e) ? 'pointer' : ''; });
})();
function drawPol(v, d, T, F, Mo, A){
  RB.btn = [];
  const dt = Math.min(0.05, Math.max(0, T - (A.lt === undefined ? T : A.lt))); A.lt = T;
  if (A.reset) A.auto = false;                       // student dragged the slider: hand control back
  if (A.auto){                                        // rod drifts in and out by itself
    A.ap = (A.ap || 0) + dt * 0.45; const dd = 5.5 + 4.5 * Math.cos(A.ap), snap = Math.round(dd * 2) / 2;
    A.dd = dd;
    if (snap !== S.v.dd){ S.v.dd = snap; S.store[S.mode + ':dd'] = snap; const r = document.getElementById('r-dd'); if (r) r.value = snap; update(); }
  }
  const target = A.auto ? A.dd : v.dd;
  if (A.de === undefined) A.de = target; A.de += (target - A.de) * Math.min(1, dt * 6);   // eased distance, so charges slide
  const D = A.de;
  panelTitle(d.cond ? 'POLARIZING A CONDUCTOR' : 'POLARIZING AN INSULATOR', 10, 18);
  const PXCM = 18, x0 = 220, w = 150, h = 130, oy = 150, y0 = oy - h / 2;
  const rr = x0 - D * PXCM, rs = d.neg ? '−' : '+', rc = d.neg ? '#1546d6' : '#c43a00';
  // the rod (moves; the object stays put)
  ctx.fillStyle = '#d9d4c7'; ctx.fillRect(rr - 26, 60, 26, 180); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(rr - 26, 60, 26, 180);
  for (let i = 0; i < 6; i++) text(rs, rr - 13, 84 + i * 29, { align: 'center', font: '700 18px ' + F, col: rc });
  text('charged rod', Math.max(36, rr - 13), 256, { align: 'center', font: '600 10px ' + F });
  ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(rr, 276); ctx.lineTo(x0, 276); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(rr, 270); ctx.lineTo(rr, 282); ctx.moveTo(x0, 270); ctx.lineTo(x0, 282); ctx.stroke();
  text('d = ' + v.dd + ' cm', (rr + x0) / 2, 293, { align: 'center', font: '700 11px ' + F });
  ctx.fillStyle = d.cond ? '#e6e2d8' : '#f7f6f2'; ctx.fillRect(x0, y0, w, h); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(x0, y0, w, h);
  const away = d.neg ? 1 : -1;                        // +1: electrons pushed away (to the right); −1: pulled toward the rod
  if (d.cond){
    const s = Math.min(1, 4 / (D * D));               // how far the free electrons shift (all of them move together)
    const cols = 4, rows = 4, cw = w / cols, chh = h / rows;
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++){
      const hx = x0 + cw * (j + 0.5), hy = y0 + chh * (i + 0.5);
      text('+', hx - 7, hy + 5, { align: 'center', font: '700 14px ' + F, col: '#c43a00' });      // fixed positive ions
      const packed = away > 0 ? x0 + w - 10 - (cols - 1 - j) * 10.5 : x0 + 10 + j * 10.5;           // where electrons crowd
      const wob = Math.sin(T * 3 + i * 1.7 + j * 2.3) * 1.5;
      const ex = hx + 7 + (packed - hx - 7) * s + wob, ey = hy + Math.cos(T * 2.6 + i + j) * 1.5;
      ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(ex, ey - 1, 5.2, 0, 7); ctx.fill(); text('−', ex, ey + 3, { align: 'center', font: '700 10px ' + F, col: '#fff' });
    }
    const sh = s > 0.12;
    if (sh){ text(away > 0 ? '+ side' : '− side', x0 + 22, y0 + h + 16, { align: 'center', font: '700 11px ' + F, col: away > 0 ? '#c43a00' : '#1546d6' }); text(away > 0 ? '− side' : '+ side', x0 + w - 22, y0 + h + 16, { align: 'center', font: '700 11px ' + F, col: away > 0 ? '#1546d6' : '#c43a00' }); }
    POLCAP = s < 0.05 ? ['Rod far away:', 'the electrons barely move.'] : ['Free electrons ' + (away > 0 ? 'pushed' : 'pulled'), 'to the ' + (away > 0 ? 'far' : 'near') + ' side. Closer = more.'];
  } else {
    ctx.save(); ctx.beginPath(); ctx.rect(x0 + 1, y0 + 1, w - 2, h - 2); ctx.clip();
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){
      const cx = x0 + 20 + j * 37, cy = y0 + 18 + i * 31, dist = D + (cx - x0) / PXCM;   // each molecule's own distance from the rod
      const s = Math.min(1, 6 / (dist * dist));
      const off = away * 6 * s, rx = 11 + 5 * s, ry = 10 - 3 * s;
      ctx.fillStyle = 'rgba(21,70,214,' + (0.12 + 0.12 * s) + ')'; ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx + off, cy, rx, ry, 0, 0, 7); ctx.fill(); ctx.stroke();
      text('−', cx + off + away * rx * 0.45, cy + 4, { align: 'center', font: '700 11px ' + F, col: '#1546d6' });
      ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(cx - away * 2 * s, cy, 4.5, 0, 7); ctx.fill(); text('+', cx - away * 2 * s, cy + 3, { align: 'center', font: '700 8px ' + F, col: '#fff' });
    }
    ctx.restore();
    POLCAP = ['Each molecule’s electron cloud', 'stretches more as the rod nears.'];
  }
  const pull = Math.min(80, 20 + d.F * 4);
  if (d.F > 0.05) arrow(x0 + w - 10, y0 - 14, x0 + w - 10 - pull, y0 - 14, '#1e7d45', 'net pull', { w: 3, ly: -8, align: 'center', lx: 0 });
  else text('pull too small to see', x0 + w / 2, y0 - 12, { align: 'center', font: '600 10px ' + F, col: '#8a8a8a' });
  rbBtn(14, 296, 80, 24, A.auto ? 'Stop ■' : 'Auto ▶', A.auto);
  text(A.auto ? 'rod moves by itself · drag the slider to take over' : 'Auto: the rod moves in and out by itself', 102, 312, { font: '500 10px ' + Mo, col: '#8a8a8a' });
  panelTitle('FORCES ON THE OBJECT', 395, 18);
  const near = 100 / (v.dd * v.dd), far = near - d.F;
  [['rod', d.neg ? 'negative' : 'positive'], ['pull on near side', fplain(near)], ['push on far side', fplain(far)], ['net', 'toward the rod']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px ' + F, col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px ' + Mo }); });
  text('(relative sizes)', 400, 160, { font: '500 10px ' + Mo, col: '#8a8a8a' });
  text('closer charges win', 400, 190, { font: '700 12px ' + F, col: '#1e7d45' });
  POLCAP.forEach((l, i) => text(l, 400, 222 + i * 16, { font: '600 11px ' + F, col: '#1546d6' }));
}
