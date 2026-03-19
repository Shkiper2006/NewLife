import { AgeStage, getAgeStageCapabilities, getAgeStageTransition } from './ageStages.js';

export function createPlayerStats(overrides = {}) {
  return {
    hunger: 100,
    thirst: 100,
    health: 100,
    rest: 100,
    safety: 18,
    experience: 0,
    ...overrides,
  };
}

export function createPlayerAbilities(overrides = {}) {
  return {
    unlockedSkills: [],
    ...overrides,
  };
}

export function createPlayerState(overrides = {}) {
  const playerState = {
    stage: overrides.stage ?? AgeStage.Infant,
    stats: createPlayerStats(overrides.stats),
    abilities: createPlayerAbilities(overrides.abilities),
    storyGoals: [...(overrides.storyGoals ?? [])],
    inventory: [...(overrides.inventory ?? [])],
    tutorialMilestones: [...(overrides.tutorialMilestones ?? [])],
  };

  return {
    getSnapshot() {
      return clonePlayerState(playerState);
    },
    getStageCapabilities() {
      return getAgeStageCapabilities(playerState.stage);
    },
    setVitals(nextVitals) {
      playerState.stats = {
        ...playerState.stats,
        ...nextVitals,
      };
      return this.getSnapshot();
    },
    addExperience(amount) {
      playerState.stats.experience += amount;
      return this.getSnapshot();
    },
    unlockSkill(skillId) {
      pushUnique(playerState.abilities.unlockedSkills, skillId);
      return this.getSnapshot();
    },
    addStoryGoal(goalId) {
      pushUnique(playerState.storyGoals, goalId);
      return this.getSnapshot();
    },
    addInventoryItem(itemId) {
      pushUnique(playerState.inventory, itemId);
      return this.getSnapshot();
    },
    addTutorialMilestone(milestoneId) {
      pushUnique(playerState.tutorialMilestones, milestoneId);
      return this.getSnapshot();
    },
    evaluateStageProgression() {
      return evaluateStageProgression(playerState);
    },
    advanceAgeStage() {
      const evaluation = evaluateStageProgression(playerState);
      if (!evaluation.ready || !evaluation.nextStage) {
        return {
          advanced: false,
          snapshot: this.getSnapshot(),
          evaluation,
        };
      }

      playerState.stage = evaluation.nextStage;
      return {
        advanced: true,
        snapshot: this.getSnapshot(),
        evaluation: evaluateStageProgression(playerState),
      };
    },
  };
}

export function evaluateStageProgression(playerState) {
  const transition = getAgeStageTransition(playerState.stage);
  if (!transition.nextStage) {
    return {
      currentStage: playerState.stage,
      nextStage: null,
      ready: false,
      missing: {
        experience: 0,
        storyGoals: [],
        requiredItems: [],
        tutorialMilestones: [],
      },
    };
  }

  const missingExperience = Math.max(transition.minExperience - playerState.stats.experience, 0);
  const missingStoryGoals = transition.storyGoals.filter((goalId) => !playerState.storyGoals.includes(goalId));
  const missingRequiredItems = transition.requiredItems.filter((itemId) => !playerState.inventory.includes(itemId));
  const missingTutorialMilestones = transition.tutorialMilestones.filter(
    (milestoneId) => !playerState.tutorialMilestones.includes(milestoneId),
  );

  return {
    currentStage: playerState.stage,
    nextStage: transition.nextStage,
    ready:
      missingExperience === 0 &&
      missingStoryGoals.length === 0 &&
      missingRequiredItems.length === 0 &&
      missingTutorialMilestones.length === 0,
    missing: {
      experience: missingExperience,
      storyGoals: missingStoryGoals,
      requiredItems: missingRequiredItems,
      tutorialMilestones: missingTutorialMilestones,
    },
  };
}

function clonePlayerState(playerState) {
  return {
    stage: playerState.stage,
    stats: { ...playerState.stats },
    abilities: { unlockedSkills: [...playerState.abilities.unlockedSkills] },
    storyGoals: [...playerState.storyGoals],
    inventory: [...playerState.inventory],
    tutorialMilestones: [...playerState.tutorialMilestones],
  };
}

function pushUnique(target, value) {
  if (!target.includes(value)) {
    target.push(value);
  }
}
