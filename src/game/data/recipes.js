import { AgeStage } from '../progression/ageStages.js';

export const RECIPE_DEFINITIONS = Object.freeze([
  freezeRecipe({
    id: 'infant-rope',
    stage: AgeStage.Infant,
    name: 'Верёвка из тряпок',
    output: { rope: 1 },
    ingredients: { rags: 2 },
    tags: ['progression', 'binding'],
  }),
  freezeRecipe({
    id: 'infant-simple-shelter',
    stage: AgeStage.Infant,
    name: 'Простое укрытие',
    output: { simple_shelter: 1 },
    ingredients: { rope: 2, cloth: 2, sticks: 4 },
    tags: ['base', 'safety'],
    unlocksSave: true,
  }),
  freezeRecipe({
    id: 'child-rope-ladder',
    stage: AgeStage.Child,
    name: 'Верёвочная лестница',
    output: { rope_ladder: 1 },
    ingredients: { rope: 2, sticks: 5 },
    tags: ['mobility'],
  }),
  freezeRecipe({
    id: 'child-hook',
    stage: AgeStage.Child,
    name: 'Крюк',
    output: { hook: 1 },
    ingredients: { metal_scrap: 2, rope: 1 },
    tags: ['mobility', 'climb'],
  }),
  freezeRecipe({
    id: 'child-portable-shelter',
    stage: AgeStage.Child,
    name: 'Переносное укрытие',
    output: { portable_shelter: 1 },
    ingredients: { cloth: 3, sticks: 4, rope: 1 },
    tags: ['shelter', 'portable'],
  }),
  freezeRecipe({
    id: 'teen-spear',
    stage: AgeStage.Teen,
    name: 'Копьё',
    output: { spear: 1 },
    ingredients: { sticks: 3, rope: 1, metal_scrap: 1 },
    tags: ['combat'],
  }),
  freezeRecipe({
    id: 'teen-knife',
    stage: AgeStage.Teen,
    name: 'Нож',
    output: { knife: 1 },
    ingredients: { metal_scrap: 2, cloth: 1 },
    tags: ['combat', 'tool'],
  }),
  freezeRecipe({
    id: 'teen-bow',
    stage: AgeStage.Teen,
    name: 'Лук',
    output: { bow: 1 },
    ingredients: { sticks: 3, rope: 2, cloth: 1 },
    tags: ['combat', 'ranged'],
  }),
  freezeRecipe({
    id: 'teen-trap',
    stage: AgeStage.Teen,
    name: 'Ловушка',
    output: { trap: 1 },
    ingredients: { sticks: 2, rope: 1, metal_scrap: 1 },
    tags: ['defense', 'hunting'],
  }),
  freezeRecipe({
    id: 'teen-tent',
    stage: AgeStage.Teen,
    name: 'Палатка',
    output: { tent: 1 },
    ingredients: { cloth: 4, sticks: 6, rope: 2 },
    tags: ['camp', 'base'],
    unlocksSave: true,
  }),
  freezeRecipe({
    id: 'adult-generator',
    stage: AgeStage.Adult,
    name: 'Генератор',
    output: { generator: 1 },
    ingredients: { metal_scrap: 6, sticks: 2, rope: 1 },
    tags: ['power', 'base'],
  }),
  freezeRecipe({
    id: 'adult-water-purifier',
    stage: AgeStage.Adult,
    name: 'Очистка воды',
    output: { water_purifier: 1 },
    ingredients: { metal_scrap: 4, cloth: 2, bottle: 1, water: 2 },
    tags: ['water', 'base'],
  }),
  freezeRecipe({
    id: 'adult-fortification',
    stage: AgeStage.Adult,
    name: 'Укрепления',
    output: { fortification: 1 },
    ingredients: { metal_scrap: 5, sticks: 6, rope: 2 },
    tags: ['defense', 'base'],
    unlocksSave: true,
  }),
]);

export function getRecipesForStage(stage) {
  return RECIPE_DEFINITIONS.filter((recipe) => recipe.stage === stage);
}

export function getRecipeById(recipeId) {
  return RECIPE_DEFINITIONS.find((recipe) => recipe.id === recipeId) ?? null;
}

function freezeRecipe(recipe) {
  return Object.freeze({
    ...recipe,
    output: Object.freeze({ ...recipe.output }),
    ingredients: Object.freeze({ ...recipe.ingredients }),
    tags: Object.freeze([...(recipe.tags ?? [])]),
  });
}
