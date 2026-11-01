// Earth's-field compass lab (03-10): a north–south wire under a compass. B_wire = μ₀I/(2πr) points east or west; the needle turns until tan θ = B_wire/B_E. Graph tan θ against I; the slope gives B_E. Original.
const MU = 4 * Math.PI * 1e-7, BE = 2.0e-5;
const SIM = {
  title: 'Earth’s Field Compass Lab',
  hint: 'B = μ₀I/(2πr) · tan θ = B_wire/B_Earth · μ₀ = 4π × 10⁻⁷ T·m/A',
  modes: [{ id: 'lab', label: 'Compass over a wire' }],
  opts: [{ id: 'dir', label: 'Current flows', choices: [['n', 'North'], ['s', 'South']] }],
  ivs(){ return [
    { id: 'I', sym: 'I', symText: 'I', label: 'Current in the wire', unit: 'A', min: 0, max: 5, step: 0.25, val: 2, graph: true },
    { id: 'r', sym: 'r', symText: 'r', label: 'Distance from wire to compass needle', unit: 'cm', min: 1, max: 6, step: 0.5, val: 2 }]; },
  presets: [{ label: 'No current', v: { I: 0 } }, { label: 'Closer to the wire', v: { r: 1 } }],
  calc(v, mode, opt){ const Bw = MU * v.I / (2 * PI * v.r / 100), th = Math.atan(Bw / BE) / DEG, east = (opt.dir || 'n') === 'n'; return { Bw, th, tan: Bw / BE, east, slope: MU / (2 * PI * v.r / 100 * BE) }; },
  dvs(){ return [{ id: 'tan', name: 'tan θ', short: 'tan θ', sym: 'tan θ', unit: '', f: d => d.tan }, { id: 'th', name: 'Needle angle θ from north', short: 'θ', sym: 'θ', unit: '°', f: d => d.th }, { id: 'Bw', name: 'Field of the wire at the needle', short: 'B_wire', sym: 'B<sub>wire</sub>', unit: 'T', f: d => d.Bw }]; },
  work(v, d){
    return '<h4>1 · Field of the wire at the needle</h4><div class="eq">B<sub>wire</sub> = μ₀I/(2πr) = (4π × 10⁻⁷)(' + H.iv('I') + ')/(2π × ' + fnum(v.r / 100) + ' m) = <b>' + H.n(d.Bw, 'T') + '</b>, pointing <b>' + (d.east ? 'east' : 'west') + '</b> (right-hand rule: current ' + (d.east ? 'north' : 'south') + ', compass above the wire)</div>' +
      '<h4>2 · The needle points along the total field</h4><div class="eq">Earth’s field points north (horizontal part ≈ 2.0 × 10⁻⁵ T). The two fields are at right angles:<br>tan θ = B<sub>wire</sub>/B<sub>Earth</sub> = <b>' + H.n(d.tan) + '</b> → θ = <b>' + H.n(d.th, '°') + '</b> ' + (v.I ? (d.east ? 'east of north' : 'west of north') : '') + '</div>' +
      '<h4>3 · The lab: graph tan θ against I</h4><div class="eq">tan θ = [μ₀/(2πr B<sub>Earth</sub>)] · I → a straight line through zero.<br>Slope = μ₀/(2πr B<sub>Earth</sub>) = ' + H.n(d.slope, '/A') + ' → B<sub>Earth</sub> = μ₀/(2πr · slope)</div>' +
      '<p class="note">Line the wire up north–south first, so with no current it lies right under the needle. Keep the current small: big angles are hard to read, and tan θ grows quickly near 90°.</p>';
  },
  draw(v, d, mode, opt, t){
    panelTitle('TOP VIEW: COMPASS ON TOP OF A WIRE', 10, 18);
    const cx = 200, cy = 170, R = 110;
    ctx.strokeStyle = '#b0b0b0'; ctx.lineWidth = 6; ctx.setLineDash([10, 6]); ctx.beginPath(); ctx.moveTo(cx, 30); ctx.lineTo(cx, 312); ctx.stroke(); ctx.setLineDash([]);
    text('wire (under the compass)', cx + 8, 312, { font: '600 9px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    if (v.I) arrow(cx + 16, d.east ? 290 : 50, cx + 16, d.east ? 250 : 90, '#e8a200', 'I', { w: 2.5, lx: 6 });
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill(); ctx.stroke();
    for (let a = 0; a < 360; a += 10){ const r0 = a % 30 ? R - 6 : R - 12, rr = a * DEG; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + r0 * Math.sin(rr), cy - r0 * Math.cos(rr)); ctx.lineTo(cx + R * Math.sin(rr), cy - R * Math.cos(rr)); ctx.stroke(); if (a % 30 === 0 && a % 90) text(String(a <= 180 ? a : 360 - a), cx + (R - 22) * Math.sin(rr), cy - (R - 22) * Math.cos(rr) + 3, { align: 'center', font: '500 8px "IBM Plex Mono",monospace' }); }
    [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([n, a]) => text(n, cx + (R + 12) * Math.sin(a * DEG), cy - (R + 12) * Math.cos(a * DEG) + 5, { align: 'center', font: '700 13px "Space Grotesk",sans-serif' }));
    const th = (d.east ? 1 : -1) * d.th * DEG, L = R - 26; ctx.lineWidth = 5; ctx.strokeStyle = '#c43a00'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + L * Math.sin(th), cy - L * Math.cos(th)); ctx.stroke(); ctx.strokeStyle = '#888'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - L * Math.sin(th), cy + L * Math.cos(th)); ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 7); ctx.fill();
    if (v.I){ ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 40, -PI / 2, -PI / 2 + th, th < 0); ctx.stroke(); text('θ = ' + fplain(d.th) + '°', cx + (d.east ? 46 : -46), cy - 34, { align: d.east ? 'left' : 'right', font: '700 12px "IBM Plex Mono",monospace', col: '#1546d6' }); }
    // vector triangle
    panelTitle('ADD THE FIELDS', 395, 18); const ox = 470, oy = 260, sc = 150 / Math.max(BE, d.Bw, 1e-12) * 0.9, bx = (d.east ? 1 : -1) * d.Bw * sc, by = BE * sc;
    arrow(ox, oy, ox, oy - by, '#1e7d45', 'B Earth', { w: 3, lx: -60 }); if (v.I){ arrow(ox, oy - by, ox + bx, oy - by, '#e8a200', 'B wire', { w: 3, ly: -10 }); arrow(ox, oy, ox + bx, oy - by, '#c43a00', null, { w: 2.5 }); }
    text('B_wire = ' + fplain(d.Bw) + ' T', 400, 290, { font: '600 10px "IBM Plex Mono",monospace' }); text('tan θ = ' + fplain(d.tan), 400, 306, { font: '700 11px "IBM Plex Mono",monospace', col: '#c43a00' });
  }
};
