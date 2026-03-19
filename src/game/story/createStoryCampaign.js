import { createQuestLog, StoryWorldEventType } from './QuestLog.js';
import { FinalFactionChoice } from './Act5_FinalChoice.js';

export function createStoryCampaign(playerState) {
  const questLog = createQuestLog({
    unlockStoryGoal(goalId) {
      playerState.addStoryGoal(goalId);
    },
  });

  return {
    getSnapshot() {
      return questLog.getSnapshot();
    },
    recordWorldEvent(event) {
      return questLog.registerEvent(event);
    },
    updateInfrastructure(infrastructure) {
      return questLog.registerEvent({
        type: StoryWorldEventType.InfrastructureChanged,
        payload: infrastructure,
      });
    },
    chooseFinalFaction(choice) {
      return questLog.registerEvent({
        type: StoryWorldEventType.FinalChoice,
        choice,
      });
    },
    isFinalChoiceAvailable(choice) {
      return questLog.isFinalChoiceAvailable(choice);
    },
    FinalFactionChoice,
    StoryWorldEventType,
  };
}
