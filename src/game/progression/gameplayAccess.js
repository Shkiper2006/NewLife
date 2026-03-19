import {
  canAccessZone,
  canCarryWeight,
  canCraftRecipe,
  canEquipWeaponTier,
  canReachHeight,
  canUseMovement,
  canUseWorldInteraction,
  getAgeStageCapabilities,
} from './ageStages.js';

export function createGameplayAccessController(playerState) {
  return {
    getCapabilities() {
      return getAgeStageCapabilities(playerState.getSnapshot().stage);
    },
    canTraverse(mode) {
      return canUseMovement(playerState.getSnapshot().stage, mode);
    },
    canCraft(recipeId) {
      return canCraftRecipe(playerState.getSnapshot().stage, recipeId);
    },
    canInteract(interactionId) {
      return canUseWorldInteraction(playerState.getSnapshot().stage, interactionId);
    },
    canReach(targetHeight) {
      return canReachHeight(playerState.getSnapshot().stage, targetHeight);
    },
    canCarry(weight) {
      return canCarryWeight(playerState.getSnapshot().stage, weight);
    },
    canEquipWeapon(weaponTier) {
      return canEquipWeaponTier(playerState.getSnapshot().stage, weaponTier);
    },
    canEnterZone(zoneId) {
      return canAccessZone(playerState.getSnapshot().stage, zoneId);
    },
    describeChecks() {
      const snapshot = playerState.getSnapshot();
      return {
        movement: {
          crawl: canUseMovement(snapshot.stage, 'crawl'),
          run: canUseMovement(snapshot.stage, 'run'),
          climb: canUseMovement(snapshot.stage, 'climb'),
          vault: canUseMovement(snapshot.stage, 'vault'),
          ride: canUseMovement(snapshot.stage, 'ride'),
        },
        crafting: {
          'soft-cloth-wrap': canCraftRecipe(snapshot.stage, 'soft-cloth-wrap'),
          'stone-axe': canCraftRecipe(snapshot.stage, 'stone-axe'),
          'iron-spear': canCraftRecipe(snapshot.stage, 'iron-spear'),
        },
        interactions: {
          gather: canUseWorldInteraction(snapshot.stage, 'gather'),
          repair: canUseWorldInteraction(snapshot.stage, 'repair'),
          forge: canUseWorldInteraction(snapshot.stage, 'forge'),
          'call-for-help': canUseWorldInteraction(snapshot.stage, 'call-for-help'),
        },
        constraints: {
          enterHospitalVents: canAccessZone(snapshot.stage, 'hospital_vents'),
          enterYards: canAccessZone(snapshot.stage, 'yards'),
          enterRooftops: canAccessZone(snapshot.stage, 'rooftops'),
          enterControlCenter: canAccessZone(snapshot.stage, 'control_center'),
          carrySupplyCrate: canCarryWeight(snapshot.stage, 12),
          reachSecurityPanel: canReachHeight(snapshot.stage, 2.6),
          equipTierTwoWeapon: canEquipWeaponTier(snapshot.stage, 2),
        },
      };
    },
  };
}
