// Radioactive Decay (AP 15.7–15.8, IB E.3): random decay and half-life (a live sample vs the theory curve), activity A = λN, decay equations for α, β⁻, β⁺ and γ with real isotopes and uses, penetration, and radioactive dating.
const ISO = [
  ['Uranium-238', 'U', 92, 238, 'a', '4.5 billion yr', 'Dating the oldest rocks; nuclear fuel (after enrichment)'],
  ['Radium-226', 'Ra', 88, 226, 'a', '1600 yr', 'Old glow-in-the-dark watch dials (now banned)'],
  ['Americium-241', 'Am', 95, 241, 'a', '432 yr', 'Smoke detectors: alphas ionize the air; smoke blocks them'],
  ['Carbon-14', 'C', 6, 14, 'b-', '5730 yr', 'Radiocarbon dating of wood, bone and cloth'],
  ['Strontium-90', 'Sr', 38, 90, 'b-', '29 yr', 'Thickness gauges in paper mills (betas partly get through)'],
  ['Iodine-131', 'I', 53, 131, 'b-', '8.0 days', 'Treating thyroid cancer (the thyroid collects iodine)'],
  ['Fluorine-18', 'F', 9, 18, 'b+', '110 min', 'PET scans: positrons annihilate, making gamma rays'],
  ['Cobalt-60', 'Co', 27, 60, 'b-g', '5.3 yr', 'Radiotherapy and sterilizing medical equipment and food'],
  ['Technetium-99m', 'Tc', 43, 99, 'g', '6.0 h', 'Medical imaging tracer: gammas leave the body, short half-life']];
