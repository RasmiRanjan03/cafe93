import { Instagram, Quote } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import { MomoSvg } from '../components/MomoFallback';
import { socialImages, testimonials } from '../data/content';
import { siteConfig } from '../data/siteConfig';
import type { MomoVariant } from '../data/menu';

const TILE_VARIANTS: MomoVariant[] = ['steamed', 'tandoori', 'fried', 'steamed', 'fried', 'tandoori'];
const TILE_BG = ['bg-[#f1e2cb]', 'bg-chili', 'bg-[#2b2826]', 'bg-gold', 'bg-[#ead7bd]', 'bg-[#2b2826]'];

/**
 * Real testimonials when the owner adds them; otherwise a #Cafe93Moment
 * share wall (no invented reviews, names or ratings).
 */
export default function TestimonialsSection() {
  const hasQuotes = testimonials.length > 0;

  return (
    <section id="moments" data-nav="dark" aria-labelledby="moments-title" className="relative overflow-hidden bg-charcoal py-24 text-cream sm:py-32">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <SectionHeading
            id="moments-title"
            eyebrow={hasQuotes ? 'Kind words' : siteConfig.hashtag}
            eyebrowClassName="text-gold"
            lines={['Good momos.', <><span className="text-chili">Good</span> company.</>]}
          />
          <div className="space-y-6 lg:pb-3">
            <p className="max-w-md text-lg leading-relaxed text-cream/70">
              Snapped your momos? Tag your photos with <strong className="text-cream">{siteConfig.hashtag}</strong> and share
              the moment with us.
            </p>
            {siteConfig.instagramUrl && (
              <Button href={siteConfig.instagramUrl} external variant="light">
                <Instagram className="h-4 w-4" aria-hidden /> Follow {siteConfig.instagramHandle || 'us'}
              </Button>
            )}
          </div>
        </div>

        {hasQuotes && (
          <ul className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <li key={t.author} className="flex flex-col justify-between gap-8 rounded-[24px] bg-cream/[0.06] p-8 ring-1 ring-cream/10">
                <Quote className="h-8 w-8 text-chili" aria-hidden />
                <blockquote className="font-display text-xl font-medium leading-snug">&ldquo;{t.quote}&rdquo;</blockquote>
                <p className="eyebrow text-cream/60">
                  {t.author}
                  {t.source && <span className="text-cream/40"> · {t.source}</span>}
                </p>
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-16 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6" aria-label={`${siteConfig.hashtag} wall`}>
          {(socialImages.length ? socialImages : TILE_VARIANTS.map((v) => ({ src: '', alt: `${v} momo` }))).map((img, i) => (
            <li
              key={i}
              className={`group relative aspect-square overflow-hidden rounded-[20px] ${img.src ? '' : TILE_BG[i % TILE_BG.length]} ${i % 2 ? 'lg:translate-y-8' : ''}`}
            >
              {img.src ? (
                <img src={img.src} alt={img.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center p-6" aria-hidden>
                  <MomoSvg variant={TILE_VARIANTS[i % TILE_VARIANTS.length]} className="w-3/4 transition-transform duration-700 ease-out group-hover:-translate-y-1 group-hover:rotate-6" />
                </div>
              )}
              <span className="pointer-events-none absolute inset-x-3 bottom-3 rounded-full bg-charcoal/70 px-3 py-1 text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cream/80 opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                {siteConfig.hashtag}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
