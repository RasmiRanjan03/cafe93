import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Curved red chili with a green stem. */
function Chili(props: JSX.IntrinsicElements['group']) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.25, -0.35, 0),
      new THREE.Vector3(0.3, -0.85, 0.05),
      new THREE.Vector3(0.12, -1.25, 0.1),
    ]);
    const g = new THREE.TubeGeometry(curve, 48, 1, 16, false);
    // taper the tube towards the tip
    const pos = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    const centre = new THREE.Vector3();
    const segs = 49;
    const ring = 17;
    for (let i = 0; i < pos.count; i++) {
      const seg = Math.floor(i / ring);
      const t = seg / (segs - 1);
      curve.getPointAt(Math.min(t, 1), centre);
      v.fromBufferAttribute(pos, i).sub(centre);
      const r = 0.13 * (1 - Math.pow(t, 1.8) * 0.92);
      v.setLength(r).add(centre);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group {...props}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#D7261E" roughness={0.25} clearcoat={0.8} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[-0.02, 0.06, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.035, 0.05, 0.22, 10]} />
        <meshStandardMaterial color="#3E7B2B" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Coriander-style leaf: flattened, slightly cupped ellipse. */
function Leaf(props: JSX.IntrinsicElements['mesh']) {
  return (
    <mesh {...props} scale={[0.32, 0.03, 0.22]}>
      <sphereGeometry args={[1, 20, 12]} />
      <meshStandardMaterial color="#4C9A3A" roughness={0.55} />
    </mesh>
  );
}

function Garlic(props: JSX.IntrinsicElements['mesh']) {
  return (
    <mesh {...props} scale={[0.16, 0.24, 0.14]}>
      <sphereGeometry args={[1, 20, 16]} />
      <meshPhysicalMaterial color="#F4ECDD" roughness={0.45} sheen={0.6} sheenColor="#ffffff" />
    </mesh>
  );
}

function OnionRing(props: JSX.IntrinsicElements['mesh']) {
  return (
    <mesh {...props}>
      <torusGeometry args={[0.16, 0.035, 10, 28]} />
      <meshStandardMaterial color="#7DBB55" roughness={0.5} />
    </mesh>
  );
}

const ITEMS = [
  { kind: 'chili', pos: [-2.1, 1.0, -0.4], rot: [0.2, 0.3, 0.6] },
  { kind: 'leaf', pos: [2.0, 1.25, 0.2], rot: [0.6, 0.2, 0.3] },
  { kind: 'garlic', pos: [1.85, -0.9, 0.5], rot: [0.3, 0.5, 0.2] },
  { kind: 'ring', pos: [-1.7, -1.05, 0.6], rot: [1.1, 0.3, 0.2] },
  { kind: 'leaf', pos: [-0.9, 1.75, -0.8], rot: [-0.4, 0.8, 0.1] },
  { kind: 'chili', pos: [2.3, 0.1, -0.9], rot: [0.1, -0.4, -0.9] },
  { kind: 'ring', pos: [0.9, 1.8, -0.6], rot: [0.4, 0.9, 0.5] },
  { kind: 'garlic', pos: [-2.35, -0.1, 0.3], rot: [0.9, 0.2, 0.4] },
] as const;

/** Flavour elements floating around the Experience momo. */
export default function Ingredients({ motion = true }: { motion?: boolean }) {
  const refs = useRef<(THREE.Object3D | null)[]>([]);
  useFrame((state) => {
    if (!motion) return;
    const t = state.clock.elapsedTime;
    refs.current.forEach((o, i) => {
      if (!o) return;
      o.position.y = ITEMS[i].pos[1] + Math.sin(t * 0.8 + i * 1.7) * 0.12;
      o.rotation.y = ITEMS[i].rot[1] + t * 0.25 * (i % 2 ? 1 : -1);
    });
  });
  return (
    <group>
      {ITEMS.map((it, i) => (
        <group
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={it.pos as unknown as [number, number, number]}
          rotation={it.rot as unknown as [number, number, number]}
        >
          {it.kind === 'chili' && <Chili scale={0.8} />}
          {it.kind === 'leaf' && <Leaf />}
          {it.kind === 'garlic' && <Garlic />}
          {it.kind === 'ring' && <OnionRing />}
        </group>
      ))}
    </group>
  );
}
