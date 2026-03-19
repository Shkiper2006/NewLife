import { createModelMatrix } from '../systems/math3d.js';

function pushTriangle(target, a, b, c) {
  target.push(...a, ...b, ...c);
}

function buildCylinder(radius, halfHeight, segments) {
  const vertices = [];
  const normals = [];
  const colors = [];

  for (let index = 0; index < segments; index += 1) {
    const angleA = (index / segments) * Math.PI * 2;
    const angleB = ((index + 1) / segments) * Math.PI * 2;
    const xA = Math.cos(angleA) * radius;
    const zA = Math.sin(angleA) * radius;
    const xB = Math.cos(angleB) * radius;
    const zB = Math.sin(angleB) * radius;
    const normalA = [Math.cos(angleA), 0, Math.sin(angleA)];
    const normalB = [Math.cos(angleB), 0, Math.sin(angleB)];

    pushTriangle(vertices, [xA, -halfHeight, zA], [xB, -halfHeight, zB], [xB, halfHeight, zB]);
    normals.push(...normalA, ...normalB, ...normalB);
    pushTriangle(vertices, [xA, -halfHeight, zA], [xB, halfHeight, zB], [xA, halfHeight, zA]);
    normals.push(...normalA, ...normalB, ...normalA);

    colors.push(...new Array(6).fill([0.98, 0.45, 0.09]).flat());
  }

  return { vertices, normals, colors };
}

function buildHemisphere(radius, offsetY, segments, rings) {
  const vertices = [];
  const normals = [];
  const colors = [];

  for (let ring = 0; ring < rings; ring += 1) {
    const v0 = ring / rings;
    const v1 = (ring + 1) / rings;
    const theta0 = (v0 * Math.PI) / 2;
    const theta1 = (v1 * Math.PI) / 2;

    for (let segment = 0; segment < segments; segment += 1) {
      const u0 = (segment / segments) * Math.PI * 2;
      const u1 = ((segment + 1) / segments) * Math.PI * 2;

      const p00 = pointOnHemisphere(radius, theta0, u0, offsetY);
      const p01 = pointOnHemisphere(radius, theta0, u1, offsetY);
      const p10 = pointOnHemisphere(radius, theta1, u0, offsetY);
      const p11 = pointOnHemisphere(radius, theta1, u1, offsetY);

      pushTriangle(vertices, p00.position, p01.position, p11.position);
      normals.push(...p00.normal, ...p01.normal, ...p11.normal);
      pushTriangle(vertices, p00.position, p11.position, p10.position);
      normals.push(...p00.normal, ...p11.normal, ...p10.normal);
      colors.push(...new Array(6).fill([0.98, 0.45, 0.09]).flat());
    }
  }

  return { vertices, normals, colors };
}

function pointOnHemisphere(radius, theta, phi, offsetY) {
  const x = Math.sin(theta) * Math.cos(phi) * radius;
  const y = Math.cos(theta) * radius + offsetY;
  const z = Math.sin(theta) * Math.sin(phi) * radius;
  return {
    position: [x, y, z],
    normal: [x / radius, (y - offsetY) / radius, z / radius],
  };
}

export function createPlayerCapsuleMesh() {
  const radius = 0.35;
  const halfHeight = 0.55;
  const segments = 20;
  const rings = 10;
  const cylinder = buildCylinder(radius, halfHeight, segments);
  const top = buildHemisphere(radius, halfHeight, segments, rings);
  const bottom = buildHemisphere(radius, -halfHeight, segments, rings);
  const bottomVertices = [];
  const bottomNormals = [];

  for (let index = 0; index < bottom.vertices.length; index += 3) {
    bottomVertices.push(bottom.vertices[index], -bottom.vertices[index + 1], bottom.vertices[index + 2]);
    bottomNormals.push(bottom.normals[index], -bottom.normals[index + 1], bottom.normals[index + 2]);
  }

  const vertices = [...cylinder.vertices, ...top.vertices, ...bottomVertices];
  const normals = [...cylinder.normals, ...top.normals, ...bottomNormals];
  const colors = [...cylinder.colors, ...top.colors, ...bottom.colors];

  const visorVertices = [
    -0.11, 0.2, radius + 0.01,
    0.11, 0.2, radius + 0.01,
    0.11, 0.45, radius + 0.01,
    -0.11, 0.2, radius + 0.01,
    0.11, 0.45, radius + 0.01,
    -0.11, 0.45, radius + 0.01,
  ];
  const visorNormals = new Array(6).fill([0, 0, 1]).flat();
  const visorColors = new Array(6).fill([0.07, 0.09, 0.16]).flat();

  return {
    vertices: [...vertices, ...visorVertices],
    normals: [...normals, ...visorNormals],
    colors: [...colors, ...visorColors],
    modelMatrix: createModelMatrix({ translation: [0, 1.12, 0] }),
  };
}
