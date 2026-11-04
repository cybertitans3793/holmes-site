#!/usr/bin/env python3
"""Check that every page in units/ is exactly what the builder makes from the current source.
Run before pushing:  python3 check.py      (exit code 1 if anything is out of step)
GitHub runs this on every push (.github/workflows/check-pages.yml).
Fix a failure by rebuilding:  python3 build.py && python3 home.py ../../units/HOME.html && cp out/*.html ../../units/
"""
import contextlib, io, os, subprocess, sys

D = os.path.dirname(os.path.abspath(__file__))
UNITS_DIR = os.path.join(D, '..', '..', 'units')
sys.path.insert(0, D)
from units import UNITS, SIMS
import build

problems = []

# 1. every sim file named in units.py exists
for k, s in SIMS.items():
    if not os.path.exists(os.path.join(build.SP, s['file'])):
        problems.append('units.py sim %r points to a missing file: %s' % (k, s['file']))

# 2. sim files nobody uses (warning only: a chat may have added one that isn't wired in yet)
used_files = {os.path.normpath(s['file']) for s in SIMS.values()}
unused = sorted(f for f in os.listdir(os.path.join(D, 'sims'))
                if f.endswith('.html') and os.path.normpath('sims/' + f) not in used_files)

# 3. rebuild every unit page and the homepage, compare byte for byte
if not problems:
    for uid in UNITS:
        with contextlib.redirect_stdout(io.StringIO()):
            build.build(uid)
        new = open(os.path.join(D, 'out', uid + '.html'), encoding='utf-8').read()
        live_path = os.path.join(UNITS_DIR, uid + '.html')
        if not os.path.exists(live_path):
            problems.append('%s is in units.py but units/%s.html is missing' % (uid, uid))
        elif open(live_path, encoding='utf-8').read() != new:
            problems.append('units/%s.html does not match its source (rebuild it)' % uid)
    home_tmp = os.path.join(D, 'out', 'HOME.html')
    subprocess.run([sys.executable, os.path.join(D, 'home.py'), home_tmp], check=True, stdout=subprocess.DEVNULL)
    if open(home_tmp, encoding='utf-8').read() != open(os.path.join(UNITS_DIR, 'HOME.html'), encoding='utf-8').read():
        problems.append('units/HOME.html does not match its source (rebuild it)')

# 4. pages in units/ that nothing builds
for f in sorted(os.listdir(UNITS_DIR)):
    if f.endswith('.html') and f[:-5] not in UNITS and f != 'HOME.html':
        problems.append('units/%s is not built from units.py (stray page)' % f)

if unused:
    print('Note: sim files not used on any page yet: ' + ', '.join(unused))
if problems:
    print('PAGES OUT OF STEP WITH SOURCE:')
    for p in problems: print('  - ' + p)
    sys.exit(1)
print('All %d unit pages and HOME match their source.' % len(UNITS))
