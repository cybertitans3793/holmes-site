// Nuclear Reactor (IB E.4): the parts of a fission power station: fuel rods, moderator, control rods, coolant, heat exchanger, turbine, generator and shielding; the multiplication factor k and the energy chain.
const SIM = {
  title: 'Nuclear Reactor',
  hint: 'k = neutrons from one fission that cause another fission · k = 1 → steady power',
  modes: [{ id: 'plant', label: 'Power station' }],
  opts: [{ id: 'mod', label: 'Moderator', choices: [['on', 'Water in the core'], ['off', 'Moderator lost']] }],
  ivs(){ return [
    { id: 'rod', sym: 'rods', symText: 'rods', label: 'Control rods pushed in', unit: '%', min: 0, max: 100, step: 1, val: 40, graph: true },
    { id: 'enr', sym: 'U-235', symText: 'U235', label: 'Uranium-235 in the fuel (enrichment)', unit: '%', min: 0.7, max: 5, step: 0.1, val: 3 }]; },
  presets: [{ label: 'Steady power', mode: 'plant', v: { rod: 40, enr: 3 } }, { label: 'SCRAM (rods all in)', mode: 'plant', v: { rod: 100 } }, { label: 'Natural uranium', mode: 'plant', v: { enr: 0.7 } }],
  calc(v, mode, opt){
    const mod = (opt.mod || 'on') === 'on', base = 0.72 + 0.17 * Math.log(1 + v.enr) / Math.log(4), k = base * (mod ? 1.3065 : 0.4) * (1 - 0.35 * v.rod / 100);
    const kk = Math.round(k * 1000) / 1000, trend = kk > 1.005 ? 'rising' : kk < 0.995 ? 'falling' : 'steady';
    return { mod, k: kk, trend };
  },
  dvs(){ return [{ id: 'k', name: 'Multiplication factor k', short: 'k', sym: 'k', unit: '', f: d => d.k }]; },
  work(v, d){
    return '<h4>1 · Fuel rods</h4><p class="st">Uranium enriched to ' + H.iv('enr') + ' U-235. Each fission releases about 200 MeV and 2–3 fast neutrons.</p>' + TEX`E_{\text{fission}} \approx 200\,\text{MeV}` +
      '<h4>2 · Moderator</h4><p class="st">' + (d.mod ? 'Water slows the fast neutrons down (by collisions) so U-235 can capture them and fission.' : 'With no moderator the neutrons stay fast and U-235 rarely captures them: the chain reaction dies. Water-moderated reactors shut themselves down if they lose their water.') + '</p>' +
      '<h4>3 · Control rods</h4><p class="st">Boron or cadmium rods <b>absorb neutrons</b>. The multiplication factor:</p>' + TEXA`k = ${M.n(d.k)}` +
      '<p class="st">Power is <b>' + d.trend + '</b>. ' + (d.trend === 'steady' ? 'Each fission causes exactly one more on average (critical).' : d.trend === 'rising' ? 'Push the rods in a little to bring k back to 1.' : 'Pull the rods out a little to bring k back to 1.') + '</p>' +
      '<h4>4 · Getting the energy out</h4><p class="st">Coolant carries thermal energy to the <b>heat exchanger</b>, which boils water into steam. Steam spins the <b>turbine</b>; the <b>generator</b> turns kinetic energy into electrical energy. Steam is condensed and pumped back.</p>' +
      '<p class="note">Shielding: thick steel and concrete absorb neutrons and gamma rays. Nuclear → thermal → kinetic → electrical; overall about 33% efficient.</p>';
  },
  draw(v, d, mode, opt, t){
    const F = '"Space Grotesk",sans-serif', Mo = '"IBM Plex Mono",monospace', T = t || 0;
    panelTitle('FISSION POWER STATION', 10, 18);
    // shielding + vessel
    ctx.fillStyle = '#cfcac0'; ctx.fillRect(14, 50, 150, 240); ctx.fillStyle = '#f7f6f2'; ctx.fillRect(30, 66, 118, 208);
    text('shielding (concrete)', 89, 304, { align: 'center', font: '600 9px ' + F, col: '#4a4a4a' });
    if (d.mod){ ctx.fillStyle = 'rgba(80,150,230,0.25)'; ctx.fillRect(30, 96, 118, 178); }
    for (let i = 0; i < 4; i++){ ctx.fillStyle = '#2d6b3c'; ctx.fillRect(42 + i * 28, 120, 10, 140); }
    const rd = 120 + 140 * v.rod / 100 - 140; for (let i = 0; i < 3; i++){ ctx.fillStyle = '#111'; ctx.fillRect(58 + i * 28, Math.max(56, rd), 6, 140 - Math.max(0, 56 - rd)); }
    // neutrons
    const glow = Math.max(0, Math.min(1, (d.k - 0.6) / 0.5));
    for (let i = 0; i < 14; i++){ const a = i * 2.4 + T * (d.mod ? 1.2 : 3), x = 89 + Math.cos(a * 1.3) * 48, y = 190 + Math.sin(a) * 60; if (i / 14 > glow) continue; ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 7); ctx.fill(); }
    text('fuel rods', 50, 116, { font: '600 9px ' + F, col: '#2d6b3c' }); text('control rods', 89, 46, { align: 'center', font: '600 9px ' + F });
    if (d.mod) text('moderator (water)', 89, 268, { align: 'center', font: '600 9px ' + F, col: '#1546d6' });
    // coolant loop to heat exchanger
    const hx = 190, flow = (T * 40) % 20;
    ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.lineDashOffset = -flow; ctx.beginPath(); ctx.moveTo(148, 110); ctx.lineTo(hx + 10, 110); ctx.lineTo(hx + 10, 230); ctx.lineTo(148, 230); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    text('coolant', 170, 104, { align: 'center', font: '600 9px ' + F, col: '#c43a00' });
    ctx.fillStyle = '#e6e2d8'; ctx.fillRect(hx, 90, 50, 160); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(hx, 90, 50, 160);
    text('heat', hx + 25, 160, { align: 'center', font: '700 9px ' + F }); text('exchanger', hx + 25, 172, { align: 'center', font: '700 9px ' + F });
    // steam to turbine
    ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -flow; ctx.beginPath(); ctx.moveTo(hx + 50, 100); ctx.lineTo(300, 100); ctx.lineTo(300, 130); ctx.stroke(); ctx.beginPath(); ctx.moveTo(300, 200); ctx.lineTo(300, 240); ctx.lineTo(hx + 50, 240); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    text('steam', 270, 94, { align: 'center', font: '600 9px ' + F, col: '#4a4a4a' }); text('water back', 270, 254, { align: 'center', font: '600 9px ' + F, col: '#4a4a4a' });
    const spin = d.trend === 'falling' && d.k < 0.9 ? 0 : T * 6; ctx.save(); ctx.translate(300, 165); ctx.rotate(spin); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++){ ctx.rotate(PI / 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(26, 6); ctx.stroke(); } ctx.restore();
    ctx.beginPath(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.arc(300, 165, 32, 0, 7); ctx.stroke(); text('turbine', 300, 210, { align: 'center', font: '700 9px ' + F });
    ctx.fillStyle = '#1e7d45'; ctx.fillRect(340, 150, 40, 30); text('gen', 360, 169, { align: 'center', font: '700 10px ' + F, col: '#fff' }); ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(332, 165); ctx.lineTo(340, 165); ctx.stroke();
    text('⚡', 360, 140, { align: 'center', font: '700 16px ' + F, col: '#ff6a2b' });
    panelTitle('THE CORE', 395, 18);
    [['moderator', d.mod ? 'water' : 'lost'], ['control rods in', v.rod + '%'], ['U-235', v.enr + '%'], ['k', fplain(d.k)], ['power', d.trend]].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px ' + F, col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px ' + Mo }); });
    text(d.trend === 'steady' ? 'critical: k = 1' : d.trend === 'rising' ? 'supercritical: k > 1' : 'subcritical: k < 1', 400, 200, { font: '700 12px ' + F, col: d.trend === 'steady' ? '#1e7d45' : '#c43a00' });
  }
};
