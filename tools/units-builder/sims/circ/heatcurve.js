// [IB] Heating Curve (IB B.1): Q = mcΔT and Q = mL. Ice → water → steam with a heater of power P; find c from slopes and L from plateaus. Kettle on a balance: L of vaporization, and the two-power method that cancels heat loss.
const CI = 2100, CW = 4200, CS = 2000, LF = 3.34e5, LV = 2.26e6;
const SIM = {
  title: 'Heating Curve',
  hint: 'c: ice 2100, water 4200, steam 2000 J/(kg·K) · L<sub>f</sub> = 3.34×10⁵, L<sub>v</sub> = 2.26×10⁶ J/kg',
  modes: [{ id: 'curve', label: 'Ice → steam' }, { id: 'kettle', label: 'Kettle on a balance' }],
  ivs(mode){
    if (mode === 'kettle') return [
      { id: 'P1', sym: 'P<sub>1</sub>', symText: 'P1', label: 'Heater power, run 1', unit: 'W', min: 1000, max: 3000, step: 50, val: 2000 },
      { id: 'P2', sym: 'P<sub>2</sub>', symText: 'P2', label: 'Heater power, run 2', unit: 'W', min: 400, max: 2500, step: 50, val: 1000 },
      { id: 'Pl', sym: 'P<sub>loss</sub>', symText: 'Ploss', label: 'Heat lost to the room', unit: 'W', min: 0, max: 400, step: 10, val: 150, graph: true }];
    return [
      { id: 'P', sym: 'P', symText: 'P', label: 'Heater power', unit: 'W', min: 100, max: 2000, step: 10, val: 500, graph: true },
      { id: 'm', sym: 'm', symText: 'm', label: 'Mass of ice', unit: 'kg', min: 0.1, max: 2, step: 0.05, val: 0.5 },
      { id: 'T0', sym: 'T<sub>0</sub>', symText: 'T0', label: 'Starting temperature', unit: '°C', min: -30, max: 0, step: 1, val: -20 }];
  },
  presets: [{ label: 'Double the mass', mode: 'curve', v: { m: 1 } }, { label: 'No heat loss', mode: 'kettle', v: { Pl: 0 } }],
  calc(v, mode){
    if (mode === 'kettle'){ const r1 = (v.P1 - v.Pl) / LV, r2 = (v.P2 - v.Pl) / LV, naive = v.P1 / r1, two = (v.P1 - v.P2) / (r1 - r2); return { r1, r2, naive, two, err: 100 * (naive - LV) / LV }; }
    const seg = [[v.m * CI * (0 - v.T0) / v.P, v.T0, 0, 'ice warms'], [v.m * LF / v.P, 0, 0, 'melting'], [v.m * CW * 100 / v.P, 0, 100, 'water warms'], [v.m * LV / v.P, 100, 100, 'boiling'], [v.m * CS * 20 / v.P, 100, 120, 'steam warms']];
    let t = 0; seg.forEach(s => { s.push(t); t += s[0]; });
    return { seg, total: t, tMelt: seg[1][0], tBoil: seg[3][0], slopeIce: v.P / (v.m * CI), slopeW: v.P / (v.m * CW) };
  },
  dvs(mode){
    if (mode === 'kettle') return [{ id: 'naive', name: 'L found ignoring heat loss (P/rate)', short: 'L_naive', sym: 'L', unit: 'J/kg', f: d => d.naive, vs: 'two' }, { id: 'two', name: 'L from two powers (loss cancels)', short: 'L_2', sym: 'L<sub>2-power</sub>', unit: 'J/kg', f: d => d.two }];
    return [{ id: 'total', name: 'Total time, ice to 120 °C steam', short: 't', sym: 't', unit: 's', f: d => d.total }, { id: 'tMelt', name: 'Length of the melting plateau', short: 't_melt', sym: 't<sub>melt</sub>', unit: 's', f: d => d.tMelt }, { id: 'tBoil', name: 'Length of the boiling plateau', short: 't_boil', sym: 't<sub>boil</sub>', unit: 's', f: d => d.tBoil }];
  },
  work(v, d, mode){
    if (mode === 'kettle') return '<h4>1 · At 100 °C all the heater’s energy (minus losses) boils water</h4><div class="eq">(P − P<sub>loss</sub>) = L<sub>v</sub> × (mass boiled per second)</div>' +
      '<div class="eq">Run 1: rate = (' + v.P1 + ' − ' + v.Pl + ')/2.26×10⁶ = ' + H.n(d.r1 * 1000, 'g/s') + ' &nbsp; Run 2: ' + H.n(d.r2 * 1000, 'g/s') + '</div>' +
      '<h4>2 · Ignore the loss: L = P/rate</h4><div class="eq">L = ' + v.P1 + '/' + fnum(d.r1) + ' = <b>' + H.n(d.naive, 'J/kg') + '</b> (' + (v.Pl ? H.n(d.err, '%') + ' too high' : 'correct') + ')</div>' +
      '<h4>3 · Two powers, same loss: subtract to cancel it</h4><div class="eq">L = (P<sub>1</sub> − P<sub>2</sub>)/(rate<sub>1</sub> − rate<sub>2</sub>) = <b>' + H.n(d.two, 'J/kg') + '</b> ✓</div>' +
      '<p class="note">Heat loss is a systematic error: it always makes L too big. Repeating the same run doesn’t fix it; changing the method does.</p>';
    const s = d.seg;
    return '<h4>1 · Sloped parts: temperature rises, Q = mcΔT</h4><div class="eq">Ice: slope = P/(mc<sub>ice</sub>) = ' + H.n(d.slopeIce, '°C/s') + ' &nbsp; Water: P/(mc<sub>water</sub>) = ' + H.n(d.slopeW, '°C/s') + '</div>' +
      '<div class="eq">Find c from a slope: c = P/(m × slope). Water’s slope is half of ice’s: c<sub>water</sub> ≈ 2c<sub>ice</sub>.</div>' +
      '<h4>2 · Flat parts: phase change at constant temperature, Q = mL</h4><div class="eq">Melting lasts t = mL<sub>f</sub>/P = (' + H.iv('m') + ')(3.34×10⁵)/' + H.iv('P') + ' = <b>' + H.n(s[1][0], 's') + '</b></div>' +
      '<div class="eq">Boiling lasts mL<sub>v</sub>/P = <b>' + H.n(s[3][0], 's') + '</b>: almost 7× longer than melting</div>' +
      '<h4>3 · Where does the energy go on a plateau?</h4><div class="eq">Temperature (average KE) stays the same, so the energy goes into <b>potential energy</b>: pulling molecules apart against their attractions. Internal energy still increases.</div>' +
      '<p class="note">Lab: read L from the plateau length, L = PΔt/m. Real heaters lose some energy, so the measured L comes out too large.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'kettle'){
      if (A.s === undefined || A.reset) A.s = 0; A.s = (A.s + dt) % 8;
      panelTitle('KETTLE ON A BALANCE AT 100 °C', 10, 18);
      ctx.fillStyle = '#ccc'; ctx.fillRect(40, 250, 200, 30); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(40, 250, 200, 30);
      ctx.fillStyle = '#111'; ctx.fillRect(110, 258, 70, 16); text((1500 - d.r1 * 1000 * A.s * 20).toFixed(1) + ' g', 172, 271, { align: 'right', font: '700 12px "IBM Plex Mono",monospace', col: '#7dff9a' });
      ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.roundRect(70, 130, 140, 118, 18); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#cfe6ff'; ctx.fillRect(78, 170, 124, 72);
      for (let i = 0; i < 4; i++){ const ph = (t * 0.6 + i * 0.25) % 1; ctx.fillStyle = 'rgba(160,160,160,' + (1 - ph) + ')'; ctx.beginPath(); ctx.arc(140 + 10 * Math.sin(i + t), 120 - 80 * ph, 8 + 10 * ph, 0, 7); ctx.fill(); }
      panelTitle('MASS vs TIME (two runs)', 395, 18);
      const gx = 405, gy = 260, gw = 180, gh = 200; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      [[d.r1, '#c43a00', 'P₁'], [d.r2, '#1546d6', 'P₂']].forEach(([r, c, l]) => { ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(gx, gy - gh + 10); const y2 = gy - gh + 10 + 160 * r / 0.0013; ctx.lineTo(gx + gw, Math.min(gy, y2)); ctx.stroke(); text(l, gx + gw - 4, Math.min(gy, y2) - 6, { align: 'right', font: '700 11px "IBM Plex Mono",monospace', col: c }); });
      text('time (5 min)', gx + gw, gy + 13, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text('L (2 powers) = ' + fplain(d.two) + ' J/kg', 400, 296, { font: '700 12px "Space Grotesk",sans-serif', col: '#1e7d45' });
      return;
    }
    if (A.s === undefined || A.reset) A.s = 0; A.s = (A.s + dt / 8) % 1.15; const tt = Math.min(1, A.s) * d.total;
    let seg = d.seg.find(s => tt >= s[4] && tt <= s[4] + s[0]) || d.seg[4]; const q = (tt - seg[4]) / seg[0], T = seg[1] + (seg[2] - seg[1]) * q;
    const phase = seg[3];
    panelTitle('HEATER POWER ' + v.P + ' W', 10, 18);
    // molecules picture
    const box = [30, 40, 200, 180]; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(...box);
    const solidFrac = phase === 'ice warms' ? 1 : phase === 'melting' ? 1 - q : 0, gasFrac = phase === 'steam warms' ? 1 : phase === 'boiling' ? q : 0;
    for (let i = 0; i < 36; i++){ const r = i % 6, c = Math.floor(i / 6), lx = 50 + r * 30, ly = 60 + c * 28; let x, y;
      if (i / 36 < solidFrac){ const j = 1 + 2 * Math.min(1, Math.max(0, (T + 30) / 30)); x = lx + j * Math.sin(t * 20 + i); y = ly + j * Math.cos(t * 17 + i); }
      else if (i / 36 >= 1 - gasFrac){ const fx = i * 0.618 + t * 0.35 * (1 + i % 3), fy = i * 0.271 + t * 0.27 * (1 + i % 2); x = 40 + 180 * Math.abs(2 * (fx % 1) - 1); y = 50 + 160 * Math.abs(2 * (fy % 1) - 1); }
      else { x = 45 + 170 * ((i * 0.618) % 1) + 6 * Math.sin(t * 2 + i); y = 125 + 85 * ((i * 0.7548) % 1) + 6 * Math.cos(t * 1.7 + i); }
      ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); }
    text(phase, 130, 240, { align: 'center', font: '700 14px "Space Grotesk",sans-serif', col: phase === 'melting' || phase === 'boiling' ? '#c43a00' : '#111' });
    text(fplain(T) + ' °C  ·  t = ' + fplain(tt) + ' s', 130, 262, { align: 'center', font: '600 11px "IBM Plex Mono",monospace' });
    // heating curve
    panelTitle('TEMPERATURE vs TIME', 250, 18);
    const gx = 270, gy = 290, gw = 315, gh = 240, Tmin = v.T0 - 10, Tmax = 130, X = s => gx + gw * s / d.total, Y = TT => gy - gh * (TT - Tmin) / (Tmax - Tmin);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    [0, 100].forEach(TT => { ctx.setLineDash([3, 3]); ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(gx, Y(TT)); ctx.lineTo(gx + gw, Y(TT)); ctx.stroke(); ctx.setLineDash([]); text(TT + ' °C', gx - 4, Y(TT) + 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); });
    const cols = ['#1546d6', '#c43a00', '#1546d6', '#c43a00', '#1546d6'];
    d.seg.forEach((s, i) => { ctx.strokeStyle = cols[i]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(s[4]), Y(s[1])); ctx.lineTo(X(s[4] + s[0]), Y(s[2])); ctx.stroke(); });
    text('melting', X(d.seg[1][4] + d.seg[1][0] / 2), Y(0) + 14, { align: 'center', font: '600 9px "IBM Plex Mono",monospace', col: '#c43a00' });
    text('boiling', X(d.seg[3][4] + d.seg[3][0] / 2), Y(100) - 6, { align: 'center', font: '600 9px "IBM Plex Mono",monospace', col: '#c43a00' });
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(tt), Y(T), 5, 0, 7); ctx.fill();
    text('time (s) → ' + fplain(d.total), gx + gw, gy + 14, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
