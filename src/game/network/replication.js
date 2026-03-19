import { NetworkEntityKind } from './entities.js';

export function createReplicationLayer(config = {}) {
  const entities = new Map();
  let revision = 0;

  const settings = {
    serverTickRate: config.serverTickRate ?? 20,
    replicationRate: config.replicationRate ?? 10,
    localPredictionRate: config.localPredictionRate ?? 60,
  };

  function upsertEntity(entity) {
    revision += 1;
    entities.set(entity.id, {
      ...entity,
      revision,
      updatedAt: revision,
    });
  }

  function removeEntity(entityId) {
    entities.delete(entityId);
  }

  function replaceCollection(kind, nextEntities) {
    const expectedIds = new Set(nextEntities.map((entity) => entity.id));

    for (const [entityId, entity] of entities.entries()) {
      if (entity.kind === kind && !expectedIds.has(entityId)) {
        entities.delete(entityId);
      }
    }

    nextEntities.forEach(upsertEntity);
  }

  function listEntities() {
    return [...entities.values()]
      .sort((left, right) => left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id))
      .map((entity) => ({
        ...entity,
        channels: [...entity.channels],
        predictableFields: [...entity.predictableFields],
        authoritativeFields: [...entity.authoritativeFields],
        state: structuredClone(entity.state),
        tags: [...entity.tags],
      }));
  }

  function summarizeEntities() {
    const summary = {
      total: entities.size,
      predicted: 0,
      authoritative: 0,
      hybrid: 0,
      byKind: {
        [NetworkEntityKind.Player]: 0,
        [NetworkEntityKind.Buildable]: 0,
        [NetworkEntityKind.Pickup]: 0,
        [NetworkEntityKind.Enemy]: 0,
        [NetworkEntityKind.WorldEvent]: 0,
      },
    };

    for (const entity of entities.values()) {
      summary.byKind[entity.kind] += 1;
      if (entity.authority === 'server') {
        summary.authoritative += 1;
      } else if (entity.authority === 'hybrid') {
        summary.hybrid += 1;
      } else {
        summary.predicted += 1;
      }
    }

    return summary;
  }

  return {
    upsertEntity,
    removeEntity,
    replaceCollection,
    getSnapshot() {
      return {
        revision,
        settings: { ...settings },
        summary: summarizeEntities(),
        entities: listEntities(),
      };
    },
  };
}
