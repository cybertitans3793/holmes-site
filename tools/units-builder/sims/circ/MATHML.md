# Show-the-work panels in MathML

The worked example beside each sim (the `work(v, d, mode, opt)` function in `<sim>.js`) is typeset as MathML, the same way the study guides do it. Chrome draws MathML natively, so there are no outside scripts for the Chromebook filter to block.

**Model:** `coulomb.js` (all three modes). Read its `work()` before converting anything.

## How it works
- In the `.js`, write each equation as a tagged template: ``TEX`F = \frac{k\,|q_1 q_2|}{r^2}` ``. Use ``TEXA`...` `` for the bold answer line.
- `build_circ.py` converts every `TEX`/`TEXA` template once, at build time, with latex2mathml (via `tex.py`). It also applies the study-guide fixes: a space after sin/cos/tan, and tight `|` bars.
- `${expr}` inside a template is a live value, filled in at run time. `expr` must return **MathML**:
  - `M.n(x, 'N')` gives a number (with ×10ⁿ typeset) and an optional unit. `M.n(x)` gives a bare number.
  - `M.p(x, 'N')` is the same, but wrapped in brackets when x is negative.
  - `M.iv('id')` gives a slider's current value with its unit, highlighted like `H.iv`.
  - `M.iv('id', 1e-6)` gives the slider value times the factor, with no unit (for example μC → C in a formula).
  - `'<mn>2</mn>'`, `'<mtext>right</mtext>'` and `'<mi>x</mi>'` are raw MathML for anything else.
- Live values belong in math only through `${...}`. Words between steps stay ordinary HTML.

## Layout rules (same as the study guides)
1. One step per line: the equation in symbols, then the same equation with the numbers in, then the answer in bold (`TEXA`). Never two equations on one line. Split chains like `a = b = c = 5 N` into separate lines.
2. Words between steps go in a short `<p class="st">...</p>`.
3. Keep the existing `<h4>` step headings, `<p class="note">`, `<div class="ok">` and `<div class="bad">` blocks. Plain prose `<div class="eq">` lines with no real equation become `<p class="st">`.
4. Units: `\,\text{N}` after a number written in the LaTeX. For live values, pass the unit to `M.n`.
5. Use `\theta`, `\Delta`, `\omega`, `\mu`, `\cdot`, `\times`, `\sqrt{}`, `\frac{}{}`, `_{\text{net}}`, `\left( \right)`, `\approx`, `^{\circ}`. Write text inside math as `\text{...}`.
6. Put a `\,` between a single-letter variable and a function, for example `T\,\cos\theta` and `L\,\sin\theta`. Otherwise they run together.
7. IB/AP tag spans (`<span style="color:#7a3fb0">IB</span>` and similar) stay in the HTML around the math, never inside a `TEX` template. The ABP variants strip them by regex.

## Do not change
- The physics: same formulas, same numbers and the same `calc()`. Only the presentation changes. If you think an existing equation is wrong, don't fix it; report it.
- `frame.html`, `tex.py`, `build_circ.py`, `check_math.js`, or any sim not assigned to you.
- Don't run `git`. The lead commits.

## Template gotchas
- A template can't contain a backtick.
- `${...}` may contain one level of `{}` at most. For anything more complex, compute it into a `const` before the `return`.
- A ternary that picks between whole steps is fine: `(cond ? TEX`...` : TEX`...`)`.
- `F_${'<mn>' + (i + 1) + '</mn>'}` works for a live subscript.

## Build and check
```
cd tools/units-builder/sims/circ
python3 build_circ.py <sim> [<sim> ...]          # builds only these (and their ab- variants)
NODE_PATH=$(npm root -g) node check_math.js <sim> [...] --shots /some/dir
```
`check_math.js` clicks every mode and option, pushes every slider to min and max, and reports:
- page errors
- leftover placeholders
- NaN in the panel
- math wider than the panel
- modes with no math

Fix everything it reports. Then open two or three of the screenshots to check the look (fractions stacked, no squashed text). A mode that truly has no equations (pure words) may stay mathless: say so in your report.
