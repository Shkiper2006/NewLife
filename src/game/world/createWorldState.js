import { getAgeStageCapabilities } from '../progression/ageStages.js';
import { describeRequirement, evaluateAccessRequirement } from './accessRequirements.js';
import { createWorldChunkLoader } from './chunkLoader.js';
import { ADULT_INFRASTRUCTURE_LAYER, EARLY_WORLD_VERTICALITY, WORLD_GATES, WORLD_ZONES } from './worldData.js';

export function createWorldState(playerState) {
  const chunkLoader = createWorldChunkLoader();

  function getContext() {
    const player = playerState.getSnapshot();
    const capabilities = getAgeStageCapabilities(player.stage);
    return { player, capabilities };
  }

  function isRequirementMet(requirement) {
    const { player, capabilities } = getContext();
    return evaluateAccessRequirement(player, capabilities, requirement);
  }

  return {
    getZone(zoneId) {
      return WORLD_ZONES[zoneId] ?? null;
    },
    listZones() {
      return Object.values(WORLD_ZONES);
    },
    listAccessibleZones() {
      return Object.values(WORLD_ZONES).filter((zone) => isRequirementMet(zone.entryRequirement));
    },
    listGateStatuses() {
      return WORLD_GATES.map((gate) => ({
        ...gate,
        unlocked: isRequirementMet(gate.requirement),
        requirementLabel: describeRequirement(gate.requirement),
      }));
    },
    getStreamingPlan(zoneId) {
      return chunkLoader.buildStreamingPlan(zoneId);
    },
    describeWorldSnapshot() {
      const accessibleZones = this.listAccessibleZones();
      const activeZone = accessibleZones.at(-1) ?? WORLD_ZONES.hospital;
      const gateStatuses = this.listGateStatuses();

      return {
        activeZoneId: activeZone.id,
        accessibleZoneIds: accessibleZones.map((zone) => zone.id),
        zones: accessibleZones.map((zone) => ({
          ...zone,
          chunkPlan: chunkLoader.buildStreamingPlan(zone.id),
        })),
        gates: gateStatuses,
        verticality: EARLY_WORLD_VERTICALITY,
        infrastructure: ADULT_INFRASTRUCTURE_LAYER,
      };
    },
  };
}
