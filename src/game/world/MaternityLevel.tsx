import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { HOSPITAL_EXIT } from './objectCatalog';

function Bed({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        <mesh castShadow receiveShadow position={[0, 0.56, 0]}>
          <boxGeometry args={[2.2, 0.12, 1.1]} />
          <meshStandardMaterial color="#cfd7e8" />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.28, 0]}>
          <boxGeometry args={[2, 0.14, 0.9]} />
          <meshStandardMaterial color="#8893aa" />
        </mesh>
        <CuboidCollider args={[1.1, 0.08, 0.55]} position={[0, 0.56, 0]} />
        <CuboidCollider args={[0.08, 0.28, 0.08]} position={[-0.95, 0.28, -0.4]} />
        <CuboidCollider args={[0.08, 0.28, 0.08]} position={[0.95, 0.28, -0.4]} />
        <CuboidCollider args={[0.08, 0.28, 0.08]} position={[-0.95, 0.28, 0.4]} />
        <CuboidCollider args={[0.08, 0.28, 0.08]} position={[0.95, 0.28, 0.4]} />
      </RigidBody>
    </group>
  );
}

export function MaternityLevel() {
  const [zoneX, zoneY, zoneZ] = HOSPITAL_EXIT.placementZone;

  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[34, 22]} />
          <meshStandardMaterial color="#7a7f85" />
        </mesh>
        <CuboidCollider args={[17, 0.05, 11]} position={[0, -0.05, 0]} />
      </RigidBody>

      <RigidBody type="fixed" colliders={false}>
        <mesh position={[0, 1.6, -8.5]} receiveShadow>
          <boxGeometry args={[24, 3.2, 0.4]} />
          <meshStandardMaterial color="#a6b0b9" />
        </mesh>
        <mesh position={[-11.8, 1.6, 0]} receiveShadow>
          <boxGeometry args={[0.4, 3.2, 17]} />
          <meshStandardMaterial color="#a6b0b9" />
        </mesh>
        <mesh position={[11.8, 1.6, 0]} receiveShadow>
          <boxGeometry args={[0.4, 3.2, 17]} />
          <meshStandardMaterial color="#a6b0b9" />
        </mesh>
        <mesh position={[0, 3.2, 0]} receiveShadow>
          <boxGeometry args={[24, 0.3, 17]} />
          <meshStandardMaterial color="#c7d2dd" />
        </mesh>
        <CuboidCollider args={[12, 1.6, 0.2]} position={[0, 1.6, -8.5]} />
        <CuboidCollider args={[0.2, 1.6, 8.5]} position={[-11.8, 1.6, 0]} />
        <CuboidCollider args={[0.2, 1.6, 8.5]} position={[11.8, 1.6, 0]} />
        <CuboidCollider args={[12, 0.15, 8.5]} position={[0, 3.2, 0]} />
      </RigidBody>

      <Bed position={[-4, 0, -1]} />
      <Bed position={[-0.5, 0, -2.4]} />
      <Bed position={[4.2, 0, -0.8]} />
      <Bed position={[6.2, 0, -4.7]} />

      <RigidBody type="fixed" colliders={false}>
        <mesh position={[1.2, 0.55, 4.4]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 1.1, 1.1]} />
          <meshStandardMaterial color="#e6e1da" />
        </mesh>
        <CuboidCollider args={[1.2, 0.55, 0.55]} position={[1.2, 0.55, 4.4]} />
      </RigidBody>

      <RigidBody type="fixed" colliders={false}>
        <mesh position={[3.8, 0.85, -4.2]} castShadow receiveShadow>
          <boxGeometry args={[4.8, 1.7, 1]} />
          <meshStandardMaterial color="#9ba5b0" />
        </mesh>
        <CuboidCollider args={[2.4, 0.85, 0.5]} position={[3.8, 0.85, -4.2]} />
      </RigidBody>

      <RigidBody type="fixed" colliders={false}>
        <mesh position={[8.9, 0.42, -6.2]} rotation={[0, 0, -0.24]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.18, 1.8]} />
          <meshStandardMaterial color="#bcc5ce" />
        </mesh>
        <mesh position={[10.4, 0.5, -6.4]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.7, 0.4]} />
          <meshStandardMaterial color="#7f8ea1" emissive="#73a3dd" emissiveIntensity={0.3} />
        </mesh>
      </RigidBody>

      <mesh position={[zoneX, zoneY + 0.02, zoneZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[1.15, 1.35, 32]} />
        <meshBasicMaterial color="#f8d26a" transparent opacity={0.8} />
      </mesh>

      <mesh position={[10.7, 0.42, -6.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#8ad9ff" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
