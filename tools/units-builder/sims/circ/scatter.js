// Precision & Accuracy (IB Tools): random vs systematic errors. A target, and repeated measurements with mean ± half the range.
function rnd(i){ const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function gauss(i){ return Math.sqrt(-2 * Math.log(rnd(2 * i + 1) * 0.999 + 0.0005)) * Math.cos(2 * PI * rnd(2 * i + 2)); }
const SIM = {
  title: 'Precision & Accuracy',
  modes: [{ id: 'target', label: 'Target' }, { id: 'data', label: 'Repeated measurements' }],
  ivs(mode){
    const l = [{ id: 'sig', sym: 'σ', symText: 'σ', label: 'Random error (spread)', unit: mode === 'data' ? 'm/s²' : 'cm', min: 0, max: mode === 'data' ? 0.6 : 5, step: mode === 'data' ? 0.01 : 0.1, val: mode === 'data' ? 0.2 : 1.5 },
      { id: 'bias', sym: 'b', symText: 'b', label: 'Systematic error (offset)', unit: mode === 'data' ? 'm/s²' : 'cm', min: mode === 'data' ? -1 : 0, max: mode === 'data' ? 1 : 6, step: mode === 'data' ? 0.05 : 0.1, val: 0 },
      { id: 'n', sym: 'n', symText: 'n', label: 'Number of trials', unit: '', min: 2, max: 30, step: 1, val: 6, graph: true, show: x => x.toFixed(0) }];
    return l;
  },
  presets: [{ label: 'Precise + accurate', v: { sig: 0.05, bias: 0 } }, { label: 'Precise, not accurate', mode: 'target', v: { sig: 0.5, bias: 4 } }, { label: 'Accurate, not precise', mode: 'target', v: { sig: 4, bias: 0 } }],
  calc(v, mode){
    const truth = mode === 'data' ? 9.81 : 0, n = Math.round(v.n), xs = [], ys = [];
    for (let i = 0; i < n; i++){ xs.push(truth + v.bias + v.sig * gauss(i)); ys.push(v.sig * gauss(i + 100)); }
    const mean = xs.reduce((a, b) => a + b, 0) / n, mx = Math.max(...xs), mn = Math.min(...xs), half = (mx - mn) / 2;
    return { truth, xs, ys, mean, mx, mn, half, err: mean - truth, pct: 100 * half / Math.abs(mean || 1) };
  },
  dvs(mode){ return [{ id: 'mean', name: 'Mean of the trials', short: 'mean', sym: 'mean', unit: mode === 'data' ? 'm/s²' : 'cm', f: d => d.mean }, { id: 'half', name: 'Uncertainty (half the range)', short: 'Δ', sym: 'Δ', unit: mode === 'data' ? 'm/s²' : 'cm', f: d => d.half }, { id: 'err', name: 'Mean − true value', short: 'error', sym: 'error', unit: mode === 'data' ? 'm/s²' : 'cm', f: d => d.err }]; },
  work(v, d, mode){
    const u = mode === 'data' ? 'm/s²' : 'cm';
    let h = '<h4>1 · Two kinds of error</h4><div class="eq"><b>Random</b> (spread σ = ' + H.iv('sig') + '): readings scatter both ways. Affects <b>precision</b>. Reduced by repeating and averaging.</div>' +
      '<div class="eq"><b>Systematic</b> (offset ' + H.iv('bias') + '): every reading is off the same way, e.g. a zero error or a badly calibrated meter. Affects <b>accuracy</b>. Repeating does <b>not</b> help.</div>';
    if (mode === 'target') return h + '<h4>2 · On the target</h4><div class="eq">Precise = shots close together. Accurate = shots centered on the bull’s-eye. ' + (v.sig < 1 && v.bias < 1 ? 'Here: both.' : v.sig < 1 ? 'Here: precise but not accurate.' : v.bias < 1 ? 'Here: accurate on average, but not precise.' : 'Here: neither.') + '</div>';
    return h + '<h4>2 · ' + H.iv('n') + ' trials measuring g (true value 9.81 m/s²)</h4><div class="eq">Mean = <b>' + d.mean.toFixed(2) + ' ' + u + '</b></div>' +
      '<div class="eq">Uncertainty ≈ half the range = (' + d.mx.toFixed(2) + ' − ' + d.mn.toFixed(2) + ')/2 = <b>±' + d.half.toFixed(2) + ' ' + u + '</b> (' + H.n(d.pct, '%') + ')</div>' +
      '<div class="eq">g = (' + d.mean.toFixed(2) + ' ± ' + d.half.toFixed(2) + ') ' + u + ' → ' + (Math.abs(d.err) <= d.half ? 'the true value is inside the range: <b>consistent</b>' : 'the true value is outside the range: likely a <b>systematic</b> error') + '</div>' +
      '<p class="note">IB: report a mean with its uncertainty, and compare with the accepted value using the percentage difference: ' + H.n(100 * Math.abs(d.err) / 9.81, '%') + ' here.</p>';
  },
  draw(v, d, mode){
    if (mode === 'target'){
      panelTitle('TARGET (each dot is one measurement)', 10, 18);
      const cx = 190, cy = 170, sc = 18; [6, 4, 2].forEach((r, i) => { ctx.fillStyle = ['#eee', '#ddd', '#ffe2d3'][i]; ctx.beginPath(); ctx.arc(cx, cy, r * sc, 0, 7); ctx.fill(); ctx.strokeStyle = '#999'; ctx.stroke(); });
      ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill();
      d.xs.forEach((x, i) => { ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(cx + x * sc, cy + d.ys[i] * sc, 5, 0, 7); ctx.fill(); });
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + d.mean * sc - 8, cy); ctx.lineTo(cx + d.mean * sc + 8, cy); ctx.moveTo(cx + d.mean * sc, cy - 8); ctx.lineTo(cx + d.mean * sc, cy + 8); ctx.stroke();
      text('+ = average', 12, 300, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('VERDICT', 395, 18);
      text(v.sig < 1 ? 'precise ✓' : 'not precise ✗', 400, 60, { font: '700 15px "Space Grotesk",sans-serif', col: v.sig < 1 ? '#1e7d45' : '#c43a00' });
      text(Math.abs(v.bias) < 1 ? 'accurate ✓' : 'not accurate ✗', 400, 88, { font: '700 15px "Space Grotesk",sans-serif', col: Math.abs(v.bias) < 1 ? '#1e7d45' : '#c43a00' });
      return;
    }
    panelTitle('TRIALS (true g = 9.81)', 10, 18);
    const lo = 8.0, hi = 11.6, X = g => 30 + 340 * (g - lo) / (hi - lo);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(30, 250); ctx.lineTo(370, 250); ctx.stroke();
    for (let g = 8; g <= 11.5; g += 0.5){ ctx.fillRect(X(g), 250, 1, 6); text(g.toFixed(1), X(g), 268, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#1e7d45'; ctx.beginPath(); ctx.moveTo(X(9.81), 40); ctx.lineTo(X(9.81), 250); ctx.stroke(); ctx.setLineDash([]); text('true', X(9.81) + 3, 46, { font: '600 9px "IBM Plex Mono",monospace', col: '#1e7d45' });
    const bins = {}; d.xs.forEach(x => { const b = Math.round((x - lo) / 0.1); bins[b] = (bins[b] || 0) + 1; ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(X(lo + b * 0.1), 244 - (bins[b] - 1) * 11, 5, 0, 7); ctx.fill(); });
    ctx.fillStyle = 'rgba(196,58,0,0.15)'; ctx.fillRect(X(d.mn), 70, X(d.mx) - X(d.mn), 170); ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X(d.mean), 70); ctx.lineTo(X(d.mean), 240); ctx.stroke(); text('mean', X(d.mean) + 3, 80, { font: '700 10px "IBM Plex Mono",monospace', col: '#c43a00' });
    text('g = (' + d.mean.toFixed(2) + ' ± ' + d.half.toFixed(2) + ') m/s²', 12, 300, { font: '700 14px "Space Grotesk",sans-serif' });
    text('shaded = range of the trials', 12, 318, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
