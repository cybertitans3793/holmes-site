// Two Ropes: a weight hung between two ropes. Why you can never pull the rope perfectly flat.
const SIM = {
  title: 'Two Ropes',
  modes: [{ id: 'center', label: 'Weight in the middle (pull it flat?)' }, { id: 'sign', label: 'Sign on two cables' }],
  ivs(mode){
    if (mode === 'center') return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Hanging mass', unit: 'kg', min: 1, max: 20, step: 0.5, val: 5 },
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Rope angle below horizontal', unit: '°', min: 1, max: 80, step: 0.5, val: 20, graph: true, show: v => v.toFixed(1) + '°' }];
    return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Sign mass', unit: 'kg', min: 1, max: 50, step: 0.5, val: 10 },
      { id: 't1', sym: 'θ<sub>1</sub>', symText: 'θ1', label: 'Left cable angle (from horizontal)', unit: '°', min: 5, max: 85, step: 1, val: 30, graph: true, show: v => v.toFixed(0) + '°' },
      { id: 't2', sym: 'θ<sub>2</sub>', symText: 'θ2', label: 'Right cable angle', unit: '°', min: 5, max: 85, step: 1, val: 60, show: v => v.toFixed(0) + '°' }];
  },
  calc(v, mode){
    const W = v.m * G10;
    if (mode === 'center'){ const th = v.th * DEG, T = W / (2 * Math.sin(th)); return { W, T, ratio: T / W, Ty: T * Math.sin(th), Tx: T * Math.cos(th) }; }
    const a = v.t1 * DEG, b = v.t2 * DEG, s = Math.sin(a + b), T1 = W * Math.cos(b) / s, T2 = W * Math.cos(a) / s;
    return { W, T1, T2, T: Math.max(T1, T2), ratio: Math.max(T1, T2) / W, x1: T1 * Math.cos(a), y1: T1 * Math.sin(a), x2: T2 * Math.cos(b), y2: T2 * Math.sin(b) };
  },
  dvs(mode){ return mode === 'center' ? [
      { id: 'T', name: 'Tension in each rope', short: 'T', sym: 'T', unit: 'N', f: d => d.T, vs: 'W' },
      { id: 'ratio', name: 'Tension ÷ weight', short: 'T/mg', sym: 'T/mg', unit: '', f: d => d.ratio },
      { id: 'Tx', name: 'Horizontal pull T cosθ', short: 'T cosθ', sym: 'T cosθ', unit: 'N', f: d => d.Tx },
      { id: 'W', name: 'Weight mg', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W }]
    : [
      { id: 'T1', name: 'Left cable tension', short: 'T1', sym: 'T<sub>1</sub>', unit: 'N', f: d => d.T1, vs: 'T2' },
      { id: 'T2', name: 'Right cable tension', short: 'T2', sym: 'T<sub>2</sub>', unit: 'N', f: d => d.T2 },
      { id: 'ratio', name: 'Bigger tension ÷ weight', short: 'T/mg', sym: 'T<sub>max</sub>/mg', unit: '', f: d => d.ratio }]; },
  work(v, d, mode){
    if (mode === 'center') return '<h4>1 · Free-body diagram of the knot (or the hanging mass)</h4><div class="eq">Two tensions T, each at θ below horizontal, and the weight mg = (' + H.iv('m') + ')(' + H.g() + ') = ' + H.n(d.W, 'N') + '</div>' +
      '<h4>2 · x: the horizontal parts cancel</h4><div class="eq">T cosθ − T cosθ = 0 (the ropes are symmetric)</div>' +
      '<h4>3 · y: the vertical parts hold up the weight</h4><div class="eq">2T sinθ = mg → T = mg/(2 sinθ) = ' + H.n(d.W) + ' / (2 sin ' + H.iv('th') + ') = <b>' + H.n(d.T, 'N') + '</b></div>' +
      '<div class="eq">That is <b>' + H.n(d.ratio) + ' ×</b> the weight.</div>' +
      '<h4>4 · Can you pull it perfectly flat?</h4><div class="eq">At θ = 0, sinθ = 0: there is no vertical part to hold the weight, so T would have to be infinite. No rope, cable or person can do it. It always sags a little.</div>' +
      '<p class="note">At θ = 30° each rope holds exactly mg. Below 30°, each rope pulls harder than the weight itself.</p>';
    return '<h4>1 · Free-body diagram of the knot</h4><div class="eq">T<sub>1</sub> up-left at ' + H.iv('t1') + ', T<sub>2</sub> up-right at ' + H.iv('t2') + ', weight mg = ' + H.n(d.W, 'N') + ' down</div>' +
      '<h4>2 · x: T<sub>1</sub>cosθ<sub>1</sub> = T<sub>2</sub>cosθ<sub>2</sub></h4><h4>3 · y: T<sub>1</sub>sinθ<sub>1</sub> + T<sub>2</sub>sinθ<sub>2</sub> = mg</h4>' +
      '<h4>4 · Solve the two equations together</h4><div class="eq">T<sub>1</sub> = mg cosθ<sub>2</sub>/sin(θ<sub>1</sub> + θ<sub>2</sub>) = <b>' + H.n(d.T1, 'N') + '</b></div><div class="eq">T<sub>2</sub> = mg cosθ<sub>1</sub>/sin(θ<sub>1</sub> + θ<sub>2</sub>) = <b>' + H.n(d.T2, 'N') + '</b></div>' +
      '<h4>5 · Check</h4><div class="eq">x: ' + H.n(d.x1) + ' vs ' + H.n(d.x2) + ' ✓ &nbsp; y: ' + H.n(d.y1) + ' + ' + H.n(d.y2) + ' = ' + H.n(d.y1 + d.y2) + ' = mg ✓</div>' +
      '<p class="note">The steeper cable carries more of the load.</p>';
  },
  draw(v, d, mode){
    panelTitle(mode === 'center' ? 'ROPE PULLED FROM BOTH ENDS' : 'SIGN ON TWO CABLES', 10, 18);
    const cx = 185;
    if (mode === 'center'){
      const span = 150, th = v.th * DEG, ky = 70 + span * Math.tan(th), yEnd = 70; const kyc = Math.min(ky, 300);
      const ex = span * Math.min(1, (300 - 70) / (span * Math.tan(th) + 1e-9));
      const lx = cx - ex, rx = cx + ex;
      ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, yEnd); ctx.lineTo(cx, kyc); ctx.lineTo(rx, yEnd); ctx.stroke();
      [lx, rx].forEach((x, i) => { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + (i ? 10 : -10), yEnd - 18, 7, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + (i ? 10 : -10), yEnd - 11); ctx.lineTo(x + (i ? 10 : -10), yEnd + 20); ctx.stroke(); });
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, kyc); ctx.lineTo(cx, kyc + 14); ctx.stroke();
      const bs = 18 + v.m; ctx.fillStyle = '#ff6a2b'; ctx.fillRect(cx - bs / 2, kyc + 14, bs, bs); ctx.strokeRect(cx - bs / 2, kyc + 14, bs, bs);
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#9a9a9a'; ctx.beginPath(); ctx.moveTo(lx, yEnd); ctx.lineTo(rx, yEnd); ctx.stroke(); ctx.setLineDash([]);
      text('θ', lx + 30, yEnd + 14, { font: '700 12px "Space Grotesk",sans-serif', col: '#4a4a4a' });
      text('T = ' + fplain(d.T) + ' N each (' + fplain(d.ratio) + ' × mg)', 12, 318, { font: '700 13px "Space Grotesk",sans-serif', col: d.ratio > 1 ? '#c43a00' : '#111' });
      // knot FBD
      panelTitle('FORCES ON THE KNOT', 390, 18);
      const fx = 490, fy = 160, s = 80 / Math.max(d.T, d.W);
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(fx, fy, 5, 0, 7); ctx.fill();
      arrow(fx, fy, fx - d.Tx * s, fy - d.Ty * s, COL.T, 'T', { lx: -6, ly: -6 }); arrow(fx, fy, fx + d.Tx * s, fy - d.Ty * s, COL.T, 'T', { lx: 6, ly: -6 });
      arrow(fx, fy, fx, fy + d.W * s, COL.W, 'mg', { lx: 8, ly: 0 });
      arrow(fx - d.Tx * s, fy - d.Ty * s, fx - d.Tx * s, fy, COL.comp, '', { w: 1.5, dash: [3, 3] }); text('T sinθ', fx - d.Tx * s - 4, fy - d.Ty * s / 2, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
      text('2T sinθ = mg', 400, 300, { font: '700 13px "Space Grotesk",sans-serif', col: '#4a4a4a' });
    } else {
      const ky = 230, a = v.t1 * DEG, b = v.t2 * DEG, L1 = 150 / Math.max(Math.cos(a), 0.2), L2 = 150 / Math.max(Math.cos(b), 0.2);
      let ax = cx - 150, ay = ky - 150 * Math.tan(a), bx = cx + 150, by = ky - 150 * Math.tan(b);
      const top = Math.min(ay, by); const shift = top < 40 ? 40 - top : 0; ax = cx - 150; bx = cx + 150;
      ctx.save(); ctx.translate(0, shift > 0 ? 0 : 0);
      const sY = Math.min(1, (ky - 40) / Math.max(ky - ay, ky - by, 1));
      const AY = ky - (ky - ay) * sY, BY = ky - (ky - by) * sY, AX = cx - 150 * sY, BX = cx + 150 * sY;
      ctx.fillStyle = '#111'; ctx.fillRect(AX - 14, AY - 30, 6, 60); ctx.fillRect(BX + 8, BY - 30, 6, 60);
      ctx.strokeStyle = '#555'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(AX - 8, AY); ctx.lineTo(cx, ky); ctx.lineTo(BX + 8, BY); ctx.stroke();
      ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(cx - 45, ky + 10, 90, 40); ctx.strokeRect(cx - 45, ky + 10, 90, 40); ctx.beginPath(); ctx.moveTo(cx, ky); ctx.lineTo(cx, ky + 10); ctx.stroke();
      text('PHYSICS', cx, ky + 36, { align: 'center', font: '700 14px "Space Grotesk",sans-serif', col: '#fff' }); ctx.restore();
      text('T1 = ' + fplain(d.T1) + ' N   T2 = ' + fplain(d.T2) + ' N', 12, 318, { font: '700 13px "Space Grotesk",sans-serif' });
      panelTitle('FORCES ON THE KNOT', 390, 18);
      const fx = 490, fy = 170, s = 85 / Math.max(d.T1, d.T2, d.W);
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(fx, fy, 5, 0, 7); ctx.fill();
      arrow(fx, fy, fx - d.x1 * s, fy - d.y1 * s, COL.T, 'T1', { lx: -6, ly: -6 }); arrow(fx, fy, fx + d.x2 * s, fy - d.y2 * s, '#1546d6', 'T2', { lx: 6, ly: -6 });
      arrow(fx, fy, fx, fy + d.W * s, COL.W, 'mg', { lx: 8, ly: 0 });
    }
  }
};
