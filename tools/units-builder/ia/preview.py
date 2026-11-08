#!/usr/bin/env python3
"""Local preview of the IA page in the real Exam Skills shell. Writes out/EXAM-IA.html (git-ignored).
Usage (from tools/units-builder):  python3 ia/preview.py"""
import os, sys, tempfile, contextlib, io
UB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, UB)
argv = sys.argv; sys.argv = ['exam.py', tempfile.mkdtemp()]      # importing exam.py builds its pages; send them to a temp folder
with contextlib.redirect_stdout(io.StringIO()):
    import exam
sys.argv = argv
from ia.ia_page import ia_tabs, ia_js
out = os.path.join(UB, 'out'); os.makedirs(out, exist_ok=True)
page = exam.page('Exam skills · IB Physics SL', 'Internal Assessment', ia_tabs()).replace('{IAJS}', ia_js())
with open(os.path.join(out, 'EXAM-IA.html'), 'w', encoding='utf-8') as f: f.write(page)
print('Wrote out/EXAM-IA.html (%d bytes)' % len(page))
