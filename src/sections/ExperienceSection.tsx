import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../components/SectionHeading';
import Lazy3D from '../components/Lazy3D';
import { experienceHighlights } from '../data/content';
import { prefersReducedMotion } from '../hooks/useDevice';
import { scrollStore } from '../three/scrollStore';

gsap.registerPlugin(ScrollTrigger);

export default function ExperienceSection() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!root.current) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => (scrollStore.experience = self.progress),
      });
      if (reduced) return;
      // oversized background word drifts against the scroll
      gsap.fromTo('[data-drift]', { xPercent: 8 }, {
        xPercent: -18,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      // the momo stage reveals through a widening mask
      gsap.fromTo('[data-mask]', { clipPath: 'inset(18% 18% 18% 18% round 40px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 28px)',
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-mask]', start: 'top 90%', end: 'top 35%', scrub: true },
      });
      gsap.from('[data-highlight]', {
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-highlights]', start: 'top 85%', once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="experience"
      ref={root}
      data-nav="dark"
      aria-labelledby="experience-title"
      className="relative overflow-hidden bg-charcoal py-24 text-cream sm:py-32"
    >
      <p
        data-drift
        aria-hidden
        className="display pointer-events-none absolute left-0 top-[34%] whitespace-nowrap text-[clamp(8rem,26vw,24rem)] text-cream/[0.035]"
      >
        Whole mood · Whole mood
      </p>

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading
            id="experience-title"
            eyebrow="Not just a snack"
            eyebrowClassName="text-gold"
            lines={["It's a whole", <span className="text-chili">mood.</span>]}
            titleClassName="text-[clamp(3rem,8.4vw,7.6rem)]"
          />
          <ol data-highlights className="mt-12 divide-y divide-cream/10 border-y border-cream/10">
            {experienceHighlights.map((h) => (
              <li data-highlight key={h.n} className="grid grid-cols-[3.5rem_1fr] gap-4 py-6 sm:grid-cols-[5rem_1fr]">
                <span className="font-display text-2xl font-bold text-chili sm:text-3xl">{h.n}</span>
                <div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight sm:text-2xl">{h.title}</h3>
                  <p className="mt-1.5 text-cream/65">{h.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div
          data-mask
          className="relative aspect-square w-full overflow-hidden rounded-[28px]"
          style={{ background: 'radial-gradient(70% 70% at 50% 45%, #3a1512 0%, #1c1312 55%, #121212 100%)' }}
        >
          <div aria-hidden className="absolute inset-x-[22%] bottom-[16%] h-10 rounded-[50%] bg-black/60 blur-2xl" />
          <Lazy3D kind="experience" className="absolute inset-0" />
          <span className="eyebrow absolute bottom-5 left-6 text-cream/45">Fresh from the steamer</span>
        </div>
      </div>
    </section>
  );
}
