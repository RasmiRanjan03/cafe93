/**
 * CAFE 93 — momo line-up.
 *
 * Edit names, copy, spice levels and accents here. No prices or ratings are
 * shown anywhere on the site. Set `available: false` to hide a product until
 * it is confirmed on the real menu.
 */
export type MomoVariant = 'steamed' | 'fried' | 'tandoori';

export interface MomoProduct {
  id: 'steam' | 'fry' | 'tandoori';
  tab: string;
  name: string;
  variant: MomoVariant;
  description: string;
  longDescription: string;
  /** 0 – 3 chilies */
  spice: number;
  /** Accent colour used when this product is selected. */
  accent: string;
  /** Short descriptive tags (cooking style, texture…). */
  notes: string[];
  available: boolean;
}

export const products: MomoProduct[] = [
  {
    id: 'steam',
    tab: 'Steam',
    name: 'Classic Steamed Momos',
    variant: 'steamed',
    description: 'Soft, delicate, perfectly steamed, and packed with flavor.',
    longDescription:
      'Thin hand-pleated wrappers, steamed until soft and glossy. The comfort classic that started every craving.',
    spice: 1,
    accent: '#FFC857',
    notes: ['Hand-pleated', 'Steamed fresh', 'Soft & juicy'],
    available: true,
  },
  {
    id: 'fry',
    tab: 'Fry',
    name: 'Crispy Fried Momos',
    variant: 'fried',
    description: 'Golden, crunchy, and made for that first irresistible bite.',
    longDescription:
      'Crescent-folded and fried to a deep golden crunch, with a tender, juicy centre waiting inside.',
    spice: 1,
    accent: '#F29A2E',
    notes: ['Golden crunch', 'Crescent fold', 'Juicy centre'],
    available: true,
  },
  {
    id: 'tandoori',
    tab: 'Tandoori',
    name: 'Fiery Tandoori Momos',
    variant: 'tandoori',
    description: 'Smoky, spicy, and loaded with bold tandoori flavor.',
    longDescription:
      'Coated in a smoky tandoori marinade and charred at high heat for a bold, fiery finish.',
    spice: 3,
    accent: '#E53935',
    notes: ['Smoky char', 'Tandoori spice', 'Bold heat'],
    available: true,
  },
];

export const availableProducts = products.filter((p) => p.available);
