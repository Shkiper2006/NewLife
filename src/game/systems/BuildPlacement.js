import { getBuildingDefinition } from '../data/buildings.js';
import { validateBuildingPlacement } from './BuildValidation.js';
import { BASE_SNAP_POINTS } from './SnapPoints.js';

export function createBuildPlacementSystem(overrides = {}) {
  const snapPoints = overrides.snapPoints ?? BASE_SNAP_POINTS;

  return {
    tryPlace(structureId, state) {
      const building = getBuildingDefinition(structureId);
      if (!building) {
        return { placed: false, reason: `Неизвестная постройка: ${structureId}.` };
      }

      const validation = validateBuildingPlacement(building, state, snapPoints);
      if (!validation.valid) {
        return { placed: false, reason: validation.reason };
      }

      const placement = {
        id: `${structureId}-${state.base.placements.length + 1}`,
        structureId,
        snapPointId: validation.snapPoint.id,
        position: { x: validation.snapPoint.x, z: validation.snapPoint.z },
        effects: { ...building.effects },
      };

      state.base.placements.push(placement);
      recalculateBaseSummary(state);

      return { placed: true, placement, reason: validation.reason };
    },
    getSnapPoints() {
      return snapPoints;
    },
  };
}

export function recalculateBaseSummary(state) {
  const summary = {
    shelterCoverage: 0,
    defenseCoverage: 0,
    utilityCoverage: 0,
    recoveryRate: 0,
    saveUnlocked: false,
  };

  for (const placement of state.base.placements) {
    if (placement.structureId.includes('shelter') || placement.structureId === 'tent') {
      summary.shelterCoverage += 0.34;
    }
    if (placement.structureId === 'fortification' || placement.structureId === 'trap') {
      summary.defenseCoverage += 0.3;
    }
    if (placement.structureId === 'generator' || placement.structureId === 'water_purifier') {
      summary.utilityCoverage += 0.4;
    }

    summary.recoveryRate += placement.effects.recovery ?? 0;
    summary.saveUnlocked ||= Boolean(placement.effects.saveUnlocked);
  }

  state.base.summary = {
    shelterCoverage: Math.min(summary.shelterCoverage, 1),
    defenseCoverage: Math.min(summary.defenseCoverage, 1),
    utilityCoverage: Math.min(summary.utilityCoverage, 1),
    recoveryRate: summary.recoveryRate,
    saveUnlocked: summary.saveUnlocked,
  };
}
