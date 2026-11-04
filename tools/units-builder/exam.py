#!/usr/bin/env python3
"""Builds the two Exam Skills pages, units/EXAM-AP.html and units/EXAM-IB.html.
The Sims web app serves them like unit pages (...exec?unit=EXAM-AP); the Site's Exam Skills > AP and IB
pages embed those links. Text for the exam-format and task-verb/command-term sections is in exam/*.html.
The four practice sets stay in the Review app (?unit=XS-AP, XS-AP-FRQ, XS-IB, XS-IB-1B) on their own Site pages.
Usage:  python3 exam.py [output folder]     (default: out/)"""
import re, os, sys
D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, D)
from site_links import SITE
XS = SITE + 'exam-skills/'   # the Site pages that hold the practice sets

def split(html, mark):
    html = re.sub(r'<h3>What is in this section</h3>.*$', '', html, flags=re.S)
    i = html.index(mark)
    return html[:i], html[i:]

ap_exam, ap_terms = split(open(f'{D}/exam/ap_intro.html').read(), '<h3>Task verbs</h3>')
ib_exam, ib_terms = split(open(f'{D}/exam/ib_intro.html').read(), '<h3>Command terms</h3>')
ap_exam += '<p class="muted">Tip: the task verb tells you what earns the points. Check the <b>Task verbs</b> tab before you start the free-response practice.</p>'
ib_terms = ib_terms.replace('<p class="muted">Source:',
    '<p class="note">The guide says other words may still appear in questions (for example <i>deduce</i> or <i>evaluate</i>). They are not defined in the 2025 glossary, so read them in their plain meaning.</p><p class="muted">Source:')

