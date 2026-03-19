import { useGameStore } from '../core/useGameStore';

export function PlacedStructures() {
  const structures = useGameStore((state) => state.placedStructures);

  return (
    <group>
      {structures.map((structure) => (
        <group key={structure.id} position={structure.position}>
          <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
            <boxGeometry args={[1.4, 0.12, 1.1]} />
            <meshStandardMaterial color="#8d6e52" />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.45, -0.28]}>
            <boxGeometry args={[1.1, 0.5, 0.08]} />
            <meshStandardMaterial color="#d8ccb6" transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
