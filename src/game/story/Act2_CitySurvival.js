export const Act2_CitySurvival = Object.freeze({
  id: 'act-2-city-survival',
  title: 'Act 2 · City Survival',
  chapterId: 'city_survival',
  checkpointId: 'courtyard_hideout',
  requiredObjectives: Object.freeze([
    Object.freeze({ id: 'find-safe-play-route', label: 'Проложить безопасный маршрут между дворами и укрытиями.' }),
    Object.freeze({ id: 'unlock-family-hideout', label: 'Открыть семейное убежище и перенести туда ресурсы.' }),
    Object.freeze({ id: 'earn-village-trust', label: 'Заслужить доверие соседей, помогая с базовым выживанием.' }),
  ]),
  sideEvents: Object.freeze([
    Object.freeze({ id: 'win-neighborhood-trust', label: 'Собрать поддержку дворовых групп и дозорных.' }),
    Object.freeze({ id: 'recover-courtyard-cache', label: 'Найти спрятанный запас воды и тканей.' }),
    Object.freeze({ id: 'stabilize-yard-shelter', label: 'Укрепить временное дворовое убежище.' }),
  ]),
  unlockedMechanics: Object.freeze(['yard-scouting', 'safehouse-management', 'basic-crafting-routes', 'community-trust']),
  availableZones: Object.freeze(['hospital', 'hospital_vents', 'yards']),
  completionGoalId: 'earn-village-trust',
  worldEventTriggers: Object.freeze({
    requiredObjectives: Object.freeze(['find-safe-play-route', 'unlock-family-hideout', 'earn-village-trust']),
    sideEvents: Object.freeze(['win-neighborhood-trust', 'recover-courtyard-cache', 'stabilize-yard-shelter']),
  }),
  extensionPoints: Object.freeze({
    seasonalContent: Object.freeze(['season_courtyard_harvest', 'season_first_snow_hideout']),
    postGameEvents: Object.freeze(['postgame_courtyard_festival', 'postgame_hideout_upgrades']),
  }),
});
