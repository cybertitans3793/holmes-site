// Binding Energy & Mass Defect (AP 15.7, IB E.3–E.5): mass defect and binding energy per nucleon for real nuclei, the binding-energy curve (why fusion and fission both release energy), and E = mc² for fusion, fission and alpha decay — with energy per kilogram compared to fuels.
const MH = 1.007825, MNU = 1.008665, U2MEV = 931.5;
const NUC = [['Hydrogen-2 (deuterium)', 'H', 1, 2, 2.014102], ['Hydrogen-3 (tritium)', 'H', 1, 3, 3.016049], ['Helium-3', 'He', 2, 3, 3.016029], ['Helium-4', 'He', 2, 4, 4.002603], ['Lithium-7', 'Li', 3, 7, 7.016003], ['Carbon-12', 'C', 6, 12, 12.0], ['Oxygen-16', 'O', 8, 16, 15.994915], ['Iron-56', 'Fe', 26, 56, 55.934936], ['Nickel-62', 'Ni', 28, 62, 61.928345], ['Krypton-92', 'Kr', 36, 92, 91.926173], ['Barium-141', 'Ba', 56, 141, 140.914403], ['Lead-208', 'Pb', 82, 208, 207.976652], ['Uranium-235', 'U', 92, 235, 235.04393], ['Uranium-238', 'U', 92, 238, 238.050788]];
const M = { n: 1.008665, H1: 1.007825, H2: 2.014102, H3: 3.016049, He3: 3.016029, He4: 4.002603, U235: 235.04393, U238: 238.050788, Th234: 234.043601, Ba141: 140.914403, Kr92: 91.926173 };
const RX = [
  ['D–T fusion (ITER, the future?)', '²H + ³H → ⁴He + n', [['H2', 1], ['H3', 1]], [['He4', 1], ['n', 1]], 'fusion'],
  ['D–D fusion', '²H + ²H → ³He + n', [['H2', 2]], [['He3', 1], ['n', 1]], 'fusion'],
  ['Sun: net p–p chain', '4 ¹H → ⁴He + 2e⁺ + 2ν', [['H1', 4]], [['He4', 1]], 'fusion'],
  ['Fission of uranium-235', 'n + ²³⁵U → ¹⁴¹Ba + ⁹²Kr + 3n', [['n', 1], ['U235', 1]], [['Ba141', 1], ['Kr92', 1], ['n', 3]], 'fission'],
  ['Alpha decay of uranium-238', '²³⁸U → ²³⁴Th + ⁴He', [['U238', 1]], [['Th234', 1], ['He4', 1]], 'decay']];
