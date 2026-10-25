// Adding Forces: two forces on one object, added by components (also tip-to-tail and parallelogram views).
const SIM = {
  title: 'Adding Forces',
  opts: [{ id: 'view', label: 'Show', choices: [['comp', 'Components'], ['tip', 'Tip to tail'], ['para', 'Parallelogram']] }],
  ivs(){ return [
    { id: 'F1', sym: 'F<sub>1</sub>', symText: 'F1', label: 'Force 1', unit: 'N', min: 0, max: 100, step: 1, val: 60 },
    { id: 'a1', sym: 'θ<sub>1</sub>', symText: 'θ1', label: 'Force 1 angle', unit: '°', min: 0, max: 360, step: 1, val: 20, show: v => v.toFixed(0) + '°' },
    { id: 'F2', sym: 'F<sub>2</sub>', symText: 'F2', label: 'Force 2', unit: 'N', min: 0, max: 100, step: 1, val: 40 },
    { id: 'a2', sym: 'θ<sub>2</sub>', symText: 'θ2', label: 'Force 2 angle', unit: '°', min: 0, max: 360, step: 1, val: 110, graph: true, show: v => v.toFixed(0) + '°' }]; },
  presets: [{ label: 'Same direction', v: { a1: 30, a2: 30 } }, { label: 'Opposite', v: { a1: 0, a2: 180 } }, { label: 'At 90°', v: { a1: 0, a2: 90 } }, { label: 'Equal at 120°', v: { F1: 50, F2: 50, a1: 0, a2: 120 } }],
  calc(v){
    const c = a => Math.cos(a * DEG), s = a => Math.sin(a * DEG);
    const x1 = v.F1 * c(v.a1), y1 = v.F1 * s(v.a1), x2 = v.F2 * c(v.a2), y2 = v.F2 * s(v.a2), X = x1 + x2, Y = y1 + y2, R = Math.hypot(X, Y);
    let ang = Math.atan2(Y, X) / DEG; if (ang < 0) ang += 360;
    let between = Math.abs(v.a2 - v.a1) % 360; if (between > 180) between = 360 - between;
    return { x1, y1, x2, y2, X, Y, R, ang, between, ref: Math.atan(Math.abs(Y) / Math.max(Math.abs(X), 1e-12)) / DEG };
  },
  dvs(){ return [
    { id: 'R', name: 'Net force (resultant)', short: 'F_net', sym: 'F<sub>net</sub>', unit: 'N', f: d => d.R },
    { id: 'ang', name: 'Direction of net force', short: 'angle', sym: 'θ<sub>net</sub>', unit: '°', f: d => d.ang },
    { id: 'X', name: 'ΣF_x', short: 'ΣFx', sym: 'ΣF<sub>x</sub>', unit: 'N', f: d => d.X },
    { id: 'Y', name: 'ΣF_y', short: 'ΣFy', sym: 'ΣF<sub>y</sub>', unit: 'N', f: d => d.Y }]; },
  work(v, d){
    const quad = d.X >= 0 && d.Y >= 0 ? 'I' : d.X < 0 && d.Y >= 0 ? 'II' : d.X < 0 ? 'III' : 'IV';
    return '<h4>1 · Break each force into components (angles from +x, counterclockwise)</h4>' +
      '<div class="eq">F<sub>1x</sub> = F<sub>1</sub>cosθ<sub>1</sub> = (' + H.iv('F1') + ')cos ' + H.iv('a1') + ' = ' + H.n(d.x1, 'N') + ' &nbsp; F<sub>1y</sub> = F<sub>1</sub>sinθ<sub>1</sub> = ' + H.n(d.y1, 'N') + '</div>' +
      '<div class="eq">F<sub>2x</sub> = (' + H.iv('F2') + ')cos ' + H.iv('a2') + ' = ' + H.n(d.x2, 'N') + ' &nbsp; F<sub>2y</sub> = (' + H.iv('F2') + ')sin ' + H.iv('a2') + ' = ' + H.n(d.y2, 'N') + '</div>' +
      '<h4>2 · Add the x’s, add the y’s</h4><div class="eq">ΣF<sub>x</sub> = ' + H.n(d.x1) + ' + ' + H.p(d.x2) + ' = <b>' + H.n(d.X, 'N') + '</b> &nbsp; ΣF<sub>y</sub> = ' + H.n(d.y1) + ' + ' + H.p(d.y2) + ' = <b>' + H.n(d.Y, 'N') + '</b></div>' +
      '<h4>3 · Put them back together</h4><div class="eq">F<sub>net</sub> = √(ΣF<sub>x</sub>² + ΣF<sub>y</sub>²) = √((' + H.n(d.X) + ')² + (' + H.n(d.Y) + ')²) = <b>' + H.n(d.R, 'N') + '</b></div>' +
      '<div class="eq">tan<sup>−1</sup>(|ΣF<sub>y</sub>|/|ΣF<sub>x</sub>|) = ' + H.n(d.ref, '°') + ', quadrant ' + quad + ' → direction <b>' + H.n(d.ang, '°') + '</b></div>' +
      '<p class="note">Always check the quadrant: the calculator’s tan<sup>−1</sup> only gives angles in quadrants I and IV.</p>' +
      '<h4>4 · Angle between the forces: ' + H.n(d.between, '°') + '</h4><div class="eq">Biggest net force at 0° (' + H.n(v.F1 + v.F2, 'N') + '), smallest at 180° (' + H.n(Math.abs(v.F1 - v.F2), 'N') + ').</div>' +
      '<h4>5 · Equilibrant</h4><div class="eq">The force that would balance them: ' + H.n(d.R, 'N') + ' at ' + H.n((d.ang + 180) % 360, '°') + '</div>';
  },
  draw(v, d, mode, opt){
    const view = opt.view, ox = 190, oy = 175, maxF = Math.max(v.F1 + v.F2, 1), sc = (view === 'comp' ? 135 : 120) / maxF;
    panelTitle(view === 'comp' ? 'COMPONENTS' : view === 'tip' ? 'TIP TO TAIL' : 'PARALLELOGRAM', 10, 18);
    // grid and axes
    ctx.strokeStyle = '#eee'; ctx.lineWidth = 1; for (let g = -170; g <= 170; g += 20){ ctx.beginPath(); ctx.moveTo(ox + g, 25); ctx.lineTo(ox + g, 325); ctx.stroke(); ctx.beginPath(); ctx.moveTo(15, oy + g); ctx.lineTo(365, oy + g); ctx.stroke(); }
    ctx.strokeStyle = '#9a9a9a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(15, oy); ctx.lineTo(365, oy); ctx.moveTo(ox, 25); ctx.lineTo(ox, 325); ctx.stroke();
    text('+x', 352, oy - 6, { font: '600 11px "IBM Plex Mono",monospace', col: '#8a8a8a' }); text('+y', ox + 6, 36, { font: '600 11px "IBM Plex Mono",monospace', col: '#8a8a8a' });
    const P = (x, y) => [ox + x * sc, oy - y * sc];
    const c1 = '#1546d6', c2 = '#ff6a2b', cR = '#111';
    if (view === 'comp'){
      // each force with dashed components
      [[d.x1, d.y1, c1, 'F1'], [d.x2, d.y2, c2, 'F2']].forEach(([x, y, col, l]) => {
        arrow(ox, oy, ...P(x, 0), col, '', { w: 2, dash: [4, 3] }); arrow(...P(x, 0), ...P(x, y), col, '', { w: 2, dash: [4, 3] }); arrow(ox, oy, ...P(x, y), col, l); });
      // sums along the axes
      arrow(ox, oy + 4, ...P(d.X, -4 / sc), '#7a3fb0', 'ΣFx', { w: 4, lx: 0, ly: 14, align: 'center' });
      arrow(ox - 4, oy, ...P(-4 / sc, d.Y), '#7a3fb0', 'ΣFy', { w: 4, lx: -6, ly: 0, align: 'right' });
      arrow(ox, oy, ...P(d.X, d.Y), cR, 'F_net', { w: 4.5 });
    } else if (view === 'tip'){
      arrow(ox, oy, ...P(d.x1, d.y1), c1, 'F1'); arrow(...P(d.x1, d.y1), ...P(d.x1 + d.x2, d.y1 + d.y2), c2, 'F2'); arrow(ox, oy, ...P(d.X, d.Y), cR, 'F_net', { w: 4.5 });
    } else {
      arrow(ox, oy, ...P(d.x1, d.y1), c1, 'F1'); arrow(ox, oy, ...P(d.x2, d.y2), c2, 'F2');
      ctx.strokeStyle = '#bdbdbd'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(...P(d.x1, d.y1)); ctx.lineTo(...P(d.X, d.Y)); ctx.lineTo(...P(d.x2, d.y2)); ctx.stroke(); ctx.setLineDash([]);
      arrow(ox, oy, ...P(d.X, d.Y), cR, 'F_net (diagonal)', { w: 4.5 });
    }
    // components table
    panelTitle('COMPONENT TABLE (N)', 385, 18);
    const rows = [['', 'x', 'y'], ['F1', d.x1, d.y1], ['F2', d.x2, d.y2], ['Σ', d.X, d.Y]];
    rows.forEach((r, i) => { const y = 60 + i * 30; r.forEach((cell, j) => text(typeof cell === 'number' ? fplain(cell) : cell, 410 + j * 65, y, { align: j ? 'right' : 'left', font: (i === 0 || i === 3 ? '700 ' : '500 ') + '13px "IBM Plex Mono",monospace', col: i === 1 ? c1 : i === 2 ? c2 : i === 3 ? '#7a3fb0' : '#4a4a4a' })); if (i === 2){ ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(400, y + 10); ctx.lineTo(560, y + 10); ctx.stroke(); } });
    text('F_net = ' + fplain(d.R) + ' N', 400, 200, { font: '700 15px "Space Grotesk",sans-serif' });
    text('at ' + fplain(d.ang) + '°', 400, 220, { font: '700 15px "Space Grotesk",sans-serif' });
    text('angle between forces: ' + fplain(d.between) + '°', 400, 250, { font: '500 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
