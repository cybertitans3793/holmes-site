// Magnetic field patterns (AP 12.1–12.3 / 03-9): bar magnet, current loop, solenoid, Earth's field. Field lines, a compass grid, and a compass you can drag. Original.
const MF = window._mf = window._mf || { cx: 120, cy: 90, drag: false };
const SIM = {
  title: 'Magnetic Field Patterns',
  hint: 'outside a magnet: N → S · compass north end points along B',
  noGraph: true,
  modes: [{ id: 'bar', label: 'Bar magnet' }, { id: 'loop', label: 'Current loop' }, { id: 'sol', label: 'Solenoid' }, { id: 'earth', label: 'Earth' }],
  opts: [{ id: 'view', label: 'Show', choices: [['lines', 'Field lines'], ['grid', 'Compass grid'], ['both', 'Both']] }],
  ivs(mode){
    if (mode === 'bar') return [{ id: 'flip', sym: '', symText: 'flip', label: 'Which way the magnet faces', unit: '', show: x => x ? 'N on the left' : 'N on the right', min: 0, max: 1, step: 1, val: 0 }];
    if (mode === 'earth') return [{ id: 'lat', sym: '', symText: 'lat', label: 'Compass latitude (drag up for north)', unit: '°', show: x => Math.abs(x) + '° ' + (x > 0 ? 'N' : x < 0 ? 'S' : '(equator)'), min: -80, max: 80, step: 5, val: 40 }];
    const L = [{ id: 'I', sym: 'I', symText: 'I', label: 'Current (+ = out of the page on top)', unit: 'A', min: -5, max: 5, step: 1, val: 3 }];
    if (mode === 'sol') L.push({ id: 'n', sym: 'N', symText: 'N', label: 'Number of turns shown', unit: '', min: 4, max: 12, step: 1, val: 8 });
    return L;
  },
  calc(v, mode){
    const cx = 200, cy = 171; let src = [], body = null;
    if (mode === 'bar'){ const s = v.flip ? -1 : 1; src = [{ k: 'm', x: cx + 52 * s, y: cy, q: 1 }, { k: 'm', x: cx - 52 * s, y: cy, q: -1 }]; body = { x0: cx - 66, x1: cx + 66, y0: cy - 15, y1: cy + 15, nRight: s > 0 }; }
    else if (mode === 'loop'){ src = [{ k: 'w', x: cx, y: cy - 55, I: v.I }, { k: 'w', x: cx, y: cy + 55, I: -v.I }]; }
    else if (mode === 'sol'){ const n = v.n, w = 26 * (n - 1); for (let i = 0; i < n; i++){ const x = cx - w / 2 + i * 26; src.push({ k: 'w', x, y: cy - 45, I: v.I }, { k: 'w', x, y: cy + 45, I: -v.I }); } body = { sol: true, x0: cx - w / 2, x1: cx + w / 2 }; }
    else { const tl = 11 * DEG; src = [{ k: 'm', x: cx + 40 * Math.sin(tl), y: cy - 40 * Math.cos(tl), q: -1 }, { k: 'm', x: cx - 40 * Math.sin(tl), y: cy + 40 * Math.cos(tl), q: 1 }]; body = { earth: true, R: 95 }; }
    return { cx, cy, src, body };
  },
  dvs(){ return [{ id: 'x', name: '—', short: '', sym: '', unit: '', noTag: true, f: () => 0 }]; },
  work(v, d, mode){
    if (mode === 'bar') return '<h4>1 · Field lines</h4><div class="eq">Outside the magnet the field goes from <b>N to S</b>. Inside it goes from S back to N, so every line is a closed loop.</div>' +
      '<h4>2 · Compasses</h4><div class="eq">A compass needle is a tiny magnet: its north end points along the field. Lines are closest together near the poles, where the field is strongest.</div>' +
      '<h4>3 · Magnetic materials</h4><div class="eq">Iron is made of tiny regions (domains) that are each a little magnet. In a magnet most domains line up. Near a magnet, the domains in a nail line up too, so the nail is attracted.</div>' +
      '<p class="note">Cut a bar magnet in half and you get two smaller magnets, each with N and S. There are no single magnetic poles.</p>';
    if (mode === 'earth') return '<h4>1 · Earth is like a giant bar magnet</h4><div class="eq">The field comes out near the geographic <b>South</b> Pole and goes back in near the geographic <b>North</b> Pole. So the pole in the Arctic is really a magnetic <b>south</b> pole: that is why a compass’s north end points there.</div>' +
      '<h4>2 · Dip</h4><div class="eq">At the equator the field is level with the ground. Toward the poles it tips more steeply into (or out of) the ground. At ' + Math.abs(v.lat) + '° the dip is about <b>' + Math.round(Math.atan(2 * Math.tan(Math.abs(v.lat) * DEG)) / DEG) + '°</b>.</div>' +
      '<p class="note">The magnetic poles are about 11° away from the geographic poles and slowly drift. Near Maryland the horizontal part of Earth’s field is about 2 × 10⁻⁵ T.</p>';
    const out = v.I >= 0, nm = mode === 'loop' ? 'loop' : 'solenoid';
    return '<h4>1 · Right-hand rule for each wire</h4><div class="eq">Thumb along the current, fingers curl the way B circles the wire. ⊙ = out of the page (B counterclockwise), ⊗ = into the page (B clockwise).</div>' +
      '<h4>2 · Add them up</h4><div class="eq">Between the wires the fields point the same way and add, so the field inside the ' + nm + ' is strong' + (mode === 'sol' ? ' and nearly uniform' : '') + '. Here it points to the <b>' + (v.I === 0 ? '— (no current)' : out ? 'right' : 'left') + '</b>.</div>' +
      '<h4>3 · Which end is N?</h4><div class="eq">Curl your right-hand fingers with the current; your thumb points to the N end. ' + (v.I === 0 ? 'No current, no field.' : 'N is on the <b>' + (out ? 'right' : 'left') + '</b>.') + '</div>' +
      '<p class="note">Outside, a ' + nm + '’s field looks like a bar magnet’s. More current or more turns → stronger field. Flip the current to swap N and S. Put an iron core inside to make an electromagnet.</p>';
  },
  draw(v, d, mode, opt){
    const view = opt.view || 'lines', S0 = d.src; let body = d.body;
    const B = (x, y) => { let bx = 0, by = 0; for (const s of S0){ const dx = x - s.x, dy = y - s.y, r2 = dx * dx + dy * dy + 1; if (s.k === 'm'){ const r3 = r2 * Math.sqrt(r2); bx += s.q * dx / r3; by += s.q * dy / r3; } else { /* current out of page (+I): B counterclockwise on screen (y down) */ bx += s.I * dy / r2 * 0.02; by += -s.I * dx / r2 * 0.02; } }
      if (body && body.x0 !== undefined && !body.sol && x > body.x0 && x < body.x1 && y > body.y0 && y < body.y1){ return [body.nRight ? 1 : -1, 0]; }
      return [bx, by]; };
    const Braw = (x, y) => { const o = body; body = null; const r = B(x, y); body = o; return r; };
    const inMag = (x, y) => body && !body.sol && !body.earth && x > body.x0 && x < body.x1 && y > body.y0 && y < body.y1;
    panelTitle({ bar: 'BAR MAGNET', loop: 'CURRENT LOOP (SIDE VIEW)', sol: 'SOLENOID (SIDE VIEW)', earth: 'EARTH’S MAGNETIC FIELD' }[mode], 10, 18);
    ctx.save(); ctx.beginPath(); ctx.rect(12, 26, 376, 290); ctx.clip(); ctx.fillStyle = '#fbfbf8'; ctx.fillRect(12, 26, 376, 290);
    // field lines
    if (view !== 'grid'){
      const seeds = []; if (mode === 'bar' || mode === 'earth'){ const N = S0.find(s => s.q > 0), Sd = S0.find(s => s.q < 0), ang0 = Math.atan2(Sd.y - N.y, Sd.x - N.x); for (let k = 0; k < 14; k++){ const a = ang0 + PI / 7 + k * (2 * PI - 2 * PI / 7) / 13; seeds.push([N.x + 9 * Math.cos(a), N.y + 9 * Math.sin(a), 1]); const b2 = ang0 + PI + PI / 7 + k * (2 * PI - 2 * PI / 7) / 13; if (k % 2) seeds.push([Sd.x + 9 * Math.cos(b2), Sd.y + 9 * Math.sin(b2), -1]); } }
      else { for (let k = -3; k <= 3; k++) seeds.push([d.cx, d.cy + k * (mode === 'sol' ? 11 : 10), 0]); [-1, 1].forEach(sg => (mode === 'sol' ? [62, 85] : [95]).forEach(o => seeds.push([d.cx, d.cy + sg * o, 0]))); }
      ctx.strokeStyle = 'rgba(122,63,176,0.75)'; ctx.lineWidth = 1.3;
      seeds.forEach(([sx, sy, oneWay]) => { (oneWay ? [oneWay] : [1, -1]).forEach(dir => { let x = sx, y = sy; ctx.beginPath(); ctx.moveTo(x, y); let n = 0;
        for (; n < 900; n++){ const [bx, by] = Braw(x, y), m = Math.hypot(bx, by) || 1; x += dir * 2.5 * bx / m; y += dir * 2.5 * by / m; ctx.lineTo(x, y);
          if (x < 0 || x > 400 || y < 10 || y > 330) break; if (n > 3 && S0.some(s => Math.hypot(x - s.x, y - s.y) < (s.k === 'm' ? 7 : 6))) break; if (n > 40 && Math.hypot(x - sx, y - sy) < 3) break;
          if (n % 70 === 35){ ctx.stroke(); const a = Math.atan2(by, bx); ctx.fillStyle = 'rgba(122,63,176,0.9)'; ctx.beginPath(); ctx.moveTo(x + 5 * Math.cos(a), y + 5 * Math.sin(a)); ctx.lineTo(x - 4 * Math.cos(a) - 3 * Math.sin(a), y - 4 * Math.sin(a) + 3 * Math.cos(a)); ctx.lineTo(x - 4 * Math.cos(a) + 3 * Math.sin(a), y - 4 * Math.sin(a) - 3 * Math.cos(a)); ctx.fill(); ctx.beginPath(); ctx.moveTo(x, y); } }
        ctx.stroke(); }); });
    }
    // compass grid
    const needle = (x, y, len, w) => { const [bx, by] = B(x, y), a = Math.atan2(by, bx); ctx.lineWidth = w; ctx.strokeStyle = '#c43a00'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * Math.cos(a), y + len * Math.sin(a)); ctx.stroke(); ctx.strokeStyle = '#888'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * Math.cos(a), y - len * Math.sin(a)); ctx.stroke(); };
    if (view !== 'lines') for (let x = 28; x < 390; x += 30) for (let y = 40; y < 316; y += 30){ if (inMag(x, y) || S0.some(s => Math.hypot(x - s.x, y - s.y) < 14) || (body && body.earth && Math.hypot(x - d.cx, y - d.cy) < body.R)) continue; needle(x, y, 8, 2); }
    // sources
    if (mode === 'bar'){ const b = body, mid = (b.x0 + b.x1) / 2; ctx.fillStyle = b.nRight ? '#1546d6' : '#e2453c'; ctx.fillRect(b.x0, b.y0, mid - b.x0, b.y1 - b.y0); ctx.fillStyle = b.nRight ? '#e2453c' : '#1546d6'; ctx.fillRect(mid, b.y0, b.x1 - mid, b.y1 - b.y0); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
      arrow(mid - 22 * (b.nRight ? 1 : -1), b.y0 - 0.0001 + 15, mid + 22 * (b.nRight ? 1 : -1), b.y0 + 15, 'rgba(255,255,255,0.9)', null, { w: 2, head: 6 }); text(b.nRight ? 'S' : 'N', b.x0 + 14, d.cy + 5, { align: 'center', font: '700 15px "Space Grotesk",sans-serif', col: '#fff' }); text(b.nRight ? 'N' : 'S', b.x1 - 14, d.cy + 5, { align: 'center', font: '700 15px "Space Grotesk",sans-serif', col: '#fff' }); }
    else if (mode === 'earth'){ ctx.fillStyle = '#cfe3f5'; ctx.beginPath(); ctx.arc(d.cx, d.cy, body.R, 0, 7); ctx.fill(); ctx.fillStyle = '#9cc98a'; ctx.beginPath(); ctx.ellipse(d.cx - 25, d.cy - 25, 34, 22, 0.5, 0, 7); ctx.ellipse(d.cx + 30, d.cy + 30, 26, 34, -0.3, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(122,63,176,0.5)'; ctx.lineWidth = 3; const tl = 11 * DEG; arrow(d.cx - 50 * Math.sin(tl), d.cy + 50 * Math.cos(tl), d.cx + 50 * Math.sin(tl), d.cy - 50 * Math.cos(tl), 'rgba(122,63,176,0.6)', null, { w: 3, head: 8 }); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(d.cx, d.cy, body.R, 0, 7); ctx.stroke(); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(d.cx, d.cy - body.R - 12); ctx.lineTo(d.cx, d.cy + body.R + 12); ctx.stroke(); ctx.setLineDash([]);
      text('geographic N', d.cx + 6, d.cy - body.R - 6, { font: '700 10px "Space Grotesk",sans-serif' }); text('geographic S', d.cx + 6, d.cy + body.R + 16, { font: '700 10px "Space Grotesk",sans-serif' });
      const tl2 = 11 * DEG, sx2 = d.cx + body.R * Math.sin(tl2), sy2 = d.cy - body.R * Math.cos(tl2), nx2 = d.cx - body.R * Math.sin(tl2), ny2 = d.cy + body.R * Math.cos(tl2); ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(sx2, sy2, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#e2453c'; ctx.beginPath(); ctx.arc(nx2, ny2, 5, 0, 7); ctx.fill();
      text('magnetic S pole', sx2 + 8, sy2 + 12, { font: '700 9px "IBM Plex Mono",monospace', col: '#1546d6' }); text('magnetic N pole', nx2 - 8, ny2 - 6, { align: 'right', font: '700 9px "IBM Plex Mono",monospace', col: '#e2453c' }); text('inside: S → N', d.cx + 8, d.cy + 4, { font: '600 9px "IBM Plex Mono",monospace', col: '#7a3fb0' });
      // dip compass on the surface at latitude
      const la = v.lat * DEG, px = d.cx + body.R * Math.cos(la), py = d.cy - body.R * Math.sin(la); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py, 14, 0, 7); ctx.fill(); ctx.stroke(); needle(px, py, 12, 3); }
    else S0.forEach(s => { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, 7); ctx.fill(); ctx.stroke(); if (!s.I) return; if (s.I > 0){ ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(s.x, s.y, 2.5, 0, 7); ctx.fill(); } else { ctx.beginPath(); ctx.moveTo(s.x - 5, s.y - 5); ctx.lineTo(s.x + 5, s.y + 5); ctx.moveTo(s.x + 5, s.y - 5); ctx.lineTo(s.x - 5, s.y + 5); ctx.stroke(); } });
    if ((mode === 'loop' || mode === 'sol') && v.I){ const out = v.I > 0, xl = mode === 'sol' ? body.x0 - 22 : d.cx - 30, xr = mode === 'sol' ? body.x1 + 22 : d.cx + 30; text(out ? 'S' : 'N', xl, d.cy + 5, { align: 'center', font: '700 15px "Space Grotesk",sans-serif', col: out ? '#1546d6' : '#e2453c' }); text(out ? 'N' : 'S', xr, d.cy + 5, { align: 'center', font: '700 15px "Space Grotesk",sans-serif', col: out ? '#e2453c' : '#1546d6' }); }
    // draggable compass
    if (mode !== 'earth'){ ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(MF.cx, MF.cy, 16, 0, 7); ctx.fill(); ctx.stroke(); needle(MF.cx, MF.cy, 13, 3.5); text('drag me', MF.cx, MF.cy + 28, { align: 'center', font: '600 9px "IBM Plex Mono",monospace', col: '#4a4a4a' }); }
    ctx.restore();
    if (!window._mfHook){ window._mfHook = 1; const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 600 / r.width, (e.clientY - r.top) * 330 / r.height]; };
      cv.addEventListener('pointerdown', e => { const [x, y] = pos(e); if (Math.hypot(x - MF.cx, y - MF.cy) < 22){ MF.drag = true; try { cv.setPointerCapture(e.pointerId); } catch (er) {} } });
      cv.addEventListener('pointermove', e => { if (!MF.drag) return; const [x, y] = pos(e); MF.cx = Math.max(24, Math.min(376, x)); MF.cy = Math.max(40, Math.min(300, y)); });
      const up = () => { MF.drag = false; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.style.touchAction = 'none'; }
    // right panel
    panelTitle('KEY', 395, 18); const k = (y, s, c) => text(s, 400, y, { font: '600 10px "IBM Plex Mono",monospace', col: c || '#111' });
    k(46, 'red end = compass north', '#c43a00'); k(62, 'purple = field lines', '#7a3fb0');
    if (mode === 'loop' || mode === 'sol'){ k(86, '⊙ current out of page'); k(102, '⊗ current into page'); }
    if (mode === 'earth'){ const dip = Math.atan(2 * Math.tan(Math.abs(v.lat) * DEG)) / DEG; text('dip at ' + Math.abs(v.lat) + '°: ' + Math.round(dip) + '°', 400, 100, { font: '700 13px "Space Grotesk",sans-serif' }); k(118, '(needle tips ' + (v.lat >= 0 ? 'into' : 'out of') + ' the ground)'); }
  }
};
