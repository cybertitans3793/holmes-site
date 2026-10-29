// ABP Big Bang evidence (HS-ESS1-2): expanding & cooling timeline, galaxy red shift (Hubble), star spectra & composition, the leftover glow (CMB). Original.
const fint = x => Number.isInteger(x) ? String(x) : (Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2)).replace(/\.?0+$/, '');
const rngB = q => { let a = (q * 2654435761) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const YR = 3.156e7, NOW = Math.log10(13.8e9 * YR);
// temperature anchors (log10 seconds, log10 kelvin) — approximate
const TA = [[-6, 13], [0, 10], [2.255, 9], [12.2, 3.9], [13.08, 3.477], [15.8, 1.756], [16.5, 1.255], [17.46, 0.59], [NOW, 0.4354]];
const logT = lt => { if (lt <= TA[0][0]) return TA[0][1]; for (let i = 1; i < TA.length; i++) if (lt <= TA[i][0]){ const [a, b] = [TA[i - 1], TA[i]], f = (lt - a[0]) / (b[0] - a[0]); return a[1] + f * (b[1] - a[1]); } return TA[TA.length - 1][1]; };
const SUP = n => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹⁻'['0123456789-'.indexOf(c)] || c).join('');
const big = x => { if (x < 1e5) return x >= 100 ? Math.round(x).toLocaleString('en-US') : fint(+x.toPrecision(3)); const e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e); return (m.toFixed(1) === '1.0' ? '' : m.toFixed(1) + ' × ') + '10' + SUP(e); };
const tfmt = lt => { const t = Math.pow(10, lt); if (t < 1e-3) { const n = +(t * 1e6).toPrecision(2); return fint(n) + (n === 1 ? ' millionth' : ' millionths') + ' of a second'; } if (t < 1) return fint(+(t * 1e3).toPrecision(2)) + ' thousandths of a second'; if (t < 120) return fint(+t.toPrecision(2)) + ' seconds'; if (t < 3 * 3600) return fint(+(t / 60).toPrecision(2)) + ' minutes'; const y = t / YR; if (y < 1) return fint(+(t / 86400).toPrecision(2)) + ' days'; if (y < 1e6) return Math.round(+y.toPrecision(2)).toLocaleString('en-US') + ' years'; if (y < 1e9) return fint(+(y / 1e6).toPrecision(3)) + ' million years'; return fint(+(y / 1e9).toPrecision(3)) + ' billion years'; };
const efmt = E => E >= 10 ? big(E) + '×' : E >= 0.1 ? fint(+E.toPrecision(2)) + '×' : '1/' + big(1 / E);
const band = lam => lam < 1e-11 ? 'gamma rays' : lam < 1e-8 ? 'X-rays' : lam < 4e-7 ? 'ultraviolet' : lam < 7e-7 ? 'visible light' : lam < 1e-3 ? 'infrared' : 'microwaves';
const bbRGB = T => { if (T > 40000) return [205, 220, 255]; if (T < 600) return [0, 0, 0]; let t = T / 100, r, g, b;
  r = t <= 66 ? 255 : 329.7 * Math.pow(t - 60, -0.1332); g = t <= 66 ? 99.47 * Math.log(t) - 161.1 : 288.1 * Math.pow(t - 60, -0.0755); b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5 * Math.log(t - 10) - 305.0;
  const dim = T < 1500 ? (T - 600) / 900 : 1; return [r, g, b].map(c => Math.round(Math.max(0, Math.min(255, c)) * dim)); };
