import * as THREE from 'three';
import type { MomoVariant } from '../data/menu';

/* ------------------------------------------------------------------ */
/* Small deterministic value noise — used for handmade irregularity,   */
/* dough texture and browning / char patterns.                         */
/* ------------------------------------------------------------------ */
function hash(x: number, y: number, z: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
  return h - Math.floor(h);
}
const fade = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function noise3(x: number, y: number, z: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), xf), lerp(c(0, 1, 0), c(1, 1, 0), xf), yf),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), xf), lerp(c(0, 1, 1), c(1, 1, 1), xf), yf),
    zf
  );
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

export type MomoShape = 'purse' | 'crescent';

export const shapeForVariant = (v: MomoVariant): MomoShape => (v === 'fried' ? 'crescent' : 'purse');

/* ------------------------------------------------------------------ */
/* Shapes. Both start from a unit sphere and are sculpted vertex by    */
/* vertex. Result is roughly 2 units wide, ~1.4 tall, base at y≈-0.5. */
/* ------------------------------------------------------------------ */

/** Classic round momo: belly, flat base, spiral pleats gathered to a twisted peak. */
function sculptPurse(p: THREE.Vector3, seed: number, out: THREE.Vector3): { ridge: number; base: number } {
  const theta = Math.atan2(p.z, p.x);
  let h: number;
  let radial = 1;
  let ridge = 0;

  if (p.y < 0) {
    // full belly that flattens into a base where it sat in the steamer
    const d = -p.y;
    h = (-0.52 * (1 - Math.exp(-3.2 * d))) / (1 - Math.exp(-3.2));
    radial *= 1.06 + 0.05 * (1 - d);
  } else {
    const t = p.y;
    radial *= 1 - 0.86 * Math.pow(t, 1.45);
    h = t * 0.82 + 0.38 * Math.pow(t, 3.5);
    // spiral pleats — they twist as they climb to the knot
    const pleatCount = 12;
    const pleat = Math.sin(theta * pleatCount + t * 3.1 + seed * 3.0);
    const pleatMask = smoothstep(0.08, 0.7, t) * (1 - 0.45 * smoothstep(0.85, 1, t));
    radial *= 1 + 0.13 * pleat * pleatMask;
    h += 0.045 * pleat * smoothstep(0.25, 0.9, t);
    ridge = Math.max(pleat, 0) * pleatMask;
    // slight sideways lean of the knot, like a real hand-twisted top
    out.x += 0.08 * Math.pow(t, 3) * Math.cos(seed * 5);
    out.z += 0.08 * Math.pow(t, 3) * Math.sin(seed * 5);
  }

  // handmade irregularity (low frequency) + fine dough texture (high frequency)
  const n = noise3(p.x * 1.6 + seed * 10, p.y * 1.6, p.z * 1.6) - 0.5;
  const f = noise3(p.x * 16 + seed, p.y * 16, p.z * 16) - 0.5;
  radial *= 1 + n * 0.14 + f * 0.012;
  h *= 1 + n * 0.08;

  out.x += p.x * radial * 1.04;
  out.y = h;
  out.z += p.z * radial;
  return { ridge, base: smoothstep(-0.2, -0.9, p.y) };
}

/** Half-moon momo with a pleated ridge along the top seam. */
function sculptCrescent(p: THREE.Vector3, seed: number, out: THREE.Vector3): { ridge: number; base: number } {
  let x = p.x, y = p.y, z = p.z;
  let ridge = 0;
  if (y < 0) {
    const d = -y;
    y = (-0.45 * (1 - Math.exp(-3 * d))) / (1 - Math.exp(-3));
  } else {
    const t = y;
    z *= 1 - 0.88 * Math.pow(t, 1.15);
    y = t * 0.72;
    const pleat = Math.sin(x * 15 + seed * 4);
    const mask = smoothstep(0.35, 1, t);
    y += 0.075 * pleat * mask;
    z += 0.035 * Math.cos(x * 15 + seed * 4) * mask;
    ridge = Math.max(pleat, 0) * mask;
  }
  // ends taper and curl back into a crescent
  const end = 1 - 0.42 * Math.pow(Math.abs(p.x), 2.6);
  y *= end;
  z *= end;
  x *= 1.5;
  z -= 0.32 * (x * x) * 0.5;

  const n = noise3(p.x * 1.6 + seed * 10, p.y * 1.6, p.z * 1.6) - 0.5;
  const f = noise3(p.x * 16 + seed, p.y * 16, p.z * 16) - 0.5;
  const s = 1 + n * 0.12 + f * 0.012;

  out.set(x * s, y * (1 + n * 0.06), z * s + 0.18);
  return { ridge, base: smoothstep(-0.2, -0.9, p.y) };
}

