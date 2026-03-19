import { AgeStage } from '../progression/ageStages.js';

export const ItemCategory = Object.freeze({
  Material: 'material',
  Resource: 'resource',
  Tool: 'tool',
  Weapon: 'weapon',
  Structure: 'structure',
  Utility: 'utility',
});

export const ITEM_DEFINITIONS = Object.freeze({
  rags: freezeItem({ id: 'rags', name: 'Тряпки', category: ItemCategory.Material, stackSize: 20, weight: 0.2, tags: ['cloth', 'soft'] }),
  rope: freezeItem({ id: 'rope', name: 'Верёвка', category: ItemCategory.Material, stackSize: 10, weight: 0.6, tags: ['binding', 'crafting'] }),
  cloth: freezeItem({ id: 'cloth', name: 'Ткань', category: ItemCategory.Material, stackSize: 20, weight: 0.3, tags: ['cloth', 'shelter'] }),
  sticks: freezeItem({ id: 'sticks', name: 'Палки', category: ItemCategory.Resource, stackSize: 25, weight: 0.5, tags: ['wood', 'frame'] }),
  metal_scrap: freezeItem({ id: 'metal_scrap', name: 'Металл', category: ItemCategory.Resource, stackSize: 20, weight: 0.8, tags: ['metal', 'durable'] }),
  bottle: freezeItem({ id: 'bottle', name: 'Бутылочка', category: ItemCategory.Utility, stackSize: 6, weight: 0.4, tags: ['container'] }),
  water: freezeItem({ id: 'water', name: 'Вода', category: ItemCategory.Resource, stackSize: 20, weight: 1, tags: ['liquid', 'drinkable'] }),
  clean_water: freezeItem({ id: 'clean_water', name: 'Очищенная вода', category: ItemCategory.Utility, stackSize: 20, weight: 1, tags: ['liquid', 'drinkable', 'clean'] }),
  hook: freezeItem({ id: 'hook', name: 'Крюк', category: ItemCategory.Tool, stackSize: 4, weight: 0.8, tags: ['climb', 'metal'] }),
  rope_ladder: freezeItem({ id: 'rope_ladder', name: 'Верёвочная лестница', category: ItemCategory.Tool, stackSize: 1, weight: 2, tags: ['climb', 'deployable'] }),
  portable_shelter: freezeItem({ id: 'portable_shelter', name: 'Переносное укрытие', category: ItemCategory.Structure, stackSize: 1, weight: 5, tags: ['shelter', 'portable'] }),
  simple_shelter: freezeItem({ id: 'simple_shelter', name: 'Простое укрытие', category: ItemCategory.Structure, stackSize: 1, weight: 8, tags: ['shelter', 'base'] }),
  spear: freezeItem({ id: 'spear', name: 'Копьё', category: ItemCategory.Weapon, stackSize: 1, weight: 3, tags: ['weapon', 'melee'] }),
  knife: freezeItem({ id: 'knife', name: 'Нож', category: ItemCategory.Weapon, stackSize: 1, weight: 1.2, tags: ['weapon', 'tool'] }),
  bow: freezeItem({ id: 'bow', name: 'Лук', category: ItemCategory.Weapon, stackSize: 1, weight: 1.4, tags: ['weapon', 'ranged'] }),
  trap: freezeItem({ id: 'trap', name: 'Ловушка', category: ItemCategory.Utility, stackSize: 4, weight: 2.4, tags: ['defense', 'hunting'] }),
  tent: freezeItem({ id: 'tent', name: 'Палатка', category: ItemCategory.Structure, stackSize: 1, weight: 7, tags: ['shelter', 'camp'] }),
  generator: freezeItem({ id: 'generator', name: 'Генератор', category: ItemCategory.Utility, stackSize: 1, weight: 14, tags: ['power', 'base'] }),
  water_purifier: freezeItem({ id: 'water_purifier', name: 'Очистка воды', category: ItemCategory.Utility, stackSize: 1, weight: 10, tags: ['water', 'base'] }),
  fortification: freezeItem({ id: 'fortification', name: 'Укрепления', category: ItemCategory.Structure, stackSize: 1, weight: 16, tags: ['defense', 'base'] }),
});

export const STARTER_RESOURCES = Object.freeze({
  rags: 8,
  bottle: 2,
  water: 2,
  sticks: 10,
  cloth: 6,
  metal_scrap: 4,
});

export const PASSIVE_GATHER_BY_STAGE = Object.freeze({
  [AgeStage.Infant]: Object.freeze({ rags: 1, bottle: 0.25, water: 0.4, cloth: 0.5 }),
  [AgeStage.Child]: Object.freeze({ rags: 0.5, sticks: 1.5, bottle: 0.2, water: 0.7, cloth: 0.7 }),
  [AgeStage.Teen]: Object.freeze({ sticks: 1.5, metal_scrap: 1, water: 0.8, cloth: 0.4 }),
  [AgeStage.Adult]: Object.freeze({ sticks: 1, metal_scrap: 1.5, water: 1, cloth: 0.5 }),
});

export const STAGE_RESOURCE_HINTS = Object.freeze({
  [AgeStage.Infant]: ['искать тряпки рядом с местом старта', 'использовать бутылочки для воды'],
  [AgeStage.Child]: ['собирать палки и ткань во дворе', 'готовить наборы для переносного укрытия'],
  [AgeStage.Teen]: ['собирать металл для оружия и палаток', 'ставить ловушки вокруг базы'],
  [AgeStage.Adult]: ['запускать энергетику базы', 'строить очистку воды и укрепления'],
});

export function getItemDefinition(itemId) {
  return ITEM_DEFINITIONS[itemId] ?? null;
}

function freezeItem(item) {
  return Object.freeze({ ...item, tags: Object.freeze([...(item.tags ?? [])]) });
}
