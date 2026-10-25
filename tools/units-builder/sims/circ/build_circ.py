#!/usr/bin/env python3
"""Builds the P1-05 circular-motion sims: frame.html + <sim>.js -> ../circ-<sim>.html"""
import os, re
D = os.path.dirname(os.path.abspath(__file__))
frame = open(os.path.join(D, 'frame.html'), encoding='utf-8').read()
for name in ['curve', 'vertical', 'conical', 'turntable', 'orbits']:
    js = open(os.path.join(D, name + '.js'), encoding='utf-8').read()
    title = re.search(r"title: '([^']+)'", js).group(1)
    out = frame.replace('{SIMJS}', js).replace('{TITLE}', title).replace('{SIMFILE}', name + '.js')
    open(os.path.join(D, '..', 'circ-' + name + '.html'), 'w', encoding='utf-8').write(out)
    print('ok', name, len(out))
