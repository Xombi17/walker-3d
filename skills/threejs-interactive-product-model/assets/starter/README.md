# Product viewer starter

A small, runnable three.js + Vite project that shows the pattern: parts as functions returning groups with pivots,
one plain `state` object, `product.apply(state)` every frame, eased tweens, camera presets, annotations and GLB export.
The example product is a desk lamp. Replace `src/product.js` and `src/constants.js` with your own object.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

`window.appDebug` exposes `state`, `rig` and `product` for scripted screenshots.
