/** Shared by browsing today and a possible header search later. No UI or API dependency. */
export type LocationCategory = 'states' | 'cities' | 'micromarkets';

export interface NavigationLocation {
  id: string;
  category: LocationCategory;
  label: string;
  slug: string;
  href: string;
  parentLabel?: string;
  count: number;
  searchText: string;
}

export type LocationCatalogue = Record<LocationCategory, NavigationLocation[]>;

interface PlaceSummary { canonical: string; slug: string; count: number }
interface MarketSummary extends PlaceSummary { parentCity: string; citySlug: string }

export interface NavigationGuide {
  label: string;
  parentLabel: string;
  href: string;
  image?: { url: string; alt: string; width?: number; height?: number };
}

export const LOCATION_CATEGORIES: { key: LocationCategory; label: string; singular: string }[] = [
  { key: 'states', label: 'States', singular: 'state' },
  { key: 'cities', label: 'Cities', singular: 'city' },
  { key: 'micromarkets', label: 'Micromarkets', singular: 'micromarket' },
];

const CITY_ALIASES: Record<string, string[]> = {
  bengaluru: ['bangalore'], mumbai: ['bombay'], kolkata: ['calcutta'],
  chennai: ['madras'], gurugram: ['gurgaon'],
};

// Existing listing slugs can contain consecutive hyphens. Do not rewrite URLs.
const validSlug = (slug: string) => /^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/.test(slug);
const normalize = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function createLocationCatalogue(source: {
  states: readonly PlaceSummary[];
  cities: readonly PlaceSummary[];
  micromarkets: readonly MarketSummary[];
  cityMinListings: number;
}): LocationCatalogue {
  const catalogue: LocationCatalogue = { states: [], cities: [], micromarkets: [] };
  const seen = new Set<string>();
  for (const { key: category } of LOCATION_CATEGORIES) {
    for (const place of source[category]) {
      const market = category === 'micromarkets' ? place as MarketSummary : null;
      const minimum = category === 'cities' ? source.cityMinListings : 1;
      if (!place.canonical?.trim() || !validSlug(place.slug) || !Number.isFinite(place.count)
        || place.count < minimum || (market && (!market.parentCity?.trim()
          || !validSlug(market.citySlug) || ['peb', 'rcc'].includes(market.slug)))) continue;
      const id = `${category}/${market ? `${market.citySlug}/` : ''}${place.slug}`;
      if (seen.has(id)) continue;
      seen.add(id);
      const citySlug = market?.citySlug ?? (category === 'cities' ? place.slug : '');
      catalogue[category].push({
        id, category, label: place.canonical, slug: place.slug, count: place.count,
        href: market ? `/listings/city/${market.citySlug}/${place.slug}`
          : `/listings/${category === 'cities' ? 'city' : 'state'}/${place.slug}`,
        ...(market ? { parentLabel: market.parentCity } : {}),
        searchText: normalize([place.canonical, place.slug, market?.parentCity ?? '',
          ...(CITY_ALIASES[citySlug] ?? [])].join(' ')),
      });
    }
    catalogue[category].sort((a, b) => a.label.localeCompare(b.label, 'en')
      || (a.parentLabel ?? '').localeCompare(b.parentLabel ?? '', 'en'));
  }
  return catalogue;
}

/** Resolve build-ranked IDs without re-sorting them or making browser requests. */
export function featuredLocations(catalogue: LocationCatalogue, category: LocationCategory, rankedIds: readonly string[]): NavigationLocation[] {
  const places = new Map(catalogue[category].map(place => [place.id, place]));
  return [...new Set(rankedIds)].flatMap(id => places.get(id) ?? []);
}

/** All categories are searchable without changing the catalogue or link components. */
export function searchLocations(catalogue: LocationCatalogue, query: string, category?: LocationCategory): NavigationLocation[] {
  const words = normalize(query).split(' ').filter(Boolean);
  const places = category ? catalogue[category] : LOCATION_CATEGORIES.flatMap(({ key }) => catalogue[key]);
  return places.filter(place => words.every(word => place.searchText.includes(word)));
}
