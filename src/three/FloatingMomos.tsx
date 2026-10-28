import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MomoVariant } from '../data/menu';
import MomoModel from './MomoModel';
import type { HeroAnim } from './heroAnimation';

type V3 = [number, number, number];
interface Riser {
  variant: MomoVariant;
  seed: number;
  end: V3;
  rot: V3;
  scale: number;
}

/** Final floating arrangement — steamed momos lead, fried and tandoori frame it. */
export const RISERS: Riser[] = [
  { variant: 'steamed', seed: 1, end: [0.05, 2.35, 0.3], rot: [0.16, 0.45, -0.06], scale: 0.46 },
  { variant: 'steamed', seed: 2, end: [-1.2, 1.9, 0.45], rot: [0.32, 1.2, 0.26], scale: 0.38 },
  { variant: 'steamed', seed: 3, end: [1.22, 2.0, 0.3], rot: [0.22, -0.9, -0.3], scale: 0.38 },
  { variant: 'fried', seed: 4, end: [-1.72, 0.7, 0.85], rot: [0.3, 0.75, 0.3], scale: 0.36 },
  { variant: 'tandoori', seed: 5, end: [1.72, 0.55, 0.9], rot: [0.22, -0.6, -0.25], scale: 0.37 },
  { variant: 'steamed', seed: 6, end: [-0.62, 1.38, 1.2], rot: [0.5, 0.3, 0.2], scale: 0.3 },
  { variant: 'steamed', seed: 7, end: [0.68, 1.42, 1.25], rot: [0.45, -0.4, -0.2], scale: 0.3 },
];

const bezier = (a: number, b: number, c: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;

export default function FloatingMomos({
  anim,
  count = RISERS.length,
  detail = 'high',
  shadows = true,
}: {
  anim: React.MutableRefObject<HeroAnim>;
  count?: number;
  detail?: 'high' | 'low';
  shadows?: boolean;
}) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const risers = RISERS.slice(0, count);

  // start inside the bucket, arc upward through a raised control point
  const paths = useMemo(
    () =>
      risers.map((r, i) => {
        const start: V3 = [r.end[0] * 0.18, 0.4, r.end[2] * 0.15 - 0.05];
        const ctrl: V3 = [r.end[0] * 0.45 + (i % 2 ? 0.25 : -0.25), r.end[1] + 1.05, r.end[2] * 0.5];
        const spin: V3 = [(i % 3) - 1 + 0.6, (i % 2 ? -1 : 1) * (2.6 + i * 0.3), ((i + 1) % 3) - 1];
        return { start, ctrl, spin };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count]
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const a = anim.current;
    risers.forEach((r, i) => {
      const g = refs.current[i];
      if (!g) return;
      const t = a.momo[i] ?? 0;
      g.visible = t > 0.001;
      if (!g.visible) return;
      const { start, ctrl, spin } = paths[i];
      const bob = Math.sin(time * 0.9 + i * 1.3) * 0.07 * a.idle;
      g.position.set(
        bezier(start[0], ctrl[0], r.end[0], t),
        bezier(start[1], ctrl[1], r.end[1], t) + bob,
        bezier(start[2], ctrl[2], r.end[2], t)
      );
      const rem = 1 - t;
      g.rotation.set(
        r.rot[0] + spin[0] * rem + Math.sin(time * 0.6 + i) * 0.05 * a.idle,
        r.rot[1] + spin[1] * rem + Math.sin(time * 0.4 + i * 2) * 0.12 * a.idle,
        r.rot[2] + spin[2] * rem
      );
      g.scale.setScalar(r.scale * (0.72 + 0.28 * Math.min(t * 1.6, 1)));
    });
  });

  return (
    <group>
      {risers.map((r, i) => (
        <MomoModel
          key={r.seed}
          ref={(el) => (refs.current[i] = el)}
          variant={r.variant}
          seed={r.seed}
          detail={detail}
          castShadow={shadows}
          visible={false}
        />
      ))}
    </group>
  );
}
