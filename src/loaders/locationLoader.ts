import type { LoaderFunctionArgs } from 'react-router-dom';
import { warehouseAPI, transformWarehouseData, type Warehouse } from '@/services/warehouseAPI';

// ----- canonical name + slug helpers ----------------------------------------

const CITY_ALIASES: Record<string, string> = {
  bangalore: 'Bengaluru',
  bombay: 'Mumbai',
  calcutta: 'Kolkata',
  madras: 'Chennai',
  gurgaon: 'Gurugram',
};

const titleCase = (s: string): string =>
  s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const canonicalize = (raw: string | null | undefined, type: 'city' | 'state'): string | null => {
  if (!raw) return null;
  const lower = raw.trim().toLowerCase();
  if (!lower) return null;
  if (type === 'city' && CITY_ALIASES[lower]) return CITY_ALIASES[lower];
  return titleCase(lower);
};

export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

// Every raw name that should match a given canonical (handles aliases).
const matchersFor = (canonical: string, type: 'city' | 'state'): Set<string> => {
  const out = new Set<string>([canonical.toLowerCase()]);
  if (type === 'city') {
    for (const [alias, can] of Object.entries(CITY_ALIASES)) {
      if (can === canonical) out.add(alias);
    }
  }
  return out;
};

// ----- cached warehouse fetch -----------------------------------------------

let warehousesCache: Warehouse[] | null = null;

export async function getAllWarehouses(): Promise<Warehouse[]> {
  if (warehousesCache) return warehousesCache;
  const all: Warehouse[] = [];
  let page = 1;
  const pageSize = 50;
  while (true) {
    const resp = await warehouseAPI.getWarehouses(page, pageSize);
    all.push(...resp.data);
    if (page >= resp.pagination.totalPages || resp.data.length === 0) break;
    page += 1;
  }
  warehousesCache = all;
  return all;
}

// ----- public types + summaries ---------------------------------------------

export interface LocationSummary {
  canonical: string;
  slug: string;
  count: number;
}

export type WarehouseType = 'PEB' | 'RCC';
export type WarehouseTypeSlug = 'peb' | 'rcc';

const canonicalType = (raw: string | null | undefined): WarehouseType | null => {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  if (upper === 'PEB' || upper === 'RCC') return upper;
  return null;
};

const typeSlugToCanonical = (slug: string): WarehouseType | null => {
  const lower = slug.toLowerCase();
  if (lower === 'peb') return 'PEB';
  if (lower === 'rcc') return 'RCC';
  return null;
};

/** Micromarket pages reuse the city/state page component, so they share its scope union. */
export type LocationScope = 'city' | 'state' | 'micromarket';

export interface LocationListingsLoaderData {
  type: LocationScope;
  canonical: string;
  slug: string;
  // Present only on /listings/.../:type pages; absent on base location pages.
  warehouseType?: WarehouseType;
  warehouses: ReturnType<typeof transformWarehouseData>[];
  // Counts for the link block on base location pages (e.g. "12 PEB / 47 RCC").
  typeCounts?: { PEB: number; RCC: number };
  // Micromarket pages only: the city its listings actually sit in, for the
  // "…, Bengaluru" context in the heading plus a breadcrumb/link up to it.
  parentCity?: { canonical: string; slug: string } | null;
}

const countTypes = (scoped: Warehouse[]) =>
  scoped.reduce(
    (acc, w) => {
      const t = canonicalType(w.warehouseType);
      if (t === 'PEB') acc.PEB += 1;
      else if (t === 'RCC') acc.RCC += 1;
      return acc;
    },
    { PEB: 0, RCC: 0 },
  );

async function summariesFor(type: 'city' | 'state'): Promise<LocationSummary[]> {
  const all = await getAllWarehouses();
  const counts = new Map<string, number>();
  for (const w of all) {
    const c = canonicalize(type === 'city' ? w.city : w.state, type);
    if (!c) continue;
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([canonical, count]) => ({ canonical, slug: slugify(canonical), count }))
    .filter((s) => s.slug.length > 0)
    .sort((a, b) => a.canonical.localeCompare(b.canonical));
}

export const getCityList = () => summariesFor('city');
export const getStateList = () => summariesFor('state');

// ----- loaders + static paths -----------------------------------------------

