import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, RotateCcw } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../components/Button';
import HeroPoster from '../components/HeroPoster';
import { getOrderLink } from '../data/siteConfig';
import { getQualityTier, hasWebGL, useFinePointer, useReducedMotion } from '../hooks/useDevice';

gsap.registerPlugin(ScrollTrigger);

const MomoScene = lazy(() => import('../three/MomoScene'));

const ease = [0.22, 1, 0.36, 1] as const;
const line = {
  hidden: { yPercent: 110 },
  show: (i: number) => ({ yPercent: 0, transition: { duration: 1, ease, delay: i * 0.1 } }),
};
const fadeUp = {
  hidden: { y: 24, opacity: 0 },
  show: (d: number) => ({ y: 0, opacity: 1, transition: { duration: 0.8, ease, delay: d } }),
};

export default function HeroSection({ onReady }: { onReady: () => void }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const [webgl] = useState(() => hasWebGL());
  const [tier] = useState(getQualityTier);
  const [wide, setWide] = useState(() => window.innerWidth >= 1024);
  const [active, setActive] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const order = getOrderLink();

  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // pause rendering while the hero is off screen
  useEffect(() => {
    if (!section.current) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0 });
    io.observe(section.current);
    return () => io.disconnect();
  }, []);

  // without WebGL there is no timeline: show everything right away
  useEffect(() => {
    if (!webgl) {
      onReady();
      setRevealed(true);
    }
    // safety net: never keep the headline hidden for long
    const t = setTimeout(() => setRevealed(true), 9000);
    return () => clearTimeout(t);
  }, [webgl, onReady]);

  // as the visitor scrolls on, the product lifts and shrinks slightly
  useLayoutEffect(() => {
    if (reduced || !section.current) return;
    const ctx = gsap.context(() => {
      const st = { trigger: section.current, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to(stage.current, { yPercent: -14, scale: 0.9, opacity: 0.35, ease: 'none', scrollTrigger: st });
      gsap.to(copy.current, { y: -80, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '70% top' } });
    }, section);
    return () => ctx.revert();
  }, [reduced]);

  const show = revealed ? 'show' : 'hidden';

  return (
    <section
      id="home"
      ref={section}
      data-nav="dark"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-charcoal lg:block"
    >
      {/* studio backdrop: warm spotlight + chili glow + vignette */}
      <div
        aria-hidden
        className="grain absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 55% at 68% 42%, rgba(255,200,87,.16), transparent 60%), radial-gradient(45% 45% at 72% 70%, rgba(229,57,53,.22), transparent 70%), radial-gradient(120% 90% at 50% 0%, #232120 0%, #151515 55%, #0b0b0b 100%)',
        }}
      />

      {/* 3D stage */}
      <div
        ref={stage}
        className="relative h-[56svh] min-h-[340px] w-full pt-[var(--nav-h)] will-change-transform lg:absolute lg:inset-0 lg:h-full lg:pt-0"
      >
        {webgl ? (
          <Suspense fallback={null}>
            <MomoScene
              tier={tier}
              reducedMotion={reduced}
              mouse={fine && wide}
              shiftRight={wide}
              active={active}
              replayKey={replayKey}
              onReady={onReady}
              onReveal={() => setRevealed(true)}
            />
          </Suspense>
        ) : (
          <HeroPoster />
        )}
      </div>

      {/* copy */}
      <div ref={copy} className="container-x relative z-10 flex flex-1 flex-col justify-center pb-10 lg:min-h-[100svh] lg:pb-0">
        <div className="max-w-[620px] lg:max-w-[46%]">
          <motion.p variants={fadeUp} initial="hidden" animate={show} custom={0} className="eyebrow mb-5 text-gold">
            Steamed. Stuffed. Unforgettable.
          </motion.p>
          <h1 id="hero-title" className="display text-[clamp(2.9rem,8.6vw,7.4rem)] text-cream">
            {[
              <>Good things</>,
              <>come in</>,
              <>
                <span className="text-chili">Momo</span> buckets.
              </>,
            ].map((content, i) => (
              <span key={i} className="line-mask">
                <motion.span variants={line} initial="hidden" animate={show} custom={i}>
                  {content}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={show}
            custom={0.35}
            className="mt-6 max-w-md text-base leading-relaxed text-cream/75 sm:text-lg"
          >
            Hot, juicy, flavor-packed momos made for every craving.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={show}
            custom={0.5}
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <Button href={order.href} external={order.external} magnetic>
              Get your momo fix
            </Button>
            <a href="#momos" className="link-u text-cream">
              Explore the menu <ArrowDown className="h-4 w-4" aria-hidden />
            </a>
          </motion.div>
        </div>
      </div>

      {webgl && !reduced && (
        <motion.button
          type="button"
          onClick={() => setReplayKey((k) => k + 1)}
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ delay: revealed ? 1.2 : 0, duration: 0.6 }}
          className="absolute bottom-6 right-4 z-20 hidden items-center gap-2 rounded-full border border-cream/20 px-4 py-2.5 font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-cream/70 transition-colors hover:border-gold hover:text-gold sm:right-8 lg:inline-flex"
          tabIndex={revealed ? 0 : -1}
          aria-hidden={!revealed}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Replay the magic
        </motion.button>
      )}
    </section>
  );
}