const EPOCHS = [[-5, 'Quark soup', 'Too hot for anything to hold together: a soup of quarks, electrons and light.'], [2.255, 'Protons & neutrons', 'Quarks have stuck together into protons and neutrons.'], [13.08, 'Hydrogen & helium nuclei', 'Protons and neutrons fused into nuclei: about ¾ hydrogen and ¼ helium. Electrons fly free, so light keeps bouncing off them — the universe is a glowing fog.'], [15.8, 'Atoms form · the Dark Ages', 'Cool enough for electrons to join nuclei: the first atoms. Light now travels freely (this is the light we still see as the leftover glow). No stars yet.'], [16.5, 'First stars', 'Gravity pulls gas clouds together and the first stars light up.'], [17.46, 'Galaxies', 'Stars gather into galaxies, and galaxies spread apart as space expands.'], [99, 'Sun & Earth → today', 'Our Sun and Earth formed about 4.6 billion years ago. Today the universe is 13.8 billion years old.']];
const epoch = lt => EPOCHS.findIndex(e => lt < e[0]);
const PTS = (() => { const r = rngB(11), p = []; for (let i = 0; i < 46; i++) p.push([r() * 2 - 1, r() * 2 - 1, r()]); return p; })();
// galaxies for the red-shift lab: distance (million light-years), speed = 22 km/s per Mly with scatter
const GALS = [60, 150, 240, 380, 520, 700, 900, 1150].map((d, i) => { const sc = [0.04, -0.05, 0.03, -0.02, 0.05, -0.04, 0.02, -0.03][i], v = 22 * d * (1 + sc); return { d, v, ha: 656.3 * (1 + v / 300000) }; });
const HL = [656.3, 486.1, 434.0, 410.2];
const ELS = { H: ['Hydrogen', [656.3, 486.1, 434.0, 410.2], '#ff4b4b'], He: ['Helium', [587.6, 667.8, 501.6, 447.1, 492.2, 706.5], '#ffd23a'], Na: ['Sodium', [589.0, 589.6], '#ff9a2b'], Ca: ['Calcium', [393.4, 396.8, 422.7], '#b07cff'], Mg: ['Magnesium', [516.7, 517.3, 518.4], '#3ad17a'] };
const SRC = [['The Sun', 'abs', ['H', 'Na', 'Ca', 'Mg']], ['A hot blue star', 'abs', ['H', 'He']], ['A glowing gas cloud', 'emit', ['H', 'He']], ['Mystery star X', 'abs', ['H', 'Ca', 'Na']], ['Mystery star Y', 'abs', ['H', 'He', 'Mg']]];
const ELK = ['none', 'H', 'He', 'Na', 'Ca', 'Mg'];
const wlRGB2 = l => { let r = 0, g = 0, b = 0; if (l < 440){ r = (440 - l) / 60; b = 1; } else if (l < 490){ g = (l - 440) / 50; b = 1; } else if (l < 510){ g = 1; b = (510 - l) / 20; } else if (l < 580){ r = (l - 510) / 70; g = 1; } else if (l < 645){ r = 1; g = (645 - l) / 65; } else r = 1; const a = l < 420 ? 0.35 + 0.65 * (l - 380) / 40 : l > 700 ? 0.35 + 0.65 * (730 - l) / 30 : 1; return [r, g, b].map(c => Math.round(255 * Math.max(0, Math.min(1, c * a)))); };
const SIM = {
  title: 'Big Bang Evidence',
  hint: 'space expands → light stretches → universe cools',
  noGraph: true,
  modes: [{ id: 'expand', label: 'Expanding & cooling' }, { id: 'red', label: 'Red shift' }, { id: 'spec', label: 'Star spectra' }, { id: 'cmb', label: 'Leftover glow' }],
  opts: [{ id: 'chk', label: 'Answers', modes: ['red'], choices: [['no', 'Hidden'], ['yes', 'Show']] }],
  ivs(mode){
    if (mode === 'red') return [{ id: 'g', sym: '', symText: '#', label: 'Galaxy', unit: '', show: x => 'Galaxy ' + x, min: 1, max: 8, step: 1, val: 1 }];
    if (mode === 'spec') return [{ id: 'src', sym: '', symText: 'src', label: 'Light source', unit: '', show: x => SRC[x - 1][0], min: 1, max: 5, step: 1, val: 1 },
      { id: 'el', sym: '', symText: 'el', label: 'Compare with the fingerprint of', unit: '', show: x => x ? ELS[ELK[x]][0] : '(none)', min: 0, max: 5, step: 1, val: 1 }];
    if (mode === 'cmb') return [{ id: 'lt', sym: '', symText: 't', label: 'Time since the Big Bang', unit: '', show: x => tfmt(x), min: 13.08, max: NOW, step: 0.01, val: 13.08 }];
    return [{ id: 'lt', sym: '', symText: 't', label: 'Time since the Big Bang (each step is ×10)', unit: '', show: x => tfmt(x), min: -6, max: NOW, step: 0.02, val: -6 }];
  },
  presets: [{ label: '1 millionth of a second', mode: 'expand', v: { lt: -6 } }, { label: '3 minutes', mode: 'expand', v: { lt: 2.26 } }, { label: '380,000 years', mode: 'expand', v: { lt: 13.08 } }, { label: 'First stars', mode: 'expand', v: { lt: 15.8 } }, { label: 'Today', mode: 'expand', v: { lt: NOW } }],
  calc(v, mode){
    if (mode === 'red'){ const G = GALS[v.g - 1]; return { G, dl: G.ha - 656.3, H: 22, age: 9.461e18 / 22 / YR / 1e9 }; }
    if (mode === 'spec') return { S: SRC[v.src - 1], el: ELK[v.el] };
    const T = Math.pow(10, logT(v.lt)), lam = 2.898e-3 / T;
    return { T, lam, band: band(lam), shrink: T / 2.725, E: T / 5000, ep: epoch(v.lt) };
  },
  dvs(){ return [{ id: 'x', name: '—', short: '', sym: '', unit: '', noTag: true, f: () => 0 }]; },
  work(v, d, mode, opt){
    if (mode === 'red'){ const chk = opt.chk === 'yes', G = d.G;
      return '<h4>1 · Find the red hydrogen line</h4><div class="eq">In the lab, hydrogen’s red line is at <b>656 nm</b>. Read where it lands in Galaxy ' + v.g + '’s light (use the zoom).' + (chk ? ' It is at <b>' + G.ha.toFixed(1) + ' nm</b>.' : '') + '</div>' +
        '<h4>2 · How far did it shift?</h4><div class="eq">Δλ = (galaxy) − 656 nm' + (chk ? ' = <b>' + d.dl.toFixed(1) + ' nm</b> toward red → moving <b>away</b>' : '') + '</div>' +
        '<h4>3 · Speed of the galaxy</h4><div class="eq">speed = 300,000 km/s × Δλ ÷ 656' + (chk ? ' = <b>' + Math.round(G.v).toLocaleString('en-US') + ' km/s</b>' : '') + '</div>' +
        '<h4>4 · Plot speed vs. distance for all 8 galaxies</h4><div class="eq">Distance (from how bright it looks): <b>' + G.d + ' million light-years</b>.' + (chk ? '<br>The points make a straight line through zero: <b>the farther away a galaxy is, the faster it moves away</b> (Hubble’s law, about 22 km/s for every million light-years).' : '') + '</div>' +
        (chk ? '<h4>5 · Run it backward</h4><div class="eq">If every galaxy moved apart at a steady rate, they were all together about distance ÷ speed ≈ <b>' + d.age.toFixed(1) + ' billion years</b> ago — the Big Bang.</div>' : '<p class="note">Fill in a table: galaxy, distance, red line (nm), Δλ, speed. Then turn on <b>Show</b> to check.</p>');
    }
    if (mode === 'spec'){ const S = d.S, has = d.el !== 'none' && S[2].includes(d.el);
      return '<h4>1 · Every element has its own fingerprint</h4><div class="eq">Each element absorbs or gives off light at its own exact colors. A star’s spectrum shows dark lines where its gases absorb.</div>' +
        '<h4>2 · ' + S[0] + '</h4><div class="eq">' + (d.el === 'none' ? 'Pick an element to compare.' : ELS[d.el][0] + ': ' + (has ? '<b>lines match — it’s there</b>.' : 'no match.')) + '</div>' +
        '<h4>3 · What the whole universe is made of</h4><div class="eq">Add up all the stars and gas clouds: about <b>¾ hydrogen and ¼ helium</b> (by mass), with only about 2% everything else. That is exactly what the Big Bang theory predicts the first 3 minutes made.</div>' +
        '<p class="note">' + (v.src === 1 ? 'The Sun has lots of helium, but its surface is too cool to show helium lines. Helium was actually discovered in the Sun’s light during an eclipse in 1868, before it was found on Earth! ' : '') + 'Everything heavier than helium — the carbon in you, the iron in Earth — was made later inside stars (see the Star Life Cycle tab).</p>';
    }
    if (mode === 'cmb') return '<h4>1 · 380,000 years: light is set free</h4><div class="eq">Atoms form, the fog clears, and the light flies off in every direction. The universe glows at about <b>3000 K</b> — an orange-red glow, like a hot stove coil.</div>' +
      '<h4>2 · Space stretches the light</h4><div class="eq">Now: ' + tfmt(v.lt) + '. That light has been stretched <b>' + big(3000 / d.T) + '×</b> longer. Temperature: <b>' + big(d.T) + ' K</b>. Its peak is in <b>' + d.band + '</b>.</div>' +
      '<h4>3 · Today</h4><div class="eq">Stretched about 1100× since then: the glow is now <b>2.7 K microwaves</b>, coming from every direction in the sky.</div>' +
      '<p class="note">Found by accident in 1965 by Penzias and Wilson as a hiss in their radio antenna they couldn’t get rid of. A little of the static on an old TV between channels was this leftover glow of the Big Bang.</p>';
    const E = EPOCHS[d.ep];
    return '<h4>1 · ' + tfmt(v.lt) + ' after the Big Bang</h4><div class="eq"><b>' + E[1] + '.</b> ' + E[2] + '</div>' +
      '<h4>2 · Temperature</h4><div class="eq"><b>' + big(d.T) + ' K</b>' + (d.T > 5800 ? ' — hotter than the surface of the Sun (5800 K)' : d.T > 300 ? '' : ' — colder than anything on Earth') + '</div>' +
      '<h4>3 · The light it gives off</h4><div class="eq">Mostly <b>' + d.band + '</b>. Each bit of light carries about <b>' + efmt(d.E) + '</b> the energy of visible light.</div>' +
      '<h4>4 · Expansion</h4><div class="eq">This patch of space was <b>' + big(d.shrink) + '×</b> smaller than today.' + (d.shrink < 1.01 ? ' (It’s today!)' : '') + '</div>' +
      '<p class="note">As space expands, light gets stretched to longer wavelengths and the same energy spreads out over more space, so the universe cools. The Big Bang wasn’t an explosion <i>into</i> space — space itself is stretching everywhere at once, so there is no center.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const mono = '"IBM Plex Mono",monospace', sg = '"Space Grotesk",sans-serif';
    if (mode === 'red'){
      const G = d.G, chk = opt.chk === 'yes', X = l => 20 + (l - 380) / 350 * 360, Z = l => 20 + (l - 640) / 80 * 360;
      panelTitle('GALAXY ' + v.g + ' · ' + G.d + ' MILLION LIGHT-YEARS AWAY', 10, 18);
      ctx.fillStyle = '#0d1424'; ctx.fillRect(12, 26, 80, 70); const s = Math.max(4, 30 * 60 / G.d * 0.45 + 4);
      ctx.save(); ctx.translate(52, 61); ctx.rotate(0.5); const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, s); gr.addColorStop(0, 'rgba(255,245,220,1)'); gr.addColorStop(1, 'rgba(160,170,255,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.45, 0, 0, 7); ctx.fill(); ctx.restore();
      text('farther → smaller, dimmer', 100, 40, { font: '600 10px ' + mono, col: '#4a4a4a' }); text('distance found from its brightness', 100, 56, { font: '600 10px ' + mono, col: '#4a4a4a' });
      const strip = (y, lines, lab) => { for (let l = 380; l <= 730; l += 1){ const [r, g, b] = wlRGB2(l); ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'; ctx.fillRect(X(l), y, 1.2, 22); } ctx.fillStyle = '#000'; lines.forEach(l => ctx.fillRect(X(l) - 0.8, y, 1.6, 22)); text(lab, 20, y - 3, { font: '700 10px ' + sg }); };
      strip(118, HL, 'Hydrogen in the lab'); strip(160, HL.map(l => l * G.ha / 656.3), 'Light from Galaxy ' + v.g);
      for (let l = 400; l <= 720; l += 10){ ctx.fillStyle = '#111'; ctx.fillRect(X(l), 184, 1, l % 50 ? 4 : 8); if (l % 50 === 0) text(String(l), X(l), 202, { align: 'center', font: '500 9px ' + mono }); } text('nm', 386, 202, { align: 'right', font: '500 9px ' + mono });
      panelTitle('ZOOM ON THE RED HYDROGEN LINE (1 nm TICKS)', 10, 222);
      for (let l = 640; l <= 720; l += 0.5){ const [r, g, b] = wlRGB2(Math.min(729, l)); ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'; ctx.fillRect(Z(l), 232, 2.4, 40); }
      ctx.strokeStyle = '#fff'; ctx.setLineDash([3, 2]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(Z(656.3), 232); ctx.lineTo(Z(656.3), 272); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#000'; ctx.fillRect(Z(G.ha) - 1.5, 232, 3, 40);
      for (let l = 640; l <= 720; l++){ ctx.fillStyle = '#111'; ctx.fillRect(Z(l), 274, 1, l % 10 ? 4 : l % 5 ? 6 : 9); if (l % 10 === 0) text(String(l), Z(l), 292, { align: 'center', font: '500 9px ' + mono }); }
      text('dashed = lab position (656 nm) · black = galaxy', 20, 310, { font: '600 9px ' + mono, col: '#4a4a4a' });
      panelTitle('SPEED vs DISTANCE', 400, 18); const px = 418, py = 280, pw = 165, ph = 220, mxD = 1200, mxV = 28000;
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, py - ph); ctx.lineTo(px, py); ctx.lineTo(px + pw, py); ctx.stroke();
      text('distance (million ly)', px + pw, py + 16, { align: 'right', font: '600 9px ' + mono }); text('0', px - 4, py + 10, { align: 'right', font: '500 9px ' + mono }); text('1200', px + pw, py + 26, { align: 'right', font: '500 9px ' + mono, col: '#8a8a8a' });
      ctx.save(); ctx.translate(408, py - ph / 2); ctx.rotate(-PI / 2); text('speed (km/s)', 0, 0, { align: 'center', font: '600 9px ' + mono }); ctx.restore(); text('28,000', px + 3, py - ph + 8, { font: '500 9px ' + mono, col: '#8a8a8a' });
      if (chk){ ctx.strokeStyle = '#c43a00'; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + pw, py - ph * 22 * mxD / mxV); ctx.stroke(); ctx.setLineDash([]); GALS.forEach((g, i) => { ctx.fillStyle = i === v.g - 1 ? '#ff6a2b' : '#1546d6'; ctx.beginPath(); ctx.arc(px + pw * g.d / mxD, py - ph * g.v / mxV, i === v.g - 1 ? 5 : 3.5, 0, 7); ctx.fill(); }); }
      else text('plot your data here', px + pw / 2, py - ph / 2, { align: 'center', font: '600 10px ' + mono, col: '#bbb' });
      return;
    }
    if (mode === 'spec'){
      const S = d.S, X = l => 20 + (l - 385) / 330 * 320, emit = S[1] === 'emit';
      panelTitle('SPECTRUM OF: ' + S[0].toUpperCase(), 10, 18);
      for (let l = 385; l <= 715; l += 0.5){ const [r, g, b] = wlRGB2(l); ctx.fillStyle = emit ? '#000' : 'rgb(' + r + ',' + g + ',' + b + ')'; ctx.fillRect(X(l), 34, 1.4, 60); }
      S[2].forEach(k => ELS[k][1].forEach(l => { if (l < 385 || l > 715) return; const [r, g, b] = wlRGB2(l); ctx.fillStyle = emit ? 'rgb(' + r + ',' + g + ',' + b + ')' : '#000'; ctx.fillRect(X(l) - 1, 34, 2.2, 60); }));
      for (let l = 400; l <= 700; l += 10){ ctx.fillStyle = '#111'; ctx.fillRect(X(l), 96, 1, l % 50 ? 4 : 8); if (l % 50 === 0) text(String(l), X(l), 114, { align: 'center', font: '500 9px ' + mono }); }
      text(emit ? 'bright lines: the gas gives off these colors' : 'dark lines: gases in the star absorb these colors', 20, 128, { font: '600 9px ' + mono, col: '#4a4a4a' });
      panelTitle('ELEMENT FINGERPRINTS', 10, 146);
      ['H', 'He', 'Na', 'Ca', 'Mg'].forEach((k, i) => { const y = 156 + i * 31, on = d.el === k, has = S[2].includes(k);
        ctx.fillStyle = '#000'; ctx.fillRect(X(385), y, X(715) - X(385), 22); ELS[k][1].forEach(l => { if (l < 385 || l > 715) return; const [r, g, b] = wlRGB2(l); ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'; ctx.fillRect(X(l) - 1, y, 2.2, 22); });
        if (on){ ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 3; ctx.strokeRect(X(385) - 2, y - 2, X(715) - X(385) + 4, 26); ctx.strokeStyle = 'rgba(255,106,43,0.7)'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ELS[k][1].forEach(l => { if (l < 385 || l > 715) return; ctx.beginPath(); ctx.moveTo(X(l), 34); ctx.lineTo(X(l), y); ctx.stroke(); }); ctx.setLineDash([]); }
        text(ELS[k][0], X(715) + 4, y + 15, { font: (on ? '700' : '600') + ' 10px ' + sg, col: on ? '#c43a00' : '#111' }); });
      panelTitle('MADE OF (BY MASS)', 400, 18);
      const bar = (y, lab, parts) => { text(lab, 400, y, { font: '700 11px ' + sg }); let x = 400; parts.forEach(([n, p, c]) => { const w = 185 * p / 100; ctx.fillStyle = c; ctx.fillRect(x, y + 6, w, 26); if (w > 22) text(n, x + w / 2, y + 23, { align: 'center', font: '700 10px ' + mono, col: '#fff' }); x += w; }); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.strokeRect(400, y + 6, 185, 26); };
      bar(50, 'The universe (stars + gas)', [['H 74%', 74, '#e2453c'], ['He 24%', 24, '#d9a400'], ['', 2, '#777']]);
      bar(120, 'Planet Earth', [['Fe', 32, '#8a5a3c'], ['O', 30, '#3a8fd1'], ['Si', 15, '#7a7a7a'], ['Mg', 14, '#3ab26a'], ['', 9, '#bbb']]);
      text('Big Bang prediction:', 400, 190, { font: '700 11px ' + sg }); text('¾ hydrogen, ¼ helium ✓', 400, 206, { font: '700 12px ' + mono, col: '#c43a00' });
      text('Earth is mostly heavy elements', 400, 236, { font: '600 10px ' + mono, col: '#4a4a4a' }); text('made later inside stars.', 400, 250, { font: '600 10px ' + mono, col: '#4a4a4a' });
      return;
    }
    if (mode === 'cmb'){
      const T = d.T, f = (v.lt - 13.08) / (NOW - 13.08), [r, g, b] = bbRGB(T), cyc = 22 * Math.pow(1 / 22, f);
      panelTitle('LIGHT FROM 380,000 YEARS, STRETCHED BY EXPANDING SPACE', 10, 18);
      const w0 = 90 + 280 * f; ctx.fillStyle = T > 600 ? 'rgb(' + r + ',' + g + ',' + b + ')' : '#0d1424'; ctx.fillRect(200 - w0 / 2, 40, w0, 160); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(200 - w0 / 2, 40, w0, 160);
      ctx.strokeStyle = T > 1200 ? '#fff' : '#7fb6ff'; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= 300; k++){ const x = 200 - w0 / 2 + w0 * k / 300, y = 120 - 40 * Math.sin(2 * PI * cyc * k / 300 - t * 3); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      text('the same piece of space, growing', 200, 216, { align: 'center', font: '600 10px ' + mono, col: '#4a4a4a' });
      text('Temperature: ' + big(T) + ' K', 20, 246, { font: '700 14px ' + sg }); text('Peak light: ' + d.band + (d.band === 'infrared' && T > 1500 ? ' (glows orange-red)' : ''), 20, 268, { font: '700 12px ' + mono });
      text('Stretched ' + big(3000 / T) + '× so far', 20, 290, { font: '700 12px ' + mono, col: '#c43a00' });
      panelTitle('THE SKY IN THIS LIGHT', 400, 18); const cx = 495, cy = 120, rx = 92, ry = 50;
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.clip();
      if (T > 600){ ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'; ctx.fillRect(cx - rx, cy - ry, 2 * rx, 2 * ry); }
      else { const R = rngB(5); for (let k = 0; k < 900; k++){ const x = cx - rx + R() * 2 * rx, y = cy - ry + R() * 2 * ry, q = R(); ctx.fillStyle = 'hsl(' + (240 - q * 240) + ',85%,' + (45 + q * 10) + '%)'; ctx.beginPath(); ctx.arc(x, y, 3 + R() * 5, 0, 7); ctx.fill(); } }
      ctx.restore(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.stroke();
      text(T > 600 ? 'the whole sky glows' : 'microwave map of the whole sky', 400, 190, { font: '700 11px ' + sg }); text(T > 600 ? 'the same color everywhere' : '(false color: spots differ by', 400, 206, { font: '600 10px ' + mono, col: '#4a4a4a' }); if (T <= 600) text('only 0.0001 K)', 400, 220, { font: '600 10px ' + mono, col: '#4a4a4a' });
      text(T > 600 ? '' : T > 10 ? 'invisible to our eyes now' : 'seen in every direction', 400, 250, { font: '700 11px ' + mono, col: '#c43a00' });
      return;
    }
    // expanding & cooling
    const T = d.T, ep = d.ep, frac = (v.lt + 6) / (NOW + 6), sc = 0.12 + 0.88 * frac, cx = 200, cy = 170, [r, g, b] = bbRGB(T), fog = v.lt < 13.08;
    panelTitle('A PATCH OF THE UNIVERSE', 10, 18);
    ctx.save(); ctx.beginPath(); ctx.rect(12, 26, 376, 290); ctx.clip();
    ctx.fillStyle = fog ? 'rgb(' + r + ',' + g + ',' + b + ')' : '#05070d'; ctx.fillRect(12, 26, 376, 290);
    if (!fog && T > 600){ ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.25)'; ctx.fillRect(12, 26, 376, 290); }
    const P = PTS.map(([x, y, q]) => [cx + x * 175 * sc, cy + y * 140 * sc, q]);
    const jit = T > 1e3 ? Math.min(3, Math.log10(T) / 4) : 0;
    P.forEach(([x, y, q], i) => { const jx = jit * Math.sin(t * 9 + i * 1.7), jy = jit * Math.cos(t * 8 + i * 2.3); x += jx; y += jy;
      if (ep === 0){ ['#e23', '#2b3', '#36f'].forEach((c, k) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 4 * Math.cos(t * 6 + k * 2.1 + i), y + 4 * Math.sin(t * 6 + k * 2.1 + i), 1.8, 0, 7); ctx.fill(); }); }
      else if (ep === 1){ ctx.fillStyle = q < 0.8 ? '#d22' : '#666'; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); }
      else if (ep === 2){ const he = q > 0.92; ctx.fillStyle = he ? '#e8a200' : '#d22'; ctx.beginPath(); ctx.arc(x, y, he ? 4.5 : 3, 0, 7); ctx.fill(); ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(x + 8 * Math.sin(t * 5 + i), y + 6 * Math.cos(t * 4 + i), 1.4, 0, 7); ctx.fill(); }
      else if (ep === 3){ ctx.strokeStyle = 'rgba(120,150,255,0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.stroke(); ctx.fillStyle = '#d22'; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill(); }
      else if (ep === 4){ ctx.fillStyle = q > 0.6 ? '#ffe680' : 'rgba(120,150,255,0.5)'; ctx.beginPath(); ctx.arc(x, y, q > 0.6 ? 2.5 + Math.sin(t * 4 + i) : 2, 0, 7); ctx.fill(); }
      else { const gr = ctx.createRadialGradient(x, y, 0, x, y, 9); gr.addColorStop(0, 'rgba(255,240,210,1)'); gr.addColorStop(1, 'rgba(140,160,255,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(x, y, 9, 4.5, q * 3, 0, 7); ctx.fill(); } });
    if (fog){ for (let k = 0; k < 30; k++){ const R = rngB(k + Math.floor(t * 4)), x = 20 + R() * 360, y = 34 + R() * 270, a = R() * 6.3; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let s = 0; s <= 10; s++){ const px = x + Math.cos(a) * s * 1.6 - Math.sin(a) * 2 * Math.sin(s * 1.6), py = y + Math.sin(a) * s * 1.6 + Math.cos(a) * 2 * Math.sin(s * 1.6); s ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); } }
    if (ep >= 5){ const h = window._bbHome || 0, [hx, hy] = P[h]; ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx, hy, 11, 0, 7); ctx.stroke();
      P.forEach(([x, y], i) => { if (i === h) return; const dx = x - hx, dy = y - hy; if (Math.hypot(dx, dy) < 14) return; arrow(x, y, x + dx * 0.16, y + dy * 0.16, 'rgba(255,106,43,0.85)', null, { w: 1.3, head: 4 }); });
      text('you are here — click any galaxy to move', 18, 308, { font: '700 10px ' + mono, col: '#ff6a2b' }); }
    ctx.restore();
    if (!window._bbHook){ window._bbHook = 1; cv.addEventListener('click', e => { if (S.mode !== 'expand' || epoch(S.v.lt) < 5) return; const rc = cv.getBoundingClientRect(), x = (e.clientX - rc.left) * 600 / rc.width, y = (e.clientY - rc.top) * 330 / rc.height; const sc2 = 0.12 + 0.88 * (S.v.lt + 6) / (NOW + 6); let best = 0, bd = 1e9; PTS.forEach(([px, py], i) => { const dd = Math.hypot(200 + px * 175 * sc2 - x, 170 + py * 140 * sc2 - y); if (dd < bd){ bd = dd; best = i; } }); if (bd < 25){ window._bbHome = best; } }); }
    text(EPOCHS[ep][1], 20, 46, { font: '700 14px ' + sg, col: fog && T > 2000 ? '#111' : '#fff' });
    // right panel: thermometer + readouts
    panelTitle('TEMPERATURE', 400, 18); const ty0 = 36, ty1 = 300, TY = lg => ty0 + (13 - lg) / 13.6 * (ty1 - ty0);
    const grd = ctx.createLinearGradient(0, ty0, 0, ty1); grd.addColorStop(0, '#c9d7ff'); grd.addColorStop(0.6, '#ffb070'); grd.addColorStop(0.8, '#b0301a'); grd.addColorStop(1, '#1b1b40'); ctx.fillStyle = grd; ctx.fillRect(402, ty0, 12, ty1 - ty0); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.strokeRect(402, ty0, 12, ty1 - ty0);
    [12, 9, 6, 3, 0].forEach(e => { const y = TY(e); ctx.fillStyle = '#111'; ctx.fillRect(414, y, 4, 1); text(e ? '10' + SUP(e) : '1', 420, y + 3, { font: '500 8px ' + mono }); });
    const yT = TY(Math.log10(T)); ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.moveTo(400, yT); ctx.lineTo(392, yT - 5); ctx.lineTo(392, yT + 5); ctx.fill();
    text(big(T) + ' K', 448, 50, { font: '700 14px ' + mono }); text(T > 5800 ? 'hotter than the Sun' : T > 273 ? '' : 'colder than ice', 448, 64, { font: '600 9px ' + mono, col: '#4a4a4a' });
    text('LIGHT', 448, 92, { font: '700 10px ' + mono }); ctx.fillStyle = T > 600 ? 'rgb(' + r + ',' + g + ',' + b + ')' : '#1b1b40'; ctx.fillRect(448, 98, 140, 18); ctx.strokeStyle = '#111'; ctx.strokeRect(448, 98, 140, 18); text(d.band, 452, 111, { font: '700 10px ' + mono, col: T > 3000 ? '#111' : '#fff' });
    text('ENERGY OF EACH BIT', 448, 140, { font: '700 10px ' + mono }); text('OF LIGHT', 448, 152, { font: '700 10px ' + mono }); text(efmt(d.E) + ' visible', 448, 168, { font: '700 11px ' + mono, col: '#c43a00' });
    text('SIZE vs TODAY', 448, 196, { font: '700 10px ' + mono }); text(d.shrink < 1.01 ? 'today’s size' : '1/' + big(d.shrink), 448, 212, { font: '700 11px ' + mono, col: '#1546d6' });
    text('TIME', 448, 240, { font: '700 10px ' + mono }); const tl = tfmt(v.lt).split(' '); text(tl.slice(0, 2).join(' '), 448, 256, { font: '700 11px ' + mono }); if (tl.length > 2) text(tl.slice(2).join(' '), 448, 270, { font: '700 11px ' + mono });
  }
};
