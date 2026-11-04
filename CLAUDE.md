# Rules for any Claude chat working in this repo

One chat, the **Site chat**, owns this repo's shared files and the Google Sites editor. Other chats (sims, review, homework, course chats) contribute their own files and hand off.

## Owned by the Site chat only
- `tools/units-builder/units.py`, `build.py`, `home.py`, `exam.py` and `exam/`, `shell.css`
- everything in `units/` (built output)
- `apps-script/holmes-sims/Code.gs`
- the Google Sites editor: pages, menus, embeds, publishing

Other chats: do **not** edit these, rebuild pages, or commit to `units/`.

## What other chats may do
1. Add or change your **own** files: a sim in `tools/units-builder/sims/<name>.html`, a guide in `tools/units-builder/guides/<UNIT>.html`. Keep sims self-contained (one HTML file, no outside links students' Chromebooks would block).
2. Commit them with a clear message. A new or changed sim file does nothing on the site until the Site chat wires it in.
3. Write a hand-off note for Josh to paste into the Site chat:
   - unit (e.g. P2-03) and tab name, lesson code if known
   - sim file, and which modes the tab should show and open on
   - the "Try this" tasks (HTML allowed)
   - placement (which tab it goes after; Extension or not)
   - anything to remove

If you change a sim that more than one unit uses (check `units.py`), say so in the note: the Site chat checks every page that uses it, so a change meant for one course doesn't show up in another.

## Review and Homework apps
Those are separate Apps Script projects with their own chats; their code lives in private `holmes-questions`. The site only embeds their links (`?unit=`, `?a=`, `?course=`). Changing what a link points to goes through the Site chat.

## Never
Student data, IB Questionbank items, Frensley materials, or purchased Physics Classroom banks in this public repo.
