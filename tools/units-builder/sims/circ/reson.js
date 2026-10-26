// Damping & Resonance (IB C.4): damped oscillations and a driven oscillator's amplitude vs driving frequency.
const SIM = {
  title: 'Damping & Resonance',
  hint: 'IB C.4',
  modes: [{ id: 'damp', label: 'Damping' }, { id: 'drive', label: 'Driven: resonance' }],
  ivs(mode){
    if (mode === 'damp') return [
      { id: 'f0', sym: 'f<sub>0</sub>', symText: 'f0', label: 'Natural frequency', unit: 'Hz', min: 0.3, max: 2, step: 0.05, val: 1 },
      { id: 'z', sym: 'ζ', symText: 'ζ', label: 'Damping (0 = none, 1 = critical)', unit: '', min: 0, max: 2, step: 0.01, val: 0.1, graph: true, show: x => x.toFixed(2) }];
    return [
      { id: 'fd', sym: 'f<sub>d</sub>', symText: 'fd', label: 'Driving frequency', unit: 'Hz', min: 0.2, max: 2, step: 0.01, val: 0.8, graph: true },
      { id: 'f0', sym: 'f<sub>0</sub>', symText: 'f0', label: 'Natural frequency', unit: 'Hz', min: 0.5, max: 1.5, step: 0.05, val: 1 },
      { id: 'z', sym: 'ζ', symText: 'ζ', label: 'Damping', unit: '', min: 0.02, max: 0.6, step: 0.01, val: 0.08, show: x => x.toFixed(2) }];
  },
  presets: [{ label: 'Light damping', mode: 'damp', v: { z: 0.05 } }, { label: 'Critical (car shocks)', mode: 'damp', v: { z: 1 } }, { label: 'Heavy', mode: 'damp', v: { z: 1.8 } }, { label: 'Drive at resonance', mode: 'drive', v: { fd: 1, f0: 1 } }],
  calc(v, mode){
    const w0 = 2 * PI * v.f0;
    if (mode === 'damp'){ const kind = v.z < 0.999 ? (v.z === 0 ? 'none' : 'under') : v.z <= 1.001 ? 'critical' : 'over', tHalf = v.z > 0 ? Math.log(2) / (v.z * w0) : Infinity, Q = v.z > 0 ? 1 / (2 * v.z) : Infinity;
      return { w0, kind, tHalf, Q, cycles: isFinite(tHalf) ? tHalf * v.f0 : Infinity }; }
    const amp = (fd, z) => { const r = fd / v.f0; return 1 / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2); };   // relative to the static stretch F0/k
    return { w0, amp, Ar: amp(v.fd, v.z), Apk: amp(v.f0 * Math.sqrt(Math.max(0, 1 - 2 * v.z * v.z)) || v.f0, v.z), r: v.fd / v.f0 };
  },
  dvs(mode){
    if (mode === 'damp') return [{ id: 'tHalf', name: 'Time for the amplitude to halve', short: 't½', sym: 't<sub>½</sub>', unit: 's', f: d => d.tHalf }, { id: 'cycles', name: 'Oscillations before it halves', short: 'cycles', sym: 'N<sub>½</sub>', unit: '', f: d => d.cycles }];
    return [{ id: 'Ar', name: 'Amplitude (× the static stretch)', short: 'A/A₀', sym: 'A/A<sub>0</sub>', unit: '', f: d => d.Ar }];
  },
  work(v, d, mode){
    if (mode === 'damp') return '<h4>1 · Damping: a resistive force (like air or oil drag) takes energy out each cycle</h4>' +
      '<div class="eq">' + ({ none: 'ζ = 0: <b>no damping</b>, the amplitude stays the same forever.', under: 'ζ < 1: <b>light (under-) damping</b>: it still oscillates at about f<sub>0</sub>, but the amplitude shrinks.', critical: 'ζ = 1: <b>critical damping</b>: back to equilibrium as fast as possible <i>without</i> overshooting.', over: 'ζ > 1: <b>heavy (over-) damping</b>: no oscillation, and it creeps back more slowly than critical.' })[d.kind] + '</div>' +
      (d.kind === 'under' ? '<div class="eq">The amplitude halves every ' + H.n(d.tHalf, 's') + ' (about ' + H.n(d.cycles) + ' oscillations).</div>' : '') +
      '<h4>2 · Energy</h4><div class="eq">E = ½kA², so when A halves, the energy drops to a quarter. The lost energy becomes thermal energy in the surroundings.</div>' +
      '<p class="note">Applications: car shock absorbers and door closers are close to critical damping; a bell or a tuning fork is very lightly damped so it rings for a long time.</p>';
    return '<h4>1 · Forced oscillation: a periodic push at the driving frequency f<sub>d</sub></h4><div class="eq">After the start-up wobble dies away, the system oscillates at f<sub>d</sub>, not at its natural frequency f<sub>0</sub>.</div>' +
      '<h4>2 · The amplitude depends on how close f<sub>d</sub> is to f<sub>0</sub></h4><div class="eq">At f<sub>d</sub>/f<sub>0</sub> = ' + H.n(d.r) + ': amplitude = <b>' + H.n(d.Ar) + '×</b> the stretch the same force would give if held steady</div>' +
      '<div class="eq"><b>Resonance</b>: when f<sub>d</sub> ≈ f<sub>0</sub>, each push adds energy in step with the motion, so the amplitude is largest (about ' + H.n(d.Apk) + '× here).</div>' +
      '<h4>3 · Damping shapes the peak</h4><div class="eq">Less damping → taller, sharper peak. More damping → lower, wider peak, shifted slightly below f<sub>0</sub>.</div>' +
      '<p class="note">Useful resonance: pushing a swing, tuning a radio, MRI. Harmful resonance: London’s Millennium Bridge swaying under footsteps (fixed by adding dampers); tall buildings use tuned mass dampers (Taipei 101’s 660-tonne pendulum) to stop wind and earthquakes from building up oscillations.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.t === undefined || A.reset) A.t = 0; A.t += dt;
    if (mode === 'damp'){
      panelTitle('DAMPED OSCILLATOR (released from x = A)', 10, 18);
      const w0 = d.w0, z = v.z, x = s => { if (z < 1){ const wd = w0 * Math.sqrt(1 - z * z); return Math.exp(-z * w0 * s) * (Math.cos(wd * s) + z / Math.sqrt(1 - z * z) * Math.sin(wd * s)); } if (Math.abs(z - 1) < 1e-3) return Math.exp(-w0 * s) * (1 + w0 * s); const r1 = -w0 * (z - Math.sqrt(z * z - 1)), r2 = -w0 * (z + Math.sqrt(z * z - 1)); return (r2 * Math.exp(r1 * s) - r1 * Math.exp(r2 * s)) / (r2 - r1); };
      const Tw = 6 / v.f0, tt = A.t % (Tw + 1), gx = 30, gw = 540, gy = 200, gh = 80, X = s => gx + gw * s / Tw, Y = q => gy - gh * q;
      ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
      if (z > 0 && z < 1){ ctx.setLineDash([4, 3]); ctx.strokeStyle = '#bbb'; [1, -1].forEach(sg => { ctx.beginPath(); for (let k = 0; k <= 100; k++){ const s = Tw * k / 100; k ? ctx.lineTo(X(s), Y(sg * Math.exp(-z * w0 * s))) : ctx.moveTo(X(s), Y(sg)); } ctx.stroke(); }); ctx.setLineDash([]); }
      ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= 400; k++){ const s = Math.min(tt, Tw) * k / 400; k ? ctx.lineTo(X(s), Y(x(s))) : ctx.moveTo(X(s), Y(x(s))); } ctx.stroke();
      // a little mass on a spring at the left
      const bx = 60, by = 80 + 30 * x(Math.min(tt, Tw)); ctx.fillStyle = '#111'; ctx.fillRect(30, 30, 60, 4); ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, 34); for (let i = 1; i < 10; i++) ctx.lineTo(bx + (i % 2 ? 6 : -6), 34 + (by - 34) * i / 10); ctx.lineTo(bx, by); ctx.stroke(); ctx.fillStyle = '#ff6a2b'; ctx.fillRect(bx - 12, by, 24, 18);
      text(({ none: 'no damping', under: 'light damping', critical: 'critical damping', over: 'heavy damping' })[d.kind], 590, 40, { align: 'right', font: '700 14px "Space Grotesk",sans-serif', col: '#c43a00' });
      text('t → ' + fplain(Tw) + ' s (6 natural periods)', gx + gw, gy + gh + 16, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    panelTitle('DRIVEN MASS ON A SPRING', 10, 18);
    const wd = 2 * PI * v.fd, amp = Math.min(d.Ar, 8), drv = 0.6 * Math.sin(wd * A.t), r = d.r, ph = Math.atan2(2 * v.z * r, 1 - r * r), xx = amp * Math.sin(wd * A.t - ph);
    const top = 40 + drv * 6, bx = 110, by = 160 + xx * 12;
    ctx.fillStyle = '#555'; ctx.fillRect(70, top - 10, 80, 10); text('motor', 160, top - 2, { font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    ctx.strokeStyle = '#7a3fb0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, top); for (let i = 1; i < 14; i++) ctx.lineTo(bx + (i % 2 ? 8 : -8), top + (by - top) * i / 14); ctx.lineTo(bx, by); ctx.stroke();
    ctx.fillStyle = '#ff6a2b'; ctx.fillRect(bx - 16, by, 32, 24); ctx.strokeStyle = '#111'; ctx.strokeRect(bx - 16, by, 32, 24);
    text('amplitude ' + fplain(d.Ar) + '×', 12, 318, { font: '700 13px "Space Grotesk",sans-serif' });
    panelTitle('AMPLITUDE vs DRIVING FREQUENCY', 230, 18);
    const gx = 250, gw = 330, gy0 = 290, gh = 240, fmax = 2, Amax = Math.min(d.amp(v.f0, 0.02) * 1.05, 26), X = f => gx + gw * f / fmax, Y = q => gy0 - gh * Math.min(q, Amax) / Amax;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy0 - gh); ctx.lineTo(gx, gy0); ctx.lineTo(gx + gw, gy0); ctx.stroke();
    [[0.04, '#ddd'], [0.15, '#ddd'], [0.4, '#ddd']].forEach(([zz, c]) => { ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = 1; k <= 300; k++){ const f = fmax * k / 300; k > 1 ? ctx.lineTo(X(f), Y(d.amp(f, zz))) : ctx.moveTo(X(f), Y(d.amp(f, zz))); } ctx.stroke(); });
    ctx.strokeStyle = COL.V; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 1; k <= 300; k++){ const f = fmax * k / 300; k > 1 ? ctx.lineTo(X(f), Y(d.amp(f, v.z))) : ctx.moveTo(X(f), Y(d.amp(f, v.z))); } ctx.stroke();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#1e7d45'; ctx.beginPath(); ctx.moveTo(X(v.f0), gy0); ctx.lineTo(X(v.f0), gy0 - gh); ctx.stroke(); ctx.setLineDash([]); text('f₀', X(v.f0) + 3, gy0 - gh + 10, { font: '700 10px "IBM Plex Mono",monospace', col: '#1e7d45' });
    ctx.fillStyle = '#c43a00'; ctx.beginPath(); ctx.arc(X(v.fd), Y(d.Ar), 5, 0, 7); ctx.fill();
    text('f_d (Hz) → 2', gx + gw, gy0 + 14, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); text('grey: other damping levels', gx + gw, gy0 - gh - 4, { align: 'right', font: '500 9px "IBM Plex Mono",monospace', col: '#888' });
  }
};
