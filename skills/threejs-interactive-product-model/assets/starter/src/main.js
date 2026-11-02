import * as THREE from 'three';
import './style.css';
import { DEFAULT_STATE, DIM } from './constants.js';
import { createStage } from './stage.js';
import { createProduct } from './product.js';
import { createControls } from './controls.js';
import { createAnnotations } from './annotations.js';
import { CameraRig } from './cameraRig.js';
import { Tweener } from './tween.js';
import { exportGLB } from './exporter.js';

const container = document.getElementById('app');
const { renderer, labelRenderer, scene, camera, controls: orbit } = createStage(container);

const product = createProduct();
scene.add(product.group);

const state = { ...DEFAULT_STATE }; // the single source of truth for the pose
product.apply(state);

const tweens = new Tweener();
const rig = new CameraRig(camera, orbit);
rig.goTo('threeQuarter');
rig.update(10); // start framed, no tween

const annotations = createAnnotations(
  scene,
  [
    { text: 'Adjustable head', anchor: product.anchors.head, offset: [-170, -90] },
    { text: 'Pivot joint', anchor: product.anchors.joint, offset: [180, -20] },
    { text: 'Weighted base', anchor: product.anchors.base, offset: [190, 70] },
  ],
  camera,
  container,
);

const ui = createControls(
  container,
  {
    title: 'Desk Lamp',
    sliders: [
      { id: 'armAngle', label: 'Arm angle', min: DIM.armAngleRange[0], max: DIM.armAngleRange[1], step: 1, value: state.armAngle, unit: '°' },
      { id: 'headTilt', label: 'Head tilt', min: DIM.headTiltRange[0], max: DIM.headTiltRange[1], step: 1, value: state.headTilt, unit: '°' },
    ],
    toggles: [
      { id: 'lampOn', label: 'Lamp on', checked: true },
      { id: 'notes', label: 'Annotations', checked: false },
    ],
  },
  {
    slider: (id, value) => (state[id] = value),
    toggle(id, checked) {
      if (id === 'lampOn') tweens.to(state, 'lampOn', checked ? 1 : 0, 0.4); // eased, not snapped
      if (id === 'notes') annotations.setVisible(checked);
    },
    view: (name) => rig.goTo(name),
    async export() {
      try {
        ui.setStatus(`Exported model.glb (${((await exportGLB(product.group)) / 1024).toFixed(0)} KB)`);
      } catch (error) {
        console.error(error);
        ui.setStatus('Export failed, see the console.');
      }
    },
  },
);

const timer = new THREE.Timer();
timer.connect(document);
renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  const delta = Math.min(timer.getDelta(), 0.1);
  tweens.update(delta);
  product.apply(state);
  scene.updateMatrixWorld(true); // anchors must be current before annotations read them
  rig.update(delta);
  orbit.update(delta);
  annotations.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
});

window.appDebug = { state, rig, product, orbit, camera, annotations };
