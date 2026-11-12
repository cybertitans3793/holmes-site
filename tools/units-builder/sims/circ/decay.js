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
// Decay chain walker: U-238 -> Pb-206 on a Z-vs-N chart; the student picks alpha or beta-minus at each step.
const CSYM = { 80: 'Hg', 81: 'Tl', 82: 'Pb', 83: 'Bi', 84: 'Po', 85: 'At', 86: 'Rn', 87: 'Fr', 88: 'Ra', 89: 'Ac', 90: 'Th', 91: 'Pa', 92: 'U', 93: 'Np' };
const REAL = [[92, 238], [90, 234], [91, 234], [92, 234], [90, 230], [88, 226], [86, 222], [84, 218], [82, 214], [83, 214], [84, 214], [82, 210], [83, 210], [84, 210], [82, 206]];
const CMAX = 20, CH = { path: [[92, 238, '']], real: false, msg: '', msgAt: -99, stepAt: -99, btns: [], hooked: false, mode: null };
const chReal = (Z, A) => REAL.some(r => r[0] === Z && r[1] === A);
const chStepReal = (p, q) => { const i = REAL.findIndex(r => r[0] === p[0] && r[1] === p[1]); return i >= 0 && i < REAL.length - 1 && REAL[i + 1][0] === q[0] && REAL[i + 1][1] === q[1]; };
function chNext(kind){ const [Z, A] = CH.path[CH.path.length - 1], nZ = kind === 'a' ? Z - 2 : Z + 1, nA = kind === 'a' ? A - 4 : A, N = nA - nZ;
  if (nZ < 80 || nZ > 93 || N < 122 || N > 147) return null; return [nZ, nA, kind]; }
