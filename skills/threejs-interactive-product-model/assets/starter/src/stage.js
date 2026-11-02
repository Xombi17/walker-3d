import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { COLORS } from './constants.js';

export const ORBIT_TARGET = new THREE.Vector3(0, 0.25, 0);

/** Renderer, camera, orbit controls, studio lighting and a ground that only draws shadows. */
export function createStage(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap is deprecated in r182+
  renderer.toneMapping = THREE.NeutralToneMapping; // keeps saturated brand colours honest
  container.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = 'label-layer';
  container.appendChild(labelRenderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.background);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.15;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 60);
  camera.userData.container = container;
  camera.position.set(-0.9, 0.7, 1.1);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(ORBIT_TARGET);
  controls.enableDamping = true;
  controls.minDistance = 0.3;
  controls.maxDistance = 5;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.update();

  const key = new THREE.DirectionalLight(0xfff3e6, 2.2);
  key.position.set(0.7, 3, 1.1);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -1, right: 1, top: 1, bottom: -1, near: 0.5, far: 8 });
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.008;
  key.shadow.radius = 6;
  scene.add(key, new THREE.HemisphereLight(0xffffff, 0xb9bdc6, 0.25));

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.17 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // `left` and `bottom` keep the model clear of UI laid over the canvas; null left means "none".
  const layout = { fov: null, left: 0, bottom: 0 };
  function applyView() {
    const { clientWidth: width, clientHeight: height } = container;
    camera.aspect = width / height;
    camera.fov = layout.fov ?? (camera.aspect < 1 ? 46 : 32);
    if (layout.left > 0 || layout.bottom > 0) camera.setViewOffset(width, height, -layout.left / 2, layout.bottom / 2, width, height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  function resize() {
    const { clientWidth: width, clientHeight: height } = container;
    renderer.setSize(width, height);
    labelRenderer.setSize(width, height);
    applyView();
  }
  window.addEventListener('resize', resize);
  resize();

  return {
    renderer,
    labelRenderer,
    scene,
    camera,
    controls,
    setLayout(next) {
      Object.assign(layout, next);
      applyView();
    },
  };
}
