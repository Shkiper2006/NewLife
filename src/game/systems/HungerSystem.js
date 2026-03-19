export function createHungerSystem() {
  return {
    update(state, deltaSeconds) {
      const drain = 1.8 * deltaSeconds * (1 + state.needs.pressure * 0.2);
      state.needs.hunger = clamp(state.needs.hunger - drain);
      state.needs.flags.hungry = state.needs.hunger < 45;
      state.needs.flags.starving = state.needs.hunger < 20;
      state.effects.actionMultiplier = computeActionMultiplier(state.effects.actionMultiplier, state.needs.hunger, 0.5);
    },
  };
}

function computeActionMultiplier(current, hunger, floor) {
  const normalized = hunger / 100;
  return Math.min(current, floor + normalized * (1 - floor));
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}
