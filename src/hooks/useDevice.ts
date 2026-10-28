import { useEffect, useState } from 'react';

function query(q: string): boolean {
  return typeof window !== 'undefined' && window.matchMedia(q).matches;
}

function useMedia(q: string): boolean {
  const [match, setMatch] = useState(() => query(q));
  useEffect(() => {
    const mql = window.matchMedia(q);
    const on = () => setMatch(mql.matches);
    on();
    mql.addEventListener('change', on);
    return () => mql.removeEventListener('change', on);
  }, [q]);
  return match;
}

export function useReducedMotion(): boolean {
  return useMedia('(prefers-reduced-motion: reduce)');
}

export function useIsMobile(): boolean {
  return useMedia('(max-width: 767px)');
}

/** True for devices with a precise pointer that can hover (mouse / trackpad). */
export function useFinePointer(): boolean {
  return useMedia('(hover: hover) and (pointer: fine)');
}

export type QualityTier = 'low' | 'mid' | 'high';

/** Rough device class used to scale particles, shadows and resolution. */
export function getQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'mid';
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (w < 768 || cores <= 4 || memory <= 2) return 'low';
  if (w < 1200 || query('(pointer: coarse)')) return 'mid';
  return 'high';
}

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  return query('(prefers-reduced-motion: reduce)');
}
