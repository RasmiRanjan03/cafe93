/**
 * Scroll progress values written by GSAP ScrollTrigger in the DOM sections
 * and read every frame by the 3D views. Plain objects: no re-renders.
 */
export const scrollStore = {
  /** 0 → 1 while the Experience section crosses the viewport */
  experience: 0,
  /** 0 → 1 as the dropping momo falls into the Momo Collection section */
  drop: 0,
  /** pointer position in normalised device coords, for subtle parallax */
  pointerX: 0,
  pointerY: 0,
};
