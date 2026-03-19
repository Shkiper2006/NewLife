import { getSnapPointsForBuilding } from './SnapPoints.js';

export function validateBuildingPlacement(buildingDefinition, state, snapPoints) {
  const availableSnapPoints = getSnapPointsForBuilding(buildingDefinition, snapPoints).filter(
    (point) => !state.base.placements.some((placement) => placement.snapPointId === point.id),
  );

  if (availableSnapPoints.length === 0) {
    return { valid: false, reason: 'Нет свободной точки привязки.' };
  }

  const preferredSnapPoint = [...availableSnapPoints].sort((left, right) => right.stability - left.stability)[0];
  if (preferredSnapPoint.clearance < 0.8 || preferredSnapPoint.stability < buildingDefinition.stability * 0.8) {
    return { valid: false, reason: 'Точка привязки недостаточно стабильна.' };
  }

  const baseSafety = state.needs.safety;
  if (baseSafety < buildingDefinition.minSafety) {
    return { valid: false, reason: `Нужно минимум ${buildingDefinition.minSafety} безопасности базы.` };
  }

  return { valid: true, snapPoint: preferredSnapPoint, reason: 'Размещение возможно.' };
}
