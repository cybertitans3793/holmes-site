// Particles & Pressure (AP 9.1, IB B.3): temperature = average KE, Maxwell–Boltzmann speeds, pressure from wall collisions, P = ⅓ρv².
const KB = 1.38e-23, RG = 8.31, U_KG = 1.66e-27;
const GASES = { He: 4, N2: 28, O2: 32, Ar: 40, Xe: 131 };
function rnd(i){ const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function gauss(i){ return Math.sqrt(-2 * Math.log(rnd(2 * i + 1) * 0.999 + 0.0005)) * Math.cos(2 * PI * rnd(2 * i + 2)); }
function mb(v, M, T){ const m = M * U_KG, a = m / (2 * KB * T); return 4 * PI * Math.pow(a / PI, 1.5) * v * v * Math.exp(-a * v * v); }
const SIM = {
  title: 'Particles & Pressure',
  hint: 'k<sub>B</sub> = 1.38×10⁻²³ J/K · R = 8.31 J/(mol·K)',
  modes: [{ id: 'one', label: 'Gas in a box' }, { id: 'mix', label: 'Two gases, same T' }, { id: 'wall', label: 'One molecule hits a wall' }],
  opts: [{ id: 'gas', label: 'Gas', modes: ['one', 'wall'], choices: [['N2', 'N₂'], ['He', 'He'], ['O2', 'O₂'], ['Ar', 'Ar'], ['Xe', 'Xe']] }],
  ivs(mode){
    if (mode === 'mix') return [{ id: 'T', sym: 'T', symText: 'T', label: 'Temperature of both', unit: 'K', min: 50, max: 1000, step: 5, val: 300, graph: true }];
    if (mode === 'wall') return [
      { id: 'vx', sym: 'v<sub>x</sub>', symText: 'vx', label: 'Molecule’s speed toward the wall', unit: 'm/s', min: 100, max: 1500, step: 10, val: 500, graph: true },
      { id: 'L', sym: 'L', symText: 'L', label: 'Box length', unit: 'm', min: 0.05, max: 0.5, step: 0.01, val: 0.2 }];
    return [
      { id: 'T', sym: 'T', symText: 'T', label: 'Temperature', unit: 'K', min: 50, max: 1000, step: 5, val: 300, graph: true },
      { id: 'n', sym: 'n', symText: 'n', label: 'Amount of gas', unit: 'mol', min: 0.2, max: 3, step: 0.1, val: 1 },
      { id: 'V', sym: 'V', symText: 'V', label: 'Volume of the box', unit: 'L', min: 5, max: 50, step: 0.5, val: 25 }];
  },
  presets: [{ label: 'Quadruple T', mode: 'one', v: { T: 1000 } }, { label: 'Halve the volume', mode: 'one', v: { V: 12.5 } }, { label: 'Very cold', mode: 'mix', v: { T: 60 } }],
  calc(v, mode, opt){
    if (mode === 'mix'){ const He = 4 * U_KG, Ar = 40 * U_KG, KE = 1.5 * KB * v.T; return { KE, vHe: Math.sqrt(3 * KB * v.T / He), vAr: Math.sqrt(3 * KB * v.T / Ar), ratio: Math.sqrt(10) }; }
    const M = GASES[opt.gas || 'N2'], m = M * U_KG;
    if (mode === 'wall'){ const dp = 2 * m * v.vx, dt = 2 * v.L / v.vx, F = dp / dt; return { M, m, dp, dt, F, hits: 1 / dt }; }
    const KE = 1.5 * KB * v.T, vrms = Math.sqrt(3 * KB * v.T / m), Vm3 = v.V / 1000, P = v.n * RG * v.T / Vm3, rho = v.n * M / 1000 / Vm3, N = v.n * 6.02e23;
    return { M, m, KE, vrms, P, rho, N, Pk: rho * vrms * vrms / 3, U: 1.5 * v.n * RG * v.T };
  },
  dvs(mode){
    if (mode === 'mix') return [{ id: 'vHe', name: 'rms speed of helium', short: 'v_He', sym: 'v<sub>rms,He</sub>', unit: 'm/s', f: d => d.vHe }, { id: 'vAr', name: 'rms speed of argon', short: 'v_Ar', sym: 'v<sub>rms,Ar</sub>', unit: 'm/s', f: d => d.vAr }, { id: 'KE', name: 'Average KE (same for both)', short: 'KE', sym: 'KE<sub>avg</sub>', unit: 'J', f: d => d.KE }];
    if (mode === 'wall') return [{ id: 'F', name: 'Average force on the wall', short: 'F', sym: 'F<sub>avg</sub>', unit: 'N', f: d => d.F }, { id: 'dp', name: 'Momentum change per hit', short: 'Δp', sym: 'Δp', unit: 'kg·m/s', f: d => d.dp }, { id: 'hits', name: 'Hits per second on one wall', short: 'hits/s', sym: 'hits/s', unit: '1/s', f: d => d.hits }];
    return [{ id: 'P', name: 'Pressure', short: 'P', sym: 'P', unit: 'Pa', f: d => d.P }, { id: 'vrms', name: 'rms speed', short: 'v_rms', sym: 'v<sub>rms</sub>', unit: 'm/s', f: d => d.vrms }, { id: 'KE', name: 'Average KE per molecule', short: 'KE', sym: 'KE<sub>avg</sub>', unit: 'J', f: d => d.KE }, { id: 'U', name: 'Internal energy (monatomic)', short: 'U', sym: 'U', unit: 'J', f: d => d.U }];
  },
  work(v, d, mode, opt){
    if (mode === 'mix') return '<h4>1 · Same temperature → same average kinetic energy</h4><div class="eq">KE<sub>avg</sub> = (3/2)k<sub>B</sub>T = 1.5 × 1.38×10⁻²³ × ' + H.iv('T') + ' = <b>' + H.n(d.KE, 'J') + '</b> for helium <i>and</i> argon</div>' +
      '<h4>2 · Same KE, different mass → different speeds</h4><div class="eq">½mv<sub>rms</sub>² = (3/2)k<sub>B</sub>T → v<sub>rms</sub> = √(3k<sub>B</sub>T/m)</div>' +
      '<div class="eq">He (4 u): v<sub>rms</sub> = <b>' + H.n(d.vHe, 'm/s') + '</b> &nbsp; Ar (40 u): v<sub>rms</sub> = <b>' + H.n(d.vAr, 'm/s') + '</b></div>' +
      '<div class="eq">Ratio = √(40/4) = √10 = ' + H.n(d.ratio) + ': the lighter atoms are faster, but each carries the same KE on average.</div>' +
      '<p class="note">Classic trap: “hotter means faster” is only true for the same gas. The curves on the right have different shapes, but the same T.</p>';
    if (mode === 'wall') return '<h4>1 · Each hit reverses the molecule’s momentum</h4><div class="eq">Δp = mv − (−mv) = 2mv<sub>x</sub> = 2(' + H.n(d.m, 'kg') + ')(' + H.iv('vx') + ') = <b>' + H.n(d.dp, 'kg·m/s') + '</b></div>' +
      '<h4>2 · Time between hits on the same wall: there and back</h4><div class="eq">Δt = 2L/v<sub>x</sub> = 2(' + H.iv('L') + ')/' + H.iv('vx') + ' = ' + H.n(d.dt, 's') + '</div>' +
      '<h4>3 · Average force = momentum change per time</h4><div class="eq">F = Δp/Δt = 2mv<sub>x</sub> ÷ (2L/v<sub>x</sub>) = mv<sub>x</sub>²/L = <b>' + H.n(d.F, 'N') + '</b></div>' +
      '<h4>4 · Many molecules, three directions</h4><div class="eq">On average v<sub>x</sub>² = v²/3. With N molecules in volume V = L³: P = F/L² = Nmv²/(3V) = <b>⅓ρv²</b></div>' +
      '<p class="note">Double the speed: twice the momentum per hit <i>and</i> twice as many hits → 4× the force. That’s why P ∝ v² ∝ T.</p>';
    const g = opt.gas || 'N2';
    return '<h4>1 · Temperature measures the average kinetic energy</h4><div class="eq">KE<sub>avg</sub> = (3/2)k<sub>B</sub>T = 1.5 × 1.38×10⁻²³ × ' + H.iv('T') + ' = <b>' + H.n(d.KE, 'J') + '</b></div>' +
      '<h4>2 · rms speed of ' + g.replace('2', '₂') + ' (' + d.M + ' u = ' + fnum(d.m) + ' kg)</h4><div class="eq">v<sub>rms</sub> = √(3k<sub>B</sub>T/m) = <b>' + H.n(d.vrms, 'm/s') + '</b></div>' +
      '<h4>3 · Pressure from the ideal gas law</h4><div class="eq">P = nRT/V = (' + H.iv('n') + ')(8.31)(' + H.iv('T') + ') / (' + H.n(v.V / 1000, 'm³') + ') = <b>' + H.n(d.P, 'Pa') + '</b></div>' +
      '<h4>4 · <span style="color:#7a3fb0">IB</span> Same pressure from the molecules: P = ⅓ρv<sub>rms</sub>²</h4><div class="eq">ρ = nM/V = ' + H.n(d.rho, 'kg/m³') + ' → ⅓ρv² = ⅓(' + fnum(d.rho) + ')(' + fnum(d.vrms) + ')² = ' + H.n(d.Pk, 'Pa') + ' ✓</div>' +
      '<h4>5 · Internal energy (ideal monatomic gas)</h4><div class="eq">U = (3/2)nRT = ' + H.n(d.U, 'J') + '. No potential energy: ideal-gas molecules only interact when they collide.</div>' +
      '<p class="note">The speeds are spread out (Maxwell–Boltzmann). Raising T moves the peak right and flattens the curve; the area stays 1.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    const bx0 = 14, by0 = 34, bh = 236;
    if (mode === 'wall'){
      panelTitle('ONE MOLECULE BOUNCING IN A BOX (only x-motion)', 10, 18);
      const bw = 140 + 600 * v.L; if (A.x === undefined || A.reset){ A.x = bx0 + 20; A.dir = 1; A.hits = []; A.tt = 0; }
      A.tt += dt; const spd = 0.4 * v.vx; A.x += A.dir * spd * dt;
      if (A.x > bx0 + bw - 8){ A.x = bx0 + bw - 8; A.dir = -1; A.hits.push(A.tt); } if (A.x < bx0 + 8){ A.x = bx0 + 8; A.dir = 1; }
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5; ctx.strokeRect(bx0, by0 + 60, bw, 100); ctx.fillStyle = '#ff6a2b'; ctx.fillRect(bx0 + bw - 4, by0 + 60, 6, 100);
      ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(A.x, by0 + 110, 8, 0, 7); ctx.fill();
      arrow(A.x, by0 + 140, A.x + A.dir * 50, by0 + 140, COL.V, 'v', { w: 2.5, head: 7 });
      text('L', bx0 + bw / 2, by0 + 185, { align: 'center', font: '700 13px "Space Grotesk",sans-serif' });
      text('Δp = 2mv each hit · Δt = 2L/v between hits', 12, 300, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      panelTitle('FORCE ON THE RIGHT WALL vs TIME', 395, 18);
      const gx = 400, gy = 200, gw = 185; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, 60); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      const win = 6; A.hits = A.hits.filter(h => A.tt - h < win);
      A.hits.forEach(h => { const x = gx + gw * (1 - (A.tt - h) / win); ctx.fillStyle = '#c43a00'; ctx.fillRect(x - 4, gy - 120, 8, 120); });
      const interval = 2 * (bw - 16) / spd, avgY = Math.min(130, 120 * 8 / (gw * interval / win)); ctx.setLineDash([5, 4]); ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx, gy - avgY); ctx.lineTo(gx + gw, gy - avgY); ctx.stroke(); ctx.setLineDash([]);
      text('spikes = hits · dashed = average force', gx, gy + 18, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text('F = mv²/L', gx, 250, { font: '700 15px "Space Grotesk",sans-serif' });
      return;
    }
    const gases = mode === 'mix' ? [['He', 4, '#1546d6'], ['Ar', 40, '#c43a00']] : [[opt.gas || 'N2', d.M, '#1546d6']];
    const bw = mode === 'mix' ? 340 : 120 + 8.6 * v.V, Nd = mode === 'mix' ? 36 : Math.round(16 + 12 * v.n);
    const key = mode + Nd + gases.map(g => g[0]).join();
    if (!A.p || A.key !== key){ A.key = key; A.p = []; let k = 0; gases.forEach(([nm, M, col], gi) => { for (let i = 0; i < Nd / gases.length; i++, k++){ A.p.push({ x: bx0 + 10 + rnd(k * 3 + 1) * (bw - 20), y: by0 + 10 + rnd(k * 3 + 2) * (bh - 20), g: [gauss(k * 5), gauss(k * 5 + 1)], M, col }); } }); A.hits = 0; A.tt = 0; }
    panelTitle(mode === 'mix' ? 'HELIUM (blue) AND ARGON (red) AT THE SAME T' : 'GAS IN A BOX', 10, 18);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5; ctx.strokeRect(bx0, by0, bw, bh);
    A.tt += dt;
    A.p.forEach(p => { const s = Math.sqrt(KB * v.T / (p.M * U_KG)) * 0.11; p.x += p.g[0] * s * dt; p.y += p.g[1] * s * dt;
      if (p.x < bx0 + 5){ p.x = bx0 + 5; p.g[0] = Math.abs(p.g[0]); } if (p.x > bx0 + bw - 5){ p.x = bx0 + bw - 5; p.g[0] = -Math.abs(p.g[0]); A.hits++; }
      if (p.y < by0 + 5){ p.y = by0 + 5; p.g[1] = Math.abs(p.g[1]); } if (p.y > by0 + bh - 5){ p.y = by0 + bh - 5; p.g[1] = -Math.abs(p.g[1]); }
      ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.M > 30 ? 5.5 : 4, 0, 7); ctx.fill(); });
    if (mode === 'one') text('P = ' + fplain(d.P / 1000) + ' kPa · T = ' + v.T + ' K', 12, 300, { font: '700 14px "Space Grotesk",sans-serif' });
    else text('same KE: ' + fplain(d.KE) + ' J each', 12, 300, { font: '700 14px "Space Grotesk",sans-serif' });
    // Maxwell–Boltzmann on the right
    panelTitle('SPEED DISTRIBUTION', 395, 18);
    const gx = 400, gy = 260, gw = 185, gh = 190, vmax = 3000; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    const fmaxRef = mb(Math.sqrt(2 * KB * 300 / (40 * U_KG)), 40, 300) * 1.05;
    gases.forEach(([nm, M, col]) => { ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 120; i++){ const vv = vmax * i / 120, y = gy - gh * Math.min(1.1, mb(vv, M, v.T) / fmaxRef); i ? ctx.lineTo(gx + gw * i / 120, y) : ctx.moveTo(gx, y); } ctx.stroke();
      const vr = Math.sqrt(3 * KB * v.T / (M * U_KG)); if (vr < vmax){ ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(gx + gw * vr / vmax, gy); ctx.lineTo(gx + gw * vr / vmax, gy - gh); ctx.stroke(); ctx.setLineDash([]); text('v_rms', gx + gw * vr / vmax + 3, gy - gh + 12 + (M > 30 ? 0 : 14), { font: '600 9px "IBM Plex Mono",monospace', col }); } });
    [0, 1000, 2000, 3000].forEach(s => text(String(s), gx + gw * s / vmax, gy + 13, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }));
    text('speed (m/s)', gx + gw, gy + 26, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('fraction of molecules', gx + 4, gy - gh - 4, { font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
