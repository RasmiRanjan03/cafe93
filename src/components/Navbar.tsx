import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Wordmark from './Wordmark';
import { getOrderLink } from '../data/siteConfig';

export const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#momos', label: 'Our Momos' },
  { href: '#experience', label: 'The Experience' },
  { href: '#story', label: 'About Us' },
  { href: '#visit', label: 'Contact' },
];

/**
 * Transparent over the hero, then a blurred bar whose colours follow the
 * section underneath (sections declare data-nav="dark" | "light").
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [open, setOpen] = useState(false);
  const order = getOrderLink();

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 24);
      const probe = 40;
      const sections = document.querySelectorAll<HTMLElement>('[data-nav]');
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) {
          setTheme(s.dataset.nav === 'light' ? 'light' : 'dark');
          break;
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const light = theme === 'light' && !open;
  const bar = scrolled && !open ? (light ? 'bg-cream/85 shadow-[0_8px_30px_-20px_rgba(0,0,0,.5)]' : 'bg-charcoal/75') : 'bg-transparent';
  const fg = light ? 'text-charcoal' : 'text-cream';

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${bar} ${scrolled ? 'backdrop-blur-md' : ''}`}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-charcoal"
      >
        Skip to content
      </a>
      <nav className={`container-x flex h-[var(--nav-h)] items-center justify-between gap-4 ${fg} transition-colors duration-500`} aria-label="Main">
        <a href="#home" className="relative z-[61] shrink-0" aria-label="CAFE 93 — back to top" onClick={() => setOpen(false)}>
          <Wordmark />
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="link-u !text-[0.78rem]">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="relative z-[61] flex items-center gap-2">
          <a
            href={order.href}
            {...(order.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            onClick={() => setOpen(false)}
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-chili px-4 font-display text-[0.72rem] font-bold uppercase tracking-[0.14em] text-cream transition-transform duration-300 hover:scale-[1.04] active:scale-95 sm:px-6 sm:text-xs"
          >
            Order Momos <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-3.5 w-6" aria-hidden>
              <span className={`absolute left-0 h-[2px] w-6 bg-current transition-transform duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 top-1.5 h-[2px] w-6 bg-current transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
              <span className={`absolute left-0 h-[2px] w-6 bg-current transition-transform duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[60] flex flex-col justify-between bg-charcoal px-6 pb-10 pt-[calc(var(--nav-h)+2rem)] text-cream lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="space-y-2">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <a href={l.href} onClick={() => setOpen(false)} className="display block py-1 text-[clamp(2.4rem,11vw,4rem)] hover:text-gold">
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <p className="eyebrow text-cream/50">Steamed. Stuffed. Unforgettable.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