const beA = A => { if (A < 2) return 0; const Z = A / (2 + 0.0155 * Math.pow(A, 2 / 3)); return (15.75 * A - 17.8 * Math.pow(A, 2 / 3) - 0.711 * Z * (Z - 1) / Math.cbrt(A) - 23.7 * Math.pow(A - 2 * Z, 2) / A) / A; }; // semi-empirical curve for the background
const SIM = {
  title: 'Binding Energy & Mass Defect',
  hint: 'E = mc² · 1 u = 931.5 MeV/c²',
  modes: [{ id: 'nuc', label: 'One nucleus' }, { id: 'rx', label: 'Energy from a reaction' }],
  ivs(mode){
    if (mode === 'rx') return [{ id: 'k', sym: 'reaction', symText: 'reaction', label: 'Reaction', unit: '', min: 0, max: RX.length - 1, step: 1, val: 0, show: x => RX[x][0], graph: true }];
    return [{ id: 'k', sym: 'nucleus', symText: 'nucleus', label: 'Nucleus', unit: '', min: 0, max: NUC.length - 1, step: 1, val: 3, show: x => NUC[x][0], graph: true }];
  },
  presets: [{ label: 'Helium-4', mode: 'nuc', v: { k: 3 } }, { label: 'Iron-56 (the peak)', mode: 'nuc', v: { k: 7 } }, { label: 'Uranium fission', mode: 'rx', v: { k: 3 } }, { label: 'D–T fusion', mode: 'rx', v: { k: 0 } }],
  calc(v, mode){
    if (mode === 'rx'){ const [nm, eq, L, R, kind] = RX[Math.max(0, Math.min(RX.length - 1, Math.round(v.k)))], sum = s => s.reduce((a, [k, n]) => a + n * M[k], 0), mL = sum(L), mR = sum(R), dm = mL - mR, Q = dm * U2MEV, perKg = Q * 1.6e-13 / (mL * 1.6605e-27);
      return { nm, eq, kind, mL, mR, dm, Q, perKg, ratio: perKg / 4.6e7 }; }
    const [nm, sym, Z, A, m] = NUC[Math.max(0, Math.min(NUC.length - 1, Math.round(v.k)))], N = A - Z, mParts = Z * MH + N * MNU, dm = mParts - m, BE = dm * U2MEV;
    return { nm, sym, Z, A, N, m, mParts, dm, BE, per: BE / A, dmKg: dm * 1.6605e-27 };
  },
  dvs(mode){
    if (mode === 'rx') return [{ id: 'Q', name: 'Energy released', short: 'Q', sym: 'Q', unit: 'MeV', f: d => d.Q }];
    return [{ id: 'per', name: 'Binding energy per nucleon', short: 'BE/A', sym: 'BE/A', unit: 'MeV', f: d => d.per }, { id: 'BE', name: 'Total binding energy', short: 'BE', sym: 'BE', unit: 'MeV', f: d => d.BE }];
  },
  work(v, d, mode){
    if (mode === 'rx') return '<h4>1 · ' + d.nm + '</h4><div class="eq" style="font-size:16px">' + d.eq + '</div>' +
      '<h4>2 · Mass before and after</h4><div class="eq">Before: ' + fnum(d.mL) + ' u. After: ' + fnum(d.mR) + ' u. Mass lost: Δm = <b>' + d.dm.toFixed(6) + ' u</b> (using atomic masses)</div>' +
      '<h4>3 · E = mc²</h4><div class="eq">Q = Δm × 931.5 MeV/u = <b>' + H.n(d.Q, 'MeV') + '</b> = ' + H.n(d.Q * 1.6e-13, 'J') + '</div>' +
      '<h4>4 · Per kilogram of fuel</h4><div class="eq">' + H.n(d.perKg, 'J/kg') + ' — about <b>' + fnum(d.ratio) + '×</b> gasoline (4.6×10⁷ J/kg)</div>' +
      '<p class="note">' + (d.kind === 'fusion' ? 'Fusion: light nuclei join into a more tightly bound nucleus (up the left side of the curve). It needs huge temperature and density so the nuclei can get close despite their electric repulsion — that’s why it happens in star cores.' : d.kind === 'fission' ? 'Fission: a heavy nucleus splits into two medium nuclei, which are more tightly bound (up the right side of the curve). The 3 extra neutrons can start a chain reaction. Most of the energy is kinetic energy of the fragments → heat.' : 'Alpha decay happens on its own because the products have less mass. The energy is shared as kinetic energy, mostly carried by the light alpha particle (momentum conservation).') + '</p>';
    return '<h4>1 · Mass of the separate parts</h4><div class="eq">' + d.Z + ' hydrogen atoms (' + MH + ' u) + ' + d.N + ' neutrons (' + MNU + ' u) = ' + fnum(d.mParts) + ' u</div>' +
      '<h4>2 · Mass defect</h4><div class="eq">The ' + d.nm + ' atom has mass ' + d.m + ' u, so Δm = <b>' + d.dm.toFixed(6) + ' u</b> = ' + H.n(d.dmKg, 'kg') + '</div>' +
      '<h4>3 · Binding energy</h4><div class="eq">BE = Δm c² = ' + d.dm.toFixed(6) + ' × 931.5 = <b>' + H.n(d.BE, 'MeV') + '</b> → per nucleon: <b>' + H.n(d.per, 'MeV') + '</b></div>' +
      '<p class="note">Binding energy is the energy needed to pull the nucleus completely apart (not energy stored inside it). Higher BE per nucleon = more stable. The curve peaks near iron and nickel: lighter nuclei release energy by fusing, heavier ones by splitting.</p>';
  },
  draw(v, d, mode){
    panelTitle('BINDING ENERGY PER NUCLEON', 10, 18);
    const gx = 50, gy = 290, gw = 330, gh = 250, X = A => gx + gw * A / 240, Y = b => gy - gh * b / 9.5;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    [0, 2, 4, 6, 8].forEach(b => text(String(b), gx - 6, Y(b) + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace' })); [0, 60, 120, 180, 240].forEach(A => text(String(A), X(A), gy + 13, { align: 'center', font: '500 9px "IBM Plex Mono",monospace' }));
    text('nucleon number A', gx + gw, gy + 26, { align: 'right', font: '600 9px "IBM Plex Mono",monospace' }); text('MeV', gx - 8, gy - gh - 6, { font: '600 9px "IBM Plex Mono",monospace' });
    ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2; ctx.beginPath(); for (let A = 10; A <= 240; A++){ A === 10 ? ctx.moveTo(X(A), Y(beA(A))) : ctx.lineTo(X(A), Y(beA(A))); } ctx.stroke();
    NUC.forEach(([nm, s, Z, A, m]) => { const b = ((Z * MH + (A - Z) * MNU - m) * U2MEV) / A; ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(X(A), Y(b), 3.5, 0, 7); ctx.fill(); if (['He', 'Fe', 'U', 'Li', 'H'].includes(s) && !(s === 'U' && A === 238) && !(s === 'H' && A === 3)) text(s + '-' + A, X(A) + 6, Y(b) + (s === 'H' ? -4 : 12), { font: '600 9px "IBM Plex Mono",monospace' }); });
    arrow(X(10), Y(3), X(40), Y(7.2), '#c43a00', 'fusion', { w: 2.5, lx: 4, ly: 14 }); arrow(X(225), Y(6.8), X(130), Y(7.7), '#7a3fb0', 'fission', { w: 2.5, ly: 16, lx: -4 });
    if (mode === 'nuc'){ ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(X(d.A), Y(d.per), 7, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.stroke(); }
    panelTitle(mode === 'nuc' ? 'THE NUCLEUS' : 'THE REACTION', 395, 18);
    if (mode === 'nuc'){ const r = 3.2 * Math.cbrt(d.A); for (let i = 0; i < Math.min(d.A, 60); i++){ const a = i * 2.4, rr = r * Math.sqrt((i + 0.5) / Math.min(d.A, 60)); ctx.fillStyle = i < Math.round(d.Z / d.A * Math.min(d.A, 60)) ? '#c43a00' : '#8a8a8a'; ctx.beginPath(); ctx.arc(490 + rr * Math.cos(a) * 1.4, 90 + rr * Math.sin(a) * 1.4, 4.5, 0, 7); ctx.fill(); }
      [['protons', d.Z], ['neutrons', d.N], ['mass defect', d.dm.toFixed(5) + ' u'], ['BE', fplain(d.BE) + ' MeV'], ['BE / A', fplain(d.per) + ' MeV']].forEach(([a, b], i) => { text(a, 400, 170 + i * 24, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(String(b), 590, 170 + i * 24, { align: 'right', font: '700 12px "IBM Plex Mono",monospace' }); }); }
    else { text(d.eq, 400, 50, { font: '700 13px "Space Grotesk",sans-serif' }); [['mass before', fplain(d.mL) + ' u'], ['mass after', fplain(d.mR) + ' u'], ['Δm', d.dm.toFixed(5) + ' u'], ['Q', fplain(d.Q) + ' MeV'], ['per kg', fplain(d.perKg) + ' J'], ['vs gasoline', '×' + fplain(d.ratio)]].forEach(([a, b], i) => { text(a, 400, 82 + i * 24, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 82 + i * 24, { align: 'right', font: '700 12px "IBM Plex Mono",monospace' }); }); }
  }
};
