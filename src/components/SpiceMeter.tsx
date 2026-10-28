import { Flame } from 'lucide-react';

const LABELS = ['Not spicy', 'Mild', 'Medium', 'Hot'];

export default function SpiceMeter({ level, className = '' }: { level: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-label={`Spice level: ${LABELS[level]}`} role="img">
      {[1, 2, 3].map((i) => (
        <Flame
          key={i}
          aria-hidden
          className={`h-4 w-4 ${i <= level ? 'fill-chili text-chili' : 'text-current opacity-25'}`}
          strokeWidth={2}
        />
      ))}
      <span className="ml-1 text-xs font-semibold uppercase tracking-[0.14em] opacity-70">{LABELS[level]}</span>
    </span>
  );
}
