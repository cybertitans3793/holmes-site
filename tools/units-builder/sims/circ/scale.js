// Scale & Beaker: a block on a spring scale lowered into a beaker of water that sits on a scale.
const SIM = {
  title: 'Scale & Beaker',
  ivs(){ return [
    { id: 'f', sym: 'f', symText: 'f', label: 'How much of the block is under water', unit: '%', min: 0, max: 100, step: 1, val: 50, graph: true, show: x => x.toFixed(0) + '%' },
    { id: 'm', sym: 'm', symText: 'm', label: 'Block mass', unit: 'kg', min: 0.5, max: 4, step: 0.1, val: 2 },
    { id: 'V', sym: 'V', symText: 'V', label: 'Block volume', unit: 'L', min: 0.1, max: 1.5, step: 0.05, val: 0.8 },
    { id: 'M', sym: 'M', symText: 'M', label: 'Beaker + water mass', unit: 'kg', min: 1, max: 6, step: 0.1, val: 3 }]; },
  presets: [{ label: 'Out of the water', v: { f: 0 } }, { label: 'Fully under', v: { f: 100 } }],
  calc(v){
    const V = v.V / 1000, W = v.m * G10, Fb = 1000 * V * (v.f / 100) * G10, T = W - Fb, floats = T < 0, Ts = Math.max(T, 0), FbEff = floats ? W : Fb, B = v.M * G10 + FbEff;
    return { V, W, Fb: FbEff, T: Ts, B, floats, sum: Ts + B, total: (v.M + v.m) * G10, rho: v.m / V };
  },
  dvs(){ return [
    { id: 'T', name: 'Spring scale reading (top)', short: 'top', sym: 'T', unit: 'N', f: d => d.T },
    { id: 'B', name: 'Bottom scale reading', short: 'bottom', sym: 'N<sub>scale</sub>', unit: 'N', f: d => d.B },
    { id: 'Fb', name: 'Buoyant force', short: 'F_b', sym: 'F<sub>b</sub>', unit: 'N', f: d => d.Fb },
    { id: 'sum', name: 'Top + bottom readings', short: 'sum', sym: 'T + N', unit: 'N', f: d => d.sum }]; },
  work(v, d){
    return '<h4>1 · Buoyant force on the block</h4><div class="eq">F<sub>b</sub> = ρ<sub>water</sub>V<sub>sub</sub>g = (1000)(' + H.n(d.V) + ' × ' + H.iv('f') + ')(10) = <b>' + H.n(d.Fb, 'N') + '</b></div>' +
      (d.floats ? '<div class="bad">The block’s density (' + H.n(d.rho, 'kg/m³') + ') is less than water’s: it floats, and the string goes slack.</div>' : '') +
      '<h4>2 · Free-body diagram of the block (at rest): T + F<sub>b</sub> = mg</h4><div class="eq">Top scale: T = ' + H.n(d.W) + ' − ' + H.n(d.Fb) + ' = <b>' + H.n(d.T, 'N') + '</b> (reads less by F<sub>b</sub>)</div>' +
      '<h4>3 · The water pushes up on the block, so the block pushes down on the water (Newton’s 3rd law)</h4><div class="eq">Bottom scale: N = Mg + F<sub>b</sub> = ' + H.n(v.M * G10) + ' + ' + H.n(d.Fb) + ' = <b>' + H.n(d.B, 'N') + '</b> (reads more by F<sub>b</sub>)</div>' +
      '<h4>4 · Check with the whole system</h4><div class="eq">Block + beaker + water: T + N = (M + m)g → ' + H.n(d.T) + ' + ' + H.n(d.B) + ' = ' + H.n(d.sum, 'N') + ' = ' + H.n(d.total, 'N') + ' ✓</div>' +
      '<p class="note">The “missing” weight on the top scale shows up on the bottom scale. Once the block is fully under, lowering it further changes nothing (unless it touches the bottom).</p>';
  },
  draw(v, d){
    panelTitle('SPRING SCALE + BEAKER ON A SCALE', 10, 18);
    const bx = 110, bw = 160, bTop = 120, bBot = 260, wl = 160, s = 30 + 30 * Math.cbrt(v.V);
    const by = wl - s * (1 - v.f / 100);
    ctx.fillStyle = '#9cc6f0'; ctx.fillRect(bx, wl, bw, bBot - wl); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, bTop); ctx.lineTo(bx, bBot); ctx.lineTo(bx + bw, bBot); ctx.lineTo(bx + bw, bTop); ctx.stroke();
    ctx.fillStyle = '#555'; ctx.fillRect(bx - 20, bBot, bw + 40, 16); ctx.fillStyle = '#111'; ctx.fillRect(bx + bw / 2 - 42, bBot + 18, 84, 22); text(fplain(d.B) + ' N', bx + bw / 2, bBot + 34, { align: 'center', font: '700 12px "IBM Plex Mono",monospace', col: '#7dff9a' });
    const cx = bx + bw / 2; ctx.fillStyle = '#ddd'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(cx - 16, 28, 32, 44); ctx.strokeRect(cx - 16, 28, 32, 44);
    text(fplain(d.T) + ' N', cx + 22, 54, { font: '700 12px "IBM Plex Mono",monospace' });
    ctx.beginPath(); ctx.moveTo(cx, 72); ctx.lineTo(cx, by); ctx.stroke();
    ctx.fillStyle = '#9aa7b8'; ctx.fillRect(cx - s / 2, by, s, s); ctx.strokeRect(cx - s / 2, by, s, s);
    const sc = 60 / Math.max(d.W, 1); arrow(cx + s / 2 + 12, by + s / 2, cx + s / 2 + 12, by + s / 2 + d.W * sc, COL.W, 'mg', { lx: 5, ly: 0 });
    if (d.Fb > 0.05) arrow(cx + s / 2 + 30, by + s / 2, cx + s / 2 + 30, by + s / 2 - d.Fb * sc, COL.N, 'F_b', { lx: 5, ly: 0 });
    if (d.T > 0.05) arrow(cx - s / 2 - 12, by + s / 2, cx - s / 2 - 12, by + s / 2 - d.T * sc, COL.T, 'T', { lx: -5, ly: 0, align: 'right' });
    text('top scale + bottom scale = ' + fplain(d.sum) + ' N', 12, 312, { font: '700 12px "Space Grotesk",sans-serif' });
    panelTitle('READINGS vs HOW FAR IN', 395, 18);
    const gx = 425, gy0 = 250, gw = 160, gh = 190, mx = Math.max(v.M * G10 + 1000 * v.V / 1000 * G10, d.W) * 1.1, X = f => gx + gw * f / 100, Y = q => gy0 - gh * q / mx;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
    const top = f => Math.max(0, d.W - 1000 * d.V * f / 100 * G10), botF = f => v.M * G10 + Math.min(d.W, 1000 * d.V * f / 100 * G10);
    [[top, COL.T], [botF, '#1e7d45']].forEach(([fn, col]) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let f = 0; f <= 100; f += 2) f ? ctx.lineTo(X(f), Y(fn(f))) : ctx.moveTo(X(f), Y(fn(f))); ctx.stroke(); });
    ctx.fillStyle = '#111'; [top(v.f), botF(v.f)].forEach(q => { ctx.beginPath(); ctx.arc(X(v.f), Y(q), 4, 0, 7); ctx.fill(); });
    text('top', gx + gw + 2, Y(top(100)) + 4, { font: '700 10px "Space Grotesk",sans-serif', col: COL.T }); text('bottom', gx + gw - 30, Y(botF(100)) - 6, { font: '700 10px "Space Grotesk",sans-serif', col: '#1e7d45' });
    text('0%', gx, gy0 + 13, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('100%', gx + gw, gy0 + 13, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
