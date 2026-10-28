import gsap from 'gsap';

/**
 * Plain mutable values that GSAP tweens and the R3F components read every
 * frame. Keeping the animation in one object makes the timeline easy to
 * replay, skip (reduced motion) and reason about.
 */
export interface HeroAnim {
  /** camera distance multiplier relative to the fitted distance */
  dolly: number;
  camY: number;
  lookY: number;
  /** key light X position — sweeps across the bucket */
  lightX: number;
  /** steam escaping from the lid seam */
  leak: number;
  /** steam rising from inside the open bucket */
  steam: number;
  /** warm glow from inside the bucket */
  glow: number;
  lidLift: number;
  lidAngle: number;
  bucketRot: number;
  /** 0 → 1 strength of the idle floating motion */
  idle: number;
  /** per-momo rise progress, 0 (inside) → 1 (settled) */
  momo: number[];
}

export const createHeroAnim = (count: number): HeroAnim => ({
  dolly: 1.45,
  camY: 1.1,
  lookY: 0.35,
  lightX: -5,
  leak: 0,
  steam: 0,
  glow: 0,
  lidLift: 0,
  lidAngle: 0,
  bucketRot: -0.6,
  idle: 0,
  momo: Array.from({ length: count }, () => 0),
});

const FINAL: Omit<HeroAnim, 'momo'> = {
  dolly: 1,
  camY: 0.55,
  lookY: 0.85,
  lightX: 2.4,
  leak: 0,
  steam: 1,
  glow: 1,
  lidLift: 0.1,
  lidAngle: -1.88,
  bucketRot: 0,
  idle: 1,
};

/** Jump straight to the settled composition (reduced motion / no replay). */
export function setFinal(a: HeroAnim) {
  Object.assign(a, FINAL);
  a.momo.fill(1);
}

/**
 * The five-scene reveal. `onReveal` fires when the composition settles so the
 * headline can animate in alongside it.
 */
export function buildHeroTimeline(a: HeroAnim, opts: { onReveal: () => void; lite?: boolean }) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  const fast = opts.lite ? 0.85 : 1;

  // Scene 1 — anticipation: dolly in, light sweeps, steam escapes the seam
  tl.addLabel('anticipation', 0)
    .to(a, { dolly: 1.14, camY: 0.95, duration: 2.3 * fast }, 0)
    .to(a, { lightX: 2.4, duration: 2.6 * fast, ease: 'sine.inOut' }, 0)
    .to(a, { bucketRot: -0.32, duration: 2.3 * fast }, 0)
    .to(a, { leak: 0.75, duration: 1.2, ease: 'power1.out' }, 0.4);

  // Scene 2 — the lid cracks, pauses, then swings open on its hinge
  const lid = 2.0 * fast;
  tl.addLabel('lid', lid)
    .to(a, { lidLift: 0.07, lidAngle: -0.13, duration: 0.45, ease: 'power2.out' }, lid)
    .to(a, { leak: 1, duration: 0.3 }, lid)
    // (the pause happens here: nothing moves for ~0.35s)
    .to(a, { lidAngle: FINAL.lidAngle, lidLift: FINAL.lidLift, duration: 1.05, ease: 'power3.inOut' }, lid + 0.8)
    .to(a, { leak: 0, duration: 0.8 }, lid + 0.9)
    .to(a, { steam: 1, duration: 1.3, ease: 'power1.out' }, lid + 0.9)
    .to(a, { glow: 1, duration: 0.9 }, lid + 1.0)
    .to(a, { dolly: 1.06, camY: 0.75, lookY: 0.6, duration: 1.5 }, lid + 0.9);

  // Scene 3 — momos rise on their own curved paths
  const rise = lid + 1.45;
  tl.addLabel('rise', rise);
  a.momo.forEach((_, i) => {
    tl.to(a.momo, { [i]: 1, duration: 1.55, ease: 'power3.out' }, rise + i * 0.11);
  });

  // Scene 4 — composition: bucket turns its logo to the viewer, camera settles
  const compose = rise + 0.9;
  tl.addLabel('compose', compose)
    .to(a, { bucketRot: FINAL.bucketRot, duration: 1.5 }, compose)
    .to(a, { dolly: FINAL.dolly, camY: FINAL.camY, lookY: FINAL.lookY, duration: 1.8 }, compose)
    .call(opts.onReveal, [], compose + 0.1)
    // Scene 5 — hand over to the gentle idle loop
    .to(a, { idle: 1, duration: 1.6, ease: 'power1.inOut' }, compose + 0.7);

  return tl;
}
