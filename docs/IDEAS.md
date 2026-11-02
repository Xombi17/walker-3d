# Making a three.js project stand out

Ranked by how much each one changes how the project is judged, for a course demo or a portfolio piece. Effort is a
rough guess for one person who already has this codebase. Pick two or three that serve the audience.

| # | Idea | Why it stands out | Effort |
| :-- | :--- | :--- | :--- |
| 1 | **Record a demo video from the page** (`canvas.captureStream` + `MediaRecorder`, a "Record walkthrough" button) | Judges watch a video; this gives you a perfect, repeatable one, and a turntable clip for the README | small |
| 2 | **Stability and tipping test** (Rapier physics or a simple centre-of-pressure model): push the walker, draw the support polygon on the floor, show the tipping angle for old vs new | Turns "wider base" from a claim into a number | medium |
| 3 | **Personas and a usability questionnaire**: presets (tall adult, small adult, wheelchair-adjacent, injured), a short SUS form, results saved and charted | It is HMI evidence, not just graphics | medium |
| 4 | **Look upgrade with post-processing**: ambient occlusion, bloom on the LED, depth-of-field focus pull on annotation click | Biggest visual jump per hour | small to medium |
| 5 | **AR / model-viewer**: export GLB (and USDZ) and open in the phone camera at real scale | Putting a 0.85 m walker in the room is persuasive | small |
| 6 | **X-ray, section and exploded view** in a shader or by clipping planes | Shows the telescoping mechanism and the hidden tube overlap | small |
| 7 | **Scroll-driven story mode**: one page, the camera on rails through the five steps, captions on scroll | Reads like a product launch page | medium |
| 8 | **Animated GLB export**: an `AnimationMixer` clip per walkthrough step so the export plays in any viewer | A portable deliverable | medium |
| 9 | **Digital twin vs the real prototype** with a Gaussian-splat capture of a cardboard or 3D-printed mock-up side by side | Shows physical testing happened | large |
| 10 | **Live critique room**: shared state and presence so classmates see your camera and comments | Collaboration, in a hosted page | medium |

## What the search turned up

- WebGPU is production-ready in the major browsers and TSL (three.js shading language) runs on WebGPU or WebGL; the
  migration guide recommends TSL bloom and other nodes over legacy `EffectComposer` passes
  ([migration guide](https://www.utsubo.com/ja/blog/webgpu-threejs-migration-guide),
  [post-processing thread](https://discourse.threejs.org/t/three-js-webgpu-post-processing-effects/87390)).
- A TSL post-processing pipeline can pull focus with elastic damping, a good model for a depth-of-field click-to-focus
  on annotations ([Codrops: BatchedMesh and WebGPURenderer](https://tympanus.net/codrops/2024/10/30/interactive-3d-with-three-js-batchedmesh-and-webgpurenderer/)).
- CPU particle updates hit a wall near 50,000 particles; compute shaders push far beyond that
  ([100 three.js tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips)).
  A GPGPU recipe: [Codrops: GPGPU particles](https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/);
  a gallery of 115 such effects: [danlex/particles](https://github.com/danlex/particles).
- Gaussian splats reconstruct a scene from roughly 50 to 200 photos as millions of ellipsoids
  ([web 3D guide](https://studiomeyer.io/en/blog/3d-webdesign-webgl)).
- Version-accurate three.js guidance for agents (r186): [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills).

The searches found no good scroll-driven camera reference, so idea 7 is based on the camera rig already in this repo.

## Cheapest high-impact order for the walker project

1. Video recorder (1), 2. persona presets with the fit readout already built (3, first half), 3. post-processing look (4),
4. stability polygon (2, simple version), 5. AR export (5).
