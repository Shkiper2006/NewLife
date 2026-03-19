import type { ItemId } from '../crafting/recipes';

export interface NetworkPlayerState {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: number;
  health: number;
  stage: string;
}

export interface NetworkPickupState {
  id: string;
  itemId: ItemId;
  position: [number, number, number];
  collected: boolean;
}

export interface NetworkStructureState {
  id: string;
  itemId: 'simpleShelter';
  position: [number, number, number];
}

export interface NetworkWorldSnapshot {
  selfId: string;
  players: NetworkPlayerState[];
  pickups: NetworkPickupState[];
  structures: NetworkStructureState[];
  escapeUnlocked: boolean;
}
