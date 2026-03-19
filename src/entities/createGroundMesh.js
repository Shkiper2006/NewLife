import { createModelMatrix } from '../systems/math3d.js';

export function createGroundMesh() {
  const size = 14;
  const vertices = [
    -size, 0, -size,
    size, 0, -size,
    size, 0, size,
    -size, 0, -size,
    size, 0, size,
    -size, 0, size,
  ];

  const normals = new Array(6).fill([0, 1, 0]).flat();
  const colors = new Array(6).fill([0.21, 0.38, 0.23]).flat();

  return {
    vertices,
    normals,
    colors,
    modelMatrix: createModelMatrix({ translation: [0, 0, 0] }),
  };
}
