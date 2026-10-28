import { useRef, type ReactNode, type MouseEvent } from 'react';
import { useFinePointer, useReducedMotion } from '../hooks/useDevice';

type Variant = 'primary' | 'light' | 'outline' | 'outline-dark';

const styles: Record<Variant, string> = {
  primary: 'bg-chili text-cream hover:bg-[#c92d2a]',
  light: 'bg-cream text-charcoal hover:bg-gold',
  outline: 'border-2 border-cream/80 text-cream hover:bg-cream hover:text-charcoal',
  'outline-dark': 'border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-cream',
};

interface Props {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  magnetic?: boolean;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  ariaLabel?: string;
}

/**
 * Link styled as a button. Optional magnetic pull toward the cursor — only on
 * precise pointers and when reduced motion is off.
 */
export default function Button({
  href,
  children,
  variant = 'primary',
  external,
  magnetic = false,
  className = '',
  onClick,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const active = magnetic && fine && !reduced;

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!active || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    ref.current.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-label={ariaLabel}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`inline-flex min-h-[52px] select-none items-center justify-center gap-2 rounded-full px-7 font-display text-sm font-bold uppercase tracking-[0.12em] transition-[background-color,color,transform,box-shadow] duration-300 ease-out active:scale-[0.96] ${styles[variant]} ${className}`}
    >
      {children}
    </a>
  );
}
