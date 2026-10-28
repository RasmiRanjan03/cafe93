import { ArrowUpRight } from 'lucide-react';
import Wordmark from './Wordmark';
import { siteConfig, getOrderLink } from '../data/siteConfig';

/** Footer links; external ones only become links once configured. */
export default function Footer() {
  const order = getOrderLink();
  const site = [
    { label: 'Home', href: '#home' },
    { label: 'Menu', href: '#momos' },
    { label: 'Our Story', href: '#story' },
    { label: 'Contact', href: '#visit' },
  ];
  const external = [
    { label: 'Instagram', href: siteConfig.instagramUrl },
    { label: 'Google Maps', href: siteConfig.mapsUrl },
    { label: 'Order Online', href: order.configured ? order.href : '' },
  ];

  return (
    <footer className="relative overflow-hidden bg-charcoal pt-20 text-cream" data-nav="dark">
      <div className="container-x grid gap-12 pb-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm space-y-5">
          <Wordmark />
          <p className="text-cream/65">{siteConfig.statement}</p>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow mb-5 text-cream/45">Explore</p>
          <ul className="space-y-3">
            {site.map((l) => (
              <li key={l.label}>
                <a className="link-u !text-sm" href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow mb-5 text-cream/45">Connect</p>
          <ul className="space-y-3">
            {external.map((l) => (
              <li key={l.label}>
                {l.href ? (
                  <a className="link-u !text-sm" href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label} <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-cream/40">
                    {l.label}
                    <span className="rounded-full border border-cream/20 px-2 py-0.5 text-[0.6rem] tracking-[0.18em]">Soon</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-x border-t border-cream/10 py-10">
        <p className="display select-none text-[clamp(2.8rem,10.5vw,10rem)] text-cream" aria-label="Stay hungry. Stay happy.">
          Stay hungry.<br />
          <span className="text-chili">Stay happy.</span>
        </p>
      </div>

      <div className="container-x flex flex-col justify-between gap-3 border-t border-cream/10 py-6 text-sm text-cream/45 sm:flex-row">
        <span>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span>
        <a href="#home" className="link-u !text-xs !text-cream/60">Back to top ↑</a>
      </div>
    </footer>
  );
}
