export const BUILDING_DEFINITIONS = Object.freeze({
  simple_shelter: freezeBuilding({
    id: 'simple_shelter',
    name: 'Простое укрытие',
    type: 'shelter',
    snapPoints: ['ground', 'windbreak'],
    minSafety: 10,
    stability: 0.55,
    footprintRadius: 2,
    effects: { safety: 18, rest: 12, recovery: 0.6, saveUnlocked: true },
  }),
  portable_shelter: freezeBuilding({
    id: 'portable_shelter',
    name: 'Переносное укрытие',
    type: 'shelter',
    snapPoints: ['ground', 'camp'],
    minSafety: 18,
    stability: 0.6,
    footprintRadius: 1.8,
    effects: { safety: 14, rest: 10, recovery: 0.4, saveUnlocked: true },
  }),
  tent: freezeBuilding({
    id: 'tent',
    name: 'Палатка',
    type: 'shelter',
    snapPoints: ['ground', 'camp', 'windbreak'],
    minSafety: 22,
    stability: 0.7,
    footprintRadius: 2.6,
    effects: { safety: 22, rest: 18, recovery: 0.9, saveUnlocked: true },
  }),
  generator: freezeBuilding({
    id: 'generator',
    name: 'Генератор',
    type: 'utility',
    snapPoints: ['ground', 'utility'],
    minSafety: 30,
    stability: 0.8,
    footprintRadius: 2.2,
    effects: { safety: 8, recovery: 0.35, power: 1 },
  }),
  water_purifier: freezeBuilding({
    id: 'water_purifier',
    name: 'Очистка воды',
    type: 'utility',
    snapPoints: ['water', 'utility'],
    minSafety: 26,
    stability: 0.78,
    footprintRadius: 2,
    effects: { safety: 10, waterQuality: 1, recovery: 0.5 },
  }),
  fortification: freezeBuilding({
    id: 'fortification',
    name: 'Укрепления',
    type: 'defense',
    snapPoints: ['perimeter', 'ground'],
    minSafety: 34,
    stability: 0.9,
    footprintRadius: 3.2,
    effects: { safety: 28, defense: 1.2, recovery: 0.3, saveUnlocked: true },
  }),
});

export function getBuildingDefinition(buildingId) {
  return BUILDING_DEFINITIONS[buildingId] ?? null;
}

function freezeBuilding(building) {
  return Object.freeze({
    ...building,
    snapPoints: Object.freeze([...(building.snapPoints ?? [])]),
    effects: Object.freeze({ ...(building.effects ?? {}) }),
  });
}
