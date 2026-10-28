import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, View } from '@react-three/drei';
import * as THREE from 'three';
import type { MomoVariant } from '../data/menu';
import MomoModel from './MomoModel';
import SteamParticles from './SteamParticles';
import Ingredients from './Ingredients';
import { scrollStore } from './scrollStore';
import { prefersReducedMotion } from '../hooks/useDevice';

/**
 * 3D visuals for the sections below the hero. Each one is a drei <View>:
 * a DOM box whose contents are drawn by ONE shared canvas (SharedCanvas),
 * so the page only ever holds two WebGL contexts.
 */

function StudioLights({ warm = '#ffe7c4', rim = '#E53935', intensity = 1 }: { warm?: string; rim?: string; intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.35 * intensity} />
      <hemisphereLight args={['#fff4e6', '#3a1a12', 0.6 * intensity]} />
      <directionalLight position={[3, 5, 4]} intensity={2.4 * intensity} color={warm} />
      <directionalLight position={[-4, 2, -3]} intensity={1.6 * intensity} color={rim} />
      <pointLight position={[0, -2, 3]} intensity={6 * intensity} color="#FFC857" distance={8} />
    </>
  );
}

/* ---------------- Product card momo ---------------- */

function CardContent({ variant }: { variant: MomoVariant }) {
  const g = useRef<THREE.Group>(null);
  const reduced = useMemo(prefersReducedMotion, []);
  const cluster = useMemo(
    () =>
      variant === 'fried'
        ? [
            { p: [0, 0, 0.3], r: [0.25, 0.5, 0.1], s: 0.95, seed: 21 },
            { p: [-0.95, -0.25, -0.5], r: [0.2, -0.6, 0.2], s: 0.75, seed: 22 },
            { p: [0.95, -0.2, -0.6], r: [0.15, 2.4, -0.15], s: 0.75, seed: 23 },
          ]
        : [
            { p: [0, 0.05, 0.3], r: [0.15, 0.4, 0], s: 0.95, seed: 31 },
            { p: [-1.0, -0.25, -0.55], r: [0.2, -0.5, 0.15], s: 0.72, seed: 32 },
            { p: [1.0, -0.2, -0.6], r: [0.1, 1.2, -0.12], s: 0.72, seed: 33 },
          ],
    [variant]
  );
  useFrame((state) => {
    if (!g.current || reduced) return;
    const t = state.clock.elapsedTime;
    g.current.rotation.y = Math.sin(t * 0.45) * 0.35;
    g.current.position.y = Math.sin(t * 1.1) * 0.06;
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 6.6]} fov={32} onUpdate={(c) => c.lookAt(0, -0.05, 0)} />
      <StudioLights rim={variant === 'tandoori' ? '#ff5a2a' : '#E53935'} />
      <group ref={g}>
        {cluster.map((m) => (
          <MomoModel
            key={m.seed}
            variant={variant}
            seed={m.seed}
            position={m.p as [number, number, number]}
            rotation={m.r as [number, number, number]}
            scale={m.s}
          />
        ))}
      </group>
      {variant === 'steamed' && <SteamParticles radius={0.8} height={2} count={26} size={80} position={[0, 0.3, 0]} />}
      {variant === 'tandoori' && (
        <SteamParticles radius={0.9} height={1.6} count={16} size={70} position={[0, 0.3, 0]} color="#b9a79a" />
      )}
    </>
  );
}

/* ---------------- Momo that drops from the hero into the next section ---------------- */

function DropContent() {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    const p = scrollStore.drop;
    // invisible until the visitor starts scrolling, then it "falls out" of the hero
    g.current.scale.setScalar(Math.max(Math.min((p - 0.04) * 6, 1), 0.0001));
    g.current.rotation.set(0.25 + (1 - p) * 1.4, state.clock.elapsedTime * 0.4 + (1 - p) * 3, (1 - p) * 0.6);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.6, 4.2]} fov={30} onUpdate={(c) => c.lookAt(0, 0.1, 0)} />
      <StudioLights />
      <group ref={g}>
        <MomoModel variant="steamed" seed={41} />
      </group>
      <DropSteam />
    </>
  );
}

function DropSteam() {
  const intensity = useRef(0);
  useFrame(() => (intensity.current = Math.min(scrollStore.drop * 2, 1)));
  return <SteamParticles radius={0.5} height={1.4} count={18} size={60} position={[0, 0.5, 0]} intensity={intensity} />;
}

/* ---------------- Experience section hero momo ---------------- */

function ExperienceContent() {
  const g = useRef<THREE.Group>(null);
  const reduced = useMemo(prefersReducedMotion, []);
  useFrame((state) => {
    if (!g.current) return;
    const p = scrollStore.experience;
    const t = state.clock.elapsedTime;
    g.current.rotation.y = -0.8 + p * 2.2 + (reduced ? 0 : Math.sin(t * 0.5) * 0.08);
    g.current.rotation.x = 0.25 - p * 0.15;
    g.current.position.y = reduced ? 0 : Math.sin(t * 0.9) * 0.08;
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.9, 8.2]} fov={34} onUpdate={(c) => c.lookAt(0, 0.2, 0)} />
      <StudioLights warm="#ffe2b8" rim="#E53935" intensity={1.1} />
      <group ref={g}>
        <MomoModel variant="steamed" seed={51} scale={1.25} />
      </group>
      <SteamParticles radius={0.9} height={2.6} count={40} size={110} position={[0, 0.6, 0]} />
      <Ingredients motion={!reduced} />
    </>
  );
}