function chShowAll(){ S.v.go = CMAX; S.store['chain:go'] = CMAX; const r = $('r-go'); if (r) r.value = CMAX; }
function chAct(id){
  if (id === 'a' || id === 'b'){ if (CH.path.length - 1 >= CMAX){ CH.msg = CMAX + ' steps is plenty: press Reset'; CH.msgAt = S.t; return; }
    const n = chNext(id); if (!n){ CH.msg = 'That step would leave the chart'; CH.msgAt = S.t; return; } CH.path.push(n); CH.stepAt = S.t; chShowAll(); }
  else if (id === 'reset'){ CH.path = [[92, 238, '']]; chShowAll(); }
  else if (id === 'back'){ if (CH.path.length > 1) CH.path.pop(); chShowAll(); }
  else if (id === 'real') CH.real = !CH.real;
  update();
}
function chHook(){
  if (CH.hooked) return; CH.hooked = true;
  const hit = e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * 600 / r.width, y = (e.clientY - r.top) * 330 / r.height; return CH.mode === 'chain' ? CH.btns.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) : null; };
  cv.addEventListener('pointerdown', e => { const b = hit(e); if (b) chAct(b.id); });
  cv.addEventListener('pointermove', e => { const b = hit(e); cv.style.cursor = b ? 'pointer' : 'default'; });
}
const SIM = {
  title: 'Radioactive Decay',
  hint: 'A = λN · λ = ln2/t½',
  modes: [{ id: 'half', label: 'Half-life' }, { id: 'types', label: 'Decay types' }, { id: 'date', label: 'Radioactive dating' }, { id: 'pen', label: 'Penetration & background' }, { id: 'chain', label: 'Decay chain walker' }],
  opts: [{ id: 'clock', label: 'Clock', modes: ['date'], choices: [['c14', 'Carbon-14'], ['u', 'Uranium → lead']] },
    { id: 'src', label: 'Source', modes: ['pen'], choices: [['a', 'Alpha'], ['b', 'Beta'], ['g', 'Gamma']] },
    { id: 'ab', label: 'Absorber', modes: ['pen'], choices: [['none', 'None'], ['paper', 'Paper'], ['al', 'Aluminium 3 mm'], ['pb', 'Lead 2 cm']] }],
  ivs(mode, opt){
    if (mode === 'chain') return [{ id: 'go', sym: 'step', symText: 'step', label: 'Steps shown (drag back to replay your path)', unit: '', min: 0, max: CMAX, step: 1, val: CMAX, graph: true, show: x => x >= CMAX ? 'all' : 'first ' + x }];
    if (mode === 'pen') return [{ id: 'x', sym: 'd', symText: 'd', label: 'Source to detector', unit: 'cm', min: 1, max: 30, step: 0.5, val: 3, graph: true }, { id: 'B', sym: 'B', symText: 'B', label: 'Background count rate', unit: 'counts/min', min: 0, max: 60, step: 1, val: 30 }];
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
    if (mode === 'chain'){ const k = Math.max(0, Math.min(Math.round(v.go), CH.path.length - 1)), nodes = CH.path.slice(0, k + 1), cur = nodes[k], Z = cur[0], A = cur[1];
      const a = nodes.filter(n => n[2] === 'a').length, b = nodes.filter(n => n[2] === 'b').length, needA = (A - 206) / 4, needB = 82 - (Z - 2 * needA);
      return { k, total: CH.path.length - 1, nodes, a, b, Z, A, N: A - Z, sym: CSYM[Z] || '?', onReal: chReal(Z, A), allReal: nodes.every((n, i) => i === 0 || chStepReal(nodes[i - 1], n)), done: Z === 82 && A === 206, needA, needB, can: needA >= 0 && needB >= 0 && Number.isInteger(needA) }; }
    if (mode === 'pen'){ const src = opt.src || 'a', ab = opt.ab || 'none', TR = { a: { none: 1, paper: 0, al: 0, pb: 0 }, b: { none: 1, paper: 0.9, al: 0.01, pb: 0 }, g: { none: 1, paper: 1, al: 0.95, pb: 0.35 } };
      const reach = src === 'a' ? (v.x <= 5 ? 1 : 0) : 1, S = 1200 * Math.pow(3 / v.x, 2) * reach * TR[src][ab], meas = S + v.B;
      return { src, ab, S, meas, corr: meas - v.B, reach }; }
    if (mode === 'types'){ const [nm, sym, Z, A, ty, hl, use] = ISO[Math.max(0, Math.min(ISO.length - 1, Math.round(v.k)))]; let Z2 = Z, A2 = A; if (ty === 'a'){ Z2 = Z - 2; A2 = A - 4; } else if (ty.startsWith('b-')) Z2 = Z + 1; else if (ty === 'b+') Z2 = Z - 1;
      return { nm, sym, Z, A, ty, hl, use, Z2, A2, sym2: ty === 'g' ? sym : (SYMZ[Z2] || '?') }; }
    if (mode === 'date'){ if ((opt.clock || 'c14') === 'u'){ const th = 4.47e9, n = Math.log2(1 + v.r); return { u: true, th, n, age: th * n, frac: 1 / (1 + v.r) }; }
      const th = 5730, n = Math.log2(100 / v.pc); return { u: false, th, n, age: th * n, frac: v.pc / 100 }; }
    const lam = Math.LN2 / v.th, N = v.N0 * Math.pow(0.5, v.t / v.th); return { lam, N, A: lam * N, n: v.t / v.th };
  },
  dvs(mode){
    if (mode === 'chain') return [{ id: 'A', name: 'Mass number A after the steps', short: 'A', sym: 'A', unit: '', noTag: true, f: d => d.A }, { id: 'Z', name: 'Proton number Z after the steps', short: 'Z', sym: 'Z', unit: '', noTag: true, f: d => d.Z }, { id: 'N', name: 'Neutron number N after the steps', short: 'N', sym: 'N', unit: '', noTag: true, f: d => d.N }];
    if (mode === 'pen') return [{ id: 'meas', name: 'Count rate on the counter', short: 'C', sym: 'C', unit: 'counts/min', f: d => d.meas }, { id: 'corr', name: 'Corrected count rate (minus background)', short: 'C − B', sym: 'C−B', unit: 'counts/min', f: d => d.corr }];
    if (mode === 'types') return [{ id: 'A2', name: 'Mass number after', short: 'A', sym: 'A', unit: '', f: d => d.A2 }, { id: 'Z2', name: 'Proton number after', short: 'Z', sym: 'Z', unit: '', f: d => d.Z2 }];
    if (mode === 'date') return [{ id: 'age', name: 'Age of the sample', short: 'age', sym: 'age', unit: 'yr', f: d => d.age }];
    return [{ id: 'N', name: 'Nuclei left (prediction)', short: 'N', sym: 'N', unit: '', f: d => d.N, noTag: true, dblNote: 'Exponential decay: every extra half-life halves N, so it is not a power law.' }, { id: 'A', name: 'Activity (decays per second)', short: 'A', sym: 'A', unit: 'Bq', f: d => d.A, noTag: true }];
  },
  work(v, d, mode){
    if (mode === 'chain'){
      const mn = x => '<mn>' + x + '</mn>', CK = '<mspace width="0.6em"/><mtext>✓</mtext>', nm = d.sym + '-' + d.A;
      let s = '<h4>1 · Where you are</h4><p class="st">Start: U-238 (Z = 92, A = 238). Steps shown: <b>' + d.k + '</b> = <b>' + d.a + ' α</b> and <b>' + d.b + ' β⁻</b>. You are at <b>' + nm + '</b>.' + (d.k < d.total ? ' (Drag the slider right to see all ' + d.total + ' steps.)' : '') + '</p>' +
        '<h4>2 · Bookkeeping</h4><p class="st">Each α: A − 4, Z − 2. Each β⁻: A stays the same, Z + 1.</p>' + TEX`A = 238 - 4\times${mn(d.a)}` + TEXA`A = ${mn(d.A)}` + TEX`Z = 92 - 2\times${mn(d.a)} + ${mn(d.b)}` + TEXA`Z = ${mn(d.Z)}` + TEX`N = A - Z = ${mn(d.A)} - ${mn(d.Z)}` + TEXA`N = ${mn(d.N)}` +
        '<h4>3 · Is ' + nm + ' on the real U-238 series?</h4>' + (d.onReal ? '<div class="ok"><b>Yes.</b> ' + nm + ' is a real member of the uranium-238 series.' + (d.allReal ? ' Every step so far matches the real chain.' : ' But your steps did not follow the real order from U-238.') + '</div>' : '<div class="bad"><b>No.</b> ' + nm + ' is not in the real U-238 series. Check each step: the real chain only has α steps at some nuclei and β⁻ steps at others.</div>') +
        '<h4>4 · Why 8 α and 6 β⁻?</h4><p class="st">The mass number falls from 238 to 206, and only α changes A:</p>' + TEX`n_{\alpha} = \frac{238 - 206}{4}` + TEXA`n_{\alpha} = 8` +
        '<p class="st">8 α lower Z by 16, to 76. Pb has Z = 82, so β⁻ must raise it by 6:</p>' + TEX`n_{\beta} = 82 - (92 - 2\times8)` + TEXA`n_{\beta} = 6` +
        '<p class="st">Check:</p>' + TEX`A = 238 - 4\times8 = 206${CK}` + TEX`Z = 92 - 2\times8 + 6 = 82${CK}` +
        (d.done ? '<div class="ok"><b>You made lead-206!</b> It is stable, so the chain stops. You used <b>' + d.a + ' α</b> and <b>' + d.b + ' β⁻</b>' + (d.a === 8 && d.b === 6 ? ', the minimum.' : ' (the minimum is 8 α and 6 β⁻).') + '</div>' : d.can ? '<p class="st">From ' + nm + ' you still need <b>' + d.needA + ' α</b> and <b>' + d.needB + ' β⁻</b> to reach Pb-206.</p>' : '<div class="bad">Pb-206 can no longer be reached from ' + nm + ': ' + (d.needA < 0 ? 'A is already below 206.' : 'too many β⁻ steps have raised Z too far, and α cannot undo that.') + ' Press Back or Reset.</div>');
      if (CH.real) s += '<p class="note">The real series: U-238 α Th-234 β Pa-234 β U-234 α Th-230 α Ra-226 α Rn-222 α Po-218 α Pb-214 β Bi-214 β Po-214 α Pb-210 β Bi-210 β Po-210 α Pb-206 — 8 α and 6 β⁻ in all (the Pb and Bi isotopes can also branch a little; this is the main route). The radon-222 in it is a gas that seeps out of rock into basements.</p>';
      return s;
    }
    if (mode === 'pen'){ const nm = { a: 'Alpha (a helium nucleus, +2)', b: 'Beta (a fast electron, −1)', g: 'Gamma (a photon, no charge)' }[d.src];
      const ion = { a: 'Very strongly ionizing: it rips electrons off thousands of atoms per mm, so it loses its energy fast.', b: 'Medium ionizing: it is light and fast and has half the charge of an alpha.', g: 'Weakly ionizing: no charge, so it rarely hits anything.' }[d.src];
      const stop = { a: 'a sheet of paper or about 5 cm of air', b: 'a few mm of aluminium', g: 'is only reduced by thick lead or concrete' }[d.src];
      return '<h4>1 · ' + nm + '</h4><p class="st">' + ion + ' Stopped by <b>' + stop + '</b>.</p>' +
        '<h4>2 · Correct for background</h4><p class="st">Counter reads ' + H.n(d.meas, 'counts/min') + '. Background (rocks, cosmic rays, radon) = ' + H.iv('B') + '.</p>' +
        TEX`C_{\text{corrected}} = C_{\text{measured}} - B` + TEX`C_{\text{corrected}} = ${M.n(d.meas)} - ${M.iv('B', 1)}` + TEXA`C_{\text{corrected}} = ${M.n(d.corr, 'counts/min')}` +
        '<p class="note">More ionizing → less penetrating. Always measure the background first, with no source, and subtract it from every reading.' + (d.src === 'a' && !d.reach ? ' Alphas only travel about 5 cm in air, so the counter only sees background.' : '') + '</p>'; }
    if (mode === 'types'){
      const nuc = (s, Z, A) => { const zz = String(Z).replace(/^([+−-])(.*)$/, (m, sg, r) => '<mo>' + (sg === '-' ? '−' : sg) + '</mo><mn>' + r + '</mn>'); return '<mmultiscripts><mi mathvariant="normal">' + s + '</mi><mprescripts/><mrow>' + (/^[+−-]/.test(String(Z)) ? zz : '<mn>' + Z + '</mn>') + '</mrow><mn>' + A + '</mn></mmultiscripts>'; };
      const O = '<mo>+</mo>', nubar = '<mover accent="true"><mi>ν</mi><mo>¯</mo></mover>',
        emit = { a: O + nuc('α', 2, 4), 'b-': O + nuc('e', '-1', 0) + O + nubar, 'b-g': O + nuc('e', '-1', 0) + O + nubar + '<mtext> (then γ)</mtext>', 'b+': O + nuc('e', '+1', 0) + O + '<mi>ν</mi>', g: O + '<mi>γ</mi>' }[d.ty];
      const what = { a: 'Alpha: the nucleus throws out 2 protons + 2 neutrons. A drops by 4, Z by 2 — a different element.', 'b-': 'Beta-minus: a neutron turns into a proton, emitting an electron and an antineutrino. A stays, Z goes up 1.', 'b-g': 'Beta-minus (a neutron → proton + electron + antineutrino), leaving the nucleus excited; it then drops to its ground state by emitting gamma rays.', 'b+': 'Beta-plus: a proton turns into a neutron, emitting a positron and a neutrino. A stays, Z goes down 1.', g: 'Gamma: an excited nucleus (m = metastable) drops to a lower energy level and emits a photon. A and Z don’t change.' }[d.ty];
      const aOut = d.ty === 'a' ? 4 : 0, zOut = { a: 2, 'b-': -1, 'b-g': -1, 'b+': 1, g: 0 }[d.ty], CK = '<mspace width="0.6em"/><mtext>✓</mtext>', zo = zOut < 0 ? '<mrow><mo>(</mo><mo>−</mo><mn>' + (-zOut) + '</mn><mo>)</mo></mrow>' : '<mn>' + zOut + '</mn>';
      return '<h4>1 · The decay equation</h4>' + TEX`${nuc(d.sym, d.Z, d.A) + '<mo>→</mo>' + nuc(d.sym2, d.Z2, d.A2) + emit}` + '<p class="st">' + what + '</p>' +
        '<h4>2 · Check the conservation laws</h4><p class="st">Nucleon number (top numbers):</p>' + TEX`${'<mn>' + d.A + '</mn>'} = ${'<mn>' + d.A2 + '</mn>'} + ${'<mn>' + aOut + '</mn>'}${CK}` +
        '<p class="st">Charge (bottom numbers):</p>' + TEX`${'<mn>' + d.Z + '</mn>'} = ${'<mn>' + d.Z2 + '</mn>'} + ${zo}${CK}` +
        '<p class="st">Lepton number is conserved too (electron with antineutrino, positron with neutrino).</p>' +
        '<h4>3 · Use</h4><p class="st">Half-life ' + d.hl + '. ' + d.use + '.</p>' +
        '<p class="note">Penetration: α stopped by paper or skin (very ionizing — dangerous inside the body); β by a few mm of aluminium; γ only reduced by thick lead or concrete (least ionizing). Medical tracers use γ emitters with short half-lives.</p>';
    }
    if (mode === 'date') return d.u ? '<h4>1 · Every lead-206 atom was once uranium-238</h4><p class="st">If the rock started with no lead, the fraction of uranium left is:</p>' +
      TEX`\frac{U_{\text{now}}}{U_{\text{start}}} = \frac{1}{1 + \text{Pb/U}}` + TEX`\frac{U_{\text{now}}}{U_{\text{start}}} = \frac{1}{1 + ${M.iv('r', 1)}}` + TEXA`\frac{U_{\text{now}}}{U_{\text{start}}} = ${M.n(d.frac)}` +
      '<h4>2 · Number of half-lives</h4>' + TEX`\left(\frac{1}{2}\right)^n = ${M.n(d.frac)}` + TEX`n = \log_2\left(1 + \text{Pb/U}\right)` + TEX`n = \log_2\left(1 + ${M.iv('r', 1)}\right)` + TEXA`n = ${M.n(d.n)}` +
      '<h4>3 · Age</h4>' + TEX`\text{age} = n \times t_{1/2}` + TEX`\text{age} = ${M.n(d.n)} \times 4.47\times10^{9}\,\text{yr}` + TEXA`\text{age} = ${M.n(d.age, 'yr')}` +
      '<p class="note">The oldest rocks on Earth and meteorites give about 4.5 billion years: the age of the Solar System. You need a half-life similar to the age you are measuring.</p>'
      : '<h4>1 · Living things keep C-14 topped up</h4><p class="st">While alive, an organism has the same C-14 fraction as the air. After death no new C-14 comes in, and it decays with t½ = 5730 yr.</p>' +
      '<h4>2 · Number of half-lives</h4>' + TEX`\left(\frac{1}{2}\right)^n = ${M.n(d.frac)}` + TEX`n = \log_2\left(\frac{100}{\%\text{ left}}\right)` + TEX`n = \log_2\left(\frac{100}{${M.n(v.pc)}}\right)` + TEXA`n = ${M.n(d.n)}` +
      '<h4>3 · Age</h4>' + TEX`\text{age} = n \times t_{1/2}` + TEX`\text{age} = ${M.n(d.n)} \times 5730\,\text{yr}` + TEXA`\text{age} = ${M.n(d.age, 'yr')}` +
      '<p class="note">Works back to about 50 000 years; after that too little C-14 is left to measure against background radiation. Whole half-lives are easy: 25% left → 2 half-lives → 11 460 yr.</p>';
    return '<h4>1 · Decay constant</h4>' + TEX`\lambda = \frac{\ln 2}{t_{1/2}}` + TEX`\lambda = \frac{0.693}{${M.iv('th')}}` + TEXA`\lambda = ${M.n(d.lam, 's⁻¹')}` +
      '<p class="st">That is the chance per second that any one nucleus decays.</p>' +
      '<h4>2 · Nuclei left</h4>' + TEX`n = \frac{t}{t_{1/2}}` + TEX`n = \frac{${M.iv('t')}}{${M.iv('th')}}` + TEX`n = ${M.n(d.n)}` +
      TEX`N = N_0\left(\frac{1}{2}\right)^n` + TEX`N = ${M.iv('N0', 1)}\left(\frac{1}{2}\right)^{${M.n(d.n)}}` + TEXA`N = ${M.n(d.N)}` + '<p class="st">(Same as N₀e<sup>−λt</sup>.)</p>' +
      '<h4>3 · Activity</h4>' + TEX`A = \lambda N` + TEX`A = (${M.n(d.lam, 's⁻¹')})(${M.n(d.N)})` + TEXA`A = ${M.n(d.A, 'Bq')}` + '<p class="st">Decays per second. Activity halves every half-life too.</p>' +
      '<p class="note">Watch the live sample: you can’t predict <i>which</i> nucleus decays next, but a big sample follows the curve closely. Small samples wobble more. AP dice lab: remove the dice that show 1 each roll — “half-life” ≈ 3.8 rolls.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'chain') return drawChain(v, d, t);
    if (mode === 'pen') return drawPen(v, d, t);
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

function drawPen(v, d, t){
  const F = '"Space Grotesk",sans-serif', Mo = '"IBM Plex Mono",monospace', col = { a: '#c43a00', b: '#1546d6', g: '#7a3fb0' }[d.src];
  panelTitle('ALPHA, BETA, GAMMA: WHAT GETS THROUGH?', 10, 18);
  const xs = 40, xd = Math.min(360, 70 + v.x * 9.5), yc = 160, xa = (xs + xd) / 2;
  ctx.fillStyle = '#555'; ctx.fillRect(xs - 22, yc - 25, 26, 50); text('source', xs - 9, yc + 42, { align: 'center', font: '600 10px ' + F });
  ctx.fillStyle = '#d9d4c7'; ctx.fillRect(xd, yc - 18, 40, 36); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(xd, yc - 18, 40, 36); text('G–M', xd + 20, yc + 4, { align: 'center', font: '700 10px ' + Mo }); text('counter', xd + 20, yc + 34, { align: 'center', font: '600 10px ' + F });
  const abw = { none: 0, paper: 2, al: 6, pb: 18 }[d.ab], abc = { paper: '#f2efe6', al: '#b9c2cc', pb: '#6b6f78' }[d.ab];
  if (abw){ ctx.fillStyle = abc; ctx.fillRect(xa - abw / 2, yc - 60, abw, 120); ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.strokeRect(xa - abw / 2, yc - 60, abw, 120); text({ paper: 'paper', al: 'aluminium', pb: 'lead' }[d.ab], xa, yc - 66, { align: 'center', font: '600 10px ' + F }); }
  const range = d.src === 'a' ? 70 + 5 * 9.5 - xs : 1e9, tr = d.S / Math.max(1, 1200 * Math.pow(3 / v.x, 2) * d.reach);
  for (let i = 0; i < 9; i++){
    const yy = yc - 14 + (i % 5) * 7, ph = ((t || 0) * 0.9 + i / 9) % 1; let x = xs + 4 + ph * (xd - xs);
    const blocked = (abw && x > xa - abw / 2 && i / 9 >= tr) || (x - xs > range);
    if (abw && i / 9 >= tr && x > xa - abw / 2) x = xa - abw / 2; if (x - xs > range) x = xs + range;
    ctx.fillStyle = blocked ? 'rgba(0,0,0,0.25)' : col; ctx.beginPath(); ctx.arc(x, yy, d.src === 'a' ? 4 : 2.6, 0, 7); ctx.fill();
  }
  if (d.src === 'a'){ ctx.setLineDash([3, 3]); ctx.strokeStyle = '#c43a00'; ctx.beginPath(); ctx.moveTo(xs + range, yc - 40); ctx.lineTo(xs + range, yc + 40); ctx.stroke(); ctx.setLineDash([]); text('~5 cm of air', xs + range, yc + 54, { align: 'center', font: '500 9px ' + Mo, col: '#c43a00' }); }
  text('d = ' + v.x + ' cm', (xs + xd) / 2, 300, { align: 'center', font: '700 12px ' + F });
  panelTitle('THE COUNTER', 395, 18);
  [['source', { a: 'alpha α', b: 'beta β⁻', g: 'gamma γ' }[d.src]], ['ionizing', { a: 'strong', b: 'medium', g: 'weak' }[d.src]], ['penetrating', { a: 'weak', b: 'medium', g: 'strong' }[d.src]], ['reading C', fplain(d.meas) + '/min'], ['background B', v.B + '/min'], ['C − B', fplain(d.corr) + '/min']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px ' + F, col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px ' + Mo }); });
  text('subtract the background', 400, 220, { font: '700 11px ' + F, col: '#1e7d45' });
}

