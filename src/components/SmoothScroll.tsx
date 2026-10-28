import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../hooks/useDevice';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

/** Scroll to an in-page target, through Lenis when it is active. */
export function scrollToTarget(target: string | HTMLElement) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const offset = -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76) + 1;
  if (lenisInstance) lenisInstance.scrollTo(el, { offset, duration: 1.3 });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  // move keyboard focus to the section for screen-reader and keyboard users
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/**
 * Lenis smooth scrolling driven by GSAP's ticker so ScrollTrigger stays in
 * sync. Disabled for reduced motion and on touch devices (native scrolling
 * feels better there). Also routes in-page anchor clicks through Lenis.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    if (!prefersReducedMotion() && !touch) {
      const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
      lenisInstance = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      return () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
        lenisInstance = null;
      };
    }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest('a');
      const href = a?.getAttribute('href');
      if (!a || !href || !href.startsWith('#') || href.length < 2) return;
      const el = document.querySelector<HTMLElement>(href);
      if (!el) return;
      e.preventDefault();
      history.pushState(null, '', href);
      scrollToTarget(el);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
