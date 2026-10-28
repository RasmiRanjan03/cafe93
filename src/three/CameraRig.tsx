import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { HeroAnim } from './heroAnimation';

/** Half-size of the hero composition in world units (with breathing room). */
const HALF_HEIGHT = 2.95;
const HALF_WIDTH = 2.55;
const CENTER_Y = 0.85;

/**
 * Fits the composition to the canvas, applies the GSAP-driven dolly,
 * shifts the frame right on wide screens (text sits on the left) and adds
 * a restrained mouse parallax on desktop.
 */
export default function CameraRig({
  anim,
  mouse,
  shiftRight,
}: {
  anim: React.MutableRefObject<HeroAnim>;
  mouse: boolean;
  shiftRight: boolean;
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const look = new THREE.Vector3();

  useEffect(() => {
    if (shiftRight) {
      // move the projection centre so the bucket sits in the right half
      camera.setViewOffset(size.width, size.height, -size.width * 0.2, 0, size.width, size.height);
    } else {
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, shiftRight]);

  useFrame((state) => {
    const a = anim.current;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const usableAspect = shiftRight ? camera.aspect * 0.58 : camera.aspect;
    const fit = Math.max(HALF_HEIGHT / tan, HALF_WIDTH / (tan * usableAspect));
    const dist = fit * a.dolly;
    const px = mouse ? state.pointer.x * 0.45 : 0;
    const py = mouse ? state.pointer.y * 0.25 : 0;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, px, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, CENTER_Y + a.camY + py, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, dist, 0.08);
    look.set(0, a.lookY, 0);
    camera.lookAt(look);
  });

  return null;
}