function drawChain(v, d, t){
  chHook(); CH.mode = 'chain';
  const F = '"Space Grotesk",sans-serif', Mo = '"IBM Plex Mono",monospace', gx0 = 30, cw = 13.5, Nmin = 122, ncol = 26, gy0 = 32, rh = 16, Zmax = 93, nrow = 14;
  const X = N => gx0 + (N - Nmin + 0.5) * cw, Y = Z => gy0 + (Zmax - Z + 0.5) * rh, XY = (Z, A) => [X(A - Z), Y(Z)];
  panelTitle('CHART OF NUCLIDES: Z (UP) vs N (ACROSS)', 10, 18);
  ctx.strokeStyle = '#e6e6e6'; ctx.lineWidth = 1; for (let i = 0; i <= ncol; i++){ ctx.beginPath(); ctx.moveTo(gx0 + i * cw, gy0); ctx.lineTo(gx0 + i * cw, gy0 + nrow * rh); ctx.stroke(); } for (let j = 0; j <= nrow; j++){ ctx.beginPath(); ctx.moveTo(gx0, gy0 + j * rh); ctx.lineTo(gx0 + ncol * cw, gy0 + j * rh); ctx.stroke(); }
  for (let Z = 80; Z <= Zmax; Z++) text(Z + ' ' + CSYM[Z], gx0 - 3, Y(Z) + 3, { align: 'right', font: '600 9px ' + Mo });
  for (let N = 122; N < Nmin + ncol; N += 2) text(String(N), X(N), gy0 + nrow * rh + 11, { align: 'center', font: '500 9px ' + Mo });
  text('N (neutrons) →', gx0 + ncol * cw, gy0 + nrow * rh + 24, { align: 'right', font: '600 10px ' + Mo, col: '#4a4a4a' });
  const lab = (Z, A, kind, col, bold) => { const [x, y] = XY(Z, A); ctx.save(); ctx.font = (bold ? '700 ' : '600 ') + '10px ' + F; const st = !kind || x + 46 > 384; ctx.textAlign = st ? 'right' : 'left'; ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = '#fbfbfb'; const tx = !kind ? x + 8 : st ? x - 6 : x + 6, ty = y + (!kind ? -8 : st ? (kind === 'b' ? -5 : 12) : kind === 'b' ? -5 : 12), s2 = (CSYM[Z] || '?') + '-' + A; ctx.strokeText(s2, tx, ty); ctx.fillStyle = col; ctx.fillText(s2, tx, ty); ctx.restore(); };
  const on = {}; d.nodes.forEach(n => on[n[0] + ',' + n[1]] = 1);
  if (CH.real){
    REAL.forEach(([Z, A]) => { const [x, y] = XY(Z, A); ctx.fillStyle = '#dff3e6'; ctx.fillRect(x - cw / 2, y - rh / 2, cw, rh); });
    for (let i = 1; i < REAL.length; i++){ const [x1, y1] = XY(REAL[i - 1][0], REAL[i - 1][1]), [x2, y2] = XY(REAL[i][0], REAL[i][1]), L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L; ctx.globalAlpha = 0.55; arrow(x1 + ux * 5, y1 + uy * 5, x2 - ux * 5, y2 - uy * 5, '#1e7d45', null, { w: 5, head: 8 }); ctx.globalAlpha = 1; }
    REAL.forEach(([Z, A], i) => { if (!on[Z + ',' + A]) lab(Z, A, i && REAL[i][0] < REAL[i - 1][0] ? 'a' : 'b', '#1e7d45', false); });
  }
  const [tx, ty] = XY(82, 206); ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2; ctx.setLineDash([3, 2]); ctx.strokeRect(tx - cw / 2 - 1, ty - rh / 2 - 1, cw + 2, rh + 2); ctx.setLineDash([]); if (!on['82,206']) text('target Pb-206', tx - 6, ty + 20, { font: '700 9px ' + F, col: '#7a3fb0' });
  for (let i = 1; i < d.nodes.length; i++){ const p = d.nodes[i - 1], q = d.nodes[i], [x1, y1] = XY(p[0], p[1]), [x2, y2] = XY(q[0], q[1]), L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
    let pr = 1; if (i === CH.path.length - 1 && d.k === d.total) pr = Math.min(1, (t - CH.stepAt) / 0.35); const ex = x1 + (x2 - x1) * pr, ey = y1 + (y2 - y1) * pr;
    arrow(x1 + ux * 5, y1 + uy * 5, ex - ux * 5 * pr, ey - uy * 5 * pr, q[2] === 'a' ? '#c43a00' : '#1546d6', null, { w: 2.4, head: 7 }); }
  d.nodes.forEach((n, i) => { const [x, y] = XY(n[0], n[1]), real = chReal(n[0], n[1]); ctx.fillStyle = real ? '#1e7d45' : '#fff'; ctx.strokeStyle = real ? '#111' : '#c43a00'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(x, y, 4.2, 0, 7); ctx.fill(); ctx.stroke();
    lab(n[0], n[1], n[2], i === d.k ? '#111' : '#333', i === d.k); });
  const [cx, cy] = XY(d.Z, d.A); ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 7); ctx.stroke();
  // right panel
  panelTitle('YOUR NUCLIDE', 395, 18);
  text(d.sym + '-' + d.A, 400, 46, { font: '700 22px ' + F });
  text(d.onReal ? 'on the real series ✓' : 'NOT on the real series ✗', 400, 62, { font: '700 11px ' + F, col: d.onReal ? '#1e7d45' : '#c43a00' });
  [['Z / N / A', d.Z + ' / ' + d.N + ' / ' + d.A], ['α steps', String(d.a)], ['β⁻ steps', String(d.b)], ['A check', '238 − 4·' + d.a + ' = ' + (238 - 4 * d.a)], ['Z check', '92 − 2·' + d.a + ' + ' + d.b + ' = ' + (92 - 2 * d.a + d.b)]].forEach(([a, b], i) => { text(a, 400, 90 + i * 20, { font: '600 11px ' + F, col: '#4a4a4a' }); text(b, 590, 90 + i * 20, { align: 'right', font: '700 11px ' + Mo }); });
  text(d.done ? 'Reached Pb-206!' : d.can ? 'still need ' + d.needA + ' α and ' + d.needB + ' β⁻' : 'Pb-206 is out of reach', 400, 208, { font: '700 12px ' + F, col: d.done ? '#1e7d45' : d.can ? '#111' : '#c43a00' });
  const okA = !!chNext('a'), okB = !!chNext('b'), full = CH.path.length - 1 >= CMAX;
  CH.btns = [{ id: 'a', x: 400, y: 222, w: 88, h: 38, on: okA && !full, l1: 'α', l2: 'Z−2, N−2', col: '#c43a00' }, { id: 'b', x: 496, y: 222, w: 92, h: 38, on: okB && !full, l1: 'β⁻', l2: 'Z+1, N−1', col: '#1546d6' },
    { id: 'reset', x: 400, y: 268, w: 56, h: 24, on: true, l1: 'Reset' }, { id: 'back', x: 462, y: 268, w: 46, h: 24, on: CH.path.length > 1, l1: 'Back' }, { id: 'real', x: 514, y: 268, w: 74, h: 24, on: true, l1: 'Real chain', tog: CH.real }];
  CH.btns.forEach(b => { ctx.fillStyle = b.tog ? '#111' : b.on ? '#fff' : '#eee'; ctx.strokeStyle = b.on ? '#111' : '#bbb'; ctx.lineWidth = 2; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.strokeRect(b.x, b.y, b.w, b.h);
    const c = !b.on ? '#aaa' : b.tog ? '#fff' : b.col || '#111'; if (b.l2){ text(b.l1, b.x + b.w / 2, b.y + 18, { align: 'center', font: '700 17px ' + F, col: c }); text(b.l2, b.x + b.w / 2, b.y + 31, { align: 'center', font: '600 9px ' + Mo, col: b.on ? '#4a4a4a' : '#aaa' }); } else text(b.l1, b.x + b.w / 2, b.y + 16, { align: 'center', font: '700 12px ' + F, col: c }); });
  if (t - CH.msgAt < 2.5) text(CH.msg, 400, 310, { font: '700 10px ' + F, col: '#c43a00' }); else text('Pick α or β⁻ for each step', 400, 310, { font: '600 10px ' + F, col: '#4a4a4a' });
}
