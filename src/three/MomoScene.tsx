import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import type { QualityTier } from '../hooks/useDevice';
import MomoBucket, { BUCKET } from './MomoBucket';
import BucketLid from './BucketLid';
import FloatingMomos, { RISERS } from './FloatingMomos';
import SteamParticles from './SteamParticles';
import CameraRig from './CameraRig';
import { buildHeroTimeline, createHeroAnim, setFinal, type HeroAnim } from './heroAnimation';
import { createRadialTexture } from './brandTextures';

export interface MomoSceneProps {
  tier: QualityTier;
  reducedMotion: boolean;
  mouse: boolean;
  shiftRight: boolean;
  /** stop rendering when the hero is scrolled out of view */
  active: boolean;
  /** increment to replay the reveal */
  replayKey: number;
  onReady: () => void;
  onReveal: () => void;
}

/** Bucket, lid, steam and lights — everything that moves with the timeline. */
function Composition({
  anim,
  tier,
  reducedMotion,
}: {
  anim: React.MutableRefObject<HeroAnim>;
  tier: QualityTier;
  reducedMotion: boolean;
}) {
  const bucket = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const key = useRef<THREE.SpotLight>(null);
  const glow = useRef<THREE.PointLight>(null);
  const leak = useRef(0);
  const steam = useRef(0);

  const high = tier === 'high';
  const detail = tier === 'low' ? 'low' : 'high';
  const shadowTex = useMemo(() => createRadialTexture('rgba(0,0,0,0.85)'), []);
  const glowTex = useMemo(() => createRadialTexture('rgba(229,57,53,0.55)', 'rgba(229,57,53,0)'), []);
  useEffect(() => () => { shadowTex.dispose(); glowTex.dispose(); }, [shadowTex, glowTex]);

  useFrame((state) => {
    const a = anim.current;
    const t = state.clock.elapsedTime;
    const bob = reducedMotion ? 0 : Math.sin(t * 1.1) * 0.035;
    if (bucket.current) {
      bucket.current.position.y = bob;
      bucket.current.rotation.y = a.bucketRot + (reducedMotion ? 0 : Math.sin(t * 0.35) * 0.04 * a.idle);
    }
    if (lid.current) {
      lid.current.rotation.x = a.lidAngle;
      lid.current.position.y = BUCKET.topY + a.lidLift;
    }
    if (key.current) key.current.position.x = a.lightX;
    if (glow.current) glow.current.intensity = a.glow * 2.6;
    leak.current = a.leak;
    steam.current = a.steam;
  });

  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0.4, 0);
    return o;
  }, []);

  return (
    <>
      <ambientLight intensity={0.22} />
      <hemisphereLight args={['#fff1dc', '#2a0d0b', 0.35]} />
      <primitive object={target} />
      <spotLight
        ref={key}
        position={[-5, 6.5, 5]}
        target={target}
        angle={0.55}
        penumbra={0.85}
        intensity={160}
        distance={30}
        decay={2}
        color="#ffe2b8"
        castShadow={high}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {/* chili-red rim from behind, gold kicker from the side */}
      <pointLight position={[-3.2, 2.4, -3]} color="#E53935" intensity={40} distance={12} />
      <directionalLight position={[4, 3, -3]} color="#FFC857" intensity={1.1} />
      {/* warm glow from inside the bucket once it opens */}
      <pointLight ref={glow} position={[0, 1.15, 0.1]} color="#ffb260" intensity={0} distance={3.2} decay={2} />

      <group ref={bucket}>
        <MomoBucket detail={detail} shadows={high} />
        <BucketLid ref={lid} detail={detail} shadows={high} />
        {/* steam escaping from the lid seam before it opens */}
        <SteamParticles ring radius={BUCKET.topRadius} height={1.1} count={tier === 'low' ? 24 : 46} size={55} intensity={leak} position={[0, BUCKET.topY, 0]} />
        {/* steam rising from the open bucket */}
        <SteamParticles radius={0.7} height={2.6} count={tier === 'low' ? 26 : 52} size={80} intensity={steam} position={[0, BUCKET.topY - 0.1, 0]} />
      </group>

      <FloatingMomos anim={anim} count={tier === 'low' ? 5 : RISERS.length} detail={detail} shadows={high} />

      {/* ground: soft blob shadow + real shadows on capable devices */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, BUCKET.baseY - 0.01, 0]}>
        <planeGeometry args={[3.6, 3.6]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>
      {high && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, BUCKET.baseY - 0.005, 0]} receiveShadow>
          <planeGeometry args={[14, 14]} />
          <shadowMaterial opacity={0.4} />
        </mesh>
      )}
      {/* red glow behind the product */}
      <mesh position={[0, 0.9, -3.5]}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial map={glowTex} transparent depthWrite={false} />
      </mesh>

      {!reducedMotion && (
        <Sparkles
          count={tier === 'high' ? 60 : tier === 'mid' ? 32 : 14}
          scale={[7, 4.5, 3]}
          position={[0, 1, -0.5]}
          size={2.2}
          speed={0.25}
          opacity={0.45}
          color="#FFC857"
        />
      )}
    </>
  );
}

