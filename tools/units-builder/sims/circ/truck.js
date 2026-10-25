// Box on a Truck: static vs kinetic friction, and when you can (and can't) treat two objects as one system.
const SIM = {
  title: 'Box on a Truck',
  modes: [{ id: 'speed', label: 'Speeding up' }, { id: 'const', label: 'Constant speed' }, { id: 'brake', label: 'Braking' }],
  ivs(mode){
    const l = [];
    if (mode === 'const') l.push({ id: 'v', sym: 'v', symText: 'v', label: 'Truck speed', unit: 'm/s', min: 0, max: 30, step: 0.5, val: 20, graph: true });
    else l.push({ id: 'a', sym: 'a', symText: 'a', label: mode === 'brake' ? 'Truck’s braking (slowing) rate' : 'Truck’s acceleration', unit: 'm/s²', min: 0, max: 8, step: 0.1, val: 2, graph: true });
    l.push({ id: 'm', sym: 'm', symText: 'm', label: 'Box mass', unit: 'kg', min: 5, max: 100, step: 1, val: 40 },
      { id: 'mus', sym: 'μ<sub>s</sub>', symText: 'μs', label: 'Static friction', unit: '', min: 0, max: 1, step: 0.01, val: 0.4, show: v => v.toFixed(2) },
      { id: 'muk', sym: 'μ<sub>k</sub>', symText: 'μk', label: 'Kinetic friction', unit: '', min: 0, max: 1, step: 0.01, val: 0.3, show: v => v.toFixed(2) },
      { id: 'M', sym: 'M', symText: 'M', label: 'Truck mass', unit: 'kg', min: 1000, max: 4000, step: 50, val: 2000 });
    return l;
  },
  presets: [{ label: 'Gentle', v: { a: 1 } }, { label: 'Just about to slip', v: { a: 4, mus: 0.4 } }, { label: 'Floor it', v: { a: 6 } }, { label: 'Icy bed', v: { mus: 0.1, muk: 0.05 } }],
  calc(v, mode){
    const at = mode === 'speed' ? v.a : mode === 'brake' ? -v.a : 0, dir = Math.sign(at);
    const W = v.m * G10, N = W, fmax = v.mus * N, need = v.m * Math.abs(at), mukE = Math.min(v.muk, v.mus);
    const sticks = need <= fmax + 1e-9;
    let f, abox;
    if (sticks){ f = v.m * at; abox = at; } else { f = dir * mukE * N; abox = f / v.m; }
    const arel = abox - at, dEdge = 1.2, tSlide = sticks ? Infinity : Math.sqrt(2 * dEdge / Math.abs(arel));
    const Froad = sticks ? (v.M + v.m) * at : v.M * at + f;
    return { at, dir, W, N, fmax, need, f, abox, arel, sticks, tSlide, dEdge, Froad, amax: v.mus * G10, mukE, mukBad: v.muk > v.mus };
  },
  dvs(mode){
    if (mode === 'const') return [
      { id: 'f', name: 'Friction on the box', short: 'f', sym: 'f', unit: 'N', f: d => Math.abs(d.f), vs: 'fmax' },
      { id: 'fmax', name: 'Max static friction μ_s mg', short: 'f_s,max', sym: 'f<sub>s,max</sub>', unit: 'N', f: d => d.fmax },
      { id: 'N', name: 'Normal force on the box', short: 'N', sym: 'N', unit: 'N', f: d => d.N }];
    return [
      { id: 'f', name: 'Friction on the box', short: 'f', sym: 'f', unit: 'N', f: d => Math.abs(d.f), vs: 'fmax' },
      { id: 'abox', name: 'Box’s acceleration (ground frame)', short: 'a_box', sym: 'a<sub>box</sub>', unit: 'm/s²', f: d => Math.abs(d.abox) },
      { id: 'arel', name: 'Box slipping (relative to the truck)', short: 'a_rel', sym: 'a<sub>rel</sub>', unit: 'm/s²', f: d => Math.abs(d.arel) },
      { id: 'Froad', name: 'Road force on the truck', short: 'F_road', sym: 'F<sub>road</sub>', unit: 'N', f: d => Math.abs(d.Froad) },
      { id: 'fmax', name: 'Max static friction μ_s mg', short: 'f_s,max', sym: 'f<sub>s,max</sub>', unit: 'N', f: d => d.fmax }];
  },
  work(v, d, mode){
    const fwd = mode === 'speed' ? 'forward' : 'backward', end = mode === 'speed' ? 'tailgate' : 'cab';
    let h = '<h4>1 · Free-body diagram of the box</h4><div class="eq">Weight mg down, normal force N up, and friction from the truck bed. Friction is the <b>only</b> horizontal force on the box.</div>' +
      '<div class="eq">Vertical: N = mg = (' + H.iv('m') + ')(' + H.g() + ') = ' + H.n(d.N, 'N') + '</div>';
    if (mode === 'const') return h +
      '<h4>2 · Constant velocity → a = 0 → ΣF = 0</h4><div class="eq">The only horizontal force is friction, so f = <b>0 N</b>, whether the truck goes ' + H.iv('v') + ' or 0 m/s.</div>' +
      '<p class="note">Common mistake: “friction pushes the box forward to keep it moving.” Newton’s 1st law: nothing is needed to <i>keep</i> it moving at constant velocity.</p>' +
      '<h4>3 · Whole system (truck + box)</h4><div class="eq">ΣF = (M + m)(0) = 0. The road’s push forward on the tires just balances air resistance and rolling friction (ignored here).</div>' +
      '<h4>4 · How far could the truck accelerate before the box slips?</h4><div class="eq">a<sub>max</sub> = μ<sub>s</sub>g = (' + H.iv('mus') + ')(' + H.g() + ') = ' + H.n(d.amax, 'm/s²') + '. Try “Speeding up.”</div>';
    h += '<h4>2 · Friction needed for the box to keep up with the truck</h4><div class="eq">f = ma = (' + H.iv('m') + ')(' + H.iv('a') + ') = <b>' + H.n(d.need, 'N') + '</b>, pointing <b>' + fwd + '</b> (the same way the truck accelerates)</div>' +
      '<h4>3 · The most static friction can give</h4><div class="eq">f<sub>s,max</sub> = μ<sub>s</sub>N = (' + H.iv('mus') + ')(' + H.n(d.N, 'N') + ') = <b>' + H.n(d.fmax, 'N') + '</b></div>' +
      '<h4>4 · Compare</h4>';
    if (d.sticks) h += '<div class="eq">' + H.n(d.need, 'N') + ' ≤ ' + H.n(d.fmax, 'N') + ' → static friction can do it. The box <b>moves with the truck</b>: a<sub>box</sub> = ' + H.n(Math.abs(d.at), 'm/s²') + ', f = ' + H.n(d.need, 'N') + ' (not μ<sub>s</sub>N!)</div>' +
      '<p class="note">Static friction is only as big as it needs to be. μ<sub>s</sub>N is the <i>limit</i>, not the value.</p>';
    else h += '<div class="bad">' + H.n(d.need, 'N') + ' > ' + H.n(d.fmax, 'N') + ' → static friction can’t keep up. The box <b>slides</b> toward the ' + end + '.</div>' +
      '<div class="eq">Now it’s kinetic: f<sub>k</sub> = μ<sub>k</sub>N = (' + H.iv('muk') + ')(' + H.n(d.N, 'N') + ') = ' + H.n(Math.abs(d.f), 'N') + '</div>' +
      (d.mukBad ? '<p class="note">μ<sub>k</sub> is set above μ<sub>s</sub>, which real surfaces don’t do. Using μ<sub>k</sub> = μ<sub>s</sub>.</p>' : '') +
      '<div class="eq">a<sub>box</sub> = f<sub>k</sub>/m = μ<sub>k</sub>g = <b>' + H.n(Math.abs(d.abox), 'm/s²') + '</b> ' + fwd + ' (ground frame): it still speeds ' + (mode === 'speed' ? 'up' : 'down') + ', just less than the truck</div>' +
      '<div class="eq">Relative to the truck: a<sub>rel</sub> = ' + H.n(Math.abs(d.at)) + ' − ' + H.n(Math.abs(d.abox)) + ' = ' + H.n(Math.abs(d.arel), 'm/s²') + ' toward the ' + end + '. It reaches it (' + H.n(d.dEdge, 'm') + ' away) after t = √(2d/a<sub>rel</sub>) = ' + H.n(d.tSlide, 's') + '</div>';
    h += '<div class="eq">Biggest acceleration with no slipping: a<sub>max</sub> = μ<sub>s</sub>mg/m = μ<sub>s</sub>g = ' + H.n(d.amax, 'm/s²') + ' (the mass cancels)</div>' +
      '<h4>5 · The system: truck + box</h4>';
    if (d.sticks) h += '<div class="eq">Same acceleration, so treat them as one object. Friction between them is internal and cancels.</div>' +
      '<div class="eq">F<sub>road</sub> = (M + m)a = (' + H.iv('M') + ' + ' + H.iv('m') + ')(' + H.iv('a') + ') = <b>' + H.n(Math.abs(d.Froad), 'N') + '</b> ' + fwd + '</div>';
    else h += '<div class="eq">Different accelerations, so you <b>can’t</b> use (M + m)a. Do the truck by itself instead:</div>' +
      '<div class="eq">F<sub>road</sub> − f = Ma → F<sub>road</sub> = Ma + f = (' + H.iv('M') + ')(' + H.iv('a') + ') + ' + H.n(Math.abs(d.f)) + ' = <b>' + H.n(Math.abs(d.Froad), 'N') + '</b> ' + fwd + '</div>';
    h += '<h4>6 · Newton’s third law</h4><div class="eq">The bed pushes the box ' + fwd + ' with ' + H.n(Math.abs(d.f), 'N') + '; the box pushes the bed ' + (mode === 'speed' ? 'backward' : 'forward') + ' with ' + H.n(Math.abs(d.f), 'N') + '.</div>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    panelTitle(mode === 'speed' ? 'TRUCK SPEEDING UP →' : mode === 'brake' ? 'TRUCK BRAKING (moving →)' : 'TRUCK AT CONSTANT SPEED →', 10, 18);
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const px = 60, x0 = 40, bedL = 3, bedY = 196, roadY = 262, wr = 16;
    const bs = 22 + 3 * Math.sqrt(v.m), hb = bs / 2 / px;            // box size (px) and half-size (m)
    const T = d.sticks ? 4 : Math.min(d.tSlide, 6) + 2.2, tt = A.t % T;
    const v0 = mode === 'speed' ? 2 : mode === 'brake' ? Math.max(12, v.a * T + 1) : v.v;
    const xt = v0 * tt + 0.5 * d.at * tt * tt, vt = v0 + d.at * tt;  // truck position and speed (ground)
    // box position relative to the bed centre (m)
    const start = mode === 'brake' ? bedL / 2 - d.dEdge - hb : -bedL / 2 + d.dEdge + hb;
    let xr = start, yOff = 0, rot = 0, off = false, hit = false;
    if (!d.sticks){
      const ts = Math.min(tt, d.tSlide); xr = start + 0.5 * d.arel * ts * ts;
      if (tt > d.tSlide){
        if (mode === 'brake'){ xr = bedL / 2 - hb; hit = true; }                     // against the cab
        else { const u = tt - d.tSlide, vrel = d.arel * d.tSlide;      // off the back: no more friction, falls
          xr = start + 0.5 * d.arel * d.tSlide * d.tSlide + vrel * u - 0.5 * d.at * u * u; yOff = Math.min(0.5 * G10 * u * u * px, roadY - bedY); rot = Math.min(u * 4, 1.2); off = true; }
      }
    }
    // road with moving dashes
    ctx.fillStyle = '#d6d6d6'; ctx.fillRect(0, roadY, 380, 26); ctx.fillStyle = '#fff';
    const sp = 150, sh = ((xt * px) % sp + sp) % sp; for (let x = -sp; x < 420; x += sp) ctx.fillRect(x - sh, roadY + 11, 60, 4);
    // truck
    const bx0 = x0, bx1 = x0 + bedL * px, cab1 = bx1 + 70;
    ctx.fillStyle = '#333'; ctx.fillRect(bx0, bedY + 14, cab1 - bx0, 14);
    ctx.fillStyle = '#9aa7b8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(bx0, bedY, bx1 - bx0, 14); ctx.strokeRect(bx0, bedY, bx1 - bx0, 14);
    ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.moveTo(bx1, bedY + 14); ctx.lineTo(bx1, bedY - 60); ctx.lineTo(bx1 + 42, bedY - 60); ctx.lineTo(cab1, bedY - 22); ctx.lineTo(cab1, bedY + 14); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#cfe0ff'; ctx.beginPath(); ctx.moveTo(bx1 + 8, bedY - 52); ctx.lineTo(bx1 + 38, bedY - 52); ctx.lineTo(cab1 - 8, bedY - 24); ctx.lineTo(bx1 + 8, bedY - 24); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9aa7b8'; ctx.fillRect(bx1 - 4, bedY - 26, 4, 26);   // bed front wall
    [bx0 + 40, bx1 - 40, cab1 - 30].forEach(wx => { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(wx, roadY - wr, wr, 0, 7); ctx.fill(); ctx.fillStyle = '#bbb'; ctx.beginPath(); ctx.arc(wx, roadY - wr, 6, 0, 7); ctx.fill();
      const an = xt / 0.4; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(wx, roadY - wr); ctx.lineTo(wx + 12 * Math.cos(an), roadY - wr + 12 * Math.sin(an)); ctx.stroke(); });
    // box
    const bcx = bx0 + bedL * px / 2 + xr * px, bcy = bedY - bs / 2 + yOff;
    if (bcx > -60){ ctx.save(); ctx.translate(bcx, bcy); ctx.rotate(-rot); ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(-bs / 2, -bs / 2, bs, bs); ctx.strokeRect(-bs / 2, -bs / 2, bs, bs); ctx.restore(); }
    // arrows
    if (d.at !== 0) arrow(cab1 - 40, bedY - 78, cab1 - 40 + d.at * 9, bedY - 78, COL.V, 'a_truck', { w: 3, lx: 0, ly: -12, align: 'center' });
    if (!off && !hit && Math.abs(d.f) > 0.01){
      const fl = 14 + 40 * Math.abs(d.f) / Math.max(d.fmax, d.need, 1);
      arrow(bcx, bedY - 3, bcx + Math.sign(d.f) * fl, bedY - 3, COL.F, d.sticks ? 'f_s' : 'f_k', { w: 3, lx: Math.sign(d.f) * 4, ly: -9 });
      if (Math.abs(d.abox) > 0.01) arrow(bcx, bcy - bs / 2 - 12, bcx + d.abox * 9, bcy - bs / 2 - 12, COL.V, 'a_box', { w: 2.5, lx: 0, ly: -11, align: 'center' });
    }
    const msg = mode === 'const' ? 'box rides along: no friction needed' : d.sticks ? 'box moves with the truck (static friction)' : mode === 'speed' ? 'box slides toward the tailgate (kinetic)' : 'box slides into the cab (kinetic)';
    text(msg, 12, 300, { font: '700 13px "Space Grotesk",sans-serif', col: d.sticks ? '#1e7d45' : '#c43a00' });
    text('truck v = ' + fplain(Math.max(0, vt)) + ' m/s' + (off ? '   box fell off the back!' : hit ? '   box hit the cab' : ''), 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // right: free-body diagram of the box and the friction comparison
    panelTitle('FORCES ON THE BOX', 395, 18);
    const fx = 490, fy = 120, s = 26, sc = 55 / Math.max(d.W, d.fmax, d.need, 1);
    ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(fx - s / 2, fy - s / 2, s, s); ctx.strokeRect(fx - s / 2, fy - s / 2, s, s);
    arrow(fx, fy, fx, fy + d.W * sc + s / 2, COL.W, 'mg', { lx: 6, ly: 0 });
    arrow(fx, fy, fx, fy - d.N * sc - s / 2, COL.N, 'N', { lx: 6, ly: 0 });
    if (Math.abs(d.f) > 0.01) arrow(fx + Math.sign(d.f) * s / 2, fy + s / 2, fx + Math.sign(d.f) * (s / 2 + Math.abs(d.f) * sc), fy + s / 2, COL.F, 'f', { lx: Math.sign(d.f) * 6, ly: 0 });
    // bars: friction needed vs available
    const by = 228, bmax = Math.max(d.fmax, d.need, 1), bw = 95;
    const bar = (y, val, col, lab) => { ctx.fillStyle = col; ctx.fillRect(458, y, bw * val / bmax, 13); text(lab, 453, y + 10, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(val) + ' N', 462 + bw * val / bmax, y + 10, { font: '600 10px "IBM Plex Mono",monospace' }); };
    bar(by, d.need, d.sticks ? '#1e7d45' : '#c43a00', 'needed ma');
    bar(by + 20, d.fmax, '#8a8a8a', 'max μs·N');
    if (!d.sticks) bar(by + 40, Math.abs(d.f), COL.F, 'kinetic μk·N');
    text('F_road on truck: ' + fplain(Math.abs(d.Froad)) + ' N', 395, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
