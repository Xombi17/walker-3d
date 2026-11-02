---
name: threejs-interactive-product-model
description: Build an interactive, parametric 3D product or figure viewer in three.js + Vite from a reference image or spec. Parts are built from code primitives with proper pivots, driven by sliders and animated toggles, with camera presets, CSS2D annotations, GLB export, before/after compare, a guided walkthrough with an IK mannequin, and a screenshot-driven verification loop. Use this whenever the user wants a three.js model of a product, prototype, device, appliance, character or "cool 3D figure", an HMI or industrial-design course demo, a product configurator, a 3D explainer, or says "make it in three.js" or "interactive 3D model", even if they never name a template. Also use it when they ask to make their three.js project stand out.
---

# Interactive product model in three.js

This skill captures a workflow that produced a full, tested viewer (a redesigned walking frame with
handles that telescope, a fold-down panel, a lock lever, a storage fold, a mannequin that uses it,
a before/after wipe and a fit check). The pattern generalises to any object that has dimensions,
moving parts and a story to tell.

The reasoning behind each rule is given so you can adapt it. If a rule does not fit the product, keep
the reason and change the rule.

## When this fits, and what to ask first

It fits any object you can describe with measurements and a few mechanisms. Ask the user only for what
you cannot infer: the real dimensions (or ranges), which parts move, what the audience should
understand after thirty seconds, and where it will run (local dev server, a hosted page, an Artifact).
Everything else has a sensible default below.

## Workflow

1. **Read the reference closely and write a dimension table** (metres) before any code. Put it in
   `src/constants.js`: sizes, ranges for every adjustable thing, colours, and the default state.
   Why: proportions are what make a primitive-built model read as the real object, and a single table
   makes every later tweak a one-line change.
2. **Scaffold from `assets/starter/`** (`npm install && npm run dev`). It already contains the stage,
   tweening, camera rig, annotations, exporter and a small example product wired to sliders.
   Why: these modules are product-independent and were the part that cost the most debugging.
3. **Model each part as a function returning a `THREE.Group`** whose origin is the joint it rotates or
   slides about (`createHandle(side, materials)`, `createPanel(materials)`). Read `references/architecture.md`.
4. **Pose everything from one plain state object.** `product.apply(state)` runs every frame; tweens
   change numbers in `state`, never the meshes. Why: animation, the walkthrough, undo and export all
   become "set some numbers", and nothing can drift out of sync.
5. **Add interaction in this order:** sliders for continuous parameters, eased toggles for mechanisms,
   camera presets, annotations, export. Then the optional modules (compare, mannequin, walkthrough).
6. **Verify with screenshots after every meaningful change**, from several angles and states
   (`scripts/multi-shot.cjs`, see `references/verification.md`). Do at least two refinement passes
   against the reference image: proportions first, then colour and material, then joint placement.
7. **Publish or hand over.** For a hosted page, inline the build into one HTML file
   (`references/gotchas.md`, "Publishing"). Say plainly which features a host disables (file downloads).

## Module contracts (the parts worth reusing)

| Module | Contract |
| :--- | :--- |
| `stage.js` | `createStage(container)` returns renderer, camera, orbit controls, label renderer and `setLayout({fov, left, bottom})`. Studio lighting from `RoomEnvironment`, one shadowed key light, a shadow-only ground. |
| `tween.js` | `Tweener.to(object, key, value, seconds)` with easing; a new tween on the same key replaces the old one. |
| `cameraRig.js` | `goTo(preset)`, `flyTo(position, target)`, `shift(delta)` to follow a moving subject. Presets carry half-extents and fit the viewport. |
| `annotations.js` | Labels placed in screen space, clamped to the viewport and clear of the control panel, joined to 3D anchors by leader lines. |
| `exporter.js` | `exportGLB(root)`: hides helpers, normalises normals, keeps circular references out of `extras`. |
| `geometry.js` | `tubeBetween`, `collarAt`, `adjustmentHoles`, contact-shadow blob. |

Optional modules, copy from the reference project (`https://github.com/Xombi17/walker-3d`, or this repo's
`src/`) when the story needs them:

- `compare.js` plus a scissor-test render: draggable wipe between two models.
- `mannequin.js` (two-bone IK, art-mannequin look) and `poses.js`: a person who uses the product.
- `walkthrough.js`: guided steps, each a pure function of its own clock so Back, Next, Replay and seek are free.
- `ergonomics.js`: turn a body measurement into a recommended setting and a plain-language fit rating.

## Craft rules and why

- **Real metres, one dimension table.** Cameras, shadows, IK and export all assume scale.
- **Mirror by parameter, not by negative scale.** Build both sides with `side = ±1`. Negative scale flips
  winding, which glTF consumers handle inconsistently.
- **Anchors for everything the UI points at** (annotation targets, hands, camera follow): empty `Object3D`s
  parented to the moving part. Store them with `setHiddenUserData` so they are not enumerable and the
  exporter does not choke on circular references.
- **Calibrate with a number, not by eye.** For anything with a comfort or fit target (elbow bend, reach),
  print the metric across a sweep of inputs and tune one constant until the range is right. A 1 cm change in
  pelvis height moved elbow flexion by about 3 degrees, which you cannot see but a sweep shows.
- **Make time-driven sequences pure functions** `apply(step, t)`. Each step must start exactly where the
  previous one ends; compute the end pose with the same function instead of hard-coding it.
- **Keep the UI honest.** Disable what cannot work in the current mode (`inert` plus a dim style), show the
  reason, and let the readout say what is wrong in plain words ("Handle too low").
- **Look at it.** Most defects here were visual (a missing offset put the mannequin on top of the grips, a
  camera hid half the scene behind a card). Type checks and unit tests would not have found them.

## Standing out

Read `references/standout-ideas.md` for ranked ideas (record a demo video, tipping and stability test,
persona presets with a usability questionnaire, WebGPU post-processing, AR export, physics) with sources
and rough effort. Pick two or three that serve the audience, not all of them.

## References

- `references/architecture.md`: file layout, state flow, pivot patterns, IK and gait maths.
- `references/gotchas.md`: three.js r186 specifics and every trap hit while building this.
- `references/verification.md`: headless screenshots, software GL flags, interaction tests.
- `references/standout-ideas.md`: what to add next and why.
- `assets/starter/`: a small runnable project to copy.
- `scripts/multi-shot.cjs`: scripted screenshots of many states in one browser session.
