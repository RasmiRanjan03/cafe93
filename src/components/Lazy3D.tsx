import { Suspense, lazy, useEffect, useRef, useState, type ComponentProps } from 'react';
import type { MomoVariant } from '../data/menu';
import { hasWebGL } from '../hooks/useDevice';
import MomoFallback from './MomoFallback';

const views = () => import('../three/Views');
const CardView = lazy(() => views().then((m) => ({ default: m.CardView })));
const DropView = lazy(() => views().then((m) => ({ default: m.DropView })));
const ExperienceView = lazy(() => views().then((m) => ({ default: m.ExperienceView })));
const ShowcaseView = lazy(() => views().then((m) => ({ default: m.ShowcaseView })));

type Props =
  | { kind: 'card'; variant: MomoVariant; className?: string }
  | { kind: 'drop'; className?: string }
  | { kind: 'experience'; className?: string }
  | { kind: 'showcase'; variant: MomoVariant; accent: string; className?: string };

const webgl = typeof window !== 'undefined' && hasWebGL();

/**
 * Mounts a 3D view only when it gets close to the viewport, and loads the
 * Three.js code on demand. Without WebGL a static illustration is shown.
 */
export default function Lazy3D(props: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!webgl || near || !box.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );
    io.observe(box.current);
    return () => io.disconnect();
  }, [near]);

  const variant: MomoVariant = props.kind === 'card' || props.kind === 'showcase' ? props.variant : 'steamed';

  if (!webgl) {
    return (
      <div className={props.className}>
        <MomoFallback variant={variant} />
      </div>
    );
  }

  if (!near) return <div ref={box} className={props.className} />;

  const placeholder = <div className={props.className} />;
  return (
    <Suspense fallback={placeholder}>
      {props.kind === 'card' && <CardView variant={props.variant} className={props.className} />}
      {props.kind === 'drop' && <DropView className={props.className} />}
      {props.kind === 'experience' && <ExperienceView className={props.className} />}
      {props.kind === 'showcase' && (
        <ShowcaseView variant={props.variant} accent={props.accent} className={props.className} />
      )}
    </Suspense>
  );
}

export type Lazy3DProps = ComponentProps<typeof Lazy3D>;
