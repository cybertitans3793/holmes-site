#!/usr/bin/env python3
"""Restyle a hand-built unit hub (P1-06, P1-07 style: .uhead/.tabs/.panel/.card/.try) into the Big Type look.
Non-destructive: adds a font link, one override <style> block and swaps the header. Safe to re-run on a newer version.
Usage: python3 bigtype_patch.py in.html out.html
"""
import re, sys

UNITS = {'P1-01': 'Newton’s First Law', 'P1-02': 'Newton’s Second Law', 'P1-03': 'Newton’s Third Law', 'P1-04': 'Motion and Forces in 2D',
         'P1-05': 'Circular Motion and Gravity', 'P1-06': 'Work, Power, and Energy', 'P1-07': 'Impulse and Momentum', 'P1-08': 'Rotation',
         'P1-09': 'Fluids', 'P1-10': 'Simple Harmonic Motion'}
FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@500;700&display=swap">'
CSS = """<style id="bigtype">
/* Big Type overrides (Holmes Sims house style) */
:root{--paper:#fafafa;--sheet:#fff;--ink:#111;--muted:#4a4a4a;--rule:#111;--grid:transparent;--accent:#111;--accent-soft:#ffe2d3;--on-accent:#fff;--tip-soft:#ffe2d3;--hot:#ff6a2b;
  --f-display:"Space Grotesk",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;--f-body:"Space Grotesk",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
body{background:var(--paper)!important;background-image:none!important;font-family:var(--f-body)}
.wrap{max-width:1240px;padding-top:18px}
.uhead{align-items:flex-end;gap:14px;margin-bottom:16px}
.uhead .uid{display:flex;align-items:flex-end;gap:16px;min-width:0}
.uhead .big{font-weight:700;font-size:clamp(64px,10vw,104px);line-height:.8;letter-spacing:-.04em;font-family:var(--f-display)}
.uhead .mono{font:700 .8rem var(--f-mono);color:var(--ink)}
.uhead h1{font-weight:700;font-size:clamp(28px,4vw,40px);line-height:1;letter-spacing:-.02em}
.uhead a.cta{display:inline-block;font-weight:700;text-decoration:none;color:var(--ink);padding:11px 16px;border:3px solid var(--ink);background:var(--hot);box-shadow:4px 4px 0 var(--ink)}
.tabs{gap:8px;margin-bottom:16px;padding:0 6px 8px 0}
.tab{border:2px solid var(--ink);border-radius:0;font-weight:700;font-size:15px;padding:10px 14px;background:#fff}
.tab b{font:700 12px var(--f-mono);color:inherit;margin-right:7px}
.tab[aria-selected="true"]{background:var(--ink);color:var(--paper);box-shadow:4px 4px 0 var(--hot)}
.tab[aria-selected="true"] b{color:inherit}
.tab:hover:not([aria-selected="true"]){background:var(--accent-soft)}
.tab:focus-visible,button:focus-visible,select:focus-visible,input:focus-visible,a:focus-visible{outline:3px solid var(--hot)!important;outline-offset:3px}
.panel{gap:18px;align-items:start}
.card{border:3px solid var(--ink);border-radius:0;box-shadow:6px 6px 0 var(--ink)}
.card.try,aside.try{background:var(--accent-soft);box-shadow:none}
.try h3{font:700 26px var(--f-display);letter-spacing:-.01em;margin:0 0 10px}
.try ol{font-size:15.5px;gap:10px;line-height:1.42}
.try .link{border-top:2px solid var(--ink);color:var(--ink);padding-top:12px;margin-top:16px}
.chip{border:2px solid var(--ink);border-radius:0;font-weight:700;background:#fff}
.chip[aria-pressed="true"]{background:var(--hot);color:var(--ink);border-color:var(--ink)}
.btn{border-radius:0;border:2px solid var(--ink);background:var(--ink);color:#fff}
.btn.ghost{background:#fff;color:var(--ink);border:2px solid var(--ink)}
.btn:hover{filter:none;background:#333}.btn.ghost:hover{background:var(--accent-soft)}
canvas{border-radius:0;border:2px solid var(--ink)}
.bars{border:2px solid var(--ink);border-radius:0}
.bars canvas{border:none}
.bars h3{font:700 .85rem var(--f-display);color:var(--ink)}
select{border:2px solid var(--ink);border-radius:0}
.msg{border-radius:0;border:2px solid var(--ink);background:var(--accent-soft)}
.phet{border-radius:0}
input[type=range],input[type=checkbox]{accent-color:var(--ink)}
</style>"""

