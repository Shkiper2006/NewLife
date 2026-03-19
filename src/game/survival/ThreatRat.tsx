import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group, MathUtils, Vector3 } from 'three';
import { useGameStore } from '../core/useGameStore';
import { EARLY_THREAT } from '../world/objectCatalog';

const targetVector = new Vector3();
const nextVector = new Vector3();

export function ThreatRat() {
  const ref = useRef(null as Group | null);
  const patrolIndex = useRef(0);
  const applyThreatDamage = useGameStore((state) => state.applyThreatDamage);
  const playerPosition = useGameStore((state) => state.playerPosition);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const group = ref.current;
    const targetPoint = EARLY_THREAT.patrol[patrolIndex.current];
    targetVector.set(targetPoint[0], targetPoint[1], targetPoint[2]);
    nextVector.copy(targetVector).sub(group.position);
    if (nextVector.length() < 0.18) {
      patrolIndex.current = (patrolIndex.current + 1) % EARLY_THREAT.patrol.length;
    } else {
      nextVector.normalize();
      group.position.addScaledVector(nextVector, delta * EARLY_THREAT.speed);
      group.rotation.y = MathUtils.lerp(group.rotation.y, Math.atan2(nextVector.x, nextVector.z), 0.12);
    }

    const distance = Math.hypot(group.position.x - playerPosition[0], group.position.z - playerPosition[2]);
    if (distance < EARLY_THREAT.triggerRadius) {
      applyThreatDamage(EARLY_THREAT.damagePerSecond * delta);
    }
  });

  return (
    <group ref={ref} position={EARLY_THREAT.position}>
      <mesh castShadow position={[0, 0.12, 0]}>
        <capsuleGeometry args={[0.12, 0.2, 4, 8]} />
        <meshStandardMaterial color="#51463d" />
      </mesh>
      <mesh castShadow position={[0.2, 0.08, -0.08]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#5d5248" />
      </mesh>
      <mesh castShadow position={[-0.22, 0.09, 0.12]} rotation={[0.2, 0.1, -0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.55, 8]} />
        <meshStandardMaterial color="#6d6056" />
      </mesh>
    </group>
  );
}
