import { WebSocketServer } from 'ws';

const port = 2567;
const wss = new WebSocketServer({ port });

const world = {
  players: new Map(),
  pickups: [
    { id: 'pickup-rags-bed', itemId: 'rags', position: [-3.1, 0.18, -1.3], collected: false },
    { id: 'pickup-rags-vent', itemId: 'rags', position: [2.9, 0.18, -3.6], collected: false },
    { id: 'pickup-milk', itemId: 'milkBottle', position: [0.9, 0.28, 2.4], collected: false },
    { id: 'pickup-scrap-a', itemId: 'scrap', position: [5.3, 0.18, -1.8], collected: false },
    { id: 'pickup-scrap-b', itemId: 'scrap', position: [8.1, 0.18, -4.8], collected: false },
  ],
  structures: [],
  escapeUnlocked: false,
};

const snapshotFor = (selfId) => ({
  selfId,
  players: [...world.players.values()],
  pickups: world.pickups,
  structures: world.structures,
  escapeUnlocked: world.escapeUnlocked,
});

const broadcast = () => {
  for (const client of wss.clients) {
    if (client.readyState !== 1 || !client.playerId) continue;
    client.send(JSON.stringify({ type: 'snapshot', payload: snapshotFor(client.playerId) }));
  }
};

wss.on('connection', (socket) => {
  const id = `player-${Math.random().toString(36).slice(2, 8)}`;
  socket.playerId = id;
  world.players.set(id, {
    id,
    name: `Игрок ${world.players.size + 1}`,
    position: [-6 + world.players.size * 0.8, 0.2, 1.5],
    rotation: 0,
    health: 100,
    stage: 'infant',
  });
  socket.send(JSON.stringify({ type: 'log', payload: `${world.players.get(id).name} вошёл в сессию.` }));
  broadcast();

  socket.on('message', (raw) => {
    const message = JSON.parse(String(raw));
    if (message.type === 'update-player') {
      const player = world.players.get(id);
      if (!player) return;
      Object.assign(player, message.payload);
    }
    if (message.type === 'pickup') {
      const pickup = world.pickups.find((entry) => entry.id === message.payload.pickupId);
      if (pickup) pickup.collected = true;
    }
    if (message.type === 'place-structure') {
      world.structures = [
        ...world.structures,
        { id: `structure-${Date.now()}`, itemId: 'simpleShelter', position: message.payload.position },
      ];
      world.escapeUnlocked = true;
    }
    broadcast();
  });

  socket.on('close', () => {
    world.players.delete(id);
    broadcast();
  });
});

console.log(`[newlife] WebSocket co-op server listening on ws://localhost:${port}`);
