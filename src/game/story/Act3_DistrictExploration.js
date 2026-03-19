export const Act3_DistrictExploration = Object.freeze({
  id: 'act-3-district-exploration',
  title: 'Act 3 · District Exploration',
  chapterId: 'district_exploration',
  checkpointId: 'district_checkpoint',
  requiredObjectives: Object.freeze([
    Object.freeze({ id: 'cross-first-checkpoint', label: 'Продавить первый городской КПП и выйти в кварталы.' }),
    Object.freeze({ id: 'trace-blackout-origin', label: 'Проследить источник блэкаута до связки крыш и туннелей.' }),
    Object.freeze({ id: 'restore-frontier-beacon', label: 'Восстановить районный маяк и открыть путь в центр управления.' }),
  ]),
  sideEvents: Object.freeze([
    Object.freeze({ id: 'meet-courier-faction', label: 'Познакомиться с курьерами, держащими наземные маршруты.' }),
    Object.freeze({ id: 'meet-watchers-network', label: 'Заключить союз с наблюдателями на крышах.' }),
    Object.freeze({ id: 'discover-hidden-substation', label: 'Найти скрытую подстанцию под кварталом.' }),
  ]),
  unlockedMechanics: Object.freeze(['district-travel', 'faction-intel', 'roofline-routing', 'infrastructure-scouting']),
  availableZones: Object.freeze(['yards', 'streets', 'rooftops', 'utility_tunnels']),
  completionGoalId: 'restore-frontier-beacon',
  worldEventTriggers: Object.freeze({
    requiredObjectives: Object.freeze(['cross-first-checkpoint', 'trace-blackout-origin', 'restore-frontier-beacon']),
    sideEvents: Object.freeze(['meet-courier-faction', 'meet-watchers-network', 'discover-hidden-substation']),
  }),
  extensionPoints: Object.freeze({
    seasonalContent: Object.freeze(['season_rooftop_storms', 'season_checkpoint_unrest']),
    postGameEvents: Object.freeze(['postgame_open_district_routes', 'postgame_faction_patrols']),
  }),
});
