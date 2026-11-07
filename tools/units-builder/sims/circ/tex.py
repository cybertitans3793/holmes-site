"""Build-time LaTeX -> MathML for the Show-the-work panels (same converter as the study guides: latex2mathml).
In a sim's .js, write  TEX`F = \\frac{k\\,|q_1 q_2|}{r^2}`  (or TEXA`...` for the bold answer line).
${expr} inside the template is a live value; expr must return MathML (use M.n(x, 'N') or M.iv('id')).
The template is converted once here; at run time only the ${...} values are filled in."""
import re, json
from latex2mathml.converter import convert

def _fix(m):
    m = m.replace(' xmlns="http://www.w3.org/1998/Math/MathML"', '')
    m = re.sub(r'<mo stretchy="false">&#x0007C;</mo>', '<mo stretchy="false" lspace="0" rspace="0">&#x0007C;</mo>', m)
    m = re.sub(r'(<mi>(?:sin|cos|tan)</mi>)', r'\1<mspace width="0.167em"/>', m)
    return m

def _one(src, ans):
    exprs = []
    def ph(mo):
        exprs.append(mo.group(1)); return r'\text{§%d§}' % (len(exprs) - 1)
    latex = re.sub(r'\$\{((?:[^{}]|\{[^{}]*\})*)\}', ph, src)
    mml = _fix(convert(latex, display='block'))
    if ans: mml = mml.replace('<math ', '<math class="ans" ', 1)
    parts = re.split(r'<mtext>§(\d+)§</mtext>', mml)
    out = []
    for i, p in enumerate(parts):
        out.append(json.dumps(p, ensure_ascii=False) if i % 2 == 0 else '(' + exprs[int(p)] + ')')
    return '(' + ' + '.join(out) + ')'

def tex(js):
    return re.sub(r'\bTEX(A?)`((?:[^`\\]|\\.)*)`', lambda mo: _one(mo.group(2).replace('\\`', '`'), mo.group(1) == 'A'), js)
