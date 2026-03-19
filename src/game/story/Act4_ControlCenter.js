export const Act4_ControlCenter = Object.freeze({
  id: 'act-4-control-center',
  title: 'Act 4 · Control Center',
  chapterId: 'control_center',
  checkpointId: 'control_center_atrium',
  requiredObjectives: Object.freeze([
    Object.freeze({ id: 'assume-network-control', label: 'Захватить контуры управления и получить доступ к архивам города.' }),
    Object.freeze({ id: 'stabilize-district-services', label: 'Стабилизировать сервисы районов через инфраструктурные узлы.' }),
    Object.freeze({ id: 'restore-core-infrastructure', label: 'Восстановить электричество, воду, связь и оборону до рабочего уровня.' }),
  ]),
  sideEvents: Object.freeze([
    Object.freeze({ id: 'restore-water-pressure', label: 'Вернуть давление воды в гражданский контур.' }),
    Object.freeze({ id: 'bypass-security-grid', label: 'Обойти старую сетку безопасности без тотального отключения.' }),
    Object.freeze({ id: 'recover-city-archives', label: 'Поднять архивы о допуске в центр управления.' }),
  ]),
  unlockedMechanics: Object.freeze(['infrastructure-routing', 'district-service-balancing', 'security-overrides', 'command-console-decisions']),
  availableZones: Object.freeze(['streets', 'rooftops', 'utility_tunnels', 'control_center']),
  completionGoalId: 'restore-core-infrastructure',
  worldEventTriggers: Object.freeze({
    requiredObjectives: Object.freeze(['assume-network-control', 'stabilize-district-services', 'restore-core-infrastructure']),
    sideEvents: Object.freeze(['restore-water-pressure', 'bypass-security-grid', 'recover-city-archives']),
  }),
  extensionPoints: Object.freeze({
    seasonalContent: Object.freeze(['season_control_center_outages', 'season_infrastructure_overload']),
    postGameEvents: Object.freeze(['postgame_district_tuning', 'postgame_security_reforms']),
  }),
});
