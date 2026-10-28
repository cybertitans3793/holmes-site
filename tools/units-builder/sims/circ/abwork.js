// ABP Work & energy with no angles: W = Fd, friction does negative work, net work = change in KE; lifting W = mgh; carrying sideways does no work. Original.
const fint = x => Number.isInteger(x) ? String(x) : (Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2)).replace(/\.?0+$/, '');
const SIM = {
  title: 'Work',
  hint: 'W = F × d · W_net = ΔKE',
  noGraph: true,
  modes: [{ id: 'push', label: 'Push a box across the floor' }, { id: 'lift', label: 'Lift or carry a box' }],
  opts: [{ id: 'fric', label: 'Friction', modes: ['push'], choices: [['off', 'Off (ice)'], ['on', 'On']] }, { id: 'how', label: 'You', modes: ['lift'], choices: [['lift', 'Lift it up'], ['carry', 'Carry it across the room']] }],
  ivs(mode, opt){
    if (mode === 'lift') return [{ id: 'm', sym: '', symText: 'm', label: 'Box mass', unit: 'kg', show: x => fint(x) + ' kg', min: 1, max: 30, step: 1, val: 10 },
      { id: 'h', sym: '', symText: opt.how === 'carry' ? 'd' : 'h', label: opt.how === 'carry' ? 'Distance carried' : 'Height lifted', unit: 'm', show: x => fint(x) + ' m', min: 0.5, max: 5, step: 0.5, val: 2 }];
    const L = [{ id: 'F', sym: '', symText: 'F', label: 'Your push', unit: 'N', show: x => fint(x) + ' N', min: 0, max: 100, step: 5, val: 50 },
      { id: 'd', sym: '', symText: 'd', label: 'Distance pushed', unit: 'm', show: x => fint(x) + ' m', min: 1, max: 10, step: 1, val: 4 },
      { id: 'm', sym: '', symText: 'm', label: 'Box mass', unit: 'kg', show: x => fint(x) + ' kg', min: 5, max: 40, step: 5, val: 10 }];
    if (opt.fric === 'on') L.push({ id: 'Ff', sym: '', symText: 'Ff', label: 'Friction force', unit: 'N', show: x => fint(x) + ' N', min: 5, max: 60, step: 5, val: 20 });
    return L;
  },
  presets: [{ label: '50 N, 4 m, no friction', mode: 'push', opt: { fric: 'off' }, v: { F: 50, d: 4, m: 10 } }, { label: 'Constant speed (push = friction)', mode: 'push', opt: { fric: 'on' }, v: { F: 30, d: 5, m: 20, Ff: 30 } }, { label: 'Lift 10 kg up 2 m', mode: 'lift', opt: { how: 'lift' }, v: { m: 10, h: 2 } }, { label: 'Carry it sideways', mode: 'lift', opt: { how: 'carry' }, v: { m: 10, h: 2 } }],
  calc(v, mode, opt){
    if (mode === 'lift'){ const W = v.m * 10, carry = opt.how === 'carry'; return { W, carry, work: carry ? 0 : W * v.h, PE: carry ? 0 : W * v.h }; }
    const Ff = opt.fric === 'on' ? v.Ff : 0, stuck = Ff > 0 && v.F <= Ff && v.F < Ff;
    const Wa = v.F * v.d, Wf = -Ff * v.d, Wn = Wa + Wf, KE = Math.max(0, Wn), vel = Math.sqrt(2 * KE / v.m);
    return { Ff, Wa, Wf, Wn, KE, vel, stuck, weight: v.m * 10 };
  },
  dvs(mode){ return mode === 'lift' ? [{ id: 'work', name: 'Work you do', short: 'W', sym: 'W', unit: 'J', noTag: true, f: d => d.work }] : [{ id: 'Wn', name: 'Net work', short: 'W net', sym: 'W', unit: 'J', noTag: true, f: d => d.Wn }]; },
  work(v, d, mode, opt){
    if (mode === 'lift'){
      if (d.carry) return '<h4>1 · Force and motion</h4><div class="eq">You hold the box up with ' + fint(d.W) + ' N (its weight). The box moves sideways ' + fint(v.h) + ' m.</div>' +
        '<h4>2 · Work = 0</h4><div class="eq">Your force is <b>up</b>, the motion is <b>sideways</b>. A force only does work if the object moves along the force.<br>W = <b>0 J</b></div>' +
        '<p class="note">Your arms get tired, but in physics you did no work on the box: its energy didn’t change. (A tiny push to start and stop doesn’t count here.)</p>';
      return '<h4>1 · Force needed</h4><div class="eq">To lift at a steady speed, push up with a force equal to the weight:<br>F = mg = ' + fint(v.m) + ' × 10 = <b>' + fint(d.W) + ' N</b></div>' +
        '<h4>2 · Work = force × distance</h4><div class="eq">W = F × d = ' + fint(d.W) + ' N × ' + fint(v.h) + ' m = <b>' + fint(d.work) + ' J</b></div>' +
        '<h4>3 · Where did the energy go?</h4><div class="eq">Into potential energy: PE = mgh = ' + fint(v.m) + ' × 10 × ' + fint(v.h) + ' = <b>' + fint(d.PE) + ' J</b></div>' +
        '<p class="note">Lowering the box back down, the box pushes back on you: gravity gives back the ' + fint(d.PE) + ' J.</p>';
    }
    if (d.stuck) return '<h4>1 · Does it move?</h4><div class="bad">Your push (' + fint(v.F) + ' N) is less than friction (' + fint(d.Ff) + ' N): the box doesn’t move, so d = 0 and <b>no work is done</b>.</div>';
    let s = '<h4>1 · Work done by you</h4><div class="eq">W = F × d = ' + fint(v.F) + ' N × ' + fint(v.d) + ' m = <b>' + fint(d.Wa) + ' J</b></div>';
    if (d.Ff) s += '<h4>2 · Work done by friction</h4><div class="eq">Friction pushes backward, against the motion, so its work is negative:<br>W = −' + fint(d.Ff) + ' N × ' + fint(v.d) + ' m = <b>' + fint(d.Wf) + ' J</b></div>';
    s += '<h4>' + (d.Ff ? 3 : 2) + ' · Gravity and the normal force</h4><div class="eq">They point up and down; the box moves sideways. Work = <b>0 J</b> each.</div>';
    s += '<h4>' + (d.Ff ? 4 : 3) + ' · Net work = change in kinetic energy</h4><div class="eq">W<sub>net</sub> = ' + fint(d.Wa) + (d.Ff ? ' + (' + fint(d.Wf) + ')' : '') + ' = <b>' + fint(d.Wn) + ' J</b> → the box ends with KE = ' + fint(d.KE) + ' J (starting from rest)</div>';
    s += d.Wn > 0 ? '<h4>' + (d.Ff ? 5 : 4) + ' · Final speed</h4><div class="eq">KE = ½mv² → ' + fint(d.KE) + ' = ½ × ' + fint(v.m) + ' × v² → v² = ' + fint(2 * d.KE / v.m) + ' → v = <b>' + fint(d.vel) + ' m/s</b></div>' : '<p class="note">Push = friction: the net work is zero, so the kinetic energy doesn’t change. Give it a shove to start and it slides at a <b>constant speed</b>; all your work turns into heat.</p>';
    return s;
  },
  draw(v, d, mode, opt, t){
    const floor = 230;
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
