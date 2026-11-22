"""Addresses the site links to. Change a link here once; build.py and home.py both read it.
Only addresses live here. What each course or unit does (which practice a unit opens, its review id,
its guide) is set per unit in units.py; how Review and Homework behave is set in those apps."""

# Apps Script web apps (FCPS account). Redeploying with "New version" keeps these links the same.
REVIEW_APP = 'https://script.google.com/a/macros/fcps.org/s/AKfycbzW6NpFGf5yjZ843WN0pDy-mzI0r1iCcBIuoJpMCEJeWwbUARiSnAC_lf2bWQeHWoGjHA/exec'    # AP/IB Review  (?unit=P1-05)
HOMEWORK_APP = 'https://script.google.com/a/macros/fcps.org/s/AKfycbxm2XXzPq2s0JUlS2T0a2lQJ8Pm97_zyibH9rGrW4VUB3EAHWQy5SmQvxsOUYyUL08M/exec'  # Homework, incl. ABP unit reviews (?a=04-R)

# Google Site
SITE = 'https://sites.google.com/fcps.org/holmes/'
# Menu-section folder for each course. Renaming a menu section on the Site changes its folder: update it here and rebuild HOME.
COURSE_FOLDER = {'AB': 'algebra-based-physics', 'P1': 'ap-physics-1-ib', 'P2': 'ap-physics-2-ib'}

# Sims app: serves every unit page (?unit=P1-05). Extra parameters (?unit=P1-00&tab=graph-lab&set=P2-03) are read by the page itself.
SIMS_APP = 'https://script.google.com/a/macros/fcps.org/s/AKfycby1_Uxlv539Tkn9tTb85e1RrCGZRs_q-bHUHugNYBpSNNqLmhuHJJeZrRdssgnJHBE/exec'
def graph_lab_url(set_id='', mode='', ib=False):
    """Opens P1-00 on its Graph Lab tab, optionally on a unit's data set, a mode and/or with IB error bars on."""
    q = '?unit=P1-00&tab=graph-lab' + ('&set=' + set_id if set_id else '') + ('&mode=' + mode if mode else '') + ('&ib=1' if ib else '')
    return SIMS_APP + q
