#!/usr/bin/env python3
"""Builds the Show-the-work sims: frame.html + <sim>.js -> ../circ-<sim>.html (P1-05 circular motion, P1-06 work and energy)"""
import os, re
D = os.path.dirname(os.path.abspath(__file__))
frame = open(os.path.join(D, 'frame.html'), encoding='utf-8').read()
for name in ['curve', 'vertical', 'conical', 'turntable', 'orbits', 'crate', 'track', 'launcher', 'power', 'hang', 'crash', 'carts', 'bounce', 'ballistic', 'hockey', 'stack', 'vectors', 'ropes', 'cannon', 'springs', 'pulleys', 'gears', 'assist', 'truck', 'meet', 'balance', 'puck', 'cartball', 'chase', 'elevator', 'updown', 'brake', 'fgraphs', 'blocks', 'proj', 'incline', 'river', 'anglepull', 'torque', 'spin', 'inertia', 'mpulley', 'roll', 'angmom', 'pressure', 'float', 'scale', 'pipe', 'tank', 'stokes', 'shm', 'pend', 'circle', 'clay', 'reson', 'meas', 'scatter', 'prop', 'errbars', 'linear', 'kinetic', 'abszero', 'gasprob', 'piston', 'cycle', 'calor', 'conduct', 'entropy', 'heatcurve', 'realgas', 'lum']:
    js = open(os.path.join(D, name + '.js'), encoding='utf-8').read()
    title = re.search(r"title: '([^']+)'", js).group(1)
    out = frame.replace('{SIMJS}', js).replace('{TITLE}', title).replace('{SIMFILE}', name + '.js')
    open(os.path.join(D, '..', 'circ-' + name + '.html'), 'w', encoding='utf-8').write(out)
    print('ok', name, len(out))
