/** CAFE 93 wordmark: tight grotesk "CAFE" with "93" in a chili-red badge. */
export default function Wordmark({ className = '', size = 'md' }: { className?: string; size?: 'md' | 'lg' }) {
  const lg = size === 'lg';
  return (
    <span className={`inline-flex items-center gap-1.5 font-display font-bold uppercase leading-none ${className}`}>
      <span className={`${lg ? 'text-5xl sm:text-7xl' : 'text-[1.35rem]'} tracking-tightest`}>Cafe</span>
      <span
        className={`inline-grid place-items-center rounded-full bg-chili text-cream ${
          lg ? 'h-16 w-16 text-3xl sm:h-24 sm:w-24 sm:text-5xl' : 'h-8 w-8 text-[0.95rem]'
        } tracking-tight`}
      >
        93
      </span>
    </span>
  );
}
