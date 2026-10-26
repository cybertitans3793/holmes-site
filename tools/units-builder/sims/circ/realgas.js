// [IB] Real vs Ideal Gas (IB B.3): when does PV = nRT work? Compression factor Z = PV/nRT for a van der Waals gas vs pressure and temperature.
const RG = 8.31, VDW = { N2: ['nitrogen', 0.137, 3.87e-5], CO2: ['carbon dioxide', 0.364, 4.27e-5], He: ['helium', 0.00346, 2.38e-5] };
function vm(P, T, a, b){ // molar volume (gas-like root) for pressure P (Pa)
  const f = V => RG * T / (V - b) - a / (V * V) - P; let hi = RG * T / P * 3 + b * 2, lo = b * 1.0001;
  // scan down from hi for the first sign change (largest root)
  let prev = hi, fp = f(hi); for (let i = 1; i <= 400; i++){ const V = hi * Math.pow(lo / hi, i / 400), fv = f(V); if (fp < 0 && fv >= 0 || fp >= 0 && fv < 0){ let x1 = V, x2 = prev; for (let k = 0; k < 60; k++){ const m = (x1 + x2) / 2; (f(m) < 0) === (f(x1) < 0) ? x1 = m : x2 = m; } return (x1 + x2) / 2; } prev = V; fp = fv; }
  return NaN; }
