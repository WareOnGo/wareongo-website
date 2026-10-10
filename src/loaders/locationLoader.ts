import type { LoaderFunctionArgs } from 'react-router-dom';
import { warehouseAPI, transformWarehouseData, type Warehouse, type WarehouseInventory } from '@/services/warehouseAPI';
import { getMicromarketContent, type MicromarketContent } from '@/data/micromarkets';
import type { CmsPreviewContent } from '@/lib/cmsPreviewContent';
import { applyStatOverrides } from '@/lib/micromarketStats';
import type { EditorialContent, EditorialImageVariant, PagePhoto } from '@/data/editorial';
import type { DerivedStats, Spread } from '@/services/derivedStats';
import type { CityOverviewStats, CityOverviewContent } from '@/services/cityOverview';
import { createListingBreadcrumbs } from '@/lib/listingBreadcrumbs';
import type { BreadcrumbItem } from '@/components/Breadcrumbs';
import { DEFAULT_PAGE_SIZE, toApiFilters, type WarehouseFilters } from '@/lib/listingSearch';
import { canonicalListingLocation as canonicalize, matchesListingType } from '@/lib/listingLocation.mjs';
import { createLocationListingSeed, locationListingPreset } from '@/lib/locationListingSeed';
import type { ListingsLoaderData } from './warehouseLoader';
import { getLocationPageContent, locationPages, type LocationPageContent } from '@/data/locationPages';
import { getLocations, locationStats, locationOverviewPath, locationPath, type LocationKind, type LocationStats } from '@/services/locationsAPI';
import { orderForDisplay } from '@/lib/warehouseCardData';
import { bestTierOnePhoto, reportsQualityTiers } from '@/lib/warehouseImages';
import { resolveStateCities } from '@/lib/stateCities';
import {
  buildableMicromarkets,
  micromarketPath,
  micromarketOverviewPath,
  type PeerRent,
} from '@/services/micromarketsAPI';

// ----- canonical name + slug helpers ----------------------------------------

export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

// ----- cached warehouse fetch -----------------------------------------------

const warehousesCache = new Map<WarehouseInventory, Promise<Warehouse[]>>();

/**
 * Listings per request while walking the whole catalogue.
 *
 * Large on purpose. This function runs in the CMS preview, the SSG prerender
 * (where its module-level cache means one walk per build) and the dev server,
 * where vite-react-ssg leaves the real
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

export function getAllWarehouses(inventory: WarehouseInventory = 'published'): Promise<Warehouse[]> {
  let cached = warehousesCache.get(inventory);
  if (!cached) {
    // Share in-flight work as well as the result: concurrent route enumeration
    // must not launch duplicate uncached walks of the inventory.
    // Keep previews separate so neither cache can change the other's inventory.
    cached = fetchAllWarehouses(inventory).catch((error) => {
      warehousesCache.delete(inventory);
      throw error;
    });
    warehousesCache.set(inventory, cached);
  }
  return cached;
}

async function fetchAllWarehouses(inventory: WarehouseInventory): Promise<Warehouse[]> {
  const all: Warehouse[] = [];
  let page = 1;
  while (true) {
    const resp = await warehouseAPI.getWarehouses(page, FETCH_PAGE_SIZE, undefined, undefined, inventory);
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

/**
 * One city on its state's overview. One of ours carries the figures its own
 * page shows and a link; a city outside our listings has a name, at most an
 * uploaded photo, and nothing else.
 */
export interface StateCity {
  name: string;
  /** Null for a city outside our listings. */
  slug: string | null;
  /** The published overview, else the city's listing page. Null without listings. */
  path: string | null;
  /** Whether `path` is the city overview rather than its listing page. */
  overview: boolean;
  listings: number | null;
  rent: Spread | null;
  sizeMedian: number | null;
  build: string | null;
  /** The editor's upload, else the city's best T1 listing photo, else its best listing cover. */
  image: PagePhoto | null;
}

