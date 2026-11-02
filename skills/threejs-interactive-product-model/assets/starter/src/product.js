import * as THREE from 'three';
import { DIM } from './constants.js';
import { createMaterials } from './materials.js';
import { castAndReceive, createContactBlob, setHiddenUserData, tubeBetween } from './geometry.js';

const point = (x, y, z) => new THREE.Vector3(x, y, z);

/** Weighted base: a lathe profile with a thin accent ring. Origin on the floor. */
function createBase(materials) {
  const profile = [[0, 0], [DIM.baseRadius, 0], [DIM.baseRadius + 0.004, 0.006], [DIM.baseRadius - 0.01, DIM.baseHeight], [0, DIM.baseHeight]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const base = new THREE.Group();
  base.name = 'Base';
  base.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 48), materials.black));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(DIM.baseRadius - 0.012, 0.003, 12, 48), materials.accent);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = DIM.baseHeight;
  base.add(ring, createContactBlob(0.16));
  return castAndReceive(base);
}

/** Cone shade with an emissive bulb. Origin at the hinge; the shade points along +Y of the group. */
function createHead(materials) {
  const head = new THREE.Group();
  head.name = 'Head';
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.055, DIM.headLength, 40, 1, true), materials.accent);
  shade.material.side = THREE.DoubleSide;
  shade.position.y = DIM.headLength / 2;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.026, 24, 16), materials.bulb);
  bulb.position.y = DIM.headLength * 0.62;
  head.add(shade, bulb);
  return castAndReceive(head);
}

/**
 * The product. `apply(state)` poses it from plain numbers, `anchors` are what annotations point at.
 * Pattern: each moving part is a group whose origin is its joint, so rotating the group moves the part.
 */
export function createProduct() {
  const materials = createMaterials();
  const group = new THREE.Group();
  group.name = 'DeskLamp';

  group.add(createBase(materials));

  const armPivot = new THREE.Group(); // rotates about the base joint
  armPivot.name = 'ArmPivot';
  armPivot.position.y = DIM.baseHeight;
  armPivot.add(tubeBetween(point(0, 0, 0), point(0, DIM.armLength, 0), DIM.armRadius, materials.metal));
  const elbow = new THREE.Mesh(new THREE.SphereGeometry(DIM.armRadius * 1.9, 24, 16), materials.accent);
  armPivot.add(castAndReceive(elbow));
  group.add(armPivot);

  const headPivot = new THREE.Group(); // rotates about the arm tip, inside armPivot so it follows the arm
  headPivot.name = 'HeadPivot';
  headPivot.position.y = DIM.armLength;
  const head = createHead(materials);
  headPivot.add(head);
  armPivot.add(headPivot);

  const light = new THREE.PointLight(0xffd9a0, 1.2, 1.5, 2);
  light.position.y = DIM.headLength * 0.62;
  head.add(light);

  const anchors = { head: new THREE.Object3D(), joint: new THREE.Object3D(), base: new THREE.Object3D() };
  anchors.head.position.set(0.04, DIM.headLength * 0.7, 0);
  head.add(anchors.head);
  armPivot.add(anchors.joint);
  anchors.base.position.set(DIM.baseRadius * 0.8, DIM.baseHeight * 0.5, 0);
  group.add(anchors.base);
  setHiddenUserData(group, 'anchors', anchors);

  function apply(state) {
    armPivot.rotation.z = -THREE.MathUtils.degToRad(state.armAngle);
    headPivot.rotation.z = -THREE.MathUtils.degToRad(state.headTilt);
    materials.bulb.emissiveIntensity = 2 * state.lampOn;
    light.intensity = 1.2 * state.lampOn;
  }

  return { group, materials, anchors, apply };
}
