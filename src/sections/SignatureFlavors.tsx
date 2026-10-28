import { useRef, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import SpiceMeter from '../components/SpiceMeter';
import Lazy3D from '../components/Lazy3D';
import Button from '../components/Button';
import { useFlavor } from '../components/FlavorContext';
import { availableProducts } from '../data/menu';
import { getOrderLink } from '../data/siteConfig';

/** Tabbed flavour picker: changes the 3D showcase, copy and accent colour. */
export default function SignatureFlavors() {
  const { selected, setSelected } = useFlavor();
  const product = availableProducts.find((p) => p.id === selected) ?? availableProducts[0];
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const order = getOrderLink();

  // WAI-ARIA tabs keyboard pattern: arrows / Home / End move and select
  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const n = availableProducts.length;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + n) % n;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setSelected(availableProducts[next].id);
    tabs.current[next]?.focus();
  };

  if (!product) return null;

  return (
    <section
      id="flavors"
      data-nav="light"
      aria-labelledby="flavors-title"
      className="relative overflow-hidden bg-cream py-24 text-charcoal transition-colors sm:py-32"
      style={{ ['--accent' as string]: product.accent }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[20%] top-[10%] h-[70vmax] w-[70vmax] rounded-full opacity-25 blur-3xl transition-[background-color] duration-700"
        style={{ backgroundColor: 'var(--accent)' }}
      />
      <div className="container-x relative">
        <SectionHeading
          id="flavors-title"
          eyebrow="Find your favorite"
          lines={['Which momo', <>are you <span className="text-chili">today?</span></>]}
        />

        <div
          role="tablist"
          aria-label="Momo styles"
          className="mt-10 inline-flex flex-wrap gap-2 rounded-full bg-charcoal/[0.06] p-1.5"
        >
          {availableProducts.map((p, i) => {
            const on = p.id === product.id;
            return (
              <button
                key={p.id}
                ref={(el) => (tabs.current[i] = el)}
                role="tab"
                id={`tab-${p.id}`}
                aria-selected={on}
                aria-controls="flavor-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => setSelected(p.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`relative min-h-[48px] rounded-full px-6 font-display text-sm font-bold uppercase tracking-[0.14em] transition-colors duration-300 sm:px-8 ${
                  on ? 'text-cream' : 'text-charcoal/70 hover:text-charcoal'
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="flavor-pill"
                    className="absolute inset-0 -z-0 rounded-full bg-charcoal"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{p.tab}</span>
              </button>
            );
          })}
        </div>

        <div
          id="flavor-panel"
          role="tabpanel"
          aria-labelledby={`tab-${product.id}`}
          className="mt-10 grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16"
        >
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[28px] bg-charcoal">
            <div
              aria-hidden
              className="absolute inset-0 transition-[background] duration-700"
              style={{ background: `radial-gradient(60% 60% at 50% 55%, ${product.accent}44, transparent 70%)` }}
            />
            <Lazy3D kind="showcase" variant={product.variant} accent={product.accent} className="absolute inset-0" />
            <span className="eyebrow absolute left-6 top-6 text-cream/50">{product.tab}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="mb-5 block h-1.5 w-16 rounded-full transition-colors duration-500" style={{ backgroundColor: 'var(--accent)' }} />
              <h3 className="display text-[clamp(2.4rem,5vw,4.4rem)]">{product.name}</h3>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-warmgray">{product.longDescription}</p>
              <SpiceMeter level={product.spice} className="mt-6" />
              <ul className="mt-6 flex flex-wrap gap-2">
                {product.notes.map((n) => (
                  <li key={n} className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/15 px-4 py-2 text-sm font-medium">
                    <Check className="h-4 w-4 text-chili" aria-hidden /> {n}
                  </li>
                ))}
              </ul>
              <div className="mt-9">
                <Button href={order.href} external={order.external} variant="outline-dark">
                  {order.configured ? `Order ${product.tab} momos` : 'How to order'}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
