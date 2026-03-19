import { Float, Html } from '@react-three/drei';
import { HOSPITAL_PICKUPS } from './objectCatalog';
import { useGameStore } from '../core/useGameStore';

const pickupColor: Record<string, string> = {
  rags: '#d9d2c5',
  milkBottle: '#f3f2ff',
  scrap: '#93a2ad',
};

export function PickupNodes() {
  const collected = useGameStore((state) => state.pickupsCollected);
  const remote = useGameStore((state) => state.remoteSnapshot);
  const hiddenRemoteIds = new Set(remote?.pickups.filter((entry) => entry.collected).map((entry) => entry.id) ?? []);

  return (
    <group>
      {HOSPITAL_PICKUPS.filter((pickup) => !collected.includes(pickup.id) && !hiddenRemoteIds.has(pickup.id)).map((pickup) => (
        <Float key={pickup.id} speed={1.4} floatIntensity={0.25} position={pickup.position}>
          <mesh castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial emissive={pickupColor[pickup.itemId]} emissiveIntensity={1.1} color={pickupColor[pickup.itemId]} />
          </mesh>
          <Html distanceFactor={10} position={[0, 0.32, 0]}>
            <div className="pickup-label">{pickup.itemId === 'rags' ? 'Тряпки' : pickup.itemId === 'scrap' ? 'Материалы' : 'Молоко'}</div>
          </Html>
        </Float>
      ))}
    </group>
  );
}
