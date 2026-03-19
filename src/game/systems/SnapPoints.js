export const BASE_SNAP_POINTS = Object.freeze([
  Object.freeze({ id: 'base-ground', type: 'ground', x: -2.4, z: -1.4, stability: 0.85, clearance: 0.92 }),
  Object.freeze({ id: 'base-windbreak', type: 'windbreak', x: -1.2, z: 1.8, stability: 0.78, clearance: 0.9 }),
  Object.freeze({ id: 'base-camp', type: 'camp', x: 1.5, z: 1.2, stability: 0.8, clearance: 0.88 }),
  Object.freeze({ id: 'base-perimeter', type: 'perimeter', x: 3.2, z: -0.5, stability: 0.91, clearance: 0.95 }),
  Object.freeze({ id: 'base-utility', type: 'utility', x: 2.4, z: 2.3, stability: 0.87, clearance: 0.86 }),
  Object.freeze({ id: 'base-water', type: 'water', x: 0.2, z: -2.8, stability: 0.83, clearance: 0.82 }),
]);

export function getSnapPointsForBuilding(buildingDefinition, snapPoints = BASE_SNAP_POINTS) {
  return snapPoints.filter((point) => buildingDefinition.snapPoints.includes(point.type));
}
