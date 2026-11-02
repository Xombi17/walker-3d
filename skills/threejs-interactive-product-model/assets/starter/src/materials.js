import * as THREE from 'three';
import { COLORS } from './constants.js';

export function createMaterials() {
  return {
    metal: new THREE.MeshStandardMaterial({ name: 'Metal', color: 0xf0ece6, metalness: 0.9, roughness: 0.3 }),
    black: new THREE.MeshStandardMaterial({ name: 'Black', color: 0x19191b, roughness: 0.6 }),
    accent: new THREE.MeshStandardMaterial({ name: 'Accent', color: COLORS.accent, roughness: 0.5 }),
    bulb: new THREE.MeshStandardMaterial({ name: 'Bulb', color: 0x222222, emissive: 0xffd9a0, emissiveIntensity: 2 }),
  };
}
