import { listAgeStages } from '../progression/ageStages.js';

export const AccessRequirementType = Object.freeze({
  AgeStage: 'age_stage',
  MovementMode: 'movement_mode',
  WorldInteraction: 'world_interaction',
  Skill: 'skill',
  StoryGoal: 'story_goal',
  InventoryItem: 'inventory_item',
  TutorialMilestone: 'tutorial_milestone',
  ZoneAccess: 'zone_access',
  ReachHeight: 'reach_height',
  CarryWeight: 'carry_weight',
  AnyOf: 'any_of',
  AllOf: 'all_of',
});

const ageStageOrder = listAgeStages();

export function createRequirement(type, value, overrides = {}) {
  return Object.freeze({ type, value, ...overrides });
}

export function evaluateAccessRequirement(playerSnapshot, stageCapabilities, requirement) {
  if (!requirement) {
    return true;
  }

  switch (requirement.type) {
    case AccessRequirementType.AgeStage:
      return compareAgeStage(playerSnapshot.stage, requirement.value) >= 0;
    case AccessRequirementType.MovementMode:
      return stageCapabilities.locomotionModes.includes(requirement.value);
    case AccessRequirementType.WorldInteraction:
      return stageCapabilities.worldInteractions.includes(requirement.value);
    case AccessRequirementType.Skill:
      return playerSnapshot.abilities.unlockedSkills.includes(requirement.value);
    case AccessRequirementType.StoryGoal:
      return playerSnapshot.storyGoals.includes(requirement.value);
    case AccessRequirementType.InventoryItem:
      return playerSnapshot.inventory.includes(requirement.value);
    case AccessRequirementType.TutorialMilestone:
      return playerSnapshot.tutorialMilestones.includes(requirement.value);
    case AccessRequirementType.ZoneAccess:
      return stageCapabilities.constraints.zoneAccess.includes(requirement.value);
    case AccessRequirementType.ReachHeight:
      return stageCapabilities.constraints.maxReachHeight >= requirement.value;
    case AccessRequirementType.CarryWeight:
      return stageCapabilities.constraints.maxCarryWeight >= requirement.value;
    case AccessRequirementType.AnyOf:
      return requirement.options.some((option) => evaluateAccessRequirement(playerSnapshot, stageCapabilities, option));
    case AccessRequirementType.AllOf:
      return requirement.options.every((option) => evaluateAccessRequirement(playerSnapshot, stageCapabilities, option));
    default:
      return false;
  }
}

export function describeRequirement(requirement) {
  if (!requirement) {
    return 'No requirement';
  }

  switch (requirement.type) {
    case AccessRequirementType.AgeStage:
      return `Age stage: ${requirement.value}+`;
    case AccessRequirementType.MovementMode:
      return `Movement: ${requirement.value}`;
    case AccessRequirementType.WorldInteraction:
      return `Interaction: ${requirement.value}`;
    case AccessRequirementType.Skill:
      return `Skill: ${requirement.value}`;
    case AccessRequirementType.StoryGoal:
      return `Story goal: ${requirement.value}`;
    case AccessRequirementType.InventoryItem:
      return `Item: ${requirement.value}`;
    case AccessRequirementType.TutorialMilestone:
      return `Training: ${requirement.value}`;
    case AccessRequirementType.ZoneAccess:
      return `Zone access: ${requirement.value}`;
    case AccessRequirementType.ReachHeight:
      return `Reach ${requirement.value}m`;
    case AccessRequirementType.CarryWeight:
      return `Carry ${requirement.value}kg`;
    case AccessRequirementType.AnyOf:
      return `Any of: ${requirement.options.map(describeRequirement).join(' | ')}`;
    case AccessRequirementType.AllOf:
      return `All of: ${requirement.options.map(describeRequirement).join(' + ')}`;
    default:
      return `Unknown requirement: ${requirement.type}`;
  }
}

function compareAgeStage(currentStage, requiredStage) {
  return ageStageOrder.indexOf(currentStage) - ageStageOrder.indexOf(requiredStage);
}
