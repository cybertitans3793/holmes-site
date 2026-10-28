// Power: lifting with a motor, and running up stairs.
const SIM = {
  title: 'Power',
  modes: [{ id: 'motor', label: 'Motor lifts a load' }, { id: 'stairs', label: 'Run up the stairs' }, { id: 'compare', label: 'Same job, different time' }, { id: 'push', label: 'Pushing at constant speed (P = Fv)' }],
  ivs(mode){
    if (mode === 'compare') return [
      { id: 'm1', sym: 'm<sub>1</sub>', symText: 'm1', label: 'Lifter 1: box mass', unit: 'kg', min: 5, max: 40, step: 5, val: 10 },
      { id: 't1', sym: 't<sub>1</sub>', symText: 't1', label: 'Lifter 1: time', unit: 's', min: 5, max: 60, step: 5, val: 20 },
      { id: 'm2', sym: 'm<sub>2</sub>', symText: 'm2', label: 'Lifter 2: box mass', unit: 'kg', min: 5, max: 40, step: 5, val: 20 },
      { id: 't2', sym: 't<sub>2</sub>', symText: 't2', label: 'Lifter 2: time', unit: 's', min: 5, max: 60, step: 5, val: 40, graph: true },
      { id: 'h', sym: 'h', symText: 'h', label: 'Height of the stairs (same for both)', unit: 'm', min: 2, max: 10, step: 1, val: 4 }];
    if (mode === 'push') return [
      { id: 'F', sym: 'F', symText: 'F', label: 'Forward force (= drag/friction at constant speed)', unit: 'N', min: 100, max: 8000, step: 100, val: 4000 },
      { id: 'v', sym: 'v', symText: 'v', label: 'Constant speed', unit: 'm/s', min: 1, max: 30, step: 1, val: 12, graph: true }];
    if (mode === 'motor') return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Load mass', unit: 'kg', min: 10, max: 500, step: 5, val: 100 },
      { id: 'h', sym: 'h', symText: 'h', label: 'Lift height', unit: 'm', min: 1, max: 30, step: 0.5, val: 10 },
      { id: 'P', sym: 'P', symText: 'P', label: 'Motor power', unit: 'W', min: 100, max: 5000, step: 50, val: 1000, graph: true }];
    return [
      { id: 'm', sym: 'm', symText: 'm', label: 'Your mass', unit: 'kg', min: 40, max: 110, step: 1, val: 60 },
      { id: 'h', sym: 'h', symText: 'h', label: 'Height of stairs', unit: 'm', min: 2, max: 20, step: 0.5, val: 4 },
      { id: 't', sym: 't', symText: 't', label: 'Time', unit: 's', min: 1, max: 20, step: 0.1, val: 5, graph: true }];
  },
  presets: [{ label: 'One floor (≈3 m)', mode: 'stairs', v: { h: 3 } }, { label: 'Two floors (≈7 m)', mode: 'stairs', v: { h: 7 } }, { label: 'Twice the load, twice the time', mode: 'compare', v: { m1: 10, t1: 20, m2: 20, t2: 40 } }, { label: 'Same load, half the time', mode: 'compare', v: { m1: 20, t1: 20, m2: 20, t2: 40 } }, { label: 'Boat: 4000 N at 12 m/s', mode: 'push', v: { F: 4000, v: 12 } }],
  calc(v, mode){
    if (mode === 'compare'){ const W1 = v.m1 * G10 * v.h, W2 = v.m2 * G10 * v.h; return { W1, W2, P1: W1 / v.t1, P2: W2 / v.t2 }; }
    if (mode === 'push'){ const P = v.F * v.v; return { P, hp: P / 746, Wper: P }; }
    const W = v.m * G10, Wk = W * v.h;
    if (mode === 'motor'){ const t = Wk / v.P, sp = v.P / W; return { W, Wk, t, sp, hp: v.P / 746 }; }
    const P = Wk / v.t; return { W, Wk, P, hp: P / 746, sp: v.h / v.t, bulbs: P / 60 };
  },
  dvs(mode){ if (mode === 'compare') return [{ id: 'P2', name: 'Power of lifter 2', short: 'P₂', sym: 'P<sub>2</sub>', unit: 'W', f: d => d.P2 }, { id: 'W2', name: 'Work by lifter 2', short: 'W₂', sym: 'W<sub>2</sub>', unit: 'J', f: d => d.W2 }];
    if (mode === 'push') return [{ id: 'P', name: 'Power', short: 'P', sym: 'P', unit: 'W', f: d => d.P }, { id: 'hp', name: 'Horsepower', short: 'hp', sym: 'hp', unit: 'hp', f: d => d.hp }];
    return mode === 'motor' ? [
      { id: 't', name: 'Time to lift', short: 't', sym: 't', unit: 's', f: d => d.t },
      { id: 'sp', name: 'Lifting speed', short: 'v', sym: 'v', unit: 'm/s', f: d => d.sp },
      { id: 'Wk', name: 'Work done mgh', short: 'W', sym: 'W', unit: 'J', f: d => d.Wk }]
    : [
      { id: 'P', name: 'Power', short: 'P', sym: 'P', unit: 'W', f: d => d.P },
      { id: 'Wk', name: 'Work done mgh', short: 'W', sym: 'W', unit: 'J', f: d => d.Wk },
      { id: 'hp', name: 'Horsepower', short: 'hp', sym: 'hp', unit: 'hp', f: d => d.hp }]; },
  work(v, d, mode){
    if (mode === 'compare'){ const cmp = (a, b) => Math.abs(a - b) < 1e-9 ? 'the same' : a > b ? 'lifter 1' : 'lifter 2';
      return '<h4>1 · Work = weight × height</h4><div class="eq">Lifter 1: W = (' + H.iv('m1') + ')(10)(' + H.iv('h') + ') = <b>' + H.n(d.W1, 'J') + '</b><br>Lifter 2: W = (' + H.iv('m2') + ')(10)(' + H.iv('h') + ') = <b>' + H.n(d.W2, 'J') + '</b></div>' +
        '<h4>2 · Power = work ÷ time</h4><div class="eq">Lifter 1: P = ' + H.n(d.W1) + ' ÷ ' + H.iv('t1') + ' = <b>' + H.n(d.P1, 'W') + '</b><br>Lifter 2: P = ' + H.n(d.W2) + ' ÷ ' + H.iv('t2') + ' = <b>' + H.n(d.P2, 'W') + '</b></div>' +
        '<h4>3 · Compare</h4><div class="eq">More work: <b>' + cmp(d.W1, d.W2) + '</b> · More power: <b>' + cmp(d.P1, d.P2) + '</b></div>' +
        '<p class="note">Work only depends on the force and the distance. Power also depends on <b>how fast</b> the work gets done. Doing twice the work in twice the time is the same power.</p>'; }
    if (mode === 'push') return '<h4>1 · Power from force and speed</h4><div class="eq">P = W/t = F·d/t = F × v<br>P = ' + H.iv('F') + ' × ' + H.iv('v') + ' = <b>' + H.n(d.P, 'W') + '</b></div>' +
      '<h4>2 · In horsepower</h4><div class="eq">' + H.n(d.P) + ' ÷ 746 = <b>' + H.n(d.hp, 'hp') + '</b></div>' +
      '<h4>3 · What that means</h4><div class="eq">Every second the force moves the object ' + H.iv('v') + ', doing ' + H.n(d.Wper, 'J') + ' of work each second.</div>' +
      '<p class="note">At constant speed the forward force just balances drag or friction, so all of this power goes into heating the water, air or road — the KE doesn’t change. Going twice as fast against the same force takes twice the power.</p>';
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
    if (mode === 'compare'){
      panelTitle('TWO PEOPLE, SAME STAIRS (TIME SPED UP)', 10, 18);
      const lane = (y0, m, tt, col, lab) => { const n = 6, x0 = 30, sw = 26, sh = 14; ctx.fillStyle = '#e8e8e8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0);
          for (let i = 0; i < n; i++){ ctx.lineTo(x0 + i * sw, y0 - (i + 1) * sh); ctx.lineTo(x0 + (i + 1) * sw, y0 - (i + 1) * sh); } ctx.lineTo(x0 + n * sw, y0); ctx.closePath(); ctx.fill(); ctx.stroke();
          const Tm = Math.max(v.t1, v.t2), f = Math.min(1, (A.t * Tm / 4 % (Tm + 6)) / tt), px = x0 + 6 + f * (n * sw - 12), py = y0 - f * n * sh - 4;
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py - 22, 6, 0, 7); ctx.fill(); ctx.fillRect(px - 2, py - 16, 4, 14); const bs = 8 + m / 3; ctx.fillStyle = '#c9a26b'; ctx.fillRect(px + 4, py - 14 - bs, bs, bs); ctx.strokeRect(px + 4, py - 14 - bs, bs, bs);
          text(lab + ': ' + fplain(m) + ' kg box, ' + fplain(tt) + ' s', 210, y0 - 50, { font: '700 11px "Space Grotesk",sans-serif', col }); };
      lane(150, v.m1, v.t1, '#1546d6', 'Lifter 1'); lane(290, v.m2, v.t2, '#c43a00', 'Lifter 2');
      panelTitle('WORK AND POWER', 400, 18); const mW = Math.max(d.W1, d.W2), mP = Math.max(d.P1, d.P2);
      const bar = (y, lab, a, b, mx, u) => { text(lab, 400, y, { font: '700 12px "Space Grotesk",sans-serif' }); [[a, '#1546d6'], [b, '#c43a00']].forEach(([val, c], i) => { ctx.fillStyle = c; ctx.fillRect(400, y + 8 + i * 22, 140 * val / mx, 16); text(fplain(val) + ' ' + u, 404 + 140 * val / mx, y + 21 + i * 22, { font: '700 10px "IBM Plex Mono",monospace' }); }); };
      bar(50, 'Work (J)', d.W1, d.W2, mW, 'J'); bar(150, 'Power (W)', d.P1, d.P2, mP, 'W');
      return;
    }
    if (mode === 'push'){
      panelTitle('BOAT CRUISING AT CONSTANT SPEED', 10, 18);
      ctx.fillStyle = '#cfe8f7'; ctx.fillRect(12, 170, 376, 130); const off = (A.t * v.v * 6) % 60;
      ctx.strokeStyle = '#7fb6dd'; ctx.lineWidth = 2; for (let k = -1; k < 8; k++){ const x = 12 + k * 60 - off + 60; ctx.beginPath(); ctx.arc(x, 200, 10, PI, 2 * PI); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 30, 250, 10, PI, 2 * PI); ctx.stroke(); }
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(130, 150); ctx.lineTo(290, 150); ctx.lineTo(270, 180); ctx.lineTo(145, 180); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#1546d6'; ctx.fillRect(180, 128, 50, 22);
      arrow(290, 165, 290 + Math.min(80, v.F / 80), 165, '#1546d6', 'F = ' + fplain(v.F) + ' N', { w: 3, ly: -10 }); arrow(130, 170, 130 - Math.min(80, v.F / 80), 170, '#c43a00', 'drag', { w: 3, ly: 16 });
      text('v = ' + fplain(v.v) + ' m/s →', 200, 110, { align: 'center', font: '700 13px "IBM Plex Mono",monospace' });
    }
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
    } else if (mode === 'stairs') {
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
    const P = mode === 'motor' ? v.P : d.P, Pm = mode === 'push' ? 100000 : 5000, fr = Math.min(1, P / Pm), cx = 495, cy = 200, R = 80;
    ctx.lineWidth = 16; ctx.strokeStyle = '#e8e8e8'; ctx.beginPath(); ctx.arc(cx, cy, R, PI, 2 * PI); ctx.stroke();
    ctx.strokeStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(cx, cy, R, PI, PI + PI * fr); ctx.stroke();
    text(fplain(P) + ' W', cx, cy - 12, { align: 'center', font: '700 20px "IBM Plex Mono",monospace' });
    text(fplain(P / 746) + ' hp', cx, cy + 8, { align: 'center', font: '600 12px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('0', cx - R - 4, cy + 18, { align: 'center', font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' }); text((Pm === 100000 ? '100 000' : fplain(Pm)) + ' W', cx + R, cy + 18, { align: 'center', font: '500 10px "IBM Plex Mono",monospace', col: '#8a8a8a' });
  }
};
