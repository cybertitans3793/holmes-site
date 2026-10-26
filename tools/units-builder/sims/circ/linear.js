// Linearizing Data (IB Tool 3): choose what to plot so a curved relationship becomes a straight line, then read the physics from the gradient.
const EXPTS = {
  pend: { title: 'Pendulum: period T vs length L', x: 'L', xu: 'm', y: 'T', yu: 's', xs: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4], f: L => 2 * PI * Math.sqrt(L / 10), want: 'sqrt', meaning: 'gradient = 2π/√g → g = (2π/gradient)²', g: m => (2 * PI / m) ** 2, gl: 'g', gu: 'm/s²' },
  fall: { title: 'Ball dropped from rest: distance d vs time t', x: 't', xu: 's', y: 'd', yu: 'm', xs: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], f: t => 5 * t * t, want: 'sq', meaning: 'd = ½gt² → gradient = g/2 → g = 2 × gradient', g: m => 2 * m, gl: 'g', gu: 'm/s²' },
  light: { title: 'Light intensity I vs distance r', x: 'r', xu: 'm', y: 'I', yu: 'W/m²', xs: [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0], f: r => 60 / (4 * PI * r * r), want: 'inv2', meaning: 'I = P/(4πr²) → gradient = P/4π → P = 4π × gradient', g: m => 4 * PI * m, gl: 'bulb power P', gu: 'W' },
  gas: { title: 'Gas at constant temperature: pressure P vs volume V', x: 'V', xu: 'L', y: 'P', yu: 'kPa', xs: [1, 1.5, 2, 2.5, 3, 3.5, 4], f: V => 200 / V, want: 'inv', meaning: 'PV = constant → gradient = PV = nRT', g: m => m, gl: 'PV', gu: 'kPa·L' },
};
const TR = { lin: ['x', x => x], sq: ['x²', x => x * x], sqrt: ['√x', x => Math.sqrt(x)], inv: ['1/x', x => 1 / x], inv2: ['1/x²', x => 1 / (x * x)] };
const SIM = {
  title: 'Linearizing Data',
  modes: Object.entries(EXPTS).map(([k, e]) => ({ id: k, label: { pend: 'Pendulum', fall: 'Falling ball', light: 'Light intensity', gas: 'Gas pressure' }[k] })),
  opts: [{ id: 'tr', label: 'Plot y against', choices: Object.entries(TR).map(([k, t]) => [k, t[0]]) }],
  ivs(){ return [{ id: 'noise', sym: 'noise', symText: 'noise', label: 'Measurement scatter', unit: '%', min: 0, max: 8, step: 0.5, val: 2, graph: true }]; },
  calc(v, mode, opt){
    const e = EXPTS[mode], t = TR[opt.tr || 'lin'], rr = i => { const s = Math.sin(i * 91.7 + 13.1) * 43758.5; return (s - Math.floor(s)) * 2 - 1; };
    const X = e.xs.map(x => t[1](x)), Y = e.xs.map((x, i) => e.f(x) * (1 + v.noise / 100 * rr(i)));
    const n = X.length, mx = X.reduce((a, b) => a + b) / n, my = Y.reduce((a, b) => a + b) / n, sxx = X.reduce((a, x) => a + (x - mx) ** 2, 0), syy = Y.reduce((a, y) => a + (y - my) ** 2, 0), sxy = X.reduce((a, x, i) => a + (x - mx) * (Y[i] - my), 0);
    const m = sxy / sxx, b = my - m * mx, r2 = sxy * sxy / (sxx * syy);
    return { e, t, X, Y, m, b, r2, right: (opt.tr || 'lin') === e.want, res: e.g(m) };
  },
  dvs(){ return [{ id: 'r2', name: 'How straight (R², 1 = perfect line)', short: 'R²', sym: 'R²', unit: '', f: d => d.r2 }, { id: 'm', name: 'Gradient', short: 'm', sym: 'm', unit: '', f: d => d.m }]; },
  work(v, d, mode, opt){
    const e = d.e;
    return '<h4>1 · The raw graph of ' + e.y + ' vs ' + e.x + ' is curved</h4><div class="eq">A curve is hard to check by eye and hard to get a gradient from. Find the relationship, then plot something that should be a straight line.</div>' +
      '<h4>2 · You’re plotting ' + e.y + ' against ' + d.t[0].replace('x', e.x) + '</h4>' +
      (d.right ? '<div class="eq"><b>Straight line through the origin</b> (R² = ' + d.r2.toFixed(4) + '): that’s the right choice.</div>' +
        '<h4>3 · Read the physics from the gradient</h4><div class="eq">gradient = ' + H.n(d.m) + ' &nbsp; ' + e.meaning + '</div><div class="eq">' + e.gl + ' = <b>' + H.n(d.res, e.gu) + '</b></div>'
        : '<div class="bad">Still curved (or not through the origin): R² = ' + d.r2.toFixed(4) + '. Try another choice.</div>') +
      '<p class="note">Check two things: straight, and through the origin when the relationship is a pure proportion. A straight line that misses the origin points to a systematic error.</p>';
  },
  draw(v, d, mode){
    const e = d.e; panelTitle(e.title.toUpperCase(), 10, 18);
    const plot = (gx, gy0, gw, gh, X, Y, xl, title, fit) => { panelTitle(title, gx - 20, gy0 - gh - 10);
      const xm = Math.max(...X) * 1.1, ym = Math.max(...Y) * 1.1, PX = x => gx + gw * x / xm, PY = y => gy0 - gh * y / ym;
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
      if (fit){ ctx.strokeStyle = d.right ? '#1e7d45' : '#c43a00'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PX(0), PY(d.b)); ctx.lineTo(PX(xm), PY(d.b + d.m * xm)); ctx.stroke(); }
      X.forEach((x, i) => { ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(PX(x), PY(Y[i]), 4, 0, 7); ctx.fill(); });
      text(xl, gx + gw, gy0 + 14, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(e.y + ' (' + e.yu + ')', gx - 4, gy0 - gh - 2, { align: 'right', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' }); };
    plot(50, 290, 230, 230, e.xs, d.Y, e.x + ' (' + e.xu + ')', 'RAW DATA', false);
    plot(350, 290, 230, 230, d.X, d.Y, d.t[0].replace('x', e.x), 'LINEARIZED', true);
    text(d.right ? 'straight ✓' : 'not straight yet', 590, 40, { align: 'right', font: '700 13px "Space Grotesk",sans-serif', col: d.right ? '#1e7d45' : '#c43a00' });
  }
};
