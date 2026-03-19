import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MaternityLevel } from '../world/MaternityLevel';
import { PickupNodes } from '../world/PickupNodes';
import { PlayerController } from '../player/PlayerController';
import { RemotePlayers } from '../player/RemotePlayers';
import { ThreatRat } from '../survival/ThreatRat';
import { PlacedStructures } from '../building/PlacedStructures';
import { useGameStore } from './useGameStore';

export function GameScene() {
  const tickNeeds = useGameStore((state) => state.tickNeeds);
  const pushLog = useGameStore((state) => state.pushLog);

  useEffect(() => {
    pushLog('Управление: WASD — ползти, E — поднять, 1/2 — крафт, Q — поставить укрытие, F — выпить молоко.');
  }, [pushLog]);

  useFrame((_, delta) => {
    tickNeeds(delta);
  });

  return (
    <>
      <MaternityLevel />
      <PickupNodes />
      <PlacedStructures />
      <ThreatRat />
      <PlayerController />
      <RemotePlayers />
    </>
  );
}