/* ------------------------------------------------------------------ */
/* Per-variant vertex colouring: steamed dough, golden fry, tandoori.  */
/* ------------------------------------------------------------------ */
const C = (hex: string) => new THREE.Color(hex);
const palette = {
  steamed: { base: C('#F7F1E7'), ridge: C('#FFFBF4'), low: C('#E7DAC6'), spot: C('#EFE3D1') },
  fried: { base: C('#E3A443'), ridge: C('#F6C46A'), low: C('#9A5418'), spot: C('#B86A22') },
  tandoori: { base: C('#D24A22'), ridge: C('#E8743A'), low: C('#7A2410'), spot: C('#3E120A') },
};

function colorFor(variant: MomoVariant, p: THREE.Vector3, ridge: number, base: number, seed: number, out: THREE.Color) {
  const pal = palette[variant];
  out.copy(pal.base);
  out.lerp(pal.ridge, ridge * 0.6);
  out.lerp(pal.low, base * (variant === 'steamed' ? 0.55 : 0.75));
  const spotNoise = noise3(p.x * 5 + seed * 3, p.y * 5, p.z * 5);
  if (variant === 'fried') {
    out.lerp(pal.spot, smoothstep(0.55, 0.85, spotNoise) * 0.7);
  } else if (variant === 'tandoori') {
    // charred spots, concentrated on ridges and the top
    const char = smoothstep(0.62, 0.9, spotNoise) * (0.5 + ridge * 0.8 + Math.max(p.y, 0) * 0.4);
    out.lerp(pal.spot, Math.min(char, 0.85));
    // fine spice speckle
    const speck = noise3(p.x * 40 + seed, p.y * 40, p.z * 40);
    if (speck > 0.82) out.lerp(pal.low, 0.5);
  } else {
    out.lerp(pal.spot, smoothstep(0.6, 0.9, spotNoise) * 0.35);
  }
}

/* ------------------------------------------------------------------ */
/* Geometry cache: geometries are shared by every momo with the same   */
/* variant / seed / detail, so the scene stays light.                  */
/* ------------------------------------------------------------------ */
const geoCache = new Map<string, THREE.BufferGeometry>();

export function getMomoGeometry(variant: MomoVariant, seed = 0, detail: 'high' | 'low' = 'high'): THREE.BufferGeometry {
  const key = `${variant}-${seed}-${detail}`;
  const cached = geoCache.get(key);
  if (cached) return cached;

  const shape = shapeForVariant(variant);
  const [ws, hs] = detail === 'high' ? [96, 72] : [48, 36];
  const geo = new THREE.SphereGeometry(1, ws, hs);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const p = new THREE.Vector3();
  const o = new THREE.Vector3();
  const col = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    o.set(0, 0, 0);
    const { ridge, base } = shape === 'purse' ? sculptPurse(p, seed, o) : sculptCrescent(p, seed, o);
    pos.setXYZ(i, o.x, o.y, o.z);
    colorFor(variant, p, ridge, base, seed, col);
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  geoCache.set(key, geo);
  return geo;
}

/* ------------------------------------------------------------------ */
/* Materials (shared).                                                 */
/* ------------------------------------------------------------------ */
const matCache = new Map<MomoVariant, THREE.MeshPhysicalMaterial>();

export function getMomoMaterial(variant: MomoVariant): THREE.MeshPhysicalMaterial {
  const cached = matCache.get(variant);
  if (cached) return cached;
  let m: THREE.MeshPhysicalMaterial;
  if (variant === 'steamed') {
    // soft, slightly moist dough with a velvety sheen
    m = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.58,
      sheen: 0.8,
      sheenRoughness: 0.45,
      sheenColor: new THREE.Color('#fff4e2'),
      clearcoat: 0.25,
      clearcoatRoughness: 0.55,
    });
  } else if (variant === 'fried') {
    // crisp golden surface with an oily glint
    m = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.42,
      clearcoat: 0.55,
      clearcoatRoughness: 0.3,
      sheen: 0.3,
      sheenColor: new THREE.Color('#ffd28a'),
    });
  } else {
    // dry, smoky marinade with a little glaze
    m = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.62,
      clearcoat: 0.3,
      clearcoatRoughness: 0.5,
      sheen: 0.25,
      sheenColor: new THREE.Color('#ff8a5c'),
    });
  }
  matCache.set(variant, m);
  return m;
}