async function loaderFor(
  type: 'city' | 'state',
  slug: string,
  typeSlug?: string,
): Promise<LocationListingsLoaderData | null> {
  const summaries = await summariesFor(type);
  const match = summaries.find((s) => s.slug === slug);
  if (!match) return null;
  const all = await getAllWarehouses();
  const matchers = matchersFor(match.canonical, type);
  let scoped = all.filter((w) => {
    const raw = (type === 'city' ? w.city : w.state) ?? '';
    return matchers.has(raw.trim().toLowerCase());
  });

  // Count PEB/RCC inside this scope before any type filter (used by link block on base pages).
  const typeCounts = countTypes(scoped);

  let warehouseType: WarehouseType | undefined;
  if (typeSlug) {
    warehouseType = typeSlugToCanonical(typeSlug) ?? undefined;
    if (!warehouseType) return null;
    scoped = scoped.filter((w) => canonicalType(w.warehouseType) === warehouseType);
    if (scoped.length === 0) return null;
  }

  return {
    type,
    canonical: match.canonical,
    slug: match.slug,
    warehouseType,
    typeCounts,
    warehouses: scoped.map(transformWarehouseData),
  };
}

export async function cityListingsLoader({ params }: LoaderFunctionArgs) {
  return loaderFor('city', params.city ?? '');
}

export async function stateListingsLoader({ params }: LoaderFunctionArgs) {
  return loaderFor('state', params.state ?? '');
}

// /listings/city/:city/:sub is a shared slot: "peb"/"rcc" are construction-type
// pages, anything else is tried as a micromarket nested under that city.
// Construction types win the slot, so a locality named "PEB" could never
// shadow them.
export async function cityTypeListingsLoader({ params }: LoaderFunctionArgs) {
  const citySlug = params.city ?? '';
  const sub = params.type ?? '';
  if (typeSlugToCanonical(sub)) return loaderFor('city', citySlug, sub);
  return micromarketLoader(citySlug, sub);
}

export async function stateTypeListingsLoader({ params }: LoaderFunctionArgs) {
  return loaderFor('state', params.state ?? '', params.type ?? '');
}

export async function cityStaticPaths(): Promise<string[]> {
  const cities = await summariesFor('city');
  return cities.map((c) => `/listings/city/${c.slug}`);
}

export async function stateStaticPaths(): Promise<string[]> {
  const states = await summariesFor('state');
  return states.map((s) => `/listings/state/${s.slug}`);
}

// Generates only the city×type combos that actually have listings — skips empty pages.
async function locationTypeStaticPaths(type: 'city' | 'state'): Promise<string[]> {
  const all = await getAllWarehouses();
  const summaries = await summariesFor(type);
  const paths: string[] = [];
  for (const loc of summaries) {
    const matchers = matchersFor(loc.canonical, type);
    const inScope = all.filter((w) => {
      const raw = (type === 'city' ? w.city : w.state) ?? '';
      return matchers.has(raw.trim().toLowerCase());
    });
    for (const t of ['PEB', 'RCC'] as const) {
      const count = inScope.filter((w) => canonicalType(w.warehouseType) === t).length;
      if (count > 0) paths.push(`/listings/${type}/${loc.slug}/${t.toLowerCase()}`);
    }
  }
  return paths;
}

// The city :sub slot serves both, so its static paths are the union.
export const cityTypeStaticPaths = async (): Promise<string[]> => {
  const [types, micromarkets] = await Promise.all([
    locationTypeStaticPaths('city'),
    micromarketStaticPaths(),
  ]);
  return [...types, ...micromarkets];
};
export const stateTypeStaticPaths = () => locationTypeStaticPaths('state');

// ----- micromarkets ---------------------------------------------------------
// Warehouse.micromarket is a String[] of locality tags ("Nelamangala",
// "Hosur Road"). One listing can carry several, and one micromarket can span
// cities (Bidadi shows up under both Bengaluru and Ramnagara), so these pages
// are built by tag rather than nested under a city.
//
// Anything here must stay in sync with scripts/lib/locations.mjs, which builds
// the same pages' sitemap entries and the generated footer link data.

/**
 * A micromarket needs this many listings before it gets its own page. Below the
 * threshold the page is thinner than the city page it would compete with in
 * search, so we don't generate one at all.
 */
export const MICROMARKET_MIN_LISTINGS = 5;

/**
 * A micromarket's parent city has to carry its own weight: it supplies the
 * {city} URL segment and is the breadcrumb/link target, so nesting under a
 * near-empty city page helps nobody.
 */
export const PARENT_CITY_MIN_LISTINGS = 6;

// The city column carries locality fragments as well as cities ("Sector 78,
// Badshahpur"). Same test the state pages use to skip them.
const isRealCityName = (name: string): boolean => name.length > 2 && !name.includes(',');

