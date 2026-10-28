import { Suspense, forwardRef, useMemo } from 'react';
import type { GroupProps } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { MomoVariant } from '../data/menu';
import { getMomoGeometry, getMomoMaterial } from './momoGeometry';

/** Optimised scanned/textured model (converted from free_lonely_lowpoly_gyoza.glb). */
export const MOMO_GLB_URL = '/models/momo.glb';

type Props = GroupProps & {
  variant?: MomoVariant;
  seed?: number;
  detail?: 'high' | 'low';
  castShadow?: boolean;
};

/* ------------------------------------------------------------------ */
/* GLB → normalised geometry + per-variant materials (built once).    */
/* The model is rescaled to match the procedural momo footprint:      */
/* ~2.1 units wide, centred on X/Z, resting on y = -0.5.              */
/* ------------------------------------------------------------------ */
const TARGET_WIDTH = 2.1;
const BASE_Y = -0.5;

let normalized: THREE.BufferGeometry | null = null;
let baseMaterial: THREE.MeshStandardMaterial | null = null;
const variantMats = new Map<MomoVariant, THREE.MeshStandardMaterial>();

function prepare(scene: THREE.Object3D) {
  if (normalized && baseMaterial) return;
  let mesh: THREE.Mesh | null = null;
  scene.updateMatrixWorld(true);
  scene.traverse((o) => {
    if (!mesh && (o as THREE.Mesh).isMesh) mesh = o as THREE.Mesh;
  });
  if (!mesh) throw new Error(`No mesh found in ${MOMO_GLB_URL}`);
  const m = mesh as THREE.Mesh;

  const geo = m.geometry.clone();
  geo.applyMatrix4(m.matrixWorld);
  geo.computeBoundingBox();
  const box = geo.boundingBox!;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const s = TARGET_WIDTH / Math.max(size.x, size.z);
  geo.translate(-center.x, -box.min.y, -center.z);
  geo.scale(s, s, s);
  geo.translate(0, BASE_Y, 0);
  geo.computeBoundingSphere();
  normalized = geo;

  baseMaterial = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial;
}

/**
 * The source texture is baked fried-brown, so a plain tint can't make it
 * look steamed. Instead we read the texture's brightness (which carries the
 * pleats, folds and browning) and remap it between a shadow and a highlight
 * colour per variant. `keep` blends a little of the original texture back in.
 */
const VARIANT_LOOK: Record<MomoVariant, { dark: string; light: string; keep: number; roughness: number }> = {
  steamed: { dark: '#c9b293', light: '#fbf6ec', keep: 0.0, roughness: 0.5 },
  fried: { dark: '#8a4a16', light: '#f4c56e', keep: 0.35, roughness: 0.38 },
  tandoori: { dark: '#4a1408', light: '#e5622f', keep: 0.2, roughness: 0.6 },
};

function materialFor(variant: MomoVariant): THREE.MeshStandardMaterial {
  const cached = variantMats.get(variant);
  if (cached) return cached;
  const mat = baseMaterial!.clone();
  const look = VARIANT_LOOK[variant];
  mat.color = new THREE.Color('#ffffff');
  mat.roughness = look.roughness;
  if (mat.map) mat.map.anisotropy = 8;

  const uniforms = {
    uDark: { value: new THREE.Color(look.dark) },
    uLight: { value: new THREE.Color(look.light) },
    uKeep: { value: look.keep },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        'void main() {',
        'uniform vec3 uDark;\nuniform vec3 uLight;\nuniform float uKeep;\nvoid main() {'
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        {
          float lum = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
          float t = smoothstep(0.03, 0.45, lum);
          vec3 dough = mix(uDark, uLight, t);
          diffuseColor.rgb = mix(dough, diffuseColor.rgb, uKeep);
        }`
      );
  };
  mat.customProgramCacheKey = () => 'momo-remap';
  mat.needsUpdate = true;
  variantMats.set(variant, mat);
  return mat;
}

function GLBMomo({ variant, seed, castShadow }: { variant: MomoVariant; seed: number; castShadow: boolean }) {
  const { scene } = useGLTF(MOMO_GLB_URL);
  prepare(scene);
  const material = useMemo(() => materialFor(variant), [variant]);
  // small per-seed variation so a group of momos doesn't look copy-pasted
  const jitter = useMemo(() => {
    const r = Math.sin(seed * 12.9898) * 43758.5453;
    const f = r - Math.floor(r);
    return { rotY: (f - 0.5) * 0.6, scale: 0.94 + f * 0.12 };
  }, [seed]);
  return (
    <mesh
      geometry={normalized!}
      material={material}
      rotation={[0, jitter.rotY, 0]}
      scale={jitter.scale}
      castShadow={castShadow}
      receiveShadow
    />
  );
}

function ProceduralMomo({ variant, seed, detail, castShadow }: Required<Pick<Props, 'variant' | 'seed' | 'detail' | 'castShadow'>>) {
  const geometry = useMemo(() => getMomoGeometry(variant, seed, detail), [variant, seed, detail]);
  const material = useMemo(() => getMomoMaterial(variant), [variant]);
  return <mesh geometry={geometry} material={material} castShadow={castShadow} receiveShadow />;
}

/**
 * One momo. Renders the textured GLB model; while it is loading the
 * procedural sculpted momo is shown in its place.
 */
const MomoModel = forwardRef<THREE.Group, Props>(function MomoModel(
  { variant = 'steamed', seed = 0, detail = 'high', castShadow = false, ...rest },
  ref
) {
  return (
    <group ref={ref} {...rest}>
      <Suspense fallback={<ProceduralMomo variant={variant} seed={seed} detail={detail} castShadow={castShadow} />}>
        <GLBMomo variant={variant} seed={seed} castShadow={castShadow} />
      </Suspense>
    </group>
  );
});

useGLTF.preload(MOMO_GLB_URL);

export default MomoModel;
