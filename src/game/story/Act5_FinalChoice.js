export const FinalFactionChoice = Object.freeze({
  OpenTheCity: 'OpenTheCity',
  ProtectTheCity: 'ProtectTheCity',
});

const infrastructureRequirements = Object.freeze({
  power: 1,
  water: 1,
  communication: 1,
  defense: 1,
});

export const Act5_FinalChoice = Object.freeze({
  id: 'act-5-final-choice',
  title: 'Act 5 · Final Choice',
  chapterId: 'final_choice',
  checkpointId: 'control_center_core',
  requiredObjectives: Object.freeze([
    Object.freeze({ id: 'choose-city-future', label: 'Сформулировать судьбу города после восстановления систем.' }),
    Object.freeze({ id: 'open-faction-council', label: 'Созвать фракционный совет у ядра управления.' }),
    Object.freeze({ id: 'lock-final-directive', label: 'Зафиксировать директиву для городских сетей и гарнизонов.' }),
  ]),
  sideEvents: Object.freeze([
    Object.freeze({ id: 'seasonal-council-dispute', label: 'Оставить слот под сезонные конфликты совета.' }),
    Object.freeze({ id: 'postgame_district_petitions', label: 'Открыть канал для постгейм-петиций районов.' }),
    Object.freeze({ id: 'postgame_frontier_signal', label: 'Подготовить дальний сигнал для будущих эпизодов.' }),
  ]),
  unlockedMechanics: Object.freeze(['faction-governance', 'ending-branch-selection', 'postgame-world-state', 'seasonal-story-injection']),
  availableZones: Object.freeze(['control_center', 'utility_tunnels', 'rooftops', 'streets']),
  completionGoalId: 'choose-city-future',
  worldEventTriggers: Object.freeze({
    requiredObjectives: Object.freeze(['choose-city-future', 'open-faction-council', 'lock-final-directive']),
    sideEvents: Object.freeze(['seasonal-council-dispute', 'postgame_district_petitions', 'postgame_frontier_signal']),
  }),
  infrastructureRequirements,
  factionBranches: Object.freeze({
    [FinalFactionChoice.OpenTheCity]: Object.freeze({
      id: FinalFactionChoice.OpenTheCity,
      label: 'Open the City',
      summary: 'Открывает районные ворота, усиливает миграцию и торговлю, но требует устойчивой связи и воды.',
      minimumInfrastructure: infrastructureRequirements,
      worldEventId: 'final-choice-open-city',
      extensionPoints: Object.freeze({
        seasonalContent: Object.freeze(['season_open_border_crisis', 'season_trade_fair']),
        postGameEvents: Object.freeze(['postgame_new_arrivals', 'postgame_trade_charters']),
      }),
    }),
    [FinalFactionChoice.ProtectTheCity]: Object.freeze({
      id: FinalFactionChoice.ProtectTheCity,
      label: 'Protect the City',
      summary: 'Усиливает контур обороны, ограничивает доступ и переводит инфраструктуру в режим крепости.',
      minimumInfrastructure: infrastructureRequirements,
      worldEventId: 'final-choice-protect-city',
      extensionPoints: Object.freeze({
        seasonalContent: Object.freeze(['season_siege_drills', 'season_internal_dissent']),
        postGameEvents: Object.freeze(['postgame_border_watch', 'postgame_defense_protocols']),
      }),
    }),
  }),
  extensionPoints: Object.freeze({
    seasonalContent: Object.freeze(['season_branching_referendum']),
    postGameEvents: Object.freeze(['postgame_governance_arcs', 'postgame_new_game_plus_setup']),
  }),
});
