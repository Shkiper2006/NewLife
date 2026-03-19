export function createHealthSystem() {
  return {
    update(state, deltaSeconds) {
      const needsPenalty = calculateNeedsPenalty(state);
      const unsafePenalty = Math.max(0, 35 - state.needs.safety) * 0.06;
      const recoveryRate = state.base.summary.recoveryRate * 1.1 + (state.needs.rest > 65 ? 0.15 : 0);
      const delta = (recoveryRate - needsPenalty - unsafePenalty) * deltaSeconds;

      state.needs.health = clamp(state.needs.health + delta);
      state.needs.flags.wounded = state.needs.health < 40;
      state.needs.flags.critical = state.needs.health < 15;
      state.effects.actionMultiplier = computeActionMultiplier(state.effects.actionMultiplier, state.needs.health, 0.35);
      state.effects.recoveryUnlocked = state.base.summary.saveUnlocked && state.needs.safety >= 20;
    },
  };
}

function calculateNeedsPenalty(state) {
  let penalty = 0;
  if (state.needs.flags.starving) {
    penalty += 1.4;
  }
  if (state.needs.flags.dehydrated) {
    penalty += 1.8;
  }
  if (state.needs.rest < 25) {
    penalty += 1.1;
  }
  return penalty;
}

function computeActionMultiplier(current, health, floor) {
  const normalized = health / 100;
  return Math.min(current, floor + normalized * (1 - floor));
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}
