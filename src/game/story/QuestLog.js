import { Act1_HospitalEscape } from './Act1_HospitalEscape.js';
import { Act2_CitySurvival } from './Act2_CitySurvival.js';
import { Act3_DistrictExploration } from './Act3_DistrictExploration.js';
import { Act4_ControlCenter } from './Act4_ControlCenter.js';
import { Act5_FinalChoice, FinalFactionChoice } from './Act5_FinalChoice.js';

export const StoryWorldEventType = Object.freeze({
  Trigger: 'trigger',
  InfrastructureChanged: 'infrastructure:changed',
  FinalChoice: 'final-choice',
  SeasonalHook: 'seasonal-hook',
  PostGameHook: 'postgame-hook',
});

const STORY_ACTS = Object.freeze([
  Act1_HospitalEscape,
  Act2_CitySurvival,
  Act3_DistrictExploration,
  Act4_ControlCenter,
  Act5_FinalChoice,
]);

const GOAL_EVENTS = Object.freeze({
  'survive-first-night': Object.freeze({ storyGoalId: 'survive-first-night' }),
  'earn-village-trust': Object.freeze({ storyGoalId: 'earn-village-trust' }),
  'restore-frontier-beacon': Object.freeze({ storyGoalId: 'restore-frontier-beacon' }),
});

export function createQuestLog(options = {}) {
  const acts = options.acts ?? STORY_ACTS;
  const unlockStoryGoal = typeof options.unlockStoryGoal === 'function' ? options.unlockStoryGoal : () => {};

  const state = {
    events: [],
    completedEvents: new Set(),
    activeActIndex: 0,
    infrastructure: {
      power: 0,
      water: 0,
      communication: 0,
      defense: 0,
      ...(options.initialInfrastructure ?? {}),
    },
    finalChoice: null,
    seasonalHooks: [],
    postGameHooks: [],
  };

  function getAct(actIndex = state.activeActIndex) {
    return acts[Math.min(Math.max(actIndex, 0), acts.length - 1)];
  }

  function collectObjectiveState(objectives) {
    return objectives.map((objective) => ({
      ...objective,
      completed: state.completedEvents.has(objective.id),
    }));
  }

  function isActCompleted(act) {
    return act.requiredObjectives.every((objective) => state.completedEvents.has(objective.id));
  }

  function syncUnlockedGoal(eventId) {
    const goal = GOAL_EVENTS[eventId];
    if (goal) {
      unlockStoryGoal(goal.storyGoalId);
    }
  }

  function advanceActProgression() {
    while (state.activeActIndex < acts.length - 1 && isActCompleted(getAct())) {
      state.activeActIndex += 1;
    }
  }

  function applyInfrastructurePatch(patch = {}) {
    for (const key of Object.keys(state.infrastructure)) {
      if (typeof patch[key] === 'number') {
        state.infrastructure[key] = clampInfrastructure(patch[key]);
      }
    }

    const controlCenterPrerequisitesMet = Act4_ControlCenter.requiredObjectives
      .filter((objective) => objective.id !== 'restore-core-infrastructure')
      .every((objective) => state.completedEvents.has(objective.id));

    if (controlCenterPrerequisitesMet && hasRequiredInfrastructure(Act5_FinalChoice.infrastructureRequirements, state.infrastructure)) {
      state.completedEvents.add('restore-core-infrastructure');
    }
  }

  function registerEvent(rawEvent) {
    const event = normalizeEvent(rawEvent);
    state.events.push(event);

    if (event.type === StoryWorldEventType.InfrastructureChanged) {
      applyInfrastructurePatch(event.payload);
    }

    if (event.type === StoryWorldEventType.Trigger && event.id) {
      state.completedEvents.add(event.id);
      syncUnlockedGoal(event.id);
    }

    if (event.type === StoryWorldEventType.FinalChoice && event.choice) {
      if (isFinalChoiceAvailable(event.choice)) {
        state.finalChoice = event.choice;
        state.completedEvents.add('choose-city-future');
        state.completedEvents.add('lock-final-directive');
        state.completedEvents.add(getAct(acts.length - 1).factionBranches[event.choice].worldEventId);
      }
    }

    if (event.type === StoryWorldEventType.SeasonalHook && event.id) {
      pushUnique(state.seasonalHooks, event.id);
    }

    if (event.type === StoryWorldEventType.PostGameHook && event.id) {
      pushUnique(state.postGameHooks, event.id);
    }

    if (state.activeActIndex === acts.length - 1 && hasAnyFinalChoiceAvailable()) {
      state.completedEvents.add('open-faction-council');
    }

    advanceActProgression();
    return getSnapshot();
  }

  function hasAnyFinalChoiceAvailable() {
    return Object.values(FinalFactionChoice).some((choice) => isFinalChoiceAvailable(choice));
  }

  function isFinalChoiceAvailable(choice) {
    const branch = Act5_FinalChoice.factionBranches[choice];
    if (!branch) {
      return false;
    }

    return hasRequiredInfrastructure(branch.minimumInfrastructure, state.infrastructure) && state.activeActIndex >= acts.length - 1;
  }

  function getSnapshot() {
    const activeAct = getAct();
    const completedActs = acts.filter(isActCompleted).map((act) => act.id);
    const factionBranches = Object.values(Act5_FinalChoice.factionBranches).map((branch) => ({
      ...branch,
      available: isFinalChoiceAvailable(branch.id),
      selected: state.finalChoice === branch.id,
    }));

    return {
      acts: acts.map((act, index) => ({
        ...act,
        active: index === state.activeActIndex,
        completed: isActCompleted(act),
        requiredObjectives: collectObjectiveState(act.requiredObjectives),
        sideEvents: collectObjectiveState(act.sideEvents),
      })),
      activeActId: activeAct.id,
      activeChapterId: activeAct.chapterId,
      checkpointId: activeAct.checkpointId,
      completedActs,
      completedEventIds: [...state.completedEvents],
      infrastructure: { ...state.infrastructure },
      finalChoice: state.finalChoice,
      factionBranches,
      extensionPoints: {
        seasonalContent: activeAct.extensionPoints?.seasonalContent ?? [],
        postGameEvents: activeAct.extensionPoints?.postGameEvents ?? [],
        globalSeasonalHooks: [...state.seasonalHooks],
        globalPostGameHooks: [...state.postGameHooks],
      },
      recentEvents: state.events.slice(-8),
    };
  }

  return {
    getSnapshot,
    registerEvent,
    isFinalChoiceAvailable,
  };
}

function normalizeEvent(event = {}) {
  if (typeof event === 'string') {
    return { type: StoryWorldEventType.Trigger, id: event, payload: null, timestamp: Date.now() };
  }

  return {
    type: event.type ?? StoryWorldEventType.Trigger,
    id: event.id ?? null,
    choice: event.choice ?? null,
    payload: event.payload ?? null,
    timestamp: event.timestamp ?? Date.now(),
  };
}

function hasRequiredInfrastructure(requirements, infrastructure) {
  return Object.entries(requirements).every(([key, value]) => (infrastructure[key] ?? 0) >= value);
}

function pushUnique(target, value) {
  if (!target.includes(value)) {
    target.push(value);
  }
}

function clampInfrastructure(value) {
  return Math.max(0, Math.min(1, value));
}
