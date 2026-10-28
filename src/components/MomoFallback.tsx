import type { MomoVariant } from '../data/menu';

const FILL: Record<MomoVariant, [string, string]> = {
  steamed: ['#FBF6EE', '#E4D6C2'],
  fried: ['#F0B455', '#A9601C'],
  tandoori: ['#E0572B', '#7A2410'],
};

/** Static SVG momo, used only when WebGL is unavailable. */
export function MomoSvg({ variant = 'steamed', className }: { variant?: MomoVariant; className?: string }) {
  const [a, b] = FILL[variant];
  const id = `mg-${variant}`;
  return (
    <svg viewBox="0 0 200 160" className={className} role="img" aria-label={`Illustration of a ${variant} momo`}>
      <defs>
        <radialGradient id={id} cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="142" rx="70" ry="9" fill="rgba(0,0,0,.25)" />
      <path d="M28 120 C 18 70, 70 40, 92 22 Q 100 14 108 22 C 130 40, 182 70, 172 120 Q 100 150 28 120Z" fill={`url(#${id})`} />
      {[-36, -18, 0, 18, 36].map((x) => (
        <path key={x} d={`M${100 + x * 0.2} 26 Q ${100 + x * 1.1} 60 ${100 + x * 1.6} 96`} stroke="rgba(0,0,0,.12)" strokeWidth="3" fill="none" strokeLinecap="round" />
      ))}
    </svg>
  );
}

export default function MomoFallback({ variant = 'steamed' }: { variant?: MomoVariant }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <MomoSvg variant={variant} className="h-auto w-3/5 max-w-[320px] drop-shadow-2xl" />
    </div>
  );
}
