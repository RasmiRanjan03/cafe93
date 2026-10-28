import { useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../hooks/useDevice';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  eyebrow?: string;
  /** one entry per line, so line breaks stay deliberate */
  lines: ReactNode[];
  as?: 'h1' | 'h2';
  className?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  children?: ReactNode;
  id?: string;
}

/** Eyebrow + oversized heading whose lines slide up out of a mask on scroll. */
export default function SectionHeading({
  eyebrow,
  lines,
  as: Tag = 'h2',
  className = '',
  eyebrowClassName = 'text-chili',
  titleClassName = 'text-[clamp(2.6rem,7.4vw,6.6rem)]',
  children,
  id,
}: Props) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 82%', once: true },
      });
      const q = gsap.utils.selector(root);
      if (q('[data-eyebrow]').length) tl.from(q('[data-eyebrow]'), { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out' }, 0);
      tl.from(q('.line-mask > span'), { yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.09 }, 0.05);
      if (q('[data-sub]').length) tl.from(q('[data-sub]'), { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' }, 0.35);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className={className}>
      {eyebrow && (
        <p data-eyebrow className={`eyebrow mb-5 ${eyebrowClassName}`}>
          {eyebrow}
        </p>
      )}
      <Tag id={id} className={`display ${titleClassName}`}>
        {lines.map((l, i) => (
          <span key={i} className="line-mask">
            <span>{l}</span>
          </span>
        ))}
      </Tag>
      {children && <div data-sub>{children}</div>}
    </div>
  );
}