// Some rows carry an unresolved micro_market row id (a 32-char base62 token)
// where a name should be, because the tagging tool wrote the FK through. Those
// aren't places and must never become pages.
const MICROMARKET_ID_RE = /^[A-Za-z0-9]{32}$/;

const isNamedMicromarket = (raw: string | null | undefined): boolean => {
  const v = raw?.trim() ?? '';
  return v.length > 2 && !MICROMARKET_ID_RE.test(v);
};

// Keeps '/' readable as a separator: "Alipur/Budhpur" -> "alipur-budhpur".
export const slugifyMicromarket = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[\s/]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

// Deduped so a listing tagged with the same locality twice counts once.
const micromarketsOf = (w: Warehouse): string[] => [
  ...new Set(
    (Array.isArray(w.micromarket) ? w.micromarket : [])
      .map((m) => String(m).trim())
      .filter(isNamedMicromarket),
  ),
];

export interface MicromarketSummary extends LocationSummary {
  /** Most common city among this micromarket's listings — the city it nests under. */
  parentCity: string;
  /** Slug of parentCity, i.e. the {city} in /listings/city/{city}/{slug}. */
  citySlug: string;
}

async function micromarketSummaries(): Promise<MicromarketSummary[]> {
  const all = await getAllWarehouses();
  // Cities allowed to host a micromarket page, mapped to their page slug.
  const hostCities = new Map(
    (await summariesFor('city'))
      .filter((c) => isRealCityName(c.canonical) && c.count >= PARENT_CITY_MIN_LISTINGS)
      .map((c) => [c.canonical, c.slug] as const),
  );
  const acc = new Map<string, { canonical: string; count: number; cities: Map<string, number> }>();
  for (const w of all) {
    const city = canonicalize(w.city, 'city');
    for (const name of micromarketsOf(w)) {
      const slug = slugifyMicromarket(name);
      if (!slug) continue;
      // First spelling seen wins as the display name — the DB values are already
      // properly cased, so they're used verbatim rather than title-cased (which
      // would mangle "Alipur/Budhpur" and "Harohalli/Kanakapura Road").
      const entry = acc.get(slug) ?? { canonical: name, count: 0, cities: new Map() };
      entry.count += 1;
      if (city) entry.cities.set(city, (entry.cities.get(city) ?? 0) + 1);
      acc.set(slug, entry);
    }
  }
  return Array.from(acc.entries())
    .map(([slug, e]) => {
      // Most listings wins, but only among cities that can host a page — a
      // micromarket whose top city is a junk value still nests under its
      // next-best real one instead of losing its page.
      const parent = Array.from(e.cities.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .find(([city]) => hostCities.has(city));
      return { canonical: e.canonical, slug, count: e.count, parentCity: parent?.[0] ?? null };
    })
    .filter(
      // A parent city is required, not optional: it *is* the {city} segment of
      // the URL, so a micromarket with no eligible city has nowhere to live.
      (e): e is Omit<MicromarketSummary, 'citySlug'> =>
        e.count >= MICROMARKET_MIN_LISTINGS && e.parentCity !== null,
    )
    // Slug comes from the city summary, so it always matches a real city page.
    .map((e) => ({ ...e, citySlug: hostCities.get(e.parentCity) as string }))
    .sort((a, b) => a.canonical.localeCompare(b.canonical));
}

/**
 * Resolves the micromarket half of /listings/city/:city/:sub. Only the parent
 * city's URL resolves — the same tag reached via a different city 404s rather
 * than serving duplicate content on two paths.
 */
async function micromarketLoader(
  citySlug: string,
  micromarketSlug: string,
): Promise<LocationListingsLoaderData | null> {
  const summaries = await micromarketSummaries();
  const match = summaries.find((s) => s.slug === micromarketSlug && s.citySlug === citySlug);
  if (!match) return null;

  // Every listing carrying the tag, including the few sitting in a neighbouring
  // city — the tag is the market, the city segment is just where it hangs.
  const all = await getAllWarehouses();
  const scoped = all.filter((w) =>
    micromarketsOf(w).some((m) => slugifyMicromarket(m) === match.slug),
  );

  return {
    type: 'micromarket',
    canonical: match.canonical,
    slug: match.slug,
    parentCity: { canonical: match.parentCity, slug: match.citySlug },
    typeCounts: countTypes(scoped),
    warehouses: scoped.map(transformWarehouseData),
  };
}

export async function micromarketStaticPaths(): Promise<string[]> {
  const micromarkets = await micromarketSummaries();
  return micromarkets.map((m) => `/listings/city/${m.citySlug}/${m.slug}`);
}
