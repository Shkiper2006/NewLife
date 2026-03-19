import { WORLD_GATES, WORLD_ZONES } from './worldData.js';

export const WORLD_SCENE_CHUNKS = Object.freeze({
  'hospital-nursery': Object.freeze({ id: 'hospital-nursery', zoneId: 'hospital', sceneType: 'room', streamingRadius: 0, anchors: ['spawn', 'cribs', 'nurse-station'] }),
  'hospital-ward': Object.freeze({ id: 'hospital-ward', zoneId: 'hospital', sceneType: 'hall', streamingRadius: 1, anchors: ['med-carts', 'elevator-lobby'] }),
  'hospital-service-core': Object.freeze({ id: 'hospital-service-core', zoneId: 'hospital', sceneType: 'service', streamingRadius: 1, anchors: ['laundry', 'sterilization', 'generator-door'] }),
  'vents-intake': Object.freeze({ id: 'vents-intake', zoneId: 'hospital_vents', sceneType: 'micro', streamingRadius: 0, anchors: ['nursery-grate', 'filter-rack'] }),
  'vents-crossroads': Object.freeze({ id: 'vents-crossroads', zoneId: 'hospital_vents', sceneType: 'micro', streamingRadius: 1, anchors: ['fan-junction', 'cable-nest'] }),
  'vents-discharge': Object.freeze({ id: 'vents-discharge', zoneId: 'hospital_vents', sceneType: 'micro', streamingRadius: 1, anchors: ['kitchen-vent', 'courtyard-outlet'] }),
  'yards-playground': Object.freeze({ id: 'yards-playground', zoneId: 'yards', sceneType: 'courtyard', streamingRadius: 1, anchors: ['slide', 'sandbox', 'low-wall'] }),
  'yards-garden': Object.freeze({ id: 'yards-garden', zoneId: 'yards', sceneType: 'courtyard', streamingRadius: 1, anchors: ['berry-patch', 'rain-barrels'] }),
  'yards-sheds': Object.freeze({ id: 'yards-sheds', zoneId: 'yards', sceneType: 'courtyard', streamingRadius: 1, anchors: ['tool-shed', 'dog-run'] }),
  'streets-market': Object.freeze({ id: 'streets-market', zoneId: 'streets', sceneType: 'district', streamingRadius: 2, anchors: ['market-stalls', 'burned-bus'] }),
  'streets-checkpoint': Object.freeze({ id: 'streets-checkpoint', zoneId: 'streets', sceneType: 'district', streamingRadius: 2, anchors: ['gatehouse', 'scaffold'] }),
  'streets-transit': Object.freeze({ id: 'streets-transit', zoneId: 'streets', sceneType: 'district', streamingRadius: 2, anchors: ['tram-stop', 'service-bridge'] }),
  'rooftops-tenements': Object.freeze({ id: 'rooftops-tenements', zoneId: 'rooftops', sceneType: 'roofline', streamingRadius: 1, anchors: ['water-tower', 'cloth-bridge'] }),
  'rooftops-greenhouse': Object.freeze({ id: 'rooftops-greenhouse', zoneId: 'rooftops', sceneType: 'roofline', streamingRadius: 1, anchors: ['solar-rig', 'glasshouse'] }),
  'rooftops-relay': Object.freeze({ id: 'rooftops-relay', zoneId: 'rooftops', sceneType: 'roofline', streamingRadius: 2, anchors: ['antenna-array', 'beacon-nest'] }),
  'tunnels-pump-room': Object.freeze({ id: 'tunnels-pump-room', zoneId: 'utility_tunnels', sceneType: 'infrastructure', streamingRadius: 1, anchors: ['pressure-valves', 'runoff-gate'] }),
  'tunnels-cable-run': Object.freeze({ id: 'tunnels-cable-run', zoneId: 'utility_tunnels', sceneType: 'infrastructure', streamingRadius: 1, anchors: ['relay-coils', 'service-cart'] }),
  'tunnels-substation': Object.freeze({ id: 'tunnels-substation', zoneId: 'utility_tunnels', sceneType: 'infrastructure', streamingRadius: 2, anchors: ['breaker-wall', 'security-door'] }),
  'control-center-atrium': Object.freeze({ id: 'control-center-atrium', zoneId: 'control_center', sceneType: 'command', streamingRadius: 1, anchors: ['atrium-scan', 'archive-lift'] }),
  'control-center-ops': Object.freeze({ id: 'control-center-ops', zoneId: 'control_center', sceneType: 'command', streamingRadius: 1, anchors: ['tactical-map', 'server-floor'] }),
  'control-center-core': Object.freeze({ id: 'control-center-core', zoneId: 'control_center', sceneType: 'command', streamingRadius: 2, anchors: ['grid-heart', 'override-throne'] }),
});

export function createWorldChunkLoader() {
  return {
    listZoneChunks(zoneId) {
      return getZoneChunks(zoneId);
    },
    buildStreamingPlan(zoneId) {
      const zone = WORLD_ZONES[zoneId];
      if (!zone) {
        return [];
      }

      return zone.chunkIds.map((chunkId) => ({
        ...WORLD_SCENE_CHUNKS[chunkId],
        neighbors: getNeighborChunkIds(chunkId),
      }));
    },
    listConnectedZones(zoneId) {
      return WORLD_GATES.filter((gate) => gate.fromZoneId === zoneId || gate.toZoneId === zoneId).map((gate) => ({
        gateId: gate.id,
        zoneId: gate.fromZoneId === zoneId ? gate.toZoneId : gate.fromZoneId,
      }));
    },
  };
}

export function getZoneChunks(zoneId) {
  const zone = WORLD_ZONES[zoneId];
  return zone ? zone.chunkIds.map((chunkId) => WORLD_SCENE_CHUNKS[chunkId]) : [];
}

function getNeighborChunkIds(chunkId) {
  const chunk = WORLD_SCENE_CHUNKS[chunkId];
  if (!chunk) {
    return [];
  }

  const zoneChunkIds = WORLD_ZONES[chunk.zoneId]?.chunkIds ?? [];
  return zoneChunkIds.filter((candidate) => candidate !== chunkId);
}
