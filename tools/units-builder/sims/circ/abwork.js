// ABP Work & energy with no angles: W = Fd, friction does negative work, net work = change in KE; lifting W = mgh; carrying sideways does no work. Original.
const fint = x => Number.isInteger(x) ? String(x) : (Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2)).replace(/\.?0+$/, '');
const SIM = {
  title: 'Work',
  hint: 'W = F × d · W_net = ΔKE',
  noGraph: true,
  modes: [{ id: 'push', label: 'Push a box across the floor' }, { id: 'lift', label: 'Lift or carry a box' }, { id: 'stop', label: 'Stopping a car' }],
  opts: [{ id: 'fric', label: 'Friction', modes: ['push'], choices: [['off', 'Off (ice)'], ['on', 'On']] }, { id: 'how', label: 'You', modes: ['lift'], choices: [['lift', 'Lift it up'], ['carry', 'Carry it across the room']] }],
  ivs(mode, opt){
    if (mode === 'stop') return [{ id: 'm', sym: '', symText: 'm', label: 'Car mass', unit: 'kg', show: x => fint(x) + ' kg', min: 600, max: 2400, step: 100, val: 1200 },
      { id: 'v', sym: '', symText: 'v', label: 'Speed when the brakes go on', unit: 'm/s', show: x => fint(x) + ' m/s', min: 5, max: 40, step: 1, val: 15 },
      { id: 'Ff', sym: '', symText: 'Ff', label: 'Friction (braking) force', unit: 'N', show: x => fint(x) + ' N', min: 1000, max: 12000, step: 200, val: 5400 }];
    if (mode === 'lift') return [{ id: 'm', sym: '', symText: 'm', label: 'Box mass', unit: 'kg', show: x => fint(x) + ' kg', min: 1, max: 30, step: 1, val: 10 },
      { id: 'h', sym: '', symText: opt.how === 'carry' ? 'd' : 'h', label: opt.how === 'carry' ? 'Distance carried' : 'Height lifted', unit: 'm', show: x => fint(x) + ' m', min: 0.5, max: 5, step: 0.5, val: 2 }];
    const L = [{ id: 'F', sym: '', symText: 'F', label: 'Your push', unit: 'N', show: x => fint(x) + ' N', min: 0, max: 100, step: 5, val: 50 },
      { id: 'd', sym: '', symText: 'd', label: 'Distance pushed', unit: 'm', show: x => fint(x) + ' m', min: 1, max: 10, step: 1, val: 4 },
      { id: 'm', sym: '', symText: 'm', label: 'Box mass', unit: 'kg', show: x => fint(x) + ' kg', min: 5, max: 40, step: 5, val: 10 }];
    if (opt.fric === 'on') L.push({ id: 'Ff', sym: '', symText: 'Ff', label: 'Friction force', unit: 'N', show: x => fint(x) + ' N', min: 5, max: 60, step: 5, val: 20 });
    return L;
  },
  presets: [{ label: '50 N, 4 m, no friction', mode: 'push', opt: { fric: 'off' }, v: { F: 50, d: 4, m: 10 } }, { label: 'Constant speed (push = friction)', mode: 'push', opt: { fric: 'on' }, v: { F: 30, d: 5, m: 20, Ff: 30 } }, { label: 'Lift 10 kg up 2 m', mode: 'lift', opt: { how: 'lift' }, v: { m: 10, h: 2 } }, { label: 'Carry it sideways', mode: 'lift', opt: { how: 'carry' }, v: { m: 10, h: 2 } }, { label: 'Car at 15 m/s', mode: 'stop', v: { m: 1200, v: 15, Ff: 5400 } }, { label: 'Same car at 30 m/s', mode: 'stop', v: { m: 1200, v: 30, Ff: 5400 } }],
  calc(v, mode, opt){
    if (mode === 'stop'){ const KE = 0.5 * v.m * v.v * v.v, d = KE / v.Ff; return { KE, Wf: -KE, dist: d, mu: v.Ff / (v.m * 10), weight: v.m * 10 }; }
    if (mode === 'lift'){ const W = v.m * 10, carry = opt.how === 'carry'; return { W, carry, work: carry ? 0 : W * v.h, PE: carry ? 0 : W * v.h }; }
    const Ff = opt.fric === 'on' ? v.Ff : 0, stuck = Ff > 0 && v.F <= Ff && v.F < Ff;
    const Wa = v.F * v.d, Wf = -Ff * v.d, Wn = Wa + Wf, KE = Math.max(0, Wn), vel = Math.sqrt(2 * KE / v.m);
    return { Ff, Wa, Wf, Wn, KE, vel, stuck, weight: v.m * 10 };
  },
  dvs(mode){ if (mode === 'stop') return [{ id: 'dist', name: 'Stopping distance', short: 'd', sym: 'd', unit: 'm', noTag: true, f: d => d.dist }]; return mode === 'lift' ? [{ id: 'work', name: 'Work you do', short: 'W', sym: 'W', unit: 'J', noTag: true, f: d => d.work }] : [{ id: 'Wn', name: 'Net work', short: 'W net', sym: 'W', unit: 'J', noTag: true, f: d => d.Wn }]; },
  work(v, d, mode, opt){
    if (mode === 'stop') return '<h4>1 · Kinetic energy before braking</h4>' + TEX`\text{KE}_i = \tfrac{1}{2}mv^2` + TEX`\text{KE}_i = \tfrac{1}{2}(${M.iv('m', 1)})(${M.iv('v', 1)})^2` + TEXA`\text{KE}_i = ${M.n(d.KE, 'J')}` +
      '<h4>2 · Work done by friction</h4><p class="st">The car stops, so KE<sub>f</sub> = 0. Friction takes all of the KE away:</p>' + TEX`\text{KE}_i + W = \text{KE}_f` + TEX`${M.n(d.KE)} + W = 0` + TEXA`W = ${M.n(-d.KE, 'J')}` +
      '<h4>3 · Stopping distance</h4><p class="st">Friction’s work has size F × d, so:</p>' + TEX`d = \frac{|W|}{F_f}` + TEX`d = \frac{${M.n(d.KE)}}{${M.iv('Ff', 1)}}` + TEXA`d = ${M.n(d.dist, 'm')}` +
      '<h4>4 · Coefficient of friction</h4>' + TEX`\mu = \frac{F_f}{F_N} = \frac{F_f}{mg}` + TEX`\mu = \frac{${M.iv('Ff', 1)}}{(${M.iv('m', 1)})(10)}` + TEXA`\mu = ${M.n(d.mu)}` + (d.mu > 1 ? '<p class="st">That is higher than real tires on a dry road (about 0.7–0.9).</p>' : '') +
      '<p class="note">KE depends on v², so <b>twice the speed means 4 times the KE</b>, and with the same brakes, 4 times the stopping distance. That’s why speeding is so dangerous. The KE turns into heat in the brakes and tires.</p>';
    if (mode === 'lift'){
      if (d.carry) return '<h4>1 · Force and motion</h4><p class="st">You hold the box up with a force equal to its weight. The box moves sideways ' + H.n(v.h, 'm') + '.</p>' + TEX`F = mg` + TEX`F = (${M.iv('m', 1)})(10)` + TEXA`F = ${M.n(d.W, 'N')}` +
        '<h4>2 · Work = 0</h4><p class="st">Your force is <b>up</b>, the motion is <b>sideways</b>. A force only does work if the object moves along the force.</p>' + TEXA`W = 0\,\text{J}` +
        '<p class="note">Your arms get tired, but in physics you did no work on the box: its energy didn’t change. (A tiny push to start and stop doesn’t count here.)</p>';
      return '<h4>1 · Force needed</h4><p class="st">To lift at a steady speed, push up with a force equal to the weight:</p>' + TEX`F = mg` + TEX`F = (${M.iv('m', 1)})(10)` + TEXA`F = ${M.n(d.W, 'N')}` +
        '<h4>2 · Work = force × distance</h4>' + TEX`W = F\,d` + TEX`W = (${M.n(d.W, 'N')})(${M.iv('h')})` + TEXA`W = ${M.n(d.work, 'J')}` +
        '<h4>3 · Where did the energy go?</h4><p class="st">Into potential energy:</p>' + TEX`\text{PE} = mgh` + TEX`\text{PE} = (${M.iv('m', 1)})(10)(${M.iv('h', 1)})` + TEXA`\text{PE} = ${M.n(d.PE, 'J')}` +
        '<p class="note">Lowering the box back down, the box pushes back on you: gravity gives back the ' + H.n(d.PE, 'J') + '.</p>';
    }
    if (d.stuck) return '<h4>1 · Does it move?</h4><div class="bad">Your push (' + fint(v.F) + ' N) is less than friction (' + fint(d.Ff) + ' N): the box doesn’t move, so d = 0 and <b>no work is done</b>.</div>';
    let s = '<h4>1 · Work done by you</h4>' + TEX`W = F\,d` + TEX`W = (${M.iv('F')})(${M.iv('d')})` + TEXA`W_{\text{you}} = ${M.n(d.Wa, 'J')}`;
    if (d.Ff) s += '<h4>2 · Work done by friction</h4><p class="st">Friction pushes backward, against the motion, so its work is negative:</p>' + TEX`W = -F_f\,d` + TEX`W = -(${M.iv('Ff')})(${M.iv('d')})` + TEXA`W_{\text{friction}} = ${M.n(d.Wf, 'J')}`;
    s += '<h4>' + (d.Ff ? 3 : 2) + ' · Gravity and the normal force</h4><p class="st">They point up and down; the box moves sideways. Each does zero work:</p>' + TEXA`W = 0\,\text{J}`;
    s += '<h4>' + (d.Ff ? 4 : 3) + ' · Net work = change in kinetic energy</h4>' + (d.Ff ? TEX`W_{\text{net}} = W_{\text{you}} + W_{\text{friction}}` + TEX`W_{\text{net}} = ${M.n(d.Wa)} + ${M.p(d.Wf)}` : TEX`W_{\text{net}} = W_{\text{you}}`) + TEXA`W_{\text{net}} = ${M.n(d.Wn, 'J')}` +
      '<p class="st">The box starts from rest:</p>' + TEX`\text{KE}_i + W_{\text{net}} = \text{KE}_f` + TEX`0 + ${M.n(d.Wn)} = \text{KE}_f` + TEXA`\text{KE}_f = ${M.n(d.KE, 'J')}`;
    s += d.Wn > 0 ? '<h4>' + (d.Ff ? 5 : 4) + ' · Final speed</h4>' + TEX`\text{KE} = \tfrac{1}{2}mv^2` + TEX`v = \sqrt{\frac{2\,\text{KE}}{m}}` + TEX`v = \sqrt{\frac{2(${M.n(d.KE)})}{${M.iv('m', 1)}}}` + TEXA`v = ${M.n(d.vel, 'm/s')}` : '<p class="note">Push = friction: the net work is zero, so the kinetic energy doesn’t change. Give it a shove to start and it slides at a <b>constant speed</b>; all your work turns into heat.</p>';
    return s;
  },
  draw(v, d, mode, opt, t){
    const floor = 230;
    if (mode === 'stop'){
      panelTitle('CAR BRAKING TO A STOP', 10, 18);
      const sc = 330 / Math.max(60, d.dist), x0 = 40, T = 3, u = Math.min(1, (t % (T + 1.2)) / T), s = d.dist * (1 - (1 - u) * (1 - u)), cx = x0 + s * sc;
      ctx.fillStyle = '#555'; ctx.fillRect(12, floor, 376, 26); ctx.fillStyle = '#fff'; for (let k = 0; k < 8; k++) ctx.fillRect(20 + k * 48, floor + 12, 24, 3);
      ctx.fillStyle = '#222'; ctx.fillRect(x0 + 14, floor - 3, s * sc, 3);
      ctx.fillStyle = '#1546d6'; ctx.fillRect(cx - 4, floor - 34, 64, 22); ctx.fillRect(cx + 10, floor - 48, 34, 16); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx + 10, floor - 10, 8, 0, 7); ctx.arc(cx + 46, floor - 10, 8, 0, 7); ctx.fill();
      if (u < 1) arrow(cx + 28, floor + 40, cx + 28 - Math.min(60, v.Ff / 150), floor + 40, '#c43a00', 'Ff = ' + fint(v.Ff) + ' N', { w: 3, ly: 14 });
      ctx.strokeStyle = '#888'; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, floor - 70); ctx.lineTo(x0, floor); ctx.moveTo(x0 + d.dist * sc, floor - 70); ctx.lineTo(x0 + d.dist * sc, floor); ctx.stroke(); ctx.setLineDash([]);
      arrow(x0, floor - 76, x0 + d.dist * sc, floor - 76, '#111', 'd = ' + fint(d.dist) + ' m', { w: 1.5, head: 5, ly: -8 });
      const vnow = v.v * (1 - u); text('speed: ' + vnow.toFixed(1) + ' m/s', 14, 60, { font: '700 13px "IBM Plex Mono",monospace' });
      panelTitle('KINETIC ENERGY LEFT', 400, 18); const KEn = 0.5 * v.m * vnow * vnow, mx = 0.5 * 2400 * 40 * 40;
      ctx.fillStyle = '#e8e8e8'; ctx.fillRect(420, 50, 50, 220); ctx.fillStyle = '#ff6a2b'; const hh = 220 * Math.sqrt(KEn / mx); ctx.fillRect(420, 270 - hh, 50, hh); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(420, 50, 50, 220);
      text(fint(Math.round(KEn)) + ' J', 480, 270 - hh + 4, { font: '700 12px "IBM Plex Mono",monospace' }); text('(bar on a √ scale)', 400, 290, { font: '500 9px "IBM Plex Mono",monospace', col: '#8a8a8a' });
      text('heat made: ' + fint(Math.round(d.KE - KEn)) + ' J', 400, 312, { font: '700 11px "IBM Plex Mono",monospace', col: '#c43a00' });
      return;
    }
    if (mode === 'lift'){
      panelTitle(d.carry ? 'CARRYING THE BOX ACROSS THE ROOM' : 'LIFTING THE BOX', 10, 18);
      ctx.fillStyle = '#ccc'; ctx.fillRect(15, floor + 40, 370, 6);
      const u = (Math.sin(t * 1.4) + 1) / 2, sc = 36, bx = d.carry ? 60 + u * v.h * 55 : 180, by = d.carry ? floor - 30 : floor + 40 - 34 - u * v.h * sc;
      ctx.fillStyle = '#b8864b'; ctx.fillRect(bx - 20, by, 40, 34); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(bx - 20, by, 40, 34);
      arrow(bx, by, bx, by - 50, '#1546d6', 'F = ' + fint(d.W) + ' N', { w: 3, lx: 8 }); arrow(bx, by + 34, bx, by + 84, '#c43a00', 'mg', { w: 3, lx: 8 });
      if (d.carry){ arrow(70, floor + 70, 70 + v.h * 55, floor + 70, '#111', 'motion: sideways', { w: 2, head: 6, ly: 14 }); }
      else { ctx.strokeStyle = '#888'; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(240, floor + 40); ctx.lineTo(240, floor + 40 - v.h * sc); ctx.stroke(); ctx.setLineDash([]); text('h = ' + fint(v.h) + ' m', 248, floor + 40 - v.h * sc / 2, { font: '700 11px "IBM Plex Mono",monospace' }); }
      panelTitle('WORK DONE ON THE BOX', 400, 18);
      text(d.carry ? 'W = 0 J' : 'W = ' + fint(d.work) + ' J', 400, 70, { font: '700 22px "IBM Plex Mono",monospace', col: '#c43a00' });
      text(d.carry ? 'force ⟂ motion' : 'all of it becomes PE', 400, 96, { font: '600 11px "IBM Plex Mono",monospace', col: '#4a4a4a' });
      return;
    }
    panelTitle('PUSHING A BOX (STARTS AT REST)', 10, 18);
    ctx.fillStyle = d.Ff ? '#bfa98a' : '#cfe8f7'; ctx.fillRect(15, floor, 370, 8); text(d.Ff ? 'rough floor' : 'ice: no friction', 20, floor + 22, { font: '600 10px "IBM Plex Mono",monospace', col: '#4a4a4a' });
    const x0 = 50, x1 = 50 + v.d * 30, u = d.stuck ? 0 : ((t / 3) % 1), bx = x0 + (x1 - x0) * (d.Wn > 0 ? u * u : u);
    ctx.strokeStyle = '#888'; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, floor - 60); ctx.lineTo(x0, floor); ctx.moveTo(x1, floor - 60); ctx.lineTo(x1, floor); ctx.stroke(); ctx.setLineDash([]);
    arrow(x0, floor - 66, x1, floor - 66, '#111', 'd = ' + fint(v.d) + ' m', { w: 1.5, head: 5, ly: -8 });
    ctx.fillStyle = '#b8864b'; ctx.fillRect(bx, floor - 40, 40, 40); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(bx, floor - 40, 40, 40);
    if (v.F) arrow(bx - 4 - v.F * 0.5, floor - 20, bx - 4, floor - 20, '#1546d6', 'F', { w: 3, ly: -10 });
    if (d.Ff) arrow(bx + 20, floor + 2, bx + 20 - d.Ff * 0.5, floor + 2, '#c43a00', 'Ff', { w: 3, ly: 14 });
    panelTitle('WORK BY EACH FORCE (J)', 400, 18);
    const items = [['You', d.stuck ? 0 : d.Wa, '#1546d6'], ['Friction', d.stuck ? 0 : d.Wf, '#c43a00'], ['Gravity', 0, '#777'], ['Normal', 0, '#777'], ['NET', d.stuck ? 0 : d.Wn, '#111']];
    const mx = Math.max(100, d.Wa), z = 492, sc = 70 / mx;
    ctx.strokeStyle = '#999'; ctx.beginPath(); ctx.moveTo(z, 34); ctx.lineTo(z, 262); ctx.stroke();
    items.forEach(([n, w, c], i) => { const y = 50 + i * 46; text(n, 400, y - 4, { font: '700 11px "Space Grotesk",sans-serif' }); ctx.fillStyle = c; const L = w * sc; ctx.fillRect(Math.min(z, z + L), y, Math.abs(L) || 1, 20); text(fint(w), w < 0 ? z + L - 4 : z + Math.max(L, 0) + 4, y + 14, { align: w < 0 ? 'right' : 'left', font: '700 10px "IBM Plex Mono",monospace' }); });
    if (!d.stuck && d.Wn > 0) text('final speed: ' + fint(d.vel) + ' m/s', 400, 290, { font: '700 13px "IBM Plex Mono",monospace', col: '#c43a00' });
  }
};
