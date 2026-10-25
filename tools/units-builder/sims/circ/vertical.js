// Vertical Circles: ball on a string, roller-coaster loop, car over a hill.
const SIM = {
  title: 'Vertical Circles',
  modes: [{ id: 'string', label: 'Ball on a string' }, { id: 'loop', label: 'Coaster loop' }, { id: 'hill', label: 'Car over a hill' }],
  opts: [{ id: 'pos', label: 'Where', modes: ['string', 'loop'], choices: [['top', 'Top'], ['side', 'Side'], ['bottom', 'Bottom']] }],
  ivs(mode){
    if (mode === 'string') return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Ball mass', unit: 'kg', min: 0.1, max: 2, step: 0.05, val: 0.5 },
      { id: 'v', sym: 'v', symText: 'v', label: 'Speed here', unit: 'm/s', min: 0, max: 10, step: 0.1, val: 4, graph: true },
      { id: 'r', sym: 'r', symText: 'r', label: 'String length', unit: 'm', min: 0.3, max: 2, step: 0.05, val: 1 }];
    if (mode === 'loop') return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Car + riders', unit: 'kg', min: 100, max: 1000, step: 10, val: 500 },
      { id: 'v', sym: 'v', symText: 'v', label: 'Speed here', unit: 'm/s', min: 0, max: 30, step: 0.5, val: 12, graph: true },
      { id: 'r', sym: 'r', symText: 'r', label: 'Loop radius', unit: 'm', min: 4, max: 30, step: 0.5, val: 10 }];
    return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Car mass', unit: 'kg', min: 500, max: 3000, step: 50, val: 1200 },
      { id: 'v', sym: 'v', symText: 'v', label: 'Speed at top', unit: 'm/s', min: 0, max: 30, step: 0.5, val: 12, graph: true },
      { id: 'r', sym: 'r', symText: 'r', label: 'Hill radius', unit: 'm', min: 5, max: 100, step: 1, val: 30 }];
  },
  calc(v, mode, opt){
    const W = v.m * G10, Fc = v.m * v.v * v.v / v.r, vcrit = Math.sqrt(G10 * v.r), pos = mode === 'hill' ? 'top' : opt.pos;
    let F; // tension (string) or normal force (loop, hill)
    if (mode === 'hill') F = W - Fc;
    else F = pos === 'top' ? Fc - W : pos === 'bottom' ? Fc + W : Fc;
    return { W, Fc, F, ratio: F / W, vcrit, pos, lost: F < 0 };
  },
  dvs(mode, opt){
    const nm = mode === 'string' ? 'Tension' : 'Normal force', s = mode === 'string' ? 'T' : 'N';
    const top = mode === 'hill' || opt.pos === 'top';
    const neg = mode === 'string' ? 'string would have to push: slack' : mode === 'loop' ? 'track would have to pull: falls off' : 'road would have to pull: airborne';
    const list = [
      { id: 'F', name: nm + ' ' + s, short: s, sym: s, unit: 'N', f: d => d.F, negNote: neg },
      { id: 'Fc', name: 'Net force needed, mv²/r', short: 'mv²/r', sym: 'F<sub>c</sub>', unit: 'N', f: d => d.Fc, vs: 'W' },
      { id: 'W', name: 'Weight mg', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W }];
    if (mode !== 'string') list.splice(1, 0, { id: 'ratio', name: 'Felt weight N/mg (g’s)', short: 'N/mg', sym: 'N/mg', unit: '', f: d => d.ratio, negNote: neg });
    if (top) list.push({ id: 'vcrit', name: mode === 'hill' ? 'Speed to leave the road' : 'Slowest speed at the top', short: mode === 'hill' ? 'v_max' : 'v_min', sym: mode === 'hill' ? 'v<sub>max</sub>' : 'v<sub>min</sub>', unit: 'm/s', f: d => d.vcrit });
    return list;
  },
  work(v, d, mode){
    const s = mode === 'string' ? 'T' : 'N', who = mode === 'string' ? 'the string' : mode === 'loop' ? 'the track' : 'the road';
    let h = '<h4>1 · Net force needed toward the center</h4><div class="eq">ΣF<sub>c</sub> = mv²/r = (' + H.iv('m') + ')(' + H.iv('v') + ')² / ' + H.iv('r') + ' = <b>' + H.n(d.Fc, 'N') + '</b></div>' +
      '<p class="note">This is not a new force. It is what the real forces (' + s + ' and mg) have to add up to, pointing toward the center.</p>' +
      '<h4>2 · Weight</h4><div class="eq">mg = (' + H.iv('m') + ')(' + H.g() + ') = ' + H.n(d.W, 'N') + '</div>';
    if (mode === 'hill'){
      h += '<h4>3 · Newton’s 2nd law at the top (toward center = down)</h4><div class="eq">mg − N = mv²/r → N = mg − mv²/r = ' + H.n(d.W) + ' − ' + H.n(d.Fc) + ' = <b>' + H.n(d.F, 'N') + '</b></div>' +
        (d.lost ? '<div class="bad">N can’t be negative: the road can only push. The car leaves the road at the top.</div>'
                : '<div class="ok">The car feels ' + H.n(d.ratio) + ' of its normal weight (N/mg). Faster → lighter.</div>') +
        '<h4>4 · Speed where N = 0 (car goes airborne)</h4><div class="eq">mg = mv²/r → v<sub>max</sub> = √(gr) = √((' + H.g() + ')(' + H.iv('r') + ')) = <b>' + H.n(d.vcrit, 'm/s') + '</b></div><p class="note">Mass cancels.</p>';
      return h;
    }
    if (d.pos === 'top'){
      h += '<h4>3 · At the top, toward center = down</h4><div class="eq">' + s + ' and mg both point down: ' + s + ' + mg = mv²/r</div>' +
        '<div class="eq">' + s + ' = mv²/r − mg = ' + H.n(d.Fc) + ' − ' + H.n(d.W) + ' = <b>' + H.n(d.F, 'N') + '</b></div>' +
        (d.lost ? '<div class="bad">' + s + ' can’t be negative: ' + who + ' can only ' + (mode === 'string' ? 'pull' : 'push') + '. Gravity alone is more than the needed force, so it ' + (mode === 'string' ? 'falls inside the circle and the string goes slack.' : 'falls off the track.') + '</div>'
                : (mode === 'loop' ? '<div class="ok">Riders feel ' + H.n(d.ratio) + ' g’s (N/mg) at the top.</div>' : '<div class="ok">The string stays tight.</div>')) +
        '<h4>4 · Slowest speed at the top (' + s + ' = 0)</h4><div class="eq">mg = mv<sub>min</sub>²/r → v<sub>min</sub> = √(gr) = √((' + H.g() + ')(' + H.iv('r') + ')) = <b>' + H.n(d.vcrit, 'm/s') + '</b></div><p class="note">Mass cancels: any mass needs the same minimum speed.</p>';
    } else if (d.pos === 'bottom'){
      h += '<h4>3 · At the bottom, toward center = up</h4><div class="eq">' + s + ' points up, mg points down: ' + s + ' − mg = mv²/r</div>' +
        '<div class="eq">' + s + ' = mv²/r + mg = ' + H.n(d.Fc) + ' + ' + H.n(d.W) + ' = <b>' + H.n(d.F, 'N') + '</b></div>' +
        '<div class="ok">' + (mode === 'loop' ? 'Riders feel ' + H.n(d.ratio) + ' g’s.' : s + ' is ' + H.n(d.ratio) + ' times the weight.') + ' The bottom always needs more than mg, because ' + s + ' must hold up the weight <i>and</i> supply mv²/r.</div>';
    } else {
      h += '<h4>3 · At the side, toward center = sideways</h4><div class="eq">mg points down, along the motion: it changes the speed, not the direction. Only ' + s + ' points toward the center:</div>' +
        '<div class="eq">' + s + ' = mv²/r = <b>' + H.n(d.F, 'N') + '</b></div>' +
        '<p class="note">The total force isn’t toward the center here, because gravity is also slowing the ' + (mode === 'string' ? 'ball' : 'car') + ' down (going up) or speeding it up (going down).</p>';
    }
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    const scW = 95 / Math.max(d.W, Math.abs(d.F), 1e-9);
    if (mode === 'hill'){
      panelTitle('SIDE VIEW', 10, 18);
      const cx = 200, R = 70 + 160 * (v.r / 100), topY = 150, cy = topY + R;
      ctx.fillStyle = '#e6e6e6'; ctx.beginPath(); ctx.arc(cx, cy, R, PI, 2 * PI); ctx.lineTo(cx + R, 330); ctx.lineTo(cx - R, 330); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, PI * 1.02, PI * 1.98); ctx.stroke();
      ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, Math.min(cy, 325)); ctx.stroke(); ctx.setLineDash([]);
      text('r', cx + 5, Math.min(topY + 60, 300), { font: '700 12px "Space Grotesk",sans-serif', col: '#4a4a4a' });
      const lift = d.lost ? Math.min(30, -d.F / d.W * 30 + 6) : 0;
      ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(cx - 26, topY - 22 - lift, 52, 20); ctx.strokeRect(cx - 26, topY - 22 - lift, 52, 20);
      ctx.fillStyle = '#111'; [cx - 16, cx + 16].forEach(x => { ctx.beginPath(); ctx.arc(x, topY - 3 - lift, 5, 0, 7); ctx.fill(); });
      arrow(cx + 34, topY - 12 - lift, cx + 34 + 20 + v.v * 2.2, topY - 12 - lift, COL.V, 'v');
      if (d.lost) text('AIRBORNE', 12, 318, { font: '700 14px "Space Grotesk",sans-serif', col: '#c43a00' });
      fbd(470, 165, d, 'N', true, mode);
      return;
    }
    panelTitle(mode === 'string' ? 'BALL ON A STRING' : 'LOOP (riders inside the track)', 10, 18);
    const cx = 190, cy = 168, R = 50 + 85 * (v.r - (mode === 'string' ? 0.3 : 4)) / (mode === 'string' ? 1.7 : 26);
    ctx.strokeStyle = mode === 'loop' ? '#111' : '#cfcfcf'; ctx.lineWidth = mode === 'loop' ? 6 : 1.5; ctx.setLineDash(mode === 'loop' ? [] : [5, 5]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, 7); ctx.fill();
    // ghost going around
    if (A.ph === undefined) A.ph = 0; A.ph += Math.max(0.6, Math.min(3, v.v / v.r)) * dt;
    const gxp = cx + R * Math.cos(A.ph), gyp = cy + R * Math.sin(A.ph);
    ctx.fillStyle = 'rgba(17,17,17,0.12)'; ctx.beginPath(); ctx.arc(gxp, gyp, mode === 'loop' ? 9 : 8, 0, 7); ctx.fill();
    const ang = d.pos === 'top' ? -PI / 2 : d.pos === 'bottom' ? PI / 2 : 0;
    const bx = cx + R * Math.cos(ang), by = cy + R * Math.sin(ang);
    if (mode === 'string'){ ctx.strokeStyle = '#111'; ctx.lineWidth = 2; if (d.lost){ ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(cx + 25, (cy + by) / 2, bx, by); ctx.stroke(); ctx.setLineDash([]); } else { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke(); } }
    ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
    if (mode === 'string'){ ctx.beginPath(); ctx.arc(bx, by, 10, 0, 7); ctx.fill(); ctx.stroke(); }
    else { ctx.save(); ctx.translate(bx, by); ctx.rotate(ang + PI / 2); ctx.fillRect(-14, 0, 28, 14); ctx.strokeRect(-14, 0, 28, 14); ctx.restore(); }
    // velocity (counterclockwise on screen means moving left at the top)
    const tx = Math.sin(ang), ty = -Math.cos(ang), vl = 14 + v.v * (mode === 'string' ? 4 : 1.6);
    arrow(bx, by, bx + tx * vl, by + ty * vl, COL.V, 'v');
    if (d.lost) text(mode === 'string' ? 'STRING GOES SLACK' : 'FALLS OFF THE TRACK', 12, 318, { font: '700 14px "Space Grotesk",sans-serif', col: '#c43a00' });
    fbd(470, 165, d, mode === 'string' ? 'T' : 'N', false, mode, ang);
    function noop(){}
  }
};
// free-body diagram on the right; "center" direction depends on position
function fbd(x, y, d, s, hill, mode, ang){
  panelTitle('FREE-BODY DIAGRAM', 380, 18);
  const sc = 95 / Math.max(d.W, Math.abs(d.F), d.Fc, 1e-9);
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
  arrow(x, y, x, y + d.W * sc, COL.W, 'mg', { lx: 8, ly: 0 });
  let cxu = 0, cyu = 1; // unit vector toward center
  if (!hill){ cxu = -Math.cos(ang); cyu = -Math.sin(ang); }
  if (d.F > 0){
    if (hill) arrow(x, y, x, y - d.F * sc, COL.N, 'N', { lx: 8, ly: 0 });
    else arrow(x + (d.pos === 'top' ? 10 : 0), y, x + (d.pos === 'top' ? 10 : 0) + cxu * d.F * sc, y + cyu * d.F * sc, mode === 'string' ? COL.T : COL.N, s, { lx: 8, ly: 0 });
  } else {
    text(s + ' = 0', x + 14, y - 12, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' });
  }
  // needed net force toward center, dashed
  const nx = hill ? 0 : cxu, ny = hill ? 1 : cyu;
  arrow(x - 40, y, x - 40 + nx * d.Fc * sc, y + ny * d.Fc * sc, COL.F, 'needed mv²/r', { w: 2, dash: [5, 4], lx: -8, ly: 0, align: 'right' });
  text('toward center: ' + (hill || d.pos === 'top' ? 'down ↓' : d.pos === 'bottom' ? 'up ↑' : 'left ←'), 380, 300, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' });
  text('arrows to scale', 380, 318, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
}