const SYMZ = { 90: 'Th', 86: 'Rn', 93: 'Np', 7: 'N', 39: 'Y', 54: 'Xe', 8: 'O', 28: 'Ni', 43: 'Tc' };
const SIM = {
  title: 'Radioactive Decay',
  hint: 'A = λN · λ = ln2/t½',
  modes: [{ id: 'half', label: 'Half-life' }, { id: 'types', label: 'Decay types' }, { id: 'date', label: 'Radioactive dating' }],
  opts: [{ id: 'clock', label: 'Clock', modes: ['date'], choices: [['c14', 'Carbon-14'], ['u', 'Uranium → lead']] }],
  ivs(mode, opt){
    if (mode === 'types') return [{ id: 'k', sym: 'isotope', symText: 'isotope', label: 'Isotope', unit: '', min: 0, max: ISO.length - 1, step: 1, val: 0, show: x => ISO[x][0] }];
    if (mode === 'date') return (opt && opt.clock) === 'u' ? [{ id: 'r', sym: 'Pb/U', symText: 'Pb/U', label: 'Lead-206 atoms per uranium-238 atom in the rock', unit: '', min: 0, max: 2, step: 0.01, val: 0.9, graph: true, show: x => x.toFixed(2) }]
      : [{ id: 'pc', sym: '%', symText: '%', label: 'Carbon-14 left, compared with a living sample', unit: '%', min: 1, max: 100, step: 0.5, val: 25, graph: true }];
    return [
      { id: 'th', sym: 't<sub>½</sub>', symText: 't½', label: 'Half-life', unit: 's', min: 2, max: 20, step: 0.5, val: 6 },
      { id: 'N0', sym: 'N<sub>0</sub>', symText: 'N0', label: 'Nuclei at the start', unit: '', min: 100, max: 400, step: 10, val: 400 },
      { id: 't', sym: 't', symText: 't', label: 'Time to predict for', unit: 's', min: 0, max: 60, step: 0.5, val: 12, graph: true }];
  },
  presets: [{ label: 'Two half-lives', mode: 'half', v: { t: 12, th: 6 } }, { label: 'PET scan isotope', mode: 'types', v: { k: 6 } }, { label: 'Smoke detector', mode: 'types', v: { k: 2 } }, { label: 'Ötzi the Iceman (53% left)', mode: 'date', v: { pc: 53 } }],
  calc(v, mode, opt){
    if (mode === 'types'){ const [nm, sym, Z, A, ty, hl, use] = ISO[Math.max(0, Math.min(ISO.length - 1, Math.round(v.k)))]; let Z2 = Z, A2 = A; if (ty === 'a'){ Z2 = Z - 2; A2 = A - 4; } else if (ty.startsWith('b-')) Z2 = Z + 1; else if (ty === 'b+') Z2 = Z - 1;
      return { nm, sym, Z, A, ty, hl, use, Z2, A2, sym2: ty === 'g' ? sym : (SYMZ[Z2] || '?') }; }
    if (mode === 'date'){ if ((opt.clock || 'c14') === 'u'){ const th = 4.47e9, n = Math.log2(1 + v.r); return { u: true, th, n, age: th * n, frac: 1 / (1 + v.r) }; }
      const th = 5730, n = Math.log2(100 / v.pc); return { u: false, th, n, age: th * n, frac: v.pc / 100 }; }
    const lam = Math.LN2 / v.th, N = v.N0 * Math.pow(0.5, v.t / v.th); return { lam, N, A: lam * N, n: v.t / v.th };
  },
  dvs(mode){
    if (mode === 'types') return [{ id: 'A2', name: 'Mass number after', short: 'A', sym: 'A', unit: '', f: d => d.A2 }, { id: 'Z2', name: 'Proton number after', short: 'Z', sym: 'Z', unit: '', f: d => d.Z2 }];
    if (mode === 'date') return [{ id: 'age', name: 'Age of the sample', short: 'age', sym: 'age', unit: 'yr', f: d => d.age }];
    return [{ id: 'N', name: 'Nuclei left (prediction)', short: 'N', sym: 'N', unit: '', f: d => d.N, noTag: true, dblNote: 'Exponential decay: every extra half-life halves N, so it is not a power law.' }, { id: 'A', name: 'Activity (decays per second)', short: 'A', sym: 'A', unit: 'Bq', f: d => d.A, noTag: true }];
  },
  work(v, d, mode){
    if (mode === 'types'){
      const nuc = (s, Z, A) => '<sup>' + A + '</sup><sub>' + Z + '</sub>' + s, emit = { a: ' + <sup>4</sup><sub>2</sub>α', 'b-': ' + <sup>0</sup><sub>−1</sub>e + ν̄', 'b-g': ' + <sup>0</sup><sub>−1</sub>e + ν̄ (then γ)', 'b+': ' + <sup>0</sup><sub>+1</sub>e + ν', g: ' + γ' }[d.ty];
      const what = { a: 'Alpha: the nucleus throws out 2 protons + 2 neutrons. A drops by 4, Z by 2 — a different element.', 'b-': 'Beta-minus: a neutron turns into a proton, emitting an electron and an antineutrino. A stays, Z goes up 1.', 'b-g': 'Beta-minus (a neutron → proton + electron + antineutrino), leaving the nucleus excited; it then drops to its ground state by emitting gamma rays.', 'b+': 'Beta-plus: a proton turns into a neutron, emitting a positron and a neutrino. A stays, Z goes down 1.', g: 'Gamma: an excited nucleus (m = metastable) drops to a lower energy level and emits a photon. A and Z don’t change.' }[d.ty];
      return '<h4>1 · The decay equation</h4><div class="eq" style="font-size:16px">' + nuc(d.sym, d.Z, d.A) + ' → ' + nuc(d.sym2, d.Z2, d.A2) + emit + '</div><div class="eq">' + what + '</div>' +
        '<h4>2 · Check the conservation laws</h4><div class="eq">Nucleon number: ' + d.A + ' = ' + d.A2 + ' + ' + (d.ty === 'a' ? 4 : 0) + ' ✓. Charge: ' + d.Z + ' = ' + d.Z2 + ' + ' + ({ a: 2, 'b-': -1, 'b-g': -1, 'b+': 1, g: 0 }[d.ty]) + ' ✓. Lepton number is conserved too (electron with antineutrino, positron with neutrino).</div>' +
        '<h4>3 · Use</h4><div class="eq">Half-life ' + d.hl + '. ' + d.use + '.</div>' +
        '<p class="note">Penetration: α stopped by paper or skin (very ionizing — dangerous inside the body); β by a few mm of aluminium; γ only reduced by thick lead or concrete (least ionizing). Medical tracers use γ emitters with short half-lives.</p>';
    }
    if (mode === 'date') return d.u ? '<h4>1 · Every lead-206 atom was once uranium-238</h4><div class="eq">If the rock started with no lead: U now : U at start = 1 : (1 + Pb/U) = ' + fnum(d.frac) + '</div>' +
      '<h4>2 · Number of half-lives</h4><div class="eq">(½)ⁿ = ' + fnum(d.frac) + ' → n = log₂(1 + Pb/U) = <b>' + fnum(d.n) + '</b></div><h4>3 · Age</h4><div class="eq">age = n × 4.47×10⁹ yr = <b>' + H.n(d.age, 'yr') + '</b></div><p class="note">The oldest rocks on Earth and meteorites give about 4.5 billion years: the age of the Solar System. You need a half-life similar to the age you are measuring.</p>'
      : '<h4>1 · Living things keep C-14 topped up</h4><div class="eq">While alive, an organism has the same C-14 fraction as the air. After death no new C-14 comes in, and it decays with t½ = 5730 yr.</div>' +
      '<h4>2 · Number of half-lives</h4><div class="eq">(½)ⁿ = ' + fnum(d.frac) + ' → n = log₂(100/' + fnum(v.pc) + ') = <b>' + fnum(d.n) + '</b></div><h4>3 · Age</h4><div class="eq">age = n × 5730 yr = <b>' + H.n(d.age, 'yr') + '</b></div><p class="note">Works back to about 50 000 years; after that too little C-14 is left to measure against background radiation. Whole half-lives are easy: 25% left → 2 half-lives → 11 460 yr.</p>';
    return '<h4>1 · Decay constant</h4><div class="eq">λ = ln 2 / t½ = 0.693/' + H.iv('th') + ' = <b>' + H.n(d.lam, 's⁻¹') + '</b> — the chance per second that any one nucleus decays.</div>' +
      '<h4>2 · Nuclei left</h4><div class="eq">t/t½ = ' + fnum(d.n) + ' half-lives → N = N₀(½)<sup>' + fnum(d.n) + '</sup> = <b>' + H.n(d.N, '') + '</b> (same as N₀e<sup>−λt</sup>)</div>' +
      '<h4>3 · Activity</h4><div class="eq">A = λN = <b>' + H.n(d.A, 'Bq') + '</b> (decays per second). Activity halves every half-life too.</div>' +
      '<p class="note">Watch the live sample: you can’t predict <i>which</i> nucleus decays next, but a big sample follows the curve closely. Small samples wobble more. AP dice lab: remove the dice that show 1 each roll — “half-life” ≈ 3.8 rolls.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'types'){
      panelTitle('WHAT GETS THROUGH?', 10, 18);
      const col = { a: '#c43a00', b: '#1546d6', g: '#7a3fb0' }, kinds = d.ty === 'b-g' ? ['b', 'g'] : [d.ty[0] === 'b' ? 'b' : d.ty];
      ctx.fillStyle = '#555'; ctx.fillRect(20, 80, 30, 50); text(d.sym + '-' + d.A, 35, 146, { align: 'center', font: '700 11px "Space Grotesk",sans-serif' });
      [[120, 4, '#f3ead2', 'paper'], [200, 10, '#b8c0c8', 'aluminium'], [290, 26, '#6a6f78', 'lead']].forEach(([x, w, c, n]) => { ctx.fillStyle = c; ctx.fillRect(x, 50, w, 120); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.strokeRect(x, 50, w, 120); text(n, x + w / 2, 186, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); });
      kinds.forEach((k, i) => { const y = 95 + i * 22, stop = { a: 120, b: 200, g: 385 }[k]; ctx.strokeStyle = col[k]; ctx.lineWidth = 3; ctx.setLineDash(k === 'g' ? [2, 3] : []); ctx.beginPath(); ctx.moveTo(52, y); ctx.lineTo(stop, y); ctx.stroke(); ctx.setLineDash([]);
        if (k === 'g'){ ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.moveTo(316, y); ctx.lineTo(385, y); ctx.stroke(); ctx.globalAlpha = 1; }
        const ph = (t * 0.8 + i * 0.3) % 1, x = 52 + (stop - 52) * ph; ctx.fillStyle = col[k]; ctx.beginPath(); ctx.arc(x, y, k === 'a' ? 6 : 3, 0, 7); ctx.fill(); text({ a: 'α', b: 'β', g: 'γ' }[k], 60, y - 8, { font: '700 13px "Space Grotesk",sans-serif', col: col[k] }); });
      // N-Z chart
      panelTitle('ON A CHART OF NUCLIDES', 10, 214); const cx = 200, cy = 270, s = 14, N1 = d.A - d.Z, N2 = d.A2 - d.Z2;
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; for (let i = -3; i <= 3; i++){ ctx.beginPath(); ctx.moveTo(cx + i * s, cy - 3 * s); ctx.lineTo(cx + i * s, cy + 3 * s); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - 3 * s, cy + i * s); ctx.lineTo(cx + 3 * s, cy + i * s); ctx.stroke(); }
      ctx.fillStyle = '#ff6a2b'; ctx.fillRect(cx - 6, cy - 6, 12, 12); const dx = (N2 - N1) * s, dy = -(d.Z2 - d.Z) * s; if (dx || dy) arrow(cx, cy, cx + dx, cy + dy, '#111', null, { w: 2.5, head: 7 }); else { ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, 7); ctx.stroke(); }
      text('N →', cx + 3 * s + 6, cy + 4, { font: '600 10px "IBM Plex Mono",monospace' }); text('Z ↑', cx - 8, cy - 3 * s - 4, { font: '600 10px "IBM Plex Mono",monospace' });
      panelTitle('THE NUCLEUS', 395, 18);
      [['before', d.sym + '-' + d.A + ' (Z ' + d.Z + ', N ' + (d.A - d.Z) + ')'], ['after', d.sym2 + '-' + d.A2 + ' (Z ' + d.Z2 + ', N ' + (d.A2 - d.Z2) + ')'], ['decay', { a: 'alpha', 'b-': 'beta-minus', 'b-g': 'beta-minus + gamma', 'b+': 'beta-plus', g: 'gamma' }[d.ty]], ['half-life', d.hl]].forEach(([a2, b], i) => { text(a2, 400, 48 + i * 34, { font: '600 11px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 400, 63 + i * 34, { font: '700 12px "IBM Plex Mono",monospace' }); });
      return;
    }
    if (mode === 'date'){
      panelTitle(d.u ? 'URANIUM-238 → LEAD-206 IN A ROCK' : 'CARBON-14 IN A DEAD SAMPLE', 10, 18);
      const gx = 40, gy = 270, gw = 330, gh = 220, X = n => gx + gw * n / 5, Y = f => gy - gh * f;
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 100; i++){ const n = 5 * i / 100; i ? ctx.lineTo(X(n), Y(Math.pow(0.5, n))) : ctx.moveTo(X(n), Y(1)); } ctx.stroke();
      for (let n = 1; n <= 5; n++){ ctx.strokeStyle = '#ddd'; ctx.beginPath(); ctx.moveTo(X(n), gy); ctx.lineTo(X(n), gy - gh); ctx.stroke(); text(String(n), X(n), gy + 14, { align: 'center', font: '500 10px "IBM Plex Mono",monospace' }); }
      ctx.strokeStyle = '#ff6a2b'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(gx, Y(d.frac)); ctx.lineTo(X(Math.min(5, d.n)), Y(d.frac)); ctx.lineTo(X(Math.min(5, d.n)), gy); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(X(Math.min(5, d.n)), Y(d.frac), 5, 0, 7); ctx.fill();
      text('half-lives →', gx + gw, gy + 28, { align: 'right', font: '600 10px "IBM Plex Mono",monospace' }); text('fraction of ' + (d.u ? 'U-238' : 'C-14') + ' left', gx + 4, gy - gh - 6, { font: '600 10px "IBM Plex Mono",monospace' });
      panelTitle('AGE', 395, 18); text(fplain(d.age) + ' yr', 400, 60, { font: '700 20px "Space Grotesk",sans-serif' }); text(fplain(d.n) + ' half-lives of ' + fplain(d.th) + ' yr', 400, 84, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    panelTitle('A REAL SAMPLE DECAYING (LIVE)', 10, 18);
    const cols = 20, rows = Math.ceil(v.N0 / cols), cell = Math.min(12, 250 / rows);
    if (!A.n || A.reset || A.N0 !== v.N0){ A.n = new Array(v.N0).fill(1); A.tt = 0; A.hist = [[0, v.N0]]; A.N0 = v.N0; A.done = 0; }
    const lam = d.lam; A.tt += dt; let left = 0; A.n.forEach((x, i) => { if (x && Math.random() < lam * dt) A.n[i] = 0; left += A.n[i]; });
    if (!A.hist.length || A.tt - A.hist[A.hist.length - 1][0] > 0.25) A.hist.push([A.tt, left]); if (A.tt > 6 * v.th + 3){ A.n = new Array(v.N0).fill(1); A.tt = 0; A.hist = [[0, v.N0]]; }
    A.n.forEach((x, i) => { const r = Math.floor(i / cols), c = i % cols; ctx.fillStyle = x ? '#ff6a2b' : '#ddd'; ctx.beginPath(); ctx.arc(25 + c * 13, 40 + r * cell, cell * 0.38, 0, 7); ctx.fill(); });
    text('t = ' + A.tt.toFixed(1) + ' s   N = ' + left, 12, 312, { font: '700 13px "Space Grotesk",sans-serif' }); text('orange = not decayed yet', 290, 312, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    panelTitle('N vs t: SAMPLE (DOTS) vs THEORY', 395, 18);
    const gx = 405, gy = 260, gw = 180, gh = 210, tm = 6 * v.th, X = tt => gx + gw * tt / tm, Y = N => gy - gh * N / v.N0;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    for (let n = 1; n <= 6; n++){ ctx.strokeStyle = '#eee'; ctx.beginPath(); ctx.moveTo(X(n * v.th), gy); ctx.lineTo(X(n * v.th), gy - gh); ctx.stroke(); }
    ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 100; i++){ const tt = tm * i / 100; i ? ctx.lineTo(X(tt), Y(v.N0 * Math.pow(0.5, tt / v.th))) : ctx.moveTo(X(0), Y(v.N0)); } ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; A.hist.forEach(([tt, N]) => { if (tt <= tm){ ctx.beginPath(); ctx.arc(X(tt), Y(N), 2, 0, 7); ctx.fill(); } });
    text('each gridline = 1 half-life', gx, gy + 16, { font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
