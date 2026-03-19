export function createThirstSystem() {
  return {
    update(state, deltaSeconds) {
      const purifierBonus = state.base.summary.utilityCoverage * 0.15;
      const drain = Math.max(0.4, 2.4 - purifierBonus) * deltaSeconds * (1 + state.needs.pressure * 0.15);
      state.needs.thirst = clamp(state.needs.thirst - drain);
      state.needs.flags.thirsty = state.needs.thirst < 50;
      state.needs.flags.dehydrated = state.needs.thirst < 18;
      state.effects.actionMultiplier = computeActionMultiplier(state.effects.actionMultiplier, state.needs.thirst, 0.45);
    },
  };
}

function computeActionMultiplier(current, thirst, floor) {
  const normalized = thirst / 100;
  return Math.min(current, floor + normalized * (1 - floor));
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}
