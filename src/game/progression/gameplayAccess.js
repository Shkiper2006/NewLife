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

export function createGameplayAccessController(playerState, getDynamicEffects = () => ({})) {
  function resolveDynamicEffects() {
    return {
      actionMultiplier: 1,
      ...getDynamicEffects(),
    };
  }

  function canPerformDemandingAction() {
    return resolveDynamicEffects().actionMultiplier >= 0.55;
  }

  return {
    getCapabilities() {
      return getAgeStageCapabilities(playerState.getSnapshot().stage);
    },
    canTraverse(mode) {
      if ((mode === 'run' || mode === 'climb' || mode === 'vault') && !canPerformDemandingAction()) {
        return false;
      }
      return canUseMovement(playerState.getSnapshot().stage, mode);
    },
    canCraft(recipeId) {
      return canCraftRecipe(playerState.getSnapshot().stage, recipeId);
    },
    canInteract(interactionId) {
      if ((interactionId === 'repair' || interactionId === 'forge' || interactionId === 'stabilize-base') && !canPerformDemandingAction()) {
        return false;
      }
      return canUseWorldInteraction(playerState.getSnapshot().stage, interactionId);
    },
    canReach(targetHeight) {
      return canReachHeight(playerState.getSnapshot().stage, targetHeight);
    },
    canCarry(weight) {
      const dynamicMultiplier = resolveDynamicEffects().actionMultiplier;
      return canCarryWeight(playerState.getSnapshot().stage, weight / Math.max(dynamicMultiplier, 0.35));
    },
    canEquipWeapon(weaponTier) {
      return canEquipWeaponTier(playerState.getSnapshot().stage, weaponTier);
    },
    canEnterZone(zoneId) {
      return canAccessZone(playerState.getSnapshot().stage, zoneId);
    },
    describeChecks() {
      const snapshot = playerState.getSnapshot();
      const effects = resolveDynamicEffects();
      return {
        movement: {
          crawl: canUseMovement(snapshot.stage, 'crawl'),
          run: this.canTraverse('run'),
          climb: this.canTraverse('climb'),
          vault: this.canTraverse('vault'),
          ride: canUseMovement(snapshot.stage, 'ride'),
        },
        crafting: {
          'infant-simple-shelter': canCraftRecipe(snapshot.stage, 'infant-simple-shelter'),
          'teen-spear': canCraftRecipe(snapshot.stage, 'teen-spear'),
          'adult-fortification': canCraftRecipe(snapshot.stage, 'adult-fortification'),
        },
        interactions: {
          gather: canUseWorldInteraction(snapshot.stage, 'gather'),
          repair: this.canInteract('repair'),
          forge: this.canInteract('forge'),
          'rest-in-shelter': canUseWorldInteraction(snapshot.stage, 'rest-in-shelter'),
        },
        constraints: {
          enterHospitalVents: canAccessZone(snapshot.stage, 'hospital_vents'),
          enterYards: canAccessZone(snapshot.stage, 'yards'),
          enterRooftops: canAccessZone(snapshot.stage, 'rooftops'),
          enterControlCenter: canAccessZone(snapshot.stage, 'control_center'),
          carrySupplyCrate: this.canCarry(12),
          reachSecurityPanel: canReachHeight(snapshot.stage, 2.6),
          equipTierTwoWeapon: canEquipWeaponTier(snapshot.stage, 2),
        },
        modifiers: {
          actionMultiplier: Number(effects.actionMultiplier.toFixed(2)),
          saveUnlocked: Boolean(effects.saveUnlocked),
          recoveryUnlocked: Boolean(effects.recoveryUnlocked),
        },
      };
    },
  };
}