/** Builds and runs the GSAP timeline once the first frame has rendered. */
function Director({
  anim,
  reducedMotion,
  replayKey,
  lite,
  onReady,
  onReveal,
}: {
  anim: React.MutableRefObject<HeroAnim>;
  reducedMotion: boolean;
  replayKey: number;
  lite: boolean;
  onReady: () => void;
  onReveal: () => void;
}) {
  const tl = useRef<gsap.core.Timeline | null>(null);
  const invalidate = useThree((s) => s.invalidate);
  const started = useRef(false);
  const callbacks = useRef({ onReady, onReveal });
  callbacks.current = { onReady, onReveal };

  useLayoutEffect(() => {
    tl.current = buildHeroTimeline(anim.current, { onReveal: () => callbacks.current.onReveal(), lite });
    return () => {
      tl.current?.kill();
      tl.current = null;
    };
  }, [anim, lite]);

  // start after the first rendered frame so the reveal never plays behind the loader
  useFrame(() => {
    if (started.current) return;
    started.current = true;
    callbacks.current.onReady();
    if (reducedMotion) {
      setFinal(anim.current);
      callbacks.current.onReveal();
    } else {
      setTimeout(() => tl.current?.play(0), 350);
    }
  });

  useEffect(() => {
    if (replayKey === 0 || !tl.current) return;
    if (reducedMotion) return;
    tl.current.restart();
    invalidate();
  }, [replayKey, reducedMotion, invalidate]);

  return null;
}

export default function MomoScene(props: MomoSceneProps) {
  const { tier, reducedMotion, mouse, shiftRight, active, replayKey, onReady, onReveal } = props;
  const anim = useRef<HeroAnim>(createHeroAnim(RISERS.length));
  const maxDpr = tier === 'high' ? 2 : tier === 'mid' ? 1.5 : 1.25;
  const [dpr, setDpr] = useState(maxDpr);

  return (
    <Canvas
      shadows={tier === 'high'}
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: tier === 'low' ? 40 : 34, near: 0.1, far: 60, position: [0, 2, 12] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.5))} />
      <Environment resolution={tier === 'low' ? 64 : 128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#fff0d8" position={[0, 5, 2]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#E53935" position={[-5, 1, -2]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#FFC857" position={[4, 2, 3]} scale={2} />
      </Environment>
      <Composition anim={anim} tier={tier} reducedMotion={reducedMotion} />
      <CameraRig anim={anim} mouse={mouse && !reducedMotion} shiftRight={shiftRight} />
      <Director
        anim={anim}
        reducedMotion={reducedMotion}
        replayKey={replayKey}
        lite={tier === 'low'}
        onReady={onReady}
        onReveal={onReveal}
      />
    </Canvas>
  );
}
