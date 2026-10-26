// Floating & Sinking: buoyant force F_b = ρ_fluid·V_sub·g. Floating fraction, held under by a string, and a dense block hung or released.
const SIM = {
  title: 'Floating & Sinking',
  modes: [{ id: 'float', label: 'Floating' }, { id: 'tied', label: 'Tied under the water' }, { id: 'sink', label: 'Denser than water' }],
  opts: [{ id: 'held', label: 'Block is', modes: ['sink'], choices: [['string', 'On a string'], ['free', 'Let go']] }],
  ivs(mode){
    const l = [{ id: 'rb', sym: 'ρ<sub>obj</sub>', symText: 'ρ_obj', label: 'Block density', unit: 'kg/m³', min: mode === 'sink' ? 1100 : 100, max: mode === 'sink' ? 11000 : 990, step: 10, val: mode === 'sink' ? 2700 : 600, graph: true, show: x => x.toFixed(0) + ' kg/m³' },
      { id: 'rf', sym: 'ρ<sub>fl</sub>', symText: 'ρ_fl', label: 'Liquid density', unit: 'kg/m³', min: 700, max: 1300, step: 10, val: 1000, show: x => x.toFixed(0) + ' kg/m³' },
      { id: 'V', sym: 'V', symText: 'V', label: 'Block volume', unit: 'L', min: 0.5, max: 10, step: 0.1, val: 2 }];
    return l;
  },
  presets: [{ label: 'Wood', mode: 'float', v: { rb: 600 } }, { label: 'Ice', mode: 'float', v: { rb: 920 } }, { label: 'Salt water', v: { rf: 1030 } }, { label: 'Aluminum', mode: 'sink', v: { rb: 2700 } }],
  calc(v, mode, opt){
    const V = v.V / 1000, m = v.rb * V, W = m * G10, FbFull = v.rf * V * G10;
    if (mode === 'float'){ const sinks = v.rb >= v.rf, frac = sinks ? 1 : v.rb / v.rf, Fb = sinks ? FbFull : W; return { V, m, W, FbFull, sinks, frac, Fb, Vsub: frac * v.V }; }
    if (mode === 'tied'){ const T = FbFull - W; return { V, m, W, Fb: FbFull, T, a0: T / m }; }
    const T = W - FbFull, a = T / m; return { V, m, W, Fb: FbFull, T, a, app: T };
  },
  dvs(mode){
    if (mode === 'float') return [{ id: 'frac', name: 'Fraction under the surface', short: 'frac', sym: 'V<sub>sub</sub>/V', unit: '', f: d => d.frac }, { id: 'Fb', name: 'Buoyant force', short: 'F_b', sym: 'F<sub>b</sub>', unit: 'N', f: d => d.Fb }];
    if (mode === 'tied') return [{ id: 'T', name: 'String tension', short: 'T', sym: 'T', unit: 'N', f: d => d.T }, { id: 'Fb', name: 'Buoyant force', short: 'F_b', sym: 'F<sub>b</sub>', unit: 'N', f: d => d.Fb, vs: 'W' }, { id: 'W', name: 'Weight', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W }];
    return [{ id: 'T', name: 'String tension (apparent weight)', short: 'T', sym: 'T', unit: 'N', f: d => d.T }, { id: 'a', name: 'Acceleration if let go', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a }, { id: 'Fb', name: 'Buoyant force', short: 'F_b', sym: 'F<sub>b</sub>', unit: 'N', f: d => d.Fb }];
  },
  work(v, d, mode, opt){
    const h0 = '<h4>1 · Archimedes: the buoyant force = the weight of the liquid pushed aside</h4><div class="eq">F<sub>b</sub> = ρ<sub>fl</sub>V<sub>sub</sub>g. It comes from the pressure being bigger on the bottom of the block than on the top.</div>' +
      '<div class="eq">Block: m = ρ<sub>obj</sub>V = (' + H.iv('rb') + ')(' + H.n(d.V, 'm³') + ') = ' + H.n(d.m, 'kg') + ', weight ' + H.n(d.W, 'N') + '</div>';
    if (mode === 'float'){
      if (d.sinks) return h0 + '<div class="bad">ρ<sub>obj</sub> ≥ ρ<sub>fl</sub>: even fully under, F<sub>b</sub> = ' + H.n(d.FbFull, 'N') + ' can’t hold up ' + H.n(d.W, 'N') + '. It sinks.</div>';
      return h0 + '<h4>2 · Floating: forces balance</h4><div class="eq">F<sub>b</sub> = mg → ρ<sub>fl</sub>V<sub>sub</sub>g = ρ<sub>obj</sub>Vg → <b>V<sub>sub</sub>/V = ρ<sub>obj</sub>/ρ<sub>fl</sub></b> = ' + H.iv('rb') + ' / ' + H.iv('rf') + ' = <b>' + H.n(d.frac) + '</b></div>' +
        '<div class="eq">F<sub>b</sub> = mg = ' + H.n(d.Fb, 'N') + '; ' + H.n(d.Vsub, 'L') + ' of the block is under the surface</div>' +
        '<p class="note">Ice (920) in water: 92% under. In salt water a little less is under: denser liquid, same weight to hold up.</p>' +
        '<p class="note">Common mistake: “the buoyant force equals the weight of the whole block’s volume of water.” Only when it’s fully under.</p>';
    }
    if (mode === 'tied') return h0 + '<h4>2 · Fully under: V<sub>sub</sub> = V</h4><div class="eq">F<sub>b</sub> = (' + H.iv('rf') + ')(' + H.n(d.V) + ')(' + H.g() + ') = <b>' + H.n(d.Fb, 'N') + '</b></div>' +
      '<h4>3 · Free-body diagram: F<sub>b</sub> up; mg and T down</h4><div class="eq">F<sub>b</sub> = mg + T → T = ' + H.n(d.Fb) + ' − ' + H.n(d.W) + ' = <b>' + H.n(d.T, 'N') + '</b></div>' +
      '<div class="eq">Cut the string: a = (F<sub>b</sub> − mg)/m = ' + H.n(d.a0, 'm/s²') + ' upward (ignoring drag) until it reaches the surface.</div>';
    return h0 + '<h4>2 · Fully under: F<sub>b</sub> = ρ<sub>fl</sub>Vg = <b>' + H.n(d.Fb, 'N') + '</b></h4>' +
      (opt.held !== 'free' ? '<h4>3 · On a string: T + F<sub>b</sub> = mg</h4><div class="eq">T = ' + H.n(d.W) + ' − ' + H.n(d.Fb) + ' = <b>' + H.n(d.T, 'N') + '</b> (the “apparent weight”: lighter by F<sub>b</sub>)</div>'
        : '<h4>3 · Let go: Newton’s 2nd law (down +)</h4><div class="eq">mg − F<sub>b</sub> = ma → a = g(1 − ρ<sub>fl</sub>/ρ<sub>obj</sub>) = 10(1 − ' + H.iv('rf') + '/' + H.iv('rb') + ') = <b>' + H.n(d.a, 'm/s²') + '</b> (ignoring drag)</div>') +
      '<p class="note">F<sub>b</sub> doesn’t depend on how deep the block is (once it’s fully under) or on what it’s made of, only on its volume and the liquid.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    panelTitle(mode === 'float' ? 'FLOATING BLOCK' : mode === 'tied' ? 'BLOCK TIED TO THE BOTTOM' : 'DENSE BLOCK', 10, 18);
    const tx = 40, tw = 300, top = 70, bot = 290, surf = 110, s = 40 + 16 * Math.cbrt(v.V), col = v.rf > 1100 ? '#7fb2e0' : v.rf < 900 ? '#f3e2a6' : '#9cc6f0';
    ctx.fillStyle = col; ctx.fillRect(tx, surf, tw, bot - surf); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx, top); ctx.lineTo(tx, bot); ctx.lineTo(tx + tw, bot); ctx.lineTo(tx + tw, top); ctx.stroke();
    const cx = tx + tw / 2; let by;
    if (mode === 'float') by = d.sinks ? bot - s : surf - s * (1 - d.frac);
    else if (mode === 'tied') by = 170;
    else { if (opt.held === 'free'){ const q = A.t % 2.5; by = Math.min(120 + 0.5 * d.a * q * q * 30, 185); } else by = 160; }
    ctx.fillStyle = '#c98a3c'; if (v.rb > 2000) ctx.fillStyle = '#9aa7b8'; ctx.fillRect(cx - s / 2, by, s, s); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(cx - s / 2, by, s, s);
    if (mode === 'float' && !d.sinks){ ctx.fillStyle = 'rgba(21,70,214,0.18)'; ctx.fillRect(cx - s / 2, surf, s, by + s - surf); }
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5;
    if (mode === 'tied'){ ctx.beginPath(); ctx.moveTo(cx, by + s); ctx.lineTo(cx, bot); ctx.stroke(); }
    if (mode === 'sink' && opt.held !== 'free'){ ctx.beginPath(); ctx.moveTo(cx, 30); ctx.lineTo(cx, by); ctx.stroke(); }
    const sc = 80 / Math.max(d.W, d.Fb, 1), ax = cx + s / 2 + 18;
    arrow(ax, by + s / 2, ax, by + s / 2 + d.W * sc, COL.W, 'mg', { lx: 5, ly: 0 });
    arrow(ax + 22, by + s / 2, ax + 22, by + s / 2 - d.Fb * sc, COL.N, 'F_b', { lx: 5, ly: 0 });
    if (mode === 'tied') arrow(cx - s / 2 - 18, by + s / 2, cx - s / 2 - 18, by + s / 2 + d.T * sc, COL.T, 'T', { lx: -5, ly: 0, align: 'right' });
    if (mode === 'sink' && opt.held !== 'free') arrow(cx - s / 2 - 18, by + s / 2, cx - s / 2 - 18, by + s / 2 - d.T * sc, COL.T, 'T', { lx: -5, ly: 0, align: 'right' });
    const msg = mode === 'float' ? (d.sinks ? 'sinks' : fplain(100 * d.frac) + '% under the surface') : mode === 'tied' ? 'T = ' + fplain(d.T) + ' N' : opt.held === 'free' ? 'sinks with a = ' + fplain(d.a) + ' m/s²' : 'apparent weight ' + fplain(d.T) + ' N';
    text(msg, 12, 312, { font: '700 13px "Space Grotesk",sans-serif', col: mode === 'float' && d.sinks ? '#c43a00' : '#111' });
    panelTitle('FORCES (N)', 395, 18);
    const mx = Math.max(d.W, d.Fb, Math.abs(d.T || 0), 1), bar = (y, val, col, lab) => { const w = 85 * Math.abs(val) / mx; ctx.fillStyle = col; ctx.fillRect(470, y, w, 14); text(lab, 465, y + 11, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(val), 474 + w, y + 11, { font: '600 10px "IBM Plex Mono",monospace' }); };
    bar(45, d.W, COL.W, 'weight mg'); bar(70, d.Fb, COL.N, 'buoyant F_b');
    if (mode !== 'float' && !(mode === 'sink' && opt.held === 'free')) bar(95, d.T, COL.T, 'tension T');
    text('ρ_obj / ρ_fl = ' + fplain(v.rb / v.rf), 400, 140, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
