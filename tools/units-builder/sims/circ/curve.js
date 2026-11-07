// Car on a Curve: flat road (static friction) and banked road (no friction).
const SIM = {
  title: 'Car on a Curve',
  modes: [{ id: 'flat', label: 'Flat road (friction)' }, { id: 'bank', label: 'Banked road (no friction)' }],
  ivs(mode){
    const base = [
      { id: 'm', sym: 'm', symText: 'm', label: 'Car mass', unit: 'kg', min: 500, max: 3000, step: 50, val: 1200 },
      { id: 'v', sym: 'v', symText: 'v', label: 'Speed', unit: 'm/s', min: 2, max: 40, step: 0.5, val: 15, graph: true },
      { id: 'r', sym: 'r', symText: 'r', label: 'Curve radius', unit: 'm', min: 10, max: 200, step: 1, val: 50 }];
    return mode === 'flat'
      ? base.concat([{ id: 'mu', sym: 'μ<sub>s</sub>', symText: 'μs', label: 'Static friction', unit: '', min: 0.1, max: 1, step: 0.05, val: 0.6, show: v => v.toFixed(2) }])
      : base.concat([{ id: 'th', sym: 'θ', symText: 'θ', label: 'Bank angle', unit: '°', min: 5, max: 45, step: 1, val: 20, show: v => v.toFixed(0) + '°' }]);
  },
  calc(v, mode){
    const ac = v.v * v.v / v.r, Fc = v.m * ac, W = v.m * G10;
    if (mode === 'flat'){ const fmax = v.mu * W, vmax = Math.sqrt(v.mu * G10 * v.r); return { ac, Fc, W, N: W, fmax, vmax, ok: Fc <= fmax * (1 + 1e-9), f: Math.min(Fc, fmax) }; }
    const th = v.th * DEG, N = W / Math.cos(th), Fprov = W * Math.tan(th), v0 = Math.sqrt(G10 * v.r * Math.tan(th));
    return { ac, Fc, W, N, Fprov, v0, diff: Fc - Fprov, th };
  },
  dvs(mode){
    return mode === 'flat' ? [
      { id: 'Fc', name: 'Force needed, mv²/r', short: 'F needed', sym: 'F<sub>needed</sub>', unit: 'N', f: d => d.Fc, vs: 'fmax' },
      { id: 'ac', name: 'Centripetal acceleration', short: 'a_c', sym: 'a<sub>c</sub>', unit: 'm/s²', f: d => d.ac },
      { id: 'vmax', name: 'Fastest safe speed', short: 'v_max', sym: 'v<sub>max</sub>', unit: 'm/s', f: d => d.vmax },
      { id: 'fmax', name: 'Max static friction', short: 'f_s,max', sym: 'f<sub>s,max</sub>', unit: 'N', f: d => d.fmax }
    ] : [
      { id: 'Fc', name: 'Force needed, mv²/r', short: 'F needed', sym: 'F<sub>needed</sub>', unit: 'N', f: d => d.Fc, vs: 'Fprov' },
      { id: 'v0', name: 'Design speed v₀', short: 'v₀', sym: 'v<sub>0</sub>', unit: 'm/s', f: d => d.v0 },
      { id: 'N', name: 'Normal force', short: 'N', sym: 'N', unit: 'N', f: d => d.N },
      { id: 'Fprov', name: 'Force the bank gives, N sinθ', short: 'N sinθ', sym: 'N sinθ', unit: 'N', f: d => d.Fprov },
      { id: 'ac', name: 'Centripetal acceleration', short: 'a_c', sym: 'a<sub>c</sub>', unit: 'm/s²', f: d => d.ac }
    ];
  },
  work(v, d, mode){
    const g = M.n(10, 'm/s²');
    let h = '<h4>1 · Centripetal acceleration</h4>' + TEX`a_c = \frac{v^2}{r}` + TEX`a_c = \frac{(${M.iv('v')})^2}{${M.iv('r')}}` + TEXA`a_c = ${M.n(d.ac, 'm/s²')}` +
      '<h4>2 · Net force needed toward the center</h4>' + TEX`\Sigma F_c = m\,a_c` + TEX`\Sigma F_c = (${M.iv('m')})(${M.n(d.ac, 'm/s²')})` + TEXA`\Sigma F_c = ${M.n(d.Fc, 'N')}`;
    if (mode === 'flat'){
      h += '<p class="note">On a flat road the only sideways force is <b>static friction</b>, so friction has to supply all of it.</p>' +
        '<h4>3 · Most friction the tires can get</h4>' + TEX`f_{s,\max} = \mu_s N = \mu_s\,m g` + TEX`f_{s,\max} = (${M.iv('mu')})(${M.iv('m')})(${g})` + TEXA`f_{s,\max} = ${M.n(d.fmax, 'N')}` +
        '<h4>4 · Compare</h4>' + (d.ok
          ? '<div class="ok">Needed ' + H.n(d.Fc, 'N') + ' ≤ available ' + H.n(d.fmax, 'N') + ' → friction can do it. The car makes the turn.</div>'
          : '<div class="bad">Needed ' + H.n(d.Fc, 'N') + ' &gt; available ' + H.n(d.fmax, 'N') + ' → not enough friction. The car skids toward the <b>outside</b> of the curve (closer to a straight line).</div>') +
        '<h4>5 · Fastest speed that works</h4>' + TEX`\mu_s\,m g = \frac{m\,v_{\max}^2}{r}` + TEX`v_{\max} = \sqrt{\mu_s\,g\,r}` + TEX`v_{\max} = \sqrt{(${M.iv('mu')})(${g})(${M.iv('r')})}` + TEXA`v_{\max} = ${M.n(d.vmax, 'm/s')}` +
        '<p class="note">m is on both sides and cancels: a heavier car needs more force but also gets more friction.</p>';
    } else {
      h += '<h4>3 · Vertical: no up/down acceleration</h4>' + TEX`N\,\cos\theta = m g` + TEX`N = \frac{m g}{\cos\theta}` + TEX`N = \frac{(${M.iv('m')})(${g})}{\cos ${M.iv('th')}}` + TEXA`N = ${M.n(d.N, 'N')}` +
        '<h4>4 · Sideways force the bank gives</h4>' + TEX`N\,\sin\theta = m g\,\tan\theta` + TEX`N\,\sin\theta = (${M.iv('m')})(${g})\,\tan ${M.iv('th')}` + TEXA`N\,\sin\theta = ${M.n(d.Fprov, 'N')}` +
        '<h4>5 · Compare</h4>' + (Math.abs(d.diff) <= 0.01 * d.Fc
          ? '<div class="ok">Needed ≈ given. This is the design speed: no friction is needed at all.</div>'
          : d.diff > 0
            ? '<div class="bad">Needed ' + H.n(d.Fc, 'N') + ' &gt; given ' + H.n(d.Fprov, 'N') + '. Too fast: the car slides <b>up the bank</b> (outward). Friction would have to point down the slope to help.</div>'
            : '<div class="bad">Needed ' + H.n(d.Fc, 'N') + ' &lt; given ' + H.n(d.Fprov, 'N') + '. Too slow: the car slides <b>down the bank</b> (inward). Friction would have to point up the slope to help.</div>') +
        '<h4>6 · Design speed (no friction needed)</h4><p class="st">Sideways and vertical together:</p>' + TEX`N\,\sin\theta = \frac{m\,v_0^2}{r}` + TEX`N\,\cos\theta = m g` + TEX`\tan\theta = \frac{v_0^2}{g\,r}` + TEX`v_0 = \sqrt{g\,r\,\tan\theta}` + TEX`v_0 = \sqrt{(${g})(${M.iv('r')})\,\tan ${M.iv('th')}}` + TEXA`v_0 = ${M.n(d.v0, 'm/s')}` +
        '<p class="note">Mass cancels again: every car has the same design speed.</p>';
    }
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    // ---- top view ----
    const cx = 180, cy = 165, R = 40 + 118 * (v.r / 200);
    panelTitle('TOP VIEW', 10, 18);
    ctx.lineWidth = 22; ctx.strokeStyle = mode === 'bank' ? '#c9c9c9' : '#d9d9d9'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff'; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill(); text('center', cx + 6, cy + 4, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    if (A.phi === undefined || A.reset){ if (A.phi === undefined) A.phi = -PI / 2; A.off = 0; A.skid = 0; }
    const w = Math.max(0.25, Math.min(2.5, v.v / v.r));
    let rr = R, px, py, heading;
    if (mode === 'flat' && !d.ok){
      A.skid += dt; if (A.skid > 2.6){ A.skid = 0; }
      const k = (d.Fc - d.fmax) / d.Fc; // fraction of the needed force that is missing
      A.phi += w * dt * (1 - 0.5 * k);
      rr = R + 70 * k * A.skid * A.skid;
    } else {
      A.phi += w * dt;
      if (mode === 'bank'){ const k = Math.max(-1, Math.min(1, d.diff / Math.max(d.Fc, d.Fprov))); A.off += (k * 10 - A.off) * Math.min(1, dt * 3); rr = R + A.off; }
    }
    px = cx + rr * Math.cos(A.phi); py = cy + rr * Math.sin(A.phi); heading = A.phi + PI / 2;
    ctx.save(); ctx.translate(px, py); ctx.rotate(heading); ctx.fillStyle = '#ff6a2b'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(-11, -6, 22, 12); ctx.strokeRect(-11, -6, 22, 12); ctx.restore();
    const ux = Math.cos(heading), uy = Math.sin(heading), inx = -Math.cos(A.phi), iny = -Math.sin(A.phi);
    arrow(px, py, px + ux * (20 + v.v * 1.6), py + uy * (20 + v.v * 1.6), COL.V, 'v');
    const fShown = mode === 'flat' ? d.f : d.Fprov, fl = Math.min(70, 12 + 55 * fShown / Math.max(d.W, 1));
    arrow(px, py, px + inx * fl, py + iny * fl, COL.F, mode === 'flat' ? (d.ok ? 'f (toward center)' : 'f (max)') : 'N sinθ');
    if (mode === 'flat' && !d.ok) text('SKIDDING', 12, 318, { font: '700 14px "Space Grotesk",sans-serif', col: '#c43a00' });
    if (mode === 'bank' && Math.abs(d.diff) > 0.01 * d.Fc) text(d.diff > 0 ? 'sliding up the bank' : 'sliding down the bank', 12, 318, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' });
    // ---- side view FBD (looking from behind the car; center of the curve is to the left) ----
    const bx = 470, by = 230; panelTitle('FROM BEHIND (center ←)', 372, 18);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
    const th = mode === 'bank' ? v.th * DEG : 0;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-th);
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(-110, 0, 220, 60); ctx.beginPath(); ctx.moveTo(-110, 0); ctx.lineTo(110, 0); ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.fillRect(-26, -30, 52, 30); ctx.strokeRect(-26, -30, 52, 30);
    ctx.restore();
    const ox = bx - 15 * Math.sin(th) * 0, oy = by - 15;
    const sc = 75 / d.W;
    arrow(ox, oy, ox, oy + d.W * sc, COL.W, 'mg', { lx: 6, ly: 2 });
    if (mode === 'flat'){
      arrow(ox, oy, ox, oy - d.N * sc, COL.N, 'N', { lx: 6, ly: 4 });
      arrow(ox, oy, ox - d.f * sc, oy, COL.F, 'f', { lx: -6, ly: -8 });
    } else {
      const nl = d.N * sc, nx = -Math.sin(th) * nl, ny = -Math.cos(th) * nl;
      arrow(ox, oy, ox + nx, oy + ny, COL.N, 'N', { lx: -8, ly: -6 });
      arrow(ox, oy, ox + nx, oy, COL.comp, 'N sinθ', { w: 2, dash: [4, 3], lx: -6, ly: 12 });
      arrow(ox, oy, ox, oy + ny, COL.comp, 'N cosθ', { w: 2, dash: [4, 3], lx: 6, ly: 2 });
    }
    text('arrows to scale (mg = ' + fnum(d.W).replace(/<[^>]+>/g, '') + ' N)', 372, 318, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
