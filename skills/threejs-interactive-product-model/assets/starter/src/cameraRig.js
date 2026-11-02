import * as THREE from 'three';
import { easeInOutCubic } from './tween.js';
import { ORBIT_TARGET } from './stage.js';

// Direction from the orbit target plus the half extents (metres) the shot has to fit.
const PRESETS = {
  front: { direction: new THREE.Vector3(0, 0.1, 1), halfWidth: 0.25, halfHeight: 0.3 },
  side: { direction: new THREE.Vector3(1, 0.1, 0), halfWidth: 0.25, halfHeight: 0.3 },
  threeQuarter: { direction: new THREE.Vector3(-1, 0.55, 1.2), halfWidth: 0.32, halfHeight: 0.32 },
  top: { direction: new THREE.Vector3(0, 1, 0.05), halfWidth: 0.3, halfHeight: 0.3 },
};
const DURATION = 0.9;

/** Smooth camera moves in spherical coordinates around the orbit target. User input cancels a move. */
export class CameraRig {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.motion = null;
    controls.addEventListener('start', () => (this.motion = null));
  }

  fitDistance({ halfWidth, halfHeight }) {
    const { clientWidth: width, clientHeight: height } = this.camera.userData.container;
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    return 1.15 * Math.max(halfHeight / tanHalfFov, halfWidth / ((width / height) * tanHalfFov));
  }

  goTo(name) {
    const preset = PRESETS[name];
    if (!preset) return;
    const offset = preset.direction.clone().normalize().multiplyScalar(this.fitDistance(preset));
    this.flyTo(offset.add(ORBIT_TARGET), ORBIT_TARGET);
  }

  flyTo(position, target) {
    this.motion = {
      elapsed: 0,
      fromTarget: this.controls.target.clone(),
      toTarget: target.clone(),
      from: new THREE.Spherical().setFromVector3(this.camera.position.clone().sub(this.controls.target)),
      to: new THREE.Spherical().setFromVector3(position.clone().sub(target)),
    };
    const turn = this.motion.to.theta - this.motion.from.theta;
    this.motion.to.theta -= Math.round(turn / (2 * Math.PI)) * 2 * Math.PI; // the short way round
  }

  /** Move camera and target together, e.g. to follow a subject that is walking. */
  shift(delta) {
    this.camera.position.add(delta);
    this.controls.target.add(delta);
    if (this.motion) {
      this.motion.fromTarget.add(delta);
      this.motion.toTarget.add(delta);
    }
  }

  update(delta) {
    if (!this.motion) return;
    const motion = this.motion;
    motion.elapsed += delta;
    const progress = Math.min(1, motion.elapsed / DURATION);
    const eased = easeInOutCubic(progress);
    this.controls.target.lerpVectors(motion.fromTarget, motion.toTarget, eased);
    const spherical = new THREE.Spherical(
      THREE.MathUtils.lerp(motion.from.radius, motion.to.radius, eased),
      THREE.MathUtils.lerp(motion.from.phi, motion.to.phi, eased),
      THREE.MathUtils.lerp(motion.from.theta, motion.to.theta, eased),
    );
    this.camera.position.copy(this.controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
    this.camera.lookAt(this.controls.target);
    if (progress >= 1) this.motion = null;
  }
}
