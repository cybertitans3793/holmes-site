#!/usr/bin/env python3
"""Builds the Exam Skills pages, units/EXAM-AP.html, units/EXAM-IB.html and units/EXAM-IA.html (internal assessment, content in ia/).
The Sims web app serves them like unit pages (...exec?unit=EXAM-AP); the Site's Exam Skills > AP and IB
pages embed those links. Text for the exam-format and task-verb/command-term sections is in exam/*.html.
IB Paper 1B practice stays in the Review app (?unit=XS-IB-1B) on its own hidden Site page, Exam Skills > IB Paper 1B.
Also builds units/EXAM-PE.html, the Practice Exams page: one card per exam, linking to its timed sections in the Review app.
Usage:  python3 exam.py [output folder]     (default: out/)"""
import re, os, sys
D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, D)
from site_links import SITE, REVIEW_APP
XS = SITE + 'exam-skills/'   # Site pages under Exam Skills (IB Paper 1B practice, the IA page)
PE_PAGE = SITE + 'practice-exams'   # the Practice Exams Site page (embeds EXAM-PE)
EXAMS = REVIEW_APP + '?unit=EXAMS'   # every open practice exam (Review app, FCPS sign-in)
# The practice exams themselves (College Board / IB papers) live only in the Review app, never in this repo: this page only links to them.

def split(html, mark):
    html = re.sub(r'<h3>What is in this section</h3>.*$', '', html, flags=re.S)
    i = html.index(mark)
    return html[:i], html[i:]

ap_exam, ap_terms = split(open(f'{D}/exam/ap_intro.html').read(), '<h3>Task verbs</h3>')
ib_exam, ib_terms = split(open(f'{D}/exam/ib_intro.html').read(), '<h3>Command terms</h3>')
ap_exam += '<p class="muted">Tip: the task verb tells you what earns the points. Check the <b>Task verbs</b> tab before you write free-response answers.</p>'
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
   '<a class="tile" href="'+PE_PAGE+'" target="_blank" rel="noopener"><span class="k">TIMED, SCORED ↗</span><b>Practice exams</b>Full timed exams with an estimated score. Timed or Practice mode (you can pause).</a>''</div>'),
 dict(label='Task verbs', html='<div class="card">'+ap_terms+'</div>'),
 dict(label='Practice exams', href=PE_PAGE),
]

# ---------------- IB ----------------
ib_tabs = [
 dict(label='The exam', html='<div class="card">'+ib_exam+'</div><h3>Practice and guides</h3><div class="tiles">'
   '<a class="tile" href="'+XS+'ib-paper-1b" target="_blank" rel="noopener"><span class="k">WRITTEN, SELF-MARKED ↗</span><b>Paper 1B practice</b>Real IB data-based questions. Answer, then mark yourself against the mark scheme.</a>'
   '<a class="tile" href="'+PE_PAGE+'" target="_blank" rel="noopener"><span class="k">TIMED, SCORED ↗</span><b>Practice exams</b>Full timed exams with an estimated score. Timed or Practice mode (you can pause).</a>'
   '<a class="tile" href="'+XS+'ia" target="_blank" rel="noopener"><span class="k">GUIDE ↗</span><b>Internal assessment</b>How the IA is graded, the stages and deadlines, a report template, uncertainties, topic ideas, a checklist and examples.</a></div>'),
 dict(label='Command terms', html='<div class="card">'+ib_terms+'</div>'),
 dict(label='Paper 1B practice', href=XS + 'ib-paper-1b'),
 dict(label='Practice exams', href=PE_PAGE),
 dict(label='Internal assessment', href=XS + 'ia'),
]

ap = page('Exam skills · AP Physics 1 and 2', 'AP exam skills', ap_tabs).replace('{IAJS}', '')
ib = page('Exam skills · IB Physics SL', 'IB exam skills', ib_tabs).replace('{IAJS}', '')
# Internal Assessment page (EXAM-IA): content owned by the IA chat in ia/ (see ia/ia_page.py)
from ia.ia_page import ia_tabs, ia_js
ia = page('Exam skills · IB Physics SL', 'Internal Assessment', ia_tabs()).replace('{IAJS}', ia_js())

