# Gotchas

## three.js r186

- Import addons as `three/addons/...`, not `three/examples/jsm/...`.
- `PCFSoftShadowMap` is deprecated: use `PCFShadowMap`. `VSMShadowMap` with a large blur was extremely slow
  under software GL and made screenshots time out; stay with PCF and add contact blobs for softness.
- Use `THREE.Timer` (call `timer.connect(document)`, `timer.update(timestamp)` each frame) instead of `Clock`,
  and `renderer.setAnimationLoop` instead of a manual `requestAnimationFrame`.
- `material.envMapIntensity` does not scale `scene.environment`; use `scene.environmentIntensity`.
- `NeutralToneMapping` keeps saturated brand colours (an orange of #F26B1D) from washing out. With ACES and a
  bright environment the orange turned salmon. A non-metal at roughness 0.5 reads richer than 0.4.
- `CapsuleGeometry`, `LatheGeometry`, `TubeGeometry` and `CylinderGeometry` cover nearly every part you need.
  Spin a profile with Lathe for feet, caps and collars (add small chamfers so they catch highlights).

## Geometry

- Two coincident cylinders of equal radius z-fight. Make the sliding tube slightly thinner than its sleeve.
- A `RoundedBoxGeometry` scaled in one axis squashes its corners. Build at max size and scale down.
- Holes on tubes: merged `CircleGeometry` discs offset 0.7 mm off the surface read as holes and cost one draw call.
- Brushed metal: a canvas roughness map with per-column streaks along the tube length, multiplied into
  roughness 0.3, gives a convincing finish without textures on disk.

## GLTFExporter

- `userData` holding `Object3D` references is circular: `JSON.stringify` fails and the exporter warns. Define
  such properties as non-enumerable (`Object.defineProperty(userData, key, { value, enumerable: false })`).
  Do not blank `userData` during the export: the render loop keeps running and reads it.
- Call `geometry.normalizeNormals()` on every mesh geometry first, or the exporter logs a warning per mesh.
- Hide empty `Object3D` anchors and helper meshes (contact blobs) for the export, then restore them.
- Export the model group only, not the scene, so lights, ground and labels stay out.

## CSS2D labels

- `CSS2DRenderer` honours only each object's own `visible`, not its parent's. Toggle every label.
- Place labels in screen space, then un-project onto the camera-facing plane through the anchor so the
  leader line stays in the screen plane. Clamp to the viewport and keep clear of the control panel.

## Testing in headless Chromium

- Launch with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.
- Software GL is slow (about 15 fps for this scene). Clamp tween `dt` for sanity but never assert on wall-clock
  durations; add `seek(t)` style debug hooks and wait a couple of seconds for frames to render.
- Expose `window.<app>Debug` with state, camera rig and key objects. It makes screenshots and interaction tests easy.

## Publishing (Artifacts and similar hosts)

- Build with `vite build --base=./`, then inline CSS and JS into one HTML body: `<title>`, `<style>`,
  `<div id="app">`, `<script type="module">`. Escape `</script` in the bundle as `<\/script`.
- The page runs in a locked frame: no downloads from `<a download>` or blob URLs. The `downloads` capability
  only allows certain extensions and `.glb` is not among them, so "Export GLB" cannot work there. Intercept the
  click in capture phase and say so in the UI instead of failing silently.
- External scripts load only from an allowlist of CDNs; bundle everything instead.
- Pick a title that names the thing in two to four words and put the explanation in the description field.

## Things that looked fine in code and were wrong on screen

- A fixed "stand this far behind the grips" distance made tall and short users fit differently. Scale it with
  stature and verify with a sweep of heights.
- A caption card covering the lower fifth of the viewport hid the feet. Reserve space with `setViewOffset`.
- Fit messages must match the cause: an unreachable grip means "handle too low", not "too far or too high".
- A fixed-height model compared fairly only after its grip height matched the recommended height for the
  default user.