export interface StateOverviewData {
  cities: StateCity[];
  /** Names of the state's other cities with listing pages, busiest first. */
  otherCities: string[];
  /** Published neighbouring state overviews; null when the backend predates them. */
  nearbyStates: { name: string; slug: string; path: string }[] | null;
  /** The market figure when no image was uploaded: a listing photo not already on a city card. */
  marketImage: PagePhoto | null;
}

/** Only overview loaders return editorial content. */
export type EditorialPageData = LocationListingsLoaderData & {
  seedSearch?: string;
  imageVariants?: Record<string, EditorialImageVariant[]>;
  coverImages?: Record<string, string>;
  content: EditorialContent & CityOverviewContent;
  cityOverview?: CityOverviewStats;
  stateOverview?: StateOverviewData;
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

export type LocationListingSeed = LocationListingsLoaderData & ListingsLoaderData & {
  filters: WarehouseFilters;
  summary: { minSize: number | null; maxSize: number | null; cities: string[] };
};

/** Only grid routes use this seed. Overview loaders retain their full inventory. */
async function seedLocationListings(data: LocationListingsLoaderData): Promise<LocationListingSeed> {
  const filters = locationListingPreset(data);
  // Use the same matching, ordering and totals as every later browser request.
  const response = await warehouseAPI.getWarehouses(1, DEFAULT_PAGE_SIZE, toApiFilters(filters));
  const warehouses = response.data.map(transformWarehouseData);
  const coverImage = import.meta.env.SSR
    ? await (await import('@/lib/listingCover.server.mjs')).prepareListingCover(warehouses[0]?.images[0])
    : undefined;
  return createLocationListingSeed(data, {
    pagination: response.pagination, fetchedAt: Date.now(),
    warehouses, coverImage,
  });
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

async function summariesFor(type: 'city' | 'state', inventory: WarehouseInventory = 'published'): Promise<LocationSummary[]> {
  const all = await getAllWarehouses(inventory);
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

const breadcrumbCache = new Map<WarehouseInventory, Promise<ReturnType<typeof createListingBreadcrumbs>>>();

export function getListingBreadcrumbs(inventory: WarehouseInventory = 'published') {
  let cached = breadcrumbCache.get(inventory);
  if (!cached) {
    cached = (async () => {
      // Breadcrumb metadata is auxiliary: unavailable geography must not make
      // an otherwise valid warehouse inaccessible. Retain whichever levels we
      // can verify, with /listings always supplied by the page itself.
      const [locations, markets, cities, states] = await Promise.allSettled([
        getLocations(), buildableMicromarkets(), summariesFor('city', inventory), summariesFor('state', inventory),
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
    breadcrumbCache.set(inventory, cached);
  }
  return cached;
}

// ----- loaders + static paths -----------------------------------------------

async function loaderFor(
  type: 'city' | 'state',
  slug: string,
  typeSlug?: string,
): Promise<LocationListingSeed | null> {
  const summaries = await summariesFor(type);
  const match = summaries.find((s) => s.slug === slug);
  if (!match) return null;
  const all = await getAllWarehouses();
  let scoped = all.filter((w) => {
    const raw = (type === 'city' ? w.city : w.state) ?? '';
    return canonicalize(raw, type) === match.canonical;
  });

  let warehouseType: WarehouseType | undefined;
  if (typeSlug) {
    warehouseType = typeSlugToCanonical(typeSlug) ?? undefined;
    if (!warehouseType) return null;
    scoped = scoped.filter((w) => matchesListingType(w.warehouseType, warehouseType));
    if (scoped.length === 0) return null;
  }

  return seedLocationListings({
    type,
    canonical: match.canonical,
    slug: match.slug,
    warehouseType,
    warehouses: scoped.map(transformWarehouseData),
    breadcrumbAncestors: type === 'city' ? (await getListingBreadcrumbs()).city(match.slug) : [],
    ...(!warehouseType ? { overviewPath: await publishedLocationPath(type === 'city' ? 'CITY' : 'STATE', match.slug) ?? undefined } : {}),
  });
}

async function publishedLocationPath(kind: LocationKind, slug: string): Promise<string | null> {
  if (!getLocationPageContent(kind, slug)) return null;
  const match = await locationStats(kind, slug);
  return match ? locationOverviewPath(match) : null;
}

async function ancestor(kind: LocationKind, name: string, slug: string) {
  return { label: name, path: await publishedLocationPath(kind, slug) ?? locationPath({ kind, slug }) };
}

async function locationOverviewFor(kind: LocationKind, stateSlug: string, citySlug?: string, draft?: LocationPageContent): Promise<EditorialPageData | null> {
  const match = await locationStats(kind, kind === 'CITY' ? citySlug ?? '' : stateSlug);
  if (!match || (kind === 'CITY' && match.stateSlug !== stateSlug)) return null;
  const content = draft ?? getLocationPageContent(kind, match.slug);
  const path = locationOverviewPath(match);
  if (!content || !path) return null;
  const ids = new Set(match.listingIds);
  const all = await getAllWarehouses(draft ? 'live' : 'published');
  const warehouses = all.filter(w => ids.has(w.id)).map(transformWarehouseData);
  if (warehouses.length === 0) throw new Error(`Overview inventory missing: ${path}`);
  const parent = kind === 'CITY' && match.stateSlug && match.parentState
    ? await ancestor('STATE', match.parentState, match.stateSlug) : null;
  let cityOverview = kind === 'CITY' ? match.cityOverview : undefined;
  if (cityOverview) {
    const markets = await buildableMicromarkets();
    cityOverview = { ...cityOverview, micromarkets: cityOverview.micromarkets.map(m => {
      const target = markets.find(real => real.citySlug === match.slug && real.slug === m.slug);
      return { ...m, path: target ? (getMicromarketContent(match.slug, m.slug)
        ? micromarketOverviewPath(target) : micromarketPath(target)) : null };
    }) };
  }
  const stats = applyStatOverrides(cityOverview
    ? { ...match, ...cityOverview.summary, peers: cityOverview.comparisonCities } : match, content.statOverrides);
  const stateOverview = kind === 'STATE' ? await stateOverviewFor(match, content, all) : undefined;
  const statePhotos = stateOverview ? [...stateOverview.cities.map(c => c.image), stateOverview.marketImage] : [];
  return {
    type: kind === 'CITY' ? 'city' : 'state', canonical: match.name, slug: match.slug,
    warehouses, content, stats, peers: stats.peers, overviewPath: path, cityOverview, stateOverview,
    ...await overviewImages(content, warehouses, statePhotos.flatMap(photo => photo ? [photo] : [])),
    editorial: {
      scope: kind === 'CITY' ? 'city' : 'state', name: match.name, path,
      listingPath: locationPath(match), place: match.name,
      ancestors: parent ? [parent] : [],
      up: parent ? { label: `All of ${parent.label}`, linkLabel: `Warehouses in ${parent.label} →`, path: parent.path } : null,
    },
  };
}

/**
 * The state page's cities, neighbours and market figure. Each of our cities
 * repeats exactly what its own page shows: its overview summary, with the city
 * overview's overrides on top once one is published. Photos are the editor's
 * uploads or real listing photos from that place, and never one twice a page.
 */
async function stateOverviewFor(state: LocationStats, content: LocationPageContent, all: Warehouse[]): Promise<StateOverviewData> {
  const { cities, states } = await getLocations();
  const { list, others } = resolveStateCities(content.stateCities, cities.filter(c => c.stateSlug === state.slug));
  const used = new Set<string>();
  const rows = list.map(({ name, image, city }): StateCity => {
    if (image) used.add(image.url);
    if (!city) return { name, slug: null, path: null, overview: false, listings: null, rent: null, sizeMedian: null, build: null, image };
    const page = getLocationPageContent('CITY', city.slug);
    const overviewPath = page ? locationOverviewPath(city) : null;
    const stats = applyStatOverrides(city.cityOverview ? { ...city, ...city.cityOverview.summary } : city,
      overviewPath ? page?.statOverrides : undefined);
    return {
      name, slug: city.slug, path: overviewPath ?? locationPath(city), overview: Boolean(overviewPath),
      listings: stats.listings, rent: stats.rent, sizeMedian: stats.size?.median ?? null, build: stats.construction[0]?.label ?? null,
      image: image ?? listingPhoto(listingPool(all, city.listingIds), used, `Warehouse in ${name}`, true),
    };
  });
  // Only when the market section renders without an uploaded figure. Listing
  // covers stand in only for a backend that does not grade photos yet.
  const market = content.marketProse && !content.marketImage ? listingPool(all, state.listingIds) : [];
  const marketImage = market.length
    ? listingPhoto(market, used, `Warehouse in ${state.name}`, !reportsQualityTiers(market.map(l => l.raw))) : null;
  const nearbyStates = state.nearbyStates?.flatMap(({ name, slug }) => {
    const target = states.find(s => s.slug === slug);
    const path = target && getLocationPageContent('STATE', slug) ? locationOverviewPath(target) : null;
    return path ? [{ name, slug, path }] : [];
  }) ?? null;
  return { cities: rows, otherCities: others.map(c => c.name), nearbyStates, marketImage };
}

/** Listings by id: raw for their graded gallery, as cards for the grid's own order and size. */
type PooledListing = { raw: Warehouse; card: ReturnType<typeof transformWarehouseData> };
const listingPool = (all: Warehouse[], ids: number[]): PooledListing[] => {
  const set = new Set(ids);
  return all.filter(w => set.has(w.id)).map(raw => ({ raw, card: transformWarehouseData(raw) }));
};

/**
 * A real photo from these listings that the page does not show yet: the best
 * T1 gallery photo, else (with `covers`) the cover of the first listing in the
 * grid's order whose cover is unused. Marks the pick as used.
 */
function listingPhoto(listings: PooledListing[], used: Set<string>, alt: string, covers: boolean): PagePhoto | null {
  const photo = bestTierOnePhoto(listings.map(({ raw, card }) => ({ id: raw.id, size: card.size, images: raw.images, imageQuality: raw.imageQuality })), used, alt)
    ?? (covers ? coverPhoto(listings.map(l => l.card), used, alt) : null);
  if (photo) used.add(photo.fallback ?? photo.url);
  return photo;
}

function coverPhoto(cards: PooledListing['card'][], used: Set<string>, alt: string): PagePhoto | null {
  for (const card of orderForDisplay(cards)) {
    const original = card.imageFallbacks[0] ?? card.image;
    if (!card.image || !original || used.has(original)) continue;
    return { url: card.image, alt, ...(original !== card.image ? { fallback: original } : {}) };
  }
  return null;
}

export const stateOverviewLoader = ({ params }: LoaderFunctionArgs) => locationOverviewFor('STATE', params.state ?? '');
export const cityOverviewLoader = ({ params }: LoaderFunctionArgs) => locationOverviewFor('CITY', params.state ?? '', params.city ?? '');

async function overviewImages(content: EditorialContent, warehouses: EditorialPageData['warehouses'], extra: { url: string }[] = []) {
  return import.meta.env.SSR
    ? (await import('@/lib/overviewImages.server.mjs')).prepareOverviewImages(content, warehouses, extra)
    : {};
}

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
  const data = await micromarketLoader(citySlug, sub);
  return data ? seedLocationListings(data) : null;
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
    const inScope = all.filter((w) => {
      const raw = (type === 'city' ? w.city : w.state) ?? '';
      return canonicalize(raw, type) === loc.canonical;
    });
    for (const t of ['PEB', 'RCC'] as const) {
      const count = inScope.filter((w) => matchesListingType(w.warehouseType, t)).length;
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
  inventory: WarehouseInventory = 'published',
): Promise<LocationListingsLoaderData | null> {
  const micromarkets = await buildableMicromarkets();
  const match = micromarkets.find((m) => m.slug === micromarketSlug && m.citySlug === citySlug);
  if (!match) return null;

  // Which listings belong to the belt is the backend's answer too, so a locality
  // spelled two ways cannot lose half its inventory to a slug comparison here.
  const ids = new Set(match.listingIds);
  const all = await getAllWarehouses(inventory);
  const scoped = all.filter((w) => ids.has(w.id));

  const base: LocationListingsLoaderData = {
    type: 'micromarket',
    canonical: match.name,
    slug: match.slug,
    parentCity: { canonical: match.parentCity as string, slug: citySlug },
    typeCounts: countTypes(scoped),
    warehouses: scoped.map(transformWarehouseData),
    breadcrumbAncestors: (await getListingBreadcrumbs(inventory)).micromarket(citySlug, match.slug, match.name),
  };

  const content = getMicromarketContent(citySlug, match.slug);
  const overviewPath = content ? micromarketOverviewPath(match) : null;
  return overviewPath ? { ...base, overviewPath } : base;
}

/** A wrong state/city or an unpublished overview must not resolve as a grid. */
export async function micromarketOverviewLoader({ params }: LoaderFunctionArgs, draft?: MicromarketContent): Promise<MicromarketPageData | null> {
  const match = (await buildableMicromarkets()).find((m) =>
    m.stateSlug === params.state && m.citySlug === params.city && m.slug === params.micromarket,
  );
  if (!match?.parentState || !match.stateSlug || !match.citySlug) return null;
  const content = draft ?? getMicromarketContent(match.citySlug, match.slug);
  const overviewPath = micromarketOverviewPath(match);
  if (!content || !overviewPath) return null;
  const base = await micromarketLoader(match.citySlug, match.slug, draft ? 'live' : 'published');
  if (!base) return null;

  // Derived once by the backend, then corrected by whatever the editor set — so
  // clearing an override puts the derived figure straight back. The peers come
  // out of the same call, because a corrected median has to move this belt's own
  // bar too.
  const stats = applyStatOverrides(match, content.statOverrides);

  const state = await ancestor('STATE', match.parentState, match.stateSlug);
  const city = await ancestor('CITY', match.parentCity!, match.citySlug);
  return { ...base, content, stats, peers: stats.peers, overviewPath,
    ...await overviewImages(content, base.warehouses),
    parentState: { canonical: match.parentState, slug: match.stateSlug },
    editorial: { scope: 'micromarket', name: match.name, path: overviewPath,
      listingPath: micromarketPath(match),
      place: match.name === match.parentCity ? match.name : `${match.name}, ${match.parentCity}`,
      ancestors: [state, ...(match.name === match.parentCity ? [] : [city])],
      up: { label: `All of ${city.label}`, linkLabel: `Warehouses in ${city.label} →`, path: city.path },
    } };
}

/** Resolve unsaved copy through the public page's inventory and layout rules. */
export async function previewEditorialPage(value: CmsPreviewContent): Promise<EditorialPageData> {
  let data: EditorialPageData | null = null;
  if (value.type === 'city' || value.type === 'state') {
    const content = value.content;
    const match = await locationStats(content.kind, content.slug);
    if (match) data = await locationOverviewFor(content.kind, content.kind === 'STATE' ? match.slug : match.stateSlug ?? '', match.slug, content);
  } else if (value.type === 'micromarket') {
    const content = value.content;
    const match = (await buildableMicromarkets()).find(m => m.citySlug === content.citySlug && m.slug === content.slug);
    if (match) data = await micromarketOverviewLoader({
      params: { state: match.stateSlug ?? '', city: content.citySlug, micromarket: content.slug },
      request: new Request('https://wareongo.com/preview/cms'), context: {},
    }, content);
  }
  if (!data) throw new Error('Choose a location with eligible inventory to preview.');
  return data;
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
