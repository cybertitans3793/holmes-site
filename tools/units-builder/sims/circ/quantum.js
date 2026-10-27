// Matter Waves & Compton Scattering (AP 15.1, 15.6; IB E.2 HL): de Broglie wavelength λ = h/p with electron diffraction (and why a baseball doesn't diffract), and Compton scattering as a 2-D momentum collision between a photon and an electron.
const HJ = 6.63e-34, ME = 9.11e-31, MN = 1.675e-27, QE = 1.6e-19, DCRY = 0.213e-9;
const SIM = {
  title: 'Matter Waves & Compton Scattering',
  hint: 'λ = h/p · p = h/λ for photons',
  modes: [{ id: 'db', label: 'Matter waves (de Broglie)' }, { id: 'cs', label: 'Compton scattering' }],
  opts: [{ id: 'pt', label: 'Particle', modes: ['db'], choices: [['e', 'Electron'], ['n', 'Neutron'], ['ball', 'Baseball']] }],
  ivs(mode, opt){
    if (mode === 'cs') return [
      { id: 'li', sym: 'λ', symText: 'λ', label: 'X-ray wavelength going in', unit: 'pm', min: 5, max: 100, step: 0.5, val: 71 },
      { id: 'th', sym: 'θ', symText: 'θ', label: 'Angle the photon scatters through', unit: '°', min: 0, max: 180, step: 1, val: 90, graph: true }];
    const pt = (opt && opt.pt) || 'e';
    if (pt === 'ball') return [{ id: 'u', sym: 'v', symText: 'v', label: 'Speed of the pitch', unit: 'm/s', min: 10, max: 45, step: 0.5, val: 40, graph: true }];
    if (pt === 'n') return [{ id: 'K', sym: 'K', symText: 'K', label: 'Neutron kinetic energy', unit: 'eV', min: 0.005, max: 1, step: 0.005, val: 0.025, graph: true }];
    return [{ id: 'V', sym: 'V', symText: 'V', label: 'Accelerating voltage', unit: 'V', min: 10, max: 10000, step: 10, val: 150, graph: true }];
  },
  presets: [{ label: 'Electron at 150 V', mode: 'db', v: { V: 150 } }, { label: 'Electron at 5000 V', mode: 'db', v: { V: 5000 } }, { label: 'Backscatter (180°)', mode: 'cs', v: { th: 180 } }, { label: 'Barely deflected', mode: 'cs', v: { th: 10 } }],
  calc(v, mode, opt){
    if (mode === 'cs'){ const dl = 2.43 * (1 - Math.cos(v.th * DEG)), lo = v.li + dl, Ei = 1240 / v.li, Eo = 1240 / lo, pin = HJ / (v.li * 1e-12), pout = HJ / (lo * 1e-12);
      const pex = pin - pout * Math.cos(v.th * DEG), pey = -pout * Math.sin(v.th * DEG); return { dl, lo, Ei, Eo, Ke: Ei - Eo, pin, pout, pe: Math.hypot(pex, pey), phi: Math.atan2(-pey, pex) / DEG }; }
    const pt = opt.pt || 'e'; let m, K, p, u;
    if (pt === 'ball'){ m = 0.145; u = v.u; p = m * u; K = 0.5 * m * u * u; }
    else if (pt === 'n'){ m = MN; K = v.K * QE; p = Math.sqrt(2 * m * K); u = p / m; }
    else { m = ME; K = v.V * QE; p = Math.sqrt(2 * m * K); u = p / m; }
    const lam = HJ / p, s = lam / DCRY, th = s < 1 ? Math.asin(s) / DEG : NaN;
    return { pt, m, K, p, u, lam, th, ring: s < 1 && s > 1e-4 };
  },
  dvs(mode){
    if (mode === 'cs') return [{ id: 'dl', name: 'Change in wavelength', short: 'Δλ', sym: 'Δλ', unit: 'pm', f: d => d.dl }, { id: 'Ke', name: 'Energy given to the electron', short: 'K_e', sym: 'K<sub>e</sub>', unit: 'keV', f: d => d.Ke }];
    return [{ id: 'lam', name: 'de Broglie wavelength', short: 'λ', sym: 'λ', unit: 'nm', f: d => d.lam * 1e9 }, { id: 'p', name: 'Momentum', short: 'p', sym: 'p', unit: 'kg·m/s', f: d => d.p }];
  },
  work(v, d, mode){
    if (mode === 'cs') return '<h4>1 · The photon behaves like a particle with momentum</h4><div class="eq">p = h/λ. In: λ = ' + H.iv('li') + ', E = hc/λ = ' + H.n(d.Ei, 'keV') + ', p = ' + H.n(d.pin, 'kg·m/s') + '</div>' +
      '<h4>2 · Wavelength shift (Compton)</h4><div class="eq">Δλ = (h/m<sub>e</sub>c)(1 − cos θ) = (2.43 pm)(1 − cos ' + H.iv('th') + ') = <b>' + H.n(d.dl, 'pm') + '</b> → λ′ = ' + H.n(d.lo, 'pm') + '</div>' +
      '<h4>3 · Conservation of energy</h4><div class="eq">The photon loses energy: ' + fnum(d.Ei) + ' → ' + fnum(d.Eo) + ' keV, so the electron gets K = <b>' + H.n(d.Ke, 'keV') + '</b>.</div>' +
      '<h4>4 · Conservation of momentum (2-D)</h4><div class="eq">p<sub>in</sub> = p<sub>out</sub> + p<sub>e</sub> as vectors (see the triangle): electron p = ' + H.n(d.pe, 'kg·m/s') + ' at ' + fnum(d.phi) + '° below the original direction.</div>' +
      '<p class="note">The shift doesn’t depend on the starting λ, so it’s only noticeable for X-rays and gamma rays (λ of a few pm). A wave model can’t explain a change in wavelength that depends on angle — this convinced physicists that photons carry momentum.</p>';
    const nm = { e: 'electron', n: 'neutron', ball: 'baseball' }[d.pt];
    let s = '<h4>1 · Momentum</h4><div class="eq">' + (d.pt === 'ball' ? 'p = mv = (0.145 kg)(' + H.iv('u') + ')' : d.pt === 'n' ? 'K = ' + H.iv('K') + ' → p = √(2mK)' : 'Accelerated through ' + H.iv('V') + ': K = eV = ' + H.n(d.K, 'J') + ' → p = √(2mK)') + ' = <b>' + H.n(d.p, 'kg·m/s') + '</b> (v = ' + H.n(d.u, 'm/s') + ')</div>' +
      '<h4>2 · de Broglie wavelength</h4><div class="eq">λ = h/p = 6.63×10⁻³⁴/' + fnum(d.p) + ' = <b>' + H.n(d.lam, 'm') + '</b>' + (d.pt === 'ball' ? '' : ' = ' + H.n(d.lam * 1e9, 'nm')) + '</div>';
    if (d.pt === 'ball') return s + '<div class="bad">λ is about 10⁻³⁴ m — trillions of trillions of times smaller than a nucleus. Nothing has gaps that small, so a baseball never shows wave behaviour.</div><p class="note">Quantum effects matter when λ is comparable to the size of the system. That only happens for tiny masses.</p>';
    return s + '<h4>3 · Diffraction by a crystal</h4><div class="eq">Atoms in graphite are about 0.213 nm apart. Like a grating: sin θ ≈ λ/d = ' + fnum(d.lam / DCRY) + (d.ring ? ' → θ = <b>' + H.n(d.th, '°') + '</b>: a ring appears.' : ' → too big: no diffraction maximum.') + '</div>' +
      '<p class="note">Electrons fired through a thin crystal make rings, just like light through a grating — evidence that matter has wave properties (Davisson–Germer, G.P. Thomson). Higher voltage → more momentum → shorter λ → smaller rings. Electron microscopes use this short λ to see far more detail than light can.</p>';
  },
  draw(v, d, mode){
    if (mode === 'cs'){
      panelTitle('X-RAY PHOTON HITS A FREE ELECTRON', 10, 18);
      const cx = 170, cy = 160, wav = (x0, y0, ang, len, lam, col) => { ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= len; i += 2){ const y = 7 * Math.sin(2 * PI * i / (lam * 0.35 + 6)); i ? ctx.lineTo(i, y) : ctx.moveTo(i, y); } ctx.stroke(); ctx.restore(); };
      wav(20, cy, 0, cx - 30, v.li, '#7a3fb0'); ctx.fillStyle = '#1546d6'; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 7); ctx.fill(); text('e⁻', cx, cy + 4, { align: 'center', font: '700 10px "Space Grotesk",sans-serif', col: '#fff' });
      const a = -v.th * DEG; wav(cx + 12 * Math.cos(a), cy + 12 * Math.sin(a), a, 150, d.lo, '#c43a00'); arrow(cx, cy, cx + 110 * Math.cos(d.phi * DEG), cy + 110 * Math.sin(d.phi * DEG), '#1546d6', 'electron', { w: 3 });
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 170, cy); ctx.stroke(); ctx.setLineDash([]); text('θ = ' + v.th + '°', cx + 34, cy - 14, { font: '700 12px "Space Grotesk",sans-serif' });
      text('λ = ' + v.li + ' pm', 20, cy - 20, { font: '600 11px "IBM Plex Mono",monospace', col: '#7a3fb0' }); text('λ′ = ' + fplain(d.lo) + ' pm', 20, 300, { font: '700 13px "Space Grotesk",sans-serif', col: '#c43a00' });
      panelTitle('MOMENTUM: p_in = p_out + p_e', 395, 18);
      const s = 140 / d.pin, ox = 410, oy = 170; arrow(ox, oy, ox + d.pin * s, oy, '#7a3fb0', 'p in', { w: 3, ly: 12 });
      const px = d.pout * s * Math.cos(v.th * DEG), py = -d.pout * s * Math.sin(v.th * DEG); arrow(ox, oy, ox + px, oy + py, '#c43a00', 'p out', { w: 3 });
      arrow(ox + px, oy + py, ox + d.pin * s, oy, '#1546d6', 'p e', { w: 3, ly: -10 });
      [['E in', fplain(d.Ei) + ' keV'], ['E out', fplain(d.Eo) + ' keV'], ['K electron', fplain(d.Ke) + ' keV']].forEach(([a2, b], i) => { text(a2, 400, 250 + i * 22, { font: '600 12px "Space Grotesk",sans-serif', col: '#4a4a4a' }); text(b, 590, 250 + i * 22, { align: 'right', font: '700 12px "IBM Plex Mono",monospace' }); });
      return;
    }
    panelTitle(d.pt === 'ball' ? 'A BASEBALL THROUGH A GAP' : (d.pt === 'e' ? 'ELECTRON DIFFRACTION TUBE' : 'NEUTRONS THROUGH A CRYSTAL'), 10, 18);
    if (d.pt === 'ball'){ ctx.fillStyle = '#fff'; ctx.strokeStyle = '#c43a00'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(80, 160, 16, 0, 7); ctx.fill(); ctx.stroke(); arrow(100, 160, 180, 160, '#111', 'v', { w: 3 }); ctx.fillStyle = '#555'; ctx.fillRect(260, 40, 12, 90); ctx.fillRect(260, 190, 12, 100);
      ctx.strokeStyle = 'rgba(196,58,0,0.4)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(272, 160); ctx.lineTo(380, 160); ctx.stroke(); ctx.setLineDash([]); text('goes straight through: no spreading', 200, 310, { align: 'center', font: '700 12px "Space Grotesk",sans-serif' });
    } else {
      ctx.fillStyle = 'rgba(200,220,240,0.35)'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(30, 140); ctx.lineTo(160, 140); ctx.lineTo(330, 50); ctx.lineTo(330, 270); ctx.lineTo(160, 180); ctx.lineTo(30, 180); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#555'; ctx.fillRect(36, 148, 26, 24); ctx.fillStyle = '#c43a00'; ctx.fillRect(150, 150, 6, 20); text('crystal', 153, 196, { align: 'center', font: '600 10px "IBM Plex Mono",monospace' });
      ctx.fillStyle = 'rgba(80,255,120,0.15)'; ctx.fillRect(326, 50, 8, 220); const cy2 = 160;
      ctx.strokeStyle = '#1546d6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(62, cy2); ctx.lineTo(153, cy2); ctx.stroke();
      if (d.ring){ const R = Math.min(105, 170 * Math.tan(d.th * DEG)); ctx.strokeStyle = '#1546d6'; ctx.beginPath(); ctx.moveTo(156, cy2); ctx.lineTo(330, cy2 - R); ctx.moveTo(156, cy2); ctx.lineTo(330, cy2 + R); ctx.stroke(); ctx.fillStyle = '#2ecc71'; ctx.fillRect(326, cy2 - R - 3, 8, 6); ctx.fillRect(326, cy2 + R - 3, 8, 6); }
      ctx.fillStyle = '#2ecc71'; ctx.fillRect(326, cy2 - 3, 8, 6); text('λ = ' + fplain(d.lam * 1e9) + ' nm', 12, 310, { font: '700 13px "Space Grotesk",sans-serif' });
    }
    panelTitle('SCREEN', 395, 18);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(490, 140, 90, 0, 7); ctx.fill(); ctx.fillStyle = '#7dffa0'; ctx.beginPath(); ctx.arc(490, 140, 5, 0, 7); ctx.fill();
    if (d.ring){ const R = Math.min(85, 85 * Math.tan(d.th * DEG) / Math.tan(40 * DEG)); ctx.strokeStyle = '#7dffa0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(490, 140, R, 0, 7); ctx.stroke(); const R2 = R * 1.73; if (R2 < 88){ ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(490, 140, R2, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; } }
    text(d.ring ? 'rings: matter diffracts' : d.pt === 'ball' ? 'a single spot' : 'λ too long for this crystal', 490, 256, { align: 'center', font: '700 12px "Space Grotesk",sans-serif' });
  }
};
