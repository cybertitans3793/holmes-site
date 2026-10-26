// [IB] Luminosity & Brightness (IB B.1 radiation, used for stars in E.5): L = σAT⁴, b = L/4πd², λmax T = 2.9×10⁻³ m·K. Forward (star → what we see) and backward (what we measure → the star).
const SIG = 5.67e-8, RSUN = 6.96e8, LSUN = 3.83e26, LY = 9.46e15, WIEN = 2.9e-3;
function starCol(T){ const x = Math.max(0, Math.min(1, (T - 2500) / 12500)); return 'rgb(' + Math.round(255 - 90 * x) + ',' + Math.round(140 + 90 * Math.min(1, x * 1.5)) + ',' + Math.round(80 + 175 * x) + ')'; }
function planck(l, T){ return 1 / (Math.pow(l, 5) * (Math.exp(0.0144 / (l * T)) - 1)); }
const SIM = {
  title: 'Luminosity & Brightness',
  hint: 'R☉ = 6.96×10⁸ m · L☉ = 3.83×10²⁶ W · 1 ly = 9.46×10¹⁵ m',
  modes: [{ id: 'fwd', label: 'Star → what we see' }, { id: 'back', label: 'What we measure → the star' }],
  ivs(mode){
    if (mode === 'back') return [
      { id: 'lam', sym: 'λ<sub>max</sub>', symText: 'lmax', label: 'Measured peak wavelength', unit: 'nm', min: 100, max: 1200, step: 5, val: 500 },
      { id: 'bexp', sym: 'b', symText: 'b', label: 'Measured apparent brightness', unit: 'W/m²', min: -12, max: -7, step: 0.1, val: -9, show: x => '10^' + x.toFixed(1) + ' W/m²' },
      { id: 'd', sym: 'd', symText: 'd', label: 'Distance (from parallax)', unit: 'ly', min: 1, max: 1000, step: 1, val: 50, graph: true }];
    return [
      { id: 'R', sym: 'R', symText: 'R', label: 'Radius', unit: 'R☉', min: 0.1, max: 100, step: 0.1, val: 1 },
      { id: 'T', sym: 'T', symText: 'T', label: 'Surface temperature', unit: 'K', min: 2500, max: 30000, step: 100, val: 5800, graph: true },
      { id: 'd', sym: 'd', symText: 'd', label: 'Distance from us', unit: 'ly', min: 1, max: 1000, step: 1, val: 10 }];
  },
  presets: [{ label: 'The Sun', mode: 'fwd', v: { R: 1, T: 5800 } }, { label: 'Red giant', mode: 'fwd', v: { R: 50, T: 3500 } }, { label: 'Double the distance', mode: 'fwd', v: { d: 20 } }],
  calc(v, mode){
    if (mode === 'back'){ const T = WIEN / (v.lam * 1e-9), b = Math.pow(10, v.bexp), dm = v.d * LY, L = 4 * PI * dm * dm * b, R = Math.sqrt(L / (4 * PI * SIG * Math.pow(T, 4))); return { T, b, L, R, Rs: R / RSUN, Ls: L / LSUN, lam: v.lam }; }
    const R = v.R * RSUN, A = 4 * PI * R * R, L = SIG * A * Math.pow(v.T, 4), dm = v.d * LY, b = L / (4 * PI * dm * dm), lam = WIEN / v.T * 1e9;
    return { R, A, L, Ls: L / LSUN, b, lam, T: v.T };
  },
  dvs(mode){
    if (mode === 'back') return [{ id: 'Ls', name: 'Luminosity', short: 'L', sym: 'L', unit: 'L☉', f: d => d.Ls }, { id: 'Rs', name: 'Radius', short: 'R', sym: 'R', unit: 'R☉', f: d => d.Rs }, { id: 'T', name: 'Surface temperature', short: 'T', sym: 'T', unit: 'K', f: d => d.T }];
    return [{ id: 'Ls', name: 'Luminosity', short: 'L', sym: 'L', unit: 'L☉', f: d => d.Ls }, { id: 'b', name: 'Apparent brightness', short: 'b', sym: 'b', unit: 'W/m²', f: d => d.b }, { id: 'lam', name: 'Peak wavelength', short: 'λmax', sym: 'λ<sub>max</sub>', unit: 'nm', f: d => d.lam }];
  },
  work(v, d, mode){
    if (mode === 'back') return '<h4>1 · Wien: temperature from the peak wavelength</h4><div class="eq">T = 2.9×10⁻³/λ<sub>max</sub> = 2.9×10⁻³/(' + v.lam + '×10⁻⁹) = <b>' + H.n(d.T, 'K') + '</b></div>' +
      '<h4>2 · Luminosity from brightness and distance: L = 4πd²b</h4><div class="eq">d = ' + H.iv('d') + ' = ' + H.n(v.d * LY, 'm') + ' → L = 4π(' + fnum(v.d * LY) + ')²(' + fnum(d.b) + ') = <b>' + H.n(d.L, 'W') + '</b> = ' + H.n(d.Ls, 'L☉') + '</div>' +
      '<h4>3 · Radius from Stefan–Boltzmann: L = σ4πR²T⁴</h4><div class="eq">R = √(L/(4πσT⁴)) = <b>' + H.n(d.R, 'm') + '</b> = ' + H.n(d.Rs, 'R☉') + '</div>' +
      '<p class="note">This is the classic Paper 2 chain: λ<sub>max</sub> → T, then b and d → L, then L and T → R. Convert ly to m and nm to m first.</p>';
    return '<h4>1 · Luminosity: total power radiated, L = σAT⁴ with A = 4πR²</h4><div class="eq">R = ' + H.iv('R') + ' = ' + H.n(d.R, 'm') + ' → L = (5.67×10⁻⁸)(4π)(' + fnum(d.R) + ')²(' + H.iv('T') + ')⁴ = <b>' + H.n(d.L, 'W') + '</b> = ' + H.n(d.Ls, 'L☉') + '</div>' +
      '<h4>2 · Apparent brightness: spread over a sphere of radius d</h4><div class="eq">b = L/(4πd²) = ' + fnum(d.L) + '/(4π(' + fnum(v.d * LY) + ' m)²) = <b>' + H.n(d.b, 'W/m²') + '</b></div>' +
      '<h4>3 · Color: Wien’s law</h4><div class="eq">λ<sub>max</sub> = 2.9×10⁻³/T = <b>' + H.n(d.lam, 'nm') + '</b>' + (d.lam < 400 ? ' (ultraviolet: looks blue-white)' : d.lam > 700 ? ' (infrared: looks red)' : ' (visible)') + '</div>' +
      '<p class="note">Double T → 16× L (T⁴). Double R → 4× L. Double d → ¼ b. A dim-looking star can be very luminous if it’s far away.</p>';
  },
  draw(v, d, mode){
    const T = d.T, Rpx = mode === 'back' ? Math.min(70, 12 + 14 * Math.log10(1 + d.Rs)) : Math.min(70, 12 + 14 * Math.log10(1 + v.R));
    panelTitle(mode === 'back' ? 'THE STAR WE WORKED OUT' : 'THE STAR AND US', 10, 18);
    ctx.fillStyle = '#0b1020'; ctx.fillRect(10, 30, 375, 270);
    const g = ctx.createRadialGradient(90, 165, 0, 90, 165, Rpx * 1.8); g.addColorStop(0, '#fff'); g.addColorStop(0.45, starCol(T)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(90, 165, Rpx * 1.8, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; [1, 2, 3].forEach(k => { ctx.beginPath(); ctx.arc(90, 165, 70 * k, -0.5, 0.5); ctx.stroke(); });
    ctx.fillStyle = '#9fd3ff'; ctx.beginPath(); ctx.arc(330, 165, 6, 0, 7); ctx.fill(); text('us', 330, 190, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#9fd3ff' });
    text('d = ' + v.d + ' ly', 210, 285, { align: 'center', font: '600 11px "IBM Plex Mono",monospace', col: '#fff' });
    text('L = ' + fplain(d.Ls) + ' L☉', 20, 52, { font: '700 13px "Space Grotesk",sans-serif', col: '#fff' }); text('b = ' + fplain(d.b) + ' W/m²', 20, 72, { font: '700 13px "Space Grotesk",sans-serif', col: '#fff' });
    panelTitle('SPECTRUM (peak = λmax)', 395, 18);
    const gx = 405, gy = 250, gw = 180, gh = 190, lmax = 2000e-9, pk = planck(WIEN / T, T);
    ctx.fillStyle = 'rgba(255,0,0,0.06)'; const vx1 = gx + gw * 380e-9 / lmax, vx2 = gx + gw * 750e-9 / lmax; const sp = ctx.createLinearGradient(vx1, 0, vx2, 0); ['#7a00ff', '#0040ff', '#00c0ff', '#00d000', '#ffe000', '#ff8000', '#ff0000'].forEach((c, i) => sp.addColorStop(i / 6, c)); ctx.globalAlpha = 0.25; ctx.fillStyle = sp; ctx.fillRect(vx1, gy - gh, vx2 - vx1, gh); ctx.globalAlpha = 1;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 1; i <= 120; i++){ const l = lmax * i / 120, y = gy - gh * planck(l, T) / pk; i > 1 ? ctx.lineTo(gx + gw * i / 120, y) : ctx.moveTo(gx + gw * i / 120, y); } ctx.stroke();
    const xl = gx + gw * Math.min(1, (d.lam || d.lam) * 1e-9 / lmax); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xl, gy); ctx.lineTo(xl, gy - gh); ctx.stroke(); ctx.setLineDash([]);
    text(fplain(d.lam || (WIEN / T * 1e9)) + ' nm', Math.min(xl + 3, gx + gw - 50), gy - gh + 12, { font: '700 10px "IBM Plex Mono",monospace', col: '#c43a00' });
    ['0', '1000', '2000'].forEach((s, i) => text(s, gx + gw * i / 2, gy + 13, { align: 'center', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' })); text('λ (nm)', gx + gw, gy + 26, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('T = ' + fplain(T) + ' K', 400, 300, { font: '700 14px "Space Grotesk",sans-serif' });
  }
};
