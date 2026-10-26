// Mixing & Calorimetry (AP 9.3/9.5 Q = mcΔT, thermal equilibrium; IB B.1 incl. latent heat): hot metal into water, mixing water, ice in a drink (does it all melt?).
const CW = 4200, CI = 2100, LF = 3.34e5;
const METALS = { al: ['aluminum', 900], cu: ['copper', 385], fe: ['iron', 450], pb: ['lead', 130] };
const SIM = {
  title: 'Mixing & Calorimetry',
  hint: 'c<sub>water</sub> = 4200 · c<sub>ice</sub> = 2100 J/(kg·K) · L<sub>f</sub> = 3.34×10⁵ J/kg',
  modes: [{ id: 'metal', label: 'Hot metal into water' }, { id: 'mix', label: 'Mix hot and cold water' }, { id: 'ice', label: 'Ice in a drink (IB)' }],
  opts: [{ id: 'met', label: 'Metal', modes: ['metal'], choices: [['al', 'Aluminum'], ['cu', 'Copper'], ['fe', 'Iron'], ['pb', 'Lead']] }],
  ivs(mode){
    if (mode === 'mix') return [
      { id: 'm1', sym: 'm<sub>hot</sub>', symText: 'mhot', label: 'Hot water mass', unit: 'kg', min: 0.05, max: 1, step: 0.01, val: 0.2, graph: true },
      { id: 'T1', sym: 'T<sub>hot</sub>', symText: 'Thot', label: 'Hot water temperature', unit: '°C', min: 40, max: 100, step: 1, val: 80 },
      { id: 'm2', sym: 'm<sub>cold</sub>', symText: 'mcold', label: 'Cold water mass', unit: 'kg', min: 0.05, max: 1, step: 0.01, val: 0.3 },
      { id: 'T2', sym: 'T<sub>cold</sub>', symText: 'Tcold', label: 'Cold water temperature', unit: '°C', min: 0, max: 30, step: 1, val: 15 }];
    if (mode === 'ice') return [
      { id: 'mi', sym: 'm<sub>ice</sub>', symText: 'mice', label: 'Ice mass', unit: 'kg', min: 0.01, max: 0.2, step: 0.005, val: 0.05, graph: true },
      { id: 'Ti', sym: 'T<sub>ice</sub>', symText: 'Tice', label: 'Ice starting temperature', unit: '°C', min: -10, max: 0, step: 1, val: -5 },
      { id: 'md', sym: 'm<sub>drink</sub>', symText: 'mdrink', label: 'Drink mass (treat as water)', unit: 'kg', min: 0.1, max: 0.5, step: 0.01, val: 0.25 },
      { id: 'Td', sym: 'T<sub>drink</sub>', symText: 'Tdrink', label: 'Drink starting temperature', unit: '°C', min: 15, max: 40, step: 1, val: 25 }];
    return [
      { id: 'mm', sym: 'm<sub>metal</sub>', symText: 'mmetal', label: 'Metal mass', unit: 'kg', min: 0.05, max: 1, step: 0.01, val: 0.2 },
      { id: 'Tm', sym: 'T<sub>metal</sub>', symText: 'Tmetal', label: 'Metal temperature (from boiling water)', unit: '°C', min: 50, max: 200, step: 1, val: 100 },
      { id: 'mw', sym: 'm<sub>water</sub>', symText: 'mwater', label: 'Water mass', unit: 'kg', min: 0.05, max: 1, step: 0.01, val: 0.3, graph: true },
      { id: 'Tw', sym: 'T<sub>water</sub>', symText: 'Twater', label: 'Water temperature', unit: '°C', min: 5, max: 30, step: 1, val: 20 },
      { id: 'Cc', sym: 'C<sub>cup</sub>', symText: 'Ccup', label: 'Heat capacity of the cup (0 = ideal)', unit: 'J/K', min: 0, max: 400, step: 10, val: 0 }];
  },
  presets: [{ label: 'Equal masses', mode: 'mix', v: { m1: 0.3, m2: 0.3 } }, { label: 'Lots of ice', mode: 'ice', v: { mi: 0.15 } }, { label: 'Real cup (absorbs heat)', mode: 'metal', v: { Cc: 300 } }],
  calc(v, mode, opt){
    if (mode === 'mix'){ const Tf = (v.m1 * v.T1 + v.m2 * v.T2) / (v.m1 + v.m2), Q = v.m1 * CW * (v.T1 - Tf); return { Tf, Q, Ths: v.T1, Tcs: v.T2 }; }
    if (mode === 'ice'){
      const warm = v.mi * CI * (0 - v.Ti), melt = v.mi * LF, avail = v.md * CW * v.Td;
      if (avail >= warm + melt){ const Tf = (avail - warm - melt) / ((v.md + v.mi) * CW); return { all: true, Tf, warm, melt, avail, melted: v.mi, Q: v.md * CW * (v.Td - Tf), Ths: v.Td, Tcs: v.Ti }; }
      const melted = Math.max(0, (avail - warm) / LF); return { all: false, Tf: 0, warm, melt, avail, melted, Q: avail, Ths: v.Td, Tcs: v.Ti };
    }
    const [nm, cm] = METALS[opt.met || 'al'], hot = v.mm * cm, cold = v.mw * CW + v.Cc, Tf = (hot * v.Tm + cold * v.Tw) / (hot + cold), ideal = (hot * v.Tm + v.mw * CW * v.Tw) / (hot + v.mw * CW);
    const cBack = v.mw * CW * (Tf - v.Tw) / (v.mm * (v.Tm - Tf));
    return { nm, cm, Tf, ideal, Q: hot * (v.Tm - Tf), cBack, Ths: v.Tm, Tcs: v.Tw };
  },
  dvs(mode){ const l = [{ id: 'Tf', name: 'Final temperature', short: 'T_f', sym: 'T<sub>f</sub>', unit: '°C', f: d => d.Tf }, { id: 'Q', name: 'Energy transferred hot → cold', short: 'Q', sym: 'Q', unit: 'J', f: d => d.Q }];
    if (mode === 'ice') l.push({ id: 'melted', name: 'Mass of ice melted', short: 'melted', sym: 'm<sub>melted</sub>', unit: 'kg', f: d => d.melted });
    if (mode === 'metal') l.push({ id: 'cBack', name: 'c found if you ignore the cup', short: 'c_found', sym: 'c<sub>found</sub>', unit: 'J/(kg·K)', f: d => d.cBack });
    return l; },
  work(v, d, mode, opt){
    if (mode === 'mix') return '<h4>1 · Isolated system: energy lost by hot = energy gained by cold</h4><div class="eq">m<sub>h</sub>c(T<sub>h</sub> − T<sub>f</sub>) = m<sub>c</sub>c(T<sub>f</sub> − T<sub>c</sub>)</div>' +
      '<h4>2 · Same substance, so c cancels</h4><div class="eq">T<sub>f</sub> = (m<sub>h</sub>T<sub>h</sub> + m<sub>c</sub>T<sub>c</sub>)/(m<sub>h</sub> + m<sub>c</sub>) = (' + H.iv('m1') + '·' + v.T1 + ' + ' + H.iv('m2') + '·' + v.T2 + ')/' + fnum(v.m1 + v.m2) + ' = <b>' + H.n(d.Tf, '°C') + '</b></div>' +
      '<div class="eq">Q = m<sub>h</sub>c(T<sub>h</sub> − T<sub>f</sub>) = <b>' + H.n(d.Q, 'J') + '</b></div><p class="note">A mass-weighted average: the final temperature is closer to whichever has more mass.</p>';
    if (mode === 'ice'){
      let h = '<h4>1 · What the ice needs to melt completely</h4><div class="eq">Warm to 0 °C: m<sub>i</sub>c<sub>ice</sub>(0 − T<sub>i</sub>) = ' + H.n(d.warm, 'J') + ' &nbsp; Melt: m<sub>i</sub>L<sub>f</sub> = ' + H.n(d.melt, 'J') + ' &nbsp; Total ' + H.n(d.warm + d.melt, 'J') + '</div>' +
        '<h4>2 · What the drink can give before it hits 0 °C</h4><div class="eq">m<sub>d</sub>c<sub>w</sub>(T<sub>d</sub> − 0) = ' + H.n(d.avail, 'J') + '</div>';
      if (d.all) h += '<h4>3 · Enough: all the ice melts, then everything warms together</h4><div class="eq">m<sub>d</sub>c<sub>w</sub>(T<sub>d</sub> − T<sub>f</sub>) = warm + melt + m<sub>i</sub>c<sub>w</sub>(T<sub>f</sub> − 0)</div><div class="eq">T<sub>f</sub> = <b>' + H.n(d.Tf, '°C') + '</b></div>';
      else h += '<h4>3 · Not enough: it stops at 0 °C with ice left over</h4><div class="eq">Melted = (available − warm)/L<sub>f</sub> = (' + fnum(d.avail) + ' − ' + fnum(d.warm) + ')/3.34×10⁵ = <b>' + H.n(d.melted, 'kg') + '</b> of ' + H.iv('mi') + '. T<sub>f</sub> = <b>0 °C</b></div>';
      return h + '<p class="note">Always check first whether all the ice melts. If you just solve for T<sub>f</sub> and get a negative answer, the assumption was wrong. Melting needs a lot of energy: 1 kg of ice takes as much to melt as heating 1 kg of water by 80 °C.</p>';
    }
    return '<h4>1 · Energy lost by the metal = energy gained by the water' + (v.Cc ? ' and cup' : '') + '</h4><div class="eq">m<sub>m</sub>c<sub>m</sub>(T<sub>m</sub> − T<sub>f</sub>) = (m<sub>w</sub>c<sub>w</sub>' + (v.Cc ? ' + C<sub>cup</sub>' : '') + ')(T<sub>f</sub> − T<sub>w</sub>)</div>' +
      '<h4>2 · Solve for T<sub>f</sub> (' + d.nm + ', c = ' + d.cm + ' J/(kg·K))</h4><div class="eq">T<sub>f</sub> = <b>' + H.n(d.Tf, '°C') + '</b>. The water warms only a little: c<sub>water</sub> is huge.</div>' +
      '<div class="eq">Q = ' + H.n(d.Q, 'J') + ' left the metal</div>' +
      '<h4>3 · Lab version: measure T<sub>f</sub>, find c</h4><div class="eq">c<sub>m</sub> = m<sub>w</sub>c<sub>w</sub>(T<sub>f</sub> − T<sub>w</sub>)/(m<sub>m</sub>(T<sub>m</sub> − T<sub>f</sub>)) = <b>' + H.n(d.cBack, 'J/(kg·K)') + '</b>' + (v.Cc ? ' <span class="bad">too low: the cup took some energy you didn’t count</span>' : ' ✓') + '</div>' +
      '<p class="note">Sources of error FRQs ask about: heat lost to the cup and air, metal cooling while being moved, water evaporating. Each one makes c<sub>found</sub> too small.</p>';
  },
  draw(v, d, mode, opt, t, dt, A){
    if (A.s === undefined || A.reset) A.s = 0; A.s = Math.min(6, A.s + dt); if (A.s >= 6 && A.hold === undefined) A.hold = 0;
    const k = 1 - Math.exp(-A.s / 1.2), Th = d.Ths + (d.Tf - d.Ths) * k, Tc = d.Tcs + (d.Tf - d.Tcs) * k;
    panelTitle(mode === 'ice' ? 'ICE IN A DRINK' : mode === 'mix' ? 'MIX TWO WATERS' : 'HOT METAL DROPPED IN WATER', 10, 18);
    // insulated cup
    ctx.fillStyle = '#ddd'; ctx.fillRect(40, 90, 200, 200); ctx.fillStyle = mode === 'ice' ? '#e7f3ff' : '#cfe6ff'; ctx.fillRect(52, 130, 176, 150); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(40, 90, 200, 200);
    text('insulated cup', 140, 306, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    if (mode === 'metal'){ ctx.fillStyle = 'rgb(' + Math.round(150 + 100 * (Th - 20) / 180) + ',120,90)'; ctx.fillRect(110, 200, 60, 50); ctx.strokeStyle = '#111'; ctx.strokeRect(110, 200, 60, 50); text(d.nm, 140, 230, { align: 'center', font: '700 11px "Space Grotesk",sans-serif', col: '#fff' }); }
    if (mode === 'ice'){ const left = d.all ? Math.max(0, 1 - A.s / 3) : 1 - (d.melted / v.mi) * Math.min(1, A.s / 3); for (let i = 0; i < 4; i++){ const sz = 34 * Math.sqrt(Math.max(0, left)) * Math.cbrt(v.mi / 0.05) / 1.4; if (sz < 2) continue; ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.strokeStyle = '#7fc3ff'; ctx.fillRect(70 + i * 40, 136, sz, sz); ctx.strokeRect(70 + i * 40, 136, sz, sz); } }
    // thermometers
    const therm = (x, T, lab, col) => { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(x, 40, 16, 200); ctx.strokeRect(x, 40, 16, 200); const hh = 190 * Math.max(0, Math.min(1, (T + 20) / 220)); ctx.fillStyle = col; ctx.fillRect(x + 4, 236 - hh, 8, hh); ctx.beginPath(); ctx.arc(x + 8, 246, 11, 0, 7); ctx.fill(); ctx.stroke(); text(lab, x + 8, 272, { align: 'center', font: '700 10px "IBM Plex Mono",monospace' }); text(fplain(T) + '°C', x + 8, 288, { align: 'center', font: '600 10px "IBM Plex Mono",monospace', col }); };
    therm(280, Th, mode === 'metal' ? 'metal' : mode === 'ice' ? 'drink' : 'hot', '#c43a00'); therm(340, Tc, mode === 'metal' ? 'water' : mode === 'ice' ? 'ice' : 'cold', '#1546d6');
    // T vs t graph
    panelTitle('TEMPERATURE vs TIME', 395, 18);
    const gx = 405, gy = 230, gw = 180, gh = 180, Tmin = Math.min(d.Tcs, 0) - 5, Tmax = d.Ths + 5, Y = T => gy - gh * (T - Tmin) / (Tmax - Tmin);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    [[d.Ths, '#c43a00'], [d.Tcs, '#1546d6']].forEach(([T0, col]) => { ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 60; i++){ const ts = 6 * i / 60; if (ts > A.s) break; const TT = T0 + (d.Tf - T0) * (1 - Math.exp(-ts / 1.2)); i ? ctx.lineTo(gx + gw * i / 60, Y(TT)) : ctx.moveTo(gx, Y(TT)); } ctx.stroke(); });
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#1e7d45'; ctx.beginPath(); ctx.moveTo(gx, Y(d.Tf)); ctx.lineTo(gx + gw, Y(d.Tf)); ctx.stroke(); ctx.setLineDash([]);
    text('T_f = ' + fplain(d.Tf) + ' °C', gx + gw, Y(d.Tf) - 5, { align: 'right', font: '700 11px "IBM Plex Mono",monospace', col: '#1e7d45' });
    text('time', gx + gw, gy + 13, { align: 'right', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    text('energy moved: ' + fplain(d.Q) + ' J', 400, 266, { font: '700 13px "Space Grotesk",sans-serif' });
    if (mode === 'ice') text(d.all ? 'all the ice melts' : 'ice left over: ' + fplain(v.mi - d.melted) + ' kg', 400, 288, { font: '700 13px "Space Grotesk",sans-serif', col: d.all ? '#1e7d45' : '#c43a00' });
  }
};
