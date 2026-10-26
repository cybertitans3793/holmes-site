// Conduction (AP 9.5.B, IB B.1): rate ΔQ/Δt = kAΔT/Δx. Window or wall, rod between boiling water and ice, tile vs bath mat.
const MATS = { glass: ['glass', 0.8], brick: ['brick', 0.6], wood: ['wood', 0.12], foam: ['foam insulation', 0.03], steel: ['steel', 50], al: ['aluminum', 240], cu: ['copper', 400] };
const SIM = {
  title: 'Conduction',
  hint: 'ΔQ/Δt = kAΔT/Δx · L<sub>f</sub>(ice) = 3.34×10⁵ J/kg',
  modes: [{ id: 'wall', label: 'Window or wall' }, { id: 'rod', label: 'Rod: boiling water to ice' }, { id: 'touch', label: 'Tile vs bath mat' }],
  opts: [{ id: 'mw', label: 'Material', modes: ['wall'], choices: [['glass', 'Glass'], ['brick', 'Brick'], ['wood', 'Wood'], ['foam', 'Foam']] },
         { id: 'mr', label: 'Rod', modes: ['rod'], choices: [['cu', 'Copper'], ['al', 'Aluminum'], ['steel', 'Steel'], ['glass', 'Glass']] }],
  ivs(mode){
    if (mode === 'rod') return [
      { id: 'L', sym: 'L', symText: 'L', label: 'Rod length', unit: 'cm', min: 5, max: 100, step: 1, val: 40, graph: true },
      { id: 'A', sym: 'A', symText: 'A', label: 'Cross-sectional area', unit: 'cm²', min: 0.5, max: 10, step: 0.1, val: 2 },
      { id: 'Tc', sym: 'T<sub>cold</sub>', symText: 'Tcold', label: 'Cold end (ice water)', unit: '°C', min: -20, max: 20, step: 1, val: 0 }];
    if (mode === 'touch') return [
      { id: 'Tr', sym: 'T<sub>room</sub>', symText: 'Troom', label: 'Bathroom temperature (tile and mat)', unit: '°C', min: 10, max: 30, step: 1, val: 20, graph: true },
      { id: 'A', sym: 'A', symText: 'A', label: 'Foot contact area', unit: 'cm²', min: 50, max: 200, step: 5, val: 120 }];
    return [
      { id: 'A', sym: 'A', symText: 'A', label: 'Area', unit: 'm²', min: 0.5, max: 10, step: 0.1, val: 2 },
      { id: 'dx', sym: 'Δx', symText: 'dx', label: 'Thickness', unit: 'cm', min: 0.3, max: 30, step: 0.1, val: 0.5, graph: true },
      { id: 'Ti', sym: 'T<sub>in</sub>', symText: 'Tin', label: 'Inside temperature', unit: '°C', min: 15, max: 25, step: 1, val: 20 },
      { id: 'To', sym: 'T<sub>out</sub>', symText: 'Tout', label: 'Outside temperature', unit: '°C', min: -20, max: 15, step: 1, val: 0 }];
  },
  presets: [{ label: 'Double the thickness', mode: 'wall', v: { dx: 1 } }, { label: 'Very cold night', mode: 'wall', v: { To: -20 } }, { label: 'Short fat rod', mode: 'rod', v: { L: 10, A: 8 } }],
  calc(v, mode, opt){
    if (mode === 'rod'){ const [nm, k] = MATS[opt.mr || 'cu'], dT = 100 - v.Tc, P = k * (v.A / 1e4) * dT / (v.L / 100); return { nm, k, dT, P, grad: dT / v.L, melt: P * 60 / 3.34e5 * 1000 }; }
    if (mode === 'touch'){ const dT = 33 - v.Tr, d = 0.01, Pt = 1.0 * (v.A / 1e4) * dT / d, Pm = 0.04 * (v.A / 1e4) * dT / d; return { dT, Pt, Pm, ratio: Pt / Pm }; }
    const [nm, k] = MATS[opt.mw || 'glass'], dT = v.Ti - v.To, P = k * v.A * dT / (v.dx / 100);
    return { nm, k, dT, P, day: P * 86400 / 1e6, kwh: P * 24 / 1000 };
  },
  dvs(mode){
    if (mode === 'touch') return [{ id: 'Pt', name: 'Rate into the tile', short: 'P_tile', sym: 'P<sub>tile</sub>', unit: 'W', f: d => d.Pt, vs: 'Pm' }, { id: 'Pm', name: 'Rate into the mat', short: 'P_mat', sym: 'P<sub>mat</sub>', unit: 'W', f: d => d.Pm }];
    if (mode === 'rod') return [{ id: 'P', name: 'Rate of energy flow', short: 'P', sym: 'ΔQ/Δt', unit: 'W', f: d => d.P }, { id: 'melt', name: 'Ice melted per minute', short: 'ice/min', sym: 'm/min', unit: 'g', f: d => d.melt }];
    return [{ id: 'P', name: 'Rate of energy flow', short: 'P', sym: 'ΔQ/Δt', unit: 'W', f: d => d.P }, { id: 'kwh', name: 'Energy lost per day', short: 'E/day', sym: 'E<sub>day</sub>', unit: 'kWh', f: d => d.kwh }];
  },
  work(v, d, mode){
    if (mode === 'touch') return '<h4>1 · Same temperature, but they don’t feel the same</h4><div class="eq">Tile and mat are both at ' + H.iv('Tr') + '. Your foot is about 33 °C, so ΔT = ' + H.n(d.dT, '°C') + ' for both.</div>' +
      '<h4>2 · What you feel is the RATE energy leaves your foot</h4><div class="eq">Tile (k ≈ 1.0): ΔQ/Δt = kAΔT/Δx = (1.0)(' + fnum(v.A / 1e4) + ')(' + fnum(d.dT) + ')/(0.01) = <b>' + H.n(d.Pt, 'W') + '</b></div>' +
      '<div class="eq">Mat (k ≈ 0.04): <b>' + H.n(d.Pm, 'W') + '</b> → the tile pulls energy ' + fnum(d.ratio) + '× faster</div>' +
      '<p class="note">Thermal conductivity k is a property of the material: how its atoms are arranged and interact (CED 9.5.B.2). “The tile is colder” is the wrong explanation: it isn’t.</p>';
    if (mode === 'rod') return '<h4>1 · Conduction through a rod: ΔQ/Δt = kAΔT/L</h4><div class="eq">' + d.nm + ': k = ' + d.k + ' W/(m·K), A = ' + H.n(v.A / 1e4, 'm²') + ', L = ' + H.n(v.L / 100, 'm') + ', ΔT = 100 − ' + H.p(v.Tc) + ' = ' + H.n(d.dT, '°C') + '</div>' +
      '<div class="eq">ΔQ/Δt = (' + d.k + ')(' + fnum(v.A / 1e4) + ')(' + fnum(d.dT) + ')/(' + fnum(v.L / 100) + ') = <b>' + H.n(d.P, 'W') + '</b></div>' +
      '<h4>2 · Steady state: temperature drops evenly along the rod</h4><div class="eq">Temperature gradient ΔT/L = ' + H.n(d.grad, '°C/cm') + '</div>' +
      '<h4>3 · <span style="color:#7a3fb0">IB</span> Link to latent heat: how fast does it melt the ice?</h4><div class="eq">Mass per minute = (ΔQ/Δt × 60)/L<sub>f</sub> = <b>' + H.n(d.melt, 'g') + '</b></div>' +
      '<p class="note">Double the length → half the rate. Double the area → twice the rate. Lab idea: measure ice melted per minute for rods of different lengths and graph rate vs 1/L.</p>';
    return '<h4>1 · Rate of conduction: ΔQ/Δt = kAΔT/Δx</h4><div class="eq">' + d.nm + ': k = ' + d.k + ' W/(m·K), ΔT = ' + v.Ti + ' − ' + H.p(v.To) + ' = ' + H.n(d.dT, '°C') + ' (same size in K)</div>' +
      '<div class="eq">ΔQ/Δt = (' + d.k + ')(' + H.iv('A') + ')(' + fnum(d.dT) + ')/(' + fnum(v.dx / 100) + ' m) = <b>' + H.n(d.P, 'W') + '</b></div>' +
      '<h4>2 · Over a whole day</h4><div class="eq">E = P × 86 400 s = ' + H.n(d.day, 'MJ') + ' = <b>' + H.n(d.kwh, 'kWh') + '</b></div>' +
      '<p class="note">Rate ∝ A and ΔT, ∝ 1/Δx. Thin glass loses a lot; that’s why houses use double glazing (a trapped air layer, k ≈ 0.025) and foam in the walls.</p>';
  },
  draw(v, d, mode, opt, t){
    const flow = (x1, x2, y, P, Pref) => { const n = Math.max(1, Math.min(7, Math.round(7 * Math.sqrt(P / Pref)))); for (let i = 0; i < n; i++){ const yy = y - 40 + i * 80 / Math.max(1, n - 1) * (n > 1 ? 1 : 0); const ph = ((t * 0.6 + i * 0.13) % 1); arrow(x1 + (x2 - x1) * ph * 0.6, yy, x1 + (x2 - x1) * (ph * 0.6 + 0.4), yy, '#c43a00', null, { w: 2.5, head: 7 }); } };
    if (mode === 'touch'){
      panelTitle('BARE FOOT ON TILE vs BATH MAT (both ' + v.Tr + ' °C)', 10, 18);
      [[60, 'tile', '#e8e4dc', d.Pt], [330, 'mat', '#7fb0d8', d.Pm]].forEach(([x, nm, col, P]) => { ctx.fillStyle = col; ctx.fillRect(x - 30, 220, 220, 60); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(x - 30, 220, 220, 60);
        if (nm === 'tile'){ ctx.strokeStyle = '#bbb'; for (let k = 1; k < 4; k++){ ctx.beginPath(); ctx.moveTo(x - 30 + 55 * k, 220); ctx.lineTo(x - 30 + 55 * k, 280); ctx.stroke(); } }
        ctx.fillStyle = '#f2c7a0'; ctx.beginPath(); ctx.ellipse(x + 80, 200, 70, 22, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.stroke();
        const n = Math.max(1, Math.min(8, Math.round(P / 10))); for (let i = 0; i < n; i++){ const xx = x + 30 + i * 100 / Math.max(1, n - 1) * (n > 1 ? 1 : 0), ph = (t * 0.8 + i * 0.17) % 1; arrow(xx, 212 + ph * 20, xx, 236 + ph * 30, '#c43a00', null, { w: 2.5, head: 7 }); }
        text(nm + ': ' + fplain(P) + ' W', x + 80, 304, { align: 'center', font: '700 14px "Space Grotesk",sans-serif' }); });
      text('arrows = energy leaving your foot', 300, 60, { align: 'center', font: '600 12px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text('tile feels colder: ' + fplain(d.ratio) + '× the rate', 300, 90, { align: 'center', font: '700 16px "Space Grotesk",sans-serif', col: '#c43a00' });
      return;
    }
    if (mode === 'rod'){
      panelTitle('ROD BETWEEN BOILING WATER AND ICE (' + d.nm + ')', 10, 18);
      const x0 = 80, len = 40 + 2.6 * v.L, th = 6 + 3 * v.A;
      ctx.fillStyle = '#ffd2c0'; ctx.fillRect(10, 80, 70, 120); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(10, 80, 70, 120); text('100 °C', 45, 220, { align: 'center', font: '700 11px "IBM Plex Mono",monospace', col: '#c43a00' });
      ctx.fillStyle = '#e7f3ff'; ctx.fillRect(x0 + len, 80, 70, 120); ctx.strokeRect(x0 + len, 80, 70, 120); text(v.Tc + ' °C', x0 + len + 35, 220, { align: 'center', font: '700 11px "IBM Plex Mono",monospace', col: '#1546d6' });
      const gr = ctx.createLinearGradient(x0, 0, x0 + len, 0); gr.addColorStop(0, '#e2492a'); gr.addColorStop(1, '#4a8fe0'); ctx.fillStyle = gr; ctx.fillRect(x0, 140 - th / 2, len, th); ctx.strokeRect(x0, 140 - th / 2, len, th);
      const n = Math.max(1, Math.min(6, Math.round(2 + Math.log10(d.P + 0.01) * 1.5))); for (let i = 0; i < n; i++){ const ph = (t * 0.5 + i / n) % 1; ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(x0 + len * ph, 140 - th / 2 - 8, 3, 0, 7); ctx.fill(); }
      // profile
      const gx = 80, gy = 300, gw = len, gh = 60; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh - 10); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(gx, gy - gh * (100 + 20) / 120); ctx.lineTo(gx + gw, gy - gh * (v.Tc + 20) / 120); ctx.stroke();
      text('T along the rod', gx + 4, gy - gh - 14, { font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('RATE', 395, 18); text(fplain(d.P) + ' W', 400, 70, { font: '700 22px "Space Grotesk",sans-serif' }); text('melts ' + fplain(d.melt) + ' g of ice per minute', 400, 96, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    panelTitle('HEAT LOSS THROUGH ' + d.nm.toUpperCase(), 10, 18);
    const w = 12 + 5 * v.dx, cx = 200; ctx.fillStyle = '#ffe2d3'; ctx.fillRect(10, 40, cx - w / 2 - 10, 250); ctx.fillStyle = '#dff0ff'; ctx.fillRect(cx + w / 2, 40, 380 - cx - w / 2, 250);
    const gr = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); gr.addColorStop(0, '#f08a6a'); gr.addColorStop(1, '#7fb6ea'); ctx.fillStyle = gr; ctx.fillRect(cx - w / 2, 40, w, 250); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(cx - w / 2, 40, w, 250);
    text('inside ' + v.Ti + ' °C', 20, 60, { font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' }); text('outside ' + v.To + ' °C', 375, 60, { align: 'right', font: '700 12px "Space Grotesk",sans-serif', col: '#1546d6' });
    flow(40, 360, 170, d.P, 2000);
    text('Δx = ' + v.dx + ' cm', cx, 308, { align: 'center', font: '600 11px "IBM Plex Mono",monospace' });
    panelTitle('RATE', 395, 18); text(fplain(d.P) + ' W', 400, 70, { font: '700 22px "Space Grotesk",sans-serif' }); text(fplain(d.kwh) + ' kWh per day', 400, 96, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    const ks = [['foam', 0.03], ['wood', 0.12], ['brick', 0.6], ['glass', 0.8]]; panelTitle('k (W/(m·K))', 395, 140); ks.forEach(([n, k], i) => { ctx.fillStyle = n === (opt.mw || 'glass') ? '#ff6a2b' : '#bbb'; ctx.fillRect(450, 152 + i * 26, 105 * k / 0.8, 18); text(n, 444, 165 + i * 26, { align: 'right', font: '600 10px "IBM Plex Mono",monospace' }); text(String(k), 455 + 105 * k / 0.8, 165 + i * 26, { font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); });
  }
};
