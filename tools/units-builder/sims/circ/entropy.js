// Entropy & Spreading (AP 9.6 qualitative; IB HL B.4: S = k ln Ω, ΔS = Q/T): a gas spreading into a vacuum, and heat flowing from hot to cold.
function rnd(i){ const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function lnC(n, k){ let s = 0; for (let i = 1; i <= k; i++) s += Math.log((n - k + i) / i); return s; }
const SIM = {
  title: 'Entropy & Spreading',
  hint: 'k<sub>B</sub> = 1.38×10⁻²³ J/K',
  modes: [{ id: 'gas', label: 'Gas spreads out' }, { id: 'heat', label: 'Heat flows hot → cold' }],
  ivs(mode){
    if (mode === 'heat') return [
      { id: 'Th', sym: 'T<sub>h</sub>', symText: 'Th', label: 'Hot object', unit: 'K', min: 310, max: 800, step: 5, val: 400, graph: true },
      { id: 'Tc', sym: 'T<sub>c</sub>', symText: 'Tc', label: 'Cold object', unit: 'K', min: 200, max: 300, step: 5, val: 300 },
      { id: 'Q', sym: 'Q', symText: 'Q', label: 'Energy that moves', unit: 'J', min: 10, max: 1000, step: 10, val: 600 }];
    return [{ id: 'N', sym: 'N', symText: 'N', label: 'Number of molecules', unit: '', min: 2, max: 60, step: 1, val: 10, graph: true, show: x => x.toFixed(0) }];
  },
  presets: [{ label: 'Just 2 molecules', mode: 'gas', v: { N: 2 } }, { label: 'Lots of molecules', mode: 'gas', v: { N: 60 } }, { label: 'Nearly the same T', mode: 'heat', v: { Th: 310, Tc: 300 } }],
  calc(v, mode){
    if (mode === 'heat'){ const dSh = -v.Q / v.Th, dSc = v.Q / v.Tc; return { dSh, dSc, dS: dSh + dSc, rev: -(dSh + dSc) }; }
    const N = Math.round(v.N), lnOmegaHalf = lnC(N, Math.floor(N / 2)), p = Math.pow(0.5, N);
    return { N, p, logp: Math.log10(p), Omega: Math.exp(lnOmegaHalf), lnO: lnOmegaHalf, total: Math.pow(2, N), S: 1.38e-23 * lnOmegaHalf };
  },
  dvs(mode){
    if (mode === 'heat') return [{ id: 'dS', name: 'Total entropy change', short: 'ΔS', sym: 'ΔS<sub>total</sub>', unit: 'J/K', f: d => d.dS }, { id: 'dSc', name: 'Entropy gained by the cold object', short: 'ΔS_c', sym: 'ΔS<sub>c</sub>', unit: 'J/K', f: d => d.dSc }];
    return [{ id: 'logp', name: 'log₁₀(chance all are back on the left)', short: 'log p', sym: 'log₁₀p', unit: '', f: d => d.logp }, { id: 'lnO', name: 'ln Ω for an even split', short: 'ln Ω', sym: 'ln Ω', unit: '', f: d => d.lnO }];
  },
  work(v, d, mode){
    if (mode === 'heat') return '<h4>1 · The hot object loses Q, the cold object gains Q</h4><div class="eq">Energy is conserved either way. The first law doesn’t say which way it goes.</div>' +
      '<h4>2 · <span style="color:#7a3fb0">IB HL</span> Entropy changes: ΔS = Q/T</h4><div class="eq">Hot: ΔS = −' + H.iv('Q') + '/' + H.iv('Th') + ' = ' + H.n(d.dSh, 'J/K') + ' &nbsp; Cold: ΔS = +' + H.iv('Q') + '/' + H.iv('Tc') + ' = ' + H.n(d.dSc, 'J/K') + '</div>' +
      '<div class="eq">Total: <b>' + H.n(d.dS, 'J/K') + '</b> &gt; 0 because the same Q is divided by a smaller T on the cold side</div>' +
      '<h4>3 · The reverse would decrease entropy</h4><div class="eq">Cold → hot on its own: ΔS = ' + H.n(d.rev, 'J/K') + ' &lt; 0. The second law forbids it for an isolated system. A fridge can do it only with work input, and dumps extra entropy outside.</div>' +
      '<p class="note">AP: describe it qualitatively. Energy spreads out; isolated systems move toward thermal equilibrium, where entropy is maximum.</p>';
    return '<h4>1 · Remove the wall: the gas spreads into the empty side</h4><div class="eq">No energy is added and no work is done, yet it never goes back on its own. Why?</div>' +
      '<h4>2 · Count the ways (microstates)</h4><div class="eq">Each molecule can be left or right: 2<sup>N</sup> = ' + H.n(d.total) + ' arrangements. All on the left: just 1.</div>' +
      '<div class="eq">Chance they’re all back on the left at any moment = (½)<sup>N</sup> = <b>' + H.n(d.p) + '</b></div>' +
      '<div class="eq">Even split: Ω = ' + H.n(d.Omega) + ' ways. The spread-out state wins by sheer numbers.</div>' +
      '<h4>3 · <span style="color:#7a3fb0">IB HL</span> Entropy S = k<sub>B</sub> ln Ω</h4><div class="eq">Even split: S = 1.38×10⁻²³ × ' + fnum(d.lnO) + ' = ' + H.n(d.S, 'J/K') + '. All on one side: S = k ln 1 = 0.</div>' +
      '<p class="note">With 10²³ molecules the chance of going back is effectively zero. That’s the second law: the entropy of an isolated system doesn’t decrease.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (mode === 'heat'){
      panelTitle('TWO OBJECTS IN CONTACT', 10, 18);
      if (A.s === undefined || A.reset) A.s = 0; A.s = Math.min(1, A.s + dt / 4);
      const col = T => { const x = Math.max(0, Math.min(1, (T - 250) / 250)); return 'rgb(' + Math.round(60 + 170 * x) + ',70,' + Math.round(210 - 170 * x) + ')'; };
      ctx.fillStyle = col(v.Th); ctx.fillRect(30, 90, 150, 150); ctx.fillStyle = col(v.Tc); ctx.fillRect(180, 90, 150, 150); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(30, 90, 150, 150); ctx.strokeRect(180, 90, 150, 150);
      text(v.Th + ' K', 105, 170, { align: 'center', font: '700 18px "Space Grotesk",sans-serif', col: '#fff' }); text(v.Tc + ' K', 255, 170, { align: 'center', font: '700 18px "Space Grotesk",sans-serif', col: '#fff' });
      const ph = (t * 0.7) % 1; arrow(150 + 60 * ph - 20, 70, 150 + 60 * ph + 20, 70, '#c43a00', 'Q', { w: 3 });
      text('ΔS = ' + fplain(d.dSh) + ' J/K', 105, 265, { align: 'center', font: '600 11px "IBM Plex Mono",monospace' }); text('ΔS = +' + fplain(d.dSc) + ' J/K', 255, 265, { align: 'center', font: '600 11px "IBM Plex Mono",monospace' });
      panelTitle('TOTAL ENTROPY CHANGE', 395, 18);
      const b0 = 160, sc = 80 / Math.max(Math.abs(d.dS), Math.abs(d.dSc), 0.001);
      [['hot', d.dSh, '#c43a00'], ['cold', d.dSc, '#1546d6'], ['total', d.dS, '#1e7d45']].forEach(([l, q, c], i) => { const hh = q * sc, x = 410 + i * 58; ctx.fillStyle = c; ctx.fillRect(x, Math.min(b0, b0 - hh), 34, Math.abs(hh)); text(l, x + 17, b0 + (q < 0 ? -hh + 14 : 14), { align: 'center', font: '700 11px "IBM Plex Mono",monospace' }); });
      ctx.strokeStyle = '#bbb'; ctx.beginPath(); ctx.moveTo(400, b0); ctx.lineTo(585, b0); ctx.stroke();
      text('total > 0 ✓ allowed', 400, 290, { font: '700 14px "Space Grotesk",sans-serif', col: '#1e7d45' });
      return;
    }
    const N = d.N; if (!A.p || A.N !== N || A.reset){ A.N = N; A.t0 = 0; A.p = []; for (let i = 0; i < N; i++) A.p.push({ x: 0.05 + 0.4 * rnd(i * 3 + 1), y: 0.05 + 0.9 * rnd(i * 3 + 2), a: 2 * PI * rnd(i * 3 + 3) }); A.hist = []; }
    A.t0 += dt; const open = A.t0 > 1;
    panelTitle(open ? 'WALL REMOVED' : 'ALL THE GAS STARTS ON THE LEFT', 10, 18);
    const bx = 20, by = 40, bw = 350, bh = 230; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5; ctx.strokeRect(bx, by, bw, bh);
    if (!open){ ctx.fillStyle = '#111'; ctx.fillRect(bx + bw / 2 - 2, by, 4, bh); } else { ctx.setLineDash([4, 4]); ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx + bw / 2, by); ctx.lineTo(bx + bw / 2, by + bh); ctx.stroke(); ctx.setLineDash([]); }
    let left = 0;
    A.p.forEach(p => { p.x += Math.cos(p.a) * 0.25 * dt; p.y += Math.sin(p.a) * 0.25 * dt * bw / bh;
      const xmax = open ? 0.98 : 0.48; if (p.x < 0.02 || p.x > xmax){ p.a = PI - p.a; p.x = Math.max(0.02, Math.min(xmax, p.x)); } if (p.y < 0.03 || p.y > 0.97){ p.a = -p.a; p.y = Math.max(0.03, Math.min(0.97, p.y)); }
      if (p.x < 0.5) left++; ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(bx + p.x * bw, by + p.y * bh, 5, 0, 7); ctx.fill(); });
    text('left: ' + left + '   right: ' + (N - left), 20, 296, { font: '700 14px "Space Grotesk",sans-serif' });
    // distribution of number on the left
    panelTitle('WAYS (Ω) FOR EACH SPLIT', 395, 18);
    const gx = 405, gy = 250, gw = 180, gh = 190, lnMax = lnC(N, Math.floor(N / 2));
    for (let k = 0; k <= N; k++){ const h = gh * Math.exp(lnC(N, Math.min(k, N - k)) - lnMax), x = gx + gw * k / (N + 1), w = Math.max(1, gw / (N + 1) - 1); ctx.fillStyle = k === left ? '#ff6a2b' : (k === N ? '#c43a00' : '#9aa7b8'); ctx.fillRect(x, gy - h, w, h); }
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    text('0', gx, gy + 13, { font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text(String(N), gx + gw, gy + 13, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('number on the left', gx + gw / 2, gy + 26, { align: 'center', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('orange = now', gx, 296, { font: '600 10px "IBM Plex Mono",monospace', col: '#ff6a2b' });
  }
};