REVIEW_JS = '''<style>.holmes-review{margin-top:28px;border:3px solid #111;background:#fff;box-shadow:6px 6px 0 #111}.holmes-review .bar{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 12px;border-bottom:3px solid #111}.holmes-review h2{margin:0;font:700 18px var(--f-display)}.holmes-review a{font:700 .8rem var(--f-mono);color:#111}.holmes-review .rf{position:relative;height:900px}.holmes-review iframe{position:absolute;inset:0;width:100%;height:100%;border:0}</style>
<script id="holmes-review">(function(){
  var u = 'https://script.google.com/a/macros/fcps.org/s/AKfycbzW6NpFGf5yjZ843WN0pDy-mzI0r1iCcBIuoJpMCEJeWwbUARiSnAC_lf2bWQeHWoGjHA/exec?unit=__UNIT__';
  var sec = document.createElement('section'); sec.className = 'holmes-review'; sec.id = 'review';
  sec.innerHTML = '<div class="bar"><h2>Practice questions</h2><a href="' + u + '" target="_blank" rel="noopener">Open in a new tab \\u2197</a></div><div class="rf"></div>';
  document.querySelector('.wrap').appendChild(sec);
  var loaded = false; function load(){ if (loaded) return; loaded = true; sec.querySelector('.rf').innerHTML = '<iframe title="Practice questions" src="' + u + '"></iframe>'; }
  document.querySelectorAll('.uhead a, .try .link').forEach(function(a){ a.href = '#review'; a.onclick = function(e){ e.preventDefault(); load(); sec.scrollIntoView({behavior:'smooth'}); }; });
  if ('IntersectionObserver' in window) new IntersectionObserver(function(es, o){ if (es.some(function(x){ return x.isIntersecting; })) { load(); o.disconnect(); } }, {rootMargin: '200px'}).observe(sec); else load();
})();</script>
'''

def patch(h):
    m = re.search(r'<title>[^<]*</title>', h)
    assert m, 'no <title>'
    if 'id="bigtype"' in h:
        h = re.sub(r'<style id="bigtype">.*?</style>', '', h, flags=re.S)
    # fonts + override css right after the page's own <style> block
    i = h.index('</style>') + len('</style>')
    h = h[:i] + '\n' + FONTS + '\n' + CSS + h[i:]
    # header
    hm = re.search(r'<div class="uhead"><div><div class="mono">(P\d-\d\d) · ([^<]+)</div><h1>[^<]*</h1></div><a ([^>]*)>([^<]*)</a></div>', h)
    if hm:
        uid, name, attrs = hm.group(1), hm.group(2), hm.group(3)
        course = 'AP Physics 1' if uid.startswith('P1') else 'AP Physics 2 / IB'
        if 'class=' not in attrs: attrs += ' class="cta"'
        new = (f'<div class="uhead"><div class="uid"><div class="big" aria-hidden="true">{uid[-2:]}</div><div><div class="mono">{course} · {uid}</div>'
               f'<h1>{UNITS.get(uid, name)}</h1></div></div><a {attrs}>Practice this unit →</a></div>')
        h = h[:hm.start()] + new + h[hm.end():]
    else:
        print('WARNING: header not found, left as is', file=sys.stderr)
    if hm and uid.startswith('P1-') and 'id="holmes-review"' not in h:
        h = h.replace('</body>', REVIEW_JS.replace('__UNIT__', uid) + '</body>') if '</body>' in h else h + REVIEW_JS.replace('__UNIT__', uid)
    h = re.sub(r'<title>(P\d-\d\d) [^<]*</title>', lambda t: f'<title>{t.group(1)} {UNITS.get(t.group(1), "")}</title>', h, count=1)
    return h

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf-8').read()
    # Copies read back from a published artifact carry a page skeleton; keep only the authored page.
    if src.startswith('<!doctype html><html><head><meta charset=utf8>') and '<title>' in src:
        src = src[src.index('<title>'):]
        src = re.sub(r'\s*</body></html>\s*$', '\n', src)
    out = patch(src)
    if not out.lstrip().lower().startswith('<!doctype'):
        out = '<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' + out + '</html>\n'
    open(sys.argv[2], 'w', encoding='utf-8').write(out)
    print('ok', sys.argv[2])
