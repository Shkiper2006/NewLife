import { Html } from '@react-three/drei';
import { useGameStore } from '../core/useGameStore';

export function RemotePlayers() {
  const snapshot = useGameStore((state) => state.remoteSnapshot);
  if (!snapshot) return null;

  return (
    <group>
      {snapshot.players
        .filter((player) => player.id !== snapshot.selfId)
        .map((player) => (
          <group key={player.id} position={player.position} rotation={[0, player.rotation, 0]}>
            <mesh castShadow position={[0, 0.18, 0]}>
              <sphereGeometry args={[0.22, 24, 24]} />
              <meshStandardMaterial color="#f5df8e" />
            </mesh>
            <mesh castShadow position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.18, 0.3, 6, 10]} />
              <meshStandardMaterial color="#8fd0a0" />
            </mesh>
            <Html distanceFactor={10} position={[0, 0.58, 0]}>
              <div className="player-tag">{player.name}</div>
            </Html>
          </group>
        ))}
    </group>
  );
}
