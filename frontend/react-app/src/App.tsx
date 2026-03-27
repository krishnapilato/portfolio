import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { getGPUTier } from 'detect-gpu';
import { Leva } from 'leva';
import DevRoom from './scenes/DevRoom';
import HUD from './components/HUD';
import useGameStore from './store';

export default function App() {
  const setPerformanceTier = useGameStore((s) => s.setPerformanceTier);
  const tier = useGameStore((s) => s.performanceTier);

  useEffect(() => {
    getGPUTier().then((result) => {
      if (result.tier >= 2) {
        setPerformanceTier('high');
      } else if (result.tier === 1) {
        setPerformanceTier('medium');
      } else {
        setPerformanceTier('low');
      }
    }).catch(() => {
      // Default to medium on detection failure
      setPerformanceTier('medium');
    });
  }, [setPerformanceTier]);

  const dpr: [number, number] = tier === 'high' ? [1, 2] : tier === 'medium' ? [1, 1.5] : [0.8, 1];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000' }}>
      <Leva collapsed={false} titleBar={{ title: 'DEV ROOM CONTROLS' }} />

      <Canvas
        dpr={dpr}
        camera={{ position: [0, 3.5, 9], fov: 60, near: 0.1, far: 200 }}
        shadows
        style={{ position: 'absolute', inset: 0 }}
        gl={{ antialias: tier !== 'low', alpha: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <DevRoom />
        </Suspense>
      </Canvas>

      <HUD />
    </div>
  );
}
