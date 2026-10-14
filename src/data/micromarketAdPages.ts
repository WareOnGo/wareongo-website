import peenyaLayout from './micromarket-ad-layouts/peenya.json';
import { micromarketAdPages } from './micromarketAdPages.generated';
import type { MicromarketAdContent } from './micromarketAdContent';
import type { AdPageContent, AdPageCopy } from './adPages';
import { BANGALORE_MAP_AREAS, type BangaloreMapScope, type BangaloreMapViews } from './bangaloreMicromarketMap';
import { normalizeHeadingCase, titleCase } from '@/lib/headingCase';
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
  mapBylines: Record<string, string>;
  listingPolicy?: { minimumRent: number; addressTerm: string };
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

/** CMS owns local prose; maps, inventory rules and shared wording stay in code. */
export function configureMicromarketAdPage(content: MicromarketAdContent): MicromarketAdPage {
  const { slug, name, citySlug } = content;
  const layout = slug === 'peenya' ? peenyaLayout : undefined;
  const mapScope = layout?.mapScope ?? BANGALORE_MAP_AREAS.find(area => area.slug === slug)?.scope ?? 'belts';
  const callbackNote = 'Our Bangalore team calls you within 4 hours, 9:30 AM to 7:30 PM.';
  return defineAdPage({
    slug, name, citySlug, city: 'Bengaluru', state: 'Karnataka',
    mapScope,
    mapMarkets: layout?.mapMarkets ?? BANGALORE_MAP_AREAS.filter(area => area.scope === mapScope).map(area => area.slug),
    mapBylines: Object.fromEntries(content.mapBylines.map(item => [item.slug, item.byline])),
    listingPolicy: layout?.listingPolicy,
    map: layout?.map,
    callbackNote, callbackNoteCompact: 'We call within 4 hours · 9:30am–7:30pm',
    heroSummary: '{listings} warehouses in ' + name + ' · {rentRange} per sq ft · Options within 4 hours',
    heroSummaryCompact: '{listings} warehouses · {compactRentRange}/sq ft · Options within 4 hours',
    whatsappMessage: "Hi, I'm looking for a warehouse in " + name + '. (From the ' + name + ' page)',
    copy: {
      ...content.copy,
      heroAccent: 'in ' + name,
      enquiryDescription: 'Share your details. We’ll help you find a space in ' + name + '.',
      enquirySuccessDescription: 'Our Bangalore team will call you within 4 hours, 9:30 AM to 7:30 PM, to help with your ' + name + ' warehouse search.',
      availableFooter: 'Not seeing your size? We’ll search all {listings} ' + name + ' listings for you.',
      mapLabel: name,
      contactDescription: 'Share your details. Our Bangalore team will help you find a space in ' + name + '.',
      contactSuccess: callbackNote,
    },
    areaCards: [
      { title: 'Where It Is', body: content.area.whereItIs },
      { title: 'Who It Suits', body: content.area.whoItSuits },
    ],
    rentGuide: { ...content.rentGuide, markets: layout?.rentMarkets ?? [{ slug, name, label: name }] },
    faqs: content.faqs,
  });
}
export const MICROMARKET_AD_PAGES = micromarketAdPages.map(configureMicromarketAdPage);
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
    rentGuide: { intro: marketText(page.rentGuide.intro, data), description: marketText(page.rentGuide.description, data), rows: data.rentRows },
    faqs: [...base.faqs.slice(0, 1).map(faq => ({ ...faq, q: titleCase(faq.q) })), ...page.faqs.map(faq => ({ q: marketText(faq.q, data), a: !data.rentRange && faq.a.includes('{rentRange}')
      ? `Share your size and budget for current asking rents in ${page.name}. We’ll shortlist spaces that fit.`
      : marketText(faq.a, data) }))],
  };
}
