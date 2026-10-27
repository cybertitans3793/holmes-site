// Superposition & Boundaries (AP 14.3, 14.6; IB C.3): two pulses passing through each other, pulses reflecting and transmitting at a boundary, and beats from two close frequencies.
const bump = (x, c, w) => Math.exp(-Math.pow((x - c) / w, 2));
const SIM = {
  title: 'Superposition & Boundaries',
  hint: 'y = y₁ + y₂',
  modes: [{ id: 'super', label: 'Two pulses' }, { id: 'bound', label: 'Pulse at a boundary' }, { id: 'beats', label: 'Beats' }],
  opts: [{ id: 'end', label: 'Boundary', modes: ['bound'], choices: [['fixed', 'Fixed end'], ['free', 'Free end'], ['join', 'Second string']] }],
  ivs(mode, opt){
    if (mode === 'beats') return [
      { id: 'f1', sym: 'f<sub>1</sub>', symText: 'f1', label: 'Tuning fork', unit: 'Hz', min: 200, max: 280, step: 0.5, val: 256 },
      { id: 'f2', sym: 'f<sub>2</sub>', symText: 'f2', label: 'Guitar string', unit: 'Hz', min: 200, max: 280, step: 0.5, val: 252, graph: true }];
    if (mode === 'bound'){ const a = [
      { id: 't', sym: 't', symText: 't', label: 'Time', unit: 's', min: 0, max: 5, step: 0.02, val: 1.5, graph: true },
      { id: 'A', sym: 'A', symText: 'A', label: 'Incident pulse height', unit: 'cm', min: 0.5, max: 3, step: 0.1, val: 2 }];
      if ((opt && opt.end) === 'join') a.push({ id: 'mu', sym: 'μ<sub>2</sub>/μ<sub>1</sub>', symText: 'μ2/μ1', label: 'Mass per length, string 2 ÷ string 1', unit: '', min: 0.1, max: 9, step: 0.05, val: 4, show: x => '×' + x.toFixed(2) });
      return a; }
    return [
      { id: 't', sym: 't', symText: 't', label: 'Time', unit: 's', min: 0, max: 4, step: 0.02, val: 1.2, graph: true },
      { id: 'A1', sym: 'A<sub>1</sub>', symText: 'A1', label: 'Pulse 1 height (moving right)', unit: 'cm', min: -3, max: 3, step: 0.1, val: 2 },
      { id: 'A2', sym: 'A<sub>2</sub>', symText: 'A2', label: 'Pulse 2 height (moving left)', unit: 'cm', min: -3, max: 3, step: 0.1, val: 1 }];
  },
  presets: [{ label: 'Overlap', mode: 'super', v: { t: 2 } }, { label: 'Equal and opposite', mode: 'super', v: { t: 2, A1: 2, A2: -2 } }, { label: 'After reflection', mode: 'bound', v: { t: 4 } }, { label: 'Close frequencies', mode: 'beats', v: { f1: 256, f2: 254 } }],
  calc(v, mode, opt){
    if (mode === 'beats'){ const fb = Math.abs(v.f1 - v.f2); return { fb, Tb: fb > 0 ? 1 / fb : Infinity, fav: (v.f1 + v.f2) / 2 }; }
    if (mode === 'bound'){ const end = opt.end || 'fixed', v1 = 1, xb = 3.5, x0 = 1, w = 0.35, v2 = end === 'fixed' ? 0 : end === 'free' ? Infinity : v1 / Math.sqrt(v.mu);
      const r = end === 'fixed' ? -1 : end === 'free' ? 1 : (v2 - v1) / (v2 + v1), tr = end === 'join' ? 2 * v2 / (v1 + v2) : 0;
      const c = x0 + v1 * v.t, y = x => x <= xb ? v.A * (bump(x, c, w) + r * bump(x, 2 * xb - c, w)) : end === 'join' ? v.A * tr * bump(xb + (x - xb) * v1 / v2, c, w) : 0;
      const hit = c > xb; return { end, v1, v2, xb, r, tr, y, hit, Ar: r * v.A, At: tr * v.A, yr: hit ? r * v.A : 0 }; }
    const c1 = 1 + v.t, c2 = 5 - v.t, w = 0.35, y = x => v.A1 * bump(x, c1, w) + v.A2 * bump(x, c2, w);
    return { c1, c2, y, ymid: y(3), sep: Math.abs(c2 - c1) };
  },
  dvs(mode){
    if (mode === 'beats') return [{ id: 'fb', name: 'Beat frequency', short: 'f_beat', sym: 'f<sub>beat</sub>', unit: 'Hz', f: d => d.fb }];
    if (mode === 'bound') return [{ id: 'yb', name: 'Displacement 1 m before the boundary', short: 'y', sym: 'y', unit: 'cm', f: d => d.y(2.5) }, { id: 'yr', name: 'Height of the reflected pulse', short: 'A_r', sym: 'A<sub>r</sub>', unit: 'cm', f: d => d.yr }];
    return [{ id: 'ym', name: 'Displacement at the midpoint (x = 3 m)', short: 'y_mid', sym: 'y<sub>mid</sub>', unit: 'cm', f: d => d.ymid }];
  },
  work(v, d, mode){
    if (mode === 'beats') return '<h4>1 · Two close frequencies interfere</h4><div class="eq">The two waves drift in and out of step: in step → constructive (loud); half a cycle apart → destructive (quiet).</div>' +
      '<h4>2 · Beat frequency</h4><div class="eq">f<sub>beat</sub> = |f₁ − f₂| = |' + H.iv('f1') + ' − ' + H.iv('f2') + '| = <b>' + H.n(d.fb, 'Hz') + '</b>' + (d.fb > 0 ? ' → one loud pulse every <b>' + H.n(d.Tb, 's') + '</b>' : ' → no beats: perfectly in tune') + '</div>' +
      '<p class="note">You hear a pitch of about (f₁ + f₂)/2 = ' + fnum(d.fav) + ' Hz getting louder and softer. Tuning: tighten the string; if the beats slow down you are getting closer. The beats can’t tell you which one is higher — only how far apart they are.</p>';
    if (mode === 'bound'){
      const kind = { fixed: 'A fixed end can’t move. The string pulls down on the wall; the wall pulls back and sends the pulse back <b>inverted</b>.', free: 'A free end (ring on a pole) overshoots, so the pulse comes back <b>upright</b>.', join: d.v2 < d.v1 ? 'Into a heavier (slower) string: reflected pulse <b>inverted</b>, transmitted pulse upright and narrower.' : d.v2 > d.v1 ? 'Into a lighter (faster) string: reflected pulse <b>upright</b>, transmitted pulse upright and wider.' : 'Same strings: no boundary, nothing reflects.' }[d.end];
      return '<h4>1 · What happens at the boundary</h4><div class="eq">' + kind + '</div>' +
        (d.end === 'join' ? '<h4>2 · Speed in each string: v = √(F<sub>T</sub>/μ)</h4><div class="eq">Same tension, so v₂ = v₁/√(μ₂/μ₁) = 1/√' + fnum(v.mu) + ' = <b>' + H.n(d.v2, 'm/s') + '</b></div>' +
          '<h4>3 · Reflected and transmitted heights</h4><div class="eq">reflected = A(v₂ − v₁)/(v₂ + v₁) = <b>' + H.n(d.Ar, 'cm') + '</b>; transmitted = A·2v₂/(v₁ + v₂) = <b>' + H.n(d.At, 'cm') + '</b></div><p class="note">You don’t need these formulas for the exam, just the signs: slower → inverted; faster → upright. The frequency is the same in both strings.</p>'
          : '<h4>2 · Reflected pulse</h4><div class="eq">height = ' + (d.r < 0 ? '−' : '+') + H.iv('A') + '; it travels back at the same speed, so it reaches its start at t = 5 s.</div><p class="note">The energy all reflects; nothing is transmitted.</p>');
    }
    return '<h4>1 · Where are the pulses?</h4><div class="eq">Both move at 1 m/s. Pulse 1 centre: 1 + t = ' + fnum(d.c1) + ' m. Pulse 2 centre: 5 − t = ' + fnum(d.c2) + ' m.</div>' +
      '<h4>2 · Superposition</h4><div class="eq">At any point, y = y₁ + y₂. Midpoint (x = 3 m): y = <b>' + H.n(d.ymid, 'cm') + '</b>' + (Math.abs(d.c1 - 3) < 0.03 ? ' = A₁ + A₂ (fully overlapped)' : '') + '</div>' +
      '<p class="note">Pulses pass <b>through</b> each other and come out unchanged. ' + (v.A1 * v.A2 < 0 ? 'Equal and opposite pulses cancel for an instant — but the string is still moving, so the energy is kinetic, not gone.' : 'Same-side pulses add: constructive interference.') + '</p>';
  },
  draw(v, d, mode, opt, t){
    const X0 = 20, PX = 60, line = (f, y0, sc, col, x1, x2) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let px = x1; px <= x2; px += 1.5){ const y = y0 - sc * f((px - X0) / PX); px === x1 ? ctx.moveTo(px, y) : ctx.lineTo(px, y); } ctx.stroke(); };
    if (mode === 'beats'){
      panelTitle('EACH WAVE (FIRST 0.03 s)', 10, 18);
      const w1 = 2 * PI * v.f1, w2 = 2 * PI * v.f2, sw = (f, y0, col) => { ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.beginPath(); for (let i = 0; i <= 360; i++){ const tt = 0.03 * i / 360, y = y0 - 14 * f(tt); i ? ctx.lineTo(X0 + i, y) : ctx.moveTo(X0, y); } ctx.stroke(); };
      sw(tt => Math.sin(w1 * tt), 50, '#1546d6'); sw(tt => Math.sin(w2 * tt), 90, '#c43a00');
      text('fork ' + v.f1 + ' Hz', 385, 38, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#1546d6' }); text('string ' + v.f2 + ' Hz', 385, 78, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#c43a00' });
      panelTitle('SUM OVER 1 SECOND', 10, 136);
      const y0 = 215; ctx.strokeStyle = '#111'; ctx.lineWidth = 0.7; ctx.beginPath(); for (let i = 0; i <= 1440; i++){ const tt = i / 1440, y = y0 - 28 * (Math.sin(w1 * tt) + Math.sin(w2 * tt)); i ? ctx.lineTo(X0 + i / 4, y) : ctx.moveTo(X0, y); } ctx.stroke();
      ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.beginPath(); for (let i = 0; i <= 360; i++){ const tt = i / 360, e = 56 * Math.abs(Math.cos(PI * (v.f1 - v.f2) * tt)); i ? ctx.lineTo(X0 + i, y0 - e) : ctx.moveTo(X0, y0 - e); } ctx.stroke(); ctx.setLineDash([]);
      text('0 s', X0, 300, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('1 s', X0 + 360, 300, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text('loudness envelope (dashed)', 200, 300, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#ff6a2b' });
      panelTitle('WHAT YOU HEAR', 395, 18);
      const on = d.fb > 0 ? Math.abs(Math.cos(PI * d.fb * t)) : 1; ctx.fillStyle = 'rgba(255,106,43,' + (0.15 + 0.85 * on) + ')'; ctx.beginPath(); ctx.arc(490, 110, 20 + 30 * on, 0, 7); ctx.fill();
      text('f_beat = ' + fplain(d.fb) + ' Hz', 490, 200, { align: 'center', font: '700 15px "Space Grotesk",sans-serif' }); text(d.fb > 0 ? d.fb + ' loud pulses per second' : 'in tune: steady tone', 490, 222, { align: 'center', font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    if (mode === 'bound'){
      panelTitle(({ fixed: 'PULSE HITTING A FIXED END', free: 'PULSE HITTING A FREE END', join: 'LIGHT STRING → SECOND STRING' })[d.end], 10, 18);
      const y0 = 140, sc = 18, xbp = X0 + d.xb * PX;
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, y0); ctx.lineTo(385, y0); ctx.stroke();
      if (d.end === 'join'){ line(d.y, y0, sc, '#1546d6', X0, xbp); ctx.save(); line(d.y, y0, sc, '#111', xbp, 385); ctx.restore(); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(xbp, y0 - sc * d.y(d.xb), 4, 0, 7); ctx.fill();
        text('v₁ = 1 m/s', X0 + 10, 230, { font: '600 11px "IBM Plex Mono",monospace', col: '#1546d6' }); text('v₂ = ' + fplain(d.v2) + ' m/s', xbp + 6, 230, { font: '600 11px "IBM Plex Mono",monospace' }); text(v.mu > 1 ? 'heavier' : v.mu < 1 ? 'lighter' : 'same', xbp + 6, 246, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
      else { line(d.y, y0, sc, '#1546d6', X0, xbp);
        if (d.end === 'fixed'){ ctx.fillStyle = '#555'; ctx.fillRect(xbp, 60, 14, 160); ctx.strokeStyle = '#fff'; for (let y = 64; y < 220; y += 12){ ctx.beginPath(); ctx.moveTo(xbp, y + 10); ctx.lineTo(xbp + 12, y); ctx.stroke(); } }
        else { ctx.fillStyle = '#555'; ctx.fillRect(xbp + 6, 60, 6, 160); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(xbp + 9, y0 - sc * d.y(d.xb), 6, 4, 0, 0, 7); ctx.stroke(); } }
      const c = 1 + v.t; if (!d.hit) arrow(X0 + c * PX - 20, 70, X0 + c * PX + 20, 70, '#4a4a4a', null, { w: 2, head: 7 });
      else { const cr = 2 * d.xb - c; if (cr > 0) arrow(X0 + cr * PX + 20, 70, X0 + cr * PX - 20, 70, '#4a4a4a', null, { w: 2, head: 7 }); }
      text('t = ' + v.t.toFixed(2) + ' s', 12, 310, { font: '700 13px "Space Grotesk",sans-serif' });
      panelTitle('RULES', 395, 18);
      [['Fixed end', 'inverted'], ['Free end', 'upright'], ['Into slower', 'reflection inverted'], ['Into faster', 'reflection upright'], ['Transmitted', 'always upright'], ['Frequency', 'never changes']].forEach(([a, b], i) => { text(a, 400, 50 + i * 30, { font: '700 12px "Space Grotesk",sans-serif' }); text(b, 400, 64 + i * 30, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); });
      return;
    }
    panelTitle('TWO PULSES ON A STRING', 10, 18);
    const y0 = 150, sc = 18;
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, y0); ctx.lineTo(385, y0); ctx.stroke();
    ctx.setLineDash([4, 4]); line(x => v.A1 * bump(x, d.c1, 0.35), y0, sc, 'rgba(21,70,214,0.6)', X0, 380); line(x => v.A2 * bump(x, d.c2, 0.35), y0, sc, 'rgba(196,58,0,0.6)', X0, 380); ctx.setLineDash([]);
    line(d.y, y0, sc, '#111', X0, 380);
    ctx.strokeStyle = '#ff6a2b'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X0 + 3 * PX, 40); ctx.lineTo(X0 + 3 * PX, 260); ctx.stroke(); ctx.setLineDash([]); text('x = 3 m', X0 + 3 * PX, 274, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#ff6a2b' });
    arrow(X0 + d.c1 * PX - 18, 40, X0 + d.c1 * PX + 18, 40, '#1546d6', null, { w: 2, head: 7 }); arrow(X0 + d.c2 * PX + 18, 52, X0 + d.c2 * PX - 18, 52, '#c43a00', null, { w: 2, head: 7 });
    text('t = ' + v.t.toFixed(2) + ' s', 12, 310, { font: '700 13px "Space Grotesk",sans-serif' }); text('dashed: each pulse alone · black: the string', 120, 310, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    panelTitle('MIDPOINT DISPLACEMENT', 395, 18);
    const gx = 405, gy = 160, gw = 180; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy - 90); ctx.lineTo(gx, gy + 90); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 120; i++){ const tt = 4 * i / 120, y = v.A1 * bump(3, 1 + tt, 0.35) + v.A2 * bump(3, 5 - tt, 0.35); i ? ctx.lineTo(gx + gw * i / 120, gy - 15 * y) : ctx.moveTo(gx, gy - 15 * y); } ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(gx + gw * v.t / 4, gy - 15 * d.ymid, 5, 0, 7); ctx.fill(); text('t (0–4 s)', gx + gw, gy + 14, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
