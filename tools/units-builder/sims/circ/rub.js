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
      return '<h4>1 · The object is neutral</h4><div class="eq">Equal numbers of + and − charges. Rubbing or touching is not needed.</div>' +
        '<h4>2 · The charges shift</h4><div class="eq">' + (d.cond ? 'In a <b>conductor</b>, free electrons ' + (d.neg ? 'are pushed away to the far side' : 'are pulled to the near side') + '. The near side ends up ' + near + ', the far side ' + far + '.' : 'In an <b>insulator</b>, electrons can’t travel, but each molecule’s electrons shift a tiny bit. Every molecule lines up with its ' + near + ' end toward the rod.') + '</div>' +
        '<h4>3 · Why it is attracted</h4><div class="eq">The ' + near + ' side is <b>closer</b> to the rod than the ' + far + ' side. Closer charges push or pull harder, so the attraction beats the repulsion: <b>net pull toward the rod</b>.</div>' +
        '<p class="note">That is why a charged balloon sticks to a neutral wall, and a charged comb picks up bits of paper. A charged object attracts a neutral one whatever its sign.</p>'; }
    if (!d.lose) return '<h4>Same material</h4><div class="bad">Rubbing two pieces of the same material moves no electrons on average. Pick two different materials.</div>';
    const giver = d.lose === 'A' ? TRIBO[v.a] : TRIBO[v.b], taker = d.lose === 'A' ? TRIBO[v.b] : TRIBO[v.a];
    return '<h4>1 · Which way do electrons go?</h4><div class="eq">' + taker + ' is lower on the series, so it grabs electrons. Electrons move from the <b>' + giver.toLowerCase() + '</b> to the <b>' + taker.toLowerCase() + '</b>.</div>' +
      '<h4>2 · The signs</h4><div class="eq">' + giver + ' loses electrons → <b>positive</b>. ' + taker + ' gains electrons → <b>negative</b>. Protons never move.</div>' +
      '<h4>3 · How much charge</h4><div class="eq">Q = ne = (' + fnum(d.ne) + ')(1.6 × 10⁻¹⁹ C) = <b>' + H.n(d.Q, 'C') + '</b> on each, +Q and −Q.</div>' +
      '<p class="note">Charge is conserved: the total is still zero, it has just been separated. Materials farther apart on the series trade more electrons. (Real series vary a little from list to list.)</p>';
  },
  draw(v, d, mode, opt, t){
    const F = '"Space Grotesk",sans-serif', Mo = '"IBM Plex Mono",monospace', T = t || 0;
    if (mode === 'pol') return drawPol(v, d, T, F, Mo);
    panelTitle('RUB THEM TOGETHER', 10, 18);
    const blk = (x, nm, q, col) => { ctx.fillStyle = col; ctx.fillRect(x, 70, 120, 150); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(x, 70, 120, 150); text(nm, x + 60, 240, { align: 'center', font: '700 12px ' + F });
      const n = Math.min(10, Math.round(q)); for (let i = 0; i < Math.abs(n); i++){ const xx = x + 20 + (i % 4) * 27, yy = 95 + Math.floor(i / 4) * 30; text(n > 0 ? '+' : '−', xx, yy, { align: 'center', font: '700 20px ' + F, col: n > 0 ? '#c43a00' : '#1546d6' }); }
      text(n > 0 ? 'positive' : n < 0 ? 'negative' : 'neutral', x + 60, 258, { align: 'center', font: '600 11px ' + Mo, col: n > 0 ? '#c43a00' : n < 0 ? '#1546d6' : '#4a4a4a' }); };
    const qn = Math.min(10, d.gap * v.n / 12 + (d.gap ? 1 : 0)), sA = d.lose === 'A' ? 1 : d.lose === 'B' ? -1 : 0;
    const wig = Math.sin(T * 10) * 4;
    blk(40 + wig, TRIBO[v.a], sA * qn, '#f2efe6'); blk(200 - wig, TRIBO[v.b], -sA * qn, '#e6ecf7');
    if (d.lose){ const fromX = d.lose === 'A' ? 160 : 200, dir = d.lose === 'A' ? 1 : -1; for (let i = 0; i < 3; i++){ const ph = (T * 0.8 + i / 3) % 1; text('e⁻', fromX - dir * 10 + dir * ph * 40, 120 + i * 30, { align: 'center', font: '700 12px ' + Mo, col: '#1546d6' }); } }
    text('electrons move →'.replace('→', d.lose === 'B' ? '←' : '→'), 180, 290, { align: 'center', font: '600 11px ' + F, col: d.lose ? '#1546d6' : '#8a8a8a' });
    panelTitle('TRIBOELECTRIC SERIES', 395, 18);
    text('+  gives up electrons', 400, 40, { font: '600 10px ' + Mo, col: '#c43a00' });
    TRIBO.forEach((nm, i) => { const y = 58 + i * 19, on = i === v.a || i === v.b; ctx.fillStyle = on ? (i === v.a ? '#f2efe6' : '#e6ecf7') : 'transparent'; if (on) ctx.fillRect(398, y - 12, 190, 17); text(nm, 404, y, { font: (on ? '700' : '500') + ' 11px ' + F, col: on ? '#111' : '#4a4a4a' }); if (on) text(i === v.a ? 'A' : 'B', 584, y, { align: 'right', font: '700 11px ' + Mo }); });
    text('−  grabs electrons', 400, 58 + TRIBO.length * 19, { font: '600 10px ' + Mo, col: '#1546d6' });
  }
};
function drawPol(v, d, T, F, Mo){
  panelTitle(d.cond ? 'POLARIZING A CONDUCTOR' : 'POLARIZING AN INSULATOR', 10, 18);
  const rx = 60, ox = rx + 30 + v.dd * 20, oy = 160, rs = d.neg ? '−' : '+', rc = d.neg ? '#1546d6' : '#c43a00';
  ctx.fillStyle = '#d9d4c7'; ctx.fillRect(rx - 30, 60, 30, 200); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(rx - 30, 60, 30, 200);
  for (let i = 0; i < 7; i++) text(rs, rx - 15, 82 + i * 28, { align: 'center', font: '700 18px ' + F, col: rc });
  text('charged rod', rx - 15, 280, { align: 'center', font: '600 10px ' + F });
  const w = 150, h = 140, x0 = ox, y0 = oy - h / 2;
  ctx.fillStyle = d.cond ? '#e6e2d8' : '#f7f6f2'; ctx.fillRect(x0, y0, w, h); ctx.strokeStyle = '#111'; ctx.strokeRect(x0, y0, w, h);
  const s = Math.min(1, 3 / v.dd), nearC = d.neg ? '+' : '−', farC = d.neg ? '−' : '+', nCol = d.neg ? '#c43a00' : '#1546d6', fCol = d.neg ? '#1546d6' : '#c43a00';
  if (d.cond){
    for (let i = 0; i < 5; i++){ text(nearC, x0 + 14, y0 + 22 + i * 26, { align: 'center', font: '700 16px ' + F, col: nCol }); text(farC, x0 + w - 14, y0 + 22 + i * 26, { align: 'center', font: '700 16px ' + F, col: fCol }); }
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++){ const xx = x0 + 50 + j * 50, yy = y0 + 20 + i * 22; text((i + j) % 2 ? '+' : '−', xx, yy + 5, { align: 'center', font: '600 12px ' + F, col: '#8a8a8a' }); }
    text('free electrons ' + (d.neg ? 'pushed away' : 'pulled closer'), x0 + w / 2, y0 + h + 18, { align: 'center', font: '600 10px ' + F, col: '#1546d6' });
  } else {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){ const cx = x0 + 22 + j * 36, cy = y0 + 20 + i * 33, sh = 6 * s;
      ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy, 14, 9, 0, 0, 7); ctx.stroke();
      text(nearC, cx - sh, cy + 4, { align: 'center', font: '700 11px ' + F, col: nCol }); text(farC, cx + sh, cy + 4, { align: 'center', font: '700 11px ' + F, col: fCol }); }
    text('each molecule shifts a little', x0 + w / 2, y0 + h + 18, { align: 'center', font: '600 10px ' + F, col: '#4a4a4a' });
  }
  arrow(x0 + w / 2, y0 - 18, x0 + w / 2 - Math.min(90, 24 + d.F * 5), y0 - 18, '#1e7d45', 'net pull', { w: 3, ly: -8, align: 'center', lx: 0 });
  text('d = ' + v.dd + ' cm', (rx + x0) / 2, 300, { align: 'center', font: '700 12px ' + F });
  panelTitle('FORCES ON THE OBJECT', 395, 18);
  const near = 100 / (v.dd * v.dd), far = near - d.F;
  [['rod', d.neg ? 'negative' : 'positive'], ['pull on near side', fplain(near)], ['push on far side', fplain(far)], ['net', 'toward the rod']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px ' + F, col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px ' + Mo }); });
  text('(relative sizes)', 400, 160, { font: '500 10px ' + Mo, col: '#8a8a8a' });
  text('closer charges win', 400, 190, { font: '700 12px ' + F, col: '#1e7d45' });
}
