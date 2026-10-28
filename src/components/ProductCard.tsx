import { useRef, type MouseEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import type { MomoProduct } from '../data/menu';
import { useFinePointer, useReducedMotion } from '../hooks/useDevice';
import { useFlavor } from './FlavorContext';
import { scrollToTarget } from './SmoothScroll';
import SpiceMeter from './SpiceMeter';
import Lazy3D from './Lazy3D';

const BG: Record<MomoProduct['variant'], string> = {
  steamed: 'from-[#fff9f0] to-[#f2e4cf]',
  fried: 'from-[#ffe9c2] to-[#f5c27a]',
  tandoori: 'from-[#ffd9c9] to-[#f39a78]',
};

/** Large product card with a live 3D momo and a gentle cursor tilt. */
export default function ProductCard({ product, index }: { product: MomoProduct; index: number }) {
  const card = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const { setSelected } = useFlavor();
  const tilt = fine && !reduced;

  const onMove = (e: MouseEvent) => {
    if (!tilt || !card.current) return;
    const r = card.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.current.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(-6px)`;
  };
  const onLeave = () => {
    if (card.current) card.current.style.transform = '';
  };

  const discover = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setSelected(product.id);
    scrollToTarget('#flavors');
  };

  return (
    <article
      ref={card}
      data-card
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative flex flex-col overflow-hidden rounded-[28px] bg-white/60 shadow-[0_30px_60px_-40px_rgba(21,21,21,.55)] ring-1 ring-charcoal/5 transition-[transform,box-shadow] duration-500 ease-out will-change-transform hover:shadow-[0_40px_80px_-40px_rgba(21,21,21,.6)]"
    >
      <div className={`relative aspect-[4/3.4] overflow-hidden bg-gradient-to-br ${BG[product.variant]}`}>
        <span className="absolute left-5 top-5 z-10 font-display text-sm font-bold text-charcoal/40">0{index + 1}</span>
        <div className="absolute inset-x-[12%] bottom-[10%] h-6 rounded-[50%] bg-charcoal/15 blur-xl" aria-hidden />
        <Lazy3D kind="card" variant={product.variant} className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6 text-charcoal sm:p-7">
        <SpiceMeter level={product.spice} />
        <h3 className="font-display text-[1.7rem] font-bold uppercase leading-[0.95] tracking-tight">{product.name}</h3>
        <p className="text-[0.98rem] leading-relaxed text-warmgray">{product.description}</p>
        <a href="#flavors" onClick={discover} className="link-u mt-auto self-start pt-2 text-chili">
          Discover flavor <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </a>
      </div>
    </article>
  );
}
