import peenyaLayout from './micromarket-ad-layouts/peenya.json';
import hoskoteLayout from './micromarket-ad-layouts/hoskote.json';
import nelamangalaLayout from './micromarket-ad-layouts/nelamangala.json';
import southLayout from './micromarket-ad-layouts/electronic-city-jigani-bommasandra.json';
import hosurLayout from './micromarket-ad-layouts/hosur.json';
import hyderabadLayout from './micromarket-ad-layouts/hyderabad.json';
import shedsLayout from './micromarket-ad-layouts/sheds.json';
import { micromarketAdPages } from './micromarketAdPages.generated';
import type { MicromarketAdContent } from './micromarketAdContent';
import type { AdPageContent, AdPageCopy } from './adPages';
import { BANGALORE_MAP_AREAS, mapLabelsForCoordinates, type BangaloreMapArea, type BangaloreMapScope, type BangaloreMapViews, type MapView } from './bangaloreMicromarketMap';
import { normalizeHeadingCase, titleCase } from '@/lib/headingCase';
import { micromarketAdPath } from './micromarketAdRoutes';
export { micromarketAdPath } from './micromarketAdRoutes';

/** Code-owned inventory rules: exact tags, with explicit neighboring exclusions. */
export interface AdInventoryRule {
  city?: string;
  market?: string;
  /** Exact listing type, e.g. "Shed". */
  type?: string;
  includeAny?: string[];
  includeAll?: string[];
  exclude?: string[];
}
interface AdPageLayout {
  mapScope: string;
  mapMarkets: string[];
  inventory?: AdInventoryRule;
  rentFloor?: number;
  listingPolicy?: { minimumRent: number; addressTerm?: string };
  map?: { alt: string; credit?: string; views: BangaloreMapViews; coordinates?: Record<string, number[]> };
  /** Without a label, the marker sits at its map coordinates. */
  mapLocations?: { slug: string; canonical: string; scope: string; countSlug: string; chipLabel?: string; imageSlot?: string; showCount?: boolean; inventory: AdInventoryRule; label?: Record<MapView, number[]> }[];
  rentMarkets: { slug: string; name: string; label: string; floor?: number; inventory?: AdInventoryRule }[];
  /** Listing tags that name a card's locality, first match wins; otherwise the page's place. */
  cardLocalities?: string[];
  /** City pages: a named locality's sub-line shows the city ("Kompally · Hyderabad"); otherwise the state. */
  cardRegion?: string;
}
/** Shared by every ad page, including /bangalore. The compact line shows on phones. */
export const AD_CALLBACK_NOTE = 'Our team calls you within 4 hours, 9:30 AM to 7:30 PM.';
export const AD_CALLBACK_NOTE_COMPACT = 'Our team calls you between 9:30 AM to 7:30 PM';
/** Ad pages show nothing smaller: the campaigns exclude small-godown searches. */
export const AD_MIN_SIZE = 5000;
/** City pages outside Bangalore: inventory city and state. */
const AD_CITY_PAGES: Record<string, [city: string, state: string]> = { hosur: ['Hosur', 'Tamil Nadu'], hyderabad: ['Hyderabad', 'Telangana'] };

const LAYOUTS: Record<string, AdPageLayout> = {
  'bengaluru/peenya': peenyaLayout, 'bengaluru/hoskote': hoskoteLayout,
  'bengaluru/nelamangala': nelamangalaLayout, 'bengaluru/electronic-city-jigani-bommasandra': southLayout,
  'hosur/hosur': hosurLayout, 'hyderabad/hyderabad': hyderabadLayout, 'bengaluru/sheds': shedsLayout,
};

/** Only micromarket differences live here; the city page owns the shared layout. */
export interface MicromarketAdPage {
  slug: string;
  name: string;
  /** The place the copy names: the page's own name, or Bangalore for the shed page. */
  place: string;
  city: string;
  citySlug: string;
  state: string;
  path: string;
  inventory: AdInventoryRule;
  rentFloor: number;
  mapScope: BangaloreMapScope;
  mapMarkets: string[];
  mapLocations: (BangaloreMapArea & { inventory?: AdInventoryRule })[];
  mapBylines: Record<string, string>;
  listingPolicy?: { minimumRent: number; addressTerm?: string };
  cardLocalities?: string[];
  cardRegion?: string;
  map?: {
    alt: string;
    views: BangaloreMapViews;
    coordinates?: Record<string, number[]>;
    credit?: string;
  };
  callbackNote: string;
  callbackNoteCompact?: string;
  heroSummary: string;
  heroSummaryCompact?: string;
  whatsappMessage: string;
  copy: Partial<AdPageCopy>;
  /** A single card has no title and spans the section. */
  areaCards: { title: string; body: string }[];
  rentGuide: {
    intro: string;
    description?: string;
    sections?: { title: string; body: string }[];
    markets: AdPageLayout['rentMarkets'];
  };
  faqs: { q: string; a: string }[];
}