/* ---------------- Signature flavours showcase ---------------- */

const SHOWCASE: Record<MomoVariant, { p: [number, number, number]; r: [number, number, number]; s: number; seed: number }[]> = {
  steamed: [
    { p: [0, 0.05, 0.35], r: [0.12, 0.3, 0], s: 1, seed: 61 },
    { p: [-1.05, -0.12, -0.4], r: [0.18, -0.7, 0.1], s: 0.82, seed: 62 },
    { p: [1.05, -0.1, -0.45], r: [0.1, 1.4, -0.1], s: 0.82, seed: 63 },
  ],
  fried: [
    { p: [0, 0, 0.35], r: [0.22, 0.4, 0.05], s: 1, seed: 64 },
    { p: [-1.1, -0.1, -0.4], r: [0.2, -0.5, 0.15], s: 0.82, seed: 65 },
    { p: [1.1, -0.1, -0.45], r: [0.15, 2.6, -0.1], s: 0.82, seed: 66 },
  ],
  tandoori: [
    { p: [0, 0.05, 0.35], r: [0.14, -0.3, 0], s: 1, seed: 67 },
    { p: [-1.05, -0.12, -0.4], r: [0.2, 0.9, 0.1], s: 0.82, seed: 68 },
    { p: [1.05, -0.1, -0.45], r: [0.1, -1.2, -0.12], s: 0.82, seed: 69 },
  ],
};

function ShowcaseContent({ variant, accent }: { variant: MomoVariant; accent: string }) {
  const g = useRef<THREE.Group>(null);
  const plate = useRef<THREE.MeshStandardMaterial>(null);
  const reduced = useMemo(prefersReducedMotion, []);
  // transition state: shrink + spin out the old cluster, then grow the new one in
  const state = useRef({ shown: variant, scale: 1, phase: 'idle' as 'idle' | 'out' | 'in' });
  const target = useRef(variant);
  target.current = variant;
  const accentColor = useMemo(() => new THREE.Color(accent), [accent]);

  useFrame((s, delta) => {
    const st = state.current;
    if (target.current !== st.shown && st.phase === 'idle') st.phase = reduced ? 'in' : 'out';
    if (st.phase === 'out') {
      st.scale = Math.max(0, st.scale - delta * 4);
      if (st.scale === 0) {
        st.shown = target.current;
        st.phase = 'in';
      }
    } else if (st.phase === 'in') {
      st.scale = Math.min(1, st.scale + delta * (reduced ? 100 : 3));
      if (st.scale === 1) st.phase = 'idle';
    }
    if (g.current) {
      const ease = 1 - Math.pow(1 - st.scale, 3);
      g.current.scale.setScalar(Math.max(ease, 0.0001));
      g.current.rotation.y = (reduced ? 0 : s.clock.elapsedTime * 0.25) + (1 - ease) * 1.6;
      g.current.position.y = reduced ? 0 : Math.sin(s.clock.elapsedTime * 1.1) * 0.05;
      // swap visible cluster
      g.current.children.forEach((c) => (c.visible = c.name === st.shown));
    }
    if (plate.current) plate.current.emissive.lerp(accentColor, 0.08);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2.6, 7.4]} fov={32} onUpdate={(c) => c.lookAt(0, -0.25, 0)} />
      <StudioLights rim={accent} intensity={1.05} />
      <group ref={g}>
        {(Object.keys(SHOWCASE) as MomoVariant[]).map((v) => (
          <group key={v} name={v} visible={v === state.current.shown}>
            {SHOWCASE[v].map((m) => (
              <MomoModel key={m.seed} variant={v} seed={m.seed} position={m.p} rotation={m.r} scale={m.s} />
            ))}
          </group>
        ))}
      </group>
      {/* slate serving plate with a faint accent underglow */}
      <mesh position={[0, -0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.1, 64]} />
        <meshStandardMaterial ref={plate} color="#1d1b1a" roughness={0.75} emissive={accent} emissiveIntensity={0.025} />
      </mesh>
      <mesh position={[0, -0.64, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.1, 2.2, 64]} />
        <meshStandardMaterial color="#2c2927" roughness={0.6} />
      </mesh>
      {variant !== 'fried' && <SteamParticles radius={0.9} height={2} count={28} size={90} position={[0, 0.2, 0]} />}
    </>
  );
}

/* ---------------- Exports: DOM-side wrappers ---------------- */

type BoxProps = { className?: string };

export function CardView({ variant, className }: BoxProps & { variant: MomoVariant }) {
  return (
    <View className={className}>
      <CardContent variant={variant} />
    </View>
  );
}

export function DropView({ className }: BoxProps) {
  return (
    <View className={className}>
      <DropContent />
    </View>
  );
}

export function ExperienceView({ className }: BoxProps) {
  return (
    <View className={className}>
      <ExperienceContent />
    </View>
  );
}

export function ShowcaseView({ className, variant, accent }: BoxProps & { variant: MomoVariant; accent: string }) {
  return (
    <View className={className}>
      <ShowcaseContent variant={variant} accent={accent} />
    </View>
  );
}
