# Holmes Physics site

Source for the sims on Mr. Holmes's class Google Site. No student data lives here.

- `units/` — one page per unit (`P1-09.html`, `P2-01.html`, `AB-03.html` …). The "Holmes Sims" Apps Script web app serves these to students: `…/exec?unit=P1-09`.
- `apps-script/holmes-sims/Code.gs` — that web app's code (fetches `units/<UNIT>.html` from this repo, Drive folder as backup).
- `tools/units-builder/` — builds the unit pages from the individual sims (`python3 build.py`).

Not allowed here: student information, IB Questionbank items, Frensley materials, purchased Physics Classroom question banks.
