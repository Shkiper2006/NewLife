import { BUILDING_DEFINITIONS } from './data/buildings.js';
import { ITEM_DEFINITIONS, PASSIVE_GATHER_BY_STAGE, STARTER_RESOURCES, STAGE_RESOURCE_HINTS } from './data/items.js';
import { getRecipesForStage, RECIPE_DEFINITIONS } from './data/recipes.js';
import {
  createBuildPlacementSystem,
  createHealthSystem,
  createHungerSystem,
  createRestSafetySystem,
  createThirstSystem,
} from './systems/index.js';

export function createSurvivalPrototype(playerState) {
  const survivalState = createInitialState(playerState);
  const hungerSystem = createHungerSystem();
  const thirstSystem = createThirstSystem();
  const healthSystem = createHealthSystem();
  const restSafetySystem = createRestSafetySystem();
  const buildPlacement = createBuildPlacementSystem();
  const craftedRecipes = new Set();

  return {
    update(deltaSeconds) {
      const snapshot = playerState.getSnapshot();
      survivalState.stage = snapshot.stage;
      passivelyGatherResources(survivalState, deltaSeconds);
      autoDrinkIfPossible(survivalState);
      autoCraftForStage(survivalState, craftedRecipes);
      autoPlaceStructures(survivalState, buildPlacement);

      survivalState.effects.actionMultiplier = 1;
      restSafetySystem.update(survivalState, deltaSeconds);
      hungerSystem.update(survivalState, deltaSeconds);
      thirstSystem.update(survivalState, deltaSeconds);
      healthSystem.update(survivalState, deltaSeconds);

      syncToPlayerState(playerState, survivalState);
      return this.getSnapshot();
    },
    getSnapshot() {
      return cloneState(survivalState);
    },
    getDynamicEffects() {
      return {
        actionMultiplier: survivalState.effects.actionMultiplier,
        saveUnlocked: survivalState.effects.saveUnlocked,
        recoveryUnlocked: survivalState.effects.recoveryUnlocked,
      };
    },
  };
}

function createInitialState(playerState) {
  const snapshot = playerState.getSnapshot();
  return {
    stage: snapshot.stage,
    needs: {
      hunger: snapshot.stats.hunger,
      thirst: snapshot.stats.thirst,
      health: snapshot.stats.health,
      rest: snapshot.stats.rest ?? 100,
      safety: snapshot.stats.safety ?? 18,
      pressure: 0.3,
      flags: {
        hungry: false,
        starving: false,
        thirsty: false,
        dehydrated: false,
        wounded: false,
        critical: false,
      },
    },
    inventory: { ...STARTER_RESOURCES },
    crafted: {},
    base: {
      placements: [],
      summary: {
        shelterCoverage: 0,
        defenseCoverage: 0,
        utilityCoverage: 0,
        recoveryRate: 0,
        saveUnlocked: false,
      },
    },
    effects: {
      actionMultiplier: 1,
      restEfficiency: 1,
      saveUnlocked: false,
      recoveryUnlocked: false,
    },
    logs: [],
  };
}

function syncToPlayerState(playerState, survivalState) {
  playerState.setVitals({
    hunger: survivalState.needs.hunger,
    thirst: survivalState.needs.thirst,
    health: survivalState.needs.health,
    rest: survivalState.needs.rest,
    safety: survivalState.needs.safety,
  });
}

function passivelyGatherResources(state, deltaSeconds) {
  const gainMap = PASSIVE_GATHER_BY_STAGE[state.stage] ?? {};
  for (const [itemId, gainPerSecond] of Object.entries(gainMap)) {
    addAmount(state.inventory, itemId, gainPerSecond * deltaSeconds);
  }
}

