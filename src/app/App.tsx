import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Loader, Sky } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Suspense, useEffect } from 'react';
import { GameScene } from '../game/core/GameScene';
import { Hud } from '../ui/Hud';
import { useGameStore } from '../game/core/useGameStore';
import { connectNetwork, disconnectNetwork } from '../game/network/createNetworkClient';

const controls = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'interact', keys: ['KeyE'] },
  { name: 'craftRope', keys: ['Digit1'] },
  { name: 'craftShelter', keys: ['Digit2'] },
  { name: 'placeShelter', keys: ['KeyQ'] },
];

export function App() {
  const init = useGameStore((state) => state.initSession);

  useEffect(() => {
    init();
    connectNetwork();
    return () => disconnectNetwork();
  }, [init]);

  return (
    <KeyboardControls map={controls}>
      <div className="app-shell">
        <Canvas camera={{ position: [0, 1.4, 5], fov: 55 }} shadows>
          <color attach="background" args={['#a7b7c9']} />
          <fog attach="fog" args={['#a7b7c9', 12, 42]} />
          <ambientLight intensity={1.2} />
          <directionalLight castShadow intensity={1.8} position={[8, 14, 5]} shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
          <Sky sunPosition={[5, 1, 8]} />
          <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]}>
              <GameScene />
            </Physics>
          </Suspense>
        </Canvas>
        <Hud />
        <Loader />
      </div>
    </KeyboardControls>
  );
}
