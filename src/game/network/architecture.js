export const NetworkTransport = Object.freeze({
  WebSocket: 'websocket',
  WebRTCDataChannel: 'webrtc-datachannel',
});

export function createNetworkArchitectureBlueprint() {
  return Object.freeze({
    authorityModel: 'authoritative-server',
    serverRuntime: 'Node.js + Colyseus-style room backend',
    decision: 'Use a Node.js authoritative server for simulation and replication over WebSockets; reserve WebRTC data channels for optional low-latency side traffic later.',
    rationale: [
      'Authoritative state prevents inventory, damage, construction, resource spawns, and story triggers from drifting between peers.',
      'WebSockets give predictable reconnect/join flows for 2–8 co-op sessions without forcing a relay topology on the prototype.',
      'A room-based backend keeps the gameplay protocol independent from content production so interactive entities can ship through one replication contract.',
    ],
    transports: [
      {
        id: NetworkTransport.WebSocket,
        usage: 'default gameplay replication, commands, join/leave, respawn, reconnect',
        reliability: 'reliable ordered',
      },
      {
        id: NetworkTransport.WebRTCDataChannel,
        usage: 'future optional voice/telemetry or ultra-fast ephemeral signals after the server protocol stabilizes',
        reliability: 'mixed / optional',
      },
    ],
    simulation: {
      serverTickRate: 20,
      replicationRate: 10,
      localPredictionRate: 60,
      inputBufferSize: 8,
    },
    ownership: {
      locallyPredicted: ['movement', 'camera', 'animation'],
      serverAuthoritative: ['inventory', 'damage', 'building', 'resourceSpawns', 'storyTriggers', 'sharedProgress'],
    },
    session: {
      minPlayers: 2,
      maxPlayers: 8,
      reconnectWindowSeconds: 45,
      sharedStory: true,
      respawnPolicy: 'server-approved checkpoint respawn',
    },
  });
}
