export type AgeStageId = 'infant' | 'child' | 'teen' | 'adult';

export interface AgeStageDefinition {
  id: AgeStageId;
  label: string;
  movementModes: string[];
  systems: string[];
  maxSpeed: number;
  crawlHeight: number;
  interactionRadius: number;
  description: string;
}

export const AGE_STAGES: Record<AgeStageId, AgeStageDefinition> = {
  infant: {
    id: 'infant',
    label: 'Младенец',
    movementModes: ['crawl'],
    systems: ['pickup', 'basic-crafting', 'crawl-navigation'],
    maxSpeed: 2.6,
    crawlHeight: 0.34,
    interactionRadius: 1.45,
    description: 'Ползает, пролезает в узкие щели, использует только базовый крафт и простые укрытия.',
  },
  child: {
    id: 'child',
    label: 'Ребёнок',
    movementModes: ['walk', 'climb'],
    systems: ['tools', 'climb-ledges', 'simple-construction'],
    maxSpeed: 4.4,
    crawlHeight: 0.65,
    interactionRadius: 1.8,
    description: 'Будущая стадия: ходьба, лазание и простые инструменты.',
  },
  teen: {
    id: 'teen',
    label: 'Подросток',
    movementModes: ['walk', 'run', 'combat'],
    systems: ['combat', 'weapons', 'base-building', 'traps'],
    maxSpeed: 5.6,
    crawlHeight: 1,
    interactionRadius: 2,
    description: 'Будущая стадия: бой, оружие, база и ловушки.',
  },
  adult: {
    id: 'adult',
    label: 'Взрослый',
    movementModes: ['walk', 'run', 'engineering'],
    systems: ['engineering', 'infrastructure', 'story-endings'],
    maxSpeed: 6,
    crawlHeight: 1.2,
    interactionRadius: 2.2,
    description: 'Будущая стадия: инженерия, восстановление инфраструктуры и финальный выбор.',
  },
};
