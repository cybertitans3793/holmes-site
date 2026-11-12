// Floating & Sinking: buoyant force F_b = ρ_fluid·V_sub·g. Floating fraction, held under by a string, and a dense block hung or released.
const P0 = 1.0e5, FACE = 0.20, RHO_F = { water: 1000, salt: 1030, oil: 800 };
function drawArrows(v, d, opt){
  panelTitle('PRESSURE ON EVERY FACE', 10, 18);
  const abs = opt.pr === 'abs', sy = 56, y0 = 66, tx = 20, tw = 325, bx = 150, bw = 100, bot = 312, col = d.rho > 1010 ? '#7fb2e0' : d.rho < 900 ? '#f3e2a6' : '#9cc6f0';
  const yt = y0 + v.ht * sy, yb = y0 + d.hb * sy, k = abs ? 45 / 1.31e5 : 55 / 31000, len = h => (abs ? P0 + d.rho * G10 * h : d.rho * G10 * h) * k;
  ctx.fillStyle = col; ctx.fillRect(tx, y0, tw, bot - y0); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx, y0 - 14); ctx.lineTo(tx, bot); ctx.lineTo(tx + tw, bot); ctx.lineTo(tx + tw, y0 - 14); ctx.stroke();
  ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tx, y0); ctx.lineTo(tx + tw, y0); ctx.stroke();
  const ar = (x1, y1, x2, y2, c) => { const l = Math.hypot(x2 - x1, y2 - y1); if (l > 1.5) arrow(x1, y1, x2, y2, c, null, { w: 2.5, head: Math.min(7, l * 0.9) }); };
  [0, 1, 2, 3].forEach(i => { const x = bx + (i + 0.5) * bw / 4; ar(x, yt - len(v.ht), x, yt, '#1546d6'); ar(x, yb + len(d.hb), x, yb, '#c43a00'); });
  [0.17, 0.5, 0.83].forEach(f => { const y = yt + f * v.H * sy, L = len(v.ht + f * v.H); ar(bx - L, y, bx, y, '#777'); ar(bx + bw + L, y, bx + bw, y, '#777'); });
  ctx.fillStyle = '#c98a3c'; ctx.fillRect(bx, yt, bw, yb - yt); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(bx, yt, bw, yb - yt);
  // depth markers
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(44, y0); ctx.lineTo(44, yb); ctx.stroke(); [y0, yt, yb].forEach(y => { ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(48, y); ctx.stroke(); });
  text('h_top = ' + fplain(v.ht) + ' m', 52, yt - 3, { font: '600 10px "IBM Plex Mono",monospace' }); text('h_bot = ' + fplain(d.hb) + ' m', 52, yb + 11, { font: '600 10px "IBM Plex Mono",monospace' });
  text('sides cancel', bx + bw / 2, (yt + yb) / 2 + 4, { align: 'center', font: '600 10px "Space Grotesk",sans-serif', col: '#fff' });
  text(abs ? 'arrow length ∝ P₀ + ρgh' : 'arrow length ∝ ρgh (P₀ pushes everywhere equally)', 12, 326, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  panelTitle('FORCES ON THE BLOCK (N)', 395, 18);
  const mx = Math.max(d.Fb, 1), row = (y, lab, val, c, ar2) => { const w = Math.max(2, 120 * val / mx); ctx.fillStyle = c; ctx.fillRect(398, y + 4, w, 12); text(lab, 398, y, { font: '700 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(fplain(val), 590, y, { align: 'right', font: '600 11px "IBM Plex Mono",monospace' }); };
  text('P_top = ' + fplain(d.Pt) + ' Pa', 398, 48, { font: '600 10px "IBM Plex Mono",monospace' }); text('P_bottom = ' + fplain(d.Pb) + ' Pa', 398, 62, { font: '600 10px "IBM Plex Mono",monospace' });
  row(86, 'F_top = P·A  ↓', d.Ft, '#1546d6'); row(122, 'F_bottom = P·A  ↑', d.Fb, '#c43a00'); row(158, 'F_net  ↑', d.Fnet, '#1e7d45');
  text('ρgV = ' + fplain(d.rgV) + ' N', 398, 206, { font: '700 12px "IBM Plex Mono",monospace' }); text('weight of the liquid pushed aside', 398, 220, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  text('Same net force at any depth.', 398, 252, { font: '600 11px "Space Grotesk",sans-serif' });
}
const SIM = {
  title: 'Floating & Sinking',
  modes: [{ id: 'float', label: 'Floating' }, { id: 'tied', label: 'Tied under the water' }, { id: 'sink', label: 'Denser than water' }, { id: 'arrows', label: 'Where buoyancy comes from' }],
  opts: [{ id: 'held', label: 'Block is', modes: ['sink'], choices: [['string', 'On a string'], ['free', 'Let go']] },
    { id: 'fluid', label: '', modes: ['arrows'], choices: [['water', 'Water'], ['salt', 'Salt water'], ['oil', 'Oil']] },
    { id: 'pr', label: 'Arrows', modes: ['arrows'], choices: [['gauge', 'ρgh'], ['abs', 'P₀+ρgh']] }],
  ivs(mode){
    if (mode === 'arrows') return [
      { id: 'ht', sym: 'h<sub>top</sub>', symText: 'h_top', label: 'Depth of the top face', unit: 'm', min: 0.3, max: 2, step: 0.05, val: 0.5, graph: true },
      { id: 'H', sym: 'H', symText: 'H', label: 'Block height', unit: 'm', min: 0.3, max: 1, step: 0.05, val: 0.5 }];
    const l = [{ id: 'rb', sym: 'ρ<sub>obj</sub>', symText: 'ρ_obj', label: 'Block density', unit: 'kg/m³', min: mode === 'sink' ? 1100 : 100, max: mode === 'sink' ? 11000 : 990, step: 10, val: mode === 'sink' ? 2700 : 600, graph: true, show: x => x.toFixed(0) + ' kg/m³' },
      { id: 'rf', sym: 'ρ<sub>fl</sub>', symText: 'ρ_fl', label: 'Liquid density', unit: 'kg/m³', min: 700, max: 1300, step: 10, val: 1000, show: x => x.toFixed(0) + ' kg/m³' },
      { id: 'V', sym: 'V', symText: 'V', label: 'Block volume', unit: 'L', min: 0.5, max: 10, step: 0.1, val: 2 }];
    return l;
  },
  presets: [{ label: 'Block near the top', mode: 'arrows', v: { ht: 0.3 } }, { label: 'Block deep down', mode: 'arrows', v: { ht: 2 } }, { label: 'Wood', mode: 'float', v: { rb: 600 } }, { label: 'Ice', mode: 'float', v: { rb: 920 } }, { label: 'Salt water', v: { rf: 1030 } }, { label: 'Aluminum', mode: 'sink', v: { rb: 2700 } }],
  calc(v, mode, opt){
    if (mode === 'arrows'){
      const rho = RHO_F[(opt && opt.fluid) || 'water'], hb = v.ht + v.H, Pt = P0 + rho * G10 * v.ht, Pb = P0 + rho * G10 * hb, Ft = Pt * FACE, Fb = Pb * FACE, V = FACE * v.H;
      return { rho, hb, Pt, Pb, Ft, Fb, Fnet: Fb - Ft, V, rgV: rho * G10 * V, Fnet0: 0 };
    }
    const V = v.V / 1000, m = v.rb * V, W = m * G10, FbFull = v.rf * V * G10;
    if (mode === 'float'){ const sinks = v.rb >= v.rf, frac = sinks ? 1 : v.rb / v.rf, Fb = sinks ? FbFull : W; return { V, m, W, FbFull, sinks, frac, Fb, Vsub: frac * v.V }; }
    if (mode === 'tied'){ const T = FbFull - W; return { V, m, W, Fb: FbFull, T, a0: T / m }; }
    const T = W - FbFull, a = T / m; return { V, m, W, Fb: FbFull, T, a, app: T };
  },
  dvs(mode){
    if (mode === 'arrows') return [{ id: 'Fnet', name: 'Net force from the liquid (up)', short: 'F_net', sym: 'F<sub>net</sub>', unit: 'N', f: d => d.Fnet, vs: 'Fb' }, { id: 'Fb', name: 'Force up on the bottom face', short: 'F_bottom', sym: 'F<sub>bottom</sub>', unit: 'N', f: d => d.Fb }, { id: 'Ft', name: 'Force down on the top face', short: 'F_top', sym: 'F<sub>top</sub>', unit: 'N', f: d => d.Ft }];
    if (mode === 'float') return [{ id: 'frac', name: 'Fraction under the surface', short: 'frac', sym: 'V<sub>sub</sub>/V', unit: '', f: d => d.frac }, { id: 'Fb', name: 'Buoyant force', short: 'F_b', sym: 'F<sub>b</sub>', unit: 'N', f: d => d.Fb }];
    if (mode === 'tied') return [{ id: 'T', name: 'String tension', short: 'T', sym: 'T', unit: 'N', f: d => d.T }, { id: 'Fb', name: 'Buoyant force', short: 'F_b', sym: 'F<sub>b</sub>', unit: 'N', f: d => d.Fb, vs: 'W' }, { id: 'W', name: 'Weight', short: 'mg', sym: 'mg', unit: 'N', f: d => d.W }];
    return [{ id: 'T', name: 'String tension (apparent weight)', short: 'T', sym: 'T', unit: 'N', f: d => d.T }, { id: 'a', name: 'Acceleration if let go', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a }, { id: 'Fb', name: 'Buoyant force', short: 'F_b', sym: 'F<sub>b</sub>', unit: 'N', f: d => d.Fb }];
  },
  work(v, d, mode, opt){
    if (mode === 'arrows') return '<h4>1 · Pressure at a depth: P = P₀ + ρgh</h4><p class="st">Liquid density ρ = ' + H.n(d.rho, 'kg/m³') + ', air pressure P₀ = 1.0×10⁵ Pa, face area A = 0.20 m².</p>' +
      TEX`P_{\text{top}} = P_0 + \rho g\,h_{\text{top}}` + TEX`P_{\text{top}} = ${M.n(P0)} + (${M.n(d.rho)})(10)(${M.iv('ht')})` + TEXA`P_{\text{top}} = ${M.n(d.Pt, 'Pa')}` +
      TEX`h_{\text{bottom}} = h_{\text{top}} + H = ${M.n(d.hb, 'm')}` +
      TEX`P_{\text{bottom}} = P_0 + \rho g\,h_{\text{bottom}}` + TEX`P_{\text{bottom}} = ${M.n(P0)} + (${M.n(d.rho)})(10)(${M.n(d.hb)})` + TEXA`P_{\text{bottom}} = ${M.n(d.Pb, 'Pa')}` +
      '<h4>2 · Force on each face: F = PA</h4><p class="st">The side forces are equal and opposite, so they cancel. Top pushes down, bottom pushes up:</p>' +
      TEX`F_{\text{top}} = P_{\text{top}}\,A = (${M.n(d.Pt)})(0.20)` + TEXA`F_{\text{top}} = ${M.n(d.Ft, 'N')}` +
      TEX`F_{\text{bottom}} = P_{\text{bottom}}\,A = (${M.n(d.Pb)})(0.20)` + TEXA`F_{\text{bottom}} = ${M.n(d.Fb, 'N')}` +
      '<h4>3 · Net force = buoyant force</h4>' + TEX`F_{\text{net}} = F_{\text{bottom}} - F_{\text{top}}` + TEX`F_{\text{net}} = ${M.n(d.Fb)} - ${M.n(d.Ft)}` + TEXA`F_{\text{net}} = ${M.n(d.Fnet, 'N')}` +
      '<h4>4 · Why it is ρgV</h4><p class="st">P₀ cancels, and so does the depth:</p>' + TEX`F_{\text{net}} = \rho g\,(h_{\text{bottom}} - h_{\text{top}})\,A = \rho g\,H A = \rho g V` +
      TEX`V = HA = (${M.iv('H')})(0.20) = ${M.n(d.V, 'm³')}` + TEX`\rho g V = (${M.n(d.rho)})(10)(${M.n(d.V)})` + TEXA`\rho g V = ${M.n(d.rgV, 'N')}` +
      '<p class="note">That is the weight of the liquid the block pushes aside. Slide the block deeper: both forces grow, the difference does not.</p>';
    const h0 = '<h4>1 · Archimedes: the buoyant force = the weight of the liquid pushed aside</h4>' + TEX`F_b = \rho_{\text{fl}} V_{\text{sub}}\, g` +
      '<p class="st">It comes from the pressure being bigger on the bottom of the block than on the top.</p>' +
      '<p class="st">Block:</p>' + TEX`m = \rho_{\text{obj}} V` + TEX`m = (${M.iv('rb')})(${M.n(d.V, 'm³')})` + TEXA`m = ${M.n(d.m, 'kg')}` + TEXA`W = mg = ${M.n(d.W, 'N')}`;
    if (mode === 'float'){
      if (d.sinks) return h0 + '<div class="bad">ρ<sub>obj</sub> ≥ ρ<sub>fl</sub>: even fully under, F<sub>b</sub> = ' + H.n(d.FbFull, 'N') + ' can’t hold up ' + H.n(d.W, 'N') + '. It sinks.</div>';
      return h0 + '<h4>2 · Floating: forces balance</h4>' + TEX`F_b = mg` + TEX`\rho_{\text{fl}} V_{\text{sub}}\, g = \rho_{\text{obj}} V g` +
        TEX`\frac{V_{\text{sub}}}{V} = \frac{\rho_{\text{obj}}}{\rho_{\text{fl}}}` + TEX`\frac{V_{\text{sub}}}{V} = \frac{${M.iv('rb')}}{${M.iv('rf')}}` + TEXA`\frac{V_{\text{sub}}}{V} = ${M.n(d.frac)}` +
        TEXA`F_b = mg = ${M.n(d.Fb, 'N')}` + '<p class="st">That much of the block is under the surface:</p>' + TEXA`V_{\text{sub}} = ${M.n(d.Vsub, 'L')}` +
        '<p class="note">Ice (920) in water: 92% under. In salt water a little less is under: denser liquid, same weight to hold up.</p>' +
        '<p class="note">Common mistake: “the buoyant force equals the weight of the whole block’s volume of water.” Only when it’s fully under.</p>';
    }
    if (mode === 'tied') return h0 + '<h4>2 · Fully under: V<sub>sub</sub> = V</h4>' + TEX`F_b = \rho_{\text{fl}} V g` + TEX`F_b = (${M.iv('rf')})(${M.n(d.V)})(10\,\text{m/s}^2)` + TEXA`F_b = ${M.n(d.Fb, 'N')}` +
      '<h4>3 · Free-body diagram: F<sub>b</sub> up; mg and T down</h4>' + TEX`F_b = mg + T` + TEX`T = F_b - mg` + TEX`T = ${M.n(d.Fb)} - ${M.n(d.W)}` + TEXA`T = ${M.n(d.T, 'N')}` +
      '<p class="st">Cut the string (ignoring drag):</p>' + TEX`a = \frac{F_b - mg}{m}` + TEXA`a = ${M.n(d.a0, 'm/s²')}` + '<p class="st">upward until it reaches the surface.</p>';
    return h0 + '<h4>2 · Fully under</h4>' + TEX`F_b = \rho_{\text{fl}} V g` + TEXA`F_b = ${M.n(d.Fb, 'N')}` +
      (opt.held !== 'free' ? '<h4>3 · On a string: T + F<sub>b</sub> = mg</h4>' + TEX`T = mg - F_b` + TEX`T = ${M.n(d.W)} - ${M.n(d.Fb)}` + TEXA`T = ${M.n(d.T, 'N')}` + '<p class="st">This is the “apparent weight”: lighter by F<sub>b</sub>.</p>'
        : '<h4>3 · Let go: Newton’s 2nd law (down +)</h4>' + TEX`mg - F_b = ma` + TEX`a = g\left(1 - \frac{\rho_{\text{fl}}}{\rho_{\text{obj}}}\right)` + TEX`a = (10\,\text{m/s}^2)\left(1 - \frac{${M.iv('rf')}}{${M.iv('rb')}}\right)` + TEXA`a = ${M.n(d.a, 'm/s²')}` + '<p class="st">Ignoring drag.</p>') +
      '<p class="note">F<sub>b</sub> doesn’t depend on how deep the block is (once it’s fully under) or on what it’s made of, only on its volume and the liquid.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'arrows') return drawArrows(v, d, opt);
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
