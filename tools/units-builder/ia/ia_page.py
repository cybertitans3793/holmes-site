"""Content for the IB Internal Assessment page (proposed ?unit=EXAM-IA), Exam Skills > IB.
Owned by the IA chat. The Site chat wires it into exam.py; nothing here changes the site by itself.

Wiring (in exam.py, after page() is defined):
    from ia.ia_page import ia_tabs, ia_js
    ia = page('Exam skills · IB Physics SL', 'Internal Assessment', ia_tabs()).replace('{IAJS}', ia_js())
    ...then write it out as EXAM-IA.html alongside EXAM-AP and EXAM-IB.

ia_tabs() returns the same dicts page() already takes (label + html); the first tab carries ia.css.
Tab order matters: the data-go="N" links inside the fragments count tabs from 0 in this order.
Preview locally: python3 ia/preview.py  -> out/EXAM-IA.html (out/ is git-ignored)."""
import html, json, os

D = os.path.dirname(os.path.abspath(__file__))
DRIVE_FOLDER = ''   # FCPS-only Drive folder of IA originals; Josh pastes the link here when it exists

TABS = [            # (label, file)  - keep in step with the data-go numbers in the fragments
    ('Start here', 'start.html'),            # 0
    ('How it’s graded', 'grading.html'),     # 1
    ('Stages', 'stages.html'),               # 2
    ('Report template', 'template.html'),    # 3
    ('Uncertainties & graphs', 'uncertainty.html'),  # 4
    ('Topic ideas', None),                   # 5  built from ideas.json
    ('Checklist', 'checklist.html'),         # 6
    ('Examples', 'examples.html'),           # 7
    ('Resources', 'resources.html'),         # 8
]

def _read(name):
    with open(os.path.join(D, name), encoding='utf-8') as f:
        return f.read()

def _ideas_html():
    ideas = json.loads(_read('ideas.json'))
    areas = sorted({i['area'] for i in ideas}, key=lambda a: [x['area'] for x in ideas].index(a))
    gears = ['Lab basics', 'Phone', 'Buy', 'Ask first']
    e = html.escape
    btns = lambda key, vals, label: (f'<div class="ia-filters" data-f="{key}"><span class="lab">{label}</span>'
        f'<button data-v="" aria-pressed="true">All</button>'
        + ''.join(f'<button data-v="{e(v)}" aria-pressed="false">{e(v)}</button>' for v in vals) + '</div>')
    cards = ''
    for i in ideas:
        note = f'<p class="n">{e(i["note"])}</p>' if i.get('note') else ''
        cards += (f'<div class="ia-idea" data-area="{e(i["area"])}" data-gear="{e("|".join(i["gear"]))}">'
                  f'<div class="a">{e(i["area"])}</div>'
                  f'<div class="q">{e(i["iv"])} <i>→</i> {e(i["dv"][0].lower() + i["dv"][1:])}</div>'
                  f'<p>{e(i["physics"])}</p>{note}'
                  f'<div class="g">' + ''.join(f'<span>{e(g)}</span>' for g in i['gear']) + '</div></div>')
    return ('<div class="card"><h3>Topic ideas</h3>'
        '<p>Each idea reads <b>what you change → what you measure</b>. They are starting points, not finished questions: pick one, then make it yours with a specific system, range and measuring method. '
        'Your topic doesn’t need to be original, but your data, analysis and writing must be your own.</p>'
        '<ul><li><b>Lab basics</b>: rulers, stands, masses, stopwatches, thermometers, hot plates. <b>Phone</b>: a phone sensor app or slow-motion video. '
        '<b>Buy</b>: needs a cheap item or two; students often buy their own materials. <b>Ask first</b>: needs special equipment or has a safety issue, so check with Mr. Holmes.</li>'
        '<li>Something not listed? Run it through the Stage 1 feasibility check and bring it to Mr. Holmes.</li></ul></div>'
        + btns('area', areas, 'Topic') + btns('gear', gears, 'Needs')
        + '<input class="ia-search" type="search" placeholder="Search ideas, e.g. magnet, spring, sound" aria-label="Search ideas">'
        + '<p class="ia-count"></p><div class="ia-ideas">' + cards + '</div>'
        '<p class="muted">Ideas adapted from GradePod’s “100 IB Physics IA ideas” and K. A. Tsokos’s <i>The Scientific Investigation</i>.</p>')

def ia_tabs():
    out = []
    for k, (label, fname) in enumerate(TABS):
        body = _ideas_html() if fname is None else _read(fname)
        if fname == 'resources.html':
            body = (body.replace('href="#" data-drive', f'href="{html.escape(DRIVE_FOLDER)}" target="_blank" rel="noopener" data-drive') if DRIVE_FOLDER
                    else body.replace('<a class="ia-btn" href="#" data-drive>Open the IA documents folder ↗</a>',
                                      '<span class="ia-btn" aria-disabled="true">Folder link coming soon</span>'))
        if k == 0:
            body = '<style>' + _read('ia.css') + '</style>' + body
        out.append(dict(label=label, html=body))
    return out

def ia_js():
    return _read('ia.js')
