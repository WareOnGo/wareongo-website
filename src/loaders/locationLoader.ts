import type { LoaderFunctionArgs } from 'react-router-dom';
import { warehouseAPI, transformWarehouseData, type Warehouse } from '@/services/warehouseAPI';
import { getMicromarketContent, type MicromarketContent } from '@/data/micromarkets';
import { applyStatOverrides } from '@/lib/micromarketStats';
import {
  buildableMicromarkets,
  micromarketPath,
  type Micromarket,
  type PeerRent,
} from '@/services/micromarketsAPI';

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

/**
 * Listings per request while walking the whole catalogue.
 *
 * Large on purpose. This function runs in exactly two places, and neither is a
 * visitor's browser: the SSG prerender (where its module-level cache means one
 * walk per build) and the dev server, where vite-react-ssg leaves the real
 * loader in place because there is no prerendered data to read instead. In a
 * production page the loader is swapped for one that reads the static manifest,
 * so nothing here is on the critical path for a real user.
 *
 * At 50 it took 39 sequential round trips to Render — around 40 seconds of
 * blank screen before a listing page rendered anything in dev. The loop is kept
 * rather than replaced by one unbounded request, so this still terminates
 * correctly however far the catalogue grows.
 */
const FETCH_PAGE_SIZE = 500;

export async function getAllWarehouses(): Promise<Warehouse[]> {
  if (warehousesCache) return warehousesCache;
  const all: Warehouse[] = [];
  let page = 1;
  const pageSize = FETCH_PAGE_SIZE;
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
  // ----- micromarket editorial pages ---------------------------------------
  // The three fields below travel together and are present only when an editor
  // has published content for this micromarket in the CMS. Their presence is
  // the switch between the two layouts: with `content`, LocationListings hands
  // off to the editorial template; without it, the plain listing grid renders
  // exactly as it always has.
  //
  // They are attached only in that case rather than always, because every one
  // of them is serialised into the prerendered HTML of every listing page.
  content?: MicromarketContent;
  stats?: Micromarket;
  /** Sibling micromarkets under the same city, for the peer rent chart and chips. */
  peers?: PeerRent[];
}

/**
 * A micromarket page that has editorial content. The loader only ever attaches
 * `content` and `stats` together, so narrowing on the pair is sound — and having
 * the guard here rather than a cast at the call site means the invariant is
 * asserted once, next to the code that establishes it.
 */
export type MicromarketPageData = LocationListingsLoaderData & {
  content: MicromarketContent;
  stats: Micromarket;
};

export const isEditorialMicromarket = (
  data: LocationListingsLoaderData,
): data is MicromarketPageData => data.content !== undefined && data.stats !== undefined;

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
// Everything about which micromarkets exist, which earn a page, and every figure
// on one comes from the backend (GET /micromarkets, see
// src/services/micromarketsAPI.ts). It used to be derived here, again in
// scripts/lib/locations.mjs, and a third time in the CMS — three copies of the
// same parsing rules, with nothing to tell you when they diverged.

/** Kept as an alias so importers of the old name still compile. */
export type MicromarketSummary = LocationSummary & {
  parentCity: string;
  citySlug: string;
};

/**
 * Resolves the micromarket half of /listings/city/:city/:sub. Only the parent
 * city's URL resolves — the same tag reached via a different city 404s rather
 * than serving duplicate content on two paths.
 */
async function micromarketLoader(
  citySlug: string,
  micromarketSlug: string,
): Promise<LocationListingsLoaderData | null> {
  const micromarkets = await buildableMicromarkets();
  const match = micromarkets.find((m) => m.slug === micromarketSlug && m.citySlug === citySlug);
  if (!match) return null;

  // Which listings belong to the belt is the backend's answer too, so a locality
  // spelled two ways cannot lose half its inventory to a slug comparison here.
  const ids = new Set(match.listingIds);
  const all = await getAllWarehouses();
  const scoped = all.filter((w) => ids.has(w.id));

  const base: LocationListingsLoaderData = {
    type: 'micromarket',
    canonical: match.name,
    slug: match.slug,
    parentCity: { canonical: match.parentCity as string, slug: citySlug },
    typeCounts: countTypes(scoped),
    warehouses: scoped.map(transformWarehouseData),
  };

  // The if/else. No published CMS content means this stays the listing grid it
  // has always been — the editorial extras aren't attached, and nothing extra
  // is serialised into the page.
  const content = getMicromarketContent(citySlug, match.slug);
  if (!content) return base;

  // Derived once by the backend, then corrected by whatever the editor set — so
  // clearing an override puts the derived figure straight back. The peers come
  // out of the same call, because a corrected median has to move this belt's own
  // bar too.
  const stats = applyStatOverrides(match, content.statOverrides);

  return { ...base, content, stats, peers: stats.peers };
}

export async function micromarketStaticPaths(): Promise<string[]> {
  const micromarkets = await buildableMicromarkets();
  return micromarkets.map(micromarketPath);
}
