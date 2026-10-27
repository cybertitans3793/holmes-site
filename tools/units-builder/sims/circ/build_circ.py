#!/usr/bin/env python3
"""Builds the Show-the-work sims: frame.html + <sim>.js -> ../circ-<sim>.html (P1-05 circular motion, P1-06 work and energy)"""
import os, re
D = os.path.dirname(os.path.abspath(__file__))
frame = open(os.path.join(D, 'frame.html'), encoding='utf-8').read()
for name in ['curve', 'vertical', 'conical', 'turntable', 'orbits', 'crate', 'track', 'launcher', 'power', 'hang', 'crash', 'carts', 'bounce', 'ballistic', 'hockey', 'stack', 'vectors', 'ropes', 'cannon', 'springs', 'pulleys', 'gears', 'assist', 'truck', 'meet', 'balance', 'puck', 'cartball', 'chase', 'elevator', 'updown', 'brake', 'fgraphs', 'blocks', 'proj', 'incline', 'river', 'anglepull', 'torque', 'spin', 'inertia', 'mpulley', 'roll', 'angmom', 'pressure', 'float', 'scale', 'pipe', 'tank', 'stokes', 'shm', 'pend', 'circle', 'clay', 'reson', 'meas', 'scatter', 'prop', 'errbars', 'linear', 'kinetic', 'abszero', 'gasprob', 'piston', 'cycle', 'calor', 'conduct', 'entropy', 'heatcurve', 'realgas', 'lum', 'engine', 'coulomb', 'efield', 'potential', 'plates', 'cap', 'ohm', 'circuits', 'kirch', 'emf', 'rc', 'bwire', 'bforce', 'induct', 'wave', 'pulses', 'standing', 'doppler', 'snell', 'optics', 'slits', 'thinfilm', 'world', 'eye', 'sound', 'spectra', 'photo', 'quantum', 'decay', 'binding', 'ruth', 'stars']:
    js = open(os.path.join(D, name + '.js'), encoding='utf-8').read()
    js = re.sub(r'//@include (\S+)', lambda m: open(os.path.join(D, m.group(1)), encoding='utf-8').read(), js)
    title = re.search(r"title: '([^']+)'", js).group(1)
    out = frame.replace('{VARIANT}', '').replace('{SIMJS}', js).replace('{TITLE}', title).replace('{SIMFILE}', name + '.js')
    open(os.path.join(D, '..', 'circ-' + name + '.html'), 'w', encoding='utf-8').write(out)
    print('ok', name, len(out))

# Simplified variants (Algebra-Based Physics): same sim, fewer modes/choices, AP/IB tags stripped from the work.
VAR_JS = """
(function (V) {
  if (V.title) SIM.title = V.title;
  if (V.hint) SIM.hint = V.hint;
  if (V.modes && SIM.modes) SIM.modes = V.modes.map(id => SIM.modes.find(m => m.id === id)).filter(Boolean);
  if (V.opts && SIM.opts) SIM.opts = SIM.opts.map(o => V.opts[o.id] ? Object.assign({}, o, { choices: o.choices.filter(c => V.opts[o.id].includes(c[0])) }) : o).filter(o => o.choices.length);
  if (SIM.opts && V.oneChoiceHidden !== false) SIM.opts = SIM.opts.filter(o => o.choices.length > 1);
  if (SIM.presets) SIM.presets = SIM.presets.filter(p => (!p.mode || !SIM.modes || SIM.modes.some(m => m.id === p.mode)) && !(V.dropPresets || []).includes(p.label));
  SIM.strip = h => h.replace(/<span style="color:#7a3fb0">IB[^<]*<\\/span>:?\\s*/g, '').replace(/\\s*\\((?:IB|AP)[^()]*\\)/g, '').replace(/<p class="note">(?:AP|IB)[^<]*(?:<[^p][^>]*>[^<]*)*<\\/p>/g, '').replace(/AP: qualitative only[^.]*\\. ?/g, '');
})(%s);
"""
import json
VARIANTS = {
  'ab-meet': ('meet', {'modes': ['head', 'catch']}),
  'ab-chase': ('chase', {'modes': ['police', 'head']}),
  'ab-balance': ('balance', {'modes': ['push', 'sky']}),
  'ab-elevator': ('elevator', {'modes': ['up', 'down']}),
  'ab-blocks': ('blocks', {'modes': ['push']}),
  'ab-curve': ('curve', {'modes': ['flat']}),
  'ab-track': ('track', {'modes': ['valley', 'hump', 'loop']}),
  'ab-coulomb': ('coulomb', {'modes': ['two']}),
  'ab-efield': ('efield', {'modes': ['one', 'two']}),
  'ab-ohm': ('ohm', {'modes': ['wire', 'iv'], 'opts': {'dev': ['res', 'lamp']}}),
  'ab-circuits': ('circuits', {}),
  'ab-bwire': ('bwire', {'modes': ['one']}),
  'ab-wave': ('wave', {'modes': ['trans', 'long']}),
  'ab-standing': ('standing', {'modes': ['string', 'pipe', 'micro'], 'opts': {'se': ['ff'], 'pe': ['oo', 'co']}}),
  'ab-doppler': ('doppler', {'modes': ['sound', 'radar']}),
  'ab-sound': ('sound', {}),
  'ab-stars': ('stars', {'modes': ['hr'], 'title': 'The HR Diagram', 'hint': 'L = 4πR²σT⁴'}),
}
for vname, (base, cfg) in VARIANTS.items():
    js = open(os.path.join(D, base + '.js'), encoding='utf-8').read()
    js = re.sub(r'//@include (\S+)', lambda m: open(os.path.join(D, m.group(1)), encoding='utf-8').read(), js)
    title = cfg.get('title') or re.search(r"title: '([^']+)'", js).group(1)
    out = frame.replace('{VARIANT}', VAR_JS % json.dumps(cfg, ensure_ascii=False)).replace('{SIMJS}', js).replace('{TITLE}', title).replace('{SIMFILE}', base + '.js')
    open(os.path.join(D, '..', 'circ-' + vname + '.html'), 'w', encoding='utf-8').write(out)
    print('ok', vname, len(out))