export interface AdLandingWarehouse {
  id: number;
  locality: string;
  address: string;
  city?: string;
  state?: string;
  region?: string;
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
  citySlug?: string;
  listings: AdLandingWarehouse[];
  featured: AdLandingWarehouse[];
  listingCount: number;
  marketCounts: Record<string, number>;
  marketImages?: Record<string, { url: string; fallback: string | null }>;
  rentRows: { area: string; rent: string }[];
  rentRange: string | null;
}

function defineAdPage(page: Omit<MicromarketAdPage, 'mapScope'> & { mapScope: string }): MicromarketAdPage {
  if (page.mapScope !== 'belts' && page.mapScope !== 'city') throw new Error(`Unknown map scope for ${page.slug}.`);
  if (page.map?.coordinates && page.mapMarkets.some(slug => {
    const point = page.map.coordinates[slug];
    return !point || point.length !== 2 || !point.every(Number.isFinite) || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 85;
  })) throw new Error(`Missing or invalid map coordinates for ${page.slug}.`);
  return { ...page, mapScope: page.mapScope };
}

/** CMS owns local prose; maps, inventory rules and shared wording stay in code. */
export function configureMicromarketAdPage(content: MicromarketAdContent): MicromarketAdPage {
  const { slug, name, citySlug } = content;
  const layout = LAYOUTS[citySlug + '/' + slug];
  const cities = AD_CITY_PAGES[citySlug];
  const grouped = slug === 'electronic-city-jigani-bommasandra';
  // Industrial sheds across Bangalore: a listing type, not a place.
  const sheds = citySlug === 'bengaluru' && slug === 'sheds';
  const place = sheds ? 'Bangalore' : name;
  const city = cities?.[0] ?? 'Bengaluru';
  const team = cities ? 'Our team' : 'Our Bangalore team';
  const mapScope = layout?.mapScope ?? BANGALORE_MAP_AREAS.find(area => area.slug === slug)?.scope ?? 'belts';
  const callbackNote = AD_CALLBACK_NOTE;
  const mapMarkets = layout?.mapMarkets ?? BANGALORE_MAP_AREAS.filter(area => area.scope === mapScope).map(area => area.slug);
  const mapLocations: MicromarketAdPage['mapLocations'] = layout?.mapLocations
    ? layout.mapLocations.map(({ label, ...location }) => {
      const point = layout.map?.coordinates?.[location.slug];
      if (!label && !point) throw new Error(`Missing map position for ${location.slug}.`);
      return { ...location, scope: 'belts', imageSlot: location.imageSlot as keyof AdPageContent['images'],
        label: label ? { desktop: [label.desktop[0], label.desktop[1]], tablet: [label.tablet[0], label.tablet[1]], mobile: [label.mobile[0], label.mobile[1]] }
          : mapLabelsForCoordinates(point, layout.map.views),
      };
    })
    : mapMarkets.flatMap(slug => BANGALORE_MAP_AREAS.filter(area => area.slug === slug)).map(area => grouped && area.slug === 'hosur-road'
      ? { ...area, canonical: 'Hosur Road', title: 'Hosur Road', chipLabel: 'Hosur Road', chipCaption: undefined, countSlug: 'hosur-road' } : area);
  return defineAdPage({
    slug, name, place, citySlug, city, state: cities?.[1] ?? 'Karnataka', path: micromarketAdPath(slug, citySlug),
    inventory: layout?.inventory ?? { city, market: name },
    rentFloor: layout?.rentFloor ?? layout?.rentMarkets.find(row => row.slug === slug)?.floor ?? 0,
    mapScope,
    mapMarkets, mapLocations,
    mapBylines: Object.fromEntries(content.mapBylines.map(item => [item.slug, item.byline])),
    listingPolicy: layout?.listingPolicy,
    cardLocalities: layout?.cardLocalities, cardRegion: layout?.cardRegion,
    map: layout?.map,
    callbackNote, callbackNoteCompact: AD_CALLBACK_NOTE_COMPACT,
    heroSummary: '{listings} ' + (sheds ? 'industrial sheds' : 'warehouses') + (grouped ? '' : ' in ' + place) + ' · {rentRange} per sq ft · Options within 4 hours',
    heroSummaryCompact: '{listings} ' + (sheds ? 'sheds' : 'warehouses') + ' · {compactRentRange}/sq ft · Options within 4 hours',
    whatsappMessage: sheds ? "Hi, I'm looking for an industrial shed in Bangalore. (From the industrial sheds page)"
      : "Hi, I'm looking for a warehouse in " + name + '. (From the ' + name + ' page)',
    copy: {
      ...content.copy,
      heroAccent: 'in ' + place.replace(' and ', ' & '),
      enquiryDescription: 'Share your details. We find the best ' + (sheds ? 'industrial shed in Bangalore' : 'warehouse or godown space ' + (grouped ? 'here' : 'in ' + name)) + '.',
      enquirySuccessDescription: team + ' will call you within 4 hours, 9:30 AM to 7:30 PM, to help with your ' + (sheds ? 'industrial shed' : name + ' warehouse') + ' search.',
      availableFooter: 'Not seeing your size? We’ll search all {listings} ' + (grouped ? 'listings in ' + name : sheds ? 'industrial sheds' : name + ' listings') + ' for you.',
      mapLabel: grouped ? 'Hosur Road' : place,
      contactDescription: 'Share your details. ' + team + ' will help you find ' + (sheds ? 'an industrial shed in Bangalore' : 'a space in ' + name) + '.',
      contactSuccess: callbackNote,
    },
    areaCards: content.area.whoItSuits === undefined ? [{ title: '', body: content.area.whereItIs }] : [
      { title: sheds ? 'Where They Are' : 'Where It Is', body: content.area.whereItIs },
      { title: sheds ? 'Who They Suit' : 'Who It Suits', body: content.area.whoItSuits },
    ],
    rentGuide: { ...content.rentGuide, markets: layout?.rentMarkets ?? [{ slug, name, label: name }] },
    faqs: content.faqs,
  });
}
export const MICROMARKET_AD_PAGES = micromarketAdPages.map(configureMicromarketAdPage);
export const getMicromarketAdPage = (slug: string, citySlug = 'bengaluru') => MICROMARKET_AD_PAGES.find(page => page.slug === slug && page.citySlug === citySlug);

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
    slug: page.path.slice(1),
    name: page.place,
    copy: { ...normalizeHeadingCase(base.copy), ...Object.fromEntries(Object.entries(page.copy).map(([key, value]) => [key, marketText(value, data)])) },
    // City pages outside Bangalore name their own city in the shared cards.
    services: page.citySlug !== 'bengaluru' ? base.services.map(card => ({ ...card, body: card.body.replace(/Bangalore/g, page.city), mobileBody: card.mobileBody.replace(/Bangalore/g, page.city) })) : base.services,
    audiences: page.citySlug !== 'bengaluru' ? base.audiences.map(card => card.id === 'owners' ? { ...card, body: card.body.replace(/Bangalore/g, page.city), mobileBody: card.mobileBody.replace(/Bangalore/g, page.city) } : card) : base.audiences,
    // The shared services photo is a Bangalore warehouse; its alt text must not name Bangalore elsewhere.
    images: page.citySlug !== 'bengaluru' ? { ...base.images, services: { ...base.images.services, alt: 'Warehouse exterior' } } : base.images,
    rentGuide: {
      intro: marketText(page.rentGuide.intro, data), description: page.rentGuide.description ? marketText(page.rentGuide.description, data) : '', rows: data.rentRows,
      ...(page.rentGuide.sections ? { sections: page.rentGuide.sections.map(section => ({ title: marketText(section.title, data), body: marketText(section.body, data) })) } : {}),
    },
    faqs: [...base.faqs.slice(0, 1).map(faq => ({ ...faq, q: titleCase(faq.q) })), ...page.faqs.map(faq => ({ q: marketText(faq.q, data), a: !data.rentRange && faq.a.includes('{rentRange}')
      ? `Share your size and budget for current asking rents in ${page.place}. We’ll shortlist spaces that fit.`
      : marketText(faq.a, data) }))],
  };
}
