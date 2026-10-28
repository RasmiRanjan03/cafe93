import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createBucketTexture } from './brandTextures';
import MomoModel from './MomoModel';

/** Bucket dimensions shared with the lid and the animation. */
export const BUCKET = {
  bottomRadius: 0.86,
  topRadius: 1.12,
  height: 2.15,
  baseY: -1.3,
  get topY() {
    return this.baseY + this.height;
  },
};

/** Momos that stay nestled in the bucket and peek over the rim. */
const NESTED: { pos: [number, number, number]; rot: [number, number, number]; seed: number }[] = [
  { pos: [-0.38, 0.62, 0.12], rot: [0.15, 0.6, -0.2], seed: 11 },
  { pos: [0.4, 0.6, 0.2], rot: [-0.1, -0.8, 0.18], seed: 12 },
  { pos: [0.02, 0.66, -0.36], rot: [0.08, 2.1, 0.05], seed: 13 },
];

/** Tapered, branded takeaway bucket with paper wall, rolled rim and momo bed. */
export default function MomoBucket({ detail = 'high', shadows = true }: { detail?: 'high' | 'low'; shadows?: boolean }) {
  const gl = useThree((s) => s.gl);
  const { bottomRadius, topRadius, height, baseY } = BUCKET;

  const texture = useMemo(() => createBucketTexture(Math.min(8, gl.capabilities.getMaxAnisotropy())), [gl]);
  useEffect(() => () => texture.dispose(), [texture]);

  const segments = detail === 'high' ? 96 : 48;
  const outer = useMemo(() => {
    // thetaStart = -π puts u = 0.5 (the front logo) on +Z, facing the camera
    const g = new THREE.CylinderGeometry(topRadius, bottomRadius, height, segments, 1, true, -Math.PI, Math.PI * 2);
    return g;
  }, [segments, topRadius, bottomRadius, height]);
  const inner = useMemo(
    () => new THREE.CylinderGeometry(topRadius - 0.03, bottomRadius - 0.03, height - 0.02, segments, 1, true),
    [segments, topRadius, bottomRadius, height]
  );
  useEffect(() => () => { outer.dispose(); inner.dispose(); }, [outer, inner]);

  const midY = baseY + height / 2;
  const topY = baseY + height;

  return (
    <group>
      {/* printed paper wall */}
      <mesh geometry={outer} position={[0, midY, 0]} castShadow={shadows} receiveShadow>
        <meshPhysicalMaterial map={texture} roughness={0.55} clearcoat={0.35} clearcoatRoughness={0.4} sheen={0.2} />
      </mesh>
      {/* inner wall (kraft-coloured lining) */}
      <mesh geometry={inner} position={[0, midY, 0]}>
        <meshStandardMaterial color="#3a1d18" roughness={0.9} side={THREE.BackSide} />
      </mesh>
      {/* rolled rim */}
      <mesh position={[0, topY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow={shadows}>
        <torusGeometry args={[topRadius - 0.005, 0.04, 16, segments]} />
        <meshPhysicalMaterial color="#F6F0E8" roughness={0.4} clearcoat={0.4} />
      </mesh>
      {/* base */}
      <mesh position={[0, baseY + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[bottomRadius, segments]} />
        <meshStandardMaterial color="#E53935" roughness={0.6} />
      </mesh>
      {/* momo bed: a dark surface the nested momos sit on */}
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[topRadius - 0.1, segments]} />
        <meshStandardMaterial color="#2a1410" roughness={1} />
      </mesh>
      {NESTED.map((m) => (
        <MomoModel key={m.seed} variant="steamed" seed={m.seed} detail={detail} position={m.pos} rotation={m.rot} scale={0.36} />
      ))}
    </group>
  );
}