CSS = r'''
:root{--paper:#f7f6f3;--ink:#111;--white:#fff;--orange:#ff6a2b;--peach:#fde1d6;--muted:#5e5a55;--line:#d9d5ce;--ok:#1f7a3d;--okbg:#dff2e4;--bad:#b3261e;--badbg:#fbe3e1;
--display:"Space Grotesk","Helvetica Neue",Arial,sans-serif;--mono:"Space Mono",ui-monospace,Menlo,monospace;--body:"IBM Plex Sans","Helvetica Neue",Arial,sans-serif}
*{box-sizing:border-box}html,body{margin:0;height:100%}
body{background:var(--paper);color:var(--ink);font-family:var(--body);font-size:16px;line-height:1.5;display:flex;flex-direction:column}
header{padding:18px 28px 0;background:var(--paper)}
.kick{font-family:var(--mono);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
h1{font-family:var(--display);font-size:clamp(2rem,5vw,3.2rem);line-height:1;letter-spacing:-.03em;margin:.15em 0 .3em}
nav{display:flex;flex-wrap:wrap;gap:8px;padding:6px 0 14px;border-bottom:2px solid var(--ink)}
nav button{font-family:var(--display);font-weight:500;font-size:.98rem;border:2px solid var(--ink);background:var(--white);color:var(--ink);padding:7px 14px;cursor:pointer;box-shadow:3px 3px 0 var(--ink)}
nav button small{font-family:var(--mono);font-size:.7rem;color:var(--muted);margin-left:6px}
nav button[aria-selected=true]{background:var(--ink);color:var(--white);box-shadow:3px 3px 0 var(--orange)}
nav button[aria-selected=true] small{color:#cfcac2}
nav button:focus-visible,nav a:focus-visible,a.tile:focus-visible{outline:3px solid var(--orange);outline-offset:2px}
nav a.navlink{font-family:var(--display);font-weight:500;font-size:.98rem;border:2px dashed var(--ink);background:var(--paper);color:var(--ink);padding:7px 14px;text-decoration:none}
nav a.navlink:hover{background:var(--white);border-style:solid}
a.tile{text-decoration:none}
button.tile{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start}
main{flex:1;min-height:0;position:relative}
.panel{position:absolute;inset:0;overflow:auto;padding:22px 28px 60px;display:none}
.panel.on{display:block}
.panel.frame{padding:0;overflow:hidden}
.panel.frame iframe{border:0;width:100%;height:100%;display:block;background:var(--paper)}
.wrap{max-width:860px}
h2{font-family:var(--display);font-size:1.6rem;letter-spacing:-.02em;margin:0 0 .4em}
h3{font-family:var(--display);font-size:1.2rem;margin:1.4em 0 .4em}
.wrap>h3:first-child,.card>h3:first-child{margin-top:0}
.tbl{overflow-x:auto}
.card{background:var(--white);border:2px solid var(--ink);box-shadow:5px 5px 0 var(--ink);padding:20px 22px;margin:0 0 22px}
table{border-collapse:collapse;width:100%;margin:8px 0;background:var(--white)}
th,td{border:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}
th{font-family:var(--mono);font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;background:#efede8}
td:first-child b{font-family:var(--display)}
ul{padding-left:22px}li{margin:6px 0}
.muted{color:var(--muted);font-size:.9rem}
.note{border-left:4px solid var(--orange);background:var(--peach);padding:10px 14px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:10px}
.tile{display:block;text-align:left;font:inherit;background:var(--white);border:2px solid var(--ink);box-shadow:4px 4px 0 var(--ink);padding:14px 16px;cursor:pointer;color:inherit}
.tile .k{font-family:var(--mono);font-size:.72rem;color:var(--muted);letter-spacing:.06em}
.tile b{display:block;font-family:var(--display);font-size:1.1rem;margin:4px 0}
.tile:hover{box-shadow:4px 4px 0 var(--orange)}
.ck{list-style:none;padding:0}.ck li{margin:8px 0}.ck input{margin-right:8px;transform:scale(1.15)}
.bad,.good{border:2px solid;padding:12px 14px;margin:10px 0}.bad{border-color:var(--bad);background:var(--badbg)}.good{border-color:var(--ok);background:var(--okbg)}
.bad h4,.good h4{margin:0 0 4px;font-family:var(--display)}
.rq{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:10px}
.rq label{display:grid;gap:4px;font-size:.92rem;color:var(--muted)}
.rq input,textarea{font:inherit;color:var(--ink);padding:8px 10px;border:2px solid var(--ink);background:var(--white);width:100%}
textarea{font-family:var(--mono);font-size:.9rem;min-height:9em}
.out{margin-top:12px;font-size:1.05rem}
canvas{width:100%;max-width:680px;height:auto;margin-top:12px;background:#fff;border:2px solid var(--ink)}
@media (max-width:600px){header{padding:14px 16px 0}.panel{padding:16px 16px 50px}}
'''

def page(kick, title, tabs):
    nav=''; panels=''; k=0
    for t in tabs:
        if 'href' in t:
            nav += f'<a class="navlink" href="{t["href"]}" target="_blank" rel="noopener">{t["label"]} <span aria-hidden="true">↗</span></a>'
        else:
            nav += f'<button role="tab" data-t="{k}" aria-selected="{"true" if k==0 else "false"}">{t["label"]}</button>'
            panels += f'<section class="panel{" on" if k==0 else ""}" data-p="{k}"><div class="wrap">{t["html"]}</div></section>'
            k += 1
    return f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&family=IBM+Plex+Sans:wght@400;600;700&display=swap">
<style>{CSS}</style></head><body>
<header><div class="kick">{kick}</div><h1>{title}</h1><nav role="tablist">{nav}</nav></header>
<main>{panels}</main>
<script>
const tabs=[...document.querySelectorAll('nav button')], panels=[...document.querySelectorAll('.panel')];
function show(i){{ tabs.forEach((b,k)=>b.setAttribute('aria-selected',k==i)); panels.forEach((p,k)=>p.classList.toggle('on',k==i));
  try{{ localStorage.setItem('xs-tab-'+document.title, i); }}catch(e){{}} }}
