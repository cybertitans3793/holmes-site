// Power: lifting with a motor, and running up stairs.
const SIM = {
  title: 'Power',
  modes: [{ id: 'motor', label: 'Motor lifts a load' }, { id: 'stairs', label: 'Run up the stairs' }],
  ivs(mode){
    if (mode === 'motor') return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Load mass', unit: 'kg', min: 10, max: 500, step: 5, val: 100 },
      { id: 'h', sym: 'h', symText: 'h', label: 'Lift height', unit: 'm', min: 1, max: 30, step: 0.5, val: 10 },
      { id: 'P', sym: 'P', symText: 'P', label: 'Motor power', unit: 'W', min: 100, max: 5000, step: 50, val: 1000, graph: true }];
    return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Your mass', unit: 'kg', min: 40, max: 110, step: 1, val: 60 },
      { id: 'h', sym: 'h', symText: 'h', label: 'Height of stairs', unit: 'm', min: 2, max: 20, step: 0.5, val: 4 },
      { id: 't', sym: 't', symText: 't', label: 'Time', unit: 's', min: 1, max: 20, step: 0.1, val: 5, graph: true }];
  },
  presets: [{ label: 'One floor (≈3 m)', mode: 'stairs', v: { h: 3 } }, { label: 'Two floors (≈7 m)', mode: 'stairs', v: { h: 7 } }],
  calc(v, mode){
    const W = v.m * G10, Wk = W * v.h;
    if (mode === 'motor'){ const t = Wk / v.P, sp = v.P / W; return { W, Wk, t, sp, hp: v.P / 746 }; }
    const P = Wk / v.t; return { W, Wk, P, hp: P / 746, sp: v.h / v.t, bulbs: P / 60 };
  },
  dvs(mode){ return mode === 'motor' ? [
      { id: 't', name: 'Time to lift', short: 't', sym: 't', unit: 's', f: d => d.t },
      { id: 'sp', name: 'Lifting speed', short: 'v', sym: 'v', unit: 'm/s', f: d => d.sp },
      { id: 'Wk', name: 'Work done mgh', short: 'W', sym: 'W', unit: 'J', f: d => d.Wk }]
    : [
      { id: 'P', name: 'Power', short: 'P', sym: 'P', unit: 'W', f: d => d.P },
      { id: 'Wk', name: 'Work done mgh', short: 'W', sym: 'W', unit: 'J', f: d => d.Wk },
      { id: 'hp', name: 'Horsepower', short: 'hp', sym: 'hp', unit: 'hp', f: d => d.hp }]; },
  work(v, d, mode){
    let h = '<h4>1 · Work done against gravity (constant speed: lifting force = mg)</h4><div class="eq">W = Fd = mgh = (' + H.iv('m') + ')(' + H.g() + ')(' + H.iv('h') + ') = <b>' + H.n(d.Wk, 'J') + '</b></div>';
    if (mode === 'motor'){
      h += '<h4>2 · Time it takes</h4><div class="eq">P = W/t → t = W/P = ' + H.n(d.Wk, 'J') + ' / ' + H.iv('P') + ' = <b>' + H.n(d.t, 's') + '</b></div>' +
        '<h4>3 · Same thing using P = Fv</h4><div class="eq">P = Fv = mg·v → v = P/(mg) = ' + H.iv('P') + ' / ' + H.n(d.W, 'N') + ' = <b>' + H.n(d.sp, 'm/s') + '</b></div>' +
        '<div class="eq">Check: t = h/v = ' + H.iv('h') + ' / ' + H.n(d.sp, 'm/s') + ' = ' + H.n(v.h / d.sp, 's') + ' ✓</div>' +
        '<p class="note">' + H.n(d.hp) + ' horsepower (1 hp = 746 W). Doubling the power halves the time; the work stays the same.</p>';
    } else {
      h += '<h4>2 · Power</h4><div class="eq">P = W/t = ' + H.n(d.Wk, 'J') + ' / ' + H.iv('t') + ' = <b>' + H.n(d.P, 'W') + '</b></div>' +
        '<p class="note">= ' + H.n(d.hp) + ' hp, or about ' + H.n(d.bulbs) + ' old 60 W light bulbs. Walking or running up the same stairs does the <b>same work</b>; running just does it faster.</p>' +
        '<h4>3 · Average vertical speed</h4><div class="eq">v = h/t = ' + H.iv('h') + ' / ' + H.iv('t') + ' = ' + H.n(d.sp, 'm/s') + ', and P = mg·v = ' + H.n(d.W * d.sp, 'W') + ' ✓</div>' +
        '<p class="note">Measure it for real: time yourself on a staircase and measure the height of one step × number of steps.</p>';
    }
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    if (mode === 'motor'){
      panelTitle('MOTOR LIFT', 10, 18);
      const top = 50, bot = 290, T = Math.max(0.6, Math.min(8, d.t)), f = Math.min(1, (A.t % (T + 1)) / T), y = bot - (bot - top - 40) * f;
      ctx.fillStyle = '#111'; ctx.fillRect(140, top - 26, 90, 22); text('MOTOR ' + fplain(v.P) + ' W', 185, top - 30, { align: 'center', font: '700 11px "IBM Plex Mono",monospace' });
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(185, top - 4); ctx.lineTo(185, y - 30); ctx.stroke();
      const bw = 40 + v.m * 0.08; ctx.fillStyle = '#c9a26b'; ctx.strokeStyle = '#111'; ctx.fillRect(185 - bw / 2, y - 30, bw, 30); ctx.strokeRect(185 - bw / 2, y - 30, bw, 30);
      text(fplain(v.m) + ' kg', 185, y - 11, { align: 'center', font: '700 11px "IBM Plex Mono",monospace' });
      ctx.fillStyle = '#e8e8e8'; ctx.fillRect(60, bot, 260, 10);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#bdbdbd'; ctx.beginPath(); ctx.moveTo(250, bot); ctx.lineTo(250, top + 10); ctx.stroke(); ctx.setLineDash([]); text('h = ' + fplain(v.h) + ' m', 256, (bot + top) / 2, { font: '700 12px "Space Grotesk",sans-serif', col: '#4a4a4a' });
      text('t = ' + (f * d.t).toFixed(1) + ' s of ' + fplain(d.t) + ' s', 12, 318, { font: '600 12px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    } else {
      panelTitle('STAIRS', 10, 18);
      const n = 12, x0 = 40, y0 = 290, sw = 24, shh = 18;
      ctx.fillStyle = '#e8e8e8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0);
      for (let i = 0; i < n; i++){ ctx.lineTo(x0 + i * sw, y0 - (i + 1) * shh); ctx.lineTo(x0 + (i + 1) * sw, y0 - (i + 1) * shh); }
      ctx.lineTo(x0 + n * sw, y0); ctx.closePath(); ctx.fill(); ctx.stroke();
      const T = Math.max(0.8, Math.min(10, v.t)), f = Math.min(1, (A.t % (T + 1)) / T), px = x0 + 8 + f * (n * sw - 16), py = y0 - f * n * shh - 6;
      ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.arc(px, py - 24, 7, 0, 7); ctx.fill(); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py - 17); ctx.lineTo(px, py - 4); ctx.stroke();
      text('h = ' + fplain(v.h) + ' m', x0 + n * sw + 10, y0 - n * shh / 2, { font: '700 12px "Space Grotesk",sans-serif', col: '#4a4a4a' });
      text('t = ' + (f * v.t).toFixed(1) + ' s', 12, 318, { font: '600 12px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    }
    // power meter
    panelTitle('POWER', 400, 18);
    const P = mode === 'motor' ? v.P : d.P, Pm = 5000, fr = Math.min(1, P / Pm), cx = 495, cy = 200, R = 80;
    ctx.lineWidth = 16; ctx.strokeStyle = '#e8e8e8'; ctx.beginPath(); ctx.arc(cx, cy, R, PI, 2 * PI); ctx.stroke();
    ctx.strokeStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(cx, cy, R, PI, PI + PI * fr); ctx.stroke();
    text(fplain(P) + ' W', cx, cy - 12, { align: 'center', font: '700 20px "IBM Plex Mono",monospace' });
    text(fplain(P / 746) + ' hp', cx, cy + 8, { align: 'center', font: '600 12px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('0', cx - R - 4, cy + 18, { align: 'center', font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' }); text('5000 W', cx + R, cy + 18, { align: 'center', font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
  }
};
