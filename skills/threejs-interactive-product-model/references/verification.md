# Verification loop

The loop that found most of the real defects: render, look, fix, render again.

1. Start the dev server in the background (`npx vite --port 5173`).
2. Take a first screenshot, then compare with the reference image side by side. Fix proportions, then colour,
   then joints. Repeat at least twice.
3. Capture a contact sheet of states: each camera preset, each mechanism open and closed, extreme slider values,
   folded, compare, walkthrough steps at several `seek` times.
4. Run an interaction test with real clicks (Playwright): sliders, toggles, buttons, drag of the wipe divider,
   keyboard, export. Read the console for page errors; they were how a state-stashing bug showed up.
5. For any number the UI reports, sweep the inputs and print the output before trusting it.

## Screenshot harness

`scripts/multi-shot.cjs` loads the page once and, for a JSON list of `[name, code, waitMs]` steps, evaluates `code`
in the page, waits, and saves `name.png`.

```bash
node scripts/multi-shot.cjs '[["front","appDebug.rig.goTo(\"front\")",3000],["panel","appDebug.state.panelOpen=1",3000]]' 1300 850
```

Environment: Chromium and Playwright are preinstalled in Claude Code on the web (`require('playwright')` works
from any directory). Keep scripts and screenshots outside the project folder (use the scratchpad).

## Interaction test skeleton

```js
const ok = (name, cond, extra='') => console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`);
await page.click('label:has(#panel-toggle)');
await page.waitForFunction(() => appDebug.state.panelOpen > 0.999, null, { timeout: 60000 });
ok('panel unfolds', true);
const [download] = await Promise.all([page.waitForEvent('download'), page.click('#export-button')]);
ok('GLB header', fs.readFileSync(await download.path()).subarray(0, 4).toString() === 'glTF');
```

A FAIL that is only a timing artefact (reading a flag before a frame ran) should be re-checked with a wait, not
"fixed" in the app.

## Contact sheets

Combine screenshots with Pillow to review many states in one image:

```python
from PIL import Image
ims = [Image.open(n + '.png').resize((650, 425)) for n in names]
sheet = Image.new('RGB', (650 * 3, 425 * ((len(ims) + 2) // 3)), 'white')
for i, im in enumerate(ims): sheet.paste(im, ((i % 3) * 650, (i // 3) * 425))
sheet.save('sheet.png')
```
