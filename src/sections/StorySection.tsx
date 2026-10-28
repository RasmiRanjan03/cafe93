import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../components/SectionHeading';
import PhotoBlock from '../components/PhotoBlock';
import { storyImages } from '../data/content';
import { prefersReducedMotion } from '../hooks/useDevice';

gsap.registerPlugin(ScrollTrigger);

export default function StorySection() {
  const root = useRef<HTMLElement>(null);
  const [prep, steam, friends, space] = storyImages;

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-photo]').forEach((el, i) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(100% 0% 0% 0% round 24px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 24px)',
            duration: 1.3,
            ease: 'power4.out',
            delay: (i % 2) * 0.12,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        );
      });
      gsap.to('[data-parallax]', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="story" ref={root} data-nav="light" aria-labelledby="story-title" className="relative overflow-hidden bg-cream py-24 text-charcoal sm:py-32">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <SectionHeading
            id="story-title"
            eyebrow="Our story"
            lines={['Made for cravings.', <>Built for <span className="text-chili">moments.</span></>]}
            titleClassName="text-[clamp(2.5rem,6.6vw,6rem)]"
          />
          <p className="max-w-md text-lg leading-relaxed text-warmgray lg:pb-3">
            CAFE 93 brings people together over the kind of food that turns an ordinary break into something worth
            remembering. Great momos, bold flavors, and good company—that&rsquo;s the vibe.
          </p>
        </div>

        {/* asymmetrical editorial grid */}
        <div className="mt-16 grid grid-cols-6 gap-4 sm:gap-6 lg:mt-24 lg:grid-cols-12">
          {prep && (
            <PhotoBlock {...prep} className="col-span-6 aspect-[4/5] sm:col-span-4 lg:col-span-5 lg:row-span-2 lg:aspect-auto lg:min-h-[640px]" />
          )}
          <div className="col-span-6 flex flex-col justify-between gap-6 sm:col-span-2 lg:col-span-3 lg:pt-24">
            <p className="eyebrow text-chili">Since the first fold</p>
            <p className="font-display text-2xl font-bold uppercase leading-tight tracking-tight">
              Every momo is folded, steamed and served to be eaten hot.
            </p>
          </div>
          {steam && <PhotoBlock {...steam} tone="dark" className="col-span-6 aspect-[4/3] sm:col-span-3 lg:col-span-4 lg:aspect-[4/5]" />}
          {friends && (
            <div data-parallax className="col-span-6 sm:col-span-3 lg:col-span-4 lg:col-start-6">
              <PhotoBlock {...friends} tone="red" className="aspect-[4/3]" />
            </div>
          )}
          {space && <PhotoBlock {...space} className="col-span-6 aspect-[16/10] lg:col-span-3 lg:aspect-[4/5]" />}
        </div>
      </div>
    </section>
  );
}
