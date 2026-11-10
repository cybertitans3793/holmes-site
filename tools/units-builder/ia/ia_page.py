"""Content for the IB Internal Assessment page (proposed ?unit=EXAM-IA), Exam Skills > IB.
Owned by the IA chat. The Site chat wires it into exam.py; nothing here changes the site by itself.

Wiring (in exam.py, after page() is defined):
    from ia.ia_page import ia_tabs, ia_js
    ia = page('Exam skills · IB Physics SL', 'Internal Assessment', ia_tabs()).replace('{IAJS}', ia_js())
    ...then write it out as EXAM-IA.html alongside EXAM-AP and EXAM-IB.

ia_tabs() returns the same dicts page() already takes (label + html); the first tab carries ia.css.
Tab order matters: the data-go="N" links inside the fragments count tabs from 0 in this order.
Preview locally: python3 ia/preview.py  -> out/EXAM-IA.html (out/ is git-ignored).

Research question (Stages tab, Stage 1): by default the static builder (<!--RQB--> … <!--/RQB--> in stages.html).
ia_tabs(rq_form=True) swaps it for the Review app's submit form (REVIEW_APP?unit=IA-RQ: IB students only, signed in,
saved to the review Sheet's IA tab, shown on the review dashboard's IA tab). Turn it on only after that app version is deployed.

Plan (Stages tab, Stage 2): ia_tabs(plan_form=True) puts the Review app's planner (REVIEW_APP?unit=IA-PLAN: IB only, drafts,
diagram upload, per-section teacher notes, "Make my IA doc" once approved) after the Stage 2 step list (<!--PLANFORM-->).
Wording that only fits one version sits between <!--PLAN-->…<!--/PLAN--> (kept only with the planner) and
<!--NOPLAN-->…<!--/NOPLAN--> (kept only without it), in any tab. Turn it on only after that app version is deployed."""
import html, json, os, re, sys

D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(D))
from site_links import SITE, COURSE_FOLDER, REVIEW_APP
P1_00 = SITE + COURSE_FOLDER['P1'] + '/p1-00'   # the Measurement (IB) unit page: uncertainty and graphing sims

TABS = [            # (label, file)  - keep in step with the data-go numbers in the fragments
    ('Start here', 'start.html'),            # 0
    ('Stages', 'stages.html'),               # 1  each stage carries its own marking tips, examples and (Stage 5) the checklist
    ('Reference', None),                     # 2  built by _reference(): mark bands, report template, uncertainties (data-ref 0, 1, 2)
    ('Topic ideas', None),                   # 3  built from ideas.json
]
REFERENCE = [       # (title, file, one-line summary) - collapsed sections; [data-ref="N"] links open section N
    ('How it’s marked', 'grading.html', 'The four criteria and their mark bands, in plain words.'),
    ('Report template and format rules', 'template.html', 'The headings in order, format rules and the word limit.'),
    ('Uncertainties and graphs', 'uncertainty.html', 'Class uncertainty rules, writing results, graphs, outliers.'),
]

def _read(name):
    with open(os.path.join(D, name), encoding='utf-8') as f:
        return f.read()

def _reference():
    out = '<p class="muted">Look things up here. Each section opens when you click it.</p>'
    for k, (title, fname, blurb) in enumerate(REFERENCE):
        out += (f'<details class="ia-ref" data-refsec="{k}"><summary><b>{title}</b><span>{blurb}</span></summary>'
                f'<div class="ia-ref-body">{_read(fname)}</div></details>')
    return out

def _ideas_html():
    ideas = json.loads(_read('ideas.json'))
    areas = sorted({i['area'] for i in ideas}, key=lambda a: [x['area'] for x in ideas].index(a))
    gears = ['Lab basics', 'Phone', 'Buy', 'Ask first']
    e = html.escape
    btns = (f'<div class="ia-filters" data-f="gear"><span class="lab">Needs</span>'
            f'<button data-v="" aria-pressed="true">Anything</button>'
            + ''.join(f'<button data-v="{e(v)}" aria-pressed="false">{e(v)}</button>' for v in gears) + '</div>')
    groups = ''
    for a in areas:
        cards = ''
        for i in [x for x in ideas if x['area'] == a]:
            note = f'<p class="n">{e(i["note"])}</p>' if i.get('note') else ''
            cards += (f'<div class="ia-idea" data-gear="{e("|".join(i["gear"]))}">'
                      f'<div class="q">{e(i["iv"])} <i>→</i> {e(i["dv"][0].lower() + i["dv"][1:])}</div>'
                      f'{note}'
                      f'<div class="g">' + ''.join(f'<span>{e(g)}</span>' for g in i['gear']) + '</div></div>')
        n = cards.count('class="ia-idea"')
        groups += (f'<details class="ia-area" data-area="{e(a)}"><summary><b>{e(a)}</b> <span class="c" data-n="{n}">{n} ideas</span></summary>'
                   f'<div class="ia-ideas">{cards}</div></details>')
    return ('<div class="card"><h3>Topic ideas</h3>'
        '<p>Each idea reads <b>what you change → what you measure</b>. They are starting points: pick one, then make it yours with a specific system and measuring method. '
        'Open a topic to browse it, or search.</p>'
        '<p class="muted"><b>Lab basics</b>: rulers, stands, masses, stopwatches, thermometers. <b>Phone</b>: a sensor app (e.g. <i>phyphox</i>, free) or slow-motion video, so done at home. '
        '<b>Buy</b>: a cheap item or two. <b>Ask first</b>: special equipment or a safety issue. Something not listed? Run it through the Stage 1 feasibility check.</p></div>'
        + btns
        + '<input class="ia-search" type="search" placeholder="Search ideas, e.g. magnet, spring, sound" aria-label="Search ideas">'
        + '<p class="ia-count"></p>' + groups +
        '<p class="muted">Ideas adapted from GradePod’s “100 IB Physics IA ideas”, K. A. Tsokos’s <i>The Scientific Investigation</i> and Richard Walding’s “300 ideas for physics investigations”.</p>')

RQ_FORM = ('<div class="card ia-rqform"><iframe title="Submit your research question" loading="lazy" '
           'src="' + REVIEW_APP + '?unit=IA-RQ"></iframe></div>')

PLAN_FORM = ('<div class="card ia-planform"><iframe title="Your Stage 2 plan" loading="lazy" '
             'src="' + REVIEW_APP + '?unit=IA-PLAN"></iframe></div>')

def _plan_marks(body, plan_form):
    keep, drop = ('PLAN', 'NOPLAN') if plan_form else ('NOPLAN', 'PLAN')
    body = re.sub(r'<!--%s-->.*?<!--/%s-->' % (drop, drop), '', body, flags=re.S)
    body = body.replace('<!--%s-->' % keep, '').replace('<!--/%s-->' % keep, '')
    return body.replace('<!--PLANFORM-->', PLAN_FORM if plan_form else '')

def ia_tabs(rq_form=False, plan_form=False):
    out = []
    for k, (label, fname) in enumerate(TABS):
        body = _read(fname) if fname else (_reference() if label == 'Reference' else _ideas_html())
        body = body.replace('{P1_00}', P1_00)
        body = _plan_marks(body, plan_form)
        if rq_form and '<!--RQB-->' in body:
            a, b = body.index('<!--RQB-->'), body.index('<!--/RQB-->') + len('<!--/RQB-->')
            body = body[:a] + RQ_FORM + body[b:]
        if k == 0:
            body = '<style>' + _read('ia.css') + '</style>' + body
        out.append(dict(label=label, html=body))
    return out

def ia_js():
    return _read('ia.js')
