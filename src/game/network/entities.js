export const NetworkEntityKind = Object.freeze({
  Player: 'Player',
  Buildable: 'Buildable',
  Pickup: 'Pickup',
  Enemy: 'Enemy',
  WorldEvent: 'WorldEvent',
});

export function createPlayerEntity(config) {
  return createReplicatedEntity({
    kind: NetworkEntityKind.Player,
    authority: 'hybrid',
    channels: ['input', 'movement', 'inventory', 'bonuses', 'story'],
    predictableFields: ['position', 'velocity', 'cameraYaw', 'animationState'],
    authoritativeFields: ['inventory', 'health', 'role', 'roleBonuses', 'respawnState', 'storyFlags'],
    ...config,
  });
}

export function createBuildableEntity(config) {
  return createReplicatedEntity({
    kind: NetworkEntityKind.Buildable,
    authority: 'server',
    channels: ['construction', 'durability', 'ownership', 'story'],
    predictableFields: [],
    authoritativeFields: ['state', 'durability', 'ownerId', 'snapPointId', 'effects'],
    ...config,
  });
}

export function createPickupEntity(config) {
  return createReplicatedEntity({
    kind: NetworkEntityKind.Pickup,
    authority: 'server',
    channels: ['spawn', 'claim', 'despawn'],
    predictableFields: [],
    authoritativeFields: ['itemId', 'amount', 'spawnSource', 'respawnAt'],
    ...config,
  });
}

export function createEnemyEntity(config) {
  return createReplicatedEntity({
    kind: NetworkEntityKind.Enemy,
    authority: 'server',
    channels: ['ai', 'combat', 'loot'],
    predictableFields: ['animationState'],
    authoritativeFields: ['position', 'aggroTargetId', 'health', 'spawnZoneId', 'threatLevel'],
    ...config,
  });
}

export function createWorldEventEntity(config) {
  return createReplicatedEntity({
    kind: NetworkEntityKind.WorldEvent,
    authority: 'server',
    channels: ['story', 'environment', 'checkpoint'],
    predictableFields: [],
    authoritativeFields: ['state', 'zoneId', 'participants', 'storyFlags', 'progress'],
    ...config,
  });
}

function createReplicatedEntity(config) {
  return Object.freeze({
    id: config.id,
    kind: config.kind,
    authority: config.authority,
    ownerId: config.ownerId ?? null,
    channels: Object.freeze([...(config.channels ?? [])]),
    predictableFields: Object.freeze([...(config.predictableFields ?? [])]),
    authoritativeFields: Object.freeze([...(config.authoritativeFields ?? [])]),
    state: freezeJson(config.state ?? {}),
    tags: Object.freeze([...(config.tags ?? [])]),
  });
}

function freezeJson(value) {
  return Object.freeze(structuredClone(value));
}
