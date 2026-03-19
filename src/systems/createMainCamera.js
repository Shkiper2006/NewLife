import { createLookAtMatrix, createPerspectiveMatrix } from './math3d.js';

export function createMainCamera() {
  return {
    fovRadians: (50 * Math.PI) / 180,
    near: 0.1,
    far: 100,
    position: [5.5, 4.5, 7],
    target: [0, 1, 0],
    up: [0, 1, 0],
    getProjectionMatrix(aspect) {
      return createPerspectiveMatrix(this.fovRadians, aspect, this.near, this.far);
    },
    getViewMatrix() {
      return createLookAtMatrix(this.position, this.target, this.up);
    },
  };
}
