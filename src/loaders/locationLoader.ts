import type { LoaderFunctionArgs } from 'react-router-dom';
import { warehouseAPI, transformWarehouseData, type Warehouse } from '@/services/warehouseAPI';
import { getMicromarketContent } from '@/data/micromarkets';
import { applyStatOverrides } from '@/lib/micromarketStats';
import type { EditorialContent } from '@/data/editorial';
import type { DerivedStats } from '@/services/derivedStats';
import { createListingBreadcrumbs } from '@/lib/listingBreadcrumbs';
import type { BreadcrumbItem } from '@/components/Breadcrumbs';
import { getLocationPageContent, locationPages } from '@/data/locationPages';
import { getLocations, locationStats, locationOverviewPath, locationPath, type LocationKind } from '@/services/locationsAPI';
import {
  buildableMicromarkets,
  micromarketPath,
  micromarketOverviewPath,
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

let warehousesCache: Promise<Warehouse[]> | null = null;

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

export function getAllWarehouses(): Promise<Warehouse[]> {
  if (!warehousesCache) {
    // Share in-flight work as well as the result: concurrent route enumeration
    // must not launch duplicate uncached walks of the inventory.
    warehousesCache = fetchAllWarehouses().catch((error) => {
      warehousesCache = null;
      throw error;
    });
  }
  return warehousesCache;
}

async function fetchAllWarehouses(): Promise<Warehouse[]> {
  const all: Warehouse[] = [];
  let page = 1;
  while (true) {
    const resp = await warehouseAPI.getWarehouses(page, FETCH_PAGE_SIZE);
    all.push(...resp.data);
    if (page >= resp.pagination.totalPages || resp.data.length === 0) break;
    page += 1;
  }
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
  // Retained for older overview bundles reading this deploy's loader data.
  parentState?: { canonical: string; slug: string };
  /** Verified listing-grid ancestors; absent in loader data from older builds. */
  breadcrumbAncestors?: BreadcrumbItem[];
  /** Link to published editorial content; listing routes never carry that copy. */
  overviewPath?: string;
}

/** Only overview loaders return editorial content. */
export type EditorialPageData = LocationListingsLoaderData & {
  content: EditorialContent;
  stats: DerivedStats;
  peers: PeerRent[];
  overviewPath: string;
  editorial: {
    scope: LocationScope;
    name: string;
    path: string;
    listingPath: string;
    place: string;
    ancestors: { label: string; path: string }[];
    up: { label: string; linkLabel: string; path: string } | null;
  };
};
export type MicromarketPageData = EditorialPageData;

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

let breadcrumbCache: Promise<ReturnType<typeof createListingBreadcrumbs>> | null = null;

export function getListingBreadcrumbs() {
  if (!breadcrumbCache) {
    breadcrumbCache = (async () => {
      // Breadcrumb metadata is auxiliary: unavailable geography must not make
      // an otherwise valid warehouse inaccessible. Retain whichever levels we
      // can verify, with /listings always supplied by the page itself.
      const [locations, markets, cities, states] = await Promise.allSettled([
        getLocations(), buildableMicromarkets(), getCityList(), getStateList(),
      ]);
      for (const result of [locations, markets, cities, states]) {
        if (result.status === 'rejected') console.warn('[breadcrumbs] parent lookup unavailable:', result.reason);
      }
      return createListingBreadcrumbs(
        locations.status === 'fulfilled' ? locations.value : { cities: [], states: [] },
        markets.status === 'fulfilled' ? markets.value : [],
        {
          cities: cities.status === 'fulfilled' ? cities.value : [],
          states: states.status === 'fulfilled' ? states.value : [],
        },
      );
    })();
  }
  return breadcrumbCache;
}

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
    breadcrumbAncestors: type === 'city' ? (await getListingBreadcrumbs()).city(match.slug) : [],
    ...(!warehouseType ? { overviewPath: await publishedLocationPath(type === 'city' ? 'CITY' : 'STATE', match.slug) ?? undefined } : {}),
  };
}

async function publishedLocationPath(kind: LocationKind, slug: string): Promise<string | null> {
  if (!getLocationPageContent(kind, slug)) return null;
  const match = await locationStats(kind, slug);
  return match ? locationOverviewPath(match) : null;
}

async function ancestor(kind: LocationKind, name: string, slug: string) {
  return { label: name, path: await publishedLocationPath(kind, slug) ?? locationPath({ kind, slug }) };
}

