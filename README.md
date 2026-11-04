# Holmes Physics site

Source for the sims pages on Mr. Holmes's class Google Site (https://sites.google.com/fcps.org/holmes/home). No student data lives here.

## Layout
- `units/` — the built pages students see: one per unit (`P1-09.html`, `P2-01.html`, `AB-03.html` …) plus `HOME.html`. **Generated. Never edit these by hand.**
- `tools/units-builder/` — everything the pages are built from:
  - `sims/` — every sim, one self-contained HTML file each
  - `guides/` — study-guide sections (e.g. `P1-05.html`)
  - `units.py` — which sims go on which unit page, tab names, lesson codes, "Try this" tasks, reviews, guides
  - `build.py` (unit pages), `home.py` (homepage), `shell.css` (Big Type look)
- `apps-script/holmes-sims/Code.gs` — the "Holmes Sims" web app. It fetches `units/<UNIT>.html` from this repo (Drive folder as backup) and serves it at `…/exec?unit=P1-09`.

## Build
```
cd tools/units-builder
python3 build.py            # all unit pages -> out/   (or: python3 build.py P1-05 AB-03)
python3 home.py ../../units/HOME.html
cp out/*.html ../../units/
```
Before pushing, run `python3 check.py` (in `tools/units-builder`): it rebuilds everything and fails if any page in `units/` doesn't match its source. GitHub runs the same check on every push; a red ✗ next to a commit means a page is out of step.

Students see a change about 10 minutes after it is pushed (the web app's cache). Add `&refresh=1` to a link to see it at once.

## Not allowed here
Student information, IB Questionbank items, Frensley materials, purchased Physics Classroom question banks. Those go in the private `holmes-questions` repo.

See `CLAUDE.md` for who may change what.
