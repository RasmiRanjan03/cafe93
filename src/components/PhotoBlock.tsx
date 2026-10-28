import { ImageIcon } from 'lucide-react';

/**
 * Shows a real photo when `src` is set; otherwise a clearly-labelled
 * placeholder so no stand-in image is mistaken for the real cafe.
 */
export default function PhotoBlock({
  src,
  alt,
  label,
  className = '',
  tone = 'warm',
}: {
  src: string;
  alt: string;
  label: string;
  className?: string;
  tone?: 'warm' | 'dark' | 'red';
}) {
  const tones = {
    warm: 'from-[#efdcc2] via-[#e5c9a6] to-[#d4ae84] text-charcoal',
    dark: 'from-[#2a2624] via-[#1f1c1b] to-[#151515] text-cream',
    red: 'from-[#e8574f] via-[#d23a33] to-[#a8231f] text-cream',
  };
  return (
    <figure data-photo className={`group relative overflow-hidden rounded-[24px] ${className}`}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
      ) : (
        <div className={`grain relative flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br p-6 text-center ${tones[tone]}`} role="img" aria-label={`Photo placeholder: ${alt}`}>
          <ImageIcon className="h-8 w-8 opacity-50" aria-hidden />
          <span className="max-w-[16rem] text-sm opacity-70">{alt}</span>
          <span className="rounded-full border border-current/30 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] opacity-60">
            Photo placeholder
          </span>
        </div>
      )}
      <figcaption className="absolute bottom-4 left-4 rounded-full bg-charcoal/85 px-3.5 py-1.5 font-display text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream backdrop-blur">
        {label}
      </figcaption>
    </figure>
  );
}
