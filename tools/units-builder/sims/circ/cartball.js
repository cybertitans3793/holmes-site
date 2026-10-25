// Inertia on a Cart: a ball launched straight up from a moving cart keeps the cart's horizontal velocity.
const SIM = {
  title: 'Inertia on a Cart',
  modes: [{ id: 'const', label: 'Cart at constant velocity' }, { id: 'speed', label: 'Cart speeds up' }, { id: 'brake', label: 'Cart slows down' }],
  opts: [{ id: 'view', label: 'Watch from', choices: [['ground', 'The ground'], ['cart', 'The cart']] }],
  ivs(mode){
    const l = [{ id: 'v', sym: 'v', symText: 'v', label: 'Cart speed at launch', unit: 'm/s', min: 0, max: 8, step: 0.5, val: 4, graph: true },
      { id: 'u', sym: 'u', symText: 'u', label: 'Launch speed (straight up from the cart)', unit: 'm/s', min: 2, max: 8, step: 0.5, val: 5 }];
    if (mode !== 'const') l.push({ id: 'a', sym: 'a', symText: 'a', label: mode === 'speed' ? 'Cart’s acceleration' : 'Cart’s slowing rate', unit: 'm/s²', min: 0.5, max: 4, step: 0.1, val: 2 });
    return l;
  },
  calc(v, mode){
    const tAir = 2 * v.u / G10, hMax = v.u * v.u / (2 * G10), acc = mode === 'speed' ? v.a : mode === 'brake' ? -v.a : 0;
    const xc = s => (acc < 0 && v.v + acc * s < 0) ? v.v * v.v / (2 * -acc) : v.v * s + 0.5 * acc * s * s;
    const xb = s => v.v * s, yb = s => Math.max(0, v.u * s - 0.5 * G10 * s * s);
    const xBall = xb(tAir), xCart = xc(tAir), miss = xBall - xCart;
    return { tAir, hMax, acc, xc, xb, yb, xBall, xCart, miss };
  },
  dvs(){ return [
    { id: 'miss', name: 'Where it lands vs the launcher (+ = ahead)', short: 'Δx', sym: 'Δx', unit: 'm', f: d => d.miss },
    { id: 'xBall', name: 'Ball’s horizontal distance (ground)', short: 'x_ball', sym: 'x<sub>ball</sub>', unit: 'm', f: d => d.xBall, vs: 'xCart' },
    { id: 'xCart', name: 'Cart’s distance during the flight', short: 'x_cart', sym: 'x<sub>cart</sub>', unit: 'm', f: d => d.xCart },
    { id: 'tAir', name: 'Time in the air', short: 't', sym: 't<sub>air</sub>', unit: 's', f: d => d.tAir }]; },
  work(v, d, mode){
    let h = '<h4>1 · Before launch the ball rides with the cart</h4><div class="eq">So it already has the cart’s horizontal velocity: ' + H.iv('v') + ' →</div>' +
      '<h4>2 · In the air: no horizontal force on the ball</h4><div class="eq">Gravity pulls straight down; nothing pushes it ← or → (ignoring air). By Newton’s 1st law its horizontal velocity stays ' + H.iv('v') + '.</div>' +
      '<div class="eq">Time in the air (up and back down): t = 2u/g = 2(' + H.iv('u') + ')/' + H.g() + ' = ' + H.n(d.tAir, 's') + ' <span class="hint">(why: Unit 2)</span></div>' +
      '<div class="eq">Ball, horizontally: x<sub>ball</sub> = vt = (' + H.iv('v') + ')(' + H.n(d.tAir, 's') + ') = <b>' + H.n(d.xBall, 'm') + '</b></div>';
    if (mode === 'const') return h + '<h4>3 · The cart also keeps going at ' + H.iv('v') + '</h4><div class="eq">x<sub>cart</sub> = vt = <b>' + H.n(d.xCart, 'm') + '</b>. Same distance → the ball lands <b>right back in the launcher</b>.</div>' +
      '<p class="note">From the cart it looks like the ball goes straight up and down. Switch to “Watch from: The cart.” Same idea: drop your keys on a smooth train and they land at your feet.</p>' +
      '<p class="note">Common mistake: “the ball falls behind because the cart moves out from under it.” Only if the cart changes its velocity. Try the other two modes.</p>';
    h += '<h4>3 · But the cart ' + (mode === 'speed' ? 'speeds up' : 'slows down') + ' while the ball is in the air</h4><div class="eq">x<sub>cart</sub> = vt ' + (mode === 'speed' ? '+' : '−') + ' ½at² = ' + H.n(d.xCart, 'm') + ' <span class="hint">(½at²: Unit 2)</span></div>' +
      '<h4>4 · Compare</h4><div class="eq">Δx = x<sub>ball</sub> − x<sub>cart</sub> = ' + H.n(d.xBall) + ' − ' + H.n(d.xCart) + ' = <b>' + H.n(d.miss, 'm') + '</b>: the ball lands <b>' + (d.miss > 0 ? 'ahead of' : 'behind') + '</b> the launcher.</div>' +
      '<p class="note">The ball didn’t change its horizontal motion; the cart did. In the cart’s view the ball seems to drift ' + (d.miss > 0 ? 'forward' : 'backward') + ' with no force pushing it, which is how you know the cart is not an inertial (constant-velocity) frame.</p>';
    return h;
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    const pre = 0.8, post = 1.4, cyc = pre + d.tAir + post, tc = (A.t % cyc) - pre;   // tc: time since launch
    const s = Math.max(0, Math.min(tc, d.tAir)), sCart = Math.max(0, tc);
    const cartX = tc < 0 ? v.v * tc : d.xc(Math.min(sCart, d.tAir + post));
    const caught = Math.abs(d.miss) < 0.05, landed = tc > d.tAir;
    const ballX = tc < 0 ? cartX : !landed ? d.xb(s) : caught ? cartX : d.xBall;   // caught: rides on in the launcher; missed: sits on the ground
    const ballY = tc < 0 ? 0 : d.yb(s);
    const groundView = opt.view === 'ground';
    panelTitle(groundView ? 'WATCHED FROM THE GROUND' : 'WATCHED FROM THE CART', 10, 18);
    const span = groundView ? Math.max(d.xBall, d.xc(d.tAir + post), 0.5) + v.v * pre : Math.abs(d.miss) * 2 + 1, sc = Math.min(70, (groundView ? 280 : 150) / Math.max(span, 0.5), 170 / Math.max(d.hMax, 0.5));
    const groundY = 250, X0 = groundView ? 40 + v.v * pre * sc : 190;
    const X = x => groundView ? X0 + x * sc : X0 + (x - cartX) * sc, Y = y => groundY - 28 - y * sc;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 385, 330); ctx.clip();
    // ground with marks
    ctx.fillStyle = '#e6dccb'; ctx.fillRect(0, groundY, 380, 30);
    for (let m = Math.floor(-v.v * pre - 20); m < 40; m++){ const px = X(m); if (px < 0 || px > 380) continue; ctx.fillStyle = '#9a8a6a'; ctx.fillRect(px, groundY, 1.5, m % 5 ? 5 : 11); }
    // ball trail (from the chosen frame)
    if (tc > 0){ ctx.fillStyle = '#ffb38f'; for (let q = 0; q <= s; q += 0.05){ const tx = groundView ? X(d.xb(q)) : X0 + (d.xb(q) - d.xc(q)) * sc; ctx.beginPath(); ctx.arc(tx, Y(d.yb(q)), 2, 0, 7); ctx.fill(); } }
    // cart
    const cx = X(cartX); ctx.fillStyle = '#1546d6'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(cx - 40, groundY - 26, 80, 18); ctx.strokeRect(cx - 40, groundY - 26, 80, 18);
    ctx.fillStyle = '#555'; ctx.fillRect(cx - 5, groundY - 40, 10, 14);
    [cx - 26, cx + 26].forEach(wx => { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(wx, groundY - 6, 6, 0, 7); ctx.fill(); });
    // ball
    const bx = X(ballX), by = landed && !caught ? groundY - 7 : Y(ballY);
    ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.arc(bx, by, 7, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.stroke();
    if (tc > 0 && tc < d.tAir){ const vy = v.u - G10 * s, vx = groundView ? v.v : v.v - (v.v + d.acc * s); if (Math.hypot(vx, vy) > 0.2) arrow(bx, Y(ballY), bx + vx * 8, Y(ballY) - vy * 8, COL.V, '', { w: 2, head: 6 }); }
    ctx.restore();
    const msg = tc < 0 ? 'rolling…' : tc <= d.tAir ? 'ball in the air' : Math.abs(d.miss) < 0.05 ? 'lands back in the launcher' : d.miss > 0 ? 'lands ' + fplain(d.miss) + ' m AHEAD of the launcher' : 'lands ' + fplain(-d.miss) + ' m BEHIND the launcher';
    text(msg, 12, 300, { font: '700 13px "Space Grotesk",sans-serif', col: Math.abs(d.miss) < 0.05 || tc <= d.tAir ? '#111' : '#c43a00' });
    text('t = ' + fplain(Math.max(0, Math.min(tc, d.tAir))) + ' s  of ' + fplain(d.tAir) + ' s in the air', 12, 318, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    // x–t of ball vs cart during the flight
    panelTitle('HORIZONTAL POSITION vs TIME', 395, 18);
    const gx0 = 420, gy0 = 250, gw = 165, gh = 190, xm = Math.max(d.xBall, d.xCart, 0.5) * 1.1, PX = q => gx0 + gw * q / d.tAir, PY = x => gy0 - gh * x / xm;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx0, gy0 - gh); ctx.lineTo(gx0, gy0); ctx.lineTo(gx0 + gw, gy0); ctx.stroke();
    const ln = (f, col, dash, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash); ctx.beginPath(); for (let k = 0; k <= 60; k++){ const q = d.tAir * k / 60; k ? ctx.lineTo(PX(q), PY(f(q))) : ctx.moveTo(PX(q), PY(f(q))); } ctx.stroke(); ctx.setLineDash([]); };
    ln(d.xc, '#1546d6', [], 4); ln(d.xb, '#ff6a2b', [5, 4], 2.5);
    if (tc >= 0 && tc <= d.tAir){ ctx.strokeStyle = '#888'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(PX(s), gy0); ctx.lineTo(PX(s), gy0 - gh); ctx.stroke(); }
    text('cart', gx0 + gw + 2, PY(d.xCart) + (d.miss > 0 ? 10 : -4), { align: 'right', font: '700 11px "Space Grotesk",sans-serif', col: '#1546d6' });
    text('ball', gx0 + gw + 2, PY(d.xBall) + (d.miss > 0 ? -4 : 12), { align: 'right', font: '700 11px "Space Grotesk",sans-serif', col: '#ff6a2b' });
    text('x (m)', gx0 - 4, gy0 - gh - 6, { font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('t → ' + fplain(d.tAir) + ' s', gx0 + gw, gy0 + 14, { align: 'right', font: '500 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text(mode === 'const' ? 'same line: the ball keeps up' : 'the lines split', 395, 300, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
  }
};
