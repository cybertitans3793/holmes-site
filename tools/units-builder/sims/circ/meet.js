// When Do They Meet? Two objects at constant velocity: head-on, catch-up, and a late start.
const SIM = {
  title: 'When Do They Meet?',
  modes: [{ id: 'head', label: 'Head-on' }, { id: 'catch', label: 'Catch-up' }, { id: 'late', label: 'Late start' }],
  ivs(mode){
    if (mode === 'head') return [
      { id: 'd', sym: 'd', symText: 'd', label: 'Starting gap', unit: 'm', min: 20, max: 500, step: 5, val: 200 },
      { id: 'vA', sym: 'v<sub>A</sub>', symText: 'vA', label: 'Speed of A (→)', unit: 'm/s', min: 1, max: 30, step: 0.5, val: 15, graph: true },
      { id: 'vB', sym: 'v<sub>B</sub>', symText: 'vB', label: 'Speed of B (←)', unit: 'm/s', min: 1, max: 30, step: 0.5, val: 10 }];
    if (mode === 'catch') return [
      { id: 'd', sym: 'd', symText: 'd', label: 'B’s head start', unit: 'm', min: 10, max: 300, step: 5, val: 100, graph: true },
      { id: 'vA', sym: 'v<sub>A</sub>', symText: 'vA', label: 'Speed of A (chaser)', unit: 'm/s', min: 1, max: 40, step: 0.5, val: 25 },
      { id: 'vB', sym: 'v<sub>B</sub>', symText: 'vB', label: 'Speed of B (ahead)', unit: 'm/s', min: 1, max: 40, step: 0.5, val: 15 }];
    return [
      { id: 'td', sym: 't<sub>d</sub>', symText: 'td', label: 'B leaves this much later', unit: 's', min: 1, max: 20, step: 0.5, val: 5, graph: true },
      { id: 'vA', sym: 'v<sub>A</sub>', symText: 'vA', label: 'Speed of A (leaves first)', unit: 'm/s', min: 1, max: 30, step: 0.5, val: 10 },
      { id: 'vB', sym: 'v<sub>B</sub>', symText: 'vB', label: 'Speed of B (faster)', unit: 'm/s', min: 1, max: 40, step: 0.5, val: 15 }];
  },
  presets: [{ label: 'Same speed', v: { vA: 15, vB: 15 } }, { label: 'B twice as fast', v: { vA: 10, vB: 20 } }, { label: 'A twice as fast', v: { vA: 20, vB: 10 } }],
  calc(v, mode){
    let t = NaN, x = NaN, close = NaN, never = false;
    if (mode === 'head'){ close = v.vA + v.vB; t = v.d / close; x = v.vA * t; }
    else if (mode === 'catch'){ close = v.vA - v.vB; if (close > 0){ t = v.d / close; x = v.vA * t; } else never = true; }
    else { close = v.vB - v.vA; if (close > 0){ t = v.vB * v.td / close; x = v.vA * t; } else never = true; }
    const xA = s => v.vA * s;
    const xB = mode === 'head' ? s => v.d - v.vB * s : mode === 'catch' ? s => v.d + v.vB * s : s => s < v.td ? 0 : v.vB * (s - v.td);
    const lead = mode === 'late' ? v.vA * v.td : v.d;
    return { t, x, close, never, xA, xB, lead };
  },
  dvs(mode){ return [
    { id: 't', name: 'Time when they meet', short: 't', sym: 't<sub>meet</sub>', unit: 's', f: d => d.t },
    { id: 'x', name: 'Where they meet (from A’s start)', short: 'x', sym: 'x<sub>meet</sub>', unit: 'm', f: d => d.x },
    { id: 'close', name: mode === 'head' ? 'Closing speed v_A + v_B' : 'Closing speed (difference)', short: 'v_close', sym: 'v<sub>close</sub>', unit: 'm/s', f: d => d.close }]; },
  work(v, d, mode){
    let h = '<h4>1 · Constant velocity: position = start + velocity × time</h4>';
    if (mode === 'head') h += '<div class="eq">Put A’s start at x = 0 and call → positive.</div><div class="eq">x<sub>A</sub> = 0 + ' + H.iv('vA') + '·t &nbsp;&nbsp; x<sub>B</sub> = ' + H.iv('d') + ' − ' + H.iv('vB') + '·t &nbsp;(B moves ←, so its velocity is negative)</div>' +
      '<h4>2 · They meet when they’re at the same place: x<sub>A</sub> = x<sub>B</sub></h4><div class="eq">v<sub>A</sub>t = d − v<sub>B</sub>t → t = d/(v<sub>A</sub> + v<sub>B</sub>) = ' + H.iv('d') + ' / ' + H.n(d.close, 'm/s') + ' = <b>' + H.n(d.t, 's') + '</b></div>';
    else if (mode === 'catch') h += '<div class="eq">Put A’s start at x = 0. Both move →.</div><div class="eq">x<sub>A</sub> = ' + H.iv('vA') + '·t &nbsp;&nbsp; x<sub>B</sub> = ' + H.iv('d') + ' + ' + H.iv('vB') + '·t</div>' +
      '<h4>2 · They meet when x<sub>A</sub> = x<sub>B</sub></h4>' + (d.never ? '<div class="bad">A is not faster than B, so the gap never closes. On the x–t graph the lines never cross.</div>'
        : '<div class="eq">v<sub>A</sub>t = d + v<sub>B</sub>t → t = d/(v<sub>A</sub> − v<sub>B</sub>) = ' + H.iv('d') + ' / ' + H.n(d.close, 'm/s') + ' = <b>' + H.n(d.t, 's') + '</b></div>');
    else h += '<div class="eq">Both leave x = 0 going →. A leaves at t = 0; B leaves ' + H.iv('td') + ' later.</div><div class="eq">x<sub>A</sub> = ' + H.iv('vA') + '·t &nbsp;&nbsp; x<sub>B</sub> = ' + H.iv('vB') + '·(t − ' + H.iv('td') + ')</div>' +
      '<h4>2 · They meet when x<sub>A</sub> = x<sub>B</sub></h4>' + (d.never ? '<div class="bad">B is not faster than A, so B never catches up.</div>'
        : '<div class="eq">v<sub>A</sub>t = v<sub>B</sub>(t − t<sub>d</sub>) → t = v<sub>B</sub>t<sub>d</sub>/(v<sub>B</sub> − v<sub>A</sub>) = (' + H.iv('vB') + ')(' + H.iv('td') + ') / ' + H.n(d.close, 'm/s') + ' = <b>' + H.n(d.t, 's') + '</b> after A leaves</div>');
    if (d.never) return h;
    h += '<h4>3 · Where: put t back into either equation</h4><div class="eq">x = v<sub>A</sub>t = (' + H.iv('vA') + ')(' + H.n(d.t, 's') + ') = <b>' + H.n(d.x, 'm') + '</b> from A’s start</div>' +
      '<div class="eq">Check with B: x<sub>B</sub> = ' + H.n(d.xB(d.t), 'm') + ' ✓</div>' +
      '<h4>4 · Shortcut: closing speed</h4><div class="eq">' + (mode === 'head' ? 'Coming toward each other, the gap shrinks by v<sub>A</sub> + v<sub>B</sub>' : 'Going the same way, the gap shrinks by the difference in speeds') +
      ' = ' + H.n(d.close, 'm/s') + ' every second. Gap ' + H.n(d.lead, 'm') + (mode === 'late' ? ' (A’s head start when B leaves)' : '') + ' ÷ ' + H.n(d.close, 'm/s') + ' = ' + H.n(d.lead / d.close, 's') + (mode === 'late' ? ' after B leaves' : '') + '.</div>' +
      '<p class="note">On the x–t graph the slope is the velocity, and the crossing point is the answer: its t and x are when and where.</p>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const tEnd = d.never ? 20 : Math.max(d.t * 1.35, 2), play = 5, hold = 1.2, tt = Math.min((A.t % (play + hold)) / play, 1) * tEnd;
    // road
    panelTitle('THE ROAD (A starts at x = 0)', 10, 18);
    const xs = []; for (let s = 0; s <= tEnd; s += tEnd / 40){ xs.push(d.xA(s), d.xB(s)); }
    const xmin = Math.min(0, ...xs), xmax = Math.max(...xs, 10), L = 20, R = 580, X = x => L + (R - L) * (x - xmin) / (xmax - xmin);
    ctx.fillStyle = '#d6d6d6'; ctx.fillRect(L - 10, 46, R - L + 20, 44); ctx.fillStyle = '#fff'; for (let k = L; k < R; k += 40) ctx.fillRect(k, 66, 20, 3);
    const car = (x, y, col, lab, dir) => { const w = 34; ctx.fillStyle = col; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(x - w / 2, y - 8, w, 16); ctx.strokeRect(x - w / 2, y - 8, w, 16);
      ctx.fillStyle = '#cfe0ff'; ctx.fillRect(dir > 0 ? x + 6 : x - 14, y - 6, 8, 12); text(lab, x, y + 26, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col }); };
    const met = !d.never && tt >= d.t;
    const pa = met ? d.x : d.xA(tt), pb = met ? d.x : d.xB(tt);
    car(X(pa), 57, '#ff6a2b', 'A', 1); car(X(pb), 79, '#1546d6', 'B', mode === 'head' ? -1 : 1);
    if (met){ ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2; for (let k = 0; k < 8; k++){ const a = k * PI / 4; ctx.beginPath(); ctx.moveTo(X(d.x) + 22 * Math.cos(a), 68 + 22 * Math.sin(a)); ctx.lineTo(X(d.x) + 32 * Math.cos(a), 68 + 32 * Math.sin(a)); ctx.stroke(); } }
    text('t = ' + fplain(Math.min(tt, met ? d.t : tt)) + ' s', R, 30, { align: 'right', font: '700 12px "IBM Plex Mono",monospace' });
    // x–t graph
    panelTitle('POSITION vs TIME', 10, 130);
    const gx0 = 60, gy0 = 300, gw = 500, gh = 150, tx = s => gx0 + gw * s / tEnd, py = x => gy0 - gh * (x - xmin) / (xmax - xmin);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx0, gy0 - gh - 5); ctx.lineTo(gx0, gy0); ctx.lineTo(gx0 + gw + 5, gy0); ctx.stroke();
    if (xmin < 0){ ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(gx0, py(0)); ctx.lineTo(gx0 + gw, py(0)); ctx.stroke(); }
    const line = (f, col, upto) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= 100; k++){ const s = upto * k / 100; k ? ctx.lineTo(tx(s), py(f(s))) : ctx.moveTo(tx(s), py(f(s))); } ctx.stroke(); };
    ctx.globalAlpha = 0.25; line(d.xA, '#ff6a2b', tEnd); line(d.xB, '#1546d6', tEnd); ctx.globalAlpha = 1;
    line(d.xA, '#ff6a2b', tt); line(d.xB, '#1546d6', tt);
    if (!d.never){ ctx.setLineDash([3, 3]); ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx(d.t), gy0); ctx.lineTo(tx(d.t), py(d.x)); ctx.lineTo(gx0, py(d.x)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(tx(d.t), py(d.x), 5, 0, 7); ctx.fill();
      text('meet: ' + fplain(d.t) + ' s, ' + fplain(d.x) + ' m', tx(d.t) + 8, py(d.x) - 8, { align: tx(d.t) > 420 ? 'right' : 'left', font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' }); }
    text('x (m)', gx0 - 6, gy0 - gh - 8, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text(fplain(xmax), gx0 - 6, gy0 - gh + 4, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(xmin), gx0 - 6, gy0 + 4, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('t (s) → ' + fplain(tEnd), gx0 + gw, gy0 + 16, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('A', gx0 + gw + 8, py(d.xA(tEnd)) + 4, { font: '700 12px "Space Grotesk",sans-serif', col: '#ff6a2b' }); text('B', gx0 + gw + 8, py(d.xB(tEnd)) + 4, { font: '700 12px "Space Grotesk",sans-serif', col: '#1546d6' });
    if (d.never) text('the lines never cross', gx0 + 10, gy0 - gh + 10, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' });
  }
};
