import { useGameStore } from '../core/useGameStore';
import type { NetworkWorldSnapshot } from './protocol';

let socket: WebSocket | null = null;
let sendTimer: number | null = null;

const url = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:2567`;
};

export function connectNetwork() {
  if (socket || typeof window === 'undefined') return;
  socket = new WebSocket(url());

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'snapshot') {
      useGameStore.getState().hydrateFromNetwork(data.payload as NetworkWorldSnapshot);
    }
    if (data.type === 'log') {
      useGameStore.getState().pushLog(`Кооп: ${data.payload}`);
    }
  });

  socket.addEventListener('open', () => {
    useGameStore.getState().pushLog('Кооп-сессия подключена. Откройте вторую вкладку для второго игрока.');
    sendTimer = window.setInterval(() => {
      const state = useGameStore.getState();
      socket?.send(
        JSON.stringify({
          type: 'update-player',
          payload: {
            position: state.playerPosition,
            rotation: state.playerRotation,
            health: state.health,
            stage: state.stage,
          },
        }),
      );
    }, 80);
  });

  socket.addEventListener('close', () => {
    cleanup();
    useGameStore.getState().pushLog('Кооп-соединение закрыто, игра продолжится локально.');
  });
}

export function disconnectNetwork() {
  socket?.close();
  cleanup();
}

export function sendPickupCollected(pickupId: string) {
  socket?.send(JSON.stringify({ type: 'pickup', payload: { pickupId } }));
}

export function sendStructurePlaced(position: [number, number, number]) {
  socket?.send(JSON.stringify({ type: 'place-structure', payload: { itemId: 'simpleShelter', position } }));
}

function cleanup() {
  if (sendTimer !== null) window.clearInterval(sendTimer);
  sendTimer = null;
  socket = null;
}
