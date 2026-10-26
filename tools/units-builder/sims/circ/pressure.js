// Pressure & Depth: P = P0 + ρgh, a U-tube with two liquids, and a hydraulic lift (Pascal's principle).
const P0 = 1.01e5;
const SIM = {
  title: 'Pressure & Depth',
  modes: [{ id: 'depth', label: 'Pressure at depth' }, { id: 'utube', label: 'U-tube, two liquids' }, { id: 'lift', label: 'Hydraulic lift' }],
  opts: [{ id: 'atm', label: 'Report', modes: ['depth'], choices: [['abs', 'Absolute'], ['gauge', 'Gauge']] }],
  ivs(mode){
    if (mode === 'depth') return [
      { id: 'h', sym: 'h', symText: 'h', label: 'Depth', unit: 'm', min: 0, max: 20, step: 0.1, val: 5, graph: true },
      { id: 'rho', sym: 'ρ', symText: 'ρ', label: 'Liquid density', unit: 'kg/m³', min: 700, max: 13600, step: 50, val: 1000, show: x => x.toFixed(0) + ' kg/m³' }];
    if (mode === 'utube') return [
      { id: 'h1', sym: 'h<sub>oil</sub>', symText: 'h_oil', label: 'Oil column height', unit: 'cm', min: 2, max: 30, step: 0.5, val: 20, graph: true },
      { id: 'r1', sym: 'ρ<sub>oil</sub>', symText: 'ρ_oil', label: 'Oil density', unit: 'kg/m³', min: 500, max: 990, step: 10, val: 800, show: x => x.toFixed(0) + ' kg/m³' },
      { id: 'r2', sym: 'ρ<sub>w</sub>', symText: 'ρ_w', label: 'Bottom liquid density', unit: 'kg/m³', min: 1000, max: 13600, step: 100, val: 1000, show: x => x.toFixed(0) + ' kg/m³' }];
    return [
      { id: 'F1', sym: 'F<sub>1</sub>', symText: 'F1', label: 'Push on the small piston', unit: 'N', min: 10, max: 500, step: 5, val: 100 },
      { id: 'A1', sym: 'A<sub>1</sub>', symText: 'A1', label: 'Small piston area', unit: 'cm²', min: 1, max: 50, step: 1, val: 10 },
      { id: 'A2', sym: 'A<sub>2</sub>', symText: 'A2', label: 'Big piston area', unit: 'cm²', min: 50, max: 2000, step: 10, val: 500, graph: true },
      { id: 'd1', sym: 'd<sub>1</sub>', symText: 'd1', label: 'Small piston pushed down', unit: 'cm', min: 1, max: 50, step: 1, val: 20 }];
  },
  presets: [{ label: 'Mercury', mode: 'depth', v: { rho: 13600 } }, { label: '10 m of water', mode: 'depth', v: { h: 10, rho: 1000 } }],
  calc(v, mode, opt){
    if (mode === 'depth'){ const dP = v.rho * G10 * v.h, P = P0 + dP; return { dP, P, rep: opt.atm === 'gauge' ? dP : P, ratio: P / P0 }; }
    if (mode === 'utube'){ const h2 = v.r1 * v.h1 / v.r2; return { h2, diff: v.h1 - h2, Pb: v.r1 * G10 * v.h1 / 100 }; }
    const P = v.F1 / (v.A1 * 1e-4), F2 = v.F1 * v.A2 / v.A1, d2 = v.d1 * v.A1 / v.A2; return { P, F2, d2, ratio: v.A2 / v.A1, W1: v.F1 * v.d1 / 100, W2: F2 * d2 / 100, mLift: F2 / G10 };
  },
  dvs(mode){
    if (mode === 'depth') return [{ id: 'rep', name: 'Pressure at that depth', short: 'P', sym: 'P', unit: 'Pa', f: d => d.rep }, { id: 'dP', name: 'Extra pressure from the liquid ρgh', short: 'ρgh', sym: 'ρgh', unit: 'Pa', f: d => d.dP }];
    if (mode === 'utube') return [{ id: 'h2', name: 'Bottom liquid height above the boundary', short: 'h_w', sym: 'h<sub>w</sub>', unit: 'cm', f: d => d.h2 }, { id: 'diff', name: 'Level difference', short: 'Δh', sym: 'Δh', unit: 'cm', f: d => d.diff }];
    return [{ id: 'F2', name: 'Force on the big piston', short: 'F2', sym: 'F<sub>2</sub>', unit: 'N', f: d => d.F2 }, { id: 'd2', name: 'Big piston rises', short: 'd2', sym: 'd<sub>2</sub>', unit: 'cm', f: d => d.d2 }, { id: 'P', name: 'Pressure in the fluid', short: 'P', sym: 'P', unit: 'Pa', f: d => d.P }];
  },
  work(v, d, mode, opt){
    if (mode === 'depth') return '<h4>1 · The weight of the liquid above pushes down</h4><div class="eq">Extra pressure: ρgh = (' + H.iv('rho') + ')(' + H.g() + ')(' + H.iv('h') + ') = <b>' + H.n(d.dP, 'Pa') + '</b></div>' +
      '<h4>2 · Add the air pushing on the surface</h4><div class="eq">Absolute: P = P<sub>0</sub> + ρgh = 1.01×10<sup>5</sup> + ' + H.n(d.dP) + ' = <b>' + H.n(d.P, 'Pa') + '</b> (' + H.n(d.ratio) + ' atm)</div>' +
      '<div class="eq">Gauge (what a tire gauge reads): P − P<sub>0</sub> = ρgh = ' + H.n(d.dP, 'Pa') + '</div>' +
      '<p class="note">Only depth matters, not the shape or width of the container: a narrow tube and a wide lake at the same depth have the same pressure. ~10 m of water adds about 1 atm.</p>' +
      '<p class="note">Pressure pushes equally in all directions at a point, and always perpendicular to any surface it touches.</p>';
    if (mode === 'utube') return '<h4>1 · Points at the same height in the same connected liquid have the same pressure</h4><div class="eq">Pick the boundary between the liquids on the left, and the same height on the right.</div>' +
      '<h4>2 · Pressure there from each side</h4><div class="eq">Left: P<sub>0</sub> + ρ<sub>oil</sub>gh<sub>oil</sub> &nbsp; Right: P<sub>0</sub> + ρ<sub>w</sub>gh<sub>w</sub></div>' +
      '<div class="eq">ρ<sub>oil</sub>h<sub>oil</sub> = ρ<sub>w</sub>h<sub>w</sub> → h<sub>w</sub> = (' + H.iv('r1') + ')(' + H.iv('h1') + ') / ' + H.iv('r2') + ' = <b>' + H.n(d.h2, 'cm') + '</b></div>' +
      '<div class="eq">The oil side stands ' + H.n(d.diff, 'cm') + ' higher: the less dense liquid needs a taller column to make the same pressure.</div>' +
      '<p class="note">Lab use: measure both heights and you’ve measured the oil’s density, ρ<sub>oil</sub> = ρ<sub>w</sub>h<sub>w</sub>/h<sub>oil</sub>.</p>';
    return '<h4>1 · Pascal’s principle: the pressure you add spreads through the whole fluid</h4><div class="eq">P = F<sub>1</sub>/A<sub>1</sub> = ' + H.iv('F1') + ' / ' + H.n(v.A1 * 1e-4, 'm²') + ' = ' + H.n(d.P, 'Pa') + '</div>' +
      '<h4>2 · Same pressure on the big piston</h4><div class="eq">F<sub>2</sub> = PA<sub>2</sub> = F<sub>1</sub>(A<sub>2</sub>/A<sub>1</sub>) = ' + H.iv('F1') + ' × ' + H.n(d.ratio) + ' = <b>' + H.n(d.F2, 'N') + '</b> (lifts ' + H.n(d.mLift, 'kg') + ')</div>' +
      '<h4>3 · But it moves less: the volume pushed in comes out the other side</h4><div class="eq">A<sub>1</sub>d<sub>1</sub> = A<sub>2</sub>d<sub>2</sub> → d<sub>2</sub> = ' + H.iv('d1') + ' / ' + H.n(d.ratio) + ' = <b>' + H.n(d.d2, 'cm') + '</b></div>' +
      '<div class="eq">Work in = ' + H.n(d.W1, 'J') + ' = work out = ' + H.n(d.W2, 'J') + '. A force multiplier, not an energy multiplier.</div>';
  },
  draw(v, d, mode, opt){
    if (mode === 'depth'){
      panelTitle('OPEN TANK (two shapes, same liquid)', 10, 18);
      const top = 50, sc = 230 / 20, Y = h => top + h * sc, col = v.rho > 5000 ? '#b9c0cc' : v.rho < 950 ? '#f3e2a6' : '#9cc6f0';
      ctx.fillStyle = col; ctx.fillRect(30, top, 140, 20 * sc); ctx.fillRect(220, top, 30, 20 * sc); ctx.beginPath(); ctx.moveTo(280, top); ctx.lineTo(370, top); ctx.lineTo(340, Y(20)); ctx.lineTo(310, Y(20)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(30, top, 140, 20 * sc); ctx.strokeRect(220, top, 30, 20 * sc); ctx.beginPath(); ctx.moveTo(280, top); ctx.lineTo(310, Y(20)); ctx.lineTo(340, Y(20)); ctx.lineTo(370, top); ctx.stroke();
      ctx.setLineDash([5, 4]); ctx.strokeStyle = '#c43a00'; ctx.beginPath(); ctx.moveTo(20, Y(v.h)); ctx.lineTo(380, Y(v.h)); ctx.stroke(); ctx.setLineDash([]);
      [100, 235, 325].forEach(x => { ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(x, Y(v.h), 5, 0, 7); ctx.fill(); });
      [[100, 0, -1], [100, 0, 1], [100, -1, 0], [100, 1, 0]].forEach(([x, dx, dy]) => arrow(x + dx * 22, Y(v.h) + dy * 22, x + dx * 7, Y(v.h) + dy * 7, '#c43a00', '', { w: 2, head: 6 }));
      text('h = ' + fplain(v.h) + ' m', 175, Y(v.h) - 6, { font: '700 11px "IBM Plex Mono",monospace', col: '#c43a00' });
      text('same pressure at the same depth', 12, 312, { font: '700 12px "Space Grotesk",sans-serif' });
      panelTitle('PRESSURE vs DEPTH', 395, 18);
      const gx = 425, gy0 = 250, gw = 160, gh = 200, Pm = P0 + v.rho * G10 * 20, lo = opt.atm === 'gauge' ? 0 : 0, X = h => gx + gw * h / 20, Yp = p => gy0 - gh * p / Pm;
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
      const off = opt.atm === 'gauge' ? 0 : P0; ctx.strokeStyle = COL.V; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X(0), Yp(off)); ctx.lineTo(X(20), Yp(off + v.rho * G10 * 20)); ctx.stroke();
      ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(X(v.h), Yp(d.rep), 5, 0, 7); ctx.fill();
      text(fplain(Pm), gx - 3, gy0 - gh + 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('h → 20 m', gx + gw, gy0 + 13, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text((opt.atm === 'gauge' ? 'gauge ' : 'absolute ') + fplain(d.rep) + ' Pa', 395, 290, { font: '700 12px "IBM Plex Mono",monospace' });
      text('slope = ρg; intercept = ' + (opt.atm === 'gauge' ? '0' : 'P₀'), 395, 308, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    if (mode === 'utube'){
      panelTitle('U-TUBE: OIL POURED ON TOP OF A DENSER LIQUID', 10, 18);
      const bot = 280, sc = 7, lx = 120, rx = 260, w = 40, base = 200, Yc = h => base - h * sc;
      const wLev = base - d.h2 * sc;
      ctx.fillStyle = '#9cc6f0'; ctx.fillRect(lx - w / 2, base, rx - lx + w, bot - base); ctx.fillRect(rx - w / 2, wLev, w, base - wLev);
      ctx.fillStyle = '#f3e2a6'; ctx.fillRect(lx - w / 2, Yc(v.h1), w, v.h1 * sc);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx - w / 2, 30); ctx.lineTo(lx - w / 2, bot); ctx.lineTo(rx + w / 2, bot); ctx.lineTo(rx + w / 2, 30); ctx.moveTo(lx + w / 2, 30); ctx.lineTo(lx + w / 2, bot - 30); ctx.lineTo(rx - w / 2, bot - 30); ctx.lineTo(rx - w / 2, 30); ctx.stroke();
      ctx.setLineDash([4, 3]); ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx - 50, base); ctx.lineTo(rx + 60, base); ctx.stroke(); ctx.setLineDash([]);
      text('same pressure', rx + 30, base + 14, { font: '600 10px "IBM Plex Mono",monospace', col: '#c43a00' });
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1; [[lx - 34, Yc(v.h1), base, 'h_oil = ' + fplain(v.h1) + ' cm', 'right'], [rx + 34, wLev, base, 'h_w = ' + fplain(d.h2) + ' cm', 'left']].forEach(([x, y1, y2, l, al]) => { ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke(); text(l, x + (al === 'left' ? 6 : -6), (y1 + y2) / 2, { align: al, font: '700 10px "IBM Plex Mono",monospace' }); });
      text('oil', lx, Yc(v.h1) + 14, { align: 'center', font: '700 10px "Space Grotesk",sans-serif' });
      panelTitle('PRESSURE BALANCE', 395, 18);
      text('ρ_oil·h_oil = ρ_w·h_w', 400, 60, { font: '700 13px "IBM Plex Mono",monospace' });
      text(fplain(v.r1) + ' × ' + fplain(v.h1) + ' = ' + fplain(v.r2) + ' × ' + fplain(d.h2), 400, 82, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      text('oil side higher by ' + fplain(d.diff) + ' cm', 400, 110, { font: '700 12px "Space Grotesk",sans-serif', col: '#c43a00' });
      return;
    }
    panelTitle('HYDRAULIC LIFT', 10, 18);
    const base = 270, r1 = 8 + Math.sqrt(v.A1) * 3, r2 = 20 + Math.sqrt(v.A2) * 2.2, x1 = 70, x2 = 250, h1 = 150, s1 = Math.min(v.d1 * 1.5, 80), s2 = s1 * v.A1 / v.A2;
    ctx.fillStyle = '#9cc6f0'; ctx.fillRect(x1 - r1, h1 + s1, 2 * r1, base - h1 - s1); ctx.fillRect(x2 - r2, h1 - s2, 2 * r2, base - h1 + s2); ctx.fillRect(x1, base - 20, x2 - x1, 20);
    ctx.fillStyle = '#555'; ctx.fillRect(x1 - r1, h1 + s1 - 8, 2 * r1, 8); ctx.fillRect(x2 - r2, h1 - s2 - 8, 2 * r2, 8);
    ctx.fillStyle = '#1546d6'; ctx.fillRect(x2 - 34, h1 - s2 - 8 - 34, 68, 34); text(fplain(d.mLift) + ' kg', x2, h1 - s2 - 22, { align: 'center', font: '700 10px "IBM Plex Mono",monospace', col: '#fff' });
    arrow(x1, h1 + s1 - 60, x1, h1 + s1 - 10, COL.T, 'F1', { lx: 6, ly: -20 });
    text('down ' + fplain(v.d1) + ' cm', x1 + r1 + 4, h1 + 40, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('up ' + fplain(d.d2) + ' cm', x2 + r2 + 4, h1, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('F₂ = ' + fplain(d.F2) + ' N  (' + fplain(d.ratio) + '× F₁)', 12, 312, { font: '700 13px "Space Grotesk",sans-serif' });
    panelTitle('FORCE × DISTANCE', 395, 18);
    text('in:  ' + fplain(v.F1) + ' N × ' + fplain(v.d1 / 100) + ' m = ' + fplain(d.W1) + ' J', 395, 60, { font: '600 10px "IBM Plex Mono",monospace' });
    text('out: ' + fplain(d.F2) + ' N × ' + fplain(d.d2 / 100) + ' m = ' + fplain(d.W2) + ' J', 395, 80, { font: '600 10px "IBM Plex Mono",monospace' });
  }
};