# ---------------- Practice exams (EXAM-PE) ----------------
PE_CSS = r"""
.pe-intro{font-size:1.08rem;max-width:760px;margin:0 0 16px}
.exams{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin:8px 0 26px}
.exam{background:var(--white);border:2px solid var(--ink);box-shadow:4px 4px 0 var(--ink);padding:14px 16px;display:flex;flex-direction:column;gap:10px}
.exam .k{font-family:var(--mono);font-size:.72rem;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
.exam b{font-family:var(--display);font-size:1.15rem;line-height:1.2}
.exam .older{font-size:.85rem;color:var(--muted)}
.exam a{display:flex;justify-content:space-between;gap:8px;align-items:baseline;text-decoration:none;color:var(--ink);border:2px solid var(--ink);padding:8px 10px;font-family:var(--display);font-weight:500}
.exam a small{font-family:var(--mono);font-size:.72rem;color:var(--muted);white-space:nowrap}
.exam a:hover{background:var(--ink);color:var(--white)}.exam a:hover small{color:#cfcac2}
.exam a:focus-visible{outline:3px solid var(--orange);outline-offset:2px}
"""
U = lambda code: REVIEW_APP + '?unit=' + code
def exam_card(kick, name, parts, older=False):
    links = ''.join(f'<a href="{U(c)}" target="_blank" rel="noopener"><span>{lab} ↗</span><small>{mins} min</small></a>' for lab, c, mins in parts)
    o = '<span class="older">Older format (2022). The app explains the differences.</span>' if older else ''
    return f'<div class="exam"><span class="k">{kick}</span><b>{name}</b>{o}{links}</div>'
INTRO = ('<p class="pe-intro">Timed, scored practice exams. Choose <b>Timed</b> (like the real exam) or <b>Practice</b> mode (you can pause). '
         'Free response is written on paper and scored with the official scoring guide.</p>'
         '<p class="muted">Sign in with your FCPS account. A section shows “not open” until Mr. Holmes opens it.</p>')
def ap_parts(code, mc, fr): return [('Multiple choice', code + '-MC', mc), ('Free response', code + '-FR', fr)]
ap1 = (INTRO + '<h3>AP Physics 1</h3><p class="muted">Recommended order: Practice Exams 1, 2 and 3, then the 2022 exams.</p><div class="exams">'
       + ''.join(exam_card(f'Exam {i} of 6', f'Practice Exam {i}', ap_parts(f'XS-AP1-PE{i}', 85, 95)) for i in (1, 2, 3))
       + ''.join(exam_card(f'Exam {i+3} of 6', f'2022 Practice Exam {i}', ap_parts(f'XS-AP1-P22{L}', 90, 90), older=True) for i, L in ((1, 'A'), (2, 'B'), (3, 'C')))
       + '</div>')
ap2 = (INTRO + '<h3>AP Physics 2</h3><div class="exams">'
       + ''.join(exam_card(f'Exam {i} of 3', f'Practice Exam {i}', ap_parts(f'XS-AP2-PE{i}', 85, 95)) for i in (1, 2, 3))
       + '</div>')
def ib_parts(code): return [('Paper 1 (1A + 1B)', code + '-P1', 90), ('Paper 2', code + '-P2', 90)]
IB_SETS = [('Specimen', 'Specimen papers', 'XS-IB-SPEC')] + \
          [('May 2025', f'May 2025 · TZ{t}', f'XS-IB-25M-TZ{t}') for t in (1, 2, 3)] + \
          [('November 2025', f'November 2025 · TZ{t}', f'XS-IB-25N-TZ{t}') for t in (1, 3)] + \
          [('May 2026', f'May 2026 · TZ{t}', f'XS-IB-26M-TZ{t}') for t in (1, 2, 3)]
ibx = (INTRO + '<h3>IB Physics SL</h3><p class="muted">Paper 1 is 1A and 1B together (90 min). Paper 2 is 90 min.</p><div class="exams">'
       + ''.join(exam_card(k, n, ib_parts(c)) for k, n, c in IB_SETS) + '</div>')
pe_tabs = [dict(label='AP Physics 1', html=ap1), dict(label='AP Physics 2', html=ap2), dict(label='IB Physics SL', html=ibx),
           dict(label='All open exams', href=EXAMS)]
pe = page('Practice exams · AP Physics 1, AP Physics 2, IB Physics SL', 'Practice exams', pe_tabs).replace('{IAJS}', '').replace('</style>', PE_CSS + '</style>', 1)
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, 'out')
os.makedirs(OUT, exist_ok=True)
for name, text in (('EXAM-AP', ap), ('EXAM-IB', ib), ('EXAM-IA', ia), ('EXAM-PE', pe)):
    with open(os.path.join(OUT, name + '.html'), 'w', encoding='utf-8') as f: f.write(text)
print('Wrote EXAM-AP (%d), EXAM-IB (%d), EXAM-IA (%d) and EXAM-PE (%d) to %s' % (len(ap), len(ib), len(ia), len(pe), OUT))
