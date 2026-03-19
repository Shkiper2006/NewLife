import type { AgeStageId } from '../progression/ageStages';

export type ItemId = 'rags' | 'milkBottle' | 'scrap' | 'rope' | 'simpleShelter';

export interface ItemDefinition {
  id: ItemId;
  label: string;
  description: string;
  stackable: boolean;
}

export interface RecipeDefinition {
  id: string;
  stage: AgeStageId;
  label: string;
  ingredients: Partial<Record<ItemId, number>>;
  output: Partial<Record<ItemId, number>>;
  description: string;
}

export const ITEM_DEFINITIONS: Record<ItemId, ItemDefinition> = {
  rags: { id: 'rags', label: 'Тряпки', description: 'Мягкий расходник для перевязки и примитивного крафта.', stackable: true },
  milkBottle: { id: 'milkBottle', label: 'Бутылочка с молоком', description: 'Восстанавливает голод младенца.', stackable: true },
  scrap: { id: 'scrap', label: 'Простой мусор', description: 'Лёгкие материалы для каркаса и баррикад.', stackable: true },
  rope: { id: 'rope', label: 'Верёвка', description: 'Базовый крафтовый компонент из тряпок.', stackable: true },
  simpleShelter: { id: 'simpleShelter', label: 'Простое укрытие', description: 'Маленький навес, который можно поставить в мире.', stackable: true },
};

export const RECIPE_DEFINITIONS: RecipeDefinition[] = [
  {
    id: 'rope-from-rags',
    stage: 'infant',
    label: 'Верёвка',
    ingredients: { rags: 2 },
    output: { rope: 1 },
    description: 'Скрутить тряпки в крепкую верёвку.',
  },
  {
    id: 'simple-shelter',
    stage: 'infant',
    label: 'Простое укрытие',
    ingredients: { rope: 1, scrap: 2 },
    output: { simpleShelter: 1 },
    description: 'Сделать укрытие, которое закрывает острые осколки и даёт передышку.',
  },
];