function autoDrinkIfPossible(state) {
  if (state.needs.thirst > 60) {
    return;
  }

  if (hasAmount(state.inventory, 'clean_water', 1)) {
    addAmount(state.inventory, 'clean_water', -1);
    state.needs.thirst = Math.min(100, state.needs.thirst + 24);
    pushLog(state, 'Использована очищенная вода для восстановления жажды.');
    return;
  }

  if (hasAmount(state.inventory, 'water', 1)) {
    addAmount(state.inventory, 'water', -1);
    state.needs.thirst = Math.min(100, state.needs.thirst + 16);
    pushLog(state, 'Выпита собранная вода.');
  }
}

function autoCraftForStage(state, craftedRecipes) {
  const stageRecipes = getRecipesForStage(state.stage);
  for (const recipe of stageRecipes) {
    if (craftedRecipes.has(recipe.id) && !isRepeatable(recipe)) {
      continue;
    }

    if (!canCraft(recipe, state.inventory)) {
      continue;
    }

    consumeIngredients(recipe.ingredients, state.inventory);
    applyOutput(recipe.output, state);
    craftedRecipes.add(recipe.id);
    pushLog(state, `Создано: ${recipe.name}.`);
  }
}

function autoPlaceStructures(state, buildPlacement) {
  for (const structureId of Object.keys(BUILDING_DEFINITIONS)) {
    if (!hasAmount(state.crafted, structureId, 1)) {
      continue;
    }
    if (state.base.placements.some((placement) => placement.structureId === structureId)) {
      continue;
    }

    const result = buildPlacement.tryPlace(structureId, state);
    if (result.placed) {
      addAmount(state.crafted, structureId, -1);
      pushLog(state, `Размещено: ${BUILDING_DEFINITIONS[structureId].name} (${result.placement.snapPointId}).`);
    }
  }
}

function canCraft(recipe, inventory) {
  return Object.entries(recipe.ingredients).every(([itemId, amount]) => hasAmount(inventory, itemId, amount));
}

function consumeIngredients(ingredients, inventory) {
  for (const [itemId, amount] of Object.entries(ingredients)) {
    addAmount(inventory, itemId, -amount);
  }
}

function applyOutput(output, state) {
  for (const [itemId, amount] of Object.entries(output)) {
    if (BUILDING_DEFINITIONS[itemId]) {
      addAmount(state.crafted, itemId, amount);
      continue;
    }

    if (ITEM_DEFINITIONS[itemId]) {
      addAmount(state.inventory, itemId, amount);
    }
  }

  if (output.water_purifier) {
    addAmount(state.inventory, 'clean_water', 3 * output.water_purifier);
  }
}

function isRepeatable(recipe) {
  return !recipe.unlocksSave && !Object.keys(recipe.output).some((itemId) => BUILDING_DEFINITIONS[itemId]);
}

function addAmount(target, key, amount) {
  const nextValue = Math.max(0, (target[key] ?? 0) + amount);
  if (nextValue === 0) {
    delete target[key];
    return;
  }
  target[key] = round(nextValue);
}

function hasAmount(target, key, amount) {
  return (target[key] ?? 0) >= amount;
}

function pushLog(state, entry) {
  state.logs.unshift(entry);
  state.logs = state.logs.slice(0, 8);
}

function cloneState(state) {
  return {
    stage: state.stage,
    needs: {
      ...state.needs,
      flags: { ...state.needs.flags },
    },
    inventory: { ...state.inventory },
    crafted: { ...state.crafted },
    base: {
      placements: state.base.placements.map((placement) => ({
        ...placement,
        position: { ...placement.position },
        effects: { ...placement.effects },
      })),
      summary: { ...state.base.summary },
    },
    effects: { ...state.effects },
    logs: [...state.logs],
    recipePlan: getRecipeBlueprints(state.stage),
    itemCatalog: Object.values(ITEM_DEFINITIONS),
    stageHints: STAGE_RESOURCE_HINTS[state.stage] ?? [],
  };
}

function getRecipeBlueprints(stage) {
  return RECIPE_DEFINITIONS.filter((recipe) => recipe.stage === stage).map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    ingredients: { ...recipe.ingredients },
    output: { ...recipe.output },
  }));
}

function round(value) {
  return Math.round(value * 100) / 100;
}
