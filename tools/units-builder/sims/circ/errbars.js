// Graphs & Error Bars (IB Tool 3): best-fit line, max/min gradient lines through the error bars, uncertainty in the gradient and intercept.
function rnd(i){ const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
const SIM = {
  title: 'Graphs & Error Bars',
  hint: 'spring: x vs F',
  ivs(){ return [
    { id: 'k', sym: 'k', symText: 'k', label: 'True spring constant', unit: 'N/m', min: 10, max: 50, step: 1, val: 25 },
    { id: 'sig', sym: 'σ', symText: 'σ', label: 'Random scatter in each reading', unit: 'cm', min: 0, max: 1.5, step: 0.05, val: 0.4 },
    { id: 'dy', sym: 'Δx', symText: 'Δx', label: 'Error bar (± each extension)', unit: 'cm', min: 0.1, max: 2, step: 0.05, val: 0.5, graph: true },
    { id: 'c', sym: 'c', symText: 'c', label: 'Systematic offset (ruler zero error)', unit: 'cm', min: -2, max: 2, step: 0.1, val: 0 }]; },
  presets: [{ label: 'Tiny error bars', v: { dy: 0.1 } }, { label: 'Zero error', v: { c: 1.5 } }],
  calc(v){
    const xs = [1, 2, 3, 4, 5, 6], ys = xs.map((F, i) => 100 * F / v.k + v.c + v.sig * (2 * rnd(i + 3) - 1) * 1.7);
    const n = 6, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
    const m = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0), b = my - m * mx;
    const mMax = ((ys[5] + v.dy) - (ys[0] - v.dy)) / 5, mMin = ((ys[5] - v.dy) - (ys[0] + v.dy)) / 5;
    const bMax = (ys[0] - v.dy) - mMax * 1, bMin = (ys[0] + v.dy) - mMin * 1;
    const dm = (mMax - mMin) / 2, db = Math.abs(bMin - bMax) / 2;
    const missed = ys.filter((y, i) => Math.abs(y - (m * xs[i] + b)) > v.dy).length;
    const kfit = 100 / m, dk = kfit * dm / m;
    return { xs, ys, m, b, mMax, mMin, bMax, bMin, dm, db, missed, kfit, dk, pct: 100 * dm / m, zeroIn: Math.abs(b) <= db };
  },
  dvs(){ return [{ id: 'dm', name: 'Uncertainty in the gradient', short: 'Δm', sym: 'Δm', unit: 'cm/N', f: d => d.dm }, { id: 'm', name: 'Gradient of the best-fit line', short: 'm', sym: 'm', unit: 'cm/N', f: d => d.m }, { id: 'b', name: 'y-intercept', short: 'b', sym: 'b', unit: 'cm', f: d => d.b }]; },
  work(v, d){
    return '<h4>1 · Plot the data with error bars (±' + H.iv('dy') + ')</h4><div class="eq">A good best-fit line passes through every error bar' + (d.missed ? '. <span style="color:#c43a00">It misses ' + d.missed + ' of them: the error bars are too small for this scatter, or there is a mistake.</span>' : ': it does here.') + '</div>' +
      '<h4>2 · Gradient of the best-fit line</h4><div class="eq">m = <b>' + H.n(d.m, 'cm/N') + '</b></div>' +
      '<h4>3 · Steepest and shallowest lines that still go through the error bars</h4><div class="eq">Draw them from the first bar to the last: m<sub>max</sub> = ' + H.n(d.mMax) + ', m<sub>min</sub> = ' + H.n(d.mMin) + '</div>' +
      '<div class="eq">Δm = (m<sub>max</sub> − m<sub>min</sub>)/2 = <b>' + H.n(d.dm, 'cm/N') + '</b> → m = ' + fnum(d.m) + ' ± ' + fnum(d.dm) + ' cm/N (' + H.n(d.pct, '%') + ')</div>' +
      '<h4>4 · Use the gradient: k = 1/m (convert cm to m)</h4><div class="eq">k = 100/m = ' + H.n(d.kfit, 'N/m') + ' ± ' + H.n(d.dk, 'N/m') + ' (same ' + H.n(d.pct, '%') + '). True k = ' + H.iv('k') + '.</div>' +
      '<h4>5 · The intercept</h4><div class="eq">b = ' + H.n(d.b, 'cm') + ' ± ' + H.n(d.db, 'cm') + ' → ' + (d.zeroIn ? 'zero is within the uncertainty: no sign of a systematic error' : '<b>zero is outside the range: a systematic error</b> (like a ruler zero error). It shifts the line but doesn’t change the gradient.') + '</div>' +
      '<p class="note">This is why IB likes gradients: a systematic offset moves the intercept but leaves the slope (and so k) alone.</p>';
  },
  draw(v, d){
    panelTitle('EXTENSION vs FORCE', 10, 18);
    const gx = 60, gy0 = 290, gw = 500, gh = 250, ymax = Math.max(...d.ys.map(y => y + v.dy), 1) * 1.1, ymin = Math.min(0, ...d.ys.map(y => y - v.dy), d.bMax) * 1.1, X = x => gx + gw * x / 6.5, Y = y => gy0 - gh * (y - ymin) / (ymax - ymin);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
    if (ymin < 0){ ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, Y(0)); ctx.lineTo(gx + gw, Y(0)); ctx.stroke(); }
    const ln = (m, b, col, dash, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(X(0), Y(b)); ctx.lineTo(X(6.5), Y(b + m * 6.5)); ctx.stroke(); ctx.setLineDash([]); };
    ln(d.mMax, d.bMax, '#7a3fb0', [6, 4], 1.5); ln(d.mMin, d.bMin, '#7a3fb0', [6, 4], 1.5); ln(d.m, d.b, '#c43a00', [], 2.5);
    d.xs.forEach((x, i) => { const y = d.ys[i]; ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(x), Y(y - v.dy)); ctx.lineTo(X(x), Y(y + v.dy)); ctx.moveTo(X(x) - 5, Y(y - v.dy)); ctx.lineTo(X(x) + 5, Y(y - v.dy)); ctx.moveTo(X(x) - 5, Y(y + v.dy)); ctx.lineTo(X(x) + 5, Y(y + v.dy)); ctx.stroke(); ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(X(x), Y(y), 3.5, 0, 7); ctx.fill(); });
    for (let F = 0; F <= 6; F++) text(String(F), X(F), gy0 + 14, { align: 'center', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('force F (N)', gx + gw, gy0 + 28, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('extension x (cm)', gx - 6, gy0 - gh - 8, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text(fplain(ymax), gx - 4, gy0 - gh + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('— best fit   - - max / min', 70, 40, { align: 'left', font: '700 11px "IBM Plex Mono",monospace', col: '#c43a00' });
    text('m = ' + fplain(d.m) + ' ± ' + fplain(d.dm) + ' cm/N', 70, 58, { align: 'left', font: '700 12px "IBM Plex Mono",monospace' });
    text('intercept ' + fplain(d.b) + ' ± ' + fplain(d.db) + ' cm', 70, 76, { align: 'left', font: '600 11px "IBM Plex Mono",monospace', col: d.zeroIn ? '#1e7d45' : '#c43a00' });
  }
};
