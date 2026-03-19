import { Html, useKeyboardControls } from '@react-three/drei';
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Group, MathUtils, Vector3 } from 'three';
import { useGameStore } from '../core/useGameStore';
import { sendPickupCollected, sendStructurePlaced } from '../network/createNetworkClient';
import { HOSPITAL_EXIT, HOSPITAL_PICKUPS } from '../world/objectCatalog';
import { AGE_STAGES } from '../progression/ageStages';

const movement = new Vector3();
const worldPosition = new Vector3();

export function PlayerController() {
  const bodyRef = useRef(null as RapierRigidBody | null);
  const visualRef = useRef(null as Group | null);
  const [, getKeys] = useKeyboardControls();
  const camera = useThree((state) => state.camera);
  const stage = useGameStore((state) => state.stage);
  const setPlayerTransform = useGameStore((state) => state.setPlayerTransform);
  const collectPickup = useGameStore((state) => state.collectPickup);
  const craft = useGameStore((state) => state.craft);
  const placeShelter = useGameStore((state) => state.placeShelter);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const canEscape = useGameStore((state) => state.canEscape);
  const markEscaped = useGameStore((state) => state.markEscaped);
  const consumeMilkBottle = useGameStore((state) => state.consumeMilkBottle);
  const pushLog = useGameStore((state) => state.pushLog);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.code === 'Digit1') {
        pushLog(craft('rope-from-rags').message);
      }
      if (event.code === 'Digit2') {
        pushLog(craft('simple-shelter').message);
      }
      if (event.code === 'KeyF') {
        consumeMilkBottle();
      }
      if (event.code === 'KeyQ') {
        const placement: [number, number, number] = [playerPosition[0] + 0.7, 0.12, playerPosition[2] - 0.25];
        const result = placeShelter(placement);
        pushLog(result.message);
        if (result.ok) sendStructurePlaced(placement);
      }
      if (event.code === 'KeyE') {
        const nearbyPickup = HOSPITAL_PICKUPS.find((pickup) => Math.hypot(pickup.position[0] - playerPosition[0], pickup.position[2] - playerPosition[2]) < 1.1);
        if (nearbyPickup) {
          collectPickup(nearbyPickup.id);
          sendPickupCollected(nearbyPickup.id);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [collectPickup, consumeMilkBottle, craft, placeShelter, playerPosition, pushLog]);

  useFrame((_, delta) => {
    if (!bodyRef.current || !visualRef.current) return;
    const { forward, backward, left, right } = getKeys();
    movement.set(Number(right) - Number(left), 0, Number(backward) - Number(forward));
    if (movement.lengthSq() > 0) movement.normalize();

    const maxSpeed = AGE_STAGES[stage].maxSpeed;
    const velocity = movement.multiplyScalar(maxSpeed);
    bodyRef.current.setLinvel({ x: velocity.x, y: bodyRef.current.linvel().y, z: velocity.z }, true);

    const translation = bodyRef.current.translation();
    setPlayerTransform([translation.x, translation.y, translation.z], Math.atan2(velocity.x || 0, velocity.z || 1));

    if (movement.lengthSq() > 0) {
      visualRef.current.rotation.y = MathUtils.lerp(visualRef.current.rotation.y, Math.atan2(velocity.x, velocity.z), 0.2);
    }

    worldPosition.set(translation.x, translation.y + 1.4, translation.z + 4.5);
    camera.position.lerp(worldPosition, 0.08);
    camera.lookAt(translation.x, translation.y + 0.25, translation.z);

    const exitDistance = Math.hypot(translation.x - HOSPITAL_EXIT.triggerPosition[0], translation.z - HOSPITAL_EXIT.triggerPosition[2]);
    if (canEscape && exitDistance < 1.1) {
      markEscaped();
    }
  });

  return (
    <RigidBody ref={bodyRef} colliders={false} mass={1} position={[-6, 0.25, 1.5]} enabledRotations={[false, false, false]} friction={1.5}>
      <CapsuleCollider args={[0.14, 0.16]} position={[0, 0.16, 0]} />
      <group ref={visualRef}>
        <mesh castShadow position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color="#efc3a8" />
        </mesh>
        <mesh castShadow position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.18, 0.3, 6, 10]} />
          <meshStandardMaterial color="#9ec2ff" />
        </mesh>
        <Html distanceFactor={10} position={[0, 0.58, 0]}>
          <div className="player-tag">Вы</div>
        </Html>
      </group>
    </RigidBody>
  );
}
