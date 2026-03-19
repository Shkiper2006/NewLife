import { create } from 'zustand';
import { AGE_STAGES, type AgeStageId } from '../progression/ageStages';
import { HOSPITAL_EXIT, HOSPITAL_PICKUPS } from '../world/objectCatalog';
import { ITEM_DEFINITIONS, RECIPE_DEFINITIONS, type ItemId } from '../crafting/recipes';
import type { NetworkWorldSnapshot } from '../network/protocol';

export interface InventoryState extends Partial<Record<ItemId, number>> {}

export interface ObjectiveState {
  title: string;
  detail: string;
  completed: boolean;
}

export interface GameStoreState {
  stage: AgeStageId;
  inventory: InventoryState;
  health: number;
  hunger: number;
  thirst: number;
  localPlayerId: string;
  playerPosition: [number, number, number];
  playerRotation: number;
  remoteSnapshot: NetworkWorldSnapshot | null;
  pickupsCollected: string[];
  placedStructures: { id: string; itemId: 'simpleShelter'; position: [number, number, number] }[];
  canEscape: boolean;
  escaped: boolean;
  activeObjective: ObjectiveState;
  logs: string[];
  initSession: () => void;
  tickNeeds: (delta: number) => void;
  setPlayerTransform: (position: [number, number, number], rotation: number) => void;
  addItem: (itemId: ItemId, amount?: number) => void;
  consumeItem: (itemId: ItemId, amount?: number) => boolean;
  collectPickup: (pickupId: string) => void;
  craft: (recipeId: string) => { ok: boolean; message: string };
  placeShelter: (position: [number, number, number]) => { ok: boolean; message: string };
  applyThreatDamage: (amount: number) => void;
  consumeMilkBottle: () => void;
  markEscaped: () => void;
  hydrateFromNetwork: (snapshot: NetworkWorldSnapshot) => void;
  pushLog: (message: string) => void;
}

const initialObjective = (): ObjectiveState => ({
  title: 'Выбраться из роддома',
  detail: 'Соберите тряпки и мусор, сделайте верёвку и укрытие, затем перекройте осколки у внешнего пролома.',
  completed: false,
});

const DEFAULT_LOCAL_ID = 'offline-local';

