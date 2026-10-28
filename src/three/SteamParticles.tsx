import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uRadius;
  uniform float uHeight;
  uniform float uSize;
  uniform float uRing;
  uniform float uPixelRatio;
  varying float vAlpha;

  void main() {
    float speed = 0.16 * (0.7 + fract(aSeed * 3.7) * 0.6);
    float life = fract(uTime * speed + aSeed * 7.13);
    float ang = aSeed * 6.2831 * 13.0;
    float r = mix(uRadius * sqrt(fract(aSeed * 91.7)), uRadius, uRing);
    vec3 p = vec3(cos(ang) * r, 0.0, sin(ang) * r);
    p.xz *= 1.0 + life * mix(0.15, 0.35, uRing);
    p.y += life * uHeight;
    // lazy curl as it rises
    p.x += sin(life * 5.0 + aSeed * 20.0) * 0.16 * life;
    p.z += cos(life * 4.0 + aSeed * 13.0) * 0.12 * life;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.45 + life * 1.7) * uPixelRatio * (10.0 / -mv.z);
    vAlpha = smoothstep(0.0, 0.18, life) * (1.0 - smoothstep(0.45, 1.0, life)) * uIntensity;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(uColor, a * vAlpha * 0.2);
  }
`;

type Props = {
  count?: number;
  radius?: number;
  height?: number;
  size?: number;
  /** emit from the circle's edge (lid seam) instead of its whole area */
  ring?: boolean;
  /** 0..1, read every frame — pass a ref-backed object so GSAP can drive it */
  intensity?: { current: number };
  position?: [number, number, number];
  color?: string;
};

/** Soft GPU steam: a single draw call, motion computed in the vertex shader. */
export default function SteamParticles({
  count = 60,
  radius = 0.6,
  height = 2.2,
  size = 90,
  ring = false,
  intensity,
  position = [0, 0, 0],
  color = '#ffffff',
}: Props) {
  const dpr = useThree((s) => s.viewport.dpr);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) seeds[i] = Math.random();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, height / 2, 0), height + radius);
    return g;
  }, [count, height, radius]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uRadius: { value: radius },
      uHeight: { value: height },
      uSize: { value: size },
      uRing: { value: ring ? 1 : 0 },
      uPixelRatio: { value: dpr },
      uColor: { value: new THREE.Color(color) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    u.uTime.value += delta;
    u.uIntensity.value = intensity ? intensity.current : 1;
    u.uPixelRatio.value = dpr;
  });

  return (
    <points geometry={geometry} position={position} renderOrder={10}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
