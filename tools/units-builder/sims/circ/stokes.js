// Terminal Velocity (IB): a sphere falling through a viscous liquid. Weight = buoyancy + Stokes drag 6πηrv at terminal speed.
const SIM = {
  title: 'Terminal Velocity',
  hint: 'IB SL A.2: Stokes’ law',
  ivs(){ return [
    { id: 'r', sym: 'r', symText: 'r', label: 'Sphere radius', unit: 'mm', min: 0.5, max: 5, step: 0.1, val: 2, graph: true },
    { id: 'rs', sym: 'ρ<sub>s</sub>', symText: 'ρ_s', label: 'Sphere density', unit: 'kg/m³', min: 1500, max: 8000, step: 50, val: 7800, show: x => x.toFixed(0) + ' kg/m³' },
    { id: 'rf', sym: 'ρ<sub>f</sub>', symText: 'ρ_f', label: 'Liquid density', unit: 'kg/m³', min: 800, max: 1400, step: 10, val: 1260, show: x => x.toFixed(0) + ' kg/m³' },
    { id: 'eta', sym: 'η', symText: 'η', label: 'Viscosity', unit: 'Pa·s', min: 0.1, max: 5, step: 0.05, val: 1.5 }]; },
  presets: [{ label: 'Steel in glycerin', v: { rs: 7800, rf: 1260, eta: 1.5 } }, { label: 'Glass in honey', v: { rs: 2500, rf: 1400, eta: 5 } }],
  calc(v){
    const r = v.r / 1000, Vs = 4 / 3 * PI * r ** 3, m = v.rs * Vs, W = m * G10, Fb = v.rf * Vs * G10, vt = 2 * r * r * (v.rs - v.rf) * G10 / (9 * v.eta), Fd = 6 * PI * v.eta * r * vt, tau = m / (6 * PI * v.eta * r);
    return { r, Vs, m, W, Fb, vt, Fd, tau, vmm: vt * 1000 };
  },
  dvs(){ return [
    { id: 'vt', name: 'Terminal velocity', short: 'v_t', sym: 'v<sub>t</sub>', unit: 'm/s', f: d => d.vt },
    { id: 'Fd', name: 'Drag at terminal velocity', short: 'F_d', sym: 'F<sub>d</sub>', unit: 'N', f: d => d.Fd }]; },
  work(v, d){
    return '<h4>1 · Three forces on the falling sphere</h4><div class="eq">Weight mg = ρ<sub>s</sub>(4/3πr³)g = ' + H.n(d.W, 'N') + ' down; buoyancy ρ<sub>f</sub>(4/3πr³)g = ' + H.n(d.Fb, 'N') + ' up; drag F<sub>d</sub> = 6πηrv up (Stokes’ law), growing with v</div>' +
      '<h4>2 · Terminal velocity: forces balance</h4><div class="eq">mg = F<sub>b</sub> + 6πηrv<sub>t</sub> → v<sub>t</sub> = 2r²(ρ<sub>s</sub> − ρ<sub>f</sub>)g / (9η)</div>' +
      '<div class="eq">= 2(' + H.n(d.r, 'm') + ')²(' + H.iv('rs') + ' − ' + H.iv('rf') + ')(10) / (9 × ' + H.iv('eta') + ') = <b>' + H.n(d.vt, 'm/s') + '</b> (' + H.n(d.vmm, 'mm/s') + ')</div>' +
      '<h4>3 · Functional dependence</h4><div class="eq">v<sub>t</sub> ∝ r²: double the radius → 4× the terminal velocity. Weight grows as r³, drag only as r.</div>' +
      '<p class="note">Lab: time spheres of different radii falling through glycerin; a graph of v<sub>t</sub> against r² is a straight line whose slope gives η.</p>' +
      '<p class="note">Stokes’ law only works for slow, smooth flow (small spheres, thick liquids).</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset){ A.t = 0; A.v = 0; A.y = 0; A.hist = []; }
    const T = Math.max(6 * d.tau, 0.5); A.t += dt * (T / 4);
    if (A.t > T * 1.3){ A.t = 0; A.v = 0; A.y = 0; A.hist = []; }
    if (A.t <= T){ A.v = d.vt * (1 - Math.exp(-A.t / d.tau)); A.hist.push([A.t, A.v]); }
    panelTitle('SPHERE FALLING THROUGH A LIQUID', 10, 18);
    ctx.fillStyle = '#f3e2a6'; ctx.fillRect(120, 30, 140, 270); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(120, 30, 140, 270);
    const frac = Math.min(1, A.t / T), y = 50 + frac * 200, rp = 6 + v.r * 3;
    ctx.fillStyle = '#7a7f8a'; ctx.beginPath(); ctx.arc(190, y, rp, 0, 7); ctx.fill();
    const sc = 70 / d.W, Fd = 6 * PI * v.eta * d.r * A.v;
    arrow(190 + rp + 22, y, 190 + rp + 22, y + d.W * sc, COL.W, 'mg', { lx: 5, ly: 0 });
    arrow(190 - rp - 22, y, 190 - rp - 22, y - d.Fb * sc, COL.N, 'F_b', { lx: -5, ly: 0, align: 'right' });
    if (Fd * sc > 2) arrow(190 - rp - 50, y, 190 - rp - 50, y - Fd * sc, COL.F, 'F_d', { lx: -5, ly: 0, align: 'right' });
    text('v_t = ' + fplain(d.vmm) + ' mm/s', 12, 318, { font: '700 12px "Space Grotesk",sans-serif' });
    panelTitle('v vs t (levels off at v_t)', 395, 18);
    const gx = 420, gy0 = 250, gw = 165, gh = 190, Xg = q => gx + gw * q / T, Yg = q => gy0 - gh * q / (d.vt * 1.15);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#1e7d45'; ctx.beginPath(); ctx.moveTo(gx, Yg(d.vt)); ctx.lineTo(gx + gw, Yg(d.vt)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = COL.V; ctx.lineWidth = 2.5; ctx.beginPath(); A.hist.forEach(([q, w], i) => i ? ctx.lineTo(Xg(q), Yg(w)) : ctx.moveTo(Xg(q), Yg(w))); ctx.stroke();
    text('t → ' + fplain(T) + ' s (slowed)', gx + gw, gy0 + 13, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