async function locationOverviewFor(kind: LocationKind, stateSlug: string, citySlug?: string): Promise<EditorialPageData | null> {
  const match = await locationStats(kind, kind === 'CITY' ? citySlug ?? '' : stateSlug);
  if (!match || (kind === 'CITY' && match.stateSlug !== stateSlug)) return null;
  const content = getLocationPageContent(kind, match.slug);
  const path = locationOverviewPath(match);
  if (!content || !path) return null;
  const ids = new Set(match.listingIds);
  const warehouses = (await getAllWarehouses()).filter(w => ids.has(w.id)).map(transformWarehouseData);
  if (warehouses.length === 0) throw new Error(`Overview inventory missing: ${path}`);
  const parent = kind === 'CITY' && match.stateSlug && match.parentState
    ? await ancestor('STATE', match.parentState, match.stateSlug) : null;
  const stats = applyStatOverrides(match, content.statOverrides);
  return {
    type: kind === 'CITY' ? 'city' : 'state', canonical: match.name, slug: match.slug,
    warehouses, content, stats, peers: stats.peers, overviewPath: path,
    editorial: {
      scope: kind === 'CITY' ? 'city' : 'state', name: match.name, path,
      listingPath: locationPath(match), place: match.name,
      ancestors: parent ? [parent] : [],
      up: parent ? { label: `All of ${parent.label}`, linkLabel: `Warehouses in ${parent.label} →`, path: parent.path } : null,
    },
  };
}

export const stateOverviewLoader = ({ params }: LoaderFunctionArgs) => locationOverviewFor('STATE', params.state ?? '');
export const cityOverviewLoader = ({ params }: LoaderFunctionArgs) => locationOverviewFor('CITY', params.state ?? '', params.city ?? '');

async function locationOverviewStaticPaths(kind: LocationKind): Promise<string[]> {
  const content = locationPages.filter(p => p.kind === kind);
  if (!content.length) return [];
  const { cities, states } = await getLocations();
  const locations = kind === 'CITY' ? cities : states;
  const paths: string[] = [];
  for (const page of content) {
    const match = locations.find(l => l.slug === page.slug);
    if (!match?.hasPage) continue;
    const path = locationOverviewPath(match);
    if (!path) throw new Error(`Missing overview geography for ${kind}/${page.slug}.`);
    paths.push(path);
  }
  return paths;
}

export const stateOverviewStaticPaths = () => locationOverviewStaticPaths('STATE');
export const cityOverviewStaticPaths = () => locationOverviewStaticPaths('CITY');

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
    breadcrumbAncestors: (await getListingBreadcrumbs()).micromarket(citySlug, match.slug, match.name),
  };

  const content = getMicromarketContent(citySlug, match.slug);
  const overviewPath = content ? micromarketOverviewPath(match) : null;
  return overviewPath ? { ...base, overviewPath } : base;
}

/** A wrong state/city or an unpublished overview must not resolve as a grid. */
export async function micromarketOverviewLoader({ params }: LoaderFunctionArgs): Promise<MicromarketPageData | null> {
  const match = (await buildableMicromarkets()).find((m) =>
    m.stateSlug === params.state && m.citySlug === params.city && m.slug === params.micromarket,
  );
  if (!match?.parentState || !match.stateSlug || !match.citySlug) return null;
  const content = getMicromarketContent(match.citySlug, match.slug);
  const overviewPath = micromarketOverviewPath(match);
  if (!content || !overviewPath) return null;
  const base = await micromarketLoader(match.citySlug, match.slug);
  if (!base) return null;

  // Derived once by the backend, then corrected by whatever the editor set — so
  // clearing an override puts the derived figure straight back. The peers come
  // out of the same call, because a corrected median has to move this belt's own
  // bar too.
  const stats = applyStatOverrides(match, content.statOverrides);

  const state = await ancestor('STATE', match.parentState, match.stateSlug);
  const city = await ancestor('CITY', match.parentCity!, match.citySlug);
  return { ...base, content, stats, peers: stats.peers, overviewPath,
    parentState: { canonical: match.parentState, slug: match.stateSlug },
    editorial: { scope: 'micromarket', name: match.name, path: overviewPath,
      listingPath: micromarketPath(match),
      place: match.name === match.parentCity ? match.name : `${match.name}, ${match.parentCity}`,
      ancestors: [state, ...(match.name === match.parentCity ? [] : [city])],
      up: { label: `All of ${city.label}`, linkLabel: `Warehouses in ${city.label} →`, path: city.path },
    } };
}

export async function micromarketOverviewStaticPaths(): Promise<string[]> {
  const markets = await buildableMicromarkets();
  return markets.filter((m) => m.citySlug && getMicromarketContent(m.citySlug, m.slug)).map((m) => {
    const path = micromarketOverviewPath(m);
    if (!path || !m.parentState) {
      throw new Error(`Missing overview geography for ${m.citySlug}/${m.slug}. Deploy the backend with state data before building.`);
    }
    return path;
  });
}

export async function micromarketStaticPaths(): Promise<string[]> {
  const micromarkets = await buildableMicromarkets();
  return micromarkets.map(micromarketPath);
}
