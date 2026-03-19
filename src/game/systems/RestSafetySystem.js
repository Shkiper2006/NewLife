export function createRestSafetySystem() {
  return {
    update(state, deltaSeconds) {
      const shelterScore = state.base.summary.shelterCoverage;
      const defenseScore = state.base.summary.defenseCoverage;
      const utilityScore = state.base.summary.utilityCoverage;
      const targetSafety = clamp(14 + shelterScore * 28 + defenseScore * 18 + utilityScore * 8);
      const safetyDrift = (targetSafety - state.needs.safety) * 0.4 * deltaSeconds;
      state.needs.safety = clamp(state.needs.safety + safetyDrift);

      const naturalFatigue = 1.25 * deltaSeconds;
      const shelterRecovery = shelterScore * 0.65 * deltaSeconds;
      const safetyRecovery = state.needs.safety > 35 ? 0.45 * deltaSeconds : 0;
      state.needs.rest = clamp(state.needs.rest - naturalFatigue + shelterRecovery + safetyRecovery);

      const riskBaseline = Math.max(0, 1 - state.needs.safety / 100);
      state.needs.pressure = riskBaseline + Math.max(0, (40 - state.needs.rest) / 100);
      state.effects.saveUnlocked = state.base.summary.saveUnlocked && state.needs.safety >= 25;
      state.effects.restEfficiency = 0.5 + shelterScore * 0.5 + utilityScore * 0.2;
    },
  };
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}
