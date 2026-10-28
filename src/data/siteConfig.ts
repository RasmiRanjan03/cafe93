/**
 * CAFE 93 — business details.
 *
 * Every field below is intentionally left empty so nothing on the site is
 * invented. Fill them in and the matching buttons, links and info blocks
 * appear automatically. Empty fields are hidden (or shown as "coming soon").
 */
export const siteConfig = {
  name: 'CAFE 93',
  statement: 'Momos, bold flavors and good company. Made for cravings, built for moments.',

  /** Full URL of your online ordering page (Swiggy, Zomato, your own shop…). */
  orderUrl: '',
  /** WhatsApp number in international format, digits only, e.g. '919876543210'. */
  whatsappNumber: '',
  whatsappMessage: 'Hi CAFE 93! I would like to order some momos.',

  /** Phone number as it should be displayed and dialled, e.g. '+91 98765 43210'. */
  phone: '',
  /** Street address, one line. */
  address: '',
  /** Google Maps share link for the cafe. */
  mapsUrl: '',
  /** Opening hours, e.g. [{ days: 'Mon – Fri', time: '11:00 – 22:00' }]. */
  hours: [] as { days: string; time: string }[],

  /** Instagram profile URL and handle, e.g. 'https://instagram.com/cafe93' and '@cafe93'. */
  instagramUrl: '',
  instagramHandle: '',
  hashtag: '#Cafe93Moment',

  /** Public site URL, used for structured data. */
  siteUrl: '',
};

export type SiteConfig = typeof siteConfig;

export function getWhatsappUrl(): string {
  const n = siteConfig.whatsappNumber.replace(/\D/g, '');
  if (!n) return '';
  return `https://wa.me/${n}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;
}

/**
 * Where "order" buttons go: the ordering site, then WhatsApp, and if neither
 * is configured, the Visit section on this page (which explains how to order).
 */
export function getOrderLink(): { href: string; external: boolean; configured: boolean } {
  if (siteConfig.orderUrl) return { href: siteConfig.orderUrl, external: true, configured: true };
  const wa = getWhatsappUrl();
  if (wa) return { href: wa, external: true, configured: true };
  return { href: '#visit', external: false, configured: false };
}

export function getMapsLink(): { href: string; external: boolean } {
  if (siteConfig.mapsUrl) return { href: siteConfig.mapsUrl, external: true };
  return { href: '#visit-info', external: false };
}

/** LocalBusiness JSON-LD, only when enough real information exists. */
export function getStructuredData(): Record<string, unknown> | null {
  if (!siteConfig.address || !siteConfig.phone) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.name,
    servesCuisine: 'Momos',
    address: siteConfig.address,
    telephone: siteConfig.phone,
    ...(siteConfig.siteUrl && { url: siteConfig.siteUrl }),
    ...(siteConfig.mapsUrl && { hasMap: siteConfig.mapsUrl }),
    ...(siteConfig.instagramUrl && { sameAs: [siteConfig.instagramUrl] }),
  };
}
