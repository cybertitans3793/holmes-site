import sys
src, out = sys.argv[1], sys.argv[2]
h = open(src, encoding='utf-8').read()
W = 1060
css = """<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@500;700&display=swap">
<style id="holmes-embed">
:root{--ink:#111;--muted:#4a4a4a;--line:#111;--bg:#fff;--card:#fff;--accent:#111;--accent-soft:#ffe2d3;--warn:#c43a00}
html,body{height:100%;overflow:hidden;background:#fff}
body{font-family:"Space Grotesk",system-ui,sans-serif}
#holmes-app{position:absolute;left:0;top:0;width:""" + str(W) + """px;transform-origin:0 0;padding:12px 0}
header,footer{display:none}
.layout{max-width:none;padding:0 14px;grid-template-columns:minmax(0,1fr) 300px!important;gap:14px}
.stage{border:2px solid #111;border-radius:0;padding:8px}
canvas{border-radius:0}
.card{border:2px solid #111;border-radius:0;padding:10px 12px}
.card h2{font-weight:700;font-size:16px}
button{border:2px solid #111;border-radius:0;font-weight:700;font-family:inherit}
button:hover:not(:disabled){background:#ffe2d3;color:#111;border-color:#111}
button.on{background:#111;color:#fff;border-color:#111}
button.primary{background:#111;color:#fff}
.progress{border:1px solid #111;border-radius:0;background:#fff}
.progress span{background:#ff6a2b}
ol.steps li.done{color:#111}
input[type=range]{accent-color:#111}
canvas:focus-visible{box-shadow:0 0 0 3px #ff6a2b}
.panel{gap:10px}
.panel .card:nth-child(3){display:none}
ol.steps li{margin:0 0 6px;font-size:14px;line-height:1.35}
.hint{font-size:12.5px}
.toolbar .tip{font-size:12.5px;color:#4a4a4a;margin-left:6px}
</style>"""
assert h.count('</head>') == 1
h = h.replace('</head>', css + '\n</head>')
# wrap the visible page in a fixed-width box that scales to the frame
h = h.replace('<body>\n', '<body>\n<div id="holmes-app">\n', 1)
fit = """<script>(function(){var a=document.getElementById('holmes-app');function fit(){var s=Math.min(innerWidth/""" + str(W) + """,innerHeight/a.offsetHeight);a.style.transform='scale('+s+')';}addEventListener('resize',fit);addEventListener('load',fit);fit();})();</script>"""
assert h.count('<script>') == 1
h = h.replace('<script>', '</div>\n' + fit + '\n<script>', 1)
# pointer math must use the scaled size on screen, not the layout size
old = "return { x: (e.clientX - r.left) / base.s, y: (e.clientY - r.top) / base.s, sx: e.clientX - r.left, sy: e.clientY - r.top };"
assert old in h
new = "const k = canvas.clientWidth / r.width; return { x: (e.clientX - r.left) * k / base.s, y: (e.clientY - r.top) * k / base.s, sx: (e.clientX - r.left) * k, sy: (e.clientY - r.top) * k };"
h = h.replace(old, new)
h = h.replace('<button id="btnLoupe" aria-pressed="false">Magnifier</button>', '<button id="btnLoupe" aria-pressed="false">Magnifier</button>\n      <span class="tip">Drag the ruler by its body. Use the Magnifier to read it to 0.1 cm.</span>')
h = h.replace('<title>Drawing Ellipses Lab</title>', "<title>Kepler's First Law: Drawing Ellipses</title>")
open(out, 'w', encoding='utf-8').write(h)
print('ok')
