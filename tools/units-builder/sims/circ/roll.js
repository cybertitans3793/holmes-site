// Rolling Race: rolling objects split their kinetic energy between moving and spinning. v = √(2gh/(1+k)) with I = kMR².
const RSH = [['ball', 'Solid ball', 0.4, '#1546d6'], ['disk', 'Disk', 0.5, '#7a3fb0'], ['shell', 'Hollow ball', 2 / 3, '#1e7d45'], ['hoop', 'Hoop', 1, '#c43a00'], ['block', 'Sliding block (no friction)', 0, '#888']];
const SIM = {
  title: 'Rolling Race',
  modes: [{ id: 'down', label: 'Race down the ramp' }, { id: 'up', label: 'Roll up a hill' }],
  opts: [{ id: 'shape', label: 'Show work for', choices: RSH.map(s => [s[0], s[1].replace(' (no friction)', '')]) }],
  ivs(mode){
    const l = mode === 'down' ? [{ id: 'h', sym: 'h', symText: 'h', label: 'Ramp height', unit: 'm', min: 0.2, max: 3, step: 0.05, val: 1, graph: true },
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Ramp angle', unit: '°', min: 5, max: 60, step: 1, val: 20, show: x => x.toFixed(0) + '°' }]
      : [{ id: 'v0', sym: 'v<sub>0</sub>', symText: 'v0', label: 'Rolling speed at the bottom', unit: 'm/s', min: 0.5, max: 8, step: 0.1, val: 4, graph: true }];
    l.push({ id: 'M', sym: 'M', symText: 'M', label: 'Mass', unit: 'kg', min: 0.2, max: 5, step: 0.1, val: 1 }, { id: 'R', sym: 'R', symText: 'R', label: 'Radius', unit: 'm', min: 0.02, max: 0.3, step: 0.01, val: 0.1 });
    return l;
  },
  calc(v, mode, opt){
    const s = RSH.find(x => x[0] === (opt.shape || 'ball')), k = s[2];
    if (mode === 'down'){ const L = v.h / Math.sin(v.th * DEG), aOf = kk => G10 * Math.sin(v.th * DEG) / (1 + kk), vOf = kk => Math.sqrt(2 * G10 * v.h / (1 + kk)), tOf = kk => Math.sqrt(2 * L / aOf(kk));
      const vb = vOf(k), E = v.M * G10 * v.h, Kt = 0.5 * v.M * vb * vb, Kr = E - Kt;
      return { s, k, L, vb, a: aOf(k), t: tOf(k), E, Kt, Kr, w: vb / v.R, times: RSH.map(x => tOf(x[2])), aOf, tOf }; }
    const E = 0.5 * v.M * v.v0 * v.v0 * (1 + k), hmax = E / (v.M * G10), Kt = 0.5 * v.M * v.v0 * v.v0, Kr = E - Kt;
    return { s, k, E, hmax, Kt, Kr, w: v.v0 / v.R, heights: RSH.map(x => v.v0 * v.v0 * (1 + x[2]) / (2 * G10)) };
  },
  dvs(mode){
    if (mode === 'down') return [{ id: 'vb', name: 'Speed at the bottom', short: 'v', sym: 'v', unit: 'm/s', f: d => d.vb }, { id: 't', name: 'Time to the bottom', short: 't', sym: 't', unit: 's', f: d => d.t }, { id: 'Kr', name: 'Rotational KE at the bottom', short: 'K_rot', sym: 'K<sub>rot</sub>', unit: 'J', f: d => d.Kr }];
    return [{ id: 'hmax', name: 'Height it rolls up to', short: 'h', sym: 'h<sub>max</sub>', unit: 'm', f: d => d.hmax }, { id: 'Kr', name: 'Rotational KE at the bottom', short: 'K_rot', sym: 'K<sub>rot</sub>', unit: 'J', f: d => d.Kr }];
  },
  work(v, d, mode, opt){
    const nm = d.s[1].replace(' (no friction)', ''), kS = d.k === 0 ? '0 (it doesn’t spin)' : d.s[0] === 'ball' ? '⅖' : d.s[0] === 'disk' ? '½' : d.s[0] === 'shell' ? '⅔' : '1';
    const h0 = '<h4>1 · Rolling without slipping: v = Rω</h4><div class="eq">' + nm + ': I = kMR² with k = ' + kS + '</div>' +
      '<div class="eq">K = ½Mv² + ½Iω² = ½Mv² + ½(kMR²)(v/R)² = ½Mv²(1 + k)</div><p class="note">The R’s cancel! Static friction makes it spin but does no work (the contact point doesn’t slide), so energy is conserved.</p>';
    if (mode === 'down') return h0 + '<h4>2 · Energy: Mgh = ½Mv²(1 + k)</h4><div class="eq">v = √(2gh/(1 + k)) = √(2(10)(' + H.iv('h') + ')/' + H.n(1 + d.k) + ') = <b>' + H.n(d.vb, 'm/s') + '</b>. M and R both cancel.</div>' +
      '<h4>3 · Where the energy went</h4><div class="eq">Mgh = ' + H.n(d.E, 'J') + ' → moving ½Mv² = ' + H.n(d.Kt, 'J') + ' + spinning ½Iω² = ' + H.n(d.Kr, 'J') + ' (' + H.n(100 * d.k / (1 + d.k)) + '% spinning)</div>' +
      '<h4>4 · Who wins?</h4><div class="eq">Smaller k → less energy tied up in spinning → faster. Order: block (if frictionless), solid ball, disk, hollow ball, hoop. Time for this one: ' + H.n(d.t, 's') + '.</div>' +
      '<p class="note">A heavy hoop and a light hoop tie. A big ball and a small ball tie. Only the shape (k) matters.</p>';
    return h0 + '<h4>2 · Rolling up: all the KE turns into Mgh</h4><div class="eq">½Mv<sub>0</sub>²(1 + k) = Mgh → h = (1 + k)v<sub>0</sub>²/2g = (' + H.n(1 + d.k) + ')(' + H.iv('v0') + ')² / 20 = <b>' + H.n(d.hmax, 'm') + '</b></div>' +
      '<p class="note">The hoop goes highest: it carries the most spinning energy, and that’s turned into height too. The sliding block (no spin) only reaches v<sub>0</sub>²/2g = ' + H.n(v.v0 * v.v0 / 20, 'm') + '.</p>' +
      '<div class="eq">Energy at the bottom: moving ' + H.n(d.Kt, 'J') + ' + spinning ' + H.n(d.Kr, 'J') + ' = ' + H.n(d.E, 'J') + '</div>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const sel = opt.shape || 'ball';
    if (mode === 'down'){
      panelTitle('FIVE RAMPS, SAME HEIGHT, RELEASED TOGETHER', 10, 18);
      const tmax = Math.max(...d.times), tt = Math.min(A.t % (tmax + 1.5), tmax), lane = 52;
      RSH.forEach((s, i) => { const y0 = 40 + i * lane, x0 = 20, x1 = 360, k = s[2], frac = Math.min(1, 0.5 * d.aOf(k) * tt * tt / d.L);
        ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0 + 6); ctx.lineTo(x1, y0 + 36); ctx.stroke();
        const x = x0 + (x1 - x0) * frac, y = y0 + 6 + 30 * frac, r = 9;
        if (k === 0){ ctx.fillStyle = s[3]; ctx.fillRect(x - 9, y - 14, 18, 14); }
        else { const rot = frac * (x1 - x0) / r; ctx.fillStyle = s[0] === 'hoop' ? '#fff' : s[3]; ctx.strokeStyle = s[3]; ctx.lineWidth = s[0] === 'hoop' ? 4 : 1; ctx.beginPath(); ctx.arc(x, y - r, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#fff'; if (s[0] === 'hoop') ctx.strokeStyle = s[3]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * Math.cos(rot), y - r + r * Math.sin(rot)); ctx.stroke(); }
        text(s[1] + (frac >= 1 ? '  ✓ ' + fplain(d.times[i]) + ' s' : ''), x0, y0 + 2, { font: (s[0] === sel ? '700 ' : '500 ') + '10px "Space Grotesk",sans-serif', col: s[0] === sel ? '#111' : '#666' }); });
      text('t = ' + fplain(tt) + ' s   (ramp drawn the same; real angle ' + fplain(v.th) + '°)', 12, 318, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    } else {
      panelTitle('ROLLING UP A HILL FROM ' + fplain(v.v0) + ' m/s', 10, 18);
      const hm = Math.max(...d.heights), sc = 220 / hm, gy = 290;
      RSH.forEach((s, i) => { const x = 40 + i * 68, hh = d.heights[i];
        ctx.fillStyle = '#eee'; ctx.fillRect(x - 20, gy - 230, 40, 230); ctx.fillStyle = s[3]; ctx.globalAlpha = s[0] === sel ? 1 : 0.55; ctx.fillRect(x - 20, gy - hh * sc, 40, hh * sc); ctx.globalAlpha = 1;
        text(fplain(hh) + ' m', x, gy - hh * sc - 5, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' });
        text(s[1].split(' (')[0], x, gy + 14, { align: 'center', font: (s[0] === sel ? '700 ' : '500 ') + '9px "Space Grotesk",sans-serif' }); });
      text('height reached', 12, 318, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    }
    panelTitle('ENERGY SPLIT: ' + d.s[1].split(' (')[0].toUpperCase(), 395, 18);
    const fr = d.k / (1 + d.k), bw = 180;
    ctx.fillStyle = '#ff6a2b'; ctx.fillRect(400, 50, bw * (1 - fr), 24); ctx.fillStyle = '#7a3fb0'; ctx.fillRect(400 + bw * (1 - fr), 50, bw * fr, 24);
    text('moving ' + fplain(100 * (1 - fr)) + '%', 400, 92, { font: '600 10px "IBM Plex Mono",monospace', col: '#ff6a2b' }); text('spinning ' + fplain(100 * fr) + '%', 580, 92, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#7a3fb0' });
    text(mode === 'down' ? 'v at the bottom = ' + fplain(d.vb) + ' m/s' : 'h = ' + fplain(d.hmax) + ' m', 400, 125, { font: '700 13px "Space Grotesk",sans-serif' });
    text('ω = v/R = ' + fplain(d.w) + ' rad/s', 400, 145, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('M and R cancel: shape matters', 400, 175, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
