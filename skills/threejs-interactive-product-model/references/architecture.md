# Architecture

## File layout (one concern per file)

```
src/
  main.js         wiring and the animation loop; owns `state`, the tweener and the UI actions
  constants.js    dimension table, colours, default state          <- start here
  stage.js        renderer, camera, orbit, lights, ground, setLayout
  product.js      assembles the parts; apply(state) poses the whole model
  <part>.js       one file per mechanism, each exports createX(...) -> THREE.Group
  controls.js     DOM control panel; takes `actions`, returns setters for the model to call back
  annotations.js  labels and leader lines
  cameraRig.js    presets and tweened camera moves
  exporter.js     GLB export
  materials.js    shared materials
  geometry.js     tube/collar/hole helpers
  tween.js        eased tweens
```

## State flow

```
UI event -> actions.* -> tween or assign `state.x`
every frame: tweens.update(dt) -> product.apply(state) -> pair.updateMatrixWorld(true)
             -> anything that reads world positions (IK, annotations) -> render
```

`product.apply` must be cheap and idempotent (plain assignments of rotations, positions, scales). Updating
world matrices before IK or annotation anchors read them avoids a one-frame lag.

## Pivot patterns

- **Hinge:** a group at the hinge axis; the visible mesh is offset inside it. Rotating the group swings the part.
  (Rest panel: hinge at the bottom edge, pad offset up by half its height, rotate about X by -90 degrees to
  swing it rearward into a horizontal perch.)
- **Telescope:** a unit-length cylinder whose geometry is translated so its base is at the origin, then
  `scale.y = length`. Radii stay constant, so scaling is safe.
- **Two-bone limb that must stay planted** (a foot on a tilting leg): counter-rotate the child by the
  parent's angle.
- **Frames that fold:** move the group along one axis and tuck sub-groups; a pure swing makes mirrored
  frames cross each other.
- **Scaled-in-one-axis panels:** build the geometry at maximum width and scale down, so the unfolded size is
  exact and only the folded state distorts rounded corners.

## Two-bone IK in 3D (arms and legs)

Given root R, target T, bone lengths a and b, pole vector P:

```
d = clamp(|T-R|, |a-b|+eps, (a+b)*0.999)
along = (a^2 - b^2 + d^2) / (2d);  height = sqrt(max(a^2 - along^2, 0))
mid = R + axis*along + normalize(P - axis*(P.axis)) * height
flexion = pi - acos((a^2 + b^2 - d^2) / (2ab))
```

Return `reached = |T-R| <= a+b` so the UI can say "out of reach".
Pelvis height from the feet: for each leg `y <= ankle.y + sqrt(reach^2 - horizontal^2)`; take the minimum and the
pose never over-extends a leg, so walking gets a natural bob for free.

## Gait without a physics engine

Everything is a function of time `tau`:

- The walker steps ahead during a short window of each cycle; the user's pelvis moves continuously and lags.
- Each foot swings in turn to a plant point computed from where the pelvis will be mid-swing (plus a small lead).
- Feet are defined in world space and converted to the moving walker's space by subtracting its position.
- Compute plants with a translation-invariant helper (`standZ = 0`) and add the offset at the call site. The one
  time this was forgotten the pelvis ended up on top of the grips.

## Before/after compare (scissor wipe)

Render the scene twice per frame with `renderer.setScissorTest(true)`: model A visible in the left rectangle,
model B in the right. Both models sit in the same place. The divider is a DOM element with
`role="slider"`, pointer capture and arrow-key support.

## Camera

- Presets are a direction plus half-extents; distance is computed from the fov, the aspect and the free width.
- `camera.setViewOffset` shifts the image away from UI that overlaps the canvas (control panel on the left,
  caption card at the bottom) so the model is centred in what the user can actually see.
- `flyTo` tweens in spherical coordinates around the target and takes the short way round.
- `shift(delta)` moves camera and target together so a follow camera can run during a tween.
