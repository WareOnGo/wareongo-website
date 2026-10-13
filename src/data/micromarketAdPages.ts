import peenya from './micromarket-ad-pages/peenya.json';
import type { AdPageContent, AdPageCopy } from './adPages';
import type { BangaloreMapScope, BangaloreMapViews } from './bangaloreMicromarketMap';
import { MICROMARKET_AD_SLUGS } from './micromarketAdRoutes';
import { normalizeHeadingCase } from '@/lib/headingCase';
export { micromarketAdPath } from './micromarketAdRoutes';

/** Only micromarket differences live here; the city page owns the shared layout. */
export interface MicromarketAdPage {
  slug: string;
  name: string;
  city: string;
  citySlug: string;
  state: string;
  mapScope: BangaloreMapScope;
  mapMarkets: string[];
  map?: {
    alt: string;
    views: BangaloreMapViews;
    coordinates: Record<string, number[]>;
  };
  callbackNote: string;
  callbackNoteCompact?: string;
  heroSummary: string;
  heroSummaryCompact?: string;
  whatsappMessage: string;
  copy: Partial<AdPageCopy>;
  areaCards: { title: string; body: string }[];
  rentGuide: {
    intro: string;
    description: string;
    markets: { slug: string; name: string; label: string; floor?: number }[];
  };
  faqs: { q: string; a: string }[];
}

export interface AdLandingWarehouse {
  id: number;
  locality: string;
  address: string;
  size: number;
  price: number | null;
  ceilingHeight: number | null;
  warehouseType: string | null;
  numberOfDocks?: number | null;
  fireCompliance?: boolean | null;
  image?: string | null;
  imageFallback?: string | null;
}

export interface MicromarketLandingData {
  slug: string;
  listings: AdLandingWarehouse[];
  featured: AdLandingWarehouse[];
  listingCount: number;
  marketCounts: Record<string, number>;
  rentRows: { area: string; rent: string }[];
  rentRange: string | null;
}

function defineAdPage(page: Omit<MicromarketAdPage, 'mapScope'> & { mapScope: string }): MicromarketAdPage {
  if (page.mapScope !== 'belts' && page.mapScope !== 'city') throw new Error(`Unknown map scope for ${page.slug}.`);
  if (page.map && page.mapMarkets.some(slug => {
    const point = page.map.coordinates[slug];
    return !point || point.length !== 2 || !point.every(Number.isFinite) || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 85;
  })) throw new Error(`Missing or invalid map coordinates for ${page.slug}.`);
  return { ...page, mapScope: page.mapScope };
}

const pages: Record<(typeof MICROMARKET_AD_SLUGS)[number], MicromarketAdPage> = {
  peenya: defineAdPage(peenya),
};
export const MICROMARKET_AD_PAGES = MICROMARKET_AD_SLUGS.map(slug => pages[slug]);
export const getMicromarketAdPage = (slug: string) => MICROMARKET_AD_PAGES.find(page => page.slug === slug);

export function marketText(text: string, data: MicromarketLandingData): string {
  if (!data.rentRange) text = text.replace('{rentRange} per sq ft', 'Rent on request')
    .replace('{compactRentRange}/sq ft', 'Rent on request');
  return text.split('{listings}').join(data.listingCount.toLocaleString('en-IN'))
    .split('{compactRentRange}').join(data.rentRange?.replace(' to ', '–') ?? 'Rent on request')
    .split('{rentRange}').join(data.rentRange ?? 'Rent on request');
}

export function micromarketAdContent(base: AdPageContent, page: MicromarketAdPage, data: MicromarketLandingData): AdPageContent {
  return {
    ...base,
    slug: `bangalore/${page.slug}`,
    name: page.name,
    copy: { ...normalizeHeadingCase(base.copy), ...Object.fromEntries(Object.entries(page.copy).map(([key, value]) => [key, marketText(value, data)])) },
    rentGuide: { intro: page.rentGuide.intro, description: page.rentGuide.description, rows: data.rentRows },
    faqs: page.faqs.map(faq => ({ q: faq.q, a: !data.rentRange && faq.a.includes('{rentRange}')
      ? `Share your size and budget for current asking rents in ${page.name}. We’ll shortlist spaces that fit.`
      : marketText(faq.a, data) })),
  };
}