const SIM = {
  title: 'Real vs Ideal Gas',
  hint: 'Z = PV/(nRT) · Z = 1 means ideal',
  modes: [{ id: 'z', label: 'Z vs pressure' }, { id: 'iso', label: 'Isotherm: real vs ideal' }],
  opts: [{ id: 'gas', label: 'Gas', choices: [['N2', 'N₂'], ['CO2', 'CO₂'], ['He', 'He']] }],
  ivs(mode){ return [
    { id: 'T', sym: 'T', symText: 'T', label: 'Temperature', unit: 'K', min: 150, max: 800, step: 5, val: 300, graph: mode === 'z' ? false : true },
    { id: 'P', sym: 'P', symText: 'P', label: 'Pressure', unit: 'MPa', min: 0.1, max: 40, step: 0.1, val: 10, graph: mode === 'z' }]; },
  presets: [{ label: 'Everyday air', mode: 'z', v: { P: 0.1, T: 300 } }, { label: 'Scuba tank', mode: 'z', v: { P: 20, T: 290 } }, { label: 'Cold and squeezed', mode: 'z', v: { P: 8, T: 180 } }],
  calc(v, mode, opt){
    const [nm, a, b] = VDW[opt.gas || 'N2'], P = v.P * 1e6, V = vm(P, v.T, a, b), Z = P * V / (RG * v.T), Vid = RG * v.T / P;
    return { nm, a, b, V, Z, Vid, dev: 100 * (Z - 1), rho: 1 / V };
  },
  dvs(){ return [{ id: 'Z', name: 'Compression factor Z = PV/nRT', short: 'Z', sym: 'Z', unit: '', f: d => d.Z }, { id: 'dev', name: 'Error if you assume ideal', short: 'error', sym: 'error', unit: '%', f: d => d.dev }]; },
  work(v, d){
    const ok = Math.abs(d.dev) < 5;
    return '<h4>1 · Ideal gas model assumptions</h4><div class="eq">Molecules have <b>no volume</b> and <b>no forces</b> between them except in collisions. Then PV = nRT exactly and Z = 1.</div>' +
      '<h4>2 · Real ' + d.nm + ' at ' + H.iv('P') + ' and ' + H.iv('T') + '</h4><div class="eq">Molar volume V<sub>m</sub> = ' + H.n(d.V * 1000, 'L/mol') + ' (ideal would be ' + H.n(d.Vid * 1000, 'L/mol') + ')</div>' +
      '<div class="eq">Z = PV<sub>m</sub>/RT = <b>' + H.n(d.Z) + '</b> → assuming ideal is off by ' + H.n(d.dev, '%') + (ok ? ': ideal is a good model here.' : ': ideal is a poor model here.') + '</div>' +
      '<h4>3 · Why it goes wrong</h4><div class="eq"><b>Z &lt; 1:</b> molecules attract, so they hit the walls less hard (more noticeable when slow, at low T).<br><b>Z &gt; 1:</b> molecules take up space, which matters when they’re squeezed close (high P, high density).</div>' +
      '<p class="note">IB: an ideal gas is a good approximation at <b>low pressure, high temperature and low density</b>. Helium behaves best: tiny atoms, very weak attractions.</p>';
  },
  draw(v, d, mode, opt){
    const [nm, a, b] = VDW[opt.gas || 'N2'];
    if (mode === 'iso'){
      panelTitle('P–V ISOTHERM AT ' + v.T + ' K (1 mol)', 10, 18);
      const gx = 50, gy = 300, gw = 520, gh = 260, Vmin = 0.06e-3, Vmax = 1e-3, Pm = 40e6, X = V => gx + gw * (V - Vmin) / (Vmax - Vmin), Y = P => gy - gh * Math.min(1.05, P / Pm);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      const curve = (f, col, dash) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.setLineDash(dash); ctx.beginPath(); let on = false; for (let i = 0; i <= 200; i++){ const V = Vmin + (Vmax - Vmin) * i / 200, P = f(V); if (!(P > 0) || P > Pm * 1.05){ on = false; continue; } on ? ctx.lineTo(X(V), Y(P)) : ctx.moveTo(X(V), Y(P)); on = true; } ctx.stroke(); ctx.setLineDash([]); };
      curve(V => RG * v.T / V, '#4a4a4a', [6, 4]); curve(V => RG * v.T / (V - b) - a / (V * V), '#c43a00', []);
      text('ideal (dashed)', gx + gw - 4, 60, { align: 'right', font: '700 12px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('real ' + nm, gx + gw - 4, 80, { align: 'right', font: '700 12px "IBM Plex Mono",monospace', col: '#c43a00' });
      text('V (L)', gx + gw, gy + 16, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('P (MPa)', gx + 4, gy - gh - 6, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      [0.2, 0.4, 0.6, 0.8, 1.0].forEach(L => text(String(L), X(L / 1000), gy + 13, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' })); [10, 20, 30, 40].forEach(p => text(String(p), gx - 4, Y(p * 1e6) + 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }));
      text('the curves match at large V (low density)', gx + gw / 2, gy - 20, { align: 'center', font: '600 11px "IBM Plex Mono",monospace', col: '#1e7d45' });
      return;
    }
    panelTitle('Z = PV/nRT vs PRESSURE', 10, 18);
    const gx = 50, gy = 300, gw = 520, gh = 260, Pm = 40, Zmin = 0.4, Zmax = 1.6, X = P => gx + gw * P / Pm, Y = Z => gy - gh * (Z - Zmin) / (Zmax - Zmin);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    ctx.setLineDash([6, 4]); ctx.strokeStyle = '#4a4a4a'; ctx.beginPath(); ctx.moveTo(gx, Y(1)); ctx.lineTo(gx + gw, Y(1)); ctx.stroke(); ctx.setLineDash([]); text('ideal: Z = 1', gx + gw - 4, Y(1) - 6, { align: 'right', font: '700 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    [[v.T, '#c43a00', 3], [v.T * 2 > 800 ? null : v.T * 2, '#ff9a6b', 1.8], [v.T / 2 < 150 ? null : v.T / 2, '#7a3fb0', 1.8]].forEach(([TT, col, w]) => { if (!TT) return; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); let on = false; for (let i = 1; i <= 160; i++){ const P = Pm * i / 160, V = vm(P * 1e6, TT, a, b), Z = P * 1e6 * V / (RG * TT); if (!isFinite(Z)){ on = false; continue; } const y = Math.max(gy - gh, Math.min(gy, Y(Z))); on ? ctx.lineTo(X(P), y) : ctx.moveTo(X(P), y); on = true; } ctx.stroke(); text(TT + ' K', X(Pm) - 4, Math.max(gy - gh + 10, Math.min(gy - 4, Y(Pm * 1e6 * vm(Pm * 1e6, TT, a, b) / (RG * TT)) - 6)), { align: 'right', font: '700 10px "IBM Plex Mono",monospace', col }); });
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(v.P), Math.max(gy - gh, Math.min(gy, Y(d.Z))), 6, 0, 7); ctx.fill();
    [0, 10, 20, 30, 40].forEach(p => text(String(p), X(p), gy + 13, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' })); [0.6, 1, 1.4].forEach(z => text(String(z), gx - 4, Y(z) + 3, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }));
    text('P (MPa) · 1 atm ≈ 0.1 MPa', gx + gw, gy + 26, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text(nm + ': Z = ' + fplain(d.Z), gx + 10, gy - gh + 14, { font: '700 14px "Space Grotesk",sans-serif' });
  }
};
