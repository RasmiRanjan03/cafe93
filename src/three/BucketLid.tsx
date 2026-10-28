import { forwardRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createLidTexture } from './brandTextures';
import { BUCKET } from './MomoBucket';

/**
 * Hinged lid. The returned group is the hinge pivot, placed on the back edge
 * of the rim — rotate it on X (negative = open) and offset it on Y to lift.
 */
const BucketLid = forwardRef<THREE.Group, { detail?: 'high' | 'low'; shadows?: boolean }>(function BucketLid(
  { detail = 'high', shadows = true },
  ref
) {
  const R = BUCKET.topRadius + 0.06;
  const segments = detail === 'high' ? 96 : 48;

  const dome = useMemo(() => {
    const pts = [
      [0, 0.2], [0.55, 0.196], [0.85, 0.165], [1.02, 0.11], [R - 0.02, 0.05],
      [R, 0.02], [R, -0.12], [R - 0.035, -0.12], [R - 0.04, 0.0], [0, 0.04],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, segments);
  }, [R, segments]);
  const texture = useMemo(() => createLidTexture(), []);
  useEffect(() => () => { dome.dispose(); texture.dispose(); }, [dome, texture]);

  return (
    <group ref={ref} position={[0, BUCKET.topY, -R]}>
      <group position={[0, 0, R]}>
        <mesh geometry={dome} castShadow={shadows} receiveShadow>
          <meshPhysicalMaterial color="#D8322E" roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.25} side={THREE.DoubleSide} />
        </mesh>
        {/* printed top */}
        <mesh position={[0, 0.2015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.56, 64]} />
          <meshPhysicalMaterial map={texture} roughness={0.4} clearcoat={0.5} transparent polygonOffset polygonOffsetFactor={-2} />
        </mesh>
        {/* hinge tab at the back */}
        <mesh position={[0, -0.04, -R + 0.02]}>
          <boxGeometry args={[0.36, 0.1, 0.05]} />
          <meshStandardMaterial color="#B72A26" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
});

export default BucketLid;
