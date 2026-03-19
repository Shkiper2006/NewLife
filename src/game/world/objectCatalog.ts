import type { ItemId } from '../crafting/recipes';

export interface PickupSpawn {
  id: string;
  itemId: ItemId;
  position: [number, number, number];
  respawnable?: boolean;
}

export interface ThreatDefinition {
  id: string;
  label: string;
  position: [number, number, number];
  patrol: [number, number, number][];
  speed: number;
  damagePerSecond: number;
  triggerRadius: number;
}

export interface ExitDefinition {
  triggerPosition: [number, number, number];
  requiredStructure: 'simpleShelter';
  placementZone: [number, number, number];
  zoneRadius: number;
}

export const HOSPITAL_PICKUPS: PickupSpawn[] = [
  { id: 'pickup-rags-bed', itemId: 'rags', position: [-3.1, 0.18, -1.3] },
  { id: 'pickup-rags-vent', itemId: 'rags', position: [2.9, 0.18, -3.6] },
  { id: 'pickup-milk', itemId: 'milkBottle', position: [0.9, 0.28, 2.4] },
  { id: 'pickup-scrap-a', itemId: 'scrap', position: [5.3, 0.18, -1.8] },
  { id: 'pickup-scrap-b', itemId: 'scrap', position: [8.1, 0.18, -4.8] },
];

export const EARLY_THREAT: ThreatDefinition = {
  id: 'hospital-rat',
  label: 'Крыса',
  position: [4.8, 0.14, -2.8],
  patrol: [
    [4.8, 0.14, -2.8],
    [6.9, 0.14, -1.9],
    [8.8, 0.14, -3.8],
    [6.4, 0.14, -5.6],
  ],
  speed: 1.35,
  damagePerSecond: 9,
  triggerRadius: 1.35,
};

export const HOSPITAL_EXIT: ExitDefinition = {
  triggerPosition: [10.4, 0.2, -6.4],
  requiredStructure: 'simpleShelter',
  placementZone: [9, 0.12, -5.6],
  zoneRadius: 1.6,
};
