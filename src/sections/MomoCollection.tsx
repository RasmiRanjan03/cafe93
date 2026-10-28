import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../components/SectionHeading';
import ProductCard from '../components/ProductCard';
import Lazy3D from '../components/Lazy3D';
import { availableProducts } from '../data/menu';
import { prefersReducedMotion } from '../hooks/useDevice';
import { scrollStore } from '../three/scrollStore';

gsap.registerPlugin(ScrollTrigger);

export default function MomoCollection() {
  const root = useRef<HTMLElement>(null);
  const drop = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!root.current) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      // charcoal → cream as the section rises into view, continuing the hero
      gsap.fromTo(
        root.current,
        { backgroundColor: '#151515', color: '#FFF5E8' },
        {
          backgroundColor: '#FFF5E8',
          color: '#151515',
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 35%', scrub: true },
        }
      );
      if (reduced) return;
      // a momo falls out of the hero and lands beside the heading
      gsap.fromTo(
        drop.current,
        { yPercent: -160, xPercent: -30 },
        {
          yPercent: 0,
          xPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'top 15%',
            scrub: 0.6,
            onUpdate: (self) => (scrollStore.drop = self.progress),
          },
        }
      );
      gsap.from('[data-card]', {
        y: 80,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.14,
        scrollTrigger: { trigger: '[data-cards]', start: 'top 85%', once: true },
      });
    }, root);
    if (reduced) scrollStore.drop = 1;
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="momos"
      ref={root}
      data-nav="light"
      aria-labelledby="momos-title"
      className="relative overflow-hidden bg-cream py-24 text-charcoal sm:py-32"
    >
      <div className="container-x relative">
        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
          <SectionHeading
            id="momos-title"
            eyebrow="The main characters"
            lines={['Small bites.', <><span className="text-chili">Big</span> personality.</>]}
          >
            <p className="mt-6 max-w-md text-lg text-warmgray">Handcrafted cravings. Bold flavors. Zero boring bites.</p>
          </SectionHeading>
          <div ref={drop} className="pointer-events-none relative mx-auto -mb-6 aspect-square w-[min(58vw,300px)] will-change-transform lg:mx-0 lg:ml-auto">
            <Lazy3D kind="drop" className="absolute inset-0" />
          </div>
        </div>

        <div data-cards className="mt-16 grid gap-6 md:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-8">
          {availableProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
