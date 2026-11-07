// Usage: node check_math.js <sim> [<sim> ...] [--shots DIR]
// Loads ../circ-<sim>.html (and any ab- variant), clicks every mode and every option choice, pushes every slider to
// min and max, and reports: page errors, leftover TEX/§ placeholders, math wider than the work panel, modes with no math.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), si = args.indexOf('--shots'), shots = si >= 0 ? args.splice(si, 2)[1] : null;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
  let errs = []; p.on('pageerror', e => errs.push(e.message));
  const files = []; for (const s of args){ files.push('circ-' + s + '.html'); const ab = path.join(__dirname, '..', 'circ-ab-' + s + '.html'); if (fs.existsSync(ab)) files.push('circ-ab-' + s + '.html'); }
  let bad = 0;
  for (const f of files){
    errs = []; const probs = [];
    await p.goto('file://' + path.join(__dirname, '..', f)); await p.waitForTimeout(300);
    const check = async (where) => {
      await p.waitForTimeout(120);
      const r = await p.evaluate(() => { const w = document.getElementById('work'); if (!w) return { none: true };
        const ms = [...w.querySelectorAll('math')]; const cw = w.clientWidth - 20;
        return { n: ms.length, wide: ms.filter(m => m.scrollWidth > cw + 2 && m.getBoundingClientRect().width > 0).map(m => m.textContent.slice(0, 60)), left: /TEX`|§\d+§|\$\{/.test(w.innerHTML), nan: /NaN|undefined/.test(w.textContent) }; });
      if (r.none) return;
      if (r.left) probs.push(where + ': leftover TEX/placeholder');
      if (r.nan) probs.push(where + ': NaN/undefined in work');
      r.wide.forEach(t => probs.push(where + ': math wider than panel: ' + t));
      return r.n;
    };
    const segs = async () => p.$$eval('#bar .seg', ss => ss.map(s => [...s.querySelectorAll('button')].map(x => x.textContent)));
    const modes = (await segs())[0] || [];
    const noMath = [];
    for (const m of (modes.length ? modes : [null])){
      if (m) await p.click('#bar .seg:first-child button:text-is("' + m.replace(/"/g, '\\"') + '")').catch(() => {});
      const n = await check(m || 'default'); if (n === 0) noMath.push(m);
      if (shots){ fs.mkdirSync(shots, { recursive: true }); await p.screenshot({ path: path.join(shots, f.replace('.html', '') + '__' + (m || 'default').replace(/[^a-z0-9]+/gi, '_') + '.png') }); }
      const all = await segs();
      for (let k = 1; k < all.length; k++) for (const c of all[k]){ await p.click('#bar .seg:nth-child(' + (k + 1) + ') button:text-is("' + c.replace(/"/g, '\\"') + '")').catch(() => {}); await check((m || '') + ' / ' + c); }
      const nr = await p.$$eval('input[type=range]', r => r.length);
      for (let i = 0; i < nr; i++) for (const end of ['min', 'max']){ await p.evaluate(([i, end]) => { const r = document.querySelectorAll('input[type=range]')[i]; r.value = r[end]; r.dispatchEvent(new Event('input', { bubbles: true })); }, [i, end]); await check((m || '') + ' slider' + i + '=' + end); }
      await p.goto('file://' + path.join(__dirname, '..', f)); await p.waitForTimeout(250);
    }
    if (noMath.length) probs.push('modes with no math: ' + noMath.join(', '));
    errs = [...new Set(errs)]; errs.forEach(e => probs.push('PAGE ERROR: ' + e));
    const uniq = [...new Set(probs)];
    console.log((uniq.length ? 'FAIL ' : 'ok   ') + f + (uniq.length ? '\n  - ' + uniq.slice(0, 15).join('\n  - ') : ''));
    if (uniq.length) bad++;
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
