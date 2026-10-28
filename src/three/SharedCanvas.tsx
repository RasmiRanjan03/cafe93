import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';
import * as THREE from 'three';
import { getQualityTier } from '../hooks/useDevice';

/**
 * One fixed, transparent canvas that draws every <View> below the hero.
 * pointer-events are off, so it never blocks the page underneath.
 */
export default function SharedCanvas() {
  const tier = getQualityTier();
  return (
    <Canvas
      className="!fixed inset-0 !pointer-events-none"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 30 }}
      dpr={tier === 'high' ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      aria-hidden
    >
      <View.Port />
    </Canvas>
  );
}
