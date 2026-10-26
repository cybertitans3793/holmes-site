// Push Two Blocks: contact force between pushed blocks, and tensions in a train of carts. Whole system, then one piece.
const SIM = {
  title: 'Push Two Blocks',
  modes: [{ id: 'push', label: 'Two blocks pushed' }, { id: 'train', label: 'Train of three carts' }],
  opts: [{ id: 'side', label: 'Push from', modes: ['push'], choices: [['left', 'The left'], ['right', 'The right']] }],
  ivs(mode){
    if (mode === 'push') return [
      { id: 'F', sym: 'F', symText: 'F', label: 'Push', unit: 'N', min: 0, max: 100, step: 1, val: 30 },
      { id: 'm1', sym: 'm<sub>1</sub>', symText: 'm1', label: 'Left block', unit: 'kg', min: 1, max: 20, step: 0.5, val: 4, graph: true },
      { id: 'm2', sym: 'm<sub>2</sub>', symText: 'm2', label: 'Right block', unit: 'kg', min: 1, max: 20, step: 0.5, val: 2 },
      { id: 'mu', sym: 'μ<sub>k</sub>', symText: 'μk', label: 'Friction (same for both)', unit: '', min: 0, max: 0.5, step: 0.01, val: 0, show: x => x.toFixed(2) }];
    return [
      { id: 'F', sym: 'F', symText: 'F', label: 'Pull on the front cart', unit: 'N', min: 0, max: 100, step: 1, val: 36 },
      { id: 'm1', sym: 'm<sub>1</sub>', symText: 'm1', label: 'Front cart', unit: 'kg', min: 1, max: 20, step: 0.5, val: 2 },
      { id: 'm2', sym: 'm<sub>2</sub>', symText: 'm2', label: 'Middle cart', unit: 'kg', min: 1, max: 20, step: 0.5, val: 4, graph: true },
      { id: 'm3', sym: 'm<sub>3</sub>', symText: 'm3', label: 'Back cart', unit: 'kg', min: 1, max: 20, step: 0.5, val: 6 }];
  },
  presets: [{ label: 'Equal blocks', mode: 'push', v: { m1: 3, m2: 3 } }, { label: 'Light pushes heavy', mode: 'push', v: { m1: 1, m2: 10 } }, { label: 'Add friction', mode: 'push', v: { mu: 0.2 } }],
  calc(v, mode, opt){
    if (mode === 'push'){
      const M = v.m1 + v.m2, f1 = v.mu * v.m1 * G10, f2 = v.mu * v.m2 * G10, fs = f1 + f2, moves = v.F > fs, a = moves ? (v.F - fs) / M : 0;
      const pushedLeft = opt.side !== 'right', mFar = pushedLeft ? v.m2 : v.m1, fFar = pushedLeft ? f2 : f1;
      const P = moves ? mFar * a + fFar : 0;  // static case is indeterminate; not shown
      return { M, f1, f2, fs, moves, a, P, mFar, fFar, pushedLeft, share: mFar / M };
    }
    const M = v.m1 + v.m2 + v.m3, a = v.F / M, T12 = (v.m2 + v.m3) * a, T23 = v.m3 * a;
    return { M, a, T12, T23 };
  },
  dvs(mode){
    if (mode === 'push') return [
      { id: 'P', name: 'Contact force between the blocks', short: 'P', sym: 'P', unit: 'N', f: d => d.P },
      { id: 'a', name: 'Acceleration', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a }];
    return [
      { id: 'T12', name: 'Tension front–middle', short: 'T12', sym: 'T<sub>12</sub>', unit: 'N', f: d => d.T12 },
      { id: 'T23', name: 'Tension middle–back', short: 'T23', sym: 'T<sub>23</sub>', unit: 'N', f: d => d.T23 },
      { id: 'a', name: 'Acceleration', short: 'a', sym: 'a', unit: 'm/s²', f: d => d.a }];
  },
  work(v, d, mode){
    if (mode === 'push'){
      const far = d.pushedLeft ? 'right block (m<sub>2</sub>)' : 'left block (m<sub>1</sub>)', farId = d.pushedLeft ? 'm2' : 'm1';
      let h = '<h4>1 · Whole system: both blocks move together</h4><div class="eq">The contact forces between them are internal and cancel. ' + (v.mu > 0 ? 'Friction on both: μ(m<sub>1</sub> + m<sub>2</sub>)g = ' + H.n(d.fs, 'N') + '.' : 'No friction.') + '</div>';
      if (!d.moves) return h + '<div class="bad">The push isn’t more than friction, so (treating μ as static too) they don’t move. How static friction splits between the blocks can’t be found from these numbers, so P isn’t shown.</div>';
      h += '<div class="eq">a = (F' + (v.mu > 0 ? ' − f' : '') + ')/(m<sub>1</sub> + m<sub>2</sub>) = (' + H.iv('F') + (v.mu > 0 ? ' − ' + H.n(d.fs) : '') + ') / (' + H.iv('m1') + ' + ' + H.iv('m2') + ') = <b>' + H.n(d.a, 'm/s²') + '</b></div>' +
        '<h4>2 · Now just the ' + far + '</h4><div class="eq">The only push on it is the contact force P from the other block' + (v.mu > 0 ? ' (minus its own friction)' : '') + '.</div>' +
        '<div class="eq">P' + (v.mu > 0 ? ' − f' : '') + ' = ma → P = (' + H.iv(farId) + ')(' + H.n(d.a) + ')' + (v.mu > 0 ? ' + ' + H.n(d.fFar) : '') + ' = <b>' + H.n(d.P, 'N') + '</b></div>' +
        '<div class="eq">Shortcut: P = F × m<sub>far</sub>/(m<sub>1</sub> + m<sub>2</sub>) = ' + H.n(v.F * d.share, 'N') + (v.mu > 0 ? ' (friction cancels out of this!)' : '') + '</div>' +
        '<h4>3 · Newton’s third law</h4><div class="eq">Block 1 pushes block 2 with P = ' + H.n(d.P, 'N') + '; block 2 pushes back on block 1 with ' + H.n(d.P, 'N') + '. Equal, even though the masses differ.</div>' +
        '<p class="note">Push the other side: P changes, because now the other block has to be accelerated by it. Push the heavy block into the light one for the smaller P.</p>';
      return h;
    }
    return '<h4>1 · Whole train</h4><div class="eq">a = F/(m<sub>1</sub> + m<sub>2</sub> + m<sub>3</sub>) = ' + H.iv('F') + ' / ' + H.n(d.M, 'kg') + ' = <b>' + H.n(d.a, 'm/s²') + '</b> (frictionless)</div>' +
      '<h4>2 · The back cart alone</h4><div class="eq">Only T<sub>23</sub> pulls it: T<sub>23</sub> = m<sub>3</sub>a = (' + H.iv('m3') + ')(' + H.n(d.a) + ') = <b>' + H.n(d.T23, 'N') + '</b></div>' +
      '<h4>3 · The back two carts together</h4><div class="eq">Only T<sub>12</sub> pulls them: T<sub>12</sub> = (m<sub>2</sub> + m<sub>3</sub>)a = ' + H.n(v.m2 + v.m3, 'kg') + ' × ' + H.n(d.a) + ' = <b>' + H.n(d.T12, 'N') + '</b></div>' +
      '<div class="eq">Check the middle cart: T<sub>12</sub> − T<sub>23</sub> = ' + H.n(d.T12 - d.T23, 'N') + ' = m<sub>2</sub>a = ' + H.n(v.m2 * d.a, 'N') + ' ✓</div>' +
      '<p class="note">Tension is biggest near the front: each rope has to accelerate everything behind it. F > T<sub>12</sub> > T<sub>23</sub>.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const tt = A.t % 3.5, shift = Math.min(0.5 * d.a * tt * tt * 6, 120);
    const fy = 200; ctx.fillStyle = '#e6dccb'; ctx.fillRect(0, fy, 600, 20);
    if (mode === 'push'){
      panelTitle('TWO BLOCKS PUSHED ACROSS THE FLOOR', 10, 18);
      const s1 = 30 + 4 * v.m1, s2 = 30 + 4 * v.m2, x0 = (d.pushedLeft ? 160 : 140) + shift * (d.pushedLeft ? 1 : -1), b1x = x0, b2x = x0 + s1;
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5;
      ctx.fillStyle = '#ff6a2b'; ctx.fillRect(b1x, fy - s1, s1, s1); ctx.strokeRect(b1x, fy - s1, s1, s1); text('m1', b1x + s1 / 2, fy - s1 / 2 + 4, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: '#fff' });
      ctx.fillStyle = '#1546d6'; ctx.fillRect(b2x, fy - s2, s2, s2); ctx.strokeRect(b2x, fy - s2, s2, s2); text('m2', b2x + s2 / 2, fy - s2 / 2 + 4, { align: 'center', font: '700 12px "Space Grotesk",sans-serif', col: '#fff' });
      if (d.pushedLeft) arrow(b1x - 70, fy - s1 / 2, b1x - 2, fy - s1 / 2, COL.T, 'F = ' + fplain(v.F) + ' N', { lx: -68, ly: -14, align: 'left' });
      else arrow(b2x + s2 + 70, fy - s2 / 2, b2x + s2 + 2, fy - s2 / 2, COL.T, 'F = ' + fplain(v.F) + ' N', { lx: 68, ly: -14, align: 'right' });
      // free-body diagrams (horizontal)
      panelTitle('HORIZONTAL FORCES ON EACH BLOCK', 10, 245);
      const sc = 90 / Math.max(v.F, 1), dir = d.pushedLeft ? 1 : -1;
      const fbd = (x, y, col, lab, forces) => { ctx.fillStyle = col; ctx.fillRect(x - 12, y - 12, 24, 24); text(lab, x, y + 4, { align: 'center', font: '700 10px "Space Grotesk",sans-serif', col: '#fff' }); forces.forEach(([F, c, l, dy]) => { if (Math.abs(F) > 0.01) arrow(x + Math.sign(F) * 12, y + dy, x + Math.sign(F) * (12 + Math.abs(F) * sc), y + dy, c, l, { w: 3, head: 7, lx: Math.sign(F) * 4, ly: -8 }); }); };
      const P = d.P, f1 = d.moves ? d.f1 : 0, f2 = d.moves ? d.f2 : 0;
      fbd(150, 285, '#ff6a2b', 'm1', d.pushedLeft ? [[v.F, COL.T, 'F', -4], [-P, COL.N, 'P', 4], [-f1, COL.F, 'f', 10]] : [[-P, COL.N, 'P', -4], [f1, COL.F, 'f', 10]]);
      fbd(400, 285, '#1546d6', 'm2', d.pushedLeft ? [[P, COL.N, 'P', -4], [-f2, COL.F, 'f', 10]] : [[-v.F, COL.T, 'F', -4], [P, COL.N, 'P', 4], [f2, COL.F, 'f', 10]]);
      text('P = ' + fplain(P) + ' N   a = ' + fplain(d.a) + ' m/s²', 590, 18, { align: 'right', font: '700 13px "IBM Plex Mono",monospace' });
      return;
    }
    panelTitle('TRAIN OF CARTS PULLED FROM THE FRONT (frictionless)', 10, 18);
    const w = m => 34 + 3 * m, gap = 34, x3 = 60 + shift, x2 = x3 + w(v.m3) + gap, x1 = x2 + w(v.m2) + gap;
    const cart = (x, m, col, lab) => { const ww = w(m); ctx.fillStyle = col; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(x, fy - 34, ww, 26); ctx.strokeRect(x, fy - 34, ww, 26); [x + 9, x + ww - 9].forEach(cx => { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx, fy - 5, 5, 0, 7); ctx.fill(); }); text(lab, x + ww / 2, fy - 17, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#fff' }); };
    cart(x3, v.m3, '#7a3fb0', 'm3'); cart(x2, v.m2, '#1546d6', 'm2'); cart(x1, v.m1, '#ff6a2b', 'm1');
    ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x3 + w(v.m3), fy - 21); ctx.lineTo(x2, fy - 21); ctx.moveTo(x2 + w(v.m2), fy - 21); ctx.lineTo(x1, fy - 21); ctx.stroke();
    text('T23 = ' + fplain(d.T23), x3 + w(v.m3) + gap / 2, fy - 44, { align: 'center', font: '700 11px "IBM Plex Mono",monospace', col: COL.T });
    text('T12 = ' + fplain(d.T12), x2 + w(v.m2) + gap / 2, fy - 58, { align: 'center', font: '700 11px "IBM Plex Mono",monospace', col: COL.T });
    arrow(x1 + w(v.m1), fy - 21, x1 + w(v.m1) + 50, fy - 21, COL.T, 'F', { lx: 4, ly: -10 });
    panelTitle('TENSION ALONG THE TRAIN', 10, 245);
    const bmax = Math.max(v.F, 1), bar = (x, val, lab) => { const hgt = 60 * val / bmax; ctx.fillStyle = COL.T; ctx.fillRect(x, 320 - hgt, 60, hgt); text(lab + ' ' + fplain(val) + ' N', x + 30, 314 - hgt, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' }); };
    bar(120, d.T23, 'T23'); bar(270, d.T12, 'T12'); bar(420, v.F, 'F');
    text('a = ' + fplain(d.a) + ' m/s²', 590, 18, { align: 'right', font: '700 13px "IBM Plex Mono",monospace' });
  }
};
