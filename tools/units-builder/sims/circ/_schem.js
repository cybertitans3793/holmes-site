// shared schematic helpers (pasted into circuit sims by build_circ.py via //@include _schem.js)
function wire(pts, col){ ctx.strokeStyle = col || '#111'; ctx.lineWidth = 2; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); }
function resistor(x1, y1, x2, y2, lab, col){ const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, z = 36, a = (L - z) / 2;
  ctx.strokeStyle = col || '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + ux * a, y1 + uy * a);
  for (let i = 1; i <= 6; i++){ const s = a + z * i / 6 - z / 12, o = (i % 2 ? 7 : -7); ctx.lineTo(x1 + ux * s - uy * o, y1 + uy * s + ux * o); }
  ctx.lineTo(x1 + ux * (a + z), y1 + uy * (a + z)); ctx.lineTo(x2, y2); ctx.stroke();
  if (lab) text(lab, (x1 + x2) / 2 + (Math.abs(uy) > 0.5 ? 12 : 0), (y1 + y2) / 2 + (Math.abs(uy) > 0.5 ? 4 : -12), { align: Math.abs(uy) > 0.5 ? 'left' : 'center', font: '700 11px "IBM Plex Mono",monospace', col: col || '#111' }); }
function battery(x1, y1, x2, y2, lab){ // + terminal toward (x2,y2)
  const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx - ux * 4, my - uy * 4); ctx.moveTo(mx + ux * 4, my + uy * 4); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(mx + ux * 4 - uy * 13, my + uy * 4 + ux * 13); ctx.lineTo(mx + ux * 4 + uy * 13, my + uy * 4 - ux * 13); ctx.stroke();
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(mx - ux * 4 - uy * 6, my - uy * 4 + ux * 6); ctx.lineTo(mx - ux * 4 + uy * 6, my - uy * 4 - ux * 6); ctx.stroke();
  if (lab) text(lab, mx + (Math.abs(uy) > 0.5 ? -18 : 0), my + (Math.abs(uy) > 0.5 ? 4 : -18), { align: Math.abs(uy) > 0.5 ? 'right' : 'center', font: '700 11px "IBM Plex Mono",monospace' }); }
function bulb(x, y, glow, lab, off){ if (glow > 0.01 && !off){ const g = ctx.createRadialGradient(x, y, 2, x, y, 10 + 26 * glow); g.addColorStop(0, 'rgba(255,214,60,' + Math.min(1, 0.4 + glow) + ')'); g.addColorStop(1, 'rgba(255,214,60,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 10 + 26 * glow, 0, 7); ctx.fill(); }
  ctx.fillStyle = off ? '#eee' : '#fff8d6'; ctx.strokeStyle = off ? '#bbb' : '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 7, y - 7); ctx.lineTo(x + 7, y + 7); ctx.moveTo(x + 7, y - 7); ctx.lineTo(x - 7, y + 7); ctx.stroke();
  if (lab) text(lab, x + 16, y - 12, { font: '700 11px "IBM Plex Mono",monospace', col: off ? '#bbb' : '#111' }); }
function curArrow(x, y, dx, dy, lab, col){ const L = Math.hypot(dx, dy) || 1; arrow(x - dx * 9 / L, y - dy * 9 / L, x + dx * 9 / L, y + dy * 9 / L, col || '#1e7d45', null, { w: 2.5, head: 7 }); if (lab) text(lab, x + (Math.abs(dy) > 0.5 ? 8 : 0), y + (Math.abs(dy) > 0.5 ? 4 : -9), { align: Math.abs(dy) > 0.5 ? 'left' : 'center', font: '600 10px "IBM Plex Mono",monospace', col: col || '#1e7d45' }); }
function dotN(x, y){ ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.fill(); }
