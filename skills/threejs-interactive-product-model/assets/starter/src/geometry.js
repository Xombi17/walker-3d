import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);

export function castAndReceive(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return object;
}

/** Keeps Object3D references out of glTF `extras` (they are circular and would break JSON.stringify). */
export function setHiddenUserData(object, key, value) {
  Object.defineProperty(object.userData, key, { value, enumerable: false, writable: true, configurable: true });
}

/** Cylinder from point a to point b. */
export function tubeBetween(a, b, radius, material, radialSegments = 32) {
  const direction = new THREE.Vector3().subVectors(b, a);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), radialSegments), material);
  mesh.position.addVectors(a, b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, direction.normalize());
  return castAndReceive(mesh);
}

/** Soft radial blob used as a fake contact shadow under a part. Skipped by the exporter. */
let blobTexture;
export function createContactBlob(radius, opacity = 0.5) {
  if (!blobTexture) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(0.4, 'rgba(0,0,0,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    blobTexture = new THREE.CanvasTexture(canvas);
  }
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 2, radius * 2),
    new THREE.MeshBasicMaterial({ map: blobTexture, transparent: true, opacity, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.0008;
  mesh.userData.excludeFromExport = true;
  return mesh;
}
