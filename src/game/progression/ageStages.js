export const AgeStage = Object.freeze({
  Infant: 'Infant',
  Child: 'Child',
  Teen: 'Teen',
  Adult: 'Adult',
});

const orderedStages = [AgeStage.Infant, AgeStage.Child, AgeStage.Teen, AgeStage.Adult];

export const AGE_STAGE_CAPABILITIES = Object.freeze({
  [AgeStage.Infant]: freezeStageCapabilities({
    locomotionModes: ['crawl', 'roll'],
    craftRecipes: ['soft-cloth-wrap', 'rattle-toy'],
    worldInteractions: ['observe', 'listen', 'grab-nearby', 'call-for-help'],
    constraints: {
      maxReachHeight: 0.8,
      maxCarryWeight: 2,
      weaponTier: 0,
      zoneAccess: ['nursery', 'safe-yard'],
    },
  }),
  [AgeStage.Child]: freezeStageCapabilities({
    locomotionModes: ['walk', 'run', 'climb-low-ledges'],
    craftRecipes: ['twig-bundle', 'water-pouch', 'berry-snack'],
    worldInteractions: ['gather', 'talk', 'open-simple-doors', 'harvest-basic'],
    constraints: {
      maxReachHeight: 1.4,
      maxCarryWeight: 8,
      weaponTier: 1,
      zoneAccess: ['nursery', 'safe-yard', 'village', 'shallow-forest'],
    },
  }),
  [AgeStage.Teen]: freezeStageCapabilities({
    locomotionModes: ['walk', 'run', 'climb', 'swim', 'vault'],
    craftRecipes: ['stone-axe', 'campfire-kit', 'field-bandage', 'rope-hook'],
    worldInteractions: ['trade', 'hunt-small-game', 'repair', 'mentor-followers', 'use-workbenches'],
    constraints: {
      maxReachHeight: 2.4,
      maxCarryWeight: 18,
      weaponTier: 2,
      zoneAccess: ['nursery', 'safe-yard', 'village', 'shallow-forest', 'river-crossing', 'ruins'],
    },
  }),
  [AgeStage.Adult]: freezeStageCapabilities({
    locomotionModes: ['walk', 'run', 'climb', 'swim', 'vault', 'ride'],
    craftRecipes: ['iron-spear', 'reinforced-shelter', 'advanced-tonic', 'zone-beacon'],
    worldInteractions: ['lead-ritual', 'command-gate', 'build-outpost', 'hunt-large-game', 'forge'],
    constraints: {
      maxReachHeight: 3.2,
      maxCarryWeight: 32,
      weaponTier: 3,
      zoneAccess: ['nursery', 'safe-yard', 'village', 'shallow-forest', 'river-crossing', 'ruins', 'mountain-pass', 'ancient-vault'],
    },
  }),
});

export const AGE_STAGE_TRANSITIONS = Object.freeze({
  [AgeStage.Infant]: Object.freeze({
    nextStage: AgeStage.Child,
    minExperience: 100,
    storyGoals: ['survive-first-night'],
    requiredItems: ['family-totem'],
    tutorialMilestones: ['basic-mobility', 'first-foraging-lesson'],
  }),
  [AgeStage.Child]: Object.freeze({
    nextStage: AgeStage.Teen,
    minExperience: 300,
    storyGoals: ['earn-village-trust'],
    requiredItems: ['apprentice-toolkit'],
    tutorialMilestones: ['crafting-basics', 'field-survival'],
  }),
  [AgeStage.Teen]: Object.freeze({
    nextStage: AgeStage.Adult,
    minExperience: 700,
    storyGoals: ['restore-frontier-beacon'],
    requiredItems: ['lineage-sigil'],
    tutorialMilestones: ['combat-discipline', 'advanced-traversal'],
  }),
  [AgeStage.Adult]: Object.freeze({
    nextStage: null,
    minExperience: 0,
    storyGoals: [],
    requiredItems: [],
    tutorialMilestones: [],
  }),
});

export function listAgeStages() {
  return [...orderedStages];
}

export function getAgeStageCapabilities(stage) {
  return AGE_STAGE_CAPABILITIES[stage] ?? AGE_STAGE_CAPABILITIES[AgeStage.Infant];
}

export function getAgeStageTransition(stage) {
  return AGE_STAGE_TRANSITIONS[stage] ?? AGE_STAGE_TRANSITIONS[AgeStage.Adult];
}

export function canUseMovement(stage, locomotionMode) {
  return getAgeStageCapabilities(stage).locomotionModes.includes(locomotionMode);
}

export function canCraftRecipe(stage, recipeId) {
  return getAgeStageCapabilities(stage).craftRecipes.includes(recipeId);
}

export function canUseWorldInteraction(stage, interactionId) {
  return getAgeStageCapabilities(stage).worldInteractions.includes(interactionId);
}

export function canAccessZone(stage, zoneId) {
  return getAgeStageCapabilities(stage).constraints.zoneAccess.includes(zoneId);
}

export function canReachHeight(stage, height) {
  return getAgeStageCapabilities(stage).constraints.maxReachHeight >= height;
}

export function canCarryWeight(stage, weight) {
  return getAgeStageCapabilities(stage).constraints.maxCarryWeight >= weight;
}

export function canEquipWeaponTier(stage, weaponTier) {
  return getAgeStageCapabilities(stage).constraints.weaponTier >= weaponTier;
}

export function getAgeStageScale(stage) {
  switch (stage) {
    case AgeStage.Child:
      return 0.82;
    case AgeStage.Teen:
      return 0.94;
    case AgeStage.Adult:
      return 1.06;
    case AgeStage.Infant:
    default:
      return 0.64;
  }
}

function freezeStageCapabilities(capabilities) {
  return Object.freeze({
    ...capabilities,
    locomotionModes: Object.freeze([...capabilities.locomotionModes]),
    craftRecipes: Object.freeze([...capabilities.craftRecipes]),
    worldInteractions: Object.freeze([...capabilities.worldInteractions]),
    constraints: Object.freeze({
      ...capabilities.constraints,
      zoneAccess: Object.freeze([...capabilities.constraints.zoneAccess]),
    }),
  });
}
