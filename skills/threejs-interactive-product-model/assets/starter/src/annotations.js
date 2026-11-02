import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const REFERENCE_HEIGHT = 850;
const EDGE_MARGIN = 12;
const world = new THREE.Vector3();
const projected = new THREE.Vector3();

/**
 * Labels with leader lines. `notes`: [{ text, anchor: Object3D, offset: [dxPx, dyPx] }] (pixels at an 850 px tall
 * viewport; a negative dx puts the label on the left). Labels are placed in screen space, clamped to the viewport and
 * kept clear of `.control-panel`, then un-projected so the 3D leader line stays in the screen plane.
 */
export function createAnnotations(scene, notes, camera, container) {
  const group = new THREE.Group();
  scene.add(group);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x2a2a30, depthTest: false, transparent: true, opacity: 0.85 });

  const items = notes.map((note) => {
    const isLeft = note.offset[0] < 0;
    const label = document.createElement('div');
    label.className = `annotation ${isLeft ? 'annotation--left' : 'annotation--right'}`;
    label.textContent = note.text;
    const labelObject = new CSS2DObject(label);
    labelObject.center.set(isLeft ? 1 : 0, 0.5);
    const dot = document.createElement('div');
    dot.className = 'annotation-dot';
    const dotObject = new CSS2DObject(dot);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), lineMaterial);
    line.frustumCulled = false;
    line.renderOrder = 999;
    group.add(labelObject, dotObject, line);
    return { ...note, isLeft, label, labelObject, dotObject, line };
  });

  function update() {
    if (!group.visible) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const scale = height / REFERENCE_HEIGHT;
    const panel = container.querySelector('.control-panel')?.getBoundingClientRect();
    const box = container.getBoundingClientRect();
    camera.updateMatrixWorld();
    for (const item of items) {
      item.anchor.getWorldPosition(world);
      item.dotObject.position.copy(world);
      projected.copy(world).project(camera);
      const labelWidth = item.label.offsetWidth || 190;
      const half = (item.label.offsetHeight || 24) / 2;
      const y = THREE.MathUtils.clamp(((1 - projected.y) / 2) * height + item.offset[1] * scale, half + EDGE_MARGIN, height - half - EDGE_MARGIN);
      let x = ((projected.x + 1) / 2) * width + item.offset[0] * scale;
      let minX = EDGE_MARGIN;
      if (panel && panel.width > 0 && y + half > panel.top - box.top - 8 && y - half < panel.bottom - box.top + 8) {
        minX = panel.right - box.left + EDGE_MARGIN;
      }
      x = item.isLeft ? Math.max(x, minX + labelWidth) : Math.min(x, width - EDGE_MARGIN - labelWidth);
      projected.set((x / width) * 2 - 1, -((y / height) * 2 - 1), projected.z).unproject(camera);
      item.labelObject.position.copy(projected);
      const positions = item.line.geometry.attributes.position;
      positions.setXYZ(0, world.x, world.y, world.z);
      positions.setXYZ(1, projected.x, projected.y, projected.z);
      positions.needsUpdate = true;
    }
  }

  function setVisible(visible) {
    group.visible = visible;
    for (const item of items) item.labelObject.visible = item.dotObject.visible = visible; // CSS2D ignores parent visibility
  }
  setVisible(false);
  return { update, setVisible };
}
