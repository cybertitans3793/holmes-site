// Electric Power & the Electric Bill (ABP): household appliances on 120 V outlets. P = IV, energy in kilowatt-hours, monthly cost, and why plugging too much into one circuit trips the breaker.
const AP = i => APP[Math.max(0, Math.min(APP.length - 1, Math.round(i) || 0))];
const APP = [['Nothing', 0], ['LED bulb', 10], ['Phone charger', 5], ['Laptop', 60], ['TV', 100], ['Game console', 150], ['Refrigerator', 150], ['Toaster', 900], ['Microwave', 1100], ['Hair dryer', 1500], ['Space heater', 1500]];
const SIM = {
  title: 'Electric Power & the Electric Bill',
  hint: 'P = IV · E = Pt · 1 kWh = 1000 W for 1 hour · outlets: 120 V',
  modes: [{ id: 'one', label: 'One appliance' }, { id: 'ckt', label: 'One outlet circuit (15 A)' }],
  ivs(mode){
    const sh = x => APP[x][0] + (x ? ' (' + APP[x][1] + ' W)' : '');
    if (mode === 'ckt') return [1, 2, 3].map(i => ({ id: 'a' + i, sym: '#' + i, symText: 'app' + i, label: 'Plugged in #' + i, unit: '', min: 0, max: APP.length - 1, step: 1, val: [8, 4, 0][i - 1], show: sh }));
    return [{ id: 'k', sym: '', symText: 'appliance', label: 'Appliance', unit: '', min: 1, max: APP.length - 1, step: 1, val: 4, show: sh },
      { id: 'h', sym: 't', symText: 'hours', label: 'Hours used per day', unit: 'h', min: 0.5, max: 24, step: 0.5, val: 4, graph: true },
      { id: 'r', sym: 'rate', symText: 'rate', label: 'Electricity price', unit: '¢/kWh', min: 5, max: 40, step: 1, val: 15 }];
  },
  presets: [{ label: 'TV 4 h a day', mode: 'one', v: { k: 4, h: 4 } }, { label: 'Fridge (always on)', mode: 'one', v: { k: 6, h: 24 } }, { label: 'Hair dryer 15 min', mode: 'one', v: { k: 9, h: 0.5 } }, { label: 'Breakfast overload', mode: 'ckt', v: { a1: 7, a2: 8, a3: 9 } }],
  calc(v, mode){
    if (mode === 'ckt'){ const list = [v.a1, v.a2, v.a3].map(i => AP(i)), P = list.reduce((a, x) => a + x[1], 0), I = P / 120; return { ckt: true, list, P, I, trip: I > 15 }; }
    const [nm, P] = AP(v.k), I = P / 120, kWhDay = P * v.h / 1000, kWhMonth = kWhDay * 30, cost = kWhMonth * v.r / 100;
    return { nm, P, I, kWhDay, kWhMonth, cost };
  },
  dvs(mode){
    if (mode === 'ckt') return [{ id: 'I', name: 'Total current from the outlet', short: 'I', sym: 'I', unit: 'A', f: d => d.I }];
    return [{ id: 'cost', name: 'Cost per month', short: 'cost', sym: 'cost', unit: '$', f: d => d.cost }, { id: 'kWhMonth', name: 'Energy per month', short: 'E', sym: 'E', unit: 'kWh', f: d => d.kWhMonth }];
  },
  work(v, d, mode){
    if (mode === 'ckt') return '<h4>1 · Outlets are in parallel</h4><div class="eq">Every appliance gets the full 120 V, and the currents add up in the wire to the breaker.</div>' +
      '<h4>2 · Current for each</h4><div class="eq">' + d.list.filter(x => x[1]).map(x => x[0] + ': I = P/V = ' + x[1] + '/120 = ' + fnum(x[1] / 120) + ' A').join('<br>') + '</div>' +
      '<h4>3 · Total</h4><div class="eq">I = ' + H.n(d.I, 'A') + ' → ' + (d.trip ? '<b>more than 15 A: the breaker trips!</b>' : 'under 15 A: OK') + '</div>' +
      '<p class="note">The breaker protects the wires in the wall: too much current heats them up and could start a fire. High-power heaters (toasters, hair dryers, space heaters) use the most current.</p>';
    return '<h4>1 · Current</h4><div class="eq">P = IV → I = P/V = ' + d.P + ' W / 120 V = <b>' + H.n(d.I, 'A') + '</b></div>' +
      '<h4>2 · Energy per day</h4><div class="eq">E = Pt = (' + d.P / 1000 + ' kW)(' + H.iv('h') + ') = <b>' + H.n(d.kWhDay, 'kWh') + '</b></div>' +
      '<h4>3 · Per month (30 days)</h4><div class="eq">' + fnum(d.kWhDay) + ' × 30 = <b>' + H.n(d.kWhMonth, 'kWh') + '</b></div>' +
      '<h4>4 · Cost</h4><div class="eq">' + fnum(d.kWhMonth) + ' kWh × $' + (v.r / 100).toFixed(2) + '/kWh = <b>$' + d.cost.toFixed(2) + '</b> per month</div>' +
      '<p class="note">The power company charges for energy (kWh), not power. A kilowatt-hour is 1000 W for 1 hour = 3.6 × 10⁶ J.</p>';
  },
  draw(v, d, mode){
    const F = '"Space Grotesk",sans-serif', Mo = '"IBM Plex Mono",monospace';
    const outlet = (x, y) => { ctx.fillStyle = '#f2efe6'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.fillRect(x, y, 44, 64); ctx.strokeRect(x, y, 44, 64); ctx.fillStyle = '#111'; [y + 14, y + 38].forEach(yy => { ctx.fillRect(x + 12, yy, 4, 10); ctx.fillRect(x + 28, yy, 4, 12); }); };
    if (mode === 'ckt'){
      panelTitle('ONE KITCHEN CIRCUIT (120 V, 15 A BREAKER)', 10, 18);
      ctx.fillStyle = d.trip ? '#c43a00' : '#1e7d45'; ctx.fillRect(20, 60, 60, 80); text(d.trip ? 'TRIPPED' : 'ON', 50, 104, { align: 'center', font: '700 11px ' + F, col: '#fff' }); text('breaker', 50, 156, { align: 'center', font: '600 10px ' + F });
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(80, 100); ctx.lineTo(370, 100); ctx.stroke();
      d.list.forEach((a, i) => { const x = 130 + i * 85; ctx.beginPath(); ctx.moveTo(x + 22, 100); ctx.lineTo(x + 22, 170); ctx.stroke(); outlet(x, 170); text(a[1] ? a[0] : '(empty)', x + 22, 252, { align: 'center', font: '700 11px ' + F }); if (a[1]) text(fplain(a[1] / 120) + ' A', x + 22, 268, { align: 'center', font: '600 11px ' + Mo, col: '#1546d6' }); });
      text('total ' + fplain(d.I) + ' A', 230, 88, { align: 'center', font: '700 12px ' + Mo, col: d.trip ? '#c43a00' : '#1546d6' });
      panelTitle('THE CIRCUIT', 395, 18);
      [['total power', fplain(d.P) + ' W'], ['total current', fplain(d.I) + ' A'], ['breaker limit', '15 A'], ['result', d.trip ? 'TRIPS' : 'OK']].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px ' + F, col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px ' + Mo, col: i === 3 && d.trip ? '#c43a00' : '#111' }); });
      const bw = Math.min(1.4, d.I / 15); ctx.fillStyle = '#e8e8e8'; ctx.fillRect(400, 170, 180, 16); ctx.fillStyle = d.trip ? '#c43a00' : '#1e7d45'; ctx.fillRect(400, 170, 180 * Math.min(1, bw), 16); ctx.strokeStyle = '#111'; ctx.strokeRect(400, 170, 180, 16); text('0', 400, 200, { font: '500 9px ' + Mo }); text('15 A', 580, 200, { align: 'right', font: '500 9px ' + Mo });
      return;
    }
    panelTitle('PLUGGED INTO 120 V', 10, 18);
    outlet(40, 120); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(84, 152); ctx.bezierCurveTo(140, 152, 140, 200, 190, 200); ctx.stroke();
    ctx.fillStyle = '#e6ecf7'; ctx.fillRect(190, 150, 160, 100); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(190, 150, 160, 100); text(d.nm, 270, 196, { align: 'center', font: '700 14px ' + F }); text(d.P + ' W', 270, 216, { align: 'center', font: '600 12px ' + Mo, col: '#c43a00' });
    text('I = ' + fplain(d.I) + ' A', 130, 230, { align: 'center', font: '700 12px ' + Mo, col: '#1546d6' });
    // meter
    ctx.fillStyle = '#111'; ctx.fillRect(60, 40, 140, 44); text(d.kWhMonth.toFixed(1).padStart(7, '0'), 130, 70, { align: 'center', font: '700 18px ' + Mo, col: '#7fff9a' }); text('kWh this month', 130, 98, { align: 'center', font: '600 10px ' + F });
    panelTitle('THE BILL', 395, 18);
    [['power', d.P + ' W'], ['current', fplain(d.I) + ' A'], ['per day', fplain(d.kWhDay) + ' kWh'], ['per month', fplain(d.kWhMonth) + ' kWh'], ['price', v.r + '¢/kWh'], ['cost / month', '$' + d.cost.toFixed(2)], ['cost / year', '$' + (d.cost * 12).toFixed(2)]].forEach(([a, b], i) => { text(a, 400, 50 + i * 26, { font: '600 12px ' + F, col: '#4a4a4a' }); text(b, 590, 50 + i * 26, { align: 'right', font: '700 13px ' + Mo }); });
  }
};