tabs.forEach((b,i)=>b.onclick=()=>show(i));
document.addEventListener('click',e=>{{ const g=e.target.closest('[data-go]'); if(g) show(+g.dataset.go); }});
let start=0; try{{ start=+localStorage.getItem('xs-tab-'+document.title)||0; }}catch(e){{}}
if(start>0 && start<tabs.length) show(start);
{'{IAJS}'}
</script></body></html>'''

# ---------------- AP ----------------
ap_tabs = [
 dict(label='The exam', html='<div class="card">'+ap_exam+'</div><h3>Practice</h3><div class="tiles">'
   '<a class="tile" href="'+XS+'ap-multiple-choice" target="_blank" rel="noopener"><span class="k">MULTIPLE CHOICE ↗</span><b>Task verbs and question types</b>Tell the verbs apart and recognise each free-response type.</a>'
   '<a class="tile" href="'+XS+'ap-free-response" target="_blank" rel="noopener"><span class="k">WRITTEN, SELF-MARKED ↗</span><b>Free-response practice</b>One task of each type. Write your answer, then mark it against the scoring points.</a></div>'),
 dict(label='Task verbs', html='<div class="card">'+ap_terms+'</div>'),
 dict(label='Multiple-choice practice', href=XS + 'ap-multiple-choice'),
 dict(label='Free-response practice', href=XS + 'ap-free-response'),
]

# ---------------- IB ----------------
IA_HTML = r'''
<div class="card"><h3>How it is marked</h3><p>Your IA is a report on an investigation you design and carry out. It is worth <b>20 %</b> of your IB Physics grade, and it is marked on four criteria, each out of 6 (24 marks in all). The report is at most <b>3,000 words</b>; charts, data tables, equations, calculations, references and the bibliography don’t count. Your teacher gives you the deadlines.</p>
<table><tr><th>Criterion</th><th>Marks</th><th>In one line</th></tr>
<tr><td><b>Research design</b></td><td>6</td><td>A focused question, the physics behind it, and a method someone else could repeat</td></tr>
<tr><td><b>Data analysis</b></td><td>6</td><td>Clear data with uncertainties, correct processing, and a graph that leads to a result</td></tr>
<tr><td><b>Conclusion</b></td><td>6</td><td>Answer your question with your data, and compare with accepted physics</td></tr>
<tr><td><b>Evaluation</b></td><td>6</td><td>Specific weaknesses, how they affected your result, and realistic improvements</td></tr></table></div>
<div class="card"><h3>Research design checklist</h3><ul class="ck">
<li><label><input type="checkbox"> My research question names the independent variable (with its range), the dependent variable, and the system.</label></li>
<li><label><input type="checkbox"> I explain the physics that predicts how the variables are related (an equation if there is one).</label></li>
<li><label><input type="checkbox"> I list the control variables, how I keep each one constant, and why it matters.</label></li>
<li><label><input type="checkbox"> I test at least 5 values of the independent variable, with repeats.</label></li>
<li><label><input type="checkbox"> My method is detailed enough that another student could repeat it (equipment, settings, what is measured with what).</label></li>
<li><label><input type="checkbox"> I mention any safety, ethical or environmental issues, briefly.</label></li></ul></div>
<div class="card"><h3>Data analysis checklist</h3><ul class="ck">
<li><label><input type="checkbox"> Raw data table: headings with quantities, units and uncertainties; consistent decimal places.</label></li>
<li><label><input type="checkbox"> Each reading’s uncertainty comes from the instrument: half the smallest division (analogue) or the last digit (digital).</label></li>
<li><label><input type="checkbox"> One sample calculation for each step of processing.</label></li>
<li><label><input type="checkbox"> Uncertainties are carried through: add absolute uncertainties for + and −; add percentage uncertainties for × and ÷; multiply the percentage by the power.</label></li>
<li><label><input type="checkbox"> Graph: labelled axes with units, error bars, a line of best fit, and steepest and shallowest lines.</label></li>
<li><label><input type="checkbox"> A final result with its uncertainty, e.g. g = (9.7 ± 0.2) m s<sup>−2</sup>.</label></li></ul></div>
<div class="card"><h3>Conclusion checklist</h3><ul class="ck">
<li><label><input type="checkbox"> I answer the research question directly, using my data (quote the result and its uncertainty).</label></li>
<li><label><input type="checkbox"> I describe the relationship (for example, “T² is directly proportional to L”) and support it with the graph.</label></li>
<li><label><input type="checkbox"> I compare my result with an accepted or theoretical value, and say whether it lies within my uncertainty range.</label></li>
<li><label><input type="checkbox"> I quote the percentage difference from the accepted value, and explain what it suggests (random vs systematic error).</label></li></ul></div>
<div class="card"><h3>Evaluation checklist</h3><ul class="ck">
<li><label><input type="checkbox"> I name specific weaknesses, not general ones (“parallax when reading the ruler”, not “human error”).</label></li>
<li><label><input type="checkbox"> For each weakness I say whether it is random or systematic, and how it affected my result.</label></li>
<li><label><input type="checkbox"> I suggest realistic improvements linked to each weakness (specific equipment or method changes).</label></li>
<li><label><input type="checkbox"> I suggest an extension: a related question I could investigate next.</label></li></ul></div>
<div class="card" id="rqb"><h3>Research question builder</h3><p class="muted">Fill in the boxes and check the result against the research design checklist.</p>
<div class="rq"><label>Independent variable (what you change)<input data-k="iv" placeholder="the length of a simple pendulum"></label>
<label>Range<input data-k="rg" placeholder="0.20 m to 1.00 m"></label>
<label>Dependent variable (what you measure)<input data-k="dv" placeholder="its period"></label>
<label>How you measure it<input data-k="how" placeholder="a light gate"></label></div>
<p class="out"><b>Your question:</b> <span data-out>…</span></p></div>
<div class="card"><h3>Weak and strong, side by side</h3>
<div class="bad"><h4>Weak evaluation</h4>“There was human error and the equipment wasn’t accurate. Next time I would be more careful and repeat it more.”</div>
<div class="good"><h4>Strong evaluation</h4>“The release angle was not kept the same, and larger swings slightly lengthen the period; this random variation is why the repeats spread more than the light gate’s resolution. Releasing from a fixed angle marked on a protractor would reduce it. The length was measured to the top of the bob, so every length is too short by about 1 cm (a systematic error); this explains the positive intercept on the T² graph but does not change the gradient.”</div>
<div class="bad"><h4>Weak conclusion</h4>“My value of g was 9.7 so the experiment worked.”</div>
<div class="good"><h4>Strong conclusion</h4>“The graph of T² against L is a straight line within the error bars, so T² is proportional to L, as T = 2π√(L/g) predicts. The gradient gives g = (9.7 ± 0.2) m s<sup>−2</sup>. The accepted value, 9.81 m s<sup>−2</sup>, lies within this range (a 1 % difference), so the result is consistent with theory; the small positive intercept suggests a systematic error in measuring L.”</div></div>
<div class="card" id="gt"><h3>Gradient and uncertainty tool</h3><p class="muted">Type your data, one point per line: x, y, uncertainty in y. The tool draws error bars, the line of best fit, and the steepest and shallowest lines through the first and last error bars, then gives the gradient with its uncertainty. Use it to check your own graph.</p>
<textarea data-in rows="6" spellcheck="false">0.200, 0.83, 0.10
0.400, 1.62, 0.10
0.600, 2.47, 0.10
0.800, 3.23, 0.10
1.000, 4.07, 0.10</textarea>
<div class="rq"><label>x-axis label<input data-xl value="L / m"></label><label>y-axis label<input data-yl value="T² / s²"></label></div>
<canvas data-c width="680" height="400"></canvas><p class="out" data-res></p></div>
<p class="muted">Criteria from the IB Physics guide, first assessment 2025, pp. 71–75. Uncertainty conventions as taught in class.</p>
'''

IA_JS = r'''
(function(){
 const rq=document.getElementById('rqb'); if(!rq) return;
 const v=k=>{const i=rq.querySelector('[data-k='+k+']'); return (i.value||i.placeholder).trim();};
 const upd=()=>{ rq.querySelector('[data-out]').textContent='How does '+v('iv')+' (from '+v('rg')+') affect '+v('dv')+', measured with '+v('how')+'?'; };
 rq.querySelectorAll('input').forEach(i=>i.oninput=upd); upd();
 const gt=document.getElementById('gt'), cv=gt.querySelector('canvas'), c=cv.getContext('2d'), res=gt.querySelector('[data-res]');
 function draw(){
  const pts=gt.querySelector('[data-in]').value.split('\n').map(l=>l.split(/[,\s\t]+/).filter(Boolean).map(Number)).filter(p=>p.length>=2&&p.every(n=>isFinite(n))).map(p=>({x:p[0],y:p[1],e:Math.abs(p[2]||0)})).sort((a,b)=>a.x-b.x);
  c.clearRect(0,0,cv.width,cv.height);
  if(pts.length<2){ res.textContent='Enter at least two points.'; return; }
  const n=pts.length,sx=pts.reduce((s,p)=>s+p.x,0),sy=pts.reduce((s,p)=>s+p.y,0),sxx=pts.reduce((s,p)=>s+p.x*p.x,0),sxy=pts.reduce((s,p)=>s+p.x*p.y,0);
  const m=(n*sxy-sx*sy)/(n*sxx-sx*sx), b=(sy-m*sx)/n, f=pts[0], l=pts[n-1];
  const mMax=((l.y+l.e)-(f.y-f.e))/(l.x-f.x), mMin=((l.y-l.e)-(f.y+f.e))/(l.x-f.x), bMax=(f.y-f.e)-mMax*f.x, bMin=(f.y+f.e)-mMin*f.x, dm=Math.abs(mMax-mMin)/2;
  const x0=Math.min(0,f.x), x1=l.x*1.05, ys=[0,...pts.map(p=>p.y+p.e),...pts.map(p=>p.y-p.e),b,bMax,bMin], y0=Math.min(...ys), y1=Math.max(...ys)*1.05;
  const L=64,R=20,T=16,B=52,W=cv.width-L-R,H=cv.height-T-B, X=x=>L+(x-x0)/(x1-x0)*W, Y=y=>T+H-(y-y0)/(y1-y0)*H;
  const nice=r=>{const p=Math.pow(10,Math.floor(Math.log10(r/5))),q=r/5/p;return (q<1.5?1:q<3.5?2:q<7.5?5:10)*p;};
  const ticks=(a,z)=>{const s=nice(z-a),o=[];for(let t=Math.ceil(a/s)*s;t<=z+1e-9;t+=s)o.push(+t.toPrecision(10));return o;};
  const xt=ticks(x0,x1), yt=ticks(y0,y1);
  c.strokeStyle='#e2ded7'; c.lineWidth=1; xt.forEach(t=>{c.beginPath();c.moveTo(X(t),T);c.lineTo(X(t),T+H);c.stroke();}); yt.forEach(t=>{c.beginPath();c.moveTo(L,Y(t));c.lineTo(L+W,Y(t));c.stroke();});
  c.fillStyle='#111'; c.font='13px sans-serif'; c.textAlign='center'; xt.forEach(t=>c.fillText(t,X(t),T+H+18)); c.textAlign='right'; yt.forEach(t=>c.fillText(t,L-6,Y(t)+4)); c.textAlign='center';
  c.fillText(gt.querySelector('[data-xl]').value,L+W/2,T+H+42); c.save(); c.translate(16,T+H/2); c.rotate(-Math.PI/2); c.fillText(gt.querySelector('[data-yl]').value,0,0); c.restore();
  c.strokeStyle='#111'; c.beginPath(); c.moveTo(L,T); c.lineTo(L,T+H); c.lineTo(L+W,T+H); c.stroke();
  const line=(mm,bb,dash,col)=>{c.setLineDash(dash);c.strokeStyle=col;c.lineWidth=1.8;c.beginPath();c.moveTo(X(x0),Y(mm*x0+bb));c.lineTo(X(x1),Y(mm*x1+bb));c.stroke();c.setLineDash([]);};
  line(m,b,[],'#111'); line(mMax,bMax,[7,5],'#ff6a2b'); line(mMin,bMin,[2,4],'#1f7a3d');
  c.strokeStyle='#111'; c.lineWidth=1.4; pts.forEach(p=>{c.beginPath();c.moveTo(X(p.x),Y(p.y-p.e));c.lineTo(X(p.x),Y(p.y+p.e));c.moveTo(X(p.x)-4,Y(p.y-p.e));c.lineTo(X(p.x)+4,Y(p.y-p.e));c.moveTo(X(p.x)-4,Y(p.y+p.e));c.lineTo(X(p.x)+4,Y(p.y+p.e));c.stroke();c.beginPath();c.arc(X(p.x),Y(p.y),3,0,7);c.fill();});
  const dmR=+dm.toPrecision(1), dec=dmR?Math.max(0,-Math.floor(Math.log10(dmR))):3, sig=v=>v?v.toFixed(Math.max(0,-Math.floor(Math.log10(Math.abs(v))))):'0';
  res.innerHTML='<b>Best-fit gradient:</b> '+m.toPrecision(4)+' &nbsp; <b>Steepest:</b> '+mMax.toPrecision(4)+' &nbsp; <b>Shallowest:</b> '+mMin.toPrecision(4)+'<br><b>Gradient = '+m.toFixed(dec)+' ± '+sig(dmR)+'</b> (half the difference between steepest and shallowest) &nbsp;·&nbsp; <b>y-intercept:</b> '+b.toPrecision(3)+'<br><span class="muted">Black: best fit · orange dashed: steepest · green dotted: shallowest.</span>';
 }
 gt.querySelectorAll('textarea,input').forEach(i=>i.oninput=draw); draw();
})();
'''

ib_tabs = [
 dict(label='The exam', html='<div class="card">'+ib_exam+'</div><h3>Practice and guides</h3><div class="tiles">'
   '<a class="tile" href="'+XS+'ib-multiple-choice" target="_blank" rel="noopener"><span class="k">MULTIPLE CHOICE ↗</span><b>Command terms, data skills and IA</b>Command terms, uncertainties, graphs and how the IA is marked.</a>'
   '<a class="tile" href="'+XS+'ib-paper-1b" target="_blank" rel="noopener"><span class="k">WRITTEN, SELF-MARKED ↗</span><b>Paper 1B practice</b>Real IB data-based questions. Answer, then mark yourself against the mark scheme.</a>'
   '<button class="tile" data-go="2"><span class="k">GUIDE</span><b>IA guide</b>Criteria, checklists, a research-question builder, examples and a gradient tool.</button></div>'),
 dict(label='Command terms', html='<div class="card">'+ib_terms+'</div>'),
 dict(label='IA guide', html=IA_HTML),
 dict(label='Multiple-choice practice', href=XS + 'ib-multiple-choice'),
 dict(label='Paper 1B practice', href=XS + 'ib-paper-1b'),
]

ap = page('Exam skills · AP Physics 1 and 2', 'AP exam skills', ap_tabs).replace('{IAJS}', '')
ib = page('Exam skills · IB Physics SL', 'IB exam skills', ib_tabs).replace('{IAJS}', IA_JS)
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, 'out')
os.makedirs(OUT, exist_ok=True)
for name, text in (('EXAM-AP', ap), ('EXAM-IB', ib)):
    with open(os.path.join(OUT, name + '.html'), 'w', encoding='utf-8') as f: f.write(text)
print('Wrote EXAM-AP (%d) and EXAM-IB (%d) to %s' % (len(ap), len(ib), OUT))
