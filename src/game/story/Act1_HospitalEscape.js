export const Act1_HospitalEscape = Object.freeze({
  id: 'act-1-hospital-escape',
  title: 'Act 1 · Hospital Escape',
  chapterId: 'hospital_escape',
  checkpointId: 'hospital_nursery',
  requiredObjectives: Object.freeze([
    Object.freeze({ id: 'wake-in-nursery', label: 'Проснуться в роддоме и понять, что эвакуация сорвалась.' }),
    Object.freeze({ id: 'escape-checkup-room', label: 'Сбежать из процедурной через детский маршрут или вентиляцию.' }),
    Object.freeze({ id: 'survive-first-night', label: 'Пережить первую ночь и вынести семейный тотем из больницы.' }),
  ]),
  sideEvents: Object.freeze([
    Object.freeze({ id: 'hear-code-blue', label: 'Подслушать тревогу персонала и узнать о карантине.' }),
    Object.freeze({ id: 'follow-caregiver-footsteps', label: 'Проследить путь смотрителя к служебным помещениям.' }),
    Object.freeze({ id: 'find-first-shortcut', label: 'Найти первый безопасный шорткат через вентиляцию.' }),
  ]),
  unlockedMechanics: Object.freeze(['micro-stealth', 'crib-climb-routing', 'vent-crawling', 'tutorial-survival-loop']),
  availableZones: Object.freeze(['hospital', 'hospital_vents']),
  completionGoalId: 'survive-first-night',
  worldEventTriggers: Object.freeze({
    requiredObjectives: Object.freeze(['wake-in-nursery', 'escape-checkup-room', 'survive-first-night']),
    sideEvents: Object.freeze(['hear-code-blue', 'follow-caregiver-footsteps', 'find-first-shortcut']),
  }),
  extensionPoints: Object.freeze({
    seasonalContent: Object.freeze(['season_hospital_lockdown', 'season_nursery_memories']),
    postGameEvents: Object.freeze(['postgame_return_to_hospital', 'postgame_rescue_runs']),
  }),
});