export const useGameStore = create<GameStoreState>((set, get) => ({
  stage: 'infant',
  inventory: {},
  health: 100,
  hunger: 82,
  thirst: 78,
  localPlayerId: DEFAULT_LOCAL_ID,
  playerPosition: [-6, 0.2, 1.5],
  playerRotation: 0,
  remoteSnapshot: null,
  pickupsCollected: [],
  placedStructures: [],
  canEscape: false,
  escaped: false,
  activeObjective: initialObjective(),
  logs: ['Проснуться в роддоме и найти путь наружу.'],
  initSession: () => {
    set({
      stage: 'infant',
      inventory: { rags: 0, milkBottle: 0, scrap: 0, rope: 0, simpleShelter: 0 },
      health: 100,
      hunger: 82,
      thirst: 78,
      playerPosition: [-6, 0.2, 1.5],
      playerRotation: 0,
      pickupsCollected: [],
      placedStructures: [],
      canEscape: false,
      escaped: false,
      activeObjective: initialObjective(),
      logs: ['Проснуться в роддоме и найти путь наружу.'],
    });
  },
  tickNeeds: (delta) => {
    const state = get();
    const hunger = Math.max(0, state.hunger - delta * 1.2);
    const thirst = Math.max(0, state.thirst - delta * 1.5);
    const penalty = hunger < 20 || thirst < 20 ? delta * 3.5 : 0;
    set({ health: Math.max(0, state.health - penalty), hunger, thirst });
  },
  setPlayerTransform: (position, rotation) => set({ playerPosition: position, playerRotation: rotation }),
  addItem: (itemId, amount = 1) => set((state) => ({ inventory: { ...state.inventory, [itemId]: (state.inventory[itemId] ?? 0) + amount } })),
  consumeItem: (itemId, amount = 1) => {
    const current = get().inventory[itemId] ?? 0;
    if (current < amount) return false;
    set((state) => ({ inventory: { ...state.inventory, [itemId]: Math.max(0, (state.inventory[itemId] ?? 0) - amount) } }));
    return true;
  },
  collectPickup: (pickupId) => {
    const pickup = HOSPITAL_PICKUPS.find((entry) => entry.id === pickupId);
    if (!pickup || get().pickupsCollected.includes(pickupId)) return;
    get().addItem(pickup.itemId, 1);
    set((state) => ({ pickupsCollected: [...state.pickupsCollected, pickupId] }));
    get().pushLog(`Подобрано: ${ITEM_DEFINITIONS[pickup.itemId].label}.`);
    if (pickup.itemId === 'milkBottle') {
      set((state) => ({ hunger: Math.min(100, state.hunger + 18) }));
    }
  },
  craft: (recipeId) => {
    const recipe = RECIPE_DEFINITIONS.find((entry) => entry.id === recipeId);
    if (!recipe) return { ok: false, message: 'Рецепт не найден.' };
    const state = get();
    const canCraft = Object.entries(recipe.ingredients).every(([itemId, amount]) => (state.inventory[itemId as ItemId] ?? 0) >= (amount ?? 0));
    if (!canCraft) return { ok: false, message: 'Недостаточно ресурсов.' };
    Object.entries(recipe.ingredients).forEach(([itemId, amount]) => get().consumeItem(itemId as ItemId, amount ?? 0));
    Object.entries(recipe.output).forEach(([itemId, amount]) => get().addItem(itemId as ItemId, amount ?? 0));
    get().pushLog(`Создано: ${recipe.label}.`);
    return { ok: true, message: `Создано: ${recipe.label}.` };
  },
  placeShelter: (position) => {
    const state = get();
    if ((state.inventory.simpleShelter ?? 0) < 1) return { ok: false, message: 'Сначала скрафтите простое укрытие.' };
    const [zoneX, , zoneZ] = HOSPITAL_EXIT.placementZone;
    const dx = position[0] - zoneX;
    const dz = position[2] - zoneZ;
    if (Math.hypot(dx, dz) > HOSPITAL_EXIT.zoneRadius) {
      return { ok: false, message: 'Укрытие нужно поставить возле осколков у пролома.' };
    }
    get().consumeItem('simpleShelter', 1);
    const structure = { id: `shelter-${Date.now()}`, itemId: 'simpleShelter' as const, position };
    set((current) => ({
      placedStructures: [...current.placedStructures, structure],
      canEscape: true,
      activeObjective: {
        title: 'Маршрут открыт',
        detail: 'Проползите через защищённый пролом наружу, избегая крысы.',
        completed: false,
      },
    }));
    get().pushLog('Укрытие установлено: путь к пролому стал безопасным.');
    return { ok: true, message: 'Укрытие установлено.' };
  },
  applyThreatDamage: (amount) => set((state) => ({ health: Math.max(0, state.health - amount) })),
  consumeMilkBottle: () => {
    if (!get().consumeItem('milkBottle', 1)) return;
    set((state) => ({ hunger: Math.min(100, state.hunger + 22), thirst: Math.min(100, state.thirst + 8) }));
    get().pushLog('Бутылочка выпита, голод восстановлен.');
  },
  markEscaped: () => {
    if (get().escaped) return;
    set({
      escaped: true,
      activeObjective: {
        title: 'Прототип пройден',
        detail: 'Маршрут наружу открыт. Следующие этапы: двор, улицы и дальнейшее взросление.',
        completed: true,
      },
    });
    get().pushLog('Вы нашли путь наружу из роддома.');
  },
  hydrateFromNetwork: (snapshot) => {
    const local = snapshot.players.find((player) => player.id === snapshot.selfId);
    set({
      remoteSnapshot: snapshot,
      localPlayerId: snapshot.selfId,
      canEscape: snapshot.escapeUnlocked || get().canEscape,
      placedStructures: snapshot.structures,
    });
    if (local) {
      set({ playerPosition: local.position, playerRotation: local.rotation, health: Math.min(get().health, local.health) });
    }
  },
  pushLog: (message) => set((state) => ({ logs: [message, ...state.logs].slice(0, 6) })),
}));

export const selectInventoryEntries = (inventory: InventoryState) =>
  Object.entries(inventory as Record<string, number>)
    .filter(([, amount]) => (amount ?? 0) > 0)
    .map(([itemId, amount]) => ({ itemId: itemId as ItemId, amount: amount ?? 0, label: ITEM_DEFINITIONS[itemId as ItemId].label }));

export const selectStageDefinition = (stage: AgeStageId) => AGE_STAGES[stage];
