/**
 * Editorial content that the cafe owner will want to replace.
 *
 * Story photos: put real photos in /public/images and set `src`
 * (e.g. '/images/kitchen.jpg'). Until then a clearly-labelled placeholder
 * block is shown, so no stock image is passed off as the real cafe.
 */
export interface StoryImage {
  src: string;
  alt: string;
  label: string;
}

export const storyImages: StoryImage[] = [
  { src: '', alt: 'Momos being folded by hand in the CAFE 93 kitchen', label: 'Hand-folded, every batch' },
  { src: '', alt: 'Steam rising from a basket of freshly cooked momos', label: 'Straight from the steamer' },
  { src: '', alt: 'Friends sharing momos around a table at CAFE 93', label: 'Better together' },
  { src: '', alt: 'The CAFE 93 dining space', label: 'The space' },
];

/**
 * Real customer testimonials only. Leave empty until you have permission to
 * quote real guests — the section then becomes a "#Cafe93Moment" share wall.
 */
export interface Testimonial {
  quote: string;
  author: string;
  source?: string;
}

export const testimonials: Testimonial[] = [];

/** Optional photos for the social wall (e.g. reposted guest photos, with permission). */
export const socialImages: { src: string; alt: string }[] = [];

export const experienceHighlights = [
  { n: '01', title: 'Freshly Steamed', text: 'Made to be enjoyed hot, soft, and full of flavor.' },
  { n: '02', title: 'Bold Flavors', text: 'From classic comfort to fiery cravings.' },
  { n: '03', title: 'Made to Share', text: 'Because the best moments happen around good food.' },
];
