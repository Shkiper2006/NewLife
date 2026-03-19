import { AgeStage } from '../progression/ageStages.js';

export const PlayerRole = Object.freeze({
  Engineer: 'Engineer',
  Scout: 'Scout',
  Builder: 'Builder',
  Medic: 'Medic',
});

const ROLE_STAGE_SCALARS = Object.freeze({
  [AgeStage.Infant]: 0.55,
  [AgeStage.Child]: 0.72,
  [AgeStage.Teen]: 0.88,
  [AgeStage.Adult]: 1,
});

export const ROLE_DEFINITIONS = Object.freeze({
  [PlayerRole.Engineer]: freezeRole({
    id: PlayerRole.Engineer,
    label: 'Engineer',
    gameplayFocus: 'repair, power routing, automation',
    replicatedBonuses: {
      buildSpeed: 1.12,
      repairEfficiency: 1.3,
      powerThroughput: 1.2,
      craftingQuality: 1.12,
    },
  }),
  [PlayerRole.Scout]: freezeRole({
    id: PlayerRole.Scout,
    label: 'Scout',
    gameplayFocus: 'vision, pathfinding, danger intel',
    replicatedBonuses: {
      moveSpeed: 1.1,
      visibilityRadius: 1.35,
      lootDetection: 1.25,
      eventAwareness: 1.18,
    },
  }),
  [PlayerRole.Builder]: freezeRole({
    id: PlayerRole.Builder,
    label: 'Builder',
    gameplayFocus: 'placement, fortification, structural stability',
    replicatedBonuses: {
      buildSpeed: 1.24,
      placementRange: 1.18,
      structureDurability: 1.2,
      salvageRefund: 1.15,
    },
  }),
  [PlayerRole.Medic]: freezeRole({
    id: PlayerRole.Medic,
    label: 'Medic',
    gameplayFocus: 'healing, revive, sustain',
    replicatedBonuses: {
      reviveSpeed: 1.28,
      healingOutput: 1.22,
      restRecovery: 1.18,
      consumableEfficiency: 1.14,
    },
  }),
});

export function listPlayerRoles() {
  return Object.values(PlayerRole);
}

export function getRoleDefinition(role) {
  return ROLE_DEFINITIONS[role] ?? ROLE_DEFINITIONS[PlayerRole.Engineer];
}

export function createRoleSyncState(role, stage) {
  const definition = getRoleDefinition(role);
  const scalar = ROLE_STAGE_SCALARS[stage] ?? 1;

  return {
    role: definition.id,
    gameplayFocus: definition.gameplayFocus,
    bonuses: Object.fromEntries(
      Object.entries(definition.replicatedBonuses).map(([bonusId, baseValue]) => [bonusId, roundBonus(1 + (baseValue - 1) * scalar)]),
    ),
    syncedFields: Object.keys(definition.replicatedBonuses),
  };
}

function freezeRole(role) {
  return Object.freeze({
    ...role,
    replicatedBonuses: Object.freeze({ ...role.replicatedBonuses }),
  });
}

function roundBonus(value) {
  return Math.round(value * 100) / 100;
}
